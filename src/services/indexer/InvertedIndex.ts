/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Inverted Indexer & Okapi BM25 Ranking Engine
 */

import { CrawledDocument } from '../crawler/CrawlerService';
import { SearchResultItem } from '../api';

export interface Posting {
  docId: string;
  termFrequency: number;
  fieldWeights: {
    title: number;
    headings: number;
    body: number;
    keywords: number;
  };
}

export interface IndexedDocMeta {
  id: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  title: string;
  description: string;
  snippet: string;
  category: string;
  date: string;
  language: string;
  docLength: number;
  pageRank: number;
  crawledAt: string;
}

export class InvertedIndex {
  private static dictionary = new Map<string, Posting[]>();
  private static docStore = new Map<string, IndexedDocMeta>();
  private static totalDocLengthSum = 0;

  // BM25 Hyperparameters
  private static k1 = 1.2;
  private static b = 0.75;

  /**
   * Tokenizes and normalizes text into lowercase terms.
   */
  static tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 1 && !this.isStopword(term));
  }

  /**
   * Stopwords filter for clean index tokenization.
   */
  private static isStopword(term: string): boolean {
    const stopwords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
      'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);
    return stopwords.has(term);
  }

  /**
   * Adds or updates a crawled document in the inverted index.
   */
  static addDocument(doc: CrawledDocument) {
    if (this.docStore.has(doc.id)) {
      this.removeDocument(doc.id);
    }

    const titleTokens = this.tokenize(doc.title);
    const headingTokens = this.tokenize(doc.headings.join(' '));
    const bodyTokens = this.tokenize(doc.bodyText);
    const keywordTokens = this.tokenize(doc.keywords.join(' '));

    const allTokens = [...titleTokens, ...headingTokens, ...bodyTokens, ...keywordTokens];
    const docLength = allTokens.length || 1;

    // Calculate term frequencies with field-specific weights
    const termFreqMap = new Map<string, Posting['fieldWeights']>();

    const updateTermFreq = (tokens: string[], field: keyof Posting['fieldWeights'], weight: number) => {
      for (const token of tokens) {
        if (!termFreqMap.has(token)) {
          termFreqMap.set(token, { title: 0, headings: 0, body: 0, keywords: 0 });
        }
        termFreqMap.get(token)![field] += weight;
      }
    };

    updateTermFreq(titleTokens, 'title', 3.5);
    updateTermFreq(headingTokens, 'headings', 2.0);
    updateTermFreq(bodyTokens, 'body', 1.0);
    updateTermFreq(keywordTokens, 'keywords', 2.5);

    // Write postings to dictionary
    termFreqMap.forEach((fieldWeights, term) => {
      if (!this.dictionary.has(term)) {
        this.dictionary.set(term, []);
      }

      const totalWeightedFreq = fieldWeights.title + fieldWeights.headings + fieldWeights.body + fieldWeights.keywords;
      
      this.dictionary.get(term)!.push({
        docId: doc.id,
        termFrequency: totalWeightedFreq,
        fieldWeights
      });
    });

    const pageRank = Math.min(5, 1 + (doc.outboundLinks.length * 0.1) + (doc.wordCount / 500));

    // Store doc metadata
    this.docStore.set(doc.id, {
      id: doc.id,
      url: doc.url,
      canonicalUrl: doc.canonicalUrl,
      domain: doc.domain,
      title: doc.title,
      description: doc.description,
      snippet: doc.description || doc.bodyText.substring(0, 180) + '...',
      category: 'technology',
      date: 'Today',
      language: doc.language,
      docLength,
      pageRank,
      crawledAt: doc.crawledAt
    });

    this.totalDocLengthSum += docLength;
  }

  /**
   * Removes a document from the inverted index.
   */
  static removeDocument(docId: string) {
    if (!this.docStore.has(docId)) return;
    const oldDoc = this.docStore.get(docId)!;
    this.totalDocLengthSum -= oldDoc.docLength;
    this.docStore.delete(docId);

    // Purge postings
    this.dictionary.forEach((postings, term) => {
      const filtered = postings.filter(p => p.docId !== docId);
      if (filtered.length === 0) {
        this.dictionary.delete(term);
      } else {
        this.dictionary.set(term, filtered);
      }
    });
  }

  /**
   * Calculates Okapi BM25 score for a query term against a document.
   */
  private static calculateBM25(term: string, posting: Posting, totalDocs: number, avgDocLength: number, docLength: number): number {
    const postings = this.dictionary.get(term) || [];
    const docCountWithTerm = postings.length;

    // Inverse Document Frequency (IDF)
    const idf = Math.log(1 + (totalDocs - docCountWithTerm + 0.5) / (docCountWithTerm + 0.5));
    const tf = posting.termFrequency;

    // Term Frequency Normalization
    const tfNorm = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLength / avgDocLength)));

    return Math.max(0, idf * tfNorm);
  }

  /**
   * Executes BM25 search across indexed documents.
   */
  static search(queryStr: string, filter: string = 'all'): { results: SearchResultItem[]; totalResults: number } {
    const queryTokens = this.tokenize(queryStr);
    if (queryTokens.length === 0 || this.docStore.size === 0) {
      return { results: [], totalResults: 0 };
    }

    const totalDocs = this.docStore.size;
    const avgDocLength = (this.totalDocLengthSum / totalDocs) || 100;
    const docScores = new Map<string, number>();

    queryTokens.forEach(term => {
      const postings = this.dictionary.get(term);
      if (postings) {
        postings.forEach(posting => {
          const docMeta = this.docStore.get(posting.docId);
          if (docMeta) {
            const bm25Score = this.calculateBM25(term, posting, totalDocs, avgDocLength, docMeta.docLength);
            const currentScore = docScores.get(posting.docId) || 0;
            docScores.set(posting.docId, currentScore + bm25Score);
          }
        });
      }
    });

    // Convert scores to ranked SearchResultItem array
    const rankedResults: SearchResultItem[] = [];

    docScores.forEach((bm25Score, docId) => {
      const doc = this.docStore.get(docId)!;
      const combinedScore = bm25Score + (doc.pageRank * 0.2);

      if (combinedScore > 0.01) {
        rankedResults.push({
          id: doc.id,
          title: doc.title,
          url: doc.url,
          domain: doc.domain,
          snippet: doc.snippet,
          category: doc.category,
          date: doc.date,
          verification: 'verified'
        });
      }
    });

    // Sort by final score
    rankedResults.sort((a, b) => (docScores.get(b.id) || 0) - (docScores.get(a.id) || 0));

    return {
      results: rankedResults,
      totalResults: rankedResults.length
    };
  }

  /**
   * Returns metadata metrics about the search index.
   */
  static getIndexMetrics() {
    return {
      totalIndexedDocuments: this.docStore.size,
      dictionaryTermsCount: this.dictionary.size,
      averageDocumentLength: Math.round(this.totalDocLengthSum / (this.docStore.size || 1)),
      bm25Params: { k1: this.k1, b: this.b }
    };
  }
}
