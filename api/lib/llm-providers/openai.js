import OpenAI from 'openai';

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return client;
}

export async function callOpenAI(prompt, options = {}) {
  const openai = getClient();

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];

  // Add system message for JSON if needed
  if (options.requireJSON) {
    messages.unshift({
      role: 'system',
      content: 'You must respond with valid JSON only. No markdown, no explanation.'
    });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cheapest, good quality
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024,
    ...(options.requireJSON && { response_format: { type: 'json_object' } })
  });

  const content = completion.choices[0].message.content;

  // Parse JSON if required
  if (options.requireJSON && typeof content === 'string') {
    try {
      return {
        content: JSON.parse(content),
        tokens: completion.usage.total_tokens
      };
    } catch (e) {
      console.error('Failed to parse OpenAI JSON:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  return {
    content,
    tokens: completion.usage.total_tokens
  };
}