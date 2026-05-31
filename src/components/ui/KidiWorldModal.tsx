import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Globe, Zap, ArrowRight, Star } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface KidiWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KidiWorldModal: React.FC<KidiWorldModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}
          >
            <div
              style={{ pointerEvents: 'auto', maxWidth: '580px', width: '100%' }}
              className="relative bg-[#080C12] border border-accent-gold/20 shadow-[0_0_80px_rgba(255,215,0,0.08)] overflow-hidden font-mono"
            >
              {/* Gold top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent" />

              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-cyan/[0.04] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors z-10 p-1"
              >
                <X size={18} />
              </button>

              <div className="p-10 relative z-10">

                {/* Header badge */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-gold/30 bg-accent-gold/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                    <span className="text-[8px] font-black text-accent-gold uppercase tracking-[0.4em]">
                      {t('COMING SOON', 'BIENTÔT DISPONIBLE')}
                    </span>
                  </div>
                </div>

                {/* Logo */}
                <div className="mb-8">
                  <div className="flex items-end gap-3 mb-3">
                    <div className="w-12 h-12 border border-accent-gold/40 bg-accent-gold/10 flex items-center justify-center">
                      <span className="text-accent-gold text-2xl font-black">K</span>
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                        KIDI<span className="text-accent-gold">.</span>WORLD
                      </h2>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold mt-1">
                        {t('A LinkYourArt Universe', 'Un Univers LinkYourArt')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main description */}
                <div className="space-y-5 mb-10">
                  <p className="text-sm text-white/80 leading-relaxed font-sans">
                    {t(
                      'KIDI.WORLD is being born at the intersection of creativity, technology and artistic intelligence. A dedicated universe where creators, investors and cultural institutions meet around a single ambition: to make creation a living, powerful and universally accessible economic force.',
                      'KIDI.WORLD naît à l\'intersection de la créativité, de la technologie et de l\'intelligence artistique. Un univers dédié où les créateurs, les investisseurs et les institutions culturelles se retrouvent autour d\'une seule ambition : faire de la création une force économique vivante, puissante et universellement accessible.'
                    )}
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed font-sans">
                    {t(
                      'From music to architecture, from film to digital art — KIDI.WORLD will become the new global standard for creative discovery, evaluation and investment. Powered by LYA Protocol intelligence, it will offer a unique experience where every talent finds its audience, and every creation its true value.',
                      'De la musique à l\'architecture, du cinéma à l\'art numérique — KIDI.WORLD deviendra le nouveau standard mondial de la découverte, l\'évaluation et l\'investissement créatif. Porté par l\'intelligence du Protocole LYA, il offrira une expérience unique où chaque talent trouve son public, et chaque création sa juste valeur.'
                    )}
                  </p>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: <Globe size={12} />, text: t('Global creative discovery', 'Découverte créative mondiale') },
                    { icon: <Zap size={12} />, text: t('LYA Score integration', 'Intégration du Score LYA') },
                    { icon: <Star size={12} />, text: t('Talent incubator', 'Incubateur de talents') },
                    { icon: <Sparkles size={12} />, text: t('AI-curated collections', 'Collections curées par IA') },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-3 border border-white/5 bg-white/[0.02]">
                      <span className="text-accent-gold/60">{f.icon}</span>
                      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA area */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                      {t('STAY TUNED', 'RESTEZ CONNECTÉS')}
                    </p>
                    <p className="text-[11px] text-accent-gold/60 font-black uppercase tracking-widest mt-0.5">
                      kidi.world
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[9px] font-black uppercase tracking-[0.3em] hover:bg-accent-gold hover:text-surface-dim transition-all group"
                  >
                    {t('GOT IT', 'COMPRIS')}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Bottom gold line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
