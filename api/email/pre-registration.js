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
  return `<!DOCTYPE html><html><body style="margin:0;background:#030712;font-family:sans-serif">
<div style="max-width:600px;margin:0 auto;padding:32px 16px">
<div style="text-align:center;margin-bottom:24px">
<p style="font-size:20px;font-weight:900;color:#00d4ff;letter-spacing:0.1em">LINKYOURART</p>
</div>
<div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px">
<h1 style="font-size:24px;font-weight:900;color:#f9fafb;margin:0 0 8px">${isFR ? 'Bienvenue' : 'Welcome'}, ${name} !</h1>
<p style="color:#9ca3af;margin:0 0 24px">${isFR ? 'Votre pré-inscription LinkYourArt est confirmée.' : 'Your LinkYourArt pre-registration is confirmed.'}</p>
<div style="background:#0d1117;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
<p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">${isFR ? 'Votre code de parrainage' : 'Your referral code'}</p>
<p style="font-size:28px;font-weight:900;color:#00d4ff;font-family:monospace;margin:0">${referralCode}</p>
</div>
<p style="color:#9ca3af;font-size:14px;margin:0 0 16px">${isFR ? 'Profil' : 'Profile'}: <strong style="color:#f9fafb">${position}</strong></p>
<div style="text-align:center;margin-top:24px">
<a href="${referralLink}" style="display:inline-block;background:#00d4ff;color:#030712;font-weight:900;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.1em">${isFR ? 'Accéder à LinkYourArt' : 'Access LinkYourArt'}</a>
</div>
</div>
<p style="text-align:center;color:#374151;font-size:12px;margin-top:24px;font-style:italic">"${isFR ? 'Ce que vous créez aujourd\'hui peut appartenir à mille personnes demain.' : 'What you create today can belong to a thousand people tomorrow.'}"</p>
</div></body></html>`;
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
