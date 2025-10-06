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

    // Fetch questions from Xano
    const response = await fetch(
      `${process.env.XANO_AUTH_BASE_URL}/me/questions`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Xano returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Xano response:', JSON.stringify(data).substring(0, 500));

    // Clean up the data before returning
    const cleanedData = data.map(question => {
      let cleanedAttachments = null;
      
      // Parse attachments safely
      if (question.attachments) {
        try {
          cleanedAttachments = typeof question.attachments === 'string' 
            ? JSON.parse(question.attachments)
            : question.attachments;
        } catch (e) {
          console.error(`Invalid attachments JSON for question ${question.id}:`, e.message);
          console.error('Attachments value:', question.attachments);
          cleanedAttachments = null;
        }
      }
      
      return {
        ...question,
        attachments: cleanedAttachments,
        // Ensure recording_segments is an array
        recording_segments: Array.isArray(question.recording_segments) 
          ? question.recording_segments 
          : []
      };
    });

    return res.json(cleanedData);

  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch questions'
    });
  }
}