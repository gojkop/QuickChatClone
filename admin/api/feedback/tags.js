// admin/api/feedback/tags.js
// Manage feedback tags

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  // Verify admin
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
      return listTags(req, res);
    case 'POST':
      return assignTags(req, res, session);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

// List all tags
async function listTags(req, res) {
  try {
    const tags = await sql`
      SELECT * FROM feedback_tags ORDER BY name ASC
    `;

    return ok(res, { tags }, req);
  } catch (error) {
    console.error('[feedback/tags/list] Error:', error);
    return err(res, 500, 'Failed to fetch tags', {}, req);
  }
}

// Assign tags to feedback
async function assignTags(req, res, session) {
  try {
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { feedback_id, tag_ids } = body;

    if (!feedback_id || !Array.isArray(tag_ids)) {
      return err(res, 400, 'feedback_id and tag_ids array required', {}, req);
    }

    // Delete existing tags
    await sql`
      DELETE FROM feedback_tag_assignments
      WHERE feedback_id = ${feedback_id}
    `;

    // Add new tags
    if (tag_ids.length > 0) {
      const values = tag_ids.map(tag_id => ({
        feedback_id,
        tag_id,
        assigned_by: session.admin_id,
      }));

      await sql`
        INSERT INTO feedback_tag_assignments ${sql(values)}
      `;
    }

    return ok(res, {
      message: 'Tags updated successfully',
    }, req);

  } catch (error) {
    console.error('[feedback/tags/assign] Error:', error);
    return err(res, 500, 'Failed to assign tags', {}, req);
  }
}