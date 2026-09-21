import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { AnswerDepth, SearchHistoryItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { computeSuggestions } from '../services/suggestionsService';
import { trendingSearchesService } from '../services/trendingSearchesService';
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
  Globe,
  History,
  ExternalLink,
  X,
  Settings,
  Sun,
  Moon,
  Monitor,
  ScanQrCode,
  FileText,
  Compass,
  Activity,
  BookOpen,
  GitCompare,
  Zap,
  Cpu,
  Layers,
  Code2,
  Tv,
  GraduationCap,
  Bot,
  Terminal,
  Share2,
  Check,
  RefreshCw,
  Smartphone,
  Flame
} from 'lucide-react';

interface HomeViewProps {
  onSearch: (query: string, tab?: string) => void;
  recentSearches: string[];
  historyItems?: SearchHistoryItem[];
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
  historyItems,
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
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeDiscoverCategory, setActiveDiscoverCategory] = useState<'all' | 'engineering' | 'ai' | 'trending' | 'tools'>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [usageTick, setUsageTick] = useState(0);

  // Subscribe to usage updates from the trending searches service
  useEffect(() => {
    const unsubscribe = trendingSearchesService.subscribe(() => {
      setUsageTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  // Real-time suggestions calculated from query, recent searches, and server autocomplete
  const suggestions = useMemo(() => {
    return computeSuggestions(query, recentSearches, serverSuggestions);
  }, [query, recentSearches, serverSuggestions]);

  // Top 5 most frequently accessed URLs or search queries derived from search history
  const recentlyVisitedItems = useMemo(() => {
    let allHistory: SearchHistoryItem[] = historyItems && historyItems.length > 0 ? historyItems : [];
    if (allHistory.length === 0) {
      try {
        const saved = localStorage.getItem('antiqora_history_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) allHistory = parsed;
        }
      } catch {}
    }

    const groupedMap = new Map<string, {
      title: string;
      target: string;
      displayDomain: string;
      isUrl: boolean;
      count: number;
      lastVisited: number;
    }>();

    // Group items by normalized target (url or query)
    allHistory.forEach(item => {
      const q = (item.query || '').trim();
      const rawUrl = (item.url || '').trim();
      
      const isActualUrl = Boolean(
        rawUrl && 
        rawUrl !== 'antiqora://newtab' && 
        !rawUrl.startsWith('antiqora://') &&
        (rawUrl.startsWith('http') || rawUrl.includes('.'))
      );

      const target = isActualUrl ? rawUrl : q;
      if (!target) return;

      const normalizedKey = target.toLowerCase();
      const ts = Number(item.timestamp) || Date.now();
      
      let derivedDomain = item.domain || '';
      if (!derivedDomain && isActualUrl) {
        try {
          const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
          derivedDomain = u.hostname.replace(/^www\./, '');
        } catch {
          derivedDomain = rawUrl.split('/')[0];
        }
      } else if (!derivedDomain) {
        derivedDomain = 'Search Query';
      }

      const title = item.title && item.title !== 'New Tab' && item.title !== 'Search' 
        ? item.title 
        : (isActualUrl ? derivedDomain : q);

      const existing = groupedMap.get(normalizedKey);
      if (existing) {
        existing.count += 1;
        if (ts > existing.lastVisited) {
          existing.lastVisited = ts;
          if (title) existing.title = title;
        }
      } else {
        groupedMap.set(normalizedKey, {
          title,
          target,
          displayDomain: derivedDomain,
          isUrl: isActualUrl,
          count: 1,
          lastVisited: ts,
        });
      }
    });

    // Also factor in recentSearches so recent queries are captured
    (recentSearches || []).forEach(r => {
      const q = (r || '').trim();
      if (!q) return;
      const key = q.toLowerCase();
      const existing = groupedMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groupedMap.set(key, {
          title: q,
          target: q,
          displayDomain: 'Search Query',
          isUrl: false,
          count: 1,
          lastVisited: Date.now(),
        });
      }
    });

    // Curated high-tech baseline defaults if history has fewer than 5 items
    const baselineVisits: Array<{
      title: string;
      target: string;
      displayDomain: string;
      isUrl: boolean;
      count: number;
    }> = [
      {
        title: 'Antiqora Quantum Lab',
        target: 'https://antiqora.io/quantum',
        displayDomain: 'antiqora.io',
        isUrl: true,
        count: 14
      },
      {
        title: 'ArXiv AI & Neural Papers',
        target: 'https://arxiv.org/list/cs.AI/recent',
        displayDomain: 'arxiv.org',
        isUrl: true,
        count: 11
      },
      {
        title: 'GitHub Trending Repos',
        target: 'https://github.com/trending',
        displayDomain: 'github.com',
        isUrl: true,
        count: 9
      },
      {
        title: 'Hacker News Tech Frontpage',
        target: 'https://news.ycombinator.com',
        displayDomain: 'ycombinator.com',
        isUrl: true,
        count: 7
      },
      {
        title: 'TypeScript 7 Language Specs',
        target: 'TypeScript 7 Language Specs',
        displayDomain: 'Search Query',
        isUrl: false,
        count: 6
      }
    ];

    if (groupedMap.size < 5) {
      baselineVisits.forEach(seed => {
        const key = seed.target.toLowerCase();
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            title: seed.title,
            target: seed.target,
            displayDomain: seed.displayDomain,
            isUrl: seed.isUrl,
            count: seed.count,
            lastVisited: Date.now() - 3600000 * seed.count,
          });
        }
      });
    }

    const formatTimeAgo = (ts: number): string => {
      const diff = Date.now() - ts;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    };

    return Array.from(groupedMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        target: data.target,
        displayDomain: data.displayDomain,
        isUrl: data.isUrl,
        count: data.count,
        lastVisited: data.lastVisited,
        formattedTime: formatTimeAgo(data.lastVisited),
      }))
      .sort((a, b) => b.count - a.count || b.lastVisited - a.lastVisited)
      .slice(0, 5);
  }, [historyItems, recentSearches, usageTick]);

  // Discover Categories Data
  const discoverCategories = [
    { id: 'all', name: 'All Topics', icon: Compass },
    { id: 'engineering', name: 'Electrical & Power', icon: Zap },
    { id: 'ai', name: 'AI & Quantum', icon: Cpu },
    { id: 'trending', name: 'Trending Now', icon: TrendingUp },
    { id: 'tools', name: 'AI Tools', icon: Bot },
  ] as const;

  const discoverItems = [
    {
      title: "EV Powertrain Inverter Physics",
      category: "engineering",
      description: "SiC MOSFET high-frequency switching & thermal dissipation models.",
      query: "EV Powertrain Inverter Physics SiC MOSFET",
      badge: "Electrical",
      icon: Zap
    },
    {
      title: "Solid-State Battery Electrolytes",
      category: "engineering",
      description: "Sulfide vs Oxide solid electrolyte conductivity benchmarks.",
      query: "Solid-State Battery Electrolytes Sulfide Oxide",
      badge: "Power",
      icon: Activity
    },
    {
      title: "MATLAB Simulink Grid Topologies",
      category: "engineering",
      description: "Microgrid islanding detection and droop control algorithms.",
      query: "MATLAB Simulink Microgrid Droop Control",
      badge: "Simulink",
      icon: Code2
    },
    {
      title: "Quantum Supremacy & Qubit Coherence",
      category: "ai",
      description: "Superconducting vs Ion-trap fidelity and error correction in 2026.",
      query: "Quantum Supremacy Qubit Coherence Error Correction",
      badge: "Quantum",
      icon: Cpu
    },
    {
      title: "TypeScript 7 Type-Level Metaprogramming",
      category: "ai",
      description: "Zero-cost type abstractions and native WebAssembly compilation.",
      query: "TypeScript 7 Type Level Metaprogramming WebAssembly",
      badge: "Language",
      icon: Terminal
    },
    {
      title: "Neural Inverted Index & BM25 Scoring",
      category: "ai",
      description: "Hybrid vector search + lexical Okapi BM25 ranking architecture.",
      query: "Neural Inverted Index BM25 Hybrid Search",
      badge: "Search Engine",
      icon: Layers
    },
    {
      title: "Autonomous Energy Microgrids 2026",
      category: "trending",
      description: "AI-driven peer-to-peer energy trade and load balancing.",
      query: "Autonomous Energy Microgrids P2P Grid",
      badge: "Energy",
      icon: TrendingUp
    },
    {
      title: "SpaceX Starship Telemetry Data",
      category: "trending",
      description: "Raptor engine chamber pressure and thermal protection systems.",
      query: "SpaceX Starship Telemetry Raptor Engine",
      badge: "Aerospace",
      icon: Globe2
    },
    {
      title: "AI Paper Abstract Summarizer",
      category: "tools",
      description: "Synthesize arXiv quantum physics and ML papers into 3D diagrams.",
      query: "AI Paper Abstract Summarizer Quantum Physics",
      badge: "Tool",
      icon: BookOpen
    },
    {
      title: "3D System Dynamics Visualizer",
      category: "tools",
      description: "Interactive timeline & scenario projection engine.",
      query: "3D System Dynamics Visualizer Future Scenarios",
      badge: "Interactive",
      icon: Sparkles
    }
  ];

  // Global Keyboard Shortcuts (Ctrl+K or / to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement !== searchInputRef.current
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Debounced server autocomplete fetch on query change
  useEffect(() => {
    const trimmed = query.trim();
    setSelectedIndex(-1);

    if (!trimmed) {
      setServerSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/autocomplete?q=${encodeURIComponent(trimmed)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.suggestions && Array.isArray(data.suggestions)) {
            setServerSuggestions(data.suggestions);
          }
        })
        .catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (targetQuery: string, overrideTab?: string) => {
    const target = targetQuery.trim();
    if (!target) return;

    // Record in internal usage counter
    trendingSearchesService.recordQueryUsage(target);

    setIsSubmitting(true);
    setShowSuggestions(false);

    // Subtle 200ms submission transition
    setTimeout(() => {
      setIsSubmitting(false);
      onSearch(target, overrideTab || (isAiMode ? 'ai' : 'all'));
    }, 200);
  };

  const handleVisitedItemClick = (item: { target: string; isUrl: boolean }) => {
    if (item.isUrl) {
      onSearch(item.target, 'all');
    } else {
      setQuery(item.target);
      handleSearchSubmit(item.target);
    }
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
      } else if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
      } else if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Tab') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        const target = selectedIndex >= 0 && selectedIndex < suggestions.length
          ? suggestions[selectedIndex].text
          : suggestions[0].text;
        setQuery(target);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex].text;
        setQuery(selected);
        handleSearchSubmit(selected);
      } else {
        handleSearchSubmit(query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const filteredDiscoverItems = activeDiscoverCategory === 'all'
    ? discoverItems
    : discoverItems.filter(item => item.category === activeDiscoverCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-between px-4 py-6 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* Background Subtle Particle & Mesh Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Top Bar: Quick Theme, Mode & Settings */}
      <div className="w-full flex items-center justify-between gap-3 mb-6 sm:mb-8">
        
        {/* Left Status Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 dark:bg-slate-900/60 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">ANTIQORA Online</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition shadow-xs"
            title="Browser Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Center Search Hero Section */}
      <div className="w-full max-w-3xl my-auto flex flex-col items-center text-center">
        
        {/* ANTIQORA Logo with Subtle Hover Glow & Tap Micro-interaction */}
        <motion.div 
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 cursor-pointer select-none"
          onClick={() => {
            setQuery('');
            searchInputRef.current?.focus();
          }}
        >
          <Logo size="xl" showTagline={true} />
        </motion.div>

        {/* AI Search Mode Toggle Bar */}
        <div className="mb-3 flex items-center gap-2 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900/70 border border-slate-300/80 dark:border-slate-800/80 backdrop-blur-md text-xs">
          <button
            type="button"
            onClick={() => setIsAiMode(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition ${
              !isAiMode
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Standard Web</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition ${
              isAiMode
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Mode</span>
          </button>
        </div>

        {/* Central Search Input Card */}
        <div ref={searchContainerRef} className="w-full relative group mb-6 text-left">
          {/* Animated Glow Border Frame */}
          <div 
            className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${
              isAiMode 
                ? 'from-purple-500 via-indigo-500 to-cyan-400 opacity-40 group-hover:opacity-70 blur-xl animate-pulse' 
                : 'from-cyan-500 via-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 blur-xl'
            } transition duration-500`} 
          />

          <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 sm:py-4 shadow-xl dark:shadow-2xl">
            
            {/* Animated Search Icon */}
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 text-cyan-500 animate-spin mr-3 flex-shrink-0" />
            ) : isAiMode ? (
              <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 animate-pulse mr-3 flex-shrink-0" />
            ) : (
              <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-3 flex-shrink-0" />
            )}

            {/* Input Element */}
            <input
              ref={searchInputRef}
              id="antiqora-main-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDownInInput}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                isAiMode
                  ? "Ask ANTIQORA AI anything... (Neural Synthesis Mode)"
                  : "Search anything with ANTIQORA... (Press '/' or Ctrl+K)"
              }
              className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              autoFocus
              aria-label="Search query"
              autoComplete="off"
            />

            {/* Keyboard Shortcut Hint */}
            <div className="hidden sm:flex items-center gap-1 mr-2 pointer-events-none select-none flex-shrink-0">
              <kbd className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 shadow-xs">
                {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </div>

            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setServerSuggestions([]);
                  setShowSuggestions(true);
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mr-1"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Quick Modality Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 ml-2 flex-shrink-0">
              
              {/* Visual Search Modal Button */}
              {onOpenVisual && (
                <button
                  type="button"
                  onClick={onOpenVisual}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Analyze Visual / Camera Input"
                  aria-label="Visual Search"
                >
                  <ScanQrCode className="w-5 h-5" />
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
            </div>
          </div>

          {/* Real-time Search Suggestions Dropdown */}
          <SearchSuggestionsDropdown
            isOpen={showSuggestions}
            query={query}
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onSelectSuggestion={(selectedText) => {
              setQuery(selectedText);
              handleSearchSubmit(selectedText);
            }}
            onFillQuery={(fillText) => {
              setQuery(fillText);
              searchInputRef.current?.focus();
            }}
            onDeleteRecent={onDeleteRecent}
            onClearRecent={onClearRecent}
            onHoverIndex={(idx) => setSelectedIndex(idx)}
            hasRecentSearches={recentSearches.length > 0}
          />
        </div>

        {/* Quick App & Platform Search Chips */}
        <div className="mt-3.5 mb-1.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>Universal App Search:</span>
          </span>
          {[
            { label: 'PhonePe UPI', q: 'phonepe' },
            { label: 'Google Pay', q: 'google pay' },
            { label: 'Zomato Food', q: 'zomato' },
            { label: 'Swiggy', q: 'swiggy' },
            { label: 'Blinkit Grocery', q: 'blinkit' },
            { label: 'Canva Designer', q: 'canva' },
            { label: 'ChatGPT AI', q: 'chatgpt' },
            { label: 'DigiLocker', q: 'digilocker' },
            { label: 'IRCTC Train', q: 'irctc' },
            { label: 'Spotify', q: 'spotify' }
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(chip.q);
                onSearch(chip.q, 'apps');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-[11px] font-medium flex items-center gap-1 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Image Preview Pill */}
        {selectedImageFile && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-slate-900/80 p-3 shadow-md">
            <img src={selectedImageFile} alt="Upload preview" className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700" />
            <div className="text-left">
              <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Visual Query Active</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Querying image similarity index...</p>
            </div>
            <button 
              onClick={() => setSelectedImageFile(null)} 
              className="ml-auto text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        )}

      </div>

      {/* RECENTLY VISITED SECTION (Top 5 Most Frequently Accessed URLs or Search Queries) */}
      {recentlyVisitedItems.length > 0 && (
        <div className="w-full max-w-4xl mt-3 mb-8 text-left">
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <History className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                  Recently Visited
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25">
                  <Activity className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Top 5 Frequency</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              From Browsing History
            </span>
          </div>

          {/* 5 Clickable Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentlyVisitedItems.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVisitedItemClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVisitedItemClick(item);
                  }
                }}
                className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-400/60 dark:hover:border-cyan-500/60 transition-all duration-200 shadow-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.18)] cursor-pointer text-left overflow-hidden outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label={`Recently visited #${idx + 1}: ${item.title}`}
              >
                {/* Subtle futuristic gradient backdrop on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-transparent dark:from-cyan-950/20 dark:via-indigo-950/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  {/* Top Row: Favicon/Icon + Frequency Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:border-cyan-500/40 transition-colors">
                      {item.isUrl ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${item.displayDomain}&sz=64`}
                          alt={item.displayDomain}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                      <Flame className="w-2.5 h-2.5 text-cyan-500 fill-cyan-500/20" />
                      <span>{item.count} {item.count === 1 ? 'visit' : 'visits'}</span>
                    </span>
                  </div>

                  {/* Card Title */}
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>

                  {/* Subtitle / Domain */}
                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    {item.isUrl ? (
                      <>
                        <Globe className="w-2.5 h-2.5 shrink-0 text-cyan-500/70" />
                        <span className="truncate">{item.displayDomain}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                        <span className="truncate">Search Query</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Bottom Row: Last Visited Time + Launch Arrow */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span>{item.formattedTime}</span>
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Launch</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* DISCOVER HUB SECTION */}
      <div className="w-full max-w-4xl mt-6 mb-10 text-left">
        
        {/* Discover Header & Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Compass className="w-4 h-4 text-cyan-500" />
            <span>Discover Knowledge Channels</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {discoverCategories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeDiscoverCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveDiscoverCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-200/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discover Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDiscoverItems.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setQuery(item.query);
                  handleSearchSubmit(item.query);
                }}
                className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/90 hover:border-cyan-500/40 transition cursor-pointer shadow-xs relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                    <ItemIcon className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-500 transition line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                  <span>Explore Topic</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PERSONALIZED & PRIVATE RECENT SEARCHES */}
      {recentSearches.length > 0 && (
        <div className="w-full max-w-4xl mb-8 text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Recent Search History</span>
            </div>
            <button 
              onClick={onClearRecent} 
              className="text-xs text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition"
            >
              Clear history
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 transition shadow-xs"
              >
                <button
                  onClick={() => {
                    setQuery(item);
                    handleSearchSubmit(item);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-medium hover:text-cyan-500 transition"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRecent(item);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-r-xl transition"
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

      {/* TRUST & LOCAL PRIVACY FOOTER BADGES */}
      <div className="w-full max-w-2xl pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span>Local Privacy Guard (Zero External Tracking)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Real-Time Web Search Proxy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>ANTIQORA Neural Search Core</span>
        </div>
      </div>

    </motion.div>
  );
};
