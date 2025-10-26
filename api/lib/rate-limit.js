// api/lib/rate-limit.js
// Simple in-memory rate limiter for API endpoints
// For production, consider using Upstash Redis or Vercel Edge Config

class RateLimiter {
  constructor() {
    this.requests = new Map(); // IP -> { count, resetTime }
    this.cleanupInterval = null;

    // Cleanup old entries every minute
    this.startCleanup();
  }

  startCleanup() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of this.requests.entries()) {
        if (now > data.resetTime) {
          this.requests.delete(ip);
        }
      }
    }, 60000); // 1 minute
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - Usually IP address or user ID
   * @param {number} limit - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
   */
  check(identifier, limit, windowMs) {
    const now = Date.now();
    const data = this.requests.get(identifier);

    // No previous requests or window expired
    if (!data || now > data.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs
      };
    }

    // Within window
    if (data.count < limit) {
      data.count++;
      return {
        allowed: true,
        remaining: limit - data.count,
        resetTime: data.resetTime
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.resetTime
    };
  }

  /**
   * Reset rate limit for an identifier
   * @param {string} identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Check if rate limiting is enabled via environment variable
 * @returns {boolean}
 */
function isRateLimitEnabled() {
  // Default to true (enabled) for safety
  // Set RATE_LIMIT_ENABLED=false to disable for testing
  return process.env.RATE_LIMIT_ENABLED !== 'false';
}

/**
 * Rate limit middleware
 * @param {Object} options
 * @param {number} options.limit - Max requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.keyPrefix - Prefix for the rate limit key (e.g., 'payment-intent')
 * @returns {Function} Express-like middleware
 */
export function rateLimit({ limit = 10, windowMs = 60000, keyPrefix = '' }) {
  return async (req, res, next) => {
    // Feature flag: Skip rate limiting if disabled
    if (!isRateLimitEnabled()) {
      console.log(`⚠️ [RATE LIMIT] Disabled via RATE_LIMIT_ENABLED=false (${keyPrefix})`);

      // Still set headers to indicate rate limiting is disabled
      res.setHeader('X-RateLimit-Enabled', 'false');
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', limit.toString());

      // Continue without rate limiting
      if (next) {
        return next();
      }
      return;
    }

    // Get identifier (IP address or user ID)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               'unknown';

    const identifier = `${keyPrefix}:${ip}`;

    const result = rateLimiter.check(identifier, limit, windowMs);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Enabled', 'true');
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      console.log(`🚫 [RATE LIMIT] Blocked ${identifier}: ${result.remaining} remaining`);

      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }

    console.log(`✅ [RATE LIMIT] Allowed ${identifier}: ${result.remaining} remaining`);

    // Continue to next handler
    if (next) {
      return next();
    }
  };
}

/**
 * Get client IP address from request
 * @param {Object} req - Request object
 * @returns {string} IP address
 */
export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         'unknown';
}

export default rateLimiter;
