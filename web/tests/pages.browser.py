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
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: failures.append(response.url) if response.status >= 400 else None)
            page.on('requestfailed', lambda request: failures.append(request.url))
            page.on('request', lambda request: api_requests.append(request.url) if '/api/' in request.url else None)
            for width in (1440, 390):
                page.set_viewport_size({'width': width, 'height': 1100})
                assert page.goto(base).status == 200
                expect(page.locator('#hero-title')).to_have_text('Knowledge that evolves. Intelligence that scales.')
                assert page.locator('.overview-tile').count() == 16
                assert page.locator('a[href^="/"]').evaluate_all('(links) => links.every(a => a.getAttribute("href").startsWith("/DataMosaic/"))')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                for name, route in (('DocMosaic', 'docmosaic'), ('DBMosaic', 'dbmosaic'), ('OntoMosaic-Text2SQL', 'ontomosaic-text2sql')):
                    page.get_by_role('link', name=f'Open {name}', exact=True).first.click()
                    expect(page.get_by_role('dialog')).to_be_visible()
                    expect(page.locator('#demo-title')).to_have_text(f'{name} demo')
                    page.wait_for_function('document.querySelector(".demo-video")?.naturalWidth > 0')
                    assert page.locator('.demo-video').get_attribute('src').startswith('/DataMosaic/assets/')
                    assert page.reload().status == 200
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.get_by_role('button', name='Close demo', exact=True).click()
                    expect(page).to_have_url(base)
                for route in ('ontomosaic-doc', 'ontomosaic-enterprise'):
                    assert page.goto(base + route + '?tab=1').status == 200
                    assert page.reload().status == 200
                    assert page.locator('main').inner_html().strip() == ''
                    page.get_by_role('link', name='DataMosaic home').click()
                    expect(page).to_have_url(base)
                page.get_by_role('button', name='Watch DocMosaic demo').click()
                expect(page.get_by_role('dialog')).to_be_visible()
                page.get_by_role('button', name='Close demo', exact=True).click()
                expect(page).to_have_url(base)
                page.get_by_role('button', name='Switch to dark mode').click()
                expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
                page.get_by_role('button', name='Switch to light mode').click()
                if width < 860:
                    page.get_by_role('button', name='Open navigation', exact=True).click()
                page.locator('#nav-resource').click()
                page.get_by_role('link', name='Research Paper', exact=False).click()
                expect(page.locator('main')).to_have_class('content research-content')
                assert page.reload().status == 200
                page.get_by_role('link', name='Back to DataMosaic', exact=False).click()
                expect(page).to_have_url(base)
            assert not errors, errors
            assert not failures, failures
            assert not api_requests, api_requests
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
print('PASS: Pages static hosting, subpath assets/links, refresh, demos, placeholders, research, mobile/theme, no API calls or browser errors')
