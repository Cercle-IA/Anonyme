"use client";

import { useState, useCallback } from "react";
import { FileUploadComponent } from "./components/FileUploadComponent";
import { EntityMappingTable } from "./components/EntityMappingTable";
import { ProgressBar } from "./components/ProgressBar";
import { useFileHandler } from "./components/FileHandler";
import { useAnonymization } from "./components/AnonymizationLogic";
import { useDownloadActions } from "./components/DownloadActions";

import { EntityMapping } from "./config/entityLabels"; // Importer l'interface unifiée

// Supprimer l'interface locale EntityMapping (lignes 12-18)

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [anonymizedText, setAnonymizedText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [entityMappings, setEntityMappings] = useState<EntityMapping[]>([]);
  // Remove this unused state variable:
  // const [isExampleLoaded, setIsExampleLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("pii");

  const progressSteps = ["Téléversement", "Prévisualisation", "Anonymisation"];

  const getCurrentStep = () => {
    if (outputText) return 3;
    if (uploadedFile || (sourceText && sourceText.trim())) return 2;
    return 1;
  };

  // Fonction pour recommencer (retourner à l'état initial)
  const handleRestart = () => {
    setSourceText("");
    setOutputText("");
    setUploadedFile(null);
    setError(null);
    setIsLoadingFile(false);
    setEntityMappings([]);
    // Remove this line: setIsExampleLoaded(false);
    setSelectedCategory("pii");
  };

  // Fonction pour mettre à jour les mappings depuis l'éditeur interactif
  const handleMappingsUpdate = useCallback(
    (updatedMappings: EntityMapping[]) => {
      setEntityMappings(updatedMappings);
    },
    []
  );

  // Hooks personnalisés pour la logique métier
  const { handleFileChange } = useFileHandler({
    setUploadedFile,
    setSourceText,
    setError,
    setIsLoadingFile,
  });

  const { anonymizeData, isProcessing } = useAnonymization({
    setOutputText,
    setError,
    setEntityMappings,
    setAnonymizedText, // Passer la fonction pour stocker le texte anonymisé
  });

  const { copyToClipboard, downloadText } = useDownloadActions({
    outputText,
    entityMappings,
    anonymizedText,
    sourceText, // Ajouter le texte source
  });

  // Fonction wrapper pour appeler anonymizeData avec les bonnes données
  // Remove unused function or update the onAnonymize prop
  // const handleAnonymize = (category?: string) => {
  //   anonymizeData({ file: uploadedFile, text: sourceText, category });
  // };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4">
        {/* Progress Bar */}
        <ProgressBar currentStep={getCurrentStep()} steps={progressSteps} />

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
          <div className="p-1 sm:p-3">
            <FileUploadComponent
              uploadedFile={uploadedFile}
              handleFileChange={handleFileChange}
              sourceText={sourceText}
              setSourceText={setSourceText}
              setUploadedFile={setUploadedFile}
              onAnonymize={(category: string) => anonymizeData({ file: uploadedFile, text: sourceText, category })}
              isProcessing={isProcessing}
              canAnonymize={!!sourceText.trim()}
              isLoadingFile={isLoadingFile}
              onRestart={handleRestart}
              outputText={outputText}
              copyToClipboard={copyToClipboard}
              downloadText={downloadText}
              // Remove this line: setIsExampleLoaded={setIsExampleLoaded}
              entityMappings={entityMappings}
              onMappingsUpdate={handleMappingsUpdate}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Entity Mapping Table - Seulement si outputText existe */}
        {outputText && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-1 sm:p-3">
              <EntityMappingTable
                mappings={entityMappings}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        )}

        {/* Error Message - Version améliorée */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mx-2 sm:mx-0">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 text-sm font-semibold mb-2">
                  {error.includes("scanné")
                    ? "📄 PDF Scanné Détecté"
                    : error.includes("HTTP")
                    ? "🚨 Erreur de Traitement"
                    : "⚠️ Erreur"}
                </h3>
                <div className="text-red-700 text-xs sm:text-sm leading-relaxed">
                  {error.split("\n").map((line, index) => (
                    <div key={index} className={index > 0 ? "mt-2" : ""}>
                      {line.startsWith("💡") ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <div className="text-blue-800 font-medium text-sm">
                            {line}
                          </div>
                        </div>
                      ) : line.startsWith("-") ? (
                        <div className="ml-4 text-blue-700">{line}</div>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
