import React, { useState, useRef, useCallback } from "react";
import { EntityMapping } from "@/app/config/entityLabels";
import { useTextParsing } from "./hooks/useTextParsing";
import { useContextMenu } from "./hooks/useContextMenu";
import { useColorMapping } from "./hooks/useColorMapping";
import { TextDisplay } from "./TextDisplay";
import { ContextMenu } from "./ContextMenu";

interface InteractiveTextEditorProps {
  text: string;
  entityMappings: EntityMapping[];
  onUpdateMapping: (
    originalValue: string,
    newLabel: string,
    entityType: string,
    applyToAllOccurrences?: boolean,
    customColor?: string,
    wordStart?: number,
    wordEnd?: number
  ) => void;
  onRemoveMapping?: (originalValue: string, applyToAll?: boolean) => void;
}

export const InteractiveTextEditor: React.FC<InteractiveTextEditorProps> = ({
  text,
  entityMappings,
  onUpdateMapping,
  onRemoveMapping,
}) => {
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const { words } = useTextParsing(text, entityMappings);
  const { getCurrentColor } = useColorMapping(entityMappings);
  const {
    contextMenu,
    showContextMenu,
    applyLabel,
    applyColorDirectly,
    removeLabel,
    getExistingLabels,
  } = useContextMenu({
    entityMappings,
    words,
    onUpdateMapping,
    onRemoveMapping,
    getCurrentColor,
    setSelectedWords,
  });

  const handleWordClick = useCallback(
    (index: number | null, event: React.MouseEvent) => {
      if (index !== null) {
        event.preventDefault();
        setSelectedWords(prev => {
          const newSet = new Set(prev);
          if (newSet.has(index)) {
            newSet.delete(index);
          } else {
            newSet.add(index);
          }
          return newSet;
        });
      }
    },
    []
  );

  const handleContainerContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      
      // Priorité à la sélection de texte libre
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        showContextMenu({
          x: event.clientX,
          y: event.clientY,
          selectedText,
          wordIndices: [], // Sélection libre, pas d'indices de mots
        });
        return;
      }
      
      // Fallback sur la sélection par mots si pas de sélection libre
      if (selectedWords.size > 0) {
        const selectedText = Array.from(selectedWords)
          .sort((a, b) => a - b)
          .map((index) => {
            const word = words[index];
            return word?.isEntity ? word.text : word?.text;
          })
          .filter(Boolean)
          .join(" ");

        showContextMenu({
          x: event.clientX,
          y: event.clientY,
          selectedText,
          wordIndices: Array.from(selectedWords),
        });
      }
    },
    [selectedWords, words, showContextMenu]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedWords(new Set());
    // Effacer la sélection de texte native
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-2">
        <button 
          onClick={handleClearSelection}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          Effacer la sélection
        </button>
        {selectedWords.size > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {selectedWords.size} mot(s) sélectionné(s)
          </span>
        )}
      </div>
      
      <TextDisplay
        words={words}
        text={text}
        selectedWords={selectedWords}
        onContextMenu={handleContainerContextMenu}
        onWordClick={handleWordClick}
      />

      {contextMenu.visible && (
        <ContextMenu
          contextMenu={contextMenu}
          existingLabels={getExistingLabels()}
          onApplyLabel={applyLabel}
          onApplyColor={applyColorDirectly}
          onRemoveLabel={removeLabel}
          getCurrentColor={getCurrentColor}
        />
      )}
    </div>
  );
};
