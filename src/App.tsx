/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TabType, 
  UserProfile, 
  SavedItem, 
  AnswerDepth, 
  TimelineEvent, 
  FutureScenario,
  QueryIntentResult,
  OfficialWebsiteResult,
  AppResult,
  BrowserTab,
  ClosedTab,
  TabGroup,
  DownloadItem,
  BookmarkItem,
  BookmarkFolder,
  SearchHistoryItem,
  NewTabCustomization,
  FullPageView
} from './types';
import { safeParse, isTabGroupArray } from './services/storageUtils';
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
import { trendingSearchesService } from './services/trendingSearchesService';

// Components
import { PWAController } from './components/PWAController';
import { Navbar } from './components/Navbar';
import { BrowserTabBar } from './components/BrowserTabBar';
import { MobileTabSwitcher } from './components/MobileTabSwitcher';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { TimelineView } from './components/TimelineView';
import { FutureView } from './components/FutureView';
import { ResearchView } from './components/ResearchView';
import { ResearchAssistantView } from './components/ResearchAssistantView';
import { CompareView } from './components/CompareView';
import { TranslateView } from './components/TranslateView';
import { ImagesView } from './components/ImagesView';
import { NewsView } from './components/NewsView';
import { VideosView } from './components/VideosView';
import { PlacesView } from './components/PlacesView';
import { LocationView } from './components/LocationView';
import { ShoppingView } from './components/ShoppingView';
import { AIChatView } from './components/AIChatView';

// Full Page Views
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { DownloadsView } from './components/DownloadsView';
import { BookmarksView } from './components/BookmarksView';
import { RecentTabsView } from './components/RecentTabsView';
import { DeleteBrowsingDataView } from './components/DeleteBrowsingDataView';
import { CustomizeNewTabView } from './components/CustomizeNewTabView';
import { HelpFeedbackView } from './components/HelpFeedbackView';
import { AccountSyncView } from './components/AccountSyncView';
import { TabGroupModal } from './components/TabGroupModal';

// Modals
import { AuthModal } from './components/AuthModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { DocumentSearchModal } from './components/DocumentSearchModal';
import { RoadmapModal } from './components/RoadmapModal';
import { SearchEngineAdminModal } from './components/SearchEngineAdminModal';
import { StartupScreen } from './components/StartupScreen';

import { AnimatePresence } from 'motion/react';
import { settingsManager, AntiqoraSettings } from './services/settingsManager';
import { GithubSearchProvider, GitHubSearchResult } from './services/providers/GithubSearchProvider';
import { GoogleSearchProvider } from './services/providers/GoogleSearchProvider';

export default function App() {
  // Navigation State
  const [fullPageView, setFullPageView] = useState<FullPageView | null>(null);

  // Tabs Management
  const [tabs, setTabs] = useState<BrowserTab[]>(() => {
    const saved = localStorage.getItem('antiqora_browser_tabs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [{
      id: 'tab_default',
      title: 'New Tab',
      url: 'antiqora://newtab',
      currentSubTab: 'home',
      currentTab: 'home',
      searchQuery: '',
      activeQuery: '',
      webResults: [],
      totalResults: 0,
      images: [],
      news: [],
      videos: [],
      places: [],
      products: [],
      githubResults: null,
      overview3D: null,
      timelineEvents: [],
      futureScenarios: [],
      intentResult: null,
      websitesResults: [],
      appsResults: [],
      isSearchLoading: false,
      searchError: null,
      historyStack: ['antiqora://newtab'],
      historyIndex: 0,
      isIncognito: false,
      createdAt: Date.now()
    }];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return tabs[0]?.id || 'tab_default';
  });

  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>(() => {
    const saved = localStorage.getItem('antiqora_closed_tabs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tabGroups, setTabGroups] =
    useState<TabGroup[]>(
      () =>
        safeParse(
          "tabGroups",
          [],
          isTabGroupArray
        )
    );

  const [isMobileTabSwitcherOpen, setIsMobileTabSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabGroupModalOpen, setIsTabGroupModalOpen] = useState(false);

  // Active Tab Derived State
  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0] || {
      id: 'tab_default',
      title: 'New Tab',
      url: 'antiqora://newtab',
      currentSubTab: 'home',
      currentTab: 'home',
      searchQuery: '',
      activeQuery: '',
      historyStack: ['antiqora://newtab'],
      historyIndex: 0,
      isIncognito: false,
      createdAt: Date.now()
    };
  }, [tabs, activeTabId]);

  const currentTab = activeTab.currentSubTab || activeTab.currentTab || 'home';
  const searchQuery = activeTab.query || activeTab.searchQuery || '';
  const activeQuery = activeTab.query || activeTab.activeQuery || '';

  // Settings
  const [settings, setSettings] = useState<AntiqoraSettings>(() => settingsManager.getSettings());
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => settingsManager.getSettings().theme);
  const [answerDepth, setAnswerDepth] = useState<AnswerDepth>(() => settingsManager.getSettings().aiAnswerStyle);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => settingsManager.getSettings().interfaceLanguage);

  // Search Results States
  const [webResults, setWebResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [images, setImages] = useState<ImageResultItem[]>([]);
  const [news, setNews] = useState<NewsResultItem[]>([]);
  const [videos, setVideos] = useState<VideoResultItem[]>([]);
  const [places, setPlaces] = useState<PlaceResultItem[]>([]);
  const [products, setProducts] = useState<ProductResultItem[]>([]);
  const [githubResults, setGithubResults] = useState<GitHubSearchResult>({ repositories: [], issues: [], totalCount: 0, isRealApi: false });

  // Downloads, Bookmarks & History
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('antiqora_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('antiqora_bookmarks');
    return saved ? JSON.parse(saved) : [
      { id: 'bm_1', title: 'ANTIQORA AI Engine', url: 'https://antiqora.io', domain: 'antiqora.io', addedAt: Date.now() },
      { id: 'bm_2', title: 'Quantum Research Docs', url: 'https://antiqora.io/research', domain: 'antiqora.io', addedAt: Date.now() }
    ];
  });

  const [bookmarkFolders, setBookmarkFolders] = useState<BookmarkFolder[]>(() => {
    const saved = localStorage.getItem('antiqora_bookmark_folders');
    return saved ? JSON.parse(saved) : [{ id: 'f_research', name: 'Research Papers', createdAt: Date.now() }];
  });

  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem('antiqora_history_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('antiqora_history');
    return saved ? JSON.parse(saved) : ['Quantum Computing', 'TypeScript 7', 'Neural Search', 'Autonomous Energy Grids'];
  });

  const [newTabCustomization, setNewTabCustomization] = useState<NewTabCustomization>(() => {
    const saved = localStorage.getItem('antiqora_newtab_customization');
    return saved ? JSON.parse(saved) : {
      background: 'gradient',
      showShortcuts: true,
      showRecentSearches: true,
      showBookmarks: true,
      showTrending: true,
      showClock: true,
      showGreeting: true
    };
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('antiqora_user');
    return saved ? JSON.parse(saved) : { name: 'Operator', email: 'operator@antiqora.io', isLoggedIn: false };
  });

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('antiqora_saved');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVisualOpen, setIsVisualOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isSearchAdminOpen, setIsSearchAdminOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStartup, setShowStartup] = useState<boolean>(() => !sessionStorage.getItem('antiqora_startup_seen'));

  // 3D Knowledge States
  const [overview3D, setOverview3D] = useState<Overview3DData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [futureScenarios, setFutureScenarios] = useState<FutureScenario[]>([]);

  // Apps & Websites Discovery state
  const [intentResult, setIntentResult] = useState<QueryIntentResult | null>(null);
  const [websitesResults, setWebsitesResults] = useState<OfficialWebsiteResult[]>([]);
  const [appsResults, setAppsResults] = useState<AppResult[]>([]);

  // Local Storage Persistence
  useEffect(() => { localStorage.setItem('antiqora_browser_tabs', JSON.stringify(tabs)); }, [tabs]);
  useEffect(() => { localStorage.setItem('antiqora_closed_tabs', JSON.stringify(closedTabs)); }, [closedTabs]);
  useEffect(() => { localStorage.setItem('antiqora_tab_groups', JSON.stringify(tabGroups)); }, [tabGroups]);
  useEffect(() => { localStorage.setItem('antiqora_downloads', JSON.stringify(downloads)); }, [downloads]);
  useEffect(() => { localStorage.setItem('antiqora_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('antiqora_bookmark_folders', JSON.stringify(bookmarkFolders)); }, [bookmarkFolders]);
  useEffect(() => { localStorage.setItem('antiqora_history_items', JSON.stringify(historyItems)); }, [historyItems]);
  useEffect(() => { localStorage.setItem('antiqora_history', JSON.stringify(recentSearches)); }, [recentSearches]);
  useEffect(() => { localStorage.setItem('antiqora_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('antiqora_saved', JSON.stringify(savedItems)); }, [savedItems]);
  useEffect(() => { localStorage.setItem('antiqora_newtab_customization', JSON.stringify(newTabCustomization)); }, [newTabCustomization]);

  // Subscribe to centralized settings updates
  useEffect(() => {
    const unsub = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
      setTheme(newSettings.theme);
      setCurrentLanguage(newSettings.interfaceLanguage);
      setAnswerDepth(newSettings.aiAnswerStyle);
    });
    return unsub;
  }, []);

  // Theme application
  const applyTheme = useCallback((t: 'dark' | 'light' | 'system') => {
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme, applyTheme]);

  // Startup handler
  const handleStartupComplete = useCallback(() => {
    setShowStartup(false);
    sessionStorage.setItem('antiqora_startup_seen', 'true');
  }, []);

  // TAB ACTIONS
  const handleCreateNewTab = useCallback((isIncognito: boolean = false) => {
    const newId = 'tab_' + Date.now();
    const newTabObj: BrowserTab = {
      id: newId,
      title: isIncognito ? 'Incognito Tab' : 'New Tab',
      url: 'antiqora://newtab',
      currentSubTab: 'home',
      currentTab: 'home',
      searchQuery: '',
      activeQuery: '',
      historyStack: ['antiqora://newtab'],
      historyIndex: 0,
      isIncognito,
      createdAt: Date.now()
    };
    setTabs(prev => [...prev, newTabObj]);
    setActiveTabId(newId);
    setFullPageView(null);
  }, []);

  const handleCloseTab = useCallback((tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTabs(prev => {
      const tabToClose = prev.find(t => t.id === tabId);
      if (tabToClose) {
        setClosedTabs(ct => [{
          id: tabToClose.id,
          title: tabToClose.title,
          url: tabToClose.url || 'antiqora://newtab',
          query: tabToClose.query || tabToClose.searchQuery || '',
          tabType: tabToClose.currentSubTab || tabToClose.currentTab || 'home',
          closedAt: Date.now(),
          isIncognito: tabToClose.isIncognito
        }, ...ct].slice(0, 30));
      }

      const remaining = prev.filter(t => t.id !== tabId);
      if (remaining.length === 0) {
        const freshTab: BrowserTab = {
          id: 'tab_' + Date.now(),
          title: 'New Tab',
          url: 'antiqora://newtab',
          currentSubTab: 'home',
          currentTab: 'home',
          searchQuery: '',
          activeQuery: '',
          historyStack: ['antiqora://newtab'],
          historyIndex: 0,
          isIncognito: false,
          createdAt: Date.now()
        };
        setActiveTabId(freshTab.id);
        return [freshTab];
      }

      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  }, [activeTabId]);

  const handleSwitchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setFullPageView(null);
  }, []);

  const handleDuplicateTab = useCallback((tabId: string) => {
    const existing = tabs.find(t => t.id === tabId);
    if (!existing) return;
    const dup: BrowserTab = {
      ...existing,
      id: 'tab_' + Date.now(),
      title: `${existing.title} (Copy)`
    };
    setTabs(prev => [...prev, dup]);
    setActiveTabId(dup.id);
  }, [tabs]);

  const handlePinTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isPinned: !t.isPinned } : t));
  }, []);

  const handleUpdateTab = useCallback((tabId: string, updated: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...updated } : t));
  }, []);

  // SEARCH EXECUTION
  const executeSearch = async (queryText: string, targetTab: TabType = 'all', e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent | Event) => {
    if (e) {
      e.preventDefault();
    }
    const trimmed = queryText.trim();
    if (!trimmed) return;
    
    setIsSearchLoading(true);
    setSearchError(null);

    let isUrl = false;
    if (/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(trimmed)) {
      isUrl = true;
    }

    const newTitle = isUrl ? trimmed : `Search: ${trimmed}`;
    const newUrl = isUrl ? (trimmed.startsWith('http') ? trimmed : `https://${trimmed}`) : `antiqora://search?q=${encodeURIComponent(trimmed)}`;

    handleUpdateTab(activeTabId, {
      title: newTitle,
      url: newUrl,
      query: trimmed,
      searchQuery: trimmed,
      activeQuery: trimmed,
      currentSubTab: targetTab === 'home' ? 'all' : targetTab,
      currentTab: targetTab === 'home' ? 'all' : targetTab,
      historyStack: [...(activeTab.historyStack || []), newUrl],
      historyIndex: (activeTab.historyIndex || 0) + 1
    });

    if (!activeTab.isIncognito) {
      trendingSearchesService.recordQueryUsage(trimmed);

      setHistoryItems(prev => [{
        id: 'h_' + Date.now(),
        query: trimmed,
        title: newTitle,
        url: newUrl,
        domain: isUrl ? trimmed : 'antiqora.io',
        timestamp: `${Date.now()}`
      }, ...prev]);

      if (settings.recentSearchesEnabled) {
        setRecentSearches(prev => [trimmed, ...prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 20));
      }
    }

    try {
      const [webRes, imgRes, newsRes, vidRes, placeRes, prodRes, overviewRes, intentRes, sitesRes, appsRes, githubRes, googleRes] = await Promise.all([
        searchWeb(trimmed),
        searchImages(trimmed),
        searchNews(),
        searchVideos(trimmed),
        searchPlaces(trimmed),
        searchProducts(trimmed),
        get3DOverview(trimmed, settings.aiAnswerStyle, settings.interfaceLanguage),
        detectQueryIntent(trimmed),
        searchWebsites(trimmed),
        searchApps(trimmed),
        GithubSearchProvider.search(trimmed),
        GoogleSearchProvider.search(trimmed)
      ]);

      const combinedWeb = [...webRes.results];
      if (googleRes?.results?.length) {
        const existingUrls = new Set(combinedWeb.map(r => r.url));
        googleRes.results.forEach(gItem => {
          if (!existingUrls.has(gItem.url)) combinedWeb.push(gItem);
        });
      }

      setWebResults(combinedWeb);
      setTotalResults(combinedWeb.length || webRes.totalResults);
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
      setGithubResults(githubRes);
    } catch (err: any) {
      console.error("Search execution error:", err);
      setSearchError("Failed to fetch search results. Please verify connection and retry.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleReload = useCallback(() => {
    const q = activeTab.query || activeTab.searchQuery;
    if (q) {
      executeSearch(q, currentTab);
    } else {
      window.location.reload();
    }
  }, [activeTab.query, activeTab.searchQuery, currentTab]);

  // Keyboard shortcut Ctrl+K & Ctrl+R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const isCtrlR = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r';

      if (isCtrlK) {
        e.preventDefault();
        const navbarInput = document.getElementById('antiqora-navbar-search') as HTMLInputElement | null;
        const homeInput = document.getElementById('antiqora-main-search') as HTMLInputElement | null;
        if (navbarInput) {
          navbarInput.focus();
          navbarInput.select();
        } else if (homeInput) {
          homeInput.focus();
          homeInput.select();
        }
      } else if (isCtrlR) {
        e.preventDefault();
        handleReload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReload]);

  // BROWSER NAVIGATION (Back, Forward, Reload, Home)
  const canGoBack = (activeTab.historyIndex || 0) > 0;
  const canGoForward = (activeTab.historyIndex || 0) < (activeTab.historyStack?.length || 1) - 1;

  const handleGoBack = () => {
    if (!canGoBack) return;
    const newIdx = (activeTab.historyIndex || 0) - 1;
    const prevUrl = activeTab.historyStack?.[newIdx] || 'antiqora://newtab';
    handleUpdateTab(activeTabId, {
      historyIndex: newIdx,
      url: prevUrl,
      currentSubTab: prevUrl === 'antiqora://newtab' ? 'home' : activeTab.currentSubTab,
      currentTab: prevUrl === 'antiqora://newtab' ? 'home' : activeTab.currentTab
    });
  };

  const handleGoForward = () => {
    if (!canGoForward) return;
    const newIdx = (activeTab.historyIndex || 0) + 1;
    const nextUrl = activeTab.historyStack?.[newIdx];
    handleUpdateTab(activeTabId, {
      historyIndex: newIdx,
      url: nextUrl
    });
  };

  const handleGoHome = () => {
    handleUpdateTab(activeTabId, {
      title: 'New Tab',
      url: 'antiqora://newtab',
      currentSubTab: 'home',
      currentTab: 'home',
      query: '',
      searchQuery: '',
      activeQuery: ''
    });
    setFullPageView(null);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    settingsManager.updateSetting('theme', nextTheme);
  };

  // FULL PAGE VIEW RENDERER
  if (fullPageView) {
    switch (fullPageView) {
      case 'settings':
        return (
          <SettingsView
            onBack={() => setFullPageView(null)}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateFullPage={(v) => setFullPageView(v)}
            onClearAllData={() => {
              setHistoryItems([]);
              setRecentSearches([]);
              setDownloads([]);
              setBookmarks([]);
            }}
            tabs={tabs}
          />
        );
      case 'history':
        return (
          <HistoryView
            onBack={() => setFullPageView(null)}
            historyItems={historyItems}
            onDeleteHistoryItem={(id) => setHistoryItems(prev => prev.filter(h => h.id !== id))}
            onClearAllHistory={() => setHistoryItems([])}
            onOpenQuery={(q) => {
              setFullPageView(null);
              executeSearch(q, 'all');
            }}
          />
        );
      case 'downloads':
        return (
          <DownloadsView
            onBack={() => setFullPageView(null)}
            downloads={downloads}
            onRemoveDownload={(id) => setDownloads(prev => prev.filter(d => d.id !== id))}
            onClearCompletedDownloads={() => setDownloads(prev => prev.filter(d => d.status !== 'completed'))}
            onAddDownload={(item) => setDownloads(prev => [item, ...prev])}
            onRetryDownload={(id) => setDownloads(prev => prev.map(d => d.id === id ? { ...d, status: 'downloading', progress: 30 } : d))}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksView
            onBack={() => setFullPageView(null)}
            bookmarks={bookmarks}
            folders={bookmarkFolders}
            onAddBookmark={(bm) => setBookmarks(prev => [bm, ...prev])}
            onEditBookmark={(id, upd) => setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...upd } : b))}
            onRemoveBookmark={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
            onCreateFolder={(name) => setBookmarkFolders(prev => [...prev, { id: 'f_' + Date.now(), name, createdAt: Date.now() }])}
            onOpenUrl={(url) => {
              setFullPageView(null);
              executeSearch(url, 'all');
            }}
          />
        );
      case 'recent-tabs':
        return (
          <RecentTabsView
            onBack={() => setFullPageView(null)}
            closedTabs={closedTabs}
            onReopenTab={(ct) => {
              handleCreateNewTab(ct.isIncognito);
              if (ct.query) executeSearch(ct.query, 'all');
            }}
            onClearRecentTabs={() => setClosedTabs([])}
          />
        );
      case 'delete-data':
        return (
          <DeleteBrowsingDataView
            onBack={() => setFullPageView(null)}
            onConfirmDelete={(opts) => {
              if (opts.history) setHistoryItems([]);
              if (opts.searchHistory) setRecentSearches([]);
              if (opts.downloads) setDownloads([]);
            }}
          />
        );
      case 'customize-new-tab':
        return (
          <CustomizeNewTabView
            onBack={() => setFullPageView(null)}
            customization={newTabCustomization}
            onUpdateCustomization={(upd) => setNewTabCustomization(upd)}
          />
        );
      case 'help-feedback':
        return (
          <HelpFeedbackView
            onBack={() => setFullPageView(null)}
          />
        );
      case 'account-sync':
        return (
          <AccountSyncView
            onBack={() => setFullPageView(null)}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'research-assistant':
        return (
          <ResearchAssistantView
            query={activeQuery || "Quantum Computing"}
          />
        );
    }
  }

  // STANDARD BROWSER VIEW RENDERER
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      
      {/* Startup Screen Animation */}
      <AnimatePresence>
        {showStartup && (
          <StartupScreen onComplete={handleStartupComplete} />
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4 text-center z-50 shadow-md">
          Offline Mode — Using cached ANTIQORA index data.
        </div>
      )}

      {/* DESKTOP TAB BAR */}
      <BrowserTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleCreateNewTab}
        onDuplicateTab={handleDuplicateTab}
        onPinTab={handlePinTab}
        tabGroups={tabGroups}
        onOpenMobileSwitcher={() => setIsMobileTabSwitcherOpen(true)}
        onOpenTabGroupModal={() => setIsTabGroupModalOpen(true)}
      />

      {/* NAVIGATION HEADER & THREE-DOT MENU */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            handleUpdateTab(activeTabId, { currentSubTab: 'home', currentTab: 'home' });
          } else {
            handleUpdateTab(activeTabId, { currentSubTab: tab, currentTab: tab });
            if (!activeQuery && tab !== 'chat' && tab !== 'translate') {
              executeSearch("Quantum Computing", tab);
            }
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setFullPageView('settings')}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onOpenCrawlerAdmin={() => setIsSearchAdminOpen(true)}
        onOpenVisual={() => setIsVisualOpen(true)}
        onOpenDocument={() => setIsDocOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        user={user}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        showSearchBar={currentTab !== 'home'}
        searchQuery={searchQuery}
        onSearchChange={(q) => handleUpdateTab(activeTabId, { query: q, searchQuery: q })}
        onExecuteSearch={(e) => executeSearch(searchQuery, currentTab, e)}
        onVoiceSearch={() => setIsVoiceOpen(true)}

        // Browser Nav & Three Dot
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        isIncognito={activeTab.isIncognito}
        onNewTab={handleCreateNewTab}
        onAddTabToNewGroup={() => setIsTabGroupModalOpen(true)}
        onOpenAIMode={() => handleUpdateTab(activeTabId, { currentSubTab: 'chat', currentTab: 'chat' })}
        onOpenGitHub={() => window.open('https://github.com', '_blank')}
        onNavigateFullPage={(v) => setFullPageView(v)}
        tabCount={tabs.filter(t => !t.isIncognito).length}
        incognitoCount={tabs.filter(t => t.isIncognito).length}
      />

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            onSearch={(q, tab) => executeSearch(q, (tab as TabType) || 'all')}
            recentSearches={recentSearches}
            historyItems={historyItems}
            onDeleteRecent={(q) => setRecentSearches(prev => prev.filter(r => r !== q))}
            onClearRecent={() => setRecentSearches([])}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenVisual={() => setIsVisualOpen(true)}
            onOpenDocument={() => setIsDocOpen(true)}
            onOpenSettings={() => setFullPageView('settings')}
            theme={theme}
            onSetTheme={setTheme}
            depth={answerDepth}
            onSetDepth={setAnswerDepth}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
          />
        )}

        {(currentTab === 'all' || currentTab === 'websites' || currentTab === 'apps' || currentTab === 'github' || currentTab === 'ai') && (
          <SearchResultsView
            query={activeQuery || "Quantum Computing"}
            results={webResults}
            totalResults={totalResults}
            isLoading={isSearchLoading}
            error={searchError}
            onRetry={() => executeSearch(activeQuery || "Quantum Computing", currentTab)}
            currentTab={currentTab}
            onSelectTab={(tab) => handleUpdateTab(activeTabId, { currentSubTab: tab, currentTab: tab })}
            onBackToHome={() => handleUpdateTab(activeTabId, { currentSubTab: 'home', currentTab: 'home' })}
            onNewSearch={() => handleUpdateTab(activeTabId, { query: '', searchQuery: '', currentSubTab: 'home', currentTab: 'home' })}
            onSavePage={(item) => {
              if (savedItems.some(s => s.id === item.id)) {
                setSavedItems(savedItems.filter(s => s.id !== item.id));
              } else {
                setSavedItems([...savedItems, {
                  id: item.id,
                  title: item.title,
                  url: item.url,
                  domain: item.domain,
                  type: 'web',
                  savedAt: new Date().toLocaleDateString()
                }]);
              }
            }}
            savedItemIds={savedItems.map(s => s.id)}
            intentResult={intentResult}
            websitesResults={websitesResults}
            appsResults={appsResults}
            githubResults={githubResults}
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
          />
        )}

        {currentTab === 'research' && (
          <ResearchView
            query={activeQuery || "Quantum Computing"}
            overview={overview3D}
          />
        )}

        {currentTab === 'research-assistant' && (
          <ResearchAssistantView
            query={activeQuery || "Quantum Computing"}
          />
        )}

        {currentTab === 'compare' && (
          <CompareView
            initialTopic={activeQuery || "Quantum Computing"}
          />
        )}

        {currentTab === 'translate' && (
          <TranslateView />
        )}

        {currentTab === 'images' && (
          <ImagesView images={images} isLoading={isSearchLoading} />
        )}

        {currentTab === 'news' && (
          <NewsView news={news} isLoading={isSearchLoading} />
        )}

        {currentTab === 'videos' && (
          <VideosView videos={videos} isLoading={isSearchLoading} />
        )}

        {currentTab === 'places' && (
          <PlacesView places={places} isLoading={isSearchLoading} />
        )}

        {currentTab === 'location' && (
          <LocationView initialSearchQuery={activeQuery} />
        )}

        {currentTab === 'shopping' && (
          <ShoppingView products={products} isLoading={isSearchLoading} />
        )}

        {currentTab === 'chat' && (
          <AIChatView initialQuery={activeQuery} />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'home') {
            handleUpdateTab(activeTabId, { currentSubTab: 'home', currentTab: 'home' });
          } else {
            handleUpdateTab(activeTabId, { currentSubTab: tab, currentTab: tab });
            if (!activeQuery && tab !== 'chat' && tab !== 'translate') {
              executeSearch("Quantum Computing", tab);
            }
          }
        }}
        onGoHome={handleGoHome}
        tabCount={tabs.length}
        onOpenTabsSwitcher={() => setIsMobileTabSwitcherOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigateFullPage={(v) => setFullPageView(v)}
        isIncognito={activeTab.isIncognito}
      />

      {/* MOBILE MENU DRAWER */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        onNewTab={(incognito) => handleCreateNewTab(incognito)}
        onNavigateFullPage={(v) => setFullPageView(v)}
        onSelectTab={(tab) => handleUpdateTab(activeTabId, { currentSubTab: tab, currentTab: tab })}
        onOpenVisual={() => setIsVisualOpen(true)}
        onOpenDocument={() => setIsDocOpen(true)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onOpenCrawlerAdmin={() => setIsSearchAdminOpen(true)}
        onReload={handleReload}
        isIncognito={activeTab.isIncognito}
      />

      {/* MOBILE BOTTOM TAB SWITCHER BAR */}
      <MobileTabSwitcher
        isOpen={isMobileTabSwitcherOpen}
        onClose={() => setIsMobileTabSwitcherOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        tabGroups={tabGroups}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleCreateNewTab}
        onCloseAllTabs={() => {
          const freshTab: BrowserTab = {
            id: 'tab_' + Date.now(),
            title: 'New Tab',
            url: 'antiqora://newtab',
            currentSubTab: 'home',
            currentTab: 'home',
            searchQuery: '',
            activeQuery: '',
            historyStack: ['antiqora://newtab'],
            historyIndex: 0,
            isIncognito: false,
            createdAt: Date.now()
          };
          setTabs([freshTab]);
          setActiveTabId(freshTab.id);
        }}
        onOpenMenu={() => setFullPageView('settings')}
      />

      {/* TAB GROUP MODAL */}
      <TabGroupModal
        isOpen={isTabGroupModalOpen}
        onClose={() => setIsTabGroupModalOpen(false)}
        activeTab={activeTab}
        tabGroups={tabGroups}
        onCreateGroup={(name, color) => {
          const groupId = 'group_' + Date.now();
          const newGroup: TabGroup = { id: groupId, name, color, tabIds: [activeTab.id] };
          setTabGroups(prev => [...prev, newGroup]);
          handleUpdateTab(activeTab.id, { groupId });
        }}
        onAssignTabToGroup={(tabId, groupId) => handleUpdateTab(tabId, { groupId })}
        onCloseGroup={(groupId) => {
          setTabGroups(prev => prev.filter(g => g.id !== groupId));
          setTabs(prev => prev.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t));
        }}
      />

      {/* MODALS */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          user={user}
          onUpdateUser={(updated) => setUser(updated)}
          savedItems={savedItems}
          recentSearches={recentSearches}
          onRemoveSaved={(id) => setSavedItems(prev => prev.filter(s => s.id !== id))}
          onDeleteHistoryItem={(q) => setRecentSearches(prev => prev.filter(r => r !== q))}
          onClearHistory={() => setRecentSearches([])}
        />
      )}

      {isVoiceOpen && (
        <VoiceSearchModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onSearch={(text) => executeSearch(text, currentTab)}
        />
      )}

      {isVisualOpen && (
        <VisualSearchModal
          isOpen={isVisualOpen}
          onClose={() => setIsVisualOpen(false)}
          onSearchWithVisual={(query) => executeSearch(query, currentTab)}
        />
      )}

      {isDocOpen && (
        <DocumentSearchModal
          isOpen={isDocOpen}
          onClose={() => setIsDocOpen(false)}
          onSearchWithDoc={(query) => executeSearch(query, currentTab)}
        />
      )}

      {isRoadmapOpen && (
        <RoadmapModal
          isOpen={isRoadmapOpen}
          onClose={() => setIsRoadmapOpen(false)}
        />
      )}

      {isSearchAdminOpen && (
        <SearchEngineAdminModal
          isOpen={isSearchAdminOpen}
          onClose={() => setIsSearchAdminOpen(false)}
        />
      )}

      {/* PWA State, Alerts & Prompts Controller */}
      <PWAController />

    </div>
  );
}
