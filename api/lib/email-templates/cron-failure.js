// api/lib/email-templates/cron-failure.js
// Email template for cron job failures

/**
 * Generate cron job failure email template
 * @param {Object} data - Failure data
 * @param {string} data.jobName - Name of the cron job
 * @param {string} data.errorMessage - Error message
 * @param {string} data.timestamp - Failure timestamp
 * @param {Object} data.details - Additional details (optional)
 * @returns {Object} - Email subject and body
 */
export function getCronFailureTemplate(data) {
  const { jobName, errorMessage, timestamp, details } = data;

  const subject = `[ALERT] Cron Job Failed: ${jobName}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #dc2626;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .error-box {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
      color: #991b1b;
    }
    .details {
      background-color: white;
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .details pre {
      margin: 0;
      font-size: 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">⚠️ Cron Job Failure Alert</h2>
  </div>
  <div class="content">
    <p><strong>Job Name:</strong> ${jobName}</p>
    <p><strong>Timestamp:</strong> ${timestamp}</p>

    <div class="error-box">
      <strong>Error:</strong><br/>
      ${errorMessage}
    </div>

    ${details ? `
    <div class="details">
      <strong>Additional Details:</strong>
      <pre>${JSON.stringify(details, null, 2)}</pre>
    </div>
    ` : ''}

    <p style="margin-top: 20px;">
      <strong>Action Required:</strong><br/>
      Please investigate the error and check the Vercel logs for more information.
    </p>
  </div>
  <div class="footer">
    <p>This is an automated alert from mindPick.me cron monitoring system.</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
CRON JOB FAILURE ALERT

Job Name: ${jobName}
Timestamp: ${timestamp}

Error:
${errorMessage}

${details ? `Additional Details:\n${JSON.stringify(details, null, 2)}\n` : ''}

Action Required:
Please investigate the error and check the Vercel logs for more information.

---
This is an automated alert from mindPick.me cron monitoring system.
  `.trim();

  return { subject, htmlBody, textBody };
}
