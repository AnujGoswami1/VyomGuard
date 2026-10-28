"""Vectorized conjunction screening service.

Evaluates high-speed minimum Euclidean distance sweeps across propagated ephemerides
to detect orbital close encounters within designated safety screening shells.
"""

import logging
from typing import Dict, Any, List
import numpy as np

logger = logging.getLogger("vyomsentinel.screening")


def screen_conjunctions(
    target_prop: Dict[str, Any],
    catalog_props: List[Dict[str, Any]],
    threshold_km: float = 10.0,
) -> List[Dict[str, Any]]:
    """Screens catalog orbits against a primary target trajectory for close encounters.

    Args:
        target_prop: Propagation dictionary for target with positions and velocities.
        catalog_props: List of propagation dictionaries for catalog objects.
        threshold_km: Conjunction screening distance radius in kilometers.

    Returns:
        List of conjunction event records sorted by miss distance ascending.
    """
    target_pos = target_prop["positions"]
    target_vel = target_prop["velocities"]
    target_times = target_prop["times"]

    if len(target_pos) == 0:
        return []

    conjunctions: List[Dict[str, Any]] = []

    for obj in catalog_props:
        obj_pos = obj["positions"]
        obj_vel = obj["velocities"]

        # Ensure synchronized timeline length
        common_len = min(len(target_pos), len(obj_pos))
        if common_len == 0:
            continue

        p_t = target_pos[:common_len]
        p_o = obj_pos[:common_len]

        # Vectorized Euclidean separation calculation
        delta_p = p_t - p_o
        distances = np.linalg.norm(delta_p, axis=1)

        min_idx = int(np.argmin(distances))
        min_dist = float(distances[min_idx])

        if min_dist <= threshold_km:
            v_t = target_vel[min_idx]
            v_o = obj_vel[min_idx]
            rel_v = float(np.linalg.norm(v_t - v_o))

            tca_str = target_times[min_idx]
            if not tca_str.endswith("Z"):
                tca_str = tca_str + "Z"

            conjunctions.append(
                {
                    "object_name": obj["name"],
                    "norad_id": obj["norad_id"],
                    "tca": tca_str,
                    "miss_distance_km": round(min_dist, 3),
                    "relative_velocity_kms": round(rel_v, 2),
                    "closest_positions": {
                        "target": [round(float(coord), 3) for coord in p_t[min_idx]],
                        "object": [round(float(coord), 3) for coord in p_o[min_idx]],
                    },
                }
            )

    conjunctions.sort(key=lambda c: c["miss_distance_km"])
    return conjunctions
