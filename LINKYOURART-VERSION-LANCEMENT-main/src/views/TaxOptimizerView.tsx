
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Globe, 
  ShieldCheck, 
  TrendingDown, 
  ArrowRight, 
  AlertCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Lock,
  Zap,
  BarChart3,
  Scale
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { InfoTooltip } from '../components/InfoTooltip';

export const TaxOptimizerView: React.FC<{ onNotify: (msg: string) => void }> = ({ onNotify }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [buyerJurisdiction, setBuyerJurisdiction] = useState('FRANCE (EU)');
  const [assetLocation, setAssetLocation] = useState('GENEVA FREE PORT');
  const [showSummary, setShowSummary] = useState(true);

  // Dynamic Calculation Engine
  const getTaxRates = (jurisdiction: string, location: string) => {
    // Mock simulation of global fiscal complexity
    const rates: Record<string, number> = {
      'FRANCE (EU)': 0.22,
      'UNITED STATES': 0.18,
      'UNITED KINGDOM': 0.20,
      'SWITZERLAND': 0.085,
      'UAE (DUBAI)': 0.00,
      'HONG KONG': 0.00,
      'SINGAPORE': 0.00,
      'GERMANY (EU)': 0.25,
      'JAPAN': 0.15,
      'MONACO': 0.00,
      'LUXEMBOURG': 0.12
    };

    const storageDiscount: Record<string, number> = {
      'GENEVA FREE PORT': 0.60,
      'LUXEMBOURG FREEPORT': 0.55,
      'SINGAPORE FREEPORT': 0.50,
      'LONDON (UK)': 0.10,
      'NEW YORK (US)': 0.05,
      'DELAWARE (US)': 0.30,
      'DUBAI SOUTH': 0.70,
      'HONG KONG AIRPORT': 0.45,
      'ZURICH AIRPORT': 0.40
    };

    const baseRate = rates[jurisdiction] || 0.20;
    const discount = storageDiscount[location] || 0;
    
    // Final optimized rate: base * (1 - discount)
    const optimized = baseRate * (1 - discount);
    
    return {
      base: baseRate,
      optimized: Math.max(0.02, optimized), // Floor at 2% for protocol fees
      reduction: discount * 100
    };
  };

  const { base, optimized, reduction } = getTaxRates(buyerJurisdiction, assetLocation);
  
  const standardTax = investmentAmount * base;
  const optimizedTax = investmentAmount * optimized;
  const totalSaving = standardTax - optimizedTax;
  const reductionPercent = reduction.toFixed(1);

  const handleApplyStrategy = () => {
    onNotify(t('INITIATING FISCAL CLEARANCE...', 'INITIATION DU DÉDOUANEMENT FISCAL...'));
    setTimeout(() => {
      onNotify(t('OPTIMIZATION STRATEGY DEPLOYED. UPDATING FISCAL HUB...', 'STRATÉGIE D\'OPTIMISATION DÉPLOYÉE. MISE À JOUR DU HUB FISCAL...'));
      onNotify(t('TAX REBATE APPLIED: ' + reductionPercent + '%', 'REMISE FISCALE APPLIQUÉE : ' + reductionPercent + '%'));
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="px-12 relative z-10 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white leading-[1.1] md:leading-[0.9] uppercase italic mb-8 md:mb-12 flex flex-wrap items-center gap-4 break-words">
              <div className="h-[2px] w-12 bg-primary-cyan shrink-0"></div>
              <span className="flex-1 min-w-0 tracking-[-0.05em]">{t('TAX', 'TAX')} <span className="text-primary-cyan drop-shadow-[0_0_20px_rgba(0,224,255,0.4)]">{t('OPTIMIZER', 'OPTIMISATEUR')}</span></span>
            </h1>
            <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-xl text-[11px] md:text-sm leading-relaxed opacity-70 uppercase tracking-[0.3em] font-black italic mb-10">
              {t('DYNAMIC CALCULATION OF FISCAL IMPACTS BASED ON GLOBAL JURISDICTIONS, ASSET TYPE, AND INSTITUTIONAL HOLDING STRUCTURES. FULLY INTEGRATED WITH LYA PROTOCOL CLEARANCE HUB.', 'CALCUL DYNAMIQUE DES IMPACTS FISCAUX BASÉ SUR LES JURIDICTIONS MONDIALES, LE TYPE D\'ACTIF ET LES STRUCTURES DE DÉTENTION INSTITUTIONNELLES. ENTIÈREMENT INTÉGRÉ AUX HUB DE DÉDOUANEMENT DU PROTOCOLE LYA.')}
            </p>
          </div>

          <div className="flex gap-6">
            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl min-w-[200px] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-black">Fiscal Integrity</p>
                <p className="text-sm font-black text-white italic">COMPLIANT</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Logic */}
        <div className="lg:col-span-8 space-y-8">
          {/* Jurisdiction Choosers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">{t('BUYER JURISDICTION', 'JURIDICTION DE L\'ACHETEUR')}</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-accent-magenta transition-colors" size={16} />
                <select 
                  value={buyerJurisdiction}
                  onChange={(e) => setBuyerJurisdiction(e.target.value)}
                  className="w-full bg-surface-low/50 border border-white/10 px-12 py-5 text-sm font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-magenta/40 rounded-2xl appearance-none cursor-pointer"
                >
                  <option value="FRANCE (EU)">FRANCE (EU)</option>
                  <option value="UNITED STATES">UNITED STATES</option>
                  <option value="UNITED KINGDOM">UNITED KINGDOM</option>
                  <option value="SWITZERLAND">SWITZERLAND</option>
                  <option value="UAE (DUBAI)">UAE (DUBAI)</option>
                  <option value="HONG KONG">HONG KONG</option>
                  <option value="SINGAPORE">SINGAPORE</option>
                  <option value="GERMANY (EU)">GERMANY (EU)</option>
                  <option value="MONACO">MONACO</option>
                  <option value="LUXEMBOURG">LUXEMBOURG</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">{t('ASSET LOCATION', 'LOCALISATION DE L\'ACTIF')}</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-accent-magenta transition-colors" size={16} />
                <select 
                  value={assetLocation}
                  onChange={(e) => setAssetLocation(e.target.value)}
                  className="w-full bg-surface-low/50 border border-white/10 px-12 py-5 text-sm font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-magenta/40 rounded-2xl appearance-none cursor-pointer"
                >
                  <option value="GENEVA FREE PORT">GENEVA FREE PORT (CH)</option>
                  <option value="LUXEMBOURG FREEPORT">LUXEMBOURG FREEPORT</option>
                  <option value="SINGAPORE FREEPORT">SINGAPORE FREEPORT</option>
                  <option value="LONDON (UK)">LONDON (UK)</option>
                  <option value="NEW YORK (US)">NEW YORK (US)</option>
                  <option value="DELAWARE (US)">DELAWARE (US)</option>
                  <option value="DUBAI SOUTH">DUBAI SOUTH (UAE)</option>
                  <option value="HONG KONG AIRPORT">HONG KONG AIRPORT</option>
                  <option value="ZURICH AIRPORT">ZURICH AIRPORT (CH)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              </div>
            </div>
          </div>

          {/* Compliance Summary */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">{t('COMPLIANCE SUMMARY', 'RÉSUMÉ DE CONFORMITÉ')}</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant/60 uppercase tracking-widest text-[10px]">{t('BASE TAX RATE', 'TAUX D\'IMPOSITION DE BASE')}</span>
                <span className="font-mono font-black text-white">{(base * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant/60 uppercase tracking-widest text-[10px]">{t('RESALE RIGHT (DROIT DE SUITE)', 'DROIT DE SUITE')}</span>
                <span className="font-mono font-black text-emerald-400">{reductionPercent}% reduction</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant/60 uppercase tracking-widest text-[10px]">{t('HOLDING STRUCTURE', 'STRUCTURE DE DÉTENTION')}</span>
                <span className="font-black text-primary-cyan uppercase tracking-widest text-[10px] italic">OPTIMIZED VIA {assetLocation}</span>
              </div>
            </div>
          </div>

          {/* Impact Row */}
          <div className="bg-gradient-to-r from-surface-low/50 to-surface-low/20 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em] mb-4">{t('NET FISCAL IMPACT REDUCTION', 'RÉDUCTION D\'IMPACT FISCAL NETTE')}</p>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">-{reductionPercent}% <span className="text-xl opacity-40">Estimated</span></h2>
            </div>
            <button 
              onClick={handleApplyStrategy}
              className="px-12 py-5 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.4em] text-xs rounded-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,224,255,0.3)] active:scale-95"
            >
              {t('APPLY STRATEGY', 'APPLIQUER STRATÉGIE')}
            </button>
          </div>

          {/* investment simulation */}
          <div className="space-y-10 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{t('INVESTMENT SIMULATION', 'SIMULATION D\'INVESTISSEMENT')}</h3>
              <p className="font-mono text-xl font-black text-white italic">$ {investmentAmount.toLocaleString()}</p>
            </div>
            
            <div className="relative pt-4">
              <input 
                type="range"
                min="100000"
                max="10000000"
                step="50000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/5 appearance-none rounded-full accent-accent-magenta cursor-pointer"
              />
              <div className="absolute top-4 left-0 h-2 bg-gradient-to-r from-accent-magenta to-accent-purple rounded-full pointer-events-none" style={{ width: `${(investmentAmount / 10000000) * 100}%` }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
               <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-3 opacity-40">{t('STANDARD TAX', 'TAXE STANDARD')}</p>
                  <p className="text-xl font-black text-red-500 italic">{(standardTax / 1000).toFixed(0)}k</p>
               </div>
               <div className="bg-white/5 border border-accent-magenta/30 p-6 rounded-3xl text-center shadow-[0_15px_30px_rgba(255,0,255,0.1)]">
                  <p className="text-[8px] font-black text-accent-magenta uppercase tracking-widest mb-3">{t('OPTIMIZED', 'OPTIMISÉE')}</p>
                  <p className="text-xl font-black text-primary-cyan italic">{(optimizedTax / 1000).toFixed(0)}k</p>
               </div>
               <div className="bg-emerald-400 font-bold text-surface-dim p-6 rounded-3xl text-center shadow-[0_15px_30px_rgba(52,211,153,0.2)]">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-3">{t('TOTAL SAVING', 'ÉCONOMIE TOTALE')}</p>
                  <p className="text-xl font-black italic">+{(totalSaving / 1000).toFixed(0)}k</p>
               </div>
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl relative group">
            <div className="flex items-center gap-4 mb-10">
              <Zap className="text-accent-gold" size={24} />
              <h3 className="text-base font-black text-white uppercase tracking-[0.3em] italic">{t('JURISDICTION ALERTS', 'ALERTES DE JURIDICTION')}</h3>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-red-400/5 border border-red-500/20 rounded-2xl relative overflow-hidden group/alert">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                  <AlertCircle size={14} className="text-red-500" />
                </div>
                <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>NEW REGULATION</span>
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  <span>UK</span>
                </div>
                <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-tight">INCREASED AML REPORTING FOR TRANSACTIONS OVER £10K EFFECTIVE MAY 1ST.</p>
              </div>

               <div className="p-6 bg-emerald-400/5 border border-emerald-500/20 rounded-2xl relative overflow-hidden group/alert">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                  <Info size={14} className="text-emerald-500" />
                </div>
                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>OPPORTUNITY</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span>HK</span>
                </div>
                <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-tight">ZERO-TAX CREATIVE ASSET GATEWAY EXTENDED FOR 2026.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[2.5rem] border-white/10 text-center">
            <Scale className="mx-auto mb-6 text-accent-magenta" size={48} />
            <h4 className="text-base font-black text-white uppercase tracking-[0.2em] mb-4">{t('Legal Review Pending', 'Examen Légal en Attente')}</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed opacity-60 uppercase font-black italic mb-8">
              {t('ALL CALCULATIONS ARE SIMULATORY. FOR OFFICIAL SETTLEMENT, INITIATE LEGAL REVIEW HUB.', 'TOUS LES CALCULS SONT SIMULATOIRES. POUR LE RÈGLEMENT OFFICIEL, INITIER LE HUB D\'EXAMEN LÉGAL.')}
            </p>
            <button 
              onClick={() => onNotify(t('GENERATING COMPREHENSIVE FISCAL REPORT FOR PROJECT INDEX...', 'GÉNÉRATION DU RAPPORT FISCAL COMPLET POUR L\'INDICE DE PROJET...'))}
              className="w-full py-4 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.4em] hover:bg-white/5 transition-all rounded-xl"
            >
              {t('DOWNLOAD FISCAL REPORT', 'TÉLÉCHARGER LE RAPPORT FISCAL')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
