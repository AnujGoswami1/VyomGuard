"""SGP4 orbital propagation service.

Implements vectorized numerical propagation of Two-Line Element (TLE) sets
into Earth-Centered Inertial (ECI/TEME) coordinates across designated prediction windows.
"""

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import numpy as np
from sgp4.api import Satrec, jday

logger = logging.getLogger("vyomsentinel.propagation")


def propagate_tle(
    tle_line1: str,
    tle_line2: str,
    start: datetime,
    window_hours: int = 24,
    step_seconds: int = 60,
) -> Dict[str, Any]:
    """Propagates a single TLE orbit over a designated time window using SGP4.

    Args:
        tle_line1: First line of NORAD Two-Line Element set.
        tle_line2: Second line of NORAD Two-Line Element set.
        start: Prediction start timestamp (UTC).
        window_hours: Propagation duration in hours.
        step_seconds: Temporal discretization step in seconds.

    Returns:
        Dictionary containing:
            - times: list of ISO-formatted UTC timestamps.
            - positions: numpy ndarray of shape (N, 3) in kilometers (TEME/ECI).
            - velocities: numpy ndarray of shape (N, 3) in km/s.
    """
    satellite = Satrec.twoline2rv(tle_line1.strip(), tle_line2.strip())
    total_steps = int((window_hours * 3600) // step_seconds) + 1

    times: List[str] = []
    positions: List[List[float]] = []
    velocities: List[List[float]] = []

    for i in range(total_steps):
        current_time = start + timedelta(seconds=i * step_seconds)
        jd, fr = jday(
            current_time.year,
            current_time.month,
            current_time.day,
            current_time.hour,
            current_time.minute,
            current_time.second + current_time.microsecond * 1e-6,
        )

        error_code, r, v = satellite.sgp4(jd, fr)
        if error_code == 0:
            times.append(current_time.isoformat())
            positions.append(list(r))
            velocities.append(list(v))
        else:
            # Skip corrupted timesteps gracefully (e.g. decayed orbit)
            continue

    pos_array = np.array(positions, dtype=np.float64) if positions else np.empty((0, 3))
    vel_array = np.array(velocities, dtype=np.float64) if velocities else np.empty((0, 3))

    return {
        "times": times,
        "positions": pos_array,
        "velocities": vel_array,
    }


def _propagate_single_catalog_item(
    item: Dict[str, Any],
    start: datetime,
    window_hours: int,
    step_seconds: int,
) -> Optional[Dict[str, Any]]:
    """Propagates a single catalog entry, returning None if propagation errors occur."""
    try:
        line1 = item.get("TLE_LINE1") or item.get("tle_line1")
        line2 = item.get("TLE_LINE2") or item.get("tle_line2")
        norad_id = int(item.get("NORAD_CAT_ID") or item.get("norad_id", 0))
        name = str(item.get("OBJECT_NAME") or item.get("name", f"NORAD-{norad_id}"))

        if not line1 or not line2:
            return None

        prop_result = propagate_tle(line1, line2, start, window_hours, step_seconds)
        if len(prop_result["times"]) == 0:
            return None

        return {
            "norad_id": norad_id,
            "name": name,
            "times": prop_result["times"],
            "positions": prop_result["positions"],
            "velocities": prop_result["velocities"],
        }
    except Exception as e:
        logger.debug(f"Catalog object propagation error: {str(e)}")
        return None


def propagate_catalog(
    catalog: List[Dict[str, Any]],
    start: datetime,
    window_hours: int = 24,
    step_seconds: int = 60,
    max_workers: int = 8,
) -> List[Dict[str, Any]]:
    """Propagates all objects in a satellite catalog in parallel using a ThreadPoolExecutor.

    Args:
        catalog: List of dictionary records containing TLE lines and object metadata.
        start: UTC timestamp for screening baseline.
        window_hours: Propagation time window in hours.
        step_seconds: Timestep resolution in seconds.
        max_workers: Maximum worker threads for parallel evaluation.

    Returns:
        List of successfully propagated object dictionaries.
    """
    results: List[Dict[str, Any]] = []
    completed_count = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(
                _propagate_single_catalog_item,
                item,
                start,
                window_hours,
                step_seconds,
            )
            for item in catalog
        ]

        for future in as_completed(futures):
            res = future.result()
            if res is not None:
                results.append(res)
            completed_count += 1
            if completed_count % 500 == 0:
                logger.info(
                    f"Propagated {completed_count}/{len(catalog)} catalog trajectories."
                )

    return results
