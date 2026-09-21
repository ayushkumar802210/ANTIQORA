import React from 'react';
import { 
  Home, 
  Search,
  Bell,
  User
} from 'lucide-react';
import { TabType, FullPageView } from '../types';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onGoHome: () => void;
  onOpenAuth: () => void;
  onOpenNotifications?: () => void;
  onNavigateFullPage: (view: FullPageView) => void;
  isIncognito?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onGoHome,
  onOpenAuth,
  onOpenNotifications,
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
      <div className="flex items-center justify-around px-2 py-1 h-14 max-w-lg mx-auto">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Home"
        >
          <div className={`p-1 rounded-lg transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Home</span>
        </button>

        {/* 2. Search */}
        <button
          type="button"
          onClick={() => {
            onGoHome();
            setTimeout(() => {
              const input = document.getElementById('antiqora-main-search') as HTMLInputElement;
              if (input) input.focus();
            }, 100);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl transition-all ${
            currentTab === 'all'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-cyan-500'
          }`}
          aria-label="Search"
        >
          <div className={`p-1 rounded-lg transition-transform ${currentTab === 'all' ? 'scale-110' : ''}`}>
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Search</span>
        </button>

        {/* 3. Notifications */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNotifications) {
              onOpenNotifications();
            } else {
              onNavigateFullPage('help-feedback');
            }
          }}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all"
          aria-label="Notifications"
        >
          <div className="p-1 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Notifications</span>
        </button>

        {/* 4. Activity / Profile */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all"
          aria-label="Activity or Profile"
        >
          <div className="p-1 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Profile</span>
        </button>

      </div>
    </nav>
  );
};
