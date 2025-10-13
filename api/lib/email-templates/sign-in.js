// api/lib/email-templates/sign-in.js
// Email template for sign-in notification

export function getSignInTemplate(user) {
  const subject = 'Welcome back to mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">Welcome back, ${user.name || 'there'}!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          You've successfully signed in to mindPick.me.
        </p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
          <strong>Email:</strong> ${user.email}
        </p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
          <strong>Time:</strong> ${new Date().toLocaleString()}
        </p>
      </div>

      <div style="background-color: #fff; border-left: 4px solid #3498db; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #3498db; margin-bottom: 10px; font-size: 18px;">What you can do now:</h2>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">Browse expert questions in your dashboard</li>
          <li style="margin-bottom: 10px;">Record and submit video answers</li>
          <li style="margin-bottom: 10px;">Help others with your expertise</li>
        </ul>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from mindPick.me
        </p>
        <p style="font-size: 12px; color: #999;">
          If you didn't sign in, please secure your account immediately.
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    Welcome back, ${user.name || 'there'}!

    You've successfully signed in to mindPick.me.

    Email: ${user.email}
    Time: ${new Date().toLocaleString()}

    If you didn't sign in, please secure your account immediately.

    ---
    mindPick.me
  `;

  return { subject, htmlBody, textBody };
}
