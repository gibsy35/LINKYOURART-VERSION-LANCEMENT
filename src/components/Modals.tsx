import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  ArrowRight, 
  Zap, 
  Target, 
  Lock, 
  Info, 
  Star, 
  Download, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Activity, 
  CheckCircle2, 
  Scale,
  Award,
  Upload,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  Flame,
  Gem,
  Crown,
  ChevronDown
} from 'lucide-react';
import { Contract, getContractDescription } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { simulatePDFDownload } from '../utils/download';
import { CONTRACTS } from '../types';
import { getSafeImageUrl } from '../utils/image';
import { VALIDATOR_TIERS, EXPRESS_48H_PRICE_EUR, EXPRESS_24H_PRICE_EUR } from '../lib/permissions';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence mode="sync">
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
  onViewProject?: (contract: Contract) => void;
}> = ({ isOpen, onClose, contract, onViewProject }) => {
  const { t, language } = useTranslation();
  if (!contract) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`REGISTRY_INTEL: ${contract.registryIndex}`}>
       <div className="space-y-6">
          <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden border border-white/10 mb-4 shadow-xl">
             <img 
               src={getSafeImageUrl(contract.image, contract.category)} 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                   <span className="text-[10px] font-black uppercase text-primary-cyan px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-md tracking-[0.2em]">{contract.category}</span>
                   <h3 className="text-2xl font-black text-white mt-3 uppercase tracking-tighter leading-none">{contract.name}</h3>
                </div>
                <div className="text-sm font-black text-accent-gold uppercase font-mono tracking-widest">
                   {contract.rarity}
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="text-xs text-white/40 uppercase tracking-widest font-black mb-1">CONSOLIDATED SCORE</div>
                <div className="text-xl font-black text-primary-cyan">{contract.totalScore || 750}/1000</div>
             </div>
             <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="text-xs text-white/40 uppercase tracking-widest font-black mb-1">STATUS</div>
                <div className="text-xl font-black text-emerald-400">{contract.status}</div>
             </div>
          </div>
          
          <p className="text-xs text-white/60 leading-relaxed text-justify px-1">{getContractDescription(contract, language)}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
             <button 
                onClick={() => { onClose(); if (onViewProject) onViewProject(contract); }}
                className="py-4 bg-emerald-500 text-surface-dim font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white transition-all shadow-lg active:scale-95"
             >
                {t('VIEW FULL PROJECT', 'VOIR LE PROJET COMPLET')}
             </button>
             <button 
                onClick={onClose}
                className="py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] rounded-xl active:scale-95"
             >
                {t('CLOSE', 'FERMER')}
             </button>
          </div>
       </div>
    </Modal>
  );
};

// Visual identity per tier — used across the onboarding modal and status badges everywhere.
const TIER_STYLES: Record<string, { grad: string; glow: string; border: string; text: string; icon: React.ReactNode; chipBg: string }> = {
  bronze:   { grad: 'from-amber-700/30 to-amber-900/10',   glow: 'shadow-[0_0_25px_rgba(180,120,60,0.15)]',  border: 'border-amber-600/30',   text: 'text-amber-500',   icon: <Shield size={18} />, chipBg: 'bg-amber-600/10' },
  silver:   { grad: 'from-slate-300/20 to-slate-500/5',    glow: 'shadow-[0_0_25px_rgba(200,210,225,0.15)]', border: 'border-slate-300/30',   text: 'text-slate-200',   icon: <Sparkles size={18} />, chipBg: 'bg-slate-300/10' },
  gold:     { grad: 'from-accent-gold/30 to-accent-gold/5', glow: 'shadow-[0_0_30px_rgba(255,215,0,0.2)]',   border: 'border-accent-gold/40', text: 'text-accent-gold', icon: <Gem size={18} />, chipBg: 'bg-accent-gold/10' },
  platinum: { grad: 'from-primary-cyan/30 to-primary-cyan/5', glow: 'shadow-[0_0_35px_rgba(0,224,255,0.28)]', border: 'border-primary-cyan/50', text: 'text-primary-cyan', icon: <Crown size={18} />, chipBg: 'bg-primary-cyan/10' },
};

const JURISDICTIONS = [
  'EU (IP Law — EUIPO)',
  'France (SACD)',
  'France (SACEM)',
  'US (Federal IP — USPTO)',
  'UK (CDPA — UKIPO)',
  'Canada (CIPO)',
  'Switzerland (IPI)',
  'Germany (DPMA)',
  'Italy (UIBM)',
  'Spain (OEPM)',
  'Belgium (SABAM)',
  'Netherlands (BOIP)',
];

const SECTORS = [
  { id: 'Fine Art', color: 'text-accent-pink', bg: 'bg-accent-pink/10', border: 'border-accent-pink/30' },
  { id: 'Film', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
  { id: 'TV Series', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' },
  { id: 'Music', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { id: 'Architecture', color: 'text-primary-cyan', bg: 'bg-primary-cyan/10', border: 'border-primary-cyan/30' },
  { id: 'Fashion', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
  { id: 'Design', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  { id: 'Photography', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { id: 'Literature', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
];

export const ProfessionalOnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: any) => void;
  isVerifying: boolean;
}> = ({ isOpen, onClose, onVerify, isVerifying }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [customAuthority, setCustomAuthority] = useState(false);
  const [formData, setFormData] = useState({
    entityName: '',
    registrationNumber: '',
    authority: 'EU (IP Law — EUIPO)',
    sector: '',
    authorizedSignatory: '',
    uploadedDocs: false
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      onVerify(formData);
      onClose();
    }
  };

  const stepLabels = [
    t('Credentials', 'Identité'),
    t('Sector & Earnings', 'Secteur & Rémunération'),
    t('Audit Scope', 'Périmètre'),
    t('Code of Conduct', 'Engagement'),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PROFESSIONAL_ONBOARDING: CERTIFIED_VALIDATOR">
       <div className="space-y-7">
         {/* Step indicator */}
         <div className="flex gap-1.5 items-center border-b border-white/5 pb-5">
           {[1, 2, 3, 4].map(i => (
             <React.Fragment key={i}>
               <div className="flex flex-col items-center gap-1.5 flex-1">
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                   step > i ? 'bg-primary-cyan text-surface-dim' :
                   step === i ? 'bg-primary-cyan text-surface-dim shadow-[0_0_16px_rgba(0,224,255,0.5)]' :
                   'bg-white/5 text-white/35 border border-white/10'
                 }`}>
                   {step > i ? <CheckCircle2 size={13} /> : i}
                 </div>
                 <span className={`text-[8.5px] font-black uppercase tracking-widest text-center hidden sm:block ${step >= i ? 'text-white/70' : 'text-white/25'}`}>
                   {stepLabels[i - 1]}
                 </span>
               </div>
               {i < 4 && <div className={`h-[2px] flex-1 -mt-4 ${step > i ? 'bg-primary-cyan/60' : 'bg-white/10'}`} />}
             </React.Fragment>
           ))}
         </div>

         {/* STEP 1 — Identity & jurisdiction */}
         {step === 1 && (
           <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('IDENTITY & REGULATORY CREDENTIALS', 'IDENTITÉ & CRÉDENTIALS RÉGLEMENTAIRES')}</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">{t('Certified validation requires formal professional identification, recognized by a rights-management or IP authority in your jurisdiction.', 'La validation certifiée nécessite une identification professionnelle formelle, reconnue par une autorité de gestion des droits ou de propriété intellectuelle de votre juridiction.')}</p>
              
              <div className="space-y-3 pt-2">
                <input 
                  placeholder={t('ENTITY / INSTITUTION NAME', 'NOM DE L\'ENTITÉ / INSTITUTION')}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-primary-cyan focus:shadow-[0_0_20px_rgba(0,224,255,0.12)] transition-all"
                  value={formData.entityName}
                  onChange={e => setFormData({...formData, entityName: e.target.value})}
                />
                <input 
                  placeholder={t('REGISTRATION OR SIRET NUMBER', 'NUMÉRO D\'ENREGISTREMENT OU SIRET')}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-primary-cyan focus:shadow-[0_0_20px_rgba(0,224,255,0.12)] transition-all"
                  value={formData.registrationNumber}
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                />

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 block">{t('Regulatory Authority', 'Autorité Réglementaire')}</label>
                  {!customAuthority ? (
                    <div className="relative">
                      <select 
                        className="w-full appearance-none bg-black/40 border border-white/10 p-4 rounded-xl text-white text-xs focus:outline-none focus:border-primary-cyan transition-all"
                        value={formData.authority}
                        onChange={e => {
                          if (e.target.value === '__other__') { setCustomAuthority(true); setFormData({...formData, authority: ''}); }
                          else setFormData({...formData, authority: e.target.value});
                        }}
                      >
                        {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                        <option value="__other__">{t('+ Other — not listed', '+ Autre — non listée')}</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        placeholder={t('Type your authority / registry name', 'Indiquez votre autorité / registre')}
                        className="flex-1 bg-black/40 border border-primary-cyan/40 p-4 rounded-xl text-white text-xs placeholder:text-white/20 focus:outline-none transition-all"
                        value={formData.authority}
                        onChange={e => setFormData({...formData, authority: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => { setCustomAuthority(false); setFormData({...formData, authority: JURISDICTIONS[0]}); }}
                        className="px-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] font-black uppercase"
                      >
                        {t('List', 'Liste')}
                      </button>
                    </div>
                  )}
                  <p className="text-[9.5px] text-white/30 mt-2 leading-relaxed">{t('Not registered with a formal authority yet? Select "Other" and describe your credentials — reviewed case-by-case.', 'Pas encore enregistré auprès d\'une autorité formelle\u00a0? Choisissez "Autre" et décrivez vos crédentials — étudié au cas par cas.')}</p>
                </div>
              </div>
           </div>
         )}

         {/* STEP 2 — Sector + full compensation ladder, explained */}
         {step === 2 && (
           <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{t('YOUR SECTOR OF EXPERTISE', 'VOTRE SECTEUR D\'EXPERTISE')}</h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">{t('You\'ll certify work in this sector only — you can apply for an additional one later.', 'Vous certifierez uniquement dans ce secteur — vous pourrez en candidater un second plus tard.')}</p>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData({...formData, sector: s.id})}
                      className={`px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                        formData.sector === s.id ? `${s.bg} ${s.color} ${s.border} shadow-[0_0_16px_rgba(255,255,255,0.08)]` : 'bg-white/[0.02] text-white/35 border-white/10 hover:border-white/25'
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={15} className="text-accent-gold" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('How you get paid', 'Comment vous êtes payé')}</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  {t(
                    `Everyone starts at Bronze — no applying for a higher tier. It's recalculated monthly from your volume and rating. Standard certification is always free for creators; LYA Express (${EXPRESS_48H_PRICE_EUR}€/48h, ${EXPRESS_24H_PRICE_EUR}€/24h) pays more for priority processing only — never a lower review bar.`,
                    `Tout le monde démarre à Bronze — rien à candidater pour monter. Le palier est recalculé chaque mois selon votre volume et votre note. La certification standard reste toujours gratuite pour le créateur\u00a0; LYA Express (${EXPRESS_48H_PRICE_EUR}€/48h, ${EXPRESS_24H_PRICE_EUR}€/24h) rémunère mieux pour la priorité de traitement uniquement — jamais un examen moins rigoureux.`
                  )}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {VALIDATOR_TIERS.map((tier, i) => {
                    const style = TIER_STYLES[tier.id];
                    return (
                      <div
                        key={tier.id}
                        className={`relative rounded-2xl border ${style.border} bg-gradient-to-br ${style.grad} ${style.glow} p-4`}
                      >
                        <div className={`flex items-center gap-1.5 mb-2 ${style.text}`}>
                          {style.icon}
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{t('Tier', 'Palier')} {i + 1}</span>
                        </div>
                        <h4 className={`text-base font-black uppercase italic tracking-tighter mb-2 ${style.text}`}>{tier.name}</h4>
                        <p className="text-[9px] text-white/40 uppercase font-bold mb-3 min-h-[24px] leading-tight">
                          {tier.minCertifications === 0 ? t('< 50 certs', '< 50 certifs') : `${tier.minCertifications}+ · ${tier.minRating}/5`}
                        </p>
                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/10">
                          <span className="text-white/40 font-bold uppercase">Std</span>
                          <span className="font-black text-white">{tier.standardPayoutEUR}€</span>
                        </div>
                        {tier.expressPayoutEUR && (
                          <div className="flex items-center justify-between text-[10px] pt-1.5">
                            <span className="text-white/40 font-bold uppercase">XP</span>
                            <span className={`font-black ${style.text}`}>{tier.expressPayoutEUR}€</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/15">
                  <Coins size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                    {t('Funded by the Validator Remuneration Fund (patronage commission + Pro/Enterprise revenue + Express margin) — never out of your own pocket, and no certification ever goes unpaid.', 'Financé par le Fonds de Rémunération des Validateurs (commission mécénat + revenus Pro/Enterprise + marge Express) — jamais à vos frais, et aucune certification ne reste non rémunérée.')}
                  </p>
                </div>
              </div>
           </div>
         )}

         {/* STEP 3 — Audit scope */}
         {step === 3 && (
           <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('CERTIFICATION REVIEW SCOPE', 'PÉRIMÈTRE DE REVUE DE CERTIFICATION')}</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">{t('What you\'ll be reviewing on every submission in your sector.', 'Ce que vous évaluerez sur chaque dossier de votre secteur.')}</p>
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-1 divide-y divide-white/5">
                 {[
                   { icon: <Target size={14} />, label: t('LYA Score Methodology Review', 'Revue de la méthodologie du Score LYA') },
                   { icon: <Star size={14} />, label: t('Creative Work Quality Oversight', 'Contrôle qualité de l\'œuvre créative') },
                   { icon: <FileCheck2 size={14} />, label: t('Registry Certification Standards', 'Standards de certification du registre') },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-[11px] py-3">
                      <span className="flex items-center gap-2.5 text-white/70 font-bold uppercase tracking-tight">
                        <span className="text-primary-cyan">{item.icon}</span>{item.label}
                      </span>
                      <input type="checkbox" defaultChecked className="accent-primary-cyan w-4 h-4" />
                   </div>
                 ))}
              </div>
              <div 
                className={`border border-dashed p-6 flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all ${formData.uploadedDocs ? 'border-primary-cyan/40 bg-primary-cyan/[0.04]' : 'border-white/10 bg-black/30 hover:border-white/25'}`}
                onClick={() => setFormData({...formData, uploadedDocs: true})}
              >
                 <Upload size={22} className={formData.uploadedDocs ? 'text-primary-cyan' : 'text-white/35'} />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest text-center">
                   {formData.uploadedDocs ? t('PROFESSIONAL_CREDENTIALS_SECURED.PDF', 'CRÉDENTIALS_PROFESSIONNELS_SÉCURISÉS.PDF') : t('Upload Professional Credentials PDF', 'Téléverser vos crédentials professionnels (PDF)')}
                 </span>
              </div>
           </div>
         )}

         {/* STEP 4 — Code of conduct */}
         {step === 4 && (
           <div className="space-y-4 text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-accent-gold/10 border border-accent-gold/25 ${TIER_STYLES.gold.glow}`}>
                <Award size={30} className="text-accent-gold" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('PROFESSIONAL ACCREDITATION', 'ACCRÉDITATION PROFESSIONNELLE')}</h3>
              <p className="text-[11px] text-white/50 max-w-sm mx-auto leading-relaxed">
                 {t('Certified validators commit to the LYA Code of Conduct to protect the registry and creators from certification errors or misconduct.', 'Les validateurs agréés s\'engagent à respecter le code de conduite LYA pour protéger le registre et les créateurs contre les erreurs de certification ou les manquements.')}
              </p>
              {formData.sector && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${SECTORS.find(s => s.id === formData.sector)?.bg} ${SECTORS.find(s => s.id === formData.sector)?.border} border`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${SECTORS.find(s => s.id === formData.sector)?.color}`}>{formData.sector}</span>
                </div>
              )}
              <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-xs font-black uppercase tracking-widest rounded-xl max-w-xs mx-auto">
                 {t('CODE OF CONDUCT: ACCEPTED', 'CODE DE CONDUITE : ACCEPTÉ')}
              </div>
           </div>
         )}

         <button 
           onClick={handleNext}
           disabled={(step === 1 && (!formData.entityName || !formData.registrationNumber || !formData.authority)) || (step === 2 && !formData.sector)}
           className="w-full py-4.5 bg-primary-cyan text-surface-dim font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all rounded-xl disabled:opacity-45 disabled:pointer-events-none shadow-[0_0_25px_rgba(0,224,255,0.25)]"
         >
           {step === 4 ? t('CONFIRM & APPLY LICENSE', 'VALIDER ET ACTIVER LA LICENCE') : t('CONTINUE', 'CONTINUER')}
         </button>
       </div>
    </Modal>
  );
};

export const FeatureShowcaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}> = ({ isOpen, onClose, featureName }) => {
  const { t } = useTranslation();

  const getPlanDetails = () => {
    switch (featureName.toUpperCase()) {
      case 'CREATOR':
        return {
          title: t('CREATOR TIER ACCESS', 'ACCÈS AU FORFAIT CRÉATEUR'),
          badge: t('CREATORS, PRODUCERS & WRITERS', 'CRÉATEURS, PRODUCTEURS & AUTEURS'),
          description: t(
            'Designed specifically for creators—including filmmakers, musicians, writers, choreographers, and designers—to submit up to 3 projects for certification, track their LYA Score, and connect with patrons who believe in their work.',
            'Conçu spécifiquement pour les créateurs—cinéastes, musiciens, auteurs, chorégraphes et designers indépendants—pour soumettre jusqu\'à 3 projets à la certification, suivre leur Score LYA, et se connecter à des mécènes qui croient en leur travail.'
          ),
          feature1: t('Certification Access', 'Accès à la Certification'),
          feature1Value: t('UP TO 3 PROJECTS', 'JUSQU\'À 3 PROJETS'),
          feature2: t('Certification Fee', 'Frais de Certification'),
          feature2Value: t('FREE', 'GRATUIT'),
        };
      case 'PATRON':
        return {
          title: t('FREE DISCOVERY & PATRONAGE', 'DÉCOUVERTE & MÉCÉNAT GRATUITS'),
          badge: t('COLLECTORS, PATRONS & SUPPORTERS', 'COLLECTIONNEURS, MÉCÈNES & SOUTIENS'),
          description: t(
            'Free and unlimited for everyone, signed in or not — browse, follow and support certified projects across music catalogs, film productions, and multidisciplinary creations. Like Kickstarter, there is no fee to give — only a platform commission on successful patronage.',
            'Gratuit et illimité pour tous, connecté ou non — parcourez, suivez et soutenez des projets certifiés à travers des catalogues musicaux, des productions cinématographiques et des créations multidisciplinaires. Comme Kickstarter, aucun frais pour soutenir — seulement une commission de plateforme sur le mécénat abouti.'
          ),
          feature1: t('Discovery & Tracking', 'Découverte & Suivi'),
          feature1Value: t('FREE & UNLIMITED', 'GRATUIT & ILLIMITÉ'),
          feature2: t('Platform Fee on Patronage', 'Frais de Plateforme sur le Mécénat'),
          feature2Value: '5.0%',
        };
      case 'PRO_STARTER':
        return {
          title: t('PRO STARTER ACCESS', 'ACCÈS PRO STARTER'),
          badge: t('VALIDATORS, SOURCERS & INDEPENDENT AGENTS', 'VALIDATEURS, SOURCEURS & AGENTS INDÉPENDANTS'),
          description: t(
            'Certification workspace for independent professionals sourcing and auditing creative work: full Registry access, unlimited submissions for your own catalogue, and priority review.',
            'Espace de travail de certification pour les professionnels indépendants qui sourcent et auditent des créations : accès complet au Registre, soumissions illimitées pour votre propre catalogue, et revue prioritaire.'
          ),
          feature1: t('Registry Access', 'Accès Registre'),
          feature1Value: t('FULL', 'COMPLET'),
          feature2: t('Priority Review Access', 'Accès Prioritaire aux Revues'),
          feature2Value: t('INCLUDED', 'INCLUS'),
        };
      case 'PRO_ADVANCED':
        return {
          title: t('PRO ADVANCED CONTRACTS', 'CONTRATS PRO AVANCÉ'),
          badge: t('SHOWRUNNERS, AGENTS & TECHNICAL INTEGRATORS', 'SHOWRUNNERS, AGENTS & INTÉGRATEURS TECHNIQUES'),
          description: t(
            'Everything in Pro Starter, plus API access, white-label client reporting, and a dedicated account manager — built for teams that need to integrate LYA certification into their own workflows.',
            "Tout Pro Starter, plus l'accès API, des rapports en marque blanche pour vos clients, et un gestionnaire de compte dédié — pensé pour les équipes qui doivent intégrer la certification LYA dans leurs propres outils."
          ),
          feature1: t('API Access', 'Accès API'),
          feature1Value: t('ENABLED', 'INSTALLÉ'),
          feature2: t('White-label Reporting Suite', 'Rapports en Marque Blanche'),
          feature2Value: t('INCLUDED', 'INCLUS'),
        };
      case 'PRO_ENTERPRISE':
      case 'PRO_ENTERPRISE_HIGHLIGHT':
      case 'INSTITUTIONAL Enterprise':
        return {
          title: t('INSTITUTIONAL ENTERPRISE TIER', 'ACCÈS INFRASTRUCTURE INSTITUTIONNELLE'),
          badge: t('STUDIOS, LABELS & MAJOR PUBLISHERS', 'STUDIOS, LABELS & MAISONS D\'ÉDITING'),
          description: t(
            'Strategic enterprise solutions for major film studios, streaming networks, record labels, and global book publishers. Unlock high-performance custom certification workflows, complete library/catalog migrations, and dedicated registry support.',
            'Solutions stratégiques d\'entreprise pour les grands studios de cinéma, plateformes de streaming, labels de musique majeurs et maisons d\'édition globales. Bénéficiez de processus de certification personnalisés haute performance, de migrations de catalogues complets et d\'un support registre dédié.'
          ),
          feature1: t('Dedicated Certification Support', 'Support de Certification Dédié'),
          feature1Value: t('24/7 ACCESS', 'ACCÈS 24/7'),
          feature2: t('Custom Certification Pipelines', 'Processus de Certification Sur-Mesure'),
          feature2Value: t('ON-DEMAND AUDIT', 'AUDIT À LA DEMANDE'),
        };
      default:
        return {
          title: t('ADVANCED ECOSYSTEM UTILITIES', 'CAPACITÉS TECHNOLOGIQUES LYA'),
          badge: t('ECOSYSTEM ACCESS', 'ACCÈS ÉCOSYSTÈME'),
          description: t(
            'Gain elite privileges across our creative industries registry, including real-time certification updates and automated compliance verification by certified validators.',
            'Bénéficiez de privilèges d\'élite sur notre registre d\'industries créatives, incluant les mises à jour de certification en temps réel et la vérification de conformité automatisée par nos validateurs certifiés.'
          ),
          feature1: t('Real-Time Registry Sync', 'Synchronisation Registre en Temps Réel'),
          feature1Value: t('ACTIVE', 'ACTIF'),
          feature2: t('Compliance Verification', 'Vérification de Conformité'),
          feature2Value: t('AUTOMATED', 'AUTOMATISÉE'),
        };
    }
  };

  const details = getPlanDetails();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`FEATURE_HIGHLIGHT: ${featureName.toUpperCase()}`}>
      <div className="space-y-6">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-primary-cyan/20 rounded-2xl text-primary-cyan">
             <Zap size={24} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">
               {details.title}
             </h3>
             <span className="text-xs text-accent-gold uppercase font-mono tracking-widest">{details.badge}</span>
          </div>
        </div>

        <p className="text-xs text-white/60 leading-relaxed text-justify">
          {details.description}
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-[10px]">
             <span className="text-white/70 uppercase tracking-widest font-black">{details.feature1}</span>
             <span className="text-emerald-400 font-bold uppercase font-mono font-black">{details.feature1Value}</span>
          </div>
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between text-[10px]">
             <span className="text-white/70 uppercase tracking-widest font-black">{details.feature2}</span>
             <span className="text-emerald-400 font-bold uppercase font-mono font-black">{details.feature2Value}</span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-4.5 bg-primary-cyan text-surface-dim uppercase font-black tracking-widest text-[10px] rounded-xl active:scale-95"
        >
          {t('Acknowledge', 'Compris')}
        </button>
      </div>
    </Modal>
  );
};

export const ComplianceCertificateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
}> = ({ isOpen, onClose, contractId }) => {
  const { t } = useTranslation();
  
  const currentContract = CONTRACTS.find(c => `REGISTRY_${c.id}` === contractId) || CONTRACTS[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`LYA_CERTIFICATE: ${currentContract.registryIndex}`}>
      <div className="space-y-6">
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
             <FileCheck2 size={24} />
          </div>
          <div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest">
               LYA CERTIFICATION PASS
             </h3>
             <span className="text-xs text-emerald-400 uppercase font-mono tracking-widest">CERTIFIED ON THE LYA REGISTRY</span>
          </div>
        </div>

        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-3 font-mono text-[10px]">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/40">REG INDEX:</span>
            <span className="text-white font-bold">{currentContract.registryIndex}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/40">JURISDICTION:</span>
            <span className="text-white font-bold">{currentContract.jurisdiction || 'EU (IP Law)'}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/40">LYA SCORE:</span>
            <span className="text-white font-bold font-mono">{currentContract.totalScore || 750}/1000</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
             <span className="text-white/40">VALIDATOR BOARD:</span>
             <span className="text-accent-gold font-bold">LOUVRE_DIGITAL_0x1</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-bold">
            <span>STATUS:</span>
            <span>{currentContract.status || 'CERTIFIED'}</span>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed text-center italic">
          "This certificate confirms the project's LYA Score certification on the LYA Registry, reflecting an independent assessment of creative quality. It is not a financial security, license, or regulatory compliance instrument."
        </p>

        <button 
          onClick={() => {
            simulatePDFDownload(currentContract.name, "LYA Certificate - " + currentContract.name + "\nRegistry Index: " + currentContract.registryIndex + "\nLYA Score: " + (currentContract.totalScore || 750) + "/1000");
          }}
          className="w-full py-4.5 bg-white text-surface-dim hover:bg-primary-cyan uppercase font-black tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Download size={12} />
          {t('DOWNLOAD CERTIFICATE', 'TÉLÉCHARGER LE CERTIFICAT')}
        </button>
      </div>
    </Modal>
  );
};
