// admin/api/flags.js
// Unified endpoint handling all flag operations
import { sql } from './_lib/db.js';
import { verifyAdminSession } from './_lib/jwt.js';
import { allowCors, ok, err } from './_lib/respond.js';

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
    // Extract key from URL path
    // URL format: /api/flags or /api/flags/key_name
    const urlParts = req.url.split('?')[0].split('/');
    const key = urlParts[3]; // /api/flags/KEY_HERE

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

    // Verify admin is not disabled
    const adminCheck = await sql`
      SELECT disabled FROM admin_users WHERE id = ${session.admin_id}
    `;
    
    if (!adminCheck.length || adminCheck[0].disabled) {
      return err(res, 403, 'Admin access revoked', {}, req);
    }

    // Route based on method and presence of key
    if (!key) {
      // No key in URL - list or create
      switch (req.method) {
        case 'GET':
          return listFlags(req, res, session);
        case 'POST':
          return createFlag(req, res, session);
        default:
          return err(res, 405, 'Method not allowed', {}, req);
      }
    } else {
      // Key present - update or delete specific flag
      switch (req.method) {
        case 'PATCH':
          return updateFlag(req, res, session, key);
        case 'DELETE':
          return deleteFlag(req, res, session, key);
        default:
          return err(res, 405, 'Method not allowed', {}, req);
      }
    }
  } catch (error) {
    console.error('[flags] Unhandled error:', error);
    return err(res, 500, 'Internal server error', { 
      message: error.message
    }, req);
  }
}

async function listFlags(req, res, session) {
  try {
    const flags = await sql`
      SELECT 
        id, key, name, description, enabled, 
        min_plan_level, created_at, updated_at
      FROM feature_flags
      ORDER BY created_at DESC
    `;

    const transformed = flags.map(flag => ({
      ...flag,
      min_plan: PLAN_NAMES[flag.min_plan_level] || 'free'
    }));

    return ok(res, { flags: transformed }, req);
  } catch (e) {
    console.error('[flags/list] Error:', e);
    return err(res, 500, 'Failed to fetch feature flags', { 
      details: e.message
    }, req);
  }
}

async function createFlag(req, res, session) {
  try {
    let body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (parseError) {
        return err(res, 400, 'Invalid JSON body', {}, req);
      }
    } else {
      body = req.body;
    }

    const { key, name, description, enabled, min_plan } = body;

    if (!key || !name) {
      return err(res, 400, 'key and name are required', {}, req);
    }

    if (!/^[a-z0-9_]+$/.test(key)) {
      return err(res, 400, 'key must contain only lowercase letters, numbers, and underscores', {}, req);
    }

    if (name.length < 3 || name.length > 100) {
      return err(res, 400, 'name must be 3-100 characters', {}, req);
    }

    const minPlanLevel = min_plan ? (PLAN_LEVELS[min_plan.toUpperCase()] ?? 0) : 0;

    const existing = await sql`
      SELECT id FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length > 0) {
      return err(res, 409, 'Feature flag with this key already exists', {}, req);
    }

    const newFlag = await sql`
      INSERT INTO feature_flags (key, name, description, enabled, min_plan_level)
      VALUES (
        ${key}, 
        ${name}, 
        ${description || null}, 
        ${enabled || false}, 
        ${minPlanLevel}
      )
      RETURNING id, key, name, description, enabled, min_plan_level, created_at, updated_at
    `;

    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id, action, resource_type, resource_id
      ) VALUES (
        ${session.admin_id}, 
        'create_feature_flag', 
        'feature_flag', 
        ${newFlag[0].id}
      )
    `;

    const result = {
      ...newFlag[0],
      min_plan: PLAN_NAMES[newFlag[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag created successfully' }, req);
  } catch (e) {
    console.error('[flags/create] Error:', e);
    return err(res, 500, 'Failed to create feature flag', { 
      details: e.message
    }, req);
  }
}

async function updateFlag(req, res, session, key) {
  try {
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

    const existing = await sql`
      SELECT * FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feature flag not found', {}, req);
    }

    const oldFlag = existing[0];

    // Simple update handling
    let updated;
    
    if (body.enabled !== undefined && body.min_plan === undefined && 
        body.name === undefined && body.description === undefined) {
      // Just toggle enabled
      updated = await sql`
        UPDATE feature_flags
        SET enabled = ${body.enabled}, updated_at = NOW()
        WHERE key = ${key}
        RETURNING *
      `;
    } else if (body.min_plan !== undefined || body.name !== undefined) {
      // Full update
      const minPlanLevel = body.min_plan ? (PLAN_LEVELS[body.min_plan.toUpperCase()] ?? oldFlag.min_plan_level) : oldFlag.min_plan_level;
      const newName = body.name || oldFlag.name;
      const newDescription = body.description !== undefined ? body.description : oldFlag.description;
      const newEnabled = body.enabled !== undefined ? body.enabled : oldFlag.enabled;
      
      updated = await sql`
        UPDATE feature_flags
        SET 
          name = ${newName},
          description = ${newDescription},
          enabled = ${newEnabled},
          min_plan_level = ${minPlanLevel},
          updated_at = NOW()
        WHERE key = ${key}
        RETURNING *
      `;
    } else {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    // Log to audit
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

    const result = {
      ...updated[0],
      min_plan: PLAN_NAMES[updated[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag updated successfully' }, req);
  } catch (e) {
    console.error('[flags/update] Error:', e);
    return err(res, 500, 'Failed to update feature flag', { details: e.message }, req);
  }
}

async function deleteFlag(req, res, session, key) {
  try {
    const existing = await sql`
      SELECT * FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feature flag not found', {}, req);
    }

    const flag = existing[0];

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

    await sql`
      DELETE FROM feature_flags WHERE key = ${key}
    `;

    return ok(res, { message: 'Feature flag deleted successfully' }, req);
  } catch (e) {
    console.error('[flags/delete] Error:', e);
    return err(res, 500, 'Failed to delete feature flag', { details: e.message }, req);
  }
}