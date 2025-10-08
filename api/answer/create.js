// api/answer/create.js
// Creates answer record in Xano after media/attachments are uploaded
// Returns question's playback_token_hash for review URL

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const {
      question_id,
      user_id,
      media_asset_id,
      text_response,
      attachments,
    } = req.body;

    // Validation
    if (!question_id) {
      return res.status(400).json({
        success: false,
        error: 'question_id is required',
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Must have at least media OR text
    if (!media_asset_id && !text_response) {
      return res.status(400).json({
        success: false,
        error: 'Answer must include either media_asset_id or text_response',
      });
    }

    console.log('Creating answer for question:', question_id);
    console.log('Answer data:', {
      user_id,
      hasText: !!text_response,
      hasMedia: !!media_asset_id,
      hasAttachments: !!attachments,
    });

    // Prepare payload for Xano
    const payload = {
      question_id: parseInt(question_id),
      user_id: parseInt(user_id),
      media_asset_id: media_asset_id ? parseInt(media_asset_id) : null,
      text_response: text_response || '',
      attachments: attachments || null, // Already JSON string or null
    };

    // Create answer in Xano (this endpoint should also update question status and media_asset owner_id)
    const xanoResponse = await fetch(
      `${process.env.XANO_BASE_URL}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XANO_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      console.error('Xano error creating answer:', errorData);
      throw new Error(errorData.message || 'Failed to create answer in database');
    }

    const answer = await xanoResponse.json();

    console.log('✅ Answer created successfully:', answer);

    // Get question's playback_token_hash for review URL
    // Try multiple possible response structures
    const playbackTokenHash = 
      answer.playback_token_hash || 
      answer.question?.playback_token_hash ||
      answer.data?.playback_token_hash;

    if (!playbackTokenHash) {
      console.warn('⚠️ No playback_token_hash in response - review URL will not work');
      console.warn('Response structure:', answer);
    }

    // TODO: Send notification email to question.payer_email with review link
    // await sendAnswerNotificationEmail(answer, playbackTokenHash);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const reviewUrl = playbackTokenHash ? `${baseUrl}/r/${playbackTokenHash}` : null;

    return res.status(201).json({
      success: true,
      data: {
        answer_id: answer.id,
        question_id: answer.question_id || question_id,
        playback_token_hash: playbackTokenHash,
        review_url: reviewUrl,
        created_at: answer.created_at,
        sent_at: answer.sent_at,
      },
    });

  } catch (error) {
    console.error('Error creating answer:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Send notification email to question asker
 * TODO: Implement email service integration
 */
async function sendAnswerNotificationEmail(answer) {
  console.log('TODO: Send answer notification email');
  // Integration with email service (SendGrid, etc.)
  // Should include:
  // - Answer preview
  // - Link to view full answer
  // - Expert information
}

/**
 * Update question status after answer is submitted
 * TODO: Implement status update
 */
async function updateQuestionStatus(questionId, status) {
  console.log('TODO: Update question status to:', status);
  // Update question record in Xano
  // Mark as 'answered' so it doesn't show in pending questions
}

// ✅ FIXED: Removed duplicate config export
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};