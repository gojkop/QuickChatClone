// api/lib/email-templates/new-question.js
// Email template for new question notification to expert

export function getNewQuestionTemplate(data) {
  const { expertName, questionTitle, questionText, askerEmail, questionId } = data;

  const subject = 'New question for you — mindPick';

  // Base64 encoded mindPick logo SVG
  const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTEwIDE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2hhdEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNEY0NkU1Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhCNUNGNiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgCiAgPHRleHQgCiAgICB4PSIyMCIgCiAgICB5PSIxMDAiIAogICAgZm9udC1mYW1pbHk9IkludGVyLCBzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIAogICAgZm9udC1zaXplPSI3MiIgCiAgICBmb250LXdlaWdodD0iOTAwIiAKICAgIGxldHRlci1zcGFjaW5nPSItMiI+CiAgICAKICAgIDx0c3BhbiBmaWxsPSIjMUYyOTM3Ij5taW5kPC90c3Bhbj4KICAgIAogICAgPHRzcGFuIGR4PSItMTAiIGZpbGw9InVybCgjY2hhdEdyYWQpIj5QaWNrPC90c3Bhbj4KICA8L3RleHQ+CiAgCiAgPHRleHQgCiAgICB4PSIyMyIgCiAgICB5PSIxMzIiIAogICAgZm9udC1mYW1pbHk9IkludGVyLCBzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIAogICAgZm9udC1zaXplPSIyOCIgCiAgICBmb250LXdlaWdodD0iNjAwIiAKICAgIGxldHRlci1zcGFjaW5nPSIyIiAKICAgIGZpbGw9IiM2QjcyODAiPgogICAgQkVZT05EIEFJIEFOU1dFUlMKICA8L3RleHQ+Cjwvc3ZnPg==';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F3F4F6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827;">
              
              <!-- Logo Header -->
              <tr>
                <td style="padding: 0 0 40px 0;">
                  <img src="${logoBase64}" 
                       alt="mindPick" 
                       width="200" 
                       height="auto" 
                       style="display: block; border: none; height: auto; max-width: 200px;">
                </td>
              </tr>
              
              <!-- Main Content with Icon -->
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 32px; background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%); border-radius: 12px; border-left: 4px solid #7C3AED;">
                        <div style="display: inline-block; width: 48px; height: 48px; background: #4F46E5; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px; margin-bottom: 16px;">
                          🔔
                        </div>
                        <h1 style="font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 16px 0; line-height: 1.2;">
                          New question for you
                        </h1>
                        <p style="font-size: 16px; color: #4B5563; margin: 0;">
                          Hi ${expertName || 'there'},
                        </p>
                        <p style="font-size: 16px; color: #4B5563; margin: 12px 0 0 0;">
                          Someone values your expertise and just asked a question.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Question Details -->
              <tr>
                <td style="padding-top: 24px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 28px; background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px;">
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0; line-height: 1.3;">
                          ${questionTitle || 'Untitled Question'}
                        </h2>
                        <p style="font-size: 15px; color: #4B5563; margin: 0 0 20px 0; line-height: 1.6; white-space: pre-wrap;">${questionText || 'No description provided.'}</p>
                        <div style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 13px; color: #6B7280; padding: 4px 0;">
                                <span style="color: #4F46E5;">✉️</span> <strong style="color: #4B5563;">From:</strong> ${askerEmail}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6B7280; padding: 4px 0;">
                                <span style="color: #7C3AED;">#</span> <strong style="color: #4B5563;">Question ID:</strong> ${questionId}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #6B7280; padding: 4px 0;">
                                <span style="color: #F59E0B;">📥</span> <strong style="color: #4B5563;">Received:</strong> ${new Date().toLocaleString()}
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding-top: 32px; text-align: center;">
                  <a href="https://mindpick.me/expert" style="display: inline-block; padding: 16px 48px; background: #4F46E5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15);">
                    View & Answer →
                  </a>
                </td>
              </tr>
              
              <!-- SLA Reminder -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 20px; background: #FFFBEB; border-radius: 8px; border-left: 3px solid #F59E0B;">
                        <p style="font-size: 14px; color: #78350F; margin: 0; line-height: 1.5;">
                          <span style="font-size: 18px; color: #F59E0B; margin-right: 4px;">⏰</span> <strong style="color: #92400E;">SLA reminder:</strong> Your response window keeps your expert rating strong.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 40px; text-align: center; border-top: 1px solid #E5E7EB; margin-top: 40px;">
                  <p style="font-size: 12px; color: #9CA3AF; margin: 16px 0 0 0;">
                    This is an automated notification from mindPick
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 4px 0 0 0;">
                    <a href="https://mindpick.me" style="color: #4F46E5; text-decoration: none;">mindpick.me</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
New question for you

Hi ${expertName || 'there'},

Someone values your expertise and just asked a question.

Title: ${questionTitle || 'Untitled Question'}

Question:
${questionText || 'No description provided.'}

From: ${askerEmail}
Question ID: ${questionId}
Received: ${new Date().toLocaleString()}

View and answer: https://mindpick.me/expert

SLA reminder: Your response window keeps your expert rating strong.

---
mindPick
  `;

  return { subject, htmlBody, textBody };
}