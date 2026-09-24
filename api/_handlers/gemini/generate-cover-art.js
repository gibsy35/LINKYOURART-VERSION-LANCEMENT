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
        // Le sujet reel du projet passe desormais en premier et de facon
        // plus directive (au lieu d'etre une simple mention en fin de
        // phrase), pour que l'image genere visuellement ce que decrit le
        // projet plutot qu'une composition stylistique generique qui
        // ignore le contenu specifique. Le style reste un modificateur,
        // plus l'instruction dominante.
        const prompt = `Create a cover image that visually depicts this specific creative project: ${description || 'a creative project'}. The image must clearly represent the actual subject matter described above, not a generic abstract composition. Rendered in this visual style: ${style}. Square format, high resolution, professional quality, clean composition.`;
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
