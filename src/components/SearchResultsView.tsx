import React, { useState, useEffect, useMemo } from 'react';
import { SearchResultItem, summarizeSearchResult, PageSummaryResult, generateAIAnswer, BilingualAIAnswer } from '../services/api';
import { settingsManager } from '../services/settingsManager';
import { locationService } from '../services/locationService';
import { GitHubSearchResult } from '../services/providers/GithubSearchProvider';
import { 
  sanitizeSearchText, 
  cleanTitle, 
  cleanSnippet, 
  cleanDomain 
} from '../services/textSanitizer';
import { 
  TabType, 
  OfficialWebsiteResult, 
  AppResult, 
  QueryIntentResult 
} from '../types';
import { PersonKnowledgePanel } from './person/PersonKnowledgePanel';
import { PersonEntity } from '../services/entityResolution/types';
import { OfficialDiscoveryCards } from './OfficialDiscoveryCards';
import { UniversalAppCard } from './UniversalAppCard';
import { UniversalAppRecord } from '../services/app-discovery/types';
import { 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  Check, 
  RefreshCw, 
  ChevronDown, 
  ArrowLeft, 
  Copy, 
  MessageSquarePlus, 
  Search, 
  AlertCircle,
  Shield,
  Layers,
  Link2,
  Share2,
  Smartphone,
  Milestone,
  FileText,
  MapPin,
  Navigation,
  Newspaper,
  Video,
  ShoppingBag,
  Star,
  Apple,
  Code,
  GitFork,
  GitPullRequest,
  BadgeCheck,
  ShieldCheck,
  Heart,
  GraduationCap,
  User,
  Lock,
  Flame,
  Volume2,
  VolumeX,
  Languages,
  BookOpen
} from 'lucide-react';
import { SafetyBlockedView } from './SafetyBlockedView';
import { AgeGateModal } from './AgeGateModal';

interface SearchResultsViewProps {
  query: string;
  results: SearchResultItem[];
  totalResults: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  currentTab?: TabType;
  onSelectTab: (tab: TabType) => void;
  onBackToHome: () => void;
  onNewSearch: () => void;
  onExecuteSearch?: (q: string) => void;
  onSavePage: (item: any) => void;
  savedItemIds: string[];
  intentResult?: QueryIntentResult | null;
  personEntity?: PersonEntity | null;
  websitesResults?: OfficialWebsiteResult[];
  appsResults?: AppResult[];
  githubResults?: GitHubSearchResult;
  onOpenRoadmap?: () => void;
  onOpenDocument?: () => void;
  safetyBlocked?: boolean;
  blockReason?: string;
  helplines?: Array<{ name: string; contact: string; url?: string }>;
  isAdultQuery?: boolean;
  isRomanticQuery?: boolean;
  categoryCounts?: Record<string, number>;
  onSafeSearchToggle?: (mode: 'strict' | 'moderate' | 'off') => void;
  safeSearchMode?: 'strict' | 'moderate' | 'off';
  onAgeVerified?: (verified: boolean) => void;
  currentLanguage?: string;
  onSelectLanguage?: (code: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  results,
  totalResults,
  isLoading = false,
  error = null,
  onRetry,
  currentTab = 'all',
  onSelectTab,
  onBackToHome,
  onNewSearch,
  onExecuteSearch,
  onSavePage,
  savedItemIds,
  intentResult = null,
  personEntity = null,
  websitesResults = [],
  appsResults = [],
  githubResults = { repositories: [], issues: [], totalCount: 0, isRealApi: false },
  onOpenRoadmap,
  onOpenDocument,
  safetyBlocked = false,
  blockReason,
  helplines,
  isAdultQuery = false,
  isRomanticQuery = false,
  categoryCounts,
  onSafeSearchToggle,
  safeSearchMode = 'strict',
  onAgeVerified,
  currentLanguage = 'en',
  onSelectLanguage
}) => {
  // If safety policy violation (e.g. minors, non-consensual exploitation)
  if (safetyBlocked) {
    return (
      <SafetyBlockedView
        query={query}
        blockReason={blockReason}
        helplines={helplines}
        onNewSearch={onNewSearch || onBackToHome}
      />
    );
  }

  const [localSearchTerm, setLocalSearchTerm] = useState(query);

  useEffect(() => {
    setLocalSearchTerm(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim() && onExecuteSearch) {
      onExecuteSearch(localSearchTerm.trim());
    }
  };

  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('antiqora_age_verified') === 'true';
    } catch {
      return false;
    }
  });
  const [showAgeGate, setShowAgeGate] = useState<boolean>(false);

  useEffect(() => {
    if (isAdultQuery && !isAgeVerified) {
      setShowAgeGate(true);
    }
  }, [isAdultQuery, isAgeVerified]);

  const handleAgeConfirm = (remember: boolean) => {
    try {
      if (remember) {
        localStorage.setItem('antiqora_age_verified', 'true');
      }
      sessionStorage.setItem('antiqora_age_verified', 'true');
    } catch {}
    setIsAgeVerified(true);
    setShowAgeGate(false);
    onAgeVerified?.(true);
  };

  const handleAgeDecline = () => {
    setShowAgeGate(false);
    onBackToHome();
  };

  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [aiAnswerData, setAiAnswerData] = useState<BilingualAIAnswer | null>(null);
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<'query' | 'en' | 'all' | null>(null);
  const [speakingLanguage, setSpeakingLanguage] = useState<'query' | 'en' | null>(null);
  const [showFollowUpInput, setShowFollowUpInput] = useState<boolean>(false);
  const [followUpQuery, setFollowUpQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "distance">("relevance");
  const [selectedPreview, setSelectedPreview] = useState<SearchResultItem | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [sharedUrlId, setSharedUrlId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; subtitle?: string; url?: string } | null>(null);
  const [universalApps, setUniversalApps] = useState<UniversalAppRecord[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);
  const [appPlatformFilter, setAppPlatformFilter] = useState<'all' | 'android' | 'ios' | 'windows' | 'web' | 'india'>('all');
  const [appCategoryFilter, setAppCategoryFilter] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // AI Page Summarization State
  const [summaries, setSummaries] = useState<Record<string, PageSummaryResult>>({});
  const [summarizingIds, setSummarizingIds] = useState<Record<string, boolean>>({});
  const [expandedSummaryIds, setExpandedSummaryIds] = useState<Record<string, boolean>>({});
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);

  const handleSummarize = async (item: SearchResultItem) => {
    // If already open and not currently fetching, toggle closed
    if (expandedSummaryIds[item.id] && !summarizingIds[item.id]) {
      setExpandedSummaryIds((prev) => ({ ...prev, [item.id]: false }));
      return;
    }

    // If cached already, just open
    if (summaries[item.id]) {
      setExpandedSummaryIds((prev) => ({ ...prev, [item.id]: true }));
      return;
    }

    // Trigger AI call
    setSummarizingIds((prev) => ({ ...prev, [item.id]: true }));
    setExpandedSummaryIds((prev) => ({ ...prev, [item.id]: true }));

    try {
      const summaryData = await summarizeSearchResult({
        title: item.title,
        url: item.url,
        snippet: item.snippet,
        domain: item.domain,
        query: query
      });
      setSummaries((prev) => ({ ...prev, [item.id]: summaryData }));
    } catch (err) {
      console.error("Failed to summarize search result:", err);
    } finally {
      setSummarizingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleCopySummary = (itemId: string, summary: PageSummaryResult) => {
    const formattedText = `Summary of ${summary.title} (${summary.url}):\n\n${summary.summary}\n\nKey Highlights:\n${summary.bullets.map(b => `• ${b}`).join('\n')}`;
    navigator.clipboard.writeText(formattedText);
    setCopiedSummaryId(itemId);
    setTimeout(() => {
      setCopiedSummaryId((curr) => (curr === itemId ? null : curr));
    }, 2000);
  };

  const handleCopyLink = (item: { id: string; title?: string; url?: string }) => {
    if (!item.url) return;
    navigator.clipboard.writeText(item.url);
    setCopiedUrlId(item.id);
    setToast({
      message: "Copied!",
      subtitle: "Link copied to clipboard",
      url: item.url
    });

    setTimeout(() => {
      setCopiedUrlId((curr) => (curr === item.id ? null : curr));
    }, 2000);

    setTimeout(() => {
      setToast((curr) => (curr?.url === item.url ? null : curr));
    }, 2800);
  };

  const handleShare = async (item: { id: string; title: string; url?: string; snippet?: string }) => {
    if (!item.url) return;

    const shareData = {
      title: item.title,
      text: item.snippet ? `${item.title} — ${item.snippet.slice(0, 160)}...` : item.title,
      url: item.url
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        setSharedUrlId(item.id);
        setToast({
          message: "Shared!",
          subtitle: "Shared via Web Share API",
          url: item.url
        });

        setTimeout(() => {
          setSharedUrlId((curr) => (curr === item.id ? null : curr));
        }, 2000);

        setTimeout(() => {
          setToast((curr) => (curr?.url === item.url ? null : curr));
        }, 2800);
      } catch (err: any) {
        // If aborted by user (AbortError), don't show error or fallback
        if (err?.name !== 'AbortError') {
          console.warn("Web Share API failed, falling back to copy link:", err);
          handleCopyLink(item);
        }
      }
    } else {
      // Fallback if Web Share API is unsupported on current platform/browser
      handleCopyLink(item);
    }
  };

  const fetchAiOverview = async () => {
    setLoadingAi(true);
    try {
      const sources = [
        { title: "ANTIQORA Knowledge Index", domain: "antiqora.internal", url: "https://antiqora.internal/source-1" },
        { title: "Technical Knowledge Graph", domain: "research-graph.org", url: "https://research-graph.org/source-2" }
      ];
      const data = await generateAIAnswer(query, sources, currentLanguage);
      setAiAnswer(data.answer);
      setAiAnswerData(data);
      setAiSources(data.sources && data.sources.length > 0 ? data.sources : sources);
    } catch {
      const fallback = `Synthesized answer for "${query}": Key developments in this domain highlight advancements across distributed computation, neural retrieval methods, and verifiable data architectures.`;
      setAiAnswer(fallback);
      setAiAnswerData(null);
      setAiSources([
        { title: "Knowledge Index", domain: "sources.antiqora.io", url: "#" },
        { title: "Research Reference", domain: "research.antiqora.io", url: "#" }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchAiOverview();
    }
  }, [query, currentLanguage]);

  useEffect(() => {
    let isCancelled = false;
    const fetchUniversalApps = async () => {
      const q = query.trim();
      if (!q) return;
      setLoadingApps(true);
      try {
        const res = await fetch(`/api/apps/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.results) {
            setUniversalApps(data.results);
            if (data.facets?.categories) {
              setAvailableCategories(Object.keys(data.facets.categories));
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch universal apps:", e);
      } finally {
        if (!isCancelled) setLoadingApps(false);
      }
    };

    fetchUniversalApps();
    return () => { isCancelled = true; };
  }, [query]);

  const displayUniversalApps = React.useMemo(() => {
    const sourceList: UniversalAppRecord[] = universalApps.length > 0
      ? universalApps
      : (appsResults || []).map((a): UniversalAppRecord => ({
          id: a.id,
          name: a.name,
          developer: a.developer,
          category: a.category,
          description: a.description,
          platforms: [
            ...(a.platforms.android?.supported ? ['Android' as const] : []),
            ...(a.platforms.ios?.supported ? ['iOS' as const] : []),
            ...(a.platforms.web?.supported ? ['Web' as const] : []),
            ...(a.platforms.desktop?.supported ? ['Windows' as const] : [])
          ],
          officialWebsite: a.platforms.web?.url || '',
          androidUrl: a.platforms.android?.storeUrl || '',
          iosUrl: a.platforms.ios?.storeUrl || '',
          windowsUrl: a.platforms.desktop?.url || '',
          webUrl: a.platforms.web?.url || '',
          logo: a.icon || '',
          countryAvailability: ['Global', 'IN'],
          languageSupport: ['en', 'hi'],
          lastVerified: a.lastUpdated || '2026-09',
          verificationStatus: a.isVerified ? 'verified' : 'unverified',
          confidence: a.isVerified ? 0.95 : 0.4,
          rating: a.rating,
          reviewsCount: a.reviewsCount,
          downloads: a.downloads,
          isIndianPriority: false
        }));

    return sourceList.filter(app => {
      if (appPlatformFilter === 'android' && !app.androidUrl && !app.platforms.includes('Android')) return false;
      if (appPlatformFilter === 'ios' && !app.iosUrl && !app.platforms.includes('iOS')) return false;
      if (appPlatformFilter === 'windows' && !app.windowsUrl && !app.platforms.includes('Windows')) return false;
      if (appPlatformFilter === 'web' && !app.webUrl && !app.platforms.includes('Web')) return false;
      if (appPlatformFilter === 'india' && !app.isIndianPriority && !app.countryAvailability?.includes('IN')) return false;
      if (appCategoryFilter !== 'all' && app.category.toLowerCase() !== appCategoryFilter.toLowerCase()) return false;
      return true;
    });
  }, [universalApps, appsResults, appPlatformFilter, appCategoryFilter]);

  const handleSpeak = (text: string, langCode: string, target: 'query' | 'en') => {
    if (!('speechSynthesis' in window)) return;
    if (speakingLanguage === target) {
      window.speechSynthesis.cancel();
      setSpeakingLanguage(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingLanguage(null);
    utterance.onerror = () => setSpeakingLanguage(null);
    setSpeakingLanguage(target);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyAnswer = (type: 'query' | 'en' | 'all' = 'all') => {
    let textToCopy = aiAnswer;
    if (type === 'query' && aiAnswerData?.queryLanguageExplanation) {
      textToCopy = aiAnswerData.queryLanguageExplanation;
    } else if (type === 'en' && aiAnswerData?.englishExplanation) {
      textToCopy = aiAnswerData.englishExplanation;
    } else if (type === 'all' && aiAnswerData?.queryLanguageExplanation && aiAnswerData?.englishExplanation) {
      textToCopy = `[${aiAnswerData.detectedLanguage?.name || 'Native Language'}]:\n${aiAnswerData.queryLanguageExplanation}\n\n[English Explanation]:\n${aiAnswerData.englishExplanation}`;
    }
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(type);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedSection(null);
    }, 2000);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    setLoadingAi(true);
    try {
      const sources = [
        { title: "Knowledge Index (Follow-up)", domain: "antiqora.internal", url: "#" },
        { title: "Technical Index (Follow-up)", domain: "research-graph.org", url: "#" }
      ];
      const data = await generateAIAnswer(`${query} -> Follow-up: ${followUpQuery}`, sources);
      setAiAnswer(data.answer);
      setAiAnswerData(data);
      setFollowUpQuery("");
      setShowFollowUpInput(false);
    } catch {
      setAiAnswer(`Synthesized answer: Additional insights for "${followUpQuery}" in relation to "${query}".`);
    } finally {
      setLoadingAi(false);
    }
  };

  const [proximityRadius, setProximityRadius] = useState<number>(10000);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Default Delhi

  useEffect(() => {
    const handleGeo = (e: any) => {
      if (e.detail?.coords) {
        setUserCoords(e.detail.coords);
      }
    };
    window.addEventListener('antiqora:geolocation-updated', handleGeo as EventListener);
    return () => window.removeEventListener('antiqora:geolocation-updated', handleGeo as EventListener);
  }, []);

  const isSocialDomain = (domain: string = '') => {
    const d = domain.toLowerCase();
    return d.includes('twitter') || d.includes('x.com') || d.includes('instagram') || d.includes('reddit') || d.includes('quora') || d.includes('facebook') || d.includes('linkedin') || d.includes('tiktok') || d.includes('youtube');
  };

  const sortedResults = useMemo(() => {
    let sourceResults = [...results];
    if (currentTab === 'articles') {
      const filtered = sourceResults.filter(r => r.category === 'articles');
      if (filtered.length > 0) sourceResults = filtered;
    } else if (currentTab === 'health-education') {
      const filtered = sourceResults.filter(r => r.category === 'health-education');
      if (filtered.length > 0) sourceResults = filtered;
    } else if (currentTab === 'dating-relationships') {
      const filtered = sourceResults.filter(r => r.category === 'dating-relationships');
      if (filtered.length > 0) sourceResults = filtered;
    } else if (currentTab === 'social') {
      const filtered = sourceResults.filter(r => r.category === 'social' || isSocialDomain(r.domain));
      if (filtered.length > 0) sourceResults = filtered;
    } else if (currentTab === 'people') {
      const filtered = sourceResults.filter(r => r.category === 'people');
      if (filtered.length > 0) sourceResults = filtered;
    } else if (currentTab === 'news') {
      const filtered = sourceResults.filter(r => r.category === 'news');
      if (filtered.length > 0) sourceResults = filtered;
    }

    const items = sourceResults.map((item, idx) => {
      const targetCoords = (item as any).mapCoords || {
        lat: userCoords.lat + (((idx * 17) % 50) - 25) * 0.005,
        lng: userCoords.lng + (((idx * 31) % 50) - 25) * 0.005
      };
      const distInfo = locationService.calculateDistance(userCoords, targetCoords);
      return {
        ...item,
        distanceKm: distInfo.distanceKm,
        distanceMiles: distInfo.distanceMiles,
        walkingMins: distInfo.walkingMins,
        drivingMins: distInfo.drivingMins
      };
    });

    if (currentTab === 'location' || sortBy === 'distance') {
      items.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'date') {
      items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }

    if (currentTab === 'location' && proximityRadius < 5000) {
      return items.filter(i => i.distanceKm <= proximityRadius);
    }

    return items;
  }, [results, sortBy, currentTab, proximityRadius, userCoords]);

  const dynamicCategories = useMemo(() => {
    const articlesCount = results.filter(r => r.category === 'articles').length;
    const healthEducationCount = results.filter(r => r.category === 'health-education').length;
    const datingRelationshipsCount = results.filter(r => r.category === 'dating-relationships').length;
    const socialCount = results.filter(r => r.category === 'social' || isSocialDomain(r.domain)).length;
    const peopleCount = personEntity ? 1 : results.filter(r => r.category === 'people').length;
    const newsCount = results.filter(r => r.category === 'news').length;

    const list: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: string; count: number }> = [
      { id: 'all', label: 'All', icon: <Globe className="w-3.5 h-3.5" />, count: results.length },
      { id: 'websites', label: 'Websites', icon: <Globe className="w-3.5 h-3.5" />, badge: 'Official', count: websitesResults?.length || 0 },
      { id: 'apps', label: 'Apps', icon: <Smartphone className="w-3.5 h-3.5" />, badge: 'Store', count: appsResults?.length || 0 },
      { id: 'images', label: 'Images', icon: <Layers className="w-3.5 h-3.5" />, count: categoryCounts?.images ?? 8 },
      { id: 'videos', label: 'Videos', icon: <Video className="w-3.5 h-3.5" />, count: categoryCounts?.videos ?? 6 },
      { id: 'news', label: 'News', icon: <Newspaper className="w-3.5 h-3.5" />, count: newsCount },
      { id: 'social', label: 'Social', icon: <Share2 className="w-3.5 h-3.5" />, count: socialCount },
      { id: 'people', label: 'People', icon: <User className="w-3.5 h-3.5" />, count: peopleCount },
      { id: 'articles', label: 'Articles', icon: <FileText className="w-3.5 h-3.5" />, count: articlesCount },
      { id: 'health-education', label: 'Health & Education', icon: <GraduationCap className="w-3.5 h-3.5" />, count: healthEducationCount },
      { id: 'dating-relationships', label: 'Dating & Romance', icon: <Heart className="w-3.5 h-3.5" />, count: datingRelationshipsCount },
      { id: 'ai', label: 'AI', icon: <Sparkles className="w-3.5 h-3.5" />, count: 1 },
      { id: 'github', label: 'GitHub', icon: <Code className="w-3.5 h-3.5" />, badge: 'Repos', count: githubResults?.repositories?.length || 0 },
    ];

    // Empty categories ko hide karo - Requirement 6
    return list.filter(cat => cat.id === 'all' || cat.count > 0);
  }, [results, categoryCounts, personEntity, websitesResults, appsResults, githubResults]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header: Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder="Search anything..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 pl-8 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          </form>

          <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400">
            About <span className="text-slate-800 dark:text-slate-200 font-semibold">{totalResults}</span> results
          </span>
        </div>

        {/* Status Badge & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Neural Search Active</span>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-cyan-500 shadow-sm"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="distance">Sort: Proximity (Nearest)</option>
              <option value="date">Sort: Recent</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Proximity Filter Banner (Active in LocationView tab) */}
      {currentTab === 'location' && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Proximity-Based Filter & Sorting Active</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Results automatically sorted by distance from your current GPS location ({userCoords.lat.toFixed(3)}°, {userCoords.lng.toFixed(3)}°).
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Radius:</span>
            {(['all', '5', '25', '100'] as const).map(rad => (
              <button
                key={rad}
                onClick={() => setProximityRadius(rad === 'all' ? 10000 : Number(rad))}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  (rad === 'all' && proximityRadius > 5000) || proximityRadius === Number(rad)
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {rad === 'all' ? 'All' : `${rad} km`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* SafeSearch Mode Indicator & Fast Toggle */}
      <div className="flex items-center justify-end gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="safesearch-toggle-button"
            onClick={() => {
              const nextMode = safeSearchMode === 'strict' ? 'moderate' : safeSearchMode === 'moderate' ? 'off' : 'strict';
              onSafeSearchToggle?.(nextMode);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              safeSearchMode === 'strict'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : safeSearchMode === 'moderate'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
            }`}
            title="Toggle SafeSearch between Strict (Minor Safe), Moderate, and Adult Search Mode"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SafeSearch:</span>
            <span className="capitalize">{safeSearchMode === 'off' ? '18+ Adult Mode' : safeSearchMode}</span>
          </button>
        </div>
      </div>

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Universal Person & Entity Resolution Knowledge Panel */}
          {personEntity && (
            <PersonKnowledgePanel
              entity={personEntity}
              activeTab={currentTab}
              onSelectTab={onSelectTab}
              onSelectDisambiguation={(entityId, name) => {
                onSelectTab('all');
              }}
            />
          )}

          {/* Official Digital Discovery Cards: Websites & Apps */}
          <OfficialDiscoveryCards
            intentResult={intentResult}
            onSaveWebsite={onSavePage}
            onSaveApp={onSavePage}
            savedItemIds={savedItemIds}
            filterMode={currentTab === 'websites' ? 'websites' : currentTab === 'apps' ? 'apps' : 'all'}
          />

          {/* Top Universal App Discovery Card (if intent didn't already display an official app) */}
          {currentTab === 'all' && universalApps.length > 0 && !intentResult?.officialApp && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Universal App & Digital Platform Match</span>
                </span>
                <button
                  onClick={() => onSelectTab('apps')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View all {universalApps.length} app results →
                </button>
              </div>
              <UniversalAppCard
                app={universalApps[0]}
                isHero={true}
                onSelectCategory={(cat) => {
                  onSelectTab('apps');
                  setAppCategoryFilter(cat);
                }}
              />
            </div>
          )}

          {/* If currentTab is 'websites', show websites list */}
          {currentTab === 'websites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>Verified Websites Directory ({websitesResults.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Official Domains Filter</span>
              </div>

              {websitesResults.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 text-xs">
                  No verified website matches for "{query}".
                </div>
              ) : (
                websitesResults.map((web) => (
                  <div 
                    key={web.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{web.name}</span>
                          {web.isVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Official Website
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{web.domain}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{web.description}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleSummarize({
                            id: web.id,
                            title: web.name,
                            url: web.url,
                            domain: web.domain,
                            snippet: web.description,
                            category: 'website',
                            date: 'Verified'
                          })}
                          disabled={summarizingIds[web.id]}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            expandedSummaryIds[web.id]
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40'
                          }`}
                          title="Summarize website content with AI"
                        >
                          {summarizingIds[web.id] ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                          )}
                          <span>{summarizingIds[web.id] ? 'Summarizing...' : expandedSummaryIds[web.id] ? 'Hide Summary' : 'Summarize'}</span>
                        </button>

                        <button
                          onClick={() => handleShare({
                            id: web.id,
                            title: web.name,
                            url: web.url,
                            snippet: web.description
                          })}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                          title="Share website link"
                          aria-label={`Share ${web.name}`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>

                        <a 
                          href={web.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition flex-shrink-0"
                        >
                          <span>Open Website</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* AI Summary for website item */}
                    {expandedSummaryIds[web.id] && summaries[web.id] && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Website Summary</span>
                          </span>
                          <button
                            onClick={() => setExpandedSummaryIds(p => ({ ...p, [web.id]: false }))}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Close
                          </button>
                        </div>
                        <p className="text-xs italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                          "{summaries[web.id].summary}"
                        </p>
                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {summaries[web.id].bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {web.subDestinations && web.subDestinations.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-2">
                        {web.subDestinations.map((sub, i) => (
                          <a
                            key={i}
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition"
                          >
                            <span>{sub.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* If currentTab is 'github', show GitHub repositories and issues */}
          {currentTab === 'github' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-500" />
                  <span>GitHub Repositories & Code ({githubResults?.repositories?.length || 0})</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {githubResults?.isRealApi ? "Live GitHub API" : "Secure Server Proxy / Fallback"}
                </span>
              </div>

              {githubResults?.repositories?.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 text-xs">
                  No GitHub repositories found for "{query}".
                </div>
              ) : (
                <div className="space-y-4">
                  {githubResults?.repositories?.map((repo) => (
                    <div 
                      key={repo.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 hover:border-cyan-500/40 transition shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                            <a 
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-slate-900 dark:text-white text-base hover:text-cyan-500 transition"
                            >
                              {repo.full_name}
                            </a>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                              {repo.language || 'Code'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{repo.description}</p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{repo.stargazers_count?.toLocaleString()} stars</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3.5 h-3.5 text-slate-400" />
                              <span>{repo.forks_count?.toLocaleString()} forks</span>
                            </span>
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition flex-shrink-0"
                        >
                          <span>View Repository</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {githubResults?.issues && githubResults.issues.length > 0 && (
                    <div className="pt-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Related Issues & Pull Requests</h4>
                      {githubResults.issues.map((issue) => (
                        <div 
                          key={issue.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <GitPullRequest className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <div>
                              <a 
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-cyan-500 transition"
                              >
                                {issue.title}
                              </a>
                              <p className="text-[11px] text-slate-400">#{issue.number} opened by {issue.user?.login}</p>
                            </div>
                          </div>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex-shrink-0"
                          >
                            View Issue
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* If currentTab is 'apps', show Universal App Directory */}
          {currentTab === 'apps' && (
            <div className="space-y-5">
              {/* Header & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                    <span>Universal App & Web Platform Search</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {displayUniversalApps.length} {displayUniversalApps.length === 1 ? 'Platform' : 'Platforms'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live dynamic discovery across Google Play, Apple App Store, F-Droid, Windows Store & verified developer domains.
                  </p>
                </div>

                {loadingApps && (
                  <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Discovering live platforms...</span>
                  </div>
                )}
              </div>

              {/* Platform Filter Toolbar */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Filter by Platform & Ecosystem
                  </span>
                  {(appPlatformFilter !== 'all' || appCategoryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setAppPlatformFilter('all');
                        setAppCategoryFilter('all');
                      }}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Platforms' },
                    { id: 'android', label: 'Android (Google Play)' },
                    { id: 'ios', label: 'iPhone (App Store)' },
                    { id: 'windows', label: 'Windows PC' },
                    { id: 'web', label: 'Web / PWA' },
                    { id: 'india', label: '🇮🇳 India Focused' },
                  ].map((p) => {
                    const isActive = appPlatformFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setAppPlatformFilter(p.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Category Chips */}
                {availableCategories.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-medium text-slate-500 flex-shrink-0 mr-1">Category:</span>
                    <button
                      onClick={() => setAppCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        appCategoryFilter === 'all'
                          ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      All Categories
                    </button>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setAppCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                          appCategoryFilter.toLowerCase() === cat.toLowerCase()
                            ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* App Results Cards */}
              {displayUniversalApps.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
                  <Smartphone className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No matching app or platform listings found
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      No verified apps found for query "{query}" with current platform/category filters. Try switching filters or searching popular apps like "PhonePe", "Zomato", "Instagram", or "Spotify".
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setAppPlatformFilter('all');
                        setAppCategoryFilter('all');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition"
                    >
                      Clear Platform & Category Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayUniversalApps.map((app) => (
                    <UniversalAppCard
                      key={app.id}
                      app={app}
                      onSelectCategory={(cat) => setAppCategoryFilter(cat)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Standard Web View Elements (Shown on 'all' or 'ai') */}
          {(currentTab === 'all' || currentTab === 'ai') && (
            <>
              {/* AI ANSWER SECTION ("Ask ANTIQORA") */}
              <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-cyan-500/5 via-white dark:via-slate-900/90 to-white dark:to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl shadow-cyan-500/5">
            
            {/* Header with Language Detection Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-sm shadow-inner">
                  A
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Ask ANTIQORA</span>
                  </h2>
                  <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                    Bilingual Cognitive Knowledge Synthesis & Deep Analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {aiAnswerData?.detectedLanguage && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{aiAnswerData.detectedLanguage.nativeName} ({aiAnswerData.detectedLanguage.name})</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3" />
                  AI Synthesizer
                </span>
              </div>
            </div>

            {loadingAi ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Synthesizing multilingual answer for "{query}"...</p>
                <p className="text-[11px] text-slate-400">Generating native language explanation + English translation...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check if bilingual explanation is available (native + english) */}
                {aiAnswerData?.queryLanguageExplanation && aiAnswerData?.englishExplanation && !aiAnswerData?.detectedLanguage?.isEnglish ? (
                  <div className="space-y-4">
                    {/* 1. NATIVE LANGUAGE EXPLANATION (jis language me search kiya) */}
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20 p-4 transition">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            1
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {aiAnswerData.detectedLanguage?.nativeName || aiAnswerData.detectedLanguage?.name} में व्याख्या (Query Language Explanation)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSpeak(aiAnswerData.queryLanguageExplanation!, aiAnswerData.detectedLanguage?.code || 'hi-IN', 'query')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                            title="Listen in native language"
                          >
                            {speakingLanguage === 'query' ? <VolumeX className="w-3.5 h-3.5 text-cyan-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{speakingLanguage === 'query' ? 'Stop' : 'Listen'}</span>
                          </button>
                          <button
                            onClick={() => handleCopyAnswer('query')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                            title="Copy native explanation"
                          >
                            {copied && copiedSection === 'query' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied && copiedSection === 'query' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                        {aiAnswerData.queryLanguageExplanation}
                      </p>

                      {aiAnswerData.keyPointsQueryLang && aiAnswerData.keyPointsQueryLang.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-cyan-500/15">
                          <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 mb-1.5 uppercase tracking-wider">
                            मुख्य बिंदु (Key Highlights):
                          </p>
                          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            {aiAnswerData.keyPointsQueryLang.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-500 font-bold mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Visual Connector / Transition Line */}
                    <div className="relative py-1 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-slate-300 dark:border-slate-700" />
                      </div>
                      <div className="relative bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shadow-xs">
                        <span className="text-cyan-500">↓</span>
                        <span>English Explanation / अंग्रेजी में पूर्ण विवरण</span>
                      </div>
                    </div>

                    {/* 2. ENGLISH EXPLANATION DIRECTLY BELOW (usi ke niche english me explanation) */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition shadow-xs">
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                            2
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            English Technical & Comprehensive Breakdown
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSpeak(aiAnswerData.englishExplanation!, 'en-US', 'en')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Listen in English"
                          >
                            {speakingLanguage === 'en' ? <VolumeX className="w-3.5 h-3.5 text-cyan-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{speakingLanguage === 'en' ? 'Stop' : 'Listen'}</span>
                          </button>
                          <button
                            onClick={() => handleCopyAnswer('en')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Copy English explanation"
                          >
                            {copied && copiedSection === 'en' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied && copiedSection === 'en' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {aiAnswerData.englishExplanation}
                      </p>

                      {aiAnswerData.keyPointsEnglish && aiAnswerData.keyPointsEnglish.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                            Key Takeaways & Concepts:
                          </p>
                          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            {aiAnswerData.keyPointsEnglish.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-500 font-bold mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard / Single-Language View (English or Fallback) */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Synthesized Knowledge Overview
                      </span>
                      <button
                        onClick={() => handleSpeak(aiAnswer, 'en-US', 'en')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        {speakingLanguage === 'en' ? <VolumeX className="w-3.5 h-3.5 text-cyan-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{speakingLanguage === 'en' ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {aiAnswer}
                    </div>
                    {aiAnswerData?.keyPointsEnglish && aiAnswerData.keyPointsEnglish.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {aiAnswerData.keyPointsEnglish.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-cyan-500 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Sources Section */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Verified Citations & Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiSources.map((src, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs text-cyan-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-700/60"
                      >
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{src.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Action Buttons: Ask follow-up, Copy answer, Regenerate, New search */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFollowUpInput(!showFollowUpInput)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Ask follow-up</span>
                  </button>

                  <button
                    onClick={() => handleCopyAnswer('all')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  >
                    {copied && copiedSection === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied && copiedSection === 'all' ? 'Copied Both!' : 'Copy Answer'}</span>
                  </button>

                  <button
                    onClick={fetchAiOverview}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={onNewSearch}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>New search</span>
                  </button>
                </div>

                {/* Follow-up input form */}
                {showFollowUpInput && (
                  <form onSubmit={handleFollowUpSubmit} className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                    >
                      Ask
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* 3D Knowledge Dimension Jump Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onSelectTab('timeline')}
              className="group text-left rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-slate-900/60 p-4 hover:border-amber-500 hover:bg-amber-500/10 transition shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Past Dimension</span>
                <span className="text-xs text-amber-500 group-hover:translate-x-0.5 transition">→</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">3D Historical Timeline</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Foundational origins, milestones, and breakthroughs</p>
            </button>

            <button
              onClick={() => onSelectTab('future')}
              className="group text-left rounded-2xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-slate-900/60 p-4 hover:border-indigo-500 hover:bg-indigo-500/10 transition shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Future Dimension</span>
                <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition">→</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Probabilistic Scenarios</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2027-2035 forecasts, risk factors & key drivers</p>
            </button>

            <button
              onClick={() => onSelectTab('research')}
              className="group text-left rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-slate-900/60 p-4 hover:border-purple-500 hover:bg-purple-500/10 transition shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Scholarly Dimension</span>
                <span className="text-xs text-purple-400 group-hover:translate-x-0.5 transition">→</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Peer-Reviewed Papers</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Academic citations, DOIs, and verified abstracts</p>
            </button>
          </div>

          {/* WEB SEARCH RESULTS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>Web Results</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-400">
                Verified Web Index
              </span>
            </div>

            {/* Loading Skeletons State */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 space-y-3 animate-pulse">
                    <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : sortedResults.length === 0 ? (
              /* Empty Result State */
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-10 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No results found for "{query}"
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Try searching for keywords like "Quantum Computing", "TypeScript", "Neural Search", or "Autonomous Energy Grids".
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={onBackToHome}
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Return to Homepage
                  </button>
                </div>
              </div>
            ) : (
              /* Result Cards */
              sortedResults.map((item) => {
                const isSaved = savedItemIds.includes(item.id);
                const displayDomain = cleanDomain(item.domain || item.url);
                const displayTitle = cleanTitle(item.title, displayDomain);
                const displaySnippet = cleanSnippet(item.snippet, displayTitle);
                const displayCategory = sanitizeSearchText(item.category || "General");

                // Filter out raw crawler/technical dates
                const rawDate = sanitizeSearchText(item.date || "");
                const displayDate = (/retrieved|archived|indexed|live knowledge|verified record|just now|recently/i.test(rawDate) || !rawDate)
                  ? null
                  : rawDate;

                const isOfficialSite = Boolean(item.isOfficial);

                return (
                  <div
                    key={item.id}
                    className={`group rounded-2xl border p-5 transition-all space-y-3 ${
                      isOfficialSite 
                        ? 'border-cyan-500/40 dark:border-cyan-500/40 bg-gradient-to-br from-cyan-500/[0.04] to-transparent dark:from-cyan-950/25 dark:to-slate-900/60 shadow-xs hover:border-cyan-500/60' 
                        : 'border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-cyan-500/40 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2.5 flex-1">
                        
                        {/* Domain Label Header & Official / Verified Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Domain Badge */}
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${displayDomain}&sz=32`}
                              alt={displayDomain}
                              className="w-4 h-4 object-contain rounded-xs shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                              {displayDomain}
                            </span>
                          </div>

                          {/* Official Badge */}
                          {isOfficialSite && (
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 rounded-md shadow-2xs"
                              aria-label="Official Website"
                            >
                              <BadgeCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                              <span>Official</span>
                            </span>
                          )}

                          {/* Verified Badge */}
                          {item.verified && !isOfficialSite && (
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md"
                              aria-label="Verified Result"
                            >
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>Verified</span>
                            </span>
                          )}

                          {/* 18+ Mature Badge */}
                          {item.isAdult && (
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-md"
                              aria-label="18+ Mature Content"
                            >
                              <Lock className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>18+ Mature</span>
                            </span>
                          )}
                        </div>

                        {/* Strictly Separated Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-[11px] font-medium capitalize text-slate-600 dark:text-slate-300">
                            {displayCategory}
                          </span>
                          {displayDate && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                                {displayDate}
                              </span>
                            </>
                          )}
                          {((currentTab as string) === 'location' || sortBy === 'distance') && (item as any).distanceKm !== undefined && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md text-[11px]">
                                <span>📍 {(item as any).distanceKm} km away</span>
                                <span className="text-slate-400 font-normal">({(item as any).drivingMins} min drive)</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title - Direct Link */}
                        <h4 className="text-base sm:text-lg font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline leading-snug pt-0.5">
                          {item.url && (item.url.startsWith("http://") || item.url.startsWith("https://")) ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500">
                              {displayTitle}
                            </a>
                          ) : (
                            <span onClick={() => setSelectedPreview(item)} className="cursor-pointer hover:text-cyan-500">
                              {displayTitle}
                            </span>
                          )}
                        </h4>

                        {/* Clean Description / Snippet */}
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          {displaySnippet}
                        </p>
                      </div>

                      {/* Clean Actions: Bookmark & Open */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Bookmark Button */}
                        <button
                          onClick={() => onSavePage(item)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isSaved 
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-400' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                          title={isSaved ? "Saved to bookmarks" : "Save result"}
                          aria-label="Save bookmark"
                        >
                          {isSaved ? <Check className="w-4 h-4 text-cyan-500" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {/* Open Destination Button */}
                        {item.url && (item.url.startsWith("http://") || item.url.startsWith("https://")) ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-2xs"
                            title="Open web page directly"
                          >
                            <span className="hidden sm:inline">Open Website</span>
                            <span className="sm:hidden">Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => setSelectedPreview(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-2xs"
                            title="Open page reader"
                          >
                            <span className="hidden sm:inline">Open Website</span>
                            <span className="sm:hidden">Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Bulleted Page Summary Expansion */}
                    {expandedSummaryIds[item.id] && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                        {summarizingIds[item.id] ? (
                          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 dark:bg-cyan-950/20 p-4 space-y-3 animate-pulse">
                            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                              <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
                              <span>Synthesizing concise AI bullet summary for {item.domain}...</span>
                            </div>
                            <div className="h-3 w-3/4 bg-cyan-500/20 rounded" />
                            <div className="h-3 w-5/6 bg-cyan-500/15 rounded" />
                            <div className="h-3 w-2/3 bg-cyan-500/15 rounded" />
                          </div>
                        ) : summaries[item.id] ? (
                          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 via-slate-50/60 to-white dark:from-cyan-950/20 dark:via-slate-900/60 dark:to-slate-900/80 p-4 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                                  <Sparkles className="w-4 h-4" />
                                </span>
                                <div>
                                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    AI Page Summary
                                  </span>
                                  <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                    ANTIQORA Neural Model
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopySummary(item.id, summaries[item.id])}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition"
                                  title="Copy formatted summary"
                                >
                                  {copiedSummaryId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => setExpandedSummaryIds((prev) => ({ ...prev, [item.id]: false }))}
                                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                >
                                  Close
                                </button>
                              </div>
                            </div>

                            {/* Executive 1-Sentence Summary */}
                            {summaries[item.id].summary && (
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                                {summaries[item.id].summary}
                              </p>
                            )}

                            {/* Structured Concise Bullets */}
                            <div className="space-y-2 pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                                <span>Key Page Insights & Bulleted Highlights</span>
                              </span>
                              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                {summaries[item.id].bullets.map((bullet, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          </>
        )}

        </div>

        {/* Sidebar: Desktop Knowledge Panel, Categories & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Desktop Knowledge Entity / Fact Card */}
          <div className="rounded-2xl border border-cyan-500/20 bg-white/90 dark:bg-slate-900/70 p-5 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Knowledge Entity
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                <Check className="w-3 h-3" /> Verified Index
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {query || "Quantum Computing"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Domain overview & verified technical attributes synthesized by ANTIQORA Neural Ranker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Classification</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {intentResult?.intent ? intentResult.intent.toUpperCase() : 'TECHNOLOGY'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Index Depth</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalResults.toLocaleString()} Records</span>
              </div>
            </div>

            {/* Quick AI Interaction Prompt */}
            <button
              onClick={() => onSelectTab('chat')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-xs hover:opacity-95 transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize with ANTIQORA AI</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Filter By Category
            </h4>
            <div className="space-y-1.5 text-xs">
              <button onClick={() => onSelectTab('all')} className={`w-full text-left px-3 py-2 rounded-xl font-semibold border flex items-center justify-between transition ${currentTab === 'all' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'}`}>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-500" />
                  <span>All Web Results</span>
                </div>
                <span>•</span>
              </button>

              <button onClick={() => onSelectTab('websites')} className={`w-full text-left px-3 py-2 rounded-xl font-semibold border flex items-center justify-between transition ${currentTab === 'websites' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'}`}>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Websites & Portals</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Official</span>
              </button>

              <button onClick={() => onSelectTab('apps')} className={`w-full text-left px-3 py-2 rounded-xl font-semibold border flex items-center justify-between transition ${currentTab === 'apps' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'}`}>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Apps & Store Catalog</span>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold">Stores</span>
              </button>

              <button onClick={() => onSelectTab('timeline')} className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/15 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span className="font-medium text-amber-500">3D Historical Timeline</span>
                <span className="text-amber-500">→</span>
              </button>
              <button onClick={() => onSelectTab('future')} className="w-full text-left px-3 py-2 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span className="font-medium text-indigo-400">Future Scenarios & Drivers</span>
                <span className="text-indigo-400">→</span>
              </button>
              <button onClick={() => onSelectTab('research')} className="w-full text-left px-3 py-2 rounded-xl bg-purple-500/5 hover:bg-purple-500/15 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span className="font-medium text-purple-400">Research & Papers</span>
                <span className="text-purple-400">→</span>
              </button>
              <button onClick={() => onSelectTab('compare')} className="w-full text-left px-3 py-2 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span className="font-medium text-emerald-400">Compare Systems</span>
                <span className="text-emerald-400">→</span>
              </button>
              <button onClick={() => onSelectTab('translate')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Translate Knowledge</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('images')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Images</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('news')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>News Intelligence</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('videos')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Videos</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('places')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Places & Maps</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('shopping')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Shopping & Stores</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('chat')} className="w-full text-left px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/30 transition flex items-center justify-between">
                <span>Ask ANTIQORA AI</span>
                <span>✨</span>
              </button>
            </div>
          </div>

          {/* Roadmap Trigger Card */}
          {onOpenRoadmap && (
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Engineering Plan
                </span>
                <span className="text-[10px] text-amber-500 font-bold">Phases 1-3</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                ANTIQORA System Roadmap
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Explore the complete technical roadmap including Apps & Websites search, official domain verification, and real search index architecture.
              </p>
              <button
                onClick={onOpenRoadmap}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Milestone className="w-3.5 h-3.5" />
                <span>View Full Roadmap</span>
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Search Index & Synthesis
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Results are semantically ranked and synthesized with ANTIQORA's neural engine, verified domain databases, and official repository indexes.
            </p>
          </div>
        </div>

      </div>

      {/* Page Preview / Reader Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Page Reader Preview
              </span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedPreview.title}
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                {selectedPreview.domain} • {selectedPreview.category || "General"}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {selectedPreview.snippet}
            </p>

            <div className="flex gap-2">
              {selectedPreview.url && (
                <a
                  href={selectedPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  <span>Visit Destination Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => handleShare(selectedPreview)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                title="Share this page"
                aria-label="Share this preview page"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedPreview(null)}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Copied Link / Shared */}
      {toast && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 text-xs shadow-2xl shadow-emerald-500/15 text-slate-800 dark:text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{toast.message}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                {toast.subtitle || "Link copied to clipboard"}
              </span>
            </p>
            {toast.url && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate font-mono">
                {toast.url}
              </p>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      )}

      {/* 18+ Age Gate Confirmation Modal */}
      <AgeGateModal
        isOpen={showAgeGate}
        query={query}
        onConfirmAdult={handleAgeConfirm}
        onKeepSafeSearch={() => {
          setShowAgeGate(false);
          onSafeSearchToggle?.('strict');
        }}
        onClose={handleAgeDecline}
      />

    </div>
  );
};
