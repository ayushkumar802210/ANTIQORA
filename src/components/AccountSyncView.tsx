import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, User, Check, ShieldCheck, Lock, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSyncViewProps {
  onBack: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
}

export const AccountSyncView: React.FC<AccountSyncViewProps> = ({
  onBack,
  user,
  onOpenAuth
}) => {
  const [syncBookmarks, setSyncBookmarks] = useState(true);
  const [syncHistory, setSyncHistory] = useState(true);
  const [syncSettings, setSyncSettings] = useState(true);
  const [syncTabs, setSyncTabs] = useState(true);

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
              <RefreshCw className="w-5 h-5 text-cyan-500" />
              <span>Continue with ANTIQORA</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-2xl w-full flex-1 p-4 sm:p-8 space-y-6">
        
        {/* Profile / Sync Status Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 font-extrabold text-xl">
              {user.name[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-cyan-500">
                <ShieldCheck className="w-4 h-4" />
                <span>{user.isLoggedIn ? 'Account Active & Connected' : 'Guest Account'}</span>
              </div>
            </div>
          </div>

          {!user.isLoggedIn ? (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3">
              <p className="text-xs text-cyan-600 dark:text-cyan-300 font-medium">
                Sign in to sync your ANTIQORA data, bookmarks, history, and active search tabs seamlessly across devices.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
              >
                Sign In or Register
              </button>
            </div>
          ) : (
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sync Preferences</h3>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Sync Bookmarks & Folders</div>
                  <div className="text-[11px] text-slate-400">Keep saved websites in sync.</div>
                </div>
                <input type="checkbox" checked={syncBookmarks} onChange={(e) => setSyncBookmarks(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Sync History & Searches</div>
                  <div className="text-[11px] text-slate-400">Access recent search queries on all devices.</div>
                </div>
                <input type="checkbox" checked={syncHistory} onChange={(e) => setSyncHistory(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Sync Open Tabs</div>
                  <div className="text-[11px] text-slate-400">Continue browsing open search tabs on mobile or desktop.</div>
                </div>
                <input type="checkbox" checked={syncTabs} onChange={(e) => setSyncTabs(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Sync Settings & Theme</div>
                  <div className="text-[11px] text-slate-400">Language, SafeSearch mode, and AI style preferences.</div>
                </div>
                <input type="checkbox" checked={syncSettings} onChange={(e) => setSyncSettings(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded" />
              </label>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
