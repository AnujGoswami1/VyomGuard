import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';
import { DashboardScene } from '../components/DashboardScene';
import { LayerControls } from '../components/LayerControls';
import { ThreatFeed } from '../components/ThreatFeed';
import { SelectedObjectPanel } from '../components/SelectedObjectPanel';
import { MissionClock } from '../components/MissionClock';
import { BackendStatusIndicator } from '../components/BackendStatusIndicator';
import { CustomCursor } from '../components/CustomCursor';

/**
 * DashboardPage Component
 * Mission Control operating console framing 3D orbital space with
 * synchronized mission clock, layer visibility panel, live threat feed,
 * and detailed spacecraft telemetry inspectors.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-vs-bg-deep select-none">
      <CustomCursor />

      {/* Top Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass z-30 px-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left group"
            data-interactive
          >
            <div className="w-2.5 h-2.5 rounded-full bg-vs-cyan shadow-[0_0_10px_#00f5ff]" />
            <span className="font-heading text-sm font-bold tracking-[0.2em] text-white uppercase group-hover:text-vs-cyan transition-colors">
              VYOMSENTINEL
            </span>
          </button>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

          <span className="font-mono-data text-xs text-vs-text-secondary tracking-widest uppercase hidden sm:inline">
            Orbital Traffic Command
          </span>
        </div>

        {/* Center UTC & Elapsed Mission Clock */}
        <div className="hidden md:flex items-center justify-center">
          <MissionClock />
        </div>

        {/* Right Nav Links & Backend Health */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-vs-text-secondary hover:text-white hover:bg-white/10 transition-colors"
            title="Return to Home"
            data-interactive
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/privacy-shield')}
            className="px-3 py-1.5 rounded-lg text-xs font-heading font-medium tracking-wider text-vs-text hover:text-vs-cyan border border-white/10 hover:border-vs-cyan/40 bg-white/5 transition-colors flex items-center gap-1.5"
            data-interactive
          >
            <Shield className="w-3.5 h-3.5 text-vs-cyan" />
            <span className="hidden sm:inline">Privacy Shield</span>
          </button>
          <div className="pl-2 border-l border-white/10">
            <BackendStatusIndicator />
          </div>
        </div>
      </header>

      {/* Main 3D Space Viewport */}
      <main className="absolute inset-0 pt-16">
        <DashboardScene />
      </main>

      {/* Left Sidebar: Controls & Toggles */}
      <div className="fixed top-20 left-6 z-20 pointer-events-auto">
        <LayerControls />
      </div>

      {/* Right Sidebar: Threat & Conjunction Feed */}
      <div className="fixed top-20 right-6 z-20 pointer-events-auto">
        <ThreatFeed />
      </div>

      {/* Floating Selected Spacecraft Telemetry Card */}
      <SelectedObjectPanel />
    </div>
  );
};
