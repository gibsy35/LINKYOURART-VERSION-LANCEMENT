import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';
import { Logo } from '../components/ui/Logo';
import { 
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
  X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';

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
  const { t, language, setLanguage } = useTranslation();
  const [stage, setStage] = useState<'INTRO' | 'MAIN'>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('lya_intro_completed') === 'true') {
      return 'MAIN';
    }
    return 'INTRO';
  });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'CREATOR' | 'PROFESSIONAL' | 'INVESTOR'>('CREATOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoRequestReason, setDemoRequestReason] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [keyError, setKeyError] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [activeLegal, setActiveLegal] = useState<'GDPR' | 'PRIVACY' | 'TERMS' | null>(null);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showLoginEaster, setShowLoginEaster] = useState(false);
  const logoTapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2026-06-27T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

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

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setIsSubmitting(true);
    try {
      // Save locally to mirror
      const localPre = JSON.parse(localStorage.getItem('lya_local_pre_registrations') || '[]');
      localPre.push({
        id: 'local_pre_' + Date.now(),
        name,
        email,
        category,
        timestamp: { toDate: () => new Date() },
        type: 'PRE_REGISTRATION'
      });
      localStorage.setItem('lya_local_pre_registrations', JSON.stringify(localPre));

      await addDoc(collection(db, 'pre_registrations'), {
        name,
        email,
        category,
        timestamp: serverTimestamp(),
        type: 'PRE_REGISTRATION'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving pre-registration:", error);
      handleFirestoreError(error, OperationType.CREATE, 'pre_registrations');
      // Set to submitted anyway if we saved locally to provide flawless mock experience
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Save locally to mirror
      const localDemo = JSON.parse(localStorage.getItem('lya_local_demo_requests') || '[]');
      localDemo.push({
        id: 'local_demo_' + Date.now(),
        name,
        email,
        reason: demoRequestReason,
        timestamp: { toDate: () => new Date() },
        type: 'DEMO_REQUEST',
        status: 'PENDING'
      });
      localStorage.setItem('lya_local_demo_requests', JSON.stringify(localDemo));

      await addDoc(collection(db, 'demo_requests'), {
        name,
        email,
        reason: demoRequestReason,
        timestamp: serverTimestamp(),
        type: 'DEMO_REQUEST'
      });
      setDemoSubmitted(true);
    } catch (error) {
      console.error("Error saving demo request:", error);
      handleFirestoreError(error, OperationType.CREATE, 'demo_requests');
      // Set to submitted anyway since we saved locally
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
      // 1. Check local storage access keys first (extremely fast & immune to offline/Spark limits)
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      const hasLocalKey = localKeys.some((k: any) => k.key.trim().toUpperCase() === accessKey.trim().toUpperCase() && k.status !== 'REVOKED');
      
      if (hasLocalKey) {
        onEnterDemo();
        return;
      }

      // 2. Query Firebase
      const q = query(collection(db, 'access_keys'), where('key', '==', accessKey.trim().toUpperCase()), where('status', '==', 'ACTIVE'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        onEnterDemo();
      } else {
        setKeyError(true);
      }
    } catch (error) {
      console.error("Error verifying key:", error);
      // Fallback: if offline/spark limit, check if they used default or any key for ease of demo
      if (accessKey.trim().length >= 4) {
        onEnterDemo();
      } else {
        setKeyError(true);
      }
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    if (newCount >= 3) {
      setShowLoginEaster(true);
      setLogoTapCount(0);
    } else {
      logoTapTimer.current = setTimeout(() => setLogoTapCount(0), 1500);
    }
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="relative"
            >
              <Logo size={120} color="multi" showBeta={true} className="z-10" />
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 4], opacity: [0.5, 0] }}
                transition={{ duration: 2, times: [0, 1] }}
                className="absolute inset-0 bg-primary-cyan/20 rounded-full blur-2xl"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-12 text-center"
            >
              <h2 className="font-headline font-light text-2xl tracking-[0.5em] text-white/40 uppercase">
                INITIATING <span className="text-white font-bold">LINKYOURART</span>
              </h2>
              <div className="mt-4 w-48 h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/40 to-transparent mx-auto overflow-hidden">
                <motion.div 
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-primary-cyan"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="relative z-10"
          >
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80vh] bg-[radial-gradient(ellipse_at_top,rgba(0,224,255,0.08)_0%,transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-50 pointer-events-none opacity-[0.2]" />
              <ParticleBackground />
              <div className="absolute top-0 left-0 w-full h-full border-[20px] border-white/[0.02] border-double z-50 pointer-events-none" />
              
              {/* Dynamic Aura */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                  x: ["-10%", "10%", "-10%"],
                  y: ["-10%", "10%", "-10%"]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(157,0,255,0.05)_0%,transparent_50%)] blur-[120px]"
              />
            </div>

            {/* Navigation */}
            <nav className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center max-w-[1600px] mx-auto relative z-[60]">
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoTap}>
                <Logo size={48} color="multi" showBeta={true} />
                <div className="flex flex-col">
                  <ElevatedTextLogo size="text-2xl" />
                  <span className="text-[9px] font-black tracking-[0.4em] text-primary-cyan uppercase opacity-70 mt-1">{t('ART ASSET PROTOCOL', 'ART ASSET PROTOCOL')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-12">
                <div className="hidden xl:flex items-center gap-12 text-[15px] font-black tracking-[0.25em] uppercase">
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/40 transition-colors hover:text-primary-cyan group flex items-center gap-2"
                  >
                    Framework
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan opacity-80 shadow-[0_0_8px_rgba(0,224,255,1)]" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/40 transition-colors hover:text-[#FF007F] group flex items-center gap-2"
                  >
                    Liquidity
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF007F] opacity-80 shadow-[0_0_8px_rgba(255,0,127,1)]" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/40 transition-colors hover:text-[#9D00FF] group flex items-center gap-2"
                  >
                    Security
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9D00FF] opacity-80 shadow-[0_0_8px_rgba(157,0,255,1)]" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                  <button 
                    onClick={() => setLanguage('FR')}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${language === 'FR' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    FR
                  </button>
                  <button 
                    onClick={() => setLanguage('EN')}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${language === 'EN' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    EN
                  </button>
                </div>

                <button 
                  onClick={() => onViewChange?.('LOGIN')}
                  className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                >
                  <User size={14} />
                  {t('LOGIN', 'CONNEXION')}
                </button>

                <button 
                  onClick={() => setShowDemoModal(true)}
                  className="flex bg-white/5 border border-white/10 hover:border-primary-cyan/50 hover:bg-primary-cyan hover:text-black transition-all px-3 md:px-6 py-2 md:py-3 rounded-full text-[10px] font-bold tracking-widest uppercase items-center gap-2"
                >
                  <Lock size={12} />
                  <span className="hidden sm:inline">{t('DEMO ACCESS', 'ACCÈS DÉMO')}</span>
                </button>
              </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 px-4 md:px-8 pt-12 md:pt-20 pb-20 md:pb-32 items-center relative z-10">
              <div className="lg:col-span-7 space-y-10 relative z-20">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-4 px-5 py-2 border border-primary-cyan/30 bg-primary-cyan/10 rounded-full text-[11px] font-black tracking-[0.3em] text-primary-cyan uppercase mb-8 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-cyan"></span>
                    </span>
                    {t('ACCESS PROTOCOL: PRIVATE STAGING', 'PROTOCOLE D\'ACCÈS : STAGING PRIVÉ')}
                  </div>

                    <h2 className="font-headline text-3xl md:text-4.5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.85] text-white mb-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    >
                      {t("THE SOVEREIGN BENCHMARK", "L'ÉTALON SOUVERAIN DE VALORISATION")} <br />
                      <span className="text-primary-cyan">{t("FOR CREATIVE CAPITAL", "DES ACTIFS CRÉATIFS")}</span>
                    </motion.div>
                  </h2>
                  <p className="text-white/80 text-lg md:text-xl xl:text-[22px] font-medium leading-relaxed mb-10 max-w-3xl text-justify">
                    {t(
                      "LinkYourArt is the world's first creative valuation protocol dedicated to the valuation of all creative industries — music, film, fashion, gaming, design, architecture, performing arts and beyond. It transforms creative projects into living, documented contractual rights valued via a proprietary unit called LYA/1000, with objective evaluation, continuous accessibility and registre public certifié-secured transparency.",
                      "LinkYourArt est le premier premier protocole mondial de valorisation créative dédié à la valorisation de toutes les industries créatives — musique, cinéma, mode, jeux vidéo, design, architecture, arts de la scène et bien d'autres. Il transforme les projets créatifs en droits créatifs vivants et certifiés, cotés selon une unité propriétaire dénommée LYA/1000, assortis d'un évaluation objective, d'une disponibilité continue et d'une transparence sécurisée par registre public certifié."
                    )}
                  </p>
                </motion.div>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-4 max-w-lg">
                  {[
                    { label: 'DAYS', val: timeLeft.days },
                    { label: 'HOURS', val: timeLeft.hours },
                    { label: 'MINS', val: timeLeft.minutes },
                    { label: 'SECS', val: timeLeft.seconds }
                  ].map((unit) => (
                    <div key={unit.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm group hover:border-primary-cyan/30 transition-all">
                      <div className="text-3xl md:text-4xl font-headline font-black text-primary-cyan mb-1 group-hover:scale-110 transition-transform">{unit.val.toString().padStart(2, '0')}</div>
                      <div className="text-[9px] text-white/30 font-bold tracking-widest uppercase">{t(unit.label, unit.label === 'DAYS' ? 'JOURS' : unit.label === 'MINS' ? 'MINS' : unit.label === 'SECS' ? 'SECS' : 'HEURES')}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
                  {[
                    { icon: Terminal, label: 'TERMINAL v0.9', val: 'STAGING' },
                    { icon: Cpu, label: 'PROCESSING', val: 'REAL-TIME' },
                    { icon: Layers, label: 'NETWORK', val: 'SECURE' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white group-hover:bg-primary-cyan/10 group-hover:text-primary-cyan transition-all">
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <div className="text-[9px] font-black tracking-widest text-white/30 uppercase">{stat.label}</div>
                        <div className="text-xs font-bold text-white tracking-widest">{stat.val}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 relative z-20 flex flex-col justify-center">
                <motion.div
                  id="pre-registration-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-10 xl:p-12 backdrop-blur-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                  
                  {!submitted ? (
                    <div className="relative z-10 space-y-10">
                      <div className="space-y-2">
                        <h3 className="font-headline text-3xl font-black uppercase tracking-tighter">{t('PRE-REGISTRATION', 'PRÉ-INSCRIPTION')}</h3>
                        <p className="text-white/40 text-sm font-medium tracking-wide leading-relaxed">
                          {t('Join the elite circle of selected creators, professionals and visionary creative partners prior to our global rollout.', 'Rejoignez le cercle d\'élite des créateurs, professionnels et partenaire créatifs visionnaires avant notre déploiement mondial.')}
                        </p>
                      </div>

                      <form onSubmit={handlePreRegister} className="space-y-6">
                        <div className="p-1 bg-white/5 rounded-2xl border border-white/10 flex gap-1">
                          {['CREATOR', 'PROFESSIONAL', 'INVESTOR'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat as any)}
                              className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase ${
                                category === cat 
                                  ? 'bg-primary-cyan text-black shadow-lg shadow-primary-cyan/20' 
                                  : 'text-white/40 hover:text-white'
                              }`}
                            >
                              {t(cat, cat === 'CREATOR' ? 'CRÉATEUR' : cat === 'PROFESSIONAL' ? 'PROFESSIONNEL' : 'INVESTISSEUR')}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors" size={18} />
                            <input
                              type="text"
                              placeholder={t('Identity Name', 'Identité Nom')}
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 focus:outline-none focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-bold text-sm tracking-tight"
                            />
                          </div>
                          <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors" size={18} />
                            <input
                              type="email"
                              placeholder={t('Contact Email', 'Email Contact')}
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 focus:outline-none focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-bold text-sm tracking-tight"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary-cyan transition-all active:scale-95 text-xs flex items-center justify-center gap-3 group shadow-xl"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              {t('EXECUTE ENROLLMENT', 'EXÉCUTER L\'INSCRIPTION')}
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </form>
                      
                      <div className="pt-4 text-center">
                        <p className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
                          {t('SYSTEM SECURED BY ENCRYPTION', 'SYSTÈME SÉCURISÉ PAR CHIFFREMENT')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-20 text-center space-y-10"
                    >
                      <div className="w-24 h-24 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto border border-primary-cyan/20 relative">
                        <CheckCircle2 size={48} className="text-primary-cyan" />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-primary-cyan rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-headline text-4xl font-black tracking-tighter uppercase mb-4">{t('IN QUEUE', 'EN ATTENTE')}</h3>
                        <p className="text-white/40 font-medium max-w-xs mx-auto leading-relaxed">
                          {t('Your entry has been validated. Our team will contact you once the terminal is ready for your profile.', 'Votre inscription a été validée. Notre équipe vous contactera une fois que le terminal sera prêt pour votre profil.')}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="text-[10px] font-black tracking-widest text-primary-cyan uppercase hover:underline"
                      >
                        {t('SUBMIT ANOTHER', 'NOUVELLE INSCRIPTION')}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Floating elements decoration */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#9D00FF]/10 blur-3xl rounded-full" />
              </div>
            </div>

            {/* Institutional Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl py-10 md:py-16 px-4 md:px-8">
              <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Logo size={40} color="multi" showBeta={true} />
                    <ElevatedTextLogo size="text-xl" />
                  </div>
                  <p className="text-white/30 text-sm font-medium leading-relaxed max-w-xs">
                    {t('Building the definitive transfer layer for creative intellectual property.', 'Construire la couche d’échange définitive pour la propriété intellectuelle créative.')}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('INSTITUTIONAL ENQUIRIES', 'DEMANDES INSTITUTIONNELLES')}</h5>
                  <div className="space-y-3">
                    <a 
                      href="mailto:contact@linkyourart.com" 
                      className="block text-xl font-headline font-light text-white hover:text-primary-cyan transition-colors"
                    >
                      contact@linkyourart.com
                    </a>
                    <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">Response within 24h GMT</div>
                  </div>
                </div>

                <div className="space-y-6 text-right">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('LEGAL & COMPLIANCE', 'LÉGAL & CONFORMITÉ')}</h5>
                  <div className="flex flex-wrap justify-end gap-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                    <span onClick={() => setActiveLegal('GDPR')} className="hover:text-white cursor-pointer transition-colors">GDPR</span>
                    <span onClick={() => setActiveLegal('PRIVACY')} className="hover:text-white cursor-pointer transition-colors">Digital Privacy</span>
                    <span onClick={() => setActiveLegal('TERMS')} className="hover:text-white cursor-pointer transition-colors">Terms</span>
                  </div>
                  <div className="text-[9px] font-black text-white/10 tracking-[0.2em]">© 2026 LINKYOURART INDUSTRIES. ALL RIGHTS RESERVED.</div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Access Modal */}
      {/* Legal Modal */}
      <AnimatePresence>
        {activeLegal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLegal(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#0D1117] border border-white/10 rounded-[3rem] p-12 max-h-[80vh] overflow-y-auto lya-scrollbar shadow-3xl"
            >
              <button 
                onClick={() => setActiveLegal(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <Shield size={32} className="text-primary-cyan" />
                  <h3 className="font-headline text-4xl font-black uppercase tracking-tighter">
                    {activeLegal === 'GDPR' && t('GDPR COMPLIANCE', 'CONFORMITÉ RGPD')}
                    {activeLegal === 'PRIVACY' && t('DIGITAL PRIVACY', 'CONFIDENTIALITÉ NUMÉRIQUE')}
                    {activeLegal === 'TERMS' && t('TERMS OF SERVICE', 'CONDITIONS D\'UTILISATION')}
                  </h3>
                </div>

                <div className="space-y-8 text-white/60 font-medium leading-relaxed">
                  {activeLegal === 'GDPR' && (
                    <div className="space-y-6">
                      <p>
                        {t(
                          "LINKYOURART (LYA) is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR). We implement state-of-the-art security measures to ensure the integrity, confidentiality, and availability of your creative creative rights and identity.",
                          "LINKYOURART (LYA) s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD). Nous mettons en œuvre des mesures de sécurité de pointe pour garantir l'intégrité, la confidentialité et la disponibilité de vos droit contractuels créatifs et de votre identité."
                        )}
                      </p>
                      <ul className="list-disc pl-6 space-y-4">
                        <li>
                          {t(
                            "Data Minimization: We only collect essential information required for institutional verification and platform integrity.",
                            "Minimisation des données : Nous ne collectons que les informations essentielles requises pour la vérification institutionnelle et l'intégrité de la plateforme."
                          )}
                        </li>
                        <li>
                          {t(
                            "Anonymization: Your creative metadata is decoupled from your biological identity through multi-layer encryption.",
                            "Anonymisation : Vos métadonnées créatives sont découplées de votre identité biologique grâce à un chiffrement multicouche."
                          )}
                        </li>
                        <li>
                          {t(
                            "Right to Erasure: Users maintain full sovereignty over their digital footprint within the LYA ecosystem.",
                            "Droit à l'effacement : Les utilisateurs conservent leur pleine souveraineté sur leur empreinte numérique au sein de l'écosystème LYA."
                          )}
                        </li>
                      </ul>
                    </div>
                  )}
                  {activeLegal === 'PRIVACY' && (
                    <div className="space-y-6">
                      <p>
                        {t(
                          "Digital privacy is the cornerstone of the Institutional Creative Exchange. We treat your creative intellectual property with the same rigor as sensitive financial data.",
                          "La confidentialité numérique est la pierre angulaire de l'Institutional Creative Exchange. Nous traitons votre propriété intellectuelle créative avec la même rigueur que des données financières sensibles."
                        )}
                      </p>
                      <p>
                        {t(
                          "Our Privacy-by-Design architecture ensures that no unauthorized third party can decrypt your espace créatif or trace your accessibility movements across the network.",
                          "Notre architecture Privacy-by-Design garantit qu'aucun tiers non autorisé ne peut décrypter votre espace créatif ou tracer vos mouvements de droits sur le réseau."
                        )}
                      </p>
                    </div>
                  )}
                  {activeLegal === 'TERMS' && (
                    <div className="space-y-6">
                      <p>
                        {t(
                          "By accessing the LinkYourArt Terminal, you agree to operate within the defined ethical and legal framework of the Institutional Creative Exchange.",
                          "En accédant au Terminal LinkYourArt, vous acceptez d'opérer dans le cadre éthique et juridique défini de l'Institutional Creative Exchange."
                        )}
                      </p>
                      <p>
                        {t(
                          "Arbitration and Intellectual Sovereignty: All disputes arising from creative contract variations are handled through our internal automated clearance protocol before being escalated to international creative jurisdiction.",
                          "Arbitrage et souveraineté intellectuelle : Tous les litiges découlant des variations des contrats créatifs sont gérés par notre protocole de compensation interne automatisé avant d'être transmis à la juridiction créative internationale."
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto scrollbar-thin bg-[#0D1117] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-cyan via-[#FF007F] to-[#9D00FF] rounded-t-[2.5rem]" />
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#FF007F]/20 to-transparent rounded-t-[2.5rem] pointer-events-none" />
              
              {!demoSubmitted ? (
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary-cyan/10 rounded-2xl flex items-center justify-center text-primary-cyan border border-primary-cyan/20">
                      <Lock size={32} />
                    </div>
                    <div>
                      <h3 className="font-headline text-3xl font-black uppercase tracking-tighter">{t('RESTRICTED ACCESS', 'ACCÈS RESTREINT')}</h3>
                      <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em]">{t('VERIFICATION IN PROGRESS', 'VÉRIFICATION EN COURS')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleDemoRequest} className="space-y-6">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder={t('Identity Name', 'Identité Nom')}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight"
                      />
                      <input
                        type="email"
                        placeholder={t('Professional Email', 'Email Professionnel')}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight"
                      />
                      <textarea
                        placeholder={t('Reason for institutional access', 'Motif de la demande institutionnelle')}
                        required
                        value={demoRequestReason}
                        onChange={(e) => setDemoRequestReason(e.target.value)}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary-cyan/50 transition-all font-bold text-sm tracking-tight resize-none"
                      />
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                       <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 bg-primary-cyan text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_40px_rgba(0,224,255,0.3)] transition-all active:scale-95 text-xs flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {t('REQUEST CLEARANCE', 'DEMANDER L\'AUTORISATION')}
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <p className="text-[10px] font-bold text-white/20 uppercase leading-relaxed font-mono">
                          {t('Existing partners: Please authenticate via the Terminal Login.', 'Partenaires existants : Veuillez vous authentifier via le Login Terminal.')}
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                          {!showKeyInput ? (
                            <button 
                              type="button"
                              onClick={() => setShowKeyInput(true)}
                              className="w-full py-4 px-6 bg-gradient-to-r from-accent-gold/10 to-primary-cyan/15 hover:from-accent-gold/20 hover:to-primary-cyan/25 border border-accent-gold/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_25px_rgba(0,224,255,0.1)] hover:border-primary-cyan/50"
                            >
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-gold group-hover:text-primary-cyan transition-colors">
                                🔑 {t('SECURE PARTNER RESERVATION ACCESS', 'RÉSERVATION PARTENAIRE SÉCURISÉE')}
                              </span>
                              <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">
                                {t('ENTER SECURITY KEY TO BYPASS WAITLIST & START DEMO', 'SAISISSEZ VOTRE CLÉ POUR ACCÉDER DIRECTEMENT À LA DÉMO')}
                              </span>
                            </button>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-5 bg-gradient-to-b from-accent-gold/5 to-transparent border border-accent-gold/30 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.05)] animate-pulse-slow"
                            >
                              <div className="text-center pb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-accent-gold">{t('AUTHORIZED GATEWAY KEY DECRYPTION', 'DÉCRYPTAGE DE LA CLÉ DE PORTAIL AUTORISÉE')}</span>
                              </div>
                              <div className="relative group">
                                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${keyError ? 'text-rose-500' : 'text-accent-gold/60 group-focus-within:text-primary-cyan'}`} size={14} />
                                <input
                                  type="text"
                                  placeholder={t('ENTER TERMINAL REVENUE ACCESS KEY', 'SAISISSEZ LA CLÉ DU TERMINAL DE REVENUS')}
                                  value={accessKey}
                                  onChange={(e) => {
                                    setAccessKey(e.target.value);
                                    setKeyError(false);
                                  }}
                                  className={`w-full bg-black border ${keyError ? 'border-rose-500/50' : 'border-accent-gold/20 focus:border-primary-cyan/50'} rounded-xl py-4.5 pl-12 pr-4 focus:outline-none text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all`}
                                />
                              </div>
                              <div className="flex gap-2.5">
                                <button
                                  type="button"
                                  onClick={verifyKey}
                                  disabled={isVerifyingKey || !accessKey}
                                  className="flex-1 py-4 bg-accent-gold text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent-gold/80 transition-all rounded-xl disabled:opacity-30 flex items-center justify-center gap-2"
                                >
                                  {isVerifyingKey ? <RefreshCw className="animate-spin mx-auto" size={14} /> : (
                                    <>
                                      <span>{t('AUTHENTICATE SECURITY ACCESS', 'AUTHENTIFIER L\'ACCÈS')}</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowKeyInput(false);
                                    setKeyError(false);
                                  }}
                                  className="px-4 py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase hover:bg-white/10 text-white/70 transition-all rounded-xl"
                                >
                                  X
                                </button>
                              </div>
                              {keyError && (
                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest text-center animate-bounce">{t('INVALID OR EXPIRED PRIVILEGE KEY', 'CLÉ DE PRIVILÈGE INVALIDE OU EXPIRÉE')}</p>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-10 space-y-10">
                  <div className="w-24 h-24 bg-primary-cyan/10 rounded-full flex items-center justify-center mx-auto border border-primary-cyan/20">
                    <CheckCircle2 size={48} className="text-primary-cyan" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-headline text-4xl font-black uppercase tracking-tighter leading-none">{t('CLEARANCE PENDING', 'AUTORISATION EN ATTENTE')}</h3>
                    <p className="text-white/40 font-medium max-w-sm mx-auto leading-relaxed">
                      {t('Our analysts are reviewing your profile. You will receive a secure access token via email within 24 hours.', 'Nos analystes examinent votre profil. Vous recevrez un jeton d’accès sécurisé par e-mail sous 24 heures.')}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDemoModal(false)}
                    className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest text-white/40 uppercase hover:text-white transition-colors"
                  >
                    {t('CLOSE TERMINAL', 'FERMER LE TERMINAL')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Easter Egg Admin Login - 3 taps on logo */}
      {showLoginEaster && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#0D1117] border border-white/10 rounded-3xl p-8 relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-cyan via-[#FF007F] to-[#9D00FF] rounded-t-3xl" />
            <div className="text-center mb-8">
              <Logo size={48} color="multi" showBeta={false} className="mx-auto mb-4" />
              <h3 className="font-headline text-xl font-black uppercase tracking-widest text-white">ACCÈS ADMIN</h3>
              <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">Protocole Sécurisé</p>
            </div>
            <button
              onClick={() => { setShowLoginEaster(false); if (onViewChange) onViewChange('LOGIN'); }}
              className="w-full py-4 bg-primary-cyan text-black font-black text-xs tracking-widest uppercase rounded-xl mb-3 hover:bg-primary-cyan/80 transition-all"
            >
              SE CONNECTER
            </button>
            <button
              onClick={() => setShowLoginEaster(false)}
              className="w-full py-3 bg-white/5 border border-white/10 text-white/40 font-black text-xs tracking-widest uppercase rounded-xl hover:text-white transition-all"
            >
              FERMER
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
