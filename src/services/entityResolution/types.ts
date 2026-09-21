export type PersonCategory = 
  | 'sports' 
  | 'entertainment' 
  | 'politics' 
  | 'business' 
  | 'musician' 
  | 'creator' 
  | 'science' 
  | 'author' 
  | 'public_figure';

export type SocialPlatform = 
  | 'instagram' 
  | 'youtube' 
  | 'x' 
  | 'facebook' 
  | 'linkedin' 
  | 'tiktok' 
  | 'threads' 
  | 'official_website' 
  | 'team_website' 
  | 'company_website';

export type VerificationStatus = 'verified' | 'unconfirmed';

export interface PersonSocialProfile {
  id: string;
  platform: SocialPlatform;
  title: string;
  handle: string;
  url: string;
  verificationBadge: VerificationStatus;
  verificationReason?: string;
  followersCount?: string;
  icon?: string;
}

export interface PersonSportsStats {
  sport: string;
  position?: string;
  currentTeam?: string;
  previousTeams?: string[];
  jerseyNumber?: string;
  nationality?: string;
  careerHighlights?: string[];
  stats?: { label: string; value: string }[];
  recentMatches?: { date: string; vs: string; result: string; performance?: string }[];
  upcomingMatches?: { date: string; vs: string; venue: string }[];
}

export interface PersonEntertainmentData {
  knownFor?: string[];
  topMoviesSeries?: { title: string; year: string; role?: string; url?: string }[];
  awards?: string[];
  upcomingProjects?: string[];
}

export interface PersonPoliticianData {
  currentOffice?: string;
  politicalParty?: string;
  countryRegion?: string;
  officialGovernmentUrl?: string;
  publicActions?: string[];
}

export interface PersonBusinessData {
  company?: string;
  role?: string;
  isFounder?: boolean;
  officialCompanyUrl?: string;
  knownVentures?: string[];
}

export interface PersonMusicianData {
  genre?: string;
  albums?: { title: string; year: string }[];
  hitSongs?: { title: string; year: string; youtubeUrl?: string }[];
  recordLabel?: string;
}

export interface PersonCareerTimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  category?: 'early_life' | 'career' | 'award' | 'education' | 'position';
  source?: string;
}

export interface PersonPhotoItem {
  id: string;
  url: string;
  title: string;
  source: string;
  attribution?: string;
  pageUrl: string;
  dimensions?: string;
  categoryTag?: 'profile' | 'event' | 'sports' | 'press' | 'recent';
}

export interface PersonVideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration?: string;
  date?: string;
  source: string;
}

export interface PersonNewsItem {
  id: string;
  headline: string;
  publisher: string;
  date: string;
  snippet: string;
  url: string;
  thumbnail?: string;
  categoryTag?: 'news' | 'opinion' | 'interview' | 'official';
}

export interface PersonDisambiguationOption {
  entityId: string;
  name: string;
  profession: string;
  country?: string;
  organization?: string;
  shortBio?: string;
  thumbnailUrl?: string;
}

export interface PersonEntity {
  entityId: string; // e.g. "person:virat-kohli"
  fullName: string;
  alternateNames?: string[];
  nicknames?: string[];
  stageNames?: string[];
  aliases?: string[];
  profession: string;
  primaryCategory: PersonCategory;
  country?: string;
  organizationTeamCompany?: string;
  shortDescription: string;
  profilePhoto?: string;
  officialWebsite?: string;
  socialProfiles: PersonSocialProfile[];
  
  // Category-specific details
  sportsData?: PersonSportsStats;
  entertainmentData?: PersonEntertainmentData;
  politicianData?: PersonPoliticianData;
  businessData?: PersonBusinessData;
  musicianData?: PersonMusicianData;
  
  // Career & Biography
  biographyTimeline?: PersonCareerTimelineItem[];
  achievements?: string[];
  
  // Media & News
  photos?: PersonPhotoItem[];
  videos?: PersonVideoItem[];
  news?: PersonNewsItem[];
  
  // Related entities
  relatedEntities?: { name: string; role: string; entityId: string; thumbnail?: string }[];
  
  confidence: number; // 0.0 to 1.0
  isDisambiguationRequired?: boolean;
  disambiguationOptions?: PersonDisambiguationOption[];
}

export interface NormalizedResult {
  id: string;
  title: string;
  url: string;
  source: string;
  type: 'person' | 'web' | 'news' | 'image' | 'video' | 'social';
  image?: string;
  description: string;
  publishedAt?: string;
  author?: string;
  entityId?: string;
  confidence: number;
}

export interface ProviderResponse<T> {
  providerName: string;
  success: boolean;
  data?: T;
  error?: string;
}

export interface EntityProvider {
  name: string;
  resolvePersonEntity(query: string): Promise<PersonEntity | null>;
}

export interface NewsProvider {
  name: string;
  getPersonNews(personName: string): Promise<PersonNewsItem[]>;
}

export interface ImageProvider {
  name: string;
  getPersonPhotos(personName: string): Promise<PersonPhotoItem[]>;
}

export interface VideoProvider {
  name: string;
  getPersonVideos(personName: string): Promise<PersonVideoItem[]>;
}

export interface SocialProfileProvider {
  name: string;
  getSocialProfiles(personName: string, officialSite?: string): Promise<PersonSocialProfile[]>;
}
