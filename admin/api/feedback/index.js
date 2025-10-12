// admin/api/feedback/index.js
// Main feedback API - List (admin) and Create (public)

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err, parseBody, validateRequired } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  switch (req.method) {
    case 'GET':
      return listFeedback(req, res);
    case 'POST':
      return createFeedback(req, res);
    default:
      return err(res, 405, 'Method not allowed', {}, req);
  }
}

async function listFeedback(req, res) {
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

  const adminCheck = await sql`SELECT disabled FROM admin_users WHERE id = ${session.admin_id}`;
  
  if (!adminCheck.length || adminCheck[0].disabled) {
    return err(res, 403, 'Admin access revoked', {}, req);
  }

  try {
    const query = req.query;
    const page = query.page || '1';
    const limit = query.limit || '20';
    const type = query.type;
    const status = query.status;
    const priority = query.priority;
    const journey_stage = query.journey_stage;
    const search = query.search;
    const assigned_to = query.assigned_to;
    const has_email = query.has_email;
    const date_from = query.date_from;
    const date_to = query.date_to;
    const sort_by = query.sort_by || 'created_at';
    const sort_order = query.sort_order || 'desc';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const validSortFields = ['created_at', 'updated_at', 'priority', 'rating', 'type', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    const params = [];
    let paramIndex = 1;
    
    let whereClause = 'WHERE deleted_at IS NULL';

    if (type) {
      whereClause = whereClause + ' AND type = $' + paramIndex;
      params.push(type);
      paramIndex = paramIndex + 1;
    }
    if (status) {
      whereClause = whereClause + ' AND status = $' + paramIndex;
      params.push(status);
      paramIndex = paramIndex + 1;
    }
    if (priority) {
      whereClause = whereClause + ' AND priority = $' + paramIndex;
      params.push(priority);
      paramIndex = paramIndex + 1;
    }
    if (journey_stage) {
      whereClause = whereClause + ' AND journey_stage = $' + paramIndex;
      params.push(journey_stage);
      paramIndex = paramIndex + 1;
    }
    if (assigned_to === 'unassigned') {
      whereClause = whereClause + ' AND assigned_to IS NULL';
    } else if (assigned_to) {
      whereClause = whereClause + ' AND assigned_to = $' + paramIndex;
      params.push(parseInt(assigned_to));
      paramIndex = paramIndex + 1;
    }
    if (has_email === 'true') {
      whereClause = whereClause + ' AND email IS NOT NULL';
    }
    if (date_from) {
      whereClause = whereClause + ' AND created_at >= $' + paramIndex;
      params.push(date_from);
      paramIndex = paramIndex + 1;
    }
    if (date_to) {
      whereClause = whereClause + ' AND created_at <= $' + paramIndex;
      params.push(date_to);
      paramIndex = paramIndex + 1;
    }
    if (search) {
      const searchTerm = '%' + search + '%';
      whereClause = whereClause + ' AND (message ILIKE $' + paramIndex + ' OR email ILIKE $' + paramIndex + ' OR page_url ILIKE $' + paramIndex + ')';
      params.push(searchTerm);
      paramIndex = paramIndex + 1;
    }

    const countQuery = 'SELECT COUNT(*) as total FROM feedback ' + whereClause;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0].total);
    
    const mainQueryText = 'SELECT f.*, ' +
      '(SELECT COUNT(*) FROM feedback_attachments fa WHERE fa.feedback_id = f.id) as attachment_count, ' +
      '(SELECT COUNT(*) FROM feedback_comments fc WHERE fc.feedback_id = f.id) as comment_count ' +
      'FROM feedback f ' +
      whereClause + 
      ' ORDER BY f.' + sortField + ' ' + sortDir + 
      ' LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
    
    const mainQueryParams = params.concat([limitNum, offset]);
    const feedback = await sql(mainQueryText, mainQueryParams);

    for (let i = 0; i < feedback.length; i++) {
      const item = feedback[i];
      const tags = await sql`SELECT t.id, t.name, t.color FROM feedback_tags t JOIN feedback_tag_assignments fta ON fta.tag_id = t.id WHERE fta.feedback_id = ${item.id}`;
      item.tags = tags;
    }

    return ok(res, {
      feedback: feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        pages: Math.ceil(total / limitNum)
      }
    }, req);

  } catch (e) {
    console.error('[feedback/list] Error:', e);
    return err(res, 500, 'Failed to fetch feedback', { details: e.message }, req);
  }
}

async function createFeedback(req, res) {
  try {
    const body = parseBody(req);

    const validation = validateRequired(body, ['type', 'message', 'page_url', 'session_id']);
    if (!validation.valid) {
      return err(res, 400, validation.message, {}, req);
    }

    const type = body.type;
    const message = body.message;
    const page_url = body.page_url;
    const session_id = body.session_id;
    const user_agent = body.user_agent || null;
    const user_id = body.user_id || null;
    const email = body.email || null;
    const wants_followup = body.wants_followup || false;
    const rating = body.rating || null;
    const page_title = body.page_title || null;
    const referrer = body.referrer || null;
    const device_type = body.device_type || null;
    const viewport = body.viewport || null;
    const user_role = body.user_role || null;
    const is_authenticated = body.is_authenticated || false;
    const account_age_days = body.account_age_days || null;
    const previous_actions = body.previous_actions || null;
    const bug_severity = body.bug_severity || null;
    const expected_behavior = body.expected_behavior || null;
    const actual_behavior = body.actual_behavior || null;
    const reproduction_steps = body.reproduction_steps || null;
    const problem_statement = body.problem_statement || null;
    const current_workaround = body.current_workaround || null;
    const similar_features = body.similar_features || null;
    const priority_vote = body.priority_vote || null;
    const time_on_page = body.time_on_page || null;
    const scroll_depth = body.scroll_depth || null;
    const interactions_count = body.interactions_count || null;
    const journey_stage = body.journey_stage || null;
    const features_used = body.features_used || null;
    const analytics_consent = body.analytics_consent !== undefined ? body.analytics_consent : true;
    const contact_consent = body.contact_consent || false;
    const screenshot_consent = body.screenshot_consent || false;

    const validTypes = ['bug', 'feature', 'feedback', 'question', 'other'];
    if (!validTypes.includes(type)) {
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
    }

    if (message.length < 10 || message.length > 2000) {
      return err(res, 400, 'Message must be between 10 and 2000 characters', {}, req);
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      return err(res, 400, 'Rating must be between 1 and 5', {}, req);
    }

    const newFeedback = await sql`
      INSERT INTO feedback (
        user_id, session_id, email, wants_followup, type, message, rating,
        page_url, page_title, referrer, user_agent, device_type, viewport,
        user_role, is_authenticated, account_age_days, previous_actions,
        bug_severity, expected_behavior, actual_behavior, reproduction_steps,
        problem_statement, current_workaround, similar_features, priority_vote,
        time_on_page, scroll_depth, interactions_count, journey_stage,
        features_used, analytics_consent, contact_consent, screenshot_consent
      ) VALUES (
        ${user_id}, ${session_id}, ${email}, ${wants_followup}, ${type}, ${message}, ${rating},
        ${page_url}, ${page_title}, ${referrer}, ${user_agent}, ${device_type},
        ${viewport ? JSON.stringify(viewport) : null},
        ${user_role}, ${is_authenticated}, ${account_age_days},
        ${previous_actions ? JSON.stringify(previous_actions) : null},
        ${bug_severity}, ${expected_behavior}, ${actual_behavior}, ${reproduction_steps},
        ${problem_statement}, ${current_workaround}, ${similar_features}, ${priority_vote},
        ${time_on_page}, ${scroll_depth}, ${interactions_count}, ${journey_stage},
        ${features_used}, ${analytics_consent}, ${contact_consent}, ${screenshot_consent}
      )
      RETURNING id, created_at
    `;

    if (body.attachments && Array.isArray(body.attachments)) {
      for (let i = 0; i < body.attachments.length; i++) {
        const attachment = body.attachments[i];
        await sql`
          INSERT INTO feedback_attachments (
            feedback_id, file_type, file_name, file_size, mime_type, storage_key, storage_url
          ) VALUES (
            ${newFeedback[0].id}, ${attachment.file_type || 'screenshot'},
            ${attachment.file_name}, ${attachment.file_size}, ${attachment.mime_type},
            ${attachment.storage_key}, ${attachment.storage_url}
          )
        `;
      }
    }

    console.log('[feedback/create] New ' + type + ' feedback: ' + newFeedback[0].id.slice(0, 8));

    return ok(res, {
      feedback_id: newFeedback[0].id,
      message: 'Thank you! Your feedback helps us improve.'
    }, req);

  } catch (e) {
    console.error('[feedback/create] Error:', e);
    return err(res, 500, 'Failed to create feedback', { details: e.message }, req);
  }
}