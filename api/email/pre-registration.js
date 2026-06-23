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

  return `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e0f0ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e0f0ff">
<tr><td align="center" style="padding:40px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#e8f4fd;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,100,200,0.12)">

  <!-- BANDE TOP -->
  <tr><td style="background:linear-gradient(90deg,#0ea5e9,#6366f1);height:4px;padding:0;font-size:0;line-height:0">&nbsp;</td></tr>

  <!-- TOUT LE CONTENU SUR FOND BLEU UNIFORME -->
  <tr><td style="background:linear-gradient(180deg,#f0f9ff 0%,#dbeafe 100%);padding:48px 40px">

    <!-- LOGO -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding-bottom:40px">
      <div style="display:inline-block;background:rgba(255,255,255,0.7);border:1px solid rgba(14,165,233,0.3);border-radius:12px;padding:12px 28px">
        <span style="font-size:18px;font-weight:900;color:#0284c7;letter-spacing:0.2em;display:block">LINKYOURART</span>
        <span style="font-size:9px;color:#0284c7;opacity:0.6;letter-spacing:0.1em;font-style:italic;display:block;margin-top:3px">"${isFR ? "Ce que vous créez aujourd'hui peut appartenir à mille personnes demain." : "What you create today can belong to a thousand people tomorrow."}"</span>
      </div>
    </td></tr>
    </table>

    <!-- BONJOUR + NOM -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding-bottom:8px">
      <p style="margin:0;font-size:15px;color:#0369a1;font-weight:600;text-transform:uppercase;letter-spacing:0.12em">${isFR ? 'Bienvenue' : 'Welcome'}</p>
    </td></tr>
    <tr><td align="center" style="padding-bottom:8px">
      <h1 style="margin:0;font-size:40px;font-weight:900;color:#0c4a6e;letter-spacing:-0.02em;line-height:1">${name}</h1>
    </td></tr>
    <tr><td align="center" style="padding-bottom:36px">
      <span style="display:inline-block;background:rgba(255,255,255,0.6);border:1px solid rgba(14,165,233,0.25);border-radius:30px;padding:5px 18px;font-size:11px;font-weight:900;color:#0369a1;text-transform:uppercase;letter-spacing:0.12em">${roleLabel}</span>
    </td></tr>
    </table>

    <!-- MESSAGE -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding-bottom:40px">
      <p style="margin:0;font-size:15px;color:#075985;line-height:1.8;max-width:400px;text-align:center">
        ${isFR ? "Votre demande d'accès est bien enregistrée. Vous êtes sur la liste VIP LinkYourArt." : "Your access request has been registered. You are on the LinkYourArt VIP waitlist."}
      </p>
    </td></tr>
    </table>

    <!-- PROCESSUS VIP -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding-bottom:30px">
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:20px 24px">
        <p style="margin:0 0 12px;font-size:10px;font-weight:900;color:#059669;text-transform:uppercase;letter-spacing:0.15em">${isFR ? '✦ Processus d\'accès VIP' : '✦ VIP Access Process'}</p>
        ${[
          [isFR ? '01 — Liste d\'attente' : '01 — Waitlist', isFR ? 'Votre demande est enregistrée. Vous êtes dans la file VIP.' : 'Your request is registered. You are in the VIP queue.', true],
          [isFR ? '02 — Approbation' : '02 — Approval', isFR ? 'Notre équipe examine votre profil et vous sélectionne personnellement.' : 'Our team reviews your profile and personally selects you.', false],
          [isFR ? '03 — Accès' : '03 — Access', isFR ? 'Vous recevez un lien d\'accès unique valable 48h pour créer votre compte.' : 'You receive a unique 48h access link to create your account.', false],
        ].map(([step, desc, active]) => `
          <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px">
            <span style="width:28px;height:28px;background:${active ? '#059669' : 'rgba(255,255,255,0.4)'};color:${active ? 'white' : '#6b7280'};border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0;border:1px solid ${active ? '#059669' : 'rgba(0,0,0,0.08)'}">✓</span>
            <div>
              <p style="margin:0 0 2px;font-size:11px;font-weight:900;color:${active ? '#065f46' : '#374151'}">${step}</p>
              <p style="margin:0;font-size:11px;color:${active ? '#047857' : '#6b7280'};line-height:1.5">${desc}</p>
            </div>
          </div>`).join('')}
      </div>
    </td></tr>
    </table>

    <!-- CODE PARRAINAGE -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding-bottom:40px">
      <div style="background:rgba(255,255,255,0.55);border:1px solid rgba(14,165,233,0.2);border-radius:16px;padding:28px;text-align:center">
        <p style="margin:0 0 6px;font-size:10px;font-weight:900;color:#0369a1;text-transform:uppercase;letter-spacing:0.18em">${isFR ? 'Votre code de parrainage' : 'Your referral code'}</p>
        <p style="margin:0 0 10px;font-size:42px;font-weight:900;color:#0284c7;font-family:'Courier New',monospace;letter-spacing:0.1em">${referralCode}</p>
        <p style="margin:0;font-size:12px;color:#0369a1">${isFR ? "Partagez-le — chaque filleul vous propulse plus haut dans la file d'accès." : "Share it — each referral moves you higher in the priority queue."}</p>
      </div>
    </td></tr>
    </table>

    <!-- FEATURES -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px">
    <tr><td align="center" style="padding-bottom:20px">
      <p style="margin:0;font-size:10px;font-weight:900;color:#0369a1;text-transform:uppercase;letter-spacing:0.15em">${isFR ? '— Ce que vous allez débloquer —' : '— What you will unlock —'}</p>
    </td></tr>
    ${[
      ['✦', isFR ? 'LYA Score' : 'LYA Score', isFR ? 'Chaque création évaluée sur 1000 points par des experts certifiés.' : 'Each creation rated out of 1000 by certified experts.'],
      ['◈', isFR ? 'LYA Units' : 'LYA Units', isFR ? 'Co-possédez des projets artistiques. La valeur évolue avec les jalons.' : 'Co-own artistic projects. Value evolves with milestones.'],
      ['⚡', isFR ? 'Marché créatif' : 'Creative Market', isFR ? "Échangez vos parts sur le registre LYA en temps réel." : 'Trade your shares on the LYA registry in real time.'],
    ].map(([icon, title, desc]) => `
    <tr><td style="padding-bottom:16px">
      <div style="background:rgba(255,255,255,0.45);border:1px solid rgba(14,165,233,0.15);border-radius:12px;padding:16px 20px;display:flex">
        <span style="font-size:20px;margin-right:14px;flex-shrink:0">${icon}</span>
        <div>
          <p style="margin:0 0 3px;font-size:13px;font-weight:900;color:#0c4a6e">${title}</p>
          <p style="margin:0;font-size:12px;color:#075985;line-height:1.5">${desc}</p>
        </div>
      </div>
    </td></tr>`).join('')}
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding-bottom:40px">
      <a href="${referralLink}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#ffffff;font-weight:900;padding:16px 44px;border-radius:12px;text-decoration:none;font-size:14px;text-transform:uppercase;letter-spacing:0.12em">
        ${isFR ? 'Découvrir LinkYourArt →' : 'Discover LinkYourArt →'}
      </a>
    </td></tr>
    </table>

    <!-- SIGNATURE -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="border-top:1px solid rgba(14,165,233,0.2);padding-top:28px">
      <p style="margin:0 0 16px;font-size:13px;color:#0369a1;font-style:italic;line-height:1.7">
        "${isFR ? "Ce que vous créez aujourd'hui peut appartenir à mille personnes demain." : "What you create today can belong to a thousand people tomorrow."}"
      </p>
      <p style="margin:0;font-size:11px;color:#7dd3fc">LinkYourArt · contact@linkyourart.com</p>
    </td></tr>
    </table>

  </td></tr>

  <!-- BANDE BOTTOM -->
  <tr><td style="background:linear-gradient(90deg,#0ea5e9,#6366f1);height:4px;padding:0;font-size:0;line-height:0">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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
    const lang = (body.lang && body.lang === 'FR') ? 'FR' : 'EN';

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
      return res.status(200).json({ success: true, method: 'lya' });
    } else {
      console.error('[EMAIL_ERROR]', result.err);
      return res.status(200).json({ success: false, method: 'smtp', error: result.err });
    }
  } catch (e) {
    console.error('[EMAIL_CRASH]', e.message);
    return res.status(200).json({ success: false, error: e.message });
  }
};
