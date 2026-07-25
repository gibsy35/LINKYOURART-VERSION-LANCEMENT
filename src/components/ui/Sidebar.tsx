
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Sparkles, Star, TrendingUp,
  Home, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Shield,
  ShieldCheck, 
  Briefcase, 
  BookOpen, 
  Link2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Coffee,
  Globe,
  Gavel,
  Database,
  Search,
  CheckCircle,
  Menu,
  X,
  CreditCard,
  Target,
  Fingerprint,
  Calculator,
  MessageSquare,
  Users,
  FileText,
  Award
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { UserProfile, UserRole } from '../../types';
import { Logo } from './Logo';
import { KidiWorldModal } from './KidiWorldModal';

export type View = 
  | 'LANDING'
  | 'HOME' 
  | 'DASHBOARD' 
  | 'VALIDATION' 
  | 'REGISTRY' 
  | 'LINK_ART' 
  | 'LOUNGE' 
  | 'WALLET'
  | 'SIGNUP' 
  | 'LOGIN' 
  | 'PROFILE' 
  | 'PRICING' 
  | 'SWIPE' 
  | 'MECENAT'
  | 'BROCHURE'
  | 'WATCHLIST' 
  | 'SETTINGS' 
  | 'COMPARE' 
  | 'SOCIAL_FEED' 
  | 'PAYMENT' 
  | 'CONTRACT_DETAIL' 
  | 'TERMS' 
  | 'PRIVACY' 
  | 'LEGAL_REGISTRY' 
  | 'GOVERNANCE' 
  | 'API' 
  | 'ACADEMY' 
  | 'APPLY_VERIFICATION' 
  | 'ABOUT' 
  | 'TAX_OPTIMIZER' 
  | 'ADMIN_PANEL'
  | 'ISSUER_PROFILE'
  | 'OUR_MODEL'
  | 'FAQ'
  | 'LEGAL_MENTIONS'
  | 'CREATOR_DASHBOARD'
  | 'PATRON_DASHBOARD'
  | 'PROFESSIONAL_DASHBOARD'
  | 'PROJECT_PUBLIC'
  | 'CREATOR_PROFILE';

interface SidebarProps {
  user: UserProfile | null;
  watchlist: string[];
  comparisonList: string[];
  onNotify: (msg: string) => void;
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  watchlist,
  comparisonList,
  onNotify,
  currentView,
  onViewChange,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const { t } = useTranslation();
  const [showKidiModal, setShowKidiModal] = React.useState(false);

  const menuItems = [
    { id: 'HOME', icon: Home, label: t('TERMINAL', 'TERMINAL'), category: t('SYSTEM', 'SYSTÈME') },
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t('DASHBOARD', 'TABLEAU DE BORD'), category: t('INDEX', 'INDEX') },
    ...(user?.role === 'CREATOR' ? [{ id: 'CREATOR_DASHBOARD' as const, icon: Sparkles, label: t('MY CREATIONS', 'MES CRÉATIONS'), category: t('CREATOR', 'CRÉATEUR') }] : []),
    ...(user?.role === 'PATRON' ? [{ id: 'PATRON_DASHBOARD' as const, icon: TrendingUp, label: t('MY PATRONAGE', 'MES SOUTIENS'), category: t('PATRON', 'MÉCÈNE') }] : []),
    ...(user?.role === 'PROFESSIONAL' || user?.isPro ? [{ id: 'PROFESSIONAL_DASHBOARD' as const, icon: Briefcase, label: t('PRO SPACE', 'ESPACE PRO'), category: t('PROFESSIONAL', 'PROFESSIONNEL') }] : []),
    { id: 'SWIPE', icon: Target, label: t('DISCOVER PROJECTS', 'DÉCOUVRIR DES PROJETS'), category: t('DEVELOPMENT', 'DÉVELOPPEMENT') },
    { id: 'REGISTRY', icon: BookOpen, label: t('LYA REGISTRY', 'REGISTRE LYA'), category: t('DEVELOPMENT', 'DÉVELOPPEMENT') },
    { id: 'MECENAT', icon: Star, label: t('PATRONAGE HUB', 'ESPACE MÉCÉNAT'), category: t('DEVELOPMENT', 'DÉVELOPPEMENT') },
    { id: 'COMPARE', icon: Calculator, label: t('COMPARATOR', 'COMPARATEUR'), category: t('INDEX', 'INDEX') },
    { id: 'WATCHLIST', icon: CheckCircle, label: t('WATCHLIST', 'MA VEILLE'), category: t('INDEX', 'INDEX'), count: watchlist.length },
    { id: 'VALIDATION', icon: ShieldCheck, label: t('Administrative Services', 'Services Administratifs'), category: t('LYA SYSTEM', 'LYA SYSTEME') },
    { id: 'WALLET', icon: CreditCard, label: t('MY WALLET', 'MON PORTEFEUILLE'), category: t('VAULT', 'COFFRE') },
    { id: 'LINK_ART', icon: Link2, label: t('THE LYA SYSTEM', 'LE LYA SYSTEME'), category: t('SYSTEM', 'SYSTÈME') },
    { id: 'ABOUT', icon: Globe, label: t('DISCOVER LYA', 'DÉCOUVRIR LYA'), category: t('SYSTEM', 'SYSTÈME') },
    { id: 'SOCIAL_FEED', icon: Users, label: t('COMMUNITY', 'COMMUNAUTÉ'), category: t('COMMUNITY', 'COMMUNAUTÉ') },
    { id: 'LOUNGE', icon: Coffee, label: t('THE LOUNGE', 'LE SALON'), category: t('COMMUNITY', 'COMMUNAUTÉ') },
    { id: 'ACADEMY', icon: Award, label: t('ACADEMY', 'ACADÉMIE'), category: t('RESOURCES', 'RESSOURCES') },
    { id: 'OUR_MODEL', icon: Fingerprint, label: t('OUR MODEL', 'NOTRE MODÈLE'), category: t('SYSTEM', 'SYSTÈME') },
    { id: 'FAQ', icon: MessageSquare, label: t('FAQ', 'FAQ'), category: t('RESOURCES', 'RESSOURCES') },
    { id: 'LEGAL_MENTIONS', icon: FileText, label: t('LEGAL MENTIONS', 'MENTIONS LÉGALES'), category: t('RESOURCES', 'RESSOURCES') },
  ];

  if (user?.role === UserRole.ADMIN) {
    menuItems.push({ id: 'ADMIN_PANEL', icon: Shield, label: t('ADMIN HUB', 'HUB ADMIN'), category: t('SYSTEM', 'SYSTÈME') });
  }

  const secondaryItems = [
    { id: 'SETTINGS', icon: Settings, label: t('SETTINGS', 'RÉGLAGES') },
    { id: 'PRICING', icon: CreditCard, label: t('PRICING', 'TARIFICATION') },
    { id: 'API', icon: Database, label: t('API', 'API') },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const SidebarContent = (
    <div className="h-full flex flex-col bg-[#0D1117] border-r border-white/10 font-mono relative overflow-hidden">
      {/* Background depth effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary-cyan/10 via-transparent to-primary-cyan/10" />
      </div>

      {/* Sidebar Header with Logo */}
      <div className={`relative z-10 transition-all duration-300 border-b border-white/5 flex items-center bg-[#0D1117]/50 backdrop-blur-md ${isCollapsed ? 'p-6 justify-center' : 'p-8 pb-10 pt-10'}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 w-full group cursor-pointer"
            onClick={() => onViewChange('HOME')}
          >
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-primary-cyan/30 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Logo size={60} color="multi" showBeta className="relative z-10" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white font-black tracking-tighter text-2xl leading-[0.7] truncate uppercase">LINKYOURART</span>
              <span className="text-[10px] text-primary-cyan font-black tracking-[0.2em] uppercase mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                {t('YOUR SCORE. YOUR STANDARD.', 'VOTRE SCORE. VOTRE STANDARD.')}
              </span>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="group cursor-pointer relative" onClick={() => onViewChange('HOME')}>
            <div className="absolute inset-0 bg-primary-cyan/30 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Logo size={44} color="multi" showBeta className="relative z-10" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 relative z-10">
        {categories.map(category => (
          <div key={category} className="mb-10">
            {!isCollapsed && (
              <div className="px-8 mb-4 text-xs text-primary-cyan/30 font-black tracking-[0.5em] uppercase flex items-center gap-4">
                <div className="w-6 h-[1px] bg-primary-cyan/20" />
                {category}
              </div>
            )}
            <div className="space-y-1">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as View);
                      if (isOpen) onClose();
                    }}
                    className={`w-full flex items-center gap-4 px-8 py-3 transition-all duration-300 group relative overflow-hidden ${
                      currentView === item.id 
                        ? 'text-primary-cyan bg-primary-cyan/10' 
                        : 'text-on-surface-variant/50 hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'px-0 justify-center' : ''}`}
                    title={item.label}
                  >
                    {currentView === item.id && (
                      <div className="absolute inset-0 bg-primary-cyan/5 rounded-2xl" />
                    )}
                    <item.icon size={24} className={`transition-all duration-300 ${currentView === item.id ? 'text-primary-cyan scale-110 drop-shadow-[0_0_10px_rgba(0,224,255,0.6)]' : 'text-on-surface-variant/40 group-hover:text-primary-cyan group-hover:scale-110'}`} />
                    {!isCollapsed && (
                      <span className={`text-[12px] font-bold uppercase tracking-widest flex-1 text-left transition-all duration-300 ${currentView === item.id ? 'text-white translate-x-1' : 'text-on-surface-variant/60 group-hover:text-white group-hover:translate-x-1'}`}>
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] bg-primary-cyan text-surface-dim px-3 py-0.5 rounded-full font-black shadow-[0_0_10px_rgba(0,224,255,0.5)]">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Area */}
      <div className="p-6 border-t border-white/5 bg-[#0D1117] space-y-2 relative z-10">
        {secondaryItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id as View);
              if (isOpen) onClose();
            }}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'text-primary-cyan bg-primary-cyan/5' 
                : 'text-on-surface-variant/50 hover:text-white hover:bg-white/5'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={item.label}
          >
            <item.icon size={24} className="group-hover:text-primary-cyan transition-colors" />
            {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>}
          </button>
        ))}
        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex w-full items-center gap-4 px-3 py-3 text-on-surface-variant/30 hover:text-white transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={24} /> : (
            <>
              <ChevronLeft size={24} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('COLLAPSE', 'RÉDUIRE')}</span>
            </>
          )}
        </button>

        {/* KIDI.WORLD partnership */}
        {!isCollapsed && (
          <button
            onClick={() => setShowKidiModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 border border-accent-gold/20 bg-accent-gold/5 hover:bg-accent-gold/10 hover:border-accent-gold/40 transition-all group text-left"
          >
            <div className="w-5 h-5 border border-accent-gold/40 flex items-center justify-center shrink-0">
              <span className="text-accent-gold text-[10px] font-black">K</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-accent-gold uppercase tracking-widest leading-none">KIDI.WORLD</p>
              <p className="text-[7px] text-white/25 uppercase tracking-widest mt-0.5 truncate">{t('Creative ecosystem', 'Écosystème créatif')}</p>
            </div>
            <Sparkles size={10} className="text-accent-gold/40 group-hover:text-accent-gold shrink-0" />
          </button>
        )}

        <KidiWorldModal isOpen={showKidiModal} onClose={() => setShowKidiModal(false)} />
      </div>

      {/* User Status Area */}
      {user && !isCollapsed && (
        <div className="p-8 bg-[#0D1117] border-t border-white/5 relative z-10 group/user cursor-pointer"
          onClick={() => onViewChange((user?.role === 'PROFESSIONAL' ? 'PROFESSIONAL_DASHBOARD' : user?.role === 'CREATOR' ? 'CREATOR_DASHBOARD' : user?.role === 'PATRON' ? 'PATRON_DASHBOARD' : 'PROFILE'))}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-cyan to-indigo-500 rounded-full blur-md opacity-30 group-hover/user:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(0,224,255,0.3)]" />
              <div className="w-12 h-12 rounded-full border border-white/20 p-0.5 relative z-10 overflow-hidden bg-surface-dim">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover group-hover/user:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary-cyan to-indigo-500 flex items-center justify-center text-sm font-black text-white">
                      {user.displayName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white truncate uppercase tracking-tight leading-tight">{user.displayName}</div>
              <div className="text-xs text-primary-cyan font-black tracking-[0.3em] truncate mt-1 opacity-70 group-hover/user:opacity-100 transition-opacity uppercase">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] lg:hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
          >
            {/* Background with blur and noise for high-end look */}
            <div className="absolute inset-0 bg-surface-dim/95 backdrop-blur-xl" onClick={onClose} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            {/* Menu Content - Side Drawer with glassmorphism */}
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative h-full w-[280px] bg-[#0D1117] border-r border-white/10 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 pb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo size={32} color="multi" showBeta />
                  <div className="flex flex-col">
                    <span className="text-white font-black tracking-tighter text-sm leading-tight uppercase">{t('LINKYOURART', 'LINKYOURART')}</span>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-white transition-all ring-1 ring-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation List */}
              <div className="flex-1 py-4 px-4">
                {categories.map(category => (
                  <div key={category} className="mb-8">
                    <div className="px-5 mb-3 text-xs text-on-surface-variant/40 font-black tracking-[0.4em] uppercase">
                      {category}
                    </div>
                    <div className="space-y-1.5">
                      {menuItems
                        .filter(item => item.category === category)
                        .map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              onViewChange(item.id as View);
                              onClose();
                            }}
                            className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all relative overflow-hidden group ${
                              currentView === item.id 
                                ? 'text-primary-cyan bg-primary-cyan/10 border border-primary-cyan/20 shadow-[0_0_20px_rgba(0,224,255,0.1)]' 
                                : 'text-on-surface-variant/70 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            {currentView === item.id && (
                              <div className="absolute inset-0 bg-primary-cyan/5 rounded-xl" />
                            )}
                            <item.icon size={24} className={currentView === item.id ? 'text-primary-cyan scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all'} />
                            <span className="text-xs font-black uppercase tracking-widest flex-1 text-left">
                              {item.label}
                            </span>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="text-xs bg-primary-cyan/20 text-primary-cyan px-3 py-0.5 rounded-full font-black">
                                {item.count}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Actions */}
              <div className="p-6 border-t border-white/5 space-y-2 bg-white/[0.01]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {secondaryItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id as View);
                        onClose();
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${
                        currentView === item.id 
                          ? 'text-primary-cyan bg-primary-cyan/5 border border-primary-cyan/10' 
                          : 'text-on-surface-variant/60 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={24} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Profile on Mobile */}
              {user ? (
                <div 
                  onClick={() => { onViewChange((user?.role === 'PROFESSIONAL' ? 'PROFESSIONAL_DASHBOARD' : user?.role === 'CREATOR' ? 'CREATOR_DASHBOARD' : user?.role === 'PATRON' ? 'PATRON_DASHBOARD' : 'PROFILE')); onClose(); }}
                  className="p-8 bg-gradient-to-tr from-white/[0.03] to-white/[0.01] border-t border-white/10 flex items-center gap-5 shadow-2xl"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-primary-cyan/40 p-0.5 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,224,255,0.2)]">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-primary-cyan to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                          {user.displayName?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">{user.displayName}</div>
                    <div className="text-[10px] text-primary-cyan font-bold uppercase tracking-[0.2em] truncate mt-1">{user.role}</div>
                  </div>
                  <ChevronRight size={24} className="text-on-surface-variant/40" />
                </div>
              ) : (
                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                  <button 
                    onClick={() => { onViewChange('LOGIN'); onClose(); }}
                    className="w-full py-5 bg-primary-cyan text-surface-dim text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_30px_rgba(0,224,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('SIGN IN', 'CONNEXION')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-[110] transition-all duration-300 hidden lg:block ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {SidebarContent}
      </aside>
    </>
  );
};
