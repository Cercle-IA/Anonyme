// Configuration des entités basée sur replacements.yaml
// Système 100% dynamique
// Tout est récupéré depuis Presidio

export interface EntityPattern {
  regex: RegExp;
  className: string;
  label: string;
  presidioType: string;
}

export interface PresidioConfig {
  replacements: Record<string, string>;
  default_anonymizers: Record<string, string>;
}

// Interface pour les résultats Presidio
/**
 * Interfaces pour les données de Presidio et le mapping.
 * Simplifié pour ne contenir que les définitions nécessaires.
 */

// Interface pour un résultat d'analyse de Presidio
export interface PresidioAnalyzerResult {
  entity_type: string;
  start: number;
  end: number;
  score: number;
}

// Interface pour une ligne du tableau de mapping
import { generateColorFromName, getHexColorFromName } from "./colorPalette";

export interface EntityMapping {
  entity_type: string;
  start: number;
  end: number;
  text: string;
  replacementValue?: string;
  displayName?: string; // Ajouter cette propriété
  customColor?: string;
}

// Utiliser la palette centralisée
export { generateColorFromName, getHexColorFromName };

/**
 * Récupère la configuration Presidio depuis l'API
 */
export const fetchPresidioConfig = async (): Promise<PresidioConfig | null> => {
  try {
    const response = await fetch("/api/presidio/config");
    if (!response.ok) {
      console.warn("Impossible de récupérer la config Presidio");
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(
      "Erreur lors de la récupération de la config Presidio:",
      error
    );
    return null;
  }
};
