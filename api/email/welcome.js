const net = require('net');
const tls = require('tls');

function b64(s) { return Buffer.from(s).toString('base64'); }

async function sendSMTP(cfg) {
  return new Promise((resolve) => {
    let sock, buf = '', step = 0, upgraded = false;
    const timer = setTimeout(() => { try { sock.destroy(); } catch(e){} resolve({ ok: false }); }, 15000);
    const ok = () => { clearTimeout(timer); resolve({ ok: true }); };
    const fail = (e) => { clearTimeout(timer); try { sock.destroy(); } catch(ex){} resolve({ ok: false, err: String(e) }); };
    const w = (s) => { try { sock.write(s + '\r\n'); } catch(e){ fail(e); } };
    const mail = [
      'From: "LinkYourArt" <' + cfg.user + '>',
      'Reply-To: contact@linkyourart.com',
      'To: ' + cfg.to,
      'Subject: =?UTF-8?B?' + b64(cfg.subject) + '?=',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      'X-Priority: 3',
      'X-MSMail-Priority: Normal',
      'Importance: Normal',
      'Message-ID: <' + Date.now() + '-lya@linkyourart.com>',
      'List-Unsubscribe: <mailto:contact@linkyourart.com?subject=unsubscribe>',
      '', b64(cfg.html), '.'
    ].join('\r\n');
    const handle = (line) => {
      const c = parseInt(line.slice(0, 3));
      if (c >= 400) return fail(line.trim());
      if (step === 0 && c === 220) { step++; w('EHLO linkyourart.com'); }
      else if (step === 1 && c === 250) { step++; w('STARTTLS'); }
      else if (step === 2 && c === 220 && !upgraded) {
        step++;
        const plain = sock;
        sock = tls.connect({ socket: plain, host: cfg.host, rejectUnauthorized: false }, () => {
          upgraded = true; sock.on('data', onData); w('EHLO linkyourart.com');
        });
        sock.on('error', fail);
      }
      else if (step === 3 && c === 250) { step++; w('AUTH LOGIN'); }
      else if (step === 4 && c === 334) { step++; w(b64(cfg.user)); }
      else if (step === 5 && c === 334) { step++; w(b64(cfg.pass)); }
      else if (step === 6 && c === 235) { step++; w('MAIL FROM:<' + cfg.user + '>'); }
      else if (step === 7 && c === 250) { step++; w('RCPT TO:<' + cfg.to + '>'); }
      else if (step === 8 && c === 250) { step++; w('DATA'); }
      else if (step === 9 && c === 354) { step++; sock.write(mail + '\r\n'); }
      else if (step === 10 && c === 250) { step++; w('QUIT'); }
      else if (step === 11 && c === 221) ok();
    };
    const onData = (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\r\n')) !== -1) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (line && !line.match(/^250-/)) handle(line);
      }
    };
    sock = net.connect(cfg.port, cfg.host, () => {});
    sock.on('data', onData);
    sock.on('error', fail);
  });
}

function buildWelcomeEmail(name, role, lang) {
  const isFR = lang === 'FR';
  
  const roleLabel = {
    CREATOR: isFR ? 'Créateur' : 'Creator',
    INVESTOR: isFR ? 'Mécène' : 'Patron',
    PROFESSIONAL: isFR ? 'Professionnel' : 'Professional',
  }[role] || (isFR ? 'Membre' : 'Member');

  const roleDesc = {
    CREATOR: isFR 
      ? 'Votre espace créateur est prêt. Soumettez votre premier projet et obtenez votre LYA Score.'
      : 'Your creator space is ready. Submit your first project and get your LYA Score.',
    INVESTOR: isFR
      ? 'Votre espace mécène est prêt. Découvrez les projets créatifs disponibles sur l\'Exchange LYA.'
      : 'Your patron space is ready. Discover creative projects available on the LYA Exchange.',
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

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ Bienvenue sur LinkYourArt, ${name} !`
    : `✦ Welcome to LinkYourArt, ${name}!`;

  if (!host || !user || !pass) {
    console.log('[WELCOME_SIMULATED]', to);
    return res.status(200).json({ success: true, method: 'simulated' });
  }

  const html = buildWelcomeEmail(name, role, lang);
  const result = await sendSMTP({ host, port, user, pass, to, subject, html });

  console.log(result.ok ? `[WELCOME_SENT] ✓ ${to}` : `[WELCOME_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'smtp', error: result.err });
};
