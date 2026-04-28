
import React from 'react';
import { motion } from 'motion/react';
import { Scale, X, Zap, ArrowRight, Lock } from 'lucide-react';
import { Contract, CONTRACTS } from '../types';
import { useTranslation } from '../context/LanguageContext';

import { PageHeader } from '../components/ui/PageHeader';

interface CompareViewProps {
  comparisonList: string[];
  allContracts: Contract[];
  onRemoveFromComparison: (id: string) => void;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
  onViewDetail: (contract: Contract) => void;
  isPro?: boolean;
}

export const CompareView: React.FC<CompareViewProps> = ({ 
  comparisonList, 
  allContracts,
  onRemoveFromComparison,
  onNotify,
  onViewChange,
  onViewDetail,
  isPro = false
}) => {
  const { t } = useTranslation();
  const selectedContracts = allContracts.filter(c => comparisonList.includes(c.id));
  const MAX_SLOTS = isPro ? 10 : 4;
  
  const suggestedAssets = allContracts
    .filter(c => !comparisonList.includes(c.id))
    .sort((a, b) => (b.scoreLYA || 0) - (a.scoreLYA || 0))
    .slice(0, 3);

  // Helper to get grid classes based on item count
  const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-3'; // 3 or 4 items use 3 columns with wrap
  };

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Asset', 'COMPARATEUR')}
        titleAccent={t('Comparison Matrix', 'D\'ACTIFS')}
        description={t('Deep-dive institutional analysis of selected creative contracts. Limit of 4 slots for Standard accounts.', 'Analyse institutionnelle approfondie des contrats créatifs sélectionnés. Limite de 4 slots pour les comptes Standard.')}
        accentColor="text-primary-cyan"
      />

      <div className="relative z-20 -mt-32 mb-12 px-6 md:px-12 flex flex-col lg:flex-row lg:items-end justify-end gap-8">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1 opacity-40">{t('ACTIVE_SLOTS', 'SLOTS_ACTIFS')}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 border border-white/10 transition-all duration-500 ${i < selectedContracts.length ? 'bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)] border-primary-cyan' : 'bg-white/5 opacity-30'}`} 
                />
              ))}
            </div>
          </div>

          {comparisonList.length > 0 && (
            <button 
              onClick={() => {
                comparisonList.forEach(id => onRemoveFromComparison(id));
                onNotify(t('COMPARISON LIST CLEARED', 'LISTE DE COMPARAISON EFFACÉE'));
              }}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm"
            >
              {t('CLEAR ALL', 'TOUT EFFACER')}
            </button>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12">
      {comparisonList.length === 0 ? (
        <div className="space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/5 p-16 md:p-24 rounded-sm flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-20 h-20 bg-white/5 flex items-center justify-center rounded-full border border-white/10 group-hover:border-primary-cyan/30 group-hover:scale-110 transition-all duration-700">
              <Scale size={32} className="text-primary-cyan opacity-40 group-hover:opacity-100 transition-all" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">{t('NO_ASSETS_IN_MATRIX', 'MATRICE VIDE')}</h3>
              <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-[0.3em] opacity-40 max-w-sm mx-auto leading-relaxed">
                {t('Select and compare creative contracts to reveal institutional yield potentials and risk profiles.', 'Sélectionnez et comparez les contrats créatifs pour révéler les potentiels de rendement institutionnels et les profils de risque.')}
              </p>
            </div>
            <button 
              onClick={() => onViewChange('EXCHANGE')}
              className="px-10 py-5 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all rounded-sm shadow-[0_0_30px_rgba(0,224,255,0.2)] group"
            >
              <span className="flex items-center gap-3">
                {t('OPEN MARKET TERMINAL', 'OUVRIR LE TERMINAL')}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Suggested Assets for Comparison */}
          {suggestedAssets.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] opacity-40 italic">{t('TOP_INSTITUTIONAL_ALPHAS', 'MEILLEURS ALPHAS INSTITUTIONNELS')}</h4>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestedAssets.map(asset => (
                  <div key={asset.id} className="bg-surface-low border border-white/5 p-6 flex items-center justify-between group hover:border-primary-cyan/30 transition-all cursor-pointer rounded-sm" onClick={() => {
                      const updateEvent = new CustomEvent('lyCompare', { detail: asset.id });
                      window.dispatchEvent(updateEvent);
                      onNotify(`${asset.name} ${t('ADDED TO COMPARISON', 'AJOUTÉ À LA COMPARAISON')}`);
                  }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-dim overflow-hidden border border-white/10 group-hover:border-primary-cyan/20">
                        <img src={asset.image} alt={asset.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{asset.name}</div>
                        <div className="text-[9px] font-mono text-primary-cyan font-bold italic">SCORE: {asset.scoreLYA || asset.totalScore}</div>
                      </div>
                    </div>
                    <button 
                      className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-white group-hover:bg-primary-cyan group-hover:text-surface-dim transition-all"
                    >
                      <Zap size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10">
                  <th className="p-8 text-[10px] uppercase tracking-[0.4em] text-on-surface-variant font-black border-r border-white/5 w-[240px] bg-black/20">
                    <div className="flex items-center gap-2 italic">
                      <Scale size={14} className="text-primary-cyan" />
                      {t('INVESTOR_METRICS', 'MÉTRIQUES_INVESTISSEUR')}
                    </div>
                  </th>
                  {selectedContracts.map(contract => (
                    <th key={contract.id} className="p-8 border-r border-white/5 min-w-[300px] relative">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[9px] font-black text-primary-cyan uppercase tracking-widest bg-primary-cyan/10 px-2 py-1 border border-primary-cyan/30 rounded-sm">
                          {contract.registryIndex}
                        </span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => onViewDetail(contract)}
                            className="text-white/20 hover:text-primary-cyan transition-colors"
                          >
                            <ArrowRight size={16} />
                          </button>
                          <button 
                            onClick={() => onRemoveFromComparison(contract.id)}
                            className="text-white/20 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-surface-dim border border-white/10 overflow-hidden shadow-xl shrink-0 group">
                          <img src={contract.image} alt={contract.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xl font-black text-white uppercase tracking-tighter truncate leading-none mb-2">{contract.name}</div>
                          <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest truncate italic">{contract.category}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* Visual slots for standard users (MAX 4) */}
                  {selectedContracts.length < 4 && Array.from({ length: 4 - selectedContracts.length }).map((_, i) => (
                    <th key={`empty-h-${i}`} className="p-8 border-r border-white/5 opacity-5 min-w-[300px]">
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl h-full min-h-[160px] bg-white/[0.02] group/slot">
                        <Scale size={24} className="text-white/10 mb-4 group-hover/slot:text-primary-cyan transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('FREE ASPECT SLOT', 'SLOT LIBRE')}</span>
                        <div className="mt-4 px-4 py-1 text-[8px] border border-white/10 text-white/20 group-hover/slot:border-primary-cyan group-hover/slot:text-primary-cyan transition-all">ADD TO ANALYZE</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  { label: t('ALGORITHMIC_SCORE', 'SCORE_ALGORITHMIQUE'), key: (c: Contract) => Math.round(((c.scoreLYA || 0) + (c.scorePro || 0)) / 2), highlight: true },
                  { label: t('LYA_SCORE_LINKYOURART', 'LYA_SCORE_LINKYOURART'), key: (c: Contract) => c.scoreLYA || 0, color: 'text-primary-cyan opacity-60' },
                  { label: t('LYA_SCORE_PROS', 'LYA_SCORE_PROS'), key: (c: Contract) => c.scorePro || 0, color: 'text-accent-gold opacity-60' },
                  { label: t('LIQUIDITY_DEPTH', 'PROFONDEUR_LIQUIDITÉ'), key: (c: Contract) => c.availableUnits ? `${((c.availableUnits / c.totalUnits) * 100).toFixed(1)}%` : '85.2%', color: 'text-primary-cyan' },
                  { label: t('ANNUAL_GROWTH_12M', 'CROISSANCE_ANNUELLE'), key: (c: Contract) => `${c.growth > 0 ? '+' : ''}${c.growth}%`, color: 'text-emerald-400' },
                  { label: t('REVENUE_SHARE', 'PARTAGE_REVENUS'), key: (c: Contract) => `${c.revenueSharePercentage}%`, color: 'text-white' },
                  { label: t('REGULATORY_STATUS', 'STATUT_RÉGLEMENTAIRE'), key: (c: Contract) => c.jurisdiction || 'EU (MiCA)', color: 'text-on-surface-variant' },
                  { label: t('RISK_ASSESSMENT', 'ÉVALUATION_RISQUE'), key: (c: Contract) => c.status === 'LIVE' ? t('OPTIMAL', 'OPTIMAL') : t('CRITICAL', 'CRITIQUE'), color: (c: Contract) => c.status === 'LIVE' ? 'text-emerald-400' : 'text-red-400' },
                  { label: t('TOTAL_CAPACITY', 'CAPACITÉ_TOTALE'), key: (c: Contract) => `$${(c.totalValue / 1000).toFixed(0)}K` },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6 border-r border-white/5 bg-black/10">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50 italic">{row.label}</span>
                    </td>
                    {selectedContracts.map(contract => {
                      const value = typeof row.key === 'function' ? row.key(contract) : (contract as any)[row.key];
                      const textColor = typeof row.color === 'function' ? row.color(contract) : (row.color || 'text-white');
                      return (
                        <td key={`${contract.id}-${idx}`} className="p-6 border-r border-white/5 last:border-r-0">
                          <div className={`text-base md:text-lg font-mono font-black tracking-tighter ${textColor} ${row.highlight ? 'text-2xl drop-shadow-[0_0_15px_rgba(0,224,255,0.3)]' : ''}`}>
                            {value}
                          </div>
                        </td>
                      );
                    })}
                    {selectedContracts.length < 3 && Array.from({ length: 3 - selectedContracts.length }).map((_, i) => (
                      <td key={`empty-v-${i}`} className="p-6 border-r border-white/5 opacity-5 text-center italic font-mono text-[10px]">EMPTY_BUFFER</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-surface-low/50 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary-cyan/20" />
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary-cyan/5 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan rotate-45 group-hover:rotate-90 transition-transform duration-700">
                  <Zap size={24} className="-rotate-45" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tighter mb-1">{t('INVESTMENT_ALPHA_UNLOCKED', 'ALPHA_INVESTISSEMENT_DÉVERROUILLÉ')}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] opacity-40 max-w-lg leading-relaxed">
                    {t('Our institutional grade comparison engine has verified these assets across LYA global registries. Real-time settlement values are confirmed.', 'Notre moteur de comparaison institutionnel a vérifié ces actifs sur les registres mondiaux LYA. Les valeurs de règlement en temps réel sont confirmées.')}
                  </div>
                </div>
             </div>
             <button 
               onClick={() => onNotify(t('FULL_REPORT_SENT_TO_MAIL', 'RAPPORT COMPLET ENVOYÉ'))}
               className="px-10 py-5 bg-white text-surface-dim font-black uppercase tracking-widest text-[10px] hover:bg-primary-cyan hover:text-surface-dim transition-all rounded-sm shadow-xl flex items-center gap-4"
             >
               {t('DOWNLOAD_PRO_REPORT', 'TÉLÉCHARGER LE RAPPORT PRO')}
               <ArrowRight size={14} />
             </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const Plus = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
