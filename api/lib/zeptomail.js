// api/lib/zeptomail.js
// ZeptoMail email service for transactional emails

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.com/v1.1/email';

/**
 * Send email via ZeptoMail API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.toName - Recipient name (optional)
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlBody - HTML email body
 * @param {string} options.textBody - Plain text email body (optional)
 * @returns {Promise<Object>} - ZeptoMail API response
 */
export async function sendEmail({ to, toName, subject, htmlBody, textBody }) {
  const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN;
  const FROM_EMAIL = process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@mindpick.me';
  const FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME || 'mindPick.me Notification';

  if (!ZEPTOMAIL_TOKEN) {
    console.error('ZEPTOMAIL_TOKEN not configured');
    throw new Error('Email service not configured');
  }

  const payload = {
    from: {
      address: FROM_EMAIL,
      name: FROM_NAME,
    },
    to: [
      {
        email_address: {
          address: to,
          name: toName || to,
        },
      },
    ],
    subject: subject,
    htmlbody: htmlBody,
  };

  // Add text body if provided
  if (textBody) {
    payload.textbody = textBody;
  }

  try {
    console.log('📧 Sending email via ZeptoMail to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 From:', FROM_EMAIL);
    console.log('📧 Authorization header:', ZEPTOMAIL_TOKEN?.substring(0, 30) + '...');
    console.log('📧 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(ZEPTOMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    console.log('📧 ZeptoMail response status:', response.status);
    console.log('📧 ZeptoMail response:', responseData);

    if (!response.ok) {
      console.error('❌ ZeptoMail API error:', responseData);
      console.error('❌ Error details:', JSON.stringify(responseData, null, 2));
      throw new Error(JSON.stringify(responseData) || 'Failed to send email');
    }

    console.log('✅ Email sent successfully:', responseData);
    return responseData;

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

/**
 * Send sign-in notification email
 * @param {Object} user - User object with email and name
 */
export async function sendSignInNotification(user) {
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

  return sendEmail({
    to: user.email,
    toName: user.name,
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send new question notification email
 * @param {Object} data - Question data
 * @param {string} data.expertEmail - Expert's email
 * @param {string} data.expertName - Expert's name
 * @param {string} data.questionTitle - Question title
 * @param {string} data.questionText - Question text
 * @param {string} data.askerEmail - Asker's email
 * @param {number} data.questionId - Question ID
 */
export async function sendNewQuestionNotification(data) {
  const { expertEmail, expertName, questionTitle, questionText, askerEmail, questionId } = data;

  const subject = 'New Question Received on mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0f9ff; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">🎉 New Question for You!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Hi ${expertName || 'there'},
        </p>
        <p style="font-size: 16px; margin-bottom: 15px;">
          You've received a new question on mindPick.me!
        </p>
      </div>

      <div style="background-color: #fff; border: 2px solid #3498db; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #3498db; margin-bottom: 15px; font-size: 20px;">${questionTitle || 'Untitled Question'}</h2>
        <p style="font-size: 14px; color: #555; margin-bottom: 15px; white-space: pre-wrap;">
          ${questionText || 'No description provided.'}
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>From:</strong> ${askerEmail}
          </p>
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Question ID:</strong> ${questionId}
          </p>
          <p style="font-size: 13px; color: #666;">
            <strong>Received:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://mindpick.me/expert"
           style="display: inline-block; background-color: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          View & Answer Question
        </a>
      </div>

      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #856404; margin: 0;">
          ⏱️ <strong>Reminder:</strong> Remember to respond within your SLA timeframe to maintain your expert rating!
        </p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from mindPick.me
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    New Question for You!

    Hi ${expertName || 'there'},

    You've received a new question on mindPick.me!

    Title: ${questionTitle || 'Untitled Question'}

    Question:
    ${questionText || 'No description provided.'}

    From: ${askerEmail}
    Question ID: ${questionId}
    Received: ${new Date().toLocaleString()}

    Visit https://mindpick.me/expert to view and answer the question.

    Reminder: Remember to respond within your SLA timeframe to maintain your expert rating!

    ---
    mindPick.me
  `;

  return sendEmail({
    to: expertEmail,
    toName: expertName,
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send answer received notification email
 * @param {Object} data - Answer data
 * @param {string} data.askerEmail - Asker's email
 * @param {string} data.askerName - Asker's name
 * @param {string} data.expertName - Expert's name
 * @param {string} data.questionTitle - Question title
 * @param {string} data.questionId - Question ID
 * @param {string} data.answerId - Answer ID
 */
export async function sendAnswerReceivedNotification(data) {
  const { askerEmail, askerName, expertName, questionTitle, questionId, answerId } = data;

  const subject = 'Your Question Has Been Answered on mindPick.me';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0fdf4; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">🎊 Great News!</h1>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Hi ${askerName || 'there'},
        </p>
        <p style="font-size: 16px; margin-bottom: 15px;">
          Your question has been answered by <strong>${expertName}</strong>!
        </p>
      </div>

      <div style="background-color: #fff; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin-bottom: 15px; font-size: 20px;">Your Question:</h2>
        <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
          ${questionTitle || 'Untitled Question'}
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Answered by:</strong> ${expertName}
          </p>
          <p style="font-size: 13px; color: #666; margin-bottom: 5px;">
            <strong>Question ID:</strong> ${questionId}
          </p>
          <p style="font-size: 13px; color: #666;">
            <strong>Answered at:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://mindpick.me/questions/${questionId}"
           style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          View Answer Now
        </a>
      </div>

      <div style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #075985; margin: 0;">
          💡 <strong>Did this answer help you?</strong> Don't forget to provide feedback to help us improve!
        </p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from mindPick.me
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    Great News!

    Hi ${askerName || 'there'},

    Your question has been answered by ${expertName}!

    Your Question: ${questionTitle || 'Untitled Question'}

    Answered by: ${expertName}
    Question ID: ${questionId}
    Answered at: ${new Date().toLocaleString()}

    Visit https://mindpick.me/questions/${questionId} to view the answer.

    Did this answer help you? Don't forget to provide feedback to help us improve!

    ---
    mindPick.me
  `;

  return sendEmail({
    to: askerEmail,
    toName: askerName,
    subject,
    htmlBody,
    textBody,
  });
}
