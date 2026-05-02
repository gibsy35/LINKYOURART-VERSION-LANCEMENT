
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseAdminApp: admin.app.App | undefined;

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  firebaseAdminApp = admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook Endpoint
  // Note: We need the raw body for signature verification
  // This MUST be before express.json()
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !webhookSecret) {
        throw new Error('Missing stripe-signature or webhook secret');
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[WEBHOOK_ERROR] ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[PAYMENT_SUCCESS] PaymentIntent was successful!`);
        
        // Extract metadata to identify the user
        const userEmail = paymentIntent.metadata.userEmail;
        const planName = paymentIntent.metadata.planName;
        const customerId = paymentIntent.customer as string;

        if (userEmail && firebaseAdminApp) {
          try {
            const db = firebaseAdminApp.firestore();
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', userEmail).get();
            
            if (!snapshot.empty) {
              const batch = db.batch();
              snapshot.docs.forEach(doc => {
                const updateData: any = { isPro: true };
                if (customerId) updateData.stripeCustomerId = customerId;
                batch.update(doc.ref, updateData);
              });
              await batch.commit();
              console.log(`[PRO_ACTIVATED] User ${userEmail} upgraded to ${planName} in Firestore`);
            } else {
              console.warn(`[PRO_ERROR] User ${userEmail} not found in Firestore`);
            }
          } catch (err) {
            console.error(`[PRO_ERROR] Failed to update Firestore for ${userEmail}:`, err);
          }
        }
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email || session.metadata?.userEmail;
        const stripeCustId = session.customer as string;
        if (email && firebaseAdminApp) {
          try {
            const db = firebaseAdminApp.firestore();
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get();
            
            if (!snapshot.empty) {
              const batch = db.batch();
              snapshot.docs.forEach(doc => {
                const updateData: any = { isPro: true };
                if (stripeCustId) updateData.stripeCustomerId = stripeCustId;
                batch.update(doc.ref, updateData);
              });
              await batch.commit();
              console.log(`[PRO_ACTIVATED] Checkout completed for ${email} in Firestore`);
            }
          } catch (err) {
            console.error(`[PRO_ERROR] Failed to update Firestore for ${email}:`, err);
          }
        }
        break;
      default:
        console.log(`[WEBHOOK] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LYA Terminal Backend Operational' });
  });

  // Check if a user is Pro
  app.get('/api/user-status/:email', async (req, res) => {
    const { email } = req.params;
    if (firebaseAdminApp) {
      try {
        const db = firebaseAdminApp.firestore();
        const snapshot = await db.collection('users').where('email', '==', email).get();
        const isPro = !snapshot.empty && snapshot.docs.some(doc => doc.data().isPro === true);
        return res.json({ isPro });
      } catch (err) {
        console.error(`[STATUS_ERROR] Failed to check status for ${email}:`, err);
      }
    }
    res.json({ isPro: false });
  });

  // Stripe Payment Intent
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'usd', metadata, customerId } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe secret key not configured' });
      }

      const params: any = {
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata: {
          ...metadata,
          system: 'LYA_TERMINAL_V4'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerId) {
        params.customer = customerId;
      } else if (metadata?.userEmail) {
        // Create a new customer if email is provided
        const customer = await stripe.customers.create({
          email: metadata.userEmail,
          metadata: {
            userId: metadata.userId || ''
          }
        });
        params.customer = customer.id;
      }

      const paymentIntent = await stripe.paymentIntents.create(params);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Customer Portal
  app.post('/api/create-portal-session', async (req, res) => {
    try {
      const { customerId, returnUrl } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe secret key not configured' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error('Stripe Portal Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gemini Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userMessage } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
      }

      // We'll use the newer SDK on the backend
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      const systemPrompt = `You are LYA Copilot v1.2, a high-end AI assistant for LinkYourArt. 
      Your purpose is to provide expert-grade analysis, real-time market data insights, and ecological guidance within the registry.
      
      PERSONALITY:
      - Highly professional, reactive, and efficient.
      - Use technical but accessible terminology (Terminal, Settlement, Yield, Liquidity, Registry).
      - Maintain a vibe of "Digital Swiss Banker" meets "Creative Tech Pioneer".
      
      CAPABILITIES:
      - LYA Score explanation: It's the average of Score ALGO (algorithmic) and Score PRO (human expert audit). Both out of 1000.
      - Market advice: Focus on index growth and alpha potential.
      
      IMPORTANT:
      - RESPOND IN THE LANGUAGE THE USER IS USING.
      - Always ensure the response is formatted cleanly for the terminal interface.
      - If asked about fees, P2P fees range from 2% (Pro) to 5% (Standard).`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });

      // Filter and format history for Gemini
      let rawHistory = (messages || [])
        .filter((m: any) => m.role === 'USER' || m.role === 'AI')
        .map((m: any) => ({
          role: m.role === 'USER' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      // Gemini history MUST start with 'user' role and alternate
      // We also need to ensure it ends with 'model' so the next sendMessage (user) is valid
      const history: any[] = [];
      
      for (const msg of rawHistory) {
        if (history.length === 0) {
          // If first message is model, we prepend a generic user greeting or skip
          if (msg.role === 'model') {
            history.push({ role: 'user', parts: [{ text: 'Hello' }] });
            history.push(msg);
          } else {
            history.push(msg);
          }
        } else {
          const lastRole = history[history.length - 1].role;
          if (msg.role !== lastRole) {
            history.push(msg);
          } else {
            // Merge consecutive same-role messages
            history[history.length - 1].parts[0].text += "\n" + msg.parts[0].text;
          }
        }
      }

      // Ensure history ends with 'model' for the next 'user' message
      if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.pop();
      }

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      res.json({ text });
    } catch (error: any) {
      console.error('Gemini Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LYA_SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
