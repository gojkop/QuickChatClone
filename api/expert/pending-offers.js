// api/expert/pending-offers.js
// Get pending Deep Dive offers for authenticated expert

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Call Xano endpoint
    const xanoResponse = await fetch(
      `${process.env.XANO_BASE_URL}/expert/pending-offers`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!xanoResponse.ok) {
      const errorData = await xanoResponse.json();
      throw new Error(errorData.message || 'Failed to fetch pending offers');
    }

    const result = await xanoResponse.json();

    return res.status(200).json({
      success: true,
      offers: result.offers || [],
      count: result.count || 0
    });

  } catch (error) {
    console.error('Pending offers fetch error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch pending offers'
    });
  }
}
