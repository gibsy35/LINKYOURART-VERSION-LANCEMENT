// Single Vercel serverless function handling all /api/gemini/* routes.
// See api/email-router.js for the full explanation of why this exists
// and why it's a plain-named file with a query-string action instead of
// a bracket-named dynamic file (the latter stopped reliably routing in
// production on this project).
//
// Public URLs are unchanged: /api/gemini/analyze-asset still works
// exactly as before (see vercel.json for the rewrite to
// /api/gemini-router?action=analyze-asset).

const handlers = {
  'analyze-asset': require('./_handlers/gemini/analyze-asset'),
  'copilot': require('./_handlers/gemini/copilot'),
  'generate-cover-art': require('./_handlers/gemini/generate-cover-art'),
  'pricing-assessment': require('./_handlers/gemini/pricing-assessment'),
  'realtime-news': require('./_handlers/gemini/realtime-news'),
  'suggest-milestones': require('./_handlers/gemini/suggest-milestones'),
  'health-check': require('./_handlers/gemini/health-check'),
};

module.exports = async (req, res) => {
  const action = req.query.action;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown gemini action: ${action}` });
    return;
  }
  return handler(req, res);
};
