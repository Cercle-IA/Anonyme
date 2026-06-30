import {
  Upload,
  FileText,
  AlertTriangle,
  Shield,
  Copy,
  Download,
} from "lucide-react";
import { SampleTextComponent } from "./SampleTextComponent";
import { SupportedDataTypes } from "./SupportedDataTypes";
import { AnonymizationInterface } from "./AnonymizationInterface";

import { InteractiveTextEditor } from "./InteractiveTextEditor";
import React, { useState } from "react";
import { EntityMapping } from "../config/entityLabels"; // Importer l'interface unifiée

// Supprimer l'interface locale EntityMapping (lignes 15-21)

interface FileUploadComponentProps {
  uploadedFile: File | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sourceText: string;
  setSourceText: (text: string) => void;
  setUploadedFile: (file: File | null) => void;
  onAnonymize?: (category: string) => void;
  isProcessing?: boolean;
  canAnonymize?: boolean;
  isLoadingFile?: boolean;
  onRestart?: () => void;
  outputText?: string;
  copyToClipboard?: () => void;
  downloadText?: () => void;
  setIsExampleLoaded?: (loaded: boolean) => void;
  entityMappings?: EntityMapping[];
  onMappingsUpdate?: (mappings: EntityMapping[]) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
}

export const FileUploadComponent = ({
  uploadedFile,
  handleFileChange,
  sourceText,
  setSourceText,
  setUploadedFile,
  onAnonymize,
  isProcessing = false,
  canAnonymize = false,
  isLoadingFile = false,
  onRestart,
  outputText,
  copyToClipboard,
  downloadText,
  setIsExampleLoaded,
  entityMappings,
  onMappingsUpdate,
  selectedCategory = "pii",
  setSelectedCategory,
}: FileUploadComponentProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  // Remove the duplicate local state declarations:
  // const [selectedCategory, setSelectedCategory] = useState("pii");

  // Fonction pour valider le type de fichier
  const isValidFileType = (file: File) => {
    const allowedTypes = ["text/plain", "application/pdf"];
    const allowedExtensions = [".txt", ".pdf"];

    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  };

  // Gestionnaires de glisser-déposer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Vérifier si on quitte vraiment la zone de drop
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];

      // Vérifier le type de fichier
      if (!isValidFileType(file)) {
        alert(
          "Type de fichier non supporté. Veuillez sélectionner un fichier PDF ou TXT."
        );
        return;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Taille maximale : 5MB.");
        return;
      }

      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileChange(syntheticEvent);
    }
  };

  // Gestionnaire de changement de fichier modifié pour valider le type
  const handleFileChangeWithValidation = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && !isValidFileType(file)) {
      alert(
        "Type de fichier non supporté. Veuillez sélectionner un fichier PDF ou TXT."
      );
      e.target.value = ""; // Reset l'input
      return;
    }
    handleFileChange(e);
  };

  // On passe en preview seulement si :
  // 1. Un fichier est uploadé OU
  // 2. On a un résultat d'anonymisation
  // (On retire isExampleLoaded pour permettre l'édition du texte d'exemple)
  if (uploadedFile || outputText) {
    return (
      <div className="w-full flex flex-col space-y-6">
        {/* Si on a un résultat, afficher 2 blocs côte à côte */}
        {outputText ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview du document original */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {uploadedFile ? (
                        <p className="text-xs sm:text-sm text-orange-600 truncate">
                          {uploadedFile.name} •{" "}
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-orange-600">
                          Demo - Exemple de texte
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 max-h-72 overflow-y-auto overflow-x-hidden">
                  <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-mono break-words overflow-wrap-anywhere">
                    {sourceText || "Aucun contenu à afficher"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Bloc résultat anonymisé - MODE INTERACTIF */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-green-50 border-b border-green-200 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-green-600">
                        DOCUMENT ANONYMISÉ MODE INTERACTIF
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2">
                    {copyToClipboard && (
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Copier le texte"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}

                    {downloadText && (
                      <button
                        onClick={downloadText}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                        title="Télécharger le fichier"
                      >
                        <Download className="h-3 w-3" />
                        <span className="hidden sm:inline">Télécharger</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-1">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 max-h-72 overflow-y-auto overflow-x-hidden">
                  <InteractiveTextEditor
                    text={sourceText}
                    entityMappings={entityMappings || []}
                    onUpdateMapping={(
                      originalValue,
                      newLabel,
                      entityType,
                      applyToAllOccurrences,
                      customColor,
                      wordStart,
                      wordEnd
                    ) => {
                      if (onMappingsUpdate && entityMappings) {
                        console.log("🔄 Mise à jour mapping:", {
                          originalValue,
                          newLabel,
                          entityType,
                          applyToAllOccurrences,
                          customColor,
                          wordStart,
                          wordEnd,
                        });

                        let updatedMappings: EntityMapping[];

                        if (applyToAllOccurrences) {
                          // CORRECTION: Créer des mappings pour toutes les occurrences dans le texte
                          const existingMappingsForOtherTexts =
                            entityMappings.filter(
                              (mapping) => mapping.text !== originalValue
                            );

                          const newMappings: EntityMapping[] = [];
                          let searchIndex = 0;

                          // Chercher toutes les occurrences dans le texte source
                          while (true) {
                            const foundIndex = sourceText.indexOf(
                              originalValue,
                              searchIndex
                            );
                            if (foundIndex === -1) break;

                            // Vérifier que c'est une occurrence valide (limites de mots)
                            const isValidBoundary =
                              (foundIndex === 0 ||
                                !/\w/.test(sourceText[foundIndex - 1])) &&
                              (foundIndex + originalValue.length ===
                                sourceText.length ||
                                !/\w/.test(
                                  sourceText[foundIndex + originalValue.length]
                                ));

                            if (isValidBoundary) {
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

                          updatedMappings = [
                            ...existingMappingsForOtherTexts,
                            ...newMappings,
                          ];
                        } else {
                          // Logique existante pour une seule occurrence
                          if (
                            wordStart !== undefined &&
                            wordEnd !== undefined
                          ) {
                            const targetMapping = entityMappings.find(
                              (mapping) =>
                                mapping.start === wordStart &&
                                mapping.end === wordEnd
                            );

                            if (targetMapping) {
                              updatedMappings = entityMappings.map(
                                (mapping) => {
                                  if (
                                    mapping.start === wordStart &&
                                    mapping.end === wordEnd
                                  ) {
                                    return {
                                      ...mapping,
                                      displayName: newLabel,
                                      entity_type: entityType,
                                      customColor: customColor,
                                    };
                                  }
                                  return mapping;
                                }
                              );
                            } else {
                              const newMapping: EntityMapping = {
                                text: originalValue,
                                entity_type: entityType,
                                start: wordStart,
                                end: wordEnd,
                                displayName: newLabel,
                                customColor: customColor,
                              };
                              updatedMappings = [...entityMappings, newMapping];
                            }
                          } else {
                            // Fallback: logique existante
                            const existingMappingIndex =
                              entityMappings.findIndex(
                                (mapping) => mapping.text === originalValue
                              );

                            if (existingMappingIndex !== -1) {
                              updatedMappings = entityMappings.map(
                                (mapping, index) => {
                                  if (index === existingMappingIndex) {
                                    return {
                                      ...mapping,
                                      displayName: newLabel,
                                      entity_type: entityType,
                                      customColor: customColor,
                                    };
                                  }
                                  return mapping;
                                }
                              );
                            } else {
                              const foundIndex =
                                sourceText.indexOf(originalValue);
                              if (foundIndex !== -1) {
                                const newMapping: EntityMapping = {
                                  text: originalValue,
                                  entity_type: entityType,
                                  start: foundIndex,
                                  end: foundIndex + originalValue.length,
                                  displayName: newLabel,
                                  customColor: customColor,
                                };
                                updatedMappings = [
                                  ...entityMappings,
                                  newMapping,
                                ];
                              } else {
                                updatedMappings = entityMappings;
                              }
                            }
                          }
                        }

                        console.log(
                          "✅ Mappings mis à jour:",
                          updatedMappings.length
                        );
                        onMappingsUpdate(
                          updatedMappings.sort((a, b) => a.start - b.start)
                        );
                      }
                    }}
                    onRemoveMapping={(originalValue, applyToAll) => {
                      if (onMappingsUpdate && entityMappings) {
                        console.log("🗑️ Suppression mapping:", {
                          originalValue,
                          applyToAll,
                        });

                        let filteredMappings: EntityMapping[];

                        if (applyToAll) {
                          // Supprimer toutes les occurrences
                          filteredMappings = entityMappings.filter(
                            (mapping) => mapping.text !== originalValue
                          );
                        } else {
                          // Supprimer seulement la première occurrence
                          const firstIndex = entityMappings.findIndex(
                            (mapping) => mapping.text === originalValue
                          );
                          if (firstIndex !== -1) {
                            filteredMappings = entityMappings.filter(
                              (_, index) => index !== firstIndex
                            );
                          } else {
                            filteredMappings = entityMappings;
                          }
                        }

                        console.log(
                          "✅ Mappings après suppression:",
                          filteredMappings.length
                        );
                        onMappingsUpdate(
                          filteredMappings.sort((a, b) => a.start - b.start)
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview normal quand pas de résultat */
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {uploadedFile ? (
                      <p className="text-xs sm:text-sm text-orange-600 truncate">
                        {uploadedFile.name} •{" "}
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-orange-600">
                        Demo - Exemple de texte
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2  ">
              {/* Zone de texte avec limite de hauteur et scroll */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 max-h-48 overflow-y-auto overflow-x-hidden">
                {isLoadingFile ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#f7ab6e]"></div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Chargement du fichier en cours...
                      </span>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-mono break-words overflow-wrap-anywhere">
                    {sourceText || "Aucun contenu à afficher"}
                  </pre>
                )}
              </div>

              {/* Disclaimer déplacé en dessous du texte */}
              <div className="mt-4">
                <div className="flex items-start gap-2 p-3 bg-[#f7ab6e] bg-opacity-10 border border-[#f7ab6e] border-opacity-30 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-[#f7ab6e] mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] sm:text-[11px] text-[#092727] leading-relaxed">
                    Cet outil IA peut ne pas détecter toutes les informations
                    sensibles. Vérifiez le résultat avant de le partager.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action - Responsive mobile */}
        {canAnonymize && !isLoadingFile && (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Sélecteur de catégorie - NOUVEAU */}
            {onAnonymize && !outputText && (
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-medium text-gray-700 text-center">
                  Catégorie d&apos;anonymisation
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory?.(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#f7ab6e] focus:border-[#f7ab6e] transition-colors duration-200"
                >
                  <option value="pii">🔒 PII (Données Personnelles)</option>
                  <option value="business">🏢 Business (Données Métier)</option>
                  <option value="pii_business">
                    🔒🏢 PII + Business (Tout)
                  </option>
                </select>
              </div>
            )}

            {/* Bouton Anonymiser - seulement si pas encore anonymisé */}
            {onAnonymize && !outputText && (
              <button
                onClick={() => onAnonymize?.(selectedCategory)}
                disabled={isProcessing || !sourceText.trim()}
                className="w-full bg-[#f7ab6e] hover:bg-[#f7ab6e]/90 text-black px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm disabled:bg-gray-300 disabled:text-gray-800 disabled:font-bold disabled:cursor-not-allowed"
                title={
                  sourceText.trim()
                    ? "Anonymiser les données"
                    : "Saisissez du texte pour anonymiser"
                }
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Anonymisation en cours...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Anonymiser mes données</span>
                  </>
                )}
              </button>
            )}

            {/* Bouton Recommencer - toujours visible */}
            {onRestart && (
              <button
                onClick={onRestart}
                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Recommencer</span>
              </button>
            )}
          </div>
        )}

        {/* Affichage conditionnel : Interface d'anonymisation OU Types de données supportées */}
        {isProcessing || outputText ? (
          <AnonymizationInterface
            isProcessing={isProcessing}
            outputText={outputText}
            sourceText={sourceText}
          />
        ) : (
          <SupportedDataTypes />
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Deux colonnes côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colonne gauche - Zone de texte */}
        <div className="border-2 border-dashed border-[#092727] rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#0a3030] transition-all duration-300">
          <div className="p-3 sm:p-4">
            {/* Header avec icône */}
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-[#f7ab6e] rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Titre */}
            <h3 className="text-lg font-semibold text-[#092727] mb-1 text-center">
              Saisissez votre texte
            </h3>
            <p className="text-md text-[#092727] opacity-80 mb-2 text-center">
              Tapez ou collez votre texte ici
            </p>

            {/* Zone de texte éditable */}
            <div className="relative border-2 border-gray-200 rounded-lg bg-white focus-within:border-[#f7ab6e] focus-within:ring-1 focus-within:ring-[#f7ab6e]/20 transition-all duration-300">
              {/* Zone pour le texte - SANS overflow */}
              <div className="h-40 p-2 pb-6 relative">
                {" "}
                {/* Ajout de pb-6 pour le compteur */}
                {/* Placeholder personnalisé avec lien cliquable */}
                {!sourceText && (
                  <div className="absolute inset-2 text-gray-400 text-md leading-relaxed pointer-events-none">
                    <span>Commencez à taper du texte, ou&nbsp;</span>
                    <SampleTextComponent
                      setSourceText={setSourceText}
                      setUploadedFile={setUploadedFile}
                      setIsExampleLoaded={setIsExampleLoaded}
                      variant="link"
                    />
                  </div>
                )}
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="" // Placeholder vide car on utilise le custom
                  className="w-full h-full border-none outline-none resize-none text-[#092727] text-xs leading-relaxed bg-transparent overflow-y-auto"
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  }}
                />
                {/* Compteur de caractères en bas à gauche */}
                <div className="absolute bottom-1 left-2 text-gray-400 text-xs pointer-events-none">
                  {sourceText.length} caractères
                </div>
              </div>

              {/* Barre du bas avec sélecteur et bouton */}
              <div className="flex flex-col p-2 border-t border-gray-200 bg-gray-50 space-y-2">
                {/* Sélecteur de type d'anonymisation */}
                <div className="flex flex-col w-full">
                  <label className="text-xs text-gray-500 mb-1">
                    Type de données :
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory?.(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#f7ab6e] focus:border-[#f7ab6e] transition-colors duration-200"
                    >
                      <option value="pii">🔒 PII (Données Personnelles)</option>
                      <option value="business">🏢 Business (Données Métier)</option>
                      <option value="pii_business">🔒🏢 PII + Business </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bouton Anonymiser */}
                <button
                  onClick={() => onAnonymize?.(selectedCategory)}
                  disabled={isProcessing || !sourceText.trim()}
                  className="w-full bg-[#f7ab6e] hover:bg-[#f7ab6e]/90 text-black px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm disabled:bg-gray-300 disabled:text-gray-800 disabled:font-bold disabled:cursor-not-allowed"
                  title={
                    sourceText.trim()
                      ? "Anonymiser les données"
                      : "Saisissez du texte pour anonymiser"
                  }
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>Anonymisez les données</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Zone upload */}
        <div
          className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
            isDragOver
              ? "border-[#f7ab6e] bg-[#f7ab6e]/10 scale-105"
              : "border-[#092727] bg-gray-50 hover:bg-gray-100 hover:border-[#0a3030]"
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer group p-3 sm:p-4 h-full min-h-[200px]">
            {/* Upload Icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                isDragOver ? "bg-[#f7ab6e] scale-110" : "bg-[#f7ab6e]"
              }`}
            >
              <Upload className="h-5 w-5 text-white" />
            </div>

            {/* Titre */}
            <h3
              className={`text-lg font-semibold mb-1 transition-colors duration-300 text-center ${
                isDragOver
                  ? "text-[#f7ab6e]"
                  : "text-[#092727] group-hover:text-[#0a3030]"
              }`}
            >
              {isDragOver
                ? "Déposez votre fichier"
                : "Déposez votre fichier ici"}
            </h3>
            <p
              className={`text-sm mb-3 text-center transition-opacity duration-300 ${
                isDragOver
                  ? "text-[#f7ab6e] opacity-90"
                  : "text-[#092727] opacity-80 group-hover:opacity-90"
              }`}
            >
              ou cliquez pour sélectionner
            </p>

            {/* File Info */}
            <div className="flex items-center gap-1 text-xs text-[#092727] opacity-60">
              <span>📄 Fichiers PDF et TXT uniquement</span> -{" "}
              <span>Max 5MB</span>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              onChange={handleFileChangeWithValidation}
              accept=".txt,.pdf"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Supported Data Types */}
      <SupportedDataTypes />
    </div>
  );
};
