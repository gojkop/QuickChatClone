// admin/api/_lib/respond.js
// Response helpers and CORS handling

/**
 * Handle CORS headers for cross-origin requests
 * CRITICAL: Must be called FIRST in every API handler
 * @param {Request} req - Incoming request
 * @param {Response} res - Outgoing response
 * @returns {boolean} - true if OPTIONS request (handler should return)
 */
export function allowCors(req, res) {
  // Get origin from request
  const origin = req.headers.origin;
  
  // Get allowed origins from env or use defaults
  const allowedOriginsString = process.env.CORS_ALLOW_ORIGIN || 
    'https://www.mindpick.me,https://mindpick.me,http://localhost:5173,http://localhost:3000';
  
  const allowedOrigins = allowedOriginsString.split(',').map(o => o.trim());

  // Set Access-Control-Allow-Origin header if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development' && origin) {
    // In development, allow any localhost origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }

  // Allow credentials (cookies)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allowed methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  
  // Allowed headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie, X-Requested-With'
  );

  // Max age for preflight cache (1 hour)
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Signal handler to stop processing
  }

  return false; // Continue processing
}

/**
 * Send successful JSON response
 */
export function ok(res, data, req = null) {
  const response = {
    success: true,
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Log successful requests in development
  if (process.env.NODE_ENV === 'development' && req) {
    console.log(`[${req.method}] ${req.url} → 200 OK`);
  }

  res.status(200).json(response);
}

/**
 * Send error JSON response
 */
export function err(res, status, message, data = {}, req = null) {
  const response = {
    success: false,
    error: message,
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Log errors
  if (req) {
    console.error(`[${req.method}] ${req.url} → ${status} ${message}`);
  }

  res.status(status).json(response);
}

/**
 * Send paginated response
 */
export function paginated(res, data, pagination, req = null) {
  const response = {
    success: true,
    data,
    pagination: {
      page: parseInt(pagination.page) || 1,
      limit: parseInt(pagination.limit) || 20,
      total: parseInt(pagination.total) || 0,
      pages: Math.ceil((parseInt(pagination.total) || 0) / (parseInt(pagination.limit) || 20)),
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development' && req) {
    console.log(`[${req.method}] ${req.url} → 200 OK (${data.length} items)`);
  }

  res.status(200).json(response);
}

/**
 * Validate required fields in request body
 */
export function validateRequired(body, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
}

/**
 * Parse request body (handles string and object)
 */
export function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      throw new Error('Invalid JSON body');
    }
  }
  return req.body || {};
}