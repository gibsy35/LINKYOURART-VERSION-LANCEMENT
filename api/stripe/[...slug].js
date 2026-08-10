// Single Vercel serverless function handling all /api/stripe/* routes
// (create-payment-intent, create-portal-session, create-checkout-session).
// See api/email/[...slug].js for why this consolidation exists (Vercel
// Hobby plan's 12-function-per-deployment limit). Handler logic is
// untouched, just relocated to api/_handlers/stripe/.
//
// This used to live at the API root (api/[...slug].js), which risked
// shadowing/conflicting with the other nested catch-alls (api/email/*,
// api/gemini/*) depending on how Vercel arbitrates precedence between a
// root-level catch-all and more specific nested ones -- exactly the kind
// of ambiguity that caused pre-registration emails to silently stop being
// sent. Moved into its own named subfolder so all three dynamic route
// groups are symmetric and non-overlapping, removing the ambiguity
// entirely rather than relying on undocumented precedence behavior.
//
// URL changed accordingly: /api/create-payment-intent is now
// /api/stripe/create-payment-intent (see src/views/PaymentView.tsx and
// src/views/ProfileView.tsx for the updated fetch calls).

const handlers = {
  'create-payment-intent': require('../_handlers/stripe/create-payment-intent'),
  'create-portal-session': require('../_handlers/stripe/create-portal-session'),
  'create-checkout-session': require('../_handlers/stripe/create-checkout-session'),
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
