from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the registration page and take a screenshot
    print("Navigating to registration page...")
    page.goto("http://localhost:3000/auth/register", timeout=60000)
    page.wait_for_load_state()
    print("Registration page loaded.")
    page.screenshot(path="jules-scratch/verification/register_page.png")

    # Fill out the registration form and submit
    page.fill('input[type="text"]', "Test User")
    page.fill('input[type="email"]', "test@example.com")
    page.fill('input[type="password"]', "password")
    with page.expect_navigation():
        page.click('button[type="submit"]')

    # The registration should redirect to the login page
    print("Registration submitted. Current URL:", page.url)
    page.wait_for_load_state()
    print("Login page loaded.")
    page.screenshot(path="jules-scratch/verification/login_page.png")

    # Fill out the login form
    page.fill('input[type="email"]', "test@example.com")
    page.fill('input[type="password"]', "password")
    with page.expect_navigation():
        page.click('button[type="submit"]')

    print("Login submitted. Current URL:", page.url)

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
