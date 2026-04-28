
import React from 'react';
import { motion } from 'motion/react';
import { Play, Maximize2, Volume2, Settings } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface PlayerProps {
  titleWhite: string;
  titleAccent: string;
  subtitle: string;
}

export const Player: React.FC<PlayerProps> = ({ titleWhite, titleAccent, subtitle }) => {
  const { t } = useTranslation();
  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-video bg-surface-dim rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/10">
      {/* Background Content - Abstract Institutional Design */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,224,255,0.1),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(238,192,94,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Animated Floating Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-cyan/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full" 
        />

        {/* Global Mesh Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 md:p-20">
        {/* Top Info */}
        <div className="flex justify-between items-start">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="h-[2px] w-12 bg-primary-cyan"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-cyan italic">{t('Institutional Identity', 'Identité Institutionnelle')}</span>
            </motion.div>
            <h1 className="text-5xl md:text-[5.5rem] font-black font-headline tracking-tighter uppercase italic leading-[0.85]">
              <span className="text-white drop-shadow-2xl">{titleWhite}</span> <br />
              <span className="text-accent-gold drop-shadow-[0_0_30px_rgba(238,192,94,0.5)]">{titleAccent}</span>
            </h1>
            <p className="text-xs md:text-base font-black uppercase tracking-[0.5em] text-white/40 pl-8 border-l-2 border-accent-gold max-w-2xl italic leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Bottom Elements */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">System Status</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Optimal Sync
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Registry Access</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Full Protocol Enabled</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 bg-accent-gold rounded-full opacity-40" />
             <div className="w-1.5 h-1.5 bg-accent-gold rounded-full opacity-60" />
             <div className="w-1.5 h-1.5 bg-accent-gold rounded-full opacity-80" />
             <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-accent-gold/40 m-8 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent-gold/40 m-8 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent-gold/40 m-8 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent-gold/40 m-8 rounded-br-2xl" />
    </div>
  );
};
