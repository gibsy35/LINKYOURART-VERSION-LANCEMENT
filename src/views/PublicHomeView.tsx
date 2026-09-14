import React from 'react';
import { motion, useScroll, useTransform, MotionValue, AnimatePresence } from 'motion/react';
import { Shield, Eye, Users, Percent } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { COUNTRIES } from '../data/countries';
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
  { id: '#LYA-812', category: { fr: 'Film', en: 'Film' }, score: 928, status: { fr: 'Certifié', en: 'Certified' }, statusColor: 'certified', catColor: '#7E1CF1', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=600' },
  { id: '#LYA-445', category: { fr: 'Série TV', en: 'TV Series' }, score: 580, status: { fr: 'En révision', en: 'Under review' }, statusColor: 'review', catColor: '#02C6FA', img: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=600' },
  { id: '#LYA-901', category: { fr: 'Mode', en: 'Fashion' }, score: 420, status: { fr: 'Audit en cours', en: 'Audit in progress' }, statusColor: 'audit', catColor: '#E61A97', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600' },
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

// Petit effet de compteur qui monte au scroll — donne de la vie a un chiffre
// sans effet "tech/IA" (technique classique presse/ONG, pas un gadget SaaS).
// Effet de parallaxe leger sur les blocs photo — l'image de fond bouge un
// peu plus lentement que le defilement, donne de la profondeur (technique
// classique des sites premium type Wix Studio, en CSS/JS leger, sans
// bibliotheque lourde ni impact notable sur les perfs mobile).
const ParallaxPhoto: React.FC<{ image: string; className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ image, className, children, style }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Progression de -1 (bloc juste sous l'ecran) a +1 (bloc juste au-dessus)
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      setOffset(progress * 40); // 40px d'amplitude, discret mais visible
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div ref={ref} className={className} style={{ ...style, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: '-40px -5%', backgroundImage: `url(${image})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transform: `translateY(${offset}px)`, transition: 'transform 0.05s linear',
      }} />
      {children}
    </div>
  );
};


const CountUp: React.FC<{ to: number; duration?: number; suffix?: string }> = ({ to, duration = 1400, suffix = '' }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(to * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{value}{suffix}</span>;
};

// Hero avec effet cinematique reellement lie au defilement (pas une simple
// apparition) : pendant que l'utilisateur scrolle hors du hero, le degrade
// zoome et se deplace, le titre recule en profondeur et s'estompe. C'est ce
// genre d'effet, calcule en continu selon la position de scroll, qui donne
// la sensation "site premium" — une apparition ponctuelle ne suffit pas.
const HeroSection: React.FC<{ t: (fr: string, en: string) => string; setShowJoin: (v: boolean) => void }> = ({ t, setShowJoin }) => {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  const cardTilts = [7, -4, 10]; // petite rotation differente par exemple, pour un effet "carte que l'on distribue" a chaque changement plutot qu'un simple fondu plat
  const examples = [
    { cat: t('Musique', 'Music'), score: 247 },
    { cat: t('Cinéma', 'Film'), score: 580 },
    { cat: t('Séries TV', 'TV Series'), score: 928 },
  ];
  const [exIdx, setExIdx] = React.useState(0);
  const current = examples[exIdx];

  // Cycle automatique et aleatoire (pas juste round-robin) pour creer du
  // mouvement en continu sans dependre d'un clic — fonctionne pareil sur
  // PC, tablette et mobile. Le clic reste possible pour forcer un changement.
  React.useEffect(() => {
    const id = setInterval(() => {
      setExIdx((i) => {
        if (examples.length <= 1) return i;
        let next = i;
        while (next === i) next = Math.floor(Math.random() * examples.length);
        return next;
      });
    }, 3200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="term-hero" ref={ref}>
      <div className="term-hero-orb o1" />
      <div className="term-hero-orb o2" />
      <div className="term-hero-orb o3" />
      <div className="term-wrap term-hero-grid">
        <motion.div style={{ position: 'relative', y: titleY, opacity: titleOpacity, scale: titleScale }}>
          <motion.h1
            className="term-hero-title"
            style={{ textTransform: 'none' }}
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
          >
            {[
              ...t("Ce que vous créez aujourd'hui mérite d'être ", 'What you create today deserves to be ').split(' ').map(w => ({ text: w, accent: false })),
              ...t('reconnu demain.', 'recognized tomorrow.').split(' ').map(w => ({ text: w, accent: true })),
            ].map((w, i) => (
              <motion.span
                key={i}
                className={w.accent ? 'term-gradient-text' : undefined}
                style={{ display: 'inline-block', marginRight: '0.28em', willChange: 'transform' }}
                variants={{ hidden: { opacity: 0, y: 46, rotateX: -70 }, show: { opacity: 1, y: 0, rotateX: 0 } }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              >
                {w.text}
              </motion.span>
            ))}
          </motion.h1>
          <p className="term-hero-sub">
            {t(
              "Les projets créatifs ont toujours eu de la valeur. LYA leur en donne une reconnue, partageable et vérifiable — un registre certifié, une évaluation par des experts, un mécénat qui suit l'avancement réel du projet.",
              'Creative projects have always had value. LYA gives them one that is recognized, shareable and verifiable — a certified registry, expert evaluation, and patronage that follows the real progress of the project.'
            )}
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <button className="term-btn-primary term-btn-flash" onClick={() => setShowJoin(true)}>{t('Rejoindre LYA →', 'Join LYA →')}</button>
            <a href="#pillars" className="term-btn-ghost" style={{ textDecoration: 'none', display: 'inline-block' }}>{t('Comprendre le Score LYA', 'Understand the LYA Score')}</a>
          </div>
        </motion.div>
        <div className="term-hero-visual">
          <div className="term-hero-card-back" />
          <motion.div
            className="term-hero-card"
            onClick={() => setExIdx((i) => (i + 1) % examples.length)}
            role="button" tabIndex={0}
            aria-label={t('Voir un autre exemple de score', 'See another score example')}
            animate={{ rotate: cardTilts[exIdx % cardTilts.length] }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={exIdx}
                initial={{ opacity: 0, y: 18, scale: 0.9, rotate: -6 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: -14, scale: 0.94, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="score">
                  <span className="cat-line">{t('Score LYA', 'LYA Score')} · {current.cat}</span>
                  <span className="tap-hint">{t('toucher', 'tap')} →</span>
                </div>
                <span className="num">{current.score}</span><span className="max">/1000</span>
                <p>{t('Évalué sur 5 critères objectifs — qualité, marché, droits, innovation, croissance.', 'Assessed on 5 objective criteria — quality, market, rights, innovation, growth.')}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onJoin, onLogin, onSignup, onGuestBrowse }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [lang, setLang] = React.useState<'fr' | 'en'>('fr');
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const project = selected !== null ? registry[selected] : null;
  const rootRef = React.useRef<HTMLDivElement>(null);
  // Barre de progression de scroll pleine page (dynamisme supplementaire),
  // independante du scrollYProgress du hero plus haut qui ne suit que la
  // section hero elle-meme.
  const { scrollYProgress: pageScrollProgress } = useScroll();

  // Menu transparent (fondu avec le hero) en haut de page, qui gagne son
  // fond sombre flou seulement une fois qu'on a scrolle — plutot qu'une
  // barre demarquee en permanence.
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pop-up legere de pre-inscription : meme logique/backend que LandingView
  // (voir src/utils/preRegistration.ts), juste sans la page complete.
  const [showJoin, setShowJoin] = React.useState(false);
  const [joinCat, setJoinCat] = React.useState<PreRegCategory>('CREATOR');
  const [joinName, setJoinName] = React.useState('');
  const [joinEmail, setJoinEmail] = React.useState('');
  const [joinCountry, setJoinCountry] = React.useState('');
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
        name: joinName, email: joinEmail, category: joinCat, country: joinCountry || undefined,
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
    setJoinCountry('');
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
        .term-root p{ text-align:justify; text-justify:inter-word; }
        .term-pillar .d{ text-align:justify; text-justify:inter-word; }
        .term-mission p{ text-align:left; }
        .term-hero-title, .term-milestone-h2{ text-align:left; }
        .term-root .sora{ font-family:'Sora',sans-serif; }
        .term-wrap{ max-width:1160px; margin:0 auto; padding:0 40px; }
        @media (max-width:700px){ .term-wrap{ padding:0 22px; } }
        .term-scroll-progress{ position:fixed; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); transform-origin:0% 50%; z-index:200; }
        .term-header{ background:var(--term-ink); padding:20px 0; position:sticky; top:0; z-index:100; border-bottom:1px solid transparent; transition:background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease; }
        .term-header.is-scrolled{ background:rgba(11,14,20,0.5); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid rgba(255,255,255,0.08); }
        .term-head-inner{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .term-word{ font-family:'Sora',sans-serif; font-weight:800; font-size:22px; color:#fff; }
        .term-nav{ display:flex; align-items:center; gap:28px; margin-left:auto; }
        .term-nav ul{ display:flex; gap:28px; list-style:none; margin:0; padding:0; }
        .term-nav a{ color:#B9B7C7; text-decoration:none; font-size:14.5px; font-weight:500; padding-bottom:4px; border-bottom:2px solid transparent; transition:color 0.2s ease, border-color 0.2s ease; }
        .term-nav a.active{ color:#fff; border-bottom-color:#E61A97; }
        .term-nav a:hover{ color:#fff; }
        @media (max-width:800px){
          .term-word{ display:none; }
          .term-head-inner{ flex-wrap:nowrap; gap:8px; }
          .term-nav{ gap:8px; flex-wrap:nowrap; overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none; }
          .term-nav::-webkit-scrollbar{ display:none; }
          .term-nav ul{ display:none; }
          .term-lang-toggle{ flex-shrink:0; }
          .term-pill{ flex-shrink:0; padding:8px 12px; font-size:12px; white-space:nowrap; }
          .term-pill.ghost{ padding:8px 4px; font-size:12px; }
        }
        .term-pill{ color:#fff; background:linear-gradient(120deg,#7E1CF1,#E61A97); border:none; padding:10px 20px; border-radius:100px; font-size:14px; font-weight:600; cursor:pointer; transition:filter 0.2s ease, transform 0.2s ease; }
        .term-pill:hover{ filter:brightness(1.1); transform:translateY(-1px); }
        .term-pill.ghost{ background:none; border:1.5px solid rgba(255,255,255,0.45); color:#fff; padding:9px 18px; font-weight:700; }
        .term-pill.ghost:hover{ background:rgba(255,255,255,0.1); border-color:#fff; }
        .term-lang-toggle{ display:flex; background:rgba(255,255,255,0.08); border-radius:100px; padding:3px; gap:2px; }
        .term-lang-toggle button{ border:none; background:none; color:#B9B7C7; font-size:12px; font-weight:700; padding:6px 12px; border-radius:100px; cursor:pointer; font-family:'Sora',sans-serif; }
        .term-lang-toggle button.active{ background:#fff; color:var(--term-ink); }
        .term-hero{ background:var(--term-ink); position:relative; overflow:hidden; padding:80px 0 100px; min-height:92vh; display:flex; align-items:center; }
        .term-hero::before{ content:''; position:absolute; inset:-20%; z-index:0;
          background:
            radial-gradient(circle at 15% 20%, rgba(126,28,241,0.35) 0%, transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(2,198,250,0.28) 0%, transparent 45%),
            radial-gradient(circle at 70% 80%, rgba(230,26,151,0.3) 0%, transparent 45%);
          animation:termMeshDrift 18s ease-in-out infinite alternate;
          filter:blur(10px);
        }
        @keyframes termMeshDrift{
          0%{ transform:translate(0,0) scale(1) rotate(0deg); }
          50%{ transform:translate(-3%,2%) scale(1.08) rotate(4deg); }
          100%{ transform:translate(2%,-3%) scale(1.02) rotate(-3deg); }
        }
        .term-hero-orb{ position:absolute; border-radius:50%; filter:blur(50px); z-index:0; pointer-events:none; opacity:0.7; }
        .term-hero-orb.o1{ width:300px; height:300px; top:8%; left:4%; background:#7E1CF1; animation:termOrbFloat 7s ease-in-out infinite; }
        .term-hero-orb.o2{ width:240px; height:240px; bottom:10%; right:8%; background:#02C6FA; animation:termOrbFloat 8.5s ease-in-out infinite reverse; }
        .term-hero-orb.o3{ width:200px; height:200px; top:45%; right:28%; background:#E61A97; animation:termOrbFloat 10s ease-in-out infinite; animation-delay:-4s; }
        @keyframes termOrbFloat{
          0%,100%{ transform:translate(0,0) scale(1); }
          50%{ transform:translate(42px,-52px) scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce){
          .term-hero::before, .term-hero-orb{ animation:none; }
        }
        .term-hero-grid{ display:grid; grid-template-columns:1.1fr 0.9fr; gap:40px; align-items:center; width:100%; position:relative; z-index:1; }
        @media (max-width:900px){ .term-hero-grid{ grid-template-columns:1fr; } }
        .term-hero-title{ color:#fff; font-weight:700; font-size:clamp(36px,5.2vw,64px); line-height:1.05; letter-spacing:-0.01em; max-width:16ch; position:relative; z-index:1; }
        .term-hero-sub{ color:#B9B7C7; font-size:17px; line-height:1.6; max-width:46ch; margin-top:26px; position:relative; z-index:1; }
        .term-btn-primary{ background:linear-gradient(120deg,#7E1CF1,#E61A97); color:#fff; padding:14px 26px; border-radius:100px; font-weight:600; font-size:15px; border:none; cursor:pointer; transition:transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease; box-shadow:0 10px 30px -10px rgba(126,28,241,0.5); }
        .term-btn-flash{ position:relative; overflow:hidden; animation:termBtnGlow 2.6s ease-in-out infinite; }
        .term-btn-flash::after{ content:''; position:absolute; top:0; left:-60%; width:40%; height:100%; background:linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent); transform:skewX(-20deg); animation:termBtnSweep 3.2s ease-in-out infinite; }
        @keyframes termBtnSweep{ 0%{ left:-60%; } 35%{ left:130%; } 100%{ left:130%; } }
        @keyframes termBtnGlow{ 0%,100%{ box-shadow:0 10px 30px -10px rgba(126,28,241,0.5); } 50%{ box-shadow:0 14px 42px -8px rgba(230,26,151,0.65); } }
        @media (prefers-reduced-motion: reduce){ .term-btn-flash{ animation:none; } .term-btn-flash::after{ display:none; } }
        .term-btn-primary:hover{ transform:translateY(-2px); box-shadow:0 16px 36px -10px rgba(230,26,151,0.55); }
        .term-btn-primary:active{ transform:translateY(0) scale(0.97); }
        .term-btn-ghost{ color:#fff; background:none; border:none; padding:14px 10px; font-weight:600; font-size:15px; border-bottom:1px solid rgba(255,255,255,0.4); cursor:pointer; }
        .term-hero-visual{ position:relative; min-height:340px; display:flex; align-items:center; justify-content:center; z-index:1; }
        .term-hero-visual::before{ content:''; position:absolute; inset:6% 4%; border-radius:28px;
          background:linear-gradient(135deg,#7E1CF1 0%,#E61A97 50%,#02C6FA 100%);
          opacity:0.22; filter:blur(2px);
        }
        .term-hero-card{ position:relative; z-index:1; background:rgba(20,22,32,0.75); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.12); border-radius:18px;
          padding:28px 30px; width:min(320px,80%); height:236px; display:flex; flex-direction:column; justify-content:flex-start;
          box-shadow:0 30px 70px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
          font-family:'Fraunces',serif; cursor:pointer; user-select:none;
          animation:termCardGlow 4s ease-in-out infinite;
        }
        @keyframes termCardGlow{
          0%,100%{ box-shadow:0 30px 70px -20px rgba(0,0,0,0.6), 0 0 40px -12px rgba(126,28,241,0.35); }
          50%{ box-shadow:0 30px 70px -20px rgba(0,0,0,0.6), 0 0 55px -10px rgba(2,198,250,0.4); }
        }
        @media (prefers-reduced-motion: reduce){ .term-hero-card{ animation:none; } }
        .term-hero-card .score{ font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#B9B7C7; margin-bottom:14px; font-family:'Sora',sans-serif; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; min-height:28px; }
        .term-hero-card .score .cat-line{ flex:1; line-height:1.4; }
        .term-hero-card .score .tap-hint{ font-size:9px; font-weight:700; letter-spacing:0.03em; color:#7E1CF1; text-transform:none; white-space:nowrap; flex-shrink:0; }
        .term-hero-card .num{ font-family:'Sora',sans-serif; font-weight:800; font-size:34px; font-variant-numeric:tabular-nums; background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .term-hero-card .max{ font-family:'Sora',sans-serif; font-weight:600; font-size:14px; color:#8A87A8; }
        .term-hero-card p{ font-family:'Inter',sans-serif; text-align:left; font-size:12.5px; line-height:1.5; color:#B9B7C7; margin-top:14px; }
        .term-hero-card-back{ position:absolute; z-index:0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:18px; width:min(280px,72%); height:200px; transform:rotate(-6deg) translate(-30px,26px); }
        .term-section-cta{ margin-top:32px; text-align:left; }
        .term-section-cta button{ background:none; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; color:var(--term-ink); border-bottom:2px solid #7E1CF1; padding-bottom:2px; cursor:pointer; }
        .term-pillars{ padding:88px 0 72px; }
        .term-pillars-note{ font-size:13px; color:var(--term-ink-soft); margin-bottom:56px; }
        .term-pillars-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; padding:20px 0 40px; }
        @media (max-width:900px){ .term-pillars-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-pillar{ position:relative; border-radius:14px; padding:26px 22px; min-height:190px;
          display:flex; flex-direction:column; justify-content:space-between; background:#fff;
          border:1px solid var(--term-line); border-top:3px solid transparent;
          transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .term-pillar:hover, .term-pillar:active{ transform:translateY(-8px); box-shadow:0 20px 40px -18px rgba(11,14,20,0.22); }
        .term-pillar:nth-child(1){ border-top-color:#7E1CF1; } .term-pillar:nth-child(1) .n{ color:#7E1CF1; }
        .term-pillar:nth-child(2){ border-top-color:#E61A97; } .term-pillar:nth-child(2) .n{ color:#E61A97; }
        .term-pillar:nth-child(3){ border-top-color:#02C6FA; } .term-pillar:nth-child(3) .n{ color:#02C6FA; }
        .term-pillar:nth-child(4){ border-top-color:#3ADB76; } .term-pillar:nth-child(4) .n{ color:#3ADB76; }
        .term-pillar:nth-child(5){ border-top-color:#F0C55E; } .term-pillar:nth-child(5) .n{ color:#F0C55E; }
        .term-pillar .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:30px; }
        .term-pillar .t{ font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin-top:20px; color:var(--term-ink); }
        .term-pillar .d{ font-size:12.5px; line-height:1.5; margin-top:8px; opacity:0.75; color:var(--term-ink-soft); }
        .term-pillar .pts{ font-family:'Sora',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:0.04em; opacity:0.5; margin-top:10px; }
        .term-compare{ padding:20px 0 72px; }
        .term-compare-grid{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:32px; position:relative; }
        @media (max-width:800px){ .term-compare-grid{ grid-template-columns:1fr; } }
        .term-compare-vs{ position:absolute; top:50%; left:50%; margin:-23px 0 0 -23px; width:46px; height:46px; border-radius:50%; background:var(--term-ink); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; font-weight:800; font-size:12px; letter-spacing:0.02em; z-index:2; box-shadow:0 10px 24px rgba(11,14,20,0.28); border:3px solid #fff; }
        .term-compare-col{ border-radius:14px; padding:30px 26px; background:var(--term-grey); border:1px solid var(--term-line); transition:transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease; }
        .term-compare-col.is{ border-top:3px solid #3ADB76; transform:rotate(-0.6deg); }
        .term-compare-col.isnot{ border-top:3px solid var(--term-line); opacity:0.92; transform:rotate(0.6deg); }
        .term-compare-col:hover{ transform:translateY(-6px) rotate(0deg); box-shadow:0 20px 40px -18px rgba(11,14,20,0.22); }
        .term-compare-badge{ display:inline-block; font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.03em; padding:5px 12px; border-radius:100px; margin-bottom:18px; }
        .term-compare-col.is .term-compare-badge{ background:#DFF6E7; color:#1E8449; }
        .term-compare-col.isnot .term-compare-badge{ background:var(--term-line); color:var(--term-ink-soft); }
        .term-compare-item{ margin-bottom:18px; }
        .term-compare-item:last-child{ margin-bottom:0; }
        .term-compare-item h5{ font-size:14.5px; font-weight:700; margin-bottom:4px; }
        .term-compare-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-history{ padding:72px 0; background:var(--term-grey); position:relative; overflow:hidden; }
        .term-history::before{ content:''; position:absolute; top:-80px; right:-100px; width:360px; height:360px; border-radius:50%; background:radial-gradient(circle,rgba(126,28,241,0.08),transparent 70%); pointer-events:none; }
        .term-history-grid{ display:grid; grid-template-columns:1.3fr 1fr; gap:44px; align-items:start; margin-top:32px; }
        @media (max-width:800px){ .term-history-grid{ grid-template-columns:1fr; } }
        .term-history-text p{ font-size:14px; line-height:1.7; color:var(--term-ink-soft); margin-bottom:16px; }
        .term-history-visual{ position:relative; border-radius:8px; overflow:hidden; min-height:280px; display:flex; align-items:flex-end; transition:transform 0.4s cubic-bezier(.2,.8,.2,1); background:linear-gradient(135deg,#7E1CF1 0%,#E61A97 55%,#02C6FA 100%); }
        .term-history-visual:hover{ transform:translateY(-6px); }
        .term-history-visual .overlay{ position:absolute; inset:0; background:linear-gradient(180deg,rgba(11,14,20,0.1) 0%,rgba(11,14,20,0.88) 100%); }
        .term-history-visual .content{ position:relative; z-index:1; padding:26px; display:flex; gap:24px; width:100%; }
        .term-history-stat .y{ font-family:'Fraunces',serif; font-weight:600; font-size:30px; color:#fff; }
        .term-history-stat .l{ font-family:'Sora',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:0.04em; text-transform:uppercase; color:rgba(255,255,255,0.7); margin-top:4px; }
        .term-values{ padding:72px 0; }
        .term-values-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:40px; }
        @media (max-width:800px){ .term-values-grid{ grid-template-columns:1fr 1fr; } }
        .term-values-grid > div{ border-radius:14px; padding:24px 20px; background:#fff; border:1px solid var(--term-line); border-top:3px solid transparent; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease; }
        .term-values-grid > div:nth-child(even){ margin-top:26px; }
        @media (max-width:800px){ .term-values-grid > div:nth-child(even){ margin-top:0; } }
        .term-values-grid > div:nth-child(1){ border-top-color:#02C6FA; }
        .term-values-grid > div:nth-child(2){ border-top-color:#7E1CF1; }
        .term-values-grid > div:nth-child(3){ border-top-color:#E61A97; }
        .term-values-grid > div:nth-child(4){ border-top-color:#3ADB76; }
        .term-values-grid > div:nth-child(1) .n{ color:#02C6FA; }
        .term-values-grid > div:nth-child(2) .n{ color:#7E1CF1; }
        .term-values-grid > div:nth-child(3) .n{ color:#E61A97; }
        .term-values-grid > div:nth-child(4) .n{ color:#3ADB76; }
        .term-values-grid > div:hover{ transform:translateY(-8px); box-shadow:0 22px 44px -20px rgba(11,14,20,0.18); }
        .term-values-grid .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:16px; color:#7E1CF1; margin-bottom:12px; position:relative; z-index:1; }
        .term-values-grid h4{ font-family:'Fraunces',serif; font-size:16px; font-weight:600; margin-bottom:6px; position:relative; z-index:1; }
        .term-values-grid p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; position:relative; z-index:1; }
        .term-examples{ padding:0 0 56px; }
        .term-examples-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width:800px){ .term-examples-grid{ grid-template-columns:1fr; } }
        .term-example-card{ background:var(--term-ink); border-radius:12px; padding:26px 22px 22px; color:#fff; position:relative; text-align:center; overflow:hidden; box-shadow:0 20px 46px -22px rgba(11,14,20,0.5); }
        .term-example-card::before{ content:''; position:absolute; inset:0; border-radius:12px; padding:1px; background:linear-gradient(155deg,rgba(240,197,94,0.7),rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,rgba(126,28,241,0.5)); -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
        .term-example-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; position:relative; z-index:1; }
        .term-example-top .cat{ font-family:'Sora',sans-serif; font-weight:700; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); }
        .term-example-top .status{ font-size:9px; font-weight:700; padding:3px 9px; border-radius:100px; text-transform:uppercase; letter-spacing:0.02em; }
        .term-example-top .status.certified{ background:rgba(58,219,118,0.15); color:#3ADB76; }
        .term-example-top .status.review{ background:rgba(240,197,94,0.15); color:#F0C55E; }
        .term-example-top .status.audit{ background:rgba(230,106,106,0.15); color:#E86A6A; }
        .term-example-card .id{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; color:rgba(255,255,255,0.35); margin-bottom:14px; position:relative; z-index:1; letter-spacing:0.04em; }
        .term-example-card .center-score{ position:relative; z-index:1; margin-bottom:16px; }
        .term-example-card .center-score .num{ font-family:'Fraunces',serif; font-weight:700; font-size:46px; line-height:1; background:linear-gradient(90deg,#F0C55E,#E61A97,#7E1CF1); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .term-example-card .center-score .max{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; color:rgba(255,255,255,0.35); letter-spacing:0.05em; }
        .term-example-card .score-row{ display:flex; align-items:center; position:relative; z-index:1; }
        .term-example-card .bar{ flex:1; height:4px; background:rgba(255,255,255,0.1); border-radius:100px; overflow:hidden; }
        .term-example-card .bar .fill{ height:100%; border-radius:100px; }
        .term-score-hero{ padding:8px 0 56px; }
        .term-score-hero-inner{ background:var(--term-ink); border-radius:10px; padding:48px 44px; display:flex; align-items:center; gap:48px; flex-wrap:wrap; }
        .term-score-hero-num{ display:flex; align-items:baseline; flex-shrink:0; }
        .term-score-hero-num .big{ font-family:'Fraunces',serif; font-weight:600; font-size:clamp(72px,11vw,140px); line-height:1; font-variant-numeric:tabular-nums; background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .term-score-hero-num .max{ font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(20px,2.4vw,30px); color:#565B6B; margin-left:6px; }
        .term-score-hero-text{ flex:1; min-width:260px; }
        .term-gradient-text{ background:linear-gradient(90deg,#7E1CF1,#E61A97,#02C6FA); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .term-score-hero-text .term-eyebrow{ color:#8A87A8; }
        .term-score-hero-text h2{ color:#fff; font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(22px,2.6vw,30px); margin:8px 0 12px; max-width:20ch; }
        .term-score-hero-text p{ color:#B9B7C7; font-size:14px; line-height:1.6; max-width:44ch; }
        .term-badges{ padding:32px 0; border-bottom:1px solid var(--term-line); }
        .term-badges-row{ display:flex; gap:14px; flex-wrap:wrap; justify-content:center; }
        .term-badge{ display:flex; align-items:center; gap:9px; background:var(--term-grey); border-radius:100px; padding:9px 18px 9px 9px; font-size:12.5px; font-weight:600; color:var(--term-ink-soft); transition:transform 0.3s cubic-bezier(.22,1,.36,1), background 0.3s ease, box-shadow 0.3s ease; }
        .term-badge:hover{ transform:translateY(-4px) scale(1.03); background:#fff; box-shadow:0 12px 26px rgba(11,14,20,0.12); }
        .term-badge .ico{ width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:transform 0.3s cubic-bezier(.22,1,.36,1); }
        .term-badge:hover .ico{ transform:scale(1.12) rotate(-6deg); }
        .term-badge svg{ width:14px; height:14px; flex-shrink:0; }
        .term-badge:nth-child(1) .ico{ background:#F1E7FB; } .term-badge:nth-child(1) svg{ color:#7E1CF1; }
        .term-badge:nth-child(2) .ico{ background:#FCE7F1; } .term-badge:nth-child(2) svg{ color:#E61A97; }
        .term-badge:nth-child(3) .ico{ background:#E2F8FC; } .term-badge:nth-child(3) svg{ color:#02C6FA; }
        .term-network{ padding:72px 0; }
        .term-network-split{ display:grid; grid-template-columns:0.75fr 1.6fr; gap:40px; align-items:start; }
        @media (max-width:900px){ .term-network-split{ grid-template-columns:1fr; } }
        .term-network-heading{ position:sticky; top:100px; }
        @media (max-width:900px){ .term-network-heading{ position:static; } }
        .term-network-heading h2{ max-width:11ch; }
        .term-network-lede{ font-size:16px; line-height:1.6; margin-top:14px; max-width:26ch; color:var(--term-ink-soft); }
        .term-network-legend{ display:flex; flex-direction:column; gap:10px; margin-top:26px; }
        .term-network-legend div{ display:flex; align-items:center; gap:10px; font-family:'Sora',sans-serif; font-weight:700; font-size:12.5px; color:var(--term-ink); }
        .term-network-legend .dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .term-network-grid{ display:grid; grid-template-columns:1fr; gap:14px; }
        @media (min-width:901px){ .term-network-grid{ margin-top:0; } }
        .term-network-card{ background:var(--term-grey); border-radius:12px; padding:28px 24px; border-top:3px solid transparent; transition:transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease; position:relative; overflow:hidden; }
        .term-network-card::after{ content:''; position:absolute; width:110px; height:110px; border-radius:50%; bottom:-50px; right:-40px; pointer-events:none; opacity:0.5; }
        .term-network-card:nth-child(1){ border-top-color:#3ADB76; transform:rotate(-0.7deg); }
        .term-network-card:nth-child(1)::after{ background:radial-gradient(circle,rgba(58,219,118,0.16),transparent 70%); }
        .term-network-card:nth-child(2){ border-top-color:#7E1CF1; transform:rotate(0.5deg); }
        .term-network-card:nth-child(2)::after{ background:radial-gradient(circle,rgba(126,28,241,0.14),transparent 70%); }
        .term-network-card:nth-child(3){ border-top-color:#E61A97; transform:rotate(-0.4deg); }
        .term-network-card:nth-child(3)::after{ background:radial-gradient(circle,rgba(230,26,151,0.14),transparent 70%); }
        .term-network-card:hover{ transform:translateY(-8px) scale(1.02) rotate(0deg); box-shadow:0 22px 44px -16px rgba(11,14,20,0.2); }
        .term-network-card .n{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:28px; margin-bottom:14px; position:relative; z-index:1; }
        .term-network-card h4{ font-family:'Fraunces',serif; font-size:17px; font-weight:600; margin-bottom:4px; position:relative; z-index:1; }
        .term-network-card .who{ font-size:11px; font-weight:600; color:#8A87A8; text-transform:uppercase; letter-spacing:0.02em; margin-bottom:12px; position:relative; z-index:1; }
        .term-network-card p{ font-size:13px; line-height:1.6; color:var(--term-ink-soft); position:relative; z-index:1; }
        .term-network-cta{ position:relative; z-index:1; display:inline-block; background:none; border:none; font-family:'Sora',sans-serif; font-weight:700; font-size:12.5px; padding:0; margin-top:16px; cursor:pointer; border-bottom:1.5px solid currentColor; padding-bottom:2px; }
        .term-registry-intro{ max-width:64ch; margin:16px 0 32px; display:flex; flex-direction:column; gap:12px; padding:22px 26px; border-radius:8px; background:linear-gradient(135deg, rgba(126,28,241,0.06), rgba(230,26,151,0.04)); border-left:3px solid #7E1CF1; }
        .term-registry-intro p{ font-size:14px; line-height:1.65; color:var(--term-ink-soft); }
        .term-independence{ padding:56px 0; background:var(--term-grey); }
        .term-independence-stat{ display:flex; align-items:center; gap:20px; margin:24px 0 32px; padding:22px 26px; background:#fff; border-radius:12px; border-left:4px solid #7E1CF1; }
        @media (max-width:600px){ .term-independence-stat{ flex-direction:column; align-items:flex-start; gap:10px; } }
        .term-independence-stat .big{ font-family:'Fraunces',serif; font-weight:700; font-size:clamp(48px,6vw,64px); line-height:1; background:linear-gradient(90deg,#7E1CF1,#E61A97); -webkit-background-clip:text; background-clip:text; color:transparent; flex-shrink:0; }
        .term-independence-stat .label{ font-size:14px; line-height:1.5; color:var(--term-ink-soft); max-width:32ch; }
        .term-independence-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:0; }
        @media (max-width:800px){ .term-independence-grid{ grid-template-columns:1fr; } }
        .term-independence-card{ background:#fff; border-radius:8px; padding:26px 24px; border-left:3px solid transparent; box-shadow:0 4px 16px rgba(0,0,0,0.04); transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-independence-card:nth-child(1){ border-left-color:#7E1CF1; }
        .term-independence-card:nth-child(2){ border-left-color:#E61A97; }
        .term-independence-card:hover{ transform:translateY(-5px); }
        .term-independence-card h4{ font-family:'Fraunces',serif; font-weight:600; font-size:16px; margin-bottom:10px; }
        .term-independence-card p{ font-size:13px; line-height:1.6; color:var(--term-ink-soft); }
        .term-security{ padding:56px 0 72px; }
        .term-security-grid{ display:flex; flex-direction:column; gap:2px; margin-top:28px; border-radius:8px; overflow:hidden; }
        .term-security-item{ display:flex; align-items:center; gap:14px; background:var(--term-grey); padding:18px 22px; font-size:14px; font-weight:500; transition:background 0.25s ease, padding-left 0.25s ease; }
        .term-sec-ico{ width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; }
        .term-sec-ico.ico1{ background:#1E9950; }
        .term-sec-ico.ico2{ background:#7E1CF1; }
        .term-sec-ico.ico3{ background:#0296C9; }
        .term-security-item:hover{ background:#E4F9EC; padding-left:28px; }
        .term-security-item svg{ color:#3ADB76; flex-shrink:0; }
        .term-milestone{ padding:64px 0; background:var(--term-grey); position:relative; overflow:hidden; }
        .term-milestone::before{ content:''; position:absolute; bottom:-120px; left:-80px; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(2,198,250,0.07),transparent 70%); pointer-events:none; }
        .term-milestone-h2{ font-weight:700; font-size:clamp(24px,3vw,34px); margin:8px 0 14px; max-width:16ch; }
        .term-milestone-intro{ font-size:14.5px; line-height:1.7; color:var(--term-ink-soft); max-width:64ch; margin-bottom:40px; }
        .term-timeline{ display:flex; align-items:flex-start; gap:8px; margin-bottom:36px; position:relative; }
        @media (max-width:800px){ .term-timeline{ flex-direction:column; } }
        .term-timeline-line{ position:absolute; top:33px; left:8%; right:8%; height:2px; background:linear-gradient(90deg,#3ADB76,#F0C55E,#8A87A8); opacity:0.35; transform-origin:left; transform:scaleX(0); transition:transform 1.1s cubic-bezier(.2,.8,.2,1); z-index:0; }
        .term-timeline.visible .term-timeline-line{ transform:scaleX(1); }
        @media (max-width:800px){ .term-timeline-line{ display:none; } }
        .term-timeline-step{ flex:1; background:#fff; border-radius:8px; padding:22px 20px; position:relative; z-index:1; border-top:3px solid transparent; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease; }
        .term-timeline-step:hover{ transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,0.08); }
        .term-timeline-step:nth-child(2){ border-top-color:#3ADB76; }
        .term-timeline-step:nth-child(4){ border-top-color:#F0C55E; }
        .term-timeline-step:nth-child(6){ border-top-color:#8A87A8; }
        .term-timeline-arrow{ display:flex; align-items:center; justify-content:center; color:#7E1CF1; font-size:22px; font-weight:700; padding-top:20px; }
        @media (max-width:800px){ .term-timeline-arrow{ transform:rotate(90deg); padding:0; align-self:center; } }
        .term-timeline-step .dot{ width:14px; height:14px; border-radius:50%; margin-bottom:14px; }
        .term-timeline-step .dot.green{ background:#3ADB76; box-shadow:0 0 0 5px rgba(58,219,118,0.15); animation:termPulse 2.6s ease-in-out infinite; }
        @keyframes termPulse{ 0%,100%{ box-shadow:0 0 0 5px rgba(58,219,118,0.15); } 50%{ box-shadow:0 0 0 9px rgba(58,219,118,0.06); } }
        .term-timeline-step .dot.amber{ background:#F0C55E; box-shadow:0 0 0 5px rgba(240,197,94,0.18); }
        .term-timeline-step .dot.grey{ background:#8A87A8; box-shadow:0 0 0 5px rgba(138,135,168,0.15); }
        .term-timeline-step .tl-label{ font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; margin-bottom:6px; }
        .term-timeline-step .tl-desc{ font-size:12.5px; line-height:1.55; color:var(--term-ink-soft); }
        .term-milestone-examples{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        @media (max-width:700px){ .term-milestone-examples{ grid-template-columns:1fr; } }
        .term-milestone-point{ display:flex; align-items:flex-start; gap:14px; background:#fff; border-radius:6px; padding:16px 18px; transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .term-milestone-point:hover{ transform:translateY(-4px); box-shadow:0 12px 24px rgba(0,0,0,0.07); }
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
        .term-founder-banner{ background:linear-gradient(120deg,#7E1CF1,#B5308E 55%,#E61A97); border-radius:100px; padding:14px 14px 14px 26px; display:inline-flex; align-items:center; justify-content:center; gap:18px; flex-wrap:nowrap; cursor:pointer; transition:transform 0.35s cubic-bezier(.2,.8,.2,1), box-shadow 0.35s ease; max-width:100%; }
        .term-founder-banner-wrap{ display:flex; justify-content:center; }
        .term-founder-banner:hover{ transform:translateY(-3px); box-shadow:0 20px 44px -18px rgba(126,28,241,0.45); }
        .term-founder-banner .txt{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
        .term-founder-banner .txt .v{ font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:#fff; white-space:nowrap; }
        .term-founder-banner .txt .l{ font-family:'Sora',sans-serif; font-weight:600; font-size:12px; color:rgba(255,255,255,0.8); white-space:nowrap; }
        .term-founder-banner .arrow{ flex-shrink:0; width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; transition:transform 0.3s ease, background 0.3s ease; }
        .term-founder-banner:hover .arrow{ transform:translateX(4px); background:#fff; color:#7E1CF1; }
        @media (max-width:600px){
          .term-founder-banner{ padding:14px 14px 14px 20px; gap:12px; }
          .term-founder-banner .txt{ flex-direction:column; gap:2px; align-items:flex-start; }
        }
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
        .term-eyebrow{ font-family:'Fraunces',serif; font-style:italic; font-weight:500; font-size:15px; letter-spacing:0.01em; text-transform:none; margin-bottom:10px;
          background:linear-gradient(90deg,#7A2062 0%,#B5308E 25%,#7A2062 50%,#B5308E 75%,#7A2062 100%);
          background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent;
          animation:termEyebrowShine 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce){ .term-eyebrow{ animation:none; color:#7A2062; } }
        @keyframes termEyebrowShine{ to{ background-position:-200% center; } }
        .term-validation{ padding:56px 0 72px; }
        .term-validation-sub{ font-size:14px; color:var(--term-ink-soft); max-width:56ch; margin:8px 0 32px; }
        .term-validation-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; position:relative; }
        @media (max-width:800px){ .term-validation-grid{ grid-template-columns:1fr 1fr; } }
        .term-validation-step{ background:var(--term-grey); border-radius:8px; padding:22px 20px; border-top:3px solid transparent; transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease; position:relative; }
        .term-validation-step:not(:last-child)::after{ content:'→'; position:absolute; top:22px; right:-19px; font-family:'Sora',sans-serif; font-weight:800; font-size:16px; color:var(--term-line); z-index:1; }
        @media (max-width:800px){ .term-validation-step:not(:last-child)::after{ display:none; } }
        .term-validation-step:nth-child(1){ border-top-color:#7E1CF1; }
        .term-validation-step:nth-child(2){ border-top-color:#E61A97; }
        .term-validation-step:nth-child(3){ border-top-color:#02C6FA; }
        .term-validation-step:nth-child(4){ border-top-color:#3ADB76; }
        .term-validation-step:hover{ transform:translateY(-5px); box-shadow:0 16px 34px -16px rgba(11,14,20,0.25); }
        .term-validation-step .num{ display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; font-family:'Sora',sans-serif; font-style:normal; font-weight:800; font-size:12.5px; color:#fff; }
        .term-validation-step:nth-child(1) .num{ background:#7E1CF1; }
        .term-validation-step:nth-child(2) .num{ background:#E61A97; }
        .term-validation-step:nth-child(3) .num{ background:#02C6FA; }
        .term-validation-step:nth-child(4) .num{ background:#3ADB76; }
        .term-validation-step h5{ font-family:'Sora',sans-serif; font-weight:700; font-size:14.5px; margin:10px 0 6px; }
        .term-validation-step p{ font-size:12.5px; color:var(--term-ink-soft); line-height:1.5; }
        .term-newera-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-top:36px; }
        @media (max-width:900px){ .term-newera-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-newera-card{ background:#fff; border-radius:12px; padding:28px 22px; border-top:3px solid var(--term-line); transition:transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease, border-color 0.4s ease; }
        .term-newera-card:nth-child(1){ border-top-color:#3ADB76; }
        .term-newera-card:nth-child(2){ border-top-color:#7E1CF1; }
        .term-newera-card:nth-child(3){ border-top-color:#E61A97; }
        .term-newera-card:nth-child(4){ border-top-color:#02C6FA; }
        .term-newera-card .n{ display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; font-family:'Sora',sans-serif; font-weight:800; font-size:11.5px; color:#fff; margin-bottom:16px; transition:transform 0.3s cubic-bezier(.22,1,.36,1); }
        .term-newera-card:nth-child(1) .n{ background:#3ADB76; } .term-newera-card:nth-child(2) .n{ background:#7E1CF1; }
        .term-newera-card:nth-child(3) .n{ background:#E61A97; } .term-newera-card:nth-child(4) .n{ background:#02C6FA; }
        .term-newera-card:hover .n{ transform:scale(1.15) rotate(-8deg); }
        .term-newera-card h4{ font-family:'Fraunces',serif; font-size:17px; font-weight:600; margin-bottom:8px; }
        .term-newera-card p{ font-size:13px; line-height:1.55; color:var(--term-ink-soft); }
        .term-why{ padding:72px 0; }
        .term-why-grid{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--term-line); margin-top:36px; }
        @media (max-width:800px){ .term-why-grid{ grid-template-columns:1fr; } }
        .term-why-item{ padding:28px 24px; border-right:1px solid var(--term-line); border-top:3px solid transparent; }
        .term-why-item:nth-child(1){ border-top-color:#E61A97; }
        .term-why-item:nth-child(2){ border-top-color:#7E1CF1; }
        .term-why-item:nth-child(3){ border-top-color:#02C6FA; }
        .term-why-item:last-child{ border-right:none; }
        .term-why-item .icon{ width:38px; height:38px; border-radius:10px; background:var(--term-grey); display:flex; align-items:center; justify-content:center; margin-bottom:16px; transition:transform 0.3s cubic-bezier(.22,1,.36,1); }
        .term-why-item:hover .icon{ transform:scale(1.12) rotate(-6deg); }
        .term-why-item .stat-row{ display:flex; align-items:baseline; gap:8px; margin-bottom:10px; }
        .term-why-item .stat{ font-family:'Fraunces',serif; font-weight:600; font-size:32px; line-height:1; }
        .term-why-item .stat-label{ font-family:'Sora',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:0.03em; text-transform:uppercase; color:var(--term-ink-soft); }
        .term-why-item h4{ font-family:'Fraunces',serif; font-size:16px; font-weight:600; margin-bottom:6px; }
        .term-why-item p{ font-size:13px; color:var(--term-ink-soft); line-height:1.55; }
        .term-registry{ padding:20px 0 72px; }
        .term-reg-scroll{ display:flex; gap:20px; overflow-x:auto; margin-top:28px; padding:20px 4px 10px; }
        .term-reg-card{ flex:0 0 240px; background:var(--term-ink); border-radius:10px; overflow:hidden; color:#fff; position:relative; box-shadow:0 20px 50px -22px rgba(11,14,20,0.5); }
        .term-reg-card::before{ content:''; position:absolute; inset:0; border-radius:10px; padding:1px; background:linear-gradient(155deg,rgba(240,197,94,0.7),rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,rgba(126,28,241,0.5)); -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; z-index:2; }
        .term-reg-art{ position:relative; aspect-ratio:16/11; overflow:hidden; transition:filter 0.4s ease; display:flex; align-items:center; justify-content:center; }
        .term-reg-card:hover .term-reg-art{ filter:saturate(1.25) brightness(1.05); }
        .term-reg-center-score{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:2px; }
        .term-reg-center-score .num{ font-family:'Fraunces',serif; font-weight:700; font-size:40px; line-height:1; color:#fff; background:linear-gradient(90deg,#F0C55E,#E61A97,#7E1CF1); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; filter:drop-shadow(0 2px 12px rgba(0,0,0,0.5)); }
        .term-reg-center-score .lbl{ font-family:'Sora',sans-serif; font-weight:700; font-size:9px; letter-spacing:0.15em; color:rgba(255,255,255,0.6); }
        .term-reg-tags{ position:absolute; top:10px; left:10px; display:flex; gap:5px; z-index:1; }
        .term-reg-tag{ font-size:9px; font-weight:700; padding:3px 7px; border-radius:5px; color:#fff; font-family:'Sora',sans-serif; text-transform:uppercase; backdrop-filter:blur(4px); }
        .term-reg-tag.status{ background:#02C6FA; color:#0B0E14; }
        .term-reg-seal{ position:absolute; top:8px; right:8px; width:34px; height:34px; border-radius:50%; z-index:1; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,#F0C55E,#E61A97 55%,#7E1CF1); box-shadow:0 6px 16px -4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5); }
        .term-reg-center-score{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; z-index:1; pointer-events:none; }
        .term-reg-center-score .num{ font-family:'Fraunces',serif; font-weight:700; font-size:42px; line-height:1; background:linear-gradient(90deg,#F0C55E,#E61A97,#7E1CF1); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; filter:drop-shadow(0 2px 14px rgba(0,0,0,0.6)); }
        .term-reg-center-score .lbl{ font-family:'Sora',sans-serif; font-weight:700; font-size:9px; letter-spacing:0.15em; color:rgba(255,255,255,0.65); }
        .term-reg-tag.status-certified{ background:#3ADB76; color:#0B0E14; }
        .term-reg-tag.status-review{ background:#F0C55E; color:#0B0E14; }
        .term-reg-tag.status-audit{ background:#E86A6A; color:#0B0E14; }
        .term-reg-seal svg{ width:16px; height:16px; color:#fff; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3)); }
        .term-reg-body{ padding:16px 16px 18px; position:relative; }
        .term-reg-title{ font-family:'Fraunces',serif; font-weight:600; font-size:16px; font-style:italic; margin-bottom:12px; letter-spacing:-0.01em; }
        .term-reg-bar-row{ margin-bottom:9px; }
        .term-reg-bar-row .lbl{ display:flex; justify-content:space-between; font-family:'Sora',sans-serif; font-size:9px; color:#8A87A8; font-weight:700; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.04em; }
        .term-reg-bar{ height:3px; background:rgba(255,255,255,0.1); border-radius:100px; overflow:hidden; }
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
        .term-join-field select{ width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--term-line); font-size:14px; font-family:'Inter',sans-serif; box-sizing:border-box; background:#fff; color:var(--term-ink); }
        .term-join-field select:focus{ outline:none; border-color:#7E1CF1; }
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
        .term-reveal{ opacity:0; transform:translateY(40px) scale(0.97); transition:opacity 0.85s ease, transform 0.85s cubic-bezier(.16,1,.3,1); }
        .term-reveal:nth-child(2){ transition-delay:0.08s; }
        .term-reveal:nth-child(3){ transition-delay:0.16s; }
        .term-reveal:nth-child(4){ transition-delay:0.24s; }
        .term-reveal:nth-child(5){ transition-delay:0.32s; }
        .term-reveal.visible{ filter:blur(0); }
        .term-reveal.visible{ opacity:1; transform:translateY(0) scale(1); }
        .term-newera-card{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.6s ease; }
        .term-newera-card:hover{ transform:translateY(-8px) scale(1.03); box-shadow:0 22px 44px rgba(126,28,241,0.12); border-top-color:#7E1CF1; }
        .term-why-item{ transition:background 0.25s ease; }
        .term-why-item:hover{ background:var(--term-grey); }
        .term-history-stat{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1); }
        .term-history-stat:hover{ transform:translateY(-6px); }
        .term-reg-card{ transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .term-reg-card:hover{ transform:translateY(-8px) scale(1.035); box-shadow:0 22px 44px rgba(0,0,0,0.3); }
        .term-price{ transition:transform 0.3s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease, opacity 0.6s ease; }
        .term-price:hover{ transform:translateY(-8px) scale(1.03); box-shadow:0 20px 40px rgba(126,28,241,0.14); }
        .term-btn-primary{ transition:background 0.25s ease, transform 0.2s ease; }
        .term-btn-primary:active{ transform:scale(0.97); }
        .term-modal-card{ animation:termModalIn 0.3s cubic-bezier(.2,.8,.2,1); }
        @keyframes termModalIn{ from{ opacity:0; transform:translateY(20px) scale(0.98); } to{ opacity:1; transform:translateY(0) scale(1); } }
        .term-free-banner{ padding:72px 0; background:var(--term-ink); position:relative; overflow:hidden; }
        .term-free-banner::before{ content:''; position:absolute; top:-40%; right:-10%; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(126,28,241,0.35),transparent 70%); pointer-events:none; }
        .term-free-banner .term-wrap{ position:relative; z-index:1; }
        .term-free-tag{ display:inline-block; font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.05em; text-transform:uppercase; color:#3ADB76; background:rgba(58,219,118,0.15); padding:6px 14px; border-radius:100px; margin-bottom:16px; }
        .term-free-banner h2{ color:#fff; font-size:clamp(24px,3.2vw,36px); max-width:22ch; margin-bottom:10px; }
        .term-free-intro{ color:#B9B7C7; font-size:14px; line-height:1.6; max-width:64ch; margin-bottom:36px; }
        .term-free-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
        @media (max-width:800px){ .term-free-grid{ grid-template-columns:1fr; } }
        .term-free-scenario{ background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:26px 24px; backdrop-filter:blur(6px); transition:transform 0.3s cubic-bezier(.2,.8,.2,1), background 0.3s ease; }
        .term-free-scenario:hover{ transform:translateY(-6px); background:rgba(255,255,255,0.1); }
        .term-free-scenario .badge{ display:inline-block; font-size:10.5px; font-weight:700; color:#3ADB76; background:rgba(58,219,118,0.15); padding:3px 10px; border-radius:100px; text-transform:uppercase; letter-spacing:0.02em; margin-bottom:14px; }
        .term-free-scenario .cat{ font-family:'Sora',sans-serif; font-weight:700; font-size:11px; letter-spacing:0.04em; text-transform:uppercase; color:#02C6FA; margin-bottom:4px; }
        .term-free-scenario h4{ font-family:'Fraunces',serif; font-weight:600; font-size:17px; margin-bottom:8px; color:#fff; }
        .term-free-scenario p{ font-size:13px; line-height:1.55; color:#B9B7C7; }
        .term-free-cta{ background:linear-gradient(120deg,#7E1CF1,#E61A97); color:#fff; border:none; padding:14px 26px; border-radius:100px; font-family:'Sora',sans-serif; font-weight:700; font-size:14px; cursor:pointer; transition:transform 0.25s ease, box-shadow 0.25s ease; }
        .term-free-cta:hover{ transform:translateY(-2px); box-shadow:0 14px 30px -10px rgba(126,28,241,0.5); }
        .term-photo-stats{ padding:64px 0; }
        .term-photo-stats-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width:800px){ .term-photo-stats-grid{ grid-template-columns:1fr; } }
        .term-photo-stat{ position:relative; height:320px; border-radius:8px; overflow:hidden; display:flex; align-items:flex-end; transition:transform 0.4s cubic-bezier(.2,.8,.2,1); }
        .term-photo-stat:hover{ transform:translateY(-6px); }
        .term-photo-stat .overlay{ position:absolute; inset:0; background:linear-gradient(180deg,rgba(11,14,20,0.15) 0%,rgba(11,14,20,0.85) 100%); }
        .term-photo-stat .content{ position:relative; z-index:1; padding:28px; }
        .term-photo-stat .num{ font-family:'Fraunces',serif; font-weight:600; font-size:48px; color:#fff; line-height:1; margin-bottom:8px; font-variant-numeric:tabular-nums; }
        .term-photo-stat .lbl{ font-family:'Sora',sans-serif; font-size:13px; color:rgba(255,255,255,0.75); text-transform:uppercase; letter-spacing:0.04em; font-weight:600; }
        .term-pricing{ padding:56px 0 72px; }
        .term-price-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:32px; }
        @media (max-width:900px){ .term-price-grid{ grid-template-columns:repeat(2,1fr); } }
        .term-price{ border-radius:20px; padding:26px 20px; min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .term-price.lav{ background:var(--term-lav); }
        .term-price.grey{ background:var(--term-grey); }
        .term-price.dark{ background:var(--term-ink); color:#fff; }
        .term-price .name{ font-family:'Fraunces',serif; font-weight:600; font-size:18px; }
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
        .term-model-card h4{ font-family:'Fraunces',serif; font-size:16px; font-weight:600; margin-bottom:8px; }
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
      <motion.div className="term-scroll-progress" style={{ scaleX: pageScrollProgress }} />
      <header className={`term-header ${headerScrolled ? 'is-scrolled' : ''}`}>
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
      <HeroSection t={t} setShowJoin={setShowJoin} />

      {/* EXEMPLE — bloc stats sur grandes photos, structure inspiree du Wix
          partage, mais dans notre identite (Fraunces, palette sobre, pas de
          degrade neon). A valider avant generalisation. */}
      <section className="term-photo-stats">
        <div className="term-wrap">
          <div className="term-photo-stats-grid">
            <ParallaxPhoto image="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800" className="term-photo-stat">
              <div className="overlay" />
              <div className="content">
                <div className="num"><CountUp to={20} suffix="+" /></div>
                <div className="lbl">{t("Ans d'expérience", 'Years of experience')}</div>
              </div>
            </ParallaxPhoto>
            <ParallaxPhoto image="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800" className="term-photo-stat">
              <div className="overlay" />
              <div className="content">
                <div className="num"><CountUp to={9} suffix="+" /></div>
                <div className="lbl">{t('Disciplines créatives', 'Creative disciplines')}</div>
              </div>
            </ParallaxPhoto>
            <ParallaxPhoto image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800" className="term-photo-stat">
              <div className="overlay" />
              <div className="content">
                <div className="num">1</div>
                <div className="lbl">{t('Standard commun à tout le secteur', 'Single standard for the whole sector')}</div>
              </div>
            </ParallaxPhoto>
          </div>
        </div>
      </section>

      {/* Pillars */}
      {/* Stats live + bandeau certificateurs — repris d'AboutView */}
      <section className="term-stats">
        <div className="term-wrap">
          <div className="term-founder-banner-wrap term-reveal">
          <div className="term-founder-banner" onClick={() => setShowJoin(true)}>
            <div className="txt">
              <span className="v">{t('Devenez fondateur', 'Become a founder')}</span>
              <span className="l">{t('150 premières places · accès immédiat →', 'First 150 spots · instant access →')}</span>
            </div>
            <div className="arrow">→</div>
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
          <motion.div
            className="term-pillars-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          >
            {pillars.map(p => (
              <motion.div
                key={p.n}
                className={`term-pillar ${p.bg}`}
                variants={{
                  hidden: { opacity: 0, y: 36, scale: 0.86, rotate: -3 },
                  show: { opacity: 1, y: 0, scale: 1, rotate: 0 },
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <div>
                  <div className="n">{p.n}</div>
                  <div className="t">{t(p.title.fr, p.title.en)}</div>
                </div>
                <div className="d">{t(p.desc.fr, p.desc.en)}</div>
              </motion.div>
            ))}
          </motion.div>
          <div className="term-section-cta"><button onClick={() => document.getElementById('registry')?.scrollIntoView({ behavior: 'smooth' })}>{t('Voir des exemples de scores réels →', 'See real score examples →')}</button></div>
        </div>
      </section>

      {/* Grand affichage du concept Score /1000 — juste apres les piliers, c'est LE concept */}
      <section className="term-score-hero">
        <div className="term-wrap">
          <div className="term-score-hero-inner">
            <div className="term-score-hero-num">
              <span className="big"><CountUp to={247} /></span><span className="max">/1000</span>
            </div>
            <div className="term-score-hero-text">
              <div className="term-eyebrow">{t('Le concept en un chiffre', 'The concept in one number')}</div>
              <h2>{t('Chaque œuvre a un Score ', 'Every work has a ')}<span className="term-gradient-text" style={{ textTransform: 'uppercase' }}>LYA</span>{t(' — sur 1000, toujours.', ' Score — out of 1000, always.')}</h2>
              <p>{t("Un seul standard, comparable d'une discipline à l'autre. 247, 580 ou 928 — le chiffre veut toujours dire la même chose.", 'One single standard, comparable across every discipline. 247, 580, or 928 — the number always means the same thing.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exemples concrets de score, sur 3 categories */}
      <section className="term-examples">
        <div className="term-wrap">
          <div className="term-examples-grid">
            {scoreExamples.map((ex, i) => (
              <motion.div
                key={ex.id}
                className="term-reg-card"
                initial={{ opacity: 0, y: 50, rotate: i === 0 ? -6 : i === 2 ? 6 : 0, scale: 0.88 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: 'spring', stiffness: 190, damping: 20, delay: i * 0.14 }}
                whileHover={{ y: -6 }}
              >
                <div className="term-reg-art" style={{ backgroundImage: `linear-gradient(to top, rgba(11,14,20,0.88) 0%, rgba(11,14,20,0.15) 55%), url(${ex.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="term-reg-tags">
                    <span className="term-reg-tag" style={{ background: ex.catColor }}>{t(ex.category.fr, ex.category.en).toUpperCase()}</span>
                    <span className={`term-reg-tag status-${ex.statusColor}`}>{t(ex.status.fr, ex.status.en).toUpperCase()}</span>
                  </div>
                  <div className="term-reg-seal"><Shield strokeWidth={2.5} /></div>
                  <div className="term-reg-center-score">
                    <span className="num">{ex.score}</span>
                    <span className="lbl">SCORE LYA / 1000</span>
                  </div>
                </div>
                <div className="term-reg-body">
                  <div className="term-reg-title">{ex.id}</div>
                  <div className="term-reg-bar-row">
                    <div className="lbl"><span>LYA Score</span><span>{ex.score}/1000</span></div>
                    <div className="term-reg-bar score"><div className="fill" style={{ width: `${ex.score / 10}%` }} /></div>
                  </div>
                </div>
              </motion.div>
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

          <div className="term-timeline term-reveal">
            <div className="term-timeline-line" />
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
          <motion.div
            className="term-validation-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              { num: '01', title: t("Vérification d'origine", 'Origin verification'), desc: t('Authenticité et traçabilité de la création.', 'Authenticity and traceability of the work.') },
              { num: '02', title: t('Analyse créative', 'Creative analysis'), desc: t('Originalité, qualité et potentiel artistique.', 'Originality, quality and artistic potential.') },
              { num: '03', title: t('Droits & conformité', 'Rights & compliance'), desc: t('Vérification des droits de propriété et licences.', 'Ownership rights and license verification.') },
              { num: '04', title: t('Validation finale', 'Final validation'), desc: t("Approbation définitive d'indexation LYA.", 'Final LYA indexation approval.') },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                className="term-validation-step"
                variants={{ hidden: { opacity: 0, x: -30 + i * 4, y: 20 }, show: { opacity: 1, x: 0, y: 0 } }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              >
                <span className="num">{s.num}</span><h5>{s.title}</h5><p>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px) ' }}>Pour l'excellence <span className="term-gradient-text">créative.</span></h2>
          <motion.div
            className="term-newera-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {newEra.map(c => (
              <motion.div
                key={c.n}
                className="term-newera-card"
                variants={{ hidden: { opacity: 0, y: 34, scale: 0.88 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ type: 'spring', stiffness: 250, damping: 19 }}
              >
                <div className="n">{c.n}</div>
                <h4>{t(c.title.fr, c.title.en)}</h4>
                <p>{t(c.desc.fr, c.desc.en)}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="term-section-cta"><button onClick={() => setShowJoin(true)}>{t('Rejoindre LYA et faire certifier mon projet →', 'Join LYA and get my project certified →')}</button></div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="term-compare">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Comparaison', 'Comparison')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce que ', 'What ')}<span className="term-gradient-text" style={{ textTransform: 'uppercase' }}>LYA</span>{t(" est — et n'est pas.", " is — and isn't.")}</h2>
          <motion.div
            className="term-compare-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div
              className="term-compare-vs"
              variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.25 }}
            >VS</motion.div>
            <motion.div
              className="term-compare-col is"
              variants={{ hidden: { opacity: 0, x: -50, rotate: -8 }, show: { opacity: 1, x: 0, rotate: -0.6 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -6, rotate: 0 }}
            >
              <span className="term-compare-badge">{t('CE QUE LYA EST', 'WHAT LYA IS')}</span>
              {comparison.is.map(item => (
                <div key={item.t.fr} className="term-compare-item"><h5>{t(item.t.fr, item.t.en)}</h5><p>{t(item.d.fr, item.d.en)}</p></div>
              ))}
            </motion.div>
            <motion.div
              className="term-compare-col isnot"
              variants={{ hidden: { opacity: 0, x: 50, rotate: 8 }, show: { opacity: 1, x: 0, rotate: 0.6 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -6, rotate: 0 }}
            >
              <span className="term-compare-badge">{t("CE QUE LYA N'EST PAS", "WHAT LYA ISN'T")}</span>
              {comparison.isNot.map(item => (
                <div key={item.t.fr} className="term-compare-item"><h5>{t(item.t.fr, item.t.en)}</h5><p>{t(item.d.fr, item.d.en)}</p></div>
              ))}
            </motion.div>
          </motion.div>
          <div className="term-section-cta"><button onClick={() => document.getElementById('registry')?.scrollIntoView({ behavior: 'smooth' })}>{t('Voir des exemples concrets →', 'See real examples →')}</button></div>
        </div>
      </section>

      {/* Histoire */}
      <section className="term-history">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Notre histoire', 'Our history')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)', maxWidth: '20ch' }}>{t("Vingt ans avant d'avoir ", 'Twenty years before it ')}<span className="term-gradient-text">{t('un nom pour ça.', 'had a name.')}</span></h2>
          <div className="term-history-grid">
            <motion.div
              className="term-history-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
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
            </motion.div>
            <ParallaxPhoto image="https://images.unsplash.com/photo-1481457443364-6b3a9819c3c8?auto=format&fit=crop&q=80&w=800" className="term-history-visual term-reveal">
              <div className="overlay" />
              <div className="content">
                <div className="term-history-stat"><div className="y">2006</div><div className="l">{t('Fondation', 'Foundation')}</div></div>
                <div className="term-history-stat"><div className="y">2026</div><div className="l">{t('Révolution', 'Revolution')}</div></div>
              </div>
            </ParallaxPhoto>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="term-values">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Nos valeurs', 'Our values')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Ce qui ne bouge pas, même quand tout évolue.', "What doesn't move, even as everything evolves.")}</h2>
          <div className="term-values-grid">
            {values.map((v, i) => (
              <motion.div
                key={v.n}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20, delay: i * 0.08 }}
              >
                <div className="n">{v.n}</div>
                <h4>{t(v.title.fr, v.title.en)}</h4>
                <p>{t(v.desc.fr, v.desc.en)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi LYA */}
      <section className="term-why">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Pourquoi LYA', 'Why LYA')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t("Une reconnaissance qui se construit, ", 'Recognition that is built, ')}<span className="term-gradient-text">{t("pas qui s'achète.", 'not bought.')}</span></h2>
          <div className="term-why-grid">
            {[
              { icon: Eye, stat: '0', statLabel: t('boîte noire', 'black box'), title: t('Transparent', 'Transparent'), desc: t('Cinq critères clairs, expliqués, jamais une boîte noire.', 'Five clear, explained criteria — never a black box.'), color: '#E61A97' },
              { icon: Users, stat: '3', statLabel: t('rôles, ensemble', 'roles, together'), title: t('Communautaire', 'Community-driven'), desc: t('Artistes, mécènes et professionnels avancent ensemble.', 'Artists, patrons and professionals move forward together.'), color: '#7E1CF1' },
              { icon: Percent, stat: '5%', statLabel: t('commission, point final', 'commission, full stop'), title: t('Indépendant', 'Independent'), desc: t('5% de commission sur le mécénat, rien de caché derrière.', '5% commission on patronage — nothing hidden behind it.'), color: '#02C6FA' },
            ].map((item) => (
              <div key={item.title} className="term-why-item">
                <div className="icon" style={{ color: item.color }}><item.icon size={20} strokeWidth={2.2} /></div>
                <div className="stat-row"><span className="stat" style={{ color: item.color }}>{item.stat}</span><span className="stat-label">{item.statLabel}</span></div>
                <h4>{item.title}</h4><p>{item.desc}</p>
              </div>
            ))}
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
              <motion.div
                key={r.title}
                className="term-reg-card"
                onClick={() => setSelected(i)}
                style={{ cursor: 'pointer' }}
                initial={{ opacity: 0, y: 60, rotate: i % 2 === 0 ? -6 : 6, scale: 0.88 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: 'spring', stiffness: 180, damping: 20, delay: i * 0.12 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <div className="term-reg-art" style={{ backgroundImage: `linear-gradient(to top, rgba(11,14,20,0.85) 0%, rgba(11,14,20,0.05) 55%), url(${r.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="term-reg-tags">
                    <span className="term-reg-tag" style={{ background: r.catColor }}>{t(r.cat.fr, r.cat.en).toUpperCase()}</span>
                    <span className="term-reg-tag status">CERTIFIED</span>
                  </div>
                  <div className="term-reg-seal"><Shield strokeWidth={2.5} /></div>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges certifies */}
      <section className="term-badges">
        <div className="term-wrap">
          <div className="term-badges-row">
            <div className="term-badge term-reveal"><span className="ico"><Shield /></span><span>{t('Conforme RGPD', 'GDPR compliant')}</span></div>
            <div className="term-badge term-reveal"><span className="ico"><Shield /></span><span>{t('Droits créatifs certifiés', 'Certified creative rights')}</span></div>
            <div className="term-badge term-reveal"><span className="ico"><Shield /></span><span>{t('Authentification multi-facteurs', 'Multi-factor authentication')}</span></div>
          </div>
        </div>
      </section>

      {/* Reseau : Createurs / Mecenes / Professionnels */}
      <section className="term-network">
        <div className="term-wrap">
          <div className="term-network-split">
            <div className="term-network-heading term-reveal">
              <div className="term-eyebrow">{t('Le réseau LYA', 'The LYA network')}</div>
              <p className="term-network-lede">
                <span className="term-gradient-text" style={{ fontWeight: 700 }}>{t('Trois rôles, un seul standard. ', 'Three roles, one single standard. ')}</span>
                {t('Chacun y trouve sa place — et parle le même langage : le Score LYA.', 'Everyone has a place here — and speaks the same language: the LYA Score.')}
              </p>
            </div>
            <div className="term-network-grid">
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#3ADB76' }}>01</div>
                <h4>{t('Créateurs', 'Creators')}</h4>
                <div className="who">{t('Artistes, musiciens, réalisateurs, designers, architectes, créateurs de jeux, auteurs, stylistes', 'Artists, musicians, directors, designers, architects, game creators, authors, fashion designers')}</div>
                <p>{t('Faites certifier et valoriser officiellement votre œuvre. Conservez le contrôle artistique total, recevez le soutien de mécènes dès le lancement.', 'Get your work officially certified and showcased. Keep full artistic control, and receive patron support from day one.')}</p>
                <button className="term-network-cta" style={{ color: '#1E8449' }} onClick={() => setShowJoin(true)}>{t('Faire certifier mon œuvre →', 'Get my work certified →')}</button>
              </div>
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#7E1CF1' }}>02</div>
                <h4>{t('Mécènes', 'Patrons')}</h4>
                <div className="who">{t('Mécènes particuliers, sponsors', 'Individual patrons, sponsors')}</div>
                <p>{t('Soutenez les œuvres dès 50€. Le Score LYA garantit la rigueur de sélection. Suivez vos œuvres soutenues en temps réel.', 'Support works from €50. The LYA Score guarantees selection rigor. Track your supported works in real time.')}</p>
                <button className="term-network-cta" style={{ color: '#7E1CF1' }} onClick={() => setShowJoin(true)}>{t('Devenir mécène →', 'Become a patron →')}</button>
              </div>
              <div className="term-network-card term-reveal">
                <div className="n" style={{ color: '#E61A97' }}>03</div>
                <h4>{t('Professionnels', 'Professionals')}</h4>
                <div className="who">{t('Curateurs, agents artistiques, conseillers — studios, sociétés de production et de divertissement, institutions culturelles (type CNC, BFI, Telefilm Canada), fonds de financement de la production', 'Curators, artistic agents, advisors — studios, production and entertainment companies, cultural institutions (e.g. CNC, BFI, Telefilm Canada), production financing funds')}</div>
                <p>{t("Rejoignez notre réseau d'experts en validation certifiés. Évaluez des œuvres dans votre domaine, réseau professionnel exclusif inter-secteurs.", 'Join our network of certified validation experts. Evaluate works in your field, exclusive cross-sector network.')}</p>
                <button className="term-network-cta" style={{ color: '#E61A97' }} onClick={() => setShowJoin(true)}>{t('Rejoindre le réseau →', 'Join the network →')}</button>
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
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Un score qui ne dépend de ', 'A score that depends on ')}<span className="term-gradient-text">{t('personne.', 'no one.')}</span></h2>
          <motion.div
            className="term-independence-stat"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <span className="big">0%</span>
            <span className="label">{t('des certificateurs LYA ne sont rémunérés par le projet qu’ils évaluent', 'of LYA certifiers are paid by the project they evaluate')}</span>
          </motion.div>
          <motion.div
            className="term-independence-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div
              className="term-independence-card"
              variants={{ hidden: { opacity: 0, y: 30, rotate: -2 }, show: { opacity: 1, y: 0, rotate: 0 } }}
              transition={{ type: 'spring', stiffness: 230, damping: 20 }}
            >
              <h4>{t('Indépendance des certificateurs', 'Certifier independence')}</h4>
              <p>{t("Les certificateurs LYA ne sont jamais rémunérés par le créateur ou le projet qu'ils évaluent. Leur évaluation n'est pas influencée par le succès du projet — c'est un engagement structurel, pas un argument marketing.", "LYA certifiers are never paid by the creator or project they evaluate. Their assessment is not influenced by the project's success — it's a structural commitment, not a marketing claim.")}</p>
            </motion.div>
            <motion.div
              className="term-independence-card"
              variants={{ hidden: { opacity: 0, y: 30, rotate: 2 }, show: { opacity: 1, y: 0, rotate: 0 } }}
              transition={{ type: 'spring', stiffness: 230, damping: 20 }}
            >
              <h4>{t('Pourquoi le nombre de certificateurs compte', 'Why the number of certifiers matters')}</h4>
              <p>{t("Un score porté par un seul évaluateur est une opinion. Un score porté par plusieurs certificateurs indépendants est un signal. Nous affichons le vrai nombre de certificateurs derrière chaque Score LYA.", 'A score backed by a single evaluator is an opinion. A score backed by several independent certifiers is a signal. We display the real number of certifiers behind every LYA Score.')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="term-security">
        <div className="term-wrap">
          <div className="term-eyebrow">{t('Sécurité & confiance', 'Security & trust')}</div>
          <h2 className="term-reveal" style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,34px)' }}>{t('Bâti sur des fondations rigoureuses.', 'Built on rigorous foundations.')}</h2>
          <div className="term-security-grid">
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico1"><Shield size={18} strokeWidth={2.5} /></span><span>{t('Conforme RGPD — protection des données de bout en bout', 'GDPR compliant — end-to-end data protection')}</span></div>
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico2"><Shield size={18} strokeWidth={2.5} /></span><span>{t('Droits créatifs certifiés légalement à chaque étape', 'Legally certified creative rights at every step')}</span></div>
            <div className="term-security-item term-reveal"><span className="term-sec-ico ico3"><Shield size={18} strokeWidth={2.5} /></span><span>{t('Authentification multi-facteurs & infrastructure sécurisée', 'Multi-factor authentication & secure infrastructure')}</span></div>
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
          <div className="term-free-tag">{t('Toujours actif — tous les créateurs', 'Always active — all creators')}</div>
          <h2 className="term-reveal">{t('Vos 3 premiers projets, ', 'Your first 3 projects, ')}<span className="term-gradient-text">{t('certifiés gratuitement.', 'certified for free.')}</span></h2>
          <p className="term-free-intro">{t("Pas de coût de certification standard, aucune contrepartie cachée — quel que soit votre domaine créatif.", 'No standard certification fee, no hidden terms — whatever your creative field.')}</p>
          <motion.div
            className="term-free-grid"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              className="term-free-scenario"
              variants={{ hidden: { opacity: 0, y: 40, rotate: -4, scale: 0.9 }, show: { opacity: 1, y: 0, rotate: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            >
              <span className="badge">{t('Gratuit', 'Free')}</span>
              <div className="cat">{t('Film', 'Film')}</div>
              <h4>{t('Scénario 1', 'Scenario 1')}</h4>
              <p>{t('Un court-métrage indépendant, certifié dès sa première soumission.', 'An independent short film, certified from its very first submission.')}</p>
            </motion.div>
            <motion.div
              className="term-free-scenario"
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            >
              <span className="badge">{t('Gratuit', 'Free')}</span>
              <div className="cat">{t('Série TV', 'TV Series')}</div>
              <h4>{t('Scénario 2', 'Scenario 2')}</h4>
              <p>{t('Un pilote de série, prêt à être présenté à des diffuseurs.', 'A series pilot, ready to be pitched to broadcasters.')}</p>
            </motion.div>
            <motion.div
              className="term-free-scenario"
              variants={{ hidden: { opacity: 0, y: 40, rotate: 4, scale: 0.9 }, show: { opacity: 1, y: 0, rotate: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            >
              <span className="badge">{t('Gratuit', 'Free')}</span>
              <div className="cat">{t('Musique', 'Music')}</div>
              <h4>{t('Scénario 3', 'Scenario 3')}</h4>
              <p>{t('Un album complet, certifié avant sa sortie officielle.', 'A full album, certified ahead of its official release.')}</p>
            </motion.div>
          </motion.div>
          <button className="term-free-cta" onClick={() => setShowJoin(true)}>{t('Pré-inscrivez-vous pour garantir votre place →', 'Pre-register to secure your spot →')}</button>
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
                  <li>{t('Jusqu\'à 15 soumissions/mois', 'Up to 15 submissions/mo')}</li>
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
                  <li>{t('Tout Pro Starter, plafond à 30/mois', 'Everything in Starter, cap raised to 30/mo')}</li>
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
          <button className="term-pill term-btn-flash" style={{ background: '#0B0E14' }} onClick={() => setShowJoin(true)}>{t('Rejoindre LYA →', 'Join LYA →')}</button>
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
                  <div className="term-join-field">
                    <label>{t('Pays (optionnel)', 'Country (optional)')}</label>
                    <select value={joinCountry} onChange={(e) => setJoinCountry(e.target.value)}>
                      <option value="">{t('Sélectionner...', 'Select...')}</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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
              <a href="https://www.instagram.com/linkyourart_/" target="_blank" rel="noopener noreferrer" style={{ color: '#8A87A8', textDecoration: 'none' }}>Instagram</a>
              <a href="https://www.linkedin.com/company/linkyourart/" target="_blank" rel="noopener noreferrer" style={{ color: '#8A87A8', textDecoration: 'none' }}>LinkedIn</a>
              <a href="https://x.com/linkyourart" target="_blank" rel="noopener noreferrer" style={{ color: '#8A87A8', textDecoration: 'none' }}>X</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomeView;
// unstick 1789152768
