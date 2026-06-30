import { EntityMapping } from "@/app/config/entityLabels";
import { generateAnonymizedText } from "@/app/utils/generateAnonymizedText";

interface DownloadActionsProps {
  outputText: string;
  entityMappings?: EntityMapping[];
  anonymizedText?: string;
  sourceText?: string; // Ajouter le texte source
}

export const useDownloadActions = ({
  outputText,
  entityMappings,
  anonymizedText,
  sourceText, // Nouveau paramètre
}: DownloadActionsProps) => {
  const copyToClipboard = () => {
    // Utiliser les mappings mis à jour pour générer le texte final
    let textToCopy = anonymizedText || outputText;
    
    if (sourceText && entityMappings && entityMappings.length > 0) {
      // Générer le texte avec les labels modifiés manuellement
      textToCopy = generateAnonymizedText(sourceText, entityMappings);
    }
    
    navigator.clipboard.writeText(textToCopy);
  };

  const downloadText = () => {
    // Utiliser les mappings mis à jour pour générer le texte final
    let textToDownload = anonymizedText || outputText;
    
    if (sourceText && entityMappings && entityMappings.length > 0) {
      // Générer le texte avec les labels modifiés manuellement
      textToDownload = generateAnonymizedText(sourceText, entityMappings);
    }
    
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texte-anonymise.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { copyToClipboard, downloadText };
};
