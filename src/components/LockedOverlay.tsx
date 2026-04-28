
import React from 'react';
import { motion } from 'motion/react';
import { Lock, Shield, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface LockedOverlayProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const LockedOverlay: React.FC<LockedOverlayProps> = ({ 
  title, 
  description, 
  onAction, 
  actionLabel 
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-surface-dim/80 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl">
      <div className="text-center max-w-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-cyan/20 shadow-[0_0_30px_rgba(0,224,255,0.2)]"
        >
          <Lock size={32} className="text-primary-cyan" />
        </motion.div>
        
        <h3 className="text-xl font-black font-headline text-white uppercase italic tracking-tighter mb-4">
          {title || t('SECTION_LOCKED', 'SECTION_VERROUILLÉE')}
        </h3>
        
        <p className="text-xs text-on-surface-variant font-black uppercase tracking-[0.2em] leading-relaxed mb-8 opacity-60 italic">
          {description || t('LYA_PROTOCOL_RESTRICTION_MESSAGE', 'CETTE SECTION EST PROTÉGÉE PAR LE PROTOCOLE LYA. L\'AUTORISATION DE NIVEAU INSTITUTIONNEL EST REQUISE.')}
        </p>

        <button 
          onClick={onAction}
          className="w-full py-4 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)] active:scale-95"
        >
          {actionLabel || t('UPGRADE_TO_PRO', 'PASSER_À_PRO')}
          <ArrowRight size={14} />
        </button>

        <div className="mt-6 flex items-center justify-center gap-4 text-on-surface-variant/30">
          <Shield size={12} />
          <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">AES-256 BANK GRADE SECURITY ACTIVE</span>
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary-cyan/30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary-cyan/30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary-cyan/30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary-cyan/30" />
    </div>
  );
};
