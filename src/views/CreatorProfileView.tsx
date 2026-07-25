import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { CONTRACTS, LYA_UNIT_VALUE } from '../types';
import { getSafeImageUrl } from '../utils/image';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Star, Award,
  Share2, Copy, ExternalLink, ArrowUpRight, ArrowDownRight,
  CheckCircle, AlertTriangle, BarChart2, Shield, Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

const unitPrice = (_g: number) => LYA_UNIT_VALUE;

// Données simulées du créateur public
const CREATOR_PROFILES = [
  {
    id: 'creator-1',
    name: 'Marcus Chen',
    avatar: '🎨',
    bio_fr: 'Artiste numérique et co-fondateur du mouvement Neo-Synthétiste. Mes œuvres explorent la frontière entre l\'intelligence artificielle et l\'expression humaine.',
    bio_en: 'Digital artist and co-founder of the Neo-Synthetist movement. My works explore the frontier between artificial intelligence and human expression.',
    category: 'Digital Art',
    location: 'Tokyo · Paris',
    joined: '2024',
    lyaScore: 892,
    followers: 24800,
    projectIds: [CONTRACTS[0]?.id, CONTRACTS[2]?.id],
    verified: true,
    badges: ['TOP CRÉATEUR', 'SCORE 800+', 'VÉRIFIÉ LYA'],
  },
];

interface Props {
  creatorId?: string;
  onViewChange: (v: any) => void;
  onNotify: (msg: string) => void;
  user: any;
}

export const CreatorProfileView: React.FC<Props> = ({ creatorId, onViewChange, onNotify, user }) => {
  const { language } = useTranslation();
  const { formatPrice } = useCurrency();
  const T = (fr: string, en: string) => language === 'FR' ? fr : en;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'about'>('projects');

  const creator = CREATOR_PROFILES.find(c => c.id === creatorId) || CREATOR_PROFILES[0];
  const projects = CONTRACTS.filter(c => creator.projectIds.includes(c.id));
  const liveProjects = projects.filter(p => p.status === 'LIVE');
  const totalValue = projects.reduce((s, p) => s + unitPrice(p.growth) * 50, 0);
  const avgGrowth = projects.length > 0 ? projects.reduce((s, p) => s + p.growth, 0) / projects.length : 0;
  const up = avgGrowth >= 0;

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?creator=${creator.id}`).catch(() => {});
    setCopied(true);
    onNotify(T('✦ Lien copié !', '✦ Link copied!'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-20 space-y-5 max-w-3xl mx-auto">

      {/* ── HERO CRÉATEUR ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#a78bfa]/10 via-surface-low/40 to-primary-cyan/5 border border-white/8 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a78bfa]/30 to-primary-cyan/20 border-2 border-[#a78bfa]/40 flex items-center justify-center text-4xl shrink-0">
            {creator.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{creator.name}</h1>
              {creator.verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/30 rounded-full">
                  <Shield size={10} className="text-primary-cyan"/>
                  <span className="text-[9px] font-black text-primary-cyan uppercase tracking-widest">{T('VÉRIFIÉ','VERIFIED')}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-on-surface-variant/50 font-mono uppercase tracking-widest mb-2">{creator.category} · {creator.location}</p>
            <div className="flex flex-wrap gap-1.5">
              {creator.badges.map((badge, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-full text-[9px] font-black text-[#a78bfa] uppercase tracking-widest">{badge}</span>
              ))}
            </div>
          </div>

          {/* Boutons partage */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 bg-surface-high/40 border border-white/10 rounded-xl text-xs font-black text-on-surface hover:border-white/25 transition-all">
              <Copy size={12}/> {copied ? T('Copié!','Copied!') : T('Partager','Share')}
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-on-surface-variant/70 leading-relaxed border-l-2 border-[#a78bfa]/40 pl-4">
          {T(creator.bio_fr, creator.bio_en)}
        </p>

        {/* Stats globales créateur */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'LYA Score', value: `${creator.lyaScore}/1000`, color: 'text-[#a78bfa]', icon: <Star size={14}/> },
            { label: T('Projets actifs','Active projects'), value: String(liveProjects.length), color: 'text-emerald-400', icon: <Zap size={14}/> },
            { label: T('Valeur totale','Total value'), value: formatPrice(totalValue), color: 'text-accent-gold', icon: <DollarSign size={14}/> },
            { label: T('Tendance','Trend'), value: `${up ? '+' : ''}${avgGrowth.toFixed(1)}%`, color: up ? 'text-emerald-400' : 'text-rose-400', icon: up ? <TrendingUp size={14}/> : <TrendingDown size={14}/> },
          ].map((s, i) => (
            <div key={i} className="bg-surface-high/20 border border-white/8 rounded-xl p-3 text-center">
              <div className={`flex items-center justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ONGLETS ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {[
          { key: 'projects' as const, labelFR: 'Projets', labelEN: 'Projects' },
          { key: 'about' as const, labelFR: 'À propos', labelEN: 'About' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 pb-3 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeTab === tab.key ? 'text-[#a78bfa]' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {T(tab.labelFR, tab.labelEN)}
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a78bfa]"/>}
          </button>
        ))}
      </div>

      {/* ── PROJETS ──────────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((proj, i) => {
            const pUp = proj.growth >= 0;
            const lya = unitPrice(proj.growth);
            const genData = Array.from({ length: 20 }, (_, j) => ({
              v: Math.round(lya * 50 * (1 + (proj.growth/100) * (j/20)) + (Math.random()-0.5) * lya * 2)
            }));
            return (
              <motion.div key={proj.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-surface-low/40 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all"
              >
                <div className="flex items-start gap-3 p-4">
                  <img src={getSafeImageUrl(proj.image, proj.category)} alt={proj.name}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-black text-on-surface">{proj.name}</p>
                      <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-widest ${proj.status === 'LIVE' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        {proj.status === 'LIVE' ? '● LIVE' : `⚠ ${proj.status}`}
                      </span>
                      <span className={`text-xs font-black ${proj.rarity === 'Legendary' ? 'text-accent-gold' : proj.rarity === 'Epic' ? 'text-[#a78bfa]' : 'text-primary-cyan'}`}>★ {proj.rarity}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/50">{proj.category} · {proj.registryIndex}</p>
                    <p className="text-xs text-on-surface-variant/50 mt-0.5 line-clamp-1">{proj.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/6 border-t border-white/6">
                  {[
                    { l: 'LYA UNIT', v: formatPrice(lya), c: 'text-accent-gold' },
                    { l: T('Variation','Change'), v: `${pUp?'+':''}${proj.growth}%`, c: pUp ? 'text-emerald-400' : 'text-rose-400' },
                    { l: 'LYA Score', v: `${proj.totalScore}/1000`, c: 'text-[#a78bfa]' },
                    { l: T('Rev. partagés','Rev. share'), v: `${proj.revenueSharePercentage}%`, c: 'text-primary-cyan' },
                  ].map((s, si) => (
                    <div key={si} className="p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>

                {/* Mini graphe */}
                <div className="h-16 border-t border-white/6 px-2 py-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={genData}>
                      <defs><linearGradient id={`cg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={pUp?'#10b981':'#f43f5e'} stopOpacity={0.3}/><stop offset="95%" stopColor={pUp?'#10b981':'#f43f5e'} stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="v" stroke={pUp?'#10b981':'#f43f5e'} strokeWidth={1.5} fill={`url(#cg${i})`} dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 p-3 border-t border-white/6">
                  <button onClick={() => { onViewChange('PROJECT_PUBLIC'); }}
                    className="flex-1 py-2.5 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-xs font-black rounded-xl hover:bg-primary-cyan hover:text-surface-dim transition-all flex items-center justify-center gap-1.5">
                    <ExternalLink size={12}/> {T('Voir la page publique', 'View public page')}
                  </button>
                  {user ? (
                    <button onClick={() => onViewChange('MECENAT')}
                      className="flex-1 py-2.5 bg-[#a78bfa] text-surface-dim text-xs font-black rounded-xl hover:bg-white transition-all flex items-center justify-center gap-1.5">
                      <DollarSign size={12}/> {T('Soutenir', 'Support')}
                    </button>
                  ) : (
                    <button onClick={() => onViewChange('SIGNUP')}
                      className="flex-1 py-2.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-xs font-black rounded-xl hover:bg-[#a78bfa] hover:text-surface-dim transition-all">
                      {T('Rejoindre LYA', 'Join LYA')}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── À PROPOS ─────────────────────────────────────────────────────── */}
      {activeTab === 'about' && (
        <div className="space-y-5">
          <div className="bg-surface-low/40 border border-white/8 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2"><Award size={13} className="text-[#a78bfa]"/> {T('Parcours & Réalisations','Journey & Achievements')}</h3>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">{T(creator.bio_fr, creator.bio_en)}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { l: T('Membre depuis','Member since'), v: creator.joined },
                { l: T('Catégorie principale','Main category'), v: creator.category },
                { l: T('Localisation','Location'), v: creator.location },
                { l: T('Statut','Status'), v: T('Vérifié LYA','LYA Verified') },
              ].map((s, i) => (
                <div key={i} className="bg-surface-high/30 rounded-xl p-3">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">{s.l}</p>
                  <p className="text-sm font-black text-on-surface">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score LYA du créateur */}
          <div className="bg-gradient-to-r from-[#a78bfa]/10 to-primary-cyan/5 border border-[#a78bfa]/20 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-black text-[#a78bfa] uppercase tracking-widest">{T('LYA Score Global Créateur','Creator Global LYA Score')}</p>
            <div className="flex items-center justify-between">
              <p className="text-5xl font-black text-white font-mono">{creator.lyaScore}<span className="text-lg text-on-surface-variant/30">/1000</span></p>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant/40 mb-1">{T('Rang sur la plateforme','Platform rank')}</p>
                <p className="text-2xl font-black text-accent-gold">Top 5%</p>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{width:0}} animate={{width:`${creator.lyaScore/10}%`}} transition={{duration:1.2}}
                className="h-full bg-gradient-to-r from-[#a78bfa] to-primary-cyan rounded-full"/>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#a78bfa]/10 to-primary-cyan/5 border border-[#a78bfa]/20 rounded-2xl p-6 text-center space-y-3">
        <p className="text-xs font-black text-[#a78bfa] uppercase tracking-widest">✦ LinkYourArt</p>
        <h3 className="text-xl font-black text-white">{T('Soutenez la créativité de demain','Support tomorrow\'s creativity')}</h3>
        <p className="text-sm text-on-surface-variant/60">{T('Rejoignez la plateforme d\'équité créative et co-possédez les projets qui vous inspirent.','Join the creative equity platform and co-own the projects that inspire you.')}</p>
        <button onClick={() => onViewChange(user ? 'REGISTRY' : 'SIGNUP')} className="px-8 py-3 bg-[#a78bfa] text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all">
          {user ? T('Découvrir tous les créateurs','Discover all creators') : T('Rejoindre LYA — Gratuit','Join LYA — Free')}
        </button>
      </div>
    </div>
  );
};
