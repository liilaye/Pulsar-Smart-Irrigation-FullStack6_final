
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Droplets, BarChart3 } from 'lucide-react';

interface IrrigationAnalysisData {
  manual: {
    max: number;
    min: number;
    current: number;
  };
  ml: {
    max: number;
    min: number;
    current: number;
  };
}

interface IrrigationAnalysisProps {
  irrigationAnalysis: IrrigationAnalysisData | null;
}

export const IrrigationAnalysis = ({ irrigationAnalysis }: IrrigationAnalysisProps) => {
  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Analyse Min/Max des Tendances d'Irrigation</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Analyse dynamique des valeurs maximales et minimales pour chaque type d'irrigation
          </p>
        </CardHeader>
        <CardContent>
          {irrigationAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Irrigation Manuelle */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Droplets className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Irrigation Manuelle</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-700">Maximum:</span>
                    <span className="font-bold text-red-600">{irrigationAnalysis.manual.max} m³</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-700">Minimum:</span>
                    <span className="font-bold text-red-600">{irrigationAnalysis.manual.min} m³</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-700">Actuel:</span>
                    <span className="font-bold text-red-600">{irrigationAnalysis.manual.current} m³</span>
                  </div>
                  
                  <div className="pt-2 border-t border-red-200">
                    <span className="text-xs text-red-600">
                      Écart: {((irrigationAnalysis.manual.max - irrigationAnalysis.manual.min) * 1000).toFixed(0)} L
                    </span>
                  </div>
                </div>
              </div>

              {/* Irrigation ML */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Irrigation ML</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Maximum:</span>
                    <span className="font-bold text-blue-600">{irrigationAnalysis.ml.max} m³</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Minimum:</span>
                    <span className="font-bold text-blue-600">{irrigationAnalysis.ml.min} m³</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Actuel:</span>
                    <span className="font-bold text-blue-600">{irrigationAnalysis.ml.current} m³</span>
                  </div>
                  
                  <div className="pt-2 border-t border-blue-200">
                    <span className="text-xs text-blue-600">
                      Écart: {((irrigationAnalysis.ml.max - irrigationAnalysis.ml.min) * 1000).toFixed(0)} L
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Analyse des données min/max en cours...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
