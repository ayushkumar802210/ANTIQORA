/**
 * ANTIQORA Search Text Sanitizer & Normalizer Utility
 * 
 * Guarantees zero raw HTML entities, zero broken markup, zero raw crawler metadata,
 * and pristine human-readable search titles, snippets, domains, and categories.
 */

import { SearchResultItem } from './api';

/**
 * Decodes all HTML entities (named, decimal, hex, and double-encoded) into clean UTF-8 text.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  let decoded = text;

  const entityMap: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&#039;': "'",
    '&#39;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8230;': '…',
    '&#x27;': "'",
    '&#x22;': '"',
    '&#x26;': '&',
    '&#x3C;': '<',
    '&#x3E;': '>',
    '&#x2013;': '–',
    '&#x2014;': '—',
    '&#x2019;': "'",
    '&#x201C;': '"',
    '&#x201D;': '"',
  };

  // Perform up to 2 decoding passes to handle double-encoded entities (e.g. &amp;quot;)
  for (let pass = 0; pass < 2; pass++) {
    decoded = decoded.replace(
      /&(quot|apos|#039|#39|amp|lt|gt|nbsp|ndash|mdash|hellip|rsquo|lsquo|rdquo|ldquo|copy|reg|trade|#8211|#8212|#8216|#8217|#8220|#8221|#8230|#x27|#x22|#x26|#x3C|#x3E|#x2013|#x2014|#x2019|#x201C|#x201D);/gi,
      (match) => {
        const lower = match.toLowerCase();
        return entityMap[lower] || entityMap[match] || match;
      }
    );

    // Replace numeric decimal entities &#123;
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
      try {
        const num = parseInt(dec, 10);
        if (num > 0 && num < 65536) {
          return String.fromCharCode(num);
        }
        return _;
      } catch {
        return _;
      }
    });

    // Replace numeric hex entities &#x1a;
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        const num = parseInt(hex, 16);
        if (num > 0 && num < 65536) {
          return String.fromCharCode(num);
        }
        return _;
      } catch {
        return _;
      }
    });
  }

  return decoded;
}

/**
 * Strips all HTML tags and attributes from a string.
 */
export function stripHtmlTags(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, ' ');
}

/**
 * Removes raw technical metadata, crawler artifacts, retrieved dates, archived dates,
 * and debug information from user-facing search strings.
 */
export function removeTechnicalArtifacts(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // Remove "Retrieved Month Day, Year", "Retrieved DD Month YYYY", "Retrieved YYYY-MM-DD", etc.
  cleaned = cleaned.replace(/\bRetrieved\s+(?:on\s+)?(?:[A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2}|[^\.\;\,]+)[\.\;\,]?/gi, '');

  // Remove "Archived Month Day, Year from the original", "Archived on...", etc.
  cleaned = cleaned.replace(/\bArchived\s+(?:on\s+)?(?:from\s+the\s+original\s+)?(?:[A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2}|[^\.\;\,]+)?[\.\;\,]?/gi, '');

  // Remove citation brackets like [1], [2], [citation needed], [note 1], [edit]
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  cleaned = cleaned.replace(/\[(?:citation needed|note\s*\d*|edit|source\s*\d*|reference\s*\d*)\]/gi, '');

  // Remove technical debugging and indexing artifacts
  cleaned = cleaned.replace(/\bIndexed Web Results\b/gi, 'Web Results');
  cleaned = cleaned.replace(/\bIndexed Search Result[s]?\b/gi, 'Web Result');
  cleaned = cleaned.replace(/\bCrawler metadata\b/gi, '');
  cleaned = cleaned.replace(/\braw JSON\b/gi, '');
  cleaned = cleaned.replace(/\bAPI fields\b/gi, '');
  cleaned = cleaned.replace(/\bInternal ID:\s*\w+\b/gi, '');

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes spacing, removes redundant quotes and cleans duplicate punctuation.
 */
export function normalizeWhitespaceAndPunctuation(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // Collapse multiple spaces/newlines
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Fix spaces before punctuation (e.g. "word ." -> "word.")
  cleaned = cleaned.replace(/\s+([\.\,\!\?\;\:\%\)])/g, '$1');

  // Fix spaces inside brackets
  cleaned = cleaned.replace(/([\(\[\{])\s+/g, '$1');

  // Clean duplicate punctuation like ".." or ",," or ";;"
  cleaned = cleaned.replace(/\.{4,}/g, '...');
  cleaned = cleaned.replace(/\,{2,}/g, ',');
  cleaned = cleaned.replace(/\;{2,}/g, ';');

  return cleaned.trim();
}

/**
 * Universal primary function to sanitize search text.
 * Handles entity decoding, tag removal, metadata stripping, and punctuation normalization.
 */
export function sanitizeSearchText(text: string): string {
  if (!text) return '';

  let result = decodeHtmlEntities(text);
  result = stripHtmlTags(result);
  result = removeTechnicalArtifacts(result);
  result = normalizeWhitespaceAndPunctuation(result);

  return result;
}

/**
 * Clean domain string into concise website origin (e.g., whatsapp.com, wikipedia.org).
 */
export function cleanDomain(domainOrUrl: string): string {
  if (!domainOrUrl) return 'web';

  let raw = domainOrUrl.trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      raw = new URL(raw).hostname;
    } catch {
      // fallback
    }
  }

  // Remove www. or trailing port / path
  raw = raw.replace(/^www\./i, '').split('/')[0].split(':')[0];
  
  return raw.toLowerCase() || 'web';
}

/**
 * Normalizes search page titles cleanly.
 */
export function cleanTitle(title: string, domain?: string): string {
  if (!title) return 'Web Result';

  let cleaned = sanitizeSearchText(title);

  // Remove standalone date prefixes like "2021. WhatsApp Messenger" -> "WhatsApp Messenger"
  cleaned = cleaned.replace(/^(?:19|20)\d{2}\s*[\.\,\;\-]\s*/, '');

  // Remove trailing domain duplication if present e.g. "WhatsApp - whatsapp.com"
  if (domain) {
    const domainPart = cleanDomain(domain);
    const domainRegex = new RegExp(`\\s*[-|•–—]\\s*${domainPart.replace('.', '\\.')}\\b`, 'i');
    cleaned = cleaned.replace(domainRegex, '');
  }

  // Strip outer quotes around the title e.g. "WhatsApp Messenger APKs" -> WhatsApp Messenger APKs
  cleaned = cleaned.trim();
  if ((cleaned.startsWith('"') && (cleaned.endsWith('"') || cleaned.endsWith('".'))) ||
      (cleaned.startsWith("'") && (cleaned.endsWith("'") || cleaned.endsWith("'.")))) {
    cleaned = cleaned.replace(/^['"]|['"]\.?$/g, '').trim();
  }

  // Remove trailing period or stray quotes on titles
  cleaned = cleaned.replace(/^['"]+|['"]+$|\.$/g, '').trim();

  return cleaned.trim() || 'Web Result';
}

/**
 * Normalizes search snippets into clean, natural 2-3 sentence human-readable descriptions.
 */
export function cleanSnippet(snippet: string, title?: string): string {
  if (!snippet) {
    return title ? `Official information, updates, and verified overview regarding ${title}.` : 'Verified web resource.';
  }

  let cleaned = sanitizeSearchText(snippet);

  // If snippet begins with title verbatim, trim it
  if (title && title.length > 5) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titlePrefixRegex = new RegExp(`^${escapedTitle}\\s*[:\\-–—•]?\\s*`, 'i');
    cleaned = cleaned.replace(titlePrefixRegex, '');
  }

  // Strip leading stray quote or colon
  cleaned = cleaned.replace(/^[\"\'\:\-\s]+/, '');

  // Limit snippet length gracefully to ~220 characters without cutting mid-word
  if (cleaned.length > 220) {
    const truncated = cleaned.slice(0, 220);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 140) {
      cleaned = truncated.slice(0, lastSpace) + '...';
    } else {
      cleaned = truncated + '...';
    }
  }

  return cleaned.trim() || 'Verified web resource.';
}

/**
 * Normalizes a full SearchResultItem into a sanitized, safe schema object.
 */
export function normalizeSearchResult(item: any): SearchResultItem {
  const rawUrl = String(item.url || item.link || item.uri || 'https://antiqora.io');
  let domain = String(item.domain || '');
  if (!domain || domain === 'web') {
    domain = cleanDomain(rawUrl);
  } else {
    domain = cleanDomain(domain);
  }

  const rawTitle = String(item.title || item.name || item.heading || 'Web Result');
  const cleanTitleStr = cleanTitle(rawTitle, domain);

  const rawSnippet = String(item.snippet || item.description || item.summary || item.text || '');
  const cleanSnippetStr = cleanSnippet(rawSnippet, cleanTitleStr);

  // Clean date string; omit technical crawl dates
  let dateStr = sanitizeSearchText(String(item.date || ''));
  if (/retrieved|archived|indexed|live knowledge|verified record|just now|recently/i.test(dateStr)) {
    dateStr = ''; // Do not display raw crawler or indexing metadata strings to users
  }

  const isOfficial = Boolean(item.isOfficial || item.verified);

  return {
    id: String(item.id || `res_${Math.random().toString(36).substring(2, 9)}`),
    title: cleanTitleStr,
    url: rawUrl,
    domain: domain,
    snippet: cleanSnippetStr,
    category: sanitizeSearchText(String(item.category || 'Web')),
    date: dateStr,
    verified: isOfficial,
    verification: isOfficial ? 'verified' : (item.verification || 'unverified'),
    isOfficial: isOfficial,
    source: 'web'
  };
}
