import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { Logo } from '../components/ui/Logo';
import { KidiWorldModal } from '../components/ui/KidiWorldModal';
import { ExternalLink, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Globe, 
  Shield, 
  CheckCircle2,
  Mail,
  User,
  Lock,
  MousePointer2,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Info,
  RefreshCw,
  X,
  Copy,
  Share2,
  Users2,
  Award
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit, doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

interface LandingViewProps {
  onEnterDemo: () => void;
  onViewChange?: (view: any) => void;
}

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-cyan rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{ 
            y: [null, "-10%"],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
};

const ElevatedTextLogo = ({ size = 'text-2xl' }: { size?: string }) => {
  return (
    <div className={`font-sans ${size} font-black tracking-tight text-white uppercase leading-none flex items-baseline`}>
      <span className="h-full">LINKYOURART</span>
    </div>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onEnterDemo, onViewChange }) => {
  const introLang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('fr')) ? 'FR' : 'EN';
  const { t, language, setLanguage } = useTranslation();
  const [stage, setStage] = useState<'INTRO' | 'MAIN'>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('lya_intro_completed') === 'true') {
      return 'MAIN';
    }
    return 'INTRO';
  });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'CREATOR' | 'PROFESSIONAL' | 'PATRON'>('CREATOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralAutoFilled, setReferralAutoFilled] = useState(false);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [totalRegistrations, setTotalRegistrations] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoRequestReason, setDemoRequestReason] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [keyError, setKeyError] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [activeLegal, setActiveLegal] = useState<'GDPR' | 'PRIVACY' | 'TERMS' | null>(null);
  const [activeInfo, setActiveInfo] = useState<'HOW' | 'SCORE' | 'SECURITY' | null>(null);
  const [showKidiModal, setShowKidiModal] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showLoginEaster, setShowLoginEaster] = useState(false);
  const logoTapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-09-01T00:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stage === 'INTRO') {
      const timer = setTimeout(() => {
        setStage('MAIN');
        sessionStorage.setItem('lya_intro_completed', 'true');
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      sessionStorage.setItem('lya_intro_completed', 'true');
    }
  }, [stage]);

  // ── Parrainage : capture du code ?ref= dans l'URL ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferredBy(ref.toUpperCase());
      setReferralAutoFilled(true);
      try { localStorage.setItem('lya_referred_by', ref.toUpperCase()); } catch {}
    } else {
      try {
        const stored = localStorage.getItem('lya_referred_by');
        if (stored) { setReferredBy(stored); setReferralAutoFilled(true); }
      } catch {}
    }
  }, []);

  // ── Compteur public — Firestore client direct
  useEffect(() => {
    const counterRef = doc(db, 'public_stats', 'pre_registrations');
    const unsub = onSnapshot(counterRef,
      (snap) => {
        if (snap.exists()) {
          setTotalRegistrations(Number(snap.data().count) || 0);
        } else {
          // Document inexistant — on le crée avec count=0
          setDoc(counterRef, { count: 0, updatedAt: serverTimestamp() }, { merge: true })
            .catch(() => {});
          setTotalRegistrations(0);
        }
      },
      (err) => {
        console.error('[COUNTER READ ERROR]', err.code, err.message);
        setTotalRegistrations(0);
      }
    );
    return () => unsub();
  }, []);

  const generateReferralCode = (n: string) => {
    const initials = n.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LYA';
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${initials}-${suffix}`;
  };

  const TEST_EMAILS = ['linkyourart@gmail.com', 'jblequime27061983@gmail.com', 'lequimejeanbaptiste@gmail.com', 'jlequime@hotmail.com'];

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setIsSubmitting(true);

    // Check email uniqueness (except test emails)
    const isTestEmail = TEST_EMAILS.includes(email.toLowerCase().trim());
    if (!isTestEmail) {
      try {
        const existing = await getDocs(query(
          collection(db, 'pre_registrations'),
          where('email', '==', email.toLowerCase().trim()),
          limit(1)
        ));
        if (!existing.empty) {
          setIsSubmitting(false);
          // Show error via existing notification or alert
          window.alert(language === 'FR'
            ? 'Cette adresse email est déjà pré-inscrite. Vérifiez votre boîte mail pour l\'email de confirmation.'
            : 'This email is already pre-registered. Check your inbox for the confirmation email.'
          );
          return;
        }
      } catch (e) {
        console.warn('[EMAIL CHECK]', e);
        // Continue if check fails
      }
    }

    const code = generateReferralCode(name);

    // 1. Position — always use local first, then try Firestore (never blocks)
    const localPreList = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
    let position: number = (totalRegistrations || 0) + 1;

    // Incrément Firestore direct — atomic, persiste immédiatement
    try {
      const counterRef = doc(db, 'public_stats', 'pre_registrations');
      await setDoc(counterRef, { count: increment(1), updatedAt: serverTimestamp() }, { merge: true });
      const snap = await getDoc(counterRef);
      if (snap.exists()) position = snap.data().count || position;
    } catch (e) {
      console.error('[COUNTER]', e);
      position = (totalRegistrations || 0) + 1;
    }

    // 2. Save to Firestore async (don't await — never blocks the user)
    addDoc(collection(db, 'pre_registrations'), {
      name, email, category,
      timestamp: serverTimestamp(),
      type: 'PRE_REGISTRATION',
      position,
      referralCode: code,
      referredBy: referredBy || null,
    }).catch((writeError) => {
      console.error("Error saving pre-registration:", writeError);
    });

    // 3. Toujours persister localement et confirmer à l'utilisateur
    const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
    localPre.push({ id: 'local_pre_' + Date.now(), name, email, category, position, referralCode: code, timestamp: { toDate: () => new Date() }, type: 'PRE_REGISTRATION' });
    localStorage.setItem('lya_local_pre_registrations', JSON.stringify(localPre));

    setQueuePosition(position);
    setTotalRegistrations(position);
    setReferralCode(code);
    try { localStorage.setItem('lya_my_referral_code', code); } catch {}

    // Envoi email de confirmation
    const referralLinkForEmail = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?ref=${code}`
      : `https://www.linkyourart.com?ref=${code}`;
    
    fetch('/api/email/pre-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, name, position, referralCode: code, referralLink: referralLinkForEmail, lang: language })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        console.log('[LYA EMAIL] Sent to', email, 'via', data.method);
      } else {
        console.error('[LYA EMAIL] Failed:', data.error);
      }
    })
    .catch(err => console.error('[LYA EMAIL ERROR]', err));

    // Update local display immediately
    setTotalRegistrations(position);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      localDemo.push({ id: 'local_demo_' + Date.now(), name, email, reason: demoRequestReason, timestamp: { toDate: () => new Date() }, type: 'DEMO_REQUEST', status: 'PENDING' });
      localStorage.setItem('lya_local_demo_requests', JSON.stringify(localDemo));
      await addDoc(collection(db, 'demo_requests'), { name, email, reason: demoRequestReason, timestamp: serverTimestamp(), type: 'DEMO_REQUEST' });
      setDemoSubmitted(true);
    } catch (error) {
      console.error("Error saving demo request:", error);
      handleFirestoreError(error, OperationType.CREATE, 'demo_requests');
      setDemoSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyKey = async () => {
    if (!accessKey) return;
    setIsVerifyingKey(true);
    setKeyError(false);
    try {
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      const hasLocalKey = localKeys.some((k: any) => k.key.trim().toUpperCase() === accessKey.trim().toUpperCase() && k.status !== 'REVOKED');
      if (hasLocalKey) { onEnterDemo(); return; }
      const q = query(collection(db, 'access_keys'), where('key', '==', accessKey.trim().toUpperCase()), where('status', '==', 'ACTIVE'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) { onEnterDemo(); } else { setKeyError(true); }
    } catch (error) {
      console.error("Error verifying key:", error);
      if (accessKey.trim().length >= 4) { onEnterDemo(); } else { setKeyError(true); }
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const referralLink = referralCode && typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?ref=${referralCode}`
    : '';

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleShareReferralLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinkYourArt',
          text: t('Join me on LinkYourArt — exclusive access for pioneers.', 'Rejoins-moi sur LinkYourArt — accès exclusif pour les pionniers.'),
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopyReferralLink();
    }
  };

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    if (newCount >= 3) { setShowLoginEaster(true); setLogoTapCount(0); }
    else { logoTapTimer.current = setTimeout(() => setLogoTapCount(0), 1500); }
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-white font-body selection:bg-primary-cyan/30 overflow-x-hidden relative">
      <AnimatePresence mode="wait">
        {stage === 'INTRO' ? (
          <motion.div 
            key="intro"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }} className="relative">
              <Logo size={120} color="multi" showBeta={true} className="z-10" />
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 4], opacity: [0.5, 0] }} transition={{ duration: 2, times: [0, 1] }} className="absolute inset-0 bg-primary-cyan/20 rounded-full blur-2xl" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1 }} className="mt-12 text-center">
              <h2 className="font-headline font-light text-2xl tracking-[0.5em] text-white/40 uppercase">
                INITIATING <span className="text-white font-bold">LINKYOURART</span>
              </h2>
              <div className="mt-4 w-48 h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/40 to-transparent mx-auto overflow-hidden">
                <motion.div animate={{ x: [-200, 200] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-primary-cyan" />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="relative z-10">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80vh] bg-[radial-gradient(ellipse_at_top,rgba(0,224,255,0.08)_0%,transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-50 pointer-events-none opacity-[0.2]" />
              <ParticleBackground />
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(157,0,255,0.05)_0%,transparent_50%)] blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center max-w-full max-w-7xl mx-auto relative z-[60]">
              <div className="flex md:hidden w-full items-center relative py-2">
                <div className="flex flex-col items-start gap-2 z-10">
                  <button onClick={() => setShowDemoModal(true)} className="flex bg-white/5 border border-white/10 hover:border-primary-cyan/50 transition-all p-2.5 rounded-full items-center justify-center">
                    <Lock size={13} />
                  </button>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5">
                    <button onClick={() => setLanguage('FR')} className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all ${language === 'FR' ? 'bg-white text-black' : 'text-white/40'}`}>FR</button>
                    <button onClick={() => setLanguage('EN')} className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all ${language === 'EN' ? 'bg-white text-black' : 'text-white/40'}`}>EN</button>
                  </div>
                </div>
                <div className="absolute left-0 right-0 flex flex-col items-center cursor-pointer" onClick={handleLogoTap}>
                  <Logo size={100} color="multi" showBeta={true} />
                  <motion.span className="text-[10px] font-black tracking-[0.3em] text-primary-cyan uppercase mt-1.5" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                    ALL CREATIVE INDUSTRIES
                  </motion.span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 cursor-pointer" onClick={handleLogoTap}>
                <Logo size={48} color="multi" showBeta={true} />
                <div className="flex flex-col">
                  <ElevatedTextLogo size="text-2xl" />
                  <span className="text-xs font-black tracking-[0.4em] text-primary-cyan uppercase opacity-70 mt-1">{t('YOUR SCORE. YOUR STANDARD.', 'VOTRE SCORE. VOTRE STANDARD.')}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 md:gap-12">
                <div className="hidden xl:flex items-center gap-12 text-[15px] font-black tracking-[0.25em] uppercase">
                  <motion.button onClick={() => setActiveInfo('HOW')} whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} className="text-white/40 transition-colors hover:text-primary-cyan group flex items-center gap-2">
                    {t('How It Works', 'Comment Ça Marche')}
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan opacity-80 shadow-[0_0_8px_rgba(0,224,255,1)]" />
                  </motion.button>
                  <motion.button onClick={() => setActiveInfo('SCORE')} whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} className="text-white/40 transition-colors hover:text-[#FF007F] group flex items-center gap-2">
                    {t('LYA Score', 'Score LYA')}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF007F] opacity-80 shadow-[0_0_8px_rgba(255,0,127,1)]" />
                  </motion.button>
                  <motion.button onClick={() => setActiveInfo('SECURITY')} whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} className="text-white/40 transition-colors hover:text-[#9D00FF] group flex items-center gap-2">
                    {t('Security', 'Sécurité')}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9D00FF] opacity-80 shadow-[0_0_8px_rgba(157,0,255,1)]" />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                  <button onClick={() => setLanguage('FR')} className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${language === 'FR' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>FR</button>
                  <button onClick={() => setLanguage('EN')} className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${language === 'EN' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>EN</button>
                </div>
                <button onClick={() => onViewChange?.('LOGIN')} className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                  <User size={14} />
                  {t('LOGIN', 'CONNEXION')}
                </button>
                <button onClick={() => setShowDemoModal(true)} className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all" style={{background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,215,0,0.06))',border:'1px solid rgba(255,215,0,0.35)',color:'#FFD700',boxShadow:'0 0 20px rgba(255,215,0,0.1)'}}>
                  <span style={{fontSize:'10px'}}>◆</span>
                  <span className="hidden sm:inline">{t('PRIVATE DISCOVERY', 'DÉCOUVERTE PRIVÉE')}</span>
                </button>
              </div>
            </nav>

            {/* ── HERO ── */}
            <div className="max-w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 px-4 md:px-8 pt-8 md:pt-16 pb-20 md:pb-32 items-center relative z-10">
              <div className="lg:col-span-7 space-y-8 relative z-20">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}>
                  
                  <div className="inline-flex items-center gap-4 px-5 py-2 border border-primary-cyan/30 bg-primary-cyan/10 rounded-full text-[11px] font-black tracking-[0.3em] text-primary-cyan uppercase mb-6 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-cyan"></span>
                    </span>
                    {t('EXCLUSIVE ACCESS — PIONEERS ONLY', "ACCÈS EXCLUSIF — PIONNIERS UNIQUEMENT")}
                  </div>

                  {/* ── TITRE : 2 lignes, typo ultra grasse ── */}
                  <h2 className="font-headline text-5xl md:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.88] text-on-surface mb-6" style={{ textShadow: "0 0 60px rgba(0,212,255,0.12)" }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
                      {t("THE SOVEREIGN STANDARD", "L'ÉTALON SOUVERAIN")}<br />
                      <span className="text-primary-cyan" style={{ WebkitTextStroke: "1px rgba(0,212,255,0.3)" }}>{t("FOR CREATIVE WORKS", "DE LA CRÉATION")}</span>
                    </motion.div>
                  </h2>

                  {/* ── PHRASE SIGNATURE ── */}
                  <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-xl md:text-2xl xl:text-3xl font-black text-white italic tracking-tight mb-6 border-l-4 border-primary-cyan pl-5">
                    "{t('Your creativity has value. We certify it. Patrons recognize it.', 'Votre créativité a une valeur. Nous la certifions. Des mécènes la reconnaissent.')}"
                  </motion.p>

                  <p className="text-white/70 text-base md:text-lg xl:text-xl font-medium leading-relaxed max-w-2xl">
                    {t(
                      "20 years of history. One conviction, art has value: LinkYourArt appraises it, certifies it and shares it — for every creator in the world.",
                      "20 ans d'histoire. Une seule conviction, l'art a de la valeur : LinkYourArt l'expertise, la certifie et la partage — pour tous les créateurs du monde."
                    )}
                  </p>

                </motion.div>

                {/* Compteur pré-inscrits — intégré */}
                <div className="flex items-center gap-3 p-4 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-sm w-fit">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"/>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{t('Open', 'Ouvert')}</span>
                  </div>
                  <div className="w-px h-5 bg-white/10"/>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary-cyan">{(totalRegistrations || 0).toLocaleString()}</span>
                    <span className="text-xs text-white/40 font-black uppercase tracking-widest">{t('pioneers registered', 'pionniers inscrits')}</span>
                  </div>
                </div>

                {/* Preuve sociale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {[
                    {
                      value: "20",
                      label: t("years of creative history", "ans d'histoire créative"),
                      sub: t("Founded in 2006", "Fondé en 2006"),
                      color: "#00d4ff"
                    },
                    {
                      value: "9+",
                      label: t("artistic universes & beyond", "univers artistiques & plus"),
                      sub: t("Music · Film · Fashion · Gaming · Architecture · Photography · TV Series · and more", "Musique · Film · Mode · Jeu · Architecture · Photographie · Séries TV · et plus"),
                      color: "#a78bfa"
                    },
                    {
                      value: "1",
                      label: t("unique value standard", "valeur unique au monde"),
                      sub: t("The LYA Score — an objective certification standard", "Le Score LYA — un standard de certification objectif"),
                      color: "#00ff88"
                    }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + (i * 0.15) }}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
                    >
                      <div className="font-black font-mono text-2xl md:text-3xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-white text-xs font-bold mb-1">{stat.label}</div>
                      <div className="text-white/30 text-xs leading-tight">{stat.sub}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── FORMULAIRE PRÉ-INSCRIPTION ── */}
              <div className="lg:col-span-5 relative z-20 flex flex-col justify-center">
                <motion.div
                  id="pre-registration-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-10 xl:p-12 backdrop-blur-2xl relative overflow-hidden mt-6 lg:mt-0"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                  
                  {!submitted ? (
                    <div className="relative z-10 space-y-8">
                      <div className="space-y-2">
                        <h3 className="font-headline text-3xl font-black uppercase tracking-tighter">{t('PRE-REGISTRATION', 'PRÉ-INSCRIPTION')}</h3>
                        <p className="text-white/40 text-sm font-medium tracking-wide leading-relaxed">
                          {t('Join the elite circle of selected creators, professionals and visionary creative partners prior to our European and international rollout.', "Rejoignez le cercle d'élite des créateurs, professionnels et partenaire créatifs visionnaires avant notre déploiement européen puis international.")}
                        </p>
                      </div>

                      {totalRegistrations !== null && totalRegistrations > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary-cyan/5 border border-primary-cyan/20 rounded-2xl">
                          <Users2 size={14} className="text-primary-cyan shrink-0" />
                          <p className="text-primary-cyan text-[10px] font-black uppercase tracking-widest">
                            {t(`${totalRegistrations.toLocaleString('en-US')} people already on the waitlist`, `${totalRegistrations.toLocaleString('fr-FR')} personnes déjà sur la liste d'attente`)}
                          </p>
                        </div>
                      )}

                      <form onSubmit={handlePreRegister} className="space-y-6">
                        <div className="p-1 bg-white/5 rounded-2xl border border-white/10 flex gap-1">
                          {['CREATOR', 'PROFESSIONAL', 'PATRON'].map((cat) => (
                            <button key={cat} type="button" onClick={() => setCategory(cat as any)}
                              className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${category === cat ? 'bg-primary-cyan text-black shadow-lg shadow-primary-cyan/20' : 'text-white/40 hover:text-white'}`}
                            >
                              {t(
                                cat === 'CREATOR' ? 'CREATOR' : cat === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'PATRON',
                                cat === 'CREATOR' ? 'CRÉATEUR' : cat === 'PROFESSIONAL' ? 'PROFESSIONNEL' : 'MÉCÈNE'
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors" size={18} />
                            <input type="text" placeholder={t('Identity Name', 'Identité Nom')} required value={name} onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 focus:outline-none focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-bold text-sm tracking-tight"
                            />
                          </div>
                          <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors" size={18} />
                            <input type="email" placeholder={t('Contact Email', 'Email Contact')} required value={email} onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 focus:outline-none focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-bold text-sm tracking-tight"
                            />
                          </div>
                          <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-gold transition-colors text-sm font-black">✦</div>
                            <input
                              type="text"
                              placeholder={t('Referral code (optional) — ex: JEA-X7K2', 'Code parrainage (optionnel) — ex: JEA-X7K2')}
                              value={referredBy || ''}
                              onChange={(e) => { setReferredBy(e.target.value.toUpperCase().trim() || null); setReferralAutoFilled(false); }}
                              maxLength={12}
                              className={`w-full border rounded-2xl py-5 pl-16 ${referralAutoFilled && referredBy ? 'pr-14 bg-accent-gold/5 border-accent-gold/30' : 'pr-8 bg-white/5 border-white/10'} focus:outline-none focus:border-accent-gold/50 focus:bg-white/10 transition-all font-bold text-sm tracking-tight font-mono uppercase`}
                            />
                            {referralAutoFilled && referredBy && (
                              <button
                                type="button"
                                onClick={() => { setReferredBy(null); setReferralAutoFilled(false); try { localStorage.removeItem('lya_referred_by'); } catch {} }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                                aria-label={t('Clear referral code', 'Effacer le code de parrainage')}
                              >
                                <X size={16} />
                              </button>
                            )}
                            {referralAutoFilled && referredBy ? (
                              <p className="flex items-center gap-1.5 text-[9px] text-accent-gold font-bold uppercase tracking-widest mt-1.5 pl-2">
                                <CheckCircle2 size={11} />
                                {t('Referral code detected automatically — not yours? Clear it above', 'Code de parrainage détecté automatiquement — pas le vôtre ? Effacez-le ci-dessus')}
                              </p>
                            ) : (
                              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1.5 pl-2">
                                {t('Enter the code from your invitation email to boost your position', 'Entrez le code reçu dans un email d\'invitation pour booster votre position')}
                              </p>
                            )}
                          </div>
                        </div>

                        <button type="submit" disabled={isSubmitting}
                          className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary-cyan transition-all active:scale-95 text-xs flex items-center justify-center gap-3 group shadow-xl"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>{t('EXECUTE ENROLLMENT', "EXÉCUTER L'INSCRIPTION")}<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </button>
                      </form>
                      
                      <div className="pt-2 text-center">
                        <p className="text-[10px] font-bold tracking-widest text-white/20 uppercase">{t('SYSTEM SECURED BY ENCRYPTION', 'SYSTÈME SÉCURISÉ PAR CHIFFREMENT')}</p>
                      </div>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center space-y-8">
                      <div className="w-24 h-24 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto border border-primary-cyan/20 relative">
                        <CheckCircle2 size={48} className="text-primary-cyan" />
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-primary-cyan rounded-full" />
                      </div>

                      <div>
                        <h3 className="font-headline text-4xl font-black tracking-tighter uppercase mb-3">{t('IN QUEUE', 'EN ATTENTE')}</h3>
                        <p className="text-white/40 font-medium max-w-xs mx-auto leading-relaxed">
                          {t('Your entry has been validated. Our team will contact you once the terminal is ready for your profile.', 'Votre inscription a été validée. Notre équipe vous contactera une fois que le terminal sera prêt pour votre profil.')}
                        </p>
                      </div>

                      {queuePosition !== null && (
                        <div className="bg-white/[0.03] border border-primary-cyan/20 rounded-3xl p-6">
                          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-2">{t('YOUR POSITION', 'VOTRE POSITION')}</p>
                          <p className="font-headline text-5xl font-black text-primary-cyan tracking-tighter">#{queuePosition.toLocaleString('fr-FR')}</p>
                        </div>
                      )}

                      {referralLink && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                            {t('Move up the list — invite your network', "Montez dans la liste — invitez votre réseau")}
                          </p>
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
                            <p className="flex-1 text-left text-white/60 text-xs font-mono px-3 truncate">{referralLink}</p>
                            <button onClick={handleCopyReferralLink} className="shrink-0 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                              <Copy size={14} />
                            </button>
                            <button onClick={handleShareReferralLink} className="shrink-0 w-10 h-10 rounded-xl bg-primary-cyan/10 hover:bg-primary-cyan/20 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan transition-all">
                              <Share2 size={14} />
                            </button>
                          </div>
                          {linkCopied && (
                            <p className="text-primary-cyan text-[10px] font-black uppercase tracking-widest">{t('Link copied!', 'Lien copié !')}</p>
                          )}
                        </div>
                      )}

                      <button onClick={() => { setSubmitted(false); setQueuePosition(null); setReferralCode(null); }} className="text-[10px] font-black tracking-widest text-primary-cyan uppercase hover:underline">
                        {t('SUBMIT ANOTHER', 'NOUVELLE INSCRIPTION')}
                      </button>

                      {/* Debug email — temporaire */}
                    </motion.div>
                  )}
                </motion.div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#9D00FF]/10 blur-3xl rounded-full" />
              </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl py-10 md:py-16 px-4 md:px-8">
              <div className="max-w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16">
                <div className="space-y-4 md:w-1/3">
                  <div className="flex items-center gap-3">
                    <Logo size={40} color="multi" showBeta={true} />
                    <div className="flex flex-col">
                      <ElevatedTextLogo size="text-xl" />
                      <span className="text-xs font-black tracking-[0.4em] text-primary-cyan uppercase opacity-70 mt-0.5">{t('YOUR SCORE. YOUR STANDARD.', 'VOTRE SCORE. VOTRE STANDARD.')}</span>
                    </div>
                  </div>
                  <p className="text-white/30 text-sm font-medium leading-relaxed max-w-xs">
                    {t("Your creativity has value. We certify it. Patrons recognize it.", "Votre créativité a une valeur. Nous la certifions. Des mécènes la reconnaissent.")}
                  </p>
                </div>
                <div className="space-y-6 md:w-1/3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('INSTITUTIONAL ENQUIRIES', 'DEMANDES INSTITUTIONNELLES')}</h5>
                  <div className="space-y-3">
                    <a href="mailto:contact@linkyourart.com" className="block text-base font-mono font-light text-white/35 hover:text-white/60 transition-colors tracking-widest">contact@linkyourart.com</a>
                    <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">{t("Response within 24h GMT", "Réponse sous 24h GMT")}</div>
                  </div>
                </div>
                <div className="space-y-6 md:w-1/3 md:text-right">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('LEGAL & COMPLIANCE', 'LÉGAL & CONFORMITÉ')}</h5>
                  <div className="flex flex-wrap md:justify-end gap-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                    <span onClick={() => setActiveLegal('GDPR')} className="hover:text-white cursor-pointer transition-colors">GDPR</span>
                    <span onClick={() => setActiveLegal('PRIVACY')} className="hover:text-white cursor-pointer transition-colors">Digital Privacy</span>
                    <span onClick={() => setActiveLegal('TERMS')} className="hover:text-white cursor-pointer transition-colors">Terms</span>
                  </div>
                  <div className="text-xs font-black text-white/10 tracking-[0.2em]">© 2026 LINKYOURART INDUSTRIES. ALL RIGHTS RESERVED.</div>
                  <button onClick={() => setShowKidiModal(true)} className="flex items-center gap-2 mt-4 group md:ml-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 bg-white/[0.03] group-hover:border-accent-gold/40 group-hover:bg-accent-gold/5 transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF6BFF] to-[#00E0FF] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.35em] text-white/40 group-hover:text-accent-gold transition-colors">KIDI.WORLD</span>
                      <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors font-bold uppercase tracking-widest">{t('— COMING SOON', '— BIENTÔT')}</span>
                    </div>
                  </button>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <KidiWorldModal isOpen={showKidiModal} onClose={() => setShowKidiModal(false)} />

      {/* Legal Modal */}
      <AnimatePresence mode="sync">
        {activeLegal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLegal(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-[#0D1117] border border-white/10 rounded-[3rem] p-12 max-h-[80vh] overflow-y-auto lya-scrollbar shadow-3xl">
              <button onClick={() => setActiveLegal(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <Shield size={32} className="text-primary-cyan" />
                  <h3 className="font-headline text-4xl font-black uppercase tracking-tighter">
                    {activeLegal === 'GDPR' && t('GDPR COMPLIANCE', 'CONFORMITÉ RGPD')}
                    {activeLegal === 'PRIVACY' && t('DIGITAL PRIVACY', 'CONFIDENTIALITÉ NUMÉRIQUE')}
                    {activeLegal === 'TERMS' && t("TERMS OF SERVICE", "CONDITIONS D'UTILISATION")}
                  </h3>
                </div>
                <div className="space-y-8 text-white/60 font-medium leading-relaxed">
                  {activeLegal === 'GDPR' && (
                    <div className="space-y-6">
                      <p>{t("LINKYOURART (LYA) is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR).", "LINKYOURART (LYA) s'engage à protéger vos données personnelles conformément au RGPD.")}</p>
                      <ul className="list-disc pl-6 space-y-4">
                        <li>{t("Data Minimization: We only collect essential information required for institutional verification.", "Minimisation des données : Nous ne collectons que les informations essentielles.")}</li>
                        <li>{t("Anonymization: Your creative metadata is decoupled from your biological identity.", "Anonymisation : Vos métadonnées créatives sont découplées de votre identité.")}</li>
                        <li>{t("Right to Erasure: Users maintain full sovereignty over their digital footprint.", "Droit à l'effacement : Les utilisateurs conservent leur pleine souveraineté.")}</li>
                      </ul>
                    </div>
                  )}
                  {activeLegal === 'PRIVACY' && (
                    <div className="space-y-6">
                      <p>{t("Digital privacy is the cornerstone of the LYA Certification Registry.", "La confidentialité numérique est la pierre angulaire du Registre de Certification LYA.")}</p>
                      <p>{t("Our Privacy-by-Design architecture ensures no unauthorized third party can access your creative space.", "Notre architecture Privacy-by-Design garantit qu'aucun tiers non autorisé ne peut accéder à votre espace créatif.")}</p>
                    </div>
                  )}
                  {activeLegal === 'TERMS' && (
                    <div className="space-y-6">
                      <p>{t("By accessing the LinkYourArt Terminal, you agree to operate within the defined ethical and legal framework.", "En accédant au Terminal LinkYourArt, vous acceptez d'opérer dans le cadre éthique et juridique défini.")}</p>
                      <p>{t("All disputes are handled through our internal legal arbitration process.", "Tous les litiges sont gérés par notre processus d'arbitrage légal interne.")}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Panel — How It Works / LYA Score / Security */}
      <AnimatePresence mode="sync">
        {activeInfo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveInfo(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-[#0D1117] border border-white/10 rounded-[3rem] p-8 md:p-12 max-h-[80vh] overflow-y-auto lya-scrollbar shadow-3xl">
              <button onClick={() => setActiveInfo(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  {activeInfo === 'HOW' && <Cpu size={32} className="text-primary-cyan" />}
                  {activeInfo === 'SCORE' && <Award size={32} className="text-[#FF007F]" />}
                  {activeInfo === 'SECURITY' && <Shield size={32} className="text-[#9D00FF]" />}
                  <h3 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tighter">
                    {activeInfo === 'HOW' && t('HOW IT WORKS', 'COMMENT ÇA MARCHE')}
                    {activeInfo === 'SCORE' && t('THE LYA SCORE', 'LE SCORE LYA')}
                    {activeInfo === 'SECURITY' && t('SECURITY & TRUST', 'SÉCURITÉ & CONFIANCE')}
                  </h3>
                </div>

                <div className="space-y-8 text-white/60 font-medium leading-relaxed">
                  {activeInfo === 'HOW' && (
                    <div className="space-y-6">
                      <p>{t('LinkYourArt certifies creative projects through an objective, transparent process — no financial mechanism, no speculation.', 'LinkYourArt certifie les projets créatifs à travers un processus objectif et transparent — aucun mécanisme financier, aucune spéculation.')}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {[
                          { n: '01', tFR: 'Soumission', tEN: 'Submission', dFR: 'Un créateur ou un professionnel soumet un projet créatif au Registre LYA, gratuitement.', dEN: 'A creator or professional submits a creative project to the LYA Registry, free of charge.' },
                          { n: '02', tFR: 'Certification', tEN: 'Certification', dFR: 'Analyse algorithmique et revue par un comité de professionnels produisent le Score LYA sur 1000.', dEN: 'Algorithmic analysis and professional committee review produce the LYA Score out of 1000.' },
                          { n: '03', tFR: 'Mécénat', tEN: 'Patronage', dFR: 'Les mécènes découvrent les projets certifiés et les soutiennent en échange de contreparties de reconnaissance.', dEN: 'Patrons discover certified projects and support them in exchange for recognition-based rewards.' },
                        ].map(s => (
                          <div key={s.n} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                            <p className="text-primary-cyan font-black font-mono text-xl mb-2">{s.n}</p>
                            <p className="text-white font-black uppercase text-sm mb-1">{t(s.tEN, s.tFR)}</p>
                            <p className="text-white/50 text-sm leading-relaxed">{t(s.dEN, s.dFR)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeInfo === 'SCORE' && (
                    <div className="space-y-6">
                      <p>{t('Every certified project receives a LYA Score out of 1000, combining algorithmic analysis and professional committee review across 5 pillars.', 'Chaque projet certifié reçoit un Score LYA sur 1000, combinant analyse algorithmique et revue par un comité de professionnels selon 5 piliers.')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { l: 'IC', tFR: 'Intégrité Conceptuelle', tEN: 'Conceptual Integrity' },
                          { l: 'MA', tFR: 'Maturité Actuelle', tEN: 'Current Maturity' },
                          { l: 'CE', tFR: "Capacité d'Évolution", tEN: 'Growth Capacity' },
                          { l: 'FR', tFR: 'Faisabilité Réelle', tEN: 'Real Feasibility' },
                          { l: 'IN', tFR: 'Incarnation', tEN: 'Embodiment' },
                        ].map(p => (
                          <div key={p.l} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <span className="text-[#FF007F] font-black font-mono text-sm w-8">{p.l}</span>
                            <span className="text-white/70 text-sm">{t(p.tEN, p.tFR)}</span>
                            <span className="ml-auto text-white/30 text-xs font-mono">/200</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-white/40">{t('The Score evolves over time as milestones are validated — it is a live, transparent indicator of certified quality, not a price.', 'Le Score évolue dans le temps à mesure que les jalons sont validés — c\'est un indicateur vivant et transparent de qualité certifiée, pas un prix.')}</p>
                    </div>
                  )}
                  {activeInfo === 'SECURITY' && (
                    <div className="space-y-6">
                      <p>{t('LinkYourArt is built on rigorous legal compliance, data protection and creative rights certification at every step.', 'LinkYourArt est bâti sur des fondations de conformité juridique rigoureuse, protection des données et certification des droits créatifs à chaque étape.')}</p>
                      <ul className="list-disc pl-6 space-y-4">
                        <li>{t('GDPR compliant — end-to-end data protection.', 'Conforme RGPD — protection des données de bout en bout.')}</li>
                        <li>{t('Every project is reviewed by certified professional validators, not automated approval alone.', 'Chaque projet est revu par des validateurs professionnels certifiés, pas seulement une approbation automatisée.')}</li>
                        <li>{t('Creators retain full moral rights and creative control over their work at all times.', 'Les créateurs conservent en toute circonstance leurs droits moraux et le contrôle créatif de leur œuvre.')}</li>
                        <li>{t('Patronage support is recognition-based, never a regulated financial instrument.', 'Le soutien de mécénat est basé sur la reconnaissance, jamais un instrument financier réglementé.')}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence mode="sync">
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDemoModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto scrollbar-thin bg-[#0D1117] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-3xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-t-[2.5rem]" />
              {!demoSubmitted ? (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-cyan/10 rounded-2xl flex items-center justify-center text-primary-cyan border border-primary-cyan/20"><Lock size={32} /></div>
                    <div>
                      <h3 className="font-headline text-3xl font-black uppercase tracking-tighter">{t('PRIVATE DISCOVERY ACCESS', 'ACCÈS DÉCOUVERTE PRIVÉE')}</h3>
                      <p className="text-xs text-white/30 font-black uppercase tracking-[0.4em]">{t('FOR PATRONS & INSTITUTIONS', 'POUR MÉCÈNES & INSTITUTIONS')}</p>
                    </div>
                  </div>
                  <form onSubmit={handleDemoRequest} className="space-y-6">
                    <div className="space-y-4">
                      <input type="text" placeholder={t('Identity Name', 'Identité Nom')} required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight" />
                      <input type="email" placeholder={t('Professional Email', 'Email Professionnel')} required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight" />
                      <textarea placeholder={t('Your role & reason for requesting private access', 'Votre rôle & motif de demande d\'accès privé')} required value={demoRequestReason} onChange={(e) => setDemoRequestReason(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight resize-none" />
                    </div>
                    <div className="pt-4 flex flex-col gap-4">
                      <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-primary-cyan text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_40px_rgba(0,224,255,0.3)] transition-all active:scale-95 text-xs flex items-center justify-center gap-3">
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>{t('REQUEST PRIVATE ACCESS', 'DEMANDER UN ACCÈS PRIVÉ')}<ArrowRight size={20} /></>}
                      </button>
                      <div className="text-center pt-2">
                        <p className="text-[10px] font-bold text-white/20 uppercase leading-relaxed font-mono">{t('Existing partners: Please authenticate via the Terminal Login.', 'Partenaires existants : Veuillez vous authentifier via le Login Terminal.')}</p>
                        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                          {!showKeyInput ? (
                            <button type="button" onClick={() => setShowKeyInput(true)} className="w-full py-4 px-6 bg-gradient-to-r from-accent-gold/10 to-primary-cyan/15 hover:from-accent-gold/20 hover:to-primary-cyan/25 border border-accent-gold/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group">
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-gold group-hover:text-primary-cyan transition-colors">🔑 {t('SECURE PARTNER RESERVATION ACCESS', 'RÉSERVATION PARTENAIRE SÉCURISÉE')}</span>
                              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{t('ENTER SECURITY KEY TO BYPASS WAITLIST & START DEMO', 'SAISISSEZ VOTRE CLÉ POUR ACCÉDER DIRECTEMENT À LA DÉMO')}</span>
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-gradient-to-b from-accent-gold/5 to-transparent border border-accent-gold/30 rounded-2xl space-y-4">
                              <div className="text-center pb-1"><span className="text-xs font-black uppercase tracking-[0.25em] text-accent-gold">{t('AUTHORIZED GATEWAY KEY DECRYPTION', 'DÉCRYPTAGE DE LA CLÉ DE PORTAIL AUTORISÉE')}</span></div>
                              <div className="relative group">
                                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${keyError ? 'text-rose-500' : 'text-accent-gold/60 group-focus-within:text-primary-cyan'}`} size={14} />
                                <input type="text" placeholder={t('ENTER PARTNER ACCESS KEY', 'SAISISSEZ LA CLÉ D\'ACCÈS PARTENAIRE')} value={accessKey} onChange={(e) => { setAccessKey(e.target.value); setKeyError(false); }} className={`w-full bg-black border ${keyError ? 'border-rose-500/50' : 'border-accent-gold/20 focus:border-primary-cyan/50'} rounded-xl py-4 pl-12 pr-4 focus:outline-none text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all`} />
                              </div>
                              <div className="flex gap-2.5">
                                <button type="button" onClick={verifyKey} disabled={isVerifyingKey || !accessKey} className="flex-1 py-4 bg-accent-gold text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-accent-gold/80 transition-all rounded-xl disabled:opacity-30 flex items-center justify-center gap-2">
                                  {isVerifyingKey ? <RefreshCw className="animate-spin mx-auto" size={14} /> : <span>{t('AUTHENTICATE SECURITY ACCESS', "AUTHENTIFIER L'ACCÈS")}</span>}
                                </button>
                                <button type="button" onClick={() => { setShowKeyInput(false); setKeyError(false); }} className="px-4 py-4 bg-white/5 border border-white/10 text-xs font-black uppercase hover:bg-white/10 text-white/70 transition-all rounded-xl">X</button>
                              </div>
                              {keyError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-bounce">{t('INVALID OR EXPIRED PRIVILEGE KEY', 'CLÉ DE PRIVILÈGE INVALIDE OU EXPIRÉE')}</p>}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-10 space-y-10">
                  <div className="w-24 h-24 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto border border-primary-cyan/20"><CheckCircle2 size={48} className="text-primary-cyan" /></div>
                  <div className="space-y-4">
                    <h3 className="font-headline text-4xl font-black uppercase tracking-tighter leading-none">{t('CLEARANCE PENDING', 'AUTORISATION EN ATTENTE')}</h3>
                    <p className="text-white/40 font-medium max-w-sm mx-auto leading-relaxed">{t('Our analysts are reviewing your profile. You will receive a secure access code via email within 24 hours.', "Nos analystes examinent votre profil. Vous recevrez un jeton d'accès sécurisé par e-mail sous 24 heures.")}</p>
                  </div>
                  <button onClick={() => setShowDemoModal(false)} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest text-white/40 uppercase hover:text-white transition-colors">{t('CLOSE TERMINAL', 'FERMER LE TERMINAL')}</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Easter Egg Admin Login */}
      {showLoginEaster && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[#0D1117] border border-white/10 rounded-3xl p-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-cyan via-[#FF007F] to-[#9D00FF] rounded-t-3xl" />
            <div className="text-center mb-8">
              <Logo size={48} color="multi" showBeta={false} className="mx-auto mb-4" />
              <h3 className="font-headline text-xl font-black uppercase tracking-widest text-white">{t("ADMIN ACCESS", "ACCÈS ADMIN")}</h3>
              <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">{t("Secure Platform", "Plateforme Sécurisée")}</p>
            </div>
            <button onClick={() => { setShowLoginEaster(false); if (onViewChange) onViewChange('LOGIN'); }} className="w-full py-4 bg-primary-cyan text-black font-black text-xs tracking-widest uppercase rounded-xl mb-3 hover:bg-primary-cyan/80 transition-all">{t("SIGN IN", "SE CONNECTER")}</button>
            <button onClick={() => setShowLoginEaster(false)} className="w-full py-3 bg-white/5 border border-white/10 text-white/40 font-black text-xs tracking-widest uppercase rounded-xl hover:text-white transition-all">{t("CLOSE", "FERMER")}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};




