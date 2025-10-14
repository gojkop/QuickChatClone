// api/lib/email-templates/answer-received.js
// Email template for answer received notification with dynamic tips

import { getProTip } from './tip-bank.js';

export function getAnswerReceivedTemplate(data) {
  const { 
    askerName, 
    expertName, 
    questionTitle, 
    questionId,
    reviewToken, // ✅ Review token for direct access link
    answeredAt,
    questionCategory = 'default' // Category for tip selection
  } = data;

  // 🎯 Get random PRO TIP from category-specific pool
  const proTip = getProTip(questionCategory);

  const subject = `${expertName} answered your question`;

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
        ${expertName} answered your question about "${questionTitle}". View their insight now.
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
                          Your answer is ready
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          ${expertName} just shared their expert insight
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- Your Question -->
                        <div style="background: #F9FAFB; border-left: 3px solid #7C3AED; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #7C3AED; margin: 0 0 8px 0;">
                            Your Question
                          </p>
                          <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">
                            ${questionTitle || 'Your question'}
                          </p>
                        </div>
                        
                        <!-- Key Details -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 28px;">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6;">
                              <span style="font-size: 14px; color: #6B7280;">Answered by</span>
                              <div style="font-size: 16px; font-weight: 600; color: #111827; margin-top: 4px;">${expertName}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="font-size: 14px; color: #6B7280;">Response time</span>
                              <div style="font-size: 16px; font-weight: 600; color: #10B981; margin-top: 4px;">Within SLA ✓</div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- 🎯 DYNAMIC PRO TIP -->
                        <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                          <p style="font-size: 13px; font-weight: 700; color: #92400E; margin: 0 0 6px 0;">
                            💡 PRO TIP
                          </p>
                          <p style="font-size: 14px; color: #78350F; margin: 0; line-height: 1.5;">
                            ${proTip}
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
                  <a href="https://mindpick.me/r/${reviewToken}" style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3); transition: all 0.2s;">
                    View Answer Now →
                  </a>
                </td>
              </tr>
              
              <!-- What's Next -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 24px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                        <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
                          After viewing, you can:
                        </p>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                              <span style="color: #10B981; margin-right: 8px;">✓</span> Rate the answer quality
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                              <span style="color: #10B981; margin-right: 8px;">✓</span> Ask a follow-up question
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                              <span style="color: #10B981; margin-right: 8px;">✓</span> Download media & files
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center; border-top: 2px solid #F3F4F6;">
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
${expertName} answered your question

Hi ${askerName || 'there'},

${expertName} has shared their expert insight on your question: "${questionTitle}"

View your personalized answer now:
https://mindpick.me/r/${reviewToken}

PRO TIP: ${proTip}

After viewing, you can:
✓ Rate the answer quality
✓ Ask a follow-up question
✓ Download media & files

---
Question #${questionId}
FAQ: https://mindpick.me/faq
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}