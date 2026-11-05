"""Run against a Vite preview or a deployed gateway: python3 -P tests/docmosaic.browser.py BASE_URL"""
import re
import sys

from playwright.sync_api import expect, sync_playwright

base = sys.argv[1].rstrip('/')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors, failures = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failures.append(response.url) if response.status >= 400 else None)
    for width in (1920, 1440, 1024, 768, 390, 320):
        page.set_viewport_size({'width': width, 'height': 1000})
        response = page.goto(base + '/docmosaic?source=home')
        assert response.status == 200
        expect(page).to_have_url(base + '/docmosaic/?source=home')
        expect(page).to_have_title('DocMosaic · Beyond the document. Intelligence in motion.')
        expect(page.locator('#hero-title')).to_be_visible()
        paper = page.locator('.hero-actions .paper-link')
        expect(paper).to_have_text('Paper ↗')
        expect(paper).to_have_attribute('href', 'https://arxiv.org/abs/2610.21327')
        expect(paper).to_have_class('button paper-link')
        expect(page.locator('.hero-film figcaption')).to_have_count(0)
        assert page.locator('nav').evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)') >= 15
        expect(page.locator('.video-placeholder')).to_have_count(0)
        expect(page.locator('video')).to_have_count(4)
        introduction = page.locator('.hero-film video')
        expect(introduction).to_be_visible()
        expect(introduction.locator('source')).to_have_attribute('src', 'introduction.mp4')
        expect(introduction).to_have_attribute('poster', 'introduction-poster.jpg')
        expect(introduction).to_have_attribute('controls', '')
        expect(introduction).to_have_attribute('playsinline', '')
        assert introduction.get_attribute('autoplay') is None
        page.wait_for_function('(v)=>v.readyState>=1', arg=introduction.element_handle())
        assert introduction.evaluate('(v)=>Number.isFinite(v.duration)&&v.duration>0')
        if width > 850:
            assert page.locator('.hero-film').bounding_box()['width'] > page.locator('.hero-copy').bounding_box()['width'] * 1.3
        if width in (1920, 1440):
            assert abs(page.locator('.hero-grid').bounding_box()['width'] - min(1440, width - 96)) < 1
            assert page.locator('.hero-copy').bounding_box()['height'] < page.locator('.hero-film').bounding_box()['height']
            lede = page.locator('.hero-copy .lede').bounding_box()
            actions = page.locator('.hero-actions').bounding_box()
            assert 15 <= actions['y'] - lede['y'] - lede['height'] <= 25
        if width in (1440, 390):
            introduction.evaluate('async (v)=>{v.muted=true;await v.play();v.currentTime=2;}')
            page.wait_for_function('(v)=>v.currentTime>2.1', arg=introduction.element_handle())
            introduction.evaluate('(v)=>{v.pause();v.currentTime=0;v.textTracks[0].mode="hidden";}')
            page.wait_for_function('(v)=>v.textTracks[0].cues?.length>0', arg=introduction.element_handle())
            assert introduction.evaluate('(v)=>v.textTracks[0].cues.length') == 38
            assert introduction.evaluate('(v)=>v.textTracks[0].cues[v.textTracks[0].cues.length-1].endTime<=v.duration+.1')
        expect(page.locator('section#demo')).to_have_count(1)
        demo = page.locator('#demo video')
        expect(demo.locator('source')).to_have_attribute('src', 'demo.mp4')
        expect(demo).to_have_attribute('controls', '')
        expect(demo).to_have_attribute('playsinline', '')
        expect(demo).to_have_attribute('poster', 'demo-poster.jpg')
        assert demo.get_attribute('autoplay') is None
        expect(page.locator('#demo .steps li')).to_have_count(5)
        assert page.locator('#demo .steps').evaluate('(e)=>getComputedStyle(e).gridTemplateColumns.split(" ").length') == (2 if width <= 600 else 5)
        assert page.locator('#demo').evaluate('(e)=>!!(document.querySelector("#models").compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(e.compareDocumentPosition(document.querySelector("#results"))&Node.DOCUMENT_POSITION_FOLLOWING)')
        page.wait_for_function('(v)=>v.readyState>=1', arg=demo.element_handle())
        assert demo.evaluate('(v)=>Number.isFinite(v.duration)&&v.duration>0')
        if width in (1440, 390):
            demo.evaluate('async (v)=>{v.muted=true;await v.play();v.currentTime=2;}')
            page.wait_for_function('(v)=>v.currentTime>2.1', arg=demo.element_handle())
            demo.evaluate('(v)=>{v.pause();v.currentTime=0;}')
        for section, filename, duration, cues in [('framework', 'agentic.mp4', 37.2, 6), ('workflow', 'interaction.mp4', 44, 7)]:
            video = page.locator(f'#{section} video')
            expect(video.locator('source')).to_have_attribute('src', filename)
            expect(video).to_have_attribute('controls', '')
            expect(video).to_have_attribute('playsinline', '')
            assert video.get_attribute('autoplay') is None
            page.wait_for_function('(v)=>v.readyState>=1', arg=video.element_handle())
            assert abs(video.evaluate('(v)=>v.duration') - duration) < .2
            if width in (1440, 390):
                video.evaluate('async (v)=>{v.muted=true;await v.play();v.currentTime=2;}')
                page.wait_for_function('(v)=>v.currentTime>2.1', arg=video.element_handle())
                video.evaluate('(v)=>{v.pause();v.currentTime=0;v.textTracks[0].mode="hidden";}')
                page.wait_for_function('(v)=>v.textTracks[0].cues?.length>0', arg=video.element_handle())
                assert video.evaluate('(v)=>v.textTracks[0].cues.length') == cues
        expect(page.locator('.closing')).to_have_count(0)
        assert page.locator('.feature h2').all_text_contents() == [
            'Multimodal Document Environment', 'Agentic OrchestrationFramework', 'Interaction Workflow', 'From LLM to SLM']
        assert page.locator('.kicker span').all_text_contents() == ['01.', '02.', '03.', '04.']
        assert page.locator('.hero-strip a b').all_text_contents() == ['Environment', 'Orchestrate', 'Interact', 'Distill']
        expect(page.locator('.hero-strip>span')).to_contain_text('FOUR CONNECTED IDEAS.')
        expect(page.locator('.env-thumbnail')).to_have_count(6)
        expect(page.locator('.env-thumbnail.selected>span')).to_have_text('06')
        expect(page.locator('.env-page-number')).to_have_text('06')
        assert page.locator('.env-view h3').all_text_contents() == ['Doc overview', 'Page view', 'Layout & elements']
        assert page.locator('.env-element').all_text_contents() == ['≡Text', '▦Table', '▧Image', '▥Chart', 'ƒFormula', '⊞Layout']
        assert page.locator('.wordmark img').evaluate('(img) => img.complete && img.naturalWidth > 0')
        assert page.locator('nav a:not(.home-key):not(.nav-cta)').all_text_contents() == ['Overview', 'Demo', 'Results', 'Research']
        expect(page.locator('nav a[href="../research/"]')).to_be_visible()
        home = page.locator('nav .home-key')
        expect(home).to_be_visible()
        expect(home.locator('svg')).to_have_count(1)
        home_box = home.bounding_box()
        overview = page.locator('nav a[href="#environment"]')
        overview_box = overview.bounding_box()
        assert home_box['width'] == home_box['height'] == 36
        assert home.evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(100, 104, 203)'
        assert home.evaluate('(e)=>getComputedStyle(e).color') == 'rgb(255, 255, 255)'
        assert abs(home_box['y'] + home_box['height']/2 - overview_box['y'] - overview_box['height']/2) < 2
        overview.click()
        expect(page).to_have_url(re.compile('#environment$'))
        expect(page.locator('#environment-title')).to_be_in_viewport()
        for target in ('environment', 'framework', 'workflow', 'models'):
            page.locator(f'.hero-strip a[href="#{target}"]').click()
            expect(page).to_have_url(re.compile(f'#{target}$'))
            expect(page.locator(f'#{target} h2')).to_be_in_viewport()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), width
        assert page.reload().status == 200
        expect(page.get_by_role('link', name='Get Started', exact=False)).to_have_attribute('href', 'app/')
        expect(page.get_by_role('link', name='More Details', exact=False)).to_have_attribute('href', '#environment')
        page.locator('nav a[href="#demo"]').click()
        expect(page).to_have_url(re.compile('#demo$'))
        expect(page.locator('#demo')).to_be_in_viewport()
        expect(page.locator('#demo-title')).to_be_in_viewport()
        page.locator('[data-language="zh"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        expect(page.locator('[data-language="zh"]')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('#hero-title')).to_have_text('超越文档。让智能流动。')
        expect(paper).to_have_text('论文 ↗')
        expect(introduction).to_have_attribute('aria-label', 'DocMosaic 产品介绍视频')
        expect(page.get_by_role('link', name='开始使用', exact=False)).to_be_visible()
        expect(page.locator('#workflow-title')).to_have_text('交互工作流')
        expect(page.locator('#environment-title')).to_have_text('多模态文档环境')
        expect(page.locator('#demo-title')).to_have_text('从一个问题，到有据可循的答案。')
        expect(page.locator('#demo .player-chrome')).to_contain_text('产品操作演示')
        assert page.locator('.env-view h3').all_text_contents() == ['文档概览', '页面视图', '版式与元素']
        assert page.locator('.env-view').evaluate_all('(views)=>views.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('zh environment', width)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('zh', width)
        assert page.reload().status == 200
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        expect(page.locator('#models-title')).to_have_text('从大模型到小模型')
        page.locator('[data-language="en"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        expect(page.locator('[data-language="en"]')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('#hero-title')).to_have_text('Beyond the document.Intelligence in motion.')
        page.goto(base + '/docmosaic/')
        assert page.locator('.env-view').evaluate_all('(views)=>views.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('en environment', width)
        page.locator('.environment-diagram').screenshot(path=f'/tmp/docmosaic-environment-{width}.png', style='.topbar{visibility:hidden}')
        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
        page.screenshot(path=f'/tmp/docmosaic-product-{width}.png', full_page=True)
        page.locator('[data-language="zh"]').click()
        page.screenshot(path=f'/tmp/docmosaic-product-zh-{width}.png', full_page=True)
        page.locator('[data-language="en"]').click()
    page.locator('nav a[href="../research/"]').click()
    expect(page).to_have_url(base + '/research/')
    assert page.go_back().status == 200
    page.locator('nav .home-key').click()
    expect(page).to_have_url(base + '/')
    page.goto(base + '/docmosaic/')
    page.locator('footer a[href="../"]').click()
    expect(page).to_have_url(base + '/')
    assert not errors, errors
    assert not failures, failures
    browser.close()
print('PASS: wider hero and product video, Overview/Home/Demo, four playable videos, captions, EN/中文, and six viewport widths')
