import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/app-store';
import { formatPc, formatDistanceKm, riskHex } from '../utils/format';
import type { ConjunctionEvent } from '../types';

interface MarkerItemProps {
  conjunction: ConjunctionEvent;
  index: number;
}

const MarkerItem: React.FC<MarkerItemProps> = ({ conjunction, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const layers = useAppStore((s) => s.layers);

  const hexColor = riskHex(conjunction.riskLevel);

  // Position midpoint between primary and secondary positions
  const pos: [number, number, number] = [
    (conjunction.primaryPosition.x + conjunction.secondaryPosition.x) / 2,
    (conjunction.primaryPosition.y + conjunction.secondaryPosition.y) / 2,
    (conjunction.primaryPosition.z + conjunction.secondaryPosition.z) / 2,
  ];

  useFrame(({ clock, camera }) => {
    if (meshRef.current) {
      // Billboard to face camera
      meshRef.current.quaternion.copy(camera.quaternion);

      // Pulse scale and fade
      const t = (clock.getElapsedTime() + index * 0.3) % 1.5;
      const progress = t / 1.5;
      const scale = 1.0 + progress * 2.0;
      meshRef.current.scale.set(scale, scale, 1);

      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.8 * (1.0 - progress);
      }
    }
  });

  return (
    <group position={pos}>
      {/* Pulsing hazard ring */}
      <mesh ref={meshRef}>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial
          color={hexColor}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Center pinpoint */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={hexColor} />
      </mesh>

      {/* Floating HUD Telemetry Tag */}
      {layers.labels && (
        <Html
          position={[0, 0.12, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="px-2 py-0.5 rounded bg-black/80 border border-white/20 whitespace-nowrap backdrop-blur-md shadow-lg">
            <span
              className="font-mono-data text-[10px] font-semibold tracking-tight"
              style={{ color: hexColor }}
            >
              Pc: {formatPc(conjunction.pc)} · {formatDistanceKm(conjunction.missDistanceKm)}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * ConjunctionMarker Component
 * Visualizes calculated high-risk encounters in 3D orbit space with pulsing
 * hazard rings, risk-coded coloration, and billboarded telemetry labels.
 */
export const ConjunctionMarker: React.FC = () => {
  const conjunctions = useAppStore((s) => s.conjunctions);
  const layers = useAppStore((s) => s.layers);

  if (!layers.threatZones || conjunctions.length === 0) {
    return null;
  }

  return (
    <group>
      {conjunctions.map((conj, idx) => (
        <MarkerItem key={conj.id} conjunction={conj} index={idx} />
      ))}
    </group>
  );
};
