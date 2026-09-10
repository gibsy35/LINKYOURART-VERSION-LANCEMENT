import { db } from '../firebase';
import {
  collection, addDoc, serverTimestamp, getDocs, query, where, limit,
  doc, getDoc, setDoc, increment,
} from 'firebase/firestore';

/**
 * Logique de pré-inscription partagée — extraite de LandingView.tsx (handlePreRegister)
 * pour être réutilisable ailleurs (ex: la pop-up légère du Terminal) SANS dupliquer
 * la logique. LandingView.tsx garde sa propre copie inline pour l'instant (non
 * touchée, zéro risque de régression) ; l'idéal à terme est qu'elle appelle aussi
 * cette fonction pour n'avoir plus qu'une seule source de vérité.
 */

export type AccessTier = 'FOUNDING_PIONEER' | 'ORIGINAL' | 'WAITLIST';
export type PreRegCategory = 'CREATOR' | 'PROFESSIONAL' | 'PATRON';

export interface PreRegistrationResult {
  position: number;
  tier: AccessTier;
  accessKey: string | null;
  referralCode: string;
}

const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'yopmail.com', 'yopmail.fr', 'throwawaymail.com', 'trashmail.com',
  'getnada.com', 'dispostable.com', 'fakeinbox.com', 'maildrop.cc',
  'moakt.com', 'mailnesia.com', 'mintemail.com', 'mohmal.com',
  'emailondeck.com', 'tempinbox.com', 'discard.email', 'spamgourmet.com',
  'mytemp.email', 'tempmailo.com', 'tempail.com', 'inboxbear.com',
  'burnermail.io', 'crazymailing.com', 'harakirimail.com', 'anonbox.net',
];

const TEST_EMAILS = [
  'linkyourart@gmail.com', 'jblequime27061983@gmail.com',
  'lequimejeanbaptiste@gmail.com', 'jlequime@hotmail.com',
];

export function isDisposableEmail(addr: string): boolean {
  const domain = addr.toLowerCase().trim().split('@')[1] || '';
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

export function generateReferralCode(n: string): string {
  const initials = n.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LYA';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${initials}-${suffix}`;
}

export function generateAccessKey(): string {
  const suffix1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const suffix2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LYA-${suffix1}-${suffix2}`;
}

/**
 * Soumet une pré-inscription : verifie l'unicite de l'email, incremente le
 * compteur de position, ecrit dans Firestore (pre_registrations), attribue
 * un palier (Founding Pioneer / Original / Waitlist) et une cle d'acces
 * immediate si eligible, puis declenche l'email de confirmation.
 * Leve une erreur avec un message utilisateur (FR/EN) si la validation echoue.
 */
export async function submitPreRegistration(params: {
  name: string;
  email: string;
  category: PreRegCategory;
  referredBy?: string | null;
  language: 'FR' | 'EN';
}): Promise<PreRegistrationResult> {
  const { name, email, category, referredBy, language } = params;
  const isFR = language === 'FR';
  const cleanEmail = email.toLowerCase().trim();
  const isTestEmail = TEST_EMAILS.includes(cleanEmail);

  if (!isTestEmail && isDisposableEmail(email)) {
    throw new Error(isFR
      ? "Les adresses email temporaires/jetables ne sont pas acceptées. Merci d'utiliser une adresse email personnelle ou professionnelle."
      : 'Temporary/disposable email addresses are not accepted. Please use a personal or professional email address.'
    );
  }

  if (!isTestEmail) {
    try {
      const existing = await getDocs(query(
        collection(db, 'pre_registrations'),
        where('email', '==', cleanEmail),
        limit(1)
      ));
      if (!existing.empty) {
        throw new Error(isFR
          ? "Cette adresse email est déjà pré-inscrite. Vérifiez votre boîte mail pour l'email de confirmation."
          : 'This email is already pre-registered. Check your inbox for the confirmation email.'
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('déjà pré-inscrite')) throw e;
      if (e instanceof Error && e.message.includes('already pre-registered')) throw e;
      console.warn('[EMAIL CHECK]', e);
      // Si la verification echoue pour une autre raison (reseau...), on continue.
    }
  }

  const code = generateReferralCode(name);

  let position = 1;
  try {
    const counterRef = doc(db, 'public_stats', 'pre_registrations');
    await setDoc(counterRef, { count: increment(1), updatedAt: serverTimestamp() }, { merge: true });
    const snap = await getDoc(counterRef);
    if (snap.exists()) position = snap.data().count || position;
  } catch (e) {
    console.error('[COUNTER]', e);
  }

  addDoc(collection(db, 'pre_registrations'), {
    name, email, category,
    timestamp: serverTimestamp(),
    type: 'PRE_REGISTRATION',
    position,
    referralCode: code,
    referredBy: referredBy || null,
  }).catch((writeError) => console.error('Error saving pre-registration:', writeError));

  const tier: AccessTier = position <= 150 ? 'FOUNDING_PIONEER' : position <= 1000 ? 'ORIGINAL' : 'WAITLIST';

  let issuedKey: string | null = null;
  if (tier !== 'WAITLIST') {
    issuedKey = generateAccessKey();
    try { localStorage.setItem('lya_my_access_key', issuedKey); } catch { /* noop */ }
    addDoc(collection(db, 'access_keys'), {
      key: issuedKey,
      assignedTo: `${name} <${email}>`,
      tier,
      position,
      createdAt: serverTimestamp(),
      status: 'ACTIVE',
      source: 'AUTO_PRE_REGISTRATION',
    }).catch((writeError) => console.error('Error issuing access key:', writeError));
  }

  try {
    const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
    localPre.push({
      id: 'local_pre_' + Date.now(), name, email, category, position,
      referralCode: code, tier, accessKey: issuedKey,
      timestamp: { toDate: () => new Date() }, type: 'PRE_REGISTRATION',
    });
    localStorage.setItem('lya_local_pre_registrations', JSON.stringify(localPre));
    localStorage.setItem('lya_my_referral_code', code);
  } catch { /* noop */ }

  fetch('/api/email/pre-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email, name, email,
      role: category?.toUpperCase() || 'CREATOR',
      lang: language,
      type: 'confirmation',
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success) console.log('[LYA EMAIL] Sent to', email, 'via', data.method);
      else console.error('[LYA EMAIL] Failed:', data.error);
    })
    .catch((err) => console.error('[LYA EMAIL ERROR]', err));

  return { position, tier, accessKey: issuedKey, referralCode: code };
}
