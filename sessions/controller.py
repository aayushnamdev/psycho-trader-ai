"""
Session controller: HTTP layer for session interactions.
Handles request validation and response formatting.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sessions.service import process_user_input, generate_session_summary

router = APIRouter()


class SessionRequest(BaseModel):
    """Request model for session interaction."""
    user_input: str
    user_id: str = "default_user"  # Optional user ID


class SessionResponse(BaseModel):
    """Response model for session interaction."""
    response: str


@router.post("/session", response_model=SessionResponse)
async def create_session_interaction(request: SessionRequest):
    """
    Process a user input and return a psychoanalytic-style response.

    Args:
        request: SessionRequest containing user_input string

    Returns:
        SessionResponse with interpreted response

    Raises:
        HTTPException: If input is empty or processing fails
    """
    if not request.user_input.strip():
        raise HTTPException(status_code=400, detail="User input cannot be empty")

    try:
        response_text = await process_user_input(
            request.user_input,
            request.user_id
        )
        return SessionResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@router.post("/session/end", response_model=SessionResponse)
async def end_session(request: SessionRequest):
    """
    End current session with summary and insights.

    Args:
        request: SessionRequest containing user_id

    Returns:
        SessionResponse with session summary

    Raises:
        HTTPException: If processing fails
    """
    try:
        response_text = await generate_session_summary(request.user_id)
        return SessionResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation error: {str(e)}")