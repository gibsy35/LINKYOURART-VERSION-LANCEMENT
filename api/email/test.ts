import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../../src/lib/email/smtp';

// Endpoint de test SMTP — accès restreint admin
// Appel : GET https://linkyourart.com/api/email/test?to=votre@email.com&secret=lya-test-2026
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.query.secret || req.body?.secret;
  if (secret !== 'lya-test-2026' && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const to = (req.query.to as string) || req.body?.to || 'contact@linkyourart.com';

  // Diagnostic des variables d'environnement
  const config = {
    SMTP_HOST: process.env.SMTP_HOST ? `✓ ${process.env.SMTP_HOST}` : '✗ ABSENT',
    SMTP_PORT: process.env.SMTP_PORT ? `✓ ${process.env.SMTP_PORT}` : '✗ ABSENT (défaut: 587)',
    SMTP_USER: process.env.SMTP_USER ? `✓ ${process.env.SMTP_USER}` : '✗ ABSENT',
    SMTP_PASS: process.env.SMTP_PASS ? '✓ [défini]' : '✗ ABSENT',
    SMTP_FROM: process.env.SMTP_FROM ? `✓ ${process.env.SMTP_FROM}` : '✗ ABSENT (défaut utilisé)',
  };

  const html = `
    <div style="font-family:monospace;background:#0D1117;color:#f9fafb;padding:24px;border-radius:12px;max-width:500px;">
      <h2 style="color:#00d4ff;margin:0 0 16px 0;">✦ LYA Email Test</h2>
      <p style="color:#10b981;font-size:18px;font-weight:900;">✓ Si vous lisez cet email, le SMTP fonctionne !</p>
      <hr style="border-color:rgba(255,255,255,0.1);margin:16px 0"/>
      <p style="color:#6b7280;">Envoyé à : <strong style="color:#f9fafb;">${to}</strong></p>
      <p style="color:#6b7280;">Timestamp : ${new Date().toISOString()}</p>
    </div>
  `;

  const result = await sendMail({
    to,
    subject: `✦ LYA Test SMTP — ${new Date().toLocaleTimeString('fr-FR')}`,
    html,
  });

  return res.status(200).json({
    config,
    result,
    message: result.method === 'simulated'
      ? '⚠ Mode simulation — variables SMTP manquantes dans Vercel'
      : result.success
        ? `✓ Email envoyé à ${to}`
        : `✗ Erreur SMTP : ${result.error}`,
  });
}
