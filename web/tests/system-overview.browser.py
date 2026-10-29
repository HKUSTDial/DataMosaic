"""Run against a local Vite or prepared Pages preview URL."""
import sys
from urllib.parse import urlparse
from playwright.sync_api import expect, sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1100})
    page.route('**/api/health', lambda r:r.fulfill(status=200,content_type='application/json',body='{}'))
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(sys.argv[1])
    overview=page.locator('.system-overview')
    assert page.locator('.hero + .system-overview + .workflow-section').count()==1
    expect(overview.locator('.overview-tile')).to_have_count(6)
    expect(overview.locator('a')).to_have_count(5)
    for name,href in [('Document understanding','/docmosaic/'),('Relational extraction','/dbmosaic/'),('Context retrieval','/ontomosaic-doc'),('SQL learning','/ontomosaic-text2sql'),('Business semantics','/ontomosaic-enterprise')]:
        expect(overview.get_by_role('link',name=f'Explore {name}',exact=True)).to_have_attribute('href',urlparse(page.url).path.rstrip('/')+href)
    expect(overview.get_by_text('Adaptive structuring',exact=True)).to_be_visible()
    expect(overview.locator('.overview-paper-cells i')).to_have_count(12)
    for name in ['DocMosaic','DBMosaic','StructMosaic','OntoMosaic-Doc','OntoMosaic-Text2SQL','OntoMosaic-Enterprise']:
        expect(overview.get_by_text(name,exact=True)).to_have_count(0)
    expect(overview.locator('.overview-knowledge-graph')).to_be_visible()
    overview.scroll_into_view_if_needed()
    expect(overview).to_have_attribute('data-running','true')
    page.get_by_role('button',name='Pause system animation').click()
    assert overview.evaluate("e=>e.getAnimations({subtree:true}).every(a=>a.playState==='paused')")
    def seek(seconds):
        overview.evaluate('(e,s)=>e.getAnimations({subtree:true}).forEach(a=>a.currentTime=s*1000)',seconds)
    for i,second in enumerate([2,6,10,14]):
        seek(second)
        opacity=overview.locator('.overview-caption').evaluate_all('els=>els.map(e=>Number(getComputedStyle(e).opacity))')
        assert opacity[i]>.9 and sum(v>.5 for v in opacity)==1,(second,opacity)
    seek(2)
    early=overview.locator('.overview-knowledge-node').first.evaluate('e=>Number(getComputedStyle(e).opacity)')
    seek(11)
    late=overview.locator('.overview-knowledge-node').first.evaluate('e=>Number(getComputedStyle(e).opacity)')
    assert late>early+.4
    for width in [1440,1200,1024,901,800,768,600,540,390,360,320]:
        page.set_viewport_size({'width':width,'height':1100})
        assert overview.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),width
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
        assert overview.locator('.overview-tile').evaluate_all('els=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'),width
        for shelf in overview.locator('.overview-shelf').all():
            assert shelf.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),width
    page.set_viewport_size({'width':1440,'height':1100})
    seek(11)
    expect(overview.locator('.overview-scene')).to_have_css('background-color','rgb(248, 250, 252)')
    overview.screenshot(path='/tmp/datamosaic-overview-desktop.png')
    page.get_by_role('button',name='Switch to dark mode').click()
    expect(overview.locator('.overview-scene')).to_have_css('background-color','rgb(27, 39, 54)')
    overview.screenshot(path='/tmp/datamosaic-overview-dark.png')
    page.get_by_role('button',name='Switch to light mode').click()
    page.set_viewport_size({'width':390,'height':1100})
    overview.screenshot(path='/tmp/datamosaic-overview-mobile.png')
    overview.scroll_into_view_if_needed()
    page.get_by_role('button',name='Play system animation').click()
    expect(overview).to_have_attribute('data-running','true')
    page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
    expect(overview).to_have_attribute('data-running','false')
    page.emulate_media(reduced_motion='reduce')
    expect(overview).to_have_attribute('data-playing','false')
    assert overview.evaluate('e=>e.getAnimations({subtree:true}).length===0')
    page.reload()
    expect(overview).to_have_attribute('data-playing','false')
    assert not errors,errors
    browser.close()
print('PASS: six modules, four narrative phases, graph growth, responsive layout, themes, pause and reduced motion')
