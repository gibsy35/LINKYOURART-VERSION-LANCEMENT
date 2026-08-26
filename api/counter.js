const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Init Firebase Admin (server-side, bypasses all client rules)
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (initErr) {
  console.error('[COUNTER] Firebase Admin init failed:', initErr.message);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const db = getFirestore();
    const ref = db.collection('public_stats').doc('pre_registrations');

    if (req.method === 'POST') {
      // Atomic increment
      await ref.set({ count: FieldValue.increment(1), updatedAt: new Date().toISOString() }, { merge: true });
      const snap = await ref.get();
      const count = snap.exists ? (snap.data().count || 0) : 0;
      return res.json({ success: true, count });
    }

    // GET — read current count
    const snap = await ref.get();
    const count = snap.exists ? (snap.data().count || 0) : 0;
    return res.json({ count });

  } catch (err) {
    console.error('Counter error:', err.message);
    // Fallback without admin SDK
    return res.json({ count: 0, error: err.message });
  }
};
