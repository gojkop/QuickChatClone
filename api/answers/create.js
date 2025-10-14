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
    console.log('📎 Raw attachments received:', JSON.stringify(attachments, null, 2));
    console.log('📎 Attachments type:', typeof attachments);
    console.log('📎 Is array?:', Array.isArray(attachments));
    console.log('📎 Length:', attachments?.length);

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
    console.log('📎 Stringified attachments:', attachmentsString ? attachmentsString.substring(0, 200) + '...' : 'null');
    console.log('📦 Full answer payload:', JSON.stringify(answerPayload, null, 2));
    console.log('Using URL:', `${process.env.XANO_BASE_URL}/answer`);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    const requestBody = JSON.stringify(answerPayload);
    console.log('📤 Request body being sent to Xano:', requestBody);
    console.log('📤 Request body length:', requestBody.length);

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
        body: requestBody,
      }
    );

    console.log('📥 Answer response status:', answerResponse.status);

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
    console.log('📦 Full answer response from Xano:', JSON.stringify(answer, null, 2));
    console.log('📎 Attachments in response:', answer.attachments || 'null');

    // 2. Extract question data from answer response (embedded by Xano)
    const questionData = answer.question || answer._question;

    if (questionData) {
      console.log('📧 Question data retrieved:', {
        id: questionData.id,
        title: questionData.title,
        payer_email: questionData.payer_email,
        payer_first_name: questionData.payer_first_name,
        payer_last_name: questionData.payer_last_name,
        has_playback_token: !!questionData.playback_token_hash
        // ✅ NOT logging actual token value to protect privacy
      });

      // ✅ Extract review token for email link (not exposed to expert)
      const reviewToken = questionData.playback_token_hash;
      
      if (!reviewToken) {
        console.warn('⚠️ Question does not have playback_token_hash - cannot send email link');
      }

      // 3. Fetch expert details (the person who answered)
      const expertData = await fetchUserData(user_id);
      const expertName = expertData?.name || 'Your Expert';
      console.log('📧 Expert name:', expertName);

      // 4. Get asker details from question data
      const askerEmail = getAskerEmail(questionData);
      const askerName = getAskerName(questionData);
      const questionTitle = questionData.title;

      console.log('📧 Asker details extracted:', { 
        askerEmail, 
        askerName, 
        questionTitle
        // ✅ NOT logging reviewToken to protect privacy
      });

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
            reviewToken: reviewToken, // ✅ Pass review token for /r/{token} link
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
      console.warn('⚠️ Could not retrieve question details from answer response');
      console.warn('⚠️ Answer response keys:', Object.keys(answer));
      
      // Fallback: Fetch question directly if not embedded
      try {
        console.log('🔄 Attempting to fetch question directly from Xano...');
        
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
          console.log('✅ Question fetched directly:', {
            id: fetchedQuestionData.id,
            has_token: !!fetchedQuestionData.playback_token_hash
            // ✅ NOT logging actual token value to protect privacy
          });

          // Extract data for email
          const reviewToken = fetchedQuestionData.playback_token_hash;
          const expertData = await fetchUserData(user_id);
          const expertName = expertData?.name || 'Your Expert';
          const askerEmail = getAskerEmail(fetchedQuestionData);
          const askerName = getAskerName(fetchedQuestionData);
          const questionTitle = fetchedQuestionData.title;

          if (askerEmail) {
            console.log('📧 Sending answer notification (from direct fetch)...');
            
            try {
              await sendAnswerReceivedNotification({
                askerEmail,
                askerName,
                expertName,
                questionTitle,
                questionId: question_id,
                reviewToken: reviewToken, // ✅ Pass review token
                answerId: answerId,
              });
              console.log('✅ Answer notification sent successfully (fallback path)');
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
      // ✅ Remove review token from response to protect asker privacy
      const sanitizedAnswer = JSON.parse(JSON.stringify(answer)); // Deep clone
      
      // Remove review token from embedded question data (if present)
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