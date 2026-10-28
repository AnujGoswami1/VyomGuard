import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const twinkleVertexShader = `
  attribute float aPhase;
  attribute float aSize;
  varying float vPhase;

  void main() {
    vPhase = aPhase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const twinkleFragmentShader = `
  uniform float uTime;
  varying float vPhase;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 0.4 + 0.6 * sin(uTime * 2.0 + vPhase);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * (1.0 - dist * 2.0));
  }
`;

/**
 * StarField Component
 * Combines a high-density background star field (15,000 points) with an
 * animated sparkling foreground particle cloud (3,000 points).
 */
export const StarField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, phases, sizes] = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const phs = new Float32Array(count);
    const szs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 80 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      phs[i] = Math.random() * Math.PI * 2;
      szs[i] = 1.0 + Math.random() * 2.5;
    }

    return [pos, phs, szs];
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <>
      <Stars
        radius={300}
        depth={100}
        count={15000}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            count={phases.length}
            array={phases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={twinkleVertexShader}
          fragmentShader={twinkleFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};
