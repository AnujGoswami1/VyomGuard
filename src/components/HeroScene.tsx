import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { StarField } from './StarField';
import { SunLight } from './SunLight';
import { ParallaxCamera } from './ParallaxCamera';
import { ScrollChoreography } from './ScrollChoreography';

interface HeroSceneProps {
  /** Normalized scroll progress between 0.0 and 1.0 */
  scrollProgress?: number;
}

/**
 * HeroScene Component
 * Transparent 3D interactive viewport rendered directly in front of the background video UI:
 * - Earth positioned for top-horizon curve, gliding right on scroll, revealing orbits, and converging collision
 * - Twinkling stars, atmospheric glow, and bloom postprocessing
 */
export const HeroScene: React.FC<HeroSceneProps> = ({ scrollProgress = 0 }) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45, near: 0.01, far: 2000 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <StarField />
          <SunLight />
          <ScrollChoreography scrollProgress={scrollProgress} />
          <ParallaxCamera intensity={0.2} />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.85}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
