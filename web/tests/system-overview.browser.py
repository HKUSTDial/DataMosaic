"""With Playwright installed and Vite preview running:
python3 -P tests/system-overview.browser.py http://127.0.0.1:21680
"""
import sys
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100})
    page.route("**/api/health", lambda route: route.fulfill(
        status=200, content_type="application/json", body="{}"))
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:21680")
    overview = page.locator(".system-overview")
    assert page.locator(".hero + .system-overview + .workflow-section").count() == 1
    assert overview.locator(".overview-story, .overview-chapters, .overview-controls").count() == 0
    assert overview.locator(".overview-shelf").count() == 2
    assert overview.locator(".overview-tile").count() == 6
    assert overview.locator("a").count() == 5
    assert overview.locator(".overview-future").count() == 0
    assert overview.locator(".overview-future a, .overview-future button").count() == 0
    for name, href in (("DocMosaic", "/docmosaic/"), ("DBMosaic", "/dbmosaic/"),
                       ("OntoMosaic-Text2SQL", "/ontomosaic-text2sql"),
                       ("OntoMosaic-Doc", "/ontomosaic-doc"),
                       ("OntoMosaic-Enterprise", "/ontomosaic-enterprise")):
        expect(overview.get_by_role("link", name=f"Explore {name}", exact=True)).to_have_attribute("href", urlparse(page.url).path.rstrip("/") + href)
    expect(overview.get_by_text("StructMosaic", exact=True)).to_be_visible()
    assert overview.locator(".overview-tile").filter(has_text="StructMosaic").locator("a").count() == 0
    for label in ("Research", "Search", "Analytics", "Automation", "Finance", "Your next app", "Your domain"):
        expect(overview.get_by_text(label, exact=True)).to_have_count(0)
    flow = overview.locator(".overview-connection-flow")
    initial = flow.evaluate("e => getComputedStyle(e).strokeDashoffset")
    page.wait_for_function("initial => getComputedStyle(document.querySelector('.overview-connection-flow')).strokeDashoffset !== initial", arg=initial)
    page.get_by_role("button", name="Pause system animation").click()
    expect(overview).to_have_attribute("data-playing", "false")
    assert overview.evaluate("""e => [...e.querySelectorAll('.overview-motion')]
        .every(n => getComputedStyle(n).animationName === 'none' ||
                    getComputedStyle(n).animationPlayState === 'paused')""")
    page.get_by_role("button", name="Play system animation").click()
    expect(overview).to_have_attribute("data-playing", "true")
    assert overview.evaluate("""e => [...e.querySelectorAll('.overview-motion')]
        .every(n => getComputedStyle(n).animationPlayState === 'running')""")
    page.get_by_role("button", name="Pause system animation").click()

    for width in (1440, 1200, 1024, 901, 900, 768, 601, 600, 390, 360, 320):
        page.set_viewport_size({"width": width, "height": 1100})
        assert overview.evaluate("e => e.scrollWidth <= e.clientWidth + 1"), f"Overflow at {width}px"
        bounds = overview.bounding_box()
        shelves = overview.locator(".overview-shelf").all()
        for shelf in shelves:
            box = shelf.bounding_box()
            assert box["x"] >= bounds["x"] and box["x"] + box["width"] <= bounds["x"] + bounds["width"], (width, box)
            assert box["y"] + box["height"] <= bounds["y"] + bounds["height"], (width, "Shelf clipped")
            assert shelf.evaluate("e => [...e.querySelectorAll('.overview-tile')].every(n => n.scrollWidth <= n.clientWidth + 1)"), (width, "Tile text overflow")
        upper, lower = [shelf.bounding_box() for shelf in shelves]
        assert upper["y"] + upper["height"] < lower["y"], (width, "Layers overlap")

    page.set_viewport_size({"width": 1440, "height": 1100})
    overview.screenshot(path="/tmp/datamosaic-overview-desktop.png")
    page.get_by_role("button", name="Switch to dark mode").click()
    overview.screenshot(path="/tmp/datamosaic-overview-dark.png")
    page.get_by_role("button", name="Switch to light mode").click()
    page.set_viewport_size({"width": 390, "height": 1100})
    overview.screenshot(path="/tmp/datamosaic-overview-mobile.png")
    page.emulate_media(reduced_motion="reduce")
    expect(overview).to_have_attribute("data-playing", "false")
    expect(page.get_by_role("button", name="Play system animation")).to_be_hidden()
    assert overview.evaluate("e => [...e.querySelectorAll('*')].every(n => getComputedStyle(n).animationName === 'none')")
    page.reload()
    expect(overview).to_have_attribute("data-playing", "false")
    assert not errors, errors
    browser.close()

print("PASS: placement, 6 current modules, 5 existing links, animated flow, no chapters, pause/resume, responsive bounds, reduced motion, no JS errors")
