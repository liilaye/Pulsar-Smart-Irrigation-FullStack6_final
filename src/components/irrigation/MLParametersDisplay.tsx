import React from 'react';
import { ArrowDown, ArrowUp } from "lucide-react";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

interface MLParametersDisplayProps {
  recommendation: MLRecommendation;
  inputFeatures: number[];
}

export const MLParametersDisplay = ({ recommendation, inputFeatures }: MLParametersDisplayProps) => {
  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-900 flex items-center gap-2">
        🚿 Irrigation ML en Cours d'Exécution
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INPUTS - Paramètres Agro-climatiques */}
        <div className="bg-white p-3 rounded-lg border border-blue-100">
          <h5 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
            <ArrowDown className="w-4 h-4" />
            Paramètres Agro-climatiques (Inputs)
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Temp. Air: <span className="font-medium">{inputFeatures[0]}°C</span></div>
            <div>Précipitation: <span className="font-medium">{inputFeatures[1]}mm</span></div>
            <div>Humidité Air: <span className="font-medium">{inputFeatures[2]}%</span></div>
            <div>Vent: <span className="font-medium">{inputFeatures[3]}km/h</span></div>
            <div>Type Culture: <span className="font-medium">{inputFeatures[4]}</span></div>
            <div>Superficie: <span className="font-medium">{inputFeatures[5]}m²</span></div>
            <div>Temp. Sol: <span className="font-medium">{inputFeatures[6]}°C</span></div>
            <div>Humidité Sol: <span className="font-medium">{inputFeatures[7]}%</span></div>
            <div>EC: <span className="font-medium">{inputFeatures[8]}dS/m</span></div>
            <div>pH Sol: <span className="font-medium">{inputFeatures[9]}</span></div>
            <div>Azote: <span className="font-medium">{inputFeatures[10]}mg/kg</span></div>
            <div>Phosphore: <span className="font-medium">{inputFeatures[11]}mg/kg</span></div>
            <div>Potassium: <span className="font-medium">{inputFeatures[12]}mg/kg</span></div>
            <div>Fertilité: <span className="font-medium">{inputFeatures[13]}/5</span></div>
            <div>Type Sol: <span className="font-medium">{inputFeatures[14]}</span></div>
          </div>
        </div>

        {/* OUTPUTS - Résultats ML */}
        <div className="bg-white p-3 rounded-lg border border-green-100">
          <h5 className="font-medium text-green-800 flex items-center gap-2 mb-3">
            <ArrowUp className="w-4 h-4" />
            Prédiction ML Appliquée (Outputs)
          </h5>
          <div className="space-y-3">
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <div className="text-sm font-medium text-green-900">Durée d'irrigation</div>
              <div className="text-lg font-bold text-green-700">
                {Math.floor(recommendation.duree_minutes)} minutes
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-900">Volume d'eau</div>
              <div className="text-lg font-bold text-blue-700">
                {recommendation.volume_eau_m3?.toFixed(3)} m³
              </div>
              <div className="text-xs text-blue-600">
                ({(recommendation.volume_eau_m3 * 1000)?.toFixed(0)} litres)
              </div>
            </div>
            <div className="p-2 bg-amber-50 rounded border border-amber-200">
              <div className="text-xs text-amber-700">
                <strong>IA Active:</strong> Système applique automatiquement les paramètres optimaux calculés
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center p-2 bg-gradient-to-r from-blue-100 to-green-100 rounded border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>🤖 Intelligence Artificielle en Action</strong> - Système d'irrigation optimisé basé sur l'analyse des 15 paramètres agro-climatiques
        </div>
      </div>
    </div>
  );
};