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
    maxRetries,
    topics
  } = useMQTT();
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();

  const toggleManualIrrigation = async (enabled: boolean) => {
    console.log('🔄 [CONTROL] Toggle irrigation demandé:', enabled);
    console.log('🌐 [CONTROL] État connexion MQTT:', isConnected);
    
    // Message pour le broker JHipster Infinite
    const relayCommand = {
      deviceId: "PulsarInfinite",
      command: "SET_RELAY",
      value: enabled ? 1 : 0,
      timestamp: new Date().toISOString(),
      source: "web_interface"
    };

    // Commande simple pour compatibilité
    const simpleCommand = enabled ? "ON" : "OFF";
    
    console.log('📤 [CONTROL] Commande relay:', relayCommand);
    console.log('📤 [CONTROL] Topic:', topics.control);

    // Essayer d'abord avec la commande JSON structurée
    let success = publishMessage(topics.control, JSON.stringify(relayCommand), { 
      qos: 1, 
      retain: true 
    });

    // Si échec, essayer avec commande simple
    if (!success) {
      console.log('📤 [CONTROL] Retry avec commande simple');
      success = publishMessage(topics.commands, simpleCommand, { 
        qos: 1, 
        retain: false 
      });
    }

    // Publier aussi sur le topic de données pour compatibilité
    if (success) {
      const dataMessage = {
        relay_state: enabled ? 1 : 0,
        manual_mode: true,
        timestamp: Date.now()
      };
      
      publishMessage(topics.data, JSON.stringify(dataMessage), { 
        qos: 0, 
        retain: false 
      });
    }

    console.log('📤 [CONTROL] Résultat publication:', success);

    if (success) {
      setIsManualActive(enabled);
      setManualMode(enabled);
      
      toast({
        title: enabled ? "🚿 Arrosage déclenché" : "⏹️ Arrosage arrêté",
        description: enabled ? 
          `Commande envoyée sur ${topics.control}` : 
          `Arrêt envoyé sur ${topics.control}`,
      });
      
      console.log('✅ [CONTROL] État local mis à jour - isManualActive:', enabled);
    } else {
      console.error('❌ [CONTROL] Échec de l\'envoi de la commande');
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer la commande. Vérifiez la connexion MQTT JHipster.",
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
