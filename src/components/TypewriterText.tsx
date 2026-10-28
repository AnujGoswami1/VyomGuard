/**
 * TypewriterText Component
 *
 * Reveals text characters one at a time with a blinking cursor effect.
 * Used for the hero section subtitle to create a terminal-like aesthetic.
 */

import React, { useEffect, useState, useCallback } from 'react';

interface TypewriterTextProps {
  /** The full text to reveal */
  text: string;
  /** Milliseconds between each character reveal (default 30) */
  speed?: number;
  /** Callback when typing is complete */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Character-by-character text reveal with blinking cursor.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        handleComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, handleComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span
          className="inline-block w-0.5 h-4 bg-vs-cyan ml-0.5 align-middle"
          style={{ animation: 'blink 1s step-end infinite' }}
        />
      )}
    </span>
  );
};
