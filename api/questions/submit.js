// api/questions/submit.js
// Question submission with Cloudflare Stream and R2 uploads

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎯 Question submission started');

    const {
      expertHandle,
      title,
      text,
      recordingMode,
      recordingBlob,
      attachments,
      payerEmail,
      payerFirstName,
      payerLastName,
    } = req.body;

    // Validate required fields
    if (!expertHandle || !title || !payerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['expertHandle', 'title', 'payerEmail']
      });
    }

    console.log('✅ Validation passed');
    console.log('👤 Expert:', expertHandle);
    console.log('📧 Email:', payerEmail);

    // Step 1: Get expert profile
    console.log('📡 Fetching expert profile...');
    const expertResponse = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const expertData = await expertResponse.json();
    const expertProfile = expertData?.expert_profile || expertData;
    
    if (!expertProfile || !expertProfile.id) {
      return res.status(404).json({ error: 'Expert profile not found' });
    }

    console.log('✅ Expert found - ID:', expertProfile.id);

    // Step 2: Upload recording to Cloudflare Stream
    let mediaAssetId = null;
    
    if (recordingBlob && recordingMode) {
      console.log('📹 Uploading recording to Cloudflare Stream...');
      
      try {
        const FormData = require('form-data');
        const buffer = Buffer.from(recordingBlob, 'base64');
        
        const formData = new FormData();
        formData.append('file', buffer, {
          filename: 'recording.webm',
          contentType: recordingMode === 'audio' ? 'audio/webm' : 'video/webm'
        });
        
        formData.append('meta', JSON.stringify({
          name: `Question: ${title}`
        }));

        const streamResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
            },
            body: formData
          }
        );

        const streamData = await streamResponse.json();
        
        if (!streamData.success) {
          console.error('❌ Stream upload failed:', streamData.errors);
          throw new Error('Stream upload failed');
        }

        const video = streamData.result;
        console.log('✅ Stream upload successful:', video.uid);

        // Create media_asset in Xano
        const mediaResponse = await fetch(
          'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/media_asset',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stream_video_id: video.uid,
              type: recordingMode,
              duration: video.duration || null,
              thumbnail_url: video.thumbnail || null,
              playback_url: video.playback?.hls || null
            })
          }
        );

        if (mediaResponse.ok) {
          const mediaAsset = await mediaResponse.json();
          mediaAssetId = mediaAsset.id;
          console.log('✅ Media asset created:', mediaAssetId);
        }
      } catch (error) {
        console.error('⚠️ Media upload failed:', error.message);
      }
    }

    // Step 3: Upload attachments to R2
    const attachmentUrls = [];
    
    if (attachments && attachments.length > 0) {
      console.log(`📎 Uploading ${attachments.length} attachments...`);
      
      try {
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        
        const s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
          },
        });

        for (const attachment of attachments) {
          const buffer = Buffer.from(attachment.data, 'base64');
          const timestamp = Date.now();
          const sanitizedName = attachment.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const key = `question-attachments/${timestamp}-${sanitizedName}`;

          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: attachment.type || 'application/octet-stream',
          }));

          const url = `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;
          attachmentUrls.push({
            name: attachment.name,
            url,
            type: attachment.type,
            size: buffer.length
          });
        }
        
        console.log('✅ Attachments uploaded:', attachmentUrls.length);
      } catch (error) {
        console.error('⚠️ Attachment upload failed:', error.message);
      }
    }

    // Step 4: Create question in Xano
    console.log('📝 Creating question in Xano...');
    
    const questionData = {
      expert_profile_id: expertProfile.id,
      payer_email: payerEmail,
      price_cents: expertProfile.price_cents,
      currency: expertProfile.currency || 'USD',
      status: 'pending_payment',
      sla_hours_snapshot: expertProfile.sla_hours,
      title: title.trim(),
      text: text ? text.trim() : null,
      media_asset_id: mediaAssetId,
      attachments: attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
    };

    const questionResponse = await fetch(
      'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      }
    );

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error('❌ Xano error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to create question',
        details: errorText
      });
    }

    const question = await questionResponse.json();
    console.log('✅ Question created with ID:', question.id);

    // Step 5: Dev mode - skip Stripe, mark as paid
    if (process.env.SKIP_STRIPE === 'true' || process.env.NODE_ENV === 'development') {
      console.log('⚠️ SKIPPING STRIPE - Development Mode');
      
      const patchResponse = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question/${question.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'paid',
            paid_at: Math.floor(Date.now() / 1000),
          }),
        }
      );

      if (patchResponse.ok) {
        console.log('✅ Question status updated to "paid"');
      }
    }

    console.log('🎉 Question submission completed!');

    return res.status(200).json({
      success: true,
      questionId: question.id,
      message: 'Question submitted successfully',
      debug: {
        hasMedia: !!mediaAssetId,
        attachmentsCount: attachmentUrls.length
      }
    });

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    
    return res.status(500).json({
      error: 'Failed to submit question',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}