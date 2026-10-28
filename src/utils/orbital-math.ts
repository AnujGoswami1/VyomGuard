/**
 * Orbital Mathematics Utilities
 *
 * Simplified orbital mechanics computations for 3D visualization.
 * Uses circular orbit approximation for satellite position rendering.
 *
 * Engineering Assumptions:
 * - Earth radius: 6371 km
 * - Gravitational parameter (mu): 398600.4418 km^3/s^2
 * - Visualization scale factor: 1 unit = 1 Earth radius
 * - Orbits are approximated as circular for visualization
 * - J2 perturbation is not modeled in the frontend (handled by SGP4 in backend)
 */

/** Earth radius in kilometers */
export const EARTH_RADIUS_KM = 6371.0;

/** Earth gravitational parameter in km^3/s^2 */
export const MU_EARTH = 398600.4418;

/** Degrees to radians conversion factor */
export const DEG_TO_RAD = Math.PI / 180.0;

/** Visualization scale: 1 Three.js unit = 1 Earth radius */
export const VIS_SCALE = 1.0 / EARTH_RADIUS_KM;

/**
 * Computes the orbital period from semi-major axis.
 *
 * @param semiMajorAxisKm - Semi-major axis in kilometers
 * @returns Period in seconds
 */
export function computePeriod(semiMajorAxisKm: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisKm, 3) / MU_EARTH);
}

/**
 * Computes the mean motion (angular velocity) from semi-major axis.
 *
 * @param semiMajorAxisKm - Semi-major axis in kilometers
 * @returns Mean motion in radians per second
 */
export function computeMeanMotion(semiMajorAxisKm: number): number {
  return Math.sqrt(MU_EARTH / Math.pow(semiMajorAxisKm, 3));
}

/**
 * Computes 3D position in the Three.js scene from orbital elements at a given time.
 *
 * Uses a simplified circular orbit model:
 * 1. Compute mean anomaly at time t
 * 2. Convert to position in orbital plane
 * 3. Rotate by RAAN, inclination, and argument of perigee
 * 4. Scale to visualization units
 *
 * @param altitude - Orbital altitude above Earth surface in km
 * @param inclination - Orbital inclination in degrees
 * @param raan - Right ascension of ascending node in degrees
 * @param argPerigee - Argument of perigee in degrees
 * @param meanAnomaly - Mean anomaly at epoch in degrees
 * @param elapsedSeconds - Seconds elapsed since epoch
 * @param earthRadiusVis - Earth sphere radius in Three.js units (default 2.0)
 * @returns [x, y, z] position in Three.js scene coordinates
 */
export function computeOrbitalPosition(
  altitude: number,
  inclination: number,
  raan: number,
  argPerigee: number,
  meanAnomaly: number,
  elapsedSeconds: number,
  earthRadiusVis: number = 2.0
): [number, number, number] {
  const semiMajorAxisKm = EARTH_RADIUS_KM + altitude;
  const orbitalRadius = (semiMajorAxisKm / EARTH_RADIUS_KM) * earthRadiusVis;

  const n = computeMeanMotion(semiMajorAxisKm);
  const currentAnomaly = (meanAnomaly * DEG_TO_RAD) + n * elapsedSeconds;

  const incRad = inclination * DEG_TO_RAD;
  const raanRad = raan * DEG_TO_RAD;
  const argPRad = argPerigee * DEG_TO_RAD;

  // Position in orbital plane
  const trueAnomaly = currentAnomaly; // Circular orbit: M = E = v
  const xOrb = orbitalRadius * Math.cos(trueAnomaly);
  const yOrb = orbitalRadius * Math.sin(trueAnomaly);

  // Rotation matrices combined: R_z(-RAAN) * R_x(-i) * R_z(-argP)
  const cosO = Math.cos(raanRad);
  const sinO = Math.sin(raanRad);
  const cosI = Math.cos(incRad);
  const sinI = Math.sin(incRad);
  const cosW = Math.cos(argPRad);
  const sinW = Math.sin(argPRad);

  const x =
    (cosO * cosW - sinO * sinW * cosI) * xOrb +
    (-cosO * sinW - sinO * cosW * cosI) * yOrb;

  const y =
    (sinO * cosW + cosO * sinW * cosI) * xOrb +
    (-sinO * sinW + cosO * cosW * cosI) * yOrb;

  const z =
    (sinW * sinI) * xOrb +
    (cosW * sinI) * yOrb;

  return [x, y, z];
}

/**
 * Generates an array of positions sampling a full orbit for path rendering.
 *
 * @param altitude - Orbital altitude in km
 * @param inclination - Orbital inclination in degrees
 * @param raan - RAAN in degrees
 * @param argPerigee - Argument of perigee in degrees
 * @param samples - Number of sample points (default 128)
 * @param earthRadiusVis - Earth radius in scene units
 * @returns Array of [x, y, z] positions
 */
export function sampleOrbitPath(
  altitude: number,
  inclination: number,
  raan: number,
  argPerigee: number,
  samples: number = 128,
  earthRadiusVis: number = 2.0
): Array<[number, number, number]> {
  const semiMajorAxisKm = EARTH_RADIUS_KM + altitude;
  const period = computePeriod(semiMajorAxisKm);
  const points: Array<[number, number, number]> = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * period;
    points.push(
      computeOrbitalPosition(altitude, inclination, raan, argPerigee, 0, t, earthRadiusVis)
    );
  }

  return points;
}

/**
 * Computes the Euclidean distance between two 3D positions.
 *
 * @param a - First position [x, y, z]
 * @param b - Second position [x, y, z]
 * @returns Distance in the same units as input
 */
export function distance3D(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
