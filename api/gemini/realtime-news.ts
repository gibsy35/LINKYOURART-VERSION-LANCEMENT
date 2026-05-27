import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const lang = req.query.lang as string || 'EN';
    const responseLang = lang === 'FR' ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: { responseMimeType: "application/json" },
      contents: `Generate 3 realistic creative industry news items for LYA platform in ${responseLang}. Output JSON: [{ "title": string, "source": string, "impact": string, "summary": string }]`
    });
    res.json(JSON.parse(response.text || '[]'));
  } catch (error: any) {
    res.json([]);
  }
}
