"""VYOMSENTINEL API Main Entry Point.

Production-grade FastAPI application coordinating orbital propagation,
space conjunction screening, and collision probability computation.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from .config import settings
    from .routers import (
        health_router,
        tle_router,
        catalog_router,
        screening_router,
        demo_router,
    )
except (ImportError, ValueError):
    from config import settings
    from routers import (
        health_router,
        tle_router,
        catalog_router,
        screening_router,
        demo_router,
    )

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("vyomsentinel.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for backend startup and shutdown."""
    logger.info("Initializing VYOMSENTINEL Space Traffic Management API...")
    configured = settings.check_spacetrack_configured()
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Space-Track Ingestion Active: {configured}")
    logger.info(f"CORS Allowed Origins: {settings.cors_origins_list}")
    yield
    logger.info("Shutting down VYOMSENTINEL API services cleanly.")


app = FastAPI(
    title="VYOMSENTINEL API",
    version="1.0.0",
    description="Space traffic management, orbital propagation, and collision risk assessment service.",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Intercepts unhandled server exceptions to guarantee clean JSON diagnostics."""
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred during orbital computation.",
            "path": request.url.path,
        },
    )


# Mount Sub-routers under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(tle_router, prefix="/api")
app.include_router(catalog_router, prefix="/api")
app.include_router(screening_router, prefix="/api")
app.include_router(demo_router, prefix="/api")


@app.get("/")
def root_redirect():
    """Root status summary."""
    return {
        "service": "VYOMSENTINEL API",
        "status": "operational",
        "documentation": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
