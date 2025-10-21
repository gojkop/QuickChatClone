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
    const attachmentsString = Array.isArray(attachments) && attachments.length > 0
      ? JSON.stringify(attachments)
      : null;

    const answerPayload = {
      question_id,
      user_id,
      text_response: text_response || null,
      media_asset_id: media_asset_id || null,
      attachments: attachmentsString,
    };

    console.log('Creating answer in Xano...');

    const answerResponse = await fetch(
      `${process.env.XANO_BASE_URL}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        body: JSON.stringify(answerPayload),
      }
    );

    if (!answerResponse.ok) {
      const errorText = await answerResponse.text();
      console.error('Xano answer creation failed:', errorText);
      
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // Not JSON, use text as is
      }
      
      return res.status(answerResponse.status).json({
        success: false,
        error: errorMessage,
      });
    }

    const answer = await answerResponse.json();
    const answerId = answer.id;
    console.log('✅ Answer created:', answerId);

    // ==========================================
    // UPDATE QUESTION WITH answered_at TIMESTAMP
    // ==========================================
    console.log('📝 Updating question answered_at timestamp...');
    console.log('📝 Question ID to update:', question_id);

    // Use PUBLIC API for question updates (not Authentication API!)
    const publicApiUrl = process.env.XANO_PUBLIC_API_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';
    const updateUrl = `${publicApiUrl}/question/${question_id}`;
    console.log('📝 Update URL:', updateUrl);

    const updatePayload = {
      answered_at: Date.now(),
      status: 'answered'
    };
    console.log('📝 Update payload:', JSON.stringify(updatePayload));

    try {
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('📝 Update response status:', updateResponse.status);

      if (updateResponse.ok) {
        const updatedQuestion = await updateResponse.json();
        console.log('✅ Question updated successfully');
        console.log('✅ answered_at value:', updatedQuestion.answered_at);
        console.log('✅ status value:', updatedQuestion.status);
      } else {
        const errorText = await updateResponse.text();
        console.error('❌ Failed to update question answered_at');
        console.error('❌ Status code:', updateResponse.status);
        console.error('❌ Error response:', errorText);
      }
    } catch (updateErr) {
      console.error('❌ Exception during question update:', updateErr.message);
      console.error('❌ Error stack:', updateErr.stack);
    }
    // ==========================================

    // 2. Extract question data from answer response (embedded by Xano)
    const questionData = answer.question || answer._question;

    if (questionData) {
      // Extract review token for email link (not exposed to expert)
      const reviewToken = questionData.playback_token_hash;
      
      if (!reviewToken) {
        console.warn('⚠️ Question does not have playback_token_hash - cannot send email link');
      }

      // 3. Fetch expert details (the person who answered)
      const expertData = await fetchUserData(user_id);
      const expertName = expertData?.name || 'Your Expert';

      // 4. Get asker details from question data
      const askerEmail = getAskerEmail(questionData);
      const askerName = getAskerName(questionData);
      const questionTitle = questionData.title;

      // 5. Send email notification to asker
      if (askerEmail) {
        try {
          await sendAnswerReceivedNotification({
            askerEmail,
            askerName,
            expertName,
            questionTitle,
            questionId: question_id,
            reviewToken: reviewToken,
            answerId: answerId,
          });
          console.log('✅ Answer notification sent successfully');
        } catch (emailErr) {
          console.error('❌ Failed to send answer notification:', emailErr.message);
          console.error('❌ Email error stack:', emailErr.stack);
        }
      } else {
        console.warn('⚠️ No asker email found, skipping notification');
      }
    } else {
      console.warn('⚠️ Could not retrieve question details from answer response');

      // Fallback: Fetch question directly if not embedded
      try {
        const questionResponse = await fetch(
          `${publicApiUrl}/question/${question_id}`,
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
          const fetchedQuestionData = await questionResponse.json();

          const reviewToken = fetchedQuestionData.playback_token_hash;
          const expertData = await fetchUserData(user_id);
          const expertName = expertData?.name || 'Your Expert';
          const askerEmail = getAskerEmail(fetchedQuestionData);
          const askerName = getAskerName(fetchedQuestionData);
          const questionTitle = fetchedQuestionData.title;

          if (askerEmail) {
            try {
              await sendAnswerReceivedNotification({
                askerEmail,
                askerName,
                expertName,
                questionTitle,
                questionId: question_id,
                reviewToken: reviewToken,
                answerId: answerId,
              });
              console.log('✅ Answer notification sent successfully (fallback)');
            } catch (emailErr) {
              console.error('❌ Failed to send answer notification (fallback):', emailErr.message);
            }
          }
        } else {
          console.error('❌ Failed to fetch question directly:', questionResponse.status);
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback question fetch failed:', fallbackErr.message);
      }
    }

    // 6. Return success response (sanitize sensitive data)
    try {
      const sanitizedAnswer = JSON.parse(JSON.stringify(answer));

      if (sanitizedAnswer.question?.playback_token_hash) {
        delete sanitizedAnswer.question.playback_token_hash;
      }
      if (sanitizedAnswer._question?.playback_token_hash) {
        delete sanitizedAnswer._question.playback_token_hash;
      }
      
      return res.status(200).json({
        success: true,
        data: sanitizedAnswer,
      });
    } catch (sanitizeError) {
      console.error('❌ Error sanitizing response:', sanitizeError);
      return res.status(200).json({
        success: true,
        data: {
          id: answer.id,
          question_id: answer.question_id,
          user_id: answer.user_id,
          created_at: answer.created_at,
        },
      });
    }

  } catch (error) {
    console.error('❌ Answer creation error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create answer',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}