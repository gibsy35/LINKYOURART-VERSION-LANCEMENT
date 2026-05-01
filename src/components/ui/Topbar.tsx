
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  Globe, 
  LogOut,
  ChevronDown,
  Inbox,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { UserProfile, UserRole, CONTRACTS, Contract } from '../../types';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { Logo } from '../ui/Logo';

interface TopbarProps {
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onToggleMobileMenu: () => void;
  currentView: string;
  onViewChange: (view: any) => void;
  onSelectContract?: (contract: Contract) => void;
  isSidebarCollapsed: boolean;
  setUser: (user: UserProfile | null) => void;
  notifications: any[];
  setNotifications: (notifs: any[]) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onNotify,
  onToggleMobileMenu,
  currentView,
  onViewChange,
  onSelectContract,
  isSidebarCollapsed,
  setUser,
  notifications,
  setNotifications
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      onViewChange('HOME');
      onNotify(t('LOGGED OUT SUCCESSFULLY', 'DÉCONNEXION RÉUSSIE'));
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-[90] transition-all duration-300">
      {/* FULL WIDTH BACKGROUND */}
      <div className="absolute inset-0 bg-surface-dim/95 backdrop-blur-xl border-b border-white/5 -z-10" />

      <div className={`h-full flex items-center justify-between relative px-6 md:px-12 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={onToggleMobileMenu} className="text-on-surface-variant hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Logo size={24} color="multi" showBeta />
            <span className="text-white font-black tracking-tighter text-sm hidden sm:block">LINKYOURART</span>
          </div>
        </div>

        {/* Desktop Ticker Wrapper - Extended to the left */}
        <div className="hidden lg:flex flex-1 h-full items-center overflow-hidden bg-black/20 relative">
          <motion.div 
            className="flex items-center gap-16 whitespace-nowrap absolute left-0 h-full"
            animate={{ x: [0, -2000] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {[...CONTRACTS, ...CONTRACTS, ...CONTRACTS].map((item, i) => {
              // Create a deterministic-looking variation based on item ID and index
              const charCodeSum = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const isUp = (charCodeSum + i) % 2 === 0;
              const variationPercent = ((charCodeSum % 100) / 20 + (i % 5) / 2).toFixed(2);
              const adjustedPrice = item.unitValue * (1 + (isUp ? 1 : -1) * parseFloat(variationPercent) / 100);
              
              return (
                <div 
                  key={`${item.id}-${i}`} 
                  className="flex items-center gap-6 cursor-pointer group h-full px-4 transition-colors"
                  onClick={() => onSelectContract ? onSelectContract(item) : onViewChange('DASHBOARD')}
                >
                  <span className="text-[10px] font-black text-white group-hover:text-primary-cyan transition-colors uppercase tracking-widest flex items-center gap-2">
                    <span className="text-on-surface-variant/40">{item.registryIndex}</span>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white font-mono font-bold">
                      {adjustedPrice.toFixed(2)} USD
                    </span>
                    <div className="flex items-center gap-1">
                      {isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-500" />}
                      <span className={`text-[10px] font-black ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {isUp ? '+' : '-'}{variationPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'EN' ? 'FR' : 'EN')}
            className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant hover:text-white transition-all uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
          >
            <Globe size={12} />
            {language}
          </button>

          {/* Currency Selector */}
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="bg-transparent border-none text-[10px] font-bold text-on-surface-variant hover:text-white focus:ring-0 uppercase tracking-widest cursor-pointer"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="CHF">CHF</option>
          </select>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="relative text-on-surface-variant hover:text-white transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-cyan rounded-full border-2 border-surface-dim" />
              )}
            </button>

            <AnimatePresence>
              {isNotifMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNotifMenuOpen(false)}
                    className="fixed inset-0 z-[100]"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-80 bg-surface-dim border border-white/10 shadow-2xl z-[101] font-mono"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('SYSTEM LOGS', 'LOGS SYSTÈME')}</span>
                      <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-[9px] text-primary-cyan font-bold hover:underline uppercase">
                        {t('MARK ALL READ', 'TOUTE MARQUER LUES')}
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant/40 text-[10px] uppercase font-bold tracking-widest">
                          {t('NO RECENT EVENTS', 'AUCUN ÉVÉNEMENT RÉCENT')}
                        </div>
                      ) : (
                        notifications.map(notif => {
                          const typeStyles = {
                            SUCCESS: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                            WARNING: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                            ERROR: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                            INFO: 'bg-primary-cyan/10 border-primary-cyan/20 text-primary-cyan'
                          }[notif.type as 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO'] || 'bg-white/5 border-white/10 text-white';

                          return (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-white/5 hover:bg-white/10 transition-all cursor-pointer relative group/notif ${!notif.read ? 'bg-primary-cyan/5' : ''}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${typeStyles.split(' ')[0].replace('/10', '')} animate-pulse`} />
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${typeStyles.split(' ').pop()}`}>{notif.title}</span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant/60 uppercase font-black leading-relaxed">{notif.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[8px] text-on-surface-variant/30 font-bold">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                                {!notif.read && <span className="text-[8px] text-primary-cyan font-black uppercase tracking-widest">NEW</span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 md:gap-3 group"
              >
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-cyan transition-all overflow-hidden relative">
                  {user.avatarUrl ? (
                    <img 
                      key={user.avatarUrl} // Add key to force re-render on photo change
                      src={user.avatarUrl} 
                      alt={user.displayName} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary-cyan to-indigo-500 flex items-center justify-center text-[10px] font-black text-white uppercase">
                      {user.displayName?.charAt(0) || user.email.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary-cyan transition-colors">{user.displayName}</div>
                  <div className="text-[9px] text-primary-cyan font-bold tracking-widest uppercase opacity-80">{user.role}</div>
                </div>
              </button>
            ) : (
              <button 
                onClick={() => onViewChange('LOGIN')}
                className="px-4 py-1.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('ACCESS TERMINAL', 'ACCÈS TERMINAL')}
              </button>
            )}

            <AnimatePresence>
              {isUserMenuOpen && user && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-[100]"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-56 bg-surface-dim border border-white/10 shadow-2xl z-[101] overflow-hidden font-mono"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <div className="text-[10px] font-black text-white uppercase mb-1">{user.displayName}</div>
                      <div className="text-[9px] text-on-surface-variant/60 truncate">{user.email}</div>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { onViewChange('PROFILE'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                      >
                        <User size={14} /> {t('PROFILE', 'PROFIL')}
                      </button>
                      <button 
                        onClick={() => { onViewChange('SETTINGS'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                      >
                        <Zap size={14} /> {t('PARAMETERS', 'PARAMÈTRES')}
                      </button>
                      <div className="h-px bg-white/5 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                      >
                        <LogOut size={14} /> {t('DISCONNECT', 'DÉCONNEXION')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
