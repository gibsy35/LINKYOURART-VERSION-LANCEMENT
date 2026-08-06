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
  AlertTriangle
} from 'lucide-react';
import { Contract, getContractDescription } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { simulatePDFDownload } from '../utils/download';
import { CONTRACTS } from '../types';
import { getSafeImageUrl } from '../utils/image';

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

export const ProfessionalOnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: any) => void;
  isVerifying: boolean;
}> = ({ isOpen, onClose, onVerify, isVerifying }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    entityName: '',
    registrationNumber: '',
    authority: 'EU (IP Law)',
    authorizedSignatory: '',
    uploadedDocs: false
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      onVerify(formData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PROFESSIONAL_ONBOARDING: CERTIFIED_VALIDATOR">
       <div className="space-y-6">
         <div className="flex gap-2 items-center justify-between border-b border-white/5 pb-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="flex-1 flex items-center gap-2">
               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= i ? 'bg-primary-cyan text-surface-dim' : 'bg-white/5 text-white/35 border border-white/10'}`}>
                 {i}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40 hidden sm:inline">
                 {i === 1 ? 'Credentials' : i === 2 ? 'Audit Scope' : 'Code of Conduct'}
               </span>
             </div>
           ))}
         </div>

         {step === 1 && (
           <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('IDENTITY & REGULATORY CREDENTIALS', 'IDENTITÉ & CRÉDENTIALS RÉGLEMENTAIRES')}</h3>
              <p className="text-[10px] text-white/50 leading-relaxed">{t('Certified validation requires formal professional identification.', 'La validation certifiée nécessite une identification professionnelle formelle.')}</p>
              
              <div className="space-y-3 pt-2">
                <input 
                  placeholder={t('ENTITY / INSTITUTION NAME', 'NOM DE L\'ENTITÉ / INSTITUTION')}
                  className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-primary-cyan"
                  value={formData.entityName}
                  onChange={e => setFormData({...formData, entityName: e.target.value})}
                />
                <input 
                  placeholder={t('REGISTRATION OR SIRET NUMBER', 'NUMÉRO D\'ENREGISTREMENT OU SIRET')}
                  className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-primary-cyan"
                  value={formData.registrationNumber}
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                />
                <select 
                  className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs focus:outline-none focus:border-primary-cyan"
                  value={formData.authority}
                  onChange={e => setFormData({...formData, authority: e.target.value})}
                >
                  <option value="EU (IP Law)">EU (IP Law Registered)</option>
                  <option value="France (SACD)">France (SACD Registered)</option>
                  <option value="US (Federal IP)">US (Federal IP Registered)</option>
                  <option value="UK (CDPA)">UK (CDPA Registered)</option>
                </select>
              </div>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('CERTIFICATION REVIEW SCOPE', 'PÉRIMÈTRE DE REVUE DE CERTIFICATION')}</h3>
              <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/70">LYA SCORE METHODOLOGY REVIEW</span>
                    <input type="checkbox" defaultChecked className="accent-primary-cyan" />
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/70">CREATIVE WORK QUALITY OVERSIGHT</span>
                    <input type="checkbox" defaultChecked className="accent-primary-cyan" />
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/70">REGISTRY CERTIFICATION STANDARDS</span>
                    <input type="checkbox" defaultChecked className="accent-primary-cyan" />
                 </div>
              </div>
              <div className="border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-3 bg-black/40 rounded-xl cursor-pointer" onClick={() => setFormData({...formData, uploadedDocs: true})}>
                 <Upload size={24} className={formData.uploadedDocs ? 'text-primary-cyan' : 'text-white/35'} />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest">
                   {formData.uploadedDocs ? 'PROFESSIONAL_CREDENTIALS_SECURED.PDF' : 'Upload Professional Credentials PDF'}
                 </span>
              </div>
           </div>
         )}

         {step === 3 && (
           <div className="space-y-4 text-center">
              <Award size={48} className="mx-auto text-accent-gold" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('PROFESSIONAL ACCREDITATION', 'ACCRÉDITATION PROFESSIONNELLE')}</h3>
              <p className="text-[10px] text-white/50 max-w-sm mx-auto leading-relaxed">
                 {t('Certified validators commit to the LYA Code of Conduct to protect the registry and creators from certification errors or misconduct.', 'Les validateurs agréés s\'engagent à respecter le code de conduite LYA pour protéger le registre et les créateurs contre les erreurs de certification ou les manquements.')}
              </p>
              <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-xs font-black uppercase tracking-widest rounded-xl max-w-xs mx-auto">
                 {t('CODE OF CONDUCT: ACCEPTED', 'CODE DE CONDUITE : ACCEPTÉ')}
              </div>
           </div>
         )}

         <button 
           onClick={handleNext}
           disabled={step === 1 && (!formData.entityName || !formData.registrationNumber)}
           className="w-full py-4.5 bg-primary-cyan text-surface-dim font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all rounded-xl disabled:opacity-45 disabled:pointer-events-none"
         >
           {step === 3 ? t('CONFIRM & APPLY LICENSE', 'VALIDER ET ACTIVER LA LICENCE') : t('CONTINUE', 'CONTINUER')}
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
