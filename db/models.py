"""
SQLAlchemy ORM models for psychoanalytic memory system.
Represents case notes, not chat logs.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.connection import Base


class User(Base):
    """
    Represents a user in the system.
    Each user has their own case history.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship tracking fields
    first_interaction_date = Column(DateTime, nullable=True)
    last_interaction_date = Column(DateTime, nullable=True)
    total_sessions = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    connection_depth = Column(Integer, default=1)  # 1-5 scale

    # Relationship to memory entries
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")


class Memory(Base):
    """
    Represents a psychoanalytic observation or case note.
    Not a transcript, but an interpretation/pattern recognized by the system.
    """
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Core memory content
    observation = Column(Text, nullable=False)  # What was noticed
    interpretation = Column(Text, nullable=True)  # Psychoanalytic meaning
    category = Column(String(100), nullable=True, index=True)  # e.g., "fear_patterns", "recurring_struggle"

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    relevance_score = Column(Integer, default=5)  # 1-10 scale for retrieval priority

    # Relationship-building fields
    follow_up_question = Column(Text, nullable=True)
    people_mentioned = Column(Text, nullable=True)  # JSON array
    is_identity_statement = Column(Boolean, default=False)
    is_breakthrough_moment = Column(Boolean, default=False)

    # Relationship
    user = relationship("User", back_populates="memories")
    
    def __repr__(self):
        return f"<Memory(id={self.id}, category={self.category}, user_id={self.user_id})>"


class Session(Base):
    """
    Represents an interaction session.
    Lightweight record for tracking conversation context.
    """
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    user_input = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User")

    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"


class Achievement(Base):
    """
    Represents an unlocked achievement for gamification.
    Tracks milestones like streaks, breakthroughs, and engagement levels.
    """
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_key = Column(String(50), nullable=False)  # e.g., "first_step", "week_warrior"
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    celebrated = Column(Boolean, default=False)  # Track if user saw celebration

    # Relationship
    user = relationship("User")

    def __repr__(self):
        return f"<Achievement(id={self.id}, key={self.achievement_key}, user_id={self.user_id})>"