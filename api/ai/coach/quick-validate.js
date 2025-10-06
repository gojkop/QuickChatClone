import { xanoPost, xanoGet } from '../../lib/xano/client.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, fingerprint, expertId } = req.body;

  if (!title || !fingerprint) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Check rate limits using helper function
    const limitsCheck = await xanoPost('/coaching/check_limits', {
      fingerprint
    });

    if (!limitsCheck.allowed) {
      return res.status(429).json({
        error: limitsCheck.message,
        reason: limitsCheck.reason,
        requiresPayment: limitsCheck.reason === 'payment_required'
      });
    }

    // 2. Rule-based validation (no AI, very cheap)
    const validation = performRuleBasedValidation(title);
    const feedback = generateQuickFeedback(validation);

    // 3. Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 4. Create coaching session using helper function
    await xanoPost('/coaching/create_session', {
      session_id: sessionId,
      fingerprint,
      initial_transcript: title,
      tier_1_validation: validation,
      coaching_tier_reached: 1,
      total_ai_cost: 0.002
    });

    // 5. Update rate limits using helper function
    await xanoPost('/coaching/increment_limit', {
      fingerprint,
      type: 'started'
    });

    return res.json({
      sessionId,
      validation,
      feedback,
      shouldContinue: !validation.isTooShort && !validation.isTooVague,
      canProceedWithoutCoaching: true
    });

  } catch (error) {
    console.error('Quick validation failed:', error);
    return res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
}

function performRuleBasedValidation(title) {
  const text = title.trim();
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;

  return {
    length: charCount,
    wordCount,
    isTooShort: charCount < 10 || wordCount < 3,
    isTooLong: charCount > 200,
    hasVagueness: /\b(this|that|it|stuff|thing)\b/gi.test(text),
    hasQuestion: /\?/.test(text) || /\b(how|what|when|where|why|should|can|could|would)\b/i.test(text),
    hasGreeting: /\b(hi|hello|hey|greetings)\b/i.test(text),
    clarityScore: calculateClarityScore(text, wordCount)
  };
}

function calculateClarityScore(text, wordCount) {
  let score = 50; // Base score

  // Length bonus
  if (wordCount >= 5 && wordCount <= 20) score += 20;
  else if (wordCount >= 3) score += 10;

  // Has question indicator
  if (/\?/.test(text) || /\b(how|what|when|where|why|should)\b/i.test(text)) {
    score += 15;
  }

  // No vague words
  if (!/\b(this|that|it|stuff|thing)\b/gi.test(text)) {
    score += 15;
  }

  // Has specifics (numbers, technical terms, proper nouns)
  if (/\d+/.test(text)) score += 5;
  if (/[A-Z][a-z]+/.test(text)) score += 5;

  // Penalties
  if (/\b(hi|hello|hey)\b/i.test(text)) score -= 20;
  if (wordCount < 3) score -= 30;

  return Math.max(0, Math.min(100, score));
}

function generateQuickFeedback(validation) {
  const issues = [];

  if (validation.isTooShort) {
    issues.push({
      type: 'too_short',
      message: 'Your question is very brief. Add more details for a better answer.',
      severity: 'high',
      suggestion: 'Try to be more specific about what you need help with.'
    });
  }

  if (validation.hasVagueness && validation.wordCount < 8) {
    issues.push({
      type: 'vague',
      message: 'Try to be more specific. Avoid words like "this" or "it".',
      severity: 'medium',
      suggestion: 'Describe exactly what you\'re referring to.'
    });
  }

  if (!validation.hasQuestion && validation.wordCount > 5) {
    issues.push({
      type: 'no_question',
      message: 'Consider phrasing this as a clear question.',
      severity: 'low',
      suggestion: 'What specifically would you like to know?'
    });
  }

  if (validation.hasGreeting) {
    issues.push({
      type: 'greeting',
      message: 'No need for greetings - jump straight to your question.',
      severity: 'low',
      suggestion: 'Start with what you need help with.'
    });
  }

  if (validation.clarityScore < 40) {
    issues.push({
      type: 'unclear',
      message: 'Your question could be clearer.',
      severity: 'high',
      suggestion: 'Be specific about your situation and what you want to know.'
    });
  }

  return issues;
}