/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TabType, 
  UserProfile, 
  SavedItem, 
  AnswerDepth, 
  TimelineEvent, 
  FutureScenario,
  QueryIntentResult,
  OfficialWebsiteResult,
  AppResult
} from './types';
import { 
  searchWeb, 
  searchImages, 
  searchNews, 
  searchVideos, 
  searchPlaces, 
  searchProducts, 
  get3DOverview,
  Overview3DData,
  SearchResultItem, 
  ImageResultItem, 
  NewsResultItem, 
  VideoResultItem, 
  PlaceResultItem, 
  ProductResultItem,
  detectQueryIntent,
  searchWebsites,
  searchApps
} from './services/api';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { TimelineView } from './components/TimelineView';
import { FutureView } from './components/FutureView';
import { ResearchView } from './components/ResearchView';
import { CompareView } from './components/CompareView';
import { TranslateView } from './components/TranslateView';
import { ImagesView } from './components/ImagesView';
import { NewsView } from './components/NewsView';
import { VideosView } from './components/VideosView';
import { PlacesView } from './components/PlacesView';
import { ShoppingView } from './components/ShoppingView';
import { AIChatView } from './components/AIChatView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal, SettingsSection } from './components/SettingsModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { DocumentSearchModal } from './components/DocumentSearchModal';
import { RoadmapModal } from './components/RoadmapModal';
import { settingsManager, AntiqoraSettings } from './services/settingsManager';
import { Globe2, ShieldCheck, Sparkles, Milestone } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  
  // Settings centralized state
  const [settings, setSettings] = useState<AntiqoraSettings>(() => settingsManager.getSettings());
  const [settingsInitialSection, setSettingsInitialSection] = useState<SettingsSection>('appearance');

  // Search data states
  const [webResults, setWebResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [images, setImages] = useState<ImageResultItem[]>([]);
  const [news, setNews] = useState<NewsResultItem[]>([]);
  const [videos, setVideos] = useState<VideoResultItem[]>([]);
  const [places, setPlaces] = useState<PlaceResultItem[]>([]);
  const [products, setProducts] = useState<ProductResultItem[]>([]);

  // User profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('antiqora_user');
    return saved ? JSON.parse(saved) : { name: 'Operator', email: 'operator@antiqora.io', isLoggedIn: false };
  });

  // Saved bookmarks and history
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('antiqora_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('antiqora_history');
    return saved ? JSON.parse(saved) : ['Quantum Computing', 'TypeScript 7', 'Neural Search', 'Autonomous Energy Grids'];
  });

  // Settings & Theme states
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return settingsManager.getSettings().theme;
  });
  const [safeSearch, setSafeSearch] = useState(() => settingsManager.getSettings().safeSearch);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVisualOpen, setIsVisualOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 3D Knowledge States
  const [answerDepth, setAnswerDepth] = useState<AnswerDepth>(() => {
    return settingsManager.getSettings().aiAnswerStyle;
  });
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return settingsManager.getSettings().interfaceLanguage;
  });
  const [overview3D, setOverview3D] = useState<Overview3DData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [futureScenarios, setFutureScenarios] = useState<FutureScenario[]>([]);

  // Subscribe to centralized settings updates
  useEffect(() => {
    const unsub = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
      setTheme(newSettings.theme);
      setSafeSearch(newSettings.safeSearch);
      setCurrentLanguage(newSettings.interfaceLanguage);
      setAnswerDepth(newSettings.aiAnswerStyle);
    });
    return unsub;
  }, []);

  // Apps & Websites Discovery state
  const [intentResult, setIntentResult] = useState<QueryIntentResult | null>(null);
  const [websitesResults, setWebsitesResults] = useState<OfficialWebsiteResult[]>([]);
  const [appsResults, setAppsResults] = useState<AppResult[]>([]);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

  // Apply Theme Handler
  const applyTheme = useCallback((t: 'dark' | 'light' | 'system') => {
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('antiqora_theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme, applyTheme]);

  // Online / Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('antiqora_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('antiqora_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem('antiqora_history', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem('antiqora_depth', answerDepth);
  }, [answerDepth]);

  useEffect(() => {
    localStorage.setItem('antiqora_lang', currentLanguage);
  }, [currentLanguage]);

  // Global Keyboard Shortcut: 'Ctrl+K', 'Cmd+K', or '/' to focus the search bar from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';

      // Check for '/' when not already typing inside an input, textarea, or contenteditable
      const target = e.target as HTMLElement | null;
      const isInputActive = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      const isSlash = e.key === '/' && !isInputActive && !e.ctrlKey && !e.metaKey && !e.altKey;

      if (isCtrlK || isSlash) {
        e.preventDefault();

        // Target the active search bar depending on current tab
        const homeInput = document.getElementById('antiqora-main-search') as HTMLInputElement | null;
        const navbarInput = document.getElementById('antiqora-navbar-search') as HTMLInputElement | null;

        if (currentTab === 'home' && homeInput) {
          homeInput.focus();
          homeInput.select();
          homeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (navbarInput) {
          navbarInput.focus();
          navbarInput.select();
        } else if (homeInput) {
          homeInput.focus();
          homeInput.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab]);

  const executeSearch = async (queryText: string, targetTab: TabType = 'all') => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    
    setActiveQuery(trimmed);
    setSearchQuery(trimmed);
    setCurrentTab(targetTab === 'home' ? 'all' : targetTab);
    setIsSearchLoading(true);
    setSearchError(null);

    // Update search history if enabled
    if (settings.recentSearchesEnabled) {
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
        return [trimmed, ...filtered].slice(0, 20);
      });
    }

    try {
      // Fetch data categories, 3D knowledge overview, and apps & websites discovery in parallel
      const [webRes, imgRes, newsRes, vidRes, placeRes, prodRes, overviewRes, intentRes, sitesRes, appsRes] = await Promise.all([
        searchWeb(trimmed),
        searchImages(trimmed),
        searchNews(),
        searchVideos(trimmed),
        searchPlaces(trimmed),
        searchProducts(trimmed),
        get3DOverview(trimmed, settings.aiAnswerStyle, settings.interfaceLanguage),
        detectQueryIntent(trimmed),
        searchWebsites(trimmed),
        searchApps(trimmed)
      ]);

      setWebResults(webRes.results);
      setTotalResults(webRes.totalResults);
      setImages(imgRes);
      setNews(newsRes);
      setVideos(vidRes);
      setPlaces(placeRes);
      setProducts(prodRes);
      setOverview3D(overviewRes);
      setTimelineEvents(overviewRes.past.events);
      setFutureScenarios(overviewRes.future.scenarios);
      setIntentResult(intentRes);
      setWebsitesResults(sitesRes);
      setAppsResults(appsRes);
    } catch (err: any) {
      console.error("Search execution error:", err);
      setSearchError("Failed to fetch search results. Please verify connection and retry.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleDeleteRecent = (queryToDelete: string) => {
    setRecentSearches(prev => prev.filter(q => q !== queryToDelete));
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleSavePage = (item: SearchResultItem) => {
    if (savedItems.some(s => s.id === item.id)) {
      setSavedItems(savedItems.filter(s => s.id !== item.id));
    } else {
      const newSaved: SavedItem = {
        id: item.id,
        title: item.title,
        url: item.url,
        domain: item.domain,
        type: 'web',
        savedAt: new Date().toLocaleDateString()
      };
      setSavedItems([...savedItems, newSaved]);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    settingsManager.updateSetting('theme', nextTheme);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4 text-center z-50 shadow-md">
          Offline Mode — Using cached ANTIQORA index data.
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            setCurrentTab('home');
          } else {
            setCurrentTab(tab);
            if (!activeQuery && tab !== 'chat' && tab !== 'translate') {
              executeSearch("Quantum Computing", tab);
            }
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onOpenVisual={() => setIsVisualOpen(true)}
        onOpenDocument={() => setIsDocOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        user={user}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        showSearchBar={currentTab !== 'home'}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={() => executeSearch(searchQuery, currentTab)}
        onVoiceSearch={() => setIsVoiceOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            onSearch={(q, tab) => executeSearch(q, (tab as TabType) || 'all')}
            recentSearches={recentSearches}
            onDeleteRecent={handleDeleteRecent}
            onClearRecent={handleClearRecent}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenVisual={() => setIsVisualOpen(true)}
            onOpenDocument={() => setIsDocOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            theme={theme}
            onSetTheme={setTheme}
            depth={answerDepth}
            onSetDepth={setAnswerDepth}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
          />
        )}

        {(currentTab === 'all' || currentTab === 'websites' || currentTab === 'apps' || currentTab === 'ai') && (
          <SearchResultsView
            query={activeQuery || "Quantum Computing"}
            results={webResults}
            totalResults={totalResults}
            isLoading={isSearchLoading}
            error={searchError}
            onRetry={() => executeSearch(activeQuery || "Quantum Computing", currentTab)}
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onBackToHome={() => setCurrentTab('home')}
            onNewSearch={() => {
              setSearchQuery('');
              setCurrentTab('home');
            }}
            onSavePage={handleSavePage}
            savedItemIds={savedItems.map(s => s.id)}
            intentResult={intentResult}
            websitesResults={websitesResults}
            appsResults={appsResults}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onOpenDocument={() => setIsDocOpen(true)}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            query={activeQuery || "Quantum Computing"}
            events={timelineEvents}
          />
        )}

        {currentTab === 'future' && (
          <FutureView
            query={activeQuery || "Quantum Computing"}
            scenarios={futureScenarios}
            keyDrivers={overview3D?.future?.keyDrivers}
            uncertainties={overview3D?.future?.uncertainties}
          />
        )}

        {currentTab === 'research' && (
          <ResearchView
            initialQuery={activeQuery || "Quantum Computing"}
          />
        )}

        {currentTab === 'compare' && (
          <CompareView
            initialA={activeQuery || "Quantum Computing"}
            initialB="Classical Supercomputing"
          />
        )}

        {currentTab === 'translate' && (
          <TranslateView />
        )}

        {currentTab === 'images' && (
          <ImagesView initialQuery={activeQuery} images={images} />
        )}

        {currentTab === 'news' && (
          <NewsView news={news} />
        )}

        {currentTab === 'videos' && (
          <VideosView videos={videos} />
        )}

        {currentTab === 'places' && (
          <PlacesView places={places} />
        )}

        {currentTab === 'shopping' && (
          <ShoppingView products={products} />
        )}

        {currentTab === 'chat' && (
          <AIChatView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-400">ANTIQORA — Search Beyond Limits.</span>
            <span className="text-[10px] text-amber-500 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Phase 1 Prototype</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsRoadmapOpen(true)} className="hover:text-cyan-500 font-semibold text-cyan-600 dark:text-cyan-400 transition flex items-center gap-1">
              <Milestone className="w-3.5 h-3.5" />
              <span>Roadmap (Phases 1-3)</span>
            </button>
            <button onClick={() => { setSettingsInitialSection('privacy'); setIsSettingsOpen(true); }} className="hover:text-cyan-500 transition">Privacy & History</button>
            <button onClick={() => { setSettingsInitialSection('appearance'); setIsSettingsOpen(true); }} className="hover:text-cyan-500 transition">Settings</button>
            <button onClick={() => { setSettingsInitialSection('about'); setIsSettingsOpen(true); }} className="hover:text-cyan-500 transition">API Architecture</button>
          </div>
        </div>
      </footer>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearch={(transcript) => executeSearch(transcript, currentTab)}
      />

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualOpen}
        onClose={() => setIsVisualOpen(false)}
        onSearchWithVisual={(desc) => executeSearch(desc, 'all')}
      />

      {/* Document Search & Intelligence Modal */}
      <DocumentSearchModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        onSearchWithDoc={(q) => executeSearch(q, 'research')}
      />

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={setUser}
        savedItems={savedItems}
        recentSearches={recentSearches}
        onRemoveSaved={(id) => setSavedItems(savedItems.filter(s => s.id !== id))}
        onDeleteHistoryItem={handleDeleteRecent}
        onClearHistory={handleClearRecent}
      />

      {/* Comprehensive ANTIQORA Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSection={settingsInitialSection}
        user={user}
        onUpdateUser={setUser}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthOpen(true);
        }}
        recentSearches={recentSearches}
        onDeleteRecent={handleDeleteRecent}
        onClearRecent={handleClearRecent}
        savedItems={savedItems}
        onDeleteSaved={(id) => setSavedItems(prev => prev.filter(s => s.id !== id))}
        onClearSaved={() => setSavedItems([])}
        onClearAllData={() => {
          handleClearRecent();
          setSavedItems([]);
          settingsManager.resetSettings();
        }}
      />

      {/* ANTIQORA Engineering Roadmap Modal */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />

    </div>
  );
}
