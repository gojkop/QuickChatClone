// admin/api/flags/index.js
// CRUD endpoints for feature flags management

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

// Plan level constants
const PLAN_LEVELS = {
  FREE: 0,
  PRO: 10,
  ENTERPRISE: 20  // Future use
};

// Plan level to human-readable name
const PLAN_NAMES = {
  0: 'free',
  10: 'pro',
  20: 'enterprise'
};

/**
 * GET /api/flags - List all feature flags
 * POST /api/flags - Create new feature flag
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

  // Verify admin is not disabled
  const adminCheck = await sql`
    SELECT disabled FROM admin_users WHERE id = ${session.admin_id}
  `;
  
  if (!adminCheck.length || adminCheck[0].disabled) {
    return err(res, 403, 'Admin access revoked', {}, req);
  }

  // Route to appropriate handler
  switch (req.method) {
    case 'GET':
      return listFlags(req, res, session);
    case 'POST':
      return createFlag(req, res, session);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

/**
 * List all feature flags with optional filters
 */
async function listFlags(req, res, session) {
  try {
    const { enabled, min_plan } = req.query || {};
    
    let query = sql`
      SELECT 
        id, key, name, description, enabled, 
        min_plan_level, created_at, updated_at
      FROM feature_flags
    `;

    // Apply filters
    const conditions = [];
    
    if (enabled !== undefined) {
      conditions.push(sql`enabled = ${enabled === 'true'}`);
    }
    
    if (min_plan !== undefined) {
      const planLevel = PLAN_LEVELS[min_plan.toUpperCase()] ?? 0;
      conditions.push(sql`min_plan_level = ${planLevel}`);
    }

    // Add WHERE clause if filters exist
    if (conditions.length > 0) {
      query = sql`
        SELECT 
          id, key, name, description, enabled, 
          min_plan_level, created_at, updated_at
        FROM feature_flags
        WHERE ${sql.join(conditions, sql` AND `)}
      `;
    }

    query = sql`${query} ORDER BY created_at DESC`;

    const flags = await query;

    // Transform min_plan_level to human-readable format
    const transformed = flags.map(flag => ({
      ...flag,
      min_plan: PLAN_NAMES[flag.min_plan_level] || 'free'
    }));

    return ok(res, { flags: transformed }, req);
  } catch (e) {
    console.error('[admin] GET /api/flags error:', e);
    return err(res, 500, 'Failed to fetch feature flags', { details: e.message }, req);
  }
}

/**
 * Create new feature flag
 */
async function createFlag(req, res, session) {
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

    const { key, name, description, enabled, min_plan } = body;

    // Validation
    if (!key || !name) {
      return err(res, 400, 'key and name are required', {}, req);
    }

    // Validate key format (alphanumeric + underscores)
    if (!/^[a-z0-9_]+$/.test(key)) {
      return err(res, 400, 'key must contain only lowercase letters, numbers, and underscores', {}, req);
    }

    // Validate name length
    if (name.length < 3 || name.length > 100) {
      return err(res, 400, 'name must be 3-100 characters', {}, req);
    }

    // Validate description length
    if (description && description.length > 500) {
      return err(res, 400, 'description must be max 500 characters', {}, req);
    }

    // Convert min_plan to level
    const minPlanLevel = min_plan ? (PLAN_LEVELS[min_plan.toUpperCase()] ?? 0) : 0;

    // Check for duplicate key
    const existing = await sql`
      SELECT id FROM feature_flags WHERE key = ${key}
    `;

    if (existing.length > 0) {
      return err(res, 409, 'Feature flag with this key already exists', {}, req);
    }

    // Insert new flag
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

    // Log to audit trail
    await sql`
      INSERT INTO admin_audit_log (
        admin_user_id, action, resource_type, resource_id, request_body
      ) VALUES (
        ${session.admin_id}, 
        'create_feature_flag', 
        'feature_flag', 
        ${newFlag[0].id}, 
        ${JSON.stringify(body)}
      )
    `;

    // Transform response
    const result = {
      ...newFlag[0],
      min_plan: PLAN_NAMES[newFlag[0].min_plan_level] || 'free'
    };

    return ok(res, { flag: result, message: 'Feature flag created successfully' }, req);
  } catch (e) {
    console.error('[admin] POST /api/flags error:', e);
    return err(res, 500, 'Failed to create feature flag', { details: e.message }, req);
  }
}