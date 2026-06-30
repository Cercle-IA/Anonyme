import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityMapping } from "../config/entityLabels";

interface EntityMappingTableProps {
  mappings: EntityMapping[];
  selectedCategory?: string;
}

// Fonction pour filtrer les entités selon la catégorie
const filterMappingsByCategory = (
  mappings: EntityMapping[],
  category: string = "pii_business"
): EntityMapping[] => {
  if (category === "pii_business") {
    return mappings; // Tout afficher
  }

  // Définir les entités PII (Données personnelles)
  const piiEntities = new Set([
    // Données personnelles de base
    "PERSONNE",
    "PERSON",
    "DATE",
    "DATE_TIME",
    "EMAIL_ADDRESS",
    "ADRESSE_EMAIL",
    "PHONE_NUMBER",
    "TELEPHONE",
    "CREDIT_CARD",
    "IBAN",
    "ADRESSE_IP",

    // Adresses personnelles
    "ADRESSE",
    "ADRESSE_FRANCAISE",
    "ADRESSE_BELGE",
    "LOCATION",

    // Téléphones personnels
    "TELEPHONE_FRANCAIS",
    "TELEPHONE_BELGE",

    // Documents d'identité personnels
    "NUMERO_SECURITE_SOCIALE_FRANCAIS",
    "REGISTRE_NATIONAL_BELGE",
    "CARTE_IDENTITE_FRANCAISE",
    "CARTE_IDENTITE_BELGE",
    "PASSEPORT_FRANCAIS",
    "PASSEPORT_BELGE",
    "PERMIS_CONDUIRE_FRANCAIS",

    // Données financières personnelles
    "COMPTE_BANCAIRE_FRANCAIS",

    // Données sensibles RGPD
    "HEALTH_DATA",
    "DONNEES_SANTE",
    "SEXUAL_ORIENTATION",
    "ORIENTATION_SEXUELLE",
    "POLITICAL_OPINIONS",
    "OPINIONS_POLITIQUES",
    "BIOMETRIC_DATA",
    "DONNEES_BIOMETRIQUES",
    "RGPD_FINANCIAL_DATA",
    "DONNEES_FINANCIERES_RGPD",

    // Identifiants personnels
    "IDENTIFIANT_PERSONNEL",
  ]);

  // Définir les entités Business (Données d'entreprise)
  const businessEntities = new Set([
    // Organisations et sociétés
    "ORGANISATION",
    "ORGANIZATION",
    "SOCIETE_FRANCAISE",
    "SOCIETE_BELGE",

    // Identifiants fiscaux et d'entreprise
    "TVA_FRANCAISE",
    "TVA_BELGE",
    "NUMERO_FISCAL_FRANCAIS",
    "SIRET_SIREN_FRANCAIS",
    "NUMERO_ENTREPRISE_BELGE",

    // Identifiants professionnels
    "ID_PROFESSIONNEL_BELGE",

    // Données commerciales
    "MARKET_SHARE",
    "SECRET_COMMERCIAL",
    "REFERENCE_CONTRAT",
    "MONTANT_FINANCIER",

    // Données techniques d'entreprise
    "CLE_API_SECRETE",
  ]);

  // Définir les entités mixtes (PII + Business)
  const mixedEntities = new Set([
    // Données pouvant être personnelles ou professionnelles
    "TITRE_CIVILITE",
    "DONNEES_PROFESSIONNELLES",
    "LOCALISATION_GPS",
    "URL_IDENTIFIANT",
  ]);

  if (category === "pii") {
    // Inclure PII + mixtes
    const allowedEntities = new Set([...piiEntities, ...mixedEntities]);
    return mappings.filter((mapping) =>
      allowedEntities.has(mapping.entity_type)
    );
  }

  if (category === "business") {
    // Inclure Business + mixtes
    const allowedEntities = new Set([...businessEntities, ...mixedEntities]);
    return mappings.filter((mapping) =>
      allowedEntities.has(mapping.entity_type)
    );
  }

  // Par défaut, retourner tous les mappings
  return mappings;
};

export const EntityMappingTable = ({
  mappings,
  selectedCategory = "pii_business",
}: EntityMappingTableProps) => {
  // Filtrer les mappings selon la catégorie sélectionnée
  const filteredMappings = filterMappingsByCategory(mappings, selectedCategory);

  if (!mappings || mappings.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-[#092727]">
            Entités détectées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Aucune entité détectée dans le document.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (filteredMappings.length === 0) {
    const categoryNames = {
      pii: "PII (Données Personnelles)",
      business: "Business (Données Métier)",
      pii_business: "PII + Business",
    };

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-[#092727]">
            Entités détectées -{" "}
            {categoryNames[selectedCategory as keyof typeof categoryNames] ||
              "Toutes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Aucune entité de type &quot;
            {categoryNames[selectedCategory as keyof typeof categoryNames] ||
              "sélectionné"}
            &quot; détectée dans le document.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Créer un compteur pour chaque type d'entité (sur les mappings filtrés)
  const entityCounts: { [key: string]: number } = {};
  const mappingsWithNumbers = filteredMappings.map((mapping) => {
    const entityType = mapping.entity_type;
    entityCounts[entityType] = (entityCounts[entityType] || 0) + 1;
    return {
      ...mapping,
      entityNumber: entityCounts[entityType],
      displayName: mapping.entity_type,
    };
  });

  const categoryNames = {
    pii: "PII (Données Personnelles)",
    business: "Business (Données Métier)",
    pii_business: "PII + Business",
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-[#092727]">
          Entités détectées -{" "}
          {categoryNames[selectedCategory as keyof typeof categoryNames] ||
            "Toutes"}{" "}
          ({filteredMappings.length}/{mappings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Version mobile : Cards empilées */}
        <div className="sm:hidden space-y-4">
          {mappingsWithNumbers.map((mapping, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="space-y-3">
                <div>
                  <Badge
                    variant="outline"
                    className="bg-[#f7ab6e] bg-opacity-20 text-[#092727] border-[#f7ab6e]"
                  >
                    {mapping.displayName}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-600 block mb-1">
                      Texte détecté
                    </span>
                    <div className="font-mono text-xs bg-red-50 text-red-700 p-2 rounded border break-all">
                      {mapping.text}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 block mb-1">
                      Identifiant
                    </span>
                    <div className="font-mono text-xs bg-green-50 text-green-700 p-2 rounded border break-all">
                      {mapping.displayName} #{mapping.entityNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Version desktop : Table classique */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-[#092727] min-w-[120px]">
                  Type d&apos;entité
                </TableHead>
                <TableHead className="font-semibold text-[#092727] min-w-[150px]">
                  Texte détecté
                </TableHead>
                <TableHead className="font-semibold text-[#092727] min-w-[100px]">
                  Identifiant
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappingsWithNumbers.map((mapping, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className="bg-[#f7ab6e] bg-opacity-20 text-[#092727] border-[#f7ab6e]"
                    >
                      {mapping.displayName}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm bg-red-50 text-red-700 py-4 max-w-[200px] break-all">
                    {mapping.text}
                  </TableCell>
                  <TableCell className="font-mono text-sm bg-green-50 text-green-700 py-4">
                    {mapping.displayName} #{mapping.entityNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
