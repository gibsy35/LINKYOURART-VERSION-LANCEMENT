import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Zap, Target, Users, 
  TrendingUp, Shield, BarChart3, Layers, Globe, 
  Sparkles, CheckCircle2, Clapperboard, Music, 
  LineChart as LineChartIcon, Search, Bell, Lock, ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface Step {
  id: number;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  points: string[];
  illustration: 'welcome' | 'score' | 'creators' | 'investors' | 'professionals' | 'explore' | 'watchlist' | 'invest-smartly' | 'market' | 'security';
}

const TUTORIAL_STEPS: (t: any) => Step[] = (t) => [
  {
    id: 1,
    title: t('WELCOME TO LINKYOURART', 'BIENVENUE SUR LINKYOURART'),
    description: t('The first creative benchmark platform that certifies artistic works through the LYA UNIT — a structured unit of value exclusive to the creative world.', 'La première plateforme de cotation créative qui certifie les œuvres artistiques via le LYA UNIT — une unité de valeur structurée et exclusive au monde de la création.'),
    color: 'text-primary-cyan',
    glowColor: 'rgba(0, 224, 255, 0.3)',
    icon: <Globe size={48} />,
    points: [
      t('OBJECTIVE CERTIFICATION WITH LYA SCORE OUT OF 1000 POINTS', 'CERTIFICATION OBJECTIVE AVEC LE LYA SCORE SUR 1000 POINTS'),
      t('1 LYA UNIT = $50 (FIXED FOUNDING VALUE)', '1 LYA UNIT = $50 (VALEUR FIXE FONDATRICE)'),
      t('6 ARTISTIC UNIVERSES — MUSIC · FILM · FASHION · GAMING · ARCHITECTURE · STAGE', '6 UNIVERS ARTISTIQUES — MUSIQUE · CINÉMA · MODE · JEU · ARCHITECTURE · SCÈNE')
    ],
    illustration: 'welcome'
  },
  {
    id: 2,
    title: t('THE LYA SCORE — 5 PILLARS', 'LE LYA SCORE — 5 PILIERS'),
    description: t('Our proprietary benchmark evaluates each creative work across 5 certified pillars, delivering a transparent quality index out of 1000. Like Moody\'s for finance — but for creative works.', 'Notre étalon propriétaire évalue chaque œuvre selon 5 piliers certifiés, produisant un indice de qualité transparent sur 1000. Comme Moody\'s pour la finance — mais pour la création.'),
    color: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    icon: <Zap size={48} />,
    points: [
      t('01 CONCEPTUAL INTEGRITY · 02 CURRENT MATURITY · 03 GROWTH CAPACITY', '01 INTÉGRITÉ CONCEPTUELLE · 02 MATURITÉ ACTUELLE · 03 CAPACITÉ D\'ÉVOLUTION'),
      t('04 FEASIBILITY · 05 REAL EMBODIMENT — EACH MAX 200 PTS', '04 FAISABILITÉ · 05 INCARNATION RÉELLE — CHACUN MAX 200 PTS'),
      t('TOTAL LYA SCORE OUT OF 1000 — VERIFIABLE & TRANSPARENT', 'LYA SCORE TOTAL SUR 1000 — VÉRIFIABLE & TRANSPARENT')
    ],
    illustration: 'score'
  },
  {
    id: 3,
    title: t('FOR CREATORS', 'POUR LES CRÉATEURS'),
    description: t('Get your creative work officially certified and valued by LinkYourArt. Connect with supporters who believe in your vision from day one.', 'Faites certifier et valoriser officiellement votre œuvre par LinkYourArt. Connectez-vous avec des mécènes qui croient en votre vision dès le premier jour.'),
    color: 'text-emerald-400',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    icon: <Sparkles size={48} />,
    points: [
      t('OFFICIAL LYA CERTIFICATION — YOUR WORK EVALUATED BY EXPERTS', 'CERTIFICATION LYA OFFICIELLE — VOTRE ŒUVRE ÉVALUÉE PAR DES EXPERTS'),
      t('KEEP FULL ARTISTIC CONTROL OF YOUR CREATION', 'CONSERVEZ LE CONTRÔLE ARTISTIQUE TOTAL DE VOTRE CRÉATION'),
      t('BUILD YOUR COMMUNITY OF SUPPORTERS FROM LAUNCH', 'CONSTRUISEZ VOTRE COMMUNAUTÉ DE SOUTIENS DÈS LE LANCEMENT')
    ],
    illustration: 'creators'
  },
  {
    id: 4,
    title: t('FOR SUPPORTERS', 'POUR LES MÉCÈNES'),
    description: t('Support the creative works you believe in and share in their future success. Simple, accessible, meaningful.', 'Soutenez les œuvres créatives en lesquelles vous croyez et partagez leurs succès futurs. Simple, accessible, significatif.'),
    color: 'text-accent-gold',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    icon: <Target size={48} />,
    points: [
      t('ACQUIRE LYA UNITS FROM $50 — ACCESSIBLE TO ALL', 'ACQUÉRIR DES LYA UNITS DÈS $50 — ACCESSIBLE À TOUS'),
      t('CERTIFIED QUALITY — LYA SCORE GUARANTEES SELECTION RIGOR', 'QUALITÉ CERTIFIÉE — LE LYA SCORE GARANTIT LA RIGUEUR DE SÉLECTION'),
      t('FOLLOW YOUR SUPPORTED WORKS IN REAL TIME', 'SUIVEZ VOS ŒUVRES SOUTENUES EN TEMPS RÉEL')
    ],
    illustration: 'investors'
  },
  {
    id: 5,
    title: t('FOR PROFESSIONALS', 'POUR LES PROFESSIONNELS'),
    description: t('Join our network of certified validation experts. Evaluate creative works and contribute to the most rigorous quality benchmark in the creative industry.', 'Rejoignez notre réseau d\'experts en validation certifiés. Évaluez des œuvres créatives et contribuez à l\'étalon de qualité le plus rigoureux du secteur.'),
    color: 'text-pink-400',
    glowColor: 'rgba(244, 114, 182, 0.3)',
    icon: <Users size={48} />,
    points: [
      t('BECOME A CERTIFIED LYA VALIDATION EXPERT', 'DEVENEZ EXPERT LYA EN VALIDATION CERTIFIÉ'),
      t('EVALUATE WORKS ACROSS YOUR FIELD OF EXPERTISE', 'ÉVALUEZ DES ŒUVRES DANS VOTRE DOMAINE D\'EXPERTISE'),
      t('EXCLUSIVE CROSS-INDUSTRY PROFESSIONAL NETWORK', 'RÉSEAU PROFESSIONNEL EXCLUSIF INTER-SECTEURS')
    ],
    illustration: 'professionals'
  },
  {
    id: 6,
    title: t('EXPLORE CREATIVE WORKS', 'EXPLOREZ LES ŒUVRES'),
    description: t('Several ways to discover creative projects across 6 artistic universes — find what resonates with you.', 'Plusieurs façons de découvrir des projets créatifs à travers 6 univers artistiques — trouvez ce qui vous correspond.'),
    color: 'text-cyan-400',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    icon: <Layers size={48} />,
    points: [
      t('SWIPE MODE — QUICK INTUITIVE DISCOVERY', 'MODE SWIPE — DÉCOUVERTE RAPIDE ET INTUITIVE'),
      t('PATRONAGE HUB — SUPPORT YOUR FAVOURITE CREATORS', 'PATRONAGE HUB — SOUTENEZ VOS CRÉATEURS FAVORIS'),
      t('ADVANCED FILTERS BY UNIVERSE, LYA SCORE & RARITY', 'FILTRES AVANCÉS PAR UNIVERS, LYA SCORE & RARETÉ')
    ],
    illustration: 'explore'
  },
  {
    id: 7,
    title: t('YOUR WATCHLIST', 'VOTRE WATCHLIST'),
    description: t('Follow the creative works that matter to you and never miss an update on their LYA SCORE evolution.', 'Suivez les œuvres créatives qui vous importent et ne manquez aucune évolution de leur LYA SCORE.'),
    color: 'text-red-400',
    glowColor: 'rgba(248, 113, 113, 0.3)',
    icon: <Target size={48} />,
    points: [
      t('REAL-TIME LYA SCORE EVOLUTION ALERTS', 'ALERTES D\'ÉVOLUTION DU LYA SCORE EN TEMPS RÉEL'),
      t('LYA UNIT PRICE CHANGE NOTIFICATIONS', 'NOTIFICATIONS DE CHANGEMENT DE VALEUR LYA UNIT'),
      t('PERSONALISED TRACKING OF YOUR SUPPORTED WORKS', 'SUIVI PERSONNALISÉ DE VOS ŒUVRES SOUTENUES')
    ],
    illustration: 'watchlist'
  },
  {
    id: 8,
    title: t('ANALYSE & COMPARE', 'ANALYSEZ & COMPAREZ'),
    description: t('Use professional-grade tools to analyse and compare creative works before supporting them.', 'Utilisez des outils de niveau professionnel pour analyser et comparer les œuvres avant de les soutenir.'),
    color: 'text-indigo-400',
    glowColor: 'rgba(129, 140, 248, 0.3)',
    icon: <BarChart3 size={48} />,
    points: [
      t('DETAILED LYA SCORE BREAKDOWN BY PILLAR', 'DÉTAIL DU LYA SCORE PAR PILIER'),
      t('SIDE-BY-SIDE CREATIVE WORK COMPARISON', 'COMPARAISON D\'ŒUVRES CÔTE À CÔTE'),
      t('PREDICTIVE ANALYTICS POWERED BY AI', 'ANALYSES PRÉDICTIVES PROPULSÉES PAR L\'IA')
    ],
    illustration: 'invest-smartly'
  },
  {
    id: 9,
    title: t('CREATIVE MARKET', 'MARCHÉ CRÉATIF'),
    description: t('The professional space where certified creative works are exchanged between qualified partners with full transparency.', 'L\'espace professionnel où les œuvres certifiées s\'échangent entre partenaires qualifiés en toute transparence.'),
    color: 'text-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    icon: <TrendingUp size={48} />,
    points: [
      t('SECONDARY MARKET (PRO) — RESERVED FOR QUALIFIED PARTNERS', 'MARCHÉ SECONDAIRE (PRO) — RÉSERVÉ AUX PARTENAIRES QUALIFIÉS'),
      t('LYA UNIT PRICES BASED ON CERTIFIED LYA SCORE', 'PRIX LYA UNIT BASÉS SUR LE LYA SCORE CERTIFIÉ'),
      t('MARKET OVERVIEW & PREDICTIVE ANALYTICS', 'VUE D\'ENSEMBLE DU MARCHÉ & ANALYSES PRÉDICTIVES')
    ],
    illustration: 'market'
  },
  {
    id: 10,
    title: t('SECURITY & TRUST', 'SÉCURITÉ & CONFIANCE'),
    description: t('LinkYourArt is built on a foundation of rigorous legal compliance, data protection and creative rights certification.', 'LinkYourArt est bâti sur des fondations de conformité juridique rigoureuse, protection des données et certification des droits créatifs.'),
    color: 'text-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: <Shield size={48} />,
    points: [
      t('GDPR COMPLIANT — END-TO-END DATA PROTECTION', 'CONFORME RGPD — PROTECTION DES DONNÉES DE BOUT EN BOUT'),
      t('CREATIVE RIGHTS LEGALLY CERTIFIED AT EVERY STAGE', 'DROITS CRÉATIFS CERTIFIÉS LÉGALEMENT À CHAQUE ÉTAPE'),
      t('MULTI-FACTOR AUTHENTICATION & SECURE INFRASTRUCTURE', 'AUTHENTIFICATION MULTI-FACTEURS & INFRASTRUCTURE SÉCURISÉE')
    ],
    illustration: 'security'
  }
];

const Illustration: React.FC<{ type: Step['illustration'], color: string }> = ({ type, color }) => {
  const { t } = useTranslation();
  switch (type) {
    case 'welcome':
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
          {/* Enhanced Animated Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i}
                animate={{ 
                  rotate: i % 2 === 0 ? 360 : -360,
                  scale: [1, 1.05, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ 
                  rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute rounded-full border border-primary-cyan/20" 
                style={{ width: `${i * 8 + 10}%`, height: `${i * 8 + 10}%` }} 
              />
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  opacity: 0,
                  scale: 0.5
                }}
                animate={{ 
                  y: ['-10%', '110%'],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 10, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute w-1 h-1 bg-primary-cyan rounded-full blur-[1px]"
              />
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-6 md:gap-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative"
            >
              {/* Rotating Outer Ring - Shrinked for tablet */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 sm:-inset-10 md:-inset-16 border border-primary-cyan/30 rounded-full border-t-primary-cyan border-l-transparent border-r-transparent border-b-transparent shadow-[0_0_20px_rgba(0,224,255,0.2)]"
              />

              <motion.div 
                animate={{ 
                  rotate: 360,
                  boxShadow: ["0 0 40px rgba(0,224,255,0.3)", "0 0 80px rgba(0,224,255,0.6)", "0 0 40px rgba(0,224,255,0.3)"]
                }}
                transition={{ 
                  rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-gradient-to-br from-primary-cyan via-blue-600 to-indigo-900 rounded-full flex items-center justify-center border border-white/30 relative z-10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Globe className="text-white w-6 h-6 sm:w-8 sm:h-8 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] z-20" />
                </motion.div>
                
                {/* Internal Scan lines - More Dynamic */}
                <motion.div 
                  animate={{ y: ['-100%', '100%'], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-cyan/60 to-transparent h-8 w-full z-30"
                />

                {/* Pulsing light */}
                <motion.div 
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary-cyan/20 blur-xl"
                />
              </motion.div>
              
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 sm:-inset-5 md:-inset-8 border-2 border-dashed border-primary-cyan/40 rounded-full"
              />

              {/* Holographic Particles Spreading */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                    duration: 3 + i, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary-cyan/60 rounded-full blur-[1px]"
                  style={{ 
                    marginLeft: `${Math.cos(i * Math.PI / 4) * (60 + i * 10)}px`,
                    marginTop: `${Math.sin(i * Math.PI / 4) * (60 + i * 10)}px`
                  }}
                />
              ))}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: [0, -5, 0],
                opacity: 1 
              }}
              transition={{ 
                delay: 0.5,
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="px-4 md:px-6 py-1.5 md:py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex gap-3 md:gap-4"
            >
              {[
                { label: 'CREATIVE', icon: Sparkles, color: 'text-emerald-400' },
                { label: 'FINANCIAL', icon: TrendingUp, color: 'text-primary-cyan' },
                { label: 'SECURE', icon: Shield, color: 'text-accent-gold' }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-1.5 md:gap-2"
                >
                  <item.icon className={`w-2.5 h-2.5 md:w-3 md:h-3 ${item.color}`} />
                  <span className="text-[6px] md:text-[8px] font-black tracking-widest text-white/60">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      );

    case 'score':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-1 md:gap-2 p-2 overflow-hidden">
          <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                className="stroke-white/5 fill-none"
                strokeWidth="6"
              />
              <motion.circle
                cx="50" cy="50" r="45"
                className="stroke-purple-500 fill-none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="282.7"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: 282.7 * (1 - 0.882) }}
                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  opacity: { delay: 1, duration: 0.5 },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-2xl md:text-4xl font-black text-purple-400 tracking-tighter"
              >
                882
              </motion.div>
              <div className="text-[6px] md:text-[8px] font-black tracking-[0.2em] md:tracking-[0.3em] text-white/60 uppercase">{t('LYA INDEX', 'INDEX LYA')}</div>
              <div className="mt-0.5 md:mt-1 px-1.5 md:px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[4px] md:text-[6px] text-emerald-400 font-bold uppercase tracking-widest">{t('A+ GRADE', 'GRADE A+')}</div>
            </div>
          </div>
          <div className="w-full max-w-[200px] md:max-w-[240px] grid grid-cols-1 gap-1">
            {[
              { label: t('Project Quality', 'Qualité du Projet'), val: '185/200', color: 'bg-purple-400' },
              { label: t('Market Potential', 'Potentiel Marché'), val: '172/200', color: 'bg-blue-400' },
              { label: t('Legal Security', 'Sécurité Juridique'), val: '196/200', color: 'bg-emerald-400' },
              { label: t('Tech Innovation', 'Innovation Tech'), val: '164/200', color: 'bg-indigo-400' },
              { label: t('Growth Potential', 'Potentiel Croissance'), val: '165/200', color: 'bg-rose-400' }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="space-y-0.5 p-1 bg-white/5 border border-white/5 rounded-lg"
              >
                <div className="flex justify-between text-[6px] md:text-[8px] font-black text-white/60">
                  <span className="tracking-widest uppercase truncate max-w-[60%]">{item.label}</span>
                  <span className={`text-white ${item.color.replace('bg-', 'text-')}`}>
                    {item.val}
                  </span>
                </div>
                <div className="h-0.5 md:h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: (parseInt(item.val) / 200 * 100) + '%' }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="mt-2 text-[5px] md:text-[7px] text-white/40 uppercase font-bold text-center leading-tight max-w-[180px] md:max-w-[220px]">
            {t('"The LYA Score represents the definitive index of the living value of a creative contract, updated in real time."', '"Le Score LYA représente l\'index définitif de la valeur vivante d\'un contrat créatif, mis à jour en temps réel."')}
          </p>
        </div>
      );

    case 'creators':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-[240px] md:max-w-[280px] bg-[#0A0F1A] border-2 border-emerald-500/30 rounded-2xl md:rounded-[2rem] p-4 md:p-5 space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 md:p-4">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-widest"
                >
                  Contract ID: #LYA-882-IP
                </motion.div>
                <motion.h4 
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-base md:text-lg font-black text-white tracking-tight uppercase"
                >
                  Renaissance Digital
                </motion.h4>
                <div className="flex gap-2">
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[6px] md:text-[8px] font-bold rounded uppercase"
                  >
                    Legal Certified
                  </motion.span>
                  <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[6px] md:text-[8px] font-bold rounded uppercase">IP Anchored</span>
                </div>
              </div>

              <div className="p-3 md:p-4 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl space-y-2 md:space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5 md:space-y-1">
                    <div className="text-[7px] md:text-[8px] font-black text-white/40 uppercase">{t('Contractual Value', 'Valeur Contractuelle')}</div>
                    <div className="text-lg md:text-xl font-black text-white">$125,000</div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-[7px] md:text-[8px] font-black text-emerald-400 uppercase"
                    >
                      {t('Indexed', 'Indexé')}
                    </motion.div>
                    <div className="text-xs md:text-sm font-black text-emerald-400">882/1000</div>
                  </div>
                </div>
                <div className="h-2 md:h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '88.2%' }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3 pb-1 md:pb-2">
                {[
                  { label: t('Unit Price', 'Prix Unitaire'), value: '$50.00' },
                  { label: t('Total Units', 'Unités Totales'), value: '2,500' }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="bg-white/5 p-2 md:p-2.5 rounded-lg md:rounded-xl"
                  >
                    <div className="text-[6px] md:text-[7px] text-white/40 font-black uppercase mb-0.5 md:mb-1">{item.label}</div>
                    <div className="text-[10px] md:text-xs font-black text-white">{item.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      );

    case 'investors':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[260px] md:max-w-[300px] space-y-3 md:space-y-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/40 border-2 border-accent-gold/30 rounded-[1.2rem] md:rounded-2xl p-3 md:p-4 relative overflow-hidden backdrop-blur-xl shadow-[0_0_40px_rgba(255,215,0,0.1)]"
            >
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="space-y-0.5">
                  <div className="text-[7px] md:text-[9px] font-black text-accent-gold/60 uppercase tracking-widest">{t('Portfolio Value', 'Valeur Portfolio')}</div>
                  <div className="text-lg md:text-2xl font-black text-accent-gold tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">$42,850.00</div>
                  <div className="flex items-center gap-1 text-accent-gold font-bold text-[8px] md:text-[10px]">
                    <TrendingUp size={10} /> +24.58% {t('Performance', 'Performance')}
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-gold text-surface-dim rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                  <Target size={20} />
                </div>
              </div>

              <div className="h-20 md:h-24 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 0 80 Q 50 85 100 50 T 200 60 T 300 10"
                    fill="url(#chartGradient)"
                    stroke="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                  <motion.path
                    d="M 0 80 Q 50 85 100 50 T 200 60 T 300 10"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  <motion.circle
                    r="5"
                    fill="#FFD700"
                    stroke="white"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ cx: 300, cy: 10, scale: 1 }}
                    transition={{ delay: 2 }}
                    className="shadow-xl"
                  />
                </svg>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { label: t('Royalties Paid', 'Royalties Payées'), value: '$2,450.00', color: 'text-accent-gold' },
                { label: t('LYA Index Avg', 'Moyenne Index LYA'), value: '842.00', color: 'text-white' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl space-y-0.5 md:space-y-1"
                >
                  <div className="text-[8px] md:text-[9px] font-black text-white/40 uppercase">{item.label}</div>
                  <div className={`text-sm md:text-lg font-black ${item.color}`}>{item.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'professionals':
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full h-full max-w-[360px] md:max-w-[400px]">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center shadow-[0_0_100px_rgba(244,114,182,0.15)]"
            >
              <div className="w-24 h-24 md:w-40 md:h-40 bg-pink-500/10 rounded-full blur-2xl md:blur-3xl" />
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 md:-inset-16 border-2 border-dashed border-pink-500/20 rounded-full"
                />
                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0A0F1A] border-2 md:border-4 border-pink-500/40 rounded-xl md:rounded-[2rem] flex flex-col items-center justify-center z-20 shadow-2xl relative">
                  <Users className="text-pink-400 w-6 h-6 md:w-10 md:h-10 mb-0.5 md:mb-1" />
                  <span className="text-[6px] md:text-[8px] font-black text-white uppercase tracking-tighter">{t('EXPERT', 'EXPERT')}</span>
                </div>
              </div>
            </div>

            {[
              { label: t('EXPERT', 'EXPERT'), icon: Sparkles, x: -30, y: -30, sub: t('Board Certified', 'Certifié par le Conseil') },
              { label: t('LEGAL', 'JURIDIQUE'), icon: Shield, x: 30, y: -22, sub: t('Compliance Unit', 'Unité de Conformité') },
              { label: t('FINANCE', 'FINANCE'), icon: TrendingUp, x: -28, y: 32, sub: t('Risk Analysis', 'Analyse des Risques') },
              { label: t('CREATIVE', 'CRÉATIF'), icon: Clapperboard, x: 30, y: 28, sub: t('Industry Pro', 'Professionnel de l\'Industrie') }
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -4, 0]
                }}
                transition={{ 
                  delay: i * 0.15 + 0.5,
                  y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute flex flex-col items-center gap-1 md:gap-1.5 group z-30"
                style={{ left: `${50 + node.x}%`, top: `${50 + node.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="p-1.5 md:p-3 bg-black/80 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/20 shadow-2xl group-hover:border-pink-500/50 transition-colors">
                  <node.icon className="w-3 h-3 md:w-5 md:h-5 text-pink-400" />
                </div>
                <div className="text-center pointer-events-none bg-black/40 backdrop-blur-sm px-1.5 rounded-md mt-1">
                  <div className="text-[6px] md:text-[8px] font-black text-white uppercase">{node.label}</div>
                  <div className="text-[4px] md:text-[5px] font-bold text-white/60 uppercase tracking-widest">{node.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case 'explore':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
          <div className="relative w-full max-w-[220px] md:max-w-[240px] h-[260px] md:h-[280px]">
            {[1, 0].map((i) => (
              <motion.div
                key={i}
                initial={{ x: i * 15, y: i * 10, opacity: 0, rotate: i * 2 }}
                animate={{ 
                  x: i * 15, 
                  y: i * 10, 
                  opacity: 1 - i * 0.3, 
                  rotate: i * 2,
                  scale: [1, 0.98, 1]
                }}
                transition={{
                  scale: { duration: 4, repeat: Infinity, delay: i * 2 }
                }}
                className="absolute inset-0 bg-[#0A0F1A] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-cyan-600/30 to-blue-900/30 rounded-lg md:rounded-xl overflow-hidden mb-2 md:mb-3 shrink-0">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {i === 0 ? <Music className="text-cyan-400 w-8 h-8 md:w-12 md:h-12 opacity-40" /> : <Clapperboard className="text-blue-400 w-8 h-8 md:w-12 md:h-12 opacity-40" />}
                      </motion.div>
                   </div>
                   <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                     <span className="text-[7px] md:text-[8px] font-black text-white uppercase">Trending</span>
                   </div>
                </div>

                <div className="space-y-1 md:space-y-2 flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5 min-w-0">
                       <h5 className="text-[10px] md:text-xs font-black text-white uppercase tracking-tighter truncate">Cyber-Neo 808</h5>
                       <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase block truncate">Music Royalty Rights</span>
                    </div>
                    <div className="text-right shrink-0">
                       <motion.div 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-primary-cyan text-[10px] md:text-xs font-black underline drop-shadow-[0_0_10px_rgba(0,224,255,0.4)]"
                      >
                        884 Index
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white/5 p-1 md:p-1.5 rounded-lg border border-white/5">
                      <div className="text-[5px] md:text-[6px] text-white/40 font-black uppercase">Asset Type</div>
                      <div className="text-[7px] md:text-[9px] font-bold text-white truncate">LYA RIGHTS</div>
                    </div>
                    <div className="bg-white/5 p-1 md:p-1.5 rounded-lg border border-white/5">
                      <div className="text-[5px] md:text-[6px] text-white/40 font-black uppercase">Min entry</div>
                      <div className="text-[7px] md:text-[9px] font-bold text-white">$50.00</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 font-black uppercase text-[7px] md:text-[8px] tracking-widest active:scale-95 transition-transform cursor-pointer">
              <span className="text-[10px] md:text-xs opacity-50">✕</span> DISCARD
            </div>
            <div className="flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-black uppercase text-[7px] md:text-[8px] tracking-widest active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              INVEST <span className="text-[10px] md:text-xs">♥</span>
            </div>
          </div>
        </div>
      );

    case 'watchlist':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#0A0F1A] border-2 border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="bg-red-500/10 p-5 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Real-Time Alerts</span>
              </div>
              <div className="text-[8px] text-white/40 uppercase font-black tracking-widest">Active Feed</div>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'PULSE OF THE FUTURE', price: '$50.00', change: '+12.5%', details: 'Liquidity Added', up: true },
                { label: 'INDIE FILM #42', price: '$850.00', change: '-4.2%', details: 'Audit Updated', up: false },
                { label: 'VINYL REISSUE', price: '$125.00', change: '+8.1%', details: 'Milestone 2 Secured', up: true }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.5 }}
                  className="flex flex-col gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <motion.div 
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        className="text-sm font-black text-white uppercase italic tracking-tight truncate"
                      >
                        {item.label}
                      </motion.div>
                      <div className="text-[10px] text-white/40 font-bold uppercase truncate">{item.details}</div>
                    </div>
                    <div className={`text-right shrink-0 ${item.up ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}`}>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-sm italic font-black"
                      >
                        {item.change}
                      </motion.div>
                      <div className="text-[9px] text-white/30 uppercase font-black">{item.price}</div>
                    </div>
                  </div>
                  {i === 0 && (
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                       <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full w-24 bg-primary-cyan/40" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'invest-smartly':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3 md:p-4 bg-gradient-to-br from-indigo-900/10 to-transparent">
          <div className="w-full max-w-[320px] md:max-w-[360px] space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Project Alpha', score: '884', roi: '+34%', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { title: 'Project Beta', score: '762', roi: '+18%', color: 'text-blue-400', bg: 'bg-blue-500/10' }
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ 
                    y: [0, -3, 0],
                    opacity: 1 
                  }}
                  transition={{ 
                    delay: i * 0.15,
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }
                  }}
                  className="bg-[#0A0F1A] border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl space-y-2 shadow-2xl relative"
                >
                   <div className="flex justify-between items-center">
                     <div className={`w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center ${p.color}`}>
                        <TrendingUp size={16} />
                     </div>
                     <span className={`text-[8px] md:text-[10px] font-black italic ${p.color}`}>{p.score} LYA</span>
                   </div>
                   <div className="space-y-0.5">
                     <h6 className="text-[7px] md:text-[8px] font-black text-white/40 uppercase tracking-widest truncate">{p.title}</h6>
                     <div className="text-xs md:text-sm font-black text-white italic tracking-tighter">
                      {p.roi} ROI
                    </div>
                   </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#0A0F1A] border border-white/10 p-4 md:p-5 rounded-2xl md:rounded-[2rem] space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-end h-20 md:h-24 gap-2 relative z-10">
                {[60, 45, 85, 30, 95, 70, 55, 80].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: [`${h}%`, `${h+5}%`, `${h}%`] }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      height: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
                    }}
                    className={`w-full rounded-t-md ${i % 2 === 0 ? 'bg-indigo-500/40' : 'bg-blue-500/40'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 relative z-10">
                 <div className="text-[7px] font-black text-white/40 uppercase tracking-widest">Index Variance 2.4</div>
                 <div className="flex gap-1.5">
                   <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                      <span className="text-[6px] text-white/60 font-bold">A</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                      <span className="text-[6px] text-white/60 font-bold">B</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'market':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#03060B] border-2 border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="bg-amber-500/10 p-5 flex justify-between items-center border-b border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-3">
                 <TrendingUp className="text-amber-400 w-6 h-6" />
                 <span className="text-xs font-black text-white uppercase italic tracking-widest">{t('LYA Exchange Center', 'Centre d\'Échanges LYA')}</span>
               </div>
               <div className="px-3 py-1 bg-black/60 rounded-full border border-white/10 text-[9px] font-black text-amber-400 italic">{t('2.4% Spread', 'Spread 2.4%')}</div>
            </div>

            <div className="p-1">
              {[
                { id: '#LYA-812', price: '$600.00', qty: t('12 Units', '12 Unités'), totalLabel: t('Total:', 'Total :'), type: 'SELL', color: 'text-rose-400' },
                { id: '#LYA-445', price: '$400.00', qty: t('8 Units', '8 Unités'), totalLabel: t('Total:', 'Total :'), type: 'BUY', color: 'text-cyan-400' },
                { id: '#LYA-901', price: '$200.00', qty: t('4 Units', '4 Unités'), totalLabel: t('Total:', 'Total :'), type: 'SELL', color: 'text-rose-400' },
                { id: '#LYA-228', price: '$1,000.00', qty: t('20 Units', '20 Unités'), totalLabel: t('Total:', 'Total :'), type: 'BUY', color: 'text-cyan-400' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: [0, i % 2 === 0 ? 2 : -2, 0],
                  }}
                  transition={{ 
                    delay: i * 0.1 + 0.5,
                    x: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
                  }}
                  className={`flex justify-between items-center p-3 md:p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer group`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-amber-500/30"
                    >
                       <LineChartIcon className="text-white/20 group-hover:text-amber-400 w-4 h-4 md:w-6 md:h-6 transition-colors" />
                    </motion.div>
                    <div className="min-w-0">
                      <div className="text-[10px] md:text-xs font-black text-white italic tracking-tighter uppercase truncate">{item.id}</div>
                      <div className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.qty}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[7px] md:text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">{item.totalLabel}</div>
                    <motion.div 
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs md:text-base font-black text-white tracking-widest leading-none"
                    >
                      {item.price}
                    </motion.div>
                    <div className={`text-[7px] md:text-[9px] font-black tracking-[0.2em] uppercase italic mt-1 ${item.type === 'BUY' ? 'text-cyan-400' : 'text-rose-400'}`}>{item.type} ORDER</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'security':
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-[320px] md:max-w-[440px] flex items-center justify-center">
            {/* Pulsing Core Flux */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.4, 1],
                 opacity: [0.1, 0.3, 0.1],
                 rotate: [0, 90, 0]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="absolute w-40 h-40 md:w-64 md:h-64 bg-emerald-500/10 rounded-full blur-[80px]"
            />

            {/* Kinetic Energy Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="rgba(16, 185, 129, 0.8)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {[
                { x: -35, y: -35 },
                { x: 35, y: -15 },
                { x: 0, y: 40 }
              ].map((pos, i) => (
                <g key={i}>
                  {/* Fixed connection line */}
                  <line
                    x1="50%" y1="50%"
                    x2={`${50 + pos.x}%`} y2={`${50 + pos.y}%`}
                    stroke="rgba(16, 185, 129, 0.15)"
                    strokeWidth="2"
                  />
                  {/* Pulse flow animation */}
                  <motion.circle
                    r="3"
                    fill="#10b981"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: i * 0.6
                    }}
                    style={{ 
                      offsetPath: `path('M ${50}% ${50}% L ${50 + pos.x}% ${50 + pos.y}%')`,
                      filter: "drop-shadow(0 0 5px #10b981)" 
                    }}
                  />
                </g>
              ))}
            </svg>

            {/* Central Point: HYPER-SECURE HUB */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-20"
            >
              <div className="relative group">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-20 h-20 md:w-32 md:h-32 bg-[#050505] border-4 border-emerald-500/40 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] overflow-hidden"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-20"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.4),transparent)]" />
                  </motion.div>
                  
                  <Shield className="text-emerald-400 w-8 h-8 md:w-16 md:h-16 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] mb-2 relative z-10" />
                  <div className="text-emerald-400 font-black italic tracking-tighter uppercase text-[6px] md:text-[10px] bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 relative z-10">
                     {t('VAULT_CORE', 'COEUR_COFFRE')}
                  </div>
                  
                  {/* Scan bar */}
                  <motion.div 
                    animate={{ y: ['-150%', '150%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-emerald-400/30 h-1 w-full z-20 shadow-[0_0_15px_#10b981]"
                  />
                </motion.div>

                {/* Satellite rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-emerald-500/20 rounded-full border-dashed"
                />
              </div>
            </motion.div>

            {/* Three Strategic Node Points */}
            {[
              { label: t('ENCRYPTED', 'CHIFFRÉ'), icon: Lock, x: -35, y: -35, theme: 'emerald' },
              { label: t('2FA_SECURE', '2FA_ACTIF'), icon: ShieldCheck, x: 35, y: -15, theme: 'emerald' },
              { label: t('KYC_VERIFIED', 'ID_VÉRIFIÉE'), icon: Users, x: 0, y: 40, theme: 'emerald' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: `${item.x}%`, 
                  y: `${item.y}%`,
                  scale: 1
                }}
                transition={{ 
                  delay: 0.8 + i * 0.2,
                  scale: { duration: 0.6, type: 'spring', damping: 12 }
                }}
                className="absolute z-30"
              >
                <motion.div
                  animate={{ 
                    y: [0, -6, 0],
                    filter: ["drop-shadow(0 0 10px rgba(16,185,129,0.2))", "drop-shadow(0 0 25px rgba(16,185,129,0.5))", "drop-shadow(0 0 10px rgba(16,185,129,0.2))"]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: i * 0.7
                  }}
                  className="bg-black/95 backdrop-blur-3xl border-2 border-emerald-500/60 px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-3 shadow-2xl relative group cursor-help"
                >
                  <div className="w-6 h-6 md:w-9 md:h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/40 transition-colors">
                    <item.icon className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 leading-none">{item.label}</span>
                    <span className="text-[6px] md:text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">{t('PROTECTION_ACTIVE', 'PROTECTION_ACTIVE')}</span>
                  </div>
                  
                  {/* Energy corner highlights */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-lg" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      );
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptTutorial: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const steps = TUTORIAL_STEPS(t);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleClose = () => {
    onClose();
    // Use timeout to ensure state change to HOME happens first if needed
    setTimeout(() => {
      const element = document.getElementById('discover-projects');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-6 bg-black/98 backdrop-blur-2xl"
      >
        <div className="relative w-full max-w-6xl bg-[#020408]/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[98vh] md:max-h-[90vh]">
          
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden z-20">
            <motion.div 
               animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
               className={`h-full ${step.color.replace('text-', 'bg-')} transition-all duration-700 shadow-[0_0_10px_rgba(0,224,255,0.4)]`}
            />
          </div>

          {/* Header */}
          <div className="px-4 md:px-6 pt-2 md:pt-4 flex items-center justify-between relative shrink-0 z-20">
            <div className="flex items-center gap-2 md:gap-4">
              <div className={`px-3 md:px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50`}>
                STEP {currentStep + 1} / {steps.length}
              </div>

              {/* Enhanced Language Toggle */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-white/10">
                {['EN', 'FR'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as any)}
                    className={`w-6 h-6 flex items-center justify-center text-[7px] font-black transition-all rounded-full ${
                      language === lang 
                        ? 'bg-primary-cyan text-surface-dim' 
                        : 'text-on-surface-variant/60 hover:text-white'
                    }`}
                  >
                   {lang}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 min-h-0 p-3 md:p-6 lg:p-8 flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-8 lg:gap-12 items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-3 md:space-y-4 lg:space-y-8 w-full flex flex-col justify-center overflow-hidden"
              >
                <div className="space-y-1 md:space-y-3">
                  <div className={`inline-flex items-center justify-center p-1.5 md:p-2.5 rounded-lg bg-white/5 border border-white/10 ${step.color} shrink-0`}>
                    <div className="w-4 h-4 md:w-7 md:h-7 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-0.5 md:space-y-1">
                    <h2 className={`text-lg md:text-xl lg:text-4xl font-black uppercase italic tracking-tighter ${step.color} drop-shadow-lg leading-tight`}>
                      {step.title}
                    </h2>
                    <p className="text-[10px] md:text-xs lg:text-base text-on-surface-variant/80 font-medium leading-relaxed max-w-md line-clamp-2 md:line-clamp-none">
                      {step.description}
                    </p>
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-1.5 md:gap-2.5 w-full">
                  {step.points.map((point, i) => (
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex items-center gap-1.5 md:gap-3 p-1 md:p-2 bg-black/30 border border-white/5 rounded-xl text-left hover:border-white/10 transition-colors"
                    >
                      <div className={`w-3.5 h-3.5 md:w-6 md:h-6 shrink-0 rounded-full flex items-center justify-center text-[6px] md:text-[10px] font-black italic border bg-black/60 shadow-lg ${step.color.replace('text-', 'border-')} ${step.color}`}>
                        {i + 1}
                      </div>
                      <span className="text-[7px] md:text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.1em] leading-tight">
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`illustration-${currentStep}`}
                initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
                className="w-full h-full min-h-0 flex items-center justify-center relative"
              >
                <div className="w-full h-full flex items-center justify-center transition-transform duration-500">
                  <Illustration type={step.illustration} color={step.color} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-1 px-3 md:px-5 flex flex-col items-center gap-0 bg-[#020408] backdrop-blur-3xl border-t border-white/5 shrink-0 z-10 transition-all">
            {/* Minimal Progress Dots */}
            <div className="hidden md:flex gap-1 mb-0.5 mt-0.5">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-500 cursor-pointer ${i === currentStep ? `w-6 ${step.color.replace('text-', 'bg-')}` : 'w-1.5 bg-white/10 hover:bg-white/20'}`}
                  onClick={() => setCurrentStep(i)}
                />
              ))}
            </div>

            <div className="w-full flex items-center justify-between gap-1 h-8 md:h-10">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg font-black uppercase text-[7px] md:text-[9px] tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 invisible' : 'bg-white/5 hover:bg-white/10 text-white active:scale-95'}`}
              >
                <ChevronLeft size={10} /> {t('Back', 'Retour')}
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClose}
                  className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors p-1"
                >
                  {t('Skip', 'Passer')}
                </button>

                <button 
                  onClick={handleNext}
                  className={`flex items-center justify-center gap-1.5 md:gap-3 px-3 md:px-5 py-1 md:py-1.5 rounded-lg font-black uppercase text-[8px] md:text-[11px] tracking-[0.05em] md:tracking-[0.1em] transition-all active:scale-95 shadow-[0_0_10px_rgba(0,224,255,0.1)] relative group overflow-hidden ${step.color.replace('text-', 'bg-')} text-black min-w-[80px] md:min-w-[140px] border border-white/5`}
                >
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative z-10 flex items-center gap-1 text-black font-black">
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle2 size={10} className="md:w-3.5 md:h-3.5" /> {t('GET STARTED', 'C\'EST PARTI !')}
                      </>
                    ) : (
                      <>
                        {t('NEXT', 'SUIVANT')} <ChevronRight size={10} className="md:w-3.5 md:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


