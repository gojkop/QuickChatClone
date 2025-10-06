import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  return client;
}

export async function callAnthropic(prompt, options = {}) {
  const anthropic = getClient();

  const systemPrompt = options.requireJSON
    ? 'You must respond with valid JSON only. No markdown, no explanation, just the JSON object.'
    : null;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: options.max_tokens || 1024,
    temperature: options.temperature || 0.7,
    ...(systemPrompt && { system: systemPrompt }),
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  let content = message.content[0].text;

  // Parse JSON if required
  if (options.requireJSON) {
    try {
      content = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Anthropic JSON:', content);
      throw new Error('Invalid JSON response from Anthropic');
    }
  }

  return {
    content,
    tokens: message.usage.input_tokens + message.usage.output_tokens
  };
}