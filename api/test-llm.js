import { callLLM, estimateCost } from './lib/llm-service.js';

export default async function handler(req, res) {
  try {
    const result = await callLLM(
      'List 3 benefits of AI coaching for questions. Respond in JSON format: {"benefits": ["benefit1", "benefit2", "benefit3"]}',
      {
        temperature: 0.7,
        max_tokens: 200,
        requireJSON: true
      }
    );

    return res.json({
      success: true,
      provider: process.env.LLM_PROVIDER || 'gemini',
      result,
      note: 'LLM is working correctly!'
    });

  } catch (error) {
    console.error('LLM test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}