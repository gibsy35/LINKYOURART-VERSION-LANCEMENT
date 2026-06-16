import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { description, language } = req.body;
  const isFr = language === 'FR';
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a creative project milestone advisor for the LYA Protocol platform. Respond ONLY with valid JSON array, no markdown, no explanation. Language: ${isFr ? 'French' : 'English'}.`,
        messages: [{
          role: 'user',
          content: `Generate 3 key milestones for this creative project: "${description}". Return ONLY a JSON array like: [{"label":"milestone name","date":"2026-10","priceImpact":15},...]`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const milestones = JSON.parse(clean);
    res.json(milestones);
  } catch {
    res.json([
      { label: isFr ? 'Phase 1 : Enregistrement IP' : 'Phase 1: IP Registration', date: '2026-10', priceImpact: 10 },
      { label: isFr ? 'Phase 2 : Distribution internationale' : 'Phase 2: Global Distribution', date: '2027-02', priceImpact: 20 },
      { label: isFr ? 'Phase 3 : Activation royalties' : 'Phase 3: Royalties Activation', date: '2027-06', priceImpact: 15 }
    ]);
  }
}
