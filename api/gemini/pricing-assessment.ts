import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { plan, usage, language } = req.body;
    const responseLang = language === 'FR' ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Assess the best LYA pricing plan for: plan=${plan}, usage=${JSON.stringify(usage)}. Write in ${responseLang}. Be concise, 2 sentences max.`
    });
    res.json({ assessment: response.text });
  } catch (error: any) {
    res.json({ assessment: '' });
  }
}
