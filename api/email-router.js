// Single Vercel serverless function handling all /api/email/* routes.
// Vercel's Hobby plan caps deployments at 12 serverless functions, so
// related endpoints are consolidated behind this one router instead of
// one file per route. Handler logic is untouched, just relocated to
// api/_handlers/email/ (files/folders starting with "_" under api/ are
// ignored by Vercel's function detection, so they don't count against
// the limit) and required here by action name.
//
// Routing note: this used to be a bracket-named dynamic file
// (api/email/[...slug].js). That stopped working reliably in production
// on this project (a plain Vite/"Other framework" deployment, not
// Next.js) -- requests kept 404ing even after eliminating every possible
// route-precedence conflict. Switched to a plain-named file with the
// action passed as a query string parameter via an explicit vercel.json
// rewrite instead, which is the same rewrite mechanism already proven to
// work elsewhere in this project.
//
// Public URLs are unchanged: /api/email/pre-registration still works
// exactly as before (see vercel.json for the rewrite to
// /api/email-router?action=pre-registration).

const handlers = {
  'approve-access': require('./_handlers/email/approve-access'),
  'monthly-report': require('./_handlers/email/monthly-report'),
  'pre-registration': require('./_handlers/email/pre-registration'),
  'welcome': require('./_handlers/email/welcome'),
  'enterprise-request': require('./_handlers/email/enterprise-request'),
  'validator-application': require('./_handlers/email/validator-application'),
  'invitation': require('./_handlers/email/invitation'),
};

module.exports = async (req, res) => {
  const action = req.query.action;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown email action: ${action}` });
    return;
  }
  return handler(req, res);
};
