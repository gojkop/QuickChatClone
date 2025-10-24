// api/cron/cancel-expired-slas.js
// Runs every 15 minutes to cancel payments for questions not answered within SLA

import { cancelPaymentIntent, findPaymentIntentByQuestionId } from '../lib/stripe.js';
import { sendEmail } from '../lib/zeptomail.js';
import { getOfferExpiredTemplate } from '../lib/email-templates/offer-expired.js';
import { getCronFailureTemplate } from '../lib/email-templates/cron-failure.js';

/**
 * Send failure notification email to admin
 */
async function sendFailureNotification(error, context = {}) {
  try {
    const { subject, htmlBody, textBody } = getCronFailureTemplate({
      jobName: 'Cancel Expired SLAs',
      errorMessage: error.message || String(error),
      timestamp: new Date().toISOString(),
      details: context,
    });

    await sendEmail({
      to: 'gojkop@gmail.com',
      toName: 'Admin',
      subject,
      htmlBody,
      textBody,
    });

    console.log('✅ Failure notification email sent to gojkop@gmail.com');
  } catch (emailError) {
    console.error('❌ Failed to send failure notification email:', emailError);
  }
}

export default async function handler(req, res) {
  // Verify cron job authentication
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const XANO_BASE_URL = process.env.XANO_BASE_URL;
  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;

  try {
    console.log('⏰ Starting expired SLAs cancellation cron job...');
    console.log('Current time:', new Date().toISOString());
    console.log('');

    // Fetch all active questions past their SLA deadline from Xano
    // This endpoint should return questions where:
    // - status is "accepted" or "in_progress" (not answered yet)
    // - sla_deadline is in the past
    const questionsResponse = await fetch(
      `${XANO_BASE_URL}/questions/expired-sla?x_api_key=${XANO_INTERNAL_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!questionsResponse.ok) {
      throw new Error(`Failed to fetch expired SLA questions: ${questionsResponse.status}`);
    }

    const expiredQuestions = await questionsResponse.json();
    console.log(`📋 Found ${expiredQuestions.length} questions past their SLA deadline`);

    let processedCount = 0;
    let canceledCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each expired question
    for (const question of expiredQuestions) {
      try {
        const slaDeadline = new Date(question.sla_deadline);
        const questionId = question.id;
        const now = new Date();

        // Skip if SLA hasn't expired yet
        if (slaDeadline.getTime() > now.getTime()) {
          continue;
        }

        processedCount++;

        console.log(`\n⏰ Processing expired SLA: Question #${questionId}`);
        console.log(`  SLA Deadline: ${slaDeadline.toISOString()}`);
        console.log(`  Hours past deadline: ${Math.round((now.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60))}`);
        console.log(`  Tier: ${question.tier_type || 'unknown'}`);

        // 1. Find and cancel payment intent
        let paymentCanceled = false;
        let paymentIntentId = null;

        try {
          // Search for payment intent by question ID
          const paymentIntent = await findPaymentIntentByQuestionId(questionId);

          if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
            paymentIntentId = paymentIntent.id;
            console.log(`  💳 Found payment intent: ${paymentIntentId}, status: ${paymentIntent.status}`);

            // Only cancel if it's in requires_capture status (not yet captured)
            if (paymentIntent.status === 'requires_capture') {
              console.log(`  💳 Canceling payment intent...`);
              await cancelPaymentIntent(paymentIntentId);
              console.log(`  ✅ Payment canceled successfully`);
              paymentCanceled = true;
            } else if (paymentIntent.status === 'canceled') {
              console.log(`  ✅ Payment was already canceled`);
              paymentCanceled = true;
            } else if (paymentIntent.status === 'succeeded') {
              console.log(`  ⚠️ Payment was already captured - cannot refund automatically`);
              // Log for manual review - this shouldn't happen in the new flow
              errors.push({
                questionId,
                error: 'Payment already captured - requires manual refund',
                severity: 'high',
              });
            } else {
              console.log(`  ⚠️ Payment in unexpected status: ${paymentIntent.status}`);
            }
          } else if (paymentIntent?.id.startsWith('pi_mock_')) {
            console.log(`  💳 [MOCK MODE] Skipping payment cancellation for mock payment intent`);
            paymentCanceled = true;
          } else {
            console.log(`  ⚠️ No payment intent found for this question`);
          }
        } catch (paymentError) {
          console.error(`  ❌ Failed to cancel payment:`, paymentError.message);
          errors.push({
            questionId,
            error: `Payment cancellation failed: ${paymentError.message}`,
          });
        }

        // 2. Update question status in Xano to "sla_expired"
        try {
          const updateResponse = await fetch(
            `${XANO_BASE_URL}/question/${questionId}/expire-sla?x_api_key=${XANO_INTERNAL_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment_canceled: paymentCanceled,
                payment_intent_id: paymentIntentId,
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(`  ✅ Question status updated to SLA expired`);
          } else {
            console.warn(`  ⚠️ Failed to update question status:`, updateResponse.status);
          }
        } catch (updateError) {
          console.error(`  ❌ Failed to update question status:`, updateError.message);
          errors.push({
            questionId,
            error: `Status update failed: ${updateError.message}`,
          });
        }

        // 3. Send email notification to asker
        try {
          const askerEmail = question.payer_email;
          const askerName = question.payer_first_name || askerEmail?.split('@')[0] || 'there';
          const expertName = question._expert_profile?.name || question.expert_name || 'the expert';

          // Calculate price for display
          let offeredPrice = 'N/A';
          if (question.tier_type === 'deep_dive' && question.proposed_price_cents) {
            offeredPrice = `$${(question.proposed_price_cents / 100).toFixed(2)}`;
          } else if (question.tier_type === 'quick_consult' && question.price_cents) {
            offeredPrice = `$${(question.price_cents / 100).toFixed(2)}`;
          }

          if (askerEmail) {
            const { subject, htmlBody, textBody } = getOfferExpiredTemplate({
              askerName,
              questionTitle: question.title || 'Your question',
              expertName,
              questionId,
              offeredPrice,
              expirationReason: 'sla_expired',
            });

            await sendEmail({
              to: askerEmail,
              toName: askerName,
              subject,
              htmlBody,
              textBody,
            });

            console.log(`  ✅ Expiration notification sent to ${askerEmail}`);
          } else {
            console.warn(`  ⚠️ No asker email found, skipping notification`);
          }
        } catch (emailError) {
          console.error(`  ❌ Failed to send notification email:`, emailError.message);
          errors.push({
            questionId,
            error: `Email notification failed: ${emailError.message}`,
          });
        }

        canceledCount++;
        console.log(`  ✅ Question #${questionId} SLA expiration processed successfully`);

      } catch (questionError) {
        console.error(`❌ Error processing question #${question.id}:`, questionError.message);
        errorCount++;
        errors.push({
          questionId: question.id,
          error: questionError.message,
        });
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Total expired SLAs: ${expiredQuestions.length}`);
    console.log(`  Questions processed: ${processedCount}`);
    console.log(`  Successfully canceled: ${canceledCount}`);
    console.log(`  Errors: ${errorCount}`);

    // Send failure notification if there were errors
    if (errorCount > 0 && errorCount >= canceledCount * 0.5) {
      await sendFailureNotification(
        new Error(`High error rate during SLA expiration: ${errorCount} errors, ${canceledCount} canceled`),
        {
          totalExpired: expiredQuestions.length,
          processed: processedCount,
          canceled: canceledCount,
          errors: errorCount,
          errorDetails: errors,
        }
      );
    }

    return res.status(200).json({
      success: true,
      totalExpired: expiredQuestions.length,
      processed: processedCount,
      canceled: canceledCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);

    // Send failure notification email
    await sendFailureNotification(error, {
      timestamp: new Date().toISOString(),
      errorStack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
