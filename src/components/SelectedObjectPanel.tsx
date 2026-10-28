import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Satellite, AlertOctagon, Crosshair } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { formatNumber } from '../utils/format';
import type { SpaceObject, DebrisObject } from '../types';

/**
 * SelectedObjectPanel Component
 * Slide-up HUD displaying granular orbital telemetry, NORAD ephemeris,
 * two-line element set (TLE), and maneuverability classifications.
 */
export const SelectedObjectPanel: React.FC = () => {
  const selectedObjectId = useAppStore((s) => s.selectedObjectId);
  const selectedObject = useAppStore((s) => s.selectedObject);
  const selectObject = useAppStore((s) => s.selectObject);

  if (!selectedObjectId || !selectedObject) {
    return null;
  }

  const isSat = 'operator' in selectedObject;
  const sat = isSat ? (selectedObject as SpaceObject) : null;
  const deb = !isSat ? (selectedObject as DebrisObject) : null;

  const handleClose = () => {
    selectObject(null, null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-80 z-20 w-96 glass-strong p-5 rounded-2xl shadow-2xl border border-white/15"
      >
        {/* Panel Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-vs-cyan/15 text-vs-cyan border border-vs-cyan/30">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white leading-tight">
                {selectedObject.name}
              </h3>
              <span className="text-[10px] font-mono-data text-vs-text-secondary uppercase">
                NORAD ID: {selectedObject.noradId} · {isSat ? sat?.operator : 'DEBRIS CLOUD'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-vs-text-secondary hover:text-white hover:bg-white/10 transition-colors"
            data-interactive
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orbital Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-3 text-[11px] font-mono-data">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-vs-text-secondary/60">
              Altitude
            </span>
            <span className="text-white font-semibold">
              {formatNumber(selectedObject.altitude)} km
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-vs-text-secondary/60">
              Inclination
            </span>
            <span className="text-white font-semibold">
              {selectedObject.inclination.toFixed(1)}°
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-vs-text-secondary/60">
              Period
            </span>
            <span className="text-white font-semibold">
              {selectedObject.period.toFixed(1)} min
            </span>
          </div>
        </div>

        {/* TLE or Debris Warning */}
        {sat ? (
          <div className="mb-4">
            <span className="block text-[9px] uppercase tracking-wider font-mono-data text-vs-text-secondary/70 mb-1">
              Two-Line Element Set (Ephemeris)
            </span>
            <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 font-mono-data text-[10px] text-vs-success leading-relaxed overflow-x-auto whitespace-pre">
              {sat.tleLine1}
              <br />
              {sat.tleLine2}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-2.5 rounded-lg bg-vs-alert/15 border border-vs-alert/30 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-vs-alert shrink-0" />
            <p className="text-[11px] font-mono-data text-vs-alert leading-tight">
              Non-maneuverable object. High collision risk. Tracking derived from radar reflection cross-section.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Simulated focal lock
            }}
            className="flex-1 py-2 px-3 rounded-lg font-heading text-xs font-semibold tracking-wider bg-white/10 text-white hover:bg-white/15 border border-white/20 transition-colors flex items-center justify-center gap-1.5"
            data-interactive
          >
            <Crosshair className="w-3.5 h-3.5 text-vs-cyan" />
            <span>Target Lock</span>
          </button>
          <button
            onClick={handleClose}
            className="py-2 px-4 rounded-lg font-heading text-xs font-semibold tracking-wider text-vs-text-secondary hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            data-interactive
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
