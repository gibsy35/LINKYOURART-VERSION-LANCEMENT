import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Scale, Sparkles, ArrowRight } from 'lucide-react';
import { CONTRACTS, Contract, UserProfile } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { getSafeImageUrl } from '../utils/image';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface SwipeViewProps {
  user: UserProfile | null;
  usageStats: { swipe: number; compare: number };
  onUsageUpdate: (stats: any) => void;
  onNotify: (msg: string) => void;
  watchlist: string[];
  allContracts: Contract[];
  onToggleWatchlist: (e: React.MouseEvent | { stopPropagation: () => void }, id: string, force?: 'add' | 'remove') => void;
  comparisonList: string[];
  onToggleComparison: (id: string) => void;
  onViewChange?: (view: any) => void;
  checkUsageLimit: (type: 'swipe' | 'compare') => boolean;
}

// Chaque univers a sa propre couleur d'accent, a la maniere des captures de reference.
const UNIVERS_STYLES: Record<string, { accent: string; bg: string; border: string; label: string; labelFR: string }> = {
  'Film':            { accent: '#B695F5', bg: 'from-[#2A1C4A] to-[#0F0A1C]', border: 'border-[#B695F5]/25', label: 'Cinematic Worlds',       labelFR: 'Univers Cinema' },
  'TV Series':       { accent: '#6FD8F5', bg: 'from-[#123239] to-[#081418]', border: 'border-[#6FD8F5]/25', label: 'Series & Episodes',      labelFR: 'Series & Episodes' },
  'Fine Art':        { accent: '#F14C86', bg: 'from-[#3A1226] to-[#160810]', border: 'border-[#F14C86]/25', label: 'Fine Art Circle',        labelFR: 'Cercle des Beaux-Arts' },
  'Fashion':         { accent: '#E5A63C', bg: 'from-[#3A2A0E] to-[#160F04]', border: 'border-[#E5A63C]/25', label: 'Fashion & Runway',       labelFR: 'Mode & Podiums' },
  'Architecture':    { accent: '#4CD98A', bg: 'from-[#0F3320] to-[#06140D]', border: 'border-[#4CD98A]/25', label: 'Built Environments',     labelFR: 'Univers Architecture' },
  'Music':           { accent: '#F5D76F', bg: 'from-[#3A320E] to-[#161204]', border: 'border-[#F5D76F]/25', label: 'Sound & Music',          labelFR: 'Son & Musique' },
  'Podcast':         { accent: '#5FC7C2', bg: 'from-[#0E3230] to-[#041413]', border: 'border-[#5FC7C2]/25', label: 'Voices & Podcasts',      labelFR: 'Voix & Podcasts' },
  'Photography':     { accent: '#7FA8F0', bg: 'from-[#122140] to-[#060B18]', border: 'border-[#7FA8F0]/25', label: 'Photography',           labelFR: 'Photographie' },
  'Gaming':          { accent: '#D66FE0', bg: 'from-[#2E1140] to-[#120618]', border: 'border-[#D66FE0]/25', label: 'Gaming Worlds',          labelFR: 'Univers Gaming' },
  'Digital Art':     { accent: '#6FE0C8', bg: 'from-[#0E3A30] to-[#041814]', border: 'border-[#6FE0C8]/25', label: 'Digital Art',            labelFR: 'Art Numerique' },
  'Literature':      { accent: '#E08F6F', bg: 'from-[#3A1F0E] to-[#160C04]', border: 'border-[#E08F6F]/25', label: 'Literary Circle',        labelFR: 'Cercle Litteraire' },
  'Design':          { accent: '#9CA8F0', bg: 'from-[#1A1E40] to-[#0A0C18]', border: 'border-[#9CA8F0]/25', label: 'Design & Objects',       labelFR: 'Design & Objets' },
  'Performing Arts': { accent: '#F0708F', bg: 'from-[#3A0E1C] to-[#16040B]', border: 'border-[#F0708F]/25', label: 'Performing Arts',        labelFR: 'Arts de la Scene' },
  'Gastronomy':      { accent: '#E5C23C', bg: 'from-[#3A300E] to-[#161204]', border: 'border-[#E5C23C]/25', label: 'Gastronomy',             labelFR: 'Gastronomie' },
};

const DEFAULT_STYLE = { accent: '#8A8D97', bg: 'from-surface-high to-surface-dim', border: 'border-white/10', label: 'Discover', labelFR: 'Decouverte' };

export const SwipeView: React.FC<SwipeViewProps> = ({
  user,
  onNotify,
  watchlist,
  allContracts,
  onToggleWatchlist,
  comparisonList,
  onToggleComparison,
  onViewChange,
}) => {
  const { t, language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [likedProjects, setLikedProjects] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const ref = doc(db, 'swipe_likes', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setLikedProjects(snap.data().liked || []);
      } catch (e) {
        console.warn('SwipeView: impossible de charger les suivis', e);
      }
    };
    load();
  }, [user?.uid]);

  const saveFollow = async (contractId: string) => {
    if (!user?.uid) return;
    try {
      const ref = doc(db, 'swipe_likes', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { liked: arrayUnion(contractId), updatedAt: new Date().toISOString() });
      } else {
        await setDoc(ref, { liked: [contractId], userId: user.uid, updatedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('SwipeView: impossible d enregistrer le suivi', e);
    }
  };

  const removeFollow = async (contractId: string) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'swipe_likes', user.uid), { liked: arrayRemove(contractId), updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('SwipeView: impossible de retirer le suivi', e);
    }
  };

  const toggleFollow = (contract: Contract) => {
    const already = likedProjects.includes(contract.id);
    if (already) {
      setLikedProjects(prev => prev.filter(id => id !== contract.id));
      removeFollow(contract.id);
    } else {
      setLikedProjects(prev => [...prev, contract.id]);
      saveFollow(contract.id);
      onNotify(t('Following this project', 'Projet suivi'));
    }
  };

  const source = allContracts && allContracts.length ? allContracts : CONTRACTS;

  const universes = useMemo(() => {
    const groups: Record<string, Contract[]> = {};
    source.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return Object.entries(groups)
      .map(([category, projects]) => ({ category, projects }))
      .sort((a, b) => b.projects.length - a.projects.length);
  }, [source]);

  const activeProjects = activeCategory ? (universes.find(u => u.category === activeCategory)?.projects || []) : [];

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader
        titleWhite={t('Discover the', 'Decouvrez les')}
        titleAccent={t('Universes', 'Univers')}
        description={t('CURATED COLLECTIONS OF CERTIFIED PROJECTS, GROUPED BY CREATIVE UNIVERSE.', 'DES SELECTIONS DE PROJETS CERTIFIES, REGROUPES PAR UNIVERS CREATIF.')}
        accentColor="text-primary-cyan"
      />

      {!activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universes.map(({ category, projects }, i) => {
            const style = UNIVERS_STYLES[category] || DEFAULT_STYLE;
            const cover = projects[0];
            return (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(category)}
                className={`relative text-left rounded-3xl overflow-hidden border ${style.border} bg-gradient-to-br ${style.bg} p-6 h-64 flex flex-col justify-end group`}
              >
                {cover && (
                  <img
                    src={getSafeImageUrl(cover.image, category)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70" style={{ color: style.accent }}>
                    {t(`Because you follow: ${category}`, `Parce que vous suivez : ${category}`)}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                    {language === 'FR' ? style.labelFR : style.label}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-surface-dim rounded-xl text-xs font-black uppercase tracking-widest">
                    {t('See projects', 'Voir les projets')} <ArrowRight size={13} />
                  </div>
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-black text-white">
                  {projects.length}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {activeCategory && (
        <div>
          <button
            onClick={() => setActiveCategory(null)}
            className="mb-8 text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors flex items-center gap-2"
          >
            {t('< All universes', '< Tous les univers')}
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="h-[1px] w-8" style={{ background: (UNIVERS_STYLES[activeCategory] || DEFAULT_STYLE).accent }} />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              {language === 'FR' ? (UNIVERS_STYLES[activeCategory] || DEFAULT_STYLE).labelFR : (UNIVERS_STYLES[activeCategory] || DEFAULT_STYLE).label}
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((contract) => {
                const style = UNIVERS_STYLES[activeCategory] || DEFAULT_STYLE;
                const following = likedProjects.includes(contract.id);
                return (
                  <motion.div
                    key={contract.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-high/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getSafeImageUrl(contract.image, contract.category)}
                        alt={contract.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-sm font-black text-white tracking-tight">{contract.name}</h4>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFollow(contract); }}
                          className={`p-2 rounded-full backdrop-blur-md border transition-all ${following ? 'text-surface-dim' : 'bg-black/30 border-white/15 text-white'}`}
                          style={following ? { background: style.accent, borderColor: style.accent } : undefined}
                          aria-label={t('Follow', 'Suivre')}
                        >
                          <Heart size={14} fill={following ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleComparison(contract.id); }}
                          className={`p-2 rounded-full backdrop-blur-md border transition-all ${comparisonList.includes(contract.id) ? 'bg-primary-cyan border-primary-cyan text-surface-dim' : 'bg-black/30 border-white/15 text-white'}`}
                          aria-label={t('Compare', 'Comparer')}
                        >
                          <Scale size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                        {language === 'FR' && contract.descriptionFR ? contract.descriptionFR : contract.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: style.accent }}>
                          {t('LYA Score', 'Score LYA')}
                        </span>
                        <span className="text-sm font-black text-white">{contract.totalScore}<span className="text-on-surface-variant/40 text-[10px]">/1000</span></span>
                      </div>
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('lya-view-project', { detail: contract.id }));
                          onViewChange?.('PROJECT_PUBLIC');
                        }}
                        className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-surface-dim transition-all"
                      >
                        {t('View certification', 'Voir la certification')}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      )}

      {!activeCategory && likedProjects.length > 0 && (
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={14} className="text-primary-cyan" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Projects you follow', 'Projets que vous suivez')} - {likedProjects.length}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {likedProjects.map(id => {
              const proj = source.find(c => c.id === id);
              if (!proj) return null;
              return (
                <div key={id} className="flex items-center gap-3 p-3 bg-surface-high/30 border border-white/6 rounded-xl">
                  <img src={proj.image} alt={proj.name} className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-on-surface truncate">{proj.name}</p>
                    <p className="text-xs text-on-surface-variant/50">{proj.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest">{t('Score', 'Score')}</p>
                    <p className="text-sm font-black text-primary-cyan">{proj.totalScore}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
