
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTRACTS, ACTIVITIES, INITIAL_ORDERS, Contract, Order, Activity } from './types';

import { Sidebar, View } from './components/ui/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Topbar } from './components/ui/Topbar';
import { Notification } from './components/ui/Notification';
import { Logo } from './components/ui/Logo';
import { ContractDetailModal, ProfessionalOnboardingModal, TradeModal } from './components/Modals';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { CreatorDashboardView } from './views/CreatorDashboardView';
import { InvestorDashboardView } from './views/InvestorDashboardView';
import { ProfessionalDashboardView } from './views/ProfessionalDashboardView';
import { ProjectPublicView } from './views/ProjectPublicView';
import { ExchangeView } from './views/ExchangeView';
import { ValidationView } from './views/ValidationView';
import { HoldingsView } from './views/HoldingsView';
import { RegistryView } from './views/RegistryView';
import { LinkArtView } from './views/LinkArtView';
import { SettlementView } from './views/SettlementView';
import { LoungeView } from './views/LoungeView';
import { WalletView } from './views/WalletView';
import { HomeView } from './views/HomeView';
import SignupView from './views/SignupView';
import LoginView from './views/LoginView';
import ProfileView from './views/ProfileView';
import PricingView from './views/PricingView';
import { SwipeView } from './views/SwipeView';
import { WatchlistView } from './views/WatchlistView';
import { SettingsView } from './views/SettingsView';
import { CompareView } from './views/CompareView';
import { SocialFeedView } from './views/SocialFeedView';
import { PaymentView } from './views/PaymentView';
import { ContractDetailView } from './views/ContractDetailView';
import { LegalView } from './views/LegalView';
import { GovernanceView } from './views/GovernanceView';
import { APIView } from './views/APIView';
import { AcademyView } from './views/AcademyView';
import { ApplyForVerificationView } from './views/ApplyForVerificationView';
import { AboutView } from './views/AboutView';
import { TaxOptimizerView } from './views/TaxOptimizerView';
import { IssuerProfileView } from './views/IssuerProfileView';
import { AdminView } from './views/AdminView';
import { MecenatView } from './views/MecenatView';
import { PendingApprovalView } from './views/PendingApprovalView';
import { OfferModal, TransferModal } from './components/TransactionModals';
import { AuthModal } from './components/auth/AuthModal';
import { ConceptTutorial } from './components/ConceptTutorial';
import { LYACopilot } from './components/LYACopilot';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { Ticker } from './components/ui/Ticker';
import { RoleSimulatorBar, SimulatedRole } from './components/ui/RoleSimulatorBar';
import { GuestPreviewOverlay } from './components/ui/GuestPreviewOverlay';
import { CommandPalette } from './components/CommandPalette';
import { Search, RefreshCw } from 'lucide-react';
import { UserRole, UserProfile } from './types';
import { useTranslation } from './context/LanguageContext';
import { useMarketData } from './hooks/useMarketData';
import { auth, db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const { t } = useTranslation();
  const { contracts: liveContracts } = useMarketData();
  const [currentView, setCurrentView] = useState<View>('LANDING');
  const [previousView, setPreviousView] = useState<View>('HOME');
  const [user, _setUser] = useState<UserProfile | null>(null);
  const setUser = (u: UserProfile | null) => _setUser(u);

  // ── Role Simulator (Admin only) ────────────────────────────────────────
  const [simulatedRole, setSimulatedRole] = React.useState<SimulatedRole | null>(null);

  // effectiveUser: ce que la plateforme "voit" — vrai user sauf si admin simule
  const effectiveUser = React.useMemo<UserProfile | null>(() => {
    if (!user) return null;
    if (user.role !== UserRole.ADMIN) return user;
    if (simulatedRole === 'VISITOR') return null;
    if (simulatedRole && simulatedRole !== UserRole.ADMIN) {
      return { ...user, role: simulatedRole as UserRole, isPro: simulatedRole === UserRole.PROFESSIONAL || simulatedRole === UserRole.INVESTOR };
    }
    return user;
  }, [user, simulatedRole]);

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    if (!user?.uid) return;
    
    try {
      // Update local state immediately so avatar syncs everywhere instantly
      const merged = { ...user, ...updatedData };
      _setUser(merged);

      // Then persist to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updatedData, { merge: true });
      notify(t('Profile updated successfully.', 'Profil mis à jour avec succès.'));
    } catch (err) {
      console.error('Error updating user profile:', err);
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${user.uid}`);
    }
  };
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConn = async () => {
      const isConnected = await testConnection();
      setIsBackendConnected(isConnected);
    };
    checkConn();
  }, []);

  const [quotaReached, setQuotaReached] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    (window as any).lya_quota_reached = quotaReached;
  }, [quotaReached]);

  // Handle global errors
  useEffect(() => {
    const handleError = (error: any) => {
      const msg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      const lowerMsg = msg.toLowerCase();
      
      if (
        lowerMsg.includes('quota exceeded') || 
        lowerMsg.includes('resource_exhausted') || 
        lowerMsg.includes('429') ||
        lowerMsg.includes('quota metric') ||
        lowerMsg.includes('quota_exceeded')
      ) {
        setQuotaReached(true);
      }
      
      if (lowerMsg.includes('assertion failed') || lowerMsg.includes('unexpected state') || lowerMsg.includes('id: ca9') || lowerMsg.includes('id: b815')) {
        setInternalError(msg);
        // Internal errors mean the SDK is stuck, usually after quota limit
        setQuotaReached(true);
        // We might want to force a reload after a while or show a clear 'Broken' state
      }
    };
    
    // Listen for custom Firestore errors thrown as JSON strings
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch (e) {
          return String(arg);
        }
      }).join(' ');
      const lowerMsg = msg.toLowerCase();
      if (
        lowerMsg.includes('quota exceeded') || 
        lowerMsg.includes('resource_exhausted') || 
        lowerMsg.includes('429') ||
        lowerMsg.includes('quota metric') ||
        lowerMsg.includes('assertion failed') ||
        lowerMsg.includes('unexpected state') ||
        lowerMsg.includes('id: ca9') ||
        lowerMsg.includes('id: b815')
      ) {
        setQuotaReached(true);
      }
      originalError.apply(console, args);
    };

    const handleWindowError = (event: ErrorEvent) => handleError(event.error);
    const handleRejection = (event: PromiseRejectionEvent) => handleError(event.reason);

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [t]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [userTradeHistory, setUserTradeHistory] = useState<Activity[]>([]);
  const [tradingContract, setTradingContract] = useState<{ contract: Contract, type: 'BUY' | 'SELL' } | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [tradeVolume, setTradeVolume] = useState(1);
  const [tradePrice, setTradePrice] = useState(0);
  
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: number, billingCycle: 'monthly' | 'yearly' } | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    type: 'PRO_UPGRADE' | 'ASSET_PURCHASE';
    amount: number;
    metadata: any;
    title: string;
    projectName?: string;
  } | null>(null);

  const [userContracts, setUserContracts] = useState<any[]>([]);

  useEffect(() => {
    const defaultHoldings = [
      { id: 'hold_1', projectId: 'LYA_FINE_ART_MASTER', projectName: 'RENAISSANCE REBORN', units: 1500, entryPrice: 42.50 },
      { id: 'hold_2', projectId: 'LYA_SKY_GARDENS', projectName: 'SKY GARDENS V4', units: 800, entryPrice: 48.00 },
      { id: 'hold_3', projectId: 'LYA_FUTURE_VOICE', projectName: 'THE FUTURE VOICE', units: 2500, entryPrice: 38.00 }
    ];

    if (user?.uid && !quotaReached) {
      const contractsRef = collection(db, 'users', user.uid, 'contracts');
      return onSnapshot(contractsRef, (snapshot) => {
        const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (contracts.length === 0) {
          setUserContracts(defaultHoldings);
        } else {
          setUserContracts(contracts);
        }
      }, (error) => {
        console.warn('Could not fetch user contracts (Quota?):', error);
        setUserContracts(defaultHoldings);
        if (error.code === 'resource-exhausted') {
          setQuotaReached(true);
        }
      });
    } else {
      setUserContracts(defaultHoldings);
    }
  }, [user?.uid, quotaReached]);

  const [activeIssuerId, setActiveIssuerId] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutData) {
      if (currentView !== 'PAYMENT') {
        setPreviousView(currentView);
      }
      setCurrentView('PAYMENT');
    }
  }, [checkoutData]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transactionContract, setTransactionContract] = useState<Contract | null>(null);

  // Handle missing data for specific views (Page Vide fix)
  useEffect(() => {
    if (currentView === 'CONTRACT_DETAIL' && !viewingContract) {
      setCurrentView('EXCHANGE');
    }
    if (currentView === 'PAYMENT' && !checkoutData) {
      setCurrentView(previousView || 'EXCHANGE');
    }
    if (currentView === 'ISSUER_PROFILE' && !activeIssuerId) {
      setCurrentView('HOME');
    }
  }, [currentView, viewingContract, checkoutData, activeIssuerId]);

  const [usageStats, setUsageStats] = useState({
    simulator: 0,
    swipe: 0,
    compare: 0,
    scan: 0,
    talent: 0
  });

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkUsageLimit = (type: 'swipe' | 'compare' | 'simulator' | 'scan' | 'talent') => {
    const isPro = user?.role === UserRole.ADMIN || user?.role === UserRole.PROFESSIONAL || user?.isPro;
    if (isPro) return true;
    
    // Limits
    const limitMap = {
      swipe: 20,
      compare: 20,
      simulator: 4,
      scan: 3,
      talent: 3
    };

    const limit = limitMap[type];
    
    let currentCount = 0;
    if (type === 'swipe') currentCount = watchlist.length;
    else if (type === 'compare') currentCount = comparisonList.length;
    else if (usageStats) currentCount = usageStats[type] || 0;
    
    if (currentCount >= limit) {
      const label = type.toUpperCase();
      const message = t(
        `ELEVATE ACCESS REQUIRED: ${label} LIMIT REACHED (${limit}/${limit}). UPGRADE TO PRO TO UNLOCK EXPERT LIMITS.`, 
        `ACCÈS ÉLEVÉ REQUIS : LIMITE DE ${label} ATTEINTE (${limit}/${limit}). PASSEZ AU PRO POUR DÉBLOQUER LES LIMITES EXPERTES.`
      );
      
      notify(message);
      setCurrentView('PRICING');
      return false;
    }
    
    return true;
  };

  // Sync usageStats with lists
  useEffect(() => {
    setUsageStats(prev => ({
      ...prev,
      swipe: watchlist.length,
      compare: comparisonList.length
    }));
  }, [watchlist.length, comparisonList.length]);
  
  // Filters for Exchange
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [orderContractFilter, setOrderContractFilter] = useState<string>('ALL');
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('ALL');
  
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState<'Standard' | 'Expert'>('Standard');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, timestamp: string, read: boolean, type: 'INFO' | 'SUCCESS' | 'WARNING' }[]>([
    {
      id: '1',
      title: 'SYSTEM INITIALIZED',
      message: 'LYA Protocol v2.5.0 is now active.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'INFO'
    }
  ]);

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showConceptTutorial, setShowConceptTutorial] = useState(false);
  const [isProfessionalChatActive, setIsProfessionalChatActive] = useState(false);

  // Live Notification Simulator
  useEffect(() => {
    const events = [
      { title: 'NEW TRANSACTION', message: 'Creative swap cleared in Sector 0x4f.', type: 'SUCCESS' },
      { title: 'INDEX ALERT', message: 'LYA Index volatility decreasing. Bullish signal detected.', type: 'INFO' },
      { title: 'CREATIVE FEED', message: '"Neo-Tokyo" has reached milestone +14%.', type: 'INFO' },
      { title: 'REGISTRY UPDATE', message: '12 new creative contracts added to the global catalogue.', type: 'INFO' },
      { title: 'SYSTEM LOG', message: 'Neural routing optimization complete.', type: 'SUCCESS' }
    ];

    const generateEvent = () => {
      const event = events[Math.floor(Math.random() * events.length)];
      addNotification(event.title, event.message, event.type as any);
    };

    // Initial random events after boot
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (Math.random() > 0.85) { // 15% chance every 20 seconds
          generateEvent();
        }
      }, 20000);
      return () => clearInterval(interval);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleTickerSelect = (e: Event) => {
      const contract = (e as CustomEvent).detail;
      setViewingContract(contract);
      setCurrentView('CONTRACT_DETAIL');
    };
    const handleOpenTutorial = () => setShowConceptTutorial(true);

    const hasSeenTutorial = localStorage.getItem('lya_concept_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowConceptTutorial(true);
    }


    const handleNavigate = (e: Event) => {
      const view = (e as CustomEvent).detail;
      setCurrentView(view);
    };

    window.addEventListener('ticker-contract-select', handleTickerSelect);
    window.addEventListener('open-concept-tutorial', handleOpenTutorial);
    window.addEventListener('lya-navigate', handleNavigate);
    return () => {
      window.removeEventListener('ticker-contract-select', handleTickerSelect);
      window.removeEventListener('open-concept-tutorial', handleOpenTutorial);
      window.removeEventListener('lya-navigate', handleNavigate);
    };
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Bail out if quota reached to avoid SDK crash
      if ((window as any).lya_quota_reached) {
        setIsAuthReady(true);
        return;
      }
      
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // Listen to user profile changes in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userDocRef, { includeMetadataChanges: true }, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { uid: firebaseUser.uid, ...docSnap.data() } as UserProfile;
            const userEmail = firebaseUser.email?.toLowerCase().trim();
            const isAdminEmail = userEmail === 'linkyourart@gmail.com' || 
                                 userEmail === 'lequimejeanbaptiste@gmail.com' || 
                                 userEmail === 'jeanbaptistelequime@gmail.com' ||
                                 userEmail === 'jean-baptiste.lequime@gmail.com' ||
                                 userEmail === 'lyacontactpro@gmail.com' ||
                                 userEmail === 'linkart@gmail.com' ||
                                 userEmail === 'admin@linkyourart.com' ||
                                 userEmail === 'superadmin@linkyourart.com' ||
                                 userEmail === 'linkyourart@ai.studio';

            if (isAdminEmail) {
              userData.role = UserRole.ADMIN;
              userData.isPro = true;
            }

            // Force isPro=true for Professional and Investor roles
            if (
              userData.role === UserRole.PROFESSIONAL ||
              userData.role === UserRole.INVESTOR
            ) {
              userData.isPro = true;
            }

            // Caching user for quota recovery
            localStorage.setItem(`lya_user_${firebaseUser.uid}`, JSON.stringify(userData));

            if (isAdminEmail && (firebaseUser.metadata.lastSignInTime === firebaseUser.metadata.creationTime || !isAuthReady)) {
              setTimeout(() => {
                 addNotification(
                  'ROOT ACCESS GRANTED', 
                  t(`WELCOME OPERATOR. ALL SYSTEMS ONLINE.`, `BIENVENUE OPÉRATEUR. TOUS LES SYSTÈMES SONT EN LIGNE.`), 
                  'SUCCESS'
                );
              }, 2000);
            }
            
            setUser(userData);
            
            // Show tutorial if not seen
            const localSeen = localStorage.getItem('lya_concept_tutorial_seen') === 'true';
            if ((userData.hasSeenTutorial === undefined || userData.hasSeenTutorial === false) && !localSeen) {
              setShowConceptTutorial(true);
            }
            if (userData.watchlist) setWatchlist(userData.watchlist);
            if (userData.comparisonList) setComparisonList(userData.comparisonList);
            if (userData.usageStats) setUsageStats(userData.usageStats);
          } else {
            // Document doesn't exist - providing fallback
            const userEmail = firebaseUser.email?.toLowerCase().trim();
            const isAdmin = userEmail === 'linkyourart@gmail.com' || 
                            userEmail === 'lequimejeanbaptiste@gmail.com' || 
                            userEmail === 'jeanbaptistelequime@gmail.com' ||
                            userEmail === 'jean-baptiste.lequime@gmail.com' ||
                            userEmail === 'lyacontactpro@gmail.com' ||
                            userEmail === 'linkart@gmail.com' ||
                            userEmail === 'admin@linkyourart.com' ||
                            userEmail === 'superadmin@linkyourart.com' ||
                            userEmail === 'linkyourart@ai.studio';
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0].toUpperCase() || 'USER',
              role: isAdmin ? UserRole.ADMIN : UserRole.CREATOR,
              isPro: isAdmin,
              createdAt: new Date().toISOString()
            });
          }
          setIsAuthReady(true);
        }, (error) => {
          // Auto-unsubscribe on error
          if (unsubscribeProfile) {
            try { unsubscribeProfile(); } catch(e) {}
          }
          
          console.warn('Firestore profile sync failed (Quota?):', error);
          
          // Try to recover from cache
          const cached = localStorage.getItem(`lya_user_${firebaseUser.uid}`);
          if (cached) {
            try {
              setUser(JSON.parse(cached));
              setIsAuthReady(true);
              return;
            } catch (e) { /* ignore */ }
          }
          
          // Clear error if it's quota
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);

          // Fallback even on failure
          const userEmail = firebaseUser.email?.toLowerCase().trim();
          const isAdmin = userEmail === 'linkyourart@gmail.com' || 
                          userEmail === 'lequimejeanbaptiste@gmail.com' || 
                          userEmail === 'jeanbaptistelequime@gmail.com' ||
                          userEmail === 'jean-baptiste.lequime@gmail.com' ||
                          userEmail === 'lyacontactpro@gmail.com' ||
                          userEmail === 'linkart@gmail.com' ||
                          userEmail === 'admin@linkyourart.com' ||
                          userEmail === 'superadmin@linkyourart.com' ||
                          userEmail === 'linkyourart@ai.studio';

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'OFFLINE USER',
            role: isAdmin ? UserRole.ADMIN : UserRole.CREATOR,
            isPro: isAdmin,
            createdAt: new Date().toISOString()
          });
          setIsAuthReady(true);
        });
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Enforce private platform restriction
  useEffect(() => {
    // If auth is not ready or we're booting, don't redirect yet
    if (!isAuthReady || isBooting) return;

    // Toujours accessibles sans login
    const publicViews: View[] = ['LANDING', 'LOGIN', 'SIGNUP', 'OUR_MODEL', 'FAQ', 'LEGAL_MENTIONS', 'TERMS', 'PRIVACY', 'LEGAL_REGISTRY'];
    // Accessibles en lecture seule (aperçu visiteur)
    const previewViews: View[] = ['HOME', 'EXCHANGE', 'REGISTRY', 'PRICING', 'MECENAT'];

    if (publicViews.includes(currentView)) return;
    if (previewViews.includes(currentView)) return;

    // Vue privée — login requis
    if (user) return;

    // Mode visiteur après déconnexion — rester sur HOME, ne pas renvoyer vers Landing
    if (sessionStorage.getItem('lya_visitor_mode') === 'true') {
      setCurrentView('HOME');
      return;
    }

    // Non connecté sur vue privée → HOME visiteur
    const timer = setTimeout(() => {
      if (!user) setCurrentView('HOME');
    }, 500);
    return () => clearTimeout(timer);
  }, [user, currentView, isAuthReady, isBooting]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenIssuerProfile = (issuerId: string) => {
    setActiveIssuerId(issuerId);
    setCurrentView('ISSUER_PROFILE');
  };

  const handleOpenOffer = (contract: Contract) => {
    setTransactionContract(contract);
    setIsOfferModalOpen(true);
  };

  const handleOpenTransfer = (contract: Contract) => {
    setTransactionContract(contract);
    setIsTransferModalOpen(true);
  };

  const addNotification = (title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    notify(title);
  };

  // Market Simulation
  useEffect(() => {
    if (isBooting) return;
    
    const interval = setInterval(() => {
      const randomContract = CONTRACTS[Math.floor(Math.random() * CONTRACTS.length)];
      const randomType = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const randomPrice = randomContract.unitValue * (0.95 + Math.random() * 0.1);
      const randomVolume = Math.floor(Math.random() * 50) + 1;

      const simulatedOrder: Order = {
        id: `sim-${Math.random().toString(36).substr(2, 5)}`,
        contractId: randomContract.id,
        type: randomType,
        volume: randomVolume,
        price: Number(randomPrice.toFixed(2)),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'OPEN'
      };

      setOrders(prev => [simulatedOrder, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isBooting]);

  useEffect(() => {
    if (isAuthReady) {
      const timer = setTimeout(() => setIsBooting(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthReady]);

  const handleOpenTrade = (contract: Contract, type: 'BUY' | 'SELL', price?: number, volume?: number) => {
    setTradingContract({ contract, type });
    setTradePrice(price || contract.unitValue);
    setTradeVolume(volume || 1);
    if (price) {
      notify(`ORDER SELECTED: ${type} @ $${price.toLocaleString()}`);
    }
  };

  const handlePlaceOrder = (contract: Contract, type: 'BUY' | 'SELL', price: number, volume: number) => {
    if (type === 'BUY') {
      if (!user) {
        notify(t('Please sign in to place an order', 'Veuillez vous connecter pour passer une commande'));
        setIsAuthModalOpen(true);
        return;
      }
      
      setCheckoutData({
        type: 'ASSET_PURCHASE',
        amount: price * volume * 1.032, // Including fees
        title: `INVESTMENT: ${contract.name}`,
        projectName: contract.name,
        metadata: {
          type: 'ASSET_PURCHASE',
          contractId: contract.id,
          units: volume,
          price: price,
          projectName: contract.name,
          userId: user.uid,
          userEmail: user.email
        }
      });
      setTradingContract(null);
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      contractId: contract.id,
      type: type,
      volume: volume,
      price: price,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'OPEN'
    };

    // Check for matching orders
    const matchingOrderIndex = orders.findIndex(o => 
      o.contractId === newOrder.contractId && 
      o.type !== newOrder.type && 
      o.status === 'OPEN' &&
      (newOrder.type === 'BUY' ? o.price <= newOrder.price : o.price >= newOrder.price)
    );

    if (matchingOrderIndex !== -1) {
      const matchedOrder = orders[matchingOrderIndex];
      const tradeActivity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: newOrder.timestamp,
        contract: contract.id,
        type: newOrder.type,
        volume: Math.min(newOrder.volume, matchedOrder.volume),
        price: matchedOrder.price
      };

      setActivities([tradeActivity, ...activities]);
      setUserTradeHistory([tradeActivity, ...userTradeHistory]);
      
      const updatedOrders = [...orders];
      if (newOrder.volume === matchedOrder.volume) {
        updatedOrders.splice(matchingOrderIndex, 1);
      } else if (newOrder.volume > matchedOrder.volume) {
        updatedOrders.splice(matchingOrderIndex, 1);
      } else {
        updatedOrders[matchingOrderIndex] = { ...matchedOrder, volume: matchedOrder.volume - newOrder.volume };
      }
      setOrders(updatedOrders);
      notify('TRADE EXECUTED: SETTLEMENT COMPLETE');
    } else {
      setOrders([newOrder, ...orders]);
      notify('ORDER PLACED: EXECUTING SETTLEMENT...');
    }

    setTradingContract(null);
  };

  const cancelOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    notify('ORDER CANCELLED');
  };

  const handleExportOrders = () => {
    const filteredOrders = orders.filter(order => {
      const typeMatch = orderTypeFilter === 'ALL' || order.type === orderTypeFilter;
      const contractMatch = orderContractFilter === 'ALL' || order.contractId === orderContractFilter;
      return typeMatch && contractMatch;
    });

    if (filteredOrders.length === 0) {
      notify('NO ORDERS TO EXPORT');
      return;
    }

    const headers = ['ID', 'Contract ID', 'Type', 'Volume', 'Price', 'Timestamp', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.contractId,
        order.type,
        order.volume,
        order.price,
        order.timestamp,
        order.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `open_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('EXPORTING ORDERS TO CSV...');
  };

  const handleVerify = async (data: any) => {
    if (!user) return;
    setIsVerifying(true);
    try {
      // Save verification request to Firestore
      await addDoc(collection(db, 'verification_requests'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || data.name,
        firm: data.firm,
        registrationId: data.registrationId,
        documents: data.documents, // This will be the base64 documents
        status: 'PENDING',
        timestamp: serverTimestamp(),
      });
      
      // Also mark user as having a pending verification
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        verificationStatus: 'PENDING'
      });

      setIsVerifying(false);
      setIsVerificationModalOpen(false);
      notify(t('DOSSIER SUBMITTED. OUR AGENTS WILL AUDIT YOUR PROFILE.', 'DOSSIER SOUMIS. NOS AGENTS VONT AUDITER VOTRE PROFIL.'));
    } catch (error) {
      console.error('Error submitting verification:', error);
      handleFirestoreError(error, OperationType.WRITE, 'verification_requests');
      setIsVerifying(false);
    }
  };

  const handleToggleWatchlist = async (e: React.MouseEvent | { stopPropagation: () => void }, contractId: string, force?: 'add' | 'remove') => {
    e.stopPropagation();
    if (!user) {
      notify(t('PLEASE SIGN IN TO MANAGE WATCHLIST', 'VEUILLEZ VOUS CONNECTER POUR GÉRER LA LISTE DE VEILLE'));
      return;
    }

    const isWatchlisted = watchlist.includes(contractId);
    
    // Limit check only when trying to ADD
    if ((force === 'add' && !isWatchlisted) || (!force && !isWatchlisted)) {
      if (!checkUsageLimit('swipe')) return;
    }

    let newWatchlist = [...watchlist];
    let action: 'added' | 'removed' | 'none' = 'none';

    if (force === 'add') {
      if (!isWatchlisted) {
        newWatchlist.push(contractId);
        action = 'added';
      }
    } else if (force === 'remove') {
      if (isWatchlisted) {
        newWatchlist = watchlist.filter(id => id !== contractId);
        action = 'removed';
      }
    } else {
      if (isWatchlisted) {
        newWatchlist = watchlist.filter(id => id !== contractId);
        action = 'removed';
      } else {
        newWatchlist.push(contractId);
        action = 'added';
      }
    }
    
    if (action === 'none') return;

    // Update locally immediately
    setWatchlist(newWatchlist);
    notify(action === 'added' ? t('ADDED TO WATCHLIST', 'AJOUTÉ À LA LISTE DE VEILLE') : t('REMOVED FROM WATCHLIST', 'RETIRÉ DE LA LISTE DE VEILLE'));

    // Persistent update
    try {
      await handleUpdateUser({
        watchlist: newWatchlist,
        usageStats: { ...usageStats, swipe: newWatchlist.length }
      });
    } catch (err) {
      console.error('Watchlist update failed:', err);
      // Revert local state on failure
      setWatchlist(watchlist);
    }
  };

  const handleToggleComparison = async (contractId: string) => {
    if (!user) {
      notify(t('PLEASE SIGN IN TO COMPARE ASSETS', 'VEUILLEZ VOUS CONNECTER POUR COMPARER DES ACTIFS'));
      return;
    }

    const isCompared = comparisonList.includes(contractId);
    
    // Strict enforcement of 20 slots for standard users
    if (!isCompared && comparisonList.length >= 20 && !user.isPro && user.role !== 'ADMIN') {
      notify(t('COMPARISON LIMIT REACHED (20/20). UPGRADE TO PRO TO UNLOCK MORE SLOTS.', 'LIMITE DE COMPARAISON ATTEINTE (20/20). PASSEZ AU PRO POUR DÉBLOQUER PLUS DE SLOTS.'));
      setCurrentView('PRICING');
      return;
    }

    const nextList = isCompared 
      ? comparisonList.filter(id => id !== contractId)
      : [...comparisonList, contractId];

    // Update locally immediately
    setComparisonList(nextList);
    notify(isCompared ? t('REMOVED FROM COMPARISON', 'RETIRÉ DE LA COMPARAISON') : t('ADDED TO COMPARISON', 'AJOUTÉ À LA COMPARAISON'));

    try {
      await handleUpdateUser({
        comparisonList: nextList,
        usageStats: { ...usageStats, compare: nextList.length }
      });
    } catch (err) {
      console.error('Comparison update failed:', err);
      // Revert local state on failure
      setComparisonList(comparisonList);
    }
  };

  const handleUsageUpdate = (newStats: any) => {
    setUsageStats(newStats);
    if (user?.uid) {
      updateDoc(doc(db, 'users', user.uid), {
        usageStats: newStats
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Set visitor flag BEFORE signOut to prevent navigation guard from redirecting
      sessionStorage.setItem('lya_visitor_mode', 'true');
      await signOut(auth);
      setSimulatedRole(null);
      setUser(null);
      setNotification(t('LOGGED OUT SUCCESSFULLY', 'DÉCONNEXION RÉUSSIE'));
      setCurrentView('HOME');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  const handleEnterDemo = () => {
    localStorage.setItem('lya_demo_access', 'true');
    setCurrentView('HOME');
    addNotification('DEMO ACCESS GRANTED', t('Welcome to the LYA Demo environment.', 'Bienvenue dans l\'environnement de démonstration LYA.'), 'SUCCESS');
  };

  const isAuthView = currentView === 'LOGIN' || currentView === 'SIGNUP';
  const isLandingView = currentView === 'LANDING';

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[1000] bg-surface-dim flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-12"
        >
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary-cyan/20 blur-[80px] rounded-full"
            />
            <Logo size={160} color="multi" showBeta={true} />
          </div>
          
          <div className="space-y-4 w-64">
            <div className="h-0.5 w-full bg-white/5 overflow-hidden rounded-full">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-primary-cyan via-purple-500 to-rose-500"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black tracking-[0.3em] text-white/20 uppercase font-mono">
              <span>INITIALIZING</span>
              <span>v4.2.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isPendingApproval = user && user.status === 'PENDING_APPROVAL' && !isLandingView && !isAuthView;

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-black text-white relative flex flex-col selection:bg-primary-cyan/35">
        <Notification message={notification} />
        <PendingApprovalView 
          user={user!} 
          onApprove={async () => {
            const updatedProfile = { ...user!, status: 'APPROVED' as const };
            setUser(updatedProfile);
            try {
              await updateDoc(doc(db, 'users', user!.uid), { status: 'APPROVED' });
            } catch(e) {
              console.warn("Could not write status: APPROVED to firestore:", e);
            }
            addNotification('ACCESS GRANTED', t('Your professional access key has been generated and validated.', 'Votre accès professionnel a été validé.'), 'SUCCESS');
            setCurrentView('HOME');
          }}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface font-body selection:bg-primary-cyan/30 relative shadow-2xl overflow-x-hidden">
        <Notification message={notification} />
        
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onViewChange={setCurrentView}
          onSelectContract={(c) => {
            setViewingContract(c);
            setCurrentView('CONTRACT_DETAIL');
          }}
          onLogout={handleLogout}
        />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onNotify={notify}
          setUser={setUser}
        />

        <ConceptTutorial 
          isOpen={showConceptTutorial && !isLandingView}
          onClose={() => {
            setShowConceptTutorial(false);
            localStorage.setItem('lya_concept_tutorial_seen', 'true');
            if (user?.uid) {
              updateDoc(doc(db, 'users', user.uid), { hasSeenTutorial: true });
            }
          }}
        />

        {!isAuthView && !isLandingView && currentView !== 'CONTRACT_DETAIL' && (
          <>
            <Sidebar 
              user={effectiveUser}
              watchlist={watchlist}
              comparisonList={comparisonList}
              onNotify={notify} 
              currentView={currentView} 
              onViewChange={handleViewChange}
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <Topbar 
              user={effectiveUser}
              onNotify={notify} 
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              currentView={currentView}
              onViewChange={(view) => {
                if ((view === 'LOGIN' || view === 'PROFILE') && !effectiveUser) {
                  setCurrentView('LOGIN'); // Switch to full screen login
                } else {
                  setCurrentView(view);
                }
              }}
              onSelectContract={(c) => {
                setViewingContract(c);
                setCurrentView('CONTRACT_DETAIL');
              }}
              isSidebarCollapsed={isSidebarCollapsed}
              setUser={(u) => {
                const userEmail = u?.email?.toLowerCase();
                if (u && (userEmail === 'linkyourart@gmail.com' || userEmail === 'lequimejeanbaptiste@gmail.com')) {
                  u.role = UserRole.ADMIN;
                  u.isPro = true;
                }
                setUser(u);
                if (u) {
                  addNotification('AUTHENTICATION SUCCESSFUL', `Welcome back, ${u.displayName}.`, 'SUCCESS');
                }
              }}
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </>
        )}

        <main className={`transition-all duration-300 ${(!isAuthView && !isLandingView && currentView !== 'CONTRACT_DETAIL') ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72') : ''} ${(!isAuthView && !isLandingView && currentView !== 'CONTRACT_DETAIL') ? 'pt-8 pb-20' : ''} min-h-screen relative flex flex-col shadow-2xl overflow-hidden`}>
          <div className={`${['EXCHANGE', 'REGISTRY', 'WATCHLIST', 'SETTLEMENT', 'DASHBOARD'].includes(currentView) ? 'max-w-[2000px]' : 'max-w-[2000px]'} mx-auto w-full flex-1 flex flex-col relative ${(!isLandingView && currentView !== 'CONTRACT_DETAIL') ? 'px-4 md:px-6' : ''}`}>
            <ErrorBoundary name="View Carrier" resetKey={currentView}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-1 flex flex-col"
                >
              {currentView === 'LANDING' && <LandingView onEnterDemo={handleEnterDemo} onViewChange={handleViewChange} />}
              {currentView === 'HOME' && <HomeView user={effectiveUser} onViewChange={handleViewChange} liveContracts={liveContracts} />}
              {currentView === 'SIGNUP' && <SignupView onViewChange={handleViewChange} setUser={(u) => {
                setUser(u);
                addNotification('ACCOUNT CREATED', 'Your professional account has been successfully initialized.', 'SUCCESS');
              }} />}
              {currentView === 'LOGIN' && <LoginView onViewChange={handleViewChange} setUser={(u) => {
                setUser(u);
                addNotification('LOGIN SUCCESSFUL', `Welcome back to the LYA terminal, ${u.displayName}.`, 'SUCCESS');
              }} />}
              {currentView === 'PROFILE' && (
                effectiveUser ? (
                  <ProfileView 
                    user={effectiveUser ?? user!} 
                    onUpdateUser={handleUpdateUser} 
                    onNotify={notify} 
                    onViewChange={handleViewChange}
                    onLogout={() => {
                      setUser(null);
                      setCurrentView('HOME');
                      notify('LOGGED OUT');
                    }}
                    usageStats={usageStats}
                    checkUsageLimit={checkUsageLimit}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" onClick={() => setIsAuthModalOpen(true)}>
                    <div className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mb-6 border border-primary-cyan/20 cursor-pointer">
                      <RefreshCw size={32} className="text-primary-cyan animate-spin-slow" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{t('AUTHENTICATING...', 'AUTHENTIFICATION...')}</h2>
                    <p className="text-on-surface-variant max-w-xs mx-auto text-sm mb-8 opacity-70">
                      {t('Verifying credentials with the LYA terminal...', 'Vérification des identifiants avec le terminal LYA...')}
                    </p>
                  </div>
                )
              )}
              {currentView === 'DASHBOARD' && <DashboardView 
                onViewChange={handleViewChange}
                onNotify={notify}
                onSelectContract={(c) => {
                  const liveContract = liveContracts.find(lc => lc.id === c.id) || c;
                  setViewingContract(liveContract);
                  setCurrentView('CONTRACT_DETAIL');
                }} 
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                userContracts={userContracts}
                liveContracts={liveContracts}
                user={effectiveUser}
              />}
              {currentView === 'CREATOR_DASHBOARD' && <CreatorDashboardView user={effectiveUser} onNotify={notify} onViewChange={handleViewChange} />}
              {currentView === 'INVESTOR_DASHBOARD' && <InvestorDashboardView user={effectiveUser} onNotify={notify} onViewChange={handleViewChange} />}
              {currentView === 'PROFESSIONAL_DASHBOARD' && <ProfessionalDashboardView user={effectiveUser} onNotify={notify} onViewChange={handleViewChange} />}
              {currentView === 'PROJECT_PUBLIC' && <ProjectPublicView contractId={viewingContract?.id} onViewChange={handleViewChange} onNotify={notify} user={effectiveUser} />}
              {currentView === 'CONTRACT_DETAIL' && viewingContract && (
                <ContractDetailView 
                  contract={liveContracts.find(c => c.id === viewingContract.id) || viewingContract} 
                  onBack={() => setCurrentView('EXCHANGE')} 
                  onTrade={handleOpenTrade}
                  onPlaceOrder={handlePlaceOrder}
                  onNotify={notify}
                  isWatchlisted={watchlist.includes(viewingContract.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}
              {currentView === 'TERMS' && <LegalView type="TERMS" onNotify={notify} />}
              {currentView === 'PRIVACY' && <LegalView type="PRIVACY" onNotify={notify} />}
              {currentView === 'LEGAL_REGISTRY' && <LegalView type="REGISTRY" onNotify={notify} />}
              {currentView === 'EXCHANGE' && (
              <>
                <ExchangeView 
                  orders={orders}
                  activities={activities}
                  onNotify={notify}
                  onOpenTrade={handleOpenTrade}
                  onOpenOffer={handleOpenOffer}
                  onOpenTransfer={handleOpenTransfer}
                  onOpenIssuerProfile={handleOpenIssuerProfile}
                  onSelectContract={(c) => {
                    const liveContract = liveContracts.find(lc => lc.id === c.id) || c;
                    setViewingContract(liveContract);
                    setCurrentView('CONTRACT_DETAIL');
                  }}
                  onCancelOrder={cancelOrder}
                  onExportOrders={handleExportOrders}
                  rarityFilter={rarityFilter}
                  setRarityFilter={setRarityFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  orderTypeFilter={orderTypeFilter}
                  setOrderTypeFilter={setOrderTypeFilter}
                  orderContractFilter={orderContractFilter}
                  setOrderContractFilter={setOrderContractFilter}
                  verificationLevel={verificationLevel}
                  onOpenVerification={() => setIsVerificationModalOpen(true)}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  comparisonList={comparisonList}
                  onToggleComparison={handleToggleComparison}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  jurisdictionFilter={jurisdictionFilter}
                  setJurisdictionFilter={setJurisdictionFilter}
                  user={effectiveUser}
                  usageStats={usageStats}
                  liveContracts={liveContracts}
                />
                {!effectiveUser && (
                  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-[#0D1117]/95 border border-primary-cyan/30 backdrop-blur-xl shadow-2xl font-mono">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Aperçu visiteur</span>
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Créer un compte</button>
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Se connecter</button>
                  </div>
                )}
              </>
              )}
              {currentView === 'VALIDATION' && <ValidationView user={effectiveUser} onNotify={notify} onViewChange={setCurrentView} />}
              {currentView === 'HOLDINGS' && <HoldingsView onNotify={notify} userContracts={userContracts} onViewChange={setCurrentView} />}
              {currentView === 'WALLET' && <WalletView user={effectiveUser} onNotify={notify} onViewChange={setCurrentView} />}
              {currentView === 'REGISTRY' && (
              <>
                <RegistryView 
                  user={effectiveUser}
                  onNotify={notify}
                  allContracts={liveContracts}
                  onSelectContract={(c) => {
                    setViewingContract(c);
                    setCurrentView('CONTRACT_DETAIL');
                  }}
                  onViewChange={setCurrentView}
                />
                {!effectiveUser && (
                  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-[#0D1117]/95 border border-primary-cyan/30 backdrop-blur-xl shadow-2xl font-mono">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Aperçu visiteur</span>
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Créer un compte</button>
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Se connecter</button>
                  </div>
                )}
              </>
              )}
              {currentView === 'LINK_ART' && (
                <LinkArtView 
                  user={effectiveUser} 
                  onNotify={notify} 
                  onViewChange={setCurrentView} 
                />
              )}
              {currentView === 'SETTLEMENT' && <SettlementView user={effectiveUser} onNotify={notify} onViewChange={setCurrentView} />}
              {currentView === 'LOUNGE' && (
                <LoungeView 
                  user={effectiveUser} 
                  onNotify={notify} 
                  onViewChange={setCurrentView} 
                  onProfessionalChatToggle={setIsProfessionalChatActive}
                />
              )}
              {currentView === 'PRICING' && (
                <PricingView 
                  onSelectPlan={(plan) => {
                    if (!effectiveUser) {
                      notify(t('Please sign in to upgrade', 'Veuillez vous connecter pour passer au Pro'));
                      setIsAuthModalOpen(true);
                      return;
                    }
                    setCheckoutData({
                      type: 'PRO_UPGRADE',
                      amount: plan.price,
                      title: plan.name,
                      metadata: {
                        type: 'PRO_UPGRADE',
                        planName: plan.name,
                        userEmail: effectiveUser.email,
                        userId: effectiveUser.uid
                      }
                    });
                  }} 
                  onNotify={notify} 
                />
              )}
              {currentView === 'SWIPE' && (
                <SwipeView 
                  user={effectiveUser}
                  usageStats={usageStats}
                  onUsageUpdate={handleUsageUpdate}
                  onNotify={notify} 
                  watchlist={watchlist} 
                  allContracts={CONTRACTS}
                  onToggleWatchlist={handleToggleWatchlist} 
                  comparisonList={comparisonList}
                  onToggleComparison={handleToggleComparison}
                  onViewChange={setCurrentView}
                  checkUsageLimit={checkUsageLimit}
                />
              )}
              {currentView === 'MECENAT' && (
                <MecenatView />
              )}
              {currentView === 'COMPARE' && (
                <CompareView 
                  comparisonList={comparisonList}
                  allContracts={CONTRACTS}
                  onRemoveFromComparison={handleToggleComparison}
                  onNotify={notify}
                  onViewChange={setCurrentView}
                  onViewDetail={(c) => {
                    setViewingContract(c);
                    setCurrentView('CONTRACT_DETAIL');
                  }}
                  isPro={user?.role === UserRole.ADMIN || user?.role === UserRole.PROFESSIONAL || user?.isPro}
                />
              )}
              {currentView === 'WATCHLIST' && (
                <WatchlistView 
                  onNotify={notify} 
                  watchlist={watchlist} 
                  allContracts={CONTRACTS}
                  onToggleWatchlist={handleToggleWatchlist} 
                  onSelectContract={(c) => {
                    setViewingContract(c);
                    setCurrentView('CONTRACT_DETAIL');
                  }}
                />
              )}
              {currentView === 'SOCIAL_FEED' && <SocialFeedView onNotify={notify} />}
              {currentView === 'GOVERNANCE' && <GovernanceView user={effectiveUser} onNotify={notify} />}
              {currentView === 'API' && <APIView user={effectiveUser} onNotify={notify} />}
              {currentView === 'ACADEMY' && <AcademyView user={effectiveUser} onNotify={notify} onViewChange={handleViewChange} />}
              {currentView === 'ADMIN_PANEL' && <AdminView user={user} onNotify={notify} onViewChange={setCurrentView} liveContracts={liveContracts} />}
              {currentView === 'APPLY_VERIFICATION' && <ApplyForVerificationView onNotify={notify} />}
              {currentView === 'TAX_OPTIMIZER' && <TaxOptimizerView onNotify={notify} />}
              {currentView === 'ISSUER_PROFILE' && (
                <IssuerProfileView 
                  issuerId={activeIssuerId || 'UNKNOWN'} 
                  onBack={() => setCurrentView('EXCHANGE')} 
                />
              )}
              {currentView === 'ABOUT' && <AboutView onViewChange={handleViewChange} onNotify={notify} />}
              {currentView === 'OUR_MODEL' && <LegalView type="OUR_MODEL" onNotify={notify} />}
              {currentView === 'FAQ' && <LegalView type="FAQ" onNotify={notify} />}
              {currentView === 'LEGAL_MENTIONS' && <LegalView type="MENTIONS" onNotify={notify} />}
              {currentView === 'SETTINGS' && <SettingsView />}
              
              {/* Fallback for safety */}
              {(!currentView || (['CONTRACT_DETAIL', 'PAYMENT', 'ISSUER_PROFILE'].includes(currentView) && ((currentView === 'CONTRACT_DETAIL' && !viewingContract) || (currentView === 'PAYMENT' && !checkoutData) || (currentView === 'ISSUER_PROFILE' && !activeIssuerId)))) && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-primary-cyan/10 rounded-full flex items-center justify-center mb-6 border border-primary-cyan/20">
                    <RefreshCw size={32} className="text-primary-cyan animate-spin-slow" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{t('RESTORING SESSION', 'RESTAURATION DE LA SESSION')}</h2>
                  <p className="text-on-surface-variant max-w-xs mx-auto text-sm mb-8 opacity-70">
                    {t('We couldn\'t find the active data for this view. Redirecting you to the terminal...', 'Nous n\'avons pas trouvé les données actives pour cette vue. Redirection vers le terminal...')}
                  </p>
                  <button 
                    onClick={() => setCurrentView('HOME')}
                    className="px-8 py-3 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)]"
                  >
                    {t('BACK TO TERMINAL', 'RETOUR AU TERMINAL')}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </main>

        <LYACopilot />

        <AnimatePresence mode="sync">
          {checkoutData && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-surface-dim/95 backdrop-blur-2xl overflow-y-auto pt-24 pb-12 px-6"
            >
              <PaymentView 
                checkoutData={checkoutData}
                userEmail={user?.email}
                stripeCustomerId={user?.stripeCustomerId}
                onSuccess={() => {
                  notify(t('TRANSACTION SUCCESSFUL', 'TRANSACTION RÉUSSIE'));
                  setCheckoutData(null);
                  if (checkoutData.type === 'PRO_UPGRADE') {
                    setCurrentView('PROFILE');
                  } else {
                    setCurrentView('HOLDINGS');
                  }
                }}
                onCancel={() => setCheckoutData(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <ContractDetailModal 
          isOpen={!!selectedContract}
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)}
          onTrade={handleOpenTrade}
        />

        <ProfessionalOnboardingModal 
          isOpen={isVerificationModalOpen} 
          onClose={() => setIsVerificationModalOpen(false)}
          onVerify={handleVerify}
          isVerifying={isVerifying}
        />

        <TradeModal 
          tradingContract={tradingContract}
          onClose={() => setTradingContract(null)}
          onTrade={handlePlaceOrder}
          tradeVolume={tradeVolume}
          setTradeVolume={setTradeVolume}
          tradePrice={tradePrice}
          setTradePrice={setTradePrice}
        />

        <OfferModal 
          isOpen={isOfferModalOpen} 
          onClose={() => setIsOfferModalOpen(false)} 
          contract={transactionContract} 
        />
        <TransferModal 
          isOpen={isTransferModalOpen} 
          onClose={() => setIsTransferModalOpen(false)} 
          contract={transactionContract} 
        />

        {!isLandingView && !isAuthView && (
          <footer className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} py-8 border-t border-white/5 bg-surface-dim/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-center px-12 gap-4`}>
            <div className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant opacity-40">
              © 2026 LINKYOURART. CREATIVE ECOSYSTEM V4.2.0
            </div>
            <div className="flex gap-8 font-headline text-[9px] uppercase tracking-[0.2em]">
              <button onClick={() => handleViewChange('OUR_MODEL')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('Our Model', 'Notre Modèle')}</button>
              <button onClick={() => handleViewChange('FAQ')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('FAQ', 'FAQ')}</button>
              <button onClick={() => handleViewChange('LEGAL_MENTIONS')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('Legal Mentions', 'Mentions Légales')}</button>
              <button onClick={() => handleViewChange('TERMS')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('Terms', 'Conditions')}</button>
              <button onClick={() => handleViewChange('PRIVACY')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('Privacy', 'Confidentialité')}</button>
              <button onClick={() => handleViewChange('LEGAL_REGISTRY')} className="text-on-surface-variant hover:text-primary-cyan transition-colors">{t('Registries', 'Registres')}</button>
            </div>
            <div className="flex gap-4 items-center relative">
              <div className="flex flex-col items-end z-10">
                <span className="text-[10px] font-mono text-primary-cyan font-bold">LYA_JOURNEY: ACTIVE</span>
                <span className="text-[10px] font-mono text-on-surface-variant opacity-60">HUB_CONNECTION: SECURE</span>
              </div>
              <div className="w-12 h-12 flex items-center justify-center relative z-20">
                <div className="w-4 h-4 bg-primary-cyan rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,255,1)]" />
              </div>
            </div>
          </footer>
        )}

        {/* Role Simulator — Admin only, always real user check */}
        {user?.role === UserRole.ADMIN && (
          <RoleSimulatorBar
            simulatedRole={simulatedRole}
            onRoleChange={setSimulatedRole}
          />
        )}
    </div>
  );
}
