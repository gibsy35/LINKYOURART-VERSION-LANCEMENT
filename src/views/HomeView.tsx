
import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Layers, 
  Users, 
  TrendingUp, 
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
  const [selectedCategory, setSelectedCategory] = React.useState('film');
  const [isPositive, setIsPositive] = React.useState(true);
  const [liveFluctuation, setLiveFluctuation] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveFluctuation((Math.random() - 0.5) * 0.05);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'film', label: t('Feature Film', 'Long-métrage'), sub: t('Cinema', 'Cinéma'), budget: 1500000, icon: <Clapperboard size={24} /> },
    { id: 'music', label: t('Music Album', 'Album Musical'), sub: t('Music', 'Musique'), budget: 150000, icon: <Music size={24} /> },
    { id: 'game', label: t('Indie Game', 'Jeu Vidéo Indie'), sub: t('Gaming', 'Gaming'), budget: 400000, icon: <Gamepad2 size={24} /> },
    { id: 'series', label: t('Web Series', 'Série Web / Doc'), sub: t('Digital Creation', 'Création Digitale'), budget: 250000, icon: <Video size={24} /> },
  ];

  const data: Record<string, any> = {
    film: {
      initialScore: 520,
      positive: [
        { title: t('Script Validated + Casting Announced', 'Scénario validé + casting annoncé'), desc: t('Confirmed actors, credible technical team', 'Acteurs confirmés, équipe technique crédible'), scoreAdd: 60 },
        { title: t('50% Filming Completed', '50% du tournage terminé'), desc: t('Visual proof, reduced production risk', 'Preuves visuelles, risque de production réduit'), scoreAdd: 70 },
        { title: t('Major Festival Selection', 'Sélection Festival majeur'), desc: t('Maximum international visibility, confirmed credibility', 'Visibilité internationale maximale, crédibilité confirmée'), scoreAdd: 130 },
        { title: t('International Distributor Signed', 'Distributeur international signé'), desc: t('Multi-country release guaranteed, predictable revenue', 'Sortie multi-pays garantie, revenus prévisibles'), scoreAdd: 70 },
        { title: t('Box-office Week 1 > Forecast', 'Box-office 1ère semaine > prévisions'), desc: t('Confirmed real revenue, validated commercial success', 'Revenus réels confirmés, succès commercial validé'), scoreAdd: 70 },
      ],
      negative: [
        { title: t('Secondary Market Liquidation', 'Liquidation Marché Secondaire'), desc: t('Sudden sell-off by institutional holder, price floor broken', 'Vente massive par détenteur institutionnel, rupture du prix plancher'), scoreAdd: -120 },
        { title: t('IP Rights Conflict', 'Conflit de Droits de PI'), desc: t('Legal challenge to underlying assets, asset frozen', 'Contestation juridique des actifs sous-jacents, actif gelé'), scoreAdd: -85 },
        { title: t('Production Halt', 'Arrêt de Production'), desc: t('Critical staff departure, project timeline suspended', 'Départ de personnel critique, calendrier de projet suspendu'), scoreAdd: -60 },
        { title: t('Market Sentiment Crash', 'Chute du Sentiment de Marché'), desc: t('Algorithm downgrade after poor social engagement metrics', 'Déclassement de l\'algorithme après de mauvais indicateurs d\'engagement'), scoreAdd: -45 }
      ]
    },
    music: {
      initialScore: 480,
      positive: [
        { title: t('Studio Recording Completed', 'Enregistrement studio terminé'), desc: t('High-quality production, professional mixing', 'Production haute qualité, mixage professionnel'), scoreAdd: 50 },
        { title: t('Single Release Viral on TikTok', 'Sortie single virale sur TikTok'), desc: t('Massive organic reach, 10M+ views, high streaming potential', 'Portée organique massive, 10M+ vues, fort potentiel streaming'), scoreAdd: 150 },
        { title: t('Spotify "New Music Friday" Global', 'Spotify "New Music Friday" Global'), desc: t('Featured on top playlists, massive daily listener growth', 'Mis en avant sur les meilleures playlists, croissance massive des auditeurs'), scoreAdd: 80 },
        { title: t('Major Artist Collaboration', 'Collaboration Artiste Majeur'), desc: t('Confirmed feature with Top 100 artist, cross-audience reach', 'Feature confirmé avec un artiste du Top 100, portée multi-audience'), scoreAdd: 90 },
        { title: t('European Tour Announced', 'Tournée européenne annoncée'), desc: t('15 dates confirmed, 60% pre-sold tickets, brand partnerships', '15 dates confirmées, 60% de tickets pré-vendus, partenariats'), scoreAdd: 70 },
      ],
      negative: [
        { title: t('Album Leak - Low Quality', 'Fuite d\'album - Basse qualité'), desc: t('Unfinished tracks surfacing online, negative reaction from early fans', 'Pistes inachevées en ligne, réaction négative des premiers fans'), scoreAdd: -55 },
        { title: t('Copyright Dispute on Lead Single', 'Litige de droits sur le single'), desc: t('Legal risk, potential removal from platforms, revenue freeze', 'Risque juridique, retrait potentiel des plateformes, gel des revenus'), scoreAdd: -120 },
        { title: t('Tour Cancelled (Low Sales)', 'Tournée annulée (Ventes faibles)'), desc: t('Financial loss, damaged reputation with promoters', 'Perte financière, réputation endommagée auprès des promoteurs'), scoreAdd: -150 },
        { title: t('PR Controversy Impact', 'Impact de la controverse PR'), desc: t('Artist removed from major editorial playlists after social incident', 'Artiste retiré des playlists éditoriales après un incident social'), scoreAdd: -95 }
      ]
    },
    game: {
      initialScore: 550,
      positive: [
        { title: t('Prototype Playable', 'Prototype jouable'), desc: t('Core mechanics validated, positive tester feedback', 'Mécaniques validées, retours testeurs positifs'), scoreAdd: 80 },
        { title: t('Steam Wishlist Target Reached', 'Objectif Wishlist Steam atteint'), desc: t('100k+ wishlists, guaranteed launch visibility', '100k+ wishlists, visibilité lancement garantie'), scoreAdd: 90 },
        { title: t('Featured in "State of Play"', 'Présenté au "State of Play"'), desc: t('Major platform endorsement, massive viral trailer views', 'Approbation plateforme majeure, vues massives du trailer'), scoreAdd: 100 },
        { title: t('Major Publisher Deal Signed', 'Accord éditeur majeur signé'), desc: t('Secured marketing budget, global physical distribution', 'Budget marketing sécurisé, distribution physique mondiale'), scoreAdd: 100 },
        { title: t('Early Access "Overwhelmingly Positive"', 'Early Access "Extrêmement Positif"'), desc: t('95%+ positive reviews, strong long-term sales forecast', '95%+ d\'avis positifs, fortes prévisions de ventes long terme'), scoreAdd: 80 },
      ],
      negative: [
        { title: t('Critical Bug in Beta', 'Bug critique en Bêta'), desc: t('Delayed launch, negative community sentiment, refund risk', 'Lancement retardé, sentiment communauté négatif, risque de remboursement'), scoreAdd: -90 },
        { title: t('Key Developer Resigns', 'Démission d\'un développeur clé'), desc: t('Technical knowledge loss, production slowdown, morale drop', 'Perte de savoir technique, ralentissement production, baisse de moral'), scoreAdd: -110 },
        { title: t('DMCA Takedown on Key Asset', 'Retrait DMCA sur un Asset clé'), desc: t('Legal battle, forced redesign, production halt', 'Bataille juridique, refonte forcée, arrêt de la production'), scoreAdd: -180 },
      ]
    },
    series: {
      initialScore: 500,
      positive: [
        { title: t('Pilot Episode Greenlit', 'Épisode Pilote validé'), desc: t('Production budget secured, network interest confirmed', 'Budget production sécurisé, intérêt network confirmé'), scoreAdd: 70 },
        { title: t('Viral Trailer (10M+ Views)', 'Trailer Viral (10M+ Vues)'), desc: t('Organic hype, high social media engagement', 'Hype organique, fort engagement sur les réseaux sociaux'), scoreAdd: 90 },
        { title: t('Platform Acquisition (Netflix/HBO)', 'Acquisition plateforme (Netflix/HBO)'), desc: t('Global distribution, guaranteed residuals, massive reach', 'Distribution mondiale, revenus résiduels garantis, portée massive'), scoreAdd: 200 },
        { title: t('Emmy Award Nomination', 'Nomination aux Emmy Awards'), desc: t('Critical acclaim, institutional prestige, increased value', 'Succès critique, prestige institutionnel, valeur accrue'), scoreAdd: 120 },
        { title: t('Season 2 Renewal', 'Renouvellement Saison 2'), desc: t('Long-term value confirmed, loyal audience, expanded budget', 'Valeur long terme confirmée, audience fidèle, budget élargi'), scoreAdd: 100 },
      ],
      negative: [
        { title: t('Pilot Rejected by Networks', 'Pilote rejeté par les networks'), desc: t('High risk of cancellation, loss of investment, re-pitching needed', 'Risque élevé d\'annulation, perte d\'investissement, re-pitch nécessaire'), scoreAdd: -150 },
        { title: t('Viewership Below Target', 'Audience sous les objectifs'), desc: t('Low ad revenue, renewal unlikely, platform disappointment', 'Faibles revenus pub, renouvellement improbable, déception plateforme'), scoreAdd: -80 },
        { title: t('Production Shutdown (Budget)', 'Arrêt Production (Budget)'), desc: t('Mismanagement, frozen assets, legal disputes', 'Mauvaise gestion, actifs gelés, litiges juridiques'), scoreAdd: -200 },
      ]
    }
  };

  const currentData = data[selectedCategory];
  const milestones = isPositive ? currentData.positive : currentData.negative;

  // Calculate cumulative scores and values for display (Starting from the $50 fixed unit at launch)
  let runningScore = currentData.initialScore;
  const milestonesWithScores = milestones.map((m: any) => {
    const scoreBefore = runningScore;
    runningScore += m.scoreAdd;
    const scoreAfter = runningScore;
    
    // Formula: Value = (LYA Score / 1000) * 50 USD
    // This matches the user's data: 580 score = $29, 450 score = $22.5
    const valBefore = (scoreBefore / 1000) * 50;
    const valAfter = (scoreAfter / 1000) * 50;
    
    // Calculate actual variation percentage based on value change
    const actualVariation = (((valAfter - valBefore) / valBefore) * 100).toFixed(1);
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
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 flex flex-wrap items-center justify-center gap-4">
            <Activity className="text-primary-cyan animate-pulse hidden sm:block" />
            <span>{t('Real-Time', 'La Valorisation')} <span className="text-primary-cyan">{t('Valuation', 'en Temps Réel')}</span></span>
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full mb-6">
            <Cpu size={12} className="text-primary-cyan animate-spin-slow" />
            <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest font-bold">{t('Neural Algorithm Active', 'Algorithme Neural Actif')}</span>
          </div>
          <p className="text-on-surface text-lg max-w-3xl mx-auto leading-relaxed">
            {t('As soon as it is received on LinkYourArt, a project receives an LYA Score /1000. This score evolves in real-time according to project milestones, directly impacting the resale value on the Exchange Center.', 'Dès sa réception sur LinkYourArt, un projet reçoit un Score LYA /1000. Ce score évolue en temps réel selon les jalons du projet, impactant directement la valeur de revente sur le Centre d\'Échanges.')}
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
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">EUR</div>
                <div className="text-sm font-black text-white">≈ 46.00€</div>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-center">
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">GBP</div>
                <div className="text-sm font-black text-white">≈ 39.50£</div>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-center">
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Status</div>
                <div className="text-[10px] font-black text-emerald-400 uppercase">{t('Immutable Price', 'Prix Immuable')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-6 border transition-all text-left relative overflow-hidden group ${
                selectedCategory === cat.id 
                  ? 'bg-primary-cyan/10 border-primary-cyan shadow-[0_0_20px_rgba(0,224,255,0.1)]' 
                  : 'bg-surface-dim border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`mb-4 transition-transform group-hover:scale-110 ${selectedCategory === cat.id ? 'text-primary-cyan' : 'text-on-surface-variant'}`}>
                {cat.icon}
              </div>
              <div className="text-sm font-black text-white uppercase mb-1">{cat.label}</div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-2">{cat.sub}</div>
              <div className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">Budget: {formatPrice(cat.budget)}</div>
              {selectedCategory === cat.id && (
                <motion.div layoutId="cat-active" className="absolute bottom-0 left-0 w-full h-1 bg-primary-cyan" />
              )}
            </button>
          ))}
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setIsPositive(true)}
            className={`px-8 py-3 rounded-sm font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all ${
              isPositive 
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'bg-surface-low text-on-surface-variant/40 border border-white/5'
            }`}
          >
            <CheckCircle2 size={14} />
            {t('Positive Milestones', 'Jalons Positifs')}
          </button>
          <button
            onClick={() => setIsPositive(false)}
            className={`px-8 py-3 rounded-sm font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all ${
              !isPositive 
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'bg-surface-low text-on-surface-variant/40 border border-white/5'
            }`}
          >
            <AlertTriangle size={14} />
            {t('Negative Milestones', 'Jalons Négatifs')}
          </button>
        </div>

        {/* Detail View */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            key={`${selectedCategory}-${isPositive}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-dim border border-white/5 rounded-sm p-8 md:p-12 relative overflow-hidden shadow-2xl"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} opacity-30`} />
            
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-sm flex items-center justify-center border ${isPositive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                  {categories.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase">{categories.find(c => c.id === selectedCategory)?.label}</h3>
                  <div className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Total Budget: {formatPrice(categories.find(c => c.id === selectedCategory)?.budget || 0)}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-sm text-center min-w-[160px]">
                  <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">{t('Initial LYA Score', 'Score LYA Initial')}</div>
                  <div className="text-2xl font-black text-white">{currentData.initialScore}/1000</div>
                </div>
                <div className="px-6 py-4 bg-primary-cyan/5 border border-primary-cyan/20 rounded-sm text-center min-w-[160px] relative overflow-hidden">
                  <div className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest mb-1">{t('Fixed Unit Price', 'Prix Unit Fixe')}</div>
                  <div className="text-2xl font-black text-primary-cyan">
                    {formatPrice(50 + liveFluctuation)}
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
            <div className="relative space-y-8">
              <div className={`absolute left-[19px] top-4 bottom-4 w-px ${isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />
              
              {milestonesWithScores.map((m: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12"
                >
                  <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-surface-dim ${isPositive ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                    {isPositive ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  
                  <div className="bg-surface-low/50 border border-white/5 p-6 rounded-sm group hover:border-white/10 transition-all hover:bg-surface-low/80">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-black text-white uppercase">{m.title}</h4>
                          <div className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isPositive ? t('Milestone', 'Jalon') : t('Risk', 'Risque')}
                          </div>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">{m.desc}</p>
                      </div>
                      
                      <div className="flex gap-4 shrink-0 items-center">
                        <div className="px-5 py-3 bg-black/20 border border-white/5 rounded-sm min-w-[140px]">
                          <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                            <BarChart3 size={10} />
                            Score LYA
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-on-surface-variant/40 font-mono">{m.scoreBefore}</span>
                            <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                              {Math.abs(m.scoreAdd)}
                            </div>
                            <span className="text-sm font-black text-white">{m.scoreAfter}</span>
                          </div>
                        </div>
                        
                        <div className="px-5 py-3 bg-primary-cyan/5 border border-primary-cyan/10 rounded-sm min-w-[160px]">
                          <div className="text-[9px] font-mono text-primary-cyan uppercase tracking-widest mb-2 flex items-center gap-2">
                            <TrendingUp size={10} />
                            {t('Resale Value', 'Valeur de Revente')}
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-on-surface-variant/40 font-mono">{formatPrice(m.valBefore + liveFluctuation * (m.valBefore/50))}</span>
                            <ArrowRight size={10} className="text-primary-cyan/40" />
                            <span className="text-sm font-black text-white">{formatPrice(m.valAfter + liveFluctuation * (m.valAfter/50))}</span>
                          </div>
                          <div className={`text-[10px] font-black mt-1 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
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
                <BarChart3 size={20} className={isPositive ? 'text-emerald-500' : 'text-red-500'} />
                <h4 className="text-xl font-black text-white uppercase">
                  {isPositive 
                    ? t('Each positive milestone = LYA Score rises', 'Chaque jalon positif = Score LYA monte')
                    : t('Warning: Stagnation = LYA Score drops', 'Attention : Stagnation = Score LYA baisse')
                  }
                </h4>
              </div>
              <p className="text-sm text-on-surface-variant opacity-60 max-w-2xl mx-auto leading-relaxed mb-8">
                {isPositive 
                  ? t('Every new validated step (casting, production, festivals, revenue...) makes the LYA Score climb. The higher the score, the more the resale value increases on the Exchange Center. It is transparent and documented in real-time.', 'Chaque nouvelle étape validée (casting, production, festivals, revenus...) fait grimper le Score LYA. Plus le score monte, plus la valeur de revente augmente sur le Centre d\'Échanges. C\'est transparent et documenté en temps réel.')
                  : t('It is crucial: that is why we value in real-time. Investors immediately see problems through the drop in LYA Score. Creators, stay transparent!', 'C\'est crucial : c\'est pour cela qu\'on valorise en temps réel. Les investisseurs voient immédiatement les problèmes via la baisse du Score LYA. Créateurs, restez transparents !')
                }
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-cyan/5 border border-primary-cyan/20 rounded-sm">
                <Zap size={14} className="text-primary-cyan" />
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
                  <span className="text-white font-bold">Rappel :</span> {t('LYA Units are bought at a fixed 50 USD (≈ 46€ / 39.5£). On the Exchange Center (secondary market), their price varies according to the project\'s LYA Score /1000.', 'Les LYA Units s\'achètent à 50 USD fixe (≈ 46€ / 39.5£). Sur le Centre d\'Échanges (marché secondaire), leur prix varie selon le Score LYA /1000 du projet.')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({ onViewChange }) => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-surface-dim overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-24 px-6 max-w-[1800px] mx-auto min-h-[85vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-left z-20"
          >
            <h1 className="text-4xl md:text-8xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] md:leading-[0.75] uppercase text-white drop-shadow-2xl">
              {t('ART IS AN', 'L\'ART EST UN')} <br className="hidden md:block" />
              <span className="text-primary-cyan drop-shadow-[0_0_60px_rgba(0,224,255,0.4)]">{t('EXCHANGE.', 'ÉCHANGE.')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white max-w-2xl mb-6 font-black uppercase tracking-tight leading-tight">
              "{t('Where Creators, Investors and Industry Professionals converge — and where the public discovers tomorrow's masterpieces., Investors, and Industry Professionals converge. It also provides a unique window for the public to discover and contribute to tomorrow\'s masterpieces.', 'LinkYourArt est le point de rencontre entre Créateurs, Investisseurs et Professionnels de l\'industrie. C\'est aussi une fenêtre unique pour le public de découvrir et contribuer aux chefs-d\'œuvre de demain.')}"
            </p>

            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 font-light leading-relaxed opacity-90 border-l border-primary-cyan/30 pl-4">
              {t('From fractional issuance to secondary exchange, navigate a secure ecosystem built on artistic excellence and institutional transparency.', 'De l\'émission fractionnée à l\'échange secondaire, naviguez dans un écosystème sécurisé bâti sur l\'excellence artistique et la transparence institutionnelle.')}
            </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => onViewChange('LOGIN')}
            className="w-full sm:w-auto px-6 py-3 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] group overflow-hidden shadow-[0_0_20px_rgba(0,224,255,0.2)] text-[10px] md:text-xs"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t('Enter the Gallery', 'Entrer dans la Galerie')}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button 
            onClick={() => onViewChange('SIGNUP')}
            className="w-full sm:w-auto px-6 py-3 border border-white/10 hover:border-primary-cyan/50 text-white font-black uppercase tracking-[0.2em] transition-all bg-white/5 backdrop-blur-sm group text-[10px] md:text-xs"
          >
            <span className="flex items-center justify-center gap-2">
              {t('Create an Account', 'Créer un Compte')}
              <Layers className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </span>
          </button>
        </div>
            {/* Floating Badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="px-4 py-2 bg-primary-cyan/5 border border-primary-cyan/20 rounded-full backdrop-blur-md flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-primary-cyan rounded-full animate-pulse" />
                <span className="text-xs font-mono text-primary-cyan font-bold uppercase tracking-widest">{t('Verified Creators', 'Créateurs Vérifiés')}</span>
              </motion.div>
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-full backdrop-blur-md flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-mono text-white font-bold uppercase tracking-widest">{t('Artistic Trust', 'Confiance Artistique')}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ 
              opacity: 0.4, 
              scale: [1.2, 1.3, 1.2],
              rotate: [0, 5, 0, -5, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              opacity: { duration: 2 },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-[60%] md:left-[80%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          >
            <Logo size={1000} color="multi" className="drop-shadow-[0_0_100px_rgba(0,224,255,0.3)] filter blur-[1px] md:blur-none" />
          </motion.div>
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
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('The Vision', 'La Vision')}</div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-8 uppercase leading-none">
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
          <h2 className="text-3xl font-black tracking-tighter mb-16 uppercase text-center">
            What <span className="text-primary-cyan">LinkYourArt</span> is not
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 border border-white/5 bg-surface-dim relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Classic Crowdfunding</h3>
              <ul className="space-y-4 text-sm text-on-surface-variant/70">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Rigid all-or-nothing
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  No secondary value
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Symbolic rewards only
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
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Equity Crowdfunding</h3>
              <ul className="space-y-4 text-sm text-on-surface-variant/70">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Heavy and costly regulation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Legal complexity
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Unsuitable for creative projects
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
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
            The <span className="text-primary-cyan">Four Pillars</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto">
            LinkYourArt unites the major actors of the creative economy and the public in a single, secure, and transparent ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">Creators</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              The heartbeat of the ecosystem. Creators tokenize their vision into Indexed Creative Contracts, offering future revenue shares to fuel their growth while maintaining creative control.
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-accent-gold/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <div className="w-12 h-12 bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">Investors</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              Back the next generation of masterpieces. Investors acquire LYA Units representing future revenue shares, participating in the success of verified creative projects through a secure P2P exchange.
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-400/10 transition-all" />
            <div className="w-12 h-12 bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">Professionals</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              The validators of excellence. Industry leaders (Netflix, Amazon, Labels, Producers) rate projects, ensuring the LYA Score reflects real-market potential and institutional quality.
            </p>
          </div>

          <div className="bg-surface-low border border-white/5 p-8 rounded-sm relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
            <div className="w-12 h-12 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 mb-6 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-black font-headline uppercase tracking-widest mb-4">The Public</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">
              Discover the projects of tomorrow. The general public can explore the registry, track the creative journey, and contribute to the growth of masterpieces they believe in.
            </p>
          </div>
        </div>

        {/* Price Formula Section */}
        <div className="mb-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Valuation Model', 'Modèle de Valorisation')}</div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">
                The <span className="text-primary-cyan">Price Formula</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-primary-cyan/10 flex items-center justify-center text-primary-cyan border border-primary-cyan/20 font-black">01</div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-widest mb-1">{t('Creator Base Price', 'Prix de Base Créateur')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('The initial valuation set by the creator at project inception.', 'La valorisation initiale fixée par le créateur lors de la création du projet.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-primary-cyan to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-accent-pink/10 flex items-center justify-center text-accent-pink border border-accent-pink/20 font-black">02</div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-widest mb-1">{t('LYA Algorithm Index', 'Index Algorithme LYA')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('Real-time data analysis across 5 critical pillars of project health.', 'Analyse de données en temps réel sur 5 piliers critiques de la santé du projet.')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <div className="w-px h-8 bg-gradient-to-b from-accent-pink to-transparent" />
                </div>
                <div className="flex items-start gap-6 p-6 bg-emerald-400/10 border border-emerald-400/20 rounded-sm">
                  <div className="w-12 h-12 shrink-0 bg-emerald-400/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30 font-black">03</div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-widest mb-1">{t('Professional Validation', 'Validation Professionnelle')}</h4>
                    <p className="text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">{t('Expert ratings from industry leaders (Netflix, Amazon, Producers).', 'Notes d\'experts des leaders de l\'industrie (Netflix, Amazon, Producteurs).')}</p>
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
            <h3 className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] mb-4 font-bold">{t('Validation Network', 'Réseau de Validation')}</h3>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              Institutional <span className="text-primary-cyan">{t('Expert Hubs', 'Hubs d\'Experts')}</span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full">
              <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">
                {t('Strategic partners and industry validators', 'Partenaires stratégiques et validateurs industriels')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: 'Universal Music Group', logo: 'UMG', industry: 'Music' },
              { name: 'A24 Films', logo: 'A24', industry: 'Cinema' },
              { name: 'Sony Interactive', logo: 'SIE', industry: 'Gaming' },
              { name: 'Netflix Studios', logo: 'NFX', industry: 'Streaming' },
              { name: 'LVMH Group', logo: 'LVMH', industry: 'Fashion/IP' },
              { name: 'Epic Games', logo: 'EPIC', industry: 'Tech/IP' },
              { name: 'A-Cold-Wall*', logo: 'ACW', industry: 'Design' },
              { name: 'Condé Nast', logo: 'CN', industry: 'Publishing' },
              { name: 'Ubisoft', logo: 'UBI', industry: 'Gaming' },
              { name: 'Paramount+', logo: 'PMT', industry: 'Media' },
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
              <h3 className="text-3xl font-black font-headline uppercase tracking-[0.2em] mb-4">The LYA Unit Standard</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
                LinkYourArt introduces the <span className="text-white font-bold">unique rating index</span> for the creative market. Each <span className="text-primary-cyan font-bold">LYA Unit</span> represents a standardized $50 value of future revenue potential. This peer-to-peer system allows for the exchange of revenue shares based on project advancement and milestones, providing the only objective measure of creative value.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrushSeparator />

      <section className="relative z-10 py-40 max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic">
            The LYA <span className="text-primary-cyan">Scoring System</span>
          </h2>
          <p className="text-on-surface-variant text-lg opacity-80 max-w-2xl mx-auto">
            Our proprietary algorithm evaluates every contract across <span className="text-white font-bold">5 critical notation criteria</span>, 
            providing a transparent and objective <span className="text-primary-cyan">System Yield Index</span> out of 1000.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: 'Project Quality', score: '200', desc: 'Evaluation of artistic merit, historical significance, and creative execution.', color: 'text-primary-cyan', bg: 'bg-primary-cyan/5', border: 'border-primary-cyan/20' },
            { label: 'Marketability', score: '200', desc: 'Analysis of secondary market demand, liquidity potential, and audience reach.', color: 'text-accent-pink', bg: 'bg-accent-pink/5', border: 'border-accent-pink/20' },
            { label: 'Legal Security', score: '200', desc: 'Verification of contractual rights, IP protection, and regulatory compliance.', color: 'text-accent-green', bg: 'bg-accent-green/5', border: 'border-accent-green/20' },
            { label: 'Technical Innovation', score: '200', desc: 'Assessment of technological uniqueness, smart contract complexity, and digital durability.', color: 'text-accent-purple', bg: 'bg-accent-purple/5', border: 'border-accent-purple/20' },
            { label: 'Growth Potential', score: '200', desc: 'Projections of future value appreciation based on market trends and roadmap.', color: 'text-accent-gold', bg: 'bg-accent-gold/5', border: 'border-accent-gold/20' },
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
            "The LYA Score represents the definitive index of a creative contract's living value, updated in real-time through market feedback and periodic institutional audits."
          </p>
        </motion.div>
      </section>

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
            Start <br/>
            <span className="text-primary-cyan">Engagement</span>
          </h2>
          <p className="text-xl text-on-surface-variant mb-12 max-w-xl mx-auto opacity-80">
            Join the institutional creative registry and start trading contract units today.
          </p>
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="px-5 py-2 bg-white text-surface-dim font-black uppercase tracking-[0.3em] hover:bg-primary-cyan transition-all shadow-2xl active:scale-95 text-xs"
          >
            Open Dashboard
          </button>
          
          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-primary-cyan text-right uppercase">
              LYA_SYSTEM_V4.2 <br/>
              ESTABLISHING_LINK...
            </div>
          </div>
        </motion.div>
      </section>

      <BrushSeparator />

      {/* Legal Warning Section */}
      <footer className="relative z-10 py-20 bg-surface-dim px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="text-xs font-mono text-accent-gold uppercase tracking-[0.5em] font-bold">Legal Warning</div>
              <p className="text-sm text-on-surface-variant/60 leading-relaxed">
                LYA Units are indexed contractual rights, and do not constitute shares, financial securities, or regulated investment products. 
                <br/><br/>
                <span className="text-white font-bold uppercase">Important!</span> No promise of yield is guaranteed. 
                The value of your rights can evolve upwards or downwards based on objective indicators. 
                LinkYourArt acts as a trusted third party for analysis and valuation.
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <Logo size={80} className="grayscale opacity-20" />
              <div className="text-[10px] font-mono text-on-surface-variant/30 uppercase tracking-widest text-right">
                © 2026 LINKYOURART <br/>
                INSTITUTIONAL CONTRACT REGISTRY
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
