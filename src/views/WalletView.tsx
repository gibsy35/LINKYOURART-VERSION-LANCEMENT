
import React, { useState } from 'react';
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawIban, setWithdrawIban] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm' | 'done'>('form');
  const [copied, setCopied] = useState(false);

  const cashBalance = 12450.75;
  const lyaUnits = 4850;

  const transactions = [
    { id: '1', type: 'DEPOSIT', amount: 2500, status: 'COMPLETED', date: '2026-05-15 14:22', method: 'SEPA Transfer' },
    { id: '2', type: 'PURCHASE', amount: -450, status: 'COMPLETED', date: '2026-05-14 09:15', method: 'Contract Acquisition' },
    { id: '3', type: 'REWARD', amount: 15.5, status: 'COMPLETED', date: '2026-05-13 23:59', method: 'Daily APY Distribution' },
    { id: '4', type: 'WITHDRAW', amount: -1000, status: 'PENDING', date: '2026-05-12 18:30', method: 'Bank Withdrawal' },
    { id: '5', type: 'SALE', amount: 320, status: 'COMPLETED', date: '2026-05-11 11:45', method: 'Contract Liquidation' },
  ];

  const handleCopyIban = () => {
    navigator.clipboard.writeText('FR76 3000 6000 0112 3456 7890 189').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadStatement = () => {
    downloadWalletStatement(transactions, user?.displayName || 'LYA MEMBER', cashBalance, lyaUnits);
    onNotify(t('PREMIUM STATEMENT GENERATED', 'RELEVÉ PREMIUM GÉNÉRÉ'));
  };

  const handleWithdrawSubmit = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      onNotify(t('Please enter a valid amount.', 'Veuillez saisir un montant valide.'));
      return;
    }
    if (parseFloat(withdrawAmount) > cashBalance) {
      onNotify(t('Insufficient balance.', 'Solde insuffisant.'));
      return;
    }
    if (!withdrawIban || withdrawIban.length < 14) {
      onNotify(t('Please enter a valid IBAN.', 'Veuillez saisir un IBAN valide.'));
      return;
    }
    setWithdrawStep('confirm');
  };

  const handleWithdrawConfirm = () => {
    setWithdrawStep('done');
    onNotify(t(`WITHDRAWAL OF ${formatPrice(parseFloat(withdrawAmount))} INITIATED`, `RETRAIT DE ${formatPrice(parseFloat(withdrawAmount))} INITIÉ`));
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        titleWhite={t('Security', 'Sécurité')}
        titleAccent={t('Wallet', 'Portefeuille')}
        description={t('MANAGE YOUR LIQUIDITY, REWARDS AND PAYMENT METHODS IN A SECURED CUSTODY ENVIRONMENT.', 'GÉREZ VOTRE LIQUIDITÉ, VOS RÉCOMPENSES ET VOS MOYENS DE PAIEMENT DANS UN ENVIRONNEMENT DE GARDE SÉCURISÉ.')}
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
                  <ShieldCheck size={14} /> {t('VERIFIED CUSTODY', 'GARDE VÉRIFIÉE')}
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('TOTAL LIQUIDITY', 'LIQUIDITÉ TOTALE')}</p>
                  <p className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white">{formatPrice(cashBalance)}</p>
                </div>
              </div>
              <div className="space-y-2 text-left md:text-right">
                <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] flex items-center gap-1.5 md:justify-end mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse inline-block" /> {t('LYA UNIT', 'UNITÉ LYA')}
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">{t('AVAILABLE LYA UNITS', 'UNITÉS LYA DISPONIBLES')}</p>
                  <p className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-accent-gold">
                    {Number(lyaUnits).toLocaleString(t('en-US', 'fr-FR'))} <span className="text-xs md:text-sm font-black uppercase text-on-surface-variant/60 tracking-wider">Units</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => onViewChange('PAYMENT')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-primary-cyan text-surface-dim rounded-3xl hover:bg-white transition-all shadow-xl active:scale-95 group"
              >
                <Plus size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('DEPOSIT', 'DÉPOSER')}</span>
              </button>
              <button 
                onClick={() => { setShowWithdrawModal(true); setWithdrawStep('form'); }}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white hover:text-surface-dim transition-all active:scale-95"
              >
                <ArrowUpRight size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('WITHDRAW', 'RETIRER')}</span>
              </button>
              <button 
                onClick={() => onViewChange('EXCHANGE')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white hover:text-surface-dim transition-all active:scale-95"
              >
                <ArrowDownLeft size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('BUY ASSETS', 'ACHETER')}</span>
              </button>
              <button 
                onClick={handleDownloadStatement}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white hover:text-surface-dim transition-all active:scale-95"
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
              <Zap size={14} /> {t('YIELD BOOSTER', 'BOOSTEUR DE RENDEMENT')}
            </h3>
            <p className="text-2xl font-black text-white font-headline tracking-tight mb-4">+8.4% <span className="text-xs uppercase text-on-surface-variant">APY</span></p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold leading-relaxed mb-8 opacity-60">
              {t('Your units are generating daily rewards through secondary market distribution.', 'Vos unités génèrent des récompenses quotidiennes via la distribution du marché secondaire.')}
            </p>
            <button 
              onClick={() => onViewChange('EXCHANGE')}
              className="w-full py-4 border border-accent-gold/30 text-accent-gold text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-accent-gold hover:text-surface-dim transition-all"
            >
              {t('COMPOUND REWARDS', 'RÉINVESTIR LES GAINS')}
            </button>
          </div>
        </div>
      </div>

      {/* LYA IBAN for deposit reference */}
      <div className="bg-surface-low border border-primary-cyan/20 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[9px] font-black text-primary-cyan uppercase tracking-[0.4em] mb-1">{t('SEPA DEPOSIT — YOUR LYA IBAN', 'VIREMENT SEPA — VOTRE IBAN LYA')}</p>
          <p className="text-sm font-black text-white tracking-widest font-mono">FR76 3000 6000 0112 3456 7890 189</p>
          <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest mt-1">{t('Reference: your email address', 'Référence : votre adresse email')}</p>
        </div>
        <button
          onClick={handleCopyIban}
          className="flex items-center gap-2 px-4 py-2 border border-primary-cyan/30 text-primary-cyan text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-cyan hover:text-surface-dim transition-all"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t('COPIED!', 'COPIÉ !') : t('COPY IBAN', 'COPIER IBAN')}
        </button>
      </div>

      <div className="flex gap-8 border-b border-white/5 mb-12">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'overview' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          {t('TRANSACTION HISTORY', 'HISTORIQUE DES TRANSACTIONS')}
          {activeTab === 'overview' && <motion.div layoutId="walletTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
        </button>
        <button 
          onClick={() => setActiveTab('cards')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'cards' ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          {t('PAYMENT METHODS', 'MOYENS DE PAIEMENT')}
          {activeTab === 'cards' && <motion.div layoutId="walletTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-cyan" />}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-surface-low border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-on-surface-variant border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('DATE', 'DATE')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('OPERATION', 'OPÉRATION')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('METHOD', 'MÉTHODE')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest">{t('STATUS', 'STATUT')}</th>
                  <th className="px-8 py-5 font-black uppercase tracking-widest text-right">{t('AMOUNT', 'MONTANT')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5 text-on-surface-variant">{tx.date}</td>
                    <td className="px-8 py-5 font-bold text-white uppercase tracking-widest">{t(tx.type, tx.type)}</td>
                    <td className="px-8 py-5 text-on-surface-variant uppercase tracking-widest font-black text-[10px]">{tx.method}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-accent-gold/10 text-accent-gold'
                      } border border-current/20 uppercase tracking-widest`}>
                        {t(tx.status, tx.status)}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
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
            <div className="absolute top-0 right-0 p-8 opacity-20"><Zap size={60} /></div>
            <div className="flex justify-between items-start">
              <CreditCard size={32} />
              <span className="text-[10px] font-black tracking-widest">LYA PREPAID</span>
            </div>
            <div>
              <p className="text-xl font-bold tracking-[0.2em] mb-2 leading-none">**** **** **** 8842</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] opacity-60 uppercase font-black tracking-tighter mb-1">CARD HOLDER</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">{user?.displayName?.toUpperCase() || 'VALUED MEMBER'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] opacity-60 uppercase font-black tracking-tighter mb-1">EXPIRES</p>
                  <p className="text-[10px] font-black tracking-widest">12/28</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onViewChange('PAYMENT')}
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
            <h3 className="text-xl font-black font-headline uppercase tracking-widest text-white leading-none">{t('SECURE CUSTODY PROTOCOL', 'PROTOCOLE DE GARDE SÉCURISÉE')}</h3>
            <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed uppercase font-bold tracking-tight opacity-60">
              {t('Your funds are held in isolated institutional-grade accounts. All withdrawals are subject to multi-factor authentication and anti-fraud neural analysis.', 'Vos fonds sont détenus dans des comptes isolés de qualité institutionnelle. Tous les retraits sont soumis à une authentification multi-facteurs et à une analyse neurale anti-fraude.')}
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

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdrawModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500]" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed inset-0 flex items-center justify-center p-4 z-[501] pointer-events-none">
              <div className="bg-[#0D1117] border border-white/10 w-full max-w-md pointer-events-auto p-8 font-mono relative">
                <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white"><X size={20} /></button>
                
                {withdrawStep === 'form' && (
                  <>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">{t('WITHDRAWAL REQUEST', 'DEMANDE DE RETRAIT')}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">{t('AMOUNT (€)', 'MONTANT (€)')}</label>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          max={cashBalance}
                          className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-primary-cyan transition-all font-mono"
                        />
                        <p className="text-[9px] text-on-surface-variant/40 mt-1 uppercase tracking-widest">{t('Available:', 'Disponible :')} {formatPrice(cashBalance)}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">{t('DESTINATION IBAN', 'IBAN DESTINATAIRE')}</label>
                        <input
                          type="text"
                          value={withdrawIban}
                          onChange={e => setWithdrawIban(e.target.value.toUpperCase())}
                          placeholder="FR76 ..."
                          className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-primary-cyan transition-all font-mono uppercase"
                        />
                      </div>
                      <button onClick={handleWithdrawSubmit} className="w-full py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">
                        {t('CONTINUE', 'CONTINUER')}
                      </button>
                    </div>
                  </>
                )}

                {withdrawStep === 'confirm' && (
                  <>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">{t('CONFIRM WITHDRAWAL', 'CONFIRMER LE RETRAIT')}</h2>
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between py-3 border-b border-white/5">
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">{t('Amount', 'Montant')}</span>
                        <span className="text-white font-black">{formatPrice(parseFloat(withdrawAmount))}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-white/5">
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">{t('IBAN', 'IBAN')}</span>
                        <span className="text-white font-black text-xs">{withdrawIban}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-white/5">
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">{t('Delay', 'Délai')}</span>
                        <span className="text-accent-gold font-black text-[10px]">1-3 {t('BUSINESS DAYS', 'JOURS OUVRÉS')}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setWithdrawStep('form')} className="flex-1 py-4 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                        {t('BACK', 'RETOUR')}
                      </button>
                      <button onClick={handleWithdrawConfirm} className="flex-1 py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">
                        {t('CONFIRM', 'CONFIRMER')}
                      </button>
                    </div>
                  </>
                )}

                {withdrawStep === 'done' && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={32} className="text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight mb-3">{t('REQUEST SUBMITTED', 'DEMANDE ENVOYÉE')}</h2>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest leading-relaxed mb-8">
                      {t('Your withdrawal is being processed. Funds will arrive within 1-3 business days.', 'Votre retrait est en cours de traitement. Les fonds arriveront sous 1 à 3 jours ouvrés.')}
                    </p>
                    <button onClick={() => setShowWithdrawModal(false)} className="w-full py-4 bg-primary-cyan text-surface-dim text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">
                      {t('CLOSE', 'FERMER')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
