import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Plus, 
  EyeOff, 
  RotateCcw,
  History, 
  Bookmark, 
  Download, 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Languages, 
  Camera, 
  FileText, 
  Globe, 
  Smartphone, 
  Cpu, 
  Milestone, 
  ShieldCheck, 
  Sparkles,
  Navigation,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { UserProfile, FullPageView, TabType } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/languages';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  currentLanguage: string;
  onSelectLanguage?: (lang: string) => void;
  onNewTab: (isIncognito?: boolean) => void;
  onNavigateFullPage: (view: FullPageView) => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenVisual?: () => void;
  onOpenDocument?: () => void;
  onOpenRoadmap?: () => void;
  onOpenCrawlerAdmin?: () => void;
  onReload?: () => void;
  isIncognito?: boolean;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  theme,
  onToggleTheme,
  currentLanguage,
  onSelectLanguage,
  onNewTab,
  onNavigateFullPage,
  onSelectTab,
  onOpenVisual,
  onOpenDocument,
  onOpenRoadmap,
  onOpenCrawlerAdmin,
  onReload,
  isIncognito = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Bottom Sheet Drawer */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col pb-safe"
        >
          {/* Drawer Handle */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md pt-3 pb-2 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">
              ANTIQORA Menu
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* User Profile Card */}
            <div 
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-cyan-500/50 transition min-h-[56px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.isLoggedIn ? user.name : 'Sign In to ANTIQORA'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.isLoggedIn ? user.email : 'Sync tabs, bookmarks & AI history'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                {user.isLoggedIn ? 'Manage' : 'Sign In →'}
              </span>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReload?.();
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold text-xs border border-cyan-500/20 hover:bg-cyan-500/20 transition min-h-[52px]"
              >
                <RotateCcw className="w-4 h-4 text-cyan-500 mb-1" />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewTab(false);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-cyan-500/10 hover:text-cyan-500 transition min-h-[52px]"
              >
                <Plus className="w-4 h-4 text-cyan-500 mb-1" />
                <span>New Tab</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewTab(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold text-xs border border-purple-500/20 hover:bg-purple-500/20 transition min-h-[52px]"
              >
                <EyeOff className="w-4 h-4 text-purple-400 mb-1" />
                <span>Incognito</span>
              </button>
            </div>

            {/* Primary Browser Hub */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1.5">
                Browser Tools
              </h4>
              
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateFullPage('bookmarks');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Bookmarks & Starred Pages</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateFullPage('history');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-cyan-500" />
                  <span>Browsing History & Logs</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateFullPage('downloads');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Downloads Hub</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateFullPage('settings');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Search Settings & Privacy</span>
                </div>
                <span className="text-slate-400">→</span>
              </button>
            </div>

            {/* Smart Search Modalities */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1.5">
                AI & Discovery Modes
              </h4>

              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectTab('location');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="w-4 h-4 text-cyan-500 animate-pulse" />
                    <span>Live Location & GPS Navigator</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold">GPS Live</span>
                </button>
              )}

              {onOpenVisual && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVisual();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="w-4 h-4 text-purple-500" />
                    <span>Visual / Camera AI Scanner</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold">Lens</span>
                </button>
              )}

              {onOpenDocument && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDocument();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <span>Document Research & PDF Parser</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-bold">PDF</span>
                </button>
              )}

              {onOpenRoadmap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRoadmap();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <Milestone className="w-4 h-4 text-amber-500" />
                    <span>Engineering Roadmap (Phases 1-3)</span>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>
              )}

              {onOpenCrawlerAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCrawlerAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    <span>Crawler & Search Indexer Admin</span>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>
              )}
            </div>

            {/* Quick Preferences: Theme & Language */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition min-h-[44px]"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Monitor className="w-4 h-4 text-slate-400" />}
                <span className="capitalize">{theme} Mode</span>
              </button>

              {/* Language Picker */}
              {onSelectLanguage && (
                <div className="flex-1 relative">
                  <select
                    value={currentLanguage}
                    onChange={(e) => onSelectLanguage(e.target.value)}
                    className="w-full appearance-none p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border-0 focus:ring-2 focus:ring-cyan-500 min-h-[44px] text-center"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
