// Systeme de licence multi-utilisateurs (sieges) — inspire du modele
// "licence solo vs licence equipe" (type Windows). Un compte Pro peut
// inviter des membres par email jusqu'a la limite de sieges de son palier.
// Les membres invites heritent des memes droits de soumission que le
// compte proprietaire (role, palier Pro, statut entreprise).
//
// Modele de donnees Firestore :
// - `team_invites/{email_en_minuscule}` : { ownerId, ownerRole, ownerProTier,
//     ownerIsEnterprise, invitedAt, status: 'pending' | 'accepted' }
// - Sur le document `users/{ownerId}` : `teamMembers: string[]` (emails
//     invites, pour affichage et calcul du nombre de sieges utilises)
// - Sur le document `users/{memberId}` (une fois inscrit) : `linkedAccountOwnerId`
//     pointant vers le proprietaire, et les memes champs role/proTier/isEnterprise
//     copies depuis le proprietaire au moment de l'inscription.

import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { UserRole } from '../types';
import {
  SEAT_LIMIT_FREE_CREATOR, SEAT_LIMIT_PRO_STARTER, SEAT_LIMIT_PRO_ADVANCED, SEAT_LIMIT_ENTERPRISE,
} from '../lib/permissions';

export function getSeatLimitForUser(user: { role?: string; proTier?: string; isEnterprise?: boolean } | null): number {
  if (!user) return SEAT_LIMIT_FREE_CREATOR;
  if (user.isEnterprise) return SEAT_LIMIT_ENTERPRISE;
  if (user.role === UserRole.PROFESSIONAL) {
    return user.proTier === 'ADVANCED' ? SEAT_LIMIT_PRO_ADVANCED : SEAT_LIMIT_PRO_STARTER;
  }
  return SEAT_LIMIT_FREE_CREATOR;
}

/**
 * Le proprietaire d'un compte invite un email a rejoindre son equipe.
 * Verifie la limite de sieges avant d'ecrire quoi que ce soit.
 */
export async function inviteTeamMember(
  ownerId: string,
  ownerProfile: { role?: string; proTier?: string; isEnterprise?: boolean; teamMembers?: string[] },
  email: string
): Promise<{ ok: true } | { ok: false; reason: 'LIMIT_REACHED' | 'ALREADY_INVITED' | 'ERROR' }> {
  const cleanEmail = email.trim().toLowerCase();
  const seatLimit = getSeatLimitForUser(ownerProfile);
  const currentSeats = ownerProfile.teamMembers?.length || 0;

  // Le siege du proprietaire lui-meme compte dans la limite.
  if (currentSeats + 1 >= seatLimit) {
    return { ok: false, reason: 'LIMIT_REACHED' };
  }
  if (ownerProfile.teamMembers?.includes(cleanEmail)) {
    return { ok: false, reason: 'ALREADY_INVITED' };
  }

  try {
    await setDoc(doc(db, 'team_invites', cleanEmail), {
      ownerId,
      ownerRole: ownerProfile.role || UserRole.PROFESSIONAL,
      ownerProTier: ownerProfile.proTier || null,
      ownerIsEnterprise: !!ownerProfile.isEnterprise,
      invitedAt: serverTimestamp(),
      status: 'pending',
    });
    await updateDoc(doc(db, 'users', ownerId), {
      teamMembers: arrayUnion(cleanEmail),
    });
    return { ok: true };
  } catch (err) {
    console.error('inviteTeamMember error:', err);
    return { ok: false, reason: 'ERROR' };
  }
}

/**
 * Le proprietaire retire un membre de son equipe — libere le siege.
 * Ne retire pas retroactivement les droits deja actifs du membre s'il
 * est deja inscrit (a faire manuellement cote admin si necessaire) ;
 * ca libere surtout le siege pour en inviter un autre.
 */
export async function removeTeamMember(ownerId: string, email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await updateDoc(doc(db, 'users', ownerId), {
    teamMembers: arrayRemove(cleanEmail),
  });
}

/**
 * A appeler juste avant de creer le profil Firestore d'un nouvel inscrit.
 * Si son email correspond a une invitation en attente, renvoie les champs
 * de palier a copier sur son propre profil (il herite des droits du
 * compte proprietaire, sans avoir besoin de payer lui-meme).
 */
export async function resolveTeamInviteForSignup(email: string): Promise<{
  linkedAccountOwnerId: string;
  role: string;
  proTier?: string;
  isEnterprise?: boolean;
} | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const inviteSnap = await getDoc(doc(db, 'team_invites', cleanEmail));
    if (!inviteSnap.exists()) return null;
    const invite = inviteSnap.data();
    if (invite.status !== 'pending') return null;

    await updateDoc(doc(db, 'team_invites', cleanEmail), { status: 'accepted' });

    return {
      linkedAccountOwnerId: invite.ownerId,
      role: invite.ownerRole,
      proTier: invite.ownerProTier || undefined,
      isEnterprise: invite.ownerIsEnterprise || undefined,
    };
  } catch (err) {
    console.error('resolveTeamInviteForSignup error:', err);
    return null;
  }
}
