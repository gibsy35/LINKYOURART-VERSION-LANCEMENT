import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../../src/lib/email/smtp';
import { templateInvitation } from '../../src/lib/email/templates';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, inviteCode, lang = 'FR' } = req.body;

  if (!to || !name || !inviteCode) {
    return res.status(400).json({ error: 'Missing required fields: to, name, inviteCode' });
  }

  const isFR = lang === 'FR';
  const subject = isFR
    ? `🎟️ Votre accès LinkYourArt est débloqué — Code : ${inviteCode}`
    : `🎟️ Your LinkYourArt access is unlocked — Code: ${inviteCode}`;

  const html = templateInvitation({ name, inviteCode, lang });

  const result = await sendMail({ to, subject, html });

  return res.status(result.success ? 200 : 500).json(result);
}
