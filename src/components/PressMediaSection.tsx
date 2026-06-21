import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, FileText, Send, CheckCircle, Star, ChevronDown, ChevronUp, Filter, BookOpen, Mic, Camera, PenTool, Globe } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface Props {
  t: (fr: string, en: string) => string;
  language: string;
  onNotify: (msg: string) => void;
}

const CONTRIBUTIONS = [
  {
    code: 'LYA-PRESS-001',
    icon: <FileText size={16}/>,
    type_fr: 'Article de fond', type_en: 'In-depth article',
    subject_fr: "Impact de la co-propriété artistique sur l'économie créative européenne",
    subject_en: 'Impact of artistic co-ownership on the European creative economy',
    brief_fr: "Nous recherchons un angle éditorial sur la transformation du financement culturel. Liberté éditoriale totale, données LYA fournies en exclusivité.",
    brief_en: "We're looking for an editorial angle on the transformation of cultural funding. Full editorial freedom, exclusive LYA data provided.",
    sector: 'Film / TV Series / Global',
    lang: 'FR/EN',
    badge: 'LYA Press',
    badgeColor: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/25',
    remuner_fr: 'Rémunéré — tarif à négocier',
    remuner_en: 'Paid — rate to negotiate',
    deadline: 'Open',
    color: 'border-[#a78bfa]/20 hover:border-[#a78bfa]/50',
  },
  {
    code: 'LYA-PRESS-002',
    icon: <Mic size={16}/>,
    type_fr: 'Podcast / Interview audio',
    type_en: 'Podcast / Audio interview',
    subject_fr: "Voix de créateurs — témoignages de l'intérieur de l'économie créative",
    subject_en: "Creator voices — testimonies from inside the creative economy",
    brief_fr: "Série de 4 épisodes autour de créateurs LYA (anonymisés). Format libre, entre 20 et 45 minutes. Production assurée par LYA.",
    brief_en: "Series of 4 episodes around LYA creators (anonymized). Free format, 20 to 45 minutes. Production by LYA.",
    sector: 'Music / Film / Fashion',
    lang: 'FR',
    badge: 'LYA Editorial',
    badgeColor: 'text-primary-cyan bg-primary-cyan/10 border-primary-cyan/25',
    remuner_fr: 'Rémunéré par épisode',
    remuner_en: 'Paid per episode',
    deadline: 'Open',
    color: 'border-primary-cyan/20 hover:border-primary-cyan/50',
  },
  {
    code: 'LYA-PRESS-003',
    icon: <Camera size={16}/>,
    type_fr: 'Reportage photo / Vidéo',
    type_en: 'Photo / Video essay',
    subject_fr: "La nouvelle génération de créateurs visuels — regards croisés Europe / Asie",
    subject_en: "The new generation of visual creators — cross-perspectives Europe / Asia",
    brief_fr: "Reportage en immersion auprès de 3 à 5 créateurs visuels. Les visages ne seront pas publiés — focus sur les œuvres et les espaces de création.",
    brief_en: "Immersive report with 3 to 5 visual creators. Faces won't be published — focus on works and creative spaces.",
    sector: 'Visual Art / Architecture',
    lang: 'EN',
    badge: 'LYA Press',
    badgeColor: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/25',
    remuner_fr: 'Rémunéré + droits image',
    remuner_en: 'Paid + image rights',
    deadline: 'Open',
    color: 'border-emerald-400/20 hover:border-emerald-400/50',
  },
  {
    code: 'LYA-PRESS-004',
    icon: <PenTool size={16}/>,
    type_fr: 'Tribune / Opinion',
    type_en: 'Tribune / Opinion piece',
    subject_fr: "L'art comme actif vivant — vers une nouvelle économie créative mondiale",
    subject_en: "Art as a living asset — toward a new global creative economy",
    brief_fr: "Tribune d'opinion signée sous pseudonyme LYA. Angle économique, culturel ou sociétal. 800 à 1500 mots. Publication sur LYA + partenaires médias.",
    brief_en: "Opinion piece signed under LYA pseudonym. Economic, cultural or societal angle. 800 to 1500 words. Published on LYA + media partners.",
    sector: 'Global',
    lang: 'FR/EN',
    badge: 'LYA Editorial',
    badgeColor: 'text-accent-gold bg-accent-gold/10 border-accent-gold/25',
    remuner_fr: 'Rémunéré',
    remuner_en: 'Paid',
    deadline: 'Open',
    color: 'border-accent-gold/20 hover:border-accent-gold/50',
  },
];

const PUBLICATIONS = [
  { code: 'LYA-PUB-2026-01', title_fr: "LinkYourArt : quand l'art devient un actif partagé", title_en: "LinkYourArt: when art becomes a shared asset", source: 'Média Créatif Indépendant', sector: 'Global', impact: '+8', reads: '12.4K', up: true },
  { code: 'LYA-PUB-2026-02', title_fr: "La mode comme actif vivant — le cas LinkYourArt", title_en: "Fashion as a living asset — the LinkYourArt case", source: 'Tribune Fashion & Business', sector: 'Fashion', impact: '+12', reads: '8.7K', up: true },
  { code: 'LYA-PUB-2026-03', title_fr: "Séries TV et co-propriété : une révolution silencieuse", title_en: "TV series and co-ownership: a silent revolution", source: 'Revue Audiovisuelle', sector: 'TV Series', impact: '+6', reads: '5.2K', up: true },
  { code: 'LYA-PUB-2026-04', title_fr: "Musique indépendante et financement alternatif : les nouvelles règles du jeu", title_en: "Independent music and alternative funding: new rules of the game", source: 'Press Music Pro', sector: 'Music', impact: '+15', reads: '21.1K', up: true },
];

const STATS = [
  { label_fr: 'Contributeurs actifs', label_en: 'Active contributors', value: '47', color: 'text-[#a78bfa]' },
  { label_fr: 'Publications ce mois', label_en: 'Publications this month', value: '12', color: 'text-primary-cyan' },
  { label_fr: 'Lecteurs touchés', label_en: 'Readers reached', value: '89K+', color: 'text-accent-gold' },
  { label_fr: 'Impact LYA moyen', label_en: 'Average LYA impact', value: '+10pts', color: 'text-emerald-400' },
];

export const PressMediaSection: React.FC<Props> = ({ t, language, onNotify }) => {
  const isFR = language === 'FR';
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [applyModal, setApplyModal] = useState<typeof CONTRIBUTIONS[0] | null>(null);
  const [accredModal, setAccredModal] = useState(false);
  const [form, setForm] = useState({ specialty: '', media: '', message: '', lang: 'FR/EN' });
  const [accredForm, setAccredForm] = useState({ type: '', media: '', experience: '', message: '' });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [accredSubmitted, setAccredSubmitted] = useState(false);

  const filters = ['ALL', 'Article', 'Podcast', 'Photo/Vidéo', 'Tribune'];

  const filtered = activeFilter === 'ALL' ? CONTRIBUTIONS : CONTRIBUTIONS.filter(c =>
    activeFilter === 'Article' ? c.code === 'LYA-PRESS-001' :
    activeFilter === 'Podcast' ? c.code === 'LYA-PRESS-002' :
    activeFilter === 'Photo/Vidéo' ? c.code === 'LYA-PRESS-003' :
    activeFilter === 'Tribune' ? c.code === 'LYA-PRESS-004' : true
  );

  const handleApply = async () => {
    if (!form.specialty || !form.message) return;
    try {
      await addDoc(collection(db, 'press_applications'), {
        contributionCode: applyModal?.code,
        contributionTitle: isFR ? applyModal?.subject_fr : applyModal?.subject_en,
        specialty: form.specialty,
        media: form.media,
        message: form.message,
        lang: form.lang,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      });
      setSubmitted(applyModal?.code || '');
      setApplyModal(null);
      setForm({ specialty: '', media: '', message: '', lang: 'FR/EN' });
      onNotify(t('✦ Application sent — Reply within 48h via your Pro space.', '✦ Candidature envoyée — Réponse sous 48h via votre espace Pro.'));
    } catch(e) {
      onNotify(t('Network error', 'Erreur réseau'));
    }
  };

  const handleAccred = async () => {
    if (!accredForm.type || !accredForm.message) return;
    try {
      await addDoc(collection(db, 'press_accreditations'), {
        ...accredForm,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      });
      setAccredSubmitted(true);
      setAccredModal(false);
      onNotify(t('✦ Demande d\'accréditation LYA Press envoyée — 5 jours ouvrés.', '✦ LYA Press accreditation request sent — 5 business days.'));
    } catch(e) {
      onNotify(t('Network error', 'Erreur réseau'));
    }
  };

  return (
    <div className="space-y-8">

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#a78bfa]/10 via-surface-low to-primary-cyan/5 border border-[#a78bfa]/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#a78bfa]/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#a78bfa]/20 border border-[#a78bfa]/30 rounded-full text-[10px] font-black text-[#a78bfa] uppercase tracking-widest">★ LYA Press & Médias</span>
              <span className="px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400">● {t('Actif', 'Active')}</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              {t('Create with us.', 'Créez avec nous.')}<br/>
              <span className="text-[#a78bfa]">{t('L\'œuvre avant l\'auteur.', 'The work before the author.')}</span>
            </h2>
            <p className="text-sm text-on-surface-variant/60 leading-relaxed">
              {t('Un espace réservé aux journalistes, influenceurs et rédacteurs créatifs. Identités protégées, créations valorisées. Accès complet réservé aux membres Pro vérifiés.',
                 'A space reserved for journalists, influencers and creative writers. Protected identities, valued creations. Full access reserved for verified Pro members.')}
            </p>
            <button onClick={() => setAccredModal(true)}
              className="px-6 py-3 bg-[#a78bfa] text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(167,139,250,0.2)]">
              {accredSubmitted ? t('✓ Request sent', '✓ Demande envoyée') : t('Obtenir le badge LYA Press', 'Get the LYA Press badge')}
            </button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s, i) => (
              <div key={i} className="bg-black/20 border border-white/8 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">{isFR ? s.label_fr : s.label_en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* APPELS À CONTRIBUTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Call for Contributions', 'Appels à contribution')}</h3>
            <span className="px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400">● {CONTRIBUTIONS.length} {t('ouverts', 'open')}</span>
          </div>
          {/* Filtres */}
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full transition-all ${activeFilter === f ? 'bg-[#a78bfa] text-surface-dim' : 'bg-surface-low border border-white/10 text-on-surface-variant hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div key={item.code} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`bg-surface-low border rounded-2xl transition-all ${item.color}`}>

                {/* Header de la card */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedCard(expandedCard === item.code ? null : item.code)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.badgeColor} border`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${item.badgeColor}`}>★ {item.badge}</span>
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-black text-white/50 uppercase">{isFR ? item.type_fr : item.type_en}</span>
                          <span className="px-2 py-0.5 bg-emerald-400/8 border border-emerald-400/15 rounded text-[8px] font-black text-emerald-400">{item.lang}</span>
                          {submitted === item.code && (
                            <span className="px-2 py-0.5 bg-emerald-400/15 border border-emerald-400/30 rounded text-[8px] font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle size={8}/> {t('Applied', 'Candidaté')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-white">{isFR ? item.subject_fr : item.subject_en}</p>
                        <p className="text-[10px] text-on-surface-variant/40 font-black mt-0.5">#{item.code} · {item.sector} · {isFR ? item.remuner_fr : item.remuner_en}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setApplyModal(item); }}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${submitted === item.code ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-[#a78bfa]/15 border border-[#a78bfa]/25 text-[#a78bfa] hover:bg-[#a78bfa]/30'}`}>
                        {submitted === item.code ? '✓' : t('Postuler', 'Apply')}
                      </button>
                      {expandedCard === item.code ? <ChevronUp size={14} className="text-white/30"/> : <ChevronDown size={14} className="text-white/30"/>}
                    </div>
                  </div>
                </div>

                {/* Brief développé */}
                <AnimatePresence>
                  {expandedCard === item.code && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/8">
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={12} className="text-[#a78bfa]"/>
                          <p className="text-[10px] font-black text-[#a78bfa] uppercase tracking-widest">{t('Editorial brief', 'Brief éditorial')}</p>
                        </div>
                        <p className="text-sm text-on-surface-variant/70 leading-relaxed">{isFR ? item.brief_fr : item.brief_en}</p>
                        <div className="flex gap-2 flex-wrap pt-2">
                          <span className="px-2 py-1 bg-white/5 border border-white/8 rounded text-[9px] font-black text-white/40">🌍 {item.sector}</span>
                          <span className="px-2 py-1 bg-white/5 border border-white/8 rounded text-[9px] font-black text-white/40">🗣 {item.lang}</span>
                          <span className="px-2 py-1 bg-white/5 border border-white/8 rounded text-[9px] font-black text-white/40">💰 {isFR ? item.remuner_fr : item.remuner_en}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* PUBLICATIONS RÉCENTES */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Recent LYA-linked publications', 'Publications récentes liées à LYA')}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {PUBLICATIONS.map((pub, i) => (
            <motion.div key={pub.code} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-surface-low border border-white/8 rounded-2xl p-4 hover:border-primary-cyan/25 transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-black text-white leading-snug group-hover:text-primary-cyan transition-colors">
                    {isFR ? pub.title_fr : pub.title_en}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] text-on-surface-variant/40 font-black flex-wrap">
                    <span>#{pub.code}</span>
                    <span>·</span>
                    <span>{pub.source}</span>
                    <span>·</span>
                    <span>{pub.sector}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-white/30 font-black">👁 {pub.reads}</span>
                    <span className={`text-[9px] font-black flex items-center gap-1 ${pub.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pub.up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>} {pub.impact} pts LYA
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BADGE LYA PRESS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent-gold/8 to-surface-low border border-accent-gold/25 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent-gold/15 border-2 border-accent-gold/30 rounded-2xl flex items-center justify-center mx-auto">
              <Star size={28} className="text-accent-gold" fill="currentColor"/>
            </div>
            <p className="text-xs font-black text-accent-gold uppercase tracking-widest">Badge LYA Press</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-black text-white">{t('Official LYA press accreditation', 'Accréditation presse officielle LYA')}</p>
            <ul className="space-y-1">
              {[
                t('Access to exclusive LYA data', 'Accès données exclusives LYA'),
                t('Direct creator contact (Pro)', 'Contact direct créateurs (Pro)'),
                t('Previews and events', 'Avant-premières et événements'),
                t('Signature sous pseudonyme LYA', 'Signature under LYA pseudonym'),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                  <span className="w-1 h-1 bg-accent-gold rounded-full shrink-0"/>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <button onClick={() => setAccredModal(true)}
              className="w-full py-3 bg-accent-gold text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              {accredSubmitted ? t('✓ Request sent', '✓ Demande envoyée') : t('Demander l\'accréditation', 'Request accreditation')}
            </button>
            <p className="text-[9px] text-on-surface-variant/30 text-center">{t('Processing within 5 business days', 'Traitement sous 5 jours ouvrés')}</p>
          </div>
        </div>
      </div>

      {/* MODAL CANDIDATURE */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-low border border-[#a78bfa]/30 rounded-3xl p-6 max-w-md w-full space-y-5">
              <div>
                <p className="text-[10px] font-black text-[#a78bfa] uppercase tracking-widest mb-1">#{applyModal.code}</p>
                <h3 className="text-sm font-black text-white">{isFR ? applyModal.subject_fr : applyModal.subject_en}</h3>
                <p className="text-[10px] text-on-surface-variant/40 mt-1">{isFR ? applyModal.brief_fr : applyModal.brief_en}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Your specialty *', 'Votre spécialité *')}</label>
                  <input value={form.specialty} onChange={e => setForm(f => ({...f, specialty: e.target.value}))}
                    placeholder={t('E.g: Film journalist, Fashion influencer...', 'Ex: Journaliste cinéma, Influenceur mode...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#a78bfa]/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Media / Platform (optional)', 'Média / Support (optionnel)')}</label>
                  <input value={form.media} onChange={e => setForm(f => ({...f, media: e.target.value}))}
                    placeholder={t('E.g: Independent blog, Newsletter, Podcast...', 'Ex: Blog indépendant, Newsletter, Podcast...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#a78bfa]/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Votre approche *', 'Your approach *')}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    rows={3} placeholder={t('Describe your editorial angle and why this subject interests you...', 'Décrivez votre angle éditorial et pourquoi ce sujet vous intéresse...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#a78bfa]/50 resize-none"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setApplyModal(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                  {t('Annuler', 'Cancel')}
                </button>
                <button onClick={handleApply} disabled={!form.specialty || !form.message}
                  className="flex-1 py-3 bg-[#a78bfa] text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Send size={12}/> {t('Envoyer', 'Send')}
                </button>
              </div>
              <p className="text-[9px] text-center text-white/20">{t('No identity published — contact via Pro space only', 'Aucune identité publiée — contact via espace Pro uniquement')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ACCRÉDITATION */}
      <AnimatePresence>
        {accredModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-low border border-accent-gold/30 rounded-3xl p-6 max-w-md w-full space-y-5">
              <div className="text-center space-y-2">
                <Star size={32} className="text-accent-gold mx-auto" fill="currentColor"/>
                <h3 className="text-sm font-black text-white">{t('Demande de badge LYA Press', 'LYA Press badge request')}</h3>
                <p className="text-[10px] text-on-surface-variant/40">{t('Your identity remains protected — no personal data published', 'Votre identité reste protégée — aucune donnée personnelle publiée')}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Type de profil *', 'Profile type *')}</label>
                  <select value={accredForm.type} onChange={e => setAccredForm(f => ({...f, type: e.target.value}))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-gold/50">
                    <option value="">{t('Select...', 'Sélectionner...')}</option>
                    <option value="journalist">{t('Journaliste', 'Journalist')}</option>
                    <option value="influencer">{t('Creative influencer', 'Influenceur créatif')}</option>
                    <option value="blogger">{t('Writer / Blogger', 'Rédacteur / Blogueur')}</option>
                    <option value="photographer">{t('Photographer / Videographer', 'Photographe / Vidéaste')}</option>
                    <option value="podcaster">Podcaster</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Media or platform *', 'Média ou support *')}</label>
                  <input value={accredForm.media} onChange={e => setAccredForm(f => ({...f, media: e.target.value}))}
                    placeholder={t('Name of your publication, channel, podcast...', 'Nom de votre publication, chaîne, podcast...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Experience in the creative world', 'Expérience dans le monde créatif')}</label>
                  <input value={accredForm.experience} onChange={e => setAccredForm(f => ({...f, experience: e.target.value}))}
                    placeholder={t('Secteurs couverts, années d\'expérience...', 'Sectors covered, years of experience...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Motivation *', 'Motivation *')}</label>
                  <textarea value={accredForm.message} onChange={e => setAccredForm(f => ({...f, message: e.target.value}))}
                    rows={3} placeholder={t('Pourquoi souhaitez-vous rejoindre LYA Press ?', 'Why do you want to join LYA Press?')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50 resize-none"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAccredModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                  {t('Annuler', 'Cancel')}
                </button>
                <button onClick={handleAccred} disabled={!accredForm.type || !accredForm.message}
                  className="flex-1 py-3 bg-accent-gold text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Send size={12}/> {t('Envoyer', 'Send')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
