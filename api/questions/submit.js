import { validateQuestionSubmission } from '../lib/validators.js';

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
      payerName,
      recordingSegments,
      attachments,
    } = req.body;

    console.log('=== QUESTION SUBMISSION ===');
    console.log('Expert:', expertHandle);
    console.log('Recording segments:', recordingSegments?.length || 0);
    console.log('Attachments:', attachments?.length || 0);

    // 1. Create question in Xano
    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expert_handle: expertHandle,
          title,
          text,
          payer_email: payerEmail,
          payer_name: payerName,
          status: 'paid', // or 'pending_payment' if you need payment first
          attachments: attachments ? JSON.stringify(attachments) : null,
        }),
      }
    );

    if (!questionResponse.ok) {
      const error = await questionResponse.text();
      console.error('Xano question creation failed:', error);
      throw new Error('Failed to create question');
    }

    const question = await questionResponse.json();
    const questionId = question.id;

    console.log('✅ Question created:', questionId);

    // 2. Create media_asset records for each segment
    if (recordingSegments && recordingSegments.length > 0) {
      console.log('Creating media assets...');
      
      for (let i = 0; i < recordingSegments.length; i++) {
        const segment = recordingSegments[i];
        
        const mediaAssetData = {
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

        console.log('Creating media asset:', mediaAssetData);

        const mediaResponse = await fetch(
          `${process.env.XANO_BASE_URL}/media_assets`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mediaAssetData),
          }
        );

        if (!mediaResponse.ok) {
          const error = await mediaResponse.text();
          console.error(`Failed to create media asset ${i}:`, error);
        } else {
          console.log(`✅ Media asset ${i} created`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      questionId: questionId,
      mediaAssetCount: recordingSegments?.length || 0,
      attachmentCount: attachments?.length || 0,
    });

  } catch (error) {
    console.error('Question submission error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit question',
    });
  }
}