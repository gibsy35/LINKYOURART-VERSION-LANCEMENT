
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Mail, Lock, ShieldCheck, Globe, Palette, TrendingUp, Briefcase } from 'lucide-react';
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

const ROLE_OPTIONS = [
  {
    role: UserRole.CREATOR,
    icon: Palette,
    label: 'CREATOR',
    labelFr: 'CRÉATEUR',
    desc: 'Artists, musicians, filmmakers, designers',
    descFr: 'Artistes, musiciens, cinéastes, designers',
    color: 'border-primary-cyan',
    bg: 'bg-primary-cyan/10',
  },
  {
    role: UserRole.PATRON,
    icon: TrendingUp,
    label: 'PATRON',
    labelFr: 'MÉCÈNE',
    desc: 'Collectors, patrons, creative partners',
    descFr: 'Collectionneurs, mécènes, partenaires créatifs',
    color: 'border-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    role: UserRole.PROFESSIONAL,
    icon: Briefcase,
    label: 'PROFESSIONAL',
    labelFr: 'PROFESSIONNEL',
    desc: 'Agents, galleries, labels, publishers',
    descFr: 'Agents, galeries, labels, éditeurs',
    color: 'border-purple-400',
    bg: 'bg-purple-400/10',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNotify, setUser }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CREATOR);

  const buildProfile = (uid: string, email: string, displayName: string, role: UserRole, isAdmin: boolean): UserProfile => ({
    uid,
    email,
    displayName,
    role: isAdmin ? UserRole.ADMIN : role,
    isPro: isAdmin || role === UserRole.PROFESSIONAL || role === UserRole.PATRON,
    createdAt: new Date().toISOString(),
    watchlist: [],
    comparisonList: [],
    usageStats: { simulator: 0, swipe: 0, compare: 0, scan: 0, talent: 0 }
  });

  const isAdminEmail = (email: string) => {
    const e = email.toLowerCase();
    return e === 'linkyourart@gmail.com' || e === 'lequimejeanbaptiste@gmail.com' || e === 'linkart@gmail.com';
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (err) {
        console.warn('Firestore fetch failed during Google Auth:', err);
      }

      if (userDoc && userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
      } else {
        const isAdmin = isAdminEmail(firebaseUser.email || '');
        const newProfile = buildProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || firebaseUser.email?.split('@')[0].toUpperCase() || 'USER',
          selectedRole,
          isAdmin
        );
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        } catch (saveErr) {
          console.warn('Could not save profile to Firestore:', saveErr);
        }
        setUser(newProfile);
      }

      onNotify(t('ACCESS GRANTED', 'ACCÈS AUTORISÉ'));
      onClose();
    } catch (err) {
      console.error('Auth Error:', err);
      onNotify(t('AUTHENTICATION FAILED', "ÉCHEC DE L'AUTHENTIFICATION"));
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
        const firebaseUser = result.user;
        const isAdmin = isAdminEmail(email);
        const newProfile = buildProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          email.split('@')[0].toUpperCase(),
          selectedRole,
          isAdmin
        );
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        } catch (saveErr) {
          console.warn('Profile creation failed:', saveErr);
        }
        setUser(newProfile);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        // Load profile from Firestore and set user immediately
        try {
          const { getDoc: gd, doc: d } = await import('firebase/firestore');
          const userDoc = await gd(d(db, 'users', result.user.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Fallback profile if Firestore is slow
            const isAdmin = isAdminEmail(email);
            setUser(buildProfile(result.user.uid, email, email.split('@')[0].toUpperCase(), selectedRole, isAdmin));
          }
        } catch {
          // Firestore might be blocked — still allow login with minimal profile
          const isAdmin = isAdminEmail(email);
          setUser(buildProfile(result.user.uid, email, email.split('@')[0].toUpperCase(), UserRole.CREATOR, isAdmin));
        }
      }
      onNotify(t('TERMINAL ACCESS INITIALIZED', 'ACCÈS TERMINAL INITIALISÉ'));
      onClose();
    } catch (err: any) {
      console.error('Auth Error:', err);
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? t('Invalid credentials', 'Identifiants invalides')
        : err.code === 'auth/user-not-found'
        ? t('No account found with this email.', 'Aucun compte trouvé pour cet email.')
        : err.code === 'auth/too-many-requests'
        ? t('Too many attempts. Please wait.', 'Trop de tentatives. Veuillez patienter.')
        : err.code === 'auth/network-request-failed'
        ? t('Network error. Check your connection.', 'Erreur réseau. Vérifiez votre connexion.')
        : (err.message || 'Error');
      onNotify(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="sync">
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface-dim/95 backdrop-blur-xl z-[400]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 flex items-center justify-center p-4 z-[401] pointer-events-none">
            <div className="bg-surface-dim border border-white/10 w-full max-w-lg pointer-events-auto p-8 relative overflow-hidden font-mono max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="text-on-surface-variant hover:text-white"><X size={20} /></button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 border border-primary-cyan flex items-center justify-center mx-auto mb-4 relative">
                  <div className="w-8 h-8 border-2 border-primary-cyan animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{t('LYA TERMINAL v2.5.0', 'TERMINAL LYA v2.5.0')}</h2>
                <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">{t('ACCÈS SÉCURISÉ', 'ACCÈS SÉCURISÉ')}</p>
              </div>

              <div className="flex border-b border-white/5 mb-6">
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

              {/* Role selection — SIGNUP only */}
              {mode === 'SIGNUP' && (
                <div className="mb-6">
                  <p className="text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-widest mb-3">
                    {t('SELECT YOUR PROFILE', 'SÉLECTIONNEZ VOTRE PROFIL')}
                  </p>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map(({ role, icon: Icon, label, labelFr, desc, descFr, color, bg }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`w-full flex items-center gap-3 p-3 border transition-all text-left ${
                          selectedRole === role
                            ? `${color} ${bg}`
                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <Icon size={20} className={selectedRole === role ? 'text-primary-cyan' : 'text-on-surface-variant/40'} />
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{t(label, labelFr)}</p>
                          <p className="text-[9px] text-on-surface-variant/50 mt-0.5">{t(desc, descFr)}</p>
                        </div>
                        {selectedRole === role && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary-cyan" />
                        )}
                      </button>
                    ))}
                  </div>
                  {(selectedRole === UserRole.PROFESSIONAL || selectedRole === UserRole.PATRON) && (
                    <p className="text-[9px] text-primary-cyan/70 font-bold mt-2 tracking-widest uppercase">
                      ✓ {t('PRO ACCESS INCLUDED', 'ACCÈS PRO INCLUS')}
                    </p>
                  )}
                </div>
              )}

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

              <div className="relative my-6">
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

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-on-surface-variant/30 font-bold uppercase tracking-[0.2em]">
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
