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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 w-auto max-w-sm mx-auto"
          >
            <div className="bg-gray-900 border border-white/10 rounded-xl p-6 relative font-mono w-full">
              
              {/* Close button */}
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 border border-cyan-400 flex items-center justify-center mx-auto mb-4 rounded-lg">
                  <div className="w-6 h-6 border-2 border-cyan-400 animate-pulse rounded" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-1">
                  {t('LYA TERMINAL v2.5.0', 'TERMINAL LYA v2.5.0')}
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {t('SECURE PROTOCOL ACCESS', 'ACCÈS PROTOCOLE SÉCURISÉ')}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setMode('LOGIN')}
                  className={`flex-1 py-2 text-sm font-bold uppercase tracking-wide transition-all ${mode === 'LOGIN' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500'}`}
                >
                  {t('LOGIN', 'CONNEXION')}
                </button>
                <button
                  onClick={() => setMode('SIGNUP')}
                  className={`flex-1 py-2 text-sm font-bold uppercase tracking-wide transition-all ${mode === 'SIGNUP' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500'}`}
                >
                  {t('INITIALIZE', 'INITIALISER')}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('EMAIL ADDRESS', 'ADRESSE EMAIL')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('PASSWORD', 'MOT DE PASSE')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-3 bg-cyan-400 text-gray-900 text-sm font-bold uppercase tracking-wide rounded-lg hover:bg-white transition-all"
                >
                  {isLoading ? t('PROCESSING...', 'TRAITEMENT...') : (mode === 'LOGIN' ? t('SIGN IN', 'SE CONNECTER') : t('CREATE ACCOUNT', 'CRÉER COMPTE'))}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-900 px-3 text-xs text-gray-500 uppercase">
                    {t('OR', 'OU')}
                  </span>
                </div>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleAuth}
                className="w-full py-3 border border-white/10 rounded-lg flex items-center justify-center gap-3 text-sm text-white hover:bg-white/5 transition-all"
              >
                <Globe size={16} className="text-cyan-400" />
                {t('CONTINUE WITH GOOGLE', 'CONTINUER AVEC GOOGLE')}
              </button>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
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
