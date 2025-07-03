import { useState, useEffect, useCallback } from 'react';
import { backendService } from '@/services/backendService';
import { activeUserService } from '@/services/activeUserService';
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

  // Reset complet de l'état ML lors du changement d'acteur
  useEffect(() => {
    const resetMLState = () => {
      console.log('🔄 RESET COMPLET état ML pour nouvel acteur');
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
      console.log('🤖 Demande recommandation ML via Backend Flask...');
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
      console.error("❌ Erreur recommandation ML Backend Flask:", error);
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
    
    const action = isMLActive ? 'ARRÊT' : 'DÉMARRAGE';
    console.log(`🤖 Action irrigation ML via Backend Flask: ${action}`);

    try {
      // VÉRIFICATION INTELLIGENTE : Distinguer "backend mort" vs "backend avec erreurs"
      const backendStatus = await backendService.testConnection();
      
      if (!backendStatus) {
        // Backend complètement inaccessible - BLOQUER
        setLastMLCommand('Backend Flask complètement inaccessible');
        toast.error("Backend Flask inaccessible", {
          description: "Serveur non disponible - Vérifiez la connexion"
        });
        return;
      }

      if (isMLActive) {
        // ARRÊTER l'irrigation ML
        console.log('📤 Envoi commande ARRÊT ML via Backend Flask...');
        setLastMLCommand('Arrêt ML via Backend Flask...');
        
        const response = await backendService.stopIrrigation();
        
        if (response.success) {
          setIsMLActive(false);
          setMLInputFeatures(null);
          setLastMLCommand('Irrigation ML arrêtée via Backend Flask');
          toast.success("Irrigation ML arrêtée via Backend Flask", {
            description: "Commande STOP ML envoyée via Backend Flask"
          });
        } else {
          setLastMLCommand('Erreur arrêt ML Backend Flask');
          toast.error("Erreur arrêt ML Backend Flask", {
            description: response.message || "Impossible d'arrêter l'irrigation ML"
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

        console.log('🚿 DÉMARRAGE IRRIGATION ML AVEC VALIDATION ADMIN...');
        setLastMLCommand('Démarrage ML avec validation admin...');
        
        // AVERTISSEMENT si backend en mode dégradé (erreurs 500 mais accessible)
        const healthCheck = await backendService.checkBackendHealth();
        if (healthCheck.accessible && !healthCheck.healthy) {
          toast.warning("Backend en mode dégradé", {
            description: `Serveur répond (${healthCheck.status}) mais avec des erreurs - Tentative de démarrage...`
          });
        }
        
        const mlStartResponse = await backendService.startMLIrrigationWithAdminValidation({
          duration_minutes: lastMLRecommendation.duree_minutes,
          volume_m3: lastMLRecommendation.volume_eau_m3
        });
        
        if (mlStartResponse.success && mlStartResponse.admin_validated && mlStartResponse.mqtt_started) {
          setIsMLActive(true);
          setLastMLCommand(`ML VALIDÉ ADMIN actif: ${Math.floor(lastMLRecommendation.duree_minutes)} min`);
          toast.success("Irrigation ML démarrée avec validation admin", {
            description: `✅ Admin a validé: ${Math.floor(lastMLRecommendation.duree_minutes)} min automatique`
          });
        } else {
          setLastMLCommand('Erreur validation admin ML Backend Flask');
          toast.error("Erreur validation admin ML", {
            description: mlStartResponse.message || "Impossible de démarrer l'irrigation ML avec validation admin"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur irrigation ML Backend Flask:', error);
      setLastMLCommand('Erreur ML système Backend Flask');
      toast.error("Erreur système ML Backend Flask", {
        description: "Problème de communication avec le Backend Flask ML"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isMLActive, lastMLRecommendation]);

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