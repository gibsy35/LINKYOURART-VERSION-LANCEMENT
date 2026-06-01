import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query, history = [], language } = req.body;
  const isFr = language === 'FR';
  const messages = [
    ...history.map((h: any) => ({ role: h.role === 'USER' ? 'user' : 'assistant', content: h.content })),
    { role: 'user', content: query }
  ];
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are COPILOT, the LYA Protocol AI assistant. You help users understand creative asset valuation, LYA Scores, contracts, investments and the platform. Be concise, professional and helpful. Always respond in ${isFr ? 'French' : 'English'}.`,
        messages
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || (isFr ? 'Je rencontre une difficulté technique. Veuillez réessayer.' : 'I am experiencing a technical issue. Please try again.');
    res.json({ answer: text });
  } catch {
    res.json({ answer: isFr
      ? 'Je rencontre une difficulté de connexion au réseau LYA. Veuillez patienter quelques instants.'
      : 'I am having trouble connecting to the LYA Intelligence Grid. Please try again in a few moments.'
    });
  }
}
