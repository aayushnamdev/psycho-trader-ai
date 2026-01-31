"""
Memory repository: Data access layer for memory operations.
Pure database interactions with no business logic.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from db.models import User, Memory, Session as SessionModel, Achievement


class MemoryRepository:
    """
    Repository for memory-related database operations.
    Follows repository pattern: pure data access, no interpretation.
    """
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy Session instance
        """
        self.db = db
    
    # ==================== USER OPERATIONS ====================

    def get_or_create_user(self, user_id: str) -> User:
        """
        Retrieve existing user or create new one.

        Args:
            user_id: Unique identifier for user

        Returns:
            User instance
        """
        user = self.db.query(User).filter(User.user_id == user_id).first()

        if not user:
            user = User(user_id=user_id)
            self.db.add(user)
            self.db.commit()

        return user
    
    # ==================== MEMORY OPERATIONS ====================
    
    def create_memory(
        self,
        user_id: int,
        observation: str,
        interpretation: Optional[str] = None,
        category: Optional[str] = None,
        relevance_score: int = 5,
        follow_up_question: Optional[str] = None,
        people_mentioned: Optional[str] = None,
        is_identity_statement: bool = False,
        is_breakthrough_moment: bool = False
    ) -> Memory:
        """
        Create a new memory entry for relationship building.

        Args:
            user_id: Database ID of user
            observation: What was noticed
            interpretation: Why it matters for the relationship
            category: Memory category (relationship_dynamics, self_worth, etc.)
            relevance_score: Priority score (1-10)
            follow_up_question: A natural question to ask about this later
            people_mentioned: JSON array of names/relationships
            is_identity_statement: True if this is an identity statement
            is_breakthrough_moment: True if this is a realization/insight

        Returns:
            Created Memory instance
        """
        memory = Memory(
            user_id=user_id,
            observation=observation,
            interpretation=interpretation,
            category=category,
            relevance_score=relevance_score,
            follow_up_question=follow_up_question,
            people_mentioned=people_mentioned,
            is_identity_statement=is_identity_statement,
            is_breakthrough_moment=is_breakthrough_moment
        )

        self.db.add(memory)
        self.db.commit()

        return memory
    
    def get_recent_memories(
        self,
        user_id: int,
        limit: int = 10,
        category: Optional[str] = None
    ) -> List[Memory]:
        """
        Retrieve recent memories for a user, ordered by creation time.

        Args:
            user_id: Database ID of user
            limit: Maximum number of memories to retrieve
            category: Optional filter by category

        Returns:
            List of Memory instances
        """
        query = self.db.query(Memory).filter(Memory.user_id == user_id)
        
        if category:
            query = query.filter(Memory.category == category)
        
        return query.order_by(desc(Memory.created_at)).limit(limit).all()
    
    def get_relevant_memories(
        self,
        user_id: int,
        min_relevance: int = 5,
        limit: int = 10
    ) -> List[Memory]:
        """
        Retrieve high-relevance memories for context building.

        Args:
            user_id: Database ID of user
            min_relevance: Minimum relevance score threshold
            limit: Maximum number of memories to retrieve

        Returns:
            List of Memory instances ordered by relevance and recency
        """
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.relevance_score >= min_relevance)
            .order_by(desc(Memory.relevance_score), desc(Memory.created_at))
            .limit(limit)
            .all()
        )
    
    def get_memories_by_category(
        self,
        user_id: int,
        category: str
    ) -> List[Memory]:
        """
        Retrieve all memories for a specific pattern category.

        Args:
            user_id: Database ID of user
            category: Memory category to filter by

        Returns:
            List of Memory instances
        """
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.category == category)
            .order_by(desc(Memory.created_at))
            .all()
        )
    
    def update_memory_relevance(self, memory_id: int, new_score: int) -> Optional[Memory]:
        """
        Update relevance score of existing memory.
        
        Args:
            memory_id: Database ID of memory
            new_score: New relevance score (1-10)
            
        Returns:
            Updated Memory instance or None if not found
        """
        memory = self.db.query(Memory).filter(Memory.id == memory_id).first()
        
        if memory:
            memory.relevance_score = new_score
            self.db.commit()
            self.db.refresh(memory)
        
        return memory
    
    # ==================== SESSION OPERATIONS ====================
    
    def create_session_record(
        self,
        user_id: int,
        user_input: str,
        agent_response: str
    ) -> SessionModel:
        """
        Create a session interaction record.

        Args:
            user_id: Database ID of user
            user_input: User's message
            agent_response: Agent's response

        Returns:
            Created Session instance
        """
        session = SessionModel(
            user_id=user_id,
            user_input=user_input,
            agent_response=agent_response
        )

        self.db.add(session)
        self.db.commit()

        return session
    
    def get_recent_sessions(
        self,
        user_id: int,
        limit: int = 5
    ) -> List[SessionModel]:
        """
        Retrieve recent session interactions.

        Args:
            user_id: Database ID of user
            limit: Maximum number of sessions to retrieve

        Returns:
            List of Session instances
        """
        return (
            self.db.query(SessionModel)
            .filter(SessionModel.user_id == user_id)
            .order_by(desc(SessionModel.created_at))
            .limit(limit)
            .all()
        )

    # ==================== RELATIONSHIP TRACKING ====================

    def update_user_stats(self, user_id: int) -> User:
        """
        Update streak/session counts after each interaction.

        Args:
            user_id: Database ID of user

        Returns:
            Updated User instance
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        now = datetime.utcnow()
        today = now.date()

        # Set first interaction date if not set
        if not user.first_interaction_date:
            user.first_interaction_date = now

        # Calculate streak
        if user.last_interaction_date:
            last_date = user.last_interaction_date.date()
            days_diff = (today - last_date).days

            if days_diff == 0:
                # Same day, streak unchanged
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                user.current_streak += 1
            else:
                # Gap in days, reset streak
                user.current_streak = 1
        else:
            # First interaction
            user.current_streak = 1

        # Update longest streak if current is longer
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak

        # Update last interaction date
        user.last_interaction_date = now

        # Increment total sessions
        user.total_sessions += 1

        # Calculate connection depth based on engagement
        user.connection_depth = self._calculate_connection_depth(user)

        self.db.commit()

        return user

    def _calculate_connection_depth(self, user: User) -> int:
        """
        Calculate 1-5 depth score based on engagement metrics.

        Args:
            user: User instance

        Returns:
            Connection depth score (1-5)
        """
        score = 1

        # Sessions contribute to depth
        if user.total_sessions >= 3:
            score = 2
        if user.total_sessions >= 10:
            score = 3
        if user.total_sessions >= 25:
            score = 4
        if user.total_sessions >= 50:
            score = 5

        # Streak bonus
        if user.current_streak >= 3:
            score = min(5, score + 1)

        # Days together bonus
        if user.first_interaction_date:
            days_together = (datetime.utcnow() - user.first_interaction_date).days
            if days_together >= 30:
                score = min(5, score + 1)

        return min(5, max(1, score))

    def get_user_relationship_stats(self, user_id: int) -> Dict[str, Any]:
        """
        Return relationship stats for frontend display.

        Args:
            user_id: Database ID of user

        Returns:
            Dictionary with relationship statistics
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {
                "days_together": 0,
                "total_sessions": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "connection_depth": 1,
                "connection_depth_label": "Getting to know each other"
            }

        # Calculate days together
        days_together = 0
        if user.first_interaction_date:
            days_together = (datetime.utcnow() - user.first_interaction_date).days + 1

        # Connection depth labels
        depth_labels = {
            1: "Getting to know each other",
            2: "Building trust",
            3: "Growing closer",
            4: "Deep connection",
            5: "Truly understood"
        }

        return {
            "days_together": days_together,
            "total_sessions": user.total_sessions or 0,
            "current_streak": user.current_streak or 0,
            "longest_streak": user.longest_streak or 0,
            "connection_depth": user.connection_depth or 1,
            "connection_depth_label": depth_labels.get(user.connection_depth or 1, "Getting to know each other")
        }

    def get_identity_statements(self, user_id: int, limit: int = 10) -> List[Memory]:
        """
        Retrieve identity statements the user has made.

        Args:
            user_id: Database ID of user
            limit: Maximum number to retrieve

        Returns:
            List of Memory instances marked as identity statements
        """
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.is_identity_statement == True)
            .order_by(desc(Memory.created_at))
            .limit(limit)
            .all()
        )

    def get_breakthrough_moments(self, user_id: int, limit: int = 10) -> List[Memory]:
        """
        Retrieve breakthrough moments.

        Args:
            user_id: Database ID of user
            limit: Maximum number to retrieve

        Returns:
            List of Memory instances marked as breakthroughs
        """
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.is_breakthrough_moment == True)
            .order_by(desc(Memory.created_at))
            .limit(limit)
            .all()
        )

    def get_follow_up_opportunities(self, user_id: int, limit: int = 5) -> List[Memory]:
        """
        Retrieve memories with follow-up questions.

        Args:
            user_id: Database ID of user
            limit: Maximum number to retrieve

        Returns:
            List of Memory instances with follow-up questions
        """
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.follow_up_question.isnot(None))
            .order_by(desc(Memory.created_at))
            .limit(limit)
            .all()
        )

    # ==================== ACHIEVEMENT OPERATIONS ====================

    def get_user_achievements(self, user_id: int) -> List[Achievement]:
        """
        Retrieve all achievements for a user.

        Args:
            user_id: Database ID of user

        Returns:
            List of Achievement instances
        """
        return (
            self.db.query(Achievement)
            .filter(Achievement.user_id == user_id)
            .order_by(desc(Achievement.unlocked_at))
            .all()
        )

    def get_uncelebrated_achievements(self, user_id: int) -> List[Achievement]:
        """
        Retrieve achievements that haven't been celebrated yet.

        Args:
            user_id: Database ID of user

        Returns:
            List of uncelebrated Achievement instances
        """
        return (
            self.db.query(Achievement)
            .filter(Achievement.user_id == user_id)
            .filter(Achievement.celebrated == False)
            .order_by(Achievement.unlocked_at)
            .all()
        )

    def has_achievement(self, user_id: int, achievement_key: str) -> bool:
        """
        Check if user has a specific achievement.

        Args:
            user_id: Database ID of user
            achievement_key: Achievement identifier

        Returns:
            True if achievement exists
        """
        return (
            self.db.query(Achievement)
            .filter(Achievement.user_id == user_id)
            .filter(Achievement.achievement_key == achievement_key)
            .first()
        ) is not None

    def unlock_achievement(self, user_id: int, achievement_key: str) -> Optional[Achievement]:
        """
        Unlock an achievement for a user if not already unlocked.

        Args:
            user_id: Database ID of user
            achievement_key: Achievement identifier

        Returns:
            Created Achievement instance or None if already exists
        """
        if self.has_achievement(user_id, achievement_key):
            return None

        achievement = Achievement(
            user_id=user_id,
            achievement_key=achievement_key,
            celebrated=False
        )
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        return achievement

    def mark_achievement_celebrated(self, achievement_id: int) -> Optional[Achievement]:
        """
        Mark an achievement as celebrated.

        Args:
            achievement_id: Database ID of achievement

        Returns:
            Updated Achievement instance or None if not found
        """
        achievement = self.db.query(Achievement).filter(Achievement.id == achievement_id).first()
        if achievement:
            achievement.celebrated = True
            self.db.commit()
            self.db.refresh(achievement)
        return achievement

    def check_and_unlock_achievements(self, user_id: int) -> List[Achievement]:
        """
        Check all achievement conditions and unlock any newly earned ones.

        Args:
            user_id: Database ID of user

        Returns:
            List of newly unlocked Achievement instances
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        newly_unlocked = []

        # Get counts for achievement checks
        total_sessions = user.total_sessions or 0
        current_streak = user.current_streak or 0
        connection_depth = user.connection_depth or 1

        # Count breakthroughs and identity statements
        breakthrough_count = (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.is_breakthrough_moment == True)
            .count()
        )

        identity_count = (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .filter(Memory.is_identity_statement == True)
            .count()
        )

        # Count unique people mentioned
        memories = self.get_recent_memories(user_id, limit=1000)
        people = set()
        for mem in memories:
            if mem.people_mentioned:
                try:
                    import json
                    parsed = json.loads(mem.people_mentioned)
                    if isinstance(parsed, list):
                        for p in parsed:
                            if p and isinstance(p, str):
                                people.add(p.strip())
                except:
                    for p in str(mem.people_mentioned).split(','):
                        if p.strip():
                            people.add(p.strip())
        people_count = len(people)

        # Achievement definitions with conditions
        achievement_checks = [
            # Onboarding - Easy wins (Endowed Progress)
            ("first_step", total_sessions >= 1),
            ("opening_up", len(memories) >= 5),

            # Streaks - Loss Aversion
            ("three_day", current_streak >= 3),
            ("week_warrior", current_streak >= 7),
            ("month_master", current_streak >= 30),

            # Depth - Progress Markers
            ("trust_builder", connection_depth >= 2),
            ("growing_closer", connection_depth >= 3),
            ("deep_bond", connection_depth >= 4),
            ("truly_known", connection_depth >= 5),

            # Breakthroughs - Variable Rewards
            ("first_insight", breakthrough_count >= 1),
            ("insight_seeker", breakthrough_count >= 5),

            # Identity - Rare/Special
            ("self_explorer", identity_count >= 10),
            ("relationship_mapper", people_count >= 5),
        ]

        for achievement_key, condition in achievement_checks:
            if condition:
                achievement = self.unlock_achievement(user_id, achievement_key)
                if achievement:
                    newly_unlocked.append(achievement)

        return newly_unlocked

    def get_streak_status(self, user_id: int) -> Dict[str, Any]:
        """
        Get streak status including whether streak is at risk today.

        Args:
            user_id: Database ID of user

        Returns:
            Dictionary with streak status information
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {
                "current_streak": 0,
                "streak_at_risk": False,
                "has_interacted_today": False,
                "longest_streak": 0
            }

        now = datetime.utcnow()
        today = now.date()
        has_interacted_today = False
        streak_at_risk = False

        if user.last_interaction_date:
            last_date = user.last_interaction_date.date()
            has_interacted_today = last_date == today

            # Streak is at risk if:
            # 1. They have a streak > 0
            # 2. They haven't interacted today
            if user.current_streak > 0 and not has_interacted_today:
                streak_at_risk = True

        return {
            "current_streak": user.current_streak or 0,
            "streak_at_risk": streak_at_risk,
            "has_interacted_today": has_interacted_today,
            "longest_streak": user.longest_streak or 0
        }