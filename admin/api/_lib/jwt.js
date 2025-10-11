import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET;

if (!SECRET) {
  // Do not throw at import time in case of local previews; handlers will guard.
  console.warn('[admin] ADMIN_JWT_SECRET is not set. Set it in the Admin Vercel project env.');
}

/**
 * Issue a short-lived admin session token (default 15 minutes)
 */
export function signAdminSession(payload, ttlSeconds = 900) {
  if (!SECRET) {
    throw new Error('ADMIN_JWT_SECRET is not configured');
  }
  return jwt.sign(payload, SECRET, { expiresIn: ttlSeconds });
}

/**
 * Verify an admin session token and return payload
 */
export function verifyAdminSession(token) {
  if (!SECRET) {
    throw new Error('ADMIN_JWT_SECRET is not configured');
  }
  return jwt.verify(token, SECRET);
}
