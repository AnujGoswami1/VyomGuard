/**
 * Zustand Global State Store
 *
 * Centralized application state for VYOMSENTINEL.
 * Manages UI state, layer visibility, selected objects, and simulation state.
 */

import { create } from 'zustand';
import type {
  AppState,
  BackendStatus,
  ConjunctionEvent,
  DebrisObject,
  LayerVisibility,
  Operator,
  SpaceObject,
} from '../types';

/**
 * Default layer visibility — all layers visible on initial load.
 */
const DEFAULT_LAYERS: LayerVisibility = {
  satellites: true,
  debris: true,
  orbitPaths: true,
  labels: true,
  threatZones: true,
  clouds: true,
  nightLights: true,
};

/**
 * Default operator filter — all operators visible on initial load.
 */
const DEFAULT_OPERATOR_FILTER: Record<Operator, boolean> = {
  Starlink: true,
  OneWeb: true,
  NASA: true,
  ESA: true,
  ISRO: true,
  Other: true,
};

/**
 * Creates the global application store with Zustand.
 * All state mutations are encapsulated as named actions.
 */
export const useAppStore = create<AppState>((set) => ({
  backendStatus: 'checking' as BackendStatus,
  lastHealthCheck: null,
  healthCheckLatency: null,
  isLoading: true,
  selectedObjectId: null,
  selectedObject: null,
  isFocusModalOpen: false,
  layers: DEFAULT_LAYERS,
  operatorFilter: DEFAULT_OPERATOR_FILTER,
  orbitSpeedMultiplier: 1.0,
  isSimulationRunning: false,
  simulationPhase: '',
  conjunctions: [],
  satellites: [],
  debris: [],

  setBackendStatus: (status: BackendStatus) => set({ backendStatus: status }),

  setHealthCheck: (latency: number) =>
    set({
      lastHealthCheck: new Date().toISOString(),
      healthCheckLatency: latency,
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  selectObject: (id: number | null, obj?: SpaceObject | DebrisObject | null) =>
    set({ selectedObjectId: id, selectedObject: obj ?? null }),

  openFocusModal: () => set({ isFocusModalOpen: true }),

  closeFocusModal: () => set({ isFocusModalOpen: false }),

  toggleLayer: (layer: keyof LayerVisibility) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),

  toggleOperatorFilter: (operator: Operator) =>
    set((state) => ({
      operatorFilter: {
        ...state.operatorFilter,
        [operator]: !state.operatorFilter[operator],
      },
    })),

  setOrbitSpeedMultiplier: (multiplier: number) =>
    set({ orbitSpeedMultiplier: multiplier }),

  runSimulation: () =>
    set({ isSimulationRunning: true, simulationPhase: 'Initiating approach' }),

  stopSimulation: () =>
    set({ isSimulationRunning: false, simulationPhase: '' }),

  setSimulationPhase: (phase: string) => set({ simulationPhase: phase }),

  setConjunctions: (events: ConjunctionEvent[]) => set({ conjunctions: events }),

  setSatellites: (sats: SpaceObject[]) => set({ satellites: sats }),

  setDebris: (debris: DebrisObject[]) => set({ debris: debris }),
}));
