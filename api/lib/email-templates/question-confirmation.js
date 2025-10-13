// api/lib/email-templates/question-confirmation.js
// Email template for question confirmation to payer/asker

export function getQuestionConfirmationTemplate(data) {
  const { askerName, questionTitle, questionText, expertName, questionId, slaHours } = data;

  const subject = 'Question submitted successfully — mindPick';

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
    <body style="margin: 0; padding: 0; background-color: #FFFFFF;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFFFF; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827;">
              
              <!-- Logo Header -->
              <tr>
                <td style="padding: 0 0 40px 0;">
                  <!-- Logo as text - always works -->
                  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -1px; color: #1F2937;">
                    <span style="color: #1F2937;">mind</span><span style="color: #4F46E5;">Pick</span>
                  </div>
                </td>
              </tr>
              
              <!-- Main Content with Icon -->
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%); border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 32px;">
                        <div style="display: inline-block; width: 48px; height: 48px; background: #10B981; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px; margin-bottom: 16px; color: white; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                          ✓
                        </div>
                        <h1 style="font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 16px 0; line-height: 1.2;">
                          Question submitted successfully
                        </h1>
                        <p style="font-size: 16px; color: #4B5563; margin: 0;">
                          Hi ${askerName || 'there'},
                        </p>
                        <p style="font-size: 16px; color: #4B5563; margin: 12px 0 0 0;">
                          Your question has been sent to <strong style="color: #111827;">${expertName || 'the expert'}</strong>. We'll notify you when they respond.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Question Details -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #7C3AED; margin: 0 0 12px 0;">
                          📝 Your Question
                        </p>
                        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0; line-height: 1.4;">
                          ${questionTitle || 'Untitled Question'}
                        </h2>
                        <p style="font-size: 15px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6; white-space: pre-wrap;">${questionText || 'No description provided.'}</p>
                        <div style="border-top: 2px solid #F3F4F6; padding-top: 20px; margin-top: 20px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 14px; color: #6B7280; padding: 6px 0;">
                                <span style="color: #7C3AED; font-size: 16px;">#</span> <strong style="color: #111827;">Question ID:</strong> ${questionId}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #6B7280; padding: 6px 0;">
                                <span style="color: #4F46E5; font-size: 16px;">📤</span> <strong style="color: #111827;">Submitted:</strong> ${new Date().toLocaleString()}
                              </td>
                            </tr>
                            ${slaHours ? `<tr>
                              <td style="font-size: 14px; color: #6B7280; padding: 6px 0;">
                                <span style="color: #10B981; font-size: 16px;">⏱</span> <strong style="color: #111827;">Expected Response:</strong> Within ${slaHours} hours
                              </td>
                            </tr>` : ''}
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
                  <a href="https://mindpick.me/dashboard" style="display: inline-block; padding: 16px 48px; background: #4F46E5; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                    View Your Questions →
                  </a>
                </td>
              </tr>
              
              <!-- What's Next Box -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F0FDF4; border-radius: 8px; border: 2px solid #BBF7D0; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="font-size: 14px; color: #166534; margin: 0; line-height: 1.6;">
                          <span style="font-size: 18px; color: #10B981; margin-right: 6px;">🔔</span> <strong style="color: #15803D;">What's next?</strong> ${expertName || 'The expert'} has been notified and will answer soon. You'll receive an email when your answer is ready.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center; border-top: 2px solid #F3F4F6; margin-top: 48px;">
                  <p style="font-size: 12px; color: #9CA3AF; margin: 24px 0 0 0;">
                    This is an automated confirmation from mindPick
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
Question submitted successfully

Hi ${askerName || 'there'},

Your question has been sent to ${expertName || 'the expert'}. We'll notify you when they respond.

Your Question:
${questionTitle || 'Untitled Question'}

${questionText || 'No description provided.'}

Question ID: ${questionId}
Submitted: ${new Date().toLocaleString()}
${slaHours ? `Expected Response: Within ${slaHours} hours` : ''}

What's next?
${expertName || 'The expert'} has been notified and will answer soon. You'll receive an email when your answer is ready.

View your questions: https://mindpick.me/dashboard

---
mindPick
  `;

  return { subject, htmlBody, textBody };
}