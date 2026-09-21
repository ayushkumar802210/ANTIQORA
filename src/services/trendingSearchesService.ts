/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Trending Searches & Query Frequency Analytics Engine
 */

import { SearchHistoryItem } from '../types';

export interface TrendingSearchItem {
  id: string;
  query: string;
  count: number;
  lastUsed: number;
  isHot?: boolean;
  category?: string;
}

export interface DeriveTrendingOptions {
  recentSearches?: string[];
  historyItems?: SearchHistoryItem[];
  limit?: number;
  includeBaselineSeeds?: boolean;
}

const STORAGE_KEY_USAGE = 'antiqora_query_usage_counts';

/**
 * Baseline curated topics to seed trending searches when user history is new or sparse.
 */
export const BASELINE_TRENDING_SEEDS: Array<{ query: string; baseCount: number; category: string }> = [
  { query: 'Quantum Computing Breakthroughs', baseCount: 6, category: 'Quantum' },
  { query: 'PhonePe UPI Instant Pay', baseCount: 5, category: 'Finance' },
  { query: 'Neural BM25 Search Engine', baseCount: 4, category: 'AI' },
  { query: 'TypeScript 7 Features', baseCount: 4, category: 'Code' },
  { query: 'Autonomous Energy Microgrids', baseCount: 3, category: 'Engineering' },
  { query: 'Canva Design Studio', baseCount: 3, category: 'Tools' },
  { query: 'Zomato Food Delivery', baseCount: 2, category: 'Lifestyle' },
  { query: 'ChatGPT AI Reasoning', baseCount: 2, category: 'AI' }
];

class TrendingSearchesService {
  private usageMap: Map<string, { query: string; count: number; lastUsed: number }>;
  private listeners: Set<(items: TrendingSearchItem[]) => void> = new Set();

  constructor() {
    this.usageMap = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.entries(parsed).forEach(([key, val]: [string, any]) => {
            if (val && typeof val.count === 'number') {
              this.usageMap.set(key.toLowerCase(), {
                query: val.query || key,
                count: Number(val.count) || 1,
                lastUsed: Number(val.lastUsed) || Date.now()
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load query usage counts from localStorage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, { query: string; count: number; lastUsed: number }> = {};
      this.usageMap.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save query usage counts to localStorage', e);
    }
  }

  /**
   * Records query execution in the internal usage counter.
   */
  public recordQueryUsage(query: string, timestamp: number = Date.now()): void {
    const trimmed = (query || '').trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();

    const existing = this.usageMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.lastUsed = timestamp;
      existing.query = trimmed; // Update to latest casing
    } else {
      this.usageMap.set(key, {
        query: trimmed,
        count: 1,
        lastUsed: timestamp
      });
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Derives a ranked 'trendingSearches' list by synthesizing:
   * 1. The internal persistent usage counter
   * 2. The recentSearches state (with position weighting)
   * 3. Any explicit SearchHistoryItem records
   * 4. Baseline trending seeds (if total data is sparse)
   */
  public deriveTrendingSearches(options: DeriveTrendingOptions = {}): TrendingSearchItem[] {
    const {
      recentSearches = [],
      historyItems = [],
      limit = 8,
      includeBaselineSeeds = true
    } = options;

    const aggregateMap = new Map<string, { query: string; count: number; lastUsed: number; category?: string }>();

    // 1. Incorporate persistent internal usage counters
    this.usageMap.forEach((val, key) => {
      aggregateMap.set(key, { ...val });
    });

    // 2. Incorporate explicit SearchHistoryItems from state or localStorage
    let allHistory: SearchHistoryItem[] = historyItems;
    if (allHistory.length === 0 && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('antiqora_history_items');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) allHistory = parsed;
        }
      } catch {}
    }

    allHistory.forEach(item => {
      const q = (item.query || '').trim();
      if (!q) return;
      const key = q.toLowerCase();
      const ts = Number(item.timestamp) || Date.now();
      const existing = aggregateMap.get(key);
      if (existing) {
        existing.count += 1;
        if (ts > existing.lastUsed) {
          existing.lastUsed = ts;
          existing.query = q;
        }
      } else {
        aggregateMap.set(key, {
          query: q,
          count: 1,
          lastUsed: ts
        });
      }
    });

    // 3. Incorporate recentSearches state
    recentSearches.forEach((r, idx) => {
      const q = (r || '').trim();
      if (!q) return;
      const key = q.toLowerCase();
      const existing = aggregateMap.get(key);
      // Give additional recency weight based on proximity to top of recent searches
      const recencyBoost = Math.max(1, 3 - Math.floor(idx / 3));
      if (existing) {
        existing.count += recencyBoost;
      } else {
        aggregateMap.set(key, {
          query: q,
          count: recencyBoost,
          lastUsed: Date.now() - (idx * 60000)
        });
      }
    });

    // 4. If fewer than 4 unique queries, backfill with baseline seeds
    if (includeBaselineSeeds && aggregateMap.size < 4) {
      BASELINE_TRENDING_SEEDS.forEach(seed => {
        const key = seed.query.toLowerCase();
        if (!aggregateMap.has(key)) {
          aggregateMap.set(key, {
            query: seed.query,
            count: seed.baseCount,
            lastUsed: 0,
            category: seed.category
          });
        }
      });
    }

    // 5. Sort by frequency count (descending), breaking ties by lastUsed timestamp
    const sorted: TrendingSearchItem[] = Array.from(aggregateMap.entries())
      .map(([id, data]) => ({
        id,
        query: data.query,
        count: data.count,
        lastUsed: data.lastUsed,
        category: data.category
      }))
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, limit);

    // Identify top hot items
    if (sorted.length > 0) {
      sorted[0].isHot = true;
    }

    return sorted;
  }

  /**
   * Fetches dynamic top queries based on usage counters and search history.
   */
  public getTopQueries(options?: DeriveTrendingOptions | number): TrendingSearchItem[] {
    if (typeof options === 'number') {
      return this.deriveTrendingSearches({ limit: options });
    }
    return this.deriveTrendingSearches(options);
  }

  /**
   * Clears internal usage counters
   */
  public clearUsage(): void {
    this.usageMap.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USAGE);
    }
    this.notifyListeners();
  }

  public subscribe(listener: (items: TrendingSearchItem[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const derived = this.deriveTrendingSearches();
    this.listeners.forEach(fn => fn(derived));
  }
}

export const trendingSearchesService = new TrendingSearchesService();
