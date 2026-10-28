import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Sliders,
  Play,
  ArrowLeft,
  Radio,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '../store/app-store';
import type { Operator, LayerVisibility } from '../types';

interface ToggleItemProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, enabled, onToggle }) => (
  <div
    onClick={onToggle}
    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 cursor-pointer select-none transition-colors"
    data-interactive
  >
    <span className="text-xs font-mono-data text-vs-text">{label}</span>
    <div
      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
        enabled ? 'bg-vs-cyan' : 'bg-white/20'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-4 h-4 rounded-full shadow-md ${
          enabled ? 'bg-black' : 'bg-white/60'
        }`}
        style={{ marginLeft: enabled ? '1rem' : '0rem' }}
      />
    </div>
  </div>
);

/**
 * LayerControls Component
 * Left dashboard sidebar providing fine-grained visibility toggles, operator
 * constellation filters, orbital propagation velocity scaling, and simulation triggers.
 */
export const LayerControls: React.FC = () => {
  const navigate = useNavigate();
  const layers = useAppStore((s) => s.layers);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const operatorFilter = useAppStore((s) => s.operatorFilter);
  const toggleOperatorFilter = useAppStore((s) => s.toggleOperatorFilter);
  const orbitSpeedMultiplier = useAppStore((s) => s.orbitSpeedMultiplier);
  const setOrbitSpeedMultiplier = useAppStore((s) => s.setOrbitSpeedMultiplier);
  const runSimulation = useAppStore((s) => s.runSimulation);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);

  const layerItems: Array<{ key: keyof LayerVisibility; label: string }> = [
    { key: 'satellites', label: 'Active Satellites' },
    { key: 'debris', label: 'Debris Clouds' },
    { key: 'orbitPaths', label: 'Orbit Trajectories' },
    { key: 'labels', label: 'Telemetry Labels' },
    { key: 'threatZones', label: 'Conjunction Rings' },
    { key: 'clouds', label: 'Atmospheric Glow' },
    { key: 'nightLights', label: 'City Night Lights' },
  ];

  const operators: Operator[] = ['Starlink', 'OneWeb', 'NASA', 'ESA', 'ISRO', 'Other'];

  return (
    <aside className="w-72 glass p-5 flex flex-col justify-between h-[calc(100vh-5.5rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Layer Visibility Header */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-vs-cyan">
            <Layers className="w-4 h-4" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider">
              Layer Controls
            </span>
          </div>
          <div className="space-y-1">
            {layerItems.map((item) => (
              <ToggleItem
                key={item.key}
                label={item.label}
                enabled={layers[item.key]}
                onToggle={() => toggleLayer(item.key)}
              />
            ))}
          </div>
        </div>

        {/* Orbit Speed Multiplier */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-vs-text-secondary">
              <Sliders className="w-3.5 h-3.5 text-vs-cyan" />
              <span className="font-heading text-xs uppercase tracking-wider font-semibold">
                Time Scaling
              </span>
            </div>
            <span className="font-mono-data text-xs text-vs-cyan font-bold">
              {orbitSpeedMultiplier.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={orbitSpeedMultiplier}
            onChange={(e) => setOrbitSpeedMultiplier(parseFloat(e.target.value))}
            className="w-full accent-vs-cyan bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            data-interactive
          />
          <div className="flex justify-between text-[10px] font-mono-data text-vs-text-secondary mt-1">
            <span>0.1x</span>
            <span>1.0x Real-Sim</span>
            <span>5.0x</span>
          </div>
        </div>

        {/* Operator Filter Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 text-vs-text-secondary">
            <Radio className="w-3.5 h-3.5 text-vs-cyan" />
            <span className="font-heading text-xs uppercase tracking-wider font-semibold">
              Operator Filters
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {operators.map((op) => {
              const active = operatorFilter[op];
              return (
                <button
                  key={op}
                  onClick={() => toggleOperatorFilter(op)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono-data text-left flex items-center justify-between transition-all border ${
                    active
                      ? 'bg-vs-cyan/15 text-white border-vs-cyan/40 shadow-[0_0_10px_rgba(0,245,255,0.15)]'
                      : 'bg-white/5 text-vs-text-secondary border-white/10'
                  }`}
                  data-interactive
                >
                  <span className="truncate">{op}</span>
                  {active ? (
                    <Eye className="w-3 h-3 text-vs-cyan shrink-0" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-vs-text-secondary/50 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-6 border-t border-white/10">
        <button
          onClick={runSimulation}
          disabled={isSimulationRunning}
          className="w-full py-2.5 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-vs-cyan to-vs-violet text-black shadow-lg shadow-vs-cyan/25 hover:shadow-vs-cyan/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          data-interactive
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Conjunction Demo</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-2 px-4 rounded-xl font-heading text-xs font-semibold tracking-wider text-vs-text-secondary hover:text-white border border-white/10 hover:border-white/30 transition-colors flex items-center justify-center gap-2 bg-white/5"
          data-interactive
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </button>
      </div>
    </aside>
  );
};
