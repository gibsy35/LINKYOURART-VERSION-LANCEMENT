
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

  // Fetch posts from Firestore
  React.useEffect(() => {
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
  }, [t]);

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
      
      onNotify(isLiked ? 'INSIGHT UNLIKED' : 'INSIGHT LIKED');
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

    onNotify(isPinned ? 'INSIGHT UNPINNED FROM PROFILE' : 'INSIGHT PINNED TO PROFILE');
  };

  const members: (Member & { hasPremium?: boolean, isUnlocked?: boolean })[] = [
    { id: '1', name: 'Julian Vane', handle: '@LYA_CORE', role: 'CORE_FOUNDER', industry: 'Creative Economy', status: 'ACTIVE', roleIcon: <Crown className="text-accent-gold" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '2', name: 'Elena Vance', handle: '@VANCE_CAPITAL', role: 'LEGACY_CURATOR', industry: 'Venture Capital', status: 'ON_VALUATION', roleIcon: <Globe className="text-primary-cyan" size={20} />, statusColor: 'bg-accent-pink', hasPremium: true },
    { id: '3', name: 'Aurelius Art', handle: '@AURELIUS_ART', role: 'MASTER_CURATOR', industry: 'Museum Assets', status: 'ACTIVE', roleIcon: <Zap className="text-accent-purple" size={20} />, statusColor: 'bg-emerald-500', hasPremium: false },
    { id: '4', name: 'Sarah Jenkins', handle: '@JENKINS_LEGAL', role: 'LEGAL_AUDITOR', industry: 'IP Law', status: 'OFFLINE', roleIcon: <ShieldCheck className="text-emerald-400" size={20} />, statusColor: 'bg-slate-500', hasPremium: true },
    { id: '5', name: 'Chen Wei', handle: '@CHEN_DEV', role: 'SYSTEM_ARCHITECT', industry: 'Software Tech', status: 'BUSY', roleIcon: <Activity className="text-primary-cyan" size={20} />, statusColor: 'bg-accent-pink', hasPremium: false },
    { id: '6', name: 'Loren Smith', handle: '@LOREN_CURATOR', role: 'IP_STRATEGIST', industry: 'Music Industry', status: 'ACTIVE', roleIcon: <Users className="text-accent-gold" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '7', name: 'Marcus Thorne', handle: '@THORNE_STRAT', role: 'MARKET_MAKER', industry: 'Liquidity Pools', status: 'ACTIVE', roleIcon: <TrendingUp className="text-primary-cyan" size={20} />, statusColor: 'bg-emerald-500', hasPremium: false },
    { id: '8', name: 'Claire Dubois', handle: '@DUBOIS_VANTAGE', role: 'SENIOR_ADVISOR', industry: 'Heritage Arts', status: 'ON_VALUATION', roleIcon: <Eye className="text-accent-gold" size={20} />, statusColor: 'bg-accent-pink', hasPremium: true },
    { id: '9', name: 'JV CEO', handle: '@JV_CEO', role: 'SECURITY_OFFICER', industry: 'Cyber Security', status: 'ACTIVE', roleIcon: <Shield className="text-accent-purple" size={20} />, statusColor: 'bg-emerald-500', hasPremium: true },
    { id: '10', name: 'Quant Research', handle: '@QUANT_RESEARCH', role: 'ALGO_ANALYST', industry: 'Big Data', status: 'OFFLINE', roleIcon: <Cpu className="text-primary-cyan" size={20} />, statusColor: 'bg-slate-500', hasPremium: false }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Professional Art Market 2026',
      type: 'WEBINAR',
      date: 'TOMORROW, 14:00 GMT',
      host: 'Alpha Market Analysis',
      image: 'https://picsum.photos/seed/art-market/800/400',
      attendees: 126,
      slots: 24,
      description: 'An exclusive deep dive into the projected growth of the creative rights market for the next fiscal year.',
      highlights: ['Market Forecasts', 'Liquidity Analysis', 'Global Adoption'],
      speakers: [
        { name: 'Dr. Elena Vance', role: 'Chief Economist', avatar: 'https://i.pravatar.cc/150?u=elena' },
        { name: 'Marcus Thorne', role: 'Head of Strategy', avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '2',
      title: 'IP Rights in the Generative Era',
      type: 'ROUNDTABLE',
      date: 'FRIDAY, 18:00 GMT',
      host: 'Legal Protocol V2',
      image: 'https://picsum.photos/seed/ip-rights/800/400',
      attendees: 43,
      slots: 7,
      description: 'A closed-door discussion on the legal frameworks governing AI-generated creative projects.',
      highlights: ['Copyright Law', 'Neural Validation', 'Smart Contract IP'],
      speakers: [
        { name: 'Sarah Jenkins', role: 'IP Attorney', avatar: 'https://i.pravatar.cc/150?u=sarah' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '3',
      title: 'Elite Networking Gala',
      type: 'GALA',
      date: 'NEXT SATURDAY, 20:00 GMT',
      host: 'LYA Core',
      image: 'https://picsum.photos/seed/gala/800/400',
      attendees: 250,
      slots: 50,
      description: 'The premier social event for the creative economy expert community. Black tie required.',
      highlights: ['Networking', 'Live Performance', 'Exclusive Reveal'],
      speakers: [
        { name: 'Julian Vane', role: 'CEO, LinkYourArt', avatar: 'https://i.pravatar.cc/150?u=julian' }
      ],
      status: 'OPEN'
    },
    {
      id: '4',
      title: 'Private Auction: Legacy Series',
      type: 'PRIVATE AUCTION',
      date: 'MAY 12, 10:00 GMT',
      host: 'Sotheby\'s Digital',
      image: 'https://picsum.photos/seed/auction/800/400',
      attendees: 12,
      slots: 5,
      description: 'Bidding on ultra-rare legacy creative rights from the early 20th century.',
      highlights: ['Rare Assets', 'Provenance Check', 'Instant Settlement'],
      speakers: [
        { name: 'Claire Dubois', role: 'Senior Curator', avatar: 'https://i.pravatar.cc/150?u=claire' }
      ],
      status: 'OPEN'
    },
    {
      id: '5',
      title: 'Neural Canvas Masterclass',
      type: 'WORKSHOP',
      date: 'JUNE 4, 15:00 GMT',
      host: 'Lya Academy',
      image: 'https://picsum.photos/seed/neural/800/400',
      attendees: 85,
      slots: 15,
      description: 'Technical workshop on implementing the LYA-721 standard for neural-generated assets.',
      highlights: ['Code Review', 'Standard Validation', 'Deployment'],
      speakers: [
        { name: 'Chen Dev', role: 'Lead Architect', avatar: 'https://i.pravatar.cc/150?u=chen' }
      ],
      status: 'OPEN'
    },
    {
      id: '6',
      title: 'Global Settlement Summit',
      type: 'SUMMIT',
      date: 'JULY 20-22, 2026',
      host: 'LYA Foundation',
      image: 'https://picsum.photos/seed/summit/800/400',
      attendees: 500,
      slots: 100,
      description: 'The annual gathering of professional associates to define the future of the LYA settlement layer.',
      highlights: ['Protocol Roadmap', 'Regulatory Sync', 'DAO Voting'],
      speakers: [
        { name: 'Jean-Baptiste Lequime', role: 'Founder', avatar: 'https://i.pravatar.cc/150?u=jb' }
      ],
      status: 'OPEN'
    },
    {
      id: '7',
      title: 'Digital Rarity Roundtable',
      type: 'ROUNDTABLE',
      date: 'AUGUST 12, 18:00 GMT',
      host: 'Creative Index',
      image: 'https://picsum.photos/seed/rarity/800/400',
      attendees: 42,
      slots: 8,
      description: 'An expert panel discussion on valuing digital scarcity in a post-AI landscape.',
      highlights: ['Rarity Modeling', 'Auction Psychology', 'Market Microstructure'],
      speakers: [
        { name: 'Dr. Sarah Vance', role: 'Economist', avatar: 'https://i.pravatar.cc/150?u=sarah' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '8',
      title: 'Boutique IP Auction',
      type: 'PRIVATE AUCTION',
      date: 'SEPTEMBER 5, 20:00 GMT',
      host: 'Exclusive Partners',
      image: 'https://picsum.photos/seed/auction/800/400',
      attendees: 25,
      slots: 5,
      description: 'Private bidding for high-value cinematic IP rights and exclusive music catalogs.',
      highlights: ['Closed-door Bidding', 'Professional Escrow', 'IP Transfer'],
      speakers: [
        { name: 'Luc Gauthier', role: 'Chief Broker', avatar: 'https://i.pravatar.cc/150?u=luc' }
      ],
      status: 'WAITLIST'
    },
    {
      id: '9',
      title: 'Global IP Summit 2026',
      type: 'SUMMIT',
      date: 'OCTOBER 15-17, 2026',
      host: 'LYA World',
      image: 'https://picsum.photos/seed/summit-ip/800/400',
      attendees: 1200,
      slots: 300,
      description: 'The largest gathering of IP professionals and creative investors.',
      highlights: ['Policy Shifts', 'Tech Demos', 'Networking'],
      speakers: [
        { name: 'Dr. Sarah Vance', role: 'Policy Expert', avatar: 'https://i.pravatar.cc/150?u=sarah2' }
      ],
      status: 'OPEN'
    },
    {
      id: '10',
      title: 'Creative Rights Workshop',
      type: 'WORKSHOP',
      date: 'NOVEMBER 2, 14:00 GMT',
      host: 'Lya Academy',
      image: 'https://picsum.photos/seed/equity/800/400',
      attendees: 50,
      slots: 10,
      description: 'Hands-on training for valuing creative rights in early-stage projects.',
      highlights: ['Valuation Models', 'Risk Assessment', 'Exit Strategies'],
      speakers: [
        { name: 'Marcus Thorne', role: 'Head of Strategy', avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '11',
      title: 'Global Liquidity Roundtable',
      type: 'ROUNDTABLE',
      date: 'DECEMBER 5, 16:00 GMT',
      host: 'Capital Alpha',
      image: 'https://picsum.photos/seed/liquidity/800/400',
      attendees: 30,
      slots: 4,
      description: 'Discussion on professional exit strategies and liquidity pools.',
      highlights: ['Liquidity Pools', 'Exit Strategy', 'Market Making'],
      speakers: [
        { name: 'Marcus Thorne', role: 'Global Market Maker', avatar: 'https://i.pravatar.cc/150?u=m1' }
      ],
      status: 'OPEN'
    },
    {
      id: '12',
      title: 'Art Valuation Masterclass',
      type: 'WEBINAR',
      date: 'JANUARY 15, 2027',
      host: 'Creative Index',
      image: 'https://picsum.photos/seed/art-val/800/400',
      attendees: 200,
      slots: 0,
      description: 'Mastering the art of valuing non-fungible professional projects.',
      highlights: ['Valuation 101', 'Algorithm Intro', 'Case Studies'],
      speakers: [
        { name: 'Julian Vane', role: 'CEO', avatar: 'https://i.pravatar.cc/150?u=julian' }
      ],
      status: 'OPEN'
    }
  ];

  const mentors = [
    {
      id: 'm1',
      name: 'Marcus Thorne',
      role: 'Global Market Maker',
      specialty: 'Creative Liquidity & Valuation',
      avatar: 'https://i.pravatar.cc/300?u=m1',
      availability: 'AVAILABLE',
      sessions: 142,
      score: 992
    },
    {
      id: 'm2',
      name: 'Elena Vance',
      role: 'Grammy Legacy Curator',
      specialty: 'Intellectual Property Rights',
      avatar: 'https://i.pravatar.cc/300?u=m2',
      availability: 'FULL',
      sessions: 89,
      score: 978
    },
    {
      id: 'm3',
      name: 'Sarah Chen',
      role: 'Venture Architect',
      specialty: 'Web3 Monetization Models',
      avatar: 'https://i.pravatar.cc/300?u=m3',
      availability: 'AVAILABLE',
      sessions: 215,
      score: 985
    },
    {
      id: 'm4',
      name: 'David Rossi',
      role: 'IP Attorney',
      specialty: 'Cross-Border Licensing',
      avatar: 'https://i.pravatar.cc/300?u=m4',
      availability: 'AVAILABLE',
      sessions: 67,
      score: 964
    },
    {
      id: 'm5',
      name: 'Isabella Moretti',
      role: 'Luxury Branding Expert',
      specialty: 'High-End Market Positioning',
      avatar: 'https://i.pravatar.cc/300?u=m5',
      availability: 'AVAILABLE',
      sessions: 156,
      score: 972
    },
    {
      id: 'm6',
      name: 'Kenji Sato',
      role: 'Technology Strategist',
      specialty: 'AI & Generative IP',
      avatar: 'https://i.pravatar.cc/300?u=Kenji',
      availability: 'AVAILABLE',
      sessions: 204,
      score: 981
    },
    {
      id: 'm7',
      name: 'Aurelius Art',
      role: 'Master Curator',
      specialty: 'Fine Art Valuation',
      avatar: 'https://i.pravatar.cc/300?u=m7',
      availability: 'AVAILABLE',
      sessions: 312,
      score: 995
    },
    {
      id: 'm8',
      name: 'Sarah Jenkins',
      role: 'IP Attorney',
      specialty: 'Legal Frameworks',
      avatar: 'https://i.pravatar.cc/300?u=m8',
      availability: 'AVAILABLE',
      sessions: 95,
      score: 968
    },
    {
      id: 'm9',
      name: 'Julian Vane',
      role: 'CEO & Founder',
      specialty: 'Creative Economy Architecture',
      avatar: 'https://i.pravatar.cc/300?u=julian',
      availability: 'FULL',
      sessions: 450,
      score: 999
    },
    {
      id: 'm10',
      name: 'Claire Dubois',
      role: 'Art Historian & Strategist',
      specialty: 'Provenance & Rarity Engines',
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
    { tag: '#LYA-721 Standards', insights: 124, trend: '+12%' },
    { tag: '#EU Creative Rights', insights: 89, trend: '+45%' },
    { tag: '#Generative IP Rights', insights: 56, trend: '+8%' },
    { tag: '#Professional Liquidity', insights: 42, trend: '-5%' },
    { tag: '#Global Art Index', insights: 38, trend: '+22%' },
    { tag: '#Tokenized Cinema', insights: 31, trend: '+15%' },
    { tag: '#Smart IP Contracts', insights: 27, trend: '+10%' }
  ];

  // Access Control: Only Admin or Pro users can access the Lounge
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        >
          <Lock size={48} className="text-red-500" />
        </motion.div>
        <h2 className="text-2xl md:text-4xl font-black font-headline uppercase text-on-surface mb-6 tracking-tighter">
          {t('Lounge Access Restricted', 'Accès au Salon Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('The Pro Lounge is an exclusive digital space for verified experts and professional associates. Upgrade to Professional to join the conversation.', 'Le Salon Pro est un espace numérique exclusif pour les experts vérifiés et les partenaires professionnels. Passez au Professionnel pour rejoindre la conversation.')}
        </p>
        <button 
          onClick={() => onNotify('Redirecting to Pricing...')}
          className="px-10 py-5 bg-accent-gold text-surface-dim font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(255,215,0,0.2)]"
        >
          {t('Upgrade to Professional', 'Passer au Professionnel')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Creative', 'CRÉATIF')}
        titleAccent={t('Lounge', 'LOUNGE')}
        description={t('ACCESS PRIVATE MARKET INSIGHTS, CONNECT WITH PROFESSIONAL PARTNERS, AND DISCOVER EXCLUSIVE INVITATION-ONLY CREATIVE EVENTS.', 'ACCÉDEZ À DES INFORMATIONS DE MARCHÉ PRIVÉES, CONNECTEZ-VOUS AVEC DES PARTENAIRES PROFESSIONNELS ET DÉCOUVREZ DES ÉVÉNEMENTS CRÉATIFS EXCLUSIFS SUR INVITATION UNIQUEMENT.')}
        accentColor="text-accent-gold"
      />

      <div className="mb-12 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <div className="h-px w-8 bg-accent-gold/40"></div>
        <span className="text-[10px] font-bold text-accent-gold tracking-[0.5em] uppercase italic">LYA UNITS ARE INDEXED</span>
        <div className="h-px flex-1 bg-gradient-to-r from-accent-gold/20 to-transparent"></div>
      </div>

      <div className="relative z-20 lg:-mt-24 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-6 md:gap-8 px-6 md:px-12">
          <div className="hidden lg:block mr-auto">
            <div className="text-[10px] font-black text-accent-gold uppercase tracking-[0.5em] opacity-40 animate-pulse">LYA UNITS ARE INDEXED</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none px-6 md:px-8 py-4 md:py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Verified Members', 'Membres Vérifiés')}</div>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">1,248</div>
            </div>
            <div className="flex-1 lg:flex-none px-6 md:px-8 py-4 md:py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Power Staked', 'Pouvoir Staké')}</div>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">85.4M <span className="text-xs opacity-40">LYA</span></div>
            </div>
          </div>
        </div>

        <nav className="flex border-b border-white/5 relative mt-12 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 -mx-6 px-6 md:mx-12 md:px-0">
          <div className="flex min-w-max gap-6 md:gap-12">
            {[
              { id: 'FEED', label: t('Insight Feed', 'Flux d\'Insights'), icon: <Activity size={16} /> },
              { id: 'MEMBERS', label: t('Protocol Member', 'PROTOCOL MEMBER'), icon: <Users size={16} /> },
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 md:px-12">
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
                      <span className="text-[10px] text-white font-black uppercase tracking-[0.4em] opacity-60">MARKET PULSE</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                      CREATIVE <span className="bg-gradient-to-r from-accent-gold via-white to-accent-gold bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">INSIGHTS MONITOR</span>
                    </h2>
                    <div className="flex flex-wrap gap-6 mt-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60">Global Volume</span>
                        <span className="text-xl font-black text-white italic tracking-tighter">${pulseStats.volume} <span className="text-[10px] text-emerald-400 ml-1">{pulseStats.volumeTrend}</span></span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-6">
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60">Top Sector</span>
                        <span className="text-xl font-black text-white italic tracking-tighter uppercase">{pulseStats.topSector}</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-6">
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60">Volatility Index</span>
                        <span className="text-xl font-black text-white italic tracking-tighter uppercase text-primary-cyan">{pulseStats.volatility}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                    <div className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 italic">MARKET TREND</div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-md">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span className="text-xs font-black text-white italic">{pulseStats.trend}</span>
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
                    <p className="text-lg font-black text-white italic tracking-tighter underline decoration-accent-gold/30">
                      ID-{user?.displayName?.toUpperCase().replace(/\s/g, '_') || 'USER.LYA_CORE_JB'}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <button 
                    onClick={() => onNotify(t('INITIATING NODE SYNCHRONIZATION...', 'INITIALISATION DE LA SYNCHRONISATION DU NŒUD...'))}
                    className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-md transition-all group/node"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">{t('NODE ACTIVE', 'NŒUD ACTIF')}</span>
                  </button>
                  <button 
                    onClick={() => onNotify(t('OPENING PROFESSIONAL CONTROL PANEL...', 'OUVERTURE DU PANNEAU DE CONTRÔLE PROFESSIONNEL...'))}
                    className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 hover:border-accent-gold/30 backdrop-blur-md transition-all"
                  >
                    <Settings size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{t('MANAGE', 'GÉRER')}</span>
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
                        className="px-12 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-widest text-[11px] rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(0,224,255,0.3)] disabled:opacity-30"
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
                            onClick={() => onNotify('OPENING SECURE COMMENTS THREAD...')}
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
                            <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/10 text-[9px] font-black text-on-surface-variant uppercase tracking-widest rounded-full opacity-60 hover:opacity-100 transition-opacity">
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
                             <span className="text-[8px] font-mono font-bold text-primary-cyan uppercase tracking-widest opacity-40">{viewedDossiers.has(member.id) ? member.handle : 'ENCRYPTED_ID'}</span>
                             <span className="w-1 h-1 rounded-full bg-white/10" />
                             <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 italic">{member.industry}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-1 opacity-40">Status</p>
                          <p className={`text-[10px] font-black italic uppercase ${member.statusColor.replace('bg-', 'text-')}`}>{member.status}</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] font-black text-accent-gold uppercase tracking-[0.3em] mb-1 opacity-40">Verification</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-white italic">LVL {Math.floor(Math.random() * 5) + 5}</span>
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
                            className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase italic tracking-[0.2em] transition-all ${
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
                    className="px-10 py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase italic tracking-[0.4em] text-white hover:bg-white/10 transition-all rounded-xl"
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
                          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-serif italic opacity-70 max-w-xl">
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
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">{event.slots} {t('REMAINING', 'RESTANTES')}</span>
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
                              <p className="text-[9px] text-accent-gold font-black uppercase tracking-widest">{conv.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-on-surface-variant font-bold uppercase opacity-40">{conv.time}</p>
                             <div className="mt-2 flex items-center gap-2 justify-end text-primary-cyan opacity-0 group-hover/conv:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black uppercase tracking-widest">{t('RESUME', 'REPRENDRE')}</span>
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
                               <span className="text-[9px] text-accent-gold font-black uppercase tracking-widest italic">{mentor.role}</span>
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
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight italic opacity-70 leading-relaxed min-h-[40px]">
                            {mentor.specialty}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/5 transition-colors group-hover:border-accent-gold/10">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Sessions</p>
                              <p className="text-base font-black text-white italic">{mentor.sessions}+</p>
                           </div>
                           <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center border border-white/5 transition-colors group-hover:border-accent-gold/10">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Status</p>
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
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-medium italic opacity-70">
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
            <p className="text-sm text-on-surface-variant leading-relaxed mb-10 font-medium italic opacity-70">
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
            <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-12 font-medium italic">
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
