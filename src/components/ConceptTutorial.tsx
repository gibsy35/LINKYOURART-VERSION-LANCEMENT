import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronLeft, ChevronRight, Globe, Zap, Sparkles,
  Target, Users, Layers, Shield, BarChart3, TrendingUp, CheckCircle2
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  points: string[];
  visual: React.ReactNode;
}

const GlobalEcosystemVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="80" r="50" fill="url(#glow1)" />
    <circle cx="100" cy="80" r="38" fill="none" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.4" />
    <ellipse cx="100" cy="80" rx="38" ry="15" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.3" />
    <line x1="62" y1="80" x2="138" y2="80" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.3" />
    <line x1="100" y1="42" x2="100" y2="118" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0.3" />
    {[
      { cx: 100, cy: 42, label: 'CREATOR' },
      { cx: 138, cy: 80, label: 'INVESTOR' },
      { cx: 100, cy: 118, label: 'INDUSTRY' },
      { cx: 62, cy: 80, label: 'AUDIENCE' },
    ].map((node, i) => (
      <g key={i}>
        <motion.circle cx={node.cx} cy={node.cy} r="7"
          fill="#00E5FF" fillOpacity="0.15"
          stroke="#00E5FF" strokeWidth="1.5"
          animate={{ r: [7, 9, 7] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
        />
        <circle cx={node.cx} cy={node.cy} r="2.5" fill="#00E5FF" />
      </g>
    ))}
    <motion.circle cx="100" cy="80" r="5" fill="#00E5FF"
      animate={{ r: [5, 12, 5], opacity: [1, 0, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <circle cx="100" cy="80" r="3" fill="#fff" />
  </svg>
);

const LYAScoreVisual = () => {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s = 0;
      const interval = setInterval(() => {
        s += 15;
        setScore(Math.min(s, 847));
        if (s >= 847) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(t);
  }, []);
  const pct = score / 1000;
  const r = 45;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="88" r="55" fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="8" />
      <motion.circle cx="100" cy="88" r={r} fill="none" stroke="#C084FC" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`}
        strokeDashoffset={circ / 4}
        animate={{ strokeDasharray: [`0 ${circ}`, `${pct * circ} ${circ - pct * circ}`] }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{ transformOrigin: '100px 88px', transform: 'rotate(-90deg)' }}
      />
      <text x="100" y="83" textAnchor="middle" fill="#C084FC" fontSize="22" fontFamily="monospace" fontWeight="bold">{score}</text>
      <text x="100" y="97" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" opacity="0.5">/ 1000 LYA SCORE</text>
      {[
        { label: 'EXPERT', pct: 0.4, color: '#C084FC', y: 130 },
        { label: 'SOCIAL', pct: 0.3, color: '#818CF8', y: 141 },
        { label: 'MARKET', pct: 0.3, color: '#60A5FA', y: 152 },
      ].map((b, i) => (
        <g key={i}>
          <text x="28" y={b.y} fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.5">{b.label}</text>
          <rect x="65" y={b.y - 6} width="80" height="4" rx="2" fill="#fff" fillOpacity="0.1" />
          <motion.rect x="65" y={b.y - 6} width={0} height="4" rx="2" fill={b.color}
            animate={{ width: 80 * b.pct }} transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
          />
          <text x="150" y={b.y} fill={b.color} fontSize="6" fontFamily="monospace">{Math.round(b.pct * 100)}%</text>
        </g>
      ))}
    </svg>
  );
};

const CreatorVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="projGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <rect x="40" y="20" width="120" height="80" rx="8" fill="url(#projGrad)" stroke="#34D399" strokeWidth="1" strokeOpacity="0.5" />
    <rect x="50" y="30" width="60" height="40" rx="4" fill="#fff" fillOpacity="0.1" />
    <circle cx="65" cy="50" r="12" fill="#34D399" fillOpacity="0.3" />
    <text x="65" y="54" textAnchor="middle" fill="#34D399" fontSize="14">🎬</text>
    <text x="125" y="46" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.8">RENAISSANCE</text>
    <text x="125" y="56" textAnchor="middle" fill="#34D399" fontSize="6" fontFamily="monospace">REBORN</text>
    <text x="125" y="66" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.5">LYA: 847/1000</text>
    <rect x="50" y="80" width="100" height="6" rx="3" fill="#fff" fillOpacity="0.1" />
    <motion.rect x="50" y="80" width={0} height="6" rx="3" fill="#34D399"
      animate={{ width: 73 }} transition={{ duration: 2, ease: 'easeOut' }}
    />
    <text x="50" y="96" fill="#34D399" fontSize="6" fontFamily="monospace">73% FUNDED</text>
    <text x="140" y="96" textAnchor="end" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.5">$365K / $500K</text>
    {['FILM', 'P2P', 'VERIFIED'].map((tag, i) => (
      <rect key={i} x={50 + i * 38} y="108" width="34" height="12" rx="6" fill="#34D399" fillOpacity="0.15" stroke="#34D399" strokeWidth="0.5" strokeOpacity="0.5" />
    ))}
    {['FILM', 'P2P', 'VERIFIED'].map((tag, i) => (
      <text key={i} x={67 + i * 38} y="117" textAnchor="middle" fill="#34D399" fontSize="5.5" fontFamily="monospace">{tag}</text>
    ))}
  </svg>
  const InvestorVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chartGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <rect x="30" y="20" width="140" height="90" rx="6" fill="#fff" fillOpacity="0.03" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.1" />
    {[40, 60, 80, 90].map((y, i) => (
      <line key={i} x1="40" y1={y} x2="160" y2={y} stroke="#fff" strokeWidth="0.3" strokeOpacity="0.15" />
    ))}
    <motion.path d="M40,90 L60,80 L80,70 L100,60 L120,45 L140,35 L160,28"
      fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />
    <path d="M40,90 L60,80 L80,70 L100,60 L120,45 L140,35 L160,28 L160,100 L40,100 Z" fill="url(#chartGrad)" />
    {[[60,80],[100,60],[140,35],[160,28]].map(([x,y], i) => (
      <motion.circle key={i} cx={x} cy={y} r="3" fill="#FBBF24"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.5 + i * 0.3 }}
      />
    ))}
    <text x="100" y="118" textAnchor="middle" fill="#FBBF24" fontSize="8" fontFamily="monospace" fontWeight="bold">+34.2% ROI</text>
    {[
      { label: 'FILM', w: 45, color: '#FBBF24' },
      { label: 'MUSIC', w: 30, color: '#F97316' },
      { label: 'GAME', w: 25, color: '#EC4899' },
    ].map((p, i) => (
      <g key={i}>
        <rect x={35 + i * 55} y="128" width={p.w} height="10" rx="5" fill={p.color} fillOpacity="0.2" stroke={p.color} strokeWidth="0.5" strokeOpacity="0.5" />
        <text x={35 + i * 55 + p.w / 2} y="136" textAnchor="middle" fill={p.color} fontSize="5.5" fontFamily="monospace">{p.label}</text>
      </g>
    ))}
  </svg>
);

const ProfessionalVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {[
      { x: 100, y: 50, label: 'YOU', main: true },
      { x: 45, y: 100, label: 'CREATOR' },
      { x: 155, y: 100, label: 'INVESTOR' },
      { x: 70, y: 140, label: 'STUDIO' },
      { x: 130, y: 140, label: 'MEDIA' },
    ].map((n, i) => (
      <g key={i}>
        {i > 0 && <line x1="100" y1="50" x2={n.x} y2={n.y} stroke="#F472B6" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 2" />}
        <motion.circle cx={n.x} cy={n.y} r={n.main ? 18 : 12}
          fill="#F472B6" fillOpacity={n.main ? 0.2 : 0.1}
          stroke="#F472B6" strokeWidth={n.main ? 2 : 1} strokeOpacity={0.6}
          animate={{ r: n.main ? [18, 21, 18] : [12, 14, 12] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
        />
        <text x={n.x} y={n.y + 3} textAnchor="middle" fill="#F472B6" fontSize={n.main ? "6" : "5"} fontFamily="monospace">{n.label}</text>
      </g>
    ))}
    <rect x="60" y="8" width="80" height="16" rx="8" fill="#F472B6" fillOpacity="0.15" stroke="#F472B6" strokeWidth="0.5" strokeOpacity="0.5" />
    <text x="100" y="19" textAnchor="middle" fill="#F472B6" fontSize="6" fontFamily="monospace">CERTIFIED EXPERT</text>
  </svg>
);

const ExploreVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {[2, 1, 0].map(i => (
      <motion.g key={i}
        animate={i === 0 ? { x: [0, 30, 0], rotate: [0, 8, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        style={{ transformOrigin: '100px 80px' }}
      >
        <rect x={25 + i * 6} y={20 + i * 4} width="130" height="95" rx="10"
          fill="#fff" fillOpacity={0.04 + i * 0.03}
          stroke="#22D3EE" strokeWidth="1" strokeOpacity={0.2 + i * 0.2}
        />
        {i === 0 && (
          <>
            <rect x="35" y="28" width="55" height="40" rx="6" fill="#22D3EE" fillOpacity="0.15" />
            <text x="62" y="52" textAnchor="middle" fill="#22D3EE" fontSize="20">🎵</text>
            <text x="110" y="40" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.8">SYNTHETIC</text>
            <text x="110" y="50" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.8">DREAMS</text>
            <text x="110" y="63" fill="#22D3EE" fontSize="6" fontFamily="monospace">LYA: 912</text>
            <rect x="35" y="78" width="130" height="4" rx="2" fill="#fff" fillOpacity="0.1" />
            <motion.rect x="35" y="78" width={0} height="4" rx="2" fill="#22D3EE"
              animate={{ width: 91 }} transition={{ duration: 1.5 }}
            />
            <text x="35" y="93" fill="#22D3EE" fontSize="5.5" fontFamily="monospace">91% FUNDED · MUSIC ALBUM</text>
          </>
        )}
      </motion.g>
    ))}
    <text x="40" y="130" fill="#EF4444" fontSize="9" fontFamily="monospace" opacity="0.6">✕ PASS</text>
    <text x="130" y="130" fill="#22D3EE" fontSize="9" fontFamily="monospace" opacity="0.6">♥ WATCH</text>
  </svg>
);

const WatchlistVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {[
      { name: 'RENAISSANCE REBORN', score: 847, change: '+2.3%', color: '#F87171', y: 30 },
      { name: 'SYNTHETIC DREAMS', score: 912, change: '+5.1%', color: '#34D399', y: 68 },
      { name: 'VOID ARCHITECTURES', score: 634, change: '-1.2%', color: '#FBBF24', y: 106 },
    ].map((item, i) => (
      <g key={i}>
        <rect x="20" y={item.y} width="160" height="28" rx="6" fill="#fff" fillOpacity="0.04" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.1" />
        <circle cx="36" cy={item.y + 14} r="8" fill={item.color} fillOpacity="0.2" stroke={item.color} strokeWidth="1" strokeOpacity="0.5" />
        <text x="36" y={item.y + 17} textAnchor="middle" fill={item.color} fontSize="7" fontFamily="monospace">{i + 1}</text>
        <text x="52" y={item.y + 11} fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.8">{item.name}</text>
        <text x="52" y={item.y + 21} fill={item.color} fontSize="5.5" fontFamily="monospace">LYA {item.score}/1000</text>
        <text x="168" y={item.y + 17} textAnchor="end" fill={item.change.startsWith('+') ? '#34D399' : '#F87171'} fontSize="7" fontFamily="monospace">{item.change}</text>
        <motion.circle cx="172" cy={item.y + 14} r="3" fill={item.change.startsWith('+') ? '#34D399' : '#F87171'}
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
        />
      </g>
    ))}
    <text x="100" y="148" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.4">REAL-TIME · AUTO-REFRESH</text>
  </svg>
);
const InvestVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="investGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <rect x="15" y="20" width="78" height="110" rx="8" fill="url(#investGrad)" stroke="#818CF8" strokeWidth="1" strokeOpacity="0.4" />
    <rect x="107" y="20" width="78" height="110" rx="8" fill="#fff" fillOpacity="0.03" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.2" />
    <text x="54" y="38" textAnchor="middle" fill="#818CF8" fontSize="7" fontFamily="monospace" fontWeight="bold">PROJECT A</text>
    {[['LYA SCORE', '847'], ['BUDGET', '$500K'], ['FUNDED', '73%'], ['ROI EST.', '+34%']].map(([k, v], i) => (
      <g key={i}>
        <text x="24" y={54 + i * 16} fill="#fff" fontSize="5.5" fontFamily="monospace" opacity="0.5">{k}</text>
        <text x="86" y={54 + i * 16} textAnchor="end" fill="#818CF8" fontSize="6" fontFamily="monospace">{v}</text>
      </g>
    ))}
    <text x="146" y="38" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.5">PROJECT B</text>
    {[['LYA SCORE', '634'], ['BUDGET', '$200K'], ['FUNDED', '45%'], ['ROI EST.', '+18%']].map(([k, v], i) => (
      <g key={i}>
        <text x="116" y={54 + i * 16} fill="#fff" fontSize="5.5" fontFamily="monospace" opacity="0.5">{k}</text>
        <text x="178" y={54 + i * 16} textAnchor="end" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.6">{v}</text>
      </g>
    ))}
    <text x="100" y="148" textAnchor="middle" fill="#818CF8" fontSize="6" fontFamily="monospace">SIDE-BY-SIDE COMPARISON</text>
  </svg>
);

const P2PMarketVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <text x="100" y="16" textAnchor="middle" fill="#F59E0B" fontSize="7" fontFamily="monospace">P2P ORDER BOOK</text>
    {[
      { price: '52.40', qty: '120', pct: 0.9 },
      { price: '51.80', qty: '85', pct: 0.65 },
      { price: '51.20', qty: '200', pct: 1.0 },
    ].map((b, i) => (
      <g key={i}>
        <motion.rect x="20" y={28 + i * 22} height="14" rx="3" fill="#34D399" fillOpacity="0.15"
          animate={{ width: [0, 80 * b.pct] }} transition={{ duration: 1, delay: i * 0.2 }}
        />
        <text x="25" y={39 + i * 22} fill="#34D399" fontSize="6" fontFamily="monospace">${b.price}</text>
        <text x="90" y={39 + i * 22} textAnchor="end" fill="#34D399" fontSize="6" fontFamily="monospace" opacity="0.7">{b.qty}</text>
      </g>
    ))}
    <line x1="20" y1="96" x2="180" y2="96" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="4 2" />
    <text x="100" y="105" textAnchor="middle" fill="#F59E0B" fontSize="6" fontFamily="monospace">SPREAD: $0.60</text>
    {[
      { price: '53.00', qty: '95', pct: 0.7 },
      { price: '53.60', qty: '150', pct: 0.8 },
      { price: '54.20', qty: '60', pct: 0.45 },
    ].map((a, i) => (
      <g key={i}>
        <motion.rect x="20" y={112 + i * 14} height="10" rx="3" fill="#F87171" fillOpacity="0.15"
          animate={{ width: [0, 80 * a.pct] }} transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
        />
        <text x="25" y={121 + i * 14} fill="#F87171" fontSize="6" fontFamily="monospace">${a.price}</text>
        <text x="90" y={121 + i * 14} textAnchor="end" fill="#F87171" fontSize="6" fontFamily="monospace" opacity="0.7">{a.qty}</text>
      </g>
    ))}
  </svg>
);

const SecurityVisual = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="75" r="60" fill="url(#shieldGlow)" />
    <path d="M100 25 L140 42 L140 78 Q140 110 100 128 Q60 110 60 78 L60 42 Z"
      fill="#10B981" fillOpacity="0.1" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.6" />
    <rect x="88" y="68" width="24" height="20" rx="4" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="1" />
    <path d="M92 68 Q92 58 100 58 Q108 58 108 68" fill="none" stroke="#10B981" strokeWidth="1.5" />
    <circle cx="100" cy="78" r="3" fill="#10B981" />
    <line x1="100" y1="78" x2="100" y2="84" stroke="#10B981" strokeWidth="1.5" />
    {[
      { label: 'GDPR', x: 35, y: 128 },
      { label: 'KYC/AML', x: 83, y: 145 },
      { label: '2FA', x: 145, y: 128 },
    ].map((b, i) => (
      <g key={i}>
        <rect x={b.x - 14} y={b.y - 10} width="28" height="13" rx="6" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.5" />
        <text x={b.x} y={b.y} textAnchor="middle" fill="#10B981" fontSize="6" fontFamily="monospace">{b.label}</text>
      </g>
    ))}
    {[1, 2, 3].map(i => (
      <motion.circle key={i} cx="100" cy="75" r={30 + i * 15}
        fill="none" stroke="#10B981" strokeWidth="0.5"
        animate={{ opacity: [0.4, 0, 0.4], r: [30 + i * 15, 45 + i * 15] }}
        transition={{ duration: 3, delay: i * 0.8, repeat: Infinity }}
      />
    ))}
  </svg>
);

const TUTORIAL_STEPS = (): Step[] => [
  {
    id: 1,
    title: 'Welcome to LinkYourArt',
    description: 'The first investment platform that transforms creative projects into living financial assets.',
    color: 'text-primary-cyan',
    glowColor: 'rgba(0, 224, 255, 0.3)',
    icon: <Globe size={48} className="text-primary-cyan" />,
    points: [
      'Triangular ecosystem: Creators, Investors & Creative industry professionals',
      'Objective listing with LYA score out of 1000 points',
      'P2P Marketplace to trade your shares',
    ],
    visual: <GlobalEcosystemVisual />,
  },
  {
    id: 2,
    title: 'What is the LYA Score?',
    description: 'A revolutionary algorithm that evaluates each project on 1000 points in an objective and transparent way.',
    color: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    icon: <Zap size={48} className="text-purple-400" />,
    points: [
      '40% — Evaluation by creative sector experts + complementary AI',
      '30% — Social and community engagement',
      '30% — Market performance and indicators',
    ],
    visual: <LYAScoreVisual />,
  },
  {
    id: 3,
    title: 'For Creators',
    description: 'Submit your creative projects and obtain transparent financing without giving up artistic control.',
    color: 'text-emerald-400',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    icon: <Sparkles size={48} className="text-emerald-400" />,
    points: [
      'Professional evaluation by industry experts',
      'Fast and transparent financing',
      'Keep total creative control of your projects',
    ],
    visual: <CreatorVisual />,
  },
  {
    id: 4,
    title: 'For Investors',
    description: 'Buy indexed contractual rights of promising creative projects with full transparency.',
    color: 'text-accent-gold',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    icon: <Target size={48} className="text-accent-gold" />,
    points: [
      'Transparent listing based on the LYA score',
      'Diversify your portfolio in art',
      'Trade your shares on the P2P market',
    ],
    visual: <InvestorVisual />,
  },
  {
    id: 5,
    title: 'For Professionals',
    description: 'Evaluate creative projects and enhance your expertise within an exclusive network.',
    color: 'text-pink-400',
    glowColor: 'rgba(244, 114, 182, 0.3)',
    icon: <Users size={48} className="text-pink-400" />,
    points: [
      'Recognized and valued expertise',
      'Support emerging talents',
      'Exclusive professional network',
    ],
    visual: <ProfessionalVisual />,
  },
  {
    id: 6,
    title: 'Explore Projects',
    description: 'Several ways to discover creative projects that match your interests and investment strategy.',
    color: 'text-cyan-400',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    icon: <Layers size={48} className="text-cyan-400" />,
    points: [
      'Swipe Mode for quick discovery',
      'LYA Exchange Center to follow trends',
      'Advanced filters by category, score, budget',
    ],
    visual: <ExploreVisual />,
  },
  {
    id: 7,
    title: 'Create your Watchlist',
    description: 'Follow your favorite projects and never miss an opportunity in the creative market.',
    color: 'text-red-400',
    glowColor: 'rgba(248, 113, 113, 0.3)',
    icon: <Target size={48} className="text-red-400" />,
    points: [
      'Real-time performance notifications',
      'Price listing change alerts',
      'Personalized portfolio tracking',
    ],
    visual: <WatchlistVisual />,
  },
  {
    id: 8,
    title: 'Invest Smartly',
    description: 'Analyze data and invest in projects that suit you with professional-grade tools.',
    color: 'text-indigo-400',
    glowColor: 'rgba(129, 140, 248, 0.3)',
    icon: <BarChart3 size={48} className="text-indigo-400" />,
    points: [
      'Detailed analytical dashboards',
      'Side-by-side project comparison',
      'Full performance history',
    ],
    visual: <InvestVisual />,
  },
  {
    id: 9,
    title: 'Integrated P2P Market',
    description: 'Trade your contractual rights with immediate liquidity on our secure marketplace.',
    color: 'text-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    icon: <TrendingUp size={48} className="text-amber-400" />,
    points: [
      'Transaction fees between 2 and 5%',
      'Prices based on objective LYA listing',
      'Secured smart contracts',
    ],
    visual: <P2PMarketVisual />,
  },
  {
    id: 10,
    title: 'Security & Compliance',
    description: 'Secure platform with GDPR compliance and strict legal framework for all transactions.',
    color: 'text-emerald-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: <Shield size={48} className="text-emerald-500" />,
    points: [
      'End-to-end encryption of all data',
      'Multi-factor authentication (2FA)',
      'Certified contractual rights and KYC/AML',
    ],
    visual: <SecurityVisual />,
  },
];

);
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptTutorial: React.FC<Props> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = TUTORIAL_STEPS();
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-surface-dim border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          style={{ boxShadow: `0 0 60px ${step.glowColor}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                Step {currentStep + 1} / {steps.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-on-surface-variant hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left — Text */}
                <div>
                  <div className="mb-4">{step.icon}</div>
                  <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 ${step.color}`}>
                    {step.title}
                  </h2>
                  <p className="text-[10px] md:text-sm text-on-surface-variant font-medium leading-relaxed opacity-80 mx-auto max-w-sm">
                    {step.description}
                  </p>
                  <ul className="space-y-2 w-full mt-4">
                    {step.points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
                      >
                        <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black italic border ${step.color.replace('text-', 'border-').replace('text-', 'bg-').replace('400', '400/20').replace('500', '500/20')}`}>
                          {i + 1}
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold text-white/90 uppercase tracking-tight leading-snug">
                          {point}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Right — Visual */}
                <div className="hidden md:flex items-center justify-center h-48">
                  {step.visual}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6 bg-surface-low/50 border-t border-white/5 shrink-0">
            {/* Progress Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-500 ${i === currentStep ? `w-5 ${step.color.replace('text-', 'bg-')}` : 'bg-white/10'}`}
                />
              ))}
            </div>

            <div className="w-full flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
              >
                <ChevronLeft size={14} /> Back
              </button>

              <button
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors p-2"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl ${step.color.replace('text-', 'bg-').replace('400', '400/20').replace('500', '500/20')} border ${step.color.replace('text-', 'border-')} ${step.color} hover:${step.color.replace('text-', 'bg-').replace('400', '400/30').replace('500', '500/30')}`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle2 size={16} /> Get Started!
                  </>
                ) : (
                  <>
                    Next <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
