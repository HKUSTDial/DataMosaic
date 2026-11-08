"""Run against a Vite preview or gateway: python3 -P tests/ontomosaic-doc.browser.py BASE_URL"""
import re
import sys

from playwright.sync_api import expect, sync_playwright

base = sys.argv[1].rstrip('/')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors, failures, api_requests = [], [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failures.append(response.url) if response.status >= 400 else None)
    page.on('request', lambda request: api_requests.append(request.url) if '/api/' in request.url else None)
    for width in (1440, 1200, 1024, 850, 768, 600, 390, 320):
        page.set_viewport_size({'width': width, 'height': 1000})
        response = page.goto(base + '/ontomosaic-doc?source=home', wait_until='networkidle')
        assert response.status == 200
        expect(page).to_have_url(base + '/ontomosaic-doc/?source=home')
        expect(page).to_have_title('OntoMosaic-Doc · Evidence, connected. Meaning, preserved.')
        expect(page.locator('#hero-title')).to_contain_text('Evidence, connected.')
        expect(page.locator('main')).to_be_visible()
        expect(page.locator('.problem-grid article')).to_have_count(3)
        assert page.locator('.schema-grid h3').all_text_contents() == ['Concept', 'Relation', 'Mapping', 'Evidence', 'Constraint']
        expect(page.locator('.case-study')).to_have_count(2)
        assert page.locator('.profit-example strong').all_text_contents() == ['11,512', '12,325']
        expect(page.locator('.build-track > p')).to_contain_text('do not establish a gain')
        expect(page.locator('.evolve-track > p')).to_contain_text('parent is empty')
        expect(page.locator('.review-note strong')).to_have_text('Schema validity is not semantic correctness.')
        expect(page.locator('.survey-case')).to_contain_text('distinct classification contexts')
        expect(page.locator('video')).to_have_count(1)
        video = page.locator('#demo video')
        expect(video.locator('source')).to_have_attribute('src', 'video.mp4')
        expect(video).to_have_attribute('controls', '')
        expect(video).to_have_attribute('playsinline', '')
        assert video.get_attribute('autoplay') is None
        page.wait_for_function('(v)=>v.readyState>=1', arg=video.element_handle())
        assert abs(video.evaluate('(v)=>v.duration') - 64) < .1
        if width in (1440, 390):
            video.evaluate('async (v)=>{v.muted=true;await v.play();v.currentTime=2;}')
            page.wait_for_function('(v)=>v.currentTime>2.1', arg=video.element_handle())
            video.evaluate('(v)=>{v.pause();v.currentTime=0;}')
        for section in ('overview', 'framework', 'scenarios', 'demo'):
            page.locator(f'nav a[href="#{section}"]').click()
            expect(page).to_have_url(re.compile(f'#{section}$'))
            expect(page.locator(f'#{section} h2')).to_be_in_viewport()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), ('en', width)
        assert page.locator('.schema-grid article,.pipeline,.case-study').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('en cards', width)
        code = page.locator('nav .nav-cta')
        expect(code).to_have_attribute('href', 'https://github.com/HKUSTDial/DocPilot')
        expect(code).to_have_attribute('target', '_blank')
        assert 'noopener' in code.get_attribute('rel')
        page.locator('[data-language="zh"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        expect(page.locator('#hero-title')).to_have_text('让证据连起来，让含义留得住。')
        expect(page.locator('#demo video')).to_have_attribute('aria-label', 'OntoMosaic-Doc 本体构建流程演示')
        expect(page.locator('#scenarios-title')).to_have_text('当定义改变了答案。')
        assert page.locator('.profit-example strong').all_text_contents() == ['11,512', '12,325']
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), ('zh', width)
        assert page.locator('.schema-grid article,.pipeline,.case-study').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('zh cards', width)
        assert page.reload().status == 200
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        page.locator('[data-language="en"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        if width in (1440, 768, 390, 320):
            page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
            page.screenshot(path=f'/tmp/ontomosaic-doc-{width}.png', full_page=True)
        print(f'{width}px: content, navigation, video, EN/中文, refresh, no overflow')
    page.locator('nav .home-key').click()
    expect(page).to_have_url(base + '/')
    assert not errors, errors
    assert not failures, failures
    assert not api_requests, api_requests
    browser.close()
print('PASS: OntoMosaic-Doc product content, standalone route, video, language persistence, eight widths, no API calls')
