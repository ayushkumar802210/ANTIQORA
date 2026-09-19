import React, { useState } from 'react';
import { getRoadmapPhases } from '../services/appWebsitesSearch';
import { 
  X, 
  Milestone, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  Search, 
  Cpu, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose }) => {
  const [activePhase, setActivePhase] = useState<number>(2); // Default to Phase 2 (In Progress)
  const phases = getRoadmapPhases();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Milestone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ANTIQORA Engineering Roadmap</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  Phases 1–3
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Strategic evolution from multi-temporal synthesis to real web, apps discovery and world modeling.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Close roadmap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-2 gap-2">
          {phases.map((p) => {
            const isSelected = activePhase === p.phase;
            const isCompleted = p.status === 'completed';
            const isInProgress = p.status === 'in_progress';

            return (
              <button
                key={p.phase}
                onClick={() => setActivePhase(p.phase)}
                className={`flex flex-col items-start p-3 rounded-2xl transition border text-left ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-cyan-500/60 shadow-sm ring-1 ring-cyan-500/20'
                    : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-900/40 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
                  }`}>
                    Phase {p.phase}
                  </span>
                  
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                      <Clock className="w-3 h-3" /> Active
                    </span>
                  )}
                  {!isCompleted && !isInProgress && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      <Sparkles className="w-3 h-3" /> Future
                    </span>
                  )}
                </div>

                <p className={`text-xs font-bold line-clamp-1 ${
                  isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {p.title.split(':')[1] || p.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Phase Details Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(() => {
            const current = phases.find(p => p.phase === activePhase) || phases[1];
            return (
              <div className="space-y-6">
                
                {/* Header Banner */}
                <div className={`rounded-3xl p-6 border ${
                  current.status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : current.status === 'in_progress'
                    ? 'bg-cyan-500/5 border-cyan-500/30'
                    : 'bg-indigo-500/5 border-indigo-500/30'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                      current.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : current.status === 'in_progress'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                    }`}>
                      {current.status === 'completed' ? 'Completed & Deployed' : current.status === 'in_progress' ? 'Current Active Milestone' : 'Planned Capability'}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      Phase {current.phase} of 3
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {current.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {current.subtitle}
                  </p>
                </div>

                {/* Focus Callout for Phase 2 */}
                {current.phase === 2 && (
                  <div className="rounded-2xl border border-cyan-500/30 bg-slate-50 dark:bg-slate-950/60 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      <Globe className="w-4 h-4" />
                      <span>Phase 2 Architecture: The Global Discovery Engine</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      ANTIQORA transforms from a conceptual knowledge synthesizer into a universal index for all publicly available apps, websites, platforms, and online services. 
                      Official domains are verified with cryptographic certificates, App Store and Google Play packages are accurately linked, and unverified or typo-squatting domains are flagged to protect users from fake sites.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="font-bold block text-slate-900 dark:text-white">Verified Domains</span>
                        <span className="text-[11px] text-slate-400">Zero tolerance for fabricated URLs</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                        <Smartphone className="w-4 h-4 text-indigo-400 mb-1" />
                        <span className="font-bold block text-slate-900 dark:text-white">App Store & Play</span>
                        <span className="text-[11px] text-slate-400">Official package ID identification</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                        <Globe className="w-4 h-4 text-cyan-500 mb-1" />
                        <span className="font-bold block text-slate-900 dark:text-white">Deep Destinations</span>
                        <span className="text-[11px] text-slate-400">Instant login, help & console links</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deliverables Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Key Deliverables & Functional Modules
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {current.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70"
                      >
                        {current.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : current.status === 'in_progress' ? (
                          <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            ANTIQORA Core • Continuous Autonomous Delivery
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};
