QuickChat AI Features: Complete Implementation Specification
Document Version: 1.0
Last Updated: October 2025
Purpose: AI-assisted development reference for implementing three core AI features

Table of Contents

System Context & Current Architecture
Feature 1: Proactive Expert Co-pilot
Feature 2: AI Question Coach
Feature 3: Expertise Flywheel
Shared Infrastructure
Development Sequence
Testing Strategy


System Context & Current Architecture {#system-context}
Current Tech Stack
Frontend: React + Vite + Tailwind CSS + React Router + Axios
Backend: Node.js on Vercel Serverless Functions
Database: Xano (REST API)
Auth: Google OAuth
Media: Cloudflare Stream (video/audio) + Cloudflare R2 (files)
Deployment: Vercel
Current Data Flow
Question Submission:
1. User records video/audio in browser
2. Frontend uploads to R2 via presigned URL (api/media/get-upload-url.js)
3. Cloudflare Stream processes media (api/media/trigger-stream.js)
4. User submits with media UID reference (api/questions/create.js)
5. Xano stores question record with media references

Answer Submission:
1. Expert records answer
2. Similar upload flow to R2/Stream
3. api/answers/create.js stores answer record
4. Stripe capture triggered
5. Asker notified
Existing Project Structure
/src
  /pages
    - HomePage.jsx
    - ExpertDashboardPage.jsx
    - QuestionComposerPage.jsx
  /components
    /dashboard
    /home
    /question
      - QuestionComposer.jsx
  /hooks
    - useRecordingSegmentUpload.js
    - useAttachmentUpload.js
    - useQuestionNotifications.js
  /api
    - apiClient.js (Axios config)
  /context
    - AuthContext.jsx

/api
  /questions
    - create.js
    - [id].js
  /media
    - get-upload-url.js
    - trigger-stream.js
    - upload-attachment.js
  /oauth
    - callback.js
  /lib
    - xano-client.js
    - cloudflare-client.js
Key Xano Tables (Current)
experts:
  - id, email, name, specialty, price, sla_hours

questions:
  - id, expert_id, asker_email, transcript, media_uid, status, created_at

answers:
  - id, question_id, transcript, media_uid, created_at

media_assets:
  - id, question_id, answer_id, cloudflare_uid, duration

Feature 1: Proactive Expert Co-pilot {#feature-1-copilot}
Business Logic
Trigger: When a new paid question arrives for an expert
Purpose: Analyze question, search past answers, generate outline
Cost per execution: ~$0.02
Target latency: <10 seconds
Database Schema Changes
New Xano tables to create:
javascript// expert_answer_history
{
  id: uuid,
  expert_id: uuid,
  question_id: uuid,
  answer_id: uuid,
  question_text: text,
  answer_text: text,
  question_summary: text,
  embedding_id: string, // reference to vector DB
  topics: json, // ["pricing", "saas", "b2b"]
  created_at: timestamp
}

// copilot_suggestions
{
  id: uuid,
  question_id: uuid,
  expert_id: uuid,
  analysis: json, // {summary, key_points, ambiguities}
  outline: json, // ["point 1", "point 2", ...]
  cited_answers: json, // [{answer_id, quote, relevance}]
  was_viewed: boolean,
  was_used: boolean,
  created_at: timestamp
}

// copilot_metrics
{
  id: uuid,
  expert_id: uuid,
  date: date,
  suggestions_generated: int,
  suggestions_used: int,
  avg_time_to_answer: int, // seconds
  questions_answered: int
}
New Backend Endpoints
1. /api/ai/copilot/analyze-question.js
Purpose: Main Co-pilot analysis endpoint
Trigger: Called immediately when new question arrives
Authentication: Expert JWT required
javascript// Expected request
POST /api/ai/copilot/analyze-question
{
  questionId: "uuid",
  expertId: "uuid" // from JWT
}

// Response structure
{
  analysis: {
    summary: "2-3 sentence summary of the question",
    keyPoints: ["point to address", "point to address"],
    ambiguities: ["what's unclear", "missing context"],
    clarityScore: 75 // 0-100
  },
  outline: [
    "Introduction: acknowledge their situation",
    "Key consideration 1: ...",
    "Key consideration 2: ...",
    "Recommended approach: ..."
  ],
  citedAnswers: [
    {
      answerId: "uuid",
      relevance: 0.89,
      excerpt: "In your previous answer, you said...",
      fullAnswerUrl: "/dashboard/answers/uuid"
    }
  ],
  generatedAt: "timestamp",
  processingTime: 8.2 // seconds
}
Implementation pseudocode:
javascriptimport { getQuestion } from '../lib/xano-client';
import { searchVectorDB, generateEmbedding } from '../lib/vector-service';
import { callLLM } from '../lib/llm-service';

export default async function handler(req, res) {
  const { questionId } = req.body;
  const { expertId } = req.user; // from JWT
  
  try {
    // 1. Get question data
    const question = await getQuestion(questionId);
    
    // 2. Get transcript (may need to wait for Cloudflare)
    const transcript = await getOrWaitForTranscript(question.media_uid);
    
    // 3. Generate embedding for semantic search
    const embedding = await generateEmbedding(transcript);
    
    // 4. Search expert's past answers
    const similarAnswers = await searchVectorDB(expertId, embedding, {
      limit: 5,
      threshold: 0.7
    });
    
    // 5. Build context from similar answers
    const context = await buildContext(similarAnswers);
    
    // 6. Generate analysis with LLM
    const analysis = await generateAnalysis(transcript, context);
    
    // 7. Store suggestion
    await storeSuggestion({
      question_id: questionId,
      expert_id: expertId,
      analysis: analysis.analysis,
      outline: analysis.outline,
      cited_answers: analysis.citedAnswers
    });
    
    // 8. Track metrics
    await incrementMetric(expertId, 'suggestions_generated');
    
    return res.json(analysis);
    
  } catch (error) {
    console.error('Co-pilot analysis failed:', error);
    return res.status(500).json({ 
      error: 'Analysis failed',
      fallback: 'transcript_only' // frontend can still show transcript
    });
  }
}

async function generateAnalysis(transcript, context) {
  const prompt = `You're helping an expert answer this question efficiently.

CURRENT QUESTION:
"${transcript}"

${context.length > 0 ? `
RELEVANT PAST ANSWERS:
${context.map((c, i) => `
${i + 1}. From answer ${c.date}:
   "${c.excerpt}"
`).join('\n')}
` : 'This is the expert\'s first question on this topic.'}

Provide:
1. A concise 2-3 sentence summary
2. 3-5 key points to address
3. Any ambiguities or missing context
4. A structured outline for their answer

If past answers are relevant, cite them specifically.

Return JSON:
{
  analysis: {
    summary: string,
    keyPoints: string[],
    ambiguities: string[],
    clarityScore: number
  },
  outline: string[],
  citedAnswers: [{answerId: string, relevance: number, why: string}]
}`;

  return await callLLM('gpt-4o-mini', prompt, {
    temperature: 0.4,
    max_tokens: 800,
    response_format: { type: "json_object" }
  });
}
2. /api/ai/copilot/process-completed-answer.js
Purpose: Extract knowledge from completed Q&A for future retrieval
Trigger: Webhook when expert submits answer
Authentication: Internal only (webhook signature)
javascript// Expected webhook payload
POST /api/ai/copilot/process-completed-answer
{
  questionId: "uuid",
  answerId: "uuid",
  expertId: "uuid"
}

// Implementation
export default async function handler(req, res) {
  const { questionId, answerId, expertId } = req.body;
  
  // 1. Get transcripts
  const question = await getQuestion(questionId);
  const answer = await getAnswer(answerId);
  
  const qTranscript = await getTranscript(question.media_uid);
  const aTranscript = await getTranscript(answer.media_uid);
  
  // 2. Generate summary
  const summary = await generateSummary(qTranscript, aTranscript);
  
  // 3. Extract topics
  const topics = await extractTopics(qTranscript, aTranscript);
  
  // 4. Generate embedding
  const combined = `Question: ${qTranscript}\n\nAnswer: ${aTranscript}`;
  const embedding = await generateEmbedding(combined);
  
  // 5. Store in vector DB
  const embeddingId = await storeInVectorDB(expertId, embedding, {
    question_id: questionId,
    answer_id: answerId,
    text: combined,
    summary: summary,
    topics: topics
  });
  
  // 6. Store in Xano
  await createAnswerHistory({
    expert_id: expertId,
    question_id: questionId,
    answer_id: answerId,
    question_text: qTranscript,
    answer_text: aTranscript,
    question_summary: summary,
    embedding_id: embeddingId,
    topics: topics
  });
  
  return res.json({ success: true, embeddingId });
}
New Frontend Components
1. src/components/dashboard/CopilotPanel.jsx
jsximport { useState, useEffect } from 'react';
import { useCopilot } from '../../hooks/useCopilot';

export function CopilotPanel({ questionId }) {
  const { analysis, loading, error } = useCopilot(questionId);
  const [outlineExpanded, setOutlineExpanded] = useState(true);
  
  if (loading) {
    return (
      <div className="copilot-loading">
        <div className="spinner" />
        <p>Co-pilot analyzing question...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="copilot-error">
        <p>Co-pilot unavailable. You can still answer normally.</p>
      </div>
    );
  }
  
  return (
    <div className="copilot-panel bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-semibold text-gray-900">Co-pilot Analysis</h3>
        </div>
        <span className="text-xs text-gray-500">
          Clarity: {analysis.analysis.clarityScore}/100
        </span>
      </div>
      
      {/* Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-700">{analysis.analysis.summary}</p>
      </div>
      
      {/* Key Points */}
      {analysis.analysis.keyPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
            Key Points to Address
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {analysis.analysis.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-600">{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Suggested Outline */}
      <div className="mb-4">
        <button
          onClick={() => setOutlineExpanded(!outlineExpanded)}
          className="flex items-center justify-between w-full mb-2"
        >
          <h4 className="text-xs font-semibold text-gray-700 uppercase">
            Suggested Outline
          </h4>
          <span className="text-gray-400">
            {outlineExpanded ? '▼' : '▶'}
          </span>
        </button>
        
        {outlineExpanded && (
          <ol className="list-decimal list-inside space-y-2">
            {analysis.outline.map((point, i) => (
              <li key={i} className="text-sm text-gray-600">{point}</li>
            ))}
          </ol>
        )}
      </div>
      
      {/* Cited Answers */}
      {analysis.citedAnswers.length > 0 && (
        <div className="border-t border-blue-200 pt-3">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
            From Your Past Answers
          </h4>
          {analysis.citedAnswers.map(citation => (
            <div key={citation.answerId} className="mb-2 p-2 bg-white rounded">
              <p className="text-sm text-gray-600 italic">"{citation.excerpt}"</p>
              <a 
                href={citation.fullAnswerUrl}
                className="text-xs text-blue-600 hover:underline"
              >
                View full answer →
              </a>
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => handleUseSuggestion(analysis)}
          className="btn-primary text-sm"
        >
          Use This Outline
        </button>
        <button 
          onClick={() => handleDismiss()}
          className="btn-secondary text-sm"
        >
          I'll Answer My Way
        </button>
      </div>
    </div>
  );
}
2. src/hooks/useCopilot.js
javascriptimport { useState, useEffect } from 'react';
import api from '../api/apiClient';

export function useCopilot(questionId) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!questionId) return;
    
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await api.post('/ai/copilot/analyze-question', {
          questionId
        });
        setAnalysis(response.data);
        
        // Track that expert viewed the suggestion
        await api.post('/ai/copilot/track-view', { questionId });
        
      } catch (err) {
        console.error('Co-pilot error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [questionId]);
  
  return { analysis, loading, error };
}
Integration Points
Modify src/pages/ExpertDashboardPage.jsx:
jsximport { CopilotPanel } from '../components/dashboard/CopilotPanel';

function QuestionDetailView({ question }) {
  return (
    <div>
      {/* Existing question display */}
      <QuestionVideo src={question.videoUrl} />
      <QuestionTranscript text={question.transcript} />
      
      {/* NEW: Co-pilot panel */}
      <CopilotPanel questionId={question.id} />
      
      {/* Existing answer form */}
      <AnswerForm questionId={question.id} />
    </div>
  );
}
Modify api/answers/create.js to trigger processing:
javascript// After answer is successfully created
export default async function handler(req, res) {
  // ... existing answer creation code ...
  
  const answer = await createAnswer(req.body);
  
  // NEW: Trigger Co-pilot processing (async, don't wait)
  fetch('/api/ai/copilot/process-completed-answer', {
    method: 'POST',
    body: JSON.stringify({
      questionId: answer.question_id,
      answerId: answer.id,
      expertId: req.user.expertId
    })
  }).catch(err => console.error('Co-pilot processing failed:', err));
  
  return res.json(answer);
}

Feature 2: AI Question Coach {#feature-2-coach}
Business Logic
Tiered approach to manage costs:

Tier 1 (Free): Rule-based validation - $0.002
Tier 2 (Pre-payment): AI analysis + clarifications - $0.021
Tier 3 (Post-authorization): Deep enhancement - $0.050

Total cost per paid question: ~$0.077
Database Schema Changes
New Xano tables:
javascript// question_coaching_sessions
{
  id: uuid,
  question_id: uuid, // nullable, created after payment
  asker_fingerprint: string, // IP hash + device ID
  initial_transcript: text,
  tier_1_validation: json,
  tier_2_analysis: json,
  tier_3_enhancement: json,
  clarification_responses: json,
  coaching_tier_reached: int, // 1, 2, or 3
  converted_to_payment: boolean,
  total_ai_cost: decimal,
  created_at: timestamp
}

// coaching_rate_limits
{
  fingerprint: string,
  questions_started_today: int,
  questions_paid_today: int,
  last_question_at: timestamp,
  is_flagged: boolean,
  flag_reason: string
}
New Backend Endpoints
1. /api/ai/coach/quick-validate.js (Tier 1)
javascript// Request
POST /api/ai/coach/quick-validate
{
  transcript: string,
  fingerprint: string,
  expertId: string
}

// Response
{
  validation: {
    length: 245,
    isTooShort: false,
    isTooLong: false,
    hasVagueness: true,
    hasQuestion: true,
    wordCount: 42
  },
  feedback: [
    {
      type: "vague",
      message: "Try to be more specific. Instead of 'this' or 'it', describe what you're referring to.",
      severity: "medium"
    }
  ],
  shouldContinue: true,
  sessionId: "uuid"
}

// Implementation
export default async function handler(req, res) {
  const { transcript, fingerprint, expertId } = req.body;
  
  // 1. Check rate limits
  const eligible = await checkEligibility(fingerprint);
  if (!eligible.allowed) {
    return res.status(429).json({ 
      error: eligible.message,
      requiresPayment: eligible.reason === 'payment_required'
    });
  }
  
  // 2. Rule-based validation (no AI, very cheap)
  const validation = {
    length: transcript.length,
    isTooShort: transcript.length < 50,
    isTooLong: transcript.length > 1500,
    hasVagueness: /\b(this|that|it|stuff|thing)\b/gi.test(transcript),
    hasQuestion: /\?/.test(transcript),
    wordCount: transcript.split(/\s+/).length
  };
  
  const feedback = generateQuickFeedback(validation);
  
  // 3. Create coaching session
  const session = await createCoachingSession({
    asker_fingerprint: fingerprint,
    initial_transcript: transcript,
    tier_1_validation: validation,
    coaching_tier_reached: 1,
    total_ai_cost: 0.002
  });
  
  // 4. Update rate limits
  await incrementRateLimit(fingerprint, 'questions_started');
  
  return res.json({
    validation,
    feedback,
    shouldContinue: !validation.isTooShort && validation.hasQuestion,
    sessionId: session.id
  });
}

function generateQuickFeedback(validation) {
  const issues = [];
  
  if (validation.isTooShort) {
    issues.push({
      type: 'too_short',
      message: 'Your question seems very brief. Add more context for a better answer.',
      severity: 'high'
    });
  }
  
  if (validation.hasVagueness && validation.wordCount < 30) {
    issues.push({
      type: 'vague',
      message: 'Try to be more specific about what you\'re asking.',
      severity: 'medium'
    });
  }
  
  if (!validation.hasQuestion) {
    issues.push({
      type: 'no_question',
      message: 'Consider ending with a clear question.',
      severity: 'low'
    });
  }
  
  return issues;
}

async function checkEligibility(fingerprint) {
  const limits = await getRateLimits(fingerprint);
  
  if (limits.is_flagged) {
    return { 
      allowed: false, 
      reason: 'flagged',
      message: 'Account flagged for unusual activity'
    };
  }
  
  // Max 5 free questions per day
  const ratio = limits.questions_paid_today / 
                (limits.questions_started_today || 1);
                
  if (limits.questions_started_today >= 5 && ratio < 0.4) {
    return {
      allowed: false,
      reason: 'payment_required',
      message: 'Please complete a payment to continue'
    };
  }
  
  return { allowed: true };
}
2. /api/ai/coach/analyze-and-guide.js (Tier 2)
javascript// Request
POST /api/ai/coach/analyze-and-guide
{
  sessionId: string,
  expertProfile: {
    name: string,
    specialty: string,
    price: number
  }
}

// Response
{
  analysis: {
    summary: string,
    missingContext: string[],
    clarity: number
  },
  clarifications: [
    {
      id: string,
      question: string,
      why: string,
      optional: boolean
    }
  ],
  attachmentSuggestions: string[]
}

// Implementation
export default async function handler(req, res) {
  const { sessionId, expertProfile } = req.body;
  
  // 1. Get session
  const session = await getCoachingSession(sessionId);
  
  if (session.coaching_tier_reached < 1) {
    return res.status(400).json({ 
      error: 'Complete validation first' 
    });
  }
  
  const transcript = session.initial_transcript;
  
  // 2. Generate analysis with LLM
  const analysis = await analyzequestion(transcript, expertProfile);
  
  // 3. Generate clarifying questions
  const clarifications = await generateClarifications(
    transcript, 
    expertProfile,
    analysis
  );
  
  // 4. Detect if attachments would help
  const attachmentSuggestions = detectNeededAttachments(
    transcript,
    analysis
  );
  
  // 5. Update session
  await updateCoachingSession(sessionId, {
    coaching_tier_reached: 2,
    tier_2_analysis: {
      analysis,
      clarifications,
      attachmentSuggestions
    },
    total_ai_cost: session.total_ai_cost + 0.021
  });
  
  return res.json({
    analysis,
    clarifications,
    attachmentSuggestions
  });
}

async function analyzeQuestion(transcript, expertProfile) {
  const prompt = `Analyze this question for ${expertProfile.name}, a ${expertProfile.specialty}.

Question: "${transcript}"

Provide:
1. A one-sentence summary
2. What context is missing?
3. Clarity score 0-100

JSON format:
{
  summary: string,
  missingContext: string[],
  clarity: number
}`;

  const response = await callLLM('gpt-4o-mini', prompt, {
    temperature: 0.5,
    max_tokens: 300,
    response_format: { type: "json_object" }
  });
  
  return response;
}

async function generateClarifications(transcript, expertProfile, analysis) {
  const prompt = `Generate 2-3 clarifying questions to improve this question.

Original: "${transcript}"
Missing context: ${analysis.missingContext.join(', ')}

Expert: ${expertProfile.name} (${expertProfile.specialty})

Rules:
- Each takes <30 seconds to answer
- Be specific, not generic
- Focus on what the expert needs

JSON: {clarifications: [{id, question, why, optional}]}`;

  const response = await callLLM('gpt-4o-mini', prompt, {
    temperature: 0.7,
    max_tokens: 300,
    response_format: { type: "json_object" }
  });
  
  return response.clarifications.slice(0, 3);
}

function detectNeededAttachments(transcript, analysis) {
  const suggestions = [];
  
  // Pattern matching for common scenarios
  if (/\b(website|landing page|page|site)\b/i.test(transcript)) {
    suggestions.push('URL or screenshot of the page you\'re asking about');
  }
  
  if (/\b(design|mockup|wireframe|ui|interface)\b/i.test(transcript)) {
    suggestions.push('Design file or screenshot');
  }
  
  if (/\b(code|function|error|bug)\b/i.test(transcript)) {
    suggestions.push('Code snippet or error message');
  }
  
  if (/\b(data|numbers|metrics|analytics)\b/i.test(transcript)) {
    suggestions.push('Spreadsheet or data screenshot');
  }
  
  return suggestions;
}
3. /api/ai/coach/enhance-for-expert.js (Tier 3)
javascript// Request (webhook from Stripe authorization)
POST /api/ai/coach/enhance-for-expert
{
  questionId: string,
  sessionId: string
}

// This runs AFTER payment is authorized
export default async function handler(req, res) {
  const { questionId, sessionId } = req.body;
  
  const session = await getCoachingSession(sessionId);
  const question = await getQuestion(questionId);
  
  // 1. Combine all context
  const fullContext = {
    original: session.initial_transcript,
    clarifications: session.clarification_responses || {},
    attachments: question.attachments || []
  };
  
  // 2. Generate expert-facing enhancement
  const enhancement = await enhanceForExpert(fullContext);
  
  // 3. Update question with enhancement
  await updateQuestion(questionId, {
    enhanced_transcript: enhancement.enrichedTranscript,
    key_points: enhancement.keyPoints,
    expert_notes: enhancement.notes
  });
  
  // 4. Update session
  await updateCoachingSession(sessionId, {
    question_id: questionId,
    coaching_tier_reached: 3,
    converted_to_payment: true,
    tier_3_enhancement: enhancement,
    total_ai_cost: session.total_ai_cost + 0.050
  });
  
  return res.json({ success: true });
}

async function enhanceForExpert(context) {
  const prompt = `Enhance this question for the expert.

ORIGINAL QUESTION:
"${context.original}"

${Object.keys(context.clarifications).length > 0 ? `
ADDITIONAL CONTEXT PROVIDED:
${Object.entries(context.clarifications).map(([q, a]) => 
  `Q: ${q}\nA: ${a}`
).join('\n\n')}
` : ''}

${context.attachments.length > 0 ? `
ATTACHMENTS: ${context.attachments.length} file(s)
` : ''}

Create:
1. Enriched version combining all info
2. Bullet list of key points
3. Brief note for the expert

JSON:
{
  enrichedTranscript: string,
  keyPoints: string[],
  notes: string
}`;

  return await callLLM('gpt-4o-mini', prompt, {
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" }
  });
}
New Frontend Components
1. src/components/question/QuestionCoachDialog.jsx
jsximport { useState } from 'react';

export function QuestionCoachDialog({ 
  analysis, 
  clarifications,
  attachmentSuggestions,
  onComplete 
}) {
  const [responses, setResponses] = useState({});
  const [showClarifications, setShowClarifications] = useState(true);
  
  const handleResponse = (clarificationId, value) => {
    setResponses({
      ...responses,
      [clarificationId]: value
    });
  };
  
  return (
    <div className="coach-dialog max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Help {analysis.expertName} give you the best answer
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Question clarity:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${analysis.clarity}%` }}
            />
          </div>
          <span className="font-medium">{analysis.clarity}/100</span>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <p className="text-sm">{analysis.summary}</p>
      </div>
      
      {/* Clarifying questions */}
      {clarifications.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Quick clarifications</h3>
            <button
              onClick={() => setShowClarifications(!showClarifications)}
              className="text-sm text-blue-600"
            >
              {showClarifications ? 'Skip these' : 'Show clarifications'}
            </button>
          </div>
          
          {showClarifications && (
            <div className="space-y-4">
              {clarifications.map(c => (
                <div key={c.id} className="border border-gray-200 rounded p-4">
                  <label className="block mb-2">
                    <span className="font-medium text-sm">{c.question}</span>
                    {c.optional && (
                      <span className="text-xs text-gray-500 ml-2">
                        (optional)
                      </span>
                    )}
                  </label>
                  <textarea
                    placeholder="Your answer..."
                    className="w-full p-2 border rounded text-sm"
                    rows={2}
                    value={responses[c.id] || ''}
                    onChange={(e) => handleResponse(c.id, e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Why: {c.why}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Attachment suggestions */}
      {attachmentSuggestions.length > 0 && (
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded">
          <h3 className="font-medium text-sm mb-2">💡 This would help:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {attachmentSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onComplete(responses)}
          className="flex-1 bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700"
        >
          Continue to Payment
        </button>
        <button
          onClick={() => onComplete(null)}
          className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
2. src/hooks/useQuestionCoach.js
javascriptimport { useState } from 'react';
import api from '../api/apiClient';

export function useQuestionCoach() {
  const [sessionId, setSessionId] = useState(null);
  const [tier1Result, setTier1Result] = useState(null);
  const [tier2Result, setTier2Result] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const validateQuestion = async (transcript, fingerprint, expertId) => {
    setLoading(true);
    try {
      const result = await api.post('/ai/coach/quick-validate', {
        transcript,
        fingerprint,
        expertId
      });
      
      setSessionId(result.data.sessionId);
      setTier1Result(result.data);
      
      return result.data;
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getCoaching = async (expertProfile) => {
    if (!sessionId) throw new Error('No session');
    
    setLoading(true);
    try {
      const result = await api.post('/ai/coach/analyze-and-guide', {
        sessionId,
        expertProfile
      });
      
      setTier2Result(result.data);
      return result.data;
    } catch (error) {
      console.error('Coaching failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const submitWithResponses = async (clarificationResponses) => {
    await api.post('/ai/coach/save-responses', {
      sessionId,
      responses: clarificationResponses
    });
  };
  
  return {
    validateQuestion,
    getCoaching,
    submitWithResponses,
    sessionId,
    tier1Result,
    tier2Result,
    loading
  };
}
Integration Points
Modify src/components/question/QuestionComposer.jsx:
jsximport { useState } from 'react';
import { useQuestionCoach } from '../../hooks/useQuestionCoach';
import { QuestionCoachDialog } from './QuestionCoachDialog';

export function QuestionComposer({ expertId, expertProfile }) {
  const [step, setStep] = useState('record'); // record, validate, coach, payment
  const [transcript, setTranscript] = useState('');
  const coach = useQuestionCoach();
  
  const handleRecordComplete = async (recording, transcript) => {
    setTranscript(transcript);
    
    // Tier 1: Quick validation
    const validation = await coach.validateQuestion(
      transcript,
      getFingerprint(),
      expertId
    );
    
    if (validation.shouldContinue) {
      setStep('coach');
    } else {
      // Show feedback, let them re-record
      setStep('validate');
    }
  };
  
  const handleContinueToPayment = async () => {
    // Tier 2: Get coaching
    const coaching = await coach.getCoaching(expertProfile);
    setStep('coach');
  };
  
  const handleCoachComplete = async (responses) => {
    if (responses) {
      await coach.submitWithResponses(responses);
    }
    setStep('payment');
  };
  
  return (
    <div>
      {step === 'record' && (
        <VideoRecorder onComplete={handleRecordComplete} />
      )}
      
      {step === 'validate' && (
        <ValidationFeedback 
          feedback={coach.tier1Result.feedback}
          onRetry={() => setStep('record')}
          onContinue={handleContinueToPayment}
        />
      )}
      
      {step === 'coach' && coach.tier2Result && (
        <QuestionCoachDialog
          analysis={coach.tier2Result.analysis}
          clarifications={coach.tier2Result.clarifications}
          attachmentSuggestions={coach.tier2Result.attachmentSuggestions}
          onComplete={handleCoachComplete}
        />
      )}
      
      {step === 'payment' && (
        <PaymentForm 
          sessionId={coach.sessionId}
          expertId={expertId}
        />
      )}
    </div>
  );
}

Feature 3: Expertise Flywheel (Knowledge Graph) {#feature-3-flywheel}
Business Logic
Purpose: Build persistent knowledge graph per expert
Trigger: Background job after answer submitted
Cost per Q&A: ~$0.12 (entity extraction + graph operations)
Processing time: 30-60 seconds (async, non-blocking)
External Services Setup
Neo4j Aura (Graph Database):
javascript// api/lib/neo4j-client.js
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);

export async function runQuery(query, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export { driver };
Database Schema
Neo4j Node Types:
cypher// Concept node
CREATE (c:Concept {
  id: 'uuid',
  expert_id: 'uuid',
  name: 'pricing strategy',
  type: 'business_concept', // or technology, methodology, tool
  first_mentioned: datetime(),
  last_mentioned: datetime(),
  mention_count: 5,
  embedding_id: 'vector-ref'
})

// Problem node
CREATE (p:Problem {
  id: 'uuid',
  expert_id: 'uuid',
  description: 'low conversion rate',
  category: 'business',
  frequency: 3,
  first_seen: datetime()
})

// Solution node
CREATE (s:Solution {
  id: 'uuid',
  expert_id: 'uuid',
  approach: 'implement value-based pricing',
  conditions: ['B2B', 'SaaS', 'clear value metric'],
  source_answer_id: 'uuid',
  effectiveness: 0.85
})

// ExpertOpinion node
CREATE (o:ExpertOpinion {
  id: 'uuid',
  expert_id: 'uuid',
  about: 'freemium models',
  stance: 'Freemium works best for viral products',
  confidence: 'high',
  context: 'B2C consumer apps',
  created: datetime()
})
Neo4j Relationship Types:
cypher// Relationships
(concept1)-[:RELATES_TO {strength: 0.8, context: 'often mentioned together'}]->(concept2)
(solution)-[:SOLVES {effectiveness: 0.9}]->(problem)
(concept)-[:DEPENDS_ON {reason: 'prerequisite knowledge'}]->(prerequisite)
(opinion1)-[:CONTRADICTS {context_difference: 'B2B vs B2C'}]->(opinion2)
(current_opinion)-[:EVOLVED_FROM {reason: 'learned from experience'}]->(past_opinion)
Xano tracking table:
javascript// graph_processing_jobs (in Xano)
{
  id: uuid,
  question_id: uuid,
  answer_id: uuid,
  expert_id: uuid,
  status: enum['queued', 'processing', 'completed', 'failed'],
  entities_extracted: json,
  processing_time: int,
  error: text,
  created_at: timestamp
}
New Backend Services
1. /api/lib/graph-service.js
javascriptimport { runQuery } from './neo4j-client';
import { generateEmbedding } from './vector-service';
import { v4 as uuid } from 'uuid';

export class ExpertGraphService {
  constructor(expertId) {
    this.expertId = expertId;
  }
  
  async addConcept(concept) {
    // Check for similar existing concept
    const existing = await this.findSimilarConcept(concept.name);
    
    if (existing && this.similarity(existing.name, concept.name) > 0.85) {
      // Update existing
      return await this.updateConcept(existing.id);
    }
    
    // Create new
    const id = uuid();
    await runQuery(`
      CREATE (c:Concept {
        id: $id,
        expert_id: $expert_id,
        name: $name,
        type: $type,
        first_mentioned: datetime(),
        last_mentioned: datetime(),
        mention_count: 1
      })
    `, {
      id,
      expert_id: this.expertId,
      name: concept.name,
      type: concept.type
    });
    
    return id;
  }
  
  async updateConcept(conceptId) {
    await runQuery(`
      MATCH (c:Concept {id: $id})
      SET c.mention_count = c.mention_count + 1,
          c.last_mentioned = datetime()
    `, { id: conceptId });
  }
  
  async addRelationship(fromId, toId, type, properties = {}) {
    await runQuery(`
      MATCH (a {id: $from_id})
      MATCH (b {id: $to_id})
      MERGE (a)-[r:${type}]->(b)
      ON CREATE SET 
        r.created = datetime(),
        r.strength = $strength
      ON MATCH SET 
        r.strength = r.strength * 0.9 + $strength * 0.1,
        r.updated = datetime()
      SET r += $properties
    `, {
      from_id: fromId,
      to_id: toId,
      strength: properties.strength || 0.5,
      properties
    });
  }
  
  async findSimilarConcept(name) {
    // Use embedding similarity
    const embedding = await generateEmbedding(name);
    
    // Query all concepts for this expert
    const concepts = await runQuery(`
      MATCH (c:Concept {expert_id: $expert_id})
      RETURN c
    `, { expert_id: this.expertId });
    
    // Find most similar (in practice, use vector DB)
    // For now, simple string match
    for (const record of concepts) {
      const concept = record.get('c').properties;
      if (this.similarity(concept.name, name) > 0.85) {
        return concept;
      }
    }
    
    return null;
  }
  
  async traverseForQuestion(conceptNames) {
    // Multi-hop graph query
    const result = await runQuery(`
      MATCH (start:Concept)
      WHERE start.expert_id = $expert_id
        AND start.name IN $concept_names
      
      // Direct relationships
      OPTIONAL MATCH (start)-[r1:RELATES_TO]-(related1:Concept)
      
      // Solutions to problems
      OPTIONAL MATCH (related1)-[:SOLVES]->(problem:Problem)
      OPTIONAL MATCH (solution:Solution)-[:SOLVES]->(problem)
      
      // Expert opinions
      OPTIONAL MATCH (opinion:ExpertOpinion)-[:ABOUT]->(related1)
      
      // Two-hop connections
      OPTIONAL MATCH (related1)-[r2:RELATES_TO]-(related2:Concept)
      WHERE r2.strength > 0.3
      
      RETURN start, related1, related2, problem, solution, opinion, r1, r2
      ORDER BY r1.strength DESC, r2.strength DESC
      LIMIT 20
    `, {
      expert_id: this.expertId,
      concept_names: conceptNames
    });
    
    return this.parseGraphResults(result);
  }
  
  parseGraphResults(records) {
    const concepts = new Set();
    const solutions = [];
    const opinions = [];
    const relationships = [];
    
    for (const record of records) {
      // Extract nodes and relationships
      // ... parsing logic ...
    }
    
    return { concepts, solutions, opinions, relationships };
  }
  
  similarity(str1, str2) {
    // Simple Levenshtein-based similarity
    // In production, use proper fuzzy matching
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshtein(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  levenshtein(s1, s2) {
    // Standard Levenshtein implementation
    // ... code ...
  }
}
2. /api/ai/graph/extract-entities.js
javascriptimport { callLLM } from '../lib/llm-service';

export async function extractEntitiesAndRelations(questionText, answerText) {
  const prompt = `Extract structured knowledge from this Q&A:

QUESTION: "${questionText}"

ANSWER: "${answerText}"

Extract:

1. CONCEPTS - Technologies, methodologies, business terms, tools
2. PROBLEMS - Challenges, pain points, issues discussed
3. SOLUTIONS - Approaches, recommendations, strategies proposed
4. OPINIONS - Expert's stance or position on something

Return JSON:
{
  concepts: [
    {
      name: string,
      type: "technology" | "methodology" | "business_concept" | "tool",
      definition: string
    }
  ],
  problems: [
    {
      description: string,
      category: "technical" | "business" | "strategic"
    }
  ],
  solutions: [
    {
      approach: string,
      for_problem: string,
      conditions: string[]
    }
  ],
  opinions: [
    {
      about: string,
      stance: string,
      confidence: "low" | "medium" | "high"
    }
  ],
  relationships: [
    {
      from: string, // concept name
      to: string, // concept name
      type: "relates_to" | "depends_on" | "solves",
      strength: number // 0-1
    }
  ]
}

Rules:
- Only extract explicitly mentioned items
- Use expert's exact terminology
- Identify conditional logic
- Note confidence levels`;

  const result = await callLLM('gpt-4o-mini', prompt, {
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  });
  
  return result;
}
3. /api/ai/graph/process-answer.js
javascriptimport { ExpertGraphService } from '../lib/graph-service';
import { extractEntitiesAndRelations } from './extract-entities';

export default async function handler(req, res) {
  const { questionId, answerId, expertId } = req.body;
  
  // Create job record
  const job = await createGraphJob({
    question_id: questionId,
    answer_id: answerId,
    expert_id: expertId,
    status: 'processing'
  });
  
  try {
    // 1. Get transcripts
    const question = await getQuestion(questionId);
    const answer = await getAnswer(answerId);
    
    const qText = await getTranscript(question.media_uid);
    const aText = await getTranscript(answer.media_uid);
    
    // 2. Extract entities
    const extracted = await extractEntitiesAndRelations(qText, aText);
    
    // 3. Build graph
    const graphService = new ExpertGraphService(expertId);
    
    // Add concepts
    const conceptIds = {};
    for (const concept of extracted.concepts) {
      const id = await graphService.addConcept(concept);
      conceptIds[concept.name] = id;
    }
    
    // Add problems
    const problemIds = {};
    for (const problem of extracted.problems) {
      const id = await graphService.addProblem(problem);
      problemIds[problem.description] = id;
    }
    
    // Add solutions
    for (const solution of extracted.solutions) {
      const solutionId = await graphService.addSolution(solution);
      
      // Link to problem
      if (problemIds[solution.for_problem]) {
        await graphService.addRelationship(
          solutionId,
          problemIds[solution.for_problem],
          'SOLVES',
          { effectiveness: 0.8 }
        );
      }
    }
    
    // Add opinions
    for (const opinion of extracted.opinions) {
      const opinionId = await graphService.addOpinion(opinion);
      
      // Link to concept
      if (conceptIds[opinion.about]) {
        await graphService.addRelationship(
          opinionId,
          conceptIds[opinion.about],
          'ABOUT'
        );
      }
    }
    
    // Add relationships between concepts
    for (const rel of extracted.relationships) {
      if (conceptIds[rel.from] && conceptIds[rel.to]) {
        await graphService.addRelationship(
          conceptIds[rel.from],
          conceptIds[rel.to],
          rel.type.toUpperCase(),
          { strength: rel.strength }
        );
      }
    }
    
    // 4. Update job
    await updateGraphJob(job.id, {
      status: 'completed',
      entities_extracted: extracted,
      processing_time: Date.now() - job.created_at
    });
    
    return res.json({ success: true, extracted });
    
  } catch (error) {
    await updateGraphJob(job.id, {
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}
4. /api/ai/graph/query-knowledge.js
javascriptexport default async function handler(req, res) {
  const { expertId } = req.user;
  const { conceptNames, queryType } = req.body;
  
  const graphService = new ExpertGraphService(expertId);
  
  switch (queryType) {
    case 'related_knowledge':
      const knowledge = await graphService.traverseForQuestion(conceptNames);
      return res.json(knowledge);
      
    case 'stats':
      const stats = await getGraphStats(expertId);
      return res.json(stats);
      
    case 'contradictions':
      const contradictions = await findContradictions(expertId);
      return res.json(contradictions);
      
    default:
      return res.status(400).json({ error: 'Invalid query type' });
  }
}

async function getGraphStats(expertId) {
  const result = await runQuery(`
    MATCH (n {expert_id: $expert_id})
    WITH labels(n)[0] as label, count(*) as count
    RETURN label, count
  `, { expert_id: expertId });
  
  const stats = {};
  for (const record of result) {
    stats[record.get('label')] = record.get('count').toNumber();
  }
  
  // Get relationship counts
  const relResult = await runQuery(`
    MATCH (a {expert_id: $expert_id})-[r]->(b)
    RETURN type(r) as rel_type, count(*) as count
  `, { expert_id: expertId });
  
  stats.relationships = {};
  for (const record of relResult) {
    stats.relationships[record.get('rel_type')] = record.get('count').toNumber();
  }
  
  return stats;
}
Enhanced Co-pilot Integration
Modify /api/ai/copilot/analyze-question.js to use graph:
javascript// After getting similar answers from vector search
const similarAnswers = await searchVectorDB(expertId, embedding);

// NEW: Also query knowledge graph
const graphService = new ExpertGraphService(expertId);

// Extract concepts from current question
const questionConcepts = await extractQuestionConcepts(transcript);

// Traverse graph for related knowledge
const graphKnowledge = await graphService.traverseForQuestion(
  questionConcepts.map(c => c.name)
);

// Build enhanced context
const context = {
  vectorResults: similarAnswers,
  graphKnowledge: {
    relatedConcepts: graphKnowledge.concepts,
    relevantSolutions: graphKnowledge.solutions,
    expertStances: graphKnowledge.opinions
  }
};

// Generate analysis with both sources
const analysis = await generateAnalysisWithGraph(transcript, context);
Frontend Components
1. src/pages/ExpertKnowledgeGraphPage.jsx
jsximport { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';

export function ExpertKnowledgeGraphPage() {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  
  useEffect(() => {
    loadGraphData();
  }, []);
  
  const loadGraphData = async () => {
    const response = await api.get('/ai/graph/query-knowledge', {
      params: { queryType: 'stats' }
    });
    setStats(response.data);
    
    // Load graph visualization data
    const vizData = await api.get('/ai/graph/visualization');
    setGraphData(vizData.data);
  };
  
  return (
    <div className="knowledge-graph-page p-6">
      <h1 className="text-2xl font-bold mb-6">Your Knowledge Graph</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Concepts"
          value={stats?.Concept || 0}
          icon="💡"
        />
        <StatCard 
          title="Solutions"
          value={stats?.Solution || 0}
          icon="✨"
        />
        <StatCard 
          title="Opinions"
          value={stats?.ExpertOpinion || 0}
          icon="💭"
        />
        <StatCard 
          title="Connections"
          value={stats?.relationships?.RELATES_TO || 0}
          icon="🔗"
        />
      </div>
      
      {/* Graph visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Expertise Map</h2>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={node => {
            switch(node.type) {
              case 'Concept': return '#3B82F6';
              case 'Solution': return '#10B981';
              case 'Problem': return '#EF4444';
              default: return '#6B7280';
            }
          }}
          linkColor={() => '#E5E7EB'}
          linkWidth={link => link.strength * 3}
          width={800}
          height={600}
        />
      </div>
    </div>
  );
}

Shared Infrastructure {#shared-infrastructure}
1. LLM Service (/api/lib/llm-service.js)
javascriptimport Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function callLLM(model, prompt, options = {}) {
  const {
    temperature = 0.7,
    max_tokens = 1024,
    response_format = null
  } = options;
  
  // If using JSON format, add to prompt
  const systemPrompt = response_format?.type === 'json_object'
    ? 'You must respond with valid JSON only. No markdown, no explanation.'
    : null;
  
  const message = await anthropic.messages.create({
    model: model === 'gpt-4o-mini' ? 'claude-3-5-sonnet-20241022' : model,
    max_tokens,
    temperature,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const content = message.content[0].text;
  
  // Parse JSON if requested
  if (response_format?.type === 'json_object') {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON response:', content);
      throw new Error('Invalid JSON response from LLM');
    }
  }
  
  return content;
}

// Cost tracking
export async function trackLLMCost(model, tokens, feature) {
  const costs = {
    'gpt-4o-mini': 0.00038 / 1000, // per token
    'claude-3-5-sonnet-20241022': 0.003 / 1000
  };
  
  const cost = (costs[model] || 0) * tokens;
  
  await logCost({
    feature,
    model,
    tokens,
    cost,
    timestamp: new Date()
  });
}
2. Vector Service (/api/lib/vector-service.js)
javascriptimport { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index('quickchat-experts');

export async function generateEmbedding(text) {
  // Use OpenAI embeddings
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}

export async function storeInVectorDB(expertId, embedding, metadata) {
  const id = `${expertId}-${Date.now()}`;
  
  await index.upsert([{
    id,
    values: embedding,
    metadata: {
      expert_id: expertId,
      ...metadata
    }
  }]);
  
  return id;
}

export async function searchVectorDB(expertId, embedding, options = {}) {
  const { limit = 5, threshold = 0.7 } = options;
  
  const results = await index.query({
    vector: embedding,
    filter: {
      expert_id: { $eq: expertId }
    },
    topK: limit,
    includeMetadata: true
  });
  
  // Filter by threshold
  return results.matches
    .filter(m => m.score >= threshold)
    .map(m => ({
      id: m.id,
      score: m.score,
      ...m.metadata
    }));
}
3. Transcript Service (/api/lib/transcript-service.js)
javascriptimport { getCloudflareClient } from './cloudflare-client';

export async function getTranscript(mediaUid, maxRetries = 5) {
  const cf = getCloudflareClient();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const video = await cf.stream.videos.get(mediaUid);
      
      if (video.status.state === 'ready' && video.meta?.transcript) {
        return video.meta.transcript;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
  
  throw new Error('Transcript not available after retries');
}

export async function getOrWaitForTranscript(mediaUid) {
  // Try immediate fetch
  try {
    return await getTranscript(mediaUid, 1);
  } catch {
    // Queue for later processing
    return null;
  }
}
4. Environment Variables
bash# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
NEO4J_URI=neo4j+s://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...
XANO_API_URL=https://...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...

Development Sequence {#development-sequence}
Phase 1: Foundation (Weeks 1-2)
Day 1-2: Infrastructure
- Set up Anthropic API client
- Set up Pinecone/vector DB
- Create shared LLM service
- Create transcript service

Day 3-5: Feature 1 - Co-pilot Backend
- Create Xano tables
- Build /api/ai/copilot/analyze-question.js
- Build /api/ai/copilot/process-completed-answer.js
- Test with sample Q&As

Day 6-8: Feature 1 - Co-pilot Frontend
- Build CopilotPanel component
- Build useCopilot hook
- Integrate into ExpertDashboard
- Manual testing with 5 experts

Day 9-10: Feature 2 - Coach Setup
- Create Xano tables
- Build rate limiting system
- Build Tier 1 validation endpoint
Phase 2: Coach & Co-pilot Polish (Weeks 3-4)
Day 11-13: Feature 2 - Coach Implementation
- Build Tier 2 analysis endpoint
- Build Tier 3 enhancement
- Create QuestionCoachDialog component
- Integrate into QuestionComposer

Day 14-16: Testing & Iteration
- A/B test Co-pilot with 50 experts
- Test Coach with 100 questions
- Measure conversion rates
- Gather feedback

Day 17-20: Polish & Optimization
- Improve prompts based on feedback
- Optimize costs
- Add error handling
- Performance tuning
Phase 3: Knowledge Graph (Weeks 5-8)
Week 5:
- Set up Neo4j Aura
- Build graph-service.js
- Create entity extraction endpoint
- Test extraction accuracy on 50 Q&As

Week 6:
- Build graph storage pipeline
- Create background job processor
- Integrate with Co-pilot (GraphRAG)
- Test multi-hop queries

Week 7:
- Build contradiction detection
- Create expert review interface
- Build knowledge graph visualization
- Test with 10 experts (100+ Q&As each)

Week 8:
- Topic modeling & trends
- B2B aggregation layer (if validated)
- Performance optimization
- Full system testing

Testing Strategy {#testing-strategy}
Unit Tests
javascript// tests/ai/copilot.test.js
describe('Co-pilot Analysis', () => {
  it('should generate analysis for valid question', async () => {
    const result = await analyzequestion(
      'How should I price my SaaS product?',
      {}
    );
    
    expect(result.analysis.summary).toBeDefined();
    expect(result.outline.length).toBeGreaterThan(0);
  });
  
  it('should find similar past answers', async () => {
    const embedding = await generateEmbedding('test question');
    const results = await searchVectorDB('expert-123', embedding);
    
    expect(Array.isArray(results)).toBe(true);
  });
});
Integration Tests
javascript// tests/integration/question-flow.test.js
describe('Question Submission Flow', () => {
  it('should process question through all AI features', async () => {
    // 1. Validate with Coach
    const validation = await request(app)
      .post('/api/ai/coach/quick-validate')
      .send({ transcript: 'test question' });
    
    expect(validation.body.sessionId).toBeDefined();
    
    // 2. Get coaching
    const coaching = await request(app)
      .post('/api/ai/coach/analyze-and-guide')
      .send({ sessionId: validation.body.sessionId });
    
    expect(coaching.body.clarifications).toBeDefined();
    
    // 3. Submit question (creates record)
    // 4. Expert answers
    // 5. Co-pilot processes
    // 6. Graph updates
    
    // Verify all steps completed
  });
});
Manual Testing Checklist
markdown## Feature 1: Co-pilot
- [ ] New question triggers analysis
- [ ] Analysis completes in <10s
- [ ] Suggestions are relevant
- [ ] Citations link to actual answers
- [ ] Expert can use/dismiss suggestions
- [ ] Metrics track usage
- [ ] Completed answers get processed
- [ ] Vector search returns relevant results

## Feature 2: Coach
- [ ] Tier 1 validation shows feedback
- [ ] Rate limiting works (5/day limit)
- [ ] Tier 2 coaching provides value
- [ ] Clarifications are specific
- [ ] Attachment suggestions make sense
- [ ] Can skip all coaching
- [ ] Tier 3 enhancement runs post-payment
- [ ] Enhanced questions visible to expert

## Feature 3: Graph
- [ ] Entities extracted correctly (>80% accuracy)
- [ ] Graph stores nodes and relationships
- [ ] Multi-hop queries work
- [ ] Co-pilot uses graph knowledge
- [ ] Knowledge graph page loads
- [ ] Stats are accurate
- [ ] Visualization renders
- [ ] Background jobs complete

Key Implementation Notes

Start Simple: Build Tier 1 validation first (Feature 2), then Co-pilot (Feature 1), then Graph (Feature 3)
Cost Monitoring: Track every LLM call. Set up alerts if daily costs exceed thresholds
Error Handling: All AI features should gracefully degrade. Platform must work even if AI fails
Async Processing: Features 1 & 3 should be async. Don't block user flow
Prompt Engineering: Expect to iterate on prompts 5-10 times based on real results
Testing: Test with real transcripts from production. LLMs behave differently with real data
Metrics: Track everything from day 1. You need data to optimize
Feedback Loops: Build expert feedback mechanisms into Co-pilot from start


Quick Start Commands
bash# Install dependencies
npm install @anthropic-ai/sdk @pinecone-database/pinecone neo4j-driver

# Set up environment
cp .env.example .env.local
# Fill in API keys

# Run migrations (create Xano tables)
# Use Xano UI to create tables from schema definitions above

# Start development
npm run dev

# Test Co-pilot endpoint
curl -X POST http://localhost:3000/api/ai/copilot/analyze-question \
  -H "Content-Type: application/json" \
  -d '{"questionId": "test-123", "expertId": "expert-456"}'

This document contains all technical specifications needed to implement the three AI features. Use it alongside the existing codebase to build each feature step-by-step.