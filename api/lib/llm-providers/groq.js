import Groq from 'groq-sdk';

let client = null;

function getClient() {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return client;
}

export async function callGroq(prompt, options = {}) {
  const groq = getClient();

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];

  if (options.requireJSON) {
    messages.unshift({
      role: 'system',
      content: 'You must respond with valid JSON only. No markdown, no explanation.'
    });
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile', // Fast and good quality
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024,
    ...(options.requireJSON && { response_format: { type: 'json_object' } })
  });

  let content = completion.choices[0].message.content;

  if (options.requireJSON && typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Groq JSON:', content);
      throw new Error('Invalid JSON response from Groq');
    }
  }

  return {
    content,
    tokens: completion.usage.total_tokens
  };
}