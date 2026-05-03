
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ArrowRight, Zap, Target, Lock, Info, Star } from 'lucide-react';
import { Contract } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-dim/90 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[201] p-0 sm:p-6"
          >
            <div className="bg-surface-dim border border-white/10 w-full max-w-2xl pointer-events-auto relative shadow-2xl h-full sm:h-auto max-h-screen sm:max-h-[85vh] md:max-h-[92vh] font-mono custom-scrollbar flex flex-col sm:rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 sticky top-0 z-20 backdrop-blur-xl shrink-0">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{title}</span>
                <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                {children}
              </div>
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary-cyan/30 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary-cyan/30 pointer-events-none" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const ContractDetailModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  contract: Contract | null;
  onTrade?: (contract: Contract, type: 'BUY' | 'SELL') => void;
}> = ({ isOpen, onClose, contract, onTrade }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  if (!contract) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`CONTRACT_ID: ${contract.id}`}>
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="w-32 h-32 bg-white/5 border border-white/10 flex items-center justify-center p-4">
             <div className="w-16 h-16 border border-primary-cyan/20 rounded-full flex items-center justify-center animate-pulse">
                <Target size={32} className="text-primary-cyan" />
             </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-2 uppercase">{contract.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 bg-primary-cyan/10 text-primary-cyan text-[10px] font-bold uppercase">{contract.rarity}</span>
              <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase whitespace-nowrap">{contract.category}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant/60 leading-relaxed uppercase">{contract.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'UNIT_VALUE', value: formatPrice(contract.unitValue) },
            { label: 'TOTAL_UNITS', value: contract.totalUnits.toLocaleString() },
            { label: 'JURISDICTION', value: contract.jurisdiction },
          ].map(stat => (
            <div key={stat.label} className="p-3 bg-white/5 border border-white/5">
              <div className="text-[9px] text-on-surface-variant/40 font-bold mb-1 uppercase tracking-widest">{stat.label}</div>
              <div className="text-sm font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2 border border-white/10 text-[10px] font-black text-white hover:bg-white/5 transition-all uppercase tracking-widest">
            {t('VIEW_TECHNICAL_SHEET', 'VOIR_FICHE_TECHNIQUE')}
          </button>
          <button 
            onClick={() => onTrade?.(contract, 'BUY')}
            className="px-6 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
          >
            {t('EXECUTE_TRADE', 'EXÉCUTER_TRANSACTION')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

import { simulatePDFDownload } from '../utils/download';

export const ComplianceCertificateModal: React.FC<{ isOpen: boolean; onClose: () => void; contractId: string | null }> = ({ isOpen, onClose, contractId }) => {
  const { t } = useTranslation();
  if (!contractId) return null;

  const handleDownload = () => {
    simulatePDFDownload(
      `Compliance_Audit_${contractId}`,
      `This document certifies that the creative contract associated with Registry ID ${contractId} has passed all professional audit stages as of ${new Date().toLocaleDateString()}.
       Standards: KYC/AML, SEC Rule 506(c), GDPR, MiCA.
       Audit Score: 99.8/100.`
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="COMPLIANCE_CERTIFICATE_AUDIT">
      <div className="space-y-8 py-4 font-mono">
        <div className="flex items-center justify-between p-6 bg-white/2 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <Shield size={24} />
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{t('CERTIFICATE_STATUS', 'STATUT_CERTIFICAT')}</div>
              <div className="text-sm font-black text-white uppercase italic tracking-tighter">{t('FULLY_VERIFIED_AUTHENTIC', 'ENTIÈREMENT_VÉRIFIÉ_AUTHENTIQUE')}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-primary-cyan font-black uppercase tracking-widest">{t('EXPIRY_DATE', 'DATE_D\'EXPIRATION')}</div>
            <div className="text-xs font-black text-white">2027-03-15</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 border-b border-white/10 pb-2">{t('COMPLIANCE_STANDARDS', 'NORMES_DE_CONFORMITÉ')}</h4>
            <div className="space-y-2">
              {['KYC/AML', 'SEC Rule 506(c)', 'GDPR', 'MiCA'].map(standard => (
                <div key={standard} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-[10px] font-black text-white uppercase">{standard}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 border-b border-white/10 pb-2">{t('AUDIT_VERIFICATION', 'VÉRIFICATION_D\'AUDIT')}</h4>
            <div className="space-y-3">
              <div className="bg-white/2 p-3 border border-white/5">
                <div className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">{t('AUDIT_SCORE', 'SCORE_D\'AUDIT')}</div>
                <div className="text-lg font-black text-primary-cyan italic">99.8/100</div>
              </div>
              <div className="bg-white/2 p-3 border border-white/5">
                <div className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">{t('REGISTRY_ID', 'ID_DU_REGISTRE')}</div>
                <div className="text-[9px] font-black text-white uppercase truncate">{contractId}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface-dim border border-white/10 text-center">
          <div className="inline-block p-4 border border-white/20 mb-4 bg-white/5">
             <div className="w-32 h-32 flex items-center justify-center text-white/20 opacity-40">
                {/* QR Code Placeholder */}
                <div className="grid grid-cols-4 gap-1 transform rotate-45">
                   {[...Array(16)].map((_, i) => (
                     <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                   ))}
                </div>
             </div>
          </div>
          <p className="text-[9px] text-on-surface-variant font-medium lowercase italic leading-relaxed max-w-sm mx-auto">
             {t('THIS_CERTIFICATE_WAS_GENERATED_BY_THE_LYA_IMMUTABLE_REGISTRY_PROTOCOL._TAMPERING_WITH_THIS_DOCUMENT_IS_IMPOSSIBLE_DUE_TO_CRYPTOGRAPHIC_HASHING.', 'CE_CERTIFICAT_A_ÉTÉ_GÉNÉRÉ_PAR_LE_PROTOCOLE_DE_REGISTRE_IMMUABLE_LYA._LA_MANIPULATION_DE_CE_DOCUMENT_EST_IMPOSSIBLE_EN_RAISON_DU_HACHAGE_CRYPTOGRAPHIQUE.')}
          </p>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full py-4 bg-white/5 border border-white/20 text-on-surface text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <Zap size={14} className="text-primary-cyan" />
          {t('DOWNLOAD_CERTIFICATE_PDF', 'TÉLÉCHARGER_CERTIFICAT_PDF')}
        </button>
      </div>
    </Modal>
  );
};

export const FeatureShowcaseModal: React.FC<{ isOpen: boolean; onClose: () => void; featureName?: string }> = ({ isOpen, onClose, featureName }) => {
  const { t } = useTranslation();
  
  const featureDetails = {
    'LYA Algorithm': {
      icon: <Zap className="text-primary-cyan" />,
      title: t('AI_PREDICTIVE_MODELS', 'MODÈLES_PRÉDICTIFS_IA'),
      description: t('ALGO_DESC', 'ANALYSE TEMPS RÉEL DES TENDANCES DE MARCHÉ ET PRÉDICTION DES RENDEMENTS FUTURS.')
    },
    'Professional Registry': {
      icon: <Shield className="text-accent-gold" />,
      title: t('IMMUTABLE_LEGAL_CONSENSUS', 'CONSENSUS_JURIDIQUE_IMMUABLE'),
      description: t('REGISTRY_DESC', 'ACCÈS AU REGISTRE CENTRALISÉ DES DROITS CRÉATIFS POUR UNE VÉRIFICATION INSTANTANÉE.')
    }
  };

  const details = featureName ? (featureDetails as any)[featureName] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="FEATURE_EXPLORATION">
      <div className="space-y-8 py-4 text-center">
        <div className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto border border-primary-cyan/20 shadow-[0_0_40px_rgba(0,224,255,0.2)]">
          {details?.icon || <Star size={32} className="text-primary-cyan" />}
        </div>
        
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
            {details?.title || featureName || t('ADVANCED_TERMINAL_CAPABILITY', 'CAPACITÉ_DU_TERMINAL_AVANCÉ')}
          </h3>
          <p className="text-xs text-on-surface-variant font-black uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto opacity-70 italic">
            {details?.description || t('FEATURE_LOCKED_DESC', 'CETTE FONCTIONNALITÉ REQUIERT UN ABONNEMENT PROFESSIONNEL POUR ACCÉDER AUX DONNÉES EN TEMPS RÉEL.')}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">
              <span>{t('ACCESS_STATUS', 'STATUT_D\'ACCÈS')}</span>
              <span className="text-red-400">{t('RESTRICTED', 'RESTREINT')}</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 w-1/4" />
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(0,224,255,0.3)] active:scale-95"
        >
          {t('UPGRADE_TO_UNLOCK', 'PASSER_À_PRO_POUR_DÉBLOQUER')}
        </button>
      </div>
    </Modal>
  );
};

export const ProfessionalOnboardingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onVerify?: (data: any) => void;
  isVerifying?: boolean;
}> = ({ isOpen, onClose, onVerify, isVerifying }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    firm: '',
    registrationId: '',
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleSubmit = () => {
    onVerify?.(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PROFESSIONAL_ONBOARDING">
      <div className="space-y-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className={`text-primary-cyan ${isVerifying ? 'animate-pulse' : ''}`} />
        </div>
        
        {step === 1 ? (
          <>
            <h3 className="text-lg font-black text-white uppercase">{t('UPGRADE TO PROFESSIONAL ACCESS', 'PASSER À L\'ACCÈS PROFESSIONNEL')}</h3>
            <p className="text-[11px] text-on-surface-variant/60 uppercase leading-relaxed font-bold">
              {t('UNLOCK UNLIMITED TRANSACTIONS, PRIORITY CLEARING, AND ADVANCED ANALYTICS HUBS.', 'DÉBLOQUEZ DES TRANSACTIONS ILLIMITÉES, UNE COMPENSATION PRIORITAIRE ET DES HUBS ANALYTIQUES AVANCÉS.')}
            </p>
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-3 text-[10px] text-white font-bold uppercase bg-white/5 p-3 text-left">
                <Zap size={14} className="text-primary-cyan" />
                <span>{t('ZERO TRADING FEES FOR 30 DAYS', 'ZÉRO FRAIS DE TRADING PENDANT 30 JOURS')}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white font-bold uppercase bg-white/5 p-3 text-left">
                <ArrowRight size={14} className="text-primary-cyan" />
                <span>{t('PRIORITY ORDER MATCHING', 'CORRESPONDANCE D\'ORDRE PRIORITAIRE')}</span>
              </div>
            </div>
            <button 
              onClick={handleNext}
              className="w-full py-3 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,224,255,0.2)]"
            >
              {t('BEGIN VERIFICATION', 'COMMENCER LA VÉRIFICATION')}
            </button>
          </>
        ) : (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-white/5 pb-2">{t('PROFESSIONAL DOSSIER', 'DOSSIER PROFESSIONNEL')}</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('FULL NAME', 'NOM COMPLET')}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-dim border border-white/10 p-3 text-[11px] font-bold text-white focus:outline-none focus:border-primary-cyan transition-colors"
                  placeholder="e.g. JONATHAN REISS"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('INSTITUTIONAL EMAIL', 'EMAIL INSTITUTIONNEL')}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surface-dim border border-white/10 p-3 text-[11px] font-bold text-white focus:outline-none focus:border-primary-cyan transition-colors"
                  placeholder="e.g. reiss@institution.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('FIRM / ORGANIZATION', 'ENTREPRISE / ORGANISATION')}</label>
                <input 
                  type="text" 
                  value={formData.firm}
                  onChange={(e) => setFormData({...formData, firm: e.target.value})}
                  className="w-full bg-surface-dim border border-white/10 p-3 text-[11px] font-bold text-white focus:outline-none focus:border-primary-cyan transition-colors"
                  placeholder="e.g. CREATIVE CAPITAL HUB"
                />
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isVerifying || !formData.name || !formData.email}
              className="w-full py-4 bg-emerald-400 text-surface-dim text-xs font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 mt-6 shadow-[0_10px_20px_rgba(52,211,153,0.2)]"
            >
              {isVerifying ? t('PROCESSING PROTOCOL...', 'PROTOCOLE EN COURS...') : t('SUBMIT DOSSIER', 'SOUMETTRE LE DOSSIER')}
            </button>
            <button 
              onClick={() => setStep(1)}
              className="w-full py-2 text-on-surface-variant text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              {t('GO BACK', 'RETOUR')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const TradeModal: React.FC<{ 
  tradingContract: { contract: Contract; type: 'BUY' | 'SELL' } | null;
  onClose: () => void;
  onTrade: (contract: Contract, type: 'BUY' | 'SELL', price: number, volume: number) => void;
  tradeVolume: number;
  setTradeVolume: (v: number) => void;
  tradePrice: number;
  setTradePrice: (p: number) => void;
}> = ({ tradingContract, onClose, onTrade, tradeVolume, setTradeVolume, tradePrice, setTradePrice }) => {
  const { t } = useTranslation();
  if (!tradingContract) return null;
  const { contract, type } = tradingContract;

  return (
    <Modal isOpen={!!tradingContract} onClose={onClose} title={`EXECUTE_${type}_ORDER: ${contract.id}`}>
       <div className="space-y-6">
          <div className="p-5 bg-white/5 border border-white/10 flex items-center justify-between rounded-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest mb-1">{t('CONTRACT', 'CONTRAT')}</div>
              <div className="text-lg font-black text-white uppercase tracking-tighter">{contract.name}</div>
              <div className="text-[10px] text-primary-cyan font-bold mt-1 uppercase tracking-widest">{contract.rarity}</div>
            </div>
            <div className="text-right relative z-10">
              <div className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest mb-1">{t('MARKET_PRICE', 'PRIX_MARCHÉ')}</div>
              <div className="text-xl font-black text-primary-cyan tracking-tighter">${contract.unitValue.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest mb-1">{t('MARKET_DEPTH', 'PROFONDEUR_DU_MARCHÉ')}</div>
                <div className="text-sm font-black text-white italic">PROFESSIONAL_HIGH</div>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest mb-1">{t('UNITS_AVAILABLE', 'UNITÉS_DISPONIBLES')}</div>
                <div className="text-sm font-black text-primary-cyan italic">{contract.availableUnits?.toLocaleString() || '1,250'}</div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{t('QUANTITY', 'QUANTITÉ')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-surface-dim border border-white/10 p-4 text-white text-lg font-black focus:outline-none focus:border-primary-cyan transition-colors" 
                  value={tradeVolume}
                  onChange={(e) => setTradeVolume(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{t('PRICE_PER_UNIT', 'PRIX_PAR_UNITÉ')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-surface-dim border border-white/10 p-4 text-white text-lg font-black focus:outline-none focus:border-primary-cyan transition-colors" 
                  value={tradePrice || contract.unitValue}
                  onChange={(e) => setTradePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5 bg-white/[0.02] border border-white/5 rounded-lg font-mono">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
              <span>{t('SUBTOTAL', 'SOUS-TOTAL')}</span>
              <span className="text-white">${((tradePrice || contract.unitValue) * tradeVolume).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
              <div className="flex items-center gap-2">
                <span>{t('P2P_EXCHANGE_FEE', 'P2P_EXCHANGE_FEE')}</span>
                <span className="px-1.5 py-0.5 bg-primary-cyan/10 text-primary-cyan text-[8px] rounded">3%</span>
              </div>
              <span className="text-white">${((tradePrice || contract.unitValue) * tradeVolume * 0.03).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
              <div className="flex items-center gap-2">
                <span>{t('NETWORK_CLEARING', 'CLEARING_RÉSEAU')}</span>
                <span className="px-1.5 py-0.5 bg-primary-cyan/10 text-primary-cyan text-[8px] rounded">0.2%</span>
              </div>
              <span className="text-white">${((tradePrice || contract.unitValue) * tradeVolume * 0.002).toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('TOTAL_ESTIMATED', 'TOTAL_ESTIMÉ')}</span>
              <span className="text-2xl font-black text-primary-cyan tracking-tighter">
                ${((tradePrice || contract.unitValue) * tradeVolume * 1.032).toLocaleString()}
              </span>
            </div>
            <p className="text-[8px] text-on-surface-variant italic mt-1">* Fees range from 2% to 5% based on your professional tier.</p>
          </div>

          <button 
            onClick={() => onTrade(contract, type, tradePrice || contract.unitValue, tradeVolume)}
            className={`w-full py-5 ${type === 'BUY' ? 'bg-primary-cyan' : 'bg-rose-500'} text-surface-dim text-[11px] font-black uppercase tracking-[0.4em] hover:brightness-110 transition-all shadow-xl active:scale-95`}
          >
            {t(`CONFIRM_${type}_ORDER`, `CONFIRMER_L'ORDRE_DE_${type === 'BUY' ? 'ACHAT' : 'VENTE'}`)}
          </button>
       </div>
    </Modal>
  );
};
