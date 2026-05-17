from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 812})
    page = context.new_page()

    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
    page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err.message}"))

    # Test via localhost
    print("=== Testing via localhost ===")
    page.goto("http://localhost:3000/detect")
    page.wait_for_load_state("networkidle")

    modal = page.locator("text=隐私保护声明")
    print(f"Modal visible: {modal.is_visible()}")

    accept_btn = page.locator("button:has-text('同意并继续')")
    decline_btn = page.locator("button:has-text('暂不使用')")
    print(f"Accept btn visible: {accept_btn.is_visible()}")
    print(f"Decline btn visible: {decline_btn.is_visible()}")

    if decline_btn.is_visible():
        decline_btn.click()
        page.wait_for_timeout(1500)
        print(f"After decline - modal visible: {page.locator('text=隐私保护声明').is_visible()}")

    page.goto("http://localhost:3000/detect")
    page.wait_for_load_state("networkidle")
    accept_btn2 = page.locator("button:has-text('同意并继续')")
    if accept_btn2.is_visible():
        accept_btn2.click()
        page.wait_for_timeout(2000)
        print(f"After accept - modal visible: {page.locator('text=隐私保护声明').is_visible()}")
        cam_btn = page.locator("button:has-text('开启摄像头')")
        stop_btn = page.locator("button:has-text('关闭摄像头')")
        print(f"'开启摄像头' visible: {cam_btn.is_visible()}")
        print(f"'关闭摄像头' visible: {stop_btn.is_visible()}")

    print(f"\nConsole ({len(errors)}):")
    for e in errors[-5:]:
        print(f"  {e}")

    browser.close()
