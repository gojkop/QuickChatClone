// ============================================
// FILE: src/templates/emails/plaintext.js
// Plain text email templates for fallback
// ============================================

/**
 * Plain text version of sign-in email
 */
function signInPlainText(magicLink, platformName) {
  return `
Sign In Request
${platformName}

Hi there,

We received a request to sign in to your account. Click the link below to securely access your account:

${magicLink}

SECURITY NOTE: This link will expire in 15 minutes and can only be used once.

If you didn't request this sign-in link, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${platformName}. All rights reserved.
`.trim();
}

/**
 * Plain text version of question created email
 */
function questionCreatedPlainText(question) {
  const recordingInfo = question.recordingUid 
    ? `\n${question.recordingMode === 'video' ? 'Video' : 'Audio'} recording attached (${question.recordingDuration}s)`
    : '';
  
  const attachmentInfo = question.attachments?.length > 0
    ? `\n${question.attachments.length} file(s) attached`
    : '';

  return `
Question Submitted!
${process.env.PLATFORM_NAME || 'Your Platform'}

Hi ${question.payerEmail.split('@')[0]},

Your question has been successfully submitted to ${question.expertHandle}. We've notified them and they'll get back to you soon!

YOUR QUESTION
Title: ${question.title}
${question.text ? `\nDetails: ${question.text}` : ''}${recordingInfo}${attachmentInfo}

WHAT HAPPENS NEXT?
• ${question.expertHandle} will review your question
• You'll receive an email when they respond
• Response time: Usually within 24-48 hours

View your question:
${process.env.BASE_URL}/question/${question.id}

Question ID: ${question.id}

---
Need help? Reply to this email or visit ${process.env.BASE_URL}/support

© ${new Date().getFullYear()} ${process.env.PLATFORM_NAME || 'Your Platform'}. All rights reserved.
`.trim();
}

/**
 * Plain text version of answer received email
 */
function answerReceivedPlainText(question, answer) {
  const answerText = answer.text 
    ? `\n${answer.text.substring(0, 500)}${answer.text.length > 500 ? '...\n(view full answer online)' : ''}`
    : '';

  const recordingInfo = answer.recordingUid
    ? `\n${answer.recordingMode === 'video' ? 'Video' : 'Audio'} response included (${answer.recordingDuration}s)`
    : '';

  const attachmentInfo = answer.attachments?.length > 0
    ? `\n${answer.attachments.length} file(s) included`
    : '';

  return `
You Have a New Answer!
${process.env.PLATFORM_NAME || 'Your Platform'}

Hi ${question.payerEmail.split('@')[0]},

Great news! ${question.expertHandle} has answered your question.

YOUR QUESTION
${question.title}

${question.expertHandle.toUpperCase()}'S ANSWER${answerText}${recordingInfo}${attachmentInfo}

View the full answer:
${process.env.BASE_URL}/question/${question.id}/answer

Answered on ${new Date(answer.createdAt).toLocaleDateString()}

---
FOUND THIS HELPFUL?
Consider leaving feedback or asking a follow-up question if you need more clarity.

Have more questions? Ask another question: ${process.env.BASE_URL}/ask/${question.expertHandle}

Question ID: ${question.id}

© ${new Date().getFullYear()} ${process.env.PLATFORM_NAME || 'Your Platform'}. All rights reserved.
`.trim();
}

/**
 * Plain text version of expert new question email
 */
function expertNewQuestionPlainText(expert, question) {
  const recordingInfo = question.recordingUid
    ? `\n${question.recordingMode === 'video' ? 'Video' : 'Audio'} recording included (${question.recordingDuration}s)`
    : '';

  const attachmentInfo = question.attachments?.length > 0
    ? `\n${question.attachments.length} attachment(s) included`
    : '';

  const stats = expert.stats
    ? `\nYOUR STATS\nPending questions: ${expert.stats.pending} • Total answered: ${expert.stats.answered}`
    : '';

  return `
New Question for You
${process.env.PLATFORM_NAME || 'Your Platform'}

Hi ${expert.name || expert.handle},

You have a new question from ${question.payerEmail.split('@')[0]}.

QUESTION
Title: ${question.title}
${question.text ? `\nDetails:\n${question.text}` : ''}${recordingInfo}${attachmentInfo}

FROM
Email: ${question.payerEmail}
Submitted: ${new Date(question.createdAt).toLocaleString()}

Answer this question:
${process.env.BASE_URL}/expert/question/${question.id}/answer

Question ID: ${question.id}${stats}

---
View all questions: ${process.env.BASE_URL}/expert/dashboard
Notification settings: ${process.env.BASE_URL}/expert/settings

© ${new Date().getFullYear()} ${process.env.PLATFORM_NAME || 'Your Platform'}. All rights reserved.
`.trim();
}

module.exports = {
  signInPlainText,
  questionCreatedPlainText,
  answerReceivedPlainText,
  expertNewQuestionPlainText
};
