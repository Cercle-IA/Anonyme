interface FileHandlerProps {
  setUploadedFile: (file: File | null) => void;
  setSourceText: (text: string) => void;
  setError: (error: string | null) => void;
  setIsLoadingFile: (loading: boolean) => void;
}

export const useFileHandler = ({
  setUploadedFile,
  setSourceText,
  setError,
  setIsLoadingFile,
}: FileHandlerProps) => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);
    setSourceText("");

    if (file.type === "text/plain") {
      try {
        const text = await file.text();
        setSourceText(text);
      } catch {
        setError("Erreur lors de la lecture du fichier texte");
        setUploadedFile(null);
      }
    } else if (file.type === "application/pdf") {
      // Activer le loader immédiatement pour les PDF
      setIsLoadingFile?.(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/process-document", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          // ✅ Récupérer le message d'erreur détaillé du serveur
          let errorMessage = `Erreur HTTP: ${response.status}`;

          try {
            const responseText = await response.text();
            console.log("🔍 Réponse brute du serveur:", responseText);

            try {
              const errorData = JSON.parse(responseText);
              if (errorData.error) {
                errorMessage = errorData.error;
                console.log("✅ Message détaillé récupéré:", errorMessage);
              }
            } catch (jsonError) {
              console.error("❌ Erreur parsing JSON:", jsonError);
              console.error("❌ Réponse non-JSON:", responseText);
              errorMessage = `Erreur ${response.status}: ${
                responseText || "Réponse invalide du serveur"
              }`;
            }
          } catch (readError) {
            console.error("❌ Impossible de lire la réponse:", readError);
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const extractedText = data.text || data.anonymizedText || "";

        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error(
            "Le fichier PDF ne contient pas de texte extractible"
          );
        }

        setSourceText(extractedText);
      } catch (error) {
        console.error("Erreur PDF:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la lecture du fichier PDF"
        );
        setUploadedFile(null);
        setSourceText("");
      } finally {
        // Désactiver le loader une fois terminé
        setIsLoadingFile?.(false);
      }
    } else {
      setError(
        "Type de fichier non supporté. Veuillez utiliser un fichier TXT ou PDF."
      );
      setUploadedFile(null);
    }
  };

  return { handleFileChange };
};
