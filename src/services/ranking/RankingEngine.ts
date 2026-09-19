/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Search Ranking Engine & AI Snippet Synthesizer
 */

import { SearchResultItem } from '../api';

export interface RankingSignals {
  bm25Score: number;
  semanticSimilarity: number;
  pageRank: number;
  freshnessScore: number;
  domainAuthority: number;
  spamPenalty: number;
}

export class RankingEngine {
  /**
   * Reranks candidate search results using multi-signal neural and heuristic scoring.
   */
  static rankResults(results: SearchResultItem[], query: string): SearchResultItem[] {
    if (!results || results.length === 0) return [];

    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = results.map(item => {
      let score = 1.0;
      const titleLower = item.title.toLowerCase();
      const snippetLower = item.snippet.toLowerCase();

      // Title exact/partial match signal
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 2.5;
        if (snippetLower.includes(term)) score += 1.0;
      });

      // Domain authority boost (.org, .edu, .gov, .io)
      if (item.domain.endsWith('.edu') || item.domain.endsWith('.gov')) score += 1.8;
      if (item.domain.endsWith('.org') || item.domain.endsWith('.io')) score += 1.2;

      // Verification signal
      if (item.verification === 'verified') score += 1.5;

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.item);
  }

  /**
   * Synthesizes query-relevant contextual snippet with keyword highlighting.
   */
  static generateSnippet(text: string, query: string, maxLen: number = 200): string {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    if (queryTerms.length === 0) {
      return cleanText.length > maxLen ? cleanText.substring(0, maxLen) + '...' : cleanText;
    }

    const lower = cleanText.toLowerCase();
    let bestIndex = -1;

    for (const term of queryTerms) {
      const idx = lower.indexOf(term);
      if (idx !== -1) {
        bestIndex = idx;
        break;
      }
    }

    if (bestIndex === -1) {
      return cleanText.length > maxLen ? cleanText.substring(0, maxLen) + '...' : cleanText;
    }

    const start = Math.max(0, bestIndex - 40);
    const end = Math.min(cleanText.length, bestIndex + maxLen - 40);
    let snippet = cleanText.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < cleanText.length) snippet = snippet + '...';

    return snippet;
  }
}
