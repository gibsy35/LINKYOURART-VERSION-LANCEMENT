const https = require('https');

function generateReferralCode(name) {
  const prefix = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'LYA-' + prefix + '-' + suffix;
}

function buildEmailHtml(name, position, referralCode, referralLink, lang) {
  const isFR = lang === 'FR';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LinkYourArt</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="600" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
  <tr><td style="background:#0d1117;padding:0;height:5px;background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842)"></td></tr>
  <tr><td style="background:#0d1117;padding:40px 48px">
    <p style="margin:0;font-size:20px;font-weight:900;color:#fff;letter-spacing:0.15em">LINKYOURART</p>
    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.4)">${isFR ? 'Le terminal créatif' : 'The creative terminal'}</p>
  </td></tr>
  <tr><td style="background:#0d1117;padding:0 48px 48px;text-align:center">
    <p style="font-size:32px;font-weight:900;color:#fff;margin:0 0 12px">${isFR ? `Bienvenue, ${name} !` : `Welcome, ${name}!`}</p>
    <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;margin:0">${isFR ? 'Votre pré-inscription LYA Originals est confirmée.' : 'Your LYA Originals pre-registration is confirmed.'}</p>
  </td></tr>
  <tr><td style="padding:40px 48px">
    <table width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px"><tr><td style="padding:24px">
      <p style="margin:0 0 16px;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em">${isFR ? 'Votre statut' : 'Your status'}</p>
      <p style="margin:0 0 6px;font-size:15px;font-weight:900;color:#0d1117">✓ ${isFR ? 'Sur la liste LYA Originals' : 'On the LYA Originals list'}</p>
      <p style="margin:0;font-size:13px;color:#64748b">${isFR ? 'Notre équipe vous contactera personnellement pour vous ouvrir les portes.' : 'Our team will personally contact you to open the doors.'}</p>
    </td></tr></table>
    <table width="100%" style="background:#0d1117;border-radius:12px;margin-bottom:28px"><tr><td style="padding:28px;text-align:center">
      <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.12em">${isFR ? 'Votre code parrainage' : 'Your referral code'}</p>
      <p style="margin:0;font-size:36px;font-weight:900;color:#00d4ff;font-family:monospace;letter-spacing:0.08em">${referralCode}</p>
    </td></tr></table>
    <table width="100%"><tr><td align="center">
      <a href="${referralLink}" style="display:inline-block;background:#0d1117;color:#fff;text-decoration:none;font-size:14px;font-weight:900;padding:16px 48px;border-radius:10px;letter-spacing:0.06em;text-transform:uppercase">${isFR ? 'Découvrir LinkYourArt →' : 'Discover LinkYourArt →'}</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#0d1117;padding:24px 48px">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3)">contact@linkyourart.com · linkyourart.com</p>
  </td></tr>
  <tr><td style="height:4px;background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842)"></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendViaResend(apiKey, to, subject, html) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      from: 'LinkYourArt <contact@linkyourart.com>',
      to: [to],
      subject,
      html,
    });
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ ok: res.statusCode < 300, err: parsed.message || null });
        } catch { resolve({ ok: false, err: data }); }
      });
    });
    req.on('error', e => resolve({ ok: false, err: e.message }));
    req.write(body);
    req.end();
  });
}

async function sendViaSmtp(host, port, user, pass, to, subject, html) {
  const net = require('net');
  const tls = require('tls');
  const b64 = s => Buffer.from(s).toString('base64');
  return new Promise((resolve) => {
    let sock, buf = '', step = 0, upgraded = false;
    const timer = setTimeout(() => { try { sock.destroy(); } catch(e){} resolve({ ok: false, err: 'timeout' }); }, 12000);
    const ok = () => { clearTimeout(timer); resolve({ ok: true }); };
    const fail = (e) => { clearTimeout(timer); try { sock.destroy(); } catch(ex){} resolve({ ok: false, err: String(e) }); };
    const w = (s) => { try { sock.write(s + '\r\n'); } catch(e){ fail(e); } };
    const mail = ['From: "LinkYourArt" <' + user + '>', 'Reply-To: contact@linkyourart.com', 'To: ' + to,
      'Subject: =?UTF-8?B?' + b64(subject) + '?=', 'MIME-Version: 1.0', 'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64', 'Message-ID: <' + Date.now() + '@linkyourart.com>',
      '', b64(html), '.'].join('\r\n');
    const handle = (line) => {
      const c = parseInt(line.slice(0, 3));
      if (c >= 400) return fail(line.trim());
      if (step === 0 && c === 220) { step++; w('EHLO linkyourart.com'); }
      else if (step === 1 && c === 250) { step++; w('STARTTLS'); }
      else if (step === 2 && c === 220 && !upgraded) {
        step++; const plain = sock;
        sock = tls.connect({ socket: plain, host, rejectUnauthorized: false }, () => {
          upgraded = true; sock.on('data', onData); w('EHLO linkyourart.com');
        }); sock.on('error', fail);
      }
      else if (step === 3 && c === 250) { step++; w('AUTH LOGIN'); }
      else if (step === 4 && c === 334) { step++; w(b64(user)); }
      else if (step === 5 && c === 334) { step++; w(b64(pass)); }
      else if (step === 6 && c === 235) { step++; w('MAIL FROM:<' + user + '>'); }
      else if (step === 7 && c === 250) { step++; w('RCPT TO:<' + to + '>'); }
      else if (step === 8 && c === 250) { step++; w('DATA'); }
      else if (step === 9 && c === 354) { step++; sock.write(mail + '\r\n'); }
      else if (step === 10 && c === 250) { step++; w('QUIT'); }
      else if (step === 11 && c === 221) ok();
    };
    const onData = (d) => { buf += d.toString(); let i; while ((i = buf.indexOf('\r\n')) !== -1) { const line = buf.slice(0, i); buf = buf.slice(i + 2); if (line && !line.match(/^250-/)) handle(line); } };
    sock = net.connect(port, host, () => {}); sock.on('data', onData); sock.on('error', fail);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, position, referralCode, referralLink, lang = 'FR' } = req.body || {};
  if (!to || !name) return res.status(400).json({ error: 'Missing required fields' });

  const code = referralCode || generateReferralCode(name);
  const link = referralLink || 'https://linkyourart.com';
  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ ${name}, votre place LYA Originals est confirmée`
    : `✦ ${name}, your LYA Originals place is confirmed`;
  const html = buildEmailHtml(name, position || 1, code, link, lang);

  // Essai 1 — Resend (moderne, fiable, pas bloqué par Vercel)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const r = await sendViaResend(resendKey, to, subject, html);
    if (r.ok) { console.log('[PRE_REG RESEND OK]', to); return res.json({ success: true, method: 'resend' }); }
    console.warn('[PRE_REG RESEND FAIL]', r.err);
  }

  // Essai 2 — SMTP OVH
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const r = await sendViaSmtp(host, port, user, pass, to, subject, html);
    if (r.ok) { console.log('[PRE_REG SMTP OK]', to); return res.json({ success: true, method: 'smtp' }); }
    console.error('[PRE_REG SMTP FAIL]', r.err);
    return res.json({ success: false, method: 'smtp', error: r.err });
  }

  // Fallback — simulé (pas de config)
  console.log('[PRE_REG SIMULATED - NO CONFIG]', to);
  return res.json({ success: true, method: 'simulated', subject });
};
