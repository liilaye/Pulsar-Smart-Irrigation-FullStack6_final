
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMQTT } from '@/hooks/useMQTT';
import { useMLIrrigation } from '@/hooks/useMLIrrigation';
import { MLRecommendationDisplay } from './MLRecommendationDisplay';
import { MLControlButtons } from './MLControlButtons';
import { MLParametersDisplay } from './MLParametersDisplay';
import { MLTimerDisplay } from './MLTimerDisplay';
import { MLConnectionStatus } from './MLConnectionStatus';

export const MLIrrigationControl = () => {
  const { isConnected } = useMQTT();
  const {
    lastMLRecommendation,
    isMLActive,
    isLoading,
    lastMLCommand,
    mlInputFeatures,
    startTime,
    generateMLRecommendation,
    toggleMLIrrigation
  } = useMLIrrigation();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Irrigation Intelligente ML</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Backend Flask ML' : 'Backend Flask ML Indisponible'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dernière recommandation ML */}
        {lastMLRecommendation && (
          <MLRecommendationDisplay recommendation={lastMLRecommendation} />
        )}

        {/* Timer temps restant si ML actif */}
        {isMLActive && lastMLRecommendation && (
          <MLTimerDisplay 
            isMLActive={isMLActive}
            startTime={startTime}
            durationMinutes={lastMLRecommendation.duree_minutes}
          />
        )}

        {/* Statut de la dernière commande */}
        {lastMLCommand && (
          <div className="p-2 bg-gray-50 rounded border text-sm text-gray-700">
            <strong>Dernière action:</strong> {lastMLCommand}
          </div>
        )}

        {/* Affichage en temps réel pendant l'irrigation ML active */}
        {isMLActive && lastMLRecommendation && mlInputFeatures && (
          <MLParametersDisplay 
            recommendation={lastMLRecommendation} 
            inputFeatures={mlInputFeatures} 
          />
        )}

        <Separator />

        {/* Contrôles ML */}
        <MLControlButtons
          isConnected={isConnected}
          isLoading={isLoading}
          isMLActive={isMLActive}
          hasRecommendation={!!lastMLRecommendation}
          onGenerateRecommendation={generateMLRecommendation}
          onToggleML={toggleMLIrrigation}
        />

        {/* Statut détaillé du système */}
        <MLConnectionStatus isConnected={isConnected} isMLActive={isMLActive} />
      </CardContent>
    </Card>
  );
};
