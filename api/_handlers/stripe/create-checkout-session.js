const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Recurring Stripe Price IDs for the two Pro subscription tiers.
// Keep in sync with src/lib/permissions.ts (PRO_STARTER_PRICE_EUR=79,
// PRO_ADVANCED_PRICE_EUR=249) if these are ever recreated in Stripe.
const PRICE_IDS = {
  PRO_STARTER: 'price_1U1YOlFBoAo1nkVT8dwACxTP',
  PRO_ADVANCED: 'price_1U1eJdFBoAo1nkVTy1fqGW3p',
};

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { planId, userEmail, userId, successUrl, cancelUrl } = req.body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return res.status(400).json({ error: `Unknown or non-subscribable plan: ${planId}` });
    }
    if (!userEmail || !userId) {
      return res.status(400).json({ error: 'Missing userEmail or userId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        type: 'PRO_UPGRADE',
        planId,
        userId,
        userEmail,
      },
      subscription_data: {
        metadata: {
          type: 'PRO_UPGRADE',
          planId,
          userId,
          userEmail,
        },
      },
      success_url: successUrl || 'https://linkyourart.com/?checkout=success',
      cancel_url: cancelUrl || 'https://linkyourart.com/pricing?checkout=cancelled',
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[CREATE_CHECKOUT_SESSION] Stripe Error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Checkout session creation failed' });
  }
};
