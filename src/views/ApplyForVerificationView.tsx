
import React, { useState } from 'react';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  Shield,
  X
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { VALIDATOR_TIERS, EXPRESS_48H_PRICE_EUR, EXPRESS_24H_PRICE_EUR } from '../lib/permissions';

export const ApplyForVerificationView: React.FC<{ onNotify: (msg: string) => void; user?: any }> = ({ onNotify, user }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    website: '',
    notes: ''
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeDocument = (idx: number) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  // Upload réel vers Firebase Storage — même schéma que l'upload de projet
  // déjà utilisé ailleurs dans l'app (ProfileView.handleFileUpload), pour
  // rester cohérent avec l'infrastructure existante.
  const uploadDocuments = async (): Promise<{ name: string; url: string; size: number }[]> => {
    if (documents.length === 0) return [];
    setIsUploadingDocs(true);
    try {
      const uploaded = await Promise.all(documents.map(async (file) => {
        const storageRef = ref(storage, `verification_documents/${user?.uid || 'anonymous'}/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        await new Promise<void>((resolve, reject) => {
          task.on('state_changed', undefined, reject, () => resolve());
        });
        const url = await getDownloadURL(task.snapshot.ref);
        return { name: file.name, url, size: file.size };
      }));
      return uploaded;
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onNotify(t('SUBMITTING PROFESSIONAL VERIFICATION REQUEST...', 'SOUMISSION DE LA DEMANDE DE VÉRIFICATION PROFESSIONNELLE...'));
    try {
      const uploadedDocuments = await uploadDocuments();
      const docRef = await addDoc(collection(db, 'verification_requests'), {
        userId: user?.uid || null,
        userEmail: user?.email || null,
        userDisplayName: user?.displayName || null,
        selectedSector,
        formData: formData,
        firm: formData.organization,
        registrationId: null,
        authority: null,
        documents: uploadedDocuments,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      });
      setSubmittedRequestId(docRef.id);
      setStep(3);
      onNotify(t('REQUEST RECEIVED. AUDIT PENDING.', 'DEMANDE REÇUE. AUDIT EN ATTENTE.'));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, 'verification_requests');
      onNotify(t('Submission error. Please try again.', 'Erreur. Veuillez réessayer.'));
    }
  };

  const sectors = [
    { id: 'fine-art', name: t('FINE ART', 'BEAUX-ARTS'), icon: <Building2 size={24} />, color: 'text-accent-pink', borderColor: 'border-accent-pink/20', bgColor: 'bg-accent-pink/5' },
    { id: 'film', name: t('FILM & TV', 'CINÉMA & TV'), icon: <Award size={24} />, color: 'text-rose-400', borderColor: 'border-rose-400/20', bgColor: 'bg-rose-400/5' },
    { id: 'music', name: t('MUSIC', 'MUSIQUE'), icon: <Gem size={24} />, color: 'text-emerald-400', borderColor: 'border-emerald-400/20', bgColor: 'bg-emerald-400/5' },
    { id: 'architecture', name: t('ARCHITECTURE', 'ARCHITECTURE'), icon: <Shield size={24} />, color: 'text-primary-cyan', borderColor: 'border-primary-cyan/20', bgColor: 'bg-primary-cyan/5' },
    { id: 'fashion', name: t('FASHION & DESIGN', 'MODE & DESIGN'), icon: <Crown size={24} />, color: 'text-pink-400', borderColor: 'border-pink-400/20', bgColor: 'bg-pink-400/5' },
    { id: 'other', name: t('OTHER CREATIVE SECTOR', 'AUTRE SECTEUR CRÉATIF'), icon: <Lock size={24} />, color: 'text-accent-gold', borderColor: 'border-accent-gold/20', bgColor: 'bg-accent-gold/5' },
  ];

  return (
    <div className="space-y-8 pb-12 relative min-h-screen overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-cyan/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-gold/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(10,11,12,0.8)_100%)]" />
      </div>

      <PageHeader 
        titleWhite={t('LYA', 'LYA')}
        titleAccent={t('VALIDATOR APPLICATION', 'CANDIDATURE VALIDATEUR')}
        description={t('Join the network of accredited creative certification experts. Standard certification is always free for creators — validators are compensated for every review, funded by the Validator Remuneration Fund.', 'Rejoignez le réseau d\'experts accrédités en certification créative. La certification standard reste toujours gratuite pour les créateurs — les validateurs sont rémunérés pour chaque revue, financée par le Fonds de Rémunération des Validateurs.')}
        accentColor="text-primary-cyan"
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              {/* Informational: how compensation progresses — everyone starts at Bronze */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={18} className="text-primary-cyan" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    {t('How you get paid — every validator starts at Bronze', 'Comment vous êtes payé — tout validateur démarre à Bronze')}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant/70 max-w-2xl leading-relaxed mb-8">
                  {t(
                    `There's no applying for a higher tier. Your tier is recalculated every month from your certification volume and average rating — the more consistent you are, the more you're paid, including on Express jobs (${EXPRESS_48H_PRICE_EUR}€/48h, ${EXPRESS_24H_PRICE_EUR}€/24h paid by creators who need priority processing, never a lower review bar).`,
                    `Il n'y a rien à candidater pour monter de palier. Votre palier est recalculé chaque mois selon votre volume de certifications et votre note moyenne — plus vous êtes constant, mieux vous êtes payé, y compris sur les dossiers Express (${EXPRESS_48H_PRICE_EUR}€/48h, ${EXPRESS_24H_PRICE_EUR}€/24h payés par les créateurs pressés, jamais un examen moins rigoureux).`
                  )}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {VALIDATOR_TIERS.map((tier, i) => (
                    <div
                      key={tier.id}
                      className={`p-5 rounded-2xl border ${i === 3 ? 'border-primary-cyan/30 bg-primary-cyan/5 shadow-[0_0_30px_rgba(0,224,255,0.12)]' : i === 0 ? 'border-white/5 bg-surface-low/40' : 'border-white/10 bg-surface-low/60'}`}
                      style={{ transform: `translateY(${(3 - i) * 6}px)` }}
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-1">
                        {t('TIER', 'PALIER')} {i + 1}
                      </div>
                      <h4 className={`text-lg font-black uppercase italic tracking-tighter mb-3 ${i === 3 ? 'text-primary-cyan' : i === 0 ? 'text-accent-gold/70' : 'text-white'}`}>
                        {tier.name}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant/60 uppercase font-bold tracking-tight mb-4 min-h-[28px]">
                        {tier.minCertifications === 0
                          ? t('< 50 certifications', '< 50 certifications')
                          : `${tier.minCertifications}+ ${t('certifications', 'certifications')} · ${tier.minRating}/5`}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[10px] text-on-surface-variant/50 uppercase font-bold">{t('Standard', 'Standard')}</span>
                        <span className="text-sm font-black text-white">{tier.standardPayoutEUR}€</span>
                      </div>
                      {tier.expressPayoutEUR && (
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] text-on-surface-variant/50 uppercase font-bold">{t('Express', 'Express')}</span>
                          <span className="text-sm font-black text-accent-gold">{tier.expressPayoutEUR}€</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real selection: sector of expertise, not a wealth tier */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Fingerprint size={18} className="text-primary-cyan" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    {t('Your sector of expertise', 'Votre secteur d\'expertise')}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant/70 max-w-2xl leading-relaxed mb-8">
                  {t('Select the creative sector you can credibly review. You\'ll certify work in this sector only — you can apply for an additional sector later once accredited.', 'Choisissez le secteur créatif que vous pouvez évaluer avec crédibilité. Vous certifierez uniquement dans ce secteur — vous pourrez candidater pour un secteur supplémentaire une fois accrédité.')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sectors.map((sector) => (
                    <motion.div 
                      key={sector.id}
                      whileHover={{ y: -6 }}
                      onClick={() => setSelectedSector(sector.id)}
                      className={`relative p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group ${
                        selectedSector === sector.id 
                          ? `${sector.borderColor} ${sector.bgColor} shadow-[0_30px_60px_rgba(0,0,0,0.4)]` 
                          : 'border-white/5 bg-surface-low/40 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                        selectedSector === sector.id ? 'bg-white text-surface-dim' : 'bg-white/5 text-white/40'
                      }`}>
                        {sector.icon}
                      </div>
                      <h3 className={`text-xl font-black uppercase italic tracking-tighter ${selectedSector === sector.id ? 'text-white' : 'text-white/40'}`}>
                        {sector.name}
                      </h3>
                      <div className={`mt-8 pt-6 border-t border-white/5 flex items-center justify-between ${selectedSector === sector.id ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em]">{t('Selected', 'Sélectionné')}</span>
                        <div className="w-9 h-9 rounded-full bg-primary-cyan flex items-center justify-center text-surface-dim">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => selectedSector && setStep(2)}
                  disabled={!selectedSector}
                  className="px-20 py-8 bg-white text-surface-dim font-black uppercase italic tracking-[0.5em] text-sm hover:bg-primary-cyan transition-all active:scale-95 disabled:opacity-10 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                  {t('Start Verification', 'Lancer la Vérification')}
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
                  className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors uppercase text-xs font-black tracking-widest group"
                >
                  <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                  {t('Reverse Selection', 'Inverser la Sélection')}
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse"></div>
                  <span className="text-xs font-black text-primary-cyan uppercase tracking-[0.2em]">{t('Secured Channel', 'Canal Sécurisé')}</span>
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
                      <p className="text-[11px] text-primary-cyan uppercase tracking-[0.4em] font-black italic opacity-60">{t('Expert Protocol V4.2', 'Protocole Expert V4.2')}</p>
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-gradient-to-r from-primary-cyan via-white/5 to-transparent mb-6 opacity-30" />
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60 italic leading-relaxed px-3">
                    {t('AUTHORIZED TERMINAL SECURED. MISSION CRITICAL DATA MUST BE INPUT TO GENERATE COMPLIANCE CERTIFICATE.', 'TERMINAL AUTORISÉ SÉCURISÉ. LES DONNÉES CRITIQUES POUR LA MISSION DOIVENT ÊTRE SAISIES POUR GÉNÉRER LE CERTIFICAT DE CONFORMITÉ.')}
                  </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  <div className="space-y-8">
                    <div className="group relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-primary-cyan transition-all duration-500 rounded-full" />
                      <label className="block text-xs font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-primary-cyan transition-colors">{t('Principal Legal Identity', 'Identité Légale Principale')}</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="E.G. ALEXANDER VANCE"
                        className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary-cyan/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="group relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-accent-gold transition-all duration-500 rounded-full" />
                        <label className="block text-xs font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-accent-gold transition-colors">{t('Organization Entity', 'Entité Organisationnelle')}</label>
                        <input 
                          required
                          type="text" 
                          value={formData.organization}
                          onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                          placeholder="ALPHA FUND"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                        />
                      </div>
                      <div className="group relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-accent-magenta transition-all duration-500 rounded-full" />
                        <label className="block text-xs font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-accent-magenta transition-colors">{t('Operational Role', 'Rôle Opérationnel')}</label>
                        <input 
                          required
                          type="text" 
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          placeholder="CHIEF STRATEGIST"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-accent-magenta/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20"
                        />
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-primary-cyan transition-all duration-500 rounded-full" />
                      <label className="block text-xs font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3 group-focus-within:text-primary-cyan transition-colors">{t('Professional Network Endpoint', 'Point d\'Accès Réseau Professionnel')}</label>
                      <div className="relative">
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="VANCE@NET.ALPHA"
                          className="w-full bg-white/[0.02] border border-white/10 px-8 py-5 text-base font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary-cyan/40 focus:bg-white/[0.05] transition-all rounded-2xl shadow-inner placeholder:opacity-20 pr-14"
                        />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary-cyan/30 transition-colors" size={20} />
                      </div>
                    </div>

                    <div className="group relative">
                      <label className="block text-xs font-black uppercase tracking-[0.4em] text-on-surface-variant mb-3">{t('Supporting Documents (optional)', 'Documents Justificatifs (facultatif)')}</label>
                      <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 hover:border-primary-cyan/40 rounded-2xl cursor-pointer transition-all bg-white/[0.01]">
                        <input type="file" multiple className="hidden" onChange={handleDocumentSelect} />
                        <Upload size={22} className="text-white/30" />
                        <p className="text-xs text-center text-on-surface-variant/60 uppercase tracking-widest font-bold">
                          {t('Credentials, accreditation, ID...', 'Accréditations, pièce d\'identité...')}
                        </p>
                      </label>
                      {documents.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {documents.map((f, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl">
                              <span className="text-xs text-white/70 truncate">{f.name}</span>
                              <button type="button" onClick={() => removeDocument(i)} className="text-white/30 hover:text-rose-400 transition-colors shrink-0">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {isUploadingDocs && (
                        <p className="text-[10px] text-primary-cyan uppercase tracking-widest font-black mt-2 animate-pulse">{t('Uploading...', 'Téléversement...')}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 text-center">
                    <button 
                      type="submit"
                      disabled={isUploadingDocs}
                      className="w-full py-7 bg-white text-surface-dim font-black uppercase italic tracking-[0.6em] text-sm hover:bg-primary-cyan transition-all active:scale-95 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-2xl transform hover:-translate-y-1 duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isUploadingDocs ? t('Uploading documents...', 'Téléversement des documents...') : t('Seal & Submit Audit', 'Sceller et Soumettre l\'Audit')}
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-10 opacity-30 select-none">
                      <Shield size={12} className="text-primary-cyan animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t('End-to-End Governance Secured', 'Gouvernance de Bout en Bout Sécurisée')}</span>
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
                {t('Your professional dossier is now being reviewed by the LYA Registry.', 'Votre dossier professionnel est en cours d\'examen par le Registre LYA.')}
              </p>

              {/* Cadre aux couleurs de marque LYA (dégradé tri-couleur) —
                  le code affiché est désormais l'identifiant réel du
                  dossier en base, pas une valeur fixe. */}
              <div className="max-w-lg mx-auto p-[1.5px] rounded-2xl bg-gradient-to-r from-accent-purple via-primary-cyan to-accent-pink">
                <div className="p-6 bg-surface-dim rounded-2xl">
                  <div className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-1 italic">{t('Dossier ID', 'Identifiant du Dossier')}</div>
                  <div className="text-lg font-black text-white italic break-all">{submittedRequestId ? `#LYA-VD-${submittedRequestId.slice(0, 8).toUpperCase()}` : '—'}</div>
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
