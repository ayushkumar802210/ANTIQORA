import React from 'react';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { TabType, UserProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { 
  Search, 
  Image as ImageIcon, 
  Newspaper, 
  Video, 
  MapPin, 
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
  Cpu
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
  onExecuteSearch?: () => void;
  onVoiceSearch?: () => void;
  onOpenVisual?: () => void;
  onOpenDocument?: () => void;
  currentLanguage?: string;
  onSelectLanguage?: (code: string) => void;
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
  onSelectLanguage
}) => {
  const tabs = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'websites', label: 'Websites', icon: Globe },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'timeline', label: '3D Timeline', icon: Clock },
    { id: 'future', label: 'Future Horizons', icon: Compass },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'places', label: 'Places', icon: MapPin },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 gap-3">
        
        {/* Left: Logo & Top Search Input */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <Logo size="sm" onClick={() => onSelectTab('home')} />

          {showSearchBar && (
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <input
                  id="antiqora-navbar-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onExecuteSearch?.();
                    } else if (e.key === 'Escape') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Search anything with ANTIQORA..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 py-2 pl-9 pr-44 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm"
                  aria-label="Navbar search input"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                
                {/* Keyboard Shortcut Hint */}
                <div className="hidden lg:flex items-center gap-1 absolute right-28 top-2 pointer-events-none select-none">
                  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[10px] font-mono text-slate-400 dark:text-slate-500" title="Press Ctrl+K or /">
                    {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
                  </kbd>
                </div>

                <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                  {onOpenVisual && (
                    <button
                      onClick={onOpenVisual}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Visual Search"
                      aria-label="Visual Search"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onOpenDocument && (
                    <button
                      onClick={onOpenDocument}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Document Intelligence"
                      aria-label="Document Intelligence"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onVoiceSearch && (
                    <button
                      onClick={onVoiceSearch}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      title="Voice Search"
                      aria-label="Voice Search"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={onExecuteSearch}
                    className="rounded-lg bg-cyan-500 px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Language Selector, PWA Install, Theme, Settings, Account */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {onSelectLanguage && (
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition shadow-sm cursor-pointer"
                title="Select language"
                aria-label="Select language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {lang.code.toUpperCase()} · {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onOpenCrawlerAdmin && (
            <button
              onClick={onOpenCrawlerAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition shadow-sm"
              title="Search Engine & Crawler Console"
              aria-label="Crawler Console"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Crawler Engine</span>
            </button>
          )}

          {onOpenRoadmap && (
            <button
              onClick={onOpenRoadmap}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition shadow-sm"
              title="ANTIQORA System Roadmap"
              aria-label="ANTIQORA Roadmap"
            >
              <Milestone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Roadmap</span>
            </button>
          )}

          <PWAInstallButton />

          <button
            onClick={onToggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            title={`Theme mode: ${theme}. Click to switch.`}
            aria-label={`Toggle theme, current is ${theme}`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            aria-label="User Account"
          >
            <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">{user.isLoggedIn ? user.name : 'Account'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row (visible when not on home) */}
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
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
