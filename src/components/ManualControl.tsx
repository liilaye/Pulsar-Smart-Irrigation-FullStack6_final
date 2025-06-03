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
    console.log('🔄 Toggle irrigation:', enabled);
    
    // Créer le message JSON selon le format spécifié
    const command = {
      type: "JOIN",
      fcnt: 0,
      json: {
        switch_relay: {
          device: enabled ? 1 : 0
        }
      },
      mqttHeaders: {
        mqtt_receivedRetained: "false",
        mqtt_id: "0",
        mqtt_duplicate: "false",
        id: crypto.randomUUID(),
        mqtt_receivedTopic: "data/PulsarInfinite/swr",
        mqtt_receivedQos: "0",
        timestamp: Date.now().toString()
      }
    };

    console.log('📤 Envoi commande:', JSON.stringify(command, null, 2));

    const success = publishMessage("data/PulsarInfinite/swr", JSON.stringify(command), { 
      qos: 1, 
      retain: true 
    });

    if (success) {
      setIsManualActive(enabled);
      setManualMode(enabled);
      
      toast({
        title: enabled ? "🚿 Irrigation démarrée" : "⏹️ Irrigation arrêtée",
        description: enabled ? 
          `Device activé (device: 1)` : 
          `Device désactivé (device: 0)`,
      });
    } else {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer la commande. Vérifiez la connexion MQTT.",
        variant: "destructive"
      });
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
