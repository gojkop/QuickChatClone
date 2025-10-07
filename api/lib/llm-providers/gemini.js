import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

function getClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return genAI;
}

export async function callGemini(prompt, options = {}) {
  const client = getClient();
  
  // Use gemini-2.5-pro (works on free tier)
  const model = client.getGenerativeModel({ 
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.max_tokens || 2048,  // ✅ Increased default
    }
  });

  // Add JSON instruction if needed
  const fullPrompt = options.requireJSON
    ? `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no explanation, no extra text - just the raw JSON object starting with { and ending with }.`
    : prompt;

  console.log('[Gemini] Calling API with maxOutputTokens:', options.max_tokens || 1024);
  
  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  let text = response.text();

  console.log('[Gemini] Response received, length:', text.length);
  console.log('[Gemini] Token usage:', response.usageMetadata);
  
  // Check if response is empty or too short
  if (!text || text.length < 10) {
    console.error('[Gemini] Response too short or empty!');
    throw new Error('Gemini returned an empty or very short response');
  }

  // Parse JSON if required
  if (options.requireJSON) {
    // Log the raw response for debugging
    console.log('[Gemini] Raw response (first 500 chars):', text.substring(0, 500));
    console.log('[Gemini] Raw response (last 100 chars):', text.substring(Math.max(0, text.length - 100)));
    
    // Clean up markdown and extra text
    text = text.trim();
    
    // Remove markdown code blocks
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to extract JSON if there's extra text
    // Look for content between first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    try {
      const parsed = JSON.parse(text);
      text = parsed; // Return parsed object
    } catch (e) {
      console.error('[Gemini] Failed to parse JSON:', text);
      console.error('[Gemini] Parse error:', e.message);
      throw new Error('Invalid JSON response from Gemini: ' + text.substring(0, 100));
    }
  }

  return {
    content: text,
    tokens: response.usageMetadata?.totalTokenCount || null
  };
}