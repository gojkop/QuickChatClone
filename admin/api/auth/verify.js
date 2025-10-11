import { sql } from '../_lib/db.js';
import { signAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

/**
 * POST /api/auth/verify
 * Headers: Authorization: Bearer <xano_token>
 * Flow:
 *  - Validate token against Xano /me
 *  - Check Neon admin_users (RBAC)
 *  - Issue short-lived admin_session cookie
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed');
  }

  try {
    const xanoBase = process.env.XANO_BASE_URL;
    if (!xanoBase) {
      return err(res, 500, 'XANO_BASE_URL not configured');
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return err(res, 401, 'Missing Authorization Bearer token');
    }

    // 1) Validate with Xano /me
    const meResp = await fetch(`${xanoBase}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!meResp.ok) {
      return err(res, 401, 'Xano validation failed');
    }

    const me = await meResp.json();
    const xanoUserId =
      me?.user?.id != null ? String(me.user.id) :
      me?.id != null ? String(me.id) : null;
    const email = me?.user?.email || me?.email || null;
    const name = me?.user?.name || me?.name || null;

    if (!xanoUserId) {
      return err(res, 401, 'Invalid identity payload from Xano');
    }

    // 2) RBAC in Neon
    const rows = await sql`
      SELECT id, role, disabled, token_version
      FROM admin_users
      WHERE xano_user_id = ${xanoUserId}
      LIMIT 1
    `;

    if (rows.length === 0 || rows[0].disabled) {
      return err(res, 403, 'Not an admin');
    }

    // 3) Issue short-lived admin session (15 minutes default)
    const session = signAdminSession({
      admin_id: rows[0].id,
      xano_user_id: xanoUserId,
      role: rows[0].role,
      tv: rows[0].token_version
    }, 900);

    // Set secure httpOnly cookie
    const cookie = [
      `admin_session=${session}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=900'
    ].join('; ');

    res.setHeader('Set-Cookie', cookie);

    return ok(res, {
      ok: true,
      role: rows[0].role,
      email,
      name
    });
  } catch (e) {
    console.error('[admin] /api/auth/verify error:', e);
    return err(res, 500, 'Internal server error');
  }
}
