import { useState } from "react";
import {
  PresidioAnalyzerResult,
  EntityMapping,
} from "@/app/config/entityLabels";

// Interface pour la réponse de l'API process-document
interface ProcessDocumentResponse {
  text?: string;
  anonymizedText?: string;
  analyzerResults?: PresidioAnalyzerResult[];
  replacementValues?: Record<string, string>; // Nouvelle propriété
  error?: string;
}

// Props du hook - Renommer pour correspondre à l'utilisation
interface UseAnonymizationProps {
  setOutputText: (text: string) => void;
  setError: (error: string | null) => void;
  setEntityMappings: (mappings: EntityMapping[]) => void;
  setAnonymizedText?: (text: string) => void; // Nouveau paramètre optionnel
}

// NOUVEAU: Définir les types pour le paramètre de anonymizeData
interface AnonymizeDataParams {
  file?: File | null;
  text?: string;
  category?: string; // Ajouter le paramètre catégorie
}

/**
 * Hook pour la logique d'anonymisation.
 * Gère l'appel API et la création du tableau de mapping de manière simple et directe.
 */
export const useAnonymization = ({
  setOutputText,
  setError,
  setEntityMappings,
  setAnonymizedText,
}: UseAnonymizationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const anonymizeData = async ({ file, text, category = 'pii' }: AnonymizeDataParams) => {
    setIsProcessing(true);
    setError(null);
    setEntityMappings([]);
    setOutputText("");

    try {
      // ÉTAPE 1: Construire le FormData ici pour garantir le bon format
      const formData = new FormData();
      
      // Ajouter la catégorie au FormData
      formData.append('category', category);
      
      if (file) {
        formData.append("file", file);
      } else if (text) {
        // Si c'est du texte, on le transforme en Blob pour l'envoyer comme un fichier
        const textBlob = new Blob([text], { type: "text/plain" });
        formData.append("file", textBlob, "input.txt");
      } else {
        throw new Error("Aucune donnée à anonymiser (ni fichier, ni texte).");
      }

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData, // Le Content-Type sera automatiquement défini par le navigateur
      });

      const data: ProcessDocumentResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Erreur lors de la communication avec l'API."
        );
      }

      const originalText = data.text || "";
      const presidioResults = data.analyzerResults || [];
      const replacementValues = data.replacementValues || {}; // Récupérer les valeurs de remplacement

      // 🔍 AJOUT DES CONSOLE.LOG POUR DÉBOGUER
      console.log("📊 Réponse de l'API:", {
        originalTextLength: originalText.length,
        presidioResultsCount: presidioResults.length,
        presidioResults: presidioResults,
        replacementValues: replacementValues,
        replacementValuesKeys: Object.keys(replacementValues),
        replacementValuesEntries: Object.entries(replacementValues),
      });

      // ÉTAPE 2 : Utiliser le texte ANONYMISÉ de Presidio au lieu du texte original
      setOutputText(data.anonymizedText || originalText);

      // NOUVEAU : Stocker le texte anonymisé de Presidio séparément
      if (setAnonymizedText && data.anonymizedText) {
        setAnonymizedText(data.anonymizedText);
      }

      // ÉTAPE 3 : Créer le tableau de mapping avec la nouvelle structure
      const sortedResults = [...presidioResults].sort(
        (a, b) => a.start - b.start
      );
      const mappings: EntityMapping[] = [];

      // Dans la fonction anonymizeData, section création des mappings :
      for (const result of sortedResults) {
        const { entity_type, start, end } = result;
        const detectedText = originalText.substring(start, end);

        // 🔍 CONSOLE.LOG POUR CHAQUE ENTITÉ
        console.log(`🔍 Entité détectée:`, {
          entity_type,
          detectedText,
          replacementFromMap: replacementValues[detectedText],
          fallback: `[${entity_type}]`,
        });

        mappings.push({
          entity_type: entity_type,
          start: start,
          end: end,
          text: detectedText,
          replacementValue: replacementValues[detectedText],
          displayName: replacementValues[detectedText]
            ? replacementValues[detectedText].replace(/[\[\]]/g, "")
            : entity_type,
          customColor: undefined,
        });
      }

      // 🔍 CONSOLE.LOG FINAL DES MAPPINGS
      console.log("📋 Mappings créés:", mappings);

      // ÉTAPE 4 : Mettre à jour l'état global avec les mappings créés.
      setEntityMappings(mappings);
    } catch (error) {
      console.error("Erreur dans useAnonymization:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    anonymizeData,
    isProcessing,
  };
};
