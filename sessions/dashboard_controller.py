"""
Dashboard controller: API endpoints for memory and pattern visualization
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from db.connection import get_db
from memory.service import MemoryService
from pydantic import BaseModel

router = APIRouter()


class MemoryResponse(BaseModel):
    """Response model for memory data"""
    id: int
    observation: str
    interpretation: str | None
    category: str | None
    relevance_score: int
    created_at: str
    # Emotional relationship fields
    follow_up_question: str | None = None
    people_mentioned: str | None = None  # JSON array string
    is_identity_statement: bool = False
    is_breakthrough_moment: bool = False


class SessionHistoryResponse(BaseModel):
    """Response model for session history"""
    id: int
    user_input: str
    agent_response: str
    created_at: str


class DashboardStatsResponse(BaseModel):
    """Response model for dashboard statistics"""
    total_sessions: int
    total_memories: int
    active_patterns: int
    last_session: str | None


class RelationshipStatsResponse(BaseModel):
    """Response model for relationship statistics"""
    days_together: int
    total_sessions: int
    current_streak: int
    longest_streak: int
    connection_depth: int
    connection_depth_label: str


class AchievementResponse(BaseModel):
    """Response model for achievement data"""
    id: int
    achievement_key: str
    unlocked_at: str
    celebrated: bool


class StreakStatusResponse(BaseModel):
    """Response model for streak status"""
    current_streak: int
    streak_at_risk: bool
    has_interacted_today: bool
    longest_streak: int


@router.get("/trader/{user_id}/memories", response_model=List[MemoryResponse])
async def get_trader_memories(user_id: str, db: Session = Depends(get_db)):
    """
    Get all memories for a user.
    
    Args:
        user_id: Unique trader identifier
        db: Database session
        
    Returns:
        List of memory observations
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)
        
        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=100  # Get all memories
        )
        
        return [
            MemoryResponse(
                id=mem.id,
                observation=mem.observation,
                interpretation=mem.interpretation,
                category=mem.category,
                relevance_score=mem.relevance_score,
                created_at=mem.created_at.isoformat(),
                follow_up_question=getattr(mem, 'follow_up_question', None),
                people_mentioned=getattr(mem, 'people_mentioned', None),
                is_identity_statement=getattr(mem, 'is_identity_statement', False) or False,
                is_breakthrough_moment=getattr(mem, 'is_breakthrough_moment', False) or False
            )
            for mem in memories
            if mem is not None
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch memories: {str(e)}")


@router.get("/trader/{user_id}/memories/category/{category}", response_model=List[MemoryResponse])
async def get_memories_by_category(user_id: str, category: str, db: Session = Depends(get_db)):
    """
    Get memories filtered by category.
    
    Args:
        user_id: Unique trader identifier
        category: Pattern category
        db: Database session
        
    Returns:
        List of memories in that category
    """
    try:
        memory_service = MemoryService(db)
        memories = memory_service.get_pattern_history(user_id, category)
        
        return [
            MemoryResponse(
                id=mem.id,
                observation=mem.observation,
                interpretation=mem.interpretation,
                category=mem.category,
                relevance_score=mem.relevance_score,
                created_at=mem.created_at.isoformat(),
                follow_up_question=getattr(mem, 'follow_up_question', None),
                people_mentioned=getattr(mem, 'people_mentioned', None),
                is_identity_statement=getattr(mem, 'is_identity_statement', False) or False,
                is_breakthrough_moment=getattr(mem, 'is_breakthrough_moment', False) or False
            )
            for mem in memories
            if mem is not None
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch memories: {str(e)}")


@router.get("/trader/{user_id}/patterns", response_model=List[str])
async def get_pattern_categories(user_id: str, db: Session = Depends(get_db)):
    """
    Get all unique pattern categories for a user.
    
    Args:
        user_id: Unique trader identifier
        db: Database session
        
    Returns:
        List of unique category names
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)
        
        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )
        
        categories = list(set(mem.category for mem in memories if mem and mem.category))
        return sorted(categories)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch patterns: {str(e)}")


@router.get("/trader/{user_id}/sessions", response_model=List[SessionHistoryResponse])
async def get_session_history(
    user_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get session history for a user.
    
    Args:
        user_id: Unique trader identifier
        limit: Maximum number of sessions to return
        db: Database session
        
    Returns:
        List of recent sessions
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)
        
        sessions = memory_service.repository.get_recent_sessions(
            user_id=user.id,
            limit=limit
        )
        
        return [
            SessionHistoryResponse(
                id=session.id,
                user_input=session.user_input,
                agent_response=session.agent_response,
                created_at=session.created_at.isoformat()
            )
            for session in sessions
            if session is not None
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.get("/trader/{user_id}/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(user_id: str, db: Session = Depends(get_db)):
    """
    Get dashboard statistics for a user.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        Dashboard statistics
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        sessions = memory_service.repository.get_recent_sessions(
            user_id=user.id,
            limit=1
        )

        categories = list(set(mem.category for mem in memories if mem and mem.category))

        # Filter out None sessions
        valid_sessions = [s for s in sessions if s is not None]
        valid_memories = [m for m in memories if m is not None]

        return DashboardStatsResponse(
            total_sessions=len(valid_sessions),
            total_memories=len(valid_memories),
            active_patterns=len(categories),
            last_session=valid_sessions[0].created_at.isoformat() if valid_sessions else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/trader/{user_id}/relationship", response_model=RelationshipStatsResponse)
async def get_relationship_stats(user_id: str, db: Session = Depends(get_db)):
    """
    Get relationship statistics for a user.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        Relationship statistics including days together, streak, and connection depth
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        stats = memory_service.repository.get_user_relationship_stats(user.id)

        return RelationshipStatsResponse(
            days_together=stats["days_together"],
            total_sessions=stats["total_sessions"],
            current_streak=stats["current_streak"],
            longest_streak=stats["longest_streak"],
            connection_depth=stats["connection_depth"],
            connection_depth_label=stats["connection_depth_label"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch relationship stats: {str(e)}")


@router.get("/trader/{user_id}/memories/identity", response_model=List[MemoryResponse])
async def get_identity_memories(user_id: str, db: Session = Depends(get_db)):
    """
    Get memories that are identity statements.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of identity statement memories
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        # Filter for identity statements
        identity_memories = [
            mem for mem in memories
            if mem is not None
            if getattr(mem, 'is_identity_statement', False)
        ]

        return [
            MemoryResponse(
                id=mem.id,
                observation=mem.observation,
                interpretation=mem.interpretation,
                category=mem.category,
                relevance_score=mem.relevance_score,
                created_at=mem.created_at.isoformat(),
                follow_up_question=getattr(mem, 'follow_up_question', None),
                people_mentioned=getattr(mem, 'people_mentioned', None),
                is_identity_statement=True,
                is_breakthrough_moment=getattr(mem, 'is_breakthrough_moment', False) or False
            )
            for mem in identity_memories
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch identity memories: {str(e)}")


@router.get("/trader/{user_id}/memories/breakthroughs", response_model=List[MemoryResponse])
async def get_breakthrough_memories(user_id: str, db: Session = Depends(get_db)):
    """
    Get memories that are breakthrough moments.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of breakthrough moment memories
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        # Filter for breakthrough moments
        breakthrough_memories = [
            mem for mem in memories
            if mem is not None
            if getattr(mem, 'is_breakthrough_moment', False) or mem.category == 'breakthrough_moment'
        ]

        return [
            MemoryResponse(
                id=mem.id,
                observation=mem.observation,
                interpretation=mem.interpretation,
                category=mem.category,
                relevance_score=mem.relevance_score,
                created_at=mem.created_at.isoformat(),
                follow_up_question=getattr(mem, 'follow_up_question', None),
                people_mentioned=getattr(mem, 'people_mentioned', None),
                is_identity_statement=getattr(mem, 'is_identity_statement', False) or False,
                is_breakthrough_moment=True
            )
            for mem in breakthrough_memories
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch breakthrough memories: {str(e)}")


@router.get("/trader/{user_id}/people", response_model=List[str])
async def get_people_mentioned(user_id: str, db: Session = Depends(get_db)):
    """
    Get deduplicated list of people mentioned across all memories.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of unique people names mentioned
    """
    import json

    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        # Collect and deduplicate people mentioned
        people = set()
        for mem in memories:
            people_str = getattr(mem, 'people_mentioned', None)
            if people_str:
                try:
                    # Try to parse as JSON array
                    parsed = json.loads(people_str)
                    if isinstance(parsed, list):
                        for person in parsed:
                            if person and isinstance(person, str):
                                people.add(person.strip())
                except json.JSONDecodeError:
                    # Fall back to comma-separated
                    for person in people_str.split(','):
                        if person.strip():
                            people.add(person.strip())

        return sorted(list(people))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch people mentioned: {str(e)}")


# ==================== ACHIEVEMENT ENDPOINTS ====================

@router.get("/trader/{user_id}/achievements", response_model=List[AchievementResponse])
async def get_achievements(user_id: str, db: Session = Depends(get_db)):
    """
    Get all achievements for a user.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of achievements
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        achievements = memory_service.repository.get_achievements(user.id)

        return [
            AchievementResponse(
                id=ach.id,
                achievement_key=ach.achievement_key,
                unlocked_at=ach.unlocked_at.isoformat(),
                celebrated=ach.celebrated
            )
            for ach in achievements
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch achievements: {str(e)}")


@router.get("/trader/{user_id}/achievements/uncelebrated", response_model=List[AchievementResponse])
async def get_uncelebrated_achievements(user_id: str, db: Session = Depends(get_db)):
    """
    Get achievements that haven't been celebrated yet.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of uncelebrated achievements
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        achievements = memory_service.repository.get_uncelebrated_achievements(user.id)

        return [
            AchievementResponse(
                id=ach.id,
                achievement_key=ach.achievement_key,
                unlocked_at=ach.unlocked_at.isoformat(),
                celebrated=ach.celebrated
            )
            for ach in achievements
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch uncelebrated achievements: {str(e)}")


@router.post("/trader/{user_id}/achievements/check", response_model=List[AchievementResponse])
async def check_achievements(user_id: str, db: Session = Depends(get_db)):
    """
    Check and unlock any newly earned achievements.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        List of newly unlocked achievements
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        newly_unlocked = memory_service.repository.check_and_unlock_achievements(user.id)

        return [
            AchievementResponse(
                id=ach.id,
                achievement_key=ach.achievement_key,
                unlocked_at=ach.unlocked_at.isoformat(),
                celebrated=ach.celebrated
            )
            for ach in newly_unlocked
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check achievements: {str(e)}")


@router.post("/trader/{user_id}/achievements/{achievement_id}/celebrate")
async def celebrate_achievement(user_id: str, achievement_id: int, db: Session = Depends(get_db)):
    """
    Mark an achievement as celebrated.

    Args:
        user_id: Unique trader identifier
        achievement_id: Achievement ID to mark as celebrated
        db: Database session

    Returns:
        Success status
    """
    try:
        memory_service = MemoryService(db)
        memory_service.repository.get_or_create_user(user_id)

        achievement = memory_service.repository.mark_achievement_celebrated(achievement_id)
        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        return {"status": "success", "celebrated": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to celebrate achievement: {str(e)}")


@router.get("/trader/{user_id}/streak-status", response_model=StreakStatusResponse)
async def get_streak_status(user_id: str, db: Session = Depends(get_db)):
    """
    Get streak status including whether streak is at risk.

    Args:
        user_id: Unique trader identifier
        db: Database session

    Returns:
        Streak status information
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        status = memory_service.repository.get_streak_status(user.id)

        return StreakStatusResponse(
            current_streak=status["current_streak"],
            streak_at_risk=status["streak_at_risk"],
            has_interacted_today=status["has_interacted_today"],
            longest_streak=status["longest_streak"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch streak status: {str(e)}")

class AreaToWorkOnResponse(BaseModel):
    """Response model for areas to work on"""
    title: str
    description: str
    category: str
    frequency: int
    examples: List[str]


@router.get("/user/{user_id}/areas-to-work-on", response_model=List[AreaToWorkOnResponse])
async def get_areas_to_work_on(user_id: str, db: Session = Depends(get_db)):
    """
    Get areas to work on based on patterns and memories.
    Identifies recurring themes with high frequency of struggle.

    Args:
        user_id: Unique user identifier
        db: Database session

    Returns:
        List of areas to work on with frequency and examples
    """
    try:
        memory_service = MemoryService(db)
        user = memory_service.repository.get_or_create_user(user_id)

        memories = memory_service.repository.get_recent_memories(
            user_id=user.id,
            limit=1000
        )

        # Group by category
        category_groups: Dict[str, List] = {}
        for mem in memories:
            if mem.category:
                if mem.category not in category_groups:
                    category_groups[mem.category] = []
                category_groups[mem.category].append(mem)

        # Identify struggle categories with high frequency
        struggle_categories = [
            'fear_patterns', 'recurring_struggle', 'self_worth_conflict',
            'shame_dynamics', 'defense_mechanisms', 'control_seeking'
        ]

        areas = []
        for category, mems in category_groups.items():
            if category in struggle_categories and len(mems) >= 3:
                areas.append(AreaToWorkOnResponse(
                    title=category.replace('_', ' ').title(),
                    description=f'This theme has appeared {len(mems)} times in your reflections',
                    category=category,
                    frequency=len(mems),
                    examples=[m.observation[:100] for m in mems[:2]]
                ))

        # Sort by frequency
        areas.sort(key=lambda x: x.frequency, reverse=True)
        return areas[:5]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch areas to work on: {str(e)}")
