import React, { ReactNode } from "react";
import {
  generateColorFromName,
  EntityMapping,
} from "@/app/config/entityLabels";

export const highlightEntities = (
  originalText: string,
  mappings?: EntityMapping[]
): ReactNode[] => {
  if (!originalText || !mappings || mappings.length === 0) {
    return [originalText];
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  // Les mappings sont triés par `start`
  mappings.forEach((mapping, index) => {
    const { start, end, entity_type, text } = mapping;

    // Ajouter le segment de texte AVANT l'entité actuelle
    if (start > lastIndex) {
      parts.push(originalText.slice(lastIndex, start));
    }

    // Créer et ajouter le badge stylisé pour l'entité
    const colorOption = generateColorFromName(entity_type);
    const displayText = entity_type;

    parts.push(
      <span
        key={index}
        className={`${colorOption.bgClass} ${colorOption.textClass} px-2 py-1 rounded-md font-medium text-xs inline-block mx-0.5 shadow-sm border`}
        title={`${entity_type}: ${text}`}
      >
        {displayText}
      </span>
    );

    // Mettre à jour la position pour la prochaine itération
    lastIndex = end;
  });

  // Ajouter le reste du texte après la dernière entité
  if (lastIndex < originalText.length) {
    parts.push(originalText.slice(lastIndex));
  }

  return parts;
};
