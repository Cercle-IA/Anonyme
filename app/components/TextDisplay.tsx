import React from "react";
import { generateColorFromName } from "@/app/config/colorPalette";
import { Word } from "./hooks/useTextParsing";

interface TextDisplayProps {
  words: Word[];
  text: string;
  selectedWords: Set<number>;
  onContextMenu: (event: React.MouseEvent) => void;
  onWordClick: (index: number | null, event: React.MouseEvent) => void;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({
  words,
  text,
  selectedWords,
  onContextMenu,
  onWordClick,
}) => {
  const renderWord = (word: Word, index: number) => {
    const isSelected = selectedWords.has(index);

    let className = "inline-block transition-all duration-200 rounded-sm cursor-pointer select-text ";
    let backgroundColor = "transparent";

    if (word.isEntity) {
      if (word.mapping?.customColor) {
        backgroundColor = word.mapping.customColor;
      } else if (word.mapping?.displayName) {
        backgroundColor = generateColorFromName(word.mapping.displayName).value;
      } else if (word.entityType) {
        backgroundColor = generateColorFromName(word.entityType).value;
      } else {
        backgroundColor = generateColorFromName("default").value;
      }

      if (word.mapping?.displayName) {
        const colorClass = generateColorFromName(word.mapping.displayName);
        className += `${colorClass.bgClass} ${colorClass.textClass} border `;
      } else if (word.entityType) {
        const colorClass = generateColorFromName(word.entityType);
        className += `${colorClass.bgClass} ${colorClass.textClass} border `;
      }
    }

    if (isSelected) {
      className += "ring-2 ring-gray-400 bg-gray-100 ";
    } else {
      className += "hover:bg-yellow-100 ";
    }

    className += "brightness-95 ";
    return (
      <span
        key={index}
        data-word-index={index}
        className={className}
        style={{
          backgroundColor: backgroundColor,
        }}
        onClick={(event) => onWordClick(index, event)}
        title={
          word.isEntity
            ? `Entité: ${word.entityType} (Original: ${word.text})`
            : "Sélectionnez librement le texte ou cliquez sur les mots"
        }
      >
        {word.displayText}
      </span>
    );
  };

  return (
    <div 
      className="p-4 bg-white border border-gray-200 rounded-lg min-h-[300px] leading-relaxed text-sm select-text"
      onContextMenu={onContextMenu}
    >
      <div className="whitespace-pre-wrap select-text">
        {words.map((word, index) => {
          const nextWord = words[index + 1];
          const spaceBetween = nextWord
            ? text.slice(word.end, nextWord.start)
            : text.slice(word.end);

          return (
            <React.Fragment key={index}>
              {renderWord(word, index)}
              <span className="select-text">{spaceBetween}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
