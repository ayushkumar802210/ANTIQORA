import React, { useId } from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showSymbol?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Custom-crafted futuristic ANTIQORA wordmark
 * Precision vector letterforms with angular cuts, distinctive A, Q, and R shapes,
 * subtle cyan -> electric blue -> violet gradient and soft neon glow.
 */
export const AntiqoraWordmark: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
}> = ({ width = '100%', height = '100%', className = '' }) => {
  const gradId = useId().replace(/:/g, '_') + '_wordmark_grad';
  const glowId = useId().replace(/:/g, '_') + '_wordmark_glow';

  return (
    <svg
      viewBox="0 0 314 44"
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ANTIQORA"
    >
      <title>ANTIQORA</title>
      <defs>
        {/* Subtle Cyan -> Electric Blue -> Violet gradient */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Soft, refined neon glow with sharp letter edges */}
        <filter id={glowId} x="-10%" y="-20%" width="120%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#8b5cf6" floodOpacity="0.22" />
        </filter>
      </defs>

      <g fill={`url(#${gradId})`} filter={`url(#${glowId})`}>
        {/* 1. Letter A: Geometric apex bevel, laser split crossbar */}
        <path
          d="M 16.5,4 L 19.5,4 L 34,40 L 27.5,40 L 23.8,31 L 19.5,31 L 19.5,27 L 22.2,27 L 18,14 L 13.8,27 L 16.5,27 L 16.5,31 L 12.2,31 L 8.5,40 L 2,40 Z"
        />

        {/* 2. Letter N: Monolithic vertical stems with angular cyber-beam */}
        <path
          d="M 46,4 L 52,4 L 72,32.5 L 72,4 L 78,4 L 78,40 L 72,40 L 52,11.5 L 52,40 L 46,40 Z"
        />

        {/* 3. Letter T: 45° beveled end crossbar with central vertical pillar */}
        <path
          d="M 88,4 L 118,4 L 114.5,9.5 L 106,9.5 L 106,40 L 100,40 L 100,9.5 L 91.5,9.5 Z"
        />

        {/* 4. Letter I: Precision monolithic pillar */}
        <path
          d="M 128,4 L 134,4 L 134,40 L 128,40 Z"
        />

        {/* 5. Letter Q: Geometric squircle with signature 45° cyber laser tail */}
        <g fillRule="evenodd">
          <path
            d="M 152,4 L 168,4 C 174,4 176,6.5 176,12 L 176,28 C 176,32 173.5,35 170,36 L 170,31.5 C 171.5,30.5 171.5,29 171.5,27 L 171.5,12 C 171.5,8 168,8 165,8 L 155,8 C 152,8 149.5,8 149.5,12 L 149.5,28 C 149.5,32 152,36 155,36 L 163,36 L 163,40 L 152,40 C 146,40 144,37.5 144,32 L 144,12 C 144,6.5 146,4 152,4 Z"
          />
          {/* Distinctive projecting cyber laser blade tail */}
          <path
            d="M 166.5,27.5 L 171.5,27.5 L 182,38.5 L 182,41.5 L 177.5,41.5 L 166.5,30.5 Z"
          />
        </g>

        {/* 6. Letter O: Harmonic geometric squircle matching Q */}
        <path
          fillRule="evenodd"
          d="M 200,4 L 218,4 C 224,4 226,6.5 226,12 L 226,32 C 226,37.5 224,40 218,40 L 200,40 C 194,40 192,37.5 192,32 L 192,12 C 192,6.5 194,4 200,4 Z M 201,9.5 L 217,9.5 C 220,9.5 220.5,12 220.5,14 L 220.5,30 C 220.5,32 220,34.5 217,34.5 L 201,34.5 C 198,34.5 197.5,32 197.5,30 L 197.5,14 C 197.5,12 198,9.5 201,9.5 Z"
        />

        {/* 7. Letter R: Futuristic stem, geometric bowl and angled cyber diagonal kick */}
        <g fillRule="evenodd">
          <path
            d="M 236,4 L 242,4 L 242,40 L 236,40 Z"
          />
          <path
            d="M 242,4 L 258,4 C 264,4 266,6.5 266,12 L 266,17 C 266,22.5 264,24.5 258,24.5 L 242,24.5 Z M 242,9.5 L 256.5,9.5 C 259.5,9.5 260.5,11.5 260.5,13.5 L 260.5,15.5 C 260.5,17.5 259.5,19 256.5,19 L 242,19 Z"
          />
          {/* Angled sci-fi leg */}
          <path
            d="M 251.5,23.5 L 258,23.5 L 268,39 L 268,40 L 261,40 L 247.5,25.5 Z"
          />
        </g>

        {/* 8. Letter A: Identical symmetry to the first A */}
        <path
          d="M 292.5,4 L 295.5,4 L 310,40 L 303.5,40 L 299.8,31 L 295.5,31 L 295.5,27 L 298.2,27 L 294,14 L 289.8,27 L 292.5,27 L 292.5,31 L 288.2,31 L 284.5,40 L 278,40 Z"
        />
      </g>
    </svg>
  );
};

/**
 * Refined ANTIQORA Orbital Symbol
 * Dual orbital quantum rings, dashed telemetry circle, inner matching apex core with split laser bar,
 * and glowing photon satellite node.
 */
export const AntiqoraSymbol: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 48, className = '' }) => {
  const gradId = useId().replace(/:/g, '_') + '_symbol_grad';
  const glowId = useId().replace(/:/g, '_') + '_symbol_glow';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={`overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="75%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#06b6d4" floodOpacity="0.45" />
          <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#8b5cf6" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Orbital Quantum Ring 1 (-35°) */}
      <ellipse
        cx="256"
        cy="256"
        rx="192"
        ry="72"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="7"
        transform="rotate(-35 256 256)"
        opacity="0.85"
      />

      {/* Orbital Quantum Ring 2 (+35°) */}
      <ellipse
        cx="256"
        cy="256"
        rx="192"
        ry="72"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="5.5"
        transform="rotate(35 256 256)"
        opacity="0.65"
      />

      {/* Dashed Telemetry Alignment Orbit */}
      <circle
        cx="256"
        cy="256"
        r="145"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeDasharray="9 15"
        opacity="0.7"
      />

      {/* Inner Apex Monogram matching the Wordmark's geometric A with split laser bar */}
      <path
        d="M 246,95 L 266,95 L 372,380 L 320,380 L 295,305 L 266,305 L 266,275 L 285,275 L 256,155 L 227,275 L 246,275 L 246,305 L 217,305 L 192,380 L 140,380 Z"
        fill={`url(#${gradId})`}
        filter={`url(#${glowId})`}
      />

      {/* Glowing Orbital Photon Node */}
      <circle
        cx="370"
        cy="170"
        r="22"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle
        cx="370"
        cy="170"
        r="13"
        fill="#38bdf8"
        filter={`url(#${glowId})`}
      />
    </svg>
  );
};

/**
 * Main ANTIQORA Logo Component
 * Incorporates the refined symbol, custom futuristic wordmark, and clean "SEARCH BEYOND LIMITS" tagline.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  showSymbol = true,
  className = '',
  onClick
}) => {
  const config = {
    sm: {
      symbolSize: 28,
      wordmarkWidth: 118,
      wordmarkHeight: 16.5,
      taglineClass: 'text-[8.5px] tracking-[0.24em]',
      gap: 'gap-2',
    },
    md: {
      symbolSize: 36,
      wordmarkWidth: 150,
      wordmarkHeight: 21,
      taglineClass: 'text-[9.5px] tracking-[0.26em]',
      gap: 'gap-2.5',
    },
    lg: {
      symbolSize: 48,
      wordmarkWidth: 205,
      wordmarkHeight: 28.5,
      taglineClass: 'text-[10.5px] tracking-[0.28em]',
      gap: 'gap-3',
    },
    xl: {
      symbolSize: 64,
      wordmarkWidth: 260,
      wordmarkHeight: 36.5,
      taglineClass: 'text-[10px] sm:text-[11px] tracking-[0.3em]',
      gap: 'gap-3.5',
    },
  }[size];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center ${config.gap} group select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Refined Orbital Symbol */}
      {showSymbol && (
        <div className="relative flex items-center justify-center shrink-0">
          <div className="transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]">
            <AntiqoraSymbol size={config.symbolSize} />
          </div>
        </div>
      )}

      {/* Brand Identity: Custom Wordmark + Futuristic Tagline */}
      <div className="flex flex-col items-start justify-center">
        <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
          <AntiqoraWordmark
            width={config.wordmarkWidth}
            height={config.wordmarkHeight}
          />
        </div>

        {showTagline && (
          <p
            className={`font-['Orbitron',sans-serif] ${config.taglineClass} font-semibold uppercase text-cyan-400/90 mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-colors duration-200 group-hover:text-cyan-300`}
          >
            Search Beyond Limits
          </p>
        )}
      </div>
    </motion.div>
  );
};
