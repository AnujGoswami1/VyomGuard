import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAppStore } from '../store/app-store';
import { AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';

/**
 * ConjunctionSimulation Component
 * Choreographed 8-second cinematic playback of an orbital near-miss collision event.
 * Coordinates dynamic camera tracking, intercept trajectory lines, explosive flash,
 * and automated avoidance maneuver telemetry.
 */
export const ConjunctionSimulation: React.FC = () => {
  const isRunning = useAppStore((s) => s.isSimulationRunning);
  const stopSimulation = useAppStore((s) => s.stopSimulation);
  const runSimulation = useAppStore((s) => s.runSimulation);
  const { camera } = useThree();

  const [overlayStatus, setOverlayStatus] = useState<string | null>(null);
  const [showReplay, setShowReplay] = useState<boolean>(false);

  // Trajectory references
  const obj1Ref = useRef<THREE.Mesh>(null);
  const obj2Ref = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  const defaultCamPos = useRef(new THREE.Vector3(0, 0, 8));
  const targetEncounterPos = useMemo(() => new THREE.Vector3(1.8, 0.8, -1.0), []);

  // Track coordinates during timeline
  const animState = useRef({
    t: 0,
    obj1Pos: new THREE.Vector3(1.0, 1.4, -1.6),
    obj2Pos: new THREE.Vector3(2.6, 0.2, -0.4),
    flashIntensity: 0,
    shockwaveScale: 0.01,
    shockwaveOpacity: 0,
  });

  useEffect(() => {
    if (!isRunning) {
      setOverlayStatus(null);
      setShowReplay(false);
      return;
    }

    setShowReplay(false);
    defaultCamPos.current.copy(camera.position);

    const tl = gsap.timeline({
      onComplete: () => {
        setShowReplay(true);
        // Reset camera position
        gsap.to(camera.position, {
          x: defaultCamPos.current.x,
          y: defaultCamPos.current.y,
          z: defaultCamPos.current.z,
          duration: 1.5,
          ease: 'power2.inOut',
          onComplete: () => {
            camera.lookAt(0, 0, 0);
          },
        });
      },
    });

    // t=0s to 2s: camera pans toward intercept point
    tl.to(camera.position, {
      x: targetEncounterPos.x + 0.8,
      y: targetEncounterPos.y + 0.4,
      z: targetEncounterPos.z + 1.2,
      duration: 2.0,
      ease: 'power2.out',
    });

    // t=2s to 5s: vehicles approach along converging trajectories
    tl.to(
      animState.current.obj1Pos,
      {
        x: targetEncounterPos.x - 0.05,
        y: targetEncounterPos.y + 0.03,
        z: targetEncounterPos.z - 0.04,
        duration: 3.0,
        ease: 'power1.in',
      },
      2.0
    );

    tl.to(
      animState.current.obj2Pos,
      {
        x: targetEncounterPos.x + 0.05,
        y: targetEncounterPos.y - 0.03,
        z: targetEncounterPos.z + 0.04,
        duration: 3.0,
        ease: 'power1.in',
      },
      2.0
    );

    // t=5s: flash explosion and shockwave pulse
    tl.to(
      animState.current,
      {
        flashIntensity: 8,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      },
      5.0
    );

    tl.to(
      animState.current,
      {
        shockwaveScale: 1.5,
        shockwaveOpacity: 0.8,
        duration: 0.4,
        ease: 'power2.out',
      },
      5.0
    );

    tl.to(
      animState.current,
      {
        shockwaveOpacity: 0,
        duration: 0.4,
      },
      5.4
    );

    // Overlay updates
    tl.add(() => setOverlayStatus('NEAR MISS DETECTED'), 5.3);
    tl.add(() => setOverlayStatus('MANEUVER RECOMMENDED'), 6.5);
    tl.add(() => setOverlayStatus('COLLISION AVOIDED'), 7.5);

    // Deflection burn separating vehicles
    tl.to(
      animState.current.obj1Pos,
      {
        x: targetEncounterPos.x - 0.6,
        y: targetEncounterPos.y + 0.4,
        z: targetEncounterPos.z - 0.8,
        duration: 2.5,
        ease: 'power2.out',
      },
      5.3
    );

    tl.to(
      animState.current.obj2Pos,
      {
        x: targetEncounterPos.x + 0.7,
        y: targetEncounterPos.y - 0.5,
        z: targetEncounterPos.z + 0.9,
        duration: 2.5,
        ease: 'power2.out',
      },
      5.3
    );

    return () => {
      tl.kill();
    };
  }, [isRunning, camera, targetEncounterPos]);

  useFrame(() => {
    if (!isRunning) return;

    if (obj1Ref.current) {
      obj1Ref.current.position.copy(animState.current.obj1Pos);
    }
    if (obj2Ref.current) {
      obj2Ref.current.position.copy(animState.current.obj2Pos);
    }
    if (flashLightRef.current) {
      flashLightRef.current.intensity = animState.current.flashIntensity;
    }
    if (shockwaveRef.current) {
      shockwaveRef.current.scale.setScalar(animState.current.shockwaveScale);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = animState.current.shockwaveOpacity;
      }
    }
  });

  if (!isRunning) return null;

  return (
    <group>
      {/* Primary Object (Satellite) */}
      <mesh ref={obj1Ref} position={[1.0, 1.4, -1.6]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Secondary Object (Debris Fragment) */}
      <mesh ref={obj2Ref} position={[2.6, 0.2, -0.4]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color="#ff3366"
          emissive="#ff3366"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Point light flash at encounter location */}
      <pointLight
        ref={flashLightRef}
        position={targetEncounterPos}
        color="#ffffff"
        intensity={0}
        distance={5}
      />

      {/* Expanding shockwave ring */}
      <mesh
        ref={shockwaveRef}
        position={targetEncounterPos}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.05, 0.12, 32]} />
        <meshBasicMaterial
          color="#ff3366"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Trajectory Guide Vectors */}
      <Line
        points={[
          [1.0, 1.4, -1.6],
          [targetEncounterPos.x, targetEncounterPos.y, targetEncounterPos.z],
        ]}
        color="#00f5ff"
        lineWidth={1.5}
        dashed
        opacity={0.5}
        transparent
      />

      <Line
        points={[
          [2.6, 0.2, -0.4],
          [targetEncounterPos.x, targetEncounterPos.y, targetEncounterPos.z],
        ]}
        color="#ff3366"
        lineWidth={1.5}
        dashed
        opacity={0.5}
        transparent
      />

      {/* 2D HUD Alert Status Card */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-col items-center justify-start pt-24">
          <AnimatePresence mode="wait">
            {overlayStatus && (
              <motion.div
                key={overlayStatus}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`px-6 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
                  overlayStatus === 'COLLISION AVOIDED'
                    ? 'bg-vs-success/10 border-vs-success text-vs-success shadow-vs-success/20'
                    : overlayStatus === 'MANEUVER RECOMMENDED'
                    ? 'bg-vs-warning/10 border-vs-warning text-vs-warning shadow-vs-warning/20'
                    : 'bg-vs-alert/10 border-vs-alert text-vs-alert shadow-vs-alert/20'
                }`}
              >
                {overlayStatus === 'COLLISION AVOIDED' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : overlayStatus === 'MANEUVER RECOMMENDED' ? (
                  <Navigation className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                )}
                <span className="font-heading font-bold text-sm tracking-widest uppercase">
                  {overlayStatus}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {showReplay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center gap-4 pointer-events-auto"
            >
              <button
                onClick={runSimulation}
                className="px-5 py-2.5 rounded-xl font-heading text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-vs-cyan to-vs-violet text-black shadow-lg shadow-vs-cyan/20 hover:scale-105 transition-transform"
                data-interactive
              >
                Replay Simulation
              </button>
              <button
                onClick={stopSimulation}
                className="px-5 py-2.5 rounded-xl font-heading text-xs font-semibold tracking-wider uppercase bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                data-interactive
              >
                Dismiss Simulation
              </button>
            </motion.div>
          )}
        </div>
      </Html>
    </group>
  );
};
