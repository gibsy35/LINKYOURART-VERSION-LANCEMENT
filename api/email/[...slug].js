// Single Vercel serverless function handling all /api/email/* routes.
// Vercel's Hobby plan caps deployments at 12 serverless functions, so
// related endpoints are consolidated behind this one dynamic catch-all
// instead of one file per route. The actual handler logic is untouched,
// just relocated to api/_handlers/email/ (files/folders starting with "_"
// under api/ are ignored by Vercel's function detection, so they don't
// count against the limit) and required here by action name.
//
// URLs are unchanged: /api/email/pre-registration still works exactly as
// before, now served via this dispatcher instead of its own function.

const handlers = {
  'approve-access': require('../_handlers/email/approve-access'),
  'monthly-report': require('../_handlers/email/monthly-report'),
  'pre-registration': require('../_handlers/email/pre-registration'),
  'welcome': require('../_handlers/email/welcome'),
};

module.exports = async (req, res) => {
  const slugParam = req.query.slug;
  const action = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown email action: ${action}` });
    return;
  }
  return handler(req, res);
};
