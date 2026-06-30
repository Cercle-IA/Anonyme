interface SampleTextComponentProps {
  setSourceText: (text: string) => void;
  setUploadedFile: (file: File | null) => void;
  setIsExampleLoaded?: (loaded: boolean) => void;
  variant?: "button" | "link";
}

export const SampleTextComponent = ({
  setSourceText,
  setUploadedFile,
  setIsExampleLoaded,
  variant = "button",
}: SampleTextComponentProps) => {
  const loadSampleText = () => {
    const sampleText = `Date : 15 mars 2025
Dans le cadre du litige opposant Madame Els Vandermeulen (née le 12/08/1978, demeurant 45 Avenue Louise, 1050 Ixelles, Tel: 02/456.78.90) à Monsieur Karel Derycke, gérant de la SPRL DigitalConsult (BCE: 0123.456.789), nous analysons les éléments suivants :

**Contexte financier :**
Le contrat de prestation signé le 3 janvier 2024 prévoyait un montant de 75 000 € HTVA. Les virements effectués depuis le compte IBAN BE68 5390 0754 7034 (BNP Paribas Fortis) vers le compte bénéficiaire BE71 0961 2345 6789 montrent des irrégularités.

**Témoins clés :**

- Dr. Marie  (expert-comptable, n° IEC: 567890)
- M. Pieter Van Der Berg (consultant IT, email: p.vanderberg@itconsult.be)

**Données sensibles :**
Le serveur compromis contenait 12 000 dossiers clients avec numéros de registre national. L'incident du 28 février 2024 a exposé les données personnelles stockées sur l'adresse IP 10.0.0.45 dans les bureaux situés Rue de la Loi 200, 1040 Etterbeek.


Coordonnées bancaires : BE43 0017 5555 5557 (CBC Banque)
TVA intracommunautaire : BE0987.654.321`;
    setSourceText(sampleText);
    setUploadedFile(null);
    if (setIsExampleLoaded) {
      setIsExampleLoaded(true);
    }
  };

  if (variant === "link") {
    return (
      <span
        onClick={loadSampleText}
        className="text-[#f7ab6e] hover:text-[#f7ab6e]/80 underline pointer-events-auto transition-colors duration-200 cursor-pointer"
        title="Cliquez pour charger un exemple de texte"
      >
        générez un texte d&apos;exemple
      </span>
    );
  }
};
