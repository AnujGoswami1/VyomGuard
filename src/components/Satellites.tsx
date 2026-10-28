import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/app-store';
import { computeOrbitalPosition } from '../utils/orbital-math';
import { operatorColor } from '../utils/format';
import type { SpaceObject } from '../types';

interface SatelliteInstanceProps {
  satellite: SpaceObject;
  index: number;
}

const SatelliteInstance: React.FC<SatelliteInstanceProps> = ({ satellite }) => {
  const instanceRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const selectObject = useAppStore((s) => s.selectObject);
  const selectedObjectId = useAppStore((s) => s.selectedObjectId);
  const orbitSpeedMultiplier = useAppStore((s) => s.orbitSpeedMultiplier);

  const isSelected = selectedObjectId === satellite.noradId;
  const baseColor = useMemo(
    () => new THREE.Color(operatorColor(satellite.operator)),
    [satellite.operator]
  );

  useFrame(({ clock }) => {
    if (instanceRef.current) {
      const elapsedSeconds = clock.getElapsedTime() * 120 * orbitSpeedMultiplier;
      const [x, y, z] = computeOrbitalPosition(
        satellite.altitude,
        satellite.inclination,
        satellite.orbitalElements.raan,
        satellite.orbitalElements.argumentOfPerigee,
        satellite.orbitalElements.meanAnomaly,
        elapsedSeconds,
        2.0
      );

      instanceRef.current.position.set(x, y, z);

      const targetScale = isSelected ? 0.04 : hovered ? 0.03 : 0.018;
      instanceRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <Instance
      ref={instanceRef}
      color={baseColor}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(satellite.noradId, satellite);
      }}
    />
  );
};

/**
 * Satellites Component
 * Instanced rendering of orbital constellation satellites with individual
 * Keplerian circular propagation, operator color assignments, and selection handlers.
 */
export const Satellites: React.FC = () => {
  const satellites = useAppStore((s) => s.satellites);
  const layers = useAppStore((s) => s.layers);
  const operatorFilter = useAppStore((s) => s.operatorFilter);

  const filteredSatellites = useMemo(() => {
    if (!layers.satellites) return [];
    return satellites.filter((sat) => operatorFilter[sat.operator]);
  }, [satellites, layers.satellites, operatorFilter]);

  if (!layers.satellites || filteredSatellites.length === 0) {
    return null;
  }

  return (
    <Instances limit={200} range={filteredSatellites.length}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        roughness={0.2}
        metalness={0.8}
        emissive="#00f5ff"
        emissiveIntensity={0.5}
      />
      {filteredSatellites.map((sat, idx) => (
        <SatelliteInstance key={sat.noradId} satellite={sat} index={idx} />
      ))}
    </Instances>
  );
};
