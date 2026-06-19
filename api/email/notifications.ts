import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from './smtp';
import { templateInvitation, templateWelcome } from './templates';

// Handler unifié pour invitation + welcome (économise 1 slot Vercel Hobby)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, to, name, lang = 'FR' } = req.body;
  if (!type || !to || !name) return res.status(400).json({ error: 'Missing fields: type, to, name' });

  const isFR = lang === 'FR';

  if (type === 'invitation') {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: 'Missing inviteCode' });
    const subject = isFR
      ? `🎟️ Votre accès LinkYourArt est débloqué — Code : ${inviteCode}`
      : `🎟️ Your LinkYourArt access is unlocked — Code: ${inviteCode}`;
    const result = await sendMail({ to, subject, html: templateInvitation({ name, inviteCode, lang }) });
    return res.status(result.success ? 200 : 500).json(result);
  }

  if (type === 'welcome') {
    const { role } = req.body;
    const subject = isFR ? '✦ Bienvenue sur LinkYourArt' : '✦ Welcome to LinkYourArt';
    const result = await sendMail({ to, subject, html: templateWelcome({ name, role, lang }) });
    return res.status(result.success ? 200 : 500).json(result);
  }

  return res.status(400).json({ error: `Unknown type: ${type}. Use 'invitation' or 'welcome'` });
}
