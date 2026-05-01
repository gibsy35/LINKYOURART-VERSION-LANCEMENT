
import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | number; 
  className?: string; 
  color?: 'cyan' | 'multi' | 'white';
  showBeta?: boolean;
}> = ({ size = 'md', className = '', color = 'cyan', showBeta = false }) => {
  const isNumeric = typeof size === 'number';
  
  const dimensions = {
    sm: 32,
    md: 56,
    lg: 84
  };

  const d = isNumeric ? size : dimensions[size];

  // Colors as requested
  const colors = {
    inner: color === 'white' ? "text-white" : "text-[#FF007F]", // Vibrant Pink
    middle: color === 'white' ? "text-white/60" : "text-primary-cyan", // Electric Cyan
    outer: color === 'white' ? "text-white/30" : "text-[#9D00FF]", // Darker Neon Purple
    center: "bg-white"       // White focal point
  };

  return (
    <div 
      style={{ width: d, height: d }}
      className={`relative flex items-center justify-center group ${className}`}
    >
      {/* Central Point: LinkYourArt Nexus */}
      <div className={`w-[12%] h-[12%] rounded-full z-20 ${colors.center} shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(255,255,255,0.8),0_0_60px_rgba(0,224,255,0.6)] transition-transform duration-500 group-hover:scale-150 ring-2 ring-white/40 pb-[1%]`} />

      {/* 3 Concentric Circles with Openings */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full transform transition-transform duration-700 group-hover:rotate-12"
      >
        {/* Inner Circle - Pink */}
        <motion.circle
          cx="50" cy="50" r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="60 65"
          strokeDashoffset="10"
          strokeLinecap="round"
          className={`${colors.inner} opacity-95`}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle Circle - Cyan */}
        <motion.circle
          cx="50" cy="50" r="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="120 80"
          strokeDashoffset="45"
          strokeLinecap="round"
          className={`${colors.middle} opacity-95`}
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer Circle - Purple */}
        <motion.circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="200 75"
          strokeDashoffset="180"
          strokeLinecap="round"
          className={`${colors.outer} opacity-95`}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Beta Tag */}
      {showBeta && (
        <div className="absolute -top-1 -right-2 bg-accent-gold text-surface-dim font-black text-[8px] px-1 py-0.5 rounded-xs tracking-tighter leading-none z-30 shadow-lg">
          BETA
        </div>
      )}

      {/* Dynamic Glow */}
      <div className="absolute inset-0 bg-primary-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
};
