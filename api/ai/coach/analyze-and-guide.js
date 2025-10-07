import { callLLM } from '../../lib/llm-service.js';

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

  const { sessionId, expertProfile, questionContext } = req.body;

  if (!sessionId || !expertProfile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('[Tier 2] Starting AI analysis:', { sessionId, expert: expertProfile.name });

    // ⭐ MOCK: Skip Xano session fetch for now
    // In production, we'd fetch the session from Xano
    const mockSession = {
      initial_transcript: 'How should I price my SaaS?', // Mock data
      tier_1_validation: { clarityScore: 65 }
    };

    const questionTitle = mockSession.initial_transcript;

    // Generate AI analysis
    const analysis = await analyzeQuestion(
      questionTitle,
      questionContext,
      expertProfile
    );

    console.log('[Tier 2] Analysis complete:', { clarity: analysis.clarity });

    // Generate clarifying questions
    const clarifications = await generateClarifications(
      questionTitle,
      questionContext,
      expertProfile,
      analysis
    );

    console.log('[Tier 2] Generated clarifications:', clarifications.length);

    // Detect if attachments would help
    const attachmentSuggestions = detectNeededAttachments(
      questionTitle,
      questionContext,
      analysis
    );

    // ⭐ MOCK: Skip Xano update for now
    console.log('[Tier 2] Would update session in Xano:', {
      session_id: sessionId,
      coaching_tier_reached: 2,
      total_ai_cost: 0.021
    });

    return res.json({
      analysis,
      clarifications,
      attachmentSuggestions,
      mock: true // ⭐ Indicate this is mock data
    });

  } catch (error) {
    console.error('[Tier 2] Analysis failed:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
}

async function analyzeQuestion(title, context, expertProfile) {
  const contextText = context?.text || '';
  const fullQuestion = contextText 
    ? `${title}\n\nAdditional context: ${contextText}`
    : title;

  const prompt = `Analyze this question for ${expertProfile.name || 'an expert'}, who specializes in ${expertProfile.specialty || 'their field'}.

Question: "${fullQuestion}"

Provide a brief analysis:
1. One-sentence summary of what they're asking
2. List of missing context (what would help the expert answer better)
3. Clarity score from 0-100

Respond in JSON format:
{
  "summary": "one sentence summary",
  "missingContext": ["item 1", "item 2", "item 3"],
  "clarity": 75
}`;

  return await callLLM(prompt, {
    temperature: 0.5,
    max_tokens: 1000,  // ✅ INCREASED from 400
    requireJSON: true
  });
}

async function generateClarifications(title, context, expertProfile, analysis) {
  const contextText = context?.text || '';
  const fullQuestion = contextText 
    ? `${title}\n\nContext: ${contextText}`
    : title;

  const prompt = `Generate 2-3 clarifying questions to improve this question for the expert.

Original question: "${fullQuestion}"

Missing context identified: ${analysis.missingContext.join(', ')}

Expert: ${expertProfile.name || 'Expert'} (${expertProfile.specialty || 'specialist'})

Rules:
- Each question should take <30 seconds to answer
- Be specific and actionable, not generic
- Focus on what would help the expert give a better answer

Respond in JSON format:
{
  "clarifications": [
    {
      "id": "c1",
      "question": "the clarifying question",
      "why": "brief explanation of why this helps",
      "optional": false
    }
  ]
}`;

  const result = await callLLM(prompt, {
    temperature: 0.7,
    max_tokens: 1500,  // ✅ INCREASED from 500
    requireJSON: true
  });

  return result.clarifications.slice(0, 3).map((c, index) => ({
    ...c,
    id: `c${index + 1}`
  }));
}

function detectNeededAttachments(title, context, analysis) {
  const suggestions = [];
  const fullText = `${title} ${context?.text || ''}`.toLowerCase();

  const patterns = [
    {
      regex: /\b(website|landing page|page|site|url|web)\b/i,
      suggestion: 'URL or screenshot of the webpage you\'re asking about'
    },
    {
      regex: /\b(design|mockup|wireframe|ui|interface|prototype)\b/i,
      suggestion: 'Design file, mockup, or screenshot'
    },
    {
      regex: /\b(code|function|error|bug|script|programming)\b/i,
      suggestion: 'Code snippet or error message screenshot'
    },
    {
      regex: /\b(data|numbers|metrics|analytics|stats|graph|chart)\b/i,
      suggestion: 'Spreadsheet, data file, or analytics screenshot'
    }
  ];

  patterns.forEach(({ regex, suggestion }) => {
    if (regex.test(fullText) && !suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  });

  return suggestions.slice(0, 3);
}