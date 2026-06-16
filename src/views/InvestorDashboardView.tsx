import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { RealtimeChart } from '../components/RealtimeChart';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/DashboardModals';
import {
  TrendingUp, DollarSign, Zap, Star, BarChart2, ArrowUpRight,
  Bell, Users, Filter, ChevronDown, ExternalLink, Sparkles, Target
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area } from 'recharts';

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; subColor?: string; color: string }> = ({ icon, label, value, sub, subColor = 'text-emerald-400', color }) => (
  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/15 transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-on-surface-variant/60 font-medium">{label}</p>
      <p className="text-2xl font-black text-on-surface tracking-tight">{value}</p>
      {sub && <p className={`text-xs font-bold mt-0.5 ${subColor}`}>{sub}</p>}
    </div>
  </div>
);

export const InvestorDashboardView: React.FC<{ user: UserProfile | null; onNotify: (msg: string) => void; onViewChange: (v: any) => void }> = ({ user, onNotify, onViewChange }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'portfolio' | 'investments' | 'analytics' | 'social'>('portfolio');
  const [contactProject, setContactProject] = useState<string|null>(null);
  const [socialMessage, setSocialMessage] = useState('');
  const [socialPosts, setSocialPosts] = useState<{user:string;avatar:string;action:string;project:string;time:string;likes:number;comments:number;liked:boolean;quote?:string}[]>([
    { user: 'Emma Laurent', avatar: '👩', action: T('a soutenu 5000€ dans','pledged €5000 in'), project: 'Digital Dreams', time: T('Il y a 3h','3h ago'), likes: 24, comments: 8, liked: false },
    { user: 'Thomas Martin', avatar: '👨', action: T('a commenté','commented on'), project: 'Future Memories', time: T('Il y a 5h','5h ago'), likes: 15, comments: 3, liked: false, quote: T('"Projet incroyable ! La trajectoire LYA est excellente 🚀"','"Incredible project! The LYA trajectory is excellent 🚀"') },
    { user: 'Sophie Bernard', avatar: '👩', action: T('a aimé','liked'), project: 'Urban Canvas', time: T('Il y a 7h','7h ago'), likes: 32, comments: 12, liked: false },
  ]);
  const [compareMode, setCompareMode] = useState<'bars' | 'radar'>('bars');
  const [predHorizon, setPredHorizon] = useState<'7j' | '30j' | '90j' | '1an'>('30j');
  const [showFilters, setShowFilters] = useState(false);

  const myInvestments = CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 3);
  const alerts = [
    { textFR: 'Digital Horizons a atteint +150% de variation', textEN: 'Digital Horizons reached +150% variation', time: T('Il y a 2h', '2h ago') },
    { textFR: 'Nouveau jalon complété sur Algorithmic Dreams', textEN: 'New milestone completed on Algorithmic Dreams', time: T('Il y a 5h', '5h ago') },
    { textFR: 'Urban Poetry approche d\'une étape importante', textEN: 'Urban Poetry approaching a key milestone', time: T('Il y a 1j', '1 day ago') },
  ];

  const trends = [
    { cat: T('Art Digital','Digital Art'), pct: '+12.5', up: true },
    { cat: T('Musique','Music'), pct: '+8.3', up: true },
    { cat: T('Film','Film'), pct: '-2.1', up: false },
    { cat: T('Design','Design'), pct: '+15.7', up: true },
  ];

  const roiByType = [
    { cat: T('Musique','Music'), roi: 32.4, projects: 5 },
    { cat: T('Art Visuel','Visual Art'), roi: 28.1, projects: 4 },
    { cat: T('Cinéma','Cinema'), roi: 18.5, projects: 2 },
    { cat: T('Écriture','Writing'), roi: 15.2, projects: 1 },
  ];

  const compareData = myInvestments.slice(0, 3).map((c, i) => ({
    name: c.registryIndex,
    score: c.totalScore,
    engagement: Math.round(700 + Math.random() * 200),
    growth: Math.round(c.growth * 10),
    revenue: Math.round(40 + Math.random() * 20),
  }));

  const predMultiplier = predHorizon === '7j' ? 1.02 : predHorizon === '30j' ? 1.097 : predHorizon === '90j' ? 1.18 : 1.32;
  const predBase = 231000;
  const predValue = Math.round(predBase * predMultiplier);

  const tabs = [
    { key: 'portfolio' as const, labelFR: 'Mon Portfolio', labelEN: 'My Portfolio' },
    { key: 'investments' as const, labelFR: 'Mes Soutiens', labelEN: 'My Pledges' },
    { key: 'analytics' as const, labelFR: 'Analytics', labelEN: 'Analytics' },
    { key: 'social' as const, labelFR: 'Hub Social', labelEN: 'Social Hub' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        titleWhite={T('MON', 'MY')}
        titleAccent={T('PORTFOLIO', 'PORTFOLIO')}
        description={T('Suivez vos soutiens et collections en temps réel', 'Track your pledges and collections in real time')}
        accentColor="text-emerald-400"
      />

      {/* Bouton analytics */}
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveSection('analytics')} className="flex items-center gap-2 px-5 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider">
          <BarChart2 size={14} /> {T('Analytics Avancées', 'Advanced Analytics')}
        </button>
      </div>

      {/* Tendances marché */}
      <div className="bg-surface-low/30 border border-white/6 rounded-xl p-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest shrink-0">
          <TrendingUp size={11} /> {T('Tendances du marché', 'Market trends')}
        </div>
        <div className="w-px h-4 bg-white/10 shrink-0" />
        {trends.map((tr, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0 px-3 py-1 bg-surface-high/40 rounded-lg border border-white/8">
            <span className="text-[11px] font-bold text-on-surface">{tr.cat}</span>
            <span className={`text-[11px] font-black ${tr.up ? 'text-emerald-400' : 'text-rose-400'}`}>{tr.up ? '↑' : '↓'}{tr.pct}%</span>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)}
            className={`px-5 pb-4 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection === tab.key ? 'text-emerald-400' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {T(tab.labelFR, tab.labelEN)}
            {activeSection === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 transition-all duration-300" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ─── PORTFOLIO ─── */}
          {activeSection === 'portfolio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <DollarSign size={20} className="text-primary-cyan"/>, label: T('Investissement Total','Total Investment'), value: formatPrice(35000), sub: '+12.3% ce mois', color: 'bg-primary-cyan/10' },
                  { icon: <TrendingUp size={20} className="text-emerald-400"/>, label: T('Valeur Actuelle','Current Value'), value: formatPrice(48576), sub: '+38.86% gain', color: 'bg-emerald-400/10' },
                  { icon: <Target size={20} className="text-[#a78bfa]"/>, label: T('Projets Actifs','Active Projects'), value: '3', sub: T('En portefeuille','In portfolio'), subColor: 'text-[#a78bfa]', color: 'bg-[#a78bfa]/10' },
                  { icon: <Star size={20} className="text-accent-gold"/>, label: T('Opportunités','Opportunities'), value: '12', sub: T('Nouveaux projets chauds','New hot projects'), subColor: 'text-accent-gold', color: 'bg-accent-gold/10' },
                ].map((k, i) => <KpiCard key={i} {...k} />)}
              </div>

              {/* Portfolio + Alertes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Performance du portefeuille','Portfolio Performance')}</p>
                    <div className="flex items-center gap-1 ml-auto">
                      {(['7D','1M','3M','1Y','ALL'] as const).map(p => (
                        <button key={p} className={`px-3.5 py-1 rounded-lg text-[10px] font-black transition-all ${p === '1M' ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <RealtimeChart color="#10b981" base={231000} lang={lang} formatPrice={formatPrice} labelFR="Valeur" labelEN="Value" showPrice={true} />
                </div>

                <div className="space-y-4">
                  {/* Alertes */}
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-primary-cyan" />
                        <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Alertes','Alerts')}</p>
                      </div>
                      <span className="w-5 h-5 bg-rose-400 rounded-full text-[10px] font-black text-white flex items-center justify-center">3</span>
                    </div>
                    {alerts.map((a, i) => (
                      <div key={i} className="space-y-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                        <p className="text-xs font-medium text-on-surface leading-relaxed">{T(a.textFR, a.textEN)}</p>
                        <p className="text-[10px] text-on-surface-variant/40 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-on-surface-variant/30" />{a.time}</p>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Star size={13} className="text-accent-gold" />{T('Statistiques','Statistics')}</p>
                    {[
                      { l: T('Meilleur soutien','Best pledge'), v: '+175%', c: 'text-emerald-400', sub: 'Algorithmic Dreams' },
                      { l: T('Soutien moyen','Average pledge'), v: formatPrice(11667), c: 'text-on-surface', sub: null },
                      { l: T('Date premier soutien','First pledge date'), v: '20 août 2025', c: 'text-on-surface', sub: null },
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-xs text-on-surface-variant/60">{s.l}</p>
                          {s.sub && <p className="text-[10px] text-on-surface-variant/30">{s.sub}</p>}
                        </div>
                        <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MES SOUTIENS ─── */}
          {activeSection === 'investments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{T('Mes Soutiens','My Pledges')} <span className="text-on-surface-variant/40 font-normal text-sm">{myInvestments.length} {T('projets','projects')}</span></h3>
              </div>

              {myInvestments.map((proj, pi) => {
                const invested = [10000, 15000, 10000][pi];
                const currentVal = [12500, 18900, 22000][pi];
                const profit = currentVal - invested;
                const roi = ((profit / invested) * 100).toFixed(2);
                return (
                  <div key={proj.id} className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="flex items-center gap-4 p-5">
                      <img src={proj.image} alt={proj.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="text-[10px] text-on-surface-variant/40 font-mono">ID: {proj.registryIndex}</p>
                        <h3 className="text-base font-black text-on-surface">{proj.name}</h3>
                        <span className="inline-block px-3 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[10px] font-black text-emerald-400 mt-1">● {T('ACCÉLÉRATION','ACCELERATION')}</span>
                      </div>
                      <button onClick={() => setContactProject(proj.name)} className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/6 border-t border-white/6">
                      {[
                        { l: T('Investi','Invested'), v: formatPrice(invested), c: 'text-on-surface' },
                        { l: T('Valeur','Value'), v: formatPrice(currentVal), c: 'text-primary-cyan' },
                        { l: T('Profit','Profit'), v: formatPrice(profit), c: 'text-emerald-400' },
                        { l: 'ROI', v: `+${roi}%`, c: 'text-emerald-400' },
                      ].map((s, i) => (
                        <div key={i} className="p-4">
                          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                          <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── ANALYTICS ─── */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-on-surface tracking-tight">{T('Analytics','Analytics')} <span className="text-emerald-400">{T('Investisseur','Investor')}</span></h2>
                  <p className="text-sm text-on-surface-variant/50">{T('Tableau de bord pour créateurs, mécènes et professionnels','Dashboard for creators, patrons and professionals')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {[{l:T('Portfolio Total','Total Portfolio'),v:T('12 Projets','12 Projects'),c:'text-on-surface'},{l:T('ROI Moyen','Average ROI'),v:'+24.5%',c:'text-emerald-400'}].map((s,i)=>(
                    <div key={i} className="bg-surface-low/40 border border-white/10 rounded-xl px-4 py-3 text-right">
                      <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">{s.l}</p>
                      <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtres avancés */}
              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider">
                  <Filter size={14} /> {T('Filtres Avancés','Advanced Filters')} <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                {showFilters && (
                  <div className="absolute top-12 left-0 z-30 bg-surface-low border border-white/10 rounded-2xl p-5 w-80 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-on-surface">{T('Filtres Avancés','Advanced Filters')}</p>
                      <button onClick={() => setShowFilters(false)} className="text-on-surface-variant hover:text-on-surface">✕</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[T('Mes Top Performers','My Top Performers'), T('Opportunités de Croissance','Growth Opportunities'), T('Projets Musicaux','Music Projects')].map(f => (
                        <button key={f} className="px-3 py-1.5 bg-surface-high/50 border border-white/10 rounded-full text-[10px] font-black text-on-surface-variant hover:text-primary-cyan hover:border-primary-cyan/30 transition-all uppercase tracking-widest">{f}</button>
                      ))}
                    </div>
                    {[T('Score LYA','LYA Score'), T('Type de Projet','Project Type'), T('Performance','Performance'), T('Montant Investi','Amount Invested')].map(f => (
                      <div key={f} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-sm text-on-surface-variant/60">{f}</span>
                        <ChevronDown size={12} className="text-on-surface-variant/40" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { l: T('Investissement Total','Total Investment'), v: formatPrice(185400), sub: '+12.3% ce mois', c: 'text-primary-cyan' },
                  { l: T('Valeur Actuelle','Current Value'), v: formatPrice(230800), sub: '+24.5% gain', c: 'text-emerald-400' },
                  { l: T('Projets Actifs','Active Projects'), v: '12', sub: T('8 en croissance','8 growing'), c: 'text-[#a78bfa]' },
                  { l: T('Opportunités','Opportunities'), v: '24', sub: T('6 recommandées','6 recommended'), c: 'text-accent-gold' },
                ].map((k, i) => (
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-2">
                    <p className="text-xs text-on-surface-variant/50 font-medium uppercase tracking-widest">{k.l}</p>
                    <p className={`text-2xl font-black ${k.c}`}>{k.v}</p>
                    <p className="text-xs text-emerald-400 font-bold">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Valeur Portfolio Temps Réel */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-400/10 rounded-lg flex items-center justify-center text-emerald-400"><TrendingUp size={15}/></div>
                  <div>
                    <p className="text-sm font-black text-on-surface">{T('Valeur Portfolio Temps Réel','Real-time Portfolio Value')}</p>
                    <p className="text-xs text-on-surface-variant/50">{T('Suivi live de la performance','Live performance tracking')}</p>
                  </div>
                </div>
                <RealtimeChart color="#10b981" base={231000} lang={lang} formatPrice={formatPrice} labelFR="Valeur" labelEN="Value" showPrice={true} />
              </div>

              {/* Comparateur */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-cyan/10 rounded-lg flex items-center justify-center text-primary-cyan"><BarChart2 size={15}/></div>
                    <p className="text-sm font-black text-on-surface">{T('Comparateur de Projets','Project Comparator')}</p>
                  </div>
                  <div className="flex gap-1">
                    {(['bars', 'radar'] as const).map(m => (
                      <button key={m} onClick={() => setCompareMode(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${compareMode === m ? 'bg-primary-cyan/15 border border-primary-cyan/30 text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface border border-white/8'}`}>
                        {m === 'bars' ? T('Barres','Bars') : 'Radar'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meilleur performer */}
                <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-gold/20 rounded-lg flex items-center justify-center text-accent-gold"><Star size={14}/></div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{T('Meilleur performeur (Score LYA)','Best performer (LYA Score)')}</p>
                    <p className="text-sm font-black text-on-surface">{compareData[0]?.name} — <span className="text-accent-gold">{compareData[0]?.score}</span></p>
                  </div>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {compareMode === 'bars' ? (
                      <BarChart data={compareData} barSize={60} barGap={16}>
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                        <YAxis hide domain={[0, 1000]}/>
                        <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="score" fill="url(#compareGrad)" radius={[6,6,0,0]}>
                          <defs>
                            <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#10b981"/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    ) : (
                      <RadarChart data={compareData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                        <Radar name={T('Score','Score')} dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
                      </RadarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {compareData.map((d, i) => (
                    <div key={i} className="bg-surface-high/30 rounded-xl p-3 text-center">
                      <p className="text-xs text-on-surface-variant/40 font-mono mb-1">{d.name}</p>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${['bg-[#a78bfa]','bg-primary-cyan','bg-emerald-400'][i]}`}/>
                      <p className="text-sm font-black text-on-surface">{d.score}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prédiction Portfolio */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#a78bfa]/10 rounded-lg flex items-center justify-center text-[#a78bfa]"><Sparkles size={15}/></div>
                    <div>
                      <p className="text-sm font-black text-on-surface">{T('Prédiction Portfolio','Portfolio Prediction')}</p>
                      <p className="text-xs text-on-surface-variant/50">{T('Analyse prédictive IA','AI predictive analysis')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{T('Confiance IA','AI Confidence')}</p>
                    <p className="text-lg font-black text-emerald-400">82%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {(['7j','30j','90j','1an'] as const).map(h => (
                    <button key={h} onClick={() => setPredHorizon(h)} className={`py-2.5 rounded-xl text-sm font-black transition-all ${predHorizon === h ? 'bg-[#a78bfa] text-surface-dim' : 'bg-surface-high/30 border border-white/8 text-on-surface-variant hover:text-on-surface'}`}>
                      {h}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { l: T('Prévision','Forecast'), v: formatPrice(predValue), c: 'text-[#a78bfa]', sub: `+${((predMultiplier-1)*100).toFixed(1)}%` },
                    { l: T('Tendance','Trend'), v: T('Haussière','Bullish'), c: 'text-emerald-400', sub: T('Haute confiance','High confidence') },
                    { l: T('Potentiel','Potential'), v: formatPrice(Math.round(predBase * predMultiplier * 1.12)), c: 'text-accent-gold', sub: T('Optimiste','Optimistic') },
                  ].map((s, i) => (
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-4">
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                      <p className="text-xs text-on-surface-variant/40">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI par type */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('ROI par Type de Projet','ROI by Project Type')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roiByType.map((r, i) => {
                    const colors = ['text-[#a78bfa]','text-primary-cyan','text-emerald-400','text-accent-gold'];
                    const dots = ['bg-[#a78bfa]','bg-primary-cyan','bg-emerald-400','bg-accent-gold'];
                    return (
                      <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${dots[i]}`} />
                          <p className="text-sm font-black text-on-surface">{r.cat}</p>
                        </div>
                        <p className={`text-2xl font-black ${colors[i]}`}>+{r.roi}%</p>
                        <p className="text-xs text-on-surface-variant/40">{r.projects} {T('projets','projects')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── HUB SOCIAL ─── */}
          {activeSection === 'social' && (
            <div className="space-y-5 max-w-2xl">
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-primary-cyan" />
                    <p className="text-sm font-black text-on-surface">{T('Hub Social','Social Hub')}</p>
                    <Users size={14} className="text-primary-cyan" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant/50">{T('Fil d\'actualité de la communauté LinkYourArt en temps réel','Real-time LinkYourArt community feed')}</p>

                <div className="space-y-3">
                  {[
                    { user: 'Emma Laurent', avatar: '👩', action: T('a soutenu 5000€ dans','pledged €5000 in'), project: 'Digital Dreams', time: T('Il y a 3h','3h ago'), likes: 24, comments: 8 },
                    { user: 'Thomas Martin', avatar: '👨', action: T('a commenté','commented on'), project: 'Future Memories', time: T('Il y a 5h','5h ago'), likes: 15, comments: 3, quote: T('"Projet incroyable ! La trajectoire LYA est excellente 🚀"','"Incredible project! The LYA trajectory is excellent 🚀"') },
                    { user: 'Sophie Bernard', avatar: '👩', action: T('a aimé','liked'), project: 'Urban Canvas', time: T('Il y a 7h','7h ago'), likes: 32, comments: 12 },
                  ].map((post, i) => (
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-4 space-y-2 hover:border-white/15 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-dim border border-white/10 flex items-center justify-center text-lg">{post.avatar}</div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-on-surface">{post.user} <span className="font-normal text-on-surface-variant/60">{post.action}</span> <span className="text-primary-cyan font-bold">{post.project}</span></p>
                          <p className="text-[10px] text-on-surface-variant/40">{post.time}</p>
                        </div>
                      </div>
                      {post.quote && <p className="text-xs text-on-surface-variant/70 italic pl-12">{post.quote}</p>}
                      <div className="flex items-center gap-4 pl-12 text-[10px] text-on-surface-variant/40">
                        <button onClick={() => { const cur = socialPosts[i]; setSocialPosts(prev => prev.map((p,pi) => pi === i ? {...p, liked: !cur.liked, likes: cur.liked ? cur.likes-1 : cur.likes+1} : p)); }} className="hover:text-rose-400 transition-colors flex items-center gap-1">{socialPosts[i]?.liked ? "♥" : "♡"} {post.likes}</button>
                        <button className="hover:text-primary-cyan transition-colors flex items-center gap-1">💬 {post.comments}</button>
                        <button className="hover:text-[#a78bfa] transition-colors">↗</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-surface-dim border border-white/10 flex items-center justify-center text-lg">🙂</div>
                  <div className="flex-1 bg-surface-high/40 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <input value={socialMessage} onChange={e => setSocialMessage(e.target.value)} placeholder={T('Partagez votre expérience...','Share your experience...')} className="flex-1 bg-transparent text-sm text-on-surface focus:outline-none" />
                    <button onClick={() => { if (socialMessage.trim()) { setSocialPosts(prev => [{ user: user?.displayName || 'Vous', avatar: '🙂', action: T('a partagé','shared'), project: 'LinkYourArt', time: T('À l\'instant','Just now'), likes: 0, comments: 0, liked: false }, ...prev]); setSocialMessage(''); } }} className="w-7 h-7 bg-[#a78bfa] rounded-lg flex items-center justify-center text-surface-dim hover:bg-white transition-all">↗</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal open={!!contactProject} onClose={() => setContactProject(null)} title={T('Contacter le créateur','Contact creator')}>
        <p className="text-sm text-on-surface-variant/60">{T('Projet :','Project:')} <span className="text-primary-cyan font-black">{contactProject}</span></p>
        <p className="text-sm text-on-surface-variant/60 leading-relaxed">{T('Votre demande sera transmise au créateur via la plateforme LYA. Délai de réponse : 24-48h.','Your request will be forwarded to the creator via the LYA platform. Response time: 24-48h.')}</p>
        <button onClick={() => { onNotify(T(`✦ Message envoyé`, `✦ Message sent`)); setContactProject(null); }}
          className="w-full py-3 bg-primary-cyan text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest">
          {T('Envoyer la demande', 'Send request')}
        </button>
      </Modal>
    </div>
  );
};