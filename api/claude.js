// Vercel serverless function for Claude API proxy

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ success: false, error: 'Claude API key not set in environment' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ success: true, data: data.content[0].text });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, error: errorText });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
