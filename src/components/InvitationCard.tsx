/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// InvitationCard — carte d'invitation exclusive affichée sur le dashboard de
// chaque membre (Créateur / Mécène / Professionnel). Traite l'invitation
// comme un moment fort — pas un formulaire administratif — dans le même
// langage visuel premium que le reste de l'app (halos dégradés, grands
// titres accentués, entrée animée), et branchée réellement sur Firestore +
// email (pas un mock comme l'ancien bloc "Elite Invitation" qu'elle remplace).
//
// Chaque membre dispose d'UNE invitation. Le rôle final de l'invité·e n'est
// pas imposé ici : il est choisi librement à l'inscription (SignupView),
// exactement comme pour toute autre pré-inscription. Cette carte se contente
// de générer un accès (même format LYA-XXXX-XXXX que les codes de
// pré-inscription — voir LandingView.generateAccessKey) et de le transmettre.

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Check, Loader2 } from 'lucide-react';
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
  accent: string;         // classe Tailwind texte
  accentBorder: string;   // bordure légère
  accentBorderStrong: string; // bordure appuyée (halo)
  accentBg: string;       // fond très léger
  solidBg: string;        // fond plein (bouton)
  glow: string;            // ombre portée colorée
  gradientFrom: string;   // halo dégradé — départ
  gradientVia: string;    // halo dégradé — milieu
  focusBorder: string;    // bordure au focus (input)
  eyebrow: string;
  roleLabelEN: string;
  roleLabelFR: string;
  descEN: string;
  descFR: string;
}> = {
  CREATOR: {
    accent: 'text-[#a78bfa]',
    accentBorder: 'border-[#a78bfa]/15',
    accentBorderStrong: 'border-[#a78bfa]/40',
    accentBg: 'bg-[#a78bfa]/8',
    solidBg: 'bg-[#a78bfa]',
    glow: 'shadow-[0_20px_60px_-15px_rgba(167,139,250,0.35)]',
    gradientFrom: 'from-[#a78bfa]/25',
    gradientVia: 'via-accent-purple/10',
    focusBorder: 'focus:border-[#a78bfa]/60',
    eyebrow: 'Registre LYA',
    roleLabelEN: 'Creator',
    roleLabelFR: 'Créateur',
    descEN: 'You hold 1 exclusive invitation. Know a talent who deserves certification on LYA? Bring them into the registry.',
    descFR: 'Vous détenez 1 invitation exclusive. Vous connaissez un talent qui mériterait une certification sur LYA ? Faites-le entrer dans le registre.',
  },
  PATRON: {
    accent: 'text-emerald-400',
    accentBorder: 'border-emerald-400/15',
    accentBorderStrong: 'border-emerald-400/40',
    accentBg: 'bg-emerald-400/8',
    solidBg: 'bg-emerald-400',
    glow: 'shadow-[0_20px_60px_-15px_rgba(52,211,153,0.35)]',
    gradientFrom: 'from-emerald-400/25',
    gradientVia: 'via-primary-cyan/10',
    focusBorder: 'focus:border-emerald-400/60',
    eyebrow: 'Cercle des Mécènes',
    roleLabelEN: 'Patron',
    roleLabelFR: 'Mécène',
    descEN: 'You hold 1 exclusive invitation. Know someone who could support tomorrow\u2019s creators? Bring them into the LYA circle of patrons.',
    descFR: 'Vous détenez 1 invitation exclusive. Vous connaissez quelqu\u2019un qui pourrait soutenir les créateurs de demain ? Faites-le entrer dans le cercle des mécènes LYA.',
  },
  PROFESSIONAL: {
    accent: 'text-primary-cyan',
    accentBorder: 'border-primary-cyan/15',
    accentBorderStrong: 'border-primary-cyan/40',
    accentBg: 'bg-primary-cyan/8',
    solidBg: 'bg-primary-cyan',
    glow: 'shadow-[0_20px_60px_-15px_rgba(0,224,255,0.35)]',
    gradientFrom: 'from-primary-cyan/25',
    gradientVia: 'via-accent-gold/10',
    focusBorder: 'focus:border-primary-cyan/60',
    eyebrow: 'Réseau LYA',
    roleLabelEN: 'Professional',
    roleLabelFR: 'Professionnel',
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
  const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.CREATOR;

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Fallback local state : certaines vues parentes (les Dashboard views)
  // n'ont pas de callback pour répercuter un profil rafraîchi comme
  // ProfileView (onUpdateUser). Ce flag garantit que l'état "envoyée"
  // s'affiche immédiatement, sans attendre un rechargement complet.
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
      setJustSent({ email: cleanEmail });
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
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl group"
    >
      {/* Halo dégradé — même signature visuelle que les autres CTA premium
          de l'app (Scan Opportunity, etc.), pas de backdrop-blur ici (voir
          note perf plus bas). */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientVia} to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700`} />

      {/* Grain subtil — texture premium, coût quasi nul (une seule image SVG
          répétée), à la différence de backdrop-blur qui coûte cher à chaque
          frame de scroll sur mobile. */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Motif de badge LYA — anneaux concentriques tri-couleur, la même
          signature que sur le logo et les emails, plutôt qu'une icône
          générique "personne +". */}
      <div className="absolute -right-8 -top-8 md:-right-12 md:-top-12 opacity-[0.10] group-hover:opacity-[0.16] group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
        <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="#ff3366" strokeWidth="1.2" strokeDasharray="4 3" />
          <circle cx="50" cy="50" r="34" stroke="#00e0ff" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="22" stroke="#8a2be2" strokeWidth="1.2" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="4" fill="white" />
        </svg>
      </div>

      <div className={`relative bg-surface-low border ${cfg.accentBorder} ${cfg.glow} rounded-3xl overflow-hidden`}>
        {/* Barre de marque tri-couleur — même dégradé que les emails LYA */}
        <div className="h-[3px] bg-gradient-to-r from-accent-purple via-primary-cyan to-accent-pink" />

        <div className="p-6 md:p-10">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className={`px-3 py-1 ${cfg.accentBg} border ${cfg.accentBorderStrong} rounded-full flex items-center gap-1.5`}>
            <Sparkles size={11} className={cfg.accent} />
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${cfg.accent}`}>
              {cfg.eyebrow}
            </span>
          </div>
        </div>

        {/* Titre — même traitement que PageHeader : bloc blanc + accent */}
        <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter text-white uppercase mb-3 md:mb-4 leading-none">
          {t('Invitation', 'Invitation')}{' '}
          <span className={cfg.accent}>{t(cfg.roleLabelEN, cfg.roleLabelFR)}</span>
        </h2>

        <p className="text-sm md:text-base text-on-surface-variant font-medium max-w-xl mb-6 md:mb-8 leading-relaxed">
          {t(cfg.descEN, cfg.descFR)}
        </p>

        {/* Compteur d'invitation — badge circulaire, pas une simple ligne de texte */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${alreadySent ? 'border-white/10' : cfg.accentBorderStrong} flex items-center justify-center shrink-0`}>
            {!alreadySent && (
              <motion.div
                className={`absolute inset-0 rounded-full border-2 ${cfg.accentBorderStrong}`}
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <span className={`text-lg md:text-xl font-black font-headline ${alreadySent ? 'text-white/30' : 'text-white'}`}>
              {alreadySent ? '0' : '1'}
            </span>
          </div>
          <div>
            <p className="text-xs md:text-sm font-black uppercase tracking-widest text-white">
              {t('Available Invitation', 'Invitation Disponible')}
            </p>
            <p className="text-[10px] md:text-xs text-on-surface-variant/50 uppercase tracking-wider">
              {alreadySent ? t('Used', 'Utilisée') : t('Ready to send', 'Prête à envoyer')}
            </p>
          </div>
        </div>

        {alreadySent ? (
          <div className={`flex items-center gap-3 px-5 py-4 ${cfg.accentBg} border ${cfg.accentBorder} rounded-2xl`}>
            <div className={`w-8 h-8 rounded-full ${cfg.accentBg} border ${cfg.accentBorderStrong} flex items-center justify-center shrink-0`}>
              <Check size={15} className={cfg.accent} />
            </div>
            <p className="text-sm text-white/80">
              {t('Sent to', 'Envoyée à')} <span className="font-black text-white">{sentTo}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-3 md:space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Their email address', 'Adresse email du/de la destinataire')}
              className={`w-full bg-surface-dim border border-white/10 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm font-medium focus:outline-none transition-all text-white placeholder:text-white/25 ${cfg.focusBorder}`}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('A personal note (optional)', 'Un mot personnel (facultatif)')}
              rows={2}
              maxLength={280}
              className={`w-full bg-surface-dim border border-white/10 px-4 md:px-5 py-3.5 md:py-4 rounded-xl text-sm font-medium focus:outline-none transition-all text-white placeholder:text-white/25 resize-none ${cfg.focusBorder}`}
            />
            <button
              type="submit"
              disabled={isSending || !isValidEmail(email)}
              className={`w-full md:w-auto px-8 py-3.5 md:py-4 ${cfg.solidBg} text-surface-dim font-black uppercase tracking-widest text-xs md:text-sm rounded-xl hover:bg-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${cfg.glow}`}
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {isSending ? t('Sending...', 'Envoi...') : t('Send the Invitation', "Envoyer l'Invitation")}
            </button>
          </form>
        )}
        </div>
      </div>
    </motion.section>
  );
};
