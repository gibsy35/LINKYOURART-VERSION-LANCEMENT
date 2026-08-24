const { sendEmail } = require('../resend');

function generateReferralCode(name) {
  const prefix = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'LYA-' + prefix + '-' + suffix;
}

function buildEmail(name, position, referralCode, referralLink, lang, tier, accessKey) {
  const isFR = lang === 'FR';
  const isInstant = tier === 'FOUNDING_PIONEER' || tier === 'ORIGINAL';
  const isFounding = tier === 'FOUNDING_PIONEER';

  const subject = isFR
    ? (isInstant
        ? `[LYA Originals] ${name}, votre accès est prêt`
        : `[LYA Originals] ${name}, votre inscription est confirmée`)
    : (isInstant
        ? `[LYA Originals] ${name}, your access is ready`
        : `[LYA Originals] ${name}, your registration is confirmed`);

  const html = `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isFR ? 'Bienvenue sur LinkYourArt' : 'Welcome to LinkYourArt'}</title>
</head>
<body style="margin:0;padding:0;background-color:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D1117;">
<tr><td align="center" style="padding:32px 16px 48px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin:0 auto;">

  <!-- ── HERO HEADER with LYA arcs ── -->
  <tr><td style="background:linear-gradient(135deg,#0D1117 0%,#0F1B2D 100%);border-radius:20px 20px 0 0;padding:48px 40px 40px;text-align:center;position:relative;overflow:hidden;">

    <!-- Decorative arc lines via borders -->
    <div style="position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;border:12px solid rgba(124,63,191,0.25);pointer-events:none;"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;border:6px solid rgba(0,212,232,0.2);pointer-events:none;"></div>
    <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;border:4px solid rgba(224,50,110,0.2);pointer-events:none;"></div>
    <div style="position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;border-radius:50%;border:8px solid rgba(0,212,232,0.12);pointer-events:none;"></div>

    <!-- LYA Logo text -->
    <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#00D4E8;letter-spacing:0.35em;text-transform:uppercase;">✦ LINKYOURART</p>
    <p style="margin:0 0 32px;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:0.2em;text-transform:uppercase;">YOUR SCORE. YOUR STANDARD.</p>

    <!-- Welcome text -->
    <p style="margin:0;font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.15em;">
      ${isFR ? 'BIENVENUE DANS LES' : 'WELCOME TO THE'}
    </p>
    <p style="margin:4px 0 16px;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.01em;line-height:1.1;">
      LYA <span style="color:#00D4E8;">ORIGINALS</span>
    </p>
    <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;max-width:380px;margin:0 auto;">
      ${name}${isFR
        ? ', votre pré-inscription est confirmée. Vous faites partie des premiers membres de LinkYourArt.'
        : ', your pre-registration is confirmed. You are among the first members of LinkYourArt.'}
    </p>

  </td></tr>

  <!-- ── CYAN SEPARATOR LINE ── -->
  <tr><td style="background:linear-gradient(90deg,#7C3FBF,#00D4E8,#E0326E);height:2px;"></td></tr>

  <!-- ── ACCESS CODE BLOCK ── -->
  <tr><td style="background:#0F1621;border-left:1px solid rgba(0,212,232,0.15);border-right:1px solid rgba(0,212,232,0.15);padding:40px;">

    <!-- Code card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background:linear-gradient(135deg,#0D1117,#1A2332);border:1.5px solid ${isFounding ? 'rgba(255,215,0,0.5)' : 'rgba(0,212,232,0.4)'};border-radius:16px;margin-bottom:28px;">
      <tr><td style="padding:32px;text-align:center;">
        <p style="margin:0 0 6px;font-size:9px;font-weight:900;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.25em;">
          ${isFR ? "VOTRE CODE D'ACCÈS PERSONNEL" : "YOUR PERSONAL ACCESS CODE"}
        </p>
        <p style="margin:0 0 4px;font-size:38px;font-weight:900;letter-spacing:0.1em;font-family:'Courier New',Courier,monospace;color:${isFounding ? '#FFD700' : '#00D4E8'};">
          ${accessKey || ''}
        </p>
        <p style="margin:0 0 28px;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:0.1em;">
          ${isFR ? "CODE UNIQUE — NE PAS PARTAGER" : "UNIQUE CODE — DO NOT SHARE"}
        </p>
        <!-- CTA Button -->
        <a href="https://linkyourart.com?signup=1&code=${encodeURIComponent(accessKey || '')}"
           style="display:inline-block;background:linear-gradient(135deg,#00D4E8,#7C3FBF);color:#ffffff;text-decoration:none;font-size:13px;font-weight:900;padding:18px 40px;border-radius:12px;letter-spacing:0.1em;text-transform:uppercase;">
          ${isFR ? '✦ CRÉER MON COMPTE LYA' : '✦ CREATE MY LYA ACCOUNT'}
        </a>
        <p style="margin:14px 0 0;font-size:9px;color:rgba(255,255,255,0.18);letter-spacing:0.05em;">
          ${isFR ? "Le bouton pré-remplit votre code automatiquement" : "Button pre-fills your code automatically"}
        </p>
      </td></tr>
    </table>

    <!-- Features pills -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td width="33%" style="padding:0 4px 8px 0;text-align:center;">
          <div style="background:rgba(0,212,232,0.08);border:1px solid rgba(0,212,232,0.2);border-radius:10px;padding:12px 8px;">
            <p style="margin:0 0 2px;font-size:16px;">◈</p>
            <p style="margin:0;font-size:10px;font-weight:900;color:#00D4E8;text-transform:uppercase;letter-spacing:0.1em;">${isFR ? 'Score LYA' : 'LYA Score'}</p>
            <p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.3);">0 — 1000</p>
          </div>
        </td>
        <td width="33%" style="padding:0 4px 8px;text-align:center;">
          <div style="background:rgba(124,63,191,0.08);border:1px solid rgba(124,63,191,0.2);border-radius:10px;padding:12px 8px;">
            <p style="margin:0 0 2px;font-size:16px;">◇</p>
            <p style="margin:0;font-size:10px;font-weight:900;color:#7C3FBF;text-transform:uppercase;letter-spacing:0.1em;">${isFR ? 'Registre' : 'Registry'}</p>
            <p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.3);">${isFR ? 'Certifié' : 'Certified'}</p>
          </div>
        </td>
        <td width="33%" style="padding:0 0 8px 4px;text-align:center;">
          <div style="background:rgba(224,50,110,0.08);border:1px solid rgba(224,50,110,0.2);border-radius:10px;padding:12px 8px;">
            <p style="margin:0 0 2px;font-size:16px;">◆</p>
            <p style="margin:0;font-size:10px;font-weight:900;color:#E0326E;text-transform:uppercase;letter-spacing:0.1em;">${isFR ? 'Mécénat' : 'Patronage'}</p>
            <p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.3);">5%</p>
          </div>
        </td>
      </tr>
    </table>

  </td></tr>

  <!-- ── BROCHURES ── -->
  <tr><td style="background:#0D1117;border-left:1px solid rgba(0,212,232,0.15);border-right:1px solid rgba(0,212,232,0.15);padding:0 40px 32px;">
    <p style="margin:0 0 14px;font-size:9px;font-weight:900;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.2em;text-align:center;">
      ${isFR ? 'PRÉSENTATION OFFICIELLE' : 'OFFICIAL PRESENTATION'}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding-right:6px;">
          <a href="https://linkyourart.com/LYA_Brochure_FR.html"
             style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(0,212,232,0.25);color:#00D4E8;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;text-transform:uppercase;">
            🌐 Brochure FR
          </a>
        </td>
        <td width="50%" style="padding-left:6px;">
          <a href="https://linkyourart.com/LYA_Brochure_EN.html"
             style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(167,139,250,0.25);color:#a78bfa;text-decoration:none;font-size:11px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.08em;text-transform:uppercase;">
            🌐 Brochure EN
          </a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ── CYAN SEPARATOR ── -->
  <tr><td style="background:linear-gradient(90deg,#E0326E,#7C3FBF,#00D4E8);height:2px;"></td></tr>

  <!-- ── FOOTER ── -->
  <tr><td style="background:#080C10;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.2);letter-spacing:0.1em;">
      contact@linkyourart.com · linkyourart.com
    </p>
    <p style="margin:0 0 4px;font-size:9px;color:rgba(255,255,255,0.12);">
      LINKYOURART SASU · Paris · Rennes · London
    </p>
    <p style="margin:8px 0 0;font-size:9px;color:rgba(255,255,255,0.1);">
      ${isFR
        ? "Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com"
        : "You receive this email because you pre-registered on linkyourart.com"}
    </p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;

  return { subject, html };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, position, referralCode, referralLink, lang = 'FR', tier, accessKey } = req.body || {};
  if (!to || !name) return res.status(400).json({ error: 'Missing required fields: to, name' });

  const code = referralCode || generateReferralCode(name);
  const link = referralLink || 'https://linkyourart.com';

  const { subject, html } = buildEmail(name, position || 1, code, link, lang, tier, accessKey);

  if (!process.env.RESEND_API_KEY) {
    console.log('[PRE_REG SIMULATED]', to, subject);
    return res.status(200).json({ success: true, method: 'simulated', subject });
  }

  const result = await sendEmail({ to, subject, html });
  console.log(result.ok ? `[PRE_REG SENT] ✓ ${to} (${result.id})` : `[PRE_REG ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'resend', error: result.err });
};
