
import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Activity, Shield } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const LYAAlgorithm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan">
            <Cpu size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t('Predictive Analysis Engine', 'Moteur d\'Analyse Prédictive')}</h2>
            <p className="text-[10px] text-primary-cyan font-bold uppercase tracking-widest">{t('LYA_NEURAL_v4.2.0 ACTIVE', 'LYA_NEURAL_v4.2.0 ACTIF')}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-surface-variant/40 font-bold uppercase mb-1">{t('CONFIDENCE_SCORE', 'SCORE_CONFIANCE')}</div>
          <div className="text-2xl font-black text-emerald-400">98.4%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white/2 border border-white/5 space-y-4">
           <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Activity size={14} className="text-primary-cyan" />
             {t('MARKET_SANS_BIAS', 'SANS_BIAIS_MARCHÉ')}
           </h3>
           <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase font-bold">
             {t('NEURAL CLUSTERS ARE CURRENTLY PROCESSING 12,000+ CREATIVE DATA POINTS PER SECOND. BIAS MITIGATION AT 99.9%.', 'LES CLUSTERS NEURONAUX TRAITENT ACTUELLEMENT PLUS DE 12 000 POINTS DE DONNÉES CRÉATIVES PAR SECONDE. ATTÉNUATION DU BIAIS À 99,9 %.')}
           </p>
           <div className="h-1 w-full bg-white/5 overflow-hidden">
             <motion.div 
               className="h-full bg-emerald-400"
               initial={{ width: '0%' }}
               animate={{ width: '99.9%' }}
               transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
             />
           </div>
        </div>

        <div className="p-6 bg-white/2 border border-white/5 space-y-4">
           <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Shield size={14} className="text-primary-cyan" />
             {t('PROTOCOL_SAFETY', 'SÉCURITÉ_PROTOCOLE')}
           </h3>
           <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase font-bold">
             {t('QUANTUM_PRIME ENCRYPTION SECURING ALL PREDICTIVE MODELS. NO UNAUTHORIZED EXFILTRATION DETECTED.', 'CHIFFREMENT QUANTUM_PRIME SÉCURISANT TOUS LES MODÈLES PRÉDICTIFS. AUCUNE EXFILTRATION NON AUTORISÉE DÉTECTÉE.')}
           </p>
           <div className="flex gap-2">
             {[1,2,3,4,5,6,7,8].map(i => (
               <div key={i} className="flex-1 h-3 bg-primary-cyan/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
             ))}
           </div>
        </div>
      </div>

      <div className="p-8 border border-primary-cyan/20 bg-primary-cyan/5 relative">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('ALGORITHM_INSIGHT', 'APERÇU_ALGORITHME')}</span>
            <Zap size={14} className="text-primary-cyan" />
         </div>
         <p className="text-[11px] text-primary-cyan font-bold italic leading-relaxed uppercase">
           {t('"THE NEXT 12 HOURS INDICATE A SIGNIFICANT LIQUIDITY SURGE IN THE SECTOR 0xAF. INSTITUTIONAL REBALANCING IS IMMINENT."', '"LES 12 PROCHAINES HEURES INDIQUENT UNE POUSSÉE DE LIQUIDITÉ SIGNIFICATIVE DANS LE SECTEUR 0xAF. LE RÉÉQUILIBRAGE INSTITUTIONNEL EST IMMINENT."')}
         </p>
      </div>
    </div>
  );
};
