const Stripe = require('stripe');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
    });
  } catch (initErr) {
    console.error('[WEBHOOK] Firebase Admin init failed — payment confirmations cannot be recorded until this is fixed:', initErr.message);
  }
}

// Stripe requires the raw, unparsed request body to verify the webhook
// signature -- disable Vercel's automatic JSON body parsing for this route.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// Recurring Stripe Price IDs for the two Pro subscription tiers, reversed
// for looking up a plan from a Stripe subscription/price object.
// Keep in sync with api/create-checkout-session.js and
// src/lib/permissions.ts.
const PRICE_TO_PLAN = {
  price_1U1YOlFBoAo1nkVT8dwACxTP: 'PRO_STARTER',
  price_1U1eJdFBoAo1nkVTy1fqGW3p: 'PRO_ADVANCED',
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function planToGrant(planId) {
  switch (planId) {
    case 'PRO_STARTER':
      return { role: 'PROFESSIONAL', proTier: 'STARTER', isPro: true };
    case 'PRO_ADVANCED':
      return { role: 'PROFESSIONAL', proTier: 'ADVANCED', isPro: true };
    case 'PRO_ENTERPRISE':
      return { role: 'PROFESSIONAL', proTier: 'ADVANCED', isEnterprise: true, isPro: true };
    default:
      return { isPro: true };
  }
}

async function findUserRefs(db, { userId, userEmail, stripeCustomerId }) {
  const usersRef = db.collection('users');

  if (userId) {
    const snap = await usersRef.doc(userId).get();
    if (snap.exists) return [snap.ref];
  }
  if (stripeCustomerId) {
    const snap = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).get();
    if (!snap.empty) return snap.docs.map((d) => d.ref);
  }
  if (userEmail) {
    const snap = await usersRef.where('email', '==', userEmail).get();
    if (!snap.empty) return snap.docs.map((d) => d.ref);
  }
  return [];
}

async function grantAccess(db, { userEmail, userId, planId, stripeCustomerId, stripeSubscriptionId }) {
  const docs = await findUserRefs(db, { userId, userEmail, stripeCustomerId });
  if (docs.length === 0) {
    console.warn('[WEBHOOK] grantAccess: no matching user found for', { userEmail, userId, stripeCustomerId });
    return;
  }

  const updateData = { ...planToGrant(planId) };
  if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) updateData.stripeSubscriptionId = stripeSubscriptionId;

  const batch = db.batch();
  docs.forEach((ref) => batch.update(ref, updateData));
  await batch.commit();
  console.log('[WEBHOOK] Access granted', { userEmail, userId, planId, updateData });
}

async function revokeAccess(db, { userEmail, userId, stripeCustomerId, stripeSubscriptionId }) {
  const docs = await findUserRefs(db, { userId, userEmail, stripeCustomerId });
  if (docs.length === 0) {
    console.warn('[WEBHOOK] revokeAccess: no matching user found for', { userEmail, userId, stripeCustomerId });
    return;
  }

  // Subscription ended -- fall back to the free Creator tier. This does NOT
  // touch isVerifiedValidator (a separate manual accreditation, unrelated to
  // a paid subscription) or isEnterprise (institutional deals are handled
  // through a separate sales relationship, not this subscription flow).
  const updateData = {
    role: 'CREATOR',
    isPro: false,
    proTier: null,
    stripeSubscriptionId: null,
  };

  const batch = db.batch();
  docs.forEach((ref) => batch.update(ref, updateData));
  await batch.commit();
  console.log('[WEBHOOK] Access revoked', { userEmail, userId, stripeSubscriptionId });
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
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        const meta = session.metadata || {};
        const email = (session.customer_details && session.customer_details.email) || meta.userEmail;
        if (meta.type === 'PRO_UPGRADE' && email) {
          await grantAccess(db, {
            userEmail: email,
            userId: meta.userId,
            planId: meta.planId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription || undefined,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const meta = sub.metadata || {};
        const priceId = sub.items && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
        const planId = PRICE_TO_PLAN[priceId] || meta.planId;

        if (sub.status === 'active' || sub.status === 'trialing') {
          await grantAccess(db, {
            userEmail: meta.userEmail,
            userId: meta.userId,
            planId,
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
          });
        } else {
          console.log('[WEBHOOK] Subscription in non-active state', sub.status, sub.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const meta = sub.metadata || {};
        await revokeAccess(db, {
          userEmail: meta.userEmail,
          userId: meta.userId,
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type ${event.type}`);
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('[WEBHOOK] Handler error:', err.message || err);
    return res.status(200).json({ received: true, warning: 'processing_error' });
  }
};
