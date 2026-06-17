import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, CONTRACTS } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceContactModal } from '../components/DashboardModals';
import {
  Search, Shield, Award, Users, TrendingUp, ChevronDown, Star,
  CheckCircle, Clock, BarChart2, DollarSign, Briefcase, Zap, ArrowRight
} from 'lucide-react';

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/15 transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-on-surface tracking-tight">{value}</p>
      <p className="text-sm text-on-surface-variant/60 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

export const ProfessionalDashboardView: React.FC<{ user: UserProfile | null; onNotify: (msg: string) => void; onViewChange: (v: any) => void }> = ({ user, onNotify, onViewChange }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeSection, setActiveSection] = useState<'dashboard' | 'dealfinder' | 'missions' | 'services'>('dashboard');
  const [serviceModal, setServiceModal] = useState<{name:string;price:string}|null>(null);
  const [missionsShown, setMissionsShown] = useState(3);
  const [projectsShown, setProjectsShown] = useState(4);
  const [searchCat, setSearchCat] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [minScore, setMinScore] = useState(600);
  const [searchResults, setSearchResults] = useState<typeof CONTRACTS | null>(null);
  const [searching, setSearching] = useState(false);

  const receivedProjects = CONTRACTS.filter(c => c.status === 'LIVE');
  const riskProjects = CONTRACTS.filter(c => c.status === 'RISK');
  const activeContracts = CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 3);

  const categories = ['Fine Art', 'Music', 'Film', 'Literature', 'Fashion', 'Architecture', 'Photography', 'Gaming', 'Design'];

  const missions = [
    { labelFR: 'ÉPHÉMÉRIS', labelEN: 'EPHEMERIS', id: 'PRJ-2026-012', typeFR: 'Certification LYA Niveau 3', typeEN: 'LYA Level 3 Certification', statusFR: 'En validation', statusEN: 'In validation', pct: 75, statusColor: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' },
    { labelFR: 'Nexus', labelEN: 'Nexus', id: 'PRJ-2026-008', typeFR: 'Audit stratégique institutionnel', typeEN: 'Institutional strategic audit', statusFR: 'Analyse en cours', statusEN: 'Analysis in progress', pct: 45, statusColor: 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20' },
    { labelFR: 'Fragments', labelEN: 'Fragments', id: 'PRJ-2026-019', typeFR: 'Due diligence premium', typeEN: 'Premium due diligence', statusFR: 'Révision finale', statusEN: 'Final review', pct: 90, statusColor: 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20' },
  ];

  const services = [
    { icon: <Shield size={24}/>, color: 'bg-primary-cyan/10 text-primary-cyan', titleFR: 'Certification LYA Premium', titleEN: 'LYA Premium Certification', descFR: 'Validation officielle de votre scoring LYA par nos experts. Rapport institutionnel de 50+ pages, analyse critique détaillée et badge de certification reconnu.', descEN: 'Official validation of your LYA scoring by our experts. 50+ page institutional report, detailed critical analysis and recognised certification badge.', features: [T('Audit complet 5 piliers LYA','Complete 5-pillar LYA audit'), T('Rapport PDF professionnel','Professional PDF report'), T('Badge certifié officiel','Official certified badge'), T('Suivi 30 jours post-audit','30-day post-audit follow-up')], price: '2 500€', btnColor: 'bg-primary-cyan text-surface-dim hover:bg-white' },
    { icon: <Briefcase size={24}/>, color: 'bg-[#a78bfa]/10 text-[#a78bfa]', titleFR: 'Due Diligence Elite', titleEN: 'Elite Due Diligence', descFR: 'Investigation approfondie pour mécènes institutionnels. Vérification juridique, analyse de marché, évaluation des risques et rapport confidentiel complet.', descEN: 'In-depth investigation for institutional patrons. Legal verification, market analysis, risk assessment and complete confidential report.', features: [T('Vérification légale complète','Complete legal verification'), T('Étude de marché exclusive','Exclusive market study'), T('Évaluation risque/rendement','Risk/return assessment'), T('Rapport confidentiel sécurisé','Secure confidential report')], price: '5 000€', btnColor: 'bg-[#a78bfa] text-surface-dim hover:bg-white' },
    { icon: <TrendingUp size={24}/>, color: 'bg-emerald-400/10 text-emerald-400', titleFR: 'Stratégie de Lancement', titleEN: 'Launch Strategy', descFR: 'Plan stratégique personnalisé sur 90 jours. Optimisation du score LYA, campagne marketing ciblée, coaching hebdomadaire et garantie de visibilité maximale.', descEN: 'Personalised 90-day strategic plan. LYA score optimisation, targeted marketing campaign, weekly coaching and maximum visibility guarantee.', features: [T('Plan marketing 90 jours','90-day marketing plan'), T('Optimisation score LYA','LYA score optimisation'), T('10 sessions de coaching','10 coaching sessions'), T('Garantie visibilité','Visibility guarantee')], price: '3 500€', btnColor: 'bg-emerald-400 text-surface-dim hover:bg-white' },
    { icon: <Star size={24}/>, color: 'bg-accent-gold/10 text-accent-gold', titleFR: 'Mentoring Mensuel', titleEN: 'Monthly Mentoring', descFR: '4 sessions privées par mois avec un expert LYA certifié. Accès réseau premium, conseils stratégiques personnalisés et support email illimité.', descEN: '4 private monthly sessions with a certified LYA expert. Premium network access, personalised strategic advice and unlimited email support.', features: ['4 sessions privées/mois', T('Accès réseau premium','Premium network access'), T('Conseils stratégiques','Strategic advice'), T('Support email illimité','Unlimited email support')], price: '1 200€/mois', btnColor: 'bg-accent-gold text-surface-dim hover:bg-white' },
    { icon: <Award size={24}/>, color: 'bg-rose-400/10 text-rose-400', titleFR: 'Formation Accélérée', titleEN: 'Accelerated Training', descFR: 'Formation intensive de 2 jours sur le Protocole LYA, la valorisation créative et les stratégies d\'indexation. Certification reconnue et accès plateforme à vie.', descEN: '2-day intensive training on the LYA Protocol, creative valuation and indexation strategies. Recognised certification and lifetime platform access.', features: [T('Formation 2 jours intensifs','2-day intensive training'), T('Certification reconnue','Recognised certification'), T('Accès plateforme à vie','Lifetime platform access'), T('Communauté alumni','Alumni community')], price: '800€', btnColor: 'bg-rose-400 text-surface-dim hover:bg-white' },
    { icon: <Zap size={24}/>, color: 'bg-gradient-to-br from-[#a78bfa]/20 to-rose-400/20 text-white', titleFR: 'Package All-Inclusive', titleEN: 'All-Inclusive Package', descFR: 'Tous nos services inclus dans un package premium exclusif. Support dédié 24/7, garantie de résultats et priorité absolue sur toutes les missions.', descEN: 'All our services in an exclusive premium package. Dedicated 24/7 support, results guarantee and absolute priority on all missions.', features: [T('TOUS les services inclus','ALL services included'), T('Support dédié 24/7','Dedicated 24/7 support'), T('Garantie résultats','Results guarantee'), T('Priorité absolue','Absolute priority')], price: '15 000€', btnColor: 'bg-gradient-to-r from-[#a78bfa] to-rose-400 text-white hover:opacity-90' },
  ];

  const runSearch = () => {
    if (!searchCat) { onNotify(T('Sélectionnez une catégorie', 'Please select a category')); return; }
    setSearching(true);
    setTimeout(() => {
      const results = CONTRACTS.filter(c => {
        const catMatch = !searchCat || c.category.toLowerCase().includes(searchCat.toLowerCase());
        const scoreMatch = c.totalScore >= minScore;
        return catMatch && scoreMatch && c.status === 'LIVE';
      });
      setSearchResults(results);
      setSearching(false);
      onNotify(T(`${results.length} projets trouvés`, `${results.length} projects found`));
    }, 1200);
  };

  const tabs = [
    { key: 'dashboard' as const, labelFR: 'Dashboard', labelEN: 'Dashboard' },
    { key: 'dealfinder' as const, labelFR: 'Deal Finder Pro', labelEN: 'Deal Finder Pro' },
    { key: 'missions' as const, labelFR: 'Missions Actives', labelEN: 'Active Missions' },
    { key: 'services' as const, labelFR: 'Services Premium', labelEN: 'Premium Services' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        titleWhite={T('DASHBOARD', 'PROFESSIONAL')}
        titleAccent={T('PROFESSIONNEL', 'DASHBOARD')}
        description={T('Expertise de niveau institutionnel pour accompagner l\'excellence artistique', 'Institutional-level expertise to support artistic excellence')}
        accentColor="text-primary-cyan"
      />

      {/* Bouton recherche */}
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveSection('dealfinder')} className="flex items-center gap-2 px-5 py-2.5 bg-primary-cyan text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Search size={14} /> {T('Rechercher Projets', 'Search Projects')}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)}
            className={`px-5 pb-4 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeSection === tab.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {T(tab.labelFR, tab.labelEN)}
            {activeSection === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan transition-all duration-300" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ─── DASHBOARD ─── */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: <Search size={20} className="text-primary-cyan"/>, label: T('Projets en mission','Projects in mission'), value: '24', color: 'bg-primary-cyan/10' },
                  { icon: <Award size={20} className="text-[#a78bfa]"/>, label: T('Certifications délivrées','Certifications delivered'), value: '156', color: 'bg-[#a78bfa]/10' },
                  { icon: <Users size={20} className="text-emerald-400"/>, label: T('Créateurs actifs','Active creators'), value: '18', color: 'bg-emerald-400/10' },
                  { icon: <BarChart2 size={20} className="text-accent-gold"/>, label: T('Score professionnel','Professional score'), value: '940/1000', color: 'bg-accent-gold/10' },
                ].map((k, i) => <KpiCard key={i} {...k} />)}
              </div>

              {/* LYA UNIT encadré pro */}
              <div className="bg-gradient-to-r from-primary-cyan/8 to-[#a78bfa]/5 border border-primary-cyan/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 bg-primary-cyan/15 border border-primary-cyan/25 rounded-xl flex items-center justify-center shrink-0"><span className="text-primary-cyan font-black text-xs">LYA</span></div>
                <div className="flex-1"><p className="text-xs font-black text-primary-cyan uppercase tracking-widest mb-0.5">LYA UNIT — {T('Valeur de référence créative','Creative reference value')}</p><p className="text-xs text-on-surface-variant/60">{T('En tant que professionnel certifié, vos validations influencent directement le LYA UNIT des projets. Valeur de base actuelle :','As a certified professional, your validations directly influence project LYA UNIT values. Current base value:')}</p></div>
                <div className="text-right shrink-0"><p className="text-[10px] text-on-surface-variant/40 uppercase">{T('LYA UNIT base','LYA UNIT base')}</p><p className="text-2xl font-black text-primary-cyan font-mono">$50.00</p><p className="text-xs text-on-surface-variant/40">{T('Étalon souverain','Sovereign standard')}</p></div>
              </div>

              {riskProjects.length > 0 && (
                <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-rose-400 text-sm">⚠</span>
                  <p className="text-xs text-rose-400 font-black">{riskProjects.length} {T('projets en statut RISQUE nécessitent une validation prioritaire','RISK-status projects need priority validation')}</p>
                </div>
              )}

              {/* KPIs supplémentaires — cachés */}

              {/* Projets reçus */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-cyan/10 rounded-lg flex items-center justify-center text-primary-cyan"><Briefcase size={15}/></div>
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Projets reçus','Received Projects')}</p>
                    <p className="text-sm text-on-surface-variant/50">{T('Nouvelles demandes d\'accompagnement','New mentoring requests')}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[10px] font-black text-emerald-400">2 {T('nouveaux','new')}</span>
                </div>
                <div className="space-y-3">
                  {receivedProjects.slice(0, 3).map((proj, i) => (
                    <div key={proj.id} className="flex items-center gap-4 p-4 bg-surface-high/30 border border-white/6 rounded-xl hover:border-white/15 transition-all group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-black text-on-surface">{proj.name}</p>
                          {i < 2 && <span className="px-3 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-xs font-black text-emerald-400 uppercase">{T('NOUVEAU','NEW')}</span>}
                        </div>
                        <p className="text-[10px] text-on-surface-variant/40 font-mono">ID: {proj.registryIndex} · {proj.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant/40">{new Date(Date.now() - i * 86400000 * 3).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US')}</p>
                        <p className="text-xs font-black text-accent-gold">Score: {proj.totalScore}</p>
                      </div>
                      <button onClick={() => onNotify(T(`Dossier ${proj.name} ouvert`,'File opened'))} className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missions actives rapides */}
              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Missions actives','Active Missions')}</p>
                  <button onClick={() => setActiveSection('missions')} className="text-[10px] font-black text-primary-cyan hover:text-white transition-colors uppercase tracking-widest border-b border-primary-cyan/30">{T('Voir tout','See all')}</button>
                </div>
                {missions.map((m, i) => (
                  <div key={i} className="space-y-2 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-on-surface">{T(m.labelFR, m.labelEN)}</p>
                        <p className="text-[10px] text-on-surface-variant/40 font-mono">{m.id} · {T(m.typeFR, m.typeEN)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-0.5 border rounded-full text-xs font-black uppercase ${m.statusColor}`}>{T(m.statusFR, m.statusEN)}</span>
                        <p className="text-xs font-black text-on-surface mt-1">{m.pct}% {T('complété','completed')}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DEAL FINDER PRO ─── */}
          {activeSection === 'dealfinder' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-headline font-black text-on-surface text-3xl tracking-tight">{T('Deal Finder', 'Deal Finder')} <span className="text-primary-cyan">Pro</span></h2>
                <p className="text-sm text-on-surface-variant/50">{T('Trouvez les projets évalués par des professionnels • Service exclusif', 'Find professionally evaluated projects • Exclusive service')}</p>
              </div>

              <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-6 space-y-5 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-cyan/10 rounded-xl flex items-center justify-center text-primary-cyan"><Search size={18}/></div>
                  <p className="text-base font-black text-on-surface uppercase tracking-wider">{T('Nouvelle Recherche','New Search')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">{T('Catégorie *','Category *')}</label>
                    <div className="relative">
                      <select value={searchCat} onChange={e => setSearchCat(e.target.value)} className="w-full bg-surface-high/40 border border-white/10 text-sm py-2.5 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
                        <option value="">{T('Sélectionner','Select')}</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">{T('Budget','Budget')}</label>
                    <div className="relative">
                      <select value={searchBudget} onChange={e => setSearchBudget(e.target.value)} className="w-full bg-surface-high/40 border border-white/10 text-sm py-2.5 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
                        <option value="">{T('Tous budgets','All budgets')}</option>
                        <option value="small">{T('< 50K€','< €50K')}</option>
                        <option value="medium">50K€ - 200K€</option>
                        <option value="large">{T('> 200K€','> €200K')}</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">{T('Score LYA minimum','Minimum LYA Score')}</label>
                    <span className="text-[10px] font-black text-primary-cyan">{minScore} / 1000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setMinScore(s => Math.max(0, s - 50))} className="w-8 h-8 bg-surface-high/40 border border-white/10 rounded-lg flex items-center justify-center text-on-surface hover:border-primary-cyan hover:text-primary-cyan transition-all font-black">−</button>
                    <input type="range" min={0} max={1000} step={50} value={minScore} onChange={e => setMinScore(+e.target.value)} className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-cyan" />
                    <button onClick={() => setMinScore(s => Math.min(1000, s + 50))} className="w-8 h-8 bg-surface-high/40 border border-white/10 rounded-lg flex items-center justify-center text-on-surface hover:border-primary-cyan hover:text-primary-cyan transition-all font-black">+</button>
                  </div>
                </div>

                <button onClick={runSearch} disabled={searching} className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-60">
                  {searching ? <><span className="animate-spin">⟳</span> {T('Recherche en cours...','Searching...')}</> : <><Search size={14} /> {T('Rechercher des projets','Search projects')}</>}
                </button>
                {!searchCat && <p className="text-center text-xs text-on-surface-variant/40">{T('Sélectionnez une catégorie et un genre','Select a category and genre')}</p>}
              </div>

              {/* Résultats */}
              {searchResults && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <p className="text-sm font-black text-on-surface">{searchResults.length} {T('projets trouvés','projects found')} {T('pour','for')} <span className="text-primary-cyan">{searchCat}</span> · Score LYA ≥ {minScore}</p>
                  {searchResults.map((proj, i) => (
                    <div key={proj.id} className="flex items-center gap-4 p-4 bg-surface-low/40 border border-white/8 rounded-2xl hover:border-white/15 transition-all">
                      <img src={proj.image} alt={proj.name} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-on-surface">{proj.name}</p>
                        <p className="text-xs text-on-surface-variant/50">{proj.category} · {proj.registryIndex}</p>
                        <p className="text-xs text-on-surface-variant/60 mt-1 line-clamp-1">{proj.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-accent-gold">{proj.totalScore}</p>
                        <p className="text-[10px] text-on-surface-variant/40">LYA Score</p>
                        <button onClick={() => onNotify(T(`Demande envoyée pour ${proj.name}`,`Request sent for ${proj.name}`))} className="mt-2 px-3 py-1.5 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-[10px] font-black rounded-lg hover:bg-primary-cyan hover:text-surface-dim transition-all uppercase tracking-widest">
                          {T('Contacter','Contact')}
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ─── MISSIONS ACTIVES ─── */}
          {activeSection === 'missions' && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-on-surface uppercase tracking-wider">{T('Missions actives','Active Missions')}</h2>
              {missions.map((m, i) => (
                <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-black text-on-surface">{T(m.labelFR, m.labelEN)}</p>
                      <p className="text-[10px] text-on-surface-variant/40 font-mono">{m.id}</p>
                      <p className="text-sm text-on-surface-variant/60 mt-1">{T(m.typeFR, m.typeEN)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${m.statusColor}`}>{T(m.statusFR, m.statusEN)}</span>
                      <p className="text-lg font-black text-primary-cyan mt-2">{m.pct}% {T('complété','completed')}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1.2, delay: i * 0.15 }} className="h-full bg-gradient-to-r from-primary-cyan to-[#a78bfa] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── SERVICES PREMIUM ─── */}
          {activeSection === 'services' && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-headline font-black text-on-surface text-3xl tracking-tight uppercase">{T('Services Premium','Premium Services')}</h2>
                <p className="text-sm text-on-surface-variant/50">• {T('Expertise institutionnelle pour propulser les créateurs vers l\'excellence','Institutional expertise to propel creators towards excellence')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {services.map((s, i) => (
                  <div key={i} className={`bg-surface-low/40 border rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all ${i === 5 ? 'border-[#a78bfa]/20 bg-gradient-to-br from-[#a78bfa]/5 to-rose-400/5' : 'border-white/8'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                    <div>
                      <h3 className="text-base font-black text-on-surface">{T(s.titleFR, s.titleEN)}</h3>
                      <p className="text-sm text-on-surface-variant/60 mt-2 leading-relaxed">{T(s.descFR, s.descEN)}</p>
                    </div>
                    <ul className="space-y-2">
                      {s.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-on-surface-variant/70">
                          <CheckCircle size={12} className="text-emerald-400 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-white/8 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{T('Tarif','Price')}</p>
                        <p className="text-2xl font-black text-on-surface">{s.price}</p>
                      </div>
                      <button onClick={() => setServiceModal({name: T(s.titleFR, s.titleEN), price: s.price})} className={`px-5 py-2.5 text-sm font-black rounded-xl transition-all uppercase tracking-wider flex items-center gap-2 ${s.btnColor}`}>
                        {T('Modifier','Modify')} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Témoignages */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{T('Témoignages clients','Client Testimonials')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { q: T('"Service exceptionnel. L\'audit LYA a transformé ma compréhension du marché."','"Exceptional service. The LYA audit transformed my understanding of the market."'), name: 'Clara Dubois', proj: T('ÉPHÉMÉRIS','EPHEMERIS') },
                    { q: T('"Expertise de niveau mondial. Accompagnement premium qui fait la différence."','"World-class expertise. Premium support that makes the difference."'), name: 'Thomas Bernard', proj: 'Nexus' },
                    { q: T('"Le package all-inclusive a dépassé toutes mes attentes. Résultats incroyables."','"The all-inclusive package exceeded all my expectations. Incredible results."'), name: 'Sophie Martin', proj: 'Fragments' },
                  ].map((t, i) => (
                    <div key={i} className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/15 transition-all">
                      <div className="flex gap-0.5">
                        {[...Array(4)].map((_, si) => <Star key={si} size={14} className="fill-accent-gold text-accent-gold" />)}
                        <Star size={14} className="text-accent-gold/40" />
                      </div>
                      <p className="text-sm text-on-surface-variant/70 italic leading-relaxed">{t.q}</p>
                      <div>
                        <p className="text-sm font-black text-on-surface">{t.name}</p>
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{t.proj}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ServiceContactModal
        open={!!serviceModal}
        onClose={() => setServiceModal(null)}
        lang={lang}
        serviceName={serviceModal?.name}
        servicePrice={serviceModal?.price}
        onSubmit={() => { onNotify(T('✦ Demande envoyée — Réponse sous 24h', '✦ Request sent — Reply within 24h')); setServiceModal(null); }}
      />
    </div>
  );
};