/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Real-Time Search Suggestions & Autocomplete Engine
 */

export interface SuggestionItem {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'trending' | 'completion' | 'action';
  category?: string;
  isRecent?: boolean;
}

export interface MatchSegment {
  text: string;
  isMatch: boolean;
}

export const POPULAR_QUERIES: Array<{ text: string; category: string; type: 'popular' | 'trending' }> = [
  { text: 'Quantum Computing Breakthroughs 2026', category: 'AI & Quantum', type: 'trending' },
  { text: 'EV Powertrain Inverter Physics SiC MOSFET', category: 'Engineering', type: 'trending' },
  { text: 'Solid-State Battery Electrolytes Sulfide vs Oxide', category: 'Energy', type: 'trending' },
  { text: 'MATLAB Simulink Microgrid Droop Control', category: 'Simulink', type: 'popular' },
  { text: 'TypeScript 7 Metaprogramming & WebAssembly', category: 'Code', type: 'popular' },
  { text: 'Neural Inverted Index & BM25 Ranking Engine', category: 'Search AI', type: 'popular' },
  { text: 'SpaceX Starship Raptor Engine Telemetry', category: 'Aerospace', type: 'trending' },
  { text: 'Autonomous Energy Microgrids & P2P Grids', category: 'Clean Tech', type: 'popular' },
  { text: 'Wikipedia Research Assistant & Synthesizer', category: 'Research', type: 'popular' },
  { text: 'Artificial Intelligence Agent Workflows', category: 'AI Tools', type: 'trending' },
  { text: 'Superconducting Qubits vs Ion Trap Coherence', category: 'Quantum', type: 'popular' },
  { text: 'Next-Gen WebAssembly SIMD Runtimes', category: 'Code', type: 'popular' },
  { text: 'Deep Learning Transformer Attention Mechanisms', category: 'AI & Quantum', type: 'popular' },
  { text: 'Microgrid Islanding Detection Algorithms', category: 'Engineering', type: 'popular' },
  { text: 'Solar Photovoltaic Maximum Power Point Tracking', category: 'Clean Tech', type: 'popular' },
  { text: 'Global Semiconductor Fabrication Nodes 2nm', category: 'Hardware', type: 'trending' }
];

/**
 * Splits suggestion text into matched and unmatched segments for highlighting.
 */
export function getHighlightedSegments(text: string, query: string): MatchSegment[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [{ text, isMatch: false }];
  }

  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(trimmed);

  if (matchIndex === -1) {
    return [{ text, isMatch: false }];
  }

  const segments: MatchSegment[] = [];
  if (matchIndex > 0) {
    segments.push({ text: text.slice(0, matchIndex), isMatch: false });
  }

  segments.push({
    text: text.slice(matchIndex, matchIndex + trimmed.length),
    isMatch: true
  });

  if (matchIndex + trimmed.length < text.length) {
    segments.push({
      text: text.slice(matchIndex + trimmed.length),
      isMatch: false
    });
  }

  return segments;
}

/**
 * Computes ranked suggestions given the current query, user's recent searches, and server suggestions.
 */
export function computeSuggestions(
  query: string,
  recentSearches: string[] = [],
  serverSuggestions: string[] = []
): SuggestionItem[] {
  const trimmed = query.trim().toLowerCase();

  // If query is empty: show recent searches first + popular trending queries
  if (!trimmed) {
    const items: SuggestionItem[] = [];

    // Recent searches (up to 4)
    recentSearches.slice(0, 4).forEach((r) => {
      items.push({
        id: `recent-${r}`,
        text: r,
        type: 'recent',
        category: 'Recent',
        isRecent: true
      });
    });

    // Popular queries (up to 5)
    POPULAR_QUERIES.slice(0, 5).forEach((p) => {
      if (!recentSearches.includes(p.text)) {
        items.push({
          id: `pop-${p.text}`,
          text: p.text,
          type: p.type,
          category: p.category,
          isRecent: false
        });
      }
    });

    return items;
  }

  const results: SuggestionItem[] = [];
  const seen = new Set<string>();

  // 1. Matching Recent Searches (Prefix matches first, then substring matches)
  const recentPrefixMatches: string[] = [];
  const recentSubstringMatches: string[] = [];

  recentSearches.forEach((r) => {
    const lower = r.toLowerCase();
    if (lower.startsWith(trimmed)) {
      recentPrefixMatches.push(r);
    } else if (lower.includes(trimmed)) {
      recentSubstringMatches.push(r);
    }
  });

  [...recentPrefixMatches, ...recentSubstringMatches].forEach((r) => {
    const lower = r.toLowerCase();
    if (!seen.has(lower)) {
      results.push({
        id: `recent-${r}`,
        text: r,
        type: 'recent',
        category: 'Recent',
        isRecent: true
      });
      seen.add(lower);
    }
  });

  // 2. Server Suggestions (from BM25 index & query dictionary)
  serverSuggestions.forEach((s) => {
    const lower = s.toLowerCase();
    if (!seen.has(lower)) {
      results.push({
        id: `server-${s}`,
        text: s,
        type: 'completion',
        category: 'Suggested',
        isRecent: false
      });
      seen.add(lower);
    }
  });

  // 3. Matching Curated Popular & Trending Queries
  POPULAR_QUERIES.forEach((p) => {
    const lower = p.text.toLowerCase();
    if (!seen.has(lower) && lower.includes(trimmed)) {
      results.push({
        id: `pop-${p.text}`,
        text: p.text,
        type: p.type,
        category: p.category,
        isRecent: false
      });
      seen.add(lower);
    }
  });

  // Limit to maximum 8 suggestions for fast, compact navigation
  return results.slice(0, 8);
}
