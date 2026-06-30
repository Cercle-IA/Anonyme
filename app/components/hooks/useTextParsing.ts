import { useMemo } from "react";
import { EntityMapping } from "@/app/config/entityLabels";

export interface Word {
  text: string;
  displayText: string;
  start: number;
  end: number;
  isEntity: boolean;
  entityType?: string;
  entityIndex?: number;
  mapping?: EntityMapping;
}

export const useTextParsing = (
  text: string,
  entityMappings: EntityMapping[]
) => {
  const words = useMemo((): Word[] => {
    const segments: Word[] = [];
    let currentIndex = 0;

    const sortedMappings = [...entityMappings].sort(
      (a, b) => a.start - b.start // CORRECTION: utiliser 'start' au lieu de 'startIndex'
    );

    sortedMappings.forEach((mapping, mappingIndex) => {
      if (currentIndex < mapping.start) {
        // CORRECTION: utiliser 'start'
        const beforeText = text.slice(currentIndex, mapping.start);
        const beforeWords = beforeText.split(/\s+/).filter(Boolean);

        beforeWords.forEach((word) => {
          const wordStart = text.indexOf(word, currentIndex);
          const wordEnd = wordStart + word.length;

          segments.push({
            text: word,
            displayText: word,
            start: wordStart,
            end: wordEnd,
            isEntity: false,
          });

          currentIndex = wordEnd;
        });
      }

      // Utiliser displayName directement SANS fallback
      const anonymizedText = mapping.displayName;

      // Ne créer le segment que si displayName existe
      if (anonymizedText) {
        segments.push({
          text: mapping.text,
          displayText: anonymizedText,
          start: mapping.start,
          end: mapping.end,
          isEntity: true,
          entityType: mapping.entity_type,
          entityIndex: mappingIndex,
          mapping: mapping,
        });
      }

      currentIndex = mapping.end; // CORRECTION: utiliser 'end'
    });

    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      const remainingWords = remainingText.split(/\s+/).filter(Boolean);

      remainingWords.forEach((word) => {
        const wordStart = text.indexOf(word, currentIndex);
        const wordEnd = wordStart + word.length;

        segments.push({
          text: word,
          displayText: word,
          start: wordStart,
          end: wordEnd,
          isEntity: false,
        });

        currentIndex = wordEnd;
      });
    }

    return segments;
  }, [text, entityMappings]);

  return { words };
};
