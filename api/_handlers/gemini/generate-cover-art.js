const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { description, styles } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ images: [] });

  const styleList = Array.isArray(styles) && styles.length > 0 ? styles : [
    'Minimalist, professional, high-end digital art',
    'Cyberpunk, neon, technical blueprint style',
    'Abstract, fluid, modern corporate aesthetic'
  ];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const images = [];
    for (const style of styleList) {
      try {
        const prompt = `Generate a square, high-quality, professional digital art piece for a creative project described as: ${description || 'a creative project'}. Style: ${style}. High resolution, clean composition.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: prompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            images.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      } catch (e) {
        console.error(`[GENERATE-COVER-ART] Failed for style "${style}":`, e.message);
      }
    }
    return res.status(200).json({ images });
  } catch (e) {
    console.error('[GENERATE-COVER-ART] Error:', e.message);
    return res.status(200).json({ images: [] });
  }
};
