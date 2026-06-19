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
  const roleColor = position === 'CREATOR' ? '#a78bfa' : position === 'INVESTOR' ? '#10b981' : '#00d4ff';

  return `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LinkYourArt</title>
</head>
<body style="margin:0;padding:0;background:linear-gradient(180deg,#ffffff,#dbeafe,#93c5fd);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">

<!-- WRAPPER -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#ffffff 0%,#dbeafe 60%,#93c5fd 100%);min-height:100vh">
<tr><td align="center" style="padding:40px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;box-shadow:0 20px 60px rgba(79,70,229,0.15);border-radius:24px">

  <!-- HERO BANNER avec dégradé -->
  <tr><td style="background:#ffffff;border-radius:24px 24px 0 0;padding:0;overflow:hidden;border:1px solid #c7d2fe;border-bottom:none;box-shadow:0 4px 24px rgba(99,102,241,0.08)">
    
    <!-- Bande supérieure cyan -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#00d4ff);height:3px;padding:0"></td></tr>
    </table>
    
    <!-- Header logo -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 40px 0">
      <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.25);border-radius:12px;padding:12px 24px;text-align:center">
          <span style="font-size:18px;font-weight:900;color:#00d4ff;letter-spacing:0.2em;display:block">LINKYOURART</span>
          <span style="font-size:8px;color:rgba(0,212,255,0.4);letter-spacing:0.1em;display:block;margin-top:3px;font-style:italic">${isFR ? 'Ce que vous créez aujourd\'hui peut appartenir à mille personnes demain.' : 'What you create today can belong to a thousand people tomorrow.'}</span>
        </td>
      </tr>
      </table>
    </td></tr>
    </table>

    <!-- Hero -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background:#ffffff;padding:44px 40px 36px;text-align:center;border-bottom:1px solid #e0f2fe">

      <!-- Icone rôle -->
      <div style="width:60px;height:60px;background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(0,212,255,0.12));border:1.5px solid rgba(99,102,241,0.25);border-radius:18px;margin:0 auto 20px;line-height:60px;font-size:26px">${roleIcon}</div>

      <!-- Prénom -->
      <h1 style="margin:0 0 8px;font-size:34px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;line-height:1">${name}</h1>

      <!-- Badge rôle -->
      <div style="margin:0 auto 20px;display:inline-block;background:rgba(0,100,200,0.08);border:1px solid rgba(0,150,220,0.25);border-radius:40px;padding:6px 20px">
        <span style="font-size:11px;font-weight:900;color:#0369a1;text-transform:uppercase;letter-spacing:0.15em">${roleLabel}</span>
      </div>

      <!-- Message -->
      <p style="margin:0;font-size:15px;color:#4c4f7a;line-height:1.8;max-width:360px;margin-left:auto;margin-right:auto">
        ${isFR
          ? "✦ Votre pré-inscription est confirmée.<br>Vous rejoignez les pionniers d'une nouvelle ère créative."
          : "✦ Your pre-registration is confirmed.<br>You are joining the pioneers of a new creative era."}
      </p>

    </td></tr>
    </table>

    <!-- CODE PARRAINAGE — section spectaculaire -->
  <tr><td style="background:linear-gradient(180deg,#eff6ff,#dbeafe);border-left:1px solid #bfdbfe;border-right:1px solid #bfdbfe;padding:0">
    
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:40px">
      
      <!-- Titre section -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:24px">
        <span style="font-size:10px;font-weight:900;color:#0369a1;text-transform:uppercase;letter-spacing:0.2em;display:block;margin-bottom:4px">${isFR ? 'Votre code de parrainage exclusif' : 'Your exclusive referral code'}</span>
        <div style="width:40px;height:2px;background:#0ea5e9;margin:8px auto 0"></div>
      </td></tr>
      </table>

      <!-- Code en grand -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 24px">
        <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9);border:none;border-radius:20px;padding:32px;display:inline-block;min-width:280px">
          
          <!-- Lumière supérieure -->
          <div style="width:60px;height:1px;background:rgba(255,255,255,0.4);margin:0 auto 20px"></div>
          
          <div style="font-size:44px;font-weight:900;color:#ffffff;font-family:Courier New,monospace;letter-spacing:0.12em;line-height:1">${referralCode}</div>
          
          <div style="width:60px;height:1px;background:rgba(255,255,255,0.4);margin:20px auto 0"></div>
        </div>
      </td></tr>
      </table>

      <!-- Explication -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <p style="margin:0;font-size:13px;color:#0369a1;line-height:1.6;text-align:center;max-width:360px">
          ${isFR
            ? '🎯 Partagez ce code — chaque filleul vous propulse plus haut dans la file d\'accès prioritaire.'
            : '🎯 Share this code — each referral moves you higher in the priority access queue.'}
        </p>
      </td></tr>
      </table>

    </td></tr>
    </table>

  </td></tr>

  <!-- CE QUI VOUS ATTEND -->
  <tr><td style="background:linear-gradient(180deg,#dbeafe,#bfdbfe);border-left:1px solid #93c5fd;border-right:1px solid #93c5fd;padding:0">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:40px">
      
      <p style="margin:0 0 28px;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;text-align:center">${isFR ? '— Ce qui vous attend —' : '— What awaits you —'}</p>

      <!-- Feature 1 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr>
        <td width="48" valign="top">
          <div style="width:40px;height:40px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);border-radius:12px;text-align:center;line-height:40px;font-size:18px">✦</div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <p style="margin:0 0 4px;font-size:14px;font-weight:900;color:#1e3a5f">${isFR ? 'LinkYourArt' : 'LinkYourArt'}</p>
          <p style="margin:0;font-size:12px;color:#1e40af;line-height:1.6">${isFR ? 'Co-possédez des projets artistiques via des LYA Units indexées. La valeur évolue selon les jalons et le LYA Score.' : 'Co-own artistic projects via indexed LYA Units. Value evolves with milestones and LYA Score.'}</p>
        </td>
      </tr>
      </table>

      <!-- Séparateur -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td style="border-top:1px solid rgba(147,197,253,0.4);font-size:0;line-height:0">&nbsp;</td></tr>
      </table>

      <!-- Feature 2 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr>
        <td width="48" valign="top">
          <div style="width:40px;height:40px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2);border-radius:12px;text-align:center;line-height:40px;font-size:18px">📈</div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <p style="margin:0 0 4px;font-size:14px;font-weight:900;color:#1e3a5f">LYA Score <span style="color:#7c3aed;font-size:12px">/1000</span></p>
          <p style="margin:0;font-size:12px;color:#1e40af;line-height:1.6">${isFR ? 'Chaque création évaluée sur 1000 points par notre réseau de validateurs certifiés. Un score transparent et souverain.' : 'Each creation rated out of 1000 by our network of certified validators. A transparent, sovereign score.'}</p>
        </td>
      </tr>
      </table>

      <!-- Séparateur -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td style="border-top:1px solid rgba(147,197,253,0.4);font-size:0;line-height:0">&nbsp;</td></tr>
      </table>

      <!-- Feature 3 -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="48" valign="top">
          <div style="width:40px;height:40px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:12px;text-align:center;line-height:40px;font-size:18px">⚡</div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <p style="margin:0 0 4px;font-size:14px;font-weight:900;color:#1e3a5f">${isFR ? 'Marché Secondaire' : 'Secondary Market'}</p>
          <p style="margin:0;font-size:12px;color:#1e40af;line-height:1.6">${isFR ? 'Échangez vos LYA Units sur le registre créatif en temps réel. L\'art comme actif vivant.' : 'Trade your LYA Units on the creative registry in real time. Art as a living asset.'}</p>
        </td>
      </tr>
      </table>

    </td></tr>
    </table>
  </td></tr>

  <!-- CTA BUTTON -->
  <tr><td style="background:linear-gradient(180deg,#bfdbfe,#93c5fd);border-left:1px solid #60a5fa;border-right:1px solid #60a5fa;padding:40px;text-align:center">
    
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
    <tr>
      <td style="background:linear-gradient(135deg,#00d4ff,#0099cc);border-radius:14px;padding:0">
        <a href="${referralLink}" style="display:block;padding:18px 48px;font-size:14px;font-weight:900;color:#030712;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;white-space:nowrap">
          ${isFR ? 'Accéder à LinkYourArt →' : 'Access LinkYourArt →'}
        </a>
      </td>
    </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#1e3a8a">${isFR ? 'Ou copiez ce lien : ' : 'Or copy this link: '}<span style="color:#00d4ff">${referralLink}</span></p>

  </td></tr>

  <!-- PHRASE SIGNATURE -->
  <tr><td style="background:linear-gradient(180deg,#93c5fd,#60a5fa);border:1px solid #3b82f6;border-top:none;border-radius:0 0 24px 24px;padding:32px 40px;text-align:center">
    
    <!-- Ligne décorative -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
    <tr>
      <td style="border-top:1px solid rgba(255,255,255,0.3)"></td>
      <td width="40" align="center" style="padding:0 12px">
        <span style="color:#0ea5e9;font-size:14px">✦</span>
      </td>
      <td style="border-top:1px solid rgba(255,255,255,0.3)"></td>
    </tr>
    </table>

    <p style="margin:0 0 24px;font-size:15px;color:#1e3a8a;font-style:italic;line-height:1.7;max-width:400px;margin-left:auto;margin-right:auto">
      "${isFR ? 'Ce que vous créez aujourd\'hui peut appartenir à mille personnes demain.' : 'What you create today can belong to a thousand people tomorrow.'}"
    </p>

    <p style="margin:0 0 4px;font-size:11px;color:#1e3a8a">LinkYourArt · contact@linkyourart.com</p>
    <p style="margin:0;font-size:10px;color:#1e40af">${isFR ? 'Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com' : 'You received this because you pre-registered on linkyourart.com'}</p>
  </td></tr>

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
