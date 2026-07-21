
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Newspaper, Award, Users, ShieldCheck } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import { useTranslation } from '../../context/LanguageContext';

interface TickerItem {
  type: 'score' | 'media' | 'milestone' | 'stat';
  key: string;
  content: React.ReactNode;
  onClick?: () => void;
}

export const Ticker: React.FC = () => {
  const { contracts } = useMarketData();
  const { t } = useTranslation();

  const mediaAnnouncements = [
    t('Press & Media: 4 new call for contributions this week', 'Presse & Médias : 4 nouveaux appels à contribution cette semaine'),
    t('New article published on LYA certification standard', 'Nouvel article publié sur le standard de certification LYA'),
    t('LYA Jobs: new listings from certified studios', 'LYA Jobs : nouvelles offres de studios certifiés'),
  ];

  const registryStats = [
    t('128+ certified projects on the LYA Registry', '128+ projets certifiés sur le Registre LYA'),
    t('9+ creative sectors covered — new sectors added quarterly', '9+ secteurs créatifs couverts — nouveaux secteurs ajoutés chaque trimestre'),
    t('100+ active professional validators', '100+ validateurs professionnels actifs'),
  ];

  const tickerItems: TickerItem[] = useMemo(() => {
    const items: TickerItem[] = [];

    contracts.slice(0, 12).forEach((c) => {
      const isUp = c.growth >= 0;
      items.push({
        type: 'score',
        key: `score-${c.id}`,
        onClick: () => window.dispatchEvent(new CustomEvent('ticker-contract-select', { detail: c })),
        content: (
          <div className="flex items-center gap-4 group cursor-pointer">
            <span className="text-[10px] font-black text-white group-hover:text-primary-cyan transition-colors uppercase tracking-tight">{c.name}</span>
            <div className="flex items-center gap-1">
              {isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-400" />}
              <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>{isUp ? '+' : ''}{c.growth}%</span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant/40">{c.totalScore}/1000</span>
          </div>
        ),
      });

      if (c.milestones && c.milestones.length > 0) {
        const m = c.milestones[c.milestones.length - 1];
        items.push({
          type: 'milestone',
          key: `milestone-${c.id}`,
          content: (
            <div className="flex items-center gap-2">
              <Award size={10} className="text-accent-gold" />
              <span className="text-[10px] font-bold text-accent-gold uppercase tracking-tight">{c.name}:</span>
              <span className="text-[10px] text-on-surface-variant/60">{m.label}</span>
            </div>
          ),
        });
      }
    });

    mediaAnnouncements.forEach((text, i) => {
      items.push({
        type: 'media',
        key: `media-${i}`,
        content: (
          <div className="flex items-center gap-2">
            <Newspaper size={10} className="text-[#a78bfa]" />
            <span className="text-[10px] text-on-surface-variant/70">{text}</span>
          </div>
        ),
      });
    });

    registryStats.forEach((text, i) => {
      items.push({
        type: 'stat',
        key: `stat-${i}`,
        content: (
          <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-primary-cyan" />
            <span className="text-[10px] text-on-surface-variant/70">{text}</span>
          </div>
        ),
      });
    });

    // Mélange pour alterner les types de contenu plutôt que de les grouper
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(((i * 2654435761) % (i + 1) + (i + 1)) % (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
  }, [contracts]);

  const loopItems = [...tickerItems, ...tickerItems];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-surface-dim border-t border-white/5 z-[80] overflow-hidden flex items-center font-mono">
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-primary-cyan text-surface-dim flex items-center gap-2 z-10 border-r border-white/10">
        <span className="text-xs font-black uppercase tracking-tighter">LIVE_FEED</span>
        <div className="w-1.5 h-1.5 rounded-full bg-surface-dim animate-pulse" />
      </div>

      <motion.div 
        className="flex items-center gap-12 pl-32 whitespace-nowrap"
        animate={{ x: [0, -4000] }}
        transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
      >
        {loopItems.map((item, i) => (
          <div key={`${item.key}-${i}`} onClick={item.onClick}>
            {item.content}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
