
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

export const HoldingsView: React.FC<{ onNotify: (msg: string) => void }> = ({ onNotify }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [holdingsCount, setHoldingsCount] = useState(4);
  const [transfersCount, setTransfersCount] = useState(5);

  const holdings: Holding[] = CONTRACTS.slice(0, holdingsCount).map((contract, i) => {
    // Safer units generation for more than 4 contracts
    const defaultUnits = [12.5, 1.0, 50, 100];
    const units = defaultUnits[i % defaultUnits.length]; 
    const avgPrice = contract.unitValue * (0.9 + Math.random() * 0.2);
    const currentValue = (units || 0) * (contract.unitValue || 0);
    const profit = currentValue - ((units || 0) * (avgPrice || 0));
    const profitPercent = (units || 0) * (avgPrice || 0) !== 0 ? (profit / ((units || 0) * (avgPrice || 0))) * 100 : 0;

    return {
      contract,
      units,
      avgPrice,
      currentValue,
      profit,
      profitPercent
    };
  });

  const totalValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalProfit = holdings.reduce((acc, h) => acc + h.profit, 0);
  const initialInvestment = totalValue - totalProfit;
  const totalProfitPercent = initialInvestment !== 0 ? (totalProfit / initialInvestment) * 100 : 0;

  const sectorData = [
    { name: t('Digital Art', 'Art Numérique'), value: 45, color: '#00E0FF' },
    { name: t('Music', 'Musique'), value: 25, color: '#FFD700' },
    { name: t('Fine Art', 'Beaux-Arts'), value: 20, color: '#FF00FF' },
    { name: t('Film', 'Cinéma'), value: 10, color: '#00FF00' },
  ];

  const performanceHistory = [
    { date: '2026-01', portfolio: 100, index: 100 },
    { date: '2026-02', portfolio: 112, index: 105 },
    { date: '2026-03', portfolio: 108, index: 103 },
    { date: '2026-04', portfolio: 124, index: 110 },
  ];

  const diversificationScore = useMemo(() => {
    const uniqueSectors = new Set(holdings.map(h => h.contract.category)).size;
    const score = Math.min(100, (uniqueSectors / 6) * 100);
    return { value: score, label: score > 80 ? t('EXCELLENT', 'EXCELLENT') : score > 50 ? t('GOOD', 'BON') : t('LOW', 'FAIBLE') };
  }, [holdings, t]);

  return (
    <div className="space-y-6 pb-20 relative overflow-visible">
      <PageHeader 
        titleWhite={t('Contract', 'CONTRACT')}
        titleAccent={t('Holdings', 'HOLDINGS')}
        description={t('INDIVIDUAL PROJECT REPOSITORY. REAL-TIME TRACKING OF CREATIVE RIGHTS POSITIONS AND FISCAL GROWTH.', 'RÉPERTOIRE DE PROJETS INDIVIDUELS. SUIVI EN TEMPS RÉEL DES POSITIONS DE DROITS CRÉATIFS ET DE LA CROISSANCE FISCALE.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20 px-6 md:px-12">
        <div className="flex flex-col items-end gap-4">
          <button 
            onClick={() => onNotify('GENERATING PORTFOLIO PERFORMANCE REPORT...')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2 rounded-xl backdrop-blur-xl"
          >
            <Download size={14} className="text-primary-cyan" />
            {t('Download Report', 'Télécharger le Rapport')}
          </button>
        </div>
      </div>

      <div className="bg-surface-low border border-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full lg:w-auto mx-6 md:mx-12">
          <div>
            <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest mb-1">{t('Total Holdings Value', 'Valeur Totale des Détentions')}</div>
            <div className="text-xl md:text-2xl font-black text-on-surface font-headline">{formatPrice(totalValue)}</div>
          </div>
          <div className="h-12 w-[1px] bg-white/5 hidden sm:block"></div>
          <div>
            <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest mb-1">{t('Aggregate P/L', 'P/L Global')}</div>
            <div className={`text-lg md:text-xl font-black font-headline ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatPrice(totalProfit)}
              <span className="text-xs ml-2">({totalProfitPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 md:px-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Portfolio Performance Attribution */}
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
                  {t('This metric represents the excess return of your portfolio relative to the market benchmark, adjusted for risk.', 'Cette mesure représente le rendement excédentaire de votre portefeuille par rapport à l\'indice de référence du marché, ajusté au risque.')}
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

          <div className="bg-surface-low border border-white/5 overflow-hidden">
          <div className="bg-surface-highest px-6 py-4 flex justify-between items-center">
            <h2 className="font-headline font-bold uppercase tracking-widest text-sm md:text-base">{t('Holdings Breakdown', 'Répartition des Détentions')}</h2>
            <div className="flex items-center gap-4">
              <div className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-widest">{holdings.length} {t('Contracts Held', 'Contrats Détenus')}</div>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] md:text-sm">
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
                {holdings.map((h) => (
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
          {holdingsCount < CONTRACTS.length && (
            <div className="px-6 pb-6 border-t border-white/5 pt-6">
              <button 
                onClick={() => setHoldingsCount(prev => prev + 4)}
                className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
              >
                {t('Load More Holdings', 'Voir Plus de Détentions')} <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
          <div className="bg-surface-low border border-white/5 p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest">{t('Contract Allocation', 'Allocation des Contrats')}</h2>
              <div className="text-right">
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t('Diversification', 'Diversification')}</div>
                <div className={`text-sm font-black uppercase tracking-tight ${diversificationScore.value > 50 ? 'text-emerald-400' : 'text-accent-gold'}`}>{diversificationScore.label} ({diversificationScore.value.toFixed(0)}%)</div>
              </div>
            </div>
            <div className="space-y-6">
              {holdings.map((h, i) => (
                <div key={h.contract.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] md:text-xs uppercase tracking-widest">
                    <span className="text-on-surface-variant">{h.contract.name}</span>
                    <span className="text-primary-cyan font-bold">{((h.currentValue / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(h.currentValue / totalValue) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setHoldingsCount(prev => prev + 2)}
              className="w-full mt-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              {t('Expand Allocation', 'Étendre l\'Allocation')} <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-surface-low border border-white/5 p-6">
            <h2 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-6">{t('Recent Transfers', 'Transferts Récents')}</h2>
            <div className="space-y-4">
              {[...Array(transfersCount)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${i === 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                      {i === 0 ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{i === 0 ? t('Received', 'Reçu') : t('Sent', 'Envoyé')}</div>
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
              className="w-full mt-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              {t('Load More Transfers', 'Voir Plus de Transferts')} <ChevronRight size={14} />
            </button>
            <button 
              onClick={() => onNotify('DOWNLOADING FULL TRANSACTION HISTORY...')}
              className="w-full mt-4 py-3 border border-white/10 text-[10px] md:text-xs uppercase tracking-[0.2em] font-black hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {t('Full Transaction History', 'Historique Complet des Transactions')} <ExternalLink size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-2">{t('Secure Professional Custody', 'Garde Professionnelle Sécurisée')}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-md">
                {t('Your contracts are secured in a multi-signature cold storage vault. Settlement is guaranteed by the LYA Protocol.', 'Vos contrats sont sécurisés dans un coffre-fort de stockage à froid multi-signature. Le règlement est garanti par le protocole LYA.')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface-low border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-headline uppercase tracking-widest mb-2">{t('Yield Generation', 'Génération de Rendement')}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-md">
                {t('Your holdings are currently generating an estimated 8.4% APY through automated creative rights participation.', 'Vos avoirs génèrent actuellement un rendement annuel estimé à 8,4 % grâce à la participation automatisée aux droits créatifs.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
