import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Terminal,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Logo } from '../components/ui/Logo';

interface PendingApprovalViewProps {
  user: UserProfile;
  onApprove: () => void;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ user, onApprove, onLogout }) => {
  const { t } = useTranslation();
  const [isBypassing, setIsBypassing] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBypass = () => {
    setIsBypassing(true);
    setTimeout(() => {
      onApprove();
      setIsBypassing(false);
    }, 1200);
  };

  const handleValidateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setIsValidating(true);
    setKeyError(null);
    setSuccessMsg(null);
    try {
      const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const k = accessKey.trim().toUpperCase();
      const keysRef = collection(db, 'access_keys');
      const q = query(keysRef, where('key', '==', k));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setKeyError(t('Invalid key. Please check spelling.', 'Clé invalide. Veuillez vérifier la saisie.'));
        setIsValidating(false);
        return;
      }
      
      const keyData = snap.docs[0].data();
      if (keyData.status === 'USED') {
         setKeyError(t('Key has already been used.', 'Cette clé d\'accès a déjà été consommée.'));
         setIsValidating(false);
         return;
      }
      
      // Consume the key
      const keyDocId = snap.docs[0].id;
      await updateDoc(doc(db, 'access_keys', keyDocId), {
        status: 'USED',
        usedBy: user.email,
        usedAt: new Date().toISOString()
      });
      
      setSuccessMsg(t('Access key verified. Provisioning terminal profile...', 'Clé d\'accès vérifiée. Configuration de votre profil...'));
      
      setTimeout(() => {
        onApprove();
        setIsValidating(false);
      }, 1500);
    } catch (err: any) {
      console.warn(err);
      setKeyError(t('Database query limits reached. Try again later.', 'Limites de requêtes atteintes. Réessayez plus tard.'));
      setIsValidating(false);
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case UserRole.INVESTOR:
        return t('Art Patrons, VCs & Cultural Backers', 'Mécène, Fonds d\'Accompagnement & VC');
      case UserRole.CREATOR:
        return t('Creator, Independent Producer & Talent', 'Créateur, Label & Talent Indépendant');
      case UserRole.PROFESSIONAL:
        return t('Arts Curator, Agent & Cultural Advisor', 'Curateur, Agent Artistique & Conseiller');
      default:
        return t('Cultural Partner', 'Partenaire Créatif');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-mono select-none">
      {/* Visual backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(0,224,255,0.06)_0%,transparent_60%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF007F]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9D00FF]/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#080B10] border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col min-h-[500px]"
      >
        {/* Glow Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-cyan via-[#FF007F] to-[#9D00FF]" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* Main Info Block */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Logo size={42} color="multi" showBeta={true} />
                <div className="flex flex-col">
                  <span className="font-headline font-black text-lg tracking-tight uppercase">LINKYOURART</span>
                  <span className="text-[7px] font-bold text-primary-cyan tracking-[0.4em] uppercase">TALENT HUB PREVIEW</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  <Clock size={10} className="animate-pulse" />
                  {t('MEMBER REVIEW PENDING', 'DÉMARCHE DE CO-OPTATION EN COURS')}
                </div>
                <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter leading-none italic text-white">
                  {t('PREVIEW SPACE', 'ESPACE DE DÉMONSTRATION')} <br />
                  <span className="text-primary-cyan">{t('INVITATION MANDATORY', 'INVITATION SÉLECTIONNÉE')}</span>
                </h2>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold leading-relaxed pt-2 leading-relaxed text-justify">
                  {t(
                    'The LinkYourArt demonstration platform is a private space reserved for partners, artistic creators, and investment funds invited to analyze the project. Your pre-registration application has been successfully filed.',
                    'L\'espace de démonstration LinkYourArt est un espace privé réservé aux partenaires, créateurs artistiques, et fonds d\'investissement invités à analyser le projet dans le cadre de notre levée de fonds. Votre demande de pré-inscription a été enregistrée avec succès.'
                  )}
                </p>
              </div>

              {/* Profile Details */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">{t('ASSIGNED PROFESSIONAL PROFILE', 'PROFIL DE PRÉ-INSCRIPTION')}</div>
                <div className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Award size={12} className="text-primary-cyan" />
                  {getRoleLabel(user.role)}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium pt-1">
                  ID: <span className="font-mono text-primary-cyan">{user.uid.slice(0, 12)}...</span> • {user.email}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-6">
              <button 
                onClick={onLogout}
                className="inline-flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-all group"
              >
                <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
                {t('LEAVE PREVIEW HUB', 'QUITTER LE HUB DE DÉMONSTRATION')}
              </button>
            </div>
          </div>

          {/* Timeline and Bypass Panel */}
          <div className="lg:col-span-5 p-8 md:p-12 bg-white/[0.01] flex flex-col justify-between space-y-8">
            {/* Timeline Progress */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-white/40 tracking-[0.4em] uppercase">{t('ADMISSION TIMELINE', 'INSCRIPTION ET SÉLECTION')}</h3>
              
              <div className="space-y-6 relative pl-3 border-l border-white/5">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">{t('STEP 1: PROFILE APPLICATON', '1. DEMANDE DE CO-OPTATION')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('profile request submitted', 'demande soumise et enregistrée')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center animate-pulse" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-500 uppercase tracking-wider">{t('STEP 2: COMMITEE OVERVIEW', '2. REVUE DU PORTFOLIO')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('validation of creative or professional alignment', 'relecture de l\'alignement professionnel sous 24h')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative opacity-40">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-white/20 border-2 border-black flex items-center justify-center" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-white uppercase tracking-wider">{t('STEP 3: ACCESS PROVISIONED', '3. ACTIVATION ET ACCÈS PLÉNIER')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('final onboarding to the representation hub', 'intégration définitive au réseau de talent')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCESS KEY ENTRY BOX - ENHANCED VISIBILITY */}
            <div className="p-8 bg-[#150a12]/90 border-2 border-[#FF007F] rounded-[2rem] space-y-5 relative overflow-hidden shadow-[0_0_40px_rgba(255,0,127,0.35)] animate-pulse hover:animate-none transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF007F]/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary-cyan/10 blur-2xl rounded-full pointer-events-none" />
              
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF007F] animate-ping" />
                  <span className="text-[10px] font-black text-[#FF007F] uppercase tracking-[0.25em] drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">
                    {t('SECURED ACCESS KEY GATEWAY', 'SAISIE SÉCURISÉE DE LA CLÉ D\'ACCÈS')}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {t('ENTER YOUR CO-OPTATION CODE BELOW', 'RENSEIGNEZ VOTRE CODE D\'ACCÈS PRIVILÉGIÉ')}
                </h3>
                <p className="text-xs text-white/75 uppercase tracking-wider font-bold leading-normal">
                  {t(
                    'Input your administrator-delivered clearance code below to instantly bypass the review process and fully activate your profile.',
                    'Si vous possédez une clé d\'accès privilégiée délivrée par le comité de co-optation, saisissez-la ci-dessous pour activer immédiatement votre accès.'
                  )}
                </p>
              </div>

              <form onSubmit={handleValidateKey} className="space-y-4 relative z-10">
                <input 
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="e.g. LYA-DEMO-2026 / LYA2026"
                  className="w-full bg-black/80 border-2 border-[#FF007F]/65 focus:border-[#FF007F] rounded-xl px-5 py-4 text-sm font-mono text-center tracking-[0.25em] font-black uppercase text-white focus:outline-none focus:ring-2 focus:ring-[#FF007F]/30 transition-all placeholder:text-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                />

                {keyError && (
                  <div className="text-[10px] font-bold text-rose-400 bg-rose-950/40 py-2 px-4 rounded-xl border-2 border-rose-500/50 uppercase tracking-wide text-center">
                    {keyError}
                  </div>
                )}
                
                {successMsg && (
                  <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 py-2 px-4 rounded-xl border-2 border-emerald-500/50 uppercase tracking-wide text-center animate-pulse">
                    {successMsg}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isValidating || !accessKey.trim()}
                  className="w-full py-4.5 bg-gradient-to-r from-[#FF007F] to-[#9D00FF] text-white hover:from-white hover:to-white hover:text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 shadow-[0_10px_25px_rgba(255,0,127,0.3)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.4)]"
                >
                  {isValidating ? (
                    <RefreshCw size={14} className="animate-spin text-white" />
                  ) : (
                    <>
                      {t('ACTIVATE SYSTEM ACCESS', 'ACTIVER MON ACCÈS PLÉNIER')}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* JURY BYPASS BOX */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[1.8rem] space-y-4 relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 blur-2xl rounded-full pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary-cyan animate-pulse" />
                  <span className="text-xs font-black text-primary-cyan uppercase tracking-widest">{t('DEMO EVALUATION BYPASS', 'ÉVALUATION DÉMO : ACCÈS DIRECT')}</span>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold leading-normal">
                  {t(
                    'Are you evaluating this platform for a demo, investment or partner review? You can bypass the clearance waitlist immediately with one click to test all the hub features.',
                    'Vous examinez la plateforme dans le cadre d\'un test, d\'une évaluation ou d\'un partenariat ? Activez l\'accès démo maintenant pour explorer l\'ensemble des galeries et d\'outils d\'analyse.'
                  )}
                </p>
              </div>

              <button 
                onClick={handleBypass}
                disabled={isBypassing}
                className="w-full relative z-10 py-4 bg-primary-cyan text-surface-dim hover:bg-white text-[10px] font-black uppercase tracking-[0.2em] italic rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,224,255,0.15)] disabled:opacity-50"
              >
                {isBypassing ? (
                  <RefreshCw size={14} className="animate-spin text-surface-dim" />
                ) : (
                  <>
                    {t('🔑 UNLOCK PREVIEW', '🔓 ACCÉDER À LA DÉMO')}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Creative Ecosystem Banner */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[7px] font-black text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-400" />
            CREATIVE IP INDEXING HUB
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-primary-cyan" />
            DEMONSTRATION & PARTNERS PREVIEW
          </div>
          <div>PREVIEW v4.2 ALPHA</div>
        </div>
      </motion.div>
    </div>
  );
};
