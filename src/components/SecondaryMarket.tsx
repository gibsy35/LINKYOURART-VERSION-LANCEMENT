
import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';

export const SecondaryMarket: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t('Secondary Market Node', 'Nœud du Marché Secondaire')}</h2>
          <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">{t('PEER-TO-PEER PROFESSIONAL SETTLEMENT', 'RÈGLEMENT PROFESSIONNEL DE PAIR À PAIR')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('POOL_ACTIVE', 'POOL_ACTIF')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
           {/* Order Book Placeholder */}
           <div className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mb-4">{t('LIVE_ORDER_BOOK', 'CARNET_D\'ORDRES_EN_DIRECT')}</div>
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 group hover:bg-emerald-400/5 transition-all">
                <div className="flex items-center gap-4">
                  <ArrowUpRight size={14} className="text-emerald-400" />
                  <div>
                    <div className="text-[10px] font-black text-white uppercase">LIMIT_BUY</div>
                    <div className="text-[8px] text-on-surface-variant/40">TX-0x{Math.random().toString(16).slice(2,6).toUpperCase()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-emerald-400">1,250.00 LYA</div>
                  <div className="text-[9px] text-on-surface-variant/40 font-bold">$125,000.00</div>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-6 bg-white/2 p-8 border border-white/5 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={64} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('SETTLEMENT_PROTOCOL', 'PROTOCOLE_DE_RÈGLEMENT')}</h3>
          <p className="text-[11px] text-on-surface-variant/60 leading-relaxed uppercase font-bold">
            {t('ALL SECONDARY TRADES ARE SECURED BY THE LYA SETTLEMENT ENGINE. ESCROW IS AUTOMATED AND INSTANT.', 'TOUS LES ÉCHANGES SECONDAIRES SONT SÉCURISÉS PAR LE MOTEUR DE RÈGLEMENT LYA. LE SÉQUESTRE EST AUTOMATISÉ ET INSTANTANÉ.')}
          </p>
          <div className="py-4 space-y-2">
             <div className="text-[10px] flex justify-between uppercase font-black">
                <span className="text-on-surface-variant/40">{t('SETTLEMENT_SPEED', 'VITESSE_RÈGLEMENT')}</span>
                <span className="text-primary-cyan">{"<"} 250ms</span>
             </div>
             <div className="text-[10px] flex justify-between uppercase font-black">
                <span className="text-on-surface-variant/40">{t('TRUST_SCORE', 'SCORE_CONFIANCE')}</span>
                <span className="text-primary-cyan">AAA+</span>
             </div>
          </div>
          <button className="w-full py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.2)]">
            {t('INITIALIZE OTC DESK', 'INITIALISER LE BUREAU OTC')}
          </button>
        </div>
      </div>
    </div>
  );
};
