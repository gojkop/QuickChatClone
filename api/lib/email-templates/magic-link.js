/**
 * Magic Link Sign-In Email Template
 * Sent when user requests passwordless authentication
 * Updated to match mindPick branding and design system
 */

export function getMagicLinkTemplate({ magicLinkUrl, verificationCode, expiresInMinutes = 15 }) {
  const subject = 'Your mindPick sign-in link';

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
    Your secure sign-in link for mindPick. Expires in ${expiresInMinutes} minutes.
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
                    <!-- Icon -->
                    <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                      🔐
                    </div>
                    <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                      Sign in to mindPick
                    </h1>
                    <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                      Your secure access link is ready
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
                    
                    <!-- Greeting -->
                    <p style="font-size: 16px; color: #111827; margin: 0 0 24px 0;">
                      Hi there,
                    </p>
                    
                    <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0;">
                      Click the button below to securely sign in to your mindPick account:
                    </p>
                    
                    <!-- Primary CTA Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${magicLinkUrl}" style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);">
                        Sign In Now →
                      </a>
                    </div>
                    
                    <!-- Alternative Link -->
                    <div style="background: #F9FAFB; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
                      <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0; font-weight: 600;">
                        Button not working? Copy this link:
                      </p>
                      <p style="font-size: 12px; color: #4B5563; margin: 0; word-break: break-all; font-family: 'Courier New', monospace; background: white; padding: 10px; border-radius: 6px; border: 1px solid #E5E7EB;">
                        ${magicLinkUrl}
                      </p>
                    </div>
                    
                    <!-- Security Warning -->
                    <div style="background: #FEF3C7; border-left: 3px solid #F59E0B; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="font-size: 14px; color: #92400E; margin: 0 0 8px 0; font-weight: 600;">
                        ⏱️ Important Security Notice
                      </p>
                      <p style="font-size: 13px; color: #78350F; margin: 0; line-height: 1.5;">
                        This link expires in <strong>${expiresInMinutes} minutes</strong> and can only be used once for security reasons.
                      </p>
                    </div>
                    
                    <!-- Manual Code Entry -->
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
                    
                    <div style="text-align: center;">
                      <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px 0; font-weight: 600;">
                        Alternative: Manual Code Entry
                      </p>
                      <p style="font-size: 13px; color: #6B7280; margin: 0 0 16px 0;">
                        If the link doesn't work, enter this code on the sign-in page:
                      </p>
                      <div style="background: #F9FAFB; border: 2px dashed #D1D5DB; border-radius: 8px; padding: 16px; margin: 0 auto; max-width: 280px;">
                        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4F46E5; font-family: 'Courier New', monospace;">
                          ${verificationCode}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Didn't Request -->
                    <p style="font-size: 14px; color: #6B7280; margin: 32px 0 0 0; line-height: 1.6; text-align: center;">
                      If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
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
                Need help? Contact us: <a href="mailto:support@mindpick.me" style="color: #4F46E5; text-decoration: none;">support@mindpick.me</a>
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
SIGN IN TO MINDPICK

Hi there,

Click the link below to securely sign in to your mindPick account:

${magicLinkUrl}

SECURITY NOTICE:
This link expires in ${expiresInMinutes} minutes and can only be used once.

ALTERNATIVE: MANUAL CODE ENTRY
If the link doesn't work, enter this code on the sign-in page:

${verificationCode}

If you didn't request this sign-in link, you can safely ignore this email.

---
Need help? Contact us: support@mindpick.me
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}

/**
 * Note: For welcome emails (first-time users), use the existing 
 * getSignInTemplate() function from sign-in.js instead of creating
 * a duplicate. This ensures consistency across all sign-in methods
 * (Google, LinkedIn, and Magic Link).
 * 
 * Example usage:
 * 
 * import { getSignInTemplate } from './sign-in.js';
 * 
 * // For first-time users
 * if (isNewUser) {
 *   const welcomeEmail = getSignInTemplate(user);
 *   await emailService.sendEmail({
 *     to: user.email,
 *     subject: welcomeEmail.subject,
 *     html: welcomeEmail.htmlBody,
 *     text: welcomeEmail.textBody
 *   });
 * }
 */