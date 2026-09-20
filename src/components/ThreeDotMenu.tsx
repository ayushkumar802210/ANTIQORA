import React, { useEffect, useRef } from 'react';
import { 
  Plus, 
  EyeOff, 
  FolderPlus, 
  Sparkles, 
  Clock, 
  Trash2, 
  Github, 
  Download, 
  Bookmark, 
  RefreshCw, 
  History, 
  Settings, 
  Palette, 
  HelpCircle,
  MoreVertical,
  Check
} from 'lucide-react';
import { FullPageView } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ThreeDotMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTab: (isIncognito?: boolean) => void;
  onAddTabToNewGroup: () => void;
  onOpenAIMode: () => void;
  onOpenGitHub: () => void;
  onNavigateFullPage: (view: FullPageView) => void;
  tabCount?: number;
  incognitoCount?: number;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  isOpen,
  onClose,
  onNewTab,
  onAddTabToNewGroup,
  onOpenAIMode,
  onOpenGitHub,
  onNavigateFullPage,
  tabCount = 1,
  incognitoCount = 0
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
      role="menu"
      aria-orientation="vertical"
    >
      {/* Tab Quick Header Info */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>ANTIQORA Browser</span>
        <div className="flex items-center gap-2">
          {incognitoCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <EyeOff className="w-3 h-3" /> {incognitoCount}
            </span>
          )}
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {tabCount} {tabCount === 1 ? 'tab' : 'tabs'}
          </span>
        </div>
      </div>

      <div className="space-y-0.5 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {/* Section 1: Tabs */}
        <button
          onClick={() => handleAction(() => onNewTab(false))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
            <span>New tab</span>
          </div>
          <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+T</kbd>
        </button>

        <button
          onClick={() => handleAction(() => onNewTab(true))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-purple-500" />
            <span>New Incognito tab</span>
          </div>
          <kbd className="text-[10px] text-purple-400/80 font-mono">Ctrl+Shift+N</kbd>
        </button>

        <button
          onClick={() => handleAction(onAddTabToNewGroup)}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <FolderPlus className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>Add tab to new group</span>
        </button>

        <button
          onClick={() => handleAction(onOpenAIMode)}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-500 transition group"
          role="menuitem"
        >
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>AI Mode</span>
        </button>

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

        {/* Section 2: History & Data */}
        <button
          onClick={() => handleAction(() => onNavigateFullPage('history'))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
            <span>History</span>
          </div>
          <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+H</kbd>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('delete-data'))}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition group"
          role="menuitem"
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span>Delete browsing data</span>
        </button>

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

        {/* Section 3: Tools & Features */}
        <button
          onClick={() => handleAction(onOpenGitHub)}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <Github className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>GitHub</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('downloads'))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
            <span>Downloads</span>
          </div>
          <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+J</kbd>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('bookmarks'))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
            <span>Bookmarks</span>
          </div>
          <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+B</kbd>
        </button>

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

        {/* Section 4: Account, Tabs, Settings */}
        <button
          onClick={() => handleAction(() => onNavigateFullPage('account-sync'))}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <RefreshCw className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>Continue with ANTIQORA</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('recent-tabs'))}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <History className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>Recent tabs</span>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('settings'))}
          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
            <span>Settings</span>
          </div>
          <kbd className="text-[10px] text-slate-400 font-mono">Alt+S</kbd>
        </button>

        <button
          onClick={() => handleAction(() => onNavigateFullPage('customize-new-tab'))}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <Palette className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>Customize new tab page</span>
        </button>

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

        {isInstalled ? (
          <div className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 select-none bg-emerald-500/5 border border-emerald-500/10">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ANTIQORA is installed</span>
          </div>
        ) : (
          <button
            onClick={() => handleAction(() => {
              if (typeof (window as any).installApp === 'function') {
                (window as any).installApp();
              } else if (isInstallable) {
                install();
              } else {
                onNavigateFullPage('settings');
              }
            })}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition group"
            role="menuitem"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-cyan-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Install ANTIQORA App</span>
            </div>
            {!isInstallable && (
              <span className="text-[9px] bg-cyan-500/10 text-cyan-600 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                {isIOS ? 'Safari Guide' : 'Manual'}
              </span>
            )}
          </button>
        )}

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

        <button
          onClick={() => handleAction(() => onNavigateFullPage('help-feedback'))}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          role="menuitem"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" />
          <span>Help & feedback</span>
        </button>
      </div>
    </div>
  );
};
