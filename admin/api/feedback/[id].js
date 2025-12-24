// admin/api/feedback/[id].js
// Single feedback operations - Get, Update, Delete

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err, parseBody } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  let feedbackId;
  if (req.query && req.query.id) {
    feedbackId = req.query.id;
  } else {
    const urlParts = req.url.split('?')[0].split('/');
    feedbackId = urlParts[urlParts.length - 1];
  }

  if (!feedbackId) {
    return err(res, 400, 'Feedback ID required', {}, req);
  }

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
      return getFeedback(req, res, session, feedbackId);
    case 'PATCH':
      return updateFeedback(req, res, session, feedbackId);
    case 'DELETE':
      return deleteFeedback(req, res, session, feedbackId);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

async function getFeedback(req, res, session, feedbackId) {
  try {
    const feedback = await sql`
      SELECT f.* FROM feedback f
      WHERE f.id = ${feedbackId} AND f.deleted_at IS NULL
    `;

    if (feedback.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    const tags = await sql`
      SELECT t.id, t.name, t.color
      FROM feedback_tags t
      JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
      WHERE fta.feedback_id = ${feedbackId}
    `;

    const attachments = await sql`
      SELECT * FROM feedback_attachments
      WHERE feedback_id = ${feedbackId}
      ORDER BY uploaded_at DESC
    `;

    const comments = await sql`
      SELECT fc.*, au.name as admin_name
      FROM feedback_comments fc
      LEFT JOIN admin_users au ON fc.admin_user_id = au.id
      WHERE fc.feedback_id = ${feedbackId}
      ORDER BY fc.created_at DESC
    `;

    const similarQuery = 'SELECT f.id, f.type, f.message, f.created_at, f.status, fs.similarity_score ' +
      'FROM feedback_similarities fs ' +
      'JOIN feedback f ON (CASE WHEN fs.feedback_id_1 = $1 THEN f.id = fs.feedback_id_2 ELSE f.id = fs.feedback_id_1 END) ' +
      'WHERE (fs.feedback_id_1 = $1 OR fs.feedback_id_2 = $1) AND fs.similarity_score > 0.7 AND f.deleted_at IS NULL ' +
      'ORDER BY fs.similarity_score DESC LIMIT 5';
    
    const similar = await sql.query(similarQuery, [feedbackId]);

    const result = feedback[0];
    result.tags = tags;

    return ok(res, {
      feedback: result,
      attachments: attachments,
      comments: comments,
      similar: similar
    }, req);

  } catch (e) {
    console.error('[feedback/get] Error:', e);
    return err(res, 500, 'Failed to fetch feedback', { details: e.message }, req);
  }
}

async function updateFeedback(req, res, session, feedbackId) {
  try {
    const body = parseBody(req);

    const existing = await sql`
      SELECT * FROM feedback WHERE id = ${feedbackId} AND deleted_at IS NULL
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    const allowedFields = [
      'status', 'priority', 'assigned_to', 'bug_severity', 
      'urgency_level', 'sentiment_score'
    ];
    
    const updates = [];
    const values = [feedbackId];
    let paramIndex = 2;

    for (let i = 0; i < allowedFields.length; i++) {
      const field = allowedFields[i];
      if (body[field] !== undefined) {
        updates.push(field + ' = $' + paramIndex);
        values.push(body[field]);
        paramIndex = paramIndex + 1;
      }
    }

    if (body.status) {
      if (body.status === 'resolved' && !existing[0].resolved_at) {
        updates.push('resolved_at = NOW()');
      } else if (body.status === 'archived' && !existing[0].archived_at) {
        updates.push('archived_at = NOW()');
      }
    }

    if (updates.length === 0) {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    const updateQuery = 'UPDATE feedback SET ' + updates.join(', ') + ', updated_at = NOW() ' +
      'WHERE id = $1 AND deleted_at IS NULL RETURNING *';

    const updated = await sql.query(updateQuery, values);

    if (updated.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    return ok(res, {
      feedback: updated[0],
      message: 'Feedback updated successfully'
    }, req);

  } catch (e) {
    console.error('[feedback/update] Error:', e);
    return err(res, 500, 'Failed to update feedback', { details: e.message }, req);
  }
}

async function deleteFeedback(req, res, session, feedbackId) {
  try {
    const deleted = await sql`
      UPDATE feedback SET deleted_at = NOW()
      WHERE id = ${feedbackId} AND deleted_at IS NULL
      RETURNING id
    `;

    if (deleted.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    return ok(res, {
      message: 'Feedback archived successfully'
    }, req);

  } catch (e) {
    console.error('[feedback/delete] Error:', e);
    return err(res, 500, 'Failed to delete feedback', { details: e.message }, req);
  }
}