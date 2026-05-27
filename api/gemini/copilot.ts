import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { query, history, language } = req.body;
    const isFr = language === 'FR';
    const promptLang = isFr ? 'French' : 'English';
    const contents = (history || []).map((msg: any) => ({
      role: msg.role === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: query }] });
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: {
        systemInstruction: `You are the LYA Artistic Guide (Copilot), an expert AI specialized in creative industries and creative rights valuation. Your tone is elegant, professional, and inspiring. LinkYourArt serves all creative industries: music, film, fashion, gaming, design, architecture and more. Keep responses concise (max 4 sentences). IMPORTANT: You MUST write your response completely in ${promptLang}.`
      },
      contents
    });
    res.json({ answer: response.text });
  } catch (error: any) {
    const isFr = req.body?.language === 'FR';
    res.json({ answer: isFr
      ? "Je rencontre un ralentissement passager. Le protocole LYA valorise tous les secteurs créatifs via des contrats indexés transparents. N'hésitez pas à me poser vos questions !"
      : "I'm experiencing a brief slowdown. The LYA protocol values all creative sectors via transparent indexed contracts. Feel free to ask me anything!"
    });
  }
}
