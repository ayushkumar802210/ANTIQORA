import React, { useState } from 'react';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { ThreeDotMenu } from './ThreeDotMenu';
import { TabType, UserProfile, FullPageView } from '../types';
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
  Cpu,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  MoreVertical,
  EyeOff
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
              onClick={onReload}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reload page"
              aria-label="Reload page"
            >
              <RotateCcw className="w-4 h-4" />
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

          {/* Intelligent Search/Address Bar */}
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
                  placeholder="Search query, URL, or ask AI..."
                  className={`w-full rounded-xl border px-3.5 py-1.5 pl-9 pr-20 sm:pr-36 text-xs sm:text-sm shadow-sm transition ${
                    isIncognito
                      ? 'border-purple-800/80 bg-purple-900/50 text-white placeholder-purple-300/60 focus:border-purple-400 focus:ring-1 focus:ring-purple-400'
                      : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                  aria-label="Address and Search Bar"
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
                    onClick={onExecuteSearch}
                    className="rounded-lg bg-cyan-500 px-2.5 py-0.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: PWA, Account, Three-Dot Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          <PWAInstallButton />

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            aria-label="User Account"
          >
            <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
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
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
