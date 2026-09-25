
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Award, 
  FileText, 
  CheckCircle2,
  Info,
  DollarSign,
  Sparkles,
  Image as ImageIcon,
  TrendingUp,
  Calendar,
  Lock
} from 'lucide-react';
import { Milestone, UserProfile, UserRole } from '../types';
import { getPermissions } from '../lib/permissions';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { suggestMilestones } from '../services/geminiService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getSafeImageUrl } from '../utils/image';
import { Trash2, Edit2, Check, X as CloseIcon, Mic, Images, Video, Music } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

export const LinkArtView: React.FC<{ 
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
  allContracts?: { issuerUid?: string }[];
}> = ({ user, onNotify, onViewChange, allContracts = [] }) => {
  const { t, language } = useTranslation();

  // Access control lives in src/lib/permissions.ts — the single source of
  // truth for what each role can actually do (see LYA_Audit_Services_Pricing.md
  // for why this used to be a scattered, inconsistent `isPro` check).
  const perms = getPermissions(user);
  const creatorProjectCount = user ? allContracts.filter(c => c.issuerUid === user.uid).length : 0;
  const submissionLimit = perms.projectSubmissionLimit; // null = unlimited
  const limitReached = perms.canSubmitProjects && submissionLimit !== null && creatorProjectCount >= submissionLimit;

  if (!perms.canSubmitProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20"
        >
          <Lock size={48} className="text-red-500" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase italic text-on-surface mb-6 tracking-tighter">
          {t('Access Restricted', 'Accès Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('Project submission is reserved for Creators, Certified Professionals and Institutional Partners. Create a Creator account to start submitting projects for certification.', 'La soumission de projets est réservée aux créateurs, professionnels certifiés et partenaires institutionnels. Créez un compte Créateur pour commencer à soumettre des projets à la certification.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              onNotify(t('Redirecting to membership plans...', 'Redirection vers les plans d\'adhésion...'));
              onViewChange('PRICING');
            }}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            {t('View Plans', 'Voir les Forfaits')}
          </button>
          <button 
            onClick={() => window.open('mailto:contact@linkyourart.com', '_blank')}
            className="px-10 py-4 bg-white/5 border border-white/10 text-on-surface font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-xl"
          >
            {t('Contact Support', 'Contacter le Support')}
          </button>
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-violet-500/10 rounded-full flex items-center justify-center mb-8 border border-violet-500/20"
        >
          <Lock size={48} className="text-violet-500" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase italic text-on-surface mb-6 tracking-tighter">
          {t('Free Limit Reached', 'Limite Gratuite Atteinte')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t(`You've reached the ${submissionLimit}-project limit on the free Creator plan. Add a single certification for €5, or upgrade to Professional for up to 15 submissions/month.`, `Vous avez atteint la limite de ${submissionLimit} projets du forfait Créateur gratuit. Ajoutez une certification à l'unité pour 5€, ou passez au forfait Professionnel pour jusqu'à 15 soumissions/mois.`)}
        </p>
        <button 
          onClick={() => {
            onNotify(t('Redirecting to membership plans...', 'Redirection vers les plans d\'adhésion...'));
            onViewChange('PRICING');
          }}
          className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] hover:bg-white transition-all"
        >
          {t('View Options', 'Voir les Options')}
        </button>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [isListeningName, setIsListeningName] = useState(false);
  const [isListeningDesc, setIsListeningDesc] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleDictation = (field: 'name' | 'desc') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onNotify(t('Speech recognition is not supported in this browser.', 'La reconnaissance vocale n\'est pas supportée dans ce navigateur.'));
      return;
    }

    const currentlyActive = field === 'name' ? isListeningName : isListeningDesc;

    if (currentlyActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (field === 'name') setIsListeningName(false);
      else setIsListeningDesc(false);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningName(false);
    setIsListeningDesc(false);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Map with global HTML lang tag
    recognition.lang = document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US';

    recognition.onstart = () => {
      onNotify(t('Microphone active. Speak now...', 'Microphone activé. Parlez maintenant...'));
      if (field === 'name') setIsListeningName(true);
      else setIsListeningDesc(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        if (field === 'name') {
          setAssetName(prev => prev ? `${prev} ${transcript}`.toUpperCase() : transcript.toUpperCase());
        } else {
          setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        onNotify(t('Transcription successful!', 'Transcription réussie !'));
      }
    };

    recognition.onerror = (err: any) => {
      console.error('Speech recognition error:', err);
      onNotify(t('Speech recognition failed. Please try again.', 'Échec de la dictée vocale. Veuillez réessayer.'));
      setIsListeningName(false);
      setIsListeningDesc(false);
    };

    recognition.onend = () => {
      setIsListeningName(false);
      setIsListeningDesc(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contractDuration, setContractDuration] = useState('12');
  const [maturityDate, setMaturityDate] = useState('2027-03-29');
  const [assetName, setAssetName] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionFR, setDescriptionFR] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDescExample, setShowDescExample] = useState(false);
  // 4 exemples couvrant des secteurs creatifs differents, pour ne pas
  // donner l'impression que LYA ne s'adresse qu'au cinema. Un est tire au
  // hasard a chaque ouverture de la page, pas fige.
  const DESCRIPTION_EXAMPLES = [
    {
      label: t('Example: Short Film Project', 'Exemple : Projet de Court-Métrage'),
      text: t(
        '"Renaissance Reborn is a 22-minute short film restoring the story of a forgotten Renaissance-era painter through hand-drawn animation and archival research. The project blends traditional oil-painting textures with frame-by-frame digital animation, produced over 14 months by a 6-person team. It has been selected for pre-screening at two regional festivals and is currently in post-production sound design."',
        '"Renaissance Reborn est un court-métrage de 22 minutes retraçant l\'histoire d\'un peintre oublié de la Renaissance à travers une animation dessinée à la main et un travail de recherche d\'archives. Le projet mélange des textures de peinture à l\'huile traditionnelles avec une animation numérique image par image, produit sur 14 mois par une équipe de 6 personnes. Il a été sélectionné en pré-sélection dans deux festivals régionaux et se trouve actuellement en post-production sonore."'
      ),
    },
    {
      label: t('Example: Music Album', 'Exemple : Album Musical'),
      text: t(
        '"Echoes of Tomorrow is an 11-track electronic album blending analog synthesizers with field recordings collected across three continents. Written and produced independently over 18 months, the project has already secured a sync licensing deal for a streaming series and is in final mastering with a Grammy-nominated engineer."',
        '"Echoes of Tomorrow est un album électronique de 11 titres mêlant synthétiseurs analogiques et prises de son collectées sur trois continents. Écrit et produit de façon indépendante sur 18 mois, le projet a déjà obtenu un accord de licence pour une série en streaming et se trouve en mastering final avec un ingénieur nommé aux Grammy Awards."'
      ),
    },
    {
      label: t('Example: Digital Art Collection', 'Exemple : Collection d\'Art Numérique'),
      text: t(
        '"Quantum Realm is a series of 12 generative digital artworks exploring probability fields through real-time particle simulation. Built with custom rendering software over 8 months by a solo artist, the collection has been exhibited at one digital art festival and is currently seeking gallery representation for a physical print series."',
        '"Quantum Realm est une série de 12 œuvres d\'art numérique génératif explorant les champs de probabilité à travers une simulation de particules en temps réel. Réalisée avec un logiciel de rendu sur mesure sur 8 mois par un artiste solo, la collection a été exposée dans un festival d\'art numérique et cherche actuellement une représentation en galerie pour une série d\'impressions physiques."'
      ),
    },
    {
      label: t('Example: Fashion Collection', 'Exemple : Collection de Mode'),
      text: t(
        '"Second Skin is a 14-piece sustainable fashion capsule collection made entirely from upcycled textiles sourced from three European workshops. Designed and produced over 10 months by a 3-person atelier, the collection debuted at a regional fashion week and is currently in talks with two boutique distributors."',
        '"Second Skin est une collection capsule de mode durable de 14 pièces, entièrement réalisée à partir de textiles recyclés issus de trois ateliers européens. Conçue et produite sur 10 mois par un atelier de 3 personnes, la collection a été présentée lors d\'une fashion week régionale et est actuellement en négociation avec deux distributeurs boutique."'
      ),
    },
  ];
  const [descExample] = useState(() => DESCRIPTION_EXAMPLES[Math.floor(Math.random() * DESCRIPTION_EXAMPLES.length)]);
  const [fundingGoal, setFundingGoal] = useState('');
  const [selectedRights, setSelectedRights] = useState<string[]>([]);
  const [category, setCategory] = useState('Fine Art');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  // Piece jointe (fichier maitre du contrat) - le bloc etait purement
  // decoratif jusqu'ici, sans aucun input file ni upload reel.
  // Documents multiples, categorises et a visibilite controlee, en
  // remplacement de l'unique "fichier maitre" - un film peut avoir un
  // moodboard, un synopsis, un dossier de presentation ET un business
  // plan, chacun visible ou non selon le public (mecene grand public vs
  // professionnel), comme discute avec Gibsy.
  type DocCategory = 'moodboard' | 'synopsis' | 'presentation' | 'business_plan' | 'other';
  type DocVisibility = 'public' | 'professional';
  const DOC_CATEGORIES: { id: DocCategory; fr: string; en: string }[] = [
    { id: 'moodboard', fr: 'Moodboard', en: 'Moodboard' },
    { id: 'synopsis', fr: 'Synopsis', en: 'Synopsis' },
    { id: 'presentation', fr: 'Dossier de Présentation', en: 'Presentation Deck' },
    { id: 'business_plan', fr: 'Business Plan', en: 'Business Plan' },
    { id: 'other', fr: 'Autre Document', en: 'Other Document' },
  ];
  const [projectDocs, setProjectDocs] = useState<{ file: File; category: DocCategory; visibility: DocVisibility }[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const masterFileInputRef = React.useRef<HTMLInputElement>(null);
  const handleMasterFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      onNotify(t('File exceeds the 100MB limit.', 'Le fichier dépasse la limite de 100 Mo.'));
      return;
    }
    // Categorie devinee a partir du nom de fichier a titre de point de
    // depart pratique, l'utilisateur peut la changer avant l'envoi.
    const guess: DocCategory = /business|invest/i.test(file.name) ? 'business_plan'
      : /moodboard|mood/i.test(file.name) ? 'moodboard'
      : /synop/i.test(file.name) ? 'synopsis'
      : /present|deck|dossier/i.test(file.name) ? 'presentation'
      : 'other';
    const guessVisibility: DocVisibility = guess === 'business_plan' ? 'professional' : 'public';
    setProjectDocs(prev => [...prev, { file, category: guess, visibility: guessVisibility }]);
    e.target.value = '';
  };
  const removeProjectDoc = (index: number) => setProjectDocs(prev => prev.filter((_, i) => i !== index));
  const updateProjectDocCategory = (index: number, category: DocCategory) => setProjectDocs(prev => prev.map((d, i) => i === index ? { ...d, category } : d));
  const updateProjectDocVisibility = (index: number, visibility: DocVisibility) => setProjectDocs(prev => prev.map((d, i) => i === index ? { ...d, visibility } : d));
  const uploadMasterFile = async (): Promise<{ name: string; url: string; size: number; category: DocCategory; visibility: DocVisibility }[]> => {
    if (projectDocs.length === 0) return [];
    setIsUploadingFile(true);
    try {
      const results: { name: string; url: string; size: number; category: DocCategory; visibility: DocVisibility }[] = [];
      for (const docItem of projectDocs) {
        const storageRef = ref(storage, `contract_master_files/${user?.uid || 'anonymous'}/${Date.now()}_${docItem.file.name}`);
        const task = uploadBytesResumable(storageRef, docItem.file);
        await new Promise<void>((resolve, reject) => { task.on('state_changed', undefined, reject, () => resolve()); });
        const url = await getDownloadURL(task.snapshot.ref);
        results.push({ name: docItem.file.name, url, size: docItem.file.size, category: docItem.category, visibility: docItem.visibility });
      }
      return results;
    } finally {
      setIsUploadingFile(false);
    }
  };
  // Galerie multimedia reelle - avant ce fix, un projet ne pouvait avoir
  // qu'une seule image de couverture, jamais de galerie ni de video/audio,
  // rendant la fiche Mecenat totalement decorative sur ce plan.
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const MAX_GALLERY_IMAGES = 6;
  const handleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = MAX_GALLERY_IMAGES - galleryFiles.length;
    if (room <= 0) {
      onNotify(t(`Maximum ${MAX_GALLERY_IMAGES} images in the gallery.`, `Maximum ${MAX_GALLERY_IMAGES} images dans la galerie.`));
      return;
    }
    const accepted = files.slice(0, room).filter(f => {
      if (f.size > 15 * 1024 * 1024) {
        onNotify(t(`"${f.name}" exceeds the 15MB limit and was skipped.`, `"${f.name}" dépasse la limite de 15 Mo et a été ignoré.`));
        return false;
      }
      return true;
    });
    setGalleryFiles(prev => [...prev, ...accepted]);
    setGalleryPreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };
  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };
  const uploadGalleryImages = async (): Promise<string[]> => {
    if (galleryFiles.length === 0) return [];
    setIsUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of galleryFiles) {
        const storageRef = ref(storage, `contract_gallery/${user?.uid || 'anonymous'}/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        await new Promise<void>((resolve, reject) => { task.on('state_changed', undefined, reject, () => resolve()); });
        urls.push(await getDownloadURL(task.snapshot.ref));
      }
      return urls;
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      onNotify(t('Video exceeds the 100MB limit.', 'La vidéo dépasse la limite de 100 Mo.'));
      return;
    }
    setVideoFile(file);
  };
  const uploadVideoFile = async (): Promise<string | null> => {
    if (!videoFile) return null;
    setIsUploadingVideo(true);
    try {
      const storageRef = ref(storage, `contract_media/${user?.uid || 'anonymous'}/video_${Date.now()}_${videoFile.name}`);
      const task = uploadBytesResumable(storageRef, videoFile);
      await new Promise<void>((resolve, reject) => { task.on('state_changed', undefined, reject, () => resolve()); });
      return await getDownloadURL(task.snapshot.ref);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      onNotify(t('Audio exceeds the 30MB limit.', 'L\'audio dépasse la limite de 30 Mo.'));
      return;
    }
    setAudioFile(file);
  };
  const uploadAudioFile = async (): Promise<string | null> => {
    if (!audioFile) return null;
    setIsUploadingAudio(true);
    try {
      const storageRef = ref(storage, `contract_media/${user?.uid || 'anonymous'}/audio_${Date.now()}_${audioFile.name}`);
      const task = uploadBytesResumable(storageRef, audioFile);
      await new Promise<void>((resolve, reject) => { task.on('state_changed', undefined, reject, () => resolve()); });
      return await getDownloadURL(task.snapshot.ref);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const [isSuggestingMilestones, setIsSuggestingMilestones] = useState(false);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    label: '',
    date: new Date().toISOString().split('T')[0].substring(0, 7),
    status: 'UPCOMING',
    scoreImpact: 5
  });

  const handleAddMilestone = () => {
    if (!newMilestone.label) {
      onNotify(t('Milestone label is required.', 'Le libellé du jalon est requis.'));
      return;
    }
    setMilestones([...milestones, { ...newMilestone }]);
    setNewMilestone({
      label: '',
      date: new Date().toISOString().split('T')[0].substring(0, 7),
      status: 'UPCOMING',
      scoreImpact: 5
    });
    onNotify(t('MILESTONE ADDED.', 'JALON AJOUTÉ.'));
  };

  const handleUpdateMilestone = (index: number, updated: Milestone) => {
    const nextMilestones = [...milestones];
    nextMilestones[index] = updated;
    setMilestones(nextMilestones);
    setEditingMilestoneIndex(null);
    onNotify(t('MILESTONE UPDATED.', 'JALON MIS À JOUR.'));
  };

  const handleSuggestMilestones = async () => {
    if (!description) {
      onNotify(t('Please provide a project description to suggest milestones.', 'Veuillez fournir une description de projet pour suggérer des jalons.'));
      return;
    }

    setIsSuggestingMilestones(true);
    onNotify(t('AI IS ANALYZING PROJECT TIMELINE...', 'L\'IA ANALYSE LE CALENDRIER DU PROJET...'));

    try {
      const suggestions = await suggestMilestones(description, language);
      const formattedMilestones: Milestone[] = suggestions.map((s: any) => ({
        label: s.label,
        date: s.date,
        status: 'UPCOMING',
        scoreImpact: s.scoreImpact
      }));
      setMilestones(formattedMilestones);
      onNotify(t('MILESTONES SUGGESTED SUCCESSFULLY.', 'JALONS SUGGÉRÉS AVEC SUCCÈS.'));
    } catch (error) {
      console.error('Milestone suggestion failed:', error);
      onNotify(t('FAILED TO SUGGEST MILESTONES.', 'ÉCHEC DE LA SUGGESTION DES JALONS.'));
    } finally {
      setIsSuggestingMilestones(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!description) {
      onNotify(t('Please provide a description first.', 'Veuillez d\'abord fournir une description.'));
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedOptions([]);
    onNotify(t('GENERATING CONCEPT VISUALIZATIONS...', 'GÉNÉRATION DES VISUALISATIONS DE CONCEPT...'));

    try {
      const categoryStyles: Record<string, string[]> = {
        'Fine Art': ['Classical oil painting texture, gallery lighting', 'Contemporary mixed-media fine art, museum quality', 'Abstract expressionist brushwork, rich pigments'],
        'Music': ['Album cover art, moody atmospheric lighting', 'Vinyl sleeve design, bold typography-inspired composition', 'Concert stage energy, dynamic light trails'],
        'Film': ['Cinematic film still, dramatic lighting, 35mm grain', 'Movie poster composition, widescreen aspect', 'Behind-the-scenes production still, natural light'],
        'TV Series': ['Cinematic film still, dramatic lighting, 35mm grain', 'Series key art composition, widescreen aspect', 'Character-driven dramatic still, moody tone'],
        'Literature': ['Book cover illustration, literary and evocative', 'Vintage manuscript aesthetic, textured paper', 'Minimalist typographic cover design'],
        'Photography': ['Fine art photography composition, natural light', 'Documentary photojournalism style, candid moment', 'Studio portrait lighting, high detail'],
        'Fashion': ['Editorial fashion photography, studio lighting', 'Runway show energy, dynamic movement', 'Textile and pattern close-up, tactile detail'],
        'Digital Art': ['Generative digital art, vibrant gradients', 'Cyberpunk neon aesthetic, technical composition', 'Abstract 3D render, clean modern composition'],
        'Podcast': ['Podcast cover art, bold graphic composition', 'Audio waveform inspired abstract design', 'Studio microphone still life, warm lighting'],
        'Architecture': ['Architectural photography, clean geometric lines', 'Blueprint-inspired technical illustration', 'Interior design render, natural light'],
        'Gastronomy': ['Fine dining food photography, natural light', 'Culinary editorial still life, rich textures', 'Restaurant ambiance, warm atmospheric lighting'],
        'Performing Arts': ['Stage performance photography, dramatic spotlight', 'Theatrical production still, rich stage colors', 'Dance movement captured in motion blur'],
        'Gaming': ['Video game concept art, vibrant world-building', 'Character design illustration, dynamic pose', 'Game environment art, atmospheric lighting'],
        'Design': ['Product design render, clean studio lighting', 'Industrial design blueprint aesthetic', 'Modern minimalist design composition'],
      };
      const styles = categoryStyles[category] || categoryStyles['Fine Art'];

      const response = await fetch('/api/gemini/generate-cover-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: `"${assetName}" — ${description}`, styles })
      });
      if (!response.ok) throw new Error(`Cover art API failed with status ${response.status}`);
      const data = await response.json();
      const newOptions: string[] = Array.isArray(data.images) ? data.images : [];

      if (newOptions.length > 0) {
        setGeneratedOptions(newOptions);
        if (!generatedImage) {
          setGeneratedImage(newOptions[0]);
        }
        onNotify(t('VISUALIZATIONS GENERATED. SELECT YOUR PREFERRED VERSION.', 'VISUALISATIONS GÉNÉRÉES. SÉLECTIONNEZ VOTRE VERSION PRÉFÉRÉE.'));
      } else {
        throw new Error('No images generated');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      const fallback = getSafeImageUrl(undefined, category);
      setGeneratedImage(fallback);
      onNotify(t('GENERATION FAILED. USING PROFESSIONAL PLACEHOLDER.', 'ÉCHEC DE LA GÉNÉRATION. UTILISATION D\'UN ESPACE RÉSERVÉ PROFESSIONNEL.'));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const STEPS: Step[] = [
    { 
      id: 1, 
      title: t('Contract Details', 'Détails du Contrat'), 
      description: t('Define the core identity of your creative contract.', 'Définissez l\'identité fondamentale de votre contrat créatif.') 
    },
    { 
      id: 2, 
      title: t('Project Milestones', 'Jalons du Projet'), 
      description: t('Establish key development phases and their certification impact.', 'Établissez les phases clés du développement et leur impact sur la certification.') 
    },
    { 
      id: 3, 
      title: t('Certification Scope', 'Portée de Certification'), 
      description: t('Define your project timeline and certification tier.', 'Définissez le calendrier de votre projet et son niveau de certification.') 
    },
    { 
      id: 4, 
      title: t('Legal & IP Rights', 'Droits Légaux & PI'), 
      description: t('Establish the intellectual property framework.', 'Établissez le cadre de la propriété intellectuelle.') 
    },
    { 
      id: 5, 
      title: t('Review & Submit', 'Révision & Soumission'), 
      description: t('Finalize the professional contract for validation.', 'Finalisez le contrat professionnel pour validation.') 
    }
  ];

  // Validation par etape - avant ce fix, on pouvait cliquer "Etape Suivante"
  // sans rien remplir jusqu'a la generation finale du projet.
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return assetName.trim() !== '' && issuerName.trim() !== '' && description.trim() !== '';
      case 2: return milestones.length > 0;
      case 3: return fundingGoal.trim() !== '';
      case 4: return selectedRights.length > 0;
      default: return true;
    }
  };
  const currentStepValid = isStepValid(currentStep);

  const handleNext = () => {
    if (!currentStepValid) {
      onNotify(t('Please complete this step before continuing.', 'Veuillez compléter cette étape avant de continuer.'));
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      onNotify(`${t('STEP', 'ÉTAPE')} ${currentStep + 1}: ${STEPS[currentStep].title}`);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Auto-translate description to French via Claude API
  // Detection de langue extraite a part, reutilisee des l'appel pour
  // decider dans quel sens traduire - avant ce fix, la traduction n'allait
  // JAMAIS que vers le francais: si le porteur de projet ecrivait deja en
  // francais (cas frequent en test), le texte etait simplement duplique
  // tel quel dans les deux champs (description ET descriptionFR), sans
  // jamais produire de version anglaise - d'ou l'impression que "la
  // traduction ne se fait pas".
  const detectIsFrench = (text: string): boolean => {
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'avec', 'pour', 'dans', 'sur'];
    const words = text.toLowerCase().split(' ');
    return frenchWords.filter(w => words.includes(w)).length >= 2;
  };

  const translateDescription = async (text: string, targetLang: 'fr' | 'en' = 'fr'): Promise<string> => {
    if (!text) return '';
    try {
      setIsTranslating(true);
      const res = await fetch('/api/gemini/analyze-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', description: text, targetLang })
      });
      if (!res.ok) {
        onNotify(t('Translation service unavailable — the English description will be used for both languages.', 'Service de traduction indisponible — la description anglaise sera utilisée pour les deux langues.'));
        return text;
      }
      const data = await res.json();
      // Le serveur repond success (200) meme quand la traduction n'a PAS
      // eu lieu (cle API manquante cote serveur) - avant ce fix, ce cas
      // etait totalement silencieux: aucune erreur, aucun avertissement,
      // la description restait simplement non traduite sans que personne
      // ne le sache.
      if (data.source === 'passthrough') {
        onNotify(t('Translation service unavailable — the English description will be used for both languages.', 'Service de traduction indisponible — la description anglaise sera utilisée pour les deux langues.'));
      }
      return data.translatedDescription || text;
    } catch {
      onNotify(t('Translation service unavailable — the English description will be used for both languages.', 'Service de traduction indisponible — la description anglaise sera utilisée pour les deux langues.'));
      return text; // fallback to original
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async () => {
    if (!assetName || !issuerName || !description) {
      onNotify(t('Please complete all contract details before submitting.', 'Veuillez remplir tous les détails du contrat avant de soumettre.'));
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    onNotify(t('INITIATING CONTRAT CRÉATIF DEPLOYMENT...', 'INITIALISATION DU DÉPLOIEMENT DU CONTRAT CRÉATIF...'));
    
    try {
      // Traduit dans le bon sens selon la langue de redaction detectee,
      // pour que les deux champs (EN et FR) contiennent bien deux versions
      // reellement distinctes, quelle que soit la langue de depart.
      onNotify(t('TRANSLATING DESCRIPTION...', 'TRADUCTION DE LA DESCRIPTION...'));
      const writtenInFrench = detectIsFrench(description);
      let finalDescriptionEN = description;
      let finalDescriptionFR = descriptionFR;
      if (writtenInFrench) {
        finalDescriptionFR = description;
        finalDescriptionEN = await translateDescription(description, 'en');
      } else {
        finalDescriptionFR = descriptionFR || await translateDescription(description, 'fr');
      }
      if (finalDescriptionFR !== descriptionFR) setDescriptionFR(finalDescriptionFR);

      // Upload du fichier maitre s'il y en a un. La fonction n'avait
      // aucun bloc catch: un echec d'upload (reseau, permissions...)
      // faisait planter TOUTE la soumission avant meme d'ecrire le
      // projet en base - rien n'etait jamais enregistre, sans que ce
      // soit clair pour l'utilisateur. Le fichier joint est secondaire,
      // son echec ne doit plus jamais empecher la soumission du projet
      // lui-meme.
      let projectDocsData: { name: string; url: string; size: number; category: string; visibility: string }[] = [];
      if (projectDocs.length > 0) {
        onNotify(t('UPLOADING DOCUMENTS...', 'TÉLÉVERSEMENT DES DOCUMENTS...'));
        try {
          projectDocsData = await uploadMasterFile();
        } catch (fileErr) {
          console.warn('Documents upload failed, continuing without them:', fileErr);
          onNotify(t('Some documents could not be uploaded — continuing without them.', "Certains documents n'ont pas pu être envoyés — poursuite sans eux."));
        }
      }

      // Galerie, video et audio - suivent le meme principe que le fichier
      // maitre ci-dessus: un echec sur l'un d'eux prevenu l'utilisateur
      // mais ne bloque jamais la soumission du projet lui-meme.
      let galleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        onNotify(t('UPLOADING GALLERY IMAGES...', 'TÉLÉVERSEMENT DES IMAGES...'));
        try {
          galleryUrls = await uploadGalleryImages();
        } catch (galErr) {
          console.warn('Gallery upload failed, continuing without it:', galErr);
          onNotify(t('Some gallery images could not be uploaded — continuing without them.', "Certaines images n'ont pas pu être envoyées — poursuite sans elles."));
        }
      }
      let videoUrlResult: string | null = null;
      if (videoFile) {
        onNotify(t('UPLOADING VIDEO...', 'TÉLÉVERSEMENT DE LA VIDÉO...'));
        try {
          videoUrlResult = await uploadVideoFile();
        } catch (vidErr) {
          console.warn('Video upload failed, continuing without it:', vidErr);
          onNotify(t('The video could not be uploaded — continuing without it.', "La vidéo n'a pas pu être envoyée — poursuite sans elle."));
        }
      }
      let audioUrlResult: string | null = null;
      if (audioFile) {
        onNotify(t('UPLOADING AUDIO...', 'TÉLÉVERSEMENT DE L\'AUDIO...'));
        try {
          audioUrlResult = await uploadAudioFile();
        } catch (audErr) {
          console.warn('Audio upload failed, continuing without it:', audErr);
          onNotify(t('The audio could not be uploaded — continuing without it.', "L'audio n'a pas pu être envoyé — poursuite sans lui."));
        }
      }

      // Ecrit dans projects_pending, pas dans contracts (qui est le
      // Registre LIVE, publie uniquement apres validation manuelle par un
      // admin). L'ancienne version ecrivait directement dans contracts avec
      // un statut 'PENDING' non standard - le projet n'apparaissait jamais
      // dans la file d'attente Soumissions de l'Admin (qui surveille
      // projects_pending) et polluait le registre publie avec une entree
      // mal formee. Noms de champs alignes sur ce que handlePublishProject
      // attend cote Admin (creatorName/creatorEmail/creatorId, imageUrl,
      // status PENDING_VALIDATION).
      const projectData = {
        name: assetName,
        issuerId: issuerName,
        creatorId: user?.uid,
        creatorName: user?.displayName || issuerName,
        creatorEmail: user?.email || null,
        category,
        description: finalDescriptionEN,
        descriptionFR: finalDescriptionFR,
        imageUrl: generatedImage,
        duration: contractDuration,
        maturityDate,
        totalValue: fundingGoal ? Number(fundingGoal) : null,
        rights: selectedRights,
        status: 'PENDING_VALIDATION',
        milestones,
        ...(projectDocsData.length > 0 ? { documents: projectDocsData } : {}),
        ...(galleryUrls.length > 0 ? { images: galleryUrls } : {}),
        ...(videoUrlResult ? { videoUrl: videoUrlResult } : {}),
        ...(audioUrlResult ? { audioUrl: audioUrlResult } : {}),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects_pending'), projectData);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      onNotify(t('CONTRACT ISSUED SUCCESSFULLY. PENDING VALIDATION.', 'CONTRAT ÉMIS AVEC SUCCÈS. EN ATTENTE DE VALIDATION.'));
    } catch (error) {
      console.error('Submission failed:', error);
      handleFirestoreError(error, OperationType.CREATE, 'contracts');
      onNotify(t('SUBMISSION FAILED. PLEASE TRY AGAIN.', 'ÉCHEC DE LA SOUMISSION. VEUILLEZ RÉESSAYER.'));
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan relative rounded-xl">
            <CheckCircle2 size={48} />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary-cyan/20 rounded-full"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black font-headline tracking-tighter uppercase">{t('Protocol Initialized', 'Protocole Initialisé')}</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-md mx-auto opacity-70 uppercase tracking-widest">
            {t(
              'Your creative contract has been successfully issued to the LYA Registry. The contract is now in the ',
              'Votre contrat créatif a été émis avec succès à la plateforme LYA. Le contrat est maintenant dans la '
            )}
            <span className="text-primary-cyan">{t('Validation Queue', 'File d\'Attente de Validation')}</span>
            {t(' for expert consensus.', ' pour le consensus des experts.')}
          </p>
        </div>
        <div className="pt-8">
          <button 
            onClick={() => onViewChange('DASHBOARD')}
            className="px-12 py-4 bg-primary-cyan text-surface-dim font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            {t('Return to Dashboard', 'Retour au Tableau de Bord')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 pb-24 relative min-h-screen">
      <PageHeader 
        category="SYSTEM"
        titleWhite={<span style={{ textTransform: 'uppercase' }}>LYA</span>}
        titleAccent={t('Submit', 'Submit')}
        description={t('Submit a new creative project for LYA certification. Configure your submission details, milestones, and patronage goals.', 'Soumettez un nouveau projet créatif à la certification LYA. Configurez les détails de votre soumission, vos jalons et vos objectifs de mécénat.')}
        accentColor="text-primary-cyan"
      />

      <div className="pb-24 relative min-h-screen space-y-12">
        {/* Progress Bar */}
      <div className="relative flex justify-between items-start pt-4">
        <div className="absolute top-8 left-0 w-full h-[1px] bg-white/5 z-0" />
        <div 
          className="absolute top-8 left-0 h-[1px] bg-primary-cyan transition-all duration-500 z-0" 
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 w-1/4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              currentStep >= step.id ? 'bg-primary-cyan border-primary-cyan text-surface-dim' : 'bg-surface-dim border-white/10 text-on-surface-variant'
            }`}>
              {currentStep > step.id ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{step.id}</span>}
            </div>
            <div className="text-center">
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 transition-colors ${currentStep >= step.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-surface-low border border-white/5 p-12 min-h-[400px] relative overflow-hidden mt-16 rounded-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-headline uppercase tracking-tighter">{STEPS[currentStep - 1].title}</h2>
              <p className="text-sm text-on-surface-variant uppercase tracking-widest">{STEPS[currentStep - 1].description}</p>
            </div>

            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Contract Name', 'Nom du Contrat')}</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 pr-12 focus:border-primary-cyan/50 focus:ring-0 transition-all text-sm tracking-widest rounded-xl" 
                        placeholder={t('e.g. NEON VOID ARCHIVE', 'ex: ARCHIVE DU VIDE NÉON')} 
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => toggleDictation('name')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-sm border transition-all ${
                          isListeningName 
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                            : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-white'
                        } group/mic`}
                        title={t('Voice Dictation', 'Dictée Vocale')}
                      >
                        <Mic size={14} className={isListeningName ? 'animate-pulse' : ''} />
                        <div className="invisible group-hover/mic:visible absolute bottom-full right-0 mb-2 whitespace-nowrap bg-surface-low border border-white/10 px-3.5 py-1.5 text-[10px] uppercase tracking-widest pointer-events-none text-white font-bold shadow-xl rounded-sm z-30">
                          {isListeningName ? t('Listening... Stop', 'À l\'écoute... Arrêter') : t('Voice Dictation (Mic Access)', 'Dictée Vocale (Accès Micro)')}
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Issuer / Creator', 'Émetteur / Créateur')}</label>
                    <input 
                      className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all text-sm tracking-widest rounded-xl" 
                      placeholder={t('e.g. ALPHA STUDIO', 'ex: STUDIO ALPHA')} 
                      value={issuerName}
                      onChange={(e) => setIssuerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Creative Category', 'Catégorie Créative')}</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all text-sm uppercase tracking-widest appearance-none rounded-xl"
                    >
                      {['Fine Art', 'Music', 'Film', 'TV Series', 'Literature', 'Photography', 'Fashion', 'Digital Art', 'Podcast', 'Architecture', 'Gastronomy', 'Performing Arts', 'Gaming', 'Design'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Contract Description', 'Description du Contrat')}</label>
                    <div className="relative">
                      <textarea 
                        rows={5} 
                        className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all text-sm tracking-widest resize-none rounded-xl" 
                        placeholder={t('Describe your project: what it is, its creative process, and what makes it distinctive...', 'Décrivez votre projet : ce qu\'il est, son processus créatif, et ce qui le distingue...')} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                          type="button"
                          onClick={() => toggleDictation('desc')}
                          className={`p-2 rounded-sm border transition-all ${
                            isListeningDesc 
                              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                              : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-white'
                          } group/mic-desc`}
                          title={t('Voice Dictation', 'Dictée Vocale')}
                        >
                          <Mic size={14} className={isListeningDesc ? 'animate-pulse' : ''} />
                          <div className="invisible group-hover/mic-desc:visible absolute bottom-full right-0 mb-2 whitespace-nowrap bg-surface-low border border-white/10 px-3.5 py-1.5 text-[10px] uppercase tracking-widest pointer-events-none text-white font-bold shadow-xl rounded-sm z-30">
                            {isListeningDesc ? t('Listening... Stop', 'À l\'écoute... Arrêter') : t('Voice Dictation (Mic Access)', 'Dictée Vocale (Accès Micro)')}
                          </div>
                        </button>
                        <button 
                          onClick={handleSuggestMilestones}
                          disabled={isSuggestingMilestones || !description}
                          className="p-2 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan rounded-sm hover:bg-primary-cyan/20 transition-all disabled:opacity-50 group/milestone"
                        >
                          <Sparkles size={14} className={isSuggestingMilestones ? 'animate-pulse' : ''} />
                          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-surface-low border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest opacity-0 group-hover/milestone:opacity-100 transition-opacity pointer-events-none rounded-xl">
                            {t('AI Suggest Milestones', 'Suggestions de Jalons par l\'IA')}
                          </div>
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDescExample(v => !v)}
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary-cyan hover:text-white transition-colors"
                    >
                      <Info size={12} />
                      {showDescExample ? t('Hide Example', 'Masquer l\'Exemple') : t('See a Concrete Example', 'Voir un Exemple Concret')}
                    </button>
                    {showDescExample && (
                      <div className="p-5 bg-primary-cyan/5 border border-primary-cyan/20 rounded-sm space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-cyan">
                          {descExample.label}
                        </p>
                        <p className="text-xs text-on-surface-variant leading-relaxed normal-case italic">
                          {descExample.text}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest pt-2 border-t border-primary-cyan/10 mt-3 rounded-xl">
                          {t('Good descriptions are specific: format, duration, process, team size, and current stage.', 'Une bonne description est précise : format, durée, processus, taille d\'équipe, et étape actuelle.')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Contract Visualization', 'Visualisation du Contrat')}</label>
                    <div className="relative aspect-square bg-surface-dim border border-white/10 overflow-hidden group rounded-xl">
                      {generatedImage ? (
                        <img 
                          src={generatedImage} 
                          alt="Generated Contract" 
                          className="w-full h-full object-cover transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/20 p-8 text-center">
                          <ImageIcon size={48} className="mb-4" />
                          <p className="text-xs uppercase tracking-[0.2em]">{t('No visualization generated', 'Aucune visualisation générée')}</p>
                        </div>
                      )}
                      
                      {isGeneratingImage && (
                        <div className="absolute inset-0 bg-surface-dim/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 rounded-xl">
                          <div className="w-8 h-8 border-2 border-primary-cyan border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs uppercase tracking-widest text-primary-cyan animate-pulse">{t('Synthesizing Versions...', 'Synthèse de Versions...')}</p>
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 z-30">
                        <button 
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage || !description}
                          className="p-3 bg-primary-cyan text-surface-dim rounded-full shadow-lg hover:bg-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/gen"
                        >
                          <Sparkles size={16} className={isGeneratingImage ? 'animate-pulse' : ''} />
                          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-surface-low border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest opacity-0 group-hover/gen:opacity-100 transition-opacity pointer-events-none rounded-xl">
                            {t('AI Generate Visualization', 'Génération IA de Visualisation')}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Selection Grid */}
                    {generatedOptions.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {generatedOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setGeneratedImage(opt)}
                            className={`aspect-square border-2 transition-all p-1 bg-surface-low rounded-xl ${
                              generatedImage === opt ? 'border-primary-cyan' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <img 
                              src={opt} 
                              alt={`Option ${i + 1}`} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Documents multiples avec categorie et visibilite -
                      un film peut avoir moodboard + synopsis + dossier de
                      presentation + business plan, chacun visible ou non
                      selon le public (mecene grand public vs
                      professionnel). */}
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold block mb-3">
                    {t('Project Documents', 'Documents du Projet')} <span className="text-on-surface-variant/40 normal-case font-normal">({t('moodboard, synopsis, presentation, business plan...', 'moodboard, synopsis, dossier de présentation, business plan...')})</span>
                  </label>
                  <input ref={masterFileInputRef} type="file" onChange={handleMasterFileSelect} className="hidden" />

                  {projectDocs.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {projectDocs.map((docItem, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-surface-dim border border-white/10 rounded-xl">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-bold text-white truncate max-w-[140px]">{docItem.file.name}</span>
                          <select
                            value={docItem.category}
                            onChange={e => updateProjectDocCategory(i, e.target.value as DocCategory)}
                            className="bg-surface-high/60 border border-white/10 text-[10px] font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:border-primary-cyan"
                          >
                            {DOC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.en, c.fr)}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={() => updateProjectDocVisibility(i, docItem.visibility === 'public' ? 'professional' : 'public')}
                            title={t('Toggle who can see this document', 'Change qui peut voir ce document')}
                            className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all ${docItem.visibility === 'public' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' : 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'}`}
                          >
                            {docItem.visibility === 'public' ? t('Visible to all patrons', 'Visible mécènes') : t('Professionals only', 'Pro uniquement')}
                          </button>
                          <button type="button" onClick={() => removeProjectDoc(i)} className="ml-auto p-1 text-on-surface-variant/40 hover:text-rose-400 transition-colors">
                            <CloseIcon size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onClick={() => masterFileInputRef.current?.click()}
                    className="border-2 border-dashed p-6 text-center space-y-3 transition-all cursor-pointer group rounded-xl border-white/10 hover:border-primary-cyan/30"
                  >
                    <div className="flex justify-center">
                      <div className="p-3 bg-white/5 transition-colors text-on-surface-variant group-hover:text-primary-cyan">
                        <Upload size={24} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{t('Add a Document', 'Ajouter un Document')}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{t('Max 100MB each — add as many as needed', 'Max 100 Mo chacun — ajoutez-en autant que nécessaire')}</p>
                    </div>
                  </div>
                </div>

                {/* Galerie multimedia reelle - avant ce fix, une fiche
                    projet n'affichait qu'une seule image dupliquee 3 fois
                    en fausse galerie, sans aucune vraie photo
                    supplementaire, video ou audio possible. */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
                    <Images size={14} /> {t('Additional Gallery Images', 'Images Supplémentaires de la Galerie')} ({galleryFiles.length}/{MAX_GALLERY_IMAGES})
                  </label>
                  <p className="text-[10px] text-on-surface-variant/50">{t('Real photos of your project — sketches, sets, behind the scenes, finished pieces. This is what convinces a patron to support you.', 'Vraies photos de votre projet — croquis, décors, coulisses, pièces finies. C\'est ce qui convainc un mécène de vous soutenir.')}</p>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryFilesSelect} className="hidden" />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    ))}
                    {galleryFiles.length < MAX_GALLERY_IMAGES && (
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-primary-cyan/30 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary-cyan transition-all"
                      >
                        <Images size={18} />
                        <span className="text-[9px] font-bold uppercase">{t('Add', 'Ajouter')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Video et audio optionnels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2"><Video size={14} /> {t('Video (optional)', 'Vidéo (optionnel)')}</label>
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                    <div onClick={() => videoInputRef.current?.click()} className={`border-2 border-dashed p-4 text-center cursor-pointer rounded-xl transition-all ${videoFile ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-white/10 hover:border-primary-cyan/30'}`}>
                      {videoFile ? (
                        <p className="text-[10px] font-bold text-emerald-400 uppercase truncate">{videoFile.name}</p>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant uppercase">{t('Max 100MB', 'Max 100 Mo')}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2"><Music size={14} /> {t('Audio Excerpt (optional)', 'Extrait Audio (optionnel)')}</label>
                    <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
                    <div onClick={() => audioInputRef.current?.click()} className={`border-2 border-dashed p-4 text-center cursor-pointer rounded-xl transition-all ${audioFile ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-white/10 hover:border-primary-cyan/30'}`}>
                      {audioFile ? (
                        <p className="text-[10px] font-bold text-emerald-400 uppercase truncate">{audioFile.name}</p>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant uppercase">{t('Max 30MB', 'Max 30 Mo')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">{t('Project Roadmap', 'Feuille de Route du Projet')}</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{t('Define the milestones that will drive contract value.', 'Définissez les jalons qui stimuleront la valeur du contrat.')}</p>
                  </div>
                  <button 
                    onClick={handleSuggestMilestones}
                    disabled={isSuggestingMilestones || !description}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-primary-cyan/20 transition-all disabled:opacity-50 rounded-xl"
                  >
                    <Sparkles size={14} className={isSuggestingMilestones ? 'animate-pulse' : ''} />
                    {isSuggestingMilestones ? t('Analyzing...', 'Analyse...') : t('AI Suggest Milestones', 'Suggestions de Jalons par l\'IA')}
                  </button>
                </div>

                {/* Milestone Form */}
                <div className="p-6 bg-surface-dim border border-white/10 rounded-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">{t('Label', 'Libellé')}</label>
                      <input 
                        className="w-full bg-surface-low border border-white/10 p-3 text-xs tracking-widest rounded-xl"
                        placeholder={t('e.g. Beta Launch', 'ex: Lancement Beta')}
                        value={newMilestone.label}
                        onChange={(e) => setNewMilestone({ ...newMilestone, label: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">{t('Target Date', 'Date Cible')}</label>
                      <input 
                        type="month"
                        className="w-full bg-surface-low border border-white/10 p-3 text-xs tracking-widest rounded-xl"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">{t('Impact (%)', 'Impact (%)')}</label>
                      <input 
                        type="number"
                        className="w-full bg-surface-low border border-white/10 p-3 text-xs tracking-widest font-mono rounded-xl"
                        value={newMilestone.scoreImpact}
                        onChange={(e) => setNewMilestone({ ...newMilestone, scoreImpact: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">{t('Status', 'Statut')}</label>
                      <select 
                        className="w-full bg-surface-low border border-white/10 p-3 text-xs uppercase tracking-widest appearance-none rounded-xl"
                        value={newMilestone.status}
                        onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
                      >
                        <option value="UPCOMING">{t('Upcoming', 'À venir')}</option>
                        <option value="IN_PROGRESS">{t('In Progress', 'En cours')}</option>
                        <option value="COMPLETED">{t('Completed', 'Terminé')}</option>
                        <option value="FAILED">{t('Failed', 'Échoué')}</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={handleAddMilestone}
                    className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2 rounded-xl"
                  >
                    <Plus size={14} />
                    {t('Add Milestone', 'Ajouter un Jalon')}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {milestones.length > 0 ? (
                    milestones.map((milestone, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-surface-dim border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-primary-cyan/30 transition-all rounded-xl"
                      >
                        {editingMilestoneIndex === index ? (
                          <div className="w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input 
                                className="bg-surface-low border border-white/20 p-2 text-xs text-white rounded-xl"
                                value={milestone.label}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[index].label = e.target.value;
                                  setMilestones(updated);
                                }}
                              />
                              <input 
                                type="month"
                                className="bg-surface-low border border-white/20 p-2 text-xs text-white rounded-xl"
                                value={milestone.date}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[index].date = e.target.value;
                                  setMilestones(updated);
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  className="bg-surface-low border border-white/20 p-2 text-xs text-white w-20 rounded-xl"
                                  value={milestone.scoreImpact}
                                  onChange={(e) => {
                                    const updated = [...milestones];
                                    updated[index].scoreImpact = Number(e.target.value);
                                    setMilestones(updated);
                                  }}
                                />
                                <span className="text-white opacity-50">%</span>
                              </div>
                              <select 
                                className="bg-surface-low border border-white/20 p-2 text-xs uppercase text-white rounded-xl"
                                value={milestone.status}
                                onChange={(e) => {
                                  const updated = [...milestones];
                                  updated[index].status = e.target.value as any;
                                  setMilestones(updated);
                                }}
                              >
                                <option value="UPCOMING">{t('Upcoming', 'À venir')}</option>
                                <option value="IN_PROGRESS">{t('In Progress', 'En cours')}</option>
                                <option value="COMPLETED">{t('Completed', 'Terminé')}</option>
                                <option value="FAILED">{t('Failed', 'Échoué')}</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingMilestoneIndex(null)}
                                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-sm flex items-center gap-2"
                              >
                                <Check size={14} />
                                {t('Save', 'Enregistrer')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 flex items-center justify-center ${
                                milestone.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                milestone.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                                milestone.status === 'IN_PROGRESS' ? 'bg-violet-500/10 text-violet-500' :
                                'bg-primary-cyan/10 text-primary-cyan'
                              }`}>
                                {milestone.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface">{milestone.label}</h4>
                                  <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-widest border ${
                                    milestone.status === 'COMPLETED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                    milestone.status === 'FAILED' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                                    milestone.status === 'IN_PROGRESS' ? 'border-violet-500/30 text-violet-500 bg-violet-500/5' :
                                    'border-white/10 text-on-surface-variant'
                                  }`}>
                                    {t(milestone.status, milestone.status)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{t('Estimated Date', 'Date Estimée')}: {milestone.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{t('Score Impact', 'Impact sur le Score')}</div>
                                <div className="flex items-center gap-1 text-primary-cyan font-bold">
                                  <TrendingUp size={14} />
                                  <span className="text-sm font-mono">+{milestone.scoreImpact}% Score</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setEditingMilestoneIndex(index)}
                                  className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                                  className="p-2 text-on-surface-variant hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-on-surface-variant/40 space-y-4 rounded-xl">
                      <Calendar size={48} className="opacity-20" />
                      <p className="text-xs uppercase tracking-[0.2em]">{t('No milestones defined yet', 'Aucun jalon défini pour le moment')}</p>
                      <p className="text-[10px] uppercase tracking-widest text-center max-w-xs leading-relaxed">
                        {t('Use the AI suggestion tool or add milestones manually to build your project roadmap.', 'Utilisez l\'outil de suggestion IA ou ajoutez des jalons manuellement pour construire la feuille de route de votre projet.')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Contract Duration (Months)', 'Durée du Contrat (Mois)')}</label>
                    <input 
                      type="number" 
                      className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all font-mono text-sm rounded-xl" 
                      value={contractDuration}
                      onChange={(e) => setContractDuration(e.target.value)}
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Maturity Date', 'Date d\'Échéance')}</label>
                    <input 
                      type="date" 
                      className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all font-mono text-sm rounded-xl" 
                      value={maturityDate}
                      onChange={(e) => setMaturityDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Patronage Funding Goal (Optional)', 'Objectif de Financement Mécénat (Optionnel)')}</label>
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">USD</span>
                    </div>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all font-mono text-sm rounded-xl" 
                      value={fundingGoal}
                      onChange={(e) => setFundingGoal(e.target.value)}
                      placeholder={t('e.g. 5000', 'ex : 5000')}
                    />
                    <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wide leading-relaxed">
                      {t('Leave blank to simply display cumulative support with no fixed target. Typical ranges: small project €500–2,000 · medium €2,000–10,000 · large €10,000+.', 'Laissez vide pour afficher uniquement le soutien cumulé, sans objectif fixe. Fourchettes indicatives : petit projet 500–2 000 € · moyen 2 000–10 000 € · grand 10 000 €+.')}
                    </p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Info size={14} className="text-emerald-400" />
                      <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">{t('No Deposit Required', 'Aucun Dépôt Requis')}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest leading-relaxed opacity-70">
                      {t('Submitting a project for LYA certification is entirely free. Certification is granted on merit, not on the creator\'s financial capacity.', 'Soumettre un projet à la certification LYA est entièrement gratuit. La certification est accordée sur le mérite, pas sur la capacité financière du créateur.')}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">{t('Rarity Classification', 'Classification de Rareté')}</label>
                    <select className="w-full bg-surface-dim border border-white/10 text-on-surface p-4 focus:border-primary-cyan/50 focus:ring-0 transition-all text-sm uppercase tracking-widest appearance-none rounded-xl">
                      <option>{t('Standard', 'Standard')}</option>
                      <option>{t('Distinguished', 'Distingué')}</option>
                      <option>{t('Exceptional', 'Exceptionnel')}</option>
                      <option>{t('Signature', 'Signature')}</option>
                    </select>
                  </div>
                  <div className="p-6 bg-primary-cyan/5 border border-primary-cyan/20 space-y-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-primary-cyan" />
                      <span className="text-xs font-bold uppercase tracking-widest text-primary-cyan">{t('LYA Certification Standard', 'Standard de Certification LYA')}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed uppercase tracking-wider">
                      {t(
                        'Your project will be evaluated on the LYA Score (0-1000), combining algorithmic analysis and professional committee review — the same objective standard applied to every certified project on the platform.',
                        'Votre projet sera évalué selon le Score LYA (0-1000), combinant analyse algorithmique et revue par un comité de professionnels — le même standard objectif appliqué à chaque projet certifié sur la plateforme.'
                      )}
                    </p>
                    <div className="pt-4 border-t border-primary-cyan/10 space-y-2 rounded-xl">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                        <span>{t('Certification Fee', 'Frais de Certification')}</span>
                        <span className="text-emerald-400 font-bold">{t('Free', 'Gratuit')}</span>
                      </div>
                      <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                        <span>{t('Patronage Platform Fee', 'Frais de Plateforme Mécénat')}</span>
                        <span className="text-on-surface font-bold">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    t('Commercial Usage Rights', 'Droits d\'Usage Commercial'),
                    t('Derivative Creation Rights', 'Droits de Création de Dérivés'),
                    t('Public Exhibition Rights', 'Droits d\'Exposition Publique'),
                    t('Institutional Lending Rights', 'Droits de Prêt Institutionnel'),
                    t('Credited Recognition', 'Reconnaissance Créditée'),
                    t('Community Update Access', 'Accès aux Mises à Jour Communautaires')
                  ].map(right => {
                    const isChecked = selectedRights.includes(right);
                    return (
                      <div 
                        key={right} 
                        onClick={() => setSelectedRights(prev => isChecked ? prev.filter(r => r !== right) : [...prev, right])}
                        className={`flex items-center gap-4 p-4 bg-surface-dim border transition-all cursor-pointer group rounded-xl ${isChecked ? 'border-primary-cyan/50 bg-primary-cyan/5' : 'border-white/5 hover:border-primary-cyan/30'}`}
                      >
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'border-primary-cyan' : 'border-white/20 group-hover:border-primary-cyan/50'}`}>
                          <div className={`w-2 h-2 bg-primary-cyan transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <span className="text-xs uppercase tracking-widest font-bold">{right}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-6 bg-accent-gold/5 border border-accent-gold/20 flex gap-4 rounded-xl">
                  <Info className="text-accent-gold shrink-0" size={20} />
                  <p className="text-xs text-accent-gold leading-relaxed uppercase tracking-wider">
                    {t(
                      'Legal rights are hard-coded into the contrat numérique certifié. Once deployed, these terms are immutable and enforceable across all jurisdictions via the LYA Legal Framework.',
                      'Les droits légaux sont codés en dur dans le contrat numérique certifié. Une fois déployés, ces termes sont immuables et exécutoires dans toutes les juridictions via le Cadre Légal LYA.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="bg-surface-dim border border-white/5 p-8 space-y-6 rounded-xl">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex gap-6">
                      {generatedImage && (
                        <div className="w-24 h-24 border border-white/10 overflow-hidden shrink-0 rounded-xl">
                          <img 
                            src={generatedImage} 
                            alt="Contract Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold font-headline uppercase tracking-widest text-primary-cyan">{assetName || 'NEON VOID ARCHIVE'}</h3>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{t('By', 'Par')} {issuerName || 'ALPHA STUDIO'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold uppercase tracking-widest text-accent-gold">{t('Signature Tier', 'Niveau Signature')}</div>
                      <div className="text-[10px] text-primary-cyan uppercase tracking-widest mt-2">{t('Maturity', 'Échéance')}: {maturityDate} ({contractDuration} {t('Months', 'Mois')})</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5 rounded-xl">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('Registry Address', 'Adresse du Registre')}</h4>
                        <p className="text-sm font-mono text-on-surface">0x7F9D...E2A4 (LYA SYSTEM_PENDING)</p>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('Contract Creation Date', 'Date de Création du Contrat')}</h4>
                        <p className="text-sm font-mono text-on-surface">{new Date().toLocaleDateString(t('en-US', 'fr-FR'), { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="pt-2 border-t border-white/5 rounded-xl">
                        <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">{t('Certification Fee', 'Frais de Certification')}</h4>
                        <p className="text-lg font-black text-emerald-400 italic">{t('Free', 'Gratuit')}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('Project Milestones', 'Jalons du Projet')}</h4>
                        <div className="space-y-1">
                          {milestones.map((m, i) => (
                            <div key={i} className="flex justify-between text-[10px] uppercase tracking-widest">
                              <span className="text-on-surface-variant">{m.label}</span>
                              <span className="text-primary-cyan font-bold">+{m.scoreImpact}%</span>
                            </div>
                          ))}
                          {milestones.length === 0 && <p className="text-[10px] text-on-surface-variant italic">{t('None defined', 'Aucun défini')}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('Contract Status', 'Statut du Contrat')}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent-gold rounded-full animate-pulse" />
                          <span className="text-sm font-bold text-accent-gold uppercase tracking-widest">{t('Pending Deployment', 'Déploiement en Attente')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-white/5 rounded-xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ShieldCheck size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('IP Verified', 'PI Vérifiée')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <FileText size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('Rights Encrypted', 'Droits Chiffrés')}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary-cyan">
                        <Award size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('Institutional Ready', 'Prêt Institutionnel')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-primary-cyan/5 border border-primary-cyan/20 rounded-xl">
                  <p className="text-xs text-primary-cyan leading-relaxed uppercase tracking-wider text-center">
                    {t(
                      'By clicking "Deploy Contract", you authorize the LYA Registry to generate a contrat numérique certifié on the registre certifié. This action is irreversible.',
                      'En cliquant sur "Déployer le Contrat", vous autorisez la plateforme LYA à générer un contrat numérique certifié sur le registre certifié. Cette action est irréversible.'
                    )}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8">
        <button 
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className={`flex items-center gap-2 px-8 py-4 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${
            currentStep === 1 || isSubmitting ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95'
          }`}
        >
          <ChevronLeft size={16} />
          {t('Back', 'Retour')}
        </button>
        <button 
          onClick={handleNext}
          disabled={isSubmitting || !currentStepValid}
          title={!currentStepValid ? t('Complete this step to continue', 'Complétez cette étape pour continuer') : undefined}
          className="flex items-center gap-2 px-12 py-4 bg-primary-cyan text-surface-dim font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-cyan"
        >
          {isSubmitting ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Plus size={16} />
              </motion.div>
              {t('Deploying...', 'Déploiement...')}
            </>
          ) : (
            <>
              {currentStep === STEPS.length ? t('Deploy Contract', 'Déployer le Contrat') : t('Next Step', 'Étape Suivante')}
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
  );
};
