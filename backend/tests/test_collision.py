"""Tests for collision probability estimation service."""

import numpy as np
import pytest
from services.collision import compute_pc, default_covariance, classify_risk


def test_compute_pc_distant_miss_returns_zero():
    """Asserts that Pc approaches zero when miss distance is vastly larger than positional sigma."""
    rel_pos = np.array([150.0, 0.0, 0.0])  # 150 km separation
    rel_vel = np.array([0.0, 10.0, 0.0])  # 10 km/s relative speed
    cov = default_covariance(altitude_km=500.0)  # sigma ~ 0.75 km

    pc = compute_pc(
        relative_position_km=rel_pos,
        relative_velocity_kms=rel_vel,
        covariance_km2=cov,
        hard_body_radius_km=0.01,
    )

    assert pc == 0.0 or pc < 1e-12, f"Expected Pc ~ 0 for distant pass, got {pc}"


def test_compute_pc_concentrated_direct_hit_approaches_one():
    """Asserts that Pc approaches 1.0 when the positional uncertainty lies entirely within the hard body radius."""
    # Head-on intercept at origin
    rel_pos = np.array([0.0, 0.0, 0.0])
    rel_vel = np.array([0.0, 0.0, 10.0])

    # Very small uncertainty: sigma = 0.002 km (2 meters)
    # Hard body radius: 0.02 km (20 meters) -> 10 * sigma
    cov = np.diag([0.002**2, 0.002**2, 0.002**2])

    pc = compute_pc(
        relative_position_km=rel_pos,
        relative_velocity_kms=rel_vel,
        covariance_km2=cov,
        hard_body_radius_km=0.02,
    )

    assert pc > 0.99, f"Expected Pc ~ 1.0 for concentrated direct hit, got {pc}"


def test_classify_risk_thresholds():
    """Validates risk tier classification boundaries."""
    assert classify_risk(0.0005) == "HIGH"
    assert classify_risk(1e-4) == "HIGH"
    assert classify_risk(5e-5) == "MEDIUM"
    assert classify_risk(1e-5) == "MEDIUM"
    assert classify_risk(9.9e-6) == "LOW"
    assert classify_risk(0.0) == "LOW"


def test_default_covariance_scaling():
    """Verifies default covariance matrix altitude scaling."""
    cov_leo = default_covariance(altitude_km=400.0)
    cov_geo = default_covariance(altitude_km=35786.0)

    # Higher altitude must exhibit higher positional uncertainty
    assert cov_geo[0, 0] > cov_leo[0, 0]
    assert cov_leo[0, 0] > 0.0
