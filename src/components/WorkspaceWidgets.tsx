import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, Globe, Sliders, TrendingUp, Bell, RefreshCw, Zap,
  LayoutGrid, Check, ChevronDown, Info,
  Play, Pause, Settings2
} from 'lucide-react';
import { CONTRACTS } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getStatut, getUnitPrice } from './mecenat/MecenatShared';
import { fetchRealtimeNews } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type WidgetKey = 'project_analysis' | 'creative_network' | 'support_simulator' | 'revenue_projection' | 'project_alerts' | 'live_feed';

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
    descFR: 'Simulez votre soutien sur n\'importe quel projet et visualisez le statut de reconnaissance obtenu.',
    descEN: 'Simulate your backing on any project and visualize the recognition status you\'d reach.',
    color: 'text-accent-gold',
  },
  {
    key: 'revenue_projection',
    icon: <TrendingUp size={16} />,
    titleFR: 'Projection de Score',
    titleEN: 'Score Projection',
    descFR: 'Simulez l\'évolution du Score LYA d\'un projet sur 6 mois selon son rythme de jalons certifiés.',
    descEN: 'Simulate a project\'s LYA Score evolution over 6 months based on its certified milestone pace.',
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
    key: 'live_feed',
    icon: <Zap size={16} />,
    titleFR: 'Flux Créatif en Direct',
    titleEN: 'Live Creative Feed',
    descFR: 'Actualités du monde créatif en temps réel, propulsées par l\'IA LYA.',
    descEN: 'Real-time creative industry news, powered by LYA AI.',
    color: 'text-primary-cyan',
  },
];

// ─── WIDGET : ANALYSE DE PROJETS ──────────────────────────────────────────────

const ProjectAnalysisWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [visible, setVisible] = useState(4);
  const allContracts = CONTRACTS.filter(c => c.status === 'LIVE');
  const contracts = allContracts.slice(0, visible);
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('PROJETS LES MIEUX NOTÉS', 'TOP RATED PROJECTS')}</p>
      {contracts.map(c => (
        <div key={c.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-on-surface truncate">{c.name}</p>
            <p className="text-xs text-on-surface-variant/60 font-mono">{c.category}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black text-primary-cyan">{c.totalScore}<span className="text-on-surface-variant/40 font-normal">/1000</span></p>
            <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary-cyan rounded-full" style={{ width: `${(c.totalScore / 1000) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
      {visible < allContracts.length && (
        <button
          onClick={() => setVisible(v => v + 4)}
          className="w-full py-2 text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors border-t border-white/5 pt-4"
        >
          {T('Voir Plus de Projets', 'Load More Projects')}
        </button>
      )}
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
        <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('HUBS CRÉATIFS ACTIFS', 'ACTIVE CREATIVE HUBS')}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-400">LIVE</span>
        </div>
      </div>
      {nodes.map(n => (
        <div key={n.city} className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.active ? 'bg-emerald-400' : 'bg-white/20'}`} />
          <div className="flex-1">
            <p className="text-sm font-black text-on-surface">{n.city} <span className="text-on-surface-variant/40 font-normal text-[11px]">{n.country}</span></p>
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant/50">{n.projects} {T('projets', 'projects')}</p>
          <p className="text-[11px] font-mono text-primary-cyan w-8 text-right">{n.ms}ms</p>
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
  const unitPrice = selected ? getUnitPrice(selected) : 50;
  const totalCost = units * unitPrice;
  const statut = getStatut(units);
  const currentScore = selected?.totalScore || 750;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('PROJET CIBLÉ', 'TARGET PROJECT')}</p>
        <div className="relative">
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-surface-high/50 border border-white/10 text-sm font-black text-on-surface py-2 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
            {contracts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('NIVEAU DE SOUTIEN', 'SUPPORT LEVEL')}</p>
          <p className="text-[11px] font-black text-primary-cyan">{T(`Niveau ${units}`, `Level ${units}`)}</p>
        </div>
        <input type="range" min={1} max={500} value={units} onChange={e => setUnits(+e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-cyan" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-surface-high/40 border border-white/8 rounded-xl p-3">
          <p className="text-xs font-mono text-on-surface-variant/40 uppercase tracking-widest mb-1">{T('SOUTIEN TOTAL', 'TOTAL PLEDGE')}</p>
          <p className="text-sm font-black font-mono text-on-surface">{formatPrice(totalCost)}</p>
        </div>
        <div className="bg-surface-high/40 border border-white/8 rounded-xl p-3">
          <p className="text-xs font-mono text-on-surface-variant/40 uppercase tracking-widest mb-1">{T('STATUT ATTEINT', 'STATUS REACHED')}</p>
          <p className={`text-sm font-black font-mono ${statut.color}`}>{lang === 'FR' ? statut.labelFR : statut.labelEN}</p>
        </div>
      </div>
      <p className="text-[10px] text-on-surface-variant/40 leading-relaxed">
        {T(`Score LYA actuel du projet : ${currentScore}/1000. Votre soutien vous donne accès à des contreparties de reconnaissance non-financières.`, `Current project LYA Score: ${currentScore}/1000. Your support grants access to non-financial recognition-based considerations.`)}
      </p>
    </div>
  );
};

// ─── WIDGET : PROJECTION DE REVENUS ──────────────────────────────────────────

const RevenueProjectionWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [scenario, setScenario] = useState<'CONSERVATIVE' | 'BALANCED' | 'OPTIMAL'>('BALANCED');
  const base = 620;
  const multiplier = scenario === 'CONSERVATIVE' ? 1.08 : scenario === 'BALANCED' ? 1.24 : 1.42;
  const projected = Math.min(1000, Math.round(base * multiplier));

  const chartData = useMemo(() => {
    const pts = 6;
    return Array.from({ length: pts }, (_, i) => ({
      name: `M${i + 1}`,
      value: Math.min(1000, Math.round(base * (1 + (multiplier - 1) * ((i + 1) / pts)))),
    }));
  }, [scenario, multiplier]);

  const scenarioLabel = {
    CONSERVATIVE: T('CONSERVATEUR', 'CONSERVATIVE'),
    BALANCED: T('ÉQUILIBRÉ', 'BALANCED'),
    OPTIMAL: T('OPTIMAL', 'OPTIMAL'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['CONSERVATIVE', 'BALANCED', 'OPTIMAL'] as const).map(s => (
          <button key={s} onClick={() => setScenario(s)} className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${scenario === s ? 'bg-primary-cyan/15 border border-primary-cyan/40 text-primary-cyan' : 'bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface'}`}>{scenarioLabel[s]}</button>
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
            <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }} formatter={(v: number) => [`${v}/1000`, T('Score LYA', 'LYA Score')]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('SCORE PROJETÉ', 'PROJECTED SCORE')} · 6M</p>
          <p className="text-xl font-black font-mono text-[#a78bfa]">{projected}<span className="text-xs text-on-surface-variant/40">/1000</span></p>
        </div>
        <p className="text-[11px] font-mono text-[#00ff88]">{T('selon jalons certifiés', 'based on certified milestones')}</p>
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
          <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{active ? T('SURVEILLANCE ACTIVE', 'MONITORING ACTIVE') : T('EN PAUSE', 'PAUSED')}</p>
        </div>
        <button onClick={() => setActive(!active)} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
          {active ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${a.color}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-on-surface">{a.project}</p>
            <p className="text-[11px] text-on-surface-variant/60">{lang === 'FR' ? a.eventFR : a.eventEN}</p>
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant/30 shrink-0">{a.time}</p>
        </div>
      ))}
    </div>
  );
};

// ─── WIDGET : FLUX CRÉATIF EN DIRECT ─────────────────────────────────────────

const LiveFeedWidget: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [items, setItems] = useState<any[]>([
    { id: 'f1', title: T('Nouveau projet certifié cette semaine', 'New certified project this week'), source: 'LYA Registry', time: T('À l\'instant', 'Just now') },
    { id: 'f2', title: T('Croissance du secteur Musique en hausse', 'Music sector growth trending up'), source: 'LYA Intelligence', time: T('12 min', '12m ago') },
  ]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await fetchRealtimeNews(lang);
      if (data && data.length > 0 && active) {
        setItems(data.slice(0, 4).map((item: any, idx: number) => ({
          id: item.id || `feed-${idx}`,
          title: item.title,
          source: item.source || 'LYA Intelligence',
          time: item.timestamp || T('À l\'instant', 'Just now'),
        })));
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono text-on-surface-variant/50 uppercase tracking-widest">{T('DERNIÈRES ACTUALITÉS', 'LATEST NEWS')}</p>
        <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
      </div>
      {loading ? (
        <div className="py-4 text-center">
          <div className="w-5 h-5 border-2 border-primary-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="pb-2 border-b border-white/5 last:border-0 last:pb-0">
            <p className="text-xs font-black text-on-surface leading-snug line-clamp-2">{item.title}</p>
            <p className="text-[10px] text-on-surface-variant/40 font-mono mt-1">{item.source} · {item.time}</p>
          </div>
        ))
      )}
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
    'revenue_projection', 'project_alerts', 'live_feed'
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
      case 'revenue_projection': return <RevenueProjectionWidget lang={lang} />;
      case 'project_alerts': return <ProjectAlertsWidget lang={lang} />;
      case 'live_feed': return <LiveFeedWidget lang={lang} />;
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
            <span className="px-3 py-0.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-xs font-black text-primary-cyan uppercase tracking-widest">BETA</span>
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
      <AnimatePresence mode="sync">
        {isConfiguring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50 mb-4">
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
                        <p className="text-xs text-on-surface-variant/50 leading-relaxed mt-0.5 line-clamp-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider truncate">
                      {lang === 'FR' ? def.titleFR : def.titleEN}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${def.color.replace('text-', 'bg-')} opacity-70 animate-pulse`} />
                    <span className="text-xs font-mono text-on-surface-variant/30 uppercase">LIVE</span>
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
