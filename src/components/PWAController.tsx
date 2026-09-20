import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, WifiOff, RefreshCw, X, Check, Globe, Smartphone, Laptop, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAController: React.FC = () => {
  const {
    isOnline,
    updateAvailable,
    showInstalledToast,
    isDismissed,
    dismissPrompt,
    triggerUpdate,
  } = usePWAInstall();

  // Internal PWA prompt state as explicitly requested
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [manualPlatform, setManualPlatform] = useState<'ios' | 'desktop' | 'mobile_android' | 'other'>('other');

  useEffect(() => {
    // 1. Detect standalone mode (already installed)
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };
    checkInstalled();

    // 2. Listen to 'beforeinstallprompt' event and save it to component state
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Detect Apple iOS platforms
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 4. Also listen to appinstalled event to update state and show success feedback
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Expose 'installApp' function to window for the three-dot menu and other buttons
    (window as any).installApp = async () => {
      if (deferredPrompt) {
        try {
          await deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            setIsInstalled(true);
            setDeferredPrompt(null);
          }
        } catch (error) {
          console.error('PWA installation error:', error);
        }
      } else {
        // Expose manual installation instructions for unsupported/non-compatible browsers
        if (isIOSDevice) {
          setManualPlatform('ios');
        } else if (/mobile/i.test(userAgent)) {
          setManualPlatform('mobile_android');
        } else if (/chrome|chromium|edge|opera|brave/i.test(userAgent)) {
          setManualPlatform('desktop');
        } else {
          setManualPlatform('other');
        }
        setShowManualGuide(true);
      }
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  // Local helper to invoke the exposed installApp function
  const triggerInstallFlow = () => {
    if (typeof (window as any).installApp === 'function') {
      (window as any).installApp();
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {/* 1. Offline Mode Indicator */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto bg-amber-500/90 dark:bg-amber-600/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-amber-400/20 text-xs font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <div className="flex flex-col">
                <span className="font-bold tracking-wider">OFFLINE MODE</span>
                <span className="text-[10px] text-amber-50 font-normal">Local features are active. Network features require connectivity.</span>
              </div>
            </div>
            <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
          </motion.div>
        )}

        {/* 2. New Version Update Prompt */}
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto bg-slate-900/95 dark:bg-slate-950/95 border border-cyan-500/20 text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-start gap-2.5">
              <RefreshCw className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs text-slate-100">New ANTIQORA update available.</span>
                <span className="text-[10px] text-slate-400 leading-normal">
                  Upgrade to the latest version for better search performance, smart indexers, and speed enhancements.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end">
              <button
                onClick={triggerUpdate}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition"
              >
                Update now
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. Successful Installation Feedback */}
        {showInstalledToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-400/20 text-xs font-bold"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>ANTIQORA has been installed.</span>
          </motion.div>
        )}

        {/* 4. Ambient PWA Install Prompt (Only shown when not dismissed, not installed, and supported) */}
        {deferredPrompt && !isInstalled && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                  <img src="/pwa-192x192.png" alt="ANTIQORA logo" className="w-7 h-7 object-contain rounded-md" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-xs">Install ANTIQORA App</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    Get standalone access with offline search indexes and optimal CPU performance.
                  </span>
                </div>
              </div>
              <button
                onClick={dismissPrompt}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 self-end">
              <button
                onClick={dismissPrompt}
                className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition"
              >
                Later
              </button>
              <button
                onClick={triggerInstallFlow}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
            </div>
          </motion.div>
        )}

        {/* 5. Fully Integrated Multi-Platform Manual Installation Guide Overlay */}
        {showManualGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 pointer-events-auto backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                {manualPlatform === 'desktop' ? (
                  <Laptop className="w-5 h-5 text-cyan-500" />
                ) : (
                  <Smartphone className="w-5 h-5 text-cyan-500" />
                )}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {manualPlatform === 'ios' && 'Install on iPhone / iPad'}
                  {manualPlatform === 'desktop' && 'Install on Desktop Browser'}
                  {manualPlatform === 'mobile_android' && 'Install on Android Device'}
                  {manualPlatform === 'other' && 'How to Install ANTIQORA'}
                </h3>
              </div>
              
              <div className="space-y-3 text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed text-[11px]">
                  Your browser does not support automated one-click installation prompts. Please follow these simple manual steps to add ANTIQORA:
                </p>

                {manualPlatform === 'ios' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <p className="leading-normal">
                        Tap the <strong className="text-slate-900 dark:text-white font-bold">Share</strong> button in your Safari navigation panel (the square icon with an arrow pointing up).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <p className="leading-normal">
                        Scroll down the options list and select <strong className="text-slate-900 dark:text-white font-bold">Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {manualPlatform === 'desktop' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <p className="leading-normal">
                        Look at the right-side of your browser's search bar (omnibox) at the top of this window.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <p className="leading-normal">
                        Click the <strong className="text-slate-900 dark:text-white font-bold">Install</strong> icon (usually represented by an icon of a monitor with a downward arrow, or overlapping blocks with a "+").
                      </p>
                    </div>
                  </div>
                )}

                {manualPlatform === 'mobile_android' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <p className="leading-normal">
                        Tap the browser's menu options (three vertical dots <strong className="text-slate-900 dark:text-white font-bold">⋮</strong> in the top-right corner).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <p className="leading-normal">
                        Tap <strong className="text-slate-900 dark:text-white font-bold">Install app</strong> or <strong className="text-slate-900 dark:text-white font-bold">Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {manualPlatform === 'other' && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                      <p className="leading-normal">
                        Open your browser's options menu (settings, menu bar, or share buttons).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                      <p className="leading-normal">
                        Select <strong className="text-slate-900 dark:text-white font-bold">Add to Home Screen</strong> or <strong className="text-slate-900 dark:text-white font-bold">Install</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowManualGuide(false)}
                className="mt-2 w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 py-2.5 text-xs font-bold text-white dark:text-slate-950 transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
