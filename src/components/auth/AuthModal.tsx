
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Mail, Lock, ShieldCheck, Globe } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { auth, db } from '../../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
  setUser: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNotify, setUser }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const emailLower = user.email?.toLowerCase() || '';
        const isAdmin = emailLower === 'linkyourart@gmail.com' || emailLower === 'lequimejeanbaptiste@gmail.com';
        
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0].toUpperCase() || 'USER',
          role: isAdmin ? UserRole.ADMIN : UserRole.CREATOR,
          isPro: isAdmin,
          createdAt: new Date().toISOString(),
          watchlist: [],
          comparisonList: [],
          usageStats: { simulator: 0, swipe: 0, compare: 0, scan: 0, talent: 0 }
        };
        await setDoc(userDocRef, newProfile);
        setUser(newProfile);
      }
      
      onNotify(t('ACCESS GRANTED', 'ACCÈS AUTORISÉ'));
      onClose();
    } catch (err) {
      console.error('Auth Error:', err);
      onNotify(t('AUTHENTICATION FAILED', 'ÉCHEC DE L\'AUTHENTIFICATION'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'SIGNUP') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: email.split('@')[0].toUpperCase(),
          role: UserRole.CREATOR,
          isPro: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setUser(newProfile);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onNotify(t('TERMINAL ACCESS INITIALIZED', 'ACCÈS TERMINAL INITIALISÉ'));
      onClose();
    } catch (err: any) {
      onNotify(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface-dim/95 backdrop-blur-xl z-[400]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 flex items-center justify-center p-4 z-[401] pointer-events-none">
            <div className="bg-surface-dim border border-white/10 w-full max-w-md pointer-events-auto p-8 relative overflow-hidden font-mono">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="text-on-surface-variant hover:text-white"><X size={20} /></button>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 border border-primary-cyan flex items-center justify-center mx-auto mb-6 relative">
                  <div className="w-8 h-8 border-2 border-primary-cyan animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{t('LYA TERMINAL v2.5.0', 'TERMINAL LYA v2.5.0')}</h2>
                <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">{t('SECURE PROTOCOL ACCESS', 'ACCÈS PROTOCOLE SÉCURISÉ')}</p>
              </div>

              <div className="flex border-b border-white/5 mb-8">
                <button 
                  onClick={() => setMode('LOGIN')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'text-primary-cyan border-b-2 border-primary-cyan' : 'text-on-surface-variant/40'}`}
                >
                  {t('LOGIN', 'CONNEXION')}
                </button>
                <button 
                  onClick={() => setMode('SIGNUP')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'text-primary-cyan border-b-2 border-primary-cyan' : 'text-on-surface-variant/40'}`}
                >
                  {t('INITIALIZE', 'INITIALISER')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('EMAIL_ADDRESS', 'ADRESSE_EMAIL')}
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-xs text-white focus:outline-none focus:border-primary-cyan focus:bg-white/10 transition-all uppercase"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('SECURITY_PHRASE', 'PHRASE_SÉCURITÉ')}
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-xs text-white focus:outline-none focus:border-primary-cyan focus:bg-white/10 transition-all"
                    required
                  />
                </div>

                <button 
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                  {isLoading ? t('PROCESSING...', 'TRAITEMENT...') : (mode === 'LOGIN' ? t('EXECUTE LOGIN', 'EXÉCUTER CONNEXION') : t('CREATE ACCOUNT', 'CRÉER COMPTE'))}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold">
                  <span className="bg-surface-dim px-4 text-on-surface-variant/40">{t('OR CONNECT WITH', 'OU CONNECTEZ-VOUS AVEC')}</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleAuth}
                className="w-full py-3 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-black text-white hover:bg-white/5 transition-all uppercase tracking-widest"
              >
                <Globe size={16} className="text-primary-cyan" />
                {t('GOVERNMENT_ID / GOOGLE', 'ID_GOUVERNEMENTAL / GOOGLE')}
              </button>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-on-surface-variant/30 font-bold uppercase tracking-[0.2em]">
                <ShieldCheck size={12} />
                {t('ENCRYPTION ACTIVE: AES-256', 'CHIFFREMENT ACTIF: AES-256')}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
