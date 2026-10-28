"""Conjunction screening API router."""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
import numpy as np
from fastapi import APIRouter, HTTPException

try:
    from ..models.schemas import (
        ScreeningRequest,
        ScreeningResponse,
        EphemerisTarget,
        EphemerisCatalogObject,
        ConjunctionEventSchema,
        ClosestPositions,
        MetricsSummary,
    )
    from ..services.spacetrack import SpaceTrackClient, SpaceTrackError
    from ..services.propagation import propagate_tle, propagate_catalog
    from ..services.screening import screen_conjunctions
    from ..services.collision import compute_pc, default_covariance, classify_risk
    from ..config import settings
    from .demo import get_demo_data
except (ImportError, ValueError):
    from models.schemas import (
        ScreeningRequest,
        ScreeningResponse,
        EphemerisTarget,
        EphemerisCatalogObject,
        ConjunctionEventSchema,
        ClosestPositions,
        MetricsSummary,
    )
    from services.spacetrack import SpaceTrackClient, SpaceTrackError
    from services.propagation import propagate_tle, propagate_catalog
    from services.screening import screen_conjunctions
    from services.collision import compute_pc, default_covariance, classify_risk
    from config import settings
    from routers.demo import get_demo_data

logger = logging.getLogger("vyomsentinel.screening_router")

router = APIRouter(tags=["Screening"])
spacetrack_client = SpaceTrackClient()


@router.post("/screen", response_model=ScreeningResponse)
def screen_orbit(request: ScreeningRequest) -> ScreeningResponse:
    """Executes high-speed SGP4 propagation and close encounter screening for target spacecraft."""
    if not settings.check_spacetrack_configured():
        logger.info(
            "Space-Track credentials absent. Returning deterministic high-fidelity screening demo."
        )
        return get_demo_data()

    start_time = datetime.now(timezone.utc)
    step_seconds = settings.SCREENING_STEP_SECONDS

    # Step 1: Fetch target TLE
    try:
        target_tle_record = spacetrack_client.fetch_tle(request.norad_id)
        target_line1 = target_tle_record["TLE_LINE1"]
        target_line2 = target_tle_record["TLE_LINE2"]
        target_name = target_tle_record.get("OBJECT_NAME", f"NORAD-{request.norad_id}")
    except SpaceTrackError as e:
        logger.error(f"Failed to fetch primary vehicle TLE: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Target TLE query failure: {str(e)}")

    # Step 2: Fetch background catalog
    try:
        catalog_records = spacetrack_client.fetch_catalog(limit=500)
    except SpaceTrackError as e:
        logger.error(f"Failed to fetch background catalog: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Catalog query failure: {str(e)}")

    # Step 3: Propagate target
    target_prop = propagate_tle(
        target_line1,
        target_line2,
        start=start_time,
        window_hours=request.window_hours,
        step_seconds=step_seconds,
    )

    if len(target_prop["times"]) == 0:
        raise HTTPException(
            status_code=422,
            detail="Failed to propagate target vehicle orbit. Check TLE validity.",
        )

    # Step 4: Propagate catalog objects in parallel
    catalog_props = propagate_catalog(
        catalog_records,
        start=start_time,
        window_hours=request.window_hours,
        step_seconds=step_seconds,
        max_workers=8,
    )

    # Step 5: Screen for conjunctions
    raw_conjunctions = screen_conjunctions(
        target_prop,
        catalog_props,
        threshold_km=request.threshold_km,
    )

    # Step 6: Compute Pc and classify risks
    conjunction_events: List[ConjunctionEventSchema] = []
    high_risk_count = 0

    for conj in raw_conjunctions:
        p_target = np.array(conj["closest_positions"]["target"], dtype=np.float64)
        p_obj = np.array(conj["closest_positions"]["object"], dtype=np.float64)
        rel_pos = p_obj - p_target

        altitude = float(np.linalg.norm(p_target)) - 6371.0
        cov_3d = default_covariance(altitude)

        # Estimate relative velocity direction from miss distance and relative speed
        rel_v_mag = conj["relative_velocity_kms"]
        if np.linalg.norm(rel_pos) > 1e-4:
            v_dir = np.cross(rel_pos, [0.0, 0.0, 1.0])
            norm_v = np.linalg.norm(v_dir)
            rel_vel = (v_dir / norm_v) * rel_v_mag if norm_v > 1e-4 else np.array([rel_v_mag, 0.0, 0.0])
        else:
            rel_vel = np.array([rel_v_mag, 0.0, 0.0])

        pc = compute_pc(
            relative_position_km=rel_pos,
            relative_velocity_kms=rel_vel,
            covariance_km2=cov_3d,
            hard_body_radius_km=0.01,
        )
        risk = classify_risk(pc)
        if risk == "HIGH":
            high_risk_count += 1

        conjunction_events.append(
            ConjunctionEventSchema(
                object_name=conj["object_name"],
                norad_id=conj["norad_id"],
                tca=conj["tca"],
                miss_distance_km=conj["miss_distance_km"],
                relative_velocity_kms=conj["relative_velocity_kms"],
                pc=pc,
                risk_level=risk,
                closest_positions=ClosestPositions(
                    target=conj["closest_positions"]["target"],
                    object=conj["closest_positions"]["object"],
                ),
            )
        )

    # Sample trajectory points for compact response
    sample_stride = max(1, len(target_prop["times"]) // 24)
    target_sampled = [
        (
            target_prop["times"][i],
            round(float(target_prop["positions"][i][0]), 2),
            round(float(target_prop["positions"][i][1]), 2),
            round(float(target_prop["positions"][i][2]), 2),
        )
        for i in range(0, len(target_prop["times"]), sample_stride)
    ]

    catalog_sampled: List[EphemerisCatalogObject] = []
    for c_obj in catalog_props[:20]:
        c_times = c_obj["times"]
        c_pos = c_obj["positions"]
        c_stride = max(1, len(c_times) // 12)
        pos_tuples = [
            (
                c_times[i],
                round(float(c_pos[i][0]), 2),
                round(float(c_pos[i][1]), 2),
                round(float(c_pos[i][2]), 2),
            )
            for i in range(0, len(c_times), c_stride)
        ]
        catalog_sampled.append(
            EphemerisCatalogObject(
                norad_id=c_obj["norad_id"],
                name=c_obj["name"],
                positions=pos_tuples,
            )
        )

    return ScreeningResponse(
        target=EphemerisTarget(
            norad_id=request.norad_id,
            name=target_name,
            positions=target_sampled,
        ),
        catalog=catalog_sampled,
        conjunctions=conjunction_events,
        metrics=MetricsSummary(
            objects_screened=len(catalog_props),
            conjunctions_found=len(conjunction_events),
            high_risk_count=high_risk_count,
        ),
    )
