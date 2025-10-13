// api/send-answer-notification.js
// Simplified endpoint to send answer notification emails
import { sendAnswerReceivedNotification } from './lib/zeptomail.js';
import { fetchUserData, getAskerName, getAskerEmail } from './lib/user-data.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question_id, answer_id, user_id } = req.body;

    console.log('=== ANSWER NOTIFICATION ===');
    console.log('Question ID:', question_id);
    console.log('Answer ID:', answer_id);
    console.log('User ID:', user_id);

    // Fetch question details
    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/question/${question_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
      }
    );

    if (!questionResponse.ok) {
      console.error('Failed to fetch question');
      return res.status(400).json({ error: 'Question not found' });
    }

    const questionData = await questionResponse.json();

    // Fetch expert details
    const expertData = await fetchUserData(user_id);
    const expertName = expertData?.name || 'Your Expert';

    // Get asker details
    const askerEmail = getAskerEmail(questionData);
    const askerName = getAskerName(questionData);
    const questionTitle = questionData.title;

    console.log('📧 Sending notification:', { askerEmail, askerName, expertName, questionTitle });

    if (askerEmail) {
      await sendAnswerReceivedNotification({
        askerEmail,
        askerName,
        expertName,
        questionTitle,
        questionId: question_id,
        answerId: answer_id,
      });
      console.log('✅ Answer notification sent successfully');
    } else {
      console.warn('⚠️ No asker email found');
    }

    return res.status(200).json({
      success: true,
      message: 'Notification sent',
    });

  } catch (error) {
    console.error('Email notification error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send notification',
    });
  }
}
