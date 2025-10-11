import { sql } from './_lib/db.js';
import { verifyAdminSession } from './_lib/jwt.js';
import { allowCors, ok, err } from './_lib/respond.js';

/**
 * GET /api/me
 * Reads httpOnly cookie "admin_session", verifies JWT, enforces current token_version & role.
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  try {
    const cookieHeader = req.headers.cookie || '';
    const m1 = cookieHeader.match(/(?:^|;\\s*)admin_session=([^;]+)/);
    const m2 = cookieHeader.match(/(?:^|;\\s*)admin_seession=([^;]+)/);
    const cookieMatch = m1 ? m1 : m2;
    if (!cookieMatch) return err(res, 401, 'Not authenticated', {}, req);

    let payload;
    try {
      payload = verifyAdminSession(cookieMatch[1]);
    } catch {
      return err(res, 401, 'Invalid or expired session', {}, req);
    }

    const rows = await sql`
      SELECT token_version, role, disabled
      FROM admin_users
      WHERE id = ${payload.admin_id}
      LIMIT 1
    `;

    if (rows.length === 0 || rows[0].disabled) {
      return err(res, 403, 'Access revoked', {}, req);
    }
    if (rows[0].token_version !== payload.tv) {
      return err(res, 401, 'Session expired', {}, req);
    }

    return ok(res, {
      ok: true,
      admin_id: payload.admin_id,
      xano_user_id: payload.xano_user_id,
      role: rows[0].role
    }, req);
  } catch (e) {
    console.error('[admin] /api/me error:', e);
    return err(res, 500, 'Internal server error', {}, req);
  }
}
