"""
Create a test user with demo conversations for screenshots.
"""
import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sessions.service import process_user_input

async def create_test_user():
    """Create test user with realistic conversations."""

    # Generate unique test user ID
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_user_id = f"portfolio_demo_{timestamp}"

    print(f"🎯 Creating test user: {test_user_id}")
    print("=" * 60)

    # Realistic trading psychology conversations
    conversations = [
        "I closed my winning trade too early again. Why do I keep doing this?",
        "Today I hesitated on a perfect setup and missed the entry. This fear is killing me.",
        "I notice I get anxious right before clicking the buy button",
        "When I'm up on a trade, I panic and take profits too soon",
        "I think I'm more afraid of success than failure",
    ]

    for i, message in enumerate(conversations, 1):
        print(f"\n[{i}/{len(conversations)}] User: {message}")
        try:
            response = await process_user_input(message, test_user_id)
            print(f"Assistant: {response[:120]}...")
        except Exception as e:
            print(f"Error: {e}")

        await asyncio.sleep(0.3)

    print("\n" + "=" * 60)
    print(f"✅ Test user created successfully!")
    print(f"\n📝 USER ID: {test_user_id}")
    print("\nUse this ID for screenshots and testing.")

    return test_user_id

if __name__ == "__main__":
    user_id = asyncio.run(create_test_user())
