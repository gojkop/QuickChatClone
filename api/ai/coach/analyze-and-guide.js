import { xanoClient } from '../../lib/xano/client.js';
import { callLLM } from '../../lib/llm-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, expertProfile, questionContext } = req.body;

  if (!sessionId || !expertProfile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get session from Xano
    const sessionResponse = await xanoClient.get(`/coaching/sessions/${sessionId}`);
    const session = sessionResponse.data;

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.coaching_tier_reached < 1) {
      return res.status(400).json({ error: 'Complete validation first' });
    }

    const questionTitle = session.initial_transcript;

    // 2. Generate AI analysis
    const analysis = await analyzeQuestion(
      questionTitle,
      questionContext,
      expertProfile
    );

    // 3. Generate clarifying questions
    const clarifications = await generateClarifications(
      questionTitle,
      questionContext,
      expertProfile,
      analysis
    );

    // 4. Detect if attachments would help
    const attachmentSuggestions = detectNeededAttachments(
      questionTitle,
      questionContext,
      analysis
    );

    // 5. Update session in Xano
    await xanoClient.post('/coaching/update_session', {
      session_id: sessionId,
      updates: {
        coaching_tier_reached: 2,
        tier_2_analysis: {
          analysis,
          clarifications,
          attachmentSuggestions,
          generated_at: new Date().toISOString()
        },
        total_ai_cost: (session.total_ai_cost || 0) + 0.021
      }
    });

    return res.json({
      analysis,
      clarifications,
      attachmentSuggestions
    });

  } catch (error) {
    console.error('AI analysis failed:', error);
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
    max_tokens: 400,
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
- Questions should feel natural and helpful, not interrogative

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
    max_tokens: 500,
    requireJSON: true
  });

  // Ensure we have at most 3 clarifications
  return result.clarifications.slice(0, 3).map((c, index) => ({
    ...c,
    id: `c${index + 1}`
  }));
}

function detectNeededAttachments(title, context, analysis) {
  const suggestions = [];
  const fullText = `${title} ${context?.text || ''}`.toLowerCase();

  // Pattern matching for common scenarios
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
    },
    {
      regex: /\b(document|doc|pdf|contract|agreement)\b/i,
      suggestion: 'The document you\'re referring to'
    },
    {
      regex: /\b(email|message|communication)\b/i,
      suggestion: 'Screenshot of the email or message'
    },
    {
      regex: /\b(ad|advertisement|campaign|creative)\b/i,
      suggestion: 'Screenshot or file of the ad creative'
    }
  ];

  patterns.forEach(({ regex, suggestion }) => {
    if (regex.test(fullText) && !suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  });

  // Limit to top 3 most relevant
  return suggestions.slice(0, 3);
}