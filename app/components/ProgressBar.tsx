import { Check, Upload, Eye, Shield } from "lucide-react";
import React from "react";

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

export const ProgressBar = ({ currentStep, steps }: ProgressBarProps) => {
  // Icônes pour chaque étape
  const getStepIcon = (stepNumber: number, isCompleted: boolean) => {
    if (isCompleted) {
      return <Check className="h-3 w-3" />;
    }

    switch (stepNumber) {
      case 1:
        return <Upload className="h-3 w-3" />;
      case 2:
        return <Eye className="h-3 w-3" />;
      case 3:
        return <Shield className="h-3 w-3" />;
      default:
        return stepNumber;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 px-2">
      <div className="flex items-start justify-center">
        <div className="flex items-start w-full max-w-md">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <React.Fragment key={index}>
                {/* Step Circle and Label */}
                <div
                  className="flex flex-col items-center text-center"
                  style={{ flex: "0 0 auto" }}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#f7ab6e] text-white"
                        : isCurrent
                        ? "bg-[#f7ab6e] text-white ring-2 ring-[#f7ab6e] ring-opacity-20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {getStepIcon(stepNumber, isCompleted)}
                  </div>
                  <span
                    className={`mt-1 text-sm font-medium leading-tight ${
                      isCompleted || isCurrent
                        ? "text-[#092727]"
                        : "text-gray-500"
                    }`}
                    style={{
                      wordBreak: "break-word",
                      hyphens: "auto",
                      minWidth: "60px", // Assure un espace minimum
                      maxWidth: "120px", // Empêche de devenir trop large
                    }}
                  >
                    {step}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-1 sm:px-2 mt-2.5 sm:mt-3">
                    <div
                      className={`h-0.5 w-full transition-all duration-300 ${
                        stepNumber < currentStep
                          ? "bg-[#f7ab6e]"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
