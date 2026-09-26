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

    // Mode echantillon: comprendre ce qui pollue la collection (9252
    // documents trouves alors qu'une grosse centaine etait attendue)
    if (req.query.sample === '1') {
      const sampleSnap = await db.collection('contracts').limit(20).get();
      result.sample = sampleSnap.docs.map(d => {
        const data = d.data();
        return { id: d.id, name: data.name, status: data.status, createdBy: data.publishedBy || data.creatorId || null, hasPublishedAt: !!data.publishedAt, keys: Object.keys(data) };
      });
    }

    // Nettoyage de la pollution mock_p_ (9252 documents trouves) - cause
    // tres probable du bug de visibilite ET du ralentissement severe
    // remonte par Gibsy en naviguant vers Admin/Pro/Mecene/Createur (ces
    // vues chargent liveContracts, desormais 500 documents en temps reel
    // depuis une collection de 9000+ elements, au lieu d'une grosse
    // centaine attendue). ?cleanup=dryrun compte sans rien supprimer,
    // ?cleanup=confirm supprime reellement, par lots de 500 (limite
    // Firestore par batch).
    if (req.query.cleanup === 'dryrun' || req.query.cleanup === 'confirm') {
      const mockSnap = await db.collection('contracts')
        .where('__name__', '>=', 'mock_p_')
        .where('__name__', '<', 'mock_p_\uf8ff')
        .get();
      const mockIds = mockSnap.docs.map(d => d.id);
      result.mockDocumentsFound = mockIds.length;

      if (req.query.cleanup === 'confirm') {
        let deleted = 0;
        for (let i = 0; i < mockIds.length; i += 500) {
          const batch = db.batch();
          mockIds.slice(i, i + 500).forEach(id => batch.delete(db.collection('contracts').doc(id)));
          await batch.commit();
          deleted += Math.min(500, mockIds.length - i);
        }
        result.deleted = deleted;
        const remaining = await db.collection('contracts').count().get();
        result.totalContractsAfterCleanup = remaining.data().count;
      }
    }

    // Deuxieme vague de pollution generique trouvee apres le premier
    // nettoyage: 453 documents prefixes DEMO_PROJ_ (noms generiques type
    // "Bio Core #1033", "Project Zion 18"), meme motif que mock_p_ sous un
    // autre prefixe. Confirme par Gibsy.
    if (req.query.cleanup2 === 'dryrun' || req.query.cleanup2 === 'confirm') {
      const demoSnap = await db.collection('contracts')
        .where('__name__', '>=', 'DEMO_PROJ_')
        .where('__name__', '<', 'DEMO_PROJ_\uf8ff')
        .get();
      const demoIds = demoSnap.docs.map(d => d.id);
      result.demoProjDocumentsFound = demoIds.length;

      if (req.query.cleanup2 === 'confirm') {
        let deleted2 = 0;
        for (let i = 0; i < demoIds.length; i += 500) {
          const batch = db.batch();
          demoIds.slice(i, i + 500).forEach(id => batch.delete(db.collection('contracts').doc(id)));
          await batch.commit();
          deleted2 += Math.min(500, demoIds.length - i);
        }
        result.deleted2 = deleted2;
        const remaining2 = await db.collection('contracts').count().get();
        result.totalContractsAfterCleanup2 = remaining2.data().count;
      }
    }

    // Verification de la meme pollution potentielle dans users (17K+
    // profils signales par Gibsy sur le Registre Hub, meme motif que les
    // "Global Asset" trouves dans contracts)
    if (req.query.checkUsers === '1') {
      const usersCount = await db.collection('users').count().get();
      result.totalUsersInDb = usersCount.data().count;
      const usersSample = await db.collection('users').limit(10).get();
      result.usersSample = usersSample.docs.map(d => {
        const data = d.data();
        return { id: d.id, displayName: data.displayName, email: data.email, role: data.role, keys: Object.keys(data) };
      });
    }

    // Nettoyage des faux profils mock_u_ dans users (17611 trouves), meme
    // motif et meme methode que le nettoyage de contracts - cible
    // uniquement ce prefixe precis, les vrais comptes utilisateurs ne sont
    // jamais touches.
    if (req.query.cleanupUsers === 'dryrun' || req.query.cleanupUsers === 'confirm') {
      const mockUserSnap = await db.collection('users')
        .where('__name__', '>=', 'mock_u_')
        .where('__name__', '<', 'mock_u_\uf8ff')
        .get();
      const mockUserIds = mockUserSnap.docs.map(d => d.id);
      result.mockUsersFound = mockUserIds.length;

      if (req.query.cleanupUsers === 'confirm') {
        let deletedUsers = 0;
        for (let i = 0; i < mockUserIds.length; i += 500) {
          const batch = db.batch();
          mockUserIds.slice(i, i + 500).forEach(id => batch.delete(db.collection('users').doc(id)));
          await batch.commit();
          deletedUsers += Math.min(500, mockUserIds.length - i);
        }
        result.deletedUsers = deletedUsers;
        const remainingUsers = await db.collection('users').count().get();
        result.totalUsersAfterCleanup = remainingUsers.data().count;
      }
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[INSPECT_PROJECT] Error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
