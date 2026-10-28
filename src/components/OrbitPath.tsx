import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/app-store';
import { sampleOrbitPath, computeOrbitalPosition } from '../utils/orbital-math';
import type { SpaceObject } from '../types';

/**
 * OrbitPath Component
 * Computes and draws the closed elliptical trajectory for the currently selected
 * space vehicle, with animated entry reveal and dynamic motion trail.
 */
export const OrbitPath: React.FC = () => {
  const selectedObject = useAppStore((s) => s.selectedObject);
  const layers = useAppStore((s) => s.layers);
  const orbitSpeedMultiplier = useAppStore((s) => s.orbitSpeedMultiplier);

  const trailRef = useRef<THREE.Vector3[]>([]);
  const lineRef = useRef<any>(null);
  const progressRef = useRef<number>(0);

  const isSatellite = selectedObject && 'operator' in selectedObject;
  const sat = isSatellite ? (selectedObject as SpaceObject) : null;

  // Sample full 128-point orbit path
  const orbitPoints = useMemo(() => {
    if (!sat) return [];
    const pts = sampleOrbitPath(
      sat.altitude,
      sat.inclination,
      sat.orbitalElements.raan,
      sat.orbitalElements.argumentOfPerigee,
      128,
      2.0
    );
    return pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  }, [sat]);

  // Reset draw-in progress when selection changes
  useEffect(() => {
    progressRef.current = 0;
    trailRef.current = [];
  }, [selectedObject?.noradId]);

  useFrame(({ clock }) => {
    // Reveal draw-in over 1 second
    if (progressRef.current < 1.0) {
      progressRef.current = Math.min(progressRef.current + 0.02, 1.0);
    }

    // Update trailing points behind current position
    if (sat) {
      const elapsedSeconds = clock.getElapsedTime() * 120 * orbitSpeedMultiplier;
      const [x, y, z] = computeOrbitalPosition(
        sat.altitude,
        sat.inclination,
        sat.orbitalElements.raan,
        sat.orbitalElements.argumentOfPerigee,
        sat.orbitalElements.meanAnomaly,
        elapsedSeconds,
        2.0
      );

      trailRef.current.push(new THREE.Vector3(x, y, z));
      if (trailRef.current.length > 50) {
        trailRef.current.shift();
      }
    }
  });

  if (!layers.orbitPaths || !sat || orbitPoints.length === 0) {
    return null;
  }

  const visibleCount = Math.max(2, Math.floor(orbitPoints.length * progressRef.current));
  const activeOrbitSlice = orbitPoints.slice(0, visibleCount);

  return (
    <group>
      {/* Full closed orbit geometry */}
      <Line
        ref={lineRef}
        points={activeOrbitSlice}
        color="#00f5ff"
        lineWidth={1.5}
        transparent
        opacity={0.65}
      />

      {/* Trailing wake behind current satellite position */}
      {trailRef.current.length > 2 && (
        <Line
          points={trailRef.current}
          color="#a855f7"
          lineWidth={2.5}
          transparent
          opacity={0.8}
        />
      )}
    </group>
  );
};
