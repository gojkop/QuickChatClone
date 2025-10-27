// api/answers/create.js
// Consolidated endpoint for answer creation + email notification
import { sendAnswerReceivedNotification } from '../lib/zeptomail.js';
import { fetchUserData, getAskerName, getAskerEmail } from '../lib/user-data.js';
import { capturePaymentIntent, findPaymentIntentByQuestionId } from '../lib/stripe.js';

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

    // Check if Xano returned an error in the payload (200 status with error)
    if (answer.payload && typeof answer.payload === 'string' && answer.payload.includes('error')) {
      console.error('Xano returned error in payload:', answer.payload);
      return res.status(400).json({
        success: false,
        error: answer.payload,
      });
    }

    const answerId = answer.id;
    console.log('✅ Answer created:', answerId);

    // NOTE: answered_at is now set automatically by Xano POST /answer endpoint
    // No need to make a separate PATCH request

    // 1.5. Capture payment (if payment intent exists for this question)
    // Run in parallel with email preparation
    const paymentCapturePromise = (async () => {
      try {
        const paymentIntent = await findPaymentIntentByQuestionId(question_id);

        if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
          if (paymentIntent.status === 'requires_capture') {
            await capturePaymentIntent(paymentIntent.id);
            console.log(`✅ Payment captured for question ${question_id}`);

            // Update payment table in Xano
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.replace('Bearer ', '');
              const updatePaymentResponse = await fetch(
                `${process.env.XANO_BASE_URL}/payment/capture`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ question_id }),
                }
              );

              if (!updatePaymentResponse.ok) {
                console.warn(`⚠️ Failed to update payment table (status: ${updatePaymentResponse.status})`);
              }
            }
          } else if (paymentIntent.status !== 'succeeded') {
            console.warn(`⚠️ Payment in unexpected status: ${paymentIntent.status} for question ${question_id}`);
          }
        }
      } catch (paymentError) {
        console.error(`❌ Payment capture failed for question ${question_id}:`, paymentError.message);
        // Continue anyway - the answer is already created
      }
    })();

    // 2. Extract question data from answer response (embedded by Xano)
    const questionData = answer.question || answer._question;

    // 3. Send email notification in background (don't await)
    if (questionData) {
      const reviewToken = questionData.playback_token_hash;
      const askerEmail = getAskerEmail(questionData);
      const askerName = getAskerName(questionData);
      const questionTitle = questionData.title;

      if (askerEmail && reviewToken) {
        // Fire and forget - send email in background
        (async () => {
          try {
            const expertData = await fetchUserData(user_id);
            const expertName = expertData?.name || 'Your Expert';

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
          }
        })();
      }
    }

    // Wait only for payment capture before responding
    await paymentCapturePromise;

    if (!questionData) {
      console.warn('⚠️ Could not retrieve question details from answer response');

      // Fallback: Fetch question directly if not embedded
      try {
        const publicApiUrl = process.env.XANO_PUBLIC_API_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';
        
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