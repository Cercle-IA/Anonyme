import { X, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";

interface PresidioModalProps {
  anonymizedText: string | null;
  piiCount: number;
  onClose: () => void;
}

const renderAnonymizedTextOnPdf = (pdf: jsPDF, anonymizedText: string) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let cursorY = margin;

  const paragraphs = anonymizedText.split("\n\n").filter((p) => p.trim());

  paragraphs.forEach((paragraph) => {
    if (cursorY > pageHeight - margin - 20) {
      pdf.addPage();
      cursorY = margin;
    }

    const parts = paragraph.split(/(<[A-Z_]+>)/g);

    parts.forEach((part) => {
      if (part.match(/<[A-Z_]+>/)) {
        pdf.setFontSize(10);
        pdf.setFont("Helvetica", "bold");
        pdf.setTextColor(255, 0, 0);
        const lines = pdf.splitTextToSize(part, pageWidth - margin * 2);
        pdf.text(lines, margin, cursorY);
        cursorY += lines.length * 10 * 0.5;
      } else if (part.trim()) {
        pdf.setFontSize(10);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(part, pageWidth - margin * 2);
        pdf.text(lines, margin, cursorY);
        cursorY += lines.length * 10 * 0.5;
      }
    });

    cursorY += 8;
  });
};

const formatAnonymizedTextForPreview = (text: string): string => {
  return text
    .split("\n\n")
    .map((paragraph) => {
      const formattedParagraph = paragraph.replace(
        /<([A-Z_]+)>/g,
        '<span style="background-color: #ff4444; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.9em;">&lt;$1&gt;</span>'
      );
      return `<p style="margin-bottom: 1rem; line-height: 1.6;">${formattedParagraph}</p>`;
    })
    .join("");
};

export default function PresidioModal({
  anonymizedText,
  piiCount,
  onClose,
}: PresidioModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!anonymizedText) return null;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      pdf.setFontSize(16);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Document Anonymisé par Presidio", 15, 20);

      pdf.setFontSize(10);
      pdf.setFont("Helvetica", "normal");
      pdf.text(
        `Données personnelles détectées et anonymisées : ${piiCount}`,
        15,
        30
      );

      pdf.setDrawColor(0, 0, 0);
      pdf.line(15, 35, pdf.internal.pageSize.getWidth() - 15, 35);

      pdf.setFontSize(10);
      renderAnonymizedTextOnPdf(pdf, anonymizedText);

      pdf.save("document_anonymise_presidio.pdf");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const previewHtml = `
    <div style="font-family: Arial, sans-serif; color: white;">
      <h2 style="color: #F7AB6E; margin-bottom: 1rem;">Document Anonymisé par Presidio</h2>
      <p style="color: #ccc; margin-bottom: 2rem; font-size: 0.9em;">
        <strong>${piiCount}</strong> données personnelles détectées et anonymisées
      </p>
      <div style="border-top: 2px dashed rgba(255,255,255,0.3); padding-top: 1.5rem;">
        ${formatAnonymizedTextForPreview(anonymizedText)}
      </div>
    </div>
  `;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#061717] border-4 border-white shadow-[10px_10px_0_0_black] w-full max-w-4xl h-[80vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b-4 border-white">
          <h3 className="text-lg font-black text-white uppercase">
            Document Anonymisé - {piiCount} données masquées
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="p-2 bg-[#F7AB6E] text-white border-2 border-white shadow-[3px_3px_0_0_black] hover:shadow-[1px_1px_0_0_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#F7AB6E] text-white border-2 border-white shadow-[3px_3px_0_0_black] hover:shadow-[1px_1px_0_0_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div
          className="preview-content p-6 overflow-y-auto w-full h-full"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}
