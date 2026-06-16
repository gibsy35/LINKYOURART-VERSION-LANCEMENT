
import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  titleWhite: string;
  titleAccent: string;
  subtitle?: string;
  description?: string;
  accentColor?: string; // e.g. 'text-accent-gold' or 'text-primary-cyan'
  compact?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  titleWhite, 
  titleAccent, 
  subtitle = '', 
  description,
  accentColor = 'text-primary-cyan',
  compact = false
}) => {
  return (
    <header className={`pt-12 md:pt-16 relative z-10 px-4 md:px-6 ${compact ? 'mb-4' : 'mb-6 md:mb-10'}`}>
      <div className="flex flex-col">
        <motion.div
           initial={{ opacity: 0, x: -25 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Title Area with Horizontal Bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-[2px] ${accentColor.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(0,224,255,0.3)] transition-all ${compact ? 'w-6 md:w-10' : 'w-10 md:w-16 lg:w-20'}`}></div>
            <h1 className={`font-bold font-headline tracking-tighter leading-none uppercase flex flex-wrap items-baseline gap-x-2 md:gap-x-3 transition-all ${compact ? 'text-lg md:text-xl lg:text-2xl' : 'text-xl md:text-3xl lg:text-5xl'}`}>
              <span className="text-white drop-shadow-2xl">{titleWhite}</span>
              <span className={`${accentColor} drop-shadow-[0_0_30px_rgba(0,224,255,0.2)]`}>
                {titleAccent}
              </span>
            </h1>
          </div>
          
          {/* Description Area with Vertical Bar */}
          {description && (
            <div className={`flex items-stretch pl-1 transition-all ${compact ? 'gap-3 md:gap-4 pl-1.5' : 'gap-6 md:gap-8 pl-2'}`}>
              <div className={`w-[1px] ${accentColor.replace('text-', 'bg-')} opacity-60 min-h-[30px] md:min-h-[40px]`}></div>
              <p className={`text-white uppercase tracking-[0.1em] leading-normal opacity-85 max-w-2xl text-justify font-black ${compact ? 'text-xs md:text-[10.5px] tracking-widest' : 'text-xs md:text-sm'}`}>
                {description}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
};
