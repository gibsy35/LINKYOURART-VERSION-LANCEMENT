const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { sendEmail } = require('../resend');

// Meme pattern d'initialisation que api/counter.js (identifiants deja
// configures en variables d'environnement Vercel, rien a ajouter).
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (initErr) {
  console.error('[PASSWORD_RESET] Firebase Admin init failed:', initErr.message);
}

function buildResetEmail(resetLink, lang) {
  const isFR = lang === 'FR';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">' +

  // Header sombre
  '<tr><td style="background:#0d1117;padding:40px">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td width="40" valign="middle"><img src="https://www.linkyourart.com/logo-brochure.png" width="36" height="36" alt="LinkYourArt" style="display:block;width:36px;height:36px" /></td>' +
  '<td valign="middle"><span style="font-size:18px;font-weight:900;color:white;letter-spacing:0.15em">LINKYOURART</span></td>' +
  '</tr></table>' +
  '</td></tr>' +

  // Gradient band
  '<tr><td bgcolor="#00d4ff" style="background:#00d4ff;background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +

  // Corps blanc
  '<tr><td style="background:#ffffff;padding:48px 40px">' +

  '<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#0d1117">' +
  (isFR ? 'Réinitialisez votre mot de passe' : 'Reset your password') + '</h1>' +
  '<p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.7">' +
  (isFR
    ? 'Vous avez demandé la réinitialisation de votre mot de passe LinkYourArt. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.'
    : 'You requested to reset your LinkYourArt password. Click the button below to choose a new one.') +
  '</p>' +

  '<div style="text-align:center;margin:40px 0">' +
  '<a href="' + resetLink + '" style="display:inline-block;background:#0d1117;color:white;font-weight:900;padding:16px 48px;border-radius:12px;text-decoration:none;font-size:13px;text-transform:uppercase;letter-spacing:0.1em">' +
  (isFR ? 'Choisir un nouveau mot de passe →' : 'Choose a new password →') + '</a>' +
  '</div>' +

  '<p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.7">' +
  (isFR
    ? "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail — votre mot de passe restera inchangé. Ce lien expire dans 1 heure."
    : "If you didn't request this, simply ignore this email — your password will remain unchanged. This link expires in 1 hour.") +
  '</p>' +

  '</td></tr>' +

  // Footer sombre
  '<tr><td style="background:#0d1117;padding:24px 40px">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
  '<td><p style="margin:0;font-size:11px;color:#9CA3AF">LinkYourArt · contact@linkyourart.com</p>' +
  '<p style="margin:4px 0 0;font-size:10px;color:#6B7280;font-style:italic">' +
  (isFR ? 'Vous recevez cet e-mail suite à une demande de réinitialisation sur linkyourart.com' : 'You are receiving this email following a password reset request on linkyourart.com') +
  '</p></td>' +
  '<td align="right"><span style="font-size:14px;font-weight:900;color:#00d4ff">✦ LYA</span></td>' +
  '</tr></table>' +
  '</td></tr>' +

  '<tr><td bgcolor="#00d4ff" style="background:#00d4ff;background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);height:3px;font-size:0">&nbsp;</td></tr>' +
  '</table></td></tr></table></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, lang = 'FR' } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Missing email' });

  const isFR = lang === 'FR';
  const subject = isFR
    ? '✦ Réinitialisation de votre mot de passe LinkYourArt'
    : '✦ Reset your LinkYourArt password';

  try {
    const actionCodeSettings = {
      url: 'https://www.linkyourart.com',
      handleCodeInApp: false,
    };
    const resetLink = await getAuth().generatePasswordResetLink(to, actionCodeSettings);

    if (!process.env.RESEND_API_KEY) {
      console.log('[PASSWORD_RESET_SIMULATED]', to, resetLink);
      return res.status(200).json({ success: true, method: 'simulated' });
    }

    const html = buildResetEmail(resetLink, lang);
    const result = await sendEmail({ to, subject, html });

    console.log(result.ok ? `[PASSWORD_RESET_SENT] ✓ ${to} (${result.id})` : `[PASSWORD_RESET_ERROR] ${result.err}`);
    return res.status(200).json({ success: result.ok, method: 'resend', error: result.err });
  } catch (err) {
    // Ne jamais reveler si l'email existe ou non (enumeration de comptes) -
    // on repond toujours succes cote client, meme si generatePasswordResetLink
    // echoue parce que l'email n'a pas de compte associe.
    console.warn('[PASSWORD_RESET] generatePasswordResetLink failed:', err.code || err.message);
    return res.status(200).json({ success: true, method: 'no-op' });
  }
};
