// admin/api/notifications/test.js
// Send test notification email

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

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

  try {
    // Get current config
    const config = await sql`
      SELECT alert_emails FROM notification_config LIMIT 1
    `;

    if (config.length === 0 || !config[0].alert_emails || config[0].alert_emails.length === 0) {
      return err(res, 400, 'No alert emails configured', {}, req);
    }

    // Get admin name
    const admin = await sql`
      SELECT name, email FROM admin_users WHERE id = ${session.admin_id}
    `;

    const adminName = admin[0]?.name || 'Admin';
    const adminEmail = admin[0]?.email || 'unknown';

    // In production, this would send via Resend/SendGrid
    // For now, we'll simulate the email sending
    const testEmail = {
      to: config[0].alert_emails,
      subject: 'Test Alert - mindPick Admin',
      html: `
        <h2>Test Alert Notification</h2>
        <p>This is a test notification from the mindPick Admin Console.</p>
        <p><strong>Triggered by:</strong> ${adminName} (${adminEmail})</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you received this email, your alert notifications are working correctly.
          You can update your notification settings in the Admin Console.
        </p>
      `
    };

    console.log('[test-notification] Would send email:', testEmail);

    // TODO: Integrate with email service
    // await sendEmail(testEmail);

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
        'test_notification',
        'notification_config',
        'test',
        ${JSON.stringify({
          recipients: config[0].alert_emails,
          timestamp: new Date().toISOString()
        })}
      )
    `;

    return ok(res, {
      message: 'Test notification sent successfully',
      recipients: config[0].alert_emails,
      note: 'Email integration pending - check server logs'
    }, req);

  } catch (error) {
    console.error('[test-notification] Error:', error);
    return err(res, 500, 'Failed to send test notification', {
      details: error.message
    }, req);
  }
}