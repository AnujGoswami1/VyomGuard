"""Pydantic validation models and request/response schemas for VYOMSENTINEL."""

from typing import List, Dict, Tuple, Literal, Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="System operational state")
    version: str = Field(..., description="API software semantic version")
    spacetrack_configured: bool = Field(
        ..., description="Whether live Space-Track credentials are authenticated"
    )
    uptime_seconds: int = Field(..., description="Service uptime duration in seconds")


class ScreeningRequest(BaseModel):
    """Payload for screening conjunction encounters."""

    norad_id: int = Field(..., description="NORAD catalog identifier for primary vehicle", ge=1)
    window_hours: int = Field(
        default=24, description="Screening time horizon in hours", ge=1, le=168
    )
    threshold_km: float = Field(
        default=10.0,
        description="Distance threshold in kilometers for encounter detection",
        gt=0.0,
        le=500.0,
    )


class EphemerisTarget(BaseModel):
    """Propagated ephemeris trajectory for primary space vehicle."""

    norad_id: int
    name: str
    positions: List[Tuple[str, float, float, float]]


class EphemerisCatalogObject(BaseModel):
    """Propagated ephemeris trajectory for secondary catalog object."""

    norad_id: int
    name: str
    positions: List[Tuple[str, float, float, float]]


class ClosestPositions(BaseModel):
    """ECI coordinates at time of closest approach (TCA)."""

    target: List[float] = Field(..., min_length=3, max_length=3)
    object: List[float] = Field(..., min_length=3, max_length=3)


class ConjunctionEventSchema(BaseModel):
    """Identified close approach event between primary and secondary objects."""

    object_name: str
    norad_id: int
    tca: str
    miss_distance_km: float
    relative_velocity_kms: float
    pc: float
    risk_level: Literal["HIGH", "MEDIUM", "LOW"]
    closest_positions: ClosestPositions


class MetricsSummary(BaseModel):
    """Aggregate conjunction screening telemetry metrics."""

    objects_screened: int
    conjunctions_found: int
    high_risk_count: int


class ScreeningResponse(BaseModel):
    """Comprehensive conjunction screening results payload."""

    target: EphemerisTarget
    catalog: List[EphemerisCatalogObject]
    conjunctions: List[ConjunctionEventSchema]
    metrics: MetricsSummary


class SpaceObjectSummary(BaseModel):
    """Metadata summary of a space catalog object."""

    norad_id: int
    name: str
    object_type: str
    tle_line1: str
    tle_line2: str
