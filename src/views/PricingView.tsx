import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, ShieldCheck, Star, Crown, ArrowRight, Building2, User, Info, Sparkles, Cpu, Layers, Search, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { FeatureShowcaseModal } from '../components/Modals';

import { PageHeader } from '../components/ui/PageHeader';
import { PRO_STARTER_PRICE_EUR, PRO_ADVANCED_PRICE_EUR, EXPRESS_48H_PRICE_EUR, EXPRESS_24H_PRICE_EUR } from '../lib/permissions';

interface PricingViewProps {
  onSelectPlan: (plan: { id: string, name: string, price: number, billingCycle: 'monthly' | 'yearly' }) => void;
  onNotify?: (msg: string) => void;
  onBecomeValidator?: () => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan, onNotify, onBecomeValidator }) => {
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showcaseFeature, setShowcaseFeature] = useState<'CREATOR' | 'PRO_STARTER' | 'PRO_ADVANCED' | 'EXPERT_AUDIT' | 'PATRON_ANALYTICS' | 'PREDICTIVE_SCORE' | null>(null);

  const [creativeField, setCreativeField] = useState('Cinema / Film / TV');
  const [customRole, setCustomRole] = useState('Producer / Showrunner');
  const [projectSize, setProjectSize] = useState('Medium Catalog (5-15 assets)');
  const [needsDesc, setNeedsDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<{
    analysis: string;
    recommendedPlanId: 'CREATOR' | 'PRO_STARTER' | 'PRO_ADVANCED' | 'PRO_ENTERPRISE';
    recommendedPlanName: string;
    primaryReason: string;
    estimatedMonthlyCost: number;
    suggestedAddons: Array<{ name: string; reason: string }>;
    projectedBenefits: string[];
    auditIndexScore: number;
  } | null>(null);

  const handleRunAssessment = async () => {
    setIsAnalyzing(true);
    setAssessmentResult(null);
    setAnalysisProgress('INITIALIZING LYA AI ECONOMIST BOT...');
    
    // Progressive terminal updates
    setTimeout(() => {
      setAnalysisProgress('ANALYZING INTELLECTUAL PROPERTY COMPLEXITY...');
    }, 1000);
    setTimeout(() => {
      setAnalysisProgress('CROSS-REFERENCING CROSS-BORDER COMPLIANCE AND SVOD CONTRACT PATTERNS...');
    }, 2200);
    setTimeout(() => {
      setAnalysisProgress('MATCHING LYA CERTIFICATION PATHWAYS AND REVIEW THRESHOLDS...');
    }, 3400);

    try {
      const response = await fetch('/api/gemini/pricing-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creativeField,
          role: customRole,
          projectSize,
          description: needsDesc,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Assessment request failed');
      }

      const data = await response.json();
      
      setTimeout(() => {
        setAssessmentResult(data);
        setIsAnalyzing(false);
        setAnalysisProgress('');
        if (onNotify) {
          onNotify(t('AI ANALYSIS COMPLETE. CUSTOMIZED OPTIMAL QUOTE GENERATED.', 'ANALYSE IA COMPLÈTE. DEVIS OPTIMISÉ SUR-MESURE GÉNÉRÉ !'));
        }
      }, 4500);

    } catch (error) {
      console.error("Assessment Failed:", error);
      setTimeout(() => {
        setAssessmentResult({
          analysis: "Votre profil dans le domaine de la création reflète des besoins de certification et de reconnaissance objective. Notre analyse de vos activités indique une excellente opportunité de valorisation de votre propriété intellectuelle et de vos droits d'auteur via les modules de certification de LinkYourArt.",
          recommendedPlanId: projectSize.includes('Enterprise') ? 'PRO_ENTERPRISE' : customRole.includes('Producer') || creativeField.includes('Cinema') ? 'PRO_ADVANCED' : 'PRO_STARTER',
          recommendedPlanName: projectSize.includes('Enterprise') ? 'Entreprise Institutionnelle' : customRole.includes('Producer') || creativeField.includes('Cinema') ? 'Pro Avancé' : 'Pro Starter',
          primaryReason: "Recommandé pour optimiser d'importants portefeuilles de propriété intellectuelle avec rapports personnalisés pour les partenaire créatifs.",
          estimatedMonthlyCost: projectSize.includes('Enterprise') ? 15000 : customRole.includes('Producer') || creativeField.includes('Cinema') ? PRO_ADVANCED_PRICE_EUR : PRO_STARTER_PRICE_EUR,
          suggestedAddons: [
            { name: "Risk Audit Pro", reason: "Sécurise l'audit préliminaire de vos contrats d'exploitation de manière automatisée." },
            { name: "Tax & Legal Suite", reason: "Idéal pour structurer les rapports multi-pays issus de la diffusion de vos œuvres." }
          ],
          projectedBenefits: [
            "Certification fluide de vos droits d'exploitation en adéquation totale avec vos activités d'artiste.",
            "Reconnaissance et contreparties personnelles via des projets certifiés et transparents.",
            "Connexion directe avec un réseau mondial de mécènes et de partenaires certifiés."
          ],
          auditIndexScore: 84
        });
        setIsAnalyzing(false);
        setAnalysisProgress('');
      }, 4500);
    }
  };

  const plans = [
    {
      id: 'CREATOR',
      name: t('Creator', 'Créateur'),
      monthlyPrice: 0,
      description: t('Certify your own work. Free forever, no hidden limits on discovery or patronage.', 'Certifiez vos propres créations. Gratuit à vie, aucune limite cachée sur la découverte ou le mécénat.'),
      features: [
        t('Project submission (up to 3)', 'Soumission de projets (jusqu\'à 3)'),
        t('Extra certifications at €5 each', 'Certifications supplémentaires à 5€ l\'unité'),
        t('LYA Score basic analysis', 'Analyse de base du Score LYA'),
        t('Free certification', 'Certification gratuite'),
      ],
      color: 'primary-cyan',
      icon: <Zap size={24} />,
    },
    {
      id: 'PRO_STARTER',
      name: t('Pro Starter', 'Pro Starter'),
      monthlyPrice: PRO_STARTER_PRICE_EUR,
      description: t('For independent professionals sourcing and certifying creative work.', 'Pour les professionnels indépendants qui sourcent et certifient des créations.'),
      features: [
        t('Unlimited project submissions', 'Soumissions de projets illimitées'),
        t('Full Registry access', 'Accès complet au Registre'),
        t('Professional validation tools', 'Outils de validation professionnelle'),
        t('Priority review queue', 'File de revue prioritaire'),
      ],
      color: 'accent-gold',
      icon: <Star size={24} />,
      popular: true,
    },
    {
      id: 'PRO_ADVANCED',
      name: t('Pro Advanced', 'Pro Avancé'),
      monthlyPrice: PRO_ADVANCED_PRICE_EUR,
      description: t('Everything in Starter, plus API access and dedicated support.', 'Tout Starter, plus l\'accès API et un accompagnement dédié.'),
      features: [
        t('Everything in Pro Starter', 'Tout Pro Starter'),
        t('API access for certification', 'Accès API pour la certification'),
        t('White-label reporting', 'Rapports en marque blanche'),
        t('Dedicated account manager', 'Gestionnaire de compte dédié'),
      ],
      color: 'accent-pink',
      icon: <User size={24} />,
    },
    {
      id: 'PRO_ENTERPRISE',
      name: t('Institutional Enterprise', 'Entreprise Institutionnelle'),
      monthlyPrice: 15000,
      description: t('Strategic infrastructure for major studios, publishers, and labels. Dedicated support with 24/7 priority access.', 'Infrastructure stratégique pour les grands studios, éditeurs et labels. Support dédié avec accès prioritaire 24/7.'),
      features: [
        t('Full Catalog Certification & Migration', 'Certification et Migration de Catalogue Complet'),
        t('Externalized Editorial Management', 'Gestion Éditoriale Externalisée'),
        t('Custom Certification Workflow', 'Processus de Certification Personnalisé'),
        t('Governance & Lounge access included', 'Accès Gouvernance & Salon inclus'),
        t('Advanced LYA Reporting', 'Rapports Avancés LYA'),
      ],
      color: 'accent-purple',
      icon: <Building2 size={24} />,
    },
    {
      id: 'VALIDATOR_PRO',
      name: t('Certified Validator', 'Validateur Certifié'),
      monthlyPrice: 0,
      description: t('Not a plan you pay for — a professional accreditation. Certify creative work and get paid for every review, Standard or Express.', 'Ce n\'est pas un forfait que vous payez — une accréditation professionnelle. Certifiez des œuvres et soyez rémunéré pour chaque revue, Standard ou Express.'),
      features: [
        t('Standard certification: always free to review, always paid', 'Certification standard\u00a0: toujours gratuite à traiter, toujours rémunérée'),
        t('LYA Express: priority jobs, higher payout', 'LYA Express\u00a0: dossiers prioritaires, rémunération plus élevée'),
        t('4 tiers: Bronze → Platine, paid automatically', '4 paliers\u00a0: Bronze → Platine, rémunérés automatiquement'),
        t('Funded by the Validator Remuneration Fund', 'Financé par le Fonds de Rémunération des Validateurs'),
      ],
      color: 'emerald-400',
      icon: <ShieldCheck size={24} />,
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
    <div className="max-w-full max-w-7xl mx-auto space-y-8 pb-12 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Platform', 'Modèles de')}
        titleAccent={t('Pricing', 'Tarification')}
        description={t('DISCOVERY AND PATRONAGE ARE FREE FOR EVERYONE. PROFESSIONAL TIERS UNLOCK CERTIFICATION TOOLING FOR SOURCING AND AUDITING WORK AT SCALE.', 'LA DÉCOUVERTE ET LE MÉCÉNAT SONT GRATUITS POUR TOUS. LES PALIERS PROFESSIONNELS DÉBLOQUENT LES OUTILS DE CERTIFICATION POUR SOURCER ET AUDITER À GRANDE ÉCHELLE.')}
        accentColor="text-primary-cyan"
      />

      {/* Free tier banner — deliberately placed before any paid plan so the
          page reads "open platform with a pro option", not "paid platform
          with a free trial". Discovery/patronage have no card of their own
          below because they aren't a plan to choose — they're just how the
          platform works, for everyone, always. */}
      <div className="relative z-20 border border-emerald-400/25 bg-emerald-400/[0.04] rounded-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
        <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0">
          <Star size={22} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-1">
            {t('Discovery & Patronage — Free & Unlimited, For Everyone', 'Découverte & Mécénat — Gratuits et Illimités, Pour Tous')}
          </h3>
          <p className="text-xs md:text-sm text-on-surface-variant/70 leading-relaxed max-w-2xl">
            {t('Browse the Registry, follow certified projects and support the creators you believe in — no account tier, no monthly fee, no cap. Like Kickstarter, LYA never charges the person giving money; the platform only takes a 5% commission on successful patronage.', 'Parcourez le Registre, suivez des projets certifiés et soutenez les créateurs auxquels vous croyez — sans palier de compte, sans abonnement, sans plafond. Comme Kickstarter, LYA ne fait jamais payer la personne qui soutient ; la plateforme prélève seulement une commission de 5% sur le mécénat abouti.')}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-4 mb-4 relative z-20">
        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50">
          {t('Professional tiers — for sourcing, auditing & scale', 'Paliers professionnels — pour sourcer, auditer et passer à l\'échelle')}
        </p>
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
            <span className="absolute -top-2 -right-2 bg-accent-gold text-surface-dim text-[10px] px-1.5 py-0.5 font-black rounded-full">
              -10%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto md:overflow-visible pb-4 pt-5 -mt-5">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 min-w-full max-w-6xl overflow-x-auto md:min-w-0 md:overflow-visible pt-5 -mt-5">
          {plans.map((plan, i) => {
            const currentPrice = calculatePrice(plan.monthlyPrice);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-surface-high/40 border ${
                  plan.popular ? 'border-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]' :
                  plan.color === 'accent-purple' ? 'border-accent-purple/30' :
                  plan.color === 'accent-pink' ? 'border-accent-pink/30' :
                  plan.color === 'primary-cyan' ? 'border-primary-cyan/25' :
                  plan.color === 'emerald-400' ? 'border-emerald-400/30 shadow-[0_0_30px_rgba(52,211,153,0.08)]' :
                  'border-white/10'
                } p-5 sm:p-6 backdrop-blur-xl flex flex-col`}
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
                    : plan.color === 'accent-pink'
                    ? 'bg-accent-pink/10 border border-accent-pink/30 text-accent-pink'
                    : plan.color === 'emerald-400'
                    ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400'
                    : `bg-${plan.color}/10 border border-${plan.color}/30 text-${plan.color}`
                }`}>
                  {plan.icon}
                </div>

                <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight mb-1 min-h-[56px] flex items-start ${
                  plan.color === 'accent-gold' ? 'text-accent-gold' :
                  plan.color === 'accent-purple' ? 'text-accent-purple' :
                  plan.color === 'accent-pink' ? 'text-accent-pink' :
                  plan.color === 'emerald-400' ? 'text-emerald-400' :
                  'text-primary-cyan'
                }`}>{plan.name}</h3>
                <div className="flex flex-col justify-end mb-4 min-h-[76px]">
                  {plan.id === 'PRO_ENTERPRISE' ? (
                    <div>
                      <span className="text-2xl font-black text-accent-purple tracking-widest block uppercase leading-none">{t('Custom Quote', 'Sur Devis')}</span>
                      <span className="text-[10px] text-on-surface-variant/75 uppercase tracking-[0.2em] font-black block mt-2">{t('Enterprise Private Node / Dedicated Node', 'Nœud d\'infrastructure Élite / Nœud Dédié')}</span>
                    </div>
                  ) : plan.id === 'VALIDATOR_PRO' ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter uppercase leading-none">{t('Free', 'Gratuit')}</span>
                        <span className="text-[9px] text-on-surface-variant/60 uppercase font-bold tracking-widest">{t('Standard review', 'Revue standard')}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-accent-gold tracking-tighter">{EXPRESS_48H_PRICE_EUR}€–{EXPRESS_24H_PRICE_EUR}€</span>
                        <span className="text-[9px] text-on-surface-variant/60 uppercase font-bold tracking-widest">{t('LYA Express payout', 'Rémunération Express')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-3xl font-black">{formatPrice(currentPrice)}</span>
                      <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/ {billingCycle === 'yearly' ? t('year', 'an') : t('month', 'mois')}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant mb-6 leading-relaxed h-12 overflow-hidden">
                  {plan.description}
                </p>

                {plan.id === 'VALIDATOR_PRO' ? (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-emerald-400 mb-4 sm:mb-6">
                    <ShieldCheck size={12} />
                    {t('Bronze → Platine, paid monthly', 'Bronze → Platine, payé chaque mois')}
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowcaseFeature(plan.id as any)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-primary-cyan hover:text-white transition-colors mb-4 sm:mb-6"
                  >
                    <Info size={12} />
                    {t('Learn More', 'En savoir plus')}
                  </button>
                )}

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check size={12} className={`mt-0.5 shrink-0 ${
                        plan.color === 'accent-gold' ? 'text-accent-gold' :
                        plan.color === 'accent-purple' ? 'text-accent-purple' :
                        plan.color === 'accent-pink' ? 'text-accent-pink' :
                        plan.color === 'emerald-400' ? 'text-emerald-400' :
                        'text-primary-cyan'
                      }`} />
                      <span className="text-[10px] text-on-surface/80 uppercase font-bold tracking-wide leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="min-h-[96px] flex flex-col justify-start">
                  <button 
                    onClick={() => {
                      if (plan.id === 'PRO_ENTERPRISE') {
                        onSelectPlan({ id: plan.id, name: plan.name, price: currentPrice, billingCycle });
                      } else if (plan.id === 'VALIDATOR_PRO') {
                        onBecomeValidator?.();
                      } else {
                        onSelectPlan({ id: plan.id, name: plan.name, price: currentPrice, billingCycle });
                      }
                    }}
                    className={`w-full py-3 font-black uppercase text-xs tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    plan.id === 'PRO_ENTERPRISE'
                      ? 'bg-accent-purple/90 text-white shadow-lg shadow-accent-purple/20 hover:bg-white hover:text-surface-dim'
                      : plan.id === 'VALIDATOR_PRO'
                      ? 'bg-emerald-400/90 text-surface-dim shadow-lg shadow-emerald-400/20 hover:bg-white'
                      : plan.popular 
                      ? 'bg-accent-gold text-surface-dim hover:bg-white' 
                      : plan.color === 'accent-pink'
                      ? 'bg-accent-pink/90 text-white shadow-lg shadow-accent-pink/20 hover:bg-white hover:text-surface-dim'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-surface-dim'
                  }`}>
                    {plan.id === 'PRO_ENTERPRISE' ? t('Submit Request', 'Contacter Notre Conseil') : plan.id === 'VALIDATOR_PRO' ? t('Apply for Accreditation', 'Candidater à l\'Accréditation') : t('Get Started', 'Commencer')} <ArrowRight size={14} />
                  </button>
                  {plan.id === 'CREATOR' && (
                    <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold tracking-wide text-center mt-3">
                      {t('More than 3 projects? Add extra certifications for €5 each — no need to change plan.', 'Plus de 3 projets\u00a0? Ajoutez des certifications supplémentaires à 5€ chacune — sans changer de forfait.')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* LYA AI Needs & Services Assessment Engine */}
      <div id="ai-pricing-assessment" className="mt-20 border border-primary-cyan/25 bg-gradient-to-br from-surface-high/60 to-surface-low/60 p-6 md:p-8 relative overflow-hidden">
        {/* Ambient Neon Backplates */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-cyan/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-cyan/10 border border-primary-cyan/30 flex items-center justify-center text-primary-cyan shrink-0">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <span className="text-white">{t('AI NEEDS SEARCH ENGINE', 'MOTEUR DE RECHERCHE IA')}</span>
                  <span className="text-primary-cyan">& {t('CUSTOM QUOTE', 'DEVIS SUR-MESURE')}</span>
                </h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-black leading-tight">
                  {t('Tailored Creative Certification & Recognition Service Recommendation Engine', 'Moteur d’évaluation de vos besoins de certification et recommandations par IA')}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-primary-cyan/10 border border-primary-cyan/30 text-[10px] font-black uppercase tracking-wider text-primary-cyan self-start md:self-auto">
              {t('INTELLIGENT CERTIFICATION MODEL V3.5 ACTIVE', 'MODÈLE DE CERTIFICATION LYA ACTIF V3.5')}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Selection Panel (Col 2) */}
            <div className="lg:col-span-2 space-y-6 bg-surface-dim/70 border border-white/5 p-6 rounded-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary-cyan block">
                  {t('1. Creative Discipline / Industry', '1. Discipline Créative / Secteur')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'Cinema / Film / TV', label: t('Cinema / Series', 'Cinéma / Séries') },
                    { id: 'Music / Sound', label: t('Music / Masters', 'Musique / Catalogues') },
                    { id: 'Podcast / Digital Audio', label: t('Podcast / Audio', 'Podcasts / Créateurs') },
                    { id: 'Visual Arts / Fine Art', label: t('Fine Art / Exhibition', 'Arts Visuels / Musées') },
                    { id: 'Performing Arts / Theatre', label: t('Theatrical / Shows', 'Spectacles / Théâtres') },
                    { id: 'Multidisciplinary IP', label: t('Multidisciplinary IP', 'PI Multidisciplinaire') }
                  ].map((field) => (
                    <button
                      key={field.id}
                      onClick={() => setCreativeField(field.id)}
                      className={`px-3 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-left border transition-all ${
                        creativeField === field.id
                          ? 'bg-primary-cyan text-surface-dim border-primary-cyan shadow-[0_0_10px_rgba(0,224,255,0.2)]'
                          : 'bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:border-white/20'
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary-cyan block">
                  {t('2. Your Ecosystem Role', '2. Votre Rôle dans l’Écosystème')}
                </label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-surface-high border border-white/10 pl-3 pr-9 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-primary-cyan rounded-none truncate"
                >
                  <option value="Independent Creator / Composer / Writer">{t('Independent Creator / Composer / Writer', 'Créateur / Compositeur / Auteur Indépendant')}</option>
                  <option value="Film Producer / Showrunner / Broadcaster">{t('Film Producer / Showrunner / Broadcaster', 'Producteur de Cinéma / Showrunner / Diffuseur')}</option>
                  <option value="Talent Agent / Rights Manager / Appraiser">{t('Talent Agent / Rights Manager / Appraiser', 'Agent Artistique / Gestionnaire de Droits')}</option>
                  <option value="Private Collector / Creative Patron / Backer">{t('Private Collector / Creative Patron / Backer', 'Collectionneur / Mécène')}</option>
                  <option value="Record Label / Movie Studio / Major Publisher">{t('Studio, Label, or Major Publisher', 'Label, Studio de Cinéma, ou Giga Éditeur')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary-cyan block">
                  {t('3. IP Portfolio Volume / Scale', '3. Volume / Échelle de votre Catalogue')}
                </label>
                <select
                  value={projectSize}
                  onChange={(e) => setProjectSize(e.target.value)}
                  className="w-full bg-surface-high border border-white/10 pl-3 pr-9 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-primary-cyan rounded-none truncate"
                >
                  <option value="Single Small Scale (1-4 assets)">{t('Single Premium Work (1-4 assets)', 'Œuvre unique / Petit catalogue (1 à 4 actifs)')}</option>
                  <option value="Medium Catalog (5-20 assets)">{t('Medium scale IP portfolio (5-20 assets)', 'Portefeuille de droits moyen (5 à 20 actifs)')}</option>
                  <option value="Multiple Large-Scale assets (21-100 IP contracts)">{t('Large scale library (21-100 IP contracts)', 'Catalogue d’envergure (21 à 100 contrats)')}</option>
                  <option value="Enterprise / Historical Heritage Catalog (100+ items)">{t('Historical Heritage / Major Catalog (100+ assets)', 'Patrimoine historique / Label Studio (100+ actifs)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary-cyan block">
                  {t('4. Describe Your Special Objectives', '4. Décrivez vos objectifs particuliers')}
                </label>
                <textarea
                  value={needsDesc}
                  onChange={(e) => setNeedsDesc(e.target.value)}
                  placeholder={t('Example: I want to certify my 15-track documentary music library and get it recognized by patrons and industry professionals...', 'Exemple: Je veux certifier mon catalogue de 15 musiques de films et le faire reconnaître par des mécènes et professionnels du secteur...')}
                  className="w-full bg-surface-high border border-white/10 px-3 py-2.5 text-xs text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary-cyan h-24 resize-none rounded-none"
                />
              </div>

              <button
                onClick={handleRunAssessment}
                disabled={isAnalyzing}
                className={`w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-none ${
                  isAnalyzing
                    ? 'bg-white/10 border border-white/20 text-on-surface-variant cursor-wait'
                    : 'bg-primary-cyan text-surface-dim hover:bg-white hover:shadow-[0_0_25px_rgba(0,224,255,0.4)] active:scale-95'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    {t('AI EVALUATING...', 'ÉVALUATION IA EN COURS...')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {t('Run IA Search & Generate Quote', 'Lancer la Recherche IA & Générer Devis')}
                  </>
                )}
              </button>
            </div>

            {/* AI Output Terminal Panel (Col 3) */}
            <div className="lg:col-span-3 min-h-[400px] border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col justify-between relative">
              
              {/* If idle */}
              {!isAnalyzing && !assessmentResult && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Cpu size={36} className="text-on-surface-variant/40 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    {t('LAUNCH ASSISTANT TO DETERMINE TAILORED FORMULA & PRICING', 'LANCEZ L’ANALYSE POUR CALCULER VOTRE PRE-DEVIS SUR-MESURE')}
                  </p>
                  <p className="text-xs text-on-surface-variant/60 uppercase max-w-sm mt-2 leading-relaxed">
                    {t('Our LYA Assistant AI will cross-reference your specific Creative Field, Scale of Projects, and licensing structures to generate an immediate live proposal and highlight matching subscription levels.', 'Notre IA croisera votre secteur de création, le volume de votre catalogue et les structures de licence pour générer une proposition de certification immédiate.')}
                  </p>
                </div>
              )}

              {/* Progress Terminal */}
              {isAnalyzing && (
                <div className="h-full flex flex-col justify-center font-mono text-[10px] text-primary-cyan space-y-4 p-4 bg-black/60 border border-primary-cyan/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-cyan rounded-full animate-ping" />
                    <span className="tracking-widest font-black uppercase">{t('LYA CENTRAL INTELLIGENCE NODE CONNECTED', 'NŒUD DE CONFORMITÉ LYA CONNECTÉ')}</span>
                  </div>
                  <div className="space-y-1.5 opacity-90 border-t border-white/15 pt-3">
                    <p className="text-white/60">&gt;&nbsp;&nbsp;[CONN] 0x9320AC COMPILER INITIALIZING...</p>
                    <p className="text-white/60">&gt;&nbsp;&nbsp;[EVAL] SECTOR: {creativeField.toUpperCase()}</p>
                    <p className="text-white/60">&gt;&nbsp;&nbsp;[ROLE] {customRole.toUpperCase()}</p>
                    <p className="text-white/60">&gt;&nbsp;&nbsp;[SIZE] {projectSize.toUpperCase()}</p>
                    <p className="text-primary-cyan animate-pulse mt-4 font-black">&gt;&nbsp;&nbsp;STATUS:&nbsp;&nbsp;{analysisProgress}</p>
                  </div>
                  <div className="w-full bg-white/5 h-[3px] overflow-hidden mt-6">
                    <div className="bg-primary-cyan h-full animate-[shimmer_2s_infinite] w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Assessment Report (JSON Result) */}
              {assessmentResult && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] bg-primary-cyan/20 border border-primary-cyan/40 px-3 py-0.5 font-bold uppercase tracking-widest text-primary-cyan rounded-full">
                        {t('AI Econometric Recommendation', 'Recommandation Économétrique IA')}
                      </span>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2">
                        {t('Optimal Subscription:', 'Forfait Recommandé :')} <span className="text-primary-cyan">{assessmentResult.recommendedPlanName}</span>
                      </h4>
                    </div>
                    <div className="bg-surface-high border border-white/10 px-4 py-2 text-right">
                      <span className="text-[10px] text-on-surface-variant block uppercase font-black tracking-widest">{t('ESTIMATED COST', 'COÛT ESTIMATIF')}</span>
                      <span className="text-xl font-black text-white">
                        {assessmentResult.estimatedMonthlyCost === 15000 
                          ? t('Custom Quote', 'Sur Devis') 
                          : `${formatPrice(assessmentResult.estimatedMonthlyCost)}/${billingCycle === 'yearly' ? t('year', 'an') : t('month', 'mois')}`}
                      </span>
                    </div>
                  </div>

                  {/* Summary/Analysis text */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                      <Cpu size={12} className="text-primary-cyan" />
                      {t('Ecosystem Diagnostic Report', 'Rapport de Diagnostic d’Écosystème')}
                    </h5>
                    <p className="text-[11px] text-on-surface/95 leading-relaxed text-justify bg-white/5 p-4 border-l-2 border-primary-cyan">
                      {assessmentResult.analysis}
                    </p>
                  </div>

                  {/* Matching score slider info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 p-4">
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant block">
                        {t('ESTIMATED CERTIFICATION READINESS', 'INDICE DE PRÉPARATION À LA CERTIFICATION')}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-accent-gold to-primary-cyan h-full" 
                            style={{ width: `${assessmentResult.auditIndexScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-primary-cyan font-mono">{assessmentResult.auditIndexScore}%</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/75 block">
                        {t('Score representing how ready your project is for certification review.', 'Indice représentant le niveau de préparation de votre projet à la revue de certification.')}
                      </span>
                    </div>
                    
                    <div className="border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center">
                      <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest block">{t('PRIMARY REASON', 'MOTIF CLÉ')}</span>
                      <p className="text-xs text-accent-gold font-bold leading-tight mt-1">
                        {assessmentResult.primaryReason}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Addons & Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        <CheckCircle size={10} className="text-accent-gold" />
                        {t('Forecasted Platform Benefits', 'Retombées Plateforme Estimées')}
                      </h5>
                      <ul className="space-y-1 text-on-surface/85">
                        {(assessmentResult.projectedBenefits || []).map((b, i) => (
                          <li key={i} className="text-xs font-black uppercase tracking-wider flex items-start gap-1.5 leading-snug">
                            <span className="text-primary-cyan text-xs leading-none">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        <Layers size={10} className="text-primary-cyan" />
                        {t('Suggested Specialty Modules', 'Modules Certifiés Suggérés')}
                      </h5>
                      <div className="space-y-2">
                        {(assessmentResult.suggestedAddons || []).map((addon, i) => (
                          <div key={i} className="p-2 bg-white/5 border border-white/5 rounded-sm">
                            <span className="text-xs font-black text-accent-gold block uppercase tracking-wider">{addon.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase leading-tight mt-0.5 block">{addon.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick checkout actions & custom quote redirection */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
                    
                    <button
                      onClick={() => {
                        onSelectPlan({
                          id: assessmentResult.recommendedPlanId,
                          name: assessmentResult.recommendedPlanId === 'CREATOR' ? t('Creator', 'Créateur') :
                                assessmentResult.recommendedPlanId === 'PRO_STARTER' ? t('Pro Starter', 'Pro Starter') :
                                assessmentResult.recommendedPlanId === 'PRO_ADVANCED' ? t('Pro Advanced', 'Pro Avancé') : t('Institutional Enterprise', 'Entreprise Institutionnelle'),
                          price: assessmentResult.estimatedMonthlyCost,
                          billingCycle
                        });
                      }}
                      className="w-full sm:flex-1 py-3 bg-primary-cyan text-surface-dim font-black uppercase text-[10px] tracking-wider transition-all hover:bg-white active:scale-95 flex items-center justify-center gap-2 rounded-none"
                    >
                      {t('Activate Recommended Subscription', 'Activer l’Abonnement Recommandé')}
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => {
                        if (onNotify) {
                          onNotify(t('FORM VALIDATED. EXPERT LYA DOSSIER GENERATED. CORRESPONDENCE SENT BY E-MAIL.', 'DEVIS VALIDÉ & TRANSMIS ! ENVOI DE CORRESPONDANCE ET ACCORD DE CONFIDENTIALITÉ EN COURS.'));
                        }
                      }}
                      className="w-full sm:flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white hover:text-surface-dim text-white font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 rounded-none"
                    >
                      <Send size={12} />
                      {t('Send Custom Quote & Non-Disclosure Contract', 'M’envoyer ce Devis & Accord NDA par Mail')}
                    </button>

                  </div>
                </motion.div>
              )}
            </div>
          </div>
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
                      t('Community engagement analytics', 'Analyses d\'engagement communautaire'),
                      t('Custom project alerts', 'Alertes de projet personnalisées'),
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-primary-cyan opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent-gold uppercase tracking-widest border-b border-accent-gold/20 pb-2">{t('Professional Benefits', 'Avantages Professionnels')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Priority review queue', 'File de revue prioritaire'),
                      t('Dedicated certification support', 'Support de certification dédié'),
                      t('Tax & legal compliance reports', 'Rapports de conformité fiscale et juridique'),
                      t('White-label client reporting', 'Rapports en marque blanche pour vos clients'),
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

          {/* Institutional Enterprise Details */}
          <div className="bg-surface-low/30 border border-accent-purple/20 p-8 rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent-purple/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-accent-purple">{t('Institutional Enterprise', 'Entreprise Institutionnelle')}</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{t('Certification Management & Externalized Validation', 'Gestion de Certification et Validation Externalisée')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary-cyan uppercase tracking-widest border-b border-primary-cyan/20 pb-2">{t('Operational Impact', 'Impact Opérationnel')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Global Catalog Onboarding', 'Onboarding de Catalogue Global'),
                      t('Editorial Cost Optimization', 'Optimisation des Coûts Éditoriaux'),
                      t('Automated Initial Vetting', 'Vérification Initiale Automatisée'),
                      t('Externalized IP Acquisition', 'Acquisition d\'IP Externalisée')
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase font-bold tracking-wide">
                        <div className="w-4 h-[1px] bg-primary-cyan opacity-40" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent-gold uppercase tracking-widest border-b border-accent-gold/20 pb-2">{t('Decision Support', 'Soutien à la Décision')}</h4>
                  <ul className="space-y-3">
                    {[
                      t('Real-time Certification index', 'Indice de Certification en tps réel'),
                      t('Predictive Performance data', 'Données de Performance Prédictives'),
                      t('Institutional Access Suite', 'Suite d\'Accès Institutionnel'),
                      t('Master Registry Access', 'Accès au Registre Maître'),
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
              { label: t('PATRON', 'MÉCÈNE'), desc: t('Discover & Support', 'Découvrir et Soutenir'), color: 'accent-gold', icon: Star },
              { label: t('PRO', 'PRO'), desc: t('Audit & Scale', 'Auditer et Passer à l\'échelle'), color: 'white', icon: User },
              { label: t('ENTERPRISE', 'ENTREPRISE'), desc: t('Certify & Scale', 'Certifier et Passer à l\'échelle'), color: 'accent-purple', icon: Building2 }
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

        <div className="mt-20 p-8 bg-surface-highest/10 border border-white/5 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary-cyan/10 border border-primary-cyan/30 flex items-center justify-center rounded-full shrink-0">
                <Shield size={32} className="text-primary-cyan" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase mb-1 tracking-tighter">{t('Patronage Platform Fee', 'Frais de Plateforme sur le Mécénat')}</h4>
                <p className="text-sm text-on-surface-variant text-justify">
                  {t('LinkYourArt relies on a patronage-based model. We charge a small platform fee on patronage support to maintain the registry and certification infrastructure. Certification itself is always free for creators.', 'LinkYourArt repose sur un modèle de mécénat. Nous prélevons un petit frais de plateforme sur le soutien apporté aux projets pour maintenir le registre et l\'infrastructure de certification. La certification elle-même est toujours gratuite pour les créateurs.')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-white/5 border border-white/10 text-center min-w-[140px]">
                <div className="text-2xl font-black text-primary-cyan whitespace-nowrap">5%</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant whitespace-nowrap">{t('On Patronage', 'Sur le Mécénat')}</div>
              </div>
            </div>
        </div>
      </div>

      <FeatureShowcaseModal 
        isOpen={!!showcaseFeature} 
        onClose={() => setShowcaseFeature(null)} 
        featureName={showcaseFeature || 'PRO_STARTER'} 
      />
    </div>
  );
};

export default PricingView;
