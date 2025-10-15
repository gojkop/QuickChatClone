import crypto from 'crypto';
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
      payer_first_name : payerFirstName || null,
      payer_last_name : payerLastName || null,
      price_cents: priceCents,
      currency: currency,
      status: 'paid',
      sla_hours_snapshot: slaHours,
      title: title,
      text: text || null,
      attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
      // Note: Xano auto-generates playback_token_hash, don't send review_token
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

    // 🔍 Debug: Check what Xano actually returned
    let xanoResponse;
    try {
      xanoResponse = JSON.parse(responseText);
      console.log('📦 Parsed Xano response:', JSON.stringify(xanoResponse, null, 2));
      console.log('📦 Response keys:', Object.keys(xanoResponse));
    } catch (parseError) {
      console.error('❌ Failed to parse Xano response:', parseError);
      throw new Error('Invalid response from database');
    }

    // ✅ Handle nested response structure from Xano
    // Xano returns: { "question": {...}, "playback_token_hash": "..." }
    const question = xanoResponse.question || xanoResponse;
    const playbackTokenHash = xanoResponse.playback_token_hash;
    
    console.log('📦 Extracted question object:', JSON.stringify(question, null, 2));

    // ⚠️ CRITICAL: Check if Xano returned the question ID
    const questionId = question.id;
    
    if (!questionId) {
      console.error('❌ CRITICAL: No question ID in Xano response!');
      console.error('Full response:', xanoResponse);
      throw new Error('Database did not return question ID. Check Xano endpoint configuration.');
    }

    console.log('✅ Question created with ID:', questionId);
    console.log('✅ Playback token hash:', playbackTokenHash);

    // Send email notifications to both expert and payer/asker
    // ✅ Extract user_id from multiple possible locations in response
    const userId = profileData.expert_profile?.user_id || 
                   profileData.user_id || 
                   profileData.expert_profile?._user?.id ||
                   profileData._user?.id;
    
    const expertProfileName = profileData.expert_profile?.name || profileData.name || 'Expert';

    console.log('🔍 Expert user lookup:', {
      userId,
      hasExpertProfile: !!profileData.expert_profile,
      profileDataKeys: Object.keys(profileData),
      expertProfileKeys: profileData.expert_profile ? Object.keys(profileData.expert_profile) : null
    });

    // 1. Send notification to expert
    if (userId) {
      console.log('📧 Fetching expert user data for user_id:', userId);
      
      try {
        const expertData = await fetchUserData(userId);
        console.log('📧 Expert data retrieved:', {
          hasEmail: !!expertData?.email,
          email: expertData?.email,
          name: expertData?.name
        });

        if (expertData?.email) {
          console.log('📧 Sending expert notification to:', expertData.email);

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
          console.warn('⚠️ Expert data has no email - skipping expert notification');
        }
      } catch (fetchErr) {
        console.error('❌ Failed to fetch expert user data:', fetchErr.message);
        console.error('❌ Fetch error stack:', fetchErr.stack);
      }
    } else {
      console.warn('⚠️ No user_id found in expert profile - skipping expert notification');
      console.warn('⚠️ Profile data structure:', JSON.stringify(profileData, null, 2));
    }

    // 2. Send confirmation to payer/asker
    if (payerEmail) {
      console.log('📧 Sending asker confirmation...');

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
          reviewToken: playbackTokenHash, // ✅ Include review token for email link
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

    // 3. Create media assets
    if (recordingSegments && recordingSegments.length > 0) {
      console.log(`Creating ${recordingSegments.length} media assets...`);
      
      for (let i = 0; i < recordingSegments.length; i++) {
        const segment = recordingSegments[i];
        
        // Extract status string from the status object
        let statusString = 'ready';
        if (segment.status && typeof segment.status === 'object') {
          statusString = segment.status.state || 'ready';
        } else if (typeof segment.status === 'string') {
          statusString = segment.status;
        }
        
        // Ensure duration_sec is a number
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

    // 🔥 NEW: Link question to campaign (if user came from UTM link)
    try {
      console.log('🎯 Attempting campaign attribution...');
      
      // Generate visitor hash matching visit tracking logic
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                       req.headers['x-real-ip'] || 
                       req.socket.remoteAddress || 
                       'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Must match the hash generation in /api/public/track-visit
      const visitorIpHash = crypto
        .createHash('sha256')
        .update(ipAddress + '_' + userAgent)
        .digest('hex');
      
      console.log('🎯 Campaign attribution params:', {
        questionId,
        expertProfileId,
        visitorIpHash: visitorIpHash.substring(0, 16) + '...',
        ipAddress: ipAddress.substring(0, 10) + '...',
        userAgent: userAgent.substring(0, 50) + '...'
      });
      
      // Call Xano function to link question to campaign
      const XANO_BASE_URL = process.env.XANO_BASE_URL || 
                           'https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ';
      
      const linkResponse = await fetch(
        `${XANO_BASE_URL}/function/link_question_to_campaign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: questionId,
            visitor_ip_hash: visitorIpHash,
            expert_profile_id: expertProfileId
          })
        }
      );
      
      if (linkResponse.ok) {
        const linkResult = await linkResponse.json();
        console.log('🎯 Campaign link result:', linkResult);
        
        if (linkResult.linked) {
          console.log(`✅ Question linked to campaign ${linkResult.campaign_id}`);
        } else {
          console.log('ℹ️ No recent campaign visit found (user may not have come from UTM link)');
        }
      } else {
        const errorText = await linkResponse.text();
        console.warn('⚠️ Campaign linking failed:', linkResponse.status, errorText);
      }
      
    } catch (linkError) {
      // Don't fail the whole request if campaign linking fails
      console.error('⚠️ Campaign linking error (non-critical):', linkError.message);
    }

    // ✅ Return complete response structure
    const responseData = {
      success: true,
      data: {
        questionId: questionId,
        review_token: playbackTokenHash,  // ✅ Use Xano's playback_token_hash
        mediaAssetsCreated: recordingSegments?.length || 0,
        question: question,  // ✅ Include full question object for debugging
      },
    };

    console.log('✅ Final response data:', JSON.stringify(responseData, null, 2));

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Question creation error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}