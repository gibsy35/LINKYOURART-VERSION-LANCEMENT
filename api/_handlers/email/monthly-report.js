const { sendEmail } = require('../resend');

function buildMonthlyReportEmail({ patronName, totalContributed, projects, lang }) {
  const isFR = lang === 'fr' || lang === 'FR';
  const fmt = (n) => new Intl.NumberFormat(isFR ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const projectsRows = (projects || []).map(p => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #eee">
        <p style="margin:0;font-size:14px;font-weight:900;color:#0d1117">${p.name || ''}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">${p.category || ''}</p>
        ${(p.milestones && p.milestones.length) ? `<p style="margin:6px 0 0;font-size:11px;color:#00b37a">${(isFR ? '✓ Jalons franchis: ' : '✓ Milestones completed: ') + p.milestones.join(', ')}</p>` : ''}
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">
        <p style="margin:0;font-size:14px;font-weight:900;color:#0d1117">${fmt(p.contributed)}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#9ca3af">Score: ${p.lyaScore || 0}/1000</p>
      </td>
    </tr>`).join('');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">' +

  '<tr><td style="background:#0d1117;padding:40px">' +
  '<span style="font-size:18px;font-weight:900;color:white;letter-spacing:0.15em">LINKYOURART</span>' +
  '</td></tr>' +

  '<tr><td bgcolor="#00d4ff" style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +

  '<tr><td style="background:#ffffff;padding:48px 40px">' +
  '<h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#0d1117">' +
  (isFR ? `Bonjour ${patronName},` : `Hello ${patronName},`) + '</h1>' +
  '<p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.7">' +
  (isFR ? 'Voici le résumé de votre mécénat sur LinkYourArt.' : 'Here is the summary of your patronage on LinkYourArt.') +
  '</p>' +

  '<div style="background:#f9fafb;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px">' +
  '<p style="margin:0;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">' + (isFR ? 'Total contribué' : 'Total contributed') + '</p>' +
  '<p style="margin:8px 0 0;font-size:32px;font-weight:900;color:#0d1117">' + fmt(totalContributed) + '</p>' +
  '<p style="margin:4px 0 0;font-size:12px;color:#9ca3af">' + (projects ? projects.length : 0) + ' ' + (isFR ? 'projet(s) soutenu(s)' : 'project(s) supported') + '</p>' +
  '</div>' +

  (projectsRows
    ? `<table width="100%" cellpadding="0" cellspacing="0">${projectsRows}</table>`
    : `<p style="font-size:13px;color:#9ca3af;text-align:center">${isFR ? "Vous n'avez pas encore soutenu de projet." : "You haven't supported any project yet."}</p>`
  ) +

  '</td></tr>' +

  '<tr><td style="background:#0d1117;padding:24px 40px">' +
  '<p style="margin:0;font-size:11px;color:#9CA3AF">LinkYourArt · contact@linkyourart.com</p>' +
  '</td></tr>' +
  '<tr><td bgcolor="#00d4ff" style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +
  '</table></td></tr></table></body></html>';
}

// Implementation reelle du rapport mensuel - avant ce fix, ce handler etait
// un stub qui repondait toujours success:true sans jamais envoyer le
// moindre email. L'utilisateur voyait "Rapport envoye" sans que rien ne
// soit reellement parti.
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Le frontend envoie deja ce jeton simple - on le verifie desormais pour
  // eviter que n'importe qui puisse appeler cet endpoint librement.
  const auth = req.headers.authorization || '';
  if (auth !== 'Bearer lya-monthly-report-2026') {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { email, patronName, totalContributed, projects, lang } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: 'Missing email' });

  const isFR = lang === 'fr' || lang === 'FR';
  const subject = isFR ? '✦ Votre rapport mensuel de mécénat LinkYourArt' : '✦ Your LinkYourArt monthly patronage report';

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[MONTHLY_REPORT_SIMULATED]', email, { totalContributed, projectsCount: (projects || []).length });
      return res.status(200).json({ success: true, method: 'simulated' });
    }
    const html = buildMonthlyReportEmail({ patronName, totalContributed, projects, lang });
    const result = await sendEmail({ to: email, subject, html });
    console.log(result.ok ? `[MONTHLY_REPORT_SENT] ✓ ${email} (${result.id})` : `[MONTHLY_REPORT_ERROR] ${result.err}`);
    return res.status(200).json({ success: result.ok, error: result.err });
  } catch (err) {
    console.error('[MONTHLY_REPORT] failed:', err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
};
