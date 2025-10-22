// api/offers/[id]/decline.js
// Decline a Deep Dive offer

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { decline_reason } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Call Xano endpoint
    const xanoResponse = await fetch(
      `${process.env.XANO_BASE_URL}/offers/${id}/decline`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decline_reason: decline_reason || 'Expert declined'
        })
      }
    );

    if (!xanoResponse.ok) {
      const errorText = await xanoResponse.text();
      console.error('Xano decline error:', {
        status: xanoResponse.status,
        statusText: xanoResponse.statusText,
        body: errorText
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || errorData.error || 'Failed to decline offer');
    }

    const result = await xanoResponse.json();

    return res.status(200).json({
      success: true,
      question_id: result.question_id,
      status: result.status,
      refund_status: result.refund_status
    });

  } catch (error) {
    console.error('Decline offer error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to decline offer'
    });
  }
}
