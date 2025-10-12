// admin/api/feedback/[id].js
// Single feedback operations - Get, Update, Delete

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  // Extract ID from URL path or query
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

  // Route based on method
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

// ============================================================================
// GET SINGLE FEEDBACK (with all relations)
// ============================================================================

async function getFeedback(req, res, session, feedbackId) {
  try {
    // Get main feedback data with tags
    const feedback = await sql`
      SELECT 
        f.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM feedback f
      LEFT JOIN feedback_tag_assignments fta ON f.id = fta.feedback_id
      LEFT JOIN feedback_tags t ON fta.tag_id = t.id
      WHERE f.id = ${feedbackId}
        AND f.deleted_at IS NULL
      GROUP BY f.id
    `;

    if (feedback.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    // Get attachments
    const attachments = await sql`
      SELECT *
      FROM feedback_attachments
      WHERE feedback_id = ${feedbackId}
      ORDER BY uploaded_at DESC
    `;

    // Get comments
    const comments = await sql`
      SELECT 
        fc.*,
        au.name as admin_name
      FROM feedback_comments fc
      LEFT JOIN admin_users au ON fc.admin_user_id = au.id
      WHERE fc.feedback_id = ${feedbackId}
      ORDER BY fc.created_at DESC
    `;

    // Get similar feedback
    const similar = await sql`
      SELECT 
        f.id,
        f.type,
        f.message,
        f.created_at,
        f.status,
        fs.similarity_score
      FROM feedback_similarities fs
      JOIN feedback f ON (
        CASE 
          WHEN fs.feedback_id_1 = ${feedbackId} THEN f.id = fs.feedback_id_2
          ELSE f.id = fs.feedback_id_1
        END
      )
      WHERE (fs.feedback_id_1 = ${feedbackId} OR fs.feedback_id_2 = ${feedbackId})
        AND fs.similarity_score > 0.7
        AND f.deleted_at IS NULL
      ORDER BY fs.similarity_score DESC
      LIMIT 5
    `;

    return ok(res, {
      feedback: feedback[0],
      attachments,
      comments,
      similar
    }, req);

  } catch (e) {
    console.error('[feedback/get] Error:', e);
    return err(res, 500, 'Failed to fetch feedback', { details: e.message }, req);
  }
}

// ============================================================================
// UPDATE FEEDBACK
// ============================================================================

async function updateFeedback(req, res, session, feedbackId) {
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

    // Check if feedback exists
    const existing = await sql`
      SELECT * FROM feedback WHERE id = ${feedbackId} AND deleted_at IS NULL
    `;

    if (existing.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    // Build update fields dynamically
    const allowedFields = [
      'status', 'priority', 'assigned_to', 'bug_severity', 
      'urgency_level', 'sentiment_score'
    ];
    
    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Handle status transitions
    if (body.status) {
      if (body.status === 'resolved' && !existing[0].resolved_at) {
        updates.resolved_at = new Date();
      } else if (body.status === 'archived' && !existing[0].archived_at) {
        updates.archived_at = new Date();
      }
    }

    if (Object.keys(updates).length === 0) {
      return err(res, 400, 'No valid update fields provided', {}, req);
    }

    // Build SET clause
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');

    const values = [feedbackId, ...Object.values(updates)];

    const updated = await sql.unsafe(`
      UPDATE feedback
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `, values);

    return ok(res, {
      feedback: updated[0],
      message: 'Feedback updated successfully'
    }, req);

  } catch (e) {
    console.error('[feedback/update] Error:', e);
    return err(res, 500, 'Failed to update feedback', { details: e.message }, req);
  }
}

// ============================================================================
// DELETE FEEDBACK (Soft delete)
// ============================================================================

async function deleteFeedback(req, res, session, feedbackId) {
  try {
    const deleted = await sql`
      UPDATE feedback
      SET deleted_at = NOW()
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