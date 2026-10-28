/**
 * AnimatedCounter Component
 *
 * Displays a number that animates from 0 to the target value on mount.
 * Uses the useCountUp hook for smooth easeOutExpo animation.
 * Formatted with thousands separators in JetBrains Mono.
 */

import React from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { formatNumber } from '../utils/format';

interface AnimatedCounterProps {
  /** Target value to count up to */
  value: number;
  /** Animation duration in milliseconds (default 1500) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated number counter with formatted output.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1500,
  className = '',
}) => {
  const currentValue = useCountUp(value, duration);

  return (
    <span className={`font-mono-data ${className}`}>
      {formatNumber(currentValue)}
    </span>
  );
};
