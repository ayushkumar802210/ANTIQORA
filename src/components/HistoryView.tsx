import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  EyeOff, 
  Globe, 
  AlertTriangle 
} from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface HistoryViewProps {
  onBack: () => void;
  historyItems: SearchHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onOpenQuery: (query: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onBack,
  historyItems,
  onDeleteHistoryItem,
  onClearAllHistory,
  onOpenQuery
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter items
  const filteredHistory = useMemo(() => {
    if (!searchFilter.trim()) return historyItems;
    const q = searchFilter.toLowerCase();
    return historyItems.filter(item => 
      item.query.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.domain && item.domain.toLowerCase().includes(q))
    );
  }, [historyItems, searchFilter]);

  // Group by Today, Yesterday, Earlier
  const groupedHistory = useMemo(() => {
    const today: SearchHistoryItem[] = [];
    const yesterday: SearchHistoryItem[] = [];
    const earlier: SearchHistoryItem[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const yesterdayStr = yest.toDateString();

    filteredHistory.forEach(item => {
      const itemDate = new Date(item.timestamp || Date.now());
      const dateStr = itemDate.toDateString();

      if (dateStr === todayStr) {
        today.push(item);
      } else if (dateStr === yesterdayStr) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredHistory]);

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
              <Clock className="w-5 h-5 text-cyan-500" />
              <span>History</span>
            </h1>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear all history</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl w-full flex-1 p-4 sm:p-8 space-y-6">
        
        {/* Incognito Notice & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search history..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400 font-medium">
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <span>Incognito searches are never saved in history</span>
          </div>
        </div>

        {/* History Lists */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No history entries found</h3>
            <p className="text-xs text-slate-500">Your search and browsing history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TODAY */}
            {groupedHistory.today.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">Today</h2>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm overflow-hidden">
                  {groupedHistory.today.map((item) => (
                    <HistoryRow 
                      key={item.id} 
                      item={item} 
                      onOpen={() => onOpenQuery(item.query)} 
                      onDelete={() => onDeleteHistoryItem(item.id)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* YESTERDAY */}
            {groupedHistory.yesterday.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">Yesterday</h2>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm overflow-hidden">
                  {groupedHistory.yesterday.map((item) => (
                    <HistoryRow 
                      key={item.id} 
                      item={item} 
                      onOpen={() => onOpenQuery(item.query)} 
                      onDelete={() => onDeleteHistoryItem(item.id)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* EARLIER */}
            {groupedHistory.earlier.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">Earlier</h2>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm overflow-hidden">
                  {groupedHistory.earlier.map((item) => (
                    <HistoryRow 
                      key={item.id} 
                      item={item} 
                      onOpen={() => onOpenQuery(item.query)} 
                      onDelete={() => onDeleteHistoryItem(item.id)} 
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear entire history?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will permanently delete all search and browsing history entries from this device.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryRow: React.FC<{ item: SearchHistoryItem; onOpen: () => void; onDelete: () => void }> = ({
  item,
  onOpen,
  onDelete
}) => {
  const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
      <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
          <Globe className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-cyan-500 transition">
            {item.title || item.query}
          </div>
          <div className="text-[11px] text-slate-400 truncate flex items-center gap-2">
            <span>{item.domain || 'antiqora.io'}</span>
            <span>·</span>
            <span>{item.query}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2">
        <span className="text-[10px] text-slate-400 font-mono">{timeStr}</span>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
          title="Delete entry"
          aria-label="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
