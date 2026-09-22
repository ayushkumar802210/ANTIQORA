/**
 * In-Memory TTL Cache for Search Results and External Provider Responses.
 * Prevents redundant upstream API calls and optimizes search performance.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SearchCache {
  private store = new Map<string, CacheEntry<any>>();
  private maxEntries = 500;

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlSeconds: number = 600): void {
    // If store grows too large, evict older expired entries
    if (this.store.size >= this.maxEntries) {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.expiresAt) {
          this.store.delete(k);
        }
      }
      if (this.store.size >= this.maxEntries) {
        // Evict the first 50 keys if still full
        let count = 0;
        for (const k of this.store.keys()) {
          this.store.delete(k);
          if (++count >= 50) break;
        }
      }
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}

export const searchCache = new SearchCache();

export const CACHE_TTL = {
  NEWS: 300,        // 5 minutes for rapidly updating news
  VIDEOS: 900,      // 15 minutes for videos
  IMAGES: 1800,     // 30 minutes for image results
  SEARCH: 600,      // 10 minutes for unified search queries
  WIKIPEDIA: 3600,  // 1 hour for stable encyclopedic entries
  AI_OVERVIEW: 1200 // 20 minutes for AI summaries
};
