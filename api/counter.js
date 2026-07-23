const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Init Firebase Admin (server-side, bypasses all client rules)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const db = getFirestore();

    // Migration ponctuelle : role='INVESTOR' -> role='PATRON' (a retirer apres usage)
    if (req.query && req.query.migrate === 'patron-role-2026') {
      if (req.headers['authorization'] !== 'Bearer lya-migrate-patron-2026') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const snap = await db.collection('users').where('role', '==', 'INVESTOR').get();
      if (snap.empty) {
        return res.json({ success: true, migrated: 0, message: 'Aucun compte avec role=INVESTOR trouve.' });
      }
      const batch = db.batch();
      const updated = [];
      snap.forEach(doc => {
        batch.update(doc.ref, { role: 'PATRON' });
        updated.push({ id: doc.id, email: doc.data().email || null });
      });
      await batch.commit();
      return res.json({ success: true, migrated: updated.length, accounts: updated });
    }

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
