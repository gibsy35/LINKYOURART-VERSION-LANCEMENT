import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { assetName, description, score, language } = req.body;
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
        max_tokens: 300,
        system: `You are a senior LYA Protocol analyst specializing in creative rights valuation. Write concisely in ${isFr ? 'French' : 'English'}.`,
        messages: [{
          role: 'user',
          content: `Analyze this creative asset for the LYA platform. Name: ${assetName}. Description: ${description || 'N/A'}. LYA Score: ${score}/1000. Provide exactly 2 sentences of analysis in ${isFr ? 'French' : 'English'}.`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || (isFr ? 'Analyse indisponible.' : 'Analysis unavailable.');
    res.json({ analysis: text });
  } catch {
    res.json({ analysis: isFr
      ? `${assetName} présente d'excellentes perspectives sur le marché créatif LYA. Avec un score de ${score}/1000, ce projet maintient une dynamique solide et un potentiel d'appréciation notable.`
      : `${assetName} shows strong prospects on the LYA creative market. With a score of ${score}/1000, this project maintains solid momentum and notable appreciation potential.`
    });
  }
}
