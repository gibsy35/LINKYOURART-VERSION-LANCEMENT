// Endpoint de diagnostic temporaire: lit directement Firestore (Admin SDK,
// contourne toutes les regles et tout rendu cote client) pour verifier
// avec certitude si un projet existe reellement, sans dependre de captures
// d'ecran ou de la console du navigateur de Gibsy. Cible explicitement la
// base non-par-defaut utilisee par toute l'application (voir
// firebase-applet-config.json / src/firebase.ts) - une simple
// getFirestore() sans argument interrogerait la MAUVAISE base.
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const DATABASE_ID = 'ai-studio-3ff04aa4-4380-4f15-bf2f-a0049f6f3951';

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
    console.error('[INSPECT_PROJECT] Firebase Admin init failed:', initErr.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { registryIndex, name, id } = req.query;

  try {
    const db = getFirestore(DATABASE_ID);
    const result = { databaseId: DATABASE_ID, contracts: [], projects_pending: [] };

    if (id) {
      const doc = await db.collection('contracts').doc(id).get();
      if (doc.exists) result.contracts.push({ id: doc.id, ...doc.data() });
      const pending = await db.collection('projects_pending').doc(id).get();
      if (pending.exists) result.projects_pending.push({ id: pending.id, ...pending.data() });
    }

    if (registryIndex) {
      const snap = await db.collection('contracts').where('registryIndex', '==', registryIndex).get();
      snap.forEach(d => result.contracts.push({ id: d.id, ...d.data() }));
    }

    if (name) {
      const snap = await db.collection('contracts').where('name', '==', name).get();
      snap.forEach(d => { if (!result.contracts.find(c => c.id === d.id)) result.contracts.push({ id: d.id, ...d.data() }); });
      const snapPending = await db.collection('projects_pending').where('name', '==', name).get();
      snapPending.forEach(d => { if (!result.projects_pending.find(c => c.id === d.id)) result.projects_pending.push({ id: d.id, ...d.data() }); });
    }

    // Compte total pour contexte (le merge frontend limite a 200)
    const totalContracts = await db.collection('contracts').count().get();
    result.totalContractsInDb = totalContracts.data().count;

    return res.status(200).json(result);
  } catch (err) {
    console.error('[INSPECT_PROJECT] Error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
