
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
    { id: 'HOME', icon: Home, label: t('TERMINAL', 'TERMINAL'), category: 'SYSTÈME' },
    { id: 'DASHBOARD', icon: LayoutDashboard, label: t('DASHBOARD', 'DASHBOARD'), category: 'ANALYTIQUES' },
    { id: 'EXCHANGE', icon: ArrowLeftRight, label: t('ART MARKET', 'MARCHÉ DE L\'ART'), category: 'INVESTISSEMENT' },
    { id: 'SWIPE', icon: Target, label: t('LYA SWIPE', 'LYA SWIPE'), category: 'INVESTISSEMENT' },
    { id: 'COMPARE', icon: Calculator, label: t('COMPARE', 'COMPARER'), category: 'ANALYTIQUES' },
    { id: 'WATCHLIST', icon: CheckCircle, label: t('WATCHLIST', 'FAVORIS'), category: 'ANALYTIQUES', count: watchlist.length },
    { id: 'VALIDATION', icon: ShieldCheck, label: t('VALIDATION', 'CERTIFICATIONS'), category: 'CONFIANCE' },
    { id: 'HOLDINGS', icon: Briefcase, label: t('COLLECTION', 'COLLECTION'), category: 'PORTFOLIO' },
    { id: 'REGISTRY', icon: BookOpen, label: t('REGISTRY', 'REGISTRE'), category: 'CONFIANCE' },
    { id: 'LINK_ART', icon: Link2, label: t('THE PROTOCOL', 'LE PROTOCOLE'), category: 'SYSTÈME' },
    { id: 'SOCIAL_FEED', icon: Users, label: t('SOCIAL', 'SOCIAL'), category: 'COMMUNAUTÉ' },
    { id: 'LOUNGE', icon: Coffee, label: t('LOUNGE', 'SALON'), category: 'COMMUNAUTÉ' },
    { id: 'ACADEMY', icon: Globe, label: t('ACADEMY', 'ACADÉMIE'), category: 'RESSOURCES' },
  ];

  const secondaryItems = [
    { id: 'SETTINGS', icon: Settings, label: t('SETTINGS', 'REGLAGES') },
    { id: 'PRICING', icon: CreditCard, label: t('PRICING', 'TARIFICATION') },
    { id: 'API', icon: Database, label: t('API', 'API') },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const SidebarContent = (
    <div className="h-full flex flex-col bg-surface-dim/80 backdrop-blur-xl border-r border-white/5 font-mono">
      {/* Header */}
      <div className={`p-6 flex items-center justify-between border-b border-white/5 h-24 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 py-2"
          >
            <Logo size="lg" color="multi" />
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-lg leading-tight">LINKYOURART</span>
              <span className="text-primary-cyan font-bold tracking-[0.3em] text-[8px] uppercase">Institutional Terminal</span>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <Logo size={40} color="multi" />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
        {categories.map(category => (
          <div key={category} className="mb-6">
            {!isCollapsed && (
              <div className="px-6 mb-2 text-[10px] text-on-surface-variant/40 font-bold tracking-widest uppercase">
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
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-dim/80 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-[101] transition-all duration-300 hidden lg:block ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-[102] lg:hidden"
          >
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
