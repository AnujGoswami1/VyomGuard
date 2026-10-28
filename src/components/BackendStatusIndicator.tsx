/**
 * BackendStatusIndicator Component
 *
 * Displays the current backend connection status with a colored dot and label.
 * Polls the backend health endpoint every 30 seconds.
 * Shows a tooltip with last check time and response latency on hover.
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/app-store';
import type { BackendStatus } from '../types';

/** Status display configuration */
const STATUS_CONFIG: Record<BackendStatus, { label: string; dotClass: string }> = {
  healthy: { label: 'SYSTEM ONLINE', dotClass: 'status-dot-green' },
  demo: { label: 'DEMO MODE', dotClass: 'status-dot-amber' },
  offline: { label: 'OFFLINE', dotClass: 'status-dot-red' },
  checking: { label: 'CHECKING', dotClass: 'status-dot-gray' },
};

/**
 * Backend health status indicator with hover tooltip.
 */
export const BackendStatusIndicator: React.FC = () => {
  const backendStatus = useAppStore((s) => s.backendStatus);
  const lastHealthCheck = useAppStore((s) => s.lastHealthCheck);
  const healthCheckLatency = useAppStore((s) => s.healthCheckLatency);
  const [showTooltip, setShowTooltip] = useState(false);

  const config = STATUS_CONFIG[backendStatus];

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-interactive
    >
      <span className={`status-dot ${config.dotClass}`} />
      <span className="font-mono-data text-xs text-vs-text-secondary tracking-wider">
        {config.label}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 glass p-3 rounded-lg min-w-48 z-50">
          <p className="font-mono-data text-xs text-vs-text-secondary">
            Status: {backendStatus}
          </p>
          {lastHealthCheck && (
            <p className="font-mono-data text-xs text-vs-text-secondary mt-1">
              Last check: {new Date(lastHealthCheck).toLocaleTimeString()}
            </p>
          )}
          {healthCheckLatency !== null && healthCheckLatency > 0 && (
            <p className="font-mono-data text-xs text-vs-text-secondary mt-1">
              Latency: {healthCheckLatency}ms
            </p>
          )}
        </div>
      )}
    </div>
  );
};
