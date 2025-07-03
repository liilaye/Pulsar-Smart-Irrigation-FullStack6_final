import React from 'react';
import { Button } from "@/components/ui/button";

interface MLControlButtonsProps {
  isConnected: boolean;
  isLoading: boolean;
  isMLActive: boolean;
  hasRecommendation: boolean;
  onGenerateRecommendation: () => void;
  onToggleML: () => void;
}

export const MLControlButtons = ({
  isConnected,
  isLoading,
  isMLActive,
  hasRecommendation,
  onGenerateRecommendation,
  onToggleML
}: MLControlButtonsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onGenerateRecommendation}
          disabled={!isConnected || isLoading}
          variant="outline"
          className="h-12 flex items-center justify-center"
        >
          {isLoading && !isMLActive ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>🤖 Générer Recommandation ML</span>
          )}
        </Button>

        <Button
          onClick={onToggleML}
          disabled={!isConnected || isLoading}
          className={`h-12 flex items-center justify-center space-x-2 ${
            isMLActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading && isMLActive !== undefined ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{isMLActive ? '🛑 Arrêter ML' : '✅ DÉMARRER ML (Validation Admin)'}</span>
          )}
        </Button>
      </div>

      {/* Avertissement validation admin */}
      {hasRecommendation && !isMLActive && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Validation Admin Requise:</strong> La prédiction ML est prête. 
            Cliquez sur "DÉMARRER ML" pour lancer l'irrigation avec validation admin.
          </p>
        </div>
      )}
    </div>
  );
};