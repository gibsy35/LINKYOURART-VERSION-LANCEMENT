import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ChevronDown, RefreshCw, Download, ArrowUpRight,
  ShieldCheck, ChevronLeft, ChevronRight, TrendingUp,
  Droplets, Zap, ArrowRight, Star
} from 'lucide-react';
import { CONTRACTS, Contract, Order, Activity, LYA_UNIT_VALUE } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { ContractCard } from '../components/ContractCard';
import { InfoTooltip } from '../components/InfoTooltip';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { CandlestickChart } from '../components/ui/CandlestickChart';
import { useMarketData } from '../hooks/useMarketData';
import { downloadAsCSV } from '../utils/download';
import {
  MECENAT_THEMES,
  WhatIsLyaUnit,
  ProjectCard,
  DetailModal,
  PaymentModal,
} from '../components/mecenat/MecenatShared';

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
  liveContracts?: Contract[];
}

// ─── PATRONAGE HUB TAB ────────────────────────────────────────────────────────
// Utilise les composants partagés (MecenatShared) afin de garantir une parité
// visuelle totale avec la page autonome "Espace Mécénat" (MecenatView / route MECENAT).

const PatronageHubTab: React.FC<{
  contracts: Contract[];
  onSelectContract: (c: Contract) => void;
  onOpenOffer: (c: Contract) => void;
  onToggleWatchlist: (e: React.MouseEvent, id: string) => void;
  watchlist: string[];
  lang: 'FR' | 'EN';
  formatPrice: (n: number) => string;
}> = ({ contracts, onSelectContract, onOpenOffer, onToggleWatchlist, watchlist, lang, formatPrice }) => {
  const [activeTheme, setActiveTheme] = useState('all');
  const [detail, setDetail] = useState<{ contract: Contract; units: number } | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const filtered = useMemo(() => {
    const theme = MECENAT_THEMES.find(t => t.id === activeTheme);
    if (!theme || theme.cats.length === 0) return contracts;
    return contracts.filter(c => theme.cats.includes(c.category));
  }, [activeTheme, contracts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Hero encadré ── */}
      <div className="relative bg-surface-low/60 border border-white/10 rounded-2xl p-6 md:p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-5">
          <span className="text-primary-cyan text-xs font-mono tracking-widest border border-primary-cyan/30 px-3 py-1 rounded-full inline-block">
            ✦ {T('ESPACE MÉCÉNAT LYA', 'LYA PATRONAGE SPACE')}
          </span>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h2 className="font-headline font-black text-on-surface uppercase tracking-tighter leading-[0.88] mb-5" style={{ fontSize: 'clamp(2rem,4.5vw,3.6rem)' }}>
                {T("CO-POSSÉDEZ LES CHEFS-D'ŒUVRE", "CO-OWN TOMORROW'S")}<br />
                {T('DE DEMAIN', 'MASTERPIECES,')}{' '}
                <span className="text-primary-cyan">{T('EN UN CLIC', 'IN A SINGLE CLICK')}</span>
              </h2>
              <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed opacity-80">
                {T(
                  "Bienvenue dans notre espace de découverte simplifié. Ici, pas de graphiques financiers ou de carnets d'ordres rebutants. Juste de l'art sublime, du talent brut, et un moyen simple et interactif de soutenir vos créations favorites et de partager leurs futurs succès.",
                  'Welcome to our simplified discovery space. No financial charts or intimidating order books. Just sublime art, raw talent, and a simple interactive way to support your favourite creations and share in their future success.'
                )}
              </p>
            </div>
            <div className="shrink-0 w-[180px]">
              <div className="relative rounded-2xl p-px" style={{ background: 'linear-gradient(145deg, rgba(251,191,36,0.4) 0%, rgba(255,255,255,0.06) 60%)' }}>
                <div className="bg-surface-low/80 rounded-2xl p-5 text-center space-y-3">
                  <p className="text-xs font-mono tracking-[0.22em] uppercase" style={{ color: 'rgba(251,191,36,0.55)' }}>
                    {T('INDEX DE VALEUR', 'VALUE INDEX')}
                  </p>
                  <p className="font-headline font-black tracking-tighter leading-none text-on-surface text-lg">
                    LYA <span style={{ color: '#fbbf24' }}>UNIT</span>
                  </p>
                  <p className="font-mono font-black text-2xl text-primary-cyan tracking-tight">
                    {formatPrice(LYA_UNIT_VALUE)}
                  </p>
                  <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />
                  <p className="text-xs font-mono text-on-surface-variant/50 leading-relaxed">
                    {T('Étalon créatif souverain', 'Sovereign creative standard')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LYA Unit définition ── */}
      <WhatIsLyaUnit lang={lang} />

      {/* ── Filtres thématiques ── */}
      <div>
        <p className="text-primary-cyan text-[10px] font-mono tracking-widest mb-4">
          ● {T('SÉLECTIONNEZ UN THÈME ARTISTIQUE', 'CHOOSE AN ART MOOD')}
        </p>
        <div className="flex flex-wrap gap-3">
          {MECENAT_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono transition-all ${activeTheme === theme.id ? 'bg-primary-cyan text-surface-dim font-bold' : 'border border-white/10 text-on-surface-variant hover:border-primary-cyan/50 hover:text-on-surface'}`}
            >
              <span>{theme.icon}</span>
              {T(theme.labelFR, theme.labelEN)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grille projets ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-500 text-[10px] font-mono tracking-widest">
            {T('PROJETS CRÉATIFS', 'CREATIVE PROJECTS')} — <span className="text-[#00d4ff]">{filtered.length} {T('ŒUVRES', 'WORKS')}</span>
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/30">
              {T('Aucun projet dans cette catégorie.', 'No projects in this category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((contract) => (
              <ProjectCard
                key={contract.id}
                contract={contract}
                lang={lang}
                isWatchlisted={watchlist.includes(contract.id)}
                onToggleWatchlist={onToggleWatchlist}
                onViewProject={(c, u) => { setShowPayment(false); setDetail({ contract: c, units: u }); }}
                onSupport={(c, u) => { setShowPayment(true); setDetail({ contract: c, units: u }); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {detail && !showPayment && (
        <DetailModal
          contract={detail.contract}
          units={detail.units}
          onUnitsChange={(u) => setDetail(d => d ? { ...d, units: u } : d)}
          onClose={() => setDetail(null)}
          onPay={() => setShowPayment(true)}
          lang={lang}
        />
      )}
      {detail && showPayment && (
        <PaymentModal
          contract={detail.contract}
          units={detail.units}
          onClose={() => { setShowPayment(false); setDetail(null); }}
          lang={lang}
        />
      )}
    </div>
  );
};

// ─── EXCHANGE VIEW ─────────────────────────────────────────────────────────────

export const ExchangeView: React.FC<ExchangeViewProps> = ({
  orders, activities, onNotify, onOpenTrade, onSelectContract, onCancelOrder,
  rarityFilter, setRarityFilter, statusFilter, setStatusFilter,
  orderTypeFilter, setOrderTypeFilter, orderContractFilter, setOrderContractFilter,
  verificationLevel, onOpenVerification, watchlist, onToggleWatchlist,
  comparisonList, onToggleComparison, categoryFilter, setCategoryFilter,
  jurisdictionFilter, setJurisdictionFilter, onOpenIssuerProfile,
  onOpenOffer, onOpenTransfer, user, usageStats, liveContracts
}) => {
  const { t, language } = useTranslation();
  const { formatPrice, formatLYA } = useCurrency();
  const { contracts: hookContracts, marketStats } = useMarketData();
  const contracts = liveContracts || hookContracts;
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';

  const [activeTab, setActiveTab] = useState<'exchange' | 'overview' | 'predictive'>('exchange');
  const [indexTimeframe, setIndexTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [selectedOrderBookContractId, setSelectedOrderBookContractId] = useState(contracts[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'SCORE_DESC' | 'SCORE_ASC'>('SCORE_DESC');
  const pageSize = 9;

  const onExportOrders = () => {
    downloadAsCSV(orders, 'LYA_Exchange_Orders_Export');
    onNotify(t('EXPORTING ORDER BOOK DATA...', 'EXPORTATION DES DONNÉES DU CARNET D\'ORDRES...'));
  };

  useEffect(() => { setCurrentPage(1); }, [rarityFilter, statusFilter, sortOrder]);

  const depthData = useMemo(() => {
    const contractOrders = orders.filter(o => o.contractId === selectedOrderBookContractId && o.status === 'OPEN');
    const priceMap: Record<number, { price: string; buy: number; sell: number }> = {};
    contractOrders.forEach(order => {
      const price = (order.price / LYA_UNIT_VALUE).toFixed(2);
      const n = parseFloat(price);
      if (!priceMap[n]) priceMap[n] = { price, buy: 0, sell: 0 };
      if (order.type === 'BUY') priceMap[n].buy += order.volume;
      else priceMap[n].sell += order.volume;
    });
    const data = Object.values(priceMap).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (data.length === 0) {
      const c = contracts.find(a => a.id === selectedOrderBookContractId);
      const lyaBase = (c?.unitValue || 50) / LYA_UNIT_VALUE;
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
    const c = contracts.find(x => x.id === selectedOrderBookContractId);
    const lyaBase = (c?.unitValue || 50) / LYA_UNIT_VALUE;
    const gen = (type: 'BUY' | 'SELL') =>
      [...Array(6)].map((_, i) => {
        const offset = (i + 1) * 0.002;
        const price = type === 'BUY' ? lyaBase - offset : lyaBase + offset;
        const volume = Math.floor(Math.random() * 500) + 50;
        return { price: price.toFixed(3), volume, total: (price * volume * LYA_UNIT_VALUE).toFixed(2), depth: Math.random() * 80 + 20 };
      }).sort((a, b) => type === 'BUY' ? parseFloat(b.price) - parseFloat(a.price) : parseFloat(a.price) - parseFloat(b.price));
    const bids = gen('BUY');
    const asks = gen('SELL').reverse();
    const spread = parseFloat(asks[asks.length - 1].price) - parseFloat(bids[0].price);
    return { bids, asks, spread: spread.toFixed(4), currentPrice: lyaBase.toFixed(3) };
  }, [selectedOrderBookContractId, contracts]);

  const indexData = useMemo(() => {
    const base = 1000;
    const pts = indexTimeframe === '1D' ? 24 : indexTimeframe === '1W' ? 7 : indexTimeframe === '1M' ? 30 : 52;
    return Array.from({ length: pts }).map((_, i) => {
      const open = base + Math.sin(i * 0.5) * 50 + i * 2;
      const close = open + (Math.random() - 0.5) * 40;
      return { time: i.toString(), open, close, high: Math.max(open, close) + Math.random() * 15, low: Math.min(open, close) - Math.random() * 15 };
    });
  }, [indexTimeframe]);

  const filteredContracts = useMemo(() => {
    const f = contracts.filter(c => {
      const r = rarityFilter === 'ALL' || c.rarity === rarityFilter;
      const s = statusFilter === 'ALL' || c.status === statusFilter;
      const cat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const j = jurisdictionFilter === 'ALL' || c.jurisdiction === jurisdictionFilter;
      return r && s && cat && j;
    });
    return [...f].sort((a, b) => sortOrder === 'SCORE_DESC' ? b.totalScore - a.totalScore : a.totalScore - b.totalScore);
  }, [rarityFilter, statusFilter, categoryFilter, jurisdictionFilter, sortOrder, contracts]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [predictiveTrials, setPredictiveTrials] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handlePredict = () => {
    if (predictiveTrials >= 3) {
      onNotify(t('3/3 TRIALS REACHED.', '3/3 ESSAIS ATTEINTS.'));
      return;
    }
    setIsPredicting(true);
    setTimeout(() => {
      setPredictiveTrials(p => p + 1);
      const suggestions = [...contracts].sort((a, b) => (b.growth + b.totalScore / 10) - (a.growth + a.totalScore / 10)).slice(0, 5);
      setPredictionResult({ forecast: '+14.2%', confidence: '94.2%', timeframe: '90 Days', sentiment: 'Strong Buy', suggestions });
      setIsPredicting(false);
      onNotify(t(`PREDICTION COMPLETE (${predictiveTrials + 1}/3)`, `PRÉDICTION TERMINÉE (${predictiveTrials + 1}/3)`));
    }, 2000);
  };

  const filteredOrders = orders.filter(o => {
    const tm = orderTypeFilter === 'ALL' || o.type === orderTypeFilter;
    const cm = orderContractFilter === 'ALL' || o.contractId === orderContractFilter;
    return tm && cm;
  });

  const TABS = [
    { key: 'exchange' as const, labelFR: '⟳ MARCHÉ SECONDAIRE (PRO)', labelEN: '⟳ SECONDARY MARKET (PRO)', icon: <RefreshCw size={12} /> },
    { key: 'overview' as const, labelFR: 'VUE D\'ENSEMBLE', labelEN: 'MARKET OVERVIEW' },
    { key: 'predictive' as const, labelFR: '⚡ ANALYSES PRÉDICTIVES', labelEN: '⚡ PREDICTIVE ANALYTICS', icon: <Zap size={12} /> },
  ];

  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        titleWhite={t('EXCHANGE', 'ÉCHANGE')}
        titleAccent={t('PROFESSIONAL', 'PROFESSIONNEL')}
        description={t('CREATIVE MARKET', 'TERMINAL DE LIQUIDITÉ & RÈGLEMENT P2P AUTORISÉ')}
        accentColor="text-primary-cyan"
      />

      <div className="space-y-8 px-2 md:px-4">
        {/* ── TABS ── */}
        <div className="flex gap-1 sm:gap-6 border-b border-white/5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 text-xs sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap flex items-center gap-1.5 px-1 ${
                activeTab === tab.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {lang === 'FR' ? tab.labelFR : tab.labelEN}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB : MARCHÉ SECONDAIRE PRO — stats ══ */}
        {activeTab === 'exchange' && (
          <Fragment>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: t('LYA Unit Valuation', 'Évaluation Unité LYA'), value: `1 UNIT = ${formatLYA()}`, border: 'border-primary-cyan', color: 'text-primary-cyan', badge: 'Protocol' },
                { label: t('Total Market Cap', 'Capitalisation Totale'), value: formatPrice(marketStats.totalCap || 0), border: 'border-accent-gold', color: 'text-accent-gold', badge: null },
                { label: t('Direct Transfers', 'Transferts Directs'), value: `${marketStats.totalAvailable?.toLocaleString() || '0'} Units`, border: 'border-emerald-400', color: 'text-emerald-400', badge: null },
                { label: t('Avg. Growth', 'Croissance Moy.'), value: `${marketStats.avgGrowth >= 0 ? '+' : ''}${marketStats.avgGrowth?.toFixed(1)}%`, border: 'border-white/20', color: marketStats.avgGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400', badge: null },
              ].map((stat, i) => (
                <div key={i} className={`relative group rounded-2xl bg-surface-low/30 backdrop-blur-2xl border-l-4 ${stat.border} p-5 lg:p-8 flex flex-col justify-center min-h-[120px] lg:min-h-[180px] shadow-2xl border border-white/10 hover:border-white/20 transition-all`}>
                  <div className={`text-[10px] lg:text-[10px] uppercase tracking-[0.25em] font-black opacity-70 mb-3 flex items-center gap-2 ${stat.color}`}>
                    {stat.label}
                    {stat.badge && <span className={`px-1.5 py-0.5 bg-primary-cyan/20 text-[7px] font-black uppercase tracking-widest border border-primary-cyan/30 rounded-sm ${stat.color}`}>{stat.badge}</span>}
                  </div>
                  <h3 className={`text-base lg:text-2xl font-bold font-headline tracking-tighter truncate ${stat.color}`}>{stat.value}</h3>
                </div>
              ))}
            </div>

            <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-xl text-xs leading-relaxed opacity-70 mt-6 uppercase tracking-[0.25em] font-black text-justify">
              {t('LINKYOURART STANDARDIZES CREATIVE VALUE. EVERY PROJECT IS INDEXED INTO CONTRACT UNITS.', 'LINKYOURART STANDARDISE LA VALEUR CRÉATIVE. CHAQUE PROJET EST INDEXÉ EN UNITÉS DE CONTRAT.')}
            </p>

            {/* Filtres + grille contrats */}
            <div className="flex flex-wrap items-end gap-4">
              {[
                { label: t('Category', 'Catégorie'), value: categoryFilter, setter: setCategoryFilter, options: [['ALL', t('All Categories', 'Toutes les Catégories')], ['Fine Art', t('Fine Art', 'Beaux-Arts')], ['Film', t('Film', 'Cinéma')], ['TV Series', t('TV Series', 'Séries TV')], ['Music', t('Music', 'Musique')], ['Digital Art', t('Digital Art', 'Art Numérique')], ['Photography', t('Photography', 'Photographie')], ['Fashion', t('Fashion', 'Mode')], ['Architecture', t('Architecture', 'Architecture')], ['Podcast', 'Podcast'], ['Performing Arts', t('Performing Arts', 'Arts de la Scène')]] },
                { label: t('Status', 'Statut'), value: statusFilter, setter: setStatusFilter, options: [['ALL', t('All Status', 'Tous les Statuts')], ['LIVE', t('Active', 'Actif')], ['AUDIT', t('In Audit', 'En Audit')], ['SUSPENDED', t('Suspended', 'Suspendu')]] },
                { label: t('Sort By Score', 'Trier par Score'), value: sortOrder, setter: (v: string) => setSortOrder(v as any), options: [['SCORE_DESC', t('Score: High to Low', 'Score : Décroissant')], ['SCORE_ASC', t('Score: Low to High', 'Score : Croissant')]] },
              ].map((sel) => (
                <div key={sel.label} className="space-y-1 min-w-[140px]">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black opacity-50 px-1">{sel.label}</span>
                  <div className="relative">
                    <select value={sel.value} onChange={(e) => sel.setter(e.target.value)} className="w-full bg-surface-low/50 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 appearance-none focus:border-primary-cyan outline-none transition-all rounded-xl">
                      {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={12} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onSelect={(c) => onSelectContract(c)}
                  onTrade={(c, type) => { if (type === 'BUY') onOpenOffer(c); else onOpenTransfer(c); }}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-2 border border-white/10 transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:border-primary-cyan hover:text-primary-cyan'}`}><ChevronLeft size={16} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 text-[10px] font-black border transition-all active:scale-95 ${currentPage === i + 1 ? 'bg-primary-cyan border-primary-cyan text-surface-dim' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-2 border border-white/10 transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:border-primary-cyan hover:text-primary-cyan'}`}><ChevronRight size={16} /></button>
              </div>
            )}

            {/* Activity + Order book */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-10 gap-8">
              <div className="lg:col-span-6 flex flex-col gap-8">
                {/* Settlement Feed */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-white/5 px-6 py-5 flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-cyan rounded-full animate-pulse" />
                      <h2 className="font-headline font-bold uppercase tracking-widest text-sm">{t('Exchange Settlement Feed', 'Flux de Règlement de l\'Échange')}</h2>
                    </div>
                    <RefreshCw size={14} className="text-primary-cyan cursor-pointer hover:rotate-180 transition-transform duration-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="text-on-surface-variant/50 bg-white/[0.02]">
                          <th className="px-6 py-5 font-bold uppercase tracking-widest">{t('Timestamp', 'Horodatage')}</th>
                          <th className="px-6 py-5 font-bold uppercase tracking-widest">{t('Contract', 'Contrat')}</th>
                          <th className="px-6 py-5 font-bold uppercase tracking-widest">{t('Operation', 'Opération')}</th>
                          <th className="px-6 py-5 font-bold uppercase tracking-widest">{t('Units', 'Unités')}</th>
                          <th className="px-6 py-5 font-bold uppercase tracking-widest text-right">{t('Index', 'Index')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activities.map((activity, idx) => (
                          <motion.tr key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-5 text-on-surface-variant/70 text-[10px]">{activity.timestamp}</td>
                            <td className="px-6 py-5 font-bold text-on-surface text-[10px]">{activity.contract}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-black border ${activity.type === 'BUY' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}`}>
                                {activity.type === 'BUY' ? t('ACQUISITION', 'ACQUISITION') : t('TRANSFER', 'TRANSFERT')}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-on-surface-variant font-bold text-[10px]">{activity.volume} <span className="text-[10px] opacity-50">UNITS</span></td>
                            <td className="px-6 py-5 text-right text-primary-cyan font-black text-xs">{(activity.price / LYA_UNIT_VALUE).toFixed(2)}</td>
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
                      <h2 className="font-headline font-bold uppercase tracking-widest text-sm">{t('My Open Orders', 'Mes Ordres Ouverts')}</h2>
                      <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-on-surface-variant font-black uppercase tracking-widest border border-white/10">{filteredOrders.length} {t('Active', 'Actifs')}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { val: orderTypeFilter, setter: (v: string) => setOrderTypeFilter(v as any), opts: [['ALL', t('All', 'Tous')], ['BUY', t('Buy', 'Achat')], ['SELL', t('Sell', 'Vente')]] },
                        { val: orderContractFilter, setter: setOrderContractFilter, opts: [['ALL', t('All Contracts', 'Tous les Contrats')], ...contracts.map(c => [c.id, c.name] as [string, string])] },
                      ].map((sel, si) => (
                        <div key={si} className="relative">
                          <select value={sel.val} onChange={(e) => sel.setter(e.target.value)} className="bg-surface-dim/80 border border-white/10 text-[10px] font-black text-on-surface-variant py-2.5 pl-4 pr-8 uppercase tracking-widest appearance-none focus:ring-1 focus:ring-primary-cyan rounded-xl transition-all">
                            {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={11} />
                        </div>
                      ))}
                      <button onClick={onExportOrders} className="flex items-center gap-2 bg-primary-cyan text-surface-dim hover:bg-white border border-primary-cyan px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl">
                        <Download size={13} />{t('Export', 'Exporter')}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {filteredOrders.length === 0 ? (
                      <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant/30">
                        <RefreshCw size={40} className="mb-4 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">{t('No matching open orders found', 'Aucun ordre ouvert trouvé')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead>
                            <tr className="text-on-surface-variant/50 border-b border-white/5">
                              <th className="pb-5 font-bold uppercase tracking-widest">{t('Contract', 'Contrat')}</th>
                              <th className="pb-5 font-bold uppercase tracking-widest">{t('Op.', 'Op.')}</th>
                              <th className="pb-5 font-bold uppercase tracking-widest">{t('Volume', 'Volume')}</th>
                              <th className="pb-5 font-bold uppercase tracking-widest">{t('Valuation', 'Valorisation')}</th>
                              <th className="pb-5 font-bold uppercase tracking-widest text-right">{t('Action', 'Action')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredOrders.map(order => {
                              const c = CONTRACTS.find(a => a.id === order.contractId);
                              return (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-5 font-black text-on-surface">{c?.name}</td>
                                  <td className={`py-5 font-black ${order.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{order.type}</td>
                                  <td className="py-5 font-bold">{order.volume} <span className="text-xs opacity-50">U</span></td>
                                  <td className="py-5 text-primary-cyan font-black text-sm">{(order.price / LYA_UNIT_VALUE).toFixed(2)}</td>
                                  <td className="py-5 text-right">
                                    <button onClick={() => onCancelOrder(order.id)} className="px-4 py-2 bg-red-400/10 text-red-400 text-xs font-black uppercase tracking-widest border border-red-400/20 rounded-xl hover:bg-red-400 hover:text-white transition-all">{t('Cancel', 'Annuler')}</button>
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

              {/* Order Book */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-white/5 px-6 py-5 flex justify-between items-center border-b border-white/10">
                    <h2 className="font-headline font-bold uppercase tracking-widest text-base">{t('Registry Book', 'Carnet d\'Ordres')}</h2>
                    <div className="relative">
                      <select value={selectedOrderBookContractId} onChange={(e) => { setSelectedOrderBookContractId(e.target.value); onNotify(`SWITCHING TO ${e.target.value}...`); }} className="bg-surface-dim/80 border border-white/10 text-[10px] font-black text-primary-cyan py-2 pl-4 pr-10 uppercase tracking-widest appearance-none focus:ring-1 focus:ring-primary-cyan rounded-xl">
                        {contracts.map(c => <option key={c.id} value={c.id}>{c.registryIndex}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary-cyan" size={11} />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-xs uppercase tracking-[0.2em] text-on-surface-variant/50 mb-4 font-black px-3">
                      <span>{t('Price', 'Prix')}</span><span className="text-center">{t('Vol.', 'Vol.')}</span><span className="text-right">$</span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {orderBookData.asks.map((o, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-[10px] font-mono py-2 px-3 relative cursor-pointer hover:bg-red-400/5 rounded-md overflow-hidden">
                          <div className="absolute inset-y-0 right-0 bg-red-400/10" style={{ width: `${o.depth}%` }} />
                          <span className="text-red-400 relative z-10 font-bold">{o.price}</span>
                          <span className="text-center relative z-10">{o.volume}</span>
                          <span className="text-right text-on-surface-variant relative z-10">{formatPrice(parseFloat(o.total))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="py-4 border-y border-white/10 flex justify-between items-center mb-4 bg-white/[0.03] px-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black font-headline text-on-surface">{orderBookData.currentPrice}</span>
                        <div className="flex items-center gap-1 text-emerald-400"><ArrowUpRight size={18} /><span className="text-[10px] font-black">UNITS</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-on-surface-variant uppercase tracking-widest font-black opacity-50">Spread: {orderBookData.spread}</div>
                        <div className="text-[10px] font-mono text-primary-cyan">≈ {formatPrice(parseFloat(orderBookData.currentPrice) * LYA_UNIT_VALUE)}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {orderBookData.bids.map((o, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-[10px] font-mono py-2 px-3 relative cursor-pointer hover:bg-emerald-400/5 rounded-md overflow-hidden">
                          <div className="absolute inset-y-0 right-0 bg-emerald-400/10" style={{ width: `${o.depth}%` }} />
                          <span className="text-emerald-400 relative z-10 font-bold">{o.price}</span>
                          <span className="text-center relative z-10">{o.volume}</span>
                          <span className="text-right text-on-surface-variant relative z-10">{formatPrice(parseFloat(o.total))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-black px-1">
                        <span>{t('Verification', 'Vérification')}</span>
                        <span className={verificationLevel === 'Expert' ? 'text-accent-gold' : 'text-primary-cyan'}>{verificationLevel}</span>
                      </div>
                      <button onClick={onOpenVerification} className="w-full py-5 px-6 bg-surface-dim/80 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:border-primary-cyan hover:text-primary-cyan transition-all flex items-center justify-center gap-3 rounded-2xl">
                        <ShieldCheck size={20} />{t('Access Expert Registry', 'Accéder au Registre Expert')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Depth Chart */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                  <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
                    <TrendingUp size={20} className="text-primary-cyan" />
                    {t('Exchange Depth', 'Profondeur de l\'Échange')}
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={depthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.05} />
                        <XAxis dataKey="price" stroke="#666" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#8E9299', fontWeight: 'bold' }} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#8E9299', fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="buy" name="Buy" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="sell" name="Sell" stackId="a" fill="#fb7185" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                  <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
                    <RefreshCw size={16} className="text-primary-cyan" />
                    {t('Exchange Sentiment Index', 'Indice de Sentiment')}
                    <span className="px-3 py-0.5 bg-primary-cyan/20 text-primary-cyan text-xs font-black uppercase tracking-widest border border-primary-cyan/30 rounded-md ml-auto">Pro</span>
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: t('Exchange Demand', 'Demande'), pct: 68, color: 'bg-emerald-400', text: 'text-emerald-400' },
                      { label: t('Institutional Accumulation', 'Accumulation Institutionnelle'), pct: 92, color: 'bg-primary-cyan', text: 'text-primary-cyan' },
                      { label: t('Creative Momentum', 'Momentum Créatif'), pct: 75, color: 'bg-accent-gold', text: 'text-accent-gold' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold">
                          <span className="text-on-surface-variant">{item.label}</span>
                          <span className={item.text}>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} className={`h-full ${item.color}`} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black">{t('Overall Bias', 'Biais Global')}</span>
                      <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-400/20">{t('Strong Buy', 'Achat Fort')}</span>
                    </div>
                  </div>
                </div>

                {/* Liquidity */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary-cyan/10 rounded-full -mr-24 -mt-24 blur-[80px]" />
                  <h3 className="font-headline font-bold uppercase tracking-widest text-sm mb-8 flex items-center gap-3 relative z-10">
                    <Droplets size={16} className="text-primary-cyan" />
                    {t('Liquidity Pool', 'Pool de Liquidité')}
                    <span className="px-3 py-0.5 bg-accent-gold/20 text-accent-gold text-xs font-black uppercase border border-accent-gold/30 rounded-md ml-auto">{t('Institutional', 'Institutionnel')}</span>
                  </h3>
                  <div className="space-y-5 relative z-10">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t('AMM Efficiency', 'Efficacité AMM')}</span>
                        <span className="text-[10px] font-black text-emerald-400">{t('OPTIMIZED', 'OPTIMISÉ')}</span>
                      </div>
                      <div className="text-2xl font-black font-headline text-white">98.4%</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black mb-2">{t('Pool Depth', 'Profondeur')}</div>
                        <div className="text-lg font-black text-white">4.2M Units</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black mb-2">{t('24h Volume', 'Volume 24h')}</div>
                        <div className="text-lg font-black text-white">842K Units</div>
                      </div>
                    </div>
                    <button onClick={async () => {
                      try {
                        const { db: fireDb } = await import('../firebase');
                        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                        await addDoc(collection(fireDb, 'liquidity_requests'), { userId: user?.uid, status: 'PENDING', createdAt: serverTimestamp() });
                        onNotify(t('LIQUIDITY REQUEST SUBMITTED', 'DEMANDE DE LIQUIDITÉ SOUMISE'));
                      } catch { onNotify(t('MARCHÉ CRÉATIF ACTIF', 'MARCHÉ CRÉATIF ACTIF')); }
                    }} className="w-full py-4 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 group">
                      {t('Provide Liquidity', 'Fournir de la Liquidité')}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )}

        {/* ══ TAB : VUE D'ENSEMBLE ══ */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[240px]">
                <div>
                  <div className="text-[10px] text-primary-cyan uppercase tracking-[0.3em] font-black mb-4">{t('Market Sentiment', 'Sentiment du Marché')}</div>
                  <h3 className="text-4xl font-black font-headline text-on-surface tracking-tighter">{t('BULLISH', 'HAUSSIER')}</h3>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-emerald-400" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                    <span>{t('Fear Index', 'Indice de Peur')}: 12</span>
                    <span>{t('Greed Index', 'Indice de Cupidité')}: 88</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[10px] text-accent-gold uppercase tracking-[0.3em] font-black">{t('Global Index Performance', 'Performance Indice Global')}</div>
                  <div className="flex gap-2">
                    {(['1D', '1W', '1M', '1Y'] as const).map(r => (
                      <button key={r} onClick={() => setIndexTimeframe(r)} className={`px-3 py-1 border rounded-lg text-[10px] font-black transition-colors ${indexTimeframe === r ? 'bg-primary-cyan text-surface-dim border-primary-cyan' : 'bg-white/5 border-white/10 hover:border-primary-cyan'}`}>{r}</button>
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

        {/* ══ TAB : ANALYSES PRÉDICTIVES ══ */}
        {activeTab === 'predictive' && (
          <div className="space-y-12 animate-in fade-in duration-700 mt-8">
            <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan/30" />
              {!predictionResult ? (
                <>
                  <div className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-cyan/20">
                    <Zap className={`w-10 h-10 text-primary-cyan ${isPredicting ? 'animate-pulse' : ''}`} />
                  </div>
                  <h2 className="text-3xl font-black font-headline text-on-surface tracking-tighter mb-4">{t('LYA PREDICTIVE ENGINE', 'MOTEUR PRÉDICTIF LYA')}</h2>
                  <p className="text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed mb-8">
                    {t('Neural network analysis across global creative registries for expert performance forecasting.', 'Analyse par réseau neuronal à travers les registres créatifs mondiaux pour une prévision experte.')}
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <button onClick={handlePredict} disabled={isPredicting} className="px-8 py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all disabled:opacity-50">
                      {isPredicting ? t('Analyzing...', 'Analyse...') : t('Run Neural Forecast', 'Lancer la Prévision Neurale')}
                    </button>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                      {t('Trials Remaining:', 'Essais Restants :')} <span className="text-primary-cyan font-bold">{3 - predictiveTrials}/3</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-black font-headline text-white tracking-tighter">{predictionResult.forecast} <span className="text-primary-cyan text-2xl">{t('GROWTH', 'CROISSANCE')}</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">{t('Confidence', 'Confiance')}</div>
                        <div className="text-xl font-black text-primary-cyan">{predictionResult.confidence}</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">{t('Timeframe', 'Période')}</div>
                        <div className="text-xl font-black text-white">{predictionResult.timeframe}</div>
                      </div>
                    </div>
                    <button onClick={() => setPredictionResult(null)} className="text-xs font-black text-primary-cyan uppercase tracking-widest hover:text-white transition-colors">← {t('New Analysis', 'Nouvelle Analyse')}</button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em]">{t('Recommended Allocations', 'Allocations Recommandées')}</h3>
                    {predictionResult.suggestions.map((s: any) => (
                      <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary-cyan/30 transition-all" onClick={() => onSelectContract(s)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-cyan/10 rounded-lg flex items-center justify-center text-primary-cyan text-[10px] font-black">{s.category.substring(0, 2)}</div>
                          <div>
                            <div className="text-[10px] font-black text-white uppercase">{s.name}</div>
                            <div className="text-[10px] font-mono text-on-surface-variant">Score: {s.totalScore}/1000</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-[10px] font-black ${s.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{s.growth >= 0 ? '+' : ''}{s.growth}%</div>
                          <button onClick={(e) => { e.stopPropagation(); onToggleWatchlist(e, s.id); }} className={`p-2 rounded-lg transition-all ${watchlist.includes(s.id) ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' : 'bg-white/5 text-on-surface-variant border border-transparent'}`}>
                            <Star size={14} fill={watchlist.includes(s.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeView;


