// admin/api/flags/index.js (Enhanced with request_body logging)
// Only use this if you ran 002_add_audit_log_columns.sql migration
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
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
    
    if (!match) {
      return err(res, 401, 'Admin authentication required', {}, req);
    }

    let session;
    try {
      session = verifyAdminSession(match[1]);
    } catch (e) {
      console.error('[flags/index] Session verification failed:', e.message);
      return err(res, 401, 'Invalid or expired admin session', {}, req);
    }

    const adminCheck = await sql`
      SELECT disabled FROM admin_users WHERE id = ${session.admin_id}
    `;
    
    if (!adminCheck.length || adminCheck[0].disabled) {
      return err(res, 403, 'Admin access revoked', {}, req);
    }

    switch (req.method) {
      case 'GET':
        return listFlags(req, res, session);
      case 'POST':
        return createFlag(req, res, session);
      default:
        return err(res, 405, 'Method not allowed', {}, req);
    }
  } catch (error) {
    console.error('[flags/index] Unhandled error:', error);
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
    console.error('[flags/index/list] Error:', e);
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

    // Enhanced audit logging (only works if request_body column exists)
    try {
      await sql`
        INSERT INTO admin_audit_log (
          admin_user_id, action, resource_type, resource_id, request_body
        ) VALUES (
          ${session.admin_id}, 
          'create_feature_flag', 
          'feature_flag', 
          ${newFlag[0].id},
          ${JSON.stringify(body)}::jsonb
        )
      `;
    } catch (auditError) {
      // Fallback to basic logging if request_body column doesn't exist
      console.warn('[flags/index] Audit logging with request_body failed, using basic log:', auditError.message);
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
    }

    const result = {
      ...newFlag[0],
      min_plan: PLAN_NAMES[newFlag[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag created successfully' }, req);
  } catch (e) {
    console.error('[flags/index/create] Error:', e);
    return err(res, 500, 'Failed to create feature flag', { 
      details: e.message
    }, req);
  }
}