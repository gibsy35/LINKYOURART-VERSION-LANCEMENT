import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, Send, CheckCircle, ShieldCheck, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface Props {
  t: (fr: string, en: string) => string;
  language: string;
  onNotify: (msg: string) => void;
}

const JOBS = [
  {
    code: 'LYA-JOB-001',
    icon: <Briefcase size={16}/>,
    title_fr: 'Directeur·rice Artistique', title_en: 'Art Director',
    org: 'Studio Meridian',
    verified: true,
    contract_fr: 'CDI', contract_en: 'Full-time',
    sector: 'Film / TV Series',
    location_fr: 'Paris (hybride)', location_en: 'Paris (hybrid)',
    scoreMin: 600,
    brief_fr: "Studio certifié LYA recherche un·e directeur·rice artistique pour superviser 3 productions en cours. Score LYA ≥ 600 apprécié mais non bloquant.",
    brief_en: "LYA-certified studio seeking an Art Director to oversee 3 ongoing productions. LYA Score ≥ 600 preferred but not required.",
    remuner_fr: '55K–70K€/an', remuner_en: '€55K–70K/yr',
    deadline: 'Open',
    color: 'border-primary-cyan/20 hover:border-primary-cyan/50',
  },
  {
    code: 'LYA-JOB-002',
    icon: <Award size={16}/>,
    title_fr: 'Compositeur·rice — Mission Freelance', title_en: 'Composer — Freelance Mission',
    org: 'Sonic Wave Collective',
    verified: true,
    contract_fr: 'Freelance', contract_en: 'Freelance',
    sector: 'Music',
    location_fr: 'Remote', location_en: 'Remote',
    scoreMin: 700,
    brief_fr: "Composition de la bande originale d'un projet certifié LYA Score 900+. Livrable en 6 semaines. Profil certifié requis.",
    brief_en: "Score composition for a certified LYA Score 900+ project. 6-week delivery. Certified profile required.",
    remuner_fr: '8K–12K€ (forfait)', remuner_en: '€8K–12K (flat fee)',
    deadline: '15 Oct 2026',
    color: 'border-[#a78bfa]/20 hover:border-[#a78bfa]/50',
  },
  {
    code: 'LYA-JOB-003',
    icon: <Briefcase size={16}/>,
    title_fr: 'Chef·fe de Projet Architecture', title_en: 'Architecture Project Lead',
    org: 'Independent Studio',
    verified: false,
    contract_fr: 'CDD 12 mois', contract_en: '12-month contract',
    sector: 'Architecture',
    location_fr: 'Lyon', location_en: 'Lyon',
    scoreMin: 0,
    brief_fr: "Studio indépendant en cours de certification recherche un·e chef·fe de projet pour un ensemble résidentiel durable.",
    brief_en: "Independent studio (certification in progress) seeking a project lead for a sustainable residential complex.",
    remuner_fr: '45K–52K€/an', remuner_en: '€45K–52K/yr',
    deadline: 'Open',
    color: 'border-emerald-400/20 hover:border-emerald-400/50',
  },
  {
    code: 'LYA-JOB-004',
    icon: <Award size={16}/>,
    title_fr: 'Styliste — Collection Capsule', title_en: 'Stylist — Capsule Collection',
    org: 'Silk Route Atelier',
    verified: false,
    contract_fr: 'Stage 6 mois', contract_en: '6-month internship',
    sector: 'Fashion',
    location_fr: 'Marseille', location_en: 'Marseille',
    scoreMin: 0,
    brief_fr: "Rejoignez une collection capsule en cours de révision LYA. Formation accélérée sur le processus de certification inclus.",
    brief_en: "Join a capsule collection currently under LYA review. Accelerated training on the certification process included.",
    remuner_fr: 'Gratifié — 900€/mois', remuner_en: 'Paid — €900/month',
    deadline: '30 Sept 2026',
    color: 'border-accent-gold/20 hover:border-accent-gold/50',
  },
];

const STATS = [
  { label_fr: 'Offres actives', label_en: 'Active listings', value: '4', color: 'text-primary-cyan' },
  { label_fr: 'Organisations vérifiées', label_en: 'Verified organisations', value: '2', color: 'text-[#a78bfa]' },
  { label_fr: 'Candidatures ce mois', label_en: 'Applications this month', value: '31', color: 'text-accent-gold' },
  { label_fr: 'Score LYA moyen requis', label_en: 'Avg required LYA Score', value: '650', color: 'text-emerald-400' },
];

export const JobsSection: React.FC<Props> = ({ t, language, onNotify }) => {
  const isFR = language === 'FR';
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [applyModal, setApplyModal] = useState<typeof JOBS[0] | null>(null);
  const [postModal, setPostModal] = useState(false);
  const [form, setForm] = useState({ name: '', lyaProfile: '', message: '' });
  const [postForm, setPostForm] = useState({ org: '', verified: 'no', title: '', contact: '', message: '' });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [postSubmitted, setPostSubmitted] = useState(false);

  const filters = ['ALL', 'Film / TV Series', 'Music', 'Architecture', 'Fashion'];

  const filtered = activeFilter === 'ALL' ? JOBS : JOBS.filter(j => j.sector === activeFilter);

  const handleApply = async () => {
    if (!form.name || !form.message) return;
    try {
      await addDoc(collection(db, 'job_applications'), {
        jobCode: applyModal?.code,
        jobTitle: isFR ? applyModal?.title_fr : applyModal?.title_en,
        name: form.name,
        lyaProfile: form.lyaProfile,
        message: form.message,
        status: 'PENDING',
        createdAt: serverTimestamp(),
      });
      setSubmitted(applyModal?.code || '');
      setApplyModal(null);
      setForm({ name: '', lyaProfile: '', message: '' });
      onNotify(t('✦ Candidature envoyée — Réponse sous 5 jours via votre espace.', '✦ Application sent — Reply within 5 days via your space.'));
    } catch (e) {
      onNotify(t('Erreur réseau', 'Network error'));
    }
  };

  const handlePost = async () => {
    if (!postForm.org || !postForm.title || !postForm.message) return;
    try {
      await addDoc(collection(db, 'job_postings_requests'), {
        ...postForm,
        status: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
      });
      setPostSubmitted(true);
      setPostModal(false);
      onNotify(t('✦ Demande de publication envoyée — Revue sous 48h.', '✦ Posting request sent — Review within 48h.'));
    } catch (e) {
      onNotify(t('Erreur réseau', 'Network error'));
    }
  };

  return (
    <div className="space-y-8">

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-gold/10 via-surface-low to-primary-cyan/5 border border-accent-gold/20 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-accent-gold/20 border border-accent-gold/30 rounded-full text-[10px] font-black text-accent-gold uppercase tracking-widest">★ LYA Jobs</span>
              <span className="px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400">● {t('Actif', 'Active')}</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              {t('Le talent certifié,', 'Certified talent,')}<br/>
              <span className="text-accent-gold">{t('recruté ici.', 'hired here.')}</span>
            </h2>
            <p className="text-sm text-on-surface-variant/60 leading-relaxed">
              {t('La place de marché de l\'emploi créatif LYA. Ouverte à tous — les profils certifiés sont mis en avant. Publiez une offre, ou postulez avec votre Score LYA en avantage.',
                 'The LYA creative jobs marketplace. Open to all — certified profiles are prioritised. Post a listing, or apply with your LYA Score as an edge.')}
            </p>
            <button onClick={() => setPostModal(true)}
              className="px-6 py-3 bg-accent-gold text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(232,196,104,0.2)]">
              {postSubmitted ? t('✓ Demande envoyée', '✓ Request sent') : t('Publier une offre', 'Post a listing')}
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

      {/* OFFRES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('Offres ouvertes', 'Open Listings')}</h3>
            <span className="px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-[9px] font-black text-emerald-400">● {JOBS.length} {t('ouvertes', 'open')}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full transition-all ${activeFilter === f ? 'bg-accent-gold text-surface-dim' : 'bg-surface-low border border-white/10 text-on-surface-variant hover:text-white'}`}>
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

                <div className="p-5 cursor-pointer" onClick={() => setExpandedCard(expandedCard === item.code ? null : item.code)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-black text-white/50 uppercase">{item.org}</span>
                          {item.verified && (
                            <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/25 rounded text-[8px] font-black text-primary-cyan uppercase flex items-center gap-1">
                              <ShieldCheck size={8}/> {t('Vérifié LYA', 'LYA Verified')}
                            </span>
                          )}
                          {item.scoreMin > 0 && (
                            <span className="px-2 py-0.5 bg-accent-gold/10 border border-accent-gold/25 rounded text-[8px] font-black text-accent-gold">
                              Score ≥ {item.scoreMin}
                            </span>
                          )}
                          {submitted === item.code && (
                            <span className="px-2 py-0.5 bg-emerald-400/15 border border-emerald-400/30 rounded text-[8px] font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle size={8}/> {t('Candidaté', 'Applied')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-white">{isFR ? item.title_fr : item.title_en}</p>
                        <p className="text-[10px] text-on-surface-variant/40 font-black mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin size={9}/> {isFR ? item.location_fr : item.location_en}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock size={9}/> {isFR ? item.contract_fr : item.contract_en}</span>
                          <span>·</span>
                          <span>{isFR ? item.remuner_fr : item.remuner_en}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setApplyModal(item); }}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${submitted === item.code ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-accent-gold/15 border border-accent-gold/25 text-accent-gold hover:bg-accent-gold/30'}`}>
                        {submitted === item.code ? '✓' : t('Postuler', 'Apply')}
                      </button>
                      {expandedCard === item.code ? <ChevronUp size={14} className="text-white/30"/> : <ChevronDown size={14} className="text-white/30"/>}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedCard === item.code && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/8">
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={12} className="text-accent-gold"/>
                          <p className="text-[10px] font-black text-accent-gold uppercase tracking-widest">{t('Description du poste', 'Role brief')}</p>
                        </div>
                        <p className="text-sm text-on-surface-variant/70 leading-relaxed">{isFR ? item.brief_fr : item.brief_en}</p>
                        <div className="flex gap-2 flex-wrap pt-2">
                          <span className="px-2 py-1 bg-white/5 border border-white/8 rounded text-[9px] font-black text-white/40">🎬 {item.sector}</span>
                          <span className="px-2 py-1 bg-white/5 border border-white/8 rounded text-[9px] font-black text-white/40">⏳ {item.deadline}</span>
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

      {/* PRIORITÉ CERTIFICATION */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-cyan/8 to-surface-low border border-primary-cyan/25 rounded-3xl p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-cyan/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-cyan/15 border-2 border-primary-cyan/30 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={28} className="text-primary-cyan"/>
            </div>
            <p className="text-xs font-black text-primary-cyan uppercase tracking-widest">{t('Certification = Priorité', 'Certification = Priority')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-black text-white">{t('Ouvert à tous, les profils certifiés en tête', 'Open to all, certified profiles first')}</p>
            <ul className="space-y-1">
              {[
                t('Badge visible sur chaque candidature', 'Visible badge on every application'),
                t('Priorité de classement pour les recruteurs', 'Priority ranking for recruiters'),
                t('Aucune obligation de certification pour postuler', 'No certification required to apply'),
                t('Organisations vérifiées via LYA Trust Assurance', 'Organisations verified via LYA Trust Assurance'),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                  <span className="w-1 h-1 bg-primary-cyan rounded-full shrink-0"/>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <button onClick={() => setPostModal(true)}
              className="w-full py-3 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              {t('Publier une offre', 'Post a listing')}
            </button>
            <p className="text-[9px] text-on-surface-variant/30 text-center">{t('Inclus pour les comptes Pro · Frais fixe sinon', 'Included for Pro accounts · Flat fee otherwise')}</p>
          </div>
        </div>
      </div>

      {/* MODAL CANDIDATURE */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-low border border-accent-gold/30 rounded-3xl p-6 max-w-md w-full space-y-5">
              <div>
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-widest mb-1">#{applyModal.code}</p>
                <h3 className="text-sm font-black text-white">{isFR ? applyModal.title_fr : applyModal.title_en}</h3>
                <p className="text-[10px] text-on-surface-variant/40 mt-1">{applyModal.org} · {isFR ? applyModal.location_fr : applyModal.location_en}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Nom *', 'Name *')}</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    placeholder={t('Votre nom', 'Your name')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Profil / Score LYA (optionnel)', 'LYA Profile / Score (optional)')}</label>
                  <input value={form.lyaProfile} onChange={e => setForm(f => ({...f, lyaProfile: e.target.value}))}
                    placeholder={t('Lien vers votre profil certifié', 'Link to your certified profile')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Message *', 'Message *')}</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    rows={3} placeholder={t('Pourquoi ce poste vous intéresse...', 'Why this role interests you...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-gold/50 resize-none"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setApplyModal(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                  {t('Annuler', 'Cancel')}
                </button>
                <button onClick={handleApply} disabled={!form.name || !form.message}
                  className="flex-1 py-3 bg-accent-gold text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Send size={12}/> {t('Envoyer', 'Send')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PUBLICATION OFFRE */}
      <AnimatePresence>
        {postModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-low border border-primary-cyan/30 rounded-3xl p-6 max-w-md w-full space-y-5">
              <div className="text-center space-y-2">
                <Briefcase size={32} className="text-primary-cyan mx-auto"/>
                <h3 className="text-sm font-black text-white">{t('Publier une offre', 'Post a listing')}</h3>
                <p className="text-[10px] text-on-surface-variant/40">{t('Inclus pour les comptes Pro · Frais fixe pour les autres', 'Included for Pro accounts · Flat fee for others')}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Organisation *', 'Organisation *')}</label>
                  <input value={postForm.org} onChange={e => setPostForm(f => ({...f, org: e.target.value}))}
                    placeholder={t('Nom du studio, institution...', 'Studio, institution name...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary-cyan/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Intitulé du poste *', 'Job title *')}</label>
                  <input value={postForm.title} onChange={e => setPostForm(f => ({...f, title: e.target.value}))}
                    placeholder={t('Ex : Directeur artistique', 'E.g: Art Director')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary-cyan/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Contact *', 'Contact *')}</label>
                  <input value={postForm.contact} onChange={e => setPostForm(f => ({...f, contact: e.target.value}))}
                    placeholder={t('Email de contact', 'Contact email')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary-cyan/50"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{t('Description *', 'Description *')}</label>
                  <textarea value={postForm.message} onChange={e => setPostForm(f => ({...f, message: e.target.value}))}
                    rows={3} placeholder={t('Décrivez le poste, le contexte, les attentes...', 'Describe the role, context, expectations...')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-primary-cyan/50 resize-none"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPostModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-xs font-black text-white/50 rounded-xl hover:bg-white/10 transition-all uppercase">
                  {t('Annuler', 'Cancel')}
                </button>
                <button onClick={handlePost} disabled={!postForm.org || !postForm.title || !postForm.message}
                  className="flex-1 py-3 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Send size={12}/> {t('Envoyer', 'Send')}
                </button>
              </div>
              <p className="text-[9px] text-center text-white/20">{t('Revue LYA sous 48h avant mise en ligne', 'LYA review within 48h before going live')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
