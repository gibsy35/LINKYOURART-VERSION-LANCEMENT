const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt });
      const translated = (response.text || '').trim();
      return res.status(200).json({ translatedDescription: translated || description, source: 'gemini' });
    } catch (e) {
      console.error('[ANALYZE-ASSET][translate] Error:', e.message);
      return res.status(200).json({ translatedDescription: description, source: 'passthrough' });
    }
  }

  // ── Synopsis generation mode (used by the project quick-create form) ──────
  if (req.body?.action === 'synopsis') {
    const { name, category, assetType, language: synLang } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Missing project name' });
    const isFRsyn = synLang === 'FR';
    if (!apiKey) return res.status(200).json({ synopsis: isFRsyn ? `${name} est un projet ${category || 'créatif'} en cours de certification LYA.` : `${name} is a ${category || 'creative'} project undergoing LYA certification.` });

    const prompt = isFRsyn
      ? `Rédige une courte synopsis (2 phrases maximum) pour un projet créatif nommé "${name}", dans la catégorie "${category || 'Créatif'}"${assetType ? `, type: "${assetType}"` : ''}. Ton professionnel, factuel, orienté certification créative -- jamais de langage financier ou d'investissement. Réponds uniquement avec le texte du synopsis, sans préambule.`
      : `Write a short synopsis (2 sentences max) for a creative project named "${name}", in the "${category || 'Creative'}" category${assetType ? `, type: "${assetType}"` : ''}. Professional, factual tone, focused on creative certification -- never financial or investment language. Respond only with the synopsis text, no preamble.`;

    try {
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt });
      const synopsis = (response.text || '').trim();
      return res.status(200).json({ synopsis: synopsis || `${name} is a ${category || 'creative'} project undergoing LYA certification.` });
    } catch (e) {
      console.error('[ANALYZE-ASSET][synopsis] Error:', e.message);
      return res.status(200).json({ synopsis: `${name} is a ${category || 'creative'} project undergoing LYA certification.` });
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: { systemInstruction: systemPrompt },
    });
    const text = (response.text || '').trim();
    return res.status(200).json({ analysis: text || 'Analysis currently unavailable.' });
  } catch (e) {
    console.error('[ANALYZE-ASSET] Error:', e.message);
    return res.status(200).json({ analysis: 'Analysis currently unavailable.' });
  }
};
