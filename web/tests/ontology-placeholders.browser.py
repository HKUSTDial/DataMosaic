"""With Playwright installed and Vite preview running:
python3 -P tests/ontology-placeholders.browser.py http://127.0.0.1:21680
"""
import json
import re
import sys

from playwright.sync_api import expect, sync_playwright

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:21680'
modules = [('OntoMosaic-Doc', '/ontomosaic-doc'),
           ('OntoMosaic-DB', '/ontomosaic-text2sql'),
           ('OntoMosaic-Enterprise', '/ontomosaic-enterprise')]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1100})
    errors, requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    def mock_api(route):
        requests.append(route.request.method)
        assert route.request.method == 'GET'
        route.fulfill(status=200, content_type='application/json', body=json.dumps({
            'databases': [], 'tables': [], 'runs': [], 'training_ready': False,
            'training_error': 'Test configuration'}))
    page.route('**/api/**', mock_api)
    for width in (1440, 1024, 768, 390, 360):
        page.set_viewport_size({'width': width, 'height': 1100})
        page.goto(base)
        cards = page.locator('.ontology-section .workflow-card')
        assert cards.count() == 3
        for index, (name, href) in enumerate(modules):
            expect(cards.nth(index).get_by_role('link', name=f'Open {name}', exact=True).first).to_have_attribute('href', href)
        assert cards.locator('.card-number').all_text_contents() == ['01', '02', '03']
        doc = cards.nth(0)
        expect(doc.locator('.card-description')).to_have_text('Let a context graph lead retrieval across the enterprise. Follow concepts, relationships, and evidence from the question to a grounded answer.')
        assert doc.locator('.product-demo').get_attribute('src')
        assert doc.locator('.card-features span').all_text_contents() == ['Context graph', 'Enterprise retrieval']
        expect(doc.locator('.service-status')).to_have_text('Unavailable')
        expect(doc.locator('.service-status')).to_have_class('service-status bad')
        assert doc.evaluate('e => e.scrollWidth <= e.clientWidth + 1'), width
        enterprise = cards.nth(2)
        expect(enterprise.locator('.card-description')).to_contain_text('Turn business processes into a shared enterprise ontology.')
        assert enterprise.locator('.card-features span').all_text_contents() == ['Process-to-ontology', 'Connected data sources']
        animation = enterprise.locator('img.product-demo')
        animation.scroll_into_view_if_needed()
        expect(animation).to_have_attribute('src', re.compile(r'.*OntoMosaic-Enterprise-demo.*\.gif'))
        page.wait_for_function('''() => {
            const image = document.querySelector('.ontology-section .workflow-card:nth-child(3) img');
            return image && image.complete && image.naturalWidth > 0;
        }''')
        expect(enterprise.locator('.service-status')).to_have_text('Unavailable')
        assert enterprise.evaluate('e => e.scrollWidth <= e.clientWidth + 1'), width
        assert cards.nth(1).locator('.product-demo').count() == 1
        mobile_navigation = page.get_by_role('button', name='Open navigation', exact=True).is_visible()
        if mobile_navigation:
            page.get_by_role('button', name='Open navigation', exact=True).click()
        page.locator('#nav-ontology').click()
        assert page.locator('#nav-ontology-panel a').evaluate_all('(es) => es.map(e => e.getAttribute("href"))') == [href for _, href in modules]
        page.locator('#nav-ontology').click()
        if mobile_navigation:
            page.get_by_role('button', name='Close navigation', exact=True).click()
        for index in (0, 2):
            name, href = modules[index]
            cards.nth(index).get_by_role('link', name=f'Open {name}', exact=True).first.click()
            expect(page).to_have_url(base + href)
            expect(page).to_have_title(f'{name} | DataMosaic')
            assert page.locator('main').inner_html().strip() == ''
            page.goto(base)
    for index in (0, 2):
        name, href = modules[index]
        for suffix in ('', '/', '?tab=1'):
            page.goto(base + href + suffix)
            requests.clear()
            page.reload()
            expect(page).to_have_title(f'{name} | DataMosaic')
            assert page.locator('main').inner_html().strip() == ''
            assert not requests, requests
    page.goto(base + '/ontomosaic-text2sql')
    expect(page.get_by_role('heading', name='Ontology workbench', exact=True)).to_be_visible()
    assert page.locator('main').inner_text().strip()
    assert not errors, errors
    browser.close()
print('PASS: card/menu order, blank routes, direct access, refresh, responsive cards, Text2SQL workbench, no mutations or JS errors')
