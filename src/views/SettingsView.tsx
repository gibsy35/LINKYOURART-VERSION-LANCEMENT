
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  User, 
  Database, 
  Cpu,
  Monitor,
  Eye,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [highPerformance, setHighPerformance] = useState(true);

  const SettingSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: any }) => (
    <div className="bg-surface-low/40 border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden group rounded-xl shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={64} />
      </div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-primary-cyan/10 rounded-lg border border-primary-cyan/20">
          <Icon className="text-primary-cyan" size={20} />
        </div>
        <h3 className="text-lg font-black uppercase italic tracking-tight">
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
    <div className="space-y-12 pb-20 relative overflow-hidden">
      <PageHeader 
        titleWhite={t('System', 'PARAMÈTRES')}
        titleAccent={t('Settings', 'SYSTÈME')}
        description={t('CONFIGURE YOUR INSTITUTIONAL INTERFACE AND NEURAL LINK PARAMETERS FOR OPTIMIZED MARKET INTERACTION.', 'CONFIGUREZ VOTRE INTERFACE INSTITUTIONNELLE ET VOS PARAMÈTRES DE LIEN NEURAL POUR UNE INTERACTION DE MARCHÉ OPTIMISÉE.')}
        accentColor="text-primary-cyan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-12">
        <SettingSection title={t('Display & Theme', 'Affichage et Thème')} icon={Monitor}>
          <SettingItem 
            label={t('Visual Mode', 'Mode Visuel')} 
            description={t('Switch between light and dark institutional themes.', 'Basculez entre les thèmes institutionnels clair et sombre.')}
          >
            <div className="flex bg-white/5 p-1 rounded-sm border border-white/10">
              <button 
                onClick={() => setTheme('light')}
                className={`px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >
                <Sun size={12} /> {t('Light', 'Clair')}
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-white'}`}
              >
                <Moon size={12} /> {t('Dark', 'Sombre')}
              </button>
            </div>
          </SettingItem>
          <SettingItem 
            label={t('High Performance Mode', 'Mode Haute Performance')} 
            description={t('Optimize animations for institutional-grade hardware.', 'Optimisez les animations pour le matériel de qualité institutionnelle.')}
          >
            <Toggle enabled={highPerformance} onChange={() => setHighPerformance(!highPerformance)} />
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
              className="bg-white/5 border border-white/10 text-xs text-primary-cyan py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none"
            >
              <option value="en">English (Global)</option>
              <option value="fr">Français (Europe)</option>
            </select>
          </SettingItem>
          <SettingItem 
            label={t('Currency Display', 'Affichage de la Devise')} 
            description={t('Choose how monetary values are displayed.', 'Choisissez comment les valeurs monétaires sont affichées.')}
          >
            <select className="bg-white/5 border border-white/10 text-xs text-on-surface-variant py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="LYA">LYA UNITS</option>
            </select>
          </SettingItem>
        </SettingSection>

        <SettingSection title={t('Security & Privacy', 'Sécurité et Confidentialité')} icon={Shield}>
          <SettingItem 
            label={t('Two-Factor Authentication', 'Authentification à Deux Facteurs')} 
            description={t('Add an extra layer of security to your institutional account.', 'Ajoutez une couche de sécurité supplémentaire à votre compte institutionnel.')}
          >
            <button className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-primary-cyan/50 hover:text-primary-cyan transition-all">
              {t('Configure 2FA', 'Configurer 2FA')}
            </button>
          </SettingItem>
          <SettingItem 
            label={t('Privacy Level', 'Niveau de Confidentialité')} 
            description={t('Control how your profile is indexed in the global registry.', 'Contrôlez comment votre profil est indexé dans le registre mondial.')}
          >
            <select className="bg-white/5 border border-white/10 text-xs text-on-surface-variant py-2 px-4 uppercase tracking-widest focus:ring-0 outline-none">
              <option value="PUBLIC">{t('Public Registry', 'Registre Public')}</option>
              <option value="PRIVATE">{t('Private / Hidden', 'Privé / Caché')}</option>
              <option value="INSTITUTIONAL">{t('Institutional Only', 'Institutionnel Uniquement')}</option>
            </select>
          </SettingItem>
        </SettingSection>

        <SettingSection title={t('Notifications', 'Notifications')} icon={Bell}>
          <SettingItem 
            label={t('Neural Alerts', 'Alertes Neurales')} 
            description={t('Receive real-time updates on your indexed contracts.', 'Recevez des mises à jour en temps réel sur vos contrats indexés.')}
          >
            <Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} />
          </SettingItem>
          <SettingItem 
            label={t('Market Reports', 'Rapports de Marché')} 
            description={t('Weekly institutional summary of global creative equity.', 'Résumé institutionnel hebdomadaire de l\'équité créative mondiale.')}
          >
            <button className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-accent-gold/50 hover:text-accent-gold transition-all">
              {t('Manage Reports', 'Gérer les Rapports')}
            </button>
          </SettingItem>
        </SettingSection>
      </div>

      <div className="mt-12 p-8 bg-primary-cyan/5 border border-primary-cyan/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary-cyan/10 border border-primary-cyan/30 flex items-center justify-center rounded-sm shrink-0">
            <Cpu size={32} className="text-primary-cyan" />
          </div>
          <div>
            <h4 className="text-xl font-black uppercase italic mb-1 tracking-tighter">{t('Institutional Node Status', 'Statut du Nœud Institutionnel')}</h4>
            <p className="text-sm text-on-surface-variant italic">
              {t('Your connection to the LinkYourArt Global Registry is encrypted and verified.', 'Votre connexion au registre mondial LinkYourArt est cryptée et vérifiée.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Node: LYA-EU-WEST-2</span>
            <span className="text-[8px] text-on-surface-variant uppercase tracking-widest">Version 4.2.0-STABLE</span>
          </div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        </div>
      </div>
    </div>
  );
};
