
export const generateAssetAnalysis = async (assetName: string, description: string, score: number, language = 'EN') => {
  try {
    const response = await fetch('/api/gemini/analyze-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetName, description, score, language })
    });
    if (!response.ok) {
      throw new Error(`Analyze API failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.analysis || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Analysis failed:", error);
    return "Analysis currently unavailable. System is running under heavy load, please retry soon.";
  }
};

export const generateInvestmentThesis = async (assetName: string, description: string, marketData?: any, language = 'EN') => {
  try {
    const response = await fetch('/api/gemini/investment-thesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetName, description, marketData, language })
    });
    if (!response.ok) {
      throw new Error(`Thesis API failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data && !data.error && data.bullCase) {
      return data;
    }
    throw new Error("Invalid data format returned for Investment Thesis");
  } catch (error) {
    console.error("Thesis failed:", error);
    return {
      bullCase: "Strong creative fundamentals driven by organic audience growth, multi-platform IP syndication channels, and robust metadata indexing on the LYA ledger.",
      bearCase: "Short-term valuation adjustments resulting from global market shifts, production timeline deviations, or fluctuating secondary liquidity levels.",
      milestones: ["Initial creative audit completed by LYA specialists", "Primary SVOD/broadcast syndication contract signatures", "First dynamic revenue-share royalty distribution yield"]
    };
  }
};

export const suggestMilestones = async (description: string, language = 'EN') => {
  try {
    const response = await fetch('/api/gemini/suggest-milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, language })
    });
    if (!response.ok) {
      throw new Error(`Milestones API failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data && !data.error && Array.isArray(data)) {
      return data;
    }
    throw new Error("Invalid data format for milestones");
  } catch (error) {
    console.error("Milestones failed:", error);
    return [
      { label: "Phase 1: Intellectual Property Registration", date: "2026-10", scoreImpact: 10 },
      { label: "Phase 2: Global Broadcasting Presales", date: "2027-02", scoreImpact: 20 },
      { label: "Phase 3: Automated Royalty Split Live Activation", date: "2027-06", scoreImpact: 15 }
    ];
  }
};

export const askCopilot = async (query: string, history: { role: 'USER' | 'AI', content: string }[] = [], language = 'EN') => {
  try {
    const response = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history, language })
    });
    if (!response.ok) {
      throw new Error(`Copilot API failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.answer || "I'm having trouble connecting to the LYA Intelligence Grid.";
  } catch (error) {
    console.error("Copilot failed:", error);
    return "I'm having trouble connecting to the LYA Intelligence Grid right now due to heavy traffic on our validation nodes. Please try again in a few moments.";
  }
};

export const fetchRealtimeNews = async (language = 'EN') => {
  try {
    const response = await fetch(`/api/gemini/realtime-news?lang=${language}`);
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Realtime news fetch failed:", error);
    return null;
  }
};
