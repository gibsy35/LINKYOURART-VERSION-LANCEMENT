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

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0D1117;min-height:100vh">
    <tr><td align="center" style="padding:40px 16px">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto">

        <!-- HEADER -->
        <tr><td style="text-align:center;padding-bottom:32px">
          <p style="margin:0;font-size:11px;font-weight:900;color:#00D4E8;letter-spacing:0.3em;text-transform:uppercase">✦ LINKYOURART</p>
          <p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.15em;text-transform:uppercase">YOUR SCORE. YOUR STANDARD.</p>
        </td></tr>

        <!-- HERO -->
        <tr><td style="background:linear-gradient(135deg,#0f1621,#1a2332);border:1px solid rgba(0,212,232,0.2);border-radius:16px;padding:40px 32px;text-align:center;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2">${isFR ? `Bienvenue,` : `Welcome,`}</p>
          <p style="margin:0 0 24px;font-size:28px;font-weight:900;color:#00D4E8;line-height:1.2">${name}</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;max-width:380px;margin:0 auto">
            ${isFR
              ? 'Votre pré-inscription à LinkYourArt est confirmée. Vous faites partie des LYA Originals.'
              : 'Your LinkYourArt pre-registration is confirmed. You are part of the LYA Originals.'}
          </p>
        </td></tr>

        <tr><td style="height:24px"></td></tr>

        <!-- CODE D'ACCÈS UNIQUE -->
        <tr><td style="background:linear-gradient(135deg,#0d1117,#1a2332);border:1.5px solid ${isFounding ? 'rgba(245,200,66,0.5)' : 'rgba(0,212,232,0.4)'};border-radius:16px;padding:32px;text-align:center">
          <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.2em">
            ${isFR ? "VOTRE CODE D'ACCÈS PERSONNEL" : 'YOUR PERSONAL ACCESS CODE'}
          </p>
          <p style="margin:0 0 4px;font-size:36px;font-weight:900;color:${isFounding ? '#f5c842' : '#00D4E8'};font-family:'Courier New',Courier,monospace;letter-spacing:0.1em">
            ${accessKey || ''}
          </p>
          <p style="margin:0 0 24px;font-size:10px;color:rgba(255,255,255,0.25);">
            ${isFR ? "Code unique — ne pas partager" : 'Unique code — do not share'}
          </p>
          <a href="https://linkyourart.com?signup=1&code=${encodeURIComponent(accessKey || '')}"
             style="display:inline-block;background:#00D4E8;color:#0D1117;text-decoration:none;font-size:13px;font-weight:900;padding:16px 36px;border-radius:10px;letter-spacing:0.08em;text-transform:uppercase">
            ${isFR ? '✦ CRÉER MON COMPTE LYA' : '✦ CREATE MY LYA ACCOUNT'}
          </a>
          <p style="margin:14px 0 0;font-size:10px;color:rgba(255,255,255,0.2);">
            ${isFR ? "Le bouton ci-dessus pré-remplit votre code automatiquement." : 'The button above pre-fills your code automatically.'}
          </p>
        </td></tr>

        <tr><td style="height:24px"></td></tr>

        <!-- BROCHURES -->
        <tr><td style="background:#0f1621;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px">
          <p style="margin:0 0 14px;font-size:10px;font-weight:900;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.2em;text-align:center">
            ${isFR ? 'PRÉSENTATION OFFICIELLE' : 'OFFICIAL PRESENTATION'}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" style="padding-right:8px">
                <a href="https://linkyourart.com/LYA_Brochure_FR.html"
                   style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(0,212,232,0.25);color:#00D4E8;text-decoration:none;font-size:12px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.06em">
                  🌐 Brochure FR
                </a>
              </td>
              <td width="50%" style="padding-left:8px">
                <a href="https://linkyourart.com/LYA_Brochure_EN.html"
                   style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1px solid rgba(167,139,250,0.25);color:#a78bfa;text-decoration:none;font-size:12px;font-weight:900;padding:14px;border-radius:10px;text-align:center;letter-spacing:0.06em">
                  🌐 Brochure EN
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="height:32px"></td></tr>

        <!-- FOOTER -->
        <tr><td style="text-align:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.2)">contact@linkyourart.com · linkyourart.com</p>
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.12)">
            ${isFR
              ? "Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com"
              : 'You receive this email because you pre-registered on linkyourart.com'}
          </p>
          <p style="margin:8px 0 0;font-size:10px;color:rgba(255,255,255,0.12)">
            LINKYOURART SASU · Paris · Rennes · London
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
