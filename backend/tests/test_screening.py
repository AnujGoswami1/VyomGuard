"""Tests for conjunction screening engine."""

from datetime import datetime, timedelta, timezone
import numpy as np
import pytest
from services.screening import screen_conjunctions


def test_intersecting_orbits_conjunction_detection():
    """Asserts that screening engine detects close approaches within threshold distance."""
    # Construct 10 timesteps
    times = [
        (datetime(2026, 10, 28, 0, 0, 0, tzinfo=timezone.utc) + timedelta(minutes=i)).isoformat()
        for i in range(10)
    ]

    # Target moving linearly along X axis at Y=0, Z=0
    target_pos = np.zeros((10, 3), dtype=np.float64)
    target_vel = np.zeros((10, 3), dtype=np.float64)
    for i in range(10):
        target_pos[i] = [6800.0 + (i - 5) * 7.5, 0.0, 0.0]
        target_vel[i] = [7.5, 0.0, 0.0]

    # Object 1: Intersects closely at i=5 with miss distance 0.8 km (along Y)
    obj1_pos = np.zeros((10, 3), dtype=np.float64)
    obj1_vel = np.zeros((10, 3), dtype=np.float64)
    for i in range(10):
        obj1_pos[i] = [6800.0, (i - 5) * 7.5, 0.0]
        obj1_vel[i] = [0.0, 7.5, 0.0]

    # Shift obj1 slightly so at i=5, position is [6800.0, 0.8, 0.0]
    obj1_pos[:, 1] += 0.8

    # Object 2: Distant orbit at Z = 500.0 km
    obj2_pos = obj1_pos.copy()
    obj2_pos[:, 2] += 500.0
    obj2_vel = obj1_vel.copy()

    target_prop = {
        "times": times,
        "positions": target_pos,
        "velocities": target_vel,
    }

    catalog_props = [
        {
            "norad_id": 90001,
            "name": "HAZARD-DEB-01",
            "times": times,
            "positions": obj1_pos,
            "velocities": obj1_vel,
        },
        {
            "norad_id": 90002,
            "name": "SAFE-SAT-02",
            "times": times,
            "positions": obj2_pos,
            "velocities": obj2_vel,
        },
    ]

    conjunctions = screen_conjunctions(target_prop, catalog_props, threshold_km=10.0)

    assert len(conjunctions) == 1, f"Expected exactly 1 conjunction, found {len(conjunctions)}"
    event = conjunctions[0]
    assert event["norad_id"] == 90001
    assert event["object_name"] == "HAZARD-DEB-01"
    assert abs(event["miss_distance_km"] - 0.8) < 1e-2, f"Unexpected miss distance: {event['miss_distance_km']}"
    assert event["tca"] == times[5] + "Z"
