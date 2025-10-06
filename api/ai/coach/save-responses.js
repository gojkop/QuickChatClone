import { xanoClient } from '../../lib/xano-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, responses } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  try {
    await xanoClient.post('/coaching/update_session', {
      session_id: sessionId,
      updates: {
        tier_2_clarification_responses: responses
      }
    });

    return res.json({ success: true });

  } catch (error) {
    console.error('Failed to save responses:', error);
    return res.status(500).json({
      error: 'Failed to save responses',
      message: error.message
    });
  }
}