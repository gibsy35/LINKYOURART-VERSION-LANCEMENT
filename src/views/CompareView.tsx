
import React from 'react';
import { motion } from 'motion/react';
import { Scale, X, Zap, ArrowRight, Lock, BarChart3, Shield, Info, Activity, Crown } from 'lucide-react';
import { Contract, CONTRACTS } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { NumberTicker } from '../components/ui/NumberTicker';
import { useCurrency } from '../context/CurrencyContext';

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
  const { formatPrice } = useCurrency();
  const selectedContracts = allContracts.filter(c => comparisonList.includes(c.id)).slice(0, isPro ? 50 : 20);
  
  const suggestedAssets = allContracts
    .filter(c => !comparisonList.includes(c.id))
    .sort((a, b) => (b.scoreLYA || 0) - (a.scoreLYA || 0))
    .slice(0, 3);

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Asset', 'COMPARATEUR')}
        titleAccent={t('Comparison Matrix', 'D\'ACTIFS')}
        description={t('Deep-dive institutional analysis of selected creative contracts. Maximum 20 projects compared per session for Standard accounts.', 'Analyse institutionnelle approfondie des contrats créatifs sélectionnés. Maximum 20 projets comparés par session pour les comptes Standard.')}
        accentColor="text-primary-cyan"
      />

      {comparisonList.length > 0 && (
        <div className="relative z-20 -mt-32 mb-12 px-6 md:px-12 flex items-end justify-end">
          <button 
            onClick={() => {
              comparisonList.forEach(id => onRemoveFromComparison(id));
              onNotify(t('COMPARISON LIST CLEARED', 'LISTE DE COMPARAISON EFFACÉE'));
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm backdrop-blur-xl"
          >
            <X size={14} />
            {t('TERMINAL_RESET', 'RÉINITIALISER_TERMINAL')}
          </button>
        </div>
      )}

      <div className="px-6 md:px-12">
      {comparisonList.length === 0 ? (
        <div className="space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/10 p-16 md:p-32 rounded-sm flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/30 to-transparent" />
            
            <div className="w-24 h-24 bg-white/5 flex items-center justify-center rounded-full border border-white/10 group-hover:border-primary-cyan/30 group-hover:scale-110 transition-all duration-700 relative">
              <div className="absolute inset-0 rounded-full bg-primary-cyan/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Scale size={36} className="text-primary-cyan opacity-40 group-hover:opacity-100 transition-all relative z-10" />
            </div>

            <div className="space-y-6 relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic select-none">
                {t('QUANTUM_MATRIX_OFFLINE', 'MATRICE_OFFLINE')}
              </h3>
              <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-[0.4em] font-bold opacity-40 max-w-lg mx-auto leading-relaxed">
                {t('Select and benchmark creative contracts to reveal institutional yield potential. LYA Neuro-Engine awaits data initialization.', 'Sélectionnez et comparez les contrats créatifs. Le Neuro-Engine LYA attend l\'initialisation des données.')}
              </p>
            </div>

            <button 
              onClick={() => onViewChange('EXCHANGE')}
              className="px-12 py-6 bg-white text-surface-dim font-black uppercase tracking-widest text-[11px] hover:bg-primary-cyan hover:text-surface-dim transition-all rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-primary-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="flex items-center gap-4 relative z-10">
                {t('INITIALIZE_QUERIES', 'INITIALISER_REQUÊTES')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {suggestedAssets.length > 0 && (
            <div className="pt-12 space-y-10">
              <div className="flex items-center gap-6">
                <div className="h-[1px] flex-1 bg-white/5" />
                <h4 className="text-[10px] font-black text-primary-cyan/60 uppercase tracking-[0.5em] italic">{t('SUGGESTED_ALPHA', 'ALPHA_SUGGÉRÉ')}</h4>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {suggestedAssets.map((asset, i) => (
                  <motion.div 
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-surface-low/50 border border-white/5 p-8 flex flex-col gap-6 group hover:border-primary-cyan/30 transition-all cursor-pointer rounded-sm relative overflow-hidden" 
                    onClick={() => {
                        const updateEvent = new CustomEvent('lyCompare', { detail: asset.id });
                        window.dispatchEvent(updateEvent);
                        onNotify(`${asset.name} ${t('ADDED TO COMPARISON', 'AJOUTÉ À LA COMPARAISON')}`);
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                      <BarChart3 size={40} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-surface-dim overflow-hidden border border-white/10 group-hover:border-primary-cyan/30 shadow-2xl transition-all duration-700 rounded-sm">
                        <img src={asset.image} alt={asset.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">{asset.category}</div>
                        <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary-cyan transition-colors">{asset.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                       <div>
                         <div className="text-[8px] font-black text-accent-gold uppercase tracking-widest mb-1">{t('LYA_SCORE', 'SCORE LYA')}</div>
                         <div className="text-xl font-black font-mono text-white tracking-tighter">
                            <NumberTicker value={asset.scoreLYA || asset.totalScore} />
                         </div>
                       </div>
                       <button className="w-10 h-10 flex items-center justify-center bg-primary-cyan/5 border border-primary-cyan/20 text-primary-cyan group-hover:bg-primary-cyan group-hover:text-surface-dim transition-all rounded-sm shadow-xl">
                         <Zap size={18} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-low/20 backdrop-blur-3xl border border-white/10 rounded-sm overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in-95 duration-700">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  <th className="p-10 text-[10px] uppercase tracking-[0.5em] text-on-surface-variant font-black border-r border-white/5 w-[280px] bg-black sticky left-0 z-30 opacity-100">
                    <div className="flex items-center gap-3 italic">
                      <Activity size={16} className="text-primary-cyan" />
                      {t('ANALYTICS_KEY', 'CLEFS_ANALYTIQUES')}
                    </div>
                  </th>
                  {selectedContracts.map((contract, idx) => (
                    <th key={contract.id} className="p-10 border-r border-white/5 min-w-[340px] relative">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.3em] bg-primary-cyan/5 px-3 py-1.5 border border-primary-cyan/20 rounded-sm">
                          {contract.registryIndex}
                        </span>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => onViewDetail(contract)}
                            className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-primary-cyan hover:border-primary-cyan/40 transition-all rounded-sm"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <button 
                            onClick={() => onRemoveFromComparison(contract.id)}
                            className="w-8 h-8 flex items-center justify-center bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:border-red-500/40 transition-all rounded-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-surface-dim border border-white/10 overflow-hidden shadow-2xl shrink-0 group relative rounded-sm">
                          <img src={contract.image} alt={contract.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-primary-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-primary-cyan uppercase tracking-[0.3em] mb-2 opacity-50">{contract.category}</div>
                          <div className="text-2xl font-black text-white uppercase tracking-tighter truncate leading-none mb-1 italic">{contract.name}</div>
                          <div className="text-[8px] font-mono text-on-surface-variant/40 uppercase tracking-widest">{contract.issuerId}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                  
                  {/* Empty Slots for upgrade incentive */}
                  {selectedContracts.length < 20 && Array.from({ length: 1 }).map((_, i) => (
                    <th key={`empty-h-${i}`} className="p-10 border-r border-white/5 min-w-[340px] bg-white/[0.01]">
                      <div className="flex flex-col items-center justify-center h-full min-h-[160px] border border-dashed border-white/10 rounded-sm bg-black/10 group cursor-pointer hover:border-primary-cyan/30 transition-all font-mono" onClick={() => onViewChange('EXCHANGE')}>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Plus size={20} className="text-white/20 group-hover:text-primary-cyan" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-primary-cyan transition-colors">{t('ADD_TO_BENCHMARK', 'AJOUTER_POUR_COMPARER')}</span>
                        <span className="text-[8px] font-bold text-white/10 mt-2">{selectedContracts.length} / 20 SLOTS</span>
                      </div>
                    </th>
                  ))}

                  {/* Pro Limit slot info */}
                  {!isPro && selectedContracts.length >= 20 && (
                     <th className="p-10 border-r border-white/5 min-w-[340px] bg-accent-gold/[0.02]">
                       <div className="flex flex-col items-center justify-center h-full min-h-[160px] border border-dashed border-accent-gold/20 rounded-sm bg-black/10 group">
                         <Lock size={20} className="text-accent-gold/40 mb-4" />
                         <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-gold/40 text-center px-8 leading-relaxed">
                            {t('UPGRADE_TO_PRO_FOR_UNLIMITED_SLOTS', 'PASSEZ_EN_PRO_POUR_DES_SLOTS_ILLIMITÉS')}
                         </span>
                         <button 
                            onClick={() => onViewChange('PRICING')}
                            className="mt-6 px-6 py-2 border border-accent-gold/30 text-accent-gold text-[9px] font-black uppercase tracking-widest hover:bg-accent-gold hover:text-surface-dim transition-all"
                         >
                            {t('UNLEASH_TERMINAL', 'DÉBRIDER_LE_TERMINAL')}
                         </button>
                       </div>
                     </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {[
                  { label: t('LYA_SCORE', 'SCORE LYA'), key: (c: Contract) => c.scoreLYA || 0, highlight: true, prefix: '', suffix: '/1000' },
                  { label: t('SCORE_ALGO', 'SCORE ALGO'), key: (c: Contract) => c.scoreAlgo || 0, color: 'text-primary-cyan opacity-80', suffix: '/1000' },
                  { label: t('SCORE_PRO', 'SCORE PRO'), key: (c: Contract) => c.scorePro || 0, color: 'text-accent-gold opacity-80', suffix: '/1000' },
                  { label: t('ESTIMATED_APR', 'APR_ESTIMÉ'), key: (c: Contract) => c.growth || 0, color: 'text-emerald-400', suffix: '%', isTicker: true, decimalPlaces: 1 },
                  { label: t('LIQUIDITY_DEPTH', 'PROFONDEUR_LIQUIDITÉ'), key: (c: Contract) => c.availableUnits ? (c.availableUnits / c.totalUnits) * 100 : 85.2, color: 'text-primary-cyan/80', suffix: '%', isTicker: true, decimalPlaces: 1 },
                  { label: t('REVENUE_SHARE', 'PARTAGE_REVENUS'), key: (c: Contract) => c.revenueSharePercentage || 0, color: 'text-white/80', suffix: '%', isTicker: true },
                  { label: t('UNIT_VALUATION', 'VALEUR_UNITÉ'), key: (c: Contract) => c.unitValue || 0, color: 'text-white', prefix: '$', isTicker: true },
                  { label: t('TOTAL_REGISTRY_VALUE', 'VALEUR_TOTAL_REGISTRE'), key: (c: Contract) => c.totalValue || 0, prefix: '$', isTicker: true },
                  { label: t('CYBER_SECURITY', 'SÉCURITÉ_CYBER'), key: (c: Contract) => 'VERIFIED_LYA', color: 'text-emerald-400', icon: Shield },
                  { label: t('REGULATORY_STATUS', 'STATUT_REG'), key: (c: Contract) => c.jurisdiction || 'EU (MiCA)', color: 'text-on-surface-variant' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-8 border-r border-white/5 bg-black sticky left-0 z-20 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                         {row.icon && <row.icon size={12} className="text-primary-cyan/40" />}
                         <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50 italic group-hover:opacity-100 transition-opacity whitespace-nowrap">{row.label}</span>
                      </div>
                    </td>
                    {selectedContracts.map(contract => {
                      const value = typeof row.key === 'function' ? (row.key as any)(contract) : (contract as any)[row.key as any];
                      const rowColor = (row as any).color;
                      const textColor = typeof rowColor === 'function' ? rowColor(contract) : (rowColor || 'text-white');
                      const isNumeric = typeof value === 'number';
                      
                      return (
                        <td key={`${contract.id}-${idx}`} className="p-8 border-r border-white/5 last:border-r-0">
                          <div className={`text-base md:text-xl font-mono font-black tracking-tighter ${textColor} ${(row as any).highlight ? 'text-2xl md:text-3xl text-white drop-shadow-[0_0_20px_rgba(0,224,255,0.4)]' : ''}`}>
                             {isNumeric && ((row as any).isTicker || (row as any).highlight || row.label.includes('SCORE')) ? (
                               <div className="flex items-baseline gap-0.5">
                                 {(row as any).prefix}
                                 <NumberTicker value={value} decimalPlaces={(row as any).decimalPlaces || 0} />
                                 <span className="text-[10px] opacity-40 ml-1 font-sans">{(row as any).suffix}</span>
                                </div>
                             ) : (
                               <span>{(row as any).prefix}{value?.toLocaleString()}{(row as any).suffix}</span>
                             )}
                          </div>
                        </td>
                      );
                    })}
                    {/* Visual placeholders for empty slots */}
                    {selectedContracts.length < 20 && (
                      <td key="empty-v-placeholder" className="p-8 border-r border-white/5 opacity-5 text-center italic font-mono text-[10px] bg-black/10">---_BUFFER_---</td>
                    )}
                    {!isPro && selectedContracts.length >= 20 && (
                       <td className="p-8 border-r border-white/5 bg-accent-gold/[0.01]">
                          <div className="w-full h-full flex items-center justify-center">
                             <div className="h-px w-24 bg-accent-gold/10" />
                          </div>
                       </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-10 bg-surface-dim border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-primary-cyan/40" />
             <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 bg-primary-cyan/5 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan rotate-45 group-hover:rotate-90 transition-all duration-1000 shadow-[0_0_30px_rgba(0,224,255,0.1)]">
                  <Zap size={28} className="-rotate-45" />
                </div>
                <div>
                  <div className="text-lg font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                    {t('INSTITUTIONAL_BENCHMARK_COMPLETE', 'BENCHMARK_INSTITUTIONNEL_COMPLÉTÉ')}
                    <Shield size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] opacity-40 max-w-2xl leading-relaxed font-bold">
                    {t('LYA proprietary neural benchmarks have cross-referenced the selected creative contracts across 12 global equity registries. Settlement indicators are within optimal institutional range.', 'Les benchmarks neuronaux propriétaires de LYA ont recoupé les contrats créatifs sélectionnés sur 12 registres de fonds propres mondiaux. Les indicateurs de règlement sont dans la fourchette institutionnelle optimale.')}
                  </div>
                </div>
             </div>
             <button 
               onClick={() => onNotify(t('TRANSCRIPT_LOCKED_PENDING_PRO_ACTIVATION', 'TRANSCRIPT_VERROUILLÉ_ATTENTE_PRO'))}
               className="px-12 py-6 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-surface-dim transition-all rounded-sm shadow-2xl flex items-center gap-5 group shrink-0"
             >
               {t('EXPOR_FULL_AUDIT_REPORT', 'EXPORTER_LE_RAPPORT_D\'AUDIT')}
               <BarChart3 size={16} className="group-hover:scale-110 transition-transform" />
             </button>
          </div>
        </div>
      )}
      </div>

      {comparisonList.length >= 20 && !isPro && (
        <div className="px-6 md:px-12 pb-12">
          <div className="p-8 bg-accent-gold/10 border border-accent-gold/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-gold/5 blur-3xl -z-10" />
            <div className="flex items-center gap-4">
              <Crown className="text-accent-gold animate-bounce" size={32} />
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">{t('PRO_UPGRADE_REQUIRED', 'MISE À NIVEAU PRO REQUISE')}</h4>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                  {t('YOU HAVE SELECTED', 'VOUS AVEZ SÉLECTIONNÉ')} {comparisonList.length} {t('PROJECTS. STANDARD LIMIT IS 20.', 'PROJETS. LA LIMITE STANDARD EST DE 20.')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onViewChange('PRICING')}
              className="px-8 py-3 bg-accent-gold text-surface-dim font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-lg active:scale-95"
            >
              {t('UPGRADE_TO_PRO', 'PASSER AU PRO')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Plus = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
