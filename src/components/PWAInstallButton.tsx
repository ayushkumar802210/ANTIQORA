import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, Share2, PlusSquare, Sparkles, X, Globe, Copy } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'full' | 'compact' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 3000);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'pill' ? (
        <button
          onClick={handleInstallClick}
          type="button"
          className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-700 dark:text-cyan-300 font-semibold text-xs transition shadow-sm hover:shadow-cyan-500/20 ${className}`}
          title="Install Antiqora App on Mobile/Desktop"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <Download className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Install App</span>
        </button>
      ) : variant === 'full' ? (
        <button
          onClick={handleInstallClick}
          type="button"
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-[0.98] ${className}`}
        >
          {installedSuccess ? (
            <>
              <Check className="w-5 h-5 text-emerald-950" />
              <span>App Installed Successfully!</span>
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              <span>Install Antiqora App</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition shadow-xs ${className}`}
          title="Install Antiqora as Phone App"
        >
          <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {showGuideModal && <PWAGuideModal isIOS={isIOS} onClose={() => setShowGuideModal(false)} />}
    </>
  );
};

export const PWABottomBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('antiqora_pwa_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('antiqora_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        handleDismiss();
      }
    } else {
      setShowModal(true);
    }
  };

  const copyAppUrl = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[90] p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-white shadow-2xl backdrop-blur-xl animate-fadeIn flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 font-black shadow-md flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Install Antiqora App</h4>
              <p className="text-[11px] text-cyan-300/80">Add to Phone Home Screen for Full App Experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:brightness-110 text-slate-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Install Now</span>
          </button>

          <button
            type="button"
            onClick={copyAppUrl}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-1"
            title="Copy App Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Link'}</span>
          </button>
        </div>
      </div>

      {showModal && <PWAGuideModal isIOS={isIOS} onClose={() => setShowModal(false)} />}
    </>
  );
};

const PWAGuideModal: React.FC<{ isIOS: boolean; onClose: () => void }> = ({ isIOS, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyAppUrl = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-left">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Install Antiqora App</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mobile Installation Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-cyan-600 dark:text-cyan-400">iPhone / iPad Safari Instructions:</p>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <Share2 className="w-4 h-4" />
              </div>
              <span>1. Open link in <strong>Safari</strong> & tap <strong>Share</strong>.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <PlusSquare className="w-4 h-4" />
              </div>
              <span>2. Tap <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-cyan-600 dark:text-cyan-400">Android / Chrome Instructions:</p>
            <p>1. Make sure you open the link in <strong>Google Chrome</strong> (not inside WhatsApp or Instagram browser).</p>
            <p>2. Tap the top three dots menu (<strong>⋮</strong>).</p>
            <p>3. Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Copy this link to open in Chrome or Safari:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono border border-slate-300 dark:border-slate-700 select-all"
            />
            <button
              onClick={copyAppUrl}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex-shrink-0 flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
