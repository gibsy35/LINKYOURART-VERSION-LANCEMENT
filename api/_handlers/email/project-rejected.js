const { sendEmail } = require('../resend');

function buildRejectionEmail({ creatorName, projectName, reason, lang }) {
  const isFR = lang === 'fr' || lang === 'FR';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">' +

  '<tr><td style="background:#100c1a;padding:40px">' +
  '<span style="font-size:18px;font-weight:900;color:white;letter-spacing:0.15em">LINKYOURART</span>' +
  '</td></tr>' +

  '<tr><td bgcolor="#A78BFA" style="background:linear-gradient(90deg,#A78BFA,#E61A97);height:3px;font-size:0">&nbsp;</td></tr>' +

  '<tr><td style="background:#ffffff;padding:48px 40px">' +
  '<h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#100c1a">' +
  (isFR ? `Bonjour ${creatorName},` : `Hello ${creatorName},`) + '</h1>' +
  '<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7">' +
  (isFR
    ? `Après examen, votre projet <strong>« ${projectName} »</strong> n'a pas pu être certifié sur le Registre LYA à ce stade.`
    : `After review, your project <strong>"${projectName}"</strong> could not be certified on the LYA Registry at this stage.`) +
  '</p>' +

  '<div style="background:#f9fafb;border-radius:16px;padding:24px;margin-bottom:24px">' +
  '<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">' + (isFR ? 'Motif' : 'Reason') + '</p>' +
  '<p style="margin:0;font-size:14px;color:#100c1a;line-height:1.7;white-space:pre-wrap">' + (reason || '') + '</p>' +
  '</div>' +

  '<p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.7">' +
  (isFR
    ? "Vous pouvez soumettre une nouvelle version de votre projet à tout moment en tenant compte de ce retour."
    : "You can submit a new version of your project at any time, taking this feedback into account.") +
  '</p>' +

  '</td></tr>' +

  '<tr><td style="background:#100c1a;padding:24px 40px">' +
  '<p style="margin:0;font-size:11px;color:#9CA3AF">LinkYourArt · contact@linkyourart.com</p>' +
  '</td></tr>' +
  '<tr><td bgcolor="#A78BFA" style="background:linear-gradient(90deg,#A78BFA,#E61A97);height:3px;font-size:0">&nbsp;</td></tr>' +
  '</table></td></tr></table></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, creatorName, projectName, reason, lang } = req.body || {};
  if (!to) return res.status(400).json({ success: false, error: 'Missing recipient email' });

  const isFR = lang === 'fr' || lang === 'FR';
  const subject = isFR
    ? `Retour sur votre projet « ${projectName || ''} »`
    : `Feedback on your project "${projectName || ''}"`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[PROJECT_REJECTED_SIMULATED]', to, { projectName, reason });
      return res.status(200).json({ success: true, method: 'simulated' });
    }
    const html = buildRejectionEmail({ creatorName: creatorName || 'Créateur', projectName: projectName || '', reason: reason || '', lang });
    const result = await sendEmail({ to, subject, html });
    console.log(result.ok ? `[PROJECT_REJECTED_SENT] ✓ ${to} (${result.id})` : `[PROJECT_REJECTED_ERROR] ${result.err}`);
    return res.status(200).json({ success: result.ok, error: result.err });
  } catch (err) {
    console.error('[PROJECT_REJECTED] failed:', err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
};
