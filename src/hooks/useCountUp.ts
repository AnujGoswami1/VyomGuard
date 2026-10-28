/**
 * useCountUp Hook
 *
 * Animates a numeric value from 0 to a target over a specified duration.
 * Uses requestAnimationFrame for smooth 60fps animation with easeOutExpo easing.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Ease-out exponential easing function.
 * Produces a natural deceleration effect.
 *
 * @param t - Progress from 0 to 1
 * @returns Eased value from 0 to 1
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates a number from 0 to the target value.
 *
 * @param target - Target number to count up to
 * @param duration - Animation duration in milliseconds (default 1500)
 * @returns Current animated value
 */
export function useCountUp(target: number, duration: number = 1500): number {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return value;
}
