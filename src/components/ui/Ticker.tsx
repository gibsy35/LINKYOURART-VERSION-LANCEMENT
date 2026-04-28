
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CONTRACTS } from '../../types';

export const Ticker: React.FC = () => {
  const items = [...CONTRACTS, ...CONTRACTS]; // Double for infinite loop

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-surface-dim border-t border-white/5 z-[80] overflow-hidden flex items-center font-mono">
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-primary-cyan text-surface-dim flex items-center gap-2 z-10 border-r border-white/10">
        <span className="text-[9px] font-black uppercase tracking-tighter">LIVE_FEED</span>
        <div className="w-1.5 h-1.5 rounded-full bg-surface-dim animate-pulse" />
      </div>

      <motion.div 
        className="flex items-center gap-12 pl-32 whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => {
          const isUp = Math.random() > 0.4;
          const change = (Math.random() * 5).toFixed(2);
          return (
            <div key={`${item.id}-${i}`} className="flex items-center gap-4 group cursor-pointer" onClick={() => {
              window.dispatchEvent(new CustomEvent('ticker-contract-select', { detail: item }));
            }}>
              <span className="text-[10px] font-black text-white hover:text-primary-cyan transition-colors uppercase tracking-tight">{item.name}</span>
              <div className="flex items-center gap-1">
                {isUp ? <TrendingUp size={10} className="text-primary-cyan" /> : <TrendingDown size={10} className="text-red-500" />}
                <span className={`text-[10px] font-bold ${isUp ? 'text-primary-cyan' : 'text-red-500'}`}>
                   {isUp ? '+' : '-'}{change}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/40">${item.unitValue.toLocaleString()}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
