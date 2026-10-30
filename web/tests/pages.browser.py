"""Build with --mode pages --base=/DataMosaic/, then run:
python3 -P tests/pages.browser.py /absolute/path/to/dist
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import tempfile
from threading import Thread

from playwright.sync_api import expect, sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browsers cancel video preloads when navigating away.


output = Path(sys.argv[1]).resolve()
assert (output / 'index.html').is_file(), 'Pass the prepared Pages build directory'
assert (output / '.nojekyll').is_file(), 'Branch publishing must bypass Jekyll'
with tempfile.TemporaryDirectory(prefix='datamosaic-pages-test-') as folder:
    (Path(folder) / 'DataMosaic').symlink_to(output, target_is_directory=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=folder))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/DataMosaic/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1440, 'height': 1100})
            errors, failures, api_requests = [], [], []
            def record_failure(request):
                if request.resource_type in ('media', 'image') and request.failure == 'net::ERR_ABORTED':
                    return  # Rapid navigation cancels in-flight media; image loading is checked on each page.
                failures.append(request.url)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: failures.append(response.url) if response.status >= 400 else None)
            page.on('requestfailed', record_failure)
            page.on('request', lambda request: api_requests.append(request.url) if '/api/' in request.url else None)
            for width in (1440, 1200, 1101, 1024, 390, 320):
                page.set_viewport_size({'width': width, 'height': 1100})
                assert page.goto(base).status == 200
                expect(page.locator('#hero-title')).to_have_text('Efficient, Reliable, and Explainable AI for Documents, Databases, and Enterprise Workflows.')
                assert page.locator('.overview-app-story').count() == 3
                assert page.locator('.overview-plugin').count() == 3
                assert page.locator('a[href^="/"]').evaluate_all('(links) => links.every(a => a.getAttribute("href").startsWith("/DataMosaic/"))')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), width
                mobile_navigation = page.get_by_role('button', name='Open navigation', exact=True)
                is_mobile = mobile_navigation.is_visible()
                if not is_mobile:
                    navigation = page.locator('.header-navigation').bounding_box()
                    actions = page.locator('.header-actions').bounding_box()
                    assert navigation['x'] + navigation['width'] <= actions['x'], width
                expect(page.locator('.hero-actions').get_by_role('link', name="Let's try it", exact=False)).to_have_attribute('href', '#applications')
                expect(page.locator('#nav-organization')).to_have_count(0)
                expect(page.locator('#nav-documentation')).to_have_attribute('href', 'https://github.com/HKUSTDial/DataMosaic')
                expect(page.locator('#nav-documentation')).to_have_attribute('target', '_blank')
                expect(page.locator('#nav-members')).to_have_attribute('href', '/DataMosaic/members/')
                for group, labels in (('resource', ['Tools', 'Benchmarks', 'Publications']),):
                    if is_mobile:
                        mobile_navigation.click()
                    trigger = page.locator(f'#nav-{group}')
                    trigger.click()
                    panel = page.locator(f'#nav-{group}-panel')
                    assert panel.locator('strong').all_text_contents() == labels
                    page.keyboard.press('Escape')
                    expect(panel).to_be_hidden()
                    expect(trigger).to_be_focused()
                    if is_mobile:
                        page.get_by_role('button', name='Close navigation', exact=True).click()
                for group, label, route in ((None, 'Members', 'members'), ('resource', 'Tools', 'tools'), ('resource', 'Benchmarks', 'benchmarks')):
                    if is_mobile:
                        mobile_navigation.click()
                    if group:
                        page.locator(f'#nav-{group}').click()
                        page.locator(f'#nav-{group}-panel').get_by_role('link', name=label, exact=False).click()
                    else:
                        page.locator('#nav-members').click()
                    expect(page).to_have_url(base + route + '/')
                    expect(page.get_by_role('heading', name='Leaders' if route == 'members' else label, exact=True)).to_be_visible()
                    assert page.reload().status == 200
                    expect(page).to_have_title(f'{label} | DataMosaic')
                    assert page.goto(base + route + '/?tab=1').status == 200
                    expect(page.get_by_role('heading', name='Leaders' if route == 'members' else label, exact=True)).to_be_visible()
                    if route == 'members':
                        expect(page.get_by_role('heading', name='Members', exact=True)).to_have_count(0)
                        expect(page.locator('.research-intro')).to_have_count(0)
                        expect(page.get_by_role('heading', name='Leaders', exact=True)).to_be_visible()
                        assert page.locator('.member-card').count() == 9
                        for name, homepage, scholar_id, linkedin in (
                            ('Nan Tang', 'https://nantang.github.io/', 'poXWlycAAAAJ', 'https://www.linkedin.com/in/nan-tang-0695135'),
                            ('Haixun Wang', 'https://haixun.github.io/', 'Q1mcglAAAAAJ', 'https://www.linkedin.com/in/haixun/'),
                        ):
                            card = page.get_by_role('article', name=name, exact=True)
                            expect(card.get_by_role('link', name=name, exact=True)).to_have_attribute('href', homepage)
                            assert f'user={scholar_id}' in card.get_by_role('link', name=f'{name} on Google Scholar').get_attribute('href')
                            expect(card.get_by_role('link', name=f'{name} on LinkedIn')).to_have_attribute('href', linkedin)
                            assert card.locator('a').evaluate_all('(links) => links.every(a => a.target === "_blank" && a.rel.includes("noreferrer"))')
                            assert card.locator('p').inner_text().strip()
                            if name == 'Nan Tang':
                                assert '\n@' not in card.locator('p').text_content()
                            else:
                                assert card.locator('p').text_content().splitlines() == ['VP Engineering, Head of AI', '@ EvenUp', 'Affiliate Full Professor', '@ University of Washington', 'ACM Fellow, IEEE Fellow']
                        students = page.get_by_role('region', name='Students', exact=True)
                        assert students.locator('h3').all_text_contents() == ['Zhuowen Liang', 'Zhengxuan Zhang', 'Zechao Chen', 'Chenyu Yang', 'Yuxiang Luo', 'Ruilang Wang', 'Yingxia Ye']
                        assert students.locator('.member-info p').all_text_contents() == ['Ph.D. Student @HKUST(GZ)'] * 5 + ['MPhil Student @HKUST(GZ)'] * 2
                        assert students.locator('img.member-photo').count() == 7
                        expect(students.get_by_role('link', name='Zhuowen Liang', exact=True)).to_have_attribute('href', 'https://setonliang.github.io/')
                        assert 'user=cjXF-ZIAAAAJ' in students.get_by_role('link', name='Zhuowen Liang on Google Scholar').get_attribute('href')
                        for name, url in (
                            ('Zhengxuan Zhang', 'https://scholar.google.com/citations?user=ABHvH94AAAAJ'),
                            ('Chenyu Yang', 'https://scholar.google.com/citations?hl=zh-CN&user=4NOsk-gAAAAJ'),
                            ('Yuxiang Luo', 'https://scholar.google.com/citations?hl=zh-CN&user=SwBmffAAAAAJ'),
                        ):
                            expect(students.get_by_role('link', name=name, exact=True)).to_have_attribute('href', url)
                            expect(students.get_by_role('link', name=f'{name} on Google Scholar')).to_have_attribute('href', url)
                            expect(students.get_by_role('img', name=name, exact=True)).to_have_count(1)
                        expect(students.get_by_role('link', name='Zechao Chen', exact=True)).to_have_attribute('href', 'https://blog.ackth.cc/about')
                        expect(students.get_by_role('img', name='Zechao Chen', exact=True)).to_have_count(1)
                        for portrait in students.locator('img').all():
                            portrait.scroll_into_view_if_needed()
                        page.wait_for_function('Array.from(document.querySelectorAll("img.member-photo")).every(image => image.complete && image.naturalWidth > 0)')
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                    if route == 'tools':
                        assert page.locator('.tools-category h2').all_text_contents() == ['Agentic Document AI', 'Extraction']
                        assert page.locator('.tool-card').count() == 3
                        for name, url, category in (
                            ('LandingAI', 'https://landing.ai', 'Agentic Document AI'),
                            ('LlamaExtract', 'https://www.llamaindex.ai', 'Extraction'),
                            ('Reducto', 'https://reducto.ai', 'Extraction'),
                        ):
                            card = page.get_by_role('region', name=category, exact=True).get_by_role('article', name=name, exact=True)
                            link = card.get_by_role('link', name=f'Visit {name} website')
                            expect(link).to_have_attribute('href', url)
                            expect(link).to_have_attribute('target', '_blank')
                            expect(link).to_have_attribute('rel', 'noreferrer')
                            card.scroll_into_view_if_needed()
                            expect(card.locator('h3')).to_have_text(name)
                            assert card.locator('p').inner_text().strip()
                            assert card.locator('.tool-tags li').count() > 0
                        page.wait_for_function('Array.from(document.querySelectorAll(".tool-image img")).every(image => image.complete && image.naturalWidth > 0)')
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                        page.get_by_role('button', name='Switch to dark mode').click()
                        expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
                        expect(page.get_by_role('heading', name='Extraction', exact=True)).to_be_visible()
                        page.get_by_role('button', name='Switch to light mode').click()
                    if route == 'benchmarks':
                        for category, names in (
                            ('Information Extraction', ['Doc2DB-Bench', 'DTBench']),
                            ('DocVQA', ['MADQA', 'OfficeQA Pro', 'FinRAGBench-V', 'LongDocURL', 'MMLongBench-Doc']),
                        ):
                            section = page.get_by_role('region', name=category, exact=True)
                            assert section.locator('h3').all_text_contents() == names
                            for name in names:
                                article = section.get_by_role('article', name=name, exact=True)
                                assert article.locator('.publication-authors').inner_text().strip()
                                for link_name in (f'Read {name} paper (PDF)', f'Code for {name}', f'Dataset for {name}'):
                                    link = article.get_by_role('link', name=link_name, exact=True)
                                    assert link.get_attribute('href').startswith('https://')
                                    expect(link).to_have_attribute('target', '_blank')
                                    expect(link).to_have_attribute('rel', 'noreferrer')
                        expect(page.locator('.benchmark-list img')).to_have_count(7)
                        page.wait_for_function('Array.from(document.querySelectorAll(".benchmark-list img")).every(image => image.complete && image.naturalWidth > 0)')
                        assert page.locator('.benchmark-list img').evaluate_all('(images) => images.every(image => image.getAttribute("src").startsWith("/DataMosaic/assets/"))')
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                        page.get_by_role('button', name='Switch to dark mode').click()
                        expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
                        page.get_by_role('button', name='Switch to light mode').click()
                    page.get_by_role('link', name='Back to DataMosaic', exact=False).click()
                    expect(page).to_have_url(base)
                for name in ('DocMosaic', 'OntoMosaic-DB'):
                    page.get_by_role('link', name=f'Open {name}', exact=True).first.click()
                    expect(page.get_by_role('dialog')).to_be_visible()
                    expect(page.locator('#demo-title')).to_have_text('DocMosaic · Agentic demo' if name == 'DocMosaic' else f'{name} demo')
                    if name == 'DocMosaic':
                        expect(page.locator('.demo-choices')).to_have_count(0)
                        page.wait_for_function('document.querySelector("video.demo-video")?.readyState >= 1')
                        assert 'DocMosaic-agentic-product-v2' in page.locator('video.demo-video').get_attribute('src')
                    else:
                        page.wait_for_function('document.querySelector("video.demo-video")?.readyState >= 1')
                        assert 'OntoMosaic-DB-demo' in page.locator('video.demo-video').get_attribute('src')
                        assert abs(page.locator('video.demo-video').evaluate('(video) => video.duration') - 30) < 0.1
                    assert page.locator('.demo-video').get_attribute('src').startswith('/DataMosaic/assets/')
                    assert page.reload().status == 200
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.get_by_role('button', name='Close demo', exact=True).click()
                    expect(page).to_have_url(base)
                page.get_by_role('link', name='Open DBMosaic', exact=True).first.click()
                expect(page).to_have_url(base + 'dbmosaic/')
                expect(page.locator('h1')).to_have_text('From documents to databases')
                expect(page.locator('video source').first).to_have_attribute('src', 'DBMosaic_product.mp4')
                page.wait_for_function('document.querySelector("video")?.readyState >= 1')
                assert page.goto(base).status == 200
                page.get_by_role('link', name='Open StructMosaic', exact=True).first.click()
                expect(page).to_have_url(base + 'structmosaic/')
                expect(page.locator('h1')).to_be_visible()
                expect(page.locator('#demo video source').first).to_have_attribute('src', 'demo.mp4')
                page.wait_for_function('document.querySelector("#demo video")?.readyState >= 1')
                assert page.goto(base).status == 200
                page.get_by_role('button', name='Watch StructMosaic demo', exact=True).click()
                expect(page.locator('#demo-title')).to_have_text('StructMosaic demo')
                page.wait_for_function('document.querySelector("img.demo-video")?.naturalWidth > 0')
                page.get_by_role('button', name='Close demo', exact=True).click()
                for route in ('ontomosaic-doc', 'ontomosaic-enterprise'):
                    assert page.goto(base + route + '?tab=1').status == 200
                    assert page.reload().status == 200
                    assert page.locator('main').inner_html().strip() == ''
                    page.get_by_role('link', name='DataMosaic home').click()
                    expect(page).to_have_url(base)
                for kind, video_name in [('agentic', 'DocMosaic-agentic-product-v2'), ('interactive', 'DocMosaic-interaction-flight-product')]:
                    page.get_by_role('button', name=f'Watch DocMosaic {kind} demo', exact=True).click()
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.wait_for_function('document.querySelector("video.demo-video")?.readyState >= 1')
                    assert video_name in page.locator('video.demo-video').get_attribute('src')
                    duration = page.locator('video.demo-video').evaluate('(video) => video.duration')
                    assert abs(duration - (37.2 if kind == 'agentic' else 44)) < .2
                    if width == 1440:
                        page.locator('video.demo-video').evaluate('async (video) => { video.muted = true; await video.play(); video.currentTime = 2; }')
                        page.wait_for_function('document.querySelector("video.demo-video").currentTime > 2.1')
                    page.get_by_role('button', name='Close demo', exact=True).click()
                    expect(page).to_have_url(base)
                page.get_by_role('button', name='Switch to dark mode').click()
                expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
                page.get_by_role('button', name='Switch to light mode').click()
                if page.get_by_role('button', name='Open navigation', exact=True).is_visible():
                    page.get_by_role('button', name='Open navigation', exact=True).click()
                page.locator('#nav-resource').click()
                page.get_by_role('link', name='Publications', exact=False).click()
                expect(page.locator('main')).to_have_class('content research-content')
                assert page.reload().status == 200
                page.get_by_role('link', name='Back to DataMosaic', exact=False).click()
                expect(page).to_have_url(base)
            touch = browser.new_context(**p.devices['iPhone 13'])
            mobile = touch.new_page()
            mobile.on('pageerror', lambda error: errors.append(str(error)))
            for group, label, route in (
                ('application', 'DBMosaic', 'dbmosaic/'),
                ('application', 'DocMosaic', 'docmosaic/'),
                ('ontology', 'OntoMosaic-Doc', 'ontomosaic-doc/'),
                ('ontology', 'OntoMosaic-DB', 'ontomosaic-db/'),
                ('ontology', 'OntoMosaic-Enterprise', 'ontomosaic-enterprise/'),
                ('resource', 'Tools', 'tools/'),
                ('resource', 'Benchmarks', 'benchmarks/'),
                ('resource', 'Publications', 'research/'),
                (None, 'Members', 'members/'),
            ):
                mobile.goto(base)
                mobile.get_by_role('button', name='Open navigation', exact=True).tap()
                expect(mobile.locator('#nav-application')).to_be_focused()
                # Reproduce a touch blur with no next focus target before the click arrives.
                mobile.evaluate('document.activeElement.blur()')
                expect(mobile.locator('#primary-navigation')).to_be_visible()
                if group:
                    trigger = mobile.locator(f'#nav-{group}')
                    trigger.tap()
                    trigger.focus()
                    mobile.evaluate('document.activeElement.blur()')
                    panel = mobile.locator(f'#nav-{group}-panel')
                    expect(panel).to_be_visible()
                    panel.get_by_role('link', name=label, exact=False).tap()
                else:
                    mobile.locator('#nav-members').tap()
                expect(mobile).to_have_url(base + route)
            mobile.goto(base)
            mobile.get_by_role('button', name='Open navigation', exact=True).tap()
            mobile.touchscreen.tap(2, 400)  # Outside the menu's 14px inset, without hitting a link.
            expect(mobile.locator('#primary-navigation')).to_be_hidden()
            mobile.get_by_role('button', name='Open navigation', exact=True).tap()
            mobile.locator('.hero-actions a').first.focus()
            expect(mobile.locator('#primary-navigation')).to_be_hidden()
            touch.close()
            assert not errors, errors
            assert not failures, failures
            assert not api_requests, api_requests
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
print('PASS: Pages static hosting, subpath assets/links, refresh, demos, placeholders, research, mobile/theme, no API calls or browser errors')
