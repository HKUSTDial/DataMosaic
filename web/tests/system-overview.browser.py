"""Run against a local Vite or prepared Pages preview URL."""
import sys
import time
from playwright.sync_api import expect, sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1100})
    page.clock.install()
    page.route('**/api/health',lambda r:r.fulfill(status=200,content_type='application/json',body='{}'))
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(sys.argv[1])
    overview=page.locator('.system-overview')
    expect(overview.locator('.overview-app-story')).to_have_count(3)
    expect(overview.locator('.overview-plugin')).to_have_count(3)
    expect(overview.locator('.overview-paper-cells i')).to_have_count(12)
    for title in ['Document understanding','Information extraction','Adaptive structuring']:
        expect(overview.get_by_role('button',name=f'Show {title}')).to_be_visible()
    expect(overview.locator('.overview-story-description')).to_have_count(0)
    for card in overview.locator('.overview-app-story').all():
        assert card.locator('.overview-story-io').evaluate("e=>e.nextElementSibling.classList.contains('overview-story-visual')")
    overview.scroll_into_view_if_needed()
    expect(overview).to_have_attribute('data-running','true')
    # All three capability scenes keep moving, including unselected cards.
    for card in overview.locator('.overview-app-story').all():
        assert card.evaluate("e=>e.getAnimations({subtree:true}).some(a=>a.playState==='running'&&a.animationName!=='overview-progress')")
    scan=overview.locator('.story-scan')
    initial=scan.evaluate("e=>e.getAnimations()[0].currentTime")
    time.sleep(.2)
    assert scan.evaluate("e=>e.getAnimations()[0].currentTime") > initial
    ids=overview.locator('defs [id]').evaluate_all('els=>els.map(e=>e.id)')
    assert len(ids)==len(set(ids))
    for index in [1,2,0]:
        page.clock.run_for(4900)
        expect(overview).to_have_attribute('data-active',str(index))
        expect(overview.locator('.overview-app-story.is-active')).to_have_count(1)
    overview.get_by_role('button',name='Show Information extraction').click()
    expect(overview).to_have_attribute('data-active','1')
    expect(overview).to_have_attribute('data-playing','false')
    expect(scan).to_have_css('animation-play-state','paused')
    page.clock.run_for(6000)
    expect(overview).to_have_attribute('data-active','1')
    sockets=overview.locator('.overview-app-socket')
    def connected(count):
        for socket in sockets.all():
            expect(socket).to_have_attribute('aria-label',__import__('re').compile(f'^{count} knowledge plugins connected'))
            expect(socket.locator('.is-connected')).to_have_count(count)
    connected(2)
    business=overview.get_by_role('button',name='Business semantics',exact=False)
    business.click()
    expect(business).to_have_attribute('aria-pressed','true')
    connected(3)
    expect(overview.locator('.overview-plugin-notice')).to_have_count(0)
    business.press('Space')
    connected(2)
    overview.get_by_role('button',name='SQL knowledge',exact=False).click()
    overview.get_by_role('button',name='Context & evidence',exact=False).click()
    connected(0)
    expect(overview.locator('.overview-plugin-bus')).not_to_have_class(__import__('re').compile('is-connected'))
    business.click()
    connected(1)
    for width in [1440,1200,1100,1024,901,900,768,601,600,390,360,320]:
        page.set_viewport_size({'width':width,'height':1100})
        assert overview.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),width
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
        assert overview.locator('.overview-app-story,.overview-plugin').evaluate_all('els=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'),width
    page.set_viewport_size({'width':1440,'height':1100})
    overview.screenshot(path='/tmp/datamosaic-overview-desktop.png')
    page.get_by_role('button',name='Switch to dark mode').click()
    expect(overview.locator('.overview-scene')).to_have_css('background-color','rgb(27, 39, 54)')
    overview.screenshot(path='/tmp/datamosaic-overview-dark.png')
    page.get_by_role('button',name='Switch to light mode').click()
    page.set_viewport_size({'width':390,'height':1100})
    overview.get_by_role('button',name='Show Adaptive structuring').click()
    expect(overview).to_have_attribute('data-active','2')
    page.wait_for_function("document.querySelector('.overview-app-stories').scrollLeft > 0")
    overview.screenshot(path='/tmp/datamosaic-overview-mobile.png')
    page.get_by_role('button',name='Play system animation').click()
    page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
    expect(overview).to_have_attribute('data-running','false')
    expect(scan).to_have_css('animation-play-state','paused')
    old=overview.get_attribute('data-active')
    page.clock.run_for(10000)
    expect(overview).to_have_attribute('data-active',old)
    page.emulate_media(reduced_motion='reduce')
    expect(overview).to_have_attribute('data-playing','false')
    assert overview.evaluate('e=>e.getAnimations({subtree:true}).length===0')
    assert not errors,errors
    browser.close()
print('PASS: three animated capabilities, motion timing, shared plugins, responsive themes, pause and reduced motion')
