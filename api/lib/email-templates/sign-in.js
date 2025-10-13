// api/lib/email-templates/sign-in.js
// Email template for sign-in notification

export function getSignInTemplate(user) {
  const { name, email, location } = user;
  
  const subject = `Welcome back to mindPick`;

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
        Successful sign-in at ${new Date().toLocaleString()} • Secure your account if this wasn't you
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
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Icon -->
                        <div style="width: 64px; height: 64px; background: #10B981; border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                          👋
                        </div>
                        <h1 style="color: #111827; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Welcome back${name ? ', ' + name.split(' ')[0] : ''}
                        </h1>
                        <p style="color: #4B5563; font-size: 18px; margin: 0;">
                          You've successfully signed in to your account
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Sign-in Details Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        
                        <!-- Details -->
                        <div style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                          <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0;">Account</p>
                          <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">${email}</p>
                        </div>
                        <div style="padding: 12px 0;">
                          <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0;">Time</p>
                          <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Quick Actions -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 12px; padding: 24px; border: 2px solid #C7D2FE;">
                    <tr>
                      <td>
                        <p style="font-size: 14px; font-weight: 700; color: #3730A3; margin: 0 0 16px 0;">
                          🚀 Quick actions:
                        </p>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding: 0 4px 0 0; width: 50%;">
                              <a href="https://mindpick.me/dashboard" style="display: block; text-decoration: none; padding: 12px; background: white; border: 2px solid #A5B4FC; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; color: #4F46E5;">
                                View Dashboard
                              </a>
                            </td>
                            <td style="padding: 0 0 0 4px; width: 50%;">
                              <a href="https://mindpick.me/profile/setup" style="display: block; text-decoration: none; padding: 12px; background: white; border: 2px solid #A5B4FC; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; color: #4F46E5;">
                                Profile Setup
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Security Alert -->
              <tr>
                <td style="padding-top: 24px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FEF2F2; border-left: 3px solid #EF4444; border-radius: 8px; padding: 16px 20px;">
                    <tr>
                      <td>
                        <p style="font-size: 14px; color: #7F1D1D; margin: 0; line-height: 1.5;">
                          🔒 <strong>Wasn't you?</strong> Secure your account immediately at mindpick.me/security
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
                    <a href="https://mindpick.me/faq" style="color: #4F46E5; text-decoration: none;">FAQ</a>
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
Welcome back to mindPick

Hi ${name || 'there'},

You've successfully signed in to your account.

Account: ${email}
Time: ${new Date().toLocaleString()}
${location ? 'Location: ' + location : ''}

Quick actions:
• View Dashboard: https://mindpick.me/dashboard
• Profile Setup: https://mindpick.me/profile/setup

SECURITY: Wasn't you? Secure your account immediately at https://mindpick.me/security

---
FAQ: https://mindpick.me/faq
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}