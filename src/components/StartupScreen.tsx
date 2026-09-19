import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface StartupScreenProps {
  onComplete: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'init' | 'light' | 'logo' | 'text' | 'exit'>('init');

  useEffect(() => {
    // Accessibility check: respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isReturningSession = !!sessionStorage.getItem('antiqora_session_active');
    sessionStorage.setItem('antiqora_session_active', 'true');

    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(quickTimer);
    }

    // Speed multiplier for returning users in same session (0.6x for fast launch)
    const mult = isReturningSession ? 0.6 : 1.0;

    // Timeline for the opening sequence: Light -> Logo -> Text -> Exit
    const t1 = setTimeout(() => setStage('light'), 80 * mult);
    const t2 = setTimeout(() => setStage('logo'), 350 * mult);
    const t3 = setTimeout(() => setStage('text'), 800 * mult);
    const t4 = setTimeout(() => {
      setStage('exit');
      onComplete();
    }, 1750 * mult);

    // Error Safety: Absolute fallback timer so app NEVER hangs permanently
    const fallbackTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.08, 
        filter: 'blur(8px)',
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none touch-none"
    >
      {/* 1. Dark Elegant Background with Subtle Ambient Grid & Light Drift */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#020617_0%,#0f172a_50%,#020617_100%)] pointer-events-none" />
      
      {/* Subtle Grid Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none opacity-60" />

      {/* Subtle Drifting Particles / Light Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -30, 0],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px]"
        />
      </div>

      {/* 2. Soft Light Center Spot */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          stage !== 'init' 
            ? { scale: [0.5, 1.2, 1], opacity: [0, 0.8, 0.5] } 
            : { scale: 0.2, opacity: 0 }
        }
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/25 via-indigo-500/20 to-purple-500/15 blur-3xl pointer-events-none"
      />

      {/* Central Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-sm w-full">
        
        {/* 3. Antiqora Logo Formation */}
        <div className="relative flex items-center justify-center mb-6">
          
          {/* Futuristic Orbit Ring 1 */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
            animate={
              stage === 'logo' || stage === 'text' || stage === 'exit'
                ? { scale: 1, opacity: 0.35, rotate: 360 }
                : { scale: 0.6, opacity: 0 }
            }
            transition={{ 
              scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.5 },
              rotate: { duration: 16, repeat: Infinity, ease: 'linear' }
            }}
            className="absolute w-36 h-36 rounded-full border border-cyan-400/30 border-dashed"
          />

          {/* Futuristic Orbit Ring 2 */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: 45 }}
            animate={
              stage === 'logo' || stage === 'text' || stage === 'exit'
                ? { scale: 1, opacity: 0.25, rotate: -360 }
                : { scale: 0.7, opacity: 0 }
            }
            transition={{ 
              scale: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.5 },
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
            }}
            className="absolute w-44 h-44 rounded-full border border-indigo-400/20 border-t-cyan-400/60 border-b-purple-400/60"
          />

          {/* Antiqora Logo Symbol */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
            animate={
              stage === 'logo' || stage === 'text' || stage === 'exit'
                ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
                : { scale: 0.5, opacity: 0, filter: 'blur(10px)' }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] flex items-center justify-center"
          >
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 512 512" 
              className="drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]"
            >
              <defs>
                <linearGradient id="splash-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
                <filter id="splash-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <ellipse cx="256" cy="256" rx="190" ry="70" fill="none" stroke="url(#splash-logo-grad)" strokeWidth="8" transform="rotate(-35 256 256)" opacity="0.75" />
              <ellipse cx="256" cy="256" rx="190" ry="70" fill="none" stroke="url(#splash-logo-grad)" strokeWidth="5" transform="rotate(35 256 256)" opacity="0.55" />
              <circle cx="256" cy="256" r="145" fill="none" stroke="url(#splash-logo-grad)" strokeWidth="3" strokeDasharray="12 18" opacity="0.7" />
              <path d="M256 90 L385 390 L315 390 L290 320 L222 320 L197 390 L127 390 Z M256 160 L208 270 L304 270 Z" fill="url(#splash-logo-grad)" filter="url(#splash-neon-glow)" />
              <circle cx="370" cy="170" r="14" fill="#38bdf8" filter="url(#splash-neon-glow)" />
            </svg>
          </motion.div>
        </div>

        {/* 4. "Antiqora" Brand Title & Tagline Fade-In */}
        <div className="h-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={
              stage === 'text' || stage === 'exit'
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 10, filter: 'blur(4px)' }
            }
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-1"
          >
            <h1 className="text-3xl font-black tracking-[0.25em] bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent uppercase drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
              ANTIQORA
            </h1>
            <p className="text-[11px] font-medium tracking-[0.2em] text-cyan-400/80 uppercase">
              Understand the World. Beyond Search.
            </p>
          </motion.div>
        </div>

      </div>

      {/* Discrete Skip Trigger for User Safety */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute bottom-6 text-[10px] text-slate-600 hover:text-slate-400 font-mono tracking-widest uppercase transition-opacity opacity-40 hover:opacity-100"
      >
        Tap to continue
      </button>
    </motion.div>
  );
};
