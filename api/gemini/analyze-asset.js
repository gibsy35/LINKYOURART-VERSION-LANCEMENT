module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  // ── Translation mode (merged from the former /api/gemini/translate-description
  // route to stay within the Hobby plan's 12 serverless function limit) ──────
  if (req.body?.action === 'translate') {
    const { description, targetLang = 'fr' } = req.body || {};
    if (!description) return res.status(400).json({ error: 'Missing description' });
    if (!apiKey) return res.status(200).json({ translatedDescription: description, source: 'passthrough' });

    try {
      const prompt = targetLang === 'fr'
        ? `Translate the following creative project description from English to French. Keep the tone professional and creative. Return ONLY the translated text, nothing else:\n\n${description}`
        : `Translate the following creative project description from French to English. Keep the tone professional and creative. Return ONLY the translated text, nothing else:\n\n${description}`;

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('[ANALYZE-ASSET][translate] Claude API error:', err);
        return res.status(200).json({ translatedDescription: description, source: 'passthrough' });
      }
      const data = await r.json();
      const translated = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ translatedDescription: translated || description, source: 'claude' });
    } catch (e) {
      console.error('[ANALYZE-ASSET][translate] Error:', e.message);
      return res.status(200).json({ translatedDescription: description, source: 'passthrough' });
    }
  }

  const { assetName, description, score, language } = req.body || {};
  const isFR0 = language === 'FR';
  if (!apiKey) return res.status(200).json({ analysis: isFR0 ? 'Analyse indisponible pour le moment.' : 'Analysis currently unavailable.' });

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
