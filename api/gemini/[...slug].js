// Single Vercel serverless function handling all /api/gemini/* routes.
// See api/email/[...slug].js for why this consolidation exists (Vercel
// Hobby plan's 12-function-per-deployment limit). Handler logic is
// untouched, just relocated to api/_handlers/gemini/.
//
// URLs are unchanged: /api/gemini/analyze-asset still works exactly as
// before, now served via this dispatcher instead of its own function.

const handlers = {
  'analyze-asset': require('../_handlers/gemini/analyze-asset'),
  'copilot': require('../_handlers/gemini/copilot'),
  'generate-cover-art': require('../_handlers/gemini/generate-cover-art'),
  'pricing-assessment': require('../_handlers/gemini/pricing-assessment'),
  'realtime-news': require('../_handlers/gemini/realtime-news'),
  'suggest-milestones': require('../_handlers/gemini/suggest-milestones'),
};

module.exports = async (req, res) => {
  const slugParam = req.query.slug;
  const action = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown gemini action: ${action}` });
    return;
  }
  return handler(req, res);
};
