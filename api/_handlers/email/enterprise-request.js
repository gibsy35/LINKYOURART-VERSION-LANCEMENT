const { sendEmail } = require('../resend');

const ADMIN_EMAIL = 'contact@linkyourart.com';

function buildAdminAlertEmail({ userName, userEmail, userId, planName, source }) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">' +
  '<tr><td bgcolor="#0d1117" style="background:#0d1117;padding:28px 32px">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td width="32" valign="middle"><img src="https://www.linkyourart.com/logo-brochure.png" width="28" height="28" alt="LinkYourArt" style="display:block;width:28px;height:28px" /></td>' +
  '<td valign="middle"><span style="font-size:16px;font-weight:900;color:white;letter-spacing:0.15em">LINKYOURART</span></td>' +
  '<td align="right" valign="middle"><span style="font-size:9px;font-weight:900;color:#00d4ff;text-transform:uppercase;letter-spacing:0.15em;border:1px solid #094c5d;padding:4px 10px;border-radius:20px">' + source + '</span></td>' +
  '</tr></table>' +
  '</td></tr>' +
  '<tr><td bgcolor="#00d4ff" style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +
  '<tr><td style="background:#ffffff;padding:32px">' +
  '<h1 style="margin:0 0 20px;font-size:20px;font-weight:900;color:#0d1117">New ' + source + ' request</h1>' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#374151">' +
  '<tr><td style="padding:6px 0;color:#9ca3af;font-weight:700;width:130px">Name</td><td style="padding:6px 0">' + (userName || '—') + '</td></tr>' +
  '<tr><td style="padding:6px 0;color:#9ca3af;font-weight:700">Email</td><td style="padding:6px 0"><a href="mailto:' + userEmail + '" style="color:#0d1117">' + userEmail + '</a></td></tr>' +
  '<tr><td style="padding:6px 0;color:#9ca3af;font-weight:700">User ID</td><td style="padding:6px 0;font-family:monospace;font-size:11px">' + (userId || '—') + '</td></tr>' +
  (planName ? '<tr><td style="padding:6px 0;color:#9ca3af;font-weight:700">Plan</td><td style="padding:6px 0">' + planName + '</td></tr>' : '') +
  '</table>' +
  '<p style="margin:24px 0 0;font-size:11px;color:#9ca3af">Full record saved to Firestore for follow-up.</p>' +
  '</td></tr>' +
  '<tr><td style="background:#0d1117;padding:16px 32px"><p style="margin:0;font-size:10px;color:#8B94A3">LinkYourArt · automated admin alert</p></td></tr>' +
  '</table></td></tr></table></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userName, userEmail, userId, planName } = req.body || {};
  if (!userEmail) return res.status(400).json({ error: 'Missing userEmail' });

  if (!process.env.RESEND_API_KEY) {
    console.log('[ENTERPRISE_REQUEST_SIMULATED]', userEmail, planName);
    return res.status(200).json({ success: true, method: 'simulated' });
  }

  const html = buildAdminAlertEmail({ userName, userEmail, userId, planName, source: 'Enterprise' });
  const result = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🏛 Enterprise request — ${userName || userEmail}`,
    html,
    replyTo: userEmail,
  });

  console.log(result.ok ? `[ENTERPRISE_REQUEST_SENT] ✓ (${result.id})` : `[ENTERPRISE_REQUEST_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'resend', error: result.err });
};
