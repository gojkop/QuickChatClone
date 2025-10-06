// api/questions/create.js
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
    } = req.body;

    console.log('Create question request:', {
      expertHandle,
      title,
      segmentCount: recordingSegments.length,
      attachmentCount: attachments.length,
    });

    // Validation
    if (!expertHandle || !title?.trim() || !payerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const XANO_BASE_URL = process.env.XANO_BASE_URL;

    // 1. Get expert profile
    console.log('Fetching expert...');
    const expertResponse = await fetch(
      `${XANO_BASE_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      throw new Error('Expert not found');
    }

    const expertData = await expertResponse.json();
    const expert = expertData?.expert_profile ?? expertData;
    console.log('Expert found:', expert.id);

    // 2. Create question - using minimal required fields
    console.log('Creating question...');
    const questionPayload = {
      expert_profile_id: expert.id,
      title: title.trim(),
      text: text?.trim() || '',
      payer_email: payerEmail,
      price_cents: expert.price_cents || 5000,
      currency: expert.currency || 'USD',
      status: 'pending_payment',
      sla_hours_snapshot: expert.sla_hours || 48,
    };

    // Only add optional fields if they have values
    if (payerFirstName) questionPayload.payer_first_name = payerFirstName;
    if (payerLastName) questionPayload.payer_last_name = payerLastName;
    if (attachments.length > 0) {
      questionPayload.attachments = JSON.stringify(attachments);
    }

    console.log('Question payload:', questionPayload);

    const questionResponse = await fetch(`${XANO_BASE_URL}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionPayload),
    });

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error('Question creation failed:', errorText);
      throw new Error(`Question creation failed: ${questionResponse.status} - ${errorText}`);
    }

    const question = await questionResponse.json();
    console.log('Question created:', question.id);

    // 3. Create media_asset records for each segment
    const mediaAssetIds = [];
    
    for (let i = 0; i < recordingSegments.length; i++) {
      const segment = recordingSegments[i];
      
      console.log(`Creating media_asset ${i + 1}/${recordingSegments.length}...`);
      
      const mediaPayload = {
        owner_type: 'question',
        owner_id: question.id,
        provider: 'cloudflare_stream',
        asset_id: segment.uid,
        duration_sec: Math.round(segment.duration || 0),
        status: 'ready',
        url: segment.playbackUrl,
        segment_index: i,
        metadata: JSON.stringify({
          segmentIndex: i,
          mode: segment.mode,
        }),
      };

      const mediaResponse = await fetch(`${XANO_BASE_URL}/media_asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaPayload),
      });

      if (!mediaResponse.ok) {
        console.error(`Failed to create media_asset for segment ${i}`);
        continue;
      }

      const mediaAsset = await mediaResponse.json();
      mediaAssetIds.push(mediaAsset.id);
      console.log(`Media asset created: ${mediaAsset.id}`);
    }

    // 4. Update question with first segment's media_asset_id
    if (mediaAssetIds.length > 0) {
      console.log('Updating question with media_asset_id...');
      await fetch(`${XANO_BASE_URL}/question/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_asset_id: mediaAssetIds[0],
        }),
      });
    }

    // 5. Mark as paid (dev mode)
    if (process.env.SKIP_STRIPE === 'true') {
      console.log('Dev mode: marking as paid...');
      await fetch(`${XANO_BASE_URL}/question/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paid_at: new Date().toISOString(),
        }),
      });
    }

    console.log('✅ Success!');

    return res.status(200).json({
      success: true,
      data: {
        questionId: question.id,
        mediaAssetIds,
        segmentCount: recordingSegments.length,
        attachmentCount: attachments.length,
        status: process.env.SKIP_STRIPE === 'true' ? 'paid' : 'pending_payment',
      },
      checkoutUrl: null,
    });

  } catch (error) {
    console.error('❌ Question creation error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create question',
    });
  }
}