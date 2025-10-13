// api/answer/submit.js
// Proxy endpoint for answer submission that sends email notifications
import { sendAnswerReceivedNotification } from '../lib/zeptomail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      question_id,
      user_id,
      text_response,
      media_asset_id,
      attachments,
    } = req.body;

    console.log('=== ANSWER SUBMISSION ===');
    console.log('Question ID:', question_id);
    console.log('User ID:', user_id);

    // 1. Create answer record in Xano
    const answerPayload = {
      question_id,
      user_id,
      text_response: text_response || null,
      media_asset_id: media_asset_id || null,
      attachments: attachments || null,
    };

    console.log('Posting to Xano /answer endpoint:', answerPayload);

    const answerResponse = await fetch(
      `${process.env.XANO_BASE_URL}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass through authorization if present
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        body: JSON.stringify(answerPayload),
      }
    );

    console.log('Answer response status:', answerResponse.status);

    if (!answerResponse.ok) {
      const errorText = await answerResponse.text();
      console.error('Xano answer creation failed:', errorText);
      return res.status(answerResponse.status).json({
        success: false,
        error: errorText,
      });
    }

    const answer = await answerResponse.json();
    const answerId = answer.id || answer.created_answer?.id;
    console.log('✅ Answer created:', answerId);

    // 2. The answer response from Xano includes the question object
    // Check if question data is embedded in the response
    let questionData = answer.question || answer._question;

    if (questionData) {
      console.log('Question data found in answer response');
    } else {
      // 3. If not embedded, fetch question details separately
      console.log('Fetching question details...');
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

      if (questionResponse.ok) {
        questionData = await questionResponse.json();
      }
    }

    if (questionData) {
      // 4. Fetch expert details to get expert name
      const expertResponse = await fetch(
        `${process.env.XANO_BASE_URL}/user/${user_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
        }
      );

      let expertName = 'Your Expert';
      if (expertResponse.ok) {
        const expertData = await expertResponse.json();
        expertName = expertData.name || expertData.fname || 'Your Expert';
      }

      // 5. Send email notification to asker (non-blocking)
      const askerEmail = questionData.payer_email;
      const askerName = questionData.payer_first_name || questionData.payer_email?.split('@')[0] || 'there';
      const questionTitle = questionData.title;

      if (askerEmail) {
        sendAnswerReceivedNotification({
          askerEmail,
          askerName,
          expertName,
          questionTitle,
          questionId: question_id,
          answerId: answerId,
        })
          .then(() => console.log('✅ Answer notification sent to asker'))
          .catch((err) => console.error('❌ Failed to send answer notification:', err.message));
      } else {
        console.warn('⚠️ No asker email found, skipping notification');
      }
    } else {
      console.warn('⚠️ Could not retrieve question details, skipping email notification');
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: answer,
    });

  } catch (error) {
    console.error('Answer submission error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit answer',
    });
  }
}
