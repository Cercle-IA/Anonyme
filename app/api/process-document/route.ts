import { NextResponse, type NextRequest } from "next/server";
import mammoth from "mammoth";
import { PresidioAnalyzerResult } from "@/app/config/entityLabels";

export async function POST(req: NextRequest) {
  console.log("🔍 Début du traitement de la requête");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "pii"; // Récupérer la catégorie

    console.log("📊 Catégorie sélectionnée:", category);
    // ✅ Validation améliorée du fichier
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    // Vérifications supplémentaires
    if (file.size === 0) {
      return NextResponse.json(
        { error: "Le fichier est vide (0 bytes)." },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 50MB)." },
        { status: 400 }
      );
    }

    console.log("📁 Fichier reçu:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    let fileContent = "";
    const fileType = file.type;

    // --- LOGIQUE D'EXTRACTION DE TEXTE ---
    if (fileType === "application/pdf") {
      console.log("📄 Traitement PDF en cours...");
      console.log("📊 Taille du fichier:", file.size, "bytes");

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log("📦 Buffer créé, taille:", buffer.length);

        const { default: pdf } = await import("pdf-parse");
        const data = await pdf(buffer);
        fileContent = data.text || "";

        console.log("✅ Extraction PDF réussie, longueur:", fileContent.length);
        console.log("📄 Nombre de pages:", data.numpages);
        console.log("ℹ️ Info PDF:", data.info?.Title || "Titre non disponible");

        // ✅ Vérification améliorée
        if (!fileContent.trim()) {
          console.log("⚠️ PDF vide - Détails:", {
            pages: data.numpages,
            metadata: data.metadata,
            info: data.info,
            extractedLength: fileContent.length,
          });

          // Détecter si c'est un PDF scanné
          const isScanned =
            data.info?.Creator?.includes("RICOH") ||
            data.info?.Creator?.includes("Canon") ||
            data.info?.Creator?.includes("HP") ||
            data.info?.Producer?.includes("Scanner") ||
            (data.numpages > 0 && fileContent.length < 50);

          const errorMessage = isScanned
            ? `Ce PDF semble être un document scanné (créé par: ${data.info?.Creator}). Les documents scannés contiennent des images de texte, pas du texte extractible.\n\n💡 Solutions :\n- Utilisez un PDF créé depuis Word/Google Docs\n- Appliquez l'OCR avec Adobe Acrobat\n- Recréez le document au lieu de le scanner`
            : `Le PDF ne contient pas de texte extractible.\n\nCela peut être dû à :\n- PDF scanné (image uniquement)\n- PDF protégé\n- PDF avec texte en images\n- Nombre de pages: ${data.numpages}`;

          return NextResponse.json({ error: errorMessage }, { status: 400 });
        }
      } catch (pdfError) {
        console.error("❌ Erreur PDF détaillée:", {
          message:
            pdfError instanceof Error ? pdfError.message : "Erreur inconnue",
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        return NextResponse.json(
          {
            error: `Impossible de traiter ce PDF (${file.name}). Erreur: ${
              pdfError instanceof Error ? pdfError.message : "Erreur inconnue"
            }. Vérifiez que le PDF n'est pas protégé, corrompu ou scanné.`,
          },
          { status: 500 }
        );
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("📝 Traitement Word en cours...");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileContent = result.value || "";
        console.log(
          "✅ Extraction Word réussie, longueur:",
          fileContent.length
        );
      } catch (wordError) {
        console.error("❌ Erreur Word:", wordError);
        return NextResponse.json(
          {
            error: `Erreur traitement Word: ${
              wordError instanceof Error ? wordError.message : "Erreur inconnue"
            }`,
          },
          { status: 500 }
        );
      }
    } else {
      console.log("📄 Traitement texte en cours...");
      try {
        fileContent = await file.text();
        console.log(
          "✅ Extraction texte réussie, longueur:",
          fileContent.length
        );
      } catch (textError) {
        console.error("❌ Erreur texte:", textError);
        return NextResponse.json(
          {
            error: `Erreur lecture texte: ${
              textError instanceof Error ? textError.message : "Erreur inconnue"
            }`,
          },
          { status: 500 }
        );
      }
    }

    if (!fileContent || fileContent.trim().length === 0) {
      console.log("⚠️ Contenu vide détecté");
      return NextResponse.json(
        { error: "Le fichier ne contient pas de texte extractible." },
        { status: 400 }
      );
    }

    // Vérifier si c'est juste pour l'extraction de texte (lecture simple)
    const isSimpleExtraction =
      req.headers.get("x-simple-extraction") === "true";

    if (isSimpleExtraction) {
      // Retourner juste le texte extrait
      return NextResponse.json({ text: fileContent }, { status: 200 });
    }

    // ==========================================================
    // CONFIGURATION PRESIDIO ANALYZER (pour l'anonymisation complète)
    // ==========================================================

    const analyzerConfig = {
      text: fileContent,
      language: "fr",
      mode: category, // Ajouter le mode basé sur la catégorie
    };

    const presidioBaseUrl = process.env.PRESIDIO_ANALYZER_URL;
    if (!presidioBaseUrl) {
      console.error("❌ Variable d'environnement PRESIDIO_ANALYZER_URL non définie.");
      return NextResponse.json(
        { error: "Configuration serveur manquante : PRESIDIO_ANALYZER_URL n'est pas définie." },
        { status: 503 }
      );
    }

    const presidioAnalyzerUrl = `${presidioBaseUrl}/analyze`;
    const presidioAnonymizerUrl = `${presidioBaseUrl}/anonymize`;

    console.log("🔍 Appel à Presidio Analyzer:", presidioAnalyzerUrl);
    console.log("📊 Configuration:", analyzerConfig);

    try {
      // --- ÉTAPE 1 : Analyse ---
      let analyzeResponse: Response;
      try {
        analyzeResponse = await fetch(presidioAnalyzerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(analyzerConfig),
        });
      } catch (networkError) {
        const msg = networkError instanceof Error ? networkError.message : "Erreur réseau inconnue";
        console.error("❌ Presidio injoignable:", presidioAnalyzerUrl, msg);
        return NextResponse.json(
          { error: `Presidio Analyzer injoignable (${presidioAnalyzerUrl}). Vérifiez que le service est démarré et que PRESIDIO_ANALYZER_URL est correct. Détail : ${msg}` },
          { status: 503 }
        );
      }

      console.log("📊 Statut Analyzer:", analyzeResponse.status);

      if (!analyzeResponse.ok) {
        const errorBody = await analyzeResponse.text();
        console.error("❌ Erreur Analyzer HTTP", analyzeResponse.status, ":", errorBody);
        return NextResponse.json(
          { error: `Presidio Analyzer a retourné une erreur ${analyzeResponse.status} : ${errorBody}` },
          { status: 502 }
        );
      }

      const analyzerResults = await analyzeResponse.json();
      console.log("✅ Analyzer a trouvé", analyzerResults.length, "entités.");

      // --- ÉTAPE 2 : Anonymisation ---
      const anonymizerConfig = {
        text: fileContent,
        analyzer_results: analyzerResults,
        mode: category,
      };

      console.log("🔍 Appel à Presidio Anonymizer:", presidioAnonymizerUrl);

      let anonymizeResponse: Response;
      try {
        anonymizeResponse = await fetch(presidioAnonymizerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(anonymizerConfig),
        });
      } catch (networkError) {
        const msg = networkError instanceof Error ? networkError.message : "Erreur réseau inconnue";
        console.error("❌ Presidio Anonymizer injoignable:", presidioAnonymizerUrl, msg);
        return NextResponse.json(
          { error: `Presidio Anonymizer injoignable. Détail : ${msg}` },
          { status: 503 }
        );
      }

      console.log("📊 Statut Anonymizer:", anonymizeResponse.status);

      if (!anonymizeResponse.ok) {
        const errorBody = await anonymizeResponse.text();
        console.error("❌ Erreur Anonymizer HTTP", anonymizeResponse.status, ":", errorBody);
        return NextResponse.json(
          { error: `Presidio Anonymizer a retourné une erreur ${anonymizeResponse.status} : ${errorBody}` },
          { status: 502 }
        );
      }

      const anonymizerResult = await anonymizeResponse.json();
      console.log("✅ Anonymisation réussie.");
      console.log("✅ Texte anonymisé reçu de Presidio:", anonymizerResult.anonymized_text);

      // Créer un mapping simple basé sur les entités détectées
      const replacementValues: Record<string, string> = {};

      analyzerResults.forEach((result: PresidioAnalyzerResult) => {
        const originalValue = fileContent.substring(result.start, result.end);
        replacementValues[originalValue] = result.entity_type;
      });

      const result = {
        text: fileContent,
        anonymizedText: anonymizerResult.anonymized_text,
        piiCount: analyzerResults.length,
        analyzerResults: analyzerResults,
        replacementValues: replacementValues,
        usePresidioText: true,
      };

      return NextResponse.json(result, { status: 200 });
    } catch (presidioError) {
      console.error("❌ Erreur inattendue Presidio:", presidioError);
      return NextResponse.json(
        { error: `Erreur inattendue lors de l'appel à Presidio : ${presidioError instanceof Error ? presidioError.message : "Erreur inconnue"}` },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    console.error("❌ Erreur générale:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erreur serveur inconnue.",
      },
      { status: 500 }
    );
  }
}
