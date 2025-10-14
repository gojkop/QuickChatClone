// api/lib/email-templates/account-deletion.js
// Email template for account deletion confirmation

export function getAccountDeletionTemplate(data) {
  const { 
    name, 
    email, 
    userType, // 'expert' or 'asker'
    deletionDate, // Date when deletion was completed
  } = data;

  const firstName = name ? name.split(' ')[0] : 'there';
  const isExpert = userType === 'expert';
  
  const subject = `Your mindPick account has been deleted`;

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
        Your mindPick account and all associated data have been permanently deleted. Thank you for using our service.
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
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(75, 85, 99, 0.25);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Icon -->
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                          👋
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Account deleted
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          Your mindPick account has been permanently deleted
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
                          Hi ${firstName},
                        </p>
                        
                        <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0;">
                          Your mindPick account has been permanently deleted as of ${new Date(deletionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. We're sorry to see you go, but we respect your decision and your right to control your data.
                        </p>
                        
                        <!-- What Was Deleted -->
                        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">
                          What has been deleted
                        </h3>
                        <ul style="margin: 0 0 24px 0; padding-left: 20px;">
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            Your profile information (name, bio, photo, settings)
                          </li>
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            Your login credentials and authentication data
                          </li>
                          ${isExpert ? `
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            Your expert profile and all answers
                          </li>
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            All questions and associated media
                          </li>
                          ` : `
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            Your questions and any purchased answers
                          </li>
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">
                            All associated media files
                          </li>
                          `}
                          <li style="font-size: 14px; color: #4B5563; line-height: 1.6;">
                            All personal identifiable information from our systems
                          </li>
                        </ul>
                        
                        <!-- What's Retained (Minimal) -->
                        <div style="background: #FEF3C7; border-left: 3px solid #F59E0B; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                          <p style="font-size: 14px; color: #92400E; margin: 0 0 8px 0; font-weight: 600;">
                            Legal Retention Requirement
                          </p>
                          <p style="font-size: 13px; color: #78350F; margin: 0; line-height: 1.5;">
                            In compliance with EU tax law, anonymized financial transaction records (without any personal identifiable information or content) are retained for 7 years. These records contain only transaction amounts and dates, with no link to your identity.
                          </p>
                        </div>
                        
                        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0;">
                          This deletion complies with GDPR Article 17 (Right to Erasure). For more information, see our <a href="https://mindpick.me/privacy" style="color: #4F46E5; text-decoration: none;">Privacy Policy</a>.
                        </p>
                        
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Feedback (Optional) -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F9FAFB; border-radius: 8px; padding: 20px;">
                    <tr>
                      <td>
                        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 600;">
                          Help us improve (optional)
                        </p>
                        <p style="font-size: 13px; color: #6B7280; margin: 0 0 16px 0; line-height: 1.5;">
                          We'd love to know what we could have done better. Your feedback helps us improve mindPick for everyone.
                        </p>
                        <a href="https://mindpick.me/?feedback=deletion&email=${encodeURIComponent(email)}" style="display: inline-block; background: white; color: #4F46E5; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; border: 2px solid #C7D2FE;">
                          Share Feedback (2 min)
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding-top: 48px; text-align: center; border-top: 2px solid #F3F4F6;">
                  <p style="font-size: 13px; color: #6B7280; margin: 24px 0 8px 0; line-height: 1.6;">
                    Thank you for being part of the mindPick community. We hope to see you again in the future.
                  </p>
                  <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 4px 0;">
                    Questions? Contact us: <a href="mailto:privacy@mindpick.me" style="color: #4F46E5; text-decoration: none;">privacy@mindpick.me</a>
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
ACCOUNT DELETED

Hi ${firstName},

Your mindPick account has been permanently deleted as of ${new Date(deletionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. We're sorry to see you go, but we respect your decision and your right to control your data.

WHAT HAS BEEN DELETED:
• Your profile information (name, bio, photo, settings)
• Your login credentials and authentication data
${isExpert ? `• Your expert profile and all answers
• All questions and associated media` : `• Your questions and any purchased answers
• All associated media files`}
• All personal identifiable information from our systems

LEGAL RETENTION REQUIREMENT:
In compliance with EU tax law, anonymized financial transaction records (without any personal identifiable information or content) are retained for 7 years. These records contain only transaction amounts and dates, with no link to your identity.

This deletion complies with GDPR Article 17 (Right to Erasure).
Privacy Policy: https://mindpick.me/privacy

HELP US IMPROVE (optional):
Share why you're leaving: https://mindpick.me/?feedback=deletion&email=${encodeURIComponent(email)}

Thank you for being part of the mindPick community.

Questions? Contact us: privacy@mindpick.me

---
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}