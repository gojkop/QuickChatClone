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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Validate sort - CRITICAL: whitelist to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'priority', 'rating', 'type', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    // Build WHERE clause dynamically (same for both count and main query)
    const countParams = [];
    const queryParams = [];
    let paramCount = 1;
    
    let whereClause = 'WHERE deleted_at IS NULL';

    if (type) {
      whereClause += ' AND type = 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(type);
      queryParams.push(type);
      paramCount++;
    }
    if (status) {
      whereClause += ' AND status = 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(status);
      queryParams.push(status);
      paramCount++;
    }
    if (priority) {
      whereClause += ' AND priority = 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(priority);
      queryParams.push(priority);
      paramCount++;
    }
    if (journey_stage) {
      whereClause += ' AND journey_stage = 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(journey_stage);
      queryParams.push(journey_stage);
      paramCount++;
    }
    if (assigned_to === 'unassigned') {
      whereClause += ' AND assigned_to IS NULL';
    } else if (assigned_to) {
      whereClause += ' AND assigned_to = 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(parseInt(assigned_to));
      queryParams.push(parseInt(assigned_to));
      paramCount++;
    }
    if (has_email === 'true') {
      whereClause += ' AND email IS NOT NULL';
    }
    if (date_from) {
      whereClause += ' AND created_at >= 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(date_from);
      queryParams.push(date_from);
      paramCount++;
    }
    if (date_to) {
      whereClause += ' AND created_at <= 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount;
      countParams.push(date_to);
      queryParams.push(date_to);
      paramCount++;
    }
    if (search) {
      const searchParam = '%' + search + '%';
      whereClause += ' AND (message ILIKE 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount + ' OR email ILIKE 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount + ' OR page_url ILIKE 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount + ')';
      countParams.push(searchParam);
      queryParams.push(searchParam);
      paramCount++;
    }

    // Execute count query
    const countQuery = 'SELECT COUNT(*) as total FROM feedback ' + whereClause;
    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);
    
    // Build and execute main query
    const mainQuery = 'SELECT f.*, ' +
      '(SELECT COUNT(*) FROM feedback_attachments fa WHERE fa.feedback_id = f.id) as attachment_count, ' +
      '(SELECT COUNT(*) FROM feedback_comments fc WHERE fc.feedback_id = f.id) as comment_count ' +
      'FROM feedback f ' +
      whereClause + 
      ' ORDER BY f.' + sortField + ' ' + sortDir + 
      ' LIMIT 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + paramCount + ' OFFSET 

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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
 + (paramCount + 1);
    
    queryParams.push(limitNum, offset);

    const feedback = await sql(mainQuery, queryParams);

    // Get tags for each feedback item
    for (const item of feedback) {
      const tags = await sql`
        SELECT t.id, t.name, t.color
        FROM feedback_tags t
        JOIN feedback_tag_assignments fta ON fta.tag_id = t.id
        WHERE fta.feedback_id = ${item.id}
      `;
      item.tags = tags;
    }

    return ok(res, {
      feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      return err(res, 400, 'Invalid type. Must be one of: ' + validTypes.join(', '), {}, req);
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