import React, { useState } from 'react';
import { ArrowLeft, Palette, Check, Sparkles, Plus, Trash2 } from 'lucide-react';
import { NewTabCustomization, ShortcutItem } from '../types';

interface CustomizeNewTabViewProps {
  onBack: () => void;
  customization: NewTabCustomization;
  onUpdateCustomization: (updated: NewTabCustomization) => void;
}

export const CustomizeNewTabView: React.FC<CustomizeNewTabViewProps> = ({
  onBack,
  customization,
  onUpdateCustomization
}) => {
  const [bg, setBg] = useState(customization.background);
  const [showShortcuts, setShowShortcuts] = useState(customization.showShortcuts);
  const [showRecent, setShowRecent] = useState(customization.showRecentSearches);
  const [showBookmarks, setShowBookmarks] = useState(customization.showBookmarks);
  const [showTrending, setShowTrending] = useState(customization.showTrending);
  const [showClock, setShowClock] = useState(customization.showClock);
  const [showGreeting, setShowGreeting] = useState(customization.showGreeting);
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(customization.customShortcuts || [
    { id: '1', title: 'GitHub', url: 'https://github.com' },
    { id: '2', title: 'YouTube', url: 'https://youtube.com' },
    { id: '3', title: 'Wikipedia', url: 'https://wikipedia.org' },
    { id: '4', title: 'Reddit', url: 'https://reddit.com' }
  ]);

  const [newShortcutTitle, setNewShortcutTitle] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  const backgrounds: { id: NewTabCustomization['background']; name: string; previewClass: string }[] = [
    { id: 'gradient', name: 'Cosmic Gradient', previewClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950' },
    { id: 'minimal', name: 'Clean Minimalist', previewClass: 'bg-slate-900' },
    { id: 'nebula', name: 'Dark Nebula', previewClass: 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950' },
    { id: 'cyberpunk', name: 'Cyberpunk Glow', previewClass: 'bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900' },
    { id: 'cosmic', name: 'Deep Space', previewClass: 'bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900' },
    { id: 'deepsea', name: 'Deep Sea Abyssal', previewClass: 'bg-gradient-to-br from-teal-950 via-slate-950 to-cyan-950' },
  ];

  const handleAddShortcut = () => {
    if (!newShortcutTitle.trim() || !newShortcutUrl.trim()) return;
    const item: ShortcutItem = {
      id: 'sc_' + Date.now(),
      title: newShortcutTitle.trim(),
      url: newShortcutUrl.startsWith('http') ? newShortcutUrl.trim() : `https://${newShortcutUrl.trim()}`
    };
    const updated = [...shortcuts, item];
    setShortcuts(updated);
    setNewShortcutTitle('');
    setNewShortcutUrl('');
  };

  const handleRemoveShortcut = (id: string) => {
    setShortcuts(shortcuts.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onUpdateCustomization({
      ...customization,
      background: bg,
      showShortcuts,
      showRecentSearches: showRecent,
      showBookmarks,
      showTrending,
      showClock,
      showGreeting,
      customShortcuts: shortcuts
    });
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Back to Browser"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browser</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-500" />
              <span>Customize New Tab Page</span>
            </h1>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
          >
            Save Preferences
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-3xl w-full flex-1 p-4 sm:p-8 space-y-6">
        
        {/* Background Style */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Background Canvas Style</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {backgrounds.map(b => (
              <button
                key={b.id}
                onClick={() => setBg(b.id)}
                className={`relative flex flex-col justify-end p-3 h-24 rounded-xl border transition overflow-hidden text-left ${b.previewClass} ${
                  bg === b.id ? 'ring-2 ring-cyan-500 border-cyan-500' : 'border-slate-800/80 hover:opacity-90'
                }`}
              >
                <span className="text-xs font-bold text-white z-10">{b.name}</span>
                {bg === b.id && (
                  <Check className="absolute top-2 right-2 w-4 h-4 text-cyan-400 z-10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display Toggles */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">New Tab Components</h2>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            <label className="pt-2 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Digital Clock & Greeting</span>
              <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
            </label>

            <label className="pt-3 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Quick Website Shortcuts</span>
              <input type="checkbox" checked={showShortcuts} onChange={(e) => setShowShortcuts(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
            </label>

            <label className="pt-3 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Recent Searches Pills</span>
              <input type="checkbox" checked={showRecent} onChange={(e) => setShowRecent(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
            </label>

            <label className="pt-3 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Saved Bookmarks</span>
              <input type="checkbox" checked={showBookmarks} onChange={(e) => setShowBookmarks(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
            </label>

            <label className="pt-3 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Trending Topics Section</span>
              <input type="checkbox" checked={showTrending} onChange={(e) => setShowTrending(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
            </label>
          </div>
        </div>

        {/* Shortcuts Manager */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Custom Website Shortcuts</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newShortcutTitle}
              onChange={(e) => setNewShortcutTitle(e.target.value)}
              placeholder="Title (e.g. GitHub)"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newShortcutUrl}
              onChange={(e) => setNewShortcutUrl(e.target.value)}
              placeholder="URL (e.g. github.com)"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
            <button
              onClick={handleAddShortcut}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
            >
              Add Shortcut
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {shortcuts.map(sc => (
              <div key={sc.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{sc.title}</span>
                <button
                  onClick={() => handleRemoveShortcut(sc.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
