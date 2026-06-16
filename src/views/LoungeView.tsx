
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Send, 
  Search, 
  MoreVertical, 
  Crown, 
  Activity,
  Calendar,
  EyeOff,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
  Globe,
  Link as LinkIcon,
  CheckCircle2,
  Info,
  Scale,
  Star,
  Pin,
  Plus,
  Eye,
  Shield,
  History,
  Cpu,
  X,
  Fingerprint,
  Settings
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { SecureMail } from '../components/ui/SecureMail';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';

type LoungeTab = 'FEED' | 'MEMBERS' | 'EVENTS' | 'MENTORSHIP';

interface Post {
  id: string;
  author: string;
  handle: string;
  role: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
  tags: string[];
  avatar?: string;
  verified?: boolean;
}

interface Member {
  id: string;
  name: string;
  handle: string;
  role: string;
  industry: string;
  status: string;
  avatar?: string;
  roleIcon: React.ReactNode;
  statusColor: string;
}

interface Event {
  id: string;
  title: string;
  type: 'WEBINAR' | 'ROUNDTABLE' | 'TECH TALK' | 'GALA' | 'PRIVATE AUCTION' | 'WORKSHOP' | 'SUMMIT';
  date: string;
  host: string;
  image: string;
  attendees: number;
  slots: number;
  description: string;
  highlights: string[];
  speakers: { name: string, role: string, avatar: string }[];
  status: 'OPEN' | 'WAITLIST' | 'FULL';
}

interface LoungeViewProps {
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange?: (view: any) => void;
  onProfessionalChatToggle?: (isActive: boolean) => void;
}

export const LoungeView: React.FC<LoungeViewProps> = ({ user, onNotify, onViewChange, onProfessionalChatToggle }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LoungeTab>('FEED');
  const [conversations, setConversations] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [visibleTopics, setVisibleTopics] = useState(4);
  const [isApplying, setIsApplying] = useState(false);
  const [admissionsRequested, setAdmissionsRequested] = useState<Set<string>>(new Set());
  const [viewedDossiers, setViewedDossiers] = useState<Set<string>>(new Set());
  const [viewedMentors, setViewedMentors] = useState<Set<string>>(new Set());
  const [visibleMembers, setVisibleMembers] = useState(4);
  const [visibleEvents, setVisibleEvents] = useState(2);
  const [visibleMentors, setVisibleMentors] = useState(2);
  const [monitorImage, setMonitorImage] = React.useState<string | null>(null);
  const [showMail, setShowMail] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{name: string, role: string} | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'READY' | 'SCANNING' | 'SUCCESS'>('READY');

  // Fetch posts from Firestore
  React.useEffect(() => {
    if (!user || (user.role !== UserRole.ADMIN && !user.isPro)) {
      setLoadingPosts(false);
      setPosts([]);
      return;
    }

    const q = query(
      collection(db, 'lounge_posts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.authorName,
          handle: data.authorHandle,
          role: data.authorRole,
          content: data.content,
          time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : t('Pending...', 'En attente...'),
          likes: data.likes || 0,
          comments: data.commentsCount || 0,
          tags: data.tags || [],
          verified: data.verified || false,
          authorId: data.authorId
        };
      });
      setPosts(postsList);
      setLoadingPosts(false);
    }, (error) => {
      console.error('Lounge Posts Error:', error);
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [t, user]);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [pinnedPosts, setPinnedPosts] = useState<Set<string>>(new Set());

  const handleRequestAdmission = (eventId: string, title: string) => {
    onNotify(t('INITIATING ADMISSION PROTOCOL...', 'INITIALISATION DU PROTOCOLE D\'ADMISSION...'));
    setTimeout(() => {
      setAdmissionsRequested(prev => new Set(prev).add(eventId));
      onNotify(`${t('REQUEST SUBMITTED FOR', 'DEMANDE SOUMISE POUR')} ${title.toUpperCase()}. ${t('PENDING COORDINATOR REVIEW.', 'EN ATTENTE DE L\'EXAMEN DU COORDONNATEUR.')}`);
    }, 1500);
  };

  const handleViewDossier = (memberId: string, name: string) => {
    onNotify(t('DECRYPTING PROFESSIONAL DOSSIER...', 'DÉCRYPTAGE DU DOSSIER PROFESSIONNEL...'));
    setTimeout(() => {
      setViewedDossiers(prev => new Set(prev).add(memberId));
      onNotify(`${t('DOSSIER FOR', 'DOSSIER DE')} ${name.toUpperCase()} ${t('ACCESSED. CONFIDENTIAL DATA LAYER ACTIVE.', 'ACCÉDÉ. COUCHE DE DONNÉES CONFIDENTIELLES ACTIVE.')}`);
    }, 1200);
  };

  const handleInitiateContact = (name: string, role: string) => {
    setSelectedRecipient({ name, role });
    setShowMail(true);
    
    // Add to mock conversations if not exists
    if (!conversations.find(c => c.name === name)) {
      setConversations(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        name,
        role,
        lastMessage: '...',
        time: t('Just now', 'À l\'instant'),
        unread: false
      }, ...prev]);
    }
  };

  const generateProfessionalId = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; 
    }
    const absHash = Math.abs(hash).toString(16).toUpperCase();
    return `PRT-${absHash.substring(0, 4)}-${absHash.substring(4, 8)}`;
  };

  const [pulseStats, setPulseStats] = useState({
    volume: '1.2B',
    volumeTrend: '+2.4%',
    topSector: 'Digital Fine Art',
    volatility: 'Low / Stable',
    trend: '+14.2%'
  });

  React.useEffect(() => {
    const seeds = [
      'creative-news', 'market-data', 'professional', 'global-finance', 
      'neural-network', 'architecture', 'abstract', 'technology',
      'vantage', 'luxury', 'monumental', 'abstract-art',
      'urban-tech', 'cyberpunk', 'modern-office', 'abstract-geometry', 
      'luxury-interior', 'global-trade', 'data-viz', 'high-fashion', 
      'creative-studio', 'professional-vault'
    ];
    const updateHeader = () => {
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      setMonitorImage(`https://picsum.photos/seed/${randomSeed}/${1200 + Math.floor(Math.random() * 1000)}/600?t=${Date.now()}`);
      
      // Randomize Pulse Stats
      setPulseStats({
        volume: `${(Math.random() * 2 + 0.5).toFixed(1)}B`,
        volumeTrend: `${(Math.random() * 5).toFixed(1)}%`,
        topSector: ['Music Catalogs', 'Digital Fine Art', 'Cinematic Assets', 'Generative Series', 'Architectural IP'][Math.floor(Math.random() * 5)],
        volatility: ['Low / Stable', 'Moderate', 'Liquid', 'High Yield'][Math.floor(Math.random() * 4)],
        trend: `${(Math.random() * 15 + 5).toFixed(1)}%`
      });
    };
    updateHeader();
    const interval = setInterval(updateHeader, 20000); // 20 seconds for more activity
    return () => clearInterval(interval);
  }, []);

  const [activeChat, setActiveChat] = useState<string | null>(null);

  const handleCloseChat = () => {
    setActiveChat(null);
    onProfessionalChatToggle?.(false);
  };

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    try {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });

      const postRef = doc(db, 'lounge_posts', postId);
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1)
      });
      
      onNotify(t(isLiked ? 'INSIGHT UNLIKED' : 'INSIGHT LIKED', isLiked ? 'INSIGHT RETIRÉ' : 'INSIGHT AIMÉ'));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handlePostInsight = async () => {
    if (!postContent.trim() || !user) return;
    
    try {
      const postData = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorHandle: `@${(user.displayName || 'User').toUpperCase().replace(/\s+/g, '_')}`,
        authorRole: user.role || 'MEMBER',
        content: postContent,
        timestamp: serverTimestamp(),
        likes: 0,
        commentsCount: 0,
        tags: ['INSIGHT'],
        verified: user.isPro || false
      };

      await addDoc(collection(db, 'lounge_posts'), postData);
      setPostContent('');
      onNotify(t('INSIGHT POSTED TO SECURE FEED', 'APERÇU POSTÉ SUR LE FLUX SÉCURISÉ'));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'lounge_posts');
    }
  };

  const handleOpenChat = (memberId: string) => {
    setActiveChat(memberId);
    onProfessionalChatToggle?.(true);
  };

  const handlePin = (postId: string) => {
    const isPinned = pinnedPosts.has(postId);
    
    setPinnedPosts(prev => {
      const newSet = new Set(prev);
      if (isPinned) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    onNotify(t(isPinned ? 'INSIGHT UNPINNED FROM PROFILE' : 'INSIGHT PINNED TO PROFILE', isPinned ? 'INSIGHT DÉPINGLÉ DU PROFIL' : 'INSIGHT ÉPINGLÉ AU PROFIL'));
  };

  const members: (Member & { hasPremium?: boolean, isUnlocked?: boolean })[] = [
    { id: '1', name: 'Julian Vane', handle: '@LYA_CORE', role: 'CORE_FOUNDER', industry: t('Creative Economy', 'Économie Créative'), status: 'ACTIVE', roleIcon: <Crown className="text-accent-gold" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '2', name: 'Elena Vance', handle: '@VANCE_CAPITAL', role: 'LEGACY_CURATOR', industry: t('Venture Capital', 'Capital Risque'), status: 'ON_VALUATION', roleIcon: <Globe className="text-primary-cyan" size={20} />, statusColor: 'bg-accent-pink', hasPremium: true },
    { id: '3', name: 'Aurelius Art', handle: '@AURELIUS_ART', role: 'MASTER_CURATOR', industry: t('Museum Assets', 'Actifs de Musée'), status: 'ACTIVE', roleIcon: <Zap className="text-accent-purple" size={20} />, statusColor: 'bg-emerald-500', hasPremium: false },
    { id: '4', name: 'Sarah Jenkins', handle: '@JENKINS_LEGAL', role: 'LEGAL_AUDITOR', industry: t('IP Law', 'Droit de la PI'), status: 'OFFLINE', roleIcon: <ShieldCheck className="text-emerald-400" size={20} />, statusColor: 'bg-slate-500', hasPremium: true },
    { id: '5', name: 'Chen Wei', handle: '@CHEN_DEV', role: 'SYSTEM_ARCHITECT', industry: t('Software Tech', 'Technologie Logicielle'), status: 'BUSY', roleIcon: <Activity className="text-primary-cyan" size={20} />, statusColor: 'bg-accent-pink', hasPremium: false },
    { id: '6', name: 'Loren Smith', handle: '@LOREN_CURATOR', role: 'IP_STRATEGIST', industry: t('Music Industry', 'Industrie Musicale'), status: 'ACTIVE', roleIcon: <Users className="text-accent-gold" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '7', name: 'Marcus Thorne', handle: '@THORNE_STRAT', role: 'MARKET_MAKER', industry: t('Liquidity Pools', 'Pools de Liquidité'), status: 'ACTIVE', roleIcon: <TrendingUp className="text-primary-cyan" size={20} />, statusColor: 'bg-emerald-500', hasPremium: false },
    { id: '8', name: 'Claire Dubois', handle: '@DUBOIS_VANTAGE', role: 'SENIOR_ADVISOR', industry: t('Heritage Arts', 'Arts du Patrimoine'), status: 'ON_VALUATION', roleIcon: <Eye className="text-accent-gold" size={20} />, statusColor: 'bg-accent-pink', hasPremium: true },
    { id: '9', name: 'JV CEO', handle: '@JV_CEO', role: 'SECURITY_OFFICER', industry: t('Cyber Security', 'Biosécurité'), status: 'ACTIVE', roleIcon: <Shield className="text-accent-purple" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '10', name: 'Quant Research', handle: '@QUANT_RESEARCH', role: 'ALGO_ANALYST', industry: t('Big Data', 'Big Data'), status: 'OFFLINE', roleIcon: <Cpu className="text-primary-cyan" size={20} />, statusColor: 'bg-slate-500', hasPremium: false }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: t('Professional Art Market 2026', 'Marché de l\'Art Professionnel 2026'),
      type: 'WEBINAR',
      date: t('TOMORROW, 14:00 GMT', 'DEMAIN, 14h00 GMT'),
      host: 'Alpha Market Analysis',
      image: 'https://picsum.photos/seed/art-market/800/400',
      attendees: 126,
      slots: 24,
      description: t('An exclusive deep dive into the projected growth of the creative rights market for the next fiscal year.', 'Une plongée exclusive dans la croissance projetée du marché des droits créatifs pour le prochain exercice fiscal.'),
      highlights: [t('Market Forecasts', 'Prévisions du Marché'), t('Liquidity Analysis', 'Analyse de Liquidité'), t('Global Adoption', 'Adoption Mondiale')],
      speakers: [
        { name: 'Dr. Elena Vance', role: t('Chief Economist', 'Économiste en Chef'), avatar: 'https://i.pravatar.cc/150?u=elena' },
        { name: 'Marcus Thorne', role: t('Head of Strategy', 'Responsable de la Stratégie'), avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '2',
      title: t('IP Rights in the Generative Era', 'Droits de PI à l\'Ère Générative'),
      type: 'ROUNDTABLE',
      date: t('FRIDAY, 18:00 GMT', 'VENDREDI, 18h00 GMT'),
      host: 'Legal Protocol V2',
      image: 'https://picsum.photos/seed/ip-rights/800/400',
      attendees: 43,
      slots: 7,
      description: t('A closed-door discussion on the legal frameworks governing AI-generated creative projects.', 'Une discussion à huis clos sur les cadres juridiques régissant les projets créatifs générés par l\'IA.'),
      highlights: [t('Copyright Law', 'Droit d\'Auteur'), t('Neural Validation', 'Validation Neurale'), t('Smart Contract IP', 'PI via Smart Contract')],
      speakers: [
        { name: 'Sarah Jenkins', role: t('IP Attorney', 'Avocate en PI'), avatar: 'https://i.pravatar.cc/150?u=sarah' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '3',
      title: t('Elite Networking Gala', 'Gala de Réseautage d\'Élite'),
      type: 'GALA',
      date: t('NEXT SATURDAY, 20:00 GMT', 'SAMEDI PROCHAIN, 20h00 GMT'),
      host: 'LYA Core',
      image: 'https://picsum.photos/seed/gala/800/400',
      attendees: 250,
      slots: 50,
      description: t('The premier social event for the creative economy expert community. Black tie required.', 'Le premier événement social pour la communauté des experts de l\'économie créative. Tenue de soirée exigée.'),
      highlights: [t('Networking', 'Réseautage'), t('Live Performance', 'Performance en Direct'), t('Exclusive Reveal', 'Révélation Exclusive')],
      speakers: [
        { name: 'Julian Vane', role: t('CEO, LinkYourArt', 'PDG, LinkYourArt'), avatar: 'https://i.pravatar.cc/150?u=julian' }
      ],
      status: 'OPEN'
    },
    {
      id: '4',
      title: t('Private Auction: Legacy Series', 'Enchères Privées : Série Héritage'),
      type: 'PRIVATE AUCTION',
      date: t('MAY 12, 10:00 GMT', '12 MAI, 10h00 GMT'),
      host: 'Sotheby\'s Digital',
      image: 'https://picsum.photos/seed/auction/800/400',
      attendees: 12,
      slots: 5,
      description: t('Bidding on ultra-rare legacy creative rights from the early 20th century.', 'Enchères sur des droits créatifs hérités ultra-rares du début du 20ème siècle.'),
      highlights: [t('Rare Assets', 'Actifs Rares'), t('Provenance Check', 'Vérification de la Provenance'), t('Instant Settlement', 'Règlement Immédiat')],
      speakers: [
        { name: 'Claire Dubois', role: t('Senior Curator', 'Conservatrice Senior'), avatar: 'https://i.pravatar.cc/150?u=claire' }
      ],
      status: 'OPEN'
    },
    {
      id: '5',
      title: t('Neural Canvas Masterclass', 'Masterclass Canevas Neural'),
      type: 'WORKSHOP',
      date: t('JUNE 4, 15:00 GMT', '4 JUIN, 15h00 GMT'),
      host: 'Lya Academy',
      image: 'https://picsum.photos/seed/neural/800/400',
      attendees: 85,
      slots: 15,
      description: t('Technical workshop on implementing the LYA-721 standard for neural-generated assets.', 'Atelier technique sur l\'implémentation du standard LYA-721 pour les actifs générés par neurones.'),
      highlights: [t('Code Review', 'Revue de Code'), t('Standard Validation', 'Validation du Standard'), t('Deployment', 'Déploiement')],
      speakers: [
        { name: 'Chen Dev', role: t('Lead Architect', 'Architecte Principal'), avatar: 'https://i.pravatar.cc/150?u=chen' }
      ],
      status: 'OPEN'
    },
    {
      id: '6',
      title: t('Global Settlement Summit', 'Sommet Mondial du Règlement'),
      type: 'SUMMIT',
      date: 'JULY 20-22, 2026',
      host: 'LYA Foundation',
      image: 'https://picsum.photos/seed/summit/800/400',
      attendees: 500,
      slots: 100,
      description: t('The annual gathering of professional associates to define the future of the LYA settlement layer.', 'Le rassemblement annuel des associés professionnels pour définir l\'avenir de la couche de règlement LYA.'),
      highlights: [t('Protocol Roadmap', 'Feuille de Route du Protocole'), t('Regulatory Sync', 'Synchronisation Réglementaire'), t('DAO Voting', 'Vote DAO')],
      speakers: [
        { name: 'Jean-Baptiste Lequime', role: t('Founder', 'Fondateur'), avatar: 'https://i.pravatar.cc/150?u=jb' }
      ],
      status: 'OPEN'
    },
    {
      id: '7',
      title: t('Digital Rarity Roundtable', 'Table Ronde sur la Rareté Numérique'),
      type: 'ROUNDTABLE',
      date: t('AUGUST 12, 18:00 GMT', '12 AOÛT, 18h00 GMT'),
      host: 'Creative Index',
      image: 'https://picsum.photos/seed/rarity/800/400',
      attendees: 42,
      slots: 8,
      description: t('An expert panel discussion on valuing digital scarcity in a post-AI landscape.', 'Une discussion d\'experts sur la valorisation de la rareté numérique dans un paysage post-IA.'),
      highlights: [t('Rarity Modeling', 'Modélisation de Rareté'), t('Auction Psychology', 'Psychologie des Enchères'), t('Market Microstructure', 'Microstructure du Marché')],
      speakers: [
        { name: 'Dr. Sarah Vance', role: t('Economist', 'Économiste'), avatar: 'https://i.pravatar.cc/150?u=sarah' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '8',
      title: t('Boutique IP Auction', 'Vente aux Enchères de PI Boutique'),
      type: 'PRIVATE AUCTION',
      date: t('SEPTEMBER 5, 20:00 GMT', '5 SEPTEMBRE, 20h00 GMT'),
      host: 'Exclusive Partners',
      image: 'https://picsum.photos/seed/auction/800/400',
      attendees: 25,
      slots: 5,
      description: t('Private bidding for high-value cinematic IP rights and exclusive music catalogs.', 'Enchères privées pour des droits de PI cinématographiques de haute valeur et des catalogues musicaux exclusifs.'),
      highlights: [t('Closed-door Bidding', 'Enchères à Huis Clos'), t('Professional Escrow', 'Escrow Professionnel'), t('IP Transfer', 'Transfert de PI')],
      speakers: [
        { name: 'Luc Gauthier', role: t('Chief Broker', 'Courtier en Chef'), avatar: 'https://i.pravatar.cc/150?u=luc' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '9',
      title: t('Global IP Summit 2026', 'Sommet Mondial de la PI 2026'),
      type: 'SUMMIT',
      date: 'OCTOBER 15-17, 2026',
      host: 'LYA World',
      image: 'https://picsum.photos/seed/summit-ip/800/400',
      attendees: 1200,
      slots: 300,
      description: t('The largest gathering of IP professionals and creative partenaire créatifs.', 'Le plus grand rassemblement de professionnels de la PI et d\'partenaire créatifs créatifs.'),
      highlights: [t('Policy Shifts', 'Changements de Politique'), t('Tech Demos', 'Démos Tech'), t('Networking', 'Réseautage')],
      speakers: [
        { name: 'Dr. Sarah Vance', role: t('Policy Expert', 'Experte en Politiques'), avatar: 'https://i.pravatar.cc/150?u=sarah2' }
      ],
      status: 'OPEN'
    },
    {
      id: '10',
      title: t('Creative Rights Workshop', 'Atelier sur les Droits Créatifs'),
      type: 'WORKSHOP',
      date: t('NOVEMBER 2, 14:00 GMT', '2 NOVEMBRE, 14h00 GMT'),
      host: 'Lya Academy',
      image: 'https://picsum.photos/seed/equity/800/400',
      attendees: 50,
      slots: 10,
      description: t('Hands-on training for valuing creative rights in early-stage projects.', 'Formation pratique pour évaluer les droits créatifs dans les projets en phase initiale.'),
      highlights: [t('Valuation Models', 'Modèles de Valorisation'), t('Risk Assessment', 'Évaluation des Risques'), t('Exit Strategies', 'Stratégies de Sortie')],
      speakers: [
        { name: 'Marcus Thorne', role: t('Head of Strategy', 'Responsable de la Stratégie'), avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '11',
      title: t('Global Liquidity Roundtable', 'Table Ronde sur la Liquidité Mondiale'),
      type: 'ROUNDTABLE',
      date: t('DECEMBER 5, 16:00 GMT', '5 DÉCEMBRE, 16h00 GMT'),
      host: 'Capital Alpha',
      image: 'https://picsum.photos/seed/liquidity/800/400',
      attendees: 30,
      slots: 4,
      description: t('Discussion on professional exit strategies and réserves de droits.', 'Discussion sur les stratégies de sortie professionnelles et les réserves de droits.'),
      highlights: [t('Liquidity Pools', 'Pools de Liquidité'), t('Exit Strategy', 'Stratégie de Sortie'), t('Market Making', 'Market Making')],
      speakers: [
        { name: 'Marcus Thorne', role: t('Global Market Maker', 'Market Maker Mondial'), avatar: 'https://i.pravatar.cc/150?u=m1' }
      ],
      status: 'OPEN'
    },
    {
      id: '12',
      title: t('Art Valuation Masterclass', 'Masterclass sur la Valorisation de l\'Art'),
      type: 'WEBINAR',
      date: t('JANUARY 15, 2027', '15 JANVIER 2027'),
      host: 'Creative Index',
      image: 'https://picsum.photos/seed/art-val/800/400',
      attendees: 200,
      slots: 0,
      description: t('Mastering the art of valuing non-fungible professional projects.', 'Maîtriser l\'art de valoriser les projets professionnels non fongibles.'),
      highlights: [t('Valuation 101', 'Bases de la Valorisation'), t('Algorithm Intro', 'Intro à l\'Algorithme'), t('Case Studies', 'Études de Cas')],
      speakers: [
        { name: 'Julian Vane', role: t('CEO', 'PDG'), avatar: 'https://i.pravatar.cc/150?u=julian' }
      ],
      status: 'OPEN'
    }
  ];

  const mentors = [
    {
      id: 'm1',
      name: 'Marcus Thorne',
      role: t('Global Market Maker', 'Market Maker Mondial'),
      specialty: t('Creative Liquidity & Valuation', 'Liquidité Créative & Valorisation'),
      avatar: 'https://i.pravatar.cc/300?u=m1',
      availability: 'AVAILABLE',
      sessions: 142,
      score: 992
    },
    {
      id: 'm2',
      name: 'Elena Vance',
      role: t('Grammy Legacy Curator', 'Conservatrice Héritage Grammy'),
      specialty: t('Intellectual Property Rights', 'Droits de Propriété Intellectuelle'),
      avatar: 'https://i.pravatar.cc/300?u=m2',
      availability: 'FULL',
      sessions: 89,
      score: 978
    },
    {
      id: 'm3',
      name: 'Sarah Chen',
      role: t('Venture Architect', 'Architecte de Capital Risque'),
      specialty: t('Web3 Monetization Models', 'Modèles de Monétisation Web3'),
      avatar: 'https://i.pravatar.cc/300?u=m3',
      availability: 'AVAILABLE',
      sessions: 215,
      score: 985
    },
    {
      id: 'm4',
      name: 'David Rossi',
      role: t('IP Attorney', 'Avocat en PI'),
      specialty: t('Cross-Border Licensing', 'Licences Transfrontalières'),
      avatar: 'https://i.pravatar.cc/300?u=m4',
      availability: 'AVAILABLE',
      sessions: 67,
      score: 964
    },
    {
      id: 'm5',
      name: 'Isabella Moretti',
      role: t('Luxury Branding Expert', 'Experte en Branding de Luxe'),
      specialty: t('High-End Market Positioning', 'Positionnement de Marché Haut de Gamme'),
      avatar: 'https://i.pravatar.cc/300?u=m5',
      availability: 'AVAILABLE',
      sessions: 156,
      score: 972
    },
    {
      id: 'm6',
      name: 'Kenji Sato',
      role: t('Technology Strategist', 'Stratège Technologique'),
      specialty: t('AI & Generative IP', 'IA & PI Générative'),
      avatar: 'https://i.pravatar.cc/300?u=Kenji',
      availability: 'AVAILABLE',
      sessions: 204,
      score: 981
    },
    {
      id: 'm7',
      name: 'Aurelius Art',
      role: t('Master Curator', 'Maître Conservateur'),
      specialty: t('Fine Art Valuation', 'Valorisation des Beaux-Arts'),
      avatar: 'https://i.pravatar.cc/300?u=m7',
      availability: 'AVAILABLE',
      sessions: 312,
      score: 995
    },
    {
      id: 'm8',
      name: 'Sarah Jenkins',
      role: t('IP Attorney', 'Avocate en PI'),
      specialty: t('Legal Frameworks', 'Cadres Juridiques'),
      avatar: 'https://i.pravatar.cc/300?u=m8',
      availability: 'AVAILABLE',
      sessions: 95,
      score: 968
    },
    {
      id: 'm9',
      name: 'Julian Vane',
      role: t('CEO & Founder', 'PDG & Fondateur'),
      specialty: t('Creative Economy Architecture', 'Architecture de l\'Économie Créative'),
      avatar: 'https://i.pravatar.cc/300?u=julian',
      availability: 'FULL',
      sessions: 450,
      score: 999
    },
    {
      id: 'm10',
      name: 'Claire Dubois',
      role: t('Art Historian & Strategist', 'Historienne de l\'Art & Stratège'),
      specialty: t('Provenance & Rarity Engines', 'Moteurs de Provenance & Rareté'),
      avatar: 'https://i.pravatar.cc/300?u=claire',
      availability: 'AVAILABLE',
      sessions: 112,
      score: 975
    }
  ];

  const handleViewMentor = (mentorId: string, mentorName: string) => {
    onNotify(t(`DECRYPTING MENTOR HUB: ${mentorName.toUpperCase()}...`, `DÉCRYPTAGE DU HUB MENTOR : ${mentorName.toUpperCase()}...`));
    setTimeout(() => {
      setViewedMentors(prev => {
        const next = new Set(prev);
        next.add(mentorId);
        return next;
      });
      onNotify(t('ACCESS GRANTED. INTELLECTUAL PROPERTY HUB SECURED.', 'ACCÈS AUTORISÉ. HUB DE PROPRIÉTÉ INTELLECTUELLE SÉCURISÉ.'));
    }, 1200);
  };

  const trendingTopics = [
    { tag: t('LYA-721 Standards', 'Standards LYA-721'), insights: 124, trend: '+12%' },
    { tag: t('EU Creative Rights', 'Droits Créatifs de l\'UE'), insights: 89, trend: '+45%' },
    { tag: t('Generative IP Rights', 'Droits de PI Génératifs'), insights: 56, trend: '+8%' },
    { tag: t('Professional Liquidity', 'Liquidité Professionnelle'), insights: 42, trend: '-5%' },
    { tag: t('Global Art Index', 'Indice Mondial de l\'Art'), insights: 38, trend: '+22%' },
    { tag: t('Tokenized Cinema', 'Cinéma Tokenisé'), insights: 31, trend: '+15%' },
    { tag: t('Smart IP Contracts', 'Smart Contracts de PI'), insights: 27, trend: '+10%' }
  ];

  // Access Control: Only Admin or Pro users can access the Lounge
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="w-full max-w-5xl mx-auto py-10 px-4 md:px-8">
        <div className="relative bg-gradient-to-b from-surface-low to-surface-dim border border-white/5 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          {/* Futuristic corner brackets */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-accent-gold/20" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-accent-gold/20" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-accent-gold/20" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-accent-gold/20" />
          
          {/* Cyber grid lines */}
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(rgba(255,215,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

          {/* Glowing particle dots */}
          <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-primary-cyan/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Interactive Vault Shield Container */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-[2.5rem] p-6 shadow-inner group">
                <div className="absolute inset-0 bg-accent-gold/[0.02] rounded-[2.5rem] group-hover:bg-accent-gold/5 transition-colors duration-500" />
                
                {/* Rotating gear circles */}
                <span className="absolute w-48 h-48 rounded-full border-2 border-dashed border-accent-gold/10 animate-[spin_60s_linear_infinite]" />
                <span className="absolute w-40 h-40 rounded-full border border-primary-cyan/10 animate-[spin_30s_linear_infinite_reverse]" />

                <AnimatePresence mode="wait">
                  {biometricScanning ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-primary-cyan text-center"
                    >
                      <motion.div
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-24 h-0.5 bg-primary-cyan shadow-[0_0_15px_rgba(0,224,255,1)] mb-4"
                      />
                      <Fingerprint size={54} className="animate-pulse text-primary-cyan/80 mb-3" />
                      <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase animate-pulse">{t('DECRYPTING KEY...', 'CHIFFREMENT EN COURS...')}</span>
                    </motion.div>
                  ) : biometricStatus === 'SUCCESS' ? (
                    <motion.div 
                      key="scanning_denied"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-red-500 text-center"
                    >
                      <Lock size={48} className="mb-4 text-red-400 animate-bounce" />
                      <span className="text-[10px] font-black font-mono tracking-widest text-red-400 uppercase bg-red-950/20 px-3 py-1 border border-red-500/10 rounded-md">
                        {t('VERIFICATION DENIED', 'ACCÈS REFUSÉ')}
                      </span>
                      <p className="text-[10px] text-red-400/60 uppercase font-bold tracking-wider mt-2 max-w-[180px]">
                        {t('LEVEL 3 STATUS REQUIRED', 'STATUT PROFESSIONNEL DE NIVEAU 3 REQUIS')}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center"
                    >
                      <div className="w-16 h-16 bg-accent-gold/10 border border-accent-gold/20 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
                        <Lock size={28} className="text-accent-gold" />
                      </div>
                      
                      <button 
                        onClick={() => {
                          setBiometricScanning(true);
                          onNotify(t('INITIATING RECURSIVE BIOMETRIC PROBE...', 'LANCEMENT DE LA SONDE BIOMÉTRIQUE RÉCURSIVE...'));
                          setTimeout(() => {
                            setBiometricScanning(false);
                            setBiometricStatus('SUCCESS');
                            onNotify(t('ACCESS DECLINED: CRYPTOGRAPHIC HANDSHAKE FAULT (LVL3_PRO_NOT_STABILIZED)', 'ACCÈS REFUSÉ : SÉCURITÉ DE CLÉ NON DÉTECTÉE (PRO_NV3)'));
                          }, 2000);
                        }}
                        className="px-5 py-2.5 bg-accent-gold/5 border border-accent-gold/30 hover:border-accent-gold hover:bg-accent-gold/10 rounded-xl transition-all shadow-xl group/scan active:scale-95"
                      >
                        <span className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-accent-gold">
                          <Fingerprint size={12} className="group-hover/scan:scale-110 transition-transform" />
                          {t('SCAN CREDENTIALS', 'SCANNER IDENTITÉ')}
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Simulated Telemetry lines */}
                <div className="absolute bottom-3 left-4 right-4 text-[7px] font-mono text-on-surface-variant/25 flex justify-between uppercase">
                  <span>SEC_CORR_SYS</span>
                  <span>ID: LYA_PRO_VAULT</span>
                </div>
              </div>
            </div>

            {/* Premium Marketing Tier Card Context */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <span className="px-4 py-1.5 bg-accent-gold/10 text-accent-gold border border-accent-gold/20 text-xs font-black uppercase tracking-[0.3em] rounded-full inline-block">
                  🏛️ {t('ELITE PROTOCOL ZONE', 'ZONE DE PROTOCOLE ÉLITE')}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-headline tracking-tighter text-white uppercase leading-[0.9]">
                  {t('Lounge Access Restricted', 'Accès au Salon Restreint')}
                </h2>
              </div>

              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed opacity-70">
                {t('The Pro Lounge represent the ultimate elite tier of the LYA platform. A secure physical and digital workspace reserved strictly for vetted private collectors, museum associate directors, legal curators, and authenticated index providers.', 'Le Salon Pro représente le niveau d\'élite absolu de la plateforme LYA. Un espace de travail physique et sécurisé strictement réservé aux collectionneurs privés accrédités, directeurs de musées, conservateurs et validateurs d\'indices.')}
              </p>

              {/* Elite feature checklist */}
              <div className="py-4 border-y border-white/5 space-y-3 font-mono text-[10px] md:text-xs">
                <div className="flex items-center gap-3 text-white/95">
                  <ShieldCheck size={14} className="text-accent-gold shrink-0" />
                  <span className="uppercase tracking-wide">
                    {t('Direct OTC Licensing & Master Right Transfers', 'Transfert Direct de Droits Maîtres & Négociations OTC')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/95">
                  <TrendingUp size={14} className="text-accent-gold shrink-0" />
                  <span className="uppercase tracking-wide">
                    {t('Private-tier index insights and direct developer API modules', 'Données d\'indice privées & modules API développeur directs')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/95">
                  <Crown size={14} className="text-accent-gold shrink-0" />
                  <span className="uppercase tracking-wide">
                    {t('1-on-1 Curated Elite Advisory Node channels', 'Canaux consultatifs d\'élite 1-à-1 avec les conservateurs')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => {
                    onNotify(t('Opening Premium pricing modules...', 'Ouverture des modules de tarification Premium...'));
                    if (onViewChange) onViewChange('PRICING');
                  }}
                  className="px-8 py-4 bg-accent-gold text-surface-dim font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(255,215,0,0.25)] rounded-xl"
                >
                  {t('UPGRADE PROTOCOL STATUS', 'PASSER AU STATUT PROFESSIONNEL')}
                </button>
                <button 
                  onClick={async () => {
                  try {
                    await addDoc(collection(db, 'support_applications'), {
                      userId: user?.uid, userEmail: user?.email,
                      type: 'SUPPORT_REQUEST', status: 'PENDING',
                      createdAt: serverTimestamp()
                    });
                    onNotify(t('APPLICATION SUBMITTED', 'CANDIDATURE SOUMISE'));
                  } catch(e) {
                    handleFirestoreError(e as any, OperationType.CREATE, 'support_applications');
                  }
                }}
                  className="px-8 py-4 border border-white/10 hover:border-white/30 text-white font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 rounded-xl transition-all"
                >
                  {t('CONTACT CONTROLLER', 'CONTACTER LE CONTRÔLEUR')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative min-h-screen">
      <PageHeader 
        titleWhite={t('The', 'Le')}
        titleAccent={t('Lounge', 'Salon')}
        description={t('ACCESS PRIVATE MARKET INSIGHTS, CONNECT WITH PROFESSIONAL PARTNERS, AND DISCOVER EXCLUSIVE INVITATION-ONLY CREATIVE EVENTS.', 'ACCÉDEZ À DES INFORMATIONS DE MARCHÉ PRIVÉES, CONNECTEZ-VOUS AVEC DES PARTENAIRES PROFESSIONNELS ET DÉCOUVREZ DES ÉVÉNEMENTS CRÉATIFS EXCLUSIFS SUR INVITATION UNIQUEMENT.')}
        accentColor="text-accent-gold"
      />

      {/* LYA Elite Quantum Passport Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 to-surface-dim border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl group animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="absolute inset-0 bg-accent-gold/[0.01] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-gold/5 blur-3xl rounded-full opacity-50 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-cyan/[0.03] blur-2xl rounded-full pointer-events-none" />
        
        {/* Left Side: Avatar and Elite Member Passport */}
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-accent-gold via-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center p-[2px] shadow-[0_0_30px_rgba(255,215,0,0.2)] group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full bg-surface-dim rounded-[14px] flex items-center justify-center overflow-hidden">
                <Crown className="text-accent-gold text-3xl animate-pulse" size={28} />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface-dim flex items-center justify-center font-black italic shadow-lg text-white text-[10px]">✓</span>
          </div>

          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="px-3 py-0.5 bg-accent-gold/15 border border-accent-gold/40 rounded text-[10px] font-black font-mono tracking-widest text-accent-gold">VERIFIED ELITE PRO V3</span>
              <span className="text-xs font-mono font-bold text-on-surface-variant/40">NODE_REF_399x</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-white uppercase italic">
              {user?.displayName || 'LYA_CORE_VIP'}
            </h3>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5 opacity-60">
              <span className="inline-block w-1.5 h-1.5 bg-accent-gold animate-pulse rounded-full" />
              {t('ACTIVE BIOMETRIC NODE DEPLOYED', 'NŒUD BIOMÉTRIQUE ACTIF SÉCURISÉ')}
            </p>
          </div>
        </div>

        {/* Center: Live télémétrie certifiée block */}
        <div className="hidden xl:flex items-center gap-8 font-mono border-x border-white/5 px-10">
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest">ENCRYPTION ENERGETICS</span>
            <span className="text-xs text-primary-cyan block font-black leading-none">AES-GCM-256</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest">VAULT LAYER STATUS</span>
            <span className="text-xs text-accent-gold block font-black leading-none">ROOT_MUTABLE_CY</span>
          </div>
        </div>

        {/* Right Side: Interactive Biometric Refresh sensor */}
        <div className="flex flex-col items-center sm:flex-row gap-6 w-full lg:w-auto shrink-0 z-10 justify-end">
          {/* Quick numbers */}
          <div className="flex gap-4 border-l border-white/5 pl-4">
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant opacity-45 uppercase tracking-widest block">{t('Verified Members', 'Membres')}</span>
              <span className="text-lg font-black text-white">1,248</span>
            </div>
            <div className="text-right border-l border-white/5 pl-4">
              <span className="text-[10px] text-on-surface-variant opacity-45 uppercase tracking-widest block">{t('Power Staked', 'Staké')}</span>
              <span className="text-lg font-black text-accent-gold">85.4M <span className="text-xs opacity-40">LYA</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setBiometricScanning(true);
                onNotify(t('RE-STABILIZING PROFESSIONAL CRYPTOGRAPHIC HANDSHAKE...', 'RÉ-ALIGNEMENT DE LA SIGNATURE DE SÉCURITÉ DU SALON...'));
                setTimeout(() => {
                  setBiometricScanning(false);
                  onNotify(t('ELITE CUSTODY CREDENTIALS RE-STABILIZED [SECURE_NODE_99x]', 'CONFORME À L\'INDICE D\'ÉLITE - SIGNATURE RE-SÉCURISÉE [SECURE_NODE_99x]'));
                }, 1500);
              }}
              disabled={biometricScanning}
              className={`px-5 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center gap-2 ${
                biometricScanning ? 'bg-primary-cyan/15 border-primary-cyan text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.2)]' : 'bg-white/5 border-white/10 text-white hover:border-accent-gold hover:text-accent-gold hover:bg-accent-gold/5'
              }`}
            >
              <Fingerprint size={14} className={biometricScanning ? 'animate-pulse' : ''} />
              {biometricScanning ? t('Biometric scanning...', 'Scan Biométrique...') : t('REFRESH CUSTODY PASS', 'VÉRIFIER LE PASSPORT LYA')}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 mb-12">
        <nav className="flex border-b border-white/5 relative mt-6 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 -mx-6 px-6 md:mx-12 md:px-0">
          <div className="flex min-w-max gap-6 md:gap-12">
            {[
              { id: 'FEED', label: t('Insight Feed', 'Flux d\'Insights'), icon: <Activity size={16} /> },
              { id: 'MEMBERS', label: t('Protocol Member', 'MEMBRES PROTOCOLE'), icon: <Users size={16} /> },
              { id: 'EVENTS', label: t('Private Events', 'Événements Privés'), icon: <Calendar size={16} /> },
              { id: 'MENTORSHIP', label: t('Elite Mentorship', 'Mentorat d\'Élite'), icon: <Crown size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LoungeTab)}
                className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3 transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-primary-cyan italic' : 'text-on-surface-variant/40 hover:text-on-surface-variant'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" 
                  />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'FEED' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-12"
              >
                {/* News Feed Banner */}
                <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/10 italic">
                  <div className="absolute inset-0">
                    {monitorImage && (
                      <img 
                        src={monitorImage} 
                        alt="Creative News Header" 
                        className="w-full h-full object-cover origin-center transition-transform duration-[10s] group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent" />
                    <div className="absolute inset-0 bg-accent-gold/10 mix-blend-overlay" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-10 md:p-14 z-20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-accent-gold text-surface-dim text-[10px] font-black uppercase tracking-[0.3em] rounded-md">EXCLUSIVE</div>
                      <span className="text-[10px] text-white font-black uppercase tracking-[0.4em] opacity-60">{t('MARKET PULSE', 'POULS DU MARCHÉ')}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                      {t('CREATIVE', 'CRÉATIF')} <span className="bg-gradient-to-r from-accent-gold via-white to-accent-gold bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{t('INSIGHTS MONITOR', 'MONITEUR D\'INSIGHTS')}</span>
                    </h2>
                    <div className="flex flex-wrap gap-6 mt-8">
                      <div className="flex flex-col cursor-pointer group/stat" onClick={() => onNotify('DEPTH DATA — ' + t('Live data active', 'Données live actives'))}>
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">{t('Global Volume', 'Volume Global')}</span>
                        <span className="text-xl font-black text-white tracking-tighter group-hover/stat:text-accent-gold transition-colors">${pulseStats.volume} <span className="text-[10px] text-emerald-400 ml-1">{pulseStats.volumeTrend}</span></span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-6 cursor-pointer group/stat" onClick={() => onNotify('SECTOR ANALYSIS — ' + t('Live data active', 'Données live actives'))}>
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">{t('Top Sector', 'Meilleur Secteur')}</span>
                        <span className="text-xl font-black text-white tracking-tighter uppercase group-hover/stat:text-accent-gold transition-colors">{t(pulseStats.topSector, pulseStats.topSector)}</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-6 cursor-pointer group/stat" onClick={() => onNotify('VOLATILITY TRACE — ' + t('Live data active', 'Données live actives'))}>
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">{t('Volatility Index', 'Indice de Volatilité')}</span>
                        <span className="text-xl font-black text-white tracking-tighter uppercase text-primary-cyan group-hover/stat:text-accent-gold transition-colors">{t(pulseStats.volatility, pulseStats.volatility)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                    <div className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1">{t('MARKET TREND', 'TENDANCE DU MARCHÉ')}</div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-md">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span className="text-xs font-black text-white">{pulseStats.trend}</span>
                    </div>
                  </div>
                </div>

                {/* Active Identity & Post Input */}
                <div className="glass-panel p-8 md:p-10 rounded-[2rem] border-white/10 group focus-within:border-primary-cyan/30 transition-all shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shadow-inner group-hover:border-accent-gold transition-all duration-500">
                    <ShieldCheck className="text-accent-gold" size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-1 opacity-50">{t('ACTIVE IDENTITY', 'IDENTITÉ ACTIVE')}</p>
                    <p className="text-lg font-black text-white tracking-tighter underline decoration-accent-gold/30">
                      ID-{user?.displayName?.toUpperCase().replace(/\s/g, '_') || 'USER.LYA_CORE_JB'}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <button 
                    onClick={() => onNotify(t('NODE SYNCHRONIZED', 'NŒUD SYNCHRONISÉ'))}
                    className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-md transition-all group/node"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('NODE ACTIVE', 'NŒUD ACTIF')}</span>
                  </button>
                  <button 
                    onClick={() => onNotify(t('PRO PANEL ACTIVE', 'PANNEAU PRO ACTIF'))}
                    className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 hover:border-accent-gold/30 backdrop-blur-md transition-all"
                  >
                    <Settings size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('MANAGE', 'GÉRER')}</span>
                  </button>
                </div>
              </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                        <Zap className="text-accent-purple" size={20} />
                      </div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                        {t('ENCRYPTED BROADCASTING AS', 'DIFFUSION CHIFFRÉE EN TANT QUE')} <span className="text-white">GLOBAL INDEX</span>
                      </p>
                    </div>
                    <textarea 
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder={t('Share an elite insight or professional intelligence...', 'Partagez un insight d\'élite ou une intelligence professionnelle...')}
                      className="w-full bg-black/20 border border-white/10 rounded-2xl p-8 text-base font-medium focus:border-primary-cyan/50 outline-none transition-all min-h-[160px] resize-none placeholder:text-on-surface-variant/20 italic"
                    />
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-6 pl-2">
                        <button className="text-on-surface-variant/40 hover:text-primary-cyan transition-all hover:scale-110"><ImageIcon size={22} /></button>
                        <button className="text-on-surface-variant/40 hover:text-primary-cyan transition-all hover:scale-110"><Globe size={22} /></button>
                        <button className="text-on-surface-variant/40 hover:text-primary-cyan transition-all hover:scale-110"><Zap size={22} /></button>
                      </div>
                      <button 
                        onClick={handlePostInsight}
                        disabled={!postContent.trim()}
                        className="px-12 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(0,224,255,0.3)] disabled:opacity-30"
                      >
                        {t('BROADCAST INSIGHT', 'DÉPLOYER INSIGHT')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feed Posts */}
                <div className="space-y-10">
                  {posts.map((post) => (
                    <motion.div 
                      key={post.id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-panel p-8 md:p-12 rounded-[2.5rem] hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.25rem] bg-surface-low border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:border-primary-cyan/50 transition-all">
                            {post.id === '1' ? <Globe className="text-primary-cyan" size={32} /> : post.id === '2' ? <Zap className="text-accent-purple" size={32} /> : <Scale className="text-emerald-400" size={32} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{post.author}</h4>
                              {post.verified && <CheckCircle2 size={16} className="text-primary-cyan" />}
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] font-black text-primary-cyan uppercase tracking-widest">{post.role}</p>
                              <span className="w-1 h-1 bg-white/10 rounded-full" />
                              <span className="text-[10px] font-mono text-on-surface-variant font-medium opacity-40">{post.handle}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant/40 pt-1">{post.time}</span>
                      </div>

                      <p className="text-lg md:text-xl text-on-surface/90 leading-relaxed mb-10 font-serif italic opacity-80">
                        "{post.content}"
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div className="flex items-center gap-10">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-3 transition-all active:scale-90 ${likedPosts.has(post.id) ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'}`}
                          >
                            <div className={`p-2.5 rounded-xl transition-all ${likedPosts.has(post.id) ? 'bg-primary-cyan/10 shadow-[0_0_20px_rgba(0,224,255,0.2)]' : 'bg-white/5'}`}>
                              <Star size={20} className={likedPosts.has(post.id) ? 'fill-primary-cyan' : ''} />
                            </div>
                            <span className="text-xs font-black italic">{post.likes}</span>
                          </button>
                          <button 
                            onClick={() => onNotify(t('COMMENTS — FEATURE COMING SOON', 'COMMENTAIRES — FONCTIONNALITÉ PROCHAINEMENT'))}
                            className="flex items-center gap-3 text-on-surface-variant hover:text-white transition-all group/btn"
                          >
                            <div className="p-2.5 rounded-xl bg-white/5 group-hover/btn:bg-white/10 transition-all">
                              <MessageSquare size={20} />
                            </div>
                            <span className="text-xs font-black italic">{post.comments}</span>
                          </button>
                          <button 
                            onClick={() => handlePin(post.id)}
                            className={`p-2.5 rounded-xl transition-all border border-transparent ${pinnedPosts.has(post.id) ? 'text-accent-gold bg-accent-gold/10 border-accent-gold/20' : 'text-on-surface-variant hover:text-accent-gold hover:bg-accent-gold/5'}`}
                          >
                            <Pin size={20} className={pinnedPosts.has(post.id) ? 'fill-accent-gold' : ''} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.tags.map(tag => (
                            <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/10 text-xs font-black text-on-surface-variant uppercase tracking-widest rounded-full opacity-60 hover:opacity-100 transition-opacity">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'MEMBERS' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  {members.slice(0, visibleMembers).map((member) => (
                    <div key={member.id} className="bg-surface-low/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-surface-low/50 transition-all group relative overflow-hidden">
                      <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-low border border-white/10 flex items-center justify-center relative shrink-0 shadow-xl overflow-hidden group-hover:border-primary-cyan/50 transition-all duration-500">
                          <img 
                            src={`https://i.pravatar.cc/300?u=${member.handle}`} 
                            alt="" 
                            className={`w-full h-full object-cover rounded-xl transition-all duration-1000 ${viewedDossiers.has(member.id) ? 'blur-0' : 'blur-2xl grayscale'}`} 
                            referrerPolicy="no-referrer"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-dim ${member.statusColor}`} />
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter truncate max-w-[150px] sm:max-w-none">
                              {viewedDossiers.has(member.id) ? member.name : generateProfessionalId(member.id)}
                            </h4>
                            <div className="opacity-50 scale-75 shrink-0">{member.roleIcon}</div>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] font-mono font-bold text-primary-cyan uppercase tracking-widest opacity-40">{viewedDossiers.has(member.id) ? member.handle : 'ENCRYPTED_ID'}</span>
                             <span className="w-1 h-1 rounded-full bg-white/10" />
                             <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 italic">{member.industry}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-1 opacity-40">{t('Status', 'Statut')}</p>
                          <p className={`text-[10px] font-black italic uppercase ${member.statusColor.replace('bg-', 'text-')}`}>{t(member.status, member.status === 'ACTIVE' ? 'ACTIF' : member.status === 'BUSY' ? 'OCCUPÉ' : member.status === 'OFFLINE' ? 'HORS LIGNE' : 'EN ÉVALUATION')}</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] font-black text-accent-gold uppercase tracking-[0.3em] mb-1 opacity-40">{t('Verification', 'Vérification')}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-white italic">{t('LVL', 'NIV')} {Math.floor(Math.random() * 5) + 5}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleViewDossier(member.id, member.name)}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                              viewedDossiers.has(member.id) ? 'bg-primary-cyan/10 border-primary-cyan/20 text-primary-cyan' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                            }`}
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (!viewedDossiers.has(member.id)) {
                                onNotify(t('ACCESS DENIED. DECRYPT DOSSIER FIRST.', 'ACCÈS REFUSÉ. DÉCRYPTER LE DOSSIER D\'ABORD.'));
                                return;
                              }
                              handleInitiateContact(member.name, member.role);
                            }}
                            className={`px-6 py-3 rounded-xl font-black text-xs uppercase italic tracking-[0.2em] transition-all ${
                              viewedDossiers.has(member.id) ? 'bg-white text-surface-dim hover:bg-primary-cyan' : 'bg-white/5 text-white/10 cursor-not-allowed'
                            }`}
                          >
                            {t('Contact', 'CONTACT')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setVisibleMembers(prev => prev + 10)}
                    className="px-10 py-4 bg-white/5 border border-white/10 text-xs font-black uppercase italic tracking-[0.4em] text-white hover:bg-white/10 transition-all rounded-xl"
                  >
                    {t('ACCESS MORE HUBS', 'ACCÉDER À PLUS DE HUBS')}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'EVENTS' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid grid-cols-1 gap-12"
              >
                {events.slice(0, visibleEvents).map((event) => (
                  <div key={event.id} className="glass-panel border-white/10 rounded-[3rem] overflow-hidden group hover:border-accent-gold/40 transition-all duration-1000 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative flex flex-col lg:flex-row">
                    <div className="relative lg:w-2/5 h-80 lg:h-auto overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] grayscale-[0.6] group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-dim via-surface-dim/20 to-transparent" />
                      
                      <div className="absolute top-10 left-10 flex flex-col gap-4">
                        <span className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl backdrop-blur-xl border border-white/20 ${
                          event.type === 'GALA' ? 'bg-accent-gold/80 text-surface-dim border-accent-gold/50' : 
                          event.type === 'ROUNDTABLE' ? 'bg-accent-purple/80' : 
                          'bg-primary-cyan/80 text-surface-dim'
                        }`}>
                          {event.type}
                        </span>
                        <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border backdrop-blur-xl ${
                          event.status === 'OPEN' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                          'bg-accent-gold/20 border-accent-gold/40 text-accent-gold'
                        }`}>
                          {event.status === 'OPEN' ? t('ADMISSIONS OPEN', 'ADMISSIONS OUVERTES') : event.status}
                        </div>
                      </div>
                    </div>

                    <div className="p-10 md:p-14 lg:w-3/5 flex flex-col justify-between space-y-12 bg-white/[0.01]">
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-6 group-hover:text-accent-gold transition-colors duration-700">
                            {event.title}
                          </h3>
                          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-serif italic opacity-70 max-w-xl text-justify">
                            "{event.description}"
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">{t('SESSION HIGHLIGHTS', 'POINTS FORTS')}</p>
                            <div className="flex flex-wrap gap-3">
                              {event.highlights.map((h, i) => (
                                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:border-accent-gold/30 group-hover:text-white transition-all">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">{t('DISTINGUISHED SPEAKERS', 'INTERVENANTS')}</p>
                            <div className="flex items-center gap-5">
                              {event.speakers.map((s, i) => (
                                <div key={i} className="group/speaker relative">
                                  <img src={s.avatar} alt={s.name} className="w-14 h-14 rounded-2xl border-2 border-white/10 group-hover/speaker:border-accent-gold group-hover/speaker:scale-110 transition-all duration-500" />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary-cyan border-2 border-surface-dim opacity-0 group-hover/speaker:opacity-100 transition-opacity" />
                                </div>
                              ))}
                              <div className="w-14 h-14 rounded-2xl border-2 border-white/10 bg-surface-low flex items-center justify-center text-[10px] font-black text-white/40">
                                +{event.attendees}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-accent-gold" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users size={18} className="text-accent-gold" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">{event.slots} {t('REMAINING', 'RESTANTS')}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRequestAdmission(event.id, event.title)}
                          disabled={event.status === 'FULL' || admissionsRequested.has(event.id)}
                          className={`w-full md:w-auto px-12 py-5 font-black uppercase italic tracking-[0.4em] text-[11px] rounded-2xl transition-all duration-700 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.5)] group/btn relative overflow-hidden ${
                            event.status === 'FULL' || admissionsRequested.has(event.id) 
                              ? 'bg-emerald-500 text-surface-dim opacity-50' 
                              : 'bg-white text-surface-dim hover:bg-accent-gold'
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-4 justify-center">
                            {admissionsRequested.has(event.id) ? (
                              <>
                                <CheckCircle2 size={18} />
                                {t('REQUEST SENT', 'DEMANDE ENVOYÉE')}
                              </>
                            ) : (
                              <>
                                {event.status === 'WAITLIST' ? t('JOIN WAITLIST', 'REJOINDRE LISTE D\'ATTENTE') : t('REQUEST ADMISSION', 'DEMANDER ADMISSION')} 
                                <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {visibleEvents < events.length && (
                  <div className="flex justify-center pt-8">
                    <button 
                      onClick={() => setVisibleEvents(prev => prev + 5)}
                      className="px-12 py-5 bg-white text-surface-dim font-black uppercase italic tracking-[0.4em] text-[11px] rounded-2xl hover:bg-accent-gold transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95"
                    >
                      {t('LOAD MORE EVENTS', 'CHARGER PLUS D\'ÉVÉNEMENTS')}
                    </button>
                  </div>
                )}
            </motion.div>
          )}

            {activeTab === 'MENTORSHIP' && (
              <motion.div
                key="mentorship"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                {/* Active Conversations Section */}
                {conversations.length > 0 && (
                  <section className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <MessageSquare size={100} className="text-accent-gold" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                      <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                      {t('ACTIVE MENTOR CONVERSATIONS', 'CONVERSATIONS DE MENTORAT ACTIVES')}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {conversations.map((conv) => (
                        <div 
                          key={conv.id} 
                          onClick={() => handleInitiateContact(conv.name, conv.role)}
                          className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-accent-gold/40 transition-all cursor-pointer group/conv flex items-center justify-between"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-surface-high border border-white/10 overflow-hidden p-1">
                              <img src={`https://i.pravatar.cc/100?u=${conv.name}`} alt="" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase italic truncate max-w-[150px]">{conv.name}</p>
                              <p className="text-xs text-accent-gold font-black uppercase tracking-widest">{conv.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-on-surface-variant font-bold uppercase opacity-40">{conv.time}</p>
                             <div className="mt-2 flex items-center gap-2 justify-end text-primary-cyan opacity-0 group-hover/conv:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('RESUME', 'REPRENDRE')}</span>
                                <ArrowRight size={12} />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {mentors.slice(0, visibleMentors).map((mentor) => (
                    <div key={mentor.id} className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-accent-gold/40 transition-all group relative overflow-hidden shadow-2xl">
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-surface-low border border-white/10 group-hover:border-accent-gold transition-all duration-700 relative shadow-xl overflow-hidden p-1">
                            <img 
                              src={mentor.avatar} 
                              alt="" 
                              className={`w-full h-full object-cover rounded-xl transition-all duration-1000 ${viewedMentors.has(mentor.id) ? 'blur-0' : 'blur-3xl grayscale'}`} 
                              referrerPolicy="no-referrer"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-surface-dim ${mentor.availability === 'AVAILABLE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-accent-gold shadow-[0_0_15px_rgba(238,192,94,0.5)]'}`} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-accent-gold transition-colors">
                              {viewedMentors.has(mentor.id) ? mentor.name : generateProfessionalId(mentor.id)}
                            </h4>
                            <div className="flex items-center gap-2">
                               <Crown size={12} className="text-accent-gold/60" />
                               <span className="text-xs text-accent-gold font-black uppercase tracking-widest italic">{mentor.role}</span>
                            </div>
                          </div>
                        </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleInitiateContact(mentor.name, 'Elite Mentor');
                                 }}
                                 className="p-2 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold rounded-lg hover:bg-accent-gold hover:text-surface-dim transition-all"
                                 title={t('Send Secure Message', 'Envoyer un Message Sécurisé')}
                               >
                                 <Send size={14} />
                               </button>
                               <div className="bg-accent-gold/10 border border-accent-gold/20 px-3 py-2 rounded-xl text-center">
                                  <p className="text-[7px] font-black text-accent-gold uppercase tracking-widest mb-1 opacity-50">Impact</p>
                                  <p className="text-sm font-black text-white italic tracking-tighter">ELITE</p>
                               </div>
                            </div>
                      </div>

                      <div className="space-y-6 relative z-10">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight italic opacity-70 leading-relaxed min-h-[40px] text-justify">
                            {mentor.specialty}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/5 transition-colors group-hover:border-accent-gold/10">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Sessions</p>
                              <p className="text-base font-black text-white italic">{mentor.sessions}+</p>
                           </div>
                           <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/5 transition-colors group-hover:border-accent-gold/10">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Status</p>
                              <p className={`text-base font-black italic ${mentor.availability === 'AVAILABLE' ? 'text-emerald-400 font-headline' : 'text-accent-gold'}`}>{mentor.availability}</p>
                           </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (!viewedMentors.has(mentor.id)) {
                              handleViewMentor(mentor.id, mentor.name);
                            } else {
                              handleInitiateContact(mentor.name, 'Elite Mentor');
                            }
                          }}
                          className={`w-full py-4 text-[10px] font-black uppercase italic tracking-[0.3em] rounded-xl transition-all shadow-xl active:scale-95 ${
                            mentor.availability === 'AVAILABLE'
                            ? 'bg-white text-surface-dim hover:bg-accent-gold hover:translate-y-[-2px]'
                            : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/10'
                          }`}
                        >
                          {!viewedMentors.has(mentor.id) 
                            ? t('DECRYPT IDENTITY', 'DÉCRYPTER') 
                            : conversations.find(c => c.name === mentor.name)
                              ? t('RESUME CONVERSATION', 'REPRENDRE LA CONVERSATION')
                              : t('INITIATE MENTORSHIP', 'INITIER LE MENTORAT')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleMentors < mentors.length && (
                  <div className="flex justify-center mt-12 pb-8">
                     <button 
                       onClick={() => setVisibleMentors(prev => prev + 6)}
                       className="px-10 py-4 bg-white text-surface-dim font-black uppercase italic tracking-[0.3em] text-[10px] rounded-xl hover:bg-accent-gold transition-all shadow-2xl active:scale-95"
                     >
                       {t('LOAD MORE MENTORS', 'CHARGER PLUS DE MENTORS')}
                     </button>
                  </div>
                )}
                <div className="bg-gradient-to-br from-indigo-900/20 to-surface-low border border-white/5 p-12 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Award size={150} className="text-primary-cyan" />
                  </div>
                  <div className="max-w-2xl relative z-10">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6">{t('Elite Education Protocol', 'Protocole d\'Éducation d\'Élite')}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-medium italic opacity-70 text-justify">
                      {t('Our mentorship program connects emerging creators with the architects of the creative economy. Access exclusive insights, direct feedback, and market growth strategies.', 'Notre programme de mentorat relie les créateurs émergents aux architectes de l\'économie créative. Accédez à des perspectives exclusives, des commentaires directs et des stratégies de croissance du marché.')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs text-white/80 font-bold uppercase tracking-wider">{t('Priority Access to Private Rounds', 'Accès Prioritaire aux Rounds Privés')}</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs text-white/80 font-bold uppercase tracking-wider">{t('Direct Strategic Feedback', 'Feedback Stratégique Direct')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-12">
          {/* Privacy & Topics Bento */}
          <div className="glass-panel p-10 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheck size={120} className="text-primary-cyan" />
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                <EyeOff size={24} />
              </div>
              <h4 className="text-base font-black text-white uppercase tracking-[0.3em] italic">{t('SECURE PRIVACY LAYER', 'COUCHE DE CONFIDENTIALITÉ SÉCURISÉE')}</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-10 font-medium italic opacity-70 text-justify">
              {t('Your creation identity is currently shielded to prioritize projects over creators. Only verified Elite Mentors can initiate direct project deep-dives.', 'Votre identité de création est actuellement protégée pour privilégier les projets par rapport aux créateurs. Seuls les mentors élites vérifiés peuvent initier des analyses approfondies directes du projet.')}
            </p>
            <div className="flex items-center gap-4 px-6 py-4 bg-primary-cyan/10 border border-primary-cyan/20 rounded-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-cyan animate-pulse shadow-[0_0_15px_rgba(0,224,255,0.5)]" />
              <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest">{t('ENTITY SHIELD ACTIVE', 'BOUCLIER D\'ENTITÉ ACTIF')}</span>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[2.5rem] border-white/10">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-base font-black text-white uppercase tracking-[0.3em] italic">{t('INTELLIGENCE', 'INTELLIGENCE')}</h4>
              </div>
              <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest opacity-40 italic">LIVE FEED</span>
            </div>
            <div className="space-y-8">
              {trendingTopics.slice(0, visibleTopics).map((topic, i) => (
                <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-primary-cyan transition-colors">#{topic.tag}</p>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-30">{topic.insights} {t('SECURE INSIGHTS', 'INSIGHTS SÉCURISÉS')}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${topic.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {topic.trend}
                  </div>
                </div>
              ))}
            </div>
            {visibleTopics < trendingTopics.length && (
              <button 
                onClick={() => setVisibleTopics(prev => prev + 4)}
                className="w-full mt-12 py-5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary-cyan hover:bg-white/5 transition-all italic"
              >
                {t('DOWNLOAD FULL REGISTRY', 'TÉLÉCHARGER LE REGISTRE')}
              </button>
            )}
          </div>

          <div className="p-12 bg-gradient-to-br from-indigo-900/40 to-surface-low border border-white/5 rounded-[3rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Award size={100} className="text-primary-cyan" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">{t('ELITE MENTORSHIP', 'MENTORAT D\'ÉLITE')}</h4>
            <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-12 font-medium italic text-justify">
              {t('Strategic 1-on-1 sessions with professional market makers and Grammy-winning legacy curators.', 'Sessions stratégiques 1-sur-1 avec des teneurs de marché professionnels et des conservateurs de patrimoine récompensés aux Grammy.')}
            </p>
            <button 
              onClick={() => {
                onNotify(t('OPENING MENTORSHIP APPLICATION PORTAL...', 'OUVERTURE DU PORTAIL DE DEMANDE DE MENTORAT...'));
                if (onViewChange) onViewChange('APPLY_VERIFICATION');
              }}
              className="w-full py-5 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.3em] text-[11px] rounded-2xl hover:bg-white transition-all shadow-[0_15px_30px_rgba(0,224,255,0.2)]"
            >
              {t('APPLY FOR VERIFICATION', 'DEMANDER VÉRIFICATION')}
            </button>
          </div>
        </div>
        {showMail && selectedRecipient && (
          <SecureMail 
            isOpen={showMail}
            recipient={selectedRecipient} 
            onClose={() => setShowMail(false)} 
            onSend={() => onNotify(t('MAIL SUCCESSFULLY DISPATCHED TO THE INSTITUTIONAL NETWORK.', 'COURRIEL ENVOYÉ AVEC SUCCÈS AU RÉSEAU INSTITUTIONNEL.'))}
          />
        )}
      </div>
    </div>
  );
};
