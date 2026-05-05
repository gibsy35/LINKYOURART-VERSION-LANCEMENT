
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity as ActivityIcon, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  HelpCircle,
  RefreshCw,
  FileText,
  Award,
  Palette,
  Music,
  Zap,
  Film,
  Tv,
  Mic,
  Drama,
  LayoutGrid,
  Layers,
  Camera,
  PenTool,
  Database,
  ShieldCheck,
  Star,
  Globe
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { CONTRACTS, Contract, LYA_UNIT_VALUE } from '../types';
import { Ticker } from '../components/ui/Ticker';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { BreakingNewsTicker } from '../components/BreakingNewsTicker';
import { InfoTooltip } from '../components/InfoTooltip';
import { StatCard } from '../components/StatCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import { PageHeader } from '../components/ui/PageHeader';

const data = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 600 },
  { name: '12:00', value: 800 },
  { name: '16:00', value: 500 },
  { name: '20:00', value: 900 },
  { name: '23:59', value: 1100 },
];



import { useMarketData } from '../hooks/useMarketData';
import { LYAAlgorithm } from '../components/LYAAlgorithm';
import { SecondaryMarket } from '../components/SecondaryMarket';

export const DashboardView: React.FC<{ 
  onSelectContract?: (contract: Contract) => void,
  onViewChange?: (view: any) => void,
  onNotify?: (msg: string) => void,
  watchlist?: string[],
  onToggleWatchlist?: (e: React.MouseEvent, contractId: string) => void
}> = ({ onSelectContract, onViewChange, onNotify, watchlist = [], onToggleWatchlist }) => {
  const { t } = useTranslation();
  const { formatPrice, formatLYA } = useCurrency();
  const { contracts, marketStats, lastUpdate } = useMarketData();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'predictive' | 'liquidity'>('overview');
  
  const [activeRange, setActiveRange] = React.useState('1D');

  const chartData = useMemo(() => {
    switch (activeRange) {
      case '1W':
        return [
          { name: 'Mon', value: 800 },
          { name: 'Tue', value: 950 },
          { name: 'Wed', value: 880 },
          { name: 'Thu', value: 1100 },
          { name: 'Fri', value: 1050 },
          { name: 'Sat', value: 1200 },
          { name: 'Sun', value: 1350 },
        ];
      case '1M':
        return [
          { name: 'Week 1', value: 1000 },
          { name: 'Week 2', value: 1200 },
          { name: 'Week 3', value: 1150 },
          { name: 'Week 4', value: 1400 },
        ];
      case '1Y':
        return [
          { name: 'Jan', value: 800 },
          { name: 'Mar', value: 1200 },
          { name: 'May', value: 1100 },
          { name: 'Jul', value: 1500 },
          { name: 'Sep', value: 1400 },
          { name: 'Nov', value: 1800 },
        ];
      case 'ALL':
        return [
          { name: '2023', value: 500 },
          { name: '2024', value: 1200 },
          { name: '2025', value: 1800 },
          { name: '2026', value: 2400 },
        ];
      default: // 1D
        return [
          { name: '00:00', value: 400 },
          { name: '04:00', value: 380 },
          { name: '08:00', value: 620 },
          { name: '12:00', value: 850 },
          { name: '16:00', value: 720 },
          { name: '20:00', value: 980 },
          { name: '23:59', value: 1150 },
        ];
    }
  }, [activeRange]);

  const [topCount, setTopCount] = React.useState(5);
  const [stableCount, setStableCount] = React.useState(5);

  const topProgressions = useMemo(() => 
    [...contracts].sort((a, b) => b.growth - a.growth).slice(0, topCount), 
  [contracts, topCount]);
  
  const stableProgressions = useMemo(() => 
    [...contracts].sort((a, b) => a.growth - b.growth).slice(0, stableCount), 
  [contracts, stableCount]);

  const [visibleNews, setVisibleNews] = useState(3);
  const [visibleNetwork, setVisibleNetwork] = useState(4);
  const [visibleActivities, setVisibleActivities] = useState(5);

  const news = [
    { id: '1', title: 'Netflix Announces New $500M European Production Center', source: 'Variety', time: '10m ago', impact: '+15%' },
    { id: '2', title: 'Creative Equity Index Reaches All-Time High', source: 'Bloomberg', time: '45m ago', impact: '+8%' },
    { id: '3', title: 'New AI Protocol for Automated IP Validation', source: 'TechCrunch', time: '2h ago', impact: '+22%' },
    { id: '4', title: 'South Korean K-Pop Labels Adopt LYA Protocol', source: 'The Korea Herald', time: '15h ago', impact: '+42%' },
    { id: '5', title: 'Goldman Sachs Launches Creative Equity Desk', source: 'WSJ', time: '1d ago', impact: '+55%' },
  ];

  const networkActivity = [
    { label: 'Paris Registry', status: 'SYNCED', latency: '12ms' },
    { label: 'Tokyo Registry', status: 'SYNCED', latency: '45ms' },
    { label: 'NY Registry', status: 'SYNCED', latency: '28ms' },
    { label: 'London Center', status: 'SYNCED', latency: '15ms' },
    { label: 'Singapore Registry', status: 'SYNCED', latency: '32ms' },
    { label: 'Berlin Registry', status: 'SYNCED', latency: '18ms' },
  ];

  const sectors = useMemo(() => [
    { name: t('Fine Art', 'Beaux-Arts'), icon: Palette, growth: -8.4, color: 'text-red-400', bg: 'bg-red-400/10', weight: 35 },
    { name: t('Music', 'Musique'), icon: Music, growth: 15.8, color: 'text-accent-pink', bg: 'bg-accent-pink/10', weight: 25 },
    { name: t('Digital', 'Digital'), icon: Zap, growth: -12.1, color: 'text-red-400', bg: 'bg-red-400/10', weight: 15 },
    { name: t('Film', 'Cinéma'), icon: Film, growth: 8.2, color: 'text-primary-cyan', bg: 'bg-primary-cyan/10', weight: 12 },
    { name: t('TV Series', 'Séries TV'), icon: Tv, growth: -4.1, color: 'text-red-400', bg: 'bg-red-400/10', weight: 8 },
    { name: t('Podcast', 'Podcast'), icon: Mic, growth: -15.5, color: 'text-red-400', bg: 'bg-red-400/10', weight: 3 },
    { name: t('Theatre', 'Théâtre'), icon: Drama, growth: 1.8, color: 'text-primary-cyan', bg: 'bg-primary-cyan/10', weight: 2 },
  ], [t]);

  const marketSentiment = useMemo(() => {
    const avgGrowth = marketStats.avgGrowth;
    if (avgGrowth > 5) return { label: t('BULLISH', 'HAUSSIER'), color: 'text-emerald-400', value: 85 };
    if (avgGrowth > 0) return { label: t('NEUTRAL', 'NEUTRE'), color: 'text-primary-cyan', value: 55 };
    return { label: t('BEARISH', 'BAISSIER'), color: 'text-red-400', value: 35 };
  }, [marketStats.avgGrowth, t]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    onNotify?.(t('SYNCHRONIZING WITH GLOBAL REGISTRY...', 'SYNCHRONISATION AVEC LE REGISTRE GLOBAL...'));
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify?.(t('MARKET DATA SYNCED SUCCESSFULLY.', 'DONNÉES DU MARCHÉ SYNCHRONISÉES AVEC SUCCÈS.'));
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      <PageHeader 
        titleWhite={t('Dashboard', 'DASHBOARD')}
        titleAccent={t('Monitor', 'MONITOR')}
        description={t('REAL-TIME MARKET INTELLIGENCE AND PREDICTIVE ANALYTICS POWERED BY THE LYA NEURAL NETWORK.', 'INTELLIGENCE DE MARCHÉ EN TEMPS RÉEL ET ANALYSES PRÉDICTIVES PROPULSÉES PAR LE RÉSEAU NEURAL LYA.')}
        accentColor="text-primary-cyan"
      />

      <div className="space-y-12 px-4 md:px-12">
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 mb-8 sm:mb-12 relative z-20">
          <button 
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? t('Syncing...', 'Sync en cours...') : t('Force Sync', 'Sync Forcée')}
          </button>
          
          <div className="h-6 w-[1px] bg-white/5 hidden sm:block" />
          <div className="relative group flex-1 sm:flex-none">
            <div className="absolute inset-0 bg-primary-cyan/5 blur-xl group-hover:bg-primary-cyan/10 transition-all duration-700" />
            <div className="relative bg-surface-low/40 backdrop-blur-xl border border-white/10 p-2 sm:p-4 flex items-center gap-2 sm:gap-4 shadow-2xl rounded-sm">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 shadow-inner">
                <Zap size={16} className="animate-pulse" />
              </div>
              <div>
                <div className="text-[7px] md:text-[8px] text-accent-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black mb-0.5 sm:mb-1 flex items-center gap-1 sm:gap-2">
                  {t('LYA Standard Unit', 'Unité Standard LYA')}
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs sm:text-lg font-black font-mono text-on-surface leading-none tracking-tighter truncate">1 LYA = {formatLYA()}</p>
              </div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-white/5 hidden lg:block" />

          <div className="space-y-1 sm:space-y-2 text-right">
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              <span className="text-[8px] sm:text-[10px] font-black text-on-surface uppercase tracking-[0.2em] sm:tracking-[0.3em]">{t('Terminal: LYA-MAIN-01', 'Terminal : LYA-MAIN-01')}</span>
            </div>
            <div className="text-[8px] sm:text-[10px] font-mono text-on-surface-variant uppercase tracking-widest opacity-40">
              {t('Last Sync:', 'Dernière Sync :')} {lastUpdate.toLocaleTimeString('en-GB', { hour12: false })}
            </div>
          </div>
        </div>

        {/* Market Navigation - Mobile Optimized */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex gap-6 sm:gap-12 border-b border-white/5 min-w-max">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative group shrink-0 ${activeTab === 'overview' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="relative z-10">{t('General View', 'Vue d\'Ensemble')}</span>
              {activeTab === 'overview' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>
            <button 
              onClick={() => setActiveTab('predictive')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Zap size={14} className={activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
              <span className="relative z-10">{t('Project Analytics', 'Analyses de Projets')}</span>
              {activeTab === 'predictive' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>
            <button 
              onClick={() => setActiveTab('liquidity')}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'liquidity' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <ActivityIcon size={14} className={activeTab === 'liquidity' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
              <span className="relative z-10">{t('Exchange Center', 'Centre d\'Échanges')}</span>
              {activeTab === 'liquidity' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>
          </div>
        </div>
          
          {activeTab === 'overview' && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: t('Holdings Value', 'Valeur des Contrats'), value: 124850, trend: '+12.5%', color: 'border-primary-cyan', icon: <Layers size={16} />, tooltip: t('The current market value of all the creative contract units you own.', 'La valeur marchande actuelle de toutes les unités de contrat créatif que vous possédez.') },
                { label: t('Total Index Yield', 'Rendement d\'Indice Total'), value: 8420.15, trend: '+$142.50', color: 'border-primary-cyan', icon: <TrendingUp size={16} />, tooltip: t('The cumulative yield generated by your indexed assets.', 'Le rendement cumulé généré par vos actifs indexés.') },
                { label: t('Active Contracts', 'Contrats Actifs'), value: 12, trend: '4 Registries', color: 'border-white/20', icon: <LayoutGrid size={16} />, tooltip: t('The number of unique creative contracts currently in your portfolio.', 'Le nombre de contrats créatifs uniques actuellement dans votre portefeuille.') },
                { label: t('Market Sentiment', 'Sentiment du Marché'), value: marketSentiment.label, trend: `${marketSentiment.value}%`, color: 'border-accent-gold', icon: <ActivityIcon size={16} />, tooltip: t('Real-time analysis of investor confidence.', 'Analyse en temps réel de la confiance des investisseurs.') }
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm group-hover:border-primary-cyan/30 transition-all duration-500" />
                  <div className={`relative p-6 border-l-2 ${stat.color} flex flex-col justify-between min-h-[160px]`}>
                    <div className="flex justify-between items-start">
                      <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-40 flex items-center gap-2">
                        {stat.label}
                        <InfoTooltip position="top" title={stat.label} content={stat.tooltip} />
                      </div>
                      <div className="text-primary-cyan opacity-40 group-hover:opacity-100 transition-opacity">
                        {stat.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-3xl font-black font-mono text-on-surface tracking-tighter">
                          {typeof stat.value === 'number' ? formatPrice(stat.value) : stat.value}
                        </h3>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">{stat.trend}</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {activeTab === 'overview' ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t('Total Project Capacity', 'Capacité Totale des Projets')} 
              value={marketStats.totalCap} 
              icon={<TrendingUp size={20} />} 
              trend={`${marketStats.avgGrowth > 0 ? '+' : ''}${marketStats.avgGrowth.toFixed(1)}%`} 
              trendDown={marketStats.avgGrowth < 0}
              color="cyan" 
              subValue={t(`${(marketStats.totalCap / 50 / 1000000).toFixed(1)}M PROJECT UNITS`, `${(marketStats.totalCap / 50 / 1000000).toFixed(1)}M UNITÉS DE PROJETS`)} 
              tooltip={t('Total aggregate value of all creative projects currently indexed on the LYA Protocol.', 'Valeur agrégée totale de tous les projets créatifs actuellement indexés sur le protocole LYA.')}
            />
            <StatCard 
              title={t('24H Exchange Volume', 'Volume d\'Échange 24H')} 
              value={marketStats.totalVolume} 
              icon={<ActivityIcon size={20} />} 
              trend="+12.8%" 
              color="cyan" 
              subValue={t(`${(marketStats.totalVolume / 50 / 1000).toFixed(0)}K CONTRACT UNITS`, `${(marketStats.totalVolume / 50 / 1000).toFixed(0)}K UNITÉS DE CONTRATS`)} 
              tooltip={t('Total value of contract units exchanged between peers in the last 24 hours.', 'Valeur totale des unités de contrat échangées entre pairs au cours des dernières 24 heures.')}
            />
            <StatCard 
              title={t('Indexed Project Flow', 'Flux de Projets Indexés')} 
              value={contracts.length} 
              isCurrency={false}
              icon={<ExternalLink size={20} />} 
              trend="+0.5%" 
              color="cyan" 
              tooltip={t('Total number of unique creative projects with active professional indexing.', 'Nombre total de projets créatifs uniques avec une indexation professionnelle active.')}
            />
            <StatCard 
              title={t('Avg Index Yield', 'Rendement Moyen de l\'Indice')} 
              value={marketStats.avgGrowth} 
              isCurrency={false}
              icon={marketStats.avgGrowth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />} 
              trend={`${marketStats.avgGrowth > 0 ? '+' : ''}${marketStats.avgGrowth.toFixed(1)}%`} 
              trendDown={marketStats.avgGrowth < 0}
              color="cyan" 
              tooltip={t('Weighted average growth rate of all indexed creative assets in the ecosystem.', 'Taux de croissance moyen pondéré de tous les actifs créatifs indexés dans l\'écosystème.')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Market Index Performance Chart */}
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/50 to-transparent" />
                <div className="bg-white/[0.02] px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-white/5 relative z-10">
                  <div>
                    <h2 className="text-sm sm:text-lg md:text-xl font-black font-headline uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-3 sm:gap-4">
                      <TrendingUp size={20} className="text-primary-cyan" />
                      {t('Market Index Performance', 'Performance de l\'Indice du Marché')}
                    </h2>
                    <p className="text-[8px] sm:text-[10px] text-on-surface-variant uppercase tracking-[0.2em] sm:tracking-[0.4em] font-bold opacity-40 mt-1 sm:mt-2">{t('Aggregate creative equity value across all registries', 'Valeur agrégée des fonds propres créatifs sur tous les registres')}</p>
                  </div>
                  <div className="flex bg-surface-dim/60 p-1 border border-white/5 rounded-sm shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map(time => (
                      <button 
                        key={time} 
                        onClick={() => setActiveRange(time)}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all active:scale-95 whitespace-nowrap ${
                          activeRange === time 
                            ? 'bg-primary-cyan text-surface-dim shadow-[0_0_15px_rgba(0,224,255,0.3)]' 
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 md:p-10 h-[300px] md:h-[450px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ffffff05" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#8E9299', fontWeight: 'bold', letterSpacing: '0.1em' }}
                        dy={15}
                      />
                      <YAxis 
                        stroke="#ffffff05" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => formatPrice(value)}
                        tick={{ fill: '#8E9299', fontWeight: 'bold', letterSpacing: '0.1em' }}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ stroke: 'rgba(0,224,255,0.2)', strokeWidth: 1 }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(10,10,10,0.95)', 
                          border: '1px solid rgba(0,224,255,0.3)', 
                          borderRadius: '0px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                          padding: '12px 16px',
                          backdropFilter: 'blur(10px)'
                        }}
                        itemStyle={{ color: '#00E0FF', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        labelStyle={{ color: '#ffffff40', fontSize: '9px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.2em' }}
                        formatter={(value: number) => [formatPrice(value), t('Index Value', 'Valeur de l\'Indice')]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00E0FF" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2500}
                        activeDot={{ r: 6, fill: '#00E0FF', stroke: '#0A0A0A', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progressions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Progressions */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col">
                  <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                      <TrendingUp size={16} className="text-emerald-400" />
                      {t('Top Progressions', 'Top Progressions')}
                    </h2>
                    <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">24H DELTA</div>
                  </div>
                  <div className="p-6 space-y-4">
                    {topProgressions.map((contract, i) => (
                      <motion.div 
                        key={contract.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelectContract?.(contract)}
                        className="flex items-center justify-between p-4 bg-surface-dim/30 border border-white/5 rounded-sm hover:border-primary-cyan/30 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-5 flex-1" onClick={() => onSelectContract?.(contract)}>
                          <div className="w-12 h-12 bg-surface-dim border border-white/10 overflow-hidden rounded-sm relative">
                            <img src={contract.image} alt={contract.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">{contract.name}</div>
                            <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">{contract.registryIndex}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-mono font-black text-emerald-400">+{contract.growth}%</div>
                            <div className="text-[9px] text-on-surface-variant font-black opacity-40 mt-1">{(contract.totalValue / LYA_UNIT_VALUE)?.toLocaleString() || '0'} LYA</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist?.(e, contract.id);
                            }}
                            className={`p-2 rounded-full transition-all ${
                              watchlist.includes(contract.id)
                                ? 'text-accent-gold bg-accent-gold/10'
                                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Star size={14} fill={watchlist.includes(contract.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {topCount < contracts.length && (
                    <div className="px-6 pb-6">
                      <button 
                        onClick={() => setTopCount(prev => prev + 5)}
                        className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                      >
                        {t('Load More', 'Voir Plus')} <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stable Progressions */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col">
                  <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                      <RefreshCw size={16} className="text-primary-cyan" />
                      {t('Stable Progressions', 'Progressions Stables')}
                    </h2>
                    <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">7D VOLATILITY: LOW</div>
                  </div>
                  <div className="p-6 space-y-4">
                    {stableProgressions.map((contract, i) => (
                      <motion.div 
                        key={contract.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelectContract?.(contract)}
                        className="flex items-center justify-between p-4 bg-surface-dim/30 border border-white/5 rounded-sm hover:border-primary-cyan/30 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-5 flex-1" onClick={() => onSelectContract?.(contract)}>
                          <div className="w-12 h-12 bg-surface-dim border border-white/10 overflow-hidden rounded-sm relative">
                            <img src={contract.image} alt={contract.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">{contract.name}</div>
                            <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">{contract.registryIndex}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-sm font-mono font-black ${contract.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {contract.growth >= 0 ? '+' : ''}{contract.growth}%
                            </div>
                            <div className="text-[9px] text-on-surface-variant font-black opacity-40 mt-1">{(contract.totalValue / LYA_UNIT_VALUE)?.toLocaleString() || '0'} LYA</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist?.(e, contract.id);
                            }}
                            className={`p-2 rounded-full transition-all ${
                              watchlist.includes(contract.id)
                                ? 'text-accent-gold bg-accent-gold/10'
                                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Star size={14} fill={watchlist.includes(contract.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {stableCount < contracts.length && (
                    <div className="px-6 pb-6">
                      <button 
                        onClick={() => setStableCount(prev => prev + 5)}
                        className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                      >
                        {t('Load More', 'Voir Plus')} <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance by Sector Heatmap - Redesigned */}
            <div className="lg:col-span-1">
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                    <LayoutGrid size={16} className="text-primary-cyan" />
                    {t('Sector Heatmap', 'Carte de Chaleur Sectorielle')}
                  </h2>
                  <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">BY WEIGHT & PERF</div>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  {sectors.map((sector, i) => (
                    <div key={i} className="space-y-2 group">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <sector.icon size={14} className={sector.color} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary-cyan transition-colors">{sector.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-on-surface-variant/40">{sector.weight}%</span>
                          <span className={`text-[10px] font-black font-mono ${sector.growth >= 0 ? 'text-emerald-400' : 'text-accent-pink'}`}>
                            {sector.growth >= 0 ? '+' : ''}{sector.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${sector.weight * 2}%` }}
                          className={`h-full ${sector.bg.replace('/10', '')} shadow-[0_0_10px_rgba(0,224,255,0.2)]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                    <span>SECTOR AGGREGATE</span>
                    <span className={marketStats.avgGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {marketStats.avgGrowth >= 0 ? '+' : ''}{marketStats.avgGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <button 
                    onClick={() => onViewChange?.('REGISTRY')}
                    className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                  >
                    {t('View All Sectors', 'Voir Tous les Secteurs')} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl">
              <div className="bg-white/[0.02] px-8 py-6 flex justify-between items-center border-b border-white/5">
                <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                  <RefreshCw size={16} className="text-primary-cyan animate-spin-slow" />
                  {t('Recent Exchange Activity', 'Activité d\'Échange Récente')}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">LIVE FEED</span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {[...Array(visibleActivities)].map((_, i) => {
                  const usdVal = 12480 + (i * 150);
                  const lyaVal = (usdVal / LYA_UNIT_VALUE).toFixed(2);
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-5 bg-surface-dim/30 border border-white/5 rounded-sm hover:bg-white/[0.02] transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${i % 2 === 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'} border border-white/5 shadow-inner`}>
                          {i % 2 === 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">
                            {i % 2 === 0 ? t('Professional Acquisition', 'Acquisition Professionnelle') : t('Market Transfer', 'Transfert de Marché')}
                          </div>
                          <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">TX-{Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-black text-primary-cyan">{lyaVal} LYA</div>
                        <div className="text-[10px] text-on-surface-variant font-bold opacity-40 mt-1">{formatPrice(usdVal)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setVisibleActivities(prev => prev + 5)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                >
                  {t('Load More', 'Voir Plus')} <RefreshCw size={14} />
                </button>
                <button 
                  onClick={() => onViewChange?.('SETTLEMENT')}
                  className="flex-1 py-3 bg-primary-cyan/10 border border-primary-cyan/20 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:bg-primary-cyan hover:text-surface-dim transition-all flex items-center justify-center gap-2 rounded-sm"
                >
                  {t('View Full Activity', 'Voir Toute l\'Activité')} <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl p-10">
              <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                  <ActivityIcon size={16} className="text-primary-cyan" />
                  {t('Registry Distribution', 'Répartition du Registre')}
                </h2>
                <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">GLOBAL COVERAGE</div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'NA', value: 45 },
                    { name: 'EU', value: 32 },
                    { name: 'AS', value: 28 },
                    { name: 'OC', value: 12 },
                    { name: 'SA', value: 8 },
                    { name: 'AF', value: 3 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff05" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#8E9299', fontWeight: 'bold', letterSpacing: '0.1em' }}
                    />
                    <YAxis 
                      stroke="#ffffff05" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#8E9299', fontWeight: 'bold', letterSpacing: '0.1em' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(10,10,10,0.95)', 
                        border: '1px solid rgba(0,224,255,0.2)', 
                        borderRadius: '0px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        padding: '12px 16px',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ color: '#00E0FF', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      labelStyle={{ color: '#ffffff40', fontSize: '9px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.2em' }}
                      formatter={(value: number) => [`${value}%`, t('Market Share', 'Part de Marché')]}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={35}>
                      {[0, 1, 2, 3, 4, 5].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00E0FF' : 'rgba(255,255,255,0.05)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-10 flex justify-between items-center bg-surface-dim/30 p-6 rounded-sm border border-white/5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary-cyan rounded-full shadow-[0_0_15px_rgba(0,224,255,0.6)]"></div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-on-surface-variant font-black opacity-60">{t('Primary Registry: North America', 'Registre Principal : Amérique du Nord')}</span>
                </div>
                <span className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.3em]">128 {t('ACTIVE REGISTRIES', 'REGISTRES ACTIFS')}</span>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'predictive' ? (
        <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8">
          <LYAAlgorithm />
        </div>
      ) : (
        <SecondaryMarket />
      )}

      {/* Creative Feed, Network Activity & Trending Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Creative Feed */}
        <div className="lg:col-span-2 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
              <Zap size={14} />
              {t('Creative Feed', 'Flux Créatif')}
            </h3>
            <button 
              onClick={() => onViewChange?.('SOCIAL_FEED')}
              className="text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors"
            >
              {t('View All News', 'Toutes les News')}
            </button>
          </div>
          <div className="space-y-4">
            {news.slice(0, visibleNews).map((item) => (
              <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-primary-cyan/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-mono text-on-surface-variant/60 uppercase tracking-widest">{item.time} • {item.source}</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{item.impact} IMPACT</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-primary-cyan transition-colors">{item.title}</h4>
              </div>
            ))}
          </div>
          {visibleNews < news.length && (
            <div className="pt-4 text-center">
              <button 
                onClick={() => setVisibleNews(prev => prev + 2)}
                className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
              >
                {t('Load More News', 'Charger Plus de News')}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: Network & Trending */}
        <div className="space-y-8">
          {/* Live Network Activity */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan flex items-center gap-2">
              <Globe size={14} />
              {t('Live Network Activity', 'Activité Réseau en Direct')}
            </h3>
            <div className="space-y-3">
              {networkActivity.slice(0, visibleNetwork).map((node, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{node.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant/40">{node.latency}</span>
                </div>
              ))}
            </div>
            {visibleNetwork < networkActivity.length && (
              <div className="pt-2 text-center">
                <button 
                  onClick={() => setVisibleNetwork(prev => prev + 2)}
                  className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
                >
                  {t('Load More Nodes', 'Charger Plus de Nœuds')}
                </button>
              </div>
            )}
          </div>

          {/* Trending Sectors Sidebar */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold flex items-center gap-2">
              <TrendingUp size={14} />
              {t('Trending Sectors', 'Secteurs Tendances')}
            </h3>
            <div className="space-y-3">
              {sectors.slice(0, visibleNetwork).map((sector, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-accent-gold/30 transition-all cursor-pointer group">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-accent-gold transition-colors">{sector.name}</span>
                  <span className={`text-[9px] font-mono font-black ${sector.growth >= 0 ? 'text-emerald-400' : 'text-accent-pink'}`}>
                    {sector.growth >= 0 ? '+' : ''}{sector.growth}%
                  </span>
                </div>
              ))}
            </div>
            {visibleNetwork < sectors.length && (
              <button 
                onClick={() => setVisibleNetwork(prev => prev + 4)}
                className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-accent-gold transition-colors border-t border-white/5 pt-4"
              >
                {t('Load More Sectors', 'Voir Plus de Secteurs')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DashboardView;
