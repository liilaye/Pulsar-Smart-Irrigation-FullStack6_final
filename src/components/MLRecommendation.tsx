
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Wifi, WifiOff } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';

export const MLRecommendation = () => {
  const { lastMLRecommendation, isBackendConnected } = useBackendSync();

  if (!lastMLRecommendation) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Brain className="h-5 w-5" />
          <span>Dernière Recommandation ML</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">
              Durée recommandée: {lastMLRecommendation.durationHours}h {lastMLRecommendation.durationMinutes}min
            </p>
            <p className="text-xs text-blue-600">
              Basé sur l'analyse de 15 paramètres agro-environnementaux
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isBackendConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs">
              {isBackendConnected ? 'Flask API connecté' : 'Flask API déconnecté'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
