
import React from 'react';
import { motion } from 'motion/react';
import { Star, ArrowUpRight, ArrowDownLeft, Trash2, LayoutGrid, List } from 'lucide-react';
import { CONTRACTS, Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';

import { PageHeader } from '../components/ui/PageHeader';

interface WatchlistViewProps {
  onNotify: (msg: string) => void;
  watchlist: string[];
  allContracts: Contract[];
  onToggleWatchlist: (e: React.MouseEvent, id: string) => void;
  onSelectContract: (contract: Contract) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ 
  onNotify, 
  watchlist, 
  allContracts,
  onToggleWatchlist,
  onSelectContract
}) => {
  const { t } = useTranslation();
  const watchlistedContracts = allContracts.filter(c => watchlist.includes(c.id));

  // Dynamic grid setup
  const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-3'; // 3, 4, etc.
  };

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Smart', 'LISTE DE')}
        titleAccent={t('Watchlist', 'SURVEILLANCE')}
        description={t('MONITORING ACTIVE CREATIVE ASSETS AND MARKET PERFORMANCE. Limit of 15 assets for standard users.', 'SURVEILLANCE DES ACTIFS CRÉATIFS ACTIFS ET DES PERFORMANCES DU MARCHÉ. Limite de 15 actifs pour les utilisateurs standard.')}
        accentColor="text-accent-gold"
      />

      <div className="relative z-20 -mt-32 mb-12 px-6 md:px-12 flex flex-col lg:flex-row lg:items-end justify-end gap-8">
        <div className="flex items-center gap-4 bg-surface-high/50 p-1 rounded-lg border border-white/5">
          <button className="p-2 bg-primary-cyan text-surface-dim rounded-md shadow-lg">
            <LayoutGrid size={18} />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-white transition-colors">
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="px-6 md:px-12">
      {watchlistedContracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-surface-high rounded-full flex items-center justify-center text-on-surface-variant/20 mb-6">
            <Star size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t('No contracts in watchlist', 'Aucun contrat dans la liste de veille')}</h2>
          <p className="text-sm text-on-surface-variant max-w-xs opacity-60">
            {t('Add contracts to your watchlist to monitor their performance and receive real-time updates.', 'Ajoutez des contrats à votre liste de veille pour surveiller leur performance et recevoir des mises à jour en temps réel.')}
          </p>
        </div>
      ) : (
        <div className={`grid ${getGridCols(watchlistedContracts.length)} gap-6`}>
          {watchlistedContracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface-high border border-white/10 rounded-2xl overflow-hidden hover:border-primary-cyan/50 transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={contract.image} 
                  alt={contract.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="px-2 py-0.5 bg-primary-cyan text-surface-dim text-[8px] font-black uppercase tracking-widest rounded-full">
                    {contract.rarity}
                  </div>
                  <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                    {contract.category}
                  </div>
                </div>

                <button 
                  onClick={(e) => onToggleWatchlist(e, contract.id)}
                  className="absolute top-4 right-4 p-2 bg-primary-cyan text-surface-dim rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Star size={16} fill="currentColor" />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black font-headline text-white tracking-tight group-hover:text-primary-cyan transition-colors line-clamp-1">{contract.name}</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">{contract.issuerId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">${contract.unitValue?.toLocaleString() || '0'}</div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-bold">
                      <ArrowUpRight size={10} />
                      +2.4%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5 mb-6">
                  <div>
                    <div className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 opacity-50">{t('Revenue Share', 'Part de Revenus')}</div>
                    <div className="text-xs font-bold text-accent-gold">{contract.revenueSharePercentage}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 opacity-50">{t('Volume (24h)', 'Volume (24h)')}</div>
                    <div className="text-xs font-bold text-white">1,240 LYA</div>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => onSelectContract(contract)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm"
                  >
                    {t('View Details', 'Voir Détails')}
                  </button>
                  <button 
                    onClick={(e) => onToggleWatchlist(e, contract.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all rounded-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
