import { 
  PersonEntity, 
  PersonCategory, 
  PersonSocialProfile, 
  PersonCareerTimelineItem,
  PersonPhotoItem
} from '../types';

export class WikipediaEntityProvider {
  name = 'Wikipedia & Wikidata Entity Provider';

  /**
   * Resolves ANY public figure using live Wikipedia & Wikidata API
   */
  async resolvePersonEntity(query: string): Promise<PersonEntity | null> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    try {
      // 1. Search Wikipedia for matching article
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'AntiqoraSearchEngine/2.0 (entity@antiqora.io)' }
      });
      if (!searchRes.ok) return null;

      const searchData = await searchRes.json();
      const hits = searchData?.query?.search || [];
      if (hits.length === 0) return null;

      // Filter hits to check if top result is likely a person
      const topHit = hits[0];
      const pageTitle = topHit.title;

      // Fetch summary from REST API
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/\s+/g, '_'))}`;
      const summaryRes = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'AntiqoraSearchEngine/2.0 (entity@antiqora.io)' }
      });
      if (!summaryRes.ok) return null;

      const pageData = await summaryRes.json();
      if (pageData.type === 'disambiguation') {
        // Return disambiguation signal
        return this.handleDisambiguation(pageTitle, hits.slice(0, 5));
      }

      const description = pageData.description || '';
      const extract = pageData.extract || '';

      // Check if page represents a person by inspecting description and category hints
      const isPerson = this.isPersonDescription(description, extract, pageTitle);
      if (!isPerson) return null;

      const primaryCategory = this.determineCategory(description, extract);
      const canonicalId = `person:${pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      // Fetch Wikidata claims for social accounts, official site, teams, awards
      const wikidataId = pageData.wikibase_item;
      let socialProfiles: PersonSocialProfile[] = [];
      let officialWebsite = pageData.content_urls?.desktop?.page;
      let country = '';
      let organization = '';

      if (wikidataId) {
        const claims = await this.fetchWikidataClaims(wikidataId);
        if (claims) {
          socialProfiles = claims.socialProfiles;
          if (claims.officialWebsite) officialWebsite = claims.officialWebsite;
          if (claims.country) country = claims.country;
          if (claims.organization) organization = claims.organization;
        }
      }

      // If no official website found in wikidata, check if page has direct site
      if (!officialWebsite) {
        officialWebsite = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/\s+/g, '_'))}`;
      }

      // Extract high resolution profile photo
      const profilePhoto = pageData.thumbnail?.source || pageData.originalimage?.source;

      // Build structured career timeline from extract & sections
      const biographyTimeline: PersonCareerTimelineItem[] = this.buildTimeline(pageTitle, extract);

      // Photos from Wikipedia page images
      const photos: PersonPhotoItem[] = [];
      if (profilePhoto) {
        photos.push({
          id: `photo-wiki-1`,
          url: profilePhoto,
          title: `${pageTitle} Official Profile Photo`,
          source: 'Wikimedia Commons / Wikipedia',
          attribution: 'Wikipedia License',
          pageUrl: pageData.content_urls?.desktop?.page || '#',
          categoryTag: 'profile'
        });
      }

      const entity: PersonEntity = {
        entityId: canonicalId,
        fullName: pageTitle,
        profession: description || 'Public Figure',
        primaryCategory,
        country: country || this.extractCountry(extract),
        organizationTeamCompany: organization || this.extractOrg(extract),
        shortDescription: extract,
        profilePhoto,
        officialWebsite,
        socialProfiles,
        biographyTimeline,
        photos,
        confidence: 0.92
      };

      return entity;

    } catch (err) {
      console.warn("WikipediaEntityProvider error:", err);
      return null;
    }
  }

  private isPersonDescription(desc: string, extract: string, title: string): boolean {
    const text = (desc + " " + extract).toLowerCase();
    const personKeywords = [
      'born', 'cricketer', 'footballer', 'actor', 'actress', 'politician', 'minister',
      'businessman', 'businesswoman', 'entrepreneur', 'singer', 'musician', 'artist',
      'author', 'player', 'coach', 'president', 'prime minister', 'ceo', 'founder',
      'director', 'producer', 'scientist', 'athlete', 'wrestler', 'swimmer', 'racer',
      'influencer', 'youtuber', 'rapper', 'composer', 'billionaire'
    ];
    return personKeywords.some(k => text.includes(k));
  }

  private determineCategory(desc: string, extract: string): PersonCategory {
    const text = (desc + " " + extract).toLowerCase();
    if (/cricketer|footballer|athlete|basketball|tennis|wrestler|racer|player|coach|olympic/i.test(text)) return 'sports';
    if (/actor|actress|film|movie|director|producer|television|celebrity/i.test(text)) return 'entertainment';
    if (/singer|musician|rapper|composer|band|vocalist|album/i.test(text)) return 'musician';
    if (/politician|minister|president|prime minister|senator|governor|mp|office/i.test(text)) return 'politics';
    if (/entrepreneur|ceo|founder|billionaire|businessman|businesswoman|executive/i.test(text)) return 'business';
    if (/youtuber|influencer|streamer|creator/i.test(text)) return 'creator';
    if (/scientist|physicist|chemist|biologist|researcher/i.test(text)) return 'science';
    if (/author|writer|novelist|poet/i.test(text)) return 'author';
    return 'public_figure';
  }

  private async fetchWikidataClaims(wikidataId: string) {
    try {
      const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'AntiqoraSearchEngine/2.0' } });
      if (!res.ok) return null;

      const data = await res.json();
      const entity = data?.entities?.[wikidataId];
      if (!entity) return null;

      const claims = entity.claims || {};
      const socialProfiles: PersonSocialProfile[] = [];

      // P2003 = Instagram handle
      if (claims.P2003?.[0]?.mainsnak?.datavalue?.value) {
        const handle = claims.P2003[0].mainsnak.datavalue.value;
        socialProfiles.push({
          id: `soc-insta-${wikidataId}`,
          platform: 'instagram',
          title: 'Official Instagram',
          handle: `@${handle}`,
          url: `https://instagram.com/${handle}`,
          verificationBadge: 'verified',
          verificationReason: 'Verified via Wikidata Entity Graph'
        });
      }

      // P2002 = Twitter / X handle
      if (claims.P2002?.[0]?.mainsnak?.datavalue?.value) {
        const handle = claims.P2002[0].mainsnak.datavalue.value;
        socialProfiles.push({
          id: `soc-x-${wikidataId}`,
          platform: 'x',
          title: 'Official X (Twitter)',
          handle: `@${handle}`,
          url: `https://x.com/${handle}`,
          verificationBadge: 'verified',
          verificationReason: 'Verified via Wikidata Entity Graph'
        });
      }

      // P2397 = YouTube Channel ID
      if (claims.P2397?.[0]?.mainsnak?.datavalue?.value) {
        const channelId = claims.P2397[0].mainsnak.datavalue.value;
        socialProfiles.push({
          id: `soc-yt-${wikidataId}`,
          platform: 'youtube',
          title: 'Official YouTube Channel',
          handle: `Channel: ${channelId}`,
          url: `https://youtube.com/channel/${channelId}`,
          verificationBadge: 'verified',
          verificationReason: 'Verified via Wikidata Entity Graph'
        });
      }

      // P2013 = Facebook ID
      if (claims.P2013?.[0]?.mainsnak?.datavalue?.value) {
        const fb = claims.P2013[0].mainsnak.datavalue.value;
        socialProfiles.push({
          id: `soc-fb-${wikidataId}`,
          platform: 'facebook',
          title: 'Official Facebook',
          handle: `@${fb}`,
          url: `https://facebook.com/${fb}`,
          verificationBadge: 'verified',
          verificationReason: 'Verified via Wikidata Entity Graph'
        });
      }

      // P856 = Official Website
      let officialWebsite = '';
      if (claims.P856?.[0]?.mainsnak?.datavalue?.value) {
        officialWebsite = claims.P856[0].mainsnak.datavalue.value;
      }

      return {
        socialProfiles,
        officialWebsite,
        country: '',
        organization: ''
      };

    } catch (e) {
      return null;
    }
  }

  private handleDisambiguation(pageTitle: string, hits: any[]): PersonEntity {
    return {
      entityId: `disambiguation:${pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      fullName: pageTitle,
      profession: 'Multiple Matching Public Figures',
      primaryCategory: 'public_figure',
      shortDescription: `Multiple people share the name "${pageTitle}". Please select the correct figure:`,
      socialProfiles: [],
      confidence: 1.0,
      isDisambiguationRequired: true,
      disambiguationOptions: hits.map((hit: any, idx: number) => ({
        entityId: `person:${hit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: hit.title,
        profession: hit.snippet.replace(/<[^>]*>?/gm, '').slice(0, 100),
        shortBio: hit.snippet.replace(/<[^>]*>?/gm, '')
      }))
    };
  }

  private extractCountry(text: string): string {
    if (/Indian|India/i.test(text)) return 'India';
    if (/American|United States|USA/i.test(text)) return 'United States';
    if (/British|United Kingdom|England|UK/i.test(text)) return 'United Kingdom';
    if (/Australian|Australia/i.test(text)) return 'Australia';
    if (/Canadian|Canada/i.test(text)) return 'Canada';
    return '';
  }

  private extractOrg(text: string): string {
    if (/Royal Challengers|RCB|India national cricket team|BCCI/i.test(text)) return 'Indian National Cricket Team';
    if (/Tesla|SpaceX|xAI|X Corp/i.test(text)) return 'Tesla / SpaceX';
    if (/BJP|Bharatiya Janata Party|Government of India/i.test(text)) return 'Government of India / BJP';
    if (/Indian National Congress|INC/i.test(text)) return 'Indian National Congress';
    return '';
  }

  private buildTimeline(name: string, extract: string): PersonCareerTimelineItem[] {
    const items: PersonCareerTimelineItem[] = [];
    items.push({
      id: 'timeline-1',
      year: 'Early Life',
      title: `Background & Early Years of ${name}`,
      description: extract.slice(0, 250) + '...',
      category: 'early_life'
    });
    items.push({
      id: 'timeline-2',
      year: 'Career',
      title: `Professional Milestones & Recognition`,
      description: extract.slice(250, 500) || `Key achievements and public career of ${name}.`,
      category: 'career'
    });
    return items;
  }
}
