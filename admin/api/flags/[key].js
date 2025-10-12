// admin/api/flags/[key].js
// Update and delete specific feature flag

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

// Plan level constants
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

// admin/api/flags/[key].js
// Update and delete specific feature flag

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

// Plan level constants
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

/**
 * PATCH /api/flags/[key] - Update feature flag
 * DELETE /api/flags/[key] - Delete feature flag
 */
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
}

/**
 * Update feature flag
 */
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

    // Build update fields
    const updates = {};
    
    if (body.name !== undefined) {
      if (body.name.length < 3 || body.name.length > 100) {
        return err(res, 400, 'name must be 3-100 characters', {}, req);
      }
      updates.name = body.name;
    }

    if (body.description !== undefined) {
      if (body.description && body.description.length > 500) {
        return err(res, 400, 'description must be max 500 characters', {}, req);
      }
      updates.description = body.description;
    }

    if (body.enabled !== undefined) {
      updates.enabled = body.enabled;
    }

    if (body.min_plan !== undefined) {
      updates.min_plan_level = PLAN_LEVELS[body.min_plan.toUpperCase()] ?? 0;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    // Build dynamic UPDATE query
    const setClause = Object.keys(updates)
      .map((k) => sql`${sql(k)} = ${updates[k]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);

    const updated = await sql`
      UPDATE feature_flags
      SET ${setClause}, updated_at = NOW()
      WHERE key = ${key}
      RETURNING id, key, name, description, enabled, min_plan_level, created_at, updated_at
    `;

    // Log to feature_flag_audit
    await sql`
      INSERT INTO feature_flag_audit (
        flag_id, admin_user_id, action, old_value, new_value
      ) VALUES (
        ${oldFlag.id},
        ${session.admin_id},
        'update',
        ${JSON.stringify({
          name: oldFlag.name,
          description: oldFlag.description,
          enabled: oldFlag.enabled,
          min_plan_level: oldFlag.min_plan_level
        })},
        ${JSON.stringify({
          name: updated[0].name,
          description: updated[0].description,
          enabled: updated[0].enabled,
          min_plan_level: updated[0].min_plan_level
        })}
      )
    `;

    // Log to admin_audit_log
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id, action, resource_type, resource_id, request_body
      ) VALUES (
        ${session.admin_id},
        'update_feature_flag',
        'feature_flag',
        ${oldFlag.id},
        ${JSON.stringify(body)}
      )
    `;

    // Transform response
    const result = {
      ...updated[0],
      min_plan: PLAN_NAMES[updated[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag updated successfully' }, req);
  } catch (e) {
    console.error(`[admin] PATCH /api/flags/${key} error:`, e);
    return err(res, 500, 'Failed to update feature flag', { details: e.message }, req);
  }
}

/**
 * Delete feature flag
 */
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
          enabled: flag.enabled,
          min_plan_level: flag.min_plan_level
        })},
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
    console.error(`[admin] DELETE /api/flags/${key} error:`, e);
    return err(res, 500, 'Failed to delete feature flag', { details: e.message }, req);
  }
}