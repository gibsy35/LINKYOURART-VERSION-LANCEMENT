// Single Vercel serverless function handling all /api/stripe/* routes.
// See api/email-router.js for the full explanation of why this exists
// and why it's a plain-named file with a query-string action instead of
// a bracket-named dynamic file (the latter stopped reliably routing in
// production on this project).
//
// Public URLs are unchanged: /api/stripe/create-payment-intent still
// works exactly as before (see vercel.json for the rewrite to
// /api/stripe-router?action=create-payment-intent).

const handlers = {
  'create-payment-intent': require('./_handlers/stripe/create-payment-intent'),
  'create-portal-session': require('./_handlers/stripe/create-portal-session'),
  'create-checkout-session': require('./_handlers/stripe/create-checkout-session'),
};

module.exports = async (req, res) => {
  const action = req.query.action;
  const handler = handlers[action];

  if (!handler) {
    res.status(404).json({ error: `Unknown route: ${action}` });
    return;
  }
  return handler(req, res);
};
