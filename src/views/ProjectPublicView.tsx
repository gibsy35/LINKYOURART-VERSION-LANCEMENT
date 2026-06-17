import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { Contract, CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { getSafeImageUrl } from '../utils/image';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Star, Award,
  Shield, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Share2, ExternalLink, Copy, ChevronRight, Zap, Target,
  AlertTriangle, Globe, Lock, BarChart2, RefreshCw, Flag
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis
} from 'recharts';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const unitPrice = (g: number) => LYA_UNIT_VALUE * (1 + g / 100);

const genChart = (base: number, growth: number, points = 30) =>
  Array.from({ length: points }, (_, i) => ({
    t: `J${i + 1}`,
    v: Math.round(base * (1 + (growth / 100) * (i / points)) + (Math.random() - 0.5) * base * 0.03),
  }));

const RarityBadge: React.FC<{ rarity: string }> = ({ rarity }) => {
  const cfg: Record<string, string> = {
    Legendary: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10',
    Epic:      'text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10',
    Rare:      'text-primary-cyan border-primary-cyan/30 bg-primary-cyan/10',
    Common:    'text-on-surface-variant/60 border-white/10 bg-white/5',
  };
  return (
    <span className={`px-2.5 py-1 border rounded-full text-xs font-black uppercase tracking-widest ${cfg[rarity] || cfg.Common}`}>
      ★ {rarity}
    </span>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { label: string; cls: string }> = {
    LIVE:        { label: '● LIVE',       cls: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/8' },
    RISK:        { label: '⚠ RISQUE',     cls: 'text-rose-500 border-rose-500/20 bg-rose-500/8' },
    SUSPENDED:   { label: '⏸ SUSPENDU',  cls: 'text-accent-gold border-accent-gold/20 bg-accent-gold/8' },
    LIQUIDATION: { label: '✕ LIQUIDATION',cls: 'text-red-500 border-red-500/20 bg-red-500/8' },
  };
  const c = cfg[status] || cfg.LIVE;
  return <span className={`px-2.5 py-1 border rounded-full text-xs font-black uppercase tracking-widest ${c.cls}`}>{c.label}</span>;
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
interface ProjectPublicViewProps {
  contractId?: string;
  onViewChange: (v: any) => void;
  onNotify: (msg: string) => void;
  user: any;
}

export const ProjectPublicView: React.FC<ProjectPublicViewProps> = ({
  contractId, onViewChange, onNotify, user
}) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const lang = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'score' | 'invest'>('overview');
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Récupérer le projet — fallback sur le premier si pas d'ID
  const project: Contract = CONTRACTS.find(c => c.id === contractId) || CONTRACTS[0];
  const chartData = genChart(unitPrice(project.growth) * 50, project.growth);
  const up = project.growth >= 0;
  const lyaUnit = unitPrice(project.growth);

  // Projets similaires
  const similar = CONTRACTS.filter(c => c.category === project.category && c.id !== project.id).slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?project=${project.id}`).catch(() => {});
    setCopied(true);
    onNotify(T('✦ Lien copié !', '✦ Link copied!'));
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'overview'   as const, labelFR: 'Vue d\'ensemble', labelEN: 'Overview' },
    { key: 'milestones' as const, labelFR: 'Jalons',          labelEN: 'Milestones' },
    { key: 'score'      as const, labelFR: 'LYA Score',       labelEN: 'LYA Score' },
    { key: 'invest'     as const, labelFR: 'Investir',        labelEN: 'Invest' },
  ];

  return (
    <div className="min-h-screen pb-20 space-y-0">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden rounded-2xl mb-6">
        <img
          src={getSafeImageUrl(project.image, project.category)}
          alt={project.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dim/80 to-transparent" />

        {/* Badges flottants */}
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
          <StatusBadge status={project.status} />
          <RarityBadge rarity={project.rarity} />
          <span className="px-2.5 py-1 border border-white/15 bg-black/40 rounded-full text-xs font-black text-white/80 uppercase tracking-widest backdrop-blur-sm">{project.category}</span>
        </div>

        {/* Bouton partager */}
        <div className="absolute top-4 right-4 relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/20 rounded-xl text-xs font-black text-white hover:bg-white/10 transition-all backdrop-blur-sm uppercase tracking-wider"
          >
            <Share2 size={13} /> {T('Partager', 'Share')}
          </button>
          {showShareMenu && (
            <div className="absolute right-0 top-12 bg-surface-low border border-white/10 rounded-xl p-3 space-y-2 w-48 shadow-2xl z-50">
              <button onClick={handleCopyLink} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-on-surface hover:text-primary-cyan hover:bg-white/5 rounded-lg transition-all">
                <Copy size={12} /> {copied ? T('Copié !', 'Copied!') : T('Copier le lien', 'Copy link')}
              </button>
              <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${project.name} sur @LinkYourArt — LYA Score ${project.totalScore}/1000`)}&url=${encodeURIComponent(window.location.href)}`, '_blank'); setShowShareMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-on-surface hover:text-primary-cyan hover:bg-white/5 rounded-lg transition-all">
                <ExternalLink size={12} /> Twitter / X
              </button>
              <button onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank'); setShowShareMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-on-surface hover:text-primary-cyan hover:bg-white/5 rounded-lg transition-all">
                <ExternalLink size={12} /> LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Titre dans le hero */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-mono text-on-surface-variant/50 uppercase tracking-widest mb-1">{project.registryIndex}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-lg">{project.name}</h1>
        </div>
      </div>

      {/* ── STATS RAPIDES ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            icon: <DollarSign size={16} className="text-accent-gold" />,
            label: 'LYA UNIT',
            value: formatPrice(lyaUnit),
            sub: `${up ? '+' : ''}${project.growth}% / ${T('base', 'base')} ${formatPrice(LYA_UNIT_VALUE)}`,
            up,
            color: 'bg-accent-gold/10 border-accent-gold/20',
          },
          {
            icon: <Star size={16} className="text-[#a78bfa]" />,
            label: 'LYA Score',
            value: `${project.totalScore}/1000`,
            sub: project.rarity,
            up: true,
            color: 'bg-[#a78bfa]/10 border-[#a78bfa]/20',
          },
          {
            icon: up ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-rose-400" />,
            label: T('Variation', 'Growth'),
            value: `${up ? '+' : ''}${project.growth}%`,
            sub: T('depuis émission', 'since issuance'),
            up,
            color: up ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-rose-400/10 border-rose-400/20',
          },
          {
            icon: <Users size={16} className="text-primary-cyan" />,
            label: T('Co-part. revenus', 'Revenue share'),
            value: `${project.revenueSharePercentage}%`,
            sub: T('des revenus nets', 'of net revenues'),
            up: true,
            color: 'bg-primary-cyan/10 border-primary-cyan/20',
          },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`border rounded-2xl p-4 space-y-2 ${s.color}`}
          >
            <div className="flex items-center justify-between">
              {s.icon}
              <span className={`text-xs font-black flex items-center gap-0.5 ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">{s.label}</p>
            <p className="text-lg font-black text-on-surface leading-tight">{s.value}</p>
            <p className="text-[10px] text-on-surface-variant/40">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── ONGLETS ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar mb-6">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 pb-3 text-xs font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeTab === tab.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {T(tab.labelFR, tab.labelEN)}
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
          </button>
        ))}
      </div>

      {/* ── VUE D'ENSEMBLE ───────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('À propos du projet', 'About the project')}</h2>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[project.category, project.rarity, `Score ${project.totalScore}/1000`].map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>

          {/* Graphe performance */}
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Performance LYA UNIT', 'LYA UNIT Performance')}</h2>
                <p className="text-xs text-on-surface-variant/50">{T('Évolution de la valeur unitaire', 'Unit value evolution')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black font-mono text-accent-gold">{formatPrice(lyaUnit)}</p>
                <p className={`text-xs font-black flex items-center justify-end gap-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{up ? '+' : ''}{project.growth}%
                </p>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={up ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={up ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={up ? '#10b981' : '#f43f5e'} strokeWidth={2} fill="url(#projGrad)" dot={false} />
                  <XAxis dataKey="t" hide />
                  <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [formatPrice(v), 'Valeur']} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-on-surface-variant/30 text-center">
              {T('Prix de base:', 'Base price:')} {formatPrice(LYA_UNIT_VALUE)} · {T('LYA UNIT actuel:', 'Current LYA UNIT:')} {formatPrice(lyaUnit)}
            </p>
          </div>

          {/* Créateur & accès */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Shield size={13} className="text-primary-cyan" /> {T('Accès & Droits', 'Access & Rights')}</h3>
              {[
                { l: T('Type d\'actif', 'Asset type'), v: project.category },
                { l: T('Part des revenus', 'Revenue share'), v: `${project.revenueSharePercentage}%` },
                { l: T('Statut légal', 'Legal status'), v: T('Validé LYA', 'LYA Validated') },
                { l: T('Registre', 'Registry'), v: project.registryIndex },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <p className="text-xs text-on-surface-variant/50">{s.l}</p>
                  <p className="text-xs font-black text-on-surface">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><BarChart2 size={13} className="text-[#a78bfa]" /> {T('Score LYA — 5 Piliers', 'LYA Score — 5 Pillars')}</h3>
              {project.pillars.slice(0, 5).map((pillar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-on-surface-variant/50 truncate">{pillar.label}</span>
                    <span className="font-black text-on-surface ml-2">{pillar.score}/200</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(pillar.score / 200) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#a78bfa] to-primary-cyan rounded-full" />
                  </div>
                </div>
              ))}
              <div className="pt-1 flex justify-between items-center">
                <p className="text-xs text-on-surface-variant/40">{T('Score total', 'Total score')}</p>
                <p className="text-lg font-black text-[#a78bfa]">{project.totalScore}<span className="text-xs text-on-surface-variant/30">/1000</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── JALONS ───────────────────────────────────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant/60">{T('Chaque jalon impact directement le LYA UNIT du projet', 'Each milestone directly impacts the project\'s LYA UNIT')}</p>
          {project.milestones.length === 0 ? (
            <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-8 text-center">
              <Flag size={32} className="text-on-surface-variant/20 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant/50">{T('Aucun jalon publié pour le moment', 'No milestones published yet')}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />
              <div className="space-y-4">
                {project.milestones.map((m, i) => {
                  const done = m.status === 'COMPLETED';
                  const failed = m.status === 'FAILED';
                  const inprog = m.status === 'IN_PROGRESS';
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 pl-2"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 z-10 ${done ? 'bg-emerald-400/20 border-emerald-400 text-emerald-400' : failed ? 'bg-rose-400/20 border-rose-400 text-rose-400' : inprog ? 'bg-primary-cyan/20 border-primary-cyan text-primary-cyan' : 'bg-surface-high border-white/20 text-on-surface-variant/30'}`}>
                        {done ? <CheckCircle size={13} /> : failed ? <AlertTriangle size={13} /> : inprog ? <RefreshCw size={13} className="animate-spin" style={{animationDuration:'3s'}} /> : <Clock size={13} />}
                      </div>
                      <div className={`flex-1 border rounded-xl p-4 ${done ? 'bg-emerald-400/5 border-emerald-400/15' : failed ? 'bg-rose-400/5 border-rose-400/15' : inprog ? 'bg-primary-cyan/5 border-primary-cyan/15' : 'bg-surface-high/20 border-white/6'}`}>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-black text-on-surface">{m.label}</p>
                            <p className="text-xs text-on-surface-variant/50 mt-0.5">{m.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {m.priceImpact && (
                              <p className={`text-sm font-black ${m.priceImpact > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {m.priceImpact > 0 ? '+' : ''}{m.priceImpact}% LYA UNIT
                              </p>
                            )}
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${done ? 'bg-emerald-400/10 text-emerald-400' : failed ? 'bg-rose-400/10 text-rose-400' : inprog ? 'bg-primary-cyan/10 text-primary-cyan' : 'bg-white/5 text-on-surface-variant/40'}`}>
                              {done ? T('Complété', 'Completed') : failed ? T('Échoué', 'Failed') : inprog ? T('En cours', 'In progress') : T('À venir', 'Upcoming')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LYA SCORE ────────────────────────────────────────────────────── */}
      {activeTab === 'score' && (
        <div className="space-y-5">
          {/* Score global */}
          <div className="bg-gradient-to-r from-[#a78bfa]/10 to-primary-cyan/5 border border-[#a78bfa]/20 rounded-2xl p-6 text-center">
            <p className="text-xs font-black text-[#a78bfa] uppercase tracking-widest mb-2">LYA Score Global</p>
            <p className="text-6xl font-black text-white font-mono">{project.totalScore}<span className="text-2xl text-on-surface-variant/30">/1000</span></p>
            <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
              <RarityBadge rarity={project.rarity} />
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden max-w-sm mx-auto">
              <motion.div initial={{ width: 0 }} animate={{ width: `${project.totalScore / 10}%` }} transition={{ duration: 1.2 }}
                className="h-full bg-gradient-to-r from-[#a78bfa] to-primary-cyan rounded-full" />
            </div>
          </div>

          {/* 5 piliers détaillés */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Les 5 Piliers LYA', 'The 5 LYA Pillars')}</h3>
            {project.pillars.map((pillar, i) => {
              const pct = (pillar.score / 200) * 100;
              const colors = ['#a78bfa', '#00d4ff', '#10b981', '#f59e0b', '#f43f5e'];
              return (
                <div key={i} className="bg-surface-low/40 border border-white/8 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-on-surface">{pillar.label}</p>
                      <p className="text-xs text-on-surface-variant/50 mt-0.5 leading-relaxed">{pillar.label}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black" style={{ color: colors[i] }}>{pillar.score}<span className="text-xs text-on-surface-variant/30">/200</span></p>
                      <p className="text-xs text-on-surface-variant/40">{Math.round(pct)}%</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ background: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impact LYA UNIT */}
          <div className="bg-accent-gold/5 border border-accent-gold/15 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-black text-accent-gold uppercase tracking-widest">✦ {T('Impact LYA UNIT', 'LYA UNIT Impact')}</p>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
              {T(`Avec un LYA Score de ${project.totalScore}/1000, le LYA UNIT de ce projet est valorisé à`, `With a LYA Score of ${project.totalScore}/1000, this project's LYA UNIT is valued at`)} <span className="text-accent-gold font-black">{formatPrice(lyaUnit)}</span> {T('(base $50)', '(base $50)')}. {up ? T('La performance positive renforce la confiance des mécènes.', 'Positive performance strengthens patron confidence.') : T('La performance négative impacte temporairement la valeur unitaire.', 'Negative performance temporarily impacts unit value.')}
            </p>
          </div>
        </div>
      )}

      {/* ── INVESTIR ─────────────────────────────────────────────────────── */}
      {activeTab === 'invest' && (
        <div className="space-y-5 max-w-lg mx-auto">
          {project.status !== 'LIVE' && (
            <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
              <p className="text-sm text-rose-400 font-black">{T('Ce projet n\'accepte pas de nouveaux soutiens en ce moment.', 'This project is not accepting new pledges at this time.')}</p>
            </div>
          )}

          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="text-center space-y-1">
              <p className="text-xs text-on-surface-variant/50 uppercase tracking-widest">{T('LYA UNIT actuel', 'Current LYA UNIT')}</p>
              <p className="text-4xl font-black text-accent-gold font-mono">{formatPrice(lyaUnit)}</p>
              <p className={`text-sm font-black ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{up ? '+' : ''}{project.growth}% {T('depuis émission', 'since issuance')}</p>
              <p className="text-xs text-on-surface-variant/30">{T('Prix de base:', 'Base price:')} {formatPrice(LYA_UNIT_VALUE)}</p>
            </div>

            <div className="space-y-3 border-t border-white/8 pt-4">
              {[
                { l: T('Revenus partagés', 'Revenue share'), v: `${project.revenueSharePercentage}%` },
                { l: T('Statut', 'Status'), v: project.status },
                { l: 'LYA Score', v: `${project.totalScore}/1000` },
                { l: T('Catégorie', 'Category'), v: project.category },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <p className="text-xs text-on-surface-variant/50">{s.l}</p>
                  <p className="text-xs font-black text-on-surface">{s.v}</p>
                </div>
              ))}
            </div>

            {user ? (
              <button
                onClick={() => project.status === 'LIVE' ? onViewChange('MECENAT') : onNotify(T('Projet non disponible', 'Project not available'))}
                className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${project.status === 'LIVE' ? 'bg-primary-cyan text-surface-dim hover:bg-white shadow-[0_0_20px_rgba(0,212,255,0.2)]' : 'bg-white/5 text-on-surface-variant cursor-not-allowed'}`}
              >
                <DollarSign size={16} />
                {project.status === 'LIVE' ? T('Soutenir ce projet', 'Support this project') : T('Non disponible', 'Not available')}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-accent-gold/5 border border-accent-gold/15 rounded-xl">
                  <Lock size={14} className="text-accent-gold shrink-0" />
                  <p className="text-xs text-on-surface-variant/70">{T('Connectez-vous pour soutenir ce projet et accéder à toutes les fonctionnalités.', 'Sign in to support this project and access all features.')}</p>
                </div>
                <button onClick={() => onViewChange('LOGIN')} className="w-full py-3.5 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2">
                  <Zap size={14} /> {T('Se connecter', 'Sign in')}
                </button>
                <button onClick={() => onViewChange('SIGNUP')} className="w-full py-3 bg-white/5 border border-white/10 text-sm font-black uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all">
                  {T('Créer un compte', 'Create account')}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-on-surface-variant/30 text-center leading-relaxed">
            {T('LinkYourArt est une plateforme d\'équité créative. Les investissements dans des projets artistiques comportent des risques. La valeur des LYA Units peut baisser.', 'LinkYourArt is a creative equity platform. Investments in artistic projects carry risks. LYA Unit values may decrease.')}
          </p>
        </div>
      )}

      {/* ── PROJETS SIMILAIRES ───────────────────────────────────────────── */}
      {similar.length > 0 && (
        <div className="mt-10 space-y-4">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Projets similaires', 'Similar projects')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similar.map((s, i) => {
              const sup = s.growth >= 0;
              return (
                <button key={i} onClick={() => onViewChange('PROJECT_PUBLIC')}
                  className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all text-left group"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={getSafeImageUrl(s.image, s.category)} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <p className="text-xs font-mono text-on-surface-variant/50">{s.registryIndex}</p>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <p className="text-sm font-black text-on-surface truncate">{s.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-accent-gold font-black">LYA UNIT {formatPrice(unitPrice(s.growth))}</p>
                      <p className={`text-xs font-black ${sup ? 'text-emerald-400' : 'text-rose-400'}`}>{sup ? '+' : ''}{s.growth}%</p>
                    </div>
                    <p className="text-xs text-on-surface-variant/40">Score: {s.totalScore}/1000</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA BAS DE PAGE ──────────────────────────────────────────────── */}
      <div className="mt-10 bg-gradient-to-r from-primary-cyan/8 to-[#a78bfa]/5 border border-primary-cyan/20 rounded-2xl p-6 text-center space-y-3">
        <p className="text-xs font-black text-primary-cyan uppercase tracking-widest">✦ LinkYourArt</p>
        <h3 className="text-xl font-black text-white tracking-tight">{T('L\'art comme investissement', 'Art as investment')}</h3>
        <p className="text-sm text-on-surface-variant/60">{T('Rejoignez la plateforme d\'équité créative et soutenez les créateurs de demain.', 'Join the creative equity platform and support tomorrow\'s creators.')}</p>
        <button onClick={() => onViewChange(user ? 'MECENAT' : 'SIGNUP')} className="px-8 py-3 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          {user ? T('Découvrir tous les projets', 'Discover all projects') : T('Rejoindre LinkYourArt', 'Join LinkYourArt')}
        </button>
      </div>
    </div>
  );
};
