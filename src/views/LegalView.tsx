
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
    { id: 'Partenaire créatifs', label: t('Investisseurs', 'Partenaire créatifs') },
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
          text: t('LinkYourArt (LYA) is an inclusive ecosystem open to creators, partenaires créatifs, professionals, and the general public. We break down the barriers of the traditional art world to offer everyone a place in the creative economy. Our model is based on simplicity and fairness.', 'LinkYourArt (LYA) est un écosystème inclusif ouvert aux créateurs, aux partenaires créatifs, aux professionnels et au grand public. Nous brisons les barrières du monde de l\'art traditionnel pour offrir à chacun une place dans l\'économie de la création. Notre modèle repose sur la simplicité et l\'équité.')
        },
        {
          title: t('2. The Indexed Contract Model', '2. Le Modèle du Contrat Indexé'),
          text: t('LYA uses a unique model of indexed creative contracts. These instruments are specifically designed to remain independent of traditional financial systems and restrictive directives such as MICA or SEC. By focusing on the creative value itself, LYA allows for smooth exchange without being subject to the complex constraints of regulated financial products.', 'LYA utilise un modèle unique de contrats créatifs indexés. Ces instruments sont conçus spécifiquement pour rester indépendants des systèmes financiers traditionnels et des directives restrictives telles que MICA ou la SEC. En se concentrant sur la valeur créative elle-même, LYA permet un échange fluide sans être soumis aux contraintes complexes des produits financiers réglementés.')
        },
        {
          title: t('3. Participation for All', '3. Participation pour Tous'),
          text: t('Whether you are a world-renowned artist, a professional collector, or simply an art enthusiast, LYA offers you tools tailored to your needs. The platform allows for the fractionalization of rights into easy-to-understand units, making investment in creation accessible with simple and transparent rules.', 'Que vous soyez un artiste de renommée mondiale, un collectionneur professionnel ou simplement un passionné d\'art, LYA vous propose des outils adaptés à vos besoins. La plateforme permet la fractionnalisation des droits en unités simples à comprendre, rendant l\'investissement dans la création accessible avec des règles claires et transparentes.')
        },
        {
          title: t('4. Transparency & Security', '4. Transparence & Sécurité'),
          text: t('Integrity is at the heart of LYA. Every creation, every unit, and every exchange is registered in our immutable registry. This ensures total transparency for all participants, guaranteeing that everyone\'s rights are protected and respected within our independent ecosystem.', 'L\'intégrité est au cœur de LYA. Chaque création, chaque unité et chaque échange est enregistré dans notre registre immuable. Cela assure une transparence totale pour tous les participants, garantissant que les droits de chacun sont protégés et respectés au sein de notre écosystème indépendant.')
        },
        {
          title: t('5. Creative Independence', '5. Indépendance Créative'),
          text: t('By bypassing traditional financial circuits, LYA gives power back to creators and those who support them. We believe that art should not be governed by the laws of high finance, but by the value of the creative projects themselves and the community that believes in them.', 'En contournant les circuits financiers classiques, LYA redonne le pouvoir aux créateurs et à ceux qui les soutiennent. Nous croyons que l\'art ne doit pas être régi par les lois de la haute finance, mais par la valeur des projets créatifs eux-mêmes et la communauté qui y croit.')
        }
      ]
    },
    PRIVACY: {
      title: t('Privacy Policy', 'Politique de Confidentialité'),
      subtitle: t('Respect for Your Data and Independence', 'Respect de vos Données et Indépendance'),
      sections: [
        {
          title: t('1. Ethical Data Use', '1. Utilisation Éthique'),
          text: t('Your data belongs to you. We only collect the information necessary for the operation of the LYA ecosystem. Unlike financial systems that track every movement for external audits, LYA protects your privacy within its independent network.', 'Vos données vous appartiennent. Nous ne collectons que les informations nécessaires au fonctionnement de l\'écosystème LYA. Contrairement aux systèmes financiers qui traquent chaque mouvement pour des audits externes, LYA préserve votre vie privée au sein de son réseau indépendant.')
        },
        {
          title: t('2. Secure Storage', '2. Stockage Sécurisé'),
          text: t('We use modern encryption standards to ensure that your personal information remains confidential. Our infrastructure is designed to be robust and independent, ensuring the continuity of the ecosystem and the safety of your holdings.', 'Nous utilisons des standards de cryptage modernes pour assurer que vos informations personnelles restent confidentielles. Notre infrastructure est conçue pour être robuste et indépendante, assurant la continuité de l\'écosystème.')
        },
        {
          title: t('3. Full Control', '3. Contrôle Total'),
          text: t('You have complete control over your profile and your transactions. LYA is a platform that serves the creative community, and we strive to make data management as simple and intuitive as possible for all users, without the complexity of traditional administrative systems.', 'Vous avez un contrôle total sur votre profil et vos transactions. LYA est une plateforme au service de la communauté créative, et nous mettons tout en œuvre pour que la gestion des données soit simple et intuitive, sans la complexité des systèmes administratifs classiques.')
        }
      ]
    },
    REGISTRY: {
      title: t('Creative Registry', 'Registre Créatif'),
      subtitle: t('The Living Memory of the LYA Ecosystem', 'La Mémoire Vivante de l\'Écosystème LYA'),
      sections: [
        {
          title: t('1. Universal Rights Registry', '1. Registre de Droits Universel'),
          text: t('The LYA Registry is not a registre financier, but a creative one. It documents the ownership and history of each indexed project, ensuring that every creator and partenaire créatif has an immutable proof of their rights, transparent and accessible to everyone.', 'Le Registre LYA n\'est pas un livre de comptes financier, mais un registre créatif. Il documente la propriété et l\'historique de chaque projet indexé, assurant que chaque créateur et partenaire créatif possède une preuve immuable de ses droits.')
        },
        {
          title: t('2. Beyond Traditional Audits', '2. Au-delà des Audits Classiques'),
          text: t('Because we operate independently of MICA and SEC, our registry follows its own rules of transparency and artistic integrity. Validation is done by the community and creative experts, but also with the intervention of high-performance AI tools and specialized human audits, focusing on the quality and success of the projects rather than on financial bureaucracy.', 'Parce que nous opérons indépendamment de MICA et de la SEC, notre registre suit ses propres règles de transparence et d\'intégrité artistique. La validation se fait par la communauté et les experts créatifs, mais aussi avec l\'intervention de certains outils IA haute performance et d\'audits humains spécialisés.')
        }
      ]
    },
    MENTIONS: {
      title: t('Legal Mentions', 'Mentions Légales'),
      subtitle: t('Corporate Information', 'Informations Corporatives'),
      sections: [
        {
          title: t('1. Identity', '1. Identité'),
          text: t('LYA Ltd, based in READING, United Kingdom. Founded by Jean-Baptiste LEQUIME. LYA is an independent platform dedicated to the creative revolution.', 'LYA Ltd, basé à READING, United Kingdom. Fondée par Jean-Baptiste LEQUIME. LYA est une plateforme indépendante dédiée à la révolution créative.')
        },
        {
          title: t('2. Infrastructure', '2. Infrastructure'),
          text: t('The LYA ecosystem is powered by a modern and secure technical architecture, ensuring a smooth experience for all creators, partenaires créatifs, professionals and audiences worldwide.', 'L\'écosystème LYA est propulsé par une architecture technique moderne et sécurisée, assurant une expérience fluide pour tous les créateurs, partenaires créatifs, professionnels et publics du monde entier.')
        }
      ]
    },
    OUR_MODEL: {
      title: t('Our Model', 'Notre Modèle'),
      subtitle: t('A New Standard for Global Creation', 'Un Nouveau Standard pour la Création Mondiale'),
      sections: [
        {
          title: t('1. Simple & For Everyone', '1. Simple & Pour Tous'),
          text: t('The LYA model turns complex creative contracts into simple Units. This allows anyone—artist, collector, or casual fan—to participate in a project\'s success. No need for professional status or financial background; art becomes an exchange that belongs to everyone.', 'Le modèle LYA transforme les contrats créatifs complexes en Unités simples. Cela permet à n\'importe qui—artiste, collectionneur ou simple fan—de participer au succès d\'un projet.')
        },
        {
          title: t('2. Avoiding Financial Jargon', '2. Sortir du Jargon Financier'),
          text: t('We refuse the complexity of traditional financial instruments. By bypassing MICA/SEC directives via indexed contracts, we keep things simple: you support a project, you receive a share of its success. It is direct, easy, and efficient.', 'Nous refusons la complexité des instruments financiers traditionnels. En contournant les directives MICA/SEC via le contrat indexé, nous gardons les choses simples : vous soutenez un projet, vous recevez une part de son succès.')
        },
        {
          title: t('3. Collaborative Success', '3. Un Succès Collaboratif'),
          text: t('LinkYourArt is a bridge. We unite creators who need financing and a community that wants to discover and participate in new works. This model ensures that success is shared and art remains free from the chains of traditional finance.', 'LinkYourArt est un pont. Nous unissons les créateurs qui ont besoin de financement et une communauté qui veut découvrir et participer à des œuvres nouvelles.')
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
        a: t('LYA is a creative ecosystem where anyone can support and exchange indexed rights to artistic projects. It is an independent platform that makes the creative economy accessible to everyone, bypassing the complexities of traditional finance.', 'LYA est un écosystème créatif où n\'importe qui peut soutenir et échanger des droits indexés sur des projets artistiques. C\'est une plateforme indépendante qui rend l\'économie de la création accessible à tous, en contournant les complexités de la finance traditionnelle.') 
      },
      { 
        q: t('Who can use LYA?', 'Qui peut utiliser LYA ?'), 
        a: t('Everyone! LYA is designed for creators, creative partners, professionals, and the general public. We offer a simple and fair model for all actors in the artistic world.', 'Tout le monde ! LYA est conçu pour les créateurs, partenaires créatifs, professionnels et le grand public. Nous proposons un modèle simple et équitable pour tous les acteurs du monde artistique.') 
      },
      { 
        q: t('Is LYA regulated like a bank or by MICA/SEC?', 'LYA est-elle réglementée par MICA ou la SEC ?'), 
        a: t('Our ecosystem operates via indexed creative contracts, specifically designed to remain outside the scope of restrictive financial directives such as MICA or SEC. This independence ensures a seamless and simplified experience for our community.', 'Notre écosystème opère via des contrats créatifs indexés, spécifiquement conçus pour rester en dehors du champ des directives financières restrictives comme MICA ou la SEC. Cette indépendance garantit une expérience fluide et simplifiée.') 
      },
      { 
        q: t('What are the platform fees?', 'Quels sont les frais de la plateforme ?'), 
        a: t('Transparency is key. We apply a fee of 2% to 5% on transactions de transfert direct and a 3% fee upon objective finalization of a project. These fees support the ecosystem\'s security and evolution.', 'La transparence est essentielle. Nous appliquons des frais de 2% à 5% sur les transactions de la Plateforme de Transfert et une commission de 3% lors de la finalisation des objectifs d\'un projet.') 
      }
    ],
    Security: [
      { 
        q: t('Is my investment safe?', 'Mon investissement est-il sûr ?'), 
        a: t('All rights are registered in our secure immutable registry. Because we operate with indexed contracts independent of traditional banking regulations like MICA, our focus is purely on the security of your creative rights and LYA UNITS.', 'Tous les droits sont enregistrés dans notre registre immuable. Comme nous opérons avec des contrats indexés indépendants des régulations bancaires type MICA, notre focus est la sécurité de vos droits créatifs et de vos LYA UNITS.') 
      },
      {
        q: t('Is my personal data protected?', 'Mes données personnelles sont-elles protégées ?'),
        a: t('Yes. LYA uses AES-256 encryption and never shares your data with third parties. You can request deletion of your account and all associated data at any time.', 'Oui. LYA utilise le chiffrement AES-256 et ne partage jamais vos données avec des tiers. Vous pouvez demander la suppression de votre compte et de toutes les données associées à tout moment.')
      }
    ],
    Creators: [
      {
        q: t('How do I submit a creative project?', 'Comment soumettre un projet créatif ?'),
        a: t('Go to the LinkArt section and fill in your project details: title, category, description, budget and milestones. Once submitted, your project enters the LYA validation queue.', 'Rendez-vous dans la section LinkArt et renseignez les détails de votre projet : titre, catégorie, description, budget et jalons. Une fois soumis, votre projet entre dans la file de validation LYA.')
      },
      {
        q: t('What types of projects are accepted?', 'Quels types de projets sont acceptés ?'),
        a: t('LYA accepts all creative industries: cinema, music, visual arts, architecture, gaming, fashion, photography, literature and more. Any project with commercial potential and documented creative rights can be submitted.', 'LYA accepte toutes les industries créatives : cinéma, musique, arts visuels, architecture, gaming, mode, photographie, littérature et plus encore. Tout projet avec un potentiel commercial et des droits créatifs documentés peut être soumis.')
      },
      {
        q: t('How is the LYA Score calculated for my project?', 'Comment est calculé le Score LYA pour mon projet ?'),
        a: t('The LYA Score (0-1000) combines 5 dimensions: Creative Quality (25%), Market Potential (25%), Legal Compliance (20%), Innovation Index (15%) and Growth Trajectory (15%). It is evaluated by certified Professional validators and updated as milestones are completed.', 'Le Score LYA (0-1000) combine 5 dimensions : Qualité Créative (25%), Potentiel de Marché (25%), Conformité Juridique (20%), Indice d\'Innovation (15%) et Trajectoire de Croissance (15%). Il est évalué par des validateurs Professionnels certifiés et mis à jour au fil des jalons.')
      },
      {
        q: t('Do I keep full creative control of my project?', 'Est-ce que je garde le contrôle créatif de mon projet ?'),
        a: t('Absolutely. Creators retain all moral rights and creative control. LYA Unit holders only receive economic participation rights. You can also exercise a buyback option after a 24-month lock-up period.', 'Absolument. Les créateurs conservent tous leurs droits moraux et le contrôle créatif. Les détenteurs d\'unités LYA ne reçoivent que des droits de participation économique. Vous pouvez également exercer une option de rachat après une période de blocage de 24 mois.')
      }
    ],
    t('Patrons & Partners', 'Mécènes & Partenaires'): [
      {
        q: t('How do I invest in a creative project?', 'Comment investir dans un projet créatif ?'),
        a: t('Browse the Registry or Exchange to find projects. Each LYA Unit costs $50 at issuance. You can acquire units directly from the creator during the initial offering or on the secondary market via the Exchange.', 'Parcourez le Registre ou le Centre d\'Échanges pour trouver des projets. Chaque Unité LYA coûte 50$ à l\'émission. Vous pouvez acquérir des unités directement auprès du créateur lors de l\'offre initiale ou sur le marché secondaire via l\'Exchange.')
      },
      {
        q: t('How do I earn returns on my investment?', 'Comment obtenir des rendements sur mon investissement ?'),
        a: t('Returns come from two sources: value appreciation (the LYA Score rising with each validated milestone increases the unit price on the secondary market) and revenue distributions automatically triggered when verified milestone events are completed.', 'Les rendements proviennent de deux sources : l\'appréciation de valeur (le Score LYA qui monte avec chaque jalon validé augmente le prix unitaire sur le marché secondaire) et les distributions de revenus déclenchées automatiquement lors de la complétion de jalons vérifiés.')
      },
      {
        q: t('Can I resell my LYA Units?', 'Puis-je revendre mes Unités LYA ?'),
        a: t('Yes. LYA Units can be traded on the secondary market (Exchange) at any time after the initial lock-up period defined in each contract. The resale price is dynamic and directly linked to the project\'s LYA Score.', 'Oui. Les Unités LYA peuvent être échangées sur le marché secondaire (Exchange) à tout moment après la période de blocage initiale définie dans chaque contrat. Le prix de revente est dynamique et directement lié au Score LYA du projet.')
      }
    ],
    Professionals: [
      {
        q: t('How do I become a validated Professional on LYA?', 'Comment devenir un Professionnel validé sur LYA ?'),
        a: t('Submit a Professional Verification request in the Apply for Verification section. Provide your professional credentials, portfolio and references. Validation is reviewed by the LYA committee within 5 to 10 business days.', 'Soumettez une demande de Vérification Professionnelle dans la section Postuler à la Vérification. Fournissez vos accréditations professionnelles, portfolio et références. La validation est examinée par le comité LYA sous 5 à 10 jours ouvrés.')
      },
      {
        q: t('What does Pro status unlock?', 'Qu\'est-ce que le statut Pro débloque ?'),
        a: t('Pro status gives access to: the Validation hub to evaluate projects and earn fees, the Lounge Pro for professional networking, advanced AI analytics, settlement batch management, governance voting rights and API access.', 'Le statut Pro donne accès à : le hub de Validation pour évaluer les projets et percevoir des honoraires, le Lounge Pro pour le réseautage professionnel, les analyses IA avancées, la gestion des lots de règlement, les droits de vote en gouvernance et l\'accès API.')
      },
      {
        q: t('How are Professional validators compensated?', 'Comment les validateurs Professionnels sont-ils rémunérés ?'),
        a: t('Validators earn a validation fee (percentage of the contract value) for each project they evaluate. Fees are paid in LYA Units and distributed automatically upon completion of the validation process.', 'Les validateurs perçoivent des honoraires de validation (pourcentage de la valeur du contrat) pour chaque projet évalué. Les honoraires sont versés en Unités LYA et distribués automatiquement à la complétion du processus de validation.')
      }
    ],
    Public: [
      {
        q: t('Do I need an account to browse LYA?', 'Ai-je besoin d\'un compte pour naviguer sur LYA ?'),
        a: t('No. The home page, Registry and Exchange are accessible in read-only mode without an account. To invest, submit a project or interact with the platform, you need to create a free account.', 'Non. La page d\'accueil, le Registre et le Centre d\'Échanges sont accessibles en lecture seule sans compte. Pour investir, soumettre un projet ou interagir avec la plateforme, vous devez créer un compte gratuit.')
      },
      {
        q: t('Is LYA free to use?', 'LYA est-il gratuit ?'),
        a: t('Creating an account and browsing the platform is completely free. Fees only apply to unit transactions (1.5% settlement fee on secondary market trades) and Pro subscription for advanced features.', 'La création d\'un compte et la navigation sur la plateforme sont entièrement gratuites. Des frais s\'appliquent uniquement aux transactions d\'unités (1,5% de frais de règlement sur les échanges du marché secondaire) et à l\'abonnement Pro pour les fonctionnalités avancées.')
      },
      {
        q: t('In which countries is LYA available?', 'Dans quels pays LYA est-il disponible ?'),
        a: t('LYA is available worldwide. The platform currently supports contracts under French Law, English Law and US Federal IP frameworks, with more jurisdictions being added regularly.', 'LYA est disponible dans le monde entier. La plateforme supporte actuellement les contrats sous droit français, droit anglais et cadres de PI fédéraux américains, avec d\'autres juridictions ajoutées régulièrement.')
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
                      
                      <div className="relative glass-panel p-8 rounded-[2.5rem] border-white/10 bg-surface-dim/40 hover:bg-surface-dim/60 hover:border-primary-cyan/30 transition-all duration-500 shadow-2xl h-full flex flex-col gap-4">
                        <div className="flex gap-5 items-start">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-cyan/20 to-primary-cyan/5 border border-primary-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <HelpCircle size={20} className="text-primary-cyan" />
                          </div>
                          <h3 className="text-base font-black text-white tracking-tight uppercase leading-tight group-hover:text-primary-cyan transition-colors duration-500 pt-1">
                            {item.q}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-all duration-500 text-justify pl-1">
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
                  
                  <p className="text-lg text-gray-400 leading-[1.8] font-medium opacity-80 group-hover:opacity-100 transition-opacity relative z-10 text-justify">
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
