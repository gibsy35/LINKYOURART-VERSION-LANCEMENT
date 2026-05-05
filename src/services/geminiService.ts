import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
const DEFAULT_MODEL = "gemini-3-flash-preview";

function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // We don't throw here to avoid crashing the whole app, but we will handle it in the calls
      console.warn("GEMINI_API_KEY not found in environment.");
    }
    aiClient = new GoogleGenAI({ apiKey: key || 'placeholder' });
  }
  return aiClient;
}

export const generateAssetAnalysis = async (assetName: string, description: string, score: number) => {
  try {
    const ai = getAI();
    const prompt = `Analyze the following creative asset for an investment platform. 
    Asset Name: ${assetName}
    Description: ${description}
    Current LYA Score: ${score}/1000
    Provide a concise 2-sentence summary.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior financial analyst specializing in alternative creative assets."
      }
    });
    
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Analysis failed:", error);
    return "Analysis currently unavailable.";
  }
};

export const generateInvestmentThesis = async (assetName: string, description: string, marketData?: any) => {
  try {
    const ai = getAI();
    const marketContext = marketData ? `
      Market Data:
      - Total Valuation: $${marketData.totalValue.toLocaleString()}
      - Growth Rate: ${marketData.growth}%
      - Stability Index: ${marketData.stability * 100}%
      - Scarcity Index: ${marketData.scarcity * 100}%
      - LYA Score: ${marketData.totalScore}/1000
    ` : "";

    const prompt = `Generate a professional investment thesis for: ${assetName}. 
    Description: ${description}
    ${marketContext}
    Provide Bull Case, Bear Case, and 3 Milestones.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bullCase: { type: Type.STRING },
            bearCase: { type: Type.STRING },
            milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["bullCase", "bearCase", "milestones"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Thesis failed:", error);
    return {
      bullCase: "Strong artistic fundamentals.",
      bearCase: "Market volatility risks.",
      milestones: ["Project audit", "Gallery exhibit", "Yield distribution"]
    };
  }
};

export const suggestMilestones = async (description: string) => {
  try {
    const ai = getAI();
    const prompt = `Suggest 3 relevant milestones for: ${description}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              date: { type: Type.STRING },
              priceImpact: { type: Type.NUMBER }
            },
            required: ["label", "date", "priceImpact"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Milestones failed:", error);
    return [
      { label: "Phase 1", date: "2026-10", priceImpact: 10 },
      { label: "Market Entry", date: "2027-02", priceImpact: 20 },
      { label: "Full Launch", date: "2027-06", priceImpact: 15 }
    ];
  }
};

export const askCopilot = async (query: string, history: { role: 'USER' | 'AI', content: string }[] = []) => {
  try {
    const ai = getAI();
    
    // Ensure history starts with 'user' role and alternates correctly
    // The first message in history is the AI greeting, which we skip for the API
    const contents = history
      .filter((msg, index) => !(index === 0 && msg.role === 'AI'))
      .map(msg => ({
        role: msg.role === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contents as any,
      config: {
        systemInstruction: `You are the LYA Artistic Guide (Copilot v2.2), an expert AI specialized in creative projects and art investment. 
        Your tone is elegant, professional, and inspiring. 
        Use art and creativity-related terminology. 
        LinkYourArt matches creators with patrons. 
        LYA Score: average of Score ALGO and Score PRO (both /1000).
        P2P Fees: 2% to 5%.
        Keep responses concise (max 4 sentences).`,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Copilot failed:", error);
    return "I'm having trouble connecting to the LYA Intelligence Grid. Please ensure your GEMINI_API_KEY is configured in the Settings menu.";
  }
};
