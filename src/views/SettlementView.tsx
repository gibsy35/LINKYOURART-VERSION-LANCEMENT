
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Activity,
  Terminal,
  Database,
  ArrowRight,
  Lock
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface SettlementBatch {
  id: string;
  timestamp: string;
  transactions: number;
  value: number;
  status: 'PROCESSING' | 'FINALIZED' | 'BATCHING';
}

export const SettlementView: React.FC<{ 
  user: UserProfile | null;
  onNotify: (msg: string) => void;
}> = ({ user, onNotify }) => {
  const { t } = useTranslation();

  // Access Control: Only Admin or Pro users can access the Settlement Center
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        >
          <Lock size={48} className="text-red-500" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase italic text-on-surface mb-6 tracking-tighter">
          {t('Access Restricted', 'Accès Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('The Settlement Center is reserved for Professional Associates and Certified Professionals. This section handles high-frequency batching and on-chain finality.', 'Le centre de règlement est réservé aux associés professionnels et aux professionnels certifiés. Cette section gère le traitement par lots à haute fréquence et la finalité sur la chaîne.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onNotify(t('Redirecting to membership plans...', 'Redirection vers les plans d\'adhésion...'))}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)]"
          >
            {t('Upgrade to Pro', 'Passer à Pro')}
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-white/5 border border-white/10 text-on-surface font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            {t('Contact Support', 'Contacter le Support')}
          </button>
        </div>
      </div>
    );
  }

  const [batches, setBatches] = useState<SettlementBatch[]>([]);

  useEffect(() => {
    setBatches([
      { id: 'BATCH-482', timestamp: '14:22:01', transactions: 128, value: 420500, status: 'FINALIZED' },
      { id: 'BATCH-483', timestamp: '14:24:15', transactions: 84, value: 125000, status: 'FINALIZED' },
      { id: 'BATCH-484', timestamp: '14:26:30', transactions: 215, value: 890200, status: 'PROCESSING' },
      { id: 'BATCH-485', timestamp: '14:28:45', transactions: 42, value: 54000, status: 'BATCHING' }
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBatches(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const processingIdx = next.findIndex(b => b.status === 'PROCESSING');
        const batchingIdx = next.findIndex(b => b.status === 'BATCHING');

        if (processingIdx !== -1) {
          next[processingIdx] = { ...next[processingIdx], status: 'FINALIZED' };
        }
        if (batchingIdx !== -1) {
          next[batchingIdx] = { ...next[batchingIdx], status: 'PROCESSING' };
          next.push({
            id: `BATCH-${parseInt(next[next.length - 1].id.split('-')[1]) + 1}`,
            timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            transactions: Math.floor(Math.random() * 200) + 10,
            value: Math.floor(Math.random() * 1000000) + 10000,
            status: 'BATCHING'
          });
        }
        return next.slice(-6);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-32">
      <PageHeader 
        titleWhite={t('Professional', 'PROFESSIONAL')}
        titleAccent={t('Settlement', 'SETTLEMENT')}
        description={t('REAL-TIME SETTLEMENT BATCHING AND ON-CHAIN FINALITY. OPTIMIZED FOR PROFESSIONAL CONTRACT LIQUIDITY.', 'TRAITEMENT PAR LOTS EN TEMPS RÉEL ET FINALITÉ SUR LA CHAÎNE. OPTIMISÉ POUR LA LIQUIDITÉ DES CONTRATS PROFESSIONNELS.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20 px-6 md:px-12">
        <div className="flex gap-4">
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px] rounded-xl shadow-2xl">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-black opacity-80">DAILY VOLUME</div>
            <div className="text-2xl font-black text-primary-cyan">$1.24M</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 md:px-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Engine Status */}
          <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20">
                    <Cpu size={32} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-3xl font-black font-headline uppercase tracking-tighter">Engine Core V3.1</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] md:text-sm font-mono text-emerald-400 uppercase tracking-widest">Status: Operational</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div>
                    <div className="text-[10px] md:text-sm text-on-surface-variant uppercase tracking-widest mb-1">TPS (Peak)</div>
                    <div className="text-lg md:text-2xl font-black text-on-surface font-headline">12,480</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-sm text-on-surface-variant uppercase tracking-widest mb-1">Avg Finality</div>
                    <div className="text-lg md:text-2xl font-black text-primary-cyan font-headline">0.8s</div>
                  </div>
                </div>
            </div>
          </div>

          {/* Batch Queue */}
          <div className="bg-surface-low border border-white/5 overflow-hidden">
            <div className="bg-surface-highest px-6 py-4 flex justify-between items-center">
              <h2 className="font-headline font-bold uppercase tracking-widest text-sm md:text-base">Batch Settlement Queue</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-sm text-on-surface-variant uppercase tracking-widest">Network:</span>
                <span className="text-[10px] md:text-sm font-mono text-primary-cyan uppercase tracking-widest">LYA-MAINNET-1</span>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {[...batches].reverse().map((batch) => (
                    <motion.div 
                      key={batch.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-surface-dim border border-white/5 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 group hover:border-primary-cyan/30 transition-all"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className={`p-2 md:p-3 border ${
                          batch.status === 'FINALIZED' ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5' : 
                          batch.status === 'PROCESSING' ? 'border-primary-cyan/20 text-primary-cyan bg-primary-cyan/5' : 
                          'border-accent-gold/20 text-accent-gold bg-accent-gold/5'
                        }`}>
                          {batch.status === 'FINALIZED' ? <CheckCircle2 size={20} /> : 
                           batch.status === 'PROCESSING' ? <Zap size={20} className="animate-pulse" /> : 
                           <Database size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold uppercase tracking-widest text-sm md:text-base">{batch.id}</h3>
                            <span className="text-[9px] md:text-sm px-1.5 py-0.5 border border-white/10 text-on-surface-variant uppercase tracking-widest">{batch.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] md:text-sm text-on-surface-variant uppercase tracking-widest">
                            <span>{batch.transactions} Settlements</span>
                            <span>Value: ${batch.value?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <div className={`text-xs md:text-sm font-bold uppercase tracking-widest ${
                            batch.status === 'FINALIZED' ? 'text-emerald-400' : 
                            batch.status === 'PROCESSING' ? 'text-primary-cyan' : 
                            'text-accent-gold'
                          }`}>
                            {batch.status}
                          </div>
                          <div className="text-[10px] md:text-sm text-on-surface-variant uppercase tracking-widest mt-1">
                            {batch.status === 'FINALIZED' ? 'BLOCK #842,109' : 'CONFIRMING...'}
                          </div>
                        </div>
                        <button 
                          onClick={() => onNotify(`VIEWING DETAILS FOR ${batch.id}...`)}
                          className="p-3 text-on-surface-variant hover:text-primary-cyan hover:bg-primary-cyan/5 border border-transparent hover:border-primary-cyan/20 transition-all active:scale-90"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Real-time Metrics */}
          <div className="bg-surface-low border border-white/5 p-8">
            <h2 className="text-xl md:text-2xl font-bold font-headline uppercase tracking-widest mb-8">Live Metrics</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] md:text-sm uppercase tracking-widest text-on-surface-variant">
                  <span>Engine Load</span>
                  <span className="text-primary-cyan font-bold">42%</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    animate={{ width: ['42%', '45%', '40%', '42%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] md:text-sm uppercase tracking-widest text-on-surface-variant">
                  <span>Memory Usage</span>
                  <span className="text-accent-gold font-bold">2.4 GB</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    animate={{ width: ['60%', '62%', '58%', '60%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-accent-gold shadow-[0_0_10px_rgba(238,192,94,0.5)]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] md:text-sm uppercase tracking-widest text-on-surface-variant">
                  <span>Network Latency</span>
                  <span className="text-emerald-400 font-bold">14ms</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    animate={{ width: ['10%', '12%', '8%', '10%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-surface-low border border-white/5 p-6 font-mono text-[10px] md:text-xs text-primary-cyan/60 space-y-2 h-[300px] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan/20" />
            <div className="flex items-center gap-2 mb-4 text-primary-cyan">
              <Terminal size={14} />
              <span className="uppercase tracking-widest font-bold text-sm md:text-base">Settlement Log</span>
            </div>
            <div className="space-y-1">
              {[...Array(15)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {`[${new Date().toLocaleTimeString()}] BATCH_PROC: 0x${Math.random().toString(16).slice(2, 10)}... VERIFIED`}
                </motion.div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-surface-low to-transparent" />
          </div>
        </div>
      </div>

      {/* Protocol Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-surface-low border border-white/5 space-y-4">
          <div className="text-primary-cyan"><ShieldCheck size={24} /></div>
          <h3 className="text-base font-bold uppercase tracking-widest">Atomic Settlement</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed uppercase tracking-wider">
            Settlements are processed atomically. Contracts and units are swapped simultaneously to eliminate counterparty risk.
          </p>
        </div>
        <div className="p-6 bg-surface-low border border-white/5 space-y-4">
          <div className="text-accent-gold"><Activity size={24} /></div>
          <h3 className="text-base font-bold uppercase tracking-widest">Batch Optimization</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed uppercase tracking-wider">
            High-frequency exchanges are batched into single on-chain settlements to minimize gas costs and maximize throughput.
          </p>
        </div>
        <div className="p-6 bg-surface-low border border-white/5 space-y-4">
          <div className="text-emerald-400"><CheckCircle2 size={24} /></div>
          <h3 className="text-base font-bold uppercase tracking-widest">Finality Guarantee</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed uppercase tracking-wider">
            Once a batch is finalized, it is immutable and permanently recorded on the LYA Ledger and Ethereum Mainnet.
          </p>
        </div>
      </div>
    </div>
  );
};
