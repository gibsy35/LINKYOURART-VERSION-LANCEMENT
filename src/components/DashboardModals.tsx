import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Flag, Plus, Send, CheckCircle } from 'lucide-react';
import { CONTRACTS } from '../types';

// ─── MODAL GÉNÉRIQUE ──────────────────────────────────────────────────────────

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-surface-dim/80 backdrop-blur-xl" onClick={onClose} />
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="relative bg-surface-low border border-white/10 rounded-3xl p-7 max-w-md w-full shadow-2xl z-10 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{title}</h3>
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-white/5"><X size={16} /></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── MODAL NOUVELLE CRÉATION ──────────────────────────────────────────────────

export const NewCreationModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category: string; description: string }) => void;
  lang: 'FR' | 'EN';
}> = ({ open, onClose, onSubmit, lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const categories = ['Fine Art', 'Music', 'Film', 'Literature', 'Fashion', 'Architecture', 'Photography', 'Gaming', 'Design', 'Performing Arts', 'Gastronomy', 'Digital Art'];

  const handleSubmit = () => {
    if (!name || !category) return;
    onSubmit({ name, category, description });
    setDone(true);
    setTimeout(() => { setDone(false); setName(''); setCategory(''); setDescription(''); onClose(); }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={T('Nouvelle Création', 'New Creation')}>
      {done ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle size={40} className="text-emerald-400 mx-auto" />
          <p className="text-base font-black text-emerald-400">{T('Création soumise !', 'Creation submitted!')}</p>
          <p className="text-sm text-on-surface-variant/60">{T('Votre projet a été envoyé en file de validation LYA.', 'Your project has been sent to the LYA validation queue.')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Nom du projet *', 'Project name *')}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={T('Ex: Symphonie Urbaine', 'Ex: Urban Symphony')}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Catégorie *', 'Category *')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors appearance-none">
                <option value="">{T('Sélectionner une catégorie', 'Select a category')}</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Description', 'Description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder={T('Décrivez votre projet créatif...', 'Describe your creative project...')}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{T('Annuler', 'Cancel')}</button>
            <button onClick={handleSubmit} disabled={!name || !category}
              className="flex-1 py-3 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all disabled:opacity-40 uppercase tracking-widest">
              {T('Soumettre', 'Submit')}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── MODAL PUBLIER UN JALON ───────────────────────────────────────────────────

export const MilestoneModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; impact: string; description: string }) => void;
  lang: 'FR' | 'EN';
  projectName?: string;
}> = ({ open, onClose, onSubmit, lang, projectName }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const impactOptions = ['+5%', '+10%', '+15%', '+20%', '+25%', '+30%', '+40%', '+50%'];

  const handleSubmit = () => {
    if (!title) return;
    onSubmit({ title, impact, description });
    setDone(true);
    setTimeout(() => { setDone(false); setTitle(''); setImpact(''); setDescription(''); onClose(); }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={T('Publier un Jalon', 'Publish a Milestone')}>
      {done ? (
        <div className="text-center py-6 space-y-3">
          <Flag size={40} className="text-emerald-400 mx-auto" />
          <p className="text-base font-black text-emerald-400">{T('Jalon publié !', 'Milestone published!')}</p>
          <p className="text-sm text-on-surface-variant/60">{T('Votre LYA Score vient d\'être mis à jour.', 'Your LYA Score has just been updated.')}</p>
        </div>
      ) : (
        <>
          {projectName && <p className="text-xs text-on-surface-variant/50 -mt-2">{T('Projet:', 'Project:')} <span className="text-[#a78bfa] font-black">{projectName}</span></p>}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Titre du jalon *', 'Milestone title *')}</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder={T('Ex: Partenariat Studio Universel', 'Ex: Universal Studio Partnership')}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Impact estimé', 'Estimated impact')}</label>
              <div className="flex flex-wrap gap-2">
                {impactOptions.map(opt => (
                  <button key={opt} onClick={() => setImpact(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${impact === opt ? 'bg-[#a78bfa]/20 border border-[#a78bfa]/40 text-[#a78bfa]' : 'bg-surface-high/40 border border-white/8 text-on-surface-variant hover:border-white/20'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Description', 'Description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder={T('Décrivez ce jalon et son impact sur votre projet...', 'Describe this milestone and its impact on your project...')}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{T('Annuler', 'Cancel')}</button>
            <button onClick={handleSubmit} disabled={!title}
              className="flex-1 py-3 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all disabled:opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
              <Flag size={14} /> {T('Publier', 'Publish')}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── MODAL UPLOAD DOCUMENT ────────────────────────────────────────────────────

export const UploadModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; access: string; price: string }) => void;
  lang: 'FR' | 'EN';
}> = ({ open, onClose, onSubmit, lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [file, setFile] = useState<File | null>(null);
  const [access, setAccess] = useState('PUBLIC');
  const [price, setPrice] = useState('');
  const [done, setDone] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({ name: file.name, access, price });
    setDone(true);
    setTimeout(() => { setDone(false); setFile(null); setAccess('PUBLIC'); setPrice(''); onClose(); }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={T('Uploader un fichier', 'Upload a file')}>
      {done ? (
        <div className="text-center py-6 space-y-3">
          <Upload size={40} className="text-emerald-400 mx-auto" />
          <p className="text-base font-black text-emerald-400">{T('Fichier uploadé !', 'File uploaded!')}</p>
          <p className="text-sm text-on-surface-variant/60">{file?.name}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Fichier *', 'File *')}</label>
              <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-[#a78bfa]/40 bg-[#a78bfa]/5' : 'border-white/10 hover:border-white/25'}`}>
                <input type="file" className="hidden" onChange={handleFile} />
                <Upload size={24} className={file ? 'text-[#a78bfa]' : 'text-on-surface-variant/30'} />
                <p className="text-sm text-center text-on-surface-variant/60">
                  {file ? <span className="text-[#a78bfa] font-black">{file.name}</span> : T('Cliquez ou glissez un fichier ici', 'Click or drag a file here')}
                </p>
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Accès', 'Access')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'PUBLIC', l: T('Public', 'Public'), c: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8' },
                  { v: 'PATRONS', l: T('Mécènes', 'Patrons'), c: 'text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/8' },
                  { v: 'PROS', l: T('Pros', 'Pros'), c: 'text-primary-cyan border-primary-cyan/30 bg-primary-cyan/8' },
                ].map(opt => (
                  <button key={opt.v} onClick={() => setAccess(opt.v)}
                    className={`py-2 rounded-xl text-xs font-black border transition-all ${access === opt.v ? opt.c : 'border-white/8 text-on-surface-variant hover:border-white/20'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            {access !== 'PUBLIC' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Prix d\'accès (€)', 'Access price (€)')}</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="500"
                  className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#a78bfa] transition-colors" />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{T('Annuler', 'Cancel')}</button>
            <button onClick={handleSubmit} disabled={!file}
              className="flex-1 py-3 bg-[#a78bfa] text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all disabled:opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
              <Upload size={14} /> {T('Uploader', 'Upload')}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── MODAL CONTACT SERVICE PRO ────────────────────────────────────────────────

export const ServiceContactModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { message: string; budget: string }) => void;
  lang: 'FR' | 'EN';
  serviceName?: string;
  servicePrice?: string;
}> = ({ open, onClose, onSubmit, lang, serviceName, servicePrice }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!message) return;
    onSubmit({ message, budget: servicePrice || '' });
    setDone(true);
    setTimeout(() => { setDone(false); setMessage(''); onClose(); }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={T('Demande de service', 'Service request')}>
      {done ? (
        <div className="text-center py-6 space-y-3">
          <Send size={40} className="text-emerald-400 mx-auto" />
          <p className="text-base font-black text-emerald-400">{T('Demande envoyée !', 'Request sent!')}</p>
          <p className="text-sm text-on-surface-variant/60">{T('L\'équipe LYA vous contactera sous 24h.', 'The LYA team will contact you within 24h.')}</p>
        </div>
      ) : (
        <>
          {serviceName && (
            <div className="bg-primary-cyan/5 border border-primary-cyan/15 rounded-xl p-3">
              <p className="text-xs text-on-surface-variant/50">{T('Service demandé','Requested service')}</p>
              <p className="text-sm font-black text-on-surface">{serviceName}</p>
              {servicePrice && <p className="text-xs text-primary-cyan font-black mt-0.5">{servicePrice}</p>}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">{T('Votre message *', 'Your message *')}</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder={T('Décrivez votre projet et vos besoins spécifiques...', 'Describe your project and specific needs...')}
                className="w-full bg-surface-high/40 border border-white/10 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-primary-cyan transition-colors resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{T('Annuler', 'Cancel')}</button>
            <button onClick={handleSubmit} disabled={!message}
              className="flex-1 py-3 bg-primary-cyan text-surface-dim text-sm font-black rounded-xl hover:bg-white transition-all disabled:opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
              <Send size={14} /> {T('Envoyer', 'Send')}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
