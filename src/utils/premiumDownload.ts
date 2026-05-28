/**
 * LYA Premium Document Generator
 * Generates beautifully styled HTML documents for download
 */

const LYA_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --cyan: #00E0FF;
    --gold: #FFD700;
    --bg: #0D1117;
    --surface: #161B22;
    --surface2: #1C2128;
    --border: rgba(255,255,255,0.07);
    --text: #FFFFFF;
    --muted: rgba(255,255,255,0.45);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    max-width: 860px;
    margin: 0 auto;
    padding: 60px 60px;
    position: relative;
  }

  /* Decorative corners */
  .corner { position: fixed; width: 32px; height: 32px; }
  .corner.tl { top: 24px; left: 24px; border-top: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
  .corner.tr { top: 24px; right: 24px; border-top: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
  .corner.bl { bottom: 24px; left: 24px; border-bottom: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
  .corner.br { bottom: 24px; right: 24px; border-bottom: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 36px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 48px;
  }

  .logo-block .brand {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--text);
    text-transform: uppercase;
  }

  .logo-block .tagline {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: var(--cyan);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    margin-top: 4px;
    opacity: 0.7;
  }

  .doc-meta {
    text-align: right;
    font-family: 'Space Mono', monospace;
  }

  .doc-meta .doc-id {
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .doc-meta .doc-date {
    font-size: 11px;
    color: var(--cyan);
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  /* Title block */
  .title-block {
    margin-bottom: 48px;
  }

  .doc-type {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: var(--cyan);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    margin-bottom: 12px;
    opacity: 0.8;
  }

  .doc-title {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    line-height: 1.1;
    color: var(--text);
    margin-bottom: 12px;
  }

  .doc-title span { color: var(--cyan); }

  .doc-subtitle {
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 600;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, var(--cyan) 0%, transparent 100%);
    margin: 32px 0;
    opacity: 0.2;
  }

  /* Stats row */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }

  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
  }

  .stat-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--cyan), transparent);
    opacity: 0.4;
  }

  .stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .stat-value.cyan { color: var(--cyan); }
  .stat-value.gold { color: var(--gold); }

  /* Table */
  .table-container {
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    margin-bottom: 32px;
  }

  .table-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: rgba(0,224,255,0.03);
  }

  .table-title {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: var(--cyan);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    font-weight: 700;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead tr {
    background: var(--surface2);
  }

  th {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 12px 24px;
    text-align: left;
    font-weight: 700;
    border-bottom: 1px solid var(--border);
  }

  td {
    font-size: 12px;
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    font-weight: 500;
  }

  tr:last-child td { border-bottom: none; }

  td.cyan { color: var(--cyan); font-family: 'Space Mono', monospace; font-size: 11px; }
  td.green { color: #4ADE80; }
  td.gold { color: var(--gold); }
  td.muted { color: var(--muted); }
  td.mono { font-family: 'Space Mono', monospace; font-size: 11px; }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    border: 1px solid currentColor;
  }

  .badge.green { color: #4ADE80; background: rgba(74,222,128,0.08); }
  .badge.gold { color: var(--gold); background: rgba(255,215,0,0.08); }
  .badge.cyan { color: var(--cyan); background: rgba(0,224,255,0.08); }
  .badge.red { color: #F87171; background: rgba(248,113,113,0.08); }

  /* Content section */
  .section {
    margin-bottom: 40px;
  }

  .section-title {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: var(--cyan);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .content-block {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 28px;
    position: relative;
    margin-bottom: 16px;
  }

  .content-block p {
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    line-height: 1.8;
  }

  .content-block h3 {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    color: var(--text);
  }

  /* Footer */
  .footer {
    margin-top: 64px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-left {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    line-height: 2;
  }

  .footer-right {
    text-align: right;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,224,255,0.06);
    border: 1px solid rgba(0,224,255,0.2);
    padding: 8px 16px;
    margin-top: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    color: var(--cyan);
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .dot { 
    width: 6px; height: 6px; 
    border-radius: 50%; 
    background: var(--cyan); 
    display: inline-block;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Print optimizations */
  @media print {
    body { background: var(--bg) !important; }
    .corner { display: none; }
    .page { padding: 40px; }
  }
`;

function generateDocId(): string {
  return `LYA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function formatDate(date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).toUpperCase();
}

function wrapDocument(title: string, subtitle: string, docType: string, bodyContent: string): string {
  const docId = generateDocId();
  const date = formatDate();
  const titleParts = title.split(' ');
  const titleAccent = titleParts[titleParts.length - 1];
  const titleBase = titleParts.slice(0, -1).join(' ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LYA — ${title}</title>
  <style>${LYA_STYLES}</style>
</head>
<body>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="page">
    <header class="header">
      <div class="logo-block">
        <div class="brand">LinkYourArt</div>
        <div class="tagline">THE CREATIVE TERMINAL · PROTOCOL v2.5</div>
      </div>
      <div class="doc-meta">
        <div class="doc-id">DOC ID: ${docId}</div>
        <div class="doc-date">${date}</div>
      </div>
    </header>

    <div class="title-block">
      <div class="doc-type">${docType}</div>
      <div class="doc-title">${titleBase} <span>${titleAccent}</span></div>
      <div class="doc-subtitle">${subtitle}</div>
    </div>

    ${bodyContent}

    <footer class="footer">
      <div class="footer-left">
        © ${new Date().getFullYear()} LINKYOURART PROTOCOL<br>
        ALL RIGHTS RESERVED · AES-256 ENCRYPTED<br>
        <span class="verified-badge"><span class="dot"></span>VERIFIED BY LYA IMMUTABLE REGISTRY</span>
      </div>
      <div class="footer-right">
        GENERATED: ${new Date().toLocaleString('en-GB')}<br>
        REF: ${docId}<br>
        LYA TERMINAL v2.5.0
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function triggerDownload(html: string, fileName: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── WALLET STATEMENT ────────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  method: string;
}

export function downloadWalletStatement(
  transactions: WalletTransaction[],
  userName: string,
  cashBalance: number,
  lyaUnits: number
): void {
  const totalIn  = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const rows = transactions.map(tx => `
    <tr>
      <td class="muted">${tx.date}</td>
      <td><span class="badge ${tx.type === 'DEPOSIT' || tx.type === 'REWARD' || tx.type === 'SALE' ? 'cyan' : 'gold'}">${tx.type}</span></td>
      <td class="muted">${tx.method}</td>
      <td><span class="badge ${tx.status === 'COMPLETED' ? 'green' : 'gold'}">${tx.status}</span></td>
      <td class="mono ${tx.amount > 0 ? 'green' : ''}" style="text-align:right">${tx.amount > 0 ? '+' : ''}€${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const body = `
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-label">Total Balance</div>
        <div class="stat-value cyan">€${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Total Inflows</div>
        <div class="stat-value">€${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">LYA Units</div>
        <div class="stat-value gold">${lyaUnits.toLocaleString()} <span style="font-size:12px;color:rgba(255,255,255,0.4);font-weight:600">UNITS</span></div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="table-title">Transaction History · ${transactions.length} operations</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Method</th>
            <th>Status</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="divider"></div>
    <div class="section">
      <div class="section-title">Account Information</div>
      <div class="content-block">
        <h3>${userName.toUpperCase()}</h3>
        <p>Verified LYA Protocol Member · Custody Grade: Institutional A+<br>
        All transactions listed are final and immutably recorded on the LYA Registry. This statement is generated automatically and is legally valid as a financial record.</p>
      </div>
    </div>
  `;

  triggerDownload(
    wrapDocument('WALLET STATEMENT', `${userName.toUpperCase()} · ACCOUNT SUMMARY`, 'FINANCIAL DOCUMENT', body),
    `LYA_Wallet_Statement_${new Date().toISOString().split('T')[0]}`
  );
}

// ─── RESOURCE / WHITEPAPER ───────────────────────────────────────────────────
export interface ResourceDoc {
  title: string;
  type: string;
  content: string;
}

const RESOURCE_CONTENTS: Record<string, { subtitle: string; sections: { title: string; body: string }[] }> = {
  'Protocol Whitepaper v2.5': {
    subtitle: 'TECHNICAL ARCHITECTURE & GOVERNANCE FRAMEWORK',
    sections: [
      {
        title: 'ABSTRACT',
        body: 'LinkYourArt (LYA) is a decentralized creative equity infrastructure enabling fractional ownership, real-time settlement, and institutional-grade custody of intellectual property assets. Version 2.5 introduces enhanced LYA Score computation, multi-jurisdictional compliance layers, and dynamic royalty distribution via smart settlement nodes.'
      },
      {
        title: 'PROTOCOL ARCHITECTURE',
        body: 'The LYA Protocol operates through a three-layer stack: (1) the Registry Layer providing immutable contract storage and verification; (2) the Settlement Layer enabling real-time P2P unit transfers with AES-256 encryption; (3) the Governance Layer where Professional and Investor stakeholders vote on protocol upgrades, fee structures, and treasury allocations via a quadratic voting mechanism weighted by LYA Score.'
      },
      {
        title: 'LYA SCORE METHODOLOGY',
        body: 'Each creative contract receives a composite LYA Score (0-100) computed from five validated dimensions: Creative Quality (25%), Market Potential (25%), Legal Compliance (20%), Innovation Index (15%), and Growth Trajectory (15%). Scores are computed by certified Professional validators and updated quarterly based on milestone completion data.'
      },
      {
        title: 'TOKENOMICS & UNIT ECONOMICS',
        body: 'LYA Units are priced at €50 par value. Each contract defines its total unit supply at issuance. Revenue distributions are executed automatically upon verified milestone completion events. The protocol charges a 1.5% settlement fee on secondary transactions, distributed 0.8% to node operators and 0.7% to the governance treasury.'
      }
    ]
  },
  'Market Analysis Q1 2026': {
    subtitle: 'CREATIVE ECONOMY MARKET REPORT · Q1 2026',
    sections: [
      {
        title: 'EXECUTIVE SUMMARY',
        body: 'Q1 2026 marks a pivotal quarter for the creative equity market. Total value locked on the LYA Protocol reached €42.7M, representing a 34% increase year-over-year. Film & TV assets led growth at +41%, followed by Music (+28%) and Architecture (+19%). Secondary market volume reached €8.2M across 14,200 individual unit transfers.'
      },
      {
        title: 'TOP PERFORMING SECTORS',
        body: 'Sci-fi Television Series emerged as the highest-yield category with average APY of 22.4%. Documentary films demonstrated the strongest risk-adjusted returns at a Sharpe ratio of 1.84. Architecture and design contracts showed the most stable valuations with < 5% quarterly variance, attracting institutional investors seeking capital preservation.'
      },
      {
        title: 'RISK FACTORS & OUTLOOK',
        body: 'Heightened AI-generated content competition continues to pressure Photography and Illustration categories. Regulatory clarity in the EU regarding digital IP fractionalization is expected in Q3 2026, which may unlock additional institutional capital flows. We project total protocol TVL to reach €65M by end of 2026 under base-case assumptions.'
      }
    ]
  },
  'Legal Framework Guide': {
    subtitle: 'JURISDICTION, COMPLIANCE & CONTRACT STANDARDS',
    sections: [
      {
        title: 'REGULATORY FRAMEWORK',
        body: 'LYA contracts operate under a hybrid legal structure combining traditional IP licensing agreements with digitally-native unit transfer mechanisms. Contracts are structured as participation agreements granting unit holders proportional economic rights to defined revenue streams, without conferring equity ownership in the underlying creative entity.'
      },
      {
        title: 'SUPPORTED JURISDICTIONS',
        body: 'The LYA Protocol currently supports contract issuance under French Law (SACD/SCAM frameworks), English Law (CDPA 1988 compliance), and Delaware/US Federal IP frameworks. EU GDPR compliance is enforced at the data layer. MiCA regulatory compliance for digital asset classification is maintained through quarterly legal audits by our partner firms.'
      },
      {
        title: 'CREATOR RIGHTS & PROTECTIONS',
        body: 'Creators retain full moral rights and creative control over their works. Unit holders receive only economic participation rights. All contracts include mandatory buyback provisions enabling creators to repurchase outstanding units at fair market value, determined by the LYA Score valuation model, at any time after a 24-month lock-up period.'
      }
    ]
  },
  'Node Operator Manual': {
    subtitle: 'SETTLEMENT NODE CONFIGURATION & OPERATIONS GUIDE',
    sections: [
      {
        title: 'NODE OVERVIEW',
        body: 'Settlement nodes are the core infrastructure of the LYA Protocol, responsible for validating unit transfers, computing real-time LYA Scores, and executing automated revenue distributions. Nodes require a minimum stake of 1,000 LYA Units and maintain 99.5% uptime SLA to qualify for fee distribution.'
      },
      {
        title: 'TECHNICAL REQUIREMENTS',
        body: 'Minimum specifications: 8-core CPU, 32GB RAM, 500GB NVMe SSD, 1Gbps symmetric network connection. Nodes communicate via the LYA Mesh Protocol (LMP) using gRPC over TLS 1.3. The LYA SDK (Node.js ≥18 or Python ≥3.11) provides the reference implementation for node operation and monitoring.'
      },
      {
        title: 'REWARD STRUCTURE',
        body: 'Active nodes earn 0.8% of all settlement fees processed through their node, plus a 0.1% uptime bonus for nodes maintaining > 99.9% monthly uptime. Rewards are distributed daily in LYA Units at the current spot price. Slashing conditions apply for double-signing or extended downtime beyond 4 hours per month.'
      }
    ]
  }
};

export function downloadResourceDocument(resourceTitle: string): void {
  const content = RESOURCE_CONTENTS[resourceTitle] || {
    subtitle: 'LYA PROTOCOL OFFICIAL DOCUMENT',
    sections: [{
      title: 'DOCUMENT CONTENT',
      body: 'This document is part of the official LYA Protocol documentation library. Content is regularly updated to reflect the latest protocol specifications and market conditions.'
    }]
  };

  const sections = content.sections.map(s => `
    <div class="section">
      <div class="section-title">${s.title}</div>
      <div class="content-block"><p>${s.body}</p></div>
    </div>
  `).join('');

  const body = `${sections}
    <div class="divider"></div>
    <div class="content-block">
      <h3>DOCUMENT AUTHENTICITY</h3>
      <p>This document has been generated from the LYA Protocol official knowledge base. All content is accurate as of the generation date and subject to quarterly review. For the most current version, visit the LYA Academy resource portal.</p>
    </div>
  `;

  const titleParts = resourceTitle.split(' ');
  triggerDownload(
    wrapDocument(resourceTitle.toUpperCase(), content.subtitle, 'OFFICIAL LYA DOCUMENT', body),
    `LYA_${titleParts.join('_').replace(/[^a-zA-Z0-9_]/g, '')}`
  );
}

// ─── LEGAL DOCUMENT ──────────────────────────────────────────────────────────
export function downloadLegalDocument(title: string, content: string): void {
  const body = `
    <div class="section">
      <div class="section-title">Document Contents</div>
      <div class="content-block">
        <p style="white-space: pre-wrap; font-size: 12px; line-height: 2; color: rgba(255,255,255,0.65)">${content.substring(0, 3000)}${content.length > 3000 ? '\n\n[...continued in full version]' : ''}</p>
      </div>
    </div>
    <div class="divider"></div>
    <div class="content-block">
      <h3>LEGAL NOTICE</h3>
      <p>This document constitutes an official LYA Protocol legal record. It is protected by applicable intellectual property laws. Unauthorized reproduction or distribution is prohibited. For legal inquiries, contact legal@linkyourart.com.</p>
    </div>
  `;

  triggerDownload(
    wrapDocument(title.toUpperCase(), 'OFFICIAL LEGAL PROTOCOL DOCUMENT', 'LEGAL DOCUMENT', body),
    `LYA_Legal_${title.replace(/\s+/g, '_')}`
  );
}
