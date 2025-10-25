// api/cron/cancel-expired-offers.js
// Runs every 15 minutes to cancel payments for Deep Dive offers not accepted within 24h

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
      jobName: 'Cancel Expired Offers',
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

  const XANO_PUBLIC_API_URL = process.env.XANO_PUBLIC_API_URL;
  const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;

  try {
    console.log('⏰ Starting expired offers cancellation cron job...');
    console.log('Current time:', new Date().toISOString());

    // Calculate cutoff time (24 hours ago)
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    const cutoffDate = new Date(cutoffTime);
    console.log('Cutoff time:', cutoffDate.toISOString());
    console.log('');

    // Fetch all pending offers from Xano
    const offersResponse = await fetch(
      `${XANO_PUBLIC_API_URL}/questions/pending-offers?x_api_key=${XANO_INTERNAL_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!offersResponse.ok) {
      throw new Error(`Failed to fetch pending offers: ${offersResponse.status}`);
    }

    const pendingOffers = await offersResponse.json();
    console.log(`📋 Found ${pendingOffers.length} pending offers`);

    let processedCount = 0;
    let canceledCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each pending offer
    for (const question of pendingOffers) {
      try {
        const createdAt = new Date(question.created_at);
        const questionId = question.id;

        // Skip if not expired yet
        if (createdAt.getTime() > cutoffTime) {
          continue;
        }

        processedCount++;

        console.log(`\n⏰ Processing expired offer: Question #${questionId}`);
        console.log(`  Created: ${createdAt.toISOString()}`);
        console.log(`  Age: ${Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))} hours`);

        // 1. Find and cancel payment intent
        let paymentCanceled = false;
        let paymentIntentId = null;

        try {
          // Search for payment intent by question ID
          const paymentIntent = await findPaymentIntentByQuestionId(questionId);

          if (paymentIntent && !paymentIntent.id.startsWith('pi_mock_')) {
            paymentIntentId = paymentIntent.id;
            console.log(`  💳 Found payment intent: ${paymentIntentId}, status: ${paymentIntent.status}`);

            // Only cancel if it's in requires_capture or requires_payment_method status
            if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'requires_payment_method') {
              console.log(`  💳 Canceling payment intent...`);
              await cancelPaymentIntent(paymentIntentId);
              console.log(`  ✅ Payment canceled successfully`);
              paymentCanceled = true;
            } else if (paymentIntent.status === 'canceled') {
              console.log(`  ✅ Payment was already canceled`);
              paymentCanceled = true;
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

        // 2. Update question status in Xano to "offer_expired"
        try {
          const updateResponse = await fetch(
            `${XANO_PUBLIC_API_URL}/question/${questionId}/expire-offer?x_api_key=${XANO_INTERNAL_API_KEY}`,
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
            console.log(`  ✅ Question status updated to expired`);
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
          const offeredPrice = question.proposed_price_cents
            ? `$${(question.proposed_price_cents / 100).toFixed(2)}`
            : 'N/A';

          if (askerEmail) {
            const { subject, htmlBody, textBody } = getOfferExpiredTemplate({
              askerName,
              questionTitle: question.title || 'Your question',
              expertName,
              questionId,
              offeredPrice,
              expirationReason: '24h_timeout',
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
        console.log(`  ✅ Offer #${questionId} processed successfully`);

      } catch (offerError) {
        console.error(`❌ Error processing offer #${question.id}:`, offerError.message);
        errorCount++;
        errors.push({
          questionId: question.id,
          error: offerError.message,
        });
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Total pending offers: ${pendingOffers.length}`);
    console.log(`  Expired offers processed: ${processedCount}`);
    console.log(`  Successfully canceled: ${canceledCount}`);
    console.log(`  Errors: ${errorCount}`);

    // Send failure notification if there were errors
    if (errorCount > 0 && errorCount >= canceledCount * 0.5) {
      await sendFailureNotification(
        new Error(`High error rate during offer cancellation: ${errorCount} errors, ${canceledCount} canceled`),
        {
          totalPending: pendingOffers.length,
          processed: processedCount,
          canceled: canceledCount,
          errors: errorCount,
          errorDetails: errors,
        }
      );
    }

    return res.status(200).json({
      success: true,
      totalPending: pendingOffers.length,
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
