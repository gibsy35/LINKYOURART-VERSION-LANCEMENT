import React from 'react';
import { Shield } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
  onGuestBrowse?: () => void;
}

const pillars = [
  { n: '01', title: { fr: 'Qualité du Projet', en: 'Project Quality' }, desc: { fr: "La rigueur créative et technique de l'œuvre elle-même — exécution, cohérence artistique, niveau de finition.", en: 'The creative and technical rigor of the work itself — execution, artistic coherence, level of finish.' }, bg: 'dark' },
  { n: '02', title: { fr: 'Potentiel de Marché', en: 'Marketability' }, desc: { fr: 'La capacité du projet à trouver un public et une audience réelle, au-delà de sa seule valeur artistique intrinsèque.', en: "The project's ability to find a real audience, beyond its intrinsic artistic value alone." }, bg: 'lav' },
  { n: '03', title: { fr: 'Sécurité Juridique', en: 'Legal Security' }, desc: { fr: 'La clarté et la solidité des droits de propriété intellectuelle documentés — absence de litige, chaîne de titres claire.', en: 'The clarity and solidity of documented intellectual property rights — no disputes, clear chain of title.' }, bg: 'grey' },
  { n: '04', title: { fr: 'Innovation Technique', en: 'Technical Innovation' }, desc: { fr: "L'originalité de l'approche ou de la technique employée, par rapport à l'état actuel de la discipline.", en: 'The originality of the approach or technique used, relative to the current state of the discipline.' }, bg: 'dark' },
  { n: '05', title: { fr: 'Potentiel de Croissance', en: 'Growth Potential' }, desc: { fr: "La capacité du projet et de son porteur à se développer dans la durée, au-delà de l'œuvre présentée aujourd'hui.", en: "The project's and creator's ability to grow over time, beyond the work presented today." }, bg: 'lav' },
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

// Memes donnees d'exemple que le tutoriel in-app, pour montrer le Score LYA
// sur des statuts et categories varies (pas juste "certifie").
const scoreExamples = [
  { id: '#LYA-812', category: 'Film', score: 928, status: 'Certifié', statusColor: 'certified', barColor: '#3ADB76' },
  { id: '#LYA-445', category: 'Série TV', score: 580, status: 'En révision', statusColor: 'review', barColor: '#F0C55E' },
  { id: '#LYA-901', category: 'Mode', score: 420, status: 'Audit en cours', statusColor: 'audit', barColor: '#E86A6A' },
];

const registry = [
    { title: 'Fragments Solaires', cat: { fr: 'Arts visuels', en: 'Visual Arts' }, score: 842, fund: 68, catColor: '#E61A97', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800', desc: { fr: "Une série de peintures monumentales explorant la lumière solaire comme matière brute. Le projet en est à son troisième cycle de production, avec une exposition itinérante prévue en 2027.", en: "A series of monumental paintings exploring solar light as raw material. The project is in its third production cycle, with a touring exhibition planned for 2027." }, creator: '#LYA-ART-7712', patrons: 34, status: { fr: 'En cours', en: 'In progress' } },
    { title: 'Chambre 7', cat: { fr: 'Musique', en: 'Music' }, score: 778, fund: 81, catColor: '#7E1CF1', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', desc: { fr: "Album concept sur l'isolement urbain, entre électro minimale et field recordings. Neuf titres déjà masterisés, le dixième et dernier morceau est en cours de finalisation.", en: "A concept album about urban isolation, blending minimal electro and field recordings. Nine tracks already mastered, the tenth and final one is being finalized." }, creator: '#LYA-MUS-3390', patrons: 21, status: { fr: 'Finalisation', en: 'Finalizing' } },
    { title: 'Le Silence des Villes', cat: { fr: 'Écriture', en: 'Writing' }, score: 915, fund: 45, catColor: '#F0C55E', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800', desc: { fr: "Roman choral suivant cinq personnages dans une capitale européenne fictive. Manuscrit complet, actuellement en lecture chez trois maisons d'édition partenaires de LYA.", en: "A choral novel following five characters in a fictional European capital. Complete manuscript, currently under review with three LYA partner publishers." }, creator: '#LYA-LIT-6154', patrons: 58, status: { fr: 'Recherche éditeur', en: 'Seeking publisher' } },
    { title: 'Récits Suspendus', cat: { fr: 'Spectacle vivant', en: 'Performing Arts' }, score: 701, fund: 29, catColor: '#3ADB76', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800', desc: { fr: "Pièce de théâtre immersive mêlant danse contemporaine et texte improvisé. Premières lectures publiques prévues ce trimestre, création complète en développement.", en: "An immersive play blending contemporary dance and improvised text. First public readings planned this quarter, full production in development." }, creator: '#LYA-SCN-5528', patrons: 12, status: { fr: 'Développement', en: 'In development' } },
    { title: 'Horizon Perdu', cat: { fr: 'Film', en: 'Film' }, score: 867, fund: 74, catColor: '#FF7A45', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800', desc: { fr: "Long-métrage indépendant sur une communauté côtière face au changement climatique. Tournage terminé, montage en cours avec une sortie festival visée pour 2027.", en: "An independent feature film about a coastal community facing climate change. Filming complete, editing underway with a festival release targeted for 2027." }, creator: '#LYA-FLM-2087', patrons: 46, status: { fr: 'Post-production', en: 'Post-production' } },
    { title: 'Fractures', cat: { fr: 'Série TV', en: 'TV Series' }, score: 793, fund: 52, catColor: '#02C6FA', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800', desc: { fr: "Série dramatique en 6 épisodes sur une famille recomposée. Pilote tourné et validé par le comité LYA, recherche de diffuseur en cours.", en: "A 6-episode drama series about a blended family. Pilot shot and approved by the LYA committee, currently seeking a broadcaster." }, creator: '#LYA-TVS-9043', patrons: 29, status: { fr: 'Recherche diffuseur', en: 'Seeking broadcaster' } },
    { title: 'Néon Requiem', cat: { fr: 'Jeu vidéo', en: 'Video Game' }, score: 888, fund: 90, catColor: '#B5308E', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', desc: { fr: "Jeu narratif en pixel art dans un futur urbain saturé de néons. Démo jouable disponible, campagne de mécénat ouverte pour financer le dernier acte.", en: "A narrative pixel-art game set in a neon-soaked urban future. Playable demo available, patronage campaign open to fund the final act." }, creator: '#LYA-GAM-1461', patrons: 71, status: { fr: 'Mécénat ouvert', en: 'Patronage open' } },
];

const pillarLabels = [
  { fr: 'Qualité du Projet', en: 'Project Quality' },
  { fr: 'Potentiel de Marché', en: 'Marketability' },
  { fr: 'Sécurité Juridique', en: 'Legal Security' },
  { fr: 'Innovation Technique', en: 'Technical Innovation' },
  { fr: 'Potentiel de Croissance', en: 'Growth Potential' },
];

function splitScore(score: number): number[] {
  const ratios = [0.212, 0.204, 0.198, 0.19];
  const vals = ratios.map(r => Math.round(score * r));
  vals.push(score - vals.reduce((a, b) => a + b, 0));
  return vals;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onJoin, onLogin, onSignup, onGuestBrowse }) => {
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
  const [footerTab, setFooterTab] = React.useState<'model' | 'legal' | 'privacy' | 'cgu' | 'faq' | null>(null);

  // Compteur de validateurs certifies en temps reel + vitrine des
  // certificateurs ayant opte in publiquement — repris d'AboutView (page
  // retiree de l'outil, contenu deplace ici).
  const [realValidatorCount, setRealValidatorCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    const q = query(collection(db, 'users'), where('isVerifiedValidator', '==', true));
    const unsub = onSnapshot(q, (snap) => setRealValidatorCount(snap.size), () => setRealValidatorCount(null));
    return () => unsub();
  }, []);

  const [showcaseCertifiers, setShowcaseCertifiers] = React.useState<{ name: string; industry?: string }[]>([]);
  React.useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('isVerifiedValidator', '==', true),
      where('publicCertifierOptIn', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setShowcaseCertifiers(snap.docs.map((d) => ({ name: d.data().displayName || 'LYA Certifier', industry: d.data().industry })));
    }, () => setShowcaseCertifiers([]));
    return () => unsub();
  }, []);

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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Sora:wght@500;600;700;800&display=swap');
        .term-root{
          --term-ink:#0B0E14; --term-ink-soft:#565B6B; --term-paper:#FFFFFF;
          --term-grey:#F3F2F8; --term-line:#E6E4EF; --term-lav:#E8B8D8;
          --term-lav-deep:#B5308E; --term-purple:#7E1CF1; --term-pink:#E61A97; --term-cyan:#02C6FA;
          background:var(--term-paper); color:var(--term-ink); font-family:'Inter',sans-serif;
        }
        .term-root h1, .term-root h2, .term-root h3{ font-family:'Fraunces',Georgia,serif; font-weight:700; letter-spacing:-0.01em; text-transform:lowercase; }
        .term-root h1::first-letter, .term-root h2::first-letter, .term-root h3::first-letter{ text-transform:uppercase; }
        .term-root .sora{ font-family:'Sora',sans-serif; }
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
        .term-pill.ghost{ background:none; border:1.5px solid rgba(255,255,255,0.45); color:#fff; padding:9px 18px; font-weight:700; }
        .term-pill.ghost:hover{ background:rgba(255,255,255,0.1); border-color:#fff; }
        .term-pill:hover{ background:#7E1CF1; border-color:transparent; }
        .term-lang-toggle{ display:flex; background:rgba(255,255,255,0.08); border-radius:100px; padding:3px; gap:2px; }
        .term-lang-toggle button{ border:none; background:none; color:#B9B7C7; font-size:12px; font-weight:700; padding:6px 12px; border-radius:100px; cursor:pointer; font-family:'Sora',sans-serif; }
        .term-lang-toggle button.active{ background:#fff; color:var(--term-ink); }
        .term-hero{ background:var(--term-ink); position:relative; overflow:hidden; padding:64px 0 90px; }
        .term-hero-shape{ position:absolute; top:-10%; right:-10%; width:70%; height:130%;
          background:linear-gradient(135deg,#7E1CF1 0%,#7E1CF1 16%,#E61A97 42%,#E61A97 58%,#02C6FA 86%,#02C6FA 100%);
          background-size:140% 140%;
          clip-path:polygon(30% 0%,100% 0%,100% 100%,0% 100%);
          animation:termBreathe 16s ease-in-out infinite;
        }
        @keyframes termBreathe{ 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
        .term-hero-title{ color:#fff; font-weight:700; font-size:clamp(36px,5.8vw,66px); line-height:1.06; letter-spacing:-0.01em; max-width:15ch; position:relative; z-index:1; }
        .term-hero-sub{ color:#D6D4E2; font-size:17px; line-height:1.6; max-width:46ch; margin-top:26px; position:relative; z-index:1; }
        .term-btn-primary{ background:#fff; color:var(--term-ink); padding:14px 26px; border-radius:100px; font-weight:600; font-size:15px; border:none; cursor:pointer; }
        .term-btn-primary:hover{ background:var(--term-lav); }
        .term-btn-ghost{ color:#fff; background:none; border:none; padding:14px 10px; font-weight:600; font-size:15px; border-bottom:1px solid rgba(255,255,255,0.4); cursor:pointer; }
        .term-section-cta{ margin-top:32px; text-align:left; }
        .term-section-cta button{ background:none; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; color:var(--term-ink); border-bottom:2px solid #7E1CF1; padding-bottom:2px; cursor:pointer; }
        .term-pillars{ padding:72px 0; }
        .term-pillars-note{ font-size:13px; color:var(--term-ink-soft); margin-bottom:32px; }
        .term-pillars-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
        @media (max-width:900px){ .term-pillars-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-pillar{ border-radius:20px; padding:26px 20px; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-pillar.dark{ background:var(--term-ink); color:#fff; }
        .term-pillar.lav{ background:var(--term-lav); }
        .term-pillar.grey{ background:var(--term-grey); }
        .term-pillar .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:30px; }
        .term-pillar.dark .n{ color:#E61A97; } .term-pillar.lav .n, .term-pillar.grey .n{ color:#7E1CF1; }
        .term-pillar .t{ font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin-top:20px; }
        .term-pillar .d{ font-size:12.5px; line-height:1.5; margin-top:8px; opacity:0.8; }
        .term-pillar .pts{ font-family:'Sora',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:0.04em; opacity:0.5; margin-top:10px; }
        .term-compare{ padding:20px 0 72px; }
        .term-compare-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:32px; }
        @media (max-width:800px){ .term-compare-grid{ grid-template-columns:1fr; } }
        .term-compare-col{ border-radius:8px; padding:30px 26px; background:var(--term-grey); border:1px solid var(--term-line); }
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
        .term-history-stat{ background:#fff; border-radius:6px; padding:22px; }
        .term-history-stat .y{ font-family:'Sora',sans-serif; font-weight:800; font-size:32px; }
        .term-history-stat:first-child .y{ color:#02C6FA; } .term-history-stat:last-child .y{ color:#7E1CF1; }
        .term-history-stat .l{ font-family:'Sora',sans-serif; font-weight:700; font-size:10px; letter-spacing:0.04em; color:var(--term-ink-soft); margin-top:4px; }
        .term-values{ padding:72px 0; }
        .term-values-grid > div{ border-radius:8px; padding:24px 20px; transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-values-grid > div:nth-child(1){ background:var(--term-ink); color:#fff; }
        .term-values-grid > div:nth-child(2){ background:var(--term-lav); }
        .term-values-grid > div:nth-child(3){ background:var(--term-grey); }
        .term-values-grid > div:nth-child(4){ background:var(--term-ink); color:#fff; }
        .term-values-grid > div:nth-child(1) .n{ color:#02C6FA; } .term-values-grid > div:nth-child(4) .n{ color:#E61A97; }
        .term-values-grid > div:nth-child(2) .n, .term-values-grid > div:nth-child(3) .n{ color:#7E1CF1; }
        .term-values-grid > div:nth-child(1) p, .term-values-grid > div:nth-child(4) p{ color:#B9B7C7; }
        .term-values-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:32px; }
        @media (max-width:800px){ .term-values-grid{ grid-template-columns:1fr 1fr; } }
        .term-values-grid .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:16px; color:#7E1CF1; margin-bottom:12px; }
        .term-values-grid h4{ font-size:15px; font-weight:700; margin-bottom:6px; }
        .term-values-grid p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-examples{ padding:0 0 56px; }
        .term-examples-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media (max-width:800px){ .term-examples-grid{ grid-template-columns:1fr; } }
        .term-example-card{ background:var(--term-grey); border-radius:8px; padding:18px 20px; }
        .term-example-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .term-example-top .cat{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.04em; text-transform:uppercase; color:var(--term-ink-soft); }
        .term-example-top .status{ font-size:10px; font-weight:700; padding:3px 9px; border-radius:100px; text-transform:uppercase; letter-spacing:0.02em; }
        .term-example-top .status.certified{ background:#E4F9EC; color:#1E8449; }
        .term-example-top .status.review{ background:#FBF3D9; color:#8A6D1D; }
        .term-example-top .status.audit{ background:#FBE4E4; color:#B33B3B; }
        .term-example-card .id{ font-family:'Sora',sans-serif; font-weight:800; font-size:15px; margin-bottom:12px; }
        .term-example-card .score-row{ display:flex; align-items:center; gap:10px; }
        .term-example-card .bar{ flex:1; height:6px; background:var(--term-line); border-radius:100px; overflow:hidden; }
        .term-example-card .bar .fill{ height:100%; border-radius:100px; }
        .term-example-card .val{ font-family:'Sora',sans-serif; font-weight:800; font-size:14px; white-space:nowrap; }
        .term-example-card .val .max{ font-size:10px; font-weight:500; color:var(--term-ink-soft); }
        .term-score-hero{ padding:8px 0 56px; }
        .term-score-hero-inner{ background:var(--term-ink); border-radius:10px; padding:48px 44px; display:flex; align-items:center; gap:48px; flex-wrap:wrap; }
        .term-score-hero-num{ display:flex; align-items:baseline; flex-shrink:0; }
        .term-score-hero-num .big{ font-family:'Fraunces',serif; font-weight:600; font-size:clamp(72px,11vw,140px); line-height:1; background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .term-score-hero-num .max{ font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(20px,2.4vw,30px); color:#565B6B; margin-left:6px; }
        .term-score-hero-text{ flex:1; min-width:260px; }
        .term-gradient-text{ background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .term-score-hero-text .term-eyebrow{ color:#8A87A8; }
        .term-score-hero-text h2{ color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(22px,2.6vw,30px); margin:8px 0 12px; max-width:20ch; }
        .term-score-hero-text p{ color:#B9B7C7; font-size:14px; line-height:1.6; max-width:44ch; }
        .term-badges{ padding:32px 0; border-bottom:1px solid var(--term-line); }
        .term-badges-row{ display:flex; gap:14px; flex-wrap:wrap; justify-content:center; }
        .term-badge{ display:flex; align-items:center; gap:8px; background:var(--term-grey); border-radius:100px; padding:10px 18px; font-size:12.5px; font-weight:600; color:var(--term-ink-soft); transition:transform 0.25s ease, background 0.25s ease; }
        .term-badge:hover{ transform:translateY(-3px); background:#fff; box-shadow:0 8px 20px rgba(0,0,0,0.08); }
        .term-badge svg{ width:16px; height:16px; color:#7E1CF1; flex-shrink:0; }
        .term-network{ padding:72px 0; }
        .term-network-split{ display:grid; grid-template-columns:0.75fr 1.6fr; gap:40px; align-items:start; }
        @media (max-width:900px){ .term-network-split{ grid-template-columns:1fr; } }
        .term-network-heading{ position:sticky; top:100px; }
        .term-network-heading h2{ max-width:11ch; }
        .term-network-grid{ display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:901px){ .term-network-grid{ margin-top:0; } }
        .term-network-card{ background:var(--term-grey); border-radius:8px; padding:28px 24px; border-top:3px solid transparent; transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-network-card:nth-child(1){ border-top-color:#3ADB76; }
        .term-network-card:nth-child(2){ border-top-color:#7E1CF1; }
        .term-network-card:nth-child(3){ border-top-color:#E61A97; }
        .term-network-card:hover{ transform:translateY(-6px) scale(1.02); box-shadow:0 16px 34px rgba(0,0,0,0.1); }
        .term-network-card .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:28px; margin-bottom:14px; }
        .term-network-card h4{ font-size:16px; font-weight:700; margin-bottom:4px; }
        .term-network-card .who{ font-size:11px; font-weight:600; color:#8A87A8; text-transform:uppercase; letter-spacing:0.02em; margin-bottom:12px; }
        .term-network-card p{ font-size:13px; line-height:1.6; color:var(--term-ink-soft); }
        .term-registry-intro{ max-width:64ch; margin:16px 0 32px; display:flex; flex-direction:column; gap:12px; padding:22px 26px; border-radius:8px; background:linear-gradient(135deg, rgba(126,28,241,0.06), rgba(230,26,151,0.04)); border-left:3px solid #7E1CF1; }
        .term-registry-intro p{ font-size:14px; line-height:1.65; color:var(--term-ink-soft); }
        .term-independence{ padding:56px 0; background:var(--term-grey); }
        .term-independence-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:28px; }
        @media (max-width:800px){ .term-independence-grid{ grid-template-columns:1fr; } }
        .term-independence-card{ background:#fff; border-radius:8px; padding:26px 24px; border-left:3px solid transparent; box-shadow:0 4px 16px rgba(0,0,0,0.04); transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-independence-card:nth-child(1){ border-left-color:#7E1CF1; }
        .term-independence-card:nth-child(2){ border-left-color:#E61A97; }
        .term-independence-card:hover{ transform:translateY(-5px); }
        .term-independence-card h4{ font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin-bottom:10px; }
        .term-independence-card p{ font-size:13px; line-height:1.6; color:var(--term-ink-soft); }
        .term-security{ padding:56px 0 72px; }
        .term-security-grid{ display:flex; flex-direction:column; gap:2px; margin-top:28px; border-radius:8px; overflow:hidden; }
        .term-security-item{ display:flex; align-items:center; gap:14px; background:var(--term-grey); padding:18px 22px; font-size:14px; font-weight:500; transition:background 0.25s ease, padding-left 0.25s ease; }
        .term-sec-ico{ width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; }
        .term-sec-ico.ico1{ background:#3ADB76; }
        .term-sec-ico.ico2{ background:#7E1CF1; }
        .term-sec-ico.ico3{ background:#02C6FA; }
        .term-security-item:hover{ background:#E4F9EC; padding-left:28px; }
        .term-security-item svg{ color:#3ADB76; flex-shrink:0; }
        .term-milestone{ padding:64px 0; background:var(--term-grey); }
        .term-milestone-h2{ font-weight:700; font-size:clamp(24px,3vw,34px); margin:8px 0 14px; max-width:16ch; }
        .term-milestone-intro{ font-size:14.5px; line-height:1.7; color:var(--term-ink-soft); max-width:64ch; margin-bottom:40px; }
        .term-timeline{ display:flex; align-items:flex-start; gap:8px; margin-bottom:36px; }
        @media (max-width:800px){ .term-timeline{ flex-direction:column; } }
        .term-timeline-step{ flex:1; background:#fff; border-radius:8px; padding:22px 20px; }
        .term-timeline-arrow{ display:flex; align-items:center; justify-content:center; color:#B9B7C7; font-size:20px; padding-top:20px; }
        @media (max-width:800px){ .term-timeline-arrow{ transform:rotate(90deg); padding:0; align-self:center; } }
        .term-timeline-step .dot{ width:14px; height:14px; border-radius:50%; margin-bottom:14px; }
        .term-timeline-step .dot.green{ background:#3ADB76; box-shadow:0 0 0 5px rgba(58,219,118,0.15); }
        @keyframes termPulse{ 0%,100%{ box-shadow:0 0 0 5px rgba(58,219,118,0.15); } 50%{ box-shadow:0 0 0 9px rgba(58,219,118,0.06); } }
        .term-timeline-step .dot.amber{ background:#F0C55E; box-shadow:0 0 0 5px rgba(240,197,94,0.18); }
        .term-timeline-step .dot.grey{ background:#8A87A8; box-shadow:0 0 0 5px rgba(138,135,168,0.15); }
        .term-timeline-step .tl-label{ font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; margin-bottom:6px; }
        .term-timeline-step .tl-desc{ font-size:12.5px; line-height:1.55; color:var(--term-ink-soft); }
        .term-milestone-examples{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        @media (max-width:700px){ .term-milestone-examples{ grid-template-columns:1fr; } }
        .term-milestone-point{ display:flex; align-items:flex-start; gap:14px; background:#fff; border-radius:6px; padding:16px 18px; }
        .term-milestone-point .ex-title{ font-size:13.5px; font-weight:600; margin-bottom:4px; }
        .term-milestone-point .ex-score{ font-size:12px; color:var(--term-ink-soft); font-family:'Sora',sans-serif; }
        .term-milestone-point .ex-score b{ color:var(--term-ink); font-weight:800; }
        .term-milestone-point .delta{ font-weight:700; margin-left:4px; }
        .term-milestone-point .up-delta{ color:#1E8449; }
        .term-milestone-point .down-delta{ color:#B33B3B; }
        .term-milestone-point .ico{ font-family:'Sora',sans-serif; font-weight:800; font-size:16px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .term-milestone-point.up .ico{ background:#E4F9EC; color:#1E8449; }
        .term-milestone-point.down .ico{ background:#FBE4E4; color:#B33B3B; }
        .term-stats{ padding:48px 0 32px; }
        .term-stats-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .term-stats-grid.three{ grid-template-columns:repeat(3,1fr); }
        @media (max-width:800px){ .term-stats-grid{ grid-template-columns:1fr 1fr; } .term-stats-grid.three{ grid-template-columns:1fr; } }
        .term-stat-card.founder{ background:linear-gradient(135deg,#7E1CF1,#E61A97); }
        .term-stat-card.founder .v{ background:none; -webkit-text-fill-color:initial; color:#fff; -webkit-background-clip:initial; background-clip:initial; }
        .term-stat-card.founder .l{ color:rgba(255,255,255,0.85); }
        .term-stat-card.founder .s{ color:rgba(255,255,255,0.7); }
        .term-stat-card.founder:hover{ border-color:transparent; filter:brightness(1.08); }
        .term-stat-card{ background:var(--term-grey); border-radius:8px; padding:24px 20px; text-align:center; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), border-color 0.3s ease; border:1px solid transparent; }
        .term-stat-card:hover{ transform:translateY(-5px); border-color:#7E1CF1; }
        .term-stat-card .v{ font-family:'Fraunces',serif; font-weight:600; font-size:clamp(28px,3.6vw,38px); color:#7E1CF1; }
        .term-stat-card .l{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.03em; margin-top:6px; }
        .term-stat-card .s{ font-size:11px; color:var(--term-ink-soft); margin-top:3px; }
        .term-cert-ticker{ margin-top:40px; overflow:hidden; }
        .term-cert-ticker-label{ text-align:center; font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--term-ink-soft); margin-bottom:20px; }
        .term-cert-ticker-track{ display:flex; gap:28px; width:max-content; animation:termTickerScroll 30s linear infinite; }
        @keyframes termTickerScroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
        .term-cert-chip{ display:flex; align-items:center; gap:10px; flex-shrink:0; opacity:0.75; }
        .term-cert-chip .av{ width:34px; height:34px; border-radius:50%; background:var(--term-lav); color:#7A2062; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:800; font-size:12px; }
        .term-mission{ position:relative; overflow:hidden; padding:56px 0;
          background:linear-gradient(120deg, #0B0E14 0%, #0B0E14 28%, #7E1CF1 48%, #7E1CF1 58%, #E61A97 74%, #E61A97 84%, #02C6FA 100%);
        }
        .term-mission p{ color:#fff; font-family:'Sora',sans-serif; font-style:italic; font-weight:800; font-size:clamp(26px,3.6vw,42px); max-width:26ch; line-height:1.2; }
        .term-newera{ padding:72px 0; background:var(--term-grey); }
        .term-eyebrow{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:15px; letter-spacing:0.01em; color:#7A2062; text-transform:none; margin-bottom:10px; }
        .term-validation{ padding:56px 0 72px; }
        .term-validation-sub{ font-size:14px; color:var(--term-ink-soft); max-width:56ch; margin:8px 0 32px; }
        .term-validation-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media (max-width:800px){ .term-validation-grid{ grid-template-columns:1fr 1fr; } }
        .term-validation-step{ background:var(--term-grey); border-radius:8px; padding:22px 20px; border-top:3px solid transparent; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease; }
        .term-validation-step:nth-child(1){ border-top-color:#7E1CF1; }
        .term-validation-step:nth-child(2){ border-top-color:#E61A97; }
        .term-validation-step:nth-child(3){ border-top-color:#02C6FA; }
        .term-validation-step:nth-child(4){ border-top-color:#3ADB76; }
        .term-validation-step:nth-child(1) .num{ color:#7E1CF1; }
        .term-validation-step:nth-child(2) .num{ color:#E61A97; }
        .term-validation-step:nth-child(3) .num{ color:#02C6FA; }
        .term-validation-step:nth-child(4) .num{ color:#3ADB76; }
        .term-validation-step:hover{ transform:translateY(-5px); }
        .term-validation-step .num{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:17px; color:#7E1CF1; }
        .term-validation-step h5{ font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; margin:10px 0 6px; }
        .term-validation-step p{ font-size:12.5px; color:var(--term-ink-soft); line-height:1.5; }
        .term-newera-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:36px; }
        @media (max-width:900px){ .term-newera-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-newera-card{ background:#fff; border-radius:8px; padding:28px 22px; border-top:3px solid var(--term-line); }
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
        .term-why-item .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:16px; color:#7E1CF1; margin-bottom:12px; }
        .term-why-item h4{ font-size:15px; font-weight:700; margin-bottom:6px; }
        .term-why-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-registry{ padding:20px 0 72px; }
        .term-reg-scroll{ display:flex; gap:16px; overflow-x:auto; margin-top:28px; }
        .term-reg-card{ flex:0 0 230px; background:var(--term-ink); border-radius:6px; overflow:hidden; color:#fff; }
        .term-reg-art{ position:relative; aspect-ratio:16/11; overflow:hidden; transition:filter 0.4s ease; }
        .term-reg-card:hover .term-reg-art{ filter:saturate(1.25) brightness(1.05); }
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
        .term-modal-card{ background:#fff; border-radius:8px; max-width:540px; width:100%; max-height:88vh; overflow-y:auto; position:relative; }
        .term-modal-cover{ position:relative; aspect-ratio:16/8; }
        .term-modal-cover::after{ content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(11,14,20,0.7) 0%, transparent 70%); }
        .term-modal-close{ position:absolute; top:14px; right:14px; z-index:2; background:rgba(11,14,20,0.6); color:#fff; border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; }
        .term-modal-score{ position:absolute; bottom:-26px; left:26px; z-index:2; background:var(--term-ink); color:#fff; border-radius:6px; padding:12px 16px; display:flex; align-items:baseline; gap:4px; box-shadow:0 8px 20px rgba(0,0,0,0.2); }
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
        .term-join-card{ background:#fff; border-radius:8px; max-width:440px; width:100%; padding:36px 30px; position:relative; border-top:4px solid transparent; border-image:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA) 1; }
        .term-info-modal{ background:#fff; border-radius:8px; max-width:680px; width:100%; max-height:82vh; overflow-y:auto; padding:40px 36px; position:relative; animation:termModalIn 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-info-modal .term-join-title{ margin-bottom:20px; }
        .term-info-modal .term-model-grid{ grid-template-columns:1fr; gap:14px; }
        .term-info-modal .term-legal-grid{ grid-template-columns:1fr; gap:2px; }
        .term-join-close{ position:absolute; top:18px; right:18px; background:var(--term-grey); border:none; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; color:var(--term-ink); }
        .term-join-title{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; margin-bottom:8px; }
        .term-join-sub{ font-size:13.5px; color:var(--term-ink-soft); margin-bottom:24px; line-height:1.5; }
        .term-join-cats{ display:flex; gap:8px; margin-bottom:18px; }
        .term-join-cats button{ flex:1; padding:10px 6px; border-radius:10px; border:1px solid var(--term-line); background:#fff; font-size:12px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; color:var(--term-ink-soft); }
        .term-join-cats button.active{ background:linear-gradient(90deg,#7E1CF1,#E61A97); color:#fff; border-color:transparent; }
        .term-join-field{ margin-bottom:14px; }
        .term-join-field label{ display:block; font-size:11px; font-weight:700; color:var(--term-ink-soft); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.02em; }
        .term-join-field input{ width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--term-line); font-size:14px; font-family:'Inter',sans-serif; box-sizing:border-box; }
        .term-join-field input:focus{ outline:none; border-color:#7E1CF1; }
        .term-join-error{ background:#FBE4EF; color:#7A2062; font-size:12.5px; padding:10px 14px; border-radius:10px; margin-bottom:14px; }
        .term-join-submit{ width:100%; background:var(--term-ink); color:#fff; border:none; padding:14px; border-radius:100px; font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; cursor:pointer; margin-top:6px; }
        .term-join-submit.secondary-close{ background:none; color:var(--term-ink-soft); }
        .term-join-later-link{ display:block; margin:14px auto 0; background:none; border:none; color:var(--term-ink-soft); font-size:13px; text-decoration:underline; cursor:pointer; }
        .term-join-submit:disabled{ opacity:0.6; cursor:default; }
        .term-join-success .icon{ width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#7E1CF1,#02C6FA); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; font-weight:800; margin-bottom:18px; font-family:'Sora',sans-serif; }
        .term-join-success .pos{ font-size:13px; color:var(--term-ink-soft); margin-bottom:4px; }
        .term-join-steps{ margin-top:18px; padding-top:18px; border-top:1px solid var(--term-line); }
        .term-join-steps .step{ display:flex; gap:10px; font-size:13px; color:var(--term-ink-soft); margin-bottom:10px; align-items:flex-start; }
        .term-join-steps .step b{ color:var(--term-ink); }
        .term-join-keybox{ margin-top:16px; display:flex; align-items:center; justify-content:space-between; gap:10px; background:var(--term-grey); border:1px dashed var(--term-line); border-radius:6px; padding:12px 14px; }
        .term-join-keybox span{ font-family:'Sora',sans-serif; font-weight:800; font-size:14px; letter-spacing:0.03em; }
        .term-join-keybox button{ flex-shrink:0; border:1px solid var(--term-line); background:#fff; color:var(--term-ink); font-family:'Sora',sans-serif; font-weight:700; font-size:12px; padding:8px 14px; border-radius:100px; cursor:pointer; }
        /* Animations : apparition au scroll + survol */
        .term-reveal{ opacity:0; transform:translateY(22px); transition:opacity 0.7s ease, transform 0.7s cubic-bezier(.2,.7,.3,1); }
        .term-reveal:nth-child(2){ transition-delay:0.08s; }
        .term-reveal:nth-child(3){ transition-delay:0.16s; }
        .term-reveal:nth-child(4){ transition-delay:0.24s; }
        .term-reveal:nth-child(5){ transition-delay:0.32s; }
        .term-reveal.visible{ filter:blur(0); }
        .term-reveal.visible{ opacity:1; transform:translateY(0); }
        .term-pillar{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-pillar:hover{ transform:translateY(-6px) scale(1.03); box-shadow:0 20px 40px rgba(0,0,0,0.16); }
        .term-newera-card{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.6s ease; }
        .term-newera-card:hover{ transform:translateY(-8px) scale(1.03); box-shadow:0 22px 44px rgba(126,28,241,0.12); border-top-color:#7E1CF1; }
        .term-why-item{ transition:background 0.25s ease; }
        .term-why-item:hover{ background:var(--term-grey); }
        .term-compare-col{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-compare-col:hover{ transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.08); }
        .term-history-stat{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-history-stat:hover{ transform:translateY(-6px); }
        .term-reg-card{ transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .term-reg-card:hover{ transform:translateY(-8px) scale(1.035); box-shadow:0 22px 44px rgba(0,0,0,0.3); }
        .term-price{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-price:hover{ transform:translateY(-8px) scale(1.03); box-shadow:0 20px 40px rgba(126,28,241,0.14); }
        .term-values-grid > div{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-values-grid > div:hover{ transform:translateY(-6px); }
        .term-btn-primary{ transition:background 0.25s ease, transform 0.2s ease; }
        .term-btn-primary:active{ transform:scale(0.97); }
        .term-modal-card{ animation:termModalIn 0.3s cubic-bezier(.2,.8,.2,1); }
        @keyframes termModalIn{ from{ opacity:0; transform:translateY(20px) scale(0.98); } to{ opacity:1; transform:translateY(0) scale(1); } }
        .term-free-banner{ padding:56px 0 0; }
        .term-free-card{ background:var(--term-ink); border-radius:8px; padding:44px 40px; }
        .term-free-tag{ display:inline-block; font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.05em; text-transform:uppercase; color:#02C6FA; background:rgba(2,198,250,0.12); padding:6px 14px; border-radius:100px; margin-bottom:18px; }
        .term-free-card h2{ color:#fff; font-size:clamp(24px,3.2vw,36px); max-width:20ch; margin-bottom:14px; }
        .term-free-card p{ color:#B9B7C7; font-size:14px; line-height:1.65; max-width:64ch; margin-bottom:28px; }
        .term-free-slots{ display:flex; gap:14px; flex-wrap:wrap; margin-bottom:28px; }
        .term-free-slot{ flex:1; min-width:140px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:20px; display:flex; flex-direction:column; align-items:flex-start; gap:8px; }
        .term-free-slot .num{ width:28px; height:28px; border-radius:50%; background:#7E1CF1; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:14px; }
        .term-free-slot .lbl{ color:#fff; font-weight:600; font-size:14px; }
        .term-free-slot .free{ color:#3ADB76; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; }
        .term-free-cta{ background:#fff; color:var(--term-ink); border:none; padding:14px 26px; border-radius:100px; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; cursor:pointer; }
        .term-free-cta:hover{ background:#02C6FA; }
        .term-pricing{ padding:56px 0 72px; }
        .term-price-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:32px; }
        @media (max-width:900px){ .term-price-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-price{ border-radius:20px; padding:26px 20px; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-price.lav{ background:var(--term-lav); }
        .term-price.grey{ background:var(--term-grey); }
        .term-price.dark{ background:var(--term-ink); color:#fff; }
        .term-price .name{ font-family:'Sora',sans-serif; font-weight:700; font-size:16px; }
        .term-price .amount{ font-family:'Sora',sans-serif; font-weight:800; font-size:28px; margin-top:6px; }
        .term-price .desc{ font-size:12.5px; margin-top:8px; opacity:0.75; }
        .term-registry-example-note{ font-size:12.5px; color:var(--term-ink-soft); margin-top:6px; margin-bottom:20px; }
        .term-price-note{ font-size:12.5px; color:var(--term-ink-soft); line-height:1.6; margin-top:16px; max-width:60ch; }
        .term-pricing-intro{ font-size:14px; color:var(--term-ink-soft); max-width:64ch; margin:10px 0 28px; }
        .term-price-features{ list-style:none; padding:0; margin:14px 0 0; display:flex; flex-direction:column; gap:6px; }
        .term-price-features li{ font-size:12px; line-height:1.4; padding-left:14px; position:relative; opacity:0.85; }
        .term-price-features li::before{ content:'—'; position:absolute; left:0; opacity:0.5; }
        .term-validator-card{ margin-top:16px; background:var(--term-grey); border-radius:8px; padding:24px 26px; display:flex; flex-wrap:wrap; gap:24px; justify-content:space-between; align-items:flex-start; }
        .term-validator-card .left{ flex:1; min-width:220px; }
        .term-validator-card .name{ font-family:'Fraunces',serif; font-weight:700; font-size:17px; margin-bottom:6px; }
        .term-validator-card .left p{ font-size:13px; color:var(--term-ink-soft); line-height:1.5; }
        .term-validator-card .term-price-features{ margin:0; min-width:240px; }
        .term-cta{ background:var(--term-lav); padding:56px 0; }
        .term-cta-inner{ display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap; }
        .term-cta h2{ font-weight:800; font-size:clamp(24px,3vw,34px); max-width:22ch; color:var(--term-ink); }
        .term-footer{ background:var(--term-ink); color:#B9B7C7; padding-top:48px; }
        .term-footer-tabs{ padding:32px 0 8px; }
        .term-tab-close{ background:var(--term-grey); border:none; padding:8px 16px; border-radius:100px; font-family:'Sora',sans-serif; font-weight:700; font-size:12px; color:var(--term-ink-soft); cursor:pointer; margin-bottom:20px; }
        .term-tab-close:hover{ background:var(--term-lav); }
        .term-tab-panel{ margin-top:24px; animation:termTabIn 0.3s ease; }
        @keyframes termTabIn{ from{ opacity:0; transform:translateY(-8px); } to{ opacity:1; transform:translateY(0); } }
        .term-model{ padding:72px 0; background:var(--term-grey); }
        .term-model-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:32px; }
        @media (max-width:800px){ .term-model-grid{ grid-template-columns:1fr; } }
        .term-model-card{ background:#fff; border-radius:8px; padding:26px 22px; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease; }
        .term-model-card:hover{ transform:translateY(-6px) scale(1.02); box-shadow:0 18px 36px rgba(126,28,241,0.1); }
        .term-model-card .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:16px; color:#7E1CF1; margin-bottom:12px; }
        .term-model-card h4{ font-size:15px; font-weight:700; margin-bottom:8px; }
        .term-model-card p{ font-size:13px; line-height:1.6; color:var(--term-ink-soft); }
        .term-legal{ padding:56px 0; }
        .term-legal-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-top:28px; border-radius:8px; overflow:hidden; }
        @media (max-width:700px){ .term-legal-grid{ grid-template-columns:1fr; } }
        .term-legal-item{ background:var(--term-grey); padding:20px 22px; transition:background 0.25s ease; }
        .term-legal-item:hover{ background:var(--term-lav); }
        .term-legal-item h5{ font-family:'Sora',sans-serif; font-weight:700; font-size:13px; margin-bottom:8px; }
        .term-legal-item p{ font-size:12px; line-height:1.6; color:var(--term-ink-soft); }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
            <button className="term-pill ghost" onClick={onGuestBrowse}>{t('Parcourir sans compte', 'Browse without an account')}</button>
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
      {/* Stats live + bandeau certificateurs — repris d'AboutView */}
      <section className="term-stats">
        <div className="term-wrap">
          <div className="term-stats-grid three">
            <div className="term-stat-card term-reveal"><div className="v">20+</div><div className="l">{t("Ans d'existence", 'Years of existence')}</div><div className="s">{t('Depuis 2006', 'Since 2006')}</div></div>
            <div className="term-stat-card term-reveal"><div className="v">9+</div><div className="l">{t('Disciplines créatives', 'Creative disciplines')}</div><div className="s">{t('Musique, cinéma, mode, gaming…', 'Music, film, fashion, gaming…')}</div></div>
            <div className="term-stat-card founder term-reveal" onClick={() => setShowJoin(true)} style={{ cursor: 'pointer' }}>
              <div className="v" style={{ fontSize: 22 }}>{t('Devenez fondateur', 'Become a founder')}</div>
              <div className="l">{t('150 premières places', 'First 150 spots')}</div>
              <div className="s">{t('Accès immédiat, sans attente →', 'Instant access, no waiting →')}</div>
            </div>
          </div>
        </div>

        {showcaseCertifiers.length > 0 && (
          <div className="term-cert-ticker">
            <p className="term-cert-ticker-label">{t('Ils certifient avec nous', 'They certify with us')}</p>
            <div className="term-cert-ticker-track">
              {[...showcaseCertifiers, ...showcaseCertifiers].map((c, i) => (
                <div key={i} className="term-cert-chip">
                  <span className="av">{c.name.slice(0, 2).toUpperCase()}</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="term-pillars" id="pillars" style={{ scrollMarginTop: 80 }}>
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Le Score LYA', 'The LYA Score')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(26px,3.2vw,38px)', marginBottom: 12 }}>
            <span className="term-gradient-text">{t('Cinq critères.', 'Five criteria.')}</span> {t('Un standard commun à tout le secteur créatif.', 'One standard shared across the whole creative sector.')}
          </h2>
          <p className="term-pillars-note">{t('Chaque critère est noté sur 200 points, pour un Score LYA total sur 1000.', 'Each criterion is scored out of 200 points, for a total LYA Score out of 1000.')}</p>
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

      {/* Grand affichage du concept Score /1000 — juste apres les piliers, c'est LE concept */}
      <section className="term-score-hero">
        <div className="term-wrap">
          <div className="term-score-hero-inner">
            <div className="term-score-hero-num">
              <span className="big">247</span><span className="max">/1000</span>
            </div>
            <div className="term-score-hero-text">
              <div className="term-eyebrow">{t('Le concept en un chiffre', 'The concept in one number')}</div>
              <h2>{t('Chaque œuvre a un Score ', 'Every work has a ')}<span style={{ textTransform: 'uppercase' }}>LYA</span>{t(' — sur 1000, toujours.', ' Score — out of 1000, always.')}</h2>
              <p>{t("Un seul standard, comparable d'une discipline à l'autre. 247, 580 ou 928 — le chiffre veut toujours dire la même chose.", 'One single standard, comparable across every discipline. 247, 580, or 928 — the number always means the same thing.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exemples concrets de score, sur 3 categories */}
      <section className="term-examples">
        <div className="term-wrap">
          <div className="term-examples-grid">
            {scoreExamples.map((ex) => (
              <div key={ex.id} className="term-example-card term-reveal">
                <div className="term-example-top">
                  <span className="cat">{ex.category}</span>
                  <span className={`status ${ex.statusColor}`}>{ex.status}</span>
                </div>
                <div className="id">{ex.id}</div>
                <div className="score-row">
                  <div className="bar"><div className="fill" style={{ width: `${ex.score / 10}%`, background: ex.barColor }} /></div>
                  <span className="val">{ex.score}<span className="max">/1000</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jalon : comment le score evolue */}
      <section className="term-milestone">
        <div className="term-wrap">
          <div className="term-eyebrow">{t("C'est quoi un jalon ?", 'What is a milestone?')}</div>
          <h2 className="term-milestone-h2">{t('Un score doit rester vivant.', 'A score has to stay alive.')}</h2>
          <p className="term-milestone-intro">{t(
            "Un jalon, c'est un événement clé et vérifié dans la vie d'un projet : une exposition, un contrat signé, un acteur qui rejoint le casting font avancer le Score LYA. Un litige ou un retard le font reculer. Mais un projet qui n'avance plus du tout n'est pas neutre — c'est un problème. LYA existe pour faire émerger les créateurs de demain, pas pour héberger des projets à l'arrêt.",
            "A milestone is a key, verified event in a project's life: an exhibition, a signed contract, an actor joining the cast push the LYA Score up. A dispute or a delay pull it down. But a project that stops moving isn't neutral — it's a problem. LYA exists to surface tomorrow's creators, not to host stalled projects."
          )}</p>

          <div className="term-timeline">
            <div className="term-timeline-step term-reveal">
              <div className="dot green" />
              <div className="tl-label">{t('Jalon vérifié', 'Verified milestone')}</div>
              <div className="tl-desc">{t('Le score évolue, à la hausse ou à la baisse — il reflète la réalité du projet.', 'The score moves, up or down — it reflects the real state of the project.')}</div>
            </div>
            <div className="term-timeline-arrow">→</div>
            <div className="term-timeline-step term-reveal">
              <div className="dot amber" />
              <div className="tl-label">{t('30 à 60 jours sans jalon', '30–60 days with no milestone')}</div>
              <div className="tl-desc">{t('LYA envoie un email de relance — une chance de reprendre la main sur votre projet.', 'LYA sends a reminder email — one chance to get back on track.')}</div>
            </div>
            <div className="term-timeline-arrow">→</div>
            <div className="term-timeline-step term-reveal">
              <div className="dot grey" />
              <div className="tl-label">{t('Toujours rien ?', 'Still nothing?')}</div>
              <div className="tl-desc">{t('Le projet et son score sont gelés temporairement, jusqu\'à la reprise d\'activité.', 'The project and its score are temporarily frozen, until activity resumes.')}</div>
            </div>
          </div>

          <div className="term-milestone-examples">
            <div className="term-milestone-point up term-reveal">
              <span className="ico">↑</span>
              <div>
                <div className="ex-title">{t('Un acteur reconnu rejoint le casting', 'A recognized actor joins the cast')}</div>
                <div className="ex-score">780 → <b>812</b> <span className="delta up-delta">+32</span></div>
              </div>
            </div>
            <div className="term-milestone-point down term-reveal">
              <span className="ico">↓</span>
              <div>
                <div className="ex-title">{t('Le distributeur repousse la sortie de six mois', 'The distributor delays the release by six months')}</div>
                <div className="ex-score">812 → <b>781</b> <span className="delta down-delta">-31</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Processus de validation en 4 etapes */}
      <section className="term-validation">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Processus', 'Process')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Une validation en 4 étapes.', 'A 4-step validation.')}</h2>
          <p className="term-validation-sub">{t('Chaque projet passe par les 4 mêmes étapes de revue avant de pouvoir être certifié — aucun raccourci, aucune exception.', 'Every project goes through the same 4 review steps before certification — no shortcuts, no exceptions.')}</p>
          <div className="term-validation-grid">
            <div className="term-validation-step term-reveal"><span className="num">01</span><h5>{t("Vérification d'origine", 'Origin verification')}</h5><p>{t('Authenticité et traçabilité de la création.', 'Authenticity and traceability of the work.')}</p></div>
            <div className="term-validation-step term-reveal"><span className="num">02</span><h5>{t('Analyse créative', 'Creative analysis')}</h5><p>{t('Originalité, qualité et potentiel artistique.', 'Originality, quality and artistic potential.')}</p></div>
            <div className="term-validation-step term-reveal"><span className="num">03</span><h5>{t('Droits & conformité', 'Rights & compliance')}</h5><p>{t('Vérification des droits de propriété et licences.', 'Ownership rights and license verification.')}</p></div>
            <div className="term-validation-step term-reveal"><span className="num">04</span><h5>{t('Validation finale', 'Final validation')}</h5><p>{t("Approbation définitive d'indexation LYA.", 'Final LYA indexation approval.')}</p></div>
          </div>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px) ' }}>Pour l'excellence créative.</h2>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce que ', 'What ')}<span style={{ textTransform: 'uppercase' }}>LYA</span>{t(" est — et n'est pas.", " is — and isn't.")}</h2>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)', maxWidth: '20ch' }}>{t("Vingt ans avant d'avoir un nom pour ça.", 'Twenty years before it had a name.')}</h2>
          <div className="term-history-grid">
            <div className="term-history-text">
              <p>{t(
                "En 2006, Jean-Baptiste Lequime fonde LinkYourArt avec une ambition claire : bâtir le premier pont international entre les créations et les industries qui en ont besoin. C'est en construisant LinkYourArt, au fil des années, qu'il a forgé son expérience en développement commercial dans les industries créatives, avec une spécialisation film et divertissement. Musique, cinéma, mode, jeux vidéo, design, architecture, arts de la scène — chaque création y trouve sa place, à une époque où aucune plateforme n'osait encore toutes les réunir.",
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce qui ne bouge pas, même quand tout évolue.', "What doesn't move, even as everything evolves.")}</h2>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t("Une reconnaissance qui se construit, pas qui s'achète.", 'Recognition that is built, not bought.')}</h2>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce à quoi ressemble un projet certifié', 'What a certified project looks like')}</h2>
          <p className="term-registry-example-note term-reveal">{t('Exemples représentatifs de projets, pour illustrer la diversité des catégories couvertes par LYA.', 'Representative examples, illustrating the range of categories LYA covers.')}</p>
          <div className="term-registry-intro term-reveal">
            <p>{t("Le Registre LYA n'est pas un livre de comptes financier, mais un registre de certification créative — il documente le Score LYA et l'historique des jalons de chaque projet certifié.", 'The LYA Registry is not a financial ledger, but a creative certification registry — it documents the LYA Score and milestone history of every certified project.')}</p>
            <p>{t("La validation se fait par la communauté et des experts créatifs, combinée à une analyse assistée par IA et des audits humains spécialisés.", 'Validation is performed by the community and creative experts, combined with AI-assisted analysis and specialized human audits.')}</p>
          </div>
          <div className="term-reg-scroll">
            {registry.map((r, i) => (
              <div key={r.title} className="term-reg-card term-reveal" onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}>
                <div className="term-reg-art" style={{ backgroundImage: `linear-gradient(to top, rgba(11,14,20,0.85) 0%, rgba(11,14,20,0.05) 55%), url(${r.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="term-reg-tags">
                    <span className="term-reg-tag" style={{ background: r.catColor }}>{t(r.cat.fr, r.cat.en).toUpperCase()}</span>
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

      {/* Badges certifies */}
      <section className="term-badges">
        <div className="term-wrap">
          <div className="term-badges-row">
            <div className="term-badge term-reveal"><Shield /><span>{t('Conforme RGPD', 'GDPR compliant')}</span></div>
            <div className="term-badge term-reveal"><Shield /><span>{t('Droits créatifs certifiés', 'Certified creative rights')}</span></div>
            <div className="term-badge term-reveal"><Shield /><span>{t('Authentification multi-facteurs', 'Multi-factor authentication')}</span></div>
          </div>
        </div>
      </section>

      {/* Reseau : Createurs / Mecenes / Professionnels */}
      <section className="term-network">
        <div className="term-wrap">
          <div className="term-network-split">
            <div className="term-network-heading term-reveal">
              <div className="term-eyebrow">{t('Le réseau LYA', 'The LYA network')}</div>
              <h2 style={{ fontWeight: 700, fontSize: 'clamp(26px,3.4vw,40px)' }}>{t('Trois rôles, un seul standard.', 'Three roles, one single standard.')}</h2>
            </div>
            <div className="term-network-grid">
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#3ADB76' }}>01</div>
                <h4>{t('Créateurs', 'Creators')}</h4>
                <div className="who">{t('Artistes, réalisateurs, scénaristes, auteurs', 'Artists, directors, screenwriters, authors')}</div>
                <p>{t('Faites certifier et valoriser officiellement votre œuvre. Conservez le contrôle artistique total, recevez le soutien de mécènes dès le lancement.', 'Get your work officially certified and showcased. Keep full artistic control, and receive patron support from day one.')}</p>
              </div>
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#7E1CF1' }}>02</div>
                <h4>{t('Mécènes', 'Patrons')}</h4>
                <div className="who">{t("Mécènes particuliers, fonds d'investissement, sponsors", 'Individual patrons, investment funds, sponsors')}</div>
                <p>{t('Soutenez les œuvres dès 50€. Le Score LYA garantit la rigueur de sélection. Suivez vos œuvres soutenues en temps réel.', 'Support works from €50. The LYA Score guarantees selection rigor. Track your supported works in real time.')}</p>
              </div>
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#E61A97' }}>03</div>
                <h4>{t('Professionnels', 'Professionals')}</h4>
                <div className="who">{t('Curateurs, agents artistiques, conseillers — studios, sociétés de production et de divertissement, institutions culturelles (type CNC)', 'Curators, artistic agents, advisors — studios, production and entertainment companies, cultural institutions (e.g. CNC)')}</div>
                <p>{t("Rejoignez notre réseau d'experts en validation certifiés. Évaluez des œuvres dans votre domaine, réseau professionnel exclusif inter-secteurs.", 'Join our network of certified validation experts. Evaluate works in your field, exclusive cross-sector network.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Securite */}
      {/* Independance des certificateurs */}
      <section className="term-independence">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Indépendance & confiance', 'Independence & trust')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Un score qui ne dépend de personne.', 'A score that depends on no one.')}</h2>
          <div className="term-independence-grid">
            <div className="term-independence-card term-reveal">
              <h4>{t('Indépendance des certificateurs', 'Certifier independence')}</h4>
              <p>{t("Les certificateurs LYA ne sont jamais rémunérés par le créateur ou le projet qu'ils évaluent. Leur évaluation n'est pas influencée par le succès du projet — c'est un engagement structurel, pas un argument marketing.", "LYA certifiers are never paid by the creator or project they evaluate. Their assessment is not influenced by the project's success — it's a structural commitment, not a marketing claim.")}</p>
            </div>
            <div className="term-independence-card term-reveal">
              <h4>{t('Pourquoi le nombre de certificateurs compte', 'Why the number of certifiers matters')}</h4>
              <p>{t("Un score porté par un seul évaluateur est une opinion. Un score porté par plusieurs certificateurs indépendants est un signal. Nous affichons le vrai nombre de certificateurs derrière chaque Score LYA.", 'A score backed by a single evaluator is an opinion. A score backed by several independent certifiers is a signal. We display the real number of certifiers behind every LYA Score.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="term-security">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Sécurité & confiance', 'Security & trust')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Bâti sur des fondations rigoureuses.', 'Built on rigorous foundations.')}</h2>
          <div className="term-security-grid">
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico1"><Shield size={16} /></span><span>{t('Conforme RGPD — protection des données de bout en bout', 'GDPR compliant — end-to-end data protection')}</span></div>
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico2"><Shield size={16} /></span><span>{t('Droits créatifs certifiés légalement à chaque étape', 'Legally certified creative rights at every step')}</span></div>
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico3"><Shield size={16} /></span><span>{t('Authentification multi-facteurs & infrastructure sécurisée', 'Multi-factor authentication & secure infrastructure')}</span></div>
          </div>
        </div>
      </section>

      {/* Pop-up fiche projet */}
      {project && (
        <div className="term-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="term-modal-card">
            <div className="term-modal-cover" style={{ backgroundImage: `linear-gradient(to top, rgba(11,14,20,0.75) 0%, rgba(11,14,20,0.05) 55%), url(${project.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <button className="term-modal-close" onClick={() => setSelected(null)}>×</button>
              <div className="term-modal-score"><span className="val">{project.score}</span><span className="max">/1000</span></div>
            </div>
            <div className="term-modal-body">
              <div className="term-modal-cat">{t(project.cat.fr, project.cat.en)}</div>
              <div className="term-modal-title">{project.title}</div>
              <p className="term-modal-desc">{t(project.desc.fr, project.desc.en)}</p>
              <div className="term-modal-meta">
                <div><div className="l">{t('Référence LYA', 'LYA Reference')}</div><div className="v">{project.creator}</div></div>
                <div><div className="l">{t('Mécènes', 'Patrons')}</div><div className="v">{project.patrons}</div></div>
                <div><div className="l">{t('Statut', 'Status')}</div><div className="v">{t(project.status.fr, project.status.en)}</div></div>
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
      {/* 3 premiers projets gratuits — mis en avant, comme sur l'ancienne page */}
      <section className="term-free-banner">
        <div className="term-wrap">
          <div className="term-free-card term-reveal">
            <div className="term-free-tag">{t('Toujours actif — tous les créateurs', 'Always active — all creators')}</div>
            <h2>{t('Vos 3 premiers projets, certifiés à 100% gratuitement.', 'Your first 3 projects, certified 100% free.')}</h2>
            <p>{t("Chaque créateur sur LinkYourArt voit ses 3 premiers projets certifiés sans aucun frais — toujours, pour tout le monde, sans limite de temps. Pas de coût de certification standard, aucune contrepartie cachée.", 'Every creator on LinkYourArt gets their first 3 projects certified at no cost — always, for everyone, with no time limit. No standard certification fee, no hidden terms.')}</p>
            <div className="term-free-slots">
              <div className="term-free-slot"><span className="num">1</span><span className="lbl">{t('Projet #1', 'Project #1')}</span><span className="free">{t('Gratuit', 'Free')}</span></div>
              <div className="term-free-slot"><span className="num">2</span><span className="lbl">{t('Projet #2', 'Project #2')}</span><span className="free">{t('Gratuit', 'Free')}</span></div>
              <div className="term-free-slot"><span className="num">3</span><span className="lbl">{t('Projet #3', 'Project #3')}</span><span className="free">{t('Gratuit', 'Free')}</span></div>
            </div>
            <button className="term-free-cta" onClick={() => setShowJoin(true)}>{t('Pré-inscrivez-vous pour garantir votre place →', 'Pre-register to secure your spot →')}</button>
          </div>
        </div>
      </section>

      <section className="term-pricing" id="pricing" style={{ scrollMarginTop: 80 }}>
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Tarifs', 'Pricing')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Commencez gratuitement. Grandissez à votre rythme.', 'Start for free. Grow at your own pace.')}</h2>
          <p className="term-pricing-intro">{t('La découverte et le mécénat sont gratuits pour tous. Les paliers professionnels débloquent les outils de certification pour sourcer et auditer à grande échelle.', 'Discovery and patronage are free for everyone. Professional tiers unlock certification tooling for sourcing and auditing work at scale.')}</p>
          <div className="term-price-grid">
            <div className="term-price lav term-reveal" onClick={() => setShowJoin(true)} style={{ cursor: 'pointer' }}>
              <div>
                <div className="name">{t('Créateur', 'Creator')}</div>
                <div className="amount">0€</div>
                <ul className="term-price-features">
                  <li>{t('Jusqu\'à 3 projets', 'Up to 3 projects')}</li>
                  <li>{t('Score LYA gratuit', 'Free LYA Score')}</li>
                  <li>{t('Certifications suppl. à 5€', 'Extra certifications at €5')}</li>
                </ul>
              </div>
            </div>
            <div className="term-price grey term-reveal" onClick={() => setShowJoin(true)} style={{ cursor: 'pointer' }}>
              <div>
                <div className="name">Pro Starter</div>
                <div className="amount">79€<span style={{ fontSize: 13 }}>{t('/mois', '/mo')}</span></div>
                <ul className="term-price-features">
                  <li>{t('Jusqu\'à 25 soumissions/mois', 'Up to 25 submissions/mo')}</li>
                  <li>{t('Accès complet au registre', 'Full registry access')}</li>
                  <li>{t('File de revue prioritaire', 'Priority review queue')}</li>
                </ul>
              </div>
            </div>
            <div className="term-price dark term-reveal" onClick={() => setShowJoin(true)} style={{ cursor: 'pointer' }}>
              <div>
                <div className="name">Pro Advanced</div>
                <div className="amount">249€<span style={{ fontSize: 13 }}>{t('/mois', '/mo')}</span></div>
                <ul className="term-price-features">
                  <li>{t('Tout Pro Starter, plafond à 100/mois', 'Everything in Starter, cap raised to 100/mo')}</li>
                  <li>{t('Accès API', 'API access')}</li>
                  <li>{t('Gestionnaire de compte dédié', 'Dedicated account manager')}</li>
                </ul>
              </div>
            </div>
            <a className="term-price lav term-reveal" href="mailto:contact@linkyourart.com?subject=Entreprise%20Institutionnelle" style={{ cursor: 'pointer', textDecoration: 'none', display: 'block' }}>
              <div>
                <div className="name">{t('Entreprise institutionnelle', 'Institutional Enterprise')}</div>
                <div className="amount">{t('Sur devis', 'On request')}</div>
                <ul className="term-price-features">
                  <li>{t('Certification de catalogue complet', 'Full catalog certification')}</li>
                  <li>{t('Processus personnalisé', 'Custom certification workflow')}</li>
                  <li>{t('Support dédié 24/7', '24/7 dedicated support')}</li>
                </ul>
              </div>
            </a>
          </div>
          <p className="term-price-note">{t("L'Entreprise couvre la gestion de certification externalisée à l'échelle d'un catalogue entier — pas l'ajout d'un utilisateur de plus : vérification initiale automatisée, données de performance prédictives, suite d'accès institutionnel.", "Enterprise covers externalized certification management at the scale of an entire catalog — not one more user: automated initial vetting, predictive performance data, institutional access suite.")}</p>

          <div className="term-validator-card term-reveal">
            <div className="left">
              <div className="name">{t('Validateur Certifié', 'Certified Validator')}</div>
              <p>{t('Une accréditation professionnelle, pas un forfait payant — vous êtes payé pour certifier.', 'A professional accreditation, not a paid plan — get paid to certify.')}</p>
            </div>
            <ul className="term-price-features">
              <li>{t('Standard : toujours gratuit, toujours rémunéré', 'Standard: always free, always paid')}</li>
              <li>{t('Express : priorité, rémunération plus élevée', 'Express: priority, higher payout')}</li>
              <li>{t('4 paliers, rémunérés automatiquement', '4 tiers, paid automatically')}</li>
            </ul>
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
                          style={{ marginTop: 12 }}
                          onClick={() => {
                            if (!joinResult.accessKey) return;
                            try {
                              sessionStorage.setItem('lya_prefilled_code', joinResult.accessKey);
                              sessionStorage.setItem('lya_prefilled_email', joinEmail);
                            } catch { /* noop */ }
                            onSignup?.({ code: joinResult.accessKey, email: joinEmail });
                          }}
                        >
                          {t('Créer mon compte', 'Create my account')}
                        </button>
                      </>
                    )}
                  </>
                )}
                <button className="term-join-later-link" onClick={closeJoin}>{t('Plus tard', 'Later')}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notre Modele + Mentions legales : jamais visibles par defaut, uniquement
          ouvertes depuis les vrais liens de navigation du footer ci-dessous. */}
      {footerTab && (
        <div className="term-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFooterTab(null); }}>
          <div className="term-info-modal">
            <button className="term-modal-close" onClick={() => setFooterTab(null)}>×</button>

            {footerTab === 'model' && (
              <>
                <div className="term-join-title">{t('Notre modèle', 'Our model')}</div>
                <div className="term-model-grid">
                  <div className="term-model-card">
                    <div className="n">01</div>
                    <h4>{t('Simple & pour tous', 'Simple & for everyone')}</h4>
                    <p>{t("Le modèle LYA transforme l'évaluation créative complexe en un Score simple et objectif. Cela permet à n'importe qui — artiste, mécène ou simple passionné — de comprendre la qualité d'un projet et de soutenir sa réussite.", "The LYA model turns complex creative evaluation into a simple, objective Score. This allows anyone — artist, patron, or casual fan — to understand a project's quality and support its success.")}</p>
                  </div>
                  <div className="term-model-card">
                    <div className="n">02</div>
                    <h4>{t('Un standard de certification, pas un produit financier', 'A certification standard, not a financial product')}</h4>
                    <p>{t('Les créateurs se font certifier, les mécènes soutiennent les projets auxquels ils croient et reçoivent en retour des contreparties de reconnaissance. Direct, simple, sans instrument financier.', 'Creators get certified, patrons support projects they believe in and receive recognition-based considerations in return. Direct, easy, no financial instrument.')}</p>
                  </div>
                  <div className="term-model-card">
                    <div className="n">03</div>
                    <h4>{t('Un succès collaboratif', 'Collaborative success')}</h4>
                    <p>{t('LinkYourArt est un pont. Nous unissons les créateurs qui ont besoin de visibilité avec une communauté qui veut découvrir et défendre des œuvres nouvelles.', 'LinkYourArt is a bridge. We unite creators who need visibility with a community that wants to discover and champion new works.')}</p>
                  </div>
                </div>
              </>
            )}

            {footerTab === 'legal' && (
              <>
                <div className="term-join-title">{t('Informations légales', 'Legal information')}</div>
                <div className="term-legal-grid">
                  <div className="term-legal-item">
                    <h5>{t('Identité', 'Identity')}</h5>
                    <p>{t('LINKYOURART SASU, société immatriculée en France, 122 rue Amelot, 75011 Paris. SIRET : 108 141 946 00013. Fondée par Jean-Baptiste Lequime.', 'LINKYOURART SASU, a company registered in France, 122 rue Amelot, 75011 Paris. SIRET: 108 141 946 00013. Founded by Jean-Baptiste Lequime.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Propriété intellectuelle', 'Intellectual property')}</h5>
                    <p>{t("Logo, nom, design et algorithme du Score LYA sont la propriété exclusive de LINKYOURART SASU. Les projets créatifs enregistrés restent la propriété exclusive de leurs créateurs.", 'Logo, name, design and the LYA Score algorithm are the exclusive property of LINKYOURART SASU. Registered creative projects remain the exclusive property of their creators.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Données personnelles & RGPD', 'Personal data & GDPR')}</h5>
                    <p>{t('Nom, email et rôle sont collectés uniquement pour le fonctionnement de la plateforme. Droit d\'accès, de rectification et de suppression. Vos données ne sont jamais vendues.', 'Name, email and role are collected solely to operate the platform. Right to access, rectify and delete. Your data is never sold.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Hébergement', 'Hosting')}</h5>
                    <p>{t("Hébergé par Vercel Inc. (San Francisco, USA), avec Firebase (Google LLC) pour les données. Stockage conforme au RGPD.", 'Hosted by Vercel Inc. (San Francisco, USA), with Firebase (Google LLC) for data. GDPR-compliant storage.')}</p>
                  </div>
                </div>
              </>
            )}

            {footerTab === 'privacy' && (
              <>
                <div className="term-join-title">{t('Politique de confidentialité', 'Privacy Policy')}</div>
                <div className="term-legal-grid">
                  <div className="term-legal-item">
                    <h5>{t('Utilisation éthique', 'Ethical data use')}</h5>
                    <p>{t("Vos données vous appartiennent. Nous ne collectons que les informations nécessaires au fonctionnement de l'écosystème LYA, conformément aux exigences du RGPD.", 'Your data belongs to you. We only collect the information necessary for the operation of the LYA ecosystem, in line with GDPR requirements.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Stockage sécurisé', 'Secure storage')}</h5>
                    <p>{t('Nous utilisons des standards de cryptage modernes pour assurer que vos informations personnelles restent confidentielles.', 'We use modern encryption standards to ensure that your personal information remains confidential.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Contrôle total', 'Full control')}</h5>
                    <p>{t('Vous avez un contrôle total sur votre profil et votre activité — gestion des données simple et intuitive.', 'You have complete control over your profile and activity — simple, intuitive data management.')}</p>
                  </div>
                </div>
              </>
            )}

            {footerTab === 'cgu' && (
              <>
                <div className="term-join-title">{t('Conditions générales d\'utilisation', 'Terms of Service')}</div>
                <div className="term-legal-grid">
                  <div className="term-legal-item">
                    <h5>{t('Philosophie & accessibilité', 'Philosophy & accessibility')}</h5>
                    <p>{t("LinkYourArt est un écosystème inclusif ouvert aux créateurs, partenaires créatifs, professionnels et au grand public. Notre modèle repose sur la simplicité et l'équité.", 'LinkYourArt is an inclusive ecosystem open to creators, creative partners, professionals, and the general public. Our model is based on simplicity and fairness.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Le modèle de certification', 'The certification model')}</h5>
                    <p>{t("Chaque projet est évalué par une combinaison d'analyse algorithmique et de revue par des professionnels certifiés. Le Score LYA est un standard de certification — ce n'est pas un instrument financier.", 'Each project is evaluated by algorithmic analysis and review by certified professionals. The LYA Score is a certification standard — it is not a financial instrument.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Participation pour tous', 'Participation for all')}</h5>
                    <p>{t("Que vous soyez un artiste de renommée mondiale, un professionnel créatif ou simplement un passionné d'art, LYA vous propose des outils adaptés à vos besoins.", 'Whether you are a world-renowned artist, a creative professional, or simply an art enthusiast, LYA offers you tools tailored to your needs.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Transparence & sécurité', 'Transparency & security')}</h5>
                    <p>{t('Chaque projet certifié et chaque jalon sont enregistrés dans notre registre immuable. Cela assure une transparence totale pour tous les participants.', 'Every certified project and every milestone is registered in our immutable registry. This ensures total transparency for all participants.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Indépendance créative', 'Creative independence')}</h5>
                    <p>{t("LYA redonne le pouvoir aux créateurs et à ceux qui les soutiennent. L'art ne doit pas être régi par les lois de la haute finance.", 'LYA gives power back to creators and those who support them. Art should not be governed by the laws of high finance.')}</p>
                  </div>
                </div>
              </>
            )}

            {footerTab === 'faq' && (
              <>
                <div className="term-join-title">FAQ</div>
                <div className="term-legal-grid">
                  <div className="term-legal-item">
                    <h5>{t("Qu'est-ce que LinkYourArt (LYA) ?", 'What is LinkYourArt (LYA)?')}</h5>
                    <p>{t("LYA est un écosystème de certification créative où n'importe qui peut découvrir, certifier et soutenir des projets artistiques. Une plateforme indépendante qui rend l'évaluation objective de la qualité créative accessible à tous.", 'LYA is a creative certification ecosystem where anyone can discover, certify and support artistic projects. An independent platform that makes objective creative quality assessment accessible to everyone.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('LYA est-elle une plateforme financière ?', 'Is LYA a financial platform?')}</h5>
                    <p>{t("Non. Les mécènes qui soutiennent un projet le font via un mécénat de reconnaissance — ils n'acquièrent aucun instrument financier.", 'No. Patrons who support a project do so through recognition-based patronage — they acquire no financial instrument.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Ai-je besoin d\'un compte pour naviguer ?', 'Do I need an account to browse?')}</h5>
                    <p>{t("Non. Cette page et le Registre sont accessibles en lecture seule sans compte. Pour soutenir ou soumettre un projet, un compte gratuit est requis.", 'No. This page and the Registry are accessible read-only without an account. Supporting or submitting a project requires a free account.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Comment devenir professionnel validé ?', 'How to become a validated professional?')}</h5>
                    <p>{t("Soumettez une demande de Vérification Professionnelle avec vos accréditations, portfolio et références. Examinée sous 5 à 10 jours ouvrés par le comité LYA.", 'Submit a Professional Verification request with your credentials, portfolio and references. Reviewed within 5–10 business days by the LYA committee.')}</p>
                  </div>
                  <div className="term-legal-item">
                    <h5>{t('Mon soutien est-il sécurisé ?', 'Is my support secure?')}</h5>
                    <p>{t("Toutes les certifications et jalons sont enregistrés dans notre registre sécurisé et immuable.", 'All certifications and milestones are recorded in our secure, immutable registry.')}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="term-footer">
        <div className="term-wrap">
          <div className="term-foot-row" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size={80} color="multi" showBeta />
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
              <a href="#" onClick={(e) => { e.preventDefault(); setFooterTab('model'); }}>{t('Notre modèle', 'Our model')}</a>
            </div>
            <div>
              <h5>{t('CONTACT', 'CONTACT')}</h5>
              <div className="line">contact@linkyourart.com</div>
              <div className="line">Rennes / Paris</div>
            </div>
            <div>
              <h5>{t('LÉGAL', 'LEGAL')}</h5>
              <a href="#" onClick={(e) => { e.preventDefault(); setFooterTab('legal'); }}>{t('Mentions légales', 'Legal notice')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setFooterTab('privacy'); }}>{t('Confidentialité', 'Privacy')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setFooterTab('cgu'); }}>{t('CGU', 'Terms of Service')}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setFooterTab('faq'); }}>FAQ</a>
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
