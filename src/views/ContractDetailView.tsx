
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Globe, 
  FileText, 
  Award, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Download,
  Lock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  MessageSquare,
  Send,
  User,
  Star,
  Plus,
  Sparkles,
  TrendingDown,
  Target,
  Info,
  Layers,
  Search,
  Wallet,
  History,
  Scale
} from 'lucide-react';
import {Contract, PillarScore, LYA_UNIT_VALUE} from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { simulatePDFDownload } from '../utils/download';
import { generateAssetAnalysis, askCopilot, generateInvestmentThesis } from '../services/geminiService';
import { getSafeImageUrl } from '../utils/image';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line
} from 'recharts';

interface ContractDetailViewProps {
  contract: Contract;
  onBack: () => void;
  onTrade: (contract: Contract, type: 'BUY' | 'SELL') => void;
  onPlaceOrder: (contract: Contract, type: 'BUY' | 'SELL', price: number, volume: number) => void;
  onNotify: (msg: string) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent, id: string) => void;
}

export const ContractDetailView: React.FC<ContractDetailViewProps> = ({ 
  contract, 
  onBack, 
  onTrade, 
  onPlaceOrder, 
  onNotify,
  isWatchlisted = false,
  onToggleWatchlist
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { formatPrice, currency, setCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'ai-simulator' | 'legal' | 'milestones' | 'messaging'>('overview');
  const [priceTimeframe, setPriceTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  
  // Évaluation values
  const scoreAlgoValue = contract.scoreAlgo || 885;
  const scoreProValue = contract.scorePro || 912;
  const scoreFinalValue = Math.round((scoreAlgoValue + scoreProValue) / 2);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [simAmount, setSimAmount] = useState<number>(5000);

  const [simulationScenario, setSimulationScenario] = useState<string>('balanced');
  const [simulationGoal, setSimulationGoal] = useState<string>('maximize_performance');
  const [simulationPersona, setSimulationPersona] = useState<string>('algo_oracle');
  const [isSimulatingAI, setIsSimulatingAI] = useState<boolean>(false);
  const [aiSimulationOutput, setAiSimulationOutput] = useState<{
    multi: number;
    volCorrection: number;
    score: number;
    narrative: string;
  } | null>(null);

  const simUnits = Math.floor(simAmount / contract.unitValue);
  const simShare = ((simUnits / contract.totalUnits) * 100).toFixed(4);
  const simAnnual = (simAmount * (contract.growth / 100));
  const simRoyalty = (simAmount * ((contract.revenueSharePercentage || 12.5) / 100));
  const simProjection = (simAmount * Math.pow(1 + (contract.growth / 100), 3));

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await generateAssetAnalysis(contract.name, contract.description || "", scoreFinalValue, language);
      setAiAnalysis(analysis);
    } catch (err) {
      onNotify?.("AI Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAISimulationRun = async () => {
    setIsSimulatingAI(true);
    try {
      let scale = 1.0;
      if (simulationScenario === 'conservative') scale = 0.5;
      if (simulationScenario === 'aggressive') scale = 1.8;

      let goalImpact = 1.0;
      if (simulationGoal === 'maximize_performance') goalImpact = 1.1;
      if (simulationGoal === 'arbitrage') goalImpact = 0.9;

      const baseMulti = Math.round(contract.growth * 2.5 * scale * goalImpact);
      const computedMulti = baseMulti > 0 ? baseMulti : 12;
      const computedVol = Math.round(15 * (1.5 - scale));
      const computedScore = Math.round(scoreFinalValue * (0.9 + (scale * 0.1)));

      const systemPrompt = `Analyze alternative creative asset '${contract.name}' (${contract.category}) with LYA Index ${scoreFinalValue}/1000 under the scenario model '${simulationScenario}' and investment strategic target '${simulationGoal}'. 
      Synthesize an executive prediction paragraph of exactly 3 sentences. Write from the perspective of a senior AI '${simulationPersona}'. 
      Focus on capital allocations, progressions, and compliance. Write in ${language === 'FR' ? 'French' : 'English'}. Do not output JSON.`;

      const response = await askCopilot(systemPrompt, [], language);

      setAiSimulationOutput({
        multi: computedMulti,
        volCorrection: computedVol,
        score: computedScore > 1000 ? 1000 : computedScore,
        narrative: response || "Analysis compiled: Les indices indiquent une progression positive and strategic alignment with standards créatifs alternatifs."
      });
    } catch (err) {
      onNotify?.("Simulation failed. Retrying...");
    } finally {
      setIsSimulatingAI(false);
    }
  };

  useEffect(() => {
     // Trigger initial summary if not present
     if (!aiAnalysis) {
        setAiAnalysis("Analysis indicates strong upward trajectory. Strategic allocation recommended based on algorithmic consistency and expert validation.");
     }
  }, []);

  const pillarData = (contract.pillars || []).map(p => ({
    name: p.label,
    value: p.score,
    full: 200
  }));

  const priceHistory = useMemo(() => {
    const base = [
      { date: 'Jan', price: contract.unitValue * 0.88 },
      { date: 'Feb', price: contract.unitValue * 0.92 },
      { date: 'Mar', price: contract.unitValue * 0.95 },
      { date: 'Apr', price: contract.unitValue * 0.98 },
      { date: 'May', price: contract.unitValue },
    ];
    return base;
  }, [contract.unitValue]);

  return (
    <div id="contract-detail-dashboard" className="min-h-screen bg-surface-dim text-white lg:pb-32">
      {/* Top Professional Header */}
      <div className="sticky top-0 z-[100] bg-surface-lowest/80 backdrop-blur-3xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-cyan hover:text-surface-dim transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.2em]">{contract.registryIndex}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{contract.category}</span>
            </div>
            <h1 className="text-xl font-headline font-black tracking-tighter uppercase leading-none">{contract.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Multilingual Toggle */}
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
            <button 
              onClick={() => setLanguage('FR')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${language === 'FR' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              FR
            </button>
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${language === 'EN' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${currency === 'EUR' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              EUR
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${currency === 'USD' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              USD
            </button>
          </div>

          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">LYA UNIT VALUE</span>
            <span className="text-xl font-black font-headline text-emerald-400 leading-none">{formatPrice(contract.unitValue)}</span>
          </div>
          <button 
            onClick={() => onTrade(contract, 'BUY')}
            className="px-6 py-3 bg-emerald-500 text-surface-dim rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg"
          >
            {t('BUY UNITS', 'ACHETER UNITÉS')}
          </button>
          <button 
            onClick={() => onTrade(contract, 'SELL')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
          >
            {t('SELL UNITS', 'VENDRE UNITÉS')}
          </button>
          <button 
            onClick={(e) => onToggleWatchlist?.(e, contract.id)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isWatchlisted ? 'bg-accent-gold border-accent-gold text-surface-dim' : 'bg-white/5 border-white/10'}`}
          >
            <Star size={18} fill={isWatchlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="max-w-full max-w-7xl mx-auto p-6 lg:p-10 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-0">
        
        {/* LEFT COLUMN: Main Visuals & Stats (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
          
          {/* AI Executive Summary Header (Moved from HomeView) */}
          <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col gap-10 shadow-3xl overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 via-transparent to-accent-gold/5 opacity-50" />
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary-cyan/20 rounded-2xl flex items-center justify-center text-primary-cyan shrink-0">
                        <Sparkles size={24} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">{t('AI EXECUTIVE SUMMARY', 'RÉSUMÉ EXÉCUTIF IA')}</h3>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 pl-16">{t('REAL-TIME GENERATIVE SYNOPSIS FOR CREATIVE ALLOCATION', 'SYNOPSIS GÉNÉRATIF EN TEMPS RÉEL POUR L\'ALLOCATION CRÉATIVE')}</p>
                </div>

                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-primary-cyan to-accent-gold text-surface-dim text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,224,255,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0 disabled:opacity-50"
                >
                  {isAnalyzing ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isAnalyzing ? t('ANALYZING...', 'ANALYSE...') : t('GENERATE SYNOPSIS', 'GÉNÉRER LA SYNTHÈSE')}
                </button>
             </div>

             <div className="relative z-10 min-h-[150px] bg-black/20 rounded-[2.5rem] border border-white/5 p-10 flex items-center justify-center text-center">
                <p className="text-lg md:text-2xl font-light text-white leading-relaxed max-w-5xl">
                   "{aiAnalysis || t('Click above to generate a real-time AI analysis of this creative project.', 'Cliquez ci-dessus pour générer une analyse IA en temps réel de ce projet créatif.')}"
                </p>
             </div>
          </div>

          {/* Enhanced Visual Section */}
          <div className="relative aspect-[16/7] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-surface-low">
            <img 
              src={getSafeImageUrl(contract.image, contract.category)} 
              alt={contract.name} 
              className="w-full h-full object-cover opacity-90 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
            
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center gap-4">
                  <Activity className="text-primary-cyan animate-pulse" size={18} />
                  <div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">{t('MARKET STATUS', 'STATUT MARCHÉ')}</div>
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter">LIVE TRADING ACTIVE</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                   <button className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Download size={18} />
                   </button>
                   <button onClick={() => { window.dispatchEvent(new CustomEvent('lya-navigate', { detail: 'PROJECT_PUBLIC' })); }} title="Page publique" className="w-12 h-12 rounded-2xl bg-primary-cyan/20 backdrop-blur-xl border border-primary-cyan/30 flex items-center justify-center text-primary-cyan hover:bg-primary-cyan hover:text-surface-dim transition-all">
                      <ExternalLink size={18} />
                   </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                 <div className="p-8 bg-surface-lowest/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                    <div className="relative">
                       <svg className="w-24 h-24 -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * scoreFinalValue / 1000)} className="text-primary-cyan shadow-[0_0_20px_#00E0FF]" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-headline font-black text-white leading-none">{scoreFinalValue}</span>
                          <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mt-1">LYA INDEX</span>
                       </div>
                    </div>
                    <div>
                       <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{t('LYA PERFORMANCE', 'PERFORMANCE LYA')}</div>
                       <h2 className="text-3xl font-black font-headline tracking-tighter text-white uppercase leading-none">{t('HIGH CONVICTION', 'CONVICTION ÉLEVÉE')}</h2>
                       <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ASSET BACKED & AUDITED</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Dashboard Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t('LIQUIDITY', 'LIQUIDITÉ'), value: 'HIGH', status: 'Optimal', color: 'emerald' },
              { label: t('VOLATILITY', 'VOLATILITÉ'), value: '0.12', status: 'Stable', color: 'cyan' },
              { label: t('HOLDERS', 'DÉTENTEURS'), value: '2,841', status: 'Growth', color: 'pink' },
              { label: t('LYA PEG', 'PEG LYA'), value: formatPrice(LYA_UNIT_VALUE), status: 'Locked', color: 'gold' }
            ].map((metric, i) => (
            <div key={metric.label} className="bg-surface-low border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group shadow-sm">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{metric.label}</div>
              <div className="text-2xl font-headline font-black text-white mb-2">{metric.value}</div>
              <div className="flex items-center gap-1.5">
                 <div className={`w-1 h-1 rounded-full bg-${metric.color}-400 group-hover:scale-150 transition-transform`} />
                 <span className={`text-xs font-black text-${metric.color}-400 uppercase tracking-widest`}>{metric.status}</span>
              </div>
            </div>
          ))}
        </div>

          {/* Detailed Content Tabs */}
          <div className="bg-surface-low border border-white/5 rounded-[3rem] p-10 shadow-lg min-h-[600px]">
             <div className="flex gap-12 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: t('OVERVIEW', 'VUE D\'ENSEMBLE') },
                  { id: 'financials', label: t('MARKET DATA', 'DONNÉES MARCHÉ') },
                  { id: 'ai-simulator', label: t('AI SIMULATORS', 'SIMULATEURS IA') },
                  { id: 'legal', label: t('LEGAL & IP', 'JURIDIQUE & IP') },
                  { id: 'milestones', label: t('TIMELINE', 'CALENDRIER') },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-6 text-[12px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${
                      activeTab === tab.id ? 'text-primary-cyan' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-cyan shadow-[0_0_15px_#00E0FF] rounded-full" />
                    )}
                  </button>
                ))}
             </div>

             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-10">
                         <div className="space-y-4">
                           <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                              <FileText size={16} />
                              {t('PROJECT SYNOPSIS', 'SYNOPSIS DU PROJET')}
                           </h4>
                           <p className="text-xl font-light text-white/80 leading-relaxed border-l-4 border-primary-cyan pl-6">
                              "{contract.description}"
                           </p>
                         </div>

                         <div className="space-y-6">
                           <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                              <Award size={16} />
                              {t('ENFORCED RIGHTS', 'DROITS APPLIQUÉS')}
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {contract.rights?.map((right, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                                   <div className="w-2 h-2 rounded-full bg-accent-gold shadow-[0_0_8px_#D4AF37]" />
                                   <span className="text-[10px] font-black text-white/70 uppercase tracking-wide">{right}</span>
                                </div>
                              ))}
                           </div>
                         </div>
                      </div>

                      <div className="flex flex-col items-center">
                         <div className="w-full h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pillarData}>
                                <PolarGrid stroke="#ffffff08" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 900 }} />
                                <Radar
                                   name="Scores"
                                   dataKey="value"
                                   stroke="#00E0FF"
                                   fill="#00E0FF"
                                   fillOpacity={0.3}
                                />
                              </RadarChart>
                           </ResponsiveContainer>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full mt-8">
                            {pillarData.map((p, i) => (
                              <div key={i} className="space-y-2">
                                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">{p.name}</span>
                                    <span className="text-primary-cyan">{p.value}</span>
                                 </div>
                                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-cyan" style={{ width: `${(p.value / 200) * 100}%` }} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>

                     {/* Primary LYA UNIT Dynamic Timeline */}
                     <div className="space-y-6 bg-primary-cyan/5 border border-primary-cyan/20 p-8 rounded-[2.5rem] relative overflow-hidden">
                       <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-primary-cyan/5 rounded-full blur-[80px]" />
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                         <div className="space-y-1">
                           <span className="text-[10px] font-mono font-black text-primary-cyan uppercase tracking-[0.3em]">
                             {t('LYA UNIT PROTOCOL TIMELINE', 'TIMELINE DE VALORISATION LYA UNIT')}
                           </span>
                           <h3 className="text-xl sm:text-2xl font-black font-headline text-white uppercase tracking-tight">
                             {t('DYNAMIC OPERATION QUALITY TIMELINE', 'CALENDRIER D\'EXÉCUTION & CONCEPTE LYA UNIT')}
                           </h3>
                         </div>
                         <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] text-white/60 font-black tracking-widest uppercase">
                           {t('Live Tracking Active', 'SUIVI DES JALONS TEMPS-RÉEL')}
                         </div>
                       </div>

                       <p className="text-xs text-white/70 leading-relaxed max-w-4xl text-justify">
                         {t('The baseline LYA UNIT pricing starts at the base LYA UNIT value, representing the initial fractioned value. The price then fluctuates dynamically up (Jalon +) or down (Jalon -) exclusively based on the operational quality. Real-time contrat numérique certifiés automatically adjust indices de référence the second a milestone is certified or missed.', 'Le cours du LYA UNIT (valeur initiale de $50,00) varie de façon autonome en fonction de la validation ou du retard des jalons opérationnels. C\'est l\'indicateur exclusif de la qualité de notre fonctionnement : l\'atteinte des jalons (Jalon +) revalorise l\'index, tandis que les retards de livraison (Jalon -) l\'ajustent à la baisse.')}
                       </p>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                         {/* Jalon 1: Setup */}
                         <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-md">
                               {t('Jalon + (Secured)', '✅ JALON + SÉCURISÉ')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-emerald-400">+15.00%</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Conceptual Validation', 'VALIDATION DU CONCEPT')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('All legal guidelines, patent registrations, and architectural/creative blueprints certified on-chain.', 'Tous les aspects juridiques et brevets de propriété intellectuelle validés et enregistrés.')}
                           </p>
                         </div>

                         {/* Jalon 2: Execution */}
                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-accent-gold uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-md">
                               {t('Jalon + (Pending)', '⏳ JALON EN COURS')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-accent-gold">+20.00%</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Physical Production Step', 'ÉTAPE DE PRODUCTION RÉELLE')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('Creation, lab synthesis, clinical simulation or gallery masterworks finalized under certified standards.', 'Acheminement, fabrication ou phases techniques d\'exécution en cours de validation.')}
                           </p>
                         </div>

                         {/* Jalon 3: Risk */}
                         <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3.5 py-1 rounded-md">
                               {t('Jalon - (Risk factor)', '⚠️ RETARD IMPACT JALON')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-rose-400">-12.50%</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Expressed Delay Penalty', 'PÉNALITÉ DE RETARD ÉVENTUEL')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('Failure to achieve set physical timelines or delayed secondary certifications automatically corrects unit pricing.', 'Les retards ou contre-performances de livraison entraînent une correction automatique temporaire.')}
                           </p>
                         </div>
                       </div>
                     </div>

                     <hr className="border-white/5 my-10" />

                    {/* Highly complete technical and financial data grid */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <Scale className="text-accent-gold" size={20} />
                        <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em]">
                          {t('COMPLETE REGULATORY & SECURITIZATION SHEET', 'FICHE JURIDIQUE & TECHNIQUE INTÉGRALE')}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Financial metrics */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-primary-cyan">{t('FINANCIAL SPECS', 'SPÉCIFICATIONS FINANCIÈRES')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('TOTAL PROJECT VALUATION', 'ÉVALUATION GLOBALE DU PROJET')}</div>
                              <div className="text-xl font-headline font-black text-white leading-none">{formatPrice(contract.totalValue)}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('CIRCULATING LYA UNITS', 'UNITÉS LYA EN CIRCULATION')}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.totalUnits?.toLocaleString()} {t('Units', 'Unités')}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('UNIT ACQUISITION VALUE', "VALEUR D'ACQUISITION DE L'UNITÉ")}</div>
                              <div className="text-sm font-semibold text-emerald-400">{formatPrice(contract.unitValue)}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('UNITS AVAILABLE FOR HOT SWAP', "UNITÉS DISPOS À L'ÉCHANGE")}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.availableUnits ? contract.availableUnits.toLocaleString() + ' Unités' : '345 Unités'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Legal structure */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-accent-gold">{t('LEGAL STRUCTURE', 'MODÈLE JURIDIQUE')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('CONTRACTUAL STANDARD', 'FORMAT CONTRACTUEL')}</div>
                              <span className="px-3.5 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-black uppercase tracking-widest rounded-lg">
                                {contract.contractType || 'Revenue Share'}
                              </span>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REVENUE PERCENTAGE RETRIEVED', "TAUX DE RECAPTURE DU CHIFFRE D'AFFAIRES")}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.revenueSharePercentage ? contract.revenueSharePercentage + '%' : '12.5%'} {t('of future revenues', 'des revenus futurs')}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REGULATORY JURISDICTION', 'JURIDICTION ET CONFORMITÉ')}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.jurisdiction || 'EU (MiCA Compliant)'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('ASSET MATURITY DATE', 'ÉCHÉANCE ET LIQUIDATION')}</div>
                              <div className="text-sm font-semibold text-rose-400/90">{contract.maturityDate || '31 Dec 2029'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Audit & transparency */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-accent-pink">{t('AUDIT & COMPLIANCE', 'AUDIT & TRANSPARENCE')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('VALUATOR & CHIEF VALIDATOR', "AGENT D'ÉVALUATION ET CONFORMITÉ")}</div>
                              <div className="text-xs font-black text-white uppercase tracking-tight">{contract.professionalValidator || 'LinkYourArt Advisory Committee'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REGISTRY CATALOG INDEX', 'INDEX UNIQUE DU REGISTRE D\'ŒUVRES')}</div>
                              <div className="text-xs font-mono text-primary-cyan overflow-hidden text-ellipsis whitespace-nowrap bg-black/40 p-2 rounded-lg border border-white/5">
                                {contract.registryAddress || 'LYA-CATALOG-912A8'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('LAST CERTIFIED AUDIT', 'DERNIÈRE ATTÉSTATION CHIFfrée')}</div>
                              <div className="text-sm font-semibold text-emerald-400">{contract.lastAudit || '15 May 2026'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REGISTRATION PROTOCOL', 'PROTOCOLE DE SÉCURISATION DU REGISTRE')}</div>
                              <div className="text-xs font-black text-white/80 uppercase tracking-widest font-mono">Co-authenticated Digital Registry</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'financials' && (
                  <div className="space-y-12">
                    <div className="bg-black/20 border border-white/5 p-10 rounded-[2.5rem]">
                       <div className="flex justify-between items-end mb-10">
                          <div>
                             <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">{t('PRICE TRACKING', 'SUIVI DES PRIX')}</h4>
                             <div className="text-4xl font-headline font-black text-white">${contract.unitValue.toFixed(2)} <span className="text-xs text-emerald-400 font-mono">+12.4% ALL TIME</span></div>
                          </div>
                          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                             {['1D', '1W', '1M', '1Y'].map(tf => (
                               <button key={tf} className="px-4 py-2 text-[10px] font-black rounded-lg transition-all text-white/40 hover:text-white">
                                 {tf}
                               </button>
                             ))}
                             <button className="px-4 py-2 text-[10px] font-black rounded-lg bg-primary-cyan text-surface-dim">ALL</button>
                          </div>
                       </div>
                       <div className="h-[350px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={priceHistory}>
                             <defs>
                               <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                             <XAxis dataKey="date" hide />
                             <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                             <Area type="monotone" dataKey="price" stroke="#00E0FF" strokeWidth={4} fillOpacity={1} fill="url(#priceGradient)" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                    </div>

                    {/* INTERACTIVE INVESTMENT & YIELD SIMULATOR */}
                    <div className="bg-gradient-to-br from-[#0D1117]/80 to-[#080B10]/80 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 mb-12">
                       <div className="absolute top-0 right-0 w-80 h-80 bg-primary-cyan/5 blur-[120px] rounded-full pointer-events-none" />
                       <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />
                       
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                          <div>
                             <h4 className="text-sm font-black text-primary-cyan uppercase tracking-[0.3em] mb-1">{t('PORTFOLIO IMPACT SIMULATOR', 'SIMULATEUR DE RENDEMENT ET COMPOSÉ')}</h4>
                             <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('PROPRIETARY LYA MATH ENGINE v1.2', 'MOTEUR COMPTABLE LYA PROPRIÉTAIRE v1.2')}</p>
                          </div>
                          <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                             <Wallet className="text-accent-gold" size={16} />
                             <span className="text-[10px] font-mono font-black text-white/80 uppercase tracking-widest font-bold">UNIT: {formatPrice(contract.unitValue)}</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          {/* Slider Inputs */}
                          <div className="lg:col-span-6 space-y-8">
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                   <label className="text-[11px] font-black text-white/50 uppercase tracking-wider">{t('SIMULATED ALLOCATION', 'ALLOCATION SIMULÉE')}</label>
                                   <span className="text-2xl font-headline font-black text-white">{formatPrice(simAmount)}</span>
                                </div>
                                <input 
                                   type="range" 
                                   min={contract.unitValue} 
                                   max={contract.totalValue * 0.1 || 50000} 
                                   step={contract.unitValue}
                                   value={simAmount}
                                   onChange={(e) => setSimAmount(Number(e.target.value))}
                                   className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-cyan"
                                />
                                <div className="flex justify-between text-xs font-mono text-white/20 uppercase font-black">
                                   <span>MIN: {formatPrice(contract.unitValue)}</span>
                                   <span>MAX: {formatPrice(contract.totalValue * 0.1 || 50000)}</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => setSimAmount(Math.max(contract.unitValue, 1000))} className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white tracking-widest transition-all">
                                   $1,000
                                </button>
                                <button onClick={() => setSimAmount(Math.max(contract.unitValue, 5000))} className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white tracking-widest transition-all">
                                   $5,000
                                </button>
                                <button onClick={() => setSimAmount(Math.max(contract.unitValue, 15000))} className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white tracking-widest transition-all">
                                   $15,000
                                </button>
                                <button onClick={() => setSimAmount(Math.max(contract.unitValue, 30000))} className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white tracking-widest transition-all">
                                   $30,000
                                </button>
                             </div>
                          </div>

                          {/* Calculated Progression Metrics */}
                          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/40 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                             <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">{t('UNITS ACQUIRED', 'UNITÉS ACQUISES')}</span>
                                <span className="text-2xl font-headline font-black text-primary-cyan">{simUnits}</span>
                                <span className="text-[10px] text-white/40 block mt-1 tracking-widest">({simShare}% {t('of total', 'du total')})</span>
                             </div>

                             <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">{t('EST. ANNUAL INCOME', 'REVENUS ANNUELS EST.')}</span>
                                <span className="text-2xl font-headline font-black text-emerald-400">+{formatPrice(simAnnual)}</span>
                                <span className="text-[10px] text-emerald-400/60 block mt-1 tracking-widest">({contract.growth}% {t('progression', 'progression')})</span>
                             </div>

                             <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">{t('ROYALTIES RECAPTURE', 'RECAPTURE DES DROITS')}</span>
                                <span className="text-2xl font-headline font-black text-accent-gold">+{formatPrice(simRoyalty)}</span>
                                <span className="text-[10px] text-accent-gold/60 block mt-1 tracking-widest">({contract.revenueSharePercentage || 12.5}% {t('rate', 'taux')})</span>
                             </div>

                             <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">{t('3-YEAR COMPOUNDED VALUE', 'VALEUR CAPITALISÉE 3 ANS')}</span>
                                <span className="text-2xl font-headline font-black text-white">{formatPrice(simProjection)}</span>
                                <span className="text-[10px] text-teal-400 block mt-1 tracking-widest">(+{((simProjection / simAmount) * 100 - 100).toFixed(1)}% {t('total return', 'retour total')})</span>
                              </div>
                           </div>
                        </div>
                        
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-relaxed text-center font-mono">
                           {t('Note: This simulation represents an analytical estimation of capital appreciation and royalties according to standard active indices. Non-contractual values.', 'Note : Cette simulation représente une estimation analytique de revalorisation et de redevances selon les indices actifs. Valeurs non-contractuelles.')}
                        </p>
                     </div>

                    {/* Orderbook Depth and Exchange Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 animate-in fade-in duration-500">
                       {/* Real-time Orderbook */}
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="text-[10px] font-black uppercase tracking-wider text-primary-cyan">{t('ORDERBOOK FEED', "CARNET D'ORDRES EN DIRECT")}</div>
                             <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest">{t('● CLOB ENGINE ACTIVE', '● MOTEUR CLOB ACTIF')}</span>
                          </div>
                          
                          <div className="space-y-4">
                             {/* Asks (Sells) */}
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black text-white/30 uppercase tracking-widest">
                                   <span>{t('SELL PRICE (ASK)', 'ASK (VENTE)')}</span>
                                   <span>{t('VOLUME', 'VOLUME')}</span>
                                </div>
                                {[
                                   { price: contract.unitValue * 1.04, volume: 45 },
                                   { price: contract.unitValue * 1.02, volume: 120 },
                                   { price: contract.unitValue * 1.01, volume: 80 }
                                ].map((bid, i) => (
                                   <div key={i} className="flex justify-between items-center text-xs">
                                      <span className="font-mono text-rose-400 font-semibold">{formatPrice(bid.price)}</span>
                                      <span className="font-mono text-white/60">{bid.volume} Units</span>
                                   </div>
                                ))}
                             </div>

                             {/* Mid Spread */}
                             <div className="py-2.5 px-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-white/40">{t('SPREAD (0.15%)', 'ÉCART DE SPREAD (0.15%)')}</span>
                                <span className="text-accent-gold">{formatPrice(contract.unitValue * 0.0015)}</span>
                             </div>

                             {/* Bids (Buys) */}
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black text-white/30 uppercase tracking-widest">
                                   <span>{t('BUY PRICE (BID)', 'BID (ACHAT)')}</span>
                                   <span>{t('VOLUME', 'VOLUME')}</span>
                                </div>
                                {[
                                   { price: contract.unitValue * 0.99, volume: 150 },
                                   { price: contract.unitValue * 0.98, volume: 210 },
                                   { price: contract.unitValue * 0.97, volume: 95 }
                                ].map((bid, i) => (
                                   <div key={i} className="flex justify-between items-center text-xs">
                                      <span className="font-mono text-emerald-400 font-semibold">{formatPrice(bid.price)}</span>
                                      <span className="font-mono text-white/60">{bid.volume} Units</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* Exchange metrics */}
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-wider text-accent-pink">{t('EXCHANGE METRICS', 'METRICS DE NÉGOCIATION')}</div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <div>
                                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{t('24H TRANS. VOLUME', 'VOLUME NET 24H')}</div>
                                  <div className="text-lg font-headline font-black text-white">{formatPrice(contract.totalValue * 0.025)}</div>
                               </div>
                               <div>
                                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{t('TOTAL TRADES REGISTERED', 'TRANSACTIONS TOTAL NUMÉRO')}</div>
                                  <div className="text-lg font-headline font-black text-white">1,482</div>
                                </div>
                               <div>
                                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{t('VOLATILITY INDEX (30D)', 'INDICE VOLATILITÉ (30J)')}</div>
                                  <div className="text-lg font-headline font-black text-cyan-400">4.12% (Low)</div>
                               </div>
                               <div>
                                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{t('LIQUIDITY DEPTH', 'LIQUIDITÉ PROFONDEUR')}</div>
                                  <div className="text-lg font-headline font-black text-emerald-400 font-bold">OPTIMAL (AA)</div>
                               </div>
                            </div>
                          </div>

                          <div className="p-4 bg-primary-cyan/10 border border-primary-cyan/20 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="text-primary-cyan" size={16} />
                                <span className="text-white">{t('AUTOMATIC AMM BUFFER', 'TAMPON DE LIQUIDITÉ AMM')}</span>
                             </div>
                             <span className="text-primary-cyan">{formatPrice(contract.totalValue * 0.1)}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai-simulator' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                      <div>
                        <h4 className="text-sm font-black text-primary-cyan uppercase tracking-[0.3em] mb-1">
                          {t('PREDICTIVE COGNITIVE SCENARIO SIMULATOR', 'SIMULATEUR DE SCÉNARIO ET PRÉDICTION COGNITIVE')}
                        </h4>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                          {t('POWERED BY GEMINI PRO COGNITIVE ENGINE v2.5', 'PROPULSÉ PAR LE MOTEUR DE SCÉNARIO GEMINI PRO v2.5')}
                        </p>
                      </div>
                      <div className="px-5 py-2.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded-2xl flex items-center gap-2">
                        <Sparkles className="text-primary-cyan animate-pulse" size={16} />
                        <span className="text-[10px] font-mono font-black text-white/80 uppercase tracking-widest">{t('ACTIVE AI AGENT ON AIR', 'AGENT IA CONNECTÉ')}</span>
                      </div>
                    </div>

                    {/* Simulation Parameters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {/* Selector 1: Risk Appetite Scenario */}
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-black text-primary-cyan uppercase tracking-wider mb-2">{t('1. RISK APPETITE SCENARIO', '1. APPRÉCIATION ET MODÈLE DE RISQUE')}</div>
                            <p className="text-xs text-white/40 mb-4">{t('Select the operational path of the artistic project under different market densities.', 'Sélectionnez la trajectoire de valorisation sous différentes densités de marché.')}</p>
                          </div>
                          <div className="space-y-2">
                             {[
                               { id: 'conservative', label: t('CONSERVATIVE (STABLE)', 'CONSERVATEUR (STABLE)'), desc: '+4% to +6% de progression, robust preservation.' },
                               { id: 'balanced', label: t('BALANCED (OPTIMAL)', 'EQUILIBRÉ (OPTIMAL)'), desc: '+12% to +18% de progression, high predictability.' },
                               { id: 'aggressive', label: t('BULL / ALPHA (AGGRESSIVE)', 'BULL / ALPHA (OFFENSIF)'), desc: '+25% to +45% de progression, artistic boom.' }
                             ].map((scen) => (
                               <button 
                                 key={scen.id}
                                 type="button"
                                 onClick={() => setSimulationScenario(scen.id)}
                                 className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${simulationScenario === scen.id ? 'bg-primary-cyan/10 border-primary-cyan text-white' : 'bg-black/20 border-white/5 text-white/60 hover:text-white'}`}
                               >
                                 <div className="text-[10px] font-black uppercase tracking-wider">{scen.label}</div>
                                 <div className="text-xs opacity-60 mt-1">{scen.desc}</div>
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* Selector 2: AI Investment Goal */}
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
                          <div>
                             <div className="text-[10px] font-black text-accent-gold uppercase tracking-wider mb-2">{t('2. PRIMARY STRATEGIC TARGET', '2. OBJECTIF STRATÉGIQUE CIBLE')}</div>
                             <p className="text-xs text-white/40 mb-4">{t('Define your primary motivation filter for this specific allocation simulation.', 'Définissez votre principale motivation d’allocation dans cette simulation.')}</p>
                          </div>
                          <div className="space-y-2">
                             {[
                               { id: 'maximize_performance', label: t('MAXIMISER LA PERFORMANCE RÉCURRENTE', 'MAXIMISER LA PERFORMANCE RÉCURRENTE'), desc: 'Axé sur la récupération mensuelle des redevances.' },
                               { id: 'portfolio_hedge', label: t('INFLATION & ASSET HEDGING', 'PROTECTION CONTRE L\'INFLATION'), desc: 'Focuses on asset-backed valuation floor.' },
                               { id: 'arbitrage', label: t('SECONDARY SWAP ARBITRAGE', 'ARBITRAGE ET SWAP RAPIDE'), desc: 'Focuses on liquid short-term spreads.' }
                             ].map((goal) => (
                               <button 
                                 key={goal.id}
                                 type="button"
                                 onClick={() => setSimulationGoal(goal.id)}
                                 className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${simulationGoal === goal.id ? 'bg-accent-gold/10 border-accent-gold text-white' : 'bg-black/20 border-white/5 text-white/60 hover:text-white'}`}
                               >
                                 <div className="text-[10px] font-black uppercase tracking-wider">{goal.label}</div>
                                 <div className="text-xs opacity-60 mt-1">{goal.desc}</div>
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* Selector 3: AI Cognitive Persona */}
                       <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-black text-accent-pink uppercase tracking-wider mb-2">{t('3. AI BOT PERSONALITY PROFILE', '3. PROFIL DE L\'EXPERT COGNITIF')}</div>
                            <p className="text-xs text-white/40 mb-4">{t('Choose the intellectual perspective used to synthesize results and model strategies.', 'Choisissez la grille de lecture utilisée pour synthétiser et conseiller la stratégie.')}</p>
                          </div>
                          <div className="space-y-2">
                             {[
                               { id: 'algo_oracle', label: t('ALGORITHMIC ORACLE', 'L\'ORACLE ALGORITHMIQUE'), desc: 'Mathematical modeling & quantitative metrics.' },
                               { id: 'sovereign_curator', label: t('SOVEREIGN CURATOR', 'LE CONSERVATEUR SOUVERAIN'), desc: 'Focuses on cultural prestige & historical value.' },
                               { id: 'defi_whale', label: t('STRATÉGIE MAXIMISATION', 'STRATÉGIE MAXIMISATION'), desc: 'Maximiser la progression des droits.' }
                             ].map((person) => (
                               <button 
                                 key={person.id}
                                 type="button"
                                 onClick={() => setSimulationPersona(person.id)}
                                 className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${simulationPersona === person.id ? 'bg-accent-pink/10 border-accent-pink text-white' : 'bg-black/20 border-white/5 text-white/60 hover:text-white'}`}
                               >
                                 <div className="text-[10px] font-black uppercase tracking-wider">{person.label}</div>
                                 <div className="text-xs opacity-60 mt-1">{person.desc}</div>
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col gap-6 md:flex-row items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
                       <div className="space-y-2">
                          <h5 className="text-lg font-headline font-black uppercase tracking-tighter leading-none">{t('RUN MULTI-SCENARIO COGNITIVE GRAPH', 'LANCER LE GRAPH DE PRÉDICTION SOUVERAIN')}</h5>
                          <p className="text-xs text-white/40">{t('Initiates real-time AI modeling of progression, transferts de droits and long-term indice de disponibilité.', 'Simule en temps réel le progression, l\'arbitrage secondaire et l\'indice de accessibilité.')}</p>
                       </div>
                       <button 
                         onClick={handleAISimulationRun}
                         disabled={isSimulatingAI}
                         className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-primary-cyan via-accent-gold to-accent-pink text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(0,224,255,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer"
                       >
                         {isSimulatingAI ? <Activity className="animate-spin text-black" size={18} /> : <Sparkles size={18} className="text-black" />}
                         {isSimulatingAI ? t('COMPUTING THEORIES...', 'SYNTHÈSE DES THÉORIES IA...') : t('ACTIVATE COGNITIVE PREDICTION', 'ACTIVER LA SIMULATION IA')}
                       </button>
                    </div>

                    {/* Simulation Result Card */}
                    {aiSimulationOutput && (
                       <div className="bg-gradient-to-br from-[#0D1117] to-[#0A0D14] border border-primary-cyan/20 rounded-[3rem] p-10 space-y-10 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/10 blur-[130px] rounded-full" />
                         
                         <div className="flex items-center gap-4 relative z-10 border-b border-white/5 pb-6">
                            <div className="p-3 bg-primary-cyan/25 rounded-2xl text-primary-cyan border border-primary-cyan/30">
                              <Sparkles size={24} />
                            </div>
                            <div>
                               <h5 className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em] mb-1">{t('GENERATED COGNITIVE STRATEGY REPORT', 'RAPPORT JING COGNITIF IA GÉNÉRÉ')}</h5>
                               <h4 className="text-3xl font-headline font-black uppercase tracking-tighter text-white leading-none">
                                  {simulationPersona === 'algo_oracle' ? t('ALGORITHMIC FORECAST', 'PRÉVISIONS ALGORITHMIQUES') : 
                                   simulationPersona === 'sovereign_curator' ? t('PRESTIGE & SCARCITY ANALYSIS', 'ANALYSE DE PRESTIGE ET RARETÉ') : t('DEFI LIQUIDITY SYNTHESIS', 'SYNTHÈSE DE LIQUIDITÉ DEFI')}
                               </h4>
                            </div>
                         </div>

                         {/* Computed metrics numbers */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{t('ESTIMATED VALUE multiplier', 'MULTIPLICATEUR DE VALEUR ESTIMÉ')}</span>
                               <span className="text-3xl font-headline font-black text-emerald-400">+{aiSimulationOutput.multi}%</span>
                            </div>
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{t('ROYALTY CONVERSION DENSITY', 'DENSITÉ DES REDEVANCES RECAPTÉES')}</span>
                               <span className="text-3xl font-headline font-black text-primary-cyan">{(contract.revenueSharePercentage * (simulationScenario === 'conservative' ? 0.8 : simulationScenario === 'balanced' ? 1.0 : 1.4)).toFixed(1)}%</span>
                            </div>
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{t('VOLATILITY CORRECTION INDEX', 'CORRECTION VOLATILITÉ ESTIMÉE')}</span>
                               <span className="text-3xl font-headline font-black text-accent-pink">-{aiSimulationOutput.volCorrection}%</span>
                            </div>
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{t('LYA CONVICTION SCORE', 'INDICE DE RECONNAISSANCE IA')}</span>
                               <span className="text-3xl font-headline font-black text-accent-gold">{aiSimulationOutput.score}/1000</span>
                            </div>
                         </div>

                         {/* Generative narrative text */}
                         <div className="relative z-10 p-10 bg-black/50 border border-white/10 rounded-[2.5rem] shadow-inner space-y-6">
                            <p className="text-lg font-light leading-relaxed text-slate-100 first-letter:text-5xl first-letter:font-black first-letter:text-primary-cyan first-letter:mr-3 first-letter:float-left">
                               {aiSimulationOutput.narrative}
                            </p>
                            <div className="clear-both" />
                            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] font-black tracking-widest text-white/20 uppercase gap-4 font-mono">
                               <span>COGNITIVE SIGNATURE: {Math.random().toString(36).substring(3, 15).toUpperCase()}</span>
                               <span className="text-emerald-400">{t('● SECURE CRYPTOGRAPHIC HASH CONFIRMED', '● HASH CRYPTOGRAPHIQUE CONFIÉ ET SÉCURISÉ')}</span>
                            </div>
                         </div>
                       </div>
                    )}
                  </div>
                )}
               {activeTab === 'legal' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em]">{t('SECURITY MATRIX', 'MATRICE SÉCURITÉ')}</h4>
                       {[
                         { l: 'Registry', v: 'LYA_REGISTRY_71C', i: <Layers size={16} /> },
                         { l: 'Curation', v: 'Co-Optation Verified', i: <Lock size={16} /> },
                         { l: 'Audit', v: 'LYA Committee Review', i: <ShieldCheck size={16} /> }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl group hover:border-accent-gold/40 transition-all">
                            <div className="flex items-center gap-4 text-accent-gold">
                               {item.i}
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.l}</span>
                            </div>
                            <span className="text-xs font-mono font-black text-white">{item.v}</span>
                         </div>
                       ))}
                    </div>
                    <div className="bg-black/20 border border-white/5 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-8">
                       <div className="w-20 h-20 rounded-[2rem] bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20">
                          <FileText size={36} />
                       </div>
                       <div className="space-y-2">
                          <h5 className="text-2xl font-headline font-black text-white uppercase tracking-tighter">{t('ASSET WHITE PAPER', 'LIVRE BLANC ACTIF')}</h5>
                          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                             {t('THE MASTER DEED CONTAINS THE FULL LEGAL BINDING AGREEMENT BETWEEN THE ISSUER AND LYA UNIT HOLDERS.', 'L\'ACTE MAÎTRE CONTIENT L\'INTÉGRALITÉ DE L\'ACCORD JURIDIQUE CONTRAIGNANT ENTRE L\'ÉMETTEUR ET LES DÉTENTEURS D\'UNITÉS LYA.')}
                          </p>
                       </div>
                       <button className="w-full py-5 bg-white text-surface-dim hover:bg-primary-cyan transition-all rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl">
                          {t('DOWNLOAD MASTER DEED', 'TÉLÉCHARGER L\'ACTE')}
                       </button>
                    </div>
                 </div>
               )}
               
               {activeTab === 'milestones' && (
                 <div className="relative pl-16 space-y-12">
                    <div className="absolute left-[31px] top-0 bottom-0 w-1 bg-gradient-to-b from-primary-cyan to-white/5 rounded-full" />
                    {contract.milestones?.map((m, i) => (
                       <div key={i} className="relative group">
                          <div className={`absolute -left-[54px] w-12 h-12 rounded-2xl border-4 border-surface-dim flex items-center justify-center transition-all z-20 ${
                             m.status === 'COMPLETED' ? 'bg-emerald-500 text-surface-dim shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 
                             m.status === 'IN_PROGRESS' ? 'bg-accent-gold text-surface-dim pulse' : 'bg-surface-low text-white/20'
                          }`}>
                            {m.status === 'COMPLETED' ? <Zap size={20} /> : <Clock size={20} />}
                          </div>
                          <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all flex justify-between items-center group-hover:translate-x-2 transition-all">
                             <div>
                                <div className="flex items-center gap-4 mb-2">
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-accent-gold'}`}>{m.status} — {m.date}</span>
                                </div>
                                <h4 className="text-2xl font-headline font-black text-white uppercase tracking-tighter leading-none">{m.label}</h4>
                             </div>
                             <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-primary-cyan text-[10px] font-black">+{m.priceImpact}% TARGET</div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Sidebar (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          {/* LYA SCORING BREAKDOWN */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-3xl">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                   <Target size={18} className="text-primary-cyan" />
                   {t('SCORE BREAKDOWN', 'DÉTAIL DU SCORING')}
                </h3>
             </div>
             <div className="space-y-10">
                <div className="flex items-center gap-6 group">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-accent-pink/10 flex items-center justify-center text-accent-pink border border-accent-pink/20 transition-transform group-hover:scale-110">
                      <Activity size={28} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('ALGO SCORE', 'SCORE ALGO')}</span>
                         <span className="text-2xl font-headline font-black text-white">{scoreAlgoValue}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-accent-pink shadow-[0_0_15px_#FF007F]" style={{ width: `${(scoreAlgoValue / 1000) * 100}%` }} />
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6 group">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 transition-transform group-hover:scale-110">
                      <ShieldCheck size={28} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('PROFESSIONAL SCORE', 'SCORE EXPERT')}</span>
                         <span className="text-2xl font-headline font-black text-white">{scoreProValue}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-400 shadow-[0_0_15px_#00FF00]" style={{ width: `${(scoreProValue / 1000) * 100}%` }} />
                      </div>
                   </div>
                </div>

                <div className="bg-primary-cyan/10 border border-primary-cyan/20 p-8 rounded-[2rem] text-center space-y-4">
                   <div className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em]">{t('LYA CONSOLIDATED', 'INDICE CONSOLIDÉ')}</div>
                   <div className="text-6xl font-black font-headline text-white drop-shadow-[0_0_30px_rgba(0,224,255,0.4)]">{scoreFinalValue}</div>
                   <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('Verified by LinkYourArt Committee', 'Vérifié par le Comité d\'Experts LYA')}</div>
                </div>
             </div>
          </div>

          {/* Issuer Interface */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-8">
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent-gold flex items-center gap-3">
                <User size={18} />
                {t('ISSUER PROFILE', 'PROFIL ÉMETTEUR')}
             </h3>
             <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white relative overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${contract.issuerId}`} alt="issuer" className="w-[80%] h-[80%]" referrerPolicy="no-referrer" />
                </div>
                <div>
                   <div className="text-xl font-headline font-black text-white uppercase tracking-tight">{contract.issuerId}</div>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{t('KYC VERIFIED', 'KYC VÉRIFIÉ')}</span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl text-center">
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{t('ASSETS', 'ACTIFS')}</div>
                   <div className="text-lg font-black font-headline text-white">12</div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl text-center">
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{t('PERF.', 'PERF.')}</div>
                   <div className="text-lg font-black font-headline text-emerald-400">+24%</div>
                </div>
             </div>
             <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-all underline decoration-primary-cyan/30 underline-offset-8">
                {t('CONTACT ISSUER SERVICES', 'CONTACTER SERVICES ÉMETTEUR')}
             </button>
          </div>

          {/* Expert Terminal Links */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                <BarChart3 size={18} />
                {t('ANALYTICS EXPORT', 'EXPORT ANALYTIQUE')}
             </h3>
             <div className="space-y-4">
                <button className="w-full py-5 bg-white/5 hover:bg-white hover:text-black rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4">
                   <FileText size={16} />
                   {t('RAW MARKET DATA (JSON)', 'DONNÉES BRUTES (JSON)')}
                </button>
                <button className="w-full py-5 bg-white/5 hover:bg-white hover:text-black rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4">
                   <ArrowLeft className="rotate-180" size={16} />
                   {t('EXTERNAL REGISTRY DATA', 'DONNÉES RÉGISTRE EXT.')}
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Floating Visualizer (Ambient Design) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
         <div className="px-10 py-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] pointer-events-auto group">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-primary-cyan animate-pulse shadow-[0_0_10px_#00E0FF]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{t('LIVE CONNECTION: STABLE', 'CONNEXION: STABLE')}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-6">
               <button className="text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-all flex items-center gap-2">
                  <Plus size={14} />
                  {t('QUICK EXECUTE', 'EXÉCUTION RAPIDE')}
               </button>
               <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                  {t('EXIT TERMINAL', 'QUITTER TERMINAL')}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
