"""
Transcription controller for Whisper API integration.
Provides speech-to-text as a fallback for browsers without Web Speech API.
"""

import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import openai

# Load environment variables from .env file
load_dotenv()

router = APIRouter()


class TranscriptionResponse(BaseModel):
    """Response model for transcription endpoint."""
    text: str
    language: str | None = None


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio using OpenAI Whisper API.

    Args:
        audio: Audio file (webm, wav, mp3, etc.)

    Returns:
        TranscriptionResponse with transcribed text
    """
    # Validate file type
    allowed_types = [
        "audio/webm",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/mp3",
        "audio/mpeg",
        "audio/mp4",
        "audio/m4a",
        "audio/ogg",
        "audio/flac",
    ]

    content_type = audio.content_type or ""
    if content_type not in allowed_types and not content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio format. Supported: webm, wav, mp3, mp4, m4a, ogg, flac"
        )

    # Check for OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
        )

    # Read audio content
    audio_content = await audio.read()

    if len(audio_content) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Determine file extension from content type
    ext_map = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/wave": ".wav",
        "audio/x-wav": ".wav",
        "audio/mp3": ".mp3",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".mp4",
        "audio/m4a": ".m4a",
        "audio/ogg": ".ogg",
        "audio/flac": ".flac",
    }
    extension = ext_map.get(content_type, ".webm")

    try:
        # Create temporary file for Whisper API
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name

        # Initialize OpenAI client
        client = openai.OpenAI(api_key=api_key)

        # Transcribe with Whisper
        with open(temp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="json"
            )

        # Clean up temp file
        os.unlink(temp_path)

        return TranscriptionResponse(
            text=transcription.text,
            language=getattr(transcription, 'language', None)
        )

    except openai.APIError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Whisper API error: {str(e)}"
        )
    except Exception as e:
        # Clean up temp file on error
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )
