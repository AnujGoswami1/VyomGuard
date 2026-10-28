"""API router modules for VYOMSENTINEL."""

from .health import router as health_router
from .tle import router as tle_router
from .catalog import router as catalog_router
from .screening import router as screening_router
from .demo import router as demo_router

__all__ = [
    "health_router",
    "tle_router",
    "catalog_router",
    "screening_router",
    "demo_router",
]
