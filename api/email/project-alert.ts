import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../../src/lib/email/smtp';
import { templateProjectAlert } from '../../src/lib/email/templates';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, projectName, projectCategory, eventFR, eventEN, lyaScore, lang = 'FR' } = req.body;

  if (!to || !name || !projectName || !eventFR || !eventEN) {
    return res.status(400).json({ error: 'Missing required fields: to, name, projectName, eventFR, eventEN' });
  }

  const isFR = lang === 'FR';
  const subject = isFR
    ? `● Nouveau sur ${projectName} — ${eventFR}`
    : `● Update on ${projectName} — ${eventEN}`;

  const html = templateProjectAlert({
    name, projectName, projectCategory: projectCategory || 'Création', eventFR, eventEN,
    lyaScore: lyaScore || 0, lang
  });

  const result = await sendMail({ to, subject, html });

  return res.status(result.success ? 200 : 500).json(result);
}
