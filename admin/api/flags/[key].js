// admin/api/flags/[key].js (FIXED)
import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

const PLAN_LEVELS = {
  FREE: 0,
  PRO: 10,
  ENTERPRISE: 20
};

const PLAN_NAMES = {
  0: 'free',
  10: 'pro',
  20: 'enterprise'
};

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  try {
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

    // Extract key from Vercel's req.query
    const key = req.query?.key;

    if (!key) {
      return err(res, 400, 'Feature flag key is required', {}, req);
    }

    // Route to appropriate handler
    switch (req.method) {
      case 'PATCH':
        return updateFlag(req, res, session, key);
      case 'DELETE':
        return deleteFlag(req, res, session, key);
      default:
        return err(res, 405, 'Method not allowed', {}, req);
    }
  } catch (error) {
    console.error('[flags/key] Unhandled error:', error);
    return err(res, 500, 'Internal server error', { 
      message: error.message
    }, req);
  }
}

async function updateFlag(req, res, session, key) {
  try {
    // Parse request body
    let body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {
        return err(res, 400, 'Invalid JSON body', {}, req);
      }
    } else {
      body = req.body;
    }

    // Get existing flag
    const existing = await sql`
      SELECT * FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feature flag not found', {}, req);
    }

    const oldFlag = existing[0];

    // Build update - handle each field separately
    let updated;

    if (body.name !== undefined && body.description !== undefined && 
        body.enabled !== undefined && body.min_plan !== undefined) {
      // All fields provided
      const minPlanLevel = PLAN_LEVELS[body.min_plan.toUpperCase()] ?? 0;
      updated = await sql`
        UPDATE feature_flags
        SET 
          name = ${body.name},
          description = ${body.description},
          enabled = ${body.enabled},
          min_plan_level = ${minPlanLevel},
          updated_at = NOW()
        WHERE key = ${key}
        RETURNING *
      `;
    } else if (body.enabled !== undefined && body.min_plan === undefined) {
      // Just toggle enabled
      updated = await sql`
        UPDATE feature_flags
        SET enabled = ${body.enabled}, updated_at = NOW()
        WHERE key = ${key}
        RETURNING *
      `;
    } else if (body.min_plan !== undefined) {
      // Update plan level (and other fields if provided)
      const minPlanLevel = PLAN_LEVELS[body.min_plan.toUpperCase()] ?? 0;
      if (body.name !== undefined) {
        updated = await sql`
          UPDATE feature_flags
          SET 
            name = ${body.name},
            description = ${body.description || oldFlag.description},
            enabled = ${body.enabled ?? oldFlag.enabled},
            min_plan_level = ${minPlanLevel},
            updated_at = NOW()
          WHERE key = ${key}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE feature_flags
          SET min_plan_level = ${minPlanLevel}, updated_at = NOW()
          WHERE key = ${key}
          RETURNING *
        `;
      }
    } else if (body.name !== undefined) {
      // Update name and description
      updated = await sql`
        UPDATE feature_flags
        SET 
          name = ${body.name},
          description = ${body.description || oldFlag.description},
          updated_at = NOW()
        WHERE key = ${key}
        RETURNING *
      `;
    } else {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    // Log to feature_flag_audit
    await sql`
      INSERT INTO feature_flag_audit (
        flag_id, admin_user_id, action, old_value, new_value
      ) VALUES (
        ${oldFlag.id},
        ${session.admin_id},
        'update',
        ${JSON.stringify({
          enabled: oldFlag.enabled,
          min_plan_level: oldFlag.min_plan_level
        })}::jsonb,
        ${JSON.stringify({
          enabled: updated[0].enabled,
          min_plan_level: updated[0].min_plan_level
        })}::jsonb
      )
    `;

    // Log to admin_audit_log (correct columns)
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id, action, resource_type, resource_id
      ) VALUES (
        ${session.admin_id},
        'update_feature_flag',
        'feature_flag',
        ${oldFlag.id}
      )
    `;

    // Transform response
    const result = {
      ...updated[0],
      min_plan: PLAN_NAMES[updated[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag updated successfully' }, req);
  } catch (e) {
    console.error(`[flags/key] PATCH error:`, e);
    return err(res, 500, 'Failed to update feature flag', { details: e.message }, req);
  }
}

async function deleteFlag(req, res, session, key) {
  try {
    // Get existing flag
    const existing = await sql`
      SELECT * FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feature flag not found', {}, req);
    }

    const flag = existing[0];

    // Log to feature_flag_audit before deletion
    await sql`
      INSERT INTO feature_flag_audit (
        flag_id, admin_user_id, action, old_value, new_value
      ) VALUES (
        ${flag.id},
        ${session.admin_id},
        'delete',
        ${JSON.stringify({
          key: flag.key,
          name: flag.name,
          enabled: flag.enabled
        })}::jsonb,
        NULL
      )
    `;

    // Log to admin_audit_log
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id, action, resource_type, resource_id
      ) VALUES (
        ${session.admin_id},
        'delete_feature_flag',
        'feature_flag',
        ${flag.id}
      )
    `;

    // Delete the flag
    await sql`
      DELETE FROM feature_flags WHERE key = ${key}
    `;

    return ok(res, { message: 'Feature flag deleted successfully' }, req);
  } catch (e) {
    console.error(`[flags/key] DELETE error:`, e);
    return err(res, 500, 'Failed to delete feature flag', { details: e.message }, req);
  }
}