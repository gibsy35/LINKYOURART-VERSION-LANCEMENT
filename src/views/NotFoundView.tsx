import React from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface Props {
  onViewChange: (view: any) => void;
}

export const NotFoundView: React.FC<Props> = ({ onViewChange }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center p-8 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-cyan/5 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a78bfa]/5 rounded-full blur-3xl pointer-events-none"/>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        {/* 404 */}
        <div className="relative">
          <p className="text-[180px] font-black text-white/[0.03] leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-7xl font-black text-white">404</p>
              <div className="h-0.5 bg-gradient-to-r from-primary-cyan via-[#a78bfa] to-accent-gold rounded-full"/>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em]">
            {t('Page not found', 'Page introuvable')}
          </p>
          <h1 className="text-2xl font-black text-white">
            {t('This page doesn\'t exist.', 'Cette page n\'existe pas.')}
          </h1>
          <p className="text-sm text-on-surface-variant/50 leading-relaxed">
            {t(
              'The page you are looking for may have been moved, deleted or never existed.',
              'La page que vous recherchez a peut-être été déplacée, supprimée ou n\'a jamais existé.'
            )}
          </p>
        </div>

        {/* Phrase signature */}
        <p className="text-[11px] text-white/20 italic">
          "{t("What you create today can be recognized by thousands tomorrow.", "Ce que vous créez aujourd'hui peut être reconnu par des milliers de personnes demain.")}"
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onViewChange('HOME')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all"
          >
            <Home size={16}/>
            {t('Home', 'Accueil')}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={16}/>
            {t('Go back', 'Retour')}
          </button>
        </div>

        {/* Logo */}
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">LINKYOURART</p>
      </motion.div>
    </div>
  );
};
