
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  Star as StarFilled,
  Sparkles,
  TrendingDown,
  Target
} from 'lucide-react';
import { Contract, PillarScore } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
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
  PolarRadiusAxis
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
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'legal' | 'milestones' | 'messaging'>('overview');
  const [priceTimeframe, setPriceTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [revenueTimeframe, setRevenueTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'LYA Protocol', content: 'Secure communication channel established for this project.', time: 'System' },
    { id: '2', sender: 'Institutional Terminal', content: 'Verification complete. Project ready for institutional engagement.', time: '10:45 AM' },
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [investmentThesis, setInvestmentThesis] = useState<{ bullCase: string, bearCase: string, milestones: string[] } | null>(null);
  const [isGeneratingThesis, setIsGeneratingThesis] = useState(false);

  const handleGenerateAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { generateAssetAnalysis } = await import('../services/geminiService');
      const analysis = await generateAssetAnalysis(contract.name, contract.description, contract.totalScore);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed', error);
      onNotify('ANALYSIS SYNTHESIS FAILED.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateThesis = async () => {
    setIsGeneratingThesis(true);
    try {
      const { generateInvestmentThesis } = await import('../services/geminiService');
      const thesis = await generateInvestmentThesis(contract.name, contract.description);
      setInvestmentThesis(thesis);
    } catch (error) {
      console.error('Thesis generation failed', error);
      onNotify('INVESTMENT THESIS GENERATION FAILED.');
    } finally {
      setIsGeneratingThesis(false);
    }
  };

  const [orderVolume, setOrderVolume] = useState(1);
  const [orderPrice, setOrderPrice] = useState(contract.unitValue);

  const handleExecuteOrder = (type: 'BUY' | 'SELL') => {
    if (orderVolume <= 0) {
      onNotify(t('INVALID VOLUME', 'VOLUME INVALIDE'));
      return;
    }
    if (orderPrice <= 0) {
      onNotify(t('INVALID PRICE', 'PRIX INVALIDE'));
      return;
    }
    onPlaceOrder(contract, type, orderPrice, orderVolume);
  };

  // Mock historical revenue data
  const revenueData = useMemo(() => {
    const baseData = [
      { month: 'Oct 25', revenue: 12500, projection: 12000, benchmark: 11000 },
      { month: 'Nov 25', revenue: 15800, projection: 14000, benchmark: 11500 },
      { month: 'Dec 25', revenue: 14200, projection: 15000, benchmark: 12000 },
      { month: 'Jan 26', revenue: 18900, projection: 17000, benchmark: 12500 },
      { month: 'Feb 26', revenue: 22400, projection: 20000, benchmark: 13000 },
      { month: 'Mar 26', revenue: 25600, projection: 24000, benchmark: 13500 },
    ];

    if (revenueTimeframe === '1D') return baseData.slice(-1).map(d => ({ ...d, month: 'Today' }));
    if (revenueTimeframe === '1W') return baseData.slice(-2);
    if (revenueTimeframe === '1M') return baseData.slice(-4);
    return baseData;
  }, [revenueTimeframe]);

  const pillarData = contract.pillars.map(p => ({
    name: p.label,
    value: p.score,
    full: 200
  }));

  const COLORS = ['#00E0FF', '#FFD700', '#FF00FF', '#00FF00', '#FF4500'];

  // Mock price history data
  const priceHistory = useMemo(() => {
    const baseHistory = [
      { date: '2025-10', price: contract.unitValue * 0.85 },
      { date: '2025-11', price: contract.unitValue * 0.88 },
      { date: '2025-12', price: contract.unitValue * 0.92 },
      { date: '2026-01', price: contract.unitValue * 0.95 },
      { date: '2026-02', price: contract.unitValue * 0.98 },
      { date: '2026-03', price: contract.unitValue },
    ];

    if (priceTimeframe === '1D') return [{ date: '09:00', price: contract.unitValue * 0.99 }, { date: '12:00', price: contract.unitValue * 1.01 }, { date: '17:00', price: contract.unitValue }];
    if (priceTimeframe === '1W') return baseHistory.slice(-2);
    if (priceTimeframe === '1M') return baseHistory.slice(-4);
    return baseHistory;
  }, [priceTimeframe, contract.unitValue]);

  const contractSentiment = useMemo(() => {
    if (contract.growth > 10) return { label: t('BULLISH', 'HAUSSIER'), color: 'text-emerald-400', value: 88 };
    if (contract.growth > 0) return { label: t('NEUTRAL', 'NEUTRE'), color: 'text-primary-cyan', value: 58 };
    return { label: t('BEARISH', 'BAISSIER'), color: 'text-red-400', value: 32 };
  }, [contract.growth, t]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 relative z-10 bg-surface-dim border-b border-white/5 pb-12 pt-8 -mx-6 md:-mx-12 px-6 md:px-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary-cyan hover:border-primary-cyan/50 transition-all active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs md:text-sm font-mono text-primary-cyan font-bold uppercase tracking-[0.3em]">{contract.registryIndex}</span>
              <div className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] ${
                contract.rarity === 'Legendary' ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' :
                contract.rarity === 'Epic' ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/30' :
                contract.rarity === 'Rare' ? 'bg-primary-cyan/20 text-primary-cyan border border-primary-cyan/30' :
                'bg-white/10 text-on-surface-variant border border-white/20'
              }`}>
                {contract.rarity}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white leading-[0.9] uppercase flex items-center gap-4">
              {contract.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button
            onClick={(e) => onToggleWatchlist?.(e, contract.id)}
            className={`p-4 rounded-2xl border transition-all active:scale-95 ${
              isWatchlisted 
                ? 'bg-primary-cyan/10 border-primary-cyan/30 text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:border-white/20'
            }`}
          >
            <Star size={24} className={isWatchlisted ? 'fill-primary-cyan' : ''} />
          </button>
          <div className="flex gap-3 flex-1 lg:flex-none">
            <button 
              onClick={() => onTrade(contract, 'BUY')}
              className="flex-1 lg:flex-none px-10 py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,224,255,0.2)] active:scale-95"
            >
              {t('Buy Units', 'Acheter des Unités')}
            </button>
            <button 
              onClick={() => onTrade(contract, 'SELL')}
              className="flex-1 lg:flex-none px-10 py-4 bg-accent-pink text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-accent-pink transition-all shadow-[0_20px_40px_rgba(255,0,255,0.2)] active:scale-95"
            >
              {t('Sell Units', 'Vendre des Unités')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image & Quick Stats */}
          <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
            <img 
              src={contract.image} 
              alt={contract.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-wrap gap-6 items-end justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{t('Algorithmic Score', 'Score Algorithmique')}</div>
                      <div className="text-2xl font-black text-white font-headline">{contract.scoreAlgo || 0}/500</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">{t('Professional Rating', 'Évaluation Pro')}</div>
                      <div className="text-2xl font-black text-white font-headline">{contract.scorePro || 0}/500</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-cyan/10 backdrop-blur-xl border border-primary-cyan/20 flex items-center justify-center text-primary-cyan shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                      <Zap size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] text-primary-cyan uppercase tracking-widest font-black">{t('Final LYA Score', 'Score LYA Final')}</div>
                      <div className="text-2xl font-black text-primary-cyan font-headline">
                        {Math.round(((contract.scoreAlgo || 0) + (contract.scorePro || 0)) / 2)}/1000
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/80 max-w-xl leading-relaxed">
                  {contract.description}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 flex gap-8">
                <div className="text-center">
                  <div className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">{t('Total Value', 'Valeur Totale')}</div>
                  <div className="text-lg font-black text-white font-headline">${(contract.totalValue / 1000).toFixed(0)}K</div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">{t('Unit Price', 'Prix Unitaire')}</div>
                  <div className="text-lg font-black text-primary-cyan font-headline">${contract.unitValue}</div>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">{t('Growth', 'Croissance')}</div>
                  <div className={`text-lg font-black font-headline ${contract.growth >= 0 ? 'text-emerald-400' : 'text-accent-pink'}`}>
                    {contract.growth >= 0 ? '+' : ''}{contract.growth}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'overview', label: t('Overview', 'Aperçu'), icon: <Activity size={16} /> },
              { id: 'financials', label: t('Financials', 'Finances'), icon: <TrendingUp size={16} /> },
              { id: 'legal', label: t('Legal & Compliance', 'Juridique & Conformité'), icon: <ShieldCheck size={16} /> },
              { id: 'milestones', label: t('Milestones', 'Jalons'), icon: <Clock size={16} /> },
              { id: 'messaging', label: t('Instant messaging', 'Messagerie Instantanée'), icon: <MessageSquare size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative ${
                  activeTab === tab.id ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* AI Executive Summary Card */}
                <div className="col-span-1 md:col-span-2 bg-primary-cyan/5 border border-primary-cyan/20 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary-cyan/10 transition-all duration-1000" />
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           <div className="w-8 h-8 rounded-full bg-primary-cyan/20 border border-primary-cyan/40 flex items-center justify-center text-primary-cyan">
                             <Sparkles size={14} />
                           </div>
                           <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold">
                             <Target size={14} />
                           </div>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-primary-cyan">
                          {t('AI EXECUTIVE SUMMARY', 'RÉSUMÉ EXÉCUTIF IA')}
                        </h3>
                      </div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-60 italic">{t('REAL-TIME GENERATIVE SYNOPSIS FOR INSTITUTIONAL ALLOCATION', 'SYNOPSIS GÉNÉRATIF EN TEMPS RÉEL POUR L\'ALLOCATION INSTITUTIONNELLE')}</p>
                    </div>
                    {!aiAnalysis && (
                      <button 
                        onClick={handleGenerateAiAnalysis}
                        disabled={isAnalyzing}
                        className="px-10 py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,224,255,0.4)] disabled:opacity-50 group/btn flex items-center gap-3"
                      >
                        {isAnalyzing ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-surface-dim border-t-transparent rounded-full animate-spin" />
                            {t('SYNTHESIZING...', 'SYNTHÈSE...')}
                          </div>
                        ) : (
                          <>
                            <Zap size={16} className="group-hover:animate-pulse" />
                            {t('GENERATE SYNOPSIS', 'GÉNÉRER LA SYNTHÈSE')}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {aiAnalysis ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-cyan via-accent-gold to-transparent opacity-40" />
                      <p className="text-lg md:text-xl font-light text-white leading-relaxed italic opacity-90 indent-8">
                        "{aiAnalysis}"
                      </p>
                      <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-8">
                          <div className="space-y-1">
                             <div className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest opacity-40">{t('VERACITY INDEX', 'INDICE DE VÉRACITÉ')}</div>
                             <div className="text-xs font-mono text-emerald-400 font-bold">99.98% SECURE</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest opacity-40">{t('COMPUTATION TERMINAL', 'TERMINAL DE CALCUL')}</div>
                             <div className="text-xs font-mono text-primary-cyan font-bold">GEMINI_FLASH_LATENCY_OPTIMIZED</div>
                          </div>
                        </div>
                        <button 
                          onClick={handleGenerateAiAnalysis}
                          className="text-[9px] text-primary-cyan uppercase font-black tracking-[0.3em] hover:text-white transition-colors underline underline-offset-8"
                        >
                          {t('RE-CALCULATE ANALYSIS', 'RECALCULER L\'ANALYSE')}
                        </button>
                      </div>
                    </motion.div>
                  ) : !isAnalyzing && (
                    <div className="py-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 group-hover:border-primary-cyan/20 transition-all">
                      <div className="w-20 h-20 bg-primary-cyan/5 rounded-full flex items-center justify-center text-primary-cyan/20 animate-pulse">
                         <Sparkles size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-on-surface-variant uppercase tracking-[0.3em] font-black">{t('WAITING FOR PROMPT INITIATION', 'EN ATTENTE D\'INITIATION')}</p>
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest leading-relaxed max-w-sm">
                          {t('Activate LYA Intelligence Grid to cross-reference multi-dimensional data nodes for this asset.', 'Activez la Grille d\'Intelligence LYA pour croiser les nœuds de données multidimensionnels.')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                      <BarChart3 size={14} />
                      {t('Intelligence Radar Matrix', 'Matrice Intelligence Radar')}
                    </h3>
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-primary-cyan drop-shadow-[0_0_15px_rgba(0,224,255,0.5)]">
                          {Math.round(((contract.scoreAlgo || 0) + (contract.scorePro || 0)) / 2)}
                        </span>
                        <span className="text-[10px] text-on-surface-variant opacity-40">/1000</span>
                      </div>
                      <span className="text-[8px] text-accent-gold uppercase font-black tracking-widest animate-pulse">{t('Consolidated LYA Score', 'Score LYA Consolidé')}</span>
                    </div>
                  </div>
                  <div className="h-[250px] w-full relative">
                    <div className="absolute inset-0 bg-primary-cyan/5 rounded-full blur-3xl pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pillarData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 8, fontWeight: 900 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                        <Radar
                          name={contract.name}
                          dataKey="value"
                          stroke="#00e0ff"
                          fill="#00e0ff"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {pillarData.map((pillar, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary-cyan" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface/60">{pillar.name}</span>
                        <span className="text-[9px] font-mono text-primary-cyan ml-auto">{pillar.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold flex items-center gap-2">
                  <Sparkles size={14} className="text-accent-gold" />
                  {t('Strategic Investment Thesis', 'Thèse d\'Investissement Stratégique')}
                </h3>
                <button 
                  onClick={handleGenerateThesis}
                  disabled={isGeneratingThesis}
                  className="px-4 py-1.5 bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-accent-gold hover:text-surface-dim transition-all disabled:opacity-50"
                >
                  {isGeneratingThesis ? t('Calculating...', 'Calcul...') : t('Generate Investment Thesis', 'Générer la Thèse')}
                </button>
              </div>

              {investmentThesis ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 gap-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t('Bull Case', 'Cas Favorable')}</span>
                      </div>
                      <p className="text-[11px] text-on-surface/80 leading-relaxed italic line-clamp-4">{investmentThesis.bullCase}</p>
                    </div>
                    <div className="p-4 bg-accent-pink/5 border border-accent-pink/20 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-accent-pink">
                        <TrendingDown size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t('Bear Case', 'Cas Défavorable')}</span>
                      </div>
                      <p className="text-[11px] text-on-surface/80 leading-relaxed italic line-clamp-4">{investmentThesis.bearCase}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-primary-cyan/5 border border-primary-cyan/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-primary-cyan">
                      <Target size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t('Key Strategic Milestones', 'Jalons Stratégiques Clés')}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {investmentThesis.milestones.map((m, idx) => (
                        <div key={idx} className="bg-white/5 p-2 rounded-lg text-[9px] font-bold text-white/70 flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary-cyan rounded-full" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest leading-relaxed opacity-40">
                  {t('Initiate predictive intelligence to map market trajectories and risk factors for this specific creative equity node.', 'Initiez l\'intelligence prédictive pour cartographier les trajectoires de marché et les facteurs de risque pour ce nœud d\'equity créative spécifique.')}
                </p>
              )}
            </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold flex items-center gap-2">
                <Zap size={14} />
                {t('Market Sentiment', 'Sentiment du Marché')}
              </h3>
              <div className="flex items-center gap-4">
                <h3 className={`text-2xl font-black font-headline ${contractSentiment.color}`}>{contractSentiment.label}</h3>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${contractSentiment.value}%` }}
                    className={`h-full ${contractSentiment.color.replace('text-', 'bg-')}`}
                  />
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest leading-relaxed">
                {t('Based on recent growth, registry activity, and professional rating trends.', 'Basé sur la croissance récente, l\'activité du registre et les tendances d\'évaluation professionnelle.')}
              </p>
            </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                  <TrendingUp size={14} />
                  {t('Price History', 'Historique des Prix')}
                </h3>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setPriceTimeframe(tf as any)}
                      className={`px-2 py-1 text-[8px] font-black rounded-md transition-all ${
                        priceTimeframe === tf ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid rgba(0,224,255,0.2)', 
                        borderRadius: '4px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        padding: '8px 12px'
                      }}
                      itemStyle={{ color: '#00E0FF', fontSize: '10px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#ffffff40', fontSize: '8px', marginBottom: '4px', textTransform: 'uppercase' }}
                      formatter={(value: number) => [formatPrice(value), t('Price', 'Prix')]}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00E0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold flex items-center gap-2">
                <Zap size={14} />
                {t('Contract Rights', 'Droits du Contrat')}
              </h3>
                  <div className="space-y-4">
                    {contract.rights.map((right, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-accent-gold/30 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                          <ShieldCheck size={16} />
                        </div>
                        <span className="text-xs font-bold text-on-surface group-hover:text-accent-gold transition-colors">{right}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Institutional Liquidity Risk Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: t('Slippage Index', 'Indice de Glissement'), value: '0.04%', desc: t('Low impact on large volume executions', 'Faible impact sur les exécutions à gros volume'), status: 'OPTIMAL' },
                    { label: t('Volatility Tier', 'Palier de Volatilité'), value: 'LEVEL_02', desc: t('Low standard deviation in peer exchange', 'Faible écart-type dans l\'échange de pairs'), status: 'STABLE' },
                    { label: t('Regulatory Score', 'Score Réglementaire'), value: '98/100', desc: t('Full compliance with LYA v2 standards', 'Conformité totale avec les normes LYA v2'), status: 'SECURE' },
                    { label: t('Institutional Depth', 'Profondeur Institutionnelle'), value: '$45.2M', desc: t('Available liquidity at current peg', 'Liquidité disponible au peg actuel'), status: 'LIQUID' }
                  ].map((risk, i) => (
                    <div key={i} className="bg-surface-low/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl group hover:border-primary-cyan/20 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{risk.label}</span>
                        <div className={`px-2 py-0.5 rounded-sm text-[8px] font-black tracking-widest ${
                          risk.status === 'OPTIMAL' || risk.status === 'SECURE' || risk.status === 'LIQUID' || risk.status === 'STABLE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-accent-gold/20 text-accent-gold border border-accent-gold/20'
                        }`}>
                          {risk.status}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-white font-headline mb-2">{risk.value}</div>
                      <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase font-bold tracking-widest">{risk.desc}</p>
                    </div>
                  ))}
                </div>

                {/* P2P Exchange Terminal */}
                <div className="bg-surface-dim border border-primary-cyan/20 rounded-2xl overflow-hidden">
                  <div className="bg-primary-cyan/10 p-6 border-b border-primary-cyan/20 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="overflow-hidden w-[300px]">
                        <motion.h3 
                          animate={{ x: [0, -100, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          className="text-sm font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-3 whitespace-nowrap"
                        >
                          <Activity size={18} className="animate-pulse shrink-0" />
                          {t('INSTITUTIONAL PEER-TO-PEER CLEARING', 'COMPENSATION INSTITUTIONNELLE PAIR À PAIR')}
                        </motion.h3>
                      </div>
                      <p className="text-[8px] text-primary-cyan font-black uppercase tracking-widest opacity-40">{t('Verified registry for creative equity transfer', 'Registre vérifié pour le transfert d\'equity créative')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">{t('Registry Sync: SECURE', 'Sync Registre: SÉCURISÉ')}</span>
                       </div>
                       <div className="text-[7px] font-mono text-white/20 uppercase tracking-widest">CLEARING_ID: 0x{Math.random().toString(16).substring(2, 8).toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                    {/* Registry Offers (Buy) */}
                    <div className="p-6 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-between">
                        {t('Inbound Offers', 'Offres Entrantes')}
                        <span className="text-white/20">BIDS</span>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { val: contract.unitValue * 0.995, vol: 450 },
                          { val: contract.unitValue * 0.992, vol: 1500 },
                          { val: contract.unitValue * 0.99, vol: 800 },
                          { val: contract.unitValue * 0.985, vol: 3200 },
                        ].map((offer, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] font-mono group hover:bg-white/5 p-1 rounded transition-all">
                            <span className="text-emerald-400/80 group-hover:text-emerald-400 transition-colors uppercase tracking-widest font-bold">{formatPrice(offer.val)}</span>
                            <div className="flex-1 border-b border-white/5 mx-4 opacity-10" />
                            <span className="text-white font-bold">{offer.vol.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Transfer Requests (Sell) */}
                    <div className="p-6 space-y-4 border-l border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-pink flex items-center justify-between">
                        {t('Transfer Requests', 'Demandes de Transfert')}
                        <span className="text-white/20">ASKS</span>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { val: contract.unitValue * 1.005, vol: 320 },
                          { val: contract.unitValue * 1.008, vol: 120 },
                          { val: contract.unitValue * 1.012, vol: 2500 },
                          { val: contract.unitValue * 1.015, vol: 400 },
                        ].map((request, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] font-mono group hover:bg-white/5 p-1 rounded transition-all">
                            <span className="text-accent-pink/80 group-hover:text-accent-pink transition-colors uppercase tracking-widest font-bold">{formatPrice(request.val)}</span>
                            <div className="flex-1 border-b border-white/5 mx-4 opacity-10" />
                            <span className="text-white font-bold">{request.vol.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Clearing Tape */}
                    <div className="p-6 space-y-4 border-l border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-cyan flex items-center justify-between">
                        {t('Clearing Tape', 'Ruban de Compensation')}
                        <span className="text-white/20">LIVE</span>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { val: contract.unitValue * 1.001, vol: 150, type: 'BUY' },
                          { val: contract.unitValue * 0.998, vol: 420, type: 'SELL' },
                          { val: contract.unitValue * 1.003, vol: 85, type: 'BUY' },
                          { val: contract.unitValue * 1.002, vol: 1200, type: 'BUY' },
                        ].map((trade, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] font-mono p-1 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className={trade.type === 'BUY' ? 'text-emerald-400 font-bold' : 'text-accent-pink font-bold'}>
                                {trade.type === 'BUY' ? '↑' : '↓'}
                              </span>
                              <span className="text-white/80">{formatPrice(trade.val)}</span>
                            </div>
                            <span className="text-white/40">{trade.vol} U</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Action Bar */}
                  <div className="bg-white/5 p-4 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">{t('Registry Amount', 'Montant du Registre')}</label>
                        <input 
                          type="number" 
                          value={orderVolume} 
                          onChange={(e) => setOrderVolume(Number(e.target.value))}
                          className="w-full bg-surface-dim border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:border-primary-cyan/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">{t('Target Valuation', 'Évaluation Cible')}</label>
                        <input 
                          type="number" 
                          value={orderPrice} 
                          onChange={(e) => setOrderPrice(Number(e.target.value))}
                          className="w-full bg-surface-dim border border-white/10 rounded-lg p-2 text-xs font-mono text-white focus:border-primary-cyan/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 min-w-[200px] w-full md:w-auto">
                      <button 
                         onClick={() => handleExecuteOrder('BUY')}
                         className="flex-1 px-6 py-2 bg-emerald-500 text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        {t('Place Offer', 'Placer une Offre')}
                      </button>
                      <button 
                         onClick={() => handleExecuteOrder('SELL')}
                         className="flex-1 px-6 py-2 bg-accent-pink text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-accent-pink transition-all shadow-[0_0_15px_rgba(255,0,255,0.3)]"
                      >
                        {t('Request Transfer', 'Demander Transfert')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                        <TrendingUp size={14} />
                        {t('Historical Revenue & Projections', 'Revenus Historiques & Projections')}
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary-cyan rounded-full" />
                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{t('Actual', 'Réel')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-[1px] bg-accent-gold border-t border-accent-gold border-dashed" />
                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{t('Cluster Benchmark', 'Benchmark Cluster')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                      {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setRevenueTimeframe(tf as any)}
                          className={`px-2 py-1 text-[8px] font-black rounded-md transition-all ${
                            revenueTimeframe === tf ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0A0A0A', 
                            border: '1px solid rgba(0,224,255,0.2)', 
                            borderRadius: '4px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            padding: '8px 12px'
                          }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          labelStyle={{ color: '#ffffff40', fontSize: '8px', marginBottom: '4px', textTransform: 'uppercase' }}
                          formatter={(value: number, name: string) => [
                            formatPrice(value), 
                            name === 'revenue' ? t('Actual', 'Réel') : 
                            name === 'projection' ? t('Projected', 'Projeté') : 
                            t('Cluster Benchmark', 'Benchmark Cluster')
                          ]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#00E0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="projection" stroke="#ffffff20" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                        <Area type="monotone" dataKey="benchmark" stroke="#eec05e" strokeWidth={2} strokeDasharray="3 3" fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: t('Revenue Share', 'Part des Revenus'), value: `${contract.revenueSharePercentage}%`, icon: <PieChartIcon size={16} />, color: 'text-primary-cyan' },
                    { label: t('Avg. Yield (APY)', 'Rendement Moyen (APY)'), value: '12.4%', icon: <TrendingUp size={16} />, color: 'text-emerald-400' },
                    { label: t('Payout Frequency', 'Fréquence de Paiement'), value: t('Quarterly', 'Trimestriel'), icon: <Clock size={16} />, color: 'text-accent-gold' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className={`w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black opacity-50 mb-1">{stat.label}</div>
                        <div className="text-xl font-black text-white font-headline">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* AI Registry Prospectus Analysis */}
                <div className="bg-primary-cyan/5 border border-primary-cyan/20 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                   <div className="flex justify-between items-start">
                     <div className="space-y-1">
                       <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                         <Sparkles size={16} className="animate-pulse text-accent-gold" />
                         {t('AI Registry Prospectus Analysis', 'Analyse du Prospectus du Registre par IA')}
                       </h3>
                       <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{t('Institutional Synthesis of Creative Equity', 'Synthèse Institutionnelle du Capital Créatif')}</p>
                     </div>
                     {!aiAnalysis && (
                       <button 
                         onClick={handleGenerateAiAnalysis}
                         disabled={isAnalyzing}
                         className="px-6 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all disabled:opacity-50"
                       >
                         {isAnalyzing ? (
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 border-2 border-surface-dim border-t-transparent rounded-full animate-spin" />
                             {t('Analyzing...', 'Analyse...')}
                           </div>
                         ) : (
                           t('Synthesize Analysis', 'Synthétiser l\'Analyse')
                         )}
                       </button>
                     )}
                   </div>

                   {aiAnalysis ? (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-dim/50 border border-white/5 p-6 rounded-xl italic text-on-surface leading-loose text-sm opacity-90 relative"
                     >
                        <div className="absolute top-4 left-4 text-primary-cyan/20">
                          <FileText size={48} />
                        </div>
                        <p className="relative z-10 pl-12">{aiAnalysis}</p>
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                           <span className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest">{t('LYA Institutional Intelligence Layer v4.0', 'Couche d\'Intelligence Institutionnelle LYA v4.0')}</span>
                           <button 
                             onClick={() => setAiAnalysis(null)}
                             className="text-[8px] text-primary-cyan uppercase font-black tracking-widest hover:text-white transition-colors"
                           >
                             {t('Refresh Analysis', 'Rafraîchir l\'Analyse')}
                           </button>
                        </div>
                     </motion.div>
                   ) : !isAnalyzing && (
                     <div className="py-12 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-on-surface-variant/20">
                           <ShieldCheck size={32} />
                        </div>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-xs">{t('Click synthesize to generate an exhaustive institutional overview of this creative contract using LYA Intelligence Grid.', 'Cliquez sur synthétiser pour générer un aperçu institutionnel exhaustif de ce contrat créatif via la Grille d\'Intelligence LYA.')}</p>
                     </div>
                   )}
                </div>

                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                    <ShieldCheck size={14} />
                    {t('Regulatory & Compliance Framework', 'Cadre Réglementaire & Conformité')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Globe size={16} className="text-on-surface-variant" />
                          <span className="text-xs font-bold text-on-surface">{t('Jurisdiction', 'Juridiction')}</span>
                        </div>
                        <span className="text-xs font-mono text-primary-cyan font-bold">{contract.jurisdiction}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Lock size={16} className="text-on-surface-variant" />
                          <span className="text-xs font-bold text-on-surface">{t('Contract Type', 'Type de Contrat')}</span>
                        </div>
                        <span className="text-xs font-mono text-white font-bold">{contract.contractType}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Award size={16} className="text-on-surface-variant" />
                          <span className="text-xs font-bold text-on-surface">{t('Validator', 'Validateur')}</span>
                        </div>
                        <span className="text-xs font-mono text-accent-gold font-bold">{contract.professionalValidator}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t('Registry Information', 'Informations du Registre')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-on-surface-variant/60">{t('Registry Address', 'Adresse du Registre')}</span>
                            <span className="text-[10px] font-mono text-white">{contract.registryAddress}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-on-surface-variant/60">{t('Last Audit', 'Dernier Audit')}</span>
                            <span className="text-[10px] font-mono text-white">{contract.lastAudit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-on-surface-variant/60">{t('Maturity Date', 'Date d\'Échéance')}</span>
                            <span className="text-[10px] font-mono text-white">{contract.maturityDate}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => onNotify('DOWNLOADING LEGAL PROSPECTUS...')}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
                        <Download size={14} className="text-primary-cyan" />
                        {t('Download Legal Prospectus', 'Télécharger le Prospectus Juridique')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
                    <Clock size={14} />
                    {t('Project Roadmap & Milestones', 'Feuille de Route & Jalons du Projet')}
                  </h3>
                  <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                    {contract.milestones.map((milestone, i) => (
                      <div key={i} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-surface-dim flex items-center justify-center z-10 transition-all ${
                          milestone.status === 'COMPLETED' ? 'bg-emerald-400 text-surface-dim' :
                          milestone.status === 'IN_PROGRESS' ? 'bg-primary-cyan text-surface-dim animate-pulse' :
                          'bg-white/10 text-on-surface-variant'
                        }`}>
                          {milestone.status === 'COMPLETED' ? <ShieldCheck size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{milestone.date}</div>
                              <h4 className="text-lg font-black text-white uppercase tracking-tight">{milestone.label}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t('Price Impact', 'Impact sur le Prix')}</div>
                                <div className="text-sm font-black text-emerald-400">+{milestone.priceImpact}%</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                milestone.status === 'COMPLETED' ? 'bg-emerald-400/20 text-emerald-400' :
                                milestone.status === 'IN_PROGRESS' ? 'bg-primary-cyan/20 text-primary-cyan' :
                                'bg-white/10 text-on-surface-variant'
                              }`}>
                                {milestone.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messaging' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 flex flex-col h-[600px]">
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Institutional Channel', 'Canal Institutionnel')}</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">{t('End-to-end Encrypted', 'Chiffré de bout en bout')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[8px] font-black text-accent-gold uppercase tracking-[0.2em] mb-1 opacity-50">{t('LYA SCORE PROTECTION', 'PROTECTION SCORE LYA')}</div>
                       <div className="flex items-baseline justify-end gap-1">
                          <span className="text-xl font-black text-white italic">{contract.totalScore}</span>
                          <span className="text-[8px] text-white/20">/1k</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{msg.sender}</span>
                           <span className="text-[8px] font-mono text-on-surface-variant/40">{msg.time}</span>
                        </div>
                        <div className={`p-4 rounded-2xl text-sm max-w-[80%] ${
                          msg.sender === 'You' 
                            ? 'bg-primary-cyan text-surface-dim font-bold italic' 
                            : 'bg-white/5 border border-white/10 text-white italic opacity-80'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="relative">
                      <input 
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && message.trim()) {
                            setChatMessages([...chatMessages, { id: Date.now().toString(), sender: 'You', content: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                            setMessage('');
                          }
                        }}
                        placeholder={t('Enter professional message...', 'Entrez un message professionnel...')}
                        className="w-full bg-surface-dim border border-white/10 rounded-xl py-5 pl-6 pr-16 text-xs font-medium focus:border-primary-cyan/50 focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/20 italic"
                      />
                      <button 
                        onClick={() => {
                          if (message.trim()) {
                            setChatMessages([...chatMessages, { id: Date.now().toString(), sender: 'You', content: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                            setMessage('');
                          }
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-primary-cyan hover:text-white transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Market Data & Actions */}
        <div className="space-y-8">
          {/* Market Status */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
              <Globe size={14} />
              {t('Market Status', 'Statut du Marché')}
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t('Status', 'Statut')}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${contract.status === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-accent-pink'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${contract.status === 'LIVE' ? 'text-emerald-400' : 'text-accent-pink'}`}>
                    {contract.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t('Unit Price', 'Prix Unitaire')}</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">{formatPrice(contract.unitValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t('Available Units', 'Unités Disponibles')}</span>
                <div className="text-right">
                  <span className="text-xs font-black text-white uppercase tracking-widest">{contract.availableUnits?.toLocaleString()} / {contract.totalUnits.toLocaleString()}</span>
                  <div className="text-[10px] text-accent-gold font-bold">{formatPrice((contract.availableUnits || 0) * contract.unitValue)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{t('Liquidity', 'Liquidité')}</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">HIGH</span>
              </div>
              <div className="pt-6 border-t border-white/5">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-4">{t('Price Stability', 'Stabilité du Prix')}</div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${contract.stability * 100}%` }}
                    className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-on-surface-variant uppercase font-bold">{t('Volatile', 'Volatile')}</span>
                  <span className="text-[9px] text-on-surface-variant uppercase font-bold">{t('Stable', 'Stable')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issuer Info */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold flex items-center gap-2">
              <Award size={14} />
              {t('Issuer Identity', 'Identité de l\'Émetteur')}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-dim border border-white/10 flex items-center justify-center text-accent-gold">
                <FileText size={24} />
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">{contract.issuerId}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{t('Verified Creator', 'Créateur Vérifié')}</div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface-variant/60 uppercase font-bold">{t('Total Issued', 'Total Émis')}</span>
                <span className="text-white font-bold">12 {t('Contracts', 'Contrats')}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface-variant/60 uppercase font-bold">{t('Avg. Performance', 'Performance Moy.')}</span>
                <span className="text-emerald-400 font-bold">+24.8%</span>
              </div>
            </div>
            <button 
              onClick={() => onNotify('OPENING ISSUER PROFILE...')}
              className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center justify-center gap-2"
            >
              {t('View Issuer Profile', 'Voir le Profil de l\'Émetteur')} <ChevronRight size={14} />
            </button>
          </div>

          {/* Institutional Actions */}
          <div className="bg-primary-cyan/5 border border-primary-cyan/20 rounded-2xl p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
              <Lock size={14} />
              {t('Institutional Tools', 'Outils Institutionnels')}
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNotify('EXPORTING TRADE HISTORY...')}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <Download size={14} />
                {t('Export Trade History', 'Exporter l\'Historique')}
              </button>
              <button 
                onClick={() => onNotify('OPENING REGISTRY EXPLORER...')}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <ExternalLink size={14} />
                {t('View on Registry', 'Voir sur le Registre')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
