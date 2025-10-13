// api/lib/email-templates/sign-in.js
// Email template for sign-in notification

export function getSignInTemplate(user) {
  const subject = 'Welcome back — mindPick';

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
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%); border-radius: 12px; border: 2px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 32px;">
                        <div style="display: inline-block; width: 48px; height: 48px; background: #10B981; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                          👋
                        </div>
                        <h1 style="font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 16px 0; line-height: 1.2;">
                          Welcome back, ${user.name || 'there'}
                        </h1>
                        <p style="font-size: 16px; color: #4B5563; margin: 0;">
                          You've successfully signed in to mindPick.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Details -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="font-size: 14px; color: #6B7280; padding: 6px 0;">
                              <span style="color: #4F46E5; font-size: 16px;">📧</span> <strong style="color: #111827;">Email:</strong> ${user.email}
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #6B7280; padding: 6px 0;">
                              <span style="color: #10B981; font-size: 16px;">⏱</span> <strong style="color: #111827;">Time:</strong> ${new Date().toLocaleString()}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Quick Actions -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%); border-radius: 8px; border: 2px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 24px;">
                        <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
                          <span style="font-size: 18px; color: #4F46E5; margin-right: 6px;">🚀</span> What you can do now:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
                          <li style="margin-bottom: 8px; font-size: 14px;">Answer pending questions in your dashboard</li>
                          <li style="margin-bottom: 8px; font-size: 14px;">Record and submit video responses</li>
                          <li style="font-size: 14px;">Share your expertise, get paid fairly</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Security Notice -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FEF2F2; border-radius: 8px; border: 2px solid #FECACA; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="font-size: 13px; color: #7F1D1D; margin: 0; line-height: 1.6;">
                          <span style="font-size: 16px; color: #EF4444; margin-right: 6px;">🔒</span> <strong style="color: #991B1B;">Wasn't you?</strong> Secure your account immediately at mindpick.me/security
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
Welcome back, ${user.name || 'there'}!

You've successfully signed in to mindPick.

Email: ${user.email}
Time: ${new Date().toLocaleString()}

What you can do now:
- Answer pending questions in your dashboard
- Record and submit video responses
- Share your expertise, get paid fairly

Wasn't you? Secure your account immediately at mindpick.me/security

---
mindPick
  `;

  return { subject, htmlBody, textBody };
}