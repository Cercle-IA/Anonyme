import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { EntityMapping } from "@/app/config/entityLabels";
import { Word } from "./useTextParsing";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
  wordIndices: number[];
}

interface UseContextMenuProps {
  entityMappings: EntityMapping[];
  words: Word[];
  onUpdateMapping: (
    originalValue: string,
    newLabel: string,
    entityType: string,
    applyToAll?: boolean,
    customColor?: string,
    wordStart?: number,
    wordEnd?: number
  ) => void;
  onRemoveMapping?: (originalValue: string, applyToAll?: boolean) => void;
  getCurrentColor: (selectedText: string) => string;
  setSelectedWords: (words: Set<number>) => void;
}

export const useContextMenu = ({
  entityMappings,
  words,
  onUpdateMapping,
  onRemoveMapping,
  getCurrentColor,
  setSelectedWords,
}: UseContextMenuProps) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: "",
    wordIndices: [],
  });

  // Référence pour tracker les mappings précédents
  const previousMappingsRef = useRef<EntityMapping[]>([]);
  const previousLabelsRef = useRef<string[]>([]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const showContextMenu = useCallback(
    (menuData: Omit<ContextMenuState, "visible">) => {
      setContextMenu({ ...menuData, visible: true });
    },
    []
  );

  // OPTIMISATION INTELLIGENTE: Ne log que les changements
  const existingLabels = useMemo(() => {
    const uniqueLabels = new Set<string>();
    const newMappings: EntityMapping[] = [];
    const changedMappings: EntityMapping[] = [];
    const removedMappings: EntityMapping[] = [];

    // Détecter les changements
    const previousMap = new Map(
      previousMappingsRef.current.map((m) => [m.text, m])
    );
    const currentMap = new Map(entityMappings.map((m) => [m.text, m]));

    // Nouveaux mappings
    entityMappings.forEach((mapping) => {
      if (!previousMap.has(mapping.text)) {
        newMappings.push(mapping);
      } else {
        const previous = previousMap.get(mapping.text)!;
        if (JSON.stringify(previous) !== JSON.stringify(mapping)) {
          changedMappings.push(mapping);
        }
      }
    });

    // Mappings supprimés
    previousMappingsRef.current.forEach((mapping) => {
      if (!currentMap.has(mapping.text)) {
        removedMappings.push(mapping);
      }
    });

    // Logger seulement les changements
    if (newMappings.length > 0) {
      console.log("🆕 Nouveaux mappings détectés:", newMappings.length);
      newMappings.forEach((mapping) => {
        console.log("📋 Nouveau mapping:", {
          text: mapping.text,
          displayName: mapping.displayName,
          entity_type: mapping.entity_type,
        });
      });
    }

    if (changedMappings.length > 0) {
      console.log("🔄 Mappings modifiés:", changedMappings.length);
      changedMappings.forEach((mapping) => {
        console.log("📝 Mapping modifié:", {
          text: mapping.text,
          displayName: mapping.displayName,
          entity_type: mapping.entity_type,
        });
      });
    }

    if (removedMappings.length > 0) {
      console.log("🗑️ Mappings supprimés:", removedMappings.length);
      removedMappings.forEach((mapping) => {
        console.log("❌ Mapping supprimé:", {
          text: mapping.text,
          displayName: mapping.displayName,
        });
      });
    }

    // Traitement de tous les mappings pour les labels
    entityMappings.forEach((mapping) => {
      if (
        mapping.displayName &&
        typeof mapping.displayName === "string" &&
        mapping.displayName.trim().length > 0
      ) {
        // Accepter tous les displayName non vides, pas seulement ceux avec crochets
        uniqueLabels.add(mapping.displayName);
      }
    });

    const result = Array.from(uniqueLabels).sort();

    // Logger seulement si les labels ont changé
    const previousLabels = previousLabelsRef.current;
    if (JSON.stringify(previousLabels) !== JSON.stringify(result)) {
      console.log("🎯 Labels mis à jour:", {
        ajoutés: result.filter((l) => !previousLabels.includes(l)),
        supprimés: previousLabels.filter((l) => !result.includes(l)),
        total: result.length,
      });
    }

    // Mettre à jour les références
    previousMappingsRef.current = [...entityMappings];
    previousLabelsRef.current = [...result];

    return result;
  }, [entityMappings]);

  const getExistingLabels = useCallback(() => {
    return existingLabels;
  }, [existingLabels]);

  const applyLabel = useCallback(
    (displayName: string, applyToAll?: boolean) => {
      if (!contextMenu.selectedText) return;

      const originalText = contextMenu.selectedText;
      const selectedIndices = contextMenu.wordIndices;

      // Calculer les positions de début et fin pour tous les mots sélectionnés
      const sortedIndices = selectedIndices.sort((a, b) => a - b);
      const firstWord = words[sortedIndices[0]];
      const lastWord = words[sortedIndices[sortedIndices.length - 1]];

      const wordStart = firstWord?.start;
      const wordEnd = lastWord?.end;

      const existingMapping = entityMappings.find(
        (m) => m.text === originalText
      );
      const entityType =
        existingMapping?.entity_type ||
        displayName.replace(/[\[\]]/g, "").toUpperCase();

      console.log("🏷️ Application de label:", {
        text: originalText,
        label: displayName,
        entityType,
        applyToAll,
        wordIndices: selectedIndices,
        positions: { start: wordStart, end: wordEnd },
      });

      onUpdateMapping(
        originalText,
        displayName,
        entityType,
        applyToAll,
        undefined,
        wordStart,
        wordEnd
      );

      setSelectedWords(new Set());
      closeContextMenu();
    },
    [
      contextMenu,
      words,
      entityMappings,
      onUpdateMapping,
      closeContextMenu,
      setSelectedWords,
    ]
  );

  const applyColorDirectly = useCallback(
    (color: string, colorName: string, applyToAll?: boolean) => {
      if (!contextMenu.selectedText) return;
  
      const existingMapping = entityMappings.find(
        (mapping) => mapping.text === contextMenu.selectedText
      );
  
      console.log("🎨 Application de couleur:", {
        text: contextMenu.selectedText,
        color,
        colorName,
        applyToAll,
        existingMapping: !!existingMapping,
      });
  
      if (existingMapping) {
        // MODIFICATION : Appliquer directement la couleur pour un label existant
        onUpdateMapping(
          contextMenu.selectedText,
          existingMapping.displayName || existingMapping.entity_type,
          existingMapping.entity_type,
          applyToAll,
          color
        );
        setSelectedWords(new Set());
        closeContextMenu();
      } else {
        // CRÉATION : Créer un nouveau label avec la couleur
        // Utiliser le texte sélectionné comme nom de label par défaut
        const defaultLabel = contextMenu.selectedText.toUpperCase();
        
        console.log("🆕 Création d'un nouveau label avec couleur:", {
          text: contextMenu.selectedText,
          label: defaultLabel,
          color,
          applyToAll
        });
        
        onUpdateMapping(
          contextMenu.selectedText,
          defaultLabel,
          defaultLabel,
          applyToAll,
          color
        );
        setSelectedWords(new Set());
        closeContextMenu();
      }
    },
    [
      contextMenu.selectedText,
      entityMappings,
      onUpdateMapping,
      closeContextMenu,
      setSelectedWords,
    ]
  );

  const removeLabel = useCallback(
    (applyToAll?: boolean) => {
      if (!contextMenu.selectedText || !onRemoveMapping) return;

      console.log("🗑️ Suppression de label:", {
        text: contextMenu.selectedText,
        applyToAll,
      });

      onRemoveMapping(contextMenu.selectedText, applyToAll);
      setSelectedWords(new Set());
      closeContextMenu();
    },
    [
      contextMenu.selectedText,
      onRemoveMapping,
      closeContextMenu,
      setSelectedWords,
    ]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible) {
        const target = event.target as Element;
        const contextMenuElement = document.querySelector(
          "[data-context-menu]"
        );

        if (contextMenuElement && !contextMenuElement.contains(target)) {
          setTimeout(() => {
            closeContextMenu();
          }, 0);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu.visible, closeContextMenu]);

  return {
    contextMenu,
    showContextMenu,
    closeContextMenu,
    applyLabel,
    applyColorDirectly,
    removeLabel,
    getExistingLabels,
    getCurrentColor,
  };
};
