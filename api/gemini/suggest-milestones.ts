import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { description, language } = req.body;
    const responseLang = language === 'FR' ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: { responseMimeType: "application/json" },
      contents: `Suggest 3 milestones for: ${description}. Write in ${responseLang}. Output JSON array: [{ "label": string, "date": string, "priceImpact": number }]`
    });
    res.json(JSON.parse(response.text || '[]'));
  } catch (error: any) {
    const isFr = req.body?.language === 'FR';
    res.json(isFr
      ? [{ label: "Enregistrement de la Propriété Intellectuelle", date: "2026-10", priceImpact: 10 }, { label: "Lancement des pré-ventes de droits", date: "2027-02", priceImpact: 20 }, { label: "Activation du reversement de redevances", date: "2027-06", priceImpact: 15 }]
      : [{ label: "IP Registration", date: "2026-10", priceImpact: 10 }, { label: "Rights Presales Launch", date: "2027-02", priceImpact: 20 }, { label: "Royalty Distribution Activation", date: "2027-06", priceImpact: 15 }]
    );
  }
}
