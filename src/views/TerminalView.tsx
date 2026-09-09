import React from 'react';
import { Logo } from '../components/ui/Logo';

/**
 * TERMINAL — page de concept publique (esprit neobanque premium : Sora, encre/lavande,
 * inspiré Kobalt / Revolut / Patreon). Palette et polices locales à ce composant
 * (préfixe --term-*), isolées du thème sombre néon du reste de l'app.
 *
 * Redirections câblées :
 *  - onJoin   -> déclenche le vrai flux de pré-inscription (LandingView / vue LANDING)
 *  - onLogin  -> déclenche la vue LOGIN existante
 * Le formulaire réel (email, catégorie, code de parrainage, écriture Firestore)
 * reste dans LandingView.tsx — on ne duplique pas cette logique ici.
 */

interface TerminalViewProps {
  onJoin?: () => void;
  onLogin?: () => void;
}

const pillars = [
  { n: '01', title: 'Intégrité conceptuelle', bg: 'dark' },
  { n: '02', title: 'Maturité actuelle', bg: 'lav' },
  { n: '03', title: "Capacité d'évolution", bg: 'grey' },
  { n: '04', title: 'Faisabilité réelle', bg: 'dark' },
  { n: '05', title: 'Incarnation', bg: 'lav' },
];

const newEra = [
  { n: '01', title: 'Registre Certifié', desc: "Chaque œuvre est officiellement enregistrée et protégée. Vos droits sont documentés, vérifiés et accessibles à tout moment." },
  { n: '02', title: 'Évaluation par des Experts', desc: 'Un réseau de professionnels certifiés évalue chaque création et lui attribue un Score LYA sur 1000 — transparent et objectif.' },
  { n: '03', title: 'Mécénat Créatif', desc: "Soutenez des projets créatifs auxquels vous croyez et suivez leur avancement certifié." },
  { n: '04', title: 'Protection Juridique', desc: "Chaque projet sur LYA bénéficie d'une protection juridique des droits reconnue sur 6 continents." },
];

const registry = [
  { title: 'Fragments Solaires', cat: 'Arts visuels', score: 842, catColor: '#E61A97' },
  { title: 'Chambre 7', cat: 'Musique', score: 778, catColor: '#7E1CF1' },
  { title: 'Le Silence des Villes', cat: 'Écriture', score: 915, catColor: '#F0C55E' },
  { title: 'Récits Suspendus', cat: 'Spectacle vivant', score: 701, catColor: '#3ADB76' },
  { title: 'Horizon Perdu', cat: 'Film', score: 867, catColor: '#FF7A45' },
  { title: 'Fractures', cat: 'Série TV', score: 793, catColor: '#02C6FA' },
  { title: 'Néon Requiem', cat: 'Jeu vidéo', score: 888, catColor: '#B5308E' },
];

export const TerminalView: React.FC<TerminalViewProps> = ({ onJoin, onLogin }) => {
  return (
    <div className="term-root">
      <style>{`
        .term-root{
          --term-ink:#0B0E14; --term-ink-soft:#565B6B; --term-paper:#FFFFFF;
          --term-grey:#F3F2F8; --term-line:#E6E4EF; --term-lav:#E8B8D8;
          --term-lav-deep:#B5308E; --term-purple:#7E1CF1; --term-pink:#E61A97; --term-cyan:#02C6FA;
          background:var(--term-paper); color:var(--term-ink); font-family:'Inter',sans-serif;
        }
        .term-root h1, .term-root h2, .term-root h3, .term-root .sora{ font-family:'Sora',sans-serif; }
        .term-wrap{ max-width:1160px; margin:0 auto; padding:0 40px; }
        @media (max-width:700px){ .term-wrap{ padding:0 22px; } }
        .term-header{ background:var(--term-ink); padding:26px 0; }
        .term-head-inner{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .term-word{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; color:#fff; }
        .term-nav{ display:flex; align-items:center; gap:28px; margin-left:auto; }
        .term-nav ul{ display:flex; gap:28px; list-style:none; margin:0; padding:0; }
        .term-nav a{ color:#B9B7C7; text-decoration:none; font-size:14.5px; font-weight:500; }
        .term-nav a:hover{ color:#fff; }
        .term-pill{ color:#fff; background:var(--term-ink); border:1px solid rgba(255,255,255,0.2); padding:10px 20px; border-radius:100px; font-size:14px; font-weight:600; cursor:pointer; }
        .term-pill:hover{ background:#7E1CF1; border-color:transparent; }
        .term-hero{ background:var(--term-ink); position:relative; overflow:hidden; padding:64px 0 90px; }
        .term-hero-shape{ position:absolute; top:-10%; right:-10%; width:70%; height:130%;
          background:linear-gradient(135deg,#7E1CF1 0%,#7E1CF1 16%,#E61A97 42%,#E61A97 58%,#02C6FA 86%,#02C6FA 100%);
          clip-path:polygon(30% 0%,100% 0%,100% 100%,0% 100%);
        }
        .term-hero-title{ color:#fff; font-weight:800; font-size:clamp(38px,6vw,68px); line-height:1.04; letter-spacing:-0.02em; max-width:11ch; position:relative; z-index:1; }
        .term-hero-sub{ color:#D6D4E2; font-size:17px; line-height:1.6; max-width:46ch; margin-top:26px; position:relative; z-index:1; }
        .term-btn-primary{ background:#fff; color:var(--term-ink); padding:14px 26px; border-radius:100px; font-weight:600; font-size:15px; border:none; cursor:pointer; }
        .term-btn-primary:hover{ background:var(--term-lav); }
        .term-btn-ghost{ color:#fff; background:none; border:none; padding:14px 10px; font-weight:600; font-size:15px; border-bottom:1px solid rgba(255,255,255,0.4); cursor:pointer; }
        .term-section-cta{ margin-top:32px; text-align:left; }
        .term-section-cta button{ background:none; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; color:var(--term-ink); border-bottom:2px solid #7E1CF1; padding-bottom:2px; cursor:pointer; }
        .term-pillars{ padding:72px 0; }
        .term-pillars-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
        @media (max-width:900px){ .term-pillars-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-pillar{ border-radius:20px; padding:26px 20px; min-height:160px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-pillar.dark{ background:var(--term-ink); color:#fff; }
        .term-pillar.lav{ background:var(--term-lav); }
        .term-pillar.grey{ background:var(--term-grey); }
        .term-pillar .n{ font-family:'Sora',sans-serif; font-weight:800; font-size:30px; }
        .term-pillar.dark .n{ color:#E61A97; } .term-pillar.lav .n, .term-pillar.grey .n{ color:#7E1CF1; }
        .term-pillar .t{ font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin-top:20px; }
        .term-mission{ background:var(--term-ink); padding:56px 0; }
        .term-mission p{ color:#fff; font-family:'Sora',sans-serif; font-style:italic; font-weight:800; font-size:clamp(24px,3.2vw,36px); max-width:18ch; }
        .term-newera{ padding:72px 0; background:var(--term-grey); }
        .term-eyebrow{ font-family:'Sora',sans-serif; font-weight:700; font-size:12px; letter-spacing:0.04em; color:#7A2062; text-transform:uppercase; margin-bottom:14px; }
        .term-newera-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:36px; }
        @media (max-width:900px){ .term-newera-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-newera-card{ background:#fff; border-radius:16px; padding:28px 22px; border-top:3px solid var(--term-line); }
        .term-newera-card .n{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; color:var(--term-ink-soft); margin-bottom:16px; }
        .term-newera-card h4{ font-size:16px; font-weight:700; margin-bottom:8px; }
        .term-newera-card p{ font-size:13px; line-height:1.55; color:var(--term-ink-soft); }
        .term-why{ padding:72px 0; }
        .term-why-grid{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--term-line); margin-top:36px; }
        @media (max-width:800px){ .term-why-grid{ grid-template-columns:1fr; } }
        .term-why-item{ padding:28px 24px; border-right:1px solid var(--term-line); }
        .term-why-item:last-child{ border-right:none; }
        .term-why-item .n{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; color:#7E1CF1; margin-bottom:12px; }
        .term-why-item h4{ font-size:15px; font-weight:700; margin-bottom:6px; }
        .term-why-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-registry{ padding:20px 0 72px; }
        .term-reg-scroll{ display:flex; gap:16px; overflow-x:auto; margin-top:28px; }
        .term-reg-card{ flex:0 0 190px; }
        .term-reg-art{ position:relative; aspect-ratio:3/4; border-radius:12px; margin-bottom:8px; }
        .term-reg-score{ position:absolute; bottom:8px; left:8px; background:rgba(11,14,20,0.85); border-radius:8px; padding:4px 8px; font-family:'Sora',sans-serif; font-weight:800; font-size:13px; color:#fff; }
        .term-reg-tag{ position:absolute; top:8px; left:8px; font-size:9px; font-weight:700; padding:3px 7px; border-radius:5px; color:#fff; font-family:'Sora',sans-serif; }
        .term-reg-title{ font-size:13px; font-weight:700; }
        .term-pricing{ padding:20px 0 72px; }
        .term-price-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:32px; }
        @media (max-width:900px){ .term-price-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-price{ border-radius:20px; padding:26px 20px; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-price.lav{ background:var(--term-lav); }
        .term-price.grey{ background:var(--term-grey); }
        .term-price.dark{ background:var(--term-ink); color:#fff; }
        .term-price .name{ font-family:'Sora',sans-serif; font-weight:700; font-size:16px; }
        .term-price .amount{ font-family:'Sora',sans-serif; font-weight:800; font-size:28px; margin-top:6px; }
        .term-price .desc{ font-size:12.5px; margin-top:8px; opacity:0.75; }
        .term-cta{ background:var(--term-lav); padding:56px 0; }
        .term-cta-inner{ display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap; }
        .term-cta h2{ font-weight:800; font-size:clamp(24px,3vw,34px); max-width:22ch; color:var(--term-ink); }
        .term-footer{ background:var(--term-ink); color:#B9B7C7; padding-top:48px; }
        .term-foot-row{ display:flex; align-items:center; gap:20px; margin-bottom:40px; }
        .term-foot-big{ font-family:'Sora',sans-serif; font-weight:800; color:#fff; font-size:clamp(38px,6vw,80px); }
        .term-foot-grid{ display:flex; justify-content:space-between; padding:24px 0; border-top:1px solid #22242E; font-size:13px; flex-wrap:wrap; gap:8px; }
      `}</style>

      {/* Header */}
      <header className="term-header">
        <div className="term-wrap term-head-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Logo size={52} color="multi" showBeta />
            <div className="term-word">LINKYOURART</div>
          </div>
          <nav className="term-nav">
            <ul>
              <li><a href="#pillars">Le Score</a></li>
              <li><a href="#registry">Projets</a></li>
              <li><a href="#pricing">Tarifs</a></li>
            </ul>
            <button className="term-pill" onClick={onLogin}>Se connecter</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="term-hero">
        <div className="term-hero-shape" />
        <div className="term-wrap" style={{ position: 'relative' }}>
          <h1 className="term-hero-title">Ce que vous créez aujourd'hui mérite d'être reconnu demain.</h1>
          <p className="term-hero-sub">
            Les projets créatifs ont toujours eu de la valeur. LYA leur en donne une reconnue, partageable et vérifiable —
            un registre certifié, une évaluation par des experts, un mécénat qui suit l'avancement réel du projet.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30, position: 'relative', zIndex: 1 }}>
            <button className="term-btn-primary" onClick={onJoin}>Rejoindre LYA →</button>
            <a href="#pillars" className="term-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>Comprendre le Score LYA</a>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="term-pillars" id="pillars">
        <div className="term-wrap">
          <div className="term-eyebrow">Le Score LYA</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(26px,3.2vw,38px)', marginBottom: 36 }}>
            Cinq critères. Un standard commun à tout le secteur créatif.
          </h2>
          <div className="term-pillars-grid">
            {pillars.map(p => (
              <div key={p.n} className={`term-pillar ${p.bg}`}>
                <div className="n">{p.n}</div>
                <div className="t">{p.title}</div>
              </div>
            ))}
          </div>
          <div className="term-section-cta"><button onClick={onJoin}>Rejoindre LYA et faire certifier mon projet →</button></div>
        </div>
      </section>

      {/* Mission */}
      <div className="term-mission">
        <div className="term-wrap">
          <p>« Votre créativité a de la valeur. Nous la certifions. Les mécènes la reconnaissent. »</p>
        </div>
      </div>

      {/* Nouvelle ère */}
      <section className="term-newera">
        <div className="term-wrap">
          <div className="term-eyebrow">Une nouvelle ère</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px) ' }}>Pour l'excellence créative.</h2>
          <div className="term-newera-grid">
            {newEra.map(c => (
              <div key={c.n} className="term-newera-card">
                <div className="n">{c.n}</div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi LYA */}
      <section className="term-why">
        <div className="term-wrap">
          <div className="term-eyebrow">Pourquoi LYA</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>Une reconnaissance qui se construit, pas qui s'achète.</h2>
          <div className="term-why-grid">
            <div className="term-why-item"><div className="n">01</div><h4>Transparent</h4><p>Cinq critères clairs, expliqués, jamais une boîte noire.</p></div>
            <div className="term-why-item"><div className="n">02</div><h4>Communautaire</h4><p>Artistes, mécènes et professionnels avancent ensemble.</p></div>
            <div className="term-why-item"><div className="n">03</div><h4>Indépendant</h4><p>5% de commission sur le mécénat, rien de caché derrière.</p></div>
          </div>
        </div>
      </section>

      {/* Registre */}
      <section className="term-registry" id="registry">
        <div className="term-wrap">
          <div className="term-eyebrow">Le registre</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>Parcourez des projets déjà certifiés</h2>
          <div className="term-reg-scroll">
            {registry.map(r => (
              <div key={r.title} className="term-reg-card">
                <div className="term-reg-art" style={{ background: `linear-gradient(150deg, ${r.catColor}, #0B0E14)` }}>
                  <span className="term-reg-tag" style={{ background: r.catColor }}>{r.cat.toUpperCase()}</span>
                  <span className="term-reg-score">{r.score}<span style={{ fontSize: 9, fontWeight: 500 }}>/1000</span></span>
                </div>
                <div className="term-reg-title">{r.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="term-pricing" id="pricing">
        <div className="term-wrap">
          <div className="term-eyebrow">Tarifs</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>Certifier et mécéner restent gratuits.</h2>
          <div className="term-price-grid">
            <div className="term-price lav"><div><div className="name">Free</div><div className="amount">0€</div><div className="desc">3 certifications, accès au registre</div></div></div>
            <div className="term-price grey"><div><div className="name">Pro Starter</div><div className="amount">79€<span style={{ fontSize: 13 }}>/mois</span></div><div className="desc">Certifications illimitées, outils pro</div></div></div>
            <div className="term-price dark"><div><div className="name">Pro Advanced</div><div className="amount">249€<span style={{ fontSize: 13 }}>/mois</span></div><div className="desc">Analytics, API, accompagnement dédié</div></div></div>
            <div className="term-price lav"><div><div className="name">Enterprise</div><div className="amount">Sur mesure</div><div className="desc">Volumes élevés, contrat dédié</div></div></div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="term-cta">
        <div className="term-wrap term-cta-inner">
          <div>
            <h2>Votre projet a une valeur.</h2>
            <div style={{ fontSize: 13, color: '#6B4A5E', marginTop: 8 }}>Accès sur pré-inscription, validé par notre équipe.</div>
          </div>
          <button className="term-pill" style={{ background: '#0B0E14' }} onClick={onJoin}>Rejoindre LYA →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="term-footer">
        <div className="term-wrap">
          <div className="term-foot-row">
            <Logo size={80} color="multi" />
            <div className="term-foot-big">LINKYOURART</div>
          </div>
          <div className="term-foot-grid">
            <span>LYA — LinkYourArt · Rennes / Paris</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TerminalView;
