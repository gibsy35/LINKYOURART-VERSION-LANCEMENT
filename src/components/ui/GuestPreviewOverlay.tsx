import React from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';

interface GuestPreviewOverlayProps {
  onOpenAuth: () => void;
  viewName?: string;
}

export const GuestPreviewOverlay: React.FC<GuestPreviewOverlayProps> = ({ onOpenAuth, viewName = 'cette section' }) => {
  return (
    <div className="relative">
      {/* Blur mask — gradient from transparent to opaque */}
      <div className="absolute inset-x-0 bottom-0 top-[30%] z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(13,17,23,0.85) 35%, rgba(13,17,23,0.98) 60%, #0D1117 100%)' }}
      />

      {/* CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-16 px-4"
      >
        <div className="max-w-md w-full bg-[#0D1117]/95 border border-white/10 backdrop-blur-xl p-8 text-center shadow-2xl">
          {/* Icon */}
          <div className="w-14 h-14 border border-primary-cyan/30 bg-primary-cyan/5 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-primary-cyan" />
          </div>

          {/* Text */}
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
            Aperçu <span className="text-primary-cyan">limité</span>
          </h3>
          <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest leading-relaxed mb-6">
            Créez un compte gratuit pour accéder à {viewName} en intégralité et interagir avec la plateforme.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenAuth}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
            >
              CRÉER UN COMPTE <ArrowRight size={14} />
            </button>
            <button
              onClick={onOpenAuth}
              className="flex-1 py-3.5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              SE CONNECTER
            </button>
          </div>

          {/* Trust signals */}
          <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mt-4">
            Gratuit · Sans carte bancaire · Accès immédiat
          </p>
        </div>
      </motion.div>
    </div>
  );
};
