
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Target, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users, 
  Award,
  ChevronRight,
  TrendingUp,
  Heart,
  MousePointer2
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { Logo } from '../components/ui/Logo';
import { View } from '../components/ui/Sidebar';
import { PageHeader } from '../components/ui/PageHeader';
import { Player } from '../components/ui/Player';

interface AboutViewProps {
  onViewChange?: (view: View) => void;
  onNotify?: (msg: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onViewChange, onNotify }) => {
  const { t } = useTranslation();
  
  const backgroundImages = [
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1550684848-fa11341e73ad?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1492037766660-2a56f9eb3fcb?auto=format&fit=crop&q=80&w=2000'
  ];

  const [randomImage, setRandomImage] = React.useState(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRandomImage(backgroundImages[Math.floor(Math.random() * backgroundImages.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: t('Evaluated Projects', 'Projets évalués'), value: '10K+', sub: t('Global Database', 'Base de données mondiale') },
    { label: t('Active Users', 'Utilisateurs actifs'), value: '50K+', sub: t('Verified Network', 'Réseau vérifié') },
    { label: t('Funds Raised', 'Fonds levés'), value: '$25M', sub: t('Creative Value', 'Valeur Créative') },
    { label: t('Success Rate', 'Taux de réussite'), value: '87%', sub: t('Project Completion', 'Finalisation de projet') }
  ];

  return (
    <div className="space-y-24 pb-24 px-6 md:px-16 lg:px-24">
      {/* Interactive Hero Section - Full width within its container or absolute bleed */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden group -mx-6 md:-mx-16 lg:-mx-24 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 z-0 grayscale transition-all duration-700 group-hover:grayscale-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={randomImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5 }}
              src={randomImage} 
              alt="About Background" 
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/60 transition-opacity duration-700 group-hover:opacity-40" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter transition-colors duration-700 group-hover:text-primary-cyan drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              ABOUT <br />
              <span className="group-hover:text-white">LINKYOURART</span>
            </h1>
            <div className="h-1.5 w-24 bg-primary-cyan mx-auto mt-8 mb-8 transition-all duration-700 group-hover:w-64 shadow-[0_0_20px_rgba(0,224,255,0.5)]" />
            <p className="text-xl md:text-2xl text-white font-black uppercase tracking-[0.2em] max-w-3xl mx-auto italic transition-colors duration-700 group-hover:text-accent-gold">
              {t('World First Creative Exchange System', 'Premier Système d\'Échange Créatif au Monde')}
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="text-[10px] font-black text-white uppercase tracking-[0.5em]">{t('HOVER TO ACTIVATE', 'SURVOLER POUR ACTIVER')}</div>
          <MousePointer2 className="text-white animate-bounce" size={20} />
        </div>
      </section>

      {/* History Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center px-4 md:px-0">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center">
              <History className="text-primary-cyan" size={24} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
              {t('Our History', 'Notre Histoire')}
            </h2>
          </div>
          
          <div className="space-y-6 text-on-surface-variant leading-relaxed text-base md:text-lg font-medium opacity-70">
            <p>
              {t(
                "LINKYOURART, founded in 2006, is among the first representation and networking hubs dedicated to creative talents on an international scale. From its beginnings, the platform's mission has been to create bridges between artists and cultural industries, supporting directors, screenwriters, producers, composers, musicians, 3D artists, animators, designers, illustrators, photographers, visual and contemporary artists, video game developers, as well as creators from digital arts, performing arts, and new media.",
                "LINKYOURART, fondé en 2006, figure parmi les premiers hubs de représentation et de mise en relation dédiés aux talents créatifs à l'échelle internationale. Dès ses débuts, la plateforme s'est donnée pour mission de créer des passerelles entre les artistes et les industries culturelles, en accompagnant des réalisateurs, scénaristes, producteurs, compositeurs, musiciens, artistes 3D, animateurs, designers, illustrateurs, photographes, artistes visuels et contemporains, développeurs de jeux vidéo, ainsi que des créateurs issus des arts numériques, de la scène et des nouveaux médias."
              )}
            </p>
            <p>
              {t(
                "Conceived as a space for convergence between art, technology, and industry, LINKYOURART has contributed to revealing and supporting both emerging and established talents, fostering collaborations, visibility, and the realization of ambitious artistic projects.",
                "Pensé comme un espace de convergence entre l'art, la technologie et l'industrie, LINKYOURART a contribué à révéler et accompagner des talents émergents comme confirmés, en favorisant les collaborations, la visibilité et la concrétisation de projets artistiques ambitieux."
              )}
            </p>
            <p>
              {t(
                "Today, on its 20th anniversary, LINKYOURART is embarking on a new stage with the launch of an entirely redesigned platform, more contemporary, more immersive, and aligned with new economic models of creation.",
                "Aujourd'hui, à l'occasion de ses 20 ans, LINKYOURART entame une nouvelle étape avec le lancement d'une plateforme entièrement repensée, plus contemporaine, plus immersive et alignée avec les nouveaux modèles économiques de la création."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-low/30 border border-white/5 rounded-2xl">
              <p className="text-2xl font-black text-primary-cyan italic mb-1">2006</p>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('FOUNDATION', 'FONDATION')}</p>
            </div>
            <div className="p-6 bg-surface-low/30 border border-white/5 rounded-2xl">
              <p className="text-2xl font-black text-accent-purple italic mb-1">2026</p>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('REVOLUTION', 'RÉVOLUTION')}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-primary-cyan/10 blur-3xl rounded-full opacity-50" />
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-surface-low/20 group">
            <Logo 
              size={320} 
              color="multi"
              className="transition-all duration-1000 drop-shadow-[0_0_50px_rgba(0,224,255,0.3)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl">
                <p className="text-sm font-bold text-white leading-relaxed italic">
                  "{t(
                    "More than a platform, LINKYOURART stands today as a hybrid creative ecosystem.",
                    "Plus qu'une plateforme, LINKYOURART s'impose aujourd'hui comme un écosystème créatif hybride."
                  )}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface-low/30 border border-white/5 p-10 rounded-3xl text-center group hover:border-primary-cyan/30 transition-all shadow-xl">
              <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-2 group-hover:text-primary-cyan transition-colors">
                {stat.value}
              </h3>
              <p className="text-xs font-black text-on-surface uppercase tracking-[0.2em] mb-1">
                {stat.label}
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-50">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            {t('Our Values', 'Nos Valeurs')}
          </h2>
          <div className="w-24 h-1 bg-primary-cyan mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: t('Mission', 'Mission'),
              icon: <Target className="text-primary-cyan" />,
              desc: t(
                "Transforming creative ideas into living projects. We professionally evaluate each project, then break it down into contractual rights indexed to its performance.",
                "Transformer les idées créatives en projets vivants. Nous évaluons professionnellement chaque projet, puis le découpons en droits contractuels indexés sur sa performance."
              )
            },
            {
              title: t('Transparency', 'Transparence'),
              icon: <ShieldCheck className="text-emerald-400" />,
              desc: t(
                "Our LYA algorithm evaluates each project according to 5 objective and public criteria: Portfolio, Recognition, Community, Consistency, Potential. Zero opacity, 100% verifiable data.",
                "Notre algorithme LYA évalue chaque projet selon 5 critères objectifs et publics : Portfolio, Reconnaissance, Communauté, Cohérence, Potentiel. Zéro opacité, 100% de données vérifiables."
              )
            },
            {
              title: t('Innovation', 'Innovation'),
              icon: <Zap className="text-accent-purple" />,
              desc: t(
                "We combine professional evaluation, indexed contractual rights, and a community market in a spectacular creative experience. Neural Network LYA, Project DNA, Live Exchange Feed.",
                "Nous combinons évaluation professionnelle, droits contractuels indexés et marché communautaire dans une expérience créative spectaculaire. Neural Network LYA, Project DNA, Live Exchange Feed."
              )
            },
            {
              title: t('International', 'International'),
              icon: <Globe className="text-primary-cyan" />,
              desc: t(
                "LinkYourArt is multilingual and open to creative projects, investors, and professionals from all over the world. The creative industry has no borders.",
                "LinkYourArt est multilingue et ouvert aux projets créatifs, investisseurs et professionnels du monde entier. L'industrie créative n'a pas de frontières."
              )
            }
          ].map((value, i) => (
            <div key={i} className="bg-surface-low/30 border border-white/5 p-10 rounded-[2rem] space-y-6 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{value.title}</h3>
              </div>
              <p className="text-base text-on-surface-variant font-medium leading-relaxed opacity-70">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8">
        <div className="bg-gradient-to-r from-primary-cyan/20 via-accent-purple/20 to-primary-cyan/20 border border-white/10 rounded-[3rem] p-16 text-center space-y-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
              {t('Join the Creative Revolution', 'Rejoignez la révolution créative')}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-medium opacity-80">
              {t(
                "Whether you are a creator, investor, or art professional, LinkYourArt is made for you.",
                "Que vous soyez créateur, investisseur, ou professionnel de l'art, LinkYourArt est fait pour vous."
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={() => onViewChange?.('SIGNUP')}
              className="px-12 py-6 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-[0.2em] text-sm hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,224,255,0.2)] active:scale-95"
            >
              {t('Start Now', 'Commencer maintenant')}
            </button>
            <button 
              onClick={() => onViewChange?.('HOME')}
              className="px-12 py-6 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-[0.2em] text-sm hover:bg-white hover:text-surface-dim transition-all active:scale-95"
            >
              {t('Learn More', 'En savoir plus')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <footer className="px-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <Heart className="text-accent-pink animate-pulse" size={32} />
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.5em] opacity-40">
            MADE WITH PASSION FOR THE CREATIVE ECONOMY
          </p>
        </div>
      </footer>
    </div>
  );
};
