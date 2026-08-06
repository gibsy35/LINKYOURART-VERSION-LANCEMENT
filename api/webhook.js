const Stripe = require('stripe');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

// Stripe requires the raw, unparsed request body to verify the webhook
// signature -- disable Vercel's automatic JSON body parsing for this route.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Maps a plan id (sent as metadata.planId from the client checkout flow) to
// the role/proTier this webhook should grant. Keep in sync with
// src/lib/permissions.ts and src/views/PricingView.tsx.
function planToGrant(planId) {
  switch (planId) {
    case 'PRO_STARTER':
      return { role: 'PROFESSIONAL', proTier: 'STARTER', isPro: true };
    case 'PRO_ADVANCED':
      return { role: 'PROFESSIONAL', proTier: 'ADVANCED', isPro: true };
    case 'PRO_ENTERPRISE':
      return { role: 'PROFESSIONAL', proTier: 'ADVANCED', isEnterprise: true, isPro: true };
    default:
      // Unknown/legacy plan id -- fall back to a plain Pro grant so a
      // successful payment is never silently dropped.
      return { isPro: true };
  }
}

async function grantAccess(db, { userEmail, userId, planId, stripeCustomerId }) {
  const usersRef = db.collection('users');
  let docs = [];

  if (userId) {
    const snap = await usersRef.doc(userId).get();
    if (snap.exists) docs = [snap.ref];
  }
  if (docs.length === 0 && userEmail) {
    const snap = await usersRef.where('email', '==', userEmail).get();
    docs = snap.docs.map((d) => d.ref);
  }

  if (docs.length === 0) {
    console.warn('[WEBHOOK] No matching user found for', { userEmail, userId });
    return;
  }

  const updateData = { ...planToGrant(planId) };
  if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;

  const batch = db.batch();
  docs.forEach((ref) => batch.update(ref, updateData));
  await batch.commit();
  console.log('[WEBHOOK] Access granted', { userEmail, userId, planId, updateData });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await readRawBody(req);
    if (!sig || !webhookSecret) {
      throw new Error('Missing stripe-signature header or STRIPE_WEBHOOK_SECRET');
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[WEBHOOK_ERROR]', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const db = getFirestore();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const { type, planId, userEmail, userId } = pi.metadata || {};
        if (type === 'PRO_UPGRADE' && userEmail) {
          await grantAccess(db, { userEmail, userId, planId, stripeCustomerId: pi.customer });
        }
        // Patronage/support payments (mécénat) intentionally do NOT grant any
        // account upgrade here -- supporting a project is not a paid tier.
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object;
        const meta = session.metadata || {};
        const email = (session.customer_details && session.customer_details.email) || meta.userEmail;
        if (meta.type === 'PRO_UPGRADE' && email) {
          await grantAccess(db, { userEmail: email, userId: meta.userId, planId: meta.planId, stripeCustomerId: session.customer });
        }
        break;
      }
      default:
        console.log(`[WEBHOOK] Unhandled event type ${event.type}`);
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('[WEBHOOK] Handler error:', err.message || err);
    // Still acknowledge receipt to Stripe to avoid endless retries once the
    // event has been logged -- the failure is visible in Vercel's logs.
    return res.status(200).json({ received: true, warning: 'processing_error' });
  }
};
