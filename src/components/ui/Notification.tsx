
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface NotificationProps {
  message: string | null;
}

// Redesign complet demande par Gibsy: l'ancienne version (icone Terminal,
// police monospace, tout en majuscules, petits crochets decoratifs aux
// coins facon "hacker") donnait un rendu trop IA/futuriste. Nouvelle
// version discrete, arrondie, en haut a droite - esprit notification
// premium plutot que console de commande.
export const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <AnimatePresence mode="sync">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-sm px-5 py-3.5 bg-surface-low/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3"
        >
          <CheckCircle2 size={18} className="text-primary-cyan shrink-0" />
          <span className="text-[13px] font-medium text-on-surface leading-snug">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
