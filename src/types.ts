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
  | 'shopping' 
  | 'github'
  | 'research' 
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
}

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
  verificationBadge: 'Official Website' | 'Verified Platform' | 'Unverified Match';
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
