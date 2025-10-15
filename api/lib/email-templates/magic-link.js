/**
 * Magic Link Sign-In Email Template
 * Sent when user requests passwordless authentication
 */

export function getMagicLinkTemplate({ magicLinkUrl, verificationCode, expiresInMinutes = 15 }) {
  const subject = 'Your QuickChat Sign-In Link';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #6B7280;
      font-size: 14px;
    }
    .content {
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .code-box {
      background-color: #F3F4F6;
      border: 2px dashed #D1D5DB;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin: 24px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #1F2937;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 12px 16px;
      margin: 24px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      color: #6B7280;
      font-size: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
    }
    .footer a {
      color: #4F46E5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">QuickChat</div>
      <div class="subtitle">Video Q&A Platform</div>
    </div>

    <div class="content">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Sign In to QuickChat</h1>
      <p>Hello!</p>
      <p>Click the button below to sign in to your QuickChat account:</p>

      <div style="text-align: center;">
        <a href="${magicLinkUrl}" class="button">Sign In to QuickChat</a>
      </div>

      <p style="margin-top: 24px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6B7280; font-size: 14px; background-color: #F9FAFB; padding: 12px; border-radius: 4px;">
        ${magicLinkUrl}
      </p>

      <div class="warning">
        <strong>⏱️ This link expires in ${expiresInMinutes} minutes</strong> and can only be used once.
      </div>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">

      <div style="text-align: center;">
        <p style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
          <strong>Alternative: Manual Code Entry</strong>
        </p>
        <p style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">
          If the link doesn't work, enter this code on the sign-in page:
        </p>
        <div class="code-box">
          <div class="code">${verificationCode}</div>
        </div>
      </div>

      <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">
        If you didn't request this sign-in link, you can safely ignore this email.
        Your account remains secure.
      </p>
    </div>

    <div class="footer">
      <p>QuickChat - Connect with Experts</p>
      <p>
        <a href="https://mindpick.me">Visit our website</a> |
        <a href="https://mindpick.me/help">Get help</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
QuickChat - Sign In to Your Account

Hello!

Click the link below to sign in to your QuickChat account:

${magicLinkUrl}

This link expires in ${expiresInMinutes} minutes and can only be used once.

Alternative: Manual Code Entry
-------------------------------
If the link doesn't work, enter this code on the sign-in page:

${verificationCode}

If you didn't request this sign-in link, you can safely ignore this email.

---
QuickChat Team
https://mindpick.me
  `;

  return { subject, htmlBody, textBody };
}

export function getWelcomeEmailTemplate({ name, authMethod = 'magic_link' }) {
  const subject = 'Welcome to QuickChat!';

  const authMethodText = {
    magic_link: 'email link',
    google: 'Google',
    linkedin: 'LinkedIn'
  };

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 16px;
    }
    .welcome-message {
      font-size: 24px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 16px;
    }
    .content {
      margin-bottom: 32px;
    }
    .feature-box {
      background-color: #F9FAFB;
      border-radius: 6px;
      padding: 20px;
      margin: 16px 0;
    }
    .feature-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .feature-title {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0;
    }
    .footer {
      text-align: center;
      color: #6B7280;
      font-size: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎉 QuickChat</div>
      <div class="welcome-message">Welcome aboard, ${name}!</div>
    </div>

    <div class="content">
      <p>Thanks for signing up with ${authMethodText[authMethod] || 'email'}. We're excited to have you join our community of experts and knowledge seekers!</p>

      <h2 style="font-size: 20px; margin-top: 32px; margin-bottom: 16px;">What's Next?</h2>

      <div class="feature-box">
        <div class="feature-icon">👤</div>
        <div class="feature-title">Set Up Your Expert Profile</div>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          Share your expertise, set your rates, and start receiving questions from people who need your insights.
        </p>
      </div>

      <div class="feature-box">
        <div class="feature-icon">🎥</div>
        <div class="feature-title">Answer via Video</div>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          Provide personalized video answers that create deeper connections and deliver more value.
        </p>
      </div>

      <div class="feature-box">
        <div class="feature-icon">💰</div>
        <div class="feature-title">Get Paid for Your Knowledge</div>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          Set your own prices and earn money by sharing your expertise with those who need it.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://mindpick.me/expert" class="button">Complete Your Profile</a>
      </div>

      <p style="margin-top: 32px; font-size: 14px; color: #6B7280;">
        Need help getting started? Check out our <a href="https://mindpick.me/help" style="color: #4F46E5;">Getting Started Guide</a>
        or reply to this email with any questions.
      </p>
    </div>

    <div class="footer">
      <p>QuickChat - Connect with Experts</p>
      <p style="margin-top: 8px;">
        <a href="https://mindpick.me" style="color: #4F46E5; text-decoration: none;">Visit Website</a> |
        <a href="https://mindpick.me/help" style="color: #4F46E5; text-decoration: none;">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
Welcome to QuickChat!

Hi ${name},

Thanks for signing up with ${authMethodText[authMethod] || 'email'}. We're excited to have you join our community of experts and knowledge seekers!

What's Next?

1. Set Up Your Expert Profile
   Share your expertise, set your rates, and start receiving questions from people who need your insights.

2. Answer via Video
   Provide personalized video answers that create deeper connections and deliver more value.

3. Get Paid for Your Knowledge
   Set your own prices and earn money by sharing your expertise with those who need it.

Get started: https://mindpick.me/expert

Need help? Visit our Help Center: https://mindpick.me/help

---
QuickChat Team
https://mindpick.me
  `;

  return { subject, htmlBody, textBody };
}
