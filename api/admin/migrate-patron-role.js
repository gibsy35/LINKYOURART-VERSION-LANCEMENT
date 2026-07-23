const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Init Firebase Admin (server-side, bypasses all client rules) — meme pattern que api/counter.js
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Migration ponctuelle : role='INVESTOR' -> role='PATRON' (suite au renommage de l'enum UserRole).
// Protege par un token simple pour eviter un appel accidentel/public.
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.headers['authorization'] !== 'Bearer lya-migrate-patron-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = getFirestore();
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
  } catch (err) {
    console.error('Migration error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
