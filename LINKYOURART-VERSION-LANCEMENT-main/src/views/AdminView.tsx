
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Shield,
  Users, 
  FileCheck, 
  CreditCard, 
  Activity, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Database,
  Lock,
  Globe,
  Settings,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Zap,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/StatCard';
import { useTranslation } from '../context/LanguageContext';
import { CONTRACTS, Contract, UserRole, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, limit, orderBy } from 'firebase/firestore';

export const AdminView: React.FC<{
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
}> = ({ user, onNotify, onViewChange }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'financials' | 'system'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Realistic stats
  const [stats] = useState({
    totalUsers: 1420,
    activePro: 156,
    totalVolume: 12450800,
    systemFee: 312500,
    pendingVerifications: 8,
    pendingProjects: 4
  });

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(100)); // Limit for performance

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'projects') {
      setLoadingProjects(true);
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, limit(100));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjectsList(list);
        setLoadingProjects(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'projects');
        setLoadingProjects(false);
      });

      return () => unsubscribe();
    }
  }, [activeTab]);

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      onNotify(t(`USER ROLE UPDATED TO ${role}`, `RÔLE UTILISATEUR MIS À JOUR EN ${role}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { status });
      onNotify(t(`PROJECT STATUS UPDATED TO ${status}`, `STATUT DU PROJET MIS À JOUR EN ${status}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const handleTogglePro = async (uid: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { isPro: !currentStatus });
      onNotify(t(`PRO STATUS ${!currentStatus ? 'ENABLED' : 'DISABLED'}`, `STATUT PRO ${!currentStatus ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`));
    } catch (err) {
      handleFirestoreError(err as any, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const displayName = u.displayName || '';
    const email = u.email || '';
    const matchSearch = (displayName.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = filterRole === 'ALL' || u.role === filterRole || (filterRole === 'PRO' && u.isPro);
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-12 pb-20">
      <PageHeader 
        titleWhite={t('Admin', 'ADMIN')}
        titleAccent={t('Control Hub', 'CONTROL HUB')}
        description={t('PLATFORM OVERSIGHT, USER MANAGEMENT, AND GLOBAL SETTLEMENT CONTROLS.', 'SURVEILLANCE DE LA PLATEFORME, GESTION DES UTILISATEURS ET CONTRÔLES DES RÈGLEMENTS GLOBAUX.')}
        accentColor="text-accent-gold"
      />

      <div className="px-4 md:px-12 mb-8">
        <div className="bg-surface-low/30 border border-white/10 p-4 md:p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-center gap-6 backdrop-blur-xl transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left w-full lg:w-auto overflow-hidden">
            <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center text-accent-gold">
              <Shield size={24} className="md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 w-full">
              <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tighter mb-1 truncate">PLATFORM_OPERATOR_CONNECTED</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 md:gap-3">
                <span className="text-[9px] md:text-[10px] bg-accent-gold text-surface-dim px-2 py-0.5 font-black uppercase tracking-widest leading-none">ROOT_ACCESS</span>
                <span className="text-[9px] md:text-[10px] text-primary-cyan font-black uppercase tracking-widest truncate leading-none">{t('IDENTITY:', 'IDENTITÉ :')} {user?.email?.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-4 md:gap-8 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
            <div className="text-center sm:text-right">
              <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">{t('SYSTEM UPTIME', 'TEMPS DE RÉPONSE')}</p>
              <p className="text-lg md:text-xl font-black text-emerald-400 font-mono">99.998%</p>
            </div>
            <div className="w-[1px] h-8 md:h-10 bg-white/10 mx-1 md:mx-2" />
            <div className="text-center sm:text-right">
              <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">{t('LATENCY', 'LATENCE')}</p>
              <p className="text-lg md:text-xl font-black text-primary-cyan font-mono">14ms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-12 space-y-12">
        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title={t('Global User Base', 'Base Utilisateurs')} 
            value={stats.totalUsers} 
            isCurrency={false}
            icon={<Users size={20} />} 
            trend="+12%" 
            color="gold" 
            subValue={t('Active Sessions: 84', 'Sessions Actives : 84')}
          />
          <StatCard 
            title={t('Total Platform Volume', 'Volume Plateforme')} 
            value={stats.totalVolume} 
            icon={<Activity size={20} />} 
            trend="+8.4%" 
            color="cyan" 
            subValue={t('Last 24h: $142,500', 'Dernières 24h : 142 500 $')}
          />
          <StatCard 
            title={t('Platform Revenue (Fees)', 'Revenus Plateforme')} 
            value={stats.systemFee} 
            icon={<CreditCard size={20} />} 
            trend="+15.2%" 
            color="emerald" 
            subValue={t('Settled Payouts: 92%', 'Paiements Réglés : 92%')}
          />
          <StatCard 
            title={t('System Health', 'Santé Système')} 
            value={99.9} 
            isCurrency={false}
            icon={<ShieldAlert size={20} />} 
            trend="Stable" 
            color="cyan" 
            subValue={t('All Registry Nodes: Synced', 'Nœuds de Registre : Synchronisés')}
          />
        </div>

        {/* Administration Tabs */}
        <div className="flex border-b border-white/5 gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'users', label: t('Identity Management', 'Gestion d\'Identité'), icon: Users },
            { id: 'projects', label: t('Ecosystem Assets', 'Actifs de l\'Écosystème'), icon: FileCheck },
            { id: 'financials', label: t('Settlement Center', 'Centre de Règlement'), icon: CreditCard },
            { id: 'system', label: t('Infrastructure', 'Infrastructure'), icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                activeTab === tab.id ? 'text-accent-gold' : 'text-on-surface-variant opacity-40 hover:opacity-100'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-low/40 p-4 border border-white/5 backdrop-blur-xl">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={16} />
                  <input 
                    type="text" 
                    placeholder={t('Search users by name or email...', 'Rechercher par nom ou email...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-xs font-mono uppercase tracking-widest outline-none focus:border-accent-gold/40 transition-all"
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-white/5 border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="ALL">{t('All Roles', 'Tous les Rôles')}</option>
                    <option value={UserRole.ADMIN}>ADMIN</option>
                    <option value={UserRole.PROFESSIONAL}>PROFESSIONAL</option>
                    <option value={UserRole.CREATOR}>CREATOR</option>
                    <option value="PRO">{t('PRO Users', 'Utilisateurs PRO')}</option>
                  </select>
                  <button className="px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                    <Download size={14} className="inline mr-2" />
                    {t('Export CSV', 'Exporter CSV')}
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">{t('Identity', 'Identité')}</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">{t('Status/Role', 'Statut/Rôle')}</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">{t('Activity', 'Activité')}</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">{t('Authorized Actions', 'Actions Autorisées')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <RefreshCw className="animate-spin text-accent-gold mx-auto mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('Accessing Identity Vault...', 'Accès au Coffre d\'Identité...')}</span>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-40">
                            {t('No users found.', 'Aucun utilisateur trouvé.')}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.uid} className="hover:bg-white/[0.01] transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                  {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-black">{user.displayName?.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-black uppercase tracking-tight text-white">{user.displayName}</div>
                                  <div className="text-[9px] font-mono text-on-surface-variant opacity-40 lowercase">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-sm border ${
                                    user.role === UserRole.ADMIN ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' : 
                                    user.role === UserRole.PROFESSIONAL ? 'bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20' : 
                                    'bg-white/5 text-on-surface-variant border-white/10'
                                  }`}>
                                    {user.role}
                                  </span>
                                  {user.isPro && (
                                    <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-sm">
                                      PRO
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8px] font-mono text-on-surface-variant opacity-40 uppercase tracking-widest italic flex items-center gap-1">
                                  <Clock size={8} /> {t('ID:', 'ID :')} {user.uid?.slice(0, 8)}...
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-black italic text-white/60 font-mono">
                                {user.usageStats?.scan || 0} Scans • {user.usageStats?.swipe || 0} Swipes
                              </div>
                              <div className="text-[8px] text-on-surface-variant uppercase tracking-widest opacity-40 mt-1">
                                {t('Last Active:', 'Dernière Activité :')} Just Now
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleTogglePro(user.uid!, !!user.isPro)}
                                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                                    user.isPro ? 'bg-red-400/10 text-red-400 border-red-400/20 hover:bg-red-400 hover:text-white' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400 hover:text-white'
                                  }`}
                                >
                                  {user.isPro ? t('Revoke Pro', 'Révoquer Pro') : t('Grant Pro', 'Accorder Pro')}
                                </button>
                                <div className="relative group/menu">
                                  <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all rounded-sm">
                                    <Settings size={12} className="inline mr-2" />
                                    {t('Role', 'Rôle')}
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 bg-surface-dim border border-white/10 shadow-2xl z-[100] hidden group-hover/menu:block min-w-[150px]">
                                    {[UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.CREATOR].map(role => (
                                      <button 
                                        key={role}
                                        onClick={() => handleUpdateRole(user.uid!, role)}
                                        className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors border-b last:border-0 border-white/5"
                                      >
                                        SET AS {role}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    {t(`Displaying ${filteredUsers.length} identity records`, `Affichage de ${filteredUsers.length} enregistrements d'identité`)}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 border border-white/5 hover:bg-white/5 opacity-50"><XCircle size={14} /></button>
                    <button className="px-4 py-1 border border-white/10 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10">1</button>
                    <button className="px-4 py-1 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 opacity-30">2</button>
                    <button className="p-2 border border-white/5 hover:bg-white/5 hover:text-accent-gold transition-colors"><ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div 
              key="projects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {loadingProjects ? (
                <div className="col-span-full py-20 text-center">
                  <RefreshCw className="animate-spin text-accent-gold mx-auto mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('Accessing Creative Vault...', 'Accès au Coffre Créatif...')}</span>
                </div>
              ) : projectsList.length === 0 ? (
                <div className="col-span-full py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-40">
                  {t('No projects found in registry.', 'Aucun projet trouvé dans le registre.')}
                </div>
              ) : projectsList.map((project, i) => (
                <div key={project.id} className="bg-surface-low/30 border border-white/10 rounded-sm p-6 group hover:border-accent-gold/40 transition-all relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-accent-gold/20 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center p-1 overflow-hidden">
                        {project.image ? (
                          <img src={project.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                        ) : (
                          <ShieldAlert className="text-on-surface-variant opacity-20" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-tighter text-white group-hover:text-accent-gold transition-colors">{project.name}</div>
                        <div className="text-[9px] font-mono text-on-surface-variant opacity-40 uppercase tracking-widest">{t('Issuer:', 'Émetteur :')} {project.issuerId || project.issuerUid?.slice(0, 8)}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-[8px] font-black rounded-sm border ${
                      project.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                      project.status === 'REJECTED' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                      'bg-accent-gold/10 text-accent-gold border-accent-gold/20'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 border-y border-white/5 py-4">
                    <div>
                      <div className="text-[8px] text-on-surface-variant uppercase tracking-widest font-black opacity-30 mb-1">{t('CAPITALIZATION', 'CAPITALISATION')}</div>
                      <div className="text-sm font-black italic text-primary-cyan">${(project.totalUnits * project.unitPrice)?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-on-surface-variant uppercase tracking-widest font-black opacity-30 mb-1">{t('UNITS', 'UNITÉS')}</div>
                      <div className="text-sm font-black italic text-accent-gold">{project.totalUnits?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    {project.status === 'PENDING' ? (
                      <>
                        <button 
                          onClick={() => handleUpdateProjectStatus(project.id, 'APPROVED')}
                          className="flex-1 py-2 bg-emerald-400/10 border border-emerald-400/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-400 hover:text-surface-dim transition-all"
                        >
                          <CheckCircle2 size={12} className="inline mr-2" />
                          {t('Approve', 'Approuver')}
                        </button>
                        <button 
                          onClick={() => handleUpdateProjectStatus(project.id, 'REJECTED')}
                          className="flex-1 py-2 bg-red-400/10 border border-red-400/20 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400 hover:text-white transition-all"
                        >
                          <XCircle size={12} className="inline mr-2" />
                          {t('Reject', 'Rejeter')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                          <Eye size={12} className="inline mr-2" />
                          {t('Audit Log', 'Log d\'Audit')}
                        </button>
                        <button 
                          onClick={() => handleUpdateProjectStatus(project.id, 'PENDING')}
                          className="flex-1 py-2 bg-accent-gold/10 border border-accent-gold/20 text-[9px] font-black uppercase tracking-widest text-accent-gold hover:bg-accent-gold hover:text-surface-dim transition-all"
                        >
                          {t('Reset Status', 'Réinit. Statut')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'financials' && (
            <motion.div 
              key="financials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Payouts */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                  <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                      <Clock size={16} className="text-accent-gold" />
                      {t('Pending Settlements', 'Règlements en Attente')}
                    </h2>
                    <span className="text-[9px] bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full font-black animate-pulse">12 REQUESTS</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-dim/30 border border-white/5 rounded-sm hover:border-accent-gold/30 transition-all gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-accent-gold">
                            <ArrowUpRight size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-tight text-white italic">SETTLEMENT_USER_0x{Math.random().toString(16).slice(2, 6).toUpperCase()}</div>
                            <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-bold opacity-40 mt-1">REQUESTED 12H AGO • WIRE TRANSFER</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-mono font-black text-on-surface">$12,450.00</div>
                            <div className="text-[10px] text-accent-gold font-bold uppercase tracking-widest opacity-60">FEE: $249.00</div>
                          </div>
                          <button className="px-4 py-2 bg-accent-gold text-surface-dim text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            {t('PAYOUT', 'PAYER')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Revenue Flow */}
                <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col">
                  <div className="bg-white/[0.02] px-8 py-6 border-b border-white/5">
                    <h2 className="text-xs font-black font-headline uppercase tracking-[0.4em] flex items-center gap-4">
                      <TrendingUp size={16} className="text-emerald-400" />
                      {t('Fee Accumulation Hub', 'Hub d\'Accumulation des Frais')}
                    </h2>
                  </div>
                  <div className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400/20 blur-[60px] animate-pulse rounded-full" />
                      <div className="relative w-48 h-48 border-[6px] border-emerald-400/20 rounded-full flex flex-col items-center justify-center p-8">
                        <div className="text-4xl font-black font-mono text-emerald-400 tracking-tighter">$312K</div>
                        <div className="text-[9px] text-on-surface-variant uppercase tracking-[0.4em] font-black opacity-40 mt-2">SYS_WALLET</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-4 max-w-sm">
                      <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                        <div className="text-[8px] text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">TRADING FEES</div>
                        <div className="text-md font-black text-white">$248,500</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                        <div className="text-[8px] text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">MINTING REVENUE</div>
                        <div className="text-md font-black text-white">$64,000</div>
                      </div>
                    </div>
                    <button className="w-full max-w-xs py-4 bg-emerald-400 text-surface-dim text-xs font-black uppercase italic tracking-[0.3em] shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                      {t('SWEEP TO TREASURY', 'BALAYAGE VERS LA TRÉSORERIE')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { label: 'Neural Routing', status: 'Optimal', icon: <Database />, color: 'bg-emerald-400' },
                { label: 'Identity Protection', status: 'Active', icon: <Lock />, color: 'bg-emerald-400' },
                { label: 'Registry Synchronization', status: 'Synced', icon: <Globe />, color: 'bg-emerald-400' },
                { label: 'Market API', status: 'Operational', icon: <Activity />, color: 'bg-emerald-400' },
                { label: 'Escrow Engine', status: 'Secured', icon: <CreditCard />, color: 'bg-emerald-400' },
                { label: 'Score LYA Algorithm', status: 'Running', icon: <Zap />, color: 'bg-emerald-400' },
                { label: 'Blockchain Indexer', status: 'Processing', icon: <RefreshCw className="animate-spin-slow" />, color: 'bg-primary-cyan' },
                { label: 'System Purity', status: '100%', icon: <ShieldAlert />, color: 'bg-accent-gold' },
              ].map((service, i) => (
                <div key={i} className="p-6 bg-surface-low/30 border border-white/10 rounded-sm flex items-center gap-5 shadow-lg group hover:border-primary-cyan/40 transition-all">
                  <div className={`w-12 h-12 flex items-center justify-center border border-white/10 rounded-sm text-white/40 group-hover:text-primary-cyan group-hover:scale-110 transition-all`}>
                    {service.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity mb-1">{service.label}</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${service.color} animate-pulse`} />
                      <span className="text-[11px] font-black uppercase tracking-tighter text-white">{service.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="lg:col-span-4 p-8 bg-accent-gold/5 border border-accent-gold/20 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-accent-gold/20 flex items-center justify-center text-accent-gold border border-accent-gold/40 rounded-sm">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-accent-gold italic">{t('Emergency Maintenance Protocol', 'Protocole de Maintenance d\'Urgence')}</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-60 mt-1 max-w-xl">
                      {t('Initiating this command will put all marketplace operations in suspension mode. Use only for critical security updates or system migrations.', 'L\'initialisation de cette commande mettra toutes les opérations du marché en mode suspension. Utilisez uniquement pour les mises à jour de sécurité critiques ou les migrations de système.')}
                    </p>
                  </div>
                </div>
                <button className="px-10 py-5 bg-accent-gold text-surface-dim text-xs font-black uppercase italic tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                  {t('PAUSE PROTOCOL', 'PAUSE PROTOCOLE')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
