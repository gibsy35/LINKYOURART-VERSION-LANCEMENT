// Diagnostic endpoint — never exposes the actual key value, only whether
// it's present and whether a minimal real call to Anthropic succeeds.
// Visit /api/gemini/health-check in a browser (GET) to check.
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const altKey = process.env.VITE_ANTHROPIC_API_KEY;

  const result = {
    ANTHROPIC_API_KEY_present: Boolean(apiKey),
    ANTHROPIC_API_KEY_length: apiKey ? apiKey.length : 0,
    VITE_ANTHROPIC_API_KEY_present: Boolean(altKey),
    testCall: null,
  };

  const keyToTest = apiKey || altKey;

  if (!keyToTest) {
    result.diagnosis = 'NO_KEY_FOUND — ANTHROPIC_API_KEY is not set (or not set for this environment: Production/Preview/Development) on Vercel, or a redeploy hasn\'t happened since it was added.';
    return res.status(200).json(result);
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': keyToTest,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      }),
    });
    const data = await r.json();
    result.testCall = {
      httpStatus: r.status,
      ok: r.ok,
      anthropicResponse: r.ok
        ? (data.content || []).map(b => b.text).join('')
        : data,
    };
    result.diagnosis = r.ok
      ? 'SUCCESS — the key works and claude-sonnet-5 responded correctly.'
      : `API_ERROR — the key was sent but Anthropic rejected the request (HTTP ${r.status}). See testCall.anthropicResponse.error for the exact reason.`;
  } catch (e) {
    result.testCall = { networkError: e.message };
    result.diagnosis = 'NETWORK_ERROR — the request to api.anthropic.com itself failed (not a key/auth problem). See testCall.networkError.';
  }

  return res.status(200).json(result);
};
