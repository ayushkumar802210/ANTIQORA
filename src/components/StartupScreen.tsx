import React, { useEffect, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AntiqoraSymbol, AntiqoraWordmark } from './Logo';

interface StartupScreenProps {
  onComplete: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onComplete }) => {
  // Stages:
  // 'init' -> singularity point
  // 'trails' -> laser light trails expand
  // 'symbol' -> 3D symbol formation
  // 'wordmark' -> custom ANTIQORA wordmark reveals
  // 'brand' -> tagline 'SEARCH BEYOND LIMITS' & glow pulse
  // 'exit' -> gentle scale down and dissolve into main interface
  const [stage, setStage] = useState<'init' | 'trails' | 'symbol' | 'wordmark' | 'brand' | 'exit'>('init');
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);
  const gradId = useId().replace(/:/g, '_') + '_startup_grad';

  const handleFinish = useCallback(() => {
    try {
      localStorage.setItem('antiqora_first_visit_completed', 'true');
      sessionStorage.setItem('antiqora_session_active', 'true');
    } catch {}
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // 1. Accessibility: respect prefers-reduced-motion
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    // 2. Check first-visit vs returning-visit
    let hasCompletedFirstVisit = false;
    try {
      hasCompletedFirstVisit = !!localStorage.getItem('antiqora_first_visit_completed');
    } catch {}

    setIsFirstVisit(!hasCompletedFirstVisit);

    // Timeline Configuration
    if (!hasCompletedFirstVisit) {
      // Complete 1.8 - 2.2 second cinematic ANTIQORA intro
      const t1 = setTimeout(() => setStage('trails'), 260);
      const t2 = setTimeout(() => setStage('symbol'), 650);
      const t3 = setTimeout(() => setStage('wordmark'), 1100);
      const t4 = setTimeout(() => setStage('brand'), 1380);
      const t5 = setTimeout(() => {
        setStage('exit');
        handleFinish();
      }, 1950);

      // Fallback safeguard
      const fallback = setTimeout(() => handleFinish(), 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(fallback);
      };
    } else {
      // Returning users: swift 0.6 second logo transition
      const t1 = setTimeout(() => setStage('symbol'), 100);
      const t2 = setTimeout(() => setStage('wordmark'), 240);
      const t3 = setTimeout(() => setStage('brand'), 380);
      const t4 = setTimeout(() => {
        setStage('exit');
        handleFinish();
      }, 620);

      const fallback = setTimeout(() => handleFinish(), 900);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(fallback);
      };
    }
  }, [handleFinish]);

  // Handle user skip on tap or keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 0.98,
        filter: 'blur(6px)',
        transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } 
      }}
      onClick={handleFinish}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white overflow-hidden select-none cursor-pointer"
      role="dialog"
      aria-label="ANTIQORA System Initialization"
    >
      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* A. Background: Deep obsidian/navy with subtle cyber atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#030712_0%,#020617_60%,#000208_100%)] pointer-events-none" />

      {/* Ambient subtle perspective grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-40" />

      {/* Atmospheric Soft Light Diffusers */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-violet-500/15 blur-[120px] pointer-events-none"
      />

      {/* Subtle Micro-Dust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: '25%', y: '30%', delay: 0 },
          { x: '75%', y: '25%', delay: 0.4 },
          { x: '20%', y: '70%', delay: 0.8 },
          { x: '80%', y: '65%', delay: 0.2 },
          { x: '50%', y: '20%', delay: 0.6 },
          { x: '45%', y: '80%', delay: 1 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
              y: [0, -15, 0]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: pt.delay,
              ease: 'easeInOut'
            }}
            style={{ left: pt.x, top: pt.y }}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/60 shadow-[0_0_8px_#22d3ee]"
          />
        ))}
      </div>

      {/* B. Central Formation Container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-md w-full">

        {/* 1. Singularity Core (Tiny glowing point at inception) */}
        {stage === 'init' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.9] }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center mb-8"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_20px_#22d3ee,0_0_35px_#38bdf8,0_0_50px_#818cf8]" />
            <div className="absolute w-8 h-8 rounded-full border border-cyan-400/40 animate-ping" />
          </motion.div>
        )}

        {/* 2. Thin Futuristic Light Trails */}
        <AnimatePresence>
          {(stage === 'trails' || stage === 'symbol') && (
            <div className="absolute flex items-center justify-center pointer-events-none w-full">
              {/* Horizontal Laser Trail */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 0.9, 0.3] }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-80 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]"
              />

              {/* Vertical Laser Ray */}
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 0.7, 0.2] }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute h-40 w-[1px] bg-gradient-to-b from-transparent via-violet-400 to-transparent shadow-[0_0_10px_#a855f7]"
              />
            </div>
          )}
        </AnimatePresence>

        {/* 3. ANTIQORA Symbol Formation with Subtle 3D Perspective Rotation */}
        {(stage === 'symbol' || stage === 'wordmark' || stage === 'brand' || stage === 'exit') && (
          <motion.div
            initial={{ 
              scale: isFirstVisit ? 0.65 : 0.85, 
              opacity: 0, 
              rotateX: isFirstVisit ? 24 : 10,
              rotateY: isFirstVisit ? -28 : -12,
              filter: isFirstVisit ? 'blur(10px)' : 'blur(4px)'
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotateX: 0,
              rotateY: 0,
              filter: 'blur(0px)'
            }}
            transition={{ 
              duration: isFirstVisit ? 0.75 : 0.32, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            style={{ perspective: 1000 }}
            className="relative flex items-center justify-center mb-6"
          >
            {/* Outer Subtle Quantum Orbital Glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="absolute w-36 h-36 rounded-full border border-cyan-500/20 border-dashed pointer-events-none"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute w-44 h-44 rounded-full border border-indigo-500/15 pointer-events-none"
            />

            {/* Glowing Backdrop Plaque */}
            <div className="relative z-10 p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.28)] flex items-center justify-center">
              <AntiqoraSymbol size={72} />
            </div>
          </motion.div>
        )}

        {/* 4. Brand Reveal: Custom Wordmark & "SEARCH BEYOND LIMITS" */}
        <div className="min-h-[85px] flex flex-col items-center justify-center">
          {(stage === 'wordmark' || stage === 'brand' || stage === 'exit') && (
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)', scale: 0.94 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ 
                duration: isFirstVisit ? 0.55 : 0.28, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="flex flex-col items-center"
            >
              {/* Custom Futuristic Wordmark */}
              <div className="drop-shadow-[0_0_22px_rgba(34,211,238,0.45)]">
                <AntiqoraWordmark width={250} height={35} />
              </div>

              {/* Tagline Reveal (appears ~200-300ms afterward) */}
              {(stage === 'brand' || stage === 'exit') && (
                <motion.p
                  initial={{ opacity: 0, y: 6, letterSpacing: '0.22em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
                  transition={{ 
                    duration: isFirstVisit ? 0.45 : 0.22, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="font-['Orbitron',sans-serif] text-[10px] md:text-[11px] font-semibold uppercase text-cyan-400/90 mt-2.5 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                >
                  Search Beyond Limits
                </motion.p>
              )}
            </motion.div>
          )}
        </div>

        {/* Subtle Glow Pulse Wave on Brand Reveal */}
        {stage === 'brand' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-72 h-72 rounded-full border border-cyan-400/30 blur-sm pointer-events-none"
          />
        )}
      </div>

      {/* Discrete Skip Trigger for User Accessibility */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-500 hover:text-cyan-400 transition-colors opacity-50 hover:opacity-100">
        <span>Click anywhere or press Esc to skip</span>
      </div>
    </motion.div>
  );
};
