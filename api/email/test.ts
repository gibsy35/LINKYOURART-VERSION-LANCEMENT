import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test minimal sans aucune dépendance externe
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = String(req.query.secret || '');
  if (secret !== 'lya-test-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    status: 'ok',
    env: {
      SMTP_HOST: process.env.SMTP_HOST || 'ABSENT',
      SMTP_PORT: process.env.SMTP_PORT || 'ABSENT',
      SMTP_USER: process.env.SMTP_USER || 'ABSENT',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'ABSENT',
    },
    timestamp: new Date().toISOString(),
    node: process.version,
  });
}
