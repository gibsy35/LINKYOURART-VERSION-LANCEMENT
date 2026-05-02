import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Star, Crown, ArrowRight, Globe, BarChart3, Building2, User, Info } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { FeatureShowcaseModal } from '../components/Modals';

import { PageHeader } from '../components/ui/PageHeader';

interface PricingViewProps {
  onSelectPlan: (plan: { name: string, price: number, billingCycle: 'monthly' | 'yearly' }) => void;
  onNotify?: (msg: string) => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan, onNotify }) => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showcaseFeature, setShowcaseFeature] = useState<'CREATOR' | 'INVESTOR' | 'PRO' | 'EXPERT_AUDIT' | 'LIQUIDITY_POOL' | 'PREDICTIVE_SCORE' | null>(null);

  const plans = [
    {
      id: 'CREATOR',
      name: t('Creator', 'Créateur'),
      monthlyPrice: 49,
      description: t('For individual artists and creators.', 'Pour les artistes et créateurs individuels.'),
      features: [
        t('Project indexing (up to 4)', 'Indexation de projets (jusqu\'à 4)'),
        t('LYA Score basic analysis', 'Analyse de base du Score LYA'),
        t('Standard P2P access (5% fee)', 'Accès P2P standard (frais de 5%)'),
        t('Basic portfolio tracking', 'Suivi de portefeuille de base'),
      ],
      color: 'primary-cyan',
      icon: <Zap size={24} />,
    },
    {
      id: 'INVESTOR',
      name: t('Investor', 'Investisseur'),
      monthlyPrice: 149,
      description: t('For active collectors and investors.', 'Pour les collectionneurs et investisseurs actifs.'),
      features: [
        t('Unlimited project tracking', 'Suivi de projets illimité'),
        t('Advanced market analytics', 'Analyses de marché avancées'),
        t('Reduced P2P fees (3%)', 'Frais P2P réduits (3%)'),
        t('Priority settlement access', 'Accès prioritaire au règlement'),
        t('LYA Academy access', 'Accès à l\'Académie LYA'),
      ],
      color: 'accent-gold',
      icon: <Star size={24} />,
      popular: true,
    },
    {
      id: 'PRO',
      name: t('Pro Personal', 'Pro Personnel'),
      monthlyPrice: 890,
      description: t('For independent professionals and agents.', 'Pour les professionnels et agents indépendants.'),
      features: [
        t('Professional audit tools', 'Outils d\'audit professionnel'),
        t('API access for valuation', 'Accès API pour l\'évaluation'),
        t('Lowest P2P fees (2%)', 'Frais P2P les plus bas (2%)'),
        t('White-label reporting', 'Rapports en marque blanche'),
        t('Dedicated account manager', 'Gestionnaire de compte dédié'),
      ],
      color: 'white',
      icon: <User size={24} />,
    },
    {
      id: 'PRO',
      name: t('Pro Enterprise', 'Pro Entreprise'),
      monthlyPrice: 5900,
      description: t('For galleries, studios, and agencies.', 'Pour les galeries, studios et agences.'),
      features: [
        t('Multi-user access (up to 10)', 'Accès multi-utilisateurs (jusqu\'à 10)'),
        t('Advanced compliance suite', 'Suite de conformité avancée'),
        t('Custom API integration', 'Intégration API personnalisée'),
        t('Direct market liquidity access', 'Accès à la liquidité du marché direct'),
        t('Full Academy certification', 'Certification complète de l\'Académie'),
      ],
      color: 'accent-purple',
      icon: <Building2 size={24} />,
    },
  ];

  const calculatePrice = (monthlyPrice: number) => {
    if (billingCycle === 'yearly') {
      // 10% discount for yearly, shown as annual total
      return Math.floor(monthlyPrice * 12 * 0.9);
    }
    return monthlyPrice;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-24 relative min-h-screen px-6 md:px-12">
      <PageHeader 
        titleWhite={t('Market', 'MARKET')}
        titleAccent={t('Pricing', 'PRICING')}
        description={t('UNLOCK ACCESS TO PROFESSIONAL DATA FEEDS, DEEP MARKET ANALYTICS, AND PROFESSIONAL SETTLEMENT INFRASTRUCTURE.', 'DÉBLOQUEZ L\'ACCÈS AUX FLUX DE DONNÉES PROFESSIONNELS, AUX ANALYSES DE MARCHÉ APPROFONDIES ET À L\'INFRASTRUCTURE DE RÈGLEMENT PROFESSIONNELLE.')}
        accentColor="text-primary-cyan"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-16 md:-mt-24 mb-12 relative z-20">
        {/* Billing Toggle */}
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
            <span className="absolute -top-2 -right-2 bg-accent-gold text-surface-dim text-[8px] px-1.5 py-0.5 font-black rounded-full">
              -10%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto pb-4">
        <div className="flex md:grid md:grid-cols-4 gap-6 min-w-[1000px] md:min-w-0">
          {plans.map((plan, i) => {
            const currentPrice = calculatePrice(plan.monthlyPrice);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-surface-high/40 border ${plan.popular ? 'border-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/10'} p-6 backdrop-blur-xl flex flex-col flex-1`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-gold text-surface-dim text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {t('Most Popular', 'Le Plus Populaire')}
                  </div>
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-6 ${
                  plan.color === 'accent-gold' 
                    ? 'bg-accent-gold/10 border border-accent-gold/30 text-accent-gold' 
                    : plan.color === 'accent-purple'
                    ? 'bg-accent-purple/10 border border-accent-purple/30 text-accent-purple'
                    : `bg-${plan.color}/10 border border-${plan.color}/30 text-${plan.color}`
                }`}>
                  {plan.icon}
                </div>

                <h3 className="text-xl font-black uppercase mb-1 tracking-tighter">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black">${currentPrice}</span>
                  <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/ {billingCycle === 'yearly' ? t('year', 'an') : t('month', 'mois')}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mb-6 leading-relaxed h-12 overflow-hidden">
                  {plan.description}
                </p>

                <button 
                  onClick={() => setShowcaseFeature(plan.id as any)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors mb-6"
                >
                  <Info size={12} />
                  {t('Learn More', 'En savoir plus')}
                </button>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check size={12} className="text-primary-cyan mt-0.5 shrink-0" />
                      <span className="text-[10px] text-on-surface/80 uppercase font-bold tracking-wide leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onSelectPlan({ name: plan.name, price: currentPrice, billingCycle })}
                  className={`w-full py-3 font-black uppercase text-xs tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-accent-gold text-surface-dim hover:bg-white' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-surface-dim'
                }`}>
                  {t('Get Started', 'Commencer')} <ArrowRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Comparison Section */}
      <div className="mt-32">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-[1px] w-12 bg-primary-cyan"></div>
          <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter text-on-surface uppercase">
            {t('Plan', 'Comparaison')} <span className="text-primary-cyan">{t('Comparison', 'Détaillée')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pro Personal Details */}
          <div className="bg-surface-low/30 border border-white/5 p-8 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">{t('Pro Personal', 'Pro Personnel')}</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{t('Individual Professional Excellence', 'Excellence Professionnelle Individuelle')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary-cyan uppercase tracking-widest border-b border-primary-cyan/20 pb-2">{t('Core Capabilities', 'Capacités Clés')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Advanced LYA Score breakdown', 'Décomposition avancée du Score LYA'),
                      t('Expert audit access', 'Accès à l\'audit d\'expert'),
                      t('Market sentiment analysis', 'Analyse du sentiment du marché'),
                      t('Custom portfolio alerts', 'Alertes de portefeuille personnalisées')
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-primary-cyan opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent-gold uppercase tracking-widest border-b border-accent-gold/20 pb-2">{t('Financial Benefits', 'Avantages Financiers')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('2% P2P Transaction fees', '2% de frais de transaction P2P'),
                      t('Priority settlement engine', 'Moteur de règlement prioritaire'),
                      t('Tax optimization reports', 'Rapports d\'optimisation fiscale'),
                      t('Direct equity lending', 'Prêt direct de fonds propres')
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-accent-gold opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Enterprise Details */}
          <div className="bg-surface-low/30 border border-accent-purple/20 p-8 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent-purple/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-accent-purple">{t('Pro Enterprise', 'Pro Entreprise')}</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{t('Professional Scale & Compliance', 'Échelle Professionnelle et Conformité')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary-cyan uppercase tracking-widest border-b border-primary-cyan/20 pb-2">{t('Enterprise Suite', 'Suite Entreprise')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Multi-seat management (10+)', 'Gestion multi-sièges (10+)'),
                      t('Full API & SDK access', 'Accès complet API et SDK'),
                      t('Custom compliance workflows', 'Flux de conformité personnalisés'),
                      t('White-label client portal', 'Portail client en marque blanche')
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-primary-cyan opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent-gold uppercase tracking-widest border-b border-accent-gold/20 pb-2">{t('Market Power', 'Puissance du Marché')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Direct liquidity pool access', 'Accès direct au pool de liquidité'),
                      t('Underwriting capabilities', 'Capacités de souscription'),
                      t('Bulk contract indexing', 'Indexation de contrats en masse'),
                      t('24/7 Professional support', 'Support professionnel 24/7')
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-accent-gold opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Upgrade Path */}
        <div className="mt-20 p-12 bg-gradient-to-br from-surface-high/40 to-surface-low/40 border border-white/5 rounded-sm">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-12 text-center">{t('The LinkYourArt Evolution', 'L\'Évolution LinkYourArt')}</h3>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-primary-cyan/20 via-accent-gold/20 to-accent-purple/20 hidden lg:block -translate-y-1/2" />
            
            {[
              { label: t('CREATOR', 'CRÉATEUR'), desc: t('Index & Validate', 'Indexer et Valider'), color: 'primary-cyan', icon: Zap },
              { label: t('INVESTOR', 'INVESTISSEUR'), desc: t('Collect & Grow', 'Collectionner et Croître'), color: 'accent-gold', icon: Star },
              { label: t('PRO', 'PRO'), desc: t('Audit & Scale', 'Auditer et Passer à l\'échelle'), color: 'white', icon: User },
              { label: t('ENTERPRISE', 'ENTREPRISE'), desc: t('Govern & Liquidate', 'Gouverner et Liquider'), color: 'accent-purple', icon: Building2 }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`w-16 h-16 rounded-full bg-surface-dim border-2 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 ${
                  step.color === 'primary-cyan' ? 'border-primary-cyan text-primary-cyan shadow-[0_0_20px_rgba(0,224,255,0.3)]' :
                  step.color === 'accent-gold' ? 'border-accent-gold text-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' :
                  step.color === 'accent-purple' ? 'border-accent-purple text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]' :
                  'border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                }`}>
                  <step.icon size={24} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest mb-1">{step.label}</h4>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-[1px] w-8 bg-accent-gold"></div>
            <div className="text-sm uppercase tracking-[0.4em] text-accent-gold font-serif flex items-center gap-2">
              {t('A La Carte Services', 'Services À La Carte')}
            </div>
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold opacity-60 mb-8 max-w-2xl">
            {t('Customize your professional experience with specialized add-on modules. Perfect for organizations requiring specific analytical depth.', 'Personnalisez votre expérience professionnelle avec des modules complémentaires spécialisés. Parfait pour les organisations nécessitant une profondeur d\'analyse spécifique.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('Market Access Plus', 'Accès Marché Plus'), price: '2,500', icon: Globe, desc: t('Global liquidity registry access', 'Accès aux registres de liquidité mondiaux') },
              { label: t('Risk Audit Pro', 'Audit de Risque Pro'), price: '1,200', icon: Shield, desc: t('Deep-dive compliance reports', 'Rapports de conformité approfondis') },
              { label: t('Portfolio AI', 'IA de Portefeuille'), price: '1,800', icon: Zap, desc: t('Automated rebalancing engine', 'Moteur de rééquilibrage automatisé') },
              { label: t('Tax & Legal Suite', 'Suite Fiscale et Juridique'), price: '950', icon: BarChart3, desc: t('Multi-jurisdictional reporting', 'Rapports multi-juridictionnels') },
            ].map((option, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl group hover:border-accent-gold/30 transition-all flex flex-col">
                <option.icon className="w-6 h-6 text-accent-gold mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{option.label}</h4>
                <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter mb-4 opacity-60">{option.desc}</p>
                <div className="flex items-baseline gap-1 mb-6 mt-auto">
                  <span className="text-2xl font-black text-accent-gold">${option.price}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">/ {t('year', 'an')}</span>
                </div>
                <button 
                  onClick={() => onNotify?.(t('SERVICE ADDED TO YOUR QUOTE', 'SERVICE AJOUTÉ À VOTRE DEVIS'))}
                  className="w-full py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold hover:text-surface-dim transition-all"
                >
                  {t('ADD TO PLAN', 'AJOUTER')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-8 bg-surface-highest/10 border border-white/5 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary-cyan/10 border border-primary-cyan/30 flex items-center justify-center rounded-full shrink-0">
                <Shield size={32} className="text-primary-cyan" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase mb-1 tracking-tighter">{t('P2P Transaction Fees', 'Frais de Transaction P2P')}</h4>
                <p className="text-sm text-on-surface-variant">
                  {t('LinkYourArt relies on a peer-to-peer exchange model. We charge a small fee on every successful trade to maintain the network and ensure settlement security.', 'LinkYourArt repose sur un modèle d\'échange de pair à pair. Nous prélevons une petite commission sur chaque transaction réussie pour maintenir le réseau et assurer la sécurité du règlement.')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-white/5 border border-white/10 text-center min-w-[140px]">
                <div className="text-2xl font-black text-primary-cyan whitespace-nowrap">2 - 5 %</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant whitespace-nowrap">{t('Per Trade', 'Par Échange')}</div>
              </div>
            </div>
        </div>
      </div>

      <FeatureShowcaseModal 
        isOpen={!!showcaseFeature} 
        onClose={() => setShowcaseFeature(null)} 
        featureName={showcaseFeature || 'PRO'} 
      />
    </div>
  );
};

export default PricingView;
