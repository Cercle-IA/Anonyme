import { useCallback, useMemo } from "react";
import { EntityMapping } from "@/app/config/entityLabels";
import {
  COLOR_PALETTE,
  generateColorFromName,
  type ColorOption,
} from "../../config/colorPalette";

export const useColorMapping = (entityMappings: EntityMapping[]) => {
  const colorOptions: ColorOption[] = COLOR_PALETTE;

  const tailwindToHex = useMemo(() => {
    const mapping: Record<string, string> = {};
    COLOR_PALETTE.forEach((color) => {
      mapping[color.bgClass] = color.value;
    });
    return mapping;
  }, []);

  // CORRECTION: Fonction qui prend un texte et retourne la couleur
  const getCurrentColor = useCallback(
    (selectedText: string): string => {
      if (!selectedText || !entityMappings) {
        return '#e5e7eb'; // Couleur grise par défaut au lieu du bleu
      }

      // Chercher le mapping correspondant au texte sélectionné
      const mapping = entityMappings.find((m) => m.text === selectedText);

      if (mapping?.customColor) {
        return mapping.customColor;
      }

      if (mapping?.displayName) {
        return generateColorFromName(mapping.displayName).value;
      }

      if (mapping?.entity_type) {
        return generateColorFromName(mapping.entity_type).value;
      }

      // Retourner gris par défaut si aucun mapping
      return '#e5e7eb';
    },
    [entityMappings]
  );

  const getColorByText = useCallback(
    (selectedText: string) => {
      return getCurrentColor(selectedText);
    },
    [getCurrentColor]
  );

  return {
    colorOptions,
    tailwindToHex,
    getCurrentColor,
    getColorByText,
  };
};
