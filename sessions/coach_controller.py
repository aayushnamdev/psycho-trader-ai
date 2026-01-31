"""
Coach controller: HTTP layer for life coach interactions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sessions.service import SessionService
from db.connection import SessionLocal

router = APIRouter()


class CoachRequest(BaseModel):
    """Request model for coach interaction."""
    user_input: str
    user_id: str


class CoachResponse(BaseModel):
    """Response model for coach interaction."""
    response: str


@router.post("/coach", response_model=CoachResponse)
async def coach_interaction(request: CoachRequest):
    """
    Life coach interaction with access to memory.

    Args:
        request: CoachRequest containing user input and ID

    Returns:
        CoachResponse with life coach guidance

    Raises:
        HTTPException: If processing fails
    """
    if not request.user_input.strip():
        raise HTTPException(status_code=400, detail="User input cannot be empty")

    db = SessionLocal()
    try:
        service = SessionService(db)
        response_text = await service.process_coach_input(
            request.user_input,
            request.user_id
        )
        return CoachResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach interaction error: {str(e)}")
    finally:
        db.close()
