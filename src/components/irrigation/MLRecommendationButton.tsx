
import React from 'react';
import { Button } from "@/components/ui/button";

interface MLRecommendationButtonProps {
  isBackendConnected: boolean;
  onGetRecommendation: () => void;
}

export const MLRecommendationButton = ({ isBackendConnected, onGetRecommendation }: MLRecommendationButtonProps) => {
  return (
    <Button 
      onClick={onGetRecommendation}
      className="w-full"
      variant="outline"
      disabled={!isBackendConnected}
    >
      🤖 Obtenir Recommandation IA
    </Button>
  );
};
