"""Health check router endpoint."""

import time
from fastapi import APIRouter
try:
    from ..models.schemas import HealthResponse
    from ..config import settings
except (ImportError, ValueError):
    from models.schemas import HealthResponse
    from config import settings

router = APIRouter(tags=["Health"])

START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Returns runtime health status, version metadata, and Space-Track configuration state."""
    uptime = int(time.time() - START_TIME)
    is_configured = settings.check_spacetrack_configured()

    return HealthResponse(
        status="ok",
        version="1.0.0",
        spacetrack_configured=is_configured,
        uptime_seconds=uptime,
    )
