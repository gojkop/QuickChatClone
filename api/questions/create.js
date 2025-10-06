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
      recordingSegments,
      attachments,
    } = req.body;

    console.log('=== QUESTION CREATION ===');
    console.log('Expert handle:', expertHandle);
    console.log('Recording segments:', recordingSegments?.length || 0);

    // 1. First, get the expert profile ID from the handle
    console.log('Looking up expert profile ID...');
    
    const profileResponse = await fetch(
      `${process.env.XANO_BASE_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!profileResponse.ok) {
      throw new Error('Expert profile not found');
    }

    const profileData = await profileResponse.json();
    const expertProfileId = profileData.expert_profile?.id || profileData.id;
    const priceCents = profileData.expert_profile?.price_cents || profileData.price_cents;
    const currency = profileData.expert_profile?.currency || profileData.currency || 'USD';
    const slaHours = profileData.expert_profile?.sla_hours || profileData.sla_hours;

    console.log('Expert profile ID:', expertProfileId);
    console.log('Price:', priceCents, currency);

    // 2. Create question in Xano with the correct fields
    const questionPayload = {
      expert_profile_id: expertProfileId,
      payer_email: payerEmail,
      price_cents: priceCents,
      currency: currency,
      status: 'paid', // or 'pending_payment'
      sla_hours_snapshot: slaHours,
      title: title,
      text: text || null,
      attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
    };

    console.log('Creating question with payload:', questionPayload);

    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/question`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionPayload),
      }
    );

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error('Xano question creation failed:', errorText);
      throw new Error('Failed to create question in database');
    }

    const question = await questionResponse.json();
    const questionId = question.id;

    console.log('✅ Question created with ID:', questionId);

    // 3. Create media_asset records for each segment
    if (recordingSegments && recordingSegments.length > 0) {
      console.log(`Creating ${recordingSegments.length} media assets...`);
      
      for (let i = 0; i < recordingSegments.length; i++) {
        const segment = recordingSegments[i];
        
        const mediaAssetPayload = {
          owner_type: 'question',
          owner_id: questionId,
          provider: 'cloudflare_stream',
          asset_id: segment.uid,
          url: segment.playbackUrl,
          duration_sec: segment.duration || 0,
          status: segment.status || 'ready',
          segment_index: i,
          metadata: JSON.stringify({
            mode: segment.mode,
            segmentIndex: i,
          }),
        };

        const mediaResponse = await fetch(
          `${process.env.XANO_BASE_URL}/media_asset`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mediaAssetPayload),
          }
        );

        if (!mediaResponse.ok) {
          const errorText = await mediaResponse.text();
          console.error(`Failed to create media asset ${i}:`, errorText);
        } else {
          const mediaAsset = await mediaResponse.json();
          console.log(`✅ Media asset ${i + 1} created:`, mediaAsset.id);
        }
      }
    }

    console.log('✅ Question submission complete!');

    return res.status(200).json({
      success: true,
      data: {
        questionId,
        mediaAssetsCreated: recordingSegments?.length || 0,
        attachmentsIncluded: attachments?.length || 0,
      },
    });

  } catch (error) {
    console.error('Question creation error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create question',
    });
  }
}