import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { CustomCursor } from '../components/CustomCursor';

/**
 * NotFoundPage Component
 * Graceful fallback route when an unmapped orbital vector is requested.
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vs-bg-deep flex flex-col items-center justify-center p-6 text-center select-none relative">
      <CustomCursor />
      <div className="glass p-10 rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-vs-alert/15 border border-vs-alert/30 flex items-center justify-center mx-auto mb-6 text-vs-alert">
          <Compass className="w-8 h-8 animate-spin" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white mb-2 tracking-wide">
          404: ORBIT LOST
        </h1>
        <p className="font-mono-data text-xs text-vs-text-secondary leading-relaxed mb-6">
          The requested trajectory vector does not map to any recognized catalog object
          or platform service endpoint.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-vs-cyan to-vs-violet text-black shadow-lg shadow-vs-cyan/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          data-interactive
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Ground Station</span>
        </button>
      </div>
    </div>
  );
};
