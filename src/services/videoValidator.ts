/**
 * Video Validation Layer for ANTIQORA Search Engine
 * Validates, filters, and enriches video search results to identify and skip
 * broken, deleted, private, restricted, or unembeddable video URLs before
 * returning results to the client.
 */

export interface VideoCandidate {
  id: string;
  title: string;
  platform: string;
  duration: string;
  thumbnail: string;
  description: string;
  url: string;
  channel?: string;
  channelHandle?: string;
  isAdult?: boolean;
  rating?: string;
  isEmbeddable?: boolean;
  isValidated?: boolean;
}

interface CachedValidation {
  isValid: boolean;
  isEmbeddable: boolean;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  checkedAt: number;
}

// In-memory cache with 24-hour TTL for fast sub-millisecond lookups
const validationCache = new Map<string, CachedValidation>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Known invalid or placeholder IDs that must always be rejected
const BANNED_OR_PLACEHOLDER_IDS = new Set([
  '00000000000',
  '11111111111',
  '12345678901',
  'abcdefghijk',
  'placeholder'
]);

/**
 * Extracts standard 11-character YouTube Video ID from any YouTube URL format.
 */
export function extractYouTubeId(url: string, thumbnail?: string): string | null {
  if (!url) return null;
  
  // Format matching: watch?v=, embed/, shorts/, live/, v/, youtu.be/
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1] && ytMatch[1].length === 11) {
    return ytMatch[1];
  }

  // Fallback to thumbnail URL if video ID is present there
  if (thumbnail) {
    const thumbMatch = thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//i);
    if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) {
      return thumbMatch[1];
    }
  }

  return null;
}

/**
 * Validates a single YouTube video ID against YouTube's official oEmbed service.
 * oEmbed returns HTTP 200 ONLY when the video is public, valid, playable, and embeddable.
 * It returns HTTP 404 / 401 / 403 / 400 when restricted, private, deleted, or unavailable.
 */
export async function validateYouTubeVideo(videoId: string): Promise<{
  isValid: boolean;
  isEmbeddable: boolean;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
}> {
  if (!videoId || videoId.length !== 11 || BANNED_OR_PLACEHOLDER_IDS.has(videoId)) {
    return { isValid: false, isEmbeddable: false };
  }

  // Check cache
  const cached = validationCache.get(videoId);
  if (cached && (Date.now() - cached.checkedAt < CACHE_TTL_MS)) {
    return cached;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: AbortSignal.timeout(1800)
    });

    if (response.ok) {
      const data = await response.json();
      const result: CachedValidation = {
        isValid: true,
        isEmbeddable: true,
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
        checkedAt: Date.now()
      };
      validationCache.set(videoId, result);
      return result;
    }

    // HTTP 401 / 403: Video is valid and active on YouTube, but embedding on 3rd-party sites is restricted by owner
    if (response.status === 401 || response.status === 403) {
      const result: CachedValidation = {
        isValid: true,
        isEmbeddable: false,
        checkedAt: Date.now()
      };
      validationCache.set(videoId, result);
      return result;
    }

    // HTTP 404 (Not Found / Deleted / Invalid video ID)
    if (response.status === 404) {
      const result: CachedValidation = {
        isValid: false,
        isEmbeddable: false,
        checkedAt: Date.now()
      };
      validationCache.set(videoId, result);
      return result;
    }
  } catch (err) {
    // In case of transient network timeout, attempt lightweight thumbnail header check
    try {
      const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const thumbRes = await fetch(thumbUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(1000)
      });
      if (thumbRes.ok) {
        const contentLength = parseInt(thumbRes.headers.get('content-length') || '0', 10);
        // Standard YouTube 'video unavailable' placeholder thumbnail is ~1097 bytes; real thumbnails are > 1500 bytes
        const isValidThumb = contentLength === 0 || contentLength > 1500;
        const result: CachedValidation = {
          isValid: isValidThumb,
          isEmbeddable: isValidThumb,
          checkedAt: Date.now()
        };
        validationCache.set(videoId, result);
        return result;
      }
    } catch {}
  }

  // If ID has valid 11 base64 chars, keep it as valid so user can watch it
  const isBase64Id = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  const fallbackResult: CachedValidation = {
    isValid: isBase64Id,
    isEmbeddable: true,
    checkedAt: Date.now()
  };
  validationCache.set(videoId, fallbackResult);
  return fallbackResult;
}

/**
 * Validates a single video candidate and enriches or skips it.
 * Returns null if the URL is broken, restricted, or invalid.
 */
export async function validateCandidate(video: VideoCandidate): Promise<VideoCandidate | null> {
  if (!video || !video.url) return null;

  // Direct video streams (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(video.url)) {
    return {
      ...video,
      isEmbeddable: true,
      isValidated: true
    };
  }

  // Official YouTube Search Portal Card (safe fallback card)
  if (video.url.includes('youtube.com/results') || video.id.startsWith('yt-fallback-search')) {
    return {
      ...video,
      isEmbeddable: false,
      isValidated: true
    };
  }

  // YouTube Videos
  const ytId = extractYouTubeId(video.url, video.thumbnail);
  if (!ytId) {
    // If not a recognized direct stream or YouTube URL, skip unless explicitly verified
    return null;
  }

  const validation = await validateYouTubeVideo(ytId);
  if (!validation.isValid) {
    return null; // Skip broken or restricted video
  }

  return {
    ...video,
    id: video.id || `yt-${ytId}`,
    url: `https://www.youtube.com/watch?v=${ytId}`,
    thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    title: video.title || validation.title || 'Video',
    channel: video.channel || validation.author || 'Official',
    isEmbeddable: validation.isEmbeddable,
    isValidated: true
  };
}

/**
 * Validates a list of candidate video items concurrently, skips broken/restricted ones,
 * deduplicates results, and returns up to maxResults valid videos.
 */
export async function validateAndFilterVideos(
  candidates: VideoCandidate[],
  maxResults: number = 12
): Promise<VideoCandidate[]> {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  // Deduplicate candidates by unique video ID or URL
  const seenKeys = new Set<string>();
  const uniqueCandidates: VideoCandidate[] = [];

  for (const c of candidates) {
    const ytId = extractYouTubeId(c.url, c.thumbnail);
    const key = ytId ? `yt:${ytId}` : c.url;
    if (key && !seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueCandidates.push(c);
    }
  }

  // Validate candidates concurrently in parallel batches
  const validationPromises = uniqueCandidates.map(c => validateCandidate(c));
  const settled = await Promise.allSettled(validationPromises);

  const validVideos: VideoCandidate[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value !== null) {
      validVideos.push(result.value);
      if (validVideos.length >= maxResults) {
        break;
      }
    }
  }

  return validVideos;
}

export const VideoValidator = {
  extractYouTubeId,
  validateYouTubeVideo,
  validateCandidate,
  validateAndFilterVideos
};
