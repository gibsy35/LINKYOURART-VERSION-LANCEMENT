
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';

interface NotificationProps {
  message: string | null;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 bg-surface-dim border border-primary-cyan shadow-[0_0_30px_rgba(0,255,255,0.15)] flex items-center gap-3 font-mono"
        >
          <div className="w-2 h-2 bg-primary-cyan animate-pulse" />
          <Terminal size={14} className="text-primary-cyan" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{message}</span>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-cyan" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-cyan" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
