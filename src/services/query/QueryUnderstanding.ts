/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Query Understanding, Intent Classifier & Autocomplete Trie Engine
 */

export interface QueryIntent {
  rawQuery: string;
  normalizedQuery: string;
  correctedSpelling?: string;
  detectedLanguage: 'en' | 'hi' | 'hinglish';
  primaryIntent: 'web' | 'code' | 'news' | 'maps' | 'shopping' | 'qa' | 'app';
  suggestedAppSlug?: string;
  expandedKeywords: string[];
}

export class QueryUnderstandingService {
  private static dictionary = [
    'quantum computing', 'quantum computing breakthroughs', 'quantum supremacy', 'quantum algorithms',
    'electric vehicle', 'ev powertrain inverter physics', 'ev matlab simulation', 'electrical engineering',
    'solid state battery electrolytes', 'matlab simulink microgrid control', 'matlab simulink',
    'typescript 7 metaprogramming', 'typescript', 'react', 'next js', 'vite', 'webassembly runtimes',
    'neural search engine architecture', 'inverted index bm25 ranking', 'artificial intelligence',
    'ai search engine', 'spacex starship telemetry raptor', 'autonomous energy microgrids',
    'wikipedia research assistant', 'google maps', 'youtube', 'github', 'instagram',
    'facebook', 'whatsapp web', 'linkedin', 'reddit', 'wikipedia'
  ];

  /**
   * Normalizes query and detects user intent across English, Hindi, and Hinglish.
   */
  static analyzeQuery(query: string): QueryIntent {
    const raw = (query || '').trim();
    const lower = raw.toLowerCase();

    // Hinglish & Hindi detection
    let detectedLanguage: 'en' | 'hi' | 'hinglish' = 'en';
    if (/[\u0900-\u097F]/.test(raw)) {
      detectedLanguage = 'hi';
    } else if (/\b(dikhao|batao|kya|kaise|ke baare mein|mujhe|chahiye)\b/i.test(lower)) {
      detectedLanguage = 'hinglish';
    }

    // Hinglish normalization mapping
    let normalized = lower
      .replace(/\bke baare mein batao\b/gi, 'about')
      .replace(/\bdikhao\b/gi, '')
      .replace(/\bchahiye\b/gi, '')
      .replace(/\bmujhe\b/gi, '');

    // Intent Classification
    let primaryIntent: QueryIntent['primaryIntent'] = 'web';
    let suggestedAppSlug: string | undefined = undefined;

    if (/\b(github|repo|git hub|code|repository|matlab|simulink)\b/i.test(lower)) {
      primaryIntent = 'code';
      if (lower.includes('github') || lower.includes('git hub')) suggestedAppSlug = 'github';
    } else if (/\b(news|latest|breaking|today)\b/i.test(lower)) {
      primaryIntent = 'news';
    } else if (/\b(map|location|near me|directions)\b/i.test(lower)) {
      primaryIntent = 'maps';
    } else if (/\b(buy|price|shop|store|cost)\b/i.test(lower)) {
      primaryIntent = 'shopping';
    } else if (/\b(youtub|youtube|you tube|yt)\b/i.test(lower)) {
      primaryIntent = 'app';
      suggestedAppSlug = 'youtube';
    } else if (/\b(insta|instagram)\b/i.test(lower)) {
      primaryIntent = 'app';
      suggestedAppSlug = 'instagram';
    }

    // Spelling Corrector
    const correctedSpelling = this.correctSpelling(normalized);

    return {
      rawQuery: raw,
      normalizedQuery: normalized.trim(),
      correctedSpelling: correctedSpelling !== normalized ? correctedSpelling : undefined,
      detectedLanguage,
      primaryIntent,
      suggestedAppSlug,
      expandedKeywords: [normalized, correctedSpelling, ...normalized.split(' ')].filter(Boolean)
    };
  }

  /**
   * Levenshtein Distance spell checker for common query terms.
   */
  static correctSpelling(term: string): string {
    if (!term || term.length < 3) return term;

    let bestMatch = term;
    let minDistance = 999;

    this.dictionary.forEach(dictWord => {
      const dist = this.levenshteinDistance(term, dictWord);
      if (dist < minDistance && dist <= 2) {
        minDistance = dist;
        bestMatch = dictWord;
      }
    });

    return bestMatch;
  }

  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Fast autocomplete suggestion generator for search bar.
   */
  static getAutocompleteSuggestions(prefix: string): string[] {
    if (!prefix || prefix.trim().length === 0) {
      return this.dictionary.slice(0, 6);
    }
    const lowerPrefix = prefix.toLowerCase().trim();

    const prefixMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const word of this.dictionary) {
      if (word.startsWith(lowerPrefix)) {
        prefixMatches.push(word);
      } else if (word.includes(lowerPrefix)) {
        containsMatches.push(word);
      }
    }

    return [...prefixMatches, ...containsMatches].slice(0, 8);
  }
}
