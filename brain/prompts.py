"""
Psychoanalytic prompts and persona definitions.
Direct, grounded approach for self-reflection and growth.
"""

SYSTEM_PROMPT = """You're a perceptive friend who understands human psychology. Been there, seen the patterns, keeps it real.

CORE IDENTITY:
Not a therapist. Not a formal coach. Just a thoughtful friend who notices things and asks good questions. Direct but compassionate.

RESPONSE STYLE:
- 2-3 short paragraphs max
- Conversational, like texting a friend
- Vary your openings - don't start every response the same way
- Get to the point fast
- Ask ONE good question, not multiple

VARY YOUR RESPONSES:
Don't always start with "So..." or similar filler. Mix it up:
- Jump straight into a reaction: "That's actually pretty common when..."
- Start with a question: "What happened right before that?"
- Make an observation: "Interesting - that's different from what you said about..."
- Be direct: "Yeah, that's a pattern."

DO:
- Notice patterns and point them out
- Reference past conversations naturally (if relevant)
- Ask questions that dig deeper
- Give your honest take
- Keep it casual

DON'T:
- Use therapy-speak ("I hear you", "That must be hard", "I'm here for you")
- Over-comfort or validate excessively
- Ask multiple questions in one response
- Lecture or give unsolicited advice
- Start every response the same way

WHEN THEY SHARE SOMETHING TOUGH:
Quick acknowledgment, then get curious:
- "That's hard. What triggered that?"
- "Yeah, that's rough. What are you thinking about doing?"
- "Makes sense. What's your gut telling you?"

REMEMBER:
Be the friend who actually pays attention and asks the questions that matter."""


def build_context_prompt(
    recent_memories: list,
    relevant_memories: list,
    recent_sessions: list,
    user_stats: dict = None
) -> str:
    """
    Build context section for continuity.

    Args:
        recent_memories: Recent observations about the person
        relevant_memories: High-relevance moments
        recent_sessions: Recent interaction history
        user_stats: Relationship statistics

    Returns:
        Formatted context
    """
    context_parts = []

    # Relationship context
    if user_stats and user_stats.get("days_together", 0) > 0:
        days = user_stats.get("days_together", 0)
        sessions = user_stats.get("total_sessions", 0)
        streak = user_stats.get("current_streak", 0)

        context_parts.append("HISTORY:")
        if days == 1:
            context_parts.append("  First day talking.")
        else:
            context_parts.append(f"  {days} days, {sessions} conversations.")
        if streak > 1:
            context_parts.append(f"  {streak} day streak - they keep coming back.")

    # People they've mentioned
    people_mentioned = set()
    for mem in recent_memories + relevant_memories:
        if mem is None:
            continue
        if hasattr(mem, 'people_mentioned') and mem.people_mentioned:
            try:
                import json
                people = json.loads(mem.people_mentioned) if isinstance(mem.people_mentioned, str) else mem.people_mentioned
                people_mentioned.update(people)
            except (json.JSONDecodeError, TypeError):
                pass

    if people_mentioned:
        context_parts.append("\nPEOPLE THEY'VE MENTIONED:")
        for person in list(people_mentioned)[:5]:
            context_parts.append(f"  - {person}")

    # Key things about them
    identity_statements = [m for m in relevant_memories if m and hasattr(m, 'is_identity_statement') and m.is_identity_statement]
    if identity_statements:
        context_parts.append("\nTHINGS THEY'VE SAID ABOUT THEMSELVES:")
        for mem in identity_statements[:3]:
            if mem and hasattr(mem, 'observation'):
                context_parts.append(f"  - {mem.observation}")

    # Follow-up opportunities
    follow_ups = [m for m in recent_memories if m and hasattr(m, 'follow_up_question') and m.follow_up_question]
    if follow_ups:
        context_parts.append("\nCOULD FOLLOW UP ON:")
        for mem in follow_ups[:3]:
            if mem and hasattr(mem, 'follow_up_question'):
                context_parts.append(f"  - {mem.follow_up_question}")

    # Patterns and themes
    if relevant_memories:
        context_parts.append("\nPATTERNS/THEMES:")
        category_map = {
            'relationship_dynamics': 'Relationships',
            'self_worth': 'Self-worth stuff',
            'fear_patterns': 'Fears/worries',
            'recurring_struggle': 'Ongoing challenges',
            'identity': 'Identity',
            'breakthrough_moment': 'Realizations',
            'life_transition': 'Life changes',
            'support_system': 'Support system',
            'loss_aversion': 'Loss aversion',
            'control_seeking': 'Control issues',
            'self_worth_conflict': 'Self-worth',
            'attachment_anxiety': 'Attachment stuff',
            'defense_mechanisms': 'Defense patterns',
            'repetition_compulsion': 'Repeating patterns',
            'authority_conflict': 'Authority issues',
            'shame_dynamics': 'Shame stuff',
        }
        for mem in relevant_memories[:5]:
            if not mem or not hasattr(mem, 'observation'):
                continue
            category_label = ""
            if hasattr(mem, 'category') and mem.category:
                category_label = f"[{category_map.get(mem.category, mem.category.replace('_', ' '))}] "
            context_parts.append(f"  - {category_label}{mem.observation}")

    # Recent context
    if recent_sessions:
        context_parts.append("\nRECENT CONTEXT:")
        for session in recent_sessions[-2:]:
            context_parts.append(f"  - {session['user_input'][:100]}...")

    if not context_parts:
        return "First conversation. No history yet."

    return "\n".join(context_parts)


def build_user_prompt(user_input: str, context: str, is_first_interaction: bool = False, is_returning: bool = False) -> str:
    """
    Build the complete user prompt.

    Args:
        user_input: Current message from the person
        context: Formatted context
        is_first_interaction: First ever interaction
        is_returning: Returning after a break

    Returns:
        Complete prompt
    """

    if is_first_interaction:
        return f"""First conversation.

THEY SAID: {user_input}

Respond naturally. Get curious about what's going on. Ask ONE question that shows genuine interest.

Keep it short (2-3 paragraphs). Be direct, not therapeutic."""

    if is_returning:
        return f"""CONTEXT:
{context}

---

THEY SAID: {user_input}

If past context is relevant, mention it naturally. Otherwise, just respond to what they said.

Short response. One question max."""

    return f"""CONTEXT:
{context}

---

THEY SAID: {user_input}

Respond directly to what they said. If you see patterns or connections to past stuff, mention them naturally. Ask ONE good question.

Keep it conversational and short."""


MEMORY_EXTRACTION_PROMPT = """Based on the conversation, note what's worth remembering for future context.

Think like a friend who pays attention - what would you actually remember about this person?

Output a JSON array. Each item can have:
- "observation": What to remember (keep it brief)
- "interpretation": Why it might matter (optional)
- "category": One of: "relationship_dynamics", "self_worth", "fear_patterns", "recurring_struggle", "identity", "breakthrough_moment", "life_transition", "support_system", "control_seeking", "shame_dynamics", "defense_mechanisms", "self_worth_conflict" (optional)
- "relevance_score": 1-10 (how important?)
- "follow_up_question": Something to ask about later (optional)
- "people_mentioned": Names/relationships mentioned, e.g. ["partner Alex", "friend Jordan"] (optional)
- "is_identity_statement": True if they said something about who they are (optional)
- "is_breakthrough_moment": True if they had a realization (optional)

WORTH REMEMBERING:
- People they mention
- Patterns in their thoughts and behaviors
- How they see themselves
- What's stressing them out
- Insights or realizations they have
- Major life stuff happening

NOT WORTH REMEMBERING:
- Generic small talk
- Stuff without substance
- Things anyone would say

Example:
[
  {
    "observation": "Keeps overcommitting even though they know it leads to burnout",
    "interpretation": "Pattern of people-pleasing at own expense",
    "category": "recurring_struggle",
    "relevance_score": 8,
    "follow_up_question": "How's your workload been? Curious if that pattern showed up again"
  },
  {
    "observation": "Hasn't told their partner about the anxiety they've been feeling",
    "category": "relationship_dynamics",
    "relevance_score": 7,
    "people_mentioned": ["partner"]
  }
]

If nothing substantial came up, return empty array: []

Output JSON only:"""
