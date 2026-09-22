/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA 18+ Age Gate & Content Compliance Modal
 */

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Lock, EyeOff } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  query: string;
  onConfirmAdult: (remember: boolean) => void;
  onKeepSafeSearch: () => void;
  onClose: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  query,
  onConfirmAdult,
  onKeepSafeSearch,
  onClose,
}) => {
  const [rememberChoice, setRememberChoice] = useState(true);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      id="antiqora-age-gate-modal"
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-labelledby="age-gate-title"
        aria-modal="true"
      >
        {/* Header Icon & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-1">
                <Lock className="w-3 h-3" />
                <span>18+ Age Verification Required</span>
              </div>
              <h3 id="age-gate-title" className="text-lg sm:text-xl font-bold leading-snug">
                Adult & Sensitive Search Mode
              </h3>
            </div>
          </div>
        </div>

        {/* Content Notice */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Your query <strong className="font-semibold text-slate-900 dark:text-slate-100">"{query}"</strong> may retrieve mature, adult, or intimacy-related web and media results.
          </p>
          
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ANTIQORA Safety & Legal Compliance</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <li>Content involving minors is strictly filtered and prohibited by zero-tolerance protocols.</li>
              <li>Illegal sexual violence, human trafficking, and non-consensual material are actively blocked.</li>
              <li>Private or non-consensual personal media will never be indexed or surfaced.</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            By proceeding, you confirm that you are at least 18 years old and legally permitted to view adult content in your jurisdiction.
          </p>
        </div>

        {/* Remember choice toggle */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="age-gate-remember"
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
          />
          <label htmlFor="age-gate-remember" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            Remember my age verification on this device
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => onConfirmAdult(rememberChoice)}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            id="age-gate-confirm-btn"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I am 18 or older — View Results</span>
          </button>

          <button
            onClick={onKeepSafeSearch}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            id="age-gate-safe-btn"
          >
            <EyeOff className="w-4 h-4" />
            <span>Keep SafeSearch On (Filter 18+)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
