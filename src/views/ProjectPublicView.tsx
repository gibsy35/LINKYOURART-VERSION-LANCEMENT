import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { Contract, CONTRACTS, getContractDescription } from '../types';
import { updatePageMeta, resetPageMeta } from '../utils/seo';
import { getSafeImageUrl } from '../utils/image';
import { PaymentModal } from '../components/mecenat/MecenatShared';
import {
  TrendingUp, TrendingDown, Users, Star, Award,
  Shield, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Share2, Copy, ExternalLink, Zap, Target, AlertTriangle,
  Lock, BarChart2, RefreshCw, Flag, ChevronRight, Twitter
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

const genChart = (baseScore: number, growth: number, points = 30) =>
  Array.from({ length: points }, (_, i) => ({
    t: `J${i + 1}`,
    v: Math.max(0, Math.min(1000, Math.round(baseScore * (1 + (growth / 100) * (i / points)) + (Math.random() - 0.5) * baseScore * 0.02))),
  }));

interface Props {
  contractId?: string;
  onViewChange: (v: any) => void;
  onNotify: (msg: string) => void;
  user: any;
}

export const ProjectPublicView: React.FC<Props> = ({ contractId, onViewChange, onNotify, user }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const T = (fr: string, en: string) => language === 'FR' ? fr : en;

  const [activeTab, setActiveTab] = useState<'story' | 'data' | 'support'>('story');
  const [copied, setCopied] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  // Le survol (:hover) ne se déclenche pas de façon fiable sur tactile.
  // Ces cartes naviguent déjà au clic — premier tap révèle, second ouvre.
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  const project: Contract = CONTRACTS.find(c => c.id === contractId) || CONTRACTS[0];
  const up = project.growth >= 0;
  const baseScore = Math.max(1, project.totalScore - project.growth * 5);
  const chartData = genChart(baseScore, project.growth);
  const similar = CONTRACTS.filter(c => c.category === project.category && c.id !== project.id).slice(0, 3);

  // Mise à jour SEO dynamique
  React.useEffect(() => {
    updatePageMeta({
      title: `${project.name} — LYA Score ${project.totalScore}/1000`,
      description: `${project.category} · LYA Score: ${project.totalScore}/1000 (${up ? '+' : ''}${project.growth}%) · ${project.description?.slice(0, 120)}`,
      image: getSafeImageUrl(project.image, project.category),
      url: `https://linkyourart.com?project=${project.id}`,
    });
    return () => resetPageMeta();
  }, [project.id]);

  const rarityColor: Record<string, string> = {
    Signature: 'text-accent-gold border-accent-gold/40 bg-accent-gold/10',
    Exceptional: 'text-[#a78bfa] border-[#a78bfa]/40 bg-[#a78bfa]/10',
    Distinguished: 'text-primary-cyan border-primary-cyan/40 bg-primary-cyan/10',
    Standard: 'text-white/50 border-white/15 bg-white/5',
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?project=${project.id}`).catch(() => {});
    setCopied(true);
    onNotify(T('✦ Lien copié !', '✦ Link copied!'));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${project.name} — LYA Score ${project.totalScore}/1000 sur @LinkYourArt`)}&url=${encodeURIComponent(`${window.location.origin}?project=${project.id}`)}`,
    '_blank'
  );

  return (
    <div className="pb-20 space-y-0 max-w-3xl mx-auto">

      {/* ── SECTION 1 : ACCROCHE ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-5">
        {/* Image de fond */}
        <div className="relative h-56 sm:h-72">
          <img src={getSafeImageUrl(project.image, project.category)} alt={project.name}
            className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/40 to-transparent"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1117]/60 to-transparent"/>
        </div>

        {/* Contenu sur l'image */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
          {/* Catégorie + Rarity inline */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-xs font-black text-white uppercase tracking-widest">{project.category}</span>
            <span className={`px-2.5 py-1 border rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm ${rarityColor[project.rarity]}`}>★ {project.rarity}</span>
            <span className={`px-2.5 py-1 border rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm ${project.status === 'LIVE' ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400' : 'bg-rose-500/15 border-rose-500/40 text-rose-400'}`}>
              {project.status === 'LIVE' ? '● LIVE' : `⚠ ${project.status}`}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-tight mb-1">
            {project.name}
          </h1>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest">{project.registryIndex}</p>
        </div>
      </div>

      {/* ── SECTION 2 : SCORE LYA EN GROS ───────────────────────────────── */}
      <div className={`rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${up ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-rose-400/5 border-rose-400/20'}`}>
        <div>
          <p className="text-xs font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">
            {T('Score LYA actuel', 'Current LYA Score')}
          </p>
          <p className={`text-5xl font-black font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{project.totalScore}<span className="text-xl text-on-surface-variant/30">/1000</span></p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 text-sm font-black ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {up ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}{up ? '+' : ''}{project.growth}%
            </span>
            <span className="text-xs text-on-surface-variant/40">{T('Depuis certification', 'Since certification')}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-on-surface-variant/50 uppercase tracking-widest mb-1">{T('Rareté', 'Rarity')}</p>
          <span className={`px-3 py-1.5 border rounded-full text-sm font-black uppercase tracking-widest ${rarityColor[project.rarity]}`}>★ {project.rarity}</span>
        </div>
      </div>

      {/* ── SECTION 3 : 4 CHIFFRES CLÉS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { icon: <Shield size={15}/>, label: T('Statut', 'Status'), value: T('Certifié', 'Certified'), color: 'text-primary-cyan', bg: 'bg-primary-cyan/10 border-primary-cyan/20' },
          { icon: <Users size={15}/>, label: T('Mécènes actifs', 'Active patrons'), value: String(Math.floor(50 + Math.random() * 250)), color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10 border-[#a78bfa]/20' },
          { icon: <Award size={15}/>, label: T('Jalons validés', 'Validated milestones'), value: String(project.milestones.filter(m => m.status === 'COMPLETED').length), color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { icon: <Target size={15}/>, label: T('Potentiel', 'Potential'), value: project.growth >= 20 ? T('Élevé', 'High') : project.growth >= 0 ? T('Stable', 'Stable') : T('En Révision', 'Under Review'), color: up ? 'text-accent-gold' : 'text-rose-400', bg: up ? 'bg-accent-gold/10 border-accent-gold/20' : 'bg-rose-400/10 border-rose-400/20' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`border rounded-2xl p-4 space-y-2 ${s.bg}`}>
            <div className={s.color}>{s.icon}</div>
            <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest leading-tight">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── SECTION 4 : BOUTONS PARTAGE ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 bg-surface-high/40 border border-white/10 rounded-xl text-xs font-black text-on-surface hover:border-white/25 hover:text-white transition-all uppercase tracking-wider">
          <Copy size={13}/> {copied ? T('Copié !', 'Copied!') : T('Copier le lien', 'Copy link')}
        </button>
        <button onClick={shareTwitter} className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-xl text-xs font-black text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all uppercase tracking-wider">
          <ExternalLink size={13}/> Twitter / X
        </button>
        <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')} className="flex items-center gap-2 px-4 py-2.5 bg-[#0077B5]/10 border border-[#0077B5]/30 rounded-xl text-xs font-black text-[#0077B5] hover:bg-[#0077B5]/20 transition-all uppercase tracking-wider">
          <ExternalLink size={13}/> LinkedIn
        </button>
      </div>

      {/* ── SECTION 5 : ONGLETS ──────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar mb-6">
        {[
          { key: 'story' as const, labelFR: 'Le Projet', labelEN: 'The Project' },
          { key: 'data'  as const, labelFR: 'Données & Score', labelEN: 'Data & Score' },
          { key: 'support' as const, labelFR: 'Soutenir', labelEN: 'Support' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 pb-3 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeTab === tab.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {T(tab.labelFR, tab.labelEN)}
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan"/>}
          </button>
        ))}
      </div>

      {/* ── ONGLET : LE PROJET ───────────────────────────────────────────── */}
      {activeTab === 'story' && (
        <div className="space-y-5">
          {/* Description */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-black text-on-surface uppercase tracking-wider mb-3">{T('À propos', 'About')}</h2>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">{getContractDescription(project, language)}</p>
          </div>

          {/* Graphe Score LYA */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Évolution du Score LYA', 'LYA Score Evolution')}</h2>
                <p className="text-xs text-on-surface-variant/40 mt-0.5">{T('Progression depuis la certification', 'Progress since certification')}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black font-mono ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{project.totalScore}/1000</p>
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="lyaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={up ? '#10b981' : '#f43f5e'} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={up ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={up ? '#10b981' : '#f43f5e'} strokeWidth={2.5} fill="url(#lyaGrad)" dot={false}/>
                  <XAxis dataKey="t" hide/>
                  <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [`${v}/1000`, T('Score', 'Score')]}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-on-surface-variant/30 text-center">
              {up
                ? T(`Ce projet a progressé de +${project.growth}% depuis sa certification.`, `This project's score improved by +${project.growth}% since certification.`)
                : T(`Ce projet a régressé de ${project.growth}% depuis sa certification.`, `This project's score decreased by ${project.growth}% since certification.`)
              }
            </p>
          </div>

          {/* Jalons */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Jalons du projet', 'Project milestones')}</h2>
            {project.milestones.length === 0 ? (
              <p className="text-sm text-on-surface-variant/40 text-center py-6">{T('Aucun jalon publié', 'No milestones yet')}</p>
            ) : (
              <div className="space-y-3">
                {project.milestones.map((m, i) => {
                  const done = m.status === 'COMPLETED';
                  const failed = m.status === 'FAILED';
                  const inprog = m.status === 'IN_PROGRESS';
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${done ? 'bg-emerald-400/5 border-emerald-400/15' : failed ? 'bg-rose-400/5 border-rose-400/15' : inprog ? 'bg-primary-cyan/5 border-primary-cyan/15' : 'bg-surface-high/20 border-white/6'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-400/20 text-emerald-400' : failed ? 'bg-rose-400/20 text-rose-400' : inprog ? 'bg-primary-cyan/20 text-primary-cyan' : 'bg-white/5 text-on-surface-variant/30'}`}>
                        {done ? <CheckCircle size={13}/> : failed ? <AlertTriangle size={13}/> : inprog ? <RefreshCw size={13}/> : <Clock size={13}/>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-on-surface">{m.label}</p>
                        <p className="text-xs text-on-surface-variant/40 mt-0.5">{m.date}</p>
                      </div>
                      {m.scoreImpact && (
                        <span className={`text-sm font-black shrink-0 ${m.scoreImpact > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.scoreImpact > 0 ? '+' : ''}{m.scoreImpact}% {T('Score', 'Score')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET : DONNÉES & SCORE ─────────────────────────────────────── */}
      {activeTab === 'data' && (
        <div className="space-y-5">
          {/* Score global */}
          <div className="bg-gradient-to-r from-[#a78bfa]/10 to-primary-cyan/5 border border-[#a78bfa]/20 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-black text-[#a78bfa] uppercase tracking-widest mb-1">{T('LYA Score Global', 'Global LYA Score')}</p>
              <p className="text-6xl font-black text-white font-mono">{project.totalScore}<span className="text-xl text-on-surface-variant/30">/1000</span></p>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden w-48">
                <motion.div initial={{width:0}} animate={{width:`${project.totalScore/10}%`}} transition={{duration:1.2}}
                  className="h-full bg-gradient-to-r from-[#a78bfa] to-primary-cyan rounded-full"/>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1.5 border rounded-full text-sm font-black uppercase tracking-widest ${rarityColor[project.rarity]}`}>★ {project.rarity}</span>
              <p className="text-xs text-on-surface-variant/40 mt-2">{T('Certifié par les validateurs LYA', 'Certified by LYA validators')}</p>
            </div>
          </div>

          {/* 5 piliers */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Les 5 Piliers d\'évaluation', 'The 5 Evaluation Pillars')}</h3>
            {project.pillars.map((p, i) => {
              const pct = (p.score / 200) * 100;
              const colors = ['#a78bfa','#00d4ff','#10b981','#f59e0b','#f43f5e'];
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-black text-on-surface">{p.label}</p>
                    <p className="text-sm font-black" style={{color:colors[i]}}>{p.score}<span className="text-xs text-on-surface-variant/30">/200</span></p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.9,delay:i*0.1}}
                      className="h-full rounded-full" style={{background:colors[i]}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infos registre */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Shield size={13} className="text-primary-cyan"/> {T('Registre & Droits', 'Registry & Rights')}</h3>
            {[
              { l: T('Identifiant registre', 'Registry ID'), v: project.registryIndex },
              { l: T('Catégorie', 'Category'), v: project.category },
              { l: T('Statut', 'Status'), v: project.status },
              { l: T('Variation depuis certification', 'Change since certification'), v: `${up?'+':''}${project.growth}%` },
            ].map((s,i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <p className="text-xs text-on-surface-variant/50">{s.l}</p>
                <p className="text-xs font-black text-on-surface">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ONGLET : SOUTENIR ────────────────────────────────────────────── */}
      {activeTab === 'support' && (
        <div className="space-y-5">
          {/* Explication Score LYA */}
          <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-black text-accent-gold uppercase tracking-widest">✦ {T('Comment fonctionne le Score LYA ?', 'How does the LYA Score work?')}</p>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
              {T(
                `Le Score LYA est l'indicateur de certification de ce projet, noté sur 1000. Il évolue selon les jalons validés et la revue du Comité. Actuellement à ${project.totalScore}/1000 (${up ? '+' : ''}${project.growth}% depuis la certification).`,
                `The LYA Score is this project's certification indicator, rated out of 1000. It evolves according to validated milestones and Committee review. Currently at ${project.totalScore}/1000 (${up ? '+' : ''}${project.growth}% since certification).`
              )}
            </p>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { l: T('Score', 'Score'), v: `${project.totalScore}/1000`, c: up ? 'text-emerald-400' : 'text-rose-400' },
                { l: T('Variation', 'Change'), v: `${up?'+':''}${project.growth}%`, c: up ? 'text-emerald-400' : 'text-rose-400' },
                { l: T('Rareté', 'Rarity'), v: project.rarity, c: 'text-primary-cyan' },
              ].map((s,i) => (
                <div key={i} className="bg-surface-high/30 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                  <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerte si pas LIVE */}
          {project.status !== 'LIVE' && (
            <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={16} className="text-rose-400 shrink-0"/>
              <p className="text-sm text-rose-400 font-black">{T('Ce projet n\'accepte pas de nouveaux soutiens actuellement.','This project is not accepting new pledges right now.')}</p>
            </div>
          )}

          {/* CTA */}
          {user ? (
            <button onClick={() => project.status === 'LIVE' ? setShowPayment(true) : null}
              className={`w-full py-5 text-base font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${project.status === 'LIVE' ? 'bg-primary-cyan text-surface-dim hover:bg-white shadow-[0_0_30px_rgba(0,212,255,0.25)]' : 'bg-white/5 text-on-surface-variant cursor-not-allowed'}`}>
              ✦
              {project.status === 'LIVE' ? T('Soutenir ce projet', 'Support this project') : T('Non disponible actuellement', 'Currently unavailable')}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-accent-gold shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-black text-on-surface">{T('Rejoignez LinkYourArt pour soutenir ce projet', 'Join LinkYourArt to support this project')}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">{T('Créez un compte gratuit et commencez à soutenir les créateurs de demain dès aujourd\'hui.', 'Create a free account and start supporting tomorrow\'s creators today.')}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => onViewChange('SIGNUP')} className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2">
                <Zap size={16}/> {T('Créer un compte gratuit', 'Create a free account')}
              </button>
              <button onClick={() => onViewChange('LOGIN')} className="w-full py-3 bg-white/5 border border-white/10 text-sm font-black uppercase tracking-wider rounded-2xl hover:bg-white/10 transition-all">
                {T('Déjà membre ? Se connecter', 'Already a member? Sign in')}
              </button>
            </div>
          )}

          <p className="text-xs text-on-surface-variant/25 text-center leading-relaxed">
            {T('Le mécénat sur des projets artistiques constitue un soutien de reconnaissance, non un investissement financier. Les contreparties reçues sont personnelles et non-financières.', 'Patronage of artistic projects constitutes recognition-based support, not a financial investment. Considerations received are personal and non-financial.')}
          </p>
        </div>
      )}

      {/* PaymentModal — opens inline on this page, no redirect needed */}
      {showPayment && (
        <PaymentModal
          contract={project}
          units={1}
          onClose={() => setShowPayment(false)}
          lang={language as 'FR' | 'EN'}
        />
      )}

      {/* ── PROJETS SIMILAIRES ───────────────────────────────────────────── */}
      {similar.length > 0 && (
        <div className="mt-10 space-y-4">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Projets dans la même catégorie', 'Projects in the same category')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {similar.map((s, i) => {
              const sup = s.growth >= 0;
              return (
                <button key={i} onClick={() => {
                    if (!revealedCards.has(s.id)) {
                      setRevealedCards(prev => new Set(prev).add(s.id));
                      return;
                    }
                    window.dispatchEvent(new CustomEvent('lya-view-project', { detail: s.id }));
                  }}
                  className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all text-left group">
                  <div className="relative h-24 overflow-hidden">
                    <img src={getSafeImageUrl(s.image, s.category)} alt={s.name} className={`w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 group-hover:blur-0 group-hover:scale-105 group-hover:opacity-100 ${revealedCards.has(s.id) ? 'grayscale-0 blur-0 scale-105 opacity-100' : 'grayscale blur-sm scale-105 opacity-60'}`} referrerPolicy="no-referrer"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 to-transparent"/>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-black text-on-surface truncate">{s.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-accent-gold">{T('Score', 'Score')} {s.totalScore}/1000</p>
                      <p className={`text-xs font-black flex items-center gap-0.5 ${sup?'text-emerald-400':'text-rose-400'}`}>
                        {sup?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{sup?'+':''}{s.growth}%
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <div className="mt-10 bg-gradient-to-br from-primary-cyan/10 to-[#a78bfa]/8 border border-primary-cyan/20 rounded-2xl p-7 text-center space-y-4">
        <div className="w-12 h-12 bg-primary-cyan/15 border border-primary-cyan/25 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-primary-cyan font-black text-sm">LYA</span>
        </div>
        <h3 className="text-xl font-black text-white tracking-tight uppercase">{T('L\'ART COMME STANDARD RECONNU', 'ART AS A RECOGNISED STANDARD')}</h3>
        <p className="text-sm text-on-surface-variant/60 max-w-sm mx-auto leading-relaxed">
          {T('LinkYourArt transforme les projets créatifs en standards certifiés. Rejoignez des milliers de mécènes et créateurs.', 'LinkYourArt transforms creative projects into certified standards. Join thousands of patrons and creators.')}
        </p>
        <button onClick={() => onViewChange(user ? 'REGISTRY' : 'SIGNUP')} className="px-8 py-3 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          {user ? T('Découvrir tous les projets', 'Discover all projects') : T('Rejoindre LinkYourArt — Gratuit', 'Join LinkYourArt — Free')}
        </button>
      </div>
    </div>
  );
};
