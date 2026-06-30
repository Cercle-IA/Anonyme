import { useState, useCallback } from "react";
import { EntityMapping } from "@/app/config/entityLabels";

export const useEntityMappings = (initialMappings: EntityMapping[] = []) => {
  const [mappings, setMappings] = useState<EntityMapping[]>(initialMappings);

  const updateMapping = useCallback(
    (
      originalValue: string,
      newLabel: string,
      entityType: string,
      sourceText: string,
      applyToAllOccurrences: boolean = false,
      customColor?: string
    ) => {
      setMappings((prevMappings) => {
        let baseMappings = [...prevMappings];
        const newMappings: EntityMapping[] = [];

        if (applyToAllOccurrences) {
          // Supprimer toutes les anciennes occurrences et les recréer
          baseMappings = baseMappings.filter((m) => m.text !== originalValue);

          let searchIndex = 0;
          while (true) {
            const foundIndex = sourceText.indexOf(originalValue, searchIndex);
            if (foundIndex === -1) break;

            newMappings.push({
              text: originalValue,
              entity_type: entityType,
              start: foundIndex,
              end: foundIndex + originalValue.length,
              customColor: customColor,
            });
            searchIndex = foundIndex + originalValue.length;
          }
        } else {
          // Mettre à jour une seule occurrence ou en créer une nouvelle
          const existingMapping = prevMappings.find(
            (m) => m.text === originalValue
          );

          if (existingMapping) {
            // Remplacer le mapping existant au lieu de filtrer
            baseMappings = prevMappings.map((m) => {
              if (
                m.start === existingMapping.start &&
                m.end === existingMapping.end
              ) {
                return {
                  ...m,
                  entity_type: entityType,
                  displayName: newLabel, // Utiliser newLabel au lieu de préserver l'ancien
                  customColor: customColor,
                };
              }
              return m;
            });
          } else {
            // Créer un nouveau mapping pour du texte non reconnu
            const foundIndex = sourceText.indexOf(originalValue);
            if (foundIndex !== -1) {
              newMappings.push({
                text: originalValue,
                entity_type: entityType,
                start: foundIndex,
                end: foundIndex + originalValue.length,
                displayName: newLabel, // Utiliser newLabel au lieu de entityType
                customColor: customColor,
              });
            }
          }
        }

        // Combiner, dédupliquer et trier
        const allMappings = [...baseMappings, ...newMappings];
        const uniqueMappings = allMappings.filter(
          (mapping, index, self) =>
            index ===
            self.findIndex(
              (m) => m.start === mapping.start && m.end === mapping.end
            )
        );

        return uniqueMappings.sort((a, b) => a.start - b.start);
      });
    },
    []
  );

  const addMapping = useCallback((mapping: EntityMapping) => {
    setMappings((prev) => [...prev, mapping]);
  }, []);

  const removeMapping = useCallback((index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeMappingByValue = useCallback((originalValue: string) => {
    setMappings((prev) =>
      prev.filter((mapping) => mapping.text !== originalValue)
    );
  }, []);

  // NOUVELLE FONCTION: Suppression avec gestion d'applyToAll
  const removeMappingByValueWithOptions = useCallback(
    (originalValue: string, applyToAll: boolean = false) => {
      setMappings((prev) => {
        if (applyToAll) {
          // Supprimer toutes les occurrences du texte
          return prev.filter((mapping) => mapping.text !== originalValue);
        } else {
          // Supprimer seulement la première occurrence ou celle à la position actuelle
          // Pour l'instant, on supprime la première occurrence trouvée
          const indexToRemove = prev.findIndex(
            (mapping) => mapping.text === originalValue
          );
          if (indexToRemove !== -1) {
            return prev.filter((_, index) => index !== indexToRemove);
          }
          return prev;
        }
      });
    },
    []
  );

  return {
    mappings,
    updateMapping,
    addMapping,
    removeMapping,
    removeMappingByValue,
    removeMappingByValueWithOptions, // Ajouter la nouvelle fonction
  };
};
