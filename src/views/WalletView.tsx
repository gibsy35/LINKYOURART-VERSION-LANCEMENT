
import React, { useState } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { downloadWalletStatement } from '../utils/premiumDownload';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Plus,
  X,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface WalletViewProps {
  user: any;
  onNotify: (msg: string) => void;
  onViewChange: (view: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user, onNotify, onViewChange }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'cards'>('overview');
  const [copied, setCopied] = useState(false);

  const totalSupported = 12450.75;
  const projectsSupported = 14;

  const transactions = [
    { id: '1', type: 'SUPPORT', amount: 2500, status: 'COMPLETED', date: '2026-05-15 14:22', method: 'RENAISSANCE REBORN' },
    { id: '2', type: 'SUPPORT', amount: 450, status: 'COMPLETED', date: '2026-05-14 09:15', method: 'SKY GARDENS V4' },
    { id: '3', type: 'SUPPORT', amount: 320, status: 'COMPLETED', date: '2026-05-11 11:45', method: 'THE FUTURE VOICE' },
    { id: '4', type: 'SUPPORT', amount: 150, status: 'PENDING', date: '2026-05-12 18:30', method: 'NOIR: THE AWAKENING' },
  ];

  const handleDownloadStatement = () => {
    downloadWalletStatement(transactions, user?.displayName || 'LYA MEMBER', totalSupported, projectsSupported);
    onNotify(t('SUPPORT HISTORY GENERATED', 'HISTORIQUE DE SOUTIEN GÉNÉRÉ'));
  };

  if (!user) return <AuthGuard user={user} onViewChange={onViewChange}>{null}</AuthGuard>;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        titleWhite={t('My', 'Mes')}
        titleAccent={t('Patronage', 'Mécénats')}
        description={t('TRACK THE PROJECTS YOU SUPPORT AND YOUR PAYMENT METHODS.', 'SUIVEZ LES PROJETS QUE VOUS SOUTENEZ ET VOS MOYENS DE PAIEMENT.')}
        accentColor="text-primary-cyan"
        compact={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-surface-low to-surface-dim border border-white/10 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Wallet size={160} />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-primary-cyan uppercase tracking-[0.4em] flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={14} /> {t('CERTIFIED PATRON', 'MÉCÈNE CERTIFIÉ')}
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('TOTAL SUPPORT GIVEN', 'TOTAL SOUTENU')}</p>
                  <p className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white">{formatPrice(totalSupported)}</p>
                </div>
              </div>
              <div className="space-y-2 text-left md:text-right">
                <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] flex items-center gap-1.5 md:justify-end mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse inline-block" /> {t('PROJECTS', 'PROJETS')}
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('PROJECTS SUPPORTED', 'PROJETS SOUTENUS')}</p>
                  <p className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-accent-gold">
                    {projectsSupported}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => onViewChange('REGISTRY')}
                className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 bg-primary-cyan text-surface-dim rounded-3xl hover:bg-white transition-all shadow-xl active:scale-95 group"
              >
                <ArrowDownLeft size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('DISCOVER PROJECTS', 'DÉCOUVRIR DES PROJETS')}</span>
              </button>
              <button 
                onClick={handleDownloadStatement}
                className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white hover:text-surface-dim transition-all active:scale-95"
              >
                <Download size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('STATEMENT', 'RELEVÉ')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-low border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
              <Zap size={14} /> {t('CERTIFIED IMPACT', 'IMPACT CERTIFIÉ')}
            </h3>
            <p className="text-2xl font-black text-white font-headline tracking-tight mb-4">{projectsSupported} <span className="text-xs uppercase text-on-surface-variant">{t('projects', 'projets')}</span></p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold leading-relaxed mb-8 opacity-60">
              {t('Every project you support receives credit mentions, exclusive updates and a traceable record on the LYA Registry.', 'Chaque projet que vous soutenez reçoit des mentions au générique, des mises à jour exclusives et une trace sur le Registre LYA.')}
            </p>
            <button 
              onClick={() => onViewChange('REGISTRY')}
              className="w-full py-4 border border-accent-gold/30 text-accent-gold text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-accent-gold hover:text-surface-dim transition-all"
            >
              {t('SUPPORT ANOTHER PROJECT', 'SOUTENIR UN AUTRE PROJET')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 border-b border-white/5 mb-12">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'overview' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          {t('PATRONAGE HISTORY', 'HISTORIQUE DE SOUTIEN')}
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
        </button>
        <button 
          onClick={() => setActiveTab('cards')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'cards' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          {t('PAYMENT METHODS', 'MOYENS DE PAIEMENT')}
          {activeTab === 'cards' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-on-surface-variant border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('DATE', 'DATE')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('PROJECT', 'PROJET')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('STATUS', 'STATUT')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-right">{t('AMOUNT', 'MONTANT')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 text-on-surface-variant">{tx.date}</td>
                    <td className="px-8 py-5 font-bold text-white uppercase tracking-widest">{tx.method}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-accent-gold/10 text-accent-gold'
                      } border border-current/20 uppercase tracking-widest`}>
                        {t(tx.status, tx.status)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm text-white">
                      {formatPrice(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-white/5 flex justify-center">
            <button 
              onClick={handleDownloadStatement}
              className="text-[10px] font-black text-on-surface-variant hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
            >
              {t('DOWNLOAD FULL REPORT', 'TÉLÉCHARGER LE RAPPORT COMPLET')} <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-primary-cyan to-indigo-600 p-8 rounded-[2rem] aspect-[1.6/1] flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 p-8 opacity-20"><CreditCard size={60} /></div>
            <div className="flex justify-between items-start">
              <CreditCard size={32} />
              <span className="text-[10px] font-black tracking-widest">{t('SAVED CARD', 'CARTE ENREGISTRÉE')}</span>
            </div>
            <div>
              <p className="text-xl font-bold tracking-[0.2em] mb-2 leading-none">**** **** **** 8842</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-black tracking-tighter mb-1">CARD HOLDER</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">{user?.displayName?.toUpperCase() || 'VALUED MEMBER'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-60 uppercase font-black tracking-tighter mb-1">EXPIRES</p>
                  <p className="text-[10px] font-black tracking-widest">12/28</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNotify(t('Coming soon — Stripe integration in progress', 'Bientôt disponible — Intégration Stripe en cours'))}
            className="border-2 border-dashed border-white/10 rounded-[2rem] aspect-[1.6/1] flex flex-col items-center justify-center gap-4 hover:border-primary-cyan transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-cyan group-hover:text-surface-dim transition-all">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{t('ADD PAYMENT METHOD', 'AJOUTER UN MOYEN DE PAIEMENT')}</span>
          </button>
        </div>
      )}

      <div className="bg-surface-low border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black font-headline uppercase tracking-widest text-white leading-none">{t('LYA TRUST ASSURANCE', 'LYA TRUST ASSURANCE')}</h3>
            <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed uppercase font-bold tracking-tight opacity-60">
              {t('All payments are processed securely via Stripe. LinkYourArt does not hold your funds — each payment goes directly to support the certified project you choose.', 'Tous les paiements sont traités de façon sécurisée via Stripe. LinkYourArt ne détient pas vos fonds — chaque paiement soutient directement le projet certifié de votre choix.')}
            </p>
          </div>
          <div className="md:ml-auto">
            <button 
              onClick={() => onViewChange('LEGAL_MENTIONS')}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-surface-dim transition-all whitespace-nowrap"
            >
              {t('VIEW COMPLIANCE', 'VOIR LA CONFORMITÉ')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
