"""
Memory service: Business logic for memory formation and retrieval.
Orchestrates case note creation, pattern recognition, and context building.
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from memory.repository import MemoryRepository
from db.models import Memory


class MemoryService:
    """
    Service layer for psychoanalytic memory operations.
    Handles when and how memories are formed, retrieved, and prioritized.
    """
    
    def __init__(self, db: Session):
        """
        Initialize memory service with database session.
        
        Args:
            db: SQLAlchemy Session instance
        """
        self.repository = MemoryRepository(db)
    
    # ==================== MEMORY FORMATION ====================
    
    def store_observation(
        self,
        user_id: str,
        observation: str,
        interpretation: Optional[str] = None,
        category: Optional[str] = None,
        relevance_score: int = 5
    ) -> Memory:
        """
        Store a psychoanalytic observation about the user.
        This is NOT a chat log—it's a case note.
        
        Args:
            user_id: Unique trader identifier
            observation: What was noticed in the interaction
            interpretation: Psychoanalytic meaning or pattern
            category: Pattern type (e.g., "risk_avoidance", "overconfidence")
            relevance_score: Priority for future retrieval (1-10)
            
        Returns:
            Created Memory instance
        """
        user = self.repository.get_or_create_user(user_id)
        
        return self.repository.create_memory(
            user_id=user.id,
            observation=observation,
            interpretation=interpretation,
            category=category,
            relevance_score=relevance_score
        )
    
    def batch_store_observations(
        self,
        user_id: str,
        observations: List[Dict[str, any]]
    ) -> List[Memory]:
        """
        Store multiple observations at once.
        Useful when AI generates multiple insights from single interaction.

        Args:
            user_id: Unique user identifier
            observations: List of observation dictionaries with keys:
                - observation (required)
                - interpretation (optional)
                - category (optional)
                - relevance_score (optional, default 5)
                - follow_up_question (optional)
                - people_mentioned (optional, list)
                - is_identity_statement (optional, bool)
                - is_breakthrough_moment (optional, bool)

        Returns:
            List of created Memory instances
        """
        import json

        user = self.repository.get_or_create_user(user_id)
        memories = []

        for obs in observations:
            # Handle people_mentioned - convert list to JSON string
            people = obs.get("people_mentioned")
            people_json = json.dumps(people) if isinstance(people, list) else people

            # Skip if observation is missing
            if not obs.get("observation"):
                continue

            memory = self.repository.create_memory(
                user_id=user.id,
                observation=obs.get("observation"),
                interpretation=obs.get("interpretation"),
                category=obs.get("category"),
                relevance_score=obs.get("relevance_score", 5),
                follow_up_question=obs.get("follow_up_question"),
                people_mentioned=people_json,
                is_identity_statement=obs.get("is_identity_statement", False),
                is_breakthrough_moment=obs.get("is_breakthrough_moment", False)
            )
            if memory:
                memories.append(memory)

        return memories
    
    # ==================== CONTEXT RETRIEVAL ====================
    
    def build_context_for_interaction(
        self,
        user_id: str,
        include_recent: int = 5,
        include_relevant: int = 5
    ) -> Dict[str, List[Memory]]:
        """
        Build psychoanalytic context for current interaction.
        Combines recent observations with high-relevance patterns.

        This is like a counselor reviewing case notes before a session.

        Args:
            user_id: Unique user identifier
            include_recent: Number of recent memories to include
            include_relevant: Number of high-relevance memories to include

        Returns:
            Dictionary with 'recent' and 'relevant' memory lists
        """
        user = self.repository.get_or_create_user(user_id)
        
        recent_memories = self.repository.get_recent_memories(
            user_id=user.id,
            limit=include_recent
        )
        
        relevant_memories = self.repository.get_relevant_memories(
            user_id=user.id,
            min_relevance=7,  # High-priority patterns only
            limit=include_relevant
        )
        
        return {
            "recent": recent_memories,
            "relevant": relevant_memories
        }
    
    def get_pattern_history(
        self,
        user_id: str,
        category: str
    ) -> List[Memory]:
        """
        Retrieve all observations for a specific behavioral pattern.
        Useful for tracking pattern evolution over time.

        Args:
            user_id: Unique user identifier
            category: Pattern category to retrieve

        Returns:
            List of Memory instances for that category
        """
        user = self.repository.get_or_create_user(user_id)
        
        return self.repository.get_memories_by_category(
            user_id=user.id,
            category=category
        )
    
    # ==================== MEMORY MANAGEMENT ====================
    
    def mark_memory_as_significant(self, memory_id: int) -> Optional[Memory]:
        """
        Elevate a memory's importance when pattern recurs.
        Like highlighting a key passage in case notes.
        
        Args:
            memory_id: Database ID of memory to promote
            
        Returns:
            Updated Memory instance or None if not found
        """
        return self.repository.update_memory_relevance(memory_id, new_score=9)
    
    def decay_memory_relevance(self, memory_id: int, decay_amount: int = 1) -> Optional[Memory]:
        """
        Reduce relevance of older memories that may no longer apply.
        Allows system to adapt to behavioral changes.
        
        Args:
            memory_id: Database ID of memory to decay
            decay_amount: Amount to reduce score by
            
        Returns:
            Updated Memory instance or None if not found
        """
        # This would need to fetch current score first in production
        # Simplified for now
        return self.repository.update_memory_relevance(memory_id, new_score=3)
    
    # ==================== SESSION TRACKING ====================
    
    def log_interaction(
        self,
        user_id: str,
        user_input: str,
        agent_response: str
    ) -> None:
        """
        Log a complete interaction for audit/context purposes.
        This is NOT a memory—it's a transcript record.

        Args:
            user_id: Unique user identifier
            user_input: What user said
            agent_response: What agent responded
        """
        user = self.repository.get_or_create_user(user_id)
        
        self.repository.create_session_record(
            user_id=user.id,
            user_input=user_input,
            agent_response=agent_response
        )
    
    def get_recent_interaction_context(
        self,
        user_id: str,
        limit: int = 3
    ) -> List[Dict[str, str]]:
        """
        Retrieve recent interactions for conversational continuity.

        Args:
            user_id: Unique user identifier
            limit: Number of recent interactions to retrieve

        Returns:
            List of interaction dictionaries with user_input and agent_response
        """
        user = self.repository.get_or_create_user(user_id)
        
        sessions = self.repository.get_recent_sessions(
            user_id=user.id,
            limit=limit
        )
        
        return [
            {
                "user_input": session.user_input,
                "agent_response": session.agent_response,
                "timestamp": session.created_at.isoformat()
            }
            for session in sessions
            if session is not None and session.user_input and session.agent_response
        ]
    
    # ==================== UTILITY METHODS ====================
    
    def format_memories_for_context(self, memories: List[Memory]) -> str:
        """
        Format memory list into readable text for AI context injection.
        
        Args:
            memories: List of Memory instances
            
        Returns:
            Formatted string suitable for prompt context
        """
        if not memories:
            return "No prior observations available."
        
        formatted = []
        for mem in memories:
            parts = [f"[{mem.category}]" if mem.category else "[observation]"]
            parts.append(mem.observation)
            if mem.interpretation:
                parts.append(f"→ {mem.interpretation}")
            formatted.append(" ".join(parts))
        
        return "\n".join(formatted)