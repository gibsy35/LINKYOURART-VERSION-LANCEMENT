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
      'Reply-To: contact@linkyourart.com',
      'To: ' + cfg.to,
      'Subject: =?UTF-8?B?' + b64(cfg.subject) + '?=',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      'X-Mailer: LinkYourArt-Mailer-1.0',
      'X-Priority: 3',
      'X-MSMail-Priority: Normal',
      'Importance: Normal',
      'Message-ID: <lya-' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '@linkyourart.com>',
      'Date: ' + new Date().toUTCString(),
      'List-Unsubscribe: <mailto:contact@linkyourart.com?subject=unsubscribe>',
      'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
      'Precedence: bulk',
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

function generateReferralCode(name) {
  const prefix = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'LYA-' + prefix + '-' + suffix;
}

function buildEmail(name, position, referralCode, referralLink, lang, tier, accessKey) {
  const isFR = lang === 'FR';
  const isInstant = tier === 'FOUNDING_PIONEER' || tier === 'ORIGINAL';
  const isFounding = tier === 'FOUNDING_PIONEER';

  const subject = isFR
    ? (isInstant
        ? `[LYA Originals] ${name}, votre accès est prêt`
        : `[LYA Originals] ${name}, votre inscription est confirmée`)
    : (isInstant
        ? `[LYA Originals] ${name}, your access is ready`
        : `[LYA Originals] ${name}, your registration is confirmed`);

  const html = `<!DOCTYPE html>
<html lang="${isFR ? 'fr' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${isFR ? 'Bienvenue sur LinkYourArt' : 'Welcome to LinkYourArt'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">

<!-- Preheader text (anti-spam + preview) -->
<div style="display:none;max-height:0;overflow:hidden;color:#f4f6f9">
  ${isFR
    ? (isInstant
        ? `${name}, votre accès LYA Originals est accordé — votre clé est prête, aucune attente.`
        : `${name}, votre demande d'accès LYA Originals LinkYourArt est bien enregistrée.`)
    : (isInstant
        ? `${name}, your LYA Originals access is granted — your key is ready, no waiting.`
        : `${name}, your LinkYourArt LYA Originals access request is registered.`)
  }
&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9">
<tr><td align="center" style="padding:40px 16px">

<!-- CARTE PRINCIPALE -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.10)">

  <!-- BANDE TOP GRADIENT -->
  <tr><td style="background:linear-gradient(90deg,#0d1117 0%,#1a2332 40%,#0d1117 100%);padding:0;height:6px;font-size:0">&nbsp;</td></tr>

  <!-- HEADER SOMBRE -->
  <tr><td style="background:linear-gradient(135deg,#0d1117 0%,#111827 100%);padding:40px 48px 36px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.18em;text-transform:uppercase">LINKYOURART</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.35);font-style:italic;letter-spacing:0.02em">
            "${isFR ? "Ce que vous certifiez aujourd'hui peut inspirer des milliers de personnes demain." : "What you certify today can inspire thousands of people tomorrow."}"
          </p>
        </td>
        <td align="right" style="vertical-align:top">
          <span style="display:inline-block;background:rgba(245,200,66,0.12);border:1px solid rgba(245,200,66,0.35);border-radius:30px;padding:7px 16px;font-size:11px;font-weight:900;color:#f5c842;text-transform:uppercase;letter-spacing:0.12em;white-space:nowrap">✦ ${isFounding ? (isFR ? 'FOUNDING PIONEER' : 'FOUNDING PIONEER') : 'LYA ORIGINALS'}</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO -->
  <tr><td style="background:linear-gradient(135deg,#0d1117 0%,#1a2332 60%,#0f1923 100%);padding:0 48px 56px;text-align:center">
    <div style="display:inline-block;width:72px;height:72px;background:rgba(245,200,66,0.10);border:1.5px solid rgba(245,200,66,0.30);border-radius:18px;line-height:72px;font-size:32px;margin-bottom:28px;color:#f5c842">✦</div>
    <h1 style="margin:0 0 12px;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.15">
      ${isFR ? `Bienvenue,<br>${name} !` : `Welcome,<br>${name}!`}
    </h1>
    <p style="margin:0;font-size:17px;color:rgba(255,255,255,0.55);line-height:1.6;max-width:420px;margin:0 auto">
      ${isFR
        ? (isInstant
            ? 'Votre accès LYA Originals est accordé, immédiatement — sans revue manuelle. Vous rejoignez un cercle exclusif de créateurs, mécènes et professionnels visionnaires.'
            : 'Votre demande d\'accès LYA Originals a été enregistrée avec succès. Vous rejoignez un cercle exclusif de créateurs, mécènes et professionnels visionnaires.')
        : (isInstant
            ? 'Your LYA Originals access is granted, immediately — no manual review. You are joining an exclusive circle of visionary creators, patrons and professionals.'
            : 'Your LYA Originals access request has been successfully registered. You are joining an exclusive circle of visionary creators, patrons and professionals.')
      }
    </p>
  </td></tr>

  <!-- CORPS BLANC -->
  <tr><td style="background:#ffffff;padding:48px">

    <!-- STATUT ACTUEL -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px">
      <tr>
        <td style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:16px;padding:28px 32px">
          <p style="margin:0 0 20px;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em">
            ${isFR ? '— Votre statut LYA Originals —' : '— Your status —'}
          </p>

          <!-- ÉTAPE 1 : ACTIF -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${isInstant ? '0' : '16px'}">
            <tr>
              <td style="width:44px;vertical-align:top">
                <div style="width:40px;height:40px;background:#0d1117;border-radius:10px;text-align:center;line-height:40px;font-size:16px;color:#00d4ff">✓</div>
              </td>
              <td style="padding-left:16px;vertical-align:top">
                <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#0d1117">${isFR ? '01 — Sur la liste LYA Originals' : '01 — On the LYA Originals'}</p>
                <p style="margin:0;font-size:13px;color:#475569;line-height:1.5">${isFR ? 'Votre demande est confirmée. Vous êtes dans la file prioritaire.' : 'Your request is confirmed. You are in the priority queue.'}</p>
              </td>
            </tr>
          </table>

          ${isInstant ? `
          <!-- ÉTAPE 2 : ACCÈS ACCORDÉ (INSTANTANÉ) -->
          <div style="margin-left:20px;border-left:2px solid #00d4ff;padding-left:36px;margin-top:16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:44px;vertical-align:top">
                <div style="width:40px;height:40px;background:#0d1117;border-radius:10px;text-align:center;line-height:40px;font-size:16px;color:${isFounding ? '#f5c842' : '#00d4ff'}">✓</div>
              </td>
              <td style="padding-left:16px;vertical-align:top">
                <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#0d1117">${isFounding
                  ? (isFR ? '02 — Founding Pioneer confirmé' : '02 — Founding Pioneer confirmed')
                  : (isFR ? '02 — Accès accordé' : '02 — Access granted')}</p>
                <p style="margin:0;font-size:13px;color:#475569;line-height:1.5">${isFR ? 'Aucune revue manuelle : votre clé d\'accès est ci-dessous, prête à l\'emploi.' : 'No manual review: your access key is below, ready to use.'}</p>
              </td>
            </tr>
          </table>
          </div>` : `
          <!-- DIVISEUR -->
          <div style="margin-left:20px;border-left:2px dashed #e2e8f0;padding-left:36px;margin-bottom:16px">

          <!-- ÉTAPE 2 : EN ATTENTE -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;opacity:0.5">
            <tr>
              <td style="width:44px;vertical-align:top">
                <div style="width:40px;height:40px;background:#f1f5f9;border:1.5px solid #e2e8f0;border-radius:10px;text-align:center;line-height:40px;font-size:13px;font-weight:900;color:#94a3b8">02</div>
              </td>
              <td style="padding-left:16px;vertical-align:top">
                <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#475569">${isFR ? 'Prochaine cohorte' : 'Next cohort'}</p>
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5">${isFR ? 'La cohorte actuelle est complète. Votre clé sera envoyée automatiquement à l\'ouverture de la suivante.' : 'The current cohort is full. Your key will be sent automatically once the next one opens.'}</p>
              </td>
            </tr>
          </table>

          <!-- ÉTAPE 3 -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="opacity:0.5">
            <tr>
              <td style="width:44px;vertical-align:top">
                <div style="width:40px;height:40px;background:#f1f5f9;border:1.5px solid #e2e8f0;border-radius:10px;text-align:center;line-height:40px;font-size:13px;font-weight:900;color:#94a3b8">03</div>
              </td>
              <td style="padding-left:16px;vertical-align:top">
                <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#475569">${isFR ? 'Accès automatique' : 'Automatic access'}</p>
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5">${isFR ? 'Dès l\'ouverture, votre clé d\'accès vous est envoyée par email, sans démarche de votre part.' : 'As soon as it opens, your access key is emailed to you automatically — no action needed on your end.'}</p>
              </td>
            </tr>
          </table>
          </div>`}

        </td>
      </tr>
    </table>

    ${isInstant ? `
    <!-- CLÉ D'ACCÈS -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px">
      <tr>
        <td style="background:linear-gradient(135deg,#0d1117,#1a2332);border:1.5px solid ${isFounding ? 'rgba(245,200,66,0.35)' : 'rgba(0,212,255,0.25)'};border-radius:16px;padding:32px;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;font-weight:900;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.18em">${isFounding
            ? (isFR ? 'Votre clé Founding Pioneer' : 'Your Founding Pioneer key')
            : (isFR ? 'Votre clé d\'accès' : 'Your access key')}</p>
          <p style="margin:0 0 16px;font-size:32px;font-weight:900;color:${isFounding ? '#f5c842' : '#00d4ff'};font-family:'Courier New',Courier,monospace;letter-spacing:0.06em">${accessKey || ''}</p>
          <a href="https://linkyourart.com" style="display:inline-block;background:#ffffff;color:#0d1117;text-decoration:none;font-size:12px;font-weight:900;padding:14px 28px;border-radius:10px;text-align:center;letter-spacing:0.08em;text-transform:uppercase">
            ${isFR ? 'Entrer maintenant' : 'Enter now'}
          </a>
        </td>
      </tr>
    </table>` : ''}

    <!-- CODE PARRAINAGE -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px">
      <tr>
        <td style="background:linear-gradient(135deg,#0d1117,#1a2332);border-radius:16px;padding:32px;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;font-weight:900;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.18em">${isFR ? 'Votre code de parrainage' : 'Your referral code'}</p>
          <p style="margin:0 0 12px;font-size:44px;font-weight:900;color:#00d4ff;font-family:'Courier New',Courier,monospace;letter-spacing:0.08em">${referralCode}</p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.50);line-height:1.6;max-width:360px;margin:0 auto">
            ${isFR
              ? 'Partagez ce code avec vos contacts — chaque parrainage accélère votre montée dans la file LYA Originals.'
              : 'Share this code with your contacts — each referral accelerates your rise in the LYA Originals queue.'
            }
          </p>
        </td>
      </tr>
    </table>

    <!-- CE QUI VOUS ATTEND -->
    <p style="margin:0 0 20px;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;text-align:center">
      ${isFR ? '— Ce que vous allez débloquer —' : '— What you will unlock —'}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px">
      ${[
        ['✦', isFR ? 'LYA Score' : 'LYA Score', isFR ? 'Chaque création évaluée sur 1000 points par des experts certifiés LYA.' : 'Each creation rated out of 1000 by certified LYA experts.'],
        ['◈', isFR ? 'Mécénat' : 'Patronage', isFR ? 'Soutenez des projets créatifs certifiés dès 50$. Recevez reconnaissance et accès anticipé.' : 'Support certified creative projects from $50. Receive recognition and early access.'],
        ['⚡', isFR ? 'Registre LYA' : 'LYA Registry', isFR ? 'Suivez la progression de vos projets soutenus. Leur Score évolue avec chaque jalon validé.' : 'Follow the progress of the projects you support. Their Score evolves with every validated milestone.'],
      ].map(([icon, title, desc]) => `
      <tr><td style="padding-bottom:12px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:52px;vertical-align:top">
              <div style="width:48px;height:48px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;text-align:center;line-height:48px;font-size:20px">${icon}</div>
            </td>
            <td style="padding-left:16px;vertical-align:middle">
              <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#0d1117">${title}</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5">${desc}</p>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- BROCHURE LYA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr><td>
        <p style="margin:0 0 16px;font-size:11px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;text-align:center">
          ${isFR ? '— Téléchargez notre présentation officielle —' : '— Download our official presentation —'}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="50%" style="padding-right:8px">
              <a href="https://linkyourart.com/LYA_Brochure_FR_final.pdf" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1.5px solid rgba(0,212,255,0.3);color:#00d4ff;text-decoration:none;font-size:13px;font-weight:900;padding:16px 20px;border-radius:12px;text-align:center;letter-spacing:0.08em;text-transform:uppercase">
                📄 ${isFR ? 'Brochure LYA — FR' : 'LYA Brochure — FR'}
              </a>
            </td>
            <td width="50%" style="padding-left:8px">
              <a href="https://linkyourart.com/LYA_Brochure_EN_final.pdf" style="display:block;background:linear-gradient(135deg,#0d1117,#1a2332);border:1.5px solid rgba(167,139,250,0.3);color:#a78bfa;text-decoration:none;font-size:13px;font-weight:900;padding:16px 20px;border-radius:12px;text-align:center;letter-spacing:0.08em;text-transform:uppercase">
                📄 ${isFR ? 'LYA Brochure — EN' : 'LYA Brochure — EN'}
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;text-align:center">
          ${isFR ? 'Découvrez tout ce que LinkYourArt a à vous offrir.' : 'Discover everything LinkYourArt has to offer you.'}
        </p>
      </td></tr>
    </table>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding-bottom:8px">
        <a href="${referralLink}" style="display:inline-block;background:#0d1117;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;padding:18px 52px;border-radius:12px;letter-spacing:0.08em;text-transform:uppercase">
          ${isFR ? 'Découvrir LinkYourArt →' : 'Discover LinkYourArt →'}
        </a>
      </td></tr>
      <tr><td align="center">
        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8">${isFR ? 'En attendant votre invitation, explorez la plateforme.' : 'While waiting for your invitation, explore the platform.'}</p>
      </td></tr>
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0d1117;padding:32px 48px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:14px;font-weight:900;color:#ffffff;letter-spacing:0.12em">LINKYOURART</p>
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.35)">contact@linkyourart.com · linkyourart.com</p>
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.20);font-style:italic">
            ${isFR
              ? 'Vous recevez cet email car vous vous êtes pré-inscrit sur linkyourart.com'
              : 'You receive this email because you pre-registered on linkyourart.com'
            }
          </p>
        </td>
        <td align="right" style="vertical-align:top">
          <p style="margin:0;font-size:22px;font-weight:900;color:#f5c842">✦</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- BANDE BAS GRADIENT -->
  <tr><td style="background:linear-gradient(90deg,#00d4ff,#a78bfa,#f5c842);padding:0;height:4px;font-size:0">&nbsp;</td></tr>

</table>
<!-- FIN CARTE -->

</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, position, referralCode, referralLink, lang = 'FR', tier, accessKey } = req.body || {};
  if (!to || !name) return res.status(400).json({ error: 'Missing required fields: to, name' });

  const code = referralCode || generateReferralCode(name);
  const link = referralLink || 'https://linkyourart.com';

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const { subject, html } = buildEmail(name, position || 1, code, link, lang, tier, accessKey);

  if (!host || !user || !pass) {
    console.log('[PRE_REG SIMULATED]', to, subject);
    return res.status(200).json({ success: true, method: 'simulated', subject });
  }

  const result = await sendSMTP({ host, port, user, pass, to, subject, html });
  console.log(result.ok ? `[PRE_REG SENT] ✓ ${to}` : `[PRE_REG ERROR] ${result.err}`);
  return res.status(200).json({ success: result.ok, method: 'smtp', error: result.err });
};
