
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  ShieldCheck, 
  Search,
  Check,
  X as XIcon,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  ChevronDown,
  Fingerprint,
  Globe2,
  Cpu,
  Award,
  Zap,
  Download,
  Radar,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CONTRACTS, Contract, UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { ComplianceCertificateModal } from '../components/Modals';
import { CompareView } from './CompareView';
import { Loader2 } from 'lucide-react';

export const RegistryView: React.FC<{ 
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  allContracts: Contract[];
  onSelectContract?: (contract: Contract) => void;
}> = ({ user, onNotify, allContracts, onSelectContract }) => {
  const { t } = useTranslation();

  // Access Control: Only Admin or Pro users can access the Legal Registry
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
        <h2 className="text-3xl md:text-5xl font-black font-headline uppercase text-on-surface mb-6 tracking-tighter">
          {t('Registry Restricted', 'Registre Restreint')}
        </h2>
        <p className="text-on-surface-variant max-w-lg mb-10 text-sm md:text-base leading-relaxed opacity-70">
          {t('The Legal Registry contains sensitive contract data and institutional records. Access is restricted to verified professional accounts.', 'Le registre légal contient des données contractuelles sensibles et des dossiers institutionnels. L\'accès est réservé aux comptes professionnels vérifiés.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => onNotify(t('Redirecting to membership plans...', 'Redirection vers les plans d\'adhésion...'))}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,224,255,0.3)]"
          >
            {t('Upgrade to Pro', 'Passer à Pro')}
          </button>
        </div>
      </div>
    );
  }

  const [verifyId, setVerifyId] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ name: string, status: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedContractIds, setExpandedContractIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [filterAgreementType, setFilterAgreementType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterAssetType, setFilterAssetType] = useState<string>('ALL');
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NONE');
  const [showCertificate, setShowCertificate] = useState<string | null>(null);
  const [registrySearchTerm, setRegistrySearchTerm] = useState('');

  const handleSort = (type: 'NAME' | 'DATE' | 'SCORE') => {
    if (type === 'NAME') {
      setSortBy(prev => prev === 'NAME_ASC' ? 'NAME_DESC' : 'NAME_ASC');
    } else if (type === 'DATE') {
      setSortBy(prev => prev === 'DATE_DESC' ? 'DATE_ASC' : 'DATE_DESC');
    } else if (type === 'SCORE') {
      setSortBy(prev => prev === 'SCORE_DESC' ? 'SCORE_ASC' : 'SCORE_DESC');
    }
  };

  const handleVerify = () => {
    if (!verifyId) return;
    setIsVerifying(true);
    setIsValid(null);
    setVerificationResult(null);
    
    onNotify(`INITIATING INSTITUTIONAL AUDIT FOR ${verifyId}...`);

    // Simulate network latency for institutional verification
    setTimeout(() => {
      const foundContract = allContracts.find(c => 
        c.registryIndex === verifyId || c.registryAddress === verifyId
      );

      setIsVerifying(false);
      if (foundContract) {
        setIsValid(true);
        setVerificationResult({
          name: foundContract.name,
          status: foundContract.status
        });
        onNotify(`REGISTRY ID ${verifyId} VERIFIED: ${foundContract.name}`);
      } else {
        setIsValid(false);
        onNotify('VERIFICATION FAILED: ID NOT FOUND IN GLOBAL REGISTRY.');
      }
    }, 1500);
  };

  const allRegistryItems = allContracts.map((contract, i) => ({
    id: `REGISTRY_${contract.id}`,
    contractName: contract.name,
    registryId: contract.registryAddress,
    creationDate: contract.creationDate,
    version: 'v4.2.1',
    status: contract.status,
    lastAudit: '2026-03-15',
    securityScore: 95 + (i % 5),
    auditScore: 88 + (i % 10),
    totalScore: contract.totalScore,
    agreementType: contract.contractType,
    category: contract.category,
    jurisdiction: contract.jurisdiction,
    compliance: {
      status: i % 3 === 0 ? 'COMPLIANT' : i % 3 === 1 ? 'PENDING' : 'NON-COMPLIANT',
      standards: ['KYC/AML', 'SEC Rule 506(c)', 'GDPR', 'MiCA'],
      lastCheck: '2026-03-20'
    },
    auditHistory: [
      { date: '2026-03-15', type: 'Annual Review', outcome: 'PASSED' },
      { date: '2025-09-10', type: 'Security Audit', outcome: 'PASSED' },
      { date: '2025-03-20', type: 'Initial Audit', outcome: 'PASSED' }
    ]
  }));

  const filteredItems = allRegistryItems.filter(item => {
    const matchesAgreement = filterAgreementType === 'ALL' || item.agreementType === filterAgreementType;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesAssetType = filterAssetType === 'ALL' || item.category === filterAssetType;
    const matchesJurisdiction = filterJurisdiction === 'ALL' || item.jurisdiction === filterJurisdiction;
    const matchesSearch = item.contractName.toLowerCase().includes(registrySearchTerm.toLowerCase()) || 
                          item.registryId.toLowerCase().includes(registrySearchTerm.toLowerCase());
    return matchesAgreement && matchesStatus && matchesAssetType && matchesJurisdiction && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'SCORE_DESC') return b.totalScore - a.totalScore;
    if (sortBy === 'SCORE_ASC') return a.totalScore - b.totalScore;
    if (sortBy === 'NAME_ASC') return a.contractName.localeCompare(b.contractName);
    if (sortBy === 'NAME_DESC') return b.contractName.localeCompare(a.contractName);
    if (sortBy === 'DATE_DESC') return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
    if (sortBy === 'DATE_ASC') return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
    return 0;
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        // Enforce 4-item limit for non-pro users (though non-pros are nominally blocked from this view)
        const isPro = user?.role === UserRole.ADMIN || user?.role === UserRole.PROFESSIONAL || user?.isPro;
        if (prev.length >= 4 && !isPro) {
          onNotify(t('COMPARISON LIMIT REACHED (4/4). UPGRADE TO PRO FOR UNLIMITED COMPARISONS.', 'LIMITE DE COMPARAISON ATTEINTE (4/4). PASSEZ AU PRO POUR DES COMPARAISONS ILLIMITÉES.'));
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectedItems = allRegistryItems.filter(item => selectedIds.includes(item.id));

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleContractExpansion = (id: string) => {
    setExpandedContractIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12 pb-20">
      <PageHeader 
        titleWhite={t('Legal', 'REGISTRY')}
        titleAccent={t('Settlement Center', 'SETTLEMENT')}
        description={t('THE DEFINITIVE SOURCE OF TRUTH FOR CREATIVE ECONOMY CONTRACTS. VERIFIED, IMMUTABLE, AND GLOBALLY ACCESSIBLE FOR AUTHORIZED CENTERS.', 'LA SOURCE DE VÉRITÉ DÉFINITIVE POUR LES CONTRATS DE L\'ÉCONOMIE CRÉATIVE. VÉRIFIÉE, IMMUABLE ET ACCESSIBLE MONDIALEMENT POUR LES CENTRES AUTORISÉS.')}
        accentColor="text-accent-gold"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20">
          <div className="flex gap-4">
            <div className="bg-surface-low/20 backdrop-blur-xl border border-white/5 p-4 text-center min-w-[120px] rounded-xl shadow-2xl">
              <div className="text-[10px] text-primary-cyan uppercase tracking-widest mb-1 font-black opacity-80">{t('Total Contracts', 'Total Contrats')}</div>
              <div className="text-2xl font-black text-white">1,248</div>
            </div>
            <div className="bg-surface-low/20 backdrop-blur-xl border border-white/5 p-4 text-center min-w-[120px] rounded-xl shadow-2xl">
              <div className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1 font-black opacity-80">{t('Verified DNA', 'DNA Vérifié')}</div>
              <div className="text-2xl font-black text-white">100%</div>
            </div>
          </div>
      </div>

      <div className="px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-surface-low/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl shadow-2xl">
            <div className="flex items-center gap-2 relative z-10">
              <Globe2 size={12} className="text-primary-cyan" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Global Sync: 100%</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 relative z-10" />
            <div className="flex items-center gap-2 relative z-10">
              <Cpu size={12} className="text-accent-purple" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Processing: 12.4ms</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 relative z-10" />
            <div className="flex items-center gap-2 relative z-10">
              <Radar size={12} className="text-accent-gold animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Scanning Registries...</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          {selectedIds.length > 1 && (
            <button 
              onClick={() => setIsComparing(true)}
              className="bg-primary-cyan text-surface-dim px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border border-primary-cyan hover:bg-white hover:border-white transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              Compare {selectedIds.length} Contracts
            </button>
          )}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${isValid === true ? 'from-emerald-500 to-teal-500' : isValid === false ? 'from-red-500 to-orange-500' : 'from-primary-cyan to-accent-purple'} rounded-sm blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
            <div className="relative flex items-center bg-surface-low border border-white/10 rounded-sm overflow-hidden">
              <div className="pl-3 text-on-surface-variant">
                <Search size={14} />
              </div>
              <input 
                type="text" 
                placeholder="Verify Registry ID"
                value={verifyId}
                onChange={(e) => {
                  setVerifyId(e.target.value);
                  setIsValid(null);
                  setVerificationResult(null);
                }}
                className="bg-transparent border-none focus:ring-0 text-[11px] py-1.5 px-2 w-full md:w-48 font-mono placeholder:text-on-surface-variant/30"
              />
              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className={`bg-white/5 hover:bg-white/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border-l border-white/10 transition-all active:scale-95 ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? '...' : 'Verify'}
              </button>
              {isValid !== null && !isVerifying && (
                <div className={`pr-3 ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isValid ? <Check size={14} /> : <XIcon size={14} />}
                </div>
              )}
            </div>
          </div>
          
          {/* Verification Result Message */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: (isValid !== null || isVerifying) ? 1 : 0, y: (isValid !== null || isVerifying) ? 0 : -10 }}
            className="mt-1"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2 text-[9px] text-primary-cyan uppercase tracking-widest font-bold">
                <div className="w-1.5 h-1.5 bg-primary-cyan rounded-full animate-ping" />
                Audit in Progress...
              </div>
            ) : isValid === true ? (
              <div className="flex items-center gap-2 p-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                <Check size={10} className="text-emerald-400" />
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest">
                  <span className="text-on-surface font-bold">{verificationResult?.name}</span> | <span className="text-emerald-400 font-bold">{verificationResult?.status}</span>
                </div>
              </div>
            ) : isValid === false ? (
              <div className="flex items-center gap-2 p-1.5 bg-red-500/5 border border-red-500/20 rounded-sm text-[9px] text-red-400 uppercase tracking-widest font-black">
                <XIcon size={10} /> Invalid ID
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 md:px-12">
        <div className="lg:col-span-2 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 p-2 bg-surface-low border border-white/5 rounded-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Agreement Type</label>
              <select 
                value={filterAgreementType}
                onChange={(e) => setFilterAgreementType(e.target.value)}
                className="bg-surface-dim border border-white/10 text-xs uppercase tracking-widest px-3 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface appearance-none cursor-pointer hover:bg-white/5 min-w-[180px]"
              >
                <option value="ALL">All Agreement Types</option>
                <option value="Direct Rights">Direct Rights</option>
                <option value="Fractional Ownership">Fractional Ownership</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Registry Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-dim border border-white/10 text-xs uppercase tracking-widest px-3 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface appearance-none cursor-pointer hover:bg-white/5 min-w-[180px]"
              >
                <option value="ALL">All Status Levels</option>
                <option value="LIVE">Live Registry</option>
                <option value="SUSPENDED">Suspended Registry</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Asset Type</label>
              <select 
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="bg-surface-dim border border-white/10 text-xs uppercase tracking-widest px-3 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface appearance-none cursor-pointer hover:bg-white/5 min-w-[180px]"
              >
                <option value="ALL">All Asset Types</option>
                <option value="Film">Film</option>
                <option value="TV Series">TV Series</option>
                <option value="Music">Music</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Gaming">Gaming</option>
                <option value="Literature">Literature</option>
                <option value="Fashion">Fashion</option>
                <option value="Architecture">Architecture</option>
                <option value="Design">Design</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Jurisdiction</label>
              <select 
                value={filterJurisdiction}
                onChange={(e) => setFilterJurisdiction(e.target.value)}
                className="bg-surface-dim border border-white/10 text-xs uppercase tracking-widest px-3 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface appearance-none cursor-pointer hover:bg-white/5 min-w-[180px]"
              >
                <option value="ALL">All Jurisdictions</option>
                <option value="EU (MiCA)">EU (MiCA)</option>
                <option value="US (SEC)">US (SEC)</option>
                <option value="UK (FCA)">UK (FCA)</option>
                <option value="CH (FINMA)">CH (FINMA)</option>
                <option value="SG (MAS)">SG (MAS)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Search Registry</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={14} />
                <input 
                  value={registrySearchTerm}
                  onChange={(e) => setRegistrySearchTerm(e.target.value)}
                  className="w-full bg-surface-dim border border-white/10 text-xs uppercase tracking-widest pl-10 pr-4 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface rounded-sm" 
                  placeholder="CONTRACT NAME OR ID..." 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black ml-1">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-dim border border-white/10 text-xs uppercase tracking-widest px-3 py-2 focus:border-primary-cyan/50 outline-none transition-all text-on-surface appearance-none cursor-pointer hover:bg-white/5 min-w-[180px]"
              >
                <option value="NONE">Default Order</option>
                <option value="SCORE_DESC">Highest Score First</option>
                <option value="SCORE_ASC">Lowest Score First</option>
                <option value="NAME_ASC">Name: A-Z</option>
                <option value="NAME_DESC">Name: Z-A</option>
                <option value="DATE_DESC">Date: Newest</option>
                <option value="DATE_ASC">Date: Oldest</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <button 
                onClick={() => {
                  setFilterAgreementType('ALL');
                  setFilterStatus('ALL');
                  setFilterAssetType('ALL');
                  setFilterJurisdiction('ALL');
                  setSortBy('NONE');
                }}
                className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors font-bold px-2 py-2"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Table Header Bar for Sorting */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-dim/30 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant rounded-sm mb-1">
            <div 
              className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-primary-cyan transition-colors group"
              onClick={() => handleSort('NAME')}
            >
              Contract Name
              <span className={`transition-transform duration-300 ${sortBy.startsWith('NAME') ? 'text-primary-cyan opacity-100' : 'opacity-20 group-hover:opacity-50'} ${sortBy === 'NAME_ASC' ? 'rotate-180' : ''}`}>
                <ChevronDown size={12} />
              </span>
            </div>
            <div 
              className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-primary-cyan transition-colors group"
              onClick={() => handleSort('DATE')}
            >
              Creation Date
              <span className={`transition-transform duration-300 ${sortBy.startsWith('DATE') ? 'text-primary-cyan opacity-100' : 'opacity-20 group-hover:opacity-50'} ${sortBy === 'DATE_ASC' ? 'rotate-180' : ''}`}>
                <ChevronDown size={12} />
              </span>
            </div>
            <div 
              className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-primary-cyan transition-colors group"
              onClick={() => handleSort('SCORE')}
            >
              LYA Score
              <span className={`transition-transform duration-300 ${sortBy.startsWith('SCORE') ? 'text-primary-cyan opacity-100' : 'opacity-20 group-hover:opacity-50'} ${sortBy === 'SCORE_ASC' ? 'rotate-180' : ''}`}>
                <ChevronDown size={12} />
              </span>
            </div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {paginatedItems.length > 0 ? (
            paginatedItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-low border border-white/5 p-6 group hover:border-primary-cyan/40 transition-all relative overflow-hidden rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(0,224,255,0.15)] mb-4"
            >
              {/* Depth Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              {/* Animated Background Glow */}
              <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-primary-cyan/5 to-transparent group-hover:via-primary-cyan/10 transition-all duration-1000 animate-slow-pan pointer-events-none" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary-cyan/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-purple/10 rounded-full -ml-24 -mb-24 blur-3xl group-hover:bg-accent-purple/20 transition-all duration-700" />
              
              {/* Glassmorphism Highlight */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      className={`w-4 h-4 border flex items-center justify-center cursor-pointer transition-all ${
                        selectedIds.includes(item.id) ? 'bg-primary-cyan border-primary-cyan' : 'border-white/20 hover:border-primary-cyan/50'
                      }`}
                    >
                      {selectedIds.includes(item.id) && <Check size={10} className="text-surface-dim" />}
                    </div>
                    <div className="p-2 bg-surface-dim border border-white/5 text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,224,255,0.2)] transition-all">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold font-headline uppercase tracking-widest group-hover:text-primary-cyan transition-colors">
                          {item.contractName} Agreement
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{item.registryId}</span>
                            <FileText size={8} className="text-on-surface-variant/40" />
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Created: {item.creationDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                      item.status === 'LIVE' ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/5' : 'border-red-400/30 text-red-400 bg-red-400/5'
                    }`}>
                      {item.status === 'LIVE' ? <ShieldCheck size={8} /> : <AlertTriangle size={8} />}
                      {item.status}
                    </div>
                    <span className="text-[9px] text-on-surface-variant mt-1 uppercase tracking-widest">Version: {item.version}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Security Score</div>
                    <div className="text-lg font-black text-on-surface font-headline">{item.securityScore}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Agreement Type</div>
                    <div className="text-xs font-bold text-accent-gold">{item.agreementType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Score</div>
                    <div className="text-lg font-black text-primary-cyan font-headline">{item.totalScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Jurisdiction</div>
                    <div className="text-xs font-bold text-on-surface uppercase tracking-widest">{item.jurisdiction}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Compliance Check</div>
                    <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${
                      item.compliance.status === 'COMPLIANT' ? 'text-emerald-400' : 
                      item.compliance.status === 'PENDING' ? 'text-accent-gold' : 'text-red-400'
                    }`}>
                      {item.compliance.status === 'COMPLIANT' ? <CheckCircle2 size={10} /> : 
                       item.compliance.status === 'PENDING' ? <Clock size={10} /> : <AlertTriangle size={10} />}
                      {item.compliance.status}
                    </div>
                  </div>
                </div>

                {/* Collapsible Contract Details */}
                <div className="border-t border-white/5">
                  <button 
                    onClick={() => toggleContractExpansion(item.id)}
                    className="w-full py-3 flex items-center justify-between text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={12} />
                      Contract Details & Audit Data
                    </span>
                    <motion.div
                      animate={{ rotate: expandedContractIds.includes(item.id) ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedContractIds.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 pt-2">
                          <div className="p-3 bg-surface-dim border border-white/5 rounded-sm">
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Creation Date</div>
                            <div className="text-xs font-bold text-on-surface font-mono">{item.creationDate}</div>
                          </div>
                          <div className="p-3 bg-surface-dim border border-white/5 rounded-sm">
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Contract Version</div>
                            <div className="text-xs font-bold text-primary-cyan font-mono">{item.version}</div>
                          </div>
                          <div className="p-3 bg-surface-dim border border-white/5 rounded-sm">
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Last Audit Date</div>
                            <div className="text-xs font-bold text-on-surface font-mono">{item.lastAudit}</div>
                          </div>
                          <div className="p-3 bg-surface-dim border border-white/5 rounded-sm">
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Audit Score</div>
                            <div className={`text-sm md:text-base font-black font-headline ${item.auditScore >= 90 ? 'text-emerald-400' : 'text-accent-gold'}`}>
                              {item.auditScore}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="pb-6">
                          <div className="text-sm text-on-surface-variant uppercase tracking-widest mb-3">Audit History Summary</div>
                          <div className="space-y-2">
                            {item.auditHistory.map((audit, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-on-surface-variant">{audit.date}</span>
                                  <span className="text-xs font-bold uppercase tracking-widest">{audit.type}</span>
                                </div>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${
                                  audit.outcome === 'PASSED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                                }`}>
                                  {audit.outcome}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const contractId = item.id.replace('REGISTRY_', '');
                        const contract = allContracts.find(c => c.id === contractId);
                        if (contract) onSelectContract?.(contract);
                      }}
                      className="text-sm font-bold uppercase tracking-widest text-primary-cyan hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Zap size={12} /> Deep Dive
                    </button>
                    <button 
                      onClick={() => onNotify(`VIEWING LEGAL TERMS FOR ${item.contractName.toUpperCase()}...`)}
                      className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center gap-2"
                    >
                      <Scale size={12} /> Legal Terms
                    </button>
                    <button 
                      onClick={() => onNotify(`CONFIGURING PERMISSIONS FOR ${item.contractName.toUpperCase()}...`)}
                      className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-cyan transition-colors flex items-center gap-2"
                    >
                      <Lock size={12} /> Permissions
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowCertificate(item.id)}
                    className="px-4 py-2 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/30 hover:text-on-surface transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Award size={12} className="text-accent-gold" />
                    View Certificate
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 bg-surface-low/30 border border-white/5 rounded-[2rem]">
            <div className="flex justify-center mb-6">
              <Search size={48} className="text-on-surface-variant/20" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">No results found</h3>
            <p className="text-on-surface-variant uppercase tracking-widest text-[10px] opacity-60">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setFilterAgreementType('ALL');
                setFilterStatus('ALL');
                setFilterAssetType('ALL');
                setFilterJurisdiction('ALL');
                setRegistrySearchTerm('');
              }}
              className="mt-6 text-primary-cyan uppercase tracking-widest text-sm font-black hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Academy-Inspired Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-8 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono text-primary-cyan uppercase tracking-[0.4em] font-black italic">
                REGISTRY_INDEX_STREAM
              </div>
              <div className="h-[1px] w-8 bg-white/10 hidden md:block" />
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-[0.4em] opacity-40">
                PAGE_REF_00{currentPage} / 00{totalPages}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 border border-white/10 flex items-center justify-center transition-all ${
                  currentPage === 1 
                    ? 'opacity-20 cursor-not-allowed' 
                    : 'hover:border-primary-cyan hover:text-primary-cyan hover:bg-primary-cyan/5 text-on-surface'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-[9px] font-black transition-all border ${
                        currentPage === pageNum
                          ? 'bg-primary-cyan border-primary-cyan text-surface-dim shadow-[0_0_15px_rgba(0,224,255,0.4)]'
                          : 'border-white/5 text-on-surface-variant hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {pageNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 border border-white/10 flex items-center justify-center transition-all ${
                  currentPage === totalPages 
                    ? 'opacity-20 cursor-not-allowed' 
                    : 'hover:border-primary-cyan hover:text-primary-cyan hover:bg-primary-cyan/5 text-on-surface'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        </div>

        <div className="space-y-8">
          <div className="bg-surface-low border border-white/5 p-8">
            <h2 className="text-xl font-bold font-headline uppercase tracking-widest mb-8">Legal Overview</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-400/10 text-emerald-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-base md:text-lg font-bold uppercase tracking-widest mb-1">Institutional Verification</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    All core agreements are formally verified by legal professionals to ensure enforceable execution across jurisdictions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-400/10 text-emerald-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-base md:text-lg font-bold uppercase tracking-widest mb-1">Multi-Party Custody</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Institutional rights are secured in multi-signature digital vaults with hardware-enforced security.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent-gold/10 text-accent-gold">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="text-base md:text-lg font-bold uppercase tracking-widest mb-1">Standardized Framework</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Agreements use the LYA Legal Framework. Upgrades require a 48-hour review period and institutional consensus.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-low border border-white/5 p-8">
            <h2 className="text-xl font-bold font-headline uppercase tracking-widest mb-6">Registry Health</h2>
            <div className="space-y-4">
              <div className="p-4 bg-surface-dim border border-white/5 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest text-on-surface-variant">Registry Load</span>
                  <span className="text-xs font-mono text-primary-cyan">12%</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-primary-cyan" style={{ width: '12%' }} />
                </div>
              </div>
              <div className="p-4 bg-surface-dim border border-white/5 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest text-on-surface-variant">Audit Queue</span>
                  <span className="text-xs font-mono text-accent-gold">Low</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-accent-gold" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isComparing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComparing(false)}
              className="absolute inset-0 bg-surface-dim/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-surface-low border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-xl md:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase">Institutional <span className="text-primary-cyan">Comparison</span></h2>
                  <p className="text-xs md:text-base text-on-surface-variant mt-1 uppercase tracking-widest">Side-by-side registry analysis</p>
                </div>
                <button 
                  onClick={() => setIsComparing(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
                >
                  <XIcon size={24} />
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-6">
                <div className="min-w-[800px] grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-8">
                  {/* Labels Column */}
                  <div className="space-y-12 pt-24">
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Security Score</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Audit Score</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Agreement Type</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Compliance</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Last Audit</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Creation Date</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-12 flex items-center">Status</div>
                    <div className="text-sm uppercase tracking-[0.3em] text-on-surface-variant font-bold h-32 flex items-start pt-4">Audit History</div>
                  </div>

                  {/* Contract Columns */}
                  {selectedItems.map((item) => (
                    <div key={item.id} className="space-y-12">
                      <div className="h-24 flex flex-col justify-end">
                        <div className="text-sm text-primary-cyan uppercase tracking-widest mb-1 font-bold">{item.registryId}</div>
                        <div className="text-xl font-black font-headline text-on-surface uppercase leading-tight">{item.contractName}</div>
                      </div>
                      
                      <div className="h-12 flex items-center">
                        <div className="text-xl md:text-3xl font-black text-emerald-400 font-headline">{item.securityScore}%</div>
                      </div>
                      
                      <div className="h-12 flex items-center">
                        <div className="text-xl md:text-3xl font-black text-primary-cyan font-headline">{item.auditScore}%</div>
                      </div>
                      
                      <div className="h-12 flex items-center">
                        <div className="text-xs md:text-base font-bold text-accent-gold uppercase tracking-widest">{item.agreementType}</div>
                      </div>
                      
                      <div className="h-12 flex items-center">
                        <div className={`flex items-center gap-1.5 text-sm font-black uppercase tracking-widest ${
                          item.compliance.status === 'COMPLIANT' ? 'text-emerald-400' : 
                          item.compliance.status === 'PENDING' ? 'text-accent-gold' : 'text-red-400'
                        }`}>
                          {item.compliance.status === 'COMPLIANT' ? <CheckCircle2 size={12} /> : 
                           item.compliance.status === 'PENDING' ? <Clock size={12} /> : <AlertTriangle size={12} />}
                          {item.compliance.status}
                        </div>
                      </div>
                      
                      <div className="h-12 flex items-center">
                        <div className="text-xs md:text-base font-mono text-on-surface">{item.lastAudit}</div>
                      </div>

                      <div className="h-12 flex items-center">
                        <div className="text-xs md:text-base font-mono text-on-surface">{item.creationDate}</div>
                      </div>

                      <div className="h-12 flex items-center">
                        <div className={`px-2 py-1 text-sm font-bold uppercase tracking-widest border ${
                          item.status === 'LIVE' ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/5' : 'border-red-400/30 text-red-400 bg-red-400/5'
                        }`}>
                          {item.status}
                        </div>
                      </div>

                      <div className="h-32 pt-4 space-y-3">
                        {item.auditHistory.map((audit, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 border-l border-white/10 pl-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-mono text-on-surface">{audit.date}</span>
                              <span className="text-sm font-black text-emerald-400 uppercase tracking-tighter">{audit.outcome}</span>
                            </div>
                            <span className="text-sm text-on-surface-variant uppercase tracking-widest">{audit.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
                >
                  Clear Selection
                </button>
                <button 
                  onClick={() => {
                    onNotify('GENERATING COMPARISON REPORT...');
                    setIsComparing(false);
                  }}
                  className="bg-white/5 hover:bg-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:border-white/30 transition-all active:scale-95"
                >
                  Export Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compliance Certificate Modal */}
      <ComplianceCertificateModal 
        isOpen={!!showCertificate}
        onClose={() => setShowCertificate(null)}
        contractId={showCertificate}
      />
    </div>
  );
};
