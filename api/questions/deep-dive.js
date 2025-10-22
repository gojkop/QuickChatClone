// api/questions/deep-dive.js
// Deep Dive submission endpoint (Tier 2: Proposed price, requires expert acceptance)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      expertHandle,
      title,
      text,
      payerEmail,
      payerFirstName,
      payerLastName,
      recordingSegments = [],
      attachments = [],
      sla_hours_snapshot,
      proposed_price_cents,
      asker_message,
      stripe_payment_intent_id
    } = req.body;

    // Validation
    if (!expertHandle || !title || !payerEmail || !proposed_price_cents) {
      return res.status(400).json({
        error: 'Missing required fields: expertHandle, title, payerEmail, proposed_price_cents'
      });
    }

    if (!stripe_payment_intent_id) {
      return res.status(400).json({
        error: 'Missing stripe_payment_intent_id (payment authorization required)'
      });
    }

    // Get expert profile from Xano public endpoint
    const expertResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      throw new Error('Expert not found');
    }

    const expertData = await expertResponse.json();
    const expertProfile = expertData.expert_profile || expertData;

    // Call Xano endpoint for Deep Dive
    const xanoResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/question/deep-dive`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_profile_id: expertProfile.id,
          payer_email: payerEmail,
          proposed_price_cents,
          asker_message: asker_message || null,
          title,
          text: text || null,
          attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
          media_asset_id: recordingSegments.length > 0 ? recordingSegments[0].mediaAssetId : null,
          stripe_payment_intent_id
        })
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to create Deep Dive offer');
    }

    const result = await xanoResponse.json();

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        questionId: result.question_id,
        status: result.status,
        proposed_price_cents: result.proposed_price_cents,
        offer_expires_at: result.offer_expires_at
      }
    });

  } catch (error) {
    console.error('Deep Dive submission error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to submit Deep Dive offer'
    });
  }
}
