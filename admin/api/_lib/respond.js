// admin/api/_lib/respond.js
// Secure CORS and response helpers

// Allowed origins for admin endpoints (more restrictive than public)
const ADMIN_ALLOWED_ORIGINS = [
  'https://admin.mindpick.me',
  // Add preview URLs if needed
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  // Development only
  process.env.NODE_ENV === 'development' ? 'http://localhost:5174' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

/**
 * Secure CORS helper - DOES NOT echo arbitrary origins
 * Only allows explicitly configured origins
 */
export function allowCors(req, res) {
  const origin = req.headers.origin;
  
  // Strict origin validation
  if (origin && ADMIN_ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (origin) {
    // Log unauthorized attempts
    console.warn('[CORS] Blocked unauthorized origin:', origin);
    // Don't set any CORS headers - will fail in browser
  }
  // If no origin header, allow (same-origin or server-side)

  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  
  return false;
}

/**
 * Success response helper
 */
export function ok(res, data, req = null) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(data));
}

/**
 * Error response helper
 * @param {Response} res - Response object
 * @param {number} code - HTTP status code
 * @param {string} message - Error message (user-facing)
 * @param {object} extra - Additional data (internal only in dev)
 * @param {Request} req - Request object
 */
export function err(res, code, message, extra = {}, req = null) {
  // Log error with context
  console.error(`[API Error ${code}]`, {
    message,
    ip: req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress,
    path: req?.url,
    method: req?.method,
    ...extra
  });

  // Don't leak internal details in production
  const response = {
    error: message
  };

  // Only include extra details in development
  if (process.env.NODE_ENV === 'development') {
    response.details = extra;
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json');
  res.status(code).send(JSON.stringify(response));
}