// api/questions/submit.js
// Simplified version with proper CORS handling

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  // CRITICAL: Set CORS headers FIRST, before anything else
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎯 Question submission started');
    console.log('📦 Request body keys:', Object.keys(req.body || {}));

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
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['expertHandle', 'title', 'payerEmail'],
        received: { expertHandle, title, payerEmail }
      });
    }

    console.log('✅ Validation passed');
    console.log('👤 Expert:', expertHandle);
    console.log('📧 Email:', payerEmail);
    console.log('📝 Title:', title);

    // Step 1: Get expert profile from Xano
    console.log('📡 Fetching expert profile...');
    const expertResponse = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(expertHandle)}`
    );

    if (!expertResponse.ok) {
      console.error('❌ Expert not found, status:', expertResponse.status);
      return res.status(404).json({ error: 'Expert not found' });
    }

    const expertData = await expertResponse.json();
    console.log('📦 Expert data received:', Object.keys(expertData));
    
    const expertProfile = expertData?.expert_profile || expertData;
    
    if (!expertProfile || !expertProfile.id) {
      console.error('❌ Expert profile not found in response');
      return res.status(404).json({ error: 'Expert profile not found' });
    }

    console.log('✅ Expert found - ID:', expertProfile.id);
    console.log('💰 Price:', expertProfile.price_cents, expertProfile.currency);

    // Step 2: Skip media upload for now
    let mediaAssetId = null;
    
    if (recordingBlob && recordingMode) {
      console.log('⚠️ Recording detected but upload skipped (not implemented yet)');
      console.log('🎥 Recording mode:', recordingMode);
      console.log('📊 Blob size:', recordingBlob ? recordingBlob.length : 0, 'chars');
    }

    // Step 3: Skip attachments for now
    const attachmentUrls = [];
    
    if (attachments && attachments.length > 0) {
      console.log(`⚠️ ${attachments.length} attachments detected but upload skipped`);
    }

    // Step 4: Create question record in Xano
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

    console.log('📤 Sending to Xano:', {
      ...questionData,
      text: questionData.text ? `${questionData.text.substring(0, 50)}...` : null
    });

    const questionResponse = await fetch(
      'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      }
    );

    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.error('❌ Xano error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to create question in database',
        details: errorText,
        status: questionResponse.status
      });
    }

    const question = await questionResponse.json();
    console.log('✅ Question created with ID:', question.id);

    // Step 5: Skip Stripe, mark as paid immediately
    console.log('⚠️ SKIPPING STRIPE PAYMENT - Development Mode');
    console.log('🔄 Updating question status to "paid"...');
    
    const patchResponse = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/question/${question.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid',
          paid_at: Math.floor(Date.now() / 1000),
        }),
      }
    );

    if (!patchResponse.ok) {
      console.error('⚠️ Failed to update question status, but question was created');
      console.error('Status:', patchResponse.status);
    } else {
      console.log('✅ Question status updated to "paid"');
    }

    console.log('🎉 Question submission completed successfully!');

    // Return success
    return res.status(200).json({
      success: true,
      questionId: question.id,
      message: 'Question submitted successfully (payment skipped in dev mode)',
      debug: {
        expertId: expertProfile.id,
        questionTitle: title,
        status: 'paid'
      }
    });

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to submit question',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}