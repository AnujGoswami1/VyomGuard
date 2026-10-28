/**
 * Demo Data Constants
 *
 * Static demo data used when the backend is unreachable.
 * Mirrors the API response shape for seamless fallback.
 */

import { DEMO_SATELLITES } from '../data/demo-satellites';
import { DEMO_DEBRIS } from '../data/demo-debris';
import { DEMO_CONJUNCTIONS } from '../data/demo-conjunctions';

/** Demo metrics for the dashboard threat feed header */
export const DEMO_METRICS = {
  objectsScreened: DEMO_SATELLITES.length + DEMO_DEBRIS.length,
  conjunctionsFound: DEMO_CONJUNCTIONS.length,
  highRiskCount: DEMO_CONJUNCTIONS.filter((c) => c.riskLevel === 'HIGH').length,
};

/** Total tracked objects count for homepage stats */
export const TOTAL_TRACKED_OBJECTS = 15000;

/** Active satellites count for homepage stats */
export const ACTIVE_SATELLITES = 10500;

/** Debris fragment count for homepage stats */
export const DEBRIS_FRAGMENTS = 500;
