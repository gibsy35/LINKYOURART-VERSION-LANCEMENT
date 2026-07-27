
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
      { label: "Phase 2: Distribution Agreement Signed", date: "2027-02", scoreImpact: 20 },
      { label: "Phase 3: Public Launch", date: "2027-06", scoreImpact: 15 }
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
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.news || null);
  } catch (error) {
    console.error("Realtime news fetch failed:", error);
    return null;
  }
};
