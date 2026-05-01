
import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ExternalLink,
  Award,
  Activity,
  ChevronRight,
  Plus,
  Search,
  Coins
} from 'lucide-react';
import { Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  onSelect?: (contract: Contract) => void;
  compact?: boolean;
  onTrade?: (contract: Contract, type: 'BUY' | 'SELL') => void;
  onToggleWatchlist?: (e: React.MouseEvent, contractId: string) => void;
  isWatchlisted?: boolean;
  comparisonList?: string[];
  onToggleComparison?: (contractId: string) => void;
  usageStats?: any;
  user?: any;
  onViewIssuer?: (id: string) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({ 
  contract, 
  onClick, 
  onSelect, 
  compact = false,
  onTrade,
  onToggleWatchlist,
  isWatchlisted,
  comparisonList,
  onToggleComparison,
  onViewIssuer
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const inComparison = comparisonList?.includes(contract.id);

  // Calculate individual and final scores with robust fallbacks
  const scoreAlgoValue = contract.scoreAlgo || (contract.scoreLYA ? Math.round(contract.scoreLYA * (0.95 + Math.random() * 0.1)) : 750);
  const scoreProValue = contract.scorePro || (contract.scoreLYA ? Math.round(contract.scoreLYA * (0.95 + Math.random() * 0.1)) : 750);
  const scoreFinalValue = contract.scoreLYA || Math.round((scoreAlgoValue + scoreProValue) / 2);

  const categoryColors: Record<string, string> = {
    'Fine Art': 'text-accent-gold bg-accent-gold/10 border-accent-gold/20',
    'Film': 'text-primary-cyan bg-primary-cyan/10 border-primary-cyan/20',
    'TV Series': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'Music': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    'Digital Art': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'Gaming': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Literature': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'Fashion': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'Architecture': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    'Design': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'Photography': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Podcast': 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    'Performing Arts': 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
    'Gastronomy': 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  };

  const categoryStyle = categoryColors[contract.category] || 'text-white bg-white/10 border-white/5';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => {
        if (onClick) onClick();
        else if (onSelect) onSelect(contract);
      }}
      className={`group cursor-pointer relative bg-surface-low border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary-cyan/40 hover:shadow-[0_20px_50px_rgba(0,224,255,0.1)] rounded-[2rem] ${compact ? 'p-4' : 'h-full flex flex-col'}`}
    >
      {/* Visual Header */}
      <div className={`relative overflow-hidden ${compact ? 'hidden' : 'aspect-video rounded-t-[2rem]'}`}>
        <img 
          src={contract.image} 
          alt={contract.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-low via-surface-low/10 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-cyan text-surface-dim text-[8px] font-black uppercase tracking-widest rounded-sm shadow-xl flex items-center gap-1.5 border border-white/10 group-hover:scale-110 transition-transform">
            <Coins size={10} />
            LYA UNIT $50
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-dim/95 backdrop-blur-xl border border-white/20 text-[9px] font-black uppercase tracking-widest text-white shadow-2xl">
            <span className="w-1.5 h-1.5 bg-primary-cyan rounded-full animate-pulse" />
            {contract.status}
          </div>
          <div className={`px-3 py-1 border text-[7px] font-black uppercase tracking-[0.2em] shadow-xl ${categoryStyle}`}>
            {contract.category}
          </div>
        </div>

        {/* Comparison/Selection Marker */}
        <div className="absolute top-4 right-4 group-hover:block hidden">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(contract);
            }}
            className="p-2 bg-primary-cyan text-surface-dim hover:bg-white transition-all shadow-[0_0_15px_rgba(0,224,255,0.4)]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${compact ? '' : 'p-3.5 flex flex-col justify-between'}`}>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-2">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-primary-cyan bg-primary-cyan/5 px-1.5 py-0.5 border border-primary-cyan/10">
                {contract.registryIndex}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/40">{contract.contractType}</span>
            </div>
          </div>
          
          <h3 className="text-sm font-black font-headline tracking-tighter uppercase text-white group-hover:text-primary-cyan transition-colors mb-1 leading-tight italic">
            {contract.name}
          </h3>

          {/* Scores - Always Visible */}
          <div className="flex gap-1.5 mb-2.5">
            <div className="flex-1 flex flex-col items-center justify-center py-1 bg-surface-dim/40 border border-white/5 rounded-lg border-b-2 border-b-white/10">
              <div className="text-[6px] font-black uppercase tracking-widest text-on-surface-variant/60 leading-none mb-0.5">ALGO</div>
              <div className="text-[10px] font-black font-headline tracking-tighter text-white italic">
                {scoreAlgoValue}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-1 bg-surface-dim/40 border border-white/5 rounded-lg border-b-2 border-b-white/10">
              <div className="text-[6px] font-black uppercase tracking-widest text-on-surface-variant/60 leading-none mb-0.5">PRO</div>
              <div className="text-[10px] font-black font-headline tracking-tighter text-white italic">
                {scoreProValue}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-lg relative overflow-hidden group/score border-b-2 border-b-primary-cyan/30">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover/score:opacity-100 transition-opacity" />
              <div className="text-[6px] font-black uppercase tracking-widest text-primary-cyan leading-none mb-0.5">FINAL</div>
              <div className="text-[10px] font-black font-headline tracking-tighter text-primary-cyan italic">
                {scoreFinalValue}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldCheck size={10} className="text-emerald-400" />
            <span className="text-[7px] font-bold text-on-surface-variant uppercase tracking-widest leading-none opacity-60">{contract.jurisdiction} Framework</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2 mb-1 border-b border-white/5">
            <div>
              <div className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest font-black mb-1">{t('UNIT_VALUE', 'VALEUR_UNITÉ')}</div>
              <div className="text-sm font-black text-white font-headline tracking-tight">{formatPrice(contract.unitValue)}</div>
              <div className="text-[7px] text-accent-gold font-black tracking-widest mt-1 uppercase italic">LYA UNITS ARE INDEXED</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest font-black mb-1 font-headline">{t('YIELD_EST.', 'RENDEMENT_EST.')}</div>
              <div className="text-sm font-black text-emerald-400 font-headline tracking-tight">+{contract.growth}%</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[7px] font-black text-primary-cyan uppercase tracking-[0.2em]">{t('COMMUNITY_HOLDERS', 'DÉTENTEURS COMMUNAUTAIRES')}</span>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-surface-low bg-white/10 flex items-center justify-center text-[8px] font-black overflow-hidden relative grayscale group-hover:grayscale-0 transition-all shadow-lg">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contract.id}${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-surface-low bg-surface-high flex items-center justify-center text-[7px] font-black text-white relative z-10 shadow-lg">
                    +84
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(contract);
            }}
            className="flex items-center gap-2 group/btn bg-white/5 hover:bg-primary-cyan px-3 py-2 border border-white/10 hover:border-primary-cyan transition-all"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover/btn:text-surface-dim transition-all">{t('ANALYZE', 'ANALYSER PROJECT')}</span>
            <Search size={12} className="text-on-surface-variant/40 group-hover/btn:text-surface-dim transition-all" />
          </button>
        </div>
      </div>

      {/* Decorative Accents */}
      <div className="absolute top-0 left-0 w-[1px] h-0 bg-primary-cyan group-hover:h-full transition-all duration-700" />
      <div className="absolute bottom-0 right-0 w-0 h-[1px] bg-primary-cyan group-hover:w-full transition-all duration-700 delay-100" />
    </motion.div>
  );
};
