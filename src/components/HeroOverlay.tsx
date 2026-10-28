import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  BookOpen,
  ChevronDown,
  Activity,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';
import { TypewriterText } from './TypewriterText';
import { AnimatedCounter } from './AnimatedCounter';
import { BackendStatusIndicator } from './BackendStatusIndicator';

interface HeroOverlayProps {
  /** Normalized scroll progress between 0.0 and 1.0 */
  scrollProgress: number;
}

/**
 * Calculates continuous, buttery-smooth opacity and vertical displacement
 * for a card across its designated scroll window.
 */
function computeCardMotion(
  s: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number
): { opacity: number; y: number; scale: number; pointerEvents: 'auto' | 'none' } {
  let opacity = 0;
  let y = 35;
  let scale = 0.94;

  if (s < start) {
    opacity = 0;
    y = 35;
    scale = 0.94;
  } else if (s < peakStart) {
    // Smooth ingress easing
    const t = (s - start) / (peakStart - start);
    const ease = t * t * (3 - 2 * t);
    opacity = ease;
    y = 35 * (1 - ease);
    scale = 0.94 + 0.06 * ease;
  } else if (s <= peakEnd) {
    // In active focus
    opacity = 1;
    y = 0;
    scale = 1.0;
  } else if (s < end) {
    // Smooth egress easing
    const t = (s - peakEnd) / (end - peakEnd);
    const ease = t * t * (3 - 2 * t);
    opacity = 1 - ease;
    y = -35 * ease;
    scale = 1.0 - 0.04 * ease;
  } else {
    opacity = 0;
    y = -35;
    scale = 0.94;
  }

  return {
    opacity,
    y,
    scale,
    pointerEvents: opacity > 0.25 ? 'auto' : 'none',
  };
}

/**
 * HeroOverlay Component
 * Renders fixed top navigation, continuous scroll-synchronized side cards,
 * and bottom telemetry status.
 */
export const HeroOverlay: React.FC<HeroOverlayProps> = ({ scrollProgress }) => {
  const navigate = useNavigate();

  const titleWords = 'Space Traffic Control Without Data Sharing'.split(' ');

  // Compute smooth motion properties for each narrative stage
  const motionCard0 = computeCardMotion(scrollProgress, 0.0, 0.0, 0.15, 0.28);
  const motionCard1 = computeCardMotion(scrollProgress, 0.2, 0.3, 0.48, 0.58);
  const motionCard2 = computeCardMotion(scrollProgress, 0.5, 0.6, 0.74, 0.84);
  const motionCard3 = computeCardMotion(scrollProgress, 0.76, 0.86, 1.0, 1.0);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between w-full">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-vs-cyan shadow-[0_0_12px_#00f5ff]" />
          <span className="font-heading text-lg md:text-xl font-bold tracking-[0.25em] text-white neon-text uppercase">
            VYOMSENTINEL
          </span>
        </div>

        <nav className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg text-xs font-heading font-medium tracking-wider text-vs-text hover:text-vs-cyan hover:border-vs-cyan/40 border border-white/10 transition-colors bg-white/5 backdrop-blur-md"
            data-interactive
          >
            Mission Control
          </button>
          <button
            onClick={() => navigate('/privacy-shield')}
            className="px-4 py-2 rounded-lg text-xs font-heading font-medium tracking-wider text-vs-text hover:text-vs-cyan hover:border-vs-cyan/40 border border-white/10 transition-colors bg-white/5 backdrop-blur-md flex items-center gap-1.5"
            data-interactive
          >
            <Shield className="w-3.5 h-3.5 text-vs-cyan" />
            Privacy Shield
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-heading font-medium tracking-wider text-vs-text-secondary hover:text-white border border-transparent transition-colors flex items-center gap-1.5"
            data-interactive
          >
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </a>
        </nav>
      </header>

      {/* Main Dynamic Storytelling Stage Container */}
      <div className="relative flex-1 flex items-center max-w-7xl mx-auto w-full">
        {/* CARD 0: Initial Hero (Top of Earth Visible Below) */}
        <div
          className="absolute left-0 max-w-xl transition-transform duration-75 ease-out will-change-transform"
          style={{
            opacity: motionCard0.opacity,
            transform: `translateY(${motionCard0.y}px) scale(${motionCard0.scale})`,
            pointerEvents: motionCard0.pointerEvents,
          }}
        >
          <div className="inline-block px-3 py-1 rounded-full border border-vs-cyan/30 text-[10px] font-mono-data text-vs-cyan bg-vs-cyan/10 uppercase tracking-widest mb-3">
            Autonomous Space Traffic Management
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.12] mb-3">
            {titleWords.map((word, i) => (
              <span key={i} className="inline-block mr-2.5">
                {word}
              </span>
            ))}
          </h1>

          <p className="text-vs-text-secondary text-sm md:text-base leading-relaxed mb-4 max-w-lg">
            Deterministic SGP4 orbital propagation combined with zero-knowledge
            multi-party computation to protect global spacecraft fleets.
          </p>

          <div className="font-mono-data text-xs text-vs-cyan/90 mb-6 min-h-[2.5rem] bg-black/40 border border-vs-cyan/20 rounded-lg p-2.5 backdrop-blur-md max-w-lg">
            <TypewriterText
              text="15,000 tracked objects. 10,500 active satellites. Zero raw orbital data exchanged."
              speed={20}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pointer-events-auto mb-6">
            <AnimatedButton
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="animate-pulse-glow"
            >
              <span>Enter Mission Control</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              onClick={() => navigate('/privacy-shield')}
            >
              <span>View Privacy Shield Demo</span>
            </AnimatedButton>
          </div>

          <div className="flex items-center gap-2 text-vs-text-secondary font-mono-data text-xs animate-bounce">
            <ChevronDown className="w-4 h-4 text-vs-cyan" />
            <span>Scroll to navigate orbital progression</span>
          </div>
        </div>

        {/* CARD 1: High-Density Orbital Regimes (Earth is on right) */}
        <div
          className="absolute left-0 max-w-md glass-strong p-6 rounded-2xl border border-white/15 transition-transform duration-75 ease-out will-change-transform shadow-2xl"
          style={{
            opacity: motionCard1.opacity,
            transform: `translateY(${motionCard1.y}px) scale(${motionCard1.scale})`,
            pointerEvents: motionCard1.pointerEvents,
          }}
        >
          <div className="flex items-center gap-2 text-vs-warning text-xs font-mono-data uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" />
            <span>LEO Orbital Density</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            High-Density Space Congestion
          </h2>
          <p className="text-xs text-vs-text-secondary leading-relaxed mb-4 font-mono-data">
            The Low Earth Orbit corridor is experiencing exponential megaconstellation growth.
            Over 15,000 objects travel at speeds exceeding 7.8 km/s, where any conjunction
            threatens mission survival.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 font-mono-data text-xs">
            <div>
              <span className="block text-[10px] text-vs-text-secondary uppercase">
                Orbital Velocity
              </span>
              <span className="text-white font-bold text-sm">7.67 km/s</span>
            </div>
            <div>
              <span className="block text-[10px] text-vs-text-secondary uppercase">
                Relative Closure
              </span>
              <span className="text-vs-alert font-bold text-sm">Up to 14.8 km/s</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Keplerian Trajectory Screening */}
        <div
          className="absolute left-0 max-w-md glass-strong p-6 rounded-2xl border border-vs-cyan/30 shadow-[0_0_30px_rgba(0,245,255,0.15)] transition-transform duration-75 ease-out will-change-transform"
          style={{
            opacity: motionCard2.opacity,
            transform: `translateY(${motionCard2.y}px) scale(${motionCard2.scale})`,
            pointerEvents: motionCard2.pointerEvents,
          }}
        >
          <div className="flex items-center gap-2 text-vs-cyan text-xs font-mono-data uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4" />
            <span>Precision Screening</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            Keplerian Trajectory Screening
          </h2>
          <p className="text-xs text-vs-text-secondary leading-relaxed mb-4 font-mono-data">
            Propagating Two-Line Element (TLE) sets with SGP4 models enables automated
            minimum-distance detection across 7-day lookahead horizons with isotropic
            covariance matrix estimation.
          </p>
          <div className="space-y-1.5 font-mono-data text-[11px] text-vs-text-secondary pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span>SGP4 Step Resolution:</span>
              <span className="text-vs-cyan">60 Seconds</span>
            </div>
            <div className="flex justify-between">
              <span>Encounter B-Plane Projection:</span>
              <span className="text-vs-cyan">2D Gaussian Quadrature</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Hypervelocity Conjunction & Privacy Shield */}
        <div
          className="absolute left-0 max-w-lg glass-strong p-6 rounded-2xl border border-vs-alert/40 shadow-[0_0_40px_rgba(255,51,102,0.25)] transition-transform duration-75 ease-out will-change-transform"
          style={{
            opacity: motionCard3.opacity,
            transform: `translateY(${motionCard3.y}px) scale(${motionCard3.scale})`,
            pointerEvents: motionCard3.pointerEvents,
          }}
        >
          <div className="flex items-center gap-2 text-vs-alert text-xs font-mono-data uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>Hypervelocity Conjunction Event</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Collision Defused via Privacy Shield
          </h2>
          <p className="text-xs text-vs-text-secondary leading-relaxed mb-4 font-mono-data">
            Two classified vehicles encountered an imminent 450-meter miss geometry.
            Using Secure Multi-Party Computation, the collision probability (Pc: 3.2e-4)
            was determined without either sovereign party sharing orbital parameters.
          </p>
          <div className="flex flex-wrap items-center gap-3 pointer-events-auto pt-2">
            <AnimatedButton
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              <span>Enter Mission Control</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              onClick={() => navigate('/privacy-shield')}
            >
              <span>Test Privacy Shield</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Strip and Backend Status */}
      <footer className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 w-full">
        {/* Metric counters */}
        <div className="pointer-events-auto flex items-center gap-6 glass px-5 py-3 rounded-xl border border-white/10">
          <div>
            <span className="block text-[9px] tracking-widest uppercase font-mono-data text-vs-text-secondary">
              Objects Tracked
            </span>
            <AnimatedCounter
              value={15000}
              duration={1600}
              className="text-base md:text-lg font-bold text-white neon-text"
            />
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div>
            <span className="block text-[9px] tracking-widest uppercase font-mono-data text-vs-text-secondary">
              Active Satellites
            </span>
            <AnimatedCounter
              value={10500}
              duration={1600}
              className="text-base md:text-lg font-bold text-vs-cyan"
            />
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div>
            <span className="block text-[9px] tracking-widest uppercase font-mono-data text-vs-text-secondary">
              Debris Fragments
            </span>
            <AnimatedCounter
              value={500}
              duration={1600}
              className="text-base md:text-lg font-bold text-vs-warning"
            />
          </div>
        </div>

        {/* Backend health status indicator */}
        <div className="pointer-events-auto glass px-4 py-2 rounded-xl border border-white/10">
          <BackendStatusIndicator />
        </div>
      </footer>
    </div>
  );
};
