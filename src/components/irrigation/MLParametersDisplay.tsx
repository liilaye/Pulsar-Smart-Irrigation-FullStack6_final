
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MLParametersDisplayProps {
  isVisible: boolean;
}

export const MLParametersDisplay: React.FC<MLParametersDisplayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  const parameters = [
    { label: "Température air", value: "25.0°C", category: "Météo" },
    { label: "Précipitation", value: "0 mm", category: "Météo" },
    { label: "Humidité air", value: "65%", category: "Météo" },
    { label: "Vent moyen", value: "12.0 km/h", category: "Météo" },
    { label: "Type culture", value: "1", category: "Agriculture" },
    { label: "Périmètre agricole", value: "10000 m²", category: "Agriculture" },
    { label: "Température sol", value: "26.0°C", category: "Sol" },
    { label: "Humidité sol", value: "42%", category: "Sol" },
    { label: "EC (conductivité)", value: "1.2 dS/m", category: "Sol" },
    { label: "pH sol", value: "6.8", category: "Sol" },
    { label: "Azote", value: "45 mg/kg", category: "Nutriments" },
    { label: "Phosphore", value: "38 mg/kg", category: "Nutriments" },
    { label: "Potassium", value: "152 mg/kg", category: "Nutriments" },
    { label: "Fertilité", value: "3/5", category: "Sol" },
    { label: "Type sol", value: "2", category: "Sol" }
  ];

  const groupedParams = parameters.reduce((acc, param) => {
    if (!acc[param.category]) acc[param.category] = [];
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, typeof parameters>);

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800 flex items-center">
          📊 Paramètres agro-climatiques utilisés pour cette prédiction ML
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(groupedParams).map(([category, params]) => (
            <div key={category} className="space-y-1">
              <h6 className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                {category}
              </h6>
              {params.map((param, index) => (
                <div key={index} className="text-xs">
                  <span className="text-gray-600">{param.label}:</span>
                  <span className="ml-1 font-medium text-blue-800">{param.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
