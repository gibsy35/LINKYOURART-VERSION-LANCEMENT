import React, { useState, useMemo } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { RealtimeChart } from '../components/RealtimeChart';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/DashboardModals';
import { AuthGuard } from '../components/AuthGuard';
import { getSafeImageUrl } from '../utils/image';
import {
  TrendingUp, Award, Zap, Star, BarChart2, Mail,
  ArrowUpRight, Bell, Users, Filter, ChevronDown,
  ExternalLink, Sparkles, AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

export const InvestorDashboardView: React.FC<{user:UserProfile|null;onNotify:(msg:string)=>void;onViewChange:(v:any)=>void}> = ({user,onNotify,onViewChange}) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR'|'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  if (!user) return <AuthGuard user={user} onViewChange={onViewChange}>{null}</AuthGuard>;

  const [activeSection, setActiveSection] = useState<'portfolio'|'investments'|'analytics'|'social'>('portfolio');
  const [compareMode, setCompareMode] = useState<'bars'|'radar'>('bars');
  const [showFilters, setShowFilters] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [contactProject, setContactProject] = useState<string|null>(null);
  const [investmentsShown, setInvestmentsShown] = useState(3);
  const [socialMessage, setSocialMessage] = useState('');
  const [socialPosts, setSocialPosts] = useState<{user:string;avatar:string;action:string;project:string;time:string;likes:number;comments:number;liked:boolean;quote?:string}[]>([
    {user:'Emma Laurent',avatar:'👩',action:T('a soutenu 5000€ dans','pledged €5000 in'),project:'Digital Dreams',time:T('Il y a 3h','3h ago'),likes:24,comments:8,liked:false},
    {user:'Thomas Martin',avatar:'👨',action:T('a commenté','commented on'),project:'Future Memories',time:T('Il y a 5h','5h ago'),likes:15,comments:3,liked:false,quote:T('"Projet incroyable ! La trajectoire LYA est excellente 🚀"','"Incredible project! The LYA trajectory is excellent 🚀"')},
    {user:'Sophie Bernard',avatar:'👩',action:T('a aimé','liked'),project:'Urban Canvas',time:T('Il y a 7h','7h ago'),likes:32,comments:12,liked:false},
  ]);

  const attentionProjects = CONTRACTS.filter(c => c.status === 'RISK');

  const sendMonthlyReport = async () => {
    if (!user?.email) { onNotify(T('Aucun email associé à votre compte', 'No email associated with your account')); return; }
    setSendingReport(true);
    try {
      const payload = {
        email: user.email,
        patronName: user.displayName || 'Mécène',
        lang,
        totalContributed,
        projects: mySupports.map(x => ({
          name: x.proj.name,
          category: x.proj.category,
          contributed: x.contributed,
          lyaScore: x.proj.totalScore,
          scoreAtSupport: x.scoreAtSupport,
          status: x.proj.status,
          milestones: (x.proj.milestones || []).filter((m: any) => m.status === 'COMPLETED').map((m: any) => m.label).slice(0, 3),
        })),
      };
      const res = await fetch('/api/email/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer lya-monthly-report-2026' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) onNotify(T(`✦ Rapport envoyé à ${user.email}`, `✦ Report sent to ${user.email}`));
      else onNotify(T('Erreur lors de l\'envoi', 'Error sending report'));
    } catch { onNotify(T('Erreur réseau', 'Network error')); }
    setSendingReport(false);
  };

  const mySupports = [
    { proj: CONTRACTS[0], contributed: 10000, units: 200, scoreAtSupport: CONTRACTS[0].totalScore - 92 },
    { proj: CONTRACTS[1], contributed: 15000, units: 300, scoreAtSupport: CONTRACTS[1].totalScore - 48 },
    { proj: CONTRACTS[4], contributed: 8000,  units: 160, scoreAtSupport: CONTRACTS[4].totalScore + 35 },
    { proj: CONTRACTS[5], contributed: 12000, units: 240, scoreAtSupport: CONTRACTS[5].totalScore + 60 },
    { proj: CONTRACTS[2], contributed: 10000, units: 200, scoreAtSupport: CONTRACTS[2].totalScore - 110 },
  ];

  const totalContributed = mySupports.reduce((s,x) => s + x.contributed, 0);
  const avgScoreNow = mySupports.reduce((s,x) => s + x.proj.totalScore, 0) / mySupports.length;
  const progressing = mySupports.filter(x => x.proj.totalScore > x.scoreAtSupport).length;
  const needsAttention = mySupports.filter(x => x.proj.totalScore <= x.scoreAtSupport).length;
  const totalMilestones = mySupports.reduce((s,x) => s + (x.proj.milestones||[]).filter((m:any)=>m.status==='COMPLETED').length, 0);

  const trends = [
    {cat:T('Art Digital','Digital Art'),pct:'+12',up:true},
    {cat:T('Musique','Music'),pct:'+8',up:true},
    {cat:T('Film','Film'),pct:'-2',up:false},
    {cat:T('Design','Design'),pct:'+16',up:true},
    {cat:T('Mode','Fashion'),pct:'-5',up:false},
  ];

  const alerts = [
    {textFR:`${CONTRACTS[4].name} n'a pas encore franchi de nouveau jalon depuis votre soutien`,textEN:`${CONTRACTS[4].name} hasn't reached a new milestone since your support`,time:T('Il y a 2h','2h ago'),type:'warning'},
    {textFR:`${CONTRACTS[0].name} a atteint un nouveau jalon, Score LYA en hausse`,textEN:`${CONTRACTS[0].name} reached a new milestone, LYA Score is up`,time:T('Il y a 5h','5h ago'),type:'success'},
    {textFR:`${CONTRACTS[5].name} est passé en Audit Renforcé`,textEN:`${CONTRACTS[5].name} moved to Enhanced Audit`,time:T('Il y a 1j','1 day ago'),type:'warning'},
  ];

  const tabs = [
    {key:'portfolio' as const,labelFR:'Mon Espace',labelEN:'My Space'},
    {key:'investments' as const,labelFR:'Mes Soutiens',labelEN:'My Pledges'},
    {key:'analytics' as const,labelFR:'Analytics',labelEN:'Analytics'},
    {key:'social' as const,labelFR:'Hub Social',labelEN:'Social Hub'},
  ];

  const statusLabel = (s: string) => s === 'RISK' ? T('Audit Renforcé','Enhanced Audit') : s === 'SUSPENDED' ? T('Suspendu','Suspended') : T('Certifié','Certified');

  return (
    <div className="space-y-6 pb-12">
      <PageHeader titleWhite={T('MON','MY')} titleAccent={T('ESPACE MÉCÈNE','PATRON SPACE')} description={T('Suivez vos soutiens et le Score LYA de vos projets en temps réel','Track your pledges and your projects\' LYA Score in real time')} accentColor="text-emerald-400"/>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={()=>setActiveSection('analytics')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider"><BarChart2 size={14}/> {T('Analytics','Analytics')}</button>
        <button onClick={sendMonthlyReport} disabled={sendingReport} className="flex items-center gap-2 px-4 py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] text-sm font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all uppercase tracking-wider disabled:opacity-60">
          <Mail size={14}/> {sendingReport ? T('Envoi...','Sending...') : T('Rapport mensuel','Monthly report')}
        </button>
      </div>

      {attentionProjects.length > 0 && (
        <div className="bg-accent-gold/8 border border-accent-gold/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={15} className="text-accent-gold shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-black text-accent-gold">{T(`${needsAttention} projet(s) à surveiller`,`${needsAttention} project(s) to watch`)}</p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">{mySupports.filter(x=>x.proj.totalScore<=x.scoreAtSupport).map(x=>x.proj.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-surface-low/30 border border-white/6 rounded-xl p-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest shrink-0"><TrendingUp size={11}/> {T('Tendances Score','Score Trends')}</div>
        <div className="w-px h-4 bg-white/10 shrink-0"/>
        {trends.map((tr,i)=>(
          <div key={i} className="flex items-center gap-1.5 shrink-0 px-3 py-1 bg-surface-high/40 rounded-lg border border-white/8">
            <span className="text-xs font-bold text-on-surface">{tr.cat}</span>
            <span className={`text-xs font-black ${tr.up?'text-emerald-400':'text-rose-400'}`}>{tr.up?'↑':'↓'}{tr.pct} pts</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveSection(tab.key)}
            className={`px-4 pb-3 text-xs font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection===tab.key?'text-emerald-400':'text-on-surface-variant hover:text-on-surface'}`}>
            {T(tab.labelFR,tab.labelEN)}
            {activeSection===tab.key&&<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 transition-all duration-300"/>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.18}}>

          {activeSection === 'portfolio' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {icon:<Award size={18} className="text-primary-cyan"/>,label:T('Total contribué','Total contributed'),value:formatPrice(totalContributed),sub:`${mySupports.length} ${T('projets','projects')}`,up:true,color:'bg-primary-cyan/10'},
                  {icon:<TrendingUp size={18} className="text-emerald-400"/>,label:T('Score moyen suivi','Average score followed'),value:`${avgScoreNow.toFixed(0)}/1000`,sub:T('des projets soutenus','of supported projects'),up:true,color:'bg-emerald-400/10'},
                  {icon:<Sparkles size={18} className="text-[#a78bfa]"/>,label:T('Prix de l\'unité LYA','LYA unit price'),value:formatPrice(LYA_UNIT_VALUE),sub:T('Fixe, non négociable','Fixed, non-negotiable'),up:true,color:'bg-[#a78bfa]/10'},
                  {icon:<Star size={18} className="text-accent-gold"/>,label:T('En progression / à surveiller','Progressing / to watch'),value:`${progressing}/${needsAttention}`,sub:T(`${totalMilestones} jalons franchis au total`,`${totalMilestones} milestones reached total`),up:progressing>=needsAttention,color:'bg-accent-gold/10'},
                ].map((k,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2 hover:border-white/15 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
                    <p className="text-xs text-on-surface-variant/60">{k.label}</p>
                    <p className="text-lg font-black text-on-surface">{k.value}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 ${k.up?'text-emerald-400':'text-rose-400'}`}><ArrowUpRight size={11}/>{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-accent-gold/8 to-primary-cyan/5 border border-accent-gold/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 bg-accent-gold/15 border border-accent-gold/25 rounded-xl flex items-center justify-center shrink-0"><span className="text-accent-gold font-black text-xs">LYA</span></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-accent-gold uppercase tracking-widest mb-0.5">{T('LYA UNIT — Prix fixe de référence','LYA UNIT — Fixed reference price')}</p>
                  <p className="text-xs text-on-surface-variant/60">{T('Le prix de l\'unité LYA est fixe à 50$, quel que soit le projet ou ses jalons. Ce n\'est ni un titre financier, ni un instrument négociable.','The LYA unit price is fixed at $50, regardless of the project or its milestones. It is neither a financial security nor a tradeable instrument.')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase">{T('Jalons franchis','Milestones reached')}</p>
                  <p className="text-xl font-black font-mono text-emerald-400">{totalMilestones}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Évolution du Score suivi','Followed Score Trend')}</p>
                    <div className="flex items-center gap-1">
                      {(['7D','1M','3M','1Y'] as const).map(p=><button key={p} className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${p==='1M'?'bg-primary-cyan text-surface-dim':'text-on-surface-variant hover:text-on-surface'}`}>{p}</button>)}
                    </div>
                  </div>
                  <RealtimeChart color="#10b981" base={avgScoreNow} lang={lang} formatPrice={formatPrice} labelFR="Score" labelEN="Score" showPrice={false}/>
                </div>
                <div className="space-y-4">
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Bell size={13}/> {T('Alertes','Alerts')}</p>
                      <span className="w-5 h-5 bg-accent-gold rounded-full text-[10px] font-black text-surface-dim flex items-center justify-center">{alerts.length}</span>
                    </div>
                    {alerts.map((a,i)=>(
                      <div key={i} className={`p-2.5 rounded-lg border ${a.type==='warning'?'bg-accent-gold/5 border-accent-gold/15':'bg-emerald-400/5 border-emerald-400/15'}`}>
                        <p className="text-xs font-medium text-on-surface leading-relaxed">{T(a.textFR,a.textEN)}</p>
                        <p className="text-[10px] text-on-surface-variant/40 mt-1">{a.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Star size={13} className="text-accent-gold"/>{T('Stats','Stats')}</p>
                    {[
                      {l:T('Meilleure progression','Best progress'),v:`+${Math.max(...mySupports.map(x=>x.proj.totalScore-x.scoreAtSupport))} pts`,c:'text-emerald-400'},
                      {l:T('À surveiller de près','Closest watch'),v:`${Math.min(...mySupports.map(x=>x.proj.totalScore-x.scoreAtSupport))} pts`,c:'text-accent-gold'},
                      {l:T('Score le plus élevé','Highest score'),v:`${Math.max(...mySupports.map(x=>x.proj.totalScore))}/1000`,c:'text-accent-gold'},
                      {l:T('Contribution moyenne','Avg contribution'),v:formatPrice(totalContributed/mySupports.length),c:'text-on-surface'},
                    ].map((s,i)=>(
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <p className="text-xs text-on-surface-variant/60">{s.l}</p>
                        <p className={`text-xs font-black ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'investments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {l:T('Total contribué','Total contributed'), v:formatPrice(totalContributed), c:'text-primary-cyan'},
                  {l:T('Score moyen','Average score'), v:`${avgScoreNow.toFixed(0)}/1000`, c:'text-emerald-400'},
                  {l:T('Jalons franchis','Milestones reached'), v:`${totalMilestones}`, c:'text-emerald-400'},
                  {l:T('En progression','Progressing'), v:`${progressing}/${mySupports.length}`, c:'text-accent-gold'},
                ].map((s,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                    <p className={`text-base font-black ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-on-surface-variant/60">{mySupports.length} {T('projets soutenus','pledged projects')} · {progressing} {T('en progression','progressing')} · {needsAttention} {T('à surveiller','to watch')}</p>

              {mySupports.slice(0, investmentsShown).map((inv,i) => {
                const scoreDelta = inv.proj.totalScore - inv.scoreAtSupport;
                const up = scoreDelta >= 0;
                return (
                  <div key={i} className={`bg-surface-low/40 border rounded-2xl overflow-hidden transition-all ${inv.proj.status==='RISK'?'border-accent-gold/25 hover:border-accent-gold/40':'border-white/8 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3 p-4">
                      <img src={getSafeImageUrl(inv.proj.image,inv.proj.category)} alt={inv.proj.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-black text-on-surface truncate">{inv.proj.name}</p>
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase ${inv.proj.status==='RISK'?'bg-accent-gold/10 border-accent-gold/20 text-accent-gold':'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'}`}>
                            {statusLabel(inv.proj.status)}
                          </span>
                          <span className={`text-[10px] font-black ${inv.proj.rarity==='Legendary'?'text-accent-gold':inv.proj.rarity==='Epic'?'text-[#a78bfa]':'text-primary-cyan'}`}>★ {inv.proj.rarity}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant/50">{inv.proj.category} · {inv.proj.registryIndex}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">LYA Score</p>
                        <p className="text-lg font-black text-accent-gold">{inv.proj.totalScore}<span className="text-xs text-on-surface-variant/30">/1000</span></p>
                      </div>
                      <button onClick={()=>setContactProject(inv.proj.name)} className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors ml-1"><ExternalLink size={15}/></button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-white/6 border-t border-white/6">
                      {[
                        {l:T('Contribué','Contributed'), v:formatPrice(inv.contributed), c:'text-on-surface'},
                        {l:T('Unités LYA','LYA units'), v:`${inv.units}`, c:'text-primary-cyan'},
                        {l:T('Score au soutien','Score at support'), v:`${inv.scoreAtSupport}`, c:'text-on-surface-variant'},
                        {l:T('Progression Score','Score progress'), v:`${up?'+':''}${scoreDelta} pts`, c:up?'text-emerald-400':'text-accent-gold'},
                      ].map((s,si)=>(
                        <div key={si} className="p-3">
                          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                          <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/6 border-t border-white/6 bg-surface-high/10">
                      {[
                        {l:T('Statut','Status'), v:statusLabel(inv.proj.status), c:inv.proj.status==='RISK'?'text-accent-gold':'text-emerald-400'},
                        {l:T('Date du soutien','Pledge date'), v:`${T('Août','Aug')} 2025`, c:'text-on-surface-variant/60'},
                      ].map((s,si)=>(
                        <div key={si} className="p-3">
                          <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-widest mb-1">{s.l}</p>
                          <p className={`text-xs font-black ${s.c}`}>{s.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {investmentsShown < mySupports.length && (
                <button onClick={()=>setInvestmentsShown(n=>n+3)} className="w-full py-3 bg-surface-high/30 border border-white/8 text-sm font-black text-on-surface-variant hover:text-on-surface hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ChevronDown size={14}/> {T(`Voir plus (${mySupports.length-investmentsShown} restants)`,`Load more (${mySupports.length-investmentsShown} remaining)`)}
                </button>
              )}
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div><h2 className="text-xl font-black text-on-surface">{T('Analytics','Analytics')} <span className="text-emerald-400">{T('Mécène','Patron')}</span></h2></div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 bg-surface-high/40 border border-white/10 text-xs font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider"><Filter size={12}/> {T('Filtres','Filters')}</button>
                  <div className="bg-surface-low/40 border border-white/10 rounded-xl px-3 py-2 text-right"><p className="text-[10px] text-on-surface-variant/50 uppercase">{T('Projets suivis','Followed projects')}</p><p className="text-lg font-black text-on-surface">{mySupports.length}</p></div>
                  <div className="bg-surface-low/40 border border-white/10 rounded-xl px-3 py-2 text-right"><p className="text-[10px] text-on-surface-variant/50 uppercase">{T('Score Moyen','Avg Score')}</p><p className="text-lg font-black text-emerald-400">{avgScoreNow.toFixed(0)}</p></div>
                </div>
              </div>

              {showFilters && (
                <div className="bg-surface-low border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Filtres avancés','Advanced filters')}</p>
                  <div className="flex flex-wrap gap-2">
                    {[T('Meilleure Progression','Top Progress'),T('À Surveiller','To Watch'),T('Musique','Music'),T('Art Digital','Digital Art')].map(f=>(
                      <button key={f} className="px-3 py-1.5 bg-surface-high/50 border border-white/10 rounded-full text-xs font-black text-on-surface-variant hover:text-primary-cyan hover:border-primary-cyan/30 transition-all">{f}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {l:T('Total contribué','Total contributed'),v:formatPrice(totalContributed),sub:`${mySupports.length} ${T('soutiens','pledges')}`,c:'text-primary-cyan'},
                  {l:T('Score moyen suivi','Average followed score'),v:`${avgScoreNow.toFixed(0)}/1000`,sub:T('des projets soutenus','of pledged projects'),c:'text-emerald-400'},
                  {l:T('Projets en progression','Progressing projects'),v:`${progressing}/${mySupports.length}`,sub:`${needsAttention} ${T('à surveiller','to watch')}`,c:'text-[#a78bfa]'},
                  {l:T('Jalons franchis total','Total milestones reached'),v:`${totalMilestones}`,sub:T('tous projets confondus','across all projects'),c:'text-accent-gold'},
                ].map((k,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4">
                    <p className="text-xs text-on-surface-variant/50">{k.l}</p>
                    <p className={`text-xl font-black ${k.c} mt-1`}>{k.v}</p>
                    <p className="text-xs text-on-surface-variant/40">{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Score Moyen en Temps Réel','Real-time Average Score')}</p>
                <RealtimeChart color="#10b981" base={avgScoreNow} lang={lang} formatPrice={formatPrice} labelFR="Score" labelEN="Score" showPrice={false}/>
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Score LYA par soutien','LYA Score per pledge')}</p>
                  <div className="flex gap-1">
                    {(['bars','radar'] as const).map(m=><button key={m} onClick={()=>setCompareMode(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${compareMode===m?'bg-primary-cyan/15 border border-primary-cyan/30 text-primary-cyan':'text-on-surface-variant hover:text-on-surface border border-white/8'}`}>{m==='bars'?T('Barres','Bars'):'Radar'}</button>)}
                  </div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    {compareMode === 'bars' ? (
                      <BarChart data={mySupports.map(x=>({name:x.proj.registryIndex.split('-')[0],score:x.proj.totalScore,up:x.proj.totalScore>=x.scoreAtSupport}))}>
                        <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{background:'#0f121a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:11}} formatter={(v:number)=>[`${v}/1000`,'Score LYA']}/>
                        <Bar dataKey="score" radius={[4,4,0,0]}>{mySupports.map((x,i)=><Cell key={i} fill={x.proj.totalScore>=x.scoreAtSupport?'#10b981':'#eab308'}/>)}</Bar>
                      </BarChart>
                    ) : (
                      <RadarChart data={mySupports.slice(0,4).map(x=>({name:x.proj.registryIndex.split('-')[0],score:x.proj.totalScore}))}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                        <PolarAngleAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}}/>
                        <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2}/>
                      </RadarChart>
                    )}
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-on-surface-variant/40">{T('Vert = Score en progression depuis votre soutien · Jaune = à surveiller','Green = Score progressing since your pledge · Yellow = to watch')}</p>
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a78bfa]"/><p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Simulateur de Score','Score Simulator')}</p></div>
                  <div className="text-right"><p className="text-[10px] text-on-surface-variant/40 uppercase">{T('Basé sur','Based on')}</p><p className="text-base font-black text-emerald-400">{T('Rythme de Jalons','Milestone Pace')}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {l:T('Conservateur','Conservative'),v:`${Math.min(1000, Math.round(avgScoreNow*1.05))}/1000`,c:'text-emerald-400',sub:T('jalons minimum','minimum milestones')},
                    {l:T('Équilibré','Balanced'),v:`${Math.min(1000, Math.round(avgScoreNow*1.12))}/1000`,c:'text-accent-gold',sub:T('trajectoire moyenne','average trajectory')},
                    {l:T('Optimal','Optimal'),v:`${Math.min(1000, Math.round(avgScoreNow*1.22))}/1000`,c:'text-[#a78bfa]',sub:T('tous jalons tenus','all milestones on time')},
                  ].map((s,i)=>(
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3">
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className={`text-base font-black ${s.c}`}>{s.v}</p>
                      <p className="text-xs text-on-surface-variant/40">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Score moyen par catégorie','Average score by category')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{cat:T('Musique','Music'),score:842,p:5},{cat:T('Art Visuel','Visual Art'),score:781,p:4},{cat:T('Cinéma','Cinema'),score:695,p:2},{cat:T('Mode','Fashion'),score:610,p:1}].map((r,i)=>{
                    const colors = ['bg-[#a78bfa]','bg-primary-cyan','bg-accent-gold','bg-emerald-400'];
                    return <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full ${colors[i]}`}/><p className="text-xs font-black text-on-surface">{r.cat}</p></div><p className="text-xl font-black text-emerald-400">{r.score}<span className="text-xs text-on-surface-variant/40">/1000</span></p><p className="text-xs text-on-surface-variant/40">{r.p} {T('projets','projects')}</p></div>;
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between"><p className="text-sm font-black text-on-surface flex items-center gap-2"><Users size={13} className="text-primary-cyan"/> {T('Hub Social','Social Hub')}</p><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/><span className="text-[10px] font-black text-emerald-400 uppercase">LIVE</span></div></div>
                <div className="space-y-3">
                  {socialPosts.map((post,i)=>(
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-4 space-y-2 hover:border-white/15 transition-all">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-surface-dim border border-white/10 flex items-center justify-center text-lg">{post.avatar}</div><div className="flex-1 min-w-0"><p className="text-sm font-black text-on-surface">{post.user} <span className="font-normal text-on-surface-variant/60">{post.action}</span> <span className="text-primary-cyan font-bold">{post.project}</span></p><p className="text-[10px] text-on-surface-variant/40">{post.time}</p></div></div>
                      {post.quote&&<p className="text-xs text-on-surface-variant/70 italic pl-12">{post.quote}</p>}
                      <div className="flex items-center gap-4 pl-12 text-xs text-on-surface-variant/40">
                        <button onClick={()=>{const cur=socialPosts[i];setSocialPosts(prev=>prev.map((p,pi)=>pi===i?{...p,liked:!cur.liked,likes:cur.liked?cur.likes-1:cur.likes+1}:p));}} className="hover:text-rose-400 transition-colors flex items-center gap-1">{socialPosts[i]?.liked?'♥':'♡'} {post.likes}</button>
                        <button className="hover:text-primary-cyan transition-colors flex items-center gap-1">💬 {post.comments}</button>
                        <button className="hover:text-[#a78bfa] transition-colors">↗</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-9 h-9 rounded-full bg-surface-dim border border-white/10 flex items-center justify-center">🙂</div>
                  <div className="flex-1 bg-surface-high/40 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                    <input value={socialMessage} onChange={e=>setSocialMessage(e.target.value)} placeholder={T('Partagez votre expérience...','Share your experience...')} className="flex-1 bg-transparent text-sm text-on-surface focus:outline-none min-w-0"/>
                    <button onClick={()=>{if(socialMessage.trim()){setSocialPosts(prev=>[{user:user?.displayName||'Vous',avatar:'🙂',action:T('a partagé','shared'),project:'LinkYourArt',time:T('À l\'instant','Just now'),likes:0,comments:0,liked:false},...prev]);setSocialMessage('');}}} className="w-7 h-7 bg-[#a78bfa] rounded-lg flex items-center justify-center text-surface-dim hover:bg-white transition-all shrink-0">↗</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal open={!!contactProject} onClose={()=>setContactProject(null)} title={T('Contacter le créateur','Contact creator')}>
        <p className="text-sm text-on-surface-variant/60">{T('Projet :','Project:')} <span className="text-primary-cyan font-black">{contactProject}</span></p>
        <p className="text-sm text-on-surface-variant/60 leading-relaxed">{T('Votre demande sera transmise via LYA sous 24-48h.','Your request will be forwarded via LYA within 24-48h.')}</p>
        <button onClick={async()=>{
          try {
            await addDoc(collection(db,'messages'),{
              type:'patron_contact',
              projectName: contactProject,
              fromId: user?.uid,
              fromName: user?.displayName,
              fromEmail: user?.email,
              fromRole: 'PATRON',
              status: 'PENDING',
              createdAt: serverTimestamp(),
            });
            onNotify(T('✦ Message envoyé au créateur','✦ Message sent to creator'));
          } catch(e) { onNotify(T('Erreur réseau','Network error')); }
          setContactProject(null);
        }} className="w-full py-3 bg-primary-cyan text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest">{T('Envoyer','Send')}</button>
      </Modal>
    </div>
  );
};
