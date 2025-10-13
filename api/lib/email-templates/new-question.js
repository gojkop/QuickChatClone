// api/lib/email-templates/new-question.js
// Email template for new question notification to expert with dynamic tips

import { getExpertTip } from './tip-bank.js';

export function getNewQuestionTemplate(data) {
  const { 
    expertName, 
    questionTitle, 
    questionText, 
    askerEmail, 
    questionId, 
    slaHours = 48,
    questionCategory = 'default' // Category for tip selection
  } = data;

  // 🎯 Get random EXPERT TIP from category-specific pool
  const expertTip = getExpertTip(questionCategory);

  const subject = `New paid question: "${questionTitle}"`;

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
        Paid question from ${askerEmail} • ${slaHours}hr SLA active • Payment confirmed
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
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                    <tr>
                      <td style="padding: 40px 32px;">
                        <!-- Badge -->
                        <div style="display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 20px; margin-bottom: 20px;">
                          <span style="color: white; font-size: 13px; font-weight: 600;">⚡ NEW PAID QUESTION</span>
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Question waiting for you
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          Payment confirmed • ${slaHours}-hour SLA active
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Question Preview Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- Question Title -->
                        <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px 0; line-height: 1.3;">
                          ${questionTitle || 'Untitled Question'}
                        </h2>
                        
                        <!-- Question Text -->
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0; white-space: pre-wrap;">${questionText || 'No description provided.'}</p>
                        
                        <!-- Quick Stats -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                          <tr>
                            <td style="width: 50%; padding: 8px;">
                              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">From</div>
                              <div style="font-size: 14px; font-weight: 600; color: #111827;">${askerEmail}</div>
                            </td>
                            <td style="width: 50%; padding: 8px;">
                              <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Response due</div>
                              <div style="font-size: 14px; font-weight: 600; color: #F59E0B;">
                                ${new Date(Date.now() + slaHours * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- 🎯 DYNAMIC EXPERT TIP -->
                        <div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 8px; padding: 16px 20px;">
                          <p style="font-size: 13px; font-weight: 700; color: #1E40AF; margin: 0 0 6px 0;">
                            💎 EXPERT TIP
                          </p>
                          <p style="font-size: 14px; color: #1E3A8A; margin: 0; line-height: 1.5;">
                            ${expertTip}
                          </p>
                        </div>
                        
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- ✅ TWO-BUTTON CTA -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <!-- Answer Question Button (Primary) -->
                      <td style="width: 50%; padding-right: 8px;">
                        <a href="https://mindpick.me/expert#question-${questionId}" style="display: block; background: #4F46E5; color: white; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);">
                          Answer Question →
                        </a>
                      </td>
                      <!-- View Dashboard Button (Secondary) -->
                      <td style="width: 50%; padding-left: 8px;">
                        <a href="https://mindpick.me/expert" style="display: block; background: white; color: #4F46E5; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; border: 2px solid #4F46E5;">
                          View Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- SLA Performance Reminder -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFBEB; border-left: 3px solid #F59E0B; border-radius: 8px; padding: 16px 20px;">
                    <tr>
                      <td>
                        <p style="font-size: 14px; color: #78350F; margin: 0; line-height: 1.5;">
                          ⏰ <strong>SLA Active:</strong> Responding within ${slaHours} hours maintains your rating and unlocks bonus visibility.
                        </p>
                      </td>
                    </tr>
                  </table>
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
New paid question: "${questionTitle}"

Hi ${expertName || 'there'},

You have a new paid question waiting for your expertise.

Question: ${questionTitle || 'Untitled Question'}

${questionText || 'No description provided.'}

From: ${askerEmail}
Response due: ${new Date(Date.now() + slaHours * 60 * 60 * 1000).toLocaleString()}
SLA: ${slaHours} hours

EXPERT TIP: ${expertTip}

Answer now: https://mindpick.me/expert#question-${questionId}
View dashboard: https://mindpick.me/expert

SLA reminder: Responding within ${slaHours} hours maintains your rating and unlocks bonus visibility.

---
Question #${questionId}
FAQ: https://mindpick.me/faq
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}