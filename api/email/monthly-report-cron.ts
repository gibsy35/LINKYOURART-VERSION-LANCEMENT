import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cron déclenché le 1er de chaque mois à 9h UTC
// vercel.json : "0 9 1 * *"
// Ce handler liste les mécènes Firebase et envoie leur rapport mensuel

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron authentifie via Authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  // En production, récupérer les mécènes depuis Firestore
  // Pour l'instant, log du déclenchement
  console.log(`[CRON] Rapport mensuel LYA — ${month} — déclenché le ${new Date().toISOString()}`);

  // Exemple d'appel pour chaque mécène (à brancher sur Firestore en prod)
  // const investors = await getFirestoreInvestors();
  // for (const investor of investors) {
  //   await fetch('/api/email/monthly-report', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
  //     body: JSON.stringify({ email: investor.email, patronName: investor.displayName, lang: investor.lang || 'FR', ... })
  //   });
  // }

  return res.status(200).json({
    success: true,
    message: `Rapport mensuel LYA déclenché pour ${month}`,
    timestamp: new Date().toISOString(),
  });
}
