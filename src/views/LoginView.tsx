import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, LogIn, Loader2, Mail, Lock, ShieldCheck, Globe, Send, TrendingUp, X } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { View } from '../components/ui/Sidebar';
import { useTranslation } from '../context/LanguageContext';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase';
import { Logo } from '../components/ui/Logo';
import { OracleWidget } from '../components/ui/OracleWidget';

interface LoginViewProps {
  onViewChange: (view: View) => void;
  setUser: (user: UserProfile) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onViewChange, setUser }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onViewChange('PROFILE');
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(t(
          'Invalid credentials. Please verify your email and password.',
          'Identifiants invalides. Veuillez vérifier votre e-mail et votre mot de passe.'
        ));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t(
          'Account temporarily locked due to too many attempts.',
          'Compte temporairement verrouillé suite à trop de tentatives.'
        ));
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError(t('Please enter your email address.', 'Veuillez entrer votre adresse e-mail.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMessage(t(
        'Password reset email sent. Please check your inbox.',
        'E-mail de réinitialisation envoyé. Veuillez vérifier votre boîte de réception.'
      ));
      setIsForgotPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        return;
      }
      
      if (userDoc.exists()) {
        onViewChange('PROFILE');
      } else {
        setError(t(
          'Account not found. Please sign up first.',
          'Compte non trouvé. Veuillez d\'abord vous inscrire.'
        ));
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-mono">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-[#0A0C10] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Institutional Context */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0F1116] to-[#0A0C10] p-8 md:p-12 flex flex-col border-r border-white/5 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/10 blur-[60px] rounded-full" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-20 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-cyan/20 blur-xl rounded-full animate-pulse" />
                <Logo size={48} color="multi" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary-cyan transition-colors">LINKYOURART</h1>
              <div className="px-2 py-0.5 bg-accent-gold text-black text-[8px] font-black rounded ml-1 animate-pulse">BETA</div>
            </div>

            <div className="flex-1 space-y-12">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em] mb-8">{t('INSTITUTIONAL ACCESS', 'ACCÈS INSTITUTIONNEL')}</h2>
                
                {[
                  { id: 'creator', label: t('CREATOR PROFILE', 'PROFIL CRÉATEUR'), desc: t('Index your rights, finance your projects and manage your creative IP.', 'Indexez vos droits, financez vos projets et gérez votre PI créative.'), icon: Mail },
                  { id: 'investor', label: t('INVESTOR PROFILE', 'PROFIL INVESTISSEUR'), desc: t('Access high-yield creative assets and support the artistic ecosystem.', 'Accédez à des actifs créatifs à haut rendement et soutenez l\'écosystème artistique.'), icon: TrendingUp },
                  { id: 'pro', label: t('PRO PROFILE', 'PROFIL PRO'), desc: t('Institutional tools for asset valuation, audit and registry management.', 'Outils institutionnels pour la valorisation des actifs, l\'audit et la gestion des registres.'), icon: ShieldCheck }
                ].map((profile) => (
                  <div key={profile.id} className="flex gap-5 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary-cyan group-hover:bg-primary-cyan/10 transition-all">
                      <profile.icon size={20} className="text-on-surface-variant group-hover:text-primary-cyan" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-white uppercase group-hover:text-primary-cyan transition-colors">{profile.label}</h3>
                      <p className="text-[9px] text-on-surface-variant/60 leading-relaxed uppercase font-bold tracking-tight">{profile.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-12 flex items-center justify-between border-t border-white/5 opacity-40">
              <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} className="text-emerald-400" />
                SECURED TERMINAL
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded">V4.2 ALPHA</div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center relative">
          <button 
            onClick={() => onViewChange('HOME')}
            className="absolute top-8 right-8 text-on-surface-variant hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto w-full"
              >
                <div className="mb-12">
                  <h2 className="text-5xl font-black font-headline uppercase tracking-tighter italic mb-4 tracking-[-0.05em] text-white underline decoration-primary-cyan decoration-8 underline-offset-[12px]">{t('WELCOME BACK', 'BON RETOUR')}</h2>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-[0.4em] font-black opacity-60 mt-8">
                    {t('ACCESS YOUR INSTITUTIONAL TERMINAL', 'ACCÉDEZ À VOTRE TERMINAL INSTITUTIONNEL')}
                  </p>
                </div>

                <form className="space-y-8" onSubmit={handleLogin}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-5">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={22} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-full p-6 pl-16 text-sm font-bold text-white focus:border-primary-cyan focus:bg-white/[0.08] outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('INSTITUTIONAL EMAIL', 'EMAIL INSTITUTIONNEL')}
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={22} />
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-full p-6 pl-16 text-sm font-bold text-white focus:border-primary-cyan focus:bg-white/[0.08] outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('PASSWORD', 'MOT DE PASSE')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pr-4">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors"
                    >
                      {t('PASSWORD FORGOTTEN?', 'MOT DE PASSE OUBLIÉ ?')}
                    </button>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-7 bg-primary-cyan text-surface-dim text-base font-black uppercase italic tracking-[0.25em] hover:bg-white transition-all active:scale-95 shadow-[0_0_50px_rgba(0,224,255,0.25)] rounded-full flex items-center justify-center gap-4 group"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        {t('INITIALIZE SESSION', 'INITIALISER LA SESSION')} 
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="relative py-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5" />
                    </div>
                    <span className="relative z-10 bg-[#0A0C10] px-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.5em] italic">{t('SOCIAL CONNEXION', 'SOCIAL CONNEXION')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center gap-4 py-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest group"
                    >
                      <Globe size={18} className="text-primary-cyan group-hover:scale-110 transition-transform" /> GOOGLE
                    </button>
                    <button 
                      type="button"
                      className="flex items-center justify-center gap-4 py-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest group"
                    >
                      <Send size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" /> FACEBOOK
                    </button>
                  </div>
                </form>

                <div className="mt-16 text-center">
                    <button 
                      onClick={() => onViewChange('SIGNUP')}
                      className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors flex items-center justify-center gap-3 mx-auto group"
                    >
                      <span className="w-8 h-[1px] bg-white/10 group-hover:bg-primary-cyan transition-colors" />
                      {t('NEW ON THE PROTOCOL? CREATE AN ACCOUNT', 'NOUVEAU SUR LE PROTOCOLE ? CRÉER UN COMPTE')}
                      <span className="w-8 h-[1px] bg-white/10 group-hover:bg-primary-cyan transition-colors" />
                    </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto w-full"
              >
                 <div className="mb-12">
                  <h2 className="text-4xl font-black font-headline uppercase tracking-tighter italic mb-2 tracking-[-0.05em]">{t('RECOVER ACCESS', 'RÉCUPÉRATION')}</h2>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-bold opacity-60">
                    {t('INPUT YOUR EMAIL TO RESET SECURITY CREDENTIALS', 'SAISISSEZ VOTRE EMAIL POUR RÉINITIALISER')}
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 pl-14 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                      placeholder={t('EMAIL ADDRESS', 'ADRESSE E-MAIL')}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 bg-primary-cyan text-surface-dim text-sm font-black uppercase italic tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_0_40px_rgba(0,224,255,0.2)] rounded-3xl flex items-center justify-center gap-4 group"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {t('SEND RESET LINK', 'ENVOYER LE LIEN')} 
                        <Send size={20} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors text-center"
                  >
                    {t('RETURN TO LOGIN', 'RETOUR À LA CONNEXION')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <OracleWidget onAction={() => onViewChange('LOUNGE')} />
    </div>
  );
};

export default LoginView;
