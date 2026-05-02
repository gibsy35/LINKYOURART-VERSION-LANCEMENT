
import React from 'react';
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

interface Course {
  id: string;
  title: string;
  category: 'LEGAL' | 'FINANCE' | 'CREATIVE' | 'TECH';
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
}

export const AcademyView: React.FC<AcademyViewProps> = ({ user, onNotify }) => {
  const { t } = useTranslation();

  const [enrolledCourses, setEnrolledCourses] = React.useState<Set<string>>(new Set());
  const [filter, setFilter] = React.useState<string>('ALL');

  const handleEnroll = (courseId: string, courseTitle: string) => {
    if (enrolledCourses.has(courseId)) {
      onNotify(`ALREADY ENROLLED IN ${courseTitle.toUpperCase()}`);
      return;
    }
    setEnrolledCourses(prev => {
      const newSet = new Set(prev);
      newSet.add(courseId);
      return newSet;
    });
    onNotify(`ENROLLMENT SUCCESSFUL: ${courseTitle.toUpperCase()}`);
  };

  const courses: Course[] = [
    {
      id: '1',
      title: 'Professional Creative Rights: Foundations',
      category: 'FINANCE',
      instructor: 'ID_VANCE_88',
      duration: '12h 45m',
      level: 'BEGINNER',
      image: 'https://picsum.photos/seed/finance-edu/800/400',
      rating: 4.9,
      students: 1240
    },
    {
      id: '2',
      title: 'LYA-721 Smart Contract Architecture',
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
      title: 'EU Creative Rights & IP Regulation 2026',
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

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <PageHeader 
        titleWhite="LYA"
        titleAccent={t('Academy', 'ACADEMY')}
        description={t('MASTER THE CREATIVE RIGHTS ECONOMY THROUGH HIGH-LEVEL EXPERT EDUCATION.', 'MAÎTRISEZ L\'ÉCONOMIE DE LA VALEUR CRÉATIVE GRÂCE À UNE ÉDUCATION D\'EXPERT DE HAUT NIVEAU.')}
        accentColor="text-accent-gold"
      />

      <div className="relative z-20 -mt-32 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-8 px-6 md:px-12">
          <div className="flex flex-wrap gap-4">
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-accent-gold uppercase tracking-widest font-black mb-1 opacity-70">{t('Active Learners', 'Apprenants Actifs')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">12.4K+</div>
            </div>
            <div className="px-8 py-5 bg-surface-low border border-white/5 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[10px] text-primary-cyan uppercase tracking-widest font-black mb-1 opacity-70">{t('Certifications', 'Certifications')}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter uppercase">4.2K</div>
            </div>
          </div>
        </div>
      </div>

        {/* Academy Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 px-6 md:px-12">
        {[
          { label: 'Active Learners', value: '12.4K+', icon: <Users size={20} /> },
          { label: 'Expert Mentors', value: '85', icon: <Award size={20} /> },
          { label: 'Certifications', value: '4.2K', icon: <ShieldCheck size={20} /> },
          { label: 'Resource Library', value: '1.5K+', icon: <BookOpen size={20} /> }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-low/30 border border-white/5 p-6 rounded-2xl text-center group hover:border-primary-cyan/30 transition-all">
            <div className="flex justify-center mb-4 text-on-surface-variant group-hover:text-primary-cyan transition-colors">
              {stat.icon}
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Featured Courses */}
      <section className="px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary-cyan" size={24} />
            FEATURED CURRICULUM
          </h2>
          <div className="flex gap-4">
            {['ALL', 'FINANCE', 'TECH', 'LEGAL'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'text-primary-cyan' : 'text-on-surface-variant hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12">
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
                  <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-white ${
                    course.category === 'FINANCE' ? 'bg-accent-gold' :
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
                    {course.level}
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
                      ENROLLED
                    </>
                  ) : 'ENROLL NOW'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academy Programs */}
      <section className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-surface-low/50 to-primary-cyan/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Award size={100} className="text-primary-cyan" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">CERTIFICATION PROGRAM</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-md">
            Become a certified LYA Protocol Auditor or Registry Node Operator. Our professional certifications are recognized by major professional partners.
          </p>
          <div className="space-y-4 mb-8">
            {[
              'Professional Registry Auditor (PRA)',
              'Creative Rights Specialist (CRS)',
              'Protocol Node Architect (PNA)'
            ].map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-primary-cyan" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{cert}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNotify('CERTIFICATION PORTAL OPENING...')}
            className="px-10 py-4 bg-primary-cyan text-surface-dim font-black uppercase italic tracking-widest text-[11px] hover:bg-white transition-all shadow-2xl"
          >
            VIEW CERTIFICATIONS
          </button>
        </div>

        <div className="bg-gradient-to-br from-surface-low/50 to-accent-purple/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={100} className="text-accent-purple" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">EXPERT WORKSHOPS</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-md">
            Join live, interactive sessions with industry leaders. Deep dive into market analysis, legal frameworks, and creative technology.
          </p>
          <div className="space-y-4 mb-8">
            {[
              'Weekly Market Sentiment Analysis',
              'Legal Deep Dive: EU Regulations',
              'Generative AI & IP Rights Workshop'
            ].map((workshop, i) => (
              <div key={i} className="flex items-center gap-3">
                <Play size={16} className="text-accent-purple" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{workshop}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNotify('WORKSHOP CALENDAR OPENING...')}
            className="px-10 py-4 bg-accent-purple text-white font-black uppercase italic tracking-widest text-[11px] hover:bg-white hover:text-surface-dim transition-all shadow-2xl"
          >
            BROWSE WORKSHOPS
          </button>
        </div>
      </section>

      {/* Resource Library */}
      <section className="px-6">
        <div className="bg-surface-low/30 border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
              <BookOpen className="text-primary-cyan" size={24} />
              RESOURCE LIBRARY
            </h2>
            <button 
              onClick={() => onNotify('FULL RESOURCE LIBRARY OPENING...')}
              className="text-[10px] font-black uppercase tracking-widest text-primary-cyan hover:text-white transition-colors"
            >
              VIEW ALL RESOURCES
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Protocol Whitepaper v2.5', type: 'PDF', icon: <FileText /> },
              { title: 'Market Analysis Q1 2026', type: 'REPORT', icon: <Globe /> },
              { title: 'Legal Framework Guide', icon: <ShieldCheck /> },
              { title: 'Node Operator Manual', icon: <Zap /> }
            ].map((resource, i) => (
              <button 
                key={i} 
                onClick={() => onNotify(`DOWNLOADING ${resource.title.toUpperCase()}...`)}
                className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-primary-cyan/30 transition-all group"
              >                <div className="flex items-center gap-3">
                  <span className="text-on-surface-variant group-hover:text-primary-cyan transition-colors">{resource.icon}</span>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-white transition-colors">{resource.title}</span>
                </div>
                <ChevronRight size={14} className="text-on-surface-variant group-hover:text-primary-cyan transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
