// Les 5 piliers du Score LYA sont stockés en anglais uniquement dans
// CONTRACTS (src/types.ts, ~590 occurrences) — c'est la clé stable,
// jamais retraduite dans les données elles-mêmes pour éviter de casser
// ce fichier statique. Cette fonction traduit UNIQUEMENT à l'affichage.
//
// Utilisation : translatePillarLabel(pillar.label, language)
// où language vient de useTranslation() ('FR' | 'EN').

const PILLAR_TRANSLATIONS: Record<string, string> = {
  'Project Quality': 'Qualité du Projet',
  'Marketability': 'Potentiel de Marché',
  'Legal Security': 'Sécurité Juridique',
  'Technical Innovation': 'Innovation Technique',
  'Growth Potential': 'Potentiel de Croissance',
};

export function translatePillarLabel(label: string, language: string): string {
  if (language !== 'FR') return label;
  return PILLAR_TRANSLATIONS[label] || label;
}
