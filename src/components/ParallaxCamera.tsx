import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParallaxCameraProps {
  /** Maximum camera translation amplitude factor (default: 0.4) */
  intensity?: number;
  /** Smoothing lerp coefficient (default: 0.03) */
  lerpFactor?: number;
}

/**
 * ParallaxCamera Component
 * Smoothly shifts camera perspective based on mouse cursor coordinates,
 * keeping the optical axis anchored to the scene center (0, 0, 0).
 */
export const ParallaxCamera: React.FC<ParallaxCameraProps> = ({
  intensity = 0.4,
  lerpFactor = 0.03,
}) => {
  const { camera, pointer } = useThree();
  const originRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 8));
  const initialized = useRef<boolean>(false);

  useFrame(() => {
    if (!initialized.current) {
      originRef.current.copy(camera.position);
      initialized.current = true;
    }

    const targetX = originRef.current.x + pointer.x * intensity;
    const targetY = originRef.current.y + pointer.y * intensity * 0.75;

    camera.position.x += (targetX - camera.position.x) * lerpFactor;
    camera.position.y += (targetY - camera.position.y) * lerpFactor;
    camera.lookAt(0, 0, 0);
  });

  return null;
};
