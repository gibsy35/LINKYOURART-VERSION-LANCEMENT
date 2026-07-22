import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Compass, Radar, Briefcase, ArrowRight, Globe, Shield, Zap, BarChart3 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

import { PageHeader } from '../components/ui/PageHeader';

interface PricingViewProps {
  onSelectPlan: (plan: { name: string, price: number, billingCycle: 'monthly' | 'yearly' }) => void;
  onNotify?: (msg: string) => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan, onNotify }) => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const calculatePrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    if (billingCycle === 'yearly') {
      return Math.floor(monthlyPrice * 12 * 0.9);
    }
    return monthlyPrice;
  };

  const tiers = [
    {
      id: 'DECOUVERTE',
      name: t('Discover', 'Découverte'),
      audience: t('Explore the Registry', 'Pour explorer le Registre'),
      monthlyPrice: 0,
      icon: <Compass size={22} />,
      accent: 'gray',
      features: [
        t('Browse the LYA Registry', 'Parcourir le Registre LYA'),
        t('Public LYA Score on certified projects', 'Score LYA public des projets certifiés'),
        t('Follow up to 3 creators', 'Suivre jusqu\'à 3 créateurs'),
      ],
      cta: t('Get started', 'Commencer'),
    },
    {
      id: 'INSIDER',
      name: t('Insider', 'Insider'),
      audience: t('For regular patrons', 'Pour les mécènes réguliers'),
      monthlyPrice: 9.99,
      icon: <Sparkles size={22} />,
      accent: 'purple',
      features: [
        t('Everything in Discover, plus:', 'Tout Découverte, plus :'),
        t('Unlimited creators followed', 'Suivi illimité de créateurs'),
        t('Deal Finder alerts', 'Alertes Deal Finder'),
        t('Contact certified creators', 'Contacter les créateurs certifiés'),
      ],
      cta: t('Switch to Insider', 'Passer à Insider'),
    },
    {
      id: 'INSIDER_PLUS',
      name: t('Insider+', 'Insider+'),
      audience: t('To follow the market closely', 'Pour suivre le marché de près'),
      monthlyPrice: 19.99,
      icon: <Radar size={22} />,
      accent: 'cyan',
      popular: true,
      features: [
        t('Everything in Insider, plus:', 'Tout Insider, plus :'),
        t('Unlimited Score Simulator', 'Simulateur de Score illimité'),
        t('Weekly AI executive summaries', 'Résumés IA hebdomadaires'),
        t('Priority access to new certifications', 'Accès prioritaire aux nouvelles certifications'),
      ],
      cta: t('Switch to Insider+', 'Passer à Insider+'),
    },
    {
      id: 'PRO',
      name: t('Pro', 'Pro'),
      audience: t('For industry professionals', 'Pour les professionnels'),
      monthlyPrice: 39.99,
      icon: <Briefcase size={22} />,
      accent: 'pink',
      features: [
        t('Everything in Insider+, plus:', 'Tout Insider+, plus :'),
        t('Swipe Discovery Pro (Deal Finder)', 'Swipe Discovery Pro (Deal Finder)'),
        t('Discounted Elite Due Diligence', 'Accès Due Diligence Elite à tarif réduit'),
        t('One monthly mentoring session included', '1 session de Mentorat mensuel incluse'),
      ],
      cta: t('Switch to Pro', 'Passer à Pro'),
    },
  ];

  const accentClasses: Record<string, { border: string; text: string; bg: string; solidBg: string; solidText: string; glow: string }> = {
    gray: {
      border: 'border-white/10',
      text: 'text-on-surface-variant',
      bg: 'bg-white/5',
      solidBg: 'bg-white/10 hover:bg-white/20',
      solidText: 'text-white',
      glow: '',
    },
    purple: {
      border: 'border-[#a78bfa]/25',
      text: 'text-[#a78bfa]',
      bg: 'bg-[#a78bfa]/10',
      solidBg: 'bg-[#a78bfa] hover:bg-white',
      solidText: 'text-surface-dim',
      glow: 'shadow-[0_0_25px_rgba(167,139,250,0.12)]',
    },
    cyan: {
      border: 'border-primary-cyan/40',
      text: 'text-primary-cyan',
      bg: 'bg-primary-cyan/10',
      solidBg: 'bg-primary-cyan hover:bg-white',
      solidText: 'text-surface-dim',
      glow: 'shadow-[0_0_30px_rgba(0,224,255,0.15)]',
    },
    pink: {
      border: 'border-[#f14c86]/25',
      text: 'text-[#f14c86]',
      bg: 'bg-[#f14c86]/10',
      solidBg: 'bg-[#f14c86] hover:bg-white',
      solidText: 'text-surface-dim',
      glow: 'shadow-[0_0_25px_rgba(241,76,134,0.12)]',
    },
  };

  const services = [
    { label: t('LYA Certification', 'Certification LYA'), price: '2,500', icon: Shield, desc: t('Official certification, committee review', 'Certification officielle, revue du comité') },
    { label: t('Elite Due Diligence', 'Due Diligence Elite'), price: '5,000', icon: BarChart3, desc: t('In-depth analysis, risk assessment', 'Analyse approfondie, évaluation des risques') },
    { label: t('Launch Strategy', 'Stratégie Lancement'), price: '3,500', icon: Zap, desc: t('Go-to-market: pricing, milestones', 'Go-to-market : tarification, jalons') },
    { label: t('Monthly Mentoring', 'Mentorat Mensuel'), price: null, icon: Globe, desc: t('Access to LYA-certified professionals', 'Accès aux professionnels certifiés LYA') },
  ];

  return (
    <div className="max-w-full max-w-7xl mx-auto space-y-8 pb-12 relative min-h-screen">
      <PageHeader
        titleWhite={t('Choose your', 'Choisissez votre')}
        titleAccent={t('LYA formula', 'formule LYA')}
        description={t('FROM FREE DISCOVERY TO PROFESSIONAL TOOLS — FIND THE ACCESS LEVEL THAT MATCHES HOW YOU USE THE REGISTRY.', 'DE LA DÉCOUVERTE GRATUITE AUX OUTILS PROFESSIONNELS — TROUVEZ LE NIVEAU D\'ACCÈS ADAPTÉ À VOTRE USAGE DU REGISTRE.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-16 md:-mt-24 mb-12 relative z-20">
        <div className="bg-surface-high/40 border border-white/10 p-1 rounded-sm flex items-center backdrop-blur-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              billingCycle === 'monthly' ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {t('Monthly', 'Mensuel')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              billingCycle === 'yearly' ? 'bg-primary-cyan text-surface-dim' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {t('Yearly', 'Annuel')}
            <span className="absolute -top-2 -right-2 bg-accent-gold text-surface-dim text-[10px] px-1.5 py-0.5 font-black rounded-full">
              -10%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, i) => {
          const currentPrice = calculatePrice(tier.monthlyPrice);
          const a = accentClasses[tier.accent];
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative bg-surface-high/40 border ${tier.popular ? a.border : 'border-white/10'} ${tier.popular ? a.glow : ''} p-5 sm:p-6 backdrop-blur-xl flex flex-col rounded-2xl`}
            >
              {tier.popular && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 ${a.solidBg} ${a.solidText} text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-full`}>
                  {t('Most popular', 'Le plus populaire')}
                </div>
              )}

              <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 ${a.bg} ${a.text} border ${a.border}`}>
                {tier.icon}
              </div>

              <h3 className={`text-lg font-black uppercase mb-1 tracking-tighter ${a.text}`}>{tier.name}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-4">{tier.audience}</p>

              <div className="flex items-baseline gap-1 flex-wrap mb-5">
                {tier.monthlyPrice === 0 ? (
                  <span className="text-2xl font-black text-white">{t('Free', 'Gratuit')}</span>
                ) : (
                  <>
                    <span className="text-2xl font-black text-white">{currentPrice}€</span>
                    <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/ {billingCycle === 'yearly' ? t('year', 'an') : t('month', 'mois')}</span>
                  </>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[11.5px] text-on-surface-variant leading-snug">
                    <Check size={13} className={`${a.text} shrink-0 mt-0.5`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan({ name: tier.name, price: currentPrice, billingCycle })}
                className={`w-full py-3 font-black uppercase text-xs tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2 rounded-xl ${
                  tier.accent === 'gray' ? 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-surface-dim' : `${a.solidBg} ${a.solidText}`
                }`}
              >
                {tier.cta} <ArrowRight size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 p-6 bg-surface-high/20 border border-white/5 rounded-2xl">
        <p className="text-xs text-on-surface-variant leading-relaxed text-center max-w-2xl mx-auto">
          <span className="font-black text-white">{t('Key takeaway: ', 'À retenir : ')}</span>
          {t('the LYA Score is neither a financial security nor a negotiable instrument. Every formula above gives access to discovery, certification and follow-up tools only — it is a quality and trust standard.', 'le Score LYA n\'est ni un titre financier, ni un instrument négociable. Chaque formule ci-dessus donne accès à des outils de découverte, de certification et de suivi uniquement — c\'est un standard de qualité et de confiance.')}
        </p>
      </div>

      <div className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-[1px] w-8 bg-accent-gold"></div>
          <div className="text-sm uppercase tracking-[0.4em] text-accent-gold font-serif flex items-center gap-2">
            {t('Premium Services', 'Services Premium')}
          </div>
        </div>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold opacity-60 mb-8 max-w-2xl">
          {t('Institutional-grade one-off services for professionals — certify, validate, mentor and discover the most promising creative projects.', 'Des outils de niveau institutionnel — certifier, valider, mentorer et découvrir les projets créatifs les plus prometteurs.')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((option, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl group hover:border-accent-gold/30 transition-all flex flex-col">
              <option.icon className="w-6 h-6 text-accent-gold mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{option.label}</h4>
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter mb-4 opacity-60">{option.desc}</p>
              <div className="flex items-baseline gap-1 mb-6 mt-auto">
                <span className="text-2xl font-black text-accent-gold">{option.price ? `€${option.price}` : t('Custom', 'Sur devis')}</span>
              </div>
              <button
                onClick={() => onNotify?.(t('✦ Request sent', '✦ Demande envoyée'))}
                className="w-full py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold hover:text-surface-dim transition-all rounded-lg"
              >
                {t('Request', 'Demander')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingView;
