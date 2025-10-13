import { sendNewQuestionNotification } from '../lib/zeptomail.js';

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

    // Send email notification to expert
    // The email is in the user table, need to fetch it using user_id
    const userId = profileData.expert_profile?.user_id;
    const expertName = profileData.user?.name;

    if (userId) {
      console.log('📧 Fetching expert email for user_id:', userId);

      // Fetch user email from secure internal Xano endpoint
      const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;
      const internalEndpoint = `${process.env.XANO_BASE_URL}/internal/user/${userId}/email?x_api_key=${XANO_INTERNAL_API_KEY}`;

      console.log('📧 API key configured:', XANO_INTERNAL_API_KEY ? 'YES' : 'NO');

      try {
        console.log('📧 Fetching user data...');
        const userResponse = await fetch(internalEndpoint);

        console.log('📧 Response status:', userResponse.status);

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('❌ Failed to fetch user email:', userResponse.status, errorText);
        } else {
          const userData = await userResponse.json();
          const expertEmail = userData.email;

          console.log('📧 Expert email found:', expertEmail);

          if (expertEmail) {
            console.log('📧 Sending expert notification...');

            // Send email asynchronously (don't await to avoid delaying response)
            sendNewQuestionNotification({
              expertEmail,
              expertName,
              questionTitle: title,
              questionText: text,
              askerEmail: payerEmail,
              questionId,
            })
              .then(() => console.log('✅ Expert notification sent successfully'))
              .catch((err) => console.error('❌ Failed to send notification:', err.message));
          }
        }
      } catch (err) {
        console.error('❌ Error fetching user email:', err.message);
      }
    } else {
      console.warn('⚠️ No user_id found in expert profile - skipping notification');
    }

    // 3. Create media assets (try singular endpoint)
    // 3. Create media assets
  if (recordingSegments && recordingSegments.length > 0) {
    console.log(`Creating ${recordingSegments.length} media assets...`);
    
    for (let i = 0; i < recordingSegments.length; i++) {
      const segment = recordingSegments[i];
      
      // ⭐ FIX: Extract status string from the status object
      let statusString = 'ready';
      if (segment.status && typeof segment.status === 'object') {
        statusString = segment.status.state || 'ready';
      } else if (typeof segment.status === 'string') {
        statusString = segment.status;
      }
      
      // ⭐ FIX: Ensure duration_sec is a number, not a string
      const durationSec = parseInt(segment.duration) || 0;
      
      const mediaAssetPayload = {
        owner_type: 'question',
        owner_id: questionId,
        provider: 'cloudflare_stream',
        asset_id: segment.uid,
        url: segment.playbackUrl,
        duration_sec: durationSec,
        status: statusString, // ⭐ Now a string
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

      if (!mediaResponse.ok) {
        console.error(`Failed to create media asset ${i}:`, mediaResponseText);
      } else {
        const mediaAsset = JSON.parse(mediaResponseText);
        console.log(`✅ Media asset ${i} created with ID:`, mediaAsset.id);
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