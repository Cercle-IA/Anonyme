import React from "react";
import { Info } from "lucide-react";

export const InstructionsPanel: React.FC = () => {
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">Instructions d&apos;utilisation :</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Survolez les mots pour les mettre en évidence</li>
            <li>
              • Cliquez pour sélectionner un mot, Ctrl/CMD (ou Shift) + clic.
            </li>
            <li>• Faites clic droit pour ouvrir le menu contextuel</li>
            <li>• Modifiez les labels et couleurs selon vos besoins</li>
            <li>
              • Utilisez &quot;Toutes les occurrences&quot; pour appliquer à
              tous les mots similaires
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
