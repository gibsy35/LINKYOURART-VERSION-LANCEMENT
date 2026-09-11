
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Monitor,
  Users,
  UserPlus,
  X as XIcon,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { UserProfile, UserRole } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { inviteTeamMember, removeTeamMember, getSeatLimitForUser } from '../utils/teamInvites';

interface SettingsViewProps {
  user: UserProfile | null;
  onUserUpdate: (u: UserProfile | null) => void;
  onNotify: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdate, onNotify }) => {
  const { t, language, setLanguage } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  // Préférences réellement persistées par utilisateur (Firestore), au
  // lieu de retomber sur les valeurs par défaut à chaque rechargement.
  const [theme, setTheme] = useState<'dark' | 'light'>(user?.themePreference || 'dark');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const [highPerformance, setHighPerformance] = useState(user?.highPerformanceMode ?? true);
  const [privacyLevel, setPrivacyLevel] = useState(user?.privacyLevel || 'PUBLIC');

  const savePreference = async (field: string, value: any) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { [field]: value });
      onUserUpdate({ ...user, [field]: value } as UserProfile);
    } catch {
      onNotify(t('Network error — preference not saved', 'Erreur réseau — préférence non sauvegardée'));
    }
  };

  const handleVisualModeToggle = (mode: 'light' | 'dark') => {
    setTheme(mode);
    if (mode === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    savePreference('themePreference', mode);
  };

  const handlePerformanceToggle = () => {
    const next = !highPerformance;
    setHighPerformance(next);
    document.body.setAttribute('data-performance', next ? 'high' : 'standard');
    savePreference('highPerformanceMode', next);
  };

  // Systeme de licence multi-utilisateurs (sieges) — visible uniquement
  // pour les comptes Pro (STARTER/ADVANCED) ou Entreprise.
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const seatLimit = getSeatLimitForUser(user);
  const teamMembers = user?.teamMembers || [];
  const seatsUsed = teamMembers.length + 1; // +1 pour le proprietaire lui-meme

  const handleInvite = async () => {
    if (!user || !inviteEmail.trim()) return;
    setIsInviting(true);
    const result = await inviteTeamMember(user.uid, user, inviteEmail);
    setIsInviting(false);
    if (result.ok) {
      onUserUpdate({ ...user, teamMembers: [...teamMembers, inviteEmail.trim().toLowerCase()] });
      setInviteEmail('');
      onNotify(t('INVITATION SENT', 'INVITATION ENVOYÉE'));
    } else if (result.reason === 'LIMIT_REACHED') {
      onNotify(t('SEAT LIMIT REACHED FOR YOUR PLAN', 'LIMITE DE SIÈGES ATTEINTE POUR VOTRE FORFAIT'));
    } else if (result.reason === 'ALREADY_INVITED') {
      onNotify(t('ALREADY INVITED', 'DÉJÀ INVITÉ'));
    } else {
      onNotify(t('ERROR SENDING INVITATION', 'ERREUR LORS DE L\'INVITATION'));
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!user) return;
    await removeTeamMember(user.uid, email);
    onUserUpdate({ ...user, teamMembers: teamMembers.filter(m => m !== email) });
  };

  const SettingSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: any }) => (
    <div className="bg-surface-low/40 border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden group rounded-xl shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
      </div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-primary-cyan/10 rounded-lg border border-primary-cyan/20">
          <Icon className="text-primary-cyan" size={20} />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tight">
          {title}
        </h3>
      </div>
      <div className="space-y-4 relative z-10">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0 group/item">
      <div className="max-w-md">
        <p className="text-xs font-black uppercase tracking-widest text-on-surface group-hover/item:text-primary-cyan transition-colors">{label}</p>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">{description}</p>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${enabled ? 'bg-primary-cyan' : 'bg-white/10'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 24 : 0 }}
        className="w-4 h-4 bg-surface-dim rounded-full shadow-lg"
      />
    </button>
  );

  return (
    <div className="space-y-8 pb-12 relative overflow-hidden">
      <PageHeader 
        titleWhite={t('System', 'Réglages')}
        titleAccent={t('Settings', 'Système')}
        description={t('CONFIGURE YOUR INTERFACE PREFERENCES, LANGUAGE AND NOTIFICATION SETTINGS.', 'CONFIGUREZ VOS PRÉFÉRENCES D\'INTERFACE, DE LANGUE ET DE NOTIFICATIONS.')}
        accentColor="text-primary-cyan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingSection title={t('Display & Theme', 'Affichage et Thème')} icon={Monitor}>
          <SettingItem 
            label={t('Visual Mode', 'Mode Visuel')} 
            description={t('Professional dark theme, optimized for extended use.', 'Thème sombre professionnel, optimisé pour un usage prolongé.')}
          >
            <div className="flex bg-white/5 p-1 rounded-sm border border-white/10">
              <button 
                className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-primary-cyan text-surface-dim"
              >
                <Moon size={12} /> {t('Dark', 'Sombre')}
              </button>
            </div>
          </SettingItem>
          <SettingItem 
            label={t('High Performance Mode', 'Mode Haute Performance')} 
            description={t('Optimize animations for expert-grade hardware.', 'Optimisez les animations pour le matériel de qualité expert.')}
          >
            <Toggle enabled={highPerformance} onChange={handlePerformanceToggle} />
          </SettingItem>
        </SettingSection>

        <SettingSection title={t('Language & Localization', 'Langue et Localisation')} icon={Globe}>
          <SettingItem 
            label={t('Interface Language', 'Langue de l\'Interface')} 
            description={t('Select your preferred language for the LYA platform.', 'Sélectionnez votre langue préférée pour la plateforme LYA.')}
          >
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-xs text-primary-cyan py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none cursor-pointer"
            >
              <option value="EN">English (Global)</option>
              <option value="FR">Français (Europe)</option>
            </select>
          </SettingItem>
          <SettingItem 
            label={t('Currency Display', 'Affichage de la Devise')} 
            description={t('Choose how monetary values are displayed.', 'Choisissez comment les valeurs monétaires sont affichées.')}
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-xs text-on-surface-variant py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </SettingItem>
        </SettingSection>

        <SettingSection title={t('Security & Privacy', 'Sécurité et Confidentialité')} icon={Shield}>
          <SettingItem 
            label={t('Two-Factor Authentication', 'Authentification à Deux Facteurs')} 
            description={t('Add an extra layer of security to your professional account. Coming soon.', 'Ajoutez une couche de sécurité supplémentaire à votre compte professionnel. Bientôt disponible.')}
          >
            <span className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
              {t('Coming Soon', 'Bientôt Disponible')}
            </span>
          </SettingItem>
          <SettingItem 
            label={t('Privacy Level', 'Niveau de Confidentialité')} 
            description={t('Control how your profile is indexed in the global registry.', 'Contrôlez comment votre profil est indexé dans le registre mondial.')}
          >
            <select
              value={privacyLevel}
              onChange={(e) => { const v = e.target.value as any; setPrivacyLevel(v); savePreference('privacyLevel', v); }}
              className="bg-white/5 border border-white/10 text-xs text-on-surface-variant py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none"
            >
              <option value="PUBLIC">{t('Public Registry', 'Registre Public')}</option>
              <option value="PRIVATE">{t('Private / Hidden', 'Privé / Caché')}</option>
              <option value="PROFESSIONAL">{t('Professional Only', 'Professionnel Uniquement')}</option>
            </select>
          </SettingItem>
          {user?.isVerifiedValidator && (
            <SettingItem
              label={t('Public Certifier Showcase', 'Vitrine Publique des Certificateurs')}
              description={t('Show your name publicly among LYA\'s certifiers on our showcase page. Off by default — your certification work stays private unless you opt in.', 'Affichez votre nom publiquement parmi les certificateurs LYA sur notre page vitrine. Désactivé par défaut — votre activité de certification reste privée sauf si vous l\'activez.')}
            >
              <Toggle
                enabled={!!user?.publicCertifierOptIn}
                onChange={async () => {
                  const next = !user?.publicCertifierOptIn;
                  try {
                    await updateDoc(doc(db, 'users', user!.uid), { publicCertifierOptIn: next });
                    onUserUpdate({ ...user!, publicCertifierOptIn: next } as UserProfile);
                    onNotify(next
                      ? t('You\'re now listed on the public showcase', 'Vous apparaissez maintenant sur la vitrine publique')
                      : t('Removed from the public showcase', 'Retiré de la vitrine publique'));
                  } catch {
                    onNotify(t('Network error', 'Erreur réseau'));
                  }
                }}
              />
            </SettingItem>
          )}
        </SettingSection>

        {(user?.role === UserRole.PROFESSIONAL) && (
          <SettingSection title={t('Team & Seats', 'Équipe et Sièges')} icon={Users}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">
                {t('Seats used', 'Sièges utilisés')}
              </p>
              <p className="text-xs font-black text-primary-cyan">{seatsUsed} / {seatLimit}</p>
            </div>

            {teamMembers.length > 0 && (
              <div className="space-y-2 mb-4">
                {teamMembers.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5">
                    <span className="text-xs text-on-surface-variant">{email}</span>
                    <button onClick={() => handleRemoveMember(email)} className="text-on-surface-variant/40 hover:text-red-400 transition-colors">
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {seatsUsed < seatLimit ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('teammate@email.com', 'coequipier@email.com')}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-primary-cyan transition-all"
                />
                <button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                  className="flex items-center gap-2 bg-primary-cyan/10 border border-primary-cyan/30 text-primary-cyan px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-cyan/20 transition-all disabled:opacity-40"
                >
                  <UserPlus size={14} /> {t('Invite', 'Inviter')}
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                {t('Seat limit reached for your plan — upgrade to add more.', 'Limite de sièges atteinte pour votre forfait — passez à un palier supérieur pour en ajouter.')}
              </p>
            )}
          </SettingSection>
        )}

        <SettingSection title={t('Notifications', 'Notifications')} icon={Bell}>
          <SettingItem 
            label={t('Neural Alerts', 'Alertes Neurales')} 
            description={t('Receive real-time updates on your indexed contracts.', 'Recevez des mises à jour en temps réel sur vos contrats indexés.')}
          >
            <Toggle enabled={notifications} onChange={() => { const next = !notifications; setNotifications(next); savePreference('notificationsEnabled', next); }} />
          </SettingItem>
          <SettingItem 
            label={t('Market Reports', 'Rapports de Marché')} 
            description={t('Weekly professional summary of global creative rights. Coming soon.', 'Résumé professionnel hebdomadaire des droits créatifs mondiaux. Bientôt disponible.')}
          >
            <span className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
              {t('Coming Soon', 'Bientôt Disponible')}
            </span>
          </SettingItem>
        </SettingSection>

      </div>
    </div>
  );
};
