import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
import { AdminKeysManagement } from '../components/AdminKeysManagement';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, limit, orderBy, deleteDoc, addDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

export const AdminView: React.FC<{
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
  liveContracts: Contract[];
}> = ({ user, onNotify, onViewChange, liveContracts }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'financials' | 'system' | 'validation' | 'engagement' | 'submissions'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [validationQueue, setValidationQueue] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [activeEmailRequest, setActiveEmailRequest] = useState<any | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [publishModal, setPublishModal] = useState<any | null>(null);
  const [publishForm, setPublishForm] = useState({ scoreAlgo: 750, scorePro: 750, growth: 0, rarity: 'Rare', revenueSharePercentage: 5 });
  const [generatedDemoKey, setGeneratedDemoKey] = useState<string>('');
  const [expandedVerifId, setExpandedVerifId] = useState<string | null>(null);

  const handleApproveDemoRequest = async (request: any) => {
    try {
      const gK = `LYA-DEMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // Update local storage first
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      const localIndex = localDemo.findIndex((d: any) => d.id === request.id);
      if (localIndex !== -1) {
        localDemo[localIndex].status = 'APPROVED';
        localDemo[localIndex].codeSent = gK;
        localStorage.setItem('lya_local_demo_requests', JSON.stringify(localDemo));
      }

      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      localKeys.unshift({
        id: 'local_key_' + Date.now(),
        key: gK,
        assignedTo: request.name || request.email,
        createdAt: { toDate: () => new Date() },
        status: 'ACTIVE' as const
      });
      localStorage.setItem('lya_local_access_keys', JSON.stringify(localKeys));

      // Update state for instant UI update
      setDemoRequests(prev => prev.map(d => d.id === request.id ? { ...d, status: 'APPROVED', codeSent: gK } : d));

      if (!request.id.startsWith('local_')) {
        // 1. Write standard access key
        await addDoc(collection(db, 'access_keys'), {
          key: gK,
          assignedTo: request.name || request.email,
          createdAt: serverTimestamp(),
          status: 'ACTIVE'
        });

        // 2. Update status and key inside 'demo_requests' document
        await updateDoc(doc(db, 'demo_requests', request.id), {
          status: 'APPROVED',
          codeSent: gK,
          updatedAt: serverTimestamp()
        });
      }

      setGeneratedDemoKey(gK);
      setActiveEmailRequest(request);
      onNotify('DEMO ACCESS APPROVED • CLEARANCE CODE REGISTERED!');
    } catch (e: any) {
      console.error(e);
      onNotify('Error validating co-optation.');
    }
  };

  const handleRejectDemoRequest = async (id: string) => {
    try {
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      const localIndex = localDemo.findIndex((d: any) => d.id === id);
      if (localIndex !== -1) {
        localDemo[localIndex].status = 'REJECTED';
        localStorage.setItem('lya_local_demo_requests', JSON.stringify(localDemo));
      }

      // Update state for instant UI update
      setDemoRequests(prev => prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d));

      if (!id.startsWith('local_')) {
        await updateDoc(doc(db, 'demo_requests', id), {
          status: 'REJECTED',
          updatedAt: serverTimestamp()
        });
      }
      onNotify('Demo request declined.');
    } catch (e) {
      console.error(e);
      onNotify('Error updating request.');
    }
  };
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 100;
  const [isSeeding, setIsSeeding] = useState(false);
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
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      
      setPreRegistrations(prev => {
        const merged = [...prev];
        localPre.forEach((lp: any) => {
          if (!merged.some(m => m.id === lp.id)) {
            merged.push(lp);
          }
        });
        return merged;
      });

      setDemoRequests(prev => {
        const merged = [...prev];
        localDemo.forEach((ld: any) => {
          if (!merged.some(m => m.id === ld.id)) {
            merged.push(ld);
          }
        });
        return merged;
      });
    };

    loadLocalData();

    if ((window as any).lya_quota_reached) return;
    const preRef = collection(db, 'pre_registrations');
    const demoRef = collection(db, 'demo_requests');
    const submissionsRef = collection(db, 'projects_pending');

    const unsubs: (() => void)[] = [];

    // Charger les soumissions de projets en attente
    unsubs.push(onSnapshot(query(submissionsRef, orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setPendingSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (e) => console.warn('submissions error:', e)));

    unsubs.push(onSnapshot(query(preRef, orderBy('timestamp', 'desc'), limit(200)), (snap) => {
      const dbPre = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
      const merged: any[] = [...dbPre];
      localPre.forEach((lp: any) => {
        if (!merged.some((m: any) => m.email === lp.email)) {
          merged.push(lp);
        }
      });
      merged.sort((a: any, b: any) => {
        const da = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const db2 = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return db2.getTime() - da.getTime();
      });
      setPreRegistrations(merged);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'pre_registrations')));

    unsubs.push(onSnapshot(query(demoRef, limit(50)), (snap) => {
      const dbDemo = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      const merged = [...dbDemo];
      localDemo.forEach((ld: any) => {
        if (!merged.some(m => m.id === ld.id)) {
          merged.push(ld);
        }
      });
      setDemoRequests(merged);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'demo_requests')));

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
    const loadLocalVerif = () => {
      let localVerif = JSON.parse(localStorage.getItem('lya_local_verification_requests') || '[]');
      if (localVerif.length === 0) {
        localVerif = [
          {
            id: 'verif-001',
            userId: 'user-creative-01',
            displayName: 'Aurélia Dubois-Mercier',
            email: 'aurelia.dubois@contemporary-arts.fr',
            role: 'EXPERT',
            firm: 'Paris Contemporary Fine Arts Institute',
            registrationId: 'FR-8820492-PC',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            documents: [
              { name: 'Kbis_Certified_Art_House.pdf', data: '#mock-kbis' },
              { name: 'Adhesion_Maison_Artistes_2026.pdf', data: '#mock-artists' }
            ]
          },
          {
            id: 'verif-002',
            userId: 'user-creative-02',
            displayName: 'Hans-Dieter Werner',
            email: 'werner.finearts@berlin-registry.de',
            role: 'EXPERT',
            firm: 'Werner & Partners Galleries',
            registrationId: 'DE-DE9949102',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
            documents: [
              { name: 'Berlin_Gallery_License_Werner.pdf', data: '#mock-berlin' }
            ]
          },
          {
            id: 'verif-003',
            userId: 'user-creative-03',
            displayName: 'Marcus Sterling',
            email: 'marcus@goldstein-advisors.com',
            role: 'EXPERT',
            firm: 'Goldstein Wealth Art Portfolio',
            registrationId: 'SEC-US-77491',
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            documents: [
              { name: 'SEC_Advisory_Accreditation_Goldstein.pdf', data: '#mock-sec' }
            ]
          }
        ];
        localStorage.setItem('lya_local_verification_requests', JSON.stringify(localVerif));
      }
      setVerificationRequests(prev => {
        const merged = [...prev];
        localVerif.forEach((lv: any) => {
          if (!merged.some(m => m.id === lv.id)) {
            merged.push(lv);
          }
        });
        return merged;
      });
    };

    loadLocalVerif();

    if ((window as any).lya_quota_reached) return;
    const requestsRef = collection(db, 'verification_requests');
    const q = query(requestsRef, limit(50));

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
        loadLocalVerif();
      });
    } catch (e) { /* Ignore */ }

    return () => unsubscribe();
  }, []);

  const handleApproveVerification = async (requestId: string, userId: string) => {
    try {
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
        localStorage.setItem('lya_user_profile', JSON.stringify(currentUser));
      }

      // Update local state instantly for perfect demo response
      setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));

      if (!requestId.startsWith('local_')) {
        const batch = writeBatch(db);
        
        // Update request status
        const requestRef = doc(db, 'verification_requests', requestId);
        batch.update(requestRef, { status: 'APPROVED', processedAt: serverTimestamp() });
        
        // Upgrade user to Professional
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { 
          isPro: true, 
          role: UserRole.PROFESSIONAL,
          verificationStatus: 'APPROVED'
        });
        
        await batch.commit();
      }
      onNotify(t('VERIFICATION APPROVED. USER UPGRADED TO PROFESSIONAL.', 'VÉRIFICATION APPROUVÉE. UTILISATEUR PASSÉ AU STATUT PROFESSIONNEL.'));
    } catch (err) {
      console.error(err);
      if (!requestId.startsWith('local_')) {
        handleFirestoreError(err as any, OperationType.UPDATE, `verification_requests/${requestId}`);
      }
    }
  };

  const handleRejectVerification = async (requestId: string, userId: string) => {
    try {
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

      // Update local state instantly for perfect demo response
      setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));

      if (!requestId.startsWith('local_')) {
        const batch = writeBatch(db);
        
        const requestRef = doc(db, 'verification_requests', requestId);
        batch.update(requestRef, { status: 'REJECTED', processedAt: serverTimestamp() });
        
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { verificationStatus: 'REJECTED' });
        
        await batch.commit();
      }
      onNotify(t('VERIFICATION REJECTED.', 'VÉRIFICATION REJETÉE.'));
    } catch (err) {
      console.error(err);
      if (!requestId.startsWith('local_')) {
        handleFirestoreError(err as any, OperationType.UPDATE, `verification_requests/${requestId}`);
      }
    }
  };

  // Publier un projet soumis vers l'Exchange LYA
  const handlePublishProject = async (submission: any, form: typeof publishForm) => {
    try {
      const totalScore = Math.round((form.scoreAlgo + form.scorePro) / 2);
      const lyaUnit = parseFloat((50 * (1 + form.growth / 100)).toFixed(2));
      const registryIndex = `LYA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

      // 1. Publier dans la collection contracts (Exchange)
      await setDoc(doc(db, 'contracts', submission.id), {
        id: submission.id,
        name: submission.name,
        category: submission.category || 'Music',
        description: submission.description || '',
        image: submission.imageUrl || `https://picsum.photos/seed/${submission.id}/800/500`,
        issuerId: submission.creatorName || 'LYA Creator',
        creatorId: submission.creatorId,
        status: 'LIVE',
        rarity: form.rarity,
        scoreAlgo: form.scoreAlgo,
        scorePro: form.scorePro,
        totalScore,
        growth: form.growth,
        lyaUnit,
        revenueSharePercentage: form.revenueSharePercentage,
        totalUnits: 10000,
        availableUnits: 8000,
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
      onNotify(t(`✦ ${submission.name} publié sur l'Exchange LYA — Score: ${totalScore}/1000`, `✦ ${submission.name} published on LYA Exchange — Score: ${totalScore}/1000`));
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
      setPendingSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'REJECTED' } : s));
      onNotify(t(`✦ ${submission.name} refusé`, `✦ ${submission.name} rejected`));
    } catch(e) {
      onNotify(t('Erreur', 'Error'));
    }
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
      const computedUnitVal = parseFloat((basePrice * (1 + (parseFloat(editingProject.growth || 0) / 100))).toFixed(2));
      
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

  const seedMockUsers = async () => {
    setIsSeeding(true);
    const batch = writeBatch(db);
    const names = ['Jean-Luc Moreau', 'Sarah Wilson', 'Hideo Tanaka', 'Moussa Diouf', 'Hans Müller', 'Emily Brown', 'Carlos Diaz'];
    const roles = [UserRole.CREATOR, UserRole.INVESTOR, UserRole.PROFESSIONAL];

    try {
      for (let i = 0; i < 50; i++) {
        const uid = `DEMO_USER_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const userDoc = doc(collection(db, 'users'), uid);
        batch.set(userDoc, {
          uid,
          displayName: names[Math.floor(Math.random() * names.length)] + ' ' + (i + 1),
          email: `demo.${i}@lya.com`,
          role: roles[Math.floor(Math.random() * roles.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          isPro: Math.random() > 0.5,
          createdAt: serverTimestamp(),
          usageStats: { scan: 50, swipe: 120, compare: 10, simulator: 5, talent: 15 }
        });
      }
      await batch.commit();
      onNotify(t('DEMO USERS GENERATED', 'UTILISATEURS DÉMO GÉNÉRÉS'));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsSeeding(false);
    }
  };

  const seedMockContracts = async () => {
    setIsSeeding(true);
    const batch = writeBatch(db);
    try {
      for (let i = 0; i < 20; i++) {
        const growthValue = Math.round((Math.random() * 40 - 15) * 100) / 100;
        // Base is $50.00
        const unitValue = Math.round((50 * (1 + growthValue / 100)) * 100) / 100;
        const projectId = `DEMO_PROJ_${i}_${Date.now()}`;
        const projectDoc = doc(collection(db, 'contracts'), projectId);
        batch.set(projectDoc, {
          id: projectId,
          name: `Project ${['Alpha', 'Omega', 'Zion', 'Nova', 'Flux'][i % 5]} ${i + 1}`,
          category: ['Digital Art', 'Music', 'Film', 'Fashion', 'Gaming'][i % 5],
          unitValue,
          growth: growthValue,
          totalUnits: 1000,
          status: 'LIVE',
          image: [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=600'
          ][i % 12],
          scoreAlgo: 700 + Math.floor(Math.random() * 200),
          scorePro: 700 + Math.floor(Math.random() * 200),
          totalScore: 700 + Math.floor(Math.random() * 300),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          registryAddress: `LYA_REG_0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
          registryIndex: `LYA-DEMO-${i}`,
          milestones: [
            { label: 'Initial Launch', date: '2026-01', status: 'COMPLETED', priceImpact: 5 }
          ]
        });
      }
      await batch.commit();
      onNotify(t('DEMO PROJECTS GENERATED', 'PROJETS DÉMO GÉNÉRÉS'));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'contracts');
    } finally {
      setIsSeeding(false);
    }
  };

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
                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
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
                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] opacity-40 uppercase font-black mb-3 tracking-widest flex items-center gap-2">
                      <Shield size={12} /> Access Control
                    </div>
                    <div className="text-sm font-black text-accent-gold uppercase tracking-widest">{viewingUser.role}</div>
                    <div className="text-[10px] opacity-50">Member since {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-xs opacity-30 uppercase font-bold font-mono mr-1.5">KYC STATUS:</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-3 py-0.5 rounded-sm uppercase font-mono font-bold">TIER 2 VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8 p-6 bg-surface-dim border border-white/5 rounded-2xl">
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
                <div className="mb-8 p-6 bg-primary-cyan/5 border border-primary-cyan/10 rounded-2xl">
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
                      </div>
                      <div>
                        <div className="text-xs opacity-40 uppercase font-bold mb-2">Submitted Documents</div>
                        <div className="flex flex-wrap gap-2">
                          {req.documents?.map((doc: any, i: number) => (
                            <a 
                              key={i} 
                              href={doc.data} 
                              download={doc.name}
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
                  className="flex-1 py-4 bg-accent-gold text-surface-dim font-black uppercase text-xs rounded-xl shadow-[0_0_20px_rgba(255,193,7,0.2)] hover:scale-[1.02] transition-all active:scale-95"
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

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" size={16} />
          <input 
            placeholder={t('Search by name, email or UID...', 'Recherche par nom, email ou UID...')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setUsersPage(1); }}
            className="w-full bg-surface-low border border-white/10 p-4 pl-12 text-xs font-mono uppercase outline-none focus:border-accent-gold rounded-xl transition-all"
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
            <option value={UserRole.INVESTOR}>INVESTORS</option>
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

      <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
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
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest ${u.isPro ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-on-surface-variant'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.isPro ? 'bg-emerald-400 animate-pulse' : 'bg-on-surface-variant'}`} />
                      {u.isPro ? 'PRO HUB' : 'BASIC'}
                    </div>
                  </td>
                  <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleTogglePro(u.uid!, !!u.isPro)} 
                        className="p-2 hover:bg-accent-gold/10 rounded-lg text-accent-gold transition-all"
                        title={u.isPro ? t('Révoquer Pro','Revoke Pro') : t('Passer Pro','Grant Pro')}
                      >
                        <ShieldAlert size={16} />
                      </button>
                      <button 
                        onClick={() => setViewingUser(u)}
                        className="p-2 hover:bg-primary-cyan/10 rounded-lg text-primary-cyan transition-all"
                        title={t('Voir le profil','View profile')}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleBanUser(u.uid!, u.displayName || 'Utilisateur', !!(u as any).banned)}
                        className={`p-2 rounded-lg transition-all ${(u as any).banned ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-accent-gold hover:bg-accent-gold/10'}`}
                        title={(u as any).banned ? t('Réactiver','Reactivate') : t('Suspendre','Suspend')}
                      >
                        {(u as any).banned
                          ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        }
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.uid!, u.displayName || 'Utilisateur')}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/60 hover:text-rose-500 transition-all"
                        title={t('Supprimer le profil','Delete profile')}
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
          
          <img src={p.image} className="w-full h-40 object-cover rounded-2xl mb-6 group-hover:scale-[1.02] transition-transform shadow-lg" />
          
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
              <div className="text-[10px] uppercase font-black opacity-40 mb-1 tracking-widest">{t('UNIT PRICE', 'PRIX UNIT')}</div>
              <div className="text-xl font-black text-white font-mono">{formatPrice(p.unitValue)}</div>
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
      <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
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
                          {req.userName}
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
                           <FileText size={10} className="text-primary-cyan" /> {req.documents?.length || 3} {t('SEALED_FILES', 'Documents de Clearance')}
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
                              ? 'bg-primary-cyan/20 text-primary-cyan border-primary-cyan/40 shadow-[0_0_15px_rgba(0,224,255,0.1)]' 
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left bg-surface-low border border-white/5 p-8 rounded-2xl">
                          
                          {/* Col 1: Identity and Affiliation */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">📋 {t('DOSSIER METADATA', 'MÉTA-DONNÉES DU DOSSIER')}</span>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('FULL IDENTITY', 'IDENTITÉ COMPLÈTE')}</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{req.userName || 'ALEXANDER VANCE'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('ORGANIZATION / FIRM', 'ENTITÉ EXPLOITANTE')}</span>
                                <span className="text-xs font-bold text-accent-gold mt-0.5 block">{req.firm || req.organization || 'ALPHA FUND SERVICES'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('OPERATIONAL ROLE', 'RÔLE OPÉRATIONNEL')}</span>
                                <span className="text-xs font-medium text-white/80 mt-0.5 block">{req.role || 'CHIEF INVESTOR'}</span>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest block">{t('SECURE ENDPOINT URL', 'POINT D\'ACCÈS WEB')}</span>
                                <a href={req.website || '#'} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-cyan underline hover:text-white mt-0.5 block break-all">
                                  {req.website || 'https://alpha.ltd/investments'}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Security Verification Steps */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">🛡️ {t('AUDIT PROCESS CHECKLIST', 'VÉRIFICATIONS RÉGLEMENTAIRES')}</span>
                            <div className="space-y-3">
                              {[
                                { id: 'id_check', name: t('Passport / KYC Identity Cleared', 'Passeport & Identité KYC Approuvé'), desc: t('Validated via international authorities.', 'Validé via registres civils internationaux.') },
                                { id: 'portfolio_check', name: t('Portfolio Asset Audit', 'Inspection Technique Portfolio'), desc: t('Creative property integrity checked.', 'Contrôle d\'intégrité des actifs artistiques.') },
                                { id: 'aml_check', name: t('AML Capital Integrity Stamp', 'Vérification AML & Anti-Blanchiment'), desc: t('Capital proof values certified.', 'Origine des fonds et conformité validée.') },
                                { id: 'entity_check', name: t('Legal Entity Compliance Sync', 'Attestation d\'Activité Commerciale'), desc: t('Corporate authorization verified.', 'Registre de commerce actif et certifié.') },
                              ].map((step) => (
                                <div 
                                  key={step.id} 
                                  onClick={() => onNotify(t('✦ Étape de conformité validée', '✦ Compliance step passed'RÉE AVEC SUCCÈS'))}
                                  className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-primary-cyan/20 rounded-xl cursor-pointer transition-all flex items-start gap-3 group"
                                >
                                  <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={10} className="text-emerald-400" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black text-white/90 uppercase tracking-tight block group-hover:text-primary-cyan transition-colors">{step.name}</span>
                                    <span className="text-[8.5px] font-medium text-white/30 block mt-0.5">{step.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Col 3: Encrypted Document Vault */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] block border-b border-white/5 pb-2">🔑 {t('ENCRYPTED COMPLIANCE VAULT', 'COFFRE-FORT DE DOCUMENTS SÉCURISÉ')}</span>
                            <div className="space-y-3">
                              {[
                                { file: 'PASSPORT_IDENTITY_DECRYPT.enc', size: '15.4 MB', schema: 'AES-256' },
                                { file: 'INCORPORATION_CERTIFICATE.enc', size: '8.2 MB', schema: 'AES-256' },
                                { file: 'CAPITAL_PROOF_LEDGER.enc', size: '24.1 MB', schema: 'AES-256-GCM' },
                              ].map((doc, dIdx) => (
                                <div 
                                  key={dIdx}
                                  onClick={() => onNotify(t('✦ Document de conformité ouvert','✦ Compliance document opened'))}
                                  className="p-4 bg-white/[0.02] hover:bg-primary-cyan/[0.03] border border-white/5 hover:border-primary-cyan/30 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-3">
                                    <Database size={16} className="text-primary-cyan group-hover:scale-110 transition-transform" />
                                    <div>
                                      <span className="text-[11px] font-black text-white block group-hover:text-primary-cyan transition-colors">{doc.file}</span>
                                      <span className="text-xs font-mono text-white/30 block mt-0.5">{doc.schema} • {doc.size}</span>
                                    </div>
                                  </div>
                                  <Download size={13} className="text-white/30 group-hover:text-primary-cyan" />
                                </div>
                              ))}
                            </div>
                            <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-xl text-center">
                              <span className="text-[9.5px] font-bold text-accent-gold uppercase tracking-wider block">🔒 LYA LEDGER CLEARED NODE</span>
                              <span className="text-[8.5px] font-mono text-accent-gold/60 block mt-1">HASH: F843-D08E-CC21-99A0</span>
                            </div>
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

  const renderFinancialsTab = () => (
    <div className="space-y-6">
       {/* Placeholder for financials */}
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
       <div className="p-8 bg-surface-low border border-white/5 rounded-3xl">
          <h3 className="text-lg font-black text-white uppercase mb-6">{t('DEMO TOOLS', 'OUTILS DÉMO')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
            <button onClick={seedMockUsers} disabled={isSeeding} className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-primary-cyan transition-all text-left">
              <Users className="text-primary-cyan mb-2" />
              <div className="text-xs font-black uppercase text-white tracking-widest">{t('SEEDED USERS', 'SÉMENCE USERS')}</div>
            </button>
            <button onClick={seedMockContracts} disabled={isSeeding} className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-accent-gold transition-all text-left">
              <CreditCard className="text-accent-gold mb-2" />
              <div className="text-xs font-black uppercase text-white tracking-widest">{t('SEEDED ASSETS', 'SÉMENCE ACTIFS')}</div>
            </button>
          </div>
       </div>

       <AdminKeysManagement />
    </div>
  );

  const renderEngagementTab = () => (
    <div className="space-y-8">
      {/* Demo Requests */}
      <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Clock className="text-[#FF007F]" /> {t('DEMO CLEARANCE REQUESTS', 'DEMANDES D\'ACCÈS DÉMO')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-dim uppercase font-black text-on-surface-variant/60">
              <tr>
                <th className="p-6">{t('Identity', 'Identité')}</th>
                <th className="p-6">{t('Reason / Context', 'Motif / Contexte')}</th>
                <th className="p-6">{t('Status', 'Statut')}</th>
                <th className="p-6 text-right">{t('Actions', 'Actions / Validation')}</th>
              </tr>
            </thead>
            <tbody>
              {demoRequests.map(r => {
                const isApproved = r.status === 'APPROVED';
                const isRejected = r.status === 'REJECTED';
                const isPending = !isApproved && !isRejected;

                return (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="p-6">
                      <div className="font-black text-white uppercase">{r.name}</div>
                      <div className="opacity-40 font-mono text-xs">{r.email}</div>
                    </td>
                    <td className="p-6">
                      <p className="max-w-xs text-on-surface-variant italic">"{r.reason}"</p>
                      {r.codeSent && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded font-mono text-xs text-primary-cyan">
                          <span>KEY: {r.codeSent}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-6">
                      {isApproved ? (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs font-black text-emerald-400 uppercase tracking-widest">{t('VALIDATED', 'VALIDÉ')}</span>
                      ) : isRejected ? (
                        <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-xs font-black text-rose-400 uppercase tracking-widest">{t('DECLINED', 'REFUSÉ')}</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs font-black text-amber-500 uppercase tracking-widest animate-pulse">{t('PENDING', 'EN ATTENTE')}</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {isPending ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApproveDemoRequest(r)}
                            className="px-3 py-1.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all hover:bg-emerald-400 active:scale-95"
                          >
                            {t('GRANT ACCESS', 'VALIDER ET ACTIVER')}
                          </button>
                          <button
                            onClick={() => handleRejectDemoRequest(r.id)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 hover:text-rose-400 hover:border-rose-400/30 font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95"
                          >
                            {t('REJECT', 'REFUSER')}
                          </button>
                        </div>
                      ) : isApproved ? (
                        <button
                          onClick={() => {
                            setGeneratedDemoKey(r.codeSent);
                            setActiveEmailRequest(r);
                          }}
                          className="px-3.5 py-1.5 bg-primary-cyan/10 border border-primary-cyan/20 hover:bg-primary-cyan hover:text-black rounded text-xs font-black text-primary-cyan uppercase tracking-widest transition-all"
                        >
                          {t('SHOW INVITATION EMAIL', 'VOIR E-MAIL ENVOYÉ')}
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/20 uppercase tracking-wider font-bold">---</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Registrations */}
      <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden">
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
                    <button
                      onClick={async () => {
                        if (!window.confirm(t(`Supprimer la pré-inscription de ${r.name} (${r.email}) ?`, `Delete pre-registration of ${r.name} (${r.email})?`))) return;
                        try {
                          // Supprimer de Firestore si c'est un vrai document
                          if (r.id && !r.id.startsWith('local_')) {
                            await deleteDoc(doc(db, 'pre_registrations', r.id));
                          }
                          // Supprimer du localStorage
                          const local = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
                          localStorage.setItem('lya_local_pre_registrations', JSON.stringify(local.filter((p: any) => p.id !== r.id && p.email !== r.email)));
                          // Mettre à jour le state
                          setPreRegistrations(prev => prev.filter(p => p.id !== r.id));
                          onNotify(t(`✦ ${r.name} supprimé`, `✦ ${r.name} deleted`));
                        } catch (e: any) {
                          console.error('Delete error:', e);
                          onNotify(t('Erreur : ' + e.message, 'Error: ' + e.message));
                        }
                      }}
                      className="p-2 text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                      title={t('Supprimer', 'Delete')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        titleWhite="HUB" 
        titleAccent="ADMIN" 
        description="PLATFORM OVERSIGHT AND MANAGEMENT" 
        accentColor="text-accent-gold" 
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-2">
          {[
            {id: 'users', label: 'Identity', icon: <Users size={16}/>},
            {id: 'submissions', label: t('Soumissions', 'Submissions'), icon: <FileText size={16}/>, badge: pendingSubmissions.filter(s => s.status === 'PENDING_VALIDATION').length || undefined},
            {id: 'engagement', label: 'Engagement', icon: <Mail size={16}/>},
            {id: 'validation', label: 'Verifications', icon: <Shield size={16}/>},
            {id: 'projects', label: 'Assets', icon: <Activity size={16}/>},
            {id: 'system', label: 'Infrastructure', icon: <Settings size={16}/>}
          ].map(it => (
            <button key={it.id} onClick={() => setActiveTab(it.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === it.id ? 'bg-accent-gold text-surface-dim shadow-xl' : 'text-on-surface-variant hover:bg-white/5'}`}>
              {it.icon} {it.label}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Users" value={stats.totalUsers} icon={<Users/>} color="gold" isCurrency={false} trend="+12%"/>
            <StatCard title="Platform TVL" value={stats.totalVolume} icon={<TrendingUp/>} color="cyan" trend="+24%"/>
            <StatCard title="Protocol Revenue" value={stats.systemFee} icon={<Zap/>} color="pink" trend="+8%"/>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'users' && <motion.div key="u" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderUsersTab()}</motion.div>}
            {activeTab === 'submissions' && (
              <motion.div key="sub" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Soumissions de projets', 'Project submissions')}</h3>
                      <p className="text-xs text-on-surface-variant/40 mt-1">{t('Validez ou refusez chaque projet avant publication sur l\'Exchange LYA', 'Validate or reject each project before publishing on LYA Exchange')}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-black text-amber-500">{pendingSubmissions.filter(s => s.status === 'PENDING_VALIDATION').length} {t('en attente', 'pending')}</span>
                      <span className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-xs font-black text-emerald-400">{pendingSubmissions.filter(s => s.status === 'PUBLISHED').length} {t('publiés', 'published')}</span>
                    </div>
                  </div>

                  {pendingSubmissions.length === 0 ? (
                    <div className="bg-surface-low border border-white/8 rounded-2xl p-12 text-center">
                      <p className="text-on-surface-variant/40 text-sm">{t('Aucune soumission pour le moment', 'No submissions yet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingSubmissions.map((sub) => (
                        <div key={sub.id} className={`bg-surface-low border rounded-2xl p-5 transition-all ${sub.status === 'PUBLISHED' ? 'border-emerald-400/20' : sub.status === 'REJECTED' ? 'border-rose-400/20 opacity-60' : 'border-amber-500/25'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${sub.status === 'PUBLISHED' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : sub.status === 'REJECTED' ? 'bg-rose-400/10 text-rose-400 border border-rose-400/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                  {sub.status === 'PUBLISHED' ? '✓ ' + t('Publié', 'Published') : sub.status === 'REJECTED' ? '✗ ' + t('Refusé', 'Rejected') : '● ' + t('En attente', 'Pending')}
                                </span>
                                {sub.category && <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-white/50">{sub.category}</span>}
                                {sub.registryIndex && <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/20 rounded text-[9px] font-black text-primary-cyan font-mono">{sub.registryIndex}</span>}
                              </div>
                              <p className="text-sm font-black text-white">{sub.name || t('Projet sans titre', 'Untitled project')}</p>
                              <p className="text-xs text-on-surface-variant/50 line-clamp-2">{sub.description}</p>
                              <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/40 font-black">
                                <span>👤 {sub.creatorName || sub.creatorEmail}</span>
                                {sub.lyaScore && <span>★ LYA Score: {sub.lyaScore}/1000</span>}
                                {sub.createdAt?.toDate && <span>🕐 {sub.createdAt.toDate().toLocaleDateString()}</span>}
                              </div>
                            </div>

                            {sub.status === 'PENDING_VALIDATION' && (
                              <div className="flex flex-col gap-2 shrink-0">
                                <button onClick={() => { setPublishModal(sub); setPublishForm({ scoreAlgo: 750, scorePro: 750, growth: 0, rarity: 'Rare', revenueSharePercentage: 5 }); }}
                                  className="px-4 py-2 bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-black rounded-xl hover:bg-emerald-400/25 transition-all uppercase">
                                  {t('Valider & Publier', 'Validate & Publish')}
                                </button>
                                <button onClick={() => { if(window.confirm(t('Refuser ce projet ?', 'Reject this project?'))) handleRejectSubmission(sub, 'Non conforme aux critères LYA'); }}
                                  className="px-4 py-2 bg-rose-400/10 border border-rose-400/20 text-rose-400 text-[10px] font-black rounded-xl hover:bg-rose-400/20 transition-all uppercase">
                                  {t('Refuser', 'Reject')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal de publication */}
                {publishModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-surface-low border border-primary-cyan/30 rounded-3xl p-6 max-w-md w-full space-y-5">
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
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">LYA UNIT variation %</label>
                            <input type="number" min="-100" max="500" value={publishForm.growth}
                              onChange={e => setPublishForm(f => ({...f, growth: parseFloat(e.target.value)}))}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50"/>
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Revenue Share %</label>
                            <input type="number" min="0" max="50" value={publishForm.revenueSharePercentage}
                              onChange={e => setPublishForm(f => ({...f, revenueSharePercentage: parseFloat(e.target.value)}))}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50"/>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Rarity</label>
                          <select value={publishForm.rarity} onChange={e => setPublishForm(f => ({...f, rarity: e.target.value}))}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-cyan/50">
                            <option>Common</option>
                            <option>Rare</option>
                            <option>Epic</option>
                            <option>Legendary</option>
                          </select>
                        </div>

                        <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">LYA UNIT au lancement</p>
                          <p className="text-xl font-black text-accent-gold">${(50 * (1 + publishForm.growth / 100)).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setPublishModal(null)}
                          className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                          {t('Annuler', 'Cancel')}
                        </button>
                        <button onClick={() => handlePublishProject(publishModal, publishForm)}
                          className="flex-1 py-3 bg-emerald-400 text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
                          ✓ {t('Publier sur l\'Exchange', 'Publish on Exchange')}
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
            {activeTab === 'system' && <motion.div key="s" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>{renderSystemTab()}</motion.div>}
          </AnimatePresence>
        </main>
      </div>

      {renderUserModal()}

      {/* Simulated Email Modal */}
      <AnimatePresence mode="sync">
        {activeEmailRequest && (
          <div className="fixed inset-0 z-[550] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveEmailRequest(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#0D1117] border border-white/10 w-full max-w-2xl relative z-10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col font-sans"
            >
              {/* Email Header bar */}
              <div className="p-6 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  <h3 className="text-xs font-mono font-black text-white/60 tracking-widest uppercase">{t('SIMULATED SYSTEM EMAIL', 'SYSTÈME D\'E-MAIL INVITATION SIMULÉ')}</h3>
                </div>
                <button 
                  onClick={() => setActiveEmailRequest(null)}
                  className="text-white/40 hover:text-white font-mono text-xs uppercase"
                >
                  [ {t('CLOSE', 'FERMER')} ]
                </button>
              </div>

              {/* Header Metadata */}
              <div className="p-6 bg-black/40 border-b border-white/5 space-y-3 font-mono text-xs text-white/70">
                <div className="flex"><span className="w-20 font-black text-white/40 uppercase">{t('From', 'De')} :</span> <span className="text-primary-cyan font-black">contact@linkyourart.com</span></div>
                <div className="flex"><span className="w-20 font-black text-white/40 uppercase">{t('To', 'À')} :</span> <span className="text-white font-black">{activeEmailRequest.email}</span></div>
                <div className="flex"><span className="w-20 font-black text-white/40 uppercase">{t('Subject', 'SuJet')} :</span> <span className="text-accent-gold font-black">📥 LINKYOURART : Clé d'accès et validation co-optation</span></div>
              </div>

              {/* Email Content Box */}
              <div className="p-8 md:p-12 space-y-6 text-sm text-white/80 leading-relaxed max-h-[50vh] overflow-y-auto">
                <p className="font-bold">Bonjour {activeEmailRequest.name},</p>
                <p>
                  {t(
                    'The LinkYourArt co-optation committee had reviewed your registration details to access our private demo workspace.',
                    'Le comité d\'admission et de co-optation de la plateforme LINKYOURART s\'est réuni afin d\'examiner votre demande d\'accès privilégié.'
                  )}
                </p>
                <p>
                  {t(
                    'We are extremely pleased to inform you that your professional profile has been approved by our committee. You have been granted immediate clearance within the preview.',
                    'Nous avons le plaisir de vous informer que votre profil professionnel a été validé et accrédité par les membres fondateurs. Votre statut a été mis à jour directement.'
                  )}
                </p>

                {/* Golden Key Block */}
                <div className="my-8 p-6 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] font-mono">{t('YOUR ACTIVE CO-OPTATION CODE', 'VOTRE CLÉ D\'ACCÈS DÉMO SÉCURISÉE')}</span>
                  <div className="px-6 py-3 bg-black/60 border border-yellow-500/40 rounded-xl font-mono text-base md:text-lg font-black text-yellow-500 tracking-widest uppercase select-all shadow-inner text-center">
                    {generatedDemoKey}
                  </div>
                  <p className="text-[10px] text-white/40 text-center uppercase tracking-wider">
                    {t('Copy and paste this key into your clearance screen to unlock instantly.', 'Saisissez ce code sur votre écran de validation pour lever le verrou.')}
                  </p>
                </div>

                <p>
                  {t(
                    'You can also use this same key with your email address to log in anytime during our VC fund-raising campaign.',
                    'Cette clé d\'invitation unique vous permet d\'accréditer votre compte pour toute la durée des présentations privées.'
                  )}
                </p>

                <div className="pt-6 border-t border-white/5 text-xs text-white/40 font-mono">
                  <p className="font-bold">LINKYOURART Admissions Hub</p>
                  <p className="text-[10px]">Private preview environment</p>
                </div>
              </div>

              {/* Actions bar */}
              <div className="p-6 bg-black/60 border-t border-white/5 flex flex-wrap justify-end gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDemoKey);
                    onNotify('CODE ACCÈS COPIÉ !');
                  }}
                  className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  {t('Copy Access Code', 'Copier le code')}
                </button>

                <button 
                  onClick={async () => {
                    onNotify(t('Sending real email via SMTP...', 'Envoi de l\'e-mail réel en cours...'));
                    try {
                      const res = await fetch('/api/send-demo-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: activeEmailRequest.email,
                          key: generatedDemoKey,
                          name: activeEmailRequest.name || 'Creative Patron'
                        })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        if (data.method === 'smtp') {
                          onNotify(t('✓ EMAIL INBOX DELIVERED!', '✓ E-MAIL ENVOYÉ DANS LA BOÎTE DE RÉCEPTION !'));
                        } else {
                          onNotify(t('✓ CODE REGISTERED SATELLITE (SMTP sandbox fallback)', '✓ SATELLITE ENREGISTRÉ (Fallback SMTP simulation)'));
                        }
                      } else {
                        onNotify(t('✕ FAILED TO DISPATCH EMAIL', '✕ ÉCHEC DE L\'ENVOI DE L\'E-MAIL'));
                      }
                    } catch (e) {
                      console.error(e);
                      onNotify(t('Error connecting to Mail API.', 'Erreur lors de la connexion à l\'API d\'envoi.'));
                    }
                  }}
                  className="px-5 py-3.5 bg-accent-gold text-surface-dim hover:bg-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                >
                  {t('SEND REAL EMAIL NOW', 'ENVOYER LE VRAI E-MAIL')}
                </button>
                
                <button 
                  onClick={() => setActiveEmailRequest(null)}
                  className="px-5 py-3.5 bg-primary-cyan text-surface-dim hover:bg-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  {t('Acknowledge & Close', 'Confirmer et Fermer')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono uppercase text-white focus:outline-none focus:border-primary-cyan transition-colors" 
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
                      {['Fine Art', 'Architecture', 'Music', 'Film', 'TV Series', 'Digital Art', 'Literature', 'Fashion', 'Design', 'Photography', 'Performing Arts', 'Gastronomy'].map(cat => (
                        <option key={cat} value={cat} className="bg-surface-high text-white">{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: Market Performance & Pricing Math */}
                <div className="p-5 bg-primary-cyan/5 border border-primary-cyan/25 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-primary-cyan uppercase tracking-wider">{t('MARKET_PERF_PRICING', 'CRITÈRE DE COTATION ET VALEUR DU UNIT')}</span>
                     <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">Base: $50.00 Price-Fix</span>
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
                     <span>{t('CORRESPONDING_UNIT_QUOTE', 'VALEUR RÉELLE SIMULÉE DE L\'UNITÉ LYA')} :</span>
                     <span className="text-emerald-400 font-black text-xs font-mono leading-none">
                       ${(50.00 * (1 + (editingProject.growth || 0) / 100)).toFixed(2)}
                       <span className="text-[9.5px] font-bold text-white/40 ml-1">LYA SPOT</span>
                     </span>
                   </div>
                   <p className="text-[10px] text-primary-cyan/60 pl-1">
                     * Modifying this percent instantly updates the trading quote in real-time between $25.00 and $150.00 under algorithmic stability rules, maintaining pricing integrity.
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

                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
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
    </div>
  );
};
