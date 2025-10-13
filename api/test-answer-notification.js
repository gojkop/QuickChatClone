// api/test-answer-notification.js
// Test endpoint to verify answer notification email sending

import { sendAnswerReceivedNotification } from './lib/zeptomail.js';

export default async function handler(req, res) {
  console.log('🧪 Testing answer notification email...');

  const testEmail = req.query.email || 'test@example.com';

  try {
    await sendAnswerReceivedNotification({
      askerEmail: testEmail,
      askerName: 'Test Asker',
      expertName: 'Test Expert',
      questionTitle: 'Test Question Title',
      questionId: 999,
      answerId: 888,
    });

    console.log('✅ Test answer notification sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Test answer notification sent successfully',
      sentTo: testEmail,
    });
  } catch (error) {
    console.error('❌ Test failed:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
