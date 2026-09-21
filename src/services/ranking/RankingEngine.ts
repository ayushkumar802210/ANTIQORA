/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Search Ranking Engine & AI Snippet Synthesizer
 */

import { SearchResultItem } from '../api';
import { safeParse, Tab, isTabArray } from '../storageUtils';

export { safeParse, isTabArray };
export type { Tab };

export type SearchDocument = {
  id: string;
  title: string;
  content: string;
  bm25Score: number;
  popularityScore: number;
  freshnessScore: number;
  combinedScore: number;
};

export function calculateCombinedScore(
  bm25: number,
  popularity: number,
  freshness: number
): number {
  return (
    bm25 * 0.7 +
    popularity * 0.2 +
    freshness * 0.1
  );
}

export function tokenize(text: string): string[] {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase()
    .match(/[\p{L}\p{M}\p{N}]+(?:[-'][\p{L}\p{M}\p{N}]+)*/gu)
    ?? [];
}

export function sortSearchDocuments(results: SearchDocument[]): SearchDocument[] {
  results.sort((a, b) => b.bm25Score - a.bm25Score);
  results.sort(
    (a, b) => b.combinedScore - a.combinedScore
  );
  return results;
}

export function matchesFilter(
  document: SearchDocument,
  filter: string
): boolean {
  switch (filter) {
    case "fresh":
      return document.freshnessScore >= 0.7;

    case "popular":
      return document.popularityScore >= 0.7;

    default:
      return true;
  }
}

let documentStore: SearchDocument[] = [];

export function setDocumentStore(docs: SearchDocument[]) {
  documentStore = docs;
}

export function getMatchingDocuments(tokens: string[]): SearchDocument[] {
  if (documentStore.length === 0) return [];
  return documentStore.filter(doc => {
    const text = `${doc.title} ${doc.content}`.toLowerCase();
    return tokens.some(token => text.includes(token.toLowerCase()));
  });
}

export function search(
  query: string,
  filter?: string
): SearchDocument[] {
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    return [];
  }

  let results = getMatchingDocuments(tokens);

  if (filter) {
    results = results.filter(doc =>
      matchesFilter(doc, filter)
    );
  }

  results = results.map(doc => ({
    ...doc,
    combinedScore: calculateCombinedScore(
      doc.bm25Score,
      doc.popularityScore,
      doc.freshnessScore
    ),
  }));

  return results.sort(
    (a, b) => b.combinedScore - a.combinedScore
  );
}

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
