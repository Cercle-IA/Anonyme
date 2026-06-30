import { Copy, Download } from "lucide-react";
import { InteractiveTextEditor } from "./InteractiveTextEditor";
import { isValidEntityBoundary } from "@/app/utils/entityBoundary";
import { EntityMapping } from "@/app/config/entityLabels"; // Importer l'interface unifiée

// Supprimer l'interface locale et utiliser celle de entityLabels.ts

interface ResultPreviewComponentProps {
  outputText: string;
  sourceText: string;
  copyToClipboard: () => void;
  downloadText: () => void;
  entityMappings?: EntityMapping[];
  onMappingsUpdate?: (mappings: EntityMapping[]) => void;
}

export const ResultPreviewComponent = ({
  outputText,
  sourceText,
  copyToClipboard,
  downloadText,
  entityMappings = [],
  onMappingsUpdate,
}: ResultPreviewComponentProps) => {
  // SUPPRIMER cette ligne
  // const { mappings, updateMapping, removeMappingByValueWithOptions } = useEntityMappings(entityMappings);

  // Utiliser directement entityMappings du parent
  const handleUpdateMapping = (
    originalValue: string,
    newLabel: string,
    entityType: string,
    applyToAllOccurrences: boolean = false,
    customColor?: string,
    wordStart?: number,
    wordEnd?: number
  ) => {
    // Créer les nouveaux mappings directement
    const filteredMappings = entityMappings.filter(
      (mapping) => mapping.text !== originalValue
    );

    const newMappings: EntityMapping[] = [];

    if (applyToAllOccurrences) {
      // Appliquer à toutes les occurrences
      let searchIndex = 0;
      while (true) {
        const foundIndex = sourceText.indexOf(originalValue, searchIndex);
        if (foundIndex === -1) break;

        if (isValidEntityBoundary(foundIndex, sourceText, originalValue)) {
          newMappings.push({
            text: originalValue,
            entity_type: entityType,
            start: foundIndex,
            end: foundIndex + originalValue.length,
            displayName: newLabel,
            customColor: customColor,
          });
        }
        searchIndex = foundIndex + 1;
      }
    } else {
      // CORRECTION: Utiliser wordStart/wordEnd pour cibler le mapping exact
      if (wordStart !== undefined && wordEnd !== undefined) {
        // Chercher le mapping exact avec les coordonnées précises
        const targetMapping = entityMappings.find(
          (mapping) => mapping.start === wordStart && mapping.end === wordEnd
        );

        if (targetMapping) {
          // Mettre à jour le mapping existant spécifique
          const updatedMappings = entityMappings.map((m) => {
            if (m.start === wordStart && m.end === wordEnd) {
              return {
                ...m,
                entity_type: entityType,
                displayName: newLabel,
                customColor: customColor,
              };
            }
            return m;
          });

          onMappingsUpdate?.(updatedMappings);
          return;
        } else {
          // Créer un nouveau mapping aux coordonnées précises
          newMappings.push({
            text: originalValue,
            entity_type: entityType,
            start: wordStart,
            end: wordEnd,
            displayName: newLabel,
            customColor: customColor,
          });
        }
      } else {
        // Fallback: logique existante si pas de coordonnées précises
        const existingMapping = entityMappings.find(
          (mapping) => mapping.text === originalValue
        );

        if (existingMapping) {
          const updatedMappings = entityMappings.map((m) => {
            if (
              m.start === existingMapping.start &&
              m.end === existingMapping.end
            ) {
              return {
                ...m,
                entity_type: entityType,
                displayName: newLabel,
                customColor: customColor,
              };
            }
            return m;
          });

          onMappingsUpdate?.(updatedMappings);
          return;
        } else {
          const foundIndex = sourceText.indexOf(originalValue);
          if (
            foundIndex !== -1 &&
            isValidEntityBoundary(foundIndex, sourceText, originalValue)
          ) {
            newMappings.push({
              text: originalValue,
              entity_type: entityType,
              start: foundIndex,
              end: foundIndex + originalValue.length,
              displayName: newLabel,
              customColor: customColor,
            });
          }
        }
      }
    }

    // Notifier le parent avec les nouveaux mappings
    const allMappings = [...filteredMappings, ...newMappings];
    const uniqueMappings = allMappings.filter(
      (mapping, index, self) =>
        index ===
        self.findIndex(
          (m) => m.start === mapping.start && m.end === mapping.end
        )
    );

    onMappingsUpdate?.(uniqueMappings.sort((a, b) => a.start - b.start));
  };

  // NOUVELLE FONCTION: Gestion de la suppression avec applyToAll
  const handleRemoveMapping = (
    originalValue: string,
    applyToAll: boolean = false
  ) => {
    console.log("handleRemoveMapping appelé:", {
      originalValue,
      applyToAll,
    });

    // Notifier le parent avec les nouveaux mappings
    if (onMappingsUpdate) {
      const filteredMappings = entityMappings.filter(
        (mapping: EntityMapping) => {
          if (applyToAll) {
            // Supprimer toutes les occurrences
            return mapping.text !== originalValue;
          } else {
            // Supprimer seulement la première occurrence
            const firstOccurrenceIndex = entityMappings.findIndex(
              (m: EntityMapping) => m.text === originalValue
            );
            const currentIndex = entityMappings.indexOf(mapping);
            return !(
              mapping.text === originalValue &&
              currentIndex === firstOccurrenceIndex
            );
          }
        }
      );

      onMappingsUpdate(
        filteredMappings.sort(
          (a: EntityMapping, b: EntityMapping) => a.start - b.start
        )
      );
    }
  };

  if (!outputText) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between border-b border-[#f7ab6e] border-opacity-30 pb-2">
        <h3 className="text-lg font-medium text-[#092727]">
          Document anonymisé (Mode interactif)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!outputText}
            className="p-2 text-[#092727] hover:text-[#f7ab6e] disabled:opacity-50"
            title="Copier"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            onClick={downloadText}
            disabled={!outputText}
            className="bg-[#f7ab6e] hover:bg-[#f7ab6e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center space-x-2"
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      <div className="border border-[#f7ab6e] border-opacity-30 rounded-lg bg-white min-h-[400px] flex flex-col">
        <div className="flex-1 p-4 overflow-hidden">
          <InteractiveTextEditor
            text={sourceText}
            entityMappings={entityMappings}
            onUpdateMapping={handleUpdateMapping}
            onRemoveMapping={handleRemoveMapping}
          />
        </div>
      </div>
    </div>
  );
};
