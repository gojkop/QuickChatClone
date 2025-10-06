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
    console.log('Expert:', expertHandle);
    console.log('Title:', title);
    console.log('Recording segments:', recordingSegments?.length || 0);
    console.log('Attachments:', attachments?.length || 0);

    // Build payer name
    const payerName = [payerFirstName, payerLastName]
      .filter(Boolean)
      .join(' ') || null;

    // 1. Create question in Xano
    const questionPayload = {
      expert_handle: expertHandle,
      title,
      text: text || null,
      payer_email: payerEmail,
      payer_name: payerName,
      status: 'paid', // or 'pending_payment' if payment is needed first
    };

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      questionPayload.attachments = JSON.stringify(attachments);
    }

    console.log('Creating question in Xano...');

    const questionResponse = await fetch(
      `${process.env.XANO_BASE_URL}/questions`,
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

    // 2. Create media_asset records for each segment
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

        console.log(`Creating media asset ${i + 1}/${recordingSegments.length}...`);

        const mediaResponse = await fetch(
          `${process.env.XANO_BASE_URL}/media_assets`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mediaAssetPayload),
          }
        );

        if (!mediaResponse.ok) {
          const errorText = await mediaResponse.text();
          console.error(`Failed to create media asset ${i}:`, errorText);
          // Continue with other segments even if one fails
        } else {
          const mediaAsset = await mediaResponse.json();
          console.log(`✅ Media asset ${i + 1} created with ID:`, mediaAsset.id);
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