/**
 * useVideoTextureSafe Hook
 *
 * Safely loads a video as a Three.js VideoTexture with automatic fallback
 * to a procedurally generated canvas texture if the video fails to load.
 *
 * Fallback texture renders concentric orbital rings with satellite dots
 * on a dark gradient background, maintaining the space aesthetic.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Generates a procedural fallback texture when the video cannot be loaded.
 * Renders orbital rings and satellite dots on a dark gradient background.
 *
 * @returns THREE.CanvasTexture with the generated imagery
 */
function createFallbackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Dark radial gradient background
  const bgGradient = ctx.createRadialGradient(512, 288, 50, 512, 288, 500);
  bgGradient.addColorStop(0, '#0a1628');
  bgGradient.addColorStop(0.5, '#060d1a');
  bgGradient.addColorStop(1, '#030014');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1024, 576);

  // Draw 8 concentric orbital rings
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
  ctx.lineWidth = 1;

  for (let i = 1; i <= 8; i++) {
    const radius = 40 + i * 35;
    ctx.beginPath();
    ctx.ellipse(512, 288, radius * 1.6, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw 20 satellite dots on the rings
  for (let i = 0; i < 20; i++) {
    const ringIdx = Math.floor(i / 2.5) + 1;
    const radius = 40 + ringIdx * 35;
    const angle = (i / 20) * Math.PI * 2 + (i * 0.7);
    const x = 512 + Math.cos(angle) * radius * 1.6;
    const y = 288 + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#a855f7' : '#ffffff';
    ctx.fill();

    // Glow around each dot
    const dotGlow = ctx.createRadialGradient(x, y, 0, x, y, 6);
    dotGlow.addColorStop(0, 'rgba(0, 245, 255, 0.3)');
    dotGlow.addColorStop(1, 'rgba(0, 245, 255, 0)');
    ctx.fillStyle = dotGlow;
    ctx.fillRect(x - 6, y - 6, 12, 12);
  }

  // Center dot representing Earth
  const earthGlow = ctx.createRadialGradient(512, 288, 0, 512, 288, 20);
  earthGlow.addColorStop(0, 'rgba(0, 245, 255, 0.4)');
  earthGlow.addColorStop(0.5, 'rgba(0, 245, 255, 0.1)');
  earthGlow.addColorStop(1, 'rgba(0, 245, 255, 0)');
  ctx.fillStyle = earthGlow;
  ctx.beginPath();
  ctx.arc(512, 288, 20, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Loads a video as a Three.js texture with graceful fallback.
 *
 * @param videoUrl - URL of the video to load (e.g., "/videos/hero.mp4")
 * @returns Object containing the texture and whether it's the fallback
 */
export function useVideoTextureSafe(videoUrl: string): {
  texture: THREE.Texture;
  isFallback: boolean;
  videoElement: HTMLVideoElement | null;
} {
  const [texture, setTexture] = useState<THREE.Texture>(() => createFallbackTexture());
  const [isFallback, setIsFallback] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    videoRef.current = video;

    const onCanPlay = () => {
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBAFormat;
      videoTexture.colorSpace = THREE.SRGBColorSpace;

      setTexture(videoTexture);
      setIsFallback(false);

      video.play().catch(() => {
        // Autoplay was blocked; wait for user interaction
        const resumePlay = () => {
          video.play().catch(() => {
            // Still blocked; keep the video texture but it may be static
          });
          document.removeEventListener('click', resumePlay);
          document.removeEventListener('touchstart', resumePlay);
        };
        document.addEventListener('click', resumePlay, { once: true });
        document.addEventListener('touchstart', resumePlay, { once: true });
      });
    };

    const onError = () => {
      console.warn(
        `[VYOMSENTINEL] Video failed to load from "${videoUrl}". ` +
        'Using procedural fallback texture. Place a valid MP4 at public/videos/hero.mp4 to enable video playback.'
      );
      setTexture(createFallbackTexture());
      setIsFallback(true);
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    // Attempt to load
    video.load();

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.pause();
      video.src = '';
      video.load();
      videoRef.current = null;
    };
  }, [videoUrl]);

  return { texture, isFallback, videoElement: videoRef.current };
}
