import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';

interface Props {
  onViewChange: (v: any) => void;
}

export const NotFoundView: React.FC<Props> = ({ onViewChange }) => {
  const { language } = useTranslation();
  const T = (fr: string, en: string) => language === 'FR' ? fr : en;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Code 404 stylisé */}
        <div className="relative">
          <p className="text-[8rem] sm:text-[12rem] font-black font-mono text-white/5 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
                {T('PAGE', 'PAGE')}<br/>
                <span className="text-primary-cyan">{T('INTROUVABLE', 'NOT FOUND')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-on-surface-variant/50 max-w-sm mx-auto leading-relaxed">
          {T(
            'Cette page n\'existe pas ou a été déplacée. Mais votre prochaine création, elle, est bien réelle.',
            'This page doesn\'t exist or has been moved. But your next creation is very real.'
          )}
        </p>

        {/* Phrase signature */}
        <p className="text-sm italic text-primary-cyan/60 font-medium">
          "{T('Ce que vous créez aujourd\'hui peut appartenir à mille personnes demain.', 'What you create today can belong to a thousand people tomorrow.')}"
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => onViewChange('HOME')}
            className="px-8 py-3.5 bg-primary-cyan text-surface-dim font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            {T('Retour à l\'accueil', 'Back to home')}
          </button>
          <button onClick={() => onViewChange('EXCHANGE')}
            className="px-8 py-3.5 bg-white/5 border border-white/10 text-sm font-black text-on-surface uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all">
            {T('Découvrir les projets', 'Discover projects')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
