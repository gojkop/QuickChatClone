import { sendNewQuestionNotification, sendQuestionConfirmationNotification } from '../lib/zeptomail.js';
import { fetchUserData, getAskerName } from '../lib/user-data.js';

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
    
    const XANO_PUBLIC_BASE_URL = process.env.XANO_PUBLIC_BASE_URL || 
                                   'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';
    
    const profileResponse = await fetch(
      `${XANO_PUBLIC_BASE_URL}/public/profile?handle=${encodeURIComponent(expertHandle)}`
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
    console.log('Posting to:', `${XANO_PUBLIC_BASE_URL}/question`);

    const questionResponse = await fetch(
      `${XANO_PUBLIC_BASE_URL}/question`,
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
    
    // ✅ Extract playback_token_hash from response (the field already exists in Xano)
    const reviewToken = question.playback_token_hash;
    
    console.log('✅ Question created:', {
      id: questionId,
      playback_token_hash: reviewToken,
      hasToken: !!reviewToken
    });

    if (!reviewToken) {
      console.error('⚠️ CRITICAL: playback_token_hash not returned by Xano!');
      console.error('⚠️ Check that POST /question endpoint includes playback_token_hash in response');
      console.error('⚠️ Available fields:', Object.keys(question));
    }

    // 3. Create media assets for recording segments
    if (recordingSegments && recordingSegments.length > 0) {
      console.log(`Creating ${recordingSegments.length} media assets...`);
      
      for (let i = 0; i < recordingSegments.length; i++) {
        const segment = recordingSegments[i];
        
        let statusString = 'ready';
        if (segment.status && typeof segment.status === 'object') {
          statusString = segment.status.state || 'ready';
        } else if (typeof segment.status === 'string') {
          statusString = segment.status;
        }
        
        const durationSec = parseInt(segment.duration) || 0;
        
        const mediaAssetPayload = {
          owner_type: 'question',
          owner_id: questionId,
          provider: 'cloudflare_stream',
          asset_id: segment.uid,
          url: segment.playbackUrl,
          duration_sec: durationSec,
          status: statusString,
          segment_index: i,
          metadata: JSON.stringify({
            mode: segment.mode,
            segmentIndex: i,
          }),
        };

        console.log(`Creating media asset ${i}:`, mediaAssetPayload);

        const mediaResponse = await fetch(
          `${XANO_PUBLIC_BASE_URL}/media_asset`,
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

    // 4. Send email notifications
    const userId = profileData.expert_profile?.user_id;
    const expertProfileName = profileData.expert_profile?.name || profileData.name || 'Expert';

    // Send notification to expert
    if (userId) {
      const expertData = await fetchUserData(userId);

      if (expertData?.email) {
        console.log('📧 Sending expert notification...');

        try {
          await sendNewQuestionNotification({
            expertEmail: expertData.email,
            expertName: expertData.name || 'Expert',
            questionTitle: title,
            questionText: text,
            askerEmail: payerEmail,
            questionId,
          });
          console.log('✅ Expert notification sent successfully');
        } catch (emailErr) {
          console.error('❌ Failed to send expert notification:', emailErr.message);
          console.error('❌ Email error stack:', emailErr.stack);
        }
      } else {
        console.warn('⚠️ Could not retrieve expert email - skipping expert notification');
      }
    } else {
      console.warn('⚠️ No user_id found in expert profile - skipping expert notification');
    }

    // ✅ NEW: Send confirmation to payer/asker WITH review_token
    if (payerEmail) {
      console.log('📧 Sending asker confirmation with review token...');

      const askerName = [payerFirstName, payerLastName].filter(Boolean).join(' ') ||
                        getAskerName(question) ||
                        payerEmail.split('@')[0];

      try {
        await sendQuestionConfirmationNotification({
          askerEmail: payerEmail,
          askerName: askerName,
          expertName: expertProfileName,
          questionTitle: title,
          questionText: text,
          questionId,
          reviewToken,  // ✅ NEW: Pass review token to email
          slaHours: slaHours,
        });
        console.log('✅ Asker confirmation sent successfully');
      } catch (emailErr) {
        console.error('❌ Failed to send asker confirmation:', emailErr.message);
        console.error('❌ Email error stack:', emailErr.stack);
      }
    } else {
      console.warn('⚠️ No payer email found - skipping asker confirmation');
    }

    // ✅ Return response with playback_token_hash
    return res.status(200).json({
      success: true,
      data: {
        questionId,
        playback_token_hash: reviewToken,  // ✅ Use consistent field name
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