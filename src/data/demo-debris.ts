/**
 * Demo Debris Data
 *
 * 500 synthetic debris fragments organized in three historical cluster events.
 * Each cluster represents a real-world debris-generating event with realistic
 * orbital parameter distributions.
 *
 * Clusters:
 * - Cosmos 2251 collision (2009): ~200 fragments, 750-850 km, 74 deg
 * - Fengyun 1C ASAT test (2007): ~200 fragments, 800-1000 km, 99 deg
 * - Iridium 33 collision (2009): ~100 fragments, 700-800 km, 86 deg
 */

import type { DebrisObject } from '../types';

/**
 * Generates a pseudo-random number from a seed for deterministic positioning.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generates a cluster of debris fragments.
 */
function generateDebrisCluster(
  startIdx: number,
  count: number,
  source: string,
  namePrefix: string,
  baseAltitude: number,
  altitudeSpread: number,
  baseInclination: number,
  inclinationSpread: number
): DebrisObject[] {
  const debris: DebrisObject[] = [];

  for (let i = 0; i < count; i++) {
    const id = startIdx + i;
    const seed = id * 13 + 47;
    const altitude = baseAltitude + (seededRandom(seed) - 0.5) * altitudeSpread;
    const inclination = baseInclination + (seededRandom(seed + 1) - 0.5) * inclinationSpread;
    const raan = seededRandom(seed + 2) * 360;
    const argPerigee = seededRandom(seed + 3) * 360;
    const meanAnomaly = seededRandom(seed + 4) * 360;
    const period = 2 * Math.PI * Math.sqrt(Math.pow(6371 + altitude, 3) / 398600.4418) / 60;

    debris.push({
      noradId: 50000 + id,
      name: `${namePrefix} DEB [${id}]`,
      source,
      altitude: Math.round(altitude),
      inclination: parseFloat(inclination.toFixed(1)),
      period: parseFloat(period.toFixed(1)),
      orbitalElements: {
        semiMajorAxis: 6371 + altitude,
        eccentricity: 0.001 + seededRandom(seed + 5) * 0.05,
        inclination,
        raan,
        argumentOfPerigee: argPerigee,
        meanAnomaly,
        epoch: '2026-10-28T00:00:00Z',
      },
    });
  }

  return debris;
}

/** Pre-generated array of 500 demo debris fragments across three historical clusters */
export const DEMO_DEBRIS: DebrisObject[] = [
  ...generateDebrisCluster(1, 200, 'Cosmos 2251 Collision', 'COSMOS 2251', 800, 100, 74.0, 2.0),
  ...generateDebrisCluster(201, 200, 'Fengyun 1C ASAT', 'FENGYUN 1C', 900, 200, 99.0, 2.0),
  ...generateDebrisCluster(401, 100, 'Iridium 33 Collision', 'IRIDIUM 33', 750, 100, 86.4, 1.5),
];
