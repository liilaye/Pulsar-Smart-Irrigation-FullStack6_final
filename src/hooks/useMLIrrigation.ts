import { useState, useEffect, useCallback } from 'react';
import { backendService } from '@/services/backendService';
import { activeUserService } from '@/services/activeUserService';
import { useMQTT } from '@/hooks/useMQTT';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
  mqtt_started?: boolean;
  auto_irrigation?: boolean;
}

export const useMLIrrigation = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMLCommand, setLastMLCommand] = useState<string | null>(null);
  const [mlInputFeatures, setMLInputFeatures] = useState<number[] | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [autoStopTimer, setAutoStopTimer] = useState<NodeJS.Timeout | null>(null);
  
  // AJOUT CRITIQUE : Hook MQTT pour communication broker
  const { publishIrrigationCommand } = useMQTT();

  // Reset complet de l'état ML lors du changement d'acteur
  useEffect(() => {
    const resetMLState = () => {
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
    setLastMLCommand(`${reason} - Arrêt via MQTT + Backend...`);
    
    // 1. PRIORITÉ : Commande MQTT OFF au broker (CRITIQUE)
    const mqttSuccess = await publishIrrigationCommand(0);
    
    // 2. CONFIRMER avec Backend Flask
    const response = await backendService.stopIrrigation();
    
    // 3. NETTOYER l'état
    setIsMLActive(false);
    setMLInputFeatures(null);
    setStartTime(null);
    
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
    
    setLastMLCommand(`${reason} terminé - MQTT: ${mqttSuccess ? '✅' : '❌'} Backend: ${response.success ? '✅' : '❌'}`);
    
    toast.success(`Irrigation ML arrêtée (${isAutoStop ? 'Timer' : 'Manuel'})`, {
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
    setLastMLCommand('Génération recommandation ML via Backend Flask...');

    try {
      const features = backendService.getDefaultSoilClimateFeatures();
      const prediction = await backendService.getMLRecommendation(features);
      
      if (prediction && prediction.status === 'ok') {
        setLastMLRecommendation(prediction);
        setMLInputFeatures(features);
        setLastMLCommand(`ML via Backend Flask: ${Math.floor(prediction.duree_minutes)} min recommandées`);
        toast.success("Recommandation ML générée via Backend Flask!", {
          description: `Durée: ${Math.floor(prediction.duree_minutes)} minutes`
        });
      } else {
        throw new Error('Erreur dans la réponse ML');
      }
    } catch (error) {
      setLastMLCommand('Erreur génération ML Backend Flask');
      toast.error("Erreur ML Backend Flask", {
        description: "Impossible de générer la recommandation ML via Backend Flask"
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
        await stopMLIrrigation(false);
      } else {
        // DÉMARRER l'irrigation ML DIRECT
        if (!lastMLRecommendation) {
          setLastMLCommand('Générez d\'abord une recommandation ML');
          toast.error("Aucune recommandation ML", {
            description: "Cliquez sur 'Générer Recommandation ML' d'abord"
          });
          return;
        }

        setLastMLCommand('Démarrage ML direct via MQTT...');
        
        // ENVOI DIRECT de la commande MQTT sans validation admin
        const mqttSuccess = await publishIrrigationCommand(1);
        
        if (mqttSuccess) {
          setIsMLActive(true);
          setStartTime(new Date());
          
          // PROGRAMMATION ARRÊT AUTOMATIQUE après durée ML
          const durationMs = lastMLRecommendation.duree_minutes * 60 * 1000;
          const timer = setTimeout(async () => {
            await stopMLIrrigation(true); // Arrêt automatique
          }, durationMs);
          setAutoStopTimer(timer);
          
          setLastMLCommand(`✅ ML DÉMARRÉ: ${Math.floor(lastMLRecommendation.duree_minutes)} min - Arrêt auto programmé`);
          toast.success("Irrigation ML démarrée", {
            description: `✅ ${Math.floor(lastMLRecommendation.duree_minutes)} min | Arrêt auto: ${new Date(Date.now() + durationMs).toLocaleTimeString()}`
          });
        } else {
          setLastMLCommand('❌ Échec envoi commande MQTT');
          toast.error("Erreur communication MQTT", {
            description: "Impossible d'envoyer la commande au broker"
          });
        }
      }
    } catch (error) {
      setLastMLCommand('❌ Erreur système ML + MQTT');
      toast.error("Erreur système ML", {
        description: "Problème de communication avec le broker MQTT"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isMLActive, lastMLRecommendation, publishIrrigationCommand, stopMLIrrigation]);

  return {
    lastMLRecommendation,
    isMLActive,
    isLoading,
    lastMLCommand,
    mlInputFeatures,
    startTime,
    generateMLRecommendation,
    toggleMLIrrigation,
    stopMLIrrigation // EXPOSER pour usage externe si besoin
  };
};