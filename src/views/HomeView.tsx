
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Layers, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Award, 
  ArrowUpRight, 
  ExternalLink,
  Eye,
  Clapperboard,
  Music,
  Gamepad2,
  Video,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUp,
  ArrowDown,
  Info,
  Coins,
  Activity,
  Cpu,
  Scale,
  Mic,
  Sparkles,
  Target,
  FileText,
  RefreshCw,
  Flag
} from 'lucide-react';
import { LYA_UNIT_VALUE, Contract, PillarScore } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { Logo } from '../components/ui/Logo';
import { View } from '../components/ui/Sidebar';
import { Ticker } from '../components/ui/Ticker';
import { CONTRACTS } from '../types';
import { LYAProtocolBadge } from '../components/LYAProtocol';
import { Player } from '../components/ui/Player';

import { ContractCard } from '../components/ContractCard';
import { UserProfile } from '../types';

interface HomeViewProps {
  user: UserProfile | null;
  onViewChange: (view: View) => void;
  liveContracts?: Contract[];
}

const BrushSeparator = () => (
  <div className="relative h-px w-full my-32 pointer-events-none overflow-visible z-30">
    <motion.div 
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-cyan to-transparent relative origin-center"
    >
      <div className="absolute inset-0 bg-primary-cyan blur-[2px] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-cyan rounded-full shadow-[0_0_15px_rgba(0,224,255,1)]" />
    </motion.div>
  </div>
);

const NeuralTicker = () => {
  const { t } = useTranslation();
  const [val, setVal] = React.useState(2942.15);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setVal(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-y border-primary-cyan/20 py-2 flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-4 md:gap-8 whitespace-nowrap animate-marquee flex-wrap">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Activity size={12} className="text-primary-cyan" />
              <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest leading-none">{'Index Mondial LYA'}</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold leading-none">+0.14%</span>
            </div>
            <div className="w-1.5 h-1.5 bg-primary-cyan/20 rounded-full" />
            <div className="flex items-center gap-2 flex-wrap">
              <Cpu size={12} className="text-accent-gold" />
              <span className="text-[10px] font-mono text-accent-gold uppercase tracking-widest leading-none">{'Statut du Maillage Neural'}</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">{'OPTIMAL'}</span>
            </div>
            <div className="w-1.5 h-1.5 bg-primary-cyan/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

const RealTimeValuation: React.FC<{ liveContracts: Contract[] }> = ({ liveContracts }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [selectedCaseIdx, setSelectedCaseIdx] = React.useState<number>(0);
  const [isModelizerOpen, setIsModelizerOpen] = React.useState(false);
  const [demoPillars, setDemoPillars] = React.useState({
    quality: 180,
    marketability: 175,
    security: 190,
    innovation: 165,
    growth: 185
  });
  const [demoCommitteeScore, setDemoCommitteeScore] = React.useState(850);
  const [demoMilestones, setDemoMilestones] = React.useState(3);

  const [appliedSimulation, setAppliedSimulation] = React.useState<{
    [contractId: string]: {
      totalScore: number;
      pillars: { label: string; score: number }[];
    } | null;
  }>({});

  const selectedContract = React.useMemo(() => {
    const targetName = selectedCaseIdx === 0 ? 'RENAISSANCE REBORN' :
                       selectedCaseIdx === 1 ? 'SKY GARDENS V4' :
                       'CHRONICLES OF ELDON';
    return liveContracts.find(c => c.name === targetName) || 
           CONTRACTS.find(c => c.name === targetName) || 
           (selectedCaseIdx === 0 ? CONTRACTS[0] : selectedCaseIdx === 1 ? CONTRACTS[1] : CONTRACTS[3]);
  }, [selectedCaseIdx, liveContracts]);

  // Active statistics representing either baseline or simulated metrics
  const activeContractStats = React.useMemo(() => {
    const sim = appliedSimulation[selectedContract.id];
    if (sim) {
      return {
        totalScore: sim.totalScore,
        pillars: sim.pillars
      };
    }
    const origPillars = selectedContract.pillars || [];
    const mappedPillars = origPillars.map(p => ({
      label: p.label,
      score: p.score
    }));

    return {
      totalScore: selectedContract.totalScore || 850,
      pillars: mappedPillars
    };
  }, [selectedContract, appliedSimulation]);

  // Combined score (out of 1000)
  const demoSAuto = React.useMemo(() => {
    return demoPillars.quality + demoPillars.marketability + demoPillars.security + demoPillars.innovation + demoPillars.growth;
  }, [demoPillars]);

  const demoLyaScoreCombined = React.useMemo(() => {
    const raw = (0.70 * demoCommitteeScore) + (0.30 * demoSAuto);
    return Math.min(1000, Math.round(raw));
  }, [demoCommitteeScore, demoSAuto]);

  const demoMilestoneBonusPercent = React.useMemo(() => {
    return demoMilestones * 4.15;
  }, [demoMilestones]);

  // Pourcentage d'avancement des jalons — directement dérivé du Score et du bonus
  // de jalons, sans jamais passer par une valeur unitaire ou une valorisation.
  const demoRentScore = React.useMemo(() => {
    return Math.min(100, Math.round((demoLyaScoreCombined / 1000) * 100));
  }, [demoLyaScoreCombined]);

  const handleApplyModel = React.useCallback(() => {
    setAppliedSimulation(prev => ({
      ...prev,
      [selectedContract.id]: {
        totalScore: demoLyaScoreCombined,
        pillars: [
          { label: t('IC · Conceptual Integrity', 'IC · Intégrité Conceptuelle'), score: demoPillars.quality },
          { label: t('MA · Current Maturity', 'MA · Maturité Actuelle'), score: demoPillars.marketability },
          { label: t('FR · Real Feasibility', 'FR · Faisabilité Réelle'), score: demoPillars.security },
          { label: t('CE · Evolution Capacity', 'CE · Capacité d\'Évolution'), score: demoPillars.innovation },
          { label: t('IN · Embodiment', 'IN · Incarnation'), score: demoPillars.growth }
        ]
      }
    }));
    setIsModelizerOpen(false);
  }, [selectedContract, demoLyaScoreCombined, demoPillars, t]);

  const handleResetSimulation = React.useCallback((contractId: string) => {
    setAppliedSimulation(prev => ({
      ...prev,
      [contractId]: null
    }));
  }, []);


  // Jalons data for each case study
  const CASE_JALONS = [
    // 0 — RENAISSANCE REBORN (Fine Art)
    [
      { type: 'jalon', title: t('Authentication Certification', 'Certification Authentification'), desc: t('Expertise validated by 3 international houses', 'Expertise validée par 3 maisons internationales'), scoreFrom: 520, scoreDelta: 80, priceFrom: 50.00 },
      { type: 'risk',  title: t('Transport Insurance Delay', 'Retard Assurance Transport'), desc: t('Logistics incident during the exhibition', 'Sinistre logistique pendant l\'exposition'), scoreFrom: 600, scoreDelta: -45, priceFrom: 54.00 },
      { type: 'jalon', title: t('Grand Palais Paris Exhibition', 'Exposition Grand Palais Paris'), desc: t('International press coverage confirmed', 'Couverture presse internationale confirmée'), scoreFrom: 555, scoreDelta: 110, priceFrom: 49.50 },
      { type: 'risk',  title: t('Resale Right Dispute', 'Litige Droit de Suite'), desc: t('Heirs contest the revenue assignment', 'Héritiers contestent la cession de revenus'), scoreFrom: 665, scoreDelta: -55, priceFrom: 60.50 },
      { type: 'jalon', title: t('Pinault Collection Entry', 'Entrée Collection Pinault'), desc: t('Major institutional acquisition', 'Acquisition institutionnelle majeure'), scoreFrom: 610, scoreDelta: 130, priceFrom: 55.00 },
    ],
    // 1 — SKY GARDENS V4 (Architecture)
    [
      { type: 'jalon', title: t('Building Permit Approved', 'Permis de Construire Validé'), desc: t('City hall approves the urban project', 'Mairie approuve le projet urbanistique'), scoreFrom: 480, scoreDelta: 70, priceFrom: 50.00 },
      { type: 'risk',  title: t('Materials Delivery Delay', 'Retard Livraison Matériaux'), desc: t('Steel shortage, construction suspended 6 weeks', 'Pénurie acier, chantier suspendu 6 semaines'), scoreFrom: 550, scoreDelta: -60, priceFrom: 53.50 },
      { type: 'jalon', title: t('International Hotel Contract', 'Contrat Hôtelier International'), desc: t('15-year usage license signed with 5★ chain', 'Licence usage 15 ans signée avec chaîne 5★'), scoreFrom: 490, scoreDelta: 120, priceFrom: 47.00 },
      { type: 'risk',  title: t('Revised Seismic Standards', 'Normes Parasismiques Révisées'), desc: t('Structure upgrade required', 'Mise à niveau structure requise'), scoreFrom: 610, scoreDelta: -40, priceFrom: 59.00 },
      { type: 'jalon', title: t('International Architecture Prize', 'Prix Architecture Internationale'), desc: t('Dezeen Awards residential category winner', 'Récompense Dezeen Awards catégorie résidentiel'), scoreFrom: 570, scoreDelta: 100, priceFrom: 55.00 },
    ],
    // 2 — CHRONICLES OF ELDON (TV Series)
    [
      { type: 'jalon', title: t('Netflix Distribution Deal', 'Accord Netflix Distribution'), desc: t('SVOD presale confirmed in 42 territories', 'Prévente SVOD confirmée 42 territoires'), scoreFrom: 500, scoreDelta: 95, priceFrom: 50.00 },
      { type: 'risk',  title: t('VFX Post-Production Delay', 'Retard VFX Post-Production'), desc: t('Visual effects studio in liquidation', 'Studio effets spéciaux en liquidation'), scoreFrom: 595, scoreDelta: -70, priceFrom: 57.50 },
      { type: 'jalon', title: t('Sundance Festival Selection', 'Sélection Festival Sundance'), desc: t('Award-winning pilot, global coverage', 'Pilote primé, couverture mondiale'), scoreFrom: 525, scoreDelta: 115, priceFrom: 47.50 },
      { type: 'risk',  title: t('SAG-AFTRA Writers Strike', 'Grève Scénaristes SAG-AFTRA'), desc: t('Production halted for 2 months', 'Production interrompue 2 mois'), scoreFrom: 640, scoreDelta: -80, priceFrom: 63.75 },
      { type: 'jalon', title: t('Season 2 Renewal', 'Renouvellement Saison 2'), desc: t('Netflix confirmation + audience bonus', 'Confirmation Netflix + bonus audience'), scoreFrom: 560, scoreDelta: 150, priceFrom: 56.00 },
    ],
  ];

  const CASE_META = [
    { category: t('FINE ART', 'BEAUX-ARTS'), name: 'RENAISSANCE REBORN', budget: '$500,000', units: '10,000', icon: '🖼️', color: 'primary-cyan', finalScore: 740, initialScore: 520 },
    { category: t('ARCHITECTURE', 'ARCHITECTURE'), name: 'SKY GARDENS V4', budget: '$2,500,000', units: '50,000', icon: '🏗️', color: 'accent-gold', finalScore: 670, initialScore: 480 },
    { category: t('TV SERIES', 'SÉRIE TV'), name: 'CHRONICLES OF ELDON', budget: '$1,200,000', units: '24,000', icon: '🎬', color: 'accent-pink', finalScore: 710, initialScore: 500 },
  ];

  const activeJalons = CASE_JALONS[selectedCaseIdx];
  const activeMeta = CASE_META[selectedCaseIdx];
  const activeColor = selectedCaseIdx === 0 ? '#00E0FF' : selectedCaseIdx === 1 ? '#FFD700' : '#FF007F';

  // ── SINGLE SOURCE OF TRUTH pour la progression du Score ───────────────────
  // Calcule le score final et les etapes intermediaires pour toutes les etudes
  // de cas en un seul endroit. Ni prix, ni rendement -- uniquement le Score.
  const allCaseScores = React.useMemo(() => {
    return CASE_JALONS.map((jalons, idx) => {
      const initialScore = CASE_META[idx].initialScore;
      let score = initialScore;
      const steps = jalons.map(j => {
        const prevScore = score;
        score = Math.max(0, Math.min(1000, score + j.scoreDelta));
        return { prevScore, newScore: score };
      });
      return { steps };
    });
  }, []); // never changes — data is static

  const jalonPrices = allCaseScores[selectedCaseIdx].steps;

  return (
    <section className="relative z-10 py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-full max-w-7xl mx-auto">

        {/* ── HEADER ───────────────────────────────────────────── */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/20 mb-6">
            <Activity size={12} className="text-primary-cyan animate-pulse" />
            <span className="text-xs font-black font-mono text-primary-cyan uppercase tracking-[0.4em]">
              {t('Live LYA Simulation', 'Simulation LYA En Direct')}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('LYA Score &', 'Score LYA &')} <span className="text-primary-cyan">{t('Certification Impact', 'Impact Certification')}</span>
          </h2>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed font-medium">
            {t(
              'Every milestone validated pushes the LYA Score up. Every risk declared pulls it down. Transparently. In real time.',
              'Chaque jalon validé fait monter le Score LYA. Chaque risque déclaré le fait baisser. En toute transparence, en temps réel.'
            )}
          </p>
        </div>

        {/* ── C'EST QUOI UN JALON ? — Playful explainer ──────────────── */}
        <div className="max-w-2xl mx-auto mb-10 md:mb-16 flex items-start gap-4 p-5 md:p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Flag size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-400 mb-1">
              {t('What\'s a milestone (\"jalon\")?', 'C\'est quoi un jalon ?')}
            </p>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed">
              {t(
                'A milestone is a key, verified event in a project\'s life. Achievements — an exhibition, a signed contract, an award — push the LYA Score up. Risks or delays — a dispute, a missed deadline — pull it down. Not every project only goes up: the Score stays honest.',
                'Un jalon, c\'est un événement clé et vérifié dans la vie d\'un projet. Les réussites — une exposition, un contrat signé, un prix remporté — font avancer le LYA Score. Les risques ou retards — un litige, un délai non tenu — le font reculer. Tous les projets ne montent pas toujours : le Score reste honnête.'
              )}
            </p>
          </div>
        </div>

        {/* ── LYA SCORE ANCHOR ── */}
        <div className="flex items-center justify-center gap-6 mb-5 md:mb-10 lg:mb-6 md:mb-10 lg:mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <div className="flex items-center gap-4 px-6 py-3 border border-white/10 bg-white/[0.02] flex-wrap">
            <div className="w-8 h-8 rounded-full border border-primary-cyan/40 flex items-center justify-center">
              <Coins size={14} className="text-primary-cyan" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">{t('Reference valuation', 'Valorisation de référence')}</p>
              <p className="text-lg font-black text-white font-mono">{t('Certification Score', 'Score de Certification')} = <span className="text-primary-cyan">{t('/ 1000 pts', '/ 1000 pts')}</span></p>
            </div>
            <div className="ml-4 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('Immutable', 'Immuable')}</p>
            </div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* ── CASE SELECTOR ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {CASE_META.map((meta, idx) => {
            const isActive = selectedCaseIdx === idx;
            return (
              <motion.button
                key={idx}
                onClick={() => setSelectedCaseIdx(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 text-left border transition-all duration-300 ${
                  isActive
                    ? 'border-primary-cyan bg-primary-cyan/5 shadow-[0_0_30px_rgba(0,224,255,0.1)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">{meta.category}</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">{meta.name}</p>
                  </div>
                  <span className="text-2xl">{meta.icon}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-0.5">{t('Final LYA Score', 'Score LYA final')}</p>
                    <p className={`text-xl font-black font-mono ${isActive ? 'text-primary-cyan' : 'text-white'}`}>
                      {meta.finalScore}<span className="text-white/20 text-xs">/1000</span>
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-primary-cyan animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCaseIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Left — Jalon Timeline */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-1">{t('Score journey', 'Parcours du score')}</p>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeMeta.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{t('Sector', 'Secteur')}</p>
                  <p className="text-sm font-black text-white font-mono">{activeMeta.category}</p>
                </div>
              </div>

              {/* Score start */}
              <div className="flex items-center gap-4 px-5 py-3 border border-white/5 bg-white/[0.02] flex-wrap">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 shrink-0">
                  <span className="text-xs font-black">→</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">{t('Issuance — Starting Score', 'Émission — Score de Départ')}</p>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0 flex-wrap">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black">{t('Score', 'Score')}</p>
                    <p className="text-sm font-black text-white font-mono">{activeMeta.initialScore}<span className="text-white/20 text-xs">/1000</span></p>
                  </div>
                </div>
              </div>

              {/* Jalons */}
              {activeJalons.map((j, i) => {
                const p = jalonPrices[i];
                if (!p) return null;
                const isJalon = j.type === 'jalon';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-start gap-4 px-5 py-4 border transition-all ${
                      isJalon
                        ? 'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]'
                        : 'border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isJalon ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
                    }`}>
                      {isJalon
                        ? <CheckCircle2 size={14} className="text-emerald-400" />
                        : <AlertTriangle size={14} className="text-rose-400" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{j.title}</p>
                        <span className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border ${
                          isJalon
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        }`}>
                          {isJalon ? t('MILESTONE', 'JALON') : t('RISK', 'RISQUE')}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/45 leading-relaxed">{j.desc}</p>
                    </div>

                    {/* Score impact */}
                    <div className="flex items-center gap-3 shrink-0 text-right flex-wrap">
                      <div>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('Score', 'Score')}</p>
                        <p className="text-xs font-black text-white font-mono">{p.prevScore} → <span className={isJalon ? 'text-emerald-400' : 'text-rose-400'}>{p.newScore}</span></p>
                        <p className={`text-xs font-black font-mono ${isJalon ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {j.scoreDelta > 0 ? '+' : ''}{j.scoreDelta}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right — Summary Panel */}
            <div className="lg:col-span-2 space-y-6">

              {/* Final result hero */}
              <div className="border border-primary-cyan/30 bg-primary-cyan/[0.04] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-cyan to-transparent" />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-primary-cyan/60 mb-4">{t('Final result', 'Résultat final')}</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Initial Score', 'Score Initial')}</span>
                    <span className="text-sm font-black text-white font-mono">{activeMeta.initialScore}<span className="text-white/20 text-xs">/1000</span></span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Final LYA Score', 'Score LYA Final')}</span>
                    <span className="text-xl font-black text-accent-gold font-mono">{activeMeta.finalScore}<span className="text-[10px] text-white/20">/1000</span></span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    {t(
                      'A project initially scored at ' + activeMeta.initialScore + ' has reached a Score of ' + activeMeta.finalScore + '/1000 through validated milestones.',
                      'Un projet initialement scoré à ' + activeMeta.initialScore + ' a atteint un Score de ' + activeMeta.finalScore + '/1000 grâce à des jalons validés.'
                    )}
                  </p>
                </div>
              </div>

              {/* Price chart mini */}
              <div className="border border-white/10 bg-white/[0.02] p-6">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-4">{t('Score evolution', 'Évolution du Score')}</p>
                <div style={{ width: '100%', height: 140 }}>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart
                      data={[{ step: 'Départ', score: activeMeta.initialScore }, ...activeJalons.map((j, i) => ({
                        step: j.title.split(' ').slice(0, 2).join(' '),
                        score: jalonPrices[i]?.newScore ?? activeMeta.initialScore
                      }))]}
                      margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="priceGradCS" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#ffffff06" vertical={false} />
                      <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                      <XAxis dataKey="step" hide />
                      <Tooltip
                        contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px' }}
                        itemStyle={{ color: activeColor, fontSize: 11, fontWeight: 800 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase' }}
                        formatter={(v: number) => [`${v}/1000`, t('Score','Score')]}
                      />
                      <Area type="monotone" dataKey="score" stroke={activeColor} strokeWidth={2} fill="url(#priceGradCS)" dot={{ fill: activeColor, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key rule */}
              <div className="border border-white/5 bg-white/[0.01] p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Zap size={12} className="text-accent-gold" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-gold/70">{t('The LYA Rule', 'La Règle LYA')}</p>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  {t(
                    'Each validated milestone raises a project\'s LYA Score. Each unresolved risk lowers it. The Score is a live, transparent indicator of a project\'s certified quality — not a price.',
                    'Chaque jalon validé fait progresser le Score LYA d\'un projet. Chaque risque non résolu le fait baisser. Le Score est un indicateur vivant et transparent de la qualité certifiée d\'un projet — pas un prix.'
                  )}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsModelizerOpen(true)}
                className="w-full py-4 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3 group"
              >
                <Cpu size={14} className="group-hover:rotate-12 transition-transform" />
                {t('Tester avec le Modélisateur', 'Test with the Modélisateur')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODÉLISATEUR MODAL ─────────────────────────────────── */}

      {/* LYA Mathematical Modelizer Modal — Portal renders at body level to avoid transform stacking */}
         {typeof document !== 'undefined' && createPortal(
         <AnimatePresence mode="sync">
           {isModelizerOpen && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.88)' }}
               onClick={(e) => { if (e.target === e.currentTarget) setIsModelizerOpen(false); }}
             >
               <motion.div 
                 initial={{ scale: 0.93, y: 15 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.93, y: 15 }}
                 className="bg-[#0a0f18] border border-primary-cyan/20 max-w-5xl w-full relative shadow-[0_0_80px_rgba(0,224,255,0.15)] rounded-2xl flex flex-col text-left"
                 style={{ maxHeight: 'calc(100vh - 24px)', zIndex: 10000 }}
                 onClick={(e) => e.stopPropagation()}
               >
                 {/* Sticky Header */}
                 <div className="flex-shrink-0 px-6 md:px-10 pt-6 pb-4 border-b border-white/10 relative bg-[#0a0f18] rounded-t-2xl">
                   <button 
                     onClick={() => setIsModelizerOpen(false)}
                     className="absolute top-4 right-4 text-white/50 hover:text-primary-cyan hover:bg-white/5 p-2 rounded-full transition-all z-10"
                     title={t('Close Modal', 'Fermer')}
                   >
                     <X size={20} />
                   </button>
                   <div className="flex items-center gap-3 text-primary-cyan mb-1 animate-pulse flex-wrap">
                     <Cpu size={18} />
                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase">{t('LYA CONSTRUCT ENGINE V4.2', 'MOTEUR DE SIMULATION LYA V4.2')}</span>
                   </div>
                   <h2 className="text-xl md:text-3xl font-black font-headline text-white uppercase tracking-tight text-justify">
                     {t('ALGORITHMIC MODELIZER:', 'MODÉLISATEUR ALGORITHMIQUE :')}{' '}
                     <span className="text-primary-cyan">{selectedContract.name}</span>
                   </h2>
                   <p className="text-xs text-white/40 uppercase tracking-wider mt-1 text-justify">
                     {t('Interactively adjust the certification parameters below to see how milestones and committee validation impact the LYA Score.', 'Ajustez les paramètres de certification pour visualiser l\'impact des jalons et de la validation comité sur le Score LYA.')}
                   </p>
                 </div>

                 {/* Scrollable Body */}
                 <div className="flex-1 overflow-y-auto overscroll-contain">
                 <div className="px-6 md:px-10 py-6">
                 {/* Main Grid Content */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                   {/* Left Controls Column (Sliders) */}
                   <div className="lg:col-span-7 space-y-6">
                     <div className="bg-white/[0.02] border border-white/5 p-5 rounded-lg font-sans">
                       <h3 className="text-xs font-black uppercase text-accent-gold tracking-widest mb-4 flex items-center gap-2">
                         <Award size={14} />
                         {t('EXPERT COMMITTEE EVALUATION', 'ÉVALUATION DU COMITÉ D\'EXPERTS')}
                       </h3>
                       <div className="space-y-4">
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-black tracking-wider mb-2">
                             <span>{t('Committee Base Score', 'Score de Base du Comité')} (Scomite)</span>
                             <span className="text-accent-gold font-mono">{demoCommitteeScore} / 1000</span>
                           </div>
                           <input 
                             type="range" 
                             min="200" 
                             max="1000" 
                             step="10"
                             value={demoCommitteeScore} 
                             onChange={(e) => setDemoCommitteeScore(parseInt(e.target.value))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                           />
                           <p className="text-[10px] text-white/45 uppercase tracking-widest mt-1.5 leading-relaxed text-justify">
                             {t('The consolidated score assigned by professional legal and creative validators.', 'Le score consolidé attribué par les validateurs professionnels juridiques et créatifs de l\'industrie.')}
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 p-5 rounded-lg space-y-6 font-sans border-t-2 border-t-primary-cyan/40">
                       <h3 className="text-xs font-black uppercase text-primary-cyan tracking-widest flex items-center gap-2">
                         <Layers size={14} />
                         {t('AUTONOMOUS ANALYSIS PILLARS', 'PILLIERS D\'INDEXATION AUTONOMES')}
                       </h3>

                       {/* Pillars Sliders inside Grid */}
                       <div className="space-y-5">
                         {/* Quality */}
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-1">
                             <span>{t('IC · Conceptual Integrity', 'IC · Intégrité Conceptuelle')}</span>
                             <span className="text-primary-cyan font-mono">{demoPillars.quality} / 200</span>
                           </div>
                           <input 
                             type="range" 
                             min="50" 
                             max="200" 
                             value={demoPillars.quality} 
                             onChange={(e) => setDemoPillars(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-cyan"
                           />
                         </div>

                         {/* Marketability */}
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-1">
                             <span>{t('MA · Current Maturity', 'MA · Maturité Actuelle')}</span>
                             <span className="text-accent-pink font-mono">{demoPillars.marketability} / 200</span>
                           </div>
                           <input 
                             type="range" 
                             min="50" 
                             max="200" 
                             value={demoPillars.marketability} 
                             onChange={(e) => setDemoPillars(prev => ({ ...prev, marketability: parseInt(e.target.value) }))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
                           />
                         </div>

                         {/* Compliance */}
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-1">
                             <span>{t('FR · Real Feasibility', 'FR · Faisabilité Réelle')}</span>
                             <span className="text-emerald-400 font-mono">{demoPillars.security} / 200</span>
                           </div>
                           <input 
                             type="range" 
                             min="50" 
                             max="200" 
                             value={demoPillars.security} 
                             onChange={(e) => setDemoPillars(prev => ({ ...prev, security: parseInt(e.target.value) }))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                           />
                         </div>

                         {/* Innovation */}
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-1">
                             <span>{t('CE · Evolution Capacity', 'CE · Capacité d\'Évolution')}</span>
                             <span className="text-accent-purple font-mono">{demoPillars.innovation} / 200</span>
                           </div>
                           <input 
                             type="range" 
                             min="50" 
                             max="200" 
                             value={demoPillars.innovation} 
                             onChange={(e) => setDemoPillars(prev => ({ ...prev, innovation: parseInt(e.target.value) }))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                           />
                         </div>

                         {/* Growth */}
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-1">
                             <span>{t('IN · Embodiment', 'IN · Incarnation')}</span>
                             <span className="text-accent-gold font-mono">{demoPillars.growth} / 200</span>
                           </div>
                           <input 
                             type="range" 
                             min="50" 
                             max="200" 
                             value={demoPillars.growth} 
                             onChange={(e) => setDemoPillars(prev => ({ ...prev, growth: parseInt(e.target.value) }))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                           />
                         </div>
                       </div>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 p-5 rounded-lg font-sans">
                       <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest mb-4 flex items-center gap-2">
                         <CheckCircle2 size={14} />
                         {t('OPERATIONAL MILESTONES SECURED', 'JALONS OPÉRATIONNELS SÉCURISÉS')}
                       </h3>
                       <div className="space-y-4">
                         <div>
                           <div className="flex justify-between text-xs text-white/70 uppercase font-bold tracking-wider mb-2">
                             <span>{t('Milestones Succeeded', 'Jalons Réussis')}</span>
                             <span className="text-emerald-400 font-mono">{demoMilestones} / 5</span>
                           </div>
                           <input 
                             type="range" 
                             min="0" 
                             max="5" 
                             step="1"
                             value={demoMilestones} 
                             onChange={(e) => setDemoMilestones(parseInt(e.target.value))}
                             className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                           />
                           <p className="text-[10px] text-white/45 uppercase tracking-widest mt-1.5 leading-relaxed text-justify">
                             {t('Each validated milestone contributes to the project\'s LYA Score through our certification methodology.', 'Chaque jalon validé contribue au Score LYA du projet selon notre méthodologie de certification.')}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Side Live Results */}
                   <div className="lg:col-span-5 flex flex-col gap-6">
                     <div className="bg-primary-cyan/5 border border-primary-cyan/25 p-6 rounded-lg shadow-2xl space-y-6">
                       <div className="text-center font-black py-2 tracking-[0.2em] font-mono text-[10px] text-primary-cyan uppercase bg-primary-cyan/10 border border-primary-cyan/10 rounded-sm">
                         {t('SIMULATION REAL-TIME PREVIEW', 'APERÇU DE SIMULATION TEMPS-RÉEL')}
                       </div>

                       {/* Formula Steps */}
                       <div className="font-mono text-[10px] space-y-4 text-white/60 text-left">
                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('1. AUTONOMOUS ASSESSMENT', '1. EVALUATION AUTONOME (Sauto)')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             {demoPillars.quality} + {demoPillars.marketability} + {demoPillars.security} + {demoPillars.innovation} + {demoPillars.growth} = <span className="text-white font-bold">{demoSAuto} / 1000</span>
                           </div>
                         </div>

                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('2. WEIGHTED BASE MODEL', '2. SCORE LYA DE BASE COMPOSÉ (LYA0)')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             <span className="text-white/40">{t('Committee + Self-assessment', 'Comité + Auto-évaluation')}</span> = <span className="text-white font-bold">{demoLyaScoreCombined} / 1000</span>
                           </div>
                         </div>

                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('3. MILESTONE BONUS', '3. BONUS DE JALONS')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             {demoMilestones} {t('milestone(s) validated', 'jalon(s) validé(s)')} = <span className="text-white text-emerald-400 font-bold">+{demoMilestoneBonusPercent.toFixed(2)}%</span>
                           </div>
                         </div>
                       </div>

                       {/* Live Outputs Gauges */}
                       <div className="pt-4 border-t border-white/10 space-y-4 text-left">
                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{t('PROGECTED LYA SCORE', 'SCORE LYA PROJETÉ')}</span>
                             <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">CONSOLIDATED RATING</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-white">{demoLyaScoreCombined} <span className="text-[10px] opacity-40 font-mono ml-1">/1000</span></div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-primary-cyan tracking-widest">{t('CERTIFICATION TIER', 'NIVEAU DE CERTIFICATION')}</span>
                             <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{t('COMMITTEE CONFIDENCE', 'CONFIANCE DU COMITÉ')}</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-primary-cyan">{demoLyaScoreCombined >= 700 ? t('High', 'Élevé') : demoLyaScoreCombined >= 400 ? t('Moderate', 'Modéré') : t('Early', 'Précoce')}</div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{t('SUPPORTING PATRONS', 'MÉCÈNES SOUTIENS')}</span>
                             <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{t('COMMUNITY SIZE', 'TAILLE DE COMMUNAUTÉ')}</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-emerald-400">{Math.round(demoLyaScoreCombined * 3.2).toLocaleString()}</div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-accent-gold tracking-widest">{t('MILESTONE PROGRESS', 'AVANCEMENT DES JALONS')}</span>
                             <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{t('COMPLETION RATE', 'TAUX DE COMPLÉTION')}</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-accent-gold">{demoRentScore}%</div>
                         </div>
                       </div>

                       {/* Buttons in simulator */}
                       <div className="pt-2 flex gap-4">
                         <button 
                           onClick={handleApplyModel}
                           className="w-full py-3 bg-primary-cyan font-black text-black uppercase tracking-widest text-xs hover:bg-white hover:scale-[1.02] transition-colors rounded-sm active:scale-95"
                         >
                           {t('APPLY MODEL', 'APPLIQUER LA SIMULATION')}
                         </button>
                         <button 
                           onClick={() => {
                             const currentPillars = selectedContract.pillars || [];
                             setDemoPillars({
                               quality: currentPillars[0]?.score || 180,
                               marketability: currentPillars[1]?.score || 175,
                               security: currentPillars[2]?.score || 190,
                               innovation: currentPillars[3]?.score || 165,
                               growth: currentPillars[4]?.score || 185
                             });
                             setDemoCommitteeScore(selectedContract.totalScore || 850);
                             setDemoMilestones(selectedContract.growth ? Math.min(5, Math.ceil(selectedContract.growth / 10)) : 3);
                           }}
                           className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-sm"
                           title={t('Reset to baseline', 'Réinitialiser')}
                         >
                           <RefreshCw size={14} className="text-white/60" />
                         </button>
                       </div>
                     </div>
                     <p className="text-xs font-mono text-white/30 text-center leading-relaxed uppercase tracking-widest">
                       {t('* ANALYTICAL PROJECTIONS BASED ON ACTIVE LYA CERTIFICATION FORMULAS. NON-CONTRACTUAL ILLUSTRATION.', '* SIMULATIONS ESTIMATIVES BASÉES EN TEMPS-RÉEL SUR LES FORMULES DE CERTIFICATION DU LYA SYSTEME. NON-CONTRACTUEL.')}
                     </p>
                   </div>
                 </div>
                 </div>
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>,
             document.body
           )}
    </section>
  );
};

const ProjectSlider = ({ onNav }: { onNav: (v: View) => void }) => {
  const { t } = useTranslation();
  const projects = [
    CONTRACTS[0], // RENAISSANCE REBORN
    CONTRACTS[1], // SKY GARDENS
    CONTRACTS[2], // THE FUTURE VOICE
    CONTRACTS[3], // CHRONOS_V3
  ];

  return (
    <div id="discover-projects" className="relative w-full overflow-hidden py-10 mt-12 lg:mt-0 flex items-center min-h-[400px] sm:min-h-[450px]">
      <div className="flex gap-8 animate-marquee">
        {[...projects, ...projects, ...projects].map((p, i) => (
          <div key={i} className="min-w-[320px] h-[550px]">
            <ContractCard 
              contract={p} 
              onSelect={() => onNav('REGISTRY')} 
            />
          </div>
        ))}
      </div>
      <div className="absolute left-0 top-0 h-full w-12 md:w-40 bg-gradient-to-r from-surface-dim to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-12 md:w-40 bg-gradient-to-l from-surface-dim to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ user, onViewChange, liveContracts = CONTRACTS }) => {

  const { t, language } = useTranslation();
  const [showLegalPopup, setShowLegalPopup] = useState(false);

  return (
    <div className="relative min-h-screen bg-surface-dim overflow-x-hidden">
      {/* Legal Popup Modal */}
      <AnimatePresence mode="sync">
        {showLegalPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-high border border-red-500/30 max-w-2xl w-full p-8 md:p-5 sm:p-8 lg:p-12 relative shadow-[0_0_100px_rgba(239,68,68,0.2)]"
            >
              <button 
                onClick={() => setShowLegalPopup(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                  {t('REGULATORY DISCLOSURE & LYA LIMITATIONS', 'DIVULGATION RÉGLEMENTAIRE ET LIMITES DU LYA SYSTEME')}
                </h2>
                <div className="h-[2px] w-24 bg-red-500 mb-8" />
                <p className="text-base md:text-lg text-on-surface-variant font-bold leading-relaxed mb-8 text-justify">
                  {t('LYA Score certifications are objective quality indicators and do NOT constitute shares, financial securities, or regulated investment products. The LinkYourArt Protocol acts solely as a certification and patronage-matching layer.', 'Les certifications Score LYA sont des indicateurs de qualité objectifs et ne constituent PAS des actions, des titres financiers ou des produits d\'investissement réglementés. Le protocole LinkYourArt agit uniquement en tant que couche de certification et de mise en relation de mécénat.')}
                </p>
                <p className="text-sm text-on-surface-variant opacity-70 mb-10 text-justify">
                  {t('LinkYourArt acts as a trusted third party for analysis and valuation. No promise of performance is guaranteed. The value can evolve based on objective indicators documented in real-time.', 'LinkYourArt agit en tant que tiers de confiance pour l\'analyse et la valorisation. Aucune promesse de performance n\'est garantie. La valeur peut évoluer selon des indicateurs objectifs documentés en temps réel.')}
                </p>
                <button 
                  onClick={() => setShowLegalPopup(false)}
                  className="px-12 py-4 bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-surface-dim transition-all active:scale-95 shadow-2xl"
                >
                  {t('I UNDERSTAND', 'JE COMPRENDS')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="project-section" className="relative z-10 pt-12 md:pt-16 lg:pt-20 pb-12 lg:pb-20 overflow-hidden flex items-center min-h-[max(400px,60vh)]">
        {/* Global Background Logo Animation - RESTORED AND ENHANCED */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: [0.1, 0.6, 0.1], 
                  scale: [1, 1.4, 1],
                  rotate: [0, 8, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <Logo size={4000} color="multi" className="blur-[130px] opacity-100" />
              </motion.div>
            </div>
          </div>
          {/* Sweeping accent */}
          <motion.div 
            animate={{ 
              x: ['-100%', '100%'],
              opacity: [0, 0.4, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 left-0 w-full h-[800px] bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent blur-[160px] transform -skew-x-12"
          />
        </div>

        <div className="max-w-full max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-5 sm:p-8 lg:p-12 items-center">
            <div
              className="text-left z-20 relative pt-2 md:pt-4 lg:pt-6 max-w-[45vw] sm:max-w-[42vw] lg:max-w-full"
            >
              <div className="relative mb-4 sm:mb-8 lg:mb-12">
                <h1 style={{ fontSize: 'clamp(1.6rem, 6.5vw, 9rem)' }} className="font-black tracking-tighter leading-[0.88] uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {t('ART NEED A', 'L\'ART A BESOIN D\'UN')}<br/>
                  <span className="text-primary-cyan drop-shadow-[0_0_80px_rgba(0,224,255,0.6)] font-black">{t('STANDARD.', 'STANDARD.')}</span>
                </h1>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg text-white max-w-3xl mb-4 sm:mb-6 lg:mb-8 font-black uppercase tracking-tight leading-tight drop-shadow-lg">
                "{t('LINKYOURART UNITES CREATORS, PATRONS, INDUSTRY & AUDIENCES—POWERING TOMORROW’S MASTERPIECES.', 'LINKYOURART UNIT CRÉATEURS, MÉCÈNES, INDUSTRIE ET PUBLICS—PROPULSANT LES CHEFS-D\'ŒUVRE DE DEMAIN.')}"
              </p>

              <p className="text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl text-on-surface-variant max-w-3xl mb-6 lg:mb-8 xl:mb-12 font-medium leading-relaxed opacity-90 border-l-4 lg:border-l-8 border-primary-cyan pl-6 lg:pl-10 py-2 lg:py-3">
                "{t('From project submission to certified recognition, navigate a secure ecosystem built on artistic excellence and creative transparency.', 'De la soumission du projet à la reconnaissance certifiée, naviguez dans un écosystème sécurisé bâti sur l\'excellence artistique et la transparence créative.')}"
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4 sm:mb-8 lg:mb-12 w-full sm:w-auto">
                <button
                  onClick={() => onViewChange('MECENAT')}
                  className="w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.25em] text-[11px] rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_40px_rgba(0,224,255,0.35)] hover:shadow-[0_0_60px_rgba(0,224,255,0.55)] hover:scale-105 transition-all active:scale-95"
                >
                  <span>🏛</span>
                  {t('POPULAR PATRONAGE (SIMPLE)', 'MÉCÉNAT POPULAIRE (SIMPLE)')}
                </button>
                <button
                  onClick={() => onViewChange('REGISTRY')}
                  className="w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/50 text-white font-black uppercase tracking-[0.25em] text-[11px] rounded-xl flex items-center justify-center gap-2.5 bg-white/4 hover:bg-white/8 transition-all active:scale-95 group"
                >
                  {t('LYA REGISTRY (PRO)', 'REGISTRE LYA (PRO)')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Enhanced Action Buttons Group */}
              <div className="flex flex-wrap gap-3 pt-4">
                <motion.button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-concept-tutorial'))}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(0, 224, 255, 0.15)', boxShadow: '0 0 30px rgba(0, 224, 255, 0.2)' }}
                  className="px-6 py-3.5 bg-primary-cyan/[0.07] border border-primary-cyan/30 hover:border-primary-cyan rounded-xl backdrop-blur-md flex items-center gap-2.5 transition-all group text-white font-black"
                >
                  <Info size={14} className="text-primary-cyan group-hover:rotate-6 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('How it Works', 'Comment ça marche')}</span>
                </motion.button>
                
                <motion.button 
                  onClick={() => setShowLegalPopup(true)}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(245, 158, 11, 0.12)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)' }}
                  className="px-6 py-3.5 bg-amber-500/[0.05] border border-amber-500/20 hover:border-amber-500 rounded-xl backdrop-blur-md flex items-center gap-2.5 transition-all group text-amber-500 font-black"
                >
                  <Shield size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('Legal Advisory', 'Conseil Légal')}</span>
                </motion.button>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative z-20 flex flex-col justify-center h-full"
            >
              <ProjectSlider onNav={onViewChange} />
            </motion.div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      {/* Real-Time Valuation Section */}
      <RealTimeValuation liveContracts={liveContracts} />

      <BrushSeparator />

      {/* Concept / Vision Section - ENHANCED */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -left-10 top-0 w-1 h-24 bg-primary-cyan hidden lg:block" />
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-black">{t('The Vision', 'La Vision')}</div>
              <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-8 leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {t('A NEW ERA', 'UNE NOUVELLE ÈRE')} <br />
                <span className="text-primary-cyan">{t('FOR CREATIVE', 'POUR LA CRÉATION')}</span> <br />
                {t('EXCELLENCE.', 'ARTISTIQUE.')}
              </h2>
              <div className="space-y-6">
                <p className="text-xl text-on-surface-variant leading-relaxed opacity-90 font-medium text-justify">
                  {t('Creative projects have always had value. LinkYourArt gives them a recognized, shareable and verifiable one. For the first time, art has an objective standard that can be certified, supported and followed over time.', 'Les projets créatifs ont toujours eu de la valeur. LinkYourArt leur en donne une reconnue, partageable et vérifiable. Pour la première fois, l\'art dispose d\'un standard objectif qui peut être certifié, soutenu et suivi dans le temps.')}
                </p>
                <div className="p-6 bg-white/5 border-l-4 border-primary-cyan">
                  <p className="text-base text-white opacity-80 leading-relaxed text-justify">
                    "{t('We do not just support projects; we create a living ecosystem where the quality of every creative work is scored, certified, and visible to the world — in real time, for everyone.', 'Nous ne soutenons pas seulement des projets ; nous créons un écosystème vivant où la qualité de chaque œuvre créative est scorée, certifiée et visible par tous — en temps réel, pour chacun.')}"
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative">
              {/* Decorative elements */}
              <div className="absolute -inset-10 bg-primary-cyan/5 blur-[100px] rounded-full pointer-events-none" />
              
              {[
                { 
                  id: '01', 
                  title: t('Certified Registry', 'Registre Certifié'), 
                  desc: t('Each creative work is officially registered and protected. Your rights are documented, verified and accessible at any time.', 'Chaque œuvre est officiellement enregistrée et protégée. Vos droits sont documentés, vérifiés et accessibles à tout moment.'),
                  icon: <Shield size={24} />
                },
                { 
                  id: '02', 
                  title: t('Expert Valuation', 'Évaluation par des Experts'), 
                  desc: t('A network of certified professionals evaluates each creation and assigns a LYA Score out of 1000 — transparent and objective.', 'Un réseau de professionnels certifiés évalue chaque création et lui attribue un LYA Score sur 1000 — transparent et objectif.'),
                  icon: <Activity size={24} />
                },
                { 
                  id: '03', 
                  title: t('Creative Patronage', 'Mécénat Créatif'), 
                  desc: t('Support creative projects you believe in and follow their certified progress. Your patronage evolves alongside the project\'s milestones.', 'Soutenez des projets créatifs auxquels vous croyez et suivez leur avancement certifié. Votre mécénat évolue avec les jalons du projet.'),
                  icon: <Zap size={24} />
                },
                { 
                  id: '04', 
                  title: t('Legal Protection', 'Protection Juridique'), 
                  desc: t('Every project on LinkYourArt benefits from legal protection of rights recognized in 6 continents.', 'Chaque projet sur LinkYourArt bénéficie d\'une protection juridique des droits reconnue sur 6 continents.'),
                  icon: <Scale size={24} />
                }
              ].map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-surface-low border border-white/5 group hover:border-primary-cyan/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <span className="text-6xl font-black">{item.id}</span>
                  </div>
                  <div className="w-12 h-12 bg-primary-cyan/10 rounded-xl flex items-center justify-center text-primary-cyan mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-black text-white uppercase mb-3 group-hover:text-primary-cyan transition-colors">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity text-justify">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />


      {/* Comparison Section: What we are vs What we are not */}
      <section className="relative z-10 py-32 px-6 bg-surface-low/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {t('home.not_lya.title', 'What LinkYourArt')} <span className="text-primary-cyan">{t('home.not_lya.title_cyan', 'is and is NOT')}</span>
            </h2>
            <p className="text-on-surface-variant text-base max-w-2xl mx-auto opacity-75">
              {t('Compare the structural advantages of the LYA Contractual Protocol against legacy creative industry intermediaries: labels, agents, studios, and classic crowdvalorisation.', "Comparez la structure innovante de l'Protocole Contractuel LYA face aux intermédiaires traditionnels des industries créatives : labels, agents, studios, et plateformes de systèmes traditionnels.")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="hidden lg:block overflow-hidden border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-white/50 w-1/4">{t('CRITERIA', 'PILIER DE COMPARAISON')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-primary-cyan bg-primary-cyan/5 w-1/3 border-x border-white/10">{t('LINKYOURART LYA SYSTEM', 'CORE LYA SYSTEME LINKYOURART')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-rose-400 w-1/4">{t('TRADITIONAL INTERMEDIARIES', 'INTERMÉDIAIRES TRADITIONNELS')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-white/30 w-1/4">{t('CLASSIC CROWDFUNDING', 'CROWDFUNDING CLASSIQUE')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Quality Standard', 'Standard de Qualité')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('LYA Score Certification', 'Certification Score LYA')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Objective, algorithmic + committee-reviewed score out of 1000, tracked over time on the public registry.', 'Score objectif sur 1000, croisant analyse algorithmique et revue par comité, suivi dans le temps sur le registre public.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Exclusive rights locked by majors', 'Droits exclusifs réservés aux majors')}</span>
                    {t('Labels, studios, publishers and agents decide who gets recognition, with no transparent or objective standard.', 'Labels, studios, éditeurs et agents décident seuls de la reconnaissance, sans standard transparent ni objectif.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('No quality standard', 'Aucun standard de qualité')}</span>
                    {t('Any project can be listed with no independent evaluation of its creative merit or progress.', 'N\'importe quel projet peut être publié sans évaluation indépendante de son mérite créatif ou de son avancement.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Recognition & Community', 'Reconnaissance & Communauté')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Certified Patron Considerations', 'Contreparties de Mécène Certifié')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Patrons receive credit mentions, early access and exclusive updates — personal, non-financial, non-transferable.', 'Les mécènes reçoivent mention au générique, accès anticipé et mises à jour exclusives — personnelles, non-financières, non cessibles.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('No public recognition', 'Aucune reconnaissance publique')}</span>
                    {t('Rights locked in long-term contracts with labels, agents or studios. No public trace of who backed the work.', 'Droits bloqués dans des contrats longue durée chez les labels, agents ou studios. Aucune trace publique de qui a soutenu l\'œuvre.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Symbolic rewards only', 'Récompenses symboliques seules')}</span>
                    {t('Generic rewards (t-shirts, digital copies) disconnected from the project\'s actual certified progress.', 'Récompenses génériques (t-shirts, copies numériques) déconnectées de l\'avancement réellement certifié du projet.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Score & Milestones', 'Score & Jalons')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Algorithmic + Committee Tracker', 'Suivi Algorithmique + Comité')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('The LYA Score moves strictly based on certified, verified roadmap milestones — never on speculation.', 'Le Score LYA évolue strictement selon des jalons de feuille de route certifiés et vérifiés — jamais par spéculation.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Opaque discretionary decisions', 'Décisions discrétionnaires opaques')}</span>
                    {t('Recognition imposed by majors, agents or distributors based on opaque and unverifiable criteria.', 'Reconnaissance imposée par les majors, agents ou diffuseurs selon des critères opaques et non vérifiables.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Unmonitored progress', 'Aucun suivi structuré')}</span>
                    {t('Regardless of a project\'s actual progress or setbacks, there is no structured, ongoing quality indicator.', 'Quel que soit l\'avancement réel ou les difficultés d\'un projet, aucun indicateur de qualité structuré et continu n\'existe.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Accessibility', 'Accessibilité')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Open Certification, Free to Explore', 'Certification Ouverte, Accessible à tous')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Democratizing creative quality certification across all sectors: music, film, fashion, gaming, architecture, design and more.', 'Démocratisation de la certification créative pour tous les secteurs : musique, cinéma, mode, jeux vidéo, architecture, design et bien plus.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                     <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Elitist entry cost only', 'Ticket d\'accès élitiste')}</span>
                     {t('Access reserved for creators signed by majors, agencies or studios. Independent creators are structurally excluded.', 'Accès réservé aux créateurs signés par les majors, agences ou studios. Les créateurs indépendants sont structurellement exclus.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Siloed platform profiles', 'Profils cloisonnés')}</span>
                    {t('No registry, no certified standard tracking progress and quality beyond a single campaign.', 'Aucun registre, aucun standard certifié suivant l\'avancement et la qualité au-delà d\'une seule campagne.')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Simple Grid fallback for Mobile/Tablet */}
          <div className="grid md:grid-cols-2 lg:hidden gap-8">
            <div className="p-8 rounded-3xl border border-primary-cyan/20 bg-primary-cyan/[0.02]/30 space-y-4">
              <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest block bg-primary-cyan/10 w-fit px-3 py-1 rounded-full">{t('WHAT WE ARE', 'CE QUE LINKYOURART EST')}</span>
              <ul className="space-y-4 text-xs text-left">
                <li>
                  <strong className="text-white uppercase block text-[10px] tracking-wider mb-1">⚡ {t('OBJECTIVE CERTIFICATION', 'CERTIFICATION OBJECTIVE')}</strong>
                  <span className="text-white/70 leading-relaxed">{t('The LYA Score is a live, transparent quality indicator, moving strictly with verified milestone achievements.', 'Le Score LYA est un indicateur de qualité vivant et transparent, qui évolue strictement selon les jalons vérifiés.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white uppercase block text-[10px] tracking-wider mb-1">🔄 {t('CERTIFIED PATRON RECOGNITION', 'RECONNAISSANCE MÉCÈNE CERTIFIÉ')}</strong>
                  <span className="text-white/70 leading-relaxed">{t('Every patron gets a public, traceable badge of support recorded on the LYA Registry.', 'Chaque mécène obtient un badge de soutien public et traçable, inscrit sur le Registre LYA.')}</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl border border-rose-500/10 bg-surface-dim space-y-4">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block bg-rose-500/10 w-fit px-3 py-1 rounded-full">{t('WHAT WE ARE NOT (COMPETITION)', 'CE QUE NE SONT PAS LES AUTRES')}</span>
              <ul className="space-y-4 text-xs text-left">
                <li>
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('CLASSIC EXCLUSIONS', 'EXCLUSIONS CLASSIQUES')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Traditional intermediaries (labels, agents, studios) decide who gets recognized, with no transparency or objective standard for creators.', 'Les intermédiaires traditionnels (labels, agents, studios) décident seuls de la reconnaissance, sans transparence ni standard objectif pour les créateurs.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('NO QUALITY STANDARD', 'AUCUN STANDARD DE QUALITÉ')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Classic crowdfunding platforms provide no independent quality certification — any project can be listed regardless of merit.', 'Les plateformes de financement participatif classiques n\'offrent aucune certification de qualité indépendante — tout projet peut être publié quel que soit son mérite.')}</span>
                </li>
              </ul>
            </div>
          </div>
          </div>{/* overflow-x-auto */}
        </div>
      </section>

      <BrushSeparator />

      {/* The Ecosystem Section */}
      <section className="relative z-10 py-10 md:py-24 lg:py-10 md:py-24 lg:py-40 max-w-full max-w-7xl mx-auto px-6">
        <div className="text-center mb-6 md:mb-14 lg:mb-8 md:mb-16 lg:mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('THE', 'LES')} <span className="text-primary-cyan">{t('FOUR SPHERES', 'QUATRE SPHÈRES')}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto text-justify">
            {t('home.pillars.subtitle', 'LinkYourArt réunit les acteurs majeurs de l\'économie créative et le public dans un écosystème unique, sécurisé et transparent.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6 md:mb-14 lg:mb-8 md:mb-16 lg:mb-24 items-stretch">
          {[
            {
              icon: <Users size={22} />,
              styles: { card: 'hover:border-primary-cyan/30', glow: 'bg-primary-cyan/5 group-hover:bg-primary-cyan/10', icon: 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20', badge: 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20' },
              titleFR: 'Créateurs', titleEN: 'Creators',
              descFR: "Le cœur de l'écosystème. Soumettez votre projet, obtenez un Score LYA certifié, et construisez votre réputation créative sur le registre public.",
              descEN: 'The heart of the ecosystem. Submit your project, receive a certified LYA Score, and build your creative reputation on the public registry.',
              badgesFR: ['Score /1000', 'Contrôle total', 'Jalons live'],
              badgesEN: ['Score /1000', 'Full control', 'Live milestones'],
            },
            {
              icon: <TrendingUp size={22} />,
              styles: { card: 'hover:border-accent-gold/30', glow: 'bg-accent-gold/5 group-hover:bg-accent-gold/10', icon: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20', badge: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' },
              titleFR: 'Mécènes', titleEN: 'Patrons',
              descFR: 'Soutenez la prochaine génération de projets créatifs. Suivez les projets certifiés et recevez des contreparties de reconnaissance pour votre soutien.',
              descEN: 'Support the next generation of creative projects. Follow certified projects and receive recognition-based considerations for your support.',
              badgesFR: ['Crédit visible', 'Accès anticipé', 'Badge mécène'],
              badgesEN: ['Credited', 'Early access', 'Patron badge'],
            },
            {
              icon: <ShieldCheck size={22} />,
              styles: { card: 'hover:border-emerald-400/30', glow: 'bg-emerald-400/5 group-hover:bg-emerald-400/10', icon: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
              titleFR: 'Professionnels', titleEN: 'Professionals',
              descFR: 'Les garants de la certification LYA. Un réseau de validateurs évalue chaque création sur les 5 piliers, garantissant une intégrité créative authentique.',
              descEN: 'The guarantors of LYA certification. A network of validators assesses each creation across 5 pillars, ensuring genuine creative integrity.',
              badgesFR: ['Badge validateur', 'Accès prioritaire', 'Réseau certifié'],
              badgesEN: ['Validator badge', 'Priority access', 'Certified network'],
            },
            {
              icon: <Eye size={22} />,
              styles: { card: 'hover:border-primary-cyan/30', glow: 'bg-primary-cyan/5 group-hover:bg-primary-cyan/10', icon: 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20', badge: 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20' },
              titleFR: 'Le Public', titleEN: 'The Public',
              descFR: 'Découvrez les créations de demain. Explorez le registre, suivez le parcours créatif et contribuez à la croissance des œuvres en lesquelles vous croyez.',
              descEN: "Discover the creations of tomorrow. Explore the registry, follow the creative journey and contribute to the growth of the works you believe in.",
              badgesFR: ['Accès gratuit', 'Alertes live', 'Score communauté'],
              badgesEN: ['Free access', 'Live alerts', 'Community score'],
            },
          ].map((card, i) => (
            <div key={i} className={`bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group transition-all flex flex-col ${card.styles.card}`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl transition-all ${card.styles.glow}`} />
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border mb-6 group-hover:scale-110 transition-transform relative z-10 shrink-0 ${card.styles.icon}`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-black font-headline uppercase tracking-widest mb-4 relative z-10 leading-tight min-h-[2.75rem] flex items-start">
                {language === 'FR' ? card.titleFR : card.titleEN}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify mb-6 relative z-10 min-h-[6.5rem]">
                {language === 'FR' ? card.descFR : card.descEN}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
                {(language === 'FR' ? card.badgesFR : card.badgesEN).map((badge, bi) => (
                  <span key={bi} className={`text-[9px] font-bold uppercase tracking-wide px-2 py-2.5 rounded-sm border text-center leading-tight flex items-center justify-center ${card.styles.badge}`}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Score Formula Section */}
        <div className="mb-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Certification Model', 'Modèle de Certification')}</div>
                  <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {t('home.formula.title', 'The')} <span className="text-primary-cyan">{t('home.formula.title_cyan', 'Score Formula')}</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 font-black">01</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p1.title', 'Creator Submission')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p1.desc', 'The initial project file submitted by the creator at inception.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-primary-cyan to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-accent-pink/10 flex items-center justify-center text-accent-pink border border-accent-pink/20 font-black">02</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p2.title', 'LYA Algorithm Index')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p2.desc', 'Real-time data analysis across 5 critical pillars of project health.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-accent-pink to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-emerald-400/10 border border-emerald-400/20 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-emerald-400/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30 font-black">03</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('Professional Validation', 'Validation Professionnelle')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('A network of industry experts evaluate and assign a certified professional score to each creative project.', 'Un réseau d\'experts du secteur évaluent et attribuent une note certifiée à chaque projet créatif.')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-surface-low border border-white/5 rounded-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/10 via-transparent to-accent-pink/10 animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="text-xs font-mono text-on-surface-variant opacity-40 uppercase tracking-widest mb-4">Project Certification</div>
                  <div className="text-6xl font-black text-white tracking-tighter mb-2">LYA_SCORE</div>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-primary-cyan font-bold">CREATOR</span>
                    <span className="text-white/20">+</span>
                    <span className="text-accent-pink font-bold">ALGO</span>
                    <span className="text-white/20">+</span>
                    <span className="text-emerald-400 font-bold">PRO</span>
                  </div>
                </div>
                {/* Orbital elements */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-white/5 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border border-primary-cyan/10 rounded-full border-dashed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Network Section — refonte sans noms */}
        <div className="mb-16 md:mb-32">
          <div className="text-center mb-8 md:mb-14 px-4">
            <h3 className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('PROFESSIONAL ECOSYSTEM', 'ÉCOSYSTÈME PROFESSIONNEL')}</h3>
            <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {t('A Network Built', 'Un réseau construit')} <span className="text-primary-cyan">{t('Over 20 Years', 'en 20 ans')}</span>
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant/70 max-w-2xl mx-auto leading-relaxed">
              {t(
                'Since 2006, LinkYourArt has cultivated deep institutional relationships across every major creative industry. Our network of certified validators and professional partners spans 14 disciplines worldwide.',
                'Depuis 2006, LinkYourArt a cultivé des relations institutionnelles profondes dans chaque grande industrie créative. Notre réseau de validateurs certifiés et de partenaires professionnels couvre 14 disciplines à l\'échelle mondiale.'
              )}
            </p>
          </div>

          {/* Stats globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 md:mb-14">
            {[
              { value: '20+', labelFR: 'ans de présence\ninstit.', labelEN: 'years of institutional\npresence', color: 'text-accent-gold' },
              { value: '14', labelFR: 'disciplines\ncréatives couvertes', labelEN: 'creative\ndisciplines covered', color: 'text-primary-cyan' },
              { value: '100+', labelFR: 'validateurs\nprofessionnels actifs', labelEN: 'active professional\nvalidators', color: 'text-[#a78bfa]' },
              { value: '6', labelFR: 'continents\nreprésentés', labelEN: 'continents\nrepresented', color: 'text-emerald-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-surface-low/30 border border-white/8 rounded-2xl p-5 text-center"
              >
                <p className={`text-3xl md:text-4xl font-black font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-on-surface-variant/50 font-medium mt-2 uppercase tracking-wider leading-tight whitespace-pre-line">
                  {t(s.labelEN, s.labelFR)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Disciplines créatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎵', labelFR: 'Musique & Audio', labelEN: 'Music & Audio', descFR: 'Labels, éditeurs, compositeurs, droits voisins et catalogues musicaux', descEN: 'Labels, publishers, composers, neighbouring rights and music catalogues', stat: '30+ ans de droits indexés', statEN: '30+ years of indexed rights', color: 'border-[#a78bfa]/25 hover:border-[#a78bfa]/50', dot: 'bg-[#a78bfa]' },
              { icon: '🎬', labelFR: 'Cinéma & Série', labelEN: 'Film & Series', descFR: 'Productions, studios, distributeurs, droits de diffusion et catalogues', descEN: 'Productions, studios, distributors, broadcast rights and catalogues', stat: 'Distribution internationale', statEN: 'International distribution', color: 'border-primary-cyan/25 hover:border-primary-cyan/50', dot: 'bg-primary-cyan' },
              { icon: '👗', labelFR: 'Mode & Luxe', labelEN: 'Fashion & Luxury', descFR: 'Maisons de couture, créateurs indépendants, archives et collections', descEN: 'Fashion houses, independent designers, archives and collections', stat: 'Héritage + création contemporaine', statEN: 'Heritage + contemporary creation', color: 'border-rose-400/25 hover:border-rose-400/50', dot: 'bg-rose-400' },
              { icon: '🎮', labelFR: 'Jeu Vidéo & Tech', labelEN: 'Gaming & Tech', descFR: 'Éditeurs, studios indépendants, IP franchises et contenus numériques', descEN: 'Publishers, indie studios, IP franchises and digital content', stat: 'IP & contenus interactifs', statEN: 'IP & interactive content', color: 'border-emerald-400/25 hover:border-emerald-400/50', dot: 'bg-emerald-400' },
              { icon: '🏛️', labelFR: 'Architecture & Design', labelEN: 'Architecture & Design', descFR: 'Agences, cabinets, objets de design, patrimoine et projets urbains', descEN: 'Agencies, firms, design objects, heritage and urban projects', stat: 'Du concept à la réalisation', statEN: 'From concept to completion', color: 'border-accent-gold/25 hover:border-accent-gold/50', dot: 'bg-accent-gold' },
              { icon: '🎨', labelFR: 'Arts Visuels & Scène', labelEN: 'Visual Arts & Stage', descFR: 'Galeries, artistes, arts performatifs, photographie et installations', descEN: 'Galleries, artists, performing arts, photography and installations', stat: 'Exposition & patrimoine mondial', statEN: 'Exhibition & world heritage', color: 'border-white/15 hover:border-white/30', dot: 'bg-white/60' },
            ].map((disc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className={`group relative bg-surface-low/25 border ${disc.color} rounded-2xl p-5 sm:p-6 transition-all hover:bg-surface-low/40`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl shrink-0">{disc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${disc.dot} animate-pulse shrink-0`} />
                      <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">{t('ACTIF', 'ACTIVE')}</p>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide mb-2">{t(disc.labelEN, disc.labelFR)}</h4>
                    <p className="text-xs text-on-surface-variant/60 leading-relaxed">{t(disc.descEN, disc.descFR)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">{t(disc.statEN, disc.stat)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bas de section — texte institutionnel */}
          <div className="mt-10 md:mt-14 bg-accent-gold/5 border border-accent-gold/15 rounded-2xl p-5 sm:p-8 text-center max-w-3xl mx-auto">
            <p className="text-xs font-black text-accent-gold uppercase tracking-[0.3em] mb-3">✦ {t('COMMITTEE CONFIDENTIALITY', 'CONFIDENTIALITÉ DU COMITÉ')}</p>
            <p className="text-sm md:text-base text-on-surface-variant/70 leading-relaxed">
              {t(
                'Our institutional partners and validators review projects under strict professional agreements. Their individual identity remains confidential to preserve the impartiality of each review — LYA publishes the certification outcome, not the reviewers\' names.',
                'Nos partenaires institutionnels et validateurs examinent les projets sous des accords professionnels stricts. Leur identité individuelle reste confidentielle pour préserver l\'impartialité de chaque évaluation — LYA publie le résultat de la certification, pas le nom des évaluateurs.'
              )}
            </p>
          </div>
        </div>

        <div className="bg-primary-cyan/5 border border-primary-cyan/20 p-5 sm:p-8 lg:p-12 rounded-sm backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row items-center gap-5 sm:p-8 lg:p-12 relative z-10">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-primary-cyan/20 flex items-center justify-center text-primary-cyan border border-primary-cyan/30 rounded-full shadow-[0_0_30px_rgba(0,224,255,0.2)]">
                <span className="text-4xl font-black">LYA</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-[0.2em] mb-4">{t('home.standard.title', 'The LYA')} <span className="text-white">{t('home.standard.title_cyan', 'Score Standard')}</span></h3>
              <p className="text-on-surface-variant text-lg leading-relaxed opacity-80 text-justify">
                {t('home.standard.desc', 'LinkYourArt introduces the unique quality certification standard for the creative market. The LYA Score — from 0 to 1000 points — combines algorithmic analysis and expert committee review to provide the only objective, transparent and public measure of creative quality.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      <section className="relative z-10 py-10 md:py-24 lg:py-10 md:py-24 lg:py-40 max-w-full max-w-7xl mx-auto px-6">
        <div className="text-center mb-6 md:mb-14 lg:mb-8 md:mb-16 lg:mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('home.scoring.title', 'LE SYSTÈME')} <span className="text-primary-cyan">{t('home.scoring.title_cyan', "D'ÉVALUATION LYA")}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto text-justify">
            {t('home.scoring.subtitle', 'Notre algorithme propriétaire évalue chaque projet selon 5 piliers officiels, fournissant un Score LYA objectif et transparent sur 1000.')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: t('home.scoring.c1.label', "IC · Intégrité Conceptuelle"), score: '200', desc: t('home.scoring.c1.desc', "Cohérence et clarté de la vision créative : le projet tient-il sa promesse artistique de bout en bout ?"), color: 'text-primary-cyan', bg: 'bg-primary-cyan/5', border: 'border-primary-cyan/20' },
            { label: t('home.scoring.c2.label', "MA · Maturité Actuelle"), score: '200', desc: t('home.scoring.c2.desc', "État d'avancement réel du projet : ce qui est déjà produit, documenté et vérifiable aujourd'hui."), color: 'text-accent-pink', bg: 'bg-accent-pink/5', border: 'border-accent-pink/20' },
            { label: t('home.scoring.c3.label', "CE · Capacité d'Évolution"), score: '200', desc: t('home.scoring.c3.desc', "Marge de progression du projet : sa capacité à franchir de nouveaux jalons de certification."), color: 'text-accent-green', bg: 'bg-accent-green/5', border: 'border-accent-green/20' },
            { label: t('home.scoring.c4.label', "FR · Faisabilité Réelle"), score: '200', desc: t('home.scoring.c4.desc', "Solidité du plan d'exécution : ressources, calendrier et moyens réunis pour aller au bout."), color: 'text-accent-purple', bg: 'bg-accent-purple/5', border: 'border-accent-purple/20' },
            { label: t('home.scoring.c5.label', "IN · Incarnation"), score: '200', desc: t('home.scoring.c5.desc', "Présence et crédibilité du créateur : son engagement direct et vérifiable dans le projet."), color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' },
          ].map((criterion, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 border ${criterion.border} ${criterion.bg} backdrop-blur-sm relative group overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${criterion.color.replace('text-', 'bg-')} opacity-50`} />
              <div className="flex justify-between items-start mb-6">
                <span className={`text-2xl font-black ${criterion.color}`}>0{i+1}</span>
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Max {criterion.score}</span>
              </div>
              <h3 className="text-sm font-black text-white mb-4 uppercase tracking-tight leading-tight">{criterion.label}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-justify">{criterion.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-base text-on-surface-variant/60 uppercase tracking-[0.2em] max-w-3xl mx-auto leading-relaxed text-justify">
            "{t('The LYA Score is the definitive measure of a creative work\'s maturity — updated at every verified milestone and periodic professional audit.', 'Le Score LYA est la mesure la plus fiable de la maturité d\'une création — mis à jour à chaque jalon vérifié et audit professionnel périodique.')}"
          </p>
        </motion.div>
      </section>

      {/* Removed Redundant Legal Section */}
      
      {/* Final CTA */}
      <section className="relative z-10 py-40 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-20 border border-primary-cyan/20 bg-primary-cyan/5 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan shadow-[0_0_20px_rgba(0,255,255,0.5)]" />
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-8 leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('home.cta.title', 'Start')} <br/>
            <span className="text-primary-cyan">{t('home.cta.title_cyan', 'Engagement')}</span>
          </h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-xl mx-auto opacity-80 text-justify">
            {t('"Your work has value. We certify it. Patrons recognize it."', '"Votre travail a une valeur. Nous la certifions. Des mécènes la reconnaissent."')}
          </p>
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="px-5 py-2 bg-white text-surface-dim font-black uppercase tracking-[0.3em] hover:bg-primary-cyan transition-all shadow-2xl active:scale-95 text-xs"
          >
            {t('home.cta.button', 'Open Dashboard')}
          </button>
          
          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-primary-cyan text-right uppercase">
              LYA_SYSTEM_V4.2 <br/>
              {t('ESTABLISHING_LINK...', 'ÉTABLISSEMENT_DU_LIEN...')}
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};
// cache bust Wed May 27 04:22:53 UTC 2026

