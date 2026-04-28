
import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | number; className?: string; color?: 'cyan' | 'multi' }> = ({ size = 'md', className = '', color = 'cyan' }) => {
  const isNumeric = typeof size === 'number';
  
  const dimensions = {
    sm: 32,
    md: 56,
    lg: 84
  };

  const d = isNumeric ? size : dimensions[size];

  // Colors as requested
  const colors = {
    inner: "text-[#FF007F]", // Rose
    middle: "text-[#00E0FF]", // Blue
    outer: "text-[#8A2BE2]", // Purple
    center: "bg-white"       // White point
  };

  return (
    <div 
      style={{ width: d, height: d }}
      className={`relative flex items-center justify-center group ${className}`}
    >
      {/* Central Point: LinkYourArt Nexus */}
      <div className={`w-[8%] h-[8%] rounded-full z-20 ${colors.center} shadow-[0_0_15px_rgba(255,255,255,1)] transition-transform duration-500 group-hover:scale-150 translate-x-[2px]`} />

      {/* 3 Concentric Circles with Openings (Labyrinth/Fingerprint Effect) */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full transform transition-transform duration-700 group-hover:rotate-12"
      >
        {/* Inner Circle - Rose (Creators) */}
        <motion.circle
          cx="50" cy="50" r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="70 24"
          strokeDashoffset="10"
          className={`${colors.inner} opacity-90`}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle Circle - Blue (Investors) */}
        <motion.circle
          cx="50" cy="50" r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="140 35"
          strokeDashoffset="45"
          className={`${colors.middle} opacity-90`}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer Circle - Purple (Professionals) */}
        <motion.circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="220 45"
          strokeDashoffset="180"
          className={`${colors.outer} opacity-90`}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Dynamic Glow */}
      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
};
