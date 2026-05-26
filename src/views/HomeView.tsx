
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
    const growth = activeContractStats.growth || 0;
    const currentPrice = activeContractStats.unitValue;
    return [
      { date: '2025-10', price: baseVal * 0.82 },
      { date: '2025-11', price: baseVal * 0.88 },
      { date: '2025-12', price: baseVal * 0.95 },
      { date: '2026-01', price: baseVal },
      { date: '2026-02', price: baseVal * (1 + (growth * 0.4) / 100) },
      { date: '2026-03', price: currentPrice },
    ];
  }, [activeContractStats]);

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
        description: t('Architectural blueprint royalties distributed as dynamic yield stream indexes. Price adapts instantly to validated commercial license signings.', 'Redevances de plans d\'architectes distribuées en flux de rendement. L\'indice s\'adapte en temps réel aux signatures de licences.'),
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
        description: t('Global broadcasting rights and revenue share metrics for the international sci-fi premium series. Multi-territory SVOD presales, broadcasting signatures, and streaming collection milestones govern secondary market index appreciation.', 'Indexation d\'un projet de série TV internationale. Les signatures de droits de diffusion SVOD et accords de syndication TV mondiaux pilotent la valorisation du cours unitaire.'),
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

  return (
    <section className="relative z-10 py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('Case Studies &', 'Études de Cas &')} <span className="text-primary-cyan">{t('Real Valuation', 'Valorisation Réelle')}</span>
          </h2>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full mb-8">
            <Cpu size={14} className="text-primary-cyan animate-spin-slow" />
            <span className="text-[10px] font-black font-mono text-primary-cyan uppercase tracking-[0.2em]">{t('Interactive Simulation Active', 'Modélisation Interactive Active')}</span>
          </div>
          <p className="text-on-surface text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed border-l-2 border-primary-cyan pl-8 text-justify opacity-80">
            {t('The initial funding budget of a project is fixed by the creator to unlock a set quantity of units. Rather than arbitrary growth, the LYA UNIT acts as a live market index, fluctuating dynamically in real-time based on the performance of specific milestones (Jalon +) or delays (Jalon -). Select a case study to test these live market variations.', 'La valeur globale de financement d\'un projet est fixée à l\'origine par le créateur pour libérer un nombre constant de parts (LYA UNITS). Ce n\'est pas cette enveloppe initiale qui change unilatéralement, mais plutôt le cours unitaire du LYA UNIT, qui agit comme un index sur le marché secondaire et varie en temps réel selon la validation de jalons de performances (Jalon +) ou de contre-performances (Jalon -).')}
          </p>
        </div>

        {/* Real-Time Valuation Section - 3 Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {caseStudies.map((caseStudy) => {
             const isSelected = selectedCaseIdx === caseStudy.idx;
             return (
               <motion.div 
                 key={caseStudy.idx}
                 onClick={() => {
                   setSelectedCaseIdx(caseStudy.idx);
                   
                   // Set default slider states based on selected caseStudy
                   const targetContract = caseStudy.idx === 0 ? (liveContracts.find(c => c.name === 'RENAISSANCE REBORN') || CONTRACTS[0]) :
                                          caseStudy.idx === 1 ? (liveContracts.find(c => c.name === 'SKY GARDENS V4') || CONTRACTS[1]) :
                                          (liveContracts.find(c => c.name === 'CHRONICLES OF ELDON') || CONTRACTS[3]);

                   const currentPillars = targetContract.pillars || [];
                   setDemoPillars({
                     quality: currentPillars[0]?.score || 180,
                     marketability: currentPillars[1]?.score || 175,
                     security: currentPillars[2]?.score || 190,
                     innovation: currentPillars[3]?.score || 165,
                     growth: currentPillars[4]?.score || 185
                   });
                   setDemoCommitteeScore(targetContract.totalScore || 850);
                   setDemoMilestones(targetContract.growth ? Math.min(5, Math.ceil(targetContract.growth / 10)) : 3);
                   setIsModelizerOpen(true);
                 }}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: caseStudy.idx * 0.1 }}
                 className={`cursor-pointer bg-surface-low/30 backdrop-blur-3xl border rounded-[3rem] p-8 flex flex-col gap-6 shadow-3xl transition-all group relative ${
                   isSelected ? 'border-primary-cyan ring-1 ring-primary-cyan/40 bg-white/[0.03]' : 'border-white/5 hover:border-white/10'
                 }`}
               >
                 {isSelected && (
                   <span className="absolute top-6 right-8 text-[8px] font-black text-primary-cyan tracking-widest bg-primary-cyan/10 px-3 py-1 rounded-full uppercase">
                     {t('ACTIVE SIMULATION', 'SIMULATION ACTIVE')}
                   </span>
                 )}
                 
                 <div className="flex justify-between items-start">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                       {caseStudy.icon}
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black font-headline text-white">{caseStudy.metric}</div>
                       <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">{caseStudy.metricLabel}</div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em] mb-1">{caseStudy.title}</h4>
                      <h3 className="text-2xl font-black font-headline text-white uppercase tracking-tighter">{caseStudy.subtitle}</h3>
                    </div>
                    <p className="text-xs text-white/70 font-medium leading-relaxed opacity-80 text-justify">
                      "{caseStudy.description}"
                    </p>
                 </div>

                 {/* Fluctuation milestones display */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">✅ Jalon + (Performance)</span>
                        <span className="text-[10px] font-mono font-black text-emerald-400">{caseStudy.jalonPlusImpact}</span>
                      </div>
                      <p className="text-[11px] text-white/70 text-left">"{caseStudy.jalonPlus}"</p>
                    </div>

                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">⚠️ Jalon - (Contre-Performance)</span>
                        <span className="text-[10px] font-mono font-black text-rose-400">{caseStudy.jalonMinusImpact}</span>
                      </div>
                      <p className="text-[11px] text-white/70 text-left">"{caseStudy.jalonMinus}"</p>
                    </div>
                  </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div className="space-y-1">
                     <span className="text-[8px] font-black text-primary-cyan tracking-wider uppercase block">{t('LYA UNIT INDEX PRICE', 'COURS INDEX LYA')}</span>
                     <div className="text-xs font-mono font-black text-white flex items-center gap-1.5 flex-wrap">
                       <span className="line-through text-white/35 font-medium">{formatPrice(caseStudy.baselineUnitVal)}</span>
                       <span className="text-emerald-400 font-bold">→ {formatPrice(caseStudy.currentUnitVal)}</span>
                     </div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-[8px] font-black text-white/30 tracking-wider uppercase block">{t('PROJECT FINANCING CAP', 'BUDGET LEVÉ (FIXE)')}</span>
                     <div className="text-xs font-mono font-black text-white/40 mt-1">
                       {formatPrice(caseStudy.baselineProjectVal)} <span className="text-[8px] font-sans font-extrabold text-[#FF007F] opacity-70 uppercase tracking-widest">{t('CONSTANT', 'BLOQUÉ')}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="pt-4 border-s-0 flex justify-between items-center group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.2em] bg-primary-cyan/10 border border-primary-cyan/20 px-3 py-1.5 rounded-sm hover:bg-primary-cyan hover:text-black transition-all">{t('CLICK TO MODEL', 'CLIQUER POUR MODÉLISER')}</span>
                    <ArrowRight size={14} className={isSelected ? 'text-primary-cyan' : 'text-white/20'} />
                 </div>
               </motion.div>
             );
           })}
        </div>

        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Radar Matrix */}
             <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col gap-10 shadow-3xl">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white flex items-center gap-4">
                         <div className="w-2 h-8 bg-primary-cyan/20" />
                         {t('INTELLIGENCE RADAR MATRIX', 'MATRICE INTELLIGENCE RADAR')}
                       </h3>
                       {appliedSimulation[selectedContract.id] && (
                         <div className="flex items-center gap-2 mt-1.5 bg-accent-gold/15 border border-accent-gold/20 px-2.5 py-1 rounded-md text-[9px] text-accent-gold max-w-fit">
                           <span className="w-1.5 h-1.5 bg-accent-gold rounded-full animate-ping" />
                           <span className="font-mono font-black uppercase tracking-widest">{t('SIMULATED', 'SIMULÉ')}</span>
                           <button onClick={() => handleResetSimulation(selectedContract.id)} className="font-black text-white/60 hover:text-white uppercase ml-1.5 underline cursor-pointer">
                             ({t('RESET', 'RESET')})
                           </button>
                         </div>
                       )}

                   </div>
                   <div className="flex flex-col items-end">
                      <div className="text-3xl font-headline font-black text-primary-cyan">{activeContractStats.totalScore}<span className="text-on-surface-variant/40 text-xs font-mono ml-1">/1000</span></div>
                      <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">{t('CONSOLIDATED LYA SCORE', 'SCORE LYA CONSOLIDÉ')}</div>
                   </div>
                </div>

                <div className="h-[400px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pillarData}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                      <Radar
                        name={selectedContract.name}
                        dataKey="value"
                        stroke="#00e0ff"
                        fill="#00e0ff"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-12 mt-4 px-4 overflow-hidden h-[120px]">
                  {pillarData.map((pillar, idx) => (
                    <div key={idx} className="flex flex-col gap-2 group">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 group-hover:text-primary-cyan transition-colors truncate">{pillar.name}</span>
                          <span className="text-xs font-mono font-black text-white">{pillar.value}</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white/10 group-hover:bg-primary-cyan transition-all duration-1000" style={{ width: `${(pillar.value / 200) * 100}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Price History & Sentiment */}
             <div className="flex flex-col gap-10">
                <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8 shadow-3xl flex-1">
                   <div className="flex justify-between items-center">
                     <h3 className="text-sm font-black uppercase tracking-[0.4em] text-primary-cyan flex items-center gap-4">
                        <TrendingUp size={18} />
                        {t('PRICE HISTORY', 'HISTORIQUE DES PRIX')}
                     </h3>
                   </div>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={priceHistory}>
                          <defs>
                            <linearGradient id="colorPriceHome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="date" hide />
                          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0A0A0A', 
                              border: '1px solid rgba(0,224,255,0.2)', 
                              borderRadius: '8px',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                              padding: '12px'
                            }}
                            itemStyle={{ color: '#00E0FF', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#ffffff40', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="price" stroke="#00E0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPriceHome)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{t('TOTAL VALUE', 'VALEUR TOTALE')}</div>
                        <div className="text-xl font-headline font-black text-white">{formatPrice(selectedContract.totalValue)}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{t('UNIT PRICE', 'PRIX UNITAIRE')}</div>
                        <div className="text-xl font-headline font-black text-primary-cyan">{formatPrice(escalatedUnitPrice)}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{t('GROWTH', 'CROISSANCE')}</div>
                        <div className="text-xl font-headline font-black text-emerald-400">+{selectedContract.growth}%</div>
                      </div>
                   </div>
                </div>

                <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl">
                   <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] flex items-center gap-2">
                         <Target size={14} />
                         {t('STRATEGIC THESIS', 'THÈSE STRATÉGIQUE')}
                      </div>
                      <p className="text-xs text-white/60 font-medium max-w-sm">"{t('Masterpiece tokenization allows for unprecedented liquidity in the fine art market sector.', 'La tokenisation des chefs-d\'œuvre permet une liquidité sans précédent dans le secteur du marché des beaux-arts.')}"</p>
                   </div>
                   <div className="text-right">
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">STRONG BUY</div>
                      <div className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest font-mono">94.2% CONFIDENCE</div>
                    </div>

         {/* LYA Mathematical Modelizer Modal */}
         <AnimatePresence>
           {isModelizerOpen && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-black/85 overflow-y-auto"
             >
               <motion.div 
                 initial={{ scale: 0.93, y: 15 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.93, y: 15 }}
                 className="bg-black/90 border border-primary-cyan/20 max-w-5xl w-full p-6 md:p-10 relative shadow-[0_0_80px_rgba(0,224,255,0.15)] rounded-2xl flex flex-col gap-6 my-auto text-left"
               >
                 {/* Close Button */}
                 <button 
                   onClick={() => setIsModelizerOpen(false)}
                   className="absolute top-6 right-6 text-white/50 hover:text-primary-cyan hover:bg-white/5 p-2 rounded-full transition-all"
                   title={t('Close Modal', 'Fermer')}
                 >
                   <X size={20} />
                 </button>

                 {/* Title Header */}
                 <div className="border-b border-white/5 pb-4">
                   <div className="flex items-center gap-3 text-primary-cyan mb-1 animate-pulse">
                     <Cpu size={18} />
                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase">{t('LYA CONSTRUCT ENGINE V4.2', 'MOTEUR DE SIMULATION LYA V4.2')}</span>
                   </div>
                   <h2 className="text-xl md:text-3xl font-black font-headline text-white uppercase tracking-tight text-justify">
                     {t('ALGORITHMIC MODELIZER:', 'MODÉLISATEUR ALGORITHMIQUE :')}{' '}
                     <span className="text-primary-cyan">{selectedContract.name}</span>
                   </h2>
                   <p className="text-xs text-white/40 uppercase tracking-wider mt-1 text-justify">
                     {t('Interactively adjust valuation vectors below to test our patent-worthy pricing standard formulas.', 'Ajustez de manière interactive les vecteurs de cotation ci-dessous pour tester nos formules de valorisation standard.')}
                   </p>
                 </div>

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
                             {t('Each certified milestone escalates the global asset valuation ratio securely by a compounding +4.15%.', 'Chaque jalon validé augmente de manière cumulative la valorisation de l\'œuvre de +4,15%.')}
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Side Live Results Vector math Display */}
                   <div className="lg:col-span-5 flex flex-col gap-6 h-full lg:sticky lg:top-0">
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
                             (0.70 &#215; {demoCommitteeScore}) + (0.30 &#215; {demoSAuto}) = <span className="text-white font-bold">{demoLyaScoreCombined} / 1000</span>
                           </div>
                         </div>

                         <div className="bg-black/30 p-3 rounded-md border border-white/5 space-y-1">
                           <div className="text-white/40 font-bold uppercase tracking-widest">{t('3. ESCALATION BONUS', '3. REVALORISATION JALONS')}</div>
                           <div className="text-xs text-white font-bold tracking-tight text-right mt-1">
                             {demoMilestones} &#215; 4.15% = <span className="text-white text-emerald-400 font-bold">+{demoMilestoneBonusPercent.toFixed(2)}%</span>
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
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
                    </div>
                 </div>
              </div>
           </div>
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

  const { t } = useTranslation();

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
                  {t('LYA Units are strictly indexed contractual rights and do NOT constitute shares, financial securities, or regulated investment products. The LinkYourArt Protocol acts solely as a technological layer for valuation and registry.', 'Les unités LYA sont strictement des droits contractuels indexés et ne constituent PAS des actions, des titres financiers ou des produits d\'investissement réglementés. Le protocole LinkYourArt agit uniquement en tant que couche technologique pour l\'évaluation et le registre.')}
                </p>
                <p className="text-sm text-on-surface-variant opacity-70 mb-10 text-justify">
                  {t('LinkYourArt acts as a trusted third party for analysis and valuation. No promise of yield is guaranteed. The value can evolve based on objective indicators documented in real-time.', 'LinkYourArt agit en tant que tiers de confiance pour l\'analyse et la valorisation. Aucune promesse de rendement n\'est garantie. La valeur peut évoluer selon des indicateurs objectifs documentés en temps réel.')}
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
                  {t('Traditional creative financing is broken. LinkYourArt (LYA) bridges the gap between artistic vision and institutional liquidity by indexing creative rights as tradable assets.', 'Le financement créatif traditionnel est obsolète. LinkYourArt (LYA) comble le fossé entre vision artistique et liquidité institutionnelle en indexant les droits comme des actifs échangeables.')}
                </p>
                <div className="p-6 bg-white/5 border-l-4 border-primary-cyan">
                  <p className="text-base text-white opacity-80 leading-relaxed text-justify">
                    "{t('We do not just finance projects; we create a liquid ecosystem where the value of a masterpiece is documented, verified, and tradeable in real-time.', 'Nous ne finançons pas seulement des projets ; nous créons un écosystème liquide où la valeur d\'un chef-d\'œuvre est documentée, vérifiée et échangeable en temps réel.')}"
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
                  desc: t('Real-time LYA Score based on artist trajectory and project milestones.', 'Score LYA en temps réel basé sur la trajectoire et les jalons du projet.'),
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
              {t('Compare the structural advantages of the LYA Contractual Exchange against legacy galleries, institution websites, and classic crowdfunding.', "Comparez la structure innovante de l'Échange Contractuel LYA face aux galeries d'art traditionnelles, sites d'institutions et plateformes de financement classiques.")}
            </p>
          </div>

          <div className="hidden lg:block overflow-hidden border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.02] to-transparent shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-white/50 w-1/4">{t('CRITERIA', 'PILIER DE COMPARAISON')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-primary-cyan bg-primary-cyan/5 w-1/3 border-x border-white/10">{t('LINKYOURART PROTOCOL', 'CORE PROTOCOLE LINKYOURART')}</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-rose-400 w-1/4">{t('TRADITIONAL GALLERIES / SITES', 'GALERIES / PORTAILS TRADITIONNELS')}</th>
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
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Physical asset or static info', 'Achat physique indivisible ou site vitrine')}</span>
                    {t('Static art purchase with no yield correlation, complex and illiquid paperwork.', 'Simple achat physique d\'un bloc indivisible, sans flux financier dynamique.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Donation or symbolic rewards', 'Donation ou goodies')}</span>
                    {t('Pure gift or symbolic physical badges (t-shirts, posters) with no resale index capability.', 'Simple don ou récompenses physiques sans droit sur les revenus.')}
                  </td>
                </tr>

                <tr>
                  <td className="p-6 font-headline font-bold text-white text-sm uppercase tracking-wider">{t('Secondary Exchange / Liquidity', 'Marché Secondaire & Échange')}</td>
                  <td className="p-6 text-sm text-white font-medium bg-primary-cyan/[0.02] border-x border-white/10">
                    <span className="text-primary-cyan font-black block mb-1">✓ {t('P2P Exchange Live Market', 'Marché P2P de Gré à Gré en Direct')}</span>
                    <p className="text-xs text-white/70 leading-relaxed">{t('Continuous liquid matching. Users can buy/sell LYA Units on secondary terminal instantly.', 'Retraits et reventes d\'unités instantanés sur l\'Exchange interne sans intermédiaires.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                    <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Illiquid long-term locking', 'Aucune liquidité possible')}</span>
                    {t('Requires years to locate a buyer via auction houses or brokers, with premium fees up to 25%.', 'Nécessite des intermédiaires, commissaires-priseurs lourds, sans liquidité avant plusieurs années.')}
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
                    {t('Arbitrary pricing set behind closed doors by gallery owners, based on reputation and speculation.', 'Cote fixée unilatéralement, propice à la spéculation opaque en arrière-boutique.')}
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
                    <p className="text-xs text-white/70 leading-relaxed">{t('Democratizing luxury art and cinematic registries for both professional curators and public.', 'Démocratisation des actifs de prestige pour les professionnels comme pour le public.')}</p>
                  </td>
                  <td className="p-6 text-xs text-white/40 leading-relaxed">
                     <span className="text-rose-400/70 font-bold block mb-1">✗ {t('Elitist entry cost only', 'Ticket d\'accès élitiste')}</span>
                     {t('High physical entry barrier typically starting from $50k+, excluding minor collectors.', 'Filtres drastiques limitant l\'accès uniquement aux grandes fortunes et institutionnels.')}
                  </td>
                  <td className="p-6 text-xs text-white/30 leading-relaxed">
                    <span className="text-white/40 font-bold block mb-1">✗ {t('Siloed platform profiles', 'Silo sans transfert de droits')}</span>
                    {t('No institutional clearance, no smart ledger contracts certifying your priority rights.', 'Pas d\'inscription authentifié par huissier ou registre de clearing certifiant vos droits.')}
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
                  <span className="text-white/70 leading-relaxed">{t('The initial funding cap is constant. LYA Units trade from $50 and fluctuate strictly on verified milestone achievements.', 'Le budget de financement est bloqué. Les parts s\'échangent dès 50 $ et s\'adaptent au cours des jalons validés.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white uppercase block text-[10px] tracking-wider mb-1">🔄 {t('SECURE SECONDARY MARKET', 'MARCHÉ SECONDAIRE P2P LIQUIDE')}</strong>
                  <span className="text-white/70 leading-relaxed">{t('All peer-to-peer exchanges are cleared instantly inside our unified secure exchange layout.', 'Les reventes et arbitrages sont immédiats et sécurisés via notre terminal de gré à gré.')}</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl border border-rose-500/10 bg-surface-dim space-y-4">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block bg-rose-500/10 w-fit px-3 py-1 rounded-full">{t('WHAT WE ARE NOT (COMPETITION)', 'CE QUE NE SONT PAS LES AUTRES')}</span>
              <ul className="space-y-4 text-xs text-left">
                <li>
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('CLASSIC EXCLUSIONS', 'SYSTEMES TRADITIONNELS OPALISE')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Traditional galleries run on opaque offline bidding without secondary market options and feature prohibitive multi-thousand ticket sizes with zero live updates.', 'Les galeries d\'art classiques limitent l\'accès aux gros budgets et manquent cruellement de transparence et d\'un marché de revente immédiat.')}</span>
                </li>
                <li className="pt-2 border-t border-white/5">
                  <strong className="text-white/80 uppercase block text-[10px] tracking-wider mb-1">✗ {t('SYMBOLIC REWARDS ONLY', 'CROWDFUNDING SANS RETOURS')}</strong>
                  <span className="text-white/50 leading-relaxed">{t('Classic crowdfunding platforms provide only symbolic rewards (t-shirts, digital copies) without index capitalization or contractual claims.', 'Le crowdfunding classique ne transmet aucun droit financier réel, offrant de simples goodies non-valorisables.')}</span>
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
            {t('home.pillars.subtitle', 'LinkYourArt unites the major actors of the creative economy and the public in a single, secure, and transparent ecosystem.')}
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
              {t('home.pillars.creators.desc', 'The heartbeat of the ecosystem. Creators tokenize their vision into Indexed Creative Contracts, offering future revenue shares to fuel their growth while maintaining creative control.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-accent-gold/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <div className="w-12 h-12 bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.investors.title', 'Investors')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('home.pillars.investors.desc', 'Back the next generation of masterpieces. Investors acquire LYA Units representing future revenue shares, participating in the success of verified creative projects through a secure P2P exchange.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-400/10 transition-all" />
            <div className="w-12 h-12 bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.professionals.title', 'Professionals')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('home.pillars.professionals.desc', 'The validators of excellence. Industry leaders (Netflix, Amazon, Labels, Producers) rate projects, ensuring the LYA Score reflects real-market potential and expert quality.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.public.title', 'The Public')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 text-justify">
              {t('home.pillars.public.desc', 'Discover the projects of tomorrow. The general public can explore the registry, track the creative journey, and contribute to the growth of masterpieces they believe in.')}
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
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p3.desc', 'Expert ratings from industry leaders (Netflix, Amazon, Producers).')}</p>
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
                {t('home.standard.desc', 'LinkYourArt introduces the unique rating index for the creative market. Each LYA Unit represents a standardized $50 value of future revenue potential. This peer-to-peer system allows for the exchange of revenue shares based on project advancement and milestones, providing the only objective measure of creative value.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {t('home.scoring.title', 'The LYA')} <span className="text-primary-cyan">{t('home.scoring.title_cyan', 'Scoring System')}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto text-justify">
            {t('home.scoring.subtitle', 'Our proprietary algorithm evaluates every contract across 5 critical notation criteria, providing a transparent and objective System Yield Index out of 1000.')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: t('home.scoring.c1.label', 'Project Quality'), score: '200', desc: t('home.scoring.c1.desc', 'Evaluation of artistic merit, historical significance, and creative execution.'), color: 'text-primary-cyan', bg: 'bg-primary-cyan/5', border: 'border-primary-cyan/20' },
            { label: t('home.scoring.c2.label', 'Marketability'), score: '200', desc: t('home.scoring.c2.desc', 'Analysis of secondary market demand, liquidity potential, and audience reach.'), color: 'text-accent-pink', bg: 'bg-accent-pink/5', border: 'border-accent-pink/20' },
            { label: t('home.scoring.c3.label', 'Legal Security'), score: '200', desc: t('home.scoring.c3.desc', 'Verification of contractual rights, IP protection, and regulatory compliance.'), color: 'text-accent-green', bg: 'bg-accent-green/5', border: 'border-accent-green/20' },
            { label: t('home.scoring.c4.label', 'Technical Innovation'), score: '200', desc: t('home.scoring.c4.desc', 'Assessment of technological uniqueness, smart contract complexity, and digital durability.'), color: 'text-accent-purple', bg: 'bg-accent-purple/5', border: 'border-accent-purple/20' },
            { label: t('home.scoring.c5.label', 'Growth Potential'), score: '200', desc: t('home.scoring.c5.desc', 'Projections of future value appreciation based on market trends and roadmap.'), color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' },
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
            "{t('home.quotes.scoring', 'The LYA Score represents the definitive index of a creative contract\'s living value, updated in real-time through market feedback and periodic professional audits.')}"
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
            {t('home.cta.desc', 'Join the professional creative registry and start trading contract units today.')}
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
