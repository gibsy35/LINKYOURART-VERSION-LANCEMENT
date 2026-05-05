
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Search,
  ExternalLink,
  Clock,
  Award,
  RefreshCw,
  TrendingUp,
  Lock,
  Database,
  Activity,
  Users,
  Gavel
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { CONTRACTS, Contract, UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface VerificationStep {
  id: string;
  label: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  icon: React.ReactNode;
}

interface ValidationRequest {
  id: string;
  contract: Contract;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  expertRating?: number;
  verificationSteps: VerificationStep[];
}

export const ValidationView: React.FC<{ 
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange?: (view: any) => void;
}> = ({ user, onNotify, onViewChange }) => {
  const { t } = useTranslation();

  // Access Control: Only Admin or Pro users can access the Validation Queue
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        >
          <Lock size={48} className="text-red-500" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase text-on-surface mb-6 tracking-tighter">
          {t('Access Restricted', 'Accès Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('The Validation Queue is reserved for Professional Associates and Certified Professionals. This section contains sensitive legal and financial data protected by the LYA Protocol.', 'La file d\'attente de validation est réservée aux associés professionnels et aux professionnels certifiés. Cette section contient des données juridiques et financières sensibles protégées par le protocole LYA.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onViewChange?.('PRICING')}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)]"
          >
            {t('Upgrade to Pro', 'Passer à Pro')}
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-white/5 border border-white/10 text-on-surface font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            {t('Contact Support', 'Contacter le Support')}
          </button>
        </div>
      </div>
    );
  }
  
  const createSteps = (isApproved: boolean): VerificationStep[] => [
    { id: 'legal', label: t('Legal Review', 'Révision Légale'), status: isApproved ? 'COMPLETED' : 'PENDING', icon: <ShieldCheck size={14} /> },
    { id: 'financial', label: t('Financial Audit', 'Audit Financier'), status: isApproved ? 'COMPLETED' : 'PENDING', icon: <TrendingUp size={14} /> },
    { id: 'ip', label: t('IP Verification', 'Vérification PI'), status: isApproved ? 'COMPLETED' : 'PENDING', icon: <Award size={14} /> },
    { id: 'signoff', label: t('Professional Sign-off', 'Signature Professionnelle'), status: isApproved ? 'COMPLETED' : 'PENDING', icon: <CheckCircle size={14} /> }
  ];

  const [requests, setRequests] = useState<ValidationRequest[]>(
    CONTRACTS.slice(0, 6).map((contract, i) => ({
      id: `val-${i}`,
      contract,
      timestamp: '14:22:01',
      status: 'PENDING',
      verificationSteps: createSteps(false)
    }))
  );

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const sendRejectionEmail = (contractName: string, reason: string) => {
    // Simulating email dispatch via LYA Protocol
    console.log(`[LYA PROTOCOL] Dispatching Rejection Email for ${contractName}. Reason: ${reason}`);
  };

  const handleVerifyStep = (requestId: string, stepId: string) => {
    const request = requests.find(r => r.id === requestId);
    const step = request?.verificationSteps.find(s => s.id === stepId);
    
    if (step) {
      onNotify(`${t('STEP VERIFIED', 'ÉTAPE VÉRIFIÉE')}: ${step.label}`);
    }

    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      
      const updatedSteps = req.verificationSteps.map(step => 
        step.id === stepId ? { ...step, status: 'COMPLETED' as const } : step
      );
      
      return { ...req, verificationSteps: updatedSteps };
    }));
  };

  const confirmRejection = () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    
    const request = requests.find(r => r.id === rejectingId);
    if (request) {
      sendRejectionEmail(request.contract.name, rejectionReason);
      onNotify(`${t('PROJECT REJECTED & REMOVED', 'PROJET REJETÉ ET SUPPRIMÉ')}: ${request.contract.name}`);
      
      // Automatically remove from list as requested
      setRequests(prev => prev.filter(r => r.id !== rejectingId));
    }
    
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    if (action === 'REJECT') {
      setRejectingId(id);
      return;
    }

    if (action === 'APPROVE') {
      const allStepsCompleted = request.verificationSteps.every(s => s.status === 'COMPLETED');
      if (!allStepsCompleted) {
        onNotify(t('ALL VERIFICATION STEPS MUST BE COMPLETED BEFORE APPROVAL.', 'TOUTES LES ÉTAPES DE VÉRIFICATION DOIVENT ÊTRE TERMINÉES AVANT L\'APPROBATION.'));
        return;
      }
      
      onNotify(`${t('VALIDATION APPROVED: AWAITING CONTRACT SIGN-OFF', 'VALIDATION APPROUVÉE : EN ATTENTE DE SIGNATURE DU CONTRAT')}: ${request.contract.name}`);
      // Mark as approved but keep for transition or remove to "Pending Contracts"
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'APPROVED' } : req
      ));
    }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-dim/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-low border border-white/10 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <h3 className="text-2xl font-black font-headline text-white uppercase tracking-tighter mb-4">
                {t('Refusal Explanation Required', 'Explication du Refus Requise')}
              </h3>
              <p className="text-sm text-on-surface-variant opacity-70 mb-6 font-medium">
                {t('Explain why the project does not meet LYA criteria. This message will be sent to the creator to help them return more competitive.', 'Expliquez pourquoi le projet ne respecte pas les critères LYA. Ce message sera envoyé au créateur pour l\'aider à revenir plus compétitif.')}
              </p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('Detail each reason for refusal...', 'Détaillez chaque raison du refus...')}
                className="w-full h-40 bg-surface-dim border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-red-500 transition-all mb-8 font-medium"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface hover:bg-white/5 rounded-xl transition-all"
                >
                  {t('Cancel', 'Annuler')}
                </button>
                <button 
                  onClick={confirmRejection}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-4 bg-red-500 text-surface-dim text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
                >
                  {t('Confirm Rejection', 'Confirmer le Refus')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PageHeader 
        titleWhite={t('Validation', 'VALIDATION')}
        titleAccent={t('Queue', 'QUEUE')}
        description={t('Review and certify high-value creative contracts. Every validation step is recorded on the LYA Immutable Ledger.', 'Examinez et certifiez les contrats créatifs de haute valeur. Chaque étape de validation est enregistrée sur le registre immuable LYA.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20 px-6 md:px-12">
        <div className="flex gap-4">
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px] rounded-xl shadow-2xl">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-black opacity-80">{t('Pending', 'En Attente')}</div>
            <div className="text-2xl font-black text-primary-cyan">{requests.filter(r => r.status === 'PENDING').length}</div>
          </div>
          <div className="bg-surface-low border border-white/5 p-4 text-center min-w-[120px] rounded-xl shadow-2xl">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-black opacity-80">{t('Verified', 'Vérifié')}</div>
            <div className="text-2xl font-black text-emerald-400">{requests.filter(r => r.status === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-6 md:px-12">
        <StatCard 
          title={t('Total Validated', 'Total Validé')} 
          value="1,248" 
          icon={<ShieldCheck size={20} />} 
          trend="+12%" 
          color="cyan" 
          subValue="EXPERT GRADE"
        />
        <StatCard 
          title={t('Pending Audit', 'Audit en Attente')} 
          value={requests.filter(r => r.status === 'PENDING').length} 
          icon={<Clock size={20} />} 
          trend="+5%" 
          color="gold" 
          subValue="HIGH PRIORITY"
        />
        <StatCard 
          title={t('Compliance Rate', 'Taux de Conformité')} 
          value="99.8%" 
          icon={<CheckCircle size={20} />} 
          trend="+0.2%" 
          color="emerald" 
          subValue="GLOBAL STANDARD"
        />
        <StatCard 
          title={t('Registry Health', 'Santé du Registre')} 
          value="Optimal" 
          icon={<RefreshCw size={20} className="animate-spin-slow" />} 
          trend="Stable" 
          color="blue" 
          subValue="ALL SYSTEMS GO"
        />
      </div>

      <div className="bg-surface-low/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-surface-highest/50 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-cyan/10 rounded-lg border border-primary-cyan/20">
              <ShieldCheck size={24} className="text-primary-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-black font-headline uppercase tracking-widest">{t('Registry Validation Interface', 'Interface de Validation du Registre')}</h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-50">Authorized Personnel Only</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={14} />
              <input 
                className="bg-surface-dim/80 border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 pl-10 pr-4 focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan transition-all rounded-lg w-48" 
                placeholder={t('Search Queue...', 'Rechercher dans la File...')} 
              />
            </div>

            <button 
              onClick={() => onNotify('REFRESHING VALIDATION QUEUE...')}
              className="flex items-center gap-2 bg-primary-cyan text-surface-dim hover:bg-white border border-primary-cyan hover:border-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(0,224,255,0.3)] rounded-lg"
            >
              <RefreshCw size={16} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {requests.map((req, idx) => (
                <motion.div 
                  key={req.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-surface-dim/40 backdrop-blur-md border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white/[0.02] transition-all rounded-xl"
                >
                  <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-surface-low border border-white/5 overflow-hidden relative rounded-lg shadow-inner shrink-0">
                        <img src={req.contract.image} alt={req.contract.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
                        {req.status === 'APPROVED' && (
                          <div className="absolute inset-0 bg-emerald-400/20 flex items-center justify-center backdrop-blur-[2px]">
                            <CheckCircle size={32} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                          </div>
                        )}
                        {req.status === 'REJECTED' && (
                          <div className="absolute inset-0 bg-red-400/20 flex items-center justify-center backdrop-blur-[2px]">
                            <AlertCircle size={32} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-xl font-headline tracking-tight group-hover:text-primary-cyan transition-colors">{req.contract.name}</h3>
                          <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-on-surface-variant uppercase tracking-widest font-black rounded-sm">{req.contract.registryIndex}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-5 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary-cyan" /> {t('Received', 'Reçu')}: {req.timestamp}</span>
                          <span className="flex items-center gap-1.5"><Award size={12} className="text-accent-gold" /> {t('Rarity', 'Rareté')}: {req.contract.rarity}</span>
                          <span className="flex items-center gap-1.5 text-primary-cyan"><ShieldCheck size={12} /> {t('Pro Rating', 'Note Pro')}: {req.contract.professionalRating}/1000</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Steps */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">{t('Validation Trace', 'Trace de Validation')}</div>
                        {req.status === 'PENDING' && (
                          <button 
                            onClick={() => {
                              req.verificationSteps.forEach(s => {
                                if (s.status === 'PENDING') handleVerifyStep(req.id, s.id);
                              });
                            }}
                            className="text-[9px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors bg-primary-cyan/10 px-2 py-1 border border-primary-cyan/20 cursor-pointer"
                          >
                            {t('Auto-Verify All', 'Tout Vérifier')}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {req.verificationSteps.map((step) => (
                        <div 
                          key={step.id}
                          className={`p-3 border rounded-lg flex flex-col gap-2 transition-all ${
                            step.status === 'COMPLETED' ? 'bg-emerald-400/5 border-emerald-400/20' : 
                            step.status === 'FAILED' ? 'bg-red-400/5 border-red-400/20' : 
                            'bg-surface-low border-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-md ${step.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-400/10' : 'text-on-surface-variant bg-white/5'}`}>
                              {step.icon}
                            </div>
                            {step.status === 'COMPLETED' && <CheckCircle size={12} className="text-emerald-400" />}
                          </div>
                          <div className="space-y-1">
                            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">{step.label}</div>
                            {req.status === 'PENDING' && step.status === 'PENDING' && (
                              <button 
                                onClick={() => handleVerifyStep(req.id, step.id)}
                                className="text-[8px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors text-left"
                              >
                                {t('Verify Now', 'Vérifier')}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>

                  <div className="flex items-center gap-4">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleAction(req.id, 'REJECT')}
                            className="px-6 py-3 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/10 transition-all active:scale-95 rounded-lg"
                          >
                            {t('Reject', 'Rejeter')}
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'APPROVE')}
                            disabled={!req.verificationSteps.every(s => s.status === 'COMPLETED')}
                            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 rounded-lg relative overflow-hidden group/approve ${
                              req.verificationSteps.every(s => s.status === 'COMPLETED')
                                ? 'bg-primary-cyan text-surface-dim shadow-[0_0_20px_rgba(0,224,255,0.3)] hover:bg-white'
                                : 'bg-white/5 text-on-surface-variant cursor-not-allowed border border-white/10'
                            }`}
                          >
                            <span className="relative z-10">{t('Approve', 'Approuver')}</span>
                            {req.verificationSteps.every(s => s.status === 'COMPLETED') && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/approve:animate-shimmer" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`flex items-center gap-3 px-5 py-2.5 border rounded-lg relative overflow-hidden ${req.status === 'APPROVED' ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5' : 'border-red-400/20 text-red-400 bg-red-400/5'} text-[10px] font-black uppercase tracking-widest shadow-inner`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                          {req.status === 'APPROVED' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {req.status === 'APPROVED' ? t('AWAITING CONTRACT', 'EN ATTENTE DE CONTRAT') : t('REJECTED', 'REJETÉ')}
                          {req.status === 'APPROVED' && (
                            <div className="ml-2 pl-2 border-l border-emerald-400/20 font-mono text-[8px] opacity-60">
                              SIG: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}
                            </div>
                          )}
                        </motion.div>
                      )}
                      <button 
                        onClick={() => onNotify(`OPENING CONTRACT DOSSIER FOR ${req.contract.name}...`)}
                        className="p-3 bg-white/5 text-on-surface-variant hover:text-primary-cyan hover:bg-white/10 transition-all rounded-lg border border-white/5"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-surface-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-xl shadow-2xl group hover:border-primary-cyan/30 transition-all">
          <div className="flex items-center gap-4 mb-6 text-primary-cyan">
            <div className="p-3 bg-primary-cyan/10 rounded-lg border border-primary-cyan/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-black font-headline uppercase tracking-widest text-sm">{t('Security Protocol', 'Protocole de Sécurité')}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-[0.2em] font-bold opacity-70 group-hover:opacity-100 transition-opacity">
            {t('All validation decisions are immutable once multi-sig consensus is reached. Expert Registries are penalized for incorrect validations via the reputation slashing mechanism.', 'Toutes les décisions de validation sont immuables une fois le consensus multi-sig atteint. Les centres experts sont pénalisés pour les validations incorrectes via le mécanisme de réduction de réputation.')}
          </p>
        </div>
        <div className="bg-surface-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-xl shadow-2xl group hover:border-accent-gold/30 transition-all">
          <div className="flex items-center gap-4 mb-6 text-accent-gold">
            <div className="p-3 bg-accent-gold/10 rounded-lg border border-accent-gold/20 group-hover:scale-110 transition-transform">
              <Award size={24} />
            </div>
            <h3 className="font-black font-headline uppercase tracking-widest text-sm">{t('Reputation Tier', 'Niveau de Réputation')}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-[0.2em] font-bold opacity-70 group-hover:opacity-100 transition-opacity">
            {t('Your Registry currently holds "Expert" status. High-value contracts (> $1M) require your signature for settlement.', 'Votre centre détient actuellement le statut "Expert". Les contrats de haute valeur (> 1M $) nécessitent votre signature pour le règlement.')}
          </p>
        </div>
        <div className="bg-surface-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-xl shadow-2xl group hover:border-primary-cyan/30 transition-all">
          <div className="flex items-center gap-4 mb-6 text-primary-cyan">
            <div className="p-3 bg-primary-cyan/10 rounded-lg border border-primary-cyan/20 group-hover:scale-110 transition-transform">
              <RefreshCw size={24} className="animate-spin-slow" />
            </div>
            <h3 className="font-black font-headline uppercase tracking-widest text-sm">{t('Sync Status', 'Statut de Synchronisation')}</h3>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-[0.2em] font-bold opacity-70 group-hover:opacity-100 transition-opacity">
            {t('Connected to 128 global validation registries. Latency optimized for sub-second consensus across major exchange centers.', 'Connecté à 128 registres de validation mondiaux. Latence optimisée pour un consensus en moins d\'une seconde à travers les principaux centres d\'échange.')}
          </p>
        </div>
      </div>

      <div className="pt-24 border-t border-white/5">
        <h3 className="text-2xl font-black font-headline text-white uppercase italic tracking-tighter mb-12 flex items-center gap-4">
          <div className="w-[1px] h-8 bg-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.4)]"></div>
          {t('Administrative Services', 'Services Administratifs')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: t('Ledger Audit', 'Audit du Grand Livre'), icon: <Database size={24} />, color: 'primary-cyan' },
            { title: t('Consensus Management', 'Gestion du Consensus'), icon: <Activity size={24} />, color: 'accent-gold' },
            { title: t('Expert Onboarding', 'Onboarding Experts'), icon: <Users size={24} />, color: 'emerald-400' },
            { title: t('Protocol Governance', 'Gouvernance Protocole'), icon: <Gavel size={24} />, color: 'accent-pink' }
          ].map((service, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-surface-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl group cursor-pointer hover:border-white/20 transition-all text-center flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-${service.color} mb-6 group-hover:scale-110 transition-all border border-white/10 group-hover:bg-white/10 shadow-xl`}>
                {service.icon}
              </div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 group-hover:text-primary-cyan transition-colors">{service.title}</h4>
              <div className="text-[8px] text-on-surface-variant uppercase tracking-widest font-black opacity-40 leading-relaxed mb-6">
                Professional access to underlying protocol logic and registry maintenance.
              </div>
              <button className="text-[9px] font-black text-primary-cyan uppercase tracking-widest hover:text-white transition-colors border-b border-primary-cyan/20 pb-1">
                {t('ACCESS_SERVICE', 'ACCÉDER_AU_SERVICE')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
