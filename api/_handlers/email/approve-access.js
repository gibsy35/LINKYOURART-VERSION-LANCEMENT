const { sendEmail } = require('../resend');

// NOTE: ce handler n'est actuellement appelé nulle part dans l'app — le
// flux d'approbation réel passe par pre-registration.js (type: 'approval'),
// déclenché depuis l'Admin Hub. Conservé et remis aux couleurs de la marque
// par sécurité, au cas où il serait réutilisé, mais probablement mort.
function buildApprovalEmail(name, accessUrl, lang) {
  const isFR = lang === 'FR';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <tr><td bgcolor="#0F1621" style="background:linear-gradient(160deg,#0F1621 0%,#0D1117 60%,#12192A 100%);border-radius:20px 20px 0 0;padding:52px 40px 44px;text-align:center;border:1px solid #0b2e36;border-bottom:none;">
    <img src="https://www.linkyourart.com/logo-brochure.png" width="72" height="72" alt="LinkYourArt" style="display:block;margin:0 auto 24px;width:72px;height:72px;" />
    <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:#00D4E8;letter-spacing:0.3em;text-transform:uppercase;">${isFR ? 'ACCÈS APPROUVÉ' : 'ACCESS APPROVED'}</p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">${isFR ? 'Félicitations,' : 'Congratulations,'} ${name}${isFR ? ' !' : '!'}</p>
    <p style="margin:0 auto;font-size:13px;color:#B4BAC6;line-height:1.7;max-width:400px;">${isFR ? 'Vous avez été personnellement sélectionné pour rejoindre les pionniers de LinkYourArt.' : 'You have been personally selected to join the LinkYourArt pioneers.'}</p>
  </td></tr>

  <tr><td bgcolor="#7C3FBF" style="background:linear-gradient(90deg,#00D4E8,#7C3FBF,#E0326E);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#0F1621" style="background:#0F1621;border:1px solid #191d23;border-top:none;border-bottom:none;padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151d2e;background:linear-gradient(135deg,#0D1117,#1A2332);border:1.5px solid rgba(0,212,232,0.3);border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:32px;text-align:center;">
        <p style="margin:0 0 20px;font-size:13px;color:#B4BAC6;line-height:1.6;">${isFR ? 'Cliquez ci-dessous pour créer votre compte et accéder à la plateforme.' : 'Click below to create your account and access the platform.'}</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr><td bgcolor="#00D4E8" style="background:#00D4E8;background:linear-gradient(135deg,#00D4E8,#7C3FBF);border-radius:12px;">
            <a href="${accessUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:18px 44px;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isFR ? 'CRÉER MON COMPTE' : 'CREATE MY ACCOUNT'}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#14181e;border:1px solid #20242a;border-radius:12px;margin-bottom:8px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:10px;color:#00D4E8;text-transform:uppercase;letter-spacing:0.1em;font-weight:900;">${isFR ? '⚠ Lien à usage unique' : '⚠ Single-use link'}</p>
        <p style="margin:0;font-size:11px;color:#828C9B;font-family:monospace;word-break:break-all;">${accessUrl}</p>
        <p style="margin:4px 0 0;font-size:10px;color:#6F7686;">${isFR ? 'Ne partagez pas ce lien.' : 'Do not share this link.'}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="#00D4E8" style="background:linear-gradient(90deg,#00D4E8,#7C3FBF,#E0326E);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#080C10" style="background:#080C10;border-radius:0 0 20px 20px;border:1px solid #171b20;border-top:none;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;color:#5B6270;">contact@linkyourart.com · linkyourart.com</p>
    <p style="margin:0;font-size:9px;color:#4B5260;">LINKYOURART SASU · Paris · Rennes · London</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, token, lang = 'FR' } = req.body || {};
  if (!to || !name || !token) return res.status(400).json({ error: 'Missing fields' });

  const baseUrl = process.env.VITE_APP_URL || 'https://linkyourart.com';

  const accessUrl = `${baseUrl}?access=${token}`;
  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ Votre accès LinkYourArt est approuvé — ${name}`
    : `✦ Your LinkYourArt access is approved — ${name}`;

  if (!process.env.RESEND_API_KEY) {
    console.log('[APPROVE_SIMULATED]', to, accessUrl);
    return res.status(200).json({ success: true, method: 'simulated', accessUrl });
  }

  const html = buildApprovalEmail(name, accessUrl, lang);
  const result = await sendEmail({ to, subject, html });

  console.log(result.ok ? `[APPROVE_SENT] ✓ ${to} (${result.id})` : `[APPROVE_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'resend', error: result.err, accessUrl });
};
