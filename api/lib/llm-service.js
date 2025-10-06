// Multi-provider LLM service
// Set provider via environment variable: LLM_PROVIDER=gemini

const PROVIDER = process.env.LLM_PROVIDER || 'gemini'; // Default to free option

// ✅ ONLY import the provider you're using
import { callGemini } from './llm-providers/gemini.js';

// ❌ REMOVED - these were causing the error:
// import { callOpenAI } from './llm-providers/openai.js';
// import { callAnthropic } from './llm-providers/anthropic.js';
// import { callGroq } from './llm-providers/groq.js';

const providers = {
  gemini: callGemini
  // openai: callOpenAI,
  // anthropic: callAnthropic,
  // groq: callGroq
};

export async function callLLM(prompt, options = {}) {
  const {
    temperature = 0.7,
    max_tokens = 1024,
    requireJSON = false
  } = options;

  // Get provider function
  const providerFn = providers[PROVIDER];
  
  if (!providerFn) {
    throw new Error(`Unknown LLM provider: ${PROVIDER}. Only 'gemini' is available.`);
  }

  try {
    console.log(`[LLM] Using provider: ${PROVIDER}`);
    
    const result = await providerFn(prompt, {
      temperature,
      max_tokens,
      requireJSON
    });

    // Log for debugging
    console.log(`[LLM] Success - ${result.tokens || 'unknown'} tokens`);

    return result.content;

  } catch (error) {
    console.error(`[LLM] ${PROVIDER} failed:`, error.message);
    throw error;
  }
}

// Cost estimation (approximate)
export function estimateCost(provider, inputTokens, outputTokens) {
  const costs = {
    gemini: { input: 0, output: 0 } // Free tier
  };

  const rate = costs[provider] || costs.gemini;
  return (inputTokens * rate.input) + (outputTokens * rate.output);
}