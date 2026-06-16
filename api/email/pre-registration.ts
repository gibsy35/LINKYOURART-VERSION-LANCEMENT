import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../email/smtp';
import { templatePreRegistration } from '../email/templates';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, position, referralCode, referralLink, lang = 'FR' } = req.body;

  if (!to || !name || !position || !referralCode) {
    return res.status(400).json({ error: 'Missing required fields: to, name, position, referralCode' });
  }

  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ Pré-inscription confirmée — Vous êtes #${position} dans la liste`
    : `✦ Pre-registration confirmed — You're #${position} on the list`;

  const html = templatePreRegistration({ name, position, referralCode, referralLink: referralLink || `https://www.linkyourart.com?ref=${referralCode}`, lang });

  const result = await sendMail({ to, subject, html });

  return res.status(result.success ? 200 : 500).json(result);
}
