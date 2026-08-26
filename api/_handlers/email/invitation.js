const { sendEmail } = require('../resend');

// ─── EMAIL : Invitation envoyée par un membre depuis son profil ─────────────
// Distincte de pre-registration.js (candidature) et welcome.js (bienvenue
// post-inscription) : celle-ci part d'un membre déjà actif (Créateur, Mécène
// ou Professionnel) qui transmet son invitation exclusive à une personne de
// confiance. Le/la destinataire choisit librement son propre rôle au moment
// de l'inscription — le code ne le présuppose pas.

function roleLabel(role, isFR) {
  const labels = {
    CREATOR: isFR ? 'Créateur' : 'Creator',
    PATRON: isFR ? 'Mécène' : 'Patron',
    PROFESSIONAL: isFR ? 'Professionnel' : 'Professional',
  };
  return labels[role] || (isFR ? 'Membre' : 'Member');
}

function buildInvitationEmail({ fromName, fromRole, code, message, lang }) {
  const isFR = lang !== 'EN';
  const signupUrl = `https://www.linkyourart.com/signup?code=${code}`;
  const senderRole = roleLabel(fromRole, isFR);

  const subject = isFR
    ? `${fromName} vous invite à rejoindre LYA`
    : `${fromName} invites you to join LYA`;

  const html = `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LinkYourArt</title></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;min-height:100vh;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <tr><td style="text-align:center;padding-bottom:28px;">
    <p style="margin:0;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.35em;text-transform:uppercase;">✦ LINKYOURART</p>
    <p style="margin:4px 0 0;font-size:9px;color:#7B8291;letter-spacing:0.2em;text-transform:uppercase;">YOUR SCORE. YOUR STANDARD.</p>
  </td></tr>

  <tr><td bgcolor="#0F1621" style="background:linear-gradient(160deg,#0F1621 0%,#0D1117 60%,#12192A 100%);border-radius:20px 20px 0 0;padding:52px 40px 44px;text-align:center;border:1px solid #2d1624;border-bottom:none;">
    <img src="https://www.linkyourart.com/logo-brochure.png" width="72" height="72" alt="LinkYourArt" style="display:block;margin:0 auto 24px;width:72px;height:72px;" />
    <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:#93A0AC;letter-spacing:0.25em;text-transform:uppercase;">${isFR ? 'INVITATION PERSONNELLE' : 'PERSONAL INVITATION'}</p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">${isFR ? 'Vous êtes' : "You're"} <span style="color:#E0326E;">${isFR ? 'invité·e' : 'invited'}</span> ${isFR ? 'sur LYA' : 'to LYA'}</p>
    <p style="margin:0 auto;font-size:13px;color:#B4BAC6;line-height:1.7;max-width:400px;">${isFR
      ? `<strong style="color:#fff;">${fromName}</strong> (${senderRole} sur LYA) vous transmet une invitation exclusive à rejoindre la plateforme de certification et de mécénat créatif.`
      : `<strong style="color:#fff;">${fromName}</strong> (${senderRole} on LYA) is passing you an exclusive invitation to join the creative certification and patronage platform.`
    }</p>
  </td></tr>

  <tr><td bgcolor="#7C3FBF" style="background:linear-gradient(90deg,#E0326E,#7C3FBF,#00D4E8);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#0F1621" style="background:#0F1621;border:1px solid #191d23;border-top:none;border-bottom:none;padding:40px;">

    ${message ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#14181e;border-left:2px solid #E0326E;border-radius:0 12px 12px 0;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 6px;font-size:9px;font-weight:900;color:#8B94A3;letter-spacing:0.15em;text-transform:uppercase;">${isFR ? `Message de ${fromName}` : `Message from ${fromName}`}</p>
        <p style="margin:0;font-size:13px;color:#C9CDD6;line-height:1.6;font-style:italic;">"${message}"</p>
      </td></tr>
    </table>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151d2e;background:linear-gradient(135deg,#0D1117,#1A2332);border:1.5px solid rgba(224,50,110,0.3);margin-bottom:28px;">
      <tr><td style="padding:32px;text-align:center;">
        <p style="margin:0 0 6px;font-size:9px;font-weight:900;color:#8B94A3;letter-spacing:0.25em;text-transform:uppercase;">${isFR ? 'Votre code d\u2019accès' : 'Your access code'}</p>
        <p style="margin:0 0 22px;font-size:26px;font-weight:900;color:#E0326E;letter-spacing:0.12em;">${code}</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr><td bgcolor="#E0326E" style="background:#E0326E;background:linear-gradient(135deg,#E0326E,#7C3FBF);border-radius:12px;">
            <a href="${signupUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:13px;font-weight:900;padding:18px 44px;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isFR ? 'REJOINDRE LYA' : 'JOIN LYA'}</a>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;font-size:9px;color:#7B8291;">${isFR ? 'Vous choisirez votre profil — Créateur, Mécène ou Professionnel — lors de l\u2019inscription.' : 'You\u2019ll choose your profile — Creator, Patron or Professional — during signup.'}</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:11px;text-align:center;color:#7B8291;">${isFR ? 'Ce code est personnel et à usage unique.' : 'This code is personal and single-use.'}</p>
  </td></tr>

  <tr><td bgcolor="#00D4E8" style="background:linear-gradient(90deg,#00D4E8,#7C3FBF,#E0326E);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td bgcolor="#080C10" style="background:#080C10;border-radius:0 0 20px 20px;border:1px solid #171b20;border-top:none;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;color:#767D8C;">contact@linkyourart.com · linkyourart.com</p>
    <p style="margin:0 0 4px;font-size:9px;color:#5B6270;">LINKYOURART SASU · Paris · Rennes · London</p>
    <p style="margin:8px 0 0;font-size:9px;color:#565D6B;">${isFR ? `Vous recevez cet email car ${fromName} vous a invité·e sur linkyourart.com` : `You are receiving this email because ${fromName} invited you on linkyourart.com`}</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;

  return { subject, html };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, fromName, fromRole = 'CREATOR', code, message, lang = 'FR' } = req.body || {};
  if (!to || !fromName || !code) return res.status(400).json({ error: 'Missing required fields' });

  if (!process.env.RESEND_API_KEY) {
    console.log('[INVITATION_SIMULATED]', to, code);
    return res.status(200).json({ success: true, method: 'simulated' });
  }

  try {
    const { subject, html } = buildInvitationEmail({ fromName, fromRole, code, message, lang });
    const result = await sendEmail({ to, subject, html });
    console.log(result.ok ? `[INVITATION_SENT] ✓ ${to} (${result.id})` : `[INVITATION_ERROR] ${result.err}`);
    return res.status(200).json({ success: result.ok, method: 'resend', error: result.err });
  } catch (err) {
    console.error('[invitation email]', err);
    return res.status(500).json({ error: err.message });
  }
};
