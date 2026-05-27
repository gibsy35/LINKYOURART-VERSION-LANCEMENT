
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Download,
  PieChart as PieChartIcon,
  BarChart3,
  Zap
} from 'lucide-react';
import { CONTRACTS, Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface Holding {
  contract: Contract;
  units: number;
  avgPrice: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
}

export const HoldingsView: React.FC<{ onNotify: (msg: string) => void; userContracts?: any[]; onViewChange: (view: any) => void }> = ({ onNotify, userContracts = [], onViewChange }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const formatNumber = React.useCallback((val: number): string => {
    return new Intl.NumberFormat(t('en-US', 'fr-FR')).format(val);
  }, [t]);
  const [holdingsCount, setHoldingsCount] = useState(3);
  const [transfersCount, setTransfersCount] = useState(5);

  const holdings: Holding[] = useMemo(() => {
    if (userContracts.length === 0) {
      return [];
    }
    
    return userContracts.map(uc => {
      const contract = CONTRACTS.find(c => c.id === uc.projectId) || {
        id: uc.projectId,
        name: uc.projectName || 'Unknown',
        issuerId: 'SYSTEM',
        unitValue: uc.entryPrice || 50,
        registryIndex: 'LYA-UNK',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        rarity: 'Common',
        category: 'Fine Art',
        availableUnits: 0,
        totalUnits: 0,
        growth: 0,
        scoreAlgo: 0,
        scorePro: 0,
        totalValue: 0,
        description: '',
        rights: [],
        pillars: [],
        stability: 0,
        scarcity: 0,
        status: 'LIVE',
        registryAddress: 'N/A',
        creationDate: new Date().toISOString(),
        lastAudit: 'N/A',
        maturityDate: 'N/A',
        totalScore: 0,
        milestones: [],
        contractType: 'Direct Rights',
        revenueSharePercentage: 0,
        jurisdiction: 'OFFSHORE',
        assetStatus: 'Completed'
      } as Contract;

      const units = uc.units || 0;
      const avgPrice = uc.entryPrice || 0;
      const currentValue = units * contract.unitValue;
      const profit = currentValue - (units * avgPrice);
      const profitPercent = (units * avgPrice) !== 0 ? (profit / (units * avgPrice)) * 100 : 0;

      return {
        contract,
        units,
        avgPrice,
        currentValue,
        profit,
        profitPercent
      };
    });
  }, [userContracts]);

  const totalValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalProfit = holdings.reduce((acc, h) => acc + h.profit, 0);
  const initialInvestment = totalValue - totalProfit;
  const totalProfitPercent = initialInvestment !== 0 ? (totalProfit / initialInvestment) * 100 : 0;

  const sectorData = useMemo(() => {
    if (holdings.length === 0) return [
      { name: t('No Data', 'Aucune Donnée'), value: 100, color: '#333333' }
    ];
    const sectors: Record<string, number> = {};
    holdings.forEach(h => {
      const cat = h.contract.category || t('Other', 'Autre');
      sectors[cat] = (sectors[cat] || 0) + h.currentValue;
    });
    const colors = ['#00E0FF', '#FFD700', '#FF00FF', '#00FF00', '#FF4500', '#9370DB'];
    return Object.entries(sectors).map(([name, value], i) => ({ 
      name, 
      value, 
      color: colors[i % colors.length] 
    }));
  }, [holdings, t]);

  const performanceHistory = [
    { date: '2026-01', portfolio: totalValue * 0.9, index: totalValue * 0.92 },
    { date: '2026-02', portfolio: totalValue * 0.95, index: totalValue * 0.94 },
    { date: '2026-03', portfolio: totalValue * 0.98, index: totalValue * 0.96 },
    { date: '2026-04', portfolio: totalValue, index: totalValue * 0.97 },
  ];

  const diversificationScore = useMemo(() => {
    if (holdings.length === 0) return { value: 0, label: t('N/A', 'N/A') };
    const uniqueSectors = new Set(holdings.map(h => h.contract.category)).size;
    const score = Math.min(100, (uniqueSectors / 6) * 100);
    return { value: score, label: score > 80 ? t('EXCELLENT', 'EXCELLENT') : score > 50 ? t('GOOD', 'BON') : t('LOW', 'FAIBLE') };
  }, [holdings, t]);

  return (
    <div className="space-y-6 pb-12 relative overflow-visible">
      <PageHeader 
        titleWhite={t('Wallet', 'Portefeuille')}
        titleAccent={t('Dashboard', 'Tableau de Bord')}
        description={t('CONSOLIDATED CUSTODY CENTER: CASH LIQUIDITY AND CONTRACTUAL ASSETS MANAGEMENT.', 'CENTRE DE GARDE CONSOLIDÉ : LIQUIDITÉ DE TRÉSORERIE ET GESTION DES ACTIFS CONTRACTUELS.')}
        accentColor="text-primary-cyan"
        compact={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-20">
        {/* Wallet Cash Summary */}
        <div className="lg:col-span-1 bg-surface-low/30 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Wallet size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> {t('SECURE CUSTODY', 'GARDE SÉCURISÉE')}
            </h3>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('CASH LIQUIDITY', 'LIQUIDITÉ DE TRÉSORERIE')}</p>
              <p className="text-5xl font-black font-headline tracking-tighter text-white">{formatPrice(12450.75)}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
             <button 
               onClick={() => onNotify(t('Opening Deposit Terminal...', 'Ouverture du Terminal de Dépôt...'))}
               className="py-3 bg-primary-cyan text-surface-dim text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl active:scale-95"
             >
               {t('DEPOSIT', 'DÉPOSER')}
             </button>
             <button 
               onClick={() => onNotify(t('Opening Withdrawal Protocol...', 'Ouverture du Protocole de Retrait...'))}
               className="py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-surface-dim transition-all active:scale-95"
             >
               {t('WITHDRAW', 'RETIRER')}
             </button>
          </div>
        </div>

        {/* Portfolio Value Summary */}
        <div className="lg:col-span-1 bg-surface-low/30 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
           <div>
             <h3 className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
               <Activity size={14} /> {t('MARKET VALUATION', 'VALORISATION DU MARCHÉ')}
             </h3>
             <div className="space-y-1">
               <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('ASSETS UNDER MGMT', 'ACTIFS SOUS GESTION')}</p>
               <p className="text-5xl font-black font-headline tracking-tighter text-white">{formatPrice(totalValue)}</p>
             </div>
           </div>
           <div className="mt-6 flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${totalProfit >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                {totalProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {totalProfitPercent.toFixed(2)}%
              </div>
              <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">REAL-TIME APY</span>
           </div>
        </div>

        {/* LYA Credits / Rewards */}
        <div className="lg:col-span-1 bg-surface-low/30 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-gold/5 rounded-full blur-3xl group-hover:bg-accent-gold/10 transition-colors" />
           <div className="relative z-10">
             <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
               <Zap size={14} /> {t('LYA REWARDS', 'RÉCOMPENSES LYA')}
             </h3>
             <div className="space-y-1">
               <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('AVAILABLE LYA UNITS', 'UNITÉS LYA DISPONIBLES')}</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-5xl font-black font-headline tracking-tighter text-white">{formatNumber(4850)}</p>
                 <span className="text-xs font-black text-accent-gold uppercase tracking-widest">UNITS</span>
               </div>
             </div>
           </div>
           <button className="mt-8 py-3 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-gold hover:text-surface-dim transition-all">
             {t('STAKE UNITS', 'STAKER LES UNITÉS')}
           </button>
        </div>

        {/* Action Center - Global */}
        <div className="lg:col-span-1 bg-primary-cyan border border-primary-cyan p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-center gap-6 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="relative z-10 text-center">
             <p className="text-[10px] font-black text-surface-dim uppercase tracking-[0.4em] mb-2">{t('UPGRADE ROLE', 'AMÉLIORER LE RÔLE')}</p>
             <h4 className="text-xl font-black text-surface-dim uppercase tracking-widest leading-none mb-6 italic">{t('BECOME PRO', 'DEVENIR PRO')}</h4>
             <button className="px-8 py-3 bg-surface-dim text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-white hover:text-surface-dim transition-all active:scale-95">
               {t('KNOW MORE', 'EN SAVOIR PLUS')}
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {holdings.length === 0 ? (
            <div className="bg-surface-low border border-white/5 p-16 md:p-24 text-center rounded-2xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/20 mb-6">
                <Wallet size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest mb-3">{t('No Assets Detected', 'Aucun Actif Détecté')}</h3>
              <p className="text-[10px] md:text-xs text-on-surface-variant max-w-sm uppercase font-bold tracking-[0.2em] opacity-40 mb-8 leading-relaxed">
                {t('Your creative portfolio is currently empty. Visit the Exchange to acquire your first contractual rights.', 'Votre portefeuille créatif est actuellement vide. Visitez le Centre d\'Échanges pour acquérir vos premiers droits contractuels.')}
              </p>
              <button 
                onClick={() => onViewChange('EXCHANGE')}
                className="px-8 py-3 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,224,255,0.2)] rounded-sm"
              >
                {t('Go to Exchange', 'Aller à l\'Échange')}
              </button>
            </div>
          ) : (
            <div className="bg-surface-low border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="font-headline font-bold uppercase tracking-widest text-sm md:text-base">{t('Holdings Breakdown', 'Répartition des Détentions')}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest">{holdings.length} {t('Contracts Held', 'Contrats Détenus')}</div>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] md:text-sm text-white">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-white/5">
                      <th className="pb-3 font-medium">{t('CONTRACT', 'CONTRAT')}</th>
                      <th className="pb-3 font-medium">{t('UNITS', 'UNITÉS')}</th>
                      <th className="pb-3 font-medium hidden md:table-cell">{t('AVG PRICE', 'PRIX MOY.')}</th>
                      <th className="pb-3 font-medium">{t('MARKET PRICE', 'PRIX MARCHÉ')}</th>
                      <th className="pb-3 font-medium text-right">{t('VALUE', 'VALEUR')}</th>
                      <th className="pb-3 font-medium text-right">{t('P/L', 'P/L')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {holdings.slice(0, holdingsCount).map((h) => (
                      <tr key={h.contract.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-surface-dim border border-white/5 overflow-hidden">
                              <img src={h.contract.image} alt={h.contract.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <div className="font-bold group-hover:text-primary-cyan transition-colors text-xs md:text-sm">{h.contract.name}</div>
                              <div className="text-[9px] md:text-[10px] text-on-surface-variant uppercase tracking-widest">{h.contract.registryIndex}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">{h.units} <span className="hidden sm:inline">{t('Units', 'Unités')}</span></td>
                        <td className="py-4 text-on-surface-variant hidden md:table-cell">{formatPrice(h.avgPrice)}</td>
                        <td className="py-4 text-primary-cyan">{formatPrice(h.contract.unitValue)}</td>
                        <td className="py-4 text-right font-bold">{formatPrice(h.currentValue)}</td>
                        <td className={`py-4 text-right font-bold ${h.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {h.profit >= 0 ? '+' : ''}{formatPrice(h.profit)}
                          <div className="text-[10px] md:text-xs opacity-60">{h.profitPercent.toFixed(2)}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {holdings.length > 0 && (
                <div className="px-6 pb-6 border-t border-white/5 pt-6">
                  {holdingsCount < holdings.length ? (
                    <button 
                      onClick={() => setHoldingsCount(prev => prev + 3)}
                      className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
                    >
                      {t('Load More Holdings', 'Voir Plus de Détentions')} <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onNotify(t('All holding details are fully loaded and active.', 'Tous les détails de détention actifs sont entièrement chargés.'))}
                      className="w-full py-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white/40 transition-all flex items-center justify-center gap-2 rounded-sm"
                    >
                      {t('All Assets Loaded', 'Toutes les Détentions Chargées')} <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Portfolio Performance Attribution (Only if data exists) */}
          {holdings.length > 0 && (
            <div className="bg-surface-low border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-bold font-headline uppercase tracking-widest flex items-center gap-3">
                  <PieChartIcon size={20} className="text-primary-cyan" />
                  {t('Performance Attribution', 'Attribution de Performance')}
                </h2>
                <div className="flex items-center gap-2 bg-surface-dim px-3 py-1 rounded-lg border border-white/5 group relative cursor-help">
                  <Zap size={14} className="text-accent-gold" />
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('Strategic Yield: +14.2%', 'Rendement Stratégique : +14,2 %')}</span>
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-surface-high border border-white/10 text-[9px] text-on-surface-variant uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl backdrop-blur-xl">
                    {t('This metric represents the performance excédentaire de vos droits relative to the market benchmark, adjusted for risk.', 'Cette mesure représente le performance excédentaire de vos droits par rapport à l\'indice de référence du marché, ajusté au risque.')}
                  </div>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">{t('Sector Allocation', 'Allocation par Secteur')}</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {sectorData.map((sector, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }} />
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{sector.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">{t('Portfolio vs Market Index', 'Portfolio vs Indice du Marché')}</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceHistory}>
                        <defs>
                          <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="portfolio" stroke="#00E0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPort)" />
                        <Area type="monotone" dataKey="index" stroke="#ffffff20" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t('Outperformance', 'Surperformance')}</div>
                      <div className="text-lg font-black text-emerald-400 font-headline">+12.8%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t('Risk-Adjusted Ratio', 'Ratio Ajusté au Risque')}</div>
                      <div className="text-lg font-black text-primary-cyan font-headline">2.45</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
            <div className="bg-surface-low border border-white/5 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest text-white">{t('Contract Allocation', 'Allocation des Contrats')}</h2>
                <div className="text-right">
                  <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t('Diversification', 'Diversification')}</div>
                  <div className={`text-sm font-black uppercase tracking-tight ${diversificationScore.value > 50 ? 'text-emerald-400' : 'text-accent-gold'}`}>{diversificationScore.label} ({diversificationScore.value.toFixed(0)}%)</div>
                </div>
              </div>
              <div className="space-y-6">
                {holdings.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant opacity-40 uppercase text-[10px] font-bold tracking-widest">
                    {t('Awaiting Assets...', 'En attente d\'actifs...')}
                  </div>
                ) : holdings.map((h, i) => (
                  <div key={h.contract.id} className="space-y-2">
                    <div className="flex justify-between text-[10px] md:text-xs uppercase tracking-widest">
                      <span className="text-on-surface-variant truncate max-w-[70%]">{h.contract.name}</span>
                      <span className="text-primary-cyan font-bold">{((h.currentValue / Math.max(totalValue, 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 overflow-hidden rounded-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(h.currentValue / Math.max(totalValue, 1)) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setHoldingsCount(prev => prev + 2)}
                className="w-full mt-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-xl"
              >
                {t('Expand Allocation', 'Étendre l\'Allocation')} <ChevronRight size={14} />
              </button>
            </div>

            <div className="bg-surface-low border border-white/5 p-6 rounded-2xl">
              <h2 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-6 text-white">{t('Recent Transfers', 'Transferts Récents')}</h2>
              <div className="space-y-4">
                {[...Array(transfersCount)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${i === 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                        {i === 0 ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                      </div>
                      <div>
                        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">{i === 0 ? t('Received', 'Reçu') : t('Sent', 'Envoyé')}</div>
                        <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest">0x{Math.random().toString(16).slice(2, 8)}...</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] md:text-xs font-mono font-bold text-on-surface">{formatPrice(2450)}</div>
                      <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest">14:22:01</div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setTransfersCount(prev => prev + 3)}
                className="w-full mt-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-xl"
              >
                {t('Load More Transfers', 'Voir Plus de Transferts')} <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => onNotify('DOWNLOADING FULL TRANSACTION HISTORY...')}
                className="w-full mt-4 py-3 border border-white/10 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-2 active:scale-95 rounded-xl"
              >
                {t('Full Transaction History', 'Historique Complet des Transactions')} <ExternalLink size={10} />
              </button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20 rounded-xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-2 text-white">{t('Secure Professional Custody', 'Garde Professionnelle Sécurisée')}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-md">
                {t('Your contracts are secured in a multi-signature cold storage vault. Settlement is guaranteed by the LYA Protocol.', 'Vos contrats sont sécurisés dans un coffre-fort de stockage à froid multi-signature. Le règlement est garanti par le protocole LYA.')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden group rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-accent-gold/10 text-accent-gold border border-accent-gold/20 rounded-xl">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-2 text-white">{t('Performance Generation', 'Génération de Performance')}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-md">
                {t('Your holdings are currently generating an estimated 8.4% progression through automated creative rights participation.', "Vos avoirs progressent actuellement d'une valeur estimée à 8,4 % grâce à la participation automatisée aux droits créatifs.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
