import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { UserRole } from '../types';
import { Sparkles, Users, Briefcase, ChevronRight, X, CheckCircle } from 'lucide-react';

interface Props {
  onComplete: (role: UserRole) => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete, onSkip }) => {
  const { language } = useTranslation();
  const T = (fr: string, en: string) => language === 'FR' ? fr : en;
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      role: UserRole.CREATOR,
      icon: <Sparkles size={32} className="text-[#a78bfa]" />,
      color: 'border-[#a78bfa]/40 bg-[#a78bfa]/8 hover:border-[#a78bfa]/70',
      activeColor: 'border-[#a78bfa] bg-[#a78bfa]/15',
      titleFR: 'Créateur',
      titleEN: 'Creator',
      descFR: 'J\'ai des projets artistiques à valoriser et je cherche des mécènes.',
      descEN: 'I have artistic projects to showcase and I\'m looking for patrons.',
      perks: [
        T('Dashboard créateur personnalisé', 'Personalised creator dashboard'),
        T('Simulateur de score LYA', 'LYA score simulator'),
        T('Gestion des jalons et documents', 'Milestone and document management'),
      ],
    },
    {
      role: UserRole.INVESTOR,
      icon: <Users size={32} className="text-emerald-400" />,
      color: 'border-emerald-400/40 bg-emerald-400/8 hover:border-emerald-400/70',
      activeColor: 'border-emerald-400 bg-emerald-400/15',
      titleFR: 'Mécène',
      titleEN: 'Patron',
      descFR: 'Je veux soutenir des créations en lesquelles je crois et suivre leur certification.',
      descEN: 'I want to support creations I believe in and follow their certification.',
      perks: [
        T('Suivi en temps réel de vos soutiens', 'Real-time tracking of your support'),
        T('Score LYA suivi par projet', 'LYA Score tracked per project'),
        T('Rapport mensuel personnalisé', 'Personalised monthly report'),
      ],
    },
    {
      role: UserRole.PROFESSIONAL,
      icon: <Briefcase size={32} className="text-primary-cyan" />,
      color: 'border-primary-cyan/40 bg-primary-cyan/8 hover:border-primary-cyan/70',
      activeColor: 'border-primary-cyan bg-primary-cyan/15',
      titleFR: 'Professionnel',
      titleEN: 'Professional',
      descFR: 'Je suis expert créatif et je veux valider et accompagner des projets.',
      descEN: 'I\'m a creative expert and I want to validate and support projects.',
      perks: [
        T('Deal Finder Pro exclusif', 'Exclusive Deal Finder Pro'),
        T('Missions de certification LYA', 'LYA certification missions'),
        T('Académie & Mentorat Élite', 'Academy & Elite Mentorship'),
      ],
    },
  ];

  const steps = [
    // Étape 0 : Bienvenue
    <motion.div key="welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="text-center space-y-6">
      <div className="w-16 h-16 bg-primary-cyan/15 border border-primary-cyan/30 rounded-2xl flex items-center justify-center mx-auto">
        <span className="text-primary-cyan font-black text-xl">LYA</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          {T('Bienvenue sur LinkYourArt', 'Welcome to LinkYourArt')}
        </h2>
        <p className="text-sm text-on-surface-variant/60 leading-relaxed max-w-sm mx-auto">
          {T(
            'Le premier standard de certification créative. Configurons votre espace en 2 étapes.',
            'The first creative certification standard. Let\'s set up your space in 2 steps.'
          )}
        </p>
      </div>
      <p className="text-sm italic text-primary-cyan/70 font-medium">
        "{T('Ce que vous créez aujourd\'hui peut être reconnu par des milliers de personnes demain.', 'What you create today can be recognized by thousands tomorrow.')}"
      </p>
      <button onClick={() => setStep(1)} className="w-full py-4 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center justify-center gap-2">
        {T('Commencer →', 'Get started →')}
      </button>
    </motion.div>,

    // Étape 1 : Choix du rôle
    <motion.div key="role" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-black text-white tracking-tight mb-1">{T('Qui êtes-vous ?', 'Who are you?')}</h2>
        <p className="text-sm text-on-surface-variant/50">{T('Choisissez votre profil principal', 'Choose your main profile')}</p>
      </div>
      <div className="space-y-3">
        {roles.map((r) => (
          <button key={r.role} onClick={() => setSelectedRole(r.role)}
            className={`w-full p-4 border rounded-2xl text-left transition-all ${selectedRole === r.role ? r.activeColor : r.color}`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">{r.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-white">{T(r.titleFR, r.titleEN)}</p>
                  {selectedRole === r.role && <CheckCircle size={16} className="text-emerald-400 shrink-0"/>}
                </div>
                <p className="text-xs text-on-surface-variant/60 mt-0.5">{T(r.descFR, r.descEN)}</p>
                {selectedRole === r.role && (
                  <ul className="mt-2 space-y-1">
                    {r.perks.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-on-surface-variant/70">
                        <span className="w-1 h-1 rounded-full bg-primary-cyan shrink-0"/>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => selectedRole && onComplete(selectedRole)} disabled={!selectedRole}
        className="w-full py-4 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {T('Accéder à mon espace →', 'Access my space →')}
      </button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-dim/90 backdrop-blur-2xl"/>

      {/* Card */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-surface-low border border-white/10 rounded-3xl p-7 max-w-md w-full shadow-2xl z-10 space-y-5 mx-3"
      >
        {/* Bouton fermer */}
        <button onClick={onSkip} className="absolute top-4 right-4 p-2 text-on-surface-variant/40 hover:text-on-surface transition-colors rounded-lg hover:bg-white/5">
          <X size={16}/>
        </button>

        {/* Indicateur étapes */}
        <div className="flex gap-1.5 justify-center">
          {[0, 1].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all ${step === i ? 'w-8 bg-primary-cyan' : 'w-3 bg-white/15'}`}/>
          ))}
        </div>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>

        {/* Passer */}
        <button onClick={onSkip} className="w-full text-xs text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-colors">
          {T('Passer cette étape', 'Skip this step')}
        </button>
      </motion.div>
    </div>
  );
};
