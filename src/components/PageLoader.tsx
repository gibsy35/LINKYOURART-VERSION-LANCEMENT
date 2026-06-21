import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageLoaderProps {
  isVisible: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-dim/80 backdrop-blur-sm"
        >
          {/* Logo LYA animé */}
          <div className="flex flex-col items-center gap-4">

            {/* Cercle tournant avec logo */}
            <div className="relative w-16 h-16">
              {/* Ring animé */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-cyan border-r-primary-cyan/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              {/* Ring secondaire */}
              <motion.div
                className="absolute inset-1 rounded-full border border-[#a78bfa]/30 border-b-[#a78bfa]"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Centre */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-primary-cyan font-black text-sm"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✦
                </motion.span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-cyan via-[#a78bfa] to-primary-cyan rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Nom */}
            <motion.p
              className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              LINKYOURART
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
