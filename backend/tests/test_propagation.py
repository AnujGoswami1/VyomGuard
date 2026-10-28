"""Tests for SGP4 orbital propagation service."""

from datetime import datetime, timezone
import numpy as np
import pytest
from services.propagation import propagate_tle


def test_iss_propagation_altitude_range():
    """Asserts that ISS TLE propagates successfully and orbital altitude remains within LEO limits."""
    # Real ISS (ZARYA) NORAD 25544 TLE set
    tle_line1 = "1 25544U 98067A   24300.50000000  .00016717  00000-0  10270-3 0  9002"
    tle_line2 = "2 25544  51.6416 200.1234 0005432 120.4567 240.6789 15.49876543123456"

    start = datetime(2024, 10, 26, 12, 0, 0, tzinfo=timezone.utc)
    res = propagate_tle(tle_line1, tle_line2, start=start, window_hours=6, step_seconds=60)

    assert len(res["times"]) > 0, "Propagation failed to generate timesteps"
    assert res["positions"].shape[0] == len(res["times"]), "Position array mismatch"
    assert res["velocities"].shape[0] == len(res["times"]), "Velocity array mismatch"

    # Compute altitudes: |r| - R_earth (6371 km)
    radii = np.linalg.norm(res["positions"], axis=1)
    altitudes = radii - 6371.0

    mean_alt = float(np.mean(altitudes))
    min_alt = float(np.min(altitudes))
    max_alt = float(np.max(altitudes))

    # ISS nominal operational corridor is ~380 km to ~440 km
    assert 350.0 <= min_alt <= 460.0, f"Minimum altitude {min_alt} out of expected range"
    assert 370.0 <= max_alt <= 470.0, f"Maximum altitude {max_alt} out of expected range"
    assert 380.0 <= mean_alt <= 440.0, f"Mean altitude {mean_alt} out of expected range"

    # Orbital speed for LEO at ~400 km is ~7.67 km/s
    speeds = np.linalg.norm(res["velocities"], axis=1)
    mean_speed = float(np.mean(speeds))
    assert 7.4 <= mean_speed <= 7.9, f"Mean orbital speed {mean_speed} km/s out of expected range"
