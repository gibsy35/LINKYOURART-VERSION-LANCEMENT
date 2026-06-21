import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Star, Crown, ArrowRight, Globe, BarChart3, Building2, User, Info, Sparkles, Cpu, Layers, Search, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { FeatureShowcaseModal } from '../components/Modals';

import { PageHeader } from '../components/ui/PageHeader';

interface PricingViewProps {
  onSelectPlan: (plan: { name: string, price: number, billingCycle: 'monthly' | 'yearly' }) => void;
  onNotify?: (msg: string) => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan, onNotify }) => {
  const { t, language } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showcaseFeature, setShowcaseFeature] = useState<'CREATOR' | 'INVESTOR' | 'PRO' | 'EXPERT_AUDIT' | 'LIQUIDITY_POOL' | 'PREDICTIVE_SCORE' | null>(null);

  const [creativeField, setCreativeField] = useState('Cinema / Film / TV');
  const [customRole, setCustomRole] = useState('Producer / Showrunner');
  const [projectSize, setProjectSize] = useState('Medium Catalog (5-15 assets)');
  const [needsDesc, setNeedsDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<{
    analysis: string;
    recommendedPlanId: 'CREATOR' | 'INVESTOR' | 'PRO' | 'PRO_ENTERPRISE';
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
      setAnalysisProgress('MATCHING LYA LIQUIDITY POOLS AND SYNDICATION THRESHOLDS...');
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
          analysis: "Votre profil dans le domaine de la création reflète des besoins d'évaluation et d'indexation d'actifs. Notre analyse de vos activités indique une excellente opportunité de valorisation de votre propriété intellectuelle et de vos droits d'auteur via les modules d'indexation de LinkYourArt.",
          recommendedPlanId: projectSize.includes('Enterprise') ? 'PRO_ENTERPRISE' : customRole.includes('Producer') || creativeField.includes('Cinema') ? 'PRO' : 'INVESTOR',
          recommendedPlanName: projectSize.includes('Enterprise') ? 'Entreprise Institutionnelle' : customRole.includes('Producer') || creativeField.includes('Cinema') ? 'Pro Personnel' : 'Investisseur',
          primaryReason: "Recommandé pour optimiser d'importants portefeuilles de propriété intellectuelle avec rapports personnalisés pour les partenaire créatifs.",
          estimatedMonthlyCost: projectSize.includes('Enterprise') ? 15000 : 890,
          suggestedAddons: [
            { name: "Risk Audit Pro", reason: "Sécurise l'audit préliminaire de vos contrats d'exploitation de manière automatisée." },
            { name: "Tax & Legal Suite", reason: "Idéal pour structurer les flux de redevances multi-pays issus de la syndication de vos œuvres." }
          ],
          projectedBenefits: [
            "Indexation fluide de vos droits d'exploitation en adéquation totale avec vos activités d'artiste.",
            "Distribution de dividendes de co-production via des contrats intelligents transparents.",
            "Connexion directe avec un réseau mondial de co-financeurs et de mécènes certifiés."
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
      monthlyPrice: 49,
      description: t('For individual artists and creators.', 'Pour les artistes et créateurs individuels.'),
      features: [
        t('Project indexing (up to 4)', 'Indexation de projets (jusqu\'à 4)'),
        t('LYA Score basic analysis', 'Analyse de base du Score LYA'),
        t('Accès transfert direct (frais de 5%)', 'Accès transfert direct (frais de 5%)'),
        t('Basic portfolio tracking', 'Suivi de portefeuille de base'),
      ],
      color: 'primary-cyan',
      icon: <Zap size={24} />,
    },
    {
      id: 'INVESTOR',
      name: t('Investor', 'Investisseur'),
      monthlyPrice: 149,
      description: t('Pour les collectionneurs et partenaire créatifs actifs.', 'For active collectors and partenaire créatifs.'),
      features: [
        t('Unlimited project tracking', 'Suivi de projets illimité'),
        t('Advanced market analytics', 'Analyses de marché avancées'),
        t('Frais de transfert réduits (3%)', 'Frais de transfert réduits (3%)'),
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
        t('Frais de transfert les plus bas (2%)', 'Frais de transfert les plus bas (2%)'),
        t('White-label reporting', 'Rapports en marque blanche'),
        t('Dedicated account manager', 'Gestionnaire de compte dédié'),
      ],
      color: 'white',
      icon: <User size={24} />,
    },
    {
      id: 'PRO_ENTERPRISE',
      name: t('Institutional Enterprise', 'Entreprise Institutionnelle'),
      monthlyPrice: 15000,
      description: t('Strategic infrastructure for major studios, publishers, and labels. Dedicated node with 24/7 priority support.', 'Infrastructure stratégique pour les grands studios, éditeurs et labels. Nœud dédié avec support prioritaire 24/7.'),
      features: [
        t('Full Catalog Indexing & Migration', 'Indexation et Migration de Catalogue Complet'),
        t('Externalized Editorial Management', 'Gestion Éditoriale Externalisée'),
        t('Custom Valuation Indexing', 'Indexation de Valeur Personnalisée'),
        t('Institutional Liquidity Bridges', 'Ponts de Liquidité Institutionnels'),
        t('Advanced LYA Governance', 'Gouvernance Avancée LYA'),
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
    <div className="max-w-full max-w-7xl mx-auto space-y-8 pb-12 relative min-h-screen">
      <PageHeader 
        titleWhite={t('Platform', 'Modèles de')}
        titleAccent={t('Pricing', 'Tarification')}
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
            <span className="absolute -top-2 -right-2 bg-accent-gold text-surface-dim text-[10px] px-1.5 py-0.5 font-black rounded-full">
              -10%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto pb-4">
        <div className="flex md:grid md:grid-cols-4 gap-6 min-w-full max-w-5xl overflow-x-auto md:min-w-0">
          {plans.map((plan, i) => {
            const currentPrice = calculatePrice(plan.monthlyPrice);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-surface-high/40 border ${plan.popular ? 'border-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/10'} p-5 sm:p-6 backdrop-blur-xl flex flex-col`}
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
                <div className="flex flex-col mb-4">
                  {plan.id === 'PRO_ENTERPRISE' ? (
                    <div>
                      <span className="text-2xl font-black text-accent-purple tracking-widest block uppercase leading-none">{t('Custom Quote', 'Sur Devis')}</span>
                      <span className="text-[10px] text-on-surface-variant/75 uppercase tracking-[0.2em] font-black block mt-2">{t('Enterprise Private Node / Dedicated Node', 'Nœud d\'infrastructure Élite / Nœud Dédié')}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-3xl font-black">${currentPrice}</span>
                      <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">/ {billingCycle === 'yearly' ? t('year', 'an') : t('month', 'mois')}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant mb-6 leading-relaxed h-12 overflow-hidden">
                  {plan.description}
                </p>

                <button 
                  onClick={() => setShowcaseFeature(plan.id as any)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-primary-cyan hover:text-white transition-colors mb-4 sm:mb-6"
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
                  onClick={() => {
                    if (plan.id === 'PRO_ENTERPRISE') {
                      onNotify?.(t('ENTERPRISE INFRASTRUCTURE DESK NOTIFIED. PRIVATE CORRESPONDENCE INITIATED.', 'CELLULE D\'INFRASTRUCTURE ENTREPRISE CONTACTÉE. ENVOI DES LYA SYSTEMES PRIVÉS EN COURS.'));
                    } else {
                      onSelectPlan({ name: plan.name, price: currentPrice, billingCycle });
                    }
                  }}
                  className={`w-full py-3 font-black uppercase text-xs tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  plan.id === 'PRO_ENTERPRISE'
                    ? 'bg-accent-purple/90 text-white shadow-lg shadow-accent-purple/20 hover:bg-white hover:text-surface-dim'
                    : plan.popular 
                    ? 'bg-accent-gold text-surface-dim hover:bg-white' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-surface-dim'
                }`}>
                  {plan.id === 'PRO_ENTERPRISE' ? t('Submit Request', 'Contacter Notre Conseil') : t('Get Started', 'Commencer')} <ArrowRight size={14} />
                </button>
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
                  {t('Tailored Creative Economy Valuation & Syndication Service Recommendation Engine', 'Moteur d’évaluation de vos besoins de syndication d’actifs et recommandations par IA')}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-primary-cyan/10 border border-primary-cyan/30 text-[10px] font-black uppercase tracking-wider text-primary-cyan self-start md:self-auto">
              {t('INTELLIGENT BROKER MODEL V3.5 ACTIVE', 'MODÈLE COURTIER LYA ACTIVE V3.5')}
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
                  className="w-full bg-surface-high border border-white/10 px-3 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-primary-cyan rounded-none"
                >
                  <option value="Independent Creator / Composer / Writer">{t('Independent Creator / Composer / Writer', 'Créateur / Compositeur / Auteur Indépendant')}</option>
                  <option value="Film Producer / Showrunner / Broadcaster">{t('Film Producer / Showrunner / Broadcaster', 'Producteur de Cinéma / Showrunner / Diffuseur')}</option>
                  <option value="Talent Agent / IP Broker / Appraiser">{t('Talent Agent / IP Broker / Appraiser', 'Agent Artistique / Courtier de Propriété Intellectuelle')}</option>
                  <option value="Private Collector / Creative Patron / Backer">{t('Private Collector / Creative Patron / Backer', 'Collectionneur / Mécène / Financeur Privé')}</option>
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
                  className="w-full bg-surface-high border border-white/10 px-3 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-primary-cyan rounded-none"
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
                  placeholder={t('Example: I want to syndicate broadcasting royalties from my 15 track documentary music library to secure short-term liquidated capital...', 'Exemple: Je veux syndiquer les royalties de diffusion SVOD de mon catalogue de 15 musiques de films pour lever du capital rapidement ...')}
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
                    {t('Our LYA Economizer AI will cross-reference your specific Creative Field, Scale of Projects, and licensing structures to generate an immediate live proposal and highlight matching subscription levels.', 'Notre IA croisera votre secteur de création, le volume de votre catalogue et les structures de licence pour générer une proposition d’indexation immédiate.')}
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
                          ? t('Sur de vis', 'Sur Devis') 
                          : `$${assessmentResult.estimatedMonthlyCost}/${billingCycle === 'yearly' ? t('an', 'an') : t('mois', 'mois')}`}
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
                        {t('ESTIMATED LEDGER COMPLEXITY APPRECIATION', 'INDICE DE FAISABILITÉ D’INDEXATION DE VOS DROITS')}
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
                        {t('Score representing how easily your contracts can bypass validation buffers.', 'Indice représentant la facilité d\'intégration directe dans notre registre sans sas de conformité légale manuel.')}
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
                          name: assessmentResult.recommendedPlanId === 'CREATOR' ? t('Creator', 'Créateur') :
                                assessmentResult.recommendedPlanId === 'INVESTOR' ? t('Investor', 'Investisseur') :
                                assessmentResult.recommendedPlanId === 'PRO' ? t('Pro Personal', 'Pro Personnel') : t('Institutional Enterprise', 'Entreprise Institutionnelle'),
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
                      t('Market sentiment analysis', 'Analyse du sentiment du marché'),
                      t('Custom portfolio alerts', 'Alertes de portefeuille personnalisées'),
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
                      t('2% de frais de transfert', '2% de frais de transfert'),
                      t('Priority settlement engine', 'Moteur de règlement prioritaire'),
                      t('Tax optimization reports', 'Rapports d\'optimisation fiscale'),
                      t('Direct equity lending', 'Prêt direct de fonds propres'),
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
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{t('Asset Management & Externalized Validation', 'Gestion d\'Actifs et Validation Externalisée')}</p>
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
                      t('Real-time Valuation index', 'Indice de Valorisation en tps réel'),
                      t('Predictive Performance data', 'Données de Performance Prédictives'),
                      t('Suite de Accès Institutionnel', 'Accès Institutionnel Suite'),
                      t('Master Registry Governance', 'Gouvernance du Registre Maître'),
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
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold opacity-60 mb-8 max-w-2xl text-justify">
            {t('Customize your professional experience with specialized add-on modules. Perfect for organizations requiring specific analytical depth.', 'Personnalisez votre expérience professionnelle avec des modules complémentaires spécialisés. Parfait pour les organisations nécessitant une profondeur d\'analyse spécifique.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('Accès Étendu au Marché', 'Accès Étendu au Marché'), price: '2,500', icon: Globe, desc: t('Accès aux registres de disponibilité mondiaux', 'Global accès aux registres de disponibilité') },
              { label: t('Risk Audit Pro', 'Audit de Risque Pro'), price: '1,200', icon: Shield, desc: t('Deep-dive compliance reports', 'Rapports de conformité approfondis') },
              { label: t('Portfolio AI', 'IA de Portefeuille'), price: '1,800', icon: Zap, desc: t('Automated rebalancing engine', 'Moteur de rééquilibrage automatisé') },
              { label: t('Tax & Legal Suite', 'Suite Fiscale et Juridique'), price: '950', icon: BarChart3, desc: t('Multi-jurisdictional reporting', 'Rapports multi-juridictionnels') },
            ].map((option, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl group hover:border-accent-gold/30 transition-all flex flex-col">
                <option.icon className="w-6 h-6 text-accent-gold mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{option.label}</h4>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter mb-4 opacity-60">{option.desc}</p>
                <div className="flex items-baseline gap-1 mb-6 mt-auto">
                  <span className="text-2xl font-black text-accent-gold">${option.price}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">/ {t('year', 'an')}</span>
                </div>
                <button 
                  onClick={() => onNotify?.(t('✦ Service added to your quote', '✦ Service ajouté à votre devis'))}
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
                <h4 className="text-xl font-black uppercase mb-1 tracking-tighter">{t('Frais de Transfert Direct', 'Frais de Transfert Direct')}</h4>
                <p className="text-sm text-on-surface-variant text-justify">
                  {t('LinkYourArt relies on a transfert direct model. We charge a small fee on every successful trade to maintain the network and ensure settlement security.', 'LinkYourArt repose sur un modèle d\'échange de transfert direct entre créateurs. Nous prélevons une petite commission sur chaque transaction réussie pour maintenir le réseau et assurer la sécurité du règlement.')}
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
