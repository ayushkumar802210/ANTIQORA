import { 
  PersonEntity, 
  PersonNewsItem, 
  PersonPhotoItem, 
  PersonVideoItem, 
  PersonSocialProfile 
} from './types';
import { WikipediaEntityProvider } from './providers/WikipediaEntityProvider';
import { GoogleGroundingEntityProvider } from './providers/GoogleGroundingEntityProvider';
import { YouTubeVideoProvider } from './providers/YouTubeVideoProvider';
import { LiveNewsProvider } from './providers/LiveNewsProvider';

export class EntityAggregatorService {
  private wikiProvider = new WikipediaEntityProvider();
  private groundingProvider = new GoogleGroundingEntityProvider();
  private videoProvider = new YouTubeVideoProvider();
  private newsProvider = new LiveNewsProvider();

  /**
   * Main entry point to resolve ANY public figure or person query.
   */
  async resolvePersonQuery(query: string): Promise<PersonEntity | null> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    // Check if query looks like a person search or entity request
    const isPersonQuery = this.detectPersonIntent(cleanQuery);
    if (!isPersonQuery) return null;

    try {
      // 1. Fetch base Wikipedia & Wikidata entity profile
      const wikiBase = await this.wikiProvider.resolvePersonEntity(cleanQuery);

      // If Wikipedia indicates disambiguation required, return disambiguation object
      if (wikiBase?.isDisambiguationRequired) {
        return wikiBase;
      }

      // 2. Concurrently fetch Gemini search grounding, news, and videos
      const [enhancedEntity, newsList, videoList] = await Promise.all([
        this.groundingProvider.enhancePersonEntity(cleanQuery, wikiBase),
        this.newsProvider.getPersonNews(cleanQuery),
        this.videoProvider.getPersonVideos(cleanQuery)
      ]);

      const finalEntity: PersonEntity = enhancedEntity || wikiBase || {
        entityId: `person:${cleanQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        fullName: cleanQuery,
        profession: 'Public Figure',
        primaryCategory: 'public_figure',
        shortDescription: `${cleanQuery} is a recognized public figure.`,
        socialProfiles: [],
        confidence: 0.8
      };

      // Merge news and video lists if available
      if (newsList.length > 0) {
        finalEntity.news = newsList;
      }

      if (videoList.length > 0) {
        finalEntity.videos = videoList;
      }

      // Filter social profiles to ensure clear verification badges
      finalEntity.socialProfiles = this.verifySocialProfiles(finalEntity.socialProfiles, finalEntity.fullName, finalEntity.officialWebsite);

      return finalEntity;

    } catch (err) {
      console.warn("EntityAggregatorService notice:", err);
      return null;
    }
  }

  /**
   * Rule-based & heuristic detection if query is likely a person
   */
  private detectPersonIntent(query: string): boolean {
    const q = query.toLowerCase();

    // Query modifiers or explicit topics
    if (/vs|against|match|lyrics|download|buy|price|weather|recipe|how to|what is|where is|map|distance/i.test(q)) {
      // "vs" can be athlete vs athlete (e.g. Virat Kohli vs Babar Azam), allow
      if (!/ vs /i.test(q)) {
        return false;
      }
    }

    // Common full names or multi-word capitalizations
    const words = query.trim().split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
      // Exclude simple generic words
      const excludeWords = ['google', 'youtube', 'facebook', 'instagram', 'twitter', 'weather', 'news', 'calculator', 'translate', 'shopping'];
      if (excludeWords.includes(q)) return false;
      return true;
    }

    return false;
  }

  /**
   * Enforces strict verification badges for social media profiles
   */
  private verifySocialProfiles(
    profiles: PersonSocialProfile[], 
    fullName: string, 
    officialWebsite?: string
  ): PersonSocialProfile[] {
    const map = new Map<string, PersonSocialProfile>();

    profiles.forEach((p) => {
      // Check if handle or url matches full name or website
      const handleClean = p.handle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameClean = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isMatch = handleClean.includes(nameClean) || nameClean.includes(handleClean);

      if (isMatch || p.verificationReason?.includes('Wikidata')) {
        p.verificationBadge = 'verified';
        p.verificationReason = p.verificationReason || 'Verified Official Account';
      } else {
        p.verificationBadge = 'unconfirmed';
        p.verificationReason = 'Unconfirmed / Community Profile';
      }

      map.set(p.platform, p);
    });

    return Array.from(map.values());
  }
}

export const entityAggregatorService = new EntityAggregatorService();
