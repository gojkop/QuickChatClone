// api/lib/zeptomail.js
// ZeptoMail email service for transactional emails

import { getSignInTemplate } from './email-templates/sign-in.js';
import { getNewQuestionTemplate } from './email-templates/new-question.js';
import { getAnswerReceivedTemplate } from './email-templates/answer-received.js';

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.eu/v1.1/email';

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

    if (!response.ok) {
      console.error('❌ ZeptoMail API error:', responseData);
      throw new Error(JSON.stringify(responseData) || 'Failed to send email');
    }

    console.log('✅ Email sent successfully to:', to);
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
  const { subject, htmlBody, textBody } = getSignInTemplate(user);

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
  const { expertEmail, expertName } = data;
  const { subject, htmlBody, textBody } = getNewQuestionTemplate(data);

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
  const { askerEmail, askerName } = data;
  const { subject, htmlBody, textBody } = getAnswerReceivedTemplate(data);

  return sendEmail({
    to: askerEmail,
    toName: askerName,
    subject,
    htmlBody,
    textBody,
  });
}
