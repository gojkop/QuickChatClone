// Simple test endpoint - no dependencies first
export default async function handler(req, res) {
  try {
    // Test 1: Check if endpoint is reached
    console.log('[test-llm] Endpoint reached');
    
    // Test 2: Check environment variables
    const provider = process.env.LLM_PROVIDER || 'not-set';
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
    
    console.log('[test-llm] Provider:', provider);
    console.log('[test-llm] Has API Key:', hasApiKey);
    
    // Return basic info first (no LLM call yet)
    return res.status(200).json({
      success: true,
      message: 'Endpoint is working!',
      environment: {
        provider: provider,
        hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
        nodeVersion: process.version
      },
      note: 'Basic endpoint test - LLM not called yet'
    });
    
  } catch (error) {
    console.error('[test-llm] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}