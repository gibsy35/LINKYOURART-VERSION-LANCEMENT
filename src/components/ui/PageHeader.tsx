
import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  titleWhite: React.ReactNode;
  titleAccent: string;
  subtitle?: string;
  description?: string;
  accentColor?: string; // e.g. 'text-accent-gold' or 'text-primary-cyan'
  compact?: boolean;
  category?: string; // meme intitule que la categorie de menu de cette page
                      // (SYSTEM, INDEX, DEVELOPMENT...) pour colorer la puce
                      // en cohesion avec la pastille du Sidebar.
}

// Meme mapping couleur que dans Sidebar.tsx (categoryColor) — copie ici
// volontairement plutot qu'importe, pour eviter un couplage entre un
// composant partage et le Sidebar.
function categoryDotColor(category?: string): string {
  const key = (category || '').toUpperCase();
  if (key.includes('SYSTÈME') || key.includes('SYSTEM')) return '#7E1CF1';
  if (key.includes('INDEX')) return '#02C6FA';
  if (key.includes('DÉVELOPPEMENT') || key.includes('DEVELOPMENT')) return '#3ADB76';
  if (key.includes('COFFRE') || key.includes('VAULT')) return '#F0C55E';
  if (key.includes('COMMUNA') || key.includes('COMMUNITY')) return '#E61A97';
  if (key.includes('RESSOURCE') || key.includes('RESOURCES')) return '#00E0FF';
  if (key.includes('PROFESSIONNEL') || key.includes('PROFESSIONAL')) return '#FF6B6B';
  if (key.includes('CRÉATEUR') || key.includes('CREATOR')) return '#3ADB76';
  if (key.includes('MÉCÈNE') || key.includes('PATRON')) return '#7E1CF1';
  return '';
}

// Le CSS `text-transform: lowercase` + `::first-letter` ne capitalise que le
// tout premier caractere du paragraphe entier — chaque phrase suivante apres
// un point restait donc en minuscule. On le fait proprement en JS a la
// place : minuscule partout, sauf la premiere lettre de chaque phrase.
function sentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  description,
  compact = false,
  category
}) => {
  if (!description) return null;
  const dotColor = categoryDotColor(category);
  return (
    <header className={`pt-12 md:pt-16 relative z-10 px-4 md:px-6 ${compact ? 'mb-4' : 'mb-6 md:mb-10'}`}>
      <div className="flex flex-col">
        <motion.div
           initial={{ opacity: 0, y: 12 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Plus de gros titre H1 — les onglets de la nav suffisent a se
              reperer. Le degrade sur le debut de phrase n'apportait rien :
              a la place, une simple puce devant le texte (couleur de la
              categorie de menu si connue, sinon degrade LYA), qui reste
              entierement blanc. */}
          <p className={`leading-relaxed max-w-2xl flex items-start gap-2.5 ${compact ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}>
            <span
              className={`rounded-full flex-shrink-0 ${dotColor ? '' : 'bg-brand-gradient'}`}
              style={{ width: 7, height: 7, marginTop: '0.55em', background: dotColor || undefined }}
            />
            <span className="text-on-surface">{sentenceCase(description)}</span>
          </p>
        </motion.div>
      </div>
    </header>
  );
};
