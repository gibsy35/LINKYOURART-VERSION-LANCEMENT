const { sendEmail } = require('../resend');

// Email envoyé lorsqu'un membre vérifié du Salon Pro contacte un autre
// membre via la messagerie du Salon (LoungeView.tsx / SecureMail.tsx).
// Remplace l'ancien comportement qui affichait "Envoyé avec succès"
// sans jamais rien transmettre nulle part.
function buildLoungeContactEmail({ senderName, senderRole, subject, message, isFR }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <tr><td bgcolor="#0F1621" style="background:linear-gradient(160deg,#0F1621 0%,#0D1117 60%,#12192A 100%);border-radius:20px 20px 0 0;padding:44px 40px 36px;text-align:center;border:1px solid rgba(255,215,0,0.15);border-bottom:none;">
    <img src="https://www.linkyourart.com/logo-brochure.png" width="64" height="64" alt="LinkYourArt" style="display:block;margin:0 auto 20px;width:64px;height:64px;" />
    <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:#EED75E;letter-spacing:0.25em;text-transform:uppercase;">${isFR ? 'MESSAGE DU SALON PRO' : 'PRO LOUNGE MESSAGE'}</p>
    <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">${senderName}</p>
    <p style="margin:4px 0 0;font-size:11px;color:#8B94A3;text-transform:uppercase;letter-spacing:0.1em;">${senderRole || ''}</p>
  </td></tr>

  <tr><td bgcolor="#EED75E" style="background:linear-gradient(90deg,#EED75E,#00D4E8,#7C3FBF);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#0F1621" style="background:#0F1621;border:1px solid rgba(255,255,255,0.05);border-top:none;border-bottom:none;padding:36px 40px;">
    ${subject ? `<p style="margin:0 0 16px;font-size:15px;font-weight:900;color:#ffffff;">${subject}</p>` : ''}
    <p style="margin:0;font-size:14px;color:#B4BAC6;line-height:1.7;white-space:pre-wrap;">${message}</p>
  </td></tr>

  <tr><td bgcolor="#00D4E8" style="background:linear-gradient(90deg,#00D4E8,#7C3FBF,#EED75E);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#080C10" style="background:#080C10;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,0.04);border-top:none;padding:20px 40px;text-align:center;">
    <p style="margin:0;font-size:10px;color:#5B6270;">${isFR ? 'Message envoyé depuis le Salon Pro de LinkYourArt' : 'Sent from the LinkYourArt Pro Lounge'} · linkyourart.com</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { recipientEmail, senderName, senderRole, subject, message, lang } = req.body || {};
  const isFR = lang === 'FR';

  if (!recipientEmail) {
    return res.status(400).json({ success: false, error: 'Missing recipientEmail' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Missing message' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('[LOUNGE_CONTACT_SIMULATED]', recipientEmail, subject);
    return res.status(200).json({ success: false, error: 'Email service not configured' });
  }

  const html = buildLoungeContactEmail({ senderName: senderName || 'LYA Member', senderRole, subject, message, isFR });
  const result = await sendEmail({
    to: recipientEmail,
    subject: subject ? `[LYA Pro Lounge] ${subject}` : `[LYA Pro Lounge] ${isFR ? 'Nouveau message de' : 'New message from'} ${senderName || 'LYA Member'}`,
    html,
  });

  console.log(result.ok ? `[LOUNGE_CONTACT_SENT] ✓ (${result.id})` : `[LOUNGE_CONTACT_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, error: result.ok ? undefined : result.err });
};
