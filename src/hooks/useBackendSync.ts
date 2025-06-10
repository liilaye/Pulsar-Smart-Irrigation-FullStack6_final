
import { useState, useEffect, useCallback } from 'react';
import { backendService, IrrigationRequest } from '@/services/backendService';
import { useMQTT } from './useMQTT';

export const useBackendSync = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<IrrigationRequest | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const { updateIrrigationFromBackend } = useMQTT();

  // Polling pour vérifier le statut du backend
  const checkBackendStatus = useCallback(async () => {
    try {
      const status = await backendService.getIrrigationStatus();
      if (status) {
        setIsBackendConnected(true);
        
        // Mettre à jour l'état d'irrigation si nécessaire
        if (status.isActive !== undefined) {
          updateIrrigationFromBackend(status.isActive);
        }
        
        // Récupérer la dernière recommandation ML
        if (status.lastMLRecommendation) {
          setLastMLRecommendation(status.lastMLRecommendation);
        }
      } else {
        setIsBackendConnected(false);
      }
    } catch (error) {
      console.error('Erreur de connexion backend:', error);
      setIsBackendConnected(false);
    }
  }, [updateIrrigationFromBackend]);

  // Polling toutes les 10 secondes
  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  return {
    lastMLRecommendation,
    isBackendConnected,
    checkBackendStatus
  };
};
