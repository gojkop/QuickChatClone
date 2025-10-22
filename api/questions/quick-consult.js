// api/questions/quick-consult.js
// Quick Consult submission endpoint (Tier 1: Fixed price, immediate SLA)

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
      stripe_payment_intent_id
    } = req.body;

    // Validation
    if (!expertHandle || !title || !payerEmail || !stripe_payment_intent_id) {
      return res.status(400).json({
        error: 'Missing required fields: expertHandle, title, payerEmail, stripe_payment_intent_id'
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

    // Call Xano endpoint for Quick Consult
    const xanoResponse = await fetch(
      `${process.env.XANO_PUBLIC_API_URL}/question/quick-consult`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_profile_id: expertProfile.id,
          payer_email: payerEmail,
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
      throw new Error(errorData.message || 'Failed to create question');
    }

    const result = await xanoResponse.json();

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        questionId: result.question_id,
        status: result.status,
        sla_deadline: result.sla_deadline,
        final_price_cents: result.final_price_cents
      }
    });

  } catch (error) {
    console.error('Quick Consult submission error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to submit question'
    });
  }
}
