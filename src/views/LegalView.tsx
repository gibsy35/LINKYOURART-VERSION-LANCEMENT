
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadLegalDocument } from '../utils/premiumDownload';
import { PageHeader } from '../components/ui/PageHeader';
import { Shield, Lock, FileText, Scale, Globe, AlertCircle, Target, MessageSquare, HelpCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface LegalViewProps {
  type: 'TERMS' | 'PRIVACY' | 'REGISTRY' | 'OUR_MODEL' | 'FAQ' | 'MENTIONS';
  onNotify: (msg: string) => void;
  onViewChange?: (view: any) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onNotify, onViewChange }) => {
  const { t } = useTranslation();
  const [activeFaqTab, setActiveFaqTab] = React.useState('General');

  const faqThemes = [
    { id: 'General', label: t('General', 'Général') },
    { id: 'Creators', label: t('Creators', 'Créateurs') },
    { id: 'Mécènes & Partenaires', label: t('Patrons & Partners', 'Mécènes & Partenaires') },
    { id: 'Professionals', label: t('Professionals', 'Professionnels') },
    { id: 'Public', label: t('Public', 'Public') },
    { id: 'Security', label: t('Security', 'Sécurité') }
  ];

  const content = {
    TERMS: {
      title: t('Terms of Service', 'Conditions Générales d\'Utilisation'),
      subtitle: t('LYA Ecosystem Global Framework', 'Cadre Global de l\'Écosystème LYA'),
      sections: [
        {
          title: t('1. Philosophy & Accessibility', '1. Philosophie & Accessibilité'),
          text: t('LinkYourArt (LYA) is an inclusive ecosystem open to creators, creative partners, professionals, and the general public. We break down the barriers of the traditional art world to offer everyone a place in the creative economy. Our model is based on simplicity and fairness.', 'LinkYourArt (LYA) est un écosystème inclusif ouvert aux créateurs, aux partenaires créatifs, aux professionnels et au grand public. Nous brisons les barrières du monde de l\'art traditionnel pour offrir à chacun une place dans l\'économie de la création. Notre modèle repose sur la simplicité et l\'équité.')
        },
        {
          title: t('2. The Certification Model', '2. Le Modèle de Certification'),
          text: t('LYA uses a unique creative certification model: the LYA Score. Each project is evaluated by a combination of algorithmic analysis and review by certified professionals, producing an objective, traceable quality indicator recorded on the LYA Registry. The LYA Score is a certification standard — it is not a financial instrument.', 'LYA utilise un modèle unique de certification créative : le Score LYA. Chaque projet est évalué par une combinaison d\'analyse algorithmique et de revue par des professionnels certifiés, produisant un indicateur de qualité objectif et traçable, inscrit au Registre LYA. Le Score LYA est un standard de certification — ce n\'est pas un instrument financier.')
        },
        {
          title: t('3. Participation for All', '3. Participation pour Tous'),
          text: t('Whether you are a world-renowned artist, a creative professional, or simply an art enthusiast, LYA offers you tools tailored to your needs. Patrons may support certified projects through recognition-based patronage, receiving recognition and access considerations rather than a financial return.', 'Que vous soyez un artiste de renommée mondiale, un professionnel créatif ou simplement un passionné d\'art, LYA vous propose des outils adaptés à vos besoins. Les mécènes peuvent soutenir des projets certifiés via un mécénat de reconnaissance, recevant reconnaissance et contreparties d\'accès plutôt qu\'un retour financier.')
        },
        {
          title: t('4. Transparency & Security', '4. Transparence & Sécurité'),
          text: t('Integrity is at the heart of LYA. Every certified project and every milestone is registered in our immutable registry. This ensures total transparency for all participants, guaranteeing that everyone\'s rights are protected and respected within our ecosystem.', 'L\'intégrité est au cœur de LYA. Chaque projet certifié et chaque jalon sont enregistrés dans notre registre immuable. Cela assure une transparence totale pour tous les participants, garantissant que les droits de chacun sont protégés et respectés au sein de notre écosystème.')
        },
        {
          title: t('5. Creative Independence', '5. Indépendance Créative'),
          text: t('LYA gives power back to creators and those who support them. We believe that art should not be governed by the laws of high finance, but by the value of the creative projects themselves and the community that believes in them.', 'LYA redonne le pouvoir aux créateurs et à ceux qui les soutiennent. Nous croyons que l\'art ne doit pas être régi par les lois de la haute finance, mais par la valeur des projets créatifs eux-mêmes et la communauté qui y croit.')
        }
      ]
    },
    PRIVACY: {
      title: t('Privacy Policy', 'Politique de Confidentialité'),
      subtitle: t('Respect for Your Data and Independence', 'Respect de vos Données et Indépendance'),
      sections: [
        {
          title: t('1. Ethical Data Use', '1. Utilisation Éthique'),
          text: t('Your data belongs to you. We only collect the information necessary for the operation of the LYA ecosystem, in line with GDPR requirements.', 'Vos données vous appartiennent. Nous ne collectons que les informations nécessaires au fonctionnement de l\'écosystème LYA, conformément aux exigences du RGPD.')
        },
        {
          title: t('2. Secure Storage', '2. Stockage Sécurisé'),
          text: t('We use modern encryption standards to ensure that your personal information remains confidential. Our infrastructure is designed to be robust, ensuring the continuity of the ecosystem and the safety of your data.', 'Nous utilisons des standards de cryptage modernes pour assurer que vos informations personnelles restent confidentielles. Notre infrastructure est conçue pour être robuste, assurant la continuité de l\'écosystème et la sécurité de vos données.')
        },
        {
          title: t('3. Full Control', '3. Contrôle Total'),
          text: t('You have complete control over your profile and your activity. LYA is a platform that serves the creative community, and we strive to make data management as simple and intuitive as possible for all users.', 'Vous avez un contrôle total sur votre profil et votre activité. LYA est une plateforme au service de la communauté créative, et nous mettons tout en œuvre pour que la gestion des données soit simple et intuitive.')
        }
      ]
    },
    REGISTRY: {
      title: t('Creative Registry', 'Registre Créatif'),
      subtitle: t('The Living Memory of the LYA Ecosystem', 'La Mémoire Vivante de l\'Écosystème LYA'),
      sections: [
        {
          title: t('1. Universal Certification Registry', '1. Registre de Certification Universel'),
          text: t('The LYA Registry is not a financial ledger, but a creative certification registry. It documents the LYA Score and milestone history of each certified project, ensuring that every creator and patron has immutable, transparent proof of the certification granted.', 'Le Registre LYA n\'est pas un livre de comptes financier, mais un registre de certification créative. Il documente le Score LYA et l\'historique des jalons de chaque projet certifié, assurant à chaque créateur et mécène une preuve immuable et transparente de la certification accordée.')
        },
        {
          title: t('2. A Rigorous Certification Process', '2. Un Processus de Certification Rigoureux'),
          text: t('Our registry follows its own rigorous rules of transparency and artistic integrity. Validation is performed by the community and creative experts, combined with AI-assisted analysis and specialized human audits, focusing on the quality and progress of the projects.', 'Notre registre suit ses propres règles rigoureuses de transparence et d\'intégrité artistique. La validation se fait par la communauté et des experts créatifs, combinée à une analyse assistée par IA et des audits humains spécialisés, en se concentrant sur la qualité et l\'avancement des projets.')
        }
      ]
    },
    MENTIONS: {
      title: t('Legal Mentions', 'Mentions Légales'),
      subtitle: t('Corporate Information', 'Informations Corporatives'),
      sections: [
        {
          title: t('1. Identity', '1. Identité'),
          text: t('LINKYOURART SASU, a company registered in France, headquartered at 122 rue Amelot, 75011 Paris, France. SIRET: 108 141 946 00013. Founded by Jean-Baptiste LEQUIME. LINKYOURART SASU is an independent platform building the global certification standard for creative work. Contact: contact@linkyourart.com', 'LINKYOURART SASU, société immatriculée en France, domiciliée au 122 rue Amelot, 75011 Paris, France. SIRET : 108 141 946 00013. Fondée par Jean-Baptiste LEQUIME. LINKYOURART SASU est une plateforme indépendante qui construit le standard mondial de certification des œuvres créatives. Contact : contact@linkyourart.com')
        },
        {
          title: t('2. Hosting', '2. Hébergement'),
          text: t('LinkYourArt is hosted by Vercel Inc. (340 Pine Street, Suite 701, San Francisco, CA 94104, USA) and uses Firebase by Google LLC for database and authentication services. Data is stored in accordance with GDPR requirements.', 'LinkYourArt est hébergé par Vercel Inc. (340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis) et utilise Firebase de Google LLC pour les services de base de données et d\'authentification. Les données sont stockées conformément aux exigences du RGPD.')
        },
        {
          title: t('3. Intellectual Property', '3. Propriété Intellectuelle'),
          text: t('All content on LinkYourArt (logo, name, design, LYA Score algorithm) is the exclusive property of LINKYOURART SASU. Any reproduction, even partial, is prohibited without prior written authorization. Creative projects registered on the platform remain the exclusive property of their creators.', 'Tous les contenus de LinkYourArt (logo, nom, design, algorithme LYA Score) sont la propriété exclusive de LINKYOURART SASU. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable. Les projets créatifs enregistrés sur la plateforme restent la propriété exclusive de leurs créateurs.')
        },
        {
          title: t('4. Personal Data & GDPR', '4. Données Personnelles & RGPD'),
          text: t('LinkYourArt collects and processes personal data (name, email, role) solely for the purpose of operating the platform. In accordance with GDPR, you have the right to access, rectify, delete and port your data. Data Protection Officer contact: contact@linkyourart.com — Your data is never sold to third parties.', 'LinkYourArt collecte et traite des données personnelles (nom, email, rôle) uniquement dans le cadre du fonctionnement de la plateforme. Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données. Contact DPO : contact@linkyourart.com — Vos données ne sont jamais vendues à des tiers.')
        },
        {
          title: t('5. Cookies', '5. Cookies'),
          text: t('LinkYourArt uses only essential technical cookies necessary for authentication and platform operation (Firebase session, language preference). No advertising or tracking cookies are used. You can disable cookies in your browser settings, but some features may no longer work correctly.', 'LinkYourArt utilise uniquement des cookies techniques essentiels nécessaires à l\'authentification et au fonctionnement de la plateforme (session Firebase, préférence de langue). Aucun cookie publicitaire ou de traçage n\'est utilisé. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités pourraient ne plus fonctionner correctement.')
        },
        {
          title: t('6. Limitation of Liability', '6. Limitation de Responsabilité'),
          text: t('LinkYourArt acts as a certification and patronage-matching platform between creators and patrons. Support provided to a project constitutes recognition-based patronage and does not constitute a financial investment product. LinkYourArt cannot be held liable for creative projects that do not achieve their objectives. Support of a creative project is done at your own discretion.', 'LinkYourArt agit en tant que plateforme de certification et de mise en relation de mécénat entre créateurs et mécènes. Le soutien apporté à un projet constitue un mécénat de reconnaissance et ne constitue pas un produit d\'investissement financier. LinkYourArt ne peut être tenu responsable des projets créatifs qui n\'atteignent pas leurs objectifs. Le soutien à un projet créatif se fait à votre entière discrétion.')
        }
      ]
    },
    OUR_MODEL: {
      title: t('Our Model', 'Notre Modèle'),
      subtitle: t('A New Standard for Global Creation', 'Un Nouveau Standard pour la Création Mondiale'),
      sections: [
        {
          title: t('1. Simple & For Everyone', '1. Simple & Pour Tous'),
          text: t('The LYA model turns complex creative evaluation into a simple, objective Score. This allows anyone — artist, patron, or casual fan — to understand a project\'s quality and support its success. No need for professional status or financial background.', 'Le modèle LYA transforme l\'évaluation créative complexe en un Score simple et objectif. Cela permet à n\'importe qui — artiste, mécène ou simple passionné — de comprendre la qualité d\'un projet et de soutenir sa réussite.')
        },
        {
          title: t('2. A Certification Standard, Not a Financial Product', '2. Un Standard de Certification, Pas un Produit Financier'),
          text: t('We keep things simple and transparent: creators get certified, patrons support projects they believe in and receive recognition-based considerations in return. It is direct, easy, and does not rely on any financial instrument.', 'Nous gardons les choses simples et transparentes : les créateurs se font certifier, les mécènes soutiennent les projets auxquels ils croient et reçoivent en retour des contreparties de reconnaissance. C\'est direct, simple, et cela ne repose sur aucun instrument financier.')
        },
        {
          title: t('3. Collaborative Success', '3. Un Succès Collaboratif'),
          text: t('LinkYourArt is a bridge. We unite creators who need visibility and support with a community that wants to discover and champion new works. This model ensures that recognition is shared and art remains free from the chains of traditional finance.', 'LinkYourArt est un pont. Nous unissons les créateurs qui ont besoin de visibilité et de soutien avec une communauté qui veut découvrir et défendre des œuvres nouvelles. Ce modèle garantit que la reconnaissance est partagée et que l\'art reste libre des chaînes de la finance traditionnelle.')
        }
      ]
    },
    FAQ: {
      title: t('FAQ & Support', 'FAQ & Support'),
      subtitle: t('Simple Answers for Your Journey', 'Des Réponses Simples pour votre Parcours'),
      sections: [] // Handled by tabs
    }
  };

  const faqContent = {
    General: [
      { 
        q: t('What is LinkYourArt (LYA)?', 'Qu\'est-ce que LinkYourArt (LYA) ?'), 
        a: t('LYA is a creative certification ecosystem where anyone can discover, certify and support artistic projects. It is an independent platform that makes objective creative quality assessment accessible to everyone.', 'LYA est un écosystème de certification créative où n\'importe qui peut découvrir, certifier et soutenir des projets artistiques. C\'est une plateforme indépendante qui rend l\'évaluation objective de la qualité créative accessible à tous.') 
      },
      { 
        q: t('Who can use LYA?', 'Qui peut utiliser LYA ?'), 
        a: t('Everyone! LYA is designed for creators, creative partners, professionals, and the general public. We offer a simple and fair model for all actors in the artistic world.', 'Tout le monde ! LYA est conçu pour les créateurs, partenaires créatifs, professionnels et le grand public. Nous proposons un modèle simple et équitable pour tous les acteurs du monde artistique.') 
      },
      { 
        q: t('Is LYA a financial or investment platform?', 'LYA est-elle une plateforme financière ou d\'investissement ?'), 
        a: t('No. LYA is a creative certification platform. Patrons who support a project do so through recognition-based patronage — they do not acquire a financial instrument, and support does not constitute an investment product regulated by MiCA or the SEC.', 'Non. LYA est une plateforme de certification créative. Les mécènes qui soutiennent un projet le font via un mécénat de reconnaissance — ils n\'acquièrent aucun instrument financier, et ce soutien ne constitue pas un produit d\'investissement réglementé par MiCA ou la SEC.') 
      },
      { 
        q: t('What are the platform fees?', 'Quels sont les frais de la plateforme ?'), 
        a: t('Transparency is key. We apply a platform fee on patronage support (5%) and offer optional Pro subscriptions and premium certification services. These fees support the ecosystem\'s security and evolution.', 'La transparence est essentielle. Nous appliquons des frais de plateforme sur le mécénat (5%) et proposons des abonnements Pro optionnels ainsi que des services de certification premium. Ces frais soutiennent la sécurité et l\'évolution de l\'écosystème.') 
      }
    ],
    Creators: [
      {
        q: t('How do I submit a creative project?', 'Comment soumettre un projet créatif ?'),
        a: t('Go to the LinkArt section and fill in your project details: title, category, description, budget and milestones. Once submitted, your project enters the LYA certification queue.', 'Rendez-vous dans la section LinkArt et renseignez les détails de votre projet : titre, catégorie, description, budget et jalons. Une fois soumis, votre projet entre dans la file de certification LYA.')
      },
      {
        q: t('What types of projects are accepted?', 'Quels types de projets sont acceptés ?'),
        a: t('LYA accepts all creative industries: cinema, music, visual arts, architecture, gaming, fashion, photography, literature and more. Any project with documented creative rights can be submitted.', 'LYA accepte toutes les industries créatives : cinéma, musique, arts visuels, architecture, gaming, mode, photographie, littérature et plus encore. Tout projet avec des droits créatifs documentés peut être soumis.')
      },
      {
        q: t('How is the LYA Score calculated for my project?', 'Comment est calculé le Score LYA pour mon projet ?'),
        a: t('The LYA Score (0-1000) combines 5 pillars evaluated through algorithmic analysis and review by certified Professional validators, updated as milestones are completed.', 'Le Score LYA (0-1000) combine 5 piliers évalués par analyse algorithmique et revue par des validateurs Professionnels certifiés, mis à jour au fil des jalons.')
      },
      {
        q: t('Do I keep full creative control of my project?', 'Est-ce que je garde le contrôle créatif de mon projet ?'),
        a: t('Absolutely. Creators retain all moral rights and creative control at all times. Patrons who support a project receive recognition-based considerations only — never decision-making rights over your artistic choices.', 'Absolument. Les créateurs conservent à tout moment tous leurs droits moraux et le contrôle créatif. Les mécènes qui soutiennent un projet ne reçoivent que des contreparties de reconnaissance — jamais de droit de décision sur vos choix artistiques.')
      }
    ],
    "Mécènes & Partenaires": [
      {
        q: t('How do I support a creative project?', 'Comment soutenir un projet créatif ?'),
        a: t('Browse the Registry to find certified projects. You can support a project directly with the amount of your choice, starting from €50, as part of a recognition-based patronage campaign.', 'Parcourez le Registre pour trouver des projets certifiés. Vous pouvez soutenir un projet directement avec le montant de votre choix, à partir de 50 €, dans le cadre d\'une campagne de mécénat de reconnaissance.')
      },
      {
        q: t('What do I receive in return for my support?', 'Que reçois-je en échange de mon soutien ?'),
        a: t('You receive the considerations defined by each campaign — credit mention, early access, exclusive updates on the project\'s progress and LYA Score evolution. These considerations are personal, non-financial and non-transferable.', 'Vous recevez les contreparties définies par chaque campagne — mention au générique, accès anticipé, mises à jour exclusives sur l\'avancement du projet et l\'évolution du Score LYA. Ces contreparties sont personnelles, non-financières et non cessibles.')
      },
      {
        q: t('Can I get a financial return on my support?', 'Puis-je obtenir un retour financier sur mon soutien ?'),
        a: t('No. Patronage on LYA is recognition-based: your support does not entitle you to a share of the project\'s revenues or to any tradeable instrument. It is a way to back creative work you believe in.', 'Non. Le mécénat sur LYA est un mécénat de reconnaissance : votre soutien ne vous donne droit à aucune part des revenus du projet ni à aucun instrument négociable. C\'est une façon de soutenir une création à laquelle vous croyez.')
      }
    ],
    Professionals: [
      {
        q: t('How do I become a validated Professional on LYA?', 'Comment devenir un Professionnel validé sur LYA ?'),
        a: t('Submit a Professional Verification request in the Apply for Verification section. Provide your professional credentials, portfolio and references. Validation is reviewed by the LYA committee within 5 to 10 business days.', 'Soumettez une demande de Vérification Professionnelle dans la section Postuler à la Vérification. Fournissez vos accréditations professionnelles, portfolio et références. La validation est examinée par le comité LYA sous 5 à 10 jours ouvrés.')
      },
      {
        q: t('What does Pro status unlock?', 'Qu\'est-ce que le statut Pro débloque ?'),
        a: t('Pro status gives access to: the Validation hub to evaluate projects, the Lounge Pro for professional networking, advanced AI analytics, governance participation and API access.', 'Le statut Pro donne accès à : le hub de Validation pour évaluer les projets, le Lounge Pro pour le réseautage professionnel, les analyses IA avancées, la participation à la gouvernance et l\'accès API.')
      },
      {
        q: t('How are Professional validators compensated?', 'Comment les validateurs Professionnels sont-ils rémunérés ?'),
        a: t('Validators are compensated through LYA\'s Professional and Institutional Enterprise service revenue, based on their validation activity and volume. Exact compensation terms are formalized individually with each certified validator.', 'Les validateurs sont rémunérés via les revenus des services Pro et Entreprise Institutionnelle de LYA, en fonction de leur activité et de leur volume de validation. Les modalités exactes de rémunération sont formalisées individuellement avec chaque validateur certifié.')
      }
    ],
    Public: [
      {
        q: t('Do I need an account to browse LYA?', 'Ai-je besoin d\'un compte pour naviguer sur LYA ?'),
        a: t('No. The home page and Registry are accessible in read-only mode without an account. To support a project, submit a project or interact with the platform, you need to create a free account.', 'Non. La page d\'accueil et le Registre sont accessibles en lecture seule sans compte. Pour soutenir un projet, en soumettre un ou interagir avec la plateforme, vous devez créer un compte gratuit.')
      },
      {
        q: t('Is LYA free to use?', 'LYA est-il gratuit ?'),
        a: t('Creating an account and browsing the platform is completely free. Fees only apply to patronage support (5% platform fee) and to the optional Pro subscription for advanced features.', 'La création d\'un compte et la navigation sur la plateforme sont entièrement gratuites. Des frais s\'appliquent uniquement au mécénat (5% de frais de plateforme) et à l\'abonnement Pro optionnel pour les fonctionnalités avancées.')
      },
      {
        q: t('In which countries is LYA available?', 'Dans quels pays LYA est-il disponible ?'),
        a: t('LYA is available worldwide. The platform currently supports certification under French Law, English Law and US Federal IP frameworks, with more jurisdictions being added regularly.', 'LYA est disponible dans le monde entier. La plateforme supporte actuellement la certification sous droit français, droit anglais et cadres de PI fédéraux américains, avec d\'autres juridictions ajoutées régulièrement.')
      }
    ],
    Security: [
      { 
        q: t('Is my support secure?', 'Mon soutien est-il sécurisé ?'), 
        a: t('All certifications and milestones are registered in our secure, immutable registry. Our focus is on the security and traceability of your patronage activity and the creative rights involved.', 'Toutes les certifications et jalons sont enregistrés dans notre registre sécurisé et immuable. Notre attention se porte sur la sécurité et la traçabilité de votre activité de mécénat et des droits créatifs concernés.') 
      },
      {
        q: t('Is my personal data protected?', 'Mes données personnelles sont-elles protégées ?'),
        a: t('Yes. LYA uses AES-256 encryption and never shares your data with third parties. You can request deletion of your account and all associated data at any time.', 'Oui. LYA utilise le chiffrement AES-256 et ne partage jamais vos données avec des tiers. Vous pouvez demander la suppression de votre compte et de toutes les données associées à tout moment.')
      }
    ]
  };

  const activeContent = content[type];

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-surface-dim">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-cyan/10 to-transparent opacity-30" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-cyan/20 to-transparent" />
      </div>

      <div className="relative z-10">
        <PageHeader 
          titleWhite={activeContent.title.split(' ')[0]}
          titleAccent={activeContent.title.split(' ').slice(1).join(' ')}
          description={activeContent.subtitle}
          accentColor="text-primary-cyan"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 -mt-32 mb-12 relative z-20">
          <div className="flex flex-wrap gap-4">
            <div className="px-4 sm:px-8 py-4 sm:py-5 bg-surface-dim/80 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-primary-cyan uppercase tracking-[0.2em] font-black mb-1 opacity-70">{t('Ecosystem Status', 'Statut de l\'Écosystème')}</div>
              <div className="text-3xl font-black text-white tracking-tighter uppercase">{t('Active & Secure', 'ACTIF & SÉCURISÉ')}</div>
            </div>
            <div className="px-4 sm:px-8 py-4 sm:py-5 bg-surface-dim/80 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-black mb-1 opacity-70">{t('Protocol Version', 'Version du Protocole')}</div>
              <div className="text-3xl font-black text-white tracking-tighter uppercase">V4.2.0</div>
            </div>
          </div>
        </div>

        {type === 'FAQ' && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 mb-8 md:mb-16 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              {faqThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveFaqTab(theme.id)}
                  className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-500 relative overflow-hidden group ${
                    activeFaqTab === theme.id 
                      ? 'text-surface-dim' 
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {activeFaqTab === theme.id && (
                    <div className="absolute inset-0 bg-primary-cyan shadow-[0_0_40px_rgba(0,224,255,0.4)]" />
                  )}
                  <span className="relative z-10">{theme.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaqTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10 col-span-2"
                >
                  {(faqContent[activeFaqTab as keyof typeof faqContent] || []).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="group relative"
                    >
                      {/* Depth Effect Background */}
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-cyan/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="relative glass-panel p-10 rounded-[2.5rem] border-white/10 bg-surface-dim/40 hover:bg-surface-dim/60 hover:border-primary-cyan/30 transition-all duration-500 shadow-2xl h-full flex flex-col gap-6">
                        <div className="flex gap-6 items-start">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-cyan/20 to-primary-cyan/5 border border-primary-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <HelpCircle size={24} className="text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.5)]" />
                          </div>
                          <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-primary-cyan transition-colors duration-500 pt-1">
                            {item.q}
                          </h3>
                        </div>
                        <p className="text-base text-gray-400 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-all duration-500 text-justify">
                          {item.a}
                        </p>
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-1 h-1 rounded-full bg-primary-cyan animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {type !== 'FAQ' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activeContent.sections.map((section, i) => (
              <motion.section 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="relative group h-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-cyan/10 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative glass-panel p-12 rounded-[3rem] border-white/10 bg-surface-dim/60 hover:bg-surface-dim/80 hover:border-primary-cyan/30 transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col h-full">
                  {/* Dynamic Abstract Background Elements */}
                  <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <div className="absolute top-10 right-10 w-80 h-80 border border-white/10 rounded-full rotate-45 transform translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
                  </div>
                  
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-[0.15] border-white/5 transition-all group-hover:scale-110 duration-1000 rotate-12">
                    {type === 'TERMS' ? <Scale size={180} /> : <Lock size={180} />}
                  </div>

                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan group-hover:shadow-[0_0_20px_rgba(0,224,255,0.3)] transition-shadow">
                      <div className="w-3 h-3 rounded-full bg-primary-cyan animate-pulse shadow-[0_0_10px_rgba(0,224,255,0.8)]" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-primary-cyan transition-colors">
                      {section.title}
                    </h2>
                  </div>
                  
                  <p className="text-base text-gray-400 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity relative z-10 text-justify">
                    {section.text}
                  </p>
                </div>
              </motion.section>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Shield className="text-primary-cyan" size={24} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white">{t('Verified by LYA Legal', 'Vérifié par LYA Legal')}</div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Hash: 0x82f...a92e</div>
            </div>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => {
                const content = document.querySelector('article')?.innerText || 'LYA Legal Document';
                downloadLegalDocument('LYA Registry Terms', content);
                onNotify('DOCUMENT DOWNLOADED');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
            >
              {t('Download PDF', 'Télécharger PDF')}
            </button>
            <button 
              onClick={() => onViewChange('LEGAL_MENTIONS')}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
            >
              {t('Archive Access', 'Accès Archives')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
