import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from './smtp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = String(req.query.secret || '');
  if (secret !== 'lya-test-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const to = String(req.query.to || 'contact@linkyourart.com');

  const result = await sendMail({
    to,
    subject: `✦ LYA Test SMTP — ${new Date().toISOString()}`,
    html: `<p style="font-family:sans-serif">Test email LinkYourArt — ${new Date().toISOString()}</p><p>Si vous lisez ceci, le SMTP fonctionne ✓</p>`,
  });

  return res.status(200).json({ to, result });
}
