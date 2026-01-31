"""
Database connection management.
Handles SQLAlchemy engine and session creation.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment variable
# Default to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./psycho_trader.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False  # Set to True for SQL query logging during development
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency function for FastAPI route injection.
    Provides a database session and ensures cleanup.
    
    Yields:
        SQLAlchemy Session object
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Creates all tables defined in models.py.
    Call this on application startup.
    """
    from db.models import Base  # Import to register models
    Base.metadata.create_all(bind=engine)