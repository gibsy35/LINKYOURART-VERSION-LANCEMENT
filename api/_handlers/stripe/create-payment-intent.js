const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, currency = 'eur', metadata, customerId, connectedAccountId } = req.body || {};

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountCents = Math.round(amount * 100);
    const params = {
      amount: amountCents, // Stripe expects the smallest currency unit (cents)
      currency,
      metadata: {
        ...metadata,
        system: 'LYA_TERMINAL_V4',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Soutien Mecenat vers un createur equipe de Stripe Connect: le
    // paiement se scinde automatiquement au niveau de Stripe ("destination
    // charge") - le createur recoit directement sa part sur son propre
    // compte, LYA garde sa commission (5% par defaut) sans jamais faire
    // transiter ni detenir la part du createur.
    if (connectedAccountId) {
      params.transfer_data = { destination: connectedAccountId };
      const feeBps = Number(process.env.LYA_PLATFORM_FEE_BPS) || 500; // 500 = 5.00%
      params.application_fee_amount = Math.round(amountCents * feeBps / 10000);
    }

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
