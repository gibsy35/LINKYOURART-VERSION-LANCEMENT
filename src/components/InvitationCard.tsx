/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// InvitationCard — bandeau d'invitation exclusive intégré au dashboard de
// chaque membre (Créateur / Mécène / Professionnel). Volontairement compact
// et de même densité que les autres éléments de la page (actions rapides,
// bannière d'alerte) — ce n'est pas la raison pour laquelle la personne est
// venue sur son dashboard, donc ça ne doit pas prendre le pas sur le reste.
//
// Chaque membre dispose d'UNE invitation. Le rôle final de l'invité·e n'est
// pas imposé ici : il est choisi librement à l'inscription (SignupView),
// exactement comme pour toute autre pré-inscription. Cette carte se contente
// de générer un accès (même format LYA-XXXX-XXXX que les codes de
// pré-inscription — voir LandingView.generateAccessKey) et de le transmettre.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Check, Loader2, MessageSquarePlus } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from '../context/LanguageContext';

interface InvitationCardProps {
  user: UserProfile;
  onSent?: (updatedUser: UserProfile) => void;
  onNotify?: (msg: string, type?: string) => void;
}

const ROLE_CONFIG: Record<string, {
  accent: string;
  accentBorderStrong: string;
  accentBg: string;
  solidBg: string;
  focusBorder: string;
  roleLabelEN: string;
  roleLabelFR: string;
  descEN: string;
  descFR: string;
}> = {
  CREATOR: {
    accent: 'text-[#a78bfa]',
    accentBorderStrong: 'border-[#a78bfa]/40',
    accentBg: 'bg-[#a78bfa]/10',
    solidBg: 'bg-[#a78bfa]',
    focusBorder: 'focus:border-[#a78bfa]/50',
    roleLabelEN: 'Creator',
    roleLabelFR: 'Créateur',
    descEN: 'Know a talent who deserves certification on LYA?',
    descFR: 'Vous connaissez un talent qui mériterait une certification sur LYA ?',
  },
  PATRON: {
    accent: 'text-emerald-400',
    accentBorderStrong: 'border-emerald-400/40',
    accentBg: 'bg-emerald-400/10',
    solidBg: 'bg-emerald-400',
    focusBorder: 'focus:border-emerald-400/50',
    roleLabelEN: 'Patron',
    roleLabelFR: 'Mécène',
    descEN: 'Know someone who could support tomorrow\u2019s creators?',
    descFR: 'Vous connaissez quelqu\u2019un qui pourrait soutenir les créateurs de demain ?',
  },
  PROFESSIONAL: {
    accent: 'text-primary-cyan',
    accentBorderStrong: 'border-primary-cyan/40',
    accentBg: 'bg-primary-cyan/10',
    solidBg: 'bg-primary-cyan',
    focusBorder: 'focus:border-primary-cyan/50',
    roleLabelEN: 'Professional',
    roleLabelFR: 'Professionnel',
    descEN: 'Invite a high-level peer to join the LYA network.',
    descFR: 'Invitez un pair de haut niveau à rejoindre le réseau LYA.',
  },
};

const generateAccessKey = () => {
  const s1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const s2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LYA-${s1}-${s2}`;
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const InvitationCard: React.FC<InvitationCardProps> = ({ user, onSent, onNotify }) => {
  const { t, language } = useTranslation();
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.CREATOR;

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [justSent, setJustSent] = useState<{ email: string } | null>(null);

  const alreadySent = Boolean((user as any).invitationSentAt) || Boolean(justSent);
  const sentTo = justSent?.email || (user as any).invitationSentTo;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmail(email) || isSending || alreadySent) return;

    setIsSending(true);
    const code = generateAccessKey();
    const cleanEmail = email.trim().toLowerCase();

    try {
      await addDoc(collection(db, 'access_keys'), {
        key: code,
        assignedTo: cleanEmail,
        tier: 'MEMBER_INVITE',
        position: null,
        createdAt: serverTimestamp(),
        status: 'ACTIVE',
        source: 'MEMBER_INVITE',
        invitedByUid: user.uid,
        invitedByName: user.displayName,
        invitedByRole: user.role,
      });

      addDoc(collection(db, 'invitations'), {
        fromUid: user.uid,
        fromName: user.displayName,
        fromRole: user.role,
        toEmail: cleanEmail,
        message: message.trim() || null,
        code,
        createdAt: serverTimestamp(),
      }).catch(() => {});

      fetch('/api/email/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          fromName: user.displayName,
          fromRole: user.role,
          code,
          message: message.trim() || undefined,
          lang: language,
        }),
      }).catch((err) => console.warn('[INVITATION EMAIL]', err));

      const sentAt = new Date().toISOString();
      await setDoc(doc(db, 'users', user.uid), {
        invitationSentAt: sentAt,
        invitationSentTo: cleanEmail,
      }, { merge: true });

      const updatedUser = { ...user, invitationSentAt: sentAt, invitationSentTo: cleanEmail } as UserProfile;
      setJustSent({ email: cleanEmail });
      onSent?.(updatedUser);
      onNotify?.(t('Invitation sent successfully!', 'Invitation envoyée avec succès !'), 'success');
      setEmail('');
      setMessage('');
      setShowMessage(false);
    } catch (err) {
      console.error('[INVITATION]', err);
      onNotify?.(t('Could not send the invitation. Please try again.', "Impossible d'envoyer l'invitation. Réessayez."), 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-low/40 border border-white/8 rounded-2xl p-4 md:p-5"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Badge + libellé — même gabarit que le reste des éléments de la page */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`relative w-10 h-10 rounded-full border-2 ${alreadySent ? 'border-white/10' : cfg.accentBorderStrong} flex items-center justify-center shrink-0`}>
            {!alreadySent && (
              <motion.div
                className={`absolute inset-0 rounded-full border-2 ${cfg.accentBorderStrong}`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <span className={`text-sm font-black ${alreadySent ? 'text-white/30' : 'text-white'}`}>
              {alreadySent ? '0' : '1'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
              {t('Invitation', 'Invitation')} <span className={cfg.accent}>{t(cfg.roleLabelEN, cfg.roleLabelFR)}</span>
              <span className={`px-1.5 py-0.5 rounded ${cfg.accentBg} ${cfg.accent} text-[9px] font-black uppercase tracking-wider`}>
                {t('Exclusive', 'Exclusive')}
              </span>
            </p>
            <p className="text-xs text-on-surface-variant/60 mt-0.5">
              {t(cfg.descEN, cfg.descFR)}
            </p>
          </div>
        </div>

        {/* Action — même ligne sur desktop, en dessous sur mobile */}
        {alreadySent ? (
          <div className={`flex items-center gap-2 px-3 py-2 ${cfg.accentBg} rounded-lg shrink-0 self-start md:self-auto`}>
            <Check size={13} className={cfg.accent} />
            <span className="text-xs text-white/80 whitespace-nowrap">
              {t('Sent to', 'Envoyée à')} <span className="font-black text-white">{sentTo}</span>
            </span>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2 shrink-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Their email', 'Email du/de la destinataire')}
              className={`bg-surface-dim border border-white/10 px-3 py-2.5 rounded-lg text-xs font-medium focus:outline-none transition-all text-white placeholder:text-white/25 w-full sm:w-52 ${cfg.focusBorder}`}
            />
            {!showMessage && (
              <button
                type="button"
                onClick={() => setShowMessage(true)}
                className="hidden md:flex items-center justify-center px-2.5 text-on-surface-variant/40 hover:text-white transition-colors shrink-0"
                title={t('Add a personal note', 'Ajouter un mot personnel')}
              >
                <MessageSquarePlus size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={isSending || !isValidEmail(email)}
              className={`px-4 py-2.5 ${cfg.solidBg} text-surface-dim font-black uppercase tracking-wider text-[11px] rounded-lg hover:bg-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0`}
            >
              {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
              {t('Send', 'Envoyer')}
            </button>
          </form>
        )}
      </div>

      <AnimatePresence>
        {showMessage && !alreadySent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('A personal note (optional)', 'Un mot personnel (facultatif)')}
              rows={2}
              maxLength={280}
              autoFocus
              className={`w-full mt-3 bg-surface-dim border border-white/10 px-3 py-2.5 rounded-lg text-xs font-medium focus:outline-none transition-all text-white placeholder:text-white/25 resize-none ${cfg.focusBorder}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
