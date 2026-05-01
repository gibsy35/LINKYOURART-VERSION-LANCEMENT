import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, UserProfile } from '../types';
import { View } from '../components/ui/Sidebar';
import { ArrowRight, User, Briefcase, TrendingUp, Loader2, ShieldCheck, Mail, Lock, Globe, ChevronLeft, X, Send } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Logo } from '../components/ui/Logo';
import { OracleWidget } from '../components/ui/OracleWidget';

interface SignupViewProps {
  onViewChange: (view: View) => void;
  setUser: (user: UserProfile) => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onViewChange, setUser }) => {
  const { t } = useTranslation();
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !formData.name || !formData.email || !formData.password) return;

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: formData.name });

      const newUser: UserProfile = {
        uid: firebaseUser.uid,
        displayName: formData.name,
        email: formData.email,
        role: role,
        createdAt: new Date().toISOString(),
        twitter: '@' + formData.name.toLowerCase().replace(/\s+/g, '_'),
        instagram: formData.name.toLowerCase().replace(/\s+/g, '_') + '_official',
        linkedin: 'https://linkedin.com/in/' + formData.name.toLowerCase().replace(/\s+/g, '-'),
        usageStats: {
          simulator: 0,
          swipe: 0,
          compare: 0,
          scan: 0,
          talent: 0
        }
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
        return;
      }
      
      try {
        await sendEmailVerification(firebaseUser);
        setIsVerificationSent(true);
      } catch (verifyErr) {
        console.error('Error sending verification email:', verifyErr);
        setUser(newUser);
        onViewChange('PROFILE');
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t(
          'This email is already registered. Please login.',
          'Cet e-mail est déjà enregistré. Veuillez vous connecter.'
        ));
      } else if (err.code === 'auth/weak-password') {
        setError(t(
          'Password must be at least 6 characters.',
          'Le mot de passe doit comporter au moins 6 caractères.'
        ));
      } else {
        setError(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!role) return;
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        return;
      }
      
      if (userDoc.exists()) {
        const existingUser = userDoc.data() as UserProfile;
        setUser(existingUser);
        onViewChange('PROFILE');
      } else {
        const newUser: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: role,
          createdAt: new Date().toISOString(),
          twitter: '@' + (firebaseUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
          instagram: (firebaseUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_') + '_official',
          linkedin: 'https://linkedin.com/in/' + (firebaseUser.displayName || 'user').toLowerCase().replace(/\s+/g, '-'),
          usageStats: {
            simulator: 0,
            swipe: 0,
            compare: 0,
            scan: 0,
            talent: 0
          }
        };

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
          return;
        }
        setUser(newUser);
        onViewChange('PROFILE');
      }
    } catch (err: any) {
      setError(err.message || 'Google signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: UserRole.CREATOR,
      title: t('Creator', 'Créateur'),
      description: t('Index your rights and finance your projects.', 'Indexez vos droits et financez vos projets.'),
      icon: User,
      color: 'primary-cyan'
    },
    {
      id: UserRole.INVESTOR,
      title: t('Investor', 'Investisseur'),
      description: t('Support creation and participate in asset valuation.', 'Soutenez la création et participez à la valorisation.'),
      icon: TrendingUp,
      color: 'accent-gold'
    },
    {
      id: UserRole.PROFESSIONAL,
      title: t('Professional', 'Professionnel'),
      description: t('Evaluate projects and manage institutional assets.', 'Évaluez les projets et gérez les actifs.'),
      icon: Briefcase,
      color: 'accent-purple'
    }
  ];

  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-surface-dim text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-low/40 backdrop-blur-3xl border border-white/10 p-12 text-center space-y-8 rounded-[2.5rem]"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 rounded-3xl">
              <ShieldCheck size={40} />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic">{t('Verify Email', 'Vérifiez E-mail')}</h2>
            <p className="text-on-surface-variant text-xs leading-relaxed opacity-70 uppercase tracking-widest font-bold">
              {t('A verification link has been sent. Please check your inbox to complete registration.', 'Un lien de vérification a été envoyé. Veuillez vérifier votre boîte de réception.')}
            </p>
          </div>
          <button 
            onClick={() => onViewChange('LOGIN')}
            className="w-full py-4 bg-primary-cyan text-surface-dim font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(0,224,255,0.2)] hover:bg-white transition-all rounded-2xl"
          >
            {t('Proceed to Login', 'Procéder à la Connexion')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-mono">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0A0C10] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col"
      >
        <div className="p-6 md:p-8 relative">
          <button 
            onClick={() => onViewChange('HOME')}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all z-20 group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6 cursor-pointer group" onClick={() => onViewChange('HOME')}>
              <div className="absolute inset-0 bg-primary-cyan/25 blur-[60px] rounded-full animate-pulse group-hover:bg-primary-cyan/45 transition-colors" />
              <Logo size={80} color="multi" showBeta className="transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.4em] mt-6 drop-shadow-glow-gold">{t('CREATE PROTOCOL ACCOUNT', 'CRÉER UN COMPTE PROTOCOLE')}</div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1-info"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-black font-headline uppercase tracking-tighter italic text-white leading-none">{t('SELECT PROFILE', 'CHOISIR PROFIL')}</h2>
                </div>

                <div className="space-y-2">
                  {roles.map((r) => (
                    <div 
                      key={r.id} 
                      onClick={() => setRole(r.id)}
                      className={`flex gap-3 group cursor-pointer p-3 rounded-2xl transition-all border ${role === r.id ? 'bg-primary-cyan/10 border-primary-cyan scale-[1.01]' : 'bg-white/[0.03] border-white/10 hover:bg-white/5 hover:border-white/20'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${role === r.id ? 'bg-primary-cyan border-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.4)]' : 'bg-white/5 border-white/10 group-hover:border-primary-cyan/50'}`}>
                        <r.icon size={18} className={role === r.id ? 'text-surface-dim' : 'text-on-surface-variant group-hover:text-primary-cyan'} />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${role === r.id ? 'text-primary-cyan' : 'text-white'}`}>{r.title}</h3>
                        <p className="text-[8px] text-on-surface-variant/70 leading-relaxed uppercase font-bold tracking-tight line-clamp-1">{r.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => { if(role) setStep(2); }}
                      disabled={!role}
                      className="w-full py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase italic tracking-[0.2em] group hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed rounded-full shadow-[0_0_30px_rgba(0,224,255,0.2)]"
                    >
                      {t('CONTINUE', 'CONTINUER')}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                      onClick={() => onViewChange('LOGIN')}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors"
                    >
                      {t('ALREADY REGISTERED? LOG IN', 'DÉJÀ INSCRIT ? SE CONNECTER')}
                    </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors mb-4 mx-auto"
                >
                  <ChevronLeft size={14} /> {t('BACK TO PROFILES', 'RETOUR AUX PROFILS')}
                </button>

                <div className="mb-4 text-center">
                  <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic mb-2 text-white leading-none">{t('FINALIZE', 'FINALISER')}</h2>
                  <div className="px-3 py-1 bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/30 rounded-full text-[8px] font-black uppercase tracking-[0.2em] inline-block">
                    {role}
                  </div>
                </div>

                <form className="space-y-3" onSubmit={handleSignup}>
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('FULL NAME', 'NOM COMPLET')}
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('EMAIL ADDRESS', 'ADRESSE E-MAIL')}
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('PASSWORD', 'MOT DE PASSE')}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase italic tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_0_40px_rgba(0,224,255,0.2)] rounded-full flex items-center justify-center gap-3 group mt-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        {t('CREATE ACCOUNT', 'CRÉER LE COMPTE')} 
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5" />
                    </div>
                    <span className="relative z-10 bg-[#0A0C10] px-4 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.3em] italic opacity-50">{t('OR REGISTER WITH', 'OU S\'INSCRIRE AVEC')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={handleGoogleSignup}
                      className="flex items-center justify-center gap-3 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest group"
                    >
                      <Globe size={14} className="text-primary-cyan group-hover:scale-110 transition-transform" /> GOOGLE
                    </button>
                    <button 
                      type="button"
                      className="flex items-center justify-center gap-3 py-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest group"
                    >
                      <Send size={14} className="text-indigo-500 group-hover:scale-110 transition-transform" /> FACEBOOK
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-8 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-400" />
            MICA COMPLIANT
          </div>
          <div className="flex items-center gap-2">
            <Globe size={10} className="text-primary-cyan" />
            SECURED TERMINAL
          </div>
          <div>V4.2 ALPHA</div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupView;
