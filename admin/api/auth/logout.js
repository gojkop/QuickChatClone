import { allowCors, ok, err } from '../_lib/respond.js';

/**
 * POST /api/auth/logout
 * Clears the admin_session cookie.
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed');
  }

  try {
    // Clear cookie
    const cookie = [
      'admin_session=',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=0'
    ].join('; ');

    res.setHeader('Set-Cookie', cookie);
    return ok(res, { ok: true, cleared: true });
  } catch (e) {
    console.error('[admin] /api/auth/logout error:', e);
    return err(res, 500, 'Internal server error');
  }
}
