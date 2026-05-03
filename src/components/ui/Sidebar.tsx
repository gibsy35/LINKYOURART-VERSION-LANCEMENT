
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  LayoutDashboard, 
  ArrowLeftRight, 
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
  Calculator,
  MessageSquare,
  Users
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { UserProfile, UserRole } from '../../types';
import { Logo } from './Logo';

export type View = 
  | 'HOME' 
  | 'DASHBOARD' 
  | 'EXCHANGE' 
  | 'VALIDATION' 
  | 'HOLDINGS' 
  | 'REGISTRY' 
  | 'LINK_ART' 
  | 'SETTLEMENT' 
  | 'LOUNGE' 
  | 'SIGNUP' 
  | 'LOGIN' 
  | 'PROFILE' 
  | 'PRICING' 
  | 'SWIPE' 
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
  | 'ISSUER_PROFILE';

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

  const menuItems = [
    { id: 'HOME', icon: Home, label: t('TERMINAL', 'TERMINAL'), category: 'SYSTEM' },
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t('common.dashboard', 'DASHBOARD'), category: 'INDEX' },
    { id: 'EXCHANGE', icon: ArrowLeftRight, label: t('sidebar.exchange', 'CREATIVE MARKET'), category: 'DEVELOPMENT' },
    { id: 'SWIPE', icon: Target, label: t('sidebar.swipe', 'DÉCOUVERTE LYA'), category: 'DEVELOPMENT' },
    { id: 'COMPARE', icon: Calculator, label: t('sidebar.compare', 'COMPARATEUR'), category: 'INDEX' },
    { id: 'WATCHLIST', icon: CheckCircle, label: t('sidebar.watchlist', 'FAVORIS'), category: 'INDEX', count: watchlist.length },
    { id: 'VALIDATION', icon: ShieldCheck, label: t('sidebar.validation', 'INDEXATION'), category: 'PROTOCOL' },
    { id: 'HOLDINGS', icon: Briefcase, label: t('sidebar.holdings', 'COLLECTION'), category: 'VAULT' },
    { id: 'REGISTRY', icon: BookOpen, label: t('sidebar.registry', 'REGISTRE'), category: 'PROTOCOL' },
    { id: 'LINK_ART', icon: Link2, label: t('sidebar.link_art', 'LE PROTOCOLE'), category: 'SYSTEM' },
    { id: 'SOCIAL_FEED', icon: Users, label: t('sidebar.community', 'SOCIAL'), category: 'COMMUNAUTÉ' },
    { id: 'LOUNGE', icon: Coffee, label: t('sidebar.lounge', 'SALON'), category: 'COMMUNAUTÉ' },
    { id: 'ACADEMY', icon: Globe, label: t('ACADEMY', 'ACADÉMIE'), category: 'RESSOURCES' },
  ];

  const secondaryItems = [
    { id: 'SETTINGS', icon: Settings, label: t('common.settings', 'REGLAGES') },
    { id: 'PRICING', icon: CreditCard, label: t('sidebar.pricing', 'TARIFICATION') },
    { id: 'API', icon: Database, label: t('API', 'API') },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const SidebarContent = (
    <div className="h-full flex flex-col bg-surface-dim/80 backdrop-blur-xl border-r border-white/5 font-mono">
      {/* Sidebar Header with Logo */}
      <div className={`transition-all duration-300 border-b border-white/5 flex items-center ${isCollapsed ? 'p-6 justify-center' : 'p-8 pb-10 pt-10'}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 w-full group cursor-pointer"
            onClick={() => onViewChange('HOME')}
          >
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-primary-cyan/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Logo size={56} color="multi" showBeta className="relative z-10" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white font-bold tracking-tighter text-xl leading-[0.8] truncate italic uppercase">LINKYOURART</span>
              <span className="text-[10px] text-primary-cyan font-black tracking-tighter uppercase mt-1 opacity-70">THE CREATIVE TERMINAL</span>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="group cursor-pointer relative" onClick={() => onViewChange('HOME')}>
            <div className="absolute inset-0 bg-primary-cyan/20 blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Logo size={40} color="multi" showBeta className="relative z-10" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {categories.map(category => (
          <div key={category} className="mb-6">
            {!isCollapsed && (
              <div className="px-6 mb-2 text-[10px] text-on-surface-variant/40 font-bold tracking-widest uppercase flex items-center gap-3">
                <div className="w-4 h-[1px] bg-white opacity-10" />
                {category}
              </div>
            )}
            <div className="space-y-0.5">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as View);
                      if (isOpen) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-6 py-2 transition-all group relative ${
                      currentView === item.id 
                        ? 'text-primary-cyan bg-primary-cyan/5 border-r-2 border-primary-cyan' 
                        : 'text-on-surface-variant/60 hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'px-0 justify-center' : ''}`}
                    title={item.label}
                  >
                    <item.icon size={18} className={currentView === item.id ? 'text-primary-cyan' : 'group-hover:text-primary-cyan transition-colors'} />
                    {!isCollapsed && (
                      <span className="text-xs font-medium uppercase tracking-tight flex-1 text-left">
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] bg-primary-cyan/20 text-primary-cyan px-1.5 py-0.5 rounded-full font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-1">
        {secondaryItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id as View);
              if (isOpen) onClose();
            }}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group ${
              currentView === item.id 
                ? 'text-primary-cyan bg-primary-cyan/5' 
                : 'text-on-surface-variant/60 hover:text-white hover:bg-white/5'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={item.label}
          >
            <item.icon size={16} />
            {!isCollapsed && <span className="text-xs uppercase font-medium">{item.label}</span>}
          </button>
        ))}
        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex w-full items-center gap-3 px-2 py-2 text-on-surface-variant/40 hover:text-white transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-[10px] uppercase font-bold tracking-widest">{t('COLLAPSE', 'COLLAPSER')}</span>
            </>
          )}
        </button>
      </div>

      {/* User Status */}
      {user && !isCollapsed && (
        <div className="p-6 bg-white/2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white cursor-pointer overflow-hidden group/avatar relative" 
              onClick={() => onViewChange('PROFILE')}
            >
              {user.avatarUrl ? (
                <img 
                  key={user.avatarUrl} // Add key to force re-render on photo change
                  src={user.avatarUrl} 
                  alt={user.displayName} 
                  className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-primary-cyan to-indigo-500 flex items-center justify-center">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-primary-cyan/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-white truncate uppercase tracking-tight">{user.displayName}</div>
              <div className="text-[9px] text-primary-cyan font-bold tracking-widest truncate">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed position, high z-index, distinct style */}
      <div className="fixed top-4 left-6 z-[2000] lg:hidden">
        <button
          onClick={() => (isOpen ? onClose() : onClose())}
          className="hidden"
        >
        </button>
      </div>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
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
              className="relative h-full w-[280px] bg-[#0A1018] border-r border-white/10 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 pb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo size={32} color="multi" showBeta />
                  <div className="flex flex-col">
                    <span className="text-white font-black tracking-tighter text-sm leading-tight uppercase italic">LINKYOURART</span>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-white transition-all ring-1 ring-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation List */}
              <div className="flex-1 py-4 px-4">
                {categories.map(category => (
                  <div key={category} className="mb-8">
                    <div className="px-5 mb-3 text-[9px] text-on-surface-variant/40 font-black tracking-[0.4em] uppercase italic">
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
                              <motion.div 
                                layoutId="mobile-active-glow"
                                className="absolute left-0 w-1 h-6 bg-primary-cyan rounded-full"
                              />
                            )}
                            <item.icon size={20} className={currentView === item.id ? 'text-primary-cyan scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all'} />
                            <span className="text-xs font-black uppercase tracking-widest flex-1 text-left italic">
                              {item.label}
                            </span>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="text-[9px] bg-primary-cyan/20 text-primary-cyan px-2 py-0.5 rounded-full font-black">
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
                <div className="grid grid-cols-2 gap-2">
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
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Profile on Mobile */}
              {user ? (
                <div 
                  onClick={() => { onViewChange('PROFILE'); onClose(); }}
                  className="p-8 bg-gradient-to-tr from-white/[0.03] to-white/[0.01] border-t border-white/10 flex items-center gap-5 shadow-2xl"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-primary-cyan/40 p-0.5 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,224,255,0.2)]">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-primary-cyan to-indigo-500 flex items-center justify-center text-xs font-black text-white italic">
                          {user.displayName?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">{user.displayName}</div>
                    <div className="text-[10px] text-primary-cyan font-bold uppercase tracking-[0.2em] truncate mt-1">{user.role}</div>
                  </div>
                  <ChevronRight size={18} className="text-on-surface-variant/40" />
                </div>
              ) : (
                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                  <button 
                    onClick={() => { onViewChange('LOGIN'); onClose(); }}
                    className="w-full py-5 bg-primary-cyan text-surface-dim text-xs font-black uppercase italic tracking-[0.3em] rounded-full shadow-[0_0_30px_rgba(0,224,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('ACCESS TERMINAL', 'ACCÈS TERMINAL')}
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
