import React from 'react';

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

interface MLRecommendationDisplayProps {
  recommendation: MLRecommendation;
}

export const MLRecommendationDisplay = ({ recommendation }: MLRecommendationDisplayProps) => {
  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-blue-800">Recommandation ML Active (Backend Flask)</h4>
      <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 mt-2">
        <div>Durée: {Math.floor(recommendation.duree_minutes)} min</div>
        <div>Volume: {recommendation.volume_eau_m3?.toFixed(2)} m³</div>
      </div>
      <p className="text-xs text-blue-600 mt-1">
        {recommendation.matt}
      </p>
    </div>
  );
};