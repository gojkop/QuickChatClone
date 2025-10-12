// admin/api/jira-webhook.js
// Receive webhooks from Jira for two-way sync

import { sql } from './_lib/db.js';
import { allowCors, ok, err } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

  try {
    // Verify webhook signature (optional but recommended)
    const webhookSecret = process.env.JIRA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-atlassian-webhook-signature'];
      // TODO: Verify signature
    }

    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { webhookEvent, issue } = body;

    if (!issue || !issue.key) {
      return err(res, 400, 'Invalid webhook payload', {}, req);
    }

    // Find feedback by Jira ticket key
    const feedback = await sql`
      SELECT id, status, priority
      FROM feedback
      WHERE jira_ticket_key = ${issue.key}
      LIMIT 1
    `;

    if (feedback.length === 0) {
      // Ticket not linked to feedback, ignore
      return ok(res, { message: 'Ticket not linked to feedback' }, req);
    }

    const feedbackId = feedback[0].id;

    // Handle different webhook events
    if (webhookEvent === 'jira:issue_updated') {
      const updates = {};

      // Map Jira status to feedback status
      const jiraStatus = issue.fields.status.name.toLowerCase();
      const statusMapping = {
        'to do': 'new',
        'in progress': 'in_progress',
        'done': 'resolved',
        'closed': 'resolved',
      };

      if (statusMapping[jiraStatus] && statusMapping[jiraStatus] !== feedback[0].status) {
        updates.status = statusMapping[jiraStatus];
        if (updates.status === 'resolved') {
          updates.resolved_at = new Date();
        }
      }

      // Map Jira priority to feedback priority
      const jiraPriority = issue.fields.priority.name.toLowerCase();
      const priorityMapping = {
        'highest': 'critical',
        'high': 'high',
        'medium': 'medium',
        'low': 'low',
      };

      if (priorityMapping[jiraPriority] && priorityMapping[jiraPriority] !== feedback[0].priority) {
        updates.priority = priorityMapping[jiraPriority];
      }

      // Update feedback if there are changes
      if (Object.keys(updates).length > 0) {
        const setClause = Object.keys(updates)
          .map((key, i) => `${key} = $${i + 2}`)
          .join(', ');
        
        const values = [feedbackId, ...Object.values(updates)];
        
        await sql.unsafe(`
          UPDATE feedback
          SET ${setClause}, jira_synced_at = NOW()
          WHERE id = $1
        `, values);

        // Add comment about sync
        await sql`
          INSERT INTO feedback_comments (
            feedback_id,
            admin_user_id,
            comment,
            is_internal
          ) VALUES (
            ${feedbackId},
            NULL,
            'Synced from Jira: Status changed to ' || ${updates.status || 'unchanged'},
            true
          )
        `;
      }
    }

    // Handle comment added
    if (webhookEvent === 'comment_created') {
      const comment = body.comment;
      if (comment && comment.body) {
        await sql`
          INSERT INTO feedback_comments (
            feedback_id,
            admin_user_id,
            comment,
            is_internal
          ) VALUES (
            ${feedbackId},
            NULL,
            'Jira comment: ' || ${comment.body},
            true
          )
        `;
      }
    }

    return ok(res, { message: 'Webhook processed' }, req);

  } catch (error) {
    console.error('[jira-webhook] Error:', error);
    return err(res, 500, 'Failed to process webhook', {
      details: error.message,
    }, req);
  }
}