
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
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <h1
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            className={`font-medium leading-[1.08] flex flex-wrap items-baseline gap-x-3 transition-all ${compact ? 'text-lg md:text-xl lg:text-2xl' : 'text-2xl md:text-4xl lg:text-5xl'}`}
          >
            <span style={{ textTransform: 'lowercase' }} className="text-white [&::first-letter]:uppercase">{titleWhite}</span>
            <span className={`${accentColor} italic`}>
              {titleAccent}
            </span>
          </h1>
          
          {/* Description */}
          {description && (
            <p style={{ textTransform: 'lowercase' }} className={`text-on-surface-variant/70 leading-relaxed max-w-2xl mt-3 [&::first-letter]:uppercase ${compact ? 'text-xs md:text-[12px]' : 'text-sm md:text-[15px]'}`}>
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </header>
  );
};
