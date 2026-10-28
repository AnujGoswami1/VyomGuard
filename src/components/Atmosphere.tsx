import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphereProps {
  /** Base radius of the inner celestial sphere */
  radius?: number;
}

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 uColor;
  uniform float uPulse;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float dotNV = dot(vNormal, viewDir);
    float intensity = pow(clamp(0.7 - dotNV, 0.0, 1.0), 3.0) * uPulse;
    gl_FragColor = vec4(uColor, intensity);
  }
`;

/**
 * Atmosphere Component
 * Renders a glowing atmospheric limb with Fresnel-based scattering
 * and periodic breathing pulsation.
 */
export const Atmosphere: React.FC<AtmosphereProps> = ({ radius = 1.85 }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#00f5ff') },
      uPulse: { value: 0.35 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const elapsed = clock.getElapsedTime();
      // Oscillate intensity between 0.25 and 0.45 over 4-second period
      const pulse = 0.35 + 0.1 * Math.sin((elapsed * Math.PI * 2) / 4.0);
      materialRef.current.uniforms.uPulse.value = pulse;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[radius + 0.05, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
