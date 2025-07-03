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
    };

    const unsubscribe = activeUserService.subscribe((user) => {
      if (user) {
        resetMLState();
      }
    });

    resetMLState();
    return unsubscribe;
  }, []);

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
        // ARRÊTER l'irrigation ML
        setLastMLCommand('Arrêt ML via Backend Flask + MQTT...');
        
        // 1. COMMANDE MQTT DIRECTE AU BROKER (priorité)
        const mqttSuccess = await publishIrrigationCommand(0);
        
        // 2. COMMANDE BACKEND FLASK
        const response = await backendService.stopIrrigation();
        
        if (response.success || mqttSuccess) {
          setIsMLActive(false);
          setMLInputFeatures(null);
          setLastMLCommand(`Irrigation ML arrêtée - MQTT: ${mqttSuccess ? '✅' : '❌'} Backend: ${response.success ? '✅' : '❌'}`);
          toast.success("Irrigation ML arrêtée", {
            description: `Broker: ${mqttSuccess ? 'STOP envoyé' : 'Échec'} | Backend: ${response.success ? 'OK' : 'Erreur'}`
          });
        } else {
          setLastMLCommand('Erreur arrêt ML - Tous les canaux ont échoué');
          toast.error("Erreur arrêt ML", {
            description: "Échec MQTT + Backend - Vérifiez la connexion"
          });
        }
      } else {
        // DÉMARRER l'irrigation ML
        if (!lastMLRecommendation) {
          setLastMLCommand('Aucune recommandation ML disponible');
          toast.error("Aucune recommandation ML", {
            description: "Générez d'abord une recommandation ML"
          });
          return;
        }

        setLastMLCommand('Démarrage ML avec validation admin...');
        
        const mlStartResponse = await backendService.startMLIrrigationWithAdminValidation({
          duration_minutes: lastMLRecommendation.duree_minutes,
          volume_m3: lastMLRecommendation.volume_eau_m3
        });
        
        if (mlStartResponse.success && mlStartResponse.admin_validated && mlStartResponse.mqtt_started) {
          // DOUBLE VALIDATION : Backend + Commande MQTT directe
          const mqttSuccess = await publishIrrigationCommand(1);
          
          setIsMLActive(true);
          setLastMLCommand(`ML VALIDÉ ADMIN actif: ${Math.floor(lastMLRecommendation.duree_minutes)} min - MQTT: ${mqttSuccess ? '✅' : '❌'}`);
          toast.success("Irrigation ML démarrée avec validation admin", {
            description: `✅ Admin validé: ${Math.floor(lastMLRecommendation.duree_minutes)} min | Broker: ${mqttSuccess ? 'Connecté' : 'Problème'}`
          });
        } else {
          setLastMLCommand('Erreur validation admin ML ou problème MQTT');
          toast.error("Erreur démarrage ML", {
            description: mlStartResponse.message || "Validation admin ou communication MQTT échouée"
          });
        }
      }
    } catch (error) {
      setLastMLCommand('Erreur ML système Backend Flask + MQTT');
      toast.error("Erreur système ML", {
        description: "Problème de communication Backend Flask + Broker MQTT"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isMLActive, lastMLRecommendation, publishIrrigationCommand]);

  return {
    lastMLRecommendation,
    isMLActive,
    isLoading,
    lastMLCommand,
    mlInputFeatures,
    generateMLRecommendation,
    toggleMLIrrigation
  };
};