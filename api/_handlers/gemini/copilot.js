const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query, history, language, action, prompt } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const isFR = language === 'FR';
  if (!apiKey) return res.status(200).json({ answer: isFR ? 'Clé API manquante côté serveur.' : 'API key missing on the server.', svg: null });

  const ai = new GoogleGenAI({ apiKey });

  if (action === 'generate-visual') {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt || '',
        config: { thinkingConfig: { thinkingLevel: 'minimal' } },
      });
      const text = response.text || '';
      const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
      return res.status(200).json({ svg: svgMatch ? svgMatch[0] : null });
    } catch (e) {
      return res.status(200).json({ svg: null, error: e.message });
    }
  }

  const systemPrompt = isFR
    ? 'Tu es LYA Copilot, l\'assistant de la plateforme LinkYourArt (LYA), un standard de certification créative. Réponds de façon claire et concise aux questions sur le Score LYA, la certification, le Registre, le mécénat et la plateforme. Ne mentionne jamais de marché secondaire, d\'unité LYA à prix fixe, ou d\'instrument financier — LYA certifie des projets créatifs, ce n\'est pas une plateforme d\'investissement.'
    : 'You are LYA Copilot, the assistant for the LinkYourArt (LYA) platform, a creative certification standard. Answer clearly and concisely about the LYA Score, certification, the Registry, patronage, and the platform. Never mention a secondary market, a fixed-price LYA unit, or a financial instrument — LYA certifies creative projects, it is not an investment platform.';

  const contents = [
    ...(Array.isArray(history) ? history.map(h => ({ role: h.role === 'USER' ? 'user' : 'model', parts: [{ text: h.content }] })) : []),
    { role: 'user', parts: [{ text: query || '' }] },
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: { systemInstruction: systemPrompt, thinkingConfig: { thinkingLevel: 'minimal' } },
    });
    return res.status(200).json({ answer: response.text || 'No response received.' });
  } catch (e) {
    return res.status(200).json({ answer: e.message });
  }
};
