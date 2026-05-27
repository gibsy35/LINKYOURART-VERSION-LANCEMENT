import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { creativeField, role, projectSize, description, language } = req.body;
    const isFr = language === 'FR';
    const responseLang = isFr ? 'French' : 'English';
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: { responseMimeType: "application/json" },
      contents: `You are a LYA platform advisor. Assess the best plan for this creative professional. Write everything in ${responseLang}.
Field: ${creativeField}, Role: ${role}, Project Size: ${projectSize}, Description: ${description}.
Output ONLY valid JSON matching exactly this schema:
{
  "analysis": "string (2-3 sentences)",
  "recommendedPlanId": "CREATOR" | "INVESTOR" | "PRO" | "PRO_ENTERPRISE",
  "recommendedPlanName": "string",
  "primaryReason": "string",
  "estimatedMonthlyCost": number,
  "suggestedAddons": [{"name": "string", "reason": "string"}],
  "projectedBenefits": ["string"],
  "auditIndexScore": number between 0-100
}`
    });
    
    const text = response.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    
    // Ensure arrays exist
    if (!data.projectedBenefits) data.projectedBenefits = [];
    if (!data.suggestedAddons) data.suggestedAddons = [];
    
    res.json(data);
  } catch (error: any) {
    const isFr = req.body?.language === 'FR';
    res.json({
      analysis: isFr
        ? "Votre profil créatif reflète un fort potentiel d'indexation sur la plateforme LYA. Nous recommandons un forfait adapté à vos besoins spécifiques."
        : "Your creative profile shows strong indexing potential on the LYA platform. We recommend a plan tailored to your specific needs.",
      recommendedPlanId: 'PRO',
      recommendedPlanName: isFr ? 'Pro Personnel' : 'Personal Pro',
      primaryReason: isFr ? "Adapté à votre profil créatif" : "Best fit for your creative profile",
      estimatedMonthlyCost: 890,
      suggestedAddons: [
        { name: "Risk Audit Pro", reason: isFr ? "Sécurise l'audit de vos contrats." : "Secures your contract audit." }
      ],
      projectedBenefits: [
        isFr ? "Indexation fluide de vos droits créatifs." : "Smooth indexing of your creative rights.",
        isFr ? "Accès au réseau mondial de partenaires créatifs." : "Access to global creative partners network."
      ],
      auditIndexScore: 78
    });
  }
}
