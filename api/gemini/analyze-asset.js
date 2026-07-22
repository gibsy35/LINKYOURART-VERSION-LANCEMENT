module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { assetName, description, score, language } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json({ analysis: 'Analysis currently unavailable.' });

  const isFR = language === 'FR';
  const systemPrompt = isFR
    ? `Tu es un analyste de certification créative pour LinkYourArt (LYA), une plateforme de certification de projets créatifs (musique, film, mode, gaming, architecture, séries TV, art). Chaque projet reçoit un LYA Score sur 1000 reflétant sa qualité et sa maturité. Tu rédiges des analyses courtes (3-4 phrases), factuelles et professionnelles sur la qualité et le potentiel d'un projet certifié. Ne mentionne jamais de prix, d'unité LYA, de marché secondaire, de rendement financier ou d'investissement -- LYA certifie des projets créatifs, ce n'est pas un instrument financier. Réponds uniquement avec le texte de l'analyse, sans préambule ni markdown.`
    : `You are a creative certification analyst for LinkYourArt (LYA), a certification platform for creative projects (music, film, fashion, gaming, architecture, TV series, art). Each project receives a LYA Score out of 1000 reflecting its quality and maturity. You write short (3-4 sentence), factual, professional analyses of a certified project's quality and potential. Never mention price, LYA units, secondary markets, financial returns, or investment -- LYA certifies creative projects, it is not a financial instrument. Respond only with the analysis text, no preamble or markdown.`;

  const userPrompt = isFR
    ? `Projet : "${assetName || 'Projet sans titre'}"\nDescription : ${description || 'Aucune description fournie.'}\nScore LYA actuel : ${score || 750}/1000\n\nRédige une analyse courte de la qualité et du potentiel de certification de ce projet.`
    : `Project: "${assetName || 'Untitled Project'}"\nDescription: ${description || 'No description provided.'}\nCurrent LYA Score: ${score || 750}/1000\n\nWrite a short analysis of this project's certification quality and potential.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    return res.status(200).json({ analysis: text || 'Analysis currently unavailable.' });
  } catch (e) {
    console.error('[ANALYZE-ASSET] Error:', e.message);
    return res.status(200).json({ analysis: 'Analysis currently unavailable.' });
  }
};
