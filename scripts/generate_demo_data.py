"""
Generate demo data for portfolio screenshots.
Creates realistic conversation patterns and insights.
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sessions.service import process_user_input

async def generate_demo_conversations():
    """Generate realistic demo conversations."""

    demo_user = "demo_trader"

    conversations = [
        "I keep hesitating on trades even when my setup is perfect",
        "I took a loss today and now I'm feeling scared to enter my next trade",
        "I notice I get really anxious right before placing an order",
        "Today I waited too long and missed my entry. This happens a lot.",
        "I'm afraid of being wrong. It's like I need to be perfect.",
        "I think I'm more scared of missing out than losing money",
        "When I'm up on a trade, I close it too early because I'm worried it'll reverse",
        "I feel like I sabotage myself right when things are going well",
        "My dad always said I never finish what I start. Maybe that's why I cut winners early.",
        "I notice when I'm stressed about work, my trading gets worse",
    ]

    print("Generating demo conversations...")
    for i, message in enumerate(conversations, 1):
        print(f"\n[{i}/{len(conversations)}] User: {message}")
        try:
            response = await process_user_input(message, demo_user)
            print(f"Assistant: {response[:100]}...")
        except Exception as e:
            print(f"Error: {e}")

        # Small delay between messages
        await asyncio.sleep(0.5)

    print("\n✓ Demo data generated successfully!")
    print(f"Check the dashboard for user: {demo_user}")

if __name__ == "__main__":
    asyncio.run(generate_demo_conversations())
