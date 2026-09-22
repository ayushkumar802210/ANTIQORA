/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Safety Policy & Legal Enforcement Screen
 */

import React from 'react';
import { ShieldAlert, AlertOctagon, Phone, ExternalLink, LifeBuoy } from 'lucide-react';

interface SafetyBlockedViewProps {
  query: string;
  blockReason?: string;
  helplines?: Array<{ name: string; contact: string; url?: string }>;
  onNewSearch: () => void;
}

export const SafetyBlockedView: React.FC<SafetyBlockedViewProps> = ({
  query,
  blockReason,
  helplines = [],
  onNewSearch,
}) => {
  return (
    <div 
      className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 rounded-3xl border border-rose-500/40 bg-gradient-to-b from-rose-500/10 via-white dark:via-slate-900 to-white dark:to-slate-950 shadow-xl space-y-6"
      id="antiqora-safety-blocked-card"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Zero-Tolerance Legal Safety Policy</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Search Request Blocked
          </h2>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed space-y-2">
        <p className="font-semibold">
          {blockReason || 'ANTIQORA strictly prohibits queries related to minors, child exploitation, non-consensual sexual material, human trafficking, or privacy violations.'}
        </p>
        <p className="text-xs text-rose-700 dark:text-rose-300">
          We actively enforce international and regional safety standards. If you or someone you know requires urgent assistance or wishes to report a crime, please contact one of the verified official helplines below.
        </p>
      </div>

      {helplines.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4 text-cyan-500" />
            <span>Official Support & Reporting Helplines</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {helplines.map((hl, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 space-y-1.5 shadow-xs"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{hl.name}</h4>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{hl.contact}</span>
                </div>
                {hl.url && (
                  <a
                    href={hl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline pt-1"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-start">
        <button
          onClick={onNewSearch}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs transition shadow-sm"
        >
          Return to Safe Search
        </button>
      </div>
    </div>
  );
};
