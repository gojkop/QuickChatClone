// api/lib/email-templates/sign-in.js
// Email template for welcome notification (first-time sign-in)

import { getWelcomeTip } from './tip-bank.js';

export function getSignInTemplate(user) {
  const { name, email, location } = user;
  
  // 🎯 Get random welcome tip
  const welcomeTip = getWelcomeTip();
  
  const firstName = name ? name.split(' ')[0] : 'there';
  const subject = `Welcome to mindPick, ${firstName}!`;

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
        Welcome to mindPick! Your expert profile is ready to set up. Start sharing your expertise and earning today.
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
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Welcome Icon -->
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                          🚀
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Welcome to mindPick!
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          Your expert profile is ready. Let's get you set up.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Welcome Content Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- What is mindPick -->
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">
                          What is mindPick?
                        </h2>
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0;">
                          mindPick connects experts like you with people who need your advice. When someone has a question only you can answer, they pay to ask—and you earn money sharing your expertise through quick video or audio responses.
                        </p>
                        
                        <!-- How It Works -->
                        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                          <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
                            How it works:
                          </p>
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                                <span style="color: #4F46E5; margin-right: 8px; font-weight: 600;">1.</span> Complete your profile and set your rate
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                                <span style="color: #4F46E5; margin-right: 8px; font-weight: 600;">2.</span> Receive paid questions in your inbox
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                                <span style="color: #4F46E5; margin-right: 8px; font-weight: 600;">3.</span> Record your answer (video or audio)
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #4B5563;">
                                <span style="color: #4F46E5; margin-right: 8px; font-weight: 600;">4.</span> Get paid directly to your account
                              </td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- 🎯 DYNAMIC WELCOME TIP -->
                        <div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 8px; padding: 16px 20px;">
                          <p style="font-size: 13px; font-weight: 700; color: #1E40AF; margin: 0 0 6px 0;">
                            💡 GETTING STARTED TIP
                          </p>
                          <p style="font-size: 14px; color: #1E3A8A; margin: 0; line-height: 1.5;">
                            ${welcomeTip}
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
                      <!-- Complete Profile Button (Primary) -->
                      <td style="width: 50%; padding-right: 8px;">
                        <a href="https://mindpick.me/profile/setup" style="display: block; background: #4F46E5; color: white; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);">
                          Complete Your Profile →
                        </a>
                      </td>
                      <!-- Explore Dashboard Button (Secondary) -->
                      <td style="width: 50%; padding-left: 8px;">
                        <a href="https://mindpick.me/expert" style="display: block; background: white; color: #4F46E5; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; border: 2px solid #4F46E5;">
                          Explore Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Next Steps -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFBEB; border-left: 3px solid #F59E0B; border-radius: 8px; padding: 16px 20px;">
                    <tr>
                      <td>
                        <p style="font-size: 14px; color: #78350F; margin: 0 0 8px 0; font-weight: 600;">
                          🎯 Complete your profile to start receiving questions
                        </p>
                        <p style="font-size: 13px; color: #92400E; margin: 0; line-height: 1.5;">
                          Add your bio, expertise areas, set your rate, and choose your response time. A complete profile gets 3x more questions.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center; border-top: 2px solid #F3F4F6;">
                  <p style="font-size: 12px; color: #9CA3AF; margin: 24px 0 8px 0;">
                    Questions? Check our <a href="https://mindpick.me/faq" style="color: #4F46E5; text-decoration: none;">FAQ</a> or reply to this email
                  </p>
                  <p style="font-size: 11px; color: #D1D5DB; margin: 0 0 4px 0;">
                    Signed in at ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} • Wasn't you? <a href="https://mindpick.me/security" style="color: #6B7280; text-decoration: none;">Secure your account</a>
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 4px 0 0 0;">
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
Welcome to mindPick, ${firstName}!

Your expert profile is ready. Let's get you set up.

WHAT IS MINDPICK?
mindPick connects experts like you with people who need your advice. When someone has a question only you can answer, they pay to ask—and you earn money sharing your expertise through quick video or audio responses.

HOW IT WORKS:
1. Complete your profile and set your rate
2. Receive paid questions in your inbox
3. Record your answer (video or audio)
4. Get paid directly to your account

GETTING STARTED TIP: ${welcomeTip}

NEXT STEPS:
• Complete your profile: https://mindpick.me/profile/setup
• Explore dashboard: https://mindpick.me/expert

Complete your profile to start receiving questions. Add your bio, expertise areas, set your rate, and choose your response time. A complete profile gets 3x more questions.

Account: ${email}
Signed in: ${new Date().toLocaleString()}

Questions? Check our FAQ: https://mindpick.me/faq

Wasn't you? Secure your account: https://mindpick.me/security

---
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}