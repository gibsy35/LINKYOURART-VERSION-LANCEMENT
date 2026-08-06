const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customerId, returnUrl } = req.body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'https://linkyourart.com/profile',
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    console.error('[CREATE_PORTAL_SESSION] Stripe Portal Error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Portal session creation failed' });
  }
};
