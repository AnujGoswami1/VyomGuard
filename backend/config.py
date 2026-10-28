"""Configuration settings for VYOMSENTINEL backend service.

Loads configuration parameters from environment variables with fallback defaults
using Pydantic Settings.
"""

import logging
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

logger = logging.getLogger("vyomsentinel.config")


class Settings(BaseSettings):
    """Runtime configuration settings."""

    SPACETRACK_USER: str = ""
    SPACETRACK_PASS: str = ""
    SPACETRACK_BASE_URL: str = "https://www.space-track.org"
    CATALOG_CACHE_TTL_SECONDS: int = 3600
    TLE_CACHE_TTL_SECONDS: int = 3600
    SCREENING_STEP_SECONDS: int = 60
    DEFAULT_SCREENING_WINDOW_HOURS: int = 24
    DEFAULT_SCREENING_THRESHOLD_KM: float = 10.0
    MAX_CATALOG_SIZE: int = 5000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Returns CORS origins as a parsed list of string URLs."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def check_spacetrack_configured(self) -> bool:
        """Determines whether valid Space-Track credentials are present."""
        configured = bool(self.SPACETRACK_USER.strip() and self.SPACETRACK_PASS.strip())
        if not configured:
            logger.warning(
                "SPACETRACK_USER is empty. Space-Track live ingestion disabled. "
                "Operating in deterministic high-fidelity demo mode."
            )
        return configured


settings = Settings()
