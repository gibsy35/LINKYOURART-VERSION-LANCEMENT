
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateAssetAnalysis = async (assetName: string, description: string, score: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Analyze the following creative asset for an investment platform. 
      Asset Name: ${assetName}
      Description: ${description}
      Current LYA Score: ${score}/1000
      
      Provide a concise 2-sentence summary explaining the score based on market trends, artistic merit, and stability.`,
      config: {
        systemInstruction: "You are a senior financial analyst specializing in alternative creative assets. Be professional, objective, and concise.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Analysis currently unavailable due to high professional load.";
  }
};

export const generateInvestmentThesis = async (assetName: string, description: string, marketData?: any) => {
  try {
    const marketContext = marketData ? `
      Market Data:
      - Total Valuation: $${marketData.totalValue.toLocaleString()}
      - Growth Rate: ${marketData.growth}%
      - Stability Index: ${marketData.stability * 100}%
      - Scarcity Index: ${marketData.scarcity * 100}%
      - LYA Score: ${marketData.totalScore}/1000
    ` : "";

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Generate a professional investment thesis for the creative asset: ${assetName}. 
      Description: ${description}
      ${marketContext}
      
      Provide:
      1. Bull Case (Why to buy, considering the market data)
      2. Bear Case (Risks and potential downsides)
      3. 3 Key Milestones to watch for this specific asset.`,
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
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Thesis failed:", error);
    return {
      bullCase: "Strong artistic fundamentals and growing secondary market demand.",
      bearCase: "Market volatility and potential liquidity constraints in the short term.",
      milestones: ["Next professional audit", "Major gallery exhibition", "Quarterly yield distribution"]
    };
  }
};

export const askCopilotStream = async (query: string, context: string) => {
  try {
    return await ai.models.generateContentStream({
      model: "gemini-flash-latest",
      contents: `User Query: ${query}
      Context: ${context}
      
      Answer the user's question about the LinkYourArt platform and creative investments. Be helpful, artistic, and precise.`,
      config: {
        systemInstruction: `You are the LYA Artistic Guide, an expert AI specialized in creative projects and art investment. 
        Your tone is elegant, professional, and inspiring. 
        Use art and creativity-related terminology (e.g., 'artistic merit', 'creative journey', 'certified works'). 
        If asked about the platform, explain that LinkYourArt is the nexus for creators and patrons to collaborate and share success. 
        Keep responses concise (under 4 sentences).`,
      },
    });
  } catch (error) {
    console.error("Copilot streaming failed:", error);
    throw error;
  }
};

export const askCopilot = async (query: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `User Query: ${query}
      Context: ${context}
      
      Answer the user's question about LinkYourArt and its creative ecosystem. Be helpful, artistic, and precise.`,
      config: {
        systemInstruction: `You are the LYA Artistic Guide, an expert AI specialized in creative projects and art investment. 
        Your tone is elegant, professional, and inspiring. 
        Use art and creativity-related terminology (e.g., 'artistic merit', 'creative journey', 'certified works'). 
        If asked about the platform, explain that LinkYourArt is the nexus for creators and patrons. 
        Keep responses concise (under 4 sentences).`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Copilot failed:", error);
    return "I'm having trouble connecting to the LYA Intelligence Grid. Please try again shortly.";
  }
};

export const suggestMilestones = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Based on the following project description, suggest 3 relevant milestones for a creative contract.
      Description: ${description}
      
      For each milestone, provide:
      1. A clear label (e.g., 'Beta Launch', 'Global Distribution')
      2. An estimated date (e.g., '2026-09', '2027-01')
      3. A potential market impact percentage (e.g., 15, 25) representing the expected increase in contract value.`,
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
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Milestone suggestion failed:", error);
    return [
      { label: "Phase 1 Completion", date: "2026-10", priceImpact: 10 },
      { label: "Market Entry", date: "2027-02", priceImpact: 20 },
      { label: "Full Scale Launch", date: "2027-06", priceImpact: 15 }
    ];
  }
};
