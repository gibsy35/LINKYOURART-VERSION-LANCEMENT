const { sendEmail } = require('../resend');


function buildWelcomeEmail(name, role, lang) {
  const isFR = lang === 'FR';
  
  const roleLabel = {
    CREATOR: isFR ? 'Créateur' : 'Creator',
    PATRON: isFR ? 'Mécène' : 'Patron',
    PROFESSIONAL: isFR ? 'Professionnel' : 'Professional',
  }[role] || (isFR ? 'Membre' : 'Member');

  const roleDesc = {
    CREATOR: isFR 
      ? 'Votre espace créateur est prêt. Soumettez votre premier projet et obtenez votre LYA Score.'
      : 'Your creator space is ready. Submit your first project and get your LYA Score.',
    PATRON: isFR
      ? 'Votre espace mécène est prêt. Découvrez les projets créatifs certifiés sur le Registre LYA.'
      : 'Your patron space is ready. Discover certified creative projects on the LYA Registry.',
    PROFESSIONAL: isFR
      ? 'Votre espace professionnel est prêt. Accédez au hub de validation et au Lounge Pro.'
      : 'Your professional space is ready. Access the validation hub and Pro Lounge.',
  }[role] || (isFR ? 'Votre espace est prêt.' : 'Your space is ready.');

  const nextSteps = isFR ? [
    { step: '01', text: 'Complétez votre profil LYA' },
    { step: '02', text: 'Explorez les projets créatifs sur l\'Exchange' },
    { step: '03', text: 'Rejoignez la Communauté LYA' },
  ] : [
    { step: '01', text: 'Complete your LYA profile' },
    { step: '02', text: 'Explore creative projects on the Exchange' },
    { step: '03', text: 'Join the LYA Community' },
  ];

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">' +

  // Header sombre
  '<tr><td style="background:#0d1117;padding:40px">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td><span style="font-size:20px;font-weight:900;color:white;letter-spacing:0.2em">LINKYOURART</span></td>' +
  '<td align="right"><span style="font-size:10px;font-weight:900;color:#00d4ff;text-transform:uppercase;letter-spacing:0.15em;border:1px solid rgba(0,212,255,0.3);padding:4px 12px;border-radius:20px">★ ' + roleLabel + '</span></td>' +
  '</tr></table>' +
  '</td></tr>' +

  // Gradient band
  '<tr><td style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +

  // Corps blanc
  '<tr><td style="background:#ffffff;padding:48px 40px">' +

  // Salutation
  '<h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#0d1117">' +
  (isFR ? 'Bienvenue, ' : 'Welcome, ') + name + ' !</h1>' +
  '<p style="margin:0 0 32px;font-size:14px;color:#6b7280;font-style:italic">' +
  '"' + (isFR ? "Ce que vous créez aujourd'hui peut appartenir à mille personnes demain." : "What you create today can belong to a thousand people tomorrow.") + '"</p>' +

  // Message principal
  '<div style="background:#f8fafc;border-left:3px solid #00d4ff;padding:20px 24px;border-radius:0 12px 12px 0;margin-bottom:32px">' +
  '<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0d1117">' + roleDesc + '</p>' +
  '<p style="margin:0;font-size:12px;color:#6b7280;line-height:1.7">' +
  (isFR 
    ? 'Vous faites maintenant partie des pionniers LinkYourArt — un cercle exclusif de créateurs, mécènes et professionnels qui réinventent l\'économie créative.'
    : 'You are now part of the LinkYourArt pioneers — an exclusive circle of creators, patrons and professionals reinventing the creative economy.') +
  '</p></div>' +

  // Prochaines étapes
  '<p style="margin:0 0 16px;font-size:10px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em">' +
  (isFR ? 'Vos prochaines étapes' : 'Your next steps') + '</p>' +
  nextSteps.map(s => 
    '<div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:12px">' +
    '<span style="width:32px;height:32px;background:#0d1117;color:#00d4ff;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;line-height:32px;text-align:center">' + s.step + '</span>' +
    '<p style="margin:6px 0 0;font-size:13px;color:#374151;font-weight:600">' + s.text + '</p>' +
    '</div>'
  ).join('') +

  // CTA
  '<div style="text-align:center;margin:40px 0">' +
  '<a href="https://linkyourart.com" style="display:inline-block;background:#0d1117;color:white;font-weight:900;padding:16px 48px;border-radius:12px;text-decoration:none;font-size:13px;text-transform:uppercase;letter-spacing:0.1em">' +
  (isFR ? 'Accéder à mon espace →' : 'Access my space →') + '</a>' +
  '</div>' +

  '</td></tr>' +

  // Footer sombre
  '<tr><td style="background:#0d1117;padding:24px 40px">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3)">LinkYourArt · contact@linkyourart.com</p>' +
  '<p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.15);font-style:italic">' +
  (isFR ? 'Vous recevez cet email car vous avez créé un compte sur linkyourart.com' : 'You are receiving this email because you created an account on linkyourart.com') +
  '</p></td>' +
  '<td align="right"><span style="font-size:14px;font-weight:900;color:#00d4ff">✦ LYA</span></td>' +
  '</tr></table>' +
  '</td></tr>' +

  '<tr><td style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +
  '</table></td></tr></table></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, role = 'CREATOR', lang = 'FR' } = req.body || {};
  if (!to || !name) return res.status(400).json({ error: 'Missing fields' });

  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ Bienvenue sur LinkYourArt, ${name} !`
    : `✦ Welcome to LinkYourArt, ${name}!`;

  if (!process.env.RESEND_API_KEY) {
    console.log('[WELCOME_SIMULATED]', to);
    return res.status(200).json({ success: true, method: 'simulated' });
  }

  const html = buildWelcomeEmail(name, role, lang);
  const result = await sendEmail({ to, subject, html });

  console.log(result.ok ? `[WELCOME_SENT] ✓ ${to} (${result.id})` : `[WELCOME_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'resend', error: result.err });
};
