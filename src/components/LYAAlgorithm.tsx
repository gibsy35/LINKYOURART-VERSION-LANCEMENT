import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, TrendingUp, Shield, Star } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { CONTRACTS } from '../types';

export const LYAAlgorithm: React.FC = () => {
  const { t, language } = useTranslation();
  const isFR = language === 'FR';
  const T = (fr: string, en: string) => isFR ? fr : en;

  const topContracts = CONTRACTS
    .filter(c => c.status === 'LIVE')
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  const insights = [
    {
      icon: <TrendingUp size={16} className="text-emerald-400" />,
      titleFR: 'Tendance haussière détectée',
      titleEN: 'Upward trend detected',
      bodyFR: 'Les projets dans la catégorie Arts Visuels affichent une progression soutenue du LYA Score sur les 7 derniers jours. Moment favorable pour élargir votre soutien.',
      bodyEN: 'Projects in the Visual Arts category show sustained LYA Score growth over the last 7 days. Favourable moment to broaden your support.',
      accent: 'text-emerald-400',
    },
    {
      icon: <Star size={16} className="text-accent-gold" />,
      titleFR: 'Projets à surveiller',
      titleEN: 'Projects to watch',
      bodyFR: '3 projets Musique ont franchi le seuil de 800 points LYA Score cette semaine, signalant une forte dynamique créative et commerciale.',
      bodyEN: '3 Music projects crossed the 800 LYA Score threshold this week, signalling strong creative and commercial momentum.',
      accent: 'text-accent-gold',
    },
    {
      icon: <Zap size={16} className="text-primary-cyan" />,
      titleFR: 'Opportunité de co-soutien',
      titleEN: 'Co-support opportunity',
      bodyFR: 'CHRONOS_V3 affiche le meilleur rapport qualité/financement de la plateforme. Son budget est financé à 68% — une fenêtre de soutien stratégique est ouverte.',
      bodyEN: 'CHRONOS_V3 shows the best quality/funding ratio on the platform. Its budget is 68% funded — a strategic support window is open.',
      accent: 'text-primary-cyan',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-cyan/10 border border-primary-cyan/20 rounded-xl flex items-center justify-center text-primary-cyan">
            <Cpu size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">
              {T('Moteur d\'Analyse LYA', 'LYA Analysis Engine')}
            </h2>
            <p className="text-xs text-primary-cyan font-bold uppercase tracking-widest mt-0.5">
              {T('Recommandations personnalisées · Mise à jour quotidienne', 'Personalised recommendations · Updated daily')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-surface-variant/40 font-bold uppercase mb-1">{T('FIABILITÉ', 'RELIABILITY')}</div>
          <div className="text-2xl font-black text-emerald-400">98.4%</div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-high/30 border border-white/8 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-2">
              {ins.icon}
              <h3 className={`text-xs font-black uppercase tracking-wide ${ins.accent}`}>
                {isFR ? ins.titleFR : ins.titleEN}
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
              {isFR ? ins.bodyFR : ins.bodyEN}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Top projets */}
      <div className="bg-surface-high/20 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={14} className="text-primary-cyan" />
          <h3 className="text-xs font-black uppercase tracking-widest text-on-surface">
            {T('Top 5 Projets — LYA Score', 'Top 5 Projects — LYA Score')}
          </h3>
        </div>
        {topContracts.map((c, i) => (
          <div key={c.id} className="flex items-center gap-4">
            <span className="text-sm font-black text-on-surface-variant/30 w-5 text-center">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-on-surface truncate">{c.name}</p>
              <p className="text-xs text-on-surface-variant/50">{c.category}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-primary-cyan">{c.totalScore}<span className="text-xs text-on-surface-variant/30 font-normal">/1000</span></p>
              <div className="w-20 h-1.5 bg-white/8 rounded-full mt-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.totalScore / 1000) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-primary-cyan rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
