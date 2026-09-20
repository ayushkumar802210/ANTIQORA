import React, { useState } from 'react';
import { X, FolderPlus, Trash2, Check } from 'lucide-react';
import { TabGroup, BrowserTab } from '../types';

interface TabGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: BrowserTab;
  tabGroups: TabGroup[];
  onCreateGroup: (name: string, color: string) => void;
  onAssignTabToGroup: (tabId: string, groupId?: string) => void;
  onCloseGroup: (groupId: string) => void;
}

export const TabGroupModal: React.FC<TabGroupModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  tabGroups,
  onCreateGroup,
  onAssignTabToGroup,
  onCloseGroup
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6'); // blue default

  if (!isOpen) return null;

  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateGroup(name.trim(), color);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-500 font-bold text-sm">
            <FolderPlus className="w-5 h-5" />
            <span>Tab Group Management</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Group Form */}
        <form onSubmit={handleCreate} className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">New Group Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research, Work, Shopping"
              className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Group Color</label>
            <div className="flex items-center gap-2 mt-1">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${color === c ? 'ring-2 ring-white scale-110' : 'opacity-80'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            Create & Add Active Tab
          </button>
        </form>

        {/* Existing Groups List */}
        {tabGroups.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Existing Groups</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {tabGroups.map(g => {
                const isTabInGroup = activeTab.groupId === g.id;
                return (
                  <div key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{g.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAssignTabToGroup(activeTab.id, isTabInGroup ? undefined : g.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          isTabInGroup 
                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' 
                            : 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-slate-950'
                        }`}
                      >
                        {isTabInGroup ? 'Remove Tab' : 'Add Tab'}
                      </button>

                      <button
                        onClick={() => onCloseGroup(g.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Close group & remove tabs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
