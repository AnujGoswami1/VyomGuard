/**
 * AnimatedButton Component
 *
 * Reusable button component with three visual variants:
 * - primary: Cyan-to-violet gradient with glow
 * - ghost: Transparent with border, hover effect
 * - danger: Red-tinted with red border
 *
 * Includes Framer Motion hover/tap animations and loading state.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'ghost' | 'danger';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show a loading spinner */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Motion-animated button with variant styling and loading state.
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses =
    'relative px-6 py-3 rounded-xl font-heading text-sm font-medium tracking-wide ' +
    'transition-colors duration-200 flex items-center justify-center gap-2 ' +
    'disabled:opacity-40 disabled:pointer-events-none';

  const variantClasses: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-vs-cyan to-vs-violet text-black shadow-lg shadow-vs-cyan/20 ' +
      'hover:shadow-vs-cyan/40',
    ghost:
      'bg-transparent border border-white/20 text-white hover:border-vs-cyan hover:text-vs-cyan',
    danger:
      'bg-vs-alert/20 border border-vs-alert/40 text-vs-alert hover:bg-vs-alert/30',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      data-interactive
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};
