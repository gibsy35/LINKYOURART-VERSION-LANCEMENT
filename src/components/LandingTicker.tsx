import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, Newspaper, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import type { Contract } from '../types';

interface LandingTickerProps {
  liveProjects: Contract[];
}

// Partnership / announcement slot — distinct from live registry data, meant
// to be edited directly here whenever there's a partnership or news item to
// surface publicly. Kept as a simple array (not Firestore-backed) so it's a
// one-line code change rather than a CMS to maintain for a handful of
// occasional announcements.
const ANNOUNCEMENTS: { fr: string; en: string }[] = [
  { fr: "LinkYourArt ouvre ses inscriptions — rejoignez les LYA Originals", en: 'LinkYourArt is now open for registration — join the LYA Originals' },
];

export const LandingTicker: React.FC<LandingTickerProps> = ({ liveProjects }) => {
  const { t, language } = useTranslation();

  const rows = useMemo(() => {
    const mediaAnnouncements = [
      t('New article on LYA certification standard', 'Nouvel article sur le standard de certification LYA'),
      t('Press & Media: new call for contributions', 'Presse & Médias : nouvel appel à contribution'),
    ];
    const registryStats = [
      t('128+ certified projects on the LYA Registry', '128+ projets certifiés sur le Registre LYA'),
      t('9+ creative sectors covered', '9+ secteurs créatifs couverts'),
      t('100+ active professional validators', '100+ validateurs professionnels actifs'),
    ];
    const sectorHighlights = [
      t('Film & TV: strongest certification growth this quarter', 'Film & TV : plus forte croissance de certification ce trimestre'),
      t('Music: rising number of certified catalogs', 'Musique : nombre croissant de catalogues certifiés'),
    ];

    type Row = { key: string; node: React.ReactNode };
    const items: Row[] = [];

    ANNOUNCEMENTS.forEach((a, i) => {
      items.push({
        key: `announce-${i}`,
        node: (
          <div className="flex items-center gap-2 h-full px-4 border-l-2 border-accent-gold/40 bg-accent-gold/5">
            <Star size={11} className="text-accent-gold shrink-0" />
            <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">{language === 'FR' ? a.fr : a.en}</span>
          </div>
        ),
      });
    });

    liveProjects.slice(0, 10).forEach((proj, i) => {
      items.push({
        key: `score-${proj.id || i}`,
        node: (
          <div className="flex items-center gap-3 h-full px-4 border-l-2 border-primary-cyan/30">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{proj.name}</span>
            <span className="text-[10px] text-white/30 font-bold uppercase">{proj.category}</span>
            <div className="flex items-center gap-1">
              <Award size={10} className="text-accent-gold" />
              <span className="text-[10px] font-mono font-bold text-accent-gold">{proj.totalScore || proj.scoreLYA || 0}/1000</span>
            </div>
          </div>
        ),
      });
    });

    mediaAnnouncements.forEach((txt, i) => items.push({
      key: `media-${i}`,
      node: (
        <div className="flex items-center gap-2 h-full px-4 border-l-2 border-[#a78bfa]/30">
          <Newspaper size={11} className="text-[#a78bfa]" />
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest">{txt}</span>
        </div>
      ),
    }));

    registryStats.forEach((txt, i) => items.push({
      key: `stat-${i}`,
      node: (
        <div className="flex items-center gap-2 h-full px-4 border-l-2 border-primary-cyan/30">
          <ShieldCheck size={11} className="text-primary-cyan" />
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest">{txt}</span>
        </div>
      ),
    }));

    sectorHighlights.forEach((txt, i) => items.push({
      key: `sector-${i}`,
      node: (
        <div className="flex items-center gap-2 h-full px-4 border-l-2 border-emerald-400/30">
          <TrendingUp size={11} className="text-emerald-400" />
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest">{txt}</span>
        </div>
      ),
    }));

    return [...items, ...items];
  }, [liveProjects, language, t]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-9 bg-[#05060a]/95 backdrop-blur-sm border-t border-white/10 z-[60] overflow-hidden flex items-center">
      <div className="shrink-0 h-full px-3 bg-primary-cyan text-[#05060a] flex items-center gap-2 z-10">
        <span className="text-[10px] font-black uppercase tracking-tighter">{t('LIVE', 'DIRECT')}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#05060a] animate-pulse" />
      </div>
      <div className="relative flex-1 h-full overflow-hidden">
        <motion.div
          className="flex items-center h-full whitespace-nowrap absolute left-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
        >
          {rows.map((r, i) => <div key={`${r.key}-${i}`} className="h-full flex items-center">{r.node}</div>)}
        </motion.div>
      </div>
    </div>
  );
};
