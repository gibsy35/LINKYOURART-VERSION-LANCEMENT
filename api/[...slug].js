// Single Vercel serverless function handling the top-level Stripe routes
// (/api/create-payment-intent, /api/create-portal-session,
// /api/create-checkout-session). See api/email/[...slug].js for why this
// consolidation exists (Vercel Hobby plan's 12-function-per-deployment
// limit). Handler logic is untouched, just relocated to
// api/_handlers/stripe/.
//
// This root catch-all only matches paths that aren't already matched by a
// more specific route -- /api/counter, /api/webhook, /api/email/*, and
// /api/gemini/* are all matched by their own (more specific) functions
// first, so they are unaffected by this file.
//
// URLs are unchanged: /api/create-payment-intent still works exactly as
// before, now served via this dispatcher instead of its own function.

const handlers = {
  'create-payment-intent': require('./_handlers/stripe/create-payment-intent'),
  'create-portal-session': require('./_handlers/stripe/create-portal-session'),
  'create-checkout-session': require('./_handlers/stripe/create-checkout-session'),
};

module.exports = async (req, res) => {
  const slugParam = req.query.slug;
  const action = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown route: ${action}` });
    return;
  }
  return handler(req, res);
};
