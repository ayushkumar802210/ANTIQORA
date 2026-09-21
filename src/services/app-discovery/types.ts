/**
 * Universal App & Web Search Engine - Canonical Types
 * 
 * Supports dynamic discovery across Google Play, Apple App Store, 
 * Microsoft Store, F-Droid, and verified official developer websites.
 */

export type AppVerificationStatus = 'verified' | 'unverified' | 'flagged' | 'pending';

export type SupportedPlatform = 'Android' | 'iOS' | 'Windows' | 'Web' | 'macOS' | 'Linux';

export interface UniversalAppRecord {
  id: string;
  name: string;
  developer: string;
  category: string;
  description: string;
  platforms: string[]; // ["Android", "iOS", "Windows", "Web", "macOS", "Linux"]
  officialWebsite: string;
  androidUrl: string;
  iosUrl: string;
  windowsUrl: string;
  webUrl: string;
  logo: string;
  countryAvailability: string[];
  languageSupport: string[];
  lastVerified: string;
  verificationStatus: AppVerificationStatus;

  // Extended metadata for ranking, safety, and deep discovery
  confidence?: number;
  verificationMethod?: string;
  developerVerified?: boolean;
  rating?: number;
  reviewsCount?: string;
  downloads?: string;
  price?: string;
  isIndianPriority?: boolean;
  searchAliases?: string[];
  safetyWarning?: string;
  alternateMatches?: { domain: string; name: string; warning: string }[];
  subDestinations?: { title: string; url: string; description?: string }[];
  sourceOrigin?: string;
}

export interface WebsiteResolverResult {
  officialWebsite: string;
  confidence: number;
  verificationMethod: string;
  verified: boolean;
  warning?: string;
  canonicalDomain?: string;
}

export interface AppCategoryItem {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  priorityIndia: boolean;
  sampleQueries: string[];
  count?: number;
}

export interface SearchAppsResponse {
  query: string;
  category?: string;
  country?: string;
  platform?: string;
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
  isLiveDiscovered: boolean;
  executionTimeMs: number;
  results: UniversalAppRecord[];
  verifiedOfficialCard?: UniversalAppRecord | null;
  facets: {
    categories: { name: string; count: number }[];
    platforms: { name: string; count: number }[];
    countries: { name: string; count: number }[];
  };
}

export interface DeveloperRecord {
  id: string;
  name: string;
  verifiedDomain: string;
  countryOfOrigin?: string;
  officialApps: string[];
  verificationBadge: string;
  trustScore: number;
}

export interface DomainVerificationRecord {
  domain: string;
  ownerName: string;
  isOfficial: boolean;
  isKnownApkDistributor: boolean;
  isPhishing: boolean;
  trustScore: number;
  lastAudited: string;
  notes?: string;
}
