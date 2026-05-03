
import React from 'react';
import { motion } from 'motion/react';
import { InfoTooltip } from './InfoTooltip';
import { useCurrency } from '../context/CurrencyContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendDown?: boolean;
  color?: 'cyan' | 'gold' | 'pink' | 'white' | 'emerald' | 'purple' | 'blue';
  subValue?: string;
  tooltip?: string;
  isCurrency?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDown = false,
  color = 'white',
  subValue,
  tooltip,
  isCurrency = true
}) => {
  const { formatPrice } = useCurrency();

  const colorClasses = {
    cyan: 'border-primary-cyan text-primary-cyan',
    gold: 'border-accent-gold text-accent-gold',
    pink: 'border-accent-pink text-accent-pink',
    white: 'border-white/10 text-white',
    emerald: 'border-emerald-500/20 text-emerald-400',
    purple: 'border-purple-500/20 text-purple-400',
    blue: 'border-blue-500/20 text-blue-400'
  };

  return (
    <div className="bg-surface-low/30 backdrop-blur-xl border border-white/5 rounded-sm p-6 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] flex items-center group-hover:text-white transition-colors">
          {title}
          {tooltip && <InfoTooltip title={title} content={tooltip} />}
        </div>
        <div className={`p-2 bg-white/5 border border-white/5 group-hover:border-primary-cyan/30 transition-all ${color === 'cyan' ? 'text-primary-cyan' : ''}`}>
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <h3 className="text-2xl font-black font-mono text-white tracking-tighter truncate">
            {isCurrency && typeof value === 'number' ? formatPrice(value) : value}
          </h3>
          <span className={`text-[10px] font-black font-mono ${trendDown ? 'text-red-500' : 'text-emerald-400'}`}>
            {trend}
          </span>
        </div>
        {subValue && (
          <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            {subValue}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/2 overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color === 'cyan' ? 'bg-primary-cyan' : 'bg-white/20'}`}
        />
      </div>
    </div>
  );
};
