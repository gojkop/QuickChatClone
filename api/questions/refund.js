// api/questions/refund.js
// Refund a question by canceling the payment intent and updating question status

import { cancelPaymentIntent, findPaymentIntentByQuestionId } from '../lib/stripe.js';
import { sendEmail } from '../lib/zeptomail.js';
import { getOfferExpiredTemplate } from '../lib/email-templates/offer-expired.js';
import { rateLimit } from '../lib/rate-limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting: 5 refunds per minute per IP
  const rateLimitResult = await applyRateLimit(req, res);
  if (!rateLimitResult.allowed) {
    return; // Response already sent by rate limiter
  }

  try {
    const { question_id, refund_reason } = req.body;

    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const XANO_BASE_URL = process.env.XANO_BASE_URL;

    // Security: Verify the authenticated user is the expert for this question
    console.log(`🔍 Verifying ownership for question ${question_id}`);
    const ownershipVerified = await verifyQuestionOwnership(token, question_id, XANO_BASE_URL);

    if (!ownershipVerified) {
      console.warn(`⚠️ Unauthorized refund attempt for question ${question_id}`);
      return res.status(403).json({
        error: 'Forbidden: You are not authorized to refund this question'
      });
    }

    console.log(`✅ Ownership verified for question ${question_id}`);

    // Step 1: Find and cancel payment intent in Stripe
    let paymentCanceled = false;
    let paymentIntentId = null;

    try {
      const paymentIntent = await findPaymentIntentByQuestionId(question_id);

      if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
        paymentIntentId = paymentIntent.id;

        if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'requires_payment_method') {
          await cancelPaymentIntent(paymentIntentId);
          paymentCanceled = true;
        } else if (paymentIntent.status === 'canceled') {
          paymentCanceled = true;
        } else if (paymentIntent.status === 'succeeded') {
          return res.status(400).json({
            error: 'Payment has already been captured. Please contact support for manual refund.'
          });
        } else {
          console.warn(`⚠️ Payment in unexpected status: ${paymentIntent.status} for question ${question_id}`);
        }
      } else if (paymentIntent?.id.startsWith('pi_mock_')) {
        paymentCanceled = true;
      }
    } catch (paymentError) {
      console.error(`❌ Payment cancellation failed for question ${question_id}:`, paymentError.message);
      // Continue anyway - we'll update the question status
    }

    // Step 2: Update question and payment status in Xano
    const updateResponse = await fetch(
      `${XANO_BASE_URL}/question/${question_id}/refund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_canceled: paymentCanceled,
          payment_intent_id: paymentIntentId,
          refund_reason: refund_reason || 'Expert declined',
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.error || 'Failed to update question status in Xano');
    }

    console.log(`✅ Refund processed for question ${question_id}`);

    return res.status(200).json({
      success: true,
      question_id: question_id,
      payment_canceled: paymentCanceled,
      payment_intent_id: paymentIntentId,
    });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process refund'
    });
  }
}

/**
 * Apply rate limiting to the request
 */
async function applyRateLimit(req, res) {
  const limiter = rateLimit({
    limit: 5, // 5 requests
    windowMs: 60000, // per minute
    keyPrefix: 'refund'
  });

  let allowed = true;
  await limiter(req, res, () => {
    allowed = true;
  });

  return { allowed };
}

/**
 * Verify that the authenticated user owns the question
 * @param {string} token - JWT token
 * @param {number} questionId - Question ID
 * @param {string} baseUrl - Xano base URL
 * @returns {Promise<boolean>} True if ownership verified
 */
async function verifyQuestionOwnership(token, questionId, baseUrl) {
  try {
    // Get the authenticated user's profile
    const userResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user profile');
      return false;
    }

    const userData = await userResponse.json();
    const authenticatedUserId = userData.id;

    // Get the question details
    const questionResponse = await fetch(`${baseUrl}/question/${questionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!questionResponse.ok) {
      console.error('Failed to fetch question details');
      return false;
    }

    const questionData = await questionResponse.json();

    // Check if the authenticated user is the expert for this question
    const expertProfileId = questionData.expert_profile_id;

    if (!expertProfileId) {
      console.error('Question has no expert_profile_id');
      return false;
    }

    // Get expert profile to find user_id
    const expertProfileResponse = await fetch(`${baseUrl}/expert_profile/${expertProfileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!expertProfileResponse.ok) {
      console.error('Failed to fetch expert profile');
      return false;
    }

    const expertProfile = await expertProfileResponse.json();
    const expertUserId = expertProfile.user_id || expertProfile._user?.id;

    if (!expertUserId) {
      console.error('Expert profile has no user_id');
      return false;
    }

    // Verify ownership
    const isOwner = expertUserId === authenticatedUserId;

    if (!isOwner) {
      console.warn(`Ownership verification failed: expert_user_id=${expertUserId}, authenticated_user_id=${authenticatedUserId}`);
    }

    return isOwner;

  } catch (error) {
    console.error('Error verifying ownership:', error.message);
    return false;
  }
}
