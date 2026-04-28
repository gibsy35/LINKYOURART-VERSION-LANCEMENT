
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Activity, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const OnboardingGuide: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem('lya_onboarding_dismissed');
  });
  const [step, setStep] = useState(0);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('lya_onboarding_dismissed', 'true');
  };

  const steps = [
    {
      title: t("ASSET INDEXING", "INDEXATION D'ACTIF"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Creators submit projects for institutional audit and LYA Score calculation. This is where creative equity begins its journey into the financial ecosystem.", "Les créateurs soumettent leurs projets pour un audit institutionnel et le calcul du Score LYA. C'est ici que l'équité créative commence son voyage dans l'écosystème financier."),
      icon: Layers,
      color: "text-primary-cyan",
      bgColor: "bg-primary-cyan/10"
    },
    {
      title: t("LEGAL VALIDATION", "VALIDATION LÉGALE"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Our protocol verifies IP rights and contractual robustness across jurisdictions. We ensure every unit is backed by solid legal frameworks.", "Notre protocole vérifie les droits de PI et la robustesse contractuelle à travers les juridictions. Nous garantissons que chaque unité est soutenue par des cadres juridiques solides."),
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10"
    },
    {
      title: t("UNIT ISSUANCE", "ÉMISSION D'UNITÉS"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Contracts are divided into tradable LYA Units. This fractionalization allows for unprecedented liquidity in the creative market.", "Les contrats sont divisés en unités LYA négociables. Cette fractionnalisation permet une liquidité sans précédent sur le marché de la création."),
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10"
    },
    {
      title: t("GLOBAL REGISTRY", "REGISTRE MONDIAL"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Assets are listed on the LYA Institutional Registry. Global visibility meets institutional transparency for every creative asset.", "Les actifs sont listés sur le Registre Institutionnel LYA. La visibilité mondiale rencontre la transparence institutionnelle pour chaque actif créatif."),
      icon: Globe,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      title: t("REAL-TIME YIELD", "RENDEMENT TEMPS RÉEL"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Track performance and revenue shares through our live indexing engine. Watch your creative equity grow in real-time.", "Suivez la performance et les parts de revenus via notre moteur d'indexation en direct. Regardez votre équité créative croître en temps réel."),
      icon: Activity,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10"
    },
    {
      title: t("P2P EXCHANGE", "ÉCHANGE P2P"),
      subtitle: t("INSTITUTIONAL PROTOCOL", "PROTOCOLE INSTITUTIONNEL"),
      content: t("Trade units 24/7 on the secondary market. Institutional liquidity at your fingertips, powered by atomic settlement.", "Échangez des unités 24/7 sur le marché secondaire. La liquidité institutionnelle à portée de main, propulsée par un règlement atomique."),
      icon: RefreshCw,
      color: "text-primary-cyan",
      bgColor: "bg-primary-cyan/10"
    }
  ];

  if (!isVisible) return null;

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-surface-dim/95 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar bg-surface-low border border-white/10 relative flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[3rem]"
        >
          {/* Language Toggle */}
          <div className="absolute top-4 left-6 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10">
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

          {/* Close Button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-6 text-on-surface-variant/40 hover:text-primary-cyan transition-colors z-30"
          >
            <X size={20} />
          </button>

          {/* Visual Area - Smaller */}
          <div className="w-full h-40 relative flex items-center justify-center overflow-hidden bg-surface-low/50 border-b border-white/10">
            <div className="relative z-10">
              <motion.div 
                key={step}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-20 h-20 rounded-2xl bg-surface-dim border border-white/10 flex items-center justify-center relative shadow-xl"
              >
                <currentStep.icon size={32} className={`${currentStep.color}`} />
              </motion.div>
            </div>
            <div className={`absolute inset-0 opacity-10 blur-[60px] transition-colors duration-1000 ${currentStep.bgColor}`} />
          </div>

          {/* Content Area - Compact */}
          <div className="p-8 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-[8px] font-black text-primary-cyan uppercase tracking-widest">
                    {t(`PHASE ${step + 1} / ${steps.length}`, `PHASE ${step + 1} / ${steps.length}`)}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                  {currentStep.title}
                </h2>

                <p className="text-sm text-on-surface-variant leading-relaxed font-medium mb-8">
                  {currentStep.content}
                </p>

                <div className="flex gap-3">
                  {step > 0 && (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      {t('BACK', 'RETOUR')}
                    </button>
                  )}
                  
                  {step < steps.length - 1 ? (
                    <button 
                      onClick={() => setStep(step + 1)}
                      className="flex-1 px-4 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2 group"
                    >
                      {t('NEXT', 'SUIVANT')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleDismiss}
                      className="flex-1 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                      {t('BEGIN', 'COMMENCER')} <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Compliance Badges - Hidden on very small screens or made smaller */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em]">MICA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary-cyan" />
                <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em]">SEC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-amber-500" />
                <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em]">INSTITUTIONAL</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
