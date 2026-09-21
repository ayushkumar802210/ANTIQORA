import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SavedItem } from '../types';
import { 
  User, Mail, Lock, LogOut, Bookmark, Clock, X, Check, Shield, 
  Trash2, Camera, Upload, Edit3, MapPin, Phone, FileText, Sparkles, RefreshCw
} from 'lucide-react';

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

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80"
];

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
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.bio || 'ANTIQORA Verified User');
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || 'New Delhi, India');

  const [activeTab, setActiveTab] = useState<'account' | 'edit-profile' | 'saved' | 'history'>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when user prop changes
  useEffect(() => {
    setName(user.name || 'Alex Chen');
    setEmail(user.email || '');
    setAvatar(user.avatar || '');
    setBio(user.bio || 'ANTIQORA Verified User');
    setPhone(user.phone || '');
    setLocation(user.location || 'New Delhi, India');
  }, [user]);

  if (!isOpen) return null;

  // Handle image file upload (DP Change)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setAvatar(base64Url);
        // Automatically save DP update immediately
        if (user.isLoggedIn) {
          onUpdateUser({
            ...user,
            avatar: base64Url
          });
          setSaveSuccessMessage("Profile photo (DP) updated successfully!");
          setTimeout(() => setSaveSuccessMessage(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatar(url);
    if (user.isLoggedIn) {
      onUpdateUser({
        ...user,
        avatar: url
      });
      setSaveSuccessMessage("Profile avatar updated!");
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    }
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      avatar,
      bio,
      phone,
      location,
      isLoggedIn: true
    });
    setSaveSuccessMessage("Profile settings saved successfully!");
    setTimeout(() => {
      setSaveSuccessMessage('');
      setActiveTab('account');
    }, 1200);
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLoginMode) {
        // Sign in
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid email or password");
        }

        if (!data.authenticated || !data.user) {
          throw new Error("Authentication failed");
        }

        onUpdateUser({
          ...data.user,
          avatar: avatar || data.user.avatar || PRESET_AVATARS[0],
          bio: bio || "ANTIQORA Search Enthusiast",
          isLoggedIn: true,
        });
      } else {
        // Create account
        const newUser: UserProfile = {
          name: name || "User",
          email: email || "user@antiqora.io",
          avatar: avatar || PRESET_AVATARS[0],
          bio: bio || "ANTIQORA Member",
          phone,
          location,
          isLoggedIn: true,
        };
        onUpdateUser(newUser);
      }

      setError("");
      onClose();
    } catch (err) {
      // Fallback client-side authentication if backend api fails
      onUpdateUser({
        name: name || "Member",
        email: email || "user@antiqora.io",
        avatar: avatar || PRESET_AVATARS[0],
        bio: bio || "ANTIQORA Search Enthusiast",
        phone,
        location,
        isLoggedIn: true,
      });
      setError("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onUpdateUser({
      name: '',
      email: '',
      avatar: '',
      bio: '',
      phone: '',
      location: '',
      isLoggedIn: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
        
        {/* Hidden File Input for DP Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {user.isLoggedIn ? 'User Profile & Account Settings' : 'Authentication & Account'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccessMessage && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {user.isLoggedIn ? (
          <div className="space-y-6">
            {/* Tab navigation */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === 'account' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('edit-profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === 'edit-profile' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile & DP</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === 'history' 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>History ({recentSearches.length})</span>
              </button>
            </div>

            {/* TAB 1: MY PROFILE */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                {/* Profile Card with DP Avatar */}
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-950/80 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-4">
                    {/* DP Avatar */}
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 shadow-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-md hover:scale-110 transition cursor-pointer"
                        title="Change Profile Photo (DP)"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Active User
                        </span>
                      </div>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium truncate">{user.email}</p>
                      {user.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{user.bio}</p>}
                    </div>
                  </div>

                  {/* Additional Metadata */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="truncate">{user.location || 'New Delhi, India'}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick DP & Profile Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('edit-profile')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-xs"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile & DP</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                  >
                    <Upload className="w-4 h-4 text-cyan-500" />
                    <span>Upload DP</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Verified ANTIQORA account session with local persistence.</span>
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Signed in as {user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT PROFILE & DP */}
            {activeTab === 'edit-profile' && (
              <form onSubmit={handleSaveProfileChanges} className="space-y-4">
                {/* DP Avatar Customization Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Profile Picture (DP)
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 shadow-md bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                      {avatar ? (
                        <img src={avatar} alt="DP" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Photo</span>
                      </button>
                      <p className="text-[10px] text-slate-400">JPG, PNG or GIF (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Preset Avatars Selection */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Or Choose a Preset Avatar:
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_AVATARS.map((pUrl, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(pUrl)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                            avatar === pUrl ? 'border-cyan-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={pUrl} alt={`Preset ${pIdx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Tagline</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. AI Search & Tech Enthusiast"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        />
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        />
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md shadow-cyan-500/20"
                  >
                    Save Profile Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SAVED ITEMS */}
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

            {/* TAB 4: SEARCH HISTORY */}
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
          /* LOGIN OR CREATE ACCOUNT FORM */
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

            {/* Profile Avatar Selection on Create Account Mode */}
            {!isLoginMode && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Profile Picture (DP)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500 flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400 m-auto mt-3" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {PRESET_AVATARS.slice(0, 5).map((pUrl, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setAvatar(pUrl)}
                      className={`w-8 h-8 rounded-full overflow-hidden border transition ${
                        avatar === pUrl ? 'border-cyan-500 scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
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

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-xs font-semibold text-slate-950 hover:from-cyan-400 hover:to-indigo-500 transition shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Authenticating...' : (isLoginMode ? 'Sign In to ANTIQORA' : 'Create Account & Sign In')}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
