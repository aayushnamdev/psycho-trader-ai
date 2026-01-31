"""
Capture screenshots of the application for documentation.
"""
import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "screenshots")
BASE_URL = "http://localhost:3000"

async def capture_screenshots():
    """Capture all required screenshots."""

    # Ensure screenshots directory exists
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2  # Retina/HiDPI
        )
        page = await context.new_page()

        print("🎬 Starting screenshot capture...")

        try:
            # 1. Welcome/Empty State
            print("\n📸 Capturing welcome state...")
            await page.goto(f"{BASE_URL}/coach/chat")
            await page.wait_for_timeout(2000)  # Wait for animations
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "welcome-state.png"),
                full_page=False
            )
            print("   ✓ welcome-state.png saved")

            # 2. Enter demo user ID
            print("\n📸 Setting up demo user...")
            # Look for auth input and enter demo_trader
            try:
                # Click on any input field that might be for user ID
                await page.fill('input[type="text"]', 'demo_trader')
                await page.wait_for_timeout(500)
                # Try to submit or continue
                await page.keyboard.press('Enter')
                await page.wait_for_timeout(1000)
            except:
                print("   ⚠ Skipping auth (may already be logged in)")

            # 3. Chat Interface with conversation
            print("\n📸 Capturing chat interface...")
            await page.goto(f"{BASE_URL}/coach/chat")
            await page.wait_for_timeout(2000)

            # Take screenshot of chat
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "chat-interface.png"),
                full_page=False
            )
            print("   ✓ chat-interface.png saved")

            # 4. Patterns Dashboard
            print("\n📸 Capturing patterns dashboard...")
            await page.goto(f"{BASE_URL}/patterns")
            await page.wait_for_timeout(2000)
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "patterns-dashboard.png"),
                full_page=True  # Capture full page
            )
            print("   ✓ patterns-dashboard.png saved")

            # 5. Analytics View
            print("\n📸 Capturing analytics view...")
            await page.goto(f"{BASE_URL}/analytics")
            await page.wait_for_timeout(2000)
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "analytics-view.png"),
                full_page=True
            )
            print("   ✓ analytics-view.png saved")

            # 6. Achievements (zoom to achievements section)
            print("\n📸 Capturing achievements section...")
            # Try to find and focus on achievements
            try:
                achievements_section = await page.query_selector('text=Achievements')
                if achievements_section:
                    await achievements_section.scroll_into_view_if_needed()
                    await page.wait_for_timeout(500)
            except:
                pass

            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "achievements.png"),
                full_page=False
            )
            print("   ✓ achievements.png saved")

            print("\n✅ All screenshots captured successfully!")
            print(f"📁 Saved to: {SCREENSHOTS_DIR}")

        except Exception as e:
            print(f"\n❌ Error capturing screenshots: {e}")
            print("\nMake sure:")
            print("  1. Backend is running: uvicorn app:app --reload")
            print("  2. Frontend is running: cd frontend && npm run dev")
            print("  3. App is accessible at http://localhost:3000")

        finally:
            await browser.close()

if __name__ == "__main__":
    print("🎯 Screenshot Capture Tool")
    print("=" * 50)
    asyncio.run(capture_screenshots())
