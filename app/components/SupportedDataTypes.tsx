export const SupportedDataTypes = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h4 className="text-sm font-semibold text-[#092727] mb-4">
        Types de données supportées :
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#092727] opacity-80">
        <div className="flex flex-col space-y-2">
          <span>• Prénoms</span>
          <span>• Numéros de téléphone</span>
          <span>• Noms de domaine</span>
        </div>
        <div className="flex flex-col space-y-2">
          <span>• Noms de famille</span>
          <span>• Adresses</span>
          <span>• Dates</span>
        </div>
        <div className="flex flex-col space-y-2">
          <span>• Noms complets</span>
          <span>• Numéros d&apos;ID</span>
          <span>• Coordonnées bancaires</span>
        </div>
        <div className="flex flex-col space-y-2">
          <span>• Adresses e-mail</span>
          <span>• Valeurs monétaires</span>
          <span>• Texte personnalisé</span>
        </div>
      </div>
    </div>
  );
};
