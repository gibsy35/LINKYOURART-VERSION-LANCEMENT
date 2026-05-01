
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Key, 
  Webhook, 
  Database, 
  Terminal, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Activity,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { UserProfile, UserRole } from '../types';

import { PageHeader } from '../components/ui/PageHeader';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED';
}

interface APIViewProps {
  user: UserProfile | null;
  onNotify: (msg: string) => void;
}

export const APIView: React.FC<APIViewProps> = ({ user, onNotify }) => {
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Terminal',
      key: 'lya_live_8f2k9s1m0p5r4t3v6w7x8y9z',
      created: '2026-01-15',
      lastUsed: '2 minutes ago',
      status: 'ACTIVE'
    },
    {
      id: '2',
      name: 'Development Sandbox',
      key: 'lya_test_1a2b3c4d5e6f7g8h9i0j1k2l',
      created: '2026-03-10',
      lastUsed: '1 day ago',
      status: 'ACTIVE'
    }
  ]);

  const handleGenerateKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: `New API Key ${keys.length + 1}`,
      key: `lya_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'ACTIVE'
    };
    setKeys([...keys, newKey]);
    onNotify('NEW API KEY GENERATED SUCCESSFULLY');
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'REVOKED' as const } : k));
    onNotify('API KEY REVOKED. ACCESS TERMINATED.');
  };

  const codeSnippet = `
// Initialize LYA SDK
import { LYAClient } from '@lya/protocol-sdk';

const client = new LYAClient({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});

// Fetch Creative Equity Index
const index = await client.registry.getIndex('GLOBAL_ART');
console.log('Current Value:', index.unitValue);

// Subscribe to Real-time Settlements
client.settlements.on('complete', (data) => {
  console.log('New Settlement:', data.id);
});
  `.trim();

  // Access Control: Only Admin or Pro users can access API
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary-cyan/10 rounded-full flex items-center justify-center mb-8 border border-primary-cyan/20 shadow-[0_0_30px_rgba(0,224,255,0.2)]"
        >
          <Code2 size={48} className="text-primary-cyan" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase italic text-on-surface mb-6 tracking-tighter">
          {t('Developer Access Restricted', 'Accès Développeur Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('API access and developer tools are exclusive to Professional accounts. Build custom integrations and automate your creative equity workflows.', 'L\'accès à l\'API et aux outils de développement sont exclusifs aux comptes Professionnels. Créez des intégrations personnalisées et automatisez vos flux de travail d\'équité créative.')}
        </p>
        <button 
          onClick={() => onNotify('Redirecting to Pricing...')}
          className="px-10 py-5 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.2em] text-[11px] hover:bg-white transition-all active:scale-95 shadow-[0_15px_30px_rgba(0,224,255,0.2)]"
        >
          {t('Upgrade to Professional', 'Passer au Professionnel')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-24 relative min-h-screen px-6 md:px-12">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,224,255,0.05),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(238,192,94,0.03),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <PageHeader 
        titleWhite={t('Developer', 'DEVELOPER')}
        titleAccent={t('Terminal', 'TERMINAL')}
        description={t('Integrate the LYA Protocol into your own applications. Access real-time market data, manage creative contracts, and automate settlements through our secure REST and WebSocket APIs.', 'Intégrez le protocole LYA dans vos propres applications. Accédez aux données de marché en temps réel, gérez les contrats créatifs et automatisez les règlements via nos API REST et WebSocket sécurisées.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-16 md:-mt-24 mb-12 relative z-20">
        <div className="flex flex-wrap gap-4">
          <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[10px] text-primary-cyan uppercase tracking-widest font-black mb-1 opacity-70">{t('API Status', 'Statut API')}</div>
            <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('Operational', 'OPÉRATIONNEL')}</div>
          </div>
          <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Latence', 'Latence')}</div>
            <div className="text-3xl font-black text-white italic tracking-tighter uppercase">12ms</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* API Keys Management */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                <Key className="text-primary-cyan" size={24} />
                API KEYS
              </h2>
              <button 
                onClick={handleGenerateKey}
                className="px-6 py-2 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
              >
                GENERATE NEW KEY
              </button>
            </div>

            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key.id} className={`bg-black/20 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all group ${key.status === 'REVOKED' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-black text-white uppercase tracking-tight">{key.name}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm ${key.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {key.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-50">CREATED: {key.created} • LAST USED: {key.lastUsed}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {key.status === 'ACTIVE' && (
                        <>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(key.key);
                              onNotify('API KEY COPIED TO CLIPBOARD');
                            }}
                            className="p-2 text-on-surface-variant hover:text-primary-cyan transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            onClick={() => handleRevokeKey(key.id)}
                            className="p-2 text-on-surface-variant hover:text-red-400 transition-colors"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-xs font-mono text-primary-cyan/70 tracking-wider">
                      {showKey === key.id ? key.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button 
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {showKey === key.id ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documentation Snippet */}
          <section className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                <Terminal className="text-primary-cyan" size={24} />
                QUICK START
              </h2>
              <div className="flex bg-black/40 p-1 rounded-sm">
                <button 
                  onClick={() => onNotify('SWITCHING TO JAVASCRIPT SDK DOCS...')}
                  className="px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-primary-cyan text-surface-dim"
                >
                  JAVASCRIPT
                </button>
                <button 
                  onClick={() => onNotify('SWITCHING TO PYTHON SDK DOCS...')}
                  className="px-4 py-1 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white"
                >
                  PYTHON
                </button>
                <button 
                  onClick={() => onNotify('SWITCHING TO CURL EXAMPLES...')}
                  className="px-4 py-1 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white"
                >
                  CURL
                </button>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-6 relative group">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippet);
                  onNotify('CODE SNIPPET COPIED');
                }}
                className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-lg text-on-surface-variant hover:text-primary-cyan opacity-0 group-hover:opacity-100 transition-all"
              >
                <Copy size={16} />
              </button>
              <pre className="text-xs font-mono text-on-surface-variant leading-relaxed overflow-x-auto">
                {codeSnippet}
              </pre>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* API Status Card */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Activity className="text-emerald-400" size={18} />
              API STATUS
            </h4>
            <div className="space-y-6">
              <button 
                onClick={() => onNotify('VIEWING REST API STATUS...')}
                className="w-full flex items-center justify-between hover:bg-white/5 p-1 rounded transition-colors"
              >
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">REST API</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">OPERATIONAL</span>
              </button>
              <button 
                onClick={() => onNotify('VIEWING WEBSOCKETS STATUS...')}
                className="w-full flex items-center justify-between hover:bg-white/5 p-1 rounded transition-colors"
              >
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">WEBSOCKETS</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">OPERATIONAL</span>
              </button>
              <button 
                onClick={() => onNotify('VIEWING REGISTRY HUBS STATUS...')}
                className="w-full flex items-center justify-between hover:bg-white/5 p-1 rounded transition-colors"
              >
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">REGISTRY HUBS</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">99.9% UPTIME</span>
              </button>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-white">RATE LIMIT USAGE</span>
                  <span className="text-primary-cyan">12%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-cyan" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Webhook className="text-accent-purple" size={18} />
              WEBHOOKS
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-6 font-medium">
              Receive real-time notifications for contract validations, settlements, and market shifts.
            </p>
            <button 
              onClick={() => onNotify('WEBHOOK CONFIGURATION PORTAL OPENING...')}
              className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-surface-dim transition-all"
            >
              CONFIGURE WEBHOOKS
            </button>
          </div>

          {/* Documentation Links */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">DOCUMENTATION</h4>
            <div className="space-y-3">
              {[
                { label: 'API Reference', icon: <BookOpen size={14} /> },
                { label: 'SDK Documentation', icon: <Code2 size={14} /> },
                { label: 'Security Protocols', icon: <ShieldCheck size={14} /> },
                { label: 'Rate Limits & Pricing', icon: <Zap size={14} /> }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onNotify(`OPENING ${item.label.toUpperCase()}...`)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-primary-cyan/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-on-surface-variant group-hover:text-primary-cyan transition-colors">{item.icon}</span>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                  </div>
                  <ExternalLink size={14} className="text-on-surface-variant group-hover:text-primary-cyan transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
