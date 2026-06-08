import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, ChevronLeft, ChevronRight, ShieldCheck, Star, Lock, CreditCard } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { Contract, CONTRACTS } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MecenatViewProps {
  user: any;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
  liveContracts?: Contract[];
}

/* ── DATA ──────────────────────────────────────────────────────────────── */
const SUBTITLES: Record<string, { en: string; fr: string }> = {
  'RENAISSANCE REBORN':  { en: 'FINE ART CO-PRODUCTION INITIATIVE',      fr: 'INITIATIVE DE CO-PRODUCTION ART CLASSIQUE' },
  'SKY GARDENS V4':      { en: 'ARCHITECTURE CO-PRODUCTION INITIATIVE',   fr: 'INITIATIVE DE CO-PRODUCTION ARCHITECTURE' },
  'THE FUTURE VOICE':    { en: 'PODCAST CO-PRODUCTION INITIATIVE',        fr: 'INITIATIVE DE CO-PRODUCTION PODCAST' },
  'CHRONICLES OF ELDON': { en: 'TV SERIES CO-PRODUCTION INITIATIVE',      fr: 'INITIATIVE DE CO-PRODUCTION SÉRIE TV' },
  'NEON DISTRICT #4':    { en: 'MUSIC CO-PRODUCTION INITIATIVE',          fr: 'INITIATIVE DE CO-PRODUCTION MUSICALE' },
  'SHADOWS OF SEOUL':    { en: 'FILM CO-PRODUCTION INITIATIVE',           fr: 'INITIATIVE DE CO-PRODUCTION CINÉMA' },
  'QUANTUM REALM':       { en: 'DIGITAL ART CO-PRODUCTION INITIATIVE',    fr: 'INITIATIVE DE CO-PRODUCTION ART NUMÉRIQUE' },
  'RENAISSANCE OS V3':   { en: 'ALGORITHMIC TEMPORAL GENERATIVE ART SYSTEM', fr: 'SYSTÈME D\'ART GÉNÉRATIF ALGORITHMIQUE' },
};

const GALLERY: Record<string, string[]> = {
  'RENAISSANCE REBORN': [
    'https://images.unsplash.com/photo-1578926288207-a90a5366e0a4?w=900&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&q=80',
    'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=400&q=80',
  ],
  'SKY GARDENS V4': [
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
  ],
  'THE FUTURE VOICE': [
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=900&q=80',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80',
    'https://images.unsplash.com/photo-1593697909687-7f3e2a2c9e30?w=400&q=80',
  ],
  'CHRONICLES OF ELDON': [
    'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=900&q=80',
    'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&q=80',
    'https://images.unsplash.com/photo-1519669417670-68775a50919c?w=400&q=80',
  ],
  'NEON DISTRICT #4': [
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=900&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
  ],
  'SHADOWS OF SEOUL': [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80',
  ],
  'QUANTUM REALM': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
  ],
};

const DESCRIPTIONS_FR: Record<string, string> = {
  'RENAISSANCE REBORN':  'Copropriété fractionnée d\'un chef-d\'œuvre de la Renaissance physique. Chaque unité LYA représente un droit contractuel direct sur l\'appréciation future de sa valeur et les revenus du jumeau numérique.',
  'SKY GARDENS V4':      'Droits de conception d\'une architecture verticale durable. Parts de revenus issues de la licence des plans architecturaux et des redevances d\'intégration smart-city.',
  'THE FUTURE VOICE':    'Réseau de podcasts d\'investigation de premier plan. La chute significative des métriques d\'audience et des cibles de revenus publicitaires a fortement impacté la valorisation.',
  'CHRONICLES OF ELDON': 'Droits de synchronisation mondiale et de diffusion SVOD pour la série TV sci-fi premium. Chaque unité indexe une part proportionnelle des revenus récurrents et des licences multi-territoires.',
  'NEON DISTRICT #4':    'Série musicale expérimentale en édition limitée. Parts sur les flux de streaming, les synchronisations publicitaires et les ventes de produits dérivés physiques.',
  'SHADOWS OF SEOUL':    'Film indépendant primé. Correction post-lancement significative car la demande streaming initiale est inférieure aux projections de marché.',
  'QUANTUM REALM':       'Visualisation scientifique des champs de probabilité. Parts de revenus liées aux licences de publication de recherche.',
};

const COMPLIANCE: Record<string, { auditor: string; jurisdiction: string; ledger: string }> = {
  'RENAISSANCE REBORN':  { auditor: 'Louvre Digital Hub', jurisdiction: 'EU (MiCA)', ledger: 'LYA_REG_0x1A3F' },
  'SKY GARDENS V4':      { auditor: 'Dezeen Architecture Council', jurisdiction: 'EU (MiCA)', ledger: 'LYA_REG_0x4C2A' },
  'THE FUTURE VOICE':    { auditor: 'Warner Music Hub', jurisdiction: 'EU (MiCA)', ledger: 'LYA_REG_0x71C4F2A' },
  'CHRONICLES OF ELDON': { auditor: 'Netflix Content Audit', jurisdiction: 'US (SEC)', ledger: 'LYA_REG_0x8B3D' },
  'SHADOWS OF SEOUL':    { auditor: 'Sundance Film Foundation', jurisdiction: 'EU Markets', ledger: 'LYA_REG_0x2E9F' },
  'QUANTUM REALM':       { auditor: 'CNRS Digital Labs', jurisdiction: 'EU (MiCA)', ledger: 'LYA_REG_0x6A1C' },
};

const RARITY_COLORS: Record<string, string> = {
  Legendary: 'bg-yellow-400/30 text-yellow-300 border-yellow-400/40',
  Epic:      'bg-purple-400/30 text-purple-300 border-purple-400/40',
  Rare:      'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  Common:    'bg-white/10 text-white/50 border-white/20',
};

const getUnitPrice = (c: Contract): number =>
  Math.max(15, Math.round(c.unitValue * (1 + c.growth / 100) * 100) / 100);

const getFundingPct = (c: Contract): number =>
  Math.min(98, Math.round(50 + (c.totalScore / 1000) * 48));

const getTier = (units: number) => {
  if (units >= 50) return {
    label: 'CO-FOUNDER HOLDING STATUS',
    desc: `Co-founder co-ownership privileges. VIP priority on future licensing distributions. Bonus LYA Units: +${Math.floor(units * 0.15)} Units (+$${(Math.floor(units * 0.15) * 50).toLocaleString()}.00 Value offered!).`,
    color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-600/40',
  };
  if (units >= 10) return {
    label: 'CREATIVE PARTNER',
    desc: 'Active co-ownership rights with priority access to milestone events and distribution updates.',
    color: 'text-primary-cyan', bg: 'bg-primary-cyan/10 border-primary-cyan/30',
  };
  return {
    label: 'ASSOCIATE CO-OWNER',
    desc: 'Standard co-ownership rights for future commercial release. Bonus Units: None.',
    color: 'text-white/50', bg: 'bg-white/5 border-white/10',
  };
};

const CATEGORIES = [
  { id: 'all',          label: 'Toutes les Œuvres',      labelEn: 'All Masterpieces'       },
  { id: 'Fine Art',     label: 'Arts Visuels & Mode',    labelEn: 'Visual Arts & Fashion'  },
  { id: 'Film',         label: 'Cinéma & Récits',        labelEn: 'Cinema & Narratives'    },
  { id: 'Music',        label: 'Musique & Concerts',     labelEn: 'Music & Concerts'       },
  { id: 'Architecture', label: 'Littérature & Espaces',  labelEn: 'Literature & Spaces'    },
  { id: 'Digital Art',  label: 'Art Numérique',          labelEn: 'Digital Art'            },
];

const CAT_MAP: Record<string, string[]> = {
  'Fine Art':     ['Fine Art', 'Photography', 'Fashion'],
  'Film':         ['Film', 'TV Series', 'Performing Arts'],
  'Music':        ['Music', 'Podcast'],
  'Architecture': ['Architecture', 'Literature'],
  'Digital Art':  ['Digital Art', 'Gaming', 'Design'],
};

/* ── COMPONENT ─────────────────────────────────────────────────────────── */
export const MecenatView: React.FC<MecenatViewProps> = ({ user, onNotify, onViewChange, liveContracts }) => {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState('all');
  const [units, setUnits] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [galleryIdx, setGalleryIdx] = useState<Record<string, number>>({});
  const [detailContract, setDetailContract] = useState<Contract | null>(null);
  const [detailGalleryIdx, setDetailGalleryIdx] = useState(0);
  const [payContract, setPayContract] = useState<Contract | null>(null);
  const [payUnits, setPayUnits] = useState(5);
  const [payForm, setPayForm] = useState({ email: user?.email || '', name: user?.displayName || '', card: '', expiry: '', cvv: '' });
  const [payLoading, setPayLoading] = useState(false);

  const contracts = useMemo(() =>
    (liveContracts || CONTRACTS).filter(c => c.status === 'LIVE' && c.totalValue > 0 && c.unitValue > 0),
  [liveContracts]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return contracts;
    const cats = CAT_MAP[activeCategory] || [activeCategory];
    return contracts.filter(c => cats.includes(c.category));
  }, [activeCategory, contracts]);

  const getUnits = (id: string) => units[id] ?? 5;
  const getGallery = (name: string) => GALLERY[name] || [`https://picsum.photos/seed/${name}/900/500`];

  const openDetail = (c: Contract) => { setDetailContract(c); setDetailGalleryIdx(0); };
  const openPay = (c: Contract) => {
    if (!user) { onNotify(t('Please sign in.', 'Veuillez vous connecter.')); onViewChange('LOGIN'); return; }
    setPayContract(c);
    setPayUnits(getUnits(c.id));
    setPayForm({ email: user?.email || '', name: user?.displayName || '', card: '', expiry: '', cvv: '' });
  };

  const handlePay = async () => {
    if (!payContract) return;
    setPayLoading(true);
    try {
      await addDoc(collection(db, 'mecenat_acquisitions'), {
        userId: user?.uid, userEmail: user?.email,
        contractId: payContract.id, contractName: payContract.name,
        units: payUnits, unitPrice: getUnitPrice(payContract),
        totalAmount: payUnits * getUnitPrice(payContract),
        status: 'PENDING_PAYMENT', createdAt: serverTimestamp(),
      });
      setTimeout(() => {
        setPayLoading(false);
        setPayContract(null);
        onNotify(t('Payment registered! Units will appear in Holdings.', 'Paiement enregistré ! Vos unités apparaîtront dans Holdings.'));
        onViewChange('HOLDINGS');
      }, 1800);
    } catch {
      setPayLoading(false);
      onNotify(t('Error. Please try again.', 'Erreur. Veuillez réessayer.'));
    }
  };

  const getSubtitle = (name: string, isFr: boolean) => {
    const s = SUBTITLES[name];
    if (!s) return `${name.split(' ')[0]} CO-PRODUCTION INITIATIVE`;
    return isFr ? s.fr : s.en;
  };

  const isFr = false; // will use t() instead

  return (
    <div className="space-y-6 pb-20">

      {/* Category tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-[8px] font-black text-white/25 uppercase tracking-[0.4em] shrink-0">
          {t('CHOOSE AN ART MOOD', 'CHOISISSEZ UNE AMBIANCE ARTISTIQUE')}
        </span>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeCategory === cat.id
                ? 'bg-primary-cyan text-surface-dim shadow-[0_0_20px_rgba(0,224,255,0.3)]'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            {t(cat.labelEn, cat.label)}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((c, i) => {
          const u = getUnits(c.id);
          const unitPrice = getUnitPrice(c);
          const totalCost = u * unitPrice;
          const revenueShare = c.revenueSharePercentage > 0
            ? ((u / c.totalUnits) * c.revenueSharePercentage).toFixed(3)
            : '0.000';
          const tier = getTier(u);
          const gallery = getGallery(c.name);
          const gIdx = galleryIdx[c.id] || 0;
          const fundingPct = getFundingPct(c);
          const raisedAmt = (c.totalValue * fundingPct / 100);

          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-black group cursor-pointer" onClick={() => openDetail(c)}>
                <img src={gallery[gIdx]} alt={c.name}
                  onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${c.id}/900/500`; }}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-widest self-start">
                    {c.category.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 bg-accent-gold/80 backdrop-blur-sm text-[8px] font-black text-black uppercase tracking-widest self-start flex items-center gap-1">
                    ★ LYA SCORE: {c.totalScore}
                  </span>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border self-start ${RARITY_COLORS[c.rarity] || RARITY_COLORS.Common}`}>
                    {c.rarity.toUpperCase()}
                  </span>
                </div>
                <button onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [c.id]: !p[c.id] })); if (!liked[c.id]) onNotify(t('Added to favourites', 'Ajouté aux favoris')); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
                >
                  <Heart size={14} className={liked[c.id] ? 'fill-rose-400 text-rose-400' : 'text-white/60'} />
                </button>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] mb-0.5">{t('CREATIVE VENTURE', 'INITIATIVE CRÉATIVE')}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-xl font-black text-white uppercase tracking-tight leading-tight">{c.name}</p>
                    <div className="text-right font-mono">
                      <p className="text-[11px] font-black text-primary-cyan">${unitPrice.toFixed(2)} / {t('Unit', 'Unité')}</p>
                      {c.revenueSharePercentage > 0 && (
                        <p className="text-[10px] font-black text-emerald-400">{c.revenueSharePercentage}% {t('Revenue Rights', 'Part Revenus')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Subtitle + description */}
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.35em] mb-2">
                    {t(SUBTITLES[c.name]?.en || `${c.category.toUpperCase()} CO-PRODUCTION INITIATIVE`,
                       SUBTITLES[c.name]?.fr || `INITIATIVE ${c.category.toUpperCase()}`)}
                  </p>
                  <p className="text-[12px] text-white/55 leading-relaxed font-sans">
                    {t(c.description, DESCRIPTIONS_FR[c.name] || c.description)}
                  </p>
                </div>

                {/* LYA Quality Score */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-1">
                    ★ {t('LYA QUALITY SCORE', 'SCORE QUALITÉ LYA')}
                  </span>
                  <span className="text-base font-black text-accent-gold font-mono">
                    {c.totalScore} <span className="text-[9px] text-white/25 font-bold">/ 1000</span>
                  </span>
                </div>

                {/* Funding progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{t('FUNDING PROGRESS', 'AVANCEMENT DU FINANCEMENT')}</span>
                    <span className="text-[9px] font-black text-primary-cyan font-mono">{fundingPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${fundingPct}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-cyan to-emerald-400 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-white/25 font-mono">${raisedAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[8px] text-white/25">{t('Goal:', 'Objectif :')} ${c.totalValue.toLocaleString()}.00</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">
                      {t('LYA UNITS ACQUISITION VOLUME', 'VOLUME D\'ACQUISITION UNITÉS LYA')}
                    </span>
                    <span className="px-3 py-1 bg-surface-dim border border-white/10 text-[9px] font-black text-white font-mono rounded-lg">
                      {u} {t('Units Supporting', 'Unités de Soutien')}
                    </span>
                  </div>
                  <input type="range" min={1} max={100} value={u}
                    onChange={e => setUnits(p => ({ ...p, [c.id]: parseInt(e.target.value) }))}
                    className="w-full accent-primary-cyan cursor-pointer" style={{ height: '4px' }}
                  />
                  <div className="flex justify-between text-[8px] font-black text-white/25 uppercase tracking-widest">
                    <span>1 {t('UNIT', 'UNITÉ')}</span>
                    <span>50 {t('UNITS', 'UNITÉS')}</span>
                    <span>100 {t('UNITS', 'UNITÉS')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">{t('YOUR CONTRIBUTION', 'VOTRE CONTRIBUTION')}</p>
                      <p className="text-base font-black text-white font-mono">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">{t('FUTURE REVENUE RIGHTS', 'DROITS REVENUS FUTURS')}</p>
                      <p className="text-base font-black text-emerald-400 font-mono">{revenueShare}%</p>
                    </div>
                  </div>

                  {/* Tier */}
                  <div className={`p-3 rounded-xl border ${tier.bg}`}>
                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${tier.color}`}>{tier.label}</p>
                    <p className="text-[10px] text-white/40 font-sans leading-snug">{tier.desc}</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto pt-1">
                  <button onClick={() => openDetail(c)}
                    className="flex-1 py-3.5 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all"
                  >
                    {t('VIEW PROJECT', 'VOIR LE PROJET')}
                  </button>
                  <button onClick={() => openPay(c)}
                    className="flex-1 py-3.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,224,255,0.2)]"
                  >
                    <Star size={12} fill="currentColor" />
                    {t('BACK MASTERPIECE', 'SOUTENIR L\'ŒUVRE')}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── DETAIL MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailContract && (() => {
          const c = detailContract;
          const u = getUnits(c.id);
          const unitPrice = getUnitPrice(c);
          const gallery = getGallery(c.name);
          const compliance = COMPLIANCE[c.name] || { auditor: 'LYA Protocol Hub', jurisdiction: c.jurisdiction, ledger: `LYA_REG_${c.registryIndex}` };
          const fundingPct = getFundingPct(c);
          const revenueShare = c.revenueSharePercentage > 0
            ? ((u / c.totalUnits) * c.revenueSharePercentage).toFixed(3)
            : '0.000';

          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDetailContract(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
              />
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}
              >
                <div style={{ pointerEvents: 'auto', maxWidth: '1000px', width: '100%', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
                  className="bg-[#0A0F1A] border border-white/10 rounded-3xl overflow-hidden"
                >
                  {/* Close */}
                  <button onClick={() => setDetailContract(null)}
                    className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                    style={{ position: 'sticky', float: 'right', margin: '16px 16px 0 0' }}
                  >
                    <X size={16} />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* LEFT — Gallery */}
                    <div className="p-6 space-y-4 bg-black/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 border border-primary-cyan/40 flex items-center justify-center">
                          <span className="text-primary-cyan text-[8px] font-black">🖼</span>
                        </div>
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.35em]">{t('ART PROJECT GALLERY', 'GALERIE DU PROJET ARTISTIQUE')}</span>
                      </div>

                      {/* Main image */}
                      <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
                        <img src={gallery[detailGalleryIdx]} alt={c.name}
                          onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${c.id}main/800/600`; }}
                          className="w-full h-full object-cover"
                        />
                        {gallery.length > 1 && (
                          <>
                            <button onClick={() => setDetailGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setDetailGalleryIdx(i => (i + 1) % gallery.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
                            >
                              <ChevronRight size={16} />
                            </button>
                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {gallery.map((_, gi) => (
                                <button key={gi} onClick={() => setDetailGalleryIdx(gi)}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${detailGalleryIdx === gi ? 'bg-white' : 'bg-white/30'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      <div className="flex gap-2">
                        {gallery.map((img, gi) => (
                          <button key={gi} onClick={() => setDetailGalleryIdx(gi)}
                            className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${detailGalleryIdx === gi ? 'border-primary-cyan' : 'border-white/10'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${c.id}${gi}/200/150`; }}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Compliance */}
                      <div className="border border-primary-cyan/20 bg-primary-cyan/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck size={14} className="text-primary-cyan" />
                          <span className="text-[8px] font-black text-primary-cyan uppercase tracking-[0.35em]">{t('LYA COMPLIANCE ASSURANCE', 'ASSURANCE DE CONFORMITÉ LYA')}</span>
                        </div>
                        <p className="text-[10px] text-white/50 font-sans leading-relaxed mb-3">
                          {t(
                            `Audited and verified by ${compliance.auditor} under ${compliance.jurisdiction} guidelines. Smart contract addresses are permanently etched on the LYA register.`,
                            `Audité et vérifié par ${compliance.auditor} selon les directives ${compliance.jurisdiction}. Les adresses de contrats intelligents sont gravées de façon permanente sur le registre LYA.`
                          )}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-black/30 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest rounded">
                            {t('Jurisdiction:', 'Juridiction :')} {compliance.jurisdiction}
                          </span>
                          <span className="px-2 py-1 bg-black/30 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest rounded">
                            {t('Ledger:', 'Registre :')} {compliance.ledger}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT — Details */}
                    <div className="p-6 space-y-5">
                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${RARITY_COLORS[c.rarity] || RARITY_COLORS.Common}`}>
                            {c.category.toUpperCase()}
                          </span>
                          <span className="text-[8px] font-mono text-white/30">ID: {c.name.replace(/\s/g, '_').toUpperCase()}</span>
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tight leading-tight">{c.name}</h2>
                        <p className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.3em] mt-1">
                          {t(SUBTITLES[c.name]?.en || `${c.category.toUpperCase()} CO-PRODUCTION INITIATIVE`,
                             SUBTITLES[c.name]?.fr || `INITIATIVE ${c.category.toUpperCase()}`)}
                        </p>
                      </div>

                      {/* Budget progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{t('TARGET PROJECT BUDGET', 'BUDGET CIBLE DU PROJET')}</span>
                          <span className="text-[9px] font-black text-primary-cyan font-mono">{fundingPct}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-gradient-to-r from-primary-cyan to-emerald-400 rounded-full" style={{ width: `${fundingPct}%` }} />
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-[7px] text-white/25 uppercase tracking-widest">{t('RAISED AMOUNT', 'MONTANT LEVÉ')}</p>
                            <p className="text-sm font-black text-white font-mono">${(c.totalValue * fundingPct / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[7px] text-white/25 uppercase tracking-widest">{t('GLOBAL GOAL', 'OBJECTIF GLOBAL')}</p>
                            <p className="text-sm font-black text-white font-mono">${c.totalValue.toLocaleString()}.00</p>
                          </div>
                        </div>
                      </div>

                      {/* Pitch */}
                      <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{t('PROJECT PITCH & SYNOPSIS', 'PITCH & SYNOPSIS DU PROJET')}</p>
                        <blockquote className="border-l-2 border-primary-cyan/40 pl-3 text-[11px] text-white/60 italic font-sans leading-relaxed">
                          "{t(c.description, DESCRIPTIONS_FR[c.name] || c.description)}"
                        </blockquote>
                      </div>

                      {/* Milestones */}
                      {c.milestones && c.milestones.length > 0 && (
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{t('DEVELOPMENT MILESTONES', 'JALONS DE DÉVELOPPEMENT')}</p>
                          <ul className="space-y-1.5">
                            {c.milestones.slice(0, 3).map((m, mi) => (
                              <li key={mi} className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${m.status === 'COMPLETED' ? 'border border-primary-cyan' : 'border border-white/20'}`}>
                                  {m.status === 'COMPLETED' && <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan" />}
                                </span>
                                <span className={`text-[10px] font-sans ${m.status === 'COMPLETED' ? 'line-through text-white/30' : 'text-white/60'}`}>{m.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Estimated benefits */}
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">
                          {t(`ESTIMATED BENEFITS FOR: ${u} UNITS SUPPORTING`, `BÉNÉFICES ESTIMÉS POUR : ${u} UNITÉS`)}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/40 font-sans">{t('Total backing pledge:', 'Engagement total :')}</span>
                            <span className="text-[10px] font-black text-white font-mono">${(u * unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-white/40 font-sans">{t('Cumulative Revenue rights:', 'Droits revenus cumulés :')}</span>
                            <span className="text-[10px] font-black text-emerald-400 font-mono">{revenueShare}%</span>
                          </div>
                        </div>
                        <p className="text-[8px] text-white/20 font-sans mt-3 leading-relaxed">
                          * {t('Note: Support pledge proceeds are securely held in trust. Benefits triggering aligns automatically with validated milestone release dates.', 'Note : Les fonds sont sécurisés en fidéicommis. Les bénéfices sont déclenchés automatiquement à la validation des jalons.')}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setDetailContract(null)}
                          className="flex-1 py-3.5 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all"
                        >
                          {t('CLOSE', 'FERMER')}
                        </button>
                        <button onClick={() => { setDetailContract(null); openPay(c); }}
                          className="flex-1 py-3.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all"
                        >
                          {t(`SUPPORT WITH ${u} UNITS`, `SOUTENIR AVEC ${u} UNITÉS`)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ── PAYMENT MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {payContract && (() => {
          const c = payContract;
          const unitPrice = getUnitPrice(c);
          const total = payUnits * unitPrice;

          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !payLoading && setPayContract(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(20px)' }}
              />
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}
              >
                <div style={{ pointerEvents: 'auto', maxWidth: '480px', width: '100%' }}
                  className="bg-[#0D1117] border border-white/10 rounded-3xl overflow-hidden font-mono shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.35em]">{t('STRIPE SECURE CHECKOUT', 'PAIEMENT SÉCURISÉ STRIPE')}</span>
                    </div>
                    {!payLoading && (
                      <button onClick={() => setPayContract(null)} className="text-white/30 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="p-7 space-y-5">
                    {/* Order summary */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-[0.3em]">{t('PATRONAGE PLEDGE:', 'ENGAGEMENT MÉCÉNAT :')}</p>
                          <p className="text-base font-black text-white italic mt-0.5">{c.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{payUnits} {t('units supported', 'unités soutenues')} × ${unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-white/30 uppercase tracking-[0.3em]">{t('TOTAL COST', 'COÛT TOTAL')}</p>
                          <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form fields */}
                    {[
                      { label: t('BILLING EMAIL ADDRESS', 'ADRESSE EMAIL DE FACTURATION'), key: 'email', type: 'email', placeholder: user?.email || 'email@example.com' },
                      { label: t('CARDHOLDER NAME', 'NOM DU PORTEUR'), key: 'name', type: 'text', placeholder: 'JANE DOE' },
                      { label: t('CARD CREDENTIALS', 'IDENTIFIANTS DE CARTE'), key: 'card', type: 'text', placeholder: '4242 4242 4242 4242', extra: 'brands' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] block mb-1.5">{f.label}</label>
                        <div className="relative">
                          <input type={f.type} value={(payForm as any)[f.key]} placeholder={f.placeholder}
                            onChange={e => setPayForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-cyan transition-all"
                          />
                          {f.extra === 'brands' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            {['VISA', 'MC', 'AMEX', 'CB'].map(b => (
                              <span key={b} className="px-1.5 py-0.5 bg-white/10 border border-white/15 text-[7px] font-black text-white/50 rounded">{b}</span>
                            ))}
                          </div>
                        )}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] block mb-1.5">{t('EXPIRY DATE', 'DATE D\'EXPIRATION')}</label>
                        <input type="text" value={payForm.expiry} placeholder="MM/YY" maxLength={5}
                          onChange={e => setPayForm(p => ({ ...p, expiry: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-cyan transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] block mb-1.5">{t('CVV CODE', 'CODE CVV')}</label>
                        <input type="password" value={payForm.cvv} placeholder="***"
                          onChange={e => setPayForm(p => ({ ...p, cvv: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-cyan transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[9px] text-white/25 font-sans leading-relaxed flex gap-2">
                      <span className="text-white/40 mt-0.5">ℹ</span>
                      {t(
                        `Your payment of $${total.toFixed(2)} will be processed and locked inside the safe LYA smart contract. Your shares will appear instantly under holdings.`,
                        `Votre paiement de $${total.toFixed(2)} sera traité et verrouillé dans le contrat intelligent sécurisé LYA. Vos parts apparaîtront instantanément dans Holdings.`
                      )}
                    </p>

                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setPayContract(null)} disabled={payLoading}
                        className="flex-1 py-4 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all disabled:opacity-40"
                      >
                        {t('CANCEL', 'ANNULER')}
                      </button>
                      <button onClick={handlePay} disabled={payLoading}
                        className="flex-1 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {payLoading ? (
                          <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t('PROCESSING...', 'TRAITEMENT...')}</>
                        ) : (
                          <><Lock size={12} /> {t('PAY SECURELY NOW', 'PAYER EN SÉCURITÉ')}</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};
