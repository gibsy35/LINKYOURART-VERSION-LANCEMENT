
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import { useCurrency as useCurrencyContext } from '../../context/CurrencyContext';

export const Ticker: React.FC = () => {
  const { contracts } = useMarketData();
  const { formatPrice } = useCurrencyContext();
  const items = [...contracts, ...contracts]; // Double for infinite loop

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-surface-dim border-t border-white/5 z-[80] overflow-hidden flex items-center font-mono">
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-primary-cyan text-surface-dim flex items-center gap-2 z-10 border-r border-white/10">
        <span className="text-[9px] font-black uppercase tracking-tighter">LIVE_FEED</span>
        <div className="w-1.5 h-1.5 rounded-full bg-surface-dim animate-pulse" />
      </div>

      <motion.div 
        className="flex items-center gap-12 pl-32 whitespace-nowrap"
        animate={{ x: [0, -4000] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => {
          const isUp = item.growth >= 0;

          return (
            <div key={`${item.id}-${i}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => {
              window.dispatchEvent(new CustomEvent('ticker-contract-select', { detail: item }));
            }}>
              <span className="text-[10px] font-black text-white hover:text-primary-cyan transition-colors uppercase tracking-tight">{item.name}</span>
              <div className="flex items-center gap-1">
                {isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-400" />}
                <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {isUp ? '+' : ''}{item.growth}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/40">{formatPrice(item.unitValue)}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
