/**
 * Server-Side Rate Limiter Middleware
 * Protects APIs against excessive requests and loop starvation.
 */
import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipMap.entries()) {
    if (now > record.resetTime) {
      ipMap.delete(ip);
    }
  }
}, 300000);

export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
} = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute window
  const maxRequests = options.maxRequests || 90; // max 90 requests per minute
  const message = options.message || "Too many requests. Please try again in a moment.";

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || '127.0.0.1';

    const now = Date.now();
    const record = ipMap.get(ip);

    if (!record || now > record.resetTime) {
      ipMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

export const searchRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: "Too many search requests. Please slow down.",
});
