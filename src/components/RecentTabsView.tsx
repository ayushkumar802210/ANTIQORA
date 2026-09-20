import React from 'react';
import { ArrowLeft, History, RotateCcw, Trash2, EyeOff, Sparkles } from 'lucide-react';
import { ClosedTab } from '../types';

interface RecentTabsViewProps {
  onBack: () => void;
  closedTabs: ClosedTab[];
  onReopenTab: (tab: ClosedTab) => void;
  onClearRecentTabs: () => void;
}

export const RecentTabsView: React.FC<RecentTabsViewProps> = ({
  onBack,
  closedTabs,
  onReopenTab,
  onClearRecentTabs
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Back to Browser"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browser</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-500" />
              <span>Recently Closed Tabs</span>
            </h1>
          </div>

          {closedTabs.length > 0 && (
            <button
              onClick={onClearRecentTabs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Recent Tabs</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl w-full flex-1 p-4 sm:p-8 space-y-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tabs you recently closed in this session can be reopened here along with their search state.
        </p>

        {closedTabs.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <History className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No recently closed tabs</h3>
            <p className="text-xs text-slate-500">Tabs closed during your browsing session will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {closedTabs.map((ct) => (
              <div 
                key={ct.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm flex items-center justify-between gap-4 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {ct.isIncognito ? (
                      <EyeOff className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {ct.title || 'Untitled Tab'}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {ct.query ? `Search: "${ct.query}"` : 'ANTIQORA Homepage'} · Closed {new Date(ct.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onReopenTab(ct)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition flex-shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
