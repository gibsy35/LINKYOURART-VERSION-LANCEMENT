
import React from 'react';
import { motion } from 'motion/react';
import { Star, ArrowUpRight, ArrowDownLeft, Trash2, LayoutGrid, List, Zap, Shield, Activity, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { CONTRACTS, Contract , LYA_UNIT_VALUE} from '../types';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { NumberTicker } from '../components/ui/NumberTicker';
import { useCurrency } from '../context/CurrencyContext';

interface WatchlistViewProps {
  onNotify: (msg: string) => void;
  watchlist: string[];
  allContracts: Contract[];
  onToggleWatchlist: (e: React.MouseEvent, id: string) => void;
  onSelectContract: (contract: Contract) => void;
  isPro?: boolean;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ 
  onNotify, 
  watchlist, 
  allContracts,
  onToggleWatchlist,
  onSelectContract,
  isPro = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const watchlistedContracts = allContracts.filter(c => watchlist.includes(c.id));
  const MAX_WATCHLIST = isPro ? 100 : 15;

  const [viewMode, setViewMode] = React.useState<'mosaic' | 'bars'>('mosaic');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = viewMode === 'mosaic' ? 18 : 25;
  
  const totalPages = Math.ceil(watchlistedContracts.length / itemsPerPage);
  const paginatedContracts = watchlistedContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('My', 'Ma')}
        titleAccent={t('Watchlist', 'Veille')}
        description={t('MONITORING ACTIVE CREATIVE PROJECTS AND MARKET PERFORMANCE. Professional monitoring is active on all indexed registries.', 'SURVEILLANCE DES PROJETS CRÉATIFS ACTIFS ET DES PERFORMANCES DU MARCHÉ. La veille professionnelle est active sur tous les registres indexés.')}
        accentColor="text-accent-gold"
      />

      <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 mt-10">
        <div className="flex items-center gap-6 bg-surface-low/80 backdrop-blur-3xl border border-white/10 p-5 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold" />
          <div className="flex flex-col">
            <span className="text-xs text-accent-gold font-bold uppercase tracking-widest mb-1 opacity-80">{t('TOTAL_MONITORED', 'TOTAL_SURVEILLÉ')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-white tracking-tighter">
                {watchlistedContracts.length}
              </span>
              <span className="text-xs font-bold text-on-surface-variant opacity-30">/ {MAX_WATCHLIST} SLOTS</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
             <div>
               <span className="block text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-0.5">{t('SYNC_ACTIVE', 'SYNC_ACTIF')}</span>
               <span className="block text-[7px] font-mono text-on-surface-variant/40 uppercase tracking-widest leading-none">LYA-04</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5 shadow-xl backdrop-blur-md">
          <button 
            onClick={() => { setViewMode('mosaic'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${viewMode === 'mosaic' ? 'bg-accent-gold text-surface-dim shadow-lg' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('MOSAIC', 'MOSAÏQUE')}</span>
          </button>
          <button 
            onClick={() => { setViewMode('bars'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${viewMode === 'bars' ? 'bg-accent-gold text-surface-dim shadow-lg' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
          >
            <List size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('BARS', 'BARRES')}</span>
          </button>
        </div>
      </div>

      <div className="">
      {watchlistedContracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center bg-surface-low/20 backdrop-blur-2xl border border-white/10 rounded-sm shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-on-surface-variant/20 mb-8 border border-white/10 group-hover:border-accent-gold/30 transition-all duration-700">
            <Star size={44} className="group-hover:text-accent-gold transition-colors opacity-20 group-hover:opacity-100" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{t('WATCHLIST_EMPTY', 'LISTE_VIDE')}</h2>
          <p className="text-[10px] text-on-surface-variant max-w-xs uppercase tracking-[0.3em] font-bold opacity-40 leading-relaxed">
            {t('Live monitoring is currently unassigned. Mark creative assets to track market performance.', 'La surveillance neuronale est actuellement non assignée. Marquez des actifs pour suivre les performances des marchés.')}
          </p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'mosaic' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
            {paginatedContracts.map((contract, index) => (
              viewMode === 'mosaic' ? (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-surface-low/30 backdrop-blur-2xl border border-white/10 overflow-hidden hover:border-accent-gold/50 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col rounded-3xl relative"
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent z-20" />
                  
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={contract.image} 
                      alt={contract.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/20 to-transparent" />
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-3">
                      <div className="px-3 py-1 bg-accent-gold text-surface-dim text-xs font-black uppercase tracking-[0.2em] rounded-lg shadow-xl flex items-center gap-2">
                        <Shield size={10} />
                        {contract.rarity}
                      </div>
                      <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] rounded-lg">
                        {contract.category}
                      </div>
                    </div>

                    <button 
                      onClick={(e) => onToggleWatchlist(e, contract.id)}
                      className="absolute top-6 right-6 w-10 h-10 bg-accent-gold text-surface-dim rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[70%]">
                        <h3 className="text-base md:text-lg font-black font-headline text-white tracking-tighter group-hover:text-accent-gold transition-colors line-clamp-2 uppercase leading-tight">{contract.name}</h3>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-40 mt-2">{contract.issuerId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black font-mono text-white tracking-tighter">
                          {formatPrice(contract.unitValue || 0)}
                        </div>
                        <div className={`flex items-center justify-end gap-1 text-[10px] font-black font-mono mt-1 ${contract.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {contract.growth >= 0 ? <TrendingUp size={10} /> : <ArrowDownLeft size={10} />}
                          {contract.growth > 0 ? '+' : ''}{contract.growth}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-y border-white/5 mb-8">
                      <div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-[0.3em] font-black mb-2 opacity-40">{t('LYA_SCORE', 'SCORE LYA')}</div>
                        <div className="text-lg font-black font-mono text-primary-cyan flex items-baseline gap-1">
                          <NumberTicker value={contract.scoreLYA || 0} />
                          <span className="text-xs opacity-40 font-sans tracking-widest">/1000</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-[0.3em] font-black mb-2 opacity-40">{t('VALEUR', 'VALUE')}</div>
                        <div className="text-lg font-black font-mono text-white">
                           <NumberTicker value={85.2} decimalPlaces={1} />
                           <span className="text-xs opacity-40 ml-1">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                      <button 
                        onClick={() => onSelectContract(contract)}
                        className="flex-1 py-4 bg-white/5 hover:bg-white text-on-surface hover:text-surface-dim border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-3 group/btn"
                      >
                        {t('ACCESS_TERMINAL', 'ACCÉDER_TERMINAL')}
                        <Zap size={14} className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" />
                      </button>
                      <button 
                        onClick={(e) => onToggleWatchlist(e, contract.id)}
                        className="w-12 h-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 transition-all rounded-xl group/trash"
                      >
                        <Trash2 size={18} className="group-hover/trash:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex flex-col md:flex-row items-center gap-6 p-4 bg-surface-low/30 backdrop-blur-md border border-white/5 hover:border-accent-gold/40 transition-all rounded-sm"
                >
                  <div className="w-full md:w-24 h-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <img src={contract.image} alt={contract.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter truncate">{contract.name}</h4>
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest opacity-40">{contract.issuerId}</span>
                    </div>
                    <div className="flex gap-8 items-center shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-0.5 opacity-40">Score</div>
                        <div className="text-sm font-black text-primary-cyan font-mono">{contract.scoreLYA}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-0.5 opacity-40">Value</div>
                         <div className="text-sm font-black text-white font-mono">{formatPrice(contract.unitValue || 0)}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black font-mono ${contract.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {contract.growth > 0 ? '+' : ''}{contract.growth}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full md:w-auto">
                     <button 
                       onClick={() => onSelectContract(contract)}
                       className="flex-1 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-white hover:text-surface-dim transition-all border border-white/5 rounded-lg"
                     >
                       <Zap size={14} />
                     </button>
                     <button 
                       onClick={(e) => onToggleWatchlist(e, contract.id)}
                       className="flex-1 md:w-10 md:h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/10 text-red-500 transition-all rounded-lg"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                </motion.div>
              )
            ))}
            
            {/* Upgrade Incentive for standard users */}
            {!isPro && watchlistedContracts.length < 15 && viewMode === 'mosaic' && (
              <div className="border border-dashed border-white/10 rounded-sm p-8 flex flex-col items-center justify-center text-center opacity-30 hover:opacity-100 transition-opacity animate-pulse group cursor-pointer" onClick={() => onNotify(t('Accédez à l\'Exchange pour ajouter des projets', 'Go to Exchange to add projects'))}>
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Star size={24} className="text-white/40 group-hover:text-accent-gold transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('SURVEILLANCE_INDEX_FREE', 'SLOT_LIBRE')}</span>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12 pt-8 border-t border-white/5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center border transition-all ${
                  currentPage === 1 
                    ? 'border-white/5 text-on-surface-variant opacity-20 cursor-not-allowed' 
                    : 'border-white/10 text-on-surface hover:border-accent-gold hover:text-accent-gold'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 text-[10px] font-black transition-all border ${
                        currentPage === pageNum
                          ? 'bg-accent-gold border-accent-gold text-surface-dim'
                          : 'border-white/5 text-on-surface-variant hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center border transition-all ${
                  currentPage === totalPages
                    ? 'border-white/5 text-on-surface-variant opacity-20 cursor-not-allowed' 
                    : 'border-white/10 text-on-surface hover:border-accent-gold hover:text-accent-gold'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};
