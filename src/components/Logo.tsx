import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, onClick }) => {
  const dimensions = {
    sm: { width: 32, height: 32, text: 'text-lg' },
    md: { width: 40, height: 40, text: 'text-xl' },
    lg: { width: 56, height: 56, text: 'text-3xl' },
    xl: { width: 80, height: 80, text: 'text-5xl' },
  }[size];

  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative flex items-center justify-center">
        <svg 
          width={dimensions.width} 
          height={dimensions.height} 
          viewBox="0 0 512 512" 
          className="transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
        >
          <defs>
            <linearGradient id="logo-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="neon-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <ellipse cx="256" cy="256" rx="190" ry="70" fill="none" stroke="url(#logo-glow)" strokeWidth="8" transform="rotate(-35 256 256)" opacity="0.65" />
          <ellipse cx="256" cy="256" rx="190" ry="70" fill="none" stroke="url(#logo-glow)" strokeWidth="5" transform="rotate(35 256 256)" opacity="0.45" />
          <circle cx="256" cy="256" r="145" fill="none" stroke="url(#logo-glow)" strokeWidth="3" strokeDasharray="12 18" opacity="0.6" />
          <path d="M256 90 L385 390 L315 390 L290 320 L222 320 L197 390 L127 390 Z M256 160 L208 270 L304 270 Z" fill="url(#logo-glow)" filter="url(#neon-blur)" />
          <circle cx="370" cy="170" r="14" fill="#38bdf8" filter="url(#neon-blur)" />
        </svg>
      </div>
      <div>
        <span className={`font-black tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent ${dimensions.text}`}>
          ANTIQORA
        </span>
        {showTagline && (
          <p className="text-xs tracking-widest text-cyan-400/80 font-medium uppercase mt-0.5">
            Search Beyond Limits
          </p>
        )}
      </div>
    </div>
  );
};
