/**
 * Formatting Utilities
 *
 * Number, date, and string formatting functions for the VYOMSENTINEL UI.
 * All functions are pure with no side effects.
 */

/**
 * Formats a number with thousands separators.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default 0)
 * @returns Formatted string (e.g., "15,000")
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a distance in kilometers with appropriate precision.
 *
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "2.34 km")
 */
export function formatDistanceKm(km: number): string {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  if (km < 100) {
    return `${km.toFixed(2)} km`;
  }
  return `${formatNumber(Math.round(km))} km`;
}

/**
 * Formats a probability of collision in scientific notation.
 *
 * @param pc - Probability of collision (0 to 1)
 * @returns Formatted string (e.g., "3.2e-4")
 */
export function formatPc(pc: number): string {
  if (pc === 0) return '0';
  if (pc >= 0.01) return pc.toFixed(4);
  return pc.toExponential(1);
}

/**
 * Formats an ISO date string to UTC display format.
 *
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted UTC string (e.g., "2026-10-28 14:32:45 UTC")
 */
export function formatUTCDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

/**
 * Formats a duration in seconds as elapsed mission time.
 *
 * @param totalSeconds - Total elapsed seconds
 * @returns Formatted string (e.g., "T+ 00:04:32")
 */
export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `T+ ${hh}:${mm}:${ss}`;
}

/**
 * Formats velocity in km/s with appropriate precision.
 *
 * @param kms - Velocity in km/s
 * @returns Formatted string (e.g., "7.82 km/s")
 */
export function formatVelocity(kms: number): string {
  return `${kms.toFixed(2)} km/s`;
}

/**
 * Returns a CSS color class name based on risk level.
 *
 * @param riskLevel - Risk classification ("HIGH", "MEDIUM", "LOW")
 * @returns Tailwind color class string
 */
export function riskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH':
      return 'text-vs-alert';
    case 'MEDIUM':
      return 'text-vs-warning';
    case 'LOW':
      return 'text-vs-success';
    default:
      return 'text-vs-text-secondary';
  }
}

/**
 * Returns the hex color for a risk level.
 *
 * @param riskLevel - Risk classification
 * @returns Hex color string
 */
export function riskHex(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH':
      return '#ff3366';
    case 'MEDIUM':
      return '#ffb700';
    case 'LOW':
      return '#00ff88';
    default:
      return '#9ca3af';
  }
}

/**
 * Returns the operator color as hex.
 *
 * @param operator - Operator name
 * @returns Hex color string
 */
export function operatorColor(operator: string): string {
  switch (operator) {
    case 'Starlink':
      return '#00f5ff';
    case 'OneWeb':
      return '#a855f7';
    case 'NASA':
      return '#00ff88';
    case 'ESA':
      return '#ffb700';
    case 'ISRO':
      return '#ff8c00';
    default:
      return '#ffffff';
  }
}
