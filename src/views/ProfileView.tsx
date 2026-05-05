import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, UserProfile, LYA_SIMULATOR_STEPS, LYASimulatorStep, CONTRACTS } from '../types';
import { View } from '../components/ui/Sidebar';
import { User, Settings, Shield, BarChart3, Layers, Globe, LogOut, Lock, Play, ExternalLink, Save, Camera, Mail, Briefcase, TrendingUp, Award, ShieldCheck, Zap, Activity, Cpu, FileCode, X, LayoutGrid, Plus, FileText, Download, MessageSquare, PieChart as PieChartIcon, Wallet, Clock, UserPlus, LayoutDashboard, History, Target, Info, Trash2, ArrowRight, Twitter, Instagram, Linkedin, Bell, CheckCircle2, AlertCircle, Search, Radar, Sparkles, Check, Loader2, Crown, CreditCard, Send, Paperclip, RefreshCw } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTranslation } from '../context/LanguageContext';
import { LockedOverlay } from '../components/LockedOverlay';
import { LYAProtocolBadge } from '../components/LYAProtocol';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, Timestamp, setDoc, doc } from 'firebase/firestore';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
  onLogout: () => void;
  onNotify?: (msg: string, type?: string) => void;
  onViewChange?: (view: View) => void;
  usageStats: {
    simulator: number;
    scan: number;
    talent: number;
  };
  checkUsageLimit: (type: 'simulator' | 'swipe' | 'compare' | 'scan' | 'talent') => boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  user: initialUser, 
  onUpdateUser, 
  onLogout, 
  onNotify,
  onViewChange,
  usageStats,
  checkUsageLimit
}) => {
  const { t } = useTranslation();
  const [user, setUserState] = useState<UserProfile>(initialUser);

  // Sync user state with initialUser prop
  useEffect(() => {
    setUserState(initialUser);
  }, [initialUser]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    email: user.email,
    bio: user.bio || 'Professional gallery specializing in digital assets and creative rights contracts.',
    twitter: user.twitter || '@gallery_insight',
    instagram: user.instagram || 'gallery_insight_official',
    linkedin: user.linkedin || 'linkedin.com/company/lya-professional'
  });

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSave = () => {
    if (!validateEmail(editForm.email)) {
      onNotify?.(t('Please enter a valid email address.', 'Veuillez entrer une adresse e-mail valide.'));
      return;
    }
    const updatedUser = { 
      ...user, 
      displayName: editForm.displayName, 
      email: editForm.email,
      bio: editForm.bio,
      twitter: editForm.twitter,
      instagram: editForm.instagram,
      linkedin: editForm.linkedin
    };
    setUserState(updatedUser);
    onUpdateUser?.(updatedUser);
    setIsEditing(false);
    onNotify?.(t('Profile updated successfully!', 'Profil mis à jour avec succès !'));
  };

  const handlePhotoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = {
          ...user,
          avatarUrl: reader.result as string
        };
        setUserState(updatedUser);
        onUpdateUser?.(updatedUser);
        onNotify?.(t('Profile photo updated!', 'Photo de profil mise à jour !'));
      };
      reader.readAsDataURL(file);
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New Validation Request', message: 'Your project "NEON_GENESIS" has a new validation request.', time: '2h ago', type: 'info' },
    { id: 2, title: 'Score Update', message: 'Your LYA Score has increased by 15 points.', time: '5h ago', type: 'success' },
    { id: 3, title: 'Network Invitation', message: 'You have been invited to the Elite Pro Community.', time: '1d ago', type: 'award' }
  ]);

  const LYAPerformanceSystem = () => {
    interface PillarFactor {
      label: string;
      score: number;
      status: string;
      color: string;
    }

    const [factors] = useState<Record<string, PillarFactor>>(() => {
      if (user.role === UserRole.INVESTOR) {
        return { 
          stability: { label: t('Portfolio Stability', 'Stabilité Portfolio'), score: 185, status: 'OPTIMAL', color: 'bg-emerald-500/20 text-emerald-400' },
          roi: { label: t('ROI Potential', 'Potentiel ROI'), score: 170, status: 'HIGH', color: 'bg-primary-cyan/20 text-primary-cyan' },
          risk: { label: t('Risk Assessment', 'Évaluation Risque'), score: 195, status: 'LOW', color: 'bg-accent-gold/20 text-accent-gold' },
          diversification: { label: t('Diversification Index', 'Indice Diversification'), score: 165, status: 'STABLE', color: 'bg-accent-magenta/20 text-accent-magenta' },
          liquidity: { label: t('Liquidity Ratio', 'Ratio Liquidité'), score: 145, status: 'FLUID', color: 'bg-accent-purple/20 text-accent-purple' }
        };
      } else if (user.role === UserRole.PROFESSIONAL) {
        return { 
          accuracy: { label: t('Valuation Accuracy', 'Précision Évaluation'), score: 190, status: 'ELITE', color: 'bg-primary-cyan/20 text-primary-cyan' },
          network: { label: t('Network Impact', 'Impact Réseau'), score: 180, status: 'GLOBAL', color: 'bg-accent-gold/20 text-accent-gold' },
          management: { label: t('Management Efficiency', 'Efficacité Gestion'), score: 175, status: 'STABLE', color: 'bg-emerald-500/20 text-emerald-400' },
          compliance: { label: t('Compliance Terminal Status', 'Statut Terminal Conformité'), score: 195, status: 'VERIFIED', color: 'bg-accent-magenta/20 text-accent-magenta' },
          impact: { label: t('Ecosystem Impact', 'Impact Écosystème'), score: 180, status: 'INFLUENTIAL', color: 'bg-accent-purple/20 text-accent-purple' }
        };
      }
      return { 
        visibility: { label: t('Visibility & Radiation', 'Visibilité & Rayonnement'), score: 185, status: 'OPTIMAL', color: 'bg-primary-cyan/20 text-primary-cyan' },
        market: { label: t('Market Performance', 'Performance Marché'), score: 142, status: 'GROWING', color: 'bg-accent-gold/20 text-accent-gold' },
        technical: { label: t('Technical Framework', 'Cadre Technique'), score: 190, status: 'EXPERT', color: 'bg-emerald-500/20 text-emerald-400' },
        community: { label: t('Community Engagement', 'Engagement Communauté'), score: 195, status: 'PASSIONATE', color: 'bg-accent-magenta/20 text-accent-magenta' },
        recognition: { label: t('Professional Recognition', 'Reconnaissance Professionnelle'), score: 160, status: 'ESTABLISHED', color: 'bg-accent-purple/20 text-accent-purple' }
      };
    });

    const calculateScore = () => {
      const vals = (Object.values(factors) as PillarFactor[]).map(f => f.score);
      const sum = vals.reduce((a, b) => a + b, 0);
      return sum;
    };

    const score = calculateScore();
    const tier = score > 900 ? 'ELITE' : score > 750 ? 'PRO' : 'STANDARD';

    return (
      <section className="bg-surface-low/30 border border-primary-cyan/20 p-6 md:p-10 backdrop-blur-2xl relative overflow-hidden group rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
          <Award size={120} className="text-primary-cyan" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
          <div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-1">
              <Activity className="text-primary-cyan" size={24} /> {t('LYA PERFORMANCE SYSTEM', 'SYSTÈME DE PERFORMANCE LYA')}
            </h3>
            <p className="text-[8px] md:text-[10px] text-accent-gold uppercase tracking-widest font-bold opacity-40">
              {user.role === UserRole.INVESTOR ? t('Optimize your professional capital allocation', 'Optimisez votre allocation de capital professionnel') :
               user.role === UserRole.PROFESSIONAL ? t('Analyze your network validation efficiency', 'Analysez l\'efficacité de validation de votre réseau') :
               t('Predict your professional valuation potential', 'Prédisez votre potentiel de valorisation professionnelle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] font-black text-accent-gold uppercase tracking-widest opacity-40 mb-1">{t('PERFORMANCE SCORE', 'SCORE DE PERFORMANCE')}</p>
                <p className="text-2xl md:text-4xl font-black text-primary-cyan tracking-tighter">{score}</p>
              </div>
            <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
            <div className="px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/30 rounded-sm">
              <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest">TIER {tier}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {(Object.entries(factors) as [string, PillarFactor][]).map(([key, data]) => (
            <div key={key} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col justify-between h-full group/pillar hover:border-primary-cyan/30 transition-all duration-500">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-2">{data.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter text-white group-hover/pillar:text-primary-cyan transition-colors">{data.score}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant opacity-40">/ 200</span>
                </div>
              </div>
              <div className={`mt-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${data.color} shadow-lg backdrop-blur-md`}>
                {data.status}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-1 w-full bg-white/5 overflow-hidden rounded-full">
          <motion.div 
            animate={{ width: `${(score / 1000) * 100}%` }}
            className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]"
          />
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-[8px] font-black text-accent-gold uppercase tracking-widest opacity-40 mb-2">{t('MARKET POSITION', 'POSITION MARCHÉ')}</p>
            <p className="text-sm font-bold text-white uppercase tracking-tight">{t('Top 5% Professional', 'Top 5% Professionnel')}</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-[8px] font-black text-accent-gold uppercase tracking-widest opacity-40 mb-2">{t('GROWTH VELOCITY', 'VÉLOCITÉ CROISSANCE')}</p>
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-tight">+18.4% / Q1</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-[8px] font-black text-accent-gold uppercase tracking-widest opacity-40 mb-2">{t('TRUST INDEX', 'INDICE DE CONFIANCE')}</p>
            <p className="text-sm font-bold text-accent-gold uppercase tracking-tight">AAA+ STABLE</p>
          </div>
        </div>
      </section>
    );
  };

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'Film',
    assetType: 'Feature Film',
    description: '',
    initialValue: 5000,
    revenueShare: 10,
    issuerDetails: '',
    legalFramework: 'Standard LYA Framework',
    isPremium: false,
    premiumPrice: 0,
    premiumContent: ''
  });

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [simulatorAnswers, setSimulatorAnswers] = useState<Record<string, number>>({});
  const [currentSimulatorScore, setCurrentSimulatorScore] = useState(0);
  const [simulatorResult, setSimulatorResult] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFindingTalent, setIsFindingTalent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'academy' | 'messages' | 'mentorship'>('dashboard');
  const [messages, setMessages] = useState([
    { id: '1', from: 'Marcus Thorne', senderRole: 'Global Market Maker', subject: 'Strategic Partnership', content: 'I reviewed your project CHRONOS_V3. The valuation metrics are impressive. Let\'s schedule a call to discuss market liquidity options.', time: '1h ago', read: false, avatar: 'm1' },
    { id: '2', from: 'Elena Vance', senderRole: 'Grammy Legacy Curator', subject: 'IP Protection Audit', content: 'Your latest music catalog shows potential for a LYA-721 migration. I have some suggestions for the metadata structure.', time: '3h ago', read: true, avatar: 'm2' },
    { id: '3', from: 'Aurelius Art', senderRole: 'Master Curator', subject: 'Gallery Feature', content: 'We are interested in featuring your Fine Art collection in our upcoming digital auction.', time: '1d ago', read: true, avatar: 'm3' }
  ]);
  const [scanResults, setScanResults] = useState<any[] | null>(null);
  const [talentResults, setTalentResults] = useState<any[] | null>(null);

  const [premiumFeature, setPremiumFeature] = useState<string | null>(null);

  const [mentorshipMissions, setMentorshipMissions] = useState([
    { name: 'AURORA_PROJECT', student: 'MARCUS_V', status: 'ACTIVE', progress: 75, impact: '+12.4%', color: 'text-primary-cyan', bg: 'bg-primary-cyan/10' },
    { name: 'NEON_SOUL', student: 'ELENA_X', status: 'MILESTONE_PENDING', progress: 40, impact: '+8.1%', color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
    { name: 'VOID_ARCHITECTURE', student: 'SARAH_K', status: 'RESEARCH', progress: 15, impact: 'INITIATING', color: 'text-accent-magenta', bg: 'bg-accent-magenta/10' }
  ]);

  const loadMoreMentorship = () => {
    const newMissions = [
      { name: 'CHRONO_SHIFT', student: 'ALEX_T', status: 'ACTIVE', progress: 60, impact: '+5.2%', color: 'text-primary-cyan', bg: 'bg-primary-cyan/10' },
      { name: 'QUANTUM_SYNC', student: 'OLIVIA_B', status: 'ONBOARDING', progress: 5, impact: 'WAITING', color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
      { name: 'GHOST_SHELL', student: 'LI_W', status: 'ACTIVE', progress: 90, impact: '+18.7%', color: 'text-accent-magenta', bg: 'bg-accent-magenta/10' }
    ];
    setMentorshipMissions(prev => [...prev, ...newMissions]);
    onNotify?.(t('3 NEW ELITE MISSIONS LOADED', '3 NOUVELLES MISSIONS ÉLITE CHARGÉES'), 'success');
  };

  const PREMIUM_FEATURES_CONTENT: Record<string, { description: string, previewImage?: string, benefits: { label: string, desc: string }[] }> = {
    'LYA Score': {
      description: t('Access the full LYA scoring algorithm to precisely evaluate your market potential and professional radiation. Get a deep-dive audit of your creative assets.', 'Accédez à l\'algorithme complet de scoring LYA pour évaluer précisément votre potentiel de marché et votre rayonnement professionnel. Obtenez un audit approfondi de vos actifs créatifs.'),
      previewImage: 'https://picsum.photos/seed/lya-score-audit/800/400',
      benefits: [
        { label: t('Full AI Audit', 'Audit IA Complet'), desc: t('Deep analysis of 50+ data points across 5 strategic pillars.', 'Analyse approfondie de 50+ points de données sur 5 piliers stratégiques.') },
        { label: t('LYA Certification', 'Certification LYA'), desc: t('Verified score displayed on your public profile and professional registry.', 'Score vérifié affiché sur votre profil public et le registre professionnel.') },
        { label: t('Benchmarking', 'Benchmarking'), desc: t('Compare your performance with industry leaders and competitors.', 'Comparez votre performance avec les leaders du secteur et vos concurrents.') },
        { label: t('Strategic Roadmap', 'Feuille de Route Stratégique'), desc: t('Personalized AI recommendations to increase your professional value.', 'Recommandations IA personnalisées pour augmenter votre valeur professionnelle.') }
      ]
    },
    'Find Talent': {
      description: t('Explore our exclusive database of verified creators and professionals. Use advanced filters to find the perfect match for your next strategic collaboration.', 'Explorez notre base de données exclusive de créateurs et professionnels vérifiés. Utilisez des filtres avancés pour trouver le partenaire idéal pour votre prochaine collaboration stratégique.'),
      previewImage: 'https://picsum.photos/seed/talent-discovery/800/400',
      benefits: [
        { label: t('Advanced Filters', 'Filtres Avancés'), desc: t('Search by LYA score, rarity, specialty, and market performance.', 'Recherche par score LYA, rareté, spécialité et performance du marché.') },
        { label: t('Direct Secure Contact', 'Contact Direct Sécurisé'), desc: t('Encrypted messaging with verified professional talents.', 'Messagerie cryptée avec les talents professionnels vérifiés.') },
        { label: t('Performance History', 'Historique de Performance'), desc: t('View past successes and verified track records of creators.', 'Consultez les succès passés et les antécédents vérifiés des créateurs.') },
        { label: t('Private Network', 'Réseau Privé'), desc: t('Access to non-public profiles and exclusive creative centers.', 'Accès aux profils non-publics et aux centres créatifs exclusifs.') }
      ]
    },
    'Scan Opportunity': {
      description: t('Our AI-powered Intelligence Terminal scans the market in real-time to identify high-potential creative assets before they reach the public market.', 'Notre Terminal d\'Intelligence alimenté par l\'IA scanne le marché en temps réel pour identifier les actifs créatifs à haut potentiel avant qu\'ils n\'atteignent le marché public.'),
      previewImage: 'https://picsum.photos/seed/market-scan/800/400',
      benefits: [
        { label: t('Real-time Insight', 'Insight Temps Réel'), desc: t('Be notified instantly as soon as an opportunity matches your criteria.', 'Soyez notifié instantanément dès qu\'une opportunité correspond à vos critères.') },
        { label: t('Risk/Reward Analysis', 'Analyse Risque/Rendement'), desc: t('Automated assessment of project viability and financial robustness.', 'Évaluation automatisée de la viabilité du projet et de la robustesse financière.') },
        { label: t('ROI Projection', 'Projection de ROI'), desc: t('36-month ROI estimations based on historical market data.', 'Estimations de ROI sur 36 mois basées sur les données historiques du marché.') },
        { label: t('Priority Access', 'Accès Prioritaire'), desc: t('Participate in private funding rounds and pre-listing events.', 'Participez aux tours de financement privés et aux événements de pré-listing.') }
      ]
    },
    'Expert Terminal': {
      description: t('Deploy your own Institutional Terminal to manage massive creative catalogs and provide deep market liquidity to your sub-entities. Outsource your initial vetting directly to the LYA security protocol.', 'Déployez votre propre Terminal Institutionnel pour gérer des catalogues créatifs massifs et fournir une liquidité de marché profonde à vos sous-entités. Externalisez votre vérification initiale directement au protocole de sécurité LYA.'),
      previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      benefits: [
        { label: t('Catalog Management', 'Gestion de Catalogue'), desc: t('Bulk boarding of 1000+ assets with automated indexing.', 'Intégration en masse de 1000+ actifs avec indexation automatisée.') },
        { label: t('Editorial Externalization', 'Externalisation Éditoriale'), desc: t('Eliminate internal "slush pile" costs via decentralized validation.', 'Éliminez les coûts des comités de lecture via la validation décentralisée.') },
        { label: t('Institutional Funding', 'Financement Institutionnel'), desc: t('Access private liquidity pools for large-scale IP development.', 'Accédez aux pools de liquidité privés pour le développement d\'IP à grande échelle.') },
        { label: t('Master Registry Access', 'Accès au Registre Maître'), desc: t('Full control over sub-indices and corporate valuation benchmarks.', 'Contrôle total sur les sous-indices et benchmarks de valorisation.') }
      ]
    },
    'Lounge Access': {
      description: t('The Pro Lounge is an exclusive digital space for verified professionals to discuss market trends, regulatory updates (like MiCA), and strategic partnerships. Access high-level networking and private deal flow.', 'Le Salon Pro est un espace numérique exclusif pour les professionnels vérifiés afin de discuter des tendances du marché, des mises à jour réglementaires (comme MiCA) et des partenariats stratégiques. Accédez à un networking de haut niveau et à un deal flow privé.'),
      previewImage: 'https://picsum.photos/seed/market-networking/800/400',
      benefits: [
        { label: t('Strategic Networking', 'Networking Stratégique'), desc: t('Connect with other high-level professional actors and verified creators.', 'Connectez-vous avec d\'autres acteurs professionnels de haut niveau et des créateurs vérifiés.') },
        { label: t('Regulatory Intelligence', 'Intelligence Réglementaire'), desc: t('Real-time discussions on legal frameworks, MiCA compliance, and tax optimization.', 'Discussions en temps réel sur les cadres juridiques, la conformité MiCA et l\'optimisation fiscale.') },
        { label: t('Exclusive Deal Flow', 'Deal Flow Exclusif'), desc: t('Early access to private asset listings and professional-grade investment opportunities.', 'Accès anticipé aux listings d\'actifs privés et aux opportunités d\'investissement de qualité professionnelle.') },
        { label: t('Direct Governance', 'Gouvernance Directe'), desc: t('Influence the platform\'s strategic roadmap and vote on protocol parameters.', 'Influencez la feuille de route stratégique de la plateforme et votez sur les paramètres du protocole.') }
      ]
    }
  };

  const handlePremiumFeature = (featureName: string) => {
    if (user.isPro || user.role === UserRole.PROFESSIONAL || user.role === UserRole.ADMIN) {
      if (featureName === 'Lounge Access' && onViewChange) {
        onViewChange('LOUNGE');
        return;
      }
      onNotify?.(t(`Accessing ${featureName}...`, `Accès à ${featureName}...`));
      return;
    }
    setPremiumFeature(featureName);
  };

  const handleManageSubscription = async () => {
    if (!user.stripeCustomerId) {
      onNotify?.(t('No active subscription found in your profile.', 'Aucun abonnement actif trouvé dans votre profil.'));
      return;
    }

    onNotify?.(t('Opening Customer Portal...', 'Ouverture du Portail Client...'));
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: user.stripeCustomerId,
          returnUrl: window.location.origin
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      window.location.href = url;
    } catch (err: any) {
      console.error('Portal Error:', err);
      onNotify?.(err.message || 'Failed to open customer portal.');
    }
  };

  const handleSimulatorAnswer = (stepId: number, questionId: number, points: number) => {
    const key = `${stepId}-${questionId}`;
    const newAnswers = { ...simulatorAnswers, [key]: points };
    setSimulatorAnswers(newAnswers);
    
    // Update real-time score
    const total = (Object.values(newAnswers) as number[]).reduce((a, b) => a + b, 0);
    setCurrentSimulatorScore(total);
  };

  const calculateSimulatorScore = () => {
    const total = (Object.values(simulatorAnswers) as number[]).reduce((a, b) => a + b, 0);
    setSimulatorResult(total);
    return total;
  };

  const nextSimulatorStep = () => {
    if (simulatorStep < LYA_SIMULATOR_STEPS.length - 1) {
      setSimulatorStep(prev => prev + 1);
    } else {
      calculateSimulatorScore();
    }
  };

  const prevSimulatorStep = () => {
    if (simulatorStep > 0) {
      setSimulatorStep(prev => prev - 1);
    }
  };

  const resetSimulator = () => {
    setIsSimulatorOpen(false);
    setSimulatorStep(0);
    setSimulatorAnswers({});
    setSimulatorResult(null);
  };

  const handleScan = () => {
    if (!checkUsageLimit('scan')) return;
    setIsScanning(true);
    setScanResults(null);
    
    // Mock scanning process
    setTimeout(() => {
      setIsScanning(false);
      const results = CONTRACTS.slice(0, 3).map(c => ({
        ...c,
        matchScore: Math.floor(Math.random() * 20) + 80 // 80-100% match
      }));
      setScanResults(results);
      onNotify?.(t('Opportunity Scan Complete: 3 high-potential projects identified.', 'Scan d\'opportunité terminé : 3 projets à haut potentiel identifiés.'));
    }, 3000);
  };

  const handleFindTalent = () => {
    if (!checkUsageLimit('talent')) return;
    setIsFindingTalent(true);
    setTalentResults(null);
    setTimeout(() => {
      setIsFindingTalent(false);
      const results = [
        { id: 'LYA-772-X', specialty: 'Digital Art', score: 895, availability: 'IMMEDIATE' },
        { id: 'LYA-912-B', specialty: 'Music', score: 912, availability: '2 WEEKS' },
        { id: 'LYA-441-C', specialty: 'Photography', score: 878, availability: 'IMMEDIATE' }
      ];
      setTalentResults(results);
      onNotify?.(t('Talent search completed. 3 matching profiles identified.', 'Recherche de talents terminée. 3 profils correspondants identifiés.'));
    }, 3000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    setTimeout(() => {
      setIsInviting(false);
      setInviteEmail('');
      onNotify?.(t('Elite invitation sent successfully!', 'Invitation Élite envoyée avec succès !'), 'success');
    }, 2000);
  };

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch projects from Firestore
  useEffect(() => {
    if (!user.uid) return;

    const q = query(
      collection(db, 'projects'),
      where('issuerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);
      setLoadingProjects(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
      setLoadingProjects(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDownload = (fileName: string) => {
    onNotify?.(t('INITIALIZING SECURE DOWNLOAD...', 'INITIALISATION DU TÉLÉCHARGEMENT SÉCURISÉ...'));
    
    setTimeout(() => {
      const content = `LinkYourArt Professional Document: ${fileName}\nUser: ${user.uid}\nTimestamp: ${new Date().toISOString()}\nStatus: SECURE\n\nThis is a certified LYA protocol document export.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LYA_${fileName.replace('.pdf', '')}_CERTIFIED.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onNotify?.(t('DOWNLOAD COMPLETE', 'TÉLÉCHARGEMENT TERMINÉ'), 'success');
    }, 1500);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description) {
      onNotify?.(t('Please fill in all required fields.', 'Veuillez remplir tous les champs obligatoires.'));
      return;
    }

    setIsUploading(true);
    
    try {
      const projectData = {
        name: newProject.name,
        category: newProject.category,
        assetType: newProject.assetType,
        description: newProject.description,
        initialValue: Number(newProject.initialValue),
        revenueShare: Number(newProject.revenueShare),
        issuerDetails: newProject.issuerDetails,
        legalFramework: newProject.legalFramework,
        issuerUid: user.uid,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        pillars: [
          { label: t('Visibility', 'Visibilité'), score: 100 },
          { label: t('Market', 'Marché'), score: 100 },
          { label: t('Technical', 'Technique'), score: 100 },
          { label: t('Community', 'Communauté'), score: 100 },
          { label: t('Recognition', 'Reconnaissance'), score: 100 }
        ],
        score: 500,
        image: `https://picsum.photos/seed/${newProject.name.replace(/\s+/g, '_')}/800/600`
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      setProjectSuccess(true);
      onNotify?.(t('Project created and submitted for validation!', 'Projet créé et soumis pour validation !'), 'success');
      
      setTimeout(() => {
        setProjectSuccess(false);
        setIsCreatingProject(false);
        setNewProject({
          name: '',
          category: 'Film',
          assetType: 'Feature Film',
          description: '',
          initialValue: 5000,
          revenueShare: 10,
          issuerDetails: '',
          legalFramework: 'Standard LYA Framework',
          isPremium: false,
          premiumPrice: 0,
          premiumContent: ''
        });
      }, 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
    } finally {
      setIsUploading(false);
    }
  };

  const closeProjectModal = () => {
    setIsCreatingProject(false);
    setProjectSuccess(false);
    setNewProject({
      name: '',
      category: 'Film',
      assetType: 'Feature Film',
      description: '',
      initialValue: 5000,
      revenueShare: 10,
      issuerDetails: '',
      legalFramework: 'Standard LYA Framework',
      isPremium: false,
      premiumPrice: 0,
      premiumContent: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        onNotify?.(t('Document uploaded successfully!', 'Document téléchargé avec succès !'));
      }, 1500);
    }
  };

  const getBadge = () => {
    switch (user.role) {
      case UserRole.CREATOR:
        return {
          icon: Zap,
          label: t('Certified Creator', 'Créateur Certifié'),
          color: 'text-primary-cyan',
          bg: 'bg-primary-cyan/10',
          border: 'border-primary-cyan/30'
        };
      case UserRole.INVESTOR:
        return {
          icon: Award,
          label: t('Institutional Investor', 'Investisseur Institutionnel'),
          color: 'text-accent-gold',
          bg: 'bg-accent-gold/10',
          border: 'border-accent-gold/30'
        };
      case UserRole.PROFESSIONAL:
        return {
          icon: ShieldCheck,
          label: t('Verified Professional', 'Professionnel Vérifié'),
          color: 'text-emerald-400',
          bg: 'bg-emerald-400/10',
          border: 'border-emerald-400/30'
        };
      case UserRole.ADMIN:
        return {
          icon: Crown,
          label: t('System Administrator', 'Administrateur Système'),
          color: 'text-accent-gold',
          bg: 'bg-accent-gold/10',
          border: 'border-accent-gold/30'
        };
      default:
        return null;
    }
  };

  const badge = getBadge();

  const renderAcademyContent = () => (
    <div className="mt-6 md:mt-10 bg-surface-low/30 border border-white/10 p-5 md:p-8 backdrop-blur-2xl relative overflow-hidden group rounded-2xl shadow-2xl">
      <div className="absolute top-0 right-0 p-3 md:p-4">
        <div className="px-2 md:px-3 py-0.5 md:py-1 bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[7px] md:text-[8px] font-mono uppercase tracking-widest">
          {t('Premium Access Required', 'Accès Premium Requis')}
        </div>
      </div>
      
      <h3 className="text-lg md:text-2xl font-black uppercase mb-5 md:mb-8 flex items-center gap-3">
        <Play className="text-primary-cyan fill-primary-cyan/20" size={24} /> {t('LYA Academy', 'Académie LYA')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: t("Creative Asset Valuation", "Évaluation des Actifs Créatifs"), duration: "45:00", type: t("Masterclass", "Masterclass") },
          { title: t("Indexed Contract Law", "Droit des Contrats Indexés"), duration: "32:15", type: t("Legal", "Juridique") },
          { title: t("LYA Investment Strategies", "Stratégies d'Investissement LYA"), duration: "28:40", type: t("Finance", "Finance") }
        ].map((video, i) => (
          <div key={i} className="relative aspect-video bg-black/40 border border-white/10 flex flex-col items-center justify-center group/video overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/academy${i}/400/225`} 
              alt="Video thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover/video:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            
            <div className="relative z-10 flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 md:mb-4 border border-white/20 group-hover/video:bg-primary-cyan/20 group-hover/video:border-primary-cyan/40 transition-all">
                <Lock className="text-white/40 group-hover/video:text-primary-cyan" size={18} />
              </div>
              <p className="text-[9px] md:text-xs font-bold uppercase mb-1 line-clamp-2">{video.title}</p>
              <p className="text-[7px] md:text-[9px] font-mono text-gray-500 uppercase tracking-widest">{video.type} • {video.duration}</p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full group-hover/video:translate-y-0 transition-transform bg-primary-cyan/90">
              <button className="w-full text-black text-[8px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2">
                {t('Unlock Access', 'Débloquer l\'Accès')} <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-5 md:mt-8 p-4 md:p-6 border border-dashed border-white/20 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="text-center lg:text-left">
          <p className="text-[10px] md:text-sm font-bold uppercase mb-1">{t('Unlimited Access to YouTube Premium Content', 'Accès Illimité au Contenu Premium YouTube')}</p>
          <p className="text-[8px] md:text-xs text-gray-500">{t('Continuous training, market analysis, and exclusive tutorials.', 'Formation continue, analyse de marché et tutoriels exclusifs.')}</p>
        </div>
        <button 
          onClick={() => handlePremiumFeature('LYA Academy Subscription')}
          className="w-full lg:w-auto px-5 py-2 md:py-3 bg-white text-black font-black uppercase text-[9px] md:text-xs hover:bg-primary-cyan transition-colors active:scale-95"
        >
          {t('Subscribe to LYA Academy', 'S\'abonner à l\'Académie LYA')}
        </button>
      </div>
    </div>
  );

  const renderMessagesContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-surface-low/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-3 mb-2">
              <Mail className="text-primary-cyan" size={24} /> {t('Secure Professional Inbox', 'Boîte de Réception Professionnelle')}
            </h3>
            <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">{t('Verified end-to-end encrypted communication channel', 'Canal de communication vérifié chiffré de bout en bout')}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNotify?.(t('INITIALIZING SECURE DISPATCH TERMINAL...', 'INITIALISATION DU TERMINAL D\'ENVOI SÉCURISÉ...'))}
              className="px-6 py-3 bg-white text-surface-dim font-black uppercase text-[9px] tracking-[0.2em] hover:bg-primary-cyan transition-all flex items-center gap-3 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <Send size={14} /> {t('New Dispatch', 'Nouvel Envoi')}
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <ShieldCheck className="text-emerald-400" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('E2E Encrypted', 'Chiffré de bout en bout')}</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-8 hover:bg-white/5 transition-all cursor-pointer group flex flex-col sm:flex-row items-start gap-6 ${!msg.read ? 'bg-primary-cyan/[0.03]' : ''}`}
                onClick={() => {
                  setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
                  onNotify?.(t('Opening secure decryption terminal...', 'Ouverture du terminal de déchiffrement sécurisé...'));
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-surface-high border-2 border-white/10 overflow-hidden shadow-xl">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${msg.avatar}`} 
                      alt="" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {!msg.read && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-cyan rounded-full border-2 border-surface-dim shadow-[0_0_15px_rgba(0,224,255,0.8)]" />
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-black text-white group-hover:text-primary-cyan transition-colors tracking-tighter uppercase">{msg.from}</span>
                      <div className="px-2 py-0.5 bg-accent-gold/10 border border-accent-gold/20 rounded text-[8px] font-black text-accent-gold uppercase tracking-widest">{msg.senderRole}</div>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{msg.time}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-primary-cyan uppercase tracking-[0.2em]">{msg.subject}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      {msg.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <button className="flex items-center gap-2 text-[9px] font-black uppercase text-primary-cyan hover:text-white transition-colors">
                      <MessageSquare size={12} /> {t('Reply', 'Répondre')}
                    </button>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <button className="flex items-center gap-2 text-[9px] font-black uppercase text-on-surface-variant hover:text-white transition-colors">
                      <Trash2 size={12} /> {t('Archive', 'Archiver')}
                    </button>
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center self-center text-on-surface-variant/20 group-hover:text-primary-cyan transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowRight size={24} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-32 text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Mail className="text-on-surface-variant opacity-20" size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-white uppercase tracking-tighter">{t('Inbound Silence', 'Silence Entrant')}</p>
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest opacity-40">{t('No professional messages indexed in your secure registry.', 'Aucun message professionnel indexé dans votre registre sécurisé.')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const ScrambleText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  React.useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split('').map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      
      iteration += 1 / 3;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span className={isScrambling ? 'font-mono' : ''}>{displayText}</span>;
};

const renderMentorshipContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12 pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Mentorship Registry */}
        <section className="lg:col-span-12 bg-surface-low/30 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
            <Award size={200} className="text-accent-gold" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4 mb-2">
                  <Crown className="text-accent-gold" size={32} /> {t('ELITE MENTORSHIP PROTOCOL', 'PROTOCOLE DE MENTORAT D\'ÉLITE')}
                </h3>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] opacity-40">{t('Managing market guidance for high-potential creative entities', 'Gestion de l\'orientation du marché pour les entités créatives à haut potentiel')}</p>
              </div>
              <div className="px-6 py-3 bg-accent-gold/10 border border-accent-gold/30 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em]">{mentorshipMissions.length} {t('ACTIVE MISSIONS', 'MISSIONS ACTIVES')}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mentorshipMissions.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 3) * 0.1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-[2rem] group hover:border-primary-cyan/40 transition-all duration-500 relative overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight group-hover:${m.color} transition-colors mb-1`}>{m.name}</p>
                        <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40">Mentee: {m.student}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-[7px] font-black uppercase ${m.bg} ${m.color} animate-pulse`}>
                        {m.impact}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">{t('SYNC PROGRESS', 'SYNCHRONISATION')}</p>
                        <p className={`text-xs font-black ${m.color}`}>{m.progress}%</p>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.progress}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full ${m.bg.replace('/10', '')} shadow-[0_0_10px_rgba(0,224,255,0.3)]`} 
                        />
                      </div>
                    </div>

                    <button className="w-full mt-8 py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                      <MessageSquare size={12} /> {t('OPEN SECURE CHANNEL', 'CANAL SÉCURISÉ')}
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={loadMoreMentorship}
                  className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.4em] hover:bg-primary-cyan hover:text-surface-dim hover:border-primary-cyan transition-all active:scale-95 group flex items-center gap-4"
                >
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                  {t('LOAD MORE ELITE MISSIONS', 'CHARGER PLUS DE MISSIONS D\'ÉLITE')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Messaging Logic Terminal */}
        <section className="lg:col-span-12 bg-surface-low border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
          <div className="w-full md:w-80 bg-white/[0.02] border-r border-white/5 p-8 overflow-y-auto">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">{t('ACTIVE SESSIONS', 'SESSIONS ACTIVES')}</h4>
            <div className="space-y-4">
              {['MARCUS_V', 'ELENA_X', 'SARAH_K'].map((name, i) => (
                <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer ${i === 0 ? 'bg-primary-cyan/10 border-primary-cyan/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-high border border-white/10 overflow-hidden shrink-0">
                      <img src={`https://i.pravatar.cc/100?u=${name}`} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{name}</p>
                      <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">MEMBER_ID_{100 + i}</p>
                    </div>
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse ml-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-surface-dim/40 relative">
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                   <Zap size={20} />
                 </div>
                 <div>
                   <h4 className="text-base font-black text-white uppercase tracking-tighter mb-0.5">MARCUS_V</h4>
                   <p className="text-[8px] text-primary-cyan font-black uppercase tracking-widest">{t('IDENTITY VERIFIED', 'IDENTITÉ VÉRIFIÉE')}</p>
                 </div>
               </div>
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                   <Lock size={12} className="text-emerald-400" />
                   <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">E2E ENCRYPTED</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <ShieldCheck size={12} className="text-primary-cyan" />
                   <span className="text-[8px] font-black text-primary-cyan uppercase tracking-widest leading-none">VERIFIED BY LYA PROTOCOL</span>
                 </div>
                 <button className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group">
                   <FileText size={10} className="text-accent-gold group-hover:scale-110" />
                   <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">{t('REQUEST AUDIT', 'DEMANDER UN AUDIT')}</span>
                 </button>
                 <div className="flex items-center gap-2 ml-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[8px] font-black text-on-surface-variant font-mono uppercase tracking-widest">GATEWAY_CONNECTED</span>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button className="p-3 text-white/30 hover:text-white transition-colors"><Info size={18} /></button>
                 <button className="p-3 text-white/30 hover:text-white transition-colors"><ShieldCheck size={18} /></button>
               </div>
             </div>

             <div className="flex-1 p-10 overflow-y-auto space-y-8 flex flex-col justify-end min-h-[400px]">
               <div className="flex justify-start">
                 <div className="max-w-[70%] bg-white/5 border border-white/10 p-6 rounded-2xl rounded-tl-none shadow-xl">
                   <p className="text-sm text-on-surface leading-relaxed opacity-80">
                     <ScrambleText text="The licensing structure for the neural assets is complex. I need guidance on the secondary rights clause before we move to Phase 2." />
                   </p>
                   <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-4 opacity-40">10:42 AM • DECRYPTED</p>
                 </div>
               </div>
               
               <div className="flex justify-end">
                 <div className="max-w-[70%] bg-primary-cyan/10 border border-primary-cyan/20 p-6 rounded-2xl rounded-tr-none shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -translate-y-12 translate-x-12" />
                   <p className="text-sm text-white leading-relaxed relative z-10">
                     <ScrambleText text="Review the Sector 0x4 standard. We focus on cumulative participation rather than direct buyouts. It protects the legacy value of the initial unit." />
                   </p>
                   <p className="text-[8px] font-black text-primary-cyan uppercase tracking-widest mt-4 relative z-10 text-right">YOU (MENTOR) • ENCRYPTED</p>
                 </div>
               </div>
             </div>

             <div className="p-8 bg-white/[0.02] border-t border-white/5">
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder={t('Type secure message dispatch...', 'Écrire un message sécurisé...')}
                    className="w-full bg-surface-dim border border-white/10 p-6 pr-16 text-sm font-bold text-white rounded-2xl focus:border-primary-cyan/50 focus:bg-surface-dim transition-all outline-none placeholder:text-white/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button className="p-3 text-white/20 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><Paperclip size={18} /></button>
                    <button className="p-3 bg-primary-cyan text-surface-dim rounded-xl hover:bg-white transition-all shadow-lg active:scale-95">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 ml-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[7px] font-black text-on-surface-variant uppercase tracking-widest">{t('SYSTEM READY FOR DISPATCH', 'SYSTÈME PRÊT POUR L\'ENVOI')}</span>
                </div>
             </div>
          </div>
        </section>
      </div>
    </motion.div>
  );

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case UserRole.CREATOR:
        return (
          <div className="space-y-12">
            <nav className="flex gap-4 md:gap-12 border-b border-white/5 relative mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 px-1">
              {[
                { id: 'dashboard', label: t('Professional Dashboard', 'Tableau de Bord'), icon: <LayoutDashboard size={18} /> },
                { id: 'messages', label: t('Secure Messages', 'Messages Sécurisés'), icon: <MessageSquare size={18} />, badge: messages.filter(m => !m.read).length },
                { id: 'academy', label: t('LYA Academy', 'Académie LYA'), icon: <Play size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3 transition-all relative shrink-0 ${
                    activeTab === tab.id ? 'text-primary-cyan italic' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-accent-magenta text-[8px] text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-tab-profile"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </nav>

            {activeTab === 'messages' && renderMessagesContent()}
            {activeTab === 'academy' && renderAcademyContent()}
            {activeTab === 'dashboard' && (
              <div className="space-y-16">
                {/* LYA Simulator CTA */}
            <section className="relative overflow-hidden rounded-3xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-cyan/20 via-accent-purple/20 to-accent-magenta/20 opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="relative bg-surface-low/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-2 py-1 bg-primary-cyan/20 border border-primary-cyan/30 rounded text-[8px] font-black text-primary-cyan uppercase tracking-widest">Beta</div>
                    <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter text-white uppercase italic">
                      {t('LYA Simulator', 'Simulateur LYA')}
                    </h2>
                  </div>
                  <p className="text-sm md:text-lg text-on-surface-variant font-medium max-w-xl mb-6">
                    {t('Estimate your creative valuation potential. Our algorithm analyzes your professional radiation and market performance to provide a preliminary LYA Score.', 'Estimez votre potentiel de valorisation créative. Notre algorithme analyse votre rayonnement professionnel et vos performances de marché pour fournir un score LYA préliminaire.')}
                  </p>
                  <button 
                    onClick={() => {
                      if (checkUsageLimit('simulator')) {
                        setIsSimulatorOpen(true);
                      }
                    }}
                    className={`px-8 py-4 font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3 relative group ${
                      usageStats?.simulator >= 3 && !user?.isPro
                        ? 'bg-accent-gold text-surface-dim animate-pulse shadow-accent-gold/40'
                        : 'bg-primary-cyan text-surface-dim hover:bg-white shadow-primary-cyan/20'
                    }`}
                  >
                    <Zap size={18} /> {t('Start Simulation', 'Démarrer la Simulation')}
                    {!user?.isPro && (
                      <span className="absolute -top-3 -right-3 px-2 py-1 bg-surface-dim border border-white/20 rounded-lg text-[8px] font-black text-white group-hover:border-primary-cyan transition-colors">
                        {usageStats.simulator}/{user?.isPro ? '∞' : '4'}
                      </span>
                    )}
                  </button>
                </div>
                <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary-cyan/10 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-48 h-48 md:w-64 md:h-64 border-2 border-primary-cyan/30 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 border border-primary-cyan/50 rounded-full flex items-center justify-center animate-spin-slow">
                      <div className="w-4 h-4 bg-primary-cyan rounded-full shadow-[0_0_20px_rgba(0,224,255,1)]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl md:text-5xl font-black font-headline text-primary-cyan">LYA</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Creator Header - Premium Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('Total Assets', 'Total Actifs')} 
          value="12" 
          icon={<Layers size={20} />} 
          trend="+2 this month" 
          color="cyan" 
          subValue="DIVERSIFIED PORTFOLIO"
        />
        <StatCard 
          title={t('Market Valuation', 'Valorisation Marché')} 
          value="450K LYA" 
          icon={<Wallet size={20} />} 
          trend="+15.4%" 
          color="emerald" 
          subValue="EXPERT GRADE"
        />
        <StatCard 
          title={t('Avg. LYA Score', 'Score LYA Moy.')} 
          value="84.2" 
          icon={<Zap size={20} />} 
          trend="Top 5%" 
          color="gold" 
          subValue="LYA-V4 ALGORITHM"
        />
        <StatCard 
          title={t('Active Investors', 'Investisseurs Actifs')} 
          value="1.2K" 
          icon={<Globe size={20} />} 
          trend="Global Reach" 
          color="purple" 
          subValue="VERIFIED TERMINALS"
        />
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
              <div className="lg:col-span-8 space-y-8 md:space-y-16">
                {/* Active Projects - Premium Grid */}
                <section>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-6">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <LayoutGrid className="text-primary-cyan" size={28} /> {t('Active Projects', 'Projets Actifs')}
                      </h3>
                      <p className="text-[10px] md:text-xs text-accent-gold uppercase tracking-widest font-bold opacity-40">{t('Manage your indexed creative equity', 'Gérez votre équité créative indexée')}</p>
                    </div>
                    <button 
                      onClick={() => setIsCreatingProject(true)}
                      className="w-full sm:w-auto px-4 md:px-8 py-2 md:py-4 bg-primary-cyan text-surface-dim text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,224,255,0.15)] flex items-center justify-center gap-3 md:gap-4 group active:scale-95"
                    >
                      <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" /> {t('Index New Asset', 'Indexer Nouvel Actif')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {projects.map((project, i) => (
                      <div key={i} className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 overflow-hidden group hover:border-primary-cyan/40 transition-all duration-700 flex flex-col h-full relative shadow-2xl rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="h-48 md:h-64 relative overflow-hidden">
                          <img 
                            src={`https://picsum.photos/seed/${project.name}/800/600`} 
                            alt={project.name} 
                            className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000 ease-out" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/20 to-transparent" />
                          
                          <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-col items-end gap-3 z-20">
                            <div className="px-3 md:px-4 py-1 md:py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-2xl rounded-lg">
                              {project.status}
                            </div>
                            <div className="bg-black/60 backdrop-blur-xl border border-primary-cyan/30 p-2 md:p-3 rounded-xl flex flex-col items-center justify-center min-w-[70px] shadow-2xl">
                              <div className="text-[7px] md:text-[8px] font-black text-primary-cyan uppercase tracking-widest mb-1">{t('LYA SCORE', 'SCORE LYA')}</div>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">{project.score}</span>
                                <span className="text-[8px] text-on-surface-variant opacity-40 font-bold">/1k</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-4 md:bottom-6 left-6 md:left-8">
                            <p className="text-xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow-2xl">{project.name}</p>
                            <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant">{t('LIVE ON REGISTRY', 'EN DIRECT SUR LE REGISTRE')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8 flex flex-col flex-1 bg-surface-low/50 backdrop-blur-sm">
                          <div className="grid grid-cols-1 gap-4 md:gap-8 mb-6 md:mb-10">
                            <div className="space-y-1">
                              <p className="text-[8px] md:text-[9px] text-accent-gold font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">{t('Asset Value', 'Valeur Actif')}</p>
                              <p className="text-xl md:text-2xl font-black tracking-tight text-white">{project.value}</p>
                            </div>
                          </div>

                          {/* Pillar Breakdown for Projects */}
                          {project.pillars && (
                            <div className="grid grid-cols-5 gap-2 mb-8 pt-6 border-t border-white/5">
                              {project.pillars.map((p: any, idx: number) => (
                                <div key={idx} className="text-center space-y-1">
                                  <div className={`text-[11px] font-black uppercase tracking-tighter ${
                                    idx === 0 ? 'text-primary-cyan' : 
                                    idx === 1 ? 'text-accent-pink' : 
                                    idx === 2 ? 'text-accent-green' : 
                                    idx === 3 ? 'text-accent-purple' : 
                                    'text-accent-gold'
                                  }`}>
                                    {p.score}
                                  </div>
                                  <div className="text-[8px] text-white uppercase tracking-widest font-bold opacity-80 truncate">
                                    {p.label.split(' ')[0]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-auto flex gap-3 md:gap-4">
                            <button 
                              onClick={() => handlePremiumFeature('IP Rights Management')}
                              className="flex-1 py-3 md:py-4 bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-primary-cyan hover:text-surface-dim hover:border-primary-cyan transition-all duration-300 rounded-xl"
                            >
                              {t('Manage IP Rights', 'Gérer les Droits PI')}
                            </button>
                            <button 
                              onClick={() => handlePremiumFeature('Settings')}
                              className="px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 text-on-surface-variant hover:text-primary-cyan hover:border-primary-cyan/50 transition-all group/btn rounded-xl"
                            >
                              <Settings size={16} className="group-hover/btn:rotate-90 transition-transform duration-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Revenue Analytics - Premium Chart */}
                <section className="bg-surface-low/30 border border-white/10 p-6 md:p-12 backdrop-blur-2xl relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-6">
                    <div>
                      <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <TrendingUp className="text-primary-cyan" size={28} /> {t('Revenue Analytics', 'Analyses de Revenus')}
                      </h3>
                      <p className="text-[9px] md:text-xs text-accent-gold uppercase tracking-widest font-bold opacity-40">{t('Real-time yield and royalty tracking', 'Suivi en temps réel du rendement et des redevances')}</p>
                    </div>
                    <div className="flex gap-6 md:gap-8">
                      <div className="text-right">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold opacity-50 mb-1">{t('Monthly Yield', 'Rendement Mensuel')}</p>
                        <p className="text-xl md:text-3xl font-black tracking-tight text-emerald-400">+12.4%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 md:h-96 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-cyan/[0.02] to-transparent pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Jan', revenue: 4500, royalties: 2100 },
                        { name: 'Feb', revenue: 5200, royalties: 2400 },
                        { name: 'Mar', revenue: 4800, royalties: 2200 },
                        { name: 'Apr', revenue: 6100, royalties: 2800 },
                        { name: 'May', revenue: 5900, royalties: 2600 },
                        { name: 'Jun', revenue: 7200, royalties: 3200 },
                      ]}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRoy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff10" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <YAxis 
                          stroke="#ffffff10" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => `$${v}`}
                          tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0A0A0A', 
                            border: '1px solid #ffffff10', 
                            fontSize: '12px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                          }}
                          itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#00E0FF" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        <Area type="monotone" dataKey="royalties" stroke="#FFD700" fillOpacity={1} fill="url(#colorRoy)" strokeWidth={2} strokeDasharray="8 8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 flex justify-center gap-12">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary-cyan rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t('Direct Revenue', 'Revenus Directs')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent-gold rounded-full border border-dashed border-white/20" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t('Secondary Royalties', 'Redevances Secondaires')}</span>
                    </div>
                  </div>
                </section>

                <LYAPerformanceSystem />
              </div>

              <div className="lg:col-span-4 space-y-16">
                {/* Creative Identity - Premium Card */}
                <section className="bg-surface-low/30 border border-white/10 p-6 md:p-10 backdrop-blur-2xl relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.03]">
                    <Award size={100} className="text-primary-cyan" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase mb-6 md:mb-10 flex items-center gap-3 md:gap-4 relative z-10">
                    <Award className="text-primary-cyan" size={24} /> {t('Creative Identity', 'Identité Créative')}
                  </h3>
                  <div className="space-y-6 md:space-y-8 relative z-10">
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 group hover:border-primary-cyan/30 transition-all duration-500 rounded-sm">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant mb-3 md:mb-4 opacity-70">{t('Primary Discipline', 'Discipline Principale')}</p>
                      <p className="text-sm md:text-base font-black tracking-tighter text-primary-cyan uppercase">Digital Cinematography</p>
                    </div>
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 group hover:border-emerald-400/30 transition-all duration-500 rounded-sm">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant mb-3 md:mb-4 opacity-70">{t('Verification Status', 'Statut de Vérification')}</p>
                      <div className="flex items-center gap-4 md:gap-6">
                        <ShieldCheck className="text-emerald-400" size={32} />
                        <div>
                          <p className="text-sm md:text-base font-black tracking-tighter text-emerald-400 uppercase">KYC_LEVEL_3</p>
                          <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('Expert-Grade Verified', 'Vérifié de Qualité Experte')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Asset Allocation - Premium Pie */}
                <section className="bg-surface-low/30 border border-white/10 p-6 md:p-10 backdrop-blur-2xl rounded-2xl shadow-2xl">
                  <h3 className="text-xl md:text-2xl font-black uppercase mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                    <PieChartIcon className="text-primary-cyan" size={24} /> {t('Asset Mix', 'Mix d\'Actifs')}
                  </h3>
                  <div className="h-64 md:h-72 mb-6 md:mb-10 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">{t('Total', 'Total')}</p>
                        <p className="text-xl md:text-2xl font-black text-white">100%</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Film', value: 55 },
                            { name: 'Music', value: 25 },
                            { name: 'Art', value: 20 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={10}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#00E0FF" className="hover:opacity-80 transition-opacity cursor-pointer" />
                          <Cell fill="#FFD700" className="hover:opacity-80 transition-opacity cursor-pointer" />
                          <Cell fill="#FF00FF" className="hover:opacity-80 transition-opacity cursor-pointer" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { label: 'Film IP', value: '55%', color: 'bg-primary-cyan', desc: 'Cinematic Rights' },
                      { label: 'Music Rights', value: '25%', color: 'bg-accent-gold', desc: 'Audio Licensing' },
                      { label: 'Digital Art', value: '20%', color: 'bg-accent-magenta', desc: 'Visual Assets' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                          <div>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white block">{item.label}</span>
                            <span className="text-[7px] md:text-[8px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{item.desc}</span>
                          </div>
                        </div>
                        <span className="text-xs md:text-sm font-black italic text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Technical Documents - Premium List */}
                <section className="bg-surface-low/30 border border-white/10 p-10 backdrop-blur-2xl rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black uppercase flex items-center gap-4">
                      <FileCode className="text-primary-cyan" size={28} /> {t('IP Documents', 'Documents PI')}
                    </h3>
                    <label className="w-10 h-10 bg-primary-cyan/10 border border-primary-cyan/30 text-primary-cyan flex items-center justify-center hover:bg-primary-cyan hover:text-surface-dim transition-all cursor-pointer group active:scale-90">
                      <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'SYNOPSIS_V2.pdf', size: '2.4 MB', date: '2026-03-15' },
                      { name: 'BUDGET_PLAN.xlsx', size: '1.1 MB', date: '2026-03-20' },
                      { name: 'IP_RIGHTS.pdf', size: '4.8 MB', date: '2026-03-25' },
                    ].map((doc, i) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 flex items-center justify-between hover:border-primary-cyan/40 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-primary-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-primary-cyan group-hover:bg-primary-cyan/10 transition-all">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white truncate max-w-[150px]">{doc.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">{doc.size}</p>
                              <div className="w-1 h-1 rounded-full bg-white/10" />
                              <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">{doc.date}</p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownload(doc.name)}
                          className="p-3 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    );
      case UserRole.INVESTOR:
        return (
          <div className="space-y-12">
            <nav className="flex gap-4 md:gap-12 border-b border-white/5 relative mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 px-1">
              {[
                { id: 'dashboard', label: t('Intelligence Terminal', 'Terminal d\'Intelligence'), icon: <LayoutDashboard size={18} /> },
                { id: 'messages', label: t('Secure Messages', 'Messages Sécurisés'), icon: <MessageSquare size={18} />, badge: messages.filter(m => !m.read).length },
                { id: 'academy', label: t('Pro Education', 'Éducation Pro'), icon: <Play size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3 transition-all relative shrink-0 ${
                    activeTab === tab.id ? 'text-primary-cyan italic' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-accent-magenta text-[8px] text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-tab-profile"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </nav>

            {activeTab === 'messages' && renderMessagesContent()}
            {activeTab === 'academy' && renderAcademyContent()}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 md:space-y-16">
                {/* Scan Opportunity CTA */}
            <section className="relative overflow-hidden rounded-3xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-magenta/20 via-accent-purple/20 to-primary-cyan/20 opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="relative bg-surface-low/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-2 py-1 bg-accent-magenta/20 border border-accent-magenta/30 rounded text-[8px] font-black text-accent-magenta uppercase tracking-widest">Intelligence</div>
                    <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter text-white uppercase italic">
                      {t('Scan Opportunity', 'Scanner Opportunité')}
                    </h2>
                  </div>
                  <p className="text-sm md:text-lg text-on-surface-variant font-medium max-w-xl mb-6">
                    {t('Intelligence Discovery Terminal: Identify high-potential creative assets before they reach expert grade. Use our proprietary filters to find the next creative unicorn.', 'Terminal de Découverte d\'Intelligence : Identifiez les actifs créatifs à haut potentiel avant qu\'ils n\'atteignent le grade expert. Utilisez nos filtres propriétaires pour trouver la prochaine licorne créative.')}
                  </p>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-8 py-4 bg-accent-magenta text-white font-black uppercase tracking-widest hover:bg-white hover:text-accent-magenta transition-all shadow-2xl shadow-accent-magenta/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Radar size={18} />}
                    {isScanning ? t('SCANNING...', 'SCAN EN COURS...') : t('Launch Intelligence Scan', 'Lancer le Scan d\'Intelligence')}
                  </button>
                </div>
                <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent-magenta/10 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-48 h-48 md:w-64 md:h-64 border-2 border-accent-magenta/30 rounded-full flex items-center justify-center">
                    <div className="w-full h-full border border-accent-magenta/20 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radar size={80} className="text-accent-magenta animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Investor Header - Premium Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('Portfolio Value', 'Valeur Portefeuille')} 
          value="$142,500" 
          icon={<Wallet size={20} />} 
          trend="+$12.4K this week" 
          color="emerald" 
          subValue="EXPERT GRADE"
        />
        <StatCard 
          title={t('Total Yield', 'Rendement Total')} 
          value="+24.8%" 
          icon={<TrendingUp size={20} />} 
          trend="Outperforming Market" 
          color="cyan" 
          subValue="LYA GLOBAL AGGREGATE"
        />
        <StatCard 
          title={t('Active Positions', 'Positions Actives')} 
          value="18" 
          icon={<Layers size={20} />} 
          trend="Diversified" 
          color="gold" 
          subValue="VERIFIED CONTRACTS"
        />
        <StatCard 
          title={t('Market Rank', 'Rang Marché')} 
          value="#42" 
          icon={<Award size={20} />} 
          trend="Top 1% Elite" 
          color="purple" 
          subValue="GLOBAL INVESTOR NETWORK"
        />
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
              <div className="lg:col-span-8 space-y-8 md:space-y-12 lg:space-y-16">
                {/* Portfolio Performance - Premium Chart */}
                <section className="bg-surface-low border border-white/5 p-5 md:p-8 lg:p-12 backdrop-blur-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 lg:mb-12 gap-4 md:gap-6">
                    <div>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <TrendingUp className="text-primary-cyan" size={28} /> {t('Portfolio Growth', 'Croissance du Portefeuille')}
                      </h3>
                      <p className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Expert-grade performance tracking', 'Suivi de performance de qualité experte')}</p>
                    </div>
                    <div className="flex gap-6 md:gap-12">
                      <div className="text-right">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-on-surface-variant opacity-50 mb-1">{t('24h Change', 'Changement 24h')}</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-emerald-400">+$1,240.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-60 md:h-[400px] lg:h-[450px] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-cyan/[0.02] to-transparent pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Jan', value: 45000 },
                        { name: 'Feb', value: 52000 },
                        { name: 'Mar', value: 48000 },
                        { name: 'Apr', value: 61000 },
                        { name: 'May', value: 59000 },
                        { name: 'Jun', value: 72000 },
                      ]}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff10" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <YAxis 
                          stroke="#ffffff10" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => `$${v/1000}k`}
                          tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0A0A0A', 
                            border: '1px solid #ffffff10', 
                            fontSize: '11px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                          }}
                          formatter={(v) => [`$${v?.toLocaleString() || '0'}`, 'Portfolio Value']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#00E0FF" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Allocation & Activity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Asset Allocation - Premium Pie */}
                  <section className="bg-surface-low border border-white/5 p-6 md:p-10 backdrop-blur-2xl">
                    <h3 className="text-lg md:text-2xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4">
                      <PieChartIcon className="text-primary-cyan" size={28} /> {t('Asset Allocation', 'Allocation d\'Actifs')}
                    </h3>
                    <div className="h-60 md:h-72 mb-8 md:mb-10 relative">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-on-surface-variant opacity-40">{t('Diversity', 'Diversité')}</p>
                          <p className="text-lg md:text-2xl font-black text-white">High</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Digital Art', value: 35 },
                              { name: 'Music Rights', value: 25 },
                              { name: 'Film Equity', value: 25 },
                              { name: 'Fashion', value: 15 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#00E0FF" className="hover:opacity-80 transition-opacity cursor-pointer" />
                            <Cell fill="#FFD700" className="hover:opacity-80 transition-opacity cursor-pointer" />
                            <Cell fill="#FF00FF" className="hover:opacity-80 transition-opacity cursor-pointer" />
                            <Cell fill="#00FF00" className="hover:opacity-80 transition-opacity cursor-pointer" />
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { label: 'Digital Art', value: '35%', color: 'bg-primary-cyan' },
                        { label: 'Music Rights', value: '25%', color: 'bg-accent-gold' },
                        { label: 'Film Equity', value: '25%', color: 'bg-accent-magenta' },
                        { label: 'Fashion', value: '15%', color: 'bg-emerald-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
                          </div>
                          <span className="text-xs md:text-sm font-black italic text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Recent Activity - Premium List */}
                  <section className="bg-surface-low border border-white/5 p-6 md:p-10 backdrop-blur-2xl">
                    <h3 className="text-lg md:text-2xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4">
                      <History className="text-primary-cyan" size={28} /> {t('Recent Orders', 'Commandes Récentes')}
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { id: 'ORD-9921', project: 'CYBERPUNK_DREAMS', type: 'BUY', amount: '1,200 LYA', status: 'COMPLETED', date: '2026-04-03' },
                        { id: 'ORD-9918', project: 'NEON_SOUL_EP', type: 'SELL', amount: '450 LYA', status: 'COMPLETED', date: '2026-04-03' },
                        { id: 'ORD-9915', project: 'VIRTUAL_VOGUE', type: 'BUY', amount: '2,800 LYA', status: 'PENDING', date: '2026-04-02' },
                        { id: 'ORD-9912', project: 'DIGITAL_HORIZON', type: 'BUY', amount: '5,000 LYA', status: 'COMPLETED', date: '2026-04-01' },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-surface-low/30 backdrop-blur-2xl border border-white/10 hover:border-primary-cyan/40 transition-all group relative overflow-hidden rounded-2xl shadow-xl">
                          <div className="absolute top-0 left-0 w-[2px] h-full bg-primary-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-3 md:gap-5">
                            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black text-[8px] md:text-[10px] rounded-lg ${order.type === 'BUY' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'}`}>
                              {order.type}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest group-hover:text-primary-cyan transition-colors truncate max-w-[100px] md:max-w-[140px]">{order.project}</p>
                              <div className="flex items-center gap-2 md:gap-3 mt-1">
                                <p className="text-[7px] md:text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">{order.id}</p>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <p className="text-[7px] md:text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">{order.date}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs md:text-sm font-black tracking-tighter text-white">{order.amount}</p>
                            <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'text-emerald-400' : 'text-accent-gold animate-pulse'}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8 md:space-y-16">
                {/* Scan Opportunity CTA */}
                <section className="bg-gradient-to-br from-primary-cyan/20 to-accent-gold/20 border border-primary-cyan/30 p-8 rounded-2xl relative overflow-hidden group shadow-2xl">
                  <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Zap size={200} className="text-primary-cyan" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-primary-cyan/20 border border-primary-cyan/30 text-primary-cyan text-[8px] font-black uppercase tracking-widest">
                        {t('PREMIUM SERVICE', 'SERVICE PREMIUM')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight text-white flex items-center gap-3">
                      <Zap className="text-primary-cyan" size={28} /> {t('Scan Opportunity', 'Scanner Opportunité')}
                    </h3>
                    <p className="text-sm text-on-surface-variant italic mb-8 max-w-md opacity-80 leading-relaxed">
                      {t('Our AI-driven engine identifies high-potential creative assets before they hit the secondary market. Get early access to elite contracts and private funding rounds.', 'Notre moteur piloté par l\'IA identifie les actifs créatifs à haut potentiel avant qu\'ils n\'atteignent le marché secondaire. Obtenez un accès anticipé aux contrats d\'élite et aux tours de financement privés.')}
                    </p>
                    <button 
                      onClick={handleScan}
                      disabled={isScanning}
                      className="px-10 py-5 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.2em] text-[11px] hover:bg-white hover:text-primary-cyan transition-all active:scale-95 shadow-[0_15px_30px_rgba(34,211,238,0.2)] disabled:opacity-50 flex items-center gap-3"
                    >
                      {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                      {isScanning ? t('SCANNING...', 'SCAN EN COURS...') : t('START SCAN', 'LANCER LE SCAN')}
                    </button>

                    {scanResults && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 space-y-3"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-cyan mb-4">{t('AI IDENTIFIED OPPORTUNITIES', 'OPPORTUNITÉS IDENTIFIÉES PAR L\'IA')}</p>
                        {scanResults.map((res, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center group hover:border-primary-cyan/30 transition-all">
                            <div>
                              <p className="text-xs font-black text-white uppercase italic">{res.name}</p>
                              <p className="text-[8px] text-on-surface-variant uppercase font-bold opacity-60">{res.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-400 italic">{res.potential}</p>
                              <p className="text-[8px] text-emerald-400/60 uppercase font-bold">{res.growth}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Investor Profile Summary - Premium Card */}
                <section className="bg-surface-low/30 border border-white/10 p-6 md:p-10 backdrop-blur-2xl relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-[0.03]">
                    <Activity size={120} className="text-primary-cyan" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4 relative z-10">
                    <Activity className="text-primary-cyan" size={28} /> {t('Investor Profile', 'Profil Investisseur')}
                  </h3>
                  <div className="space-y-6 md:space-y-8 relative z-10">
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 group hover:border-accent-magenta/30 transition-all duration-500 rounded-sm">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant mb-3 md:mb-4 opacity-70">{t('Risk Tolerance', 'Tolérance au Risque')}</p>
                      <p className="text-xl md:text-3xl font-black italic tracking-tighter text-accent-magenta uppercase">Aggressive_Growth</p>
                    </div>
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 group hover:border-primary-cyan/30 transition-all duration-500 rounded-sm">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant mb-3 md:mb-4 opacity-70">{t('Preferred Sectors', 'Secteurs Préférés')}</p>
                      <p className="text-lg md:text-xl font-black italic tracking-tighter text-primary-cyan uppercase">Digital Art, Film IP, Fashion</p>
                    </div>
                    <div className="p-6 md:p-8 bg-white/5 border border-white/10 group hover:border-accent-gold/30 transition-all duration-500 rounded-sm">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-on-surface-variant mb-3 md:mb-4 opacity-70">{t('Investor Tier', 'Niveau Investisseur')}</p>
                      <div className="flex items-center gap-4 md:gap-6">
                        <Award className="text-accent-gold" size={32} />
                        <div>
                          <p className="text-xl md:text-3xl font-black italic tracking-tighter text-accent-gold uppercase">Gold_Member</p>
                          <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">{t('Priority Access Enabled', 'Accès Prioritaire Activé')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Market Access - Premium Actions */}
                <section className="bg-surface-low border border-white/5 p-6 md:p-10 backdrop-blur-2xl">
                  <h3 className="text-lg md:text-2xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4">
                    <ShieldCheck className="text-accent-gold" size={28} /> {t('Market Access', 'Accès Marché')}
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <button 
                      onClick={() => handlePremiumFeature('Exchange Terminal')}
                      className="w-full py-4 md:py-5 bg-primary-cyan text-surface-dim text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,224,255,0.15)] active:scale-95"
                    >
                      {t('Exchange Terminal', 'Terminal d\'Échange')}
                    </button>
                    <button 
                      onClick={() => handlePremiumFeature('Institutional Node')}
                      className="w-full py-4 md:py-5 border border-white/10 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white/5 transition-all active:scale-95"
                    >
                      {t('Institutional Node', 'Nœud Institutionnel')}
                    </button>
                    <button 
                      onClick={() => handlePremiumFeature('Premium Insights')}
                      className="w-full py-4 md:py-5 border border-accent-gold/30 text-accent-gold text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-accent-gold hover:text-surface-dim transition-all active:scale-95"
                    >
                      {t('Premium Insights', 'Analyses Premium')}
                    </button>
                  </div>
                </section>

                {/* Impact Metrics - Premium Progress */}
                <section className="bg-surface-low border border-white/5 p-6 md:p-10 backdrop-blur-2xl">
                  <h3 className="text-lg md:text-2xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4">
                    <Zap className="text-primary-cyan" size={28} /> {t('Impact Metrics', 'Métriques d\'Impact')}
                  </h3>
                  <div className="space-y-8 md:space-y-10">
                    <div>
                      <div className="flex justify-between items-end mb-3 md:mb-4">
                        <div>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white block">{t('Creative Support', 'Support Créatif')}</span>
                          <span className="text-[7px] md:text-[8px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Direct funding to creators', 'Financement direct aux créateurs')}</span>
                        </div>
                        <span className="text-base md:text-lg font-black italic text-primary-cyan">84%</span>
                      </div>
                      <div className="h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '84%' }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-3 md:mb-4">
                        <div>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white block">{t('Innovation Index', 'Indice d\'Innovation')}</span>
                          <span className="text-[7px] md:text-[8px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Early-stage project backing', 'Soutien aux projets en phase initiale')}</span>
                        </div>
                        <span className="text-base md:text-lg font-black italic text-accent-gold">92%</span>
                      </div>
                      <div className="h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                          className="h-full bg-accent-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  case UserRole.PROFESSIONAL: {
    const chartData = [
      { name: 'Audit Accuracy', impact: 98 },
      { name: 'Response Time', impact: 85 },
      { name: 'Registry Uptime', impact: 99 },
      { name: 'Validation Speed', impact: 92 },
      { name: 'Network Load', impact: 75 },
    ];
    const professionalTabs = [
      { id: 'dashboard', label: t('Dashboard', 'Tableau de Bord'), icon: LayoutDashboard },
      { id: 'mentorship', label: t('Elite Mentorship', 'Mentorat d\'Élite'), icon: Award },
      { id: 'messages', label: t('Messages', 'Messages'), icon: Mail },
      { id: 'academy', label: t('Academy', 'Académie'), icon: Zap },
    ];
    
    // Check for professionalTabs usage
    const tabsToUse = user.role === UserRole.PROFESSIONAL ? professionalTabs : [
      { id: 'dashboard', label: t('Dashboard', 'Tableau de Bord'), icon: LayoutDashboard },
      { id: 'messages', label: t('Messages', 'Messages'), icon: Mail },
      { id: 'academy', label: t('Academy', 'Académie'), icon: Zap },
    ];

    return (
      <div className="space-y-12">
        {/* Profile Tabs */}
        <div className="flex border-b border-white/5 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 px-1">
          {tabsToUse.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 md:px-8 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all flex items-center gap-2 md:gap-3 shrink-0 ${
                activeTab === tab.id ? 'text-primary-cyan italic' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
              }`}
            >
              <tab.icon size={16} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabProfile"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'mentorship' && renderMentorshipContent()}
          {activeTab === 'messages' && renderMessagesContent()}
          {activeTab === 'academy' && renderAcademyContent()}
          {activeTab === 'dashboard' && (
            <div className="space-y-16">
              <section className="relative h-60 md:h-80 rounded-3xl overflow-hidden mb-12 group">
                <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" 
                  alt="Talent Search" 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/80 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="px-3 py-1 bg-accent-magenta/20 border border-accent-magenta/40 text-accent-magenta text-[10px] font-black uppercase tracking-widest rounded-full">
                    {t('ELITE ACCESS', 'ACCÈS ÉLITE')}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">1,420 {t('CREATORS ONLINE', 'CRÉATEURS EN LIGNE')}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-6 leading-[0.9]">
                  {t('FIND', 'TROUVER')} <br />
                  <span className="text-accent-magenta">{t('TALENT', 'DES TALENTS')}</span>
                </h2>
                <button 
                  onClick={handleFindTalent}
                  className="w-fit px-12 py-5 bg-accent-magenta text-white font-black uppercase italic tracking-[0.3em] text-[12px] hover:bg-white hover:text-accent-magenta transition-all active:scale-95 shadow-[0_20px_40px_rgba(236,72,153,0.3)]"
                >
                  {t('LAUNCH SEARCH ENGINE', 'LANCER LE MOTEUR DE RECHERCHE')}
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: t('Global Volume', 'Volume Global'), value: '1.2M LYA', icon: TrendingUp, color: 'text-primary-cyan', trend: 'Institutional Flow' },
                { label: t('Active Registries', 'Registres Actifs'), value: '842', icon: Cpu, color: 'text-accent-gold', trend: 'Network Integrity' },
                { label: t('Avg. Yield', 'Rendement Moy.'), value: '12.4%', icon: Activity, color: 'text-emerald-400', trend: 'Optimized Performance' },
                { label: t('Validation Accuracy', 'Précision de Validation'), value: '99.8%', icon: ShieldCheck, color: 'text-accent-magenta', trend: 'Registry Verified' },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-low/30 border border-white/10 p-5 md:p-6 backdrop-blur-2xl relative overflow-hidden group hover:border-primary-cyan/30 transition-all duration-500 rounded-2xl shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 group-hover:scale-110 transform">
                    <stat.icon size={60} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2 opacity-60">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-xl md:text-2xl font-black italic tracking-tight text-white">{stat.value}</p>
                      <stat.icon size={14} className={`${stat.color} opacity-80`} />
                    </div>
                    <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-on-surface-variant/40">{stat.trend}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 space-y-8 md:space-y-12">
                {/* Graphical Statistics - New for Professional */}
                <section className="bg-surface-low/30 border border-white/10 p-6 md:p-10 backdrop-blur-2xl relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight flex items-center gap-3 mb-1">
                        <Activity className="text-primary-cyan" size={24} /> {t('NETWORK INTEGRITY', 'INTÉGRITÉ DU RÉSEAU')}
                      </h3>
                      <p className="text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Real-time validation and registry performance', 'Validation en temps réel et performance des registres')}</p>
                    </div>
                  </div>
                  <div className="h-[250px] md:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '0px' }}
                          itemStyle={{ color: '#00E0FF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        />
                        <Bar dataKey="impact" fill="#00E0FF" radius={[2, 2, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00E0FF' : '#FFD700'} opacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                {/* Exclusive Market Intelligence - Premium List */}
                <section className="bg-surface-low border border-white/5 p-5 md:p-8 lg:p-12 backdrop-blur-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 lg:mb-12 gap-4 md:gap-6 relative z-10">
                    <div>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <TrendingUp className="text-primary-cyan" size={28} /> {t('Market Intelligence', 'Intelligence Marché')}
                      </h3>
                      <p className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Real-time institutional asset tracking', 'Suivi institutionnel des actifs en temps réel')}</p>
                    </div>
                    <div className="px-3 md:px-6 py-1.5 md:py-3 bg-primary-cyan/10 border border-primary-cyan/30 text-primary-cyan text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] animate-pulse shadow-[0_0_20px_rgba(0,224,255,0.1)]">
                      {t('LIVE TERMINAL DATA', 'DONNÉES TERMINAL EN DIRECT')}
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6 relative z-10">
                    {CONTRACTS.slice(0, 4).map((project, i) => (
                      <div key={i} className="p-4 md:p-6 lg:p-8 bg-surface-low/30 backdrop-blur-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between hover:border-primary-cyan/40 transition-all group/item relative overflow-hidden gap-4 md:gap-6 shadow-2xl rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-primary-cyan opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-10 w-full sm:w-auto">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-surface-dim border border-white/10 overflow-hidden relative group-hover/item:border-primary-cyan/30 transition-colors shrink-0 rounded-xl">
                            <img src={project.image} alt={project.name} className="w-full h-full object-cover opacity-40 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-lg md:text-2xl font-black uppercase italic tracking-tight group-hover/item:text-primary-cyan transition-colors mb-1 md:mb-2">{project.name}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 md:gap-4">
                      <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/5 text-[7px] md:text-[9px] font-black uppercase tracking-widest text-on-surface-variant border border-white/5 rounded-md">{project.category}</span>
                      <span className="text-[7px] md:text-[9px] text-on-surface-variant/40 uppercase tracking-widest font-bold">{project.assetStatus}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto">
                  <div className="mb-3 md:mb-4">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-1">{t('Growth', 'Croissance')}</p>
                    <p className="text-xl md:text-2xl font-black text-primary-cyan italic tracking-tight">{(project.growth > 0 ? '+' : '') + project.growth}%</p>
                  </div>
                          <button 
                            onClick={() => handlePremiumFeature('Contact Creator')}
                            className="w-full sm:w-auto px-5 md:px-8 py-2 md:py-3 bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-on-surface-variant hover:text-white hover:border-white/30 flex items-center justify-center gap-2 md:gap-4 transition-all active:scale-95 rounded-xl"
                          >
                            {t('Contact Creator', 'Contacter le Créateur')} <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Yield Optimization & Staking - Premium Interactive */}
                <section className="bg-surface-low/30 border border-emerald-400/10 p-5 md:p-8 lg:p-12 backdrop-blur-2xl relative overflow-hidden group shadow-2xl rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/[0.02] to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
                    <Zap size={100} className="text-emerald-400" />
                  </div>
                  <div className="flex justify-between items-center mb-6 md:mb-10 lg:mb-12 relative z-10">
                    <div>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <Zap className="text-emerald-400" size={28} /> {t('Yield Optimization', 'Optimisation du Rendement')}
                      </h3>
                      <p className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Advanced liquidity and valuation protocols', 'Protocoles avancés de liquidité et de valorisation')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 relative z-10">
                    <div className="p-5 md:p-8 lg:p-10 bg-emerald-400/5 border border-emerald-400/10 group/card hover:border-emerald-400/30 transition-all duration-500">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                          <Activity size={20} className="text-emerald-400" />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-emerald-400">{t('Dynamic LYA Score', 'Score LYA Dynamique')}</span>
                      </div>
                      <p className="text-[10px] md:text-sm text-on-surface-variant italic mb-6 md:mb-10 leading-relaxed opacity-70">
                        {t('Real-time data indexing for predictive equity valuation based on market velocity and institutional demand.', 'Indexation des données en temps réel pour une valorisation prédictive de l\'equity basée sur la vélocité du marché et la demande institutionnelle.')}
                      </p>
                      <div className="flex items-baseline gap-3 md:gap-4">
                        <span className="text-2xl md:text-4xl font-black italic tracking-tight text-white">842.5</span>
                        <div className="flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-emerald-400/10 border border-emerald-400/20">
                          <TrendingUp size={10} className="text-emerald-400" />
                          <span className="text-[8px] md:text-[10px] text-emerald-400 font-black uppercase tracking-widest">+2.4% LIVE</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 md:p-8 lg:p-10 bg-primary-cyan/5 border border-primary-cyan/10 group/card hover:border-primary-cyan/30 transition-all duration-500">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-primary-cyan/10 flex items-center justify-center border border-primary-cyan/20">
                          <Layers size={20} className="text-primary-cyan" />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-primary-cyan">{t('Staking Protocol', 'Protocole de Staking')}</span>
                      </div>
                      <p className="text-[10px] md:text-sm text-on-surface-variant italic mb-6 md:mb-10 leading-relaxed opacity-70">
                        {t('Stake LYA Units to stabilize creative volatility, secure registry verification, and earn institutional-grade rewards.', 'Staker des Unités LYA pour stabiliser la volatilité créative, sécuriser la vérification du registre et gagner des récompenses de qualité institutionnelle.')}
                      </p>
                      <button 
                        onClick={() => handlePremiumFeature('Staking Management')}
                        className="w-full py-3.5 md:py-5 bg-primary-cyan/10 border border-primary-cyan/30 text-primary-cyan text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.3em] hover:bg-primary-cyan hover:text-surface-dim transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,224,255,0.1)]"
                      >
                        {t('Manage Staking', 'Gérer le Staking')}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Validation Queue - Premium Locked State */}
                <section className="bg-surface-low/30 border border-white/10 p-5 md:p-8 lg:p-12 backdrop-blur-2xl relative overflow-hidden group min-h-[300px] md:min-h-[400px] rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center mb-6 md:mb-10 lg:mb-12">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-primary-cyan/20 border border-primary-cyan/30 text-primary-cyan text-[8px] font-black uppercase tracking-widest">
                          {t('PREMIUM SERVICE', 'SERVICE PREMIUM')}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight flex items-center gap-3 md:gap-4 mb-2">
                        <Shield className="text-primary-cyan" size={28} /> {t('Validation Queue', 'File de Validation')}
                      </h3>
                      <p className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-40">{t('Institutional asset verification pipeline', 'Pipeline de vérification institutionnelle des actifs')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6 relative z-10">
                    {[
                      { name: 'NEON DISTRICT #4', type: 'COMPLIANCE', deadline: '24h', fee: '450 LYA', date: '2026-04-03' },
                      { name: 'CYBER_PUNK_IP', type: 'LEGAL', deadline: '48h', fee: '800 LYA', date: '2026-04-04' },
                      { name: 'METAVERSE_ESTATE', type: 'VALUATION', deadline: '12h', fee: '1,200 LYA', date: '2026-04-03' }
                    ].map((audit, i) => (
                      <div key={i} className="p-6 md:p-8 lg:p-10 bg-surface-low/30 backdrop-blur-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-center group/audit hover:bg-white/10 transition-all gap-6 rounded-2xl shadow-2xl">
                        <div className="text-center sm:text-left">
                          <div className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tight mb-2 md:mb-3">{audit.name}</div>
                          <div className="flex justify-center sm:justify-start gap-3 md:gap-5 text-[9px] md:text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-70">
                            <span className="text-primary-cyan">{audit.type}</span>
                            <span className="opacity-30">•</span>
                            <span>{audit.date}</span>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-black text-2xl md:text-4xl italic tracking-tighter">{audit.fee}</div>
                      </div>
                    ))}
                  </div>

                  <LockedOverlay 
                    title={t('Institutional Validation Required', 'Validation Institutionnelle Requise')}
                    description={t('The validation queue contains sensitive institutional data. Access is strictly reserved for verified professionals.', 'La file de validation contient des données institutionnelles sensibles. L\'accès est strictement réservé aux professionnels vérifiés.')}
                  />
                </section>
              </div>

              <div className="lg:col-span-4 space-y-8 md:space-y-12 lg:space-y-16">
                {/* Find Talent CTA */}
                <section className="bg-surface-dim border border-white/10 p-8 rounded-2xl relative overflow-hidden group shadow-2xl mb-12">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img 
                      src="https://picsum.photos/seed/institutional-banner/1200/400?blur=2" 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-magenta/20 via-surface-dim/80 to-surface-dim opacity-90" />
                  <div className="absolute -right-10 -top-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Search size={200} className="text-accent-magenta" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-accent-magenta/20 border border-accent-magenta/30 text-accent-magenta text-[8px] font-black uppercase tracking-widest">
                        {t('PREMIUM SERVICE', 'SERVICE PREMIUM')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight text-white flex items-center gap-3">
                      <Search className="text-accent-magenta" size={28} /> {t('Find Talent', 'Trouver des Talents')}
                    </h3>
                    <p className="text-sm text-on-surface-variant italic mb-8 max-w-md opacity-80 leading-relaxed">
                      {t('Access our exclusive database of verified creators. Filter by LYA score, rarity, and market potential. Direct contact is reserved for institutional members.', 'Accédez à notre base de données exclusive de créateurs vérifiés. Filtrez par score LYA, rareté et potentiel de marché. Le contact direct est réservé aux membres institutionnels.')}
                    </p>
                    <button 
                      onClick={handleFindTalent}
                      disabled={isFindingTalent}
                      className="px-10 py-5 bg-accent-magenta text-white font-black uppercase italic tracking-[0.2em] text-[11px] hover:bg-white hover:text-accent-magenta transition-all active:scale-95 shadow-[0_15px_30px_rgba(236,72,153,0.2)] disabled:opacity-50 flex items-center gap-3"
                    >
                      {isFindingTalent ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                      {isFindingTalent ? t('SEARCHING...', 'RECHERCHE...') : t('SCAN ECOSYSTEM', 'SCANNER L\'ÉCOSYSTÈME')}
                    </button>

                    {talentResults && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 space-y-3"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-magenta mb-4">{t('TOP MATCHING TALENTS', 'MEILLEURS TALENTS CORRESPONDANTS')}</p>
                        {talentResults.map((res, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center group hover:border-accent-magenta/30 transition-all">
                            <div>
                              <p className="text-xs font-black text-white uppercase italic">{res.id}</p>
                              <p className="text-[8px] text-on-surface-variant uppercase font-bold opacity-60">{res.specialty}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-primary-cyan italic">LYA {res.score}</p>
                              <p className="text-[8px] text-on-surface-variant uppercase font-bold opacity-40">{res.availability}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Elite Invitation System - Premium Card */}
                <section className="bg-surface-low/30 border border-accent-gold/20 p-5 md:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden group rounded-2xl shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                    <UserPlus size={100} className="text-accent-gold" />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 relative z-10">
                    <UserPlus className="text-accent-gold" size={24} /> {t('Elite Invitation', 'Invitation Élite')}
                  </h3>
                  <div className="space-y-6 md:space-y-8 relative z-10">
                    <p className="text-[10px] md:text-sm text-on-surface-variant italic leading-relaxed opacity-70">
                      {t('As a Professional member, you hold 1 exclusive invitation. Invite a high-level peer to join the LinkYourArt institutional creative network.', 'En tant que membre Professionnel, vous détenez 1 invitation exclusive. Invitez un pair de haut niveau à rejoindre le réseau créatif institutionnel LinkYourArt.')}
                    </p>
                    <div className="p-5 md:p-8 bg-accent-gold/5 border border-accent-gold/20 relative overflow-hidden group/invite">
                      <div className="flex justify-between items-center mb-4 md:mb-6">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-accent-gold">{t('Available Invitations', 'Invitations Disponibles')}</span>
                        <span className="text-lg md:text-2xl font-black italic text-white">1 / 1</span>
                      </div>
                      <div className="space-y-4">
                        <div className="relative">
                          <input 
                            type="email" 
                            placeholder={t('Enter professional email...', 'Entrer l\'email professionnel...')}
                            className="w-full bg-surface-dim border border-white/10 px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-xs font-bold uppercase tracking-widest focus:border-accent-gold/50 transition-all outline-none text-white placeholder:text-white/20"
                          />
                        </div>
                        <button className="w-full py-3.5 md:py-5 bg-accent-gold text-surface-dim font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-[9px] md:text-[11px] hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(245,158,11,0.2)]">
                          {t('Send Invitation', 'Envoyer l\'Invitation')}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Pro Toolkit - Premium Tools */}
                <section className="bg-surface-low border border-white/5 p-5 md:p-8 lg:p-10 backdrop-blur-2xl">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                    <Cpu className="text-primary-cyan" size={24} /> {t('Pro Toolkit', 'Boîte à Outils Pro')}
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { title: t('AI Valuation', 'Évaluation IA'), desc: t('Institutional Grade Analysis', 'Analyse de Qualité Institutionnelle'), icon: BarChart3 },
                      { title: t('Smart Contract Gen', 'Générateur de Contrats'), desc: t('Automated Legal Framework', 'Cadre Juridique Automatisé'), icon: FileCode },
                      { title: t('Compliance Center', 'Centre de Conformité'), desc: t('Direct Blockchain Integration', 'Intégration Blockchain Directe'), icon: Globe },
                    ].map((tool, i) => (
                      <button 
                        key={i} 
                        onClick={() => handlePremiumFeature(tool.title)}
                        className="w-full p-4 md:p-6 lg:p-8 bg-white/5 border border-white/10 flex items-center gap-4 md:gap-8 hover:bg-primary-cyan/10 hover:border-primary-cyan/40 transition-all text-left group active:scale-[0.98]"
                      >
                        <div className="p-3 md:p-5 bg-primary-cyan/10 text-primary-cyan group-hover:bg-primary-cyan group-hover:text-surface-dim transition-all duration-500">
                          <tool.icon size={28} />
                        </div>
                        <div>
                          <p className="text-xs md:text-base font-black uppercase tracking-widest text-white">{tool.title}</p>
                          <p className="text-[8px] md:text-[10px] text-on-surface-variant italic mt-1 font-bold opacity-60">{tool.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Pro Community - Premium Network */}
                <section className="bg-gradient-to-br from-primary-cyan/10 to-accent-gold/10 border border-white/10 p-5 md:p-8 lg:p-10 backdrop-blur-2xl relative overflow-hidden group rounded-2xl shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700">
                    <Globe size={100} className="text-primary-cyan" />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 relative z-10">
                    <Globe className="text-primary-cyan" size={28} /> {t('Pro Community & Lounge', 'Communauté Pro & Salon')}
                  </h3>
                  <div className="flex items-center gap-4 md:gap-10 mb-6 md:mb-12 relative z-10">
                    <div className="flex -space-x-2 md:-space-x-5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-8 h-8 md:w-14 md:h-14 rounded-full border-2 md:border-4 border-surface-dim overflow-hidden shadow-2xl hover:scale-110 hover:z-10 transition-all cursor-pointer relative group/avatar">
                          <img src={`https://picsum.photos/seed/pro-user-${i}/100/100`} alt="Pro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-primary-cyan/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs md:text-base font-black uppercase italic tracking-tight text-white">{t('Exclusive Network', 'Réseau Exclusif')}</p>
                      <p className="text-[8px] md:text-[11px] text-primary-cyan uppercase tracking-widest font-black">142 {t('Online', 'En Ligne')}</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-8 bg-black/40 border border-white/5 relative z-10 mb-6 md:mb-10 group/chat">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="text-[8px] md:text-[11px] font-black uppercase tracking-widest text-emerald-400">{t('Live Global Discussion', 'Discussion Globale en Direct')}</span>
                    </div>
                    <p className="text-[10px] md:text-sm italic text-on-surface-variant leading-relaxed opacity-80 mb-4">
                      {t('The Pro Lounge is your gateway to institutional deal flow and regulatory intelligence. Discuss MiCA, creative equity, and strategic partnerships with verified peers.', 'Le Salon Pro est votre porte d\'entrée vers le deal flow institutionnel et l\'intelligence réglementaire. Discutez de MiCA, de l\'equity créative et des partenariats stratégiques avec des pairs vérifiés.')}
                    </p>
                    <p className="text-[10px] md:text-sm italic text-on-surface-variant leading-relaxed opacity-80">
                      "Join the private discussion on the latest MiCA regulatory updates and their impact on creative asset indexing and secondary market liquidity."
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePremiumFeature('Lounge Access')}
                    className="w-full py-3.5 md:py-6 bg-white/5 border border-white/10 text-[9px] md:text-[12px] font-black uppercase tracking-[0.15em] md:tracking-[0.4em] hover:bg-primary-cyan hover:text-surface-dim hover:border-primary-cyan transition-all relative z-10 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                  >
                    {t('Enter Lounge', 'Entrer dans le Salon')}
                  </button>
                </section>

                {/* Impact Metrics - Premium Stats */}
                <section className="bg-surface-low/30 border border-white/10 p-5 md:p-8 lg:p-10 backdrop-blur-2xl rounded-2xl shadow-2xl">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                    <Activity className="text-primary-cyan" size={28} /> {t('Impact Metrics', 'Métriques d\'Impact')}
                  </h3>
                  <div className="space-y-4 md:space-y-8">
                    <div className="p-4 md:p-8 bg-primary-cyan/5 border border-primary-cyan/20 relative overflow-hidden group hover:border-primary-cyan/40 transition-all duration-500">
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-primary-cyan">{t('B2B Registry Status', 'Statut du Registre B2B')}</p>
                        <span className="flex h-2 w-2 md:h-3 md:w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                      </div>
                      <p className="text-lg md:text-2xl font-black italic uppercase tracking-tight text-white">{t('Active & Synchronized', 'Actif et Synchronisé')}</p>
                    </div>
                    <div className="p-4 md:p-8 bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-on-surface-variant mb-1 md:mb-3 opacity-50">{t('Projects Judged', 'Projets Jugés')}</p>
                      <p className="text-2xl md:text-4xl font-black italic tracking-tight text-white">142</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-12 pt-16">
      {/* Premium Profile Header */}
      <header className="relative bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-48 md:h-80 relative overflow-hidden">
          <img 
            src={user.coverUrl || `https://picsum.photos/seed/${user.uid}_cover/1920/1080?blur=2`} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-low via-surface-low/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-cyan via-accent-gold to-accent-magenta opacity-50" />
        </div>
        
        <div className="px-6 md:px-12 pb-10 -mt-20 md:-mt-28 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-cyan via-accent-purple to-accent-gold rounded-2xl blur opacity-40 group-hover/avatar:opacity-100 transition duration-500" />
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-surface-dim shadow-2xl bg-surface-dim">
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
                  alt={user.displayName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('Update Photo', 'Changer Photo')}</span>
                  <input type="file" className="hidden" onChange={handlePhotoUpdate} />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-primary-cyan rounded-lg border-2 border-surface-dim shadow-lg">
                {badge && <badge.icon size={16} className="text-surface-dim" />}
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex flex-col mb-4">
                        <h1 className="text-xl sm:text-2xl md:text-5xl font-black font-headline tracking-tighter text-on-surface leading-[1.1] md:leading-[0.9] uppercase italic flex flex-wrap items-center gap-3 md:gap-4 whitespace-normal break-words">
                          <div className="h-[2px] w-6 md:w-14 bg-primary-cyan hidden sm:block"></div>
                          <span className="max-w-full">REGISTRY_{user.displayName?.toUpperCase().replace(/\s+/g, '_') || 'ANONYMOUS'}</span>
                        </h1>
                        {badge && (
                          <span className={`px-3 py-1 ${badge.bg} ${badge.color} ${badge.border} border text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-70">
                    <span className="flex items-center gap-2"><Mail size={14} className="text-primary-cyan" /> {user.email}</span>
                    <span className="flex items-center gap-2"><Briefcase size={14} className="text-accent-gold" /> {user.role}</span>
                    <span className="flex items-center gap-2"><Globe size={14} className="text-accent-magenta" /> {user.linkedin ? 'Verified Identity' : 'Public Profile'}</span>
                    <div className="flex items-center gap-4 ml-2 border-l border-white/10 pl-4">
                      {user.twitter && (
                        <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-cyan transition-colors">
                          <Twitter size={14} />
                        </a>
                      )}
                      {user.instagram && (
                        <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary-cyan transition-colors">
                          <Instagram size={14} />
                        </a>
                      )}
                      {user.linkedin && (
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-cyan transition-colors">
                          <Linkedin size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-3 rounded-xl border border-white/10 transition-all ${showNotifications ? 'bg-primary-cyan text-surface-dim' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      <Bell size={20} />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-accent-magenta rounded-full border-2 border-surface-dim" />
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-80 bg-surface-low/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                        >
                          <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{t('Notifications', 'Notifications')}</h4>
                            <span className="text-[8px] font-bold text-primary-cyan uppercase tracking-widest">3 {t('New', 'Nouvelles')}</span>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.map((n) => (
                              <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[10px] font-black text-primary-cyan uppercase tracking-tight">{n.title}</p>
                                  <span className="text-[8px] font-bold text-on-surface-variant opacity-40">{n.time}</span>
                                </div>
                                <p className="text-[11px] text-on-surface-variant leading-relaxed group-hover:text-white transition-colors">{n.message}</p>
                              </div>
                            ))}
                          </div>
                          <button className="w-full p-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors bg-white/5">
                            {t('View All Notifications', 'Voir Toutes les Notifications')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-xl"
                      >
                        {t('Cancel', 'Annuler')}
                      </button>
                      <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)] rounded-xl flex items-center gap-2"
                      >
                        <Save size={16} /> {t('Save Changes', 'Enregistrer')}
                      </button>
                    </>
                  ) : (
                    <>
                      {user.role === UserRole.ADMIN && (
                        <button 
                          onClick={() => onViewChange?.('ADMIN_PANEL')}
                          className="px-8 py-3 bg-accent-gold/20 border border-accent-gold/40 text-accent-gold text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold hover:text-surface-dim transition-all rounded-xl flex items-center gap-2 shadow-[0_10px_20px_rgba(255,215,0,0.1)]"
                        >
                          <Shield size={16} /> {t('ADMIN HUB', 'HUB ADMIN')}
                        </button>
                      )}
                      {user.isPro && (
                        <button 
                          onClick={handleManageSubscription}
                          className="px-8 py-3 bg-accent-gold text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] rounded-xl flex items-center gap-2"
                        >
                          <CreditCard size={16} /> {t('Manage Subscription', 'Gérer l\'Abonnement')}
                        </button>
                      )}
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-xl flex items-center gap-2"
                      >
                        <Settings size={16} /> {t('Edit Profile', 'Modifier le Profil')}
                      </button>
                      <button 
                        onClick={onLogout}
                        className="px-6 py-3 bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/20 transition-all rounded-xl flex items-center gap-2"
                      >
                        <LogOut size={16} /> {t('Logout', 'Déconnexion')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
      </header>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl mb-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-cyan/50 to-transparent" />
            <h2 className="text-2xl font-black font-headline uppercase italic tracking-tight mb-10 flex items-center gap-4">
              <Settings className="text-primary-cyan" size={28} /> {t('Account Settings', 'Paramètres du Compte')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('Display Name', 'Nom d\'affichage')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('Email Address', 'Adresse E-mail')}</label>
                  <input 
                    type="email" 
                    className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                  
                  {/* Email Verification Help - CRITICAL for Deliverability issues */}
                  <div className="mt-4 p-4 bg-primary-cyan/5 border border-primary-cyan/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-primary-cyan/10 rounded-lg shrink-0">
                        <ShieldCheck size={14} className="text-primary-cyan" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-primary-cyan uppercase tracking-widest leading-none">
                          {t('Verification Issues?', 'Problèmes de Vérification ?')}
                        </p>
                        <p className="text-[9px] text-on-surface-variant leading-relaxed opacity-70">
                          {t('If you haven\'t received your verification email, please check your Spam folder. To ensure permanent deliverability, whitelist noreply@linkyourart-cb221.firebaseapp.com in your contact list.', 'Si vous n\'avez pas reçu l\'e-mail de vérification, veuillez vérifier vos courriers indésirables. Pour garantir la délivrabilité, ajoutez noreply@linkyourart-cb221.firebaseapp.com à votre liste de contacts.')}
                        </p>
                        <button 
                          type="button"
                          onClick={() => onNotify?.(t('Verification email resent successfully.', 'E-mail de vérification renvoyé avec succès.'))}
                          className="text-[9px] font-black text-primary-cyan uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={10} /> {t('Resend Verification', 'Renvoyer la Vérification')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('Twitter', 'Twitter')}</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl"
                      value={editForm.twitter}
                      onChange={(e) => setEditForm({...editForm, twitter: e.target.value})}
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('Instagram', 'Instagram')}</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({...editForm, instagram: e.target.value})}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('LinkedIn URL', 'URL LinkedIn')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({...editForm, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-3 opacity-50">{t('Bio / Professional Description', 'Bio / Description Professionnelle')}</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-surface-dim/80 border border-white/10 p-4 text-sm font-bold focus:ring-1 focus:ring-primary-cyan focus:border-primary-cyan outline-none transition-all rounded-xl resize-none"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Indexing Terminal - Redesigned */}
      <AnimatePresence mode="wait">
        {isCreatingProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="w-full max-w-4xl bg-surface-low border border-white/10 relative flex flex-col lg:flex-row rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden"
            >
              <button 
                onClick={closeProjectModal}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-primary-cyan transition-colors z-[110] p-2 bg-black/20 rounded-full"
              >
                <X size={24} />
              </button>
              
              {/* Left Panel - Visual Context - Hidden on very small mobile if needed, but better to just make it scroll */}
              <div className="w-full lg:w-1/3 bg-primary-cyan/5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #00E0FF 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-cyan/20 flex items-center justify-center mb-4 sm:mb-6">
                    <Plus className="text-primary-cyan" size={28} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic leading-none tracking-tighter mb-2 sm:mb-4">
                    {t('Index', 'Indexer')} <br />
                    <span className="text-primary-cyan">{t('New Asset', 'Nouvel Actif')}</span>
                  </h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-relaxed">
                    {t('Initialize your creative project on the LYA blockchain. Our AI will audit your IP and generate a valuation score.', 'Initialisez votre projet créatif sur la blockchain LYA. Notre IA auditera votre PI et générera un score de valorisation.')}
                  </p>
                </div>

                <div className="hidden sm:flex relative z-10 pt-6 border-t border-white/10 mt-6 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-400" size={18} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">{t('Secure Indexing', 'Indexation Sécurisée')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="text-accent-gold" size={18} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-accent-gold">{t('AI Audit Ready', 'Prêt pour Audit IA')}</span>
                  </div>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="flex-1 p-5 sm:p-8 md:p-10 bg-surface-low/50 backdrop-blur-md overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
                <form onSubmit={handleCreateProject} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Project Identity', 'Identité du Projet')}</label>
                      <input 
                        type="text" 
                        required
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none"
                        placeholder="e.g. PROJECT_NEON_GENESIS"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Asset Category', 'Catégorie d\'Actif')}</label>
                      <select 
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none appearance-none cursor-pointer"
                      >
                        <option value="Film">Film</option>
                        <option value="TV Series">TV Series</option>
                        <option value="Music">Music</option>
                        <option value="Photography">Photography</option>
                        <option value="Podcast">Podcast</option>
                        <option value="Digital Art">Digital Art</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Performing Arts">Performing Arts (Theatre, Stand-up, Musical Comedy)</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Gastronomy">Gastronomy</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Legal Issuer', 'Émetteur Légal')}</label>
                      <input 
                        type="text" 
                        required
                        value={newProject.issuerDetails}
                        onChange={(e) => setNewProject({ ...newProject, issuerDetails: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none"
                        placeholder="Studio Name or Individual"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Revenue Share (%)', 'Part de Revenus (%)')}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={newProject.revenueShare || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewProject({ ...newProject, revenueShare: isNaN(val) ? 0 : val });
                          }}
                          className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-black">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Initial Valuation ($)', 'Valorisation Initiale ($)')}</label>
                      <input 
                        type="number" 
                        value={newProject.initialValue || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setNewProject({ ...newProject, initialValue: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-accent-gold font-black">{t('Premium Access', 'Accès Premium')}</label>
                      <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
                        <button
                          type="button"
                          onClick={() => setNewProject({ ...newProject, isPremium: !newProject.isPremium })}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${newProject.isPremium ? 'bg-accent-gold' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${newProject.isPremium ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{newProject.isPremium ? t('Enabled', 'Activé') : t('Disabled', 'Désactivé')}</span>
                      </div>
                    </div>

                    {newProject.isPremium && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-[10px] uppercase tracking-[0.2em] text-accent-gold font-black">{t('Premium Price ($)', 'Prix Premium ($)')}</label>
                        <input 
                          type="number" 
                          value={newProject.premiumPrice || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewProject({ ...newProject, premiumPrice: isNaN(val) ? 0 : val });
                          }}
                          className="w-full bg-accent-gold/5 border border-accent-gold/20 text-white p-4 focus:border-accent-gold/50 focus:bg-accent-gold/10 transition-all font-mono text-sm outline-none"
                        />
                      </motion.div>
                    )}
                  </div>

                  {newProject.isPremium && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] uppercase tracking-[0.2em] text-accent-gold font-black">{t('Premium Exclusive Content', 'Contenu Exclusif Premium')}</label>
                      <textarea 
                        value={newProject.premiumContent}
                        onChange={(e) => setNewProject({ ...newProject, premiumContent: e.target.value })}
                        className="w-full bg-accent-gold/5 border border-accent-gold/20 text-white p-4 focus:border-accent-gold/50 focus:bg-accent-gold/10 transition-all font-mono text-sm outline-none h-24 resize-none"
                        placeholder={t('Describe what premium holders will get...', 'Décrivez ce que les détenteurs premium recevront...')}
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-primary-cyan font-black">{t('Strategic Synopsis', 'Synopsis Stratégique')}</label>
                    <textarea 
                      rows={4}
                      required
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white p-4 focus:border-primary-cyan/50 focus:bg-white/10 transition-all font-mono text-sm outline-none resize-none"
                      placeholder="Describe the commercial potential and IP uniqueness..."
                    />
                  </div>
                  
                  <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreatingProject(false)}
                      className="px-8 py-4 border border-white/10 text-white font-black uppercase italic text-xs hover:bg-white/5 transition-all tracking-widest"
                    >
                      {t('Abort', 'Abandonner')}
                    </button>
                    <button 
                      type="submit"
                      className="px-12 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,224,255,0.3)]"
                    >
                      {t('Submit for AI Audit', 'Soumettre pour Audit IA')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isSimulatorOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/98 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="w-full max-w-4xl bg-surface-low border border-white/10 relative flex flex-col lg:flex-row rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden"
            >
              <button 
                onClick={resetSimulator}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-white transition-colors z-[110] p-2 bg-black/20 rounded-full"
              >
                <X size={24} />
              </button>

              {/* Left Panel - Progress */}
              <div className="w-full lg:w-1/3 bg-primary-cyan/10 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-start gap-4 sm:gap-8 relative overflow-y-auto custom-scrollbar shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #00E0FF 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-cyan/20 flex items-center justify-center mb-4 sm:mb-6">
                    <Zap className="text-primary-cyan" size={32} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic leading-none tracking-tighter mb-2 sm:mb-4">
                    {t('LYA', 'LYA')} <br />
                    <span className="text-primary-cyan">{t('Simulator', 'Simulateur')}</span>
                  </h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-relaxed mb-4 sm:mb-8">
                    {t('Our algorithm will analyze your professional radiation and market performance to provide a preliminary LYA Score.', 'Notre algorithme analysera votre rayonnement professionnel et vos performances de marché pour fournir un score LYA préliminaire.')}
                  </p>

                  {/* Real-time score in left panel */}
                  <div className="p-4 bg-primary-cyan/20 border border-primary-cyan/40 rounded-xl mb-4 sm:mb-8 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    <p className="text-[8px] font-black text-primary-cyan uppercase tracking-widest mb-1">{t('CURRENT ESTIMATE', 'ESTIMATION ACTUELLE')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic text-white tracking-tighter">{currentSimulatorScore}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant opacity-40">/ 1000</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block relative z-10 pt-6 border-t border-white/10">
                  <div className="space-y-3">
                    {LYA_SIMULATOR_STEPS.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-black border transition-all duration-500 rounded-lg ${
                          simulatorStep === idx ? 'bg-primary-cyan border-primary-cyan text-surface-dim' :
                          simulatorStep > idx ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-400' :
                          'bg-white/5 border-white/10 text-on-surface-variant opacity-40'
                        }`}>
                          {simulatorStep > idx ? <ShieldCheck size={14} /> : idx + 1}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${
                          simulatorStep === idx ? 'text-white' : 'text-on-surface-variant opacity-40'
                        }`}>
                          {t(step.title, step.title)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Content */}
              <div className="flex-1 p-5 sm:p-8 md:p-10 bg-surface-low/50 backdrop-blur-md overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
                {simulatorResult === null ? (
                  <div className="space-y-8 md:space-y-12">
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white">
                        {t(LYA_SIMULATOR_STEPS[simulatorStep].title, LYA_SIMULATOR_STEPS[simulatorStep].title)}
                      </h3>
                      <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                        {t(LYA_SIMULATOR_STEPS[simulatorStep].description, LYA_SIMULATOR_STEPS[simulatorStep].description)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                      <div className="text-[10px] font-mono text-primary-cyan uppercase tracking-[0.4em] font-bold">
                        {t(`Step ${simulatorStep + 1} of ${LYA_SIMULATOR_STEPS.length}`, `Étape ${simulatorStep + 1} sur ${LYA_SIMULATOR_STEPS.length}`)}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                          {t('Real-time Score:', 'Score en temps réel :')}
                        </div>
                        <div className="text-xl font-black text-primary-cyan italic">
                          {currentSimulatorScore}<span className="text-[10px] not-italic text-on-surface-variant ml-1">/1000</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {LYA_SIMULATOR_STEPS[simulatorStep].questions.map((q) => (
                        <div key={q.id} className="space-y-4">
                          <p className="text-xs font-black uppercase tracking-widest text-primary-cyan">{t(q.text, q.text)}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt) => (
                              <button
                                key={opt.text}
                                onClick={() => handleSimulatorAnswer(LYA_SIMULATOR_STEPS[simulatorStep].id, q.id, opt.points)}
                                className={`p-4 text-left border transition-all duration-300 group ${
                                  simulatorAnswers[`${LYA_SIMULATOR_STEPS[simulatorStep].id}-${q.id}`] === opt.points
                                    ? 'bg-primary-cyan/10 border-primary-cyan text-white'
                                    : 'bg-white/5 border-white/10 text-on-surface-variant hover:border-white/30 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black uppercase tracking-widest">{t(opt.text, opt.text)}</span>
                                  {simulatorAnswers[`${LYA_SIMULATOR_STEPS[simulatorStep].id}-${q.id}`] === opt.points && <ShieldCheck size={14} className="text-primary-cyan" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-between gap-4">
                      <button 
                        onClick={() => setSimulatorStep(prev => Math.max(0, prev - 1))}
                        disabled={simulatorStep === 0}
                        className="px-8 py-4 border border-white/10 text-white font-black uppercase italic text-xs hover:bg-white/5 transition-all tracking-widest disabled:opacity-20"
                      >
                        {t('Previous', 'Précédent')}
                      </button>
                      
                      {simulatorStep === LYA_SIMULATOR_STEPS.length - 1 ? (
                        <button 
                          onClick={() => {
                            calculateSimulatorScore();
                            onNotify?.(t(`Simulation Finalized.`, `Simulation Finalisée.`));
                          }}
                          disabled={Object.keys(simulatorAnswers).length < LYA_SIMULATOR_STEPS.reduce((acc, step) => acc + step.questions.length, 0)}
                          className="px-12 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,224,255,0.3)] disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          {t('Finalize Simulation', 'Finaliser la Simulation')}
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setSimulatorStep(prev => prev + 1)}
                            disabled={LYA_SIMULATOR_STEPS[simulatorStep].questions.some(q => 
                              simulatorAnswers[`${LYA_SIMULATOR_STEPS[simulatorStep].id}-${q.id}`] === undefined
                            )}
                            className="px-12 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,224,255,0.3)] disabled:opacity-50"
                          >
                            {t('Next Step', 'Étape Suivante')}
                          </button>
                          {LYA_SIMULATOR_STEPS[simulatorStep].questions.some(q => 
                            simulatorAnswers[`${LYA_SIMULATOR_STEPS[simulatorStep].id}-${q.id}`] === undefined
                          ) && (
                            <p className="text-[8px] text-accent-gold uppercase font-bold tracking-widest mt-2 animate-pulse text-right">
                              {t('Answer all questions to unlock', 'Répondez à toutes les questions pour débloquer')}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-10"
                  >
                    <div className="relative">
                      <div className="absolute -inset-10 bg-primary-cyan/20 blur-xl rounded-full animate-pulse" />
                      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-primary-cyan/30 flex flex-col items-center justify-center bg-surface-low/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,224,255,0.2)]">
                        <div className="w-12 h-12 bg-primary-cyan/20 rounded-full flex items-center justify-center mb-2">
                          <Award className="text-primary-cyan" size={24} />
                        </div>
                        <p className="text-4xl font-black italic tracking-tighter text-white">{simulatorResult}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">/ 1000</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <h4 className="text-4xl font-black uppercase italic tracking-tight text-white">{t('Evaluation Complete!', 'Évaluation Terminée !')}</h4>
                      <p className="text-sm text-on-surface-variant font-bold leading-relaxed opacity-70">
                        {t('Your Evaluation Score is', 'Votre Score d\'Évaluation est de')} <span className="text-primary-cyan">{simulatorResult}</span>. {t('Please create your project now so that LinkYourArt can analyze your project and review your score if needed. This step is essential for professional indexing and visibility.', 'Veuillez créer votre projet maintenant afin que LinkYourArt puisse analyser votre projet et revoir votre score si nécessaire. Cette étape est essentielle pour l\'indexation et la visibilité professionnelle.')}
                      </p>
                    </div>

                    <div className="pt-8 w-full flex flex-col gap-4">
                      <button 
                        onClick={() => {
                          onNotify?.(t('Simulation results saved. Opening project creation...', 'Résultats de la simulation enregistrés. Ouverture de la création de projet...'));
                          resetSimulator();
                          setIsCreatingProject(true);
                        }}
                        className="w-full py-6 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.3em] text-[12px] hover:bg-white transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,224,255,0.3)]"
                      >
                        {t('GO TO PROFILE & CREATE PROJECT', 'ALLER AU PROFIL & CRÉER LE PROJET')}
                      </button>
                      <button 
                        onClick={resetSimulator}
                        className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {t('BACK TO DASHBOARD', 'RETOUR AU TABLEAU DE BORD')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Feature Modal */}
      <AnimatePresence>
        {premiumFeature && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface-dim/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-low border border-white/10 w-full max-w-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
              <button 
                onClick={() => setPremiumFeature(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 text-white/40 hover:text-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center rounded-full">
                    <Crown size={32} className="text-accent-gold" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-accent-gold uppercase tracking-[0.4em] font-bold mb-1">{t('Premium Feature', 'Fonctionnalité Premium')}</div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{premiumFeature}</h3>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  {premiumFeature && PREMIUM_FEATURES_CONTENT[premiumFeature]?.previewImage && (
                    <div className="w-full h-48 bg-surface-dim border border-white/10 overflow-hidden mb-6">
                      <img 
                        src={PREMIUM_FEATURES_CONTENT[premiumFeature].previewImage} 
                        alt={premiumFeature} 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <p className="text-lg text-on-surface-variant leading-relaxed opacity-80 italic">
                    {premiumFeature && PREMIUM_FEATURES_CONTENT[premiumFeature] 
                      ? PREMIUM_FEATURES_CONTENT[premiumFeature].description 
                      : t(`Unlock the full potential of ${premiumFeature} with a Professional subscription. This feature provides exclusive access to expert-grade tools and private market opportunities.`, `Débloquez tout le potentiel de ${premiumFeature} avec un abonnement Professionnel. Cette fonctionnalité offre un accès exclusif à des outils de qualité experte et à des opportunités de marché privé.`)}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(premiumFeature && PREMIUM_FEATURES_CONTENT[premiumFeature] 
                      ? PREMIUM_FEATURES_CONTENT[premiumFeature].benefits 
                      : [
                        { label: t('Professional Data', 'Données Professionnelles'), desc: t('Direct access to verified market feeds.', 'Accès direct aux flux de marché vérifiés.') },
                        { label: t('Priority Access', 'Accès Prioritaire'), desc: t('Be the first to see new high-potential assets.', 'Soyez le premier à voir les nouveaux actifs.') },
                        { label: t('Advanced Analytics', 'Analyses Avancées'), desc: t('Predictive modeling and risk assessment.', 'Modélisation prédictive et évaluation des risques.') },
                        { label: t('Private Network', 'Réseau Privé'), desc: t('Connect with top-tier LYA professionals.', 'Connectez-vous avec des professionnels LYA d\'élite.') },
                      ]).map((benefit, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-lg">
                        <div className="text-[10px] font-black text-accent-gold uppercase tracking-widest mb-1">{benefit.label}</div>
                        <div className="text-[10px] text-on-surface-variant uppercase opacity-60">{benefit.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      setPremiumFeature(null);
                      onNotify?.(t('Redirecting to Pricing...', 'Redirection vers les Tarifs...'));
                    }}
                    className="flex-1 py-4 bg-accent-gold text-surface-dim font-black uppercase italic text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
                  >
                    {t('Upgrade to Professional', 'Passer au Professionnel')}
                  </button>
                  <button 
                    onClick={() => setPremiumFeature(null)}
                    className="flex-1 py-4 border border-white/10 text-white font-black uppercase italic text-xs tracking-[0.2em] hover:bg-white/5 transition-all"
                  >
                    {t('Maybe Later', 'Peut-être plus tard')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Specific Content */}
      <div className="px-4 md:px-0">
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
};

export default ProfileView;
