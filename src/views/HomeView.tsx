
import React, { useState } from 'react';
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
  RefreshCw
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
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-primary-cyan" />
              <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest leading-none">{t('Global LYA Index', 'Index Mondial LYA')}</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold leading-none">+0.14%</span>
            </div>
            <div className="w-1.5 h-1.5 bg-primary-cyan/20 rounded-full" />
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-accent-gold" />
              <span className="text-[10px] font-mono text-accent-gold uppercase tracking-widest leading-none">{t('Neural Mesh Status', 'Statut du Maillage Neural')}</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">{t('OPTIMAL', 'OPTIMAL')}</span>
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
      unitValue: number;
      totalValue: number;
      pillars: { label: string; score: number }[];
      growth: number;
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
        unitValue: sim.unitValue,
        totalValue: sim.totalValue,
        totalScore: sim.totalScore,
        growth: sim.growth,
        pillars: sim.pillars
      };
    }
    const growth = selectedContract.growth || 0;
    const baseVal = selectedContract.unitValue || 50.00;
    const currentPrice = Math.round((baseVal * (1 + growth / 100)) * 100) / 100;
    
    // Fallback mapping of pillars format
    const origPillars = selectedContract.pillars || [];
    const mappedPillars = origPillars.map(p => ({
      label: p.label,
      score: p.score
    }));

    return {
      unitValue: currentPrice,
      totalValue: selectedContract.totalValue,
      totalScore: selectedContract.totalScore || 850,
      growth: growth,
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

  const demoProjectedUnitVal = React.useMemo(() => {
    const scoreFactor = demoLyaScoreCombined / 850;
    const milestoneFactor = 1 + (demoMilestoneBonusPercent / 100);
    return Math.round((selectedContract.unitValue || 50.00) * scoreFactor * milestoneFactor * 100) / 100;
  }, [demoLyaScoreCombined, demoMilestoneBonusPercent, selectedContract]);

  const demoProjectedTotalVal = React.useMemo(() => {
    return demoProjectedUnitVal * (selectedContract.totalUnits || 10000);
  }, [demoProjectedUnitVal, selectedContract]);

  const demoRentScore = React.useMemo(() => {
    return Math.min(100, Math.round((demoProjectedUnitVal / (selectedContract.unitValue || 50.00)) * 85));
  }, [demoProjectedUnitVal, selectedContract]);

  const pillarData = activeContractStats.pillars.map(p => ({
    name: p.label,
    value: p.score,
    full: 200
  }));

  const priceHistory = React.useMemo(() => {
    const baseVal = 50.00;
    const growth = Math.max(activeContractStats.growth || 0, 2);
    const currentPrice = Math.max(activeContractStats.unitValue || baseVal, baseVal);
    const months = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'];
    const totalPoints = 12;
    // Simulate realistic price curve: starts at -35% of growth, ends at current price
    const startPrice = baseVal * (1 - (growth * 0.35) / 100);
    return months.map((month, i) => {
      const t = i / (totalPoints - 1);
      // Smooth S-curve interpolation with micro volatility
      const smooth = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const volatility = (Math.sin(i * 2.3 + selectedCaseIdx) * 0.012) * currentPrice;
      const price = startPrice + (currentPrice - startPrice) * smooth + volatility;
      return { date: month, price: Math.round(Math.max(price, baseVal * 0.7) * 100) / 100 };
    });
  }, [activeContractStats, selectedCaseIdx]);

  const escalatedUnitPrice = activeContractStats.unitValue;

  const handleApplyModel = React.useCallback(() => {
    setAppliedSimulation(prev => ({
      ...prev,
      [selectedContract.id]: {
        totalScore: demoLyaScoreCombined,
        unitValue: demoProjectedUnitVal,
        totalValue: demoProjectedTotalVal,
        growth: Math.round(((demoProjectedUnitVal / 50.00) - 1) * 100 * 100) / 100,
        pillars: [
          { label: t('Creative Quality', 'Qualité de la Création'), score: demoPillars.quality },
          { label: t('Market Appeal', 'Potentiel Commercial'), score: demoPillars.marketability },
          { label: t('Legal & IP Security', 'Sécurité Juridique & PI'), score: demoPillars.security },
          { label: t('Technical Innovation', 'Innovation Technique'), score: demoPillars.innovation },
          { label: t('Scale Potential', 'Perspectives d\'Échelle'), score: demoPillars.growth }
        ]
      }
    }));
    setIsModelizerOpen(false);
  }, [selectedContract, demoLyaScoreCombined, demoProjectedUnitVal, demoProjectedTotalVal, demoPillars, t]);

  const handleResetSimulation = React.useCallback((contractId: string) => {
    setAppliedSimulation(prev => ({
      ...prev,
      [contractId]: null
    }));
  }, []);

  const caseStudies = React.useMemo(() => {
    const ren = liveContracts.find(c => c.name === 'RENAISSANCE REBORN');
    const sky = liveContracts.find(c => c.name === 'SKY GARDENS V4');
    const bio = liveContracts.find(c => c.name === 'CHRONICLES OF ELDON');

    return [
      {
        idx: 0,
        title: t('INSTITUTIONAL LIQUIDITY', 'LIQUIDITÉ INSTITUTIONNELLE'),
        subtitle: t('RENAISSANCE REBORN', 'RENAISSANCE REBORN'),
        description: t('Standard physical art masterwork fractioned into 10,000 LYA Unit indexes. The unit price acts as a direct thermometer of active curatorial appreciation.', 'Chef-d\'œuvre physique d\'art classique fractionné en 10 000 unités LYA. Le cours unitaire est le thermomètre direct de l\'appréciation des conservateurs.'),
        icon: <ShieldCheck className="text-primary-cyan" size={32} />,
        metric: ren ? `${ren.growth >= 0 ? '+' : ''}${ren.growth.toFixed(2)}%` : '+14.2%',
        metricLabel: t('YTD GROWTH', 'HAUSSE DE L\'INDEX LYA'),
        baselineProjectVal: 500000,
        currentProjectVal: ren ? ren.totalValue : 571000,
        baselineUnitVal: 50.00,
        currentUnitVal: ren ? ren.unitValue : 57.10,
        jalonPlus: t('Exhibition at Paris Grand Palais validated', 'Validation Exhibition Grand Palais Paris'),
        jalonPlusImpact: '+14.2%',
        jalonMinus: t('Delay in insurance appraisal validation', 'Retard certificat d\'expertise d\'assurance'),
        jalonMinusImpact: '-7.5%'
      },
      {
        idx: 1,
        title: t('REVENUE SHARE DYNAMICS', 'DYNAMIQUE REVENUE SHARE'),
        subtitle: t('SKY GARDENS V4', 'SKY GARDENS V4'),
        description: t('Architectural blueprint royalties distributed as dynamic flux de performance indexes. Price adapts instantly to validated commercial license signings.', 'Redevances de plans d\'architectes distribuées en flux de performance. L\'indice s\'adapte en temps réel aux signatures de licences.'),
        icon: <Activity className="text-accent-gold" size={32} />,
        metric: sky ? `${sky.growth >= 0 ? '+' : ''}${sky.growth.toFixed(2)}%` : '+8.4%',
        metricLabel: t('INDEX PERF', 'PERF DE L\'INDEX LYA'),
        baselineProjectVal: 2500000,
        currentProjectVal: sky ? sky.totalValue : 2710000,
        baselineUnitVal: 50.00,
        currentUnitVal: sky ? sky.unitValue : 54.20,
        jalonPlus: t('Hotel operator licensing contract signed', 'Contrat licence hôtelière internationale signé'),
        jalonPlusImpact: '+8.4%',
        jalonMinus: t('Balcony eco-renovation permit postponed', 'Permis éco-rénovation balcon ajourné'),
        jalonMinusImpact: '-11.0%'
      },
      {
        idx: 2,
        title: t('TV SERIES MASTER IP', 'SCÉNARIO & DROITS DE SÉRIE TV'),
        subtitle: t('CHRONICLES OF ELDON', 'CHRONICLES OF ELDON'),
        description: t('Global broadcasting rights and revenue share metrics for the international sci-fi premium series. Multi-territory SVOD presales, broadcasting signatures, and streaming collection milestones govern direct transfer platform index appreciation.', 'Indexation d\'un projet de série TV internationale. Les signatures de droits de diffusion SVOD et accords de syndication TV mondiaux pilotent la valorisation du cours unitaire.'),
        icon: <Clapperboard className="text-accent-pink" size={32} />,
        metric: bio ? `${bio.growth >= 0 ? '+' : ''}${bio.growth.toFixed(2)}%` : '+32.5%',
        metricLabel: t('MARKET MOVEMENT', 'CONTRAT LYA INITIAL'),
        baselineProjectVal: 1200000,
        currentProjectVal: bio ? bio.totalValue : 1590000,
        baselineUnitVal: 50.00,
        currentUnitVal: bio ? bio.unitValue : 66.25,
        jalonPlus: t('SVOD Season 1 Premiere & Pre-Sales', 'Validation d\'accords majeurs de diffusion SVOD multi-pays'),
        jalonPlusImpact: '+32.5%',
        jalonMinus: t('Post-production VFX rendering delay', 'Retard de livraison des effets spéciaux de post-production'),
        jalonMinusImpact: '-15.8%'
      }
    ];
  }, [liveContracts, t]);


  // Jalons data for each case study
  const CASE_JALONS = [
    // 0 — RENAISSANCE REBORN (Fine Art)
    [
      { type: 'jalon', title: 'Certification Authentification', desc: 'Expertise validée par 3 maisons internationales', scoreFrom: 520, scoreDelta: 80, priceFrom: 50.00 },
      { type: 'risk',  title: 'Retard Assurance Transport', desc: 'Sinistre logistique pendant l\'exposition', scoreFrom: 600, scoreDelta: -45, priceFrom: 54.00 },
      { type: 'jalon', title: 'Exposition Grand Palais Paris', desc: 'Couverture presse internationale confirmée', scoreFrom: 555, scoreDelta: 110, priceFrom: 49.50 },
      { type: 'risk',  title: 'Litige Droit de Suite', desc: 'Héritiers contestent la cession de revenus', scoreFrom: 665, scoreDelta: -55, priceFrom: 60.50 },
      { type: 'jalon', title: 'Entrée Collection Pinault', desc: 'Acquisition institutionnelle majeure', scoreFrom: 610, scoreDelta: 130, priceFrom: 55.00 },
    ],
    // 1 — SKY GARDENS V4 (Architecture)
    [
      { type: 'jalon', title: 'Permis de Construire Validé', desc: 'Mairie approuve le projet urbanistique', scoreFrom: 480, scoreDelta: 70, priceFrom: 50.00 },
      { type: 'risk',  title: 'Retard Livraison Matériaux', desc: 'Pénurie acier, chantier suspendu 6 semaines', scoreFrom: 550, scoreDelta: -60, priceFrom: 53.50 },
      { type: 'jalon', title: 'Contrat Hôtelier International', desc: 'Licence usage 15 ans signée avec chaîne 5★', scoreFrom: 490, scoreDelta: 120, priceFrom: 47.00 },
      { type: 'risk',  title: 'Normes Parasismiques Révisées', desc: 'Mise à niveau structure requise', scoreFrom: 610, scoreDelta: -40, priceFrom: 59.00 },
      { type: 'jalon', title: 'Prix Architecture Internationale', desc: 'Récompense Dezeen Awards catégorie résidentiel', scoreFrom: 570, scoreDelta: 100, priceFrom: 55.00 },
    ],
    // 2 — CHRONICLES OF ELDON (TV Series)
    [
      { type: 'jalon', title: 'Accord Netflix Distribution', desc: 'Prévente SVOD confirmée 42 territoires', scoreFrom: 500, scoreDelta: 95, priceFrom: 50.00 },
      { type: 'risk',  title: 'Retard VFX Post-Production', desc: 'Studio effets spéciaux en liquidation', scoreFrom: 595, scoreDelta: -70, priceFrom: 57.50 },
      { type: 'jalon', title: 'Sélection Festival Sundance', desc: 'Pilote primé, couverture mondiale', scoreFrom: 525, scoreDelta: 115, priceFrom: 47.50 },
      { type: 'risk',  title: 'Grève Scénaristes SAG-AFTRA', desc: 'Production interrompue 2 mois', scoreFrom: 640, scoreDelta: -80, priceFrom: 63.75 },
      { type: 'jalon', title: 'Renouvellement Saison 2', desc: 'Confirmation Netflix + bonus audience', scoreFrom: 560, scoreDelta: 150, priceFrom: 56.00 },
    ],
  ];

  const CASE_META = [
    { category: 'BEAUX-ARTS', name: 'RENAISSANCE REBORN', budget: '$500,000', units: '10 000', icon: '🖼️', color: 'primary-cyan', finalScore: 740, initialScore: 520 },
    { category: 'ARCHITECTURE', name: 'SKY GARDENS V4', budget: '$2,500,000', units: '50 000', icon: '🏗️', color: 'accent-gold', finalScore: 670, initialScore: 480 },
    { category: 'SÉRIE TV', name: 'CHRONICLES OF ELDON', budget: '$1,200,000', units: '24 000', icon: '🎬', color: 'accent-pink', finalScore: 710, initialScore: 500 },
  ];

  const activeJalons = CASE_JALONS[selectedCaseIdx];
  const activeMeta = CASE_META[selectedCaseIdx];
  const activeColor = selectedCaseIdx === 0 ? '#00E0FF' : selectedCaseIdx === 1 ? '#FFD700' : '#FF007F';

  // Compute running price for each jalon
  const jalonPrices = React.useMemo(() => {
    let score = activeMeta.initialScore;
    return activeJalons.map(j => {
      const prevScore = score;
      score = Math.max(0, Math.min(1000, score + j.scoreDelta));
      const prevPrice = j.priceFrom;
      const newPrice = Math.round(prevPrice * (score / prevScore) * 100) / 100;
      const pct = Math.round(((newPrice - prevPrice) / prevPrice) * 1000) / 10;
      return { prevScore, newScore: score, prevPrice, newPrice, pct };
    });
  }, [selectedCaseIdx]);

  const finalPrice = jalonPrices[jalonPrices.length - 1]?.newPrice ?? 50;
  const totalReturn = Math.round(((finalPrice - 50) / 50) * 1000) / 10;

  return (
    <section className="relative z-10 py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* ── HEADER ───────────────────────────────────────────── */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/20 mb-6">
            <Activity size={12} className="text-primary-cyan animate-pulse" />
            <span className="text-[9px] font-black font-mono text-primary-cyan uppercase tracking-[0.4em]">
              {t('Live Protocol Simulation', 'Simulation Protocole En Direct')}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('LYA Score &', 'Score LYA &')} <span className="text-primary-cyan">{t('Investment Impact', 'Impact Investissement')}</span>
          </h2>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed font-medium">
            {t(
              'Each project starts at €50/unit. Every milestone validated pushes the score up and the price with it. Every risk declared pulls it down. Transparently. In real time.',
              'Chaque projet démarre à 50€/unité. Chaque jalon validé fait monter le score — et le prix avec. Chaque risque déclaré le fait baisser. En toute transparence, en temps réel.'
            )}
          </p>
        </div>

        {/* ── 1 LYA UNIT = 50€ ANCHOR ──────────────────────────── */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <div className="flex items-center gap-4 px-6 py-3 border border-white/10 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full border border-primary-cyan/40 flex items-center justify-center">
              <Coins size={14} className="text-primary-cyan" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">{t('Fixed issuance price', 'Prix d\'émission fixe — USD')}</p>
              <p className="text-lg font-black text-white font-mono">1 LYA UNIT = <span className="text-primary-cyan">$50.00</span></p>
            </div>
            <div className="ml-4 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20">
              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">{t('Immutable', 'Immuable')}</p>
            </div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* ── CASE SELECTOR ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {CASE_META.map((meta, idx) => {
            const isActive = selectedCaseIdx === idx;
            const jalons = CASE_JALONS[idx];
            let sc = meta.initialScore;
            let price = 50;
            jalons.forEach(j => {
              sc = Math.max(0, Math.min(1000, sc + j.scoreDelta));
              price = Math.round(price * (sc / Math.max(1, sc - j.scoreDelta)) * 100) / 100;
            });
            const ret = Math.round(((price - 50) / 50) * 1000) / 10;
            const isPositive = ret >= 0;
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
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">{meta.category}</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">{meta.name}</p>
                  </div>
                  <span className="text-2xl">{meta.icon}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">{t('Final price / unit', 'Prix final / unité')}</p>
                    <p className={`text-xl font-black font-mono ${isActive ? 'text-primary-cyan' : 'text-white'}`}>
                      €{price.toFixed(2)}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-[9px] font-black font-mono ${
                    isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
                  }`}>
                    {isPositive ? '+' : ''}{ret}%
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
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">{t('Score journey', 'Parcours du score')}</p>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeMeta.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{t('Budget', 'Budget')}</p>
                  <p className="text-sm font-black text-white font-mono">{activeMeta.budget}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">{activeMeta.units} {t('units', 'unités')}</p>
                </div>
              </div>

              {/* Score start */}
              <div className="flex items-center gap-4 px-5 py-3 border border-white/5 bg-white/[0.02]">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 shrink-0">
                  <span className="text-[9px] font-black">→</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{t('Issuance — Starting Score', 'Émission — Score de Départ')}</p>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0">
                  <div>
                    <p className="text-[8px] text-white/30 uppercase font-black">{t('Score', 'Score')}</p>
                    <p className="text-sm font-black text-white font-mono">{activeMeta.initialScore}<span className="text-white/20 text-[9px]">/1000</span></p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-[8px] text-white/30 uppercase font-black">{t('Unit price', 'Prix/unité')}</p>
                    <p className="text-sm font-black text-white font-mono">$50.00</p>
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
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${
                          isJalon
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        }`}>
                          {isJalon ? t('MILESTONE', 'JALON') : t('RISK', 'RISQUE')}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/45 leading-relaxed">{j.desc}</p>
                    </div>

                    {/* Score + Price impact */}
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">{t('Score', 'Score')}</p>
                        <p className="text-xs font-black text-white font-mono">{p.prevScore} → <span className={isJalon ? 'text-emerald-400' : 'text-rose-400'}>{p.newScore}</span></p>
                        <p className={`text-[9px] font-black font-mono ${isJalon ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {j.scoreDelta > 0 ? '+' : ''}{j.scoreDelta}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="min-w-[72px]">
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">{t('Price', 'Prix')}</p>
                        <p className="text-xs font-black text-white font-mono">${p.newPrice.toFixed(2)}</p>
                        <p className={`text-[9px] font-black font-mono ${p.pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.pct >= 0 ? '+' : ''}{p.pct}%
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
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary-cyan/60 mb-4">{t('Final result', 'Résultat final')}</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Initial price', 'Prix initial')}</span>
                    <span className="text-sm font-black text-white font-mono">$50.00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Final price', 'Prix final')}</span>
                    <span className="text-xl font-black text-primary-cyan font-mono">${finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Total return', 'Rendement total')}</span>
                    <span className={`text-xl font-black font-mono ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalReturn >= 0 ? '+' : ''}{totalReturn}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Final LYA Score', 'Score LYA Final')}</span>
                    <span className="text-xl font-black text-accent-gold font-mono">{activeMeta.finalScore}<span className="text-[10px] text-white/20">/1000</span></span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    {t(
                      'An investor who bought at \u20ac50 now holds units worth $' + finalPrice.toFixed(2) + ' on the secondary market.',
                      'Un investisseur qui a souscrit à 50\u20ac détient des unités valant $' + finalPrice.toFixed(2) + ' sur le marché secondaire.'
                    )}
                  </p>
                </div>
              </div>

              {/* Price chart mini */}
              <div className="border border-white/10 bg-white/[0.02] p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-4">{t('Price evolution', 'Évolution du prix')}</p>
                <div style={{ width: '100%', height: 140 }}>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart
                      data={[{ step: 'Départ', price: 50 }, ...activeJalons.map((j, i) => ({
                        step: j.title.split(' ').slice(0, 2).join(' '),
                        price: jalonPrices[i]?.newPrice ?? 50
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
                      <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                      <XAxis dataKey="step" hide />
                      <Tooltip
                        contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px' }}
                        itemStyle={{ color: activeColor, fontSize: 11, fontWeight: 800 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase' }}
                        formatter={(v: number) => [`$${v.toFixed(2)}`, 'Prix']}
                      />
                      <Area type="monotone" dataKey="price" stroke={activeColor} strokeWidth={2} fill="url(#priceGradCS)" dot={{ fill: activeColor, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key rule */}
              <div className="border border-white/5 bg-white/[0.01] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={12} className="text-accent-gold" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-gold/70">{t('The LYA Rule', 'La Règle LYA')}</p>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  {t(
                    'Each point gained on the LYA Score adds +$0.10 to the unit price on the secondary market. Each point lost removes -$0.10. A project reaching 1000/1000 doubles its unit value.',
                    'Chaque point gagné au Score LYA ajoute +0,10€ au prix unitaire sur le marché secondaire. Chaque point perdu retire -0,10€. Un projet atteignant 1000/1000 double la valeur de ses unités.'
                  )}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsModelizerOpen(true)}
                className="w-full py-4 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3 group"
              >
                <Cpu size={14} className="group-hover:rotate-12 transition-transform" />
                {t('Test with the Modélisateur', 'Tester avec le Modélisateur')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODÉLISATEUR MODAL ─────────────────────────────────── */}

      {/* LYA Mathematical Modelizer Modal */}
         <AnimatePresence>
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
                   <div className="flex items-center gap-3 text-primary-cyan mb-1 animate-pulse">
                     <Cpu size={18} />
                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase">{t('LYA CONSTRUCT ENGINE V4.2', 'MOTEUR DE SIMULATION LYA V4.2')}</span>
                   </div>
                   <h2 className="text-xl md:text-3xl font-black font-headline text-white uppercase tracking-tight text-justify">
                     {t('ALGORITHMIC MODELIZER:', 'MODÉLISATEUR ALGORITHMIQUE :')}{' '}
                     <span className="text-primary-cyan">{selectedContract.name}</span>
                   </h2>
                   <p className="text-xs text-white/40 uppercase tracking-wider mt-1 text-justify">
                     {t('Interactively adjust the valuation parameters below to see how milestones and committee validation impact your investment.', 'Ajustez les paramètres de valorisation pour visualiser l\'impact des jalons et de la validation comité sur votre investissement.')}
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
                             <span>{t('Creative Quality', 'Qualité de la Création')}</span>
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
                             <span>{t('Market Appeal', 'Potentiel Commercial')}</span>
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
                             <span>{t('Legal & IP Security', 'Sécurité Juridique & PI')}</span>
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
                             <span>{t('Technical Innovation', 'Innovation Technique')}</span>
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
                             <span>{t('Scale Potential', 'Perspectives d\'Échelle')}</span>
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
                             {t('Each validated milestone securely increases the global asset valuation through a proprietary compounding mechanism.', 'Chaque jalon validé augmente de manière cumulative la valorisation de l\'œuvre via un mécanisme propriétaire breveté.')}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Side Live Results */}
                   <div className="lg:col-span-5 flex flex-col gap-6">
                     <div className="bg-primary-cyan/5 border border-primary-cyan/25 p-6 rounded-lg shadow-2xl space-y-6">
                       <div className="text-center font-black py-2 tracking-[0.2em] font-mono text-[10px] text-primary-cyan uppercase bg-primary-cyan/10 border border-primary-cyan/10 rounded-sm">
                         {t('SIMULATION REAL-TIME LEDGER', 'REGISTRE DE SIMULATION TEMPS-RÉEL')}
                       </div>

                       {/* Formula Steps */}
                       <div className="font-mono text-[10px] space-y-4 text-white/60 text-left">
                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('1. COMPREHENSIVE AUTONOMOUS DEED', '1. EVALUATION AUTONOME (Sauto)')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             {demoPillars.quality} + {demoPillars.marketability} + {demoPillars.security} + {demoPillars.innovation} + {demoPillars.growth} = <span className="text-white font-bold">{demoSAuto} / 1000</span>
                           </div>
                         </div>

                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('2. WEIGHTED BASE MODEL', '2. SCORE LYA DE BASE COMPOSÉ (LYA0)')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             <span className="text-white/40">{t('Comité + Auto-évaluation', 'Committee + Self-assessment')}</span> = <span className="text-white font-bold">{demoLyaScoreCombined} / 1000</span>
                           </div>
                         </div>

                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('3. ESCALATION BONUS', '3. REVALORISATION JALONS')}</div>
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
                             <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">CONSOLIDATED RATING</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-white">{demoLyaScoreCombined} <span className="text-[10px] opacity-40 font-mono ml-1">/1000</span></div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-primary-cyan tracking-widest">{t('PROJECTED LYA UNIT PRICE', 'PRIX DE L\'UNITÉ LYA')}</span>
                             <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">LYA CONTRACT VALUE</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-primary-cyan">{formatPrice(demoProjectedUnitVal)}</div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{t('PROJECTED TOTAL VALUE', 'VALORISATION GLOBALE')}</span>
                             <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">10,000 INDEXED SHARES</span>
                           </div>
                           <div className="text-2xl font-black font-headline text-emerald-400">{formatPrice(demoProjectedTotalVal)}</div>
                         </div>

                         <div className="flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-accent-gold tracking-widest">{t('PROJECTION RENT SCORE', 'SCORE DE RENDEMENT')}</span>
                             <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">ESTIMATED YIELD RATING</span>
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
                     <p className="text-[9px] font-mono text-white/30 text-center leading-relaxed uppercase tracking-widest">
                       {t('* ANANLYTICAL PROJECTIONS BASED ON ACTIVE DECENTRALIZED PROTOCOL FORMULAS. NON-CONTRACTUAL ILLUSTRATION.', '* SIMULATIONS ESTIMATIVES BASÉES EN TEMPS-RÉEL SUR LES FORMULES OPÉRATIONNELLES DU PROTOCOLE. NON-CONTRACTUEL.')}
                     </p>
                   </div>
                 </div>
                 </div>
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
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
              onSelect={() => onNav('EXCHANGE')} 
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
      <AnimatePresence>
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
              className="bg-surface-high border border-red-500/30 max-w-2xl w-full p-8 md:p-12 relative shadow-[0_0_100px_rgba(239,68,68,0.2)]"
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
                  {t('REGULATORY DISCLOSURE & PROTOCOL LIMITATIONS', 'DIVULGATION RÉGLEMENTAIRE ET LIMITES DU PROTOCOLE')}
                </h2>
                <div className="h-[2px] w-24 bg-red-500 mb-8" />
                <p className="text-base md:text-lg text-on-surface-variant font-bold leading-relaxed mb-8 text-justify">
                  {t('LYA Units are strictly indexed contractual rights and do NOT constitute shares, financial securities, or regulated investment products. The LinkYourArt Protocol acts solely as a technological layer for valuation and registry.', 'Les unités LYA sont strictement des droits contractuels indexés et ne constituent PAS des actions, des titres financiers ou des produits d\'engagement créatif réglementés. Le protocole LinkYourArt agit uniquement en tant que couche technologique pour l\'évaluation et le registre.')}
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

        <div className="max-w-[1800px] mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-left z-20 relative pt-2 md:pt-4 lg:pt-6"
            >
              <div className="relative mb-4 sm:mb-8 lg:mb-12 xl:mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[10rem] font-black tracking-tighter leading-[0.9] md:leading-[0.8] uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {t('ART IS AN', 'L\'ART EST UN')} <br className="hidden sm:block" />
                  <span className="text-primary-cyan drop-shadow-[0_0_80px_rgba(0,224,255,0.6)] font-black">{t('EXCHANGE.', 'ÉCHANGE.')}</span>
                </h1>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white max-w-5xl mb-4 sm:mb-6 lg:mb-8 xl:mb-12 font-black uppercase tracking-tight leading-tight drop-shadow-lg text-justify">
                "{t('LINKYOURART UNITES CREATORS, INVESTORS, INDUSTRY & AUDIENCES—POWERING TOMORROW’S MASTERPIECES.', 'LINKYOURART UNIT CRÉATEURS, INVESTISSEURS, INDUSTRIE ET PUBLICS—PROPULSANT LES CHEFS-D\'ŒUVRE DE DEMAIN.')}"
              </p>

              <p className="text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl text-on-surface-variant max-w-3xl mb-6 lg:mb-8 xl:mb-12 font-medium leading-relaxed opacity-90 border-l-4 lg:border-l-8 border-primary-cyan pl-6 lg:pl-10 py-2 lg:py-3 text-justify">
                "{t('From project issuance to secondary exchange, navigate a secure ecosystem built on artistic excellence and creative transparency.', 'De l\'émission de projet à l\'échange secondaire, naviguez dans un écosystème sécurisé bâti sur l\'excellence artistique et la transparence créative.')}"
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-4 sm:mb-8 lg:mb-12 w-full sm:w-auto">
                <button 
                  onClick={() => onViewChange(user ? 'EXCHANGE' : 'LOGIN')}
                  className="w-full sm:w-auto px-10 py-5 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.3em] group overflow-hidden shadow-[0_0_50px_rgba(0,224,255,0.4)] hover:shadow-[0_0_70px_rgba(0,224,255,0.6)] text-[12px] md:text-sm transition-all active:scale-95 rounded-xl flex items-center justify-center gap-3"
                >
                  {t('Enter the Gallery', 'Entrer dans la Galerie')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  onClick={() => onViewChange(user ? 'DASHBOARD' : 'SIGNUP')}
                  className="w-full sm:w-auto px-10 py-5 border-2 border-white/20 hover:border-primary-cyan text-white font-black uppercase tracking-[0.3em] transition-all bg-white/5 backdrop-blur-xl group text-[12px] md:text-sm active:scale-95 text-center rounded-xl flex items-center justify-center gap-3 hover:bg-white hover:text-black"
                >
                  {user ? t('Go to Dashboard', 'Tableau de Bord') : t('Create an Account', 'Créer un Compte')}
                  <Layers className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
            </motion.div>

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
        <div className="max-w-[1800px] mx-auto">
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
                {t('A REVOLUTIONARY', 'UNE RÉVOLUTION')} <br />
                <span className="text-primary-cyan">{t('FINANCIAL LAYER', 'FINANCIÈRE')}</span> <br />
                {t('FOR CREATION.', 'POUR LA CRÉATION.')}
              </h2>
              <div className="space-y-6">
                <p className="text-xl text-on-surface-variant leading-relaxed opacity-90 font-medium text-justify">
                  {t('Traditional creative financing is broken. LinkYourArt (LYA) bridges the gap between artistic vision and institutional accessibility by indexing creative rights as documented contractual rights.', 'Le valorisation créative traditionnelle est obsolète. LinkYourArt (LYA) comble le fossé entre vision artistique et accessibilité professionnelle en indexant les droits comme des droits contractuels documentés.')}
                </p>
                <div className="p-6 bg-white/5 border-l-4 border-primary-cyan">
                  <p className="text-base text-white opacity-80 leading-relaxed text-justify">
                    "{t('We do not just finance projects; we create a liquid ecosystem where the value of a masterpiece is documented, verified, and verifiable in real-time.', 'Nous ne finançons pas seulement des projets ; nous créons un écosystème liquide où la valeur d\'un chef-d\'œuvre est documentée, vérifiée et consultable en temps réel.')}"
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
                  title: t('Decentralized Registry', 'Registre Décentralisé'), 
                  desc: t('Contractual rights are immutable and audited by authorized legal hubs.', 'Les droits contractuels sont immuables et audités par des hubs légaux autorisés.'),
                  icon: <Shield size={24} />
                },
                { 
                  id: '02', 
                  title: t('Neural Valuation', 'Valorisation Neurale'), 
                  desc: t('Real-time Indice LYA based on artist trajectory and project milestones.', 'Score LYA en temps réel basé sur la trajectoire et les jalons du projet.'),
                  icon: <Activity size={24} />
                },
                { 
                  id: '03', 
                  title: t('Liquid Exchange', 'Exchange Liquide'), 
                  desc: t('Trade your creative units instantly on the Secondary Exchange.', 'Échangez vos unités créatives instantanément sur l\'Exchange Secondaire.'),
                  icon: <Zap size={24} />
                },
                { 
                  id: '04', 
                  title: t('Legal Shield', 'Bouclier Légal'), 
                  desc: t('Institutional grade compliance with SEC, EU & FCA standards.', 'Conformité de grade institutionnel aux normes SEC, EU & FCA.'),
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
        <div className="max-w-[1500px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {t('home.not_lya.title', 'What LinkYourArt')} <span className="text-primary-cyan">{t('home.not_lya.title_cyan', 'is and is NOT')}</span>
            </h2>
            <p className="text-on-surface-variant text-base max-w-2xl mx-auto opacity-75">
              {t('Compare the structural advantages of the LYA Contractual Protocol against legacy creative industry intermediaries: labels, agents, studios, and classic crowdvalorisation.', "Comparez la structure innovante de l'Protocole Contractuel LYA face aux intermédiaires traditionnels des industries créatives : labels, agents, studios, et plateformes de systèmes traditionnels.")}
            </p>
          </div>

          <div className="hidden lg:block overflow-hidden border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-white/50 w-1/4">{t('CRITERIA', 'PILIER DE COMPARAISON')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-primary-cyan bg-primary-cyan/5 w-1/3 border-x border-white/10">{t('LINKYOURART PROTOCOL', 'CORE PROTOCOLE LINKYOURART')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-rose-400 w-1/4">{t('TRADITIONAL INTERMEDIARIES', 'INTERMÉDIAIRES TRADITIONNELS')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-white/30 w-1/4">{t('CLASSIC CROWDFUNDING', 'CROWDFUNDING CLASSIQUE')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Financial Instrument', 'Nature de l\'Instrument')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('LYA Contractual Units ($50)', 'Unités Contractuelles LYA ($50)')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Standardized indexed contracts representing future royalties and creative growth on-chain.', 'Contrats standardisés représentant des redevances d\'audimat et de droits contractuels réels.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Exclusive rights locked by majors', 'Droits exclusifs réservés aux majors')}</span>
                    {t('Labels, studios, publishers and agents capture most revenues. Creators sign away rights with no transparent valuation mechanism.', 'Simple achat physique d\'un bloc indivisible, sans flux financier dynamique.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Donation or symbolic rewards', 'Donation ou goodies')}</span>
                    {t('Pure gift or symbolic physical badges (t-shirts, posters) with no resale index capability.', 'Simple don ou récompenses physiques sans droit sur les revenus.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Secondary Exchange / Liquidity', 'Marché Secondaire & Échange')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Cession Directe entre Pairs', 'Cession Directe de Droits entre Pairs')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Continuous liquid matching. Users can buy/sell LYA Units on secondary terminal instantly.', 'Retraits et reventes d\'unités instantanés sur l\'Exchange interne sans intermédiaires.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Illiquid long-term locking', 'Aucune accessibilité possible')}</span>
                    {t('Rights locked in long-term contracts with labels, agents or studios. No partial resale or transfer possible.', 'Droits bloqués dans des contrats longue durée chez les labels, agents ou studios. Aucune revente ou cession partielle possible.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('No market trade option', 'Créateur unique')}</span>
                    {t('Funding locked. No secondary framework to resell your contribution to third parties.', 'Fonds définitivement bloqués après la campagne. Aucun rachat possible.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Pricing & Milestones', 'Indexation & Jalons')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Algorithmic Tracker', 'Formule Algorithmique standardisée')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Price fluctuations are based strictly on certified verified roadmap milestones.', 'Le cours de l\'unité s\'ajuste objectivement selon l\'atteinte des étapes de la feuille de route.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Opaque discresionary valuations', 'Valorisation discrétionnaire')}</span>
                    {t('Valuation imposed by majors, agents or distributors based on opaque and unverifiable criteria.', 'Valorisation imposée par les majors, agents ou diffuseurs selon des critères opaques et non vérifiables.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Unmonitored milestones', 'Aucun suivi financier')}</span>
                    {t('Regardless of project failures or outstanding successes, unit price does not exist.', 'L\'échelle et la réussite finale du projet n\'apportent aucun impact financier.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Accessibility Ticket', 'Ticket d\'Entrée & Droits')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('Micro-fractioning ($50)', 'Micro-fractionnement dès 50 $')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Democratizing creative asset valuation across all sectors: music, film, fashion, gaming, architecture, design and more.', 'Démocratisation de la valorisation créative pour tous les secteurs : musique, cinéma, mode, jeux vidéo, architecture, design et bien plus.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                     <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Elitist entry cost only', 'Ticket d\'accès élitiste')}</span>
                     {t('Access reserved for creators signed by majors, agencies or studios. Independent creators are structurally excluded.', 'Filtres drastiques limitant l\'accès uniquement aux grandes fortunes et institutionnels.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Siloed platform profiles', 'Silo sans transfert de droits')}</span>
                    {t('No institutional clearance, no smart registre certifié contracts certifying your priority rights.', 'Pas d\'inscription authentifié par huissier ou registre de clearing certifiant vos droits.')}
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
                  <strong className="text-white uppercase block text-[10px] tracking-wider mb-1">⚡ {t('MICRO-FRACTIONAL RIGHTS', 'DROIT DE PROPRIÉTÉ FRACTIONNÉ')}</strong>
                  <span className="text-white/70 leading-relaxed">{t('The initial valorisation cap is constant. LYA Units trade from $50 and fluctuate strictly on verified milestone achievements.', 'Le budget de valorisation est bloqué. Les parts s\'échangent dès 50 $ et s\'adaptent au cours des jalons validés.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white uppercase block text-[10px] tracking-wider mb-1">🔄 {t('SECURE DIRECT RIGHTS TRANSFER', 'TRANSFERT DIRECT DE DROITS')}</strong>
                  <span className="text-white/70 leading-relaxed">{t('All de pair à pair exchanges are cleared instantly inside our unified secure transfer platform.', 'Les reventes et arbitrages sont immédiats et sécurisés via notre terminal de gré à gré.')}</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl border border-rose-500/10 bg-surface-dim space-y-4">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block bg-rose-500/10 w-fit px-3 py-1 rounded-full">{t('WHAT WE ARE NOT (COMPETITION)', 'CE QUE NE SONT PAS LES AUTRES')}</span>
              <ul className="space-y-4 text-xs text-left">
                <li>
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('CLASSIC EXCLUSIONS', 'SYSTEMES TRADITIONNELS OPALISE')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Traditional intermediaries (labels, agents, studios) capture rights and revenues with no transparency or resale mechanism for the creator.', 'Les galeries d\'art classiques limitent l\'accès aux gros budgets et manquent cruellement de transparence et d\'un marché de revente immédiat.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('SYMBOLIC REWARDS ONLY', 'CROWDFUNDING SANS RETOURS')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Classic crowdvalorisation platforms provide only symbolic rewards (t-shirts, digital copies) without index capitalization or contractual claims.', 'Le crowdvalorisation classique ne transmet aucun droit financier réel, offrant de simples goodies non-valorisables.')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      {/* The Ecosystem Section */}
      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('home.pillars.title', 'The')} <span className="text-primary-cyan">{t('home.pillars.title_cyan', 'Four Pillars')}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto text-justify">
            {t('home.pillars.subtitle', 'LinkYourArt réunit les acteurs majeurs de l\'économie créative et le public dans un écosystème unique, sécurisé et transparent.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.creators.title', 'Creators')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('The heart of the ecosystem. Creative works are indexed into Certified Creative Contracts, offering future contractual rights to fuel their growth while keeping full creative control.', 'Le cœur de l\'écosystème. Les créations sont indexées en Contrats Créatifs Certifiés, offrant des droits contractuels futurs pour alimenter leur croissance tout en gardant le contrôle créatif.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-accent-gold/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <div className="w-12 h-12 bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{language === 'FR' ? 'PARTENAIRES CRÉATIFS' : 'CREATIVE PARTNERS'}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {language === 'FR' ? 'Soutenez la prochaine génération de projets créatifs. Les Partenaires Créatifs acquièrent des Unités LYA représentant des droits contractuels futurs, participant au succès de projets vérifiés via une cession directe sécurisée.' : 'Support the next generation of creative projects. Creative Partners acquire LYA Units representing future contractual rights, participating in the success of verified creative projects through a secure direct transfer.'}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-400/10 transition-all" />
            <div className="w-12 h-12 bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.professionals.title', 'Professionals')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('The guardians of creative excellence. Industry experts, labels, studios and producers evaluate creative works, ensuring the LYA Index reflects their true market potential.', 'Les gardiens de l\'excellence créative. Experts sectoriels, labels, studios et producteurs évaluent les créations, garantissant que l\'Indice LYA reflète leur véritable potentiel de marché.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.public.title', 'The Public')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('Discover the creations of tomorrow. Explore the registry, follow the creative journey and contribute to the growth of the works you believe in.', 'Découvrez les créations de demain. Explorez le registre, suivez le parcours créatif et contribuez à la croissance des œuvres en lesquelles vous croyez.')}
            </p>
          </div>
        </div>

        {/* Price Formula Section */}
        <div className="mb-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Valuation Model', 'Modèle de Valorisation')}</div>
                  <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {t('home.formula.title', 'The')} <span className="text-primary-cyan">{t('home.formula.title_cyan', 'Price Formula')}</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 font-black">01</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p1.title', 'Creator Base Price')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p1.desc', 'The initial valuation set by the creator at project inception.')}</p>
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
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p3.title', 'Professional Validation')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p3.desc', 'Notes d\'experts issus des leaders des industries créatives.')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-surface-low border border-white/5 rounded-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/10 via-transparent to-accent-pink/10 animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="text-xs font-mono text-on-surface-variant opacity-40 uppercase tracking-widest mb-4">Project Valuation</div>
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

        {/* Professional Network Section */}
        <div className="mb-40">
          <div className="text-center mb-16 px-4">
            <h3 className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Expert Hubs & Creative Legacy', 'Hub d\'Experts & Héritage Créatif')}</h3>
            <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {t('Professional', 'Professionnel')} <span className="text-primary-cyan">{t('Expert Hubs', 'Hub d\'Experts')}</span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-4 bg-accent-gold/10 border border-accent-gold/20 rounded-xl max-w-4xl mx-auto">
              <div className="w-2 h-2 shrink-0 bg-accent-gold rounded-full animate-pulse hidden sm:block" />
              <span className="text-[10px] md:text-xs font-black text-accent-gold uppercase tracking-widest text-center leading-relaxed">
                {t('WE HAVE ESTABLISHED OVER THE PAST 20 YEARS SOLID RELATIONSHIPS WITH THE LARGEST COMPANIES AND VALIDATORS IN THE CREATIVE INDUSTRIES.', 'NOUS AVONS ÉTABLI AU COURS DES 20 DERNIÈRES ANNÉES DE SOLIDES RELATIONS AVEC LES PLUS GRANDES ENTREPRISES ET VALIDATEURS DES INDUSTRIES CRÉATIVES.')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: 'Universal Music Group', logo: 'UMG', industry: t('home.partners.industries.music', 'Music Rights'), node: 'UNIV-0982' },
              { name: 'A24 Films', logo: 'A24', industry: t('home.partners.industries.cinema', 'Cinema IP'), node: 'A24-4321' },
              { name: 'Sony Interactive', logo: 'Sony Interactive', industry: t('home.partners.industries.gaming', 'Gaming Assets'), node: 'SONY-6543' },
              { name: 'Netflix Studios', logo: 'Netflix', industry: t('home.partners.industries.streaming', 'Streaming / Distribution'), node: 'NFLX-8821' },
              { name: 'LVMH Group', logo: 'LVMH', industry: t('home.partners.industries.fashion', 'Fashion & Luxury IP'), node: 'LVMH-7712' },
              { name: 'Epic Games', logo: 'EPIC Games', industry: t('home.partners.industries.tech', 'Unreal Engine Assets'), node: 'EPIC-9012' },
              { name: 'A-Cold-Wall*', logo: 'ACW', industry: t('home.partners.industries.design', 'Industrial Design'), node: 'ACW-3209' },
              { name: 'Condé Nast', logo: 'CN', industry: t('home.partners.industries.publishing', 'Media Archives'), node: 'CN-1102' },
              { name: 'Ubisoft', logo: 'Ubisoft', industry: t('home.partners.industries.gaming', 'IP Franchises'), node: 'UBI-4765' },
              { name: 'Paramount+', logo: 'Paramount', industry: t('home.partners.industries.media', 'Broadcast Catalog'), node: 'PAR-5534' },
            ].map((partner, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col items-start justify-between p-6 bg-surface-low/30 hover:bg-white/[0.02] border border-white/5 hover:border-accent-gold/40 transition-all rounded-3xl overflow-hidden min-h-[170px] shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] text-left"
              >
                {/* Glow decor */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-full flex justify-between items-center mb-4">
                  <div className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">{partner.node}</div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[7px] font-black text-emerald-400 uppercase tracking-wider">{t('ACTIVE_NODE', 'MEMBRE')}</span>
                  </div>
                </div>

                <div className="w-full text-left my-auto">
                  <div className="text-3xl font-black text-white/10 group-hover:text-accent-gold transition-colors tracking-tighter uppercase mb-2">
                    {partner.logo}
                  </div>
                  <div className="text-[11px] font-black text-white uppercase tracking-wider leading-snug">
                    {partner.name}
                  </div>
                </div>

                <div className="w-full pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8.5px] font-mono text-on-surface-variant/50 uppercase tracking-wider">
                    {partner.industry}
                  </span>
                  <span className="text-[7.5px] uppercase tracking-widest text-[#FF007F] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('SECURE', 'SÉCURISÉ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="px-12 py-5 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white hover:border-primary-cyan/50 hover:bg-primary-cyan/5 transition-all text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 mx-auto group">
              {t('MORE TO COME', 'ENCORE PLUS À VENIR')}
              <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse group-hover:scale-125 transition-transform" />
            </button>
            <p className="mt-8 text-[11px] font-mono text-on-surface-variant/40 uppercase tracking-[0.4em]">
              {t('Establishing global creative authority...', 'Établissement de l\'autorité créative mondiale...')}
            </p>
          </div>
        </div>

        <div className="bg-primary-cyan/5 border border-primary-cyan/20 p-12 rounded-sm backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-primary-cyan/20 flex items-center justify-center text-primary-cyan border border-primary-cyan/30 rounded-full shadow-[0_0_30px_rgba(0,224,255,0.2)]">
                <span className="text-4xl font-black">LYA</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-[0.2em] mb-4">{t('home.standard.title', 'The LYA')} <span className="text-white">{t('home.standard.title_cyan', 'Unit Standard')}</span></h3>
              <p className="text-on-surface-variant text-lg leading-relaxed opacity-80 text-justify">
                {t('home.standard.desc', 'LinkYourArt introduces the unique rating index for the creative market. Each LYA Unit represents a standardized $50 value of future revenue potential. This de pair à pair system allows for the exchange of revenue shares based on project advancement and milestones, providing the only objective measure of creative value.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('home.scoring.title', 'LE SYSTÈME')} <span className="text-primary-cyan">{t('home.scoring.title_cyan', "D'ÉVALUATION LYA")}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto text-justify">
            {t('home.scoring.subtitle', 'Notre algorithme propriétaire évalue chaque projet selon 5 critères critiques, fournissant un Indice de Performance Créative objectif et transparent sur 1000.')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: t('home.scoring.c1.label', 'Qualité du Projet'), score: '200', desc: t('home.scoring.c1.desc', "Évaluation du mérite créatif, de la singularité du projet et de la qualité d'exécution."), color: 'text-primary-cyan', bg: 'bg-primary-cyan/5', border: 'border-primary-cyan/20' },
            { label: t('home.scoring.c2.label', 'Potentiel de Marché'), score: '200', desc: t('home.scoring.c2.desc', "Analyse de la demande sur notre plateforme, du potentiel d'accessibilité et de l'audience cible."), color: 'text-accent-pink', bg: 'bg-accent-pink/5', border: 'border-accent-pink/20' },
            { label: t('home.scoring.c3.label', 'Sécurité Juridique'), score: '200', desc: t('home.scoring.c3.desc', "Vérification des droits contractuels, protection de la propriété intellectuelle et conformité réglementaire."), color: 'text-accent-green', bg: 'bg-accent-green/5', border: 'border-accent-green/20' },
            { label: t('home.scoring.c4.label', 'Innovation Technique'), score: '200', desc: t('home.scoring.c4.desc', "Évaluation de l'unicité technologique, de la complexité du contrat certifié et de la durabilité numérique."), color: 'text-accent-purple', bg: 'bg-accent-purple/5', border: 'border-accent-purple/20' },
            { label: t('home.scoring.c5.label', 'Potentiel de Croissance'), score: '200', desc: t('home.scoring.c5.desc', "Projections d'appréciation future basées sur les tendances du marché créatif et la feuille de route."), color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' },
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
            "{t('The LYA Index is the definitive measure of a creative work\'s living value — updated in real-time through market signals and periodic professional audits.', 'L\'Indice LYA est la mesure définitive de la valeur vivante d\'une création — mise à jour en temps réel grâce aux signaux du marché et aux audits professionnels périodiques.')}"
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
            {t('home.cta.desc', 'Join the professional creative registry and start transferring contract rights today.')}
          </p>
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="px-5 py-2 bg-white text-surface-dim font-black uppercase tracking-[0.3em] hover:bg-primary-cyan transition-all shadow-2xl active:scale-95 text-xs"
          >
            {t('home.cta.button', 'Open Dashboard')}
          </button>
          
          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary-cyan text-right uppercase">
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
