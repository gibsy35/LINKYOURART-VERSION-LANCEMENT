
import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  Award, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  LayoutGrid,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface IssuerProfileProps {
  issuerId: string;
  onBack: () => void;
  onSelectContract?: (contractId: string) => void;
}

export const IssuerProfileView: React.FC<IssuerProfileProps> = ({ issuerId, onBack }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Mock data for the issuer
  const issuerData = {
    name: issuerId,
    description: "LinkYourArt Institutional registry specializing in high-frequency creative equity and neural asset distribution. This issuer maintains a triple-A rating within the LYA compliance framework.",
    founded: "2024",
    location: "Geneva, CH / Metaverse Sector 7",
    rating: "AAA+",
    totalVolume: "1.2B €",
    activeContracts: 14,
    successRate: "98.2%",
    team: [
      { name: "Dr. Aris Thorne", role: "Chief Neural Architect", avatar: "https://i.pravatar.cc/150?u=aris" },
      { name: "Sarah Vance", role: "Legislative Liaison", avatar: "https://i.pravatar.cc/150?u=sarah" },
      { name: "Kaelen Voss", role: "Market Integrity Lead", avatar: "https://i.pravatar.cc/150?u=kaelen" }
    ],
    stats: [
      { label: "Market Dominance", value: "14.2%", growth: "+2.1%" },
      { label: "Asset Liquidity", value: "High", growth: "Stable" },
      { label: "Compliance Score", value: "998/1000", growth: "+5" }
    ]
  };

  return (
    <div className="space-y-12 pb-24 px-6 lg:px-12 animate-in fade-in duration-700">
      {/* Back Button & Header */}
      <header className="pt-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-[10px] font-black text-on-surface-variant hover:text-white transition-all uppercase tracking-[0.3em] mb-12 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('Back to Marketplace', 'Retour au Marché')}
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-20 h-20 bg-surface-low border border-white/10 rounded-2xl flex items-center justify-center text-primary-cyan shadow-2xl relative group overflow-hidden">
                 <Building2 size={32} />
                 <div className="absolute inset-0 bg-primary-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-primary-cyan/10 border border-primary-cyan/30 text-primary-cyan text-[8px] font-black uppercase tracking-widest">LYA CENTER 0x44</span>
                    <ShieldCheck size={14} className="text-emerald-400" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white uppercase leading-none">{issuerData.name}</h1>
               </div>
            </div>
            
            <p className="border-l-2 border-primary-cyan pl-6 text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed opacity-80 font-medium">
              {issuerData.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
             <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl min-w-[180px]">
               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-1 opacity-50">{t('Registry Rating', 'Note du Registre')}</p>
               <p className="text-2xl font-black text-accent-gold tracking-tighter">{issuerData.rating}</p>
             </div>
             <div className="bg-surface-low/30 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl min-w-[180px]">
               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-1 opacity-50">{t('Total AUM', 'AUM Total')}</p>
               <p className="text-2xl font-black text-white tracking-tighter">{issuerData.totalVolume}</p>
             </div>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Stats & Info */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-surface-dim border border-white/5 p-8 rounded-[2rem] space-y-8 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-4">{t('INSTITUTIONAL METRICS', 'MÉTRIQUES INSTITUTIONNELLES')}</h3>
              
              <div className="space-y-6">
                {issuerData.stats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-end p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40 mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-white leading-none">{stat.value}</p>
                    </div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{stat.growth}</div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-3 text-on-surface-variant">
                   <MapPin size={16} className="text-primary-cyan" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{issuerData.location}</span>
                 </div>
                 <div className="flex items-center gap-3 text-on-surface-variant">
                   <Calendar size={16} className="text-primary-cyan" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{t('Active since', 'Actif depuis')} {issuerData.founded}</span>
                 </div>
                 <div className="flex items-center gap-3 text-on-surface-variant">
                   <Globe size={16} className="text-primary-cyan" />
                   <span className="text-[10px] font-black uppercase tracking-widest">registry-v4.linkyourart.network</span>
                 </div>
              </div>
           </div>

           <div className="bg-surface-low/30 border border-white/10 p-8 rounded-[2rem] shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8">{t('ISSUER CABINET', 'CABINET DE L\'ÉMETTEUR')}</h3>
              <div className="space-y-6">
                 {issuerData.team.map((member, i) => (
                   <div key={i} className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-surface-high border border-white/10 overflow-hidden shrink-0">
                       <img src={member.avatar} alt={member.name} className="w-full h-full object-cover grayscale brightness-125" referrerPolicy="no-referrer" />
                     </div>
                     <div>
                       <p className="text-sm font-black text-white uppercase italic tracking-tight">{member.name}</p>
                       <p className="text-[9px] text-primary-cyan uppercase tracking-widest font-black">{member.role}</p>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Active Contracts & Feed */}
        <div className="lg:col-span-8 space-y-12">
           <section>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                   <LayoutGrid className="text-primary-cyan" size={24} /> {t('ACTIVE CONTRACTS', 'CONTRATS ACTIFS')}
                 </h3>
                 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">{issuerData.activeContracts} {t('Indexed Assets', 'Actifs Indexés')}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Simplified Contract Previews */}
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="bg-surface-low border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
                        <TrendingUp size={60} />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-400/20 rounded-sm">ACTIVE</div>
                        <span className="text-[10px] font-mono text-on-surface-variant font-bold opacity-30">#LYA-CX-0{i}</span>
                      </div>
                      <h4 className="text-xl font-black text-white uppercase mb-1 tracking-tight group-hover:text-primary-cyan transition-colors truncate">Project Delta {i}</h4>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold opacity-40 mb-6">Equity Growth • 24.5% Cap</p>
                      
                      <div className="flex justify-between items-center border-t border-white/5 pt-4">
                         <div>
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-black opacity-30">{t('Asset Value', 'Valeur Actif')}</p>
                            <p className="text-lg font-black text-accent-gold">$842k</p>
                         </div>
                         <ArrowRight size={20} className="text-white/20 group-hover:text-primary-cyan transition-colors" />
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="w-full mt-8 py-5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 rounded-2xl">
                 {t('View Full Issuer Registry', 'Voir le Registre Complet')} <ExternalLink size={14} />
              </button>
           </section>

           {/* Institutional Validation Feed */}
           <section className="bg-surface-high/20 border border-primary-cyan/20 p-10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-cyan/20" />
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-primary-cyan/10 flex items-center justify-center text-primary-cyan">
                   <Zap size={20} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">{t('TRANSACTIONAL CLEARANCE FEED', 'FLUX DE VALIDATION TRANSACTIONNEL')}</h4>
                    <p className="text-[8px] text-primary-cyan font-black uppercase tracking-widest">{t('Real-time protocol settlements', 'Règlements protocolaires en temps réel')}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 {[
                   { msg: "Settlement 0x4E... Authorized", time: "2m ago", status: "STABLE" },
                   { msg: "Equity Bridge Sync Complete", time: "14m ago", status: "VERIFIED" },
                   { msg: "Institutional Audit Pass (v2.4)", time: "1h ago", status: "PASSED" }
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:animate-ping" />
                         <span className="text-[11px] font-mono text-white/70 uppercase tracking-tighter">{log.msg}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[9px] font-black text-emerald-400 font-mono italic">{log.status}</span>
                         <span className="text-[9px] text-on-surface-variant opacity-30 font-mono">{log.time}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};
