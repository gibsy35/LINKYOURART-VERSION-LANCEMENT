
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Shield, Cpu, Zap, Activity, Globe } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const OracleWidget: React.FC<{ onAction?: () => void }> = ({ onAction }) => {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState(128);
  const [latency, setLatency] = useState(14.2);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const change = (Math.random() - 0.5) * 2;
        return parseFloat(Math.max(8.0, Math.min(25.0, prev + change)).toFixed(1));
      });
      
      if (Math.random() > 0.8) {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1000);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface-high/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-primary-cyan/30 transition-all duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-cyan/10 transition-all" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan rounded-lg">
            <Network size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">{t('ORACLE_PROTOCOL', 'PROTOCOLE_ORACLE')}</h4>
            <div className="text-xs font-black text-white uppercase italic tracking-widest">{t('LYA_IMMUTABLE_SYNC', 'SYNC_IMMUABLE_LYA')}</div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-sm border ${isSyncing ? 'border-primary-cyan bg-primary-cyan/10 text-primary-cyan' : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'} text-[8px] font-black uppercase tracking-widest transition-all`}>
          {isSyncing ? t('SYNCING', 'SYNCHRONISATION') : t('STABLE', 'STABLE')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-dim/80 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={10} className="text-on-surface-variant/40" />
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/60">{t('ACTIVE_HUBS', 'HUBS_ACTIFS')}</span>
          </div>
          <div className="text-lg font-black font-headline text-white italic">{nodes}</div>
        </div>
        <div className="bg-surface-dim/80 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={10} className="text-on-surface-variant/40" />
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/60">{t('LATENCY_MS', 'LATENCE_MS')}</span>
          </div>
          <div className="text-lg font-black font-headline text-primary-cyan italic">{latency}ms</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={10} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface">{t('CONSENSUS_REACHED', 'CONSENSUS_ATTEINT')}</span>
          </div>
          <span className="text-[9px] font-black text-emerald-400">99.99%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '99.99%' }}
            transition={{ duration: 2 }}
            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-on-surface-variant/40" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 italic">PROTOCOL VERSION v4.2.1-GOLD</span>
        </div>
        {onAction ? (
          <button 
            onClick={onAction}
            className="flex items-center gap-2 text-[9px] font-black text-primary-cyan uppercase tracking-widest hover:text-white transition-colors"
          >
            {t('ACCESS_CORE', 'ACCÉDER_AU_CŒUR')}
            <Zap size={12} className="text-accent-gold" />
          </button>
        ) : (
          <Zap size={12} className="text-accent-gold" />
        )}
      </div>
    </div>
  );
};
