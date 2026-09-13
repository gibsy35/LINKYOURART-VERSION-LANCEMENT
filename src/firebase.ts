import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Explicit persistence, favoring IndexedDB. This matters specifically for
// signInWithRedirect() on mobile browsers (Safari ITP, Chrome storage
// partitioning): without it, some mobile browsers lose track of the
// pending redirect between leaving for Google and coming back, so
// getRedirectResult() silently resolves to null even though the Google
// sign-in itself succeeded — the person lands back on the app logged out,
// with no error shown. IndexedDB persistence is Firebase's own recommended
// fix for this. Falls back to browserLocalPersistence if IndexedDB isn't
// available (e.g. Safari private browsing).
setPersistence(auth, indexedDBLocalPersistence).catch(() => {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
});

// Validate Connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
    return false;
  }
}
testConnection();

// ─── Google redirect-auth diagnostic logging ───────────────────────────────
// Temporary instrumentation to debug the mobile "Google sign-in silently
// fails and lands back on landing" issue. Logs to Firestore (not just
// console) specifically because mobile devtools access is impractical --
// this lets the failure be inspected after the fact from any machine.
// Safe to remove once the mobile redirect-auth issue is confirmed fixed.
export async function logAuthDebugEvent(stage: 'redirect_initiated' | 'redirect_return', details: Record<string, any>) {
  try {
    await addDoc(collection(db, 'auth_debug_logs'), {
      stage,
      ...details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Never let debug logging break the actual auth flow.
    console.warn('[auth_debug_logs] failed to write:', e);
  }
}


export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// ─── Shared, human-readable Google sign-in error messages ─────────────────
// Centralized here so LoginView, SignupView and AuthModal show the exact
// same, actionable wording instead of three slightly-different ad hoc
// messages (or Firebase's raw, technical err.message). The most common real
// cause in this app: testing on a Vercel preview URL (*.vercel.app), which
// Firebase never auto-adds to its authorized-domains allowlist — every
// preview subdomain has to be added explicitly in Firebase Console ->
// Authentication -> Settings -> Authorized domains, since Firebase does not
// support wildcards there.
export function describeGoogleAuthError(err: any, t: (en: string, fr: string) => string): string {
  const code = err?.code || '';
  if (code === 'auth/unauthorized-domain') {
    return t(
      `This domain (${typeof window !== 'undefined' ? window.location.hostname : ''}) isn't authorized for Google sign-in. If you're testing on a Vercel preview URL (*.vercel.app), that's expected — each domain must be added manually in Firebase Console → Authentication → Settings → Authorized domains. Use the production domain, or add this one to the list.`,
      `Ce domaine (${typeof window !== 'undefined' ? window.location.hostname : ''}) n'est pas autorisé pour la connexion Google. Si vous testez sur une URL de preview Vercel (*.vercel.app), c'est normal : chaque domaine doit être ajouté manuellement dans Firebase Console → Authentication → Settings → Authorized domains. Utilisez le domaine de production ou ajoutez ce domaine à la liste.`
    );
  }
  if (code === 'auth/popup-blocked') {
    return t(
      'Your browser blocked the Google sign-in popup. Allow popups for this site, or try again.',
      'Le navigateur a bloqué la fenêtre de connexion Google. Autorisez les popups pour ce site, ou réessayez.'
    );
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return t(
      'Authentication popup closed. Please try again or use your Email login.',
      "La fenêtre d'authentification a été fermée. Réessayez ou utilisez votre e-mail."
    );
  }
  if (code === 'auth/network-request-failed') {
    return t('Network error. Check your connection.', 'Erreur réseau. Vérifiez votre connexion.');
  }
  return err?.message || t('Google authentication failed.', 'Échec de la connexion Google.');
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Detect Quota error or Internal Assertion failures
  const lowerMsg = errorMessage.toLowerCase();
  const isQuotaError = lowerMsg.includes('quota') || 
                      lowerMsg.includes('8 resource_exhausted') ||
                      lowerMsg.includes('exceeded') ||
                      lowerMsg.includes('429');
                      
  const isAssertionError = lowerMsg.includes('assertion failed') || 
                          lowerMsg.includes('unexpected state') ||
                          lowerMsg.includes('id: ca9') ||
                          lowerMsg.includes('id: b815') ||
                          lowerMsg.includes('ca9') ||
                          lowerMsg.includes('b815') ||
                          lowerMsg.includes('ve:-1');

  const errInfo: FirestoreErrorInfo = {
    error: isQuotaError 
      ? "FireStore Quota Exceeded (Spark Plan Limit). Operations are restricted until daily reset."
      : errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }

  // Globalize error state for components to stop polling/listening
  if (isQuotaError || isAssertionError) {
    if (!(window as any).lya_quota_reached) {
      console.warn('LINKYOURART LYA SYSTEM: Quota limit reached or network interruption detected. Entering offline/maintenance mode.');
    }
    (window as any).lya_quota_reached = true;
    (window as any).lya_last_firestore_error = errInfo;
    
    // Silently return to prevent component crashes from uncaught errors in listeners
    return errInfo;
  }
  
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  
  throw new Error(JSON.stringify(errInfo));
}
