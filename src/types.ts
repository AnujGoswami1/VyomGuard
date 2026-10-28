/**
 * VYOMSENTINEL Type Definitions
 *
 * Centralized type definitions for the space traffic management platform.
 * All types follow strict TypeScript conventions with full documentation.
 */

/** Orbital elements for a satellite or debris object */
export interface OrbitalElements {
  /** Semi-major axis in kilometers */
  semiMajorAxis: number;
  /** Eccentricity (0 = circular, <1 = elliptical) */
  eccentricity: number;
  /** Inclination in degrees */
  inclination: number;
  /** Right ascension of the ascending node in degrees */
  raan: number;
  /** Argument of perigee in degrees */
  argumentOfPerigee: number;
  /** Mean anomaly in degrees at epoch */
  meanAnomaly: number;
  /** Epoch as ISO 8601 timestamp */
  epoch: string;
}

/** Operator organization for satellite classification */
export type Operator = 'Starlink' | 'OneWeb' | 'NASA' | 'ESA' | 'ISRO' | 'Other';

/** Object type classification */
export type SpaceObjectType = 'Active Satellite' | 'Debris Fragment' | 'Rocket Body';

/** Risk classification levels for conjunction events */
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/** A tracked space object (satellite or debris) */
export interface SpaceObject {
  /** NORAD catalog identifier */
  noradId: number;
  /** Common name */
  name: string;
  /** Object classification */
  objectType: SpaceObjectType;
  /** Operating organization */
  operator: Operator;
  /** Orbital altitude in kilometers */
  altitude: number;
  /** Orbital inclination in degrees */
  inclination: number;
  /** Orbital period in minutes */
  period: number;
  /** Simplified orbital elements for visualization */
  orbitalElements: OrbitalElements;
  /** Two-line element set, line 1 */
  tleLine1: string;
  /** Two-line element set, line 2 */
  tleLine2: string;
}

/** A debris fragment tracked in the catalog */
export interface DebrisObject {
  /** NORAD catalog identifier */
  noradId: number;
  /** Common name or designation */
  name: string;
  /** Source event (collision, explosion, etc.) */
  source: string;
  /** Orbital altitude in kilometers */
  altitude: number;
  /** Orbital inclination in degrees */
  inclination: number;
  /** Orbital period in minutes */
  period: number;
  /** Simplified orbital elements for visualization */
  orbitalElements: OrbitalElements;
}

/** Position vector in Earth-centered inertial (ECI) coordinates */
export interface PositionECI {
  /** X component in kilometers */
  x: number;
  /** Y component in kilometers */
  y: number;
  /** Z component in kilometers */
  z: number;
}

/** A conjunction event between two tracked objects */
export interface ConjunctionEvent {
  /** Unique identifier for the conjunction */
  id: string;
  /** Primary object name */
  primaryName: string;
  /** Primary NORAD ID */
  primaryNoradId: number;
  /** Secondary object name */
  secondaryName: string;
  /** Secondary NORAD ID */
  secondaryNoradId: number;
  /** Time of closest approach (ISO 8601) */
  tca: string;
  /** Miss distance in kilometers */
  missDistanceKm: number;
  /** Relative velocity in km/s */
  relativeVelocityKms: number;
  /** Probability of collision */
  pc: number;
  /** Risk classification */
  riskLevel: RiskLevel;
  /** Position at closest approach for primary */
  primaryPosition: PositionECI;
  /** Position at closest approach for secondary */
  secondaryPosition: PositionECI;
}

/** Backend health check response */
export interface HealthResponse {
  status: string;
  version: string;
  spacetrack_configured: boolean;
  uptime_seconds: number;
}

/** Screening API response */
export interface ScreeningResponse {
  target: {
    norad_id: number;
    name: string;
    positions: Array<[string, number, number, number]>;
  };
  catalog: Array<{
    norad_id: number;
    name: string;
    positions: Array<[string, number, number, number]>;
  }>;
  conjunctions: Array<{
    object_name: string;
    norad_id: number;
    tca: string;
    miss_distance_km: number;
    relative_velocity_kms: number;
    pc: number;
    risk_level: RiskLevel;
    closest_positions: {
      target: [number, number, number];
      object: [number, number, number];
    };
  }>;
  metrics: {
    objects_screened: number;
    conjunctions_found: number;
    high_risk_count: number;
  };
}

/** Backend connection status */
export type BackendStatus = 'healthy' | 'demo' | 'offline' | 'checking';

/** Layer visibility controls for dashboard */
export interface LayerVisibility {
  satellites: boolean;
  debris: boolean;
  orbitPaths: boolean;
  labels: boolean;
  threatZones: boolean;
  clouds: boolean;
  nightLights: boolean;
}

/** Operator filter selections */
export type OperatorFilter = Record<Operator, boolean>;

/** Application global state */
export interface AppState {
  /** Current backend connection status */
  backendStatus: BackendStatus;
  /** Last health check time (ISO 8601) */
  lastHealthCheck: string | null;
  /** Health check latency in milliseconds */
  healthCheckLatency: number | null;
  /** Whether the loading screen is visible */
  isLoading: boolean;
  /** Selected space object NORAD ID, or null */
  selectedObjectId: number | null;
  /** Selected space object data */
  selectedObject: SpaceObject | DebrisObject | null;
  /** Whether the focus modal (video fullscreen) is open */
  isFocusModalOpen: boolean;
  /** Layer visibility toggles */
  layers: LayerVisibility;
  /** Operator filter selections */
  operatorFilter: OperatorFilter;
  /** Orbit speed multiplier */
  orbitSpeedMultiplier: number;
  /** Whether the conjunction simulation is running */
  isSimulationRunning: boolean;
  /** Simulation phase label */
  simulationPhase: string;
  /** Conjunction events loaded from API or demo data */
  conjunctions: ConjunctionEvent[];
  /** Demo satellites loaded from demo data */
  satellites: SpaceObject[];
  /** Demo debris loaded from demo data */
  debris: DebrisObject[];

  /** Actions */
  setBackendStatus: (status: BackendStatus) => void;
  setHealthCheck: (latency: number) => void;
  setLoading: (loading: boolean) => void;
  selectObject: (id: number | null, obj?: SpaceObject | DebrisObject | null) => void;
  openFocusModal: () => void;
  closeFocusModal: () => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  toggleOperatorFilter: (operator: Operator) => void;
  setOrbitSpeedMultiplier: (multiplier: number) => void;
  runSimulation: () => void;
  stopSimulation: () => void;
  setSimulationPhase: (phase: string) => void;
  setConjunctions: (events: ConjunctionEvent[]) => void;
  setSatellites: (sats: SpaceObject[]) => void;
  setDebris: (debris: DebrisObject[]) => void;
}
