// admin/api/notifications/config.js
// Notification configuration - alert emails and thresholds

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err, parseBody } from '../_lib/respond.js';

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

  switch (req.method) {
    case 'GET':
      return getConfig(req, res, session);
    case 'PATCH':
      return updateConfig(req, res, session);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

// ============================================================================
// GET NOTIFICATION CONFIG
// ============================================================================
async function getConfig(req, res, session) {
  try {
    // Get current config (should only be one row)
    let config = await sql`
      SELECT * FROM notification_config LIMIT 1
    `;

    // If no config exists, create default
    if (config.length === 0) {
      config = await sql`
        INSERT INTO notification_config (
          alert_emails,
          sla_threshold,
          moderation_threshold
        ) VALUES (
          ARRAY['admin@mindpick.me'],
          90,
          20
        )
        RETURNING *
      `;
    }

    return ok(res, {
      config: config[0]
    }, req);

  } catch (error) {
    console.error('[notifications/get] Error:', error);
    return err(res, 500, 'Failed to fetch notification config', {
      details: error.message
    }, req);
  }
}

// ============================================================================
// UPDATE NOTIFICATION CONFIG
// ============================================================================
async function updateConfig(req, res, session) {
  try {
    const body = parseBody(req);
    
    const updates = {};
    
    // Validate and prepare alert_emails
    if (body.alert_emails !== undefined) {
      let emails;
      
      if (typeof body.alert_emails === 'string') {
        // Parse comma-separated string
        emails = body.alert_emails
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);
      } else if (Array.isArray(body.alert_emails)) {
        emails = body.alert_emails.filter(e => e && e.trim().length > 0);
      } else {
        return err(res, 400, 'alert_emails must be a string or array', {}, req);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(e => !emailRegex.test(e));
      
      if (invalidEmails.length > 0) {
        return err(res, 400, `Invalid email format: ${invalidEmails.join(', ')}`, {}, req);
      }

      updates.alert_emails = emails;
    }

    // Validate and prepare sla_threshold
    if (body.sla_threshold !== undefined) {
      const threshold = parseInt(body.sla_threshold);
      
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        return err(res, 400, 'sla_threshold must be between 0 and 100', {}, req);
      }

      updates.sla_threshold = threshold;
    }

    // Validate and prepare moderation_threshold
    if (body.moderation_threshold !== undefined) {
      const threshold = parseInt(body.moderation_threshold);
      
      if (isNaN(threshold) || threshold < 0) {
        return err(res, 400, 'moderation_threshold must be a positive number', {}, req);
      }

      updates.moderation_threshold = threshold;
    }

    if (Object.keys(updates).length === 0) {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    // Check if config exists
    const existing = await sql`
      SELECT id FROM notification_config LIMIT 1
    `;

    let config;

    if (existing.length === 0) {
      // Create new config with defaults
      config = await sql`
        INSERT INTO notification_config (
          alert_emails,
          sla_threshold,
          moderation_threshold
        ) VALUES (
          ${updates.alert_emails || ['admin@mindpick.me']},
          ${updates.sla_threshold || 90},
          ${updates.moderation_threshold || 20}
        )
        RETURNING *
      `;
    } else {
      // Build update query dynamically
      const setClauses = [];
      const values = [existing[0].id];
      let paramIndex = 2;

      if (updates.alert_emails) {
        setClauses.push(`alert_emails = $${paramIndex}`);
        values.push(updates.alert_emails);
        paramIndex++;
      }
      
      if (updates.sla_threshold !== undefined) {
        setClauses.push(`sla_threshold = $${paramIndex}`);
        values.push(updates.sla_threshold);
        paramIndex++;
      }
      
      if (updates.moderation_threshold !== undefined) {
        setClauses.push(`moderation_threshold = $${paramIndex}`);
        values.push(updates.moderation_threshold);
        paramIndex++;
      }

      setClauses.push('updated_at = NOW()');

      const query = `
        UPDATE notification_config
        SET ${setClauses.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      config = await sql(query, values);
    }

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
        'update_notification_config',
        'notification_config',
        ${config[0].id},
        ${JSON.stringify(updates)}
      )
    `;

    return ok(res, {
      config: config[0],
      message: 'Notification config updated successfully'
    }, req);

  } catch (error) {
    console.error('[notifications/update] Error:', error);
    return err(res, 500, 'Failed to update notification config', {
      details: error.message
    }, req);
  }
}