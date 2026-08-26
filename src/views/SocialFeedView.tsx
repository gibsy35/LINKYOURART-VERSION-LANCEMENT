
import React, { useState, useEffect, useMemo } from 'react';
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
import { fetchRealtimeNews } from '../services/geminiService';
import { PressMediaSection } from '../components/PressMediaSection';
import { JobsSection } from '../components/JobsSection';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface NewsItem {
  id: string;
  category: 'GLOBAL' | 'INDUSTRY' | 'INNOVATION' | 'PROFESSIONAL' | 'PRESS';
  title: string;
  summary: string;
  timestamp: string;
  // Score d'impact LYA — réel, dérivé des vrais projets certifiés sur
  // la plateforme dont la catégorie est mentionnée dans l'article.
  // Absent (undefined) si aucun projet réel ne correspond — jamais
  // remplacé par une estimation.
  relatedProjects?: {
    count: number;
    avgLyaScore: number;
    categories: string[];
  };
  source: string;
  url?: string;
  imageUrl?: string;
}

// Aucun article de démonstration — reste vide tant que le vrai flux
// (/api/news) n'a pas répondu. Pas de contenu inventé en secours.
const INITIAL_NEWS: NewsItem[] = [];

interface SocialFeedViewProps {
  onNotify: (msg: string) => void;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({ onNotify }) => {
  const { t, language } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [filter, setFilter] = useState<string>('ALL');
  // Le survol (:hover) ne se déclenche pas de façon fiable sur tactile —
  // bascule au tap en plus du survol souris pour desktop.
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const toggleRevealed = (id: string) => setRevealedCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleSectors, setVisibleSectors] = useState(9);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<string, boolean>>({});
  const [mainTab, setMainTab] = useState<'news' | 'press' | 'jobs'>('news');
  const pageSize = 6;

  const articlesWithRealMatch = React.useMemo(
    () => news.filter(n => n.relatedProjects && n.relatedProjects.count > 0).length,
    [news]
  );

  // Les 14 catégories réelles utilisées par les projets LYA (src/types.ts)
  const LYA_CATEGORIES = ['Fine Art', 'Film', 'TV Series', 'Music', 'Digital Art', 'Gaming', 'Literature', 'Fashion', 'Architecture', 'Design', 'Photography', 'Podcast', 'Performing Arts', 'Gastronomy'];

  // Remplace l'ancienne liste "Live Network Activity" — un faux réseau de
  // registres multi-villes (Paris/Tokyo/NY...) avec latences inventées.
  // Aucune infrastructure distribuée de ce type n'existe réellement :
  // remplacé par un état honnête basé sur les vrais projets certifiés.
  const realCertifiedCount = CONTRACTS.filter(c => c.status === 'LIVE').length;

  // Remplace l'ancienne liste "Trending Sectors" — des pourcentages de
  // tendance figés dans le code, jamais recalculés. Remplacé par un
  // vrai comptage de projets certifiés par catégorie (source : CONTRACTS,
  // la même donnée utilisée sur Exchange/Comparateur/Watchlist).
  const sectors = LYA_CATEGORIES
    .map(cat => {
      const inCat = CONTRACTS.filter(c => c.category === cat && c.status === 'LIVE');
      const avgScore = inCat.length > 0 ? Math.round(inCat.reduce((s, c) => s + c.totalScore, 0) / inCat.length) : 0;
      return { label: cat, count: inCat.length, avgScore };
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const loadRealNews = async () => {
    setIsLoading(true);
    const response = await fetchRealtimeNews(language);
    const data = Array.isArray(response) ? response : (response?.news || []);
    if (data && data.length > 0) {
      const formatted: NewsItem[] = data.map((item: any, idx: number) => ({
        id: item.id || `live-${idx}`,
        category: item.category as any,
        title: item.title,
        summary: item.summary,
        timestamp: item.timestamp || 'Just now',
        relatedProjects: item.relatedProjects || undefined,
        source: item.source,
        imageUrl: item.imageUrl
      }));
      setNews(formatted);
      onNotify(t('Real-time news streaming is online.', 'Le flux d\'actualités en direct est en ligne.'));
    } else {
      onNotify(t('No live news available right now.', 'Aucune actualité en direct disponible pour le moment.'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setActiveNewsIndex(0);
    loadRealNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    setActiveNewsIndex(0);
    const timer = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % news.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [news.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onNotify(t('Connecting to Search Grounding API...', 'Connexion à l\'API Search Grounding...'));
    await loadRealNews();
    setIsRefreshing(false);
  };

  const filteredNews = filter === 'ALL' ? news : news.filter(item => item.category === filter);
  const paginatedNews = filteredNews.slice(0, currentPage * pageSize);
  const hasMore = paginatedNews.length < filteredNews.length;

  const activeItem = news[activeNewsIndex] || news[0] || {
    id: 'placeholder',
    category: 'GLOBAL' as const,
    title: t('Waiting for live news...', 'En attente du flux en direct...'),
    summary: t('Real-time creative industry news will appear here shortly.', 'Les actualités en direct du monde créatif apparaîtront ici sous peu.'),
    timestamp: '',
    source: '',
    imageUrl: undefined,
    relatedProjects: undefined,
  };

  return (
    <div className="space-y-8 pb-12 w-full overflow-hidden block">
      {/* Immersive News Player Section - NOW FIRST */}
      <section className="relative h-[450px] md:h-[600px] lg:h-[650px] w-full group overflow-hidden bg-surface-dim border border-white/5 shadow-2xl rounded-3xl mt-2">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Vibrant abstract backplate that displays instantly while the image downloads */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-dim via-surface-mid to-black flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,224,255,0.08),transparent_70%)] animate-pulse" />
              </div>

              {activeItem.imageUrl && (
                <img 
                  src={activeItem.imageUrl} 
                  alt={activeItem.title} 
                  onLoad={() => setImageLoadedStates(prev => ({ ...prev, [activeItem.id]: true }))}
                  className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${
                    imageLoadedStates[activeItem.id] ? 'opacity-80 scale-100 saturate-100 blur-0' : 'opacity-30 scale-100 saturate-80 blur-0'
                  }`}
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/50 to-transparent" />
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
        <div className="absolute top-10 md:top-16 left-6 md:left-12 lg:left-16 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`meta-${activeItem.id}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 md:gap-4 shrink-0 transition-all"
            >
              <span className="px-3 py-1 bg-primary-cyan text-surface-dim text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-sm shadow-[0_0_20px_rgba(0,224,255,0.4)] whitespace-nowrap">
                {activeNewsIndex === 0 ? t('Breaking News', 'Flash Info') : t('Featured Story', 'À la Une')}
              </span>
              <div className="flex items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 md:px-4 md:py-1.5 rounded-sm overflow-hidden truncate">
                <span className="text-white/80 text-[8px] md:text-[10px] font-mono uppercase tracking-widest whitespace-nowrap">
                  {activeItem.timestamp}
                </span>
                {activeItem.relatedProjects && (
                  <>
                    <div className="h-3 w-[1px] bg-white/20 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1 text-[8px] md:text-[10px] font-black font-mono text-primary-cyan">
                      <Activity size={10} />
                      {activeItem.relatedProjects.count} {t('LYA PROJECTS', 'PROJETS LYA')}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      {/* Content Overlay - Bottom Left */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 lg:p-16 max-w-[1800px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl pb-8 md:pb-12"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white font-headline tracking-tighter leading-[1.1] uppercase mb-4 md:mb-6 drop-shadow-2xl line-clamp-2 max-w-2xl">
              {activeItem.title}
            </h2>
            
            <p className="border-l-2 border-primary-cyan pl-4 md:pl-6 text-xs md:text-sm text-white/80 max-w-2xl mb-6 md:mb-8 font-medium leading-relaxed drop-shadow-lg line-clamp-2 text-justify">
              {activeItem.summary}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              <button 
                onClick={() => {
                  setSelectedNews(activeItem);
                  onNotify(t('Opening full story...', 'Ouverture de l\'article...'));
                }}
                className="px-6 py-2.5 md:px-8 md:py-3 bg-white text-surface-dim text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-primary-cyan transition-all rounded-sm shadow-xl active:scale-95 group"
              >
                <span className="flex items-center gap-2">
                  {t('Read Full Story', 'Lire l\'article')}
                  <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={()=>{
  try { navigator.clipboard.writeText(window.location.href); } catch(e){}
  onNotify(t('✦ Link copied', '✦ Lien copié'));
}}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all backdrop-blur-md"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={async()=>{
  try {
    await addDoc(collection(db,'saved_articles'),{title:activeItem.title,summary:activeItem.summary,source:activeItem.source,imageUrl:activeItem.imageUrl,savedAt:serverTimestamp()});
    onNotify(t('✦ Article saved', '✦ Article sauvegardé'));
  } catch(e){onNotify(t('Erreur réseau','Network error'));}
}}
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
      <div className="absolute top-10 md:top-16 right-6 md:right-12 flex flex-col items-end gap-2 md:gap-2 opacity-80 z-20">
        <div className="text-[8px] md:text-[9px] font-mono text-primary-cyan uppercase tracking-[0.3em] font-bold">LYA_INTELLIGENCE_STREAM</div>
        <div className="text-[8px] md:text-[9px] font-mono text-white uppercase tracking-[0.3em]">CENTER_REF_00{activeNewsIndex + 1}</div>
        <div className="flex gap-1 mt-1 md:mt-2">
          {[0, 1, 2, 3, 4].map(i => (
            <button 
              key={i} 
              onClick={() => setActiveNewsIndex(i)}
              className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ${i === activeNewsIndex ? 'bg-primary-cyan w-3 md:w-4' : 'bg-white/20 hover:bg-white/40'}`} 
            />
          ))}
        </div>
      </div>
      </section>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-12">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-[0.9] uppercase mb-6 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-primary-cyan"></div>
            <span>{t('LYA', 'LYA')} <span className="text-primary-cyan">{t('Intelligence', 'Intelligence')}</span></span>
          </h1>
          <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-lg text-[10px] md:text-xs leading-relaxed opacity-70 uppercase tracking-[0.3em] font-black text-justify">
            {t('REAL-TIME CURATION OF HIGH-IMPACT NEWS AND INDUSTRY SHIFTS ACROSS THE GLOBAL CREATIVE ECONOMY.', 'CURATION EN TEMPS RÉEL DES ACTUALITÉS À FORT IMPACT ET DES ÉVOLUTIONS DE L\'INDUSTRIE CRÉATIVE MONDIALE.')}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px]">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Live Articles', 'Articles Live')}</div>
            <div className="text-2xl font-black text-primary-cyan tabular-nums">
              {news.length}
              <span className="text-xs text-primary-cyan/50 ml-1 animate-pulse">●</span>
            </div>
          </div>
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px]">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Feed Status', 'État du Flux')}</div>
            <div className={`flex items-center justify-center gap-2 text-sm font-black ${news.length > 0 ? 'text-emerald-400' : 'text-on-surface-variant/40'}`}>
              <span className={`w-2 h-2 rounded-full ${news.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-on-surface-variant/30'}`} />
              {news.length > 0 ? t('LIVE', 'EN DIRECT') : t('OFFLINE', 'HORS LIGNE')}
            </div>
          </div>
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px]">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Linked to LYA Projects', 'Liées à des Projets LYA')}</div>
            <div className="text-2xl font-black tabular-nums text-primary-cyan">
              {articlesWithRealMatch}/{news.length}
            </div>
          </div>
        </div>
      </header>

      {/* Onglets principaux */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMainTab('news')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mainTab === 'news' ? 'bg-primary-cyan text-surface-dim' : 'bg-surface-low border border-white/8 text-on-surface-variant hover:text-white'}`}>
          {t('News Feed', 'Actualités')}
        </button>
        <button onClick={() => setMainTab('press')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${mainTab === 'press' ? 'bg-[#a78bfa] text-surface-dim' : 'bg-surface-low border border-white/8 text-on-surface-variant hover:text-white'}`}>
          <span>✦</span> {t('Press & Media', 'Presse & Médias')}
          <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px]">NEW</span>
        </button>
        <button onClick={() => setMainTab('jobs')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${mainTab === 'jobs' ? 'bg-accent-gold text-surface-dim' : 'bg-surface-low border border-white/8 text-on-surface-variant hover:text-white'}`}>
          <span>★</span> {t('LYA Jobs', 'LYA Jobs')}
          <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px]">NEW</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className={`flex items-center justify-between gap-4 mb-24 ${mainTab === 'press' || mainTab === 'jobs' ? 'hidden' : ''}`}>
        <div className="flex bg-surface-low border border-white/5 p-1.5 rounded-sm shadow-2xl">
          {['ALL', 'GLOBAL', 'INDUSTRY', 'INNOVATION', 'PROFESSIONAL'].map((cat) => (
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

      {/* ── SECTION PRESSE & MÉDIAS ─────────────────────────────────────── */}
      {mainTab === 'press' && (
        <PressMediaSection t={t} language={language} onNotify={onNotify} />
      )}

      {/* ── SECTION LYA JOBS ─────────────────────────────────────── */}
      {mainTab === 'jobs' && (
        <JobsSection t={t} language={language} onNotify={onNotify} />
      )}

      {/* Main Feed Grid */}
      <div className={`grid lg:grid-cols-3 gap-8 ${mainTab === 'press' || mainTab === 'jobs' ? 'hidden' : ''}`}>
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
                  <div onClick={() => toggleRevealed(item.id)} className="w-full md:w-64 h-48 md:h-auto overflow-hidden relative shrink-0 bg-surface-low cursor-pointer">
                    {/* Placeholder gradient shown until image loads */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-primary-cyan/10 to-surface-dim flex items-center justify-center transition-opacity duration-500 ${imageLoadedStates[item.id] ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="w-10 h-10 border-2 border-primary-cyan/30 border-t-primary-cyan rounded-full animate-spin" />
                    </div>
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/600`}
                      alt={item.title} 
                      onLoad={() => setImageLoadedStates(prev => ({ ...prev, [item.id]: true }))}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}${item.category}/800/600`;
                        setImageLoadedStates(prev => ({ ...prev, [item.id]: true }));
                      }}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 group-hover:blur-0 group-hover:scale-110 ${revealedCards.has(item.id) ? 'grayscale-0 blur-0 scale-110' : 'grayscale blur-sm scale-105'} ${imageLoadedStates[item.id] ? (revealedCards.has(item.id) ? 'opacity-100' : 'opacity-60 group-hover:opacity-100') : 'opacity-0'}`}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
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
                          {item.relatedProjects && item.relatedProjects.count >= 3 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-[8px] font-black uppercase tracking-widest border border-accent-gold/20 rounded-sm animate-pulse">
                              <TrendingUp className="w-2 h-2" />
                              Trending
                            </span>
                          )}
                        </div>
                        {item.relatedProjects && (
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary-cyan">
                            <Activity size={12} />
                            {item.relatedProjects.count} {t('LYA PROJECTS', 'PROJETS LYA')} · {item.relatedProjects.avgLyaScore}/1000
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-black font-headline uppercase leading-tight mb-3 group-hover:text-primary-cyan transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity uppercase font-medium text-justify">
                        {item.summary}
                      </p>
                    </div>
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch(e){} onNotify(t('✦ Link copied', '✦ Lien copié')); }}
                            className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center gap-2"
                          >
                            <Share2 size={14} /> SHARE
                          </button>
                          <button 
                            onClick={async()=>{
  try {
    await addDoc(collection(db,'saved_articles'),{title:selectedNews?.title,summary:selectedNews?.summary,source:selectedNews?.source,imageUrl:selectedNews?.imageUrl,savedAt:serverTimestamp()});
    onNotify(t('✦ Article saved', '✦ Article sauvegardé'));
  } catch(e){onNotify(t('Erreur réseau','Network error'));}
}}
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
            <div className="pt-8 flex justify-center">
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex items-center gap-3 px-12 py-4 border border-primary-cyan/30 text-primary-cyan text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-cyan hover:text-surface-dim transition-all active:scale-95 group"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                {t('LOAD MORE NEWS', 'CHARGER PLUS D\'ACTUALITÉS')}
                <span className="text-white/30 font-mono text-[9px] ml-1">({filteredNews.length - paginatedNews.length} {t('left', 'restants')})</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-8">
          {/* Community Pulse */}
          <div className="bg-surface-low border border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Community Pulse
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-white">Professional Trust</span>
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
                  <span className="text-white">Registry Activity</span>
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

          {/* Registre LYA — remplace l'ancien "Live Network Activity"
              (faux réseau de registres multi-villes) par un état réel */}
          <div className="bg-surface-low border border-white/5 p-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-cyan mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('LYA Registry', 'Registre LYA')}
            </h3>
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t('Certified Projects', 'Projets Certifiés')}</span>
              </div>
              <span className="text-sm font-black text-primary-cyan tabular-nums">{realCertifiedCount}</span>
            </div>
            <p className="text-[9px] text-on-surface-variant/40 mt-3 leading-relaxed">
              {t('Live count of projects currently certified on LinkYourArt.', 'Compte en direct des projets actuellement certifiés sur LinkYourArt.')}
            </p>
          </div>

          {/* Trending Sectors */}
          <div className="bg-surface-low border border-white/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-gold mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-4 h-4" />
              {t('Sectors by Certified Projects', 'Secteurs par Projets Certifiés')}
            </h3>
            
            <div className="space-y-4 relative z-10">
              {sectors.slice(0, visibleSectors).map((sector, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group/item">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover/item:text-accent-gold transition-colors">{sector.label}</span>
                  <span className="text-[9px] font-mono font-black text-accent-gold">{sector.count} · {sector.avgScore}/1000</span>
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

          {/* Quick Stats — comptent réellement les articles/sources
              affichés, plus aucune formule inventée par-dessus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-low border border-white/5 p-4 text-center">
              <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase mb-1">{t('Total Articles', 'Total Articles')}</div>
              <div className="text-2xl font-black text-white">{news.length}</div>
            </div>
            <div className="bg-surface-low border border-white/5 p-4 text-center">
              <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase mb-1">{t('Sources', 'Sources')}</div>
              <div className="text-2xl font-black text-primary-cyan">
                {new Set(news.map(item => item.source)).size}
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
                    <p className="text-lg md:text-xl text-on-surface leading-relaxed font-medium text-justify">
                      {selectedNews.summary}
                    </p>
                    <div className="space-y-4 text-on-surface-variant leading-relaxed opacity-70 text-justify">
                      <p>
                        
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                      <h4 className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-4">{t('LYA PLATFORM RELEVANCE', 'PERTINENCE POUR LA PLATEFORME LYA')}</h4>
                      {selectedNews.relatedProjects ? (
                        <>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="text-3xl font-black text-primary-cyan">
                              {selectedNews.relatedProjects.count}
                            </div>
                            <div className="text-[10px] font-medium text-on-surface-variant leading-tight text-justify">
                              {t(
                                `Real certified LYA projects in ${selectedNews.relatedProjects.categories.join(', ')} — average LYA Score ${selectedNews.relatedProjects.avgLyaScore}/1000.`,
                                `Vrais projets certifiés LYA en ${selectedNews.relatedProjects.categories.join(', ')} — Score LYA moyen ${selectedNews.relatedProjects.avgLyaScore}/1000.`
                              )}
                            </div>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-cyan"
                              style={{ width: `${Math.min(100, (selectedNews.relatedProjects.avgLyaScore / 1000) * 100)}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] font-medium text-on-surface-variant/50 italic">
                          {t('No certified LYA project currently matches this article\'s sector.', 'Aucun projet certifié LYA ne correspond actuellement au secteur de cet article.')}
                        </p>
                      )}
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
