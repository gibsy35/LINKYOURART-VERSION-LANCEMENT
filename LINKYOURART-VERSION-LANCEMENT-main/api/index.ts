import express from 'express';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Firebase
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseAdminApp: admin.app.App | undefined;
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  firebaseAdminApp = admin.initializeApp({ projectId: firebaseConfig.projectId });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Webhook — raw body AVANT express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (!sig || !webhookSecret) throw new Error('Missing stripe-signature or webhook secret');
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // ... ton switch(event.type) existant ici si nécessaire
  res.json({ received: true });
});

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LYA Terminal Backend Operational' });
});

app.get('/api/user-status/:email', async (req, res) => {
  const { email } = req.params;
  if (firebaseAdminApp) {
    try {
      const db = firebaseAdminApp.firestore();
      const snapshot = await db.collection('users').where('email', '==', email).get();
      const isPro = !snapshot.empty && snapshot.docs.some(doc => doc.data().isPro === true);
      return res.json({ isPro });
    } catch (err) { }
  }
  res.json({ isPro: false });
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata, customerId } = req.body;
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key not configured' });
    const params: any = {
      amount: Math.round(amount * 100),
      currency,
      metadata: { ...metadata, system: 'LYA_TERMINAL_V4' },
      automatic_payment_methods: { enabled: true },
    };
    if (customerId) {
      params.customer = customerId;
    } else if (metadata?.userEmail) {
      const customer = await stripe.customers.create({ email: metadata.userEmail, metadata: { userId: metadata.userId || '' } });
      params.customer = customer.id;
    }
    const paymentIntent = await stripe.paymentIntents.create(params);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key not configured' });
    const portalSession = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    res.json({ url: portalSession.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
