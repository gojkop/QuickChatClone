// api/me/questions/stats.js
// Optimized endpoint to get question counts for all tabs in parallel

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from request
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const XANO_BASE_URL = process.env.XANO_AUTH_BASE_URL;

    // Fetch all counts in parallel for maximum performance
    const [pendingRes, answeredRes, allRes] = await Promise.all([
      // Pending: unanswered questions only
      fetch(`${XANO_BASE_URL}/me/questions/count?unanswered=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }),

      // Answered: answered questions only
      fetch(`${XANO_BASE_URL}/me/questions/count?status=answered`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }),

      // All: all questions (no filter)
      fetch(`${XANO_BASE_URL}/me/questions/count`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    // Parse responses
    const pendingData = await pendingRes.json();
    const answeredData = await answeredRes.json();
    const allData = await allRes.json();

    // Return counts
    return res.status(200).json({
      pending: pendingData.count || 0,
      answered: answeredData.count || 0,
      all: allData.count || 0
    });

  } catch (err) {
    console.error('Failed to fetch question stats:', err);
    return res.status(500).json({
      error: 'Failed to fetch question stats',
      details: err.message
    });
  }
}
