
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Layers, 
  Activity, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  phase: string;
}

export const InstitutionalTutorial: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('lya_tutorial_completed');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const steps: TutorialStep[] = [
    {
      id: 1,
      phase: 'PHASE 1 / 6',
      title: t('ASSET INDEXING', 'INDEXATION DES ACTIFS'),
      description: t('Creators submit projects for institutional audit and LYA Score calculation. This is where creative equity begins its journey into the financial ecosystem.', 'Les créateurs soumettent des projets pour un audit institutionnel et le calcul du Score LYA. C\'est ici que l\'équité créative commence son voyage dans l\'écosystème financier.'),
      icon: <Layers size={48} />,
      color: 'bg-primary-cyan',
    },
    {
      id: 2,
      phase: 'PHASE 2 / 6',
      title: t('LEGAL VALIDATION', 'VALIDATION LÉGALE'),
      description: t('Our protocol verifies IP rights and contractual robustness across jurisdictions. We ensure every unit is backed by solid legal frameworks.', 'Notre protocole vérifie les droits de PI et la robustesse contractuelle à travers les juridictions. Nous nous assurons que chaque unité est soutenue par des cadres juridiques solides.'),
      icon: <ShieldCheck size={48} />,
      color: 'bg-emerald-500',
    },
    {
      id: 3,
      phase: 'PHASE 3 / 6',
      title: t('UNIT ISSUANCE', 'ÉMISSION D\'UNITÉS'),
      description: t('Contracts are divided into tradable LYA Units. This fractionalization allows for unprecedented liquidity in the creative market.', 'Les contrats sont divisés en unités LYA échangeables. Cette fractionalisation permet une liquidité sans précédent sur le marché créatif.'),
      icon: <Zap size={48} />,
      color: 'bg-accent-gold',
    },
    {
      id: 4,
      phase: 'PHASE 4 / 6',
      title: t('GLOBAL REGISTRY', 'REGISTRE MONDIAL'),
      description: t('Assets are listed on the LYA Institutional Registry. Global visibility meets institutional transparency for every creative asset.', 'Les actifs sont répertoriés sur le Registre Institutionnel LYA. La visibilité mondiale rencontre la transparence institutionnelle pour chaque actif créatif.'),
      icon: <Globe size={48} />,
      color: 'bg-blue-500',
    },
    {
      id: 5,
      phase: 'PHASE 5 / 6',
      title: t('REAL-TIME YIELD', 'RENDEMENT EN TEMPS RÉEL'),
      description: t('Track performance and revenue shares through our live indexing engine. Watch your creative equity grow in real-time.', 'Suivez les performances et les parts de revenus via notre moteur d\'indexation en direct. Regardez votre équité créative croître en temps réel.'),
      icon: <Activity size={48} />,
      color: 'bg-accent-pink',
    },
    {
      id: 6,
      phase: 'PHASE 6 / 6',
      title: t('P2P EXCHANGE', 'ÉCHANGE P2P'),
      description: t('Trade units 24/7 on the secondary market. Institutional liquidity at your fingertips, powered by atomic settlement.', 'Échangez des unités 24/7 sur le marché secondaire. La liquidité institutionnelle à portée de main, propulsée par le règlement atomique.'),
      icon: <BarChart3 size={48} />,
      color: 'bg-primary-cyan',
    }
  ];

  const handleClose = () => {
    localStorage.setItem('lya_tutorial_completed', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-4xl w-full bg-surface-dim border border-white/10 rounded-sm overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <div className="flex gap-4">
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-on-surface-variant flex items-center gap-2">
                <Globe size={10} />
                EN | FR
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 text-on-surface-variant hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-12 md:p-20 flex flex-col items-center text-center">
             <motion.div 
               key={current.id}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`w-24 h-24 rounded-2xl ${current.color} bg-opacity-20 flex items-center justify-center text-white mb-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
               style={{ boxShadow: `0 0 40px ${current.color.replace('bg-', 'rgba(')}0.2)` }}
             >
               {current.icon}
             </motion.div>

             <motion.div
               key={current.phase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`px-3 py-1 ${current.color} text-[9px] font-black uppercase tracking-widest text-surface-dim mb-6 rounded-full`}
             >
               {current.phase}
             </motion.div>

             <motion.h2 
               key={current.title}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8 leading-none italic"
             >
               {current.title}
             </motion.h2>

             <motion.p 
               key={current.description}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-lg text-on-surface-variant opacity-80 leading-relaxed max-w-2xl mb-12"
             >
               {current.description}
             </motion.p>

             <div className="flex items-center gap-4 w-full max-w-md">
               {currentStep > 0 && (
                 <button 
                   onClick={prevStep}
                   className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
                 >
                   BACK
                 </button>
               )}
               <button 
                 onClick={nextStep}
                 className={`flex-[2] py-4 ${currentStep === steps.length - 1 ? 'bg-emerald-500' : 'bg-primary-cyan'} text-surface-dim font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-4 group active:scale-95 shadow-xl`}
               >
                 {currentStep === steps.length - 1 ? (
                   <>BEGIN <CheckCircle2 size={16} /></>
                 ) : (
                   <>NEXT <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                 )}
               </button>
             </div>
          </div>

          {/* Footer Indicators */}
          <div className="flex justify-center gap-6 p-8 bg-black/20 border-t border-white/5">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${i === currentStep ? steps[i].color : 'bg-white/10'}`} />
                {i % 2 === 0 && (
                  <span className="text-[8px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
                    {i === 0 ? 'MICA' : i === 2 ? 'SEC' : 'INSTITUTIONAL'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
