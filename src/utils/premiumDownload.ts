/**
 * LYA Premium Document Generator — v2.0
 * Documents HTML stylisés avec bouton Imprimer + versions FR/EN
 */

const LYA_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
  :root { --cyan:#00E0FF; --gold:#FFD700; --bg:#0D1117; --surface:#161B22; --surface2:#1C2128; --border:rgba(255,255,255,0.07); --text:#FFFFFF; --muted:rgba(255,255,255,0.45); }
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;font-size:14px;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:860px;margin:0 auto;padding:60px;position:relative;padding-bottom:100px}
  .corner{position:fixed;width:32px;height:32px}
  .corner.tl{top:24px;left:24px;border-top:2px solid var(--cyan);border-left:2px solid var(--cyan)}
  .corner.tr{top:24px;right:24px;border-top:2px solid var(--cyan);border-right:2px solid var(--cyan)}
  .corner.bl{bottom:70px;left:24px;border-bottom:2px solid var(--cyan);border-left:2px solid var(--cyan)}
  .corner.br{bottom:70px;right:24px;border-bottom:2px solid var(--cyan);border-right:2px solid var(--cyan)}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:36px;border-bottom:1px solid var(--border);margin-bottom:48px}
  .logo-block .brand{font-size:22px;font-weight:800;letter-spacing:-0.04em;color:var(--text);text-transform:uppercase}
  .logo-block .tagline{font-family:'Space Mono',monospace;font-size:9px;color:var(--cyan);letter-spacing:0.35em;text-transform:uppercase;margin-top:4px;opacity:0.7}
  .doc-meta{text-align:right;font-family:'Space Mono',monospace}
  .doc-meta .doc-id{font-size:9px;color:var(--muted);letter-spacing:0.2em;text-transform:uppercase}
  .doc-meta .doc-date{font-size:11px;color:var(--cyan);font-weight:700;letter-spacing:0.1em;margin-top:4px}
  .title-block{margin-bottom:48px}
  .doc-type{font-family:'Space Mono',monospace;font-size:9px;color:var(--cyan);letter-spacing:0.5em;text-transform:uppercase;margin-bottom:12px;opacity:0.8}
  .doc-title{font-size:36px;font-weight:800;letter-spacing:-0.04em;text-transform:uppercase;line-height:1.1;color:var(--text);margin-bottom:12px}
  .doc-title span{color:var(--cyan)}
  .doc-subtitle{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.2em;font-weight:600}
  .divider{height:1px;background:linear-gradient(90deg,var(--cyan) 0%,transparent 100%);margin:32px 0;opacity:0.2}
  .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px}
  .stat-box{background:var(--surface);border:1px solid var(--border);padding:20px 24px;position:relative;overflow:hidden}
  .stat-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),transparent);opacity:0.4}
  .stat-label{font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px}
  .stat-value{font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.02em}
  .stat-value.cyan{color:var(--cyan)} .stat-value.gold{color:var(--gold)}
  .table-container{background:var(--surface);border:1px solid var(--border);overflow:hidden;margin-bottom:32px}
  .table-header{padding:16px 24px;border-bottom:1px solid var(--border);background:rgba(0,224,255,0.03)}
  .table-title{font-family:'Space Mono',monospace;font-size:9px;color:var(--cyan);letter-spacing:0.4em;text-transform:uppercase;font-weight:700}
  table{width:100%;border-collapse:collapse}
  thead tr{background:var(--surface2)}
  th{font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.3em;text-transform:uppercase;padding:12px 24px;text-align:left;font-weight:700;border-bottom:1px solid var(--border)}
  td{font-size:12px;padding:14px 24px;border-bottom:1px solid var(--border);color:var(--text);font-weight:500}
  tr:last-child td{border-bottom:none}
  td.cyan{color:var(--cyan);font-family:'Space Mono',monospace;font-size:11px}
  td.green{color:#4ADE80} td.gold{color:var(--gold)} td.muted{color:var(--muted)} td.mono{font-family:'Space Mono',monospace;font-size:11px}
  .badge{display:inline-block;padding:3px 10px;font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;border:1px solid currentColor}
  .badge.green{color:#4ADE80;background:rgba(74,222,128,0.08)} .badge.gold{color:var(--gold);background:rgba(255,215,0,0.08)}
  .badge.cyan{color:var(--cyan);background:rgba(0,224,255,0.08)} .badge.red{color:#F87171;background:rgba(248,113,113,0.08)}
  .section{margin-bottom:40px}
  .section-title{font-family:'Space Mono',monospace;font-size:9px;color:var(--cyan);letter-spacing:0.5em;text-transform:uppercase;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid var(--border)}
  .content-block{background:var(--surface);border:1px solid var(--border);padding:28px;margin-bottom:16px}
  .content-block p{font-size:13px;color:rgba(255,255,255,0.75);line-height:1.8}
  .content-block h3{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;color:var(--text)}
  .footer{margin-top:64px;padding-top:32px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.25em;text-transform:uppercase;line-height:2}
  .footer-right{text-align:right;font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.2em;text-transform:uppercase}
  .verified-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,224,255,0.06);border:1px solid rgba(0,224,255,0.2);padding:8px 16px;margin-top:10px;font-family:'Space Mono',monospace;font-size:8px;color:var(--cyan);letter-spacing:0.3em;text-transform:uppercase}
  .dot{width:6px;height:6px;border-radius:50%;background:var(--cyan);display:inline-block}
  .action-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(13,17,23,0.97);border-top:1px solid rgba(0,224,255,0.15);padding:12px 24px;display:flex;align-items:center;justify-content:center;gap:12px;z-index:999;backdrop-filter:blur(20px)}
  .btn-print{display:flex;align-items:center;gap:8px;padding:10px 24px;background:var(--cyan);color:#0D1117;border:none;font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;cursor:pointer}
  .btn-print:hover{background:#fff}
  .btn-copy{padding:10px 20px;background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.1);font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;cursor:pointer}
  .btn-copy:hover{color:#fff;border-color:rgba(255,255,255,0.3)}
  @media print{.action-bar{display:none!important}.corner{display:none!important}.page{padding-bottom:60px}}
`;

function generateDocId(): string {
  return `LYA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
}

function formatDate(lang: 'fr'|'en' = 'fr'): string {
  return new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).toUpperCase();
}

function wrapDocument(
  title: string,
  subtitle: string,
  docType: string,
  bodyContent: string,
  lang: 'fr'|'en' = 'fr'
): string {
  const docId = generateDocId();
  const date  = formatDate(lang);
  const parts  = title.split(' ');
  const accent = parts[parts.length - 1];
  const base   = parts.slice(0, -1).join(' ');

  const FR = lang === 'fr';
  const tagline   = FR ? 'LE TERMINAL CRÉATIF · LYA SYSTEME v2.5'   : 'THE CREATIVE TERMINAL · LYA SYSTEM v2.5';
  const verified  = FR ? 'VÉRIFIÉ PAR LE REGISTRE IMMUABLE LYA'   : 'VERIFIED BY LYA IMMUTABLE REGISTRY';
  const rights    = FR ? 'TOUS DROITS RÉSERVÉS · CHIFFREMENT AES-256' : 'ALL RIGHTS RESERVED · AES-256 ENCRYPTED';
  const genLabel  = FR ? 'GÉNÉRÉ LE' : 'GENERATED';
  const printLbl  = FR ? '🖨&nbsp; IMPRIMER CE DOCUMENT' : '🖨&nbsp; PRINT THIS DOCUMENT';
  const copyLbl   = FR ? '📋 COPIER LA RÉFÉRENCE' : '📋 COPY REFERENCE';
  const copiedLbl = FR ? 'COPIÉ !' : 'COPIED!';
  const year      = new Date().getFullYear();
  const genDate   = new Date().toLocaleString(FR ? 'fr-FR' : 'en-GB');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LYA — ${title}</title>
<style>${LYA_STYLES}</style>
</head>
<body>
<div class="corner tl"></div><div class="corner tr"></div>
<div class="corner bl"></div><div class="corner br"></div>
<div class="page">
  <header class="header">
    <div class="logo-block">
      <div class="brand">LinkYourArt</div>
      <div class="tagline">${tagline}</div>
    </div>
    <div class="doc-meta">
      <div class="doc-id">DOC ID: ${docId}</div>
      <div class="doc-date">${date}</div>
    </div>
  </header>
  <div class="title-block">
    <div class="doc-type">${docType}</div>
    <div class="doc-title">${base} <span>${accent}</span></div>
    <div class="doc-subtitle">${subtitle}</div>
  </div>
  ${bodyContent}
  <footer class="footer">
    <div class="footer-left">
      © ${year} LINKYOURART LYA SYSTEM<br>
      ${rights}<br>
      <span class="verified-badge"><span class="dot"></span>${verified}</span>
    </div>
    <div class="footer-right">
      ${genLabel}: ${genDate}<br>
      REF: ${docId}<br>
      LYA TERMINAL v2.5.0
    </div>
  </footer>
</div>

<div class="action-bar">
  <button class="btn-print" onclick="window.console.log()">${printLbl}</button>
  <button class="btn-copy" id="copyBtn" onclick="navigator.clipboard.writeText('${docId}').then(()=>{document.getElementById('copyBtn').textContent='${copiedLbl}';setTimeout(()=>document.getElementById('copyBtn').textContent='${copyLbl}',2000)})">${copyLbl}</button>
</div>
</body>
</html>`;
}

function triggerDownload(html: string, fileName: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── WALLET STATEMENT ────────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string; type: string; amount: number;
  status: string; date: string; method: string;
}

export function downloadWalletStatement(
  transactions: WalletTransaction[],
  userName: string,
  cashBalance: number,
  lyaUnits: number
): void {
  const totalIn = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);

  const rows = transactions.map(tx => {
    const typeColor = (tx.type === 'DEPOSIT' || tx.type === 'REWARD' || tx.type === 'SALE') ? 'cyan' : 'gold';
    const statusColor = tx.status === 'COMPLETED' ? 'green' : 'gold';
    const amtColor = tx.amount > 0 ? 'green' : '';
    const sign = tx.amount > 0 ? '+' : '';
    const amt = Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
    return `<tr>
      <td class="muted">${tx.date}</td>
      <td><span class="badge ${typeColor}">${tx.type}</span></td>
      <td class="muted">${tx.method}</td>
      <td><span class="badge ${statusColor}">${tx.status}</span></td>
      <td class="mono ${amtColor}" style="text-align:right">${sign}€${amt}</td>
    </tr>`;
  }).join('');

  const body = `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-label">Solde total</div><div class="stat-value cyan">€${cashBalance.toLocaleString('fr-FR',{minimumFractionDigits:2})}</div></div>
      <div class="stat-box"><div class="stat-label">Total entrées</div><div class="stat-value">€${totalIn.toLocaleString('fr-FR',{minimumFractionDigits:2})}</div></div>
      <div class="stat-box"><div class="stat-label">Unités LYA</div><div class="stat-value gold">${lyaUnits.toLocaleString('fr-FR')} <span style="font-size:12px;color:rgba(255,255,255,0.4);font-weight:600">UNITS</span></div></div>
    </div>
    <div class="table-container">
      <div class="table-header"><div class="table-title">Historique des transactions · ${transactions.length} opérations</div></div>
      <table>
        <thead><tr><th>Date</th><th>Type</th><th>Méthode</th><th>Statut</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="divider"></div>
    <div class="section">
      <div class="section-title">Informations du compte</div>
      <div class="content-block">
        <h3>${userName.toUpperCase()}</h3>
        <p>Membre vérifié de la plateforme LYA · Niveau de garde : Institutionnel A+<br>
        Toutes les transactions listées sont définitives et enregistrées de manière immuable dans le Registre LYA. Ce relevé est généré automatiquement et constitue un document financier légalement valide.</p>
      </div>
    </div>`;

  triggerDownload(
    wrapDocument('RELEVÉ DE PORTEFEUILLE', `${userName.toUpperCase()} · RÉSUMÉ DU COMPTE`, 'DOCUMENT FINANCIER', body, 'fr'),
    `LYA_Releve_Portefeuille_${new Date().toISOString().split('T')[0]}`
  );
}

// ─── RESOURCE / WHITEPAPER ───────────────────────────────────────────────────
const RESOURCE_CONTENTS: Record<string, { subtitle: string; sections: { title: string; body: string }[] }> = {
  'Protocol Whitepaper v2.5': {
    subtitle: 'ARCHITECTURE TECHNIQUE & CADRE DE GOUVERNANCE',
    sections: [
      { title: 'RÉSUMÉ', body: 'LinkYourArt (LYA) est une infrastructure de capital créatif décentralisée permettant la propriété fractionnée, le règlement en temps réel et la garde institutionnelle des actifs de propriété intellectuelle. La version 2.5 introduit un calcul amélioré du LYA Score, des couches de conformité multi-juridictionnelles et une distribution dynamique des redevances via des nœuds de règlement intelligents.' },
      { title: 'ARCHITECTURE DU LYA SYSTEME', body: 'Le Plateforme LYA fonctionne via une pile à trois couches : (1) la couche Registre offrant un stockage et une vérification immuables des contrats ; (2) la couche Règlement permettant des transferts P2P en temps réel avec chiffrement AES-256 ; (3) la couche Gouvernance où les parties prenantes Professionnelles et Investisseurs votent sur les mises à niveau du protocole via un mécanisme de vote quadratique pondéré par le LYA Score.' },
      { title: 'MÉTHODOLOGIE DU LYA SCORE', body: "Chaque contrat créatif reçoit un LYA Score composite (0-100) calculé à partir de cinq dimensions validées : Qualité Créative (25%), Potentiel de Marché (25%), Conformité Juridique (20%), Indice d'Innovation (15%) et Trajectoire de Croissance (15%). Les scores sont calculés par des validateurs Professionnels certifiés et mis à jour trimestriellement." },
      { title: 'ÉCONOMIE DES UNITÉS LYA', body: "Les Unités LYA ont une valeur nominale de 50€. Chaque contrat définit son offre totale d'unités à l'émission. Les distributions de revenus sont exécutées automatiquement lors d'événements de complétion de jalons vérifiés. Le protocole facture des frais de règlement de 1,5% sur les transactions secondaires." }
    ]
  },
  'Market Analysis Q1 2026': {
    subtitle: 'RAPPORT DE MARCHÉ DE L\'ÉCONOMIE CRÉATIVE · T1 2026',
    sections: [
      { title: 'SYNTHÈSE EXÉCUTIVE', body: 'Le T1 2026 marque un trimestre pivot pour le marché du capital créatif. La valeur totale verrouillée sur la plateforme LYA a atteint 42,7 M€, représentant une augmentation de 34% en glissement annuel. Les actifs Film & TV ont mené la croissance à +41%, suivis par la Musique (+28%) et l\'Architecture (+19%). Le volume du marché secondaire a atteint 8,2 M€ sur 14 200 transferts d\'unités individuels.' },
      { title: 'SECTEURS LES PLUS PERFORMANTS', body: 'Les Séries Télévisées de Science-Fiction sont apparues comme la catégorie au rendement le plus élevé avec un APY moyen de 22,4%. Les films documentaires ont démontré les meilleurs rendements ajustés au risque avec un ratio de Sharpe de 1,84. Les contrats d\'Architecture ont montré les valorisations les plus stables avec une variance trimestrielle < 5%.' },
      { title: 'FACTEURS DE RISQUE & PERSPECTIVES', body: 'La concurrence accrue des contenus générés par l\'IA continue de faire pression sur les catégories Photographie et Illustration. La clarification réglementaire dans l\'UE concernant la fractionnalisation numérique de la PI est attendue au T3 2026. Nous projetons un TVL total du protocole atteignant 65 M€ d\'ici fin 2026 selon notre scénario de base.' }
    ]
  },
  'Legal Framework Guide': {
    subtitle: 'JURIDICTION, CONFORMITÉ & NORMES CONTRACTUELLES',
    sections: [
      { title: 'CADRE RÉGLEMENTAIRE', body: 'Les contrats LYA opèrent dans une structure juridique hybride combinant des accords de licence de PI traditionnels avec des mécanismes de transfert d\'unités numériques natifs. Les contrats sont structurés comme des accords de participation accordant aux détenteurs d\'unités des droits économiques proportionnels sur des flux de revenus définis, sans conférer de propriété en capital dans l\'entité créatrice sous-jacente.' },
      { title: 'JURIDICTIONS SUPPORTÉES', body: 'Le Plateforme LYA supporte actuellement l\'émission de contrats sous le Droit Français (cadres SACD/SCAM), le Droit Anglais (conformité CDPA 1988) et les cadres de PI fédéraux américains/Delaware. La conformité RGPD est appliquée au niveau des données. La conformité réglementaire MiCA est maintenue via des audits juridiques trimestriels.' },
      { title: 'DROITS & PROTECTIONS DES CRÉATEURS', body: 'Les créateurs conservent tous leurs droits moraux et le contrôle créatif de leurs œuvres. Les détenteurs d\'unités ne reçoivent que des droits de participation économique. Tous les contrats incluent des dispositions de rachat obligatoires permettant aux créateurs de racheter les unités en circulation à la valeur marchande équitable déterminée par le modèle de valorisation LYA Score.' }
    ]
  },
  'Node Operator Manual': {
    subtitle: 'GUIDE DE CONFIGURATION & D\'EXPLOITATION DES NŒUDS',
    sections: [
      { title: 'PRÉSENTATION DES NŒUDS', body: 'Les nœuds de règlement constituent l\'infrastructure centrale de la plateforme LYA, responsables de la validation des transferts d\'unités, du calcul des LYA Scores en temps réel et de l\'exécution des distributions automatiques de revenus. Les nœuds nécessitent un stake minimum de 1 000 Unités LYA et maintiennent un SLA de disponibilité de 99,5% pour se qualifier à la distribution des frais.' },
      { title: 'CONFIGURATION TECHNIQUE', body: 'Spécifications minimales : CPU 8 cœurs, 32 Go de RAM, SSD NVMe 500 Go, connexion réseau symétrique 1 Gbps. Les nœuds communiquent via le Protocole Mesh LYA (LMP) en utilisant gRPC sur TLS 1.3. Le SDK LYA (Node.js ≥18 ou Python ≥3.11) fournit l\'implémentation de référence pour l\'exploitation et la surveillance des nœuds.' },
      { title: 'STRUCTURE DES RÉCOMPENSES', body: 'Les nœuds actifs gagnent 0,8% de tous les frais de règlement traités via leur nœud, plus un bonus de disponibilité de 0,1% pour les nœuds maintenant > 99,9% de disponibilité mensuelle. Les récompenses sont distribuées quotidiennement en Unités LYA au prix spot actuel.' }
    ]
  }
};

export function downloadResourceDocument(resourceTitle: string): void {
  const data = RESOURCE_CONTENTS[resourceTitle] || {
    subtitle: 'DOCUMENT OFFICIEL DU PLATEFORME LYA',
    sections: [{
      title: 'CONTENU DU DOCUMENT',
      body: 'Ce document fait partie de la bibliothèque de documentation officielle de la plateforme LYA. Le contenu est régulièrement mis à jour pour refléter les dernières spécifications du protocole.'
    }]
  };

  const sections = data.sections.map(s =>
    `<div class="section"><div class="section-title">${s.title}</div><div class="content-block"><p>${s.body}</p></div></div>`
  ).join('');

  const body = `${sections}
    <div class="divider"></div>
    <div class="content-block">
      <h3>AUTHENTICITÉ DU DOCUMENT</h3>
      <p>Ce document a été généré depuis la base de connaissances officielle de la plateforme LYA. Tout le contenu est exact à la date de génération et fait l'objet d'une révision trimestrielle. Pour la version la plus récente, consultez le portail de ressources de l'Académie LYA.</p>
    </div>`;

  const titleParts = resourceTitle.split(' ');
  triggerDownload(
    wrapDocument(resourceTitle.toUpperCase(), data.subtitle, 'DOCUMENT OFFICIEL LYA', body, 'fr'),
    `LYA_${titleParts.join('_').replace(/[^a-zA-Z0-9_]/g, '')}`
  );
}

// ─── LEGAL DOCUMENT ──────────────────────────────────────────────────────────
export function downloadLegalDocument(title: string, content: string): void {
  const excerpt = content.substring(0, 3000) + (content.length > 3000 ? '\n\n[…suite dans la version complète]' : '');
  const body = `
    <div class="section">
      <div class="section-title">Contenu du Document</div>
      <div class="content-block"><p style="white-space:pre-wrap;font-size:12px;line-height:2;color:rgba(255,255,255,0.65)">${excerpt}</p></div>
    </div>
    <div class="divider"></div>
    <div class="content-block">
      <h3>MENTION LÉGALE</h3>
      <p>Ce document constitue un enregistrement juridique officiel de la plateforme LYA. Il est protégé par les lois applicables en matière de propriété intellectuelle. Toute reproduction ou distribution non autorisée est interdite. Pour toute demande juridique, contactez legal@linkyourart.com.</p>
    </div>`;

  triggerDownload(
    wrapDocument(title.toUpperCase(), 'DOCUMENT JURIDIQUE OFFICIEL DU LYA SYSTEME', 'DOCUMENT LÉGAL', body, 'fr'),
    `LYA_Legal_${title.replace(/\s+/g, '_')}`
  );
}
