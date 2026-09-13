
import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  titleWhite: React.ReactNode;
  titleAccent: string;
  subtitle?: string;
  description?: string;
  accentColor?: string; // e.g. 'text-accent-gold' or 'text-primary-cyan'
  compact?: boolean;
}

// Ne degrade que le tout premier mot (ou les 2 premiers s'ils sont tres
// courts, ex. articles) — pas toute la premiere phrase, qui etait jugee
// trop voyante. Le reste du texte reste en blanc (text-on-surface), pas
// grise, comme demande.
function splitLead(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return [text, ''];
  let leadWordCount = 1;
  // Si le tout premier mot est un article/mot tres court (<=3 lettres),
  // on inclut aussi le suivant pour que le degrade ait un minimum de poids.
  if (words[0].length <= 3 && words.length > 1) leadWordCount = 2;
  const lead = words.slice(0, leadWordCount).join(' ');
  const rest = words.slice(leadWordCount).join(' ');
  return [lead + ' ', rest];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  description,
  compact = false
}) => {
  if (!description) return null;
  const [lead, rest] = splitLead(description);
  return (
    <header className={`pt-12 md:pt-16 relative z-10 px-4 md:px-6 ${compact ? 'mb-4' : 'mb-6 md:mb-10'}`}>
      <div className="flex flex-col">
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Plus de gros titre H1 — les onglets de la nav suffisent a se
              reperer. Seul le tout premier mot du texte descriptif est en
              degrade LYA ; le reste du texte reste blanc. */}
          <p style={{ textTransform: 'lowercase' }} className={`leading-relaxed max-w-2xl [&::first-letter]:uppercase ${compact ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}>
            <span className="text-brand-gradient" style={{ fontWeight: 700 }}>{lead}</span>
            <span className="text-on-surface">{rest}</span>
          </p>
        </motion.div>
      </div>
    </header>
  );
};
