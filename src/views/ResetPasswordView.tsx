import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { View } from '../components/ui/Sidebar';
import { useTranslation } from '../context/LanguageContext';
import { auth } from '../firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Logo } from '../components/ui/Logo';

interface ResetPasswordViewProps {
  onViewChange: (view: View) => void;
}

// Handles the link sent by sendPasswordResetEmail. Firebase appends
// ?mode=resetPassword&oobCode=... to the action URL — this view reads that
// code, verifies it, and lets the user actually set a new password. Without
// this view, the link had nowhere to go and fell through to the app's
// default landing page, making "forgot password" a dead end.
const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onViewChange }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid' | 'success'>('verifying');
  const [email, setEmail] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    if (!code) {
      setStatus('invalid');
      return;
    }
    setOobCode(code);
    verifyPasswordResetCode(auth, code)
      .then((verifiedEmail) => {
        setEmail(verifiedEmail);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    if (password.length < 6) {
      setError(t('Password must be at least 6 characters.', 'Le mot de passe doit contenir au moins 6 caractères.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Passwords do not match.', 'Les mots de passe ne correspondent pas.'));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || t('Failed to reset password. The link may have expired.', 'Échec de la réinitialisation. Le lien a peut-être expiré.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={48} color="multi" showBeta={false} /></div>

        <div className="bg-surface-low/40 border border-white/8 rounded-3xl p-8">
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-cyan mx-auto mb-4" />
              <p className="text-sm text-on-surface-variant/60 uppercase tracking-widest font-bold">
                {t('Verifying link...', 'Vérification du lien...')}
              </p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center py-4">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">{t('Invalid or Expired Link', 'Lien Invalide ou Expiré')}</h2>
              <p className="text-sm text-on-surface-variant/60 mb-6">
                {t('This password reset link is no longer valid. Please request a new one.', 'Ce lien de réinitialisation n\'est plus valide. Merci d\'en demander un nouveau.')}
              </p>
              <button onClick={() => onViewChange('LOGIN')} className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
                {t('Back to Login', 'Retour à la Connexion')}
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">{t('Create New Password', 'Nouveau Mot de Passe')}</h2>
                {email && <p className="text-xs text-on-surface-variant/50">{email}</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl text-center">
                    {error}
                  </div>
                )}
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('NEW PASSWORD', 'NOUVEAU MOT DE PASSE')}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-14 pr-14 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('CONFIRM PASSWORD', 'CONFIRMER LE MOT DE PASSE')}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-14 text-sm font-bold text-white focus:border-primary-cyan outline-none transition-all placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-full hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('Reset Password', 'Réinitialiser')} <ArrowRight size={18} /></>}
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">{t('Password Reset', 'Mot de Passe Réinitialisé')}</h2>
              <p className="text-sm text-on-surface-variant/60 mb-6">
                {t('Your password has been successfully updated. You can now sign in.', 'Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.')}
              </p>
              <button onClick={() => onViewChange('LOGIN')} className="w-full py-4 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
                {t('Sign In', 'Se Connecter')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordView;
