import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { RealtimeChart } from '../components/RealtimeChart';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/DashboardModals';
import { getSafeImageUrl } from '../utils/image';
import {
  TrendingUp, TrendingDown, DollarSign, Zap, Star, BarChart2,
  ArrowUpRight, ArrowDownRight, Bell, Users, Filter, ChevronDown,
  ExternalLink, Sparkles, Target, AlertTriangle, CheckCircle,
  Info, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const unitPrice = (g: number) => LYA_UNIT_VALUE * (1 + g / 100);

export const InvestorDashboardView: React.FC<{user:UserProfile|null;onNotify:(msg:string)=>void;onViewChange:(v:any)=>void}> = ({user,onNotify,onViewChange}) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR'|'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'portfolio'|'investments'|'analytics'|'social'>('portfolio');
  const [compareMode, setCompareMode] = useState<'bars'|'radar'>('bars');
  const [predHorizon, setPredHorizon] = useState<'7j'|'30j'|'90j'|'1an'>('30j');
  const [showFilters, setShowFilters] = useState(false);
  const [contactProject, setContactProject] = useState<string|null>(null);
  const [investmentsShown, setInvestmentsShown] = useState(3);
  const [socialMessage, setSocialMessage] = useState('');
  const [socialPosts, setSocialPosts] = useState<{user:string;avatar:string;action:string;project:string;time:string;likes:number;comments:number;liked:boolean;quote?:string}[]>([
    {user:'Emma Laurent',avatar:'👩',action:T('a soutenu 5000€ dans','pledged €5000 in'),project:'Digital Dreams',time:T('Il y a 3h','3h ago'),likes:24,comments:8,liked:false},
    {user:'Thomas Martin',avatar:'👨',action:T('a commenté','commented on'),project:'Future Memories',time:T('Il y a 5h','5h ago'),likes:15,comments:3,liked:false,quote:T('"Projet incroyable ! La trajectoire LYA est excellente 🚀"','"Incredible project! The LYA trajectory is excellent 🚀"')},
    {user:'Sophie Bernard',avatar:'👩',action:T('a aimé','liked'),project:'Urban Canvas',time:T('Il y a 7h','7h ago'),likes:32,comments:12,liked:false},
  ]);

  // Données réelles
  const liveProjects = CONTRACTS.filter(c => c.status === 'LIVE');
  const riskProjects = CONTRACTS.filter(c => c.status === 'RISK');

  // Portefeuille fictif mais réaliste (3 projets avec des résultats MIXTES)
  const myInvestments = [
    { proj: CONTRACTS[0], invested: 10000, units: 200, roi: +50.0 },  // LIVE +14.2%
    { proj: CONTRACTS[1], invested: 15000, units: 300, roi: +8.4  },  // LIVE +8.4%
    { proj: CONTRACTS[4], invested: 8000,  units: 160, roi: -28.4 },  // RISK -28.4%
    { proj: CONTRACTS[5], invested: 12000, units: 240, roi: -52.1 },  // RISK -52.1%
    { proj: CONTRACTS[2], invested: 10000, units: 200, roi: +25.8 },  // LIVE +25.8%
  ];

  const totalInvested = myInvestments.reduce((s,x) => s + x.invested, 0);
  const totalCurrent = myInvestments.reduce((s,x) => s + x.invested * (1 + x.roi/100), 0);
  const totalProfit = totalCurrent - totalInvested;
  const avgRoi = ((totalCurrent - totalInvested) / totalInvested) * 100;
  const winners = myInvestments.filter(x => x.roi > 0).length;
  const losers = myInvestments.filter(x => x.roi < 0).length;

  const predMultiplier = predHorizon === '7j' ? 1.02 : predHorizon === '30j' ? 1.097 : predHorizon === '90j' ? 1.18 : 1.32;
  const predBase = totalCurrent;

  const trends = [
    {cat:T('Art Digital','Digital Art'),pct:'+12.5',up:true},
    {cat:T('Musique','Music'),pct:'+8.3',up:true},
    {cat:T('Film','Film'),pct:'-2.1',up:false},
    {cat:T('Design','Design'),pct:'+15.7',up:true},
    {cat:T('Mode','Fashion'),pct:'-5.4',up:false},
  ];

  const alerts = [
    {textFR:`${CONTRACTS[4].name} a perdu -28% — votre LYA UNIT est passé à ${formatPrice(unitPrice(CONTRACTS[4].growth))}`,textEN:`${CONTRACTS[4].name} lost -28% — your LYA UNIT dropped to ${formatPrice(unitPrice(CONTRACTS[4].growth))}`,time:T('Il y a 2h','2h ago'),type:'danger'},
    {textFR:`${CONTRACTS[0].name} a atteint un nouveau jalon +15%`,textEN:`${CONTRACTS[0].name} reached a new milestone +15%`,time:T('Il y a 5h','5h ago'),type:'success'},
    {textFR:`${CONTRACTS[5].name} est passé en statut RISQUE`,textEN:`${CONTRACTS[5].name} moved to RISK status`,time:T('Il y a 1j','1 day ago'),type:'warning'},
  ];

  const tabs = [
    {key:'portfolio' as const,labelFR:'Mon Portfolio',labelEN:'My Portfolio'},
    {key:'investments' as const,labelFR:'Mes Soutiens',labelEN:'My Pledges'},
    {key:'analytics' as const,labelFR:'Analytics',labelEN:'Analytics'},
    {key:'social' as const,labelFR:'Hub Social',labelEN:'Social Hub'},
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader titleWhite={T('MON','MY')} titleAccent={T('PORTFOLIO','PORTFOLIO')} description={T('Suivez vos soutiens et collections en temps réel','Track your pledges and collections in real time')} accentColor="text-emerald-400"/>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={()=>setActiveSection('analytics')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-sm font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider"><BarChart2 size={14}/> {T('Analytics','Analytics')}</button>
      </div>

      {/* Alerte projets en difficulté */}
      {riskProjects.length > 0 && (
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-black text-rose-400">{T(`${losers} soutien(s) en territoire négatif`,`${losers} pledge(s) in negative territory`)}</p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">{myInvestments.filter(x=>x.roi<0).map(x=>x.proj.name).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Tendances marché */}
      <div className="bg-surface-low/30 border border-white/6 rounded-xl p-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest shrink-0"><TrendingUp size={11}/> {T('Tendances','Trends')}</div>
        <div className="w-px h-4 bg-white/10 shrink-0"/>
        {trends.map((tr,i)=>(
          <div key={i} className="flex items-center gap-1.5 shrink-0 px-3 py-1 bg-surface-high/40 rounded-lg border border-white/8">
            <span className="text-xs font-bold text-on-surface">{tr.cat}</span>
            <span className={`text-xs font-black ${tr.up?'text-emerald-400':'text-rose-400'}`}>{tr.up?'↑':'↓'}{tr.pct}%</span>
          </div>
        ))}
      </div>

      {/* Onglets */}
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

          {/* ── PORTFOLIO ─────────────────────────────────────────────────── */}
          {activeSection === 'portfolio' && (
            <div className="space-y-5">
              {/* KPIs réels */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {icon:<DollarSign size={18} className="text-primary-cyan"/>,label:T('Investi total','Total invested'),value:formatPrice(totalInvested),sub:`${myInvestments.length} ${T('projets','projects')}`,up:true,color:'bg-primary-cyan/10'},
                  {icon:<TrendingUp size={18} className={avgRoi>=0?'text-emerald-400':'text-rose-400'}/>,label:T('Valeur actuelle','Current value'),value:formatPrice(totalCurrent),sub:`${avgRoi>=0?'+':''}${avgRoi.toFixed(1)}% ROI`,up:avgRoi>=0,color:avgRoi>=0?'bg-emerald-400/10':'bg-rose-400/10'},
                  {icon:<Sparkles size={18} className="text-[#a78bfa]"/>,label:T('LYA UNIT moyen','Avg LYA UNIT'),value:formatPrice(myInvestments.reduce((s,x)=>s+unitPrice(x.proj.growth),0)/myInvestments.length),sub:`Base: ${formatPrice(LYA_UNIT_VALUE)}`,up:avgRoi>=0,color:'bg-[#a78bfa]/10'},
                  {icon:<Star size={18} className="text-accent-gold"/>,label:T('Gagnants / Perdants','Winners / Losers'),value:`${winners}/${losers}`,sub:T(`${losers} en négatif`,`${losers} negative`),up:winners>losers,color:'bg-accent-gold/10'},
                ].map((k,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2 hover:border-white/15 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
                    <p className="text-xs text-on-surface-variant/60">{k.label}</p>
                    <p className="text-lg font-black text-on-surface">{k.value}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 ${k.up?'text-emerald-400':'text-rose-400'}`}>{k.up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* LYA UNIT encadré */}
              <div className="bg-gradient-to-r from-accent-gold/8 to-primary-cyan/5 border border-accent-gold/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 bg-accent-gold/15 border border-accent-gold/25 rounded-xl flex items-center justify-center shrink-0"><span className="text-accent-gold font-black text-xs">LYA</span></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-accent-gold uppercase tracking-widest mb-0.5">LYA UNIT — {T('Index de valeur de vos soutiens','Value index of your pledges')}</p>
                  <p className="text-xs text-on-surface-variant/60">{T('La valeur de vos LYA Units fluctue avec les jalons et le LYA Score de chaque projet. Certains projets peuvent perdre de la valeur.','Your LYA Units value fluctuates with milestones and each project\'s LYA Score. Some projects may lose value.')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase">{T('Profit / Perte','Profit / Loss')}</p>
                  <p className={`text-xl font-black font-mono ${totalProfit>=0?'text-emerald-400':'text-rose-400'}`}>{totalProfit>=0?'+':''}{formatPrice(totalProfit)}</p>
                </div>
              </div>

              {/* Graphe + alertes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Performance du portefeuille','Portfolio Performance')}</p>
                    <div className="flex items-center gap-1">
                      {(['7D','1M','3M','1Y'] as const).map(p=><button key={p} className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${p==='1M'?'bg-primary-cyan text-surface-dim':'text-on-surface-variant hover:text-on-surface'}`}>{p}</button>)}
                    </div>
                  </div>
                  <RealtimeChart color="#10b981" base={totalCurrent} lang={lang} formatPrice={formatPrice} labelFR="Valeur" labelEN="Value" showPrice={true}/>
                </div>
                <div className="space-y-4">
                  {/* Alertes */}
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Bell size={13}/> {T('Alertes','Alerts')}</p>
                      <span className="w-5 h-5 bg-rose-400 rounded-full text-[10px] font-black text-white flex items-center justify-center">{alerts.length}</span>
                    </div>
                    {alerts.map((a,i)=>(
                      <div key={i} className={`p-2.5 rounded-lg border ${a.type==='danger'?'bg-rose-500/5 border-rose-500/15':a.type==='warning'?'bg-accent-gold/5 border-accent-gold/15':'bg-emerald-400/5 border-emerald-400/15'}`}>
                        <p className="text-xs font-medium text-on-surface leading-relaxed">{T(a.textFR,a.textEN)}</p>
                        <p className="text-[10px] text-on-surface-variant/40 mt-1">{a.time}</p>
                      </div>
                    ))}
                  </div>
                  {/* Stats */}
                  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Star size={13} className="text-accent-gold"/>{T('Stats','Stats')}</p>
                    {[
                      {l:T('Meilleur soutien','Best pledge'),v:`+${Math.max(...myInvestments.map(x=>x.roi)).toFixed(1)}%`,c:'text-emerald-400'},
                      {l:T('Pire soutien','Worst pledge'),v:`${Math.min(...myInvestments.map(x=>x.roi)).toFixed(1)}%`,c:'text-rose-400'},
                      {l:T('LYA UNIT le plus haut','Highest LYA UNIT'),v:formatPrice(Math.max(...myInvestments.map(x=>unitPrice(x.proj.growth)))),c:'text-accent-gold'},
                      {l:T('Investi moyen','Avg invested'),v:formatPrice(totalInvested/myInvestments.length),c:'text-on-surface'},
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

          {/* ── MES SOUTIENS ─────────────────────────────────────────────── */}
          {activeSection === 'investments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-on-surface-variant/60">{myInvestments.length} {T('projets soutenus','pledged projects')} · {winners} {T('en hausse','rising')} · {losers} {T('en baisse','falling')}</p>
              </div>

              {myInvestments.slice(0, investmentsShown).map((inv,i) => {
                const up = inv.roi >= 0;
                const currentVal = inv.invested * (1 + inv.roi/100);
                const profit = currentVal - inv.invested;
                return (
                  <div key={i} className={`bg-surface-low/40 border rounded-2xl overflow-hidden transition-all ${inv.proj.status==='RISK'?'border-rose-500/25 hover:border-rose-500/40':'border-white/8 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3 p-4">
                      <img src={getSafeImageUrl(inv.proj.image,inv.proj.category)} alt={inv.proj.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-black text-on-surface truncate">{inv.proj.name}</p>
                          {inv.proj.status==='RISK'&&<span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-500 uppercase">RISQUE</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant/50">{inv.proj.category} · {inv.proj.registryIndex}</p>
                        <p className="text-xs font-bold mt-0.5">LYA Score: <span className="text-accent-gold">{inv.proj.totalScore}/1000</span> · LYA UNIT: <span className={up?'text-emerald-400':'text-rose-400'}>{formatPrice(unitPrice(inv.proj.growth))}</span></p>
                      </div>
                      <button onClick={()=>setContactProject(inv.proj.name)} className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors"><ExternalLink size={15}/></button>
                    </div>
                    <div className="grid grid-cols-4 divide-x divide-white/6 border-t border-white/6">
                      {[
                        {l:T('Investi','Invested'),v:formatPrice(inv.invested),c:'text-on-surface'},
                        {l:T('Valeur','Value'),v:formatPrice(currentVal),c:up?'text-emerald-400':'text-rose-400'},
                        {l:T('P&L','P&L'),v:`${profit>=0?'+':''}${formatPrice(profit)}`,c:up?'text-emerald-400':'text-rose-400'},
                        {l:'ROI',v:`${up?'+':''}${inv.roi.toFixed(1)}%`,c:up?'text-emerald-400':'text-rose-400'},
                      ].map((s,si)=>(
                        <div key={si} className="p-3"><p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p><p className={`text-sm font-black ${s.c}`}>{s.v}</p></div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {investmentsShown < myInvestments.length && (
                <button onClick={()=>setInvestmentsShown(n=>n+3)} className="w-full py-3 bg-surface-high/30 border border-white/8 text-sm font-black text-on-surface-variant hover:text-on-surface hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ChevronDown size={14}/> {T(`Voir plus (${myInvestments.length-investmentsShown} restants)`,`Load more (${myInvestments.length-investmentsShown} remaining)`)}
                </button>
              )}
            </div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────────────────── */}
          {activeSection === 'analytics' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div><h2 className="text-xl font-black text-on-surface">{T('Analytics','Analytics')} <span className="text-emerald-400">{T('Mécène','Patron')}</span></h2></div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 bg-surface-high/40 border border-white/10 text-xs font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider"><Filter size={12}/> {T('Filtres','Filters')}</button>
                  {[{l:T('Portfolio','Portfolio'),v:T(`${myInvestments.length} Projets`,`${myInvestments.length} Projects`),c:'text-on-surface'},{l:'ROI '+T('Moyen','Avg'),v:`${avgRoi>=0?'+':''}${avgRoi.toFixed(1)}%`,c:avgRoi>=0?'text-emerald-400':'text-rose-400'}].map((s,i)=>(
                    <div key={i} className="bg-surface-low/40 border border-white/10 rounded-xl px-3 py-2 text-right"><p className="text-[10px] text-on-surface-variant/50 uppercase">{s.l}</p><p className={`text-lg font-black ${s.c}`}>{s.v}</p></div>
                  ))}
                </div>
              </div>

              {showFilters && (
                <div className="bg-surface-low border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Filtres avancés','Advanced filters')}</p>
                  <div className="flex flex-wrap gap-2">
                    {[T('Top Performers','Top Performers'),T('En difficulté','Struggling'),T('Musique','Music'),T('Art Digital','Digital Art')].map(f=>(
                      <button key={f} className="px-3 py-1.5 bg-surface-high/50 border border-white/10 rounded-full text-xs font-black text-on-surface-variant hover:text-primary-cyan hover:border-primary-cyan/30 transition-all">{f}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {l:T('Investi total','Total invested'),v:formatPrice(totalInvested),sub:`${myInvestments.length} soutiens`,c:'text-primary-cyan'},
                  {l:T('Valeur actuelle','Current value'),v:formatPrice(totalCurrent),sub:`${avgRoi>=0?'+':''}${avgRoi.toFixed(1)}%`,c:avgRoi>=0?'text-emerald-400':'text-rose-400'},
                  {l:T('Projets gagnants','Winning projects'),v:`${winners}/${myInvestments.length}`,sub:`${losers} ${T('perdants','losing')}`,c:'text-[#a78bfa]'},
                  {l:T('LYA UNIT min','Min LYA UNIT'),v:formatPrice(Math.min(...myInvestments.map(x=>unitPrice(x.proj.growth)))),sub:T('votre plus bas','your lowest'),c:'text-rose-400'},
                ].map((k,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4">
                    <p className="text-xs text-on-surface-variant/50">{k.l}</p>
                    <p className={`text-xl font-black ${k.c} mt-1`}>{k.v}</p>
                    <p className="text-xs text-on-surface-variant/40">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Valeur portfolio live */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Valeur Portfolio Temps Réel','Real-time Portfolio Value')}</p>
                <RealtimeChart color={avgRoi>=0?"#10b981":"#f43f5e"} base={totalCurrent} lang={lang} formatPrice={formatPrice} labelFR="Valeur" labelEN="Value" showPrice={true}/>
              </div>

              {/* Comparateur */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('LYA UNIT par soutien','LYA UNIT per pledge')}</p>
                  <div className="flex gap-1">
                    {(['bars','radar'] as const).map(m=><button key={m} onClick={()=>setCompareMode(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${compareMode===m?'bg-primary-cyan/15 border border-primary-cyan/30 text-primary-cyan':'text-on-surface-variant hover:text-on-surface border border-white/8'}`}>{m==='bars'?T('Barres','Bars'):'Radar'}</button>)}
                  </div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    {compareMode === 'bars' ? (
                      <BarChart data={myInvestments.map(x=>({name:x.proj.registryIndex.split('-')[0],unit:+unitPrice(x.proj.growth).toFixed(2),up:x.roi>=0}))}>
                        <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{background:'#0f121a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:11}} formatter={(v:number)=>[formatPrice(v),'LYA UNIT']}/>
                        <Bar dataKey="unit" radius={[4,4,0,0]}>{myInvestments.map((x,i)=><Cell key={i} fill={x.roi>=0?'#10b981':'#f43f5e'}/>)}</Bar>
                      </BarChart>
                    ) : (
                      <RadarChart data={myInvestments.slice(0,4).map(x=>({name:x.proj.registryIndex.split('-')[0],score:x.proj.totalScore,unit:+unitPrice(x.proj.growth).toFixed(0)}))}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                        <PolarAngleAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}}/>
                        <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2}/>
                      </RadarChart>
                    )}
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-on-surface-variant/40">{T('Vert = en hausse · Rouge = en baisse · Base = ','Green = rising · Red = falling · Base = ')}{formatPrice(LYA_UNIT_VALUE)}</p>
              </div>

              {/* Prédiction */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a78bfa]"/><p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Prédiction Portfolio','Portfolio Prediction')}</p></div>
                  <div className="text-right"><p className="text-[10px] text-on-surface-variant/40 uppercase">{T('Confiance IA','AI Confidence')}</p><p className="text-base font-black text-emerald-400">78%</p></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['7j','30j','90j','1an'] as const).map(h=><button key={h} onClick={()=>setPredHorizon(h)} className={`py-2 rounded-xl text-xs font-black transition-all ${predHorizon===h?'bg-[#a78bfa] text-surface-dim':'bg-surface-high/30 border border-white/8 text-on-surface-variant hover:text-on-surface'}`}>{h}</button>)}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {l:T('Prévision','Forecast'),v:formatPrice(predBase*predMultiplier),c:'text-[#a78bfa]',sub:`+${((predMultiplier-1)*100).toFixed(1)}%`},
                    {l:T('Tendance','Trend'),v:T('Mixte','Mixed'),c:'text-accent-gold',sub:T('Prudence recommandée','Caution advised')},
                    {l:T('Scénario baissier','Bear scenario'),v:formatPrice(predBase*0.85),c:'text-rose-400',sub:'-15%'},
                  ].map((s,i)=>(
                    <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3">
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className={`text-base font-black ${s.c}`}>{s.v}</p>
                      <p className="text-xs text-on-surface-variant/40">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI par type */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Performance par catégorie','Performance by category')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{cat:T('Musique','Music'),roi:+32.4,p:5},{cat:T('Art Visuel','Visual Art'),roi:+28.1,p:4},{cat:T('Cinéma','Cinema'),roi:-18.5,p:2},{cat:T('Mode','Fashion'),roi:-5.2,p:1}].map((r,i)=>{
                    const up = r.roi>=0;
                    const colors = ['bg-[#a78bfa]','bg-primary-cyan','bg-rose-400','bg-accent-gold'];
                    return <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3"><div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full ${colors[i]}`}/><p className="text-xs font-black text-on-surface">{r.cat}</p></div><p className={`text-xl font-black ${up?'text-emerald-400':'text-rose-400'}`}>{up?'+':''}{r.roi}%</p><p className="text-xs text-on-surface-variant/40">{r.p} {T('projets','projects')}</p></div>;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── HUB SOCIAL ──────────────────────────────────────────────── */}
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
        <button onClick={()=>{onNotify(T('✦ Message envoyé','✦ Message sent'));setContactProject(null);}} className="w-full py-3 bg-primary-cyan text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest">{T('Envoyer','Send')}</button>
      </Modal>
    </div>
  );
};
