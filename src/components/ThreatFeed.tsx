import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldAlert, Radio } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { AnimatedCounter } from './AnimatedCounter';
import {
  formatDistanceKm,
  formatPc,
  formatUTCDate,
  riskHex,
} from '../utils/format';
import type { ConjunctionEvent } from '../types';

/**
 * ThreatFeed Component
 * Right dashboard sidebar displaying real-time conjunction warnings,
 * probability of collision (Pc) logarithmic bars, and miss distances.
 */
export const ThreatFeed: React.FC = () => {
  const conjunctions = useAppStore((s) => s.conjunctions);
  const satellites = useAppStore((s) => s.satellites);
  const debris = useAppStore((s) => s.debris);
  const selectObject = useAppStore((s) => s.selectObject);
  const selectedObjectId = useAppStore((s) => s.selectedObjectId);

  const totalScreened = satellites.length + debris.length;
  const highRiskCount = conjunctions.filter((c) => c.riskLevel === 'HIGH').length;

  const handleCardClick = (conj: ConjunctionEvent) => {
    // Locate target satellite in loaded catalog
    const primary = satellites.find((s) => s.noradId === conj.primaryNoradId);
    if (primary) {
      selectObject(conj.primaryNoradId, primary);
    } else {
      selectObject(conj.primaryNoradId, null);
    }
  };

  return (
    <aside className="w-96 glass p-5 flex flex-col h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2 text-vs-alert">
          <ShieldAlert className="w-4 h-4" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            Threat Feed
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-vs-cyan font-mono-data text-[11px]">
          <span className="w-2 h-2 rounded-full bg-vs-cyan animate-ping" />
          <span>LIVE SCREENING</span>
        </div>
      </div>

      {/* Screened Telemetry Counters */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
          <span className="block text-[10px] uppercase font-mono-data text-vs-text-secondary">
            Screened
          </span>
          <AnimatedCounter
            value={totalScreened}
            className="text-base font-bold text-white"
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
          <span className="block text-[10px] uppercase font-mono-data text-vs-text-secondary">
            Encounters
          </span>
          <AnimatedCounter
            value={conjunctions.length}
            className="text-base font-bold text-vs-warning"
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
          <span className="block text-[10px] uppercase font-mono-data text-vs-text-secondary">
            High Risk
          </span>
          <AnimatedCounter
            value={highRiskCount}
            className="text-base font-bold text-vs-alert"
          />
        </div>
      </div>

      {/* Conjunction Card List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {conjunctions.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-vs-text-secondary p-4">
            <Radio className="w-8 h-8 text-white/20 mb-2 animate-pulse" />
            <p className="font-heading text-xs uppercase tracking-wider">
              No conjunctions detected in this window
            </p>
          </div>
        ) : (
          conjunctions.map((conj, idx) => {
            const hex = riskHex(conj.riskLevel);
            const isSelected = selectedObjectId === conj.primaryNoradId;

            // Logarithmic scale for Pc bar (clamped between 0.05 and 1.0)
            const logPc = Math.max(0.05, Math.min(1.0, (Math.log10(conj.pc) + 7) / 4));

            return (
              <motion.div
                key={conj.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                onClick={() => handleCardClick(conj)}
                className={`p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                  isSelected
                    ? 'bg-white/10 border-vs-cyan shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                }`}
                data-interactive
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: hex }} />
                    <span className="font-heading text-xs font-bold text-white truncate">
                      {conj.primaryName}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-mono-data px-1.5 py-0.5 rounded border uppercase font-semibold"
                    style={{
                      borderColor: `${hex}60`,
                      color: hex,
                      backgroundColor: `${hex}15`,
                    }}
                  >
                    {conj.riskLevel}
                  </span>
                </div>

                <div className="text-[11px] font-mono-data text-vs-text-secondary mb-2 truncate">
                  vs {conj.secondaryName} (NORAD {conj.secondaryNoradId})
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data text-vs-text-secondary mb-2">
                  <div>
                    <span className="block text-[9px] uppercase tracking-tight text-vs-text-secondary/60">
                      TCA (UTC)
                    </span>
                    <span className="text-white truncate block">
                      {formatUTCDate(conj.tca).split(' ')[1]}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-tight text-vs-text-secondary/60">
                      Miss Distance
                    </span>
                    <span className="text-vs-cyan font-bold block">
                      {formatDistanceKm(conj.missDistanceKm)}
                    </span>
                  </div>
                </div>

                {/* Logarithmic Collision Probability Meter */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono-data mb-1">
                    <span className="text-vs-text-secondary/70">Probability (Pc)</span>
                    <span className="font-bold" style={{ color: hex }}>
                      {formatPc(conj.pc)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${logPc * 100}%`,
                        backgroundColor: hex,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </aside>
  );
};
