module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query, history, language } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isFR = language === 'FR';
  if (!apiKey) return res.status(200).json({ answer: isFR ? 'Clé API manquante côté serveur.' : 'API key missing on the server.' });
  const systemPrompt = isFR
    ? 'Tu es LYA Copilot, l\'assistant de la plateforme LinkYourArt (LYA), un standard de certification créative. Réponds de façon claire et concise aux questions sur le Score LYA, la certification, le Registre, le mécénat et la plateforme. Ne mentionne jamais de marché secondaire, d\'unité LYA à prix fixe, ou d\'instrument financier — LYA certifie des projets créatifs, ce n\'est pas une plateforme d\'investissement.'
    : 'You are LYA Copilot, the assistant for the LinkYourArt (LYA) platform, a creative certification standard. Answer clearly and concisely about the LYA Score, certification, the Registry, patronage, and the platform. Never mention a secondary market, a fixed-price LYA unit, or a financial instrument — LYA certifies creative projects, it is not an investment platform.';
  const messages = [
    ...(Array.isArray(history) ? history.map(h => ({ role: h.role === 'USER' ? 'user' : 'assistant', content: h.content })) : []),
    { role: 'user', content: query || '' }
  ];
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: systemPrompt, messages })
    });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ answer: text || 'No response received.' });
  } catch (e) { return res.status(200).json({ answer: e.message }); }
};
