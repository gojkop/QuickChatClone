// api/offers/[id]/accept.js
// Accept a Deep Dive offer

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

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
      `${process.env.XANO_BASE_URL}/offers/${id}/accept`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to accept offer');
    }

    const result = await xanoResponse.json();

    return res.status(200).json({
      success: true,
      question_id: result.question_id,
      status: result.status,
      sla_deadline: result.sla_deadline
    });

  } catch (error) {
    console.error('Accept offer error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to accept offer'
    });
  }
}
