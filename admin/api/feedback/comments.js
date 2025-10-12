// admin/api/feedback/comments.js
// Add internal comments to feedback

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

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

  try {
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { feedback_id, comment, is_internal = true } = body;

    if (!feedback_id || !comment || comment.trim().length === 0) {
      return err(res, 400, 'feedback_id and comment required', {}, req);
    }

    // Verify feedback exists
    const feedback = await sql`
      SELECT id FROM feedback WHERE id = ${feedback_id} AND deleted_at IS NULL
    `;

    if (feedback.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    // Add comment
    const newComment = await sql`
      INSERT INTO feedback_comments (
        feedback_id,
        admin_user_id,
        comment,
        is_internal
      ) VALUES (
        ${feedback_id},
        ${session.admin_id},
        ${comment.trim()},
        ${is_internal}
      )
      RETURNING *
    `;

    // Get admin name
    const admin = await sql`
      SELECT name FROM admin_users WHERE id = ${session.admin_id}
    `;

    return ok(res, {
      comment: {
        ...newComment[0],
        admin_name: admin[0]?.name || 'Unknown',
      },
      message: 'Comment added successfully',
    }, req);

  } catch (error) {
    console.error('[feedback/comments] Error:', error);
    return err(res, 500, 'Failed to add comment', {
      details: error.message,
    }, req);
  }
}