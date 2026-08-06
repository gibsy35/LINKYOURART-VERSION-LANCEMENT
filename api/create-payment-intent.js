const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, currency = 'eur', metadata, customerId } = req.body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const params = {
      amount: Math.round(amount * 100), // Stripe expects the smallest currency unit (cents)
      currency,
      metadata: {
        ...metadata,
        system: 'LYA_TERMINAL_V4',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (customerId) {
      params.customer = customerId;
    } else if (metadata && metadata.userEmail) {
      // Create a new customer if an email is provided but no customer ID exists yet
      const customer = await stripe.customers.create({
        email: metadata.userEmail,
        metadata: {
          userId: metadata.userId || '',
        },
      });
      params.customer = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create(params);

    return res.json({ clientSecret: paymentIntent.client_secret, customerId: params.customer });
  } catch (error) {
    console.error('[CREATE_PAYMENT_INTENT] Stripe Error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Payment intent creation failed' });
  }
};
