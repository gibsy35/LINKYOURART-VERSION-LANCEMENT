
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
import { CONTRACTS } from '../types';
import { getPermissions } from '../lib/permissions';
import { useTranslation } from '../context/LanguageContext';
import { SecureMail } from '../components/ui/SecureMail';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';

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
  email?: string;
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
  const [selectedRecipient, setSelectedRecipient] = useState<{name: string, role: string, email?: string} | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'READY' | 'SCANNING' | 'SUCCESS'>('READY');

  // Fetch posts from Firestore
  React.useEffect(() => {
    if (!user || !getPermissions(user).canAccessLounge) {
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
    onNotify(t('OPENING ELITE ACCESS...', 'INITIALISATION DU LYA SYSTEME D\'ADMISSION...'));
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

  const handleInitiateContact = (name: string, role: string, email?: string | null) => {
    setSelectedRecipient({ name, role, email: email || undefined });
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

  // "Registry Pulse" — remplace l'ancien pulseStats qui se régénérait au
  // hasard toutes les 20 secondes (Math.random()). Calculé une fois à
  // partir des vrais projets certifiés (CONTRACTS, même source que
  // Exchange/Comparateur/Watchlist). Pas de "tendance" affichée : aucun
  // historique dans le temps n'est suivi, donc aucun pourcentage
  // d'évolution ne serait honnête.
  const realPulseStats = React.useMemo(() => {
    const live = CONTRACTS.filter(c => c.status === 'LIVE');
    const byCategory: Record<string, number> = {};
    live.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });
    const topSector = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return { activeCertifications: live.length, topSector };
  }, []);

  React.useEffect(() => {
    setMonitorImage('https://picsum.photos/seed/lya-lounge-registry/1600/600');
  }, []);

  // Compte réel de membres vérifiés (statut Pro) — remplace l'ancien
  // "1,248" codé en dur.
  const [realMemberCount, setRealMemberCount] = useState<number | null>(null);
  React.useEffect(() => {
    const q = query(collection(db, 'users'), where('isPro', '==', true));
    const unsub = onSnapshot(q, (snap) => setRealMemberCount(snap.size), () => setRealMemberCount(null));
    return () => unsub();
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
        verified: user.role === UserRole.ADMIN || !!user.isVerifiedValidator || !!user.isEnterprise
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

  // Membres réels du Salon Pro — remplace les 10 personnes fictives
  // codées en dur. Interroge les vrais comptes vérifiés (Pro, Validateur
  // ou Admin). Le réseau est encore en cours de constitution — voir
  // realMembersLoaded plus bas pour l'état honnête si la liste est vide.
  const [realMembers, setRealMembers] = useState<(Member & { hasPremium?: boolean })[]>([]);
  const [realMembersLoaded, setRealMembersLoaded] = useState(false);
  React.useEffect(() => {
    const q = query(collection(db, 'users'), where('isPro', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .filter(d => d.id !== user?.uid)
        .map(d => {
          const data = d.data() as any;
          const roleLabel = data.role === UserRole.ADMIN ? 'ADMIN'
            : data.isVerifiedValidator ? 'VALIDATOR'
            : data.role === UserRole.PROFESSIONAL ? 'PROFESSIONAL'
            : (data.role || 'MEMBER');
          return {
            id: d.id,
            name: data.displayName || t('LYA Member', 'Membre LYA'),
            handle: `@${(data.displayName || 'member').toUpperCase().replace(/\s+/g, '_')}`,
            role: roleLabel,
            industry: data.industry || t('Creative Economy', 'Économie Créative'),
            status: 'ACTIVE',
            roleIcon: data.role === UserRole.ADMIN ? <Crown className="text-accent-gold" size={20} /> : data.isVerifiedValidator ? <ShieldCheck className="text-emerald-400" size={20} /> : <Users className="text-primary-cyan" size={20} />,
            statusColor: 'bg-emerald-500',
            hasPremium: true,
            email: data.email || null,
          };
        });
      setRealMembers(list);
      setRealMembersLoaded(true);
    }, () => setRealMembersLoaded(true));
    return () => unsub();
  }, [user?.uid]);
  const members: (Member & { hasPremium?: boolean, isUnlocked?: boolean })[] = realMembers;

  const events: Event[] = [
    {
      id: '1',
      title: t('Creative Certification Landscape 2026', 'Panorama de la Certification Créative 2026'),
      type: 'WEBINAR',
      date: t('TOMORROW, 14:00 GMT', 'DEMAIN, 14h00 GMT'),
      host: 'LYA Insights',
      image: 'https://picsum.photos/seed/art-market/800/400',
      attendees: 126,
      slots: 24,
      description: t('An exclusive deep dive into the projected growth of creative certification adoption for the coming year.', 'Une plongée exclusive dans la croissance projetée de l\'adoption de la certification créative pour l\'année à venir.'),
      highlights: [t('Adoption Trends', 'Tendances d\'Adoption'), t('Registry Insights', 'Insights du Registre'), t('Global Adoption', 'Adoption Mondiale')],
      speakers: [
        { name: 'Dr. Elena Vance', role: t('Chief Research Officer', 'Directrice de la Recherche'), avatar: 'https://i.pravatar.cc/150?u=elena' },
        { name: 'Marcus Thorne', role: t('Head of Strategy', 'Responsable de la Stratégie'), avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '2',
      title: t('IP Rights in the Generative Era', 'Droits de PI à l\'Ère Générative'),
      type: 'ROUNDTABLE',
      date: t('FRIDAY, 18:00 GMT', 'VENDREDI, 18h00 GMT'),
      host: 'Cadre Légal LYA',
      image: 'https://picsum.photos/seed/ip-rights/800/400',
      attendees: 43,
      slots: 7,
      description: t('A closed-door discussion on the legal frameworks governing AI-generated creative projects.', 'Une discussion à huis clos sur les cadres juridiques régissant les projets créatifs générés par l\'IA.'),
      highlights: [t('Copyright Law', 'Droit d\'Auteur'), t('Neural Validation', 'Validation Neurale'), t('Creative Contract IP', 'PI via Creative Contract')],
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
      description: t('Technical workshop on implementing LYA certification for AI-generated creative assets.', 'Atelier technique sur l\'implémentation de la certification LYA pour les créations générées par IA.'),
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
      description: t('The annual gathering of professional associates to define the future of the LYA certification standard.', 'Le rassemblement annuel des associés professionnels pour définir l\'avenir du standard de certification LYA.'),
      highlights: [t('LYA Roadmap', 'Feuille de Route LYA'), t('Regulatory Sync', 'Synchronisation Réglementaire'), t('Community Feedback', 'Retours Communauté')],
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
      image: 'https://picsum.photos/seed/rights/800/400',
      attendees: 50,
      slots: 10,
      description: t('Hands-on training for certifying creative rights in early-stage projects.', 'Formation pratique pour certifier les droits créatifs dans les projets en phase initiale.'),
      highlights: [t('Certification Models', 'Modèles de Certification'), t('Quality Assessment', 'Évaluation de Qualité'), t('Registry Standards', 'Standards du Registre')],
      speakers: [
        { name: 'Marcus Thorne', role: t('Head of Strategy', 'Responsable de la Stratégie'), avatar: 'https://i.pravatar.cc/150?u=marcus' }
      ],
      status: 'OPEN'
    },
    {
      id: '11',
      title: t('Global Certification Roundtable', 'Table Ronde sur la Certification Mondiale'),
      type: 'ROUNDTABLE',
      date: t('DECEMBER 5, 16:00 GMT', '5 DÉCEMBRE, 16h00 GMT'),
      host: 'LYA Council',
      image: 'https://picsum.photos/seed/roundtable/800/400',
      attendees: 30,
      slots: 4,
      description: t('Discussion on professional certification pathways and creative rights registries.', 'Discussion sur les parcours de certification professionnelle et les registres de droits créatifs.'),
      highlights: [t('Certification Pathways', 'Parcours de Certification'), t('Registry Access', 'Accès au Registre'), t('Professional Standards', 'Standards Professionnels')],
      speakers: [
        { name: 'Marcus Thorne', role: t('Global Registry Lead', 'Responsable Registre Mondial'), avatar: 'https://i.pravatar.cc/150?u=m1' }
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
      description: t('Mastering the art of assessing unique creative professional projects.', 'Maîtriser l\'art d\'évaluer des projets professionnels créatifs uniques.'),
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
      role: t('Global Registry Lead', 'Responsable Registre Mondial'),
      specialty: t('Creative Certification & Valuation', 'Certification Créative & Valorisation'),
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
    { tag: t('LYA Certification Standards', 'Standards de Certification LYA'), insights: 124, trend: '+12%' },
    { tag: t('EU Creative Rights', 'Droits Créatifs de l\'UE'), insights: 89, trend: '+45%' },
    { tag: t('Generative IP Rights', 'Droits de PI Génératifs'), insights: 56, trend: '+8%' },
    { tag: t('Professional Registry Activity', 'Activité du Registre Professionnel'), insights: 42, trend: '-5%' },
    { tag: t('Global Art Index', 'Indice Mondial de l\'Art'), insights: 38, trend: '+22%' },
    { tag: t('Digital Cinema Certification', 'Certification Cinéma Numérique'), insights: 31, trend: '+15%' },
    { tag: t('Smart IP Contracts', 'Creative Contracts de PI'), insights: 27, trend: '+10%' }
  ];

  // Access Control: the Lounge is reserved for manually-vetted Validators
  // (see src/lib/permissions.ts) — not automatically granted by any paid
  // subscription tier.
  if (!getPermissions(user).canAccessLounge) {
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

                <div className="flex flex-col items-center justify-center text-center relative z-10">
                  <div className="w-16 h-16 bg-accent-gold/10 border border-accent-gold/20 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                    <Lock size={28} className="text-accent-gold" />
                  </div>
                  <span className="text-[10px] font-black font-mono tracking-widest text-accent-gold/70 uppercase px-3 py-1 border border-accent-gold/10 rounded-md">
                    {t('MANUALLY VETTED ACCESS', 'ACCÈS SOUMIS À VALIDATION MANUELLE')}
                  </span>
                  <p className="text-[10px] text-on-surface-variant/50 uppercase font-bold tracking-wider mt-3 max-w-[180px]">
                    {t('No automated check can unlock this — see options below.', 'Aucune vérification automatique ne peut débloquer ceci — voir les options ci-dessous.')}
                  </p>
                </div>
                
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
                  🏛️ {t('ESPACE ÉLITE LYA', 'ESPACE ÉLITE LYA')}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-headline tracking-tighter text-white uppercase leading-[0.9]">
                  {t('Lounge Access Restricted', 'Accès au Salon Restreint')}
                </h2>
              </div>

              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed opacity-70">
                {t('The Pro Lounge is the professional collaboration space of the LYA platform — a secure workspace reserved for accredited validators, certified creators and institutional partners to exchange, mentor and co-develop certified projects.', 'Le Salon Pro est l\'espace de collaboration professionnelle de la plateforme LYA — un espace sécurisé réservé aux validateurs accrédités, créateurs certifiés et partenaires institutionnels pour échanger, mentorer et co-développer des projets certifiés.')}
              </p>

              {/* Elite feature checklist */}
              <div className="py-4 border-y border-white/5 space-y-3 font-mono text-[10px] md:text-xs">
                <div className="flex flex-wrap items-center gap-2 text-white/95">
                  <ShieldCheck size={14} className="text-accent-gold shrink-0" />
                  <span className="uppercase tracking-wide">
                    {t('Co-development & Rights Structuring', 'Co-développement & Structuration des droits')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-white/95">
                  <TrendingUp size={14} className="text-accent-gold shrink-0" />
                  <span className="uppercase tracking-wide">
                    {t('Private-tier index insights and direct developer API modules', 'Données d\'indice privées & modules API développeur directs')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-white/95">
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
                  {t('UPGRADE LYA SYSTEM STATUS', 'PASSER AU STATUT PROFESSIONNEL')}
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
          {/* Quick numbers — comptage réel, plus de "staking" (mécanisme
              retiré de la plateforme lors du repositionnement CVI) */}
          <div className="flex gap-4 border-l border-white/5 pl-4">
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant opacity-45 uppercase tracking-widest block">{t('Verified Members', 'Membres Vérifiés')}</span>
              <span className="text-lg font-black text-white">{realMemberCount === null ? '—' : realMemberCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('ACCESS VERIFIED', 'ACCÈS VÉRIFIÉ')}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mb-12">
        <nav className="flex border-b border-white/5 relative mt-6 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth pb-1 -mx-6 px-6 md:mx-12 md:px-0">
          <div className="flex min-w-max gap-6 md:gap-12">
            {[
              { id: 'FEED', label: t('Insight Feed', 'Flux d\'Insights'), icon: <Activity size={16} /> },
              { id: 'MEMBERS', label: t('Protocol Member', 'MEMBRES LYA SYSTEME'), icon: <Users size={16} /> },
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
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
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
                      <span className="text-[10px] text-white font-black uppercase tracking-[0.4em] opacity-60">{t('REGISTRY PULSE', 'POULS DU REGISTRE')}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                      {t('CREATIVE', 'CRÉATIF')} <span className="bg-gradient-to-r from-accent-gold via-white to-accent-gold bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{t('INSIGHTS MONITOR', 'MONITEUR D\'INSIGHTS')}</span>
                    </h2>
                    <div className="flex flex-wrap gap-6 mt-8">
                      <div className="flex flex-col group/stat">
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60">{t('Active Certifications', 'Certifications Actives')}</span>
                        <span className="text-xl font-black text-white tracking-tighter">{realPulseStats.activeCertifications}</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-6 group/stat">
                        <span className="text-[10px] text-accent-gold font-black uppercase tracking-widest mb-1 opacity-60">{t('Top Sector', 'Meilleur Secteur')}</span>
                        <span className="text-xl font-black text-white tracking-tighter uppercase">{realPulseStats.topSector}</span>
                      </div>
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
                  <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('NODE ACTIVE', 'NŒUD ACTIF')}</span>
                  </div>
                  <button
                    onClick={() => onViewChange && onViewChange('SETTINGS')}
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
                {!realMembersLoaded ? (
                  <div className="py-24 text-center text-on-surface-variant/40 text-xs uppercase tracking-widest font-black">
                    {t('Loading members...', 'Chargement des membres...')}
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-24 text-center max-w-md mx-auto">
                    <Users size={32} className="text-accent-gold/40 mx-auto mb-4" />
                    <p className="text-sm font-black text-white uppercase tracking-widest mb-2">
                      {t('Network Under Construction', 'Réseau en Cours de Constitution')}
                    </p>
                    <p className="text-xs text-on-surface-variant/50 leading-relaxed">
                      {t('LYA\'s elite professional network is being built deliberately, member by member. Verified Pro accounts will appear here as they join.', 'Le réseau professionnel d\'élite de LYA se construit avec exigence, membre par membre. Les comptes Pro vérifiés apparaîtront ici au fur et à mesure.')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      {members.slice(0, visibleMembers).map((member) => (
                        <div key={member.id} className="bg-surface-low/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-surface-low/50 transition-all group relative overflow-hidden">
                          <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-low border border-white/10 flex items-center justify-center relative shrink-0 shadow-xl overflow-hidden group-hover:border-primary-cyan/50 transition-all duration-500">
                              <span className="text-xl font-black text-white/60 uppercase">{member.name.slice(0, 2)}</span>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-dim ${member.statusColor}`} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter truncate max-w-[150px] sm:max-w-none">
                                  {member.name}
                                </h4>
                                <div className="opacity-50 scale-75 shrink-0">{member.roleIcon}</div>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] font-mono font-bold text-primary-cyan uppercase tracking-widest opacity-40">{member.handle}</span>
                                 <span className="w-1 h-1 rounded-full bg-white/10" />
                                 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 italic">{member.industry}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex flex-col items-center">
                              <p className="text-[7px] font-black text-accent-gold uppercase tracking-[0.3em] mb-1 opacity-40">{t('Role', 'Rôle')}</p>
                              <p className="text-[10px] font-black italic uppercase text-white">{member.role}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleInitiateContact(member.name, member.role, (member as any).email)}
                                className="px-6 py-3 rounded-xl font-black text-xs uppercase italic tracking-[0.2em] transition-all bg-white text-surface-dim hover:bg-primary-cyan"
                              >
                                {t('Contact', 'CONTACT')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {visibleMembers < members.length && (
                      <div className="flex justify-center pt-8">
                        <button
                          onClick={() => setVisibleMembers(prev => prev + 10)}
                          className="px-10 py-4 bg-white/5 border border-white/10 text-xs font-black uppercase italic tracking-[0.4em] text-white hover:bg-white/10 transition-all rounded-xl"
                        >
                          {t('LOAD MORE', 'CHARGER PLUS')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'EVENTS' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="py-24 text-center max-w-lg mx-auto"
              >
                <Calendar size={32} className="text-accent-gold/40 mx-auto mb-4" />
                <p className="text-sm font-black text-white uppercase tracking-widest mb-2">
                  {t('Private Events — Coming Soon', 'Événements Privés — Bientôt Disponible')}
                </p>
                <p className="text-xs text-on-surface-variant/50 leading-relaxed">
                  {t('Exclusive webinars, roundtables and networking events for verified LYA members will be announced here as the elite network grows.', 'Webinaires exclusifs, tables rondes et événements de réseautage pour les membres vérifiés LYA seront annoncés ici au fur et à mesure de la croissance du réseau élite.')}
                </p>
              </motion.div>
            )}


            {activeTab === 'MENTORSHIP' && (
              <motion.div
                key="mentorship"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-24 text-center max-w-lg mx-auto"
              >
                <Crown size={32} className="text-accent-gold/40 mx-auto mb-4" />
                <p className="text-sm font-black text-white uppercase tracking-widest mb-2">
                  {t('Elite Mentorship — Coming Soon', 'Mentorat d\'Élite — Bientôt Disponible')}
                </p>
                <p className="text-xs text-on-surface-variant/50 leading-relaxed">
                  {t('Direct mentorship pairing between verified LYA experts and emerging creators is being built. It will launch once the professional network has grown enough to make meaningful matches.', 'La mise en relation directe entre experts vérifiés LYA et créateurs émergents est en cours de construction. Elle sera lancée une fois le réseau professionnel suffisamment développé pour proposer des correspondances pertinentes.')}
                </p>
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

          <div className="p-12 bg-gradient-to-br from-indigo-900/40 to-surface-low border border-white/5 rounded-[3rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Award size={100} className="text-primary-cyan" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">{t('ELITE MENTORSHIP', 'MENTORAT D\'ÉLITE')}</h4>
            <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-12 font-medium italic text-justify">
              {t('Strategic 1-on-1 sessions with professional registry experts and Grammy-winning legacy curators.', 'Sessions stratégiques 1-sur-1 avec des experts de registre professionnels et des conservateurs de patrimoine récompensés aux Grammy.')}
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
            senderName={user?.displayName || undefined}
            senderRole={user?.role}
            onClose={() => setShowMail(false)} 
            onSend={() => onNotify(t('EMAIL SENT.', 'EMAIL ENVOYÉ.'))}
          />
        )}
      </div>
    </div>
  );
};
