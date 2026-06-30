import { CheckCircle, Info } from "lucide-react";

interface AnonymizationInterfaceProps {
  isProcessing: boolean;
  outputText?: string;
  sourceText?: string;
}

export const AnonymizationInterface = ({
  isProcessing,
  outputText,
  sourceText,
}: AnonymizationInterfaceProps) => {
  // Fonction pour détecter quels types de données ont été anonymisés
  const getAnonymizedDataTypes = () => {
    if (!outputText || !sourceText) return new Set();

    const anonymizedTypes = new Set<string>();

    // PII - Données personnelles
    if (outputText.includes("[PERSONNE]")) {
      anonymizedTypes.add("Noms et prénoms");
    }
    if (outputText.includes("[DATE]")) {
      anonymizedTypes.add("Dates");
    }
    if (outputText.includes("[ADRESSE_EMAIL]")) {
      anonymizedTypes.add("Adresses e-mail");
    }
    if (
      outputText.includes("[TELEPHONE_FRANCAIS]") ||
      outputText.includes("[TELEPHONE_BELGE]") ||
      outputText.includes("[TELEPHONE]")
    ) {
      anonymizedTypes.add("Numéros de téléphone");
    }
    if (
      outputText.includes("[ADRESSE_FRANCAISE]") ||
      outputText.includes("[ADRESSE_BELGE]") ||
      outputText.includes("[ADRESSE]")
    ) {
      anonymizedTypes.add("Adresses postales");
    }
    if (outputText.includes("[LOCATION]")) {
      anonymizedTypes.add("Lieux géographiques");
    }
    if (
      outputText.includes("[CARTE_IDENTITE_FRANCAISE]") ||
      outputText.includes("[CARTE_IDENTITE_BELGE]") ||
      outputText.includes("[PASSEPORT_FRANCAIS]") ||
      outputText.includes("[PASSEPORT_BELGE]") ||
      outputText.includes("[PERMIS_CONDUIRE_FRANCAIS]")
    ) {
      anonymizedTypes.add("Documents d'identité");
    }
    if (outputText.includes("[NUMERO_SECURITE_SOCIALE_FRANCAIS]")) {
      anonymizedTypes.add("Numéros de sécurité sociale");
    }
    if (outputText.includes("[BIOMETRIC_DATA]")) {
      anonymizedTypes.add("Données biométriques");
    }
    if (outputText.includes("[HEALTH_DATA]")) {
      anonymizedTypes.add("Données de santé");
    }
    if (
      outputText.includes("[SEXUAL_ORIENTATION]") ||
      outputText.includes("[POLITICAL_OPINIONS]")
    ) {
      anonymizedTypes.add("Données sensibles RGPD");
    }

    // Données financières
    if (
      outputText.includes("[IBAN]") ||
      outputText.includes("[COMPTE_BANCAIRE_FRANCAIS]")
    ) {
      anonymizedTypes.add("Comptes bancaires");
    }
    if (outputText.includes("[CREDIT_CARD]")) {
      anonymizedTypes.add("Cartes de crédit");
    }
    if (outputText.includes("[MONTANT_FINANCIER]")) {
      anonymizedTypes.add("Montants financiers");
    }
    if (outputText.includes("[NUMERO_FISCAL_FRANCAIS]")) {
      anonymizedTypes.add("Numéros fiscaux");
    }
    if (outputText.includes("[RGPD_FINANCIAL_DATA]")) {
      anonymizedTypes.add("Données financières RGPD");
    }

    // Business - Données d'entreprise
    if (outputText.includes("[ORGANISATION]")) {
      anonymizedTypes.add("Noms d'organisations");
    }
    if (
      outputText.includes("[SIRET_SIREN_FRANCAIS]") ||
      outputText.includes("[SOCIETE_FRANCAISE]") ||
      outputText.includes("[SOCIETE_BELGE]")
    ) {
      anonymizedTypes.add("Entreprises et sociétés");
    }
    if (
      outputText.includes("[TVA_FRANCAISE]") ||
      outputText.includes("[TVA_BELGE]")
    ) {
      anonymizedTypes.add("Numéros de TVA");
    }
    if (
      outputText.includes("[NUMERO_ENTREPRISE_BELGE]") ||
      outputText.includes("[REGISTRE_NATIONAL_BELGE]")
    ) {
      anonymizedTypes.add("Identifiants d'entreprise");
    }
    if (outputText.includes("[SECRET_COMMERCIAL]")) {
      anonymizedTypes.add("Secrets commerciaux");
    }
    if (outputText.includes("[REFERENCE_CONTRAT]")) {
      anonymizedTypes.add("Références de contrats");
    }
    if (
      outputText.includes("[MARKET_SHARE]") ||
      outputText.includes("[PART_DE_MARCHE]") ||
      /\[\d+(?:[.,]\d+)?-\d+(?:[.,]\d+)?\]%/.test(outputText)
    ) {
      anonymizedTypes.add("Parts de marché");
    }
    if (
      outputText.includes("[CHIFFRE_AFFAIRES]") ||
      /\[\d[\d\s]*\s*-\s*\d[\d\s]*\]\s*(?:EUR|USD|GBP|CHF|€)/.test(outputText)
    ) {
      anonymizedTypes.add("Chiffres d'affaires");
    }
    if (
      outputText.includes("[ID_PROFESSIONNEL_BELGE]") ||
      outputText.includes("[DONNEES_PROFESSIONNELLES]")
    ) {
      anonymizedTypes.add("Identifiants professionnels");
    }

    // Données techniques
    if (outputText.includes("[ADRESSE_IP]")) {
      anonymizedTypes.add("Adresses IP");
    }
    if (outputText.includes("[URL_IDENTIFIANT]")) {
      anonymizedTypes.add("URLs et identifiants web");
    }
    if (outputText.includes("[CLE_API_SECRETE]")) {
      anonymizedTypes.add("Clés API secrètes");
    }
    if (outputText.includes("[IDENTIFIANT_PERSONNEL]")) {
      anonymizedTypes.add("Identifiants personnels");
    }
    if (outputText.includes("[LOCALISATION_GPS]")) {
      anonymizedTypes.add("Coordonnées GPS");
    }
    if (outputText.includes("[TITRE_CIVILITE]")) {
      anonymizedTypes.add("Titres de civilité");
    }

    return anonymizedTypes;
  };

  // Structure mise à jour avec les vrais types de données
  const supportedDataStructure = [
    {
      items: [
        "Noms et prénoms",
        "Numéros de téléphone",
        "URLs et identifiants web",
      ],
    },
    {
      items: ["Adresses postales", "Lieux géographiques", "Dates"],
    },
    {
      items: ["Documents d'identité", "Comptes bancaires", "Cartes de crédit"],
    },
    {
      items: ["Adresses e-mail", "Montants financiers", "Adresses IP"],
    },
    {
      items: [
        "Noms d'organisations",
        "Entreprises et sociétés",
        "Numéros de TVA",
      ],
    },
    {
      items: [
        "Parts de marché",
        "Chiffres d'affaires",
        "Secrets commerciaux",
      ],
    },
    {
      items: [
        "Données biométriques",
        "Données de santé",
        "Données sensibles RGPD",
      ],
    },
    {
      items: ["Clés API secrètes", "Coordonnées GPS", "Titres de civilité"],
    },
  ];

  if (isProcessing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          <h4 className="text-sm font-semibold text-gray-700">
            Anonymisation en cours...
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Analyse du contenu</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <span className="text-xs text-gray-600">
              Détection des données sensibles
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <span className="text-xs text-gray-600">
              Application de l&apos;anonymisation
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (outputText) {
    const anonymizedTypes = getAnonymizedDataTypes();

    return (
      <div className="space-y-4">
        {/* Instructions Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">
                Instructions d&apos;utilisation :
              </p>
              <ul className="space-y-1 text-blue-700">
                <li>• Survolez les mots pour les mettre en évidence</li>
                <li>
                  • Cliquez pour sélectionner un mot, Ctrl/CMD (ou Shift) +
                  clic.
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

        {/* Bloc vert existant */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="text-sm font-semibold text-green-700">
              Anonymisation terminée avec succès
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {supportedDataStructure.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col space-y-2">
                {column.items.map((item, itemIndex) => {
                  const isAnonymized = anonymizedTypes.has(item);
                  return (
                    <span
                      key={itemIndex}
                      className={
                        isAnonymized
                          ? "text-green-700 font-medium"
                          : "text-gray-400"
                      }
                    >
                      {isAnonymized ? "✓" : "•"} {item}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
