import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { ArrowUpRight, ArrowDownLeft, Shield, RefreshCw } from 'lucide-react';
import { CONTRACTS, LYA_UNIT_VALUE } from '../types';

export const SecondaryMarket: React.FC = () => {
  const { t, language } = useTranslation();
  const isFR = language === 'FR';
  const T = (fr: string, en: string) => isFR ? fr : en;
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const liveContracts = CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 5);

  const fakeOffers = liveContracts.map((c, i) => ({
    type: i % 2 === 0 ? 'BUY' : 'SELL',
    project: c.name,
    category: c.category,
    units: [5, 10, 20, 15, 8][i],
    unitPrice: LYA_UNIT_VALUE * (1 + (c.growth || 0) / 100),
  })).filter(o => filter === 'ALL' || o.type === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/8 pb-6">
        <div>
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">
            {T('Marché des Échanges Créatifs', 'Creative Exchange Market')}
          </h2>
          <p className="text-xs text-on-surface-variant/50 font-bold uppercase tracking-widest mt-0.5">
            {T('Échanges de parts créatives entre membres LYA', 'Creative shares exchanges between LYA members')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{T('EN LIGNE', 'ONLINE')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des offres */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-on-surface uppercase tracking-widest">
              {T('Offres en cours', 'Current Offers')}
            </h3>
            <div className="flex gap-1.5">
              {(['ALL', 'BUY', 'SELL'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-primary-cyan/15 border border-primary-cyan/30 text-primary-cyan' : 'bg-white/5 border border-white/8 text-on-surface-variant hover:text-on-surface'}`}
                >
                  {f === 'ALL' ? T('Tout', 'All') : f === 'BUY' ? T('Achat', 'Buy') : T('Vente', 'Sell')}
                </button>
              ))}
            </div>
          </div>

          {fakeOffers.map((offer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 bg-surface-high/30 border border-white/8 rounded-xl hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${offer.type === 'BUY' ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}>
                  {offer.type === 'BUY'
                    ? <ArrowUpRight size={14} className="text-emerald-400" />
                    : <ArrowDownLeft size={14} className="text-rose-400" />}
                </div>
                <div>
                  <p className="text-sm font-black text-on-surface">{offer.project}</p>
                  <p className="text-xs text-on-surface-variant/50">{offer.category} · {offer.units} {T('unités', 'units')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${offer.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${(offer.units * offer.unitPrice).toFixed(2)}
                </p>
                <p className="text-[10px] text-on-surface-variant/40 font-mono">${offer.unitPrice.toFixed(2)}/{T('u.', 'u.')}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Protocole d'échange */}
        <div className="bg-surface-high/20 border border-white/8 rounded-2xl p-6 relative space-y-5">
          <div className="absolute top-4 right-4 opacity-5">
            <Shield size={64} />
          </div>
          <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">
            {T('Comment fonctionne l\'échange ?', 'How does the exchange work?')}
          </h3>
          <p className="text-sm text-on-surface-variant/70 leading-relaxed">
            {T(
              'Les parts créatives LYA peuvent être cédées entre membres de la plateforme. Chaque échange est enregistré dans le registre LYA et validé par les deux parties.',
              'LYA creative shares can be transferred between platform members. Each exchange is recorded in the LYA registry and validated by both parties.'
            )}
          </p>
          <div className="space-y-3">
            {[
              { labelFR: 'Validation des deux parties', labelEN: 'Both parties validated', value: '100%', color: 'text-emerald-400' },
              { labelFR: 'Délai de traitement', labelEN: 'Processing time', value: T('< 24h', '< 24h'), color: 'text-primary-cyan' },
              { labelFR: 'Sécurité des fonds', labelEN: 'Fund security', value: 'AAA+', color: 'text-accent-gold' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-on-surface-variant/60 font-medium">{isFR ? row.labelFR : row.labelEN}</span>
                <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest hover:bg-white transition-all rounded-xl shadow-[0_0_20px_rgba(0,224,255,0.15)] flex items-center justify-center gap-2">
            <RefreshCw size={14} />
            {T('PROPOSER UN ÉCHANGE', 'PROPOSE AN EXCHANGE')}
          </button>
        </div>
      </div>
    </div>
  );
};
