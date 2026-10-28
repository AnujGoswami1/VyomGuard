"""Collision probability estimation service.

Implements short-encounter 2D Gaussian probability of collision (Pc) integration
on the encounter plane (B-plane) based on the Foster (1992) and Akella-Alfriend (2000) formulations.
"""

import math
import logging
from typing import Literal
import numpy as np
from scipy.integrate import dblquad

logger = logging.getLogger("vyomsentinel.collision")


def default_covariance(altitude_km: float) -> np.ndarray:
    """Computes a default isotropic position covariance matrix for given altitude.

    Args:
        altitude_km: Orbit altitude above mean Earth radius in kilometers.

    Returns:
        3x3 numpy covariance matrix in km^2.
    """
    sigma = 0.5 + max(0.0, altitude_km) / 2000.0
    return np.diag([sigma**2, sigma**2, sigma**2]).astype(np.float64)


def classify_risk(pc: float) -> Literal["HIGH", "MEDIUM", "LOW"]:
    """Categorizes collision risk level into standard operational tiers.

    Args:
        pc: Probability of collision (0.0 to 1.0).

    Returns:
        One of 'HIGH', 'MEDIUM', or 'LOW'.
    """
    if pc >= 1e-4:
        return "HIGH"
    elif pc >= 1e-5:
        return "MEDIUM"
    return "LOW"


def compute_pc(
    relative_position_km: np.ndarray,
    relative_velocity_kms: np.ndarray,
    covariance_km2: np.ndarray,
    hard_body_radius_km: float = 0.01,
) -> float:
    """Computes probability of collision (Pc) by integrating 2D Gaussian PDF over hard body disk.

    Args:
        relative_position_km: 3D relative position vector (km).
        relative_velocity_kms: 3D relative velocity vector (km/s).
        covariance_km2: 3x3 combined position covariance matrix (km^2).
        hard_body_radius_km: Combined spherical hard-body radius in kilometers (default 10 meters).

    Returns:
        Probability of collision clamped to [0.0, 1.0].
    """
    rel_pos = np.asarray(relative_position_km, dtype=np.float64).flatten()
    rel_vel = np.asarray(relative_velocity_kms, dtype=np.float64).flatten()

    v_norm = np.linalg.norm(rel_vel)
    if v_norm < 1e-7:
        # Relative velocity too small for rectilinear encounter approximation
        return 0.0

    v_hat = rel_vel / v_norm

    # Construct encounter plane orthonormal basis (u_hat, w_hat) perpendicular to relative velocity
    if abs(v_hat[2]) < 0.9:
        ref = np.array([0.0, 0.0, 1.0])
    else:
        ref = np.array([1.0, 0.0, 0.0])

    u_hat = np.cross(v_hat, ref)
    u_hat /= np.linalg.norm(u_hat)
    w_hat = np.cross(v_hat, u_hat)
    w_hat /= np.linalg.norm(w_hat)

    # Projection matrix from 3D ECI to 2D encounter plane (2 x 3)
    proj_matrix = np.vstack([u_hat, w_hat])

    # Project relative position onto encounter plane
    r_encounter = proj_matrix @ rel_pos
    x_m, y_m = float(r_encounter[0]), float(r_encounter[1])

    # Project 3D covariance to 2D encounter plane covariance (2 x 2)
    cov_2d = proj_matrix @ covariance_km2 @ proj_matrix.T

    # Condition covariance to ensure positive definiteness
    cov_2d += np.eye(2) * 1e-12
    det_cov = np.linalg.det(cov_2d)

    if det_cov <= 0.0:
        return 0.0

    inv_cov = np.linalg.inv(cov_2d)
    norm_factor = 1.0 / (2.0 * math.pi * math.sqrt(det_cov))

    # Fast check: If miss distance >> 10 * sigma_max, Pc is effectively 0
    eig_vals = np.linalg.eigvalsh(cov_2d)
    max_sigma = math.sqrt(max(eig_vals))
    miss_dist = math.hypot(x_m, y_m)
    if miss_dist > 15.0 * max_sigma:
        return 0.0

    # 2D Gaussian density function in polar coordinates centered at (x_m, y_m)
    def integrand(r: float, theta: float) -> float:
        x = x_m + r * math.cos(theta)
        y = y_m + r * math.sin(theta)
        diff = np.array([x, y])
        quad_form = float(diff.T @ inv_cov @ diff)
        return float(norm_factor * math.exp(-0.5 * quad_form) * r)

    try:
        # Integrate over hard-body disk radius [0, hard_body_radius_km] and theta [0, 2*pi]
        pc_val, _ = dblquad(
            integrand,
            0.0,
            2.0 * math.pi,
            lambda _: 0.0,
            lambda _: hard_body_radius_km,
            epsabs=1e-10,
            epsrel=1e-6,
        )
        return float(np.clip(pc_val, 0.0, 1.0))
    except Exception as e:
        logger.warning(f"Quadrature integration exception: {str(e)}")
        # Asymptotic approximation for very small hard body disk: Area * f(0,0)
        center_quad = float(r_encounter.T @ inv_cov @ r_encounter)
        density_center = norm_factor * math.exp(-0.5 * center_quad)
        area = math.pi * (hard_body_radius_km**2)
        approx = density_center * area
        return float(np.clip(approx, 0.0, 1.0))
