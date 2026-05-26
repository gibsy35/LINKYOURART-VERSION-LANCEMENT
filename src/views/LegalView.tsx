
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Shield, Lock, FileText, Scale, Globe, AlertCircle, Target, MessageSquare, HelpCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface LegalViewProps {
  type: 'TERMS' | 'PRIVACY' | 'REGISTRY' | 'OUR_MODEL' | 'FAQ' | 'MENTIONS';
  onNotify: (msg: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onNotify }) => {
  const { t } = useTranslation();
  const [activeFaqTab, setActiveFaqTab] = React.useState('General');

  const faqThemes = [
    { id: 'General', label: t('General', 'Général') },
    { id: 'Creators', label: t('Creators', 'Créateurs') },
    { id: 'Investors', label: t('Investors', 'Investisseurs') },
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
          text: t('LinkYourArt (LYA) is an inclusive ecosystem open to creators, investors, professionals, and the general public. We break down the barriers of the traditional art world to offer everyone a place in the creative economy. Our model is based on simplicity and fairness.', 'LinkYourArt (LYA) est un écosystème inclusif ouvert aux créateurs, aux investisseurs, aux professionnels et au grand public. Nous brisons les barrières du monde de l\'art traditionnel pour offrir à chacun une place dans l\'économie de la création. Notre modèle repose sur la simplicité et l\'équité.')
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
          text: t('The LYA Registry is not a financial ledger, but a creative one. It documents the ownership and history of each indexed project, ensuring that every creator and investor has an immutable proof of their rights, transparent and accessible to everyone.', 'Le Registre LYA n\'est pas un livre de comptes financier, mais un registre créatif. Il documente la propriété et l\'historique de chaque projet indexé, assurant que chaque créateur et investisseur possède une preuve immuable de ses droits.')
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
          text: t('The LYA ecosystem is powered by a modern and secure technical architecture, ensuring a smooth experience for all creators, investors, professionals and audiences worldwide.', 'L\'écosystème LYA est propulsé par une architecture technique moderne et sécurisée, assurant une expérience fluide pour tous les créateurs, investisseurs, professionnels et publics du monde entier.')
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
      title: t('FAQ Support', 'Support FAQ'),
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
        a: t('Everyone! LYA is designed for creators, investors, professionals, and the general public. We offer a simple and fair model for all actors in the artistic world.', 'Tout le monde ! LYA est conçu pour les créateurs, investisseurs, professionnels et le grand public. Nous proposons un modèle simple et équitable pour tous les acteurs du monde artistique.') 
      },
      { 
        q: t('Is LYA regulated like a bank or by MICA/SEC?', 'LYA est-elle réglementée par MICA ou la SEC ?'), 
        a: t('Our ecosystem operates via indexed creative contracts, specifically designed to remain outside the scope of restrictive financial directives such as MICA or SEC. This independence ensures a seamless and simplified experience for our community.', 'Notre écosystème opère via des contrats créatifs indexés, spécifiquement conçus pour rester en dehors du champ des directives financières restrictives comme MICA ou la SEC. Cette indépendance garantit une expérience fluide et simplifiée.') 
      },
      { 
        q: t('What are the platform fees?', 'Quels sont les frais de la plateforme ?'), 
        a: t('Transparency is key. We apply a fee of 2% to 5% on P2P Exchange transactions and a 3% fee upon objective finalization of a project. These fees support the ecosystem\'s security and evolution.', 'La transparence est essentielle. Nous appliquons des frais de 2% à 5% sur les transactions de l\'Exchange P2P et une commission de 3% lors de la finalisation des objectifs d\'un projet.') 
      }
    ],
    Creators: [
      { 
        q: t('How to list a creation?', 'Comment lister une création ?'), 
        a: t('Submit your project through our interface. Once indexed by our experts and the LYA Score, you can emit LYA UNITS (reference index initially set at 50 USD) to raise funds. Its value will then fluctuate according to the project development and milestones.', 'Soumettez votre projet via notre interface. Une fois indexé par nos experts et le Score LYA, vous pouvez émettre des LYA UNITS (indice de référence fixé à 50 USD au départ). Sa valeur fluctuera ensuite selon le développement du projet et ses jalons.') 
      },
      { 
        q: t('What are the benefits for project holders?', 'Quels sont les avantages pour les porteurs de projets ?'), 
        a: t('Access to immediate financing via LYA UNITS without selling shares. You maintain control of your IP while creating a financial layer for your work. Success is directly linked to the respect of your milestones, which increases the unit value for everyone.', 'Accès à un financement immédiat via les LYA UNITS sans céder de parts sociales. Vous gardez le contrôle de votre PI tout en créant une couche financière pour votre œuvre. Le succès est lié au respect de vos jalons, ce qui augmente la valeur de l\'unité.') 
      }
    ],
    Investors: [
      { 
        q: t('How do I earn with LYA?', 'Comment gagner avec LYA ?'), 
        a: t('By holding LYA UNITS of a project. If the creator respects their milestones and the project develops well, the LYA Score increases and the LYA UNIT value rises above the initial 50 USD. You can resale your units on the P2P exchange at any time.', 'En détenant des LYA UNITS d\'un projet. Si le créateur respecte ses jalons, le Score LYA monte et la valeur de l\'unité LYA dépasse les 50 USD initiaux. Vous pouvez revendre vos unités sur l\'Exchange P2P à tout moment.') 
      },
      { 
        q: t('How is the value of LYA UNITS calculated?', 'Comment est calculée la valeur des LYA UNITS ?'), 
        a: t('The LYA UNIT has a fixed reference index of 50 USD at issuance. Its variations depend solely on the LYA Score (0-1000). Every point earned above the baseline increases the unit value, while missing a milestone recalibrates it downwards.', 'L\'unité LYA a un indice de référence de 50 USD à l\'émission. Ses variations dépendent du Score LYA (0-1000). Chaque point gagné au-dessus de la ligne de base augmente la valeur, tandis qu\'un jalon manqué la recalibre à la baisse.') 
      }
    ],
    Professionals: [
      { 
        q: t('As a professional, what is my role in LYA?', 'En tant que professionnel, quel est mon rôle ?'), 
        a: t('Independents, agencies, studios, labels, or production companies acts as validators. Your expertise contributes to the LYA Score. LYA allows professionals to identify talents and potentially acquisition creative rights via the Exchange.', 'Les indépendants, agences, studios, labels ou entreprises de production agissent comme validateurs. Votre expertise contribue au Score LYA. LYA permet d\'identifier des talents et d\'acquérir des droits créatifs via l\'Exchange.') 
      },
      { 
        q: t('Can I manage a portfolio for my clients?', 'Puis-je gérer un portefeuille pour mes clients ?'), 
        a: t('Absolutely. Professionals have advanced tools to track multiple projects and act as advisors or brokers within the creative economy ecosystem.', 'Absolument. Les professionnels disposent d\'outils avancés pour suivre plusieurs projets et agir en tant que conseillers ou courtiers au sein de l\'écosystème.') 
      }
    ],
    Public: [
      { 
        q: t('Is LYA accessible to the general public?', 'LYA est-elle accessible au grand public ?'), 
        a: t('Absolutely. LYA democratizes creation support. Anyone can acquire LYA UNITS of a specific project through a simple interface. You support the work, not just the person.', 'Absolument. LYA démocratise le soutien à la création. N\'importe qui peut acquérir des LYA UNITS d\'un projet via une interface simple. Vous soutenez l\'œuvre.') 
      },
      { 
        q: t('How are creators and projects identified?', 'Comment sont identifiés les créateurs et les projets ?'), 
        a: t('All projects are designated by unique identifiers to focus on the work. Identification/Networking is reserved for professional actors via the Lounge Pro to connect with project holders.', 'Tous les projets sont désignés par des identifiants uniques. L\'identification et le networking sont réservés aux acteurs professionnels via le Lounge Pro pour se connecter avec les porteurs de projets.') 
      }
    ],
    Security: [
      { 
        q: t('Is my investment safe?', 'Mon investissement est-il sûr ?'), 
        a: t('All rights are registered in our secure immutable registry. Because we operate with indexed contracts independent of traditional banking regulations like MICA, our focus is purely on the security of your creative rights and LYA UNITS.', 'Tous les droits sont enregistrés dans notre registre immuable. Comme nous opérons avec des contrats indexés indépendants des régulations bancaires type MICA, notre focus est la sécurité de vos droits créatifs et de vos LYA UNITS.') 
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
            <div className="px-8 py-5 bg-surface-dim/80 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-primary-cyan uppercase tracking-[0.2em] font-black mb-1 opacity-70">{t('Ecosystem Status', 'Statut de l\'Écosystème')}</div>
              <div className="text-3xl font-black text-white tracking-tighter uppercase">{t('Active & Secure', 'ACTIF & SÉCURISÉ')}</div>
            </div>
            <div className="px-8 py-5 bg-surface-dim/80 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-black mb-1 opacity-70">{t('Protocol Version', 'Version du Protocole')}</div>
              <div className="text-3xl font-black text-white tracking-tighter uppercase">V4.2.0</div>
            </div>
          </div>
        </div>

        {type === 'FAQ' && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 mb-16 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md inline-flex">
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
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-cyan shadow-[0_0_40px_rgba(0,224,255,0.4)]"
                    />
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
                  {faqContent[activeFaqTab as keyof typeof faqContent].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="group relative"
                    >
                      {/* Depth Effect Background */}
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-cyan/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="relative glass-panel p-10 rounded-[2.5rem] border-white/10 bg-surface-dim/40 hover:bg-surface-dim/60 hover:border-primary-cyan/30 transition-all duration-500 shadow-2xl h-full flex flex-col">
                        <div className="flex gap-6 items-start mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-cyan/20 to-primary-cyan/5 border border-primary-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <HelpCircle size={24} className="text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.5)]" />
                          </div>
                          <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-primary-cyan transition-colors duration-500">
                            {item.q}
                          </h3>
                        </div>
                        <div className="mt-auto">
                          <p className="text-base text-gray-400 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-all duration-500 text-justify">
                            {item.a}
                          </p>
                        </div>
                        
                        {/* Interactive Accent */}
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
              <div className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Hash: 0x82f...a92e</div>
            </div>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => onNotify('PREPARING PDF DOWNLOAD...')}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
            >
              {t('Download PDF', 'Télécharger PDF')}
            </button>
            <button 
              onClick={() => onNotify('ACCESSING HISTORICAL ARCHIVES...')}
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
