// api/lib/zeptomail.js
// ZeptoMail email service for transactional emails

import { getSignInTemplate } from './email-templates/sign-in.js';
import { getNewQuestionTemplate } from './email-templates/new-question.js';
import { getAnswerReceivedTemplate } from './email-templates/answer-received.js';
import { getQuestionConfirmationTemplate } from './email-templates/question-confirmation.js';
import { getAccountDeletionTemplate } from './email-templates/account-deletion.js';
import { getMagicLinkTemplate, getWelcomeEmailTemplate } from './email-templates/magic-link.js';

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
  
  // Validate required parameters
  if (!to) {
    console.error('❌ Missing required parameter: to (email address)');
    throw new Error('Email address (to) is required');
  }
  
  if (!subject) {
    console.error('❌ Missing required parameter: subject');
    throw new Error('Email subject is required');
  }
  
  if (!htmlBody) {
    console.error('❌ Missing required parameter: htmlBody');
    throw new Error('Email htmlBody is required');
  }

  console.log('📧 Sending email via ZeptoMail');
  console.log('   To:', to);
  console.log('   To Name:', toName);
  console.log('   Subject:', subject);

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

    console.log('✅ Email sent successfully');
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

/**
 * Send question confirmation email to payer/asker
 * @param {Object} data - Question data
 * @param {string} data.askerEmail - Asker's email
 * @param {string} data.askerName - Asker's name
 * @param {string} data.expertName - Expert's name
 * @param {string} data.questionTitle - Question title
 * @param {string} data.questionText - Question text
 * @param {number} data.questionId - Question ID
 * @param {number} data.slaHours - SLA hours (optional)
 */
export async function sendQuestionConfirmationNotification(data) {
  const { askerEmail, askerName } = data;
  const { subject, htmlBody, textBody } = getQuestionConfirmationTemplate(data);

  return sendEmail({
    to: askerEmail,
    toName: askerName,
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send account deletion confirmation email
 * @param {Object} data - Deletion data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.userType - 'expert' or 'asker'
 * @param {string} data.deletionDate - ISO date when deletion was completed
 */
export async function sendAccountDeletionNotification(data) {
  const { email, name } = data;

  // Validate email exists
  if (!email) {
    console.error('❌ Cannot send deletion email: email is missing from data:', data);
    throw new Error('Email address is required to send deletion notification');
  }

  console.log('📧 Preparing deletion notification for:', email);

  const { subject, htmlBody, textBody } = getAccountDeletionTemplate(data);

  return sendEmail({
    to: email,
    toName: name || email,
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send magic link authentication email
 * @param {Object} data - Magic link data
 * @param {string} data.to - Recipient email
 * @param {string} data.magicLinkUrl - Full URL with token
 * @param {string} data.verificationCode - 6-digit backup code
 * @param {number} data.expiresInMinutes - Expiration time in minutes (default 15)
 */
export async function sendMagicLinkEmail(data) {
  const { to, magicLinkUrl, verificationCode, expiresInMinutes = 15 } = data;

  // Validate required parameters
  if (!to) {
    console.error('❌ Cannot send magic link: email is missing');
    throw new Error('Email address is required');
  }

  if (!magicLinkUrl) {
    console.error('❌ Cannot send magic link: magicLinkUrl is missing');
    throw new Error('Magic link URL is required');
  }

  if (!verificationCode) {
    console.error('❌ Cannot send magic link: verificationCode is missing');
    throw new Error('Verification code is required');
  }

  console.log('📧 Preparing magic link email for:', to);

  const { subject, htmlBody, textBody } = getMagicLinkTemplate({
    magicLinkUrl,
    verificationCode,
    expiresInMinutes
  });

  return sendEmail({
    to,
    toName: to, // Use email as name since we don't have user name yet
    subject,
    htmlBody,
    textBody,
  });
}

/**
 * Send welcome email for new users
 * @param {Object} data - Welcome email data
 * @param {string} data.to - Recipient email
 * @param {string} data.name - User's name
 * @param {string} data.authMethod - Authentication method used ('magic_link', 'google', 'linkedin')
 */
export async function sendWelcomeEmail(data) {
  const { to, name, authMethod = 'magic_link' } = data;

  // Validate required parameters
  if (!to) {
    console.error('❌ Cannot send welcome email: email is missing');
    throw new Error('Email address is required');
  }

  console.log('📧 Preparing welcome email for:', to);

  const { subject, htmlBody, textBody } = getWelcomeEmailTemplate({
    name: name || to.split('@')[0],
    authMethod
  });

  return sendEmail({
    to,
    toName: name || to,
    subject,
    htmlBody,
    textBody,
  });
}