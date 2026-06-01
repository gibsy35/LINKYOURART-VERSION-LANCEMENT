import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { assetName, description, language } = req.body;
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are a senior LYA Protocol investment analyst. Respond ONLY with valid JSON, no markdown. Language: ${isFr ? 'French' : 'English'}.`,
        messages: [{
          role: 'user',
          content: `Write an investment thesis for: "${assetName}" — ${description}. Return ONLY JSON: {"bullCase":"...","bearCase":"...","milestones":["...","...","..."]}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch {
    res.json({
      bullCase: isFr ? 'Fondamentaux créatifs solides portés par une croissance organique et une distribution multi-plateforme.' : 'Strong creative fundamentals driven by organic growth and multi-platform distribution.',
      bearCase: isFr ? 'Ajustements possibles liés aux délais de production et à la liquidité secondaire.' : 'Possible adjustments linked to production timelines and secondary liquidity.',
      milestones: isFr
        ? ['Audit créatif initial', 'Signature contrat distribution', 'Première distribution royalties']
        : ['Initial creative audit', 'Distribution contract signature', 'First royalty distribution']
    });
  }
}
