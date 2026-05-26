import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, UserProfile } from '../types';
import { View } from '../components/ui/Sidebar';
import { ArrowRight, User, Briefcase, TrendingUp, Loader2, ShieldCheck, Mail, Lock, Globe, ChevronLeft, X, Send, Heart } from 'lucide-react';
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
    password: '',
    accessCode: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !formData.name || !formData.email || !formData.password) return;

    if (formData.password.length < 6) {
      setError(t(
        'Password must be at least 6 characters.',
        'Le mot de passe doit comporter au moins 6 caractères.'
      ));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: formData.name });

      const codeInput = formData.accessCode.trim().toUpperCase();
      const isValidCode = ['LYA2026', 'VC2026', 'LYA-DEMO-2026', 'DEMO', 'LYADOCK', 'LYAPARTNER', 'LYA_DEMO_2026', 'VC_DEMO'].includes(codeInput);

      const newUser: UserProfile = {
        uid: firebaseUser.uid,
        displayName: formData.name,
        email: formData.email,
        role: role,
        status: isValidCode ? 'APPROVED' : 'PENDING_APPROVAL',
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
        console.error('Error creating Firestore profile during signup:', err);
        // If quota is reached, we still want the user to proceed with their local profile
        const isQuota = String(err).includes('Quota') || String(err).includes('quota') || String(err).includes('429');
        if (isQuota) {
          console.warn('Quota reached during profile creation. Proceeding with temporary local session.');
          setUser(newUser);
          onViewChange('HOME');
          return;
        } else {
          handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
          return;
        }
      }
      
      try {
        await sendEmailVerification(firebaseUser);
        setIsVerificationSent(true);
      } catch (verifyErr) {
        console.error('Error sending verification email:', verifyErr);
        setUser(newUser);
        onViewChange('HOME');
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      const errMsg = err.message || '';
      if (err.code === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use') || errMsg.includes('auth/email-already-in-use')) {
        setError(t(
          'This email is already registered. Please login.',
          'Cet e-mail est déjà enregistré. Veuillez vous connecter.'
        ));
      } else if (err.code === 'auth/weak-password' || errMsg.includes('weak-password') || errMsg.includes('Password should be at least') || errMsg.includes('auth/weak-password')) {
        setError(t(
          'Password must be at least 6 characters.',
          'Le mot de passe doit comporter au moins 6 caractères.'
        ));
      } else if (err.code === 'auth/invalid-email' || errMsg.includes('invalid-email') || errMsg.includes('auth/invalid-email')) {
        setError(t(
          'Invalid email format.',
          'Format d\'e-mail invalide.'
        ));
      } else {
        setError(err.message || t('Registration failed. Please try again.', 'L\'inscription a échoué. Veuillez réessayer.'));
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
        console.warn('Profile fetch failed during Google signup (Quota?):', err);
        // userDoc remains undefined, we'll proceed with creating a fallback profile
      }
      
      if (userDoc && userDoc.exists()) {
        const existingUser = userDoc.data() as UserProfile;
        setUser(existingUser);
        onViewChange('HOME');
      } else {
        const newUser: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: role,
          status: 'PENDING_APPROVAL',
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
          console.warn('Could not save profile during Google signup (Quota?), using local fallback:', err);
        }
        setUser(newUser);
        onViewChange('HOME');
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
      title: t('Creator, Independent Producer & Talent', 'Créateur, Label & Talent Indépendant'),
      description: t('Showcase your catalog of creative works, protect your rights and co-develop digital projects.', 'Exposez votre catalogue d\'œuvres, valorisez vos droits et co-développez vos projets créatifs.'),
      icon: User,
      color: 'primary-cyan'
    },
    {
      id: UserRole.INVESTOR,
      title: t('Art Patrons, VCs & Cultural Backers', 'Mécène, Fonds d\'Accompagnement & VC'),
      description: t('Discover emerging projects, participate in co-productions, and support global modern creation.', 'Découvrez les projets émergents, participez à la coproduction et soutenez la création moderne.'),
      icon: TrendingUp,
      color: 'accent-gold'
    },
    {
      id: UserRole.PROFESSIONAL,
      title: t('Arts Curator, Agent & Cultural Advisor', 'Curateur, Agent Artistique & Conseiller'),
      description: t('Evaluate artistic catalogs, advise creators, and structure distribution agreements.', 'Évaluez les catalogues artistiques, conseillez les créateurs et structurez les accords de diffusion.'),
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
            onClick={() => {
              sessionStorage.setItem('lya_intro_completed', 'true');
              onViewChange('LANDING');
            }}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all z-20 group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6 cursor-pointer group" onClick={() => {
              sessionStorage.setItem('lya_intro_completed', 'true');
              onViewChange('LANDING');
            }}>
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
                    {!role && (
                      <p className="text-[9px] text-accent-gold font-bold uppercase tracking-widest text-center mb-4 animate-pulse">
                        {t('PLEASE SELECT A ROLE TO CONTINUE', 'VEUILLEZ SÉLECTIONNER UN RÔLE POUR CONTINUER')}
                      </p>
                    )}
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
                    <div className="relative group bg-[#1a0c14]/40 border border-[#FF007F]/40 hover:border-[#FF007F] rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(255,0,127,0.15)] focus-within:shadow-[0_0_25px_rgba(255,0,127,0.3)]">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF007F] group-focus-within:scale-110 transition-transform" size={18} />
                      <input 
                        value={formData.accessCode}
                        onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                        className="w-full bg-transparent rounded-xl p-4 pl-12 text-sm font-black text-white focus:outline-none transition-all placeholder:text-white/30 uppercase tracking-[0.15em] text-center"
                        placeholder={t('DEMO ACCESS CODE (e.g. LYA2026)', 'CODE D\'ACCÈS PRIVILÉGIÉ (e.g. LYA2026)')}
                      />
                    </div>
                  </div>

                  <p className="text-[8px] text-white/30 uppercase tracking-widest font-black leading-normal text-center bg-white/[0.01] p-3 border border-white/5 rounded-2xl">
                    {t(
                      'No partner code? Leave it blank. Direct bypass and request access are available in the dashboard.',
                      'Pas de code ? Laissez vide. Le bypass d\'évaluation et la demande d\'accès se trouvent dans le dashboard.'
                    )}
                  </p>

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
