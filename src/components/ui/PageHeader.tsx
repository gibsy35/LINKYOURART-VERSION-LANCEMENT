
import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  titleWhite: string;
  titleAccent: string;
  subtitle?: string;
  description?: string;
  accentColor?: string; // e.g. 'text-accent-gold' or 'text-primary-cyan'
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  titleWhite, 
  titleAccent, 
  subtitle = '', 
  description,
  accentColor = 'text-primary-cyan'
}) => {
  return (
    <header className="mb-12 md:mb-16 pt-8 md:pt-12 relative z-10 px-6 md:px-12 lg:px-20">
      <div className="flex flex-col">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          {/* Title Area with Horizontal Bar */}
          <div className="flex items-center gap-6 mb-4">
            <div className={`w-12 md:w-16 lg:w-20 h-[2px] ${accentColor.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(0,224,255,0.3)]`}></div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold font-headline tracking-tighter leading-none uppercase italic flex flex-wrap items-baseline gap-x-2 md:gap-x-4">
              <span className="text-white drop-shadow-2xl">{titleWhite}</span>
              <span className={`${accentColor} drop-shadow-[0_0_30px_rgba(0,224,255,0.2)]`}>
                {titleAccent}
              </span>
            </h1>
          </div>
          
          {/* Description Area with Vertical Bar */}
          {description && (
            <div className="flex items-stretch gap-6 md:gap-8 pl-2">
              <div className={`w-[1px] ${accentColor.replace('text-', 'bg-')} opacity-60 min-h-[40px] md:min-h-[50px]`}></div>
              <p className="text-white md:text-lg font-semibold uppercase tracking-[0.15em] leading-tight opacity-90 max-w-3xl italic self-center">
                {description}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
};
