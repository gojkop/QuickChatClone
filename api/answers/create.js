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
    // Use Array.isArray for explicit type checking
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
          // Pass through authorization if present
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
      
      // Try to parse error as JSON, fallback to text
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
    // NEW: Update question with answered_at timestamp
    // ==========================================
    console.log('Updating question answered_at timestamp...');
    try {
      const updateResponse = await fetch(
        `${process.env.XANO_BASE_URL}/question/${question_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
          body: JSON.stringify({
            answered_at: Date.now(),
            status: 'answered'
          }),
        }
      );

      if (updateResponse.ok) {
        console.log('✅ Question updated with answered_at timestamp');
      } else {
        const errorText = await updateResponse.text();
        console.error('❌ Failed to update question answered_at:', updateResponse.status, errorText);
        // Don't fail the entire request - answer was created successfully
      }
    } catch (updateErr) {
      console.error('❌ Error updating question answered_at:', updateErr.message);
      // Don't fail the entire request - answer was created successfully
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
            reviewToken: reviewToken, // Pass review token for /r/{token} link
            answerId: answerId,
          });
          console.log('✅ Answer notification sent successfully');
        } catch (emailErr) {
          console.error('❌ Failed to send answer notification:', emailErr.message);
          console.error('❌ Email error stack:', emailErr.stack);
          // Don't fail the request if email fails
        }
      } else {
        console.warn('⚠️ No asker email found, skipping notification');
      }
    } else {
      console.warn('⚠️ Could not retrieve question details from answer response');

      // Fallback: Fetch question directly if not embedded
      try {
        
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
          const fetchedQuestionData = await questionResponse.json();

          // Extract data for email
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
      // Remove review token from response to protect asker privacy
      const sanitizedAnswer = JSON.parse(JSON.stringify(answer));

      // Remove review token from embedded question data
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
      // Fallback: return without sanitization if it fails
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