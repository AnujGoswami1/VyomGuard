/**
 * API Hooks
 *
 * React hooks for backend data fetching and health monitoring.
 * Automatically falls back to demo mode if the backend is unreachable.
 */

import { useEffect, useCallback } from 'react';
import { checkHealth } from './client';
import { useAppStore } from '../store/app-store';
import { DEMO_SATELLITES } from '../data/demo-satellites';
import { DEMO_DEBRIS } from '../data/demo-debris';
import { DEMO_CONJUNCTIONS } from '../data/demo-conjunctions';

/** Health check polling interval in milliseconds */
const HEALTH_CHECK_INTERVAL_MS = 30000;

/**
 * Polls the backend health endpoint every 30 seconds.
 * Updates the global store with connection status and latency.
 * Loads demo data on first mount.
 */
export function useHealthCheck(): void {
  const setBackendStatus = useAppStore((s) => s.setBackendStatus);
  const setHealthCheck = useAppStore((s) => s.setHealthCheck);
  const setSatellites = useAppStore((s) => s.setSatellites);
  const setDebris = useAppStore((s) => s.setDebris);
  const setConjunctions = useAppStore((s) => s.setConjunctions);

  const performCheck = useCallback(async () => {
    const result = await checkHealth();

    if (result && result.status === 'ok') {
      setBackendStatus('healthy');
      setHealthCheck(result.latency);
    } else {
      setBackendStatus('demo');
      setHealthCheck(0);
    }
  }, [setBackendStatus, setHealthCheck]);

  useEffect(() => {
    // Load demo data immediately
    setSatellites(DEMO_SATELLITES);
    setDebris(DEMO_DEBRIS);
    setConjunctions(DEMO_CONJUNCTIONS);

    // Initial health check
    performCheck();

    // Periodic health checks
    const interval = setInterval(performCheck, HEALTH_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [performCheck, setSatellites, setDebris, setConjunctions]);
}
