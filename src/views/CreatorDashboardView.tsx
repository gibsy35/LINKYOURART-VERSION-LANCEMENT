import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { RealtimeChart } from '../components/RealtimeChart';
import { PageHeader } from '../components/ui/PageHeader';
import { NewCreationModal, MilestoneModal, UploadModal } from '../components/DashboardModals';
import { getSafeImageUrl } from '../utils/image';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Zap, Upload, FileText, Music,
  Plus, ChevronDown, CheckCircle, Clock, Star, BarChart2,
  Sparkles, Target, Award, ArrowUpRight, ArrowDownRight, Flag,
  AlertTriangle, Info, ChevronRight, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, BarChart, Bar, Cell } from 'recharts';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const genChartData = (points: number, base: number, growth: number) =>
  Array.from({ length: points }, (_, i) => ({
    t: `J${i + 1}`,
    v: Math.round(base * (1 + (growth / 100) * (i / points)) + (Math.random() - 0.5) * base * 0.04),
  }));

const unitPrice = (growth: number) => LYA_UNIT_VALUE * (1 + growth / 100);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { label: string; cls: string }> = {
    LIVE: { label: 'LIVE', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
    SUSPENDED: { label: 'SUSPENDU', cls: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' },
    RISK: { label: 'RISQUE', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    LIQUIDATION: { label: 'LIQUIDATION', cls: 'bg-red-700/10 text-red-500 border-red-500/20' },
  };
  const c = cfg[status] || cfg.LIVE;
  return <span className={`px-2 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-widest ${c.cls}`}>{c.label}</span>;
};

// ─── SIMULATEUR LYA (inchangé) ────────────────────────────────────────────────

const LYASimulator: React.FC<{ lang: 'FR' | 'EN'; formatPrice: (n: number) => string }> = ({ lang, formatPrice }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const steps = [
    { labelFR: 'Visibilité & Rayonnement', labelEN: 'Visibility & Reach', maxPts: 200, color: 'text-[#a78bfa]',
      questions: [{ qFR: 'Followers réseaux sociaux', qEN: 'Social media followers', options: ['< 1,000 — 20pts', '1K-10K — 50pts', '10K-50K — 100pts', '> 50K — 200pts'] },
                  { qFR: 'Expositions / Publications (année)', qEN: 'Exhibitions / Publications (year)', options: ['Aucune — 0pts', '1-2 — 30pts', '3-5 — 70pts', '6+ — 100pts'] }] },
    { labelFR: 'Qualité Artistique', labelEN: 'Artistic Quality', maxPts: 250, color: 'text-primary-cyan',
      questions: [{ qFR: 'Niveau de reconnaissance', qEN: 'Recognition level', options: ['Débutant — 50pts', 'Confirmé — 100pts', 'Expert — 175pts', 'Maître — 250pts'] }] },
    { labelFR: 'Potentiel Commercial', labelEN: 'Commercial Potential', maxPts: 250, color: 'text-emerald-400',
      questions: [{ qFR: 'Revenus créatifs annuels', qEN: 'Annual creative revenue', options: ['< 5K€ — 40pts', '5K-20K€ — 100pts', '20K-100K€ — 180pts', '> 100K€ — 250pts'] }] },
    { labelFR: 'Infrastructure Légale', labelEN: 'Legal Infrastructure', maxPts: 150, color: 'text-accent-gold',
      questions: [{ qFR: 'Protection de l\'œuvre', qEN: 'Work protection', options: ['Non protégé — 20pts', 'Enregistré — 60pts', 'Déposé — 100pts', 'Breveté — 150pts'] }] },
    { labelFR: 'Co-Production', labelEN: 'Co-Production', maxPts: 150, color: 'text-rose-400',
      questions: [{ qFR: 'Expérience co-production', qEN: 'Co-production experience', options: ['Aucune — 20pts', 'Quelques — 60pts', 'Régulière — 100pts', 'Extensive — 150pts'] }] },
  ];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [done, setDone] = useState(false);
  const totalPts = Object.values(answers).flat().reduce((s, p) => s + p, 0);
  const parse = (opt: string) => parseInt(opt.match(/(\d+)pts/)?.[1] || '0');
  const handleAnswer = (qi: number, opt: string) => {
    const prev = answers[step] ? [...answers[step]] : [];
    prev[qi] = parse(opt);
    setAnswers({ ...answers, [step]: prev });
  };
  const next = () => step < steps.length - 1 ? setStep(s => s + 1) : setDone(true);
  const reset = () => { setStep(0); setAnswers({}); setDone(false); };
  const progress = ((step + (done ? 1 : 0)) / steps.length) * 100;
  const s = steps[step];
  const eligColor = totalPts >= 700 ? 'text-emerald-400' : totalPts >= 400 ? 'text-accent-gold' : 'text-rose-400';
  const eligBg = totalPts >= 700 ? 'bg-emerald-400/8 border-emerald-400/25' : totalPts >= 400 ? 'bg-accent-gold/8 border-accent-gold/25' : 'bg-rose-400/8 border-rose-400/25';
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm mb-1"><span className="text-on-surface-variant/60">{T(`Étape ${step+1}/${steps.length}`,`Step ${step+1}/${steps.length}`)}</span><span className="font-black text-primary-cyan">{Math.round(progress)}%</span></div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full" /></div>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${s.color} bg-white/5 border border-white/10`}><Star size={11} /> {T(s.labelFR, s.labelEN)} — Max {s.maxPts}pts</div>
            {s.questions.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-black text-on-surface">{qi+1}. {T(q.qFR, q.qEN)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => { const pts = parse(opt); const label = opt.split(' — ')[0]; const sel = answers[step]?.[qi] === pts;
                    return <button key={opt} onClick={() => handleAnswer(qi, opt)} className={`p-3 rounded-xl border text-left transition-all ${sel ? 'bg-primary-cyan/10 border-primary-cyan/40 text-primary-cyan' : 'bg-surface-high/30 border-white/8 text-on-surface-variant hover:border-white/20'}`}><p className="text-sm font-bold">{label}</p><p className="text-xs text-primary-cyan font-black">+{pts}pts</p></button>;})}
                </div>
              </div>
            ))}
            <button onClick={next} className="w-full py-3.5 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all">{step < steps.length-1 ? T('Étape suivante →','Next step →') : T('Voir mon score →','See my score →')}</button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className={`rounded-2xl p-5 text-center border ${eligBg}`}>
              <p className="text-xs text-on-surface-variant/50 uppercase tracking-widest mb-2">{T('Score LYA Estimé','Estimated LYA Score')}</p>
              <p className={`text-5xl font-black font-mono ${eligColor}`}>{totalPts}<span className="text-xl text-on-surface-variant/30">/1000</span></p>
              <p className={`mt-2 text-sm font-black uppercase tracking-widest ${eligColor}`}>{totalPts >= 700 ? T('✦ Éligible à l\'indexation LYA','✦ Eligible for LYA indexation') : totalPts >= 400 ? T('⚡ Quelques améliorations nécessaires','⚡ Some improvements needed') : T('↑ En développement','↑ Developing')}</p>
            </div>
            {totalPts >= 700 && (
              <div className="bg-primary-cyan/5 border border-primary-cyan/15 rounded-xl p-4">
                <p className="text-xs font-black text-primary-cyan uppercase tracking-widest mb-1">{T('Estimation LYA UNIT','LYA UNIT Estimate')}</p>
                <p className="text-sm text-on-surface-variant/70">{T(`Avec un score de ${totalPts}/1000, votre LYA UNIT de départ serait estimé à`, `With a score of ${totalPts}/1000, your starting LYA UNIT would be estimated at`)} <span className="text-primary-cyan font-black">{formatPrice(LYA_UNIT_VALUE * (1 + (totalPts/1000) * 0.5))}</span></p>
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{steps.map((st,i) => { const pts = answers[i]?.reduce((a,b)=>a+b,0)||0; return <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-2.5 text-center"><p className="text-[9px] text-on-surface-variant/40 uppercase mb-1">{T(st.labelFR,st.labelEN).split(' ')[0]}</p><p className="text-sm font-black text-primary-cyan">{pts}<span className="text-[9px] text-on-surface-variant/30">/{st.maxPts}</span></p></div>; })}</div>
            <button onClick={reset} className="w-full py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest">{T('Recommencer','Restart')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── HEATMAP ──────────────────────────────────────────────────────────────────
const HeatmapCard: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const days = [T('Lun','Mon'),T('Mar','Tue'),T('Mer','Wed'),T('Jeu','Thu'),T('Ven','Fri'),T('Sam','Sat'),T('Dim','Sun')];
  const data = days.map(() => Array.from({length:24},()=>Math.random()));
  const [hov, setHov] = useState<{day:string;hour:number;val:number}|null>(null);
  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="flex gap-1" style={{minWidth:520}}>
        <div className="flex flex-col gap-1 pt-6">{days.map(d=><div key={d} className="h-5 w-8 text-[9px] text-on-surface-variant/40 font-mono flex items-center">{d}</div>)}</div>
        <div className="flex-1 space-y-1">
          <div className="flex gap-1 mb-1 text-[8px] text-on-surface-variant/30 font-mono"><span>0h</span><span style={{marginLeft:'23%'}}>6h</span><span style={{marginLeft:'23%'}}>12h</span><span style={{marginLeft:'23%'}}>18h</span></div>
          {data.map((row,di)=><div key={di} className="flex gap-0.5">{row.map((val,hi)=><div key={hi} onMouseEnter={()=>setHov({day:days[di],hour:hi,val})} onMouseLeave={()=>setHov(null)} className="h-5 flex-1 rounded-sm cursor-pointer hover:scale-110 transition-transform" style={{background:`rgba(167,139,250,${val*0.8+0.1})`}}/>)}</div>)}
        </div>
      </div>
      {hov && <div className="bg-surface-high/80 border border-white/10 rounded-lg p-2.5 text-xs"><p className="font-black text-on-surface">{hov.day} {T('à','at')} {hov.hour}h — <span className="text-[#a78bfa]">{Math.round(hov.val*99)}%</span></p><p className="text-on-surface-variant/50">{Math.round(hov.val*500)} interactions</p></div>}
      <div className="flex items-center justify-between text-[9px] text-on-surface-variant/30">
        <div className="flex items-center gap-1">{[0.15,0.35,0.55,0.75,0.95].map(o=><div key={o} className="w-3 h-3 rounded-sm" style={{background:`rgba(167,139,250,${o})`}}/>)}<span>{T('Moins → Plus actif','Less → More active')}</span></div>
        <span>{T('7 derniers jours','Last 7 days')}</span>
      </div>
    </div>
  );
};

// ─── VUE PRINCIPALE ───────────────────────────────────────────────────────────
export const CreatorDashboardView: React.FC<{user:UserProfile|null;onNotify:(msg:string)=>void;onViewChange:(v:any)=>void}> = ({user,onNotify,onViewChange}) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR'|'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'overview'|'projects'|'documents'|'milestones'|'simulator'|'analytics'>('overview');
  const [showNewCreation, setShowNewCreation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [milestoneProject, setMilestoneProject] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name:string;access:string;price:string}[]>([]);
  const [projectsShown, setProjectsShown] = useState(3);

  // Projets réels incluant des projets en difficulté
  const allProjects = CONTRACTS.filter(c => c.status !== 'LIQUIDATION').slice(0, 12);
  const myProjects = allProjects.slice(0, 2); // projets principaux (LIVE)
  const riskProjects = CONTRACTS.filter(c => c.status === 'RISK').slice(0, 2);

  // KPIs réels avec données positives ET négatives
  const totalValue = myProjects.reduce((s, c) => s + (unitPrice(c.growth) * 50), 0);
  const avgGrowth = allProjects.reduce((s,c) => s + c.growth, 0) / allProjects.length;
  const liveCount = CONTRACTS.filter(c => c.status === 'LIVE').length;
  const riskCount = CONTRACTS.filter(c => ['RISK','SUSPENDED','LIQUIDATION'].includes(c.status)).length;

  const tabs = [
    {key:'overview' as const, labelFR:'Vue d\'ensemble', labelEN:'Overview'},
    {key:'projects' as const, labelFR:'Mes Projets', labelEN:'My Projects'},
    {key:'documents' as const, labelFR:'Documents', labelEN:'Documents'},
    {key:'milestones' as const, labelFR:'Jalons', labelEN:'Milestones'},
    {key:'simulator' as const, labelFR:'Simulateur LYA', labelEN:'LYA Simulator'},
    {key:'analytics' as const, labelFR:'Analytics', labelEN:'Analytics'},
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader titleWhite={T('MES','MY')} titleAccent={T('CRÉATIONS','CREATIONS')} description={T('Gérez vos projets, jalons et analytics créatifs','Manage your projects, milestones and creative analytics')} accentColor="text-[#a78bfa]"/>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setActiveSection('analytics')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider"><BarChart2 size={14}/> {T('Analytics','Analytics')}</button>
        <button onClick={() => setActiveSection('simulator')} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] text-sm font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all uppercase tracking-wider"><Target size={14}/> {T('Simuler mon score LYA','Simulate my LYA score')}</button>
        <button onClick={() => setShowNewCreation(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-wider"><Plus size={14}/> {T('Nouvelle création','New creation')}</button>
      </div>

      {/* Alerte projets en difficulté */}
      {riskProjects.length > 0 && (
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-black text-rose-400">{T(`${riskProjects.length} projet(s) nécessitent votre attention`,`${riskProjects.length} project(s) need your attention`)}</p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">{riskProjects.map(p=>p.name).join(', ')} — {T('LYA Score en baisse','LYA Score declining')}</p>
          </div>
          <button onClick={()=>setActiveSection('projects')} className="ml-auto text-xs font-black text-rose-400 hover:text-white transition-colors uppercase tracking-widest shrink-0">{T('Voir →','See →')}</button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)}
            className={`px-4 pb-3 text-xs font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection===tab.key?'text-[#a78bfa]':'text-on-surface-variant hover:text-on-surface'}`}>
            {T(tab.labelFR, tab.labelEN)}
            {activeSection===tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa] transition-all duration-300"/>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.18}}>

          {/* ── VUE D'ENSEMBLE ─────────────────────────────────────────────── */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* KPIs — incluant données négatives */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {icon:<DollarSign size={18} className="text-[#a78bfa]"/>, label:T('Valeur totale','Total value'), value:formatPrice(totalValue), sub:`${avgGrowth>=0?'+':''}${avgGrowth.toFixed(1)}%`, up:avgGrowth>=0, color:'bg-[#a78bfa]/10'},
                  {icon:<Users size={18} className="text-primary-cyan"/>, label:T('Mécènes actifs','Active patrons'), value:'290', sub:'+8 '+T('ce mois','this month'), up:true, color:'bg-primary-cyan/10'},
                  {icon:<Sparkles size={18} className="text-emerald-400"/>, label:T('Projets LIVE','LIVE Projects'), value:String(liveCount), sub:`${riskCount} ${T('en risque','at risk')}`, up:false, color:'bg-emerald-400/10'},
                  {icon:<Target size={18} className="text-accent-gold"/>, label:T('LYA UNIT moyen','Avg LYA UNIT'), value:formatPrice(LYA_UNIT_VALUE*(1+avgGrowth/100)), sub:`Base: ${formatPrice(LYA_UNIT_VALUE)}`, up:avgGrowth>=0, color:'bg-accent-gold/10'},
                ].map((k,i) => (
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2 hover:border-white/15 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
                    <p className="text-xs text-on-surface-variant/60 font-medium">{k.label}</p>
                    <p className="text-xl font-black text-on-surface tracking-tight">{k.value}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 ${k.up?'text-emerald-400':'text-rose-400'}`}>
                      {k.up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{k.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* LYA UNIT encadré */}
              <div className="bg-gradient-to-r from-accent-gold/8 to-[#a78bfa]/5 border border-accent-gold/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-accent-gold/15 border border-accent-gold/25 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-accent-gold font-black text-xs">LYA</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-accent-gold uppercase tracking-widest mb-1">LYA UNIT — {T('Index de valeur créative','Creative value index')}</p>
                  <p className="text-sm text-on-surface-variant/70 leading-relaxed">{T('Chaque création LYA est indexée en LYA Units. La valeur évolue selon les jalons, le LYA Score et les échanges sur le marché secondaire.','Each LYA creation is indexed in LYA Units. Value evolves according to milestones, LYA Score and secondary market trades.')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest">{T('Valeur de base','Base value')}</p>
                  <p className="text-2xl font-black text-accent-gold font-mono">{formatPrice(LYA_UNIT_VALUE)}</p>
                  <p className={`text-xs font-bold mt-0.5 ${avgGrowth>=0?'text-emerald-400':'text-rose-400'}`}>{avgGrowth>=0?'+':''}{avgGrowth.toFixed(1)}% {T('tendance actuelle','current trend')}</p>
                </div>
              </div>

              {/* Projets principaux */}
              {myProjects.map((proj, idx) => {
                const chartData = genChartData(20, LYA_UNIT_VALUE*(1+proj.growth/100)*50, proj.growth);
                const up = proj.growth >= 0;
                return (
                  <div key={proj.id} className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="flex items-center gap-3 p-4 border-b border-white/6">
                      <img src={getSafeImageUrl(proj.image, proj.category)} alt={proj.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-xs text-on-surface-variant/40 font-mono">{proj.registryIndex}</p>
                          <StatusBadge status={proj.status}/>
                          <span className={`text-xs font-black ${proj.rarity==='Legendary'?'text-accent-gold':proj.rarity==='Epic'?'text-[#a78bfa]':proj.rarity==='Rare'?'text-primary-cyan':'text-on-surface-variant/50'}`}>★ {proj.rarity}</span>
                        </div>
                        <h3 className="text-sm font-black text-on-surface truncate">{proj.name}</h3>
                        <p className="text-xs text-on-surface-variant/50">{proj.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest">LYA Score</p>
                        <p className="text-xl font-black text-accent-gold">{proj.totalScore}<span className="text-xs text-on-surface-variant/30">/1000</span></p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
                      <div className="p-4 space-y-2">
                        <p className="text-xs font-black text-on-surface uppercase tracking-wider">{T('Performance LYA','LYA Performance')}</p>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs><linearGradient id={`g${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={up?'#10b981':'#f43f5e'} stopOpacity={0.3}/><stop offset="95%" stopColor={up?'#10b981':'#f43f5e'} stopOpacity={0}/></linearGradient></defs>
                              <Area type="monotone" dataKey="v" stroke={up?'#10b981':'#f43f5e'} strokeWidth={2} fill={`url(#g${idx})`} dot={false}/>
                              <Tooltip contentStyle={{background:'#0f121a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:11}} formatter={(v:number)=>[formatPrice(v),T('Valeur','Value')]}/>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-surface-high/30 rounded-lg p-2"><p className="text-[9px] text-on-surface-variant/40 uppercase">{T('LYA UNIT','LYA UNIT')}</p><p className="text-xs font-black text-accent-gold">{formatPrice(unitPrice(proj.growth))}</p></div>
                          <div className="bg-surface-high/30 rounded-lg p-2"><p className="text-[9px] text-on-surface-variant/40 uppercase">{T('Variation','Change')}</p><p className={`text-xs font-black ${up?'text-emerald-400':'text-rose-400'}`}>{up?'+':''}{proj.growth}%</p></div>
                          <div className="bg-surface-high/30 rounded-lg p-2"><p className="text-[9px] text-on-surface-variant/40 uppercase">{T('Mécènes','Patrons')}</p><p className="text-xs font-black text-on-surface">{87+idx*116}</p></div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-on-surface uppercase tracking-wider">{T('Jalons','Milestones')}</p>
                          <button onClick={()=>{setMilestoneProject(proj.name);setShowMilestone(true);}} className="text-[10px] font-black text-[#a78bfa] hover:text-white transition-colors uppercase">+ {T('Ajouter','Add')}</button>
                        </div>
                        {(proj.milestones||[]).slice(0,3).map((m,mi)=>(
                          <div key={mi} className={`flex items-start gap-2 p-2.5 rounded-lg border ${m.status==='COMPLETED'?'bg-emerald-400/5 border-emerald-400/15':m.status==='FAILED'?'bg-rose-400/5 border-rose-400/15':'bg-surface-high/20 border-white/6'}`}>
                            {m.status==='COMPLETED'?<CheckCircle size={12} className="text-emerald-400 shrink-0 mt-0.5"/>:m.status==='FAILED'?<AlertTriangle size={12} className="text-rose-400 shrink-0 mt-0.5"/>:<Clock size={12} className="text-on-surface-variant/40 shrink-0 mt-0.5"/>}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-on-surface truncate">{m.label}</p>
                              <p className="text-[9px] text-on-surface-variant/50">{m.date}</p>
                            </div>
                            {m.priceImpact && <span className={`text-[10px] font-black shrink-0 ${m.priceImpact>0?'text-emerald-400':'text-rose-400'}`}>{m.priceImpact>0?'+':''}{m.priceImpact}%</span>}
                          </div>
                        ))}
                        <button onClick={()=>{setMilestoneProject(proj.name);setShowMilestone(true);}} className="w-full py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all flex items-center justify-center gap-1.5">
                          <Flag size={11}/> {T('Publier un jalon','Publish milestone')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MES PROJETS ────────────────────────────────────────────────── */}
          {activeSection === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-on-surface-variant/60">{allProjects.length} {T('projets dans votre espace','projects in your space')}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"/>{T('LIVE','LIVE')}: {liveCount}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"/>{T('En risque','At risk')}: {riskCount}</span>
                </div>
              </div>
              {allProjects.slice(0, projectsShown).map((proj,i) => {
                const up = proj.growth >= 0;
                return (
                  <div key={proj.id} className={`flex items-center gap-3 p-4 border rounded-2xl hover:border-white/20 transition-all ${proj.status==='RISK'?'border-rose-500/20 bg-rose-500/3':proj.status==='SUSPENDED'?'border-accent-gold/20 bg-accent-gold/3':'border-white/8 bg-surface-low/40'}`}>
                    <img src={getSafeImageUrl(proj.image,proj.category)} alt={proj.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-black text-on-surface truncate">{proj.name}</p>
                        <StatusBadge status={proj.status}/>
                      </div>
                      <p className="text-xs text-on-surface-variant/50">{proj.category} · {proj.registryIndex}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest">LYA UNIT</p>
                      <p className="text-sm font-black text-accent-gold">{formatPrice(unitPrice(proj.growth))}</p>
                      <p className={`text-xs font-black flex items-center justify-end gap-0.5 ${up?'text-emerald-400':'text-rose-400'}`}>
                        {up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{up?'+':''}{proj.growth}%
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-3 border-l border-white/8">
                      <p className="text-xs text-on-surface-variant/40">Score</p>
                      <p className="text-base font-black text-accent-gold">{proj.totalScore}</p>
                    </div>
                  </div>
                );
              })}
              {projectsShown < allProjects.length && (
                <button onClick={()=>setProjectsShown(n=>n+5)} className="w-full py-3 bg-surface-high/30 border border-white/8 text-sm font-black text-on-surface-variant hover:text-on-surface hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ChevronDown size={14}/> {T(`Voir plus (${allProjects.length - projectsShown} restants)`,`Load more (${allProjects.length - projectsShown} remaining)`)}
                </button>
              )}
            </div>
          )}

          {/* ── DOCUMENTS ──────────────────────────────────────────────────── */}
          {activeSection === 'documents' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {[{l:T('Public','Public'),v:1,c:'text-primary-cyan'},{l:T('Mécènes','Patrons'),v:1+uploadedFiles.filter(f=>f.access==='PATRONS').length,c:'text-[#a78bfa]'},{l:T('Professionnels','Professionals'),v:uploadedFiles.filter(f=>f.access==='PROS').length,c:'text-emerald-400'}].map((s,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4"><p className="text-xs text-on-surface-variant/60">{s.l}</p><p className={`text-3xl font-black ${s.c} mt-1`}>{s.v}</p></div>
                ))}
              </div>
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div><h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Documents & Médias','Documents & Media')}</h3><p className="text-xs text-on-surface-variant/50 mt-0.5">{T('Accès différencié par profil','Differentiated access by profile')}</p></div>
                  <button onClick={()=>setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all"><Upload size={13}/> {T('Uploader','Upload')}</button>
                </div>
                <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-xl p-3 flex items-start gap-2">
                  <Info size={13} className="text-accent-gold shrink-0 mt-0.5"/>
                  <p className="text-xs text-on-surface-variant/60">{T('Les documents réservés aux professionnels nécessitent un paiement via LinkYourArt.','Documents reserved for professionals require payment via LinkYourArt.')}</p>
                </div>
                <div className="space-y-2">
                  {[
                    {name:'Business_Plan_2026.pdf', size:'2.4 MB', date:'15/02/2026', access:T('Mécènes','Patrons'), price:'500€', icon:<FileText size={15} className="text-primary-cyan"/>},
                    {name:'Teaser_Audio.mp3', size:'8.1 MB', date:'20/02/2026', access:T('Public','Public'), price:null, icon:<Music size={15} className="text-[#a78bfa]"/>},
                    ...uploadedFiles.map(f=>({name:f.name,size:'—',date:T('À l\'instant','Just now'),access:f.access==='PUBLIC'?T('Public','Public'):f.access==='PATRONS'?T('Mécènes','Patrons'):T('Pros','Pros'),price:f.price||null,icon:<FileText size={15} className="text-emerald-400"/>}))
                  ].map((f,i)=>(
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-high/30 border border-white/6 rounded-xl hover:border-white/15 transition-all">
                      <div className="w-9 h-9 bg-surface-dim rounded-lg flex items-center justify-center border border-white/8 shrink-0">{f.icon}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-black text-on-surface truncate">{f.name}</p><p className="text-xs text-on-surface-variant/50">{f.size} · {f.date}</p></div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${f.access===T('Public','Public')?'bg-emerald-400/10 text-emerald-400':'bg-[#a78bfa]/10 text-[#a78bfa]'}`}>{f.access}</span>
                        {f.price && <span className="text-accent-gold font-black text-xs">{f.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── JALONS ─────────────────────────────────────────────────────── */}
          {activeSection === 'milestones' && (
            <div className="space-y-4">
              {myProjects.map(proj => (
                <div key={proj.id} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div><p className="text-xs text-on-surface-variant/40 font-mono">{proj.registryIndex}</p><h3 className="text-sm font-black text-on-surface">{proj.name}</h3></div>
                    <button onClick={()=>{setMilestoneProject(proj.name);setShowMilestone(true);}} className="flex items-center gap-1.5 px-3 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all">
                      <Plus size={12}/> {T('Ajouter','Add')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(proj.milestones||[]).map((m,mi) => (
                      <div key={mi} className={`flex items-start gap-3 p-3 rounded-xl border ${m.status==='COMPLETED'?'bg-emerald-400/5 border-emerald-400/15':m.status==='FAILED'?'bg-rose-400/5 border-rose-400/15':m.status==='IN_PROGRESS'?'bg-primary-cyan/5 border-primary-cyan/15':'bg-surface-high/20 border-white/6 border-dashed'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.status==='COMPLETED'?'bg-emerald-400/20 text-emerald-400':m.status==='FAILED'?'bg-rose-400/20 text-rose-400':m.status==='IN_PROGRESS'?'bg-primary-cyan/20 text-primary-cyan':'bg-white/5 text-on-surface-variant/30'}`}>
                          {m.status==='COMPLETED'?<CheckCircle size={13}/>:m.status==='FAILED'?<AlertTriangle size={13}/>:m.status==='IN_PROGRESS'?<RefreshCw size={13}/>:<Clock size={13}/>}
                        </div>
                        <div className="flex-1"><p className="text-sm font-black text-on-surface">{m.label}</p><p className="text-xs text-on-surface-variant/50">{m.date}</p></div>
                        <div className="text-right shrink-0">
                          {m.priceImpact && <p className={`text-xs font-black ${m.priceImpact>0?'text-emerald-400':'text-rose-400'}`}>{m.priceImpact>0?'+':''}{m.priceImpact}% LYA UNIT</p>}
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${m.status==='COMPLETED'?'bg-emerald-400/10 text-emerald-400':m.status==='FAILED'?'bg-rose-400/10 text-rose-400':m.status==='IN_PROGRESS'?'bg-primary-cyan/10 text-primary-cyan':'bg-white/5 text-on-surface-variant/40'}`}>{m.status==='COMPLETED'?T('Complété','Completed'):m.status==='FAILED'?T('Échoué','Failed'):m.status==='IN_PROGRESS'?T('En cours','In progress'):T('À venir','Upcoming')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SIMULATEUR ─────────────────────────────────────────────────── */}
          {activeSection === 'simulator' && (
            <div className="max-w-xl mx-auto bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-[10px] font-black text-primary-cyan uppercase tracking-widest"><Target size={11}/> {T('Outil Créateur','Creator Tool')}</div>
                <h2 className="font-headline font-black text-on-surface text-2xl tracking-tight">{T('Simulateur','Simulator')} <span className="text-primary-cyan">LYA</span></h2>
                <p className="text-xs text-on-surface-variant/50">{T('Estimez votre score LYA et votre LYA UNIT avant soumission','Estimate your LYA score and LYA UNIT before submission')}</p>
              </div>
              <LYASimulator lang={lang} formatPrice={formatPrice}/>
            </div>
          )}

          {/* ── ANALYTICS ──────────────────────────────────────────────────── */}
          {activeSection === 'analytics' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div><h2 className="text-xl font-black text-on-surface">{T('Analytics','Analytics')} <span className="text-[#a78bfa]">{T('Créateur','Creator')}</span></h2><p className="text-xs text-on-surface-variant/50">{T('Données réelles de vos projets','Real data from your projects')}</p></div>
                <div className="flex items-center gap-2">
                  {[{l:T('Score moyen','Avg score'),v:String(Math.round(allProjects.reduce((s,c)=>s+c.totalScore,0)/allProjects.length)),c:'text-on-surface'},{l:T('Tendance','Trend'),v:`${avgGrowth>=0?'+':''}${avgGrowth.toFixed(1)}%`,c:avgGrowth>=0?'text-emerald-400':'text-rose-400'}].map((s,i)=>(
                    <div key={i} className="bg-surface-low/40 border border-white/10 rounded-xl px-3 py-2 text-right"><p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">{s.l}</p><p className={`text-lg font-black ${s.c}`}>{s.v}</p></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {l:T('Score LYA Total','Total LYA Score'),v:String(allProjects.reduce((s,c)=>s+c.totalScore,0)),sub:T('cumulé','cumulative'),c:'text-[#a78bfa]'},
                  {l:T('Mécènes Total','Total Patrons'),v:'24.8K',sub:'+15.7%',c:'text-primary-cyan'},
                  {l:T('Revenus co-part.','Co-share revenue'),v:formatPrice(42500),sub:'+23.4%',c:'text-emerald-400'},
                  {l:T('Projets en risque','At-risk projects'),v:String(riskCount),sub:T('nécessitent attention','need attention'),c:'text-rose-400'},
                ].map((k,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-1">
                    <p className="text-xs text-on-surface-variant/50">{k.l}</p>
                    <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                    <p className="text-xs text-on-surface-variant/40">{k.sub}</p>
                  </div>
                ))}
              </div>
              {/* Score LYA live */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Score LYA Temps Réel','Real-time LYA Score')}</p>
                <RealtimeChart color="#a78bfa" base={820} lang={lang} formatPrice={formatPrice} labelFR="Score" labelEN="Score" showPrice={false}/>
              </div>
              {/* Carte de chaleur */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Carte de Chaleur d\'Engagement','Engagement Heat Map')}</p>
                <HeatmapCard lang={lang}/>
              </div>
              {/* LYA UNIT par projet */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('LYA UNIT par projet','LYA UNIT per project')}</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allProjects.slice(0,8).map(c=>({name:c.registryIndex.split('-')[0],unit:+unitPrice(c.growth).toFixed(2),up:c.growth>=0}))}>
                      <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:'#0f121a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:11}} formatter={(v:number)=>[formatPrice(v),'LYA UNIT']}/>
                      <Bar dataKey="unit" radius={[4,4,0,0]}>{allProjects.slice(0,8).map((c,i)=><Cell key={i} fill={c.growth>=0?'#10b981':'#f43f5e'}/>)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-on-surface-variant/40">{T('Vert = en hausse · Rouge = en baisse · Base = ','Green = rising · Red = falling · Base = ')}{formatPrice(LYA_UNIT_VALUE)}</p>
              </div>
              {/* Réalisations */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Jalons & Réalisations','Milestones & Achievements')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {l:T('Score LYA +800','LYA Score +800'),s:T('Atteint','Achieved'),done:true,c:'border-emerald-400/20 bg-emerald-400/5 text-emerald-400'},
                    {l:T('10K Followers','10K Followers'),s:T('Communauté engagée','Engaged community'),done:true,c:'border-primary-cyan/20 bg-primary-cyan/5 text-primary-cyan'},
                    {l:T('Top 5% Créateurs','Top 5% Creators'),s:T('Classement plateforme','Platform ranking'),done:true,c:'border-[#a78bfa]/20 bg-[#a78bfa]/5 text-[#a78bfa]'},
                    {l:T('€50K Revenus','€50K Revenue'),s:T('En cours','In progress'),done:false,c:'border-white/8 text-on-surface-variant/40'},
                    {l:T('1K Interactions/j','1K Interactions/d'),s:T('Engagement moyen','Avg engagement'),done:true,c:'border-rose-400/20 bg-rose-400/5 text-rose-400'},
                    {l:T('95% Satisfaction','95% Satisfaction'),s:T('Note mécènes','Patron rating'),done:true,c:'border-accent-gold/20 bg-accent-gold/5 text-accent-gold'},
                  ].map((a,i)=>(
                    <div key={i} className={`p-3 border rounded-xl ${a.c}`}>
                      <div className="flex items-center justify-between mb-1">{a.done?<CheckCircle size={12}/>:<Clock size={12}/>}{a.done&&<span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded-full">{T('OK','OK')}</span>}</div>
                      <p className="text-xs font-black text-on-surface">{a.l}</p>
                      <p className="text-[10px] text-on-surface-variant/50">{a.s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <NewCreationModal open={showNewCreation} onClose={()=>setShowNewCreation(false)} lang={lang} onSubmit={data=>{onNotify(T(`✦ ${data.name} soumis en validation LYA`,`✦ ${data.name} submitted to LYA validation`));}}/>
      <MilestoneModal open={showMilestone} onClose={()=>setShowMilestone(false)} lang={lang} projectName={milestoneProject} onSubmit={data=>{onNotify(T(`✦ Jalon "${data.title}" publié`,`✦ Milestone "${data.title}" published`));}}/>
      <UploadModal open={showUpload} onClose={()=>setShowUpload(false)} lang={lang} onSubmit={data=>{setUploadedFiles(prev=>[...prev,data]);onNotify(T(`✦ ${data.name} uploadé`,`✦ ${data.name} uploaded`));}}/>
    </div>
  );
};
