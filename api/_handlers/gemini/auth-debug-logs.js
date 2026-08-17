// Read-only diagnostic endpoint for the mobile Google sign-in investigation.
// Returns the most recent entries from the auth_debug_logs collection so
// they can be inspected without direct Firestore console access.
// GET /api/gemini/auth-debug-logs
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
    });
  } catch (e) {
    // Do NOT let this throw at module-load time -- gemini-router.js requires
    // every handler eagerly at startup, so an uncaught error here would take
    // down every other /api/gemini/* route, not just this diagnostic one.
    // The actual request handler below will surface the real error instead.
    console.warn('[auth-debug-logs] admin init failed (will retry per-request):', e.message);
  }
}

// Same non-default Firestore database the client SDK writes to
// (see src/firebase.ts -> firebaseConfig.firestoreDatabaseId).
const DB_ID = 'ai-studio-3ff04aa4-4380-4f15-bf2f-a0049f6f3951';

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const db = getFirestore(undefined, DB_ID);
    const snap = await db
      .collection('auth_debug_logs')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const logs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        stage: data.stage,
        outcome: data.outcome || null,
        source: data.source || null,
        wasPending: data.wasPending ?? null,
        errorCode: data.errorCode || null,
        errorMessage: data.errorMessage || null,
        userAgent: data.userAgent || null,
        url: data.url || null,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
      };
    });

    return res.status(200).json({ count: logs.length, logs });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};
