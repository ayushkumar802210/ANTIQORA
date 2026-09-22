import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Logo } from './Logo';
import { ThreeDotMenu } from './ThreeDotMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { computeSuggestions } from '../services/suggestionsService';
import { TabType, UserProfile, FullPageView } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { 
  Search, 
  Image as ImageIcon, 
  Newspaper, 
  Video, 
  MapPin, 
  Navigation,
  ShoppingBag, 
  Sparkles, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Mic,
  Clock,
  Compass,
  BookOpen,
  GitCompare,
  Languages,
  Camera,
  FileText,
  Globe,
  Smartphone,
  Milestone,
  Cpu,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  MoreVertical,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Code
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenRoadmap?: () => void;
  onOpenCrawlerAdmin?: () => void;
  user: UserProfile;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  showSearchBar?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onExecuteSearch?: (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => void;
  onVoiceSearch?: () => void;
  onOpenVisual?: () => void;
  onOpenDocument?: () => void;
  currentLanguage?: string;
  onSelectLanguage?: (code: string) => void;
  recentSearches?: string[];
  onDeleteRecent?: (query: string) => void;
  onClearRecent?: () => void;

  // Browser Navigation & Three-Dot Controls
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onReload?: () => void;
  onGoHome?: () => void;
  isIncognito?: boolean;
  onNewTab: (isIncognito?: boolean) => void;
  onAddTabToNewGroup: () => void;
  onOpenAIMode: () => void;
  onOpenGitHub: () => void;
  onNavigateFullPage: (view: FullPageView) => void;
  tabCount?: number;
  incognitoCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenSettings,
  onOpenRoadmap,
  onOpenCrawlerAdmin,
  user,
  theme,
  onToggleTheme,
  showSearchBar = false,
  searchQuery = '',
  onSearchChange,
  onExecuteSearch,
  onVoiceSearch,
  onOpenVisual,
  onOpenDocument,
  currentLanguage = 'en',
  onSelectLanguage,
  recentSearches = [],
  onDeleteRecent,
  onClearRecent,

  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  isIncognito = false,
  onNewTab,
  onAddTabToNewGroup,
  onOpenAIMode,
  onOpenGitHub,
  onNavigateFullPage,
  tabCount = 1,
  incognitoCount = 0
}) => {
  const [isThreeDotOpen, setIsThreeDotOpen] = useState(false);
  const [geoPermission, setGeoPermission] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('prompt');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [isLocatingFromHeader, setIsLocatingFromHeader] = useState(false);
  const [isReloadSpinning, setIsReloadSpinning] = useState(false);

  // Autocomplete Suggestions State for Navbar
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute dynamic autocomplete suggestions (matching past queries from recentSearches first)
  const suggestions = useMemo(() => {
    return computeSuggestions(searchQuery, recentSearches, serverSuggestions);
  }, [searchQuery, recentSearches, serverSuggestions]);

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

  // Debounced server autocomplete for Navbar search
  useEffect(() => {
    const trimmed = searchQuery.trim();
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
  }, [searchQuery]);

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
        onSearchChange?.(selected);
        setShowSuggestions(false);
        setTimeout(() => {
          onExecuteSearch?.(e);
        }, 0);
      } else {
        setShowSuggestions(false);
        onExecuteSearch?.(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const handleReloadClick = () => {
    setIsReloadSpinning(true);
    setTimeout(() => setIsReloadSpinning(false), 750);
    if (onReload) {
      onReload();
    }
  };

  // Check Geolocation permission state
  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const checkPermission = async () => {
      if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          permissionStatus = status;
          setGeoPermission(status.state as 'granted' | 'prompt' | 'denied');
          status.onchange = () => {
            setGeoPermission(status.state as 'granted' | 'prompt' | 'denied');
          };
        } catch (e) {
          // If query not supported, fallback gracefully
        }
      }
    };

    checkPermission();

    const handleGeoEvent = (e: any) => {
      if (e.detail?.state) {
        setGeoPermission(e.detail.state);
      }
    };

    window.addEventListener('antiqora:geolocation-updated', handleGeoEvent);
    return () => {
      window.removeEventListener('antiqora:geolocation-updated', handleGeoEvent);
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  // Request location directly from header button
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingFromHeader(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingFromHeader(false);
        setGeoPermission('granted');
        setShowPermissionHelp(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('antiqora:geolocation-updated', {
              detail: { state: 'granted', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }
            })
          );
        }
      },
      (err) => {
        setIsLocatingFromHeader(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoPermission('denied');
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('antiqora:geolocation-updated', {
              detail: { state: err.code === err.PERMISSION_DENIED ? 'denied' : 'prompt' }
            })
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'websites', label: 'Websites', icon: Globe },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'social', label: 'Social', icon: Share2 },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'location', label: 'Live Location', icon: Navigation },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'github', label: 'GitHub', icon: Code },
  ] as const;

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${
      isIncognito 
        ? 'border-purple-900/60 bg-purple-950/90 text-purple-100 backdrop-blur-xl' 
        : 'border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 gap-2 sm:gap-3">
        
        {/* Left: Browser Nav Controls & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={onGoBack}
              disabled={!canGoBack}
              className={`p-1.5 rounded-xl transition ${
                canGoBack
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onGoForward}
              disabled={!canGoForward}
              className={`p-1.5 rounded-xl transition ${
                canGoForward
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
              title="Forward"
              aria-label="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReloadClick}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="Reload page"
              aria-label="Reload page"
            >
              <RotateCcw className={`w-4 h-4 transition-transform ${isReloadSpinning ? 'animate-spin text-cyan-500' : ''}`} />
            </button>

            <button
              onClick={onGoHome}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Home"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block flex-shrink-0" />

          {/* Logo */}
          <Logo size="sm" onClick={() => onSelectTab('home')} />

          {/* Incognito Badge Header if active */}
          {isIncognito && (
            <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex-shrink-0">
              <EyeOff className="w-3.5 h-3.5" /> Incognito
            </span>
          )}

          {/* Intelligent Search/Address Bar with Autocomplete */}
          {showSearchBar && (
            <div ref={searchContainerRef} className="flex items-center flex-1 max-w-xl relative">
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  id="antiqora-navbar-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange?.(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDownInInput}
                  placeholder="Search query, URL, or ask AI..."
                  className={`w-full rounded-xl border px-3.5 py-1.5 pl-9 pr-20 sm:pr-36 text-xs sm:text-sm shadow-sm transition ${
                    isIncognito
                      ? 'border-purple-800/80 bg-purple-900/50 text-white placeholder-purple-300/60 focus:border-purple-400 focus:ring-1 focus:ring-purple-400'
                      : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                  aria-label="Address and Search Bar"
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                
                {/* Keyboard Shortcut Hint */}
                <div className="hidden lg:flex items-center gap-1 absolute right-24 top-1.5 pointer-events-none select-none">
                  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
                  </kbd>
                </div>

                <div className="absolute right-1 top-1 flex items-center gap-0.5 sm:gap-1">
                  {onOpenVisual && (
                    <button
                      onClick={onOpenVisual}
                      className="hidden sm:inline-flex p-1 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                      title="Visual Search"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onVoiceSearch && (
                    <button
                      onClick={onVoiceSearch}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                      title="Voice Search"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowSuggestions(false);
                      onExecuteSearch?.(e);
                    }}
                    className="rounded-lg bg-cyan-500 px-2.5 py-0.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Real-time Autocomplete Suggestions Dropdown for Navbar */}
              <SearchSuggestionsDropdown
                isOpen={showSuggestions}
                query={searchQuery}
                suggestions={suggestions}
                selectedIndex={selectedIndex}
                onSelectSuggestion={(selectedText) => {
                  onSearchChange?.(selectedText);
                  setShowSuggestions(false);
                  setTimeout(() => {
                    onExecuteSearch?.();
                  }, 0);
                }}
                onFillQuery={(fillText) => {
                  onSearchChange?.(fillText);
                  searchInputRef.current?.focus();
                }}
                onDeleteRecent={onDeleteRecent}
                onClearRecent={onClearRecent}
                onHoverIndex={(idx) => setSelectedIndex(idx)}
                hasRecentSearches={recentSearches.length > 0}
              />
            </div>
          )}
        </div>

        {/* Right Actions: Geolocation Status, PWA, Account, Three-Dot Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* LocationView Header Visual Indicator */}
          {currentTab === 'location' && (
            <div className="flex items-center animate-in fade-in duration-200">
              {geoPermission === 'granted' ? (
                <div 
                  id="antiqora-geo-status-indicator"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-2xs select-none"
                  title="Geolocation permission is active & enabled for ANTIQORA"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden md:inline font-semibold">Location enabled for ANTIQORA</span>
                  <span className="md:hidden font-semibold">Location ON</span>
                </div>
              ) : geoPermission === 'denied' ? (
                <div className="relative">
                  <button
                    id="antiqora-geo-blocked-btn"
                    onClick={() => setShowPermissionHelp(!showPermissionHelp)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition cursor-pointer select-none"
                    title="Location permission is blocked in your browser. Click for help."
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Location Blocked</span>
                    <span className="sm:hidden">Blocked</span>
                  </button>

                  {showPermissionHelp && (
                    <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-cyan-500" />
                          Enable Geolocation
                        </span>
                        <button
                          onClick={() => setShowPermissionHelp(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Click the lock/settings icon in your browser address bar, set <strong>Location</strong> to <strong>Allow</strong>, and retry.
                      </p>
                      <button
                        onClick={handleRequestLocation}
                        className="mt-2.5 w-full py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Retry Permission
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="antiqora-geo-grant-btn"
                  onClick={handleRequestLocation}
                  disabled={isLocatingFromHeader}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold transition shadow-xs animate-pulse select-none cursor-pointer"
                  title="Click to grant location access for ANTIQORA"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isLocatingFromHeader ? 'Requesting...' : 'Grant Access'}</span>
                </button>
              )}
            </div>
          )}
          
          {/* Persistent Language Switcher */}
          {onSelectLanguage && (
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onSelectLanguage={onSelectLanguage}
            />
          )}

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            aria-label="User Account"
          >
            {user.isLoggedIn && user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-cyan-500/60" />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            )}
            <span className="hidden sm:inline">{user.isLoggedIn ? user.name : 'Account'}</span>
          </button>

          {/* THREE-DOT MENU BUTTON */}
          <div className="relative">
            <button
              onClick={() => setIsThreeDotOpen(!isThreeDotOpen)}
              className={`p-1.5 rounded-xl border transition shadow-sm ${
                isThreeDotOpen
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:text-cyan-500'
              }`}
              title="Browser Menu (⋮)"
              aria-label="Browser Menu"
              aria-expanded={isThreeDotOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* THREE-DOT DROPDOWN MENU */}
            <ThreeDotMenu
              isOpen={isThreeDotOpen}
              onClose={() => setIsThreeDotOpen(false)}
              onNewTab={onNewTab}
              onAddTabToNewGroup={onAddTabToNewGroup}
              onOpenAIMode={onOpenAIMode}
              onOpenGitHub={onOpenGitHub}
              onNavigateFullPage={onNavigateFullPage}
              onReload={handleReloadClick}
              tabCount={tabCount}
              incognitoCount={incognitoCount}
            />
          </div>

        </div>
      </div>

      {/* Tabs Row (visible when search active and not on home) */}
      {currentTab !== 'home' && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-900 pt-1">
          <nav className="flex items-center gap-1 sm:gap-2 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as TabType)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'location' && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        geoPermission === 'granted' 
                          ? 'bg-emerald-400 animate-pulse' 
                          : geoPermission === 'denied'
                          ? 'bg-rose-400'
                          : 'bg-cyan-400 animate-ping'
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
