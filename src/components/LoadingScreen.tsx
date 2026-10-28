/**
 * LoadingScreen Component
 *
 * Full-screen overlay displayed during initial application load.
 * Features a satellite orbiting animation, progress bar, and
 * animated status text with ellipsis.
 *
 * Fades out with Framer Motion when the app signals readiness.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  /** Whether the loading screen should be visible */
  isVisible: boolean;
}

/**
 * Full-screen loading overlay with orbital animation and progress bar.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    // Progress bar animation: 0% to 100% over 2 seconds
    const startTime = Date.now();
    const duration = 2000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 16);

    // Animated ellipsis
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #0a0e27 0%, #030014 100%)',
          }}
        >
          {/* Orbiting satellite SVG */}
          <div className="relative w-24 h-24 mb-8">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ overflow: 'visible' }}
            >
              {/* Orbital ring */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#00f5ff"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Orbiting satellite dot */}
              <circle r="4" fill="#00f5ff">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cx"
                  values="85;85"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="50;50"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Glow effect on the orbiting dot */}
              <circle r="8" fill="none" stroke="#00f5ff" strokeWidth="1" opacity="0.3">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cx"
                  values="85;85"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="50;50"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Center point */}
              <circle cx="50" cy="50" r="3" fill="#0a0e27" stroke="#00f5ff" strokeWidth="1" />
            </svg>
          </div>

          {/* Status text */}
          <p className="font-heading text-vs-text text-lg tracking-wider mb-6">
            Initializing systems{dots}
          </p>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00f5ff, #a855f7)',
                width: `${progress}%`,
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Progress percentage */}
          <p className="font-mono-data text-vs-text-secondary text-sm mt-3">
            {Math.round(progress)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
