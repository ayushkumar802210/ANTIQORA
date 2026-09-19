import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
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
  RefreshCw
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
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeDiscoverCategory, setActiveDiscoverCategory] = useState<'all' | 'engineering' | 'ai' | 'trending' | 'tools'>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const suggestionDatabase = [
    "Quantum Computing Breakthroughs",
    "Quantum Computing Algorithms",
    "TypeScript 7 Release Notes",
    "Neural Search Engine Architecture",
    "Autonomous Energy Grids 2026",
    "Next-Gen WebAssembly Runtimes",
    "Electrical Vehicle Inverter Simulation",
    "Solid State Battery Electrolytes",
    "MATLAB Simulink Microgrid Control",
    "Decentralized Information Retrieval",
    "High-Performance Web Applications"
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch or filter dynamic suggestions
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length > 0) {
      // Local fallback + server autocomplete call
      const matches = suggestionDatabase.filter(s => 
        s.toLowerCase().includes(trimmed)
      ).slice(0, 6);

      // Mix with matching recent searches
      const recentMatches = recentSearches.filter(r =>
        r.toLowerCase().includes(trimmed) && !matches.includes(r)
      ).slice(0, 2);

      setSuggestions([...recentMatches, ...matches]);
      setShowSuggestions(true);
      setSelectedIndex(-1);

      // Async fetch server suggestions
      fetch(`/api/autocomplete?q=${encodeURIComponent(trimmed)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            const combined = Array.from(new Set([...recentMatches, ...data.suggestions, ...matches])).slice(0, 7);
            setSuggestions(combined);
          }
        })
        .catch(() => {});
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [query, recentSearches]);

  const handleSearchSubmit = (targetQuery: string, overrideTab?: string) => {
    const target = targetQuery.trim();
    if (!target) return;

    setIsSubmitting(true);
    setShowSuggestions(false);

    // Subtle 200ms submission transition
    setTimeout(() => {
      setIsSubmitting(false);
      onSearch(target, overrideTab || (isAiMode ? 'ai' : 'all'));
    }, 200);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
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
        
        {/* Left Status Pill & PWA Install Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 dark:bg-slate-900/60 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-semibold">ANTIQORA Okapi BM25 Engine</span>
            <span className="sm:hidden font-semibold">ANTIQORA v2.6</span>
          </div>

          <PWAInstallButton variant="pill" />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <div className="flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-900/80 p-1 border border-slate-300/80 dark:border-slate-800 text-xs shadow-xs backdrop-blur-md">
            <button
              onClick={() => onSetTheme('light')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition flex items-center gap-1 ${
                theme === 'light'
                  ? 'bg-white text-cyan-600 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Light Mode"
              aria-label="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => onSetTheme('dark')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-cyan-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              onClick={() => onSetTheme('system')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition flex items-center gap-1 ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="System Mode"
              aria-label="System Mode"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto</span>
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition shadow-xs"
            title="Search & API Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Search Hero Section */}
      <div className="w-full max-w-3xl my-auto flex flex-col items-center text-center">
        
        {/* ANTIQORA Logo with Hover Glow */}
        <motion.div 
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8 cursor-pointer select-none"
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
        <div className="w-full relative group mb-6 text-left">
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
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDownInInput}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder={
                isAiMode
                  ? "Ask ANTIQORA AI anything... (Neural Synthesis Mode)"
                  : "Search anything with ANTIQORA... (Press '/' or Ctrl+K)"
              }
              className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              autoFocus
              aria-label="Search query"
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
                  setSuggestions([]);
                  setShowSuggestions(false);
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

              {/* Execute Search Action Button */}
              <button
                type="button"
                onClick={() => handleSearchSubmit(query)}
                className={`rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-slate-950 transition flex items-center gap-1.5 active:scale-95 ${
                  isAiMode
                    ? 'bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 shadow-md shadow-purple-500/20 hover:brightness-110'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500'
                }`}
                aria-label="Execute search"
              >
                <span>{isAiMode ? 'Ask AI' : 'Search'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Knowledge Dimensions Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">3D Dimension:</span>
              <button
                type="button"
                onClick={() => handleSearchSubmit(query || 'Quantum Computing', 'timeline')}
                className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-amber-500/60 hover:text-amber-500 transition"
              >
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Past (Timeline)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSearchSubmit(query || 'Quantum Computing', 'all')}
                className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-cyan-500/60 hover:text-cyan-500 transition"
              >
                <Activity className="w-3 h-3 text-cyan-500" />
                <span>Present (Live)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSearchSubmit(query || 'Quantum Computing', 'future')}
                className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-indigo-500/60 hover:text-indigo-400 transition"
              >
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>Future (Scenarios)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSearchSubmit(query || 'Quantum Computing', 'research')}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition"
              >
                <BookOpen className="w-3 h-3 text-purple-400" />
                <span>Research</span>
              </button>
              <button
                type="button"
                onClick={() => handleSearchSubmit(query || 'Quantum Computing', 'compare')}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition"
              >
                <GitCompare className="w-3 h-3 text-emerald-400" />
                <span>Compare</span>
              </button>
            </div>

            {/* Depth Selector */}
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
          </div>

          {/* Dynamic Smart Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-30 text-left"
              >
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Smart Query Suggestions</span>
                  <span className="font-mono text-[9px] text-cyan-500">BM25 Predictive</span>
                </div>
                {suggestions.map((s, idx) => {
                  const isRecent = recentSearches.includes(s);
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setQuery(s);
                        handleSearchSubmit(s);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 transition ${
                        isSelected
                          ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-semibold'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isRecent ? (
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                        )}
                        <span>{s}</span>
                      </div>
                      {isRecent && (
                        <span className="text-[10px] text-slate-400 font-mono">Recent</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
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
          <span>Okapi BM25 + Google Search Proxy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>ANTIQORA Neural Search Core</span>
        </div>
      </div>

    </motion.div>
  );
};
