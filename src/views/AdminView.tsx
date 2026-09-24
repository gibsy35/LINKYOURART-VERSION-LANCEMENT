import React, { useState, useEffect } from 'react';
import { getSafeImageUrl, handleImageError } from '../utils/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles,
  ShieldAlert, 
  Shield,
  Users, 
  FileCheck, 
  FileText,
  Mail,
  CreditCard, 
  Activity, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Database,
  Lock,
  Globe,
  Settings,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Zap,
  ChevronRight,
  Trash2,
  ListFilter,
  X,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/StatCard';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { CONTRACTS, Contract, UserRole, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, limit, orderBy, deleteDoc, addDoc, setDoc, writeBatch, serverTimestamp, where } from 'firebase/firestore';
import { generateAccessKey } from '../utils/preRegistration';

export const AdminView: React.FC<{
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
  liveContracts: Contract[];
}> = ({ user, onNotify, onViewChange, liveContracts }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'validation' | 'engagement' | 'submissions'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [validationQueue, setValidationQueue] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [publishModal, setPublishModal] = useState<any | null>(null);
  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isDraftingRejectionAdmin, setIsDraftingRejectionAdmin] = useState(false);
  const [pendingShown, setPendingShown] = useState(20);
  const [historyShown, setHistoryShown] = useState(10);
  const [showHistory, setShowHistory] = useState(false);
  const [approvalSuccessModal, setApprovalSuccessModal] = useState<{ name: string; emailSent: boolean } | null>(null);
  const [publishForm, setPublishForm] = useState({ scoreAlgo: 750, scorePro: 750, growth: 0, rarity: 'Distinguished' });
  const [expandedVerifId, setExpandedVerifId] = useState<string | null>(null);



  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 100;
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [stats] = useState({
    totalUsers: 1420,
    activePro: 156,
    totalVolume: 12450800,
    systemFee: 312500,
    pendingVerifications: 8,
    pendingProjects: 4
  });

  const countries = ['France', 'USA', 'Japan', 'Senegal', 'Germany', 'Italy', 'Spain', 'UK', 'Canada', 'Brazil', 'China', 'India', 'South Korea', 'Australia', 'Sweden', 'Denmark', 'Norway', 'Finland', 'Switzerland', 'Austria', 'Benin', 'Morocco', 'Egypt', 'UAE', 'Mexico', 'Argentina', 'Chile', 'Vietnam', 'Thailand', 'Portugal', 'Nigeria', 'Kenya', 'Singapore', 'Greece', 'Netherlands'];

  useEffect(() => {
    if ((window as any).lya_quota_reached) {
      setLoading(false);
      return;
    }
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(500));

    let unsubscribe: () => void = () => {};
    
    try {
      unsubscribe = onSnapshot(query(usersRef, limit(500)), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setUsers(usersList);
        setLoading(false);
      }, (error) => {
        // Auto-unsubscribe on quota error
        if (unsubscribe) {
          try { unsubscribe(); } catch(e) {}
        }
        console.warn('Admin users fetch failed:', error);
        handleFirestoreError(error, OperationType.GET, 'users');
        setLoading(false);
      });
    } catch (e) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadLocalData = () => {
      const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
      setPreRegistrations(prev => {
        const merged = [...prev];
        localPre.forEach((lp: any) => {
          if (!merged.some(m => m.id === lp.id)) merged.push(lp);
        });
        return merged;
      });
    };

    loadLocalData();

    if ((window as any).lya_quota_reached) return;
    const preRef = collection(db, 'pre_registrations');
    const submissionsRef = collection(db, 'projects_pending');

    const unsubs: (() => void)[] = [];

    // Charger les soumissions de projets en attente
    unsubs.push(onSnapshot(query(submissionsRef, orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setPendingSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (e) => console.warn('submissions error:', e)));

    unsubs.push(onSnapshot(query(preRef, limit(200)), (snap) => {
      const dbPre = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
      const merged: any[] = [...dbPre];
      localPre.forEach((lp: any) => {
        if (!merged.some((m: any) => m.email === lp.email)) {
          merged.push(lp);
        }
      });
      merged.sort((a: any, b: any) => {
        // Accepter timestamp OU createdAt
        const getDate = (x: any) => {
          const ts = x.timestamp || x.createdAt;
          if (!ts) return new Date(0);
          if (ts.toDate) return ts.toDate();
          return new Date(ts);
        };
        return getDate(b).getTime() - getDate(a).getTime();
      });
      setPreRegistrations(merged);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'pre_registrations')));

    // Demandes de contact mecene -> createur (bouton "Contacter le createur"
    // sur le dashboard Mecene) : ecrites dans Firestore mais jamais relues
    // nulle part avant ce correctif — donc invisibles pour l'equipe LYA
    // malgre le message "transmise via LYA sous 24-48h".
    unsubs.push(onSnapshot(query(collection(db, 'messages'), where('type', '==', 'patron_contact'), limit(100)), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a, b) => {
        const getDate = (x: any) => x.createdAt?.toDate ? x.createdAt.toDate() : new Date(0);
        return getDate(b).getTime() - getDate(a).getTime();
      });
      setContactRequests(items);
    }, (e) => console.warn('contact requests error:', e)));

    return () => unsubs.forEach(u => u());
  }, []);

  useEffect(() => {
    setProjectsList(liveContracts);
    setValidationQueue(liveContracts.filter((p: any) => p.status === 'PENDING').sort((a: any, b: any) => {
      const dateA = a.updatedAt || a.createdAt || '';
      const dateB = b.updatedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    }));
    setLoadingProjects(false);
  }, [liveContracts]);

  useEffect(() => {
    // Purge ponctuelle des candidatures de démonstration fictives
    // (Aurélia Dubois-Mercier, Hans-Dieter Werner, Marcus Sterling)
    // qui pouvaient déjà être stockées en local depuis une session
    // précédente — leurs documents avaient des liens factices
    // ('#mock-kbis'...) jamais téléchargeables. Les vraies candidatures
    // (soumises via ApplyForVerificationView.tsx, avec un vrai fichier
    // uploadé sur Firebase Storage) ne sont pas concernées.
    const MOCK_VERIF_IDS = ['verif-001', 'verif-002', 'verif-003'];
    try {
      const stored = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
      const cleaned = stored.filter((v: any) => !MOCK_VERIF_IDS.includes(v.id));
      if (cleaned.length !== stored.length) {
        localStorage.setItem('lya_local_verification_requests', JSON.stringify(cleaned));
      }
    } catch {}

    if ((window as any).lya_quota_reached) return;
    const requestsRef = collection(db, 'verification_requests');
    // Sans tri explicite, "limit(50)" ne garantit pas de récupérer les
    // plus RÉCENTES demandes — Firestore peut retourner n'importe quel
    // lot de 50 documents. Avec le volume de test accumulé, une nouvelle
    // candidature pouvait donc rester invisible, exclue du lot retourné.
    const q = query(requestsRef, orderBy('createdAt', 'desc'), limit(50));

    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(q, (snapshot) => {
        const dbRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const localVerif = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
        const merged = [...dbRequests];
        localVerif.forEach((lv: any) => {
          if (!merged.some(m => m.id === lv.id)) {
            merged.push(lv);
          }
        });
        setVerificationRequests(merged);
      }, (error) => {
        if (unsubscribe) {
          try { unsubscribe(); } catch(e) {}
        }
        console.warn('Admin verifications fetch failed:', error);
        handleFirestoreError(error, OperationType.GET, 'verification_requests');
        try {
          const localVerif = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
          setVerificationRequests(localVerif);
        } catch {}
      });
    } catch (e) { /* Ignore */ }

    return () => unsubscribe();
  }, []);

  const handleApproveVerification = async (requestId: string, userId: string) => {
    if (!userId) {
      onNotify(t(
        'Cannot approve: this application has no linked user account (submitted while signed out).',
        'Impossible d\u2019approuver : cette candidature n\u2019a aucun compte utilisateur lié (soumise sans être connecté).'
      ));
      return;
    }
    try {
      let emailSent = false;
      const approvedReq = verificationRequests.find(r => r.id === requestId);
      const applicantName = approvedReq?.formData?.name || approvedReq?.userDisplayName || t('Validator', 'Validateur');
      // L'écriture Firestore se fait D'ABORD — l'écran ne se met à jour
      // qu'une fois confirmée. Avant, l'affichage passait en "Approuvé"
      // immédiatement, indépendamment du succès réel de l'écriture : en
      // cas d'échec (permissions, réseau...), tout semblait fonctionner
      // à l'écran alors que rien n'avait été enregistré.
      if (!requestId.startsWith('local_')) {
        const batch = writeBatch(db);

        const requestRef = doc(db, 'verification_requests', requestId);
        batch.update(requestRef, { status: 'APPROVED', processedAt: serverTimestamp() });

        // Upgrade user to Professional + grant validator status (Governance/Lounge access —
        // see src/lib/permissions.ts). This IS the "Become a Certified LYA Validator"
        // accreditation flow advertised on the Pricing page.
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { 
          isPro: true, 
          role: UserRole.PROFESSIONAL,
          verificationStatus: 'APPROVED',
          isVerifiedValidator: true
        });

        await batch.commit();

        // Email de confirmation — n'existait pas du tout avant, la
        // candidature était approuvée sans que la personne ne le sache.
        // Avant : fetch() sans vérifier response.ok — un 400 (ex. champ
        // manquant) ou un échec Resend passait totalement inaperçu, y
        // compris dans la console, puisque fetch() ne rejette QUE sur
        // une panne réseau, jamais sur un statut d'erreur HTTP.
        const applicantEmail = approvedReq?.userEmail || approvedReq?.formData?.email;

        if (!applicantEmail) {
          console.error('[VALIDATOR_APPROVAL_EMAIL] No email address on this request — cannot send confirmation.', approvedReq);
          emailSent = false;
        } else {
          try {
            const emailRes = await fetch('/api/email/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: applicantEmail, name: applicantName, role: 'PROFESSIONAL', lang: 'FR' }),
            });
            const emailJson = await emailRes.json().catch(() => null);
            if (!emailRes.ok || !emailJson?.success) {
              console.error('[VALIDATOR_APPROVAL_EMAIL] Failed:', emailRes.status, emailJson);
              emailSent = false;
            } else {
              console.log('[VALIDATOR_APPROVAL_EMAIL] Sent successfully', emailJson);
              emailSent = true;
            }
          } catch (emailErr) {
            console.error('[VALIDATOR_APPROVAL_EMAIL] Network error:', emailErr);
            emailSent = false;
          }
        }
      }

      // Update local storage mirror
      const localVerif = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
      const localIndex = localVerif.findIndex((v: any) => v.id === requestId);
      if (localIndex !== -1) {
        localVerif[localIndex].status = 'APPROVED';
        localStorage.setItem('lya_local_verification_requests', JSON.stringify(localVerif));
      }

      // If this is the current active user, update their role locally
      const currentUser = JSON.parse(localStorage.getItem('lya_user_profile') || 'null');
      if (currentUser && currentUser.uid === userId) {
        currentUser.isPro = true;
        currentUser.role = UserRole.PROFESSIONAL;
        currentUser.verificationStatus = 'APPROVED';
        currentUser.isVerifiedValidator = true;
        localStorage.setItem('lya_user_profile', JSON.stringify(currentUser));
      }

      // L'écran ne se met à jour qu'une fois l'écriture confirmée.
      setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
      setApprovalSuccessModal({ name: applicantName, emailSent });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      onNotify(t(
        `Approval failed: ${message}`,
        `Échec de l'approbation : ${message}`
      ));
      if (!requestId.startsWith('local_')) {
        handleFirestoreError(err as any, OperationType.UPDATE, `verification_requests/${requestId}`);
      }
    }
  };

  const handleRejectVerification = async (requestId: string, userId: string) => {
    if (!userId) {
      onNotify(t(
        'Cannot reject: this application has no linked user account.',
        'Impossible de rejeter : cette candidature n\u2019a aucun compte utilisateur lié.'
      ));
      return;
    }
    try {
      if (!requestId.startsWith('local_')) {
        const batch = writeBatch(db);

        const requestRef = doc(db, 'verification_requests', requestId);
        batch.update(requestRef, { status: 'REJECTED', processedAt: serverTimestamp() });

        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { verificationStatus: 'REJECTED' });

        await batch.commit();
      }

      // Update local storage mirror
      const localVerif = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
      const localIndex = localVerif.findIndex((v: any) => v.id === requestId);
      if (localIndex !== -1) {
        localVerif[localIndex].status = 'REJECTED';
        localStorage.setItem('lya_local_verification_requests', JSON.stringify(localVerif));
      }

      const currentUser = JSON.parse(localStorage.getItem('lya_user_profile') || 'null');
      if (currentUser && currentUser.uid === userId) {
        currentUser.verificationStatus = 'REJECTED';
        localStorage.setItem('lya_user_profile', JSON.stringify(currentUser));
      }

      setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
      onNotify(t('VERIFICATION REJECTED.', 'VÉRIFICATION REJETÉE.'));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      onNotify(t(
        `Rejection failed: ${message}`,
        `Échec du rejet : ${message}`
      ));
      if (!requestId.startsWith('local_')) {
        handleFirestoreError(err as any, OperationType.UPDATE, `verification_requests/${requestId}`);
      }
    }
  };

  // Publier un projet soumis vers le Registre LYA
  const handlePublishProject = async (submission: any, form: typeof publishForm) => {
    try {
      const totalScore = Math.round((form.scoreAlgo + form.scorePro) / 2);
      const registryIndex = `LYA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

      // 1. Publier dans la collection contracts (Registre)
      await setDoc(doc(db, 'contracts', submission.id), {
        id: submission.id,
        name: submission.name,
        category: submission.category || 'Music',
        description: submission.description || '',
        // descriptionFR manquait: la traduction generee a la soumission
        // (LinkArtView) etait silencieusement perdue a la publication, la
        // fiche projet retombait toujours en anglais quelle que soit la
        // langue du site, meme sur la version francaise.
        descriptionFR: submission.descriptionFR || submission.description || '',
        image: submission.imageUrl || `https://picsum.photos/seed/${submission.id}/800/500`,
        issuerId: submission.creatorName || 'LYA Creator',
        creatorId: submission.creatorId,
        // issuerUid manquait aussi: c'est le champ dont depend toute la
        // verification Stripe Connect (MecenatShared) avant d'autoriser un
        // soutien - sans lui, cette verification etait silencieusement
        // contournee pour tout projet reellement publie.
        issuerUid: submission.creatorId,
        status: 'LIVE',
        rarity: form.rarity,
        scoreAlgo: form.scoreAlgo,
        scorePro: form.scorePro,
        totalScore,
        growth: form.growth,
        registryIndex,
        registryAddress: `LYA_REG_0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        creationDate: new Date().toISOString().split('T')[0],
        publishedAt: serverTimestamp(),
        publishedBy: user?.uid,
      });

      // 2. Mettre à jour le statut dans projects_pending
      await updateDoc(doc(db, 'projects_pending', submission.id), {
        status: 'PUBLISHED',
        publishedAt: serverTimestamp(),
        registryIndex,
        lyaScore: totalScore,
      });

      // 3. Mettre à jour le state local
      setPendingSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'PUBLISHED' } : s));
      setPublishModal(null);
      onNotify(t(`✦ ${submission.name} publié sur le Registre LYA — Score: ${totalScore}/1000`, `✦ ${submission.name} published on the LYA Registry — Score: ${totalScore}/1000`));
    } catch(e: any) {
      console.error('Publish error:', e);
      onNotify(t('Erreur lors de la publication', 'Publication error'));
    }
  };

  // Rejeter une soumission
  const handleRejectSubmission = async (submission: any, reason: string) => {
    try {
      await updateDoc(doc(db, 'projects_pending', submission.id), {
        status: 'REJECTED',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
      });
      // Envoi reel de l'email, DESORMAIS ATTENDU ET VERIFIE - avant ce fix,
      // l'appel etait "fire-and-forget", jamais attendu ni verifie, et le
      // message de succes s'affichait systematiquement meme si l'envoi
      // echouait reellement en silence (ex: cle Resend absente cote
      // serveur) - impossible de savoir si un email etait vraiment parti.
      let emailOk = false;
      let emailErr = '';
      if (submission.creatorEmail) {
        try {
          const emailRes = await fetch('/api/email/project-rejected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: submission.creatorEmail,
              creatorName: submission.creatorName,
              projectName: submission.name,
              reason,
              lang: language,
            }),
          });
          const emailData = await emailRes.json();
          emailOk = !!emailData.success;
          emailErr = emailData.error || '';
        } catch (emailException: any) {
          emailErr = emailException?.message || 'network error';
        }
      }
      setPendingSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'REJECTED' } : s));
      if (!submission.creatorEmail) {
        onNotify(t(`✦ ${submission.name} refusé — aucun email de contact trouvé.`, `✦ ${submission.name} rejected — no contact email found.`));
      } else if (emailOk) {
        onNotify(t(`✦ ${submission.name} refusé — le créateur a été notifié par email.`, `✦ ${submission.name} rejected — the creator has been notified by email.`));
      } else {
        onNotify(t(`✦ ${submission.name} refusé, mais l'email n'a PAS pu être envoyé (${emailErr || 'erreur inconnue'})`, `✦ ${submission.name} rejected, but the email could NOT be sent (${emailErr || 'unknown error'})`));
        console.error('[REJECT_EMAIL_FAILED]', emailErr);
      }
    } catch(e) {
      onNotify(t('Erreur', 'Error'));
    }
  };

  const handleDraftRejectionAdmin = async () => {
    if (!rejectModal) return;
    setIsDraftingRejectionAdmin(true);
    try {
      const res = await fetch('/api/gemini/analyze-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft-rejection', projectName: rejectModal.name, category: rejectModal.category, keyPoints: rejectReasonText, language }),
      });
      const data = await res.json();
      if (data.draft) setRejectReasonText(data.draft);
    } catch { /* la zone de texte reste editable manuellement */ }
    finally { setIsDraftingRejectionAdmin(false); }
  };

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      onNotify(t(`USER ROLE UPDATED TO ${role}`, `RÔLE UTILISATEUR MIS À JOUR EN ${role}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${uid}`);
    }
  };


  // Approuver une pré-inscription — envoie un email avec lien d'accès unique
  const handleApproveAccess = async (reg: any) => {
    const email = (reg.email || reg.Email || '').trim();
    const name = (reg.name || reg.Name || reg.firstName || email.split('@')[0] || 'Member').trim();

    if (!email) {
      onNotify(t('Missing email', 'Email manquant pour cette inscription'));
      return;
    }

    // Feedback immédiat
    onNotify(t(`Processing approval for ${name}...`, `Approbation de ${name} en cours...`));

    // On emet une vraie cle d'acces (meme systeme access_keys que la
    // pre-inscription automatique et que l'ecran de validation) au lieu de
    // l'ancien "access_tokens" qui n'etait jamais inclus dans le lien ni
    // verifie nulle part (code mort — source du "ca marche 1 fois sur 10").
    const accessKey = generateAccessKey();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 an
    const baseUrl = 'https://linkyourart.com';

    try {
      await addDoc(collection(db, 'access_keys'), {
        key: accessKey, email, name,
        preRegId: reg.id || '',
        tier: 'ADMIN_APPROVED',
        status: 'ACTIVE',
        expiresAt,
        createdAt: serverTimestamp(),
      });
    } catch(e: any) {
      console.warn('Access key write failed (continuing):', e?.code, e?.message);
    }

    // ÉTAPE 2 — Marquer approuvé (non-bloquant)
    if (reg.id && !String(reg.id).startsWith('local_')) {
      try {
        await updateDoc(doc(db, 'pre_registrations', reg.id), {
          status: 'APPROVED', approvedAt: serverTimestamp(), accessKey,
        });
      } catch(e: any) {
        console.warn('Status update failed:', e?.code, e?.message);
      }
    }

    // ÉTAPE 3 — Envoyer email d'approbation LYA
    try {
      const lang = reg.lang || reg.language || 'FR';
      const signupLink = `${baseUrl}?signup=1&email=${encodeURIComponent(email)}&code=${encodeURIComponent(accessKey)}`;
      const resp = await fetch('/api/email/pre-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          name,
          email,
          lang,
          type: 'approval',
          signupLink,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        console.log('[APPROVE EMAIL SENT]', email, 'via', data.method);
      } else {
        console.warn('[APPROVE EMAIL FAILED]', data.error);
        onNotify(t(`⚠ Email failed: ${data.error || 'SMTP error'}`, `⚠ Email échoué: ${data.error || 'Erreur SMTP'}`));
      }
    } catch(e: any) {
      console.warn('Email fetch failed:', e);
    }

    // SUCCÈS — toujours marquer comme approuvé localement
    setPreRegistrations(prev => prev.map(p => p.id === reg.id ? { ...p, status: 'APPROVED' } : p));
    onNotify(t(
      `✦ ${name} approved — access code: ${accessKey}`,
      `✦ ${name} approuvé — code d'accès: ${accessKey}`
    ));
  };

  const handleDeleteUser = async (uid: string, displayName: string) => {
    if (!window.confirm(t(
      `⚠ Supprimer définitivement le profil de ${displayName} ? Cette action est irréversible.`,
      `⚠ Permanently delete ${displayName}'s profile? This action is irreversible.`
    ))) return;
    try {
      // Supprimer le document Firestore
      await deleteDoc(doc(db, 'users', uid));
      // Supprimer watchlist
      await deleteDoc(doc(db, 'watchlists', uid)).catch(() => {});
      // Supprimer swipe_likes
      await deleteDoc(doc(db, 'swipe_likes', uid)).catch(() => {});
      // Mettre à jour le state local
      setUsers(prev => prev.filter(u => u.uid !== uid));
      onNotify(t(`✦ Profil de ${displayName} supprimé`, `✦ ${displayName}'s profile deleted`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.DELETE, `users/${uid}`);
    }
  };

  // Reset complet de la base pour un vrai lancement propre, comme demande.
  // Ne conserve QUE le document users du compte admin de test. Vide toutes
  // les autres collections liees aux comptes/inscriptions, et remet le
  // compteur de pre-inscriptions a zero pour que le tout premier vrai
  // utilisateur devienne reellement le Founding Pioneer #1.
  const ADMIN_KEEP_EMAIL = 'linkyourart@gmail.com';
  const COLLECTIONS_TO_WIPE_ENTIRELY = [
    'pre_registrations', 'access_keys', 'messages',
    'enterprise_requests', 'verification_requests', 'projects_pending',
  ];
  // Supprime tous les documents d'une collection par lots de 400 (marge de
  // securite sous la limite Firestore de 500 operations par batch), en
  // renvoyant le nombre total supprime.
  const wipeCollection = async (name: string): Promise<number> => {
    let total = 0;
    while (true) {
      const snap = await getDocs(query(collection(db, name), limit(400)));
      if (snap.empty) break;
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      total += snap.docs.length;
      if (snap.docs.length < 400) break;
    }
    return total;
  };

  const handleFullDatabaseReset = async () => {
    const confirmed = window.confirm(t(
      `⚠ FULL DATABASE RESET. Deletes ALL accounts (except ${ADMIN_KEEP_EMAIL}), all pre-registrations, access keys, messages, enterprise/verification requests, and resets the counter to zero. This action is IRREVERSIBLE. Continue?`,
      `⚠ RESET COMPLET DE LA BASE. Supprime TOUS les comptes (sauf ${ADMIN_KEEP_EMAIL}), toutes les pré-inscriptions, codes d'accès, messages, demandes entreprise/vérification, et remet le compteur à zéro. Action IRRÉVERSIBLE. Continuer ?`
    ));
    if (!confirmed) return;
    onNotify(t('Reset in progress, do not close this page…', 'Reset en cours, ne fermez pas cette page…'));

    const summary: string[] = [];

    // 1) Comptes utilisateurs (garde uniquement l'admin de test). Envois
    // groupes par lots de 150 (3 documents par utilisateur: users +
    // watchlists + swipe_likes, soit 450 operations par lot, sous la limite
    // Firestore de 500) au lieu d'un await sequentiel par utilisateur - avec
    // ~500 comptes, la version precedente faisait jusqu'a 1500 allers-retours
    // reseau un par un, ce qui donnait l'impression que "le compteur ne
    // bouge presque pas" alors qu'elle avancait juste tres lentement.
    const toDelete = users.filter(u => (u.email || '').toLowerCase() !== ADMIN_KEEP_EMAIL);
    let usersDone = 0;
    for (let i = 0; i < toDelete.length; i += 150) {
      const chunk = toDelete.slice(i, i + 150);
      try {
        const batch = writeBatch(db);
        chunk.forEach(u => {
          batch.delete(doc(db, 'users', u.uid!));
          batch.delete(doc(db, 'watchlists', u.uid!));
          batch.delete(doc(db, 'swipe_likes', u.uid!));
        });
        await batch.commit();
        usersDone += chunk.length;
      } catch (err) {
        console.warn('[FULL_RESET] user batch failed', err);
      }
    }
    setUsers(prev => prev.filter(u => (u.email || '').toLowerCase() === ADMIN_KEEP_EMAIL));
    summary.push(`${usersDone} comptes`);

    // 2) Toutes les autres collections liees aux inscriptions/echanges
    for (const name of COLLECTIONS_TO_WIPE_ENTIRELY) {
      try {
        const n = await wipeCollection(name);
        summary.push(`${n} ${name}`);
      } catch (err) {
        console.warn('[FULL_RESET] collection failed', name, err);
      }
    }

    // 3) Remise a zero du compteur de pre-inscriptions. Les regles Firestore
    // n'autorisent qu'un increment strict de +1 sur ce document (protection
    // anti-triche), donc un setDoc a count:0 serait refuse. On supprime le
    // document a la place (l'admin y est autorise) — il sera recree
    // naturellement a la prochaine pre-inscription, en repartant de zero.
    try {
      await deleteDoc(doc(db, 'public_stats', 'pre_registrations'));
      summary.push('compteur remis à zéro');
    } catch (err) {
      console.warn('[FULL_RESET] counter reset failed', err);
    }

    // 4) Local state deja loade ailleurs (pre-inscriptions/soumissions dans
    // l'onglet Engagement) — force un re-fetch propre au lieu de patcher
    // localement chaque state pour eviter tout residu affiche a l'ecran.
    setPreRegistrations([]);
    setContactRequests([]);

    onNotify(t(`✦ Database reset: ${summary.join(', ')}.`, `✦ Base réinitialisée: ${summary.join(', ')}.`));
  };

  const handleBanUser = async (uid: string, displayName: string, currentBan: boolean) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { banned: !currentBan, bannedAt: !currentBan ? new Date().toISOString() : null });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, banned: !currentBan } as any : u));
      onNotify(!currentBan
        ? t(`✦ ${displayName} suspendu`, `✦ ${displayName} suspended`)
        : t(`✦ ${displayName} réactivé`, `✦ ${displayName} reactivated`)
      );
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, status: string) => {
    try {
      const projectRef = doc(db, 'contracts', projectId);
      await setDoc(projectRef, { 
        status,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      onNotify(t(`PROJECT STATUS UPDATED TO ${status}`, `STATUT DU PROJET MIS À JOUR EN ${status}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `contracts/${projectId}`);
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    try {
      const projectRef = doc(db, 'contracts', editingProject.id);
      
      const basePrice = 50.00;
      const computedUnitVal = basePrice;
      
      await setDoc(projectRef, {
        name: editingProject.name,
        category: editingProject.category || 'Fine Art',
        growth: parseFloat(editingProject.growth || 0),
        unitValue: computedUnitVal,
        scoreAlgo: parseInt(editingProject.scoreAlgo || 700),
        scorePro: parseInt(editingProject.scorePro || 700),
        scoreLYA: parseInt(editingProject.scoreLYA || 700),
        status: editingProject.status || 'LIVE',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      onNotify(t('PROJECT UPDATED SUCCESSFULLY', 'PROJET MIS À JOUR AVEC SUCCÈS'));
      setEditingProject(null);
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `contracts/${editingProject.id}`);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const projectRef = doc(db, 'contracts', projectId);
      await deleteDoc(projectRef);
      onNotify(t('PROJECT PERMANENTLY REMOVED', 'PROJET DÉFINITIVEMENT SUPPRIMÉ'));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err as any, OperationType.DELETE, `contracts/${projectId}`);
    }
  };

  const handleTogglePro = async (uid: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { isPro: !currentStatus });
      onNotify(t(`PRO STATUS ${!currentStatus ? 'ENABLED' : 'DISABLED'}`, `STATUT PRO ${!currentStatus ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const displayName = u.displayName || '';
    const email = u.email || '';
    const matchSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole || (filterRole === 'PRO' && u.isPro);
    return matchSearch && matchRole;
  });



  const renderUserModal = () => (
    <AnimatePresence mode="sync">
      {viewingUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingUser(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-surface-low p-8 rounded-[2.5rem] border border-white/10 w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{viewingUser.displayName}</h2>
                  <p className="text-sm opacity-50 font-mono text-primary-cyan">{viewingUser.uid}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${viewingUser.isPro ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>
                  {viewingUser.isPro ? 'PRO HUB VERIFIED' : 'BASIC ACCOUNT'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] opacity-40 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                      <Mail size={12} /> Contact Information
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{viewingUser.email}</div>
                    <div className="text-[10px] font-mono opacity-50">{viewingUser.country || 'No Location Data'}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 whitespace-nowrap">
                    <span className="text-xs opacity-30 uppercase font-bold mr-1.5 font-mono">REGISTRY HASH STAMP:</span>
                    <span className="text-xs font-mono font-bold text-primary-cyan uppercase">0x{viewingUser.uid ? viewingUser.uid.substring(0, 10).toUpperCase() : 'E84D2'}...A3F0</span>
                  </div>
                </div>
                <div className="p-5 bg-white/5 border border-white/5 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] opacity-40 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                      <Shield size={12} /> Access Control
                    </div>
                    <div className="text-sm font-black text-accent-gold uppercase tracking-widest">{viewingUser.role}</div>
                    <div className="text-[10px] opacity-50">Member since {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-xs opacity-30 uppercase font-bold font-mono mr-1.5">IDENTITY STATUS:</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-3 py-0.5 rounded-sm uppercase font-mono font-bold">TIER 2 VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8 p-6 bg-surface-dim border border-white/5 rounded-lg">
                <div className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-4">Platform Usage Metrics</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs opacity-40 uppercase font-bold mb-1">Scans</div>
                    <div className="text-lg font-black text-white">{viewingUser.usageStats?.scan || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-40 uppercase font-bold mb-1">Swipes</div>
                    <div className="text-lg font-black text-white">{viewingUser.usageStats?.swipe || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-40 uppercase font-bold mb-1">Compares</div>
                    <div className="text-lg font-black text-white">{viewingUser.usageStats?.compare || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-40 uppercase font-bold mb-1">LYA Score</div>
                    <div className="text-lg font-black text-accent-gold">{viewingUser.lyaScore || 750}</div>
                  </div>
                </div>
              </div>

              {viewingUser.bio && (
                <div className="mb-8 p-4 bg-white/5 rounded-xl text-xs text-on-surface-variant leading-relaxed italic">
                  "{viewingUser.bio}"
                </div>
              )}

              {/* Professional Dossier if exists */}
              {verificationRequests.find(r => r.userId === viewingUser.uid) && (
                <div className="mb-8 p-6 bg-primary-cyan/5 border border-primary-cyan/10 rounded-lg">
                  <div className="text-[10px] text-primary-cyan uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                    <FileCheck size={14} /> Professional Dossier Details
                  </div>
                  {verificationRequests.filter(r => r.userId === viewingUser.uid).map(req => (
                    <div key={req.id} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs opacity-40 uppercase font-bold mb-1">Firm</div>
                          <div className="text-xs font-bold text-white uppercase">{req.firm || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs opacity-40 uppercase font-bold mb-1">Registration ID</div>
                          <div className="text-xs font-bold text-white uppercase">{req.registrationId || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs opacity-40 uppercase font-bold mb-1">Jurisdiction / IP Authority</div>
                          <div className="text-xs font-bold text-white uppercase">{req.authority || 'N/A'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs opacity-40 uppercase font-bold mb-2">Submitted Documents</div>
                        <div className="flex flex-wrap gap-2">
                          {req.documents?.map((doc: any, i: number) => (
                            <a 
                              key={i} 
                              href={doc.url} 
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-[10px] text-white hover:bg-white/10 transition-all"
                            >
                              <FileText size={12} className="text-primary-cyan" />
                              <span className="truncate max-w-[120px]">{doc.name}</span>
                              <Download size={10} className="opacity-40" />
                            </a>
                          ))}
                        </div>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => handleApproveVerification(req.id, req.userId)}
                            className="flex-1 py-2 bg-emerald-400 text-surface-dim font-black uppercase text-[10px] rounded-lg"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectVerification(req.id, req.userId)}
                            className="flex-1 py-2 bg-red-400 text-surface-dim font-black uppercase text-[10px] rounded-lg"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                  onClick={() => handleTogglePro(viewingUser.uid!, !!viewingUser.isPro)} 
                  className="flex-1 py-4 bg-accent-gold text-surface-dim font-black uppercase text-xs rounded-xl hover:scale-[1.02] transition-all active:scale-95"
                 >
                    {viewingUser.isPro ? t('REVOKE PRO ACCESS', 'RÉVOQUER ACCÈS PRO') : t('GRANT PRO ACCESS', 'ACCORDER ACCÈS PRO')}
                 </button>
                 <button 
                  onClick={() => setViewingUser(null)} 
                  className="px-8 py-4 border border-white/10 text-white font-black uppercase text-xs rounded-xl hover:bg-white/5 transition-all"
                 >
                    {t('CLOSE', 'FERMER')}
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">

      <div className="flex items-center justify-between gap-4 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-rose-400">{t('Full database reset', 'Reset complet de la base')}</div>
          <div className="text-[10px] text-on-surface-variant/50 mt-1">{t(`Deletes everything (accounts, pre-registrations, keys, messages) except ${ADMIN_KEEP_EMAIL}, and resets the counter to zero.`, `Supprime tout (comptes, pré-inscriptions, codes, messages) sauf ${ADMIN_KEEP_EMAIL}, et remet le compteur à zéro.`)}</div>
        </div>
        <button
          onClick={handleFullDatabaseReset}
          className="shrink-0 px-4 py-2.5 bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-500/25 transition-all"
        >
          {t('Reset everything', 'Tout réinitialiser')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" size={16} />
          <input 
            placeholder={t('Search by name, email or UID...', 'Recherche par nom, email ou UID...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setUsersPage(1); }}
            className="w-full bg-surface-low border border-white/10 p-4 pl-12 text-xs font-mono  outline-none focus:border-accent-gold rounded-xl transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterRole} 
            onChange={(e) => { setFilterRole(e.target.value); setUsersPage(1); }}
            className="bg-surface-low border border-white/10 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent-gold rounded-xl"
          >
            <option value="ALL">ALL ROLES</option>
            <option value={UserRole.CREATOR}>CREATORS</option>
            <option value={UserRole.PATRON}>PATRONS</option>
            <option value={UserRole.PROFESSIONAL}>PROFESSIONALS</option>
            <option value="PRO">PRO HUB ONLY</option>
          </select>
        </div>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-black text-white/30 uppercase tracking-widest">
          {filteredUsers.length} {t('users found', 'utilisateurs trouvés')} · {t('Page', 'Page')} {usersPage}/{Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
            disabled={usersPage === 1}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            ← {t('Prev', 'Préc.')}
          </button>
          <span className="text-xs font-mono text-white/30 px-3">
            {(usersPage - 1) * USERS_PER_PAGE + 1}–{Math.min(usersPage * USERS_PER_PAGE, filteredUsers.length)}
          </span>
          <button
            onClick={() => setUsersPage(p => Math.min(Math.ceil(filteredUsers.length / USERS_PER_PAGE), p + 1))}
            disabled={usersPage >= Math.ceil(filteredUsers.length / USERS_PER_PAGE)}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            {t('Next', 'Suiv.')} →
          </button>
        </div>
      </div>

      <div className="bg-surface-low border border-white/5 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-dim uppercase font-black text-on-surface-variant/60">
              <tr>
                <th className="p-6 tracking-[0.2em]">{t('User Identity', 'Identité')}</th>
                <th className="p-6 tracking-[0.2em]">{t('Classification', 'Classification')}</th>
                <th className="p-6 tracking-[0.2em]">{t('Hub Status', 'Statut Hub')}</th>
                <th className="p-6 tracking-[0.2em] text-right">{t('Controls', 'Contrôles')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE).map(u => (
                <tr 
                  key={u.uid} 
                  className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group" 
                  onClick={() => setViewingUser(u)}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-black text-primary-cyan border border-white/5 group-hover:border-primary-cyan/30 transition-all">
                        {u.displayName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-black text-white text-sm uppercase tracking-tight group-hover:text-primary-cyan transition-colors">{u.displayName}</div>
                        <div className="opacity-40 font-mono text-[10px] mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-accent-pink tracking-widest">{u.role}</span>
                      <span className="text-xs opacity-40 uppercase font-bold">{u.country || 'GLOBAL'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    {u.status === 'PENDING_APPROVAL' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest bg-amber-400/10 text-amber-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {t('PENDING', 'EN ATTENTE')}
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest ${u.isPro ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-on-surface-variant'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.isPro ? 'bg-emerald-400 animate-pulse' : 'bg-on-surface-variant'}`} />
                        {u.isPro ? 'PRO HUB' : 'BASIC'}
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {u.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, 'users', u.uid!), { status: 'APPROVED' });
                              onNotify(t(`✦ ${u.displayName} approved — account unlocked`, `✦ ${u.displayName} approuvé — compte débloqué`));
                            } catch (e) { onNotify(t('Error', 'Erreur')); }
                          }}
                          className="p-2 hover:bg-emerald-400/10 rounded-lg text-emerald-400 transition-all"
                          title={t('Approve account', 'Approuver le compte')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        </button>
                      )}
                      <button 
                        onClick={() => handleTogglePro(u.uid!, !!u.isPro)} 
                        className="p-2 hover:bg-accent-gold/10 rounded-lg text-accent-gold transition-all"
                        title={u.isPro ? t('Revoke Pro','Révoquer Pro') : t('Grant Pro','Passer Pro')}
                      >
                        <ShieldAlert size={16} />
                      </button>
                      <button 
                        onClick={() => setViewingUser(u)}
                        className="p-2 hover:bg-primary-cyan/10 rounded-lg text-primary-cyan transition-all"
                        title={t('View profile','Voir le profil')}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleBanUser(u.uid!, u.displayName || 'Utilisateur', !!(u as any).banned)}
                        className={`p-2 rounded-lg transition-all ${(u as any).banned ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-accent-gold hover:bg-accent-gold/10'}`}
                        title={(u as any).banned ? t('Reactivate','Réactiver') : t('Suspend','Suspendre')}
                      >
                        {(u as any).banned
                          ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        }
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.uid!, u.displayName || 'Utilisateur')}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/60 hover:text-rose-500 transition-all"
                        title={t('Delete profile','Supprimer le profil')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom pagination shortcut */}
      {filteredUsers.length > USERS_PER_PAGE && (
        <div className="flex justify-center gap-3 pt-4">
          {Array.from({ length: Math.ceil(filteredUsers.length / USERS_PER_PAGE) }, (_, i) => i + 1).slice(0, 10).map(p => (
            <button
              key={p}
              onClick={() => setUsersPage(p)}
              className={`w-8 h-8 text-[10px] font-black border transition-all ${
                usersPage === p
                  ? 'bg-primary-cyan text-surface-dim border-primary-cyan'
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
          {Math.ceil(filteredUsers.length / USERS_PER_PAGE) > 10 && (
            <span className="text-[10px] text-white/20 font-black self-center">…{Math.ceil(filteredUsers.length / USERS_PER_PAGE)}</span>
          )}
        </div>
      )}
    </div>
  );

  const renderProjectsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projectsList.map(p => (
        <div key={p.id} className="bg-surface-low border border-white/5 p-6 rounded-[2rem] hover:border-accent-gold/40 transition-all group relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
          
          <img src={getSafeImageUrl(p.image, p.category)} onError={handleImageError(p.category)} className="w-full h-40 object-cover rounded-lg mb-6 group-hover:scale-[1.02] transition-transform shadow-lg" />
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-base font-black text-white uppercase mb-1 truncate max-w-[180px]">{p.name}</h4>
              <span className="text-xs font-black text-accent-gold px-3 py-0.5 bg-accent-gold/10 rounded-full tracking-widest">{p.category}</span>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-lg ${p.growth >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {p.growth >= 0 ? <TrendingUp size={12}/> : <ShieldAlert size={12}/>}
              {p.growth}%
            </div>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[10px] uppercase font-black opacity-40 mb-1 tracking-widest">{t('STATUS', 'STATUT')}</div>
              <div className="text-xl font-black text-white">{p.status}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-black opacity-40 mb-1 tracking-widest">{t('LYA SCORE', 'SCORE LYA')}</div>
              <div className="text-xl font-black text-primary-cyan">{p.scoreLYA || p.totalScore || 750}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => setEditingProject(p)} 
              className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-xl"
            >
              <Settings size={12} /> {t('EDIT', 'ÉDITER')}
            </button>
            <button 
              onClick={() => handleUpdateProjectStatus(p.id, p.status === 'LIVE' ? 'PAUSED' : 'LIVE')} 
              className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl border ${
                p.status === 'LIVE' 
                  ? 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white' 
                  : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              {p.status === 'LIVE' ? <Lock size={12}/> : <Zap size={12}/>}
              {p.status === 'LIVE' ? t('HALT', 'ARRÊT') : t('START', 'DÉPART')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-6">
      <div className="bg-surface-low border border-white/5 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
             <Shield className="text-primary-cyan" /> {t('Verification Requests', 'Demandes de VÉRIFICATION')}
          </h3>
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
            {verificationRequests.filter(r => r.status === 'PENDING').length} PENDING
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-dim uppercase font-black text-on-surface-variant/60">
              <tr>
                <th className="p-6 tracking-[0.2em]">{t('Applicant', 'Candidat')}</th>
                <th className="p-6 tracking-[0.2em]">{t('Dossier', 'Dossier')}</th>
                <th className="p-6 tracking-[0.2em]">{t('Timestamp', 'Horodatage')}</th>
                <th className="p-6 tracking-[0.2em] text-right">{t('Decision', 'Décision')}</th>
              </tr>
            </thead>
            <tbody>
              {verificationRequests.map(req => (
                <React.Fragment key={req.id}>
                  <tr className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors group ${expandedVerifId === req.id ? 'bg-white/[0.01]' : ''}`}>
                    <td className="p-6">
                      <div>
                        <div className="font-black text-white uppercase flex items-center gap-2">
                          {req.userDisplayName || req.formData?.name || '—'}
                          <span className={`text-[7.5px] font-mono font-black tracking-widest px-3 py-0.5 rounded-sm shrink-0 ${
                            req.tier === 'elite' ? 'bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/20' :
                            req.tier === 'expert' ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20' :
                            'bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20'
                          }`}>
                            {req.tier ? req.tier.toUpperCase() : 'MARKET EXPERT'}
                          </span>
                        </div>
                        <div className="opacity-40 font-mono text-xs mt-1">{req.userEmail}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 text-left">
                        <div className="font-bold text-accent-gold uppercase">{req.firm || req.organization || 'Individual Entity'}</div>
                        <div className="text-[10px] opacity-50 flex items-center gap-1">
                           <FileText size={10} className="text-primary-cyan" /> {req.documents?.length || 0} {t('SEALED_FILES', 'Documents de Clearance')}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] font-mono opacity-50">
                        {req.timestamp?.seconds ? new Date(req.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {req.status === 'PENDING' ? (
                          <>
                            <button 
                              onClick={() => handleApproveVerification(req.id, req.userId)}
                              className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded font-black uppercase text-xs hover:bg-emerald-400 hover:text-surface-dim transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectVerification(req.id, req.userId)}
                              className="px-3 py-1.5 bg-red-400/10 text-red-400 border border-red-400/20 rounded font-black uppercase text-xs hover:bg-red-400 hover:text-surface-dim transition-all"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded inline-block ${req.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-400/5' : 'text-red-400 bg-red-400/5'}`}>
                            {req.status}
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            const user = users.find(u => u.uid === req.userId);
                            if (user) setViewingUser(user);
                          }}
                          title={t('View User Profile', 'Voir Profil Utilisateur')}
                          className="p-1.5 bg-white/5 border border-white/10 rounded text-on-surface-variant hover:text-white"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => setExpandedVerifId(expandedVerifId === req.id ? null : req.id)}
                          className={`px-3 py-1.5 border rounded font-black uppercase text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                            expandedVerifId === req.id 
                              ? 'bg-primary-cyan/20 text-primary-cyan border-primary-cyan/40' 
                              : 'bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:border-primary-cyan/30'
                          }`}
                        >
                          <Shield size={11} /> {expandedVerifId === req.id ? t('CLOSE', 'FERMER') : t('AUDIT', 'AUDIT')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Audit Card Row */}
                  {expandedVerifId === req.id && (
                    <tr className="bg-white/[0.01] border-l-2 border-primary-cyan animate-in fade-in slide-in-from-top-1 duration-300">
                      <td colSpan={4} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left bg-surface-low border border-white/5 p-8 rounded-lg">
                          
                          {/* Col 1: Identity and Affiliation */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">📋 {t('DOSSIER METADATA', 'MÉTA-DONNÉES DU DOSSIER')}</span>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('FULL IDENTITY', 'IDENTITÉ COMPLÈTE')}</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{req.formData?.name || req.userDisplayName || '—'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('ORGANIZATION / FIRM', 'ENTITÉ EXPLOITANTE')}</span>
                                <span className="text-xs font-bold text-accent-gold mt-0.5 block">{req.formData?.organization || req.firm || '—'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('OPERATIONAL ROLE', 'RÔLE OPÉRATIONNEL')}</span>
                                <span className="text-xs font-medium text-white/80 mt-0.5 block">{req.formData?.role || '—'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('EMAIL', 'EMAIL')}</span>
                                <a href={req.userEmail ? `mailto:${req.userEmail}` : '#'} className="text-xs font-semibold text-primary-cyan underline hover:text-white mt-0.5 block break-all">
                                  {req.userEmail || req.formData?.email || '—'}
                                </a>
                              </div>
                              {req.selectedSector && (
                                <div>
                                  <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('SECTOR', 'SECTEUR')}</span>
                                  <span className="text-xs font-medium text-white/80 mt-0.5 block uppercase">{req.selectedSector}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Col 2: Submitted notes — pas de vérification automatisée existante,
                              donc on affiche ce qui a été réellement soumis plutôt qu'une
                              checklist fictive de conformité. */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">📝 {t('SUBMITTED BY APPLICANT', 'FOURNI PAR LE CANDIDAT')}</span>
                            <div className="space-y-3">
                              {req.formData?.website && (
                                <div>
                                  <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('WEBSITE', 'SITE WEB')}</span>
                                  <a href={req.formData.website} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-cyan underline hover:text-white mt-0.5 block break-all">
                                    {req.formData.website}
                                  </a>
                                </div>
                              )}
                              {req.formData?.notes ? (
                                <div>
                                  <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('NOTES', 'NOTES')}</span>
                                  <span className="text-xs font-medium text-white/70 mt-0.5 block leading-relaxed">{req.formData.notes}</span>
                                </div>
                              ) : (
                                <p className="text-[10px] text-white/25 italic">{t('No additional notes provided.', 'Aucune note complémentaire fournie.')}</p>
                              )}
                            </div>
                          </div>

                          {/* Col 3: Documents réellement fournis — plus de contenu fabriqué */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">📎 {t('DOCUMENTS PROVIDED', 'DOCUMENTS FOURNIS')}</span>
                            {req.documents && req.documents.length > 0 ? (
                              <div className="space-y-3">
                                {req.documents.map((doc: any, dIdx: number) => (
                                  <a
                                    key={dIdx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary-cyan/30 transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <Database size={16} className="text-primary-cyan group-hover:scale-110 transition-transform shrink-0" />
                                      <div className="min-w-0">
                                        <span className="text-[11px] font-black text-white block group-hover:text-primary-cyan transition-colors truncate">{doc.name}</span>
                                        <span className="text-xs font-mono text-white/30 block mt-0.5">{doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : ''}</span>
                                      </div>
                                    </div>
                                    <Download size={13} className="text-white/30 group-hover:text-primary-cyan shrink-0" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-white/25 italic">{t('No documents were submitted with this application.', 'Aucun document n\'a été fourni avec cette candidature.')}</p>
                            )}
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {verificationRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-on-surface-variant italic opacity-50">
                    No verification requests in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  const renderEngagementTab = () => (
    <div className="space-y-8">

      {/* Pre-Registrations */}
      <div className="bg-surface-low border border-white/5 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-primary-cyan" /> {t('PRE-REGISTRATION PIPELINE', 'PIPELINE PRÉ-INSCRIPTIONS')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-dim uppercase font-black text-on-surface-variant/60">
              <tr>
                <th className="p-6">{t('User', 'Utilisateur')}</th>
                <th className="p-6">{t('Category', 'Catégorie')}</th>
                <th className="p-6">{t('Date', 'Date')}</th>
                <th className="p-6 text-right">{t('Action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {preRegistrations.map(r => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-6">
                    <div className="font-black text-white uppercase">{r.name}</div>
                    <div className="opacity-40 font-mono text-xs">{r.email}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-primary-cyan/10 text-primary-cyan rounded text-xs font-black uppercase">{r.category}</span>
                  </td>
                  <td className="p-6 opacity-40 font-mono">
                    {r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-6 text-right">
                    {(r as any).status === 'APPROVED' ? (
                      <span className="px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase">
                        ✓ {t('Approved', 'Approuvé')}
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveAccess(r)}
                          className="px-3 py-1.5 bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-black rounded-lg hover:bg-emerald-400/25 transition-all uppercase"
                        >
                          ✦ {t('Approve', 'Approuver')}
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(t(`Supprimer la pré-inscription de ${r.name} ?`, `Delete pre-registration of ${r.name}?`))) return;
                            try {
                              if (r.id && !r.id.startsWith('local_')) await deleteDoc(doc(db, 'pre_registrations', r.id));
                              const local = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
                              localStorage.setItem('lya_local_pre_registrations', JSON.stringify(local.filter((p: any) => p.id !== r.id && p.email !== r.email)));
                              setPreRegistrations(prev => prev.filter(p => p.id !== r.id));
                              onNotify(t(`✦ ${r.name} supprimé`, `✦ ${r.name} deleted`));
                            } catch (e: any) { onNotify(t('Erreur', 'Error')); }
                          }}
                          className="p-1.5 text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demandes de contact Mecene -> Createur */}
      <div className="bg-surface-low border border-white/5 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-[#7E1CF1]" /> {t('CREATOR CONTACT REQUESTS', 'DEMANDES DE CONTACT CRÉATEUR')}
          </h3>
          <p className="text-xs text-on-surface-variant/50 mt-1">{t('Sent from a patron\'s dashboard — forward to the creator within 24-48h.', "Envoyees depuis le dashboard d'un mecene — a transmettre au createur sous 24-48h.")}</p>
        </div>
        {contactRequests.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant/40 text-xs uppercase font-bold tracking-widest">
            {t('No pending requests', 'Aucune demande en attente')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-dim uppercase font-black text-on-surface-variant/60">
                <tr>
                  <th className="p-6">{t('Patron', 'Mécène')}</th>
                  <th className="p-6">{t('Project', 'Projet')}</th>
                  <th className="p-6">{t('Date', 'Date')}</th>
                  <th className="p-6">{t('Status', 'Statut')}</th>
                  <th className="p-6 text-right">{t('Action', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {contactRequests.map(r => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="p-6">
                      <div className="font-black text-white uppercase">{r.fromName || '—'}</div>
                      <div className="opacity-40 font-mono text-xs">{r.fromEmail}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-[#7E1CF1]/10 text-[#B98CF0] rounded text-xs font-black uppercase">{r.projectName}</span>
                    </td>
                    <td className="p-6 opacity-40 font-mono">
                      {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-6">
                      {r.status === 'HANDLED' ? (
                        <span className="px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase">{t('Handled', 'Traité')}</span>
                      ) : (
                        <span className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-black rounded-lg uppercase">{t('Pending', 'En attente')}</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {r.status !== 'HANDLED' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, 'messages', r.id), { status: 'HANDLED', handledAt: serverTimestamp() });
                              onNotify(t('✦ Marked as handled', '✦ Marqué comme traité'));
                            } catch { onNotify(t('Error', 'Erreur')); }
                          }}
                          className="px-3 py-1.5 bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-black rounded-lg hover:bg-emerald-400/25 transition-all uppercase"
                        >
                          ✦ {t('Mark as handled', 'Marquer traité')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <RefreshCw size={40} className="text-accent-gold animate-spin mb-6" />
        <h3 className="text-xl font-headline font-black text-white uppercase tracking-tighter">{t('SYNCING TERMINAL...', 'SYNCHRONISATION DU TERMINAL...')}</h3>
        <p className="text-on-surface-variant text-xs opacity-60 mt-2">{t('Establishing secure connection to encrypted registries.', 'Établissement d\'une connexion sécurisée aux registres chiffrés.')}</p>
      </div>
    );
  }

  // Barriere reelle, pas seulement l'absence de lien dans le menu: avant ce
  // fix, App.tsx affichait ce composant des que currentView valait
  // 'ADMIN_PANEL', sans jamais verifier le role de l'utilisateur - seul le
  // lien du menu etait cache aux non-admins, pas la page elle-meme. Placee
  // apres tous les hooks (comme le guard de chargement juste au-dessus)
  // pour respecter les regles de React.
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-rose-500/10 rounded-lg blur-xl" />
            <div className="relative w-20 h-20 bg-surface-low border border-rose-500/20 rounded-lg flex items-center justify-center">
              <Shield size={32} className="text-rose-400" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">{t('Access denied', 'Accès refusé')}</p>
            <h2 className="text-2xl font-black text-white">{t('This area is reserved for administrators', 'Cette zone est réservée aux administrateurs')}</h2>
          </div>
          <button
            onClick={() => onViewChange('DASHBOARD')}
            className="px-8 py-3 bg-white/5 border border-white/10 text-white/70 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            {t('Back to dashboard', 'Retour au tableau de bord')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        category="SYSTEM"
        titleWhite={<span style={{ textTransform: 'uppercase' }}>HUB</span>} 
        titleAccent="ADMIN" 
        description={t('PLATFORM OVERSIGHT AND MANAGEMENT', 'SUPERVISION ET GESTION DE LA PLATEFORME')} 
        accentColor="text-accent-gold" 
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-2">
          {[
            {id: 'users', label: t('Identity', 'Identité'), icon: <Users size={16}/>},
            {id: 'submissions', label: t('Submissions', 'Soumissions'), icon: <FileText size={16}/>, badge: pendingSubmissions.filter(s => s.status === 'PENDING_VALIDATION').length || undefined},
            {id: 'engagement', label: t('Engagement', 'Engagement'), icon: <Mail size={16}/>},
            {id: 'validation', label: t('Verifications', 'Vérifications'), icon: <Shield size={16}/>},
            {id: 'projects', label: t('Projects', 'Projets'), icon: <Activity size={16}/>},
          ].map(it => (
            <button key={it.id} onClick={() => setActiveTab(it.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === it.id ? 'bg-brand-gradient text-white shadow-xl' : 'text-on-surface-variant hover:bg-white/5'}`}>
              {it.icon} {it.label}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title={t("Total Users", "Utilisateurs")} value={preRegistrations.length} icon={<Users/>} color="gold" isCurrency={false} trend=""/>
            <StatCard title={t("Platform TVL", "Volume Plateforme")} value={0} icon={<TrendingUp/>} color="cyan" trend=""/>
            <StatCard title={t("LYA Revenue", "Revenus LYA")} value={0} icon={<Zap/>} color="pink" trend=""/>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'users' && <motion.div key="u" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderUsersTab()}</motion.div>}
            {activeTab === 'submissions' && (
              <motion.div key="sub" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Project submissions', 'Soumissions de projets')}</h3>
                      <p className="text-xs text-on-surface-variant/40 mt-1">{t('Validate or reject each project before publishing on the LYA Registry', 'Validez ou refusez chaque projet avant publication sur le Registre LYA')}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs font-black text-violet-500">{pendingSubmissions.filter(s => s.status === 'PENDING_VALIDATION').length} {t('pending', 'en attente')}</span>
                      <span className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-xs font-black text-emerald-400">{pendingSubmissions.filter(s => s.status === 'PUBLISHED').length} {t('published', 'publiés')}</span>
                    </div>
                  </div>

                  {/* File d'attente reelle: seulement les projets encore en
                      attente. Les projets traites (publies/refuses)
                      disparaissent naturellement d'ici et rejoignent
                      l'historique repliable plus bas - avant ce fix, tout
                      restait mele dans une seule liste sans fin, avec les
                      soumissions traitees jamais vraiment "retirees". */}
                  {(() => {
                    const pending = pendingSubmissions.filter(s => s.status === 'PENDING_VALIDATION');
                    const processed = pendingSubmissions.filter(s => s.status !== 'PENDING_VALIDATION');
                    return (
                      <>
                        {pending.length === 0 ? (
                          <div className="bg-surface-low border border-white/8 rounded-lg p-12 text-center">
                            <p className="text-on-surface-variant/40 text-sm">{t('No submissions pending', 'Aucune soumission en attente')}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pending.slice(0, pendingShown).map((sub) => (
                              <div key={sub.id} className="bg-surface-low border border-violet-500/25 rounded-lg p-5 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-violet-500/10 text-violet-500 border border-violet-500/20">
                                        {'● ' + t('En attente', 'Pending')}
                                      </span>
                                      {sub.category && <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-white/50">{sub.category}</span>}
                                    </div>
                                    <p className="text-sm font-black text-white">{sub.name || t('Projet sans titre', 'Untitled project')}</p>
                                    <p className="text-xs text-on-surface-variant/50 line-clamp-2">{sub.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/40 font-black">
                                      <span>👤 {sub.creatorName || sub.creatorEmail}</span>
                                      {sub.createdAt?.toDate && <span>🕐 {sub.createdAt.toDate().toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => { setPublishModal(sub); setPublishForm({ scoreAlgo: 750, scorePro: 750, growth: 0, rarity: 'Distinguished' }); }}
                                      className="px-4 py-2 bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-black rounded-xl hover:bg-emerald-400/25 transition-all uppercase">
                                      {t('Validate & Publish', 'Valider & Publier')}
                                    </button>
                                    <button onClick={() => { setRejectModal(sub); setRejectReasonText(''); }}
                                      className="px-4 py-2 bg-rose-400/10 border border-rose-400/20 text-rose-400 text-[10px] font-black rounded-xl hover:bg-rose-400/20 transition-all uppercase">
                                      {t('Reject', 'Refuser')}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {pending.length > pendingShown && (
                              <button onClick={() => setPendingShown(p => p + 20)} className="w-full py-3 bg-white/5 border border-white/10 text-on-surface-variant text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                                {t('See more', 'Voir plus')} ({pending.length - pendingShown} {t('remaining', 'restants')})
                              </button>
                            )}
                          </div>
                        )}

                        {processed.length > 0 && (
                          <div className="pt-2">
                            <button onClick={() => setShowHistory(v => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-on-surface-variant uppercase tracking-widest hover:bg-white/10 transition-all">
                              <span>{t('History', 'Historique')} ({processed.length})</span>
                              <span>{showHistory ? '▲' : '▼'}</span>
                            </button>
                            {showHistory && (
                              <div className="space-y-2 mt-3">
                                {processed.slice(0, historyShown).map((sub) => (
                                  <div key={sub.id} className={`bg-surface-low/60 border rounded-lg p-4 opacity-70 ${sub.status === 'PUBLISHED' ? 'border-emerald-400/20' : 'border-rose-400/20'}`}>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${sub.status === 'PUBLISHED' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'}`}>
                                        {sub.status === 'PUBLISHED' ? '✓ ' + t('Published', 'Publié') : '✗ ' + t('Rejected', 'Refusé')}
                                      </span>
                                      {sub.registryIndex && <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded text-[9px] font-black text-primary-cyan font-mono">{sub.registryIndex}</span>}
                                    </div>
                                    <p className="text-sm font-black text-white">{sub.name}</p>
                                  </div>
                                ))}
                                {processed.length > historyShown && (
                                  <button onClick={() => setHistoryShown(h => h + 10)} className="w-full py-2 bg-white/5 border border-white/10 text-on-surface-variant text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                                    {t('See more', 'Voir plus')}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Fenetre de refus avec motif, brouillon IA et envoi
                    d'email reel - avant ce fix, seule une confirmation
                    navigateur basique existait ici, sans motif reellement
                    saisi ni email envoye. */}
                {rejectModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-surface-low border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-4">
                      <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{t('Rejection reason', 'Motif du rejet')}</h3>
                      <p className="text-sm text-on-surface-variant/60">{t('The creator will receive this message by email.', 'Le créateur recevra ce message par email.')}</p>
                      <textarea
                        value={rejectReasonText} onChange={e => setRejectReasonText(e.target.value)}
                        placeholder={t('Describe why this project cannot be indexed... (or generate a draft with AI below)', 'Décrivez pourquoi ce projet ne peut pas être indexé... (ou générez un brouillon avec l\'IA ci-dessous)')}
                        rows={4}
                        className="w-full bg-surface-dim border border-white/10 text-sm p-4 rounded-xl focus:outline-none focus:border-primary-cyan resize-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleDraftRejectionAdmin}
                        disabled={isDraftingRejectionAdmin}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-cyan/10 border border-primary-cyan/25 text-primary-cyan text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-cyan/20 transition-all disabled:opacity-50"
                      >
                        <Sparkles size={14} className={isDraftingRejectionAdmin ? 'animate-pulse' : ''} />
                        {isDraftingRejectionAdmin ? t('Generating…', 'Génération…') : (rejectReasonText.trim() ? t('Rephrase with AI', 'Reformuler avec l\'IA') : t('Generate a draft with AI', 'Générer un brouillon avec l\'IA'))}
                      </button>
                      {!rejectReasonText.trim() && (
                        <p className="text-[11px] text-accent-gold/80">{t('Enter or generate a reason to enable the button below.', 'Saisissez ou générez un motif pour activer le bouton ci-dessous.')}</p>
                      )}
                      <div className="flex gap-3">
                        <button onClick={() => setRejectModal(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{t('Cancel', 'Annuler')}</button>
                        <button
                          onClick={async () => { await handleRejectSubmission(rejectModal, rejectReasonText); setRejectModal(null); }}
                          disabled={!rejectReasonText.trim()}
                          className="flex-1 py-3 bg-rose-500 text-white text-sm font-black rounded-xl hover:bg-rose-400 transition-all disabled:opacity-40">
                          {t('Confirm rejection', 'Confirmer le rejet')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal de publication */}
                {publishModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-surface-low border border-primary-cyan/30 rounded-lg p-6 max-w-md w-full space-y-5">
                      <div>
                        <p className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mb-1">{t('Validation & Publication', 'Validation & Publication')}</p>
                        <h3 className="text-sm font-black text-white">{publishModal.name}</h3>
                        <p className="text-[10px] text-on-surface-variant/40">par {publishModal.creatorName}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Score Algo /1000</label>
                            <input type="number" min="0" max="1000" value={publishForm.scoreAlgo}
                              onChange={e => setPublishForm(f => ({...f, scoreAlgo: parseInt(e.target.value)}))}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50"/>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Score Pro /1000</label>
                            <input type="number" min="0" max="1000" value={publishForm.scorePro}
                              onChange={e => setPublishForm(f => ({...f, scorePro: parseInt(e.target.value)}))}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50"/>
                          </div>
                        </div>

                        <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">LYA Score calculé</p>
                          <p className="text-2xl font-black text-[#a78bfa]">{Math.round((publishForm.scoreAlgo + publishForm.scorePro) / 2)}<span className="text-xs text-white/20">/1000</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Score Trend %</label>
                            <input type="number" min="-100" max="500" value={publishForm.growth}
                              onChange={e => setPublishForm(f => ({...f, growth: parseFloat(e.target.value)}))}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50"/>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Rarity</label>
                          <select value={publishForm.rarity} onChange={e => setPublishForm(f => ({...f, rarity: e.target.value}))}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50">
                            <option>Standard</option>
                            <option>Distinguished</option>
                            <option>Exceptional</option>
                            <option>Signature</option>
                          </select>
                        </div>

                        <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">{t('Score Trend au lancement', 'Score Trend au lancement')}</p>
                          <p className="text-xl font-black text-accent-gold">{publishForm.growth >= 0 ? '+' : ''}{publishForm.growth}%</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setPublishModal(null)}
                          className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                          {t('Cancel', 'Annuler')}
                        </button>
                        <button onClick={() => handlePublishProject(publishModal, publishForm)}
                          className="flex-1 py-3 bg-emerald-400 text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                          ✓ {t('Publish on Registry', 'Publier sur le Registre')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === 'engagement' && <motion.div key="e" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderEngagementTab()}</motion.div>}
            {activeTab === 'validation' && <motion.div key="v" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderValidationTab()}</motion.div>}
            {activeTab === 'projects' && <motion.div key="p" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderProjectsTab()}</motion.div>}
          </AnimatePresence>
        </main>
      </div>

      {renderUserModal()}

      {/* Simulated Email Modal */}

      {/* Overhauled Admin Editing Modal */}
      <AnimatePresence mode="sync">
        {editingProject && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setEditingProject(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-surface-high border border-white/10 p-8 w-full max-w-2xl relative z-10 rounded-[2.5rem] font-mono shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t('ADMIN_MODIFY_ASSET_OVERSIGHT', 'GÉSTION ADMINISTRATIVE DE L\'ACTIF')}</h2>
                  <span className="text-xs font-black text-primary-cyan uppercase tracking-widest">{t('ID:', 'REG COGNITIVE ID: ')}{editingProject.id}</span>
                </div>
                <button onClick={() => setEditingProject(null)} className="text-on-surface-variant hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Section 1: Basic Identifiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-white/45 tracking-widest block">{t('PROJECT_NAME', 'NOM DE L\'ACTIF')}</label>
                    <input 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-primary-cyan transition-colors" 
                      value={editingProject.name} 
                      onChange={e => setEditingProject({...editingProject, name: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/45 tracking-widest block mb-1.5">{t('PROJECT_CATEGORY', 'CATÉGORIE')}</label>
                    <select 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-white uppercase focus:outline-none focus:border-primary-cyan transition-colors"
                      value={editingProject.category || 'Fine Art'}
                      onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                    >
                      {['Fine Art', 'Architecture', 'Music', 'Film', 'TV Series', 'Digital Art', 'Gaming', 'Literature', 'Fashion', 'Design', 'Photography', 'Podcast', 'Performing Arts', 'Gastronomy'].map(cat => (
                        <option key={cat} value={cat} className="bg-surface-high text-white">{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Market Performance & Pricing Math */}
                <div className="p-5 bg-primary-cyan/5 border border-primary-cyan/25 rounded-lg space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-primary-cyan uppercase tracking-wider">{t('MARKET_PERF_PRICING', 'CRITÈRE DE COTATION ET VALEUR DU UNIT')}</span>
                     <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">Base: €50.00 Price-Fix</span>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-white/40 tracking-widest block">{t('PERFORMANCE_GROWTH_PERCENT', 'Taux de Croissance du Marché (%)')}</label>
                     <div className="relative">
                       <input 
                         type="number" 
                         step="0.01"
                         className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono text-white focus:border-primary-cyan focus:outline-none"
                         value={editingProject.growth || 0}
                         onChange={e => {
                           const gr = parseFloat(e.target.value) || 0;
                           setEditingProject({...editingProject, growth: gr});
                         }}
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/35">%</span>
                     </div>
                   </div>

                   <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center text-[10px] text-white/60">
                     <span>{t('CORRESPONDING_UNIT_QUOTE', 'VALEUR FIXE DE L\'UNITÉ LYA')} :</span>
                     <span className="text-emerald-400 font-black text-xs font-mono leading-none">
                       €50.00
                       <span className="text-[9.5px] font-bold text-white/40 ml-1">FIXE</span>
                     </span>
                   </div>
                   <p className="text-[10px] text-primary-cyan/60 pl-1">
                     * This percentage reflects the project's LYA Score growth trend. The LYA unit value remains fixed at €50 regardless of this indicator.
                   </p>
                </div>

                {/* Section 3: Professional Verification & Compliance Ratings */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-white/45 tracking-widest block px-1">{t('COMPLIANCE_RATINGS_MANAGEMENT', 'CO-ÉVALUATION DES TROIS SCORES REGLEMENTAIRES')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     
                     <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-accent-pink tracking-widest block leading-none">ALGO SCORE</label>
                       <input 
                         type="number" 
                         max={1000} 
                         min={0}
                         className="w-full bg-black/40 border border-white/5 p-2 rounded text-xs text-white font-mono"
                         value={editingProject.scoreAlgo || 700}
                         onChange={e => setEditingProject({...editingProject, scoreAlgo: Math.min(1000, Math.max(0, parseInt(e.target.value) || 0))})}
                       />
                     </div>

                     <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block leading-none">EXPERT SCORE</label>
                       <input 
                         type="number" 
                         max={1000} 
                         min={0}
                         className="w-full bg-black/40 border border-white/5 p-2 rounded text-xs text-white font-mono"
                         value={editingProject.scorePro || 700}
                         onChange={e => setEditingProject({...editingProject, scorePro: Math.min(1000, Math.max(0, parseInt(e.target.value) || 0))})}
                       />
                     </div>

                     <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-primary-cyan tracking-widest block leading-none">CONSOLIDATED LYA</label>
                       <input 
                         type="number" 
                         max={1000} 
                         min={0}
                         className="w-full bg-black/40 border border-white/5 p-2 rounded text-xs text-white font-mono"
                         value={editingProject.scoreLYA || 700}
                         onChange={e => setEditingProject({...editingProject, scoreLYA: Math.min(1000, Math.max(0, parseInt(e.target.value) || 0))})}
                       />
                     </div>

                  </div>
                </div>

                {/* Section 4: Project Lifecycle Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-white/45 tracking-widest block mb-1.5">{t('CONTRACT_STATUS_OVERSIGHT', 'STATUT DU CONTRAT')}</label>
                    <select 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-primary-cyan transition-colors font-mono"
                      value={editingProject.status || 'LIVE'}
                      onChange={e => setEditingProject({...editingProject, status: e.target.value})}
                    >
                      <option value="LIVE" className="bg-surface-high text-white">LIVE / ACTIVE TRADING</option>
                      <option value="PAUSED" className="bg-surface-high text-white">PAUSED / SUSPENDED (HALTED)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs text-white/40 uppercase font-black block leading-none mb-1">Status Preview</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${editingProject.status === 'LIVE' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                        {editingProject.status === 'LIVE' ? '● MARKET RUNNING' : '■ HALTED / SUSPENDED'}
                      </span>
                    </div>
                    <div>
                       {editingProject.status === 'LIVE' ? <CheckCircle2 className="text-emerald-400" size={24} /> : <AlertTriangle className="text-rose-500 animate-pulse" size={24} />}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingProject(null)} 
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                  >
                    {t('CANCEL', 'ANNULER')}
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveProject} 
                    className="flex-1 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white active:scale-95 transition-all shadow-lg"
                  >
                    {t('COMMIT_ASSET_CHANGES', 'ENREGISTRER LES MODIFICATIONS')}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation de validateur — remplace la simple notification en
          bas d'écran, jugée trop discrète pour une action de cette
          importance (upgrade de rôle + validation officielle). */}
      <AnimatePresence>
        {approvalSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setApprovalSuccessModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-surface-low border border-emerald-500/30 rounded-lg p-10 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-primary-cyan/10 pointer-events-none" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.15 }}
                className="relative mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center"
              >
                <CheckCircle2 size={40} className="text-emerald-400" />
              </motion.div>

              <p className="relative text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-3">
                {t('VALIDATOR VERIFIED', 'VALIDATEUR VÉRIFIÉ')}
              </p>
              <h2 className="relative text-2xl font-black text-white mb-2 uppercase tracking-tight">
                {approvalSuccessModal.name}
              </h2>
              <p className="relative text-sm text-on-surface-variant mb-8">
                {t(
                  'Access upgraded to Professional. Governance and Pro Lounge features are now unlocked.',
                  'Accès mis à niveau vers Professionnel. La Gouvernance et le Lounge Pro sont désormais débloqués.'
                )}
              </p>

              <div className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl border mb-6 ${
                approvalSuccessModal.emailSent 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-violet-500/10 border-violet-500/25 text-violet-400'
              }`}>
                {approvalSuccessModal.emailSent ? <Mail size={14} /> : <ShieldAlert size={14} />}
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {approvalSuccessModal.emailSent 
                    ? t('Confirmation email sent', 'Email de confirmation envoyé')
                    : t('Approved, but the email failed to send — check manually', 'Approuvé, mais l\u2019email n\u2019a pas pu être envoyé — à vérifier manuellement')}
                </span>
              </div>

              <button
                onClick={() => setApprovalSuccessModal(null)}
                className="relative w-full py-4 bg-emerald-500 text-surface-dim font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-all active:scale-95"
              >
                {t('DONE', 'TERMINÉ')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
