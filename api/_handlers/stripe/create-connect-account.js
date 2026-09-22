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
    console.error('[CONNECT] Firebase Admin init failed:', initErr.message);
  }
}

// Cree (si besoin) le compte Stripe Connect Express d'un createur, puis
// renvoie un lien d'onboarding Stripe (verification d'identite geree
// entierement par Stripe, LYA ne manipule jamais ces documents). Modele
// "destination charges": l'argent d'un soutien Mecenat est ensuite verse
// directement sur ce compte, moins la commission LYA - voir
// create-payment-intent.js.
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe not configured on the server (STRIPE_SECRET_KEY missing).' });
  }

  const { uid, email, returnUrl, refreshUrl } = req.body || {};
  if (!uid || !email) return res.status(400).json({ error: 'Missing uid or email' });

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    let accountId = userSnap.exists ? userSnap.data().stripeConnectAccountId : null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { lyaUid: uid },
      });
      accountId = account.id;
      await userRef.set({
        stripeConnectAccountId: accountId,
        stripeConnectStatus: 'PENDING',
      }, { merge: true });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${req.headers.origin || 'https://www.linkyourart.com'}/`,
      return_url: returnUrl || `${req.headers.origin || 'https://www.linkyourart.com'}/`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url, accountId });
  } catch (err) {
    console.error('[CONNECT] Failed to create account/link:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
