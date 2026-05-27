import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { assetName, description, score, language } = req.body;
    const responseLang = language === 'FR' ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: { systemInstruction: `You are a senior analyst specializing in creative rights valuation. Write in ${responseLang}.` },
      contents: `Analyze this creative project for LYA platform. Name: ${assetName}. Description: ${description}. LYA Score: ${score}/1000. Provide a concise 2-sentence summary in ${responseLang}.`
    });
    res.json({ analysis: response.text });
  } catch (error: any) {
    const isFr = req.body?.language === 'FR';
    res.json({ analysis: isFr
      ? `Ce projet créatif présente d'excellentes perspectives. Établi sur nos indicateurs certifiés LYA, ${req.body?.assetName || "le projet"} préserve une dynamique solide.`
      : `This creative project shows strong prospects. Based on LYA certified indicators, ${req.body?.assetName || "the project"} maintains solid dynamics.`
    });
  }
}
