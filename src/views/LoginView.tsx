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
            <div className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.4em] mt-6 drop-shadow-glow-gold">{t('INSTITUTIONAL TERMINAL', 'TERMINAL INSTITUTIONNEL')}</div>
          </div>

          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic mb-4 text-white leading-none">{t('WELCOME BACK', 'BON RETOUR')}</h2>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold text-white focus:border-primary-cyan focus:bg-white/[0.08] outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
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
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 pl-12 text-sm font-bold text-white focus:border-primary-cyan focus:bg-white/[0.08] outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                        placeholder={t('PASSWORD', 'MOT DE PASSE')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
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
                    className="w-full py-4 bg-primary-cyan text-surface-dim text-xs font-black uppercase italic tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_0_40px_rgba(0,224,255,0.2)] rounded-full flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        {t('INITIALIZE SESSION', 'INITIALISER LA SESSION')} 
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5" />
                    </div>
                    <span className="relative z-10 bg-[#0A0C10] px-4 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.3em] italic opacity-50">{t('OR CONTINUE WITH', 'OU CONTINUER AVEC')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
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

                <div className="mt-8 text-center">
                    <button 
                      onClick={() => onViewChange('SIGNUP')}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors flex items-center justify-center gap-3 mx-auto"
                    >
                      <span className="w-4 h-[1px] bg-white/10" />
                      {t('CREATE AN ACCOUNT', 'CRÉER UN COMPTE')}
                      <span className="w-4 h-[1px] bg-white/10" />
                    </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                 <div className="mb-10 text-center">
                  <h2 className="text-3xl font-black font-headline uppercase tracking-tighter italic mb-2">{t('RECOVER ACCESS', 'RÉCUPÉRATION')}</h2>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-60">
                    {t('INPUT YOUR EMAIL TO RESET', 'SAISISSEZ VOTRE EMAIL')}
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-cyan transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 pl-14 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                      placeholder={t('EMAIL ADDRESS', 'ADRESSE E-MAIL')}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-primary-cyan text-surface-dim text-sm font-black uppercase italic tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_0_30px_rgba(0,224,255,0.2)] rounded-full flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {t('SEND RESET LINK', 'ENVOYER LE LIEN')} 
                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
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
        
        {/* Footer info fixed to avoid scroll */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-8 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-400" />
            SECURED TERMINAL
          </div>
          <div className="flex items-center gap-2">
            <Globe size={10} className="text-primary-cyan" />
            MICA COMPLIANT
          </div>
          <div>V4.2 ALPHA</div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
