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
  // Official SoulNote Emblem: Central Soul Wellspring, Inner Crescent Resonance & Outer Swirling Spiral Enso
  const innerArc = "M 56.2 36.7 A 14.1 14.1 0 1 0 56.2 63.3";
  const outerSpiral = "M 66.0 27.0 A 27.8 27.8 0 0 0 22.2 50 C 22.2 65.6 35.5 78.5 50 78.5 C 62.2 78.5 71.6 71.5 74.3 61.3";

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
        <circle cx="50" cy="50" r="3.2" fill="currentColor" />
        <path
          d={innerArc}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
        <path
          d={outerSpiral}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
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
        {/* Central Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="3.2"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Inner Crescent */}
        <motion.path
          d={innerArc}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.0, delay: 0.2, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.3, delay: 0.2 },
          }}
        />
        {/* Outer Resonant Spiral */}
        <motion.path
          d={outerSpiral}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.4, delay: 0.4, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.3, delay: 0.4 },
          }}
          onAnimationComplete={onAnimationComplete}
        />
      </svg>
    </div>
  );
};
