import React from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentPlaceholder from '../payment/PaymentPlaceholder';
import apiClient from '@/api';

function StepPayment({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData, 
  onSubmit 
}) {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      console.log('📤 Submitting question with data:', {
        expert: expert.handle,
        tierType,
        compose: composeData,
        review: reviewData
      });

      // ✅ STEP 1: Create media_asset record if recordings exist
      let mediaAssetId = null;

      if (composeData.recordings && composeData.recordings.length > 0) {
        console.log('📹 Creating media_asset record for', composeData.recordings.length, 'segments');
        
        const firstSegment = composeData.recordings[0];
        const totalDuration = composeData.recordings.reduce((sum, seg) => sum + (seg.duration || 0), 0);
        
        console.log('First segment:', firstSegment);
        console.log('Total duration:', totalDuration);
        
        const metadata = {
          type: 'multi-segment',
          mime_type: 'video/webm',
          segments: composeData.recordings.map(seg => ({
            uid: seg.uid,
            playback_url: seg.playbackUrl,
            duration: seg.duration,
            mode: seg.mode,
            segment_index: seg.segmentIndex,
          })),
          segment_count: composeData.recordings.length,
        };
        
        console.log('Metadata to send:', metadata);
        
        try {
          console.log('Calling apiClient.post /media_asset...');
          const response = await apiClient.post('/media_asset', {
            owner_type: 'question',
            owner_id: 0, // Placeholder - Xano will update this
            provider: 'cloudflare_stream',
            asset_id: firstSegment.uid,
            duration_sec: Math.round(totalDuration),
            status: 'ready',
            url: firstSegment.playbackUrl,
            metadata: JSON.stringify(metadata),
            segment_index: null, // Parent record
          });

          mediaAssetId = response.data?.id;
          console.log('✅ Media asset created, ID:', mediaAssetId);
          console.log('Full response:', response.data);
        } catch (mediaError) {
          console.error('❌ Failed to create media_asset:', mediaError);
          console.error('Error response:', mediaError.response?.data);
          console.error('Error status:', mediaError.response?.status);
          alert('Failed to process media. Please try again.');
          return;
        }
      } else {
        console.log('⚠️ No recordings found in composeData');
        console.log('composeData.recordings:', composeData.recordings);
      }

      // ✅ STEP 2: Build base payload with media_asset_id
      const basePayload = {
        expertHandle: expert.handle,
        title: composeData.title,
        text: composeData.text || null,
        payerEmail: reviewData.email,
        payerFirstName: reviewData.firstName || null,
        payerLastName: reviewData.lastName || null,
        media_asset_id: mediaAssetId, // ✅ Send the media_asset_id
        attachments: (composeData.attachments || []).map(a => ({
          name: a.name || a.filename,
          url: a.url || a.playbackUrl,
          size: a.size
        })),
        sla_hours_snapshot: tierConfig?.sla_hours || expert.sla_hours
      };

      // Add tier-specific fields
      let endpoint, payload;

      if (tierType === 'deep_dive') {
        endpoint = '/api/questions/deep-dive';
        payload = {
          ...basePayload,
          proposed_price_cents: Math.round(parseFloat(composeData.tierSpecific.proposedPrice) * 100),
          asker_message: composeData.tierSpecific.askerMessage || null,
          stripe_payment_intent_id: 'pi_mock_' + Date.now()
        };
      } else {
        endpoint = '/api/questions/quick-consult';
        payload = {
          ...basePayload,
          stripe_payment_intent_id: 'pi_mock_' + Date.now()
        };
      }

      console.log('📡 Sending to:', endpoint);
      console.log('📦 Payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('✅ Question submitted:', result);

      // Navigate to success page
      if (result.review_token || result.data?.review_token) {
        const token = result.review_token || result.data?.review_token;
        navigate(`/question-sent?token=${token}`);
      } else {
        navigate('/question-sent');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      alert(`Failed to submit question: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PaymentPlaceholder
        expert={expert}
        tierType={tierType}
        tierConfig={tierConfig}
        composeData={composeData}
        reviewData={reviewData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default StepPayment;