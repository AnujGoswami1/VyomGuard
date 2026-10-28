import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface EarthProps {
  /** Sphere radius in Three.js units (default: 1.8) */
  radius?: number;
}

/**
 * Inner textured sphere component wrapped by Suspense.
 */
const TexturedEarthSphere: React.FC<{ radius: number }> = ({ radius }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const [earthMap, lightsMap] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, (23.5 * Math.PI) / 180]}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        map={earthMap}
        emissiveMap={lightsMap}
        emissive={new THREE.Color('#ffffff')}
        emissiveIntensity={0.4}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

/**
 * Fallback untextured sphere shown while textures load.
 */
const FallbackEarthSphere: React.FC<{ radius: number }> = ({ radius }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, (23.5 * Math.PI) / 180]}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color="#112244"
        emissive="#001133"
        emissiveIntensity={0.2}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

/**
 * Earth Component
 * Renders Earth with axial tilt of 23.5 degrees, continuous slow Y-rotation,
 * day/night diffuse and city light emissive textures.
 */
export const Earth: React.FC<EarthProps> = ({ radius = 1.8 }) => {
  return (
    <Suspense fallback={<FallbackEarthSphere radius={radius} />}>
      <TexturedEarthSphere radius={radius} />
    </Suspense>
  );
};
