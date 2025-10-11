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
    const cookie = req.headers.cookie || '';
    const m = cookie.match(/(?:^|;\\s*)admin_session=([^;]+)/);
    if (!m) return err(res, 401, 'Not authenticated');

    let payload;
    try {
      payload = verifyAdminSession(m[1]);
    } catch {
      return err(res, 401, 'Invalid or expired session');
    }

    const rows = await sql`
      SELECT token_version, role, disabled
      FROM admin_users
      WHERE id = ${payload.admin_id}
      LIMIT 1
    `;

    if (rows.length === 0 || rows[0].disabled) {
      return err(res, 403, 'Access revoked');
    }
    if (rows[0].token_version !== payload.tv) {
      return err(res, 401, 'Session expired');
    }

    return ok(res, {
      ok: true,
      admin_id: payload.admin_id,
      xano_user_id: payload.xano_user_id,
      role: rows[0].role
    });
  } catch (e) {
    console.error('[admin] /api/me error:', e);
    return err(res, 500, 'Internal server error');
  }
}
