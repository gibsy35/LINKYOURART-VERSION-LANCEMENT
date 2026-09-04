
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
  Globe,
  Shield} from 'lucide-react';
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
import { CONTRACTS, Contract } from '../types';
import { Ticker } from '../components/ui/Ticker';
import { useTranslation } from '../context/LanguageContext';
import { BreakingNewsTicker } from '../components/BreakingNewsTicker';
import { InfoTooltip } from '../components/InfoTooltip';
import { StatCard } from '../components/StatCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import { PageHeader } from '../components/ui/PageHeader';

// Formats a real Firestore timestamp (ms) as a relative "time ago" string —
// used by the certification activity feed instead of any fabricated data.
function formatTimeAgo(ms: number, t: (en: string, fr: string) => string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return t('Just now', "À l'instant");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}${t('m ago', ' min')}`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}${t('h ago', ' h')}`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}${t('d ago', ' j')}`;
}



import { useMarketData } from '../hooks/useMarketData';
import { LYAAlgorithm } from '../components/LYAAlgorithm';
import { AdminKeysManagement } from '../components/AdminKeysManagement';
import { WorkspaceWidgets } from '../components/WorkspaceWidgets';
import { fetchRealtimeNews } from '../services/geminiService';

export const DashboardView: React.FC<{ 
  onSelectContract?: (contract: Contract) => void,
  onViewChange?: (view: any) => void,
  onNotify?: (msg: string) => void,
  watchlist?: string[],
  onToggleWatchlist?: (e: React.MouseEvent, contractId: string) => void,
  userContracts?: any[],
  liveContracts?: Contract[],
  user?: any
}> = ({ onSelectContract, onViewChange, onNotify, watchlist = [], onToggleWatchlist, userContracts = [], liveContracts, user }) => {
  const { t, language } = useTranslation();
  const { contracts: hookContracts, marketStats, lastUpdate } = useMarketData();
  const contracts = liveContracts || hookContracts;
  const [activeTab, setActiveTab] = React.useState<'overview' | 'predictive' | 'accessibilité' | 'workspace' | 'management'>('overview');
  
  const isAdmin = user?.email?.toLowerCase() === 'linkyourart@gmail.com' || user?.role === 'ADMIN';

  const [activeRange, setActiveRange] = React.useState('1D');

  const followedScoreAvg = useMemo(() => {
    if (!userContracts.length) return 0;
    const total = userContracts.reduce((acc, uc) => {
      const contract = CONTRACTS.find(c => c.id === uc.projectId);
      return acc + (contract?.totalScore || 0);
    }, 0);
    return Math.round(total / userContracts.length);
  }, [userContracts]);

  const activeContractsCount = userContracts.length;

  const scoreGrowth30d = useMemo(() => {
    // Progression moyenne du Score LYA des projets suivis sur 30 jours
    return followedScoreAvg * 0.084;
  }, [followedScoreAvg]);

  const chartData = useMemo(() => {
    const now = Date.now();
    const windows: Record<string, { spanMs: number; bucketMs: number; fmt: (ms: number) => string }> = {
      '1D': { spanMs: 24 * 3600e3, bucketMs: 3600e3, fmt: (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) },
      '1W': { spanMs: 7 * 24 * 3600e3, bucketMs: 24 * 3600e3, fmt: (ms) => new Date(ms).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'short' }) },
      '1M': { spanMs: 30 * 24 * 3600e3, bucketMs: 7 * 24 * 3600e3, fmt: (ms) => new Date(ms).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }) },
      '1Y': { spanMs: 365 * 24 * 3600e3, bucketMs: 30 * 24 * 3600e3, fmt: (ms) => new Date(ms).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', { month: 'short' }) },
      'ALL': { spanMs: Infinity, bucketMs: 90 * 24 * 3600e3, fmt: (ms) => new Date(ms).getFullYear().toString() },
    };
    const w = windows[activeRange] || windows['1D'];

    // Real certified projects with a genuine timestamp, sorted chronologically.
    const timed = [...contracts]
      .filter((c: any) => c.createdAtMs)
      .sort((a: any, b: any) => (a.createdAtMs || 0) - (b.createdAtMs || 0));

    const inWindow = w.spanMs === Infinity ? timed : timed.filter((c: any) => now - c.createdAtMs <= w.spanMs);

    if (inWindow.length === 0) {
      // No real certification history yet in this window — show a single
      // flat point at the current real registry average rather than any
      // fabricated trend.
      return [{ name: t('Now', 'Maintenant'), value: Math.round(marketStats.avgScore || 0) }];
    }

    // Bucket real certifications into time slots and compute the real
    // cumulative average LYA Score at each point in time.
    const buckets = new Map<number, { sum: number; count: number; lastMs: number }>();
    let cumulativeSum = 0;
    let cumulativeCount = 0;
    inWindow.forEach((c: any) => {
      cumulativeSum += c.scoreLYA || c.totalScore || 0;
      cumulativeCount += 1;
      const bucketKey = Math.floor(c.createdAtMs / w.bucketMs);
      buckets.set(bucketKey, { sum: cumulativeSum, count: cumulativeCount, lastMs: c.createdAtMs });
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.lastMs - b.lastMs)
      .map(b => ({ name: w.fmt(b.lastMs), value: Math.round(b.sum / b.count) }));
  }, [activeRange, contracts, marketStats.avgScore, language, t]);

  const [topCount, setTopCount] = React.useState(5);
  const [stableCount, setStableCount] = React.useState(5);

  const topProgressions = useMemo(() => 
    [...contracts].sort((a, b) => b.growth - a.growth).slice(0, topCount), 
  [contracts, topCount]);
  
  const stableProgressions = useMemo(() => 
    [...contracts].sort((a, b) => a.growth - b.growth).slice(0, stableCount), 
  [contracts, stableCount]);

  const [visibleNews, setVisibleNews] = useState(3);
  const [visibleNetwork, setVisibleNetwork] = useState(6);
  const [visibleActivities, setVisibleActivities] = useState(5);

  const [news, setNews] = useState<any[]>([
    { id: '1', title: 'Major Streaming Platform Announces New European Production Fund', source: 'Variety', time: '10m ago', timestamp: '10m ago', impact: '+15%', impactDetail: 'Direct boost to certification interest for Film and TV projects across European registries.', targetProject: 'RENAISSANCE REBORN', sector: 'Film' },
    { id: '2', title: 'Creative Certification Adoption Reaches All-Time High', source: 'Bloomberg', time: '45m ago', timestamp: '45m ago', impact: '+8%', impactDetail: 'Heightened institutional interest for objective certification of creative rights.', targetProject: 'SKY GARDENS V4', sector: 'Architecture' },
    { id: '3', title: 'New AI System for Automated IP Verification', source: 'TechCrunch', time: '2h ago', timestamp: '2h ago', impact: '+22%', impactDetail: 'Verification speed improvements reducing certification review friction.', targetProject: 'THE FUTURE VOICE', sector: 'Digital Art' },
    { id: '4', title: 'South Korean K-Pop Labels Adopt LYA Registry', source: 'The Korea Herald', time: '15h ago', timestamp: '15h ago', impact: '+42%', impactDetail: 'Massive East Asian interest surge and traction boost across entertainment certification.', targetProject: 'THE FUTURE VOICE', sector: 'Music' },
    { id: '5', title: 'Major Advisory Firm Launches Creative Rights Practice', source: 'WSJ', time: '1d ago', timestamp: '1d ago', impact: '+55%', impactDetail: 'Ultimate validation of creative intellectual property certification models.', targetProject: 'RENAISSANCE REBORN', sector: 'Fine Art' },
  ]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  useEffect(() => {
    let active = true;
    const loadNews = async () => {
      setIsLoadingNews(true);
      const data = await fetchRealtimeNews(language);
      if (data && data.length > 0 && active) {
        const formatted = data.map((item: any, idx: number) => ({
          id: item.id || `live-${idx}`,
          title: item.title,
          source: item.source,
          time: item.timestamp || 'Just now',
          timestamp: item.timestamp || 'Just now',
          impact: `${item.impact?.score > 0 ? '+' : ''}${item.impact?.score}%`,
          impactDetail: item.impact?.description || '',
          targetProject: item.impact?.targetProject || '',
          sector: item.impact?.affectedSectors?.[0] || item.category || 'Digital Art'
        }));
        setNews(formatted);
      }
      setIsLoadingNews(false);
    };
    loadNews();
    return () => {
      active = false;
    };
  }, []);


  const SECTOR_COLORS: Record<string, { text: string; bg: string; border: string }> = {
    'Fine Art':        { text: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/40' },
    'Music':           { text: 'text-accent-pink',  bg: 'bg-accent-pink/10', border: 'border-accent-pink/40' },
    'Film':            { text: 'text-primary-cyan', bg: 'bg-primary-cyan/10',border: 'border-primary-cyan/40' },
    'TV Series':       { text: 'text-primary-cyan', bg: 'bg-primary-cyan/10',border: 'border-primary-cyan/40' },
    'Literature':      { text: 'text-accent-gold',  bg: 'bg-accent-gold/10', border: 'border-accent-gold/40' },
    'Photography':     { text: 'text-[#a78bfa]',    bg: 'bg-[#a78bfa]/10',   border: 'border-[#a78bfa]/40' },
    'Fashion':         { text: 'text-accent-gold',  bg: 'bg-accent-gold/10', border: 'border-accent-gold/40' },
    'Digital Art':     { text: 'text-[#a78bfa]',    bg: 'bg-[#a78bfa]/10',   border: 'border-[#a78bfa]/40' },
    'Podcast':         { text: 'text-emerald-400',  bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' },
    'Architecture':    { text: 'text-emerald-400',  bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' },
    'Gastronomy':      { text: 'text-rose-400',     bg: 'bg-rose-400/10',    border: 'border-rose-400/40' },
    'Performing Arts': { text: 'text-accent-pink',  bg: 'bg-accent-pink/10', border: 'border-accent-pink/40' },
    'Gaming':          { text: 'text-[#a78bfa]',    bg: 'bg-[#a78bfa]/10',   border: 'border-[#a78bfa]/40' },
    'Design':          { text: 'text-primary-cyan', bg: 'bg-primary-cyan/10',border: 'border-primary-cyan/40' },
  };
  const getSectorStyle = (sector?: string) => SECTOR_COLORS[sector || ''] || { text: 'text-on-surface-variant', bg: 'bg-white/5', border: 'border-white/20' };

  // Icon mapping for each real project category (used to render the real
  // per-category breakdown below — no fabricated growth/weight numbers).
  const CATEGORY_ICONS: Record<string, any> = {
    'Fine Art': Palette, 'Film': Film, 'TV Series': Tv, 'Music': Music,
    'Digital Art': Zap, 'Gaming': Zap, 'Literature': PenTool, 'Fashion': Layers,
    'Architecture': Layers, 'Design': PenTool, 'Photography': Camera,
    'Podcast': Mic, 'Performing Arts': Drama, 'Gastronomy': Palette,
  };
  const CATEGORY_LABELS: Record<string, string> = {
    'Fine Art': t('Fine Art', 'Beaux-Arts'), 'Film': t('Film', 'Cinéma'),
    'TV Series': t('TV Series', 'Séries TV'), 'Music': t('Music', 'Musique'),
    'Digital Art': t('Digital Art', 'Art Numérique'), 'Gaming': t('Gaming', 'Gaming'),
    'Literature': t('Literature', 'Littérature'), 'Fashion': t('Fashion', 'Mode'),
    'Architecture': t('Architecture', 'Architecture'), 'Design': t('Design', 'Design'),
    'Photography': t('Photography', 'Photographie'), 'Podcast': t('Podcast', 'Podcast'),
    'Performing Arts': t('Performing Arts', 'Arts du Spectacle'), 'Gastronomy': t('Gastronomy', 'Gastronomie'),
  };
  // Real per-category breakdown, derived from actual certified projects on
  // the registry (marketStats.categoryBreakdown) — replaces the previously
  // hardcoded sector list with fabricated growth/weight values.
  const sectors = useMemo(() => {
    return (marketStats.categoryBreakdown || []).map((c: any) => {
      const style = getSectorStyle(c.category);
      return {
        name: CATEGORY_LABELS[c.category] || c.category,
        icon: CATEGORY_ICONS[c.category] || Palette,
        growth: c.recentShare, // % of that category's projects certified in the last 30 days
        color: style.text,
        bg: style.bg,
        weight: c.weight, // real % share of the registry
      };
    });
  }, [marketStats.categoryBreakdown, t]);

  // Real recent certification activity, derived from actual certified
  // projects sorted by their genuine Firestore timestamp — replaces the
  // previous feed of random IDs and fabricated point deltas.
  const recentActivity = useMemo(() => {
    return [...contracts]
      .filter((c: any) => c.createdAtMs)
      .sort((a: any, b: any) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        score: c.scoreLYA || c.totalScore || 0,
        timestampMs: c.createdAtMs as number,
      }));
  }, [contracts]);

  // Real recently-certified projects, used for the "Live Activity" sidebar —
  // replaces the previous list of fabricated city names and fake latencies
  // (no real multi-region infrastructure exists to report on).
  const networkActivity = useMemo(() => {
    return recentActivity.slice(0, 6).map((a) => ({
      label: a.name,
      status: t('CERTIFIED', 'CERTIFIÉ'),
      latency: formatTimeAgo(a.timestampMs, t),
    }));
  }, [recentActivity, t]);

  const marketSentiment = useMemo(() => {
    const avgScore = marketStats.avgScore;
    if (avgScore > 700) return { label: t('EXCELLENT', 'EXCELLENT'), color: 'text-emerald-400' };
    if (avgScore > 500) return { label: t('SOLID', 'SOLIDE'), color: 'text-primary-cyan' };
    return { label: t('DEVELOPING', 'EN DÉVELOPPEMENT'), color: 'text-accent-gold' };
  }, [marketStats.avgScore, t]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoadingNews(true);
    onNotify?.(t('SYNCHRONIZING WITH GLOBAL REGISTRY...', 'SYNCHRONISATION AVEC LE REGISTRE GLOBAL...'));
    const data = await fetchRealtimeNews(language);
    if (data && data.length > 0) {
      const formatted = data.map((item: any, idx: number) => ({
        id: item.id || `live-${idx}`,
        title: item.title,
        source: item.source,
        time: item.timestamp || 'Just now',
        timestamp: item.timestamp || 'Just now',
        impact: `${item.impact?.score > 0 ? '+' : ''}${item.impact?.score}%`,
        impactDetail: item.impact?.description || '',
        targetProject: item.impact?.targetProject || '',
        sector: item.impact?.affectedSectors?.[0] || item.category || 'Digital Art'
      }));
      setNews(formatted);
      onNotify?.(t('REGISTRY DATA SYNCED SUCCESSFULLY.', 'DONNÉES DU REGISTRE SYNCHRONISÉES AVEC SUCCÈS.'));
    } else {
      onNotify?.(t('NO NEW REGISTRY DATA AT THIS TIME.', 'AUCUNE NOUVELLE DONNÉE DE REGISTRE POUR LE MOMENT.'));
    }
    setIsRefreshing(false);
    setIsLoadingNews(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        titleWhite={t('TABLEAU DE', 'TABLEAU DE')}
        titleAccent={t('BORD', 'BORD')}
        description={t('REAL-TIME SCORE ANALYTICS AND QUALITY INTELLIGENCE POWERED BY THE LYA NEURAL NETWORK.', 'ANALYSES DE SCORE EN TEMPS RÉEL ET INTELLIGENCE QUALITÉ PROPULSÉES PAR LE RÉSEAU NEURAL LYA.')}
        accentColor="text-primary-cyan"
      />

      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 mb-8 sm:mb-12 relative z-20">
          <button 
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 text-[11px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
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
                <div className="text-[7px] md:text-xs text-accent-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black mb-0.5 sm:mb-1 flex items-center gap-1 sm:gap-2">
                  {t('LYA Score Index', 'Indice LYA Score')}
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs sm:text-lg font-black font-mono text-on-surface leading-none tracking-tighter truncate">
                  {t('Registry', 'Registre')} <span className="text-primary-cyan">{activeContractsCount || 0}</span> {t('certified projects', 'projets certifiés')}
                  <span className="ml-2 text-xs text-primary-cyan">
                    {t('avg LYA Score', 'Score LYA moy.')} {Math.round(marketStats.avgScore || 0)}/1000
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-white/5 hidden lg:block" />

          <div className="space-y-1 sm:space-y-2 text-right">
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className={`w-1.5 h-1.5 sm:w-2 h-2 ${userContracts ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'} rounded-full animate-pulse`} />
              <span className="text-xs sm:text-[10px] font-black text-on-surface uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                {t('Terminal: LYA-MAIN-01', 'Terminal : LYA-MAIN-01')} | <span className="text-primary-cyan">{t('CORE: SYNCED', 'CORE : SYNCHRONISÉ')}</span>
              </span>
            </div>
            <div className="text-xs sm:text-[10px] font-mono text-on-surface-variant uppercase tracking-widest opacity-40">
              {t('Last Sync:', 'Dernière Sync :')} {lastUpdate.toLocaleTimeString('en-GB', { hour12: false })}
            </div>
          </div>
        </div>

        {/* Market Navigation - Mobile Optimized */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex gap-6 sm:gap-12 border-b border-white/5 min-w-max">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative group shrink-0 ${activeTab === 'overview' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="relative z-10">{t('General View', 'Vue d\'Ensemble')}</span>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-300" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>
            <button 
              onClick={() => setActiveTab('predictive')}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Zap size={14} className={activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
              <span className="relative z-10">{t('Project Analytics', 'Analyses de Projets')}</span>
              {activeTab === 'predictive' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-300" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>
            <button 
              onClick={() => setActiveTab('accessibilité')}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'accessibilité' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <ActivityIcon size={14} className={activeTab === 'accessibilité' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
              <span className="relative z-10">{t('Registry Activity', 'Activité du Registre')}</span>
              {activeTab === 'accessibilité' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-300" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'workspace' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <LayoutGrid size={14} className={activeTab === 'workspace' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
              <span className="relative z-10">{t('My Workspace', 'Mon Espace')}</span>
              {activeTab === 'workspace' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-300" />
              )}
              <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
            </button>

            {isAdmin && (
              <button 
                onClick={() => setActiveTab('management')}
                className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative group flex items-center gap-3 shrink-0 ${activeTab === 'management' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Shield size={14} className={activeTab === 'management' ? 'text-primary-cyan' : 'text-on-surface-variant opacity-40'} />
                <span className="relative z-10">{t('ACCESS CONTROL', 'CONTRÔLE D\'ACCÈS')}</span>
                {activeTab === 'management' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] transition-all duration-300" />
                )}
                <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/5 transition-all duration-300 -mb-0.5" />
              </button>
            )}
          </div>
        </div>
          
          { activeTab === 'overview' && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: t('Supported Projects', 'Projets Soutenus'), value: activeContractsCount || 0, isCurrency: false, trend: t('Active', 'Actifs'), color: 'border-primary-cyan', icon: <Layers size={16} />, suffix: '', tooltip: t('The number of certified creative projects you are supporting on the LYA Registry.', 'Le nombre de projets créatifs certifiés que vous soutenez sur le Registre LYA.') },
              { label: t('Average LYA Score', 'Score LYA Moyen'), value: marketStats.avgScore ? Math.round(marketStats.avgScore) : '—', isCurrency: false, trend: t('/ 1000 pts', '/ 1000 pts'), color: 'border-primary-cyan', icon: <TrendingUp size={16} />, suffix: ' pts', tooltip: t('The average LYA Score across all certified projects you follow. Reflects overall quality on the registry.', 'Le Score LYA moyen de tous les projets certifiés que vous suivez. Reflète la qualité globale sur le registre.') },
              { label: t('Certified Projects', 'Projets Certifiés'), value: marketStats.totalProjects || 0, isCurrency: false, trend: t('On Registry', 'Au Registre'), color: 'border-white/20', icon: <LayoutGrid size={16} />, suffix: '', tooltip: t('The total number of creative projects certified on the LYA Registry, registry-wide.', 'Le nombre total de projets créatifs certifiés sur le Registre LYA, tout registre confondu.') },
              { label: t('Registry Quality', 'Qualité du Registre'), value: marketSentiment.label, isCurrency: false, trend: `${Math.round(marketStats.avgScore || 0)}/1000 ${t('avg', 'moy.')}`, color: 'border-accent-gold', icon: <ActivityIcon size={16} />, suffix: '', tooltip: t('Qualitative rating derived from the real average LYA Score across all certified projects on the registry.', 'Évaluation qualitative dérivée du Score LYA moyen réel de tous les projets certifiés sur le registre.') }
            ].map((stat, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm group-hover:border-primary-cyan/30 transition-all duration-500" />
                  <div className={`relative p-6 border-l-2 ${stat.color} flex flex-col justify-between min-h-[160px]`}>
                    <div className="flex justify-between items-start">
                      <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-40 flex items-center gap-2">
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
                          {stat.isCurrency === false
                            ? <>{stat.value}{stat.suffix || ''}</>
                            : stat.value
                          }
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* LYA Score Evolution Chart */}
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/50 to-transparent" />
                <div className="bg-white/[0.02] px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-white/5 relative z-10">
                  <div>
                    <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-3 sm:gap-4">
                      <TrendingUp size={20} className="text-primary-cyan" />
                      {t('LYA Score Evolution', 'Évolution des Scores LYA')}
                    </h2>
                    
                  </div>
                  <div className="flex bg-surface-dim/60 p-1 border border-white/5 rounded-sm shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map(time => (
                      <button 
                        key={time} 
                        onClick={() => setActiveRange(time)}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all active:scale-95 whitespace-nowrap ${
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
                        tickFormatter={(value) => `${value}`}
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
                        formatter={(value: number) => [`${value} pts`, t('LYA Score', 'Score LYA')]}
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
                    <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-4">
                      <TrendingUp size={16} className="text-emerald-400" />
                      {t('Top Progressions', 'Top Progressions')}
                    </h2>
                    <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40">SCORE LYA</div>
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
                          <div className="w-12 h-12 bg-surface-dim border border-white/10 overflow-hidden rounded-sm relative shrink-0">
                            <img 
                              src={contract.image || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200`} 
                              alt={contract.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=200`;
                              }}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">{contract.name}</div>
                            <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">{contract.registryIndex}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-[11px] sm:text-sm font-mono font-black ${contract.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {contract.scoreLYA || contract.totalScore || 650}/1000
                            </div>
                            <div className="text-[11px] font-black opacity-50 mt-0.5 text-white/50 uppercase tracking-widest">
                              LYA SCORE
                            </div>
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
                    <div className="px-6 pb-6 mt-auto">
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
                    <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-4">
                      <RefreshCw size={16} className="text-primary-cyan" />
                      {t('Stable Progressions', 'Progressions Stables')}
                    </h2>
                    <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40">TENDANCE 7J : STABLE</div>
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
                          <div className="w-12 h-12 bg-surface-dim border border-white/10 overflow-hidden rounded-sm relative shrink-0">
                            <img 
                              src={contract.image || `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200`} 
                              alt={contract.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200`;
                              }}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">{contract.name}</div>
                            <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">{contract.registryIndex}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-[11px] sm:text-sm font-mono font-black ${contract.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {contract.scoreLYA || contract.totalScore || 650}/1000
                            </div>
                            <div className="text-[11px] font-black opacity-50 mt-0.5 text-white/50 uppercase tracking-widest">
                              LYA SCORE
                            </div>
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
                    <div className="px-6 pb-6 mt-auto">
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
            <div className="lg:col-span-1 self-start">
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-4">
                    <LayoutGrid size={16} className="text-primary-cyan" />
                    {t('Sector Heatmap', 'Carte de Chaleur Sectorielle')}
                  </h2>
                  <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40">PAR SCORE LYA</div>
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
                          <span className="text-[11px] font-mono text-on-surface-variant/40">{sector.weight}%</span>
                          <span className={`text-[10px] font-black font-mono ${sector.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sector.growth >= 0 ? '+' : ''}{sector.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, sector.weight * 2)}%` }}
                          className={`h-full ${sector.bg.replace('/10', '')} shadow-[0_0_10px_rgba(0,224,255,0.2)]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-black/20 border border-white/8 rounded-sm p-3 text-center">
                    <p className="text-lg font-black text-primary-cyan">{sectors.length}</p>
                    <p className="text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{t('Sectors Tracked', 'Secteurs Suivis')}</p>
                  </div>
                  <div className="bg-black/20 border border-white/8 rounded-sm p-3 text-center">
                    <p className="text-lg font-black text-emerald-400">{sectors.filter(s => s.growth >= 0).length}</p>
                    <p className="text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{t('Growing', 'En Croissance')}</p>
                  </div>
                </div>
                <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                    <span>SCORE MOYEN REGISTRE</span>
                    <span className="text-primary-cyan">
                      {Math.round(marketStats.avgScore || 0)}/1000
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
                <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-4">
                  <RefreshCw size={16} className="text-primary-cyan animate-spin-slow" />
                  {t('Recent Certification Activity', 'Activité de Certification Récente')}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">LIVE FEED</span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest text-center py-6">
                    {t('No certification activity yet.', 'Aucune activité de certification pour le moment.')}
                  </p>
                ) : recentActivity.slice(0, visibleActivities).map((activity, i) => {
                  const style = getSectorStyle(activity.category);
                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-5 bg-surface-dim/30 border border-white/5 rounded-sm hover:bg-white/[0.02] transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-sm ${style.bg} ${style.text} border border-white/5 shadow-inner`}>
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-on-surface group-hover:text-primary-cyan transition-colors">
                            {activity.name}
                          </div>
                          <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">
                            {activity.category} · {formatTimeAgo(activity.timestampMs, t)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-black text-primary-cyan">{activity.score}/1000</div>
                        <div className="text-[10px] text-on-surface-variant font-bold opacity-40 mt-1">{t('LYA Score', 'Score LYA')}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {visibleActivities < recentActivity.length && (
                <div className="px-8 pb-8">
                  <button
                    onClick={() => setVisibleActivities(prev => prev + 5)}
                    className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                  >
                    {t('Load More', 'Voir Plus')} <RefreshCw size={14} />
                  </button>
                </div>
              )}
              <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setVisibleActivities(prev => prev + 5)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                >
                  {t('Load More', 'Voir Plus')} <RefreshCw size={14} />
                </button>
                <button 
                  onClick={() => onViewChange?.('WALLET')}
                  className="flex-1 py-3 bg-primary-cyan/10 border border-primary-cyan/20 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:bg-primary-cyan hover:text-surface-dim transition-all flex items-center justify-center gap-2 rounded-sm"
                >
                  {t('View Full Activity', 'Voir Toute l\'Activité')} <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl p-10">
              <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <h2 className="text-base font-black font-headline uppercase tracking-wider flex items-center gap-4">
                  <ActivityIcon size={16} className="text-primary-cyan" />
                  {t('Registry Distribution', 'Répartition du Registre')}
                </h2>
                <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-40">{t('BY DISCIPLINE', 'PAR DISCIPLINE')}</div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(marketStats.categoryBreakdown || []).slice(0, 6).map((c: any) => ({ name: c.category, value: c.weight }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff05" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#8E9299', fontWeight: 'bold', letterSpacing: '0.05em' }}
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
                      formatter={(value: number) => [`${value}%`, t('Registry Share', 'Part du Registre')]}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={35}>
                      {(marketStats.categoryBreakdown || []).slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00E0FF' : 'rgba(255,255,255,0.05)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-10 flex justify-between items-center bg-surface-dim/30 p-6 rounded-sm border border-white/5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary-cyan rounded-full shadow-[0_0_15px_rgba(0,224,255,0.6)]"></div>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant font-black opacity-60">
                    {marketStats.categoryBreakdown?.[0]
                      ? `${t('Leading Discipline:', 'Discipline Principale :')} ${CATEGORY_LABELS[marketStats.categoryBreakdown[0].category] || marketStats.categoryBreakdown[0].category}`
                      : t('No certified projects yet', 'Aucun projet certifié pour le moment')}
                  </span>
                </div>
                <span className="text-[11px] font-black text-primary-cyan uppercase tracking-[0.3em]">{marketStats.totalProjects || 0} {t('CERTIFIED PROJECTS', 'PROJETS CERTIFIÉS')}</span>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'predictive' ? (
        <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8">
          <LYAAlgorithm />
        </div>
      ) : activeTab === 'workspace' ? (
        <WorkspaceWidgets />
      ) : activeTab === 'management' ? (
        <AdminKeysManagement />
      ) : (
        <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8 space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Registry Activity', 'Activité du Registre')}</h3>
          <p className="text-xs text-on-surface-variant/60 leading-relaxed max-w-lg">
            {t('Recent certification milestones and LYA Score movements across the registry.', 'Derniers jalons de certification et évolutions du Score LYA sur le registre.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/20 border border-white/8 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-primary-cyan">{marketStats.totalProjects || 0}</p>
              <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{t('Certified Projects', 'Projets Certifiés')}</p>
            </div>
            <div className="bg-black/20 border border-white/8 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-[#a78bfa]">{marketStats.recentCount30d || 0}</p>
              <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{t('Score Updates (30d)', 'Mises à Jour Score (30j)')}</p>
            </div>
            <div className="bg-black/20 border border-white/8 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{Math.round(marketStats.avgScore || 0)}</p>
              <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{t('Avg LYA Score', 'Score LYA Moyen')}</p>
            </div>
          </div>
        </div>
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
            {isLoadingNews ? (
              <div className="space-y-3 py-6 text-center">
                <div className="w-8 h-8 border-2 border-primary-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant animate-pulse">
                  {t('RETRIEVING LATEST GLOBAL CREATIVE INDICES...', 'RECUPERATION DES INDICES CRÉATIFS MONDIAUX...')}
                </p>
              </div>
            ) : (
              news.slice(0, visibleNews).map((item) => {
                const sectorStyle = getSectorStyle(item.sector);
                return (
                <div key={item.id} className={`p-4 bg-white/5 border-l-2 border border-white/5 rounded-xl group hover:border-primary-cyan/30 transition-all cursor-pointer ${sectorStyle.border}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-on-surface-variant/60 uppercase tracking-widest">{item.time} • {item.source}</span>
                      {item.sector && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${sectorStyle.bg} ${sectorStyle.text}`}>
                          {item.sector}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      item.impact.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {item.impact} IMPACT
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-primary-cyan transition-colors text-justify mb-2">
                    {item.title}
                  </h4>
                  {item.impactDetail && (
                    <p className="text-[11px] text-white/50 leading-relaxed mb-2 line-clamp-2">
                      {item.impactDetail}
                    </p>
                  )}
                  {item.targetProject && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-md text-[11px] font-black text-primary-cyan uppercase tracking-widest mt-1">
                      <span className="w-1.5 h-1.5 bg-primary-cyan rounded-full animate-pulse"></span>
                      Benchmark: {item.targetProject}
                    </div>
                  )}
                </div>
                );
              })
            )}
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
                  <span className="text-[11px] font-mono text-on-surface-variant/40">{node.latency}</span>
                </div>
              ))}
            </div>
            {visibleNetwork < networkActivity.length && (
              <button 
                onClick={() => setVisibleNetwork(prev => prev + 2)}
                className="w-full py-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors border-t border-white/5 pt-4"
              >
                {t('Load More Nodes', 'Voir Plus de Nœuds')}
              </button>
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
                  <span className={`text-[11px] font-mono font-black ${sector.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sector.growth >= 0 ? '+' : ''}{sector.growth}%
                  </span>
                </div>
              ))}
            </div>
            {visibleNetwork < sectors.length && (
              <button 
                onClick={() => setVisibleNetwork(prev => prev + 4)}
                className="w-full py-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-accent-gold transition-colors border-t border-white/5 pt-4"
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

