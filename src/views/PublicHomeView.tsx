import React from 'react';
import { Logo } from '../components/ui/Logo';
import { submitPreRegistration, type PreRegCategory } from '../utils/preRegistration';

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

interface PublicHomeViewProps {
  onJoin?: () => void;
  onLogin?: () => void;
  onSignup?: (prefill: { code: string; email: string }) => void;
}

const pillars = [
  { n: '01', title: { fr: 'Intégrité conceptuelle', en: 'Conceptual integrity' }, desc: { fr: 'Cohérence et clarté de la vision créative : le projet tient-il sa promesse artistique de bout en bout ?', en: 'Coherence and clarity of the creative vision: does the project deliver on its artistic promise end to end?' }, bg: 'dark' },
  { n: '02', title: { fr: 'Maturité actuelle', en: 'Current maturity' }, desc: { fr: "État d'avancement réel du projet : ce qui est déjà produit, documenté et vérifiable aujourd'hui.", en: "The project's real state of progress: what is already produced, documented and verifiable today." }, bg: 'lav' },
  { n: '03', title: { fr: "Capacité d'évolution", en: 'Growth capacity' }, desc: { fr: 'Marge de progression du projet : sa capacité à franchir de nouveaux jalons de certification.', en: 'The project\'s room to grow: its capacity to reach new certification milestones.' }, bg: 'grey' },
  { n: '04', title: { fr: 'Faisabilité réelle', en: 'Real feasibility' }, desc: { fr: "Solidité du plan d'exécution : ressources, calendrier et moyens réunis pour aller au bout.", en: 'Soundness of the execution plan: resources, timeline and means gathered to see it through.' }, bg: 'dark' },
  { n: '05', title: { fr: 'Incarnation du porteur', en: 'Embodiment' }, desc: { fr: 'Présence et crédibilité du créateur : son engagement direct et vérifiable dans le projet.', en: "The creator's presence and credibility: their direct, verifiable commitment to the project." }, bg: 'lav' },
];

const comparison = {
  is: [
    { t: { fr: 'Certification objective', en: 'Objective certification' }, d: { fr: 'Le Score LYA est un indicateur vivant et transparent, qui évolue strictement selon des jalons vérifiés.', en: 'The LYA Score is a living, transparent indicator that only moves according to verified milestones.' } },
    { t: { fr: 'Reconnaissance mécène certifiée', en: 'Certified patron recognition' }, d: { fr: 'Chaque mécène obtient un badge de soutien public et traçable, inscrit sur le registre LYA.', en: 'Every patron gets a public, traceable support badge, recorded on the LYA registry.' } },
  ],
  isNot: [
    { t: { fr: 'Un intermédiaire traditionnel', en: 'A traditional intermediary' }, d: { fr: "Pas de label, d'agent ou de studio décidant seul de la reconnaissance, sans standard transparent.", en: 'No label, agent or studio deciding on recognition alone, without a transparent standard.' } },
    { t: { fr: 'Un crowdfunding classique', en: 'Classic crowdfunding' }, d: { fr: "Pas de récompenses génériques déconnectées de l'avancement réellement certifié du projet.", en: "No generic rewards disconnected from the project's actually certified progress." } },
  ],
};

const values = [
  { n: '01', title: { fr: 'Mission', en: 'Mission' }, desc: { fr: 'Transformer les idées créatives en projets vivants, évalués professionnellement et certifiés via le Score LYA.', en: 'Turning creative ideas into living projects, professionally assessed and certified through the LYA Score.' } },
  { n: '02', title: { fr: 'Transparence', en: 'Transparency' }, desc: { fr: 'Le Score LYA évalue chaque projet selon 5 critères objectifs et publics. Zéro opacité, données vérifiables.', en: 'The LYA Score evaluates every project against 5 objective, public criteria. Zero opacity, verifiable data.' } },
  { n: '03', title: { fr: 'Innovation', en: 'Innovation' }, desc: { fr: 'Évaluation professionnelle, droits créatifs certifiés et réseau de reconnaissance des mécènes, réunis dans une même expérience.', en: 'Professional evaluation, certified creative rights and a patron recognition network, brought together in one experience.' } },
  { n: '04', title: { fr: 'International', en: 'International' }, desc: { fr: "LinkYourArt est multilingue et ouvert aux projets créatifs, mécènes et professionnels du monde entier. La création n'a pas de frontières.", en: 'LinkYourArt is multilingual and open to creative projects, patrons and professionals worldwide. Creativity has no borders.' } },
];

const newEra = [
  { n: '01', title: { fr: 'Registre Certifié', en: 'Certified Registry' }, desc: { fr: "Chaque œuvre est officiellement enregistrée et protégée. Vos droits sont documentés, vérifiés et accessibles à tout moment.", en: 'Every work is officially registered and protected. Your rights are documented, verified and accessible at any time.' } },
  { n: '02', title: { fr: 'Évaluation par des Experts', en: 'Expert Evaluation' }, desc: { fr: 'Un réseau de professionnels certifiés évalue chaque création et lui attribue un Score LYA sur 1000 — transparent et objectif.', en: 'A network of certified professionals evaluates every creation and gives it a LYA Score out of 1000 — transparent and objective.' } },
  { n: '03', title: { fr: 'Mécénat Créatif', en: 'Creative Patronage' }, desc: { fr: "Soutenez des projets créatifs auxquels vous croyez et suivez leur avancement certifié.", en: 'Support creative projects you believe in and track their certified progress.' } },
  { n: '04', title: { fr: 'Protection Juridique', en: 'Legal Protection' }, desc: { fr: "Chaque projet sur LYA bénéficie d'une protection juridique des droits reconnue sur 6 continents.", en: 'Every project on LYA benefits from legal rights protection recognized across 6 continents.' } },
];

const registry = [
  { title: 'Fragments Solaires', cat: 'Arts visuels', score: 842, fund: 68, catColor: '#E61A97', desc: "Une série de peintures monumentales explorant la lumière solaire comme matière brute. Le projet en est à son troisième cycle de production, avec une exposition itinérante prévue en 2027.", creator: 'Inès Vasseur', patrons: 34, status: 'En cours' },
  { title: 'Chambre 7', cat: 'Musique', score: 778, fund: 81, catColor: '#7E1CF1', desc: "Album concept sur l'isolement urbain, entre électro minimale et field recordings. Neuf titres déjà masterisés, le dixième et dernier morceau est en cours de finalisation.", creator: 'Karim Djellal', patrons: 21, status: 'Finalisation' },
  { title: 'Le Silence des Villes', cat: 'Écriture', score: 915, fund: 45, catColor: '#F0C55E', desc: "Roman choral suivant cinq personnages dans une capitale européenne fictive. Manuscrit complet, actuellement en lecture chez trois maisons d'édition partenaires de LYA.", creator: 'Salomé Ferrand', patrons: 58, status: 'Recherche éditeur' },
  { title: 'Récits Suspendus', cat: 'Spectacle vivant', score: 701, fund: 29, catColor: '#3ADB76', desc: "Pièce de théâtre immersive mêlant danse contemporaine et texte improvisé. Premières lectures publiques prévues ce trimestre, création complète en développement.", creator: 'Compagnie Ombre Claire', patrons: 12, status: 'Développement' },
  { title: 'Horizon Perdu', cat: 'Film', score: 867, fund: 74, catColor: '#FF7A45', desc: "Long-métrage indépendant sur une communauté côtière face au changement climatique. Tournage terminé, montage en cours avec une sortie festival visée pour 2027.", creator: 'Théo Marchand', patrons: 46, status: 'Post-production' },
  { title: 'Fractures', cat: 'Série TV', score: 793, fund: 52, catColor: '#02C6FA', desc: "Série dramatique en 6 épisodes sur une famille recomposée. Pilote tourné et validé par le comité LYA, recherche de diffuseur en cours.", creator: 'Nadia Ouali', patrons: 29, status: 'Recherche diffuseur' },
  { title: 'Néon Requiem', cat: 'Jeu vidéo', score: 888, fund: 90, catColor: '#B5308E', desc: "Jeu narratif en pixel art dans un futur urbain saturé de néons. Démo jouable disponible, campagne de mécénat ouverte pour financer le dernier acte.", creator: 'Studio Halcyon', patrons: 71, status: 'Mécénat ouvert' },
];

const pillarLabels = [
  { fr: 'Intégrité conceptuelle', en: 'Conceptual integrity' },
  { fr: 'Maturité actuelle', en: 'Current maturity' },
  { fr: "Capacité d'évolution", en: 'Growth capacity' },
  { fr: 'Faisabilité réelle', en: 'Real feasibility' },
  { fr: 'Incarnation', en: 'Embodiment' },
];

function splitScore(score: number): number[] {
  const ratios = [0.212, 0.204, 0.198, 0.19];
  const vals = ratios.map(r => Math.round(score * r));
  vals.push(score - vals.reduce((a, b) => a + b, 0));
  return vals;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onJoin, onLogin, onSignup }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [lang, setLang] = React.useState<'fr' | 'en'>('fr');
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const project = selected !== null ? registry[selected] : null;
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Pop-up legere de pre-inscription : meme logique/backend que LandingView
  // (voir src/utils/preRegistration.ts), juste sans la page complete.
  const [showJoin, setShowJoin] = React.useState(false);
  const [joinCat, setJoinCat] = React.useState<PreRegCategory>('CREATOR');
  const [joinName, setJoinName] = React.useState('');
  const [joinEmail, setJoinEmail] = React.useState('');
  const [joinSubmitting, setJoinSubmitting] = React.useState(false);
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const [joinResult, setJoinResult] = React.useState<{ position: number; tier: string; accessKey: string | null } | null>(null);
  const [keyCopied, setKeyCopied] = React.useState(false);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinEmail.trim()) return;
    setJoinSubmitting(true);
    setJoinError(null);
    try {
      const result = await submitPreRegistration({
        name: joinName, email: joinEmail, category: joinCat,
        language: lang === 'fr' ? 'FR' : 'EN',
      });
      setJoinResult({ position: result.position, tier: result.tier, accessKey: result.accessKey });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t('Une erreur est survenue.', 'Something went wrong.'));
    } finally {
      setJoinSubmitting(false);
    }
  };

  const closeJoin = () => {
    setShowJoin(false);
    setJoinResult(null);
    setJoinError(null);
    setJoinName('');
    setJoinEmail('');
  };

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.term-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scroll-spy : surligne l'onglet du menu correspondant a la section visible.
  const [activeSection, setActiveSection] = React.useState<string>('');
  React.useEffect(() => {
    const sectionIds = ['pillars', 'registry', 'pricing'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="term-root" ref={rootRef}>
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
        .term-header{ background:var(--term-ink); padding:22px 0; position:sticky; top:0; z-index:100; border-bottom:1px solid rgba(255,255,255,0.08); }
        .term-head-inner{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .term-word{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; color:#fff; }
        .term-nav{ display:flex; align-items:center; gap:28px; margin-left:auto; }
        .term-nav ul{ display:flex; gap:28px; list-style:none; margin:0; padding:0; }
        .term-nav a{ color:#B9B7C7; text-decoration:none; font-size:14.5px; font-weight:500; padding-bottom:4px; border-bottom:2px solid transparent; transition:color 0.2s ease, border-color 0.2s ease; }
        .term-nav a.active{ color:#fff; border-bottom-color:#E61A97; }
        .term-nav a:hover{ color:#fff; }
        .term-pill{ color:#fff; background:var(--term-ink); border:1px solid rgba(255,255,255,0.2); padding:10px 20px; border-radius:100px; font-size:14px; font-weight:600; cursor:pointer; }
        .term-pill:hover{ background:#7E1CF1; border-color:transparent; }
        .term-lang-toggle{ display:flex; background:rgba(255,255,255,0.08); border-radius:100px; padding:3px; gap:2px; }
        .term-lang-toggle button{ border:none; background:none; color:#B9B7C7; font-size:12px; font-weight:700; padding:6px 12px; border-radius:100px; cursor:pointer; font-family:'Sora',sans-serif; }
        .term-lang-toggle button.active{ background:#fff; color:var(--term-ink); }
        .term-hero{ background:var(--term-ink); position:relative; overflow:hidden; padding:64px 0 90px; }
        .term-hero-shape{ position:absolute; top:-10%; right:-10%; width:70%; height:130%;
          background:linear-gradient(135deg,#7E1CF1 0%,#7E1CF1 16%,#E61A97 42%,#E61A97 58%,#02C6FA 86%,#02C6FA 100%);
          clip-path:polygon(30% 0%,100% 0%,100% 100%,0% 100%);
        }
        .term-hero-title{ color:#fff; font-weight:800; font-size:clamp(34px,5.2vw,58px); line-height:1.08; letter-spacing:-0.02em; max-width:19ch; position:relative; z-index:1; }
        .term-hero-sub{ color:#D6D4E2; font-size:17px; line-height:1.6; max-width:46ch; margin-top:26px; position:relative; z-index:1; }
        .term-btn-primary{ background:#fff; color:var(--term-ink); padding:14px 26px; border-radius:100px; font-weight:600; font-size:15px; border:none; cursor:pointer; }
        .term-btn-primary:hover{ background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); color:#fff; }
        .term-btn-ghost{ color:#fff; background:none; border:none; padding:14px 10px; font-weight:600; font-size:15px; border-bottom:1px solid rgba(255,255,255,0.4); cursor:pointer; }
        .term-section-cta{ margin-top:32px; text-align:left; }
        .term-section-cta button{ background:none; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; color:var(--term-ink); border-bottom:2px solid #7E1CF1; padding-bottom:2px; cursor:pointer; }
        .term-pillars{ padding:72px 0; }
        .term-pillars-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
        @media (max-width:900px){ .term-pillars-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-pillar{ border-radius:20px; padding:26px 20px; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-pillar.dark{ background:var(--term-ink); color:#fff; }
        .term-pillar.lav{ background:var(--term-lav); }
        .term-pillar.grey{ background:var(--term-grey); }
        .term-pillar .n{ font-family:'Sora',sans-serif; font-weight:800; font-size:30px; }
        .term-pillar.dark .n{ color:#E61A97; } .term-pillar.lav .n, .term-pillar.grey .n{ color:#7E1CF1; }
        .term-pillar .t{ font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin-top:20px; }
        .term-pillar .d{ font-size:12.5px; line-height:1.5; margin-top:8px; opacity:0.8; }
        .term-compare{ padding:20px 0 72px; }
        .term-compare-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:32px; }
        @media (max-width:800px){ .term-compare-grid{ grid-template-columns:1fr; } }
        .term-compare-col{ border-radius:18px; padding:30px 26px; background:var(--term-grey); border:1px solid var(--term-line); }
        .term-compare-col.is{ border-top:3px solid #7E1CF1; }
        .term-compare-badge{ display:inline-block; font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.03em; padding:5px 12px; border-radius:100px; margin-bottom:18px; }
        .term-compare-col.is .term-compare-badge{ background:var(--term-lav); color:#7A2062; }
        .term-compare-col.isnot .term-compare-badge{ background:var(--term-line); color:var(--term-ink-soft); }
        .term-compare-item{ margin-bottom:18px; }
        .term-compare-item:last-child{ margin-bottom:0; }
        .term-compare-item h5{ font-size:14.5px; font-weight:700; margin-bottom:4px; }
        .term-compare-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-history{ padding:72px 0; background:var(--term-grey); }
        .term-history-grid{ display:grid; grid-template-columns:1.3fr 1fr; gap:44px; align-items:start; margin-top:32px; }
        @media (max-width:800px){ .term-history-grid{ grid-template-columns:1fr; } }
        .term-history-text p{ font-size:14px; line-height:1.7; color:var(--term-ink-soft); margin-bottom:16px; }
        .term-history-stats{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .term-history-stat{ background:#fff; border-radius:14px; padding:22px; }
        .term-history-stat .y{ font-family:'Sora',sans-serif; font-weight:800; font-size:32px; }
        .term-history-stat:first-child .y{ color:#02C6FA; } .term-history-stat:last-child .y{ color:#7E1CF1; }
        .term-history-stat .l{ font-family:'Sora',sans-serif; font-weight:700; font-size:10px; letter-spacing:0.04em; color:var(--term-ink-soft); margin-top:4px; }
        .term-values{ padding:72px 0; }
        .term-values-grid > div{ border-radius:18px; padding:24px 20px; transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-values-grid > div:nth-child(1){ background:var(--term-ink); color:#fff; }
        .term-values-grid > div:nth-child(2){ background:var(--term-lav); }
        .term-values-grid > div:nth-child(3){ background:var(--term-grey); }
        .term-values-grid > div:nth-child(4){ background:var(--term-ink); color:#fff; }
        .term-values-grid > div:nth-child(1) .n{ color:#02C6FA; } .term-values-grid > div:nth-child(4) .n{ color:#E61A97; }
        .term-values-grid > div:nth-child(2) .n, .term-values-grid > div:nth-child(3) .n{ color:#7E1CF1; }
        .term-values-grid > div:nth-child(1) p, .term-values-grid > div:nth-child(4) p{ color:#B9B7C7; }
        .term-values-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:32px; }
        @media (max-width:800px){ .term-values-grid{ grid-template-columns:1fr 1fr; } }
        .term-values-grid .n{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; color:#7E1CF1; margin-bottom:12px; }
        .term-values-grid h4{ font-size:15px; font-weight:700; margin-bottom:6px; }
        .term-values-grid p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-mission{ position:relative; overflow:hidden; padding:56px 0;
          background:linear-gradient(120deg, #0B0E14 0%, #0B0E14 28%, #7E1CF1 48%, #7E1CF1 58%, #E61A97 74%, #E61A97 84%, #02C6FA 100%);
        }
        .term-mission p{ color:#fff; font-family:'Sora',sans-serif; font-style:italic; font-weight:800; font-size:clamp(26px,3.6vw,42px); max-width:26ch; line-height:1.2; }
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
        .term-why-item{ padding:28px 24px; border-right:1px solid var(--term-line); border-top:3px solid transparent; }
        .term-why-item:nth-child(1){ border-top-color:#E61A97; }
        .term-why-item:nth-child(2){ border-top-color:#7E1CF1; }
        .term-why-item:nth-child(3){ border-top-color:#02C6FA; }
        .term-why-item:nth-child(1) .n{ color:#E61A97; }
        .term-why-item:nth-child(2) .n{ color:#7E1CF1; }
        .term-why-item:nth-child(3) .n{ color:#02C6FA; }
        .term-why-item:last-child{ border-right:none; }
        .term-why-item .n{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; color:#7E1CF1; margin-bottom:12px; }
        .term-why-item h4{ font-size:15px; font-weight:700; margin-bottom:6px; }
        .term-why-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-registry{ padding:20px 0 72px; }
        .term-reg-scroll{ display:flex; gap:16px; overflow-x:auto; margin-top:28px; }
        .term-reg-card{ flex:0 0 230px; background:var(--term-ink); border-radius:14px; overflow:hidden; color:#fff; }
        .term-reg-art{ position:relative; aspect-ratio:16/11; }
        .term-reg-tags{ position:absolute; top:8px; left:8px; display:flex; gap:5px; }
        .term-reg-tag{ font-size:9px; font-weight:700; padding:3px 7px; border-radius:5px; color:#fff; font-family:'Sora',sans-serif; text-transform:uppercase; }
        .term-reg-tag.status{ background:#02C6FA; color:#0B0E14; }
        .term-reg-body{ padding:12px 14px 14px; }
        .term-reg-title{ font-size:13px; font-weight:800; font-family:'Sora',sans-serif; text-transform:uppercase; margin-bottom:8px; }
        .term-reg-bar-row{ margin-bottom:7px; }
        .term-reg-bar-row .lbl{ display:flex; justify-content:space-between; font-size:9px; color:#8A87A8; font-weight:600; margin-bottom:3px; text-transform:uppercase; }
        .term-reg-bar{ height:4px; background:rgba(255,255,255,0.1); border-radius:100px; overflow:hidden; }
        .term-reg-bar .fill{ height:100%; border-radius:100px; }
        .term-reg-bar.score .fill{ background:linear-gradient(90deg,#F0C55E,#E61A97); }
        .term-reg-bar.fund .fill{ background:linear-gradient(90deg,#02C6FA,#3ADB76); }
        .term-modal-overlay{ position:fixed; inset:0; background:rgba(11,14,20,0.72); backdrop-filter:blur(3px); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
        .term-modal-card{ background:#fff; border-radius:22px; max-width:540px; width:100%; max-height:88vh; overflow-y:auto; position:relative; }
        .term-modal-cover{ position:relative; aspect-ratio:16/8; }
        .term-modal-cover::after{ content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(11,14,20,0.7) 0%, transparent 70%); }
        .term-modal-close{ position:absolute; top:14px; right:14px; z-index:2; background:rgba(11,14,20,0.6); color:#fff; border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; }
        .term-modal-score{ position:absolute; bottom:-26px; left:26px; z-index:2; background:var(--term-ink); color:#fff; border-radius:14px; padding:12px 16px; display:flex; align-items:baseline; gap:4px; box-shadow:0 8px 20px rgba(0,0,0,0.2); }
        .term-modal-score .val{ font-family:'Sora',sans-serif; font-weight:800; font-size:24px; }
        .term-modal-score .max{ font-size:11px; color:#B9B7C7; }
        .term-modal-body{ padding:40px 26px 26px; }
        .term-modal-cat{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; color:var(--term-ink-soft); text-transform:uppercase; }
        .term-modal-title{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; margin:6px 0 14px; }
        .term-modal-desc{ font-size:14px; line-height:1.6; color:var(--term-ink-soft); margin-bottom:20px; }
        .term-modal-meta{ display:flex; gap:24px; padding:16px 0; border-top:1px solid var(--term-line); border-bottom:1px solid var(--term-line); margin-bottom:20px; }
        .term-modal-meta .l{ font-size:10.5px; color:var(--term-ink-soft); margin-bottom:3px; }
        .term-modal-meta .v{ font-family:'Sora',sans-serif; font-weight:700; font-size:14px; }
        .term-modal-fund{ margin-bottom:20px; }
        .term-modal-fund .row{ display:flex; justify-content:space-between; font-size:11px; color:var(--term-ink-soft); margin-bottom:5px; }
        .term-modal-fund .bar{ height:7px; background:var(--term-grey); border-radius:100px; overflow:hidden; }
        .term-modal-fund .fill{ height:100%; background:linear-gradient(90deg,#7E1CF1,#02C6FA); border-radius:100px; }
        .term-modal-pillars{ display:grid; grid-template-columns:repeat(5,1fr); gap:7px; margin-bottom:20px; }
        @media (max-width:480px){ .term-modal-pillars{ grid-template-columns:repeat(2,1fr); } }
        .term-modal-pillar{ background:var(--term-grey); border-radius:10px; padding:10px 6px; text-align:center; }
        .term-modal-pillar .v{ font-family:'Sora',sans-serif; font-weight:800; font-size:15px; }
        .term-modal-pillar .l{ font-size:8.5px; color:var(--term-ink-soft); line-height:1.3; margin-top:3px; }
        .term-modal-cta{ display:flex; gap:10px; flex-wrap:wrap; }
        .term-modal-cta button{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; padding:12px 20px; border-radius:100px; border:none; cursor:pointer; }
        .term-modal-cta .primary{ background:var(--term-ink); color:#fff; }
        .term-modal-cta .secondary{ background:none; border:1px solid var(--term-line); color:var(--term-ink); }
        /* Pop-up de pre-inscription legere */
        .term-join-card{ background:#fff; border-radius:22px; max-width:440px; width:100%; padding:36px 30px; position:relative; }
        .term-join-close{ position:absolute; top:18px; right:18px; background:var(--term-grey); border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; color:var(--term-ink); }
        .term-join-title{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; margin-bottom:8px; }
        .term-join-sub{ font-size:13.5px; color:var(--term-ink-soft); margin-bottom:24px; line-height:1.5; }
        .term-join-cats{ display:flex; gap:8px; margin-bottom:18px; }
        .term-join-cats button{ flex:1; padding:10px 6px; border-radius:10px; border:1px solid var(--term-line); background:#fff; font-size:12px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; color:var(--term-ink-soft); }
        .term-join-cats button.active{ background:var(--term-ink); color:#fff; border-color:var(--term-ink); }
        .term-join-field{ margin-bottom:14px; }
        .term-join-field label{ display:block; font-size:11px; font-weight:700; color:var(--term-ink-soft); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.02em; }
        .term-join-field input{ width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--term-line); font-size:14px; font-family:'Inter',sans-serif; box-sizing:border-box; }
        .term-join-field input:focus{ outline:none; border-color:#7E1CF1; }
        .term-join-error{ background:#FBE4EF; color:#7A2062; font-size:12.5px; padding:10px 14px; border-radius:10px; margin-bottom:14px; }
        .term-join-submit{ width:100%; background:var(--term-ink); color:#fff; border:none; padding:14px; border-radius:100px; font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; cursor:pointer; margin-top:6px; }
        .term-join-submit.secondary-close{ background:none; color:var(--term-ink-soft); }
        .term-join-submit:disabled{ opacity:0.6; cursor:default; }
        .term-join-success .icon{ width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#7E1CF1,#02C6FA); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; font-weight:800; margin-bottom:18px; font-family:'Sora',sans-serif; }
        .term-join-success .pos{ font-size:13px; color:var(--term-ink-soft); margin-bottom:4px; }
        .term-join-steps{ margin-top:18px; padding-top:18px; border-top:1px solid var(--term-line); }
        .term-join-steps .step{ display:flex; gap:10px; font-size:13px; color:var(--term-ink-soft); margin-bottom:10px; align-items:flex-start; }
        .term-join-steps .step b{ color:var(--term-ink); }
        .term-join-keybox{ margin-top:16px; display:flex; align-items:center; justify-content:space-between; gap:10px; background:var(--term-grey); border:1px dashed var(--term-line); border-radius:12px; padding:12px 14px; }
        .term-join-keybox span{ font-family:'Sora',sans-serif; font-weight:800; font-size:14px; letter-spacing:0.03em; }
        .term-join-keybox button{ flex-shrink:0; border:none; background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:12px; padding:8px 14px; border-radius:100px; cursor:pointer; }
        /* Animations : apparition au scroll + survol */
        .term-reveal{ opacity:0; transform:translateY(22px); transition:opacity 0.6s ease, transform 0.6s cubic-bezier(.2,.8,.2,1); }
        .term-reveal.visible{ opacity:1; transform:translateY(0); }
        .term-pillar{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-pillar:hover{ transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,0.14); }
        .term-newera-card{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.6s ease; }
        .term-newera-card:hover{ transform:translateY(-8px); box-shadow:0 20px 40px rgba(0,0,0,0.1); border-top-color:#7E1CF1; }
        .term-why-item{ transition:background 0.25s ease; }
        .term-why-item:hover{ background:var(--term-grey); }
        .term-compare-col{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-compare-col:hover{ transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.08); }
        .term-history-stat{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-history-stat:hover{ transform:translateY(-6px); }
        .term-reg-card{ transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .term-reg-card:hover{ transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,0.25); }
        .term-price{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-price:hover{ transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,0.1); }
        .term-values-grid > div{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-values-grid > div:hover{ transform:translateY(-6px); }
        .term-btn-primary{ transition:background 0.25s ease, transform 0.2s ease; }
        .term-btn-primary:active{ transform:scale(0.97); }
        .term-modal-card{ animation:termModalIn 0.3s cubic-bezier(.2,.8,.2,1); }
        @keyframes termModalIn{ from{ opacity:0; transform:translateY(20px) scale(0.98); } to{ opacity:1; transform:translateY(0) scale(1); } }
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
        .term-foot-grid{ display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:24px; padding-bottom:40px; border-top:1px solid #22242E; padding-top:32px; }
        @media (max-width:800px){ .term-foot-grid{ grid-template-columns:1fr 1fr; } }
        .term-foot-grid h5{ font-family:'Sora',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.05em; color:#8A87A8; margin-bottom:16px; }
        .term-foot-grid a, .term-foot-grid div.line{ display:block; font-size:14px; margin-bottom:10px; text-decoration:none; color:#D6D4E2; transition:color 0.2s ease; }
        .term-foot-grid a:hover{ color:#E61A97; }
        .term-foot-bottom{ display:flex; justify-content:space-between; padding:22px 0; font-size:13px; color:#8A87A8; flex-wrap:wrap; gap:8px; }
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
              <li><a href="#pillars" className={activeSection === 'pillars' ? 'active' : ''}>{t('Le Score', 'The Score')}</a></li>
              <li><a href="#registry" className={activeSection === 'registry' ? 'active' : ''}>{t('Projets', 'Projects')}</a></li>
              <li><a href="#pricing" className={activeSection === 'pricing' ? 'active' : ''}>{t('Tarifs', 'Pricing')}</a></li>
            </ul>
            <div className="term-lang-toggle">
              <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <button className="term-pill" onClick={onLogin}>{t('Se connecter', 'Log in')}</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="term-hero">
        <div className="term-hero-shape" />
        <div className="term-wrap" style={{ position: 'relative' }}>
          <h1 className="term-hero-title">{t("Ce que vous créez aujourd'hui mérite d'être reconnu demain.", 'What you create today deserves to be recognized tomorrow.')}</h1>
          <p className="term-hero-sub">
            {t(
              "Les projets créatifs ont toujours eu de la valeur. LYA leur en donne une reconnue, partageable et vérifiable — un registre certifié, une évaluation par des experts, un mécénat qui suit l'avancement réel du projet.",
              'Creative projects have always had value. LYA gives them one that is recognized, shareable and verifiable — a certified registry, expert evaluation, and patronage that follows the real progress of the project.'
            )}
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30, position: 'relative', zIndex: 1 }}>
            <button className="term-btn-primary" onClick={() => setShowJoin(true)}>{t('Rejoindre LYA →', 'Join LYA →')}</button>
            <a href="#pillars" className="term-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>{t('Comprendre le Score LYA', 'Understand the LYA Score')}</a>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="term-pillars" id="pillars" style={{ scrollMarginTop: 80 }}>
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Le Score LYA', 'The LYA Score')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(26px,3.2vw,38px)', marginBottom: 36 }}>
            {t('Cinq critères. Un standard commun à tout le secteur créatif.', 'Five criteria. One standard shared across the whole creative sector.')}
          </h2>
          <div className="term-pillars-grid">
            {pillars.map(p => (
              <div key={p.n} className={`term-pillar ${p.bg} term-reveal`}>
                <div>
                  <div className="n">{p.n}</div>
                  <div className="t">{t(p.title.fr, p.title.en)}</div>
                </div>
                <div className="d">{t(p.desc.fr, p.desc.en)}</div>
              </div>
            ))}
          </div>
          <div className="term-section-cta"><button onClick={() => document.getElementById('registry')?.scrollIntoView({ behavior: 'smooth' })}>{t('Voir des exemples de scores réels →', 'See real score examples →')}</button></div>
        </div>
      </section>

      {/* Mission */}
      <div className="term-mission">
        <div className="term-wrap">
          <p>{t('« Votre créativité a de la valeur. Nous la certifions. Les mécènes la reconnaissent. »', '« Your creativity has value. We certify it. Patrons recognize it. »')}</p>
        </div>
      </div>

      {/* Nouvelle ère */}
      <section className="term-newera">
        <div className="term-wrap">
          <div className="term-eyebrow">Une nouvelle ère</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px) ' }}>Pour l'excellence créative.</h2>
          <div className="term-newera-grid">
            {newEra.map(c => (
              <div key={c.n} className="term-newera-card term-reveal">
                <div className="n">{c.n}</div>
                <h4>{t(c.title.fr, c.title.en)}</h4>
                <p>{t(c.desc.fr, c.desc.en)}</p>
              </div>
            ))}
          </div>
          <div className="term-section-cta"><button onClick={() => setShowJoin(true)}>{t('Rejoindre LYA et faire certifier mon projet →', 'Join LYA and get my project certified →')}</button></div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="term-compare">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Comparaison', 'Comparison')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t("Ce que LYA est — et n'est pas.", "What LYA is — and isn't.")}</h2>
          <div className="term-compare-grid">
            <div className="term-compare-col is term-reveal">
              <span className="term-compare-badge">{t('CE QUE LYA EST', 'WHAT LYA IS')}</span>
              {comparison.is.map(item => (
                <div key={item.t.fr} className="term-compare-item"><h5>{t(item.t.fr, item.t.en)}</h5><p>{t(item.d.fr, item.d.en)}</p></div>
              ))}
            </div>
            <div className="term-compare-col isnot term-reveal">
              <span className="term-compare-badge">{t("CE QUE LYA N'EST PAS", "WHAT LYA ISN'T")}</span>
              {comparison.isNot.map(item => (
                <div key={item.t.fr} className="term-compare-item"><h5>{t(item.t.fr, item.t.en)}</h5><p>{t(item.d.fr, item.d.en)}</p></div>
              ))}
            </div>
          </div>
          <div className="term-section-cta"><button onClick={() => document.getElementById('registry')?.scrollIntoView({ behavior: 'smooth' })}>{t('Voir des exemples concrets →', 'See real examples →')}</button></div>
        </div>
      </section>

      {/* Histoire */}
      <section className="term-history">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Notre histoire', 'Our history')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)', maxWidth: '20ch' }}>{t("Vingt ans avant d'avoir un nom pour ça.", 'Twenty years before it had a name.')}</h2>
          <div className="term-history-grid">
            <div className="term-history-text">
              <p>{t(
                "En 2006, Jean-Baptiste Lequime fonde LinkYourArt avec une ambition claire : bâtir le premier pont international entre les créations et les industries qui en ont besoin. C'est LinkYourArt lui-même qui a forgé, au fil des années, son expérience en développement commercial dans les industries créatives, avec une spécialisation film et divertissement. Musique, cinéma, mode, jeux vidéo, design, architecture, arts de la scène — chaque création y trouve sa place, à une époque où aucune plateforme n'osait encore toutes les réunir.",
                'In 2006, Jean-Baptiste Lequime founded LinkYourArt with a clear ambition: to build the first international bridge between creative works and the industries that need them. It was LinkYourArt itself that forged, over the years, his business development expertise within the creative industries, specializing in film and entertainment. Music, film, fashion, gaming, design, architecture, performing arts — every creation found a home here, at a time when no platform dared unite them all.'
              )}</p>
              <p>{t(
                "Pendant près de deux décennies, LinkYourArt a façonné en silence les industries créatives — révélant des créations émergentes, tissant des collaborations, et offrant aux projets les plus ambitieux la visibilité qu'ils méritent.",
                'For nearly two decades, LinkYourArt has quietly shaped the creative industries — revealing emerging works, forging collaborations, and giving the most ambitious projects the visibility they deserve.'
              )}</p>
              <p>{t(
                "Aujourd'hui, à l'occasion de ses 20 ans, LinkYourArt entame une nouvelle étape avec le lancement d'une plateforme entièrement repensée, construite autour d'un standard objectif de certification créative.",
                "Today, on its 20th anniversary, LinkYourArt is embarking on a new stage with the launch of an entirely redesigned platform, built around an objective standard for creative certification."
              )}</p>
            </div>
            <div className="term-history-stats">
              <div className="term-history-stat term-reveal"><div className="y">2006</div><div className="l">{t('FONDATION', 'FOUNDATION')}</div></div>
              <div className="term-history-stat term-reveal"><div className="y">2026</div><div className="l">{t('RÉVOLUTION', 'REVOLUTION')}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="term-values">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Nos valeurs', 'Our values')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce qui ne bouge pas, même quand tout évolue.', "What doesn't move, even as everything evolves.")}</h2>
          <div className="term-values-grid">
            {values.map(v => (
              <div key={v.n}>
                <div className="n">{v.n}</div>
                <h4>{t(v.title.fr, v.title.en)}</h4>
                <p>{t(v.desc.fr, v.desc.en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi LYA */}
      <section className="term-why">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Pourquoi LYA', 'Why LYA')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t("Une reconnaissance qui se construit, pas qui s'achète.", 'Recognition that is built, not bought.')}</h2>
          <div className="term-why-grid">
            <div className="term-why-item"><div className="n">01</div><h4>{t('Transparent', 'Transparent')}</h4><p>{t('Cinq critères clairs, expliqués, jamais une boîte noire.', 'Five clear, explained criteria — never a black box.')}</p></div>
            <div className="term-why-item"><div className="n">02</div><h4>{t('Communautaire', 'Community-driven')}</h4><p>{t('Artistes, mécènes et professionnels avancent ensemble.', 'Artists, patrons and professionals move forward together.')}</p></div>
            <div className="term-why-item"><div className="n">03</div><h4>{t('Indépendant', 'Independent')}</h4><p>{t('5% de commission sur le mécénat, rien de caché derrière.', '5% commission on patronage — nothing hidden behind it.')}</p></div>
          </div>
        </div>
      </section>

      {/* Registre */}
      <section className="term-registry" id="registry" style={{ scrollMarginTop: 80 }}>
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Le registre', 'The registry')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Parcourez des projets déjà certifiés', 'Browse already certified projects')}</h2>
          <div className="term-reg-scroll">
            {registry.map((r, i) => (
              <div key={r.title} className="term-reg-card term-reveal" onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
                <div className="term-reg-art" style={{ background: `linear-gradient(150deg, ${r.catColor}, #0B0E14)` }}>
                  <div className="term-reg-tags">
                    <span className="term-reg-tag" style={{ background: r.catColor }}>{r.cat.toUpperCase()}</span>
                    <span className="term-reg-tag status">CERTIFIED</span>
                  </div>
                </div>
                <div className="term-reg-body">
                  <div className="term-reg-title">{r.title}</div>
                  <div className="term-reg-bar-row">
                    <div className="lbl"><span>LYA Score</span><span>{r.score}/1000</span></div>
                    <div className="term-reg-bar score"><div className="fill" style={{ width: `${Math.round(r.score / 10)}%` }} /></div>
                  </div>
                  <div className="term-reg-bar-row">
                    <div className="lbl"><span>{t('Financement', 'Funding')}</span><span>{r.fund}%</span></div>
                    <div className="term-reg-bar fund"><div className="fill" style={{ width: `${r.fund}%` }} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pop-up fiche projet */}
      {project && (
        <div className="term-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="term-modal-card">
            <div className="term-modal-cover" style={{ background: `linear-gradient(150deg, ${project.catColor}, #0B0E14)` }}>
              <button className="term-modal-close" onClick={() => setSelected(null)}>×</button>
              <div className="term-modal-score"><span className="val">{project.score}</span><span className="max">/1000</span></div>
            </div>
            <div className="term-modal-body">
              <div className="term-modal-cat">{project.cat}</div>
              <div className="term-modal-title">{project.title}</div>
              <p className="term-modal-desc">{project.desc}</p>
              <div className="term-modal-meta">
                <div><div className="l">{t('Porteur', 'Creator')}</div><div className="v">{project.creator}</div></div>
                <div><div className="l">{t('Mécènes', 'Patrons')}</div><div className="v">{project.patrons}</div></div>
                <div><div className="l">{t('Statut', 'Status')}</div><div className="v">{project.status}</div></div>
              </div>
              <div className="term-modal-fund">
                <div className="row"><span>{t('Financement', 'Funding')}</span><span>{project.fund}%</span></div>
                <div className="bar"><div className="fill" style={{ width: `${project.fund}%` }} /></div>
              </div>
              <div className="term-modal-pillars">
                {splitScore(project.score).map((v, idx) => (
                  <div key={idx} className="term-modal-pillar"><div className="v">{v}</div><div className="l">{t(pillarLabels[idx].fr, pillarLabels[idx].en)}</div></div>
                ))}
              </div>
              <div className="term-modal-cta">
                <button className="primary" onClick={() => setShowJoin(true)}>{t('Devenir mécène de ce projet', 'Become a patron of this project')}</button>
                <button className="secondary" onClick={() => setSelected(null)}>{t('Fermer', 'Close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarifs */}
      <section className="term-pricing" id="pricing" style={{ scrollMarginTop: 80 }}>
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Tarifs', 'Pricing')}</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Certifier et mécéner restent gratuits.', 'Certifying and patronizing stay free.')}</h2>
          <div className="term-price-grid">
            <div className="term-price lav term-reveal"><div><div className="name">{t('Gratuit', 'Free')}</div><div className="amount">0€</div><div className="desc">{t('3 certifications, accès au registre', '3 certifications, access to the registry')}</div></div></div>
            <div className="term-price grey term-reveal"><div><div className="name">Pro Starter</div><div className="amount">79€<span style={{ fontSize: 13 }}>{t('/mois', '/mo')}</span></div><div className="desc">{t('Certifications illimitées, outils pro', 'Unlimited certifications, pro tools')}</div></div></div>
            <div className="term-price dark term-reveal"><div><div className="name">Pro Advanced</div><div className="amount">249€<span style={{ fontSize: 13 }}>{t('/mois', '/mo')}</span></div><div className="desc">{t('Analytics, API, accompagnement dédié', 'Analytics, API, dedicated support')}</div></div></div>
            <div className="term-price lav term-reveal"><div><div className="name">{t('Entreprise', 'Enterprise')}</div><div className="amount">{t('Sur mesure', 'Custom')}</div><div className="desc">{t('Volumes élevés, contrat dédié', 'High volumes, dedicated contract')}</div></div></div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="term-cta">
        <div className="term-wrap term-cta-inner">
          <div>
            <h2>{t('Prêt à faire certifier votre travail ?', 'Ready to get your work certified?')}</h2>
            <div style={{ fontSize: 13, color: '#6B4A5E', marginTop: 8 }}>{t('Accès sur pré-inscription, validé par notre équipe.', 'Access by pre-registration, validated by our team.')}</div>
          </div>
          <button className="term-pill" style={{ background: '#0B0E14' }} onClick={() => setShowJoin(true)}>{t('Rejoindre LYA →', 'Join LYA →')}</button>
        </div>
      </section>

      {/* Pop-up de pre-inscription legere */}
      {showJoin && (
        <div className="term-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeJoin(); }}>
          <div className="term-join-card">
            <button className="term-join-close" onClick={closeJoin}>×</button>
            {!joinResult ? (
              <>
                <div className="term-join-title">{t('Rejoindre LYA', 'Join LYA')}</div>
                <p className="term-join-sub">{t("Un email de confirmation, une validation interne, et la découverte de LYA.", 'A confirmation email, an internal review, then you discover LYA.')}</p>
                <form onSubmit={handleJoinSubmit}>
                  <div className="term-join-cats">
                    <button type="button" className={joinCat === 'CREATOR' ? 'active' : ''} onClick={() => setJoinCat('CREATOR')}>{t('CRÉATEUR', 'CREATOR')}</button>
                    <button type="button" className={joinCat === 'PROFESSIONAL' ? 'active' : ''} onClick={() => setJoinCat('PROFESSIONAL')}>{t('PROFESSIONNEL', 'PROFESSIONAL')}</button>
                    <button type="button" className={joinCat === 'PATRON' ? 'active' : ''} onClick={() => setJoinCat('PATRON')}>{t('MÉCÈNE', 'PATRON')}</button>
                  </div>
                  <div className="term-join-field">
                    <label>{t('Nom', 'Name')}</label>
                    <input type="text" value={joinName} onChange={(e) => setJoinName(e.target.value)} required />
                  </div>
                  <div className="term-join-field">
                    <label>Email</label>
                    <input type="email" value={joinEmail} onChange={(e) => setJoinEmail(e.target.value)} required />
                  </div>
                  {joinError && <div className="term-join-error">{joinError}</div>}
                  <button type="submit" className="term-join-submit" disabled={joinSubmitting}>
                    {joinSubmitting ? t('Envoi...', 'Sending...') : t('Pré-inscrire →', 'Pre-register →')}
                  </button>
                </form>
              </>
            ) : (
              <div className="term-join-success">
                <div className="icon">✓</div>
                {joinResult.tier === 'WAITLIST' ? (
                  <>
                    <div className="term-join-title">{t('Vous êtes sur la liste !', "You're on the list!")}</div>
                    <div className="pos">{t(`Position #${joinResult.position} — liste d'attente`, `Position #${joinResult.position} — waitlist`)}</div>
                    <div className="term-join-steps">
                      <div className="step"><span>1.</span><span><b>{t('Email de confirmation', 'Confirmation email')}</b> — {t('vérifiez votre boîte de réception.', 'check your inbox.')}</span></div>
                      <div className="step"><span>2.</span><span><b>{t("En file d'attente", 'On the waitlist')}</b> — {t('les 1000 premières places sont prises ; vous serez prévenu(e) à la prochaine ouverture de cohorte.', 'the first 1000 spots are taken; we\'ll notify you when the next cohort opens.')}</span></div>
                      <div className="step"><span>3.</span><span><b>{t('Découverte de LYA', 'Discover LYA')}</b> — {t('accès à la plateforme dès votre cohorte ouverte.', 'access to the platform once your cohort opens.')}</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="term-join-title">{t('Vous en faites partie.', "You're in.")}</div>
                    <div className="pos">
                      {joinResult.tier === 'FOUNDING_PIONEER'
                        ? t(`Founding Pioneer — l'une des 150 premières places`, `Founding Pioneer — one of the first 150 spots`)
                        : t(`Membre Original — position #${joinResult.position} sur 1000`, `Original member — position #${joinResult.position} of 1000`)}
                    </div>
                    <div className="term-join-steps">
                      <div className="step"><span>1.</span><span><b>{t('Accès activé, sans attente', 'Access activated, no wait')}</b> — {t('votre place vous donne un accès immédiat, aucune validation manuelle.', 'your spot gives you instant access, no manual review.')}</span></div>
                      <div className="step"><span>2.</span><span><b>{t('Votre clé, votre laissez-passer', 'Your key, your pass')}</b> — {t("gardée ci-dessous et dans votre email, elle est unique et vous est réservée.", "kept below and in your email — it's unique and reserved for you.")}</span></div>
                    </div>
                    {joinResult.accessKey && (
                      <>
                        <div className="term-join-keybox">
                          <span>{joinResult.accessKey}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!joinResult.accessKey) return;
                              try { await navigator.clipboard.writeText(joinResult.accessKey); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000); } catch { /* noop */ }
                            }}
                          >
                            {keyCopied ? t('Copiée ✓', 'Copied ✓') : t('Copier', 'Copy')}
                          </button>
                        </div>
                        <button
                          type="button"
                          className="term-join-submit"
                          style={{ marginTop: 12, background: 'linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA)' }}
                          onClick={() => {
                            if (!joinResult.accessKey) return;
                            try {
                              sessionStorage.setItem('lya_prefilled_code', joinResult.accessKey);
                              sessionStorage.setItem('lya_prefilled_email', joinEmail);
                            } catch { /* noop */ }
                            onSignup?.({ code: joinResult.accessKey, email: joinEmail });
                          }}
                        >
                          {t('Activer ma clé et créer mon compte →', 'Activate my key and create my account →')}
                        </button>
                      </>
                    )}
                  </>
                )}
                <button className="term-join-submit secondary-close" onClick={closeJoin} style={{ marginTop: 10 }}>{t('Plus tard', 'Later')}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="term-footer">
        <div className="term-wrap">
          <div className="term-foot-row">
            <Logo size={80} color="multi" />
            <div className="term-foot-big">LINKYOURART</div>
          </div>
          <div className="term-foot-grid">
            <div>
              <h5>NEWSLETTER</h5>
              <div className="line" style={{ color: '#8A87A8', fontSize: 13.5, marginBottom: 14 }}>{t('Suivez le lancement et les prochaines certifications.', 'Follow the launch and upcoming certifications.')}</div>
              <a href="mailto:hello@linkyourart.com?subject=Newsletter">{t("S'abonner →", 'Subscribe →')}</a>
            </div>
            <div>
              <h5>{t('NAVIGATION', 'NAVIGATION')}</h5>
              <a href="#pillars">{t('Le Score', 'The Score')}</a>
              <a href="#registry">{t('Projets', 'Projects')}</a>
              <a href="#pricing">{t('Tarifs', 'Pricing')}</a>
            </div>
            <div>
              <h5>{t('CONTACT', 'CONTACT')}</h5>
              <div className="line">contact@linkyourart.com</div>
              <div className="line">Rennes / Paris</div>
            </div>
            <div>
              <h5>{t('LÉGAL', 'LEGAL')}</h5>
              <a href="#">{t('Mentions légales', 'Legal notice')}</a>
              <a href="#">{t('Confidentialité', 'Privacy')}</a>
            </div>
          </div>
          <div className="term-foot-bottom">
            <span>© 2026 LinkYourArt (LYA)</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="#" style={{ color: '#8A87A8', textDecoration: 'none' }}>Instagram</a>
              <a href="#" style={{ color: '#8A87A8', textDecoration: 'none' }}>LinkedIn</a>
              <a href="#" style={{ color: '#8A87A8', textDecoration: 'none' }}>X</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomeView;
