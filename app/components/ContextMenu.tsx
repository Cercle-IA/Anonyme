import React, { useState, useRef, useEffect } from "react";
import { Trash2, Check, RotateCcw } from "lucide-react";
import { COLOR_PALETTE, type ColorOption } from "../config/colorPalette";
import { EntityMapping } from "../config/entityLabels";

interface ContextMenuProps {
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    selectedText: string;
    wordIndices: number[];
  };
  existingLabels: string[];
  entityMappings?: EntityMapping[];
  onApplyLabel: (displayName: string, applyToAll?: boolean) => void;
  onApplyColor: (
    color: string,
    colorName: string,
    applyToAll?: boolean
  ) => void;
  onRemoveLabel: (applyToAll?: boolean) => void;
  getCurrentColor: (selectedText: string) => string;
}

const colorOptions: ColorOption[] = COLOR_PALETTE;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  existingLabels,
  entityMappings,
  onApplyLabel,
  onApplyColor,
  onRemoveLabel,
  getCurrentColor,
}) => {
  const [showNewLabelInput, setShowNewLabelInput] = useState(false);
  const [newLabelValue, setNewLabelValue] = useState("");
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [tempSelectedColor, setTempSelectedColor] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction corrigée pour le bouton +
  const handleNewLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Bouton + cliqué - Ouverture du champ de saisie");
    setShowNewLabelInput(true);
    setShowColorPalette(false);
  };

  const handleApplyCustomLabel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (newLabelValue.trim()) {
      console.log(
        "Application du label personnalisé:",
        newLabelValue.trim(),
        "À toutes les occurrences:",
        applyToAll
      );
      
      // Appliquer d'abord le label
      onApplyLabel(newLabelValue.trim(), applyToAll);
      
      // Puis appliquer la couleur temporaire si elle existe
      if (tempSelectedColor) {
        setTimeout(() => {
          onApplyColor(tempSelectedColor, 'Couleur personnalisée', applyToAll);
        }, 100);
      }
      
      setNewLabelValue("");
      setShowNewLabelInput(false);
      setTempSelectedColor(''); // Reset de la couleur temporaire
    }
  };

  // Modifier la fonction handleCancelNewLabel pour accepter les deux types d'événements
  const handleCancelNewLabel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Annulation du nouveau label");
    setShowNewLabelInput(false);
    setNewLabelValue("");
  };

  // Fonction pour empêcher la propagation des événements
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Auto-focus sur l'input quand il apparaît
  useEffect(() => {
    if (showNewLabelInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [showNewLabelInput]);

  if (!contextMenu.visible) return null;

  // Calcul du positionnement pour s'assurer que le menu reste visible
  const calculatePosition = () => {
    const menuWidth = Math.max(600, contextMenu.selectedText.length * 8 + 400); // Largeur dynamique basée sur le texte
    const menuHeight = 60; // Hauteur fixe pour une seule ligne
    const padding = 10;

    let x = contextMenu.x;
    let y = contextMenu.y;

    // Ajuster X pour rester dans la fenêtre
    if (x + menuWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth / 2 - padding;
    }
    if (x - menuWidth / 2 < padding) {
      x = menuWidth / 2 + padding;
    }

    // Ajuster Y pour rester dans la fenêtre
    if (y + menuHeight > window.innerHeight - padding) {
      y = contextMenu.y - menuHeight - 20; // Afficher au-dessus
    }

    return { x, y };
  };

  const position = calculatePosition();

  return (
    <div
      ref={menuRef}
      data-context-menu
      className="fixed z-50 bg-white border border-gray-300 rounded-md"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -10px)",
        minWidth: "fit-content",
        whiteSpace: "nowrap",
      }}
      onClick={handleMenuClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Une seule ligne avec tous les contrôles */}
      <div className="flex items-center px-2 py-1 space-x-2">
        {/* Texte sélectionné complet */}
        <div className="flex-shrink-0">
          <div className="text-xs text-gray-800 bg-gray-50 px-2 py-1 rounded font-mono border">
            {contextMenu.selectedText}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Labels existants - toujours visible */}
        <div className="flex-shrink-0">
          <select
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.value) {
                const selectedDisplayName = e.target.value;
                console.log("📋 Label sélectionné:", selectedDisplayName);
                
                // Appliquer d'abord le label
                onApplyLabel(selectedDisplayName, applyToAll);
                
                // Puis appliquer la couleur temporaire si elle existe
                if (tempSelectedColor) {
                  setTimeout(() => {
                    onApplyColor(tempSelectedColor, 'Couleur personnalisée', applyToAll);
                  }, 100);
                }
                
                // Reset du select et de la couleur temporaire
                e.target.value = "";
                setTempSelectedColor('');
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-blue-300 rounded px-2 py-1 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer hover:bg-blue-100 transition-colors"
            defaultValue=""
          >
            <option value="" disabled className="text-gray-500">
              {existingLabels.length > 0 
                ? `📋 Labels (${existingLabels.length})`
                : "📋 Aucun label"}
            </option>
            {existingLabels.map((label) => (
              <option key={label} value={label} className="text-gray-800">
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Nouveau label */}
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-1">
            {!showNewLabelInput ? (
              <button
                type="button"
                onClick={handleNewLabelClick}
                onMouseDown={(e) => e.stopPropagation()}
                className="px-1 py-1 text-xs text-green-600 border border-green-300 rounded hover:bg-green-50 transition-colors flex items-center justify-center w-6 h-6 focus:outline-none focus:ring-1 focus:ring-green-500"
                title="Ajouter un nouveau label"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newLabelValue}
                  onChange={(e) => {
                    e.stopPropagation();
                    setNewLabelValue(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCustomLabel();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancelNewLabel(e);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
                  placeholder="Label"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomLabel}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={!newLabelValue.trim()}
                  className="px-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Appliquer le label"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelNewLabel}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-1 py-1 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
                  title="Annuler"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Sélecteur de couleur */}
        <div className="flex-shrink-0 relative">
          <button
            type="button"
            className="w-5 h-5 rounded-full border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-all"
            style={{
              backgroundColor: tempSelectedColor || getCurrentColor(contextMenu.selectedText),
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPalette(!showColorPalette);
              setShowNewLabelInput(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Couleur actuelle du label"
          />

          {showColorPalette && (
            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded border absolute z-10 mt-1 left-0">
              {colorOptions.map((color) => {
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // Vérifier si le texte a déjà un mapping (modification)
                      const existingMapping = entityMappings?.find(mapping => 
                        mapping.text === contextMenu.selectedText
                      );
                      
                      if (existingMapping) {
                        // MODIFICATION : Appliquer directement la couleur
                        onApplyColor(color.value, color.name, applyToAll);
                      } else {
                        // CRÉATION : Juste stocker la couleur temporaire
                        setTempSelectedColor(color.value);
                      }
                      
                      setShowColorPalette(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded-full border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-all"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Bouton supprimer */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveLabel(applyToAll);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-1 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors flex items-center justify-center w-6 h-6 focus:outline-none focus:ring-1 focus:ring-red-500"
            title="Supprimer le label"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Case à cocher "Toutes les occurrences" */}
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="applyToAll"
              checked={applyToAll}
              onChange={(e) => {
                e.stopPropagation();
                setApplyToAll(e.target.checked);
                console.log(
                  "Appliquer à toutes les occurrences:",
                  e.target.checked
                );
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="applyToAll"
              className="text-xs text-gray-700 cursor-pointer select-none whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                setApplyToAll(!applyToAll);
              }}
            >
              Toutes les occurences
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
