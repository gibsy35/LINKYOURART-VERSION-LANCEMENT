
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
      {/* Central Nexus: Focal point */}
      <div className={`w-[12%] h-[12%] rounded-full z-20 ${colors.center} transition-transform duration-500 group-hover:scale-150 ring-2 ring-white/40`} />

      {/* Central Focal Blur */}
      <div className={`absolute w-[25%] h-[25%] rounded-full z-10 ${colors.center} blur-md opacity-20 shadow-[0_0_30px_#fff]`} />

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

      {/* Badge BETA — resserre contre l'anneau (au lieu de deborder largement en
          bas-a-droite) pour ne plus se lire comme un second logo a cote du
          premier, et repris en degrade de marque plutot qu'un violet plat. */}
      {showBeta && (
        <div className="absolute bottom-[2%] right-[2%] bg-gradient-to-br from-[#7E1CF1] to-[#E61A97] text-white font-black text-[max(7px,10%)] px-[8%] py-[2%] rounded-full tracking-tighter leading-none z-30 shadow-[0_4px_10px_rgba(0,0,0,0.4)] border border-white/40 select-none flex items-center justify-center">
          BETA
        </div>
      )}

      {/* Dynamic Glow */}
      <div className="absolute inset-0 bg-primary-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
};
