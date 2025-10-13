// api/answers/create.js
// Consolidated endpoint for answer creation + email notification
import { sendAnswerReceivedNotification } from '../lib/zeptomail.js';
import { fetchUserData, getAskerName, getAskerEmail } from '../lib/user-data.js';

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

    console.log('=== ANSWER CREATION ===');
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

    console.log('Creating answer in Xano...');

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
    const answerId = answer.id;
    console.log('✅ Answer created:', answerId);

    // 2. Extract question data from answer response (embedded by Xano)
    const questionData = answer.question || answer._question;

    if (questionData) {
      console.log('📧 Question data retrieved:', {
        title: questionData.title,
        payer_email: questionData.payer_email,
        payer_first_name: questionData.payer_first_name,
        payer_last_name: questionData.payer_last_name
      });

      // 3. Fetch expert details (the person who answered)
      const expertData = await fetchUserData(user_id);
      const expertName = expertData?.name || 'Your Expert';
      console.log('📧 Expert name:', expertName);

      // 4. Get asker details from question data
      const askerEmail = getAskerEmail(questionData);
      const askerName = getAskerName(questionData);
      const questionTitle = questionData.title;

      console.log('📧 Asker details extracted:', { askerEmail, askerName, questionTitle });

      // 5. Send email notification to asker
      if (askerEmail) {
        console.log('📧 Sending answer notification to asker:', askerEmail);

        try {
          await sendAnswerReceivedNotification({
            askerEmail,
            askerName,
            expertName,
            questionTitle,
            questionId: question_id,
            answerId: answerId,
          });
          console.log('✅ Answer notification sent to asker successfully');
        } catch (emailErr) {
          console.error('❌ Failed to send answer notification:', emailErr.message);
          console.error('❌ Email error stack:', emailErr.stack);
          // Don't fail the request if email fails
        }
      } else {
        console.warn('⚠️ No asker email found, skipping notification');
      }
    } else {
      console.warn('⚠️ Could not retrieve question details, skipping email notification');
    }

    // 6. Return success response
    return res.status(200).json({
      success: true,
      data: answer,
    });

  } catch (error) {
    console.error('Answer creation error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create answer',
    });
  }
}
