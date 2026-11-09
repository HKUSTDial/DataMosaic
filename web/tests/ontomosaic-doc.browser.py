"""Run against a Vite preview or gateway: python3 -P tests/ontomosaic-doc.browser.py BASE_URL"""
import re
import sys

from playwright.sync_api import expect, sync_playwright

base = sys.argv[1].rstrip('/')

def explore_cases(page):
    for case in ('finance', 'survey'):
        tabs = page.locator(f'.{case}-case [role="tab"]')
        for index in (1, 0):
            tabs.nth(index).click()
            expect(tabs.nth(index)).to_have_attribute('aria-selected', 'true')
            panel = page.locator('#' + tabs.nth(index).get_attribute('aria-controls'))
            expect(panel).to_be_visible()
            expect(page.locator('#' + tabs.nth(1-index).get_attribute('aria-controls'))).to_be_hidden()
            assert panel.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
        tabs.first.focus()
        for key, index in (('End', 1), ('Home', 0), ('ArrowLeft', 1), ('ArrowRight', 0)):
            page.keyboard.press(key)
            expect(tabs.nth(index)).to_be_focused()
            expect(tabs.nth(index)).to_have_attribute('aria-selected', 'true')
    for index in (1, 2, 3, 0):
        row = page.locator(f'[data-reading="{index}"]')
        row.click()
        expect(row).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('.chart-row[aria-pressed="true"]')).to_have_count(1)
        expect(page.locator(f'[data-reading-detail="{index}"]')).to_be_visible()
        expect(page.locator('[data-reading-detail]:visible')).to_have_count(1)
    page.locator('#survey-scope-tab').click()
    for scope in ('sample', 'report'):
        page.locator(f'[data-scope="{scope}"]').click()
        expect(page.locator(f'[data-scope="{scope}"]')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator(f'[data-scope-detail="{scope}"]')).to_be_visible()
        expect(page.locator('[data-scope-detail]:visible')).to_have_count(1)
    page.locator('#survey-chart-tab').click()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')

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
        expect(page.locator('.announcement')).to_have_text('DOMAIN-GROUNDED KNOWLEDGE')
        expect(page.locator('main')).to_be_visible()
        expect(page.locator('.problem-grid article')).to_have_count(3)
        assert page.locator('.schema-grid h3').all_text_contents() == ['Concept', 'Relation', 'Mapping', 'Evidence', 'Constraint']
        expect(page.locator('.case-study')).to_have_count(2)
        cases = [card.bounding_box() for card in page.locator('.case-study').all()]
        if width > 850:
            assert abs(cases[0]['y'] - cases[1]['y']) < 1 and cases[1]['x'] > cases[0]['x'], width
        else:
            assert cases[1]['y'] >= cases[0]['y'] + cases[0]['height'], width
        assert page.locator('.case-answers strong').evaluate_all('(els)=>els.every(e=>parseFloat(getComputedStyle(e).fontSize)<=14)'), width
        expect(page.locator('.calculation-value strong')).to_have_text('14,275')
        assert page.locator('.case-answers strong').all_text_contents() == ['9,068', '16.52%']
        expect(page.locator('.chart-row')).to_have_count(4)
        assert page.locator('.chart-values').all_text_contents() == ['97 / 3', '92 / 8', '77 / 23', '50 / 50']
        expect(page.locator('.applications-grid article')).to_have_count(6)
        expect(page.locator('.application-icon svg')).to_have_count(6)
        expect(page.locator('[data-zh] [data-zh]')).to_have_count(0)
        expect(page.locator('#context-title')).to_have_text('Sustained battery operating point')
        assert page.locator('.context-facts dd').all_text_contents() == ['45°C · INT8 · Sustained mode', '40 TOPS peak · ≤60 s', 'Board + fan; 20% energy reserve', '96 × 0.8 ÷ (12 + 3) = 5.12 h']
        expect(page.locator('.context-study .example-tag')).to_have_text('Illustrative data')
        expect(page.locator('.context-study video,.context-study .device-illustration')).to_have_count(0)
        expect(page.locator('.context-evidence')).to_have_count(3)
        expect(page.locator('.thermal-chart')).to_be_visible()
        assert page.locator('.context-power-table tbody td').all_text_contents() == ['96 Wh', '12 W', '3 W']
        expect(page.locator('.context-answer strong')).to_have_text('18 TOPS · ~5.12 h')
        expect(page.locator('.context-answer')).to_contain_text('falls short of 6 h')
        expect(page.locator('.context-resolution')).to_contain_text('wrong answer')
        if width >= 1200:
            height = page.locator('.context-study').bounding_box()['height']
            assert height <= 430, (width, height)
            print(f'{width}px: compact example {height:.0f}px tall')
        expect(page.locator('body')).not_to_contain_text('Source:')
        explore_cases(page)
        expect(page.locator('.build-track > p')).to_contain_text('do not establish a gain')
        expect(page.locator('.evolve-track > p')).to_contain_text('parent is empty')
        expect(page.locator('.review-note strong')).to_have_text('Schema validity is not semantic correctness.')
        expect(page.locator('.survey-case')).to_contain_text('distinct classification contexts')
        expect(page.locator('video')).to_have_count(2)
        introduction = page.locator('.hero-film video')
        expect(introduction).to_be_visible()
        expect(introduction.locator('source')).to_have_attribute('src', 'introduction.mp4')
        expect(introduction.locator('track')).to_have_attribute('src', 'introduction.vtt')
        expect(introduction).to_have_attribute('controls', '')
        assert introduction.get_attribute('autoplay') is None
        page.wait_for_function('(v)=>v.readyState>=1', arg=introduction.element_handle())
        assert abs(introduction.evaluate('(v)=>v.duration') - 24) < .1
        if width > 850:
            assert page.locator('.hero-film').bounding_box()['x'] > page.locator('.hero-copy').bounding_box()['x']
        if width in (1440, 390):
            introduction.evaluate('async(v)=>{v.muted=true;await v.play();v.currentTime=13;}')
            page.wait_for_function('(v)=>v.currentTime>13.2', arg=introduction.element_handle())
            introduction.evaluate('(v)=>{v.pause();v.currentTime=0;}')
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
        assert page.locator('.schema-grid article,.pipeline,.case-study,.context-study,.context-document,.context-facts,.context-evidence,.context-power-table').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('en cards', width)
        code = page.locator('nav .nav-cta')
        expect(code).to_have_attribute('href', 'https://github.com/HKUSTDial/DocPilot')
        expect(code).to_have_attribute('target', '_blank')
        assert 'noopener' in code.get_attribute('rel')
        page.locator('[data-language="zh"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        expect(page.locator('#hero-title')).to_have_text('让证据连起来，让含义留得住。')
        expect(page.locator('#demo video')).to_have_attribute('aria-label', 'OntoMosaic-Doc 本体构建流程演示')
        expect(introduction).to_have_attribute('aria-label', 'OntoMosaic-Doc 语义理解产品介绍')
        expect(page.locator('#scenarios-title')).to_have_text('当定义改变了答案。')
        expect(page.locator('.case-story h3').last).to_have_text('跨代际的西班牙裔认同')
        expect(page.locator('.applications-grid h4').last).to_have_text('采购与招投标')
        expect(page.locator('#context-title')).to_have_text('电池供电的持续工作点')
        assert page.locator('.context-facts dd').all_text_contents() == ['45°C · INT8 · 持续模式', '40 TOPS 峰值 · ≤60 秒', '主板 + 风扇；预留 20% 电量', '96 × 0.8 ÷ (12 + 3) = 5.12 h']
        expect(page.locator('.note-evidence')).to_contain_text('主板功耗不含风扇')
        expect(page.locator('.context-answer')).to_contain_text('估算续航不足 6 小时')
        expect(page.locator('.thermal-chart')).to_have_attribute('aria-label', re.compile('45°C 时为 18 TOPS'))
        if width >= 1200:
            assert page.locator('.context-study').bounding_box()['height'] <= 430
        if width in (1440, 390, 320):
            explore_cases(page)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), ('zh', width)
        assert page.locator('.schema-grid article,.pipeline,.case-study,.context-study,.context-document,.context-facts,.context-evidence,.context-power-table').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'), ('zh cards', width)
        assert page.reload().status == 200
        expect(page.locator('html')).to_have_attribute('lang', 'zh-CN')
        page.locator('[data-language="en"]').click()
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        if width in (1440, 768, 390, 320):
            page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
            page.screenshot(path=f'/tmp/ontomosaic-doc-{width}.png', full_page=True)
            page.locator('.context-study').screenshot(path=f'/tmp/ontomosaic-compact-{width}.png')
        print(f'{width}px: content, navigation, video, EN/中文, refresh, no overflow')
    assert not api_requests, api_requests
    page.locator('nav .home-key').click()
    expect(page).to_have_url(base + '/')
    assert not errors, errors
    assert not failures, failures
    browser.close()
print('PASS: OntoMosaic-Doc product content, standalone route, video, language persistence, eight widths, no API calls')
