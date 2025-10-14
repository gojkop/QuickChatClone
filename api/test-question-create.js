// api/test-question-create.js
// Temporary test endpoint to diagnose Xano response

export default async function handler(req, res) {
  const XANO_PUBLIC_BASE_URL = process.env.XANO_PUBLIC_BASE_URL || 
                                 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';

  try {
    console.log('🧪 Testing Xano question creation...');

    // Minimal test payload
    const testPayload = {
      expert_profile_id: 1, // Use a real expert_profile_id from your DB
      payer_email: 'test@example.com',
      price_cents: 2500,
      currency: 'USD',
      status: 'test',
      sla_hours_snapshot: 48,
      title: 'Test Question',
      text: 'This is a test question',
      review_token: 'test-token-' + Date.now(),
    };

    console.log('📤 Sending payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(
      `${XANO_PUBLIC_BASE_URL}/question`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      }
    );

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Raw response body:', responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
      console.log('📥 Parsed response:', JSON.stringify(parsedResponse, null, 2));
    } catch (e) {
      console.error('❌ Failed to parse response as JSON');
      return res.status(500).json({
        error: 'Xano returned non-JSON response',
        rawResponse: responseText.substring(0, 500)
      });
    }

    // Check what we got back
    const diagnostics = {
      hasId: !!parsedResponse.id,
      hasReviewToken: !!parsedResponse.review_token,
      responseKeys: Object.keys(parsedResponse),
      fullResponse: parsedResponse,
    };

    console.log('🔍 Diagnostics:', JSON.stringify(diagnostics, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Test complete',
      diagnostics,
      advice: diagnostics.hasId 
        ? '✅ Xano is returning the ID correctly' 
        : '❌ Xano is NOT returning the ID. Check endpoint configuration in Xano.',
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}