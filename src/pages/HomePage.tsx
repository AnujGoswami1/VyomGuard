import React, { useEffect, useState, useRef } from 'react';
import { HeroScene } from '../components/HeroScene';
import { HeroOverlay } from '../components/HeroOverlay';
import { CustomCursor } from '../components/CustomCursor';
import { LoadingScreen } from '../components/LoadingScreen';
import { FocusModal } from '../components/FocusModal';
import { useAppStore } from '../store/app-store';

/**
 * HomePage Component
 * Scroll-driven cinematic landing page integrating:
 * 1. Full-screen HTML background UI video (/videos/hero.mp4) with dark vignette & scanlines
 * 2. Transparent 3D viewport (HeroScene) with scroll-choreographed Earth, orbits, and collision
 * 3. Buttery-smooth continuous scrollytelling HUD panels on the left
 */
export const HomePage: React.FC = () => {
  const isLoading = useAppStore((s) => s.isLoading);
  const setLoading = useAppStore((s) => s.setLoading);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Dismiss loading overlay after 2.1 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2100);

    return () => clearTimeout(timer);
  }, [setLoading]);

  // Ensure background video plays smoothly
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        const resumeOnUserGesture = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', resumeOnUserGesture);
          document.removeEventListener('scroll', resumeOnUserGesture);
        };
        document.addEventListener('click', resumeOnUserGesture, { once: true });
        document.addEventListener('scroll', resumeOnUserGesture, { once: true });
      });
    }
  }, []);

  // Continuous window scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(1.0, Math.max(0.0, window.scrollY / totalHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-[400vh] bg-vs-bg-deep select-none">
      <CustomCursor />
      <LoadingScreen isVisible={isLoading} />

      {/* 1. Fullscreen Background UI Video Layer */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-65 scale-105"
        />
        {/* Cinematic deep space vignette and atmospheric gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 60% 40%, rgba(10, 14, 39, 0.4) 0%, rgba(3, 0, 20, 0.85) 75%, #030014 100%)',
          }}
        />
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 scanline opacity-30" />
      </div>

      {/* 2. Transparent 3D Scene (Earth, Atmosphere, Stars, Orbits, Colliding Satellites) */}
      <HeroScene scrollProgress={scrollProgress} />

      {/* 3. Buttery-Smooth Continuous Narrative HUD Overlay */}
      <HeroOverlay scrollProgress={scrollProgress} />

      {/* 4. Fullscreen Lightbox Focus Modal */}
      <FocusModal />
    </div>
  );
};
