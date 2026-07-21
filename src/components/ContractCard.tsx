
import React from 'react';
import { motion } from 'motion/react';
import { simulatePDFDownload } from '../utils/download';
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
  Search
} from 'lucide-react';
import { Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { getSafeImageUrl } from '../utils/image';

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  onSelect?: (contract: Contract) => void;
  compact?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent, contractId: string) => void;
  isWatchlisted?: boolean;
  comparisonList?: string[];
  onToggleComparison?: (contractId: string) => void;
  usageStats?: any;
  user?: any;
  onViewIssuer?: (id: string) => void;
}

export const ContractCard = React.memo<ContractCardProps>(({ 
  contract, 
  onClick, 
  onSelect, 
  compact = false,
  onToggleWatchlist,
  isWatchlisted,
  comparisonList,
  onToggleComparison,
  onViewIssuer
}) => {
  const { t } = useTranslation();
  const inComparison = comparisonList?.includes(contract.id);

  // Calculate individual and final scores with strict algorithmic formula matching
  const scoreAlgoValue = contract.scoreAlgo || 750;
  const scoreProValue = contract.scorePro || 750;
  const scoreFinalValue = Math.min(1000, Math.round(0.70 * scoreProValue + 0.30 * scoreAlgoValue));

  const categoryColors: Record<string, string> = {
    'Fine Art': 'text-accent-pink bg-accent-pink/10 border-accent-pink/20',
    'Architecture': 'text-primary-cyan bg-primary-cyan/10 border-primary-cyan/20',
    'Podcast': 'text-accent-gold bg-accent-gold/10 border-accent-gold/20',
    'Digital Art': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'Film': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    'TV Series': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'Music': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Literature': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'Fashion': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'Design': 'text-orange-400 bg-orange-400/20 border-orange-400/40',
    'Photography': 'text-blue-400 bg-blue-400/20 border-blue-400/40',
    'Performing Arts': 'text-fuchsia-400 bg-fuchsia-400/20 border-fuchsia-400/40',
    'Gastronomy': 'text-lime-400 bg-lime-400/20 border-lime-400/40',
  };

  const categoryStyle = categoryColors[contract.category] || 'text-white bg-white/10 border-white/5';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => {
        if (onClick) onClick();
        else if (onSelect) onSelect(contract);
      }}
      className={`group cursor-pointer relative bg-[#0D0D0D] border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary-cyan/50 hover:shadow-[0_40px_100px_rgba(0,224,255,0.2)] rounded-[2.5rem] ${compact ? 'p-4' : 'h-full flex flex-col'}`}
    >
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-cyan/10 rounded-full blur-[100px] group-hover:bg-primary-cyan/20 transition-all duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-gold/5 rounded-full blur-[100px] group-hover:bg-accent-gold/10 transition-all duration-1000" />

      {/* Visual Header */}
      <div className={`relative overflow-hidden ${compact ? 'hidden' : 'aspect-[4/5] rounded-t-[2.5rem]'}`}>
        <img 
          src={getSafeImageUrl(contract.image, contract.category)} 
          alt={contract.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-100" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-80" />
        
        {/* Badges Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div className="px-5 py-2.5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${contract.status === 'RISK' ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_#F43F5E]' : 'bg-emerald-500 shadow-[0_0_10px_#10B981]'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">{contract.status}</span>
             </div>
             
             <button 
                onClick={(e) => {
                   e.stopPropagation();
                   onToggleWatchlist?.(e, contract.id);
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-2xl transition-all shadow-2xl border ${isWatchlisted ? 'bg-primary-cyan text-surface-dim border-primary-cyan' : 'bg-black/20 border-white/10 text-white hover:bg-white hover:text-black'}`}
             >
                <Plus size={20} className={isWatchlisted ? 'rotate-45' : ''} />
             </button>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] rounded-md">{contract.registryIndex}</span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] border rounded-md ${categoryStyle}`}>{contract.category}</span>
             </div>
             <h3 className="text-3xl font-black font-headline tracking-tighter uppercase text-white leading-[0.85] group-hover:text-primary-cyan transition-colors">
                {contract.name}
             </h3>
          </div>
        </div>
      </div>

      {/* Stats Table Section */}
      <div className="p-8 flex-1 flex flex-col gap-8">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-4 bg-accent-pink/10 border border-accent-pink/20 rounded-2xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
               <span className="text-[10px] font-black text-accent-pink uppercase tracking-widest mb-1.5 leading-none">ALGO</span>
               <span className="text-xl font-black font-headline text-white leading-none">{scoreAlgoValue}</span>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 leading-none">EXPERT</span>
               <span className="text-xl font-black font-headline text-white leading-none">{scoreProValue}</span>
            </div>
            <div className="p-4 bg-primary-cyan/20 border border-primary-cyan/30 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,224,255,0.2)] group-hover:scale-110 transition-transform">
               <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-1.5 leading-none">LYA</span>
               <span className="text-xl font-black font-headline text-white leading-none">{scoreFinalValue}</span>
            </div>
         </div>

         <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
               <div>
                  <div className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-1">{t('PATRONS', 'MÉCÈNES')}</div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-2xl font-black font-headline text-primary-cyan flex items-baseline gap-2">
                      {Math.floor(50 + scoreFinalValue / 3)}
                    </div>
                    <span className="text-xs font-mono text-white/30">{t('Certified','Certifié')}</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-1">{t('PROGRESS', 'PROGRESSION')}</div>
                  <div className={`flex items-center justify-end gap-1.5 text-xl font-black font-headline ${contract.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {contract.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                     {contract.growth >= 0 ? '+' : ''}{contract.growth}%
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0D0D] bg-white/5 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contract.id}${i}`} alt="user" className="w-full h-full object-cover" />
                     </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#0D0D0D] bg-white/10 flex items-center justify-center text-[10px] font-black text-white relative z-10 backdrop-blur-xl">
                     +142
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{'PUBLIC'}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary-cyan hover:border-primary-cyan transition-all">
                     <Plus size={16} onClick={(e) => { e.stopPropagation(); onSelect?.(contract); }} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
});
