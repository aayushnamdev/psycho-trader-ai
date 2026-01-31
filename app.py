"""
FastAPI application entry point for Psycho Trader AI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Psycho Trader AI",
    description="Psychoanalytically-oriented reflection system for traders",
    version="0.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    from db.connection import init_db
    init_db()


# Register routes (import here to avoid circular imports)
from sessions.controller import router as session_router
from sessions.dashboard_controller import router as dashboard_router
from sessions.transcription_controller import router as transcription_router
from sessions.coach_controller import router as coach_router

app.include_router(session_router, prefix="/api", tags=["sessions"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(transcription_router, prefix="/api", tags=["transcription"])
app.include_router(coach_router, prefix="/api", tags=["coach"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "active", "service": "Psycho Trader AI"}
