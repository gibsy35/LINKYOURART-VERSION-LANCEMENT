import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Terminal,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Logo } from '../components/ui/Logo';

interface PendingApprovalViewProps {
  user: UserProfile;
  onApprove: () => void;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ user, onApprove, onLogout }) => {
  const { t } = useTranslation();

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case UserRole.PATRON:
        return t('Art Patrons, VCs & Cultural Backers', 'Mécène, Fonds d\'Accompagnement & VC');
      case UserRole.CREATOR:
        return t('Creator, Independent Producer & Talent', 'Créateur, Label & Talent Indépendant');
      case UserRole.PROFESSIONAL:
        return t('Arts Curator, Agent & Cultural Advisor', 'Curateur, Agent Artistique & Conseiller');
      default:
        return t('Cultural Partner', 'Partenaire Créatif');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden font-mono select-none">
      {/* Visual backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(0,224,255,0.06)_0%,transparent_60%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF007F]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9D00FF]/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#080B10] border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col min-h-[500px]"
      >
        {/* Glow Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-cyan via-[#FF007F] to-[#9D00FF]" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* Main Info Block */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Logo size={42} color="multi" showBeta={true} />
                <div className="flex flex-col">
                  <span className="font-headline font-black text-lg tracking-tight uppercase">LINK<span style={{ letterSpacing: '0.03em' }}>Y</span>OURART</span>
                  <span className="text-[7px] font-bold text-primary-cyan tracking-[0.4em] uppercase">{t('CREATIVE CERTIFICATION', 'CERTIFICATION CRÉATIVE')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  <Clock size={10} className="animate-pulse" />
                  {t('ACCOUNT UNDER REVIEW', 'COMPTE EN COURS DE VALIDATION')}
                </div>
                <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter leading-none italic text-white">
                  {t('ALMOST THERE', 'PRESQUE PRÊT')} <br />
                  <span className="text-primary-cyan">{t('ONE STEP LEFT', 'PLUS QU\'UNE ÉTAPE')}</span>
                </h2>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold leading-relaxed pt-2 leading-relaxed text-justify">
                  {t(
                    'The LinkYourArt certification platform is a space reserved for creators, patrons and creative industry professionals. Your account has been created — our team will review your profile shortly.',
                    'La plateforme de certification LinkYourArt est un espace réservé aux créateurs, mécènes et professionnels des industries créatives. Votre compte a été créé — notre équipe examinera votre profil prochainement.'
                  )}
                </p>
              </div>

              {/* Profile Details */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">{t('YOUR PROFILE', 'VOTRE PROFIL')}</div>
                <div className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Award size={12} className="text-primary-cyan" />
                  {getRoleLabel(user.role)}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium pt-1">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-6">
              <button 
                onClick={onLogout}
                className="inline-flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-all group"
              >
                <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
                {t('LOG OUT', 'SE DÉCONNECTER')}
              </button>
            </div>
          </div>

          {/* Timeline and Bypass Panel */}
          <div className="lg:col-span-5 p-8 md:p-12 bg-white/[0.01] flex flex-col justify-between space-y-8">
            {/* Timeline Progress */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-white/40 tracking-[0.4em] uppercase">{t('WHAT HAPPENS NEXT', 'PROCHAINES ÉTAPES')}</h3>
              
              <div className="space-y-6 relative pl-3 border-l border-white/5">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">{t('STEP 1: ACCOUNT CREATED', '1. COMPTE CRÉÉ')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('your information has been received', 'vos informations ont bien été reçues')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-violet-500 border-2 border-black flex items-center justify-center animate-pulse" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-violet-500 uppercase tracking-wider">{t('STEP 2: TEAM REVIEW', '2. VALIDATION PAR L\'ÉQUIPE')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('usually within 24 hours', 'généralement sous 24h')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative opacity-40">
                  <div className="absolute -left-[19px] top-0 w-3 h-3 rounded-full bg-white/20 border-2 border-black flex items-center justify-center" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-white uppercase tracking-wider">{t('STEP 3: FULL ACCESS', '3. ACCÈS COMPLET')}</div>
                    <p className="text-[10px] text-white/50 lowercase italic leading-none">{t('welcome to LYA', 'bienvenue sur LYA')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creative Ecosystem Banner */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[7px] font-black text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-400" />
            {t('CERTIFIED CREATIVE REGISTRY', 'REGISTRE DE CERTIFICATION CRÉATIVE')}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
