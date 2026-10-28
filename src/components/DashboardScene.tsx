import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { StarField } from './StarField';
import { SunLight } from './SunLight';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { Satellites } from './Satellites';
import { Debris } from './Debris';
import { OrbitPath } from './OrbitPath';
import { ConjunctionMarker } from './ConjunctionMarker';
import { ConjunctionSimulation } from './ConjunctionSimulation';

/**
 * DashboardScene Component
 * Primary 3D simulation canvas for the Mission Control dashboard,
 * orchestrating active satellite constellations, debris fields,
 * conjunction hazard markers, orbital trajectories, and avoidance simulations.
 */
export const DashboardScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        camera={{ position: [0, 2.5, 6.5], fov: 45, near: 0.01, far: 2000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 20, 80]} />

        <Suspense fallback={null}>
          <StarField />
          <SunLight />
          <Earth radius={2.0} />
          <Atmosphere radius={2.05} />
          <Satellites />
          <Debris />
          <OrbitPath />
          <ConjunctionMarker />
          <ConjunctionSimulation />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={14.0}
          enableDamping
          dampingFactor={0.05}
        />

        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
