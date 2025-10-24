// api/lib/email-templates/offer-expired.js
// Email template for expired Deep Dive offer with automatic refund notification

export function getOfferExpiredTemplate(data) {
  const {
    askerName,
    questionTitle,
    expertName,
    questionId,
    offeredPrice,
    expirationReason = '24h_timeout' // '24h_timeout' or 'sla_expired'
  } = data;

  const reasonText = expirationReason === '24h_timeout'
    ? 'The expert did not respond to your offer within 24 hours.'
    : 'The answer was not delivered within the agreed timeframe.';

  const subject = `Offer expired - Full refund processed`;

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
        Your offer has expired • Full refund processed • Funds returned to your account
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
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
                    <tr>
                      <td style="padding: 40px 32px; text-align: center;">
                        <!-- Warning Icon -->
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 50%; margin: 0 auto 24px; line-height: 64px; font-size: 32px;">
                          ⏱️
                        </div>
                        <h1 style="color: white; font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 12px 0;">
                          Offer Expired
                        </h1>
                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0;">
                          Your payment has been fully refunded
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Details Card -->
              <tr>
                <td style="padding-top: 32px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <tr>
                      <td style="padding: 32px;">

                        <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0; line-height: 1.6;">
                          Hi ${askerName || 'there'},
                        </p>

                        <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0; line-height: 1.6;">
                          Unfortunately, your Deep Dive offer for <strong>${questionTitle}</strong> to ${expertName} has expired. ${reasonText}
                        </p>

                        <!-- Refund Details -->
                        <div style="background: #F0FDF4; border-left: 3px solid #10B981; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                          <p style="font-size: 14px; font-weight: 700; color: #065F46; margin: 0 0 12px 0;">
                            💰 REFUND PROCESSED
                          </p>
                          <p style="font-size: 14px; color: #047857; margin: 0 0 8px 0;">
                            Amount: <strong>${offeredPrice}</strong>
                          </p>
                          <p style="font-size: 13px; color: #059669; margin: 0;">
                            Your card will be refunded within 5-10 business days
                          </p>
                        </div>

                        <!-- Question Details -->
                        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; margin: 0 0 8px 0;">
                            Question Details
                          </p>
                          <p style="font-size: 14px; color: #374151; margin: 0 0 6px 0;">
                            <strong>Question:</strong> ${questionTitle}
                          </p>
                          <p style="font-size: 14px; color: #374151; margin: 0 0 6px 0;">
                            <strong>Expert:</strong> ${expertName}
                          </p>
                          <p style="font-size: 14px; color: #374151; margin: 0;">
                            <strong>Question ID:</strong> #${questionId}
                          </p>
                        </div>

                        <p style="font-size: 14px; color: #6B7280; margin: 0; line-height: 1.6;">
                          We're sorry this didn't work out. You're welcome to submit a new question or try reaching out to another expert on mindPick.
                        </p>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding-top: 32px; text-align: center;">
                  <a href="https://mindpick.me" style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                    Browse Experts
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
Offer Expired - Full Refund Processed

Hi ${askerName || 'there'},

Unfortunately, your Deep Dive offer for "${questionTitle}" to ${expertName} has expired. ${reasonText}

💰 REFUND PROCESSED
Amount: ${offeredPrice}
Your card will be refunded within 5-10 business days

Question Details:
• Question: ${questionTitle}
• Expert: ${expertName}
• Question ID: #${questionId}

We're sorry this didn't work out. You're welcome to submit a new question or try reaching out to another expert on mindPick.

Browse experts: https://mindpick.me

---
Question #${questionId}
FAQ: https://mindpick.me/faq
© 2025 mindPick • Amsterdam, NL
  `;

  return { subject, htmlBody, textBody };
}
