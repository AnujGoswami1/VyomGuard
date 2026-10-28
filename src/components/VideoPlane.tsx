import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVideoTextureSafe } from '../hooks/useVideoTextureSafe';
import { useAppStore } from '../store/app-store';

interface VideoPlaneProps {
  /** Video media source path */
  videoUrl?: string;
  /** Initial 3D translation */
  position?: [number, number, number];
  /** Plane dimensions [width, height] */
  size?: [number, number];
}

const videoVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Slight cylindrical curvature toward camera along X axis
    vec3 transformed = position;
    float distFromCenter = length(position.xy);
    transformed.z += (1.0 - (distFromCenter * distFromCenter * 0.12)) * 0.15;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const videoFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uRimIntensity;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Vignette calculation
    vec2 centerOffset = vUv - vec2(0.5);
    float dist = length(centerOffset);
    float vignette = smoothstep(0.7, 0.2, dist);

    // Cyan edge rim glow
    float edgeFactor = smoothstep(0.35, 0.5, dist);
    vec3 rimGlow = vec3(0.0, 0.96, 1.0) * edgeFactor * uRimIntensity;

    // Subtle 8% scanline overlay
    float scanline = sin((vUv.y + uTime * 0.05) * 800.0) * 0.04;

    vec3 finalRgb = texColor.rgb * vignette + rimGlow - scanline;
    gl_FragColor = vec4(finalRgb, 1.0);
  }
`;

const backdropVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const backdropFragmentShader = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float dist = length(vUv - vec2(0.5));
    float alpha = smoothstep(0.5, 0.0, dist) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/**
 * VideoPlane Component
 * Renders curved 3D cinema screen displaying hero video or procedural texture
 * with CRT scanlines, peripheral vignette, dynamic glow, and interactive hover response.
 */
export const VideoPlane: React.FC<VideoPlaneProps> = ({
  videoUrl = '/videos/hero.mp4',
  position = [0, 0, 2.5],
  size = [3.2, 1.8],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const openFocusModal = useAppStore((s) => s.openFocusModal);

  const { texture } = useVideoTextureSafe(videoUrl);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uRimIntensity: { value: 0.4 },
      uTime: { value: 0 },
    }),
    [texture]
  );

  const backdropUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#00f5ff') },
      uOpacity: { value: 0.25 },
    }),
    []
  );

  // Smooth scale lerp for spring-like responsiveness
  const currentScale = useRef<number>(1.0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Slow Y-axis rotation
      groupRef.current.rotation.y += 0.0004;
      // Gentle vertical bobbing
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.05;
    }

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
      const targetRim = hovered ? 0.9 : 0.4;
      shaderRef.current.uniforms.uRimIntensity.value +=
        (targetRim - shaderRef.current.uniforms.uRimIntensity.value) * 0.1;
      shaderRef.current.uniforms.uTexture.value = texture;
    }

    if (meshRef.current) {
      const targetScale = hovered ? 1.03 : 1.0;
      currentScale.current += (targetScale - currentScale.current) * 0.12;
      meshRef.current.scale.setScalar(currentScale.current);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Background radial glow halo */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[size[0] + 0.5, size[1] + 0.5]} />
        <shaderMaterial
          vertexShader={backdropVertexShader}
          fragmentShader={backdropFragmentShader}
          uniforms={backdropUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Primary curved video screen */}
      <mesh
        ref={meshRef}
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
          openFocusModal();
        }}
      >
        <planeGeometry args={[size[0], size[1], 32, 32]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={videoVertexShader}
          fragmentShader={videoFragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
