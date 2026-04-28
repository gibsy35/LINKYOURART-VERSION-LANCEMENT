
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Globe, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Clock,
  Award,
  RefreshCw,
  Bookmark,
  ChevronRight,
  X
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { BreakingNewsTicker } from '../components/BreakingNewsTicker';
import { Ticker } from '../components/ui/Ticker';
import { CONTRACTS } from '../types';

interface NewsItem {
  id: string;
  category: 'GLOBAL' | 'MARKET' | 'INNOVATION' | 'INSTITUTIONAL';
  title: string;
  summary: string;
  timestamp: string;
  impact: {
    score: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    description: string;
  };
  source: string;
  imageUrl?: string;
}

const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    category: 'INSTITUTIONAL',
    title: 'Netflix Announces New $500M European Production Center',
    summary: 'The streaming giant is expanding its footprint in Europe, focusing on local language content and regional talent development.',
    timestamp: '10m ago',
    impact: {
      score: 15,
      trend: 'UP',
      description: 'Significant boost to European creative contracts. Registries reporting 12% increase in validation requests.'
    },
    source: 'Variety',
    imageUrl: 'https://picsum.photos/seed/netflix/800/400'
  },
  {
    id: '5',
    category: 'MARKET',
    title: 'Regulatory Shift in Digital Asset Taxation',
    summary: 'New guidelines from the G7 could impact how creative contracts are taxed across international borders.',
    timestamp: '8h ago',
    impact: {
      score: -12,
      trend: 'DOWN',
      description: 'Short-term volatility expected in cross-border settlements. Advisory: Review jurisdiction filters.'
    },
    source: 'Financial Times',
    imageUrl: 'https://picsum.photos/seed/finance/800/400'
  },
  {
    id: '2',
    category: 'MARKET',
    title: 'Creative Equity Index Reaches All-Time High',
    summary: 'Global creative assets are outperforming traditional tech stocks as institutional investors seek alternative yields.',
    timestamp: '45m ago',
    impact: {
      score: 8,
      trend: 'UP',
      description: 'LYA Unit floor price adjusted to $52.40. Market liquidity at record levels.'
    },
    source: 'Bloomberg Creative',
    imageUrl: 'https://picsum.photos/seed/market/1200/800'
  },
  {
    id: '6',
    category: 'MARKET',
    title: 'Major Music Catalog Valuation Dispute',
    summary: 'A high-profile dispute over the valuation of a legendary rock band\'s catalog is causing ripples in the music equity market.',
    timestamp: '10h ago',
    impact: {
      score: -25,
      trend: 'DOWN',
      description: 'Market uncertainty for legacy music contracts. Liquidity centers reporting wider spreads.'
    },
    source: 'Rolling Stone',
    imageUrl: 'https://picsum.photos/seed/music/1200/800'
  },
  {
    id: '3',
    category: 'INNOVATION',
    title: 'New AI Protocol for Automated IP Validation',
    summary: 'A consortium of major labels and studios has released a new standard for tracking creative rights across digital platforms.',
    timestamp: '2h ago',
    impact: {
      score: 22,
      trend: 'UP',
      description: 'Settlement speed expected to increase by 40%. Reducing legal friction for new contract issuances.'
    },
    source: 'TechCrunch',
    imageUrl: 'https://picsum.photos/seed/ai-tech/1200/800'
  },
  {
    id: '7',
    category: 'INSTITUTIONAL',
    title: 'Cybersecurity Alert: Registry Sync Latency',
    summary: 'Several institutional registries in the Asia-Pacific region are reporting synchronization delays due to a coordinated DDoS attempt.',
    timestamp: '15h ago',
    impact: {
      score: -45,
      trend: 'DOWN',
      description: 'Temporary settlement delays for APAC-indexed contracts. Security protocol V5.1 activated.'
    },
    source: 'Cyber Defense',
    imageUrl: 'https://picsum.photos/seed/security/1200/800'
  },
  {
    id: '4',
    category: 'GLOBAL',
    title: 'Venice Biennale Reports Record Attendance',
    summary: 'The world\'s most prestigious art exhibition shows a massive surge in interest for interactive and digital-first installations.',
    timestamp: '5h ago',
    impact: {
      score: 5,
      trend: 'STABLE',
      description: 'Positive sentiment for contemporary art registries. No immediate price adjustment required.'
    },
    source: 'The Art Newspaper',
    imageUrl: 'https://picsum.photos/seed/venice/1200/800'
  },
  {
    id: '8',
    category: 'INNOVATION',
    title: 'Spatial Audio Rights Framework Released',
    summary: 'A new standard for immersive audio licensing aims to simplify royalty distribution for VR and AR experiences.',
    timestamp: '12h ago',
    impact: {
      score: 15,
      trend: 'UP',
      description: 'Opening new revenue streams for music producers. 15% growth projected in immersive audio sector.'
    },
    source: 'Wired',
    imageUrl: 'https://picsum.photos/seed/audio/800/400'
  },
  {
    id: '9',
    category: 'GLOBAL',
    title: 'South Korean K-Pop Labels Adopt LYA Protocol',
    summary: 'Major entertainment agencies in Seoul are moving their trainee contracts to the LYA registry for transparent funding.',
    timestamp: '15h ago',
    impact: {
      score: 42,
      trend: 'UP',
      description: 'Massive influx of retail interest from Asia. K-Pop sector contracts seeing 300% volume increase.'
    },
    source: 'The Korea Herald',
    imageUrl: 'https://picsum.photos/seed/kpop/800/400'
  },
  {
    id: '10',
    category: 'INSTITUTIONAL',
    title: 'Goldman Sachs Launches Creative Equity Desk',
    summary: 'The investment bank is the first major Wall Street player to open a dedicated trading desk for creative contracts.',
    timestamp: '1d ago',
    impact: {
      score: 55,
      trend: 'UP',
      description: 'Ultimate institutional validation. Market depth expected to double in the next quarter.'
    },
    source: 'Wall Street Journal',
    imageUrl: 'https://picsum.photos/seed/goldman/800/400'
  },
  {
    id: '11',
    category: 'INNOVATION',
    title: 'AI-Generated Film Wins Major Festival Award',
    summary: 'A short film produced entirely with generative AI tools has secured a top prize, sparking debate on creative ownership.',
    timestamp: '2h ago',
    impact: {
      score: 18,
      trend: 'UP',
      description: 'New category of AI-assisted contracts being drafted for the LYA registry.'
    },
    source: 'The Verge',
    imageUrl: 'https://picsum.photos/seed/aifilm/800/400'
  },
  {
    id: '12',
    category: 'MARKET',
    title: 'Independent Studio Revolution in Europe',
    summary: 'Boutique production houses are leveraging LYA units to bypass traditional financing hurdles in France and Germany.',
    timestamp: '5h ago',
    impact: {
      score: 12,
      trend: 'UP',
      description: 'Decentralized funding models are becoming the new standard for mid-budget cinema.'
    },
    source: 'Le Monde',
    imageUrl: 'https://picsum.photos/seed/studio/800/400'
  },
  {
    id: '13',
    category: 'GLOBAL',
    title: 'Creative Centers in Southeast Asia See 300% Growth',
    summary: 'Emerging markets are rapidly adopting the LYA protocol for transparent project funding and rights management.',
    timestamp: '8h ago',
    impact: {
      score: 35,
      trend: 'UP',
      description: 'Massive expansion in regional creative economies backed by institutional liquidity.'
    },
    source: 'Nikkei Asia',
    imageUrl: 'https://picsum.photos/seed/asia/800/400'
  },
  {
    id: '14',
    category: 'INSTITUTIONAL',
    title: 'Hollywood Reporter: Major Studios Form IP Consortium',
    summary: 'Disney, Warner Bros, and Paramount are collaborating on a shared registry for legacy IP rights management.',
    timestamp: '1d ago',
    impact: {
      score: 28,
      trend: 'UP',
      description: 'Standardization of legacy rights will unlock billions in dormant creative equity.'
    },
    source: 'Hollywood Reporter',
    imageUrl: 'https://picsum.photos/seed/hollywood/800/400'
  },
  {
    id: '15',
    category: 'MARKET',
    title: 'Le Monde: French Government Backs Creative Tokenization',
    summary: 'The Ministry of Culture announces tax incentives for projects using institutional creative registries.',
    timestamp: '2d ago',
    impact: {
      score: 45,
      trend: 'UP',
      description: 'France becomes the first G7 nation to officially integrate creative equity into national policy.'
    },
    source: 'Le Monde',
    imageUrl: 'https://picsum.photos/seed/france/800/400'
  },
  {
    id: '16',
    category: 'INNOVATION',
    title: 'New Protocol for Real-Time Royalty Settlement',
    summary: 'A breakthrough in smart contract technology allows for micro-payments to be settled instantly upon content consumption.',
    timestamp: '3d ago',
    impact: {
      score: 62,
      trend: 'UP',
      description: 'Eliminating the 6-month delay in music and film royalty payments. Game changer for creators.'
    },
    source: 'The Verge',
    imageUrl: 'https://picsum.photos/seed/royalty/800/400'
  }
];

interface SocialFeedViewProps {
  onNotify: (msg: string) => void;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({ onNotify }) => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [filter, setFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleNodes, setVisibleNodes] = useState(8);
  const [visibleSectors, setVisibleSectors] = useState(9);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const pageSize = 6;

  const nodes = [
    { label: 'Paris Registry', status: 'SYNCED', latency: '12ms' },
    { label: 'Tokyo Registry', status: 'SYNCED', latency: '45ms' },
    { label: 'NY Registry', status: 'SYNCED', latency: '28ms' },
    { label: 'London Center', status: 'SYNCED', latency: '15ms' },
    { label: 'Berlin Registry', status: 'SYNCED', latency: '18ms' },
    { label: 'Seoul Registry', status: 'SYNCED', latency: '38ms' },
    { label: 'Singapore Registry', status: 'SYNCED', latency: '22ms' },
    { label: 'Sydney Registry', status: 'SYNCED', latency: '52ms' },
    { label: 'Zurich Vault', status: 'SYNCED', latency: '10ms' },
    { label: 'Dubai Registry', status: 'SYNCED', latency: '33ms' },
    { label: 'Toronto Registry', status: 'SYNCED', latency: '25ms' },
    { label: 'Mumbai Registry', status: 'SYNCED', latency: '41ms' }
  ];

  const sectors = [
    { label: 'Music Rights', trend: '+12.4%', color: 'text-primary-cyan' },
    { label: 'Film Equity', trend: '+8.2%', color: 'text-emerald-400' },
    { label: 'Digital Art', trend: '-2.1%', color: 'text-red-400' },
    { label: 'Gaming IP', trend: '+15.7%', color: 'text-accent-purple' },
    { label: 'TV Series', trend: '+10.4%', color: 'text-accent-gold' },
    { label: 'Fashion IP', trend: '+5.3%', color: 'text-primary-cyan' },
    { label: 'Literary Rights', trend: '+3.1%', color: 'text-emerald-400' },
    { label: 'Design Equity', trend: '+7.8%', color: 'text-accent-gold' },
    { label: 'Photography', trend: '+2.4%', color: 'text-primary-cyan' },
    { label: 'Architecture', trend: '+4.9%', color: 'text-emerald-400' },
    { label: 'Sculpture', trend: '+1.2%', color: 'text-accent-purple' },
    { label: 'Performance', trend: '+6.5%', color: 'text-accent-gold' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % news.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [news.length]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate adding a new item
      const newItem: NewsItem = {
        id: Date.now().toString(),
        category: 'GLOBAL',
        title: 'Universal Music Group Partners with LYA Protocol',
        summary: 'Strategic partnership to index future catalog revenue for emerging artists.',
        timestamp: 'Just now',
        impact: {
          score: +35,
          trend: 'UP',
          description: 'Massive institutional validation. Music sector contracts expected to surge.'
        },
        source: 'Reuters',
        imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`
      };
      setNews(prev => [newItem, ...prev]);
    }, 1500);
  };

  const filteredNews = filter === 'ALL' ? news : news.filter(item => item.category === filter);
  const paginatedNews = filteredNews.slice(0, currentPage * pageSize);
  const hasMore = paginatedNews.length < filteredNews.length;

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive News Player Section - NOW FIRST */}
      <section className="relative h-[450px] md:h-[700px] lg:h-[750px] group overflow-hidden -mx-6 md:-mx-12 -mt-14">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={news[activeNewsIndex].id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={`${news[activeNewsIndex].imageUrl}?random=${activeNewsIndex}`} 
                alt={news[activeNewsIndex].title} 
                className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-dim/80 via-transparent to-transparent" />
              
              {/* Artistic Overlays */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,224,255,0.3),transparent)]" />
              </div>
              
              <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply">
                <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-primary-cyan blur-[120px] rounded-full" />
                <div className="absolute bottom-[25%] right-[15%] w-96 h-96 bg-accent-pink blur-[150px] rounded-full" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Top-Left Metadata Overlay - Perfectly aligned with right pagination */}
        <div className="absolute top-24 left-8 md:left-12 z-20">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`meta-${news[activeNewsIndex].id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <span className="px-4 py-1.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] rounded-sm shadow-[0_0_20px_rgba(0,224,255,0.4)]">
                {activeNewsIndex === 0 ? t('Breaking News', 'Flash Info') : t('Featured Story', 'À la Une')}
              </span>
              <div className="hidden md:flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-sm">
                <span className="text-white/80 text-[10px] font-mono uppercase tracking-widest">
                  {news[activeNewsIndex].timestamp} • {news[activeNewsIndex].source}
                </span>
                <div className="h-3 w-[1px] bg-white/20" />
                <div className={`flex items-center gap-1 text-[10px] font-black font-mono ${
                  news[activeNewsIndex].impact.trend === 'UP' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {news[activeNewsIndex].impact.trend === 'UP' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  LYA IMPACT: {news[activeNewsIndex].impact.score > 0 ? '+' : ''}{news[activeNewsIndex].impact.score}%
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      {/* Content Overlay - Bottom Left */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 max-w-[1800px] mx-auto">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={news[activeNewsIndex].id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl pb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white font-headline tracking-tighter leading-[1.05] uppercase mb-8 drop-shadow-2xl line-clamp-3 max-w-xl">
              {news[activeNewsIndex].title}
            </h2>
            
            <p className="border-l-2 border-primary-cyan pl-6 text-base md:text-lg text-white/80 max-w-3xl mb-10 font-medium leading-relaxed drop-shadow-lg line-clamp-2">
              {news[activeNewsIndex].summary}
            </p>
            
            <div className="flex flex-wrap items-center gap-5">
              <button 
                onClick={() => {
                  setSelectedNews(news[activeNewsIndex]);
                  onNotify(t('Opening full story...', 'Ouverture de l\'article...'));
                }}
                className="px-8 py-3 bg-white text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-cyan transition-all rounded-sm shadow-xl active:scale-95 group"
              >
                <span className="flex items-center gap-2">
                  {t('Read Full Story', 'Lire l\'article')}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNotify(t('Link copied!', 'Lien copié !'))}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all backdrop-blur-md"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={() => onNotify(t('Article saved!', 'Article enregistré !'))}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all backdrop-blur-md"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots - Aligned with top-left */}
      <div className="absolute top-24 right-12 flex flex-col items-end gap-3 opacity-80 z-20">
        <div className="text-[10px] font-mono text-primary-cyan uppercase tracking-[0.4em] font-bold">LYA_INTELLIGENCE_STREAM</div>
        <div className="text-[10px] font-mono text-white uppercase tracking-[0.4em]">CENTER_REF_00{activeNewsIndex + 1}</div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3, 4].map(i => (
            <button 
              key={i} 
              onClick={() => setActiveNewsIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeNewsIndex ? 'bg-primary-cyan w-4' : 'bg-white/20 hover:bg-white/40'}`} 
            />
          ))}
        </div>
      </div>
      </section>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-12 py-12">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-[0.9] uppercase mb-6 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-primary-cyan"></div>
            <span>{t('Market', 'COURS DU')} <span className="text-primary-cyan">{t('Pulse', 'MARCHÉ')}</span></span>
          </h1>
          <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-lg text-[10px] md:text-xs leading-relaxed opacity-70 uppercase tracking-[0.3em] font-black">
            {t('REAL-TIME CURATION OF HIGH-IMPACT NEWS AND MARKET SHIFTS ACROSS THE GLOBAL CREATIVE ECONOMY.', 'CURATION EN TEMPS RÉEL DES ACTUALITÉS À FORT IMPACT ET DES CHANGEMENTS DE MARCHÉ DANS L\'ÉCONOMIE CRÉATIVE MONDIALE.')}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px]">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Active Feeds', 'Flux Actifs')}</div>
            <div className="text-2xl font-black text-primary-cyan">12</div>
          </div>
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px]">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Neural Filter', 'Filtre Neural')}</div>
            <div className="text-2xl font-black text-emerald-400">99.4%</div>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="px-6 flex items-center justify-between gap-4 mb-24">
        <div className="flex bg-surface-low border border-white/5 p-1.5 rounded-sm shadow-2xl">
          {['ALL', 'GLOBAL', 'MARKET', 'INNOVATION', 'INSTITUTIONAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-primary-cyan text-surface-dim' 
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : 'animate-spin-slow'} />
          REFRESH FEED
        </button>
      </div>

      {/* Main Feed Grid */}
      <div className="px-6 grid lg:grid-cols-3 gap-8">
        {/* Left Column: Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {paginatedNews.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-surface-low/40 backdrop-blur-xl border border-white/5 overflow-hidden group hover:border-primary-cyan/30 transition-all rounded-xl shadow-2xl"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden relative shrink-0">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-surface-dim/80 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary-cyan">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                            <span className="mx-2">•</span>
                            {item.source}
                          </div>
                          {item.impact.score > 80 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-[8px] font-black uppercase tracking-widest border border-accent-gold/20 rounded-sm animate-pulse">
                              <TrendingUp className="w-2 h-2" />
                              Trending
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                          item.impact.trend === 'UP' ? 'text-emerald-400' : 
                          item.impact.trend === 'DOWN' ? 'text-red-400' : 'text-primary-cyan'
                        }`}>
                          {item.impact.trend === 'UP' ? <TrendingUp size={12} /> : 
                           item.impact.trend === 'DOWN' ? <ArrowDownRight size={12} /> : <Activity size={12} />}
                          {item.impact.score > 0 ? '+' : ''}{item.impact.score}% IMPACT
                        </div>
                      </div>
                      <h3 className="text-xl font-black font-headline uppercase leading-tight mb-3 group-hover:text-primary-cyan transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity uppercase font-medium">
                        {item.summary}
                      </p>
                    </div>
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => onNotify(t('Link copied to clipboard!', 'Lien copié dans le presse-papiers !'))}
                            className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center gap-2"
                          >
                            <Share2 size={14} /> SHARE
                          </button>
                          <button 
                            onClick={() => onNotify(t('Article saved to your library.', 'Article enregistré dans votre bibliothèque.'))}
                            className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center gap-2"
                          >
                            <Bookmark size={14} /> SAVE
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedNews(item);
                            onNotify(t('Opening full story...', 'Ouverture de l\'article...'));
                          }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-cyan group/more"
                        >
                          {t('Read Full Story', 'Lire l\'article')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div className="pt-8 text-center">
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-12 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-surface-dim transition-all active:scale-95"
              >
                {t('Load More Intelligence', 'Charger plus d\'informations')}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-8">
          {/* Market Sentiment */}
          <div className="bg-surface-low border border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Sentiment
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-white">Institutional Trust</span>
                  <span className="text-primary-cyan">88%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                    className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-white">Market Liquidity</span>
                  <span className="text-emerald-400">72%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-white">Regulatory Stability</span>
                  <span className="text-primary-cyan">64%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '64%' }}
                    className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Network Activity */}
          <div className="bg-surface-low border border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Live Network Activity
            </h3>
            
            <div className="space-y-4">
              {nodes.slice(0, visibleNodes).map((node, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{node.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant/40">{node.latency}</span>
                </div>
              ))}
            </div>
            {visibleNodes < nodes.length && (
              <button 
                onClick={() => setVisibleNodes(prev => prev + 4)}
                className="w-full mt-4 py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors border-t border-white/5 pt-4"
              >
                {t('Load More Registries', 'Charger plus de Registres')}
              </button>
            )}
          </div>

          {/* Trending Sectors */}
          <div className="bg-surface-low border border-white/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-4 h-4" />
              Trending Sectors
            </h3>
            
            <div className="space-y-4 relative z-10">
              {sectors.slice(0, visibleSectors).map((sector, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group/item">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover/item:text-accent-gold transition-colors">{sector.label}</span>
                  <span className={`text-[9px] font-mono font-black ${sector.color}`}>{sector.trend}</span>
                </div>
              ))}
            </div>
            {visibleSectors < sectors.length && (
              <button 
                onClick={() => setVisibleSectors(prev => prev + 4)}
                className="w-full mt-4 py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-accent-gold transition-colors border-t border-white/5 pt-4 relative z-10"
              >
                {t('Load More Sectors', 'Charger plus de Secteurs')}
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-low border border-white/5 p-4 text-center">
              <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase mb-1">Total News</div>
              <div className="text-2xl font-black text-white">{news.length * 124}</div>
            </div>
            <div className="bg-surface-low border border-white/5 p-4 text-center">
              <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase mb-1">Impact Score</div>
              <div className="text-2xl font-black text-primary-cyan">
                +{news.reduce((acc, item) => acc + Math.abs(item.impact.score), 0) / news.length > 0 ? (news.reduce((acc, item) => acc + Math.abs(item.impact.score), 0) / news.length).toFixed(1) : '42.5'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
          >
            <div className="absolute inset-0 bg-surface-dim/95 backdrop-blur-3xl" onClick={() => setSelectedNews(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-surface-low border border-white/10 rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-surface-dim transition-all"
              >
                <X size={20} />
              </button>

              <div className="relative h-64 md:h-96">
                <img 
                  src={selectedNews.imageUrl} 
                  alt={selectedNews.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-low via-transparent to-transparent" />
              </div>

              <div className="p-8 md:p-16 space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-4 py-1.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-sm">
                    {selectedNews.category}
                  </span>
                  <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
                    {selectedNews.timestamp} • {selectedNews.source}
                  </span>
                </div>

                <h2 className="text-3xl md:text-6xl font-black font-headline uppercase tracking-tighter leading-tight text-white">
                  {selectedNews.title}
                </h2>

                <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                  <div className="md:col-span-2 space-y-6">
                    <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium">
                      {selectedNews.summary}
                    </p>
                    <div className="space-y-4 text-on-surface-variant leading-relaxed opacity-70">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                      <h4 className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-4">LYA IMPACT ANALYSIS</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`text-3xl font-black ${selectedNews.impact.trend === 'UP' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {selectedNews.impact.score > 0 ? '+' : ''}{selectedNews.impact.score}%
                        </div>
                        <div className="text-[10px] font-medium text-on-surface-variant leading-tight">
                          {selectedNews.impact.description}
                        </div>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedNews.impact.trend === 'UP' ? 'bg-emerald-400' : 'bg-red-400'}`} 
                          style={{ width: `${Math.abs(selectedNews.impact.score)}%` }} 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        onNotify(`REDIRECTING TO REGISTRY FOR ${selectedNews.title.toUpperCase()}...`);
                        setSelectedNews(null);
                      }}
                      className="w-full py-4 bg-white text-surface-dim font-black uppercase tracking-widest text-xs hover:bg-primary-cyan transition-all rounded-sm shadow-xl"
                    >
                      VIEW ON REGISTRY
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
