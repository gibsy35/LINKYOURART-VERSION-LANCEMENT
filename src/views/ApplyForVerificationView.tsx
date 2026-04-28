
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Upload, 
  User, 
  Mail, 
  Briefcase, 
  Globe, 
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  Zap,
  Lock,
  Crown,
  Building2,
  Gem,
  Award,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const ApplyForVerificationView: React.FC<{ onNotify: (msg: string) => void }> = ({ onNotify }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    website: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify(t('SUBMITTING INSTITUTIONAL VERIFICATION REQUEST...', 'SOUMISSION DE LA DEMANDE DE VÉRIFICATION INSTITUTIONNELLE...'));
    setTimeout(() => {
      setStep(3);
      onNotify(t('REQUEST RECEIVED. AUDIT PENDING.', 'DEMANDE REÇUE. AUDIT EN ATTENTE.'));
    }, 2000);
  };

  const tiers = [
    {
      id: 'professional',
      name: t('PROFESSIONAL', 'PROFESSIONNEL'),
      icon: <Building2 size={24} />,
      color: 'text-primary-cyan',
      borderColor: 'border-primary-cyan/20',
      bgColor: 'bg-primary-cyan/5',
      requirements: [
        t('Linked Creative Portfolio', 'Portfolio Créatif Lié'),
        t('Registry ID Verification', 'Vérification d\'ID du Registre'),
        t('Min. 2 Active Contracts', 'Min. 2 Contrats Actifs')
      ],
      benefits: [
        t('Verified Profile Badge', 'Badge de Profil Vérifié'),
        t('Priority Support', 'Support Prioritaire'),
        t('Basic Analytics', 'Analyses de Base')
      ]
    },
    {
      id: 'institutional',
      name: t('INSTITUTIONAL', 'INSTITUTIONNEL'),
      icon: <Lock size={24} />,
      color: 'text-accent-gold',
      borderColor: 'border-accent-gold/20',
      bgColor: 'bg-accent-gold/5',
      requirements: [
        t('Legal Entity Documentation', 'Documentation d\'Entité Légale'),
        t('Capital Proof ($100k+)', 'Preuve de Capital (100k$+'),
        t('Regulatory Compliance Sync', 'Synchronisation de Conformité')
      ],
      benefits: [
        t('Pro Lounge Access', 'Accès au Salon Pro'),
        t('Sub-Registry Issuance', 'Émission de Sous-Registre'),
        t('Advanced Risk Tools', 'Outils de Risque Avancés')
      ]
    },
    {
      id: 'elite',
      name: t('ELITE PARTNER', 'PARTENAIRE ÉLITE'),
      icon: <Crown size={24} />,
      color: 'text-accent-magenta',
      borderColor: 'border-accent-magenta/20',
      bgColor: 'bg-accent-magenta/5',
      requirements: [
        t('Invitation Only', 'Sur Invitation Uniquement'),
        t('Creative Equity Mastery', 'Maîtrise de l\'Equity Créative'),
        t('Min. $1M Asset Holding', 'Min. 1M$ de Détention d\'Actifs')
      ],
      benefits: [
        t('Direct Node Governance', 'Gouvernance Directe de Nœud'),
        t('Elite Mentorship Access', 'Accès au Mentorat d\'Élite'),
        t('Platform Profit Sharing', 'Partage des Bénéfices Plateforme')
      ]
    }
  ];

  return (
    <div className="pb-32 px-6 md:px-12 pt-2 mt-2 relative min-h-screen overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-cyan/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-gold/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(10,11,12,0.8)_100%)]" />
      </div>

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 relative z-10 w-full overflow-visible">
        <div className="flex-1 w-full min-w-0">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white leading-[1.1] md:leading-[0.9] uppercase italic mb-8 md:mb-12 flex flex-wrap items-center gap-4 break-words">
             <div className="h-[2px] w-8 md:w-14 bg-primary-cyan shrink-0"></div>
             <span className="flex-1 min-w-0">{t('VERIFICATION', 'VERIFICATION')}</span>
          </h1>
          <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-xl text-[11px] md:text-sm leading-relaxed opacity-70 uppercase tracking-[0.3em] font-black italic mb-10">
            {t('ACCESS THE ELITE NETWORK OF GLOBAL CREATIVE ARCHITECTS. OUR MULTI-LAYERED AUDIT PROTOCOL ENSURES THE INTEGRITY OF HIGH-VALUE CONTRACT LENDING AND SETTLEMENT.', 'ACCÉDEZ AU RÉSEAU D\'ÉLITE DES ARCHITECTES CRÉATIFS MONDIAUX. NOTRE PROTOCOLE D\'AUDIT MULTI-NIVEAUX GARANTIT L\'INTÉGRITÉ DU PRÊT ET DU RÈGLEMENT DES CONTRATS DE GRANDE VALEUR.')}
          </p>
        </div>

        <div className="flex gap-6">
           <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-cyan to-accent-gold rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-surface-low/80 backdrop-blur-3xl border border-white/10 p-8 text-center min-w-[180px] rounded-[2rem] shadow-2xl">
                <Fingerprint className="mx-auto mb-4 text-primary-cyan" size={40} />
                <div className="text-[11px] text-primary-cyan uppercase tracking-widest mb-1 font-black">{t('Success Rate', 'Taux de Succès')}</div>
                <div className="text-4xl font-black text-white italic tracking-tighter">14.2%</div>
              </div>
           </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier) => (
                  <motion.div 
                    key={tier.id}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative p-8 md:p-12 rounded-[3rem] border transition-all duration-500 cursor-pointer group ${
                      selectedTier === tier.id 
                        ? `${tier.borderColor} ${tier.bgColor} shadow-[0_30px_60px_rgba(0,0,0,0.4)]` 
                        : 'border-white/5 bg-surface-low/40 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-colors ${
                      selectedTier === tier.id ? 'bg-white text-surface-dim' : 'bg-white/5 text-white/40'
                    }`}>
                      {tier.icon}
                    </div>
                    <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-4 ${selectedTier === tier.id ? 'text-white' : 'text-white/40'}`}>
                      {tier.name}
                    </h3>
                    <div className="space-y-4 mb-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 italic">{t('Requirements', 'Exigences')}</p>
                      {tier.requirements.map(req => (
                        <div key={req} className="flex items-center gap-3">
                          <CheckCircle size={14} className={selectedTier === tier.id ? tier.color : 'text-white/10'} />
                          <span className="text-[11px] font-bold text-white/60 tracking-tight uppercase">{req}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 italic">{t('Benefits', 'Avantages')}</p>
                      {tier.benefits.map(benefit => (
                        <div key={benefit} className="flex items-center gap-3">
                          <Zap size={14} className={selectedTier === tier.id ? tier.color : 'text-white/10'} />
                          <span className="text-[11px] font-bold text-white/90 tracking-tight uppercase">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`mt-10 pt-10 border-t border-white/5 flex items-center justify-between ${selectedTier === tier.id ? 'opacity-100' : 'opacity-0'}`}>
                      <span className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em] font-serif italic">Tier Selected</span>
                      <div className="w-10 h-10 rounded-full bg-primary-cyan flex items-center justify-center text-surface-dim">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-20">
                <button 
                  onClick={() => selectedTier && setStep(2)}
                  disabled={!selectedTier}
                  className="px-20 py-8 bg-white text-surface-dim font-black uppercase italic tracking-[0.5em] text-sm hover:bg-primary-cyan transition-all active:scale-95 disabled:opacity-10 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                  {t('Initiate Protocol', 'Initier le Protocole')}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors uppercase text-[9px] font-black tracking-widest group"
                >
                  <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                  {t('Reverse Selection', 'Inverser la Sélection')}
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse"></div>
                  <span className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.2em]">{t('Secured Channel', 'Canal Sécurisé')}</span>
                </div>
              </div>

            <div className="glass-panel p-10 md:p-14 border border-white/10 rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.7)] relative overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-cyan/5 rounded-full -mr-48 -mt-48 blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 rounded-full -ml-40 -mb-40 blur-[130px]" />
                
                <header className="mb-14 relative z-10 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan shadow-[0_0_30px_rgba(0,224,255,0.2)]">
                      <Fingerprint size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{t('Audit Registry', 'Registre d\'Audit')}</h3>
                      <p className="text-[11px] text-primary-cyan uppercase tracking-[0.4em] font-black italic opacity-60">{t('Institutional Protocol V4.2', 'Protocole Institutionnel V4.2')}</p>
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-gradient-to-r from-primary-cyan via-white/5 to-transparent mb-6 opacity-30" />
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60 italic leading-relaxed px-2">
                    {t('AUTHORIZED TERMINAL SECURED. MISSION CRITICAL DATA MUST BE INPUT TO GENERATE COMPLIANCE CERTIFICATE.', 'TERMINAL AUTORISÉ SÉCURISÉ. LES DONNÉES CRITIQUES POUR LA MISSION DOIVENT ÊTRE SAISIES POUR GÉNÉRER LE CERTIFICAT DE CONFORMITÉ.')}
                  </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  <div className="space-y-8">
                    <div className="group relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-primary-cyan transition-all duration-500 rounded-full" />
                      <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-primary-cyan transition-colors">{t('Principal Legal Identity', 'Identité Légale Principale')}</label>
                      <input 
                        required
                        type="text" 
                        placeholder="E.G. ALEXANDER VANCE"
                        className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary-cyan/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-accent-gold transition-all duration-500 rounded-full" />
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-accent-gold transition-colors">{t('Organization Entity', 'Entité Organisationnelle')}</label>
                        <input 
                          required
                          type="text" 
                          placeholder="ALPHA FUND"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                        />
                      </div>
                      <div className="group relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-accent-magenta transition-all duration-500 rounded-full" />
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-accent-magenta transition-colors">{t('Operational Role', 'Rôle Opérationnel')}</label>
                        <input 
                          required
                          type="text" 
                          placeholder="CHIEF STRATEGIST"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-magenta/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                        />
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-primary-cyan transition-all duration-500 rounded-full" />
                      <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-primary-cyan transition-colors">{t('Institutional Network Endpoint', 'Point d\'Accès Réseau Institutionnel')}</label>
                      <div className="relative">
                        <input 
                          required
                          type="email" 
                          placeholder="VANCE@NET.ALPHA"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary-cyan/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20 pr-14"
                        />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary-cyan/30 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 text-center">
                    <button 
                      type="submit"
                      className="w-full py-7 bg-white text-surface-dim font-black uppercase italic tracking-[0.6em] text-sm hover:bg-primary-cyan transition-all active:scale-95 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-2xl transform hover:-translate-y-1 duration-300"
                    >
                      {t('Seal & Submit Audit', 'Sceller et Soumettre l\'Audit')}
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-10 opacity-30 select-none">
                      <Shield size={12} className="text-primary-cyan animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{t('End-to-End Governance Secured', 'Gouvernance de Bout en Bout Sécurisée')}</span>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="relative inline-block mb-12">
                 <motion.div 
                   className="absolute -inset-8 bg-primary-cyan/20 blur-3xl rounded-full"
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 4, repeat: Infinity }}
                 />
                 <div className="relative w-32 h-32 bg-primary-cyan text-surface-dim rounded-[2rem] flex items-center justify-center shadow-2xl">
                    <ShieldCheck size={64} />
                 </div>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-black font-headline uppercase italic tracking-tighter text-white mb-6">
                {t('Audit Initialized', 'Audit Initialisé')}
              </h2>
              <p className="text-xl text-on-surface-variant uppercase tracking-[0.2em] font-black italic mb-12 opacity-60">
                {t('Your institutional dossier is now being reviewed by the LYA Registry.', 'Votre dossier institutionnel est en cours d\'examen par le Registre LYA.')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-1 italic">Protocol Code</div>
                    <div className="text-lg font-black text-white italic">#LYA-VD-842</div>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-black text-accent-gold uppercase tracking-widest mb-1 italic">Estimated Completion</div>
                    <div className="text-lg font-black text-white italic">48 HOURS</div>
                 </div>
              </div>

               <button 
                onClick={() => setStep(1)}
                className="mt-16 px-12 py-5 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-[0.4em] text-[10px] hover:bg-white/10 transition-all"
              >
                {t('Return to Portal', 'Retour au Portail')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
