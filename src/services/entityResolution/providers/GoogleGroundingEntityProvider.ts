import { GoogleGenAI } from '@google/genai';
import { 
  PersonEntity, 
  PersonCategory, 
  PersonSportsStats, 
  PersonEntertainmentData, 
  PersonPoliticianData, 
  PersonBusinessData, 
  PersonMusicianData,
  PersonSocialProfile,
  PersonPhotoItem,
  PersonVideoItem,
  PersonNewsItem,
  PersonCareerTimelineItem
} from '../types';

export class GoogleGroundingEntityProvider {
  name = 'Google Grounded Gemini Entity Provider';
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    this.ai = new GoogleGenAI({
      apiKey: apiKey || process.env.GEMINI_API_KEY || 'dummy-key',
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }

  /**
   * Dynamically constructs or enhances a PersonEntity with real-time web facts, stats, verified social profiles, news, photos, and videos.
   */
  async enhancePersonEntity(query: string, baseEntity?: PersonEntity | null): Promise<PersonEntity | null> {
    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    const prompt = `
You are the ANTIQORA Universal Entity Resolution Engine.
Perform deep real-time web research regarding the person or public figure searched in query: "${query}".

Required Output JSON Format:
{
  "fullName": "Full Verified Name",
  "alternateNames": ["Nickname1", "Alias"],
  "profession": "Primary role (e.g. Indian International Cricketer / CEO of Tesla / Grammy-Winning Singer)",
  "primaryCategory": "sports" | "entertainment" | "politics" | "business" | "musician" | "creator" | "science" | "author" | "public_figure",
  "country": "Country of origin/nationality",
  "organizationTeamCompany": "Current team, company, or party name",
  "shortDescription": "2-3 sentence factual concise verified biography.",
  "officialWebsite": "https://official-website-if-available.com",
  "profilePhoto": "Direct high quality image URL or leave empty",
  "socialProfiles": [
    {
      "platform": "instagram" | "x" | "youtube" | "facebook" | "linkedin" | "tiktok",
      "title": "Official Instagram",
      "handle": "@handle",
      "url": "https://...",
      "verificationBadge": "verified" | "unconfirmed",
      "verificationReason": "Official verified handle"
    }
  ],
  "sportsData": {
    "sport": "Cricket / Football / Tennis / Motorsport",
    "position": "Right-handed batsman / Forward",
    "currentTeam": "India / RCB / Real Madrid",
    "previousTeams": ["Team A", "Team B"],
    "jerseyNumber": "18",
    "nationality": "Indian",
    "careerHighlights": ["2011 ICC World Cup Champion", "Most T20I Runs"],
    "stats": [
      { "label": "Test Matches", "value": "113" },
      { "label": "ODI Runs", "value": "13,848" },
      { "label": "ODI Centuries", "value": "50" }
    ],
    "recentMatches": [
      { "date": "Recent", "vs": "Opponent Team", "result": "Won / Top Scorer", "performance": "82 runs (53 balls)" }
    ]
  },
  "entertainmentData": {
    "knownFor": ["Hit Movie 1", "Blockbuster Series"],
    "topMoviesSeries": [
      { "title": "Dune: Part Two", "year": "2024", "role": "Chani" }
    ],
    "awards": ["Emmy Award", "Golden Globe"],
    "upcomingProjects": ["Dune 3", "Euphoria Season 3"]
  },
  "politicianData": {
    "currentOffice": "Prime Minister of India / US Senator",
    "politicalParty": "Bharatiya Janata Party (BJP) / Democratic Party",
    "countryRegion": "India / United States",
    "officialGovernmentUrl": "https://pmindia.gov.in",
    "publicActions": ["G20 Summit Leadership", "Digital India Initiative"]
  },
  "businessData": {
    "company": "Tesla / SpaceX / Apple",
    "role": "CEO & Chief Engineer / Founder",
    "isFounder": true,
    "officialCompanyUrl": "https://tesla.com",
    "knownVentures": ["SpaceX", "Neuralink", "xAI"]
  },
  "musicianData": {
    "genre": "Pop / Synth-Pop / Country",
    "albums": [{ "title": "The Tortured Poets Department", "year": "2024" }],
    "hitSongs": [{ "title": "Cruel Summer", "year": "2023" }],
    "recordLabel": "Republic Records"
  },
  "biographyTimeline": [
    { "id": "bio-1", "year": "Early Life", "title": "Birth & Early Training", "description": "Details about upbringing." },
    { "id": "bio-2", "year": "Breakthrough", "title": "International Debut & Major Achievements", "description": "Career milestone details." }
  ],
  "news": [
    { "id": "n1", "headline": "Latest headline about person", "publisher": "BBC News / ESPN / Reuters", "date": "Just now", "snippet": "Short factual snippet", "url": "https://..." }
  ],
  "relatedEntities": [
    { "name": "Related Figure 1", "role": "Teammate / Co-star / Associate", "entityId": "person:related-figure-1" }
  ]
}

Return ONLY valid JSON.
`;

    for (const model of candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const text = response?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const canonicalId = baseEntity?.entityId || `person:${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          // Combine social profiles to avoid duplicates
          const socialMap = new Map<string, PersonSocialProfile>();
          if (baseEntity?.socialProfiles) {
            baseEntity.socialProfiles.forEach(s => socialMap.set(s.platform, s));
          }
          if (Array.isArray(parsed.socialProfiles)) {
            parsed.socialProfiles.forEach((s: any, idx: number) => {
              if (s.platform && s.url) {
                socialMap.set(s.platform, {
                  id: `soc-g-${s.platform}-${idx}`,
                  platform: s.platform,
                  title: s.title || `Official ${s.platform}`,
                  handle: s.handle || '@official',
                  url: s.url,
                  verificationBadge: s.verificationBadge === 'verified' ? 'verified' : 'unconfirmed',
                  verificationReason: s.verificationReason || 'Grounded via Google Search'
                });
              }
            });
          }

          const enhanced: PersonEntity = {
            entityId: canonicalId,
            fullName: parsed.fullName || baseEntity?.fullName || query,
            alternateNames: parsed.alternateNames || baseEntity?.alternateNames || [],
            profession: parsed.profession || baseEntity?.profession || 'Public Figure',
            primaryCategory: parsed.primaryCategory || baseEntity?.primaryCategory || 'public_figure',
            country: parsed.country || baseEntity?.country || '',
            organizationTeamCompany: parsed.organizationTeamCompany || baseEntity?.organizationTeamCompany || '',
            shortDescription: parsed.shortDescription || baseEntity?.shortDescription || `${query} is a prominent public figure.`,
            profilePhoto: parsed.profilePhoto || baseEntity?.profilePhoto,
            officialWebsite: parsed.officialWebsite || baseEntity?.officialWebsite,
            socialProfiles: Array.from(socialMap.values()),
            sportsData: parsed.sportsData,
            entertainmentData: parsed.entertainmentData,
            politicianData: parsed.politicianData,
            businessData: parsed.businessData,
            musicianData: parsed.musicianData,
            biographyTimeline: parsed.biographyTimeline || baseEntity?.biographyTimeline || [],
            photos: baseEntity?.photos || [],
            videos: baseEntity?.videos || [],
            news: (parsed.news && parsed.news.length > 0) ? parsed.news : (baseEntity?.news || []),
            relatedEntities: parsed.relatedEntities || [],
            confidence: 0.95
          };

          return enhanced;
        }
      } catch (e) {
        // Continue fallback
      }
    }

    return baseEntity || null;
  }
}
