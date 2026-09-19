import React, { useEffect, useState } from 'react';
import { Download, Sparkles, Smartphone, X, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowUnsupportedModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-sm"
        title="Install ANTIQORA PWA"
        aria-label="Install App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
                <Smartphone className="w-5 h-5" />
                <span>Install ANTIQORA on iOS</span>
              </div>
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Install ANTIQORA as a standalone app on your Apple iOS home screen:
            </p>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
              <li>Scroll down the options list.</li>
              <li>Select <strong>Add to Home Screen</strong> (+).</li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Unsupported Environment / Manual Guide Modal */}
      {showUnsupportedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
                <Info className="w-5 h-5" />
                <span>PWA Installation Notice</span>
              </div>
              <button 
                onClick={() => setShowUnsupportedModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Automated PWA install prompts are not available in this browser session or embedded frame.
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To install ANTIQORA as an application:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <li>Open the app in a dedicated Chrome, Edge, or Brave window.</li>
              <li>Click the <strong>Install</strong> icon in the right side of the address bar.</li>
              <li>Or select <strong>Install ANTIQORA</strong> from the browser menu (⋮).</li>
            </ul>
            <button
              onClick={() => setShowUnsupportedModal(false)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
