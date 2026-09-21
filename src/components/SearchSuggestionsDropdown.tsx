import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  X, 
  CornerUpLeft, 
  ArrowRight, 
  Trash2 
} from 'lucide-react';
import { SuggestionItem, getHighlightedSegments } from '../services/suggestionsService';

interface SearchSuggestionsDropdownProps {
  isOpen: boolean;
  query: string;
  suggestions: SuggestionItem[];
  selectedIndex: number;
  onSelectSuggestion: (text: string) => void;
  onFillQuery: (text: string) => void;
  onDeleteRecent?: (text: string) => void;
  onClearRecent?: () => void;
  onHoverIndex: (index: number) => void;
  hasRecentSearches?: boolean;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  isOpen,
  query,
  suggestions,
  selectedIndex,
  onSelectSuggestion,
  onFillQuery,
  onDeleteRecent,
  onClearRecent,
  onHoverIndex,
  hasRecentSearches = false,
}) => {
  if (!isOpen || suggestions.length === 0) return null;

  const isQueryEmpty = query.trim().length === 0;

  // Split into recent and popular when query is empty for distinct section headers
  const recentItems = isQueryEmpty ? suggestions.filter(s => s.isRecent) : [];
  const popularItems = isQueryEmpty ? suggestions.filter(s => !s.isRecent) : [];

  return (
    <AnimatePresence>
      <motion.div
        id="antiqora-search-suggestions-dropdown"
        initial={{ opacity: 0, y: -6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.99 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-40 text-left divide-y divide-slate-100 dark:divide-slate-800/60"
        role="listbox"
        aria-label="Search suggestions"
      >
        {/* Header indicator */}
        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            {isQueryEmpty ? (
              <>
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>Quick Navigation & Recent</span>
              </>
            ) : (
              <>
                <Search className="w-3 h-3 text-cyan-500" />
                <span>Real-Time Suggestions</span>
              </>
            )}
          </div>
          {isQueryEmpty && hasRecentSearches && onClearRecent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearRecent();
              }}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
              title="Clear all recent searches"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
          {!isQueryEmpty && (
            <span className="font-mono text-[9px] text-cyan-500 dark:text-cyan-400">
              Live Index
            </span>
          )}
        </div>

        {/* Suggestions List */}
        <div className="max-h-[380px] overflow-y-auto py-1 divide-y divide-slate-100/60 dark:divide-slate-800/40">
          {/* Section: Recent Searches Header (if query is empty and has recent) */}
          {isQueryEmpty && recentItems.length > 0 && (
            <div className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Recent Searches</span>
            </div>
          )}

          {/* Render Items */}
          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const segments = getHighlightedSegments(item.text, query);

            // If query is empty and this is the first non-recent item, show the Popular header
            const showPopularHeader = isQueryEmpty && idx === recentItems.length && popularItems.length > 0;

            return (
              <React.Fragment key={item.id || idx}>
                {showPopularHeader && (
                  <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60">
                    <TrendingUp className="w-3 h-3 text-cyan-500" />
                    <span>Popular & Trending Queries</span>
                  </div>
                )}

                <div
                  id={`suggestion-item-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => onHoverIndex(idx)}
                  onClick={() => onSelectSuggestion(item.text)}
                  className={`group relative flex items-center justify-between px-4 py-2.5 sm:py-3 cursor-pointer text-sm transition select-none ${
                    isSelected
                      ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 border-l-3 border-cyan-500 pl-3.5'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border-l-3 border-transparent'
                  }`}
                >
                  {/* Left: Icon and Formatted Text */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <div className="flex-shrink-0">
                      {item.isRecent ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : item.type === 'trending' ? (
                        <TrendingUp className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      ) : item.type === 'popular' ? (
                        <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                      ) : (
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500 transition" />
                      )}
                    </div>

                    <div className="truncate text-left leading-tight">
                      {segments.map((seg, sIdx) => (
                        <span
                          key={sIdx}
                          className={
                            seg.isMatch
                              ? 'font-bold text-cyan-600 dark:text-cyan-400 underline decoration-cyan-500/30'
                              : 'font-normal'
                          }
                        >
                          {seg.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Badges & Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Category Tag */}
                    {item.category && (
                      <span
                        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono transition ${
                          item.isRecent
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : item.type === 'trending'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        {item.category}
                      </span>
                    )}

                    {/* Quick fill / insert button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFillQuery(item.text);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Insert query into search box without searching"
                      aria-label={`Insert ${item.text}`}
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete recent button */}
                    {item.isRecent && onDeleteRecent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecent(item.text);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Remove from search history"
                        aria-label={`Remove ${item.text} from history`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Go arrow indicator */}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition hidden sm:block" />
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer Navigation Tip */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-slate-50/70 dark:bg-slate-950/60 text-[10px] text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[9px] shadow-xs">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[9px] shadow-xs">
              ↓
            </kbd>
            <span>to navigate</span>
            <span>•</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[9px] shadow-xs">
              Tab
            </kbd>
            <span>to complete</span>
            <span>•</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[9px] shadow-xs">
              ↵
            </kbd>
            <span>to search</span>
          </div>
          <span className="font-mono text-[9px] text-cyan-600 dark:text-cyan-400">
            Esc to close
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
