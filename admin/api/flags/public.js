// admin/api/flags/public.js
// Public read-only endpoint with strict CORS security
import { sql } from '../_lib/db.js';

const PLAN_NAMES = {
  0: 'free',
  10: 'pro',
  20: 'enterprise'
};

// STRICT: Only your domains can access
const ALLOWED_ORIGINS = [
  'https://www.mindpick.me',
  'https://mindpick.me',
  // Add staging/preview URLs if needed:
  // 'https://preview.mindpick.me',
  // Development (comment out in production)
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT = 120; // requests per minute per IP
const WINDOW = 60 * 1000; // 1 minute window

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + WINDOW };
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW;
  }
  
  record.count++;
  rateLimitMap.set(ip, record);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  return record.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.headers['x-real-ip'] ||
                   req.connection?.remoteAddress ||
                   'unknown';

  // Log request (for monitoring)
  console.log('[flags/public] Request:', {
    timestamp: new Date().toISOString(),
    ip: clientIp,
    origin: req.headers.origin || 'no-origin',
    userAgent: req.headers['user-agent']?.substring(0, 100),
    method: req.method
  });

  // Rate limiting check
  if (!checkRateLimit(clientIp)) {
    console.warn('[flags/public] Rate limit exceeded:', clientIp);
    return res.status(429).json({ 
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60
    });
  }

  // STRICT CORS validation
  const origin = req.headers.origin;
  
  if (origin) {
    // If origin header is present, validate it
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Block unauthorized origins
      console.warn('[flags/public] Blocked unauthorized origin:', origin, 'from IP:', clientIp);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Access denied from this origin'
      });
    }
  }
  // If no origin header (e.g., server-side call, Postman), allow it
  // This is safe because rate limiting still applies

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Fetch only enabled flags
    const rows = await sql`
      SELECT key, enabled, min_plan_level
      FROM feature_flags
      WHERE enabled = true
      ORDER BY key ASC
    `;

    // Transform to public format
    const flags = rows.map(flag => ({
      key: flag.key,
      enabled: flag.enabled,
      min_plan: PLAN_NAMES[flag.min_plan_level] || 'free',
      min_plan_level: flag.min_plan_level
    }));

    // Cache headers with randomized TTL for security
    const randomOffset = Math.floor(Math.random() * 60); // 0-60 seconds
    const ttl = 300 + randomOffset; // 5-6 minutes
    res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate=600`);
    res.setHeader('Content-Type', 'application/json');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    return res.status(200).json({ 
      flags,
      _meta: {
        count: flags.length,
        cached: true
      }
    });
  } catch (e) {
    console.error('[flags/public] Database error:', e);
    
    // Don't leak internal errors to client
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch feature flags'
    });
  }
}