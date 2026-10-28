/**
 * Demo Satellite Data
 *
 * 150 synthetic satellite entries for the VYOMSENTINEL dashboard visualization.
 * Each satellite has simplified orbital elements suitable for circular orbit approximation.
 *
 * Distribution:
 * - Starlink: 60 satellites (LEO, 550 km, 53 deg inclination)
 * - OneWeb: 30 satellites (LEO, 1200 km, 87.9 deg inclination)
 * - NASA: 15 satellites (mixed orbits)
 * - ESA: 15 satellites (mixed orbits)
 * - ISRO: 15 satellites (mixed orbits)
 * - Other: 15 satellites (mixed orbits)
 */

import type { SpaceObject, Operator } from '../types';

/**
 * Generates a pseudo-random number from a seed for deterministic positioning.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generates a batch of satellites with the given parameters.
 */
function generateBatch(
  startId: number,
  count: number,
  namePrefix: string,
  operator: Operator,
  baseAltitude: number,
  altitudeVariance: number,
  baseInclination: number,
  inclinationVariance: number
): SpaceObject[] {
  const satellites: SpaceObject[] = [];

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const seed = id * 7 + 31;
    const altitude = baseAltitude + seededRandom(seed) * altitudeVariance;
    const inclination = baseInclination + (seededRandom(seed + 1) - 0.5) * inclinationVariance;
    const raan = seededRandom(seed + 2) * 360;
    const argPerigee = seededRandom(seed + 3) * 360;
    const meanAnomaly = seededRandom(seed + 4) * 360;
    const period = 2 * Math.PI * Math.sqrt(Math.pow(6371 + altitude, 3) / 398600.4418) / 60;

    satellites.push({
      noradId: 40000 + id,
      name: `${namePrefix}-${String(id).padStart(4, '0')}`,
      objectType: 'Active Satellite',
      operator,
      altitude: Math.round(altitude),
      inclination: parseFloat(inclination.toFixed(1)),
      period: parseFloat(period.toFixed(1)),
      orbitalElements: {
        semiMajorAxis: 6371 + altitude,
        eccentricity: 0.0001 + seededRandom(seed + 5) * 0.002,
        inclination,
        raan,
        argumentOfPerigee: argPerigee,
        meanAnomaly,
        epoch: '2026-10-28T00:00:00Z',
      },
      tleLine1: `1 ${40000 + id}U 24001A   26301.00000000  .00000000  00000-0  00000-0 0  999${id % 10}`,
      tleLine2: `2 ${40000 + id}  ${inclination.toFixed(4).padStart(8)} ${raan.toFixed(4).padStart(8)} 0001000 ${argPerigee.toFixed(4).padStart(8)} ${meanAnomaly.toFixed(4).padStart(8)} ${(1440 / period).toFixed(8)}00001`,
    });
  }

  return satellites;
}

/** Pre-generated array of 150 demo satellites with deterministic orbital parameters */
export const DEMO_SATELLITES: SpaceObject[] = [
  ...generateBatch(1, 60, 'STARLINK', 'Starlink', 550, 20, 53.0, 1.0),
  ...generateBatch(61, 30, 'ONEWEB', 'OneWeb', 1200, 50, 87.9, 0.5),
  ...generateBatch(91, 15, 'NASA-SAT', 'NASA', 400, 200, 51.6, 20.0),
  ...generateBatch(106, 15, 'ESA-SAT', 'ESA', 700, 300, 65.0, 30.0),
  ...generateBatch(121, 15, 'ISRO-SAT', 'ISRO', 600, 250, 45.0, 30.0),
  ...generateBatch(136, 15, 'MISC-SAT', 'Other', 800, 400, 55.0, 40.0),
];
