// api/lib/email-templates/question-confirmation.js
// Email template for question confirmation with dynamic tips

import { getWhileYouWaitTip } from './tip-bank.js';

export function getQuestionConfirmationTemplate(data) {
  const { 
    askerName, 
    questionTitle, 
    questionText, 
    expertName, 
    questionId, 
    slaHours = 48,
    questionCategory = 'default' // Category for tip selection
  } = data;

  // 🎯 Get random WHILE YOU WAIT tip from category-specific pool
  const whileYouWaitTip = getWhileYouWaitTip(questionCategory);

  // ✅ FIX: Use expert name in subject
  const subject = `Question submitted to ${expertName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9FAFB;">
      <!-- Preheader -->
      <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
        Payment confirmed • ${expertName} notified • Expect answer within ${slaHours} hours
      </div>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              
              <!-- Logo -->
              <tr>
                <td style="padding: 32px 0 24px 0;">
                  <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px;">
                    <span style="color: #1F2937;">mind</span><span style="color: #4F46E5;">Pick</span>
                  </div>
                </td>
              </tr>
              
              <!-- Hero Section -->
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Success Icon -->
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                          ✓
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Question submitted
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          ${expertName} has been notified and will respond soon
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Question Summary Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- Your Question -->
                        <div style="background: #F9FAFB; border-left: 3px solid #7C3AED; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #7C3AED; margin: 0 0 8px 0;">
                            Your Question
                          </p>
                          <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">
                            ${questionTitle || 'Untitled Question'}
                          </p>
                        </div>
                        
                        <!-- Status Timeline -->
                        <div style="margin-bottom: 24px;">
                          <div style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                            <span style="color: #10B981; margin-right: 8px;">●</span>
                            <span style="font-size: 14px; color: #111827; font-weight: 600;">Payment confirmed</span>
                            <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">✓ Completed</span>
                          </div>
                          <div style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                            <span style="color: #F59E0B; margin-right: 8px;">●</span>
                            <span style="font-size: 14px; color: #111827; font-weight: 600;">Expert notified</span>
                            <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">⏳ In progress</span>
                          </div>
                          <div style="padding: 12px 0;">
                            <span style="color: #D1D5DB; margin-right: 8px;">●</span>
                            <span style="font-size: 14px; color: #111827; font-weight: 600;">Answer expected</span>
                            <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">Within ${slaHours} hours</span>
                          </div>
                        </div>
                        
                        <!-- 🎯 DYNAMIC WHILE YOU WAIT TIP -->
                        <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 8px; padding: 16px 20px;">
                          <p style="font-size: 13px; font-weight: 700; color: #3730A3; margin: 0 0 6px 0;">
                            📚 WHILE YOU WAIT
                          </p>
                          <p style="font-size: 14px; color: #4338CA; margin: 0; line-height: 1.5;">
                            ${whileYouWaitTip}
                          </p>
                        </div>
                        
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Primary CTA -->
              <tr>
                <td style="padding-top: 32px; text-align: center;">
                  <a href="https://mindpick.me/questions/${questionId}" style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3); transition: all 0.2s;">
                    View Question →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center;">
                  <p style="font-size: 12px; color: #9CA3AF; margin: 24px 0 8px 0;">
                    Question #${questionId} • <a href="https://mindpick.me/faq" style="color: #4F46E5; text-decoration: none;">FAQ</a>
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                    © 2025 mindPick • Amsterdam, NL
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
Question submitted to ${expertName}

Hi ${askerName || 'there'},

Your question has been successfully submitted. Payment confirmed and ${expertName} has been notified.

Your Question: ${questionTitle}
${questionText ? '\n' + questionText : ''}

What happens next:
● Payment confirmed - ✓ Completed
● Expert notified - ⏳ In progress
● Answer expected - Within ${slaHours} hours

WHILE YOU WAIT: ${whileYouWaitTip}

View your question: https://mindpick.me/questions/${questionId}

---
Question #${questionId}
FAQ: https://mindpick.me/faq
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}