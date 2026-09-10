import React from 'react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  onAnimationComplete?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 48,
  animated = false,
  onAnimationComplete,
}) => {
  // SVG path definition:
  // An organic, elegant curve: starts from an inner soul drop/wellspring, flows up into an expressive note stroke
  const pathD = "M 32 64 C 20 64 12 52 12 38 C 12 22 26 12 40 12 C 54 12 68 24 68 38 C 68 54 54 68 38 68 C 24 68 18 56 18 46 C 18 36 26 28 36 28 C 46 28 52 36 52 44 C 52 50 48 54 42 54 C 36 54 34 50 34 46";

  // Soul + Note path:
  // A flowing single continuous line:
  // Starts with a deep gentle root, loops around in a breath-like aura, and rises to a poised note head
  const glyphPath = "M 48 20 C 32 20 20 32 20 48 C 20 62 30 74 46 74 C 62 74 74 62 74 46 C 74 26 56 12 36 12 C 22 12 10 24 10 42 C 10 66 28 86 52 86 C 76 86 90 68 90 48";

  if (!animated) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        aria-label="SoulNote Logo"
      >
        <path
          d={glyphPath}
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
        <circle cx="48" cy="48" r="3.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SoulNote Animated Logo"
      >
        {/* Abstract Soul + Note organic flowing line */}
        <motion.path
          d={glyphPath}
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.8, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.4 },
          }}
          onAnimationComplete={onAnimationComplete}
        />
        {/* Subtle center heartbeat point */}
        <motion.circle
          cx="48"
          cy="48"
          r="3.5"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
};
