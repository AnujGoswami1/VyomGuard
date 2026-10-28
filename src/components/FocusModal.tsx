import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle } from 'lucide-react';
import { useAppStore } from '../store/app-store';

/**
 * FocusModal Component
 * Full-screen lightbox modal displaying the hero video at high definition
 * with backdrop blur, cyan border accents, and keyboard/escape dismiss handlers.
 */
export const FocusModal: React.FC = () => {
  const isOpen = useAppStore((s) => s.isFocusModalOpen);
  const closeModal = useAppStore((s) => s.closeFocusModal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl"
          data-interactive
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20 z-10"
            aria-label="Close video player"
            data-interactive
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[85vh] aspect-video bg-vs-bg rounded-2xl overflow-hidden border border-vs-cyan/40 shadow-[0_0_50px_rgba(0,245,255,0.25)] flex items-center justify-center"
          >
            <video
              src="/videos/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
              onError={(e) => {
                // If video fails, hide video and show fallback graphic
                (e.target as HTMLVideoElement).style.display = 'none';
                const fallbackContainer = document.getElementById('modal-video-fallback');
                if (fallbackContainer) fallbackContainer.style.display = 'flex';
              }}
            />

            {/* Fallback Display if video cannot load */}
            <div
              id="modal-video-fallback"
              className="hidden flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full border border-vs-cyan/40 flex items-center justify-center mb-4 bg-vs-cyan/10">
                <PlayCircle className="w-8 h-8 text-vs-cyan" />
              </div>
              <h3 className="font-heading text-xl text-white mb-2">
                Cinematic Media Stream
              </h3>
              <p className="font-mono-data text-xs text-vs-text-secondary max-w-md mb-4">
                To link custom video assets, mount a valid MP4 recording at
                public/videos/hero.mp4. Procedural fallback rendering active.
              </p>
              <div className="inline-block px-3 py-1 rounded border border-vs-cyan/30 text-xs text-vs-cyan font-mono-data bg-vs-cyan/5">
                STATUS: PROCEDURAL_STREAM_ONLINE
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
