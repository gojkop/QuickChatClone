// ============================================
// FILE: api/questions/submit.js
// Main API endpoint (now much simpler!)
// ============================================
import { validateQuestionSubmission } from '../lib/validators.js';
import { submitQuestion } from '../services/questionService.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request payload
    validateQuestionSubmission(req.body);

    // Process submission
    const result = await submitQuestion(req.body);

    // Return success
    return res.status(200).json({
      success: true,
      questionId: result.question.id,
      mediaAssetId: result.mediaAsset?.id,
      attachmentCount: result.attachments.length,
    });

  } catch (error) {
    console.error('Question submission error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit question',
    });
  }
}