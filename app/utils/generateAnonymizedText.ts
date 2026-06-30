import { EntityMapping } from "@/app/config/entityLabels";

// Fonction améliorée pour résoudre les chevauchements d'entités
const resolveOverlaps = (mappings: EntityMapping[]): EntityMapping[] => {
  if (mappings.length <= 1) return mappings;
  
  // Trier par position de début, puis par score/longueur
  const sorted = [...mappings].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    // En cas d'égalité, privilégier l'entité la plus longue
    return (b.end - b.start) - (a.end - a.start);
  });
  
  const resolved: EntityMapping[] = [];
  
  for (const current of sorted) {
    // Vérifier si cette entité chevauche avec une entité déjà acceptée
    let hasConflict = false;
    
    for (const existing of resolved) {
      // Détecter tout type de chevauchement
      const overlap = (
        (current.start >= existing.start && current.start < existing.end) ||
        (current.end > existing.start && current.end <= existing.end) ||
        (current.start <= existing.start && current.end >= existing.end)
      );
      
      if (overlap) {
        hasConflict = true;
        break;
      }
    }
    
    if (!hasConflict) {
      resolved.push(current);
    }
  }
  
  return resolved.sort((a, b) => a.start - b.start);
};

// Fonction pour nettoyer et valider les mappings
const cleanMappings = (mappings: EntityMapping[], originalText: string): EntityMapping[] => {
  return mappings.filter(mapping => {
    // Vérifier que les indices sont valides
    if (mapping.start < 0 || mapping.end < 0) return false;
    if (mapping.start >= originalText.length) return false;
    if (mapping.end > originalText.length) return false;
    if (mapping.start >= mapping.end) return false;
    
    // Vérifier que le texte correspond
    const extractedText = originalText.slice(mapping.start, mapping.end);
    return extractedText === mapping.text;
  });
};

export const generateAnonymizedText = (
  originalText: string,
  mappings: EntityMapping[]
): string => {
  if (!originalText || !mappings || mappings.length === 0) {
    return originalText;
  }

  // Nettoyer et valider les mappings
  const cleanedMappings = cleanMappings(mappings, originalText);
  
  // Résoudre les chevauchements
  const resolvedMappings = resolveOverlaps(cleanedMappings);

  let result = "";
  let lastIndex = 0;

  for (const mapping of resolvedMappings) {
    // Sécurité supplémentaire
    if (mapping.start < lastIndex) continue;
    
    // Ajouter le texte avant l'entité
    result += originalText.slice(lastIndex, mapping.start);

    // Utiliser la valeur de remplacement appropriée
    let replacement = mapping.replacementValue;
    
    if (!replacement) {
      // Priorité : displayName modifié > displayName original > entity_type
      replacement = mapping.displayName || `[${mapping.entity_type}]`;
      
      // Si displayName ne contient pas de crochets, les ajouter
      if (mapping.displayName && !mapping.displayName.startsWith('[')) {
        replacement = `[${mapping.displayName}]`;
      }
    }
    
    result += replacement;
    lastIndex = mapping.end;
  }

  // Ajouter le reste du texte
  result += originalText.slice(lastIndex);

  return result;
};
