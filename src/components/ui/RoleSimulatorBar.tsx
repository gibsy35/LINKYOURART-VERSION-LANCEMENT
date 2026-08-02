import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Eye, Palette, TrendingUp, Briefcase, ChevronDown, Zap, EyeOff } from 'lucide-react';
import { UserRole } from '../../types';

export type SimulatedRole = 'VISITOR' | UserRole.CREATOR | UserRole.PATRON | UserRole.PROFESSIONAL | UserRole.ADMIN;

interface RoleSimulatorBarProps {
  simulatedRole: SimulatedRole | null;
  onRoleChange: (role: SimulatedRole | null) => void;
}

const ROLES: { key: SimulatedRole; label: string; labelFr: string; icon: React.ReactNode; color: string }[] = [
  { key: 'VISITOR',                  label: 'VISITOR',       labelFr: 'VISITEUR',       icon: <Eye size={13} />,        color: 'text-white/50' },
  { key: UserRole.CREATOR,           label: 'CREATOR',       labelFr: 'CRÉATEUR',       icon: <Palette size={13} />,    color: 'text-primary-cyan' },
  { key: UserRole.PATRON,          label: 'PATRON',        labelFr: 'MÉCÈNE',         icon: <TrendingUp size={13} />, color: 'text-yellow-400' },
  { key: UserRole.PROFESSIONAL,      label: 'PROFESSIONAL',  labelFr: 'PROFESSIONNEL',  icon: <Briefcase size={13} />,  color: 'text-purple-400' },
  { key: UserRole.ADMIN,             label: 'ADMIN',         labelFr: 'ADMIN',          icon: <ShieldCheck size={13} />,color: 'text-emerald-400' },
];

export const RoleSimulatorBar: React.FC<RoleSimulatorBarProps> = ({ simulatedRole, onRoleChange }) => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const active = ROLES.find(r => r.key === (simulatedRole ?? UserRole.ADMIN)) ?? ROLES[4];

  // Masqué : ne laisse qu'un petit tab discret en bas à droite pour le réafficher
  if (hidden) {
    return (
      <div className="fixed bottom-4 right-4 z-[600] pointer-events-auto">
        <button
          onClick={() => setHidden(false)}
          title="Réafficher le simulateur admin"
          className="flex items-center justify-center w-8 h-8 bg-[#0D1117]/80 border border-emerald-500/20 backdrop-blur-xl hover:border-emerald-500/50 transition-all rounded-full opacity-40 hover:opacity-100"
        >
          <Eye size={12} className="text-emerald-400/70" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Main pill */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-3 px-5 py-3 bg-[#0D1117]/95 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(74,222,128,0.15)] hover:border-emerald-500/60 transition-all font-mono"
        >
          <Zap size={12} className="text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400/70">ADMIN SIMULATOR</span>
          <span className="w-px h-4 bg-white/10" />
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${active.color}`}>
            {active.icon} {active.labelFr}
          </span>
          <ChevronDown size={12} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
          <span className="w-px h-4 bg-white/10" />
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); setHidden(true); setOpen(false); }}
            title="Masquer (utile pour les captures d'écran)"
            className="flex items-center justify-center hover:text-white/80 text-white/40 transition-colors"
          >
            <EyeOff size={13} />
          </span>
        </button>

        {/* Dropdown */}
        <AnimatePresence mode="sync">
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full mb-2 left-0 right-0 bg-[#0D1117]/98 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">SIMULER UN RÔLE</p>
              </div>
              <div className="p-2 space-y-1">
                {ROLES.map(role => (
                  <button
                    key={role.key}
                    onClick={() => {
                      onRoleChange(role.key === UserRole.ADMIN ? null : role.key);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all hover:bg-white/5 ${
                      (simulatedRole === role.key || (!simulatedRole && role.key === UserRole.ADMIN))
                        ? 'bg-white/5'
                        : ''
                    }`}
                  >
                    <span className={role.color}>{role.icon}</span>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${role.color}`}>{role.labelFr}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        {role.key === 'VISITOR' ? 'Non connecté — accès limité' :
                         role.key === UserRole.CREATOR ? 'Accès créateur standard' :
                         role.key === UserRole.PATRON ? 'Accès mécène + Pro' :
                         role.key === UserRole.PROFESSIONAL ? 'Accès professionnel + Pro' :
                         'Accès total administrateur'}
                      </p>
                    </div>
                    {(simulatedRole === role.key || (!simulatedRole && role.key === UserRole.ADMIN)) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-white/5">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Visible uniquement par l'administrateur</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
