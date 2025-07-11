// Hook ML Irrigation simulé pour la démo - remplace useMLIrrigation.ts
import { useState, useEffect, useCallback } from 'react';
import { mockBackendService } from '@/services/mockBackendService';
import { activeUserService } from '@/services/activeUserService';
import { useMockMQTT } from '@/hooks/useMockMQTT';
import { toast } from "sonner";

interface MockMLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
  mqtt_started?: boolean;
  auto_irrigation?: boolean;
}

export const useMockMLIrrigation = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MockMLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMLCommand, setLastMLCommand] = useState<string | null>(null);
  const [mlInputFeatures, setMLInputFeatures] = useState<number[] | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [autoStopTimer, setAutoStopTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Hook MQTT simulé pour communication broker
  const { publishIrrigationCommand, isConnected } = useMockMQTT();

  // Reset complet de l'état ML lors du changement d'acteur
  useEffect(() => {
    const resetMLState = () => {
      console.log('🟢 [DEMO] Reset état ML irrigation');
      setLastMLRecommendation(null);
      setIsMLActive(false);
      setIsLoading(false);
      setLastMLCommand(null);
      setMLInputFeatures(null);
      setStartTime(null);
      
      // NETTOYER le timer auto-stop si actif
      if (autoStopTimer) {
        clearTimeout(autoStopTimer);
        setAutoStopTimer(null);
      }
    };

    const unsubscribe = activeUserService.subscribe((user) => {
      if (user) {
        resetMLState();
      }
    });

    resetMLState();
    return unsubscribe;
  }, [autoStopTimer]);

  // FONCTION D'ARRÊT CRITIQUE (manuelle OU automatique)
  const stopMLIrrigation = useCallback(async (isAutoStop = false) => {
    const reason = isAutoStop ? 'Timer ML écoulé' : 'Arrêt manuel d\'urgence';
    console.log(`🟢 [DEMO] ${reason} - Arrêt irrigation simulée`);
    setLastMLCommand(`${reason} - Arrêt via MQTT simulé + Backend simulé...`);
    
    // 1. PRIORITÉ : Commande MQTT OFF au broker simulé
    const mqttSuccess = await publishIrrigationCommand(0);
    
    // 2. CONFIRMER avec Backend simulé
    const response = await mockBackendService.stopIrrigation();
    
    // 3. NETTOYER l'état
    setIsMLActive(false);
    setMLInputFeatures(null);
    setStartTime(null);
    
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
    
    setLastMLCommand(`${reason} terminé - MQTT: ${mqttSuccess ? '✅' : '❌'} Backend: ${response.success ? '✅' : '❌'}`);
    
    toast.success(`Irrigation ML arrêtée (${isAutoStop ? 'Timer' : 'Manuel'}) [DEMO]`, {
      description: `Broker: ${mqttSuccess ? 'OFF envoyé' : 'Échec'} | Backend: ${response.success ? 'OK' : 'Erreur'}`
    });
    
    return { mqttSuccess, backendSuccess: response.success };
  }, [publishIrrigationCommand, autoStopTimer]);

  // NETTOYAGE au démontage du composant
  useEffect(() => {
    return () => {
      if (autoStopTimer) {
        clearTimeout(autoStopTimer);
      }
    };
  }, [autoStopTimer]);

  const generateMLRecommendation = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLastMLCommand('Génération recommandation ML via Backend simulé...');

    try {
      console.log('🟢 [DEMO] Génération recommandation ML simulée');
      const features = mockBackendService.getDefaultSoilClimateFeatures();
      const prediction = await mockBackendService.getMLRecommendation(features);
      
      if (prediction && prediction.status === 'ok') {
        const mockRecommendation: MockMLRecommendation = {
          duree_minutes: prediction.duree_minutes,
          volume_eau_m3: prediction.volume_eau_m3,
          matt: prediction.matt,
          status: prediction.status,
          auto_irrigation: false
        };
        
        setLastMLRecommendation(mockRecommendation);
        setMLInputFeatures(features);
        setLastMLCommand(`ML via Backend simulé: ${Math.floor(prediction.duree_minutes)} min recommandées`);
        
        console.log('🟢 [DEMO] Recommandation ML générée:', mockRecommendation);
        toast.success("Recommandation ML générée via Backend simulé! [DEMO]", {
          description: `Durée: ${Math.floor(prediction.duree_minutes)} minutes (${Math.round(prediction.volume_eau_m3 * 1000)}L)`
        });
      } else {
        throw new Error('Erreur dans la réponse ML simulée');
      }
    } catch (error) {
      console.error('❌ [DEMO] Erreur génération ML:', error);
      setLastMLCommand('Erreur génération ML Backend simulé');
      toast.error("Erreur ML Backend simulé [DEMO]", {
        description: "Impossible de générer la recommandation ML via Backend simulé"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const toggleMLIrrigation = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (isMLActive) {
        // ARRÊT MANUEL D'URGENCE
        console.log('🟢 [DEMO] Arrêt ML manuel demandé');
        await stopMLIrrigation(false);
      } else {
        // DÉMARRER l'irrigation ML DIRECT
        if (!lastMLRecommendation) {
          setLastMLCommand('Générez d\'abord une recommandation ML');
          toast.error("Aucune recommandation ML [DEMO]", {
            description: "Cliquez sur 'Générer Recommandation ML' d'abord"
          });
          return;
        }

        console.log('🟢 [DEMO] Démarrage irrigation ML simulée');
        setLastMLCommand('Démarrage ML direct via MQTT simulé...');
        
        // ENVOI DIRECT de la commande MQTT simulée
        const mqttSuccess = await publishIrrigationCommand(1);
        
        if (mqttSuccess) {
          setIsMLActive(true);
          setStartTime(new Date());
          
          // PROGRAMMATION ARRÊT AUTOMATIQUE après durée ML
          const durationMs = lastMLRecommendation.duree_minutes * 60 * 1000;
          const timer = setTimeout(async () => {
            console.log('🟢 [DEMO] Timer ML écoulé - arrêt automatique');
            await stopMLIrrigation(true); // Arrêt automatique
          }, durationMs);
          setAutoStopTimer(timer);
          
          const endTime = new Date(Date.now() + durationMs);
          setLastMLCommand(`✅ ML DÉMARRÉ: ${Math.floor(lastMLRecommendation.duree_minutes)} min - Arrêt auto programmé`);
          
          console.log('🟢 [DEMO] Irrigation ML démarrée avec succès');
          toast.success("Irrigation ML démarrée [DEMO]", {
            description: `✅ ${Math.floor(lastMLRecommendation.duree_minutes)} min | Arrêt auto: ${endTime.toLocaleTimeString()}`
          });
        } else {
          setLastMLCommand('❌ Échec envoi commande MQTT simulé');
          toast.error("Erreur communication MQTT simulé [DEMO]", {
            description: "Impossible d'envoyer la commande au broker simulé"
          });
        }
      }
    } catch (error) {
      console.error('❌ [DEMO] Erreur système ML:', error);
      setLastMLCommand('❌ Erreur système ML + MQTT simulé');
      toast.error("Erreur système ML [DEMO]", {
        description: "Problème de communication avec le broker MQTT simulé"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isMLActive, lastMLRecommendation, publishIrrigationCommand, stopMLIrrigation]);

  // Fonction pour obtenir des métriques simulées en temps réel
  const getMLMetrics = useCallback(() => {
    if (!isMLActive || !startTime) return null;
    
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const totalDuration = lastMLRecommendation ? lastMLRecommendation.duree_minutes * 60 : 0;
    const remaining = Math.max(0, totalDuration - elapsed);
    
    return {
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      progressPercentage: totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0,
      estimatedEndTime: totalDuration > 0 ? new Date(startTime.getTime() + totalDuration * 1000) : null
    };
  }, [isMLActive, startTime, lastMLRecommendation]);

  return {
    // État principal
    lastMLRecommendation,
    isMLActive,
    isLoading,
    lastMLCommand,
    mlInputFeatures,
    startTime,
    
    // Actions
    generateMLRecommendation,
    toggleMLIrrigation,
    stopMLIrrigation,
    
    // Nouvelles fonctions pour la démo
    getMLMetrics,
    
    // État de connexion
    isBackendConnected: true, // Toujours connecté en mode simulé
    isMqttConnected: isConnected
  };
};