import { Contract } from '../types';

// Génère un document HTML premium LYA et l'ouvre dans une nouvelle fenêtre pour impression
const LYA_COLORS = {
  cyan: '#00d4ff',
  violet: '#a78bfa',
  gold: '#f5c842',
  dark: '#0d1117',
  navy: '#0a0e1a',
};

function lyaHeader(title: string, subtitle: string, lang: string): string {
  const isFR = lang === 'FR';
  return `
    <div class="header">
      <div class="logo-section">
        <div class="logo-box">
          <span class="logo-text">LINKYOURART</span>
          <span class="logo-tagline">${isFR ? "Votre travail a une valeur. Nous la certifions. Des mécènes la reconnaissent." : "Your work has value. We certify it. Patrons recognize it."}</span>
        </div>
        <div class="doc-type">
          <span class="doc-title">${title}</span>
          <span class="doc-subtitle">${subtitle}</span>
        </div>
      </div>
      <div class="header-line"></div>
    </div>
  `;
}

function lyaFooter(contract: Contract, lang: string): string {
  const isFR = lang === 'FR';
  const now = new Date();
  return `
    <div class="footer">
      <div class="footer-line"></div>
      <div class="footer-content">
        <div class="footer-left">
          <span class="footer-brand">LINKYOURART</span>
          <span class="footer-address">contact@linkyourart.com · linkyourart.com</span>
          <span class="footer-legal">${isFR ? 'Document officiel LinkYourArt, marque de LINKYOURART SASU — Reproduction interdite sans autorisation' : 'Official LinkYourArt document, trademark of LINKYOURART SASU — Reproduction prohibited without authorization'}</span>
        </div>
        <div class="footer-right">
          <span class="footer-date">${isFR ? 'Émis le' : 'Issued'} ${now.toLocaleDateString(isFR ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          <span class="footer-ref">${contract.registryIndex}</span>
          <div class="footer-seal">✦ LYA</div>
        </div>
      </div>
    </div>
  `;
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #ffffff;
    color: #0d1117;
    font-size: 11px;
    line-height: 1.6;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 16mm 18mm;
    background: #ffffff;
    position: relative;
  }

  /* HEADER */
  .header { margin-bottom: 8mm; }
  .logo-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4mm;
  }
  .logo-box {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .logo-text {
    font-size: 20px;
    font-weight: 900;
    color: #0d1117;
    letter-spacing: 0.15em;
  }
  .logo-tagline {
    font-size: 7px;
    color: #6b7280;
    font-style: italic;
    letter-spacing: 0.02em;
    max-width: 200px;
  }
  .doc-type {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .doc-title {
    font-size: 14px;
    font-weight: 900;
    color: #0d1117;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .doc-subtitle {
    font-size: 8px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .header-line {
    height: 2px;
    background: linear-gradient(90deg, #0d1117 0%, #00d4ff 50%, #a78bfa 100%);
    border-radius: 1px;
  }

  /* HERO BAND */
  .hero-band {
    background: #0d1117;
    color: white;
    padding: 6mm 8mm;
    margin-bottom: 6mm;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6mm;
  }
  .hero-img {
    width: 28mm;
    height: 20mm;
    object-fit: cover;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .hero-info { flex: 1; }
  .hero-name {
    font-size: 16px;
    font-weight: 900;
    color: white;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
  }
  .hero-category {
    font-size: 8px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
  .hero-badges {
    display: flex;
    gap: 3mm;
    margin-top: 3mm;
  }
  .badge {
    padding: 1mm 3mm;
    border-radius: 2px;
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: 1px solid;
  }
  .badge-cyan { color: #00d4ff; border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.1); }
  .badge-violet { color: #a78bfa; border-color: rgba(167,139,250,0.4); background: rgba(167,139,250,0.1); }
  .badge-gold { color: #f5c842; border-color: rgba(245,200,66,0.4); background: rgba(245,200,66,0.1); }
  .badge-green { color: #10b981; border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.1); }

  .hero-kpis {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2mm;
    flex-shrink: 0;
  }
  .kpi-item { text-align: right; }
  .kpi-label { font-size: 6px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
  .kpi-value { font-size: 13px; font-weight: 900; }
  .kpi-gold { color: #f5c842; }
  .kpi-cyan { color: #00d4ff; }
  .kpi-violet { color: #a78bfa; }

  /* SECTIONS */
  .section { margin-bottom: 5mm; }
  .section-title {
    font-size: 7px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 2mm;
    margin-bottom: 3mm;
  }
  .section-title span {
    display: inline-block;
    background: #0d1117;
    color: white;
    padding: 0.5mm 2mm;
    border-radius: 2px;
    margin-right: 2mm;
    font-size: 6px;
  }

  /* GRID */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
  .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3mm; }

  /* DATA CARD */
  .data-card {
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    padding: 3mm;
    background: #f9fafb;
  }
  .data-card-dark {
    border: 1px solid #1f2937;
    border-radius: 3px;
    padding: 3mm;
    background: #0d1117;
    color: white;
  }
  .data-label { font-size: 6.5px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1mm; }
  .data-value { font-size: 12px; font-weight: 900; color: #0d1117; }
  .data-value-white { font-size: 12px; font-weight: 900; color: white; }
  .data-value-cyan { font-size: 12px; font-weight: 900; color: #00d4ff; }
  .data-value-gold { font-size: 12px; font-weight: 900; color: #f5c842; }
  .data-value-violet { font-size: 12px; font-weight: 900; color: #a78bfa; }
  .data-value-green { font-size: 12px; font-weight: 900; color: #10b981; }
  .data-sub { font-size: 7px; color: #9ca3af; margin-top: 0.5mm; }

  /* TABLE */
  .table { width: 100%; border-collapse: collapse; font-size: 9px; }
  .table th { background: #0d1117; color: white; padding: 2mm 3mm; text-align: left; font-size: 7px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
  .table td { padding: 2mm 3mm; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .table tr:nth-child(even) td { background: #f9fafb; }
  .table .mono { font-family: monospace; font-size: 8px; color: #6b7280; }

  /* LYA SCORE BAR */
  .score-bar-wrap { margin: 2mm 0; }
  .score-bar-track { height: 3mm; background: #e5e7eb; border-radius: 2px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #a78bfa, #00d4ff); }

  /* SIGNATURE BLOCK */
  .sig-block {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 5mm;
    margin-top: 6mm;
    padding-top: 4mm;
    border-top: 1px solid #e5e7eb;
  }
  .sig-item { text-align: center; }
  .sig-line { border-bottom: 1px solid #0d1117; margin-bottom: 1mm; padding-bottom: 6mm; }
  .sig-label { font-size: 7px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; }

  /* WATERMARK */
  .watermark {
    position: fixed;
    bottom: 50mm;
    right: 10mm;
    font-size: 80px;
    font-weight: 900;
    color: rgba(0,0,0,0.03);
    transform: rotate(-45deg);
    letter-spacing: -0.05em;
    pointer-events: none;
    z-index: 0;
  }

  /* QR PLACEHOLDER */
  .qr-box {
    width: 20mm;
    height: 20mm;
    border: 1px solid #0d1117;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6px;
    color: #9ca3af;
    text-align: center;
    flex-shrink: 0;
  }

  /* FOOTER */
  .footer { margin-top: auto; padding-top: 4mm; }
  .footer-line { height: 1px; background: #e5e7eb; margin-bottom: 3mm; }
  .footer-content { display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-left { display: flex; flex-direction: column; gap: 1px; }
  .footer-brand { font-size: 9px; font-weight: 900; letter-spacing: 0.1em; color: #0d1117; }
  .footer-address { font-size: 7px; color: #9ca3af; }
  .footer-legal { font-size: 6.5px; color: #d1d5db; font-style: italic; }
  .footer-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
  .footer-date { font-size: 7px; color: #9ca3af; }
  .footer-ref { font-size: 7px; color: #6b7280; font-family: monospace; }
  .footer-seal {
    font-size: 9px;
    font-weight: 900;
    color: #0d1117;
    border: 1px solid #0d1117;
    padding: 1mm 3mm;
    border-radius: 2px;
    letter-spacing: 0.1em;
    margin-top: 1mm;
  }

  /* HIGHLIGHT BOX */
  .highlight-box {
    border-left: 3px solid #00d4ff;
    padding: 3mm 4mm;
    background: #f0f9ff;
    border-radius: 0 3px 3px 0;
    margin-bottom: 3mm;
  }
  .highlight-box p { font-size: 9px; color: #0c4a6e; line-height: 1.6; }

  /* LEGAL TEXT */
  .legal-text { font-size: 8.5px; color: #374151; line-height: 1.8; text-align: justify; }
  .legal-text p { margin-bottom: 2mm; }
  .legal-text strong { color: #0d1117; }
  .article-title {
    font-size: 9px;
    font-weight: 900;
    color: #0d1117;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 4mm 0 2mm;
    padding-left: 2mm;
    border-left: 2px solid #0d1117;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { margin: 0; padding: 12mm 14mm; }
    .watermark { display: none; }
  }
`;

function openDocument(html: string, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>${title} — LinkYourArt</title>
    <style>${BASE_STYLES}</style>
  </head><body>
    <div class="watermark">LYA</div>
    ${html}
    <script>
      window.onload = () => {
        // Bouton d'impression flottant
        const btn = document.createElement('div');
        btn.innerHTML = '🖨 Imprimer / Télécharger PDF';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0d1117;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:sans-serif;font-size:13px;font-weight:700;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        btn.onclick = () => window.console.log();
        document.body.appendChild(btn);
      };
    <\/script>
  </body></html>`);
  win.document.close();
}

// ─── CERTIFICAT LYA ──────────────────────────────────────────────────────────
export function generateCertificate(contract: Contract, lang: string) {
  const isFR = lang === 'FR';
  const scoreWidth = ((contract.totalScore || 0) / 10).toFixed(1);

  const html = `
  <div class="page">
    ${lyaHeader(
      isFR ? 'CERTIFICAT DE CONTRAT CRÉATIF' : 'CREATIVE CONTRACT CERTIFICATE',
      isFR ? `Registre officiel LinkYourArt — ${contract.registryIndex}` : `Official LinkYourArt Registry — ${contract.registryIndex}`,
      lang
    )}

    <!-- HERO -->
    <div class="hero-band">
      <img class="hero-img" src="${contract.image}" alt="${contract.name}" onerror="this.style.display='none'"/>
      <div class="hero-info">
        <div class="hero-name">${contract.name}</div>
        <div class="hero-category">${contract.category} · ${contract.issuerId}</div>
        <div class="hero-badges">
          <span class="badge badge-green">● ${isFR ? 'ACTIF' : 'ACTIVE'}</span>
          <span class="badge badge-violet">★ ${contract.rarity}</span>
          <span class="badge badge-cyan">${contract.registryIndex}</span>
        </div>
      </div>
      <div class="hero-kpis">
        <div class="kpi-item">
          <div class="kpi-label">LYA Score</div>
          <div class="kpi-value kpi-violet">${contract.totalScore}<span style="font-size:8px;color:rgba(167,139,250,0.4)">/1000</span></div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">${isFR ? 'Statut' : 'Status'}</div>
          <div class="kpi-value kpi-gold">${isFR ? 'Certifié' : 'Certified'}</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">${isFR ? 'Progression Score' : 'Score Growth'}</div>
          <div class="kpi-value" style="color:${contract.growth >= 0 ? '#10b981' : '#ef4444'}">${contract.growth >= 0 ? '+' : ''}${contract.growth}%</div>
        </div>
      </div>
    </div>

    <!-- IDENTITÉ DU CONTRAT -->
    <div class="section">
      <div class="section-title"><span>01</span> ${isFR ? 'IDENTITÉ DU CONTRAT' : 'CONTRACT IDENTITY'}</div>
      <div class="grid-4">
        <div class="data-card">
          <div class="data-label">${isFR ? 'Index Registre' : 'Registry Index'}</div>
          <div class="data-value" style="font-size:10px;font-family:monospace">${contract.registryIndex}</div>
        </div>
        <div class="data-card">
          <div class="data-label">${isFR ? 'Catégorie' : 'Category'}</div>
          <div class="data-value" style="font-size:10px">${contract.category}</div>
        </div>
        <div class="data-card">
          <div class="data-label">${isFR ? 'Date de création' : 'Creation date'}</div>
          <div class="data-value" style="font-size:10px">${contract.creationDate || '2026'}</div>
        </div>
        <div class="data-card">
          <div class="data-label">Status</div>
          <div class="data-value" style="font-size:10px;color:#10b981">${contract.status}</div>
        </div>
      </div>
    </div>

    <!-- LYA SCORE -->
    <div class="section">
      <div class="section-title"><span>02</span> LYA SCORE — ${isFR ? 'ÉVALUATION' : 'EVALUATION'}</div>
      <div class="grid-2">
        <div>
          <div class="data-card-dark" style="margin-bottom:3mm">
            <div class="data-label" style="color:rgba(255,255,255,0.3)">${isFR ? 'Score Global LYA' : 'LYA Global Score'}</div>
            <div class="data-value-violet">${contract.totalScore}<span style="font-size:9px;opacity:0.4">/1000</span></div>
            <div class="score-bar-wrap">
              <div class="score-bar-track"><div class="score-bar-fill" style="width:${scoreWidth}%"></div></div>
            </div>
          </div>
          <div class="grid-2">
            <div class="data-card">
              <div class="data-label">Score Algo</div>
              <div class="data-value">${contract.scoreAlgo || Math.round((contract.totalScore || 0) * 1.1)}</div>
            </div>
            <div class="data-card">
              <div class="data-label">Score Pro</div>
              <div class="data-value">${contract.scorePro || Math.round((contract.totalScore || 0) * 0.9)}</div>
            </div>
          </div>
        </div>
        <div>
          <div class="data-card-dark" style="margin-bottom:3mm">
            <div class="data-label" style="color:rgba(255,255,255,0.3)">${isFR ? 'Score LYA' : 'LYA Score'}</div>
            <div class="data-value-gold">${contract.totalScore}/1000</div>
            <div class="data-sub" style="color:rgba(255,255,255,0.3)">${contract.growth >= 0 ? '+' : ''}${contract.growth}% ${isFR ? 'depuis certification' : 'since certification'}</div>
          </div>
          <div class="data-card">
            <div class="data-label">${isFR ? 'Type de Mécénat' : 'Patronage Type'}</div>
            <div class="data-value data-value-green">${isFR ? 'De reconnaissance' : 'Recognition-based'}</div>
            <div class="data-sub">${isFR ? 'aucune participation aux revenus' : 'no revenue participation'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- DONNÉES ÉCONOMIQUES -->
    <div class="section">
      <div class="section-title"><span>03</span> ${isFR ? 'DONNÉES DE CERTIFICATION' : 'CERTIFICATION DATA'}</div>
      <div class="grid-4">
        <div class="data-card">
          <div class="data-label">${isFR ? 'Mécènes Soutiens' : 'Supporting Patrons'}</div>
          <div class="data-value">${(contract.totalUnits || 2841).toLocaleString()}</div>
        </div>
        <div class="data-card">
          <div class="data-label">${isFR ? 'Score LYA' : 'LYA Score'}</div>
          <div class="data-value">${contract.totalScore}/1000</div>
        </div>
        <div class="data-card">
          <div class="data-label">${isFR ? 'Statut' : 'Status'}</div>
          <div class="data-value" style="font-size:10px">${isFR ? 'Certifié' : 'Certified'}</div>
        </div>
        <div class="data-card">
          <div class="data-label">Rarity</div>
          <div class="data-value" style="font-size:10px;color:#a78bfa">${contract.rarity}</div>
        </div>
      </div>
    </div>

    <!-- SIGNATURE -->
    <div class="sig-block">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Créateur / Émetteur' : 'Creator / Issuer'}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Validateur LYA' : 'LYA Validator'}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Directeur LinkYourArt' : 'LinkYourArt Director'}</div>
      </div>
    </div>

    ${lyaFooter(contract, lang)}
  </div>`;

  openDocument(html, isFR ? `Certificat — ${contract.name}` : `Certificate — ${contract.name}`);
}

// ─── CONDITIONS LÉGALES ───────────────────────────────────────────────────────
export function generateLegalTerms(contract: Contract, lang: string) {
  const isFR = lang === 'FR';

  const articles = isFR ? [
    ['ART. 1 — DÉFINITIONS', `Dans le présent acte, "Certification" désigne la validation officielle d'un projet créatif par LinkYourArt, matérialisée par un Score LYA inscrit au Registre Officiel LYA. "Mécène" désigne toute personne physique ou morale ayant apporté un soutien financier au projet dans le cadre d'une campagne de mécénat de reconnaissance. "Créateur" désigne l'émetteur du projet créatif référencé sous l'index ${contract.registryIndex}.`],
    ['ART. 2 — OBJET DU CONTRAT', `Le présent contrat a pour objet d'établir les droits et obligations entre LinkYourArt, le Créateur et les Mécènes relatifs au projet "${contract.name}". Le soutien apporté par un Mécène constitue un mécénat de reconnaissance : il ouvre droit aux contreparties définies à l'Article 3, à l'exclusion de toute participation financière aux revenus de l'œuvre.`],
    ['ART. 3 — DROITS DES MÉCÈNES', `Les Mécènes bénéficient des contreparties convenues au moment de leur soutien, graduées selon le palier de reconnaissance atteint : inscription permanente et publique au Registre LYA, certificat de mécénat physique et numéroté, expérience liée au projet (session studio, avant-première, visite d'atelier selon la discipline), et à partir du palier le plus élevé, un crédit nominatif officiel sur l'œuvre finale (ex. Producteur Exécutif Associé, Co-Producteur), selon les modalités propres à chaque campagne. Ces contreparties, bien que substantielles, ne constituent ni un titre financier, ni un droit de participation aux revenus, ni un instrument négociable, ni un droit de propriété intellectuelle sur l'œuvre. Les Mécènes ne bénéficient d'aucun droit de décision sur les choix artistiques du Créateur.`],
    ['ART. 4 — OBLIGATIONS DU CRÉATEUR', `Le Créateur s'engage à tenir à jour l'avancement de son projet sur le Registre LYA et à informer les Mécènes des jalons franchis. Le Créateur garantit être titulaire de l'ensemble des droits de propriété intellectuelle relatifs à l'œuvre.`],
    ['ART. 5 — SCORE LYA & CERTIFICATION', `Le Score LYA, actuellement établi à ${contract.totalScore}/1000, est calculé par LinkYourArt selon une méthodologie propriétaire combinant évaluation algorithmique et validation par des professionnels certifiés. Ce score constitue un indicateur de qualité et de maturité du projet ; il ne constitue ni une valorisation financière, ni une garantie de rendement.`],
    ['ART. 6 — DURÉE ET RÉSILIATION', `Le présent contrat est conclu pour une durée indéterminée à compter de sa date d'émission. Il peut être résilié par LinkYourArt en cas de manquement grave du Créateur ou de décision de la gouvernance LYA. La résiliation n'emporte aucune obligation de remboursement, les contreparties visées à l'Article 3 n'étant pas de nature financière.`],
    ['ART. 7 — DROIT APPLICABLE', `Le présent contrat est soumis au droit français. Tout litige relatif à son interprétation ou son exécution sera soumis à la compétence exclusive des tribunaux de Paris.`],
  ] : [
    ['ART. 1 — DEFINITIONS', `In this agreement, "Certification" means the official validation of a creative project by LinkYourArt, evidenced by a LYA Score recorded on the Official LYA Registry. "Patron" means any natural or legal person who has provided financial support to the project under a recognition-based patronage campaign. "Creator" means the issuer of the creative project referenced under index ${contract.registryIndex}.`],
    ['ART. 2 — PURPOSE', `This contract establishes the rights and obligations between LinkYourArt, the Creator and Patrons relating to the project "${contract.name}". Support provided by a Patron constitutes recognition-based patronage: it entitles the Patron to the considerations defined in Article 3, to the exclusion of any financial participation in the work's revenues.`],
    ['ART. 3 — PATRONS RIGHTS', `Patrons benefit from the considerations agreed at the time of their support, graduated by recognition tier reached: permanent, public inscription on the LYA Registry, a numbered physical patronage certificate, an experience tied to the project (studio session, premiere, atelier visit depending on the discipline), and from the highest tier, an official named credit on the finished work (e.g. Associate Executive Producer, Co-Producer), per the terms of each campaign. While substantial, these considerations do not constitute a financial security, a right to revenue participation, a tradeable instrument, or an intellectual property right in the work. Patrons have no decision-making rights over the Creator's artistic choices.`],
    ['ART. 4 — CREATOR OBLIGATIONS', `The Creator agrees to keep the project's progress updated on the LYA Registry and to inform Patrons of milestones reached. The Creator warrants ownership of all intellectual property rights relating to the work.`],
    ['ART. 5 — LYA SCORE & CERTIFICATION', `The LYA Score, currently set at ${contract.totalScore}/1000, is calculated by LinkYourArt according to a proprietary methodology combining algorithmic evaluation and validation by certified professionals. This score constitutes a quality and maturity indicator for the project; it does not constitute a financial valuation or a return guarantee.`],
    ['ART. 6 — TERM AND TERMINATION', `This contract is concluded for an indefinite term from its date of issue. It may be terminated by LinkYourArt in case of serious breach by the Creator or decision of LYA governance. Termination entails no reimbursement obligation, as the considerations referred to in Article 3 are non-financial in nature.`],
    ['ART. 7 — GOVERNING LAW', `This contract is governed by French law. Any dispute relating to its interpretation or performance shall be submitted to the exclusive jurisdiction of the Paris courts.`],
  ];

  const html = `
  <div class="page">
    ${lyaHeader(
      isFR ? 'CONDITIONS LÉGALES DU CONTRAT' : 'CONTRACT LEGAL TERMS',
      isFR ? `Acte contractuel officiel — ${contract.registryIndex}` : `Official contractual deed — ${contract.registryIndex}`,
      lang
    )}

    <div class="hero-band" style="padding:4mm 6mm">
      <div class="hero-info">
        <div class="hero-name" style="font-size:13px">${contract.name}</div>
        <div class="hero-category">${contract.registryIndex} · ${contract.category} · ${isFR ? 'Émis par' : 'Issued by'} LinkYourArt</div>
      </div>
      <div class="hero-kpis">
        <div class="kpi-item">
          <div class="kpi-label">LYA Score</div>
          <div class="kpi-value kpi-violet">${contract.totalScore}/1000</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">${isFR ? 'Statut' : 'Status'}</div>
          <div class="kpi-value kpi-gold">${isFR ? 'Certifié' : 'Certified'}</div>
        </div>
      </div>
    </div>

    <div class="highlight-box">
      <p><strong>${isFR ? 'Document officiel LinkYourArt' : 'Official LinkYourArt document'}</strong> — ${isFR ? 'Ce document constitue les conditions contractuelles légales régissant la certification et le mécénat de reconnaissance du projet créatif référencé ci-dessus. Il est émis par LinkYourArt, marque de LINKYOURART SASU, et conservé dans le Registre Officiel LYA.' : 'This document constitutes the legal contractual conditions governing the certification and recognition-based patronage of the above-referenced creative project. It is issued by LinkYourArt, marque de LINKYOURART SASU, and maintained in the Official LYA Registry.'}</p>
    </div>

    <div class="legal-text">
      ${articles.map(([title, content]) => `
        <div class="article-title">${title}</div>
        <p>${content}</p>
      `).join('')}
    </div>

    <div class="sig-block">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Créateur / Émetteur' : 'Creator / Issuer'}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">LinkYourArt</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Validateur LYA Certifié' : 'Certified LYA Validator'}</div>
      </div>
    </div>

    ${lyaFooter(contract, lang)}
  </div>`;

  openDocument(html, isFR ? `Conditions Légales — ${contract.name}` : `Legal Terms — ${contract.name}`);
}

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────
export function generatePermissions(contract: Contract, lang: string) {
  const isFR = lang === 'FR';

  const permissions = isFR ? [
    { granted: true, title: 'Contreparties de mécénat', desc: 'Bénéfice des contreparties convenues (mention au générique, accès anticipé, mises à jour exclusives), selon les modalités propres à la campagne.' },
    { granted: true, title: 'Accès aux rapports', desc: 'Consultation des rapports mensuels d\'avancement, des jalons du projet et de l\'historique du Score LYA.' },
    { granted: true, title: 'Badge Mécène Certifié', desc: 'Affichage d\'un badge de reconnaissance sur le profil LYA, proportionnel à l\'ancienneté et au nombre de projets soutenus.' },
    { granted: false, title: 'Participation aux revenus', desc: 'Le soutien apporté ne donne droit à aucune participation financière aux revenus générés par l\'œuvre.' },
    { granted: false, title: 'Modification de l\'œuvre', desc: 'Les Mécènes ne disposent d\'aucun droit de modification ou de direction artistique sur l\'œuvre.' },
    { granted: false, title: 'Utilisation commerciale directe', desc: 'L\'utilisation directe de l\'œuvre à des fins commerciales sans accord préalable de LinkYourArt et du Créateur est interdite.' },
    { granted: false, title: 'Cession des contreparties', desc: 'Les contreparties de mécénat sont personnelles et non cessibles à un tiers.' },
  ] : [
    { granted: true, title: 'Patronage considerations', desc: 'Benefit from the considerations agreed at the time of support (credit mention, early access, exclusive updates), per the terms of each campaign.' },
    { granted: true, title: 'Report access', desc: 'Access to monthly progress reports, project milestones and LYA Score history.' },
    { granted: true, title: 'Certified Patron Badge', desc: 'Display of a recognition badge on the LYA profile, proportional to tenure and number of projects supported.' },
    { granted: false, title: 'Revenue participation', desc: 'Support provided does not entitle the Patron to any financial participation in the work\'s revenues.' },
    { granted: false, title: 'Work modification', desc: 'Patrons have no right to modify or artistically direct the work.' },
    { granted: false, title: 'Direct commercial use', desc: 'Direct use of the work for commercial purposes without prior agreement from LinkYourArt and the Creator is prohibited.' },
    { granted: false, title: 'Transfer of considerations', desc: 'Patronage considerations are personal and non-transferable to a third party.' },
  ];

  const html = `
  <div class="page">
    ${lyaHeader(
      isFR ? 'MATRICE DES PERMISSIONS' : 'PERMISSIONS MATRIX',
      isFR ? `Droits et restrictions officiels — ${contract.registryIndex}` : `Official rights and restrictions — ${contract.registryIndex}`,
      lang
    )}

    <div class="hero-band" style="padding:4mm 6mm">
      <div class="hero-info">
        <div class="hero-name" style="font-size:13px">${contract.name}</div>
        <div class="hero-category">${contract.registryIndex} · ${isFR ? 'Permissions applicables aux Mécènes' : 'Permissions applicable to Patrons'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title"><span>✓</span> ${isFR ? 'DROITS ACCORDÉS' : 'GRANTED RIGHTS'}</div>
      ${permissions.filter(p => p.granted).map(p => `
        <div style="display:flex;gap:3mm;margin-bottom:3mm;align-items:flex-start">
          <div style="width:5mm;height:5mm;background:#10b981;border-radius:50%;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-size:7px;font-weight:900">✓</span>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#0d1117;margin-bottom:1px">${p.title}</div>
            <div style="font-size:8px;color:#6b7280;line-height:1.5">${p.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <div class="section-title"><span>✗</span> ${isFR ? 'RESTRICTIONS' : 'RESTRICTIONS'}</div>
      ${permissions.filter(p => !p.granted).map(p => `
        <div style="display:flex;gap:3mm;margin-bottom:3mm;align-items:flex-start">
          <div style="width:5mm;height:5mm;background:#ef4444;border-radius:50%;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-size:7px;font-weight:900">✗</span>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#0d1117;margin-bottom:1px">${p.title}</div>
            <div style="font-size:8px;color:#6b7280;line-height:1.5">${p.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="grid-3" style="margin-top:4mm">
      <div class="data-card" style="text-align:center">
        <div class="data-label">${isFR ? 'LYA Score' : 'LYA Score'}</div>
        <div class="data-value" style="color:#a78bfa">${contract.totalScore}/1000</div>
      </div>
      <div class="data-card" style="text-align:center">
        <div class="data-label">${isFR ? 'Type de Mécénat' : 'Patronage Type'}</div>
        <div class="data-value" style="color:#10b981">${isFR ? 'De reconnaissance' : 'Recognition-based'}</div>
      </div>
      <div class="data-card" style="text-align:center">
        <div class="data-label">${isFR ? 'Score LYA' : 'LYA Score'}</div>
        <div class="data-value" style="color:#f5c842">${contract.totalScore}/1000</div>
      </div>
    </div>

    <div class="sig-block">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Créateur' : 'Creator'}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">LinkYourArt</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-label">${isFR ? 'Juriste LYA' : 'LYA Legal'}</div>
      </div>
    </div>

    ${lyaFooter(contract, lang)}
  </div>`;

  openDocument(html, isFR ? `Permissions — ${contract.name}` : `Permissions — ${contract.name}`);
}
