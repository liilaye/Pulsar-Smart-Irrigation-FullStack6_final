
import React from 'react';

interface MLRecommendationDisplayProps {
  lastMLRecommendation: any;
}

export const MLRecommendationDisplay = ({ lastMLRecommendation }: MLRecommendationDisplayProps) => {
  if (!lastMLRecommendation) return null;

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-blue-800">🎯 Dernière Recommandation ML</h4>
      <p className="text-sm text-blue-700">
        ⏱️ Durée: {Math.floor(lastMLRecommendation.duree_minutes)} minutes
      </p>
      <p className="text-sm text-blue-700">
        💧 Volume: {lastMLRecommendation.volume_eau_m3?.toFixed(2)} m³
      </p>
      <p className="text-xs text-blue-600">
        📝 {lastMLRecommendation.matt}
      </p>
    </div>
  );
};
