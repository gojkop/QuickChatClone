import { sql } from './_lib/db.js';
import { verifyAdminSession, signAdminSession } from './_lib/jwt.js';
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
    const m1 = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
    const m2 = cookieHeader.match(/(?:^|;\s*)admin_seession=([^;]+)/);
    const cookieMatch = m1 ? m1 : m2;
    if (!cookieMatch) {
      // Attempt automatic exchange: qc_session (Xano JWT) -> admin_session
      const xanoBase = process.env.XANO_BASE_URL;
      if (!xanoBase) return err(res, 500, 'XANO_BASE_URL not configured', {}, req);

      const qc = cookieHeader.match(/(?:^|;\s*)qc_session=([^;]+)/);
      if (!qc) return err(res, 401, 'Not authenticated', {}, req);

      let token;
      try {
        token = decodeURIComponent(qc[1]).trim();
      } catch {
        token = qc[1].trim();
      }

      // Validate with Xano
      let meResp = await fetch(`${xanoBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meResp.ok && meResp.status === 404) {
        meResp = await fetch(`${xanoBase}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (!meResp.ok) return err(res, 401, 'Xano validation failed', {}, req);

      const me = await meResp.json();
      const xanoUserId =
        me?.user?.id != null ? String(me.user.id) :
        me?.id != null ? String(me.id) : null;
      if (!xanoUserId) return err(res, 401, 'Invalid identity payload from Xano', {}, req);

      // RBAC check
      const rows = await sql`
        SELECT id, role, disabled, token_version
        FROM admin_users
        WHERE xano_user_id = ${xanoUserId}
        LIMIT 1
      `;
      if (rows.length === 0 || rows[0].disabled) {
        return err(res, 403, 'Not an admin', {}, req);
      }

      // Issue admin_session and return OK (session bootstrap)
      const session = signAdminSession({
        admin_id: rows[0].id,
        xano_user_id: xanoUserId,
        role: rows[0].role,
        tv: rows[0].token_version
      }, 900);

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
        admin_id: rows[0].id,
        xano_user_id: xanoUserId,
        role: rows[0].role
      }, req);
    }

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
