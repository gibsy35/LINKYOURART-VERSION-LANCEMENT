
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Layers, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Award, 
  ArrowUpRight, 
  ExternalLink,
  Eye,
  Clapperboard,
  Music,
  Gamepad2,
  Video,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUp,
  ArrowDown,
  Info,
  Coins,
  Activity,
  Cpu
} from 'lucide-react';
import { LYA_UNIT_VALUE } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

import { Logo } from '../components/ui/Logo';
import { View } from '../components/ui/Sidebar';
import { Ticker } from '../components/ui/Ticker';
import { CONTRACTS } from '../types';
import { LYAProtocolBadge } from '../components/LYAProtocol';
import { Player } from '../components/ui/Player';

interface HomeViewProps {
  onViewChange: (view: View) => void;
}

const BrushSeparator = () => (
  <div className="relative h-px w-full my-32 pointer-events-none overflow-visible z-30">
    <motion.div 
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-cyan to-transparent relative origin-center"
    >
      <div className="absolute inset-0 bg-primary-cyan blur-[2px] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-cyan rounded-full shadow-[0_0_15px_rgba(0,224,255,1)]" />
    </motion.div>
  </div>
);

const NeuralTicker = () => {
  const { t } = useTranslation();
  const [val, setVal] = React.useState(2942.15);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setVal(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-y border-primary-cyan/20 py-2 flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-primary-cyan" />
              <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest leading-none">Global LYA Index</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold leading-none">+0.14%</span>
            </div>
            <div className="w-1.5 h-1.5 bg-primary-cyan/20 rounded-full" />
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-accent-gold" />
              <span className="text-[10px] font-mono text-accent-gold uppercase tracking-widest leading-none">Neural Mesh Status</span>
              <span className="text-[10px] font-mono text-white font-bold leading-none">OPTIMAL</span>
            </div>
            <div className="w-1.5 h-1.5 bg-primary-cyan/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

const RealTimeValuation = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [liveFluctuation, setLiveFluctuation] = React.useState(0);
  const [priceDirection, setPriceDirection] = React.useState<'up' | 'down' | 'stable'>('up');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() * 1.2 - 0.5); // Bias towards growth
      setLiveFluctuation(prev => {
        const next = Math.max(-20, prev + delta);
        setPriceDirection(delta > 0 ? 'up' : 'down');
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [selectedCategory, setSelectedCategory] = React.useState('film');

  const categories = [
    { id: 'film', label: t('Feature Film', 'Long-métrage'), sub: t('Neon Ghosts', 'Néons Fantômes'), budget: 1500000, icon: <Clapperboard size={24} /> },
    { id: 'music', label: t('Music Album', 'Album Musical'), sub: t('Synthetic Dreams', 'Rêves Synthétiques'), budget: 150000, icon: <Music size={24} /> },
    { id: 'game', label: t('Indie Game', 'Jeu Vidéo Indie'), sub: t('Void Runner', 'Coureur du Vide'), budget: 400000, icon: <Gamepad2 size={24} /> },
  ];

  const data: Record<string, any> = {
    film: {
      initialScore: 520,
      milestones: [
        { title: t('Script & Casting Validated', 'Scénario & Casting validés'), desc: t('Confirmed actors, credible technical team', 'Acteurs confirmés, équipe technique crédible'), scoreAdd: 60, type: 'positive' },
        { title: t('Production Delay (Weather)', 'Retard Production (Météo)'), desc: t('Shoot suspended 2 weeks, insurance claim pending', 'Tournage suspendu 2 semaines, recours assurance'), scoreAdd: -30, type: 'negative' },
        { title: t('Major Festival Selection', 'Sélection Festival Majeur'), desc: t('Maximum international visibility, confirmed credibility', 'Visibilité internationale maximale, crédibilité confirmée'), scoreAdd: 130, type: 'positive' },
        { title: t('Global Leak (Rough Cut)', 'Fuite Globale (Premier Montage)'), desc: t('Unfinished version online, security breach managed', 'Version inachevée en ligne, brèche gérée'), scoreAdd: -50, type: 'negative' },
        { title: t('Box-office Success', 'Succès Box-office'), desc: t('Week 1 returns > Forecast, real revenue confirmed', 'Revenus Semaine 1 > visée, succès confirmé'), scoreAdd: 90, type: 'positive' },
      ]
    },
    music: {
      initialScore: 480,
      milestones: [
        { title: t('Lead Single Viral on TikTok', 'Single Viral sur TikTok'), desc: t('10M+ views, massive streaming potential', '10M+ vues, fort potentiel streaming'), scoreAdd: 150, type: 'positive' },
        { title: t('Copyright Dispute', 'Litige Droit d\'Auteur'), desc: t('Lead single sample challenged legally', 'Sample principal contesté juridiquement'), scoreAdd: -80, type: 'negative' },
        { title: t('Major Artist Feature', 'Collaboration Artiste Majeur'), desc: t('Confirmed recording with Top 100 Global artist', 'Feat. confirmé avec artiste Top 100 Global'), scoreAdd: 110, type: 'positive' },
        { title: t('European Tour Delay', 'Retard Tournée Européenne'), desc: t('Logistics failure, 3 dates décalées', 'Échec logistique, 3 dates décalées'), scoreAdd: -40, type: 'negative' },
        { title: t('Album Charts Entry #1', 'Entrée Top Charts #1'), desc: t('Platinum sales certification, high residuals', 'Certification Platine, hauts revenus résiduels'), scoreAdd: 120, type: 'positive' },
      ]
    },
    game: {
      initialScore: 550,
      milestones: [
        { title: t('Stable Alpha Demo', 'Démo Alpha Stable'), desc: t('Core mechanics validated, positive tester feedback', 'Mécaniques validées, retours testeurs positifs'), scoreAdd: 80, type: 'positive' },
        { title: t('Critical Engine Bug', 'Bug Moteur Critique'), desc: t('Beta delayed monthly, shader rebuild required', 'Bêta retardée d\'un mois, refonte shader requise'), scoreAdd: -60, type: 'negative' },
        { title: t('Steam Wishlist Success', 'Succès Wishlist Steam'), desc: t('100k+ wishlists reached, high launch probability', '100k+ wishlists, forte probabilité lancement'), scoreAdd: 100, type: 'positive' },
        { title: t('Lead Artist Departure', 'Départ Lead Artist'), desc: t('Art style recalibration needed, production slow', 'Refonte style nécessaire, ralentissement prod'), scoreAdd: -90, type: 'negative' },
        { title: t('Overwhelmingly Positive', 'Extrêmement Positifs'), desc: t('Launch review score > 90%, strong long-term sales', 'Note lancement > 90%, fortes ventes long-terme'), scoreAdd: 140, type: 'positive' },
      ]
    }
  };

  const currentData = data[selectedCategory];
  const milestones = currentData.milestones;

  // Calculate cumulative scores and values for display (Starting from the $50 fixed unit at launch)
  let runningScore = currentData.initialScore;
  const milestonesWithScores = milestones.map((m: any) => {
    const scoreBefore = runningScore;
    runningScore += m.scoreAdd;
    const scoreAfter = runningScore;
    
    // New Formula: Valeur = 50 + (Score LYA - 500) * 0.10 
    // baseline 500 = $50. At 1000, value is $100 (doubles). Each point is $0.10.
    const valBefore = 50 + (scoreBefore - 500) * 0.10;
    const valAfter = 50 + (scoreAfter - 500) * 0.10;
    
    // Calculate actual variation percentage based on value change
    const actualVariation = (((valAfter - valBefore) / Math.max(1, valBefore)) * 100).toFixed(1);
    const variation = `${m.scoreAdd >= 0 ? '+' : ''}${actualVariation}%`;

    return { ...m, scoreBefore, scoreAfter, valBefore, valAfter, variation };
  });

  const getStatusColor = (score: number) => {
    if (score > 800) return 'text-emerald-400';
    if (score > 600) return 'text-primary-cyan';
    if (score > 400) return 'text-accent-gold';
    return 'text-red-400';
  };

  return (
    <section className="relative z-10 py-32 px-6 bg-surface-low/20">
      <div className="max-w-[1800px] mx-auto mt-16">
        <div className="text-center mb-16 px-4">
          <h2 className="text-xl md:text-3xl font-extrabold uppercase tracking-tighter mb-6 flex flex-wrap items-center justify-center gap-4">
            <Activity className="text-primary-cyan animate-pulse hidden sm:block" />
            <span>{t('Real-Time', 'La Valorisation')} <span className="text-primary-cyan">{t('Valuation', 'en Temps Réel')}</span></span>
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full mb-6">
            <Cpu size={12} className="text-primary-cyan animate-spin-slow" />
            <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest font-bold">{t('Neural Algorithm Active', 'Algorithme Neural Actif')}</span>
          </div>
          <p className="text-on-surface text-lg max-w-3xl mx-auto leading-relaxed mb-4">
            {t('As soon as it is received on LinkYourArt, a project receives an LYA Score /1000. This score evolves in real-time according to project milestones, directly impacting the resale value on the Exchange Center.', 'Dès sa réception sur LinkYourArt, un projet reçoit un Score LYA /1000. Ce score évolue en temps réel selon les jalons du projet, impactant directement la valeur de revente sur le Centre d\'Échanges.')}
          </p>
          <p className="text-[11px] font-mono text-primary-cyan uppercase tracking-wider max-w-2xl mx-auto opacity-80 border border-primary-cyan/20 bg-primary-cyan/5 p-4 rounded-sm">
            {t('The resale value of an LYA Unit starts at 50 USD. Each point earned in the LYA Score adds +$0.10 to its resale value. Each point lost removes -$0.10. A project reaching 1000/1000 doubles the value of its units.', 'La valeur de revente d\'une LYA Unit démarre à 50 USD. Chaque point gagné au Score LYA ajoute +0,10$ à sa valeur de revente. Chaque point perdu retire -0,10$. Un projet atteignant 1000/1000 double la valeur de ses units.')}
          </p>
        </div>

        {/* Fixed Price Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-primary-cyan/10 border border-primary-cyan/30 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-cyan" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-cyan/20 flex items-center justify-center text-primary-cyan rounded-full">
                <Coins size={24} />
              </div>
              <div>
                <div className="text-xs font-mono text-primary-cyan uppercase tracking-widest mb-1">{t('Fixed Unit Standard', 'Standard d\'Unité Fixe')}</div>
                <div className="text-2xl font-black text-white">1 LYA UNIT = <span className="text-primary-cyan">50 USD</span></div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-center">
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Status</div>
                <div className="text-[10px] font-black text-emerald-400 uppercase">{t('Immutable Price', 'Prix Immuable')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selector GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-6 border transition-all text-left relative overflow-hidden group ${
                selectedCategory === cat.id 
                  ? 'bg-primary-cyan/10 border-primary-cyan shadow-[0_0_20px_rgba(0,224,255,0.2)]' 
                  : 'bg-surface-high border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'
              }`}
            >
              <div className={`mb-3 ${selectedCategory === cat.id ? 'text-primary-cyan' : 'text-on-surface-variant'}`}>{cat.icon}</div>
              <div className="text-sm font-black text-white uppercase mb-1">{cat.label}</div>
              <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest leading-none">{cat.sub}</div>
              {selectedCategory === cat.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={12} className="text-primary-cyan" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Detail View */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-dim border border-white/5 rounded-sm p-4 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan opacity-30" />
            
            {/* Header Info */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm flex items-center justify-center border border-primary-cyan/30 bg-primary-cyan/10 text-primary-cyan shrink-0">
                  {categories.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic">{categories.find(c => c.id === selectedCategory)?.label}</h3>
                  <div className="text-[10px] sm:text-xs font-mono text-on-surface-variant uppercase tracking-widest flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {t('Case Study', 'Étude de Cas')} : {categories.find(c => c.id === selectedCategory)?.sub}
                    <span className="hidden sm:block w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-primary-cyan">{formatPrice(categories.find(c => c.id === selectedCategory)?.budget || 0)} TOTAL CAP.</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-center">
                  <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">{t('Total Budget', 'Budget Total')}</div>
                  <div className="text-lg font-black text-white whitespace-nowrap">{formatPrice(categories.find(c => c.id === selectedCategory)?.budget || 0)}</div>
                </div>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-center">
                  <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">{t('Initial Score', 'Score Initial')}</div>
                  <div className="text-lg font-black text-white">{currentData.initialScore}/1000</div>
                </div>
                <div className="px-4 py-3 bg-primary-cyan/5 border border-primary-cyan/20 rounded-sm text-center relative overflow-hidden">
                  <div className="text-[8px] font-mono text-primary-cyan uppercase tracking-widest mb-1">{t('Current Value', 'Valeur Actuelle')}</div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-black text-primary-cyan flex items-center gap-2">
                      {formatPrice(50 + liveFluctuation)}
                      <div className={`flex items-center text-[10px] ${priceDirection === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {priceDirection === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-[1px] w-full bg-primary-cyan/40"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative space-y-6 sm:space-y-8">
              <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-px bg-white/10" />
              
              {milestonesWithScores.map((m: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-10 sm:pl-12"
                >
                  <div className={`absolute left-0 top-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 border-2 sm:border-4 border-surface-dim ${m.type === 'positive' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                    {m.type === 'positive' ? <CheckCircle2 size={12} className="sm:size-16" /> : <AlertTriangle size={12} className="sm:size-16" />}
                  </div>
                  
                  <div className="bg-surface-low/50 border border-white/5 p-4 sm:p-6 rounded-sm group hover:border-white/10 transition-all hover:bg-surface-low/80">
                    <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-lg sm:text-xl font-black text-white uppercase italic">{m.title}</h4>
                          <div className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full ${m.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {m.type === 'positive' ? t('Milestone', 'Jalon') : t('Risk', 'Risque')}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed opacity-60">{m.desc}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 shrink-0 items-stretch sm:items-center">
                        <div className="px-4 py-2 bg-black/20 border border-white/5 rounded-sm min-w-[120px] flex-1 sm:flex-none">
                          <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <BarChart3 size={10} />
                            Index Score
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] text-on-surface-variant/40 font-mono">{m.scoreBefore}</span>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${m.type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {m.type === 'positive' ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                              {Math.abs(m.scoreAdd)}
                            </div>
                            <span className="text-xs font-black text-white">{m.scoreAfter}</span>
                          </div>
                        </div>
                        
                        <div className="px-4 py-2 bg-primary-cyan/5 border border-primary-cyan/10 rounded-sm min-w-[140px] flex-1 sm:flex-none">
                          <div className="text-[8px] font-mono text-primary-cyan uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <TrendingUp size={10} />
                            {t('Project Value', 'Valeur Projet')}
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] text-on-surface-variant/40 font-mono">{formatPrice(m.valBefore + liveFluctuation * (m.valBefore/50))}</span>
                            <ArrowRight size={8} className="text-primary-cyan/40" />
                            <span className="text-xs font-black text-white">{formatPrice(m.valAfter + liveFluctuation * (m.valAfter/50))}</span>
                          </div>
                          <div className={`text-[9px] font-black mt-1 text-right italic ${m.type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {m.variation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Message */}
            <div className="mt-16 text-center pt-8 border-t border-white/5">
              <div className="flex items-center justify-center gap-3 mb-6">
                <BarChart3 size={20} className="text-primary-cyan" />
                <h4 className="text-xl font-black text-white uppercase">
                  {t('Real-Time Score Analytics', 'Analyse du Score en Temps Réel')}
                </h4>
              </div>
              <p className="text-sm text-on-surface-variant opacity-60 max-w-2xl mx-auto leading-relaxed mb-8">
                {t('The LYA Score is a living index. Every breakthrough expands the value floor, while every delay or risk documented causes an immediate recalibration. This transparency ensures that the market price always reflects the project\'s actual health.', 'Le Score LYA est un index vivant. Chaque avancée augmente le prix plancher, tandis que chaque retard ou risque documenté provoque une recalibration immédiate. Cette transparence garantit que le prix du marché reflète toujours la santé réelle du projet.')}
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-cyan/5 border border-primary-cyan/20 rounded-sm">
                <Zap size={14} className="text-primary-cyan" />
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
                  <span className="text-white font-bold">{t('Reminder:', 'Rappel :')}</span> {t('LYA Units are bought at a fixed 50 USD. On the Exchange Center (secondary market), their price varies according to the project\'s LYA Score /1000.', 'Les LYA Units s\'achètent à 50 USD fixe. Sur le Centre d\'Échanges (marché secondaire), leur prix varie selon le Score LYA /1000 du projet.')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  id: string;
  label: string;
  sub: string;
  budget: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ label, sub, budget, icon, active, onClick }) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`p-6 border transition-all text-left relative overflow-hidden group min-w-[280px] h-[350px] cursor-pointer flex flex-col justify-between ${
      active 
        ? 'bg-primary-cyan/10 border-primary-cyan shadow-[0_0_30px_rgba(0,224,255,0.2)]' 
        : 'bg-surface-low/40 border-white/5 backdrop-blur-md opacity-80 hover:opacity-100 hover:border-primary-cyan/30'
    }`}
  >
    {/* Specialized Value Badge */}
    <div className="absolute top-4 left-4 z-20">
      <div className={`px-2 py-1 ${active ? 'bg-white text-primary-cyan' : 'bg-primary-cyan text-surface-dim'} text-[8px] font-black uppercase tracking-widest rounded-sm shadow-xl flex items-center gap-1.5 border border-white/10 group-hover:scale-110 transition-transform`}>
        <Coins size={10} />
        LYA UNIT $50
      </div>
    </div>

    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <div className="relative z-10">
      <div className={`mb-6 transition-transform group-hover:scale-110 p-4 bg-white/5 rounded-sm inline-block ${active ? 'text-primary-cyan' : 'text-on-surface-variant'} [&_svg]:w-8 [&_svg]:h-8`}>
        {icon}
      </div>
      <div className="text-xl font-black text-white uppercase mb-1 tracking-tighter italic">{label}</div>
      <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4 opacity-60 leading-none">{sub}</div>
    </div>
    
    <div className="relative z-10">
      <div className="h-px w-full bg-white/5 mb-6" />
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest opacity-40">Capitalisation</div>
          <div className="text-sm font-black text-white">{budget}</div>
        </div>
        <div className="w-8 h-8 bg-primary-cyan/20 rounded-full flex items-center justify-center text-primary-cyan opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  </motion.div>
);

const ProjectSlider = ({ onNav }: { onNav: (v: View) => void }) => {
  const { t } = useTranslation();
  const projects = [
    { id: 'film', label: t('Feature Film', 'Long-métrage'), sub: t('Professional Cinema Rights', 'Droits Cinéma Professionnels'), budget: '1.5M$', icon: <Clapperboard /> },
    { id: 'music', label: t('Music Album', 'Album Musical'), sub: t('Verified Creative Portfolio', 'Portfolio Créatif Vérifié'), budget: '150K$', icon: <Music /> },
    { id: 'series', label: t('TV Series', 'Série TV'), sub: t('Digital Content Rights', 'Droits de Contenu Digital'), budget: '400K$', icon: <Video /> },
    { id: 'comedy', label: t('Musical Comedy', 'Comédie Musicale'), sub: t('Creative Arts Index', 'Index des Arts Créatifs'), budget: '250K$', icon: <Zap /> },
  ];

  return (
    <div className="relative w-full overflow-hidden py-10 mt-12 lg:mt-0 flex items-center min-h-[450px]">
      <div className="flex gap-6 animate-marquee">
        {[...projects, ...projects, ...projects].map((p, i) => (
          <ProjectCard key={i} {...p} active={i % 4 === 0} onClick={() => onNav('EXCHANGE')} />
        ))}
      </div>
      <div className="absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-surface-dim to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-surface-dim to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {

  const { t } = useTranslation();

  const [showLegalPopup, setShowLegalPopup] = useState(false);

  return (
    <div className="relative min-h-screen bg-surface-dim overflow-x-hidden">
      {/* Legal Popup Modal */}
      <AnimatePresence>
        {showLegalPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-high border border-red-500/30 max-w-2xl w-full p-8 md:p-12 relative shadow-[0_0_100px_rgba(239,68,68,0.2)]"
            >
              <button 
                onClick={() => setShowLegalPopup(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-6 leading-tight">
                  {t('REGULATORY DISCLOSURE & PROTOCOL LIMITATIONS', 'DIVULGATION RÉGLEMENTAIRE ET LIMITES DU PROTOCOLE')}
                </h2>
                <div className="h-[2px] w-24 bg-red-500 mb-8" />
                <p className="text-base md:text-lg text-on-surface-variant font-bold italic leading-relaxed mb-8">
                  {t('LYA Units are strictly indexed contractual rights and do NOT constitute shares, financial securities, or regulated investment products. The LinkYourArt Protocol acts solely as a technological layer for valuation and registry.', 'Les unités LYA sont strictement des droits contractuels indexés et ne constituent PAS des actions, des titres financiers ou des produits d\'investissement réglementés. Le protocole LinkYourArt agit uniquement en tant que couche technologique pour l\'évaluation et le registre.')}
                </p>
                <p className="text-sm text-on-surface-variant opacity-70 mb-10">
                  {t('LinkYourArt acts as a trusted third party for analysis and valuation. No promise of yield is guaranteed. The value can evolve based on objective indicators documented in real-time.', 'LinkYourArt agit en tant que tiers de confiance pour l\'analyse et la valorisation. Aucune promesse de rendement n\'est garantie. La valeur peut évoluer selon des indicateurs objectifs documentés en temps réel.')}
                </p>
                <button 
                  onClick={() => setShowLegalPopup(false)}
                  className="px-12 py-4 bg-red-500 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-surface-dim transition-all active:scale-95 shadow-2xl"
                >
                  {t('I UNDERSTAND', 'JE COMPRENDS')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 pt-4 pb-12 lg:pb-20 px-6 lg:px-12 overflow-hidden flex items-center min-h-[max(600px,85vh)]">
        {/* Global Background Logo Animation - RESTORED AND ENHANCED */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ 
                  opacity: [0.1, 0.6, 0.1], 
                  scale: [1, 1.4, 1],
                  rotate: [0, 8, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <Logo size={4000} color="multi" className="blur-[130px] opacity-100" />
              </motion.div>
            </div>
          </div>
          {/* Sweeping accent */}
          <motion.div 
            animate={{ 
              x: ['-100%', '100%'],
              opacity: [0, 0.4, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 left-0 w-full h-[800px] bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent blur-[160px] transform -skew-x-12"
          />
        </div>

        <div className="max-w-[1800px] mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-left z-20 relative pt-10 lg:pt-20"
            >
              <div className="relative mb-6 lg:mb-10 xl:mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[11rem] font-black tracking-tighter leading-[0.85] md:leading-[0.75] uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {t('ART IS AN', 'L\'ART EST UN')} <br className="hidden lg:block" />
                  <span className="text-primary-cyan drop-shadow-[0_0_80px_rgba(0,224,255,0.6)] font-black">{t('EXCHANGE.', 'ÉCHANGE.')}</span>
                </h1>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white max-w-5xl mb-4 lg:mb-8 xl:mb-12 font-black uppercase tracking-tight leading-tight drop-shadow-lg">
                "{t('LINKYOURART UNITES CREATORS, INVESTORS, INDUSTRY & AUDIENCES—POWERING TOMORROW’S MASTERPIECES.', 'LINKYOURART UNIT CRÉATEURS, INVESTISSEURS, INDUSTRIE ET PUBLICS—PROPULSANT LES CHEFS-D\'ŒUVRE DE DEMAIN.')}"
              </p>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-on-surface-variant max-w-3xl mb-6 lg:mb-8 xl:mb-12 font-medium leading-relaxed opacity-90 border-l-4 lg:border-l-8 border-primary-cyan pl-6 lg:pl-10 py-2 lg:py-3 italic">
                "{t('From project issuance to secondary exchange, navigate a secure ecosystem built on artistic excellence and creative transparency.', 'De l\'émission de projet à l\'échange secondaire, naviguez dans un écosystème sécurisé bâti sur l\'excellence artistique et la transparence créative.')}"
              </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 lg:mb-12">
              <button 
                onClick={() => onViewChange('DASHBOARD')}
                className="w-full sm:w-auto px-4 py-2.5 lg:px-8 lg:py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] group overflow-hidden shadow-[0_0_30px_rgba(0,224,255,0.3)] text-[10px] md:text-xs transition-all active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('Enter the Gallery', 'Entrer dans la Galerie')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={() => onViewChange('SIGNUP')}
                className="w-full sm:w-auto px-4 py-2.5 lg:px-8 lg:py-4 border border-white/20 hover:border-primary-cyan/50 text-white font-bold uppercase tracking-[0.2em] transition-all bg-white/5 backdrop-blur-sm group text-[10px] md:text-xs active:scale-95 text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('Create an Account', 'Créer un Compte')}
                  <Layers className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </div>

            {/* Floating Badges */}
            <div className="flex flex-wrap gap-2 lg:gap-4 pt-2">
              <motion.button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-concept-tutorial'))}
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-primary-cyan/10 border border-primary-cyan/30 rounded-full backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(0,224,255,0.1)] hover:bg-primary-cyan hover:text-surface-dim transition-all group"
              >
                <Info size={14} className="group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('How it Works', 'Comment ça marche')}</span>
              </motion.button>
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-primary-cyan/5 border border-primary-cyan/20 rounded-full backdrop-blur-md flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-primary-cyan rounded-full animate-pulse" />
                <span className="text-[10px] lg:text-xs font-mono text-primary-cyan font-bold uppercase tracking-widest">{t('Verified Creators', 'Créateurs Vérifiés')}</span>
              </motion.div>
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white/5 border border-white/20 rounded-full backdrop-blur-md flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] lg:text-xs font-mono text-white font-bold uppercase tracking-widest">{t('Artistic Trust', 'Confiance Artistique')}</span>
              </motion.div>
              <motion.button 
                onClick={() => setShowLegalPopup(true)}
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-red-500/80 border border-red-400/30 rounded-full backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-white hover:text-red-500 transition-all group"
              >
                <AlertTriangle size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('Legal Advisory', 'Conseil Légal')}</span>
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative z-20 flex flex-col justify-center h-full"
          >
            <ProjectSlider onNav={onViewChange} />
          </motion.div>
        </div>

    </div>
  </section>

      <BrushSeparator />

      {/* Real-Time Valuation Section */}
      <RealTimeValuation />

      <BrushSeparator />
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-black">{t('The Vision', 'La Vision')}</div>
              <h2 className="text-xl md:text-3xl font-black tracking-tighter mb-8 uppercase leading-none">
                {t('Creative projects are', 'Les projets créatifs sont des')} <span className="text-primary-cyan">{t('indexed contracts', 'contrats indexés')}</span>
              </h2>
              <p className="text-xl text-on-surface-variant leading-relaxed opacity-80">
                {t('Their value evolves over time based on their actual development.', 'Leur valeur évolue dans le temps en fonction de leur développement réel.')} 
                {t('LinkYourArt creates a third way: a system of', 'LinkYourArt crée une troisième voie : un système de')} <span className="text-white font-bold">{t('indexed contractual rights', 'droits contractuels indexés')}</span>, 
                {t('transparent and secure.', 'transparent et sécurisé.')}
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-8 bg-surface-low border border-white/5">
                <div className="text-3xl font-black text-white mb-2">01</div>
                <div className="text-sm uppercase tracking-widest text-primary-cyan font-bold">{t('Transparent', 'Transparent')}</div>
              </div>
              <div className="p-8 bg-surface-low border border-white/5">
                <div className="text-3xl font-black text-white mb-2">02</div>
                <div className="text-sm uppercase tracking-widest text-primary-cyan font-bold">{t('Secure', 'Sécurisé')}</div>
              </div>
              <div className="p-8 bg-surface-low border border-white/5">
                <div className="text-3xl font-black text-white mb-2">03</div>
                <div className="text-sm uppercase tracking-widest text-primary-cyan font-bold">{t('Indexed', 'Indexé')}</div>
              </div>
              <div className="p-8 bg-surface-low border border-white/5">
                <div className="text-3xl font-black text-white mb-2">04</div>
                <div className="text-sm uppercase tracking-widest text-primary-cyan font-bold">{t('Evolutive', 'Évolutif')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      {/* Comparison Section: What we are vs What we are not */}
      <section className="relative z-10 py-32 px-6 bg-surface-low/50">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-2xl font-black tracking-tighter mb-16 uppercase text-center">
            {t('home.not_lya.title', 'What LinkYourArt')} <span className="text-primary-cyan">{t('home.not_lya.title_cyan', 'is not')}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 border border-white/5 bg-surface-dim relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">{t('home.not_lya.crowdfunding.title', 'Classic Crowdfunding')}</h3>
              <ul className="space-y-4 text-sm text-on-surface-variant/70">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.crowdfunding.p1', 'Rigid all-or-nothing')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.crowdfunding.p2', 'No secondary value')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.crowdfunding.p3', 'Symbolic rewards only')}
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 border border-white/5 bg-surface-dim relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">{t('home.not_lya.equity.title', 'Equity Crowdfunding')}</h3>
              <ul className="space-y-4 text-sm text-on-surface-variant/70">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.equity.p1', 'Heavy and costly regulation')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.equity.p2', 'Legal complexity')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {t('home.not_lya.equity.p3', 'Unsuitable for creative projects')}
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      {/* The Ecosystem Section */}
      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">
            {t('home.pillars.title', 'The')} <span className="text-primary-cyan">{t('home.pillars.title_cyan', 'Four Pillars')}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto">
            {t('home.pillars.subtitle', 'LinkYourArt unites the major actors of the creative economy and the public in a single, secure, and transparent ecosystem.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.creators.title', 'Creators')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              {t('home.pillars.creators.desc', 'The heartbeat of the ecosystem. Creators tokenize their vision into Indexed Creative Contracts, offering future revenue shares to fuel their growth while maintaining creative control.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-accent-gold/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <div className="w-12 h-12 bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.investors.title', 'Investors')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              {t('home.pillars.investors.desc', 'Back the next generation of masterpieces. Investors acquire LYA Units representing future revenue shares, participating in the success of verified creative projects through a secure P2P exchange.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-400/10 transition-all" />
            <div className="w-12 h-12 bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.professionals.title', 'Professionals')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              {t('home.pillars.professionals.desc', 'The validators of excellence. Industry leaders (Netflix, Amazon, Labels, Producers) rate projects, ensuring the LYA Score reflects real-market potential and expert quality.')}
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">{t('home.pillars.public.title', 'The Public')}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              {t('home.pillars.public.desc', 'Discover the projects of tomorrow. The general public can explore the registry, track the creative journey, and contribute to the growth of masterpieces they believe in.')}
            </p>
          </div>
        </div>

        {/* Price Formula Section */}
        <div className="mb-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Valuation Model', 'Modèle de Valorisation')}</div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
                {t('home.formula.title', 'The')} <span className="text-primary-cyan">{t('home.formula.title_cyan', 'Price Formula')}</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 font-black">01</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p1.title', 'Creator Base Price')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p1.desc', 'The initial valuation set by the creator at project inception.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-primary-cyan to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-accent-pink/10 flex items-center justify-center text-accent-pink border border-accent-pink/20 font-black">02</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p2.title', 'LYA Algorithm Index')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p2.desc', 'Real-time data analysis across 5 critical pillars of project health.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-accent-pink to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-emerald-400/10 border border-emerald-400/20 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-emerald-400/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30 font-black">03</div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest mb-1">{t('home.formula.p3.title', 'Professional Validation')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('home.formula.p3.desc', 'Expert ratings from industry leaders (Netflix, Amazon, Producers).')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-surface-low border border-white/5 rounded-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/10 via-transparent to-accent-pink/10 animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="text-xs font-mono text-on-surface-variant opacity-40 uppercase tracking-widest mb-4">Project Valuation</div>
                  <div className="text-6xl font-black text-white tracking-tighter mb-2">LYA_SCORE</div>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-primary-cyan font-bold">CREATOR</span>
                    <span className="text-white/20">+</span>
                    <span className="text-accent-pink font-bold">ALGO</span>
                    <span className="text-white/20">+</span>
                    <span className="text-emerald-400 font-bold">PRO</span>
                  </div>
                </div>
                {/* Orbital elements */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-white/5 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border border-primary-cyan/10 rounded-full border-dashed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Network Section */}
        <div className="mb-40">
          <div className="text-center mb-16 px-4">
            <h3 className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('home.partners.subtitle', 'Validation Network')}</h3>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
              {t('Professional', 'Professionnel')} <span className="text-primary-cyan">{t('home.partners.title', 'Expert Hubs')}</span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full">
              <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">
                {t('home.partners.subtitle_long', 'Strategic partners and industry validators')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: 'Universal Music Group', logo: 'UMG', industry: t('home.partners.industries.music', 'Music') },
              { name: 'A24 Films', logo: 'A24', industry: t('home.partners.industries.cinema', 'Cinema') },
              { name: 'Sony Interactive', logo: 'SIE', industry: t('home.partners.industries.gaming', 'Gaming') },
              { name: 'Netflix Studios', logo: 'NFX', industry: t('home.partners.industries.streaming', 'Streaming') },
              { name: 'LVMH Group', logo: 'LVMH', industry: t('home.partners.industries.fashion', 'Fashion/IP') },
              { name: 'Epic Games', logo: 'EPIC', industry: t('home.partners.industries.tech', 'Tech/IP') },
              { name: 'A-Cold-Wall*', logo: 'ACW', industry: t('home.partners.industries.design', 'Design') },
              { name: 'Condé Nast', logo: 'CN', industry: t('home.partners.industries.publishing', 'Publishing') },
              { name: 'Ubisoft', logo: 'UBI', industry: t('home.partners.industries.gaming', 'Gaming') },
              { name: 'Paramount+', logo: 'PMT', industry: t('home.partners.industries.media', 'Media') },
            ].map((partner, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col items-center justify-center p-8 bg-surface-low/50 border border-white/5 hover:border-primary-cyan/30 transition-all rounded-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary-cyan/0 group-hover:bg-primary-cyan/[0.03] transition-colors" />
                <div className="text-3xl font-black text-white/10 group-hover:text-primary-cyan transition-colors mb-3 tracking-tighter uppercase italic">{partner.logo}</div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest text-center">{partner.name}</div>
                <div className="text-[8px] font-mono text-on-surface-variant/60 uppercase tracking-[0.2em] mt-2">{partner.industry}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="px-12 py-5 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white hover:border-primary-cyan/50 hover:bg-primary-cyan/5 transition-all text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 mx-auto group">
              {t('MORE TO COME', 'ENCORE PLUS À VENIR')}
              <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse group-hover:scale-125 transition-transform" />
            </button>
            <p className="mt-8 text-[11px] font-mono text-on-surface-variant/40 uppercase tracking-[0.4em] italic">
              {t('Establishing global creative authority...', 'Établissement de l\'autorité créative mondiale...')}
            </p>
          </div>
        </div>

        <div className="bg-primary-cyan/5 border border-primary-cyan/20 p-12 rounded-sm backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-primary-cyan/20 flex items-center justify-center text-primary-cyan border border-primary-cyan/30 rounded-full shadow-[0_0_30px_rgba(0,224,255,0.2)]">
                <span className="text-4xl font-black">LYA</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-headline uppercase tracking-[0.2em] mb-4">{t('home.standard.title', 'The LYA')} <span className="text-white">{t('home.standard.title_cyan', 'Unit Standard')}</span></h3>
              <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
                {t('home.standard.desc', 'LinkYourArt introduces the unique rating index for the creative market. Each LYA Unit represents a standardized $50 value of future revenue potential. This peer-to-peer system allows for the exchange of revenue shares based on project advancement and milestones, providing the only objective measure of creative value.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic">
            {t('home.scoring.title', 'The LYA')} <span className="text-primary-cyan">{t('home.scoring.title_cyan', 'Scoring System')}</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto">
            {t('home.scoring.subtitle', 'Our proprietary algorithm evaluates every contract across 5 critical notation criteria, providing a transparent and objective System Yield Index out of 1000.')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: t('home.scoring.c1.label', 'Project Quality'), score: '200', desc: t('home.scoring.c1.desc', 'Evaluation of artistic merit, historical significance, and creative execution.'), color: 'text-primary-cyan', bg: 'bg-primary-cyan/5', border: 'border-primary-cyan/20' },
            { label: t('home.scoring.c2.label', 'Marketability'), score: '200', desc: t('home.scoring.c2.desc', 'Analysis of secondary market demand, liquidity potential, and audience reach.'), color: 'text-accent-pink', bg: 'bg-accent-pink/5', border: 'border-accent-pink/20' },
            { label: t('home.scoring.c3.label', 'Legal Security'), score: '200', desc: t('home.scoring.c3.desc', 'Verification of contractual rights, IP protection, and regulatory compliance.'), color: 'text-accent-green', bg: 'bg-accent-green/5', border: 'border-accent-green/20' },
            { label: t('home.scoring.c4.label', 'Technical Innovation'), score: '200', desc: t('home.scoring.c4.desc', 'Assessment of technological uniqueness, smart contract complexity, and digital durability.'), color: 'text-accent-purple', bg: 'bg-accent-purple/5', border: 'border-accent-purple/20' },
            { label: t('home.scoring.c5.label', 'Growth Potential'), score: '200', desc: t('home.scoring.c5.desc', 'Projections of future value appreciation based on market trends and roadmap.'), color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' },
          ].map((criterion, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 border ${criterion.border} ${criterion.bg} backdrop-blur-sm relative group overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${criterion.color.replace('text-', 'bg-')} opacity-50`} />
              <div className="flex justify-between items-start mb-6">
                <span className={`text-2xl font-black ${criterion.color}`}>0{i+1}</span>
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Max {criterion.score}</span>
              </div>
              <h3 className="text-sm font-black text-white mb-4 uppercase tracking-tight leading-tight">{criterion.label}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{criterion.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-base text-on-surface-variant/60 uppercase tracking-[0.2em] max-w-3xl mx-auto leading-relaxed">
            "{t('home.quotes.scoring', 'The LYA Score represents the definitive index of a creative contract\'s living value, updated in real-time through market feedback and periodic professional audits.')}"
          </p>
        </motion.div>
      </section>

      {/* Removed Redundant Legal Section */}
      
      {/* Final CTA */}
      <section className="relative z-10 py-40 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-20 border border-primary-cyan/20 bg-primary-cyan/5 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan shadow-[0_0_20px_rgba(0,255,255,0.5)]" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase leading-none">
            {t('home.cta.title', 'Start')} <br/>
            <span className="text-primary-cyan">{t('home.cta.title_cyan', 'Engagement')}</span>
          </h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-xl mx-auto opacity-80">
            {t('home.cta.desc', 'Join the professional creative registry and start trading contract units today.')}
          </p>
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="px-5 py-2 bg-white text-surface-dim font-black uppercase tracking-[0.3em] hover:bg-primary-cyan transition-all shadow-2xl active:scale-95 text-xs"
          >
            {t('home.cta.button', 'Open Dashboard')}
          </button>
          
          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary-cyan text-right uppercase">
              LYA_SYSTEM_V4.2 <br/>
              {t('ESTABLISHING_LINK...', 'ÉTABLISSEMENT_DU_LIEN...')}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Clean Professional Footer */}
      <footer className="relative z-10 py-16 bg-surface-dim px-6 border-t border-white/5">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Logo size={40} className="opacity-40" showBeta />
            <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
              {t('home.footer.copyright', '© 2026 LINKYOURART CREATIVE REGISTRY')}
            </div>
          </div>
          <p className="text-[9px] text-on-surface-variant/30 uppercase tracking-[0.2em] max-w-sm text-center md:text-right">
            {t('home.footer.disclaimer', 'LinkYourArt Protocol operates as a technological layer for contractual valuation. Not a financial service.')}
          </p>
        </div>
      </footer>
    </div>
  );
};
