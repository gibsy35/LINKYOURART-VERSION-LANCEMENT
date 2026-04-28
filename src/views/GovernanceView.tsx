
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  ShieldCheck, 
  Vote, 
  FileText, 
  Activity, 
  Lock, 
  ChevronRight, 
  AlertCircle,
  Database,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { UserProfile, UserRole } from '../types';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'PASSED' | 'FAILED' | 'QUEUED';
  votesFor: number;
  votesAgainst: number;
  endTime: string;
  proposer: string;
}

interface GovernanceViewProps {
  user: UserProfile | null;
  onNotify: (msg: string) => void;
}

const votingHistory = [
  { id: 'LYA-P-39', action: 'VOTED FOR', power: '12,450 LYA', date: '2026-03-28', status: 'PASSED' },
  { id: 'LYA-P-38', action: 'VOTED AGAINST', power: '10,200 LYA', date: '2026-03-15', status: 'FAILED' },
  { id: 'LYA-P-37', action: 'VOTED FOR', power: '10,200 LYA', date: '2026-02-20', status: 'PASSED' },
  { id: 'LYA-P-36', action: 'VOTED FOR', power: '8,500 LYA', date: '2026-01-12', status: 'PASSED' },
  { id: 'LYA-P-35', action: 'VOTED AGAINST', power: '8,500 LYA', date: '2025-12-05', status: 'PASSED' },
  { id: 'LYA-P-34', action: 'VOTED FOR', power: '5,000 LYA', date: '2025-11-20', status: 'PASSED' }
];

const networkHubs = [
  { label: 'Paris Registry', status: 'ONLINE', load: '12%', type: 'Primary' },
  { label: 'Tokyo Hub', status: 'ONLINE', load: '45%', type: 'Secondary' },
  { label: 'NY Settlement', status: 'ONLINE', load: '28%', type: 'Primary' },
  { label: 'London Hub', status: 'MAINTENANCE', load: '0%', type: 'Relay' },
  { label: 'Geneva Vault', status: 'ONLINE', load: '8%', type: 'Security' },
  { label: 'Singapore Hub', status: 'ONLINE', load: '15%', type: 'Relay' },
  { label: 'Dubai Gateway', status: 'ONLINE', load: '22%', type: 'Relay' }
];

export const GovernanceView: React.FC<GovernanceViewProps> = ({ user, onNotify }) => {
  const { t } = useTranslation();
  
  const [votedProposals, setVotedProposals] = useState<Record<string, 'FOR' | 'AGAINST'>>({});
  const [visibleHistory, setVisibleHistory] = useState(3);
  const [visibleNodes, setVisibleNodes] = useState(3);
  
  const handleVote = (proposalId: string, direction: 'FOR' | 'AGAINST') => {
    if (votedProposals[proposalId]) {
      onNotify(`ALREADY VOTED ${votedProposals[proposalId]} ON PROPOSAL ${proposalId}`);
      return;
    }
    
    setVotedProposals(prev => ({ ...prev, [proposalId]: direction }));
    onNotify(`VOTE CAST ${direction} FOR PROPOSAL ${proposalId}. POWER: 12,450 LYA`);
  };

  const proposals: Proposal[] = [
    {
      id: 'LYA-P-42',
      title: 'Protocol Upgrade: V3.0 Implementation',
      description: 'Migration of all creative equity hubs to the new high-throughput validation engine.',
      status: 'ACTIVE',
      votesFor: 1250000,
      votesAgainst: 45000,
      endTime: '2d 14h left',
      proposer: 'LYA_CORE_FOUNDATION'
    },
    {
      id: 'LYA-P-41',
      title: 'Expansion of Institutional Custody Partners',
      description: 'Onboarding of three new tier-1 banks for multi-sig asset custody.',
      status: 'PASSED',
      votesFor: 2800000,
      votesAgainst: 120000,
      endTime: 'Ended 3d ago',
      proposer: 'ALPHA_CAPITAL_DAO'
    },
    {
      id: 'LYA-P-40',
      title: 'Adjustment of Registry Validation Fees',
      description: 'Proposal to reduce validation fees for independent creators by 15%.',
      status: 'QUEUED',
      votesFor: 980000,
      votesAgainst: 890000,
      endTime: 'Execution in 12h',
      proposer: 'CREATOR_GUILD_V2'
    }
  ];

  // Access Control: Only Admin or Pro users can access Governance
  if (user?.role !== UserRole.ADMIN && !user?.isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        >
          <Lock size={48} className="text-red-500" />
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase italic text-on-surface mb-6 tracking-tighter">
          {t('Governance Access Restricted', 'Accès à la Gouvernance Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('Protocol Governance is reserved for institutional partners and verified professionals. Your LYA Score and holdings determine your voting power.', 'La gouvernance du protocole est réservée aux partenaires institutionnels et aux professionnels vérifiés. Votre score LYA et vos avoirs déterminent votre pouvoir de vote.')}
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
    <div className="space-y-12 pb-24 relative min-h-screen">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,224,255,0.05),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(238,192,94,0.03),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <header className="relative z-10 pt-8 pb-12 bg-surface-dim border-b border-white/5 -mx-6 md:-mx-12 px-6 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white leading-[0.9] uppercase italic mb-10 flex items-center gap-4">
              <div className="h-[2px] w-12 bg-accent-gold"></div>
              <span>{t('System', 'GOUVERNANCE')} <span className="text-primary-cyan drop-shadow-[0_0_20px_rgba(0,224,255,0.4)]">{t('Governance', 'DU SYSTÈME')}</span></span>
            </h1>
            <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-xl text-[11px] md:text-sm leading-relaxed opacity-70 uppercase tracking-[0.3em] font-black italic mb-10">
              {t('PARTICIPATE IN THE EVOLUTION OF THE LINKYOURART PROTOCOL. PROPOSE CHANGES, VOTE ON UPGRADES, AND MONITOR THE ECOSYSTEM HEALTH.', 'PARTICIPEZ À L\'ÉVOLUTION DU PROTOCOLE LINKYOURART. PROPOSEZ DES CHANGEMENTS, VOTEZ SUR LES MISES À NIVEAU ET SURVEILLEZ LA SANTÉ DE L\'ÉCOSYSTÈME.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-primary-cyan uppercase tracking-widest font-black mb-1 opacity-70">{t('Voting Power', 'Pouvoir de Vote')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('Institutional', 'INSTITUTIONNEL')}</div>
            </div>
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Hub Status', 'Statut du Hub')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('Syncing', 'SYNCHRONISÉ')}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 relative z-10">
        {[
          { label: 'Total Voting Power', value: '42.5M LYA', icon: <Vote className="text-primary-cyan" />, sub: 'Active Stake', color: 'text-primary-cyan' },
          { label: 'Treasury Balance', value: '$128.4M', icon: <Database className="text-accent-gold" />, sub: '+12% this month', color: 'text-accent-gold' },
          { label: 'Active Proposals', value: '12', icon: <FileText className="text-accent-purple" />, sub: '3 ending soon', color: 'text-accent-purple' },
          { label: 'System Health', value: 'OPTIMAL', icon: <Activity className="text-emerald-400" />, sub: '99.99% Hub Uptime', color: 'text-emerald-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-8 rounded-[2rem] border-white/10 group hover:border-white/20 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant/30 italic">PROTO_00{i+1}</span>
            </div>
            <p className={`text-[10px] font-black ${stat.color} uppercase tracking-widest mb-2 opacity-80 italic`}>{stat.label}</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter mb-2 leading-none">{stat.value}</h3>
            <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
        {/* Proposals List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
              <Scale className="text-primary-cyan" size={24} />
              ACTIVE PROPOSALS
            </h2>
            <button 
              onClick={() => onNotify('PROPOSAL CREATION PORTAL OPENING...')}
              className="px-6 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-surface-dim transition-all"
            >
              CREATE PROPOSAL
            </button>
          </div>

          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-surface-low/30 border border-white/5 rounded-2xl p-8 hover:border-primary-cyan/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono text-primary-cyan font-bold">{proposal.id}</span>
                    <span className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                      proposal.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      proposal.status === 'PASSED' ? 'bg-primary-cyan/20 text-primary-cyan border border-primary-cyan/30' :
                      proposal.status === 'QUEUED' ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white/90 uppercase tracking-tight mb-2 group-hover:text-primary-cyan transition-colors italic">{proposal.title}</h3>
                  <p className="text-xs md:text-sm text-on-surface-variant/50 font-medium leading-relaxed max-w-2xl">{proposal.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">TIME REMAINING</p>
                  <p className="text-xs font-mono text-white font-bold">{proposal.endTime}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-emerald-400">FOR: {(proposal.votesFor / 1000000).toFixed(1)}M LYA</span>
                  <span className="text-accent-pink">AGAINST: {(proposal.votesAgainst / 1000).toFixed(0)}K LYA</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                    style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-accent-pink shadow-[0_0_15px_rgba(255,105,180,0.5)]" 
                    style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-primary-cyan" />
                  </div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">PROPOSED BY: <span className="text-white">{proposal.proposer}</span></p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleVote(proposal.id, 'FOR')}
                    disabled={!!votedProposals[proposal.id]}
                    className={`px-8 py-3 font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 flex items-center gap-2 ${votedProposals[proposal.id] === 'FOR' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white disabled:opacity-50'}`}
                  >
                    {votedProposals[proposal.id] === 'FOR' && <ShieldCheck size={14} />}
                    {votedProposals[proposal.id] === 'FOR' ? 'VOTED FOR' : 'VOTE FOR'}
                  </button>
                  <button 
                    onClick={() => handleVote(proposal.id, 'AGAINST')}
                    disabled={!!votedProposals[proposal.id]}
                    className={`px-8 py-3 font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 flex items-center gap-2 ${votedProposals[proposal.id] === 'AGAINST' ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white disabled:opacity-50'}`}
                  >
                    {votedProposals[proposal.id] === 'AGAINST' && <AlertCircle size={14} />}
                    {votedProposals[proposal.id] === 'AGAINST' ? 'VOTED AGAINST' : 'VOTE AGAINST'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Voting History */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3 mb-8">
              <Activity className="text-primary-cyan" size={24} />
              VOTING HISTORY & ARCHIVES
            </h2>
            <div className="space-y-4">
              {votingHistory.slice(0, visibleHistory).map((vote, i) => (
                <button 
                  key={i} 
                  onClick={() => onNotify(`VIEWING DETAILS FOR PROPOSAL ${vote.id}...`)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-primary-cyan/30 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-[10px] font-mono text-primary-cyan font-bold">{vote.id}</p>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{vote.action}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">POWER</p>
                      <p className="text-xs font-mono text-white">{vote.power}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">{vote.date}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${vote.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {vote.status}
                    </span>
                  </div>
                </button>
              ))}

              {visibleHistory < votingHistory.length && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setVisibleHistory(prev => prev + 3)}
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-cyan hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span>LOAD MORE HISTORY</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          {/* Voting Power Card */}
          <div className="bg-gradient-to-br from-surface-low/50 to-primary-cyan/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <Vote size={60} className="text-primary-cyan" />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">YOUR VOTING POWER</h4>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-black text-white italic tracking-tighter mb-1">12,450 <span className="text-xs text-primary-cyan not-italic tracking-widest">LYA</span></p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-50">Based on active holdings</p>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">DELEGATED POWER</span>
                  <span className="text-[10px] font-mono text-white">0 LYA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">VOTING MULTIPLIER</span>
                  <span className="text-[10px] font-mono text-emerald-400">1.2x</span>
                </div>
              </div>
              <button 
                onClick={() => onNotify('DELEGATION PORTAL OPENING...')}
                className="w-full py-4 bg-white text-surface-dim font-black uppercase tracking-widest text-[10px] hover:bg-primary-cyan transition-all"
              >
                DELEGATE POWER
              </button>
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Activity className="text-emerald-400" size={18} />
              DECENTRALIZED NETWORK HUBS
            </h4>
            <div className="space-y-4">
              {networkHubs.slice(0, visibleNodes).map((node, i) => (
                <button 
                  key={i} 
                  onClick={() => onNotify(`VIEWING STATUS FOR ${node.label.toUpperCase()}...`)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">{node.label}</p>
                    <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-widest opacity-50">{node.type} | LOAD: {node.load}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${node.status === 'ONLINE' ? 'text-emerald-400' : 'text-accent-gold'}`}>
                    {node.status}
                  </span>
                </button>
              ))}

              {visibleNodes < networkHubs.length && (
                <button 
                  onClick={() => setVisibleNodes(prev => prev + 3)}
                  className="w-full py-2 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary-cyan hover:bg-white/5 transition-all"
                >
                  LOAD MORE HUBS
                </button>
              )}
            </div>
          </div>

          {/* Governance Resources */}
          <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">RESOURCES</h4>
            <div className="space-y-3">
              {[
                'Governance Whitepaper',
                'Voting Guidelines',
                'Proposal Template',
                'Treasury Reports'
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onNotify(`OPENING ${item.toUpperCase()}...`)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-primary-cyan/30 transition-all group"
                >
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-white transition-colors">{item}</span>
                  <ChevronRight size={14} className="text-on-surface-variant group-hover:text-primary-cyan transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
