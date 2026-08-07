const net = require('net');
const tls = require('tls');
const crypto = require('crypto');

function b64(s) { return Buffer.from(s).toString('base64'); }

async function sendSMTP(cfg) {
  return new Promise((resolve) => {
    let sock, buf = '', step = 0, upgraded = false;
    const timer = setTimeout(() => { try { sock.destroy(); } catch(e){} resolve({ ok: false, err: 'timeout' }); }, 15000);
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
      '',
      b64(cfg.html),
      '.'
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

function buildApprovalEmail(name, accessUrl, lang) {
  const isFR = lang === 'FR';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:linear-gradient(135deg,#dbeafe,#ede9fe);font-family:-apple-system,BlinkMacSystemFont,sans-serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#e8f4fd;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,100,200,0.12)">' +

  '<tr><td style="background:linear-gradient(90deg,#0ea5e9,#6366f1);height:4px;padding:0;font-size:0">&nbsp;</td></tr>' +

  '<tr><td style="background:linear-gradient(135deg,#f0f9ff,#dbeafe);padding:48px 40px">' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px">' +
  '<div style="display:inline-block;background:rgba(255,255,255,0.7);border:1px solid rgba(14,165,233,0.3);border-radius:12px;padding:12px 28px">' +
  '<span style="font-size:18px;font-weight:900;color:#0284c7;letter-spacing:0.2em;display:block">LINKYOURART</span>' +
  '<span style="font-size:9px;color:#0284c7;opacity:0.6;letter-spacing:0.1em;font-style:italic;display:block;margin-top:3px">"' + (isFR ? "Ce que vous créez aujourd'hui peut appartenir à mille personnes demain." : "What you create today can belong to a thousand people tomorrow.") + '"</span>' +
  '</div></td></tr></table>' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:8px">' +
  '<div style="width:64px;height:64px;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(0,212,255,0.2));border:2px solid rgba(16,185,129,0.4);border-radius:20px;display:inline-block;line-height:64px;font-size:28px">✦</div>' +
  '</td></tr></table>' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px">' +
  '<h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#0c4a6e">' + (isFR ? 'Félicitations, ' : 'Congratulations, ') + name + ' !</h1>' +
  '<p style="margin:0 0 8px;font-size:16px;color:#0369a1;font-weight:700">' + (isFR ? 'Votre accès LinkYourArt est approuvé.' : 'Your LinkYourArt access has been approved.') + '</p>' +
  '<p style="margin:0;font-size:14px;color:#075985;line-height:1.7">' + (isFR ? 'Vous avez été personnellement sélectionné pour rejoindre les pionniers de LinkYourArt. Cliquez sur le bouton ci-dessous pour créer votre compte.' : 'You have been personally selected to join the LinkYourArt pioneers. Click the button below to create your account.') + '</p>' +
  '</td></tr></table>' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px">' +
  '<a href="' + accessUrl + '" style="display:inline-block;background:linear-gradient(135deg,#10b981,#0ea5e9);color:#ffffff;font-weight:900;padding:18px 48px;border-radius:14px;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.12em">' +
  (isFR ? 'Créer mon compte LinkYourArt →' : 'Create my LinkYourArt account →') +
  '</a>' +
  '</td></tr></table>' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:24px">' +
  '<div style="background:rgba(255,255,255,0.5);border:1px solid rgba(14,165,233,0.2);border-radius:12px;padding:16px;display:inline-block">' +
  '<p style="margin:0 0 4px;font-size:10px;color:#0369a1;text-transform:uppercase;letter-spacing:0.1em;font-weight:900">' + (isFR ? '⚠ Lien à usage unique' : '⚠ Single-use link') + '</p>' +
  '<p style="margin:0;font-size:11px;color:#0369a1;font-family:monospace">' + accessUrl + '</p>' +
  '<p style="margin:4px 0 0;font-size:10px;color:#0369a1;opacity:0.6">' + (isFR ? 'Ne partagez pas ce lien' : 'Do not share this link') + '</p>' +
  '</div>' +
  '</td></tr></table>' +

  '<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid rgba(14,165,233,0.2);padding-top:24px;text-align:center">' +
  '<p style="margin:0 0 16px;font-size:13px;color:#0369a1;font-style:italic">"' + (isFR ? "Ce que vous créez aujourd'hui peut appartenir à mille personnes demain." : "What you create today can belong to a thousand people tomorrow.") + '"</p>' +
  '<p style="margin:0;font-size:11px;color:#7dd3fc">LinkYourArt · contact@linkyourart.com</p>' +
  '</td></tr></table>' +

  '</td></tr>' +
  '<tr><td style="background:linear-gradient(90deg,#0ea5e9,#6366f1);height:4px;padding:0;font-size:0">&nbsp;</td></tr>' +
  '</table></td></tr></table></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, token, lang = 'FR' } = req.body || {};
  if (!to || !name || !token) return res.status(400).json({ error: 'Missing fields' });

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const baseUrl = process.env.VITE_APP_URL || 'https://linkyourart.com';

  const accessUrl = `${baseUrl}?access=${token}`;
  const isFR = lang === 'FR';
  const subject = isFR
    ? `✦ Votre accès LinkYourArt est approuvé — ${name}`
    : `✦ Your LinkYourArt access is approved — ${name}`;

  if (!host || !user || !pass) {
    console.log('[APPROVE_SIMULATED]', to, accessUrl);
    return res.status(200).json({ success: true, method: 'simulated', accessUrl });
  }

  const html = buildApprovalEmail(name, accessUrl, lang);
  const result = await sendSMTP({ host, port, user, pass, to, subject, html });

  console.log(result.ok ? `[APPROVE_SENT] ✓ ${to}` : `[APPROVE_ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'smtp', error: result.err, accessUrl });
};
