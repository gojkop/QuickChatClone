// ============================================
// FILE: examples/emailExamples.js
// Example usage of email service
// ============================================

const emailService = require('../src/services/emailService');

// ============================================
// Example 1: Send Sign-In Email
// ============================================
async function sendSignInExample() {
  try {
    const result = await emailService.sendSignInEmail(
      'user@example.com',
      'https://yourdomain.com/auth/verify?token=abc123xyz'
    );
    console.log('Sign-in email sent:', result);
  } catch (error) {
    console.error('Error sending sign-in email:', error);
  }
}

// ============================================
// Example 2: Send Question Created Confirmation
// ============================================
async function sendQuestionCreatedExample() {
  const question = {
    id: 'q_12345',
    expertHandle: 'gojko',
    title: 'How do I implement progressive upload in React?',
    text: 'I want to upload files as soon as the user selects them, not wait until form submission.',
    payerEmail: 'asker@example.com',
    recordingUid: 'rec_abc123',
    recordingMode: 'video',
    recordingDuration: 45,
    attachments: [
      { uid: 'att_1', name: 'screenshot.png', size: 156234 },
      { uid: 'att_2', name: 'code.js', size: 4521 }
    ],
    createdAt: new Date()
  };

  try {
    const result = await emailService.sendQuestionCreatedEmail(question);
    console.log('Question created email sent:', result);
  } catch (error) {
    console.error('Error sending question created email:', error);
  }
}

// ============================================
// Example 3: Send Answer Received Notification
// ============================================
async function sendAnswerReceivedExample() {
  const question = {
    id: 'q_12345',
    expertHandle: 'gojko',
    title: 'How do I implement progressive upload in React?',
    payerEmail: 'asker@example.com',
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  };

  const answer = {
    text: `Great question! Progressive upload is a much better user experience. Here's how I'd approach it:

1. Upload files immediately when selected using useEffect
2. Store upload results in state
3. On form submit, just pass the upload UIDs
4. This way users don't wait during submission

I've included a video walkthrough showing the implementation step-by-step. Check out the attached code samples too!`,
    recordingUid: 'rec_xyz789',
    recordingMode: 'video',
    recordingDuration: 180,
    attachments: [
      { uid: 'att_3', name: 'progressive-upload-example.zip', size: 523441 }
    ],
    createdAt: new Date()
  };

  try {
    const result = await emailService.sendAnswerReceivedEmail(question, answer);
    console.log('Answer received email sent:', result);
  } catch (error) {
    console.error('Error sending answer received email:', error);
  }
}

// ============================================
// Example 4: Send Expert Notification
// ============================================
async function sendExpertNotificationExample() {
  const expert = {
    handle: 'gojko',
    name: 'Gojko Adzic',
    email: 'expert@example.com',
    stats: {
      pending: 3,
      answered: 127
    }
  };

  const question = {
    id: 'q_12345',
    title: 'How do I implement progressive upload in React?',
    text: 'I want to upload files as soon as the user selects them, not wait until form submission. My current implementation waits until the final submit button is clicked.',
    payerEmail: 'asker@example.com',
    recordingUid: 'rec_abc123',
    recordingMode: 'video',
    recordingDuration: 45,
    attachments: [
      { uid: 'att_1', name: 'screenshot.png', size: 156234 }
    ],
    createdAt: new Date()
  };

  try {
    const result = await emailService.sendExpertNewQuestionEmail(expert, question);
    console.log('Expert notification sent:', result);
  } catch (error) {
    console.error('Error sending expert notification:', error);
  }
}

// ============================================
// Run Examples (uncomment to test)
// ============================================

// sendSignInExample();
// sendQuestionCreatedExample();
// sendAnswerReceivedExample();
// sendExpertNotificationExample();

module.exports = {
  sendSignInExample,
  sendQuestionCreatedExample,
  sendAnswerReceivedExample,
  sendExpertNotificationExample
};
