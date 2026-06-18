import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../../src/lib/email/smtp';
import { templateWelcome } from '../../src/lib/email/templates';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, role = 'CREATOR', lang = 'FR' } = req.body;

  if (!to || !name) {
    return res.status(400).json({ error: 'Missing required fields: to, name' });
  }

  const isFR = lang === 'FR';
  const roleLabels: Record<string, { fr: string; en: string }> = {
    CREATOR: { fr: 'Créateur', en: 'Creator' },
    PROFESSIONAL: { fr: 'Professionnel', en: 'Professional' },
    INVESTOR: { fr: 'Mécène', en: 'Patron' },
  };
  const roleLabel = roleLabels[role] || roleLabels['CREATOR'];

  const subject = isFR
    ? `✦ Bienvenue sur LinkYourArt — Votre compte ${roleLabel.fr} est actif`
    : `✦ Welcome to LinkYourArt — Your ${roleLabel.en} account is active`;

  const html = templateWelcome({ name, role, lang });

  const result = await sendMail({ to, subject, html });

  return res.status(result.success ? 200 : 500).json(result);
}
