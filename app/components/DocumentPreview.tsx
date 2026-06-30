import React from "react";
import { FileText } from "lucide-react";

interface DocumentPreviewProps {
  uploadedFile: File | null;
  fileContent: string;
  sourceText: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  uploadedFile,
  fileContent,
  sourceText,
}) => {
  if (!uploadedFile && (!sourceText || !sourceText.trim())) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              {uploadedFile && (
                <p className="text-sm text-orange-600">
                  {uploadedFile.name} • {(uploadedFile.size / 1024).toFixed(1)}{" "}
                  KB
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {sourceText || fileContent || "Aucun contenu à afficher"}
          </pre>
        </div>
      </div>
    </div>
  );
};
