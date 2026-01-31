"""
Psychoanalytic interpreter: Core AI orchestration.
Manages OpenAI interactions with psychoanalytic framing.
"""

import os
import json
from typing import Dict, List, Optional
from openai import OpenAI
from brain.prompts import (
    SYSTEM_PROMPT,
    build_context_prompt,
    build_user_prompt,
    MEMORY_EXTRACTION_PROMPT
)


class PsychoanalyticInterpreter:
    """
    Core interpretation engine for psychoanalytic AI.
    Orchestrates OpenAI calls with proper persona and context.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize interpreter with OpenAI client.

        Args:
            api_key: OpenAI API key (defaults to env variable)
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-5-mini"  # Main chat - GPT-5 mini via Responses API
        self.model_advanced = "gpt-4o"  # Pattern analysis - Chat Completions
        self.model_light = "gpt-4o-mini"  # Memory extraction - Chat Completions

    def generate_response(
        self,
        user_input: str,
        recent_memories: List = None,
        relevant_memories: List = None,
        recent_sessions: List = None,
        trader_stats: dict = None
    ) -> str:
        """
        Generate emotionally connected response using GPT-5 mini via Responses API.

        Args:
            user_input: Current message from the person
            recent_memories: Recent observations
            relevant_memories: High-relevance emotional moments
            recent_sessions: Recent interaction history
            trader_stats: Relationship statistics (days, streak, etc.)

        Returns:
            Warm, validating response as string
        """
        # Build context with relationship info
        context = build_context_prompt(
            recent_memories or [],
            relevant_memories or [],
            recent_sessions or [],
            trader_stats
        )

        # Check interaction state
        is_first = not recent_memories and not relevant_memories and not recent_sessions
        is_returning = not is_first and recent_sessions and len(recent_sessions) > 0

        # Build complete prompt
        user_prompt = build_user_prompt(user_input, context, is_first, is_returning)

        # Call OpenAI using Responses API for GPT-5 mini
        # Combine system prompt and user prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\n---\n\n{user_prompt}"

        try:
            response = self.client.responses.create(
                model=self.model,
                input=full_prompt,
            )

            # Debug: print response structure
            print(f"Response type: {type(response)}")
            print(f"Response: {response}")

            # Try different ways to get the text
            if hasattr(response, 'output_text') and response.output_text:
                return response.output_text.strip()

            if hasattr(response, 'output') and response.output:
                output_text = ""
                for item in response.output:
                    if hasattr(item, "content"):
                        for content in item.content:
                            if hasattr(content, "text"):
                                output_text += content.text
                    elif hasattr(item, "text"):
                        output_text += item.text
                return output_text.strip() if output_text else ""

            # Fallback: try to access as dict
            if hasattr(response, 'model_dump'):
                resp_dict = response.model_dump()
                print(f"Response dict: {resp_dict}")

            return ""
        except Exception as e:
            print(f"GPT-5 mini API Error: {e}")
            raise e

    def extract_memories(
        self,
        user_input: str,
        agent_response: str,
        conversation_history: Optional[str] = None
    ) -> List[Dict]:
        """
        Extract psychoanalytic observations worth storing as memories.

        This is a separate AI call that decides what's worth remembering.
        Not every interaction generates a memory.

        Args:
            user_input: What trader said
            agent_response: What agent responded
            conversation_history: Optional additional context

        Returns:
            List of memory dictionaries to store
        """
        # Build extraction prompt
        extraction_context = f"""TRADER MESSAGE:
{user_input}

YOUR RESPONSE:
{agent_response}"""

        if conversation_history:
            extraction_context += f"\n\nPRIOR CONTEXT:\n{conversation_history}"

        extraction_prompt = f"{extraction_context}\n\n{MEMORY_EXTRACTION_PROMPT}"

        # Call OpenAI for memory extraction (using Chat Completions for gpt-4o-mini)
        response = self.client.chat.completions.create(
            model=self.model_light,
            messages=[
                {"role": "system", "content": "You are a relationship-building memory specialist. You remember things that help build deeper connections with people."},
                {"role": "user", "content": extraction_prompt}
            ],
            temperature=0.3,
            max_tokens=700,
        )

        # Parse JSON response
        try:
            content = response.choices[0].message.content.strip()
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()
            elif content.startswith("```"):
                content = content.split("```")[1].split("```")[0].strip()

            memories = json.loads(content)
            return memories if isinstance(memories, list) else []
        except (json.JSONDecodeError, IndexError) as e:
            print(f"Memory extraction parsing error: {e}")
            return []

    def interpret_pattern(
        self,
        pattern_category: str,
        pattern_history: List,
        current_context: str
    ) -> str:
        """
        Generate meta-interpretation of a recurring behavioral pattern.

        Args:
            pattern_category: Type of pattern (e.g., "loss_aversion")
            pattern_history: All memories in this category
            current_context: Current situation where pattern appeared

        Returns:
            Deeper interpretation of pattern evolution
        """
        pattern_summary = "\n".join([
            f"- {mem.observation}" + (f" → {mem.interpretation}" if mem.interpretation else "")
            for mem in pattern_history
        ])

        prompt = f"""You've noticed a recurring pattern in this trader's behavior.

PATTERN TYPE: {pattern_category}

HISTORICAL OBSERVATIONS:
{pattern_summary}

CURRENT SITUATION:
{current_context}

Provide a brief meta-interpretation (2-3 sentences) about what this pattern might reveal about the trader's deeper relationship with trading, risk, or self. Focus on the psychological dimension, not trading advice."""

        # gpt-4o for pattern analysis (Chat Completions)
        response = self.client.chat.completions.create(
            model=self.model_advanced,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    def generate_session_summary(
        self,
        recent_memories: List = None,
        relevant_memories: List = None,
        recent_sessions: List = None
    ) -> str:
        """
        Generate end-of-session summary with insights.

        Args:
            recent_memories: Recent observations
            relevant_memories: High-relevance patterns
            recent_sessions: Recent conversation history

        Returns:
            Closing summary with key themes and reflections
        """
        # Build context for summary
        session_context = []

        if recent_sessions:
            session_context.append("TODAY'S CONVERSATION:")
            for session in recent_sessions[:3]:
                session_context.append(f"You: {session.get('user_input', '')[:150]}")
                session_context.append(f"Me: {session.get('agent_response', '')[:150]}")

        if relevant_memories:
            session_context.append("\nKEY PATTERNS:")
            for mem in relevant_memories[:5]:
                session_context.append(f"  - {mem.observation}")

        context_str = "\n".join(session_context) if session_context else "Brief check-in."

        summary_prompt = f"""{SYSTEM_PROMPT}

Based on our conversation today, provide a brief closing summary:

1. Key themes that came up
2. Any patterns or insights worth noting
3. One or two things to reflect on

Keep it concise and grounded. 2-3 paragraphs max.

End with a warm closing like: "Take care. Looking forward to our next conversation."

{context_str}

Generate the summary:"""

        try:
            response = self.client.responses.create(
                model=self.model,
                input=summary_prompt
            )

            return self._extract_response_text(response)
        except Exception as e:
            print(f"Session summary error: {e}")
            return "Thanks for sharing today. Take care, and looking forward to our next conversation."

    def _extract_response_text(self, response) -> str:
        """Extract text from Responses API response."""
        if hasattr(response, 'output_text') and response.output_text:
            return response.output_text.strip()

        if hasattr(response, 'output') and response.output:
            output_text = ""
            for item in response.output:
                if hasattr(item, "content"):
                    for content in item.content:
                        if hasattr(content, "text"):
                            output_text += content.text
                elif hasattr(item, "text"):
                    output_text += item.text
            return output_text.strip() if output_text else ""

        return ""
