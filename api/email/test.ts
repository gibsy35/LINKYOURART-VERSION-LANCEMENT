import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from '../../src/lib/email/smtp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Vérification secret — query param uniquement pour GET simple
    const secret = String(req.query.secret || '');
    if (secret !== 'lya-test-2026') {
      return res.status(401).json({ error: 'Unauthorized — add ?secret=lya-test-2026' });
    }

    const to = String(req.query.to || 'contact@linkyourart.com');

    // Diagnostic variables SMTP
    const config = {
      SMTP_HOST: process.env.SMTP_HOST || 'ABSENT',
      SMTP_PORT: process.env.SMTP_PORT || 'ABSENT (default: 587)',
      SMTP_USER: process.env.SMTP_USER || 'ABSENT',
      SMTP_PASS: process.env.SMTP_PASS ? '[set]' : 'ABSENT',
    };

    const html = `<p>Test LYA SMTP — ${new Date().toISOString()}</p><p>To: ${to}</p>`;

    const result = await sendMail({
      to,
      subject: `LYA SMTP Test — ${new Date().toISOString()}`,
      html,
    });

    return res.status(200).json({ config, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, stack: err.stack?.slice(0, 300) });
  }
}
