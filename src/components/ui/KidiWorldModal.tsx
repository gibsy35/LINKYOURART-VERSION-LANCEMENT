import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Trophy, Mic, Palette, Film, Music, Gamepad2, Camera, Pen } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface KidiWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = [Star, Trophy, Mic, Palette, Film, Music, Gamepad2, Camera, Pen, Star, Trophy, Mic];
const COLORS = ['#00E0FF','#FF6BFF','#FFD700','#FF6B6B','#6BFF9E','#FF9E6B','#B06BFF','#6BDBFF'];

const FloatingIcon = ({ Icon, style }: { Icon: any; style: React.CSSProperties }) => (
  <motion.div
    animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0], opacity: [0.15, 0.35, 0.15] }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
    style={{ position: 'absolute', pointerEvents: 'none', ...style }}
  >
    <Icon size={18} />
  </motion.div>
);

export const KidiWorldModal: React.FC<KidiWorldModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (isOpen) setMounted(true); }, [isOpen]);

  const floaters = [
    { Icon: Palette, top: '8%', left: '6%', color: '#FF6BFF' },
    { Icon: Music, top: '12%', right: '8%', color: '#FFD700' },
    { Icon: Film, bottom: '30%', left: '4%', color: '#00E0FF' },
    { Icon: Trophy, top: '35%', right: '5%', color: '#6BFF9E' },
    { Icon: Mic, bottom: '20%', right: '7%', color: '#FF6B6B' },
    { Icon: Camera, top: '55%', left: '5%', color: '#B06BFF' },
    { Icon: Gamepad2, bottom: '12%', left: '8%', color: '#FF9E6B' },
    { Icon: Star, bottom: '10%', right: '10%', color: '#FFD700' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, backdropFilter: 'blur(16px)', background: 'rgba(4,6,12,0.92)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                maxWidth: '600px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0D0520 0%, #080C20 50%, #0A1A0D 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 120px rgba(176,107,255,0.15), 0 0 60px rgba(0,224,255,0.08)',
              }}
            >
              {/* Floating icons background */}
              {floaters.map((f, i) => (
                <div key={i} style={{ position: 'absolute', color: f.color, opacity: 0.2, top: f.top, left: (f as any).left, right: (f as any).right, bottom: (f as any).bottom }}>
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    <f.Icon size={20} />
                  </motion.div>
                </div>
              ))}

              {/* Gradient orbs */}
              <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(176,107,255,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(0,224,255,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,107,255,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

              {/* Rainbow top border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #FF6BFF, #00E0FF, #FFD700, #6BFF9E, #FF6B6B, #FF6BFF)', opacity: 0.8 }} />

              {/* Close */}
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                className="hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>

                {/* Age badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Star size={16} fill="#FFD700" color="#FFD700" />
                  </motion.div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '2px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.35em', fontFamily: 'monospace' }}>
                      4 — 18 {t('yrs', 'ans')} · {t('COMING SOON', 'BIENTÔT')}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  >
                    <Star size={12} fill="#FF6BFF" color="#FF6BFF" />
                  </motion.div>
                </div>

                {/* Big logo */}
                <div style={{ marginBottom: '24px' }}>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: 'white', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'inherit' }}
                  >
                    KIDI<span style={{ background: 'linear-gradient(135deg, #FF6BFF, #00E0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.</span><span style={{ background: 'linear-gradient(135deg, #00E0FF, #6BFF9E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WORLD</span>
                  </motion.h2>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.45em', fontFamily: 'monospace' }}>
                    {t('A LinkYourArt Universe', 'Un Univers LinkYourArt')}
                  </p>
                </div>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '20px', letterSpacing: '-0.02em' }}
                >
                  {t(
                    'The world stage for tomorrow\'s creative talents.',
                    'La scène mondiale des talents créatifs de demain.'
                  )}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '14px', fontFamily: 'sans-serif' }}
                >
                  {t(
                    'KIDI.WORLD is the first platform entirely dedicated to young creative talent between 4 and 18 years old — across music, cinema, visual arts, design, dance, gaming and beyond. A global playground where children and teenagers can express their creativity, compete in professional challenges and get recognized by industry experts.',
                    'KIDI.WORLD est la première plateforme entièrement dédiée aux jeunes talents créatifs entre 4 et 18 ans — musique, cinéma, arts visuels, design, danse, gaming et bien plus encore. Un terrain de jeu mondial où enfants et adolescents peuvent exprimer leur créativité, participer à des challenges professionnels et se faire reconnaître par les experts de l\'industrie.'
                  )}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '28px', fontFamily: 'sans-serif' }}
                >
                  {t(
                    'Professionals and creative institutions from around the world can launch challenges, discover exceptional profiles and invest in tomorrow\'s rising stars — long before they become icons.',
                    'Les professionnels et institutions créatives du monde entier peuvent lancer des challenges, découvrir des profils exceptionnels et investir dans les étoiles montantes de demain — bien avant qu\'elles ne deviennent des icônes.'
                  )}
                </motion.p>

                {/* Industry pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                  {[
                    { icon: Music, label: t('Music', 'Musique'), color: '#FF6BFF' },
                    { icon: Film, label: t('Cinema', 'Cinéma'), color: '#00E0FF' },
                    { icon: Palette, label: t('Visual Arts', 'Arts Visuels'), color: '#FFD700' },
                    { icon: Gamepad2, label: t('Gaming', 'Gaming'), color: '#6BFF9E' },
                    { icon: Camera, label: t('Photo', 'Photo'), color: '#FF9E6B' },
                    { icon: Mic, label: t('Dance', 'Danse'), color: '#B06BFF' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.32 + i * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: `${item.color}12`, border: `1px solid ${item.color}30`, borderRadius: '2px' }}
                    >
                      <item.icon size={11} style={{ color: item.color }} />
                      <span style={{ fontSize: '9px', fontWeight: 900, color: item.color, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'monospace' }}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.35em', fontFamily: 'monospace' }}>
                      {t('LAUNCHING SOON', 'LANCEMENT IMMINENT')}
                    </p>
                    <a
                      href="https://kidi.world"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,107,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: '2px', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,107,255,1)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,107,255,0.6)')}
                    >
                      kidi.world ↗
                    </a>
                  </div>

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #FF6BFF, #00E0FF)',
                      border: 'none',
                      color: '#080C20',
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3em',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      boxShadow: '0 8px 30px rgba(255,107,255,0.25)',
                    }}
                  >
                    {t('✨ GOT IT!', '✨ COMPRIS !')}
                  </motion.button>
                </div>
              </div>

              {/* Rainbow bottom border */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6BFF9E, #00E0FF, #FF6BFF, #FFD700, #FF6B6B)', opacity: 0.6 }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
