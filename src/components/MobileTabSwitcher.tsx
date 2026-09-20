import React from 'react';
import { Plus, X, EyeOff, FolderPlus, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { BrowserTab, TabGroup } from '../types';

interface MobileTabSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: BrowserTab[];
  activeTabId: string;
  tabGroups: TabGroup[];
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: (isIncognito?: boolean) => void;
  onCloseAllTabs: () => void;
  onOpenMenu?: () => void;
}

export const MobileTabSwitcher: React.FC<MobileTabSwitcherProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  tabGroups,
  onSwitchTab,
  onCloseTab,
  onNewTab,
  onCloseAllTabs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Back to page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Open Tabs</h2>
            <p className="text-xs text-slate-400">{tabs.length} open tab{tabs.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tabs.length > 1 && (
            <button
              onClick={onCloseAllTabs}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-1"
              title="Close all tabs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={() => {
              onNewTab(false);
              onClose();
            }}
            className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-1 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Tabs Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const group = tab.groupId ? tabGroups.find(g => g.id === tab.groupId) : null;

          return (
            <div
              key={tab.id}
              onClick={() => {
                onSwitchTab(tab.id);
                onClose();
              }}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? tab.isIncognito
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/50 shadow-xl'
                    : 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/50 shadow-xl'
                  : tab.isIncognito
                    ? 'bg-purple-950/20 border-purple-900/50 hover:bg-purple-950/40'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
              }`}
            >
              {/* Tab Header Card */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  {tab.isIncognito ? (
                    <EyeOff className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {tab.title || (tab.isIncognito ? 'Incognito Tab' : 'New Tab')}
                  </span>
                </div>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                    aria-label="Close tab"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Group Pill if present */}
              {group && (
                <div className="mb-2">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                    style={{ backgroundColor: group.color }}
                  >
                    Group: {group.name}
                  </span>
                </div>
              )}

              {/* Tab Preview Detail */}
              <div className="text-xs text-slate-400 truncate">
                {tab.searchQuery ? `Search: "${tab.searchQuery}"` : tab.isIncognito ? 'Private browsing mode' : 'ANTIQORA Homepage'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-around gap-2">
        <button
          onClick={() => {
            onNewTab(false);
            onClose();
          }}
          className="flex-1 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Tab</span>
        </button>

        <button
          onClick={() => {
            onNewTab(true);
            onClose();
          }}
          className="flex-1 py-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2"
        >
          <EyeOff className="w-4 h-4" />
          <span>Incognito</span>
        </button>
      </div>
    </div>
  );
};
