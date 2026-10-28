import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/app-store';
import { computeOrbitalPosition } from '../utils/orbital-math';

const debrisVertexShader = `
  attribute float aFlickerSeed;
  varying float vFlickerSeed;

  void main() {
    vFlickerSeed = aFlickerSeed;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 4.0 * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const debrisFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uBaseOpacity;
  varying float vFlickerSeed;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float flicker = 0.5 + 0.4 * sin(uTime * 3.0 + vFlickerSeed * 10.0);
    float alpha = uBaseOpacity * flicker * (1.0 - dist * 2.0);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

/**
 * Debris Component
 * High-performance particle cloud representation of 500 space debris fragments
 * across three catastrophic fragmentation events. Includes per-particle flickering.
 */
export const Debris: React.FC = () => {
  const debris = useAppStore((s) => s.debris);
  const layers = useAppStore((s) => s.layers);
  const orbitSpeedMultiplier = useAppStore((s) => s.orbitSpeedMultiplier);

  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [initialPositions, seeds] = useMemo(() => {
    const count = debris.length;
    const pos = new Float32Array(count * 3);
    const sds = new Float32Array(count);

    debris.forEach((item, i) => {
      const [x, y, z] = computeOrbitalPosition(
        item.altitude,
        item.inclination,
        item.orbitalElements.raan,
        item.orbitalElements.argumentOfPerigee,
        item.orbitalElements.meanAnomaly,
        0,
        2.0
      );
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      sds[i] = Math.random() * Math.PI * 2;
    });

    return [pos, sds];
  }, [debris]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffb700') },
      uBaseOpacity: { value: 0.55 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const elapsedSeconds = clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsedSeconds;
    }

    if (pointsRef.current && debris.length > 0) {
      const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = positionsAttr.array as Float32Array;

      const timeScaled = elapsedSeconds * 120 * orbitSpeedMultiplier;

      // Update positions along circular orbits
      for (let i = 0; i < debris.length; i++) {
        const item = debris[i];
        const [x, y, z] = computeOrbitalPosition(
          item.altitude,
          item.inclination,
          item.orbitalElements.raan,
          item.orbitalElements.argumentOfPerigee,
          item.orbitalElements.meanAnomaly,
          timeScaled,
          2.0
        );
        array[i * 3] = x;
        array[i * 3 + 1] = y;
        array[i * 3 + 2] = z;
      }
      positionsAttr.needsUpdate = true;
    }
  });

  if (!layers.debris || debris.length === 0) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={initialPositions.length / 3}
          array={initialPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aFlickerSeed"
          count={seeds.length}
          array={seeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={debrisVertexShader}
        fragmentShader={debrisFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
