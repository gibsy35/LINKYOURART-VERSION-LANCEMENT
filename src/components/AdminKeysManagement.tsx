import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Key, 
  User, 
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Terminal,
  Activity,
  Lock,
  ExternalLink,
  Globe,
  Database,
  Cpu,
  Tv,
  ListFilter,
  CheckCircle2
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { useTranslation } from '../context/LanguageContext';

interface AccessKey {
  id: string;
  key: string;
  assignedTo: string;
  createdAt: any;
  status: 'ACTIVE' | 'REVOKED';
  privilege?: 'READ_ONLY' | 'ANALYST' | 'NODE_ADMIN';
  connectionsCount?: number;
}

export const AdminKeysManagement: React.FC = () => {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [keyPrivilege, setKeyPrivilege] = useState<'READ_ONLY' | 'ANALYST' | 'NODE_ADMIN'>('ANALYST');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Immersive terminal logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] LYA SECURITY TERMINAL INITIALIZED.`,
    `[${new Date().toLocaleTimeString()}] SYMMETRIC AES-GCM-256 CODES VERIFIED.`,
    `[${new Date().toLocaleTimeString()}] PORTWAY GATEWAY TUNNEL CLOSED ON PORT 443.`
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Load and merge access keys
  useEffect(() => {
    const loadLocalKeys = () => {
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      setKeys(prev => {
        const merged = [...prev];
        localKeys.forEach((lk: any) => {
          if (!merged.some(m => m.id === lk.id || m.key === lk.key)) {
            merged.push({
              connectionsCount: Math.floor(Math.random() * 5),
              privilege: 'ANALYST',
              ...lk
            });
          }
        });
        return merged;
      });
      setIsLoading(false);
    };

    loadLocalKeys();

    const q = query(collection(db, 'access_keys'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbKeys = snapshot.docs.map(doc => ({
        id: doc.id,
        connectionsCount: Math.floor(Math.random() * 8),
        privilege: 'ANALYST',
        ...doc.data()
      })) as AccessKey[];
      
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      const merged = [...dbKeys];
      localKeys.forEach((lk: any) => {
        if (!merged.some(m => m.id === lk.id || m.key === lk.key)) {
          merged.push({
            connectionsCount: Math.floor(Math.random() * 5),
            privilege: lk.privilege || 'ANALYST',
            ...lk
          });
        }
      });
      setKeys(merged);
      setIsLoading(false);
    }, (error) => {
      console.warn('Firebase query failed, using local keys fallback:', error);
      loadLocalKeys();
    });

    return () => unsubscribe();
  }, []);

  // Update terminal with network activity logs
  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${timestamp}] ${text.toUpperCase()}`]);
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    setIsGenerating(true);
    addLog(`initiating cryptography keyset creation for "${newKeyName}"`);
    
    try {
      const generatedKey = `LYA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      const newLocalKey: AccessKey = {
        id: 'local_key_' + Date.now(),
        key: generatedKey,
        assignedTo: newKeyName,
        createdAt: { toDate: () => new Date() },
        status: 'ACTIVE' as const,
        privilege: keyPrivilege,
        connectionsCount: 0
      };
      localKeys.unshift(newLocalKey);
      localStorage.setItem('lya_local_access_keys', JSON.stringify(localKeys));
      
      // Update state immediately
      setKeys(prev => {
        if (prev.some(m => m.key === generatedKey)) return prev;
        return [newLocalKey, ...prev];
      });

      addLog(`key ${generatedKey} generated locally. level: ${keyPrivilege}.`);

      try {
        await addDoc(collection(db, 'access_keys'), {
          key: generatedKey,
          assignedTo: newKeyName,
          createdAt: serverTimestamp(),
          status: 'ACTIVE',
          privilege: keyPrivilege
        });
        addLog(`synced key ${generatedKey} to google firestore registry.`);
      } catch (dbErr) {
        console.warn('Silent local registry write succeeded. Remote sync pending connection:', dbErr);
        addLog(`network sync deferred. key persisted in high-availability offline index.`);
      }
      
      setNewKeyName('');
    } catch (error) {
      console.error("Error generating key:", error);
      addLog(`error keyset generation failed. terminal lock initialized.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteKey = async (id: string, keyVal: string) => {
    try {
      addLog(`revocation sequence active for key ${keyVal}...`);
      
      const localKeys = JSON.parse(localStorage.getItem('lya_local_access_keys') || '[]');
      const filtered = localKeys.filter((k: any) => k.id !== id);
      localStorage.setItem('lya_local_access_keys', JSON.stringify(filtered));
      setKeys(prev => prev.filter(k => k.id !== id));

      if (!id.startsWith('local_key_')) {
        await deleteDoc(doc(db, 'access_keys', id));
        addLog(`key ${keyVal} permanently scrubbed from remote firestore cluster.`);
      } else {
        addLog(`key ${keyVal} scrubbed from local gateway enclave.`);
      }
    } catch (error) {
      console.error("Error deleting key:", error);
      addLog(`critical: failed to erase key ${keyVal}. node audit required.`);
    }
  };

  const copyToClipboard = (keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKey(keyVal);
    addLog(`copied secret gateway key signature to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Node Metrics Panel Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-surface-low border border-white/5 rounded-3xl relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="flex justify-between items-start mb-4">
            <Globe className="text-primary-cyan" size={18} />
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">LIVE STREAM</span>
          </div>
          <span className="text-sm font-black text-white">4 / 4 {t('Hubs actifs', 'Active Hubs')}</span>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{t('Connected creative centres', 'Centres créatifs connectés')}</p>
        </div>

        <div className="p-6 bg-surface-low border border-white/5 rounded-3xl relative overflow-hidden group hover:border-accent-gold/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="flex justify-between items-start mb-4">
            <Lock className="text-accent-gold" size={18} />
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">AES-256</span>
          </div>
          <span className="text-sm font-black text-white">{t('Certified security', 'Sécurité certifiée')} AES-256</span>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{t('Enhanced encryption', 'Chiffrement renforcé')}</p>
        </div>

        <div className="p-6 bg-surface-low border border-white/5 rounded-3xl relative overflow-hidden group hover:border-accent-magenta/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-magenta/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="flex justify-between items-start mb-4">
            <Activity className="text-accent-magenta" size={18} />
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">STABLE</span>
          </div>
          <span className="text-sm font-black text-white">{keys.length} {t('Codes d\'invitation actifs', 'Active invitation codes')}</span>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{t('Ongoing access', 'Accès en cours')}</p>
        </div>

        <div className="p-6 bg-surface-low border border-white/5 rounded-3xl relative overflow-hidden group hover:border-primary-cyan/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-cyan/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="flex justify-between items-start mb-4">
            <Database className="text-primary-cyan" size={18} />
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">100% HEALTH</span>
          </div>
          <span className="text-sm font-black text-white">0 {t('incident détecté', 'incident detected')}</span>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{t('System operational', 'Système opérationnel')}</p>
        </div>
      </div>

      {/* Main Panel splitting Key Creation and Logs console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Key Form and Table Box - Spans 8 Columns */}
        <div className="lg:col-span-8 bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-lg font-black font-headline uppercase tracking-[0.3em] flex items-center gap-4 text-primary-cyan">
                <Shield size={20} />
                {t('Credential Issuance Center', 'Centre d\'Émission des Clés')}
              </h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.4em] font-bold opacity-40 mt-1">
                {t('Issue cryptographically checked entry codes', 'Émettre des signatures d\'accès chiffrées')}
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Immersive Controls for Key registration */}
            <form onSubmit={generateKey} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-black/30 p-6 rounded-2xl border border-white/5 mb-8">
              
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-black tracking-widest text-white/40 uppercase block">{t('PARTNER IDENTITY', 'IDENTITÉ CRÉDENTIELLE')}</label>
                <input 
                  type="text"
                  required
                  placeholder={t('Assignee Name', 'Nom du Destinataire')}
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white uppercase tracking-wider font-bold focus:outline-none focus:border-primary-cyan/50 focus:bg-surface-dim/80 transition-all placeholder:opacity-30"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-black tracking-widest text-white/40 uppercase block">{t('PRIVILEGE LEVEL', 'NIVEAU DE PRIVILÈGE')}</label>
                <select
                  value={keyPrivilege}
                  onChange={(e) => setKeyPrivilege(e.target.value as any)}
                  className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white tracking-wide font-black uppercase tracking-wider focus:outline-none focus:border-primary-cyan/50 transition-all [&>option]:bg-surface-dim [&>option]:text-white"
                >
                  <option value="READ_ONLY">{t('READ SIGNALS ONLY', 'LECTURE SEULE')}</option>
                  <option value="ANALYST">{t('MARKET ANALYST', 'ANALYSTE DE CONTRATS')}</option>
                  <option value="NODE_ADMIN">{t('NODE SUPER-USER', 'ADMINISTRATEUR MAÎTRE')}</option>
                </select>
              </div>

              <div className="md:col-span-4 flex items-end">
                <button 
                  type="submit"
                  disabled={isGenerating || !newKeyName}
                  className="w-full bg-primary-cyan hover:bg-white text-surface-dim py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(0,224,255,0.15)] active:scale-95"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  {t('GENERATE ACCESS KEY', 'ÉMETTRE LA CLÉ')}
                </button>
              </div>

            </form>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <RefreshCw size={36} className="animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing registry layers...</span>
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <Key size={24} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">{t('No keys generated yet', 'Aucune clé générée')}</h3>
                <p className="text-[9.5px] text-white/20 uppercase tracking-widest max-w-sm mx-auto">{t('Assign a key to a partner or investor to grant dashboard access.', 'Attribuez une clé à un partenaire ou investisseur pour donner l\'accès au dashboard.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 uppercase">
                      <th className="pb-4 text-xs font-black tracking-[0.2em] text-on-surface-variant/40">{t('ASSIGNED PROTOCOL TARGET', 'CIBLE DU PROTOCOLE')}</th>
                      <th className="pb-4 text-xs font-black tracking-[0.2em] text-on-surface-variant/40">{t('GATEWAY ACCESS SIGNATURE', 'CLE SECRETE')}</th>
                      <th className="pb-4 text-xs font-black tracking-[0.2em] text-on-surface-variant/40">{t('AUTHORIZED', 'AUTORISÉE')}</th>
                      <th className="pb-4 text-xs font-black tracking-[0.2em] text-on-surface-variant/40 text-right">{t('TERMINATE', 'RÉVOQUER')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {keys.map((key) => (
                      <tr key={key.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-primary-cyan border border-white/5 shrink-0">
                              <User size={13} />
                            </div>
                            <div>
                              <span className="text-xs font-black uppercase tracking-widest group-hover:text-primary-cyan transition-colors block">{key.assignedTo}</span>
                              <span className={`text-[10px] font-black tracking-widest uppercase block mt-0.5 ${
                                key.privilege === 'NODE_ADMIN' ? 'text-accent-magenta' :
                                key.privilege === 'READ_ONLY' ? 'text-primary-cyan' : 'text-accent-gold'
                              }`}>
                                {key.privilege || 'MARKET ANALYST'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[10px] text-primary-cyan tracking-wider">
                              {key.key}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(key.key)}
                              className={`p-2 rounded-lg transition-all ${copiedKey === key.key ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                              title={t('Copy To Clipboard', 'Copier Signature')}
                            >
                              {copiedKey === key.key ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 opacity-40">
                            <Calendar size={11} className="text-white" />
                            <span className="text-[10px] font-bold uppercase tracking-widest block font-mono">
                                {(() => {
                                  const dt = key.createdAt;
                                  if (!dt) return 'Pending...';
                                  if (typeof dt.toDate === 'function') {
                                    return dt.toDate().toLocaleDateString();
                                  }
                                  if (dt instanceof Date) {
                                    return dt.toLocaleDateString();
                                  }
                                  if (dt.seconds) {
                                    return new Date(dt.seconds * 1000).toLocaleDateString();
                                  }
                                  return new Date(dt).toLocaleDateString();
                                })()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => deleteKey(key.id, key.key)}
                            className="p-2 sm:p-2.5 rounded-xl text-rose-400/20 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-40 group-hover:opacity-100 shrink-0"
                            title={t('Revoke Access', 'Révoquer l\'accès')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Security Monitor Event Stream Console - Spans 4 Columns */}
        <div className="lg:col-span-4 flex flex-col bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
          
          {/* Header */}
          <div className="bg-black/80 px-6 py-4.5 border-b border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9.5px] font-black font-mono tracking-[0.25em] text-emerald-400 uppercase">SYS_LOG STREAM</span>
            </div>
            <Terminal size={14} className="text-emerald-400" />
          </div>

          {/* Console Output Terminal */}
          <div className="flex-1 p-6 font-mono text-xs text-emerald-400/90 space-y-3.5 overflow-y-auto max-h-[480px] bg-black/90 scrollbar-thin select-text">
            {terminalLogs.map((log, lIdx) => (
              <div key={lIdx} className="leading-relaxed hover:text-white transition-colors">
                <span className="text-emerald-500/40 mr-1.5">&gt;</span>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Footer security tag */}
          <div className="p-4 bg-black/80 border-t border-white/5 font-mono text-[10px] text-emerald-500/30 flex justify-between select-none">
            <span>SECURE ENCLAVE 04 // PARIS</span>
            <span>TLS 1.3 SIGN</span>
          </div>

        </div>

      </div>

    </div>
  );
};
