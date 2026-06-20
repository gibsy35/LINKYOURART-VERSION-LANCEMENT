// ─── TEMPLATES HTML PREMIUM — LINKYOURART ─────────────────────────────────────
// Design cohérent avec la charte graphique : fond sombre, cyan #00d4ff, or #fbbf24

const BASE_STYLES = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #07090d;
      color: #e8eaf0;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0; padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 40px 0 32px;
    }
    .logo-text {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.35em;
      color: #00d4ff;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .logo-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.4em;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase;
    }
    .card {
      background: #0f1520;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 44px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .badge-cyan {
      background: rgba(0,212,255,0.1);
      border: 1px solid rgba(0,212,255,0.25);
      color: #00d4ff;
    }
    .badge-gold {
      background: rgba(251,191,36,0.1);
      border: 1px solid rgba(251,191,36,0.25);
      color: #fbbf24;
    }
    .badge-green {
      background: rgba(0,255,136,0.1);
      border: 1px solid rgba(0,255,136,0.25);
      color: #00ff88;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 span { color: #00d4ff; }
    p {
      font-size: 14px;
      line-height: 1.7;
      color: rgba(255,255,255,0.55);
      margin-bottom: 20px;
    }
    .highlight-box {
      background: rgba(0,212,255,0.04);
      border: 1px solid rgba(0,212,255,0.15);
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .highlight-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      margin-bottom: 10px;
    }
    .highlight-value {
      font-size: 32px;
      font-weight: 900;
      color: #00d4ff;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.05em;
    }
    .highlight-value.gold { color: #fbbf24; }
    .highlight-value.green { color: #00ff88; }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
      margin: 28px 0;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .stat-label { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 600; }
    .stat-value { font-size: 13px; color: #ffffff; font-weight: 900; }
    .stat-value.cyan { color: #00d4ff; }
    .stat-value.gold { color: #fbbf24; }
    .stat-value.green { color: #00ff88; }
    .cta-btn {
      display: block;
      background: #00d4ff;
      color: #07090d;
      text-decoration: none;
      text-align: center;
      padding: 18px 32px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin: 28px 0 0;
    }
    .cta-btn.gold {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #07090d;
    }
    .steps {
      list-style: none;
      counter-reset: steps;
      margin: 20px 0;
    }
    .steps li {
      counter-increment: steps;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 14px;
      font-size: 13px;
      color: rgba(255,255,255,0.55);
      line-height: 1.5;
    }
    .steps li::before {
      content: counter(steps);
      min-width: 24px;
      height: 24px;
      background: rgba(0,212,255,0.1);
      border: 1px solid rgba(0,212,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 900;
      color: #00d4ff;
      flex-shrink: 0;
    }
    .footer {
      text-align: center;
      padding: 24px 0 40px;
    }
    .footer p {
      font-size: 10px;
      color: rgba(255,255,255,0.15);
      letter-spacing: 0.1em;
      margin-bottom: 6px;
    }
  </style>
`;

const HEADER_HTML = `
  <div class="header">
    <div class="logo-text">LINKYOURART</div>
    <div class="logo-sub">ART IS AN EXCHANGE</div>
  </div>
`;

const FOOTER_HTML = `
  <div class="footer">
    <p>© 2026 LINKYOURART INC. — ALL RIGHTS RESERVED</p>
    <p>contact@linkyourart.com — www.linkyourart.com</p>
    <p style="margin-top:12px;font-size:9px;">Ce message est envoyé automatiquement. Merci de ne pas y répondre directement.</p>
  </div>
`;

// ─── EMAIL 1 : CONFIRMATION PRÉ-INSCRIPTION ───────────────────────────────────

export function templatePreRegistration({ name, position, referralCode, referralLink, lang = 'FR' }: {
  name: string;
  position: number;
  referralCode: string;
  referralLink: string;
  lang?: 'FR' | 'EN';
}) {
  const isFR = lang === 'FR';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body>
  <div class="wrapper">
    ${HEADER_HTML}
    <div class="card">
      <div class="badge badge-green">✦ ${isFR ? 'Inscription confirmée' : 'Registration confirmed'}</div>
      <h1>${isFR ? 'Bienvenue dans<br><span>la liste d\'attente</span>' : 'Welcome to<br><span>the waitlist</span>'}</h1>
      <p>${isFR
        ? `Bonjour <strong>${name}</strong>, votre pré-inscription LinkYourArt est confirmée. Vous faites désormais partie des pionniers qui vont transformer l\'économie créative mondiale.`
        : `Hello <strong>${name}</strong>, your pre-registration to LinkYourArt is confirmed. You are now among the pioneers who will transform the global creative economy.`
      }</p>

      <div class="highlight-box">
        <div class="highlight-label">${isFR ? 'Votre position dans la file' : 'Your queue position'}</div>
        <div class="highlight-value">#${position.toLocaleString(isFR ? 'fr-FR' : 'en-US')}</div>
      </div>

      <div class="divider"></div>

      <div class="highlight-label" style="margin-bottom:12px;">${isFR ? 'Votre code de parrainage personnel' : 'Your personal referral code'}</div>
      <div class="highlight-box" style="margin-top:0">
        <div class="highlight-label">${isFR ? 'Partagez ce lien pour monter dans la file' : 'Share this link to move up the queue'}</div>
        <div class="highlight-value" style="font-size:22px;">${referralCode}</div>
        <p style="font-size:11px;margin-top:10px;margin-bottom:0;color:rgba(255,255,255,0.3)">${referralLink}</p>
      </div>

      <p style="font-size:12px;">${isFR
        ? 'Chaque personne qui s\'inscrit via votre lien vous fait gagner des places. Partagez sur vos réseaux pour être parmi les premiers à accéder à la plateforme.'
        : 'Every person who registers through your link moves you up. Share on your networks to be among the first to access the platform.'
      }</p>
    </div>

    <div class="card" style="background:rgba(251,191,36,0.03);border-color:rgba(251,191,36,0.12);">
      <div class="badge badge-gold">LYA PROTOCOL</div>
      <p style="font-size:13px;">${isFR
        ? 'La suite ? Notre équipe vous contactera par email dès que votre accès sera activé. En attendant, suivez nos actualités sur <strong style="color:#00d4ff">linkyourart.com</strong>.'
        : 'What\'s next? Our team will contact you by email once your access is activated. In the meantime, follow our news at <strong style="color:#00d4ff">linkyourart.com</strong>.'
      }</p>
    </div>

    ${FOOTER_HTML}
  </div>
  </body></html>`;
}

// ─── EMAIL 2 : CODE D'INVITATION — ACCÈS DÉBLOQUÉ ────────────────────────────

export function templateInvitation({ name, inviteCode, lang = 'FR' }: {
  name: string;
  inviteCode: string;
  lang?: 'FR' | 'EN';
}) {
  const isFR = lang === 'FR';
  const signupUrl = `https://www.linkyourart.com/signup?code=${inviteCode}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body>
  <div class="wrapper">
    ${HEADER_HTML}
    <div class="card">
      <div class="badge badge-gold">✦ ${isFR ? 'Votre accès est débloqué' : 'Your access is unlocked'}</div>
      <h1>${isFR ? 'Vous êtes<br><span>invité(e)</span>' : 'You\'ve been<br><span>invited</span>'}</h1>
      <p>${isFR
        ? `Bonjour <strong>${name}</strong>, votre position dans la liste d\'attente a été validée. La plateforme LinkYourArt est maintenant ouverte pour vous.`
        : `Hello <strong>${name}</strong>, your waitlist position has been validated. The LinkYourArt platform is now open for you.`
      }</p>

      <div class="highlight-box" style="background:rgba(251,191,36,0.04);border-color:rgba(251,191,36,0.2);">
        <div class="highlight-label">${isFR ? 'Votre code d\'accès unique' : 'Your unique access code'}</div>
        <div class="highlight-value gold" style="font-size:28px;letter-spacing:0.15em;">${inviteCode}</div>
      </div>

      <div class="divider"></div>

      <div class="highlight-label" style="margin-bottom:14px;">${isFR ? 'Comment créer votre compte' : 'How to create your account'}</div>
      <ol class="steps">
        <li>${isFR ? 'Cliquez sur le bouton ci-dessous pour accéder à la page d\'inscription' : 'Click the button below to access the registration page'}</li>
        <li>${isFR ? 'Votre code d\'accès sera automatiquement appliqué' : 'Your access code will be automatically applied'}</li>
        <li>${isFR ? 'Choisissez votre profil : Créateur, Mécène ou Professionnel' : 'Choose your profile: Creator, Patron or Professional'}</li>
        <li>${isFR ? 'Commencez à explorer la plateforme LYA' : 'Start exploring the LYA platform'}</li>
      </ol>

      <a href="${signupUrl}" class="cta-btn gold">✦ ${isFR ? 'CRÉER MON COMPTE LINKYOURART' : 'CREATE MY LINKYOURART ACCOUNT'}</a>

      <p style="font-size:11px;text-align:center;margin-top:16px;">${isFR ? 'Ce code est valable 72 heures.' : 'This code is valid for 72 hours.'}</p>
    </div>
    ${FOOTER_HTML}
  </div>
  </body></html>`;
}

// ─── EMAIL 3 : BIENVENUE APRÈS INSCRIPTION ────────────────────────────────────

export function templateWelcome({ name, role, lang = 'FR' }: {
  name: string;
  role: 'CREATOR' | 'PROFESSIONAL' | 'INVESTOR' | string;
  lang?: 'FR' | 'EN';
}) {
  const isFR = lang === 'FR';

  const roleConfig: Record<string, { labelFR: string; labelEN: string; descFR: string; descEN: string; color: string }> = {
    CREATOR: {
      labelFR: 'Créateur', labelEN: 'Creator',
      descFR: 'Votre espace créatif vous attend. Liez vos premières créations, obtenez votre LYA Score et commencez à recevoir le soutien de vos premiers mécènes.',
      descEN: 'Your creative space awaits. Link your first creations, get your LYA Score and start receiving support from your first patrons.',
      color: '#a78bfa',
    },
    PROFESSIONAL: {
      labelFR: 'Professionnel', labelEN: 'Professional',
      descFR: 'Accédez à la Console de Validation, découvrez les projets en attente d\'indexation et contribuez à faire émerger les talents de demain.',
      descEN: 'Access the Validation Console, discover projects awaiting indexation and help emerging talent reach their potential.',
      color: '#00d4ff',
    },
    INVESTOR: {
      labelFR: 'Mécène', labelEN: 'Patron',
      descFR: 'Parcourez l\'Espace Mécénat, sélectionnez les projets créatifs qui vous correspondent et commencez à construire votre portefeuille créatif.',
      descEN: 'Browse the Patronage Space, select the creative projects that speak to you and start building your creative portfolio.',
      color: '#00ff88',
    },
  };

  const cfg = roleConfig[role] || roleConfig['CREATOR'];

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body>
  <div class="wrapper">
    ${HEADER_HTML}
    <div class="card">
      <div class="badge badge-cyan">✦ ${isFR ? 'Bienvenue sur la plateforme' : 'Welcome to the platform'}</div>
      <h1>${isFR ? 'Content de vous<br>avoir parmi <span>nous</span>' : 'Great to have<br>you with <span>us</span>'}</h1>
      <p>${isFR
        ? `Bonjour <strong>${name}</strong>, votre compte LinkYourArt est activé. Vous êtes désormais enregistré(e) en tant que <strong style="color:${cfg.color}">${cfg.labelFR}</strong> sur le Protocole LYA.`
        : `Hello <strong>${name}</strong>, your LinkYourArt account is now active. You are registered as a <strong style="color:${cfg.color}">${cfg.labelEN}</strong> on the LYA Protocol.`
      }</p>

      <div class="highlight-box" style="background:rgba(0,212,255,0.03);">
        <div class="highlight-label" style="color:${cfg.color};">${isFR ? cfg.labelFR.toUpperCase() : cfg.labelEN.toUpperCase()} LYA</div>
        <p style="font-size:13px;margin:12px 0 0;color:rgba(255,255,255,0.6);">${isFR ? cfg.descFR : cfg.descEN}</p>
      </div>

      <div class="divider"></div>

      <div class="stat-row"><span class="stat-label">${isFR ? 'Protocole' : 'Protocol'}</span><span class="stat-value cyan">LYA v2.0</span></div>
      <div class="stat-row"><span class="stat-label">${isFR ? 'Valeur unitaire' : 'Unit value'}</span><span class="stat-value gold">1 LYA UNIT = $50.00</span></div>
      <div class="stat-row"><span class="stat-label">${isFR ? 'Statut' : 'Status'}</span><span class="stat-value green">${isFR ? 'ACTIF' : 'ACTIVE'}</span></div>

      <a href="https://www.linkyourart.com" class="cta-btn">→ ${isFR ? 'ACCÉDER À MON ESPACE LYA' : 'ACCESS MY LYA SPACE'}</a>
    </div>
    ${FOOTER_HTML}
  </div>
  </body></html>`;
}

// ─── EMAIL 4 : ALERTE PROJET ──────────────────────────────────────────────────

export function templateProjectAlert({ name, projectName, projectCategory, eventFR, eventEN, lyaScore, lang = 'FR' }: {
  name: string;
  projectName: string;
  projectCategory: string;
  eventFR: string;
  eventEN: string;
  lyaScore: number;
  lang?: 'FR' | 'EN';
}) {
  const isFR = lang === 'FR';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body>
  <div class="wrapper">
    ${HEADER_HTML}
    <div class="card">
      <div class="badge badge-cyan">● ${isFR ? 'Alerte projet' : 'Project alert'}</div>
      <h1>${isFR ? 'Nouveau sur<br><span>${projectName.slice(0,20)}</span>' : 'Update on<br><span>${projectName.slice(0,20)}</span>'}</h1>
      <p>${isFR
        ? `Bonjour <strong>${name}</strong>, un projet que vous suivez vient d\'enregistrer une évolution significative.`
        : `Hello <strong>${name}</strong>, a project you follow has just recorded a significant update.`
      }</p>

      <div class="highlight-box">
        <div class="highlight-label">${projectCategory.toUpperCase()}</div>
        <div style="font-size:18px;font-weight:900;color:#ffffff;margin:8px 0;">${projectName}</div>
        <div style="font-size:13px;color:#00ff88;font-weight:700;">${isFR ? eventFR : eventEN}</div>
      </div>

      <div class="stat-row"><span class="stat-label">LYA Score</span><span class="stat-value gold">${lyaScore}/1000</span></div>
      <div class="stat-row"><span class="stat-label">${isFR ? 'Catégorie' : 'Category'}</span><span class="stat-value">${projectCategory}</span></div>

      <a href="https://www.linkyourart.com" class="cta-btn">→ ${isFR ? 'VOIR LE PROJET' : 'VIEW PROJECT'}</a>
    </div>
    ${FOOTER_HTML}
  </div>
  </body></html>`;
}
