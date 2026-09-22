/**
 * Universal Provider-Based Image Search Architecture
 * Server-side orchestrator for multi-provider image retrieval, intent analysis,
 * pagination, deduplication, official source detection, and secure key protection.
 */

export interface ImageResultItem {
  id: string;
  type: "image";
  title?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  sourceName?: string;
  width?: number;
  height?: number;
  publishedAt?: string;
  isOfficial?: boolean;
  metadata?: Record<string, unknown>;

  // Backwards compatibility fields for UI
  domain?: string;
  dimensions?: string;
  caption?: string;
  url?: string;
}

export interface ImageSearchOptions {
  query: string;
  page?: number;
  limit?: number;
  pageToken?: string;
  safeSearch?: 'strict' | 'moderate' | 'off';
  intentCategory?: string;
}

export interface ImageSearchResponse {
  results: ImageResultItem[];
  nextPageToken?: string;
  hasMore: boolean;
  totalEstimate?: number;
  page: number;
  query: string;
}

// In-Memory Short-Term Metadata Cache
const imageMetadataCache = new Map<string, { timestamp: number; data: ImageSearchResponse }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Sanitize and clean domain name from URL
 */
function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return 'web-source';
  }
}

/**
 * Detect Intent & Enhance Query for optimal provider relevance
 */
function analyzeImageQueryIntent(rawQuery: string): { enhancedQuery: string; category: string; isEntity: boolean } {
  const q = rawQuery.trim().toLowerCase();

  // Company / Tech Brand / App
  const companyKeywords = ['company', 'inc', 'corp', 'logo', 'app', 'headquarters', 'official', 'tech', 'brand'];
  if (companyKeywords.some(k => q.includes(k))) {
    return { enhancedQuery: `${rawQuery} official logo product`, category: 'company', isEntity: true };
  }

  // Person / Public Figure
  const personKeywords = ['actor', 'actress', 'reporter', 'journalist', 'ceo', 'president', 'singer', 'artist', 'portrait', 'photo', 'biography'];
  if (personKeywords.some(k => q.includes(k))) {
    return { enhancedQuery: `${rawQuery} portrait photograph`, category: 'person', isEntity: true };
  }

  // Movie / Album / Song / Show
  const mediaKeywords = ['movie', 'poster', 'song', 'album', 'trailer', 'film', 'series', 'artwork', 'cover'];
  if (mediaKeywords.some(k => q.includes(k))) {
    return { enhancedQuery: `${rawQuery} poster artwork official`, category: 'media', isEntity: true };
  }

  // Place / Travel / Attraction
  const placeKeywords = ['city', 'park', 'beach', 'hotel', 'monument', 'map', 'travel', 'resort', 'landmark', 'country'];
  if (placeKeywords.some(k => q.includes(k))) {
    return { enhancedQuery: `${rawQuery} landmark photography high resolution`, category: 'place', isEntity: false };
  }

  // Product / Hardware
  const productKeywords = ['specs', 'review', 'laptop', 'phone', 'headset', 'camera', 'price', 'buy', 'unboxing'];
  if (productKeywords.some(k => q.includes(k))) {
    return { enhancedQuery: `${rawQuery} product photo view`, category: 'product', isEntity: false };
  }

  return { enhancedQuery: rawQuery, category: 'general', isEntity: false };
}

/**
 * Provider 1: Wikipedia PageImages & Wikimedia Commons Search API
 */
async function fetchWikipediaImages(query: string, page: number, limit: number): Promise<ImageResultItem[]> {
  const results: ImageResultItem[] = [];
  const offset = (page - 1) * limit;

  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&gsroffset=${offset}&prop=pageimages|extracts&piprop=original|thumbnail&pithumbsize=1000&format=json&origin=*`;
    const res = await fetch(wikiUrl, { headers: { 'User-Agent': 'AntiqoraImageSearch/2.0' } });
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages || {};
      let idx = 0;
      for (const pid in pages) {
        idx++;
        const p = pages[pid];
        const imgUrl = p.original?.source || p.thumbnail?.source;
        if (imgUrl) {
          const width = p.original?.width || p.thumbnail?.width || 1200;
          const height = p.original?.height || p.thumbnail?.height || 800;
          const isOfficial = idx === 1; // Primary topic match on Wikipedia is marked official
          
          results.push({
            id: `wiki-${pid}-${page}`,
            type: "image",
            title: p.title ? `${p.title} - Wikimedia Photograph` : query,
            imageUrl: imgUrl,
            thumbnailUrl: p.thumbnail?.source || imgUrl,
            sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title || query)}`,
            sourceName: "Wikipedia & Wikimedia",
            width,
            height,
            isOfficial,
            publishedAt: new Date().toISOString(),
            domain: "wikimedia.org",
            dimensions: `${width} x ${height}`,
            caption: p.title,
            url: imgUrl,
            metadata: { pageId: pid, provider: "wikipedia" }
          });
        }
      }
    }
  } catch (e) {
    console.warn("Wikipedia image fetch error:", e);
  }

  // Wikimedia Commons Direct File Search
  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&gsroffset=${offset}&gsrnamespace=6&prop=imageinfo&iiprop=url|dimensions|extmetadata&format=json&origin=*`;
    const cRes = await fetch(commonsUrl, { headers: { 'User-Agent': 'AntiqoraImageSearch/2.0' } });
    if (cRes.ok) {
      const cData = await cRes.json();
      const cPages = cData?.query?.pages || {};
      for (const pid in cPages) {
        const p = cPages[pid];
        const info = p.imageinfo?.[0];
        if (info?.url) {
          const cleanTitle = (p.title || '').replace(/^File:/i, '').replace(/\.(jpg|png|jpeg|webp|svg)/i, '').replace(/_/g, ' ');
          const width = info.width || 1920;
          const height = info.height || 1080;
          
          results.push({
            id: `commons-${pid}-${page}`,
            type: "image",
            title: cleanTitle || query,
            imageUrl: info.url,
            thumbnailUrl: info.url,
            sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title || '')}`,
            sourceName: "Wikimedia Commons",
            width,
            height,
            isOfficial: false,
            publishedAt: info.extmetadata?.DateTime?.value || new Date().toISOString(),
            domain: "commons.wikimedia.org",
            dimensions: `${width} x ${height}`,
            caption: cleanTitle,
            url: info.url,
            metadata: { provider: "wikimedia-commons" }
          });
        }
      }
    }
  } catch (e) {
    console.warn("Wikimedia Commons fetch error:", e);
  }

  return results;
}

/**
 * Provider 2: Openverse Open Media Search API
 */
async function fetchOpenverseImages(query: string, page: number, limit: number): Promise<ImageResultItem[]> {
  const results: ImageResultItem[] = [];
  try {
    const openverseUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page=${page}&page_size=${limit}`;
    const res = await fetch(openverseUrl, { headers: { 'User-Agent': 'AntiqoraImageSearch/2.0' } });
    if (res.ok) {
      const data = await res.json();
      const items = data?.results || [];
      items.forEach((item: any, idx: number) => {
        if (item.url) {
          const sourceHost = extractDomain(item.foreign_landing_url || item.url);
          results.push({
            id: `openverse-${item.id || idx}-${page}`,
            type: "image",
            title: item.title || `${query} Photo`,
            imageUrl: item.url,
            thumbnailUrl: item.thumbnail || item.url,
            sourceUrl: item.foreign_landing_url || item.url,
            sourceName: sourceHost || item.provider || "Openverse",
            width: item.width || 1200,
            height: item.height || 800,
            isOfficial: false,
            domain: sourceHost,
            dimensions: item.width && item.height ? `${item.width} x ${item.height}` : "1200 x 800",
            caption: item.title,
            url: item.url,
            metadata: { license: item.license, provider: item.provider || "openverse" }
          });
        }
      });
    }
  } catch (e) {
    console.warn("Openverse API error:", e);
  }
  return results;
}

/**
 * Provider 3: Unsplash API (Key-based or Public NAPI)
 */
async function fetchUnsplashImages(query: string, page: number, limit: number): Promise<ImageResultItem[]> {
  const results: ImageResultItem[] = [];
  const apiKey = process.env.UNSPLASH_API_KEY || process.env.IMAGE_SEARCH_API_KEY;

  try {
    let endpoint = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`;
    const headers: Record<string, string> = { 'User-Agent': 'AntiqoraImageSearch/2.0' };

    if (apiKey) {
      endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`;
      headers['Authorization'] = `Client-ID ${apiKey}`;
    }

    const res = await fetch(endpoint, { headers });
    if (res.ok) {
      const data = await res.json();
      const photos = data?.results || [];
      photos.forEach((photo: any) => {
        const imgUrl = photo.urls?.regular || photo.urls?.full || photo.urls?.small;
        const thumbUrl = photo.urls?.small || photo.urls?.thumb || imgUrl;
        if (imgUrl) {
          results.push({
            id: `unsplash-${photo.id}-${page}`,
            type: "image",
            title: photo.alt_description || photo.description || `${query} High-Res Photography`,
            imageUrl: imgUrl,
            thumbnailUrl: thumbUrl,
            sourceUrl: photo.links?.html || "https://unsplash.com",
            sourceName: "Unsplash Photography",
            width: photo.width || 1920,
            height: photo.height || 1080,
            isOfficial: false,
            publishedAt: photo.created_at,
            domain: "unsplash.com",
            dimensions: `${photo.width || 1920} x ${photo.height || 1080}`,
            caption: photo.alt_description || photo.description,
            url: imgUrl,
            metadata: { photographer: photo.user?.name, provider: "unsplash" }
          });
        }
      });
    }
  } catch (e) {
    console.warn("Unsplash API error:", e);
  }

  return results;
}

/**
 * Provider 4: Pexels API (Optional Key)
 */
async function fetchPexelsImages(query: string, page: number, limit: number): Promise<ImageResultItem[]> {
  const results: ImageResultItem[] = [];
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey) return results;

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`, {
      headers: { Authorization: pexelsKey, 'User-Agent': 'AntiqoraImageSearch/2.0' }
    });

    if (res.ok) {
      const data = await res.json();
      (data.photos || []).forEach((photo: any) => {
        const imgUrl = photo.src?.large2x || photo.src?.large || photo.src?.medium;
        if (imgUrl) {
          results.push({
            id: `pexels-${photo.id}-${page}`,
            type: "image",
            title: photo.alt || `${query} Photography`,
            imageUrl: imgUrl,
            thumbnailUrl: photo.src?.small || photo.src?.tiny || imgUrl,
            sourceUrl: photo.url || "https://pexels.com",
            sourceName: "Pexels Stock",
            width: photo.width || 1920,
            height: photo.height || 1080,
            isOfficial: false,
            domain: "pexels.com",
            dimensions: `${photo.width || 1920} x ${photo.height || 1080}`,
            caption: photo.alt,
            url: imgUrl,
            metadata: { photographer: photo.photographer, provider: "pexels" }
          });
        }
      });
    }
  } catch (e) {
    console.warn("Pexels API error:", e);
  }

  return results;
}

/**
 * Provider 5: Google Custom Search API (Optional Key)
 */
async function fetchGoogleCustomSearchImages(query: string, page: number, limit: number): Promise<ImageResultItem[]> {
  const results: ImageResultItem[] = [];
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.IMAGE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) return results;

  try {
    const start = (page - 1) * limit + 1;
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&key=${apiKey}&searchType=image&num=${limit}&start=${start}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      (data.items || []).forEach((item: any, idx: number) => {
        if (item.link) {
          const domain = extractDomain(item.image?.contextLink || item.link);
          results.push({
            id: `gsearch-${idx}-${page}`,
            type: "image",
            title: item.title || `${query} Image`,
            imageUrl: item.link,
            thumbnailUrl: item.image?.thumbnailLink || item.link,
            sourceUrl: item.image?.contextLink || item.link,
            sourceName: domain,
            width: item.image?.width || 1200,
            height: item.image?.height || 800,
            isOfficial: domain.includes('official') || domain.includes('gov') || domain.includes('org'),
            domain,
            dimensions: `${item.image?.width || 1200} x ${item.image?.height || 800}`,
            caption: item.snippet,
            url: item.link,
            metadata: { provider: "google-custom-search" }
          });
        }
      });
    }
  } catch (e) {
    console.warn("Google Custom Search error:", e);
  }

  return results;
}

/**
 * Main Search Orchestrator with Deduplication, Normalization, and Pagination
 */
export async function searchImages(options: ImageSearchOptions): Promise<ImageSearchResponse> {
  const rawQuery = (options.query || '').trim();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(40, Math.max(10, options.limit || 20));

  if (!rawQuery) {
    return {
      results: [],
      hasMore: false,
      page,
      query: rawQuery
    };
  }

  // Check In-Memory Short TTL Cache
  const cacheKey = `${rawQuery.toLowerCase()}:${page}:${limit}:${options.safeSearch || 'strict'}`;
  const cached = imageMetadataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const intent = analyzeImageQueryIntent(rawQuery);
  const searchTargetQuery = intent.enhancedQuery;

  // Execute Providers in Parallel
  const providerPromises = [
    fetchWikipediaImages(rawQuery, page, limit),
    fetchOpenverseImages(searchTargetQuery, page, limit),
    fetchUnsplashImages(searchTargetQuery, page, limit),
    fetchPexelsImages(searchTargetQuery, page, limit),
    fetchGoogleCustomSearchImages(searchTargetQuery, page, limit)
  ];

  const settledResults = await Promise.allSettled(providerPromises);
  let combinedResults: ImageResultItem[] = [];

  settledResults.forEach(result => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      combinedResults.push(...result.value);
    }
  });

  // Deduplication by normalized image URL and Title similarity
  const seenUrls = new Set<string>();
  const deduplicatedResults: ImageResultItem[] = [];

  for (const item of combinedResults) {
    if (!item.imageUrl || typeof item.imageUrl !== 'string') continue;

    // Clean URL for comparison
    const cleanUrl = item.imageUrl.trim().split('?')[0].toLowerCase();
    if (seenUrls.has(cleanUrl)) continue;

    seenUrls.add(cleanUrl);

    // Standardize properties
    item.type = "image";
    item.title = item.title || `${rawQuery} Image`;
    item.sourceName = item.sourceName || extractDomain(item.sourceUrl || item.imageUrl);
    item.domain = item.domain || extractDomain(item.sourceUrl || item.imageUrl);
    item.url = item.imageUrl;

    deduplicatedResults.push(item);
  }

  // Ranking: Official / High-resolution images first
  deduplicatedResults.sort((a, b) => {
    if (a.isOfficial && !b.isOfficial) return -1;
    if (!a.isOfficial && b.isOfficial) return 1;
    const resA = (a.width || 0) * (a.height || 0);
    const resB = (b.width || 0) * (b.height || 0);
    return resB - resA;
  });

  const hasMore = deduplicatedResults.length >= 6; // If we obtained a solid set of results from providers, more pages exist
  const nextPageToken = hasMore ? String(page + 1) : undefined;

  const responsePayload: ImageSearchResponse = {
    results: deduplicatedResults,
    nextPageToken,
    hasMore,
    totalEstimate: deduplicatedResults.length * 10,
    page,
    query: rawQuery
  };

  // Cache response metadata
  imageMetadataCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });

  return responsePayload;
}
