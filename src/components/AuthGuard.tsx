import React from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { UserProfile } from '../types';

interface AuthGuardProps {
  // Nouvelle interface (boutons explicites)
  onLogin?: () => void;
  onPreRegister?: () => void;
  message?: string;
  // Ancienne interface (compatibilité)
  user?: UserProfile | null;
  onViewChange?: (view: any) => void;
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  onLogin, onPreRegister, message,
  onViewChange, children
}) => {
  const { t } = useTranslation();

  const handleLogin = onLogin || (() => onViewChange?.('LOGIN'));
  const handlePreRegister = onPreRegister || (() => onViewChange?.('LANDING'));

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Icône */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-primary-cyan/10 rounded-2xl blur-xl" />
          <div className="relative w-20 h-20 bg-surface-low border border-primary-cyan/20 rounded-2xl flex items-center justify-center">
            <Lock size={32} className="text-primary-cyan" />
          </div>
        </div>

        {/* Texte */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.2em]">
            {t('Access restricted', 'Accès restreint')}
          </p>
          <h2 className="text-2xl font-black text-white">
            {message || t('Sign in to continue', 'Connectez-vous pour continuer')}
          </h2>
          <p className="text-sm text-on-surface-variant/50 leading-relaxed">
            {t(
              'This section is reserved for LinkYourArt members. Sign in or join the LYA Originals to access it.',
              'Cette section est réservée aux membres LinkYourArt. Connectez-vous ou rejoignez la liste LYA Originals pour y accéder.'
            )}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            {t('Sign in', 'Se connecter')}
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handlePreRegister}
            className="w-full py-3 bg-white/5 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            {t('Join the LYA Originals', 'Rejoindre la liste LYA Originals')}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-[10px] text-white/20 italic">
          "{t("What you create today can be recognized by thousands tomorrow.", "Ce que vous créez aujourd'hui peut être reconnu par des milliers de personnes demain.")}"
        </p>
      </motion.div>
    </div>
  );
};
