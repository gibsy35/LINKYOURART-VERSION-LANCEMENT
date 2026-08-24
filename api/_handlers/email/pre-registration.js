const { sendEmail } = require('../resend');

// ─── EMAIL 1 : Confirmation pré-inscription ──────────────────────────────────
function buildConfirmationEmail(name, email, role, lang) {
  const isFR = lang !== 'EN';
  const roleLabel = role === 'PATRON' ? (isFR ? 'Mécène' : 'Patron')
    : role === 'PROFESSIONAL' ? (isFR ? 'Professionnel' : 'Professional')
    : (isFR ? 'Créateur' : 'Creator');

  const subject = isFR
    ? `[LYA Originals] ${name}, votre candidature est en cours d'examen`
    : `[LYA Originals] ${name}, your application is under review`;

  const html = `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LinkYourArt</title></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;min-height:100vh;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <tr><td style="text-align:center;padding-bottom:28px;">
    <p style="margin:0;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.35em;text-transform:uppercase;">✦ LINKYOURART</p>
    <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:0.2em;text-transform:uppercase;">YOUR SCORE. YOUR STANDARD.</p>
  </td></tr>

  <tr><td style="background:linear-gradient(160deg,#0F1621 0%,#0D1117 60%,#12192A 100%);border-radius:20px 20px 0 0;padding:52px 40px 44px;text-align:center;border:1px solid rgba(0,212,232,0.12);border-bottom:none;">
    <div style="margin:0 auto 32px;width:80px;height:80px;">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" stroke="#7C3FBF" stroke-width="2" stroke-dasharray="6 4" opacity="0.5"/>
        <circle cx="40" cy="40" r="26" stroke="#00D4E8" stroke-width="2.5" stroke-dasharray="8 3" opacity="0.6"/>
        <circle cx="40" cy="40" r="16" stroke="#E0326E" stroke-width="2" opacity="0.4"/>
        <circle cx="40" cy="40" r="5" fill="#ffffff" opacity="0.9"/>
      </svg>
    </div>
    <p style="margin:0 0 6px;font-size:11px;font-weight:900;color:rgba(255,255,255,0.35);letter-spacing:0.25em;text-transform:uppercase;">${isFR ? 'CANDIDATURE REÇUE' : 'APPLICATION RECEIVED'}</p>
    <p style="margin:0 0 20px;font-size:30px;font-weight:900;color:#ffffff;line-height:1.15;">${name},<br><span style="color:#00D4E8;">${isFR ? 'votre dossier est entre nos mains.' : 'your application is in our hands.'}</span></p>
    <p style="margin:0 auto;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;max-width:400px;">${isFR ? "L'équipe LYA examine chaque profil avec le plus grand soin. Nous voulons nous assurer que chaque membre partage notre vision de la certification créative." : "The LYA team reviews every profile with great care. We want to make sure every member shares our vision of creative certification."}</p>
  </td></tr>

  <tr><td style="background:linear-gradient(90deg,#7C3FBF,#00D4E8,#E0326E);height:2px;"></td></tr>

  <tr><td style="background:#0F1621;border:1px solid rgba(255,255,255,0.05);border-top:none;border-bottom:none;padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(0,212,232,0.04);border:1px solid rgba(0,212,232,0.15);border-radius:14px;margin-bottom:28px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 16px;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.2em;text-transform:uppercase;">${isFR ? 'VOTRE DOSSIER' : 'YOUR APPLICATION'}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;">${isFR ? 'Profil' : 'Profile'}</span></td><td style="padding:7px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:12px;font-weight:900;color:#ffffff;">${roleLabel}</span></td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;">Email</span></td><td style="padding:7px 0;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:12px;color:rgba(255,255,255,0.6);">${email}</span></td></tr>
          <tr><td style="padding:7px 0;"><span style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;">Statut</span></td><td style="padding:7px 0;text-align:right;"><span style="font-size:11px;font-weight:900;color:#FFD700;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:20px;padding:3px 10px;letter-spacing:0.1em;">${isFR ? '⏳ EN COURS D\'EXAMEN' : '⏳ UNDER REVIEW'}</span></td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.8;text-align:center;">${isFR ? 'Nous vous contacterons très prochainement avec notre décision.<br>En attendant, découvrez ce qui vous attend sur LYA.' : 'We will get back to you very soon with our decision.<br>In the meantime, discover what awaits you on LYA.'}</p>
    <p style="margin:0 0 12px;font-size:9px;font-weight:900;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:0.2em;text-align:center;">${isFR ? 'PRÉSENTATION OFFICIELLE' : 'OFFICIAL PRESENTATION'}</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding-right:6px;"><a href="https://linkyourart.com/LYA_Brochure_FR.html" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(0,212,232,0.2);color:#00D4E8;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;">🌐 Brochure FR</a></td>
        <td width="50%" style="padding-left:6px;"><a href="https://linkyourart.com/LYA_Brochure_EN.html" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(167,139,250,0.2);color:#a78bfa;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;">🌐 Brochure EN</a></td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:linear-gradient(90deg,#E0326E,#7C3FBF,#00D4E8);height:2px;"></td></tr>

  <tr><td style="background:#080C10;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,0.04);border-top:none;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.18);">contact@linkyourart.com · linkyourart.com</p>
    <p style="margin:0 0 4px;font-size:9px;color:rgba(255,255,255,0.1);">LINKYOURART SASU · Paris · Rennes · London</p>
    <p style="margin:8px 0 0;font-size:9px;color:rgba(255,255,255,0.08);">${isFR ? 'Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com' : 'You receive this email because you pre-registered on linkyourart.com'}</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;

  return { subject, html };
}

// ─── EMAIL 2 : Approbation — "Vous êtes sélectionné" ────────────────────────
function buildApprovalEmail(name, email, signupLink, lang) {
  const isFR = lang !== 'EN';

  const subject = isFR
    ? `[LYA Originals] ${name}, vous êtes sélectionné — votre accès est prêt`
    : `[LYA Originals] ${name}, you're selected — your access is ready`;

  const html = `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LinkYourArt</title></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;min-height:100vh;"><tr><td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <tr><td style="text-align:center;padding-bottom:28px;">
    <p style="margin:0;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.35em;text-transform:uppercase;">✦ LINKYOURART</p>
    <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:0.2em;text-transform:uppercase;">YOUR SCORE. YOUR STANDARD.</p>
  </td></tr>

  <tr><td style="background:linear-gradient(160deg,#0F1B2D 0%,#0D1117 50%,#1A0A1A 100%);border-radius:20px 20px 0 0;padding:52px 40px 44px;text-align:center;border:1px solid rgba(0,212,232,0.15);border-bottom:none;">
    <div style="margin:0 auto 28px;width:88px;height:88px;">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="44" r="40" stroke="#7C3FBF" stroke-width="1.5" opacity="0.3"/>
        <circle cx="44" cy="44" r="32" stroke="#00D4E8" stroke-width="3" stroke-dasharray="180 22" stroke-linecap="round" opacity="0.9"/>
        <circle cx="44" cy="44" r="22" stroke="#E0326E" stroke-width="1.5" opacity="0.4"/>
        <circle cx="44" cy="44" r="7" fill="#00D4E8" opacity="0.95"/>
        <circle cx="44" cy="44" r="3" fill="#ffffff"/>
      </svg>
    </div>
    <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#00D4E8;letter-spacing:0.3em;text-transform:uppercase;">LYA ORIGINALS</p>
    <p style="margin:0 0 20px;font-size:32px;font-weight:900;color:#ffffff;line-height:1.15;">${name},<br><span style="color:#00D4E8;">${isFR ? 'vous êtes sélectionné.' : "you're selected."}</span></p>
    <p style="margin:0 auto;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;max-width:400px;">${isFR ? "Votre profil a été examiné et approuvé par l'équipe LYA. Bienvenue dans le cercle des premiers membres de la certification créative." : "Your profile has been reviewed and approved by the LYA team. Welcome to the circle of the first members of creative certification."}</p>
  </td></tr>

  <tr><td style="background:linear-gradient(90deg,#00D4E8,#7C3FBF,#E0326E);height:3px;"></td></tr>

  <tr><td style="background:#0F1621;border:1px solid rgba(255,255,255,0.05);border-top:none;border-bottom:none;padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#0D1117,#1A2332);border:1.5px solid rgba(0,212,232,0.35);border-radius:16px;margin-bottom:28px;">
      <tr><td style="padding:36px;text-align:center;">
        <p style="margin:0 0 6px;font-size:9px;font-weight:900;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">${isFR ? "VOTRE ACCÈS EST PRÊT" : "YOUR ACCESS IS READY"}</p>
        <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;">${isFR ? "Cliquez ci-dessous pour créer votre compte et accéder à la plateforme." : "Click below to create your account and access the platform."}</p>
        <p style="margin:0 0 24px;font-size:11px;color:rgba(255,255,255,0.2);">${email}</p>
        <a href="${signupLink}" style="display:inline-block;background:linear-gradient(135deg,#00D4E8,#7C3FBF);color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:20px 48px;border-radius:12px;letter-spacing:0.1em;text-transform:uppercase;">✦ ${isFR ? 'ACCÉDER À LYA' : 'ACCESS LYA'}</a>
        <p style="margin:16px 0 0;font-size:9px;color:rgba(255,255,255,0.15);">${isFR ? "Ce lien est personnel et à usage unique." : "This link is personal and single-use."}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td width="33%" style="padding:0 4px 0 0;text-align:center;"><div style="background:rgba(0,212,232,0.06);border:1px solid rgba(0,212,232,0.18);border-radius:12px;padding:18px 8px;"><p style="margin:0 0 6px;font-size:20px;">◈</p><p style="margin:0 0 2px;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.1em;">SCORE LYA</p><p style="margin:0;font-size:9px;color:rgba(255,255,255,0.25);">0 — 1000</p></div></td>
        <td width="33%" style="padding:0 4px;text-align:center;"><div style="background:rgba(124,63,191,0.06);border:1px solid rgba(124,63,191,0.18);border-radius:12px;padding:18px 8px;"><p style="margin:0 0 6px;font-size:20px;">◇</p><p style="margin:0 0 2px;font-size:10px;font-weight:900;color:#7C3FBF;letter-spacing:0.1em;">REGISTRE</p><p style="margin:0;font-size:9px;color:rgba(255,255,255,0.25);">${isFR ? 'Certifié' : 'Certified'}</p></div></td>
        <td width="33%" style="padding:0 0 0 4px;text-align:center;"><div style="background:rgba(224,50,110,0.06);border:1px solid rgba(224,50,110,0.18);border-radius:12px;padding:18px 8px;"><p style="margin:0 0 6px;font-size:20px;">◆</p><p style="margin:0 0 2px;font-size:10px;font-weight:900;color:#E0326E;letter-spacing:0.1em;">${isFR ? 'MÉCÉNAT' : 'PATRONAGE'}</p><p style="margin:0;font-size:9px;color:rgba(255,255,255,0.25);">5%</p></div></td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:9px;font-weight:900;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:0.2em;text-align:center;">${isFR ? 'PRÉSENTATION OFFICIELLE' : 'OFFICIAL PRESENTATION'}</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding-right:6px;"><a href="https://linkyourart.com/LYA_Brochure_FR.html" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(0,212,232,0.2);color:#00D4E8;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;">🌐 Brochure FR</a></td>
        <td width="50%" style="padding-left:6px;"><a href="https://linkyourart.com/LYA_Brochure_EN.html" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(167,139,250,0.2);color:#a78bfa;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;">🌐 Brochure EN</a></td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:linear-gradient(90deg,#E0326E,#7C3FBF,#00D4E8);height:2px;"></td></tr>

  <tr><td style="background:#080C10;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,0.04);border-top:none;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;color:rgba(255,255,255,0.18);">contact@linkyourart.com · linkyourart.com</p>
    <p style="margin:0 0 4px;font-size:9px;color:rgba(255,255,255,0.1);">LINKYOURART SASU · Paris · Rennes · London</p>
    <p style="margin:8px 0 0;font-size:9px;color:rgba(255,255,255,0.08);">${isFR ? "Ce lien est personnel. Ne pas transférer cet email." : "This link is personal. Do not forward this email."}</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;

  return { subject, html };
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, email, role, lang = 'FR', type = 'confirmation', signupLink } = req.body || {};
  if (!to || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    let subject, html;

    if (type === 'approval') {
      // Email 2 — envoyé depuis l'Admin Hub quand tu approuves un profil
      ({ subject, html } = buildApprovalEmail(name, email || to, signupLink || `https://linkyourart.com?signup=1`, lang));
    } else {
      // Email 1 — envoyé automatiquement à la pré-inscription
      ({ subject, html } = buildConfirmationEmail(name, email || to, role || 'CREATOR', lang));
    }

    await sendEmail({ to, subject, html });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[pre-registration email]', err);
    return res.status(500).json({ error: err.message });
  }
};
