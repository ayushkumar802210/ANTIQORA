import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface DeleteBrowsingDataViewProps {
  onBack: () => void;
  onConfirmDelete: (options: {
    timeRange: string;
    history: boolean;
    searchHistory: boolean;
    cookies: boolean;
    cache: boolean;
    downloads: boolean;
  }) => void;
}

export const DeleteBrowsingDataView: React.FC<DeleteBrowsingDataViewProps> = ({
  onBack,
  onConfirmDelete
}) => {
  const [timeRange, setTimeRange] = useState<string>('all');
  const [history, setHistory] = useState(true);
  const [searchHistory, setSearchHistory] = useState(true);
  const [cookies, setCookies] = useState(true);
  const [cache, setCache] = useState(true);
  const [downloads, setDownloads] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExecute = () => {
    onConfirmDelete({
      timeRange,
      history,
      searchHistory,
      cookies,
      cache,
      downloads
    });
    setShowConfirmModal(false);
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
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
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Delete Browsing Data</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-2xl w-full flex-1 p-4 sm:p-8 space-y-6">
        
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-6 shadow-sm">
          
          {/* Time Range Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="4w">Last 4 weeks</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Types to Delete</label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={history}
                onChange={(e) => setHistory(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Browsing history</div>
                <div className="text-[11px] text-slate-400">Clears page history entries across tabs.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={searchHistory}
                onChange={(e) => setSearchHistory(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Search history & queries</div>
                <div className="text-[11px] text-slate-400">Clears recent query suggestions and search logs.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cookies}
                onChange={(e) => setCookies(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Cookies & site data</div>
                <div className="text-[11px] text-slate-400">Clears local storage preferences and session tokens.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cache}
                onChange={(e) => setCache(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Cached images & files</div>
                <div className="text-[11px] text-slate-400">Frees local cache memory.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={downloads}
                onChange={(e) => setDownloads(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Downloads list history</div>
                <div className="text-[11px] text-slate-400">Clears download activity logs (does not delete real files from your filesystem).</div>
              </div>
            </label>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition shadow-md"
            >
              Delete Selected Data
            </button>
          </div>

        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Data Deletion</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete selected browsing data for <strong className="text-slate-800 dark:text-slate-200">{timeRange === 'all' ? 'All time' : timeRange}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
