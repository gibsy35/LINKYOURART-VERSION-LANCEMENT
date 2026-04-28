
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Hash, DollarSign } from 'lucide-react';
import { Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export const OfferModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, contract }) => {
  const { t } = useTranslation();
  if (!contract) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface-dim/90 backdrop-blur-sm z-[300]" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 flex items-center justify-center p-4 z-[301] pointer-events-none">
            <div className="bg-surface-dim border border-white/10 w-full max-w-md p-6 pointer-events-auto font-mono relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('MAKE AN OFFER', 'FAIRE UNE OFFRE')}</span>
                <button onClick={onClose} className="text-on-surface-variant hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] text-on-surface-variant/60 font-bold uppercase mb-1">{t('ASSET', 'ACTIF')}</div>
                <div className="p-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase">{contract.name}</div>
                
                <div>
                   <label className="text-[10px] text-on-surface-variant/60 font-bold uppercase block mb-1">{t('OFFER AMOUNT (USD)', 'MONTANT DE L\'OFFRE (USD)')}</label>
                   <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-cyan" />
                      <input type="number" className="w-full bg-white/5 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary-cyan" placeholder="0.00" />
                   </div>
                </div>

                <button className="w-full py-3 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-widest hover:bg-white transition-all">
                  {t('SUBMIT OFFER', 'SOUMETTRE L\'OFFRE')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const TransferModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, contract }) => {
  const { t } = useTranslation();
  if (!contract) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface-dim/90 backdrop-blur-sm z-[300]" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 flex items-center justify-center p-4 z-[301] pointer-events-none">
            <div className="bg-surface-dim border border-white/10 w-full max-w-md p-6 pointer-events-auto font-mono relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('TRANSFER ASSET', 'TRANSFÉRER L\'ACTIF')}</span>
                <button onClick={onClose} className="text-on-surface-variant hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] text-on-surface-variant/60 font-bold uppercase mb-1">{t('CONTRACT_ID', 'ID_CONTRAT')}</div>
                <div className="p-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase overflow-hidden text-ellipsis whitespace-nowrap">{contract.id}</div>
                
                <div>
                   <label className="text-[10px] text-on-surface-variant/60 font-bold uppercase block mb-1">{t('RECIPIENT_WALLET_OR_ID', 'PORTEFEUILLE_OU_ID_DESTINATAIRE')}</label>
                   <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-cyan" />
                      <input type="text" className="w-full bg-white/5 border border-white/10 p-3 pl-10 text-white focus:outline-none focus:border-primary-cyan uppercase" placeholder="LYA-XXXX-XXXX" />
                   </div>
                </div>

                <div className="p-4 bg-primary-cyan/5 border border-primary-cyan/20 flex gap-3 italic">
                  <Send size={16} className="text-primary-cyan flex-shrink-0" />
                  <p className="text-[9px] text-primary-cyan leading-relaxed">
                    {t('WARNING: ASSET TRANSFERS ARE PERMANENT AND CANNOT BE REVERSED ONCE CLEARED BY THE LYA SETTLEMENT LAYER.', 'AVERTISSEMENT: LES TRANSFERTS D\'ACTIFS SONT PERMANENTS ET NE PEUVENT PAS ÊTRE ANNULÉS UNE FOIS COMPENSÉS PAR LA COUCHE DE RÈGLEMENT LYA.')}
                  </p>
                </div>

                <button className="w-full py-3 bg-white text-surface-dim text-xs font-black uppercase tracking-widest hover:bg-primary-cyan transition-all">
                  {t('AUTHORIZE TRANSFER', 'AUTORISER LE TRANSFERT')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
