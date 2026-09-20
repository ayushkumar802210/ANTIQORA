import React from 'react';
import { Plus, X, EyeOff, FolderPlus, Sparkles, Layers } from 'lucide-react';
import { BrowserTab, TabGroup } from '../types';

interface BrowserTabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  tabGroups: TabGroup[];
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: (isIncognito?: boolean) => void;
  onDuplicateTab?: (id: string) => void;
  onPinTab?: (id: string) => void;
  onOpenMobileSwitcher?: () => void;
  onOpenTabGroupModal?: () => void;
}

export const BrowserTabBar: React.FC<BrowserTabBarProps> = ({
  tabs,
  activeTabId,
  tabGroups,
  onSwitchTab,
  onCloseTab,
  onNewTab,
  onOpenMobileSwitcher,
  onOpenTabGroupModal
}) => {
  const incognitoCount = tabs.filter(t => t.isIncognito).length;

  return (
    <div className="w-full bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800/80 px-2 sm:px-4 pt-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none select-none">
      
      {/* Desktop Tabs List */}
      <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 max-w-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const group = tab.groupId ? tabGroups.find(g => g.id === tab.groupId) : null;

          return (
            <div
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition-all min-w-[120px] max-w-[200px] border-t border-x ${
                isActive
                  ? tab.isIncognito
                    ? 'bg-purple-950/80 dark:bg-purple-950/90 text-purple-200 border-purple-500/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-800 shadow-sm'
                  : tab.isIncognito
                    ? 'bg-purple-950/30 text-purple-300/70 border-transparent hover:bg-purple-900/40 hover:text-purple-200'
                    : 'bg-slate-800/40 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              {/* Group Pill if assigned */}
              {group && (
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                  title={`Group: ${group.name}`}
                />
              )}

              {/* Icon */}
              {tab.isIncognito ? (
                <EyeOff className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
              )}

              {/* Title */}
              <span className="truncate flex-1 text-[11px] font-semibold tracking-tight">
                {tab.title || (tab.isIncognito ? 'Incognito Tab' : 'New Tab')}
              </span>

              {/* Close Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition"
                  title="Close tab"
                  aria-label="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab + Button */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={() => onNewTab(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition"
            title="New tab (Ctrl+T)"
            aria-label="New tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNewTab(true)}
            className="p-1.5 rounded-lg text-purple-400/70 hover:text-purple-300 hover:bg-purple-900/40 transition"
            title="New Incognito tab (Ctrl+Shift+N)"
            aria-label="New Incognito tab"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {onOpenTabGroupModal && (
            <button
              onClick={onOpenTabGroupModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition"
              title="Add tab to new group"
              aria-label="Add tab to new group"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher Button Header */}
      <div className="flex md:hidden items-center justify-between w-full py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 truncate">
            {tabs.find(t => t.id === activeTabId)?.title || 'ANTIQORA'}
          </span>
          {tabs.find(t => t.id === activeTabId)?.isIncognito && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
              <EyeOff className="w-3 h-3" /> Incognito
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileSwitcher}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400 hover:bg-slate-700 transition"
            aria-label="Switch tabs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tabs.length}</span>
          </button>

          <button
            onClick={() => onNewTab(false)}
            className="p-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
            title="New Tab"
            aria-label="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
