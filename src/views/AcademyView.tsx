
import React from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { motion } from 'motion/react';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  Play, 
  ChevronRight, 
  Star,
  Clock,
  Globe,
  Zap,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { UserProfile } from '../types';
import { View } from '../components/ui/Sidebar';

interface Course {
  id: string;
  title: string;
  category: 'LEGAL' | 'BUSINESS' | 'CREATIVE' | 'TECH';
  instructor: string;
  duration: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  image: string;
  rating: number;
  students: number;
}

interface AcademyViewProps {
  user: UserProfile | null;
  onNotify: (msg: string) => void;
  onViewChange?: (view: View) => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ user, onNotify, onViewChange }) => {
  const { t } = useTranslation();

  const [enrolledCourses, setEnrolledCourses] = React.useState<Set<string>>(new Set());
  const [filter, setFilter] = React.useState<string>('ALL');

  const handleEnroll = (courseId: string, courseTitle: string) => {
    if (enrolledCourses.has(courseId)) {
      onNotify(t(`ALREADY ENROLLED IN ${courseTitle.toUpperCase()}`, `DÉJÀ INSCRIT À ${courseTitle.toUpperCase()}`));
      return;
    }
    setEnrolledCourses(prev => {
      const newSet = new Set(prev);
      newSet.add(courseId);
      return newSet;
    });
    onNotify(t(`ENROLLMENT SUCCESSFUL: ${courseTitle.toUpperCase()}`, `INSCRIPTION RÉUSSIE : ${courseTitle.toUpperCase()}`));
  };

  const courses: Course[] = [
    {
      id: '1',
      title: t('Professional Creative Rights: Foundations', 'Droits Créatifs Professionnels : Les Bases'),
      category: 'BUSINESS',
      instructor: 'ID_VANCE_88',
      duration: '12h 45m',
      level: 'BEGINNER',
      image: 'https://picsum.photos/seed/finance-edu/800/400',
      rating: 4.9,
      students: 1240
    },
    {
      id: '2',
      title: t('LYA Certification Architecture', 'Architecture de Certification LYA'),
      category: 'TECH',
      instructor: 'ID_CHEN_42',
      duration: '18h 20m',
      level: 'ADVANCED',
      image: 'https://picsum.photos/seed/tech-edu/800/400',
      rating: 4.8,
      students: 856
    },
    {
      id: '3',
      title: t('EU Creative Rights & IP Regulation 2026', 'Droits Créatifs UE & Réglementation PI 2026'),
      category: 'LEGAL',
      instructor: 'ID_JENKINS_07',
      duration: '10h 15m',
      level: 'INTERMEDIATE',
      image: 'https://picsum.photos/seed/legal-edu/800/400',
      rating: 5.0,
      students: 2100
    }
  ];

  const filteredCourses = filter === 'ALL' ? courses : courses.filter(c => c.category === filter);

  if (!user) return <AuthGuard user={user} onViewChange={onViewChange}>{null}</AuthGuard>;

  return (
    <div className="pb-12 relative overflow-hidden">
      <PageHeader 
        titleWhite={t('LYA', 'Académie')}
        titleAccent={t('Academy', 'LYA')}
        description={t('MASTER THE CREATIVE RIGHTS ECONOMY THROUGH HIGH-LEVEL EXPERT EDUCATION.', 'MAÎTRISEZ L\'ÉCONOMIE DE LA VALEUR CRÉATIVE GRÂCE À UNE ÉDUCATION D\'EXPERT DE HAUT NIVEAU.')}
        accentColor="text-accent-gold"
      />

      <div className="relative z-20 -mt-20 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8">
          <div className="px-5 py-3 bg-accent-gold/10 border border-accent-gold/25 rounded-2xl backdrop-blur-3xl shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold">
              {t('Programs launching progressively — validator verification is live now', 'Programmes lancés progressivement — la vérification validateur est disponible dès maintenant')}
            </p>
          </div>
        </div>
      </div>

        {/* Academy Stats — retiré : aucune donnée réelle derrière ces chiffres
            (12.4K apprenants, 4.2K certifications...) tant que les programmes
            ne sont pas réellement lancés. */}

      {/* Featured Courses — pas encore lancé, contenu non disponible */}
      <section className="px-6 space-y-8 mt-16 sm:mt-24 relative">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary-cyan" size={24} />
            {t('FEATURED CURRICULUM', 'PROGRAMME À L\'AFFICHE')}
          </h2>
          <span className="px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/25 rounded-full text-[10px] font-black uppercase tracking-widest text-accent-gold">
            {t('Coming Soon', 'Bientôt Disponible')}
          </span>
        </div>
        <div className="relative">
          <div className="pointer-events-none opacity-40 grayscale">
          <div className="flex gap-4">
            {[
              { key: 'ALL', label: t('ALL', 'TOUT') },
              { key: 'BUSINESS', label: t('BUSINESS', 'BUSINESS') },
              { key: 'TECH', label: t('TECH', 'TECH') },
              { key: 'LEGAL', label: t('LEGAL', 'JURIDIQUE') }
            ].map(cat => (
              <button 
                key={cat.key} 
                onClick={() => setFilter(cat.key)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat.key ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-surface-low/30 border border-white/5 rounded-2xl overflow-hidden group hover:border-primary-cyan/30 transition-all shadow-2xl">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-sm text-xs font-black uppercase tracking-widest text-white ${
                    course.category === 'BUSINESS' ? 'bg-accent-gold' :
                    course.category === 'TECH' ? 'bg-accent-purple' :
                    course.category === 'LEGAL' ? 'bg-emerald-500' : 'bg-primary-cyan'
                  }`}>
                    {course.category}
                  </span>
                </div>
                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                    <Play size={20} fill="currentColor" />
                  </div>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={12} />
                    {t(course.level, 
                      course.level === 'BEGINNER' ? 'DÉBUTANT' : course.level === 'INTERMEDIATE' ? 'INTERMÉDIAIRE' : 'AVANCÉ'
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-primary-cyan transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Users size={12} className="text-on-surface-variant" />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-accent-gold fill-accent-gold" />
                    <span className="text-[10px] font-black text-white">{course.rating}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEnroll(course.id, course.title)}
                  className={`w-full py-3 border font-black uppercase tracking-widest text-[10px] transition-all mt-4 flex items-center justify-center gap-2 ${enrolledCourses.has(course.id) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-surface-dim'}`}
                >
                  {enrolledCourses.has(course.id) ? (
                    <>
                      <ShieldCheck size={14} />
                      {t('ENROLLED', 'INSCRIT')}
                    </>
                  ) : t('ENROLL NOW', 'S\'INSCRIRE')}
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
        </div>
      </section>
      <section className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16 sm:mt-24">
        <div className="bg-gradient-to-br from-surface-low/50 to-primary-cyan/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Award size={100} className="text-primary-cyan" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t('CERTIFICATION PROGRAM', 'PROGRAMME DE CERTIFICATION')}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-md text-justify">
            {t(
              "Become a certified LYA Registry Auditor or LYA Registry Operator. Our professional certifications are recognized by major professional partners.",
              "Devenez un auditeur certifié du plateforme LYA ou un opérateur de nœud de registre. Nos certifications professionnelles sont reconnues par les grands partenaires professionnels."
            )}
          </p>
          <div className="space-y-4 mb-8">
            {[
              t('Professional Registry Auditor (PRA)', 'Auditeur Professionnel de Registre (PRA)'),
              t('Creative Rights Specialist (CRS)', 'Spécialiste des Droits Créatifs (CRS)'),
              t('LYA Registry Architect (LRA)', 'Architecte Registre LYA (LRA)')
            ].map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-primary-cyan" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{cert}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onViewChange('APPLY_VERIFICATION')}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-widest text-[11px] hover:bg-white transition-all shadow-2xl"
          >
            {t('APPLY FOR VALIDATOR VERIFICATION', 'DEVENIR VALIDATEUR')}
          </button>
        </div>

        <div className="bg-gradient-to-br from-surface-low/50 to-accent-purple/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group opacity-40 grayscale pointer-events-none">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={100} className="text-accent-purple" />
          </div>
          <span className="inline-block mb-4 px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/25 rounded-full text-[10px] font-black uppercase tracking-widest text-accent-gold">
            {t('Coming Soon', 'Bientôt Disponible')}
          </span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t('EXPERT WORKSHOPS', 'ATELIERS D\'EXPERTS')}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-md text-justify">
            {t(
              "Join live, interactive sessions with industry leaders. Deep dive into certification standards, legal frameworks, and creative technology.",
              "Participez à des sessions interactives en direct avec des leaders de l'industrie. Plongez dans les standards de certification, les cadres juridiques et la technologie créative."
            )}
          </p>
          <div className="space-y-4 mb-8">
            {[
              t('Weekly Market Sentiment Analysis', 'Analyse Hebdomadaire du Sentiment de Marché'),
              t('Legal Deep Dive: EU Regulations', 'Analyse Juridique : Réglementations UE'),
              t('Generative AI & IP Rights Workshop', 'Atelier IA Générative & Droits de PI')
            ].map((workshop, i) => (
              <div key={i} className="flex items-center gap-3">
                <Play size={16} className="text-accent-purple" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{workshop}</span>
              </div>
            ))}
          </div>
          <button 
            disabled
            className="px-10 py-4 bg-white/5 border border-white/10 text-on-surface-variant font-black uppercase italic tracking-widest text-[11px] cursor-not-allowed"
          >
            {t('BROWSE WORKSHOPS', 'PARCOURIR LES ATELIERS')}
          </button>
        </div>
      </section>

      {/* Resource Library */}
      <section className="px-6 mt-16 sm:mt-24 mb-16">
        <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8 opacity-40 grayscale pointer-events-none">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="text-primary-cyan" size={24} />
              {t('RESOURCE LIBRARY', 'BIBLIOTHÈQUE DE RESSOURCES')}
            </h2>
            <span className="px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/25 rounded-full text-[10px] font-black uppercase tracking-widest text-accent-gold">
              {t('Coming Soon', 'Bientôt Disponible')}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('LYA Certification Standard', 'Standard de Certification LYA'), type: 'PDF', icon: <FileText /> },
              { title: t('Creative Industries Market Report', 'Rapport de Marché des Industries Créatives'), type: 'REPORT', icon: <Globe /> },
              { title: t('Legal Framework Guide', 'Guide du Cadre Juridique'), icon: <ShieldCheck /> },
              { title: t('Professional Validator Guide', 'Guide du Validateur Professionnel'), icon: <Zap /> }
            ].map((resource, i) => (
              <div
                key={i} 
                className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-on-surface-variant">{resource.icon}</span>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{resource.title}</span>
                </div>
                <ChevronRight size={14} className="text-on-surface-variant" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
