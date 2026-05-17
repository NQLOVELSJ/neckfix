from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 812}, ignore_https_errors=True)
    page = context.new_page()

    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error",) else None)
    page.on("pageerror", lambda err: errors.append(f"[PAGE ERROR] {err.message}"))

    # Test via ngrok
    url = "https://five-levitate-cupbearer.ngrok-free.dev/detect"
    print(f"=== Testing via ngrok: {url} ===")
    page.goto(url)
    page.wait_for_load_state("networkidle")

    # Check for ngrok interstitial
    content = page.content()
    if "Visit Site" in content or "ngrok" in content.lower():
        print("Found ngrok interstitial, clicking through...")
        visit_btn = page.locator("button:has-text('Visit Site')")
        if visit_btn.is_visible():
            visit_btn.click()
            page.wait_for_timeout(2000)
            page.wait_for_load_state("networkidle")

    page.screenshot(path="/tmp/ngrok_detect.png", full_page=True)
    modal = page.locator("text=隐私保护声明")
    print(f"Modal visible: {modal.is_visible()}")

    accept_btn = page.locator("button:has-text('同意并继续')")
    decline_btn = page.locator("button:has-text('暂不使用')")
    print(f"Accept btn visible: {accept_btn.is_visible()}")
    print(f"Decline btn visible: {decline_btn.is_visible()}")

    if accept_btn.is_visible():
        accept_btn.click()
        page.wait_for_timeout(2000)
        new_modal = page.locator("text=隐私保护声明")
        print(f"After accept click - modal visible: {new_modal.is_visible()}")
        page.screenshot(path="/tmp/ngrok_after_accept.png", full_page=True)

    print(f"\nConsole errors ({len(errors)}):")
    for e in errors[-10:]:
        print(f"  {e}")

    browser.close()
