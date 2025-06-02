import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMQTT } from '@/hooks/useMQTT';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backendService';
import { ConnectionStatus } from './irrigation/ConnectionStatus';
import { IrrigationToggle } from './irrigation/IrrigationToggle';
import { DurationInputs } from './irrigation/DurationInputs';
import { MLRecommendationButton } from './irrigation/MLRecommendationButton';
import { MLRecommendationDisplay } from './irrigation/MLRecommendationDisplay';
import { ConnectionErrorAlert } from './irrigation/ConnectionErrorAlert';

export const ManualControl = () => {
  const [manualDuration, setManualDuration] = useState({ hours: '1', minutes: '30' });
  const [isManualActive, setIsManualActive] = useState(false);
  const [lastMLRecommendation, setLastMLRecommendation] = useState<any>(null);
  const [irrigationTimer, setIrrigationTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { 
    publishMessage, 
    isConnected, 
    setManualMode, 
    irrigationStatus, 
    connectionAttempts,
    retryConnection,
    maxRetries
  } = useMQTT();
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();

  const toggleManualIrrigation = async (enabled: boolean) => {
    console.log('🔄 Démarrage irrigation:', enabled);
    
    if (enabled) {
      // Démarrer l'irrigation
      const command = {
        irrigation: true,
        duration_minutes: parseInt(manualDuration.hours) * 60 + parseInt(manualDuration.minutes),
        timestamp: new Date().toISOString()
      };

      const success = publishMessage("irrigation/PulsarInfinite/control", JSON.stringify(command), { 
        qos: 1, 
        retain: false 
      });

      if (success) {
        setIsManualActive(true);
        setManualMode(true);
        
        toast({
          title: "🚿 Irrigation démarrée",
          description: `Arrosage programmé pour ${manualDuration.hours}h${manualDuration.minutes}min`,
        });

        // Programmer l'arrêt automatique
        const totalMinutes = parseInt(manualDuration.hours) * 60 + parseInt(manualDuration.minutes);
        const timer = setTimeout(() => {
          toggleManualIrrigation(false);
        }, totalMinutes * 60000);
        
        setIrrigationTimer(timer);

      } else {
        toast({
          title: "❌ Erreur",
          description: "Impossible d'envoyer la commande. Vérifiez la connexion MQTT.",
          variant: "destructive"
        });
      }
    } else {
      // Arrêter l'irrigation
      const command = {
        irrigation: false,
        timestamp: new Date().toISOString()
      };

      // Annuler le timer si actif
      if (irrigationTimer) {
        clearTimeout(irrigationTimer);
        setIrrigationTimer(null);
      }

      const success = publishMessage("irrigation/PulsarInfinite/control", JSON.stringify(command), { 
        qos: 1, 
        retain: false 
      });

      if (success) {
        setIsManualActive(false);
        setManualMode(false);
        
        toast({
          title: "⏹️ Irrigation arrêtée",
          description: "L'arrosage a été interrompu",
        });
      }
    }
  };

  const getMLRecommendation = async () => {
    const features = backendService.getDefaultSoilClimateFeatures();
    
    const recommendation = await backendService.getMLRecommendation(features);
    
    if (recommendation && recommendation.status === "ok") {
      setLastMLRecommendation(recommendation);
      setManualDuration({
        hours: Math.floor(recommendation.duree_minutes / 60).toString(),
        minutes: Math.floor(recommendation.duree_minutes % 60).toString()
      });
      
      toast({
        title: "🤖 Recommandation ML reçue",
        description: `Durée suggérée: ${Math.floor(recommendation.duree_minutes)} minutes`,
      });
    } else {
      toast({
        title: "❌ Erreur ML",
        description: "Impossible d'obtenir une recommandation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrosage Manuel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus
          isConnected={isConnected}
          connectionAttempts={connectionAttempts}
          maxRetries={maxRetries}
          onRetry={retryConnection}
        />

        <IrrigationToggle
          isManualActive={isManualActive}
          irrigationStatus={irrigationStatus}
          isConnected={isConnected}
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

        <ConnectionErrorAlert
          isConnected={isConnected}
          connectionAttempts={connectionAttempts}
          maxRetries={maxRetries}
        />
      </CardContent>
    </Card>
  );
};
