import React, { useState, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import {
  ShieldCheck, AlertCircle, CheckCircle, Search, ExternalLink,
  Clock, Award, RefreshCw, Lock, Activity, BarChart2,
  FileCheck, Sparkles, ChevronDown, Play, Pause, Eye,
  CheckSquare, XSquare, Filter, TrendingUp, Palette,
  Music, Film, BookOpen, Camera, Shirt, Cpu, Mic,
  Building2, ChefHat, Drama, Gamepad2, X
} from 'lucide-react';
import { CONTRACTS, Contract, UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { getSafeImageUrl } from '../utils/image';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fine Art': <Palette size={14} />,
  'Music': <Music size={14} />,
  'Film': <Film size={14} />,
  'TV Series': <Film size={14} />,
  'Literature': <BookOpen size={14} />,
  'Photography': <Camera size={14} />,
  'Fashion': <Shirt size={14} />,
  'Digital Art': <Cpu size={14} />,
  'Podcast': <Mic size={14} />,
  'Architecture': <Building2 size={14} />,
  'Gastronomy': <ChefHat size={14} />,
  'Performing Arts': <Drama size={14} />,
  'Gaming': <Gamepad2 size={14} />,
  'Design': <Sparkles size={14} />,
};

// 4 étapes de validation universelles — valides pour tous les univers créatifs
const VALIDATION_STEPS = [
  {
    id: 'origin',
    labelFR: 'Vérification d\'Origine',
    labelEN: 'Origin Verification',
    descFR: 'Authenticité et traçabilité de la création',
    descEN: 'Authenticity and traceability of the work',
    icon: <ShieldCheck size={13} />,
  },
  {
    id: 'creative',
    labelFR: 'Analyse Créative',
    labelEN: 'Creative Analysis',
    descFR: 'Originalité, qualité et potentiel artistique',
    descEN: 'Originality, quality and artistic potential',
    icon: <Sparkles size={13} />,
  },
  {
    id: 'rights',
    labelFR: 'Droits & Conformité',
    labelEN: 'Rights & Compliance',
    descFR: 'Vérification des droits de propriété et licences',
    descEN: 'Ownership rights and license verification',
    icon: <FileCheck size={13} />,
  },
  {
    id: 'final',
    labelFR: 'Validation Finale',
    labelEN: 'Final Validation',
    descFR: 'Approbation définitive d\'indexation LYA',
    descEN: 'Final LYA indexation approval',
    icon: <CheckCircle size={13} />,
  },
];

type StepStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
interface ValidationRequest {
  id: string;
  contract: Contract;
  timestamp: string;
  receivedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  steps: Record<string, StepStatus>;
  notes: string;
}

// ─── COMPOSANT ÉTAPE ──────────────────────────────────────────────────────────

const StepCard: React.FC<{
  step: typeof VALIDATION_STEPS[0];
  status: StepStatus;
  isPending: boolean;
  lang: 'FR' | 'EN';
  onVerify: () => void;
}> = ({ step, status, isPending, lang, onVerify }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  return (
    <div className={`p-3 border rounded-xl flex flex-col gap-2 transition-all ${
      status === 'COMPLETED' ? 'bg-emerald-400/5 border-emerald-400/20' :
      status === 'FAILED'    ? 'bg-rose-400/5 border-rose-400/20' :
                               'bg-surface-dim/40 border-white/8'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg ${
          status === 'COMPLETED' ? 'bg-emerald-400/10 text-emerald-400' :
          status === 'FAILED'    ? 'bg-rose-400/10 text-rose-400' :
                                   'bg-white/5 text-on-surface-variant/50'
        }`}>{step.icon}</div>
        {status === 'COMPLETED' && <CheckCircle size={12} className="text-emerald-400" />}
        {status === 'FAILED'    && <XSquare size={12} className="text-rose-400" />}
      </div>
      <p className="text-xs font-black text-on-surface leading-tight">
        {T(step.labelFR, step.labelEN)}
      </p>
      <p className="text-[10px] text-on-surface-variant/50 leading-snug">
        {T(step.descFR, step.descEN)}
      </p>
      {isPending && status === 'PENDING' && (
        <button
          onClick={onVerify}
          className="mt-1 text-[10px] font-black text-primary-cyan hover:text-white transition-colors uppercase tracking-widest text-left"
        >
          {T('Vérifier →', 'Verify →')}
        </button>
      )}
    </div>
  );
};

// ─── ONGLET 1 : FILE DE VALIDATION ───────────────────────────────────────────

const ValidationQueue: React.FC<{
  user: UserProfile | null;
  lang: 'FR' | 'EN';
  onNotify: (msg: string) => void;
}> = ({ user, lang, onNotify }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [requests, setRequests] = useState<ValidationRequest[]>(
    CONTRACTS.filter(c => c.status === 'LIVE').slice(0, 8).map((contract, i) => ({
      id: `val-${i}`,
      contract,
      timestamp: `${String(Math.floor(Math.random() * 4) + 9).padStart(2,'0')}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
      receivedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 3),
      status: 'PENDING',
      steps: { origin: 'PENDING', creative: 'PENDING', rights: 'PENDING', final: 'PENDING' },
      notes: '',
    }))
  );

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const categories = ['ALL', ...Array.from(new Set(CONTRACTS.map(c => c.category)))];

  const filtered = useMemo(() => requests.filter(r => {
    const matchSearch = r.contract.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'ALL' || r.contract.category === catFilter;
    return matchSearch && matchCat;
  }), [requests, search, catFilter]);

  const pending = filtered.filter(r => r.status === 'PENDING').length;
  const approved = filtered.filter(r => r.status === 'APPROVED').length;
  const rejected = filtered.filter(r => r.status === 'REJECTED').length;

  const verifyStep = (reqId: string, stepId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      const step = VALIDATION_STEPS.find(s => s.id === stepId)!;
      onNotify(`✓ ${T(step.labelFR, step.labelEN)} — ${r.contract.name}`);
      return { ...r, steps: { ...r.steps, [stepId]: 'COMPLETED' } };
    }));
  };

  const verifyAll = (reqId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      const steps = Object.fromEntries(VALIDATION_STEPS.map(s => [s.id, 'COMPLETED' as StepStatus]));
      onNotify(`✦ ${T('Toutes les étapes validées', 'All steps validated')} — ${r.contract.name}`);
      return { ...r, steps };
    }));
  };

  const approve = (reqId: string) => {
    const r = requests.find(x => x.id === reqId)!;
    const allDone = VALIDATION_STEPS.every(s => r.steps[s.id] === 'COMPLETED');
    if (!allDone) {
      onNotify(T('⚠ Complétez toutes les étapes avant d\'approuver.', '⚠ Complete all steps before approving.'));
      return;
    }
    onNotify(`✅ ${r.contract.name} — ${T('Approuvé et indexé sur le Registre LYA.', 'Approved and indexed on the LYA Registry.')}`);
    setRequests(prev => prev.map(x => x.id === reqId ? { ...x, status: 'APPROVED' } : x));
    try {
      addDoc(collection(db, 'validation_approved'), {
        contractId: r.contract.id, approvedAt: serverTimestamp(), approvedBy: user?.uid
      }).catch(() => {});
    } catch {}
  };

  const confirmReject = () => {
    if (!rejectId || !rejectReason.trim()) return;
    const r = requests.find(x => x.id === rejectId)!;
    onNotify(`✗ ${r.contract.name} — ${T('Rejeté.', 'Rejected.')}`);
    setRequests(prev => prev.filter(x => x.id !== rejectId));
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: T('En attente', 'Pending'), value: pending, color: 'text-accent-gold', bg: 'bg-accent-gold/8 border-accent-gold/20' },
          { label: T('Approuvés', 'Approved'), value: approved, color: 'text-emerald-400', bg: 'bg-emerald-400/8 border-emerald-400/20' },
          { label: T('Rejetés', 'Rejected'), value: rejected, color: 'text-rose-400', bg: 'bg-rose-400/8 border-rose-400/20' },
        ].map((k, i) => (
          <div key={i} className={`${k.bg} border rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black font-mono ${k.color}`}>{k.value}</p>
            <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={14} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={T('Rechercher un projet...', 'Search a project...')}
            className="w-full bg-surface-high/40 border border-white/10 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary-cyan transition-colors"
          />
        </div>
        <div className="relative">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-surface-high/40 border border-white/10 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
            {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? T('Toutes catégories', 'All categories') : c}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
        <button
          onClick={async () => {
            onNotify(T('Actualisation...', 'Refreshing...'));
            try {
              const snap = await getDocs(query(collection(db, 'validation_requests'), orderBy('createdAt', 'desc'), limit(20)));
              onNotify(T(`${snap.size} demandes reçues`, `${snap.size} requests received`));
            } catch(e) { handleFirestoreError(e, OperationType.GET, 'validation_requests'); }
          }}
          className="flex items-center gap-2 bg-primary-cyan text-surface-dim hover:bg-white px-5 py-2.5 text-sm font-black uppercase tracking-wide rounded-xl transition-all shadow-[0_0_16px_rgba(0,224,255,0.2)]"
        >
          <RefreshCw size={14} />
          {T('Actualiser', 'Refresh')}
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        <AnimatePresence mode="sync">
          {filtered.map((req, idx) => {
            const allDone = VALIDATION_STEPS.every(s => req.steps[s.id] === 'COMPLETED');
            const progress = VALIDATION_STEPS.filter(s => req.steps[s.id] === 'COMPLETED').length;
            return (
              <motion.div
                key={req.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ delay: idx * 0.03 }}
                className="bg-surface-low/40 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden hover:border-white/18 transition-all"
              >
                {/* Header projet */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-white/6">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={getSafeImageUrl(req.contract.image, req.contract.category)} alt={req.contract.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-on-surface-variant/40">{CATEGORY_ICONS[req.contract.category]}</span>
                      <span className="text-xs text-on-surface-variant/50 font-mono uppercase tracking-widest">{req.contract.category}</span>
                      <span className="text-xs text-on-surface-variant/30">·</span>
                      <span className="text-xs text-on-surface-variant/40 font-mono">{req.contract.registryIndex}</span>
                    </div>
                    <h3 className="text-base font-black text-on-surface tracking-tight truncate">{req.contract.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant/50"><Clock size={11} /> {T('Reçu', 'Received')} {req.timestamp}</span>
                      <span className="text-xs text-primary-cyan font-bold">{progress}/4 {T('étapes', 'steps')}</span>
                    </div>
                  </div>
                  {/* Statut */}
                  {req.status !== 'PENDING' ? (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                    }`}>
                      {req.status === 'APPROVED' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                      {req.status === 'APPROVED' ? T('Approuvé', 'Approved') : T('Rejeté', 'Rejected')}
                    </div>
                  ) : (
                    <div className="text-right shrink-0">
                      <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary-cyan rounded-full transition-all" style={{ width: `${(progress / 4) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-on-surface-variant/40 font-mono">{Math.round((progress / 4) * 100)}%</p>
                    </div>
                  )}
                </div>

                {/* Étapes + actions */}
                {req.status === 'PENDING' && (
                  <div className="px-5 py-4 space-y-4">
                    {/* LYA Score + description */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-on-surface-variant/50 leading-relaxed max-w-xl">{req.contract.description?.slice(0, 120)}...</p>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">LYA Score</p>
                        <p className="text-xl font-black text-accent-gold">{req.contract.totalScore}<span className="text-xs text-on-surface-variant/30 font-normal">/1000</span></p>
                      </div>
                    </div>

                    {/* 4 étapes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {VALIDATION_STEPS.map(step => (
                        <StepCard
                          key={step.id}
                          step={step}
                          status={req.steps[step.id]}
                          isPending={req.status === 'PENDING'}
                          lang={lang}
                          onVerify={() => verifyStep(req.id, step.id)}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/6">
                      <button onClick={() => verifyAll(req.id)} className="text-xs font-black text-primary-cyan hover:text-white transition-colors uppercase tracking-widest border-b border-primary-cyan/30 pb-0.5">
                        {T('✦ Valider toutes les étapes', '✦ Validate all steps')}
                      </button>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setRejectId(req.id)} className="px-5 py-2 border border-rose-400/20 text-rose-400 text-sm font-black uppercase tracking-wide hover:bg-rose-400/10 rounded-xl transition-all">
                          {T('Rejeter', 'Reject')}
                        </button>
                        <button
                          onClick={() => approve(req.id)}
                          disabled={!allDone}
                          className={`px-6 py-2 text-sm font-black uppercase tracking-wide rounded-xl transition-all ${allDone ? 'bg-primary-cyan text-surface-dim hover:bg-white shadow-[0_0_16px_rgba(0,224,255,0.2)]' : 'bg-white/5 text-on-surface-variant/30 cursor-not-allowed border border-white/8'}`}
                        >
                          {T('Approuver', 'Approve')}
                        </button>
                        <button
                          onClick={async () => {
                            try { await updateDoc(doc(db, 'validation_requests', req.id), { lastViewedAt: serverTimestamp() }).catch(() => {}); } catch {}
                            onNotify(`${req.contract.name} — ${T('Dossier ouvert', 'File opened')}`);
                          }}
                          className="p-2 bg-white/5 text-on-surface-variant hover:text-primary-cyan hover:bg-white/10 rounded-xl transition-all border border-white/8"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal de rejet */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-dim/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-low border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-on-surface uppercase tracking-wider">{T('Motif du rejet', 'Rejection reason')}</h3>
                <button onClick={() => setRejectId(null)} className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"><X size={16} /></button>
              </div>
              <p className="text-sm text-on-surface-variant/60 leading-relaxed">
                {T('Le créateur recevra une notification avec votre motif.', 'The creator will receive a notification with your reason.')}
              </p>
              <textarea
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder={T('Décrivez pourquoi ce projet ne peut pas être indexé...', 'Describe why this project cannot be indexed...')}
                rows={4}
                className="w-full bg-surface-dim border border-white/10 text-sm p-4 rounded-xl focus:outline-none focus:border-primary-cyan resize-none transition-colors"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectId(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all">{T('Annuler', 'Cancel')}</button>
                <button onClick={confirmReject} disabled={!rejectReason.trim()} className="flex-1 py-3 bg-rose-500 text-white text-sm font-black rounded-xl hover:bg-rose-400 transition-all disabled:opacity-40">{T('Confirmer le rejet', 'Confirm rejection')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ONGLET 2 : CONSOLE DE DIAGNOSTIC ────────────────────────────────────────

const DiagnosticConsole: React.FC<{ lang: 'FR' | 'EN'; onNotify: (msg: string) => void }> = ({ lang, onNotify }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const contracts = CONTRACTS.filter(c => c.status === 'LIVE');
  const [selectedId, setSelectedId] = useState(contracts[0]?.id || '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | { score: number; status: 'ELIGIBLE' | 'REJECTED' | 'REVIEW'; details: string[] }>(null);

  // Critères ajustables
  const [criteria, setCriteria] = useState({
    originality: 70,
    commercialPotential: 60,
    rights: 80,
    coproduction: 50,
  });

  const selected = contracts.find(c => c.id === selectedId);

  const runDiagnostic = () => {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    onNotify(T('Diagnostic en cours...', 'Running diagnostic...'));

    setTimeout(() => {
      const base = selected.totalScore / 10; // 0-100
      const critAvg = (criteria.originality + criteria.commercialPotential + criteria.rights + criteria.coproduction) / 4;
      const finalScore = Math.round((base * 0.6 + critAvg * 0.4));
      
      const details: string[] = [
        `${T('Originalité créative', 'Creative originality')}: ${criteria.originality}%`,
        `${T('Potentiel commercial', 'Commercial potential')}: ${criteria.commercialPotential}%`,
        `${T('Conformité des droits', 'Rights compliance')}: ${criteria.rights}%`,
        `${T('Aptitude à la co-production', 'Co-production readiness')}: ${criteria.coproduction}%`,
        `${T('Score LYA de base', 'Base LYA Score')}: ${selected.totalScore}/1000`,
        `${T('Catégorie', 'Category')}: ${selected.category}`,
      ];

      const status = finalScore >= 70 ? 'ELIGIBLE' : finalScore >= 50 ? 'REVIEW' : 'REJECTED';
      setResult({ score: finalScore, status, details });
      setRunning(false);
      onNotify(status === 'ELIGIBLE'
        ? `✅ ${selected.name} — ${T('Éligible à l\'indexation LYA', 'Eligible for LYA indexation')}`
        : status === 'REVIEW'
        ? `⚠ ${selected.name} — ${T('Dossier à examiner', 'File requires review')}`
        : `✗ ${selected.name} — ${T('Non éligible en l\'état', 'Not eligible as-is')}`
      );
    }, 2200);
  };

  const reset = () => { setResult(null); setRunning(false); };

  const chartData = result ? Array.from({ length: 8 }, (_, i) => ({
    name: `t${i}`,
    value: Math.round(result.score * (0.5 + (i / 8) * 0.5) + (Math.random() - 0.5) * 8),
  })) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Panneau gauche — paramètres */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-primary-cyan" />
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Paramètres de diagnostic', 'Diagnostic parameters')}</h3>
          </div>

          {/* Sélection du projet */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">{T('Œuvre à analyser', 'Work to analyse')}</p>
            <div className="relative">
              <select value={selectedId} onChange={e => { setSelectedId(e.target.value); reset(); }} className="w-full bg-surface-high/40 border border-white/10 text-sm font-bold py-2.5 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-primary-cyan transition-colors">
                {contracts.map(c => <option key={c.id} value={c.id}>[{c.registryIndex}] {c.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            </div>
          </div>

          {/* 4 critères ajustables */}
          {[
            { key: 'originality', labelFR: 'Originalité créative', labelEN: 'Creative originality', color: 'accent-[#00d4ff]' },
            { key: 'commercialPotential', labelFR: 'Potentiel commercial', labelEN: 'Commercial potential', color: 'accent-[#00ff88]' },
            { key: 'rights', labelFR: 'Conformité des droits', labelEN: 'Rights compliance', color: 'accent-[#a78bfa]' },
            { key: 'coproduction', labelFR: 'Aptitude co-production', labelEN: 'Co-production readiness', color: 'accent-amber-400' },
          ].map(c => (
            <div key={c.key} className="space-y-1.5">
              <div className="flex justify-between">
                <p className="text-xs font-bold text-on-surface-variant/60">{T(c.labelFR, c.labelEN)}</p>
                <p className="text-xs font-black text-primary-cyan">{criteria[c.key as keyof typeof criteria]}%</p>
              </div>
              <input
                type="range" min={0} max={100}
                value={criteria[c.key as keyof typeof criteria]}
                onChange={e => { setCriteria(prev => ({ ...prev, [c.key]: +e.target.value })); reset(); }}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-cyan"
              />
            </div>
          ))}

          <button
            onClick={runDiagnostic}
            disabled={running}
            className="w-full py-3.5 bg-primary-cyan text-surface-dim text-sm font-black uppercase tracking-widest hover:bg-white transition-all rounded-xl shadow-[0_0_16px_rgba(0,224,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {running ? <><RefreshCw size={14} className="animate-spin" /> {T('Analyse en cours...', 'Analysing...')}</> : <><Play size={14} /> {T('Lancer le diagnostic', 'Run diagnostic')}</>}
          </button>
        </div>

        {/* Aperçu projet sélectionné */}
        {selected && (
          <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img src={getSafeImageUrl(selected.image, selected.category)} alt={selected.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-mono">{selected.category}</p>
              <p className="text-sm font-black text-on-surface">{selected.name}</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 line-clamp-2">{selected.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Panneau droit — résultat */}
      <div className="lg:col-span-3 space-y-5">
        <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 min-h-[400px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-primary-cyan" />
            <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Résultat du diagnostic', 'Diagnostic result')}</h3>
          </div>

          {!result && !running && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
              <div className="w-16 h-16 bg-primary-cyan/8 border border-primary-cyan/20 rounded-full flex items-center justify-center">
                <Activity size={28} className="text-primary-cyan/40" />
              </div>
              <p className="text-sm text-on-surface-variant/40 font-bold uppercase tracking-widest text-center">
                {T('Configurez les paramètres et lancez le diagnostic', 'Configure parameters and run the diagnostic')}
              </p>
            </div>
          )}

          {running && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
              <div className="w-20 h-20 bg-primary-cyan/10 border border-primary-cyan/30 rounded-full flex items-center justify-center">
                <RefreshCw size={32} className="text-primary-cyan animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-black text-on-surface uppercase tracking-wider">{T('Analyse en cours...', 'Analysing...')}</p>
                <p className="text-sm text-on-surface-variant/50">{T('Évaluation multi-critères LYA', 'Multi-criteria LYA evaluation')}</p>
              </div>
              <div className="flex gap-2">
                {['Origine', 'Créatif', 'Droits', 'Final'].map((s, i) => (
                  <motion.div key={s} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
                    className="px-3 py-1 bg-primary-cyan/10 border border-primary-cyan/20 rounded-full text-[10px] font-black text-primary-cyan uppercase tracking-widest"
                  >{s}</motion.div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Score global */}
              <div className={`rounded-2xl p-5 border text-center ${
                result.status === 'ELIGIBLE' ? 'bg-emerald-400/8 border-emerald-400/25' :
                result.status === 'REVIEW'   ? 'bg-accent-gold/8 border-accent-gold/25' :
                                               'bg-rose-400/8 border-rose-400/25'
              }`}>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1">{T('Score de qualification LYA', 'LYA qualification score')}</p>
                <p className={`text-5xl font-black font-mono ${
                  result.status === 'ELIGIBLE' ? 'text-emerald-400' :
                  result.status === 'REVIEW'   ? 'text-accent-gold' : 'text-rose-400'
                }`}>{result.score}<span className="text-xl text-on-surface-variant/30">/100</span></p>
                <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                  result.status === 'ELIGIBLE' ? 'bg-emerald-400/15 text-emerald-400' :
                  result.status === 'REVIEW'   ? 'bg-accent-gold/15 text-accent-gold' :
                                                 'bg-rose-400/15 text-rose-400'
                }`}>
                  {result.status === 'ELIGIBLE' ? <><CheckCircle size={12} /> {T('Éligible à l\'indexation LYA', 'Eligible for LYA indexation')}</> :
                   result.status === 'REVIEW'   ? <><Eye size={12} /> {T('Dossier à examiner', 'Requires review')}</> :
                                                  <><AlertCircle size={12} /> {T('Non éligible en l\'état', 'Not eligible as-is')}</>}
                </div>
              </div>

              {/* Graphique */}
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="diagGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={result.status === 'ELIGIBLE' ? '#10b981' : result.status === 'REVIEW' ? '#f59e0b' : '#f43f5e'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={result.status === 'ELIGIBLE' ? '#10b981' : result.status === 'REVIEW' ? '#f59e0b' : '#f43f5e'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={result.status === 'ELIGIBLE' ? '#10b981' : result.status === 'REVIEW' ? '#f59e0b' : '#f43f5e'} strokeWidth={2} fill="url(#diagGrad)" dot={false} />
                    <Tooltip contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [v, 'Score']} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Détail des critères */}
              <div className="grid grid-cols-2 gap-2.5">
                {result.details.map((d, i) => (
                  <div key={i} className="bg-surface-high/30 border border-white/6 rounded-xl p-3">
                    <p className="text-xs text-on-surface-variant/70">{d}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-3 bg-white/5 border border-white/10 text-sm font-black rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest">
                  {T('Nouvelle analyse', 'New analysis')}
                </button>
                {result.status === 'ELIGIBLE' && (
                  <button onClick={() => onNotify(T(`${selected?.name} — Envoyé en file de validation`, `${selected?.name} — Sent to validation queue`))} className="flex-1 py-3 bg-emerald-500 text-white text-sm font-black rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest">
                    {T('→ Envoyer en validation', '→ Send to validation')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ONGLET 3 : TABLEAU DE BORD QUALITÉ ──────────────────────────────────────

const QualityDashboard: React.FC<{ lang: 'FR' | 'EN' }> = ({ lang }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const categories = CONTRACTS.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { total: 0, live: 0, avgScore: 0 };
    acc[c.category].total++;
    if (c.status === 'LIVE') acc[c.category].live++;
    acc[c.category].avgScore += c.totalScore;
    return acc;
  }, {} as Record<string, { total: number; live: number; avgScore: number }>);

  const catStats = Object.entries(categories)
    .map(([cat, s]) => ({ cat, ...s, avgScore: Math.round(s.avgScore / s.total) }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 8);

  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['L', 'M', 'Me', 'J', 'V', 'S', 'D'][i],
    validated: Math.floor(Math.random() * 8) + 2,
    rejected: Math.floor(Math.random() * 3),
  }));

  const topCreators = CONTRACTS.filter(c => c.status === 'LIVE')
    .sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: T('Projets indexés', 'Indexed projects'), value: CONTRACTS.filter(c => c.status === 'LIVE').length, color: 'text-primary-cyan', sub: T('sur la plateforme', 'on the platform') },
          { label: T('Score LYA moyen', 'Average LYA Score'), value: `${Math.round(CONTRACTS.reduce((s, c) => s + c.totalScore, 0) / CONTRACTS.length)}`, color: 'text-accent-gold', sub: '/1000' },
          { label: T('Catégories actives', 'Active categories'), value: Object.keys(categories).length, color: 'text-[#a78bfa]', sub: T('disciplines créatives', 'creative disciplines') },
          { label: T('Taux de validation', 'Validation rate'), value: '78%', color: 'text-emerald-400', sub: T('cette semaine', 'this week') },
        ].map((k, i) => (
          <div key={i} className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-1">
            <p className="text-xs text-on-surface-variant/50 font-bold uppercase tracking-widest">{k.label}</p>
            <p className={`text-3xl font-black font-mono ${k.color}`}>{k.value}</p>
            <p className="text-xs text-on-surface-variant/30">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité de la semaine */}
        <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Activité de validation — 7 derniers jours', 'Validation activity — last 7 days')}</h3>
          <div className="flex items-end gap-2 h-32">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: 100 }}>
                  <div className="w-full bg-rose-400/30 rounded-t-sm" style={{ height: `${(d.rejected / 10) * 100}%`, minHeight: 4 }} />
                  <div className="w-full bg-primary-cyan/60 rounded-b-sm" style={{ height: `${(d.validated / 10) * 100}%`, minHeight: 8 }} />
                </div>
                <p className="text-[10px] text-on-surface-variant/40 font-mono">{d.day}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary-cyan/60" /><span className="text-on-surface-variant/60">{T('Validés', 'Validated')}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-400/30" /><span className="text-on-surface-variant/60">{T('Rejetés', 'Rejected')}</span></div>
          </div>
        </div>

        {/* Score moyen par catégorie */}
        <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Score LYA moyen par discipline', 'Average LYA Score by discipline')}</h3>
          <div className="space-y-3">
            {catStats.map(c => (
              <div key={c.cat} className="flex items-center gap-3">
                <div className="text-on-surface-variant/40 shrink-0">{CATEGORY_ICONS[c.cat] || <Sparkles size={13} />}</div>
                <p className="text-xs font-bold text-on-surface w-28 shrink-0 truncate">{c.cat}</p>
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.avgScore / 1000) * 100}%` }} transition={{ duration: 1, delay: 0.1 }} className="h-full bg-primary-cyan rounded-full" />
                </div>
                <p className="text-xs font-black text-primary-cyan w-12 text-right shrink-0">{c.avgScore}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top créateurs */}
      <div className="bg-surface-low/40 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">{T('Projets les mieux notés — Plateforme LYA', 'Top rated projects — LYA Platform')}</h3>
        <div className="space-y-3">
          {topCreators.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
              <span className="text-sm font-black text-on-surface-variant/30 w-6 text-center">{i + 1}</span>
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img src={getSafeImageUrl(c.image, c.category)} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-on-surface truncate">{c.name}</p>
                <p className="text-xs text-on-surface-variant/50">{c.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-accent-gold">{c.totalScore}<span className="text-xs text-on-surface-variant/30 font-normal">/1000</span></p>
                <p className={`text-xs font-bold ${c.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{c.growth >= 0 ? '+' : ''}{c.growth}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── VUE PRINCIPALE ───────────────────────────────────────────────────────────

export const ValidationView: React.FC<{
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange?: (view: any) => void;
}> = ({ user, onNotify, onViewChange }) => {
  const { t, language } = useTranslation();
  const lang: 'FR' | 'EN' = language === 'FR' ? 'FR' : 'EN';
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;

  const [activeTab, setActiveTab] = useState<'queue' | 'diagnostic' | 'dashboard'>('queue');

  // Accès restreint
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-500/20"
        >
          <Lock size={48} className="text-rose-500" />
        </motion.div>
        <h2 className="text-3xl font-black font-headline uppercase tracking-tighter text-on-surface mb-4">
          {T('Accès restreint', 'Access Restricted')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-8 text-sm leading-relaxed opacity-70">
          {T('La Console de Validation est réservée aux Professionnels certifiés et aux Administrateurs LYA.', 'The Validation Console is reserved for certified Professionals and LYA Administrators.')}
        </p>
        <button onClick={() => onViewChange?.('PRICING')} className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-widest hover:bg-white transition-all rounded-xl">
          {T('Passer à Pro', 'Upgrade to Pro')}
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'queue' as const, labelFR: 'File de Validation', labelEN: 'Validation Queue', icon: <CheckSquare size={14} /> },
    { key: 'diagnostic' as const, labelFR: 'Console de Diagnostic', labelEN: 'Diagnostic Console', icon: <Activity size={14} /> },
    { key: 'dashboard' as const, labelFR: 'Tableau de Bord Qualité', labelEN: 'Quality Dashboard', icon: <BarChart2 size={14} /> },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        titleWhite={T('CONSOLE DE', 'QUALITY')}
        titleAccent={T('CONTRÔLE QUALITÉ', 'CONTROL CONSOLE')}
        description={T('Validation, diagnostic et supervision de l\'indexation des créations LYA', 'Validation, diagnosis and supervision of LYA creative indexation')}
        accentColor="text-primary-cyan"
      />

      {/* Onglets */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 pb-4 text-sm font-black uppercase tracking-wider relative whitespace-nowrap transition-all ${activeTab === tab.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab.icon}
            {T(tab.labelFR, tab.labelEN)}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.4)] transition-all duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'queue'      && <ValidationQueue user={user} lang={lang} onNotify={onNotify} />}
          {activeTab === 'diagnostic' && <DiagnosticConsole lang={lang} onNotify={onNotify} />}
          {activeTab === 'dashboard'  && <QualityDashboard lang={lang} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
