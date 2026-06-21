import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Globe, Cpu, CheckCircle2, Lock, Upload, ImageIcon, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const LYAProtocolBadge: React.FC = () => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{name: string, url: string} | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      alert(t('File too large — max 500MB', 'Fichier trop lourd — max 500Mo'));
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `lya-system/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      task.on('state_changed',
        snap => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        () => { setUploading(false); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(db, 'lya_system_docs'), { name: file.name, url, uploadedAt: serverTimestamp() });
          setUploadedFile({ name: file.name, url });
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch { setUploading(false); }
    e.target.value = '';
  };

  const handleGenerateVisual = async () => {
    setGenerating(true);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: t(
              'Generate an SVG visual representing the LinkYourArt creative ecosystem: a network of artists, patrons and professionals connected by LYA Units. Modern, dark background (#0d1117), cyan (#00d4ff) and violet (#a78bfa) accents. Return only the SVG code.',
              'Génère un visuel SVG représentant l\'écosystème créatif LinkYourArt : un réseau d\'artistes, mécènes et professionnels connectés par des LYA Units. Design moderne, fond sombre (#0d1117), accents cyan (#00d4ff) et violet (#a78bfa). Retourne uniquement le code SVG.'
            )
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '';
      const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
      if (svgMatch) setGeneratedVisual(svgMatch[0]);
    } catch { }
    setGenerating(false);
  };

  const features = [
    {
      icon: <Shield className="text-primary-cyan" />,
      title: t('INSTITUTIONAL GUARANTEE', 'GARANTIE INSTITUTIONNELLE'),
      description: t('Every creative contract is secured by the LYA reserve fund and our certified legal network.', 'Chaque contrat créatif est sécurisé par le fonds de réserve LYA et notre réseau juridique certifié.')
    },
    {
      icon: <Globe className="text-accent-gold" />,
      title: t('GLOBAL ENFORCEABILITY', 'EXÉCUTABILITÉ MONDIALE'),
      description: t('LYA legal framework is compatible with EU, US and Asia-Pacific jurisdictions.', 'Le cadre légal LYA est compatible avec les juridictions EU, US et Asie-Pacifique.')
    },
    {
      icon: <Cpu className="text-accent-purple" />,
      title: t('AUTOMATED SETTLEMENT', 'RÈGLEMENT AUTOMATISÉ'),
      description: t('SETTLE_DESC', 'PAYS OFF IMMÉDIAT DÈS QUE LES CONDITIONS DE L’ORACLE SONT REMPLIES.')
    }
  ];

  return (
    <div className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-dim/50 backdrop-blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-primary-cyan/5 border border-primary-cyan/20 rounded-full mb-8"
          >
            <Lock size={14} className="text-primary-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-cyan">{t('THE LYA SYSTEM', 'LE SYSTÈME LYA')}</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-7xl font-black font-headline text-white uppercase tracking-tighter leading-[0.9] mb-8">
            {t('CREATIVE RIGHTS,', 'DROITS CRÉATIFS,')} <br/>
            <span className="text-primary-cyan drop-shadow-[0_0_30px_rgba(0,224,255,0.4)]">{t('CERTIFIED & SHARED.', 'CERTIFIÉS & PARTAGÉS.')}</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-on-surface-variant/60 font-black uppercase tracking-[0.2em] text-xs md:text-sm leading-relaxed">
            {t('LinkYourArt is the first platform dedicated to the valorisation, sharing and protection of creative rights — for creators, patrons and professionals worldwide.', 'LinkYourArt est la première plateforme dédiée à la valorisation, au partage et à la protection des droits créatifs — pour les créateurs, mécènes et professionnels du monde entier.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-low border border-white/5 p-10 rounded-2xl group hover:border-primary-cyan/30 transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
              
              <div className="w-16 h-16 bg-surface-dim border border-white/10 flex items-center justify-center mb-8 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-black font-headline text-white uppercase tracking-tighter mb-4 group-hover:text-primary-cyan transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-xs text-on-surface-variant font-black uppercase tracking-widest leading-relaxed opacity-60">
                {feature.description}
              </p>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">ACTIVE</span>
                </div>
                <Zap size={14} className="text-accent-gold" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload + Génération IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Upload de document */}
          <div className="bg-surface-low border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-cyan/10 border border-primary-cyan/20 rounded-xl flex items-center justify-center">
                <Upload size={18} className="text-primary-cyan"/>
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">{t('Upload a document', 'Uploader un document')}</p>
                <p className="text-[10px] text-white/30">{t('PDF, Word, Images — max 500MB', 'PDF, Word, Images — max 500Mo')}</p>
              </div>
            </div>
            {uploading && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-cyan rounded-full transition-all" style={{width:`${uploadProgress}%`}}/>
                </div>
                <p className="text-[10px] text-primary-cyan font-black">{uploadProgress}% {t('uploading...', 'en cours...')}</p>
              </div>
            )}
            {uploadedFile && (
              <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                <FileText size={12} className="text-emerald-400"/>
                <span className="text-[10px] font-black text-emerald-400 truncate">{uploadedFile.name}</span>
              </a>
            )}
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.zip"/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full py-3 bg-primary-cyan/10 border border-primary-cyan/25 text-primary-cyan text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-cyan/20 disabled:opacity-40 transition-all">
              {uploading ? t('Uploading...', 'Upload en cours...') : t('+ Select a file', '+ Sélectionner un fichier')}
            </button>
          </div>

          {/* Génération visuel IA */}
          <div className="bg-surface-low border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-[#a78bfa]"/>
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">{t('Generate a visual', 'Générer un visuel')}</p>
                <p className="text-[10px] text-white/30">{t('AI-powered LYA ecosystem illustration', 'Illustration IA de l\'écosystème LYA')}</p>
              </div>
            </div>
            {generatedVisual && (
              <div className="w-full rounded-xl overflow-hidden border border-[#a78bfa]/20"
                dangerouslySetInnerHTML={{__html: generatedVisual}}/>
            )}
            <button onClick={handleGenerateVisual} disabled={generating}
              className="w-full py-3 bg-[#a78bfa]/10 border border-[#a78bfa]/25 text-[#a78bfa] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#a78bfa]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {generating ? (
                <><span className="animate-spin">✦</span> {t('Generating...', 'Génération en cours...')}</>
              ) : (
                <><ImageIcon size={12}/> {t('Generate visual', 'Générer le visuel')}</>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 z-[-1] opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00e0ff 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }} 
      />
    </div>
  );
};
