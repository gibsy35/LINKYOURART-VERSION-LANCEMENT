import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const lang = (req.query?.lang as string) || 'EN';
  const isFr = lang === 'FR';
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
        max_tokens: 800,
        system: `You generate realistic creative industry news for LYA Protocol platform. Respond ONLY with valid JSON array, no markdown. Language: ${isFr ? 'French' : 'English'}.`,
        messages: [{
          role: 'user',
          content: `Generate 4 recent creative industry news items in ${isFr ? 'French' : 'English'}. Return ONLY JSON array: [{"id":"1","title":"...","summary":"...","category":"FILM|MUSIC|ART|GAMING|FASHION|ARCHITECTURE","source":"...","publishedAt":"${new Date().toISOString()}","impact":{"score":75,"trend":"UP"},"imageUrl":"https://picsum.photos/seed/news1/800/500"}]`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch {
    res.json(null);
  }
}
