import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { RealtimeChart } from '../components/RealtimeChart';
import { PageHeader } from '../components/ui/PageHeader';
import {
  TrendingUp, Users, DollarSign, Zap, Upload, FileText, Music,
  Image, Plus, ChevronDown, CheckCircle, Clock, Star, BarChart2,
  Play, Sparkles, Target, Award, ArrowUpRight, X, Flag
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

// ─── HELPER ───────────────────────────────────────────────────────────────────

const genChartData = (points: number, base: number, growth: number) =>
  Array.from({ length: points }, (_, i) => ({
    t: `J${i + 1}`,
    v: Math.round(base * (1 + (growth / 100) * (i / points)) + (Math.random() - 0.5) * base * 0.05),
  }));

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/15 transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-on-surface-variant/60 font-medium">{label}</p>
      <p className="text-2xl font-black text-on-surface tracking-tight">{value}</p>
      {sub && <p className="text-xs text-emerald-400 font-bold mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── SIMULATEUR LYA ───────────────────────────────────────────────────────────

const LYASimulator: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const steps = [
    {
      labelFR: 'Visibilité & Rayonnement', labelEN: 'Visibility & Reach',
      descFR: 'Présence médiatique, réseaux sociaux, expositions', descEN: 'Media presence, social networks, exhibitions',
      color: 'bg-[#a78bfa]/10 text-[#a78bfa]', maxPts: 200,
      questions: [
        { qFR: 'Nombre de followers sur les réseaux sociaux', qEN: 'Social media followers', options: ['< 1,000 — 20pts', '1,000-10,000 — 50pts', '10,000-50,000 — 100pts', '> 50,000 — 200pts'] },
        { qFR: 'Expositions / Publications cette année', qEN: 'Exhibitions / Publications this year', options: ['Aucune — 0pts', '1-2 — 30pts', '3-5 — 70pts', '6+ — 100pts'] },
      ]
    },
    {
      labelFR: 'Qualité Artistique', labelEN: 'Artistic Quality',
      descFR: 'Originalité, technique, cohérence créative', descEN: 'Originality, technique, creative consistency',
      color: 'bg-primary-cyan/10 text-primary-cyan', maxPts: 250,
      questions: [
        { qFR: 'Niveau de reconnaissance professionnelle', qEN: 'Professional recognition level', options: ['Débutant — 50pts', 'Confirmé — 100pts', 'Expert — 175pts', 'Maître — 250pts'] },
        { qFR: 'Cohérence de l\'univers créatif', qEN: 'Creative universe consistency', options: ['En développement — 30pts', 'Établi — 70pts', 'Distinctif — 120pts', 'Iconique — 150pts'] },
      ]
    },
    {
      labelFR: 'Potentiel Commercial', labelEN: 'Commercial Potential',
      descFR: 'Revenus générés, marché, demande', descEN: 'Revenue generated, market, demand',
      color: 'bg-emerald-400/10 text-emerald-400', maxPts: 250,
      questions: [
        { qFR: 'Revenus de votre activité créative (annuel)', qEN: 'Creative activity revenue (annual)', options: ['< 5K€ — 40pts', '5K-20K€ — 100pts', '20K-100K€ — 180pts', '> 100K€ — 250pts'] },
      ]
    },
    {
      labelFR: 'Infrastructure Légale', labelEN: 'Legal Infrastructure',
      descFR: 'Structure juridique, droits, contrats', descEN: 'Legal structure, rights, contracts',
      color: 'bg-accent-gold/10 text-accent-gold', maxPts: 150,
      questions: [
        { qFR: 'Droits et protection de votre œuvre', qEN: 'Work rights and protection', options: ['Non protégé — 20pts', 'Enregistré — 60pts', 'Déposé — 100pts', 'Breveté — 150pts'] },
      ]
    },
    {
      labelFR: 'Co-Production', labelEN: 'Co-Production',
      descFR: 'Collaboration, partenaires, capacité d\'échange', descEN: 'Collaboration, partners, exchange capacity',
      color: 'bg-rose-400/10 text-rose-400', maxPts: 150,
      questions: [
        { qFR: 'Expérience de co-production', qEN: 'Co-production experience', options: ['Aucune — 20pts', 'Quelques — 60pts', 'Régulière — 100pts', 'Extensive — 150pts'] },
      ]
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [done, setDone] = useState(false);

  const totalPts = Object.values(answers).flat().reduce((s, pts) => s + pts, 0);
  const maxPts = 1000;

  const parsePoints = (opt: string) => parseInt(opt.match(/(\d+)pts/)?.[1] || '0');

  const handleAnswer = (qIdx: number, opt: string) => {
    const pts = parsePoints(opt);
    const prev = answers[currentStep] ? [...answers[currentStep]] : [];
    prev[qIdx] = pts;
    setAnswers({ ...answers, [currentStep]: prev });
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else setDone(true);
  };

  const reset = () => { setCurrentStep(0); setAnswers({}); setDone(false); };

  const progress = ((currentStep + (done ? 1 : 0)) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-on-surface-variant/60 font-medium">{T(`Étape ${currentStep + 1} sur ${steps.length}`, `Step ${currentStep + 1} of ${steps.length}`)}</span>
        <span className="font-black text-primary-cyan">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Header étape */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${step.color}`}>
              <Star size={12} /> {T(step.labelFR, step.labelEN)} — Max {step.maxPts} pts
            </div>
            <p className="text-sm text-on-surface-variant/60">{T(step.descFR, step.descEN)}</p>

            {step.questions.map((q, qi) => (
              <div key={qi} className="space-y-3">
                <p className="text-sm font-black text-on-surface">{qi + 1}. {T(q.qFR, q.qEN)}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const pts = parsePoints(opt);
                    const label = opt.split(' — ')[0];
                    const selected = answers[currentStep]?.[qi] === pts;
                    return (
                      <button key={opt} onClick={() => handleAnswer(qi, opt)}
                        className={`p-3 rounded-xl border text-left transition-all ${selected ? 'bg-primary-cyan/10 border-primary-cyan/40 text-primary-cyan' : 'bg-surface-high/30 border-white/8 text-on-surface-variant hover:border-white/20 hover:text-on-surface'}`}
                      >
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-xs text-primary-cyan font-black mt-0.5">+{pts} pts</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={next} className="w-full py-4 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
              {currentStep < steps.length - 1 ? T('Étape suivante →', 'Next step →') : T('Voir mon score →', 'See my score →')}
            </button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div className={`rounded-2xl p-6 text-center border ${totalPts >= 700 ? 'bg-emerald-400/8 border-emerald-400/25' : totalPts >= 400 ? 'bg-accent-gold/8 border-accent-gold/25' : 'bg-rose-400/8 border-rose-400/25'}`}>
              <p className="text-sm text-on-surface-variant/50 uppercase tracking-widest mb-2">{T('Votre Score LYA Estimé', 'Your Estimated LYA Score')}</p>
              <p className={`text-6xl font-black font-mono ${totalPts >= 700 ? 'text-emerald-400' : totalPts >= 400 ? 'text-accent-gold' : 'text-rose-400'}`}>{totalPts}<span className="text-2xl text-on-surface-variant/30">/1000</span></p>
              <p className={`mt-3 text-sm font-black uppercase tracking-widest ${totalPts >= 700 ? 'text-emerald-400' : totalPts >= 400 ? 'text-accent-gold' : 'text-rose-400'}`}>
                {totalPts >= 700 ? T('✦ Excellent — Éligible à l\'indexation LYA', '✦ Excellent — Eligible for LYA indexation') :
                 totalPts >= 400 ? T('⚡ Bon — Quelques améliorations recommandées', '⚡ Good — Some improvements recommended') :
                                   T('↑ En développement — Continuez à progresser', '↑ Developing — Keep progressing')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {steps.map((s, i) => {
                const stepPts = answers[i]?.reduce((a, b) => a + b, 0) || 0;
                return (
                  <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest mb-1">{T(s.labelFR, s.labelEN).split(' ')[0]}</p>
                    <p className="text-sm font-black text-primary-cyan">{stepPts}<span className="text-xs text-on-surface-variant/30">/{s.maxPts}</span></p>
                  </div>
                );
              })}
            </div>
            <button onClick={reset} className="w-full py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest">
              {T('Recommencer le simulateur', 'Restart the simulator')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── CARTE CHALEUR ────────────────────────────────────────────────────────────

const HeatmapCard: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const days = [T('Lun', 'Mon'), T('Mar', 'Tue'), T('Mer', 'Wed'), T('Jeu', 'Thu'), T('Ven', 'Fri'), T('Sam', 'Sat'), T('Dim', 'Sun')];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = days.map(() => hours.map(() => Math.random()));
  const [hovered, setHovered] = useState<{ day: string; hour: number; val: number } | null>(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="flex gap-1" style={{ minWidth: 600 }}>
          <div className="flex flex-col gap-1 pt-6">
            {days.map(d => <div key={d} className="h-5 w-8 text-[9px] text-on-surface-variant/40 font-mono flex items-center">{d}</div>)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex gap-1 mb-1">
              {[T('0h','0h'), T('6h','6h'), T('12h','12h'), T('18h','18h')].map((h, i) => (
                <div key={i} className="text-[9px] text-on-surface-variant/30 font-mono" style={{ marginLeft: i === 0 ? 0 : '25%' }}>{h}</div>
              ))}
            </div>
            {data.map((row, di) => (
              <div key={di} className="flex gap-0.5">
                {row.map((val, hi) => (
                  <div
                    key={hi}
                    className="h-5 flex-1 rounded-sm cursor-pointer transition-all hover:scale-110"
                    style={{ background: `rgba(167, 139, 250, ${val * 0.8 + 0.1})` }}
                    onMouseEnter={() => setHovered({ day: days[di], hour: hi, val })}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {hovered && (
        <div className="bg-surface-high/80 border border-white/10 rounded-lg p-3 text-xs">
          <p className="font-black text-on-surface">{hovered.day} {T('à', 'at')} {hovered.hour}h — {T('Engagement:', 'Engagement:')} <span className="text-[#a78bfa]">{Math.round(hovered.val * 99)}%</span></p>
          <p className="text-on-surface-variant/50">{Math.round(hovered.val * 500)} {T('interactions', 'interactions')}</p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-on-surface-variant/40">
        <div className="flex items-center gap-2">
          <span>{T('Moins actif', 'Less active')}</span>
          {[0.15, 0.35, 0.55, 0.75, 0.95].map(o => <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(167,139,250,${o})` }} />)}
          <span>{T('Plus actif', 'More active')}</span>
        </div>
        <span>{T('7 derniers jours', 'Last 7 days')}</span>
      </div>
    </div>
  );
};

// ─── VUE PRINCIPALE ───────────────────────────────────────────────────────────

export const CreatorDashboardView: React.FC<{ user: UserProfile | null; onNotify: (msg: string) => void; onViewChange: (v: any) => void }> = ({ user, onNotify, onViewChange }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'milestones' | 'simulator' | 'analytics'>('overview');

  // Projets du créateur (les 2 premiers comme mock)
  const myProjects = CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 2);

  const kpis = [
    { icon: <DollarSign size={20} className="text-[#a78bfa]" />, label: T('Valeur totale créations', 'Total creation value'), value: formatPrice(34500), sub: '+12.4%', color: 'bg-[#a78bfa]/10' },
    { icon: <Users size={20} className="text-primary-cyan" />, label: T('Total mécènes', 'Total patrons'), value: '290', sub: '+8 ce mois', color: 'bg-primary-cyan/10' },
    { icon: <TrendingUp size={20} className="text-emerald-400" />, label: T('Capital levé', 'Capital raised'), value: formatPrice(825000), sub: '+23.4%', color: 'bg-emerald-400/10' },
    { icon: <Zap size={20} className="text-accent-gold" />, label: T('Projets actifs', 'Active projects'), value: String(myProjects.length), color: 'bg-accent-gold/10' },
  ];

  const tabs = [
    { key: 'overview' as const, labelFR: 'Vue d\'ensemble', labelEN: 'Overview' },
    { key: 'documents' as const, labelFR: 'Documents & Médias', labelEN: 'Documents & Media' },
    { key: 'milestones' as const, labelFR: 'Jalons', labelEN: 'Milestones' },
    { key: 'simulator' as const, labelFR: 'Simulateur LYA', labelEN: 'LYA Simulator' },
    { key: 'analytics' as const, labelFR: 'Analytics', labelEN: 'Analytics' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        titleWhite={T('MES', 'MY')}
        titleAccent={T('CRÉATIONS', 'CREATIONS')}
        description={T('Gérez vos projets, jalons et analytics créatifs', 'Manage your projects, milestones and creative analytics')}
        accentColor="text-[#a78bfa]"
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setActiveSection('analytics')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider">
          <BarChart2 size={14} /> {T('Analytics', 'Analytics')}
        </button>
        <button onClick={() => setActiveSection('simulator')} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] text-sm font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all uppercase tracking-wider">
          <Target size={14} /> {T('Simuler mon score', 'Simulate my score')}
        </button>
        <button onClick={() => onNotify(T('Nouvelle création en cours...', 'New creation in progress...'))} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-wider">
          <Plus size={14} /> {T('Nouvelle création', 'New creation')}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)}
            className={`px-5 pb-4 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection === tab.key ? 'text-[#a78bfa]' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {T(tab.labelFR, tab.labelEN)}
            {activeSection === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa] transition-all duration-300" />}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ─── VUE D'ENSEMBLE ─── */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
              </div>

              {myProjects.map((proj, idx) => {
                const chartData = genChartData(20, 8000 + idx * 4000, proj.growth);
                const milestones = [
                  { labelFR: 'Exposition inaugurale', labelEN: 'Opening exhibition', date: '15 janv. 2026', impact: '+25%', done: true },
                  { labelFR: 'Partenariat studio', labelEN: 'Studio partnership', date: '10 févr. 2026', impact: '+45%', done: true },
                  { labelFR: 'Lancement collection', labelEN: 'Collection launch', date: '20 mars 2026', impact: '+35%', done: false },
                ];
                return (
                  <div key={proj.id} className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="flex items-start gap-4 p-5 border-b border-white/6">
                      <img src={proj.image} alt={proj.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="text-[10px] text-on-surface-variant/40 font-mono uppercase tracking-widest">{proj.category} · {proj.registryIndex}</p>
                        <h3 className="text-lg font-black text-on-surface">{proj.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">● {T('ACCÉLÉRATION', 'ACCELERATION')}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">LYA Score</p>
                        <p className="text-xl font-black text-accent-gold">{proj.totalScore}</p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/6">
                      <div className="p-5 space-y-3">
                        <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Performance LYA', 'LYA Performance')}</p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs><linearGradient id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                              <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill={`url(#grad${idx})`} dot={false}/>
                              <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [formatPrice(v), T('Valeur', 'Value')]} />
                              <XAxis dataKey="t" hide />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { l: T('Valeur actuelle', 'Current value'), v: formatPrice(chartData[chartData.length-1]?.v || 0), c: 'text-on-surface' },
                            { l: T('Mécènes', 'Patrons'), v: String(87 + idx * 116), c: 'text-on-surface' },
                            { l: T('Variation', 'Change'), v: `+${proj.growth}%`, c: 'text-emerald-400' },
                          ].map((s, i) => (
                            <div key={i} className="bg-surface-high/30 rounded-xl p-2.5">
                              <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                              <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Jalons', 'Milestones')}</p>
                          <button onClick={() => setActiveSection('milestones')} className="text-[10px] font-black text-[#a78bfa] hover:text-white transition-colors uppercase tracking-widest border-b border-[#a78bfa]/30">+ {T('Ajouter', 'Add')}</button>
                        </div>
                        <div className="space-y-2">
                          {milestones.map((m, mi) => (
                            <div key={mi} className={`flex items-start gap-3 p-3 rounded-xl border ${m.done ? 'bg-emerald-400/5 border-emerald-400/15' : 'bg-surface-high/30 border-white/6'}`}>
                              {m.done ? <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> : <Clock size={14} className="text-on-surface-variant/40 shrink-0 mt-0.5" />}
                              <div className="flex-1">
                                <p className="text-xs font-black text-on-surface">{T(m.labelFR, m.labelEN)}</p>
                                <p className="text-[10px] text-on-surface-variant/50">{m.date}</p>
                              </div>
                              <span className="text-[10px] font-black text-emerald-400">{m.impact}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => onNotify(T('Jalon publié avec succès', 'Milestone published successfully'))} className="w-full py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                          <Upload size={12} /> {T('Publier un jalon', 'Publish a milestone')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Impact jalons */}
              <div className="bg-gradient-to-r from-[#a78bfa]/10 to-primary-cyan/5 border border-[#a78bfa]/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#a78bfa]/20 rounded-xl flex items-center justify-center text-[#a78bfa]"><Target size={20} /></div>
                <div>
                  <h3 className="text-sm font-black text-on-surface mb-1">{T('Impact direct sur la valeur', 'Direct impact on value')}</h3>
                  <p className="text-sm text-on-surface-variant/60 leading-relaxed">{T('Chaque jalon que vous publiez influence directement la valeur LYA de votre création. Plus vous êtes transparent et régulier dans vos mises à jour, plus vos mécènes vous font confiance.', 'Every milestone you publish directly influences your creation\'s LYA value. The more transparent and regular your updates, the more your patrons trust you.')}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── DOCUMENTS & MÉDIAS ─── */}
          {activeSection === 'documents' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { l: T('Public', 'Public'), v: 1, c: 'text-primary-cyan' },
                  { l: T('Mécènes', 'Patrons'), v: 1, c: 'text-[#a78bfa]' },
                  { l: T('Professionnels', 'Professionals'), v: 0, c: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5">
                    <p className="text-sm text-on-surface-variant/60 font-medium">{s.l}</p>
                    <p className={`text-4xl font-black ${s.c} mt-1`}>{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{T('Gestion des Documents & Médias', 'Document & Media Management')}</h3>
                    <p className="text-sm text-on-surface-variant/50 mt-0.5">{T('Uploadez et définissez les accès pour', 'Upload and set access for')} <span className="text-[#a78bfa]">{T('mécènes', 'patrons')}</span> {T('et', 'and')} <span className="text-emerald-400">{T('professionnels', 'professionals')}</span></p>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-wider">
                    <Upload size={14} /> {T('Uploader', 'Upload')}
                  </button>
                </div>

                <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 bg-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold text-xs shrink-0">!</div>
                  <div>
                    <p className="text-sm font-black text-accent-gold">{T('Services professionnels payants via LinkYourArt', 'Paid professional services via LinkYourArt')}</p>
                    <p className="text-xs text-on-surface-variant/50 mt-1">{T('Les documents réservés aux professionnels nécessitent un paiement. LinkYourArt reste le point central.', 'Documents for professionals require payment. LinkYourArt remains the central point.')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Business_Plan_2026.pdf', size: '2.4 MB', date: '15/02/2026', access: T('Mécènes', 'Patrons'), price: '500€', icon: <FileText size={16} className="text-primary-cyan" /> },
                    { name: 'Teaser_Audio.mp3', size: '8.1 MB', date: '20/02/2026', access: T('Public', 'Public'), price: null, icon: <Music size={16} className="text-[#a78bfa]" /> },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-surface-high/30 border border-white/6 rounded-xl hover:border-white/15 transition-all group">
                      <div className="w-10 h-10 bg-surface-dim rounded-lg flex items-center justify-center border border-white/8">{f.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-on-surface">{f.name}</p>
                        <p className="text-xs text-on-surface-variant/50">{f.size} · {f.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${f.access === T('Public','Public') ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[#a78bfa]/10 text-[#a78bfa]'}`}>{f.access}</span>
                        {f.price && <span className="text-accent-gold font-black text-sm">$ {f.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── JALONS ─── */}
          {activeSection === 'milestones' && (
            <div className="space-y-6">
              {myProjects.map((proj, pi) => (
                <div key={proj.id} className="bg-surface-low/40 border border-white/8 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-on-surface-variant/40 font-mono uppercase">{proj.registryIndex}</p>
                      <h3 className="text-base font-black text-on-surface">{proj.name}</h3>
                    </div>
                    <button onClick={() => onNotify(T('Nouveau jalon ajouté', 'New milestone added'))} className="flex items-center gap-2 px-4 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all">
                      <Plus size={12} /> {T('Ajouter', 'Add')}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { labelFR: 'Exposition Galerie Moderna', labelEN: 'Moderna Gallery Exhibition', date: '15 janv. 2026', impact: '+25%', done: true, descFR: 'Première exposition institutionnelle', descEN: 'First institutional exhibition' },
                      { labelFR: 'Partenariat Adobe', labelEN: 'Adobe Partnership', date: '10 févr. 2026', impact: '+45%', done: true, descFR: 'Intégration dans la suite créative', descEN: 'Integration in creative suite' },
                      { labelFR: 'Lancement Collection NFT', labelEN: 'NFT Collection Launch', date: '20 mars 2026', impact: '+35%', done: false, descFR: 'Collection numérique limitée', descEN: 'Limited digital collection' },
                    ].map((m, mi) => (
                      <div key={mi} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${m.done ? 'bg-emerald-400/5 border-emerald-400/15' : 'bg-surface-high/20 border-white/6 border-dashed'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.done ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-on-surface-variant/30'}`}>
                          {m.done ? <CheckCircle size={15} /> : <Clock size={15} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-on-surface">{T(m.labelFR, m.labelEN)}</p>
                          <p className="text-xs text-on-surface-variant/50">{m.date} · {T(m.descFR, m.descEN)}</p>
                          <p className="text-xs text-primary-cyan font-bold mt-1">{T('Impact:', 'Impact:')} {m.impact}</p>
                        </div>
                        {!m.done && (
                          <button onClick={() => onNotify(T('Jalon publié !', 'Milestone published!'))} className="px-3 py-1.5 bg-[#a78bfa] text-surface-dim text-[10px] font-black rounded-lg hover:bg-white transition-all uppercase tracking-widest flex items-center gap-1">
                            <Flag size={10} /> {T('Publier', 'Publish')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── SIMULATEUR ─── */}
          {activeSection === 'simulator' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-[10px] font-black text-primary-cyan uppercase tracking-widest">
                    <Target size={12} /> {T('Outil pour créateurs', 'Tool for creators')}
                  </div>
                  <h2 className="font-headline font-black text-on-surface text-3xl tracking-tight">{T('Simulateur', 'Simulator')} <span className="text-primary-cyan">LYA</span></h2>
                  <p className="text-sm text-on-surface-variant/50">{T('Estimez votre score LYA avant de soumettre votre projet', 'Estimate your LYA score before submitting your project')}</p>
                </div>
                <LYASimulator lang={lang} />
              </div>
            </div>
          )}

          {/* ─── ANALYTICS ─── */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-on-surface tracking-tight">{T('Analytics', 'Analytics')} <span className="text-[#a78bfa]">{T('Créateur', 'Creator')}</span></h2>
                  <p className="text-sm text-on-surface-variant/50">{T('Tableau de bord pour créateurs, mécènes et professionnels', 'Dashboard for creators, patrons and professionals')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {[{ l: T('Score LYA Moyen','Avg LYA Score'), v: '763', c: 'text-on-surface' }, { l: T('Croissance','Growth'), v: '+20.3%', c: 'text-emerald-400' }].map((s, i) => (
                    <div key={i} className="bg-surface-low/40 border border-white/10 rounded-xl px-4 py-3 text-right">
                      <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">{s.l}</p>
                      <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { l: T('Score LYA Total','Total LYA Score'), v: '2,288', sub: '+8.2% ce mois', c: 'text-[#a78bfa]', icon: <Sparkles size={16}/> },
                  { l: T('Engagement Total','Total Engagement'), v: '24.8K', sub: '+15.7% ce mois', c: 'text-primary-cyan', icon: <Users size={16}/> },
                  { l: T('Revenus Générés','Revenue Generated'), v: formatPrice(42500), sub: '+23.4% ce mois', c: 'text-emerald-400', icon: <DollarSign size={16}/> },
                  { l: T('Vues Totales','Total Views'), v: '156K', sub: T('Tous projets','All projects'), c: 'text-accent-gold', icon: <ArrowUpRight size={16}/> },
                ].map((k, i) => (
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2">
                    <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${k.c}`}>{k.icon}</div>
                    <p className="text-xs text-on-surface-variant/50 font-medium">{k.l}</p>
                    <p className={`text-2xl font-black ${k.c}`}>{k.v}</p>
                    <p className="text-xs text-emerald-400 font-bold">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Score LYA temps réel */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#a78bfa]/10 rounded-lg flex items-center justify-center text-[#a78bfa]"><TrendingUp size={15}/></div>
                    <div>
                      <p className="text-sm font-black text-on-surface">{T('Score LYA Temps Réel','Real-time LYA Score')}</p>
                      <p className="text-xs text-on-surface-variant/50">{T('Suivi live de la progression','Live progression tracking')}</p>
                    </div>
                  </div>
                </div>
                <RealtimeChart color="#a78bfa" base={820} lang={lang} formatPrice={formatPrice} labelFR="Score" labelEN="Score" showPrice={false} />
              </div>

              {/* Carte de chaleur */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#a78bfa]/10 rounded-lg flex items-center justify-center text-[#a78bfa]"><BarChart2 size={15}/></div>
                  <div>
                    <p className="text-sm font-black text-on-surface">{T('Carte de Chaleur d\'Engagement','Engagement Heat Map')}</p>
                    <p className="text-xs text-on-surface-variant/50">{T('Analyse temporelle par jour et heure','Temporal analysis by day and hour')}</p>
                  </div>
                </div>
                <HeatmapCard lang={lang} />
              </div>

              {/* Jalons & Réalisations */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-gold/10 rounded-lg flex items-center justify-center text-accent-gold"><Award size={15}/></div>
                  <p className="text-sm font-black text-on-surface">{T('Jalons & Réalisations','Milestones & Achievements')}</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { l: T('Score LYA +800','LYA Score +800'), sub: T('Atteint','Achieved'), done: true, c: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400', icon: <Sparkles size={14}/> },
                    { l: T('10K Followers','10K Followers'), sub: T('Communauté engagée','Engaged community'), done: true, c: 'border-primary-cyan/20 bg-primary-cyan/5 text-primary-cyan', icon: <Users size={14}/> },
                    { l: T('Top 5% Créateurs','Top 5% Creators'), sub: T('Classement plateforme','Platform ranking'), done: true, c: 'border-[#a78bfa]/20 bg-[#a78bfa]/5 text-[#a78bfa]', icon: <Award size={14}/> },
                    { l: T('€50K Revenus','€50K Revenue'), sub: T('Objectif en cours','Goal in progress'), done: false, c: 'border-white/8 bg-white/3 text-on-surface-variant/50', icon: <DollarSign size={14}/> },
                    { l: T('1000 Interactions/jour','1000 Interactions/day'), sub: T('Engagement moyen','Average engagement'), done: true, c: 'border-rose-400/20 bg-rose-400/5 text-rose-400', icon: <Zap size={14}/> },
                    { l: T('95% Satisfaction','95% Satisfaction'), sub: T('Note mécènes','Patron rating'), done: true, c: 'border-accent-gold/20 bg-accent-gold/5 text-accent-gold', icon: <Star size={14}/> },
                  ].map((a, i) => (
                    <div key={i} className={`p-4 border rounded-xl ${a.c}`}>
                      <div className="flex items-center justify-between mb-2">
                        {a.icon}
                        {a.done && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded-full">{T('ATTEINT','ACHIEVED')}</span>}
                      </div>
                      <p className="text-sm font-black text-on-surface">{a.l}</p>
                      <p className="text-xs text-on-surface-variant/50">{a.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions recommandées */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black text-on-surface">💡 {T('Actions Recommandées','Recommended Actions')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { p: T('Haute','High'), t: T('Augmenter la fréquence de publication','Increase publication frequency'), imp: '+5-8 points LYA' },
                    { p: T('Moyenne','Medium'), t: T('Collaborer avec un autre créateur','Collaborate with another creator'), imp: '+12% engagement' },
                    { p: T('Haute','High'), t: T('Optimiser la stratégie commerciale','Optimise commercial strategy'), imp: '+€8K revenus potentiels' },
                    { p: T('Moyenne','Medium'), t: T('Renforcer la communauté sur réseaux','Strengthen community on networks'), imp: '+3K followers estimés' },
                  ].map((a, i) => (
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-4 hover:border-white/15 transition-all">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 ${a.p === T('Haute','High') ? 'bg-rose-400/10 text-rose-400' : 'bg-accent-gold/10 text-accent-gold'}`}>{a.p}</span>
                      <p className="text-sm font-black text-on-surface">{a.t}</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">{a.imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
