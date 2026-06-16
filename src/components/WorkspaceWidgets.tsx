import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, Globe, Sliders, TrendingUp, Bell, RefreshCw,
  ArrowRightLeft, LayoutGrid, Check, ChevronDown, Info,
  Play, Pause, Settings2
} from 'lucide-react';
import { CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type WidgetKey = 'project_analysis' | 'creative_network' | 'support_simulator' | 'revenue_projection' | 'project_alerts' | 'lya_converter';

interface WidgetDef {
  key: WidgetKey;
  icon: React.ReactNode;
  titleFR: string;
  titleEN: string;
  descFR: string;
  descEN: string;
  color: string;
}

// ─── DÉFINITIONS DES WIDGETS ──────────────────────────────────────────────────

const WIDGET_DEFS: WidgetDef[] = [
  {
    key: 'project_analysis',
    icon: <BarChart2 size={16} />,
    titleFR: 'Analyse de Projets LYA',
    titleEN: 'LYA Project Analysis',
    descFR: 'Score LYA, tendances et recommandations IA sur vos projets suivis.',
    descEN: 'LYA Score, trends and AI recommendations on your followed projects.',
    color: 'text-primary-cyan',
  },
  {
    key: 'creative_network',
    icon: <Globe size={16} />,
    titleFR: 'Réseau Créatif Mondial',
    titleEN: 'Global Creative Network',
    descFR: 'Projets actifs par pays et disciplines. Pulse de l\'écosystème LYA.',
    descEN: 'Active projects by country and discipline. Live LYA ecosystem pulse.',
    color: 'text-emerald-400',
  },
  {
    key: 'support_simulator',
    icon: <Sliders size={16} />,
    titleFR: 'Simulateur de Soutien',
    titleEN: 'Support Simulator',
    descFR: 'Simulez votre soutien sur n\'importe quel projet et visualisez vos gains potentiels.',
    descEN: 'Simulate your backing on any project and visualize your potential gains.',
    color: 'text-accent-gold',
  },
  {
    key: 'revenue_projection',
    icon: <TrendingUp size={16} />,
    titleFR: 'Projection de Revenus',
    titleEN: 'Revenue Projection',
    descFR: 'Estimation de votre co-partage des revenus sur 3, 6 et 12 mois.',
    descEN: 'Estimate your revenue co-share over 3, 6 and 12 months.',
    color: 'text-[#a78bfa]',
  },
  {
    key: 'project_alerts',
    icon: <Bell size={16} />,
    titleFR: 'Alertes Projets',
    titleEN: 'Project Alerts',
    descFR: 'Suivez les évolutions de vos projets favoris en temps réel.',
    descEN: 'Track your favourite projects\' progress in real time.',
    color: 'text-[#00ff88]',
  },
  {
    key: 'lya_converter',
    icon: <ArrowRightLeft size={16} />,
    titleFR: 'Convertisseur LYA',
    titleEN: 'LYA Converter',
    descFR: 'Convertissez des unités LYA en EUR / USD / GBP instantanément.',
    descEN: 'Convert LYA units to EUR / USD / GBP instantly.',
    color: 'text-rose-400',
  },
];

// ─── WIDGET : ANALYSE DE PROJETS ──────────────────────────────────────────────

const ProjectAnalysisWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const contracts = CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 4);
  return (
    <div className="space-y-3">
      <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('PROJETS LES MIEUX NOTÉS', 'TOP RATED PROJECTS')}</p>
      {contracts.map(c => (
        <div key={c.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-on-surface truncate">{c.name}</p>
            <p className="text-[9px] text-on-surface-variant/50 font-mono">{c.category}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black text-primary-cyan">{c.totalScore}<span className="text-on-surface-variant/40 font-normal">/1000</span></p>
            <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary-cyan rounded-full" style={{ width: `${(c.totalScore / 1000) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── WIDGET : RÉSEAU CRÉATIF ──────────────────────────────────────────────────

const CreativeNetworkWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const nodes = [
    { city: 'Paris', country: 'FR', projects: 12, ms: 14, active: true },
    { city: 'Tokyo', country: 'JP', projects: 8, ms: 44, active: true },
    { city: 'New York', country: 'US', projects: 15, ms: 28, active: true },
    { city: 'Lagos', country: 'NG', projects: 5, ms: 62, active: true },
    { city: 'São Paulo', country: 'BR', projects: 7, ms: 55, active: false },
  ];
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('HUBS CRÉATIFS ACTIFS', 'ACTIVE CREATIVE HUBS')}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400">LIVE</span>
        </div>
      </div>
      {nodes.map(n => (
        <div key={n.city} className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.active ? 'bg-emerald-400' : 'bg-white/20'}`} />
          <div className="flex-1">
            <p className="text-[10px] font-black text-on-surface">{n.city} <span className="text-on-surface-variant/40 font-normal text-[9px]">{n.country}</span></p>
          </div>
          <p className="text-[9px] font-mono text-on-surface-variant/50">{n.projects} {T('projets', 'projects')}</p>
          <p className="text-[9px] font-mono text-primary-cyan w-8 text-right">{n.ms}ms</p>
        </div>
      ))}
    </div>
  );
};

// ─── WIDGET : SIMULATEUR DE SOUTIEN ──────────────────────────────────────────

const SupportSimulatorWidget: React.FC<{ lang: 'FR' | 'EN', formatPrice: (n: number) => string }> = ({ lang, formatPrice }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [units, setUnits] = useState(10);
  const [selectedId, setSelectedId] = useState(CONTRACTS.filter(c => c.status === 'LIVE')[0]?.id || '');
  const contracts = CONTRACTS.filter(c => c.status === 'LIVE');
  const selected = contracts.find(c => c.id === selectedId);
  const unitPrice = selected ? LYA_UNIT_VALUE * (1 + (selected.growth || 0) / 100) : LYA_UNIT_VALUE;
  const totalCost = units * unitPrice;
  const revenueShare = selected?.revenueSharePercentage || 10;
  const coShare = ((units * revenueShare) / 10000).toFixed(3);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('PROJET CIBLÉ', 'TARGET PROJECT')}</p>
        <div className="relative">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-surface-high/50 border border-white/10 text-[10px] font-black text-on-surface py-2 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
            {contracts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('UNITÉS LYA', 'LYA UNITS')}</p>
          <p className="text-[9px] font-black text-primary-cyan">{units} {T('unités', 'units')}</p>
        </div>
        <input type="range" min={1} max={100} value={units} onChange={e => setUnits(+e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-cyan" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-high/40 border border-white/8 rounded-xl p-3">
          <p className="text-[8px] font-mono text-on-surface-variant/40 uppercase tracking-widest mb-1">{T('SOUTIEN TOTAL', 'TOTAL PLEDGE')}</p>
          <p className="text-sm font-black font-mono text-on-surface">{formatPrice(totalCost)}</p>
        </div>
        <div className="bg-surface-high/40 border border-white/8 rounded-xl p-3">
          <p className="text-[8px] font-mono text-on-surface-variant/40 uppercase tracking-widest mb-1">{T('CO-PARTAGE', 'CO-SHARE')}</p>
          <p className="text-sm font-black font-mono text-[#00ff88]">{coShare}%</p>
        </div>
      </div>
    </div>
  );
};

// ─── WIDGET : PROJECTION DE REVENUS ──────────────────────────────────────────

const RevenueProjectionWidget: React.FC<{ lang: 'FR' | 'EN', formatPrice: (n: number) => string }> = ({ lang, formatPrice }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [horizon, setHorizon] = useState<'3M' | '6M' | '12M'>('6M');
  const base = 250;
  const multiplier = horizon === '3M' ? 1.04 : horizon === '6M' ? 1.09 : 1.19;
  const projected = base * multiplier;

  const chartData = useMemo(() => {
    const pts = horizon === '3M' ? 3 : horizon === '6M' ? 6 : 12;
    return Array.from({ length: pts }, (_, i) => ({
      name: `M${i + 1}`,
      value: Math.round(base * (1 + (multiplier - 1) * ((i + 1) / pts))),
    }));
  }, [horizon, multiplier]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['3M', '6M', '12M'] as const).map(h => (
          <button key={h} onClick={() => setHorizon(h)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${horizon === h ? 'bg-primary-cyan/15 border border-primary-cyan/40 text-primary-cyan' : 'bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface'}`}>{h}</button>
        ))}
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} fill="url(#projGrad)" dot={false} />
            <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [formatPrice(v), T('Revenus', 'Revenue')]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('PROJECTION', 'PROJECTION')} {horizon}</p>
          <p className="text-xl font-black font-mono text-[#a78bfa]">{formatPrice(projected)}</p>
        </div>
        <p className="text-[9px] font-mono text-[#00ff88]">+{((multiplier - 1) * 100).toFixed(1)}% {T('estimé', 'estimated')}</p>
      </div>
    </div>
  );
};

// ─── WIDGET : ALERTES PROJETS ─────────────────────────────────────────────────

const ProjectAlertsWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [active, setActive] = useState(true);
  const alerts = [
    { project: 'CHRONOS_V3', eventFR: 'Score LYA +42 pts cette semaine', eventEN: 'LYA Score +42pts this week', time: '2h', color: 'text-emerald-400' },
    { project: 'RENAISSANCE REBORN', eventFR: 'Jalon de production validé', eventEN: 'Production milestone validated', time: '5h', color: 'text-primary-cyan' },
    { project: 'NEON DISTRICT #4', eventFR: 'Financement à 78% atteint', eventEN: 'Funding reached 78%', time: '1j', color: 'text-[#a78bfa]' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#00ff88] animate-pulse' : 'bg-white/20'}`} />
          <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{active ? T('SURVEILLANCE ACTIVE', 'MONITORING ACTIVE') : T('EN PAUSE', 'PAUSED')}</p>
        </div>
        <button onClick={() => setActive(!active)} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
          {active ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${a.color}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-on-surface">{a.project}</p>
            <p className="text-[9px] text-on-surface-variant/60">{lang === 'FR' ? a.eventFR : a.eventEN}</p>
          </div>
          <p className="text-[9px] font-mono text-on-surface-variant/30 shrink-0">{a.time}</p>
        </div>
      ))}
    </div>
  );
};

// ─── WIDGET : CONVERTISSEUR LYA ───────────────────────────────────────────────

const LYAConverterWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [units, setUnits] = useState(5);
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const rates: Record<'EUR' | 'USD' | 'GBP', number> = { USD: 1, EUR: 0.92, GBP: 0.79 };
  const symbols: Record<'EUR' | 'USD' | 'GBP', string> = { USD: '$', EUR: '€', GBP: '£' };
  const converted = (units * LYA_UNIT_VALUE * rates[currency]).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {(['EUR', 'USD', 'GBP'] as const).map(c => (
          <button key={c} onClick={() => setCurrency(c)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${currency === c ? 'bg-rose-400/15 border border-rose-400/40 text-rose-400' : 'bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface'}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <p className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('UNITÉS LYA', 'LYA UNITS')}</p>
          <p className="text-[9px] font-black text-on-surface">{units}</p>
        </div>
        <input type="range" min={1} max={250} value={units} onChange={e => setUnits(+e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-400" />
        <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/30">
          <span>1</span><span>125</span><span>250</span>
        </div>
      </div>
      <div className="bg-surface-high/40 border border-white/8 rounded-xl p-4 text-center">
        <p className="text-[9px] font-mono text-on-surface-variant/50 mb-1">{units} LYA UNIT{units > 1 ? 'S' : ''} =</p>
        <p className="text-2xl font-black font-mono text-rose-400">{symbols[currency]}{converted}</p>
        <p className="text-[8px] font-mono text-on-surface-variant/30 mt-1">1 LYA UNIT = {symbols[currency]}{(LYA_UNIT_VALUE * rates[currency]).toFixed(2)}</p>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL : WORKSPACE ─────────────────────────────────────────

export const WorkspaceWidgets: React.FC = () => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<WidgetKey[]>([
    'project_analysis', 'creative_network', 'support_simulator',
    'revenue_projection', 'project_alerts', 'lya_converter'
  ]);

  const toggleWidget = (key: WidgetKey) => {
    setActiveWidgets(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderWidget = (key: WidgetKey) => {
    switch (key) {
      case 'project_analysis': return <ProjectAnalysisWidget lang={lang} />;
      case 'creative_network': return <CreativeNetworkWidget lang={lang} />;
      case 'support_simulator': return <SupportSimulatorWidget lang={lang} formatPrice={formatPrice} />;
      case 'revenue_projection': return <RevenueProjectionWidget lang={lang} formatPrice={formatPrice} />;
      case 'project_alerts': return <ProjectAlertsWidget lang={lang} />;
      case 'lya_converter': return <LYAConverterWidget lang={lang} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid size={14} className="text-primary-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-cyan">
              {T('ESPACE PERSONNALISÉ', 'MY WORKSPACE')}
            </span>
            <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-[8px] font-black text-primary-cyan uppercase tracking-widest">BETA</span>
          </div>
          <p className="text-on-surface-variant/50 text-xs">
            {T('Configurez votre espace de travail avec les widgets qui vous correspondent.', 'Set up your workspace with the widgets that suit you best.')}
          </p>
        </div>
        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isConfiguring ? 'bg-primary-cyan text-surface-dim border-primary-cyan' : 'bg-surface-high/40 border-white/10 text-on-surface-variant hover:border-white/25 hover:text-on-surface'}`}
        >
          {isConfiguring ? <Check size={13} /> : <Settings2 size={13} />}
          {isConfiguring ? T('VALIDER', 'DONE') : T('PERSONNALISER', 'CUSTOMIZE')}
        </button>
      </div>

      {/* ── Catalogue de modules (mode config) ── */}
      <AnimatePresence>
        {isConfiguring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50 mb-4">
                {T('MODULES DISPONIBLES', 'AVAILABLE MODULES')} — {activeWidgets.length}/6 {T('actifs', 'active')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {WIDGET_DEFS.map(w => {
                  const isActive = activeWidgets.includes(w.key);
                  return (
                    <button
                      key={w.key}
                      onClick={() => toggleWidget(w.key)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${isActive ? 'bg-primary-cyan/8 border-primary-cyan/30' : 'bg-surface-high/30 border-white/8 hover:border-white/20'}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${isActive ? w.color : 'text-on-surface-variant/30'}`}>{w.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black truncate ${isActive ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                          {lang === 'FR' ? w.titleFR : w.titleEN}
                        </p>
                        <p className="text-[9px] text-on-surface-variant/40 leading-relaxed mt-0.5 line-clamp-2">
                          {lang === 'FR' ? w.descFR : w.descEN}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${isActive ? 'bg-primary-cyan border-primary-cyan' : 'border-white/20'}`}>
                        {isActive && <Check size={10} className="text-surface-dim" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grille de widgets actifs ── */}
      {activeWidgets.length === 0 ? (
        <div className="py-20 text-center">
          <LayoutGrid size={40} className="mx-auto text-on-surface-variant/20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/30">
            {T('Aucun widget actif — personnalisez votre espace ci-dessus', 'No active widgets — customize your workspace above')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeWidgets.map(key => {
            const def = WIDGET_DEFS.find(w => w.key === key)!;
            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-low/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Header de la carte widget */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                  <span className={def.color}>{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-on-surface uppercase tracking-wider truncate">
                      {lang === 'FR' ? def.titleFR : def.titleEN}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${def.color.replace('text-', 'bg-')} opacity-70 animate-pulse`} />
                    <span className="text-[8px] font-mono text-on-surface-variant/30 uppercase">LIVE</span>
                  </div>
                </div>
                {/* Contenu */}
                <div className="p-5">
                  {renderWidget(key)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
