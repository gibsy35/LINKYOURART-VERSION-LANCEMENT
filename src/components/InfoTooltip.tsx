
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InfoTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content, position = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block ml-1">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-on-surface-variant/40 hover:text-primary-cyan transition-colors focus:outline-none"
      >
        <HelpCircle size={10} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-[1000] w-48 p-3 bg-surface-dim border border-white/10 shadow-2xl pointer-events-none font-mono ${positions[position]}`}
          >
            <div className="text-[9px] font-black text-primary-cyan uppercase tracking-widest mb-1">{title}</div>
            <div className="text-[9px] text-on-surface-variant/80 uppercase font-bold leading-tight">{content}</div>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-cyan/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-cyan/30" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
