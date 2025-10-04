// api/questions/submit.js
// Vercel Serverless Function to handle question submission

import FormData from 'form-data';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      expertHandle,
      title,
      text,
      recordingMode, // 'video' or 'audio'
      recordingBlob, // base64 encoded blob
      attachments, // array of { name, data (base64), type }
      payerEmail,
      payerFirstName,
      payerLastName,
    } = req.body;

    console.log('Starting question submission for expert:', expertHandle);

    // Step 1: Get expert profile from Xano
    const expertResponse = await axios.get(
      `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${expertHandle}`
    );

    const expertProfile = expertResponse.data?.expert_profile || expertResponse.data;
    
    if (!expertProfile || !expertProfile.id) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    console.log('Expert found:', expertProfile.id);

    // Step 2: Upload recording to Cloudflare Stream (if exists)
    let mediaAssetId = null;
    
    if (recordingBlob && recordingMode) {
      console.log('Uploading recording to Cloudflare Stream...');
      
      const recordingBuffer = Buffer.from(recordingBlob, 'base64');
      const formData = new FormData();
      formData.append('file', recordingBuffer, {
        filename: `question-${Date.now()}.webm`,
        contentType: recordingMode === 'video' ? 'video/webm' : 'audio/webm',
      });

      const streamResponse = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
            ...formData.getHeaders(),
          },
        }
      );

      if (streamResponse.data.success) {
        const streamVideo = streamResponse.data.result;
        
        // Create media_asset record in Xano
        const mediaAssetResponse = await axios.post(
          'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/media_asset',
          {
            owner_type: 'question',
            provider: 'cloudflare_stream',
            asset_id: streamVideo.uid,
            duration_sec: streamVideo.duration || 0,
            status: 'processing',
            url: `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID.substring(0, 32)}.cloudflarestream.com/${streamVideo.uid}/manifest/video.m3u8`,
          }
        );

        mediaAssetId = mediaAssetResponse.data.id;
        console.log('Media asset created:', mediaAssetId);
      }
    }

    // Step 3: Upload attachments to Cloudflare R2 (if any)
    const attachmentUrls = [];
    
    if (attachments && attachments.length > 0) {
      console.log(`Uploading ${attachments.length} attachments to R2...`);
      
      for (const attachment of attachments) {
        const attachmentBuffer = Buffer.from(attachment.data, 'base64');
        const timestamp = Date.now();
        const sanitizedName = attachment.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `question-attachments/${timestamp}-${sanitizedName}`;

        // Note: This is a simplified R2 upload. You may need to use AWS SDK properly
        // For now, we'll use a placeholder URL
        const url = `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;
        attachmentUrls.push({
          name: attachment.name,
          url: url,
        });
      }
      
      console.log('Attachments processed:', attachmentUrls.length);
    }

    // Step 4: Create question record in Xano
    console.log('Creating question record in Xano...');
    
    const questionData = {
      expert_profile_id: expertProfile.id,
      payer_email: payerEmail,
      price_cents: expertProfile.price_cents,
      currency: expertProfile.currency || 'USD',
      status: 'pending_payment', // Will change to 'paid' after Stripe integration
      sla_hours_snapshot: expertProfile.sla_hours,
      title: title,
      text: text || null,
      media_asset_id: mediaAssetId,
      attachments: attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
    };

    const questionResponse = await axios.post(
      'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question',
      questionData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const question = questionResponse.data;
    console.log('Question created:', question.id);

    // Step 5: PLACEHOLDER - Skip Stripe for now
    // TODO: Create Stripe Checkout Session here
    console.log('⚠️ SKIPPING STRIPE PAYMENT - Development Mode');
    
    // For now, immediately mark as "paid" for testing
    await axios.patch(
      `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question/${question.id}`,
      {
        status: 'paid',
        paid_at: Math.floor(Date.now() / 1000),
      }
    );

    // Return success response (in production, this would be checkout URL)
    return res.status(200).json({
      success: true,
      questionId: question.id,
      message: 'Question submitted successfully (payment skipped in dev mode)',
      // In production, add: checkoutUrl: session.url
    });

  } catch (error) {
    console.error('Question submission error:', error);
    
    return res.status(500).json({
      error: 'Failed to submit question',
      message: error.message,
      details: error.response?.data || null,
    });
  }
}