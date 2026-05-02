
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Heart, X, Info, Star, Zap, Scale, Activity, Plus } from 'lucide-react';
import { CONTRACTS, Contract, LYA_UNIT_VALUE, UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { PageHeader } from '../components/ui/PageHeader';

interface SwipeViewProps {
  user: UserProfile | null;
  usageStats: { swipe: number; compare: number };
  onUsageUpdate: (stats: any) => void;
  onNotify: (msg: string) => void;
  watchlist: string[];
  allContracts: Contract[];
  onToggleWatchlist: (e: React.MouseEvent | { stopPropagation: () => void }, id: string, force?: 'add' | 'remove') => void;
  comparisonList: string[];
  onToggleComparison: (id: string) => void;
  onViewChange?: (view: any) => void;
  checkUsageLimit: (type: 'swipe' | 'compare') => boolean;
}

export const SwipeView: React.FC<SwipeViewProps> = ({ 
  user,
  usageStats,
  onUsageUpdate,
  onNotify, 
  watchlist, 
  allContracts,
  onToggleWatchlist,
  comparisonList,
  onToggleComparison,
  onViewChange,
  checkUsageLimit
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const swipeDirectionRef = React.useRef<'left' | 'right' | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const heartOpacity = useTransform(x, [50, 150], [0, 1]);
  const crossOpacity = useTransform(x, [-150, -50], [1, 0]);

  const [visibleExtended, setVisibleExtended] = useState(3);

  const activeContracts = React.useMemo(() => {
    // Shuffle the contracts for better diversity as requested
    return [...allContracts]
      .filter(c => c.status === 'LIVE')
      .sort(() => Math.random() - 0.5);
  }, [allContracts]);
  
  const currentContract = activeContracts[currentIndex % activeContracts.length];

  const handleSwipe = (dir: 'left' | 'right') => {
    if (direction) return; // Prevent multiple swipes
    
    // Only block if trying to Like (swipe RIGHT) and limit is reached
    if (dir === 'right') {
      const isAlreadyWatchlisted = watchlist.includes(currentContract.id);
      if (!isAlreadyWatchlisted && !checkUsageLimit('swipe')) {
        onNotify(t('SWIPE LIMIT REACHED (20/20). UPGRADE TO PRO TO UNLOCK INFINITE DISCOVERY.', 'LIMITE DE SWIPE ATTEINTE (20/20). PASSEZ AU PRO POUR UNE DÉCOUVERTE INFINIE.'));
        onViewChange?.('PRICING');
        return;
      }
    }
    
    setDirection(dir);
    swipeDirectionRef.current = dir;
    setSwipedIds(prev => [...prev, currentContract.id]);
    
    if (dir === 'right') {
      onToggleWatchlist({ stopPropagation: () => {} } as any, currentContract.id, 'add');
    } else {
      onNotify(t('CONTRACT DISMISSED', 'CONTRAT REJETÉ'));
    }

    // Wait for animation to finish before changing index
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      x.set(0);
    }, 200);
  };

  const handleCompareTrigger = () => {
    onViewChange?.('COMPARE');
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    } else {
      x.set(0);
    }
  };

  const isPro = user?.role === UserRole.ADMIN || user?.role === UserRole.PROFESSIONAL || user?.isPro;
  
  const currentSwipeLimitStr = isPro ? '∞' : '20';
  const currentCompareLimitStr = isPro ? '∞' : '20';

  const swipeCount = watchlist.length;
  const compareCount = comparisonList.length;

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Creative', 'SWIPE')}
        titleAccent={t('Swipe', 'CRÉATIF')}
        description={t('Swipe to discover and monitor the next generation of creative contracts. Build your professional watchlist in real-time.', 'Swiper pour découvrir et surveiller la prochaine génération de contrats créatifs. Construisez votre watchlist professionnelle en temps réel.')}
        accentColor="text-primary-cyan"
      />

      <div className="relative z-20 mb-12 px-6 md:px-12 flex flex-col lg:flex-row lg:items-end justify-end gap-6 md:gap-8">
        <div className="flex flex-wrap gap-2 md:gap-4 items-end">
          <div className="px-4 md:px-6 py-2 md:py-3 bg-primary-cyan/10 border border-primary-cyan/20 rounded-sm flex items-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(0,224,255,0.1)] transition-all relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1 h-full bg-primary-cyan animate-pulse" />
            <Zap size={16} className="text-primary-cyan animate-pulse" />
            <div>
              <div className="text-[8px] md:text-[10px] text-primary-cyan uppercase tracking-widest font-black mb-0.5 opacity-70 italic">{t('SWIPES HEART', 'SWIPES COEUR')}</div>
              <div className="text-lg md:text-xl font-black text-white italic font-mono tracking-tighter">{swipeCount} / {currentSwipeLimitStr}</div>
            </div>
          </div>
          
          <button 
            onClick={handleCompareTrigger}
            className="px-4 md:px-6 py-2 md:py-3 bg-accent-gold/10 border border-accent-gold/20 rounded-sm flex items-center gap-2 md:gap-3 hover:bg-accent-gold/20 transition-all group shadow-[0_0_20px_rgba(251,191,36,0.1)] relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-accent-gold group-hover:h-full transition-all" />
            <div className="text-left">
              <div className="text-[8px] md:text-[10px] text-accent-gold uppercase tracking-widest font-black mb-0.5 opacity-70 italic">{t('COMPARE PROJECTS', 'COMPARE INDEX')}</div>
              <div className="text-lg md:text-xl font-black text-white italic font-mono tracking-tighter">{compareCount} / {currentCompareLimitStr}</div>
            </div>
          </button>

          <div className="px-6 py-3 bg-surface-low border border-white/5 rounded-xl backdrop-blur-md hidden md:block">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-0.5 opacity-50">{t('Market Depth', 'Profondeur du Marché')}</div>
            <div className="text-xl font-black text-primary-cyan italic">1.2B LYA</div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Sidebar - Stats & Tips */}
        <div className="lg:col-span-3 space-y-8 hidden lg:block">
          <div className="p-6 bg-surface-low/50 border border-white/5 rounded-2xl backdrop-blur-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Zap size={14} className="text-primary-cyan" />
              {t('Discovery Stats', 'Stats Découverte')}
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
                  <span className="text-on-surface-variant">{t('Match Rate', 'Taux de Match')}</span>
                  <span className="text-primary-cyan">68%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-cyan w-[68%] shadow-[0_0_10px_rgba(0,224,255,0.3)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
                  <span className="text-on-surface-variant">{t('Portfolio Fit', 'Adéquation Portefeuille')}</span>
                  <span className="text-accent-gold">42%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-gold w-[42%] shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary-cyan/5 border border-primary-cyan/10 rounded-2xl">
            <h4 className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-3">{t('Expert Tip', 'Conseil Expert')}</h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
              {t('Contracts with a LYA Score above 850 represent the top 5% of creative assets in terms of professional validation and revenue potential.', 'Les contrats avec un score LYA supérieur à 850 représentent le top 5% des actifs créatifs en termes de validation professionnelle et de potentiel de revenus.')}
            </p>
          </div>
        </div>

        {/* Center - Swipe Card */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto touch-none will-change-transform">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentContract.id}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
                  rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.5,
                  x: swipeDirectionRef.current === 'left' ? -500 : swipeDirectionRef.current === 'right' ? 500 : 0,
                  transition: { duration: 0.2 }
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="absolute inset-0 bg-surface-high border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-grab active:cursor-grabbing will-change-transform"
              >
                {/* Animated Overlays */}
                <motion.div 
                  style={{ opacity: heartOpacity }}
                  className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-emerald-500/20"
                >
                  <div className="bg-white p-6 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                    <Heart size={80} className="text-emerald-500" fill="currentColor" />
                  </div>
                </motion.div>

                <motion.div 
                  style={{ opacity: crossOpacity }}
                  className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-red-500/5"
                >
                  <div className="bg-white/90 p-6 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                    <X size={80} className="text-red-400" />
                  </div>
                </motion.div>

                {/* Image Section */}
                <div className="relative h-[62%] pointer-events-none">
                  <img 
                    src={currentContract.image} 
                    alt={currentContract.name}
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="px-3 py-1 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {currentContract.rarity}
                    </div>
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {currentContract.category}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(e, currentContract.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all relative group ${
                        watchlist.includes(currentContract.id) 
                          ? 'bg-accent-gold border-accent-gold text-surface-dim shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                          : 'bg-black/20 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <Star size={18} fill={watchlist.includes(currentContract.id) ? "currentColor" : "none"} />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComparison(currentContract.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all relative group ${
                        comparisonList.includes(currentContract.id) 
                          ? 'bg-primary-cyan border-primary-cyan text-surface-dim shadow-[0_0_15px_rgba(0,224,255,0.4)]' 
                          : 'bg-black/20 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <Scale size={18} />
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 flex-1 flex flex-col justify-between pointer-events-none">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <h2 className="text-xl font-black font-headline text-white tracking-tight">{currentContract.name}</h2>
                      </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="text-[7px] text-accent-pink font-bold uppercase tracking-widest leading-none mb-1">ALGO</div>
                        <div className="text-xs font-black text-white leading-none">{currentContract.scoreAlgo || 0}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest leading-none mb-1">PRO</div>
                        <div className="text-xs font-black text-white leading-none">{currentContract.scorePro || 0}</div>
                      </div>
                      <div className="flex flex-col items-end border-l border-white/10 pl-3 ml-1">
                        <div className="text-[8px] text-primary-cyan font-bold uppercase tracking-widest leading-none mb-1">{t('Score LYA', 'Score LYA')}</div>
                        <div className="text-lg font-black text-white leading-none">
                          {Math.round(((currentContract.scoreAlgo || 0) + (currentContract.scorePro || 0)) / 2)}
                        </div>
                      </div>
                    </div>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2 opacity-80 italic font-serif">
                      {currentContract.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex-1">
                      <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 opacity-50">{t('Artist', 'Artiste')}</div>
                      <div className="text-xs font-bold text-white">{currentContract.issuerId}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 opacity-50">{t('Revenue Share', 'Part de Revenus')}</div>
                      <div className="text-xs font-bold text-accent-gold">{currentContract.revenueSharePercentage}%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-8 mt-12">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full bg-surface-high border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-90 shadow-xl"
            >
              <X size={32} />
            </button>
            
            <button 
              onClick={() => onViewChange?.('COMPARE')}
              className="w-12 h-12 rounded-full bg-surface-high border border-white/10 flex items-center justify-center text-primary-cyan hover:bg-primary-cyan/10 hover:border-primary-cyan/50 transition-all active:scale-90 shadow-lg"
              title={t('Compare Projects', 'Comparer les Projets')}
            >
              <Scale size={24} />
            </button>

            <button 
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-surface-high border border-white/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all active:scale-90 shadow-xl"
            >
              <Heart size={32} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Trending */}
        <div className="lg:col-span-3 space-y-8 hidden lg:block">
          <div className="p-6 bg-surface-low/50 border border-white/5 rounded-2xl backdrop-blur-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Star size={14} className="text-accent-gold" />
              {t('Trending Now', 'Tendances')}
            </h3>
            <div className="space-y-4">
              {activeContracts
                .filter(c => !swipedIds.includes(c.id))
                .slice(0, 3)
                .map((contract, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={contract.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-white truncate group-hover:text-primary-cyan transition-colors">{contract.name}</div>
                    <div className="text-[8px] text-on-surface-variant uppercase tracking-widest">{contract.issuerId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-surface-low/50 border border-white/5 rounded-2xl backdrop-blur-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">{t('Market Sentiment', 'Sentiment du Marché')}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%]" />
              </div>
              <span className="text-[10px] font-black text-emerald-500">75%</span>
            </div>
            <div className="text-[8px] text-on-surface-variant uppercase tracking-widest text-center">{t('Strong Bullish Signal', 'Signal Haussier Fort')}</div>
          </div>

          {/* New: Live Activity Feed */}
          <div className="p-6 bg-surface-low/30 border border-white/5 rounded-2xl backdrop-blur-xl">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Activity size={12} className="text-primary-cyan" />
              {t('Live Activity', 'Activité en Direct')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                <span className="text-[9px] font-mono text-white uppercase tracking-tight">0x4f...2a {t('matched with', 'a matché')} "Neo-Tokyo"</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <div className="w-1 h-1 bg-primary-cyan rounded-full" />
                <span className="text-[9px] font-mono text-white uppercase tracking-tight">0x12...9b {t('added', 'a ajouté')} "CyberPunk"</span>
              </div>
              <div className="flex items-center gap-2 opacity-20">
                <div className="w-1 h-1 bg-accent-gold rounded-full" />
                <span className="text-[9px] font-mono text-white uppercase tracking-tight">0x8e...3c {t('analyzing', 'analyse')} "Solaris"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Extended Discovery Section */}
      <section className="pt-12 border-t border-white/5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Plus className="text-primary-cyan" size={20} />
              {t('Extended Discovery Opportunity', 'Opportunité de Découverte Étendue')}
            </h3>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black opacity-50 mt-1">
              {t('AI-CURATED SUGGESTIONS BASED ON YOUR SWIPE PATTERNS', 'SUGGESTIONS IA BASÉES SUR VOS PATTERNS DE SWIPE')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeContracts.slice(0, visibleExtended).map((contract) => (
            <motion.div 
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-6 rounded-3xl group relative overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-video rounded-2xl overflow-hidden mb-6 relative">
                <img src={contract.image} alt={contract.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-[10px] text-primary-cyan font-black uppercase tracking-widest mb-1">{contract.rarity}</div>
                  <div className="text-lg font-black text-white uppercase italic tracking-tight">{contract.name}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <p className="text-xs text-on-surface-variant line-clamp-2 opacity-70 italic font-serif leading-relaxed">
                  {contract.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-left">
                    <p className="text-[9px] text-primary-cyan font-bold uppercase tracking-widest opacity-60">SCORE LYA</p>
                    <p className="text-sm font-black text-white italic">
                      {contract.scoreLYA || ((contract.scoreAlgo || 0) + (contract.scorePro || 0)) || contract.totalScore}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">{t('Yield', 'Rendement')}</p>
                    <p className="text-sm font-black text-emerald-400 italic">+{contract.revenueSharePercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => onToggleWatchlist({ stopPropagation: () => {} } as any, contract.id)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    watchlist.includes(contract.id)
                      ? 'bg-accent-gold text-surface-dim shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Star size={12} fill={watchlist.includes(contract.id) ? "currentColor" : "none"} />
                    <span>{watchlist.includes(contract.id) ? t('WATCHLISTED', 'DANS LA LISTE') : t('WATCHLIST', 'WATCHLIST')}</span>
                  </div>
                </button>
                <button 
                  onClick={() => onToggleComparison(contract.id)}
                  className={`p-3 rounded-xl transition-all ${
                    comparisonList.includes(contract.id)
                      ? 'bg-primary-cyan text-surface-dim shadow-[0_0_20px_rgba(0,224,255,0.3)]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Scale size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {visibleExtended < activeContracts.length && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => setVisibleExtended(prev => prev + 3)}
              className="px-10 py-4 bg-surface-low border border-white/10 rounded-full text-[11px] font-black underline-offset-4 hover:underline uppercase tracking-[0.3em] text-white hover:border-primary-cyan transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-ping" />
                <span>{t('LOAD MORE OPPORTUNITIES', 'CHARGER PLUS D\'OPPORTUNITÉS')}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-ping" />
              </div>
            </button>
          </div>
        )}
      </section>

      {/* Decorative Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
        <div className="p-8 bg-surface-low/20 border border-white/5 rounded-2xl flex flex-col items-center text-center group hover:bg-primary-cyan/5 transition-all">
          <div className="w-12 h-12 rounded-full bg-primary-cyan/10 flex items-center justify-center text-primary-cyan mb-4 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{t('Real-time Matching', 'Matching Temps Réel')}</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-60 uppercase tracking-wider">
            {t('Our discovery engine analyzes 10,000+ data points per second to find your perfect creative asset match.', 'Notre moteur de découverte analyse plus de 10 000 points de données par seconde pour trouver votre actif créatif idéal.')}
          </p>
        </div>
        <div className="p-8 bg-surface-low/20 border border-white/5 rounded-2xl flex flex-col items-center text-center group hover:bg-accent-gold/5 transition-all">
          <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold mb-4 group-hover:scale-110 transition-transform">
            <Star size={24} />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{t('Professional Selection', 'Qualité Professionnelle')}</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-60 uppercase tracking-wider">
            {t('Every contract in the discovery engine has passed our rigorous 4-stage professional validation process.', 'Chaque contrat dans le moteur de découverte a passé notre processus rigoureux de validation professionnelle en 4 étapes.')}
          </p>
        </div>
        <div className="p-8 bg-surface-low/20 border border-white/5 rounded-2xl flex flex-col items-center text-center group hover:bg-emerald-500/5 transition-all">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
            <Heart size={24} />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{t('Smart Watchlist', 'Watchlist Intelligente')}</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-60 uppercase tracking-wider">
            {t('Build and monitor your portfolio with advanced analytics and real-time performance tracking.', 'Construisez et surveillez votre portefeuille avec des analyses avancées et un suivi des performances en temps réel.')}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};
