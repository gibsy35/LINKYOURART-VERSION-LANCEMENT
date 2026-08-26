import React, { useState } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { InvitationCard } from '../components/InvitationCard';
import { getSafeImageUrl } from '../utils/image';
import {
  Search, Award, Users, ChevronDown,
  CheckCircle, Clock, BarChart2, DollarSign, Briefcase, ArrowRight,
  MessageSquare, BookOpen, Play, Lock, Send, User, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Target, Mail
} from 'lucide-react';

const KpiCard: React.FC<{icon:React.ReactNode;label:string;value:string;sub?:string;subColor?:string;color:string}> = ({icon,label,value,sub,subColor='text-emerald-400',color}) => (
  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-2 hover:border-white/15 transition-all">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <p className="text-xs text-on-surface-variant/60 font-medium">{label}</p>
    <p className="text-xl font-black text-on-surface tracking-tight">{value}</p>
    {sub && <p className={`text-xs font-bold ${subColor}`}>{sub}</p>}
  </div>
);

export const ProfessionalDashboardView: React.FC<{user:UserProfile|null;onNotify:(msg:string)=>void;onViewChange:(v:any)=>void}> = ({user,onNotify,onViewChange}) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR'|'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'dashboard'|'dealfinder'|'missions'|'mentorship'|'messages'|'academy'>('dashboard');
  const [searchCat, setSearchCat] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [minScore, setMinScore] = useState(600);
  // Le survol (:hover) ne se déclenche pas de façon fiable au tactile.
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const toggleRevealed = (id: string) => setRevealedCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [searchResults, setSearchResults] = useState<typeof CONTRACTS|null>(null);
  const [searching, setSearching] = useState(false);
  const [missionsShown, setMissionsShown] = useState(3);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    {from:'Clara Dubois', role:'CREATOR', text:T('Bonjour, avez-vous pu analyser mon dossier ÉPHÉMÉRIS ?','Hello, have you been able to review my EPHEMERIS file?'), time:'09:14', read:true},
    {from:'LYA Platform', role:'SYSTEM', text:T('Nouveau projet soumis en validation : PRJ-2026-051','New project submitted for validation: PRJ-2026-051'), time:'08:45', read:true},
    {from:'Thomas Bernard', role:'PATRON', text:T('Quelle est votre estimation de l\'audit créatif pour Nexus ?','What is your creative audit estimate for Nexus?'), time:'Hier','read':false},
  ]);
  const [projectsShown, setProjectsShown] = useState(3);

  const receivedProjects = CONTRACTS.filter(c => c.status === 'LIVE');
  const riskProjects = CONTRACTS.filter(c => c.status === 'RISK');
  const categories = ['Fine Art','Music','Film','TV Series','Literature','Fashion','Architecture','Photography','Gaming','Design','Podcast','Digital Art','Performing Arts','Gastronomy'];

  const missions = [
    {labelFR:CONTRACTS[1]?.name||'ÉPHÉMÉRIS',labelEN:CONTRACTS[1]?.name||'EPHEMERIS',id:'PRJ-2026-012',typeFR:'Certification LYA Niveau 3',typeEN:'LYA Level 3 Certification',statusFR:'En validation',statusEN:'In validation',pct:75,date:'2026-03-15',statusColor:'bg-accent-gold/10 text-accent-gold border-accent-gold/20'},
    {labelFR:CONTRACTS[3]?.name||'Nexus',labelEN:CONTRACTS[3]?.name||'Nexus',id:'PRJ-2026-008',typeFR:'Audit stratégique institutionnel',typeEN:'Institutional strategic audit',statusFR:'Analyse en cours',statusEN:'Analysis in progress',pct:45,date:'2026-03-20',statusColor:'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20'},
    {labelFR:CONTRACTS[4]?.name||'Fragments',labelEN:CONTRACTS[4]?.name||'Fragments',id:'PRJ-2026-019',typeFR:'Audit créatif premium',typeEN:'Premium creative audit',statusFR:'Révision finale',statusEN:'Final review',pct:90,date:'2026-03-10',statusColor:'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20'},
    {labelFR:CONTRACTS[5]?.name||'Solar Echoes',labelEN:CONTRACTS[5]?.name||'Solar Echoes',id:'PRJ-2026-031',typeFR:'Évaluation de potentiel créatif',typeEN:'Creative potential assessment',statusFR:'En attente',statusEN:'Pending',pct:10,date:'2026-04-05',statusColor:'bg-white/5 text-on-surface-variant/50 border-white/10'},
    {labelFR:CONTRACTS[6]?.name||'Quantum Canvas',labelEN:CONTRACTS[6]?.name||'Quantum Canvas',id:'PRJ-2026-044',typeFR:'Certification LYA Niveau 2',typeEN:'LYA Level 2 Certification',statusFR:'En cours',statusEN:'In progress',pct:55,date:'2026-03-28',statusColor:'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'},
  ];

  const mentoredCreators = [
    {name:'Clara Dubois', project:'ÉPHÉMÉRIS', progress:78, score:834, sessions:8, nextSession:T('Vendredi 21 juin, 14h','Friday June 21, 2pm'), status:'ACTIVE'},
    {name:'Marc Fontaine', project:'Digital Horizons', progress:45, score:712, sessions:3, nextSession:T('Mardi 25 juin, 10h','Tuesday June 25, 10am'), status:'ACTIVE'},
    {name:'Sofia Reyes', project:'Urban Canvas', progress:92, score:891, sessions:12, nextSession:T('Terminé','Completed'), status:'COMPLETED'},
  ];

  const academyModules = [
    {titleFR:'LYA — Fondamentaux',titleEN:'LYA — Fundamentals',descFR:'Maîtrisez les bases du scoring LYA et des 5 piliers d\'évaluation.',descEN:'Master the fundamentals of LYA scoring and the 5 evaluation pillars.',duration:'4h',level:T('Débutant','Beginner'),done:true,color:'bg-primary-cyan/10 border-primary-cyan/20'},
    {titleFR:'Audit Créatif Avancé',titleEN:'Advanced Creative Audit',descFR:'Techniques d\'audit approfondi pour les projets culturels et artistiques.',descEN:'In-depth audit techniques for cultural and artistic projects.',duration:'6h',level:T('Intermédiaire','Intermediate'),done:true,color:'bg-[#a78bfa]/10 border-[#a78bfa]/20'},
    {titleFR:'Méthodologie du Score LYA',titleEN:'LYA Score Methodology',descFR:'Approfondissez l\'analyse des 5 piliers pour affiner vos certifications.',descEN:'Deepen your analysis of the 5 pillars to refine your certifications.',duration:'3h',level:T('Intermédiaire','Intermediate'),done:false,color:'bg-accent-gold/10 border-accent-gold/20'},
    {titleFR:'Stratégie de Lancement Institutionnel',titleEN:'Institutional Launch Strategy',descFR:'Planifiez et exécutez des lancements à impact maximal.',descEN:'Plan and execute maximum-impact launches.',duration:'5h',level:T('Avancé','Advanced'),done:false,color:'bg-emerald-400/10 border-emerald-400/20'},
    {titleFR:'Réseau & Partenariats Créatifs',titleEN:'Network & Creative Partnerships',descFR:'Construisez un réseau institutionnel solide dans les industries créatives.',descEN:'Build a solid institutional network in creative industries.',duration:'4h',level:T('Avancé','Advanced'),done:false,locked:true,color:'bg-rose-400/10 border-rose-400/20'},
    {titleFR:'Certification LYA Expert',titleEN:'LYA Expert Certification',descFR:'Validation officielle de votre expertise par le comité LYA.',descEN:'Official validation of your expertise by the LYA committee.',duration:'8h',level:T('Expert','Expert'),done:false,locked:true,color:'bg-white/5 border-white/10'},
  ];


  const runSearch = () => {
    if (!searchCat) { onNotify(T('Sélectionnez une catégorie','Please select a category')); return; }
    setSearching(true);
    setTimeout(() => {
      const r = CONTRACTS.filter(c => c.category.toLowerCase().includes(searchCat.toLowerCase()) && c.totalScore >= minScore && c.status === 'LIVE');
      setSearchResults(r);
      setSearching(false);
      onNotify(T(`${r.length} projets trouvés`,`${r.length} projects found`));
    }, 1000);
  };

  const tabs = [
    {key:'dashboard' as const, labelFR:'Dashboard', labelEN:'Dashboard', icon:<BarChart2 size={13}/>},
    {key:'dealfinder' as const, labelFR:'Recherche de Projets', labelEN:'Project Finder', icon:<Search size={13}/>},
    {key:'missions' as const, labelFR:'Missions', labelEN:'Missions', icon:<Target size={13}/>},
    {key:'mentorship' as const, labelFR:'Mentorat Élite', labelEN:'Elite Mentorship', icon:<Users size={13}/>},
    {key:'messages' as const, labelFR:'Messages', labelEN:'Messages', icon:<MessageSquare size={13}/>},
    {key:'academy' as const, labelFR:'Académie Pro', labelEN:'Pro Academy', icon:<BookOpen size={13}/>},
  ];

  if (!user) return <AuthGuard user={user} onViewChange={onViewChange}>{null}</AuthGuard>;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader titleWhite={T('ESPACE','PRO')} titleAccent={T('PROFESSIONNEL','SPACE')} description={T('Expertise institutionnelle pour accompagner l\'excellence artistique','Institutional expertise to support artistic excellence')} accentColor="text-primary-cyan"/>

      {/* Actions rapides */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={()=>setActiveSection('dealfinder')} className="flex items-center gap-2 px-4 py-2.5 bg-primary-cyan text-surface-dim text-xs font-black rounded-xl hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(0,212,255,0.15)]"><Search size={13}/> {T('Trouver un projet','Find a project')}</button>
        <button onClick={()=>setActiveSection('messages')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 text-xs font-black rounded-xl hover:border-white/25 transition-all uppercase tracking-wider relative">
          <MessageSquare size={13}/> {T('Messages','Messages')}
          {messages.filter(m=>!m.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-400 rounded-full text-[9px] font-black text-white flex items-center justify-center">{messages.filter(m=>!m.read).length}</span>}
        </button>
      </div>

      <InvitationCard user={user} onNotify={onNotify} />

      {/* Alerte projets risque */}
      {riskProjects.length > 0 && (
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3">
          <AlertTriangle size={14} className="text-rose-400 shrink-0"/>
          <p className="text-xs font-black text-rose-400">{riskProjects.length} {T('projets en statut RISQUE nécessitent une validation prioritaire','RISK-status projects need priority validation')}</p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-0.5 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveSection(tab.key)}
            className={`flex items-center gap-1.5 px-3 pb-3 text-xs font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection===tab.key?'text-primary-cyan':'text-on-surface-variant hover:text-on-surface'}`}>
            {tab.icon} {T(tab.labelFR, tab.labelEN)}
            {activeSection===tab.key&&<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan transition-all duration-300"/>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="sync">
        <motion.div key={activeSection} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.18}}>

          {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
          {activeSection==='dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<Search size={18} className="text-primary-cyan"/>} label={T('Projets en mission','Projects in mission')} value="24" sub={T('3 en attente','3 pending')} color="bg-primary-cyan/10"/>
                <KpiCard icon={<Award size={18} className="text-[#a78bfa]"/>} label={T('Certifications délivrées','Certifications delivered')} value="156" sub="+12 ce mois" color="bg-[#a78bfa]/10"/>
                <KpiCard icon={<Users size={18} className="text-emerald-400"/>} label={T('Créateurs mentorés','Mentored creators')} value="18" sub={T('3 actifs','3 active')} color="bg-emerald-400/10"/>
                <KpiCard icon={<BarChart2 size={18} className="text-accent-gold"/>} label={T('Score professionnel','Professional score')} value="940/1000" sub="+15 ce mois" color="bg-accent-gold/10"/>
              </div>

              {/* Rappel de positionnement — certification, pas instrument financier */}
              <div className="bg-gradient-to-r from-primary-cyan/8 to-[#a78bfa]/5 border border-primary-cyan/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 bg-primary-cyan/15 border border-primary-cyan/25 rounded-xl flex items-center justify-center shrink-0"><span className="text-primary-cyan font-black text-xs">LYA</span></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-primary-cyan uppercase tracking-widest mb-0.5">{T('Score LYA — Standard de certification', 'LYA Score — Certification standard')}</p>
                  <p className="text-xs text-on-surface-variant/60 leading-relaxed">{T('Vos validations influencent directement le Score LYA des projets — une mesure de qualité créative, pas un instrument financier.', 'Your validations directly influence projects\' LYA Score — a measure of creative quality, not a financial instrument.')}</p>
                </div>
              </div>

              {/* Projets reçus */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2"><Briefcase size={14} className="text-primary-cyan"/><p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Projets reçus','Received Projects')}</p></div>
                  <span className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-xs font-black text-emerald-400">2 {T('nouveaux','new')}</span>
                </div>
                {receivedProjects.slice(0, projectsShown).map((proj,i)=>(
                  <div key={proj.id} className="flex items-center gap-3 p-3 bg-surface-high/30 border border-white/6 rounded-xl hover:border-white/15 transition-all">
                    <img onClick={() => toggleRevealed(proj.id)} src={getSafeImageUrl(proj.image, proj.category)} alt={proj.name} className={`w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 cursor-pointer transition-all duration-500 ${revealedCards.has(proj.id) ? '' : 'grayscale blur-[2px] opacity-70'}`} referrerPolicy="no-referrer"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-on-surface truncate">{proj.name}</p>
                        {i<2&&<span className="px-1.5 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400">{T('NOUVEAU','NEW')}</span>}
                      </div>
                      <p className="text-xs text-on-surface-variant/50">{proj.category} · {proj.registryIndex}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-accent-gold">Score: {proj.totalScore}</p>
                      <p className={`text-xs font-bold ${proj.growth>=0?'text-emerald-400':'text-rose-400'}`}>{proj.growth>=0?'+':''}{proj.growth}% Score Trend</p>
                    </div>
                    <button onClick={()=>{onNotify(T(`✦ Dossier ${proj.name} ouvert`,'File opened'));}} className="p-1.5 text-on-surface-variant hover:text-primary-cyan transition-colors shrink-0"><ArrowRight size={14}/></button>
                  </div>
                ))}
                {projectsShown < receivedProjects.length && (
                  <button onClick={()=>setProjectsShown(n=>n+4)} className="w-full py-2.5 bg-surface-high/30 border border-white/8 text-xs font-black text-on-surface-variant hover:text-on-surface hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2">
                    <ChevronDown size={13}/> {T(`Voir plus (${receivedProjects.length-projectsShown} restants)`,`Load more (${receivedProjects.length-projectsShown} remaining)`)}
                  </button>
                )}
              </div>

              {/* Missions actives rapides */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Missions en cours','Active Missions')}</p>
                  <button onClick={()=>setActiveSection('missions')} className="text-xs font-black text-primary-cyan hover:text-white transition-colors uppercase tracking-widest">{T('Voir tout →','See all →')}</button>
                </div>
                {missions.slice(0,3).map((m,i)=>(
                  <div key={i} className="space-y-1.5 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div><p className="text-sm font-black text-on-surface">{T(m.labelFR,m.labelEN)}</p><p className="text-xs text-on-surface-variant/40 font-mono">{m.id}</p></div>
                      <div className="text-right"><span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase ${m.statusColor}`}>{T(m.statusFR,m.statusEN)}</span><p className="text-xs font-black text-on-surface mt-1">{m.pct}%</p></div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${m.pct}%`}} transition={{duration:1,delay:i*0.1}} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full"/></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECHERCHE DE PROJETS ─────────────────────────────────────── */}
          {activeSection==='dealfinder' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="font-headline font-black text-on-surface text-2xl tracking-tight">{T('Recherche de','Project')} <span className="text-primary-cyan">{T('Projets','Finder')}</span></h2>
                <p className="text-xs text-on-surface-variant/50">{T('Trouvez les projets à fort potentiel · Score LYA ≥','Find high-potential projects · LYA Score ≥')} {minScore}</p>
              </div>
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">{T('Catégorie *','Category *')}</label>
                    <div className="relative"><select value={searchCat} onChange={e=>setSearchCat(e.target.value)} className="w-full bg-surface-high/40 border border-white/10 text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors"><option value="">{T('Sélectionner','Select')}</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"/></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Budget</label>
                    <div className="relative"><select value={searchBudget} onChange={e=>setSearchBudget(e.target.value)} className="w-full bg-surface-high/40 border border-white/10 text-sm px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors"><option value="">{T('Tous budgets','All budgets')}</option><option value="xs">{'< 50K€'}</option><option value="small">{'50K - 200K€'}</option><option value="medium">{'200K - 500K€'}</option><option value="large">{'500K - 1M€'}</option><option value="xl">{'1M - 5M€'}</option><option value="xxl">{'> 5M€'}</option></select><ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"/></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">{T('Score LYA minimum','Minimum LYA Score')}</label><span className="text-[10px] font-black text-primary-cyan">{minScore}/1000</span></div>
                  <div className="flex items-center gap-3"><button onClick={()=>setMinScore(s=>Math.max(0,s-50))} className="w-8 h-8 bg-surface-high/40 border border-white/10 rounded-lg flex items-center justify-center hover:border-primary-cyan hover:text-primary-cyan transition-all font-black">−</button><input type="range" min={0} max={1000} step={50} value={minScore} onChange={e=>setMinScore(+e.target.value)} className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-cyan"/><button onClick={()=>setMinScore(s=>Math.min(1000,s+50))} className="w-8 h-8 bg-surface-high/40 border border-white/10 rounded-lg flex items-center justify-center hover:border-primary-cyan hover:text-primary-cyan transition-all font-black">+</button></div>
                </div>
                <button onClick={runSearch} disabled={searching} className="w-full py-3.5 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {searching?<><span className="animate-spin">⟳</span> {T('Recherche...','Searching...')}</>:<><Search size={14}/> {T('Rechercher des projets','Search projects')}</>}
                </button>
              </div>
              {searchResults && (
                <div className="space-y-3">
                  <p className="text-sm font-black text-on-surface">{searchResults.length} {T('projets trouvés','projects found')} · <span className="text-primary-cyan">{searchCat}</span> · Score ≥ {minScore}</p>
                  {searchResults.map((proj,i)=>(
                    <div key={proj.id} className="flex items-center gap-3 p-4 bg-surface-low/40 border border-white/8 rounded-2xl hover:border-white/15 transition-all">
                      <img onClick={() => toggleRevealed(proj.id)} src={getSafeImageUrl(proj.image,proj.category)} alt={proj.name} className={`w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 cursor-pointer transition-all duration-500 ${revealedCards.has(proj.id) ? '' : 'grayscale blur-[2px] opacity-70'}`} referrerPolicy="no-referrer"/>
                      <div className="flex-1 min-w-0"><p className="text-sm font-black text-on-surface">{proj.name}</p><p className="text-xs text-on-surface-variant/50">{proj.category} · {proj.registryIndex}</p></div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-black text-accent-gold">{proj.totalScore}<span className="text-xs text-on-surface-variant/30">/1000</span></p>
                        <p className={`text-xs font-bold ${proj.growth>=0?'text-emerald-400':'text-rose-400'}`}>{proj.growth>=0?'+':''}{proj.growth}% Score Trend</p>
                        <button onClick={async()=>{
  try {
    await addDoc(collection(db,'messages'),{type:'deal_request',projectName:proj.name,projectId:proj.id,fromId:user?.uid,fromName:user?.displayName,fromRole:'PROFESSIONAL',toId:proj.issuerId,status:'PENDING',createdAt:serverTimestamp()});
    onNotify(T(`✦ Demande envoyée pour ${proj.name}`,`✦ Request sent for ${proj.name}`));
  } catch(e){onNotify(T('Erreur réseau','Network error'));}
}} className="mt-1.5 px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-[10px] font-black rounded-lg hover:bg-primary-cyan hover:text-surface-dim transition-all uppercase">{T('Contacter','Contact')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MISSIONS ─────────────────────────────────────────────────── */}
          {activeSection==='missions' && (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant/60">{missions.length} {T('missions · Score LYA impacté par vos validations','missions · LYA Score impacted by your validations')}</p>
              {missions.slice(0,missionsShown).map((m,i)=>(
                <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div><p className="text-base font-black text-on-surface">{T(m.labelFR,m.labelEN)}</p><p className="text-xs text-on-surface-variant/40 font-mono">{m.id}</p><p className="text-xs text-on-surface-variant/60 mt-0.5">{T(m.typeFR,m.typeEN)} · {m.date}</p></div>
                    <div className="text-right"><span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase ${m.statusColor}`}>{T(m.statusFR,m.statusEN)}</span><p className="text-lg font-black text-primary-cyan mt-1">{m.pct}%</p></div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${m.pct}%`}} transition={{duration:1.2,delay:i*0.1}} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full"/></div>
                </div>
              ))}
              {missionsShown < missions.length && (
                <button onClick={()=>setMissionsShown(n=>n+3)} className="w-full py-3 bg-surface-high/30 border border-white/8 text-sm font-black text-on-surface-variant hover:text-on-surface hover:border-white/20 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ChevronDown size={14}/> {T(`Voir plus (${missions.length-missionsShown} restantes)`,`Load more (${missions.length-missionsShown} remaining)`)}
                </button>
              )}
            </div>
          )}

          {/* ── MENTORAT ÉLITE ───────────────────────────────────────────── */}
          {activeSection==='mentorship' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[{l:T('Créateurs actifs','Active creators'),v:'3',c:'text-primary-cyan'},{l:T('Sessions ce mois','Sessions this month'),v:'14',c:'text-[#a78bfa]'},{l:T('Score mentor moyen','Avg mentor score'),v:'94%',c:'text-emerald-400'}].map((s,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 text-center"><p className="text-xs text-on-surface-variant/60 mb-1">{s.l}</p><p className={`text-2xl font-black ${s.c}`}>{s.v}</p></div>
                ))}
              </div>
              {mentoredCreators.map((c,i)=>(
                <div key={i} className={`bg-surface-low/40 border rounded-2xl p-5 space-y-4 ${c.status==='COMPLETED'?'border-emerald-400/20':'border-white/8 hover:border-white/15'} transition-all`}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#a78bfa]/20 border border-[#a78bfa]/30 rounded-xl flex items-center justify-center text-lg shrink-0">👤</div>
                      <div><p className="text-sm font-black text-on-surface">{c.name}</p><p className="text-xs text-on-surface-variant/50">{c.project}</p><p className={`text-xs font-bold mt-0.5 ${c.status==='COMPLETED'?'text-emerald-400':'text-primary-cyan'}`}>{c.status==='COMPLETED'?T('✓ Terminé','✓ Completed'):T('● Actif','● Active')}</p></div>
                    </div>
                    <div className="text-right"><p className="text-xs text-on-surface-variant/40 uppercase tracking-widest">LYA Score</p><p className="text-xl font-black text-accent-gold">{c.score}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{l:T('Progression','Progress'),v:`${c.progress}%`},{l:T('Sessions','Sessions'),v:`${c.sessions} /12`},{l:T('Prochaine session','Next session'),v:c.nextSession}].map((s,si)=>(
                      <div key={si} className="bg-surface-high/30 rounded-lg p-2.5"><p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p><p className="text-xs font-black text-on-surface">{s.v}</p></div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#a78bfa] to-primary-cyan rounded-full transition-all" style={{width:`${c.progress}%`}}/></div>
                  {c.status==='ACTIVE' && (
                    <button onClick={async()=>{
  try {
    await addDoc(collection(db,'mentorship_sessions'),{mentorId:user?.uid,mentorName:user?.displayName,studentName:c.name,status:'REQUESTED',createdAt:serverTimestamp()});
    onNotify(T(`✦ Session planifiée avec ${c.name}`,`✦ Session scheduled with ${c.name}`));
  } catch(e){onNotify(T('Erreur réseau','Network error'));}
}} className="w-full py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa]/20 transition-all flex items-center justify-center gap-2"><Users size={12}/> {T('Planifier une session','Schedule a session')}</button>
                  )}
                </div>
              ))}
              <button onClick={async()=>{
  try{
    await addDoc(collection(db,'mentorship_sessions'),{type:'new',status:'OPEN',createdAt:serverTimestamp(),mentorId:user?.uid});
    onNotify(T('✦ Nouveau mentorat ouvert','✦ New mentorship opened'));
  }catch(e){onNotify(T('Erreur réseau','Network error'));}
}} className="w-full py-3 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"><Users size={14}/> {T('Ajouter un créateur','Add a creator')}</button>
            </div>
          )}

          {/* ── MESSAGES ─────────────────────────────────────────────────── */}
          {activeSection==='messages' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {messages.map((msg,i)=>(
                    <div key={i} onClick={()=>setMessages(prev=>prev.map((m,mi)=>mi===i?{...m,read:true}:m))} className={`flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-white/3 ${!msg.read?'bg-primary-cyan/3':''}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${msg.role==='SYSTEM'?'bg-accent-gold/20 text-accent-gold':msg.role==='PATRON'?'bg-emerald-400/20 text-emerald-400':'bg-[#a78bfa]/20 text-[#a78bfa]'}`}>
                        {msg.role==='SYSTEM'?'⚡':msg.role==='PATRON'?'💼':'🎨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-on-surface">{msg.from}</p>
                          <p className="text-[10px] text-on-surface-variant/40 shrink-0">{msg.time}</p>
                        </div>
                        <p className="text-xs text-on-surface-variant/60 mt-0.5 line-clamp-2">{msg.text}</p>
                      </div>
                      {!msg.read && <div className="w-2 h-2 bg-primary-cyan rounded-full shrink-0 mt-1"/>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-on-surface uppercase tracking-wider">{T('Nouveau message','New message')}</p>
                <textarea value={messageText} onChange={e=>setMessageText(e.target.value)} rows={3} placeholder={T('Écrivez votre message...','Write your message...')} className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-primary-cyan transition-colors resize-none"/>
                <button onClick={async()=>{if(messageText.trim()){
  setMessages(prev=>[{from:user?.displayName||'Vous',role:'SYSTEM',text:messageText,time:T("À l'instant","Just now"),read:true},...prev]);
  try { await addDoc(collection(db,'messages'),{from:user?.uid,fromName:user?.displayName,text:messageText,type:'internal',createdAt:serverTimestamp()}); } catch(e){}
  setMessageText('');onNotify(T('✦ Message envoyé','✦ Message sent'));
}}} className="w-full py-2.5 bg-primary-cyan text-surface-dim text-xs font-black rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"><Send size={12}/> {T('Envoyer','Send')}</button>
              </div>
            </div>
          )}

          {/* ── ACADÉMIE PRO ─────────────────────────────────────────────── */}
          {activeSection==='academy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[{l:T('Modules complétés','Completed modules'),v:`${academyModules.filter(m=>m.done).length}/${academyModules.length}`,c:'text-primary-cyan'},{l:T('Heures de formation','Training hours'),v:'13h/30h',c:'text-[#a78bfa]'},{l:T('Certification','Certification'),v:'43%',c:'text-accent-gold'}].map((s,i)=>(
                  <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 text-center"><p className="text-xs text-on-surface-variant/60 mb-1">{s.l}</p><p className={`text-xl font-black ${s.c}`}>{s.v}</p></div>
                ))}
              </div>
              <div className="space-y-3">
                {academyModules.map((mod,i)=>(
                  <div key={i} className={`bg-surface-low/40 border rounded-2xl p-4 ${mod.done?'border-emerald-400/20':mod.locked?'border-white/5 opacity-60':'border-white/8 hover:border-white/20'} transition-all`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${mod.color}`}>
                        {mod.locked?<Lock size={14} className="text-on-surface-variant/40"/>:mod.done?<CheckCircle size={14} className="text-emerald-400"/>:<Play size={14} className="text-primary-cyan"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div><p className="text-sm font-black text-on-surface">{T(mod.titleFR,mod.titleEN)}</p><p className="text-xs text-on-surface-variant/50 mt-0.5">{T(mod.descFR,mod.descEN)}</p></div>
                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${mod.done?'bg-emerald-400/10 text-emerald-400':mod.locked?'bg-white/5 text-on-surface-variant/30':'bg-primary-cyan/10 text-primary-cyan'}`}>{mod.done?T('Complété','Completed'):mod.locked?T('Verrouillé','Locked'):T('Disponible','Available')}</span>
                            <p className="text-[10px] text-on-surface-variant/40 mt-1">{mod.duration} · {mod.level}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!mod.locked && !mod.done && (
                      <button onClick={()=>onNotify(T(`✦ Module "${mod.titleFR}" démarré`,`Module "${mod.titleEN}" started`))} className="w-full mt-3 py-2 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-xs font-black rounded-xl hover:bg-primary-cyan hover:text-surface-dim transition-all flex items-center justify-center gap-1.5"><Play size={11}/> {T('Démarrer','Start')}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
