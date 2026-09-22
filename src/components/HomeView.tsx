import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { AnswerDepth, SearchHistoryItem, UserProfile } from '../types';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { computeSuggestions } from '../services/suggestionsService';
import { trendingSearchesService } from '../services/trendingSearchesService';
import { 
  Search, 
  Mic, 
  Camera, 
  Image as ImageIcon,
  Sparkles, 
  TrendingUp, 
  Clock, 
  X, 
  Menu,
  User,
  Newspaper,
  Video,
  CloudSun,
  Wind,
  Droplets,
  ExternalLink,
  ArrowRight,
  ShieldCheck
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
  onOpenAuth?: () => void;
  onOpenMobileMenu?: () => void;
  user?: UserProfile;
  theme: 'dark' | 'light' | 'system';
  onSetTheme: (t: 'dark' | 'light' | 'system') => void;
  depth?: AnswerDepth;
  onSetDepth?: (depth: AnswerDepth) => void;
  currentLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

interface WeatherData {
  city: string;
  temperature: number;
  unit: string;
  condition: string;
  windSpeed: number;
  weatherCode: number;
}

interface TrendingItem {
  id: string;
  query: string;
  isHot?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onSearch, 
  recentSearches, 
  historyItems,
  onDeleteRecent,
  onClearRecent,
  onOpenVoice,
  onOpenVisual,
  onOpenSettings,
  onOpenAuth,
  onOpenMobileMenu,
  user
}) => {
  const [query, setQuery] = useState('');
  const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Real API State (weather, news, trending)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [trendingList, setTrendingList] = useState<TrendingItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Compute autocomplete suggestions dynamically
  const suggestions = useMemo(() => {
    return computeSuggestions(query, recentSearches, serverSuggestions);
  }, [query, recentSearches, serverSuggestions]);

  // Fetch Real Weather Data using GPS Live Location or IP fallback
  const fetchWeather = async (lat?: number, lon?: number) => {
    try {
      setIsLoadingWeather(true);
      const url = lat && lon 
        ? `/api/weather?lat=${lat}&lon=${lon}`
        : `/api/weather`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.available) {
          setWeather({
            city: data.city || 'Live Location',
            temperature: data.temperature ?? 24,
            unit: data.unit || '°C',
            condition: data.condition || 'Clear',
            windSpeed: data.windSpeed ?? 10,
            weatherCode: data.weatherCode ?? 0
          });
        }
      }
    } catch (err) {
      // Silently fail
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleDetectLiveLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingWeather(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchWeather(); // Fallback to IP location
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      fetchWeather();
    }
  };

  useEffect(() => {
    handleDetectLiveLocation();
  }, []);

  // Fetch Real Trending Searches from Backend (Google Trends RSS)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => {
        if (data?.available && Array.isArray(data.trends) && data.trends.length > 0 && isMounted) {
          setTrendingList(data.trends);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Fetch Real Breaking News from Backend
  useEffect(() => {
    let isMounted = true;
    fetch('/api/news?category=all')
      .then(res => res.json())
      .then(data => {
        if (data?.results && Array.isArray(data.results) && data.results.length > 0 && isMounted) {
          setNewsList(data.results.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Keyboard Shortcuts (Ctrl+K or / to focus search box)
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

  // Dismiss suggestions dropdown when clicking outside
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

  // Debounced server autocomplete
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

    trendingSearchesService.recordQueryUsage(target);
    setShowSuggestions(false);
    onSearch(target, overrideTab || 'all');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between px-4 py-4 sm:px-6 md:px-8 max-w-5xl mx-auto text-slate-900 dark:text-slate-100"
    >
      
      {/* 1. TOP BAR */}
      <header className="w-full flex items-center justify-between gap-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60">
        
        {/* Left: Compact Hamburger / Menu + Antiqora Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => { setQuery(''); searchInputRef.current?.focus(); }}
            className="cursor-pointer select-none"
          >
            <Logo size="sm" showTagline={false} />
          </div>
        </div>

        {/* Right: Account / Profile Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs"
            aria-label="Account Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            )}
            <span className="hidden sm:inline font-medium">{user?.name || "Sign In"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-8 sm:py-12 w-full">

        {/* ANTIQORA Logo Hero */}
        <div className="mb-6 text-center select-none">
          <Logo size="xl" showTagline={true} />
        </div>

        {/* 2. MAIN SEARCH AREA */}
        <div ref={searchContainerRef} className="w-full max-w-2xl relative mb-4">
          
          <div className="relative flex items-center rounded-2xl border border-slate-300/90 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-lg dark:shadow-2xl px-4 py-3 sm:py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
            
            {/* Search Icon */}
            <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-3 shrink-0" />

            {/* Input Field */}
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
              placeholder="Search anything..."
              className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              autoFocus
              aria-label="Search anything"
              autoComplete="off"
            />

            {/* Clear Text Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setServerSuggestions([]);
                  setShowSuggestions(true);
                  searchInputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mr-1"
                aria-label="Clear Search Input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Microphone & Lens Icons Inside Search Box */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              
              {/* Voice / Microphone Search Button */}
              <button
                type="button"
                onClick={onOpenVoice}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Search with Voice"
                aria-label="Voice Search"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Visual Search / Lens Button */}
              {onOpenVisual && (
                <button
                  type="button"
                  onClick={onOpenVisual}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Search with Lens (Visual Scanner)"
                  aria-label="Visual Search Lens"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
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

        {/* 3. QUICK SEARCH / DISCOVERY */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => handleSearchSubmit(query || 'AI Overview', 'ai')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Search</span>
          </button>

          <button
            type="button"
            onClick={() => handleSearchSubmit(query || 'High Resolution Images', 'images')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-2xs"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />
            <span>Images</span>
          </button>

          <button
            type="button"
            onClick={() => handleSearchSubmit(query || 'Breaking News', 'news')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-2xs"
          >
            <Newspaper className="w-3.5 h-3.5 text-emerald-500" />
            <span>News</span>
          </button>

          <button
            type="button"
            onClick={() => handleSearchSubmit(query || 'Trending Videos', 'videos')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-2xs"
          >
            <Video className="w-3.5 h-3.5 text-rose-500" />
            <span>Videos</span>
          </button>
        </div>

        {/* 4. OPTIONAL PERSONALIZED DATA SECTIONS (Only shown when real data is available) */}
        
        {/* Real Weather Widget (Shown ONLY if weather data is returned) */}
        {weather && (
          <div className="w-full max-w-2xl mb-6 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <CloudSun className={`w-5 h-5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{weather.city}</p>
                  <button
                    type="button"
                    onClick={handleDetectLiveLocation}
                    title="Update to Live GPS Location"
                    className="p-1 rounded-md text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-slate-500 text-[11px]">{weather.condition}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                  {isLoadingWeather ? '...' : `${weather.temperature}${weather.unit}`}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
                <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-500" /> {weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. RECENT SEARCHES (Shown ONLY if user has search history) */}
        {recentSearches.length > 0 && (
          <div className="w-full max-w-2xl mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Searches</span>
              </span>
              <button
                type="button"
                onClick={onClearRecent}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 transition shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      handleSearchSubmit(item);
                    }}
                    className="px-3 py-1.5 font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecent(item)}
                    className="pr-2 text-slate-400 hover:text-rose-500 transition"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. REAL TRENDING SEARCHES (Shown ONLY when backend data is available) */}
        {trendingList.length > 0 && (
          <div className="w-full max-w-2xl mb-6 text-left">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
              <span>Trending Now</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {trendingList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setQuery(t.query);
                    handleSearchSubmit(t.query);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-2xs flex items-center gap-1.5"
                >
                  <span>{t.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real News Cards (Shown ONLY if backend returns news) */}
        {newsList.length > 0 && (
          <div className="w-full max-w-2xl mt-2 text-left">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              <Newspaper className="w-3.5 h-3.5 text-emerald-500" />
              <span>Top Headlines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {newsList.map((news) => (
                <div
                  key={news.id}
                  onClick={() => handleSearchSubmit(news.title, 'news')}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 hover:border-cyan-500/40 transition cursor-pointer shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{news.source}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">{news.title}</h4>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{news.date}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="w-full py-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
        <span>Antiqora Search • Privacy First Engine</span>
      </footer>

    </motion.div>
  );
};
