"""
Capture 3 screenshots: Chat, Analytics, Patterns
With actual chat conversation visible
"""
import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "screenshots")
BASE_URL = "http://localhost:3000"
USER_ID = "portfolio_demo_20260131_152020"

async def capture_screenshots():
    """Capture 3 key screenshots."""

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Show browser for debugging
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2
        )
        page = await context.new_page()

        print(f"🎬 Capturing screenshots for user: {USER_ID}")
        print("=" * 60)

        try:
            # Set auth
            print("\n🔐 Setting up authentication...")
            await page.goto(BASE_URL)
            await page.wait_for_timeout(1000)
            await page.evaluate(f"""
                localStorage.setItem('reflection_user_id', '{USER_ID}');
            """)
            print(f"   ✓ Set user ID in localStorage")

            # Go to chat and send a message to populate conversation
            print("\n💬 Loading chat with conversation...")
            await page.goto(f"{BASE_URL}/coach/chat")
            await page.wait_for_timeout(2000)

            # Type a message
            print("   Sending test message...")
            textarea = page.locator('textarea')
            await textarea.fill("Show me my trading patterns")
            await page.wait_for_timeout(500)

            # Click send button
            send_button = page.locator('button:has(svg)')  # Button with Send icon
            await send_button.last.click()

            # Wait for response
            print("   Waiting for AI response...")
            # Wait for loading indicator to disappear
            try:
                await page.wait_for_selector('text=Working on it...', state='hidden', timeout=20000)
                await page.wait_for_timeout(1000)  # Extra second for animations
            except:
                await page.wait_for_timeout(15000)  # Fallback

            # Screenshot 1: Chat Interface with conversation
            print("\n📸 1/3 Capturing chat interface with conversation...")
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "chat-interface.png"),
                full_page=False
            )
            print("   ✓ chat-interface.png")

            # Screenshot 2: Patterns
            print("\n📸 2/3 Capturing patterns page...")
            await page.goto(f"{BASE_URL}/patterns")
            await page.wait_for_timeout(3000)
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "patterns-dashboard.png"),
                full_page=True
            )
            print("   ✓ patterns-dashboard.png")

            # Screenshot 3: Analytics
            print("\n📸 3/3 Capturing analytics page...")
            await page.goto(f"{BASE_URL}/analytics")
            await page.wait_for_timeout(3000)
            await page.screenshot(
                path=os.path.join(SCREENSHOTS_DIR, "analytics-view.png"),
                full_page=True
            )
            print("   ✓ analytics-view.png")

            print("\n" + "=" * 60)
            print("✅ All 3 screenshots captured!")
            print(f"📁 Saved to: {SCREENSHOTS_DIR}")
            print(f"\n👤 User ID: {USER_ID}")

            print("\nPress Ctrl+C to close browser...")
            await page.wait_for_timeout(3000)

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
