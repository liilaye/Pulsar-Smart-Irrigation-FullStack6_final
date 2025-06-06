
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backendService';
import { ConnectionStatus } from './irrigation/ConnectionStatus';
import { IrrigationToggle } from './irrigation/IrrigationToggle';
import { DurationInputs } from './irrigation/DurationInputs';
import { MLRecommendationButton } from './irrigation/MLRecommendationButton';
import { MLRecommendationDisplay } from './irrigation/MLRecommendationDisplay';

export const ManualControl = () => {
  const [manualDuration, setManualDuration] = useState({ hours: '1', minutes: '30' });
  const [isManualActive, setIsManualActive] = useState(false);
  const [lastMLRecommendation, setLastMLRecommendation] = useState<any>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  
  const { toast } = useToast();

  const toggleManualIrrigation = async (enabled: boolean) => {
    console.log('🔄 Toggle irrigation Flask demandé:', enabled);
    
    try {
      if (enabled) {
        // Démarrer l'irrigation
        const hours = parseInt(manualDuration.hours) || 0;
        const minutes = parseInt(manualDuration.minutes) || 30;
        
        const response = await backendService.startManualIrrigation(hours, minutes);
        
        if (response.success) {
          setIsManualActive(true);
          toast({
            title: "🚿 Irrigation démarrée",
            description: `Durée: ${hours}h ${minutes}min via Flask backend`,
          });
        } else {
          throw new Error(response.message);
        }
      } else {
        // Arrêter l'irrigation
        const response = await backendService.stopIrrigation();
        
        if (response.success) {
          setIsManualActive(false);
          toast({
            title: "⏹️ Irrigation arrêtée",
            description: "Commande d'arrêt envoyée via Flask backend",
          });
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error('❌ Erreur irrigation Flask:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible de ${enabled ? 'démarrer' : 'arrêter'} l'irrigation: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getMLRecommendation = async () => {
    try {
      console.log('🤖 Demande recommandation ML Flask...');
      const features = backendService.getDefaultSoilClimateFeatures();
      
      const recommendation = await backendService.getMLRecommendation(features);
      
      if (recommendation && recommendation.status === "ok") {
        setLastMLRecommendation(recommendation);
        setManualDuration({
          hours: Math.floor(recommendation.duree_minutes / 60).toString(),
          minutes: Math.floor(recommendation.duree_minutes % 60).toString()
        });
        
        toast({
          title: "🤖 Recommandation ML Flask reçue",
          description: `Durée suggérée: ${Math.floor(recommendation.duree_minutes)} minutes`,
        });
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur ML Flask:', error);
      toast({
        title: "❌ Erreur ML Flask",
        description: "Impossible d'obtenir une recommandation du backend Flask",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrosage Manuel - Backend Flask</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus
          isConnected={isBackendConnected}
          connectionAttempts={0}
          maxRetries={3}
          onRetry={() => setIsBackendConnected(true)}
        />

        <IrrigationToggle
          isManualActive={isManualActive}
          irrigationStatus={isManualActive}
          isConnected={isBackendConnected}
          onToggle={toggleManualIrrigation}
        />
        
        <DurationInputs
          manualDuration={manualDuration}
          isManualActive={isManualActive}
          onDurationChange={setManualDuration}
        />

        <MLRecommendationButton
          isBackendConnected={isBackendConnected}
          onGetRecommendation={getMLRecommendation}
        />

        <MLRecommendationDisplay lastMLRecommendation={lastMLRecommendation} />

        {!isBackendConnected && (
          <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Backend Flask déconnecté. Vérifiez que le serveur Flask fonctionne sur http://localhost:5002
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
