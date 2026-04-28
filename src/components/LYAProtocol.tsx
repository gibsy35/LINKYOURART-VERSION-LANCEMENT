
import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Globe, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const LYAProtocolBadge: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Shield className="text-primary-cyan" />,
      title: t('INSTITUTIONAL_GARANTEE', 'GARANTIE_INSTITUTIONNELLE'),
      description: t('GARANTEE_DESC', 'CHAQUE CONTRAT EST ASSURÉ PAR LE FONDS DE RÉSERVE LYA AU DELÀ DE 10M$.')
    },
    {
      icon: <Globe className="text-accent-gold" />,
      title: t('GLOBAL_ENFORCEABILITY', 'EXÉCUTABILITÉ_MONDIALE'),
      description: t('ENFORCE_DESC', 'PROTOCOLE JURIDIQUE COMPATIBLE AVEC LES JURIDICTIONS EU, US ET ASIA-PACIFIC.')
    },
    {
      icon: <Cpu className="text-accent-purple" />,
      title: t('AUTOMATED_SETTLEMENT', 'RÈGLEMENT_AUTOMATISÉ'),
      description: t('SETTLE_DESC', 'PAYS OFF IMMÉDIAT DÈS QUE LES CONDITIONS DE L’ORACLE SONT REMPLIES.')
    }
  ];

  return (
    <div className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-dim/50 backdrop-blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-primary-cyan/5 border border-primary-cyan/20 rounded-full mb-8"
          >
            <Lock size={14} className="text-primary-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-cyan">{t('THE_PROTOCOL', 'LE_PROTOCOLE')}</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-7xl font-black font-headline text-white uppercase italic tracking-tighter leading-[0.9] mb-8">
            {t('TRUST_THROUGH', 'LA_CONFIANCE_PAR')} <br/>
            <span className="text-primary-cyan drop-shadow-[0_0_30px_rgba(0,224,255,0.4)]">{t('MATHEMATICAL_TRUTH', 'LA_VÉRITÉ_MATHÉMATIQUE')}</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-on-surface-variant/60 font-black uppercase tracking-[0.2em] text-xs md:text-sm leading-relaxed italic">
            {t('PROTOCOL_SUBTEXT', 'LYA EST LE PREMIER PROTOCOLE DE GESTION DES DROITS CRÉATIFS QUI ÉLIMINE LE RISQUE DE CONTREPARTIE PAR LE CHIFFREMENT INSTITUTIONNEL.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-low border border-white/5 p-10 rounded-2xl group hover:border-primary-cyan/30 transition-all duration-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-cyan/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-cyan/10 transition-all" />
              
              <div className="w-16 h-16 bg-surface-dim border border-white/10 flex items-center justify-center mb-8 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-black font-headline text-white uppercase italic tracking-tighter mb-4 group-hover:text-primary-cyan transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-xs text-on-surface-variant font-black uppercase tracking-widest leading-relaxed opacity-60">
                {feature.description}
              </p>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">ACTIVE</span>
                </div>
                <Zap size={14} className="text-accent-gold" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 z-[-1] opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00e0ff 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }} 
      />
    </div>
  );
};
