/**
 * Demo Conjunction Data
 *
 * Five pre-computed conjunction events with varied risk levels
 * for the VYOMSENTINEL dashboard demonstration.
 *
 * These represent realistic conjunction scenarios between
 * active satellites and debris fragments.
 */

import type { ConjunctionEvent } from '../types';

/** Pre-computed demo conjunction events sorted by miss distance ascending */
export const DEMO_CONJUNCTIONS: ConjunctionEvent[] = [
  {
    id: 'CDM-001',
    primaryName: 'STARLINK-0005',
    primaryNoradId: 40005,
    secondaryName: 'COSMOS 2251 DEB [42]',
    secondaryNoradId: 50042,
    tca: '2026-10-28T14:32:00Z',
    missDistanceKm: 0.45,
    relativeVelocityKms: 14.2,
    pc: 3.2e-4,
    riskLevel: 'HIGH',
    primaryPosition: { x: 2.14, y: 0.85, z: -1.32 },
    secondaryPosition: { x: 2.15, y: 0.86, z: -1.31 },
  },
  {
    id: 'CDM-002',
    primaryName: 'ISS (ZARYA)',
    primaryNoradId: 25544,
    secondaryName: 'FENGYUN 1C DEB [215]',
    secondaryNoradId: 50215,
    tca: '2026-10-28T18:15:00Z',
    missDistanceKm: 1.87,
    relativeVelocityKms: 11.8,
    pc: 5.1e-5,
    riskLevel: 'MEDIUM',
    primaryPosition: { x: -1.92, y: 1.12, z: 0.67 },
    secondaryPosition: { x: -1.90, y: 1.14, z: 0.69 },
  },
  {
    id: 'CDM-003',
    primaryName: 'ONEWEB-0073',
    primaryNoradId: 40073,
    secondaryName: 'IRIDIUM 33 DEB [415]',
    secondaryNoradId: 50415,
    tca: '2026-10-29T02:47:00Z',
    missDistanceKm: 3.54,
    relativeVelocityKms: 9.6,
    pc: 8.7e-6,
    riskLevel: 'LOW',
    primaryPosition: { x: 0.45, y: -2.31, z: 1.15 },
    secondaryPosition: { x: 0.48, y: -2.28, z: 1.18 },
  },
  {
    id: 'CDM-004',
    primaryName: 'ESA-SAT-0108',
    primaryNoradId: 40108,
    secondaryName: 'COSMOS 2251 DEB [167]',
    secondaryNoradId: 50167,
    tca: '2026-10-29T08:03:00Z',
    missDistanceKm: 2.12,
    relativeVelocityKms: 12.4,
    pc: 4.5e-5,
    riskLevel: 'MEDIUM',
    primaryPosition: { x: 1.78, y: -0.92, z: -1.85 },
    secondaryPosition: { x: 1.80, y: -0.90, z: -1.83 },
  },
  {
    id: 'CDM-005',
    primaryName: 'ISRO-SAT-0125',
    primaryNoradId: 40125,
    secondaryName: 'FENGYUN 1C DEB [303]',
    secondaryNoradId: 50303,
    tca: '2026-10-29T12:22:00Z',
    missDistanceKm: 7.89,
    relativeVelocityKms: 7.3,
    pc: 2.1e-7,
    riskLevel: 'LOW',
    primaryPosition: { x: -0.67, y: 2.15, z: 0.34 },
    secondaryPosition: { x: -0.61, y: 2.21, z: 0.40 },
  },
];
