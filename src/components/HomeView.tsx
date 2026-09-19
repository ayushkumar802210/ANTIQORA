import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { AnswerDepth } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { 
  Search, 
  Mic, 
  Image as ImageIcon, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Globe2, 
  X,
  Settings,
  Sun,
  Moon,
  Monitor,
  Camera,
  FileText,
  Compass,
  Activity,
  BookOpen,
  GitCompare,
  SlidersHorizontal
} from 'lucide-react';

interface HomeViewProps {
  onSearch: (query: string, tab?: string) => void;
  recentSearches: string[];
  onDeleteRecent: (query: string) => void;
  onClearRecent: () => void;
  onOpenVoice: () => void;
  onOpenVisual?: () => void;
  onOpenDocument?: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light' | 'system';
  onSetTheme: (t: 'dark' | 'light' | 'system') => void;
  depth?: AnswerDepth;
  onSetDepth?: (depth: AnswerDepth) => void;
  currentLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onSearch, 
  recentSearches, 
  onDeleteRecent,
  onClearRecent,
  onOpenVoice,
  onOpenVisual,
  onOpenDocument,
  onOpenSettings,
  theme,
  onSetTheme,
  depth = 'standard',
  onSetDepth,
  currentLanguage = 'en',
  onSelectLanguage
}) => {
  const [query, setQuery] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const trendingTopics = [
    "Quantum Computing",
    "TypeScript 7 Features",
    "Neural Search Engine",
    "Autonomous Energy Grids",
    "Next-Gen WebAssembly"
  ];

  const suggestionDatabase = [
    "Quantum Computing Breakthroughs",
    "Quantum Computing Algorithms",
    "TypeScript 7 Release Notes",
    "Neural Search Engine Architecture",
    "Autonomous Energy Grids 2026",
    "Next-Gen WebAssembly Runtimes",
    "Artificial Intelligence Demo Overview",
    "Solid State Energy Storage",
    "Decentralized Information Retrieval",
    "High-Performance Web Applications"
  ];

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length > 0) {
      const matches = suggestionDatabase.filter(s => 
        s.toLowerCase().includes(trimmed)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImageFile(reader.result as string);
        onSearch(file.name.replace(/\.[^/.]+$/, ""), "images");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchSubmit = (searchQuery: string) => {
    const target = searchQuery.trim();
    if (!target) return;
    setShowSuggestions(false);
    onSearch(target);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6">
      
      {/* Top Controls: Quick Theme & Settings */}
      <div className="w-full max-w-4xl flex items-center justify-end gap-2 mb-4">
        <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-900/80 p-1 border border-slate-300 dark:border-slate-800 text-xs shadow-sm">
          <button
            onClick={() => onSetTheme('light')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              theme === 'light'
                ? 'bg-white text-cyan-600 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            onClick={() => onSetTheme('dark')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              theme === 'dark'
                ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>
          <button
            onClick={() => onSetTheme('system')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="System Preference"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto</span>
          </button>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
          title="Search Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center my-auto">
        
        {/* Futuristic ANTIQORA Logo & Tagline */}
        <div className="mb-8 transform hover:scale-105 transition duration-500 cursor-pointer">
          <Logo size="xl" showTagline={true} />
        </div>

        {/* Search Input Box */}
        <div className="w-full relative group mb-6">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 blur-xl transition duration-500" />
          
          <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 sm:py-4 shadow-xl dark:shadow-2xl">
            <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-3 flex-shrink-0" />
            
            <input
              id="antiqora-main-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(query);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search anything with ANTIQORA... (Press '/' or Ctrl+K)"
              className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              autoFocus
              aria-label="Search query"
            />

            {/* Keyboard Shortcut Hint */}
            <div className="hidden sm:flex items-center gap-1 mr-2 pointer-events-none select-none flex-shrink-0">
              <kbd className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 shadow-xs" title="Press Ctrl+K or ⌘K to focus search">
                {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
              </kbd>
              <span className="text-slate-300 dark:text-slate-600 text-xs">or</span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 shadow-xs" title="Press / to focus search">
                /
              </kbd>
            </div>

            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mr-1"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-1 sm:gap-1.5 ml-2 flex-shrink-0">
              {/* Visual Search Modal Button */}
              {onOpenVisual && (
                <button
                  type="button"
                  onClick={onOpenVisual}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Analyze Visual or Diagram"
                  aria-label="Visual Search"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}

              {/* Document Search Modal Button */}
              {onOpenDocument && (
                <button
                  type="button"
                  onClick={onOpenDocument}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Document & Paper Intelligence"
                  aria-label="Document Intelligence"
                >
                  <FileText className="w-5 h-5" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={onOpenVoice}
                className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Voice Search"
                aria-label="Voice Search"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Search Action Button */}
              <button
                type="button"
                onClick={() => handleSearchSubmit(query)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition flex items-center gap-1.5"
                aria-label="Execute search"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Knowledge Dimensions & Depth Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            {/* 3D Dimension Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">3D Dimension:</span>
              <button
                type="button"
                onClick={() => onSearch(query || 'Quantum Computing', 'timeline')}
                className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-amber-500/60 hover:text-amber-500 transition"
              >
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Past (Timeline)</span>
              </button>
              <button
                type="button"
                onClick={() => onSearch(query || 'Quantum Computing', 'all')}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500/60 hover:text-cyan-500 transition"
              >
                <Activity className="w-3 h-3 text-cyan-500" />
                <span>Present (Live)</span>
              </button>
              <button
                type="button"
                onClick={() => onSearch(query || 'Quantum Computing', 'future')}
                className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-indigo-500/60 hover:text-indigo-400 transition"
              >
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>Future (Scenarios)</span>
              </button>
              <button
                type="button"
                onClick={() => onSearch(query || 'Quantum Computing', 'research')}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition"
              >
                <BookOpen className="w-3 h-3 text-purple-400" />
                <span>Research</span>
              </button>
              <button
                type="button"
                onClick={() => onSearch(query || 'Quantum Computing', 'compare')}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition"
              >
                <GitCompare className="w-3 h-3 text-emerald-400" />
                <span>Compare</span>
              </button>
            </div>

            {/* Depth Selector & Language Switcher */}
            <div className="flex items-center gap-2">
              {onSetDepth && (
                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-900/70 p-0.5 border border-slate-200 dark:border-slate-800 text-[11px]">
                  {(['simple', 'standard', 'detailed', 'expert'] as AnswerDepth[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onSetDepth(d)}
                      className={`capitalize px-2 py-0.5 rounded-md transition ${
                        depth === d
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {onSelectLanguage && (
                <select
                  value={currentLanguage}
                  onChange={(e) => onSelectLanguage(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  title="Interface Language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.code.toUpperCase()} · {l.nativeName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-30 text-left">
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Suggestions
              </div>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setQuery(s);
                    handleSearchSubmit(s);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 transition"
                >
                  <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Image Preview Pill */}
        {selectedImageFile && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-slate-900/80 p-3 shadow-md">
            <img src={selectedImageFile} alt="Upload preview" className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700" />
            <div className="text-left">
              <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Visual Query Mode Active</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Querying image similarity database...</p>
            </div>
            <button 
              onClick={() => setSelectedImageFile(null)} 
              className="ml-auto text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        )}

        {/* Trending Searches Section */}
        <div className="w-full mb-6 text-left">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Trending Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(topic);
                  handleSearchSubmit(topic);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches Section (Click, Delete Individual, Clear All) */}
        {recentSearches.length > 0 && (
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Recent Searches</span>
              </div>
              <button 
                onClick={onClearRecent} 
                className="text-xs text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition"
              >
                Clear all history
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-center rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition shadow-sm"
                >
                  <button
                    onClick={() => {
                      setQuery(item);
                      handleSearchSubmit(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-medium"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecent(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-r-xl transition"
                    title="Remove from history"
                    aria-label={`Remove ${item} from history`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Trust & Architecture Badges */}
      <div className="w-full max-w-2xl mt-8 pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span>Local Privacy (No Tracking)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>API-Ready Architecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>Futuristic Neural Search</span>
        </div>
      </div>

    </div>
  );
};
