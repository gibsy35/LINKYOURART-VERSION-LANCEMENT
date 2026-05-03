import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Zap, Target, Users, TrendingUp, Shield, BarChart3, Layers, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface Step {
  id: number;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  points: string[];
}

const TUTORIAL_STEPS: (t: any) => Step[] = (t) => [
  {
    id: 1,
    title: t('tutorial.step1.title', 'Welcome to LinkYourArt'),
    description: t('tutorial.step1.desc', 'The first investment platform that transforms creative projects into living and listed assets'),
    color: 'text-primary-cyan',
    glowColor: 'rgba(0, 224, 255, 0.3)',
    icon: <Globe size={48} className="text-primary-cyan" />,
    points: [
      t('tutorial.step1.p1', 'Triangular ecosystem: Creators, Investors & Creative industry professionals'),
      t('tutorial.step1.p2', 'Objective listing with LYA score out of 1000 points'),
      t('tutorial.step1.p3', 'P2P Marketplace to trade your shares')
    ]
  },
  {
    id: 2,
    title: t('tutorial.step2.title', 'What is the LYA Score?'),
    description: t('tutorial.step2.desc', 'A revolutionary algorithm that evaluates each project on 1000 points in an objective and transparent manner'),
    color: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    icon: <Zap size={48} className="text-purple-400" />,
    points: [
      t('tutorial.step2.p1', '40% - Evaluation by creative sector experts + complementary AI'),
      t('tutorial.step2.p2', '30% - Social and community engagement'),
      t('tutorial.step2.p3', '30% - Market performance and indicators')
    ]
  },
  {
    id: 3,
    title: t('tutorial.step3.title', 'For Creators'),
    description: t('tutorial.step3.desc', 'Submit your creative projects and obtain transparent financing'),
    color: 'text-emerald-400',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    icon: <Sparkles size={48} className="text-emerald-400" />,
    points: [
      t('tutorial.step3.p1', 'Professional evaluation by industry experts'),
      t('tutorial.step3.p2', 'Fast and transparent financing'),
      t('tutorial.step3.p3', 'Keep total creative control of your projects')
    ]
  },
  {
    id: 4,
    title: t('tutorial.step4.title', 'For Investors'),
    description: t('tutorial.step4.desc', 'Buy indexed contractual rights of promising creative projects'),
    color: 'text-accent-gold',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    icon: <Target size={48} className="text-accent-gold" />,
    points: [
      t('tutorial.step4.p1', 'Transparent listing based on the LYA score'),
      t('tutorial.step4.p2', 'Diversify your portfolio in art'),
      t('tutorial.step4.p3', 'Trade your shares on the P2P market')
    ]
  },
  {
    id: 5,
    title: t('For Professionals', 'Pour les Professionnels'),
    description: t('Evaluate creative projects and enhance your expertise', 'Évaluez les projets créatifs et valorisez votre expertise'),
    color: 'text-pink-400',
    glowColor: 'rgba(244, 114, 182, 0.3)',
    icon: <Users size={48} className="text-pink-400" />,
    points: [
      t('Recognized and valued expertise', 'Expertise reconnue et valorisée'),
      t('Support emerging talents', 'Accompagnez les talents émergents'),
      t('Exclusive professional network', 'Réseau professionnel exclusif')
    ]
  },
  {
    id: 6,
    title: t('Explore Projects', 'Explorez les projets'),
    description: t('Several ways to discover creative projects that match you', 'Plusieurs façons de découvrir les projets créatifs qui vous correspondent'),
    color: 'text-cyan-400',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    icon: <Layers size={48} className="text-cyan-400" />,
    points: [
      t('Swipe Mode for quick discovery', 'Mode Swipe pour découvrir rapidement'),
      t('LYA Exchange Center to follow trends', 'Centre d\'Échanges LYA pour suivre les tendances'),
      t('Advanced filters by category, score, budget', 'Filtres avancés par catégorie, score, budget')
    ]
  },
  {
    id: 7,
    title: t('Create your Watchlist', 'Créez votre Watchlist'),
    description: t('Follow your favorite projects and never miss an opportunity', 'Suivez vos projets favoris et ne manquez aucune opportunité'),
    color: 'text-red-400',
    glowColor: 'rgba(248, 113, 113, 0.3)',
    icon: <Target size={48} className="text-red-400" />,
    points: [
      t('Real-time performance notifications', 'Notifications temps réel sur performances'),
      t('Price listing change alerts', 'Alertes sur changements de cotation'),
      t('Personalized portfolio tracking', 'Suivi personnalisé de votre portfolio')
    ]
  },
  {
    id: 8,
    title: t('Invest Smartly', 'Investissez intelligemment'),
    description: t('Analyze data and invest in projects that suit you', 'Analysez les données et investissez dans les projets qui vous correspondent'),
    color: 'text-indigo-400',
    glowColor: 'rgba(129, 140, 248, 0.3)',
    icon: <BarChart3 size={48} className="text-indigo-400" />,
    points: [
      t('Detailed analytical dashboards', 'Tableaux de bord analytiques détaillés'),
      t('Side-by-side project comparison', 'Comparaison de projets côte à côte'),
      t('Full performance history', 'Historique complet des performances')
    ]
  },
  {
    id: 9,
    title: t('tutorial.step9.title', 'Integrated P2P Market'),
    description: t('tutorial.step9.desc', 'Trade your contractual rights with immediate liquidity'),
    color: 'text-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    icon: <TrendingUp size={48} className="text-amber-400" />,
    points: [
      t('tutorial.step9.p1', 'Transaction fees between 2 and 5%'),
      t('tutorial.step9.p2', 'Prices based on objective LYA listing'),
      t('tutorial.step9.p3', 'Secured smart contracts')
    ]
  },
  {
    id: 10,
    title: t('Security & Compliance', 'Sécurité & Conformité'),
    description: t('Secure platform with GDPR compliance and strict legal framework', 'Plateforme sécurisée avec conformité RGPD et cadre légal strict'),
    color: 'text-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: <Shield size={48} className="text-emerald-500" />,
    points: [
      t('End-to-end encryption of all data', 'Chiffrement end-to-end de toutes les données'),
      t('Multi-factor authentication (2FA)', 'Authentification multi-facteurs (2FA)'),
      t('Certified contractual rights and KYC/AML', 'Droits contractuels certifiés et KYC/AML')
    ]
  }
];

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
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-xl"
      >
        <div className="relative w-full max-w-2xl bg-surface-low/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
          
          {/* Progress Header */}
          <div className="px-6 pt-5 flex flex-col md:flex-row items-center justify-center gap-3 relative shrink-0">
            <div className={`px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/50`}>
              {currentStep + 1} / {steps.length}
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10 md:absolute md:left-6">
              <Globe size={10} className="text-primary-cyan" />
              <button 
                onClick={() => setLanguage('EN')}
                className={`text-[8px] font-black uppercase tracking-widest transition-colors ${language === 'EN' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'}`}
              >
                EN
              </button>
              <div className="w-[1px] h-2 bg-white/10" />
              <button 
                onClick={() => setLanguage('FR')}
                className={`text-[8px] font-black uppercase tracking-widest transition-colors ${language === 'FR' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'}`}
              >
                FR
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-5 right-6 p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all z-50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <X size={18} />
          </button>

          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
            <motion.div 
               animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
               className={`h-full ${step.color.replace('text-', 'bg-')} transition-all duration-700 shadow-[0_0_10px_rgba(0,224,255,0.4)]`}
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4 md:space-y-6 w-full max-w-lg mx-auto"
              >
                <div className="relative inline-block mx-auto flex justify-center scale-90 md:scale-100">
                  <div className={`absolute -inset-6 blur-2xl rounded-full opacity-30 transition-colors duration-700`} style={{ backgroundColor: step.glowColor }} />
                  <div className="relative bg-white/5 p-4 md:p-5 rounded-full border border-white/10 shadow-xl backdrop-blur-sm">
                    {React.cloneElement(step.icon as React.ReactElement<any>, { size: 36 })}
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <h2 className={`text-lg md:text-2xl font-black uppercase italic tracking-tighter ${step.color} drop-shadow-lg leading-tight`}>
                    {step.title}
                  </h2>
                  <p className="text-[10px] md:text-sm text-on-surface-variant font-medium leading-relaxed opacity-80 mx-auto max-w-sm">
                    {step.description}
                  </p>
                </div>

                <ul className="space-y-2 w-full">
                  {step.points.map((point, i) => (
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black italic border ${step.color.replace('text-', 'border-')} ${step.color}`}>
                        {i + 1}
                      </div>
                      <span className="text-[10px] md:text-[11px] font-bold text-white/90 uppercase tracking-tight leading-snug">
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6 bg-surface-low/50 border-t border-white/5 shrink-0">
            {/* Progress Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-500 ${i === currentStep ? `w-5 ${step.color.replace('text-', 'bg-')}` : 'bg-white/10'}`}
                />
              ))}
            </div>

            <div className="w-full flex items-center justify-between gap-4">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 invisible' : 'bg-white/5 hover:bg-white/10 text-white active:scale-95'}`}
              >
                <ChevronLeft size={14} /> {t('Back', 'Retour')}
              </button>

              <button 
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors p-2"
              >
                {t('Skip', 'Passer')}
              </button>

              <button 
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl ${step.color.replace('text-', 'bg-')} text-surface-dim hover:bg-white`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle2 size={16} /> {t('Get Started!', 'C\'est parti !')}
                  </>
                ) : (
                  <>
                    {t('Next', 'Suivant')} <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
