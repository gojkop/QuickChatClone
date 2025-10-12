// admin/api/feedback/index.js
// Main feedback API - List (admin) and Create (public)

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err, parseBody, validateRequired } from '../_lib/respond.js';

export default async function handler(req, res) {
  // CRITICAL: Handle CORS first, before any other logic
  if (allowCors(req, res)) return;

  // Route based on method
  switch (req.method) {
    case 'GET':
      return listFeedback(req, res);
    case 'POST':
      return createFeedback(req, res);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

// ============================================================================
// LIST FEEDBACK (Admin only - requires authentication)
// ============================================================================

async function listFeedback(req, res) {
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

  try {
    const {
      page = '1',
      limit = '20',
      type,
      status,
      priority,
      journey_stage,
      search,
      assigned_to,
      has_email,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic WHERE clause
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(type);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (journey_stage) {
      conditions.push(`journey_stage = $${paramIndex++}`);
      params.push(journey_stage);
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        conditions.push('assigned_to IS NULL');
      } else {
        conditions.push(`assigned_to = $${paramIndex++}`);
        params.push(parseInt(assigned_to));
      }
    }

    if (has_email === 'true') {
      conditions.push('email IS NOT NULL');
    }

    if (date_from) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(date_from);
    }

    if (date_to) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(date_to);
    }

    if (search) {
      conditions.push(`(
        message ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        page_url ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Validate sort fields
    const validSortFields = ['created_at', 'updated_at', 'priority', 'rating', 'type', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM feedback
      ${whereClause}
    `;
    const countResult = await sql.unsafe(countQuery, params);
    const total = parseInt(countResult[0].total);

    // Get feedback with tags
    const dataQuery = `
      SELECT 
        f.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'color', t.color
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags,
        (
          SELECT COUNT(*)
          FROM feedback_attachments fa
          WHERE fa.feedback_id = f.id
        ) as attachment_count,
        (
          SELECT COUNT(*)
          FROM feedback_comments fc
          WHERE fc.feedback_id = f.id
        ) as comment_count
      FROM feedback f
      LEFT JOIN feedback_tag_assignments fta ON f.id = fta.feedback_id
      LEFT JOIN feedback_tags t ON fta.tag_id = t.id
      ${whereClause}
      GROUP BY f.id
      ORDER BY f.${sortField} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    
    params.push(parseInt(limit), offset);
    const feedback = await sql.unsafe(dataQuery, params);

    return ok(res, {
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, req);

  } catch (e) {
    console.error('[feedback/list] Error:', e);
    return err(res, 500, 'Failed to fetch feedback', { details: e.message }, req);
  }
}

// ============================================================================
// CREATE FEEDBACK (Public endpoint - NO authentication required)
// ============================================================================

async function createFeedback(req, res) {
  try {
    // Parse body
    const body = parseBody(req);

    // Validate required fields
    const validation = validateRequired(body, ['type', 'message', 'page_url', 'session_id']);
    if (!validation.valid) {
      return err(res, 400, validation.message, {}, req);
    }

    const {
      type,
      message,
      page_url,
      session_id,
      user_agent = null,
      user_id = null,
      email = null,
      wants_followup = false,
      rating = null,
      page_title = null,
      referrer = null,
      device_type = null,
      viewport = null,
      user_role = null,
      is_authenticated = false,
      account_age_days = null,
      previous_actions = null,
      bug_severity = null,
      expected_behavior = null,
      actual_behavior = null,
      reproduction_steps = null,
      problem_statement = null,
      current_workaround = null,
      similar_features = null,
      priority_vote = null,
      time_on_page = null,
      scroll_depth = null,
      interactions_count = null,
      journey_stage = null,
      features_used = null,
      analytics_consent = true,
      contact_consent = false,
      screenshot_consent = false,
    } = body;

    // Validate type
    const validTypes = ['bug', 'feature', 'feedback', 'question', 'other'];
    if (!validTypes.includes(type)) {
      return err(res, 400, `Invalid type. Must be one of: ${validTypes.join(', ')}`, {}, req);
    }

    // Validate message length
    if (message.length < 10 || message.length > 2000) {
      return err(res, 400, 'Message must be between 10 and 2000 characters', {}, req);
    }

    // Validate rating if provided
    if (rating !== null && (rating < 1 || rating > 5)) {
      return err(res, 400, 'Rating must be between 1 and 5', {}, req);
    }

    // Insert feedback
    const newFeedback = await sql`
      INSERT INTO feedback (
        user_id,
        session_id,
        email,
        wants_followup,
        type,
        message,
        rating,
        page_url,
        page_title,
        referrer,
        user_agent,
        device_type,
        viewport,
        user_role,
        is_authenticated,
        account_age_days,
        previous_actions,
        bug_severity,
        expected_behavior,
        actual_behavior,
        reproduction_steps,
        problem_statement,
        current_workaround,
        similar_features,
        priority_vote,
        time_on_page,
        scroll_depth,
        interactions_count,
        journey_stage,
        features_used,
        analytics_consent,
        contact_consent,
        screenshot_consent
      ) VALUES (
        ${user_id},
        ${session_id},
        ${email},
        ${wants_followup},
        ${type},
        ${message},
        ${rating},
        ${page_url},
        ${page_title},
        ${referrer},
        ${user_agent},
        ${device_type},
        ${viewport ? JSON.stringify(viewport) : null},
        ${user_role},
        ${is_authenticated},
        ${account_age_days},
        ${previous_actions ? JSON.stringify(previous_actions) : null},
        ${bug_severity},
        ${expected_behavior},
        ${actual_behavior},
        ${reproduction_steps},
        ${problem_statement},
        ${current_workaround},
        ${similar_features},
        ${priority_vote},
        ${time_on_page},
        ${scroll_depth},
        ${interactions_count},
        ${journey_stage},
        ${features_used},
        ${analytics_consent},
        ${contact_consent},
        ${screenshot_consent}
      )
      RETURNING id, created_at
    `;

    // Handle attachments if provided
    if (body.attachments && Array.isArray(body.attachments)) {
      for (const attachment of body.attachments) {
        await sql`
          INSERT INTO feedback_attachments (
            feedback_id,
            file_type,
            file_name,
            file_size,
            mime_type,
            storage_key,
            storage_url
          ) VALUES (
            ${newFeedback[0].id},
            ${attachment.file_type || 'screenshot'},
            ${attachment.file_name},
            ${attachment.file_size},
            ${attachment.mime_type},
            ${attachment.storage_key},
            ${attachment.storage_url}
          )
        `;
      }
    }

    // Log submission
    console.log(`[feedback/create] New ${type} feedback: ${newFeedback[0].id.slice(0, 8)}`);

    return ok(res, {
      feedback_id: newFeedback[0].id,
      message: 'Thank you! Your feedback helps us improve.'
    }, req);

  } catch (e) {
    console.error('[feedback/create] Error:', e);
    return err(res, 500, 'Failed to create feedback', { details: e.message }, req);
  }
}