
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
    <header className="mb-20 pt-10 relative z-10 px-6 md:px-12">
      <div className="flex flex-col gap-10">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-headline tracking-tighter leading-[0.85] uppercase italic mb-10 flex items-center gap-6">
            <div className={`h-[2px] w-16 ${accentColor.replace('text-', 'bg-')}`}></div>
            <span>
              <span className="text-white drop-shadow-2xl">{titleWhite}</span>{' '}
              <span className={`${accentColor} drop-shadow-[0_0_30px_rgba(0,224,255,0.4)]`}>
                {titleAccent}
              </span>
            </span>
          </h1>
          
          {description && (
            <p className={`border-l-[3px] ${accentColor.replace('text-', 'border-')} pl-8 text-on-surface-variant max-w-3xl text-[12px] md:text-base leading-relaxed opacity-80 uppercase tracking-[0.4em] font-black italic`}>
              {description}
            </p>
          )}

          {subtitle && (
            <h2 className="mt-8 text-xl md:text-3xl font-black font-headline tracking-tight uppercase italic text-on-surface opacity-90">
              {subtitle}
            </h2>
          )}
        </motion.div>
      </div>
    </header>
  );
};
