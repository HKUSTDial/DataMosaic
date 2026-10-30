"""With Playwright installed and Vite preview running:
python3 -P tests/system-overview.browser.py http://127.0.0.1:21680
"""
import sys

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
    assert overview.locator(".overview-tile").count() == 16
    assert overview.locator("a").count() == 3
    assert overview.locator(".overview-future").count() == 13
    assert overview.locator(".overview-future a, .overview-future button").count() == 0
    for name, href in (("DocMosaic", "/docmosaic/"), ("DBMosaic", "/dbmosaic/"),
                       ("OntoMosaic-DB", "/ontomosaic-text2sql")):
        expect(overview.get_by_role("link", name=f"Explore {name}", exact=True)).to_have_attribute("href", href)
    expect(overview.get_by_text("More apps to come")).to_be_visible()
    expect(overview.get_by_text("More domains to come")).to_be_visible()
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

    page.emulate_media(reduced_motion="reduce")
    expect(overview).to_have_attribute("data-playing", "false")
    expect(page.get_by_role("button", name="Play system animation")).to_be_hidden()
    assert overview.evaluate("e => [...e.querySelectorAll('*')].every(n => getComputedStyle(n).animationName === 'none')")
    page.reload()
    expect(overview).to_have_attribute("data-playing", "false")
    assert not errors, errors
    browser.close()

print("PASS: placement, 16 tiles, 3 real links, future concepts, no chapters, pause/resume, responsive bounds, reduced motion, no JS errors")
