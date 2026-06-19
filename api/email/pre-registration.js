const net = require('net');
const tls = require('tls');

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
      'To: ' + cfg.to,
      'Subject: =?UTF-8?B?' + b64(cfg.subject) + '?=',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(cfg.html),
      '.'
    ].join('\r\n');

    const handle = (line) => {
      const c = parseInt(line.slice(0, 3));
      if (c >= 400) return fail(line.trim());
      if (step === 0 && c === 220) { step++; w('EHLO lya.com'); }
      else if (step === 1 && c === 250) { step++; w('STARTTLS'); }
      else if (step === 2 && c === 220 && !upgraded) {
        step++;
        const plain = sock;
        sock = tls.connect({ socket: plain, host: cfg.host, rejectUnauthorized: false }, () => {
          upgraded = true;
          sock.on('data', onData);
          w('EHLO lya.com');
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
        const line = buf.slice(0, i);
        buf = buf.slice(i + 2);
        if (line && !line.match(/^250-/)) handle(line);
      }
    };

    sock = net.connect(cfg.port, cfg.host, () => {});
    sock.on('data', onData);
    sock.on('error', fail);
  });
}

function buildHtml(name, position, referralCode, referralLink, lang) {
  const isFR = lang === 'FR';
  const roleLabel = position === 'CREATOR' ? (isFR ? 'Créateur' : 'Creator') : position === 'INVESTOR' ? (isFR ? 'Mécène' : 'Patron') : (isFR ? 'Professionnel' : 'Professional');
  const roleIcon = position === 'CREATOR' ? '🎨' : position === 'INVESTOR' ? '💎' : '🏛';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
  '<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">' +
  '<div style="max-width:600px;margin:0 auto;padding:40px 16px">' +

  '<div style="text-align:center;margin-bottom:32px">' +
  '<div style="display:inline-block;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.3);border-radius:14px;padding:14px 28px">' +
  '<p style="margin:0;font-size:20px;font-weight:900;color:#00d4ff;letter-spacing:0.15em">LINKYOURART</p>' +
  '<p style="margin:4px 0 0;font-size:9px;color:rgba(0,212,255,0.4);letter-spacing:0.2em">THE CREATIVE TERMINAL</p>' +
  '</div></div>' +

  '<div style="background:#0d1117;border:1px solid #1f2937;border-radius:20px;padding:36px;margin-bottom:20px;text-align:center">' +
  '<p style="font-size:32px;margin:0 0 16px">✦</p>' +
  '<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#f9fafb">' + (isFR ? 'Bienvenue, ' : 'Welcome, ') + name + ' !</h1>' +
  '<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7">' + (isFR ? 'Votre pré-inscription au Protocole LYA est confirmée.<br>Vous rejoignez les pionniers d\'une nouvelle ère créative.' : 'Your LYA Protocol pre-registration is confirmed.<br>You are joining the pioneers of a new creative era.') + '</p>' +
  '</div>' +

  '<div style="background:#0d1117;border:1px solid rgba(0,212,255,0.2);border-radius:16px;padding:24px;margin-bottom:20px;display:flex;align-items:center;gap:16px">' +
  '<span style="font-size:24px">' + roleIcon + '</span>' +
  '<div><p style="margin:0 0 2px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">' + (isFR ? 'Votre profil' : 'Your profile') + '</p>' +
  '<p style="margin:0;font-size:18px;font-weight:900;color:#f9fafb">' + roleLabel + '</p></div>' +
  '</div>' +

  '<div style="background:linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,212,255,0.02));border:1px solid rgba(0,212,255,0.25);border-radius:16px;padding:28px;margin-bottom:20px;text-align:center">' +
  '<p style="margin:0 0 8px;font-size:10px;color:rgba(0,212,255,0.6);text-transform:uppercase;letter-spacing:0.15em">' + (isFR ? 'Votre code de parrainage' : 'Your referral code') + '</p>' +
  '<p style="margin:0 0 12px;font-size:38px;font-weight:900;color:#00d4ff;font-family:monospace;letter-spacing:0.1em">' + referralCode + '</p>' +
  '<p style="margin:0;font-size:12px;color:#6b7280">' + (isFR ? 'Partagez-le — chaque filleul vous fait monter dans la file d\'attente.' : 'Share it — each referral moves you up the waiting list.') + '</p>' +
  '</div>' +

  '<div style="background:#0d1117;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:28px">' +
  '<p style="margin:0 0 20px;font-size:11px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">' + (isFR ? 'Ce qui vous attend' : 'What awaits you') + '</p>' +
  '<div style="display:flex;gap:12px;margin-bottom:16px"><span style="font-size:16px;flex-shrink:0">✦</span><div><p style="margin:0 0 2px;font-size:13px;font-weight:900;color:#f9fafb">' + (isFR ? 'Protocole LYA' : 'LYA Protocol') + '</p><p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">' + (isFR ? 'Co-possédez des projets artistiques via des LYA Units indexées.' : 'Co-own artistic projects via indexed LYA Units.') + '</p></div></div>' +
  '<div style="display:flex;gap:12px;margin-bottom:16px"><span style="font-size:16px;flex-shrink:0">📈</span><div><p style="margin:0 0 2px;font-size:13px;font-weight:900;color:#f9fafb">' + (isFR ? 'LYA Score' : 'LYA Score') + '</p><p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">' + (isFR ? 'Chaque projet évalué sur 1000 points par des experts certifiés.' : 'Each project rated out of 1000 by certified experts.') + '</p></div></div>' +
  '<div style="display:flex;gap:12px"><span style="font-size:16px;flex-shrink:0">⚡</span><div><p style="margin:0 0 2px;font-size:13px;font-weight:900;color:#f9fafb">' + (isFR ? 'Marché Secondaire' : 'Secondary Market') + '</p><p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">' + (isFR ? 'Échangez vos parts sur le registre LYA en temps réel.' : 'Trade your shares on the LYA registry in real time.') + '</p></div></div>' +
  '</div>' +

  '<div style="text-align:center;margin-bottom:32px">' +
  '<a href="' + referralLink + '" style="display:inline-block;background:#00d4ff;color:#030712;font-weight:900;padding:16px 40px;border-radius:14px;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.12em">' + (isFR ? 'Accéder à LinkYourArt →' : 'Access LinkYourArt →') + '</a>' +
  '</div>' +

  '<div style="text-align:center;border-top:1px solid #1f2937;padding-top:24px;margin-bottom:16px">' +
  '<p style="margin:0;font-size:13px;color:#6b7280;font-style:italic">"' + (isFR ? 'Ce que vous créez aujourd\'hui peut appartenir à mille personnes demain.' : 'What you create today can belong to a thousand people tomorrow.') + '"</p>' +
  '</div>' +

  '<div style="text-align:center">' +
  '<p style="margin:0 0 4px;font-size:11px;color:#374151">LinkYourArt · contact@linkyourart.com</p>' +
  '<p style="margin:0;font-size:10px;color:#1f2937">' + (isFR ? 'Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com' : 'You received this because you pre-registered on linkyourart.com') + '</p>' +
  '</div></div></body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const to = body.to;
    const name = body.name || 'Membre';
    const position = body.position || 'CREATOR';
    const referralCode = body.referralCode || 'LYA-000';
    const referralLink = body.referralLink || 'https://linkyourart.com';
    const lang = body.lang || 'FR';

    if (!to) return res.status(400).json({ error: 'Missing email' });

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log('[EMAIL_SIMULATED] To:', to);
      return res.status(200).json({ success: true, method: 'simulated' });
    }

    const subject = lang === 'FR'
      ? '✦ Bienvenue sur LinkYourArt — Code: ' + referralCode
      : '✦ Welcome to LinkYourArt — Code: ' + referralCode;

    const html = buildHtml(name, position, referralCode, referralLink, lang);
    const result = await sendSMTP({ host, port, user, pass, to, subject, html });

    if (result.ok) {
      console.log('[EMAIL_SENT] ✓', to);
      return res.status(200).json({ success: true, method: 'smtp' });
    } else {
      console.error('[EMAIL_ERROR]', result.err);
      return res.status(200).json({ success: false, method: 'smtp', error: result.err });
    }
  } catch (e) {
    console.error('[EMAIL_CRASH]', e.message);
    return res.status(200).json({ success: false, error: e.message });
  }
};
