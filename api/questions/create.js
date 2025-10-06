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

    // 1. Get expert profile
    console.log('Fetching expert profile...');
    
    const profileResponse = await fetch(
      `${process.env.XANO_BASE_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile lookup failed:', errorText);
      throw new Error('Expert profile not found');
    }

    const profileData = await profileResponse.json();
    console.log('Profile data received:', JSON.stringify(profileData, null, 2));
    
    const expertProfileId = profileData.expert_profile?.id || profileData.id;
    const priceCents = profileData.expert_profile?.price_cents || profileData.price_cents;
    const currency = profileData.expert_profile?.currency || profileData.currency || 'USD';
    const slaHours = profileData.expert_profile?.sla_hours || profileData.sla_hours;

    console.log('Extracted values:', {
      expertProfileId,
      priceCents,
      currency,
      slaHours
    });

    if (!expertProfileId) {
      throw new Error('Could not extract expert_profile_id from profile');
    }

    // 2. Create question
    const questionPayload = {
      expert_profile_id: expertProfileId,
      payer_email: payerEmail,
      price_cents: priceCents,
      currency: currency,
      status: 'paid',
      sla_hours_snapshot: slaHours,
      title: title,
      text: text || null,
      attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
    };

    console.log('Question payload:', JSON.stringify(questionPayload, null, 2));
    console.log('Posting to:', `${process.env.XANO_BASE_URL}/question`);

    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/question`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionPayload),
      }
    );

    console.log('Question response status:', questionResponse.status);
    
    const responseText = await questionResponse.text();
    console.log('Question response body:', responseText);

    if (!questionResponse.ok) {
      throw new Error(`Xano returned ${questionResponse.status}: ${responseText}`);
    }

    const question = JSON.parse(responseText);
    const questionId = question.id;

    console.log('✅ Question created with ID:', questionId);

    // 3. Create media assets (try singular endpoint)
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

        console.log(`Creating media asset ${i}:`, mediaAssetPayload);

        const mediaResponse = await fetch(
          `${process.env.XANO_BASE_URL}/media_asset`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mediaAssetPayload),
          }
        );

        const mediaResponseText = await mediaResponse.text();
        console.log(`Media asset ${i} response:`, mediaResponseText);

        if (!mediaResponse.ok) {
          console.error(`Failed to create media asset ${i}`);
        } else {
          console.log(`✅ Media asset ${i} created`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        questionId,
        mediaAssetsCreated: recordingSegments?.length || 0,
      },
    });

  } catch (error) {
    console.error('Question creation error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}