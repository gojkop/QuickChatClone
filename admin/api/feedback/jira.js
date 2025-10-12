// admin/api/feedback/jira.js
// Create Jira ticket from feedback

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';
import { createJiraTicket, uploadAttachmentsToJira } from '../_lib/jira.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  // Only POST allowed
  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed', {}, req);
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

  // Get feedback ID from query or body
  let feedbackId;
  if (req.query && req.query.id) {
    feedbackId = req.query.id;
  } else {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    feedbackId = body.feedback_id;
  }

  if (!feedbackId) {
    return err(res, 400, 'Feedback ID required', {}, req);
  }

  try {
    // Get feedback data
    const feedback = await sql`
      SELECT * FROM feedback
      WHERE id = ${feedbackId} AND deleted_at IS NULL
    `;

    if (feedback.length === 0) {
      return err(res, 404, 'Feedback not found', {}, req);
    }

    const feedbackData = feedback[0];

    // Check if Jira ticket already exists
    if (feedbackData.jira_ticket_key) {
      return err(res, 409, 'Jira ticket already exists', {
        ticket_key: feedbackData.jira_ticket_key,
        ticket_url: feedbackData.jira_ticket_url,
      }, req);
    }

    // Create Jira ticket
    const jiraResult = await createJiraTicket(feedbackData);

    // Get attachments
    const attachments = await sql`
      SELECT * FROM feedback_attachments
      WHERE feedback_id = ${feedbackId}
    `;

    // Upload attachments to Jira
    if (attachments.length > 0) {
      await uploadAttachmentsToJira(jiraResult.key, attachments);
    }

    // Update feedback with Jira info
    await sql`
      UPDATE feedback
      SET 
        jira_ticket_key = ${jiraResult.key},
        jira_ticket_url = ${jiraResult.url},
        jira_created_at = NOW(),
        jira_synced_at = NOW()
      WHERE id = ${feedbackId}
    `;

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
        'create_jira_ticket',
        'feedback',
        ${feedbackId},
        ${JSON.stringify({
          jira_ticket_key: jiraResult.key,
          jira_ticket_url: jiraResult.url,
        })}
      )
    `;

    return ok(res, {
      success: true,
      jira_ticket: jiraResult,
      message: 'Jira ticket created successfully',
    }, req);

  } catch (error) {
    console.error('[feedback/jira] Error:', error);
    return err(res, 500, 'Failed to create Jira ticket', {
      details: error.message,
    }, req);
  }
}