"""python3 -P tests/docmosaic-results.browser.py BASE_URL"""
import json
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

base = sys.argv[1].rstrip('/')
data = json.loads((Path(__file__).resolve().parent.parent / 'public/docmosaic/results.json').read_text())
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors, failures = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failures.append(response.url) if response.status >= 400 else None)
    for width in (1440, 1024, 768, 390, 320):
        page.set_viewport_size({'width': width, 'height': 1000})
        page.goto(base + '/docmosaic/')
        page.locator('nav a[href="#results"]').click()
        expect(page).to_have_url(base + '/docmosaic/#results')
        expect(page.locator('#results-title')).to_be_in_viewport()
        if width >= 1024:
            assert page.locator('.results-lead').evaluate('(e)=>e.getBoundingClientRect().height<=parseFloat(getComputedStyle(e).lineHeight)+1')
        rows = page.locator('#results-table tbody tr')
        expect(rows).to_have_count(32)
        expect(page.locator('.results-sources, #results-table a, [data-result-filter="docatlas"]')).to_have_count(0)
        expect(page.locator('#results-table thead .results-system')).to_have_text('System')
        expect(page.locator('#results-status')).to_have_text('32 / 32 systems · 6 metrics')
        expect(rows.first.locator('.results-system>span')).to_have_text('DocPilot + Gemini-3.1-Pro')
        assert rows.first.locator('td').all_text_contents() == ['75.6', '74.9', '—', '75.8', '—', '86.8']
        for group, count in [('baseline', 11), ('agent', 20), ('docpilot', 5)]:
            page.locator(f'[data-result-filter="{group}"]').click()
            expect(rows).to_have_count(count)
            expect(page.locator(f'[data-result-filter="{group}"]')).to_have_attribute('aria-pressed', 'true')
            if group == 'agent':
                expect(page.locator('#results-table tbody tr[data-group="docatlas"]')).to_have_count(6)
                expect(page.locator('#results-table tbody tr[data-group="docpilot"]')).to_have_count(5)
                expect(page.locator('#results-table tbody tr[data-group="vanilla"], #results-table tbody tr[data-group="ocr"], #results-table tbody tr[data-group="human"]')).to_have_count(0)
        page.get_by_role('button', name='Sort by MMLongBench-Doc Acc', exact=True).click()
        expect(rows.first.locator('.results-system>span')).to_have_text('DocPilot-4B')
        page.locator('[data-result-view="detailed"]').click()
        expect(rows.first.locator('td')).to_have_count(15)
        assert rows.first.locator('td').all_text_contents() == ['57.4', '47.9', '53.4', '58.7', '51.0', '70.0', '59.1', '58.5', '—', '68.7', '56.2', '59.6', '60.2', '—', '80.3']
        expect(rows.first.locator('a')).to_have_count(0)
        page.locator('[data-language="zh"]').click()
        expect(page.locator('#results-title')).to_have_text('用结果，检验推理。')
        expect(page.locator('#results-status')).to_have_text('显示 5 / 32 个系统 · 15 项指标')
        expect(page.get_by_role('button', name='排序：MMLongBench-Doc Acc', exact=True)).to_be_visible()
        expect(rows).to_have_count(5)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), width
        assert page.locator('.results-scroll').evaluate('(e)=>e.scrollWidth>e.clientWidth'), width
        page.locator('[data-language="en"]').click()
        page.locator('[data-result-filter="all"]').click()
        page.get_by_role('button', name='Sort by DocBench LasJ', exact=True).click()
        expect(rows.first.locator('.results-system>span')).to_have_text('DocPilot + Gemini-3.1-Pro')
        assert rows.last.locator('td').last.inner_text() == '—'
        page.locator('[data-result-view="overall"]').click()
        expect(rows).to_have_count(32)
        page.reload()
        expect(rows).to_have_count(32)
        expect(page.locator('#results-status')).to_have_text('32 / 32 systems · 6 metrics')
        page.locator('#results').screenshot(path=f'/tmp/docmosaic-results-{width}.png', style='.topbar{visibility:hidden}')
    for view, indices in [('overall', [6, 7, 8, 12, 13, 14]), ('detailed', list(range(15)))]:
        page.locator(f'[data-result-view="{view}"]').click()
        for position, index in enumerate(indices):
            metric = data['metrics'][index]
            name = f"Sort by {metric['benchmark']} {metric['label']}"
            for direction in ['descending', 'ascending']:
                button = page.get_by_role('button', name=name, exact=True)
                if button.locator('..').get_attribute('aria-sort') != direction:
                    button.evaluate('''(e)=>{const s=e.closest('.results-scroll');s.scrollLeft+=e.getBoundingClientRect().right-s.getBoundingClientRect().right+10;}''')
                    button.click()
                expect(page.get_by_role('button', name=name, exact=True).locator('..')).to_have_attribute('aria-sort', direction)
                values = rows.evaluate_all('(rs,i)=>rs.map(r=>r.querySelectorAll("td")[i].textContent)', position)
                actual = [None if value == '—' else float(value) for value in values]
                expected = sorted([row['values'][index] for row in data['rows']], key=lambda v: (v is None, 0 if v is None else -v if direction == 'descending' else v))
                assert actual == expected, (metric, direction, actual, expected)
    assert not errors, errors
    assert not failures, failures
    page.route('**/docmosaic/results.json', lambda route: route.fulfill(status=503, body='Unavailable'))
    page.reload()
    expect(page.locator('#results-status')).to_have_text('Results could not be loaded. Reload this page to try again.')
    expect(rows).to_have_count(0)
    page.locator('[data-language="zh"]').click()
    expect(page.locator('#results-status')).to_have_text('结果加载失败，请刷新页面重试。')
    page.unroute('**/docmosaic/results.json')
    page.route('**/docmosaic/results.json', lambda route: route.fulfill(content_type='application/json', body=json.dumps({'metrics': [], 'rows': []})))
    page.reload()
    expect(page.locator('#results-status')).to_have_text('结果加载失败，请刷新页面重试。')
    assert not errors, errors
    browser.close()
print('PASS: all 15 metrics sort both ways with missing values last, single-line desktop lead, filters, EN/中文, responsive table, and load errors')
