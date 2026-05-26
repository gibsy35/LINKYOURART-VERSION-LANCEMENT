
import React from 'react';
import { motion } from 'motion/react';
import { Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface NewsTickerItem {
  label: string;
  content: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  icon?: React.ReactNode;
  contractId?: string;
}

interface BreakingNewsTickerProps {
  items?: NewsTickerItem[];
  onItemClick?: (item: NewsTickerItem) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ items, onItemClick }) => {
  const { t } = useTranslation();

  const defaultItems: NewsTickerItem[] = [
    { label: t('Breaking News', 'Flash Info'), content: t('LYA Protocol v2.5.0 Deployment Successful', 'Déploiement du protocole LYA v2.5.0 réussi'), type: 'DANGER', icon: <div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" /> },
    { label: t('Market Alert', 'Alerte Marché'), content: t('Digital Art Index High Volatility', 'Haute Volatilité de l\'Indice Art Digital'), type: 'SUCCESS' },
    { label: t('New Listing', 'Nouvelle Inscription'), content: t('NEON_GENESIS Project Indexed at 892 LYA', 'Projet NEON_GENESIS indexé à 892 LYA'), type: 'INFO' },
    { label: t('Professional Node', 'Nœud Professionnel'), content: t('A24_FILMS Validation Complete', 'Validation A24_FILMS terminée'), type: 'WARNING' }
  ];

  const displayItems = items || defaultItems;

  const getTypeColor = (type: NewsTickerItem['type']) => {
    switch (type) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'WARNING': return 'text-accent-gold';
      case 'DANGER': return 'text-red-500/70';
      default: return 'text-primary-cyan';
    }
  };

  return (
    <div className="bg-surface-dim/95 backdrop-blur-xl h-8 flex items-center overflow-hidden relative z-50 border-y border-white/5">
      <div className="flex items-center gap-16 animate-marquee whitespace-nowrap px-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <React.Fragment key={i}>
            {displayItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <span 
                  onClick={() => onItemClick?.(item)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${getTypeColor(item.type)} ${onItemClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                  {item.icon} {item.label}: <span className="text-white">{item.content}</span>
                </span>
                <span className="text-white/20 font-mono">||</span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
