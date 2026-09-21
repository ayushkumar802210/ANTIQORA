import React, { useState, useEffect, useMemo } from 'react';
import { 
  settingsManager, 
  AntiqoraSettings, 
  DEFAULT_SETTINGS,
  SUPPORTED_REGIONS,
  ThemeMode,
  DensityMode,
  FontSize,
  ResultsPerPage,
  SafeSearchMode,
  AIAnswerStyle,
  AISourceDisplay,
  ImageResultLayout,
  NewsSortOrder
} from '../services/settingsManager';
import { SUPPORTED_LANGUAGES, getUIText } from '../services/languages';
import { UserProfile, SavedItem } from '../types';
import { 
  Settings, 
  User, 
  Palette, 
  Search, 
  Globe, 
  Shield, 
  Lock, 
  Bell, 
  Mic, 
  Sparkles, 
  Sliders, 
  Eye, 
  Smartphone, 
  Info, 
  X, 
  Check, 
  Trash2, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  HardDrive, 
  ChevronRight, 
  AlertTriangle, 
  Volume2, 
  ExternalLink,
  Keyboard,
  Contrast,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';

export type SettingsSection = 
  | 'profile'
  | 'appearance'
  | 'search'
  | 'language'
  | 'safesearch'
  | 'privacy'
  | 'notifications'
  | 'voice'
  | 'ai'
  | 'results'
  | 'accessibility'
  | 'pwa'
  | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenAuth: () => void;
  recentSearches: string[];
  onDeleteRecent: (q: string) => void;
  onClearRecent: () => void;
  savedItems: SavedItem[];
  onDeleteSaved: (id: string) => void;
  onClearSaved: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'appearance',
  user,
  onUpdateUser,
  onOpenAuth,
  recentSearches,
  onDeleteRecent,
  onClearRecent,
  savedItems,
  onDeleteSaved,
  onClearSaved,
  onClearAllData
}) => {
  const [settings, setSettings] = useState<AntiqoraSettings>(() => settingsManager.getSettings());
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog confirmations
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile edit states
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Storage and PWA telemetry
  const [storageUsage, setStorageUsage] = useState<{ usedMb: string; quotaMb: string } | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');

  // Voice test states
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [voiceTestText, setVoiceTestText] = useState('');
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  // Feedback form state in About section
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Subscribe to settings changes
  useEffect(() => {
    const unsub = settingsManager.subscribe(newSettings => {
      setSettings(newSettings);
    });
    return unsub;
  }, []);

  // Sync user prop
  useEffect(() => {
    setUserName(user.name);
    setUserEmail(user.email);
  }, [user]);

  // Read storage and platform telemetry on open
  useEffect(() => {
    if (!isOpen) return;

    // Check standalone PWA mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPwaInstalled(standalone);

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPerm(Notification.permission);
    }

    // Check storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(est => {
        const used = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
        const quota = ((est.quota || 0) / (1024 * 1024)).toFixed(0);
        setStorageUsage({ usedMb: used, quotaMb: quota });
      }).catch(() => {});
    }

    // Check microphone permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(res => {
          setMicStatus(res.state as any);
          res.onchange = () => setMicStatus(res.state as any);
        })
        .catch(() => {
          setMicStatus('prompt');
        });
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const updateSetting = <K extends keyof AntiqoraSettings>(key: K, val: AntiqoraSettings[K]) => {
    settingsManager.updateSetting(key, val);
  };

  // Sections navigation menu definition
  const sections: { id: SettingsSection; label: string; icon: any; keywords: string[] }[] = [
    { id: 'profile', label: 'Profile', icon: User, keywords: ['profile', 'account', 'user', 'email', 'avatar', 'sign in', 'logout'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'density', 'font', 'animation', 'contrast'] },
    { id: 'search', label: 'Search Settings', icon: Search, keywords: ['search', 'suggestions', 'autocomplete', 'results', 'new tab', 'history', 'personalized'] },
    { id: 'language', label: 'Language & Region', icon: Globe, keywords: ['language', 'region', 'country', 'translate', 'locale', 'english', 'hindi'] },
    { id: 'safesearch', label: 'Safe Search', icon: Shield, keywords: ['safe search', 'filter', 'explicit', 'adult', 'content filter', 'moderation'] },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock, keywords: ['privacy', 'history', 'clear', 'delete', 'bookmarks', 'saved', 'data', 'chat'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, keywords: ['notifications', 'alerts', 'push', 'news', 'updates'] },
    { id: 'voice', label: 'Voice Search', icon: Mic, keywords: ['voice', 'microphone', 'speech', 'dictation', 'audio'] },
    { id: 'ai', label: 'AI Settings', icon: Sparkles, keywords: ['ai', 'overview', 'gemini', 'depth', 'answer', 'sources', 'forecasts'] },
    { id: 'results', label: 'Search Results', icon: Sliders, keywords: ['results per page', 'image layout', 'news sort', 'new tab', 'density'] },
    { id: 'accessibility', label: 'Accessibility', icon: Eye, keywords: ['accessibility', 'font size', 'high contrast', 'reduced motion', 'keyboard', 'screen reader'] },
    { id: 'pwa', label: 'App / PWA Settings', icon: Smartphone, keywords: ['app', 'pwa', 'install', 'cache', 'storage', 'offline', 'reload', 'update'] },
    { id: 'about', label: 'About ANTIQORA', icon: Info, keywords: ['about', 'version', 'license', 'terms', 'privacy policy', 'feedback'] },
  ];

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();
    return sections.filter(sec => 
      sec.label.toLowerCase().includes(q) || 
      sec.keywords.some(kw => kw.includes(q))
    );
  }, [searchQuery, sections]);

  if (!isOpen) return null;

  // Handlers
  const handleResetSettings = () => {
    settingsManager.resetSettings();
    setShowResetConfirm(false);
    showToast('All ANTIQORA settings have been reset to default.');
  };

  const handleClearAllData = () => {
    onClearAllData();
    setShowClearAllConfirm(false);
    showToast('All local ANTIQORA history, saved items, and cache cleared.');
  };

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: userName.trim() || 'Operator',
        email: userEmail.trim() || 'operator@antiqora.io'
      });
      setIsEditingProfile(false);
      showToast('Profile credentials updated successfully.');
    }
  };

  const handleRequestNotificationPerm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPerm(perm);
        if (perm === 'granted') {
          updateSetting('notificationsEnabled', true);
          showToast('Browser notification permission granted.');
        } else {
          updateSetting('notificationsEnabled', false);
          showToast('Notification permission was denied or dismissed.');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast('Notifications are not supported by this browser environment.');
    }
  };

  const handleVoiceTest = () => {
    if (isVoiceTesting) {
      setIsVoiceTesting(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceTestText('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = settings.voiceLanguage || 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      setIsVoiceTesting(true);
      setVoiceTestText('Listening... Speak into your microphone.');

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setVoiceTestText(transcript);
      };

      recognition.onerror = (e: any) => {
        setVoiceTestText(`Voice recognition notice: ${e.error || 'Check microphone access'}`);
        setIsVoiceTesting(false);
      };

      recognition.onend = () => {
        setIsVoiceTesting(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsVoiceTesting(false);
      setVoiceTestText('Microphone could not be engaged.');
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        showToast('Application cache storage successfully purged.');
      } catch (e) {
        showToast('Cache purged.');
      }
    } else {
      showToast('Application cache cleared.');
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('antiqora_feedback_logs') || '[]');
      existing.push({ text: feedbackText, date: new Date().toISOString() });
      localStorage.setItem('antiqora_feedback_logs', JSON.stringify(existing));
    } catch {}
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 3500);
    showToast('Feedback submitted to ANTIQORA engineering logs.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="ANTIQORA Settings"
    >
      <div className="relative flex flex-col md:flex-row w-full max-w-5xl h-[92vh] max-h-[820px] rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-left">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-cyan-500 text-slate-950 px-4 py-2.5 text-xs font-bold shadow-xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* LEFT NAVIGATION SIDEBAR */}
        <div className="w-full md:w-72 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
          
          {/* Header Title & Close */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
              <Settings className="w-5 h-5 text-cyan-500 animate-spin-slow" />
              <span className="text-sm tracking-wide text-slate-900 dark:text-white uppercase font-mono">ANTIQORA Settings</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Settings Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search settings (e.g. dark mode, voice)..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
              aria-label="Search Settings"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredSections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Quick Controls: Reset All Settings */}
          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-amber-500 text-[11px] font-semibold transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Settings</span>
            </button>
          </div>

        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900 p-5 sm:p-8 custom-scrollbar">
          
          {/* SECTION HEADER */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your active preferences and system behaviors in real-time.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Live State Active
              </span>
            </div>
          </div>

          {/* SECTION 1: PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md border border-cyan-500/50">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.isLoggedIn 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {user.isLoggedIn ? 'Authenticated User' : 'Guest Operator'}
                      </span>
                    </div>
                  </div>

                  {!user.isLoggedIn ? (
                    <button
                      onClick={onOpenAuth}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
                    >
                      Sign In / Connect
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                    >
                      {isEditingProfile ? 'Cancel' : 'Edit Info'}
                    </button>
                  )}
                </div>

                {/* Profile Edit Fields */}
                {isEditingProfile && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Display Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cloud Account Synchronization</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Full multi-device cloud synchronisation will be available when backend authentication is provisioned. Currently, your profile, preferences, bookmarks, and search history persist locally on this browser.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Theme Selector */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose between dark, light, or system default color modes.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => updateSetting('theme', 'dark')}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
                      settings.theme === 'dark'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    onClick={() => updateSetting('theme', 'light')}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
                      settings.theme === 'light'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    onClick={() => updateSetting('theme', 'system')}
                    className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
                      settings.theme === 'system'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span>System Default</span>
                  </button>
                </div>
              </div>

              {/* Density Mode */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Layout Density</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Controls padding and information spacing across search results.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => updateSetting('density', 'comfortable')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      settings.density === 'comfortable'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Comfortable (Spacious)
                  </button>
                  <button
                    onClick={() => updateSetting('density', 'compact')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      settings.density === 'compact'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Compact (Dense)
                  </button>
                </div>
              </div>

              {/* Font Size & Motion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Text Size Scaling</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Scale base readability across all pages.</p>
                  <div className="flex gap-2 pt-1">
                    {(['normal', 'large', 'xlarge'] as FontSize[]).map(sz => (
                      <button
                        key={sz}
                        onClick={() => updateSetting('fontSize', sz)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                          settings.fontSize === sz
                            ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reduced Motion</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Disable non-essential animations.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.reducedMotion ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 3: SEARCH SETTINGS */}
          {activeSection === 'search' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Autocomplete & Suggestions */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Search Suggestions</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Display trending suggestions and query predictions as you type.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('searchSuggestions', !settings.searchSuggestions)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.searchSuggestions ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Open Result Links in New Tab</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Launches external verified websites and source links in a separate browser tab.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('openInNewTab', !settings.openInNewTab)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.openInNewTab ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Record Recent Searches</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Maintain recent search queries locally in your browser for quick recall.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('recentSearchesEnabled', !settings.recentSearchesEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.recentSearchesEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Results Per Page */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Results Displayed Per Page</h4>
                <div className="grid grid-cols-4 gap-2">
                  {([10, 20, 30, 50] as ResultsPerPage[]).map(count => (
                    <button
                      key={count}
                      onClick={() => updateSetting('resultsPerPage', count)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        settings.resultsPerPage === count
                          ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count} Results
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 4: LANGUAGE & REGION */}
          {activeSection === 'language' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Interface Language */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interface Display Language</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">All UI buttons, menus, headings, and settings adapt immediately.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar pt-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        updateSetting('interfaceLanguage', lang.code);
                        showToast(`Interface language updated to ${lang.name}`);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                        settings.interfaceLanguage === lang.code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{lang.flag || '🌐'}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Region */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Search Region & Market</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tailors regional news and geographic contextualization across supported results.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar pt-2">
                  {SUPPORTED_REGIONS.map(reg => (
                    <button
                      key={reg.code}
                      onClick={() => {
                        updateSetting('region', reg.code);
                        showToast(`Search region set to ${reg.name}`);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                        settings.region === reg.code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{reg.flag}</span>
                      <span className="truncate">{reg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: SAFE SEARCH */}
          {activeSection === 'safesearch' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-500" />
                      <span>SafeSearch Filtering Status</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Filter explicit, adult, or inappropriate content across web results, images, and news. Default is ON.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('safeSearch', !settings.safeSearch)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      settings.safeSearch
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {settings.safeSearch ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => updateSetting('safeSearchMode', 'strict')}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                      settings.safeSearchMode === 'strict'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="font-bold">Strict (Recommended)</p>
                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">Filter explicit text, images, and video feeds.</p>
                  </button>

                  <button
                    onClick={() => updateSetting('safeSearchMode', 'moderate')}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                      settings.safeSearchMode === 'moderate'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="font-bold">Moderate</p>
                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">Filter explicit imagery; allow scientific text.</p>
                  </button>

                  <button
                    onClick={() => updateSetting('safeSearchMode', 'off')}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                      settings.safeSearchMode === 'off'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="font-bold">Off</p>
                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">No automatic content filtering applied.</p>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Provider Notice:</strong> When safe search is enabled, ANTIQORA applies client-side classification and instructs upstream search gateways to filter explicit materials.
              </div>
            </div>
          )}

          {/* SECTION 6: PRIVACY & DATA */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Search History Management */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Search History</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {recentSearches.length} item{recentSearches.length === 1 ? '' : 's'} stored strictly in local browser storage.
                    </p>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={onClearRecent}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {recentSearches.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No search history recorded.</p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar pt-1">
                    {recentSearches.map(q => (
                      <div
                        key={q}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{q}</span>
                        <button
                          onClick={() => onDeleteRecent(q)}
                          className="text-slate-400 hover:text-rose-500 transition p-1"
                          title="Delete from history"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Items Management */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Saved Bookmarks & Items</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {savedItems.length} item{savedItems.length === 1 ? '' : 's'} bookmarked for offline review.
                    </p>
                  </div>
                  {savedItems.length > 0 && (
                    <button
                      onClick={onClearSaved}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Saved</span>
                    </button>
                  )}
                </div>

                {savedItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No items saved yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar pt-1">
                    {savedItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.domain}</p>
                        </div>
                        <button
                          onClick={() => onDeleteSaved(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition p-1 flex-shrink-0"
                          title="Remove bookmark"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear All ANTIQORA Data */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-3">
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Purge All ANTIQORA Data</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Permanently deletes all search logs, stored bookmarks, chat records, and reset settings to default state.
                </p>
                <button
                  onClick={() => setShowClearAllConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm"
                >
                  Clear All ANTIQORA Data
                </button>
              </div>

            </div>
          )}

          {/* SECTION 7: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Push & System Notifications</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Permission status: <span className="font-bold uppercase text-cyan-600 dark:text-cyan-400">{notificationPerm}</span>
                    </p>
                  </div>
                  {notificationPerm !== 'granted' && (
                    <button
                      onClick={handleRequestNotificationPerm}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
                    >
                      Enable Browser Alerts
                    </button>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      updateSetting('newsUpdates', true);
                      updateSetting('searchNotifications', true);
                      updateSetting('aiUpdates', true);
                      updateSetting('appUpdates', true);
                      showToast('All notification categories enabled.');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:border-cyan-500 transition"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => {
                      updateSetting('newsUpdates', false);
                      updateSetting('searchNotifications', false);
                      updateSetting('aiUpdates', false);
                      updateSetting('appUpdates', false);
                      showToast('All notification categories disabled.');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:border-rose-500 transition text-rose-500"
                  >
                    Disable All
                  </button>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Breaking World News</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Alerts for critical technological breakthroughs.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('newsUpdates', !settings.newsUpdates)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                        settings.newsUpdates ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Search Topic Alerts</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Updates regarding your saved topics.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('searchNotifications', !settings.searchNotifications)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                        settings.searchNotifications ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Horizon Projections</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Notifications when future scenarios are updated.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('aiUpdates', !settings.aiUpdates)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                        settings.aiUpdates ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 8: VOICE SEARCH */}
          {activeSection === 'voice' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Voice Search Engine</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enable neural voice recognition for query formulation.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('voiceSearchEnabled', !settings.voiceSearchEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.voiceSearchEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Voice Input Language</label>
                  <select
                    value={settings.voiceLanguage}
                    onChange={e => updateSetting('voiceLanguage', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi (हिन्दी)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                    <option value="es-ES">Spanish (Español)</option>
                    <option value="fr-FR">French (Français)</option>
                    <option value="de-DE">German (Deutsch)</option>
                    <option value="ja-JP">Japanese (日本語)</option>
                    <option value="zh-CN">Chinese (中文)</option>
                  </select>
                </div>

                {/* Interactive Mic Test */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Microphone Diagnostics</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Status: <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase">{micStatus}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleVoiceTest}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isVoiceTesting
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isVoiceTesting ? 'Stop Test' : 'Test Microphone'}</span>
                    </button>
                  </div>

                  {voiceTestText && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
                      <span className="truncate mr-2">{voiceTestText}</span>
                      <button onClick={() => setVoiceTestText('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* SECTION 9: AI SETTINGS */}
          {activeSection === 'ai' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Multimodal Overviews</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generate 3D Past, Present, and Future syntheses for search queries.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('aiAnswersEnabled', !settings.aiAnswersEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.aiAnswersEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Synthesis Depth & Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['simple', 'standard', 'detailed'] as AIAnswerStyle[]).map(style => (
                      <button
                        key={style}
                        onClick={() => updateSetting('aiAnswerStyle', style)}
                        className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition ${
                          settings.aiAnswerStyle === style
                            ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Probabilistic Future Horizons</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Display future forecast scenarios and technology trajectories.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('showFutureScenarios', !settings.showFutureScenarios)}
                    className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                      settings.showFutureScenarios ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Truth in Speculation Safeguard</span>
                </p>
                <p className="leading-relaxed">
                  ANTIQORA strictly labels all prospective forecasts and probabilistic scenario models with explicit certainty percentages. AI answers never present forward speculation as established historical facts.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 10: SEARCH RESULTS */}
          {activeSection === 'results' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Image Results Layout</h4>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => updateSetting('imageResultLayout', 'grid')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        settings.imageResultLayout === 'grid'
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Spacious Grid
                    </button>
                    <button
                      onClick={() => updateSetting('imageResultLayout', 'compact')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        settings.imageResultLayout === 'compact'
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Compact Masonry
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">News Results Priority</h4>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => updateSetting('newsSortOrder', 'latest')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        settings.newsSortOrder === 'latest'
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Chronological (Latest First)
                    </button>
                    <button
                      onClick={() => updateSetting('newsSortOrder', 'relevance')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        settings.newsSortOrder === 'relevance'
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Authority & Relevance
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 11: ACCESSIBILITY */}
          {activeSection === 'accessibility' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                
                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-cyan-500" />
                      <span>High Contrast Mode</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enforce maximum optical contrast ratio for low-vision readability.</p>
                  </div>
                  <button
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                      settings.highContrast ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                  </button>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Keyboard className="w-4 h-4 text-cyan-500" />
                        <span>Global Keyboard Shortcuts</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Enable hotkeys to focus search and navigate tabs.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('keyboardShortcuts', !settings.keyboardShortcuts)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                        settings.keyboardShortcuts ? 'bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-sm" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Focus Search Bar</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-cyan-600 dark:text-cyan-400 font-bold border border-slate-200 dark:border-slate-700 text-[11px]">
                        Ctrl+K / ⌘K
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Quick Slash Focus</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-cyan-600 dark:text-cyan-400 font-bold border border-slate-200 dark:border-slate-700 text-[11px]">
                        /
                      </kbd>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 12: APP / PWA SETTINGS */}
          {activeSection === 'pwa' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-5 space-y-4">
                
                {/* Installation & Offline telemetry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">PWA Runtime Status</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isPwaInstalled ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                      <span>{isPwaInstalled ? 'Installed Standalone App' : 'Browser Web Session'}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono">Storage & Cache Footprint</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-cyan-500" />
                      <span>{storageUsage ? `${storageUsage.usedMb} MB Used` : 'Offline Cache Ready'}</span>
                    </p>
                  </div>
                </div>

                {/* Practical PWA Management Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={handleClearCache}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Clear Cache</span>
                  </button>

                  <button
                    onClick={() => {
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(regs => {
                          regs.forEach(r => r.update());
                        });
                      }
                      showToast('ANTIQORA service worker update check initiated.');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Check Update</span>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reload App</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 13: ABOUT ANTIQORA */}
          {activeSection === 'about' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-lg">
                    A
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide">ANTIQORA</h3>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                      Understand the World. Beyond Search.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Version</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">v2.4.0-quantum</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Index Engine</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">Multi-Temporal 3D</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">License</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">Open Initiative MIT</p>
                  </div>
                </div>

                {/* Feedback form */}
                <form onSubmit={handleSendFeedback} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Submit User Feedback / Bug Report
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    rows={3}
                    placeholder="Describe your feedback, request, or issue with ANTIQORA..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {feedbackSent ? '✓ Feedback sent to local telemetry' : 'Logs saved locally to app memory'}
                    </span>
                    <button
                      type="submit"
                      disabled={!feedbackText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 disabled:opacity-40 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* RESET ALL SETTINGS CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset All Settings?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to restore all ANTIQORA settings to their default values? Your search history and saved bookmarks will remain intact.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL DATA CONFIRMATION MODAL */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Purge All ANTIQORA Data?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action will permanently erase your entire search history, all saved bookmarks, and restore default preferences. This operation cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm"
              >
                Purge All Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
