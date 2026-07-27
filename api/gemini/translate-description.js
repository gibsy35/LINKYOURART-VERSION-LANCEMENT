const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, targetLang = 'fr', sourceLang = 'en' } = req.body || {};
  if (!description) return res.status(400).json({ error: 'Missing description' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  // If no API key, use simple fallback
  if (!ANTHROPIC_API_KEY) {
    return res.status(200).json({
      translatedDescription: description,
      source: 'passthrough'
    });
  }

  try {
    const prompt = targetLang === 'fr'
      ? `Translate the following creative project description from English to French. Keep the tone professional and creative. Return ONLY the translated text, nothing else:\n\n${description}`
      : `Translate the following creative project description from French to English. Keep the tone professional and creative. Return ONLY the translated text, nothing else:\n\n${description}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return res.status(200).json({ translatedDescription: description, source: 'passthrough' });
    }

    const data = await response.json();
    const translated = data.content?.[0]?.text?.trim() || description;
    return res.status(200).json({ translatedDescription: translated, source: 'claude' });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(200).json({ translatedDescription: description, source: 'passthrough' });
  }
}
