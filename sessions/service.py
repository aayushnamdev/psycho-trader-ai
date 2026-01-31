"""
Session service: Orchestrates complete psychoanalytic interaction flow.
Coordinates memory retrieval, AI interpretation, and memory formation.
"""

from sqlalchemy.orm import Session
from memory.service import MemoryService
from brain.interpreter import PsychoanalyticInterpreter


class SessionService:
    """
    Orchestrates complete interaction flow.
    This is where memory, brain, and session management come together.
    """
    
    def __init__(self, db: Session):
        """
        Initialize session service with database and AI components.
        
        Args:
            db: SQLAlchemy Session instance
        """
        self.memory_service = MemoryService(db)
        self.interpreter = PsychoanalyticInterpreter()
    
    async def process_user_input(
        self,
        user_input: str,
        user_id: str = "default_trader"
    ) -> str:
        """
        Complete psychoanalytic interaction flow.
        
        Flow:
        1. Retrieve memory context (case notes)
        2. Generate psychoanalytic response
        3. Extract new observations to remember
        4. Store interaction and memories
        5. Return response
        
        Args:
            user_input: Trader's message
            user_id: Unique trader identifier
            
        Returns:
            Psychoanalytic response as string
        """
        
        # Step 1: Build context from case notes
        context = self.memory_service.build_context_for_interaction(
            user_id=user_id,
            include_recent=5,    # Last 5 observations
            include_relevant=5   # Top 5 high-priority patterns
        )

        recent_sessions = self.memory_service.get_recent_interaction_context(
            user_id=user_id,
            limit=3  # Last 3 interactions for continuity
        )

        # Get relationship stats for context
        user = self.memory_service.repository.get_or_create_user(user_id)
        user_stats = self.memory_service.repository.get_user_relationship_stats(user.id)

        # Step 2: Generate emotionally connected response
        agent_response = self.interpreter.generate_response(
            user_input=user_input,
            recent_memories=context["recent"],
            relevant_memories=context["relevant"],
            recent_sessions=recent_sessions,
            trader_stats=user_stats
        )
        
        # Step 3: Extract observations worth remembering
        new_memories = self.interpreter.extract_memories(
            user_input=user_input,
            agent_response=agent_response,
            conversation_history=self._format_recent_context(recent_sessions)
        )
        
        # Step 4: Store new memories (if any)
        if new_memories:
            self.memory_service.batch_store_observations(
                user_id=user_id,
                observations=new_memories
            )
        
        # Step 5: Log interaction
        self.memory_service.log_interaction(
            user_id=user_id,
            user_input=user_input,
            agent_response=agent_response
        )

        # Step 6: Update relationship stats (streak, session count, etc.)
        user = self.memory_service.repository.get_or_create_user(user_id)
        self.memory_service.repository.update_user_stats(user.id)

        return agent_response

    async def generate_session_summary(self, user_id: str) -> str:
        """
        Generate end-of-session summary with insights.

        Args:
            user_id: Unique user identifier

        Returns:
            Closing summary with key themes and reflections
        """
        # Build context
        context = self.memory_service.build_context_for_interaction(
            user_id=user_id,
            include_recent=10,
            include_relevant=5
        )

        recent_sessions = self.memory_service.get_recent_interaction_context(
            user_id=user_id,
            limit=5
        )

        return self.interpreter.generate_session_summary(
            recent_memories=context["recent"],
            relevant_memories=context["relevant"],
            recent_sessions=recent_sessions
        )
    
    def _format_recent_context(self, recent_sessions: list) -> str:
        """
        Format recent sessions into readable context string.
        
        Args:
            recent_sessions: List of recent interaction dictionaries
            
        Returns:
            Formatted conversation history
        """
        if not recent_sessions:
            return ""
        
        formatted = []
        for session in recent_sessions[-2:]:  # Only last 2 for brevity
            formatted.append(f"Trader: {session['user_input']}")
            formatted.append(f"You: {session['agent_response']}")
        
        return "\n".join(formatted)


async def process_user_input(user_input: str, user_id: str = "default_user") -> str:
    """
    Standalone function for backward compatibility with controller.

    This will be updated to use dependency injection in production.
    For now, creates its own DB session.

    Args:
        user_input: User's message
        user_id: Unique user identifier

    Returns:
        Psychoanalytic response
    """
    from db.connection import SessionLocal

    db = SessionLocal()
    try:
        service = SessionService(db)
        return await service.process_user_input(user_input, user_id)
    finally:
        db.close()


async def generate_session_summary(user_id: str) -> str:
    """
    Standalone function for generating session summary.

    Args:
        user_id: Unique user identifier

    Returns:
        Session summary
    """
    from db.connection import SessionLocal

    db = SessionLocal()
    try:
        service = SessionService(db)
        return await service.generate_session_summary(user_id)
    finally:
        db.close()
    async def process_coach_input(self, user_input: str, user_id: str) -> str:
        """
        Process input with life coach persona.

        Args:
            user_input: User's message
            user_id: Unique user identifier

        Returns:
            Life coach response
        """
        from brain.coach_prompts import LIFE_COACH_SYSTEM_PROMPT, build_coach_context
        from sessions.dashboard_controller import get_areas_to_work_on
        from db.connection import get_db

        # Build context
        context = self.memory_service.build_context_for_interaction(
            user_id=user_id,
            include_recent=5,
            include_relevant=5
        )

        # Get areas to work on
        # We need to call the endpoint logic directly
        user = self.memory_service.repository.get_or_create_user(user_id)
        memories = self.memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        # Group by category
        category_groups = {}
        for mem in memories:
            if mem.category:
                if mem.category not in category_groups:
                    category_groups[mem.category] = []
                category_groups[mem.category].append(mem)

        # Identify struggle categories
        struggle_categories = [
            'fear_patterns', 'recurring_struggle', 'self_worth_conflict',
            'shame_dynamics', 'defense_mechanisms', 'control_seeking'
        ]

        areas_to_work_on = []
        for category, mems in category_groups.items():
            if category in struggle_categories and len(mems) >= 3:
                areas_to_work_on.append({
                    'title': category.replace('_', ' ').title(),
                    'description': f'This theme has appeared {len(mems)} times in your reflections',
                    'frequency': len(mems)
                })

        areas_to_work_on.sort(key=lambda x: x['frequency'], reverse=True)
        areas_to_work_on = areas_to_work_on[:3]

        # Build coach-specific context
        coach_context = build_coach_context(
            context["recent"],
            context["relevant"],
            areas_to_work_on
        )

        # Generate response with coach prompt
        full_prompt = f"""{LIFE_COACH_SYSTEM_PROMPT}

CONTEXT:
{coach_context}

---

USER: {user_input}

Respond as their life coach. Be warm but willing to challenge."""

        response = self.interpreter.client.responses.create(
            model=self.interpreter.model,
            input=full_prompt
        )

        # Extract and store
        response_text = self.interpreter._extract_response_text(response)

        # Log as coach session
        self.memory_service.log_interaction(
            user_id=user_id,
            user_input=user_input,
            agent_response=response_text
        )

        # Update stats
        self.memory_service.repository.update_user_stats(user.id)

        return response_text
