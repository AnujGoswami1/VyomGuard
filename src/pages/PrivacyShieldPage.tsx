import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Cpu,
} from 'lucide-react';
import { CustomCursor } from '../components/CustomCursor';
import { MissionClock } from '../components/MissionClock';

/**
 * PrivacyShieldPage Component
 * Demonstrates confidential space traffic management via simulated Secure Multi-Party
 * Computation (SMPC), verifying collision probability without raw orbital state exchange.
 */
export const PrivacyShieldPage: React.FC = () => {
  const navigate = useNavigate();

  const [operatorAInitiated, setOperatorAInitiated] = useState(false);
  const [operatorBInitiated, setOperatorBInitiated] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [computationComplete, setComputationComplete] = useState(false);

  const handleInitiateA = () => {
    setOperatorAInitiated(true);
    checkComputation(true, operatorBInitiated);
  };

  const handleInitiateB = () => {
    setOperatorBInitiated(true);
    checkComputation(operatorAInitiated, true);
  };

  const checkComputation = (readyA: boolean, readyB: boolean) => {
    if (readyA && readyB) {
      setIsComputing(true);
      setTimeout(() => {
        setIsComputing(false);
        setComputationComplete(true);
      }, 3000);
    }
  };

  const handleReset = () => {
    setOperatorAInitiated(false);
    setOperatorBInitiated(false);
    setIsComputing(false);
    setComputationComplete(false);
  };

  return (
    <div className="min-h-screen bg-vs-bg-deep text-vs-text flex flex-col justify-between p-6 md:p-12 select-none relative overflow-x-hidden">
      <CustomCursor />

      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10 w-full mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-vs-text hover:text-vs-cyan hover:border-vs-cyan/40 transition-colors flex items-center gap-2"
            data-interactive
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-heading text-xs font-semibold uppercase tracking-wider hidden sm:inline">
              Mission Control
            </span>
          </button>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-white neon-text uppercase tracking-wide">
              Privacy Shield Protocol
            </h1>
            <p className="font-mono-data text-xs text-vs-text-secondary">
              Zero-Knowledge Orbital Conjunction Screening Protocol
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <MissionClock />
        </div>
      </header>

      {/* Main 3-Column SMPC Demonstration Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
        {/* Column 1: Operator A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-widest text-vs-alert">
                  Classified Node
                </span>
                <h2 className="font-heading text-base font-bold text-white">
                  Operator A — Defense Satellite
                </h2>
              </div>
              <div className="w-3 h-3 rounded-full bg-vs-alert shadow-[0_0_8px_#ff3366]" />
            </div>

            <div className="space-y-3 mb-6">
              {['Position: CLASSIFIED', 'Orbital Parameters: CLASSIFIED', 'Ephemeris: CLASSIFIED'].map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-vs-alert/25 flex items-center justify-between"
                  >
                    <span className="font-mono-data text-xs text-vs-text-secondary">
                      {item.split(':')[0]}
                    </span>
                    <div className="flex items-center gap-1.5 text-vs-alert text-xs font-mono-data font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CLASSIFIED</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-vs-text-secondary leading-relaxed mb-6 font-mono-data bg-white/5 p-3 rounded-xl border border-white/5">
              This defense operator requires collision screening against civilian traffic,
              but national security directives forbid disclosing orbital telemetry vectors.
            </p>
          </div>

          <button
            onClick={handleInitiateA}
            disabled={operatorAInitiated}
            className={`w-full py-3 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              operatorAInitiated
                ? 'bg-vs-success/15 border border-vs-success/40 text-vs-success cursor-default'
                : 'bg-gradient-to-r from-vs-alert to-vs-violet text-white shadow-lg shadow-vs-alert/20 hover:scale-[1.02]'
            }`}
            data-interactive
          >
            {operatorAInitiated ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Encrypted Shares Ready</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Initiate Secure Computation</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Column 2: Operator B */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-widest text-vs-cyan">
                  Commercial Node
                </span>
                <h2 className="font-heading text-base font-bold text-white">
                  Operator B — Commercial Satellite
                </h2>
              </div>
              <div className="w-3 h-3 rounded-full bg-vs-cyan shadow-[0_0_8px_#00f5ff]" />
            </div>

            <div className="space-y-3 mb-6">
              {['Position: CLASSIFIED', 'Orbital Parameters: CLASSIFIED', 'Ephemeris: CLASSIFIED'].map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-vs-cyan/25 flex items-center justify-between"
                  >
                    <span className="font-mono-data text-xs text-vs-text-secondary">
                      {item.split(':')[0]}
                    </span>
                    <div className="flex items-center gap-1.5 text-vs-cyan text-xs font-mono-data font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CLASSIFIED</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-vs-text-secondary leading-relaxed mb-6 font-mono-data bg-white/5 p-3 rounded-xl border border-white/5">
              Proprietary constellation orbital plans represent trade secret IP. The commercial
              operator participates strictly under non-disclosure mathematical constraints.
            </p>
          </div>

          <button
            onClick={handleInitiateB}
            disabled={operatorBInitiated}
            className={`w-full py-3 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              operatorBInitiated
                ? 'bg-vs-success/15 border border-vs-success/40 text-vs-success cursor-default'
                : 'bg-gradient-to-r from-vs-cyan to-vs-violet text-black shadow-lg shadow-vs-cyan/20 hover:scale-[1.02]'
            }`}
            data-interactive
          >
            {operatorBInitiated ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Encrypted Shares Ready</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Initiate Secure Computation</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Column 3: Privacy Shield Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-strong p-6 rounded-2xl border border-white/15 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-widest text-vs-violet">
                  Homomorphic SMPC Circuit
                </span>
                <h2 className="font-heading text-base font-bold text-white">
                  Privacy Shield Computation
                </h2>
              </div>
              <Cpu className="w-4 h-4 text-vs-violet" />
            </div>

            <AnimatePresence mode="wait">
              {!operatorAInitiated || !operatorBInitiated ? (
                <motion.div
                  key="awaiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-white/5"
                >
                  <Lock className="w-10 h-10 text-white/20 mb-3" />
                  <p className="font-heading text-sm text-vs-text font-medium mb-1">
                    Awaiting authorization from both operators
                  </p>
                  <p className="font-mono-data text-xs text-vs-text-secondary max-w-xs">
                    Both parties must submit secret-shared commitments before computation executes.
                  </p>
                </motion.div>
              ) : isComputing ? (
                <motion.div
                  key="computing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-vs-cyan/20"
                >
                  <Loader2 className="w-10 h-10 text-vs-cyan animate-spin mb-4" />
                  <p className="font-heading text-sm text-white font-medium mb-1">
                    Computing via secure multi-party computation
                  </p>
                  <p className="font-mono-data text-xs text-vs-cyan/80">
                    Evaluating garbled circuit distance polynomials...
                  </p>
                </motion.div>
              ) : computationComplete ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-vs-alert/15 border border-vs-alert/40 text-center">
                    <span className="font-heading text-xs uppercase tracking-widest font-bold text-vs-alert block mb-1">
                      Conjunction Detected
                    </span>
                    <div className="font-mono-data text-2xl font-extrabold text-white">
                      Miss Distance: 2.34 km
                    </div>
                    <div className="font-mono-data text-xs text-vs-alert mt-1">
                      Probability of Collision (Pc): 3.2e-4
                    </div>
                  </div>

                  {/* Cryptographic Zero-Knowledge Guarantees */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-vs-success font-mono-data text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Raw positions: NOT EXCHANGED</span>
                    </div>
                    <div className="flex items-center gap-2 text-vs-success font-mono-data text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Orbital parameters: NOT EXCHANGED</span>
                    </div>
                    <div className="flex items-center gap-2 text-vs-success font-mono-data text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Only Pc and miss distance revealed</span>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {computationComplete && (
            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-xl font-heading text-xs font-semibold tracking-wider text-vs-text-secondary hover:text-white border border-white/10 hover:border-white/30 transition-colors bg-white/5 mt-4"
              data-interactive
            >
              Reset Protocol Simulation
            </button>
          )}
        </motion.div>
      </main>

      {/* Prominent Disclaimer Footer Banner */}
      <footer className="mt-8 p-4 rounded-xl bg-vs-warning/10 border border-vs-warning/40 text-vs-text">
        <div className="flex items-start gap-3 max-w-5xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-vs-warning shrink-0 mt-0.5" />
          <p className="font-mono-data text-xs leading-relaxed text-vs-text-secondary">
            This is a simulated secure multi-party computation workflow for demonstration.
            Production deployment would use cryptographic SMPC libraries (MPyC, PySyft) with formal
            security proofs. The information-flow guarantees illustrated here are the workflow we are
            building toward, not cryptographic guarantees of this simulation.
          </p>
        </div>
      </footer>
    </div>
  );
};
