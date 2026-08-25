/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// InvitationCard — carte d'invitation exclusive affichée sur le profil de
// chaque membre (Créateur / Mécène / Professionnel). Remplace l'ancien bloc
// "Elite Invitation" (Professionnel uniquement, accent-gold, non fonctionnel)
// par un composant partagé, réellement branché sur Firestore + email.
//
// Chaque membre dispose d'UNE invitation. Le rôle final de l'invité·e n'est
// pas imposé ici : il est choisi librement à l'inscription (SignupView),
// exactement comme pour toute autre pré-inscription. Cette carte se contente
// de générer un accès (même format LYA-XXXX-XXXX que les codes de
// pré-inscription — voir LandingView.generateAccessKey) et de le transmettre.

import React, { useState } from 'react';
import { UserPlus, Send, Check, Loader2 } from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from '../context/LanguageContext';

interface InvitationCardProps {
  user: UserProfile;
  onSent?: (updatedUser: UserProfile) => void;
  onNotify?: (msg: string, type?: string) => void;
}

const ROLE_CONFIG: Record<string, {
  accent: string;        // classe Tailwind texte
  accentBorder: string;  // classe Tailwind bordure (légère)
  accentBg: string;      // classe Tailwind fond léger
  solidBg: string;       // classe Tailwind fond plein (bouton)
  focusBorder: string;   // classe Tailwind bordure au focus (input)
  titleEN: string;
  titleFR: string;
  descEN: string;
  descFR: string;
}> = {
  [UserRole.CREATOR]: {
    accent: 'text-[#a78bfa]',
    accentBorder: 'border-[#a78bfa]/20',
    accentBg: 'bg-[#a78bfa]/5',
    solidBg: 'bg-[#a78bfa]',
    focusBorder: 'focus:border-[#a78bfa]/50',
    titleEN: 'Creator Invitation',
    titleFR: 'Invitation Créateur',
    descEN: 'You have 1 exclusive invitation. Know a talent who deserves certification on LYA? Bring them into the registry.',
    descFR: 'Vous détenez 1 invitation exclusive. Vous connaissez un talent qui mériterait une certification sur LYA ? Faites-le entrer dans le registre.',
  },
  [UserRole.PATRON]: {
    accent: 'text-emerald-400',
    accentBorder: 'border-emerald-400/20',
    accentBg: 'bg-emerald-400/5',
    solidBg: 'bg-emerald-400',
    focusBorder: 'focus:border-emerald-400/50',
    titleEN: 'Patron Invitation',
    titleFR: 'Invitation Mécène',
    descEN: 'You have 1 exclusive invitation. Know someone who could support tomorrow\u2019s creators? Bring them into the LYA circle of patrons.',
    descFR: 'Vous détenez 1 invitation exclusive. Vous connaissez quelqu\u2019un qui pourrait soutenir les créateurs de demain ? Faites-le entrer dans le cercle des mécènes LYA.',
  },
  [UserRole.PROFESSIONAL]: {
    accent: 'text-primary-cyan',
    accentBorder: 'border-primary-cyan/20',
    accentBg: 'bg-primary-cyan/5',
    solidBg: 'bg-primary-cyan',
    focusBorder: 'focus:border-primary-cyan/50',
    titleEN: 'Professional Invitation',
    titleFR: 'Invitation Professionnelle',
    descEN: 'As a Professional member, you hold 1 exclusive invitation. Invite a high-level peer to join the LYA network.',
    descFR: 'En tant que membre Professionnel, vous détenez 1 invitation exclusive. Invitez un pair de haut niveau à rejoindre le réseau LYA.',
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
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG[UserRole.CREATOR];

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const alreadySent = Boolean((user as any).invitationSentAt);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmail(email) || isSending || alreadySent) return;

    setIsSending(true);
    const code = generateAccessKey();
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Code d'accès — même collection que les codes de pré-inscription,
      //    afin de rester compatible avec la validation déjà en place au
      //    signup (SignupView marque tout code LYA-XXXX-XXXX comme utilisé).
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

      // 2. Trace de l'invitation, pour suivi côté Admin Hub.
      addDoc(collection(db, 'invitations'), {
        fromUid: user.uid,
        fromName: user.displayName,
        fromRole: user.role,
        toEmail: cleanEmail,
        message: message.trim() || null,
        code,
        createdAt: serverTimestamp(),
      }).catch(() => {});

      // 3. Email d'invitation (best-effort — ne bloque jamais l'UX).
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

      // 4. Marquer l'invitation comme consommée sur le profil.
      const sentAt = new Date().toISOString();
      await setDoc(doc(db, 'users', user.uid), {
        invitationSentAt: sentAt,
        invitationSentTo: cleanEmail,
      }, { merge: true });

      const updatedUser = { ...user, invitationSentAt: sentAt, invitationSentTo: cleanEmail } as UserProfile;
      onSent?.(updatedUser);
      onNotify?.(t('Invitation sent successfully!', 'Invitation envoyée avec succès !'), 'success');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('[INVITATION]', err);
      onNotify?.(t('Could not send the invitation. Please try again.', "Impossible d'envoyer l'invitation. Réessayez."), 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={`bg-surface-low/30 border ${cfg.accentBorder} p-5 md:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden group rounded-2xl shadow-2xl`}>
      <div className="absolute top-0 right-0 p-6 md:p-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
        <UserPlus size={100} className={cfg.accent} />
      </div>

      <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 relative z-10">
        <UserPlus className={cfg.accent} size={24} /> {t(cfg.titleEN, cfg.titleFR)}
      </h3>

      <div className="space-y-6 md:space-y-8 relative z-10">
        <p className="text-[10px] md:text-sm text-on-surface-variant italic leading-relaxed opacity-70">
          {t(cfg.descEN, cfg.descFR)}
        </p>

        <div className={`p-5 md:p-8 ${cfg.accentBg} border ${cfg.accentBorder} relative overflow-hidden`}>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${cfg.accent}`}>
              {t('Available Invitations', 'Invitations Disponibles')}
            </span>
            <span className="text-lg md:text-2xl font-black italic text-white">{alreadySent ? '0 / 1' : '1 / 1'}</span>
          </div>

          {alreadySent ? (
            <div className="flex items-center gap-3 py-2">
              <Check size={18} className={cfg.accent} />
              <p className="text-[11px] md:text-xs font-bold text-white/70 uppercase tracking-widest">
                {t('Sent to', 'Envoyée à')} {(user as any).invitationSentTo}
              </p>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Enter their email...', "Entrer son email...")}
                className={`w-full bg-surface-dim border border-white/10 px-4 md:px-6 py-3 md:py-4 text-xs font-bold uppercase tracking-widest focus:outline-none transition-all text-white placeholder:text-white/20 ${cfg.focusBorder}`}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Personal message (optional)', 'Message personnel (facultatif)')}
                rows={2}
                maxLength={280}
                className={`w-full bg-surface-dim border border-white/10 px-4 md:px-6 py-3 md:py-4 text-xs font-medium normal-case focus:outline-none transition-all text-white placeholder:text-white/20 resize-none ${cfg.focusBorder}`}
              />
              <button
                type="submit"
                disabled={isSending || !isValidEmail(email)}
                className={`w-full py-3.5 md:py-5 ${cfg.solidBg} text-surface-dim font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-xs md:text-[11px] hover:bg-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                {isSending ? t('Sending...', 'Envoi...') : t('Send Invitation', "Envoyer l'Invitation")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
