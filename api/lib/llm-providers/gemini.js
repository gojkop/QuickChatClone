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
  
  // Use Gemini 1.5 Flash (free tier, fast)
  const model = client.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.max_tokens || 1024,
    }
  });

  // Add JSON instruction if needed
  const fullPrompt = options.requireJSON
    ? `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanation, just the JSON object.`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  let text = response.text();

  // Parse JSON if required
  if (options.requireJSON) {
    // Clean up markdown if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(text);
      text = parsed; // Return parsed object
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', text);
      throw new Error('Invalid JSON response from Gemini');
    }
  }

  return {
    content: text,
    tokens: response.usageMetadata?.totalTokenCount || null
  };
}