
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
  TrendingDown,
  Newspaper,
  Award,
  ShieldCheck
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
            animate={{ x: [0, -2400] }}
            transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
          >
            {(() => {
              const mediaAnnouncements = [
                t('New article on LYA certification standard', 'Nouvel article sur le standard de certification LYA'),
                t('LYA Jobs: new listings from certified studios', 'LYA Jobs : nouvelles offres de studios certifiés'),
                t('Press & Media: new call for contributions', 'Presse & Médias : nouvel appel à contribution'),
                t('LYA featured in creative industry roundup', 'LYA mentionné dans une revue de l\'industrie créative'),
                t('New podcast episode covers the LYA Score methodology', 'Nouvel épisode de podcast sur la méthodologie du Score LYA'),
                t('Press & Media: exclusive interview published', 'Presse & Médias : interview exclusive publiée'),
              ];
              const registryStats = [
                t('128+ certified projects on the LYA Registry', '128+ projets certifiés sur le Registre LYA'),
                t('9+ creative sectors covered', '9+ secteurs créatifs couverts'),
                t('100+ active professional validators', '100+ validateurs professionnels actifs'),
                t('290+ active patrons on the platform', '290+ mécènes actifs sur la plateforme'),
                t('LYA Score methodology: 5 pillars, 1000 points', 'Méthodologie du Score LYA : 5 piliers, 1000 points'),
                t('New professional validators onboarded this month', 'Nouveaux validateurs professionnels intégrés ce mois-ci'),
              ];
              const sectorHighlights = [
                t('Film & TV: strongest certification growth this quarter', 'Film & TV : plus forte croissance de certification ce trimestre'),
                t('Music: rising number of certified catalogs', 'Musique : nombre croissant de catalogues certifiés'),
                t('Architecture: new certified projects added weekly', 'Architecture : nouveaux projets certifiés chaque semaine'),
                t('Fashion: growing patron interest in certified collections', 'Mode : intérêt croissant des mécènes pour les collections certifiées'),
              ];

              type Row = { key: string; node: React.ReactNode };
              const rows: Row[] = [];

              [...CONTRACTS].slice(0, 14).forEach((item, i) => {
                const isUp = item.growth >= 0;
                rows.push({
                  key: `score-${item.id}-${i}`,
                  node: (
                    <div className="flex items-center gap-6 cursor-pointer group h-full px-4 border-l-2 border-primary-cyan/30 hover:bg-white/5 transition-colors"
                      onClick={() => onSelectContract ? onSelectContract(item) : onViewChange('DASHBOARD')}>
                      <span className="text-[10px] font-black text-white group-hover:text-primary-cyan transition-colors uppercase tracking-widest flex items-center gap-2">
                        <span className="text-on-surface-variant/40">{item.registryIndex}</span>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white font-mono font-bold">{item.totalScore}/1000</span>
                        <div className="flex items-center gap-1">
                          {isUp ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-500" />}
                          <span className={`text-[10px] font-black ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>{isUp ? '+' : ''}{item.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ),
                });
                if (item.milestones && item.milestones.length > 0) {
                  const m = item.milestones[item.milestones.length - 1];
                  rows.push({
                    key: `milestone-${item.id}-${i}`,
                    node: (
                      <div className="flex items-center gap-2 h-full px-4 cursor-pointer group border-l-2 border-accent-gold/30 hover:bg-accent-gold/5 transition-colors"
                        onClick={() => onSelectContract ? onSelectContract(item) : onViewChange('DASHBOARD')}>
                        <Award size={11} className="text-accent-gold" />
                        <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest group-hover:text-white transition-colors">{item.name}:</span>
                        <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">{m.label}</span>
                      </div>
                    ),
                  });
                }
              });
              mediaAnnouncements.forEach((txt, i) => rows.push({
                key: `media-${i}`,
                node: (
                  <div className="flex items-center gap-2 h-full px-4 cursor-pointer group border-l-2 border-[#a78bfa]/30 hover:bg-[#a78bfa]/5 transition-colors"
                    onClick={() => onViewChange('SOCIAL_FEED')}>
                    <Newspaper size={11} className="text-[#a78bfa]" />
                    <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest group-hover:text-[#a78bfa] transition-colors">{txt}</span>
                  </div>
                ),
              }));
              registryStats.forEach((txt, i) => rows.push({
                key: `stat-${i}`,
                node: (
                  <div className="flex items-center gap-2 h-full px-4 cursor-pointer group border-l-2 border-primary-cyan/30 hover:bg-primary-cyan/5 transition-colors"
                    onClick={() => onViewChange('REGISTRY')}>
                    <ShieldCheck size={11} className="text-primary-cyan" />
                    <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest group-hover:text-primary-cyan transition-colors">{txt}</span>
                  </div>
                ),
              }));
              sectorHighlights.forEach((txt, i) => rows.push({
                key: `sector-${i}`,
                node: (
                  <div className="flex items-center gap-2 h-full px-4 cursor-pointer group border-l-2 border-emerald-400/30 hover:bg-emerald-400/5 transition-colors"
                    onClick={() => onViewChange('DASHBOARD')}>
                    <TrendingUp size={11} className="text-emerald-400" />
                    <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">{txt}</span>
                  </div>
                ),
              }));

              // Alterne les types plutôt que de les grouper par bloc
              for (let i = rows.length - 1; i > 0; i--) {
                const j = (i * 7 + 3) % (i + 1);
                [rows[i], rows[j]] = [rows[j], rows[i]];
              }

              return [...rows, ...rows].map((r, idx) => <div key={`${r.key}-${idx}`}>{r.node}</div>);
            })()}
          </motion.div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'EN' ? 'FR' : 'EN')}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-on-surface-variant hover:text-primary-cyan transition-all group relative"
            title={t('Switch Language', 'Changer de langue')}
          >
            <Globe size={20} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-full border border-white/10">
            {[
              { id: 'EUR', symbol: '€' },
              { id: 'USD', symbol: '$' },
              { id: 'GBP', symbol: '£' },
              { id: 'JPY', symbol: '¥' }
            ].map((curr) => (
              <button
                key={curr.id}
                onClick={() => setCurrency(curr.id as any)}
                className={`w-7 h-7 flex items-center justify-center text-[10px] font-black transition-all rounded-full ${
                  currency === curr.id 
                    ? 'bg-accent-gold text-surface-dim shadow-[0_0_15px_rgba(212,175,55,0.6)]' 
                    : 'text-on-surface-variant/60 hover:text-white hover:bg-white/10'
                }`}
                title={curr.id}
              >
                {curr.symbol}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
              className="relative text-on-surface-variant hover:text-white transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-rose-500 rounded-full border border-surface-dim flex items-center justify-center text-[9px] font-black text-white px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence mode="sync">
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
                      <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-xs text-primary-cyan font-bold hover:underline uppercase">
                        {t('MARK ALL READ', 'TOUT MARQUER COMME LU')}
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
                                <span className="text-[10px] text-on-surface-variant/30 font-bold">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                                {!notif.read && <span className="text-[10px] text-primary-cyan font-black uppercase tracking-widest">{t('NEW', 'NOUVEAU')}</span>}
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
                  <div className="text-xs text-primary-cyan font-bold tracking-widest uppercase opacity-80">{user.role}</div>
                </div>
              </button>
            ) : (
              <button 
                onClick={() => onViewChange('LOGIN')}
                className="px-6 py-1.5 bg-primary-cyan text-surface-dim text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 rounded-full"
              >
                {t('SIGN IN', 'CONNEXION')}
              </button>
            )}

            <AnimatePresence mode="sync">
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
                      <div className="text-xs text-on-surface-variant/60 truncate">{user.email}</div>
                    </div>
                    <div className="p-2">
                      {user.role === UserRole.ADMIN && (
                        <button 
                          onClick={() => { onViewChange('ADMIN_PANEL'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-accent-gold hover:text-white hover:bg-accent-gold/10 transition-all uppercase tracking-widest border border-accent-gold/20 mb-1 rounded-sm"
                        >
                          <Shield size={14} /> {t('ADMIN HUB', 'HUB ADMIN')}
                        </button>
                      )}
                      <button 
                        onClick={() => { 
                          const dest = user?.role === UserRole.PROFESSIONAL ? 'PROFESSIONAL_DASHBOARD'
                            : user?.role === UserRole.CREATOR ? 'CREATOR_DASHBOARD'
                            : user?.role === UserRole.PATRON ? 'PATRON_DASHBOARD'
                            : 'PROFILE';
                          onViewChange(dest); 
                          setIsUserMenuOpen(false); 
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                      >
                        <User size={14} /> {
                          user?.role === UserRole.PROFESSIONAL ? t('PRO SPACE', 'ESPACE PRO')
                          : user?.role === UserRole.CREATOR ? t('MY CREATIONS', 'MES CRÉATIONS')
                          : user?.role === UserRole.PATRON ? t('MY PATRONAGE', 'MES SOUTIENS')
                          : t('PROFILE', 'PROFIL')
                        }
                      </button>
                      <button 
                        onClick={() => { onViewChange('SETTINGS'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                      >
                        <Zap size={14} /> {t('SETTINGS', 'PARAMÈTRES')}
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
