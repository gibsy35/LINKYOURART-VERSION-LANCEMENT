const net = require('net');
const tls = require('tls');

function b64(s) { return Buffer.from(s).toString('base64'); }

async function sendSMTP({ host, port, user, pass, to, subject, html }) {
  return new Promise((resolve) => {
    let sock, buf = '', step = 0, done = false, upgraded = false;
    const timer = setTimeout(() => { sock?.destroy(); resolve({ ok: false, err: 'timeout' }); }, 15000);
    const ok = () => { clearTimeout(timer); resolve({ ok: true }); };
    const fail = (e) => { clearTimeout(timer); sock?.destroy(); resolve({ ok: false, err: e }); };
    const w = (s) => sock.write(s + '\r\n');
    const mail = `From: "LinkYourArt" <${user}>\r\nTo: ${to}\r\nSubject: =?UTF-8?B?${b64(subject)}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64(html)}\r\n.`;
    
    const handle = (line) => {
      const c = parseInt(line);
      if (c >= 400) return fail(line.trim());
      if (step === 0 && c === 220) { step++; w('EHLO lya.com'); }
      else if (step === 1 && c === 250) { step++; w('STARTTLS'); }
      else if (step === 2 && c === 220) {
        step++;
        const plain = sock;
        sock = tls.connect({ socket: plain, host, rejectUnauthorized: false }, () => {
          sock.on('data', onData); w('EHLO lya.com'); upgraded = true;
        });
        sock.on('error', (e) => fail(e.message));
      }
      else if (step === 3 && c === 250) { step++; w('AUTH LOGIN'); }
      else if (step === 4 && c === 334) { step++; w(b64(user)); }
      else if (step === 5 && c === 334) { step++; w(b64(pass)); }
      else if (step === 6 && c === 235) { step++; w(`MAIL FROM:<${user}>`); }
      else if (step === 7 && c === 250) { step++; w(`RCPT TO:<${to}>`); }
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
        if (line && !line.startsWith('250-')) handle(line);
      }
    };

    sock = net.connect(port, host, () => {});
    sock.on('data', onData);
    sock.on('error', (e) => fail(e.message));
  });
}

function buildHtml(name, position, referralCode, referralLink, lang) {
  const isFR = lang === 'FR';
  const roleLabel = {
    CREATOR: isFR ? 'Créateur' : 'Creator',
    INVESTOR: isFR ? 'Mécène' : 'Patron',
    PROFESSIONAL: isFR ? 'Professionnel' : 'Professional',
  }[position] || position;

  return `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LinkYourArt</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 16px">

  <!-- HEADER -->
  <div style="text-align:center;margin-bottom:40px">
    <div style="display:inline-block;background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(167,139,250,0.1));border:1px solid rgba(0,212,255,0.3);border-radius:16px;padding:16px 32px">
      <p style="margin:0;font-size:22px;font-weight:900;color:#00d4ff;letter-spacing:0.15em;text-transform:uppercase">LINKYOURART</p>
      <p style="margin:4px 0 0;font-size:10px;color:rgba(0,212,255,0.5);letter-spacing:0.2em;text-transform:uppercase">THE CREATIVE TERMINAL</p>
    </div>
  </div>

  <!-- HERO -->
  <div style="background:linear-gradient(135deg,#0d1117,#111827);border:1px solid #1f2937;border-radius:24px;padding:40px 32px;margin-bottom:24px;text-align:center">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,rgba(0,212,255,0.2),rgba(167,139,250,0.2));border:1px solid rgba(0,212,255,0.3);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px">
      <span style="font-size:28px">✦</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#f9fafb;letter-spacing:-0.02em">
      ${isFR ? 'Bienvenue,' : 'Welcome,'} ${name}
    </h1>
    <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6">
      ${isFR
        ? 'Votre pré-inscription au Protocole LYA est confirmée.<br>Vous rejoignez les pionniers d'une nouvelle ère créative.'
        : 'Your LYA Protocol pre-registration is confirmed.<br>You are joining the pioneers of a new creative era.'}
    </p>
  </div>

  <!-- INFOS CLÉS -->
  <div style="display:grid;gap:12px;margin-bottom:24px">
    
    <!-- Profil -->
    <div style="background:#0d1117;border:1px solid #1f2937;border-radius:16px;padding:20px 24px;display:flex;align-items:center;gap:16px">
      <div style="width:40px;height:40px;background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-size:18px">${position === 'CREATOR' ? '🎨' : position === 'INVESTOR' ? '💎' : '🏛'}</span>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">${isFR ? 'Votre profil' : 'Your profile'}</p>
        <p style="margin:0;font-size:16px;font-weight:900;color:#f9fafb">${roleLabel}</p>
      </div>
    </div>

    <!-- Code parrainage -->
    <div style="background:linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,212,255,0.03));border:1px solid rgba(0,212,255,0.25);border-radius:16px;padding:24px;text-align:center">
      <p style="margin:0 0 8px;font-size:10px;color:rgba(0,212,255,0.6);text-transform:uppercase;letter-spacing:0.15em">${isFR ? 'Votre code de parrainage' : 'Your referral code'}</p>
      <p style="margin:0 0 8px;font-size:36px;font-weight:900;color:#00d4ff;font-family:monospace;letter-spacing:0.1em">${referralCode}</p>
      <p style="margin:0;font-size:12px;color:#6b7280">${isFR ? 'Partagez-le — chaque filleul vous fait monter dans la file.' : 'Share it — each referral moves you up the queue.'}</p>
    </div>
  </div>

  <!-- CE QUI VOUS ATTEND -->
  <div style="background:#0d1117;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:24px">
    <p style="margin:0 0 20px;font-size:12px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">${isFR ? 'Ce qui vous attend' : 'What awaits you'}</p>
    ${[
      isFR ? ['✦', 'Protocole LYA', 'Co-possédez des projets artistiques via des LYA Units indexées.'] : ['✦', 'LYA Protocol', 'Co-own artistic projects via indexed LYA Units.'],
      isFR ? ['📈', 'LYA Score', 'Chaque projet évalué sur 1000 points par des experts certifiés.'] : ['📈', 'LYA Score', 'Each project rated out of 1000 by certified experts.'],
      isFR ? ['⚡', 'Marché secondaire', 'Échangez vos parts sur le registre LYA en temps réel.'] : ['⚡', 'Secondary market', 'Trade your shares on the LYA registry in real time.'],
    ].map(([icon, title, desc]) => `
    <div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start">
      <span style="font-size:18px;flex-shrink:0;margin-top:2px">${icon}</span>
      <div>
        <p style="margin:0 0 2px;font-size:13px;font-weight:900;color:#f9fafb">${title}</p>
        <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">${desc}</p>
      </div>
    </div>`).join('')}
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:32px">
    <a href="${referralLink}" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0099bb);color:#030712;font-weight:900;padding:16px 40px;border-radius:14px;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.12em;box-shadow:0 0 30px rgba(0,212,255,0.25)">
      ${isFR ? 'Accéder à LinkYourArt →' : 'Access LinkYourArt →'}
    </a>
  </div>

  <!-- PHRASE SIGNATURE -->
  <div style="text-align:center;border-top:1px solid #1f2937;padding-top:24px;margin-bottom:24px">
    <p style="margin:0;font-size:14px;color:#6b7280;font-style:italic;line-height:1.6">
      "${isFR ? 'Ce que vous créez aujourd'hui peut appartenir à mille personnes demain.' : 'What you create today can belong to a thousand people tomorrow.'}"
    </p>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center">
    <p style="margin:0 0 4px;font-size:11px;color:#374151">LinkYourArt · contact@linkyourart.com</p>
    <p style="margin:0;font-size:10px;color:#1f2937">${isFR ? 'Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com' : 'You received this email because you pre-registered on linkyourart.com'}</p>
  </div>

</div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, name, position, referralCode, referralLink, lang = 'FR' } = req.body || {};

  if (!to || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('[EMAIL_SIMULATED] Variables SMTP manquantes');
    return res.status(200).json({ success: true, method: 'simulated' });
  }

  const subject = lang === 'FR'
    ? `✦ Bienvenue sur LinkYourArt — Code: ${referralCode}`
    : `✦ Welcome to LinkYourArt — Code: ${referralCode}`;

  const html = buildHtml(name, position, referralCode, referralLink, lang);

  const result = await sendSMTP({ host, port, user, pass, to, subject, html });

  if (result.ok) {
    console.log(`[EMAIL_SENT] ✓ ${to}`);
    return res.status(200).json({ success: true, method: 'smtp' });
  } else {
    console.error(`[EMAIL_ERROR] ${result.err}`);
    return res.status(200).json({ success: false, method: 'smtp', error: result.err });
  }
};
