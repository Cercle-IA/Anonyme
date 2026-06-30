export interface ColorOption {
  name: string;
  value: string;
  bgClass: string;
  textClass: string;
}

// Palette de couleurs harmonisée (équivalent Tailwind 200)
export const COLOR_PALETTE: ColorOption[] = [
  {
    name: 'Rouge',
    value: '#fecaca', // red-200
    bgClass: 'bg-red-200',
    textClass: 'text-red-800'
  },
  {
    name: 'Orange',
    value: '#fed7aa', // orange-200
    bgClass: 'bg-orange-200',
    textClass: 'text-orange-800'
  },
  {
    name: 'Jaune',
    value: '#fef3c7', // yellow-200
    bgClass: 'bg-yellow-200',
    textClass: 'text-yellow-800'
  },
  {
    name: 'Vert',
    value: '#bbf7d0', // green-200
    bgClass: 'bg-green-200',
    textClass: 'text-green-800'
  },
  {
    name: 'Bleu',
    value: '#bfdbfe', // blue-200
    bgClass: 'bg-blue-200',
    textClass: 'text-blue-800'
  },
  {
    name: 'Indigo',
    value: '#c7d2fe', // indigo-200
    bgClass: 'bg-indigo-200',
    textClass: 'text-indigo-800'
  },
  {
    name: 'Violet',
    value: '#ddd6fe', // violet-200
    bgClass: 'bg-violet-200',
    textClass: 'text-violet-800'
  },
  {
    name: 'Rose',
    value: '#fbcfe8', // pink-200
    bgClass: 'bg-pink-200',
    textClass: 'text-pink-800'
  }
];

// Fonction pour obtenir une couleur par hash
export function generateColorFromName(name: string): ColorOption {
  // Vérification de sécurité
  if (!name || typeof name !== 'string' || name.length === 0) {
    return COLOR_PALETTE[0]; // Retourner la première couleur par défaut
  }
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

// Fonction pour obtenir la couleur hex
export function getHexColorFromName(name: string): string {
  return generateColorFromName(name).value;
}

// Export des valeurs hex pour compatibilité
export const COLOR_VALUES = COLOR_PALETTE.map(color => color.value);