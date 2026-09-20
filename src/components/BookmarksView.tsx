import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Plus, 
  FolderPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Folder, 
  Globe, 
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { BookmarkItem, BookmarkFolder, SavedItem } from '../types';

interface BookmarksViewProps {
  onBack: () => void;
  bookmarks: BookmarkItem[];
  folders: BookmarkFolder[];
  onAddBookmark: (item: BookmarkItem) => void;
  onEditBookmark: (id: string, updated: Partial<BookmarkItem>) => void;
  onRemoveBookmark: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onOpenUrl: (url: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  onBack,
  bookmarks,
  folders,
  onAddBookmark,
  onEditBookmark,
  onRemoveBookmark,
  onCreateFolder,
  onOpenUrl
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BookmarkItem | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolderId, setNewFolderId] = useState<string>('all');
  const [folderNameInput, setFolderNameInput] = useState('');

  // Filtered bookmarks
  const filteredBookmarks = bookmarks.filter(b => {
    const matchesFolder = selectedFolderId ? b.folderId === selectedFolderId : true;
    const matchesSearch = !searchQuery.trim() || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCreateBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let domain = 'website';
    try {
      domain = new URL(newUrl.startsWith('http') ? newUrl : `https://${newUrl}`).hostname;
    } catch {
      domain = newUrl;
    }

    const item: BookmarkItem = {
      id: editingItem ? editingItem.id : 'bm_' + Date.now(),
      title: newTitle.trim(),
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      domain,
      folderId: newFolderId !== 'all' ? newFolderId : undefined,
      addedAt: Date.now()
    };

    if (editingItem) {
      onEditBookmark(editingItem.id, item);
    } else {
      onAddBookmark(item);
    }

    setShowAddModal(false);
    setEditingItem(null);
    setNewTitle('');
    setNewUrl('');
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;
    onCreateFolder(folderNameInput.trim());
    setFolderNameInput('');
    setShowFolderModal(false);
  };

  const openEditDialog = (b: BookmarkItem) => {
    setEditingItem(b);
    setNewTitle(b.title);
    setNewUrl(b.url);
    setNewFolderId(b.folderId || 'all');
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
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
              <Bookmark className="w-5 h-5 text-cyan-500" />
              <span>Bookmarks</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">New Folder</span>
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setNewTitle('');
                setNewUrl('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bookmark</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col md:flex-row gap-6 p-4 sm:p-8">
        
        {/* Folders Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0 space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-2">Folders</div>
          
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              selectedFolderId === null
                ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-500" />
              <span>All Bookmarks</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{bookmarks.length}</span>
          </button>

          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                selectedFolderId === f.id
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-4 h-4 text-amber-500" />
                <span className="truncate">{f.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {bookmarks.filter(b => b.folderId === f.id).length}
              </span>
            </button>
          ))}
        </aside>

        {/* Bookmarks List */}
        <main className="flex-1 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
              <Bookmark className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No bookmarks found</h3>
              <p className="text-xs text-slate-500">Add favorite websites or research papers to your bookmarks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBookmarks.map(b => (
                <div 
                  key={b.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm flex items-start justify-between gap-3 hover:border-cyan-500/30 transition group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => onOpenUrl(b.url)}>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500 flex-shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-cyan-500 transition">
                        {b.title}
                      </h4>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {b.domain}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditDialog(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition opacity-0 group-hover:opacity-100"
                      title="Edit bookmark"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBookmarkSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Bookmark' : 'Add New Bookmark'}
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ANTIQORA AI Research"
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">URL</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Folder</label>
                <select
                  value={newFolderId}
                  onChange={(e) => setNewFolderId(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
                >
                  <option value="all">Uncategorized</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
              >
                Save Bookmark
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolderSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Folder</h3>
              <button type="button" onClick={() => setShowFolderModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Folder Name</label>
              <input
                type="text"
                required
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                placeholder="e.g. Research Papers"
                className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
