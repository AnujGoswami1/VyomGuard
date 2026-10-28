"""Demo data router endpoint serving pre-screened orbital telemetry."""

import os
import json
from fastapi import APIRouter, HTTPException
try:
    from ..models.schemas import ScreeningResponse
except (ImportError, ValueError):
    from models.schemas import ScreeningResponse

router = APIRouter(tags=["Demo"])

DEMO_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "demo-data.json")


@router.get("/demo", response_model=ScreeningResponse)
def get_demo_data() -> ScreeningResponse:
    """Returns static high-fidelity conjunction screening dataset for zero-configuration operation."""
    if not os.path.exists(DEMO_FILE_PATH):
        raise HTTPException(status_code=500, detail="Demo telemetry database file missing.")

    try:
        with open(DEMO_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return ScreeningResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load demo telemetry: {str(e)}"
        )
