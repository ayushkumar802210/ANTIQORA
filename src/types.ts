export type TabType = 
  | 'home' 
  | 'all' 
  | 'ai' 
  | 'websites'
  | 'apps'
  | 'images' 
  | 'videos' 
  | 'news' 
  | 'places' 
  | 'location' 
  | 'shopping' 
  | 'github'
  | 'research' 
  | 'research-assistant'
  | 'documents'
  | 'timeline' 
  | 'future' 
  | 'translate' 
  | 'compare' 
  | 'chat';

export type AnswerDepth = 'simple' | 'standard' | 'detailed' | 'expert';

export type ClaimType = 'known_fact' | 'forecast' | 'scenario' | 'speculation';

export type FactVerificationStatus = 
  | 'verified' 
  | 'multiple_sources' 
  | 'disagreement' 
  | 'limited' 
  | 'ai_synthesized';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  title?: string;
  url?: string;
  domain?: string;
  isIncognito?: boolean;
}

export interface TabGroup {
  id: string;
  name: string;
  color?: string;
  tabIds?: string[];
}

export interface BrowserTab {
  id: string;
  title: string;
  url?: string;
  isIncognito: boolean;
  isPinned?: boolean;
  groupId?: string;
  currentTab?: TabType;
  currentSubTab?: TabType;
  query?: string;
  searchQuery?: string;
  activeQuery?: string;
  webResults?: any[];
  totalResults?: number;
  images?: any[];
  news?: any[];
  videos?: any[];
  places?: any[];
  products?: any[];
  githubResults?: any;
  overview3D?: any | null;
  timelineEvents?: any[];
  futureScenarios?: any[];
  intentResult?: any | null;
  websitesResults?: any[];
  appsResults?: any[];
  isSearchLoading?: boolean;
  searchError?: string | null;
  createdAt?: number;
  history?: { query: string; tab: TabType; title?: string; url?: string }[];
  historyStack?: string[];
  historyIndex?: number;
}

export interface ClosedTab {
  id: string;
  title: string;
  url: string;
  query: string;
  tabType: TabType;
  closedAt: number;
  isIncognito: boolean;
}

export interface DownloadItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  downloadedAt: number;
  sourceUrl: string;
  sourceDomain: string;
  status: 'downloading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  folderId?: string;
  addedAt: number;
  icon?: string;
  type?: 'web' | 'image' | 'news' | 'product' | 'research' | 'website' | 'app';
}

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface NewTabCustomization {
  background: 'gradient' | 'minimal' | 'nebula' | 'cyberpunk' | 'cosmic' | 'deepsea';
  theme: 'dark' | 'light' | 'system';
  showShortcuts: boolean;
  showRecentSearches: boolean;
  showBookmarks: boolean;
  showTrending: boolean;
  searchEngine: string;
  showClock: boolean;
  showGreeting: boolean;
  customShortcuts: ShortcutItem[];
}

export type FullPageView =
  | null
  | 'settings'
  | 'history'
  | 'delete-data'
  | 'downloads'
  | 'bookmarks'
  | 'recent-tabs'
  | 'account-sync'
  | 'customize-new-tab'
  | 'help-feedback'
  | 'research-assistant';

export interface SavedItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  type: 'web' | 'image' | 'news' | 'product' | 'research' | 'website' | 'app';
  savedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  safeSearch: boolean;
  language: string;
  defaultDepth: AnswerDepth;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  era: 'past' | 'present' | 'future';
  claimType?: ClaimType;
  category?: string;
  sources?: string[];
  certainty?: number; // 0-100%
}

export interface KnowledgeNode {
  id: string;
  label: string;
  category: 'concept' | 'person' | 'organization' | 'technology' | 'trend' | 'event';
  description: string;
  connections: string[];
}

export interface FutureScenario {
  id: string;
  title: string;
  probability: 'High' | 'Moderate' | 'Speculative';
  timeframe: string;
  keyDrivers: string[];
  uncertainties: string[];
  description: string;
  claimType: ClaimType;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  journal: string;
  abstract: string;
  citationsCount: number;
  doi?: string;
  pdfUrl?: string;
  keyFindings: string[];
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface ComparisonCriterion {
  category: string;
  aspect: string;
  entityAVal: string;
  entityBVal: string;
  verdict: 'A' | 'B' | 'Equal' | 'Different';
}

export interface ComparisonData {
  entityA: string;
  entityB: string;
  summary: string;
  criteria: ComparisonCriterion[];
  recommendation: string;
}

// ----------------------------------------------------
// Apps & Websites Search Models (Phase 2 Roadmap)
// ----------------------------------------------------

export type QueryIntentCategory = 
  | 'website' 
  | 'app' 
  | 'company_platform' 
  | 'online_service' 
  | 'software_product' 
  | 'official_page' 
  | 'general_topic';

export interface DomainVerificationSignal {
  domain: string;
  isOfficial: boolean;
  confidence: number;
  signals: string[];
  registeredOrg?: string;
  warning?: string;
}

export interface OfficialSubDestination {
  title: string;
  url: string;
  description?: string;
}

export interface OfficialWebsiteResult {
  id: string;
  name: string;
  domain: string;
  url: string;
  title: string;
  description: string;
  icon?: string;
  isVerified: boolean;
  verificationBadge: 'Official Website' | 'Verified Platform' | 'Unverified Match' | 'Web Result';
  verificationReason?: string;
  category: string;
  subDestinations?: OfficialSubDestination[];
  safetyWarning?: string;
  isDemo: boolean;
}

export interface AppPlatformAvailability {
  android?: {
    supported: boolean;
    storeUrl: string;
    packageName?: string;
    minVersion?: string;
  };
  ios?: {
    supported: boolean;
    storeUrl: string;
    appId?: string;
    minIos?: string;
  };
  web?: {
    supported: boolean;
    url: string;
  };
  desktop?: {
    supported: boolean;
    url: string;
    os?: string[];
  };
}

export interface AppResult {
  id: string;
  name: string;
  developer: string;
  category: string;
  icon?: string;
  rating?: number;
  reviewsCount?: string;
  downloads?: string;
  lastUpdated?: string;
  platforms: AppPlatformAvailability;
  isVerified: boolean;
  verificationBadge: 'Official App' | 'Verified Developer' | 'Community Submission';
  description: string;
  isDemo: boolean;
}

export interface QueryIntentResult {
  query: string;
  intent: QueryIntentCategory;
  detectedEntity?: string;
  confidence: number;
  officialWebsite?: OfficialWebsiteResult;
  officialApp?: AppResult;
  alternateMatches?: OfficialWebsiteResult[];
  explanation: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'in_progress' | 'planned';
  items: string[];
}
