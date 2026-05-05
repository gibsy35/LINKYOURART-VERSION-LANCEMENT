
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  RefreshCw, 
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Award,
  ExternalLink,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Droplets,
  Zap,
  Layers,
  ArrowRight,
  Star
} from 'lucide-react';
import { CONTRACTS, Contract, Order, Activity, LYA_UNIT_VALUE } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Ticker } from '../components/ui/Ticker';
import { ContractCard } from '../components/ContractCard';
import { InfoTooltip } from '../components/InfoTooltip';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { CandlestickChart } from '../components/ui/CandlestickChart';

import { BreakingNewsTicker } from '../components/BreakingNewsTicker';

interface ExchangeViewProps {
  orders: Order[];
  activities: Activity[];
  onNotify: (msg: string) => void;
  onOpenTrade: (contract: Contract, type: 'BUY' | 'SELL') => void;
  onSelectContract: (contract: Contract) => void;
  onCancelOrder: (id: string) => void;
  onExportOrders: () => void;
  rarityFilter: string;
  setRarityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  orderTypeFilter: 'ALL' | 'BUY' | 'SELL';
  setOrderTypeFilter: (val: 'ALL' | 'BUY' | 'SELL') => void;
  orderContractFilter: string;
  setOrderContractFilter: (val: string) => void;
  verificationLevel: 'Standard' | 'Expert';
  onOpenVerification: () => void;
  watchlist: string[];
  onToggleWatchlist: (e: React.MouseEvent, contractId: string) => void;
  comparisonList: string[];
  onToggleComparison: (id: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  jurisdictionFilter: string;
  setJurisdictionFilter: (val: string) => void;
  onOpenIssuerProfile: (id: string) => void;
  onOpenOffer: (contract: Contract) => void;
  onOpenTransfer: (contract: Contract) => void;
  user: any;
  usageStats: any;
}

import { useMarketData } from '../hooks/useMarketData';

import { downloadAsCSV } from '../utils/download';

export const ExchangeView: React.FC<ExchangeViewProps> = ({
  orders,
  activities,
  onNotify,
  onOpenTrade,
  onSelectContract,
  onCancelOrder,
  rarityFilter,
  setRarityFilter,
  statusFilter,
  setStatusFilter,
  orderTypeFilter,
  setOrderTypeFilter,
  orderContractFilter,
  setOrderContractFilter,
  verificationLevel,
  onOpenVerification,
  watchlist,
  onToggleWatchlist,
  comparisonList,
  onToggleComparison,
  categoryFilter,
  setCategoryFilter,
  jurisdictionFilter,
  setJurisdictionFilter,
  onOpenIssuerProfile,
  onOpenOffer,
  onOpenTransfer,
  user,
  usageStats
}) => {
  const { t } = useTranslation();
  const { formatPrice, formatLYA } = useCurrency();
  const { contracts, marketStats, lastUpdate } = useMarketData();
  const [activeTab, setActiveTab] = useState<'overview' | 'predictive' | 'exchange'>('exchange');

  const onExportOrders = () => {
    downloadAsCSV(orders, 'LYA_Exchange_Orders_Export');
    onNotify(t('EXPORTING ORDER BOOK DATA...', 'EXPORTATION DES DONNÉES DU CARNET D\'ORDRES...'));
  };
  const [indexTimeframe, setIndexTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [selectedOrderBookContractId, setSelectedOrderBookContractId] = useState(contracts[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'SCORE_DESC' | 'SCORE_ASC'>('SCORE_DESC');
  const pageSize = 10;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [rarityFilter, statusFilter, sortOrder]);

  const depthData = useMemo(() => {
    const contractOrders = orders.filter(o => o.contractId === selectedOrderBookContractId && o.status === 'OPEN');
    const priceMap: Record<number, { price: string, buy: number, sell: number }> = {};
    
    contractOrders.forEach(order => {
      const price = (order.price / LYA_UNIT_VALUE).toFixed(2);
      const priceNum = parseFloat(price);
      if (!priceMap[priceNum]) {
        priceMap[priceNum] = { price, buy: 0, sell: 0 };
      }
      if (order.type === 'BUY') {
        priceMap[priceNum].buy += order.volume;
      } else {
        priceMap[priceNum].sell += order.volume;
      }
    });

    const data = Object.values(priceMap).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    
    // If no data, provide some mock data for the selected contract to ensure the chart isn't empty
    if (data.length === 0) {
      const contract = contracts.find(a => a.id === selectedOrderBookContractId);
      const basePrice = contract?.unitValue || 50;
      const lyaBase = basePrice / LYA_UNIT_VALUE;
      
      return [
        { price: (lyaBase - 0.01).toFixed(3), buy: 450, sell: 0 },
        { price: (lyaBase - 0.005).toFixed(3), buy: 300, sell: 0 },
        { price: (lyaBase + 0.005).toFixed(3), buy: 0, sell: 250 },
        { price: (lyaBase + 0.01).toFixed(3), buy: 0, sell: 550 },
      ];
    }
    
    return data;
  }, [orders, selectedOrderBookContractId, contracts]);

  const orderBookData = useMemo(() => {
    const contract = contracts.find(c => c.id === selectedOrderBookContractId);
    const basePrice = contract?.unitValue || 50;
    const lyaBase = basePrice / LYA_UNIT_VALUE;
    
    // Generate realistic order book depth based on contract volatility
    const generateOrders = (type: 'BUY' | 'SELL') => {
      return [...Array(6)].map((_, i) => {
        const offset = (i + 1) * 0.002;
        const price = type === 'BUY' ? lyaBase - offset : lyaBase + offset;
        const volume = Math.floor(Math.random() * 500) + 50;
        return {
          price: price.toFixed(3),
          volume,
          total: (price * volume * LYA_UNIT_VALUE).toFixed(2),
          depth: Math.random() * 80 + 20
        };
      }).sort((a, b) => type === 'BUY' ? parseFloat(b.price) - parseFloat(a.price) : parseFloat(a.price) - parseFloat(b.price));
    };

    const bids = generateOrders('BUY');
    const asks = generateOrders('SELL').reverse(); // Asks usually shown high to low in UI
    
    const spread = parseFloat(asks[asks.length - 1].price) - parseFloat(bids[0].price);
    
    return { bids, asks, spread: spread.toFixed(4), currentPrice: lyaBase.toFixed(3) };
  }, [selectedOrderBookContractId, contracts]);

  const indexData = useMemo(() => {
    const base = 1000;
    const points = indexTimeframe === '1D' ? 24 : indexTimeframe === '1W' ? 7 : indexTimeframe === '1M' ? 30 : 52;
    
    return Array.from({ length: points }).map((_, i) => {
      const open = base + Math.sin(i * 0.5) * 50 + (i * 2);
      const close = open + (Math.random() - 0.5) * 40;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      return {
        time: i.toString(),
        open,
        close,
        high,
        low
      };
    });
  }, [indexTimeframe]);

  const filteredContracts = useMemo(() => {
    const filtered = contracts.filter(contract => {
      const rarityMatch = rarityFilter === 'ALL' || contract.rarity === rarityFilter;
      const statusMatch = statusFilter === 'ALL' || contract.status === statusFilter;
      const categoryMatch = categoryFilter === 'ALL' || contract.category === categoryFilter;
      const jurisdictionMatch = jurisdictionFilter === 'ALL' || contract.jurisdiction === jurisdictionFilter;
      return rarityMatch && statusMatch && categoryMatch && jurisdictionMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'SCORE_DESC') return b.totalScore - a.totalScore;
      if (sortOrder === 'SCORE_ASC') return a.totalScore - b.totalScore;
      return 0;
    });
  }, [rarityFilter, statusFilter, categoryFilter, jurisdictionFilter, sortOrder, contracts]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [predictiveTrials, setPredictiveTrials] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handlePredict = () => {
    if (predictiveTrials >= 3) {
      onNotify(t('3/3 TRIALS REACHED. UPGRADE TO PRO FOR UNLIMITED ANALYTICS.', '3/3 ESSAIS ATTEINTS. PASSEZ AU PRO POUR DES ANALYSES ILLIMITÉES.'));
      return;
    }
    
    setIsPredicting(true);
    setTimeout(() => {
      setPredictiveTrials(prev => prev + 1);
      
      // Select 5 high-performing contracts for suggestions
      const suggestions = [...contracts]
        .sort((a, b) => (b.growth + b.totalScore/10) - (a.growth + a.totalScore/10))
        .slice(0, 5);

      setPredictionResult({
        forecast: '+14.2%',
        confidence: '94.2%',
        timeframe: '90 Days',
        sentiment: 'Strong Buy',
        suggestions: suggestions
      });
      setIsPredicting(false);
      onNotify(t(`PREDICTION COMPLETE (${predictiveTrials + 1}/3 TRIALS)`, `PRÉDICTION TERMINÉE (${predictiveTrials + 1}/3 ESSAIS)`));
    }, 2000);
  };

  const filteredOrders = orders.filter(order => {
    const typeMatch = orderTypeFilter === 'ALL' || order.type === orderTypeFilter;
    const contractMatch = orderContractFilter === 'ALL' || order.contractId === orderContractFilter;
    return typeMatch && contractMatch;
  });

  return (
    <div className="space-y-12 pb-20">
      <PageHeader 
        titleWhite={t('Market', 'ÉCHANGE')}
        titleAccent={t('Exchange Center', 'PROFESSIONNEL')}
        description={t('AUTHORIZED P2P SETTLEMENT & LIQUIDITY TERMINAL', 'TERMINAL DE LIQUIDITÉ & RÈGLEMENT P2P AUTORISÉ')}
        accentColor="text-primary-cyan"
      />

      <div className="space-y-12 px-4 md:px-10 lg:px-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 sm:gap-8 mb-8 sm:mb-12 relative z-20">
            <div className="flex gap-4 sm:gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === 'overview' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {t('Market Overview', 'Vue d\'Ensemble')}
                {activeTab === 'overview' && <motion.div layoutId="exchangeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.4)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('predictive')}
                className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <Zap size={14} className={activeTab === 'predictive' ? 'text-primary-cyan' : 'text-on-surface-variant'} />
                {t('Predictive Analytics', 'Analyses Prédictives')}
                {activeTab === 'predictive' && <motion.div layoutId="exchangeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.4)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('exchange')}
                className={`pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'exchange' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <RefreshCw size={14} className={activeTab === 'exchange' ? 'text-primary-cyan' : 'text-on-surface-variant'} />
                {t('Secondary Market', 'Marché Secondaire')}
                {activeTab === 'exchange' && <motion.div layoutId="exchangeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.4)]" />}
              </button>
            </div>
        </div>
            
        {activeTab === 'exchange' && (
          <Fragment>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="relative group rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/10 to-transparent opacity-50 rounded-2xl" />
                  <div className="relative bg-surface-low/30 backdrop-blur-2xl border-l-2 md:border-l-4 border-primary-cyan p-4 md:p-5 lg:p-10 flex flex-col justify-center min-h-[100px] md:min-h-[140px] lg:min-h-[200px] shadow-2xl border border-white/10 rounded-2xl group-hover:border-primary-cyan/30 transition-all duration-500">
                    <div className="text-[7px] md:text-[9px] lg:text-[12px] text-primary-cyan uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black opacity-70 mb-1 lg:mb-4 flex items-center gap-1 md:gap-2">
                      {t('Protocol Unit Valuation', 'Évaluation Unité Protocole')}
                      <span className="px-1.5 py-0.5 bg-primary-cyan/20 text-primary-cyan text-[8px] font-black uppercase tracking-widest border border-primary-cyan/30 rounded-sm">Protocol</span>
                      <InfoTooltip position="top" title="Protocol Unit Valuation" content="The standard valuation assigned to one unit of an indexed contract. All unit exchanges are settled via this baseline." />
                    </div>
                    <div className="flex items-baseline gap-1.5 lg:gap-3">
                  <h3 className="text-xs md:text-lg lg:text-2xl font-bold font-headline text-on-surface tracking-tighter truncate">1 UNIT = {formatLYA()}</h3>
                    </div>
                  </div>
                </div>
                  
                  <div className="relative group rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent opacity-50 rounded-2xl" />
                    <div className="relative bg-surface-low/30 backdrop-blur-2xl border-l-2 md:border-l-4 border-accent-gold p-4 md:p-5 lg:p-10 flex flex-col justify-center min-h-[100px] md:min-h-[140px] lg:min-h-[200px] shadow-2xl border border-white/10 rounded-2xl group-hover:border-accent-gold/30 transition-all duration-500">
                      <div className="text-[7px] md:text-[9px] lg:text-[12px] text-accent-gold uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black opacity-70 mb-1 lg:mb-4 flex items-center">
                        {t('Total Market Cap', 'Capitalisation Totale')}
                        <InfoTooltip position="top" title="Total Market Cap" content="The aggregate value of all creative contracts currently indexed on the platform." />
                      </div>
                      <div className="flex items-baseline gap-1 lg:gap-3">
                        <h3 className="text-sm md:text-lg lg:text-3xl font-bold font-headline text-on-surface tracking-tighter truncate">${marketStats.totalCap?.toLocaleString() || '0'}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="relative group rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-50 rounded-2xl" />
                    <div className="relative bg-surface-low/30 backdrop-blur-2xl border-l-2 md:border-l-4 border-emerald-400 p-4 md:p-5 lg:p-10 flex flex-col justify-center min-h-[100px] md:min-h-[140px] lg:min-h-[200px] shadow-2xl border border-white/10 rounded-2xl group-hover:border-emerald-400/30 transition-all duration-500">
                      <div className="text-[7px] md:text-[9px] lg:text-[12px] text-emerald-400 uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black opacity-70 mb-1 lg:mb-4 flex items-center">
                        {t('P2P Liquidity', 'Liquidité P2P')}
                        <InfoTooltip position="top" title="P2P Liquidity" content="Total number of contract units currently available for direct peer-to-peer exchange." />
                      </div>
                      <div className="flex items-baseline gap-1 lg:gap-3">
                        <h3 className="text-sm md:text-lg lg:text-3xl font-bold font-headline text-on-surface tracking-tighter truncate">{marketStats.totalAvailable?.toLocaleString() || '0'} Units</h3>
                      </div>
                    </div>
                  </div>

                  <div className="relative group rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 rounded-2xl" />
                    <div className="relative bg-surface-low/30 backdrop-blur-2xl border-l-2 md:border-l-4 border-white/20 p-4 md:p-5 lg:p-10 flex flex-col justify-center min-h-[100px] md:min-h-[140px] lg:min-h-[200px] shadow-2xl border border-white/10 rounded-2xl group-hover:border-white/30 transition-all duration-500">
                      <div className="text-[7px] md:text-[9px] lg:text-[12px] text-on-surface-variant uppercase tracking-[0.2em] lg:tracking-[0.3em] font-black opacity-70 mb-1 lg:mb-4 flex items-center">
                        {t('Avg. Growth', 'Croissance Moy.')}
                        <InfoTooltip position="top" title="Avg. Growth" content="The weighted average performance of all creative assets over the last 24 hours." />
                      </div>
                      <div className="flex items-baseline gap-1 lg:gap-3">
                        <h3 className="text-sm md:text-lg lg:text-3xl font-bold font-headline text-emerald-400 tracking-tighter truncate">+{marketStats.avgGrowth.toFixed(1)}%</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-xl text-[10px] md:text-xs leading-relaxed opacity-70 mt-8 uppercase tracking-[0.3em] font-black italic">
                  {t('LINKYOURART STANDARDIZES CREATIVE VALUE. EVERY PROJECT IS INDEXED INTO CONTRACT UNITS, EACH BACKED BY PROFESSIONAL CAPACITY.', `LINKYOURART STANDARDISE LA VALEUR CRÉATIVE. CHAQUE PROJET EST INDEXÉ EN UNITÉS DE CONTRAT, CHACUNE ADOSSÉE À UNE CAPACITÉ PROFESSIONNELLE DE ${LYA_UNIT_VALUE}$.`)}
                </p>
              </Fragment>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[240px]">
                    <div>
                      <div className="text-[10px] text-primary-cyan uppercase tracking-[0.3em] font-black mb-4">Market Sentiment</div>
                      <h3 className="text-4xl font-black font-headline text-on-surface tracking-tighter">BULLISH</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                        <span>Fear Index: 12</span>
                        <span>Greed Index: 88</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-[10px] text-accent-gold uppercase tracking-[0.3em] font-black">Global Index Performance</div>
                      <div className="flex gap-2">
                        {['1D', '1W', '1M', '1Y'].map(r => (
                          <button 
                            key={r} 
                            onClick={() => setIndexTimeframe(r as any)}
                            className={`px-3 py-1 border rounded-lg text-[10px] font-black transition-colors ${
                              indexTimeframe === r 
                                ? 'bg-primary-cyan text-surface-dim border-primary-cyan' 
                                : 'bg-white/5 border-white/10 hover:border-primary-cyan'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[140px] w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden p-4">
                      <CandlestickChart data={indexData} height={110} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'predictive' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan/30" />
                  
                  {!predictionResult ? (
                    <>
                      <div className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-cyan/20">
                        <Zap className={`w-10 h-10 text-primary-cyan ${isPredicting ? 'animate-pulse' : ''}`} />
                      </div>
                      <h2 className="text-3xl font-black font-headline text-on-surface tracking-tighter mb-4">LYA PREDICTIVE ENGINE</h2>
                      <p className="text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed mb-8">
                        Our neural network analyzes millions of data points across global creative registries to forecast contract performance with expert accuracy.
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <button 
                          onClick={handlePredict}
                          disabled={isPredicting}
                          className="px-8 py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,224,255,0.3)] disabled:opacity-50"
                        >
                          {isPredicting ? t('Analyzing Market Data...', 'Analyse des Données Marché...') : t('Run Neural Forecast', 'Lancer la Prévision Neurale')}
                        </button>
                        <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                          {t('Trials Remaining:', 'Essais Restants :')} <span className="text-primary-cyan font-bold">{3 - predictiveTrials}/3</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{predictionResult.sentiment}</span>
                        </div>
                        <h2 className="text-5xl font-black font-headline text-white tracking-tighter italic">
                          {predictionResult.forecast} <span className="text-primary-cyan text-2xl not-italic">GROWTH</span>
                        </h2>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          Neural analysis indicates a strong upward trend for the selected registry index over the next {predictionResult.timeframe}.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Confidence</div>
                            <div className="text-xl font-black text-primary-cyan">{predictionResult.confidence}</div>
                          </div>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Timeframe</div>
                            <div className="text-xl font-black text-white">{predictionResult.timeframe}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPredictionResult(null)}
                          className="text-xs font-black text-primary-cyan uppercase tracking-widest hover:text-white transition-colors"
                        >
                          ← {t('New Analysis', 'Nouvelle Analyse')}
                        </button>
                      </div>
                      <div className="space-y-6">
                        <div className="relative aspect-video bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/20 via-transparent to-accent-pink/20" />
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="w-24 h-24 border-2 border-primary-cyan/30 rounded-full flex items-center justify-center"
                          >
                            <Zap className="w-12 h-12 text-primary-cyan" />
                          </motion.div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '94.2%' }}
                                className="h-full bg-primary-cyan"
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">
                              <span>Data Integrity</span>
                              <span>94.2%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em]">{t('Recommended Allocations', 'Allocations Recommandées')}</h3>
                          <div className="grid grid-cols-1 gap-2">
                              {predictionResult.suggestions.map((s: any) => (
                                <div 
                                  key={s.id} 
                                  className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary-cyan/30 transition-all"
                                  onClick={() => onSelectContract(s)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-cyan/10 rounded-lg flex items-center justify-center text-primary-cyan text-[10px] font-black">
                                      {s.category.substring(0, 2)}
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-black text-white uppercase tracking-widest">{s.name}</div>
                                      <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Score: {s.totalScore}/1000</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+{s.growth}%</div>
                                      <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Est. Yield</div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleWatchlist(e, s.id);
                                      }}
                                      className={`p-2 rounded-lg transition-all ${
                                        watchlist.includes(s.id) 
                                          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' 
                                          : 'bg-white/5 text-on-surface-variant hover:text-white border border-transparent'
                                      }`}
                                    >
                                      <Star size={14} fill={watchlist.includes(s.id) ? "currentColor" : "none"} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

        {activeTab === 'exchange' && (
          <Fragment>
            <div className="flex flex-col lg:flex-row gap-8 items-end justify-between mb-8">
              <div className="flex flex-wrap items-end gap-4 w-full">
                <div className="space-y-2 min-w-[140px]">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-50 px-1">Category</span>
                  <div className="relative">
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-surface-low/50 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 appearance-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all rounded-xl"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Fine Art">Fine Art</option>
                      <option value="Film">Film</option>
                      <option value="TV Series">TV Series</option>
                      <option value="Music">Music</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Photography">Photography</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Podcast">Podcast</option>
                      <option value="Performing Arts">Performing Arts</option>
                      <option value="Gastronomy">Gastronomy</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="space-y-2 min-w-[140px]">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-50 px-1">Jurisdiction</span>
                  <div className="relative">
                    <select 
                      value={jurisdictionFilter}
                      onChange={(e) => setJurisdictionFilter(e.target.value)}
                      className="w-full bg-surface-low/50 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 appearance-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all rounded-xl"
                    >
                      <option value="ALL">All Jurisdictions</option>
                      <option value="EU">EU (MiCA)</option>
                      <option value="US">US (SEC)</option>
                      <option value="UK">UK (FCA)</option>
                      <option value="CH">CH (FINMA)</option>
                      <option value="SG">SG (MAS)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="space-y-2 min-w-[140px]">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-50 px-1">Status</span>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-surface-low/50 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 appearance-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all rounded-xl"
                    >
                      <option value="ALL">All Status</option>
                      <option value="LIVE">Active</option>
                      <option value="AUDIT">In Audit</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="space-y-2 min-w-[160px]">
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-50 px-1">Sort By Score</span>
                  <div className="relative">
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full bg-surface-low/50 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 appearance-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all rounded-xl"
                    >
                      <option value="SCORE_DESC">Score: High to Low</option>
                      <option value="SCORE_ASC">Score: Low to High</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={12} />
                  </div>
                </div>
              </div>
            </div>

      {/* Contract Grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedContracts.map(contract => (
            <ContractCard 
              key={contract.id} 
              contract={contract} 
              onSelect={(c) => onSelectContract(c)}
              onTrade={(c, type) => {
                if (type === 'BUY') onOpenOffer(c);
                else onOpenTransfer(c);
              }}
              onToggleWatchlist={onToggleWatchlist}
              isWatchlisted={watchlist.includes(contract.id)}
              comparisonList={comparisonList}
              onToggleComparison={onToggleComparison}
              usageStats={usageStats}
              user={user}
              onViewIssuer={onOpenIssuerProfile}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 border border-white/10 transition-all ${
                currentPage === 1 
                  ? 'opacity-20 cursor-not-allowed' 
                  : 'hover:border-primary-cyan hover:text-primary-cyan text-on-surface'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-[10px] font-black transition-all border active:scale-95 ${
                      currentPage === pageNum
                        ? 'bg-primary-cyan border-primary-cyan text-surface-dim shadow-[0_0_10px_rgba(0,224,255,0.3)]'
                        : 'border-white/10 text-on-surface-variant hover:border-white/30 hover:text-on-surface'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 border border-white/10 transition-all ${
                currentPage === totalPages 
                  ? 'opacity-20 cursor-not-allowed' 
                  : 'hover:border-primary-cyan hover:text-primary-cyan text-on-surface'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Activity & Widget */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="bg-white/5 px-6 py-5 flex justify-between items-center border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-cyan rounded-full animate-pulse shadow-[0_0_10px_rgba(0,224,255,1)]" />
                <h2 className="font-headline font-bold uppercase tracking-widest text-sm italic">Exchange Settlement Feed</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Live Stream Active</span>
                <RefreshCw size={14} className="text-primary-cyan cursor-pointer hover:rotate-180 transition-transform duration-500" />
              </div>
            </div>
            <div className="p-0 overflow-x-auto relative z-10">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-on-surface-variant/50 bg-white/[0.02]">
                    <th className="px-3 md:px-6 py-5 font-bold uppercase tracking-widest">Timestamp</th>
                    <th className="px-3 md:px-6 py-5 font-bold uppercase tracking-widest">Contract Registry</th>
                    <th className="px-3 md:px-6 py-5 font-bold uppercase tracking-widest">Operation</th>
                    <th className="px-3 md:px-6 py-5 font-bold uppercase tracking-widest">Registry Units</th>
                    <th className="px-3 md:px-6 py-5 font-bold uppercase tracking-widest text-right">Settlement Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activities.map((activity, idx) => (
                    <motion.tr 
                      key={activity.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors group relative"
                    >
                      <td className="px-3 md:px-6 py-5 text-on-surface-variant/70 text-[10px] md:text-xs">{activity.timestamp}</td>
                      <td className="px-3 md:px-6 py-5">
                        <span className="font-bold text-on-surface group-hover:text-primary-cyan transition-colors text-[10px] md:text-xs">{activity.contract}</span>
                      </td>
                      <td className="px-3 md:px-6 py-5">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black ${
                          activity.type === 'BUY' 
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                            : 'bg-red-400/10 text-red-400 border-red-400/20'
                        } border`}>
                          {activity.type === 'BUY' ? 'REGISTRY ACQUISITION' : 'PROTOCOL TRANSFER'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-5 text-on-surface-variant font-bold text-[10px] md:text-xs">{activity.volume} <span className="text-[8px] md:text-[9px] opacity-50 uppercase">Units</span></td>
                      <td className="px-3 md:px-6 py-5 text-right">
                        <span className="text-primary-cyan font-black text-xs md:text-sm italic">
                          {(activity.price / LYA_UNIT_VALUE).toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Open Orders */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <h2 className="font-headline font-bold uppercase tracking-widest text-sm italic">{t('My Open Orders', 'Mes Ordres Ouverts')}</h2>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-on-surface-variant font-black uppercase tracking-widest border border-white/10">{filteredOrders.length} {t('Active', 'Actifs')}</div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <select 
                    className="w-full bg-surface-dim/80 border border-white/10 text-[10px] font-black text-on-surface-variant py-2.5 pl-4 pr-10 uppercase tracking-widest appearance-none focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan transition-all rounded-xl"
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                  >
                    <option value="ALL">{t('All Operations', 'Toutes les Opérations')}</option>
                    <option value="BUY">{t('Acquisitions', 'Acquisitions')}</option>
                    <option value="SELL">{t('Transfers', 'Transferts')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={12} />
                </div>

                <div className="relative flex-1 sm:flex-none">
                  <select 
                    className="w-full bg-surface-dim/80 border border-white/10 text-[10px] font-black text-on-surface-variant py-2.5 pl-4 pr-10 uppercase tracking-widest appearance-none focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan transition-all rounded-xl"
                    value={orderContractFilter}
                    onChange={(e) => setOrderContractFilter(e.target.value)}
                  >
                    <option value="ALL">{t('All Contracts', 'Tous les Contrats')}</option>
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>{contract.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={12} />
                </div>

                <button 
                  onClick={onExportOrders}
                  className="flex items-center gap-2 bg-primary-cyan text-surface-dim hover:bg-white border border-primary-cyan hover:border-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,224,255,0.3)] rounded-xl"
                >
                  <Download size={14} />
                  <span>{t('Export', 'Exporter')}</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant/30">
                  <RefreshCw size={40} className="mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">No matching open orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead>
                      <tr className="text-on-surface-variant/50 border-b border-white/5">
                        <th className="pb-5 font-bold uppercase tracking-widest">{t('Indexed Contract', 'Contrat Indexé')}</th>
                        <th className="pb-5 font-bold uppercase tracking-widest">{t('Operation', 'Opération')}</th>
                        <th className="pb-5 font-bold uppercase tracking-widest">{t('Volume', 'Volume')}</th>
                        <th className="pb-5 font-bold uppercase tracking-widest">{t('Valuation (Units)', 'Valorisation (Unités)')}</th>
                        <th className="pb-5 font-bold uppercase tracking-widest text-right">{t('Action', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map(order => {
                        const contract = CONTRACTS.find(a => a.id === order.contractId);
                        return (
                          <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-5 font-black text-on-surface group-hover:text-primary-cyan transition-colors">{contract?.name}</td>
                            <td className={`py-5 font-black ${order.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{order.type === 'BUY' ? 'ACQUISITION' : 'TRANSFER'}</td>
                            <td className="py-5 font-bold">{order.volume} <span className="text-[9px] opacity-50">UNITS</span></td>
                            <td className="py-5 text-primary-cyan font-black text-sm">
                              {(order.price / LYA_UNIT_VALUE).toFixed(2)} <span className="text-[9px] opacity-50">UNITS</span>
                            </td>
                            <td className="py-5 text-right">
                              <button 
                                onClick={() => onCancelOrder(order.id)}
                                className="px-4 py-2 bg-red-400/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-400/20 rounded-xl hover:bg-red-400 hover:text-white transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Book Widget */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-6 py-5 flex justify-between items-center border-b border-white/10">
              <h2 className="font-headline font-bold uppercase tracking-widest text-base">Registry Book</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black opacity-50">Registry:</span>
                <div className="relative">
                  <select 
                    className="bg-surface-dim/80 border border-white/10 text-[10px] font-black text-primary-cyan py-2 pl-4 pr-10 uppercase tracking-widest appearance-none focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan rounded-xl transition-all"
                    value={selectedOrderBookContractId}
                    onChange={(e) => {
                      setSelectedOrderBookContractId(e.target.value);
                      onNotify(`SWITCHING TO ${e.target.value}...`);
                    }}
                  >
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>{contract.registryIndex}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary-cyan" size={12} />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50 mb-4 font-black px-2">
                <span>Price (Units)</span>
                <span className="text-center">Volume</span>
                <span className="text-right">Settlement ($)</span>
              </div>
              
              {/* Asks */}
              <div className="space-y-1 mb-4">
                {orderBookData.asks.map((order, i) => (
                  <div key={i} className="grid grid-cols-3 text-[10px] font-mono py-1.5 px-2 relative group cursor-pointer hover:bg-red-400/5 transition-colors rounded-md overflow-hidden">
                    <div className="absolute inset-y-0 right-0 bg-red-400/10 transition-all duration-700" style={{ width: `${order.depth}%` }} />
                    <span className="text-red-400 relative z-10 font-bold">{order.price}</span>
                    <span className="text-center relative z-10 text-on-surface font-medium">{order.volume}</span>
                    <span className="text-right text-on-surface-variant relative z-10">${parseFloat(order.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="py-4 border-y border-white/10 flex justify-between items-center mb-4 bg-white/[0.03] px-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black font-headline text-on-surface leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{orderBookData.currentPrice}</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight size={18} />
                    <span className="text-[10px] font-black">UNITS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-black opacity-50">Spread: {orderBookData.spread} Units</div>
                  <div className="text-[10px] font-mono text-primary-cyan">≈ ${(parseFloat(orderBookData.currentPrice) * LYA_UNIT_VALUE).toFixed(2)} USD</div>
                </div>
              </div>

              {/* Bids */}
              <div className="space-y-1">
                {orderBookData.bids.map((order, i) => (
                  <div key={i} className="grid grid-cols-3 text-[10px] font-mono py-1.5 px-2 relative group cursor-pointer hover:bg-emerald-400/5 transition-colors rounded-md overflow-hidden">
                    <div className="absolute inset-y-0 right-0 bg-emerald-400/10 transition-all duration-700" style={{ width: `${order.depth}%` }} />
                    <span className="text-emerald-400 relative z-10 font-bold">{order.price}</span>
                    <span className="text-center relative z-10 text-on-surface font-medium">{order.volume}</span>
                    <span className="text-right text-on-surface-variant relative z-10">${parseFloat(order.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-black px-1">
                  <span>Verification Status</span>
                  <span className={verificationLevel === 'Expert' ? 'text-accent-gold' : 'text-primary-cyan'}>{verificationLevel}</span>
                </div>
                <button 
                  onClick={onOpenVerification}
                  className="w-full py-5 px-6 bg-surface-dim/80 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:border-primary-cyan hover:text-primary-cyan transition-all flex items-center justify-center gap-3 group active:scale-95 rounded-2xl shadow-2xl"
                >
                  <ShieldCheck size={20} className="group-hover:text-primary-cyan transition-colors" />
                  Access Expert Registry
                </button>
              </div>
            </div>
          </div>

          {/* Market Depth Chart */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
              <TrendingUp size={20} className="text-primary-cyan" />
              Exchange Depth Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.05} />
                  <XAxis 
                    dataKey="price" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#8E9299', fontWeight: 'bold' }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#8E9299', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-dim/95 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-cyan mb-3 border-b border-white/5 pb-2">
                              Price Point: {label}
                            </p>
                            <div className="space-y-2">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{entry.name}</span>
                                  </div>
                                  <span className="text-xs font-mono font-black text-white">{entry.value.toLocaleString()} Units</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="buy" name="Acquisition Volume" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sell" name="Transfer Volume" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 flex justify-center gap-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black">Bids (Buy)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black">Asks (Sell)</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-cyan/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 relative z-10 flex items-center gap-3">
              <Droplets size={16} className="text-primary-cyan" />
              Liquidity Pool Optimization
              <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-[9px] font-black uppercase tracking-widest border border-accent-gold/30 rounded-md ml-auto">Institutional</span>
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">AMM Efficiency</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">OPTIMIZED</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-black font-headline text-white">98.4%</div>
                  <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Slippage Tolerance: 0.1%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[8px] uppercase tracking-widest text-on-surface-variant font-black mb-2">Pool Depth</div>
                  <div className="text-lg font-black text-white">4.2M Units</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[8px] uppercase tracking-widest text-on-surface-variant font-black mb-2">24h Volume</div>
                  <div className="text-lg font-black text-white">842K Units</div>
                </div>
              </div>

              <button 
                onClick={() => onNotify('OPENING LIQUIDITY PROVISION PROTOCOL...')}
                className="w-full py-4 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 group"
              >
                Provide Liquidity
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-cyan/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 relative z-10 flex items-center gap-3">
              <RefreshCw size={16} className="text-primary-cyan animate-spin-slow" />
              Exchange Sentiment Index
              <span className="px-2 py-0.5 bg-primary-cyan/20 text-primary-cyan text-[9px] font-black uppercase tracking-widest border border-primary-cyan/30 rounded-md ml-auto">Pro</span>
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold">
                  <span className="text-on-surface-variant">Exchange Demand</span>
                  <span className="text-emerald-400">68%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold">
                  <span className="text-on-surface-variant">Institutional Accumulation</span>
                  <span className="text-primary-cyan">92%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.5)]" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold">
                  <span className="text-on-surface-variant">Creative Momentum</span>
                  <span className="text-accent-gold">75%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    className="h-full bg-accent-gold shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black">Overall Bias</span>
                  <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-400/20">Strong Buy</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Market Intelligence Widget */}
          <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent-gold/10 rounded-2xl border border-accent-gold/20">
                <Layers className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <h2 className="text-xl font-black font-headline text-on-surface tracking-tight uppercase">Market Intelligence</h2>
                <div className="text-[10px] text-accent-gold uppercase tracking-widest font-bold opacity-70">Institutional Insights v2.4</div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-primary-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-cyan">Protocol Integrity</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  Registry nodes are operating at <span className="text-on-surface font-bold">99.98%</span> efficiency. 
                  Cross-jurisdictional compliance checks are synchronized with MiCA and SEC standards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary-cyan/30 transition-colors">
                  <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-2 font-black">Liquidity Depth</div>
                  <div className="text-2xl font-black font-headline text-on-surface tracking-tighter">1.2M LYA</div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary-cyan/30 transition-colors">
                  <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-2 font-black">Active Nodes</div>
                  <div className="text-2xl font-black font-headline text-on-surface tracking-tighter">4,812</div>
                </div>
              </div>

              <div className="p-6 bg-primary-cyan/5 rounded-2xl border border-primary-cyan/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-cyan">Institutional Flow</span>
                  <span className="text-[10px] font-mono text-primary-cyan font-bold">+12.4%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.5)]"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </Fragment>
  )}
    </div>
  </div>
);
};

export default ExchangeView;
