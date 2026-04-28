
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Hash, Star, Layout, LogOut, ArrowRight, User } from 'lucide-react';
import { CONTRACTS, Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: any) => void;
  onSelectContract: (contract: Contract) => void;
  onLogout: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onViewChange,
  onSelectContract,
  onLogout
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Contract[]>([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const filtered = CONTRACTS.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.id.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
    }
  }, [query]);

  const actions = [
    { id: 'DASHBOARD', icon: Layout, label: t('GOTO_DASHBOARD', 'ALLER_AU_TABLEAU_DE_BORD') },
    { id: 'EXCHANGE', icon: Star, label: t('GOTO_EXCHANGE', 'ALLER_À_LA_BOURSE') },
    { id: 'PROFILE', icon: User, label: t('VIEW_PROFILE', 'VOIR_LE_PROFIL') },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-surface-dim/90 backdrop-blur-xl z-[2000] flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-surface-dim border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden font-mono"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 p-6 border-b border-white/5">
            <Search size={22} className="text-primary-cyan" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('TERMINAL_COMMAND...', 'COMMANDE_TERMINAL...')}
              className="flex-1 bg-transparent border-none text-xl text-white focus:ring-0 uppercase font-black placeholder:text-white/10"
            />
            <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-on-surface-variant font-bold uppercase">ESC</div>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {results.length > 0 && (
              <div className="mb-8">
                <div className="px-4 mb-4 text-[10px] text-primary-cyan font-black uppercase tracking-[0.2em]">{t('MATCHING_CONTRACTS', 'CONTRATS_CORRESPONDANTS')}</div>
                <div className="space-y-1">
                  {results.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => { onSelectContract(c); onClose(); }}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 group transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-primary-cyan group-hover:bg-primary-cyan group-hover:text-surface-dim transition-all">
                          <Hash size={18} />
                        </div>
                        <div>
                          <div className="text-[12px] font-black text-white uppercase group-hover:text-primary-cyan">{c.name}</div>
                          <div className="text-[10px] text-on-surface-variant/40 font-bold uppercase">{c.id}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-white/0 group-hover:text-primary-cyan -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
               <div className="px-4 mb-4 text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em]">{t('QUICK_ACTIONS', 'ACTIONS_RAPIDES')}</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {actions.map(action => (
                    <button 
                      key={action.id}
                      onClick={() => { onViewChange(action.id as any); onClose(); }}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 group transition-all text-left border border-transparent hover:border-white/5"
                    >
                      <action.icon size={18} className="text-on-surface-variant group-hover:text-primary-cyan" />
                      <span className="text-[11px] font-black text-white uppercase group-hover:text-primary-cyan">{action.label}</span>
                    </button>
                 ))}
                 <button 
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex items-center gap-4 p-4 hover:bg-red-500/10 group transition-all text-left border border-transparent hover:border-red-500/10"
                >
                  <LogOut size={18} className="text-red-500/60 group-hover:text-red-500" />
                  <span className="text-[11px] font-black text-white uppercase group-hover:text-red-500">{t('LOGOUT', 'DÉCONNEXION')}</span>
                </button>
               </div>
            </div>
          </div>

          <div className="p-4 bg-white/2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-on-surface-variant/30 uppercase">
             <div className="flex gap-4">
                <span><b className="text-on-surface-variant/60">↑↓</b> {t('NAVIGATE', 'NAVIGUER')}</span>
                <span><b className="text-on-surface-variant/60">ENTER</b> {t('EXECUTE', 'EXÉCUTER')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse" />
                <span>LYA_OS_v2.5_ACTIVE</span>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
