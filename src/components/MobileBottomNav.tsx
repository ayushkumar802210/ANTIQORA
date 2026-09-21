import React from 'react';
import { 
  Home, 
  Sparkles, 
  Layers, 
  History, 
  MoreHorizontal,
  Bookmark,
  Search
} from 'lucide-react';
import { TabType, FullPageView } from '../types';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onGoHome: () => void;
  tabCount: number;
  onOpenTabsSwitcher: () => void;
  onOpenMobileMenu: () => void;
  onNavigateFullPage: (view: FullPageView) => void;
  isIncognito?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onGoHome,
  tabCount,
  onOpenTabsSwitcher,
  onOpenMobileMenu,
  onNavigateFullPage,
  isIncognito = false
}) => {
  return (
    <nav 
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-colors select-none ${
        isIncognito
          ? 'bg-purple-950/95 border-purple-800/80 text-purple-100 backdrop-blur-xl'
          : 'bg-white/95 dark:bg-slate-950/95 border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 backdrop-blur-xl'
      } shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] pb-safe`}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-14 max-w-lg mx-auto">
        
        {/* 1. Home / Search Button */}
        <button
          type="button"
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Home Search"
        >
          <div className={`p-1 rounded-lg transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* 2. AI Neural / Chat Mode */}
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            currentTab === 'chat'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-purple-500'
          }`}
          aria-label="AI Neural Assistant"
        >
          <div className={`p-1 rounded-lg transition-transform ${currentTab === 'chat' ? 'scale-110' : ''}`}>
            <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <span className="text-[10px] tracking-tight">AI Neural</span>
        </button>

        {/* 3. Bookmarks & History Shortcut */}
        <button
          type="button"
          onClick={() => onNavigateFullPage('history')}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all"
          aria-label="Browsing History"
        >
          <div className="p-1 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">History</span>
        </button>

        {/* 4. Active Tabs Switcher */}
        <button
          type="button"
          onClick={onOpenTabsSwitcher}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-all"
          aria-label={`Open tabs switcher, ${tabCount} active tabs`}
        >
          <div className="relative p-1">
            <div className="w-5 h-5 rounded-md border-2 border-current flex items-center justify-center font-mono font-bold text-[10px]">
              {tabCount}
            </div>
            {isIncognito && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-slate-950" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Tabs</span>
        </button>

        {/* 5. Mobile Menu / More Drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all"
          aria-label="Open Mobile Menu"
        >
          <div className="p-1 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>

      </div>
    </nav>
  );
};
