// admin/api/team.js
// Admin team management - simplified (all super_admin)

import { sql } from './_lib/db.js';
import { verifyAdminSession } from './_lib/jwt.js';
import { allowCors, ok, err, parseBody, validateRequired } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

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

  // Check if admin is active
  const adminCheck = await sql`
    SELECT disabled FROM admin_users WHERE id = ${session.admin_id}
  `;
  
  if (!adminCheck.length || adminCheck[0].disabled) {
    return err(res, 403, 'Admin access revoked', {}, req);
  }

  // Route to appropriate handler
  switch (req.method) {
    case 'GET':
      return listAdmins(req, res, session);
    case 'POST':
      return addAdmin(req, res, session);
    case 'DELETE':
      return removeAdmin(req, res, session);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

// ============================================================================
// LIST ADMINS
// ============================================================================
async function listAdmins(req, res, session) {
  try {
    const admins = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        disabled,
        created_at,
        (SELECT MAX(created_at) 
         FROM admin_audit_log 
         WHERE admin_user_id = au.id) as last_activity
      FROM admin_users au
      WHERE disabled = false
      ORDER BY created_at ASC
    `;

    return ok(res, { admins }, req);
  } catch (error) {
    console.error('[team/list] Error:', error);
    return err(res, 500, 'Failed to fetch admin team', {
      details: error.message
    }, req);
  }
}

// ============================================================================
// ADD ADMIN
// ============================================================================
async function addAdmin(req, res, session) {
  try {
    const body = parseBody(req);
    
    const validation = validateRequired(body, ['email', 'name']);
    if (!validation.valid) {
      return err(res, 400, validation.message, {}, req);
    }

    const { email, name, xano_user_id } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return err(res, 400, 'Invalid email format', {}, req);
    }

    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM admin_users WHERE email = ${email.toLowerCase()}
    `;

    if (existing.length > 0) {
      return err(res, 409, 'Admin with this email already exists', {}, req);
    }

    // Use provided xano_user_id or generate placeholder
    let finalXanoUserId = xano_user_id;
    
    if (!finalXanoUserId || finalXanoUserId.trim() === '') {
      // Generate a placeholder xano_user_id (in production, this would come from Xano)
      // For now, use email hash as placeholder
      finalXanoUserId = `temp_${Buffer.from(email).toString('base64').slice(0, 16)}`;
    } else {
      // Check if xano_user_id already exists
      const existingXano = await sql`
        SELECT id FROM admin_users WHERE xano_user_id = ${finalXanoUserId}
      `;
      
      if (existingXano.length > 0) {
        return err(res, 409, 'Admin with this Xano User ID already exists', {}, req);
      }
    }

    // Create admin (always super_admin, never disabled)
    const newAdmin = await sql`
      INSERT INTO admin_users (
        xano_user_id,
        email,
        name,
        role,
        disabled
      ) VALUES (
        ${finalXanoUserId},
        ${email.toLowerCase()},
        ${name},
        'super_admin',
        false
      )
      RETURNING id, email, name, role, xano_user_id, created_at
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
        'create_admin',
        'admin_user',
        ${newAdmin[0].id},
        ${JSON.stringify({
          email: email.toLowerCase(),
          name,
          role: 'super_admin',
          xano_user_id: finalXanoUserId
        })}
      )
    `;

    return ok(res, {
      admin: newAdmin[0],
      message: 'Admin added successfully'
    }, req);

  } catch (error) {
    console.error('[team/add] Error:', error);
    return err(res, 500, 'Failed to add admin', {
      details: error.message
    }, req);
  }
}

// ============================================================================
// REMOVE ADMIN (Soft Delete)
// ============================================================================
async function removeAdmin(req, res, session) {
  try {
    // Get admin ID from query parameter
    const adminId = req.query?.id || req.url?.split('id=')[1]?.split('&')[0];
    
    if (!adminId) {
      return err(res, 400, 'Admin ID required', {}, req);
    }

    // Prevent self-deletion
    if (adminId === session.admin_id) {
      return err(res, 400, 'Cannot remove yourself', {}, req);
    }

    // Get admin details before deletion
    const admin = await sql`
      SELECT id, email, name FROM admin_users WHERE id = ${adminId}
    `;

    if (admin.length === 0) {
      return err(res, 404, 'Admin not found', {}, req);
    }

    // Soft delete
    await sql`
      UPDATE admin_users
      SET disabled = true, updated_at = NOW()
      WHERE id = ${adminId}
    `;

    // Log to audit
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        before_data
      ) VALUES (
        ${session.admin_id},
        'remove_admin',
        'admin_user',
        ${adminId},
        ${JSON.stringify({
          email: admin[0].email,
          name: admin[0].name
        })}
      )
    `;

    return ok(res, {
      message: 'Admin removed successfully'
    }, req);

  } catch (error) {
    console.error('[team/remove] Error:', error);
    return err(res, 500, 'Failed to remove admin', {
      details: error.message
    }, req);
  }
}