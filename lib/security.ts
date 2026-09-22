/**
 * Security & Input Validation utilities
 * Ensures safe query processing, API key protection, and URL sanitization.
 */

export function validateQuery(query: unknown): { valid: boolean; query: string; error?: string } {
  if (typeof query !== 'string') {
    return { valid: false, query: '', error: 'Query must be a string' };
  }

  const sanitized = query
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
    .trim();

  if (!sanitized) {
    return { valid: false, query: '', error: 'Query cannot be empty' };
  }

  if (sanitized.length > 500) {
    return { valid: true, query: sanitized.slice(0, 500) };
  }

  return { valid: true, query: sanitized };
}

export function validatePageToken(token: unknown): string | undefined {
  if (typeof token !== 'string') return undefined;
  const clean = token.trim();
  if (!clean || clean.length > 256 || /[^a-zA-Z0-9_\-+/=]/.test(clean)) {
    return undefined;
  }
  return clean;
}

export function sanitizeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#';
    }
    return parsed.toString();
  } catch {
    return '#';
  }
}

export function sanitizeForLog(data: any): string {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    // Mask any potential API keys, passwords or auth tokens
    return str
      .replace(/AIza[0-9A-Za-z-_]{35}/g, 'AIza...[REDACTED]')
      .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
      .replace(/(key|apiKey|token|secret|password)=([^&"'\s]+)/gi, '$1=[REDACTED]');
  } catch {
    return '[Unserializable]';
  }
}
