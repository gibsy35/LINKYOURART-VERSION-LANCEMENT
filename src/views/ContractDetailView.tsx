
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Globe, 
  FileText, 
  Award, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Download,
  Lock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  MessageSquare,
  Send,
  User,
  Star,
  Plus,
  Sparkles,
  TrendingDown,
  Target,
  Info,
  Layers,
  Scale
} from 'lucide-react';
import {Contract, PillarScore, getContractDescription} from '../types';
import { translatePillarLabel } from '../utils/pillars';
import { useTranslation } from '../context/LanguageContext';
import { simulatePDFDownload } from '../utils/download';
import { generateAssetAnalysis } from '../services/geminiService';
import { getSafeImageUrl, handleImageError } from '../utils/image';
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
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line
} from 'recharts';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ContractDetailViewProps {
  contract: Contract;
  onBack: () => void;
  onNotify: (msg: string) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent, id: string) => void;
}

export const ContractDetailView: React.FC<ContractDetailViewProps> = ({ 
  contract, 
  onBack, 
  onNotify,
  isWatchlisted = false,
  onToggleWatchlist
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'certification' | 'ai-simulator' | 'legal' | 'milestones' | 'messaging'>('overview');
  const [attachments, setAttachments] = useState<{name:string,url:string,size:number,type:string,uploadedAt:string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 Mo
  const [priceTimeframe, setPriceTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  
  // Évaluation values
  const scoreAlgoValue = contract.scoreAlgo || 885;
  const scoreProValue = contract.scorePro || 912;
  const scoreFinalValue = Math.round((scoreAlgoValue + scoreProValue) / 2);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await generateAssetAnalysis(contract.name, contract.description || "", scoreFinalValue, language);
      setAiAnalysis(analysis);
    } catch (err) {
      onNotify?.("AI Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
     if (!aiAnalysis) {
        setAiAnalysis("This project shows strong certification fundamentals. Continued professional review and milestone completion are recommended to strengthen its LYA Score.");
     }
  }, []);

  // Charger les pièces jointes existantes
  useEffect(() => {
    const loadAttachments = async () => {
      try {
        const q = query(collection(db, 'contract_attachments'), where('contractId', '==', contract.id));
        const snap = await getDocs(q);
        setAttachments(snap.docs.map(d => d.data() as any));
      } catch(e) { console.warn('Attachments load error:', e); }
    };
    loadAttachments();
  }, [contract.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      onNotify(t('Fichier trop lourd — max 500 Mo', 'File too large — max 500 MB'));
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `contracts/${contract.id}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)),
        (err) => { onNotify(t('Erreur upload', 'Upload error')); setUploading(false); },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const attachment = {
            contractId: contract.id,
            name: file.name,
            url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          };
          await addDoc(collection(db, 'contract_attachments'), attachment);
          setAttachments(prev => [...prev, attachment]);
          setUploading(false);
          setUploadProgress(0);
          onNotify(t(`✦ ${file.name} uploadé`, `✦ ${file.name} uploaded`));
        }
      );
    } catch(e) { onNotify(t('Erreur upload', 'Upload error')); setUploading(false); }
    e.target.value = '';
  };

  const pillarData = (contract.pillars || []).map(p => ({
    name: translatePillarLabel(p.label, language),
    value: p.score,
    full: 200
  }));

  return (
    <div id="contract-detail-dashboard" className="min-h-screen bg-surface-dim text-white lg:pb-32">
      {/* Top Professional Header */}
      <div className="sticky top-0 z-[100] bg-surface-lowest/80 backdrop-blur-3xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-cyan hover:text-surface-dim transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.2em]">{contract.registryIndex}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{contract.category}</span>
            </div>
            <h1 className="text-xl font-headline font-black tracking-tighter uppercase leading-none">{contract.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Multilingual Toggle */}
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
            <button 
              onClick={() => setLanguage('FR')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${language === 'FR' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              FR
            </button>
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${language === 'EN' ? 'bg-white text-black shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              EN
            </button>
          </div>



          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{t('LYA SCORE', 'SCORE LYA')}</span>
            <span className="text-xl font-black font-headline text-emerald-400 leading-none">{scoreFinalValue}/1000</span>
          </div>
          <button 
            onClick={(e) => onToggleWatchlist?.(e, contract.id)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isWatchlisted ? 'bg-accent-gold border-accent-gold text-surface-dim' : 'bg-white/5 border-white/10'}`}
          >
            <Star size={18} fill={isWatchlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="max-w-full max-w-7xl mx-auto p-6 lg:p-10 lg:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-0">
        
        {/* LEFT COLUMN: Main Visuals & Stats (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
          
          {/* AI Executive Summary Header (Moved from HomeView) */}
          <div className="bg-surface-low/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col gap-10 shadow-3xl overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 via-transparent to-accent-gold/5 opacity-50" />
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary-cyan/20 rounded-2xl flex items-center justify-center text-primary-cyan shrink-0">
                        <Sparkles size={24} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">{t('AI EXECUTIVE SUMMARY', 'RÉSUMÉ EXÉCUTIF IA')}</h3>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 pl-16">{t('REAL-TIME GENERATIVE SYNOPSIS FOR CREATIVE CERTIFICATION', 'SYNOPSIS GÉNÉRATIF EN TEMPS RÉEL POUR LA CERTIFICATION CRÉATIVE')}</p>
                </div>

                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-primary-cyan to-accent-gold text-surface-dim text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,224,255,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0 disabled:opacity-50"
                >
                  {isAnalyzing ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isAnalyzing ? t('ANALYZING...', 'ANALYSE...') : t('GENERATE SYNOPSIS', 'GÉNÉRER LA SYNTHÈSE')}
                </button>
             </div>

             <div className="relative z-10 min-h-[150px] bg-black/20 rounded-[2.5rem] border border-white/5 p-10 flex items-center justify-center text-center">
                <p className="text-lg md:text-2xl font-light text-white leading-relaxed max-w-5xl">
                   "{aiAnalysis || t('Click above to generate a real-time AI analysis of this creative project.', 'Cliquez ci-dessus pour générer une analyse IA en temps réel de ce projet créatif.')}"
                </p>
             </div>
          </div>

          {/* Enhanced Visual Section */}
          <div className="relative aspect-[16/7] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-surface-low">
            <img 
              src={getSafeImageUrl(contract.image, contract.category)} 
              alt={contract.name} 
              onError={handleImageError(contract.category)}
              className="w-full h-full object-cover opacity-90 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
            
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center gap-4">
                  <Activity className="text-primary-cyan animate-pulse" size={18} />
                  <div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">{t('REGISTRY STATUS', 'STATUT REGISTRE')}</div>
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{t('CERTIFIED & ACTIVE', 'CERTIFIÉ & ACTIF')}</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                   <button
                     onClick={() => {
                       const data = JSON.stringify({
                         registryIndex: contract.registryIndex || contract.id,
                         name: contract.name,
                         category: contract.category,
                         lyaScore: contract.totalScore,
                         status: contract.status,
                         rarity: contract.rarity,
                         issuedBy: 'LinkYourArt SASU',
                         exportedAt: new Date().toISOString(),
                       }, null, 2);
                       const blob = new Blob([data], { type: 'application/json' });
                       const url = URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = `${contract.registryIndex || contract.id}_LYA_certification.json`;
                       a.click();
                       URL.revokeObjectURL(url);
                     }}
                     title={t('Download certification data', 'Télécharger les données de certification')}
                     className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Download size={18} />
                   </button>
                   <button onClick={() => { window.dispatchEvent(new CustomEvent('lya-navigate', { detail: 'PROJECT_PUBLIC' })); }} title={t('Public project page', 'Page publique du projet')} className="w-12 h-12 rounded-2xl bg-primary-cyan/20 backdrop-blur-xl border border-primary-cyan/30 flex items-center justify-center text-primary-cyan hover:bg-primary-cyan hover:text-surface-dim transition-all">
                      <ExternalLink size={18} />
                   </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                 <div className="p-8 bg-surface-lowest/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                    <div className="relative">
                       <svg className="w-24 h-24 -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * scoreFinalValue / 1000)} className="text-primary-cyan shadow-[0_0_20px_#00E0FF]" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-headline font-black text-white leading-none">{scoreFinalValue}</span>
                          <span className="text-[10px] font-black text-primary-cyan uppercase tracking-widest mt-1">{t('LYA SCORE', 'SCORE LYA')}</span>
                       </div>
                    </div>
                    <div>
                       <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{t('CERTIFICATION LEVEL', 'NIVEAU DE CERTIFICATION')}</div>
                       <h2 className="text-3xl font-black font-headline tracking-tighter text-white uppercase leading-none">{t('HIGH CONFIDENCE', 'CONFIANCE ÉLEVÉE')}</h2>
                       <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('CERTIFIED & AUDITED', 'CERTIFIÉ & AUDITÉ')}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Dashboard Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t('LYA SCORE', 'SCORE LYA'), value: `${scoreFinalValue}/1000`, status: 'Certified', color: 'emerald' },
              { label: t('CERTIFICATION LEVEL', 'NIVEAU DE CERTIFICATION'), value: scoreFinalValue >= 850 ? t('Exceptional', 'Exceptionnel') : scoreFinalValue >= 650 ? t('Distinguished', 'Distingué') : t('Standard', 'Standard'), status: 'Validated', color: 'cyan' },
              { label: t('SUPPORTERS', 'MÉCÈNES'), value: contract.availableUnits ? contract.availableUnits.toLocaleString() : '—', status: 'Growth', color: 'pink' },
              { label: t('REGISTRY STATUS', 'STATUT REGISTRE'), value: t('Certified', 'Certifié'), status: 'Active', color: 'gold' }
            ].map((metric, i) => (
            <div key={metric.label} className="bg-surface-low border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group shadow-sm">
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{metric.label}</div>
              <div className="text-2xl font-headline font-black text-white mb-2">{metric.value}</div>
              <div className="flex items-center gap-1.5">
                 <div className={`w-1 h-1 rounded-full bg-${metric.color}-400 group-hover:scale-150 transition-transform`} />
                 <span className={`text-xs font-black text-${metric.color}-400 uppercase tracking-widest`}>{metric.status}</span>
              </div>
            </div>
          ))}
        </div>

          {/* Detailed Content Tabs */}
          <div className="bg-surface-low border border-white/5 rounded-[3rem] p-10 shadow-lg min-h-[600px]">
             <div className="flex gap-12 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: t('OVERVIEW', 'VUE D\'ENSEMBLE') },
                  { id: 'legal', label: t('LEGAL & IP', 'JURIDIQUE & IP') },
                  { id: 'milestones', label: t('TIMELINE', 'CALENDRIER') },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-6 text-[12px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${
                      activeTab === tab.id ? 'text-primary-cyan' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-cyan shadow-[0_0_15px_#00E0FF] rounded-full" />
                    )}
                  </button>
                ))}
             </div>

             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-10">
                         <div className="space-y-4">
                           <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                              <FileText size={16} />
                              {t('PROJECT SYNOPSIS', 'SYNOPSIS DU PROJET')}
                           </h4>
                           <p className="text-xl font-light text-white/80 leading-relaxed border-l-4 border-primary-cyan pl-6">
                              "{getContractDescription(contract, language)}"
                           </p>
                         </div>

                         <div className="space-y-6">
                           <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                              <Award size={16} />
                              {t('ENFORCED RIGHTS', 'DROITS APPLIQUÉS')}
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {contract.rights?.map((right, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                                   <div className="w-2 h-2 rounded-full bg-accent-gold shadow-[0_0_8px_#D4AF37]" />
                                   <span className="text-[10px] font-black text-white/70 uppercase tracking-wide">{right}</span>
                                </div>
                              ))}
                           </div>
                         </div>
                      </div>

                      <div className="flex flex-col items-center">
                         <div className="w-full h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pillarData}>
                                <PolarGrid stroke="#ffffff08" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 900 }} />
                                <Radar
                                   name="Scores"
                                   dataKey="value"
                                   stroke="#00E0FF"
                                   fill="#00E0FF"
                                   fillOpacity={0.3}
                                />
                              </RadarChart>
                           </ResponsiveContainer>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full mt-8">
                            {pillarData.map((p, i) => (
                              <div key={i} className="space-y-2">
                                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">{p.name}</span>
                                    <span className="text-primary-cyan">{p.value}</span>
                                 </div>
                                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-cyan" style={{ width: `${(p.value / 200) * 100}%` }} />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>

                     {/* Score Impact Timeline */}
                     <div className="space-y-6 bg-primary-cyan/5 border border-primary-cyan/20 p-8 rounded-[2.5rem] relative overflow-hidden">
                       <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-primary-cyan/5 rounded-full blur-[80px]" />
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                         <div className="space-y-1">
                           <span className="text-[10px] font-mono font-black text-primary-cyan uppercase tracking-[0.3em]">
                             {t('LYA SCORE IMPACT TIMELINE', 'CALENDRIER D\'IMPACT SUR LE SCORE LYA')}
                           </span>
                           <h3 className="text-xl sm:text-2xl font-black font-headline text-white uppercase tracking-tight">
                             {t('MILESTONE-DRIVEN CERTIFICATION PROGRESS', 'PROGRESSION DE CERTIFICATION PAR JALONS')}
                           </h3>
                         </div>
                         <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] text-white/60 font-black tracking-widest uppercase">
                           {t('Live Tracking Active', 'SUIVI DES JALONS TEMPS-RÉEL')}
                         </div>
                       </div>

                       <p className="text-xs text-white/70 leading-relaxed max-w-4xl text-justify">
                         {t('The LYA Score evolves exclusively based on operational quality. Certified milestones raise the score (Milestone +), while missed or delayed milestones lower it (Milestone -). The score is recalculated automatically the moment a milestone is certified or missed.', 'Le Score LYA évolue exclusivement en fonction de la qualité opérationnelle du projet. L\'atteinte des jalons (Jalon +) fait progresser le score, tandis que les retards ou jalons manqués (Jalon -) l\'ajustent à la baisse. Le score est recalculé automatiquement dès qu\'un jalon est certifié ou manqué.')}
                       </p>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                         <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-md">
                               {t('Milestone + (Secured)', '✅ JALON + SÉCURISÉ')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-emerald-400">+45 PTS</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Conceptual Validation', 'VALIDATION DU CONCEPT')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('All legal guidelines, rights registrations, and creative blueprints certified on-registry.', 'Tous les aspects juridiques et droits de propriété intellectuelle validés et enregistrés.')}
                           </p>
                         </div>

                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-accent-gold uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-md">
                               {t('Milestone + (Pending)', '⏳ JALON EN COURS')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-accent-gold">+60 PTS</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Production Phase', 'ÉTAPE DE PRODUCTION')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('Creation, production, or technical execution phases finalized under certified standards.', 'Phases de création, production ou d\'exécution technique en cours de validation.')}
                           </p>
                         </div>

                         <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3 relative">
                           <div className="flex justify-between items-center">
                             <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3.5 py-1 rounded-md">
                               {t('Milestone - (Risk factor)', '⚠️ RETARD IMPACT JALON')}
                             </span>
                             <span className="text-[10px] font-mono font-black text-rose-400">-25 PTS</span>
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{t('Expressed Delay Penalty', 'PÉNALITÉ DE RETARD ÉVENTUEL')}</h4>
                           <p className="text-[11px] text-white/50 text-left leading-relaxed">
                             {t('Failure to meet production timelines or delayed secondary certifications automatically lowers the score.', 'Les retards ou contre-performances de livraison entraînent une correction automatique du score.')}
                           </p>
                         </div>
                       </div>
                     </div>

                    <hr className="border-white/5 my-10" />

                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <Scale className="text-accent-gold" size={20} />
                        <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em]">
                          {t('COMPLETE REGULATORY & CERTIFICATION SHEET', 'FICHE JURIDIQUE & TECHNIQUE INTÉGRALE')}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Financial metrics */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-primary-cyan">{t('CERTIFICATION SPECS', 'SPÉCIFICATIONS DE CERTIFICATION')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('LYA SCORE', 'SCORE LYA')}</div>
                              <div className="text-xl font-headline font-black text-white leading-none">{scoreFinalValue}/1000</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('CREATIVE SECTOR', 'SECTEUR CRÉATIF')}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.category || t('Fine Art', 'Art')}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('CERTIFICATION DATE', "DATE DE CERTIFICATION")}</div>
                              <div className="text-sm font-semibold text-emerald-400">{contract.lastAudit || '15 May 2026'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('PATRON COMMUNITY', "COMMUNAUTÉ DE MÉCÈNES")}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.availableUnits ? contract.availableUnits.toLocaleString() : '—'} {t('supporters', 'mécènes')}</div>
                            </div>
                          </div>
                        </div>

                        {/* Project structure */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-accent-gold">{t('PROJECT STRUCTURE', 'STRUCTURE DU PROJET')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('PATRONAGE MODEL', 'MODÈLE DE MÉCÉNAT')}</div>
                              <span className="px-3.5 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-black uppercase tracking-widest rounded-lg">
                                {t('Recognition-Based Patronage', 'Mécénat de reconnaissance')}
                              </span>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('CERTIFICATION STANDARD', "STANDARD DE CERTIFICATION")}</div>
                              <div className="text-sm font-semibold text-white/90">{t('LYA Trust Assurance', 'LYA Trust Assurance')}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('JURISDICTION', 'JURIDICTION')}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.jurisdiction || 'EU / France'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('NEXT MILESTONE', 'PROCHAIN JALON')}</div>
                              <div className="text-sm font-semibold text-white/90">{contract.maturityDate || '31 Dec 2026'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Audit & transparency */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 hover:border-white/10 transition-all">
                          <div className="text-[10px] font-black uppercase tracking-wider text-accent-pink">{t('AUDIT & COMPLIANCE', 'AUDIT & TRANSPARENCE')}</div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('VALUATOR & CHIEF VALIDATOR', "AGENT D'ÉVALUATION ET CONFORMITÉ")}</div>
                              <div className="text-xs font-black text-white uppercase tracking-tight">{contract.professionalValidator || 'LinkYourArt Advisory Committee'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REGISTRY CATALOG INDEX', 'INDEX UNIQUE DU REGISTRE D\'ŒUVRES')}</div>
                              <div className="text-xs font-mono text-primary-cyan overflow-hidden text-ellipsis whitespace-nowrap bg-black/40 p-2 rounded-lg border border-white/5">
                                {contract.registryAddress || 'LYA-CATALOG-912A8'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('LAST CERTIFIED AUDIT', 'DERNIÈRE ATTÉSTATION CHIFfrée')}</div>
                              <div className="text-sm font-semibold text-emerald-400">{contract.lastAudit || '15 May 2026'}</div>
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{t('REGISTRATION LYA SYSTEM', 'LYA SYSTEME DE SÉCURISATION DU REGISTRE')}</div>
                              <div className="text-xs font-black text-white/80 uppercase tracking-widest font-mono">Co-authenticated Digital Registry</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

               {activeTab === 'legal' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <h4 className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em]">{t('SECURITY MATRIX', 'MATRICE SÉCURITÉ')}</h4>
                       {[
                         { l: 'Registry', v: 'LYA_REGISTRY_71C', i: <Layers size={16} /> },
                         { l: 'Curation', v: 'Co-Optation Verified', i: <Lock size={16} /> },
                         { l: 'Audit', v: 'LYA Committee Review', i: <ShieldCheck size={16} /> }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl group hover:border-accent-gold/40 transition-all">
                            <div className="flex items-center gap-4 text-accent-gold">
                               {item.i}
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.l}</span>
                            </div>
                            <span className="text-xs font-mono font-black text-white">{item.v}</span>
                         </div>
                       ))}
                    </div>
                    <div className="bg-black/20 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-5">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-accent-gold/10 flex items-center justify-center text-accent-gold border border-accent-gold/20">
                          <FileText size={28} />
                       </div>
                       <div className="space-y-1">
                          <h5 className="text-xl font-headline font-black text-white uppercase tracking-tighter">{t('PIÈCES JOINTES', 'ATTACHMENTS')}</h5>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('Max 500 Mo par fichier', 'Max 500 MB per file')}</p>
                       </div>

                       {/* Liste des fichiers */}
                       {attachments.length > 0 && (
                         <div className="w-full space-y-2 text-left">
                           {attachments.map((att, i) => (
                             <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-primary-cyan/40 transition-all group">
                               <FileText size={14} className="text-primary-cyan shrink-0"/>
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black text-white truncate">{att.name}</p>
                                 <p className="text-[9px] text-white/30">{(att.size / 1024 / 1024).toFixed(1)} Mo</p>
                               </div>
                               <Download size={14} className="text-white/40 group-hover:text-primary-cyan transition-colors shrink-0"/>
                             </a>
                           ))}
                         </div>
                       )}

                       {/* Barre de progression */}
                       {uploading && (
                         <div className="w-full space-y-2">
                           <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-primary-cyan transition-all rounded-full" style={{width:`${uploadProgress}%`}}/>
                           </div>
                           <p className="text-xs text-primary-cyan font-black">{uploadProgress}% {t('en cours...','uploading...')}</p>
                         </div>
                       )}

                       {/* Bouton upload */}
                       <label className="w-full cursor-pointer">
                         <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}
                           accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.zip,.rar"/>
                         <div className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-center transition-all ${uploading ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-surface-dim hover:bg-primary-cyan cursor-pointer'}`}>
                           {uploading ? t('Upload en cours...','Uploading...') : t('+ AJOUTER UN FICHIER', '+ ADD A FILE')}
                         </div>
                       </label>

                       <p className="text-[9px] text-white/20">{t('PDF, Word, Images, Vidéos, Archives','PDF, Word, Images, Videos, Archives')}</p>
                    </div>
                 </div>
               )}
               
               {activeTab === 'milestones' && (
                 <div className="relative pl-16 space-y-12">
                    <div className="absolute left-[31px] top-0 bottom-0 w-1 bg-gradient-to-b from-primary-cyan to-white/5 rounded-full" />
                    {contract.milestones?.map((m, i) => (
                       <div key={i} className="relative group">
                          <div className={`absolute -left-[54px] w-12 h-12 rounded-2xl border-4 border-surface-dim flex items-center justify-center transition-all z-20 ${
                             m.status === 'COMPLETED' ? 'bg-emerald-500 text-surface-dim shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 
                             m.status === 'IN_PROGRESS' ? 'bg-accent-gold text-surface-dim pulse' : 'bg-surface-low text-white/20'
                          }`}>
                            {m.status === 'COMPLETED' ? <Zap size={20} /> : <Clock size={20} />}
                          </div>
                          <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all flex justify-between items-center group-hover:translate-x-2 transition-all">
                             <div>
                                <div className="flex items-center gap-4 mb-2">
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-accent-gold'}`}>{m.status} — {m.date}</span>
                                </div>
                                <h4 className="text-2xl font-headline font-black text-white uppercase tracking-tighter leading-none">{m.label}</h4>
                             </div>
                             <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 text-primary-cyan text-[10px] font-black">+{m.scoreImpact}% SCORE</div>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Sidebar (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          {/* LYA SCORING BREAKDOWN */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-3xl">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                   <Target size={18} className="text-primary-cyan" />
                   {t('SCORE BREAKDOWN', 'DÉTAIL DU SCORING')}
                </h3>
             </div>
             <div className="space-y-10">
                <div className="flex items-center gap-6 group">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-accent-pink/10 flex items-center justify-center text-accent-pink border border-accent-pink/20 transition-transform group-hover:scale-110">
                      <Activity size={28} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('ALGO SCORE', 'SCORE ALGO')}</span>
                         <span className="text-2xl font-headline font-black text-white">{scoreAlgoValue}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-accent-pink shadow-[0_0_15px_#FF007F]" style={{ width: `${(scoreAlgoValue / 1000) * 100}%` }} />
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6 group">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 transition-transform group-hover:scale-110">
                      <ShieldCheck size={28} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('PROFESSIONAL SCORE', 'SCORE EXPERT')}</span>
                         <span className="text-2xl font-headline font-black text-white">{scoreProValue}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-400 shadow-[0_0_15px_#00FF00]" style={{ width: `${(scoreProValue / 1000) * 100}%` }} />
                      </div>
                   </div>
                </div>

                <div className="bg-primary-cyan/10 border border-primary-cyan/20 p-8 rounded-[2rem] text-center space-y-4">
                   <div className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em]">{t('LYA CONSOLIDATED', 'INDICE CONSOLIDÉ')}</div>
                   <div className="text-6xl font-black font-headline text-white drop-shadow-[0_0_30px_rgba(0,224,255,0.4)]">{scoreFinalValue}</div>
                   <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('Verified by LinkYourArt Committee', 'Vérifié par le Comité d\'Experts LYA')}</div>
                </div>
             </div>
          </div>

          {/* Issuer Interface */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-8">
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent-gold flex items-center gap-3">
                <User size={18} />
                {t('ISSUER PROFILE', 'PROFIL ÉMETTEUR')}
             </h3>
             <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white relative overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${contract.issuerId}`} alt="issuer" className="w-[80%] h-[80%]" referrerPolicy="no-referrer" />
                </div>
                <div>
                   <div className="text-xl font-headline font-black text-white uppercase tracking-tight">{contract.issuerId}</div>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{t('IDENTITY VERIFIED', 'IDENTITÉ VÉRIFIÉE')}</span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl text-center">
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{t('LYA SCORE', 'SCORE LYA')}</div>
                   <div className="text-lg font-black font-headline text-white">{scoreFinalValue}/1000</div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl text-center">
                   <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{t('STATUS', 'STATUT')}</div>
                   <div className="text-lg font-black font-headline text-emerald-400">{contract.status === 'LIVE' ? t('Certified', 'Certifié') : contract.status}</div>
                </div>
             </div>
             <a
                href={`mailto:contact@linkyourart.com?subject=${encodeURIComponent(t('Question about', 'Question à propos de') + ' ' + contract.name)}`}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-all underline decoration-primary-cyan/30 underline-offset-8 block text-center"
             >
                {t('CONTACT ISSUER SERVICES', 'CONTACTER SERVICES ÉMETTEUR')}
             </a>
          </div>

          {/* Certification Data Export */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                <BarChart3 size={18} />
                {t('DATA EXPORT', 'EXPORT DE DONNÉES')}
             </h3>
             <div className="space-y-4">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${contract.registryIndex || contract.id}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    onNotify(t('✦ Certification data exported', '✦ Données de certification exportées'));
                  }}
                  className="w-full py-5 bg-white/5 hover:bg-white hover:text-black rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4"
                >
                   <FileText size={16} />
                   {t('EXPORT CERTIFICATION DATA (JSON)', 'EXPORTER LES DONNÉES DE CERTIFICATION (JSON)')}
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Floating Visualizer (Ambient Design) — hidden on mobile:
          fixed positioning with no bottom-padding compensation on the
          content column caused it to overlap scrolling text on narrow
          screens, and its only functional element (Exit) already exists
          as the back button in the header above. */}
      <div className="hidden md:block fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
         <div className="px-10 py-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] pointer-events-auto group">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-primary-cyan animate-pulse shadow-[0_0_10px_#00E0FF]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{t('LIVE CONNECTION: STABLE', 'CONNEXION: STABLE')}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-6">
               <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                  {t('EXIT TERMINAL', 'QUITTER TERMINAL')}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};
