/**
 * SunLight Component
 *
 * Provides directional and ambient lighting for the 3D scene.
 * Simulates sunlight with a warm directional light and cool ambient fill.
 */

import React from 'react';

/**
 * Scene lighting setup with directional sun and ambient fill.
 */
export const SunLight: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.08} color="#4488ff" />
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.8}
        color="#fff5ee"
        castShadow={false}
      />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#00f5ff" />
    </>
  );
};
