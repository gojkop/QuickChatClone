// admin/api/team/revoke-sessions.js
// Force all admins to re-login (nuclear option)

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

  // Verify admin authentication
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  
  if (!match) {
    return err(res, 401, 'Admin authentication required', {}, req);
  }

  let session;
  try {
    session = verifyAdminSession(match[1]);
  } catch (e) {
    return err(res, 401, 'Invalid or expired admin session', {}, req);
  }

  // Only super_admin can revoke all sessions
  const admin = await sql`
    SELECT role, disabled FROM admin_users WHERE id = ${session.admin_id}
  `;

  if (!admin.length || admin[0].disabled) {
    return err(res, 403, 'Access denied', {}, req);
  }

  if (admin[0].role !== 'super_admin') {
    return err(res, 403, 'Only super admins can revoke all sessions', {}, req);
  }

  try {
    // Increment token_version for ALL active admins
    const result = await sql`
      UPDATE admin_users
      SET token_version = token_version + 1, updated_at = NOW()
      WHERE disabled = false
      RETURNING id
    `;

    // Log to audit
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        after_data
      ) VALUES (
        ${session.admin_id},
        'revoke_all_sessions',
        'admin_user',
        'all',
        ${JSON.stringify({
          affected_count: result.length,
          timestamp: new Date().toISOString()
        })}
      )
    `;

    return ok(res, {
      message: 'All admin sessions revoked',
      affected_admins: result.length
    }, req);

  } catch (error) {
    console.error('[team/revoke-sessions] Error:', error);
    return err(res, 500, 'Failed to revoke sessions', {
      details: error.message
    }, req);
  }
}