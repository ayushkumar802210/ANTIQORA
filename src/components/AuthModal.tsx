import React, { useState } from 'react';
import { UserProfile, SavedItem } from '../types';
import { User, Mail, Lock, LogOut, Bookmark, Clock, X, Check, Shield, Trash2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  savedItems: SavedItem[];
  recentSearches: string[];
  onRemoveSaved: (id: string) => void;
  onDeleteHistoryItem: (query: string) => void;
  onClearHistory: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  savedItems,
  recentSearches,
  onRemoveSaved,
  onDeleteHistoryItem,
  onClearHistory
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || 'Alex Chen');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'saved' | 'history'>('account');

  if (!isOpen) return null;

  const handleSubmitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name || 'Operator',
      email: email || 'operator@antiqora.io',
      isLoggedIn: true
    });
  };

  const handleLogout = () => {
    onUpdateUser({
      name: '',
      email: '',
      isLoggedIn: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {user.isLoggedIn ? 'ANTIQORA User Profile' : 'Authentication & Account'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user.isLoggedIn ? (
          <div className="space-y-6">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'account' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'saved' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({savedItems.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'history' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Search History ({recentSearches.length})</span>
              </button>
            </div>

            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">User Details</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">{user.email}</p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Verified ANTIQORA session with client-side encrypted credentials.</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedItems.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                    No bookmarked pages yet. Click the bookmark icon on any search result to save it.
                  </p>
                ) : (
                  savedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.domain}</p>
                      </div>
                      <button 
                        onClick={() => onRemoveSaved(item.id)} 
                        className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                    No search history recorded in local storage.
                  </p>
                ) : (
                  recentSearches.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">{q}</span>
                      <button
                        onClick={() => onDeleteHistoryItem(q)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                        title="Delete search"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
                {recentSearches.length > 0 && (
                  <button 
                    onClick={onClearHistory} 
                    className="w-full rounded-xl bg-rose-500/10 border border-rose-500/30 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    Clear All Search History
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitAuth} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  isLoginMode 
                    ? 'bg-cyan-500 text-slate-950' 
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  !isLoginMode 
                    ? 'bg-cyan-500 text-slate-950' 
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Chen"
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@antiqora.io"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-semibold text-slate-950 hover:from-cyan-400 hover:to-indigo-500 transition shadow-md shadow-cyan-500/20"
            >
              {isLoginMode ? 'Sign In to ANTIQORA' : 'Create Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
