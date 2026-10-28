import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { sampleOrbitPath } from '../utils/orbital-math';

interface ScrollChoreographyProps {
  /** Normalized scroll progress between 0.0 (top) and 1.0 (bottom) */
  scrollProgress: number;
}

/**
 * ScrollChoreography Component
 * Coordinates the 3D cinematic transitions based on continuous scroll progress:
 * 1. Initial State (0.0): Top curved horizon of Earth prominent in view.
 * 2. Scroll Stage 1 (0.2 -> 0.5): Earth glides smoothly to the right side of the screen.
 * 3. Scroll Stage 2 (0.5 -> 0.75): Luminous orbital trajectories wrap around Earth.
 * 4. Scroll Stage 3 (0.75 -> 1.0): Two satellites converge on collision course, detonating into a flash & shockwave.
 */
export const ScrollChoreography: React.FC<ScrollChoreographyProps> = ({
  scrollProgress,
}) => {
  const earthGroupRef = useRef<THREE.Group>(null);
  const orbitsGroupRef = useRef<THREE.Group>(null);
  const collisionGroupRef = useRef<THREE.Group>(null);
  const sat1Ref = useRef<THREE.Mesh>(null);
  const sat2Ref = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const explosionParticlesRef = useRef<THREE.Points>(null);

  // Smooth lerped scroll progress
  const smoothScrollRef = useRef<number>(0);

  // Pre-generate 4 distinct orbital pathways around Earth
  const orbitPaths = useMemo(() => {
    const p1 = sampleOrbitPath(550, 53.0, 30, 0, 100, 1.8).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    const p2 = sampleOrbitPath(750, 74.0, 110, 45, 100, 1.8).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    const p3 = sampleOrbitPath(1100, 87.9, 190, 90, 100, 1.8).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    const p4 = sampleOrbitPath(420, 51.6, 280, 15, 100, 1.8).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    return [p1, p2, p3, p4];
  }, []);

  // Pre-generate explosion particle velocities
  const [explosionPositions, explosionVelocities] = useMemo(() => {
    const count = 240;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.5 + Math.random() * 2.2;

      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return [pos, vel];
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Damped smoothing of scroll input
    smoothScrollRef.current += (scrollProgress - smoothScrollRef.current) * 0.08;
    const s = smoothScrollRef.current;

    // =========================================================================
    // 1. EARTH POSITION & ORIENTATION
    // =========================================================================
    if (earthGroupRef.current) {
      let targetX = 0;
      let targetY = -2.1;
      let targetZ = 3.8;
      let targetRotX = 0.42;

      if (s < 0.18) {
        // Initial hero framing: top part of Earth horizon prominent
        const t0 = s / 0.18;
        targetX = 0;
        targetY = -2.1 + t0 * 0.4;
        targetZ = 3.8 - t0 * 0.5;
        targetRotX = 0.42 - t0 * 0.12;
      } else if (s < 0.55) {
        // Transition: Earth glides to the right
        const t1 = (s - 0.18) / 0.37;
        const ease = 0.5 - 0.5 * Math.cos(t1 * Math.PI);
        targetX = 2.4 * ease;
        targetY = -1.7 + 1.6 * ease;
        targetZ = 3.3 - 2.1 * ease;
        targetRotX = 0.3 - 0.3 * ease;
      } else {
        // Final stages: Earth locked on right side
        targetX = 2.4;
        targetY = -0.1;
        targetZ = 1.2;
        targetRotX = 0.0;
      }

      earthGroupRef.current.position.x += (targetX - earthGroupRef.current.position.x) * 0.1;
      earthGroupRef.current.position.y += (targetY - earthGroupRef.current.position.y) * 0.1;
      earthGroupRef.current.position.z += (targetZ - earthGroupRef.current.position.z) * 0.1;
      earthGroupRef.current.rotation.x += (targetRotX - earthGroupRef.current.rotation.x) * 0.1;
    }

    // =========================================================================
    // 2. ORBITS & PATHWAYS (Visible from s >= 0.38)
    // =========================================================================
    if (orbitsGroupRef.current) {
      const orbitOpacity = Math.max(0.0, Math.min(1.0, (s - 0.38) / 0.18));
      orbitsGroupRef.current.visible = orbitOpacity > 0.02;

      orbitsGroupRef.current.position.copy(earthGroupRef.current?.position || new THREE.Vector3());
      orbitsGroupRef.current.rotation.y = elapsed * 0.04;
    }

    // =========================================================================
    // 3. SATTELLITE COLLISION SEQUENCE (Visible from s >= 0.65)
    // =========================================================================
    if (collisionGroupRef.current) {
      const collisionActive = s >= 0.65;
      collisionGroupRef.current.visible = collisionActive;

      if (collisionActive) {
        const encounterPhase = Math.max(0.0, Math.min(1.0, (s - 0.68) / 0.32));
        const impactPoint = new THREE.Vector3(-0.7, 0.3, 4.0);

        const sat1Start = new THREE.Vector3(-3.4, 2.0, 2.2);
        const sat2Start = new THREE.Vector3(1.8, -1.4, 4.9);

        if (encounterPhase < 0.62) {
          // Converging approach
          const approachT = encounterPhase / 0.62;
          sat1Ref.current?.position.lerpVectors(sat1Start, impactPoint, approachT);
          sat2Ref.current?.position.lerpVectors(sat2Start, impactPoint, approachT);

          if (flashLightRef.current) flashLightRef.current.intensity = 0;
          if (shockwaveRef.current) {
            shockwaveRef.current.scale.setScalar(0.01);
            (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
          }
          if (explosionParticlesRef.current) {
            explosionParticlesRef.current.visible = false;
          }
        } else {
          // Detonation / Collision Burst
          const blastPhase = (encounterPhase - 0.62) / 0.38;

          // Flash light burst
          if (flashLightRef.current) {
            flashLightRef.current.position.copy(impactPoint);
            flashLightRef.current.intensity = Math.max(0, 10.0 * (1.0 - blastPhase * 1.8));
          }

          // Expanding shockwave ring
          if (shockwaveRef.current) {
            shockwaveRef.current.position.copy(impactPoint);
            const shockwaveScale = 0.2 + blastPhase * 3.4;
            shockwaveRef.current.scale.setScalar(shockwaveScale);
            const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.max(0, 0.9 * (1.0 - blastPhase));
          }

          // Disperse collision debris cloud
          if (explosionParticlesRef.current) {
            explosionParticlesRef.current.visible = true;
            explosionParticlesRef.current.position.copy(impactPoint);
            const geom = explosionParticlesRef.current.geometry;
            const posAttr = geom.attributes.position as THREE.BufferAttribute;
            const arr = posAttr.array as Float32Array;

            for (let i = 0; i < explosionVelocities.length / 3; i++) {
              arr[i * 3] = explosionVelocities[i * 3] * blastPhase * 2.2;
              arr[i * 3 + 1] = explosionVelocities[i * 3 + 1] * blastPhase * 2.2;
              arr[i * 3 + 2] = explosionVelocities[i * 3 + 2] * blastPhase * 2.2;
            }
            posAttr.needsUpdate = true;
          }

          // Displaced fragment vectors
          const sat1Deflected = new THREE.Vector3(-2.0, 1.4, 3.2);
          const sat2Deflected = new THREE.Vector3(0.5, -1.0, 4.6);
          sat1Ref.current?.position.lerpVectors(impactPoint, sat1Deflected, blastPhase);
          sat2Ref.current?.position.lerpVectors(impactPoint, sat2Deflected, blastPhase);
        }
      }
    }
  });

  return (
    <group>
      {/* Earth and Atmosphere Group */}
      <group ref={earthGroupRef} position={[0, -2.1, 3.8]}>
        <Earth radius={1.8} />
        <Atmosphere radius={1.85} />
      </group>

      {/* Stage 2 Orbital Pathways wrapping around Earth */}
      <group ref={orbitsGroupRef} visible={false}>
        <Line
          points={orbitPaths[0]}
          color="#00f5ff"
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
        <Line
          points={orbitPaths[1]}
          color="#a855f7"
          lineWidth={1.5}
          transparent
          opacity={0.65}
        />
        <Line
          points={orbitPaths[2]}
          color="#ffb700"
          lineWidth={1.5}
          transparent
          opacity={0.55}
        />
        <Line
          points={orbitPaths[3]}
          color="#00ff88"
          lineWidth={1.2}
          transparent
          opacity={0.5}
        />
      </group>

      {/* Stage 3 Converging and Colliding Satellites */}
      <group ref={collisionGroupRef} visible={false}>
        <mesh ref={sat1Ref} position={[-3.4, 2.0, 2.2]}>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>

        <mesh ref={sat2Ref} position={[1.8, -1.4, 4.9]}>
          <boxGeometry args={[0.07, 0.07, 0.06]} />
          <meshStandardMaterial
            color="#ff3366"
            emissive="#ff3366"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>

        <pointLight
          ref={flashLightRef}
          position={[-0.7, 0.3, 4.0]}
          color="#ffffff"
          intensity={0}
          distance={10}
        />

        <mesh ref={shockwaveRef} position={[-0.7, 0.3, 4.0]}>
          <ringGeometry args={[0.06, 0.2, 32]} />
          <meshBasicMaterial
            color="#ff3366"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <points ref={explosionParticlesRef} position={[-0.7, 0.3, 4.0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={explosionPositions.length / 3}
              array={explosionPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#ff3366"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
};
