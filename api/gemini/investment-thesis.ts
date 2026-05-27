import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { assetName, description, marketData, language } = req.body;
    const responseLang = language === 'FR' ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: { responseMimeType: "application/json" },
      contents: `Generate a professional thesis for: ${assetName}. Description: ${description}. Write in ${responseLang}. Output JSON: { "bullCase": string, "bearCase": string, "milestones": string[] }`
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    const isFr = req.body?.language === 'FR';
    res.json(isFr
      ? { bullCase: "Fondations créatives solides portées par des flux d'audiences organiques constants.", bearCase: "Fluctuations temporaires possibles dues aux variables de distribution internationale.", milestones: ["Audit légal de propriété intellectuelle", "Négociation des droits de diffusion", "Premier versement de redevances"] }
      : { bullCase: "Strong creative fundamentals driven by organic audience growth and multi-platform distribution.", bearCase: "Short-term adjustments from global market shifts or production timeline deviations.", milestones: ["IP legal audit completed", "Broadcasting rights negotiation", "First royalty distribution"] }
    );
  }
}
