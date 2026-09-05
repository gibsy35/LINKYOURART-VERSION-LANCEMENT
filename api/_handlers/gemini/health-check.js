// Diagnostic endpoint — never exposes the actual key value, only whether
// it's present and whether a minimal real call to Gemini succeeds.
// Visit /api/gemini/health-check in a browser (GET) to check.
const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const viteKey = process.env.VITE_GEMINI_API_KEY;
  const plainKey = process.env.GEMINI_API_KEY;

  const result = {
    VITE_GEMINI_API_KEY_present: Boolean(viteKey),
    VITE_GEMINI_API_KEY_length: viteKey ? viteKey.length : 0,
    GEMINI_API_KEY_present: Boolean(plainKey),
    GEMINI_API_KEY_length: plainKey ? plainKey.length : 0,
    testCall: null,
  };

  const keyToTest = viteKey || plainKey;

  if (!keyToTest) {
    result.diagnosis = 'NO_KEY_FOUND — neither VITE_GEMINI_API_KEY nor GEMINI_API_KEY is visible to this function (wrong environment scope, or no redeploy since it was added).';
    return res.status(200).json(result);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: keyToTest });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Reply with exactly: OK',
    });
    result.testCall = { ok: true, geminiResponse: response.text || '' };
    result.diagnosis = 'SUCCESS — the key works and gemini-3.6-flash responded correctly.';
  } catch (e) {
    result.testCall = { ok: false, error: e.message };
    result.diagnosis = `API_ERROR — the key was sent but Gemini rejected the request. See testCall.error for the exact reason.`;
  }

  return res.status(200).json(result);
};
