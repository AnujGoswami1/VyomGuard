/**
 * API Client
 *
 * Axios-based HTTP client for communicating with the VYOMSENTINEL backend.
 * Automatically falls back to demo mode if the backend is unreachable.
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

/** Base URL for the backend API, configurable via environment variable */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Pre-configured Axios instance for all API calls.
 * Includes timeout, base URL, and JSON content type headers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Checks if the backend API is reachable and healthy.
 *
 * @returns Promise resolving to the health response, or null if unreachable
 */
export async function checkHealth(): Promise<{
  status: string;
  version: string;
  spacetrack_configured: boolean;
  uptime_seconds: number;
  latency: number;
} | null> {
  const start = performance.now();
  try {
    const response = await apiClient.get('/api/health', { timeout: 5000 });
    const latency = Math.round(performance.now() - start);
    return { ...response.data, latency };
  } catch {
    return null;
  }
}

/**
 * Fetches demo screening data from the backend.
 *
 * @returns Promise resolving to the screening response
 */
export async function fetchDemoData(): Promise<unknown> {
  try {
    const response = await apiClient.get('/api/demo');
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Submits a screening request to the backend.
 *
 * @param noradId - NORAD catalog ID of the primary object
 * @param windowHours - Screening window in hours
 * @param thresholdKm - Distance threshold in kilometers
 * @returns Promise resolving to the screening response
 */
export async function requestScreening(
  noradId: number,
  windowHours: number = 24,
  thresholdKm: number = 10.0
): Promise<unknown> {
  const response = await apiClient.post('/api/screen', {
    norad_id: noradId,
    window_hours: windowHours,
    threshold_km: thresholdKm,
  });
  return response.data;
}
