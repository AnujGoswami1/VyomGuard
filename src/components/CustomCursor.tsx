/**
 * CustomCursor Component
 *
 * Renders a custom cursor with particle trail and click ripple effects.
 * The cursor is a cyan dot with 8 trailing particles that lerp toward
 * the mouse position, creating a fluid following effect.
 *
 * Changes to violet when hovering over interactive elements.
 */

import React, { useRef, useEffect, useCallback } from 'react';

/** Number of trailing particles behind the cursor */
const TRAIL_COUNT = 8;

/** Base color for the cursor (cyan) */
const COLOR_CYAN = '#00f5ff';

/** Hover color for interactive elements (violet) */
const COLOR_VIOLET = '#a855f7';

interface Particle {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  startTime: number;
}

/**
 * Full-viewport canvas cursor replacement with particle trails and click ripples.
 */
export const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const ripplesRef = useRef<Ripple[]>([]);
  const isHoveringRef = useRef(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    ripplesRef.current.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      opacity: 1,
      startTime: performance.now(),
    });
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const isInteractive =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') !== null ||
      target.closest('a') !== null ||
      target.closest('[data-interactive]') !== null ||
      target.dataset.interactive !== undefined;

    isHoveringRef.current = isInteractive;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseOver);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const color = isHoveringRef.current ? COLOR_VIOLET : COLOR_CYAN;

      // Update and draw trailing particles
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const particle = particlesRef.current[i];
        const target = i === 0
          ? { x: mx, y: my }
          : particlesRef.current[i - 1];

        const ease = 0.15 - i * 0.012;
        particle.x += (target.x - particle.x) * Math.max(ease, 0.03);
        particle.y += (target.y - particle.y) * Math.max(ease, 0.03);

        const alpha = 1 - (i / TRAIL_COUNT) * 0.8;
        const radius = 3 - (i / TRAIL_COUNT) * 2;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(radius, 1), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.6;
        ctx.fill();
      }

      // Draw main cursor dot
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw cursor glow
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw and update ripples
      const now = performance.now();
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        const elapsed = now - ripple.startTime;
        if (elapsed > 600) return false;

        const progress = elapsed / 600;
        const currentRadius = progress * 30;
        const currentOpacity = 1 - progress;

        ctx.globalAlpha = currentOpacity * 0.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        return true;
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [handleMouseMove, handleClick, handleMouseOver]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};
