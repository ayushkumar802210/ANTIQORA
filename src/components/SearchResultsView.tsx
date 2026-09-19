import React, { useState, useEffect } from 'react';
import { SearchResultItem } from '../services/api';
import { generateAIAnswer } from '../services/api';
import { settingsManager } from '../services/settingsManager';
import { GitHubSearchResult } from '../services/providers/GithubSearchProvider';
import { 
  TabType, 
  OfficialWebsiteResult, 
  AppResult, 
  QueryIntentResult 
} from '../types';
import { OfficialDiscoveryCards } from './OfficialDiscoveryCards';
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
  Smartphone,
  Milestone,
  FileText,
  MapPin,
  Newspaper,
  Video,
  ShoppingBag,
  Star,
  Apple,
  Code,
  GitFork,
  GitPullRequest
} from 'lucide-react';

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
  onSavePage: (item: any) => void;
  savedItemIds: string[];
  intentResult?: QueryIntentResult | null;
  websitesResults?: OfficialWebsiteResult[];
  appsResults?: AppResult[];
  githubResults?: GitHubSearchResult;
  onOpenRoadmap?: () => void;
  onOpenDocument?: () => void;
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
  onSavePage,
  savedItemIds,
  intentResult = null,
  websitesResults = [],
  appsResults = [],
  githubResults = { repositories: [], issues: [], totalCount: 0, isRealApi: false },
  onOpenRoadmap,
  onOpenDocument
}) => {
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showFollowUpInput, setShowFollowUpInput] = useState<boolean>(false);
  const [followUpQuery, setFollowUpQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance");
  const [selectedDemoPreview, setSelectedDemoPreview] = useState<SearchResultItem | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; url?: string } | null>(null);

  const handleCopyLink = (item: SearchResultItem) => {
    if (!item.url) return;
    navigator.clipboard.writeText(item.url);
    setCopiedUrlId(item.id);
    setToast({
      message: "Copied!",
      url: item.url
    });

    setTimeout(() => {
      setCopiedUrlId((curr) => (curr === item.id ? null : curr));
    }, 2000);

    setTimeout(() => {
      setToast((curr) => (curr?.url === item.url ? null : curr));
    }, 2800);
  };

  const fetchAiOverview = async () => {
    setLoadingAi(true);
    try {
      const demoSources = [
        { title: "Demo Source 1: ANTIQORA Synthetic Index", domain: "demo.antiqora.internal", url: "https://demo.antiqora.internal/source-1" },
        { title: "Demo Source 2: Technical Knowledge Graph", domain: "demo.research-graph.org", url: "https://demo.research-graph.org/source-2" }
      ];
      const data = await generateAIAnswer(query, demoSources);
      setAiAnswer(data.answer);
      setAiSources(demoSources);
    } catch {
      setAiAnswer(`AI-generated demo answer for "${query}": Key developments in this domain highlight advancements across distributed computation, neural retrieval methods, and verifiable data architectures.`);
      setAiSources([
        { title: "Demo Source 1", domain: "demo-source-1.antiqora.io", url: "#" },
        { title: "Demo Source 2", domain: "demo-source-2.antiqora.io", url: "#" }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchAiOverview();
    }
  }, [query]);

  const handleCopyAnswer = () => {
    if (!aiAnswer) return;
    navigator.clipboard.writeText(aiAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    setLoadingAi(true);
    try {
      const demoSources = [
        { title: "Demo Source 1 (Follow-up)", domain: "demo.antiqora.internal", url: "#" },
        { title: "Demo Source 2 (Follow-up)", domain: "demo.research-graph.org", url: "#" }
      ];
      const data = await generateAIAnswer(`${query} -> Follow-up: ${followUpQuery}`, demoSources);
      setAiAnswer(data.answer);
      setFollowUpQuery("");
      setShowFollowUpInput(false);
    } catch {
      setAiAnswer(`Follow-up demo response: Additional synthesized points for "${followUpQuery}" in relation to "${query}".`);
    } finally {
      setLoadingAi(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'date') {
      return (b.date || "").localeCompare(a.date || "");
    }
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header: Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            About <span className="text-slate-800 dark:text-slate-200 font-semibold">{totalResults}</span> results for <span className="text-cyan-600 dark:text-cyan-400 font-medium">"{query}"</span>
          </span>
        </div>

        {/* Phase 1 Demo Notice Badge & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Phase 1 Prototype • Demo Data Mode</span>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-cyan-500 shadow-sm"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="date">Sort: Recent</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

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

      {/* Top Search Category Pills Bar (ALL, AI, WEBSITES, APPS, IMAGES, VIDEOS, NEWS, MAPS, SHOPPING, RESEARCH, DOCUMENTS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs">
        {[
          { id: 'all' as TabType, label: 'All', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'ai' as TabType, label: 'AI', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'websites' as TabType, label: 'Websites', icon: <Globe className="w-3.5 h-3.5" />, badge: 'Official' },
          { id: 'apps' as TabType, label: 'Apps', icon: <Smartphone className="w-3.5 h-3.5" />, badge: 'Store' },
          { id: 'images' as TabType, label: 'Images', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'videos' as TabType, label: 'Videos', icon: <Video className="w-3.5 h-3.5" /> },
          { id: 'news' as TabType, label: 'News', icon: <Newspaper className="w-3.5 h-3.5" /> },
          { id: 'places' as TabType, label: 'Maps', icon: <MapPin className="w-3.5 h-3.5" /> },
          { id: 'shopping' as TabType, label: 'Shopping', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { id: 'github' as TabType, label: 'GitHub', icon: <Code className="w-3.5 h-3.5" />, badge: 'Repos' },
          { id: 'research' as TabType, label: 'Research', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'documents' as TabType, label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map(cat => {
          const isActive = currentTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.id === 'documents' && onOpenDocument) {
                  onOpenDocument();
                } else {
                  onSelectTab(cat.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-semibold transition flex-shrink-0 border ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/15'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {cat.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Official Digital Discovery Cards: Websites & Apps */}
          <OfficialDiscoveryCards
            intentResult={intentResult}
            onSaveWebsite={onSavePage}
            onSaveApp={onSavePage}
            savedItemIds={savedItemIds}
            filterMode={currentTab === 'websites' ? 'websites' : currentTab === 'apps' ? 'apps' : 'all'}
          />

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

          {/* If currentTab is 'apps', show apps directory */}
          {currentTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Verified Apps & Platform Listings ({appsResults.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Store Verified</span>
              </div>

              {appsResults.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 text-xs">
                  No app listings found for "{query}".
                </div>
              ) : (
                appsResults.map((app) => (
                  <div 
                    key={app.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {app.icon && (
                          <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{app.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              {app.verificationBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">By {app.developer} • {app.category}</p>
                        </div>
                      </div>

                      {app.rating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{app.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{app.description}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {app.platforms.android?.supported && (
                        <a
                          href={app.platforms.android.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-800 transition"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Play</span>
                        </a>
                      )}
                      {app.platforms.ios?.supported && (
                        <a
                          href={app.platforms.ios.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-800 transition"
                        >
                          <Apple className="w-3.5 h-3.5 text-sky-400" />
                          <span>App Store</span>
                        </a>
                      )}
                      {app.platforms.web?.supported && (
                        <a
                          href={app.platforms.web.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-500 transition"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Web App</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Standard Web View Elements (Shown on 'all' or 'ai') */}
          {(currentTab === 'all' || currentTab === 'ai') && (
            <>
              {/* AI ANSWER SECTION ("Ask ANTIQORA") */}
              <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-cyan-500/5 via-white dark:via-slate-900/90 to-white dark:to-slate-950/90 backdrop-blur-xl p-6 shadow-xl shadow-cyan-500/5">
            
            {/* Corner Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-sm">
                  A
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Ask ANTIQORA</span>
                  </h2>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    AI-generated demo answer • Phase 1 Prototype
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Demo AI Synthesis
              </span>
            </div>

            {loadingAi ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Generating AI demo answer for "{query}"...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>

                {/* Sources Section - Clearly labeled as Demo Sources */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Sources (Demo):
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
                    onClick={handleCopyAnswer}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy answer'}</span>
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
                <span>Web Results (Demo Prototype)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                All results are simulated demo data
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
                    No demo results found for "{query}"
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Try searching for one of our pre-indexed demo topics: "Quantum Computing", "TypeScript 7", "Neural Search", or "Autonomous Energy Grids".
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
              /* Result Cards with DEMO RESULT Badge on every card */
              sortedResults.map((item) => {
                const isSaved = savedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-5 hover:border-cyan-500/40 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-all shadow-sm dark:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        
                        {/* Domain & Category & DEMO RESULT Badge */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Demo Result
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {item.domain}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-slate-400 capitalize">
                            {item.category || "General"}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">
                            {item.date || "Demo Index"}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-base sm:text-lg font-semibold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                          {item.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.snippet}
                        </p>
                      </div>

                      {/* Actions: Save, Copy Link & Open Button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(item)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            copiedUrlId === item.id
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40'
                          }`}
                          title={copiedUrlId === item.id ? "URL copied to clipboard" : "Copy link URL"}
                          aria-label={`Copy link for ${item.title}`}
                        >
                          {copiedUrlId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedUrlId === item.id ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        <button
                          onClick={() => onSavePage(item)}
                          className={`p-2 rounded-xl border transition ${
                            isSaved 
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-400' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white'
                          }`}
                          title={isSaved ? "Saved to bookmarks" : "Save result"}
                          aria-label="Save bookmark"
                        >
                          {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {/* Required "Open button" */}
                        <button
                          onClick={() => setSelectedDemoPreview(item)}
                          className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                          title="Open demo page preview"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          </>
        )}

        </div>

        {/* Sidebar: Categories & Shortcuts */}
        <div className="space-y-6">
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
                <span>Images (Demo)</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('news')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>News (Demo)</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('videos')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Videos (Demo)</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('places')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Places (Demo)</span>
                <span className="text-cyan-500">→</span>
              </button>
              <button onClick={() => onSelectTab('shopping')} className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center justify-between">
                <span>Shopping (Demo)</span>
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
              Phase 1 Prototype Notice
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every result displayed is simulated demonstration data. Live search index connectors will be linked in Phase 2 via the server-side API architecture.
            </p>
          </div>
        </div>

      </div>

      {/* Demo Item Preview Modal */}
      {selectedDemoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Demo Result Viewer
              </span>
              <button
                onClick={() => setSelectedDemoPreview(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDemoPreview.title}
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                {selectedDemoPreview.domain} • {selectedDemoPreview.category || "General"}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {selectedDemoPreview.snippet}
            </p>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              In Phase 2, this button will navigate to the live web destination. In Phase 1, all entries are modeled demonstration records.
            </div>

            <button
              onClick={() => setSelectedDemoPreview(null)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close Demo Preview
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Copied Link */}
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
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Link copied to clipboard</span>
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

    </div>
  );
};
