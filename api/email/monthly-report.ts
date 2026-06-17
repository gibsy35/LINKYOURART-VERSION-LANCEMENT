import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendMail } from './smtp';

// ─── TEMPLATE RAPPORT MENSUEL ─────────────────────────────────────────────────

function buildMonthlyReportHtml(data: {
  patronName: string;
  month: string;
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  avgRoi: number;
  projects: {
    name: string;
    category: string;
    invested: number;
    currentValue: number;
    growth: number;
    lyaUnit: number;
    lyaScore: number;
    status: string;
    milestones: string[];
  }[];
  topPerformer: string;
  worstPerformer: string;
  lang: 'FR' | 'EN';
}) {
  const T = (fr: string, en: string) => data.lang === 'FR' ? fr : en;
  const up = data.totalProfit >= 0;
  const currency = (n: number) => `$${n.toFixed(2)}`;

  const projectRows = data.projects.map(p => {
    const pUp = p.growth >= 0;
    const statusColor = p.status === 'LIVE' ? '#10b981' : p.status === 'RISK' ? '#f43f5e' : '#f59e0b';
    const milestonesHtml = p.milestones.length > 0
      ? `<ul style="margin:4px 0 0 0;padding-left:16px;">${p.milestones.map(m => `<li style="font-size:11px;color:#6b7280;margin-bottom:2px;">${m}</li>`).join('')}</ul>`
      : `<p style="font-size:11px;color:#6b7280;margin:4px 0 0 0;">${T('Aucun jalon ce mois', 'No milestones this month')}</p>`;

    return `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #1f2937;vertical-align:top;">
        <p style="font-size:13px;font-weight:900;color:#f9fafb;margin:0 0 2px 0;">${p.name}</p>
        <p style="font-size:11px;color:#6b7280;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.08em;">${p.category}</p>
        <span style="font-size:10px;font-weight:700;color:${statusColor};text-transform:uppercase;letter-spacing:0.08em;">● ${p.status}</span>
        ${milestonesHtml}
      </td>
      <td style="padding:16px;border-bottom:1px solid #1f2937;text-align:right;vertical-align:top;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 2px 0;">${T('Investi','Invested')}</p>
        <p style="font-size:14px;font-weight:900;color:#f9fafb;margin:0;">${currency(p.invested)}</p>
      </td>
      <td style="padding:16px;border-bottom:1px solid #1f2937;text-align:right;vertical-align:top;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 2px 0;">${T('Valeur','Value')}</p>
        <p style="font-size:14px;font-weight:900;color:${pUp ? '#10b981' : '#f43f5e'};margin:0;">${currency(p.currentValue)}</p>
        <p style="font-size:11px;font-weight:700;color:${pUp ? '#10b981' : '#f43f5e'};margin:2px 0 0 0;">${pUp ? '+' : ''}${p.growth}%</p>
      </td>
      <td style="padding:16px;border-bottom:1px solid #1f2937;text-align:right;vertical-align:top;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 2px 0;">LYA UNIT</p>
        <p style="font-size:14px;font-weight:900;color:#f59e0b;margin:0;">${currency(p.lyaUnit)}</p>
        <p style="font-size:11px;color:#6b7280;margin:2px 0 0 0;">${T('Score:','Score:')} ${p.lyaScore}/1000</p>
      </td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${data.lang === 'FR' ? 'fr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${T('Rapport Mensuel LYA', 'Monthly LYA Report')} — ${data.month}</title>
</head>
<body style="margin:0;padding:0;background-color:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#a78bfa);border-radius:16px;padding:2px;margin-bottom:16px;">
        <div style="background:#0D1117;border-radius:14px;padding:12px 24px;">
          <p style="font-size:18px;font-weight:900;color:#00d4ff;margin:0;letter-spacing:0.1em;text-transform:uppercase;">LinkYourArt</p>
        </div>
      </div>
      <h1 style="font-size:28px;font-weight:900;color:#f9fafb;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:-0.02em;">
        ${T('Rapport Mensuel', 'Monthly Report')}
      </h1>
      <p style="font-size:14px;color:#6b7280;margin:0;">${data.month} · ${T('Portfolio Mécène', 'Patron Portfolio')}</p>
    </div>

    <!-- Salutation -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="font-size:15px;color:#d1d5db;margin:0 0 8px 0;">${T('Bonjour', 'Hello')} <strong style="color:#f9fafb;">${data.patronName}</strong>,</p>
      <p style="font-size:14px;color:#9ca3af;margin:0;line-height:1.6;">
        ${T(
          `Voici le résumé de votre portfolio LinkYourArt pour le mois de <strong style="color:#f9fafb;">${data.month}</strong>. Vos LYA Units ont été mis à jour selon les performances de chaque projet.`,
          `Here is your LinkYourArt portfolio summary for <strong style="color:#f9fafb;">${data.month}</strong>. Your LYA Units have been updated according to each project's performance.`
        )}
      </p>
    </div>

    <!-- KPIs globaux -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
      <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;text-align:center;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.08em;">${T('Valeur actuelle','Current value')}</p>
        <p style="font-size:24px;font-weight:900;color:${up ? '#10b981' : '#f43f5e'};margin:0;">${currency(data.currentValue)}</p>
        <p style="font-size:12px;font-weight:700;color:${up ? '#10b981' : '#f43f5e'};margin:4px 0 0 0;">${up ? '+' : ''}${data.avgRoi.toFixed(1)}% ROI</p>
      </div>
      <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;text-align:center;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.08em;">P&L ${T('total','total')}</p>
        <p style="font-size:24px;font-weight:900;color:${up ? '#10b981' : '#f43f5e'};margin:0;">${up ? '+' : ''}${currency(data.totalProfit)}</p>
        <p style="font-size:12px;color:#6b7280;margin:4px 0 0 0;">${T('depuis l\'émission','since issuance')}</p>
      </div>
    </div>

    <!-- Top / Worst -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
      <div style="background:#064e3b;border:1px solid #10b981;border-radius:12px;padding:16px;">
        <p style="font-size:10px;font-weight:700;color:#10b981;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.1em;">🏆 ${T('Meilleur soutien','Best pledge')}</p>
        <p style="font-size:14px;font-weight:900;color:#f9fafb;margin:0;">${data.topPerformer}</p>
      </div>
      <div style="background:#450a0a;border:1px solid #f43f5e;border-radius:12px;padding:16px;">
        <p style="font-size:10px;font-weight:700;color:#f43f5e;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.1em;">⚠ ${T('À surveiller','Watch out')}</p>
        <p style="font-size:14px;font-weight:900;color:#f9fafb;margin:0;">${data.worstPerformer}</p>
      </div>
    </div>

    <!-- Table projets -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:20px 24px;border-bottom:1px solid #1f2937;">
        <h2 style="font-size:15px;font-weight:900;color:#f9fafb;margin:0;text-transform:uppercase;letter-spacing:0.05em;">${T('Détail de vos soutiens','Your pledges detail')}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0D1117;">
            <th style="padding:12px 16px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">${T('Projet','Project')}</th>
            <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;">${T('Investi','Invested')}</th>
            <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;">${T('Valeur','Value')}</th>
            <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;">LYA UNIT</th>
          </tr>
        </thead>
        <tbody>${projectRows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://linkyourart.com" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#a78bfa);border-radius:12px;padding:14px 32px;font-size:13px;font-weight:900;color:#030712;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;">
        ${T('Voir mon portfolio complet →', 'View my full portfolio →')}
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #1f2937;">
      <p style="font-size:11px;color:#374151;margin:0 0 4px 0;">LinkYourArt · contact@linkyourart.com</p>
      <p style="font-size:11px;color:#374151;margin:0;">
        ${T(
          '⚠ Les investissements dans des projets artistiques comportent des risques. La valeur des LYA Units peut baisser.',
          '⚠ Investments in artistic projects carry risks. LYA Unit values may decrease.'
        )}
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── HANDLER VERCEL ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Sécurité basique — clé secrète
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.CRON_SECRET || 'lya-monthly-report-2026';
  if (authHeader !== `Bearer ${expectedKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, patronName, lang = 'FR', projects, totalInvested, currentValue, month } = req.body;

  if (!email || !patronName || !projects) {
    return res.status(400).json({ error: 'Missing required fields: email, patronName, projects' });
  }

  const totalProfit = currentValue - totalInvested;
  const avgRoi = ((currentValue - totalInvested) / totalInvested) * 100;
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const sortedByRoi = [...projects].sort((a: any, b: any) => b.growth - a.growth);
  const topPerformer = sortedByRoi[0]?.name || '—';
  const worstPerformer = sortedByRoi[sortedByRoi.length - 1]?.name || '—';

  const monthLabel = month || new Date().toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

  const html = buildMonthlyReportHtml({
    patronName,
    month: monthLabel,
    totalInvested,
    currentValue,
    totalProfit,
    avgRoi,
    projects,
    topPerformer,
    worstPerformer,
    lang,
  });

  const subject = T(
    `📊 Votre rapport mensuel LinkYourArt — ${monthLabel}`,
    `📊 Your monthly LinkYourArt report — ${monthLabel}`
  );

  const result = await sendMail({ to: email, subject, html });

  return res.status(result.success ? 200 : 500).json({
    success: result.success,
    method: result.method,
    to: email,
    subject,
    error: result.error,
  });
}
